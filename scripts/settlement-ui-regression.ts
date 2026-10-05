import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';
import * as settlement from '../src/game/settlement';
import * as kingdom from '../src/game/kingdom';
import * as presentation from '../src/ui/settlementPresentation';
import * as colors from '../src/ui/semanticColors';
import * as requirements from '../src/ui/researchPresentation';
import { themes } from '../src/theme/themes';
import type { FactionId, ResourceWallet } from '../src/game/types';

// Real TSX interaction/model checks with mocked native hosts. This is not device rendering QA.
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
  return tree?.props ? text(tree.props.children) : '';
}
function style(value: any): Record<string, any> {
  if (Array.isArray(value)) return Object.assign({}, ...value.map(style));
  return typeof value === 'object' && value ? value : {};
}
function press(tree: any, label: string) {
  const button = [...nodes(tree, 'PrimaryButton'), ...nodes(tree, 'SecondaryButton')].find(node => node.props.label === label);
  assert.ok(button, 'Missing action: ' + label);
  if (!button.props.disabled) button.props.onPress?.();
}
function plot(tree: any, id: string) {
  const node = nodes(tree, 'Pressable').find(candidate => candidate.props.testID === 'settlement-' + id);
  assert.ok(node, 'Missing plot ' + id);
  return node;
}
function choosePlot(tree: any, id: string) {
  const node = plot(tree, id);
  if (!node.props.disabled) node.props.onPress();
}

function harness(file: string, exportName: string, game: any = {}, props: Record<string, any> = {}) {
  let cursor = 0;
  const hooks: any[] = [];
  const dimensions = { width: 360, height: 800, fontScale: 1, scale: 1 };
  const jsx = (type: Element['type'], supplied: any, ...children: any[]): Element => ({ type, props: {
    ...(supplied ?? {}), ...(children.length ? { children: children.length === 1 ? children[0] : children } : {})
  } });
  const react: any = {
    __esModule: true, createElement: jsx,
    useEffect: () => undefined,
    useMemo: (fn: () => unknown) => fn(),
    useState: (initial: any) => {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial;
      return [hooks[index], (next: any) => { hooks[index] = typeof next === 'function' ? next(hooks[index]) : next; }];
    }
  };
  react.default = react;
  const host = (name: string) => {
    const result = (properties: any) => jsx(name, properties);
    Object.defineProperty(result, 'name', { value: name });
    return result;
  };
  const cache = new Map<string, any>();
  function load(filename: string): any {
    const absolute = resolve(filename);
    if (cache.has(absolute)) return cache.get(absolute);
    const source = readFileSync(absolute, 'utf8');
    const output = ts.transpileModule(source, { fileName: absolute, compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true
    }, reportDiagnostics: true });
    assert.equal((output.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
    const module = { exports: {} as any };
    const localRequire = (request: string): any => {
      if (request === 'react') return react;
      if (request === 'react-native') return {
        Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',
        StyleSheet: { create: (styles: any) => styles, hairlineWidth: 1, absoluteFillObject: { position: 'absolute' } },
        useWindowDimensions: () => dimensions
      };
      if (request.endsWith('/GameProvider')) return { useGame: () => game };
      if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: themes.original }) };
      if (request.endsWith('/settlement')) return settlement;
      if (request.endsWith('/kingdom')) return kingdom;
      if (request.endsWith('/semanticColors')) return colors;
      if (request.endsWith('/settlementPresentation')) return presentation;
      if (request.endsWith('/researchPresentation')) return requirements;
      if (request.endsWith('/SettlementUI')) return load(resolve(dirname(absolute), request + '.tsx'));
      if (request.endsWith('/SemanticUI')) return Object.fromEntries(['SemanticChip', 'SemanticText', 'EmphasisText'].map(name => [name, host(name)]));
      if (request.endsWith('/components')) return Object.fromEntries(['GameCard', 'PrimaryButton', 'SecondaryButton', 'SectionTitle'].map(name => [name, host(name)]));
      if (request.endsWith('/gameArt')) return Object.fromEntries(['BuildingSprite', 'LockIcon', 'PlotTerrainSprite', 'ResourceSprite', 'SettlementBuildingAmbience', 'SettlementBuildPlotSprite', 'SettlementTerrainBackdrop'].map(name => [name, host(name)]));
      if (request.endsWith('/TutorialFocus')) return { TutorialFocus: host('TutorialFocus') };
      throw new Error('Unexpected screen dependency: ' + request);
    };
    new Function('require', 'module', 'exports', output.outputText)(localRequire, module, module.exports);
    cache.set(absolute, module.exports);
    return module.exports;
  }
  const component = load(file)[exportName];
  return { props, game, dimensions, render() { cursor = 0; return component(props); } };
}

