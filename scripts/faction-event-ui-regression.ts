import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as presentation from '../src/ui/factionEventPresentation';
import * as eventPresentation from '../src/ui/campaignEventPresentation';
import { getBuildings, getFactionBuildingIds } from '../src/game/kingdom';
import { getDecisionFooterLayout } from '../src/ui/decisionPresentation';
import { themes } from '../src/theme/themes';
import type { EarlyFactionEventRequest } from '../src/ui/factionEventPresentation';

// Real TSX and current provider action bodies, with isolated native hosts and state.
// These are interaction/model tests, not native Android rendering or screenshot tests.
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
    if (request.endsWith('/factionEventPresentation')) return presentation;
    if (request.endsWith('/campaignEventPresentation')) return eventPresentation;
    if (request.endsWith('/DecisionUI')) return hosts(['DecisionCommit', 'DecisionIntro', 'DecisionLayout', 'DecisionOption']);
    if (request.endsWith('/CampaignEventUI')) return hosts(['EventResolution', 'EventRewardPanel']);
    if (request.endsWith('/EarlyFactionEventScreen')) return hosts(['EarlyFactionEventScreen']);
    if (request.endsWith('/SemanticUI')) return hosts(['SemanticChip', 'SemanticText']);
    if (request.endsWith('/components')) return hosts(['GameCard']);
    if (request.endsWith('/gameArt')) return hosts(['FactionCrest', 'CampaignNodeSprite', 'BuildingSprite', 'ResourceSiteSprite']);
    throw new Error('Unexpected faction event dependency: ' + request);
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
  assert.equal(found.length, 1, 'Expected one provider action: ' + name);
  const raw = '(' + found[0]!.getText(provider) + ')';
  const code = ts.transpileModule(raw, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText.trim().replace(/;$/, '');
  return new Function(...Object.keys(scope), 'return ' + code)(...Object.values(scope));
}
const actions = ['completeFactionChapterOneEvent', 'completeFactionChapterTwoEvent', 'completeFactionChapterThreeEvent'] as const;
const screens = ['FactionChapterOneEventScreen', 'FactionChapterTwoEventScreen', 'FactionChapterThreeEventScreen'] as const;
const requests: EarlyFactionEventRequest[] = [
  { chapter: 1, stage: 'investigation' }, { chapter: 1, stage: 'supply' },
  { chapter: 2, stage: 'resource' }, { chapter: 2, stage: 'council' },
  { chapter: 3, stage: 'resource' }, { chapter: 3, stage: 'council' }
];
function fixture(faction: 'elf' | 'orc', request: EarlyFactionEventRequest) {
  const event = presentation.getEarlyFactionEvent(faction, request)!;
  const calls: string[] = [];
  const game: any = {
    activeFaction: faction, chapterNumber: request.chapter, settlementUpgraded: true,
    chapterNodes: [
      { id: event.nodeId, current: true, completed: false, name: event.title, type: 'event' },
      { id: event.nodeId.replace(/_(\d+)$/, (_, n: string) => '_' + (Number(n) + 1)), current: false, completed: false, name: 'Next', type: 'battle' }
    ],
    resources: { gold: 100, wood: 100, stone: 100, iron: 100, provisions: 100 },
    buildings: getBuildings(faction), buildingLevels: {}, buildingPlacements: {},
    factionBuildingIds: getFactionBuildingIds(faction), commanderChoiceUnlocked: false,
    currentWagonStage: { id: 'fort' }, unlockedResourceSites: [], sharedProgress: { lore: [] },
    units: [], armyReadiness: 66, productionStock: { gold: 0, wood: 0, stone: 0, iron: 0, provisions: 0 }
  };
  for (const [setter, field] of Object.entries({
    setResources: 'resources', setChapterNodes: 'chapterNodes', setUnlockedResourceSites: 'unlockedResourceSites', setSharedProgress: 'sharedProgress'
  })) game[setter] = (value: any) => { game[field] = typeof value === 'function' ? value(game[field]) : value; };
  for (const action of actions) game[action] = (...args: any[]) => { calls.push(action); return providerAction(action, game)(...args); };
  return { game, calls, event };
}

