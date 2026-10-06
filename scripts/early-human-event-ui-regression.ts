import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as presentation from '../src/ui/earlyHumanEventPresentation';
import * as semantic from '../src/ui/semanticColors';
import { humanResourceSites } from '../src/game/chapter2';
import { themes } from '../src/theme/themes';
import { getDecisionFooterLayout } from '../src/ui/decisionPresentation';
import type { EarlyHumanEventId } from '../src/ui/earlyHumanEventPresentation';

// Real TSX and current provider action bodies; isolated native hosts, not device rendering.
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
function labels(tree: any): string[] { return nodes(tree, 'SemanticChip').map(node => node.props.label); }
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
  const hosts = (names: string[]) => Object.fromEntries(names.map(name => {
    const component = (values: any) => jsx(name, values);
    Object.defineProperty(component, 'name', { value: name });
    return [name, component];
  }));
  const code = ts.transpileModule(readFileSync(file, 'utf8'), { fileName: file, reportDiagnostics: true, compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true
  } });
  assert.equal((code.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} as any };
  const localRequire = (request: string): any => {
    if (request === 'react') return react;
    if (request === 'react-native') return { View: 'View', Text: 'Text', StyleSheet: { create: (value: any) => value, hairlineWidth: 1 } };
    if (request.endsWith('/GameProvider')) return { useGame: () => game };
    if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: game.testTheme ?? themes.original }) };
    if (request.endsWith('/earlyHumanEventPresentation')) return presentation;
    if (request.endsWith('/semanticColors')) return semantic;
    if (request.endsWith('/DecisionUI')) return hosts(['DecisionCommit', 'DecisionIntro', 'DecisionLayout']);
    if (request.endsWith('/CampaignEventUI')) return hosts(['EventIllustration', 'EventRewardPanel']);
    if (request.endsWith('/EarlyHumanEventScreen')) return hosts(['EarlyHumanEventScreen']);
    if (request.endsWith('/SemanticUI')) return hosts(['SemanticChip']);
    if (request.endsWith('/components')) return hosts(['GameCard', 'SecondaryButton']);
    if (request.endsWith('/gameArt')) return hosts(['BuildingSprite', 'EquipmentSprite', 'ResourceSiteSprite', 'StoryScene']);
    throw new Error('Unexpected early Human event dependency: ' + request);
  };
  new Function('require', 'module', 'exports', code.outputText)(localRequire, module, module.exports);
  return { game, props, render() { cursor = 0; return module.exports[name](props); } };
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
  const code = ts.transpileModule('(' + found[0]!.getText(provider) + ')', { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS
  } }).outputText.trim().replace(/;$/, '');
  return new Function(...Object.keys(scope), 'return ' + code)(...Object.values(scope));
}
const cases = [
  ['MarkedRaidersScreen', 'marked_raiders', 'node_3', 'node_4', 'completeMarkedRaiders', { wood: 5, iron: 2 }],
  ['RefugeeCampScreen', 'refugee_camp', 'node_6', 'node_7', 'completeRefugeeCamp', { wood: 45, iron: 8, provisions: 20 }],
  ['TimberClaimScreen', 'timber_claim', 'ch2_node_7', 'ch2_node_8', 'unlockTimberCamp', {}]
] as const;
const screenPath = 'src/screens/EarlyHumanEventScreen.tsx';
function fixture(id: EarlyHumanEventId) {
  const row = cases.find(candidate => candidate[1] === id)!;
  const calls: string[] = [];
  const game: any = {
    activeFaction: 'human', chapterNumber: id === 'timber_claim' ? 2 : 1,
    chapterNodes: [row[2], row[3]].map(nodeId => ({ id: nodeId, current: nodeId === row[2], completed: false })),
    holdTheRoadWon: true, markedRaidersInvestigated: false, forgeUnlocked: false,
    mercenaryPatrolWon: true, commanderPathId: 'existing_commander', refugeeCampSecured: false,
    resources: { gold: 12, wood: 15, stone: 6, iron: 3, provisions: 9 },
    unlockedResourceSites: [], sharedProgress: { lore: [], achievements: [] },
    buildingLevels: { hall: 1 }, buildingPlacements: { center: 'hall' },
    units: [{ id: 'hum_recruit', className: 'Recruit', hp: 100 }], formation: ['hum_recruit', null, null, null, null, null, null, null, null],
    equipmentInventory: ['already_owned'], unitEquipment: {}, armyReadiness: 42,
    activeSquadCap: 3, wagonItems: [{ id: 'medicine' }], expeditionTickets: 1,
    productionStock: { gold: 2, wood: 4, stone: 1, iron: 0, provisions: 3 },
    currentWagonStage: { id: id === 'timber_claim' ? 'fort' : 'camp' }, tutorialSeen: []
  };
  for (const [setter, field] of Object.entries({
    setMarkedRaidersInvestigated: 'markedRaidersInvestigated', setForgeUnlocked: 'forgeUnlocked',
    setRefugeeCampSecured: 'refugeeCampSecured', setResources: 'resources', setChapterNodes: 'chapterNodes',
    setUnlockedResourceSites: 'unlockedResourceSites', setSharedProgress: 'sharedProgress'
  })) game[setter] = (value: any) => { game[field] = typeof value === 'function' ? value(game[field]) : value; };
  for (const entry of cases) game[entry[4]] = () => { calls.push(entry[4]); return providerAction(entry[4], game)(); };
  return { game, calls, row };
}
function protectedState(game: any) {
  return JSON.stringify([
    game.units, game.formation, game.equipmentInventory, game.unitEquipment, game.armyReadiness,
    game.buildingLevels, game.buildingPlacements, game.currentWagonStage, game.wagonItems,
    game.expeditionTickets, game.productionStock, game.activeSquadCap, game.commanderPathId, game.tutorialSeen
  ]);
}
function rewardState(game: any) { return JSON.stringify([game.resources, game.sharedProgress, game.unlockedResourceSites]); }