function fixture(faction: FactionId, focus?: any) {
  const buildings = kingdom.getBuildings(faction);
  const placements = settlement.getInitialSettlementPlacements(faction);
  const levels = Object.fromEntries(buildings.map(building => [building.id, Object.values(placements).includes(building.id) ? 1 : 0]));
  const calls: any[] = [];
  let success = true;
  let completed = 0;
  let exited = 0;
  const locked = new Set<string>();
  const game: any = {
    activeFaction: faction, buildings, resources: { gold: 500, wood: 500, stone: 500, iron: 500, provisions: 500 },
    currentWagonStage: { id: 'fort' }, buildingLevels: levels, buildingPlacements: placements,
    settlementAdjacencyBonuses: settlement.analyzeSettlementAdjacency(placements, levels, faction).bonuses,
    isBuildingUnlocked: (id: string) => buildings.some(building => building.id === id) && !locked.has(id),
    constructBuilding: (id: string, target: string) => {
      calls.push(['build', id, target]);
      const building = buildings.find(candidate => candidate.id === id);
      if (!success || !building || !game.isBuildingUnlocked(id) || game.buildingPlacements[target] || !kingdom.canPayBuildingCost(game.resources, building.constructionCost)) return false;
      game.resources = { ...game.resources };
      for (const [resource, amount] of Object.entries(building.constructionCost)) game.resources[resource] -= amount ?? 0;
      game.buildingLevels = { ...game.buildingLevels, [id]: 1 };
      game.buildingPlacements = { ...game.buildingPlacements, [target]: id };
      refresh(); return true;
    },
    moveBuilding: (id: string, target: string) => {
      calls.push(['move', id, target]);
      if (!success || game.buildingPlacements[target]) return false;
      const previous = Object.keys(game.buildingPlacements).find(key => game.buildingPlacements[key] === id);
      if (!previous) return false;
      game.buildingPlacements = { ...game.buildingPlacements, [previous]: null, [target]: id };
      refresh(); return true;
    }
  };
  function refresh() { game.settlementAdjacencyBonuses = settlement.analyzeSettlementAdjacency(game.buildingPlacements, game.buildingLevels, faction).bonuses; }
  const h = harness('src/screens/SettlementScreen.tsx', 'SettlementScreen', game, {
    onExit: () => { exited += 1; }, tutorialFocus: focus,
    onTutorialFocusComplete: () => { completed += 1; }
  });
  return { h, game, calls, locked, counts: () => ({ completed, exited }), fail: (value: boolean) => { success = !value; }, refresh };
}

function testEffects() {
  const rows = presentation.districtEffectRows({ equipmentCostMultiplier: 0.9, mountCostMultiplier: 0.85, commanderSkillPowerMultiplier: 1.15, commanderRespecDiscount: 15 }, 'active');
  check(rows.find(row => row.key === 'equipmentCostMultiplier')?.value === '-10%', 'Craft discounts must preserve the actual reduction.');
  check(rows.every(row => row.tone === 'positive'), 'Cost reductions and power increases are both benefits.');
  check(rows.find(row => row.key === 'commanderRespecDiscount')?.value === '-15 Gold', 'Discount fields must display the change in cost, not a positive price.');
  const penalties = presentation.districtEffectRows({ equipmentCostMultiplier: 1.1, commanderSkillPowerMultiplier: 0.9, dailyProvisionBonus: -2, commanderRespecDiscount: -5 }, 'active');
  check(penalties.every(row => row.tone === 'negative'), 'Actual cost increases and stat reductions must be negative.');
  check(presentation.districtEffectRows({ equipmentCostMultiplier: 1, dailyProvisionBonus: 0, detailedIntel: false }, 'active').every(row => row.tone === 'neutral'), 'No-change values must remain neutral.');
  check(presentation.districtEffectRows({ equipmentCostMultiplier: 0.9, commanderSkillEarlyTrigger: true }, 'inactive').every(row => row.tone === 'neutral'), 'Inactive recipes must not look like active benefits.');
  check(presentation.districtEffectRows({ equipmentCostMultiplier: NaN, mountCostMultiplier: Infinity }, 'active').length === 0, 'Unknown values must not become invented benefits.');
  for (const faction of ['human', 'elf', 'orc'] as const) {
    for (const bonus of settlement.getSettlementAdjacencyBonuses(faction)) {
      const before = JSON.stringify(bonus.effects);
      const active = presentation.districtEffectRows(bonus.effects, 'active');
      check(active.length === Object.keys(bonus.effects).length, faction + ' effect metadata must be covered completely.');
      check(JSON.stringify(bonus.effects) === before, 'Presentation must never mutate effect values.');
      check(active.every(row => row.value.length > 0 && row.label.length > 0), 'Every colored benefit needs readable text.');
    }
  }
  for (const theme of Object.values(themes)) {
    for (const role of Object.values(presentation.buildingRolePresentation)) {
      const chip = colors.semanticChipColors(theme, role.tone);
      check(colors.contrastRatio(chip.text, chip.background) >= 4.5, theme.name + ' building role chip needs readable contrast.');
      for (const surface of [theme.colors.appBg, theme.colors.surface1, theme.colors.surface2]) check(colors.contrastRatio(chip.text, surface) >= 4.5, theme.name + ' building label contrast regressed.');
    }
  }
}

