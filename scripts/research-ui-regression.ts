import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';
import * as progression from '../src/game/progression';
import * as presentation from '../src/ui/researchPresentation';
import * as semantic from '../src/ui/semanticColors';
import { themes } from '../src/theme/themes';
import type { FantasyRecruitTemplate, ResearchDefinition } from '../src/game/progression';
import type { FactionId, ResourceWallet } from '../src/game/types';

// Exercises real TSX using isolated native hosts/provider state. Not native visual validation.
type Element = { type: string | Function; props: Record<string, any> };
let checks = 0;
function check(condition: unknown, message: string) { assert.ok(condition, message); checks += 1; }
function nodes(tree: any, name: string): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, name));
  if (!tree || typeof tree !== 'object' || !tree.type || !tree.props) return [];
  const typeName = typeof tree.type === 'string' ? tree.type : tree.type.name;
  return [...(typeName === name ? [tree] : []), ...nodes(tree.props.children, name), ...nodes(tree.props.status, name)];
}
function textOf(tree: any): string {
  if (tree === null || tree === undefined || typeof tree === 'boolean') return '';
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (Array.isArray(tree)) return tree.map(textOf).join('');
  return tree.props ? textOf(tree.props.children) : '';
}
function harness(file: string, exported: string, game: Record<string, any>, props: Record<string, any> = {}, theme = themes.original) {
  let cursor = 0;
  const hooks: any[] = [];
  const jsx = (type: Element['type'], supplied: any, ...children: any[]): Element => ({ type, props: { ...(supplied ?? {}), ...(children.length ? { children: children.length === 1 ? children[0] : children } : {}) } });
  const react: any = {
    __esModule: true, createElement: jsx, Fragment: 'Fragment',
    useState(initial: any) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial;
      return [hooks[index], (next: any) => { hooks[index] = typeof next === 'function' ? next(hooks[index]) : next; }];
    },
    useMemo: (fn: Function) => fn(), useEffect: () => undefined,
    useRef(initial: any) { const index = cursor++; if (!(index in hooks)) hooks[index] = { current: initial }; return hooks[index]; }
  };
  react.default = react;
  const host = (name: string) => {
    const component = (properties: any) => jsx(name, properties);
    Object.defineProperty(component, 'name', { value: name });
    return component;
  };
  const hosts = Object.fromEntries(['GameCard', 'MetricTile', 'PrimaryButton', 'ScreenHero', 'SecondaryButton', 'SectionTitle', 'StatusPill'].map(name => [name, host(name)]));
  const cache = new Map<string, any>();
  function load(filename: string): any {
    const absolute = resolve(filename);
    if (cache.has(absolute)) return cache.get(absolute);
    const result = ts.transpileModule(readFileSync(absolute, 'utf8'), {
      fileName: absolute, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true }
    });
    assert.equal((result.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
    const mod = { exports: {} as any };
    cache.set(absolute, mod.exports);
    const requireLocal = (request: string): any => {
      if (request === 'react') return react;
      if (request === 'react-native') return { ScrollView: 'ScrollView', Pressable: 'Pressable', Text: 'Text', View: 'View', StyleSheet: { create: (value: any) => value }, useWindowDimensions: () => ({ width: 360, height: 800, fontScale: 1 }) };
      if (request.endsWith('/GameProvider')) return { useGame: () => game };
      if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme }) };
      if (request.endsWith('/progression')) return progression;
      if (request.endsWith('/researchPresentation')) return presentation;
      if (request.endsWith('/semanticColors')) return semantic;
      if (request.endsWith('/components')) return hosts;
      if (request.endsWith('/gameArt')) return { UnitSprite: host('UnitSprite') };
      if (request.endsWith('/TutorialFocus')) return { TutorialFocus: host('TutorialFocus') };
      if (request.endsWith('/DecisionUI')) return { DecisionStats: host('DecisionStats') };
      if (request.endsWith('/ResearchUI') || request.endsWith('/SemanticUI')) return load(resolve(dirname(absolute), request + '.tsx'));
      throw new Error('Unexpected research UI dependency: ' + request);
    };
    new Function('require', 'module', 'exports', result.outputText)(requireLocal, mod, mod.exports);
    cache.set(absolute, mod.exports);
    return mod.exports;
  }
  const component = load(file)[exported];
  return { render() { cursor = 0; return component(props); } };
}

