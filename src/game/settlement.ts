import type {
  ActiveSettlementAdjacencyBonus,
  BuildingDefinition,
  ResourceWallet,
  SettlementAdjacencyBonusDefinition,
  SettlementAdjacencyEffects,
  SettlementPlotDefinition,
  WagonStage
} from './types';

export const humanSettlementPlots: SettlementPlotDefinition[] = [
  { id: 'plot_nw', row: 0, column: 0, unlockStage: 'settlement', terrain: 'grass' },
  { id: 'plot_n', row: 0, column: 1, unlockStage: 'fort', terrain: 'high_ground' },
  { id: 'plot_ne', row: 0, column: 2, unlockStage: 'settlement', terrain: 'grass' },
  { id: 'plot_w', row: 1, column: 0, unlockStage: 'camp', terrain: 'roadside' },
  { id: 'plot_center', row: 1, column: 1, unlockStage: 'camp', terrain: 'square' },
  { id: 'plot_e', row: 1, column: 2, unlockStage: 'camp', terrain: 'roadside' },
  { id: 'plot_sw', row: 2, column: 0, unlockStage: 'fort', terrain: 'grass' },
  { id: 'plot_s', row: 2, column: 1, unlockStage: 'camp', terrain: 'roadside' },
  { id: 'plot_se', row: 2, column: 2, unlockStage: 'town', terrain: 'grass' }
];

export const initialHumanPlacements: Record<string, string | null> = {
  plot_nw: null,
  plot_n: null,
  plot_ne: null,
  plot_w: 'barracks',
  plot_center: 'hall',
  plot_e: 'wagonwright',
  plot_sw: null,
  plot_s: null,
  plot_se: null
};

export const humanAdjacencyBonuses: SettlementAdjacencyBonusDefinition[] = [
  {
    id: 'arsenal_district',
    name: 'Arsenal District',
    buildingA: 'barracks',
    buildingB: 'forge',
    description: 'Soldiers and smiths share tools, fittings and repair knowledge.',
    effectText: '-10% equipment crafting and upgrade costs',
    effects: { equipmentCostMultiplier: 0.9 }
  },
  {
    id: 'supply_yard',
    name: 'Supply Yard',
    buildingA: 'wagonwright',
    buildingB: 'quartermaster',
    description: 'Wagons are loaded directly beside the kingdom stores.',
    effectText: '+3 Wood and +2 Provisions from Expeditions; +5 Daily Supply Provisions',
    effects: {
      expeditionWoodBonus: 3,
      expeditionProvisionBonus: 2,
      dailyProvisionBonus: 5
    }
  },
  {
    id: 'mounted_drill_yard',
    name: 'Mounted Drill Yard',
    buildingA: 'barracks',
    buildingB: 'stable',
    description: 'Riders train beside the infantry yard and share campaign equipment.',
    effectText: '-15% mount crafting costs',
    effects: { mountCostMultiplier: 0.85 }
  },
  {
    id: 'command_network',
    name: 'Command Network',
    buildingA: 'war_room',
    buildingB: 'signal_tower',
    description: 'Battle plans and beacon reports move through one command network.',
    effectText: '+15% commander skill power and detailed Battle Prep intel',
    effects: {
      commanderSkillPowerMultiplier: 1.15,
      detailedIntel: true
    }
  },
  {
    id: 'seat_of_command',
    name: 'Seat of Command',
    buildingA: 'hall',
    buildingB: 'war_room',
    description: 'The commander plans campaigns beside the seat of government.',
    effectText: '-15 Gold commander retraining cost',
    effects: { commanderRespecDiscount: 15 }
  }
];

const stageRank: Record<WagonStage['id'], number> = {
  camp: 0,
  settlement: 1,
  fort: 2,
  town: 3,
  stronghold: 4,
  capital: 5,
  grand: 6
};

const plotStageRank: Record<SettlementPlotDefinition['unlockStage'], number> = {
  camp: 0,
  settlement: 1,
  fort: 2,
  town: 3,
  stronghold: 4
};