function testActions() {
  for (const [name, id, nodeId, nextId, actionName, reward] of cases) {
    const { game, calls } = fixture(id);
    let exited = 0;
    let openedKingdom = 0;
    const callback = () => { exited += 1; };
    const wrapper = harness('src/screens/' + name + '.tsx', name, game, {
      onExit: callback, onComplete: callback, onOpenForge: () => { openedKingdom += 1; }
    });
    const props = one(wrapper.render(), 'EarlyHumanEventScreen');
    check(props.eventId === id, 'Old route must reach the correct replacement event.');
    const screen = harness(screenPath, 'EarlyHumanEventScreen', game, props);
    let tree = screen.render();
    check(one(tree, 'DecisionIntro').title === presentation.getEarlyHumanEventView(id, game)!.event.title, 'Original event identity must be preserved.');
    check(labels(tree).includes('Current event · preview'), 'Opening a current event is a preview, not an awarded reward.');
    check(calls.length === 0, 'Rendering must not grant anything.');
    const panels = nodes(tree, 'EventRewardPanel').map(node => node.props);
    const immediate = panels.filter(panel => panel.kind === 'immediate');
    check(immediate.length === (id === 'timber_claim' ? 0 : 1), 'Only actual one-time grants should be shown.');
    if (immediate.length) {
      assert.deepEqual(immediate[0]!.values, reward);
      check(!immediate[0]!.completed && immediate[0]!.detail.includes('not your current balance'), 'Reward preview must distinguish amounts from the wallet.');
    }
    if (id === 'timber_claim') {
      const site = humanResourceSites.find(candidate => candidate.id === 'greenwood_camp')!;
      const panel = one(tree, 'EventRewardPanel');
      assert.deepEqual(panel.values, site.productionPerActivity);
      check(panel.kind === 'production' && panel.note.includes('not an immediate Wood payout') && panel.note.includes('Kingdom'), 'Timber must describe delayed eligible production, not an unconditional payout.');
    }
    const before = { ...game.resources };
    const protectedBefore = protectedState(game);
    nodes(tree, 'SecondaryButton').find(node => node.props.label === 'Return without completing')!.props.onPress();
    check(exited === 1 && calls.length === 0, 'Return from preview must not resolve an event.');
    const resolve = one(tree, 'DecisionCommit').onConfirm;
    resolve(); resolve();
    check(calls.length === 1 && calls[0] === actionName, 'One confirmation must dispatch one correct provider action.');
    for (const key of Object.keys(before)) check(game.resources[key] - before[key] === (reward as Record<string, number>)[key] || game.resources[key] - before[key] === 0 && !(key in reward), 'Displayed reward must match the current provider for ' + id + ' / ' + key);
    check(game.chapterNodes.find((node: any) => node.id === nodeId).completed, 'Event completion must come from the provider.');
    check(game.chapterNodes.find((node: any) => node.id === nextId).current, 'Original next objective must remain unchanged.');
    assert.deepEqual(game.sharedProgress.lore, id === 'marked_raiders' ? ['false_flag_forging'] : []);
    assert.deepEqual(game.unlockedResourceSites, id === 'timber_claim' ? ['greenwood_camp'] : []);
    check(game.forgeUnlocked === (id === 'marked_raiders'), 'Only Marked Raiders should unlock the Forge flag.');
    check(protectedState(game) === protectedBefore, 'Events must not build, equip, resupply, add tickets, grant production stock, or complete tutorials.');
    tree = screen.render();
    check(labels(tree).includes('Event recorded'), 'The result must be a recorded report.');
    const after = rewardState(game);
    resolve();
    check(calls.length === 1 && rewardState(game) === after, 'Stale preview handler must not replay a recorded grant.');
    const reopened = harness(screenPath, 'EarlyHumanEventScreen', game, props).render();
    one(reopened, 'DecisionCommit').onConfirm();
    check(calls.length === 1, 'Reopening cannot call completion again.');
    if (id === 'marked_raiders') {
      check(openedKingdom === 1, 'Recorded Marked Raiders must retain the Kingdom/Forge route.');
      nodes(reopened, 'SecondaryButton').find(node => node.props.label === 'Return to Campaign')!.props.onPress();
    }
    check(exited === 2 && rewardState(game) === after, 'Leaving a recorded report must not change rewards.');
    check(game[actionName]() === false && rewardState(game) === after, 'Current provider must reject direct replay after completion.');
    game.chapterNumber = 6;
    game.chapterNodes = [];
    check(presentation.getEarlyHumanEventView(id, game)!.completed, 'A later chapter must retain an already recorded report.');
  }
}

