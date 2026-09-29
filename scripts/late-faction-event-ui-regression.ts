import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as late from '../src/ui/lateFactionEventPresentation';
import * as early from '../src/ui/factionEventPresentation';
import * as effects from '../src/ui/campaignEventPresentation';
import * as semantic from '../src/ui/semanticColors';
import * as chapter4 from '../src/game/factionChapter4';
import * as chapter5 from '../src/game/factionChapter5';
import { getPreferredFormationSlots } from '../src/game/formation';
import { getDecisionFooterLayout } from '../src/ui/decisionPresentation';
import { themes } from '../src/theme/themes';
import type { LateFactionEventRequest } from '../src/ui/lateFactionEventPresentation';

// Actual TSX and extracted current provider functions with isolated native hosts/state.
// This is interaction/model coverage, not native rendering or Android screenshot QA.
let checks = 0;
function check(value: unknown, message: string) { assert.ok(value, message); checks += 1; }
type Element = { type: string | Function; props: Record<string, any> };
function nodes(tree: any, name: string): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, name));
  if (!tree?.type || !tree?.props) return [];
  const typeName = typeof tree.type === 'string' ? tree.type : tree.type.name;
  return [...(typeName === name ? [tree] : []), ...nodes(tree.props.children, name), ...nodes(tree.props.footer, name)];
}
function one(tree: any, name: string) {
  const found = nodes(tree, name);
  assert.equal(found.length, 1, 'Expected one ' + name);
  return found[0]!.props;
}
function harness(file: string, name: string, game: any = {}, props: Record<string, any> = {}) {
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
  const hosts = (names: string[]) => Object.fromEntries(names.map(name => {
    const fn = (values: any) => jsx(name, values);
    Object.defineProperty(fn, 'name', { value: name });
    return [name, fn];
  }));
  const code = ts.transpileModule(readFileSync(file, 'utf8'), { fileName: file, reportDiagnostics: true, compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true
  } });
  assert.equal((code.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} as any };
  const localRequire = (request: string): any => {
    if (request === 'react') return react;
    if (request === 'react-native') return { View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: { create: (value: any) => value } };
    if (request.endsWith('/GameProvider')) return { useGame: () => game };
    if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: themes.original }) };
    if (request.endsWith('/lateFactionEventPresentation')) return late;
    if (request.endsWith('/factionEventPresentation')) return early;
    if (request.endsWith('/campaignEventPresentation')) return effects;
    if (request.endsWith('/semanticColors')) return semantic;
    if (request.endsWith('/DecisionUI')) return hosts(['DecisionCommit', 'DecisionIntro', 'DecisionLayout', 'DecisionOption', 'DecisionStats']);
    if (request.endsWith('/CampaignEventUI')) return hosts(['EventResolution', 'EventRewardPanel', 'EventIllustration']);
    if (request.endsWith('/LateFactionEventScreen')) return hosts(['LateFactionEventScreen']);
    if (request.endsWith('/SemanticUI')) return hosts(['SemanticChip', 'SemanticText', 'UnitBadges']);
    if (request.endsWith('/components')) return hosts(['GameCard', 'SecondaryButton']);
    if (request.endsWith('/gameArt')) return hosts(['FactionCrest', 'CampaignNodeSprite', 'ResourceSiteSprite', 'StoryScene', 'UnitSprite']);
    throw new Error('Unexpected late-event dependency: ' + request);
  };
  new Function('require', 'module', 'exports', code.outputText)(localRequire, module, module.exports);
  return { props, game, render() { cursor = 0; return module.exports[name](props); } };
}

