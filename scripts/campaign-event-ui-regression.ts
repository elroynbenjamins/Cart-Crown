import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import * as chapter2 from '../src/game/chapter2';
import * as chapter3 from '../src/game/chapter3';
import * as chapter4 from '../src/game/chapter4';
import * as presentation from '../src/ui/campaignEventPresentation';
import * as semantic from '../src/ui/semanticColors';
import { getPreferredFormationSlots } from '../src/game/formation';
import { getDecisionFooterLayout } from '../src/ui/decisionPresentation';
import { themes } from '../src/theme/themes';

// Real screen TSX with native hosts isolated. Provider arrow-function bodies are extracted
// from the current source and run in a controlled state harness, not rewritten test rewards.
// This validates interaction/state behavior; it is not an Android rendering test.
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
function allText(tree: any): string {
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (Array.isArray(tree)) return tree.map(allText).join(' ');
  return tree?.props
    ? allText(tree.props.children) + ' ' + allText(tree.props.footer)
    : '';
}
function harness(file: string, name: string, game: any = {}, props: Record<string, any> = {}) {
  let cursor = 0;
  const hooks: any[] = [];
  const jsx = (type: Element['type'], supplied: any, ...children: any[]): Element => ({ type, props: {
    ...(supplied ?? {}), ...(children.length ? { children: children.length === 1 ? children[0] : children } : {})
  } });
  const react: any = {
    __esModule: true, createElement: jsx,
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
  function host(name: string) {
    const fn = (values: any) => jsx(name, values);
    Object.defineProperty(fn, 'name', { value: name });
    return fn;
  }
  const hosts = (names: string[]) => Object.fromEntries(names.map(name => [name, host(name)]));
  const source = readFileSync(resolve(file), 'utf8');
  const code = ts.transpileModule(source, { fileName: file, reportDiagnostics: true, compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true
  } });
  assert.equal((code.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} as any };
  const localRequire = (request: string): any => {
    if (request === 'react') return react;
    if (request === 'react-native') return { View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: { create: (value: any) => value } };
    if (request.endsWith('/GameProvider')) return { useGame: () => game };
    if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: themes.original }) };
    if (request.endsWith('/chapter2')) return chapter2;
    if (request.endsWith('/chapter3')) return chapter3;
    if (request.endsWith('/chapter4')) return chapter4;
    if (request.endsWith('/semanticColors')) return semantic;
    if (request.endsWith('/campaignEventPresentation')) return presentation;
    if (request.endsWith('/DecisionUI')) return hosts(['DecisionCommit', 'DecisionIntro', 'DecisionLayout', 'DecisionOption', 'DecisionStats']);
    if (request.endsWith('/CampaignEventUI')) return hosts(['ChapterDecision', 'EventEffectList', 'EventIllustration', 'EventResolution', 'EventRewardPanel']);
    if (request.endsWith('/SemanticUI')) return hosts(['SemanticChip', 'SemanticText', 'UnitBadges']);
    if (request.endsWith('/components')) return hosts(['GameCard']);
    if (request.endsWith('/gameArt')) return hosts(['StoryCharacterPortrait', 'StoryScene', 'UnitSprite', 'ResourceSiteSprite', 'BuildingSprite']);
    throw new Error('Unexpected screen dependency ' + request);
  };
  new Function('require', 'module', 'exports', code.outputText)(localRequire, module, module.exports);
  return { props, game, render() { cursor = 0; return module.exports[name](props); } };
}