function testRecipesAndInteractions() {
  for (const faction of ['human', 'elf', 'orc'] as const) {
    const f = fixture(faction);
    const forge = f.game.buildings.find((building: any) => building.role === 'EQUIPMENT')!;
    const district = settlement.getSettlementAdjacencyBonuses(faction).find(bonus => bonus.buildingB === forge.id)!;
    const state = () => presentation.districtRecipeState(district, new Set<string>(f.game.settlementAdjacencyBonuses.map((bonus: any) => bonus.id)), f.game.buildingLevels, f.game.buildingPlacements, f.game.isBuildingUnlocked);
    check(state() === 'unbuilt', 'Missing district structures should show Buildings needed.');
    f.locked.add(forge.id); check(state() === 'locked', 'Locked blueprints need a distinct state.'); f.locked.delete(forge.id);
    let tree = f.h.render();
    const start = JSON.stringify({ resources: f.game.resources, levels: f.game.buildingLevels, placements: f.game.buildingPlacements });
    check(f.calls.length === 0, 'Initial rendering cannot call construction or relocation.');
    check(nodes(tree, 'Pressable').filter(node => node.props.testID?.startsWith('settlement-')).length === 9, 'Settlement must keep all nine authored plot positions.');
    check(nodes(tree, 'SettlementTerrainBackdrop')[0]?.props.stageId === 'fort', 'Settlement scenery must receive the live kingdom stage.');
    const expectedFactionAccent = faction === 'elf' ? themes.original.colors.elf : faction === 'orc' ? themes.original.colors.orc : themes.original.colors.human;
    check(nodes(tree, 'View').some(node => {
      const value = style(node.props.style);
      return value.borderTopWidth === 2 && value.borderColor === expectedFactionAccent;
    }), 'Fort fortification must use the active faction accent and light perimeter weight.');
    f.game.currentWagonStage = { id: 'capital' };
    tree = f.h.render();
    check(nodes(tree, 'SettlementTerrainBackdrop')[0]?.props.stageId === 'capital', 'Settlement scenery must react immediately to stage growth.');
    check(nodes(tree, 'View').some(node => {
      const value = style(node.props.style);
      return value.borderTopWidth === 4 && value.borderColor === expectedFactionAccent;
    }), 'Capital fortification must render heavier than Fort.');
    f.game.currentWagonStage = { id: 'fort' };
    tree = f.h.render();
    check(nodes(tree, 'BuildingSprite').some(node => Number(node.props.size) >= 50), 'Built structures must read as primary map objects rather than tiny card icons.');
    check(nodes(tree, 'ResourceSprite').length === 5, 'Portrait settlement HUD must expose the five core resources at first glance.');
    check(nodes(tree, 'BuildingSprite').some(node => Number(node.props.size) >= 78), 'The central settlement landmark must read larger than secondary buildings in portrait mode.');
    const centerPlotStyle = style(plot(tree, 'plot_center').props.style);
    const westPlotStyle = style(plot(tree, 'plot_w').props.style);
    check(centerPlotStyle.borderWidth === 0 && westPlotStyle.borderWidth === 0, 'Occupied settlement structures must not keep card-like plot borders.');
    check(centerPlotStyle.zIndex > westPlotStyle.zIndex, 'The Great Hall must remain above same-row secondary structures in scene depth.');
    check(nodes(tree, 'BuildingSprite').filter(node => Number(node.props.size) >= 80).length === 1, 'Only the central landmark should use oversized settlement scale at the initial layout.');
    const placedBuildingCount = Object.values(f.game.buildingPlacements).filter(Boolean).length;
    const ambience = nodes(tree, 'SettlementBuildingAmbience');
    check(ambience.length === placedBuildingCount, 'Placed buildings must carry ambient life and props.');
    check(ambience.every(node => node.props.faction === faction), 'Building ambience must remain faction-scoped.');
    check(ambience.every(node => typeof node.props.role === 'string' && Number(node.props.level) >= 1), 'Building ambience must receive the live building role and level.');
    check(nodes(tree, 'SettlementBuildPlotSprite').length >= 1, faction + ' empty plots must render as production build sites.');
    check(nodes(tree, 'SettlementBuildPlotSprite').every(node => node.props.faction === faction), faction + ' build-site art must stay faction-scoped.');
    check(nodes(tree, 'Pressable').some(node => node.props.testID === 'blueprint-planner-open'), 'Blueprint planner must be directly available from the settlement overview.');
    check(nodes(tree, 'SemanticChip').some(node => String(node.props.label ?? '').includes('district spots')), 'District-completing plots must be summarized in the HUD.');
    check(nodes(tree, 'View').some(node => node.props.testID === 'district-opportunity-plot_nw'), 'A high-value empty plot must be marked before the player opens it.');
    check(nodes(tree, 'SemanticChip').some(node => String(node.props.label ?? '').includes('build ready')), 'Affordable construction must be visible before opening a plot.');
    check(text(tree).includes('BUILD READY'), 'The recommended empty plot must show direct in-world readiness feedback.');
    check(text(tree).includes('CART & CROWN'), 'Portrait settlement HUD must use the final Cart & Crown identity.');
    const normalMap = nodes(tree, 'View').find(node => style(node.props.style).height === 600 && style(node.props.style).position === 'relative');
    check(Boolean(normalMap), 'Reference portrait layout must devote 600px to the settlement world scene.');
    check(plot(tree, 'plot_se').props.disabled, 'A Town plot must remain locked at Fort.');
    choosePlot(tree, 'plot_se'); check(f.calls.length === 0, 'Locked plots must not trigger a transaction.');
    choosePlot(tree, 'plot_nw'); tree = f.h.render();
    check(plot(tree, 'plot_nw').props.accessibilityState.selected, 'Plot selection must be exposed to assistive technology.');
    check(!nodes(tree, 'View').some(node => node.props.testID === 'district-opportunity-plot_nw'), 'At-a-glance opportunity markers must yield to focused plot planning.');
    check(nodes(tree, 'View').some(node => node.props.testID === 'district-preview-link-' + district.id), 'District preview must connect the selected plot to its compatible neighbor before construction.');
    check(nodes(tree, 'View').some(node => node.props.testID === 'district-preview-partner-plot_w'), 'District preview must identify the exact neighboring partner plot.');
    check(text(tree).includes(district.name), 'District preview must name the synergy being previewed.');
    check(nodes(tree, 'View').some(node => node.props.testID === 'placement-quality-plot_nw'), 'Selected build sites must show a placement-quality badge.');
    check(
      nodes(tree, 'SemanticChip').some(node => node.props.label === 'Good · 1 district'),
      'One real district activation must rate as Good.'
    );
    check(style(plot(tree, 'plot_nw').props.style).borderColor === themes.original.colors.gold, 'Selection must remain gold rather than use a role/benefit color.');
    check(JSON.stringify({ resources: f.game.resources, levels: f.game.buildingLevels, placements: f.game.buildingPlacements }) === start, 'Selecting and previewing a plot must not change levels, placements or costs.');
    const quartermasterId = faction === 'human' ? 'quartermaster' : faction === 'elf' ? 'elf_spirit_stores' : 'orc_smokehouse';
    const neutralBlueprint = nodes(tree, 'View').find(node => node.props.testID === 'settlement-blueprint-' + quartermasterId);
    check(Boolean(neutralBlueprint), 'A non-synergy blueprint row must remain available for comparison.');
    check(
      nodes(neutralBlueprint, 'SemanticChip').some(node => node.props.label === 'Neutral · 0 districts'),
      'Zero real district activations must rate as Neutral.'
    );
        const cost = nodes(tree, 'BuildingCosts').find(node => node.props.cost === forge.constructionCost);
    check(Boolean(cost) && cost!.props.wallet === f.game.resources, 'Construction must display the provider cost and current wallet unchanged.');
    check(nodes(tree, 'DistrictEffects').some(node => node.props.state === 'preview' && node.props.bonus.id === district.id), 'An adjacent construction must preview the real district.');
    const gold = f.game.resources.gold;
    press(tree, 'Build ' + forge.name);
    check(f.calls.at(-1)?.[1] === forge.id && f.calls.at(-1)?.[2] === 'plot_nw', 'Build action must use the exact selected plot and building IDs.');
    check(f.game.resources.gold === gold - (forge.constructionCost.gold ?? 0), 'Construction cost must not change.');
    check(state() === 'active', 'The real adjacency analysis must activate the built district.');
    tree = f.h.render();
    check(nodes(tree, 'View').some(node => node.props.testID === 'district-link-' + district.id), 'Active adjacent districts must draw an in-world connection.');
    check(!nodes(tree, 'View').some(node => node.props.testID === 'district-preview-link-' + district.id), 'Committed construction must clear the temporary district preview.');
    choosePlot(tree, 'plot_nw'); tree = f.h.render();
    check(nodes(tree, 'BuildingLevelPreview')[0]?.props.building.id === forge.id, 'Selected structure must expose its own upgrade preview.');
    const beforeMove = JSON.stringify({ resources: f.game.resources, levels: f.game.buildingLevels });
    const callsBeforeDestinationPreview = f.calls.length;
    const northRelocation = nodes(tree, 'View').find(node => node.props.testID === 'relocation-plan-plot_n');
    check(Boolean(northRelocation), 'Relocation mode must rate every empty destination before the player chooses one.');
    check(
      northRelocation?.props.accessibilityLabel === 'Relocation Loss -1, gain 0, lose 1, net -1',
      'A destination that breaks Arsenal District must expose the exact district loss.'
    );
    const southwestRelocation = nodes(tree, 'View').find(node => node.props.testID === 'relocation-plan-plot_sw');
    check(
      southwestRelocation?.props.accessibilityLabel === 'Relocation Same, gain 0, lose 0, net +0',
      'A destination that preserves the same district must be shown as strategically even.'
    );

    choosePlot(tree, 'plot_n');
    tree = f.h.render();
    check(f.calls.length === callsBeforeDestinationPreview, 'Tapping a relocation destination must preview rather than move immediately.');
    check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Gain +0'), 'Relocation preview must show exact district gains.');
    check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Lose -1'), 'Relocation preview must show exact district losses.');
    check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Net -1'), 'Relocation preview must show the exact net district change.');
    check(
      nodes(tree, 'View').some(node => node.props.testID === 'relocation-loss-link-' + district.id),
      'Relocation preview must draw the district connection that would be lost.'
    );
    check(JSON.stringify({ resources: f.game.resources, levels: f.game.buildingLevels }) === beforeMove, 'Previewing relocation must preserve resources and levels.');

    press(tree, 'Confirm free move');
    tree = f.h.render();
    check(f.calls.at(-1)?.[0] === 'move', 'Only relocation confirmation may call the move transaction.');
    check(f.calls.at(-1)?.[1] === forge.id && f.calls.at(-1)?.[2] === 'plot_n', 'Confirmed relocation must use the exact building and destination IDs.');
    check(JSON.stringify({ resources: f.game.resources, levels: f.game.buildingLevels }) === beforeMove, 'Relocation must stay free and preserve levels.');
    check(state() === 'separated', 'A diagonal pair must stay inactive and read Not adjacent.');
    check(nodes(tree, 'DistrictEffects').filter(node => node.props.bonus.id === district.id).every(node => node.props.state === 'inactive'), 'Separated districts must not present active or predicted bonuses.');
    check(!nodes(tree, 'View').some(node => node.props.testID === 'district-link-' + district.id), 'Separated districts must remove their in-world connection.');
    check(!nodes(tree, 'View').some(node => String(node.props.testID ?? '').startsWith('relocation-plan-')), 'Confirmed relocation must clear destination ratings.');
    f.game.buildingPlacements = { ...f.game.buildingPlacements, plot_n: null }; f.refresh();
    check(state() === 'unplaced', 'An unplaced built structure must not be called unbuilt.');
    press(tree, 'Return to Kingdom'); check(f.counts().exited === 1, 'Return navigation must preserve its callback.');
    f.h.dimensions.fontScale = 2;
    const largeTree = f.h.render();
    const map = nodes(largeTree, 'View').find(node => style(node.props.style).height === 720 && style(node.props.style).position === 'relative');
    check(Boolean(map), 'Larger text must expand the world viewport without changing plot geometry.');
  }
}