const provider = ts.createSourceFile('GameProvider.tsx', readFileSync('src/game/GameProvider.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function providerAction(name: string, scope: Record<string, any>) {
  const found: ts.Expression[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer) found.push(node.initializer);
    ts.forEachChild(node, visit);
  };
  visit(provider);
  assert.equal(found.length, 1, 'Expected one current provider action: ' + name);
  const raw = '(' + found[0]!.getText(provider) + ')';
  const code = ts.transpileModule(raw, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText.trim().replace(/;$/, '');
  return new Function(...Object.keys(scope), 'return ' + code)(...Object.values(scope));
}
const actions = { 4: 'completeFactionChapterFourEvent', 5: 'completeFactionChapterFiveEvent', 6: 'completeFactionChapterSixEvent' } as const;
const screens = { 4: 'FactionChapterFourEventScreen', 5: 'FactionChapterFiveEventScreen', 6: 'FactionChapterSixEventScreen' } as const;
function fixture(faction: 'elf' | 'orc', request: LateFactionEventRequest) {
  const event = late.getLateFactionEvent(faction, request)!;
  const calls: string[] = [];
  const errors: unknown[] = [];
  const game: any = {
    activeFaction: faction, chapterNumber: request.chapter,
    chapterNodes: [
      { id: event.nodeId, current: true, completed: false, name: event.title, type: 'event' },
      { id: event.nodeId.replace(/_(\d+)$/, (_, n: string) => '_' + (Number(n) + 1)), current: false, completed: false, name: 'Next', type: 'battle' }
    ],
    resources: { gold: 100, wood: 100, stone: 100, iron: 100, provisions: 100 },
    unlockedResourceSites: [], productionStock: { gold: 0, wood: 0, stone: 0, iron: 0, provisions: 0 },
    sharedProgress: { lore: [], completedCampaigns: ['human'], metaCampaignStep: 0, metaCampaignComplete: false },
    units: [], formation: Array.from({ length: 9 }, () => null), activeSquadCap: 6, formationShapeId: 'balanced_333',
    armyReadiness: 61, buildingLevels: { existing: 3 }, buildingPlacements: {}, unitEquipment: {}, equipmentInventory: [],
    currentWagonStage: { id: 'capital' }, gems: 12,
    elfChapterFiveReinforcement: chapter4.elfChapterFiveReinforcement,
    orcChapterFiveReinforcement: chapter4.orcChapterFiveReinforcement,
    getPreferredFormationSlots
  };
  Object.defineProperty(game, 'completedCampaigns', { enumerable: true, get: () => game.sharedProgress.completedCampaigns });
  for (const [setter, field] of Object.entries({
    setResources: 'resources', setChapterNodes: 'chapterNodes', setUnlockedResourceSites: 'unlockedResourceSites',
    setSharedProgress: 'sharedProgress', setUnits: 'units', setFormation: 'formation'
  })) game[setter] = (value: any) => { game[field] = typeof value === 'function' ? value(game[field]) : value; };
  for (const action of Object.values(actions)) game[action] = (...args: any[]) => {
    calls.push(action);
    try { return providerAction(action, game)(...args); } catch (error) { errors.push(error); throw error; }
  };
  return { game, calls, errors, event };
}
function protectedState(game: any) {
  return JSON.stringify([game.armyReadiness, game.productionStock, game.buildingLevels, game.buildingPlacements,
    game.unitEquipment, game.equipmentInventory, game.activeSquadCap, game.currentWagonStage, game.gems, game.completedCampaigns]);
}
function screenFor(game: any, request: LateFactionEventRequest, onComplete = () => {}) {
  const name = screens[request.chapter];
  const wrapper = harness('src/screens/' + name + '.tsx', name, game, { stage: request.stage, onComplete });
  const props = one(wrapper.render(), 'LateFactionEventScreen');
  assert.deepEqual(props.request, request, 'Entry-screen stage contract must remain unchanged.');
  return harness('src/screens/LateFactionEventScreen.tsx', 'LateFactionEventScreen', game, { ...props });
}

function testMatrix() {
  const allSites = [...chapter4.factionChapterFourResourceSites, ...chapter5.factionChapterFiveResourceSites];
  for (const faction of ['elf', 'orc'] as const) for (const request of late.lateFactionEventRequests) {
    const { game, calls, errors, event } = fixture(faction, request);
    let continued = 0;
    const screen = screenFor(game, request, () => { continued += 1; });
    let tree = screen.render();
    const props = one(tree, 'EventResolution');
    check(props.canResolve && !props.completed && props.key === event.nodeId, event.title + ': current event must be a keyed, unclaimed preview.');
    check(one(tree, 'DecisionIntro').title === event.title, 'The authored event title must remain visible.');
    check(one(tree, 'FactionCrest').faction === faction, 'Event art must preserve its faction.');
    check(nodes(tree, 'SemanticChip').some(node => node.props.label === event.purpose.label && node.props.tone === event.purpose.tone), 'Purpose needs both a label and semantic color.');
    const panels = nodes(tree, 'EventRewardPanel').map(node => node.props);
    const grant = panels.find(panel => panel.kind === 'immediate');
    check(Boolean(grant) === (Object.keys(event.resources).length > 0), 'Evidence-only events must not invent immediate reward panels.');
    if (grant) check(!grant.completed, 'Unclaimed resources must remain previews.');
    if (event.site) {
      const panel = panels.find(panel => panel.kind === 'production')!;
      assert.deepEqual(panel.values, allSites.find(site => site.id === event.site!.id)!.productionPerActivity);
      check(!panel.completed && panel.note.includes('Not an immediate payout'), 'Recurring output must not look like another immediate grant.');
    }
    if (event.reinforcement) {
      const badges = one(tree, 'UnitBadges');
      check(badges.role === event.reinforcement.role && badges.tier === event.reinforcement.tier, 'Reinforcement roles and tiers must come from the actual template.');
      const values = one(tree, 'DecisionStats').items;
      check(values.find((item: any) => item.label === 'Attack').value === event.reinforcement.attack, 'Baseline recruitment stats must not be invented bonuses.');
      check(values.every((item: any) => item.tone === undefined), 'Ordinary unit stats must not all look like positive deltas.');
    }
    check(calls.length === 0, 'Opening a screen must not resolve the event.');
    const before = { ...game.resources };
    const beforeProtected = protectedState(game);
    const resolver = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...props });
    const confirm = one(resolver.render(), 'DecisionCommit').onConfirm;
    confirm(); confirm();
    assert.deepEqual(errors, [], 'Provider fixture is incomplete for ' + event.title);
    check(calls.length === 1 && calls[0] === actions[request.chapter], 'Repeated taps must call the correct current provider exactly once.');
    check(game.chapterNodes[0].completed && !game.chapterNodes[0].current && game.chapterNodes[1].current, 'Existing campaign advancement must remain intact.');
    for (const key of Object.keys(before)) check(game.resources[key] - before[key] === ((grant?.values as any)?.[key] ?? 0), 'Displayed grant must equal the real provider delta: ' + event.title + '/' + key);
    check(protectedState(game) === beforeProtected, 'Events must not change Readiness, gear, production stock, construction, capacity, Gems or campaign completion.');
    assert.deepEqual(game.sharedProgress.lore, event.lore ? [event.lore.id] : [], 'Evidence must match exactly the current action lore key.');
    assert.deepEqual(game.unlockedResourceSites, event.site ? [event.site.id] : [], 'Only the advertised site should unlock.');
    if (event.reinforcement) {
      check(game.units.length === 1 && game.units[0].id === event.reinforcement.id, 'Muster must grant the actual reinforcement exactly once.');
      check(game.formation.filter(Boolean).length === 1, 'Existing eligible placement must still occur.');
    } else check(game.units.length === 0 && game.formation.every((id: any) => id === null), 'Non-muster events must not create or move squads.');
    tree = screen.render();
    check(one(tree, 'EventResolution').completed, 'Completed reports must be recorded, not still claimable previews.');
    if (event.lore) check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Evidence recorded'), 'Completed lore must be distinguished from a preview.');
    if (event.reinforcement) check(nodes(tree, 'DecisionStats').length === 0, 'Recorded reinforcement must not misrepresent original stats as current equipped stats.');
    if (event.stage === 'seal') check(nodes(tree, 'SemanticChip').some(node => node.props.tone === 'warning' && node.props.label.includes('not recovered')), 'Seal-location events must not mark the Seal recovered.');
    Object.assign(resolver.props, one(tree, 'EventResolution'));
    one(resolver.render(), 'DecisionCommit').onConfirm();
    check(continued === 1 && calls.length === 1, 'Continue must navigate, never repeat a grant.');
    const snapshot = JSON.stringify([game.resources, game.units, game.sharedProgress]);
    const reopened = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...one(screenFor(game, request).render(), 'EventResolution') });
    one(reopened.render(), 'DecisionCommit').onConfirm();
    check(calls.length === 1 && JSON.stringify([game.resources, game.units, game.sharedProgress]) === snapshot, 'Reopening a completed event must remain non-farmable.');
  }
}

