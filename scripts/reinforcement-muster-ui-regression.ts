import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';
import { fortMusterOptions } from '../src/game/chapter2';
import { strongholdMusterOptions } from '../src/game/chapter4';
import { elfThirdRecruitOptions, orcThirdRecruitOptions } from '../src/game/factionChapter2';
import { elfFourthRecruitOptions, orcFourthRecruitOptions } from '../src/game/factionChapter3';
import { elfFifthRecruitOptions, orcFifthRecruitOptions } from '../src/game/factionChapter4';
import { getPreferredFormationSlots } from '../src/game/formation';
import * as presentation from '../src/ui/reinforcementMusterPresentation';
import type { ReinforcementMusterKind } from '../src/ui/reinforcementMusterPresentation';
import * as semantic from '../src/ui/semanticColors';
import { getDecisionFooterLayout } from '../src/ui/decisionPresentation';

// Real TSX + real provider action bodies, isolated from native hosts/storage.
// This verifies interactions and state, not physical Android rendering.
type Element = { type: string | Function; props: Record<string, any> };
let checks = 0;
function check(value: unknown, message: string) { assert.ok(value, message); checks += 1; }
function nodes(tree: any, name: string): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, name));
  if (!tree || typeof tree !== 'object' || !tree.type || !tree.props) return [];
  const type = typeof tree.type === 'string' ? tree.type : tree.type.name;
  return [...(type === name ? [tree] : []), ...nodes(tree.props.children, name), ...nodes(tree.props.footer, name)];
}
function one(tree: any, name: string) {
  const found = nodes(tree, name);
  assert.equal(found.length, 1, 'Expected exactly one ' + name);
  return found[0]!.props;
}
function hasChip(tree: any, label: string) { return nodes(tree, 'SemanticChip').some(node => node.props.label === label); }
function allText(tree: any): string {
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (Array.isArray(tree)) return tree.map(allText).join(' ');
  return tree?.props ? allText(tree.props.children) + ' ' + allText(tree.props.footer) : '';
}
function harness(file: string, name: string, game: any, props: Record<string, any>) {
  let cursor = 0;
  const hooks: any[] = [];
  const jsx = (type: Element['type'], supplied: any, ...children: any[]): Element => ({ type, props: {
    ...(supplied ?? {}), ...(children.length ? { children: children.length === 1 ? children[0] : children } : {})
  } });
  const react: any = {
    __esModule: true, createElement: jsx, Fragment: 'Fragment',
    useState(initial: any) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial;
      return [hooks[index], (next: any) => { hooks[index] = typeof next === 'function' ? next(hooks[index]) : next; }];
    },
    useRef(initial: any) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { current: initial };
      return hooks[index];
    }
  };
  react.default = react;
  const hosts = (names: string[]) => Object.fromEntries(names.map(key => [key, key]));
  const cache = new Map<string, any>();
  function load(path: string): any {
    const filename = resolve(path);
    if (cache.has(filename)) return cache.get(filename);
    const source = readFileSync(filename, 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true
    }, fileName: filename }).outputText;
    const mod = { exports: {} as any };
    const localRequire = (request: string): any => {
      if (request === 'react') return react;
      if (request === 'react-native') return { ...hosts(['View', 'Text']), StyleSheet: { create: (styles: any) => styles } };
      if (request.endsWith('/GameProvider')) return { useGame: () => game };
      if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: { colors: {
        text: '#ffffff', textMuted: '#aaaaaa', human: '#aaaaff', elf: '#55bb99', orc: '#ee9988'
      } } }) };
      if (request.endsWith('/DecisionUI')) return hosts(['DecisionLayout', 'DecisionIntro', 'DecisionCommit', 'DecisionOption', 'DecisionStats']);
      if (request.endsWith('/components')) return hosts(['GameCard', 'SecondaryButton']);
      if (request.endsWith('/SemanticUI')) return hosts(['SemanticChip', 'SemanticText', 'UnitBadges']);
      if (request.endsWith('/gameArt')) return hosts(['ClassLoadoutPreview', 'UnitSprite', 'FactionCrest']);
      if (request.endsWith('/semanticColors')) return semantic;
      if (request.endsWith('/reinforcementMusterPresentation')) return presentation;
      if (request === './ReinforcementMusterScreen') return load(resolve(dirname(filename), request + '.tsx'));
      throw new Error('Unexpected muster dependency: ' + request);
    };
    new Function('require', 'module', 'exports', js)(localRequire, mod, mod.exports);
    cache.set(filename, mod.exports);
    return mod.exports;
  }
  const screen = load(file)[name];
  return { render() {
    cursor = 0;
    let tree = screen(props);
    if (typeof tree?.type === 'function' && tree.type.name === 'ReinforcementMusterScreen') tree = tree.type(tree.props);
    return tree;
  } };
}