function testDenseDistrictZoneReadability() {
  const f = fixture('human');
  f.game.buildingPlacements = {
    plot_nw: 'forge',
    plot_n: 'war_room',
    plot_ne: 'signal_tower',
    plot_w: 'barracks',
    plot_center: 'hall',
    plot_e: 'wagonwright',
    plot_sw: 'stable',
    plot_s: null,
    plot_se: 'quartermaster'
  };
  f.game.buildingLevels = {
    ...f.game.buildingLevels,
    forge: 1,
    war_room: 1,
    signal_tower: 1,
    barracks: 1,
    hall: 1,
    wagonwright: 1,
    stable: 1,
    quartermaster: 1
  };
  f.refresh();

  let tree = f.h.render();
  check(f.game.settlementAdjacencyBonuses.length === 5, 'Dense district readability fixture must activate five real districts.');
  const zones = nodes(tree, 'View').filter(node => String(node.props.testID ?? '').startsWith('district-zone-') && !String(node.props.testID).startsWith('district-zone-label-'));
  check(zones.length === 5, 'Every active district must receive exactly one grouped ground zone.');
  for (const id of ['arsenal_district', 'mounted_drill_yard', 'supply_yard', 'seat_of_command', 'command_network']) {
    check(nodes(tree, 'View').some(node => node.props.testID === 'district-zone-' + id), 'Missing grouped ground zone for ' + id + '.');
    check(nodes(tree, 'View').some(node => node.props.testID === 'district-zone-label-' + id), 'Missing readable district tag for ' + id + '.');
  }

  const arsenalZone = nodes(tree, 'View').find(node => node.props.testID === 'district-zone-arsenal_district');
  const expectedArsenalBorder = colors.blendColor(
    colors.semanticColor(themes.original, 'orange'),
    themes.original.colors.surface1,
    0.44
  );
  check(style(arsenalZone?.props.style).borderColor === expectedArsenalBorder, 'Equipment districts must keep a distinct orange visual family.');
  const supplyZone = nodes(tree, 'View').find(node => node.props.testID === 'district-zone-supply_yard');
  const expectedSupplyBorder = colors.blendColor(
    colors.semanticColor(themes.original, 'green'),
    themes.original.colors.surface1,
    0.44
  );
  check(style(supplyZone?.props.style).borderColor === expectedSupplyBorder, 'Supply districts must keep a distinct green visual family.');

  choosePlot(tree, 'plot_nw');
  tree = f.h.render();
  const focusedArsenal = nodes(tree, 'View').find(node => node.props.testID === 'district-zone-label-arsenal_district');
  const dimmedSupply = nodes(tree, 'View').find(node => node.props.testID === 'district-zone-label-supply_yard');
  check(style(focusedArsenal?.props.style).opacity === 1, 'Selecting a district member must fully emphasize its own neighborhood tag.');
  check(style(dimmedSupply?.props.style).opacity === 0.42, 'Selecting a district member must dim unrelated dense neighborhoods.');
}