function testGatesAndRetry() {
  for (const request of late.lateFactionEventRequests) {
    const { game, calls } = fixture('elf', request);
    const screen = screenFor(game, request);
    game.chapterNumber = 1;
    let props = one(screen.render(), 'EventResolution');
    check(!props.canResolve && !props.onResolve() && calls.length === 0, 'Wrong-chapter routes must not resolve.');
    game.chapterNumber = request.chapter;
    game.chapterNodes[0].current = false;
    props = one(screen.render(), 'EventResolution');
    check(!props.canResolve && !props.onResolve() && calls.length === 0, 'Future events must remain preview-only.');
    game.chapterNodes[0].current = true;
    game.chapterNodes[0].completed = true;
    props = one(screen.render(), 'EventResolution');
    check(props.completed && !props.canResolve && !props.onResolve(), 'A completed flag must win over a stale current flag.');
    game.activeFaction = 'human';
    check(nodes(screen.render(), 'EventResolution').length === 0 && nodes(screen.render(), 'SecondaryButton').length === 1, 'Human routes need a safe exit, not Orc rewards.');
    game.activeFaction = 'orc';
    props = one(screen.render(), 'EventResolution');
    check(!props.canResolve && props.key.startsWith('orc'), 'Switching factions must reset event identity without resolving foreign nodes.');
  }
  const { game, calls } = fixture('elf', { chapter: 5, stage: 'resource' });
  const screen = screenFor(game, { chapter: 5, stage: 'resource' });
  const props = one(screen.render(), 'EventResolution');
  const realResolve = props.onResolve;
  let permit = false;
  const resolver = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, {
    ...props, onResolve: () => permit ? realResolve() : false
  });
  one(resolver.render(), 'DecisionCommit').onConfirm();
  check(calls.length === 0 && one(resolver.render(), 'DecisionCommit').message.includes('could not'), 'A rejected resolution must have honest feedback.');
  permit = true;
  one(resolver.render(), 'DecisionCommit').onConfirm();
  check(calls.length === 1 && game.chapterNodes[0].completed, 'Rejected events must remain retryable.');
  const firstKey = one(screen.render(), 'EventResolution').key;
  screen.props.request = { chapter: 5, stage: 'seal' };
  check(one(screen.render(), 'EventResolution').key !== firstKey, 'Changing stages must remount the completion guard.');
}