const providerSource = readFileSync('src/game/GameProvider.tsx', 'utf8');
const providerAst = ts.createSourceFile('GameProvider.tsx', providerSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const providerInitializers = new Map<string, string>();
function visit(node: ts.Node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
    providerInitializers.set(node.name.text, node.initializer.getText(providerAst));
  }
  ts.forEachChild(node, visit);
}
visit(providerAst);
function runProviderAction(name: string, scope: Record<string, any>, id: string) {
  const initializer = providerInitializers.get(name);
  assert.ok(initializer, 'Missing current provider action: ' + name);
  const js = ts.transpileModule('module.exports = ' + initializer + ';', { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022
  } }).outputText;
  const module = { exports: null as any };
  new Function('module', ...Object.keys(scope), js)(module, ...Object.values(scope));
  return module.exports(id);
}
const cases: Array<{ kind: ReinforcementMusterKind; faction: 'human' | 'elf' | 'orc'; chapter: number; capacity: number; file: string; action: string; options: readonly any[] }> = [
  { kind: 'fort', faction: 'human', chapter: 2, capacity: 3, file: 'FortMusterScreen', action: 'chooseFortRecruit', options: fortMusterOptions },
  { kind: 'stronghold', faction: 'human', chapter: 4, capacity: 6, file: 'StrongholdMusterScreen', action: 'chooseStrongholdRecruit', options: strongholdMusterOptions },
  { kind: 'faction_third', faction: 'elf', chapter: 2, capacity: 3, file: 'FactionRecruitmentScreen', action: 'chooseRecruit', options: elfThirdRecruitOptions },
  { kind: 'faction_third', faction: 'orc', chapter: 2, capacity: 3, file: 'FactionRecruitmentScreen', action: 'chooseRecruit', options: orcThirdRecruitOptions },
  { kind: 'faction_fourth', faction: 'elf', chapter: 3, capacity: 4, file: 'FactionFourthRecruitmentScreen', action: 'chooseFactionFourthRecruit', options: elfFourthRecruitOptions },
  { kind: 'faction_fourth', faction: 'orc', chapter: 3, capacity: 4, file: 'FactionFourthRecruitmentScreen', action: 'chooseFactionFourthRecruit', options: orcFourthRecruitOptions },
  { kind: 'faction_fifth', faction: 'elf', chapter: 4, capacity: 5, file: 'FactionFifthRecruitmentScreen', action: 'chooseFactionFifthRecruit', options: elfFifthRecruitOptions },
  { kind: 'faction_fifth', faction: 'orc', chapter: 4, capacity: 5, file: 'FactionFifthRecruitmentScreen', action: 'chooseFactionFifthRecruit', options: orcFifthRecruitOptions }
];
function fixture(test: typeof cases[number], full = false) {
  let calls = 0;
  let returns = 0;
  let failure: 'reject' | 'throw' | null = null;
  const prefix = test.faction === 'human' ? 'ch' + test.chapter : test.faction + test.chapter;
  const count = test.capacity - (full ? 0 : 1);
  const game: any = {
    activeFaction: test.faction, chapterNumber: test.chapter, activeSquadCap: test.capacity,
    chapterNodes: Array.from({ length: 6 }, (_, index) => ({ id: prefix + '_node_' + (index + 1), name: 'Node ' + index, type: index ? 'battle' : 'event', current: index === 0, completed: false })),
    units: Array.from({ length: count }, (_, index) => ({ id: 'existing_' + index, name: 'Existing ' + index, className: 'Guard', faction: test.faction, role: 'frontline', tier: 2, level: 4, hp: 100, attack: 15, armor: 10, speed: 7 })),
    formation: Array.from({ length: 9 }, (_, index) => index < count ? 'existing_' + index : null),
    formationShapeId: 'balanced_333',
    recruitOptions: test.kind === 'faction_third' ? test.options : [], fortMusterOptions,
    strongholdMusterOptions, factionFourthRecruitOptions: test.kind === 'faction_fourth' ? test.options : [],
    factionFifthRecruitOptions: test.kind === 'faction_fifth' ? test.options : [],
    recruitChoiceAvailable: true, recruitChosen: false, fourthRecruitChoiceAvailable: true,
    fourthRecruitChosen: false, sixthRecruitChosen: false, factionFifthRecruitChosen: false,
    resources: { gold: 100, wood: 50, stone: 20, iron: 15, provisions: 9 },
    armyReadiness: 57, equipmentInventory: ['existing_equipment'], unitEquipment: {},
    buildingLevels: { hall: 3 }, wagonStageId: 'fort',
    tutorialSeen: ['first-squad'], tacticalGuidance: 'off'
  };
  const setter = (key: string) => (next: any) => { game[key] = typeof next === 'function' ? next(game[key]) : next; };
  game[test.action] = (id: string) => {
    calls += 1;
    if (failure === 'throw') throw new Error('Controlled rejected action');
    if (failure === 'reject') return false;
    const ok = runProviderAction(test.action, {
      ...game, getPreferredFormationSlots,
      setUnits: setter('units'), setFormation: setter('formation'), setChapterNodes: setter('chapterNodes'),
      setRecruitChosen: setter('recruitChosen'), setRecruitChoiceAvailable: setter('recruitChoiceAvailable'),
      setFourthRecruitChosen: setter('fourthRecruitChosen'), setFourthRecruitChoiceAvailable: setter('fourthRecruitChoiceAvailable')
    }, id);
    // These provider-facing booleans are derived from the recorded recruitment/roster.
    if (ok && test.kind === 'stronghold') game.sixthRecruitChosen = true;
    if (ok && test.kind === 'faction_fifth') game.factionFifthRecruitChosen = true;
    return ok;
  };
  const props = { kind: test.kind, onComplete: () => { returns += 1; } };
  const makeHarness = () => harness('src/screens/' + test.file + '.tsx', test.file, game, props);
  return { game, props, makeHarness, counts: () => ({ calls, returns }), fail: (value: typeof failure) => { failure = value; } };
}
function unchangedState(game: any) {
  return JSON.stringify({ resources: game.resources, equipmentInventory: game.equipmentInventory,
    unitEquipment: game.unitEquipment, armyReadiness: game.armyReadiness, activeSquadCap: game.activeSquadCap,
    wagonStageId: game.wagonStageId, buildingLevels: game.buildingLevels, tutorialSeen: game.tutorialSeen, guidance: game.tacticalGuidance });
}

