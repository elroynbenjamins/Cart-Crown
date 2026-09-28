import type {
  BuildingDefinition,
  ResourceWallet,
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
  { id: 'plot_se', row: 2, column: 2, unlockStage: 'fort', terrain: 'grass' }
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

export function isSettlementPlotUnlocked(
  plot: SettlementPlotDefinition,
  wagonStageId: string
) {
  const current = stageRank[wagonStageId as WagonStage['id']] ?? 0;
  return current >= plotStageRank[plot.unlockStage];
}

export function buildingConstructionCost(
  building: BuildingDefinition
): Partial<ResourceWallet> {
  return building.constructionCost;
}
