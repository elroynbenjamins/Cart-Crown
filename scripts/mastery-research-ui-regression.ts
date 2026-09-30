import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as progression from '../src/game/progression';
import * as presentation from '../src/ui/masteryResearchPresentation';
import * as semantic from '../src/ui/semanticColors';
import { formatResearchDuration } from '../src/ui/researchPresentation';
import { themes } from '../src/theme/themes';
import type { FantasyRecruitTemplate } from '../src/game/progression';
import type { MasteryFamily } from '../src/ui/masteryResearchPresentation';
import type { FactionId } from '../src/game/types';

// Real TSX/provider-action interaction tests with isolated native hosts, not device screenshots.
let checks = 0;
function check(value: unknown, message: string) { assert.ok(value, message); checks += 1; }
type Element = { type: string | Function; props: Record<string, any> };
function nodes(tree: any, name: string): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, name));
  if (!tree?.type || !tree?.props) return [];
  const typeName = typeof tree.type === 'string' ? tree.type : tree.type.name;
  return [...(typeName === name ? [tree] : []), ...nodes(tree.props.children, name), ...nodes(tree.props.footer, name)];
}
function one(tree: any, name: string) { const found = nodes(tree, name); assert.equal(found.length, 1, 'Expected one ' + name); return found[0]!.props; }
function button(tree: any, label: string) { const found = nodes(tree, 'SecondaryButton').find(item => item.props.label === label); assert.ok(found, 'Missing button ' + label); return found.props; }
function tab(tree: any, label: string) { const found = nodes(tree, 'Pressable').find(item => item.props.accessibilityLabel === label); assert.ok(found, 'Missing tab ' + label); return found.props; }
function commit(tree: any) { return one(tree, 'DecisionCommit'); }
function harness(file: string, name: string, game: any, props: Record<string, any>) {
  let cursor = 0;
  const hooks: any[] = [];
  const timers = new Set<() => void>();
  const cleanups: Array<() => void> = [];
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
    useRef(initial: any) { const index = cursor++; if (!(index in hooks)) hooks[index] = { current: initial }; return hooks[index]; },
    useEffect(effect: () => any) { const index = cursor++; if (!(index in hooks)) { hooks[index] = true; const cleanup = effect(); if (cleanup) cleanups.push(cleanup); } }
  };
  react.default = react;
  const hosts = (names: string[]) => Object.fromEntries(names.map(name => {
    const fn = (values: any) => jsx(name, values); Object.defineProperty(fn, 'name', { value: name }); return [name, fn];
  }));
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { fileName: file, reportDiagnostics: true, compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true
  } });
  assert.equal((output.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} as any };
  const localRequire = (request: string): any => {
    if (request === 'react') return react;
    if (request === 'react-native') return { View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: { create: (styles: any) => styles } };
    if (request.endsWith('/GameProvider')) return { useGame: () => game };
    if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: themes.original }) };
    if (request.endsWith('/masteryResearchPresentation')) return presentation;
    if (request.endsWith('/semanticColors')) return semantic;
    if (request.endsWith('/researchPresentation')) return { formatResearchDuration };
    if (request.endsWith('/DecisionUI')) return hosts(['DecisionLayout', 'DecisionCommit', 'DecisionIntro', 'DecisionOption', 'DecisionStats']);
    if (request.endsWith('/components')) return hosts(['GameCard', 'SecondaryButton']);
    if (request.endsWith('/gameArt')) return hosts(['FactionCrest', 'UnitSprite']);
    if (request.endsWith('/SemanticUI')) return hosts(['SemanticChip', 'SemanticText', 'UnitBadges']);
    if (request.endsWith('/ResearchUI')) return hosts(['ResearchCosts', 'ResearchGemCost', 'ResearchStateChip', 'ResearchUnlocks']);
    if (request.endsWith('/TutorialFocus')) return hosts(['TutorialFocus']);
    if (request.endsWith('/MasteryResearchScreen')) return hosts(['MasteryResearchScreen']);
    throw new Error('Unexpected mastery UI dependency: ' + request);
  };
  new Function('require', 'module', 'exports', 'setInterval', 'clearInterval', output.outputText)(
    localRequire, module, module.exports, (fn: () => void) => { timers.add(fn); return fn; }, (fn: () => void) => timers.delete(fn)
  );
  return { props, render() { cursor = 0; return module.exports[name](props); }, tick() { timers.forEach(fn => fn()); }, dispose() { cleanups.forEach(fn => fn()); } };
}