function testMatrix() {
  for (const test of cases) for (const option of test.options) for (const full of [false, true]) {
    const f = fixture(test, full);
    const h = f.makeHarness();
    const unchanged = unchangedState(f.game);
    const previousUnits = structuredClone(f.game.units);
    const previousFormation = [...f.game.formation];
    let tree = h.render();
    check(nodes(tree, 'DecisionOption').length === test.options.length, 'All authored choices must remain available to compare.');
    check(f.counts().calls === 0, 'Opening a muster must not recruit.');
    const selectedCard = nodes(tree, 'DecisionOption').find(node => node.props.title === option.unit.className)!;
    selectedCard.props.onSelect();
    tree = h.render();
    check(f.counts().calls === 0 && JSON.stringify(f.game.units) === JSON.stringify(previousUnits), 'Selection is a draft, not an action.');
    const card = nodes(tree, 'DecisionOption').find(node => node.props.selected)!;
    check(card.props.title === option.unit.className, 'Confirmation selection must match the tapped class.');
    check(card.props.titleTone === semantic.rolePresentation[option.unit.role].tone, 'Class name must keep its actual role color.');
    const badges = one(card, 'UnitBadges');
    check(badges.role === option.unit.role && badges.tier === option.unit.tier, 'Roles and tiers must use authored data.');
    const stats = one(card, 'DecisionStats');
    check(stats.presentation === 'absolute', 'Ordinary recruitment stats must not masquerade as gains.');
    assert.deepEqual(stats.items.map((item: any) => item.value), [option.unit.level, option.unit.hp, option.unit.attack, option.unit.armor, option.unit.speed]);
    check(one(tree, 'DecisionCommit').label === 'Recruit ' + option.unit.className, 'One confirmation must identify the selected squad.');
    const confirm = one(tree, 'DecisionCommit').onConfirm;
    confirm(); confirm();
    check(f.counts().calls === 1, 'A repeated stale tap must call the provider once.');
    check(f.game.units.length === previousUnits.length + 1 && f.game.units.at(-1).id === option.unit.id, 'Exact provider recruitment must add the selected authored squad.');
    check(unchangedState(f.game) === unchanged, 'Recruitment must not spend resources, heal, equip, expand capacity or alter guidance/tutorial state.');
    check(f.game.chapterNodes[0].completed && f.game.chapterNodes[1].current, 'The original provider must advance the correct muster node.');
    const target = getPreferredFormationSlots('balanced_333', option.unit.role).find(slot => previousFormation[slot] === null);
    const expectedFormation = [...previousFormation];
    if (!full && target !== undefined) expectedFormation[target] = option.unit.id;
    assert.deepEqual(f.game.formation, expectedFormation, 'The UI must not add formation behavior beyond the existing provider.');
    tree = h.render();
    check(nodes(tree, 'DecisionOption').length === 0, 'Recorded recruitment must replace the alternatives with a report.');
    check(nodes(tree, 'DecisionStats').length === 0, 'Recorded reports must not present original numbers as current stats.');
    const fielded = f.game.formation.includes(option.unit.id);
    check(hasChip(tree, fielded ? 'Fielded' : 'In reserve'), 'Deployment status must reflect the actual resulting formation.');
    check(f.counts().returns === 0, 'Recruitment must not auto-navigate before the player reads the result.');
    one(tree, 'DecisionCommit').onConfirm();
    check(f.counts().returns === 1, 'Continue must preserve the original route callback.');
    const current = f.game.units.find((unit: any) => unit.id === option.unit.id);
    current.className = 'Veteran ' + current.className;
    current.attack += 50;
    tree = f.makeHarness().render();
    check(allText(tree).includes(current.className), 'Reopened report must identify a promoted roster unit by ID, not the original class name.');
    check(nodes(tree, 'DecisionStats').length === 0 && nodes(tree, 'DecisionOption').length === 0, 'Reopening must not offer replacement recruitment or stale stat totals.');
  }
}

