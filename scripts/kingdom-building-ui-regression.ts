import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';
import * as kingdom from '../src/game/kingdom';
import * as balance from '../src/game/balance';
import * as factionData from '../src/game/factions';
import * as colors from '../src/ui/semanticColors';
import * as settlementPresentation from '../src/ui/settlementPresentation';
import * as requirements from '../src/ui/researchPresentation';
import * as presentation from '../src/ui/kingdomBuildingPresentation';
import { themes } from '../src/theme/themes';
import type { FactionId, ResourceWallet } from '../src/game/types';

// Executes the real TSX with mocked native hosts/provider state; not native rendering QA.
let checks = 0;
function check(value: unknown, message: string) { assert.ok(value, message); checks += 1; }
type Element = { type: string | Function; props: Record<string, any> };
function nodes(tree: any, name: string): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(item => nodes(item, name));
  if (!tree || typeof tree !== 'object' || !tree.props) return [];
  const typeName = typeof tree.type === 'string' ? tree.type : tree.type?.name;
  return [...(typeName === name ? [tree] : []), ...nodes(tree.props.children, name)];
}
function text(tree: any): string {
  if (Array.isArray(tree)) return tree.map(text).join(' ');
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  return tree?.props ? [tree.props.text ?? '', text(tree.props.children)].join(' ') : '';
}
function button(tree: any, label: string) {
  const result = [...nodes(tree, 'PrimaryButton'), ...nodes(tree, 'SecondaryButton')].find(node => node.props.label === label);
  assert.ok(result, 'Missing action: ' + label);
  return result.props;
}
function row(tree: any, name: string) {
  const result = nodes(tree, 'Pressable').find(node => node.props.accessibilityLabel?.startsWith(name + '.'));
  assert.ok(result, 'Missing building row: ' + name);
  return result.props;
}
function harness(file: string, exportName: string, game: any = {}, props: Record<string, any> = {}) {
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
  const host = (name: string) => {
    const component = (properties: any) => jsx(name, properties);
    Object.defineProperty(component, 'name', { value: name });
    return component;
  };
  const cache = new Map<string, any>();
  function load(filename: string): any {
    const absolute = resolve(filename);
    if (cache.has(absolute)) return cache.get(absolute);
    const output = ts.transpileModule(readFileSync(absolute, 'utf8'), {
      fileName: absolute, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true }
    });
    assert.equal((output.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
    const mod = { exports: {} as any };
    const localRequire = (request: string): any => {
      if (request === 'react') return react;
      if (request === 'react-native') return {
        Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',
        StyleSheet: { create: (styles: any) => styles, hairlineWidth: 1 }
      };
      if (request.endsWith('/GameProvider')) return { useGame: () => game };
      if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: themes.original }) };
      if (request.endsWith('/kingdom')) return kingdom;
      if (request.endsWith('/balance')) return balance;
      if (request.endsWith('/factions')) return factionData;
      if (request.endsWith('/semanticColors')) return colors;
      if (request.endsWith('/settlementPresentation')) return settlementPresentation;
      if (request.endsWith('/researchPresentation')) return requirements;
      if (request.endsWith('/kingdomBuildingPresentation')) return presentation;
      if (request.endsWith('/SettlementUI')) return load(resolve(dirname(absolute), request + '.tsx'));
      if (request.endsWith('/KingdomBuildings')) return { KingdomBuildings: host('KingdomBuildings') };
      if (request.endsWith('/SemanticUI')) return Object.fromEntries(['SemanticChip', 'SemanticText', 'EmphasisText'].map(name => [name, host(name)]));
      if (request.endsWith('/components')) return Object.fromEntries([
        'GameCard', 'MetricTile', 'Pill', 'PrimaryButton', 'SecondaryButton', 'ProgressBar',
        'ResourceAmountRow', 'ResourceChip', 'ScreenHero', 'SectionTitle', 'StatusPill'
      ].map(name => [name, host(name)]));
      if (request.endsWith('/gameArt')) return Object.fromEntries([
        'BuildingSprite', 'ResourceSiteSprite', 'ResourceSprite', 'SettlementStageSprite'
      ].map(name => [name, host(name)]));
      if (request.endsWith('/TutorialFocus')) return { TutorialFocus: host('TutorialFocus') };
      throw new Error('Unexpected UI dependency: ' + request);
    };
    new Function('require', 'module', 'exports', output.outputText)(localRequire, mod, mod.exports);
    cache.set(absolute, mod.exports);
    return mod.exports;
  }
  const component = load(file)[exportName];
  return { props, game, render() { cursor = 0; return component(props); } };
}
const richWallet = (): ResourceWallet => ({ gold: 10000, wood: 10000, stone: 10000, iron: 10000, provisions: 10000 });
const emptyWallet = (): ResourceWallet => ({ gold: 0, wood: 0, stone: 0, iron: 0, provisions: 0 });