function testEveryEvent() {
  for (const faction of ['elf', 'orc'] as const) for (const request of requests) {
    const { game, calls, event } = fixture(faction, request);
    let continued = 0;
    const name = screens[request.chapter - 1]!;
    const wrapper = harness('src/screens/' + name + '.tsx', name, game, { stage: request.stage, onComplete: () => { continued += 1; } });
    const screen = harness('src/screens/EarlyFactionEventScreen.tsx', 'EarlyFactionEventScreen', game, { ...one(wrapper.render(), 'EarlyFactionEventScreen') });
    let tree = screen.render();
    const resolverProps = one(tree, 'EventResolution');
    check(resolverProps.canResolve && !resolverProps.completed, event.title + ': current event must start as a preview.');
    check(resolverProps.key === event.nodeId, 'Event identity must remount the completion guard between stages/factions.');
    check(one(tree, 'DecisionIntro').title === event.title, 'Wrapper must preserve the authored event title.');
    check(nodes(tree, 'FactionCrest')[0]!.props.faction === faction, 'Faction crest must not default to Human or another faction.');
    check(nodes(tree, 'SemanticChip').some(node => node.props.label === event.purpose.label && node.props.tone === event.purpose.tone), 'Event purpose needs a labeled semantic accent.');
    const panels = nodes(tree, 'EventRewardPanel').map(node => node.props);
    const immediate = panels.find(panel => panel.kind === 'immediate')!;
    check(Boolean(immediate) && !immediate.completed, 'Actual one-time rewards must be previewed before commitment.');
    const before = { ...game.resources };
    const protectedState = JSON.stringify([game.units, game.armyReadiness, game.buildingLevels, game.buildingPlacements, game.productionStock]);
    check(calls.length === 0, 'Rendering the report must not resolve it.');
    if (event.buildingRole) {
      const building = game.buildings.find((item: any) => item.role === event.buildingRole)!;
      check(!providerAction('isBuildingUnlocked', game)(building.id), 'Test fixture must start before this blueprint gate.');
      check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Blueprint preview'), 'Locked blueprint must not look built.');
    }
    const resolver = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...resolverProps });
    const confirm = one(resolver.render(), 'DecisionCommit').onConfirm;
    confirm(); confirm();
    check(calls.length === 1 && calls[0] === actions[request.chapter - 1], 'One explicit confirmation must run the correct existing action exactly once.');
    check(game.chapterNodes[0].completed && game.chapterNodes[1].current, 'Event must preserve existing chapter advancement.');
    for (const resource of Object.keys(before)) check(game.resources[resource] - before[resource] === (immediate.values[resource] ?? 0), event.title + ': displayed one-time ' + resource + ' differs from GameProvider.');
    check(protectedState === JSON.stringify([game.units, game.armyReadiness, game.buildingLevels, game.buildingPlacements, game.productionStock]), 'Event must not silently train, heal, construct, expand or instantly accrue production.');
    if (event.site) {
      check(game.unlockedResourceSites.includes(event.site.id), 'Displayed resource site must actually unlock.');
      const production = panels.find(panel => panel.kind === 'production')!;
      assert.deepEqual(production.values, event.site.productionPerActivity);
      check(production.note.includes('not an immediate payout'), 'Recurring output must be distinguished from immediate rewards.');
    } else check(!panels.some(panel => panel.kind === 'production'), 'No invented production source on evidence or council events.');
    if (event.buildingRole) {
      const building = game.buildings.find((item: any) => item.role === event.buildingRole)!;
      check(providerAction('isBuildingUnlocked', game)(building.id), 'Blueprint preview must correspond to the actual provider unlock.');
      tree = screen.render();
      check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Blueprint unlocked · not built'), 'Unlocking must not look like construction.');
      game.buildingLevels = { [building.id]: 2 };
      check(nodes(screen.render(), 'SemanticChip').some(node => node.props.label === 'Built · Level 2'), 'Existing building level must remain visible on a reopened event.');
    }
    if (event.expansion) {
      check(nodes(screen.render(), 'SemanticChip').some(node => node.props.label === 'Boss still required'), 'Agreement alone must not imply expansion eligibility.');
      game.chapterNodes[1].completed = true;
      check(nodes(screen.render(), 'SemanticChip').some(node => node.props.label === 'Boss requirement completed'), 'Boss requirement label must reflect current state.');
    }
    tree = screen.render();
    check(nodes(tree, 'EventRewardPanel').every(panel => panel.props.completed), 'Recorded grants and unlocked sites must have recorded outcome labels.');
    Object.assign(resolver.props, one(tree, 'EventResolution'));
    one(resolver.render(), 'DecisionCommit').onConfirm();
    check(continued === 1 && calls.length === 1, 'Continue must navigate without granting again.');
    const reloaded = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...one(tree, 'EventResolution') });
    one(reloaded.render(), 'DecisionCommit').onConfirm();
    check(continued === 2 && calls.length === 1, 'Reopened completed events must not call the reward action.');
    check(providerAction(actions[request.chapter - 1]!, game)(request.stage) === false, 'Provider must also reject a replay after state advancement.');
  }
}

