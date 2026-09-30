import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';
import * as progression from '../src/game/progression';
import * as presentation from '../src/ui/researchPresentation';
import * as workshop from '../src/ui/masteryResearchPresentation';
import * as semantic from '../src/ui/semanticColors';
import { themes } from '../src/theme/themes';
import type { FactionId, ResourceWallet } from '../src/game/types';

// Actual screen TSX and provider action bodies; isolated native hosts are not visual/device QA.
type Element = { type: string | Function; props: Record<string, any> };
type Family = 'magic' | 'flying';
let checks = 0;
let clock = 1_800_000_000_000;
const wallet = (gold = 2000): ResourceWallet => ({ gold, wood: 2000, stone: 2000, iron: 2000, provisions: 2000 });
function check(value: unknown, message: string) { assert.ok(value, message); checks += 1; }
function nodes(tree: any, name: string): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, name));
  if (!tree?.type || !tree?.props) return [];
  const typeName = typeof tree.type === 'string' ? tree.type : tree.type.name;
  return [...(typeName === name ? [tree] : []), ...nodes(tree.props.children, name), ...nodes(tree.props.footer, name)];
}
function textOf(tree: any): string {
  if (tree === null || tree === undefined || typeof tree === 'boolean') return '';
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (Array.isArray(tree)) return tree.map(textOf).join('');
  return tree.props ? textOf(tree.props.children) : '';
}
function one(tree: any, name: string) { const found = nodes(tree, name); assert.equal(found.length, 1, 'Expected one ' + name); return found[0]!.props; }
function commit(tree: any) { return one(tree, 'DecisionCommit'); }
function secondary(tree: any, label: string) {
  const button = nodes(tree, 'SecondaryButton').find(item => item.props.label === label);
  assert.ok(button, 'Missing secondary action: ' + label); return button.props;
}
function tab(tree: any, label: string) {
  const control = nodes(tree, 'Pressable').find(item => item.props.accessibilityLabel === label);
  assert.ok(control, 'Missing tab: ' + label); return control.props;
}
function option(tree: any, title: string) {
  const control = nodes(tree, 'DecisionOption').find(item => item.props.title === title);
  assert.ok(control, 'Missing option: ' + title); return control.props;
}
function selectedState(tree: any) {
  const selected = nodes(tree, 'DecisionOption').find(item => item.props.selected);
  return one(selected ?? tree, 'ResearchStateChip').state;
}
function harness(file: string, exported: string, game: any, props: Record<string, any> = {}, theme = themes.original) {
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
      const index = cursor++; if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial;
      return [hooks[index], (next: any) => { hooks[index] = typeof next === 'function' ? next(hooks[index]) : next; }];
    },
    useRef(initial: any) { const index = cursor++; if (!(index in hooks)) hooks[index] = { current: initial }; return hooks[index]; },
    useEffect(effect: () => any) { const index = cursor++; if (!(index in hooks)) { hooks[index] = true; const cleanup = effect(); if (cleanup) cleanups.push(cleanup); } }
  };
  react.default = react;
  const hosts = (names: string[]) => Object.fromEntries(names.map(name => {
    const fn = (values: any) => jsx(name, values); Object.defineProperty(fn, 'name', { value: name }); return [name, fn];
  }));
  const cache = new Map<string, any>();
  function load(filename: string): any {
    const absolute = resolve(filename);
    if (cache.has(absolute)) return cache.get(absolute);
    const result = ts.transpileModule(readFileSync(absolute, 'utf8'), { fileName: absolute, reportDiagnostics: true, compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true
    } });
    assert.equal((result.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
    const mod = { exports: {} as any };
    const requireLocal = (request: string): any => {
      if (request === 'react') return react;
      if (request === 'react-native') return { View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: { create: (styles: any) => styles } };
      if (request.endsWith('/GameProvider')) return { useGame: () => game };
      if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme }) };
      if (request.endsWith('/masteryResearchPresentation')) return workshop;
      if (request.endsWith('/semanticColors')) return semantic;
      if (request.endsWith('/researchPresentation')) return presentation;
      if (request.endsWith('/DecisionUI')) return hosts(['DecisionLayout', 'DecisionCommit', 'DecisionIntro', 'DecisionOption', 'DecisionStats']);
      if (request.endsWith('/components')) return hosts(['GameCard', 'PrimaryButton', 'SecondaryButton']);
      if (request.endsWith('/gameArt')) return hosts(['FactionCrest', 'UnitSprite']);
      if (request.endsWith('/TutorialFocus')) return hosts(['TutorialFocus']);
      if (['/MasteryResearchScreen', '/ResearchUI', '/SemanticUI'].some(suffix => request.endsWith(suffix))) return load(resolve(dirname(absolute), request + '.tsx'));
      throw new Error('Unexpected research dependency: ' + request);
    };
    new Function('require', 'module', 'exports', 'setInterval', 'clearInterval', result.outputText)(requireLocal, mod, mod.exports,
      (fn: () => void) => { timers.add(fn); return fn; }, (fn: () => void) => timers.delete(fn));
    cache.set(absolute, mod.exports); return mod.exports;
  }
  const component = load(file)[exported];
  return {
    props,
    render() {
      cursor = 0; const tree = component(props);
      // Follow the real legacy-route wrapper into the shared screen, preserving its actual props.
      return typeof tree?.type === 'function' && tree.type.name === 'MasteryResearchScreen' ? tree.type(tree.props) : tree;
    },
    tick() { timers.forEach(fn => fn()); },
    dispose() { cleanups.forEach(fn => fn()); }
  };
}