function testBuildingRows(faction: FactionId) {
  const buildings = kingdom.getBuildings(faction);
  const forge = buildings.find(building => building.role === 'EQUIPMENT')!;
  const hall = buildings.find(building => building.role === 'KINGDOM')!;
  const supply = buildings.find(building => building.role === 'SUPPLY')!;
  assert.ok(forge && hall && supply);
  const locked = new Set<string>();
  let calls = 0;
  let opened = 0;
  let succeeds = false;
  const props: any = {
    buildings, levels: { [forge.id]: 1, [hall.id]: 1 }, wallet: richWallet(),
    isBuildingUnlocked: (id: string) => !locked.has(id),
    onOpenSettlement: () => { opened += 1; },
    onUpgrade: (id: string) => {
      calls += 1;
      if (!succeeds) return false;
      const next = kingdom.getBuildingLevelDefinition(id, props.levels[id] + 1)!;
      const wallet = { ...props.wallet };
      for (const [key, amount] of Object.entries(next.cost)) wallet[key] -= amount;
      props.wallet = wallet;
      props.levels = { ...props.levels, [id]: props.levels[id] + 1 };
      return true;
    }
  };
  const h = harness('src/ui/KingdomBuildings.tsx', 'KingdomBuildings', {}, props);
  let tree = h.render();
  check(nodes(tree, 'BuildingCosts').length === 0, 'Collapsed building rows must not contain repeated cost/upgrade panels.');
  row(tree, forge.name).onPress();
  tree = h.render();
  check(calls === 0 && opened === 0, 'Opening a building must never mutate game state.');
  check(row(tree, forge.name).accessibilityState.expanded === true, 'Building disclosure must expose expanded state.');
  check(nodes(tree, 'GameCard').find(node => node.props.key === faction + ':' + forge.id)?.props.accent === themes.original.colors.gold, 'Expanded building must retain the gold selection accent.');
  check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Current · Level 1' && node.props.tone === 'positive'), 'Built level must be distinct from its next-level preview.');
  check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Next · Level 2 preview' && node.props.tone === 'blue'), 'Unpurchased upgrades must be labeled as previews.');
  const expected = kingdom.getBuildingLevelDefinition(forge.id, 2)!;
  const costs = nodes(tree, 'BuildingCosts');
  assert.deepEqual(costs[0]!.props.cost, expected.cost);
  check(text(tree).includes(expected.requirement), 'The actual authored progression requirement must remain visible.');
  check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Materials sufficient'), 'Rich wallets must state materials, not falsely claim progression is ready.');
  button(tree, 'Upgrade to Level 2').onPress();
  check(calls === 1 && props.levels[forge.id] === 1, 'Provider rejection must leave the upgrade unapplied.');
  tree = h.render();
  check(text(tree).includes('Upgrade not completed'), 'Rejected upgrades need truthful local feedback.');

  props.wallet = emptyWallet();
  tree = h.render();
  check(button(tree, 'Missing upgrade materials').disabled, 'Insufficient resources must disable the explicit upgrade.');
  button(tree, 'Missing upgrade materials').onPress();
  check(calls === 1, 'Insufficient materials must also be rejected by the UI handler.');
  props.wallet = richWallet();
  succeeds = true;
  tree = h.render();
  const before = { ...props.wallet };
  const action = button(tree, 'Upgrade to Level 2').onPress;
  action(); action();
  check(calls === 2 && props.levels[forge.id] === 2, 'A repeated stale event must not upgrade twice.');
  for (const [key, amount] of Object.entries(expected.cost)) check(props.wallet[key] === before[key as keyof ResourceWallet] - (amount ?? 0), 'Provider cost must remain exact for ' + key);
  tree = h.render();
  check(text(tree).includes('upgraded to Level 2'), 'Successful upgrade needs live feedback.');
  check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Next · Level 3 preview'), 'Fresh provider levels must refresh the next preview.');

  row(tree, supply.name).onPress();
  tree = h.render();
  check(!row(tree, forge.name).accessibilityState.expanded, 'Only one building can be expanded at a time.');
  check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Construction preview · not active'), 'Blueprint benefits must not be presented as already active.');
  check(nodes(tree, 'BuildingCosts').length === 1, 'Opening one blueprint should display one cost panel.');
  assert.deepEqual(nodes(tree, 'BuildingCosts')[0]!.props.cost, supply.constructionCost);
  button(tree, 'Choose construction plot').onPress();
  check(opened === 1 && calls === 2, 'Construction navigation must not auto-build or upgrade.');
  locked.add(supply.id);
  tree = h.render();
  check(nodes(tree, 'BuildingCosts').length === 0, 'Locked blueprint must not expose a purchase action.');
  check(nodes(tree, 'SecondaryButton').length === 0, 'Locked blueprint cannot be bought from the overview.');
  check(text(tree).includes(presentation.kingdomBuildingUnlockHint(supply)), 'Locked blueprints need a campaign clue.');

  row(tree, forge.name).onPress();
  props.levels = { ...props.levels, [forge.id]: forge.maxLevel };
  tree = h.render();
  check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Maximum level'), 'Maximum level must be explicit.');
  check(nodes(tree, 'BuildingCosts').length === 0, 'Maximum-level buildings must not offer another upgrade.');
  row(tree, hall.name).onPress();
  tree = h.render();
  check(text(tree).includes('current Kingdom goal'), 'Settlement tiers remain in the campaign expansion flow.');

  const source = readFileSync('src/ui/KingdomBuildings.tsx', 'utf8');
  check(!source.includes('numberOfLines'), 'Requirements and benefits must be allowed to wrap.');
  check(!source.includes('onTouchEnd'), 'Scrolling must not use raw touch-release selection.');
}