const providerSource = ts.createSourceFile('GameProvider.tsx', readFileSync('src/game/GameProvider.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function initializer(source: ts.SourceFile, name: string) {
  const found: ts.Expression[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer) found.push(node.initializer);
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert.equal(found.length, 1, 'Expected one source initializer for ' + name);
  return found[0]!;
}
function actionFromProvider(name: string, scope: Record<string, any>) {
  const raw = '(' + initializer(providerSource, name).getText(providerSource) + ')';
  const js = ts.transpileModule(raw, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText.trim().replace(/;$/, '');
  return new Function(...Object.keys(scope), 'return ' + js)(...Object.values(scope));
}
function gameFixture(chapter: number, nodeId: string) {
  const calls: string[] = [];
  const game: any = {
    activeFaction: 'human', chapterNumber: chapter,
    chapterNodes: [
      { id: nodeId, current: true, completed: false },
      { id: nodeId.replace(/_(\d+)$/, (_, n: string) => '_' + (Number(n) + 1)), current: false, completed: false }
    ],
    resources: { gold: 100, provisions: 20, wood: 10, iron: 5, stone: 5 },
    units: [], formation: Array.from({ length: 9 }, () => null), formationShapeId: 'balanced_333', activeSquadCap: 5,
    buildingLevels: { signal_tower: 0 }, kingdomDefenseCompleted: true, signalTowerUnlocked: false,
    dividedMarchResolved: false, unlockedResourceSites: [], sharedProgress: { lore: [] },
    marcherWarningChoices: chapter3.marcherWarningChoices, marcherWarningChoiceId: null,
    lastLoyalistChoices: chapter4.lastLoyalistChoices, lastLoyalistsChoiceId: null,
    marcherAuxiliaryOptions: chapter3.marcherAuxiliaryOptions,
    getPreferredFormationSlots
  };
  for (const [setter, field] of Object.entries({
    setResources: 'resources', setUnits: 'units', setFormation: 'formation', setChapterNodes: 'chapterNodes',
    setMarcherWarningChoiceId: 'marcherWarningChoiceId', setLastLoyalistsChoiceId: 'lastLoyalistsChoiceId',
    setSignalTowerUnlocked: 'signalTowerUnlocked', setUnlockedResourceSites: 'unlockedResourceSites', setDividedMarchResolved: 'dividedMarchResolved',
    setSharedProgress: 'sharedProgress'
  })) game[setter] = (value: any) => { game[field] = typeof value === 'function' ? value(game[field]) : value; };
  for (const action of ['completeIntoFrostmarch', 'chooseMarcherWarning', 'chooseLastLoyalistsApproach', 'chooseMarcherAuxiliary', 'completeDividedMarch', 'completeBrokenSignalTower']) {
    game[action] = (...args: any[]) => { calls.push(action); return actionFromProvider(action, game)(...args); };
  }
  return { game, calls };
}

function testEffects() {
  for (const choice of [...chapter3.marcherWarningChoices, ...chapter4.lastLoyalistChoices]) {
    const preview = presentation.eventEffectRows(choice, 'preview');
    check(preview.length > 0, choice.id + ' lost its factual effect rows.');
    check(presentation.eventEffectRows(choice, 'unselected').every(row => row.tone === 'neutral'), 'Alternatives must not look active.');
    check(presentation.eventEffectRows(choice, 'recorded').every(row => row.tone === 'positive'), 'Existing positive choices should retain positive effect colors.');
  }
  const seals = presentation.eventEffectRows(chapter4.lastLoyalistChoices.find(choice => choice.id === 'publish_the_seals')!, 'preview');
  check(seals.some(row => row.id === 'retaliationMultiplier' && row.value === '-20%' && row.tone === 'positive'), 'Reduced retaliation must be a green benefit.');
  const penalties = presentation.eventEffectRows({ attackMultiplier: 0.9, retaliationMultiplier: 1.2 }, 'preview');
  check(penalties.every(row => row.tone === 'negative'), 'Actual attack losses or increased retaliation must be penalties.');
  check(presentation.eventEffectRows({ speedMultiplier: 1, attackMultiplier: Number.NaN }, 'preview').length === 0, 'Unchanged/invalid effects must not become invented bonuses.');
  check(presentation.eventResourceRows({ gold: 40, provisions: 10, iron: 0 }).length === 2, 'Only real nonzero reward values should render.');
  check(presentation.eventResourceRows({ stone: -1 })[0]!.tone === 'negative', 'A resource deduction must never look like a reward.');
  for (const kind of ['immediate', 'production', 'blueprint'] as const) {
    check(presentation.eventRewardLabel(kind, false).includes('preview'), 'Unclaimed outcomes need a preview label.');
    check(!presentation.eventRewardLabel(kind, true).includes('preview'), 'Recorded outcomes must be distinguished from previews.');
  }
  const battle = ts.createSourceFile('BattleScreen.tsx', readFileSync('src/screens/BattleScreen.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const [variable, expected] of [
    ['marcherDoctrineActive', ['siege_road', 'ch3_through_gap', 'ch3_wolves_wing', 'ch3_layered_host', 'lord_marshal_veyr']],
    ['loyalistApproachActive', ['pretender_general']]
  ] as const) {
    const strings: string[] = [];
    const scan = (node: ts.Node) => { if (ts.isStringLiteral(node)) strings.push(node.text); ts.forEachChild(node, scan); };
    scan(initializer(battle, variable));
    assert.deepEqual(strings, [...expected], 'Displayed story-choice scope must track live combat scope.');
    checks += 1;
  }
}

function testTacticalChoices() {
  for (const spec of [
    { file: 'ThreeWarningsScreen', chapter: 3, node: 'ch3_node_5', field: 'marcherWarningChoiceId', options: chapter3.marcherWarningChoices },
    { file: 'LastLoyalistsScreen', chapter: 4, node: 'ch4_node_10', field: 'lastLoyalistsChoiceId', options: chapter4.lastLoyalistChoices }
  ]) {
    for (const option of spec.options) {
      const { game, calls } = gameFixture(spec.chapter, spec.node);
      let continued = 0;
      const wrapper = harness('src/screens/' + spec.file + '.tsx', spec.file, game, { onComplete: () => { continued += 1; } });
      const shared = harness('src/ui/CampaignEventUI.tsx', 'ChapterDecision', {}, { ...one(wrapper.render(), 'ChapterDecision') });
      let tree = shared.render();
      nodes(tree, 'DecisionOption').find(node => node.props.title === option.name)!.props.onSelect();
      tree = shared.render();
      check(calls.length === 0 && game[spec.field] === null, 'A draft must not record the event.');
      check(one(tree, 'DecisionCommit').label === 'Confirm ' + option.name, 'Confirmation must follow the exact selected choice.');
      const before = JSON.stringify(game.resources);
      const commit = one(tree, 'DecisionCommit').onConfirm;
      commit(); commit();
      check(calls.length === 1 && game[spec.field] === option.id, 'Repeated stale taps must record exactly one actual provider choice.');
      check(JSON.stringify(game.resources) === before, 'Story choice must not charge an invented fee.');
      check(game.chapterNodes[0].completed && game.chapterNodes[1].current, 'Existing provider progression must remain intact.');
      Object.assign(shared.props, one(wrapper.render(), 'ChapterDecision'));
      tree = shared.render();
      check(nodes(tree, 'DecisionOption').every(node => node.props.disabled), 'All alternatives must stop being selectable after recording.');
      check(nodes(tree, 'DecisionOption').find(node => node.props.selected)?.props.title === option.name, 'Recorded selection must stay visible.');
      one(tree, 'DecisionCommit').onConfirm();
      check(continued === 1 && calls.length === 1, 'Continue must navigate, not recommit.');
      const reloaded = harness('src/ui/CampaignEventUI.tsx', 'ChapterDecision', {}, { ...one(wrapper.render(), 'ChapterDecision') });
      check(nodes(reloaded.render(), 'DecisionOption').find(node => node.props.selected)?.props.title === option.name, 'Reload must restore the saved choice, not the first option.');
    }
    const invalid = gameFixture(spec.chapter, spec.node);
    invalid.game.activeFaction = 'elf';
    const wrapper = harness('src/screens/' + spec.file + '.tsx', spec.file, invalid.game, { onComplete() {} });
    check(one(wrapper.render(), 'ChapterDecision').canChoose === false, 'Human event must not commit into another faction.');
    invalid.game.activeFaction = 'human';
    invalid.game.chapterNodes[0].current = false;
    check(one(wrapper.render(), 'ChapterDecision').canChoose === false, 'A future event may be previewed but not committed.');
  }
  let attempts = 0;
  let allow = false;
  const props = {
    eyebrow: 'TEST', title: 'Test event', body: 'Body', scope: 'Only this event',
    options: chapter3.marcherWarningChoices, recordedId: null, canChoose: true,
    onChoose: () => { attempts += 1; return allow; }, continueLabel: 'Continue', onContinue() {}
  };
  const h = harness('src/ui/CampaignEventUI.tsx', 'ChapterDecision', {}, props);
  one(h.render(), 'DecisionCommit').onConfirm();
  check(one(h.render(), 'DecisionCommit').message.includes('not completed'), 'Provider rejection needs honest visible feedback.');
  allow = true;
  one(h.render(), 'DecisionCommit').onConfirm();
  check(attempts === 2 && one(h.render(), 'DecisionCommit').label === 'Continue', 'A rejected action must be retryable.');
  const unknown = harness('src/ui/CampaignEventUI.tsx', 'ChapterDecision', {}, { ...props, recordedId: 'legacy-unknown-choice' });
  const unknownTree = unknown.render();
  check(nodes(unknownTree, 'DecisionOption').every(node => node.props.disabled), 'An unknown persisted ID must not unlock replacement choices.');
  check(one(unknownTree, 'DecisionCommit').label === 'Continue' && attempts === 2, 'An unknown saved choice must remain recorded without running the provider.');
}

function testFrostmarchOpening() {
  const { game, calls } = gameFixture(3, 'ch3_node_1');
  game.activeSquadCap = 3;
  let continued = 0;
  const h = harness(
    'src/screens/MarcherEnvoyScreen.tsx',
    'MarcherEnvoyScreen',
    game,
    { onComplete: () => { continued += 1; } }
  );

  let tree = h.render();
  check(
    nodes(tree, 'DecisionOption').length === 0 &&
      nodes(tree, 'DecisionStats').length === 0,
    'Into Frostmarch must be a story beat, not a free squad recruitment.'
  );
  check(
    allText(tree).includes('three active squads') ||
      allText(tree).includes('3 squads'),
    'Into Frostmarch must explain that the army enters with only three active squads.'
  );
  const beforeUnits = JSON.stringify(game.units);
  const beforeFormation = JSON.stringify(game.formation);
  const beforeResources = JSON.stringify(game.resources);
  const action = one(tree, 'DecisionCommit').onConfirm;
  action(); action();

  check(
    calls.filter(call => call === 'completeIntoFrostmarch').length === 1,
    'Into Frostmarch must dispatch its story progression exactly once.'
  );
  check(
    JSON.stringify(game.units) === beforeUnits &&
      JSON.stringify(game.formation) === beforeFormation &&
      JSON.stringify(game.resources) === beforeResources,
    'Entering Frostmarch must not grant a squad, change formation or award resources.'
  );
  check(
    game.chapterNodes[0].completed && game.chapterNodes[1].current,
    'Into Frostmarch must advance cleanly into A Wider Front.'
  );

  tree = h.render();
  check(
    one(tree, 'DecisionCommit').label === 'Continue to A Wider Front',
    'Recorded Frostmarch entry must continue to A Wider Front.'
  );
  one(tree, 'DecisionCommit').onConfirm();
  check(continued === 1, 'Recorded Frostmarch entry must navigate once.');
}


function testRewards() {
  for (const spec of [
    { file: 'DividedMarchScreen', chapter: 3, node: 'ch3_node_10', completedField: 'dividedMarchResolved', callback: 'onComplete' },
    { file: 'BrokenSignalTowerScreen', chapter: 2, node: 'ch2_node_5', completedField: 'signalTowerUnlocked', callback: 'onExit' }
  ]) {
    const { game, calls } = gameFixture(spec.chapter, spec.node);
    let continued = 0;
    const wrapper = harness('src/screens/' + spec.file + '.tsx', spec.file, game, { [spec.callback]: () => { continued += 1; } });
    let tree = wrapper.render();
    const rewardPanels = nodes(tree, 'EventRewardPanel').map(node => node.props);
    check(rewardPanels.every(panel => !panel.completed) && calls.length === 0, 'Opening an event must show unclaimed previews only.');
    const before = { ...game.resources };
    const shared = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...one(tree, 'EventResolution') });
    const action = one(shared.render(), 'DecisionCommit').onConfirm;
    action(); action();
    check(calls.length === 1 && game[spec.completedField], spec.file + ': reward event must resolve exactly once using the real provider.');
    if (spec.file === 'DividedMarchScreen') {
      const preview = rewardPanels.find(panel => panel.kind === 'immediate')!;
      for (const key of Object.keys(before)) check(game.resources[key] - before[key] === (preview.values[key] ?? 0), 'One-time reward preview drifted from GameProvider: ' + key);
      const production = rewardPanels.find(panel => panel.kind === 'production')!;
      assert.deepEqual(production.values, chapter3.marcherResourceSites.find(site => site.id === 'marcher_depot')!.productionPerActivity);
      check(game.unlockedResourceSites.includes('marcher_depot'), 'Depot unlock must still occur.');
    } else {
      check(JSON.stringify(game.resources) === JSON.stringify(before), 'Signal Tower must not invent an immediate Stone payout.');
      check(game.buildingLevels.signal_tower === 0, 'Blueprint unlock must not construct a tower.');
      check(game.unlockedResourceSites.includes('old_quarry'), 'Quarry must still unlock.');
      check(game.sharedProgress.lore.includes('signal_network_restored'), 'Signal Tower completion must record its existing lore.');
      const production = rewardPanels.find(panel => panel.kind === 'production')!;
      assert.deepEqual(production.values, chapter2.humanResourceSites.find(site => site.id === 'old_quarry')!.productionPerActivity);
    }
    tree = wrapper.render();
    check(nodes(tree, 'EventRewardPanel').every(panel => panel.props.completed), 'Completed event report must use recorded outcome labels.');
    Object.assign(shared.props, one(tree, 'EventResolution'));
    one(shared.render(), 'DecisionCommit').onConfirm();
    check(continued === 1 && calls.length === 1, 'Continue after rewards must not award them again.');
    const snapshot = JSON.stringify(game.resources);
    const reopened = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...one(tree, 'EventResolution') });
    one(reopened.render(), 'DecisionCommit').onConfirm();
    check(JSON.stringify(game.resources) === snapshot && calls.length === 1, 'Reopening an event must remain non-farmable.');
  }
  const gate = gameFixture(2, 'ch2_node_5');
  gate.game.kingdomDefenseCompleted = false;
  const tower = harness('src/screens/BrokenSignalTowerScreen.tsx', 'BrokenSignalTowerScreen', gate.game, { onExit() {} });
  check(!one(tower.render(), 'EventResolution').canResolve, 'Tower must retain the Defense prerequisite.');
  gate.game.buildingLevels.signal_tower = 1;
  check(nodes(tower.render(), 'SemanticChip').some(node => node.props.label.includes('upgrade needed')), 'Level 1 tower must not claim detailed intel.');
  gate.game.buildingLevels.signal_tower = 2;
  check(nodes(tower.render(), 'SemanticChip').some(node => node.props.label.includes('requirement met')), 'Level 2 intel state must be visible.');
  let attempts = 0;
  const failed = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, {
    title: 'Event', label: 'Resolve', continueLabel: 'Continue', completed: false, canResolve: true,
    onResolve: () => { attempts += 1; return false; }, onContinue() { throw new Error('Must not continue after failure.'); }
  });
  one(failed.render(), 'DecisionCommit').onConfirm();
  check(one(failed.render(), 'DecisionCommit').message.includes('could not'), 'Rejected resolution must display a failure.');
  one(failed.render(), 'DecisionCommit').onConfirm();
  check(attempts === 2, 'Rejected resolution must remain retryable.');
}