const provider = ts.createSourceFile('GameProvider.tsx', readFileSync('src/game/GameProvider.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const actionSource = new Map<string, string>();
function providerAction(name: string, scope: Record<string, any>) {
  let code = actionSource.get(name);
  if (!code) {
    const found: ts.Expression[] = [];
    const visit = (node: ts.Node) => { if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer) found.push(node.initializer); ts.forEachChild(node, visit); };
    visit(provider); assert.equal(found.length, 1, 'Expected one provider action ' + name);
    code = ts.transpileModule('(' + found[0]!.getText(provider) + ')', { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText.trim().replace(/;$/, '');
    actionSource.set(name, code);
  }
  return new Function(...Object.keys(scope), 'return ' + code)(...Object.values(scope));
}
function fixture(faction: FactionId, family: Family) {
  const research = progression.researchDefinitions.filter(item => item.faction === faction && item.family === family);
  const templates = progression.getFantasyRecruitTemplates(faction, family);
  check(research.length > 0 && templates.length > 0, 'Use authored research and recruitment data.');
  const calls: Array<{ action: string; id: string }> = [];
  let exited = 0, learned = 0;
  let ad: () => Promise<{ status: string; provider: string }> = async () => ({ status: 'rewarded', provider: 'test' });
  const game: any = {
    activeFaction: faction, chapterNumber: research[0]!.chapterRequired, fantasyProgressionChapter: research[0]!.chapterRequired,
    completedStoryGates: progression.familyUnlocks.filter(item => item.faction === faction).map(item => item.storyGateId),
    researchProgress: {}, unlockedFantasyClasses: [], hybridPrerequisitesMet: true,
    units: progression.fantasyStoryRewardUnits.filter(item => item.faction === faction).map(item => ({ ...item })),
    formation: Array(9).fill(null), resources: wallet(), sharedProgress: { gems: 100 }, fantasyRecruitSerial: 0,
    armyReadiness: 52, buildingLevels: { forge: 3 }, equipmentInventory: [], unitEquipment: {}, activeSquadCap: 6
  };
  for (const f of ['magic', 'flying', 'large', 'hybrid'] as const) {
    game[f + 'FamilyUnlock'] = progression.familyUnlocks.find(item => item.faction === faction && item.family === f);
    game[f + 'ResearchDefinitions'] = progression.researchDefinitions.filter(item => item.faction === faction && item.family === f);
    game[f === 'magic' ? 'fantasyRecruitOptions' : f + 'RecruitOptions'] = progression.getFantasyRecruitTemplates(faction, f);
  }
  Object.defineProperty(game, 'gems', { enumerable: true, get: () => game.sharedProgress.gems });
  for (const [setter, field] of Object.entries({ setResearchProgress: 'researchProgress', setUnlockedFantasyClasses: 'unlockedFantasyClasses', setSharedProgress: 'sharedProgress', setUnits: 'units', setResources: 'resources', setFantasyRecruitSerial: 'fantasyRecruitSerial' })) {
    game[setter] = (next: any) => { game[field] = typeof next === 'function' ? next(game[field]) : next; };
  }
  const scope = (): any => ({
    ...game, ...progression, factionFantasyResearchDefinitions: progression.researchDefinitions.filter(item => item.faction === game.activeFaction),
    canAfford: (w: any, cost: any) => Object.entries(cost).every(([key, amount]) => w[key] >= (amount as number)),
    payCost: (w: any, cost: any) => Object.fromEntries(Object.entries(w).map(([key, amount]) => [key, (amount as number) - (cost[key] ?? 0)])),
    claimRewardedAd: () => ad(),
    getRemainingResearchHours: (r: any, p: any) => providerAction('getRemainingResearchHours', { getResearchRemainingHours: progression.getResearchRemainingHours })(r, p),
    markFantasyResearchComplete: (r: any) => providerAction('markFantasyResearchComplete', game)(r)
  });
  for (const action of ['startFantasyResearch', 'claimFantasyResearch', 'finishFantasyResearchWithGems', 'watchFantasyResearchAd', 'recruitFantasyUnit']) {
    game[action] = (id: string) => { calls.push({ action, id }); return providerAction(action, scope())(id); };
  }
  const name = family === 'magic' ? 'FantasyResearchScreen' : 'FlyingResearchScreen';
  const props: Record<string, any> = { onExit: () => { exited += 1; }, onTutorialFocusComplete: () => { learned += 1; } };
  const h = harness('src/screens/' + name + '.tsx', name, game, props);
  return { game, h, props, research, templates, calls, exited: () => exited, learned: () => learned, setAd: (fn: typeof ad) => { ad = fn; } };
}
function protectedState(game: any) { return JSON.stringify([game.formation, game.armyReadiness, game.buildingLevels, game.equipmentInventory, game.unitEquipment, game.activeSquadCap]); }
function choose(h: ReturnType<typeof harness>, name: string) { let tree = h.render(); const control = nodes(tree, 'DecisionOption').find(item => item.props.title === name); if (control) control.props.onSelect(); return h.render(); }
function activate(game: any, r: any) { game.researchProgress = { [r.id]: { startedAt: clock, rewardedAdsWatched: 0, completed: false } }; }

function testResearchActions() {
  for (const faction of ['human', 'elf', 'orc'] as const) for (const family of ['magic', 'flying'] as const) {
    for (const r of progression.researchDefinitions.filter(item => item.family === family && item.faction === faction)) {
      const f = fixture(faction, family), { game, h } = f;
      f.props.tutorialFocus = { kind: 'research-start', family, label: 'START' };
      game.completedStoryGates = [];
      let tree = h.render();
      check(commit(tree).disabled && selectedState(tree) === 'locked', 'Story gate must remain locked regardless of Gem balance.');
      commit(tree).onConfirm(); check(f.calls.length === 0 && f.learned() === 0, 'Locked handler cannot start research or finish a lesson.');
      game.completedStoryGates = [r.storyGateId]; tree = choose(h, r.name);
      check(selectedState(tree) === 'available' && f.calls.length === 0, 'Choosing research previews it without a transaction.');
      check(nodes(tree, 'TutorialFocus').some(item => item.props.active), 'Available research needs its real tutorial target.');
      const before = JSON.stringify([game.resources, game.units, protectedState(game)]);
      const start = commit(tree).onConfirm; start(); start();
      check(f.calls.length === 1 && f.calls[0]!.id === r.id && f.learned() === 1, 'Start the selected doctrine once, with one tutorial completion.');
      tree = h.render(); check(selectedState(tree) === 'active' && commit(tree).disabled, 'Waiting does not force an ad or paid action.');
      game.sharedProgress = { gems: 0 }; tree = h.render();
      check(secondary(tree, 'Review Gem finish').disabled, 'Unaffordable Gem finish must be disabled.');
      secondary(tree, 'Review Gem finish').onPress(); check(f.calls.length === 1, 'Disabled Gem review cannot purchase.');
      game.sharedProgress = { gems: 100 }; tree = h.render();
      const price = one(tree, 'ResearchGemCost').cost;
      check(price === progression.getResearchGemFinishCost(r, r.durationHours), 'Quote uses the current progression calculation.');
      secondary(tree, 'Review Gem finish').onPress(); tree = h.render();
      check(game.gems === 100 && commit(tree).label.startsWith('Spend'), 'Opening review is not a purchase.');
      secondary(tree, 'Cancel Gem finish').onPress(); check(game.gems === 100, 'Cancelling review is free.');
      tree = h.render(); secondary(tree, 'Review Gem finish').onPress(); tree = h.render();
      const spend = commit(tree).onConfirm; spend(); spend();
      check(game.gems === 100 - price && game.researchProgress[r.id].completed, 'Paid completion charges exactly once.');
      check(r.unlocksClasses.every(name => game.unlockedFantasyClasses.includes(name)), 'Selected research unlocks its actual classes.');
      tree = h.render(); check(selectedState(tree) === 'complete' && commit(tree).title === r.name, 'Completion stays on the selected doctrine.');
      check(nodes(tree, 'ResearchGemCost').length === 0, 'Completed doctrine must not expose another Gem quote.');
      check(JSON.stringify([game.resources, game.units, protectedState(game)]) === before, 'Research must not grant, equip, deploy, heal or construct.');
      commit(tree).onConfirm(); tree = h.render();
      check(tab(tree, 'Training').accessibilityState.selected, 'Completed doctrine opens the Training tab.');
      const picked = nodes(tree, 'DecisionOption').find(item => item.props.selected)!.props.title;
      check(r.unlocksClasses.includes(picked), 'Review training selects a class unlocked by this doctrine, not an unrelated locked class.');
      secondary(tree, 'Return to Army').onPress(); check(f.exited() === 1, 'Preserve Return navigation.');
      h.dispose();
    }
  }
}

function testTraining() {
  for (const faction of ['human', 'elf', 'orc'] as const) for (const family of ['magic', 'flying'] as const) {
    for (const template of progression.getFantasyRecruitTemplates(faction, family)) {
      const f = fixture(faction, family), { game, h } = f;
      f.props.tutorialFocus = { kind: 'research-train', family, label: 'TRAIN' };
      let tree = choose(h, template.className);
      check(tab(tree, 'Training').accessibilityState.selected && commit(tree).disabled, 'Training lesson opens its tab but does not unlock a class.');
      commit(tree).onConfirm(); check(f.calls.length === 0, 'Locked training handler is guarded.');
      game.unlockedFantasyClasses = [template.className]; game.resources = wallet(0); tree = h.render();
      check(commit(tree).disabled && Boolean(commit(tree).warning), 'Show and enforce exact shortages.');
      game.resources = wallet(); tree = h.render();
      assert.deepEqual(one(tree, 'ResearchCosts').cost, template.cost);
      check(nodes(tree, 'DecisionStats').every(item => item.props.presentation === 'absolute'), 'Raw recruitment stats remain neutral.');
      check(nodes(tree, 'UnitBadges').some(item => item.props.role === template.role && item.props.tier === template.tier && item.props.battleTags === template.battleTags), 'Use actual role, tier and trait data.');
      check(nodes(tree, 'SemanticChip').some(item => item.props.label === 'Deployment cost · ' + (template.deploymentCapacity ?? 1)), 'Use authored capacity, not the Large-unit default.');
      const before = protectedState(game), count = game.units.length;
      const train = commit(tree).onConfirm; train(); train();
      check(game.units.length === count + 1 && f.learned() === 1, 'One stale-event training confirmation creates one squad and completes the lesson once.');
      check(game.units.at(-1).className === template.className && game.units.at(-1).deploymentCapacity === (template.deploymentCapacity ?? 1), 'Create the selected class with its original deployment cost.');
      for (const key of Object.keys(game.resources)) check(game.resources[key] === 2000 - (template.cost[key as keyof typeof template.cost] ?? 0), 'Exact training debit: ' + key);
      check(protectedState(game) === before, 'Training cannot change equipment, formation, Readiness, buildings or capacity.');
      tree = h.render(); commit(tree).onConfirm(); check(game.units.length === count + 2, 'A fresh explicit purchase after state update remains possible.');
      f.props.tutorialFocus = { kind: 'research-train', family: family === 'magic' ? 'flying' : 'magic', label: 'OTHER' };
      tree = h.render(); check(!nodes(tree, 'TutorialFocus').some(item => item.props.active), 'Do not highlight a different family lesson.');
      const lessons = f.learned(); commit(tree).onConfirm(); check(f.learned() === lessons, 'Another family lesson cannot complete from this action.');
      h.dispose();
    }
  }
}

function testSelectionsAndTimers() {
  for (const faction of ['human', 'elf', 'orc'] as const) {
    const f = fixture(faction, 'magic'), { game, h, research: [first, second] } = f;
    assert.ok(first && second);
    let tree = h.render(); const oldStart = commit(tree).onConfirm;
    tree = choose(h, second.name); oldStart();
    check(f.calls.length === 0 && commit(tree).title === second.name, 'Old research selection cannot start after selecting a different branch.');
    commit(tree).onConfirm(); tree = choose(h, first.name);
    check(commit(tree).disabled && commit(tree).warning.includes(second.name), 'Blocked branch names the actual active doctrine.');
    check(one(nodes(tree, 'DecisionOption').find(item => item.props.title === first.name), 'ResearchStateChip').state === 'locked', 'Blocked research must not be falsely labeled Available.');
    tree = choose(h, second.name); secondary(tree, 'Review Gem finish').onPress(); tree = h.render();
    const oldSpend = commit(tree).onConfirm; tree = choose(h, first.name); oldSpend();
    check(game.gems === 100 && f.calls.length === 1, 'A Gem quote cannot be reused across branches.');
    const external = game.flyingResearchDefinitions[0]; activate(game, external);
    tree = choose(h, first.name);
    check(commit(tree).disabled && commit(tree).warning.includes(external.name), 'Another family’s research also blocks starting and is named.');
    check(!workshop.getMasteryResearchView('magic', game, clock, 'missing-id').research, 'Invalid explicit ID must not select a different doctrine.');
    activate(game, first); tree = choose(h, first.name); secondary(tree, 'Review Gem finish').onPress(); tree = h.render();
    const expires = commit(tree).onConfirm;
    clock += first.durationHours * 3_600_000 + 1; expires();
    check(game.gems === 100 && !game.researchProgress[first.id].completed, 'Expired paid handler cannot charge or silently claim.');
    h.tick(); tree = h.render();
    check(selectedState(tree) === 'claimable' && commit(tree).label.includes('Free') && nodes(tree, 'ResearchGemCost').length === 0, 'Free completion replaces paid controls.');
    const free = commit(tree).onConfirm; free(); free();
    check(game.gems === 100 && game.researchProgress[first.id].completed, 'Free claim completes once with no Gems.');
    h.dispose();
  }
  const f = fixture('human', 'flying');
  activate(f.game, f.research[0]); f.game.researchProgress[f.research[0]!.id].startedAt = 0;
  check(workshop.getMasteryResearchView('flying', f.game, clock).visualState === 'claimable', 'Timestamp zero is a real started timer.');
  const before = JSON.stringify(f.game.units);
  f.game.units = []; const view = workshop.getMasteryResearchView('flying', f.game, clock);
  check(view.storyUnlocked && !view.firstUnit, 'Missing story unit is not invented or re-granted.');
  f.game.units = JSON.parse(before); f.game.formation[0] = f.game.flyingFamilyUnlock.firstStoryRewardUnitId;
  check(workshop.getMasteryResearchView('flying', f.game, clock).firstUnitFielded, 'Story panel reflects actual formation placement.'); f.h.dispose();
}

async function testFailuresAndGuidance() {
  for (const family of ['magic', 'flying'] as const) for (const failure of ['return', 'throw'] as const) {
    const f = fixture('elf', family), { game, h } = f;
    f.props.tutorialFocus = { kind: 'research-start', family, label: 'START' };
    const real = game.startFantasyResearch; let attempts = 0;
    game.startFantasyResearch = (id: string) => { attempts += 1; if (attempts === 1) { if (failure === 'throw') throw new Error('test'); return false; } return real(id); };
    commit(h.render()).onConfirm(); check(f.learned() === 0 && commit(h.render()).message.includes('could not'), 'Failed start retains tutorial and shows truthful feedback.');
    commit(h.render()).onConfirm(); check(f.learned() === 1, 'Successful retry completes start lesson.');
    f.props.tutorialFocus = { kind: 'research-train', family, label: 'TRAIN' };
    game.unlockedFantasyClasses = [f.templates[0]!.className];
    let tree = h.render(); check(tab(tree, 'Training').accessibilityState.selected, 'New training lesson changes tabs even after an earlier research selection.');
    const recruit = game.recruitFantasyUnit; game.recruitFantasyUnit = () => false;
    commit(tree).onConfirm(); check(f.learned() === 1, 'Rejected recruitment does not complete training guidance.');
    game.recruitFantasyUnit = recruit; tree = h.render(); commit(tree).onConfirm(); check(f.learned() === 2, 'Training retry completes guidance.');
    h.dispose();
  }
  const pending = fixture('human', 'flying'); let attempts = 0;
  pending.game.startFantasyResearch = () => { attempts += 1; return true; };
  commit(pending.h.render()).onConfirm(); pending.h.tick();
  let tree = pending.h.render(); commit(tree).onConfirm();
  check(attempts === 1 && commit(tree).disabled, 'A timer refresh does not release a pending transaction.'); pending.h.dispose();

  const stale = fixture('human', 'magic'); const old = commit(stale.h.render()).onConfirm;
  stale.game.activeFaction = 'orc'; stale.h.render(); old();
  check(stale.calls.length === 0, 'An outdated faction handler cannot transact.'); stale.h.dispose();
  const unmounted = fixture('human', 'flying'); const abandoned = commit(unmounted.h.render()).onConfirm;
  unmounted.h.dispose(); abandoned(); check(unmounted.calls.length === 0, 'Unmounted handlers cannot transact.');

  const f = fixture('orc', 'magic'); activate(f.game, f.research[0]);
  let resolveAd!: (result: { status: string; provider: string }) => void;
  f.setAd(() => new Promise(resolve => { resolveAd = resolve; }));
  tree = f.h.render();
  const adButton = (current: any) => nodes(current, 'SecondaryButton').find(item => String(item.props.label).startsWith('Watch ad'))!.props;
  const watch = adButton(tree).onPress; watch(); watch();
  tree = f.h.render();
  check(f.calls.length === 1 && commit(tree).disabled && tab(tree, 'Training').accessibilityState.disabled, 'One in-flight ad blocks repeated requests and competing actions.');
  option(tree, f.research[1]!.name).onSelect(); secondary(tree, 'Return to Army').onPress();
  check(f.exited() === 0 && commit(f.h.render()).title === f.research[0]!.name, 'In-flight ad cannot switch doctrine or use local Return.');
  resolveAd({ status: 'rewarded', provider: 'test' }); await new Promise(resolve => setTimeout(resolve, 0));
  check(f.game.researchProgress[f.research[0]!.id].rewardedAdsWatched === 1, 'Reward uses the provider’s actual research update.');
  for (const fail of ['unavailable', 'throw']) {
    f.setAd(async () => { if (fail === 'throw') throw new Error('test'); return { status: 'unavailable', provider: 'none' }; });
    tree = f.h.render(); adButton(tree).onPress(); await new Promise(resolve => setTimeout(resolve, 0));
    tree = f.h.render(); check(commit(tree).message.includes('No ad reward') && !tab(tree, 'Training').accessibilityState.disabled, 'Ad failure has honest feedback and releases controls.');
  }
  f.setAd(async () => ({ status: 'rewarded', provider: 'test' }));
  adButton(f.h.render()).onPress(); await new Promise(resolve => setTimeout(resolve, 0));
  check(f.game.researchProgress[f.research[0]!.id].rewardedAdsWatched === 2, 'Failed ads remain retryable.'); f.h.dispose();
}

function testPresentation() {
  const expected = [[0, 'Ready'], [-1, 'Ready'], [0.00001, '1 min'], [0.5, '30 min'], [1, '1h'], [1.5, '1h 30m'], [1.999, '2h'], [23.9999, '24h']] as const;
  for (const [hours, display] of expected) check(presentation.formatResearchDuration(hours) === display, 'Rounded duration mismatch: ' + hours);
  check(presentation.formatResearchDuration(NaN) === 'Time unavailable', 'Unknown time cannot imply completion.');
  const available = wallet(65), costs = { gold: 90, provisions: 20, iron: 0 };
  const before = JSON.stringify({ available, costs }), rows = presentation.researchCostRows(costs, available);
  check(rows.length === 2 && rows[0]!.missing === 25 && rows[1]!.missing === 0, 'Exact deficits; zero costs omitted.');
  check(JSON.stringify({ available, costs }) === before, 'Costs cannot mutate recipe or wallet.');
  check(presentation.researchCostRows({ gold: 1 }, { ...available, gold: NaN })[0]!.missing === null, 'Unknown balance cannot display Enough.');
  for (const theme of Object.values(themes)) {
    for (const item of Object.values(presentation.researchStatePresentation)) {
      const chip = semantic.semanticChipColors(theme, item.tone);
      check(semantic.contrastRatio(chip.text, chip.background) >= 4.5, 'State text contrast: ' + theme.name);
    }
    for (const tone of ['violet', 'cyan', 'currency', 'positive', 'warning'] as const) for (const surface of ['surface1', 'surface2', 'surface3'] as const) {
      check(semantic.contrastRatio(semantic.semanticColor(theme, tone), theme.colors[surface]) >= 4.5, 'Research foreground contrast: ' + theme.name + '/' + surface);
    }
  }
  const template = progression.getFantasyRecruitTemplates('human', 'flying')[0]!;
  let trained = 0; const unchanged = JSON.stringify(template);
  const card = harness('src/ui/ResearchUI.tsx', 'ResearchRecruitCard', {}, { template, unlocked: true, affordable: false, wallet: available, onTrain: () => { trained += 1; } }).render();
  const badges = one(card, 'UnitBadges');
  check(badges.role === template.role && badges.tier === template.tier && badges.battleTags === template.battleTags, 'Shared cards retain authored metadata.');
  check(nodes(card, 'RarityChip').length === 0 && !('rarity' in badges), 'Do not invent rarity from tier.');
  check(one(card, 'PrimaryButton').disabled && trained === 0 && JSON.stringify(template) === unchanged, 'Rendering must not train or mutate data.');
  check(one(card, 'DecisionStats').items.every((item: any) => item.presentation === undefined || item.presentation === 'absolute'), 'Base stats are not bonuses.');
  const ready = harness('src/ui/ResearchUI.tsx', 'ResearchRecruitCard', {}, { template, unlocked: true, affordable: true, wallet: wallet(), onTrain: () => { trained += 1; } }).render();
  one(ready, 'PrimaryButton').onPress(); check(trained === 1, 'Shared card callback stays explicit.');
  const costTree = harness('src/ui/ResearchUI.tsx', 'ResearchCosts', {}, { cost: costs, wallet: available }).render();
  check(textOf(costTree).includes('90 Gold') && textOf(costTree).includes('Have 65'), 'Cost and balance remain separately visible.');
  check(nodes(costTree, 'SemanticText').some(item => textOf(item) === '25 short' && item.props.tone === 'warning'), 'Shortfall has text and color.');
  check(nodes(costTree, 'SemanticText').some(item => textOf(item) === 'Enough' && item.props.tone === 'positive'), 'Sufficiency has text and color.');
  const gemTree = harness('src/ui/ResearchUI.tsx', 'ResearchGemCost', {}, { cost: 12, balance: 3 }).render();
  check(nodes(gemTree, 'SemanticChip').some(item => item.props.label === 'Need 9 more Gems'), 'Exact Gem shortfall.');
  const active = harness('src/ui/ResearchUI.tsx', 'ResearchStateChip', {}, { state: 'active', remainingHours: 1.999 }).render();
  check(one(active, 'SemanticChip').label === 'Researching · 2h', 'State includes valid readable time.');
  const unlocks = harness('src/ui/ResearchUI.tsx', 'ResearchUnlocks', {}, { classes: [template.className, 'Unknown Class'], templates: [template] }).render();
  const chips = nodes(unlocks, 'SemanticChip');
  check(chips[0]!.props.tone === semantic.rolePresentation[template.role].tone && chips[1]!.props.tone === 'neutral', 'Unknown class cannot gain an invented role.');
}

async function main() {
  const realNow = Date.now; Date.now = () => clock;
  try { testPresentation(); testResearchActions(); testTraining(); testSelectionsAndTimers(); await testFailuresAndGuidance(); }
  finally { Date.now = realNow; }
  console.log('PASS: ' + checks + ' unified research UI, color, multi-doctrine, timer, spending, training, tutorial and real-provider checks across Humans, Elves and Orcs. Native visual QA remains separate.');
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