function testGatesAndFailures() {
  for (const faction of ['elf', 'orc'] as const) for (const request of requests) {
    const { game, calls, event } = fixture(faction, request);
    const screen = harness('src/screens/EarlyFactionEventScreen.tsx', 'EarlyFactionEventScreen', game, { request, onComplete() { throw new Error('Unexpected continue'); } });
    game.chapterNodes[0].current = false;
    let props = one(screen.render(), 'EventResolution');
    check(!props.canResolve, 'Future event must be preview-only.');
    let resolver = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, props);
    check(one(resolver.render(), 'DecisionCommit').disabled, 'Future-event confirmation must be disabled.');
    one(resolver.render(), 'DecisionCommit').onConfirm();
    check(calls.length === 0, 'Calling a disabled handler must not award anything.');
    game.chapterNodes[0].current = true;
    game.chapterNumber = request.chapter + 1;
    check(!one(screen.render(), 'EventResolution').canResolve, 'Mismatched chapter routes must not commit.');
    game.chapterNumber = request.chapter;
    game.activeFaction = 'human';
    check(nodes(screen.render(), 'EventResolution').length === 0 && one(screen.render(), 'DecisionCommit').disabled, 'A Human route must not default to Orc rewards.');
    game.activeFaction = faction === 'elf' ? 'orc' : 'elf';
    check(!one(screen.render(), 'EventResolution').canResolve, 'Foreign nodes must not authorize a different faction event.');
    game.activeFaction = faction;
    const action = actions[request.chapter - 1]!;
    const real = game[action];
    let rejected = 0;
    game[action] = () => { rejected += 1; return false; };
    props = one(screen.render(), 'EventResolution');
    resolver = harness('src/ui/CampaignEventUI.tsx', 'EventResolution', {}, { ...props });
    one(resolver.render(), 'DecisionCommit').onConfirm();
    check(rejected === 1 && one(resolver.render(), 'DecisionCommit').message.includes('could not'), 'Rejected actions must show feedback, not a recorded state.');
    check(!one(screen.render(), 'EventResolution').completed, 'Rejection must keep reward labels as previews.');
    game[action] = real;
    Object.assign(resolver.props, one(screen.render(), 'EventResolution'));
    one(resolver.render(), 'DecisionCommit').onConfirm();
    check(calls.length === 1 && game.chapterNodes[0].completed, 'A rejected event action must remain retryable.');
    check(event.nodeId !== presentation.getEarlyFactionEvent(faction === 'elf' ? 'orc' : 'elf', request)!.nodeId, 'Faction event keys must never collide.');
  }
  check(presentation.getEarlyFactionEvent('human', requests[0]!) === null, 'Unsupported faction must be explicit.');
  check(presentation.getEarlyFactionEvent('elf', { chapter: 1, stage: 'council' } as any) === null, 'Invalid chapter/stage pair must not fall through to another reward.');
  check(!presentation.getFactionEventState([], 4, 1, 'elf_node_3').completed, 'A later chapter number alone must not invent a recorded event.');
}

function testPresentation() {
  for (const kind of ['immediate', 'production', 'blueprint'] as const) {
    const h = harness('src/ui/CampaignEventUI.tsx', 'EventRewardPanel', {}, { title: 'Test', kind, completed: false, values: { gold: 5 }, detail: 'Details' });
    check(one(h.render(), 'SemanticChip').tone === 'blue', 'Unclaimed event results need a written preview state.');
    h.props.completed = true;
    check(one(h.render(), 'SemanticChip').tone === 'positive', 'Claimed event results need a recorded state.');
  }
  check(!getDecisionFooterLayout(440, 1).docked && !getDecisionFooterLayout(680, 2).docked, 'Short screens and large text must retain the inline confirmation fallback.');
  const source = readFileSync('src/screens/EarlyFactionEventScreen.tsx', 'utf8');
  check(!source.includes('numberOfLines='), 'Event names, rewards and requirements must be allowed to wrap.');
  check(!source.includes('setTacticalGuidance') && !source.includes('RECOMMENDED'), 'Event color emphasis must not add tactical recommendations.');
  check(!source.includes('onTouchEnd'), 'Event actions must not trigger from scrolling touch release.');
  for (const screen of screens) check(!readFileSync('src/screens/' + screen + '.tsx', 'utf8').includes('setResources'), 'Screen adapter must not own gameplay rewards.');
}

testEveryEvent();
testGatesAndFailures();
testPresentation();
console.log('PASS: ' + checks + ' early Elf/Orc event reward, prerequisite, replay and TSX interaction/model checks across 12 variants. Native Android visual QA remains separate.');