function testLocksRetryAndStaleHandlers() {
  for (const [, id, , , actionName] of cases) {
    for (const invalid of ['wrong_chapter', 'future', 'node_only', 'elf', 'orc']) {
      const { game, calls } = fixture(id);
      if (invalid === 'wrong_chapter') game.chapterNumber = 6;
      if (invalid === 'future') game.chapterNodes.forEach((node: any) => { node.current = false; });
      if (invalid === 'node_only') game.chapterNodes[0].completed = true;
      if (invalid === 'elf' || invalid === 'orc') game.activeFaction = invalid;
      let exited = 0;
      const tree = harness(screenPath, 'EarlyHumanEventScreen', game, { eventId: id, onExit: () => { exited += 1; } }).render();
      const action = one(tree, 'DecisionCommit');
      check(action.label === 'Return to Campaign', 'Unavailable events must offer a safe exit instead of a claim.');
      action.onConfirm();
      check(exited === 1 && calls.length === 0, 'Invalid routes must never reach a provider mutation.');
      if (invalid === 'elf' || invalid === 'orc') check(nodes(tree, 'EventRewardPanel').length === 0, 'Wrong faction must not expose Human rewards.');
      if (invalid === 'node_only') check(labels(tree).includes('Progress needs review'), 'Missing markers must not permit a duplicate reward.');
    }
    const missing = fixture(id);
    if (id === 'marked_raiders') missing.game.holdTheRoadWon = false;
    if (id === 'refugee_camp') missing.game.commanderPathId = null;
    if (id !== 'timber_claim') check(!presentation.getEarlyHumanEventView(id, missing.game)!.canResolve, 'Battle/commander prerequisites must be checked.');
    if (id === 'refugee_camp') {
      missing.game.commanderPathId = 'existing_commander'; missing.game.mercenaryPatrolWon = false;
      check(!presentation.getEarlyHumanEventView(id, missing.game)!.canResolve, 'A commander alone does not substitute for winning Mercenary Patrol.');
    }
    for (const failure of ['false', 'throw']) {
      const { game, calls } = fixture(id);
      const real = game[actionName];
      let attempts = 0;
      game[actionName] = () => {
        attempts += 1;
        if (attempts === 1) { if (failure === 'throw') throw new Error('test'); return false; }
        return real();
      };
      const screen = harness(screenPath, 'EarlyHumanEventScreen', game, { eventId: id, onExit: () => {} });
      one(screen.render(), 'DecisionCommit').onConfirm();
      const failed = screen.render();
      check(one(failed, 'DecisionCommit').message.includes('not completed') && !one(failed, 'DecisionCommit').disabled, 'Failures need feedback and must remain retryable.');
      check(calls.length === 0, 'Rejected actions must not simulate a grant.');
      one(failed, 'DecisionCommit').onConfirm();
      check(attempts === 2 && calls.length === 1, 'Retry must reach the original action once.');
    }
    for (const change of ['faction', 'chapter', 'event', 'current']) {
      const { game, calls } = fixture(id);
      const props: any = { eventId: id, onExit: () => {} };
      const screen = harness(screenPath, 'EarlyHumanEventScreen', game, props);
      const old = one(screen.render(), 'DecisionCommit').onConfirm;
      if (change === 'faction') game.activeFaction = 'elf';
      if (change === 'chapter') game.chapterNumber += 1;
      if (change === 'event') props.eventId = id === 'marked_raiders' ? 'refugee_camp' : 'marked_raiders';
      if (change === 'current') game.chapterNodes[0].current = false;
      screen.render(); old();
      check(calls.length === 0, 'Stale ' + change + ' handler must not dispatch an old event action.');
    }
    const delayed = fixture(id);
    let accepted = 0;
    delayed.game[actionName] = () => { accepted += 1; return true; };
    const screen = harness(screenPath, 'EarlyHumanEventScreen', delayed.game, { eventId: id, onExit: () => {} });
    one(screen.render(), 'DecisionCommit').onConfirm();
    const pending = screen.render();
    check(one(pending, 'DecisionCommit').disabled && !labels(pending).includes('Event recorded'), 'A delayed provider update must not fabricate recorded state.');
    one(pending, 'DecisionCommit').onConfirm();
    check(accepted === 1, 'Pending acceptance must remain one-shot.');
  }
}