function testReinforcementStates() {
  for (const faction of ['elf', 'orc'] as const) {
    const { game, calls, event } = fixture(faction, { chapter: 5, stage: 'muster' });
    game.units = Array.from({ length: 6 }, (_, index) => ({ ...event.reinforcement, id: 'existing_' + index }));
    game.formation = [...game.units.map((unit: any) => unit.id), null, null, null];
    const beforeFormation = JSON.stringify(game.formation);
    const screen = screenFor(game, { chapter: 5, stage: 'muster' });
    const resolver = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...one(screen.render(), 'EventResolution') });
    one(resolver.render(), 'DecisionCommit').onConfirm();
    check(game.units.length === 7 && JSON.stringify(game.formation) === beforeFormation, 'Full fields must retain the existing reserve behavior rather than replace an active squad.');
    check(nodes(screen.render(), 'SemanticChip').some(node => node.props.label === 'In reserve'), 'Reserve reinforcement status must not falsely say fielded.');
    check(calls.length === 1, 'Reserve acceptance must still resolve once.');

    const existing = fixture(faction, { chapter: 5, stage: 'muster' });
    existing.game.units = [{ ...existing.event.reinforcement, attack: 99 }];
    const existingScreen = screenFor(existing.game, { chapter: 5, stage: 'muster' });
    check(nodes(existingScreen.render(), 'DecisionStats').length === 0, 'An already-owned squad must not be displayed with stale baseline stats.');
    one(existingScreen.render(), 'EventResolution').onResolve();
    check(existing.game.units.length === 1 && existing.game.units[0].attack === 99, 'Existing reinforcement must not duplicate or overwrite an upgraded squad.');
  }
}