export const defaultSettlementEffects: SettlementAdjacencyEffects = {
  equipmentCostMultiplier: 1,
  mountCostMultiplier: 1,
  expeditionWoodBonus: 0,
  expeditionProvisionBonus: 0,
  dailyProvisionBonus: 0,
  commanderSkillPowerMultiplier: 1,
  commanderRespecDiscount: 0,
  detailedIntel: false
};

export function isSettlementPlotUnlocked(
  plot: SettlementPlotDefinition,
  wagonStageId: string
) {
  const current = stageRank[wagonStageId as WagonStage['id']] ?? 0;
  return current >= plotStageRank[plot.unlockStage];
}

export function arePlotsOrthogonallyAdjacent(
  first: SettlementPlotDefinition,
  second: SettlementPlotDefinition
) {
  const rowDistance = Math.abs(first.row - second.row);
  const columnDistance = Math.abs(first.column - second.column);
  return rowDistance + columnDistance === 1;
}

function findPlacedPlot(
  placements: Record<string, string | null>,
  buildingId: string
) {
  const plotId = Object.entries(placements).find(
    ([, value]) => value === buildingId
  )?.[0];
  return plotId
    ? humanSettlementPlots.find(plot => plot.id === plotId) ?? null
    : null;
}

export function analyzeSettlementAdjacency(
  placements: Record<string, string | null>,
  buildingLevels: Record<string, number>
): {
  bonuses: ActiveSettlementAdjacencyBonus[];
  effects: SettlementAdjacencyEffects;
} {
  const bonuses: ActiveSettlementAdjacencyBonus[] = [];
  const effects: SettlementAdjacencyEffects = { ...defaultSettlementEffects };

  for (const definition of humanAdjacencyBonuses) {
    if (
      (buildingLevels[definition.buildingA] ?? 0) <= 0 ||
      (buildingLevels[definition.buildingB] ?? 0) <= 0
    ) {
      continue;
    }

    const plotA = findPlacedPlot(placements, definition.buildingA);
    const plotB = findPlacedPlot(placements, definition.buildingB);

    if (!plotA || !plotB || !arePlotsOrthogonallyAdjacent(plotA, plotB)) {
      continue;
    }

    bonuses.push({
      ...definition,
      plotA: plotA.id,
      plotB: plotB.id
    });

    if (definition.effects.equipmentCostMultiplier !== undefined) {
      effects.equipmentCostMultiplier *=
        definition.effects.equipmentCostMultiplier;
    }
    if (definition.effects.mountCostMultiplier !== undefined) {
      effects.mountCostMultiplier *= definition.effects.mountCostMultiplier;
    }
    effects.expeditionWoodBonus +=
      definition.effects.expeditionWoodBonus ?? 0;
    effects.expeditionProvisionBonus +=
      definition.effects.expeditionProvisionBonus ?? 0;
    effects.dailyProvisionBonus +=
      definition.effects.dailyProvisionBonus ?? 0;

    if (definition.effects.commanderSkillPowerMultiplier !== undefined) {
      effects.commanderSkillPowerMultiplier *=
        definition.effects.commanderSkillPowerMultiplier;
    }

    effects.commanderRespecDiscount +=
      definition.effects.commanderRespecDiscount ?? 0;
    effects.detailedIntel =
      effects.detailedIntel || Boolean(definition.effects.detailedIntel);
  }

  return { bonuses, effects };
}

export function applyCostMultiplier(
  cost: Partial<ResourceWallet>,
  multiplier: number
): Partial<ResourceWallet> {
  const result: Partial<ResourceWallet> = {};

  for (const [key, amount] of Object.entries(cost)) {
    const resourceKey = key as keyof ResourceWallet;
    result[resourceKey] = Math.max(0, Math.ceil((amount ?? 0) * multiplier));
  }

  return result;
}

export function buildingConstructionCost(
  building: BuildingDefinition
): Partial<ResourceWallet> {
  return building.constructionCost;
}