function testBuildingStatusAndNavigation() {
  for (const id of ['marked_raiders', 'refugee_camp'] as const) {
    const { game } = fixture(id);
    const field = id === 'marked_raiders' ? 'forge' : 'quartermaster';
    let view = presentation.getEarlyHumanEventView(id, game)!;
    check(view.buildingLabel === 'Blueprint preview · Locked', 'Unclaimed building unlock must not appear constructed.');
    game[id === 'marked_raiders' ? 'forgeUnlocked' : 'refugeeCampSecured'] = true;
    view = presentation.getEarlyHumanEventView(id, game)!;
    check(view.buildingLabel === 'Blueprint unlocked · Not built', 'Unlocked blueprint must not be a free building.');
    for (const level of [1, 2, 5]) {
      game.buildingLevels[field] = level;
      check(presentation.getEarlyHumanEventView(id, game)!.buildingLabel === 'Built · Level ' + level, 'Report must reflect current construction level.');
    }
  }
  const app = ts.createSourceFile('AppShell.tsx', readFileSync('src/AppShell.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const callbacks: Array<{ screen: string; prop: string; expression: ts.Expression }> = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const screen = node.tagName.getText(app);
      if (cases.some(row => row[0] === screen)) for (const attribute of node.attributes.properties) {
        if (ts.isJsxAttribute(attribute) && attribute.initializer && ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression) {
          callbacks.push({ screen, prop: attribute.name.getText(app), expression: attribute.initializer.expression });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(app);
  for (const [screen, prop, target] of [
    ['MarkedRaidersScreen', 'onOpenForge', 'kingdom'], ['MarkedRaidersScreen', 'onExit', 'campaign'],
    ['RefugeeCampScreen', 'onExit', 'campaign'], ['TimberClaimScreen', 'onComplete', 'campaign']
  ]) {
    const found = callbacks.filter(item => item.screen === screen && item.prop === prop);
    assert.equal(found.length, 1);
    const raw = ts.transpileModule('(' + found[0]!.expression.getText(app) + ')', { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText.trim().replace(/;$/, '');
    const writes: any[] = [];
    new Function('setFlow', 'setActive', 'return ' + raw)((value: any) => writes.push(['flow', value]), (value: any) => writes.push(['active', value]))();
    assert.deepEqual(writes, [['flow', null], ['active', target]]);
    checks += 1;
  }
  for (const theme of Object.values(themes)) for (const [, id] of cases) {
    const { game } = fixture(id); game.testTheme = theme;
    const tree = harness(screenPath, 'EarlyHumanEventScreen', game, { eventId: id, onExit: () => {} }).render();
    check(one(tree, 'DecisionIntro').accent === semantic.semanticColor(theme, presentation.getEarlyHumanEventView(id, game)!.event.purpose.tone), 'Event accents must reuse the theme-aware semantic palette.');
  }
  check(getDecisionFooterLayout(680, 1).docked && !getDecisionFooterLayout(440, 1).docked && !getDecisionFooterLayout(680, 2).docked, 'Shared confirmation layout must retain its short-screen/large-text fallback.');
  for (const [name] of cases) check(!readFileSync('src/screens/' + name + '.tsx', 'utf8').includes('ScrollView'), 'Legacy layout should be replaced, not retained behind a second interface.');
}

testActions();
testLocksRetryAndStaleHandlers();
testBuildingStatusAndNavigation();
console.log('PASS: ' + checks + ' opening Human event UI, actual-provider reward, status and routing checks. Native Android visual QA remains separate.');