function testPresentationAndCosts() {
  for (const faction of ['human', 'elf', 'orc'] as const) {
    const buildings = kingdom.getBuildings(faction);
    for (const building of buildings) {
      check(presentation.kingdomBuildingPresentation(building, 0, false, richWallet()).state === 'locked', 'Locked state must not be overridden by a rich wallet.');
      check(presentation.kingdomBuildingPresentation(building, 0, true, richWallet()).state === 'blueprint', 'Unbuilt status must not imply a Level 1 upgrade.');
      check(presentation.kingdomBuildingPresentation(building, building.maxLevel, true, richWallet()).state === 'maximum', 'Authored maximum level must be respected.');
      for (let level = 1; level < building.maxLevel; level += 1) {
        const view = presentation.kingdomBuildingPresentation(building, level, true, richWallet());
        assert.deepEqual(view.next, kingdom.getBuildingLevelDefinition(building.id, level + 1));
        check(!view.status.toLowerCase().includes('ready'), 'Material status must not claim full upgrade readiness.');
      }
    }
  }
  const forge = kingdom.getBuildings('human').find(building => building.id === 'forge')!;
  const expected = kingdom.getBuildingLevelDefinition(forge.id, 2)!;
  const wallet = emptyWallet();
  wallet.gold = Math.max(0, (expected.cost.gold ?? 0) - 3);
  const view = presentation.kingdomBuildingPresentation(forge, 1, true, wallet);
  check(view.rows.find(row => row.resource === 'gold')?.missing === 3, 'Material shortfall must use the rebalanced amount.');
  const unknown = presentation.kingdomBuildingPresentation(forge, 1, true, { ...richWallet(), gold: Number.NaN });
  check(!unknown.materialsSufficient, 'Unknown balances must not be shown as sufficient.');
  const costTree = harness('src/ui/SettlementUI.tsx', 'BuildingCosts', {}, { cost: expected.cost, wallet, title: 'Upgrade cost' }).render();
  check(nodes(costTree, 'SemanticText').some(node => node.props.tone === 'warning' && text(node).includes('3 short')), 'Actual cost component must color an exact deficit amber.');
  const sufficient = harness('src/ui/SettlementUI.tsx', 'BuildingCosts', {}, { cost: expected.cost, wallet: richWallet() }).render();
  check(nodes(sufficient, 'SemanticText').some(node => node.props.tone === 'positive' && text(node) === ' Enough'), 'Actual cost component must use green for sufficient materials.');
}