function testGuards() {
  for (const test of cases) {
    for (const mode of ['reject', 'throw'] as const) {
      const f = fixture(test); const h = f.makeHarness();
      f.fail(mode);
      one(h.render(), 'DecisionCommit').onConfirm();
      let tree = h.render();
      check(Boolean(one(tree, 'DecisionCommit').message) && nodes(tree, 'DecisionOption').length > 0, 'Failed recruitment needs feedback without false success.');
      f.fail(null);
      one(tree, 'DecisionCommit').onConfirm();
      check(f.counts().calls === 2 && nodes(h.render(), 'DecisionOption').length === 0, 'A failed action must remain retryable.');
    }
    for (const changed of ['chapter', 'current', 'faction', 'availability'] as const) {
      const f = fixture(test); const h = f.makeHarness();
      const stale = one(h.render(), 'DecisionCommit').onConfirm;
      if (changed === 'chapter') f.game.chapterNumber += 1;
      if (changed === 'current') f.game.chapterNodes[0].current = false;
      if (changed === 'faction') f.game.activeFaction = test.faction === 'human' ? 'elf' : 'human';
      if (changed === 'availability') {
        f.game.recruitChoiceAvailable = false; f.game.fourthRecruitChoiceAvailable = false;
        if (test.kind === 'stronghold' || test.kind === 'faction_fifth') f.game.chapterNodes[0].current = false;
      }
      const tree = h.render();
      stale();
      one(tree, 'DecisionCommit').onConfirm();
      check(f.counts().calls === 0, 'Locked or stale context cannot recruit: ' + changed + ' / ' + test.kind);
    }
    const f = fixture(test); const h = f.makeHarness();
    let tree = h.render(); const stale = one(tree, 'DecisionCommit').onConfirm;
    if (test.options.length > 1) {
      nodes(tree, 'DecisionOption')[1]!.props.onSelect(); tree = h.render(); stale();
      check(f.counts().calls === 0, 'Old confirmation must not recruit the previously selected class.');
    }
    nodes(tree, 'SecondaryButton').find(node => node.props.label === 'Return without recruiting')!.props.onPress();
    check(f.counts().calls === 0 && f.counts().returns === 1, 'Leaving a preview must not recruit.');

    for (const amount of [0, 2]) {
      const recorded = fixture(test);
      recorded.game.chapterNodes[0].completed = true;
      recorded.game.chapterNodes[0].current = false;
      recorded.game.units.push(...test.options.slice(0, amount).map(option => ({ ...option.unit })));
      const report = recorded.makeHarness().render();
      check(nodes(report, 'DecisionOption').length === 0 && nodes(report, 'UnitBadges').length === 0, 'Missing/ambiguous history must not guess a chosen squad.');
      one(report, 'DecisionCommit').onConfirm();
      check(recorded.counts().calls === 0, 'Recorded history must not grant a replacement squad.');
    }
    const conflict = fixture(test);
    conflict.game.units.push({ ...test.options[0]!.unit });
    const conflicted = conflict.makeHarness().render();
    check(one(conflicted, 'DecisionCommit').disabled && Boolean(one(conflicted, 'DecisionCommit').warning), 'Existing roster with an unrecorded event must be read-only, not duplicated.');
    one(conflicted, 'DecisionCommit').onConfirm();
    check(conflict.counts().calls === 0, 'Conflicting roster history must not duplicate a reinforcement.');
  }
}

function testPresentationContracts() {
  for (const file of new Set(cases.map(test => test.file))) {
    const source = readFileSync('src/screens/' + file + '.tsx', 'utf8');
    check(!source.includes('onTouchEnd') && !source.includes('<ScrollView'), 'Old screen must be replaced, not layered underneath: ' + file);
    check(source.includes('ReinforcementMusterScreen'), 'Every route must use the same modern selection implementation.');
  }
  check(!getDecisionFooterLayout(440, 1).docked && !getDecisionFooterLayout(700, 2).docked, 'Short-screen and large-text fallback must remain available.');
  const source = readFileSync('src/screens/ReinforcementMusterScreen.tsx', 'utf8');
  check(source.includes('DecisionOption') && source.includes('DecisionLayout') && !source.includes('onTouchEnd'), 'Shared accessible selection and responsive layout must be used.');
  check(!source.includes('numberOfLines') && !source.includes('RarityChip'), 'Do not truncate important choices or invent rarity from tier data.');
}

testMatrix();
testGuards();
testPresentationContracts();
console.log('PASS: ' + checks + ' reinforcement muster UI/current-provider checks across eight Human/Elf/Orc contexts. Native Android visual QA remains separate.');