function testSealAndPresentation() {
  for (const faction of ['elf', 'orc'] as const) for (const chapter of [5, 6] as const) {
    const foreign = faction === 'elf' ? 'orc' : 'elf';
    const preview = late.getSealReportStatus(faction, chapter, false, ['human', foreign]);
    const recorded = late.getSealReportStatus(faction, chapter, true, ['human', foreign]);
    const recovered = late.getSealReportStatus(faction, chapter, true, ['human', faction]);
    check(preview.tone === 'blue' && preview.label.includes('not recovered'), 'A foreign campaign completion must not recover this Seal.');
    check(recorded.tone === 'warning' && recorded.label.includes(chapter === 5 ? 'Trail' : 'Chamber'), 'Recorded pursuit is still not Seal recovery.');
    check(recovered.tone === 'positive' && recovered.label.endsWith('recovered'), 'Actual faction completion may show the recovered Seal.');
    const { game } = fixture(faction, { chapter, stage: 'seal' });
    game.chapterNodes[0].completed = true;
    const screen = screenFor(game, { chapter, stage: 'seal' });
    check(nodes(screen.render(), 'SemanticChip').some(node => node.props.tone === 'warning'), 'A completed seal event must still show the pending objective.');
    game.sharedProgress.completedCampaigns = ['human', faction];
    check(nodes(screen.render(), 'SemanticChip').some(node => node.props.label === recovered.label && node.props.tone === 'positive'), 'Seal badge must follow actual campaign completion.');
  }
  for (const faction of ['elf', 'orc'] as const) {
    const h = screenFor(fixture(faction, { chapter: 6, stage: 'concord' }).game, { chapter: 6, stage: 'concord' });
    check(nodes(h.render(), 'EventIllustration').length === 1 && one(h.render(), 'StoryScene').faction === faction, 'Crownspire art must stay available through the existing disclosure.');
  }
  check(late.getLateFactionEvent('human', { chapter: 4, stage: 'resource' }) === null, 'Unsupported factions must not fall through to Orc data.');
  check(late.getLateFactionEvent('elf', { chapter: 4, stage: 'seal' } as never) === null, 'Invalid chapter/stage combinations must not manufacture an event.');
  check(!getDecisionFooterLayout(440, 1).docked && !getDecisionFooterLayout(680, 2).docked, 'Short screens and large text must keep the inherited ordinary scroll fallback.');
  for (const file of [...Object.values(screens), 'LateFactionEventScreen']) {
    const source = readFileSync('src/screens/' + file + '.tsx', 'utf8');
    check(!source.includes('onTouchEnd') && !source.includes('RECOMMENDED') && !source.includes('setTacticalGuidance'), 'Event presentation must not introduce touch-release selection or tactical coaching.');
  }
}

testMatrix();
testGatesAndRetry();
testReinforcementStates();
testSealAndPresentation();
console.log('PASS: ' + checks + ' late-faction event, real-provider and TSX interaction/model checks across 14 variants. Native visual QA remains separate.');
