import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as presentation from '../src/ui/metaCampaignPresentation';
import * as metaCampaign from '../src/game/metaCampaign';
import * as semantic from '../src/ui/semanticColors';
import { factions } from '../src/game/factions';
import { themes } from '../src/theme/themes';
import { getDecisionFooterLayout } from '../src/ui/decisionPresentation';
import type { FactionId } from '../src/game/types';

// Execute real TSX with isolated native hosts and current provider action expressions.
// This checks interactions and state contracts, not pixels or native Android rendering.
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
function text(tree: any): string {
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (Array.isArray(tree)) return tree.map(text).join(' ');
  return tree?.props ? text(tree.props.children) : '';
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
    if (request === 'react-native') return { View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: { hairlineWidth: 1, create: (value: any) => value } };
    if (request.endsWith('/GameProvider')) return { useGame: () => game };
    if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: game.theme ?? themes.original }) };
    if (request.endsWith('/factions')) return { factions };
    if (request.endsWith('/metaCampaign')) return metaCampaign;
    if (request.endsWith('/metaCampaignPresentation')) return presentation;
    if (request.endsWith('/semanticColors')) return semantic;
    if (request.endsWith('/DecisionUI')) return hosts(['DecisionCommit', 'DecisionIntro', 'DecisionLayout', 'DecisionStats']);
    if (request.endsWith('/CampaignEventUI')) return hosts(['EventIllustration']);
    if (request.endsWith('/CampaignStageList')) return hosts(['CampaignStageList']);
    if (request.endsWith('/SemanticUI')) return hosts(['SemanticChip']);
    if (request.endsWith('/components')) return hosts(['GameCard', 'SecondaryButton']);
    if (request.endsWith('/gameArt')) return hosts(['FactionCrest', 'StoryScene']);
    throw new Error('Unexpected Three Seals dependency: ' + request);
  };
  new Function('require', 'module', 'exports', code.outputText)(localRequire, module, module.exports);
  return { props, game, render() { cursor = 0; return module.exports[name](props); } };
}
function source(path: string) {
  return ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}
const provider = source('src/game/GameProvider.tsx');
function evaluate(expression: ts.Expression, file: ts.SourceFile, scope: Record<string, any>) {
  const code = ts.transpileModule('(' + expression.getText(file) + ')', { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS
  } }).outputText.trim().replace(/;$/, '');
  return new Function(...Object.keys(scope), 'return ' + code)(...Object.values(scope));
}
function declaration(file: ts.SourceFile, name: string) {
  const found: ts.Expression[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer) found.push(node.initializer);
    ts.forEachChild(node, visit);
  };
  visit(file);
  assert.equal(found.length, 1, 'Expected one declaration: ' + name);
  return found[0]!;
}
const all: FactionId[] = ['human', 'elf', 'orc'];
function fixture(faction: FactionId, step: number) {
  const calls: string[] = [];
  const game: any = {
    activeFaction: faction, completedCampaigns: [...all], metaCampaignUnlocked: true,
    metaCampaignStep: step, metaCampaignComplete: step === 5,
    sharedProgress: { metaCampaignStep: step, metaCampaignComplete: step === 5, lore: [], completedCampaigns: [...all] },
    resources: { gold: 50, wood: 30, iron: 10, stone: 20, provisions: 12 }, armyReadiness: 43,
    formation: ['lead_squad', null, null], units: [{ id: 'lead_squad' }], buildingLevels: { hall: 6 },
    productionStock: { gold: 3 }, equipmentInventory: ['weapon'],
    setSharedProgress(next: any) {
      game.sharedProgress = typeof next === 'function' ? next(game.sharedProgress) : next;
      game.metaCampaignStep = game.sharedProgress.metaCampaignStep;
      game.metaCampaignComplete = game.sharedProgress.metaCampaignComplete;
    }
  };
  for (const action of ['completeMetaCouncil', 'completeMetaConcordChamber']) game[action] = () => {
    calls.push(action);
    return evaluate(declaration(provider, action), provider, game)();
  };
  const props = {
    onStartConvergence: () => { calls.push('convergence'); },
    onStartTriumvirate: () => { calls.push('triumvirate'); },
    onStartFinalBoss: () => { calls.push('finalBoss'); },
    onExit: () => { calls.push('exit'); }
  };
  return { game, calls, props, screen: harness('src/screens/MetaCampaignScreen.tsx', 'MetaCampaignScreen', game, props) };
}
const protectedState = (game: any) => JSON.stringify([
  game.resources, game.units, game.formation, game.armyReadiness, game.buildingLevels,
  game.productionStock, game.equipmentInventory, game.completedCampaigns
]);

