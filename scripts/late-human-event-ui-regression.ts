import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as presentation from '../src/ui/lateHumanEventPresentation';
import * as eventPresentation from '../src/ui/campaignEventPresentation';
import { chapterFourNodes } from '../src/game/chapter4';
import { chapterFiveNodes } from '../src/game/chapter5';
import { chapterSixNodes } from '../src/game/chapter6';
import { royalDecrees } from '../src/game/capital';
import { themes } from '../src/theme/themes';
import { getDecisionFooterLayout } from '../src/ui/decisionPresentation';
import type { LateHumanEventId } from '../src/ui/lateHumanEventPresentation';
import type { FactionId } from '../src/game/types';

// Execute real screen TSX and current provider action bodies with isolated native hosts.
// This is interaction/state-model coverage, not an Android render or screenshot test.
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
  return tree?.props ? [text(tree.props.children), text(tree.props.footer)].join(' ') : '';
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
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { fileName: file, reportDiagnostics: true, compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true
  } });
  assert.equal((output.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} as any };
  const localRequire = (request: string): any => {
    if (request === 'react') return react;
    if (request === 'react-native') return { View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: { create: (value: any) => value } };
    if (request.endsWith('/GameProvider')) return { useGame: () => game };
    if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: themes.original }) };
    if (request.endsWith('/lateHumanEventPresentation')) return presentation;
    if (request.endsWith('/campaignEventPresentation')) return eventPresentation;
    if (request.endsWith('/DecisionUI')) return hosts(['DecisionCommit', 'DecisionIntro', 'DecisionLayout', 'DecisionOption']);
    if (request.endsWith('/CampaignEventUI')) return hosts(['EventResolution', 'EventRewardPanel', 'EventIllustration']);
    if (request.endsWith('/LateHumanEventScreen')) return hosts(['LateHumanEventScreen']);
    if (request.endsWith('/SemanticUI')) return hosts(['SemanticChip', 'SemanticText']);
    if (request.endsWith('/components')) return hosts(['GameCard']);
    if (request.endsWith('/gameArt')) return hosts(['FactionCrest', 'ResourceSiteSprite', 'StoryCharacterPortrait', 'StoryScene', 'WagonStageSprite']);
    throw new Error('Unexpected late Human event dependency: ' + request);
  };
  new Function('require', 'module', 'exports', output.outputText)(localRequire, module, module.exports);
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
  assert.equal(found.length, 1, 'Expected one provider action: ' + name);
  const raw = '(' + found[0]!.getText(provider) + ')';
  const code = ts.transpileModule(raw, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText.trim().replace(/;$/, '');
  return new Function(...Object.keys(scope), 'return ' + code)(...Object.values(scope));
}
const cases = [
  ['EmptyThroneScreen', 'empty_throne'], ['BrokenArchivesScreen', 'broken_archives'],
  ['RoyalLedgerScreen', 'royal_ledger'], ['GrandCouncilScreen', 'grand_council'],
  ['ConcordVaultScreen', 'concord_vault'], ['ForcedBeaconScreen', 'forced_beacon']
] as const;
const screenPath = 'src/screens/LateHumanEventScreen.tsx';
function fixture(id: LateHumanEventId) {
  const event = presentation.getLateHumanEvent(id)!;
  const chapter = event.chapter === 4 ? chapterFourNodes : event.chapter === 5 ? chapterFiveNodes : chapterSixNodes;
  const calls: string[] = [];
  const game: any = {
    activeFaction: 'human', chapterNumber: event.chapter,
    chapterNodes: chapter.map(node => ({ ...node, current: node.id === event.nodeId, completed: false })),
    resources: { gold: 100, wood: 100, stone: 100, iron: 100, provisions: 100 },
    unlockedResourceSites: [], sharedProgress: { lore: [], achievements: [], completedCampaigns: [], metaCampaignStep: 0, metaCampaignComplete: false },
    completedCampaigns: [], metaCampaignUnlocked: false, metaCampaignComplete: false,
    activeRoyalDecree: royalDecrees[0], royalDecreeId: royalDecrees[0]?.id,
    units: [{ id: 'existing_squad', className: 'Recruit' }], formation: ['existing_squad', null, null, null, null, null, null, null, null],
    unitEquipment: {}, equipmentInventory: [], armyReadiness: 51,
    buildingLevels: { hall: 5 }, buildingPlacements: { hall: 'center' }, currentWagonStage: { id: 'stronghold' },
    productionStock: { gold: 6, wood: 4, stone: 2, iron: 1, provisions: 3 }
  };
  for (const [setter, field] of Object.entries({ setResources: 'resources', setChapterNodes: 'chapterNodes', setUnlockedResourceSites: 'unlockedResourceSites', setSharedProgress: 'sharedProgress' })) {
    game[setter] = (value: any) => { game[field] = typeof value === 'function' ? value(game[field]) : value; };
  }
  for (const [, eventId] of cases) {
    const action = presentation.getLateHumanEvent(eventId)!.action;
    game[action] = () => { calls.push(action); return providerAction(action, game)(); };
  }
  return { game, calls, event };
}
function protectedState(game: any) {
  return JSON.stringify([
    game.units, game.formation, game.unitEquipment, game.equipmentInventory, game.armyReadiness,
    game.buildingLevels, game.buildingPlacements, game.currentWagonStage, game.productionStock,
    game.activeRoyalDecree, game.royalDecreeId, game.completedCampaigns, game.metaCampaignUnlocked, game.metaCampaignComplete
  ]);
}
function statusLabels(tree: any) { return nodes(tree, 'SemanticChip').map(node => node.props.label); }