function screenFixture(faction: FactionId) {
  const calls: string[] = [];
  let completes = 0;
  let productionSuccess = false;
  const game: any = {
    activeFaction: faction, resources: richWallet(), currentWagonStage: { id: 'settlement', width: 4, height: 4, formationSlots: 3 },
    buildings: kingdom.getBuildings(faction), buildingLevels: {},
    settlementUpgraded: true, recruitChosen: true, holdTheRoadWon: true,
    isBuildingUnlocked: () => true,
    upgradeBuilding: (id: string) => { calls.push('upgrade:' + id); return true; },
    resourceSites: [{ id: 'site', faction, name: 'Site', description: 'Site description', productionPerActivity: { wood: 1 } }],
    unlockedResourceSites: ['site'], productionStock: emptyWallet(),
    settlementAdjacencyBonuses: [], settlementEffects: { dailyProvisionBonus: 0 }, rewardedAdClaims: {},
    claimRewardedAd: () => {}, claimProduction: () => { calls.push('production'); return productionSuccess; },
    upgradeSettlement: () => { calls.push('settlement'); return true; },
    upgradeToFort: () => { calls.push('fort'); return true; },
    upgradeToTown: () => { calls.push('town'); return true; },
    upgradeToStronghold: () => { calls.push('stronghold'); return true; },
    upgradeToCapital: () => { calls.push('capital'); return true; },
    upgradeToGrand: () => { calls.push('grand'); return true; },
    upgradeFactionToFort: () => { calls.push('fort'); return true; },
    upgradeFactionToTown: () => { calls.push('town'); return true; },
    upgradeFactionToStronghold: () => { calls.push('stronghold'); return true; },
    upgradeFactionToCapital: () => { calls.push('capital'); return true; }
  };
  const props: any = {
    onOpenSettlement: () => { calls.push('open-settlement'); },
    onOpenRecruitment: () => { calls.push('recruit'); },
    onOpenForge: () => { calls.push('forge'); }, onOpenRoyalDecrees: () => { calls.push('decree'); },
    onOpenCommander: () => { calls.push('commander'); }, onOpenFactionMandate: () => { calls.push('mandate'); },
    tutorialFocus: { kind: 'kingdom-production', label: 'CLAIM' },
    onTutorialFocusComplete: () => { completes += 1; }
  };
  const screen = faction === 'human' ? 'KingdomScreen' : 'FactionKingdomScreen';
  const h = harness('src/screens/' + screen + '.tsx', screen, game, props);
  return { h, game, calls, completions: () => completes, allowProduction: () => { productionSuccess = true; } };
}