function testDistrictNetworkOptimizationHint() {
  const f = fixture('human');
  f.game.buildingPlacements = {
    ...f.game.buildingPlacements,
    plot_nw: 'war_room',
    plot_n: null,
    plot_ne: 'signal_tower'
  };
  f.game.buildingLevels = {
    ...f.game.buildingLevels,
    war_room: 1,
    signal_tower: 1
  };
  f.refresh();

  let tree = f.h.render();
  check(f.game.settlementAdjacencyBonuses.length === 0, 'Optimization fixture must start with zero active districts.');
  const hint = nodes(tree, 'Pressable').find(node => node.props.testID === 'district-network-hint');
  check(Boolean(hint), 'A strictly better single relocation must surface a district-network hint.');
  const warRoom = f.game.buildings.find((building: any) => building.id === 'war_room')!;
  check(
    hint?.props.accessibilityLabel === 'Better layout available, 0 to 2 districts. Preview moving ' + warRoom.name + ' to North',
    'Network hint must name the exact best building, destination and current-to-future district count.'
  );
  check(
    nodes(tree, 'SemanticChip').some(node => node.props.label === '0→2 layout'),
    'The HUD must summarize the best whole-network improvement without forcing the move.'
  );

  const callsBeforePreview = f.calls.length;
  hint!.props.onPress();
  tree = f.h.render();

  check(f.calls.length === callsBeforePreview, 'Opening the network hint must preview rather than relocate immediately.');
  check(
    nodes(tree, 'SemanticChip').some(node => node.props.label === 'Network 0 → 2'),
    'Best-layout preview must expose total district count before and after.'
  );
  check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Gain +2'), 'Best-layout preview must expose exact gained districts.');
  check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Lose -0'), 'Best-layout preview must expose exact lost districts.');
  check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Net +2'), 'Best-layout preview must expose exact net improvement.');
  check(
    nodes(tree, 'View').some(node => node.props.testID === 'relocation-gain-link-seat_of_command'),
    'Network optimization preview must draw Seat of Command as a gained connection.'
  );
  check(
    nodes(tree, 'View').some(node => node.props.testID === 'relocation-gain-link-command_network'),
    'Network optimization preview must draw Command Network as a gained connection.'
  );

  press(tree, 'Confirm free move');
  tree = f.h.render();
  check(f.calls.at(-1)?.[0] === 'move' && f.calls.at(-1)?.[1] === 'war_room' && f.calls.at(-1)?.[2] === 'plot_n', 'Only explicit confirmation may apply the suggested network relocation.');
  check(f.game.settlementAdjacencyBonuses.length === 2, 'Confirmed best-layout relocation must produce the predicted two active districts.');
  check(!nodes(tree, 'Pressable').some(node => node.props.testID === 'district-network-hint'), 'Optimization hint must disappear when no strictly better single relocation remains.');
}