function testEvents() {
  for (const [name, id] of cases) {
    const { game, calls, event } = fixture(id);
    let continued = 0;
    const wrapper = harness('src/screens/' + name + '.tsx', name, game, { onComplete: () => { continued += 1; } });
    const wrapperProps = one(wrapper.render(), 'LateHumanEventScreen');
    check(wrapperProps.eventId === id, name + ' must preserve event routing.');
    const screen = harness(screenPath, 'LateHumanEventScreen', game, wrapperProps);
    let tree = screen.render();
    const resolverProps = one(tree, 'EventResolution');
    check(resolverProps.key === event.nodeId, 'Each event must have its own keyed completion guard.');
    check(resolverProps.canResolve && !resolverProps.completed, event.title + ' should start as a current preview.');
    check(one(tree, 'DecisionIntro').title === event.title, 'Authored event title must be retained.');
    check(statusLabels(tree).includes('Current event · preview'), 'Current does not mean already claimed.');
    check(nodes(tree, 'SemanticChip').some(node => node.props.label === event.purpose.label && node.props.tone === event.purpose.tone), 'Event purpose needs a labeled semantic accent.');
    check(calls.length === 0, 'Rendering the report must not mutate campaign state.');
    const panels = nodes(tree, 'EventRewardPanel').map(node => node.props);
    const direct = panels.filter(panel => panel.kind === 'immediate');
    check(direct.length === (id === 'grand_council' ? 1 : 0), 'Only Grand Council grants immediate stores in this event set.');
    if (direct.length) assert.deepEqual(direct[0]!.values, { gold: 50, provisions: 30 });
    if (event.site) {
      const panel = panels.find(panel => panel.kind === 'production')!;
      check(panel.title === event.site.name && !panel.completed, 'Production preview must use the authored site and actual unlock state.');
      assert.deepEqual(panel.values, event.site.productionPerActivity);
      check(panel.note.includes('not an immediate payout') && panel.note.includes('Kingdom'), 'Production must explain delayed collection.');
    }
    check(nodes(one(tree, 'EventIllustration').children, 'StoryScene').some(node => node.props.scene === event.scene), 'Existing story illustration must remain available.');
    const before = { ...game.resources };
    const protectedBefore = protectedState(game);
    const resolver = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...resolverProps });
    const action = one(resolver.render(), 'DecisionCommit').onConfirm;
    action(); action();
    check(calls.length === 1 && calls[0] === event.action, 'Repeated stale confirmation must resolve the correct event exactly once.');
    for (const key of Object.keys(before)) {
      check(game.resources[key] - before[key] === (event.resources?.[key as keyof typeof event.resources] ?? 0), event.title + ': resource delta must match the current provider.');
    }
    check(game.chapterNodes.find((node: any) => node.id === event.nodeId)?.completed, 'Provider must complete the event node.');
    const nextId = event.nodeId.replace(/_(\d+)$/, (_, index) => '_' + (Number(index) + 1));
    check(game.chapterNodes.find((node: any) => node.id === nextId)?.current, 'Existing next encounter must remain current.');
    assert.deepEqual(game.sharedProgress.lore, event.loreId ? [event.loreId] : []);
    assert.deepEqual(game.unlockedResourceSites, event.siteId ? [event.siteId] : []);
    check(protectedState(game) === protectedBefore, 'Event must not auto-heal, construct, equip, change policy, advance the shared campaign or add production stock.');
    tree = screen.render();
    check(statusLabels(tree).includes('Event recorded'), 'Completed screen must show a recorded report.');
    if (event.site) check(nodes(tree, 'EventRewardPanel').some(node => node.props.kind === 'production' && node.props.completed), 'Recorded production unlock must appear as unlocked.');
    const reopened = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...one(tree, 'EventResolution') });
    const reopenedCommit = one(reopened.render(), 'DecisionCommit');
    check(reopenedCommit.label === event.continueLabel, 'Reopened report should only continue.');
    const after = JSON.stringify([game.resources, game.unlockedResourceSites, game.sharedProgress]);
    reopenedCommit.onConfirm();
    check(continued === 1 && calls.length === 1, 'Continue must not invoke the grant action again.');
    check(JSON.stringify([game.resources, game.unlockedResourceSites, game.sharedProgress]) === after, 'Reopened report must not replay rewards.');
    check(game[event.action]() === false, 'Current provider must reject a completed event after state refresh.');
    check(JSON.stringify([game.resources, game.unlockedResourceSites, game.sharedProgress]) === after, 'Rejected direct replays must preserve resource and lore state.');
  }
}