const wallet = (gold = 100): ResourceWallet => ({ gold, wood: 100, stone: 100, iron: 100, provisions: 100 });
const fixedNow = 1_790_679_000_000;
function fixture(faction: FactionId, family: 'magic' | 'flying') {
  const research: ResearchDefinition = {
    id: faction + '_' + family, faction, family, name: family + ' doctrine', chapterRequired: family === 'magic' ? 4 : 5,
    storyGateId: family + '_gate', durationHours: 24, baseGemFinishCost: 30, rewardedAdsToComplete: 3,
    unlocksClasses: ['Specialist'], description: 'Authored research description.'
  };
  const template: FantasyRecruitTemplate = {
    id: faction + '_template', researchId: research.id, faction, family, className: 'Specialist', role: 'ranged',
    tier: 3, level: 10, hp: 90, attack: 25, armor: 8, speed: 14,
    battleTags: family === 'magic' ? ['ground', 'ranged', 'magic'] : ['flying', 'ranged', 'beast'], cost: { gold: 90, provisions: 20 }
  };
  const calls: Array<[string, string]> = [];
  let exited = 0;
  let tutorialCompleted = 0;
  const unlock = { buildingName: 'Institution', storyGateId: research.storyGateId, firstStoryRewardUnitId: 'first' };
  const game: any = {
    activeFaction: faction, chapterNumber: 2, units: [], resources: wallet(), gems: 0,
    completedStoryGates: [], researchProgress: {}, unlockedFantasyClasses: [],
    magicFamilyUnlock: unlock, flyingFamilyUnlock: unlock,
    magicResearchDefinitions: [research], flyingResearchDefinitions: [research], fantasyRecruitOptions: [template], flyingRecruitOptions: [template],
    startFantasyResearch: (id: string) => { calls.push(['start', id]); return game.actionSuccess !== false; },
    claimFantasyResearch: (id: string) => { calls.push(['claim', id]); return true; },
    watchFantasyResearchAd: async (id: string) => { calls.push(['ad', id]); return { status: 'rewarded' }; },
    finishFantasyResearchWithGems: (id: string) => { calls.push(['gems', id]); return true; },
    recruitFantasyUnit: (id: string) => { calls.push(['train', id]); return game.actionSuccess !== false; }
  };
  const screen = family === 'magic' ? 'FantasyResearchScreen' : 'FlyingResearchScreen';
  const props: Record<string, any> = { onExit: () => { exited += 1; }, onTutorialFocusComplete: () => { tutorialCompleted += 1; } };
  const h = harness('src/screens/' + screen + '.tsx', screen, game, props);
  return { h, props, game, research, template, calls, exited: () => exited, tutorialCompleted: () => tutorialCompleted };
}
function enabledPress(node: Element) { check(!node.props.disabled, 'Test commits an enabled control.'); node.props.onPress(); }