function testScreenIntegration(faction: FactionId) {
  const f = screenFixture(faction);
  let tree = f.h.render();
  check(nodes(tree, 'KingdomBuildings').length === 1, 'Each kingdom must use the shared building review.');
  const shared = nodes(tree, 'KingdomBuildings')[0]!.props;
  check(shared.onUpgrade === f.game.upgradeBuilding && shared.wallet === f.game.resources, 'Kingdom review must retain real provider action and wallet.');
  check(f.calls.length === 0, 'Rendering any kingdom must not spend resources.');
  button(tree, 'Got it').onPress();
  check(f.completions() === 1 && f.calls.length === 0, 'Empty production tutorial can be acknowledged without spending.');
  f.game.productionStock = { ...emptyWallet(), wood: 5 };
  tree = f.h.render();
  button(tree, 'Claim Production').onPress();
  check(f.completions() === 1, 'Failed claim must not complete tutorial.');
  f.allowProduction();
  button(f.h.render(), 'Claim Production').onPress();
  check(f.completions() === 2, 'Successful claim must retain tutorial completion.');

  const stages = faction === 'human'
    ? [['settlement', 'fort'], ['fort', 'town'], ['town', 'stronghold'], ['stronghold', 'capital'], ['capital', 'grand']]
    : [['settlement', 'fort'], ['fort', 'town'], ['town', 'stronghold'], ['stronghold', 'capital']];
  for (const [stage, target] of stages) {
    const cap = target![0]!.toUpperCase() + target!.slice(1);
    const available = faction === 'human' ? target + 'UpgradeAvailable' : 'faction' + cap + 'UpgradeAvailable';
    const can = faction === 'human' ? 'canUpgradeTo' + cap : 'canUpgradeFaction' + cap;
    f.game.currentWagonStage.id = stage;
    f.game[available] = true;
    f.game[can] = false;
    tree = f.h.render();
    const action = nodes(tree, 'PrimaryButton')[0]!.props;
    check(action.disabled, 'Expansion must still use provider eligibility for ' + faction + '/' + target);
    const costs = nodes(tree, 'BuildingCosts').find(node => node.props.title === 'Expansion cost');
    assert.ok(costs);
    assert.deepEqual(costs.props.cost, balance.getExpansionCost(faction, target as any));
    check(costs.props.wallet === f.game.resources, 'Expansion cost panel must receive the actual wallet.');
    f.game[can] = true;
    tree = f.h.render();
    check(!nodes(tree, 'PrimaryButton')[0]!.props.disabled, 'Eligible expansion must stay enabled.');
    nodes(tree, 'PrimaryButton')[0]!.props.onPress();
    check(f.calls.at(-1) === target, 'Expansion must route to the unchanged provider action.');
    f.game[available] = false;
    f.game[can] = false;
  }
  if (faction === 'human') {
    f.game.currentWagonStage.id = 'camp';
    f.game.settlementUpgraded = false;
    f.game.canUpgradeSettlement = false;
    tree = f.h.render();
    check(!text(tree).includes('Resources are ready.'), 'Securing the road alone must not claim that the expansion is affordable.');
    assert.deepEqual(nodes(tree, 'BuildingCosts')[0]!.props.cost, { wood: 90, stone: 20 });
    f.game.settlementUpgraded = true;
    f.game.recruitChosen = false;
  } else {
    f.game.recruitChoiceAvailable = true;
    f.game.recruitChosen = false;
  }
  button(f.h.render(), 'Choose third squad').onPress();
  check(f.calls.at(-1) === 'recruit', 'Third-squad navigation must survive the presentation pass.');
}

for (const faction of ['human', 'elf', 'orc'] as const) {
  testBuildingRows(faction);
  testScreenIntegration(faction);
}
testPresentationAndCosts();
console.log('PASS: ' + checks + ' kingdom building UI interaction/model checks. Native visual QA remains separate.');