function testBlueprintFirstPlanner() {
  const f = fixture('human');
  let tree = f.h.render();

  const openPlanner = nodes(tree, 'Pressable').find(node => node.props.testID === 'blueprint-planner-open');
  check(Boolean(openPlanner), 'Blueprint planner launcher must render while unbuilt blueprints remain.');
  openPlanner!.props.onPress();
  tree = f.h.render();

  check(nodes(tree, 'View').some(node => node.props.testID === 'blueprint-planner'), 'Opening the planner must reveal the blueprint selector.');
  const forge = f.game.buildings.find((building: any) => building.id === 'forge')!;
  const chooseForge = nodes(tree, 'Pressable').find(node => node.props.testID === 'blueprint-planner-select-forge');
  check(Boolean(chooseForge), 'Every available blueprint must be selectable in planner mode.');
  chooseForge!.props.onPress();
  tree = f.h.render();

  const plotRatings = nodes(tree, 'View').filter(node => String(node.props.testID ?? '').startsWith('blueprint-plan-quality-'));
  check(plotRatings.length >= 1, 'Planning a blueprint must rate every empty unlocked plot.');
  const northwest = nodes(tree, 'View').find(node => node.props.testID === 'blueprint-plan-quality-plot_nw');
  check(northwest?.props.accessibilityLabel === 'Good placement, 1 district, for Field Forge', 'Forge planning must rate plot_nw from the real Arsenal District adjacency.');
  const north = nodes(tree, 'View').find(node => node.props.testID === 'blueprint-plan-quality-plot_n');
  check(north?.props.accessibilityLabel === 'Neutral placement, 0 districts, for Field Forge', 'Planner mode must expose plot-by-plot quality rather than one global score.');

  choosePlot(tree, 'plot_nw');
  tree = f.h.render();
  check(nodes(tree, 'View').some(node => node.props.testID === 'placement-quality-plot_nw'), 'Tapping a planned plot must switch to focused placement preview.');
  check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Good · 1 district'), 'Focused planner preview must keep the selected blueprint quality.');
  check(nodes(tree, 'View').some(node => node.props.testID === 'district-preview-link-arsenal_district'), 'Focused planner preview must draw the real district preview link.');

  const closePlanner = nodes(tree, 'Pressable').find(node => node.props.testID === 'blueprint-planner-close');
  check(Boolean(closePlanner), 'Planner mode must expose a compact close action.');
  closePlanner!.props.onPress();
  tree = f.h.render();
  check(!nodes(tree, 'View').some(node => node.props.testID === 'blueprint-planner'), 'Closing the planner must remove the blueprint selector.');
  check(!nodes(tree, 'View').some(node => String(node.props.testID ?? '').startsWith('blueprint-plan-quality-')), 'Closing planner mode must clear overview quality badges.');
}