async function testScreens() {
  for (const faction of ['human', 'elf', 'orc'] as const) {
    for (const family of ['magic', 'flying'] as const) {
      const { h, game, research, template, calls, exited } = fixture(faction, family);
      let tree = h.render();
      check(calls.length === 0, 'Rendering colors must never call a purchase or research action.');
      check(nodes(tree, 'ResearchStateChip')[0]!.props.state === 'locked', 'The story gate must remain locked.');
      check(nodes(tree, 'PrimaryButton').find(node => node.props.label.startsWith('Start'))!.props.disabled, 'Locked research cannot be started.');
      check(!nodes(tree, 'ResearchRecruitCard')[0]!.props.unlocked, 'A preview must not unlock a class.');
      game.completedStoryGates = [research.storyGateId]; game.chapterNumber = research.chapterRequired;
      tree = h.render();
      check(nodes(tree, 'ResearchStateChip')[0]!.props.state === 'available', 'Unstarted unlocked research must show Available.');
      enabledPress(nodes(tree, 'PrimaryButton').find(node => node.props.label.startsWith('Start'))!);
      check(calls.at(-1)?.[0] === 'start' && calls.at(-1)?.[1] === research.id, 'Start must preserve the provider action and ID.');
      game.researchProgress = { [research.id]: { startedAt: fixedNow - 60_000, completed: false, rewardedAdsWatched: 0 } };
      tree = h.render();
      check(nodes(tree, 'ResearchStateChip')[0]!.props.state === 'active', 'Started research must show Researching.');
      const price = nodes(tree, 'ResearchGemCost')[0]!.props;
      const remaining = progression.getResearchRemainingHours(research, 1 / 60, 0);
      check(price.cost === progression.getResearchGemFinishCost(research, remaining) && price.balance === 0, 'Price must come from the existing cost helper.');
      check(nodes(tree, 'SecondaryButton').find(node => node.props.label.startsWith('Finish'))!.props.disabled, 'Insufficient Gems must disable paid completion.');
      enabledPress(nodes(tree, 'PrimaryButton').find(node => node.props.label.startsWith('Watch Ad'))!);
      await Promise.resolve();
      check(calls.at(-1)?.[0] === 'ad', 'Optional ad action must preserve its provider call.');
      game.gems = 100; tree = h.render();
      enabledPress(nodes(tree, 'SecondaryButton').find(node => node.props.label.startsWith('Finish'))!);
      check(calls.at(-1)?.[0] === 'gems', 'Explicit Gem action must preserve its provider call.');
      game.researchProgress[research.id] = { startedAt: fixedNow - 25 * 60 * 60 * 1000, completed: false, rewardedAdsWatched: 0 };
      tree = h.render();
      check(nodes(tree, 'ResearchStateChip')[0]!.props.state === 'claimable', 'Elapsed research is ready, not already claimed.');
      check(nodes(tree, 'ResearchGemCost').length === 0, 'Free completion must not carry redundant paid-finish copy.');
      enabledPress(nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Complete Research')!);
      check(calls.at(-1)?.[0] === 'claim', 'Claim must preserve the original completion action.');
      game.researchProgress[research.id].completed = true; tree = h.render();
      check(nodes(tree, 'ResearchStateChip')[0]!.props.state === 'complete', 'Claimed research must show Complete.');
      check(nodes(tree, 'SecondaryButton').find(node => node.props.label === 'Research Complete')!.props.disabled, 'Completed research must not offer another purchase.');
      game.unlockedFantasyClasses = [template.className]; game.resources = wallet(65); tree = h.render();
      let card = nodes(tree, 'ResearchRecruitCard')[0]!.props;
      check(card.unlocked && !card.affordable, 'Research and affordability remain separate.');
      check(card.template === template && card.wallet === game.resources, 'UI must use the actual template and wallet.');
      game.resources = wallet(100); tree = h.render(); card = nodes(tree, 'ResearchRecruitCard')[0]!.props;
      check(card.affordable, 'Authored resources must enable training.');
      card.onTrain();
      check(calls.at(-1)?.[0] === 'train' && calls.at(-1)?.[1] === template.id, 'Training must preserve the template ID.');
      tree = h.render();
      check(nodes(tree, 'Text').some(node => node.props.accessibilityLiveRegion === 'polite'), 'Action feedback needs an accessible live region.');
      enabledPress(nodes(tree, 'SecondaryButton').find(node => node.props.label === 'Return to Army')!);
      check(exited() === 1, 'Return must preserve navigation.');
      if (family === 'magic') {
        game.magicResearchDefinitions = [research, { ...research, id: research.id + '_second' }];
        game.researchProgress[research.id] = { startedAt: fixedNow - 60_000, completed: false, rewardedAdsWatched: 0 };
        tree = h.render();
        check(nodes(tree, 'PrimaryButton').some(node => node.props.label === 'Finish Current Research First' && node.props.disabled), 'The existing one-active-research handling must remain.');
      }
    }
  }
}

function testTutorials() {
  for (const faction of ['human', 'elf', 'orc'] as const) {
    for (const family of ['magic', 'flying'] as const) {
      const { h, props, game, research, template, tutorialCompleted } = fixture(faction, family);
      props.tutorialFocus = { kind: 'research-start', family, label: 'START RESEARCH' };
      check(!nodes(h.render(), 'TutorialFocus').some(node => node.props.active), 'Locked research must not be highlighted as actionable.');
      game.completedStoryGates = [research.storyGateId]; game.chapterNumber = research.chapterRequired;
      let tree = h.render();
      check(nodes(tree, 'TutorialFocus').some(node => node.props.active), 'The available research must retain its contextual spotlight.');
      game.actionSuccess = false;
      enabledPress(nodes(tree, 'PrimaryButton').find(node => node.props.label.startsWith('Start'))!);
      check(tutorialCompleted() === 0, 'Failed research cannot complete the tutorial step.');
      game.actionSuccess = true; tree = h.render();
      enabledPress(nodes(tree, 'PrimaryButton').find(node => node.props.label.startsWith('Start'))!);
      check(tutorialCompleted() === 1, 'Successful research must complete the matching tutorial step.');
      props.tutorialFocus = { kind: 'research-train', family, label: 'TRAIN THIS CLASS' };
      check(!nodes(h.render(), 'TutorialFocus').some(node => node.props.active), 'Locked troop recipes must not complete or activate training guidance.');
      game.unlockedFantasyClasses = [template.className]; tree = h.render();
      check(nodes(tree, 'TutorialFocus').some(node => node.props.active), 'Unlocked training must retain its spotlight around the new card.');
      game.actionSuccess = false; nodes(tree, 'ResearchRecruitCard')[0]!.props.onTrain();
      check(tutorialCompleted() === 1, 'Failed training cannot advance the lesson.');
      game.actionSuccess = true; tree = h.render(); nodes(tree, 'ResearchRecruitCard')[0]!.props.onTrain();
      check(tutorialCompleted() === 2, 'Successful training must complete the matching step.');
      props.tutorialFocus = { kind: 'research-train', family: family === 'magic' ? 'flying' : 'magic', label: 'OTHER FAMILY' };
      tree = h.render();
      check(!nodes(tree, 'TutorialFocus').some(node => node.props.active), 'A different family must not receive this spotlight.');
      nodes(tree, 'ResearchRecruitCard')[0]!.props.onTrain();
      check(tutorialCompleted() === 2, 'A different family action must not complete the outstanding step.');
    }
  }
}

function testPresentation() {
  const expected = [[0, 'Ready'], [-1, 'Ready'], [0.00001, '1 min'], [0.5, '30 min'], [1, '1h'], [1.5, '1h 30m'], [1.999, '2h'], [23.9999, '24h']] as const;
  for (const [hours, display] of expected) check(presentation.formatResearchDuration(hours) === display, 'Rounded duration mismatch: ' + hours);
  check(presentation.formatResearchDuration(NaN) === 'Time unavailable', 'Unknown time must not imply completion.');
  const available = wallet(65), costs = { gold: 90, provisions: 20, iron: 0 };
  const before = JSON.stringify({ available, costs });
  const rows = presentation.researchCostRows(costs, available);
  check(rows.length === 2 && rows[0]!.missing === 25 && rows[1]!.missing === 0, 'Display exact deficits, omit zero costs.');
  check(JSON.stringify({ available, costs }) === before, 'Cost rendering cannot mutate recipes or resources.');
  check(presentation.researchCostRows({ gold: 1 }, { ...available, gold: NaN })[0]!.missing === null, 'Unknown balance must not display Enough.');
  for (const theme of Object.values(themes)) {
    for (const item of Object.values(presentation.researchStatePresentation)) {
      const chip = semantic.semanticChipColors(theme, item.tone);
      check(semantic.contrastRatio(chip.text, chip.background) >= 4.5, 'State text contrast failed on ' + theme.name);
    }
    for (const tone of ['violet', 'cyan', 'currency', 'positive', 'warning'] as const) {
      for (const surface of ['surface1', 'surface2', 'surface3'] as const) {
        check(semantic.contrastRatio(semantic.semanticColor(theme, tone), theme.colors[surface]) >= 4.5, 'Research foreground contrast failed on ' + theme.name + '/' + surface);
      }
    }
  }
  const { template } = fixture('human', 'flying');
  const beforeTemplate = JSON.stringify(template);
  let trained = 0;
  const card = harness('src/ui/ResearchUI.tsx', 'ResearchRecruitCard', {}, { template, unlocked: true, affordable: false, wallet: available, onTrain: () => { trained += 1; } }).render();
  const badges = nodes(card, 'UnitBadges')[0]!.props;
  check(badges.role === template.role && badges.tier === template.tier && badges.battleTags === template.battleTags, 'Badges must use authored metadata.');
  check(nodes(card, 'RarityChip').length === 0 && !('rarity' in badges), 'Tier must not become invented rarity.');
  check(nodes(card, 'PrimaryButton')[0]!.props.disabled, 'Unaffordable card must preserve disabled Train control.');
  check(nodes(card, 'DecisionStats')[0]!.props.items.every((item: any) => item.presentation === undefined || item.presentation === 'absolute'), 'Raw troop stats are not bonuses.');
  check(trained === 0 && JSON.stringify(template) === beforeTemplate, 'Card render cannot train or mutate data.');
  const ready = harness('src/ui/ResearchUI.tsx', 'ResearchRecruitCard', {}, { template, unlocked: true, affordable: true, wallet: wallet(), onTrain: () => { trained += 1; } }).render();
  enabledPress(nodes(ready, 'PrimaryButton')[0]!); check(trained === 1, 'Training must remain explicit.');
  const costTree = harness('src/ui/ResearchUI.tsx', 'ResearchCosts', {}, { cost: costs, wallet: available }).render();
  check(textOf(costTree).includes('90 Gold') && textOf(costTree).includes('Have 65'), 'Required cost and owned balance must be separately visible.');
  check(nodes(costTree, 'SemanticText').some(node => textOf(node) === '25 short' && node.props.tone === 'warning'), 'Shortfalls require explicit wording and warning color.');
  check(nodes(costTree, 'SemanticText').some(node => textOf(node) === 'Enough' && node.props.tone === 'positive'), 'Sufficient materials require explicit wording and green.');
  const gemTree = harness('src/ui/ResearchUI.tsx', 'ResearchGemCost', {}, { cost: 12, balance: 3 }).render();
  check(nodes(gemTree, 'SemanticChip').some(node => node.props.label === 'Need 9 more Gems'), 'Gem shortfall must match the real balance.');
  const active = harness('src/ui/ResearchUI.tsx', 'ResearchStateChip', {}, { state: 'active', remainingHours: 1.999 }).render();
  check(nodes(active, 'SemanticChip')[0]!.props.label === 'Researching · 2h', 'State needs a readable label and valid duration.');
  const unlocks = harness('src/ui/ResearchUI.tsx', 'ResearchUnlocks', {}, { classes: [template.className, 'Unknown Class'], templates: [template] }).render();
  const chips = nodes(unlocks, 'SemanticChip');
  check(chips[0]!.props.tone === 'orange' && chips[1]!.props.tone === 'neutral', 'Unknown classes must not acquire invented roles.');
}

async function main() {
  const realNow = Date.now; Date.now = () => fixedNow;
  try { testPresentation(); await testScreens(); testTutorials(); }
  finally { Date.now = realNow; }
  console.log('PASS: ' + checks + ' research color, state, requirement and interaction/model checks across all three factions. Native visual QA remains separate.');
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