function testStagesAndActions() {
  const expected = ['completeMetaCouncil', 'convergence', 'completeMetaConcordChamber', 'triumvirate', 'finalBoss', 'exit'];
  for (const faction of all) for (let step = 0; step <= 5; step += 1) {
    const { screen, game, calls } = fixture(faction, step);
    const before = protectedState(game);
    let tree = screen.render();
    const commit = one(tree, 'DecisionCommit');
    const list = one(tree, 'CampaignStageList');
    check(list.rows.length === 5, 'Use five authored stages, not a fake sixth objective.');
    check(list.rows.filter((row: any) => row.state === 'completed').length === step, 'Completed stage count must follow actual progress.');
    check(list.rows.filter((row: any) => row.state === 'current').length === (step === 5 ? 0 : 1), 'Exactly one objective may be current before completion.');
    check(calls.length === 0, 'Opening the hub must not start or complete anything.');
    check(nodes(tree, 'FactionCrest').filter(node => node.props.faction === faction).length >= 2, 'Current faction and recovered Seals need their own crests.');
    check(one(tree, 'DecisionStats').presentation === 'multiplier', 'Alliance contributions must be typed as multipliers, not absolute stats.');
    check(text(tree).includes('not permanent squad upgrades'), 'Bonus scope must remain explicit.');
    check(one(tree, 'EventIllustration').children, 'Original Crownspire illustration must remain available.');
    const dispatch = commit.onConfirm;
    dispatch();
    if (step < 5) dispatch();
    check(calls.length === 1 && calls[0] === expected[step], faction + ' step ' + step + ' must dispatch the correct action exactly once.');
    check(protectedState(game) === before, 'Hub interactions must not spend, heal, change armies or grant battle rewards.');
    if (step === 0 || step === 2) {
      check(game.metaCampaignStep === step + 1, 'A real provider event must advance exactly one stage.');
      check(game.sharedProgress.lore.includes(step === 0 ? 'three_seals_council' : 'three_seals_in_chamber'), 'Actual provider lore must be preserved.');
      tree = screen.render();
      dispatch();
      check(calls.length === 1, 'Old handlers must not repeat a completed event after rerender.');
      one(tree, 'DecisionCommit').onConfirm();
      check(calls.length === 2 && calls[1] === expected[step + 1], 'The newly current battle must remain available after event completion.');
    } else if (step < 5) {
      check(game.metaCampaignStep === step && game.sharedProgress.lore.length === 0, 'Navigating to Battle Prep must not award a victory or advance the stage.');
    } else {
      check(commit.label === 'Return to Campaigns' && nodes(tree, 'SecondaryButton').length === 0, 'Completed campaign needs only Return, never a repeat final-boss button.');
    }
  }
}
function testLockedAndInvalidStates() {
  for (let mask = 0; mask < 8; mask += 1) {
    const { game, screen, calls } = fixture('human', 1);
    game.completedCampaigns = all.filter((_, index) => (mask & (1 << index)) !== 0);
    game.metaCampaignUnlocked = mask === 7;
    let tree = screen.render();
    const view = presentation.getMetaCampaignView(game);
    check(view.recovered === game.completedCampaigns.length, 'Seals must be counted by faction, not guessed from active faction.');
    check(view.playable === (mask === 7), 'Only all three recovered Seals and the provider unlock permit progression.');
    if (mask !== 7) {
      check(one(tree, 'CampaignStageList').rows.every((row: any) => row.state === 'locked'), 'Locked preview must not show a playable future stage.');
      one(tree, 'DecisionCommit').onConfirm();
      check(calls.join() === 'exit', 'Locked route must provide Return rather than starting a battle.');
      game.metaCampaignUnlocked = true;
      tree = screen.render();
      check(one(tree, 'DecisionCommit').label === 'Return to Campaigns', 'Inconsistent unlock flag must not bypass missing Seals.');
    }
  }
  for (const value of [-1, 0.5, 5, 6, Number.NaN, Number.POSITIVE_INFINITY]) {
    const { game, screen, calls } = fixture('elf', 0);
    game.metaCampaignStep = value;
    one(screen.render(), 'DecisionCommit').onConfirm();
    check(calls.join() === 'exit', 'Malformed/incomplete terminal step must not fall through to the final boss.');
  }
  const { game, screen, calls } = fixture('orc', 4);
  game.metaCampaignComplete = true;
  one(screen.render(), 'DecisionCommit').onConfirm();
  check(calls.join() === 'exit', 'Inconsistent completion flag must be read-only.');
  const duplicate = presentation.getMetaCampaignView({ completedCampaigns: ['human', 'human', 'human'], metaCampaignStep: 1, metaCampaignComplete: false, metaCampaignUnlocked: true });
  check(duplicate.recovered === 1 && !duplicate.playable, 'Duplicate completion entries must not act like three different Seals.');
}
function testRetryExitAndStaleHandlers() {
  for (const step of [0, 2]) for (const failure of ['false', 'throw']) {
    const { game, screen, calls } = fixture('elf', step);
    const name = step === 0 ? 'completeMetaCouncil' : 'completeMetaConcordChamber';
    const real = game[name];
    let attempts = 0;
    game[name] = () => { attempts += 1; if (attempts === 1) { if (failure === 'throw') throw new Error('Temporary failure'); return false; } return real(); };
    one(screen.render(), 'DecisionCommit').onConfirm();
    let tree = screen.render();
    check(Boolean(one(tree, 'DecisionCommit').message) && game.metaCampaignStep === step, 'Failed events must report failure without local progress.');
    one(tree, 'DecisionCommit').onConfirm();
    tree = screen.render();
    check(game.metaCampaignStep === step + 1 && attempts === 2 && calls.length === 1, 'Failed event must remain retryable exactly once.');
  }
  const f = fixture('human', 1);
  const old = one(f.screen.render(), 'DecisionCommit').onConfirm;
  f.game.activeFaction = 'orc';
  let tree = f.screen.render();
  old();
  check(f.calls.length === 0, 'A stale lead-faction handler must not dispatch.');
  const current = one(tree, 'DecisionCommit').onConfirm;
  f.game.metaCampaignUnlocked = false;
  tree = f.screen.render();
  current();
  check(f.calls.length === 0, 'A stale handler must not bypass changed unlock state.');
  const g = fixture('orc', 2);
  const before = JSON.stringify(g.game.sharedProgress);
  nodes(g.screen.render(), 'SecondaryButton')[0]!.props.onPress();
  check(g.calls.join() === 'exit' && JSON.stringify(g.game.sharedProgress) === before, 'Return without advancing must not resolve a council.');
  for (const guidance of ['off', 'standard', 'full']) {
    const h = fixture('human', 1);
    h.game.tacticalGuidance = guidance;
    check(one(h.screen.render(), 'DecisionCommit').label === 'Prepare Converging Roads', 'Mechanical progression must not depend on guidance preference.');
  }
}
function testStageDisclosure() {
  const game: any = { mutations: 0 };
  const view = presentation.getMetaCampaignView({ completedCampaigns: all, metaCampaignUnlocked: true, metaCampaignComplete: false, metaCampaignStep: 2 });
  const h = harness('src/ui/CampaignStageList.tsx', 'CampaignStageList', game, { rows: view.rows, currentId: view.currentId });
  let tree = h.render();
  const buttons = nodes(tree, 'Pressable');
  check(buttons.length === 5 && buttons[2]!.props.accessibilityState.expanded, 'The current stage should initially expose its description.');
  for (const button of buttons) {
    check(button.props.accessibilityRole === 'button' && button.props.accessibilityHint.includes('does not'), 'Stage disclosure must expose accessible semantics and its preview-only behavior.');
    const style = button.props.style({ pressed: false });
    check(style.some((entry: any) => entry.minHeight >= 48), 'Stage controls must retain a usable touch target.');
  }
  buttons[4]!.props.onPress();
  tree = h.render();
  check(nodes(tree, 'Pressable').filter(node => node.props.accessibilityState.expanded).length === 1, 'Only one stage description should expand at a time.');
  check(text(tree).includes(view.rows[4]!.description) && !text(tree).includes(view.rows[2]!.description), 'Opening another stage must replace the expanded description.');
  nodes(tree, 'Pressable')[4]!.props.onPress();
  check(nodes(h.render(), 'Pressable').every(node => !node.props.accessibilityState.expanded), 'Open stage must collapse on a second tap.');
  check(game.mutations === 0 && nodes(tree, 'PrimaryButton').length === 0, 'Stage descriptions must contain no commit controls.');
  for (const theme of Object.values(themes)) {
    h.game.theme = theme;
    check(nodes(h.render(), 'SemanticChip').length === 5, 'Every theme retains written stage states alongside color.');
  }
  check(!getDecisionFooterLayout(430, 1).docked && !getDecisionFooterLayout(700, 2).docked, 'Short screens and large text retain the shared inline fallback.');
  check(getDecisionFooterLayout(700, 1).docked, 'Normal-height screens retain the shared reachable confirmation dock.');
}
function testLiveNavigationAndEffects() {
  const file = source('src/AppShell.tsx');
  const matches: ts.JsxSelfClosingElement[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(file) === 'MetaCampaignScreen') matches.push(node);
    ts.forEachChild(node, visit);
  };
  visit(file);
  assert.equal(matches.length, 1, 'Three Seals must still use one routed screen.');
  const expectations: Record<string, string> = {
    onStartConvergence: 'three_seals_convergence', onStartTriumvirate: 'ashen_triumvirate', onStartFinalBoss: 'unbound_beacon'
  };
  for (const [name, encounter] of Object.entries(expectations)) {
    const attribute = matches[0]!.attributes.properties.find(prop => ts.isJsxAttribute(prop) && prop.name.getText(file) === name);
    assert.ok(attribute && ts.isJsxAttribute(attribute) && attribute.initializer && ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression);
    const route: any = {};
    evaluate(attribute.initializer.expression, file, { setActiveEncounterId: (id: string) => { route.id = id; }, setFlow: (flow: string) => { route.flow = flow; } })();
    check(route.id === encounter && route.flow === 'battlePrep', name + ' must open the correct preparation screen, not begin/finish combat.');
  }
  const battle = source('src/screens/BattleScreen.tsx');
  const activeExpression = declaration(battle, 'metaAllianceActive');
  for (const encounterId of [...presentation.metaAlliancePreview.encounters, 'toll_captain', 'elf_hollow_warden']) {
    const active = evaluate(activeExpression, battle, { encounterId });
    const expected = presentation.metaAlliancePreview.encounters.some(id => id === encounterId);
    check(active === expected, 'Displayed alliance scope must match the current battle formula.');
    for (const [variable, expectedValue] of [
      ['allianceAttackMultiplier', presentation.metaAlliancePreview.attackMultiplier],
      ['allianceArmorMultiplier', presentation.metaAlliancePreview.armorMultiplier]
    ] as const) check(evaluate(declaration(battle, variable), battle, { metaAllianceActive: active }) === (active ? expectedValue : 1), 'Alliance preview value must match current combat implementation.');
  }
  const screen = readFileSync('src/screens/MetaCampaignScreen.tsx', 'utf8');
  check(!screen.includes('ScrollView') && !screen.includes('StatusPill') && !screen.includes('<PrimaryButton'), 'Legacy scroll/card action implementation must be replaced, not kept alongside the new one.');
}

testStagesAndActions();
testLockedAndInvalidStates();
testRetryExitAndStaleHandlers();
testStageDisclosure();
testLiveNavigationAndEffects();
console.log('PASS: ' + checks + ' modern Three Seals stage, navigation, provider and interaction/model checks. Native Android visual QA remains separate.');