function testExcellentPlacementQuality() {
  const f = fixture('human');
  f.game.buildingPlacements = {
    ...f.game.buildingPlacements,
    plot_n: null,
    plot_ne: 'signal_tower'
  };
  f.game.buildingLevels = {
    ...f.game.buildingLevels,
    signal_tower: 1
  };
  f.refresh();

  let tree = f.h.render();
  check(
    nodes(tree, 'View').some(node => node.props.testID === 'district-opportunity-plot_n'),
    'A plot that can activate multiple real districts must remain discoverable in overview mode.'
  );
  const excellentOverview = nodes(tree, 'View').find(node => node.props.testID === 'district-opportunity-plot_n');
  check(excellentOverview?.props.accessibilityLabel === 'Excellent placement, 2 districts', 'Two real district activations must rate as Excellent in overview mode.');

  choosePlot(tree, 'plot_n');
  tree = f.h.render();
  const excellentFocused = nodes(tree, 'View').find(node => node.props.testID === 'placement-quality-plot_n');
  check(Boolean(excellentFocused), 'Excellent placement quality must carry into focused plot preview.');
  check(excellentFocused?.props.accessibilityLabel === 'Excellent placement, 2 districts', 'Focused quality metadata must expose the exact real district count.');
  check(
    nodes(tree, 'SemanticChip').some(node => node.props.label === 'Excellent · 2 districts'),
    'Focused placement quality must expose the exact real district count.'
  );
  check(text(tree).includes('Seat of Command') && text(tree).includes('Command Network'), 'Excellent scoring must be backed by the exact two authored district bonuses.');
}