function testLocksAndRetry() {
  for (const [, id] of cases) {
    for (const route of ['future', 'wrong_chapter', 'elf', 'orc', 'malformed_current'] as const) {
      const { game, calls } = fixture(id);
      if (route === 'future') game.chapterNodes = game.chapterNodes.map((node: any) => ({ ...node, current: false }));
      if (route === 'wrong_chapter') game.chapterNumber = 1;
      if (route === 'elf' || route === 'orc') game.activeFaction = route;
      if (route === 'malformed_current') game.chapterNodes = game.chapterNodes.map((node: any) => ({ ...node, completed: node.current }));
      const screen = harness(screenPath, 'LateHumanEventScreen', game, { eventId: id, onComplete: () => {} });
      const tree = screen.render();
      if (route === 'elf' || route === 'orc') {
        check(nodes(tree, 'EventResolution').length === 0 && nodes(tree, 'EventRewardPanel').length === 0, 'Wrong faction must not show actionable Human grants.');
      } else {
        const props = one(tree, 'EventResolution');
        check(!props.canResolve, 'Future/wrong-chapter/already-completed routes cannot resolve.');
        props.onResolve();
      }
      check(calls.length === 0, 'Invalid route must never reach provider completion.');
    }
    for (const failure of ['rejected', 'throw'] as const) {
      const { game, calls, event } = fixture(id);
      const real = game[event.action];
      let attempts = 0;
      game[event.action] = () => {
        attempts += 1;
        if (attempts === 1) {
          if (failure === 'throw') throw new Error('fixture failure');
          return false;
        }
        return real();
      };
      let continued = 0;
      const tree = harness(screenPath, 'LateHumanEventScreen', game, { eventId: id, onComplete: () => { continued += 1; } }).render();
      const resolver = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...one(tree, 'EventResolution') });
      const before = JSON.stringify(game.resources);
      one(resolver.render(), 'DecisionCommit').onConfirm();
      check(attempts === 1 && calls.length === 0 && continued === 0, 'Rejected/throwing action must not continue or grant resources.');
      check(JSON.stringify(game.resources) === before, 'Failure must not be displayed as a grant.');
      check(one(resolver.render(), 'DecisionCommit').message.includes('could not'), 'Failure needs honest feedback.');
      one(resolver.render(), 'DecisionCommit').onConfirm();
      check(attempts === 2 && calls.length === 1, 'Failed confirmations must remain retryable.');
    }
  }
  check(presentation.getLateHumanEvent('constructor' as LateHumanEventId) === null, 'Unknown event keys must fail closed.');
}