function testSharedPresentation() {
  const h = harness('src/ui/CampaignEventUI.tsx', 'EventIllustration', {}, { children: { type: 'Scene', props: {} } });
  check(nodes(h.render(), 'Scene').length === 0, 'Illustration must not crowd out the initial event text.');
  one(h.render(), 'Pressable').onPress();
  check(nodes(h.render(), 'Scene').length === 1 && one(h.render(), 'Pressable').accessibilityState.expanded, 'Existing artwork must remain available through an accessible disclosure.');
  check(!getDecisionFooterLayout(440, 1).docked && !getDecisionFooterLayout(680, 2).docked, 'Short screens and large text must retain the existing inline confirmation fallback.');
  for (const file of ['ThreeWarningsScreen', 'LastLoyalistsScreen', 'MarcherEnvoyScreen', 'DividedMarchScreen', 'BrokenSignalTowerScreen']) {
    const source = readFileSync('src/screens/' + file + '.tsx', 'utf8');
    check(!source.includes('onTouchEnd'), 'Scrolling must not select an event option in ' + file);
    check(!source.includes('setTacticalGuidance') && !source.includes('RECOMMENDED'), 'Event UI must not add guidance or make recommendations.');
  }
  for (const kind of ['immediate', 'production', 'blueprint'] as const) {
    const panel = harness('src/ui/CampaignEventUI.tsx', 'EventRewardPanel', {}, { title: 'Test', kind, completed: false, detail: 'Details' });
    check(one(panel.render(), 'SemanticChip').tone === 'blue', 'Pending rewards/unlocks need distinct preview emphasis.');
    panel.props.completed = true;
    check(one(panel.render(), 'SemanticChip').tone === 'positive', 'Completed outcomes need distinct recorded emphasis.');
  }
}

testEffects();
testTacticalChoices();
testFrostmarchOpening();
testRewards();
testSharedPresentation();
console.log('PASS: ' + checks + ' campaign-event presentation, real-provider action and TSX interaction/model checks. Native device rendering remains separate.');