function testTutorialAndCosts() {
  const f = fixture('human', { kind: 'settlement-building', buildingId: 'forge', label: 'BUILD FORGE' });
  let tree = f.h.render(); choosePlot(tree, 'plot_nw'); tree = f.h.render();
  check(nodes(tree, 'TutorialFocus').some(node => node.props.active), 'Existing construction spotlight must remain active.');
  f.fail(true); press(tree, 'Build Field Forge');
  check(f.counts().completed === 0, 'A failed construction must not complete its tutorial step.');
  check(text(f.h.render()).includes('cannot be constructed'), 'Failed construction needs visible feedback.');
  f.fail(false); press(f.h.render(), 'Build Field Forge');
  check(f.counts().completed === 1, 'Successful matching construction must complete the spotlight.');
  const later = fixture('human', { kind: 'settlement-building', buildingId: 'forge', label: 'BUILD FORGE' });
  choosePlot(later.h.render(), 'plot_nw'); press(later.h.render(), 'Build later');
  check(later.counts().completed === 1 && later.calls.length === 0, 'Build later must teach without spending.');
  const emptyPlot = fixture('elf', { kind: 'settlement-first-plot', label: 'CHOOSE PLOT' });
  choosePlot(emptyPlot.h.render(), 'plot_nw');
  check(emptyPlot.counts().completed === 1, 'First-plot tutorial must still complete on plot selection.');
  const poor = fixture('orc');
  poor.game.resources = { gold: 0, wood: 0, stone: 0, iron: 0, provisions: 0 };
  const poorOverview = poor.h.render();
  check(nodes(poorOverview, 'View').some(node => String(node.props.testID ?? '').startsWith('district-opportunity-')), 'District opportunities must remain visible even when the missing blueprint is currently unaffordable.');
  choosePlot(poorOverview, 'plot_nw'); tree = poor.h.render();
  const forge = poor.game.buildings.find((building: any) => building.role === 'EQUIPMENT');
  press(tree, 'Build ' + forge.name);
  check(poor.calls.length === 0, 'Unaffordable Build must remain disabled.');
  const wallet: ResourceWallet = { gold: 20, wood: 7, stone: 0, iron: 0, provisions: 0 };
  const costs = harness('src/ui/SettlementUI.tsx', 'BuildingCosts', {}, { cost: { gold: 30, wood: 7 }, wallet }).render();
  check(text(costs).includes('10 short') && text(costs).includes('Enough'), 'Each material must show its own exact shortage or Enough state.');
  const unknownCosts = harness('src/ui/SettlementUI.tsx', 'BuildingCosts', {}, { cost: { gold: 30 }, wallet: { ...wallet, gold: NaN } }).render();
  check(text(unknownCosts).includes('Check balance'), 'Unknown balances must not be called sufficient.');
  const humanForge = kingdom.getBuildings('human').find(building => building.id === 'forge')!;
  const upgrade = harness('src/ui/SettlementUI.tsx', 'BuildingLevelPreview', {}, { building: humanForge, level: 1, wallet }).render();
  const realNext = kingdom.getBuildingLevelDefinition('forge', 2)!;
  check(nodes(upgrade, 'BuildingCosts')[0]?.props.cost.gold === realNext.cost.gold, 'Next-level costs must come from the rebalanced getter, not raw data.');
  check(nodes(upgrade, 'EmphasisText').some(node => node.props.text === realNext.effect), 'Next upgrade effect must stay authored and exact.');
  check(text(upgrade).includes(realNext.requirement), 'Progression requirements must remain visible beside resource costs.');
  check(nodes(upgrade, 'PrimaryButton').length === 0, 'Upgrade preview must not introduce another spending path.');
  const max = harness('src/ui/SettlementUI.tsx', 'BuildingLevelPreview', {}, { building: humanForge, level: humanForge.maxLevel, wallet }).render();
  check(nodes(max, 'SemanticChip').some(node => node.props.label === 'Maximum level'), 'Maximum level must be distinguished from missing upgrade metadata.');
}

const settlementScreenSource = readFileSync(resolve('src/screens/SettlementScreen.tsx'), 'utf8');
check(settlementScreenSource.includes('settlementUnlockSnapshots'), 'Settlement unlock celebration must compare against an in-session baseline.');
check(settlementScreenSource.includes('settlement-unlock-celebration'), 'Settlement unlock celebration must stay in-world instead of using a modal.');
check(settlementScreenSource.includes('setTimeout(() => setUnlockCelebration(null), 2600)'), 'Settlement unlock celebration must auto-clear quickly.');
check(settlementScreenSource.includes('UPGRADE MATERIALS READY'), 'Settlement upgrade celebration wording must remain resource-accurate.');

testEffects();
testRecipesAndInteractions();
testDenseDistrictZoneReadability();
testDistrictNetworkOptimizationHint();
testBlueprintFirstPlanner();
testExcellentPlacementQuality();
testTutorialAndCosts();
console.log('PASS: ' + checks + ' settlement emphasis and interaction/model checks across all factions; native Android rendering remains separate.');