function testSealAndPolicies() {
  for (const completed of [false, true]) {
    for (const flags of [[], ['elf'], ['orc'], ['elf', 'orc'], ['human'], ['human', 'elf', 'orc']] as FactionId[][]) {
      const status = presentation.getHumanOathSealStatus(completed, flags);
      check((status.label === 'Human Oath Seal recovered') === flags.includes('human'), 'Only Human campaign completion may show the Oath Seal recovered.');
      if (!flags.includes('human')) check(status.tone === (completed ? 'warning' : 'blue'), 'Preview and located objective need distinct labeled states.');
    }
  }
  const { game } = fixture('forced_beacon');
  const screen = harness(screenPath, 'LateHumanEventScreen', game, { eventId: 'forced_beacon', onComplete: () => {} });
  check(statusLabels(screen.render()).includes('Three Seals locked'), 'Discovery must not unlock Three Seals.');
  game.completedCampaigns = ['human'];
  check(statusLabels(screen.render()).includes('Human Oath Seal recovered') && statusLabels(screen.render()).includes('Three Seals locked'), 'Human success is not completion of all campaigns.');
  game.completedCampaigns = ['human', 'elf', 'orc'];
  game.metaCampaignUnlocked = true;
  check(statusLabels(screen.render()).includes('Three Seals available'), 'Shared-campaign availability must reflect current provider state.');
  check(!statusLabels(screen.render()).includes('Three Seals completed'), 'Available does not mean completed.');
  game.metaCampaignComplete = true;
  check(statusLabels(screen.render()).includes('Three Seals completed'), 'A completed shared campaign needs accurate report state.');

  const council = fixture('grand_council');
  const h = harness(screenPath, 'LateHumanEventScreen', council.game, { eventId: 'grand_council', onComplete: () => {} });
  for (const decree of [...royalDecrees, null]) {
    council.game.activeRoyalDecree = decree;
    const tree = h.render();
    check(statusLabels(tree).includes('Royal Decree · unchanged'), 'Council must not imply a policy switch.');
    check(text(tree).includes(decree?.name ?? 'No Royal Decree selected'), 'Policy panel must read the current choice including no selection.');
    check(council.calls.length === 0, 'Inspecting different current policies must not complete the council.');
  }
}

function testPreservationAndLayout() {
  // Exact scene and callback retention, and shared responsive semantics rather than per-screen overlay code.
  const screen = readFileSync(screenPath, 'utf8');
  check(!screen.includes('onTouchEnd') && !screen.includes("position: 'absolute'"), 'Event controls must not use touch-release selection or floating content overlays.');
  check(getDecisionFooterLayout(680, 1).docked, 'Standard-height view retains the shared confirmation dock.');
  check(!getDecisionFooterLayout(440, 1).docked && !getDecisionFooterLayout(680, 2).docked, 'Short or enlarged-text views must keep one ordinary scroll flow.');
  const content = { type: 'StorySentinel', props: {} };
  const illustration = harness('src/ui/CampaignEventUI.tsx', 'EventIllustration', {}, { children: content });
  let tree = illustration.render();
  check(nodes(tree, 'StorySentinel').length === 0, 'Illustration must be optional, not a reading gate.');
  const press = one(tree, 'Pressable');
  check(press.accessibilityRole === 'button' && press.accessibilityState.expanded === false, 'Illustration disclosure must expose its accessible state.');
  press.onPress();
  tree = illustration.render();
  check(nodes(tree, 'StorySentinel').length === 1 && one(tree, 'Pressable').accessibilityState.expanded, 'Existing art must remain reachable.');
}

testEvents();
testLocksAndRetry();
testSealAndPolicies();
testPreservationAndLayout();
console.log('PASS: ' + checks + ' late Human event reward, production, policy, seal, routing and real-TSX interaction/model checks. Native Android visual QA remains separate.');