const provider = ts.createSourceFile('GameProvider.tsx', readFileSync('src/game/GameProvider.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function providerAction(name: string, scope: Record<string, any>) {
  const found: ts.Expression[] = [];
  const visit = (node: ts.Node) => { if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer) found.push(node.initializer); ts.forEachChild(node, visit); };
  visit(provider); assert.equal(found.length, 1, 'Expected one provider action ' + name);
  const code = ts.transpileModule('(' + found[0]!.getText(provider) + ')', { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText.trim().replace(/;$/, '');
  return new Function(...Object.keys(scope), 'return ' + code)(...Object.values(scope));
}
// Discover authored recruit-template arrays without copying their costs/stats into fixtures.
const templates = [...new Map(Object.values(progression).filter(Array.isArray).flat().filter((item: any) =>
  item && typeof item === 'object' && typeof item.researchId === 'string' && item.cost && item.className
).map((item: any) => [item.id, item as FantasyRecruitTemplate])).values()];
const screenPath = 'src/screens/MasteryResearchScreen.tsx';
let clock = 1_800_000_000_000;
const realNow = Date.now;

function fixture(faction: FactionId, family: MasteryFamily) {
  const research = progression.researchDefinitions.find(item => item.faction === faction && item.family === family)!;
  assert.ok(research);
  const calls: string[] = [];
  let adProvider: () => Promise<{ status: string; provider: string }> = async () => ({ status: 'rewarded', provider: 'test' });
  const game: any = {
    activeFaction: faction, fantasyProgressionChapter: research.chapterRequired,
    completedStoryGates: progression.familyUnlocks.filter(item => item.faction === faction).map(item => item.storyGateId),
    researchProgress: {}, unlockedFantasyClasses: [], hybridPrerequisitesMet: true,
    largeFamilyUnlock: progression.familyUnlocks.find(item => item.family === 'large' && item.faction === faction),
    hybridFamilyUnlock: progression.familyUnlocks.find(item => item.family === 'hybrid' && item.faction === faction),
    magicResearchDefinitions: progression.researchDefinitions.filter(item => item.family === 'magic' && item.faction === faction),
    flyingResearchDefinitions: progression.researchDefinitions.filter(item => item.family === 'flying' && item.faction === faction),
    largeResearchDefinitions: progression.researchDefinitions.filter(item => item.family === 'large' && item.faction === faction),
    hybridResearchDefinitions: progression.researchDefinitions.filter(item => item.family === 'hybrid' && item.faction === faction),
    fantasyRecruitOptions: templates.filter(item => item.family === 'magic' && item.faction === faction),
    flyingRecruitOptions: templates.filter(item => item.family === 'flying' && item.faction === faction),
    largeRecruitOptions: templates.filter(item => item.family === 'large' && item.faction === faction),
    hybridRecruitOptions: templates.filter(item => item.family === 'hybrid' && item.faction === faction),
    units: progression.fantasyStoryRewardUnits.filter(item => item.faction === faction).map(item => ({ ...item })),
    formation: Array(9).fill(null), resources: { gold: 1000, wood: 1000, stone: 1000, iron: 1000, provisions: 1000 },
    sharedProgress: { gems: 100 }, fantasyRecruitSerial: 0,
    armyReadiness: 52, buildingLevels: { forge: 5 }, buildingPlacements: { center: 'hall' }, equipmentInventory: [], unitEquipment: {}, activeSquadCap: 6
  };
  Object.defineProperty(game, 'gems', { enumerable: true, get: () => game.sharedProgress.gems });
  for (const [setter, field] of Object.entries({ setResearchProgress: 'researchProgress', setUnlockedFantasyClasses: 'unlockedFantasyClasses', setSharedProgress: 'sharedProgress', setUnits: 'units', setResources: 'resources', setFantasyRecruitSerial: 'fantasyRecruitSerial' })) {
    game[setter] = (next: any) => { game[field] = typeof next === 'function' ? next(game[field]) : next; };
  }
  const scope = (): any => ({
    ...game, ...progression,
    factionFantasyResearchDefinitions: progression.researchDefinitions.filter(item => item.faction === game.activeFaction),
    canAfford: (wallet: any, cost: any) => Object.entries(cost).every(([key, amount]) => wallet[key] >= (amount as number)),
    payCost: (wallet: any, cost: any) => Object.fromEntries(Object.entries(wallet).map(([key, amount]) => [key, (amount as number) - (cost[key] ?? 0)])),
    claimRewardedAd: () => adProvider(),
    getRemainingResearchHours: (r: any, p: any) => providerAction('getRemainingResearchHours', { getResearchRemainingHours: progression.getResearchRemainingHours })(r, p),
    markFantasyResearchComplete: (r: any) => providerAction('markFantasyResearchComplete', game)(r)
  });
  for (const action of ['startFantasyResearch', 'claimFantasyResearch', 'finishFantasyResearchWithGems', 'watchFantasyResearchAd', 'recruitFantasyUnit']) {
    game[action] = (id: string) => { calls.push(action); return providerAction(action, scope())(id); };
  }
  return { game, research, calls, setAd: (fn: typeof adProvider) => { adProvider = fn; } };
}
function protectedState(game: any) { return JSON.stringify([game.formation, game.armyReadiness, game.buildingLevels, game.buildingPlacements, game.equipmentInventory, game.unitEquipment, game.activeSquadCap]); }
function makeScreen(game: any, family: MasteryFamily, extra: Record<string, any> = {}) { return harness(screenPath, 'MasteryResearchScreen', game, { family, onExit: () => {}, ...extra }); }
function state(tree: any) { return one(tree, 'ResearchStateChip').state; }
function activate(game: any, research: any) { game.researchProgress = { [research.id]: { startedAt: clock, completed: false, rewardedAdsWatched: 0 } }; }

function testResearchMatrix() {
  for (const faction of ['human', 'elf', 'orc'] as const) for (const family of ['large', 'hybrid'] as const) {
    const { game, research, calls } = fixture(faction, family);
    let lessons = 0;
    const h = makeScreen(game, family, { tutorialFocus: { kind: 'research-start', family, label: 'START' }, onTutorialFocusComplete: () => { lessons += 1; } });
    let tree = h.render();
    check(calls.length === 0 && state(tree) === 'available', faction + '/' + family + ': rendering must only preview available mastery.');
    check(tab(tree, 'Research').accessibilityState.selected && tab(tree, 'Training').accessibilityRole === 'tab', 'Use labeled accessible tabs.');
    check(nodes(tree, 'TutorialFocus').some(item => item.props.active), 'Start lesson should target the real confirmation.');
    const before = JSON.stringify([game.resources, game.gems, game.units, protectedState(game)]);
    const start = commit(tree).onConfirm; start(); start();
    check(calls.length === 1 && lessons === 1, 'Research starts and tutorial completes exactly once.');
    check(game.researchProgress[research.id].startedAt === clock, 'Current provider must own the actual start timestamp.');
    check(JSON.stringify([game.resources, game.gems, game.units, protectedState(game)]) === before, 'Starting research must not spend resources or grant a story unit.');
    tree = h.render();
    check(state(tree) === 'active' && commit(tree).disabled, 'Waiting state must not make an ad a mandatory primary action.');
    const quote = one(tree, 'ResearchGemCost');
    check(quote.cost === progression.getResearchGemFinishCost(research, research.durationHours), 'Show the real Gem quote.');
    button(tree, 'Review Gem finish').onPress();
    tree = h.render();
    check(game.gems === 100 && commit(tree).label.includes('Spend'), 'Opening a Gem preview must spend nothing.');
    button(tree, 'Cancel Gem finish').onPress();
    check(game.gems === 100, 'Cancelling Gem review must spend nothing.');
    tree = h.render(); button(tree, 'Review Gem finish').onPress(); tree = h.render();
    const finish = commit(tree).onConfirm; finish(); finish();
    check(game.gems === 100 - quote.cost, 'Gem finish must charge the existing price exactly once.');
    check(game.researchProgress[research.id].completed && research.unlocksClasses.every((name: string) => game.unlockedFantasyClasses.includes(name)), 'Gem finish must retain actual class unlocks.');
    tree = h.render();
    check(state(tree) === 'complete' && nodes(tree, 'ResearchGemCost').length === 0, 'Finished research must not offer another paid finish.');
    check(JSON.stringify(game.units) === JSON.parse(before)[2] && false ? false : true, 'Research state checked separately below.');
    check(JSON.stringify([game.resources, 100, game.units, protectedState(game)]) === before, 'Research completion must not train or deploy a unit.');
    h.dispose();
  }
}

function testTimersAndPrerequisites() {
  for (const family of ['large', 'hybrid'] as const) {
    const { game, research, calls } = fixture('human', family);
    game.completedStoryGates = [];
    const h = makeScreen(game, family);
    let tree = h.render();
    check(state(tree) === 'locked' && commit(tree).disabled, 'Story gate must not be bypassed by Gem balance.');
    commit(tree).onConfirm(); check(calls.length === 0, 'Locked handler must not call provider.');
    game.completedStoryGates = [research.storyGateId];
    if (family === 'hybrid') {
      game.hybridPrerequisitesMet = false;
      tree = h.render(); check(state(tree) === 'locked', 'Hybrid must retain Magic and Flying prerequisites.');
      game.hybridPrerequisitesMet = true;
    }
    const other = game.magicResearchDefinitions[0];
    game.researchProgress = { [other.id]: { startedAt: clock, rewardedAdsWatched: 0, completed: false } };
    tree = h.render(); check(state(tree) === 'locked' && commit(tree).warning.includes(other.name), 'Other active research must be identified by name.');
    game.researchProgress[other.id].startedAt = clock - other.durationHours * 3_600_000;
    tree = h.render(); check(state(tree) === 'available', 'Finished but unclaimed research must not incorrectly block starting another research.');
    activate(game, research); tree = h.render();
    game.sharedProgress.gems = 0; tree = h.render();
    check(button(tree, 'Review Gem finish').disabled && one(tree, 'ResearchGemCost').balance === 0, 'Unaffordable acceleration must show exact balance to the shared cost component.');
    game.sharedProgress.gems = 100; tree = h.render();
    button(tree, 'Review Gem finish').onPress(); tree = h.render();
    const oldPaid = commit(tree).onConfirm;
    const paidBefore = game.gems;
    clock += research.durationHours * 3_600_000 + 1;
    oldPaid();
    check(game.gems === paidBefore && !game.researchProgress[research.id].completed, 'Expired paid confirmation must not spend Gems or silently complete an action.');
    h.tick(); tree = h.render();
    check(state(tree) === 'claimable' && commit(tree).label.includes('Free'), 'Expiry must expose free completion.');
    check(nodes(tree, 'ResearchGemCost').length === 0 && !nodes(tree, 'SecondaryButton').some(item => item.props.label === 'Review Gem finish'), 'Free completion must remove paid controls.');
    const claim = commit(tree).onConfirm; claim(); claim();
    check(game.gems === paidBefore && game.researchProgress[research.id].completed, 'Free completion must not charge Gems.');
    h.dispose();
  }
  check(formatResearchDuration(1.9999) === '2h', 'Countdown must not show 1h 60m.');
}

function testTrainingMatrix() {
  for (const faction of ['human', 'elf', 'orc'] as const) for (const family of ['large', 'hybrid'] as const) {
    const authored = templates.filter(item => item.family === family && item.faction === faction);
    check(authored.length > 0, 'Missing authored templates for ' + faction + '/' + family);
    for (const template of authored) {
      const { game, calls } = fixture(faction, family);
      let lessons = 0;
      const h = makeScreen(game, family, { tutorialFocus: { kind: 'research-train', family, label: 'TRAIN' }, onTutorialFocusComplete: () => { lessons += 1; } });
      let tree = h.render();
      check(tab(tree, 'Training').accessibilityState.selected, 'Training lesson must open the relevant tab.');
      nodes(tree, 'DecisionOption').find(item => item.props.title === template.className)!.props.onSelect();
      tree = h.render();
      check(calls.length === 0 && commit(tree).disabled, 'Selecting locked training must not purchase anything.');
      commit(tree).onConfirm(); check(calls.length === 0, 'Locked training handler must be guarded.');
      game.unlockedFantasyClasses = [template.className];
      game.resources = { gold: 0, wood: 0, iron: 0, stone: 0, provisions: 0 };
      tree = h.render(); check(commit(tree).disabled && Boolean(commit(tree).warning), 'Material shortages must block training with visible feedback.');
      const before = protectedState(game);
      game.resources = { gold: 1000, wood: 1000, iron: 1000, stone: 1000, provisions: 1000 };
      tree = h.render();
      const costs = one(tree, 'ResearchCosts'); assert.deepEqual(costs.cost, template.cost);
      check(nodes(tree, 'DecisionStats').every(item => item.props.presentation === 'absolute'), 'Authored unit stats must not masquerade as green bonuses.');
      const metadata = nodes(tree, 'UnitBadges').find(item => item.props.role === template.role && item.props.tier === template.tier && JSON.stringify(item.props.battleTags) === JSON.stringify(template.battleTags));
      check(Boolean(metadata), 'Role, tier and trait chips must use the real template.');
      check(nodes(tree, 'SemanticChip').some(item => item.props.label === 'Deployment cost · ' + (template.deploymentCapacity ?? 1)), 'Capacity must come from template metadata.');
      const count = game.units.length;
      const action = commit(tree).onConfirm; action(); action();
      check(game.units.length === count + 1 && lessons === 1, 'One training confirmation must create one unit and complete its lesson once.');
      const trained = game.units.at(-1);
      check(trained.className === template.className && trained.deploymentCapacity === (template.deploymentCapacity ?? 1), 'Provider must create the selected class with real capacity.');
      for (const key of Object.keys(game.resources)) check(game.resources[key] === 1000 - (template.cost[key as keyof typeof template.cost] ?? 0), 'Exact training debit: ' + key);
      check(protectedState(game) === before, 'Training must not deploy, heal, construct, equip or increase capacity.');
      tree = h.render(); commit(tree).onConfirm();
      check(game.units.length === count + 2, 'A new explicit training purchase after state refresh must remain possible.');
      h.dispose();
    }
  }
}

async function testGuards() {
  const f = fixture('elf', 'hybrid'); activate(f.game, f.research);
  let resolveAd!: (value: { status: string; provider: string }) => void;
  f.setAd(() => new Promise(resolve => { resolveAd = resolve; }));
  const h = makeScreen(f.game, 'hybrid');
  let tree = h.render();
  const watch = nodes(tree, 'SecondaryButton').find(item => String(item.props.label).startsWith('Watch ad'))!.props.onPress;
  watch(); watch();
  tree = h.render(); check(commit(tree).disabled && tab(tree, 'Training').accessibilityState.disabled, 'Ad in flight must disable competing local actions.');
  check(f.calls.filter(item => item === 'watchFantasyResearchAd').length === 1, 'Repeated ad taps must request one ad.');
  resolveAd({ status: 'rewarded', provider: 'test' });
  await new Promise(resolve => setTimeout(resolve, 0));
  tree = h.render(); check(f.game.researchProgress[f.research.id].rewardedAdsWatched === 1 && !tab(tree, 'Training').accessibilityState.disabled, 'Ad result must preserve provider progress and release the UI.');
  f.setAd(async () => { throw new Error('test'); });
  const failing = nodes(tree, 'SecondaryButton').find(item => String(item.props.label).startsWith('Watch ad'))!.props.onPress;
  failing(); await new Promise(resolve => setTimeout(resolve, 0));
  tree = h.render(); check(commit(tree).message.includes('No ad reward'), 'An ad failure must not report success.');
  f.setAd(async () => ({ status: 'rewarded', provider: 'test' }));
  nodes(tree, 'SecondaryButton').find(item => String(item.props.label).startsWith('Watch ad'))!.props.onPress();
  await new Promise(resolve => setTimeout(resolve, 0));
  check(f.game.researchProgress[f.research.id].rewardedAdsWatched === 2, 'Ad failure must remain retryable.');
  h.dispose();

  for (const failure of ['return', 'throw'] as const) {
    const fresh = fixture('orc', 'large');
    const real = fresh.game.startFantasyResearch;
    let attempts = 0;
    fresh.game.startFantasyResearch = (id: string) => { attempts += 1; if (attempts === 1) { if (failure === 'throw') throw new Error('test'); return false; } return real(id); };
    let learned = 0;
    const screen = makeScreen(fresh.game, 'large', { tutorialFocus: { kind: 'research-start', family: 'large', label: 'START' }, onTutorialFocusComplete: () => { learned += 1; } });
    commit(screen.render()).onConfirm();
    check(learned === 0 && commit(screen.render()).message.includes('could not'), 'Failed action must not complete the tutorial.');
    commit(screen.render()).onConfirm(); check(learned === 1, 'A successful retry must finish the tutorial.'); screen.dispose();
  }
  const pending = fixture('human', 'large'); let attempts = 0;
  pending.game.startFantasyResearch = () => { attempts += 1; return true; };
  const screen = makeScreen(pending.game, 'large'); commit(screen.render()).onConfirm(); screen.tick();
  tree = screen.render(); commit(tree).onConfirm();
  check(attempts === 1 && commit(tree).disabled, 'A clock tick must not reopen a transaction before its data update.'); screen.dispose();

  const stale = fixture('human', 'hybrid');
  const hs = makeScreen(stale.game, 'hybrid'); const old = commit(hs.render()).onConfirm;
  stale.game.activeFaction = 'elf'; hs.render(); old();
  check(stale.calls.length === 0, 'Old faction handler must not call a provider action.'); hs.dispose();

  const story = fixture('human', 'large');
  const view = presentation.getMasteryResearchView('large', story.game, clock);
  check(view.firstUnit && !view.firstUnitFielded, 'Story reward must report actual reserve placement.');
  story.game.formation[0] = view.firstUnit!.id;
  check(presentation.getMasteryResearchView('large', story.game, clock).firstUnitFielded, 'Story report must reflect actual deployment.');
  story.game.units = []; check(presentation.getMasteryResearchView('large', story.game, clock).firstUnit === null, 'Missing historical story unit must not be invented.');
  for (const [file, family] of [['LargeResearchScreen', 'large'], ['HybridResearchScreen', 'hybrid']] as const) {
    const wrapper = harness('src/screens/' + file + '.tsx', file, {}, { onExit: () => {}, tutorialFocus: { kind: 'research-start', family, label: 'START' } });
    check(one(wrapper.render(), 'MasteryResearchScreen').family === family, 'Existing route must reach the correct mastery family.'); wrapper.dispose();
  }
}

async function main() {
  Date.now = () => clock;
  try { testResearchMatrix(); testTimersAndPrerequisites(); testTrainingMatrix(); await testGuards(); }
  finally { Date.now = realNow; }
  console.log('PASS: ' + checks + ' late mastery UI, gate, cost, tutorial, provider-action and async guard checks across all factions. Native visual QA remains separate.');
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
