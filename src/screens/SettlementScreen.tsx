import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import {
  analyzeSettlementAdjacency, getSettlementAdjacencyBonuses,
  getSettlementPlots, isSettlementPlotUnlocked
} from '../game/settlement';
import { canPayBuildingCost, getBuildingLevelDefinition } from '../game/kingdom';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { PrimaryButton, SecondaryButton } from '../ui/components';
import { BuildingSprite, LockIcon, ResourceSprite, SettlementBuildingAmbience, SettlementBuildPlotSprite, SettlementTerrainBackdrop } from '../ui/gameArt';
import { SemanticChip, SemanticText } from '../ui/SemanticUI';
import { blendColor, semanticColor } from '../ui/semanticColors';
import type { SemanticTone } from '../ui/semanticColors';
import { BuildingCosts, BuildingHeading, BuildingLevelPreview, DistrictEffects } from '../ui/SettlementUI';
import { buildingRolePresentation, districtRecipePresentation, districtRecipeState } from '../ui/settlementPresentation';
import { TutorialFocus } from '../ui/TutorialFocus';
import type { TutorialFocusTarget } from '../game/tutorial';
import type { SettlementAdjacencyBonusDefinition } from '../game/types';

const settlementPlotPositions: Record<string, { left: ViewStyle['left']; top: ViewStyle['top'] }> = {
  plot_nw: { left: '6%', top: '15%' },
  plot_n: { left: '37%', top: '6%' },
  plot_ne: { left: '68%', top: '15%' },
  plot_w: { left: '0%', top: '40%' },
  plot_center: { left: '34%', top: '34%' },
  plot_e: { left: '72%', top: '40%' },
  plot_sw: { left: '7%', top: '66%' },
  plot_s: { left: '38%', top: '72%' },
  plot_se: { left: '68%', top: '66%' }
};

const settlementPlotCenters: Record<string, { x: number; y: number }> = {
  plot_nw: { x: 0.195, y: 0.265 },
  plot_n: { x: 0.505, y: 0.175 },
  plot_ne: { x: 0.815, y: 0.265 },
  plot_w: { x: 0.135, y: 0.515 },
  plot_center: { x: 0.5, y: 0.475 },
  plot_e: { x: 0.855, y: 0.515 },
  plot_sw: { x: 0.205, y: 0.775 },
  plot_s: { x: 0.515, y: 0.835 },
  plot_se: { x: 0.815, y: 0.775 }
};

const settlementPlotLabels: Record<string, string> = {
  plot_nw: 'Northwest',
  plot_n: 'North',
  plot_ne: 'Northeast',
  plot_w: 'West',
  plot_center: 'Center',
  plot_e: 'East',
  plot_sw: 'Southwest',
  plot_s: 'South',
  plot_se: 'Southeast'
};

const settlementMaxBuildingLevelByStage: Record<string, number> = {
  camp: 1,
  settlement: 2,
  fort: 3,
  town: 4,
  stronghold: 5,
  capital: 5,
  grand: 5
};

const settlementResourceOrder = ['gold', 'wood', 'stone', 'iron', 'provisions'] as const;
const settlementResourceLabels: Record<(typeof settlementResourceOrder)[number], string> = {
  gold: 'Gold',
  wood: 'Wood',
  stone: 'Stone',
  iron: 'Iron',
  provisions: 'Food'
};

function settlementPlacementQuality(districtCount: number) {
  if (districtCount >= 2) {
    return {
      label: 'Excellent',
      tone: 'positive' as const,
      summary: districtCount + ' districts'
    };
  }
  if (districtCount === 1) {
    return {
      label: 'Good',
      tone: 'blue' as const,
      summary: '1 district'
    };
  }
  return {
    label: 'Neutral',
    tone: 'neutral' as const,
    summary: '0 districts'
  };
}

function settlementDistrictTone(bonus: SettlementAdjacencyBonusDefinition): SemanticTone {
  const effects = bonus.effects;
  if (effects.equipmentCostMultiplier !== undefined) return 'orange';
  if (effects.mountCostMultiplier !== undefined) return 'cyan';
  if (
    effects.expeditionWoodBonus !== undefined ||
    effects.expeditionProvisionBonus !== undefined ||
    effects.dailyProvisionBonus !== undefined
  ) return 'green';
  if (
    effects.commanderSkillPowerMultiplier !== undefined ||
    effects.detailedIntel !== undefined
  ) return 'violet';
  if (
    effects.commanderRespecDiscount !== undefined ||
    effects.commanderSkillEarlyTrigger !== undefined
  ) return 'rose';
  return 'positive';
}

type DistrictOverlayFilter = 'all' | 'economy' | 'military' | 'command';

function settlementDistrictCategory(bonus: SettlementAdjacencyBonusDefinition): Exclude<DistrictOverlayFilter, 'all'> {
  const effects = bonus.effects;
  if (
    effects.expeditionWoodBonus !== undefined ||
    effects.expeditionProvisionBonus !== undefined ||
    effects.dailyProvisionBonus !== undefined
  ) return 'economy';
  if (
    effects.commanderSkillPowerMultiplier !== undefined ||
    effects.commanderRespecDiscount !== undefined ||
    effects.commanderSkillEarlyTrigger !== undefined ||
    effects.detailedIntel !== undefined
  ) return 'command';
  return 'military';
}

const settlementDistrictOverlayFilters: Array<{
  id: DistrictOverlayFilter;
  label: string;
  tone: SemanticTone;
}> = [
  { id: 'all', label: 'All', tone: 'neutral' },
  { id: 'economy', label: 'Economy', tone: 'green' },
  { id: 'military', label: 'Military', tone: 'orange' },
  { id: 'command', label: 'Command', tone: 'violet' }
];

type SettlementUnlockSnapshot = {
  stageId: string;
  unlockedPlotIds: string[];
  availableBuildingIds: string[];
  upgradeMaterialReadyIds: string[];
};

type SettlementUnlockCelebration = {
  kind: 'stage' | 'building' | 'plot' | 'upgrade';
  label: string;
  detail: string;
  plotId?: string;
  buildingId?: string;
};

const settlementUnlockSnapshots = new Map<string, SettlementUnlockSnapshot>();

export function SettlementScreen({ onExit, tutorialFocus, onTutorialFocusComplete }: {
  onExit: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
}) {
  const { theme } = useGameTheme();
  const { fontScale, height: viewportHeight, width: viewportWidth } = useWindowDimensions();
  const {
    activeFaction, resources, currentWagonStage, buildings, buildingLevels,
    buildingPlacements, settlementAdjacencyBonuses, isBuildingUnlocked,
    constructBuilding, moveBuilding
  } = useGame();
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [relocationTargetPlotId, setRelocationTargetPlotId] = useState<string | null>(null);
  const [previewBuildingId, setPreviewBuildingId] = useState<string | null>(null);
  const [blueprintPlannerOpen, setBlueprintPlannerOpen] = useState(false);
  const [planningBuildingId, setPlanningBuildingId] = useState<string | null>(null);
  const [districtOverlayFilter, setDistrictOverlayFilter] = useState<DistrictOverlayFilter>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [districtCodexOpen, setDistrictCodexOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [unlockCelebration, setUnlockCelebration] = useState<SettlementUnlockCelebration | null>(null);
  const settlementPlots = getSettlementPlots(activeFaction);
  const adjacencyRecipes = getSettlementAdjacencyBonuses(activeFaction);
  const factionAccent = activeFaction === 'elf' ? theme.colors.elf : activeFaction === 'orc' ? theme.colors.orc : theme.colors.human;
  const selectedPlot = settlementPlots.find(plot => plot.id === selectedPlotId) ?? null;
  const selectedBuilding = buildings.find(building => building.id === selectedBuildingId) ?? null;
  const selectedDistrict = settlementAdjacencyBonuses.find(bonus => bonus.id === selectedDistrictId) ?? null;
  const selectedDistrictBuildingA = selectedDistrict
    ? buildings.find(building => building.id === selectedDistrict.buildingA) ?? null
    : null;
  const selectedDistrictBuildingB = selectedDistrict
    ? buildings.find(building => building.id === selectedDistrict.buildingB) ?? null
    : null;
  const selectedDistrictTone = selectedDistrict ? settlementDistrictTone(selectedDistrict) : 'neutral' as const;
  const selectedDistrictCategory = selectedDistrict ? settlementDistrictCategory(selectedDistrict) : null;
  const placedIds = useMemo(() => Object.values(buildingPlacements).filter((value): value is string => Boolean(value)), [buildingPlacements]);
  const availableBuildings = buildings.filter(building => isBuildingUnlocked(building.id) && !placedIds.includes(building.id));
  const affordableBuildings = availableBuildings.filter(building => canPayBuildingCost(resources, building.constructionCost));
  const constructionReadyCount = affordableBuildings.length;
  const nextSuggestedBuilding = affordableBuildings[0] ?? availableBuildings[0] ?? null;
  const nextSuggestedPlot = settlementPlots.find(plot => isSettlementPlotUnlocked(plot, currentWagonStage.id) && !buildingPlacements[plot.id]) ?? null;
  const maxBuildingLevelForStage = settlementMaxBuildingLevelByStage[currentWagonStage.id] ?? 1;
  const upgradeMaterialReadyIds = new Set(
    buildings
      .filter(building => {
        const level = buildingLevels[building.id] ?? 0;
        if (level <= 0 || level >= building.maxLevel || level >= maxBuildingLevelForStage || !isBuildingUnlocked(building.id)) return false;
        const next = getBuildingLevelDefinition(building.id, level + 1);
        return Boolean(next && canPayBuildingCost(resources, next.cost));
      })
      .map(building => building.id)
  );
  const guidedPlotId = (
    tutorialFocus?.kind === 'settlement-first-plot' || tutorialFocus?.kind === 'settlement-building'
  ) && !selectedPlotId
    ? settlementPlots.find(plot => isSettlementPlotUnlocked(plot, currentWagonStage.id) && !buildingPlacements[plot.id])?.id ?? null
    : null;
  const activeBonusIds = new Set(settlementAdjacencyBonuses.map(bonus => bonus.id));
  const districtCodexRows = adjacencyRecipes
    .map(bonus => {
      const state = districtRecipeState(
        bonus,
        activeBonusIds,
        buildingLevels,
        buildingPlacements,
        isBuildingUnlocked
      );
      return {
        bonus,
        state,
        tone: settlementDistrictTone(bonus),
        category: settlementDistrictCategory(bonus),
        first: buildings.find(building => building.id === bonus.buildingA) ?? null,
        second: buildings.find(building => building.id === bonus.buildingB) ?? null
      };
    })
    .sort((first, second) => {
      const order = { active: 0, separated: 1, unplaced: 2, unbuilt: 3, locked: 4 } as const;
      return order[first.state] - order[second.state];
    });
  const districtPlacementAttentionCount = districtCodexRows.filter(
    row => row.state === 'separated' || row.state === 'unplaced'
  ).length;
  const districtDevelopingCount = districtCodexRows.filter(
    row => row.state === 'unbuilt' || row.state === 'locked'
  ).length;

  // Read-only preview, using the same adjacency calculation as the game. No costs or levels are committed here.
  const previewBonusesAtPlot = (plot: (typeof settlementPlots)[number], buildingId: string) => {
    return analyzeSettlementAdjacency(
      { ...buildingPlacements, [plot.id]: buildingId },
      { ...buildingLevels, [buildingId]: Math.max(1, buildingLevels[buildingId] ?? 0) },
      activeFaction
    ).bonuses.filter(bonus => !activeBonusIds.has(bonus.id));
  };
  const previewBonuses = (buildingId: string) => {
    if (!selectedPlot) return [];
    return previewBonusesAtPlot(selectedPlot, buildingId);
  };
  const previewBuilding = previewBuildingId
    ? availableBuildings.find(building => building.id === previewBuildingId) ?? null
    : null;
  const previewDistrictBonuses = previewBuilding ? previewBonuses(previewBuilding.id) : [];
  const previewPlacementQuality = settlementPlacementQuality(previewDistrictBonuses.length);
  const previewPartnerPlotIds = new Set(
    previewDistrictBonuses.flatMap(bonus => {
      if (!selectedPlotId) return [];
      if (bonus.plotA === selectedPlotId) return [bonus.plotB];
      if (bonus.plotB === selectedPlotId) return [bonus.plotA];
      return [];
    })
  );
  const planningBuilding = planningBuildingId
    ? availableBuildings.find(building => building.id === planningBuildingId) ?? null
    : null;
  const blueprintPlanRatings = planningBuilding
    ? settlementPlots.flatMap(plot => {
        if (!isSettlementPlotUnlocked(plot, currentWagonStage.id) || buildingPlacements[plot.id]) return [];
        const bonuses = previewBonusesAtPlot(plot, planningBuilding.id);
        const quality = settlementPlacementQuality(bonuses.length);
        return [{
          plotId: plot.id,
          districtCount: bonuses.length,
          qualityLabel: quality.label,
          qualityTone: quality.tone,
          qualitySummary: quality.summary
        }];
      })
    : [];
  const blueprintPlanRatingByPlot = new Map(
    blueprintPlanRatings.map(rating => [rating.plotId, rating] as const)
  );
  const bestPlacementQualityForBuilding = (buildingId: string) => {
    const districtCount = settlementPlots.reduce((best, plot) => {
      if (!isSettlementPlotUnlocked(plot, currentWagonStage.id) || buildingPlacements[plot.id]) return best;
      return Math.max(best, previewBonusesAtPlot(plot, buildingId).length);
    }, 0);
    return settlementPlacementQuality(districtCount);
  };
  const districtOpportunities = settlementPlots.flatMap(plot => {
    if (!isSettlementPlotUnlocked(plot, currentWagonStage.id) || buildingPlacements[plot.id]) return [];

    const candidates = availableBuildings
      .map(building => ({
        building,
        bonuses: previewBonusesAtPlot(plot, building.id),
        affordable: canPayBuildingCost(resources, building.constructionCost)
      }))
      .filter(candidate => candidate.bonuses.length > 0)
      .sort((first, second) => {
        const districtDifference = second.bonuses.length - first.bonuses.length;
        if (districtDifference !== 0) return districtDifference;
        return Number(second.affordable) - Number(first.affordable);
      });
    if (!candidates.length) return [];

    const preferred = candidates[0];
    if (!preferred) return [];
    const distinctBonusIds = new Set(candidates.flatMap(candidate => candidate.bonuses.map(bonus => bonus.id)));
    const quality = settlementPlacementQuality(preferred.bonuses.length);
    return [{
      plotId: plot.id,
      count: distinctBonusIds.size,
      placementDistrictCount: preferred.bonuses.length,
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      qualitySummary: quality.summary,
      buildingId: preferred.building.id,
      buildingName: preferred.building.name,
      bonusName: preferred.bonuses[0]?.name ?? 'District',
      affordable: preferred.affordable
    }];
  });
  const districtOpportunityByPlot = new Map(
    districtOpportunities.map(opportunity => [opportunity.plotId, opportunity] as const)
  );
  const showDistrictOpportunities = !selectedPlotId && !selectedBuildingId && !unlockCelebration && !blueprintPlannerOpen;
  const selectedBuildingCurrentBonuses = selectedBuilding
    ? settlementAdjacencyBonuses.filter(
        bonus => bonus.buildingA === selectedBuilding.id || bonus.buildingB === selectedBuilding.id
      )
    : [];
  const selectedBuildingCurrentBonusIds = new Set(selectedBuildingCurrentBonuses.map(bonus => bonus.id));
  const relocationPlanRatings = selectedBuilding
    ? settlementPlots.flatMap(plot => {
        if (!isSettlementPlotUnlocked(plot, currentWagonStage.id) || buildingPlacements[plot.id]) return [];

        const placementsWithoutSelected = Object.fromEntries(
          Object.entries(buildingPlacements).map(([plotId, buildingId]) => [
            plotId,
            buildingId === selectedBuilding.id ? null : buildingId
          ])
        ) as Record<string, string | null>;
        const hypotheticalPlacements = {
          ...placementsWithoutSelected,
          [plot.id]: selectedBuilding.id
        };
        const futureBonuses = analyzeSettlementAdjacency(
          hypotheticalPlacements,
          buildingLevels,
          activeFaction
        ).bonuses.filter(
          bonus => bonus.buildingA === selectedBuilding.id || bonus.buildingB === selectedBuilding.id
        );
        const futureIds = new Set(futureBonuses.map(bonus => bonus.id));
        const gainedBonuses = futureBonuses.filter(bonus => !selectedBuildingCurrentBonusIds.has(bonus.id));
        const lostBonuses = selectedBuildingCurrentBonuses.filter(bonus => !futureIds.has(bonus.id));
        const net = gainedBonuses.length - lostBonuses.length;
        const tone = net > 0 ? 'positive' as const : net < 0 ? 'warning' as const : 'neutral' as const;
        const label = net > 0 ? 'Gain +' + net : net < 0 ? 'Loss ' + net : gainedBonuses.length ? 'Trade' : 'Same';

        return [{
          plotId: plot.id,
          gainedBonuses,
          lostBonuses,
          futureBonuses,
          gain: gainedBonuses.length,
          loss: lostBonuses.length,
          net,
          tone,
          label
        }];
      })
    : [];
  const relocationPlanByPlot = new Map(
    relocationPlanRatings.map(rating => [rating.plotId, rating] as const)
  );
  const relocationTarget = relocationTargetPlotId
    ? relocationPlanByPlot.get(relocationTargetPlotId) ?? null
    : null;
  const bestRelocationNet = relocationPlanRatings.length
    ? Math.max(...relocationPlanRatings.map(rating => rating.net))
    : 0;
  const networkOptimizationCandidates = Object.entries(buildingPlacements).flatMap(([sourcePlotId, buildingId]) => {
    if (!buildingId || (buildingLevels[buildingId] ?? 0) <= 0) return [];
    const building = buildings.find(candidate => candidate.id === buildingId);
    if (!building) return [];

    return settlementPlots.flatMap(targetPlot => {
      if (!isSettlementPlotUnlocked(targetPlot, currentWagonStage.id) || buildingPlacements[targetPlot.id]) return [];

      const hypotheticalPlacements = {
        ...buildingPlacements,
        [sourcePlotId]: null,
        [targetPlot.id]: buildingId
      };
      const futureBonuses = analyzeSettlementAdjacency(
        hypotheticalPlacements,
        buildingLevels,
        activeFaction
      ).bonuses;
      const improvement = futureBonuses.length - settlementAdjacencyBonuses.length;
      if (improvement <= 0) return [];

      const futureIds = new Set(futureBonuses.map(bonus => bonus.id));
      const gainedBonuses = futureBonuses.filter(bonus => !activeBonusIds.has(bonus.id));
      const lostBonuses = settlementAdjacencyBonuses.filter(bonus => !futureIds.has(bonus.id));

      return [{
        buildingId,
        buildingName: building.name,
        sourcePlotId,
        targetPlotId: targetPlot.id,
        currentDistrictCount: settlementAdjacencyBonuses.length,
        futureDistrictCount: futureBonuses.length,
        improvement,
        gainedBonuses,
        lostBonuses
      }];
    });
  }).sort((first, second) => {
    const improvementDifference = second.improvement - first.improvement;
    if (improvementDifference !== 0) return improvementDifference;
    const futureDifference = second.futureDistrictCount - first.futureDistrictCount;
    if (futureDifference !== 0) return futureDifference;
    return first.buildingName.localeCompare(second.buildingName);
  });
  const bestNetworkOptimization = networkOptimizationCandidates[0] ?? null;
  const showNetworkOptimizationHint =
    Boolean(bestNetworkOptimization) &&
    !selectedBuildingId &&
    !selectedPlotId &&
    !blueprintPlannerOpen &&
    !unlockCelebration;

  const stageLabel = activeFaction === 'elf'
    ? currentWagonStage.id === 'capital' ? 'STARROOT CONCLAVE'
      : currentWagonStage.id === 'stronghold' ? 'WORLDROOT SANCTUARY'
      : currentWagonStage.id === 'town' ? 'HEARTGROVE ENCLAVE'
      : currentWagonStage.id === 'fort' ? 'HEARTGROVE WARDHOLD'
      : currentWagonStage.id === 'settlement' ? 'HEARTGROVE SANCTUARY' : 'HEARTGROVE REFUGE'
    : activeFaction === 'orc'
      ? currentWagonStage.id === 'capital' ? 'WARFIRE CONFEDERACY'
        : currentWagonStage.id === 'stronghold' ? 'EMBERCLAN HIGH WARHOLD'
        : currentWagonStage.id === 'town' ? 'EMBERCLAN GREAT WARHOLD'
        : currentWagonStage.id === 'fort' ? 'EMBERCLAN WARHOLD'
        : currentWagonStage.id === 'settlement' ? 'EMBERCLAN WARCAMP' : 'EMBERCLAN CAMP'
      : currentWagonStage.id === 'grand' ? 'GREENKEEP GRAND CAMPAIGN'
        : currentWagonStage.id === 'capital' ? 'GREENKEEP CAPITAL'
        : currentWagonStage.id === 'stronghold' ? 'GREENKEEP STRONGHOLD'
        : currentWagonStage.id === 'town' ? 'GREENKEEP TOWN'
        : currentWagonStage.id === 'fort' ? 'GREENKEEP FORT'
        : currentWagonStage.id === 'settlement' ? 'GREENKEEP SETTLEMENT' : 'REFUGEE CAMP';
  const unlockedPlotIds = settlementPlots
    .filter(plot => isSettlementPlotUnlocked(plot, currentWagonStage.id))
    .map(plot => plot.id)
    .sort();
  const availableBuildingIds = availableBuildings.map(building => building.id).sort();
  const upgradeReadyIds = [...upgradeMaterialReadyIds].sort();

  useEffect(() => {
    const currentSnapshot: SettlementUnlockSnapshot = {
      stageId: currentWagonStage.id,
      unlockedPlotIds,
      availableBuildingIds,
      upgradeMaterialReadyIds: upgradeReadyIds
    };
    const previous = settlementUnlockSnapshots.get(activeFaction);
    settlementUnlockSnapshots.set(activeFaction, currentSnapshot);

    if (!previous) return;

    const newBuildingId = availableBuildingIds.find(id => !previous.availableBuildingIds.includes(id));
    const newPlotId = unlockedPlotIds.find(id => !previous.unlockedPlotIds.includes(id));
    const newUpgradeId = upgradeReadyIds.find(id => !previous.upgradeMaterialReadyIds.includes(id));

    let next: SettlementUnlockCelebration | null = null;
    if (previous.stageId !== currentSnapshot.stageId) {
      next = {
        kind: 'stage',
        label: 'KINGDOM EXPANDED',
        detail: stageLabel,
        plotId: 'plot_center'
      };
    } else if (newBuildingId) {
      const building = buildings.find(candidate => candidate.id === newBuildingId);
      next = {
        kind: 'building',
        label: 'NEW BLUEPRINT',
        detail: (building?.name ?? 'Building') + ' unlocked',
        plotId: nextSuggestedPlot?.id,
        buildingId: newBuildingId
      };
    } else if (newPlotId) {
      next = {
        kind: 'plot',
        label: 'NEW LAND',
        detail: 'A new settlement plot is available',
        plotId: newPlotId
      };
    } else if (newUpgradeId) {
      const building = buildings.find(candidate => candidate.id === newUpgradeId);
      const plotId = Object.entries(buildingPlacements).find(([, id]) => id === newUpgradeId)?.[0];
      next = {
        kind: 'upgrade',
        label: 'UPGRADE MATERIALS READY',
        detail: (building?.name ?? 'Building') + ' can be reviewed',
        plotId,
        buildingId: newUpgradeId
      };
    }

    if (!next) return;

    setUnlockCelebration(next);
    const timer = setTimeout(() => setUnlockCelebration(null), 2600);
    return () => clearTimeout(timer);
  }, [
    activeFaction,
    currentWagonStage.id,
    stageLabel,
    unlockedPlotIds.join('|'),
    availableBuildingIds.join('|'),
    upgradeReadyIds.join('|')
  ]);
  const safeFontScale = Number.isFinite(fontScale) ? fontScale : 1;
  const safeViewportHeight = Number.isFinite(viewportHeight) ? viewportHeight : 800;
  const mapHeight = Math.max(
    600,
    Math.min(780, Math.round(safeViewportHeight * 0.75 + Math.max(0, safeFontScale - 1) * 120))
  );
  const safeViewportWidth = Number.isFinite(viewportWidth) ? viewportWidth : 360;
  const mapWidth = Math.max(300, safeViewportWidth - 20);
  const districtConnections = settlementAdjacencyBonuses.flatMap(bonus => {
    const first = settlementPlotCenters[bonus.plotA];
    const second = settlementPlotCenters[bonus.plotB];
    if (!first || !second) return [];

    const x1 = first.x * mapWidth;
    const y1 = first.y * mapHeight;
    const x2 = second.x * mapWidth;
    const y2 = second.y * mapHeight;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const midpointX = (x1 + x2) / 2;
    const midpointY = (y1 + y2) / 2;
    const focused =
      selectedDistrictId === bonus.id ||
      (Boolean(selectedBuildingId) && (bonus.buildingA === selectedBuildingId || bonus.buildingB === selectedBuildingId));
    const tone = settlementDistrictTone(bonus);
    const color = semanticColor(theme, tone);

    return [{
      id: bonus.id,
      name: bonus.name,
      tone,
      category: settlementDistrictCategory(bonus),
      color,
      focused,
      style: {
        left: midpointX - length / 2,
        top: midpointY - 1,
        width: length,
        transform: [{ rotate: angle + 'deg' }]
      } as ViewStyle,
      zoneStyle: {
        left: midpointX - length / 2 - 10,
        top: midpointY - 14,
        width: length + 20,
        height: 28,
        transform: [{ rotate: angle + 'deg' }]
      } as ViewStyle,
      labelStyle: {
        left: horizontal ? midpointX - 52 : midpointX + 10,
        top: horizontal ? midpointY - 25 : midpointY - 10,
        width: 104
      } as ViewStyle
    }];
  });
  const districtOverlayCounts: Record<DistrictOverlayFilter, number> = {
    all: settlementAdjacencyBonuses.length,
    economy: settlementAdjacencyBonuses.filter(bonus => settlementDistrictCategory(bonus) === 'economy').length,
    military: settlementAdjacencyBonuses.filter(bonus => settlementDistrictCategory(bonus) === 'military').length,
    command: settlementAdjacencyBonuses.filter(bonus => settlementDistrictCategory(bonus) === 'command').length
  };
  const visibleDistrictConnections = districtOverlayFilter === 'all'
    ? districtConnections
    : districtConnections.filter(connection => connection.category === districtOverlayFilter);
  const districtFocusActive =
    Boolean(selectedBuildingId || selectedDistrictId) &&
    visibleDistrictConnections.some(connection => connection.focused);
  const previewDistrictConnections = previewDistrictBonuses.flatMap(bonus => {
    const first = settlementPlotCenters[bonus.plotA];
    const second = settlementPlotCenters[bonus.plotB];
    if (!first || !second) return [];

    const x1 = first.x * mapWidth;
    const y1 = first.y * mapHeight;
    const x2 = second.x * mapWidth;
    const y2 = second.y * mapHeight;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    return [{
      id: bonus.id,
      style: {
        left: (x1 + x2) / 2 - length / 2,
        top: (y1 + y2) / 2 - 1,
        width: length,
        transform: [{ rotate: angle + 'deg' }]
      } as ViewStyle
    }];
  });
  const relocationGainConnections = (relocationTarget?.gainedBonuses ?? []).flatMap(bonus => {
    const first = settlementPlotCenters[bonus.plotA];
    const second = settlementPlotCenters[bonus.plotB];
    if (!first || !second) return [];
    const x1 = first.x * mapWidth;
    const y1 = first.y * mapHeight;
    const x2 = second.x * mapWidth;
    const y2 = second.y * mapHeight;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return [{
      id: bonus.id,
      style: {
        left: (x1 + x2) / 2 - length / 2,
        top: (y1 + y2) / 2 - 1,
        width: length,
        transform: [{ rotate: angle + 'deg' }]
      } as ViewStyle
    }];
  });
  const relocationLossConnections = (relocationTarget?.lostBonuses ?? []).flatMap(bonus => {
    const first = settlementPlotCenters[bonus.plotA];
    const second = settlementPlotCenters[bonus.plotB];
    if (!first || !second) return [];
    const x1 = first.x * mapWidth;
    const y1 = first.y * mapHeight;
    const x2 = second.x * mapWidth;
    const y2 = second.y * mapHeight;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return [{
      id: bonus.id,
      style: {
        left: (x1 + x2) / 2 - length / 2,
        top: (y1 + y2) / 2 - 1,
        width: length,
        transform: [{ rotate: angle + 'deg' }]
      } as ViewStyle
    }];
  });
  const fortificationWeight =
    currentWagonStage.id === 'grand' ? 5
      : currentWagonStage.id === 'capital' ? 4
        : currentWagonStage.id === 'stronghold' ? 3.5
          : currentWagonStage.id === 'town' ? 3
            : 2;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.hud, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: factionAccent }]}>CART & CROWN</Text>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>{stageLabel}</Text>
          </View>
          <View style={[styles.stageBadge, { borderColor: factionAccent, backgroundColor: theme.colors.surface2 }]}>
            <Text style={[styles.stageBadgeText, { color: factionAccent }]}>{currentWagonStage.id.toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.resourceStrip, { backgroundColor: theme.colors.surface2 }]}>
          {settlementResourceOrder.map(resource => (
            <View key={resource} style={styles.resourceCell}>
              <ResourceSprite resource={resource} size={18} />
              <View style={styles.resourceCopy}>
                <Text style={[styles.resourceValue, { color: theme.colors.text }]}>{resources[resource]}</Text>
                <Text style={[styles.resourceLabel, { color: theme.colors.textMuted }]}>{settlementResourceLabels[resource]}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.hudFooter}>
          <View style={styles.hudStats}>
            <SemanticChip label={placedIds.length + ' built'} tone="neutral" compact />
            <SemanticChip label={settlementAdjacencyBonuses.length + ' districts'} tone={settlementAdjacencyBonuses.length ? 'positive' : 'neutral'} compact />
            {bestNetworkOptimization ? (
              <SemanticChip
                label={bestNetworkOptimization.currentDistrictCount + '→' + bestNetworkOptimization.futureDistrictCount + ' layout'}
                tone="positive"
                compact
              />
            ) : null}
            {districtOpportunities.length ? <SemanticChip label={districtOpportunities.length + ' district spots'} tone="positive" compact /> : null}
            {constructionReadyCount ? <SemanticChip label={constructionReadyCount + ' build ready'} tone="currency" compact /> : null}
            {upgradeMaterialReadyIds.size ? <SemanticChip label={upgradeMaterialReadyIds.size + ' upgrade mats'} tone="positive" compact /> : null}
          </View>
          {nextSuggestedBuilding && nextSuggestedPlot ? (
            <View style={styles.nextGoalInline}>
              <Text style={[styles.nextGoalEyebrow, { color: constructionReadyCount ? theme.colors.gold : theme.colors.textMuted }]}>{constructionReadyCount ? 'READY' : 'NEXT'}</Text>
              <Text style={[styles.nextGoalTitle, { color: theme.colors.text }]} numberOfLines={1}>{nextSuggestedBuilding.name}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {availableBuildings.length && !selectedBuildingId ? (
        blueprintPlannerOpen ? (
          <View
            testID="blueprint-planner"
            style={[styles.blueprintPlanner, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
          >
            <View style={styles.blueprintPlannerHeader}>
              <View style={styles.blueprintPlannerCopy}>
                <Text style={[styles.blueprintPlannerEyebrow, { color: theme.colors.textMuted }]}>PLAN BLUEPRINT</Text>
                <Text style={[styles.blueprintPlannerTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  {planningBuilding ? planningBuilding.name : 'Choose a building'}
                </Text>
              </View>
              <Pressable
                testID="blueprint-planner-close"
                accessibilityRole="button"
                accessibilityLabel="Close blueprint planner"
                onPress={() => {
                  setBlueprintPlannerOpen(false);
                  setPlanningBuildingId(null);
                  setPreviewBuildingId(null);
                  setSelectedPlotId(null);
                }}
                style={[styles.blueprintPlannerClose, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface2 }]}
              >
                <Text style={[styles.blueprintPlannerCloseText, { color: theme.colors.textMuted }]}>CLOSE</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.blueprintPlannerRow}>
              {availableBuildings.map(building => {
                const bestQuality = bestPlacementQualityForBuilding(building.id);
                const active = planningBuildingId === building.id;
                const affordable = canPayBuildingCost(resources, building.constructionCost);
                return (
                  <Pressable
                    key={building.id}
                    testID={'blueprint-planner-select-' + building.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={'Plan ' + building.name + ', best placement ' + bestQuality.label + ', ' + bestQuality.summary}
                    onPress={() => {
                      setPlanningBuildingId(building.id);
                      setPreviewBuildingId(selectedPlotId ? building.id : null);
                      setUnlockCelebration(null);
                    }}
                    style={[
                      styles.blueprintPlannerChip,
                      {
                        borderColor: active ? theme.colors.gold : semanticColor(theme, bestQuality.tone),
                        backgroundColor: active ? theme.colors.surface2 : theme.colors.surface1
                      }
                    ]}
                  >
                    <Text style={[styles.blueprintPlannerChipName, { color: theme.colors.text }]} numberOfLines={1}>{building.name}</Text>
                    <Text style={[styles.blueprintPlannerChipQuality, { color: semanticColor(theme, bestQuality.tone) }]}>
                      {bestQuality.label}{affordable ? ' · ready' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <Pressable
            testID="blueprint-planner-open"
            accessibilityRole="button"
            accessibilityLabel="Plan a building blueprint across all settlement plots"
            onPress={() => {
              const first = nextSuggestedBuilding ?? availableBuildings[0] ?? null;
              setBlueprintPlannerOpen(true);
              setPlanningBuildingId(first?.id ?? null);
              setPreviewBuildingId(null);
              setSelectedPlotId(null);
              setSelectedBuildingId(null);
              setSelectedDistrictId(null);
              setDistrictCodexOpen(false);
              setUnlockCelebration(null);
            }}
            style={[styles.blueprintPlannerLauncher, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
          >
            <View style={styles.blueprintPlannerLauncherCopy}>
              <Text style={[styles.blueprintPlannerEyebrow, { color: theme.colors.textMuted }]}>PLAN BLUEPRINT</Text>
              <Text style={[styles.blueprintPlannerLauncherText, { color: theme.colors.text }]} numberOfLines={1}>
                Compare every open plot at once
              </Text>
            </View>
            <Text style={[styles.blueprintPlannerLauncherAction, { color: theme.colors.gold }]}>PLAN</Text>
          </Pressable>
        )
      ) : null}

      {showNetworkOptimizationHint && bestNetworkOptimization ? (
        <Pressable
          testID="district-network-hint"
          accessibilityRole="button"
          accessibilityLabel={
            'Better layout available, ' +
            bestNetworkOptimization.currentDistrictCount +
            ' to ' +
            bestNetworkOptimization.futureDistrictCount +
            ' districts. Preview moving ' +
            bestNetworkOptimization.buildingName +
            ' to ' +
            (settlementPlotLabels[bestNetworkOptimization.targetPlotId] ?? bestNetworkOptimization.targetPlotId)
          }
          onPress={() => {
            setSelectedDistrictId(null);
            setDistrictCodexOpen(false);
            setSelectedBuildingId(bestNetworkOptimization.buildingId);
            setRelocationTargetPlotId(bestNetworkOptimization.targetPlotId);
            setSelectedPlotId(null);
            setPreviewBuildingId(null);
            setBlueprintPlannerOpen(false);
            setPlanningBuildingId(null);
            setUnlockCelebration(null);
            setMessage(null);
          }}
          style={[
            styles.networkHint,
            {
              backgroundColor: theme.colors.surface1,
              borderColor: semanticColor(theme, 'positive')
            }
          ]}
        >
          <View style={styles.networkHintCopy}>
            <Text style={[styles.networkHintEyebrow, { color: semanticColor(theme, 'positive') }]}>BETTER LAYOUT AVAILABLE</Text>
            <Text style={[styles.networkHintTitle, { color: theme.colors.text }]}>
              {bestNetworkOptimization.currentDistrictCount} → {bestNetworkOptimization.futureDistrictCount} districts
            </Text>
            <Text style={[styles.networkHintDetail, { color: theme.colors.textMuted }]} numberOfLines={1}>
              Preview {bestNetworkOptimization.buildingName} → {settlementPlotLabels[bestNetworkOptimization.targetPlotId] ?? bestNetworkOptimization.targetPlotId}
            </Text>
          </View>
          <Text style={[styles.networkHintAction, { color: theme.colors.gold }]}>PREVIEW</Text>
        </Pressable>
      ) : null}

      <View style={[styles.map, { height: mapHeight, backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
        <View pointerEvents="none" style={styles.backdrop}>
          <SettlementTerrainBackdrop faction={activeFaction} stageId={currentWagonStage.id} />
        </View>
        {unlockCelebration ? (
          <View
            pointerEvents="none"
            testID="settlement-unlock-celebration"
            style={[styles.unlockCelebration, { backgroundColor: theme.colors.surface1, borderColor: factionAccent }]}
          >
            <Text style={[styles.unlockCelebrationLabel, { color: factionAccent }]}>{unlockCelebration.label}</Text>
            <Text style={[styles.unlockCelebrationDetail, { color: theme.colors.text }]} numberOfLines={1}>{unlockCelebration.detail}</Text>
          </View>
        ) : null}
        {visibleDistrictConnections.length ? (
          <>
            <View pointerEvents="none" style={styles.districtZoneLayer}>
              {visibleDistrictConnections.map(connection => {
                const dimmed = districtFocusActive && !connection.focused;
                const zoneFill = blendColor(
                  connection.color,
                  theme.colors.surface1,
                  connection.focused ? 0.2 : dimmed ? 0.035 : 0.1
                );
                const zoneBorder = blendColor(
                  connection.color,
                  theme.colors.surface1,
                  connection.focused ? 0.72 : dimmed ? 0.2 : 0.44
                );
                return (
                  <View
                    key={'zone-' + connection.id}
                    testID={'district-zone-' + connection.id}
                    style={[
                      connection.zoneStyle,
                      styles.districtZone,
                      {
                        backgroundColor: zoneFill,
                        borderColor: zoneBorder
                      }
                    ]}
                  />
                );
              })}
            </View>
            <View pointerEvents="box-none" style={styles.districtTagLayer}>
              {visibleDistrictConnections.map(connection => {
                const dimmed = districtFocusActive && !connection.focused;
                const zoneBorder = blendColor(
                  connection.color,
                  theme.colors.surface1,
                  connection.focused ? 0.72 : dimmed ? 0.2 : 0.44
                );
                const selectedDistrictTag = selectedDistrictId === connection.id;
                return (
                  <Pressable
                    key={'tag-' + connection.id}
                    testID={'district-zone-label-' + connection.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedDistrictTag }}
                    accessibilityLabel={'Focus ' + connection.name + ' district'}
                    accessibilityHint="Show this district bonus and its two buildings."
                    onPress={() => {
                      setSelectedDistrictId(selectedDistrictTag ? null : connection.id);
                      setDistrictCodexOpen(false);
                      setSelectedBuildingId(null);
                      setRelocationTargetPlotId(null);
                      setSelectedPlotId(null);
                      setPreviewBuildingId(null);
                      setBlueprintPlannerOpen(false);
                      setPlanningBuildingId(null);
                      setUnlockCelebration(null);
                      setMessage(null);
                    }}
                    style={[
                      connection.labelStyle,
                      styles.districtZoneLabel,
                      {
                        backgroundColor: theme.colors.surface1,
                        borderColor: selectedDistrictTag ? connection.color : zoneBorder,
                        borderWidth: selectedDistrictTag ? 2 : 1,
                        opacity: connection.focused ? 1 : dimmed ? 0.42 : 0.76
                      }
                    ]}
                  >
                    <View style={[styles.districtZoneDot, { backgroundColor: connection.color }]} />
                    <Text style={[styles.districtZoneText, { color: connection.color }]} numberOfLines={1}>
                      {connection.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
        <View pointerEvents="none" style={styles.districtLayer}>
          {visibleDistrictConnections.map(connection => (
            <React.Fragment key={connection.id}>
              <View
                style={[
                  connection.style,
                  styles.districtLinkGlow,
                  { backgroundColor: connection.color, opacity: connection.focused ? 0.3 : districtFocusActive ? 0.05 : 0.1 }
                ]}
              />
              <View
                testID={'district-link-' + connection.id}
                style={[
                  connection.style,
                  styles.districtLink,
                  { backgroundColor: connection.color, opacity: connection.focused ? 0.96 : districtFocusActive ? 0.28 : 0.56 }
                ]}
              />
            </React.Fragment>
          ))}
        </View>
        {previewDistrictConnections.length ? (
          <View pointerEvents="none" style={styles.districtPreviewLayer}>
            {previewDistrictConnections.map(connection => (
              <View
                key={connection.id}
                testID={'district-preview-link-' + connection.id}
                style={[
                  connection.style,
                  styles.districtPreviewLink,
                  { borderTopColor: theme.colors.gold }
                ]}
              />
            ))}
          </View>
        ) : null}
        {relocationGainConnections.length || relocationLossConnections.length ? (
          <View pointerEvents="none" style={styles.relocationPreviewLayer}>
            {relocationGainConnections.map(connection => (
              <View
                key={'gain-' + connection.id}
                testID={'relocation-gain-link-' + connection.id}
                style={[
                  connection.style,
                  styles.relocationPreviewLink,
                  { borderTopColor: semanticColor(theme, 'positive') }
                ]}
              />
            ))}
            {relocationLossConnections.map(connection => (
              <View
                key={'loss-' + connection.id}
                testID={'relocation-loss-link-' + connection.id}
                style={[
                  connection.style,
                  styles.relocationPreviewLink,
                  { borderTopColor: semanticColor(theme, 'warning') }
                ]}
              />
            ))}
          </View>
        ) : null}
        {settlementPlots.map(plot => {
          const unlocked = isSettlementPlotUnlocked(plot, currentWagonStage.id);
          const buildingId = buildingPlacements[plot.id] ?? null;
          const building = buildingId ? buildings.find(candidate => candidate.id === buildingId) ?? null : null;
          const level = building ? buildingLevels[building.id] ?? 0 : 0;
          const plotSelected = selectedPlotId === plot.id;
          const buildingSelected = Boolean(building) && selectedBuildingId === building?.id;
          const tutorialPlotFocused = guidedPlotId === plot.id;
          const roleTone = building ? buildingRolePresentation[building.role]?.tone ?? 'neutral' : 'neutral';
          const roleColor = semanticColor(theme, roleTone);
          const relocationTargetSelected = relocationTargetPlotId === plot.id;
          const districtMemberFocused = Boolean(
            building &&
            selectedDistrict &&
            (building.id === selectedDistrict.buildingA || building.id === selectedDistrict.buildingB)
          );
          const selected = plotSelected || buildingSelected || relocationTargetSelected;
          const landmark = plot.id === 'plot_center';
          const celebrationFocused =
            unlockCelebration?.plotId === plot.id ||
            (Boolean(unlockCelebration?.buildingId) && building?.id === unlockCelebration?.buildingId);
          const districtPreviewPartner = previewPartnerPlotIds.has(plot.id);
          const placementQualitySource = plotSelected && Boolean(previewBuilding);
          const districtOpportunity = districtOpportunityByPlot.get(plot.id) ?? null;
          const districtOpportunityVisible = Boolean(districtOpportunity) && showDistrictOpportunities;
          const blueprintPlanRating = blueprintPlanRatingByPlot.get(plot.id) ?? null;
          const blueprintPlanVisible = Boolean(blueprintPlanRating) && blueprintPlannerOpen && Boolean(planningBuilding) && !plotSelected;
          const relocationPlan = relocationPlanByPlot.get(plot.id) ?? null;
          const relocationPlanVisible = Boolean(relocationPlan) && Boolean(selectedBuildingId) && !building;
          const buildReady = unlocked && !building && !selectedBuildingId && !plotSelected && !blueprintPlannerOpen && constructionReadyCount > 0;
          const recommendedBuildPlot = buildReady && nextSuggestedPlot?.id === plot.id;
          const upgradeMaterialsReady = Boolean(building) && upgradeMaterialReadyIds.has(building!.id);
          const depthScale = plot.row === 0 ? 0.9 : plot.row === 2 ? 1.06 : 1;
          const buildingSize = landmark ? 88 : Math.round(62 * depthScale);
          const ambienceSize = landmark ? 110 : Math.round(82 * depthScale);
          const plotZIndex = tutorialPlotFocused || selected ? 30 : districtMemberFocused ? 29 : relocationPlanVisible ? 27 : districtPreviewPartner ? 26 : celebrationFocused ? 24 : landmark ? 16 : 5 + plot.row * 5;
          const districtCount = building ? settlementAdjacencyBonuses.filter(bonus => bonus.buildingA === building.id || bonus.buildingB === building.id).length : 0;
          const visualPosition = settlementPlotPositions[plot.id] ?? {
            left: (String(5 + plot.column * 32) + '%') as ViewStyle['left'],
            top: (String(7 + plot.row * 31) + '%') as ViewStyle['top']
          };
          return (
            <Pressable
              key={plot.id}
              testID={'settlement-' + plot.id}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: !unlocked }}
              accessibilityLabel={building
                ? building.name + ', ' + (buildingRolePresentation[building.role]?.label ?? building.role) + ', Level ' + level + ', ' + districtCount + ' active districts'
                : relocationPlan
                  ? plot.id.replace('plot_', 'Plot ') + ', relocation preview, gain ' + relocationPlan.gain + ', lose ' + relocationPlan.loss + ', net ' + (relocationPlan.net >= 0 ? '+' : '') + relocationPlan.net
                  : plot.id.replace('plot_', 'Plot ') + (unlocked ? ', empty' : ', locked until ' + plot.unlockStage)}
              accessibilityHint={!unlocked ? undefined : building ? 'Inspect levels or select this building to relocate.' : selectedBuildingId ? 'Preview this free relocation destination before confirming.' : 'Show construction choices. Selecting a plot does not spend resources.'}
              disabled={!unlocked}
              onPress={() => {
                setMessage(null);
                setUnlockCelebration(null);
                setSelectedDistrictId(null);
                setDistrictCodexOpen(false);
                if (building) {
                  setSelectedBuildingId(buildingSelected ? null : building.id);
                  setRelocationTargetPlotId(null);
                  setSelectedPlotId(null);
                  setPreviewBuildingId(null);
                  setBlueprintPlannerOpen(false);
                  setPlanningBuildingId(null);
                  return;
                }
                if (selectedBuildingId) {
                  setRelocationTargetPlotId(relocationTargetSelected ? null : plot.id);
                  setPreviewBuildingId(null);
                  setSelectedPlotId(null);
                  return;
                }
                if (plotSelected) {
                  setSelectedPlotId(null);
                  setPreviewBuildingId(null);
                } else {
                  const opportunityCandidate = districtOpportunityByPlot.get(plot.id);
                  const districtCandidate = opportunityCandidate
                    ? availableBuildings.find(candidate => candidate.id === opportunityCandidate.buildingId) ?? null
                    : availableBuildings.find(candidate => previewBonusesAtPlot(plot, candidate.id).length > 0) ?? null;
                  const previewCandidate = planningBuilding ?? districtCandidate ?? affordableBuildings[0] ?? availableBuildings[0] ?? null;
                  setSelectedPlotId(plot.id);
                  setPreviewBuildingId(previewCandidate?.id ?? null);
                }
                if (tutorialPlotFocused && tutorialFocus?.kind === 'settlement-first-plot') onTutorialFocusComplete?.();
              }}
              style={[
                styles.plot,
                {
                  left: visualPosition.left,
                  top: visualPosition.top,
                  backgroundColor: 'transparent',
                  borderColor: tutorialPlotFocused || selected
                    ? theme.colors.gold
                    : building
                      ? 'transparent'
                      : relocationPlanVisible && relocationPlan
                        ? semanticColor(theme, relocationPlan.tone)
                        : blueprintPlanVisible && blueprintPlanRating
                          ? semanticColor(theme, blueprintPlanRating.qualityTone)
                          : districtOpportunityVisible
                            ? semanticColor(theme, 'positive')
                            : recommendedBuildPlot
                              ? theme.colors.gold
                              : buildReady
                                ? factionAccent
                                : theme.colors.border,
                  borderWidth: tutorialPlotFocused || selected ? 2.5 : building ? 0 : relocationPlanVisible ? 2 : blueprintPlanVisible ? 2 : districtOpportunityVisible ? 2 : recommendedBuildPlot ? 2.25 : 1.5,
                  borderStyle: building || selected || tutorialPlotFocused || buildReady || blueprintPlanVisible || relocationPlanVisible ? 'solid' : 'dashed',
                  zIndex: plotZIndex,
                  transform: tutorialPlotFocused ? [{ scale: 1.04 }] : selected ? [{ scale: 1.025 }] : undefined
                },
                landmark ? styles.landmarkPlot : undefined
              ]}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.plotSurface,
                  {
                    backgroundColor: building ? theme.colors.surface1 : unlocked ? 'transparent' : theme.colors.surface3,
                    opacity: building ? 0.22 : unlocked ? 0.08 : 0.78
                  }
                ]}
              />
              {tutorialPlotFocused ? (
                <View pointerEvents="none" style={[styles.plotGuideBadge, { backgroundColor: theme.colors.gold }]}>
                  <Text style={styles.plotGuideText}>{tutorialFocus?.kind === 'settlement-building' ? 'TAP EMPTY PLOT' : tutorialFocus?.label}</Text>
                </View>
              ) : null}
              {districtPreviewPartner ? (
                <View
                  pointerEvents="none"
                  testID={'district-preview-partner-' + plot.id}
                  style={[styles.districtPreviewPartnerRing, landmark ? styles.landmarkDistrictPreviewPartnerRing : undefined, { borderColor: theme.colors.gold }]}
                />
              ) : null}
              {relocationPlanVisible && relocationPlan ? (
                <View
                  pointerEvents="none"
                  accessible
                  accessibilityLabel={'Relocation ' + relocationPlan.label + ', gain ' + relocationPlan.gain + ', lose ' + relocationPlan.loss + ', net ' + (relocationPlan.net >= 0 ? '+' : '') + relocationPlan.net}
                  testID={'relocation-plan-' + plot.id}
                  style={[
                    styles.relocationPlanBadge,
                    {
                      backgroundColor: theme.colors.surface1,
                      borderColor: semanticColor(theme, relocationPlan.tone)
                    }
                  ]}
                >
                  <Text style={[styles.relocationPlanText, { color: semanticColor(theme, relocationPlan.tone) }]}>
                    +{relocationPlan.gain} / -{relocationPlan.loss} · {relocationPlan.net >= 0 ? '+' : ''}{relocationPlan.net}
                  </Text>
                  {relocationPlan.net === bestRelocationNet && relocationPlanRatings.length > 1 ? (
                    <Text style={[styles.relocationPlanBest, { color: theme.colors.gold }]}>BEST</Text>
                  ) : null}
                </View>
              ) : null}
              {blueprintPlanVisible && blueprintPlanRating ? (
                <View
                  pointerEvents="none"
                  accessible
                  accessibilityLabel={blueprintPlanRating.qualityLabel + ' placement, ' + blueprintPlanRating.qualitySummary + ', for ' + (planningBuilding?.name ?? 'planned building')}
                  testID={'blueprint-plan-quality-' + plot.id}
                  style={[
                    styles.blueprintPlanQualityBadge,
                    {
                      backgroundColor: theme.colors.surface1,
                      borderColor: semanticColor(theme, blueprintPlanRating.qualityTone)
                    }
                  ]}
                >
                  <Text style={[styles.blueprintPlanQualityText, { color: semanticColor(theme, blueprintPlanRating.qualityTone) }]}>
                    {blueprintPlanRating.qualityLabel.toUpperCase()} · {blueprintPlanRating.districtCount}
                  </Text>
                </View>
              ) : null}
              {placementQualitySource ? (
                <View
                  pointerEvents="none"
                  accessible
                  accessibilityLabel={previewPlacementQuality.label + ' placement, ' + previewPlacementQuality.summary}
                  testID={'placement-quality-' + plot.id}
                  style={[
                    styles.placementQualityBadge,
                    {
                      backgroundColor: theme.colors.surface1,
                      borderColor: semanticColor(theme, previewPlacementQuality.tone)
                    }
                  ]}
                >
                  <Text style={[styles.placementQualityBadgeText, { color: semanticColor(theme, previewPlacementQuality.tone) }]}>
                    {previewPlacementQuality.label.toUpperCase()} · {previewDistrictBonuses.length}
                  </Text>
                </View>
              ) : null}
              {districtOpportunityVisible && districtOpportunity ? (
                <View
                  pointerEvents="none"
                  accessible
                  accessibilityLabel={districtOpportunity.qualityLabel + ' placement, ' + districtOpportunity.qualitySummary}
                  testID={'district-opportunity-' + plot.id}
                  style={[
                    styles.districtOpportunityBadge,
                    {
                      backgroundColor: theme.colors.surface1,
                      borderColor: semanticColor(theme, districtOpportunity.qualityTone)
                    }
                  ]}
                >
                  <View style={[styles.districtOpportunityDot, { backgroundColor: semanticColor(theme, districtOpportunity.qualityTone) }]} />
                  <Text style={[styles.districtOpportunityText, { color: semanticColor(theme, districtOpportunity.qualityTone) }]}>
                    {districtOpportunity.qualityLabel.toUpperCase()} · {districtOpportunity.placementDistrictCount}
                  </Text>
                </View>
              ) : null}
              {celebrationFocused ? (
                <View
                  pointerEvents="none"
                  testID={'settlement-new-focus-' + plot.id}
                  style={[styles.unlockFocusRing, landmark ? styles.landmarkUnlockFocusRing : undefined, { borderColor: factionAccent }]}
                />
              ) : null}
              {districtMemberFocused && selectedDistrict ? (
                <View
                  pointerEvents="none"
                  testID={'district-member-focus-' + plot.id}
                  style={[
                    styles.districtMemberFocusRing,
                    landmark ? styles.landmarkDistrictMemberFocusRing : undefined,
                    { borderColor: semanticColor(theme, selectedDistrictTone) }
                  ]}
                />
              ) : null}
              {building ? (
                <>
                  {selected ? (
                    <View
                      pointerEvents="none"
                      style={[
                        styles.selectionHalo,
                        landmark ? styles.landmarkSelectionHalo : undefined,
                        { borderColor: theme.colors.gold, backgroundColor: theme.colors.gold + '16' }
                      ]}
                    />
                  ) : null}
                  <View pointerEvents="none" style={[styles.buildingAmbience, landmark ? styles.landmarkAmbience : undefined]}>
                    <SettlementBuildingAmbience
                      buildingId={building.id}
                      role={building.role}
                      faction={building.faction}
                      level={level}
                      size={ambienceSize}
                    />
                  </View>
                  <View style={[styles.buildingPad, landmark ? styles.landmarkBuildingPad : undefined, selected ? styles.selectedBuildingPad : undefined]}>
                    <View pointerEvents="none" style={[styles.buildingFootprint, landmark ? styles.landmarkFootprint : undefined, { backgroundColor: roleColor }]} />
                    <BuildingSprite buildingId={building.id} faction={building.faction} size={buildingSize} />
                  </View>
                  {upgradeMaterialsReady && !selected ? (
                    <View pointerEvents="none" style={[styles.upgradeReadyBadge, { backgroundColor: theme.colors.gold }]}>
                      <Text style={styles.upgradeReadyText}>MATS</Text>
                    </View>
                  ) : null}
                  {selected || landmark ? (
                    <>
                      <Text style={[styles.plotBuildingName, { color: roleColor, backgroundColor: theme.colors.surface1 }]} numberOfLines={1}>{building.name}</Text>
                      <View style={[styles.levelPill, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                        <SemanticText tone="neutral" style={styles.plotLevel}>Lv.{level}</SemanticText>
                      </View>
                    </>
                  ) : null}
                </>
              ) : unlocked ? (
                <>
                  {buildReady ? (
                    recommendedBuildPlot ? (
                      <View
                        pointerEvents="none"
                        style={[styles.buildReadyBadge, { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold }]}
                      >
                        <Text style={styles.buildReadyText}>BUILD READY</Text>
                      </View>
                    ) : (
                      <View
                        pointerEvents="none"
                        style={[styles.buildReadyDot, { backgroundColor: factionAccent }]}
                      />
                    )
                  ) : null}
                  <View pointerEvents="none" style={styles.buildPlotArt}>
                    <SettlementBuildPlotSprite
                      terrain={plot.terrain}
                      faction={activeFaction}
                      selected={plotSelected}
                      moveTarget={Boolean(selectedBuildingId)}
                      size={84}
                      color={theme.colors.textMuted}
                    />
                  </View>
                  <View pointerEvents="none" style={[styles.emptyBadge, { backgroundColor: theme.colors.surface1 }]}>
                    <Text style={[styles.emptyPlusCompact, { color: selected || selectedBuildingId ? theme.colors.gold : semanticColor(theme, 'neutral') }]}>+</Text>
                    <SemanticText tone="neutral" style={styles.emptyText}>
                      {selectedBuildingId ? relocationTargetSelected ? 'Target' : 'Move' : 'Build'}
                    </SemanticText>
                  </View>
                </>
              ) : (
                <>
                  <LockIcon color={semanticColor(theme, 'neutral')} size={25} />
                  <SemanticText tone="neutral" style={styles.lockText}>{plot.unlockStage}</SemanticText>
                </>
              )}
            </Pressable>
          );
        })}
        {['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id) ? (
          <>
            <View pointerEvents="none" style={[styles.wallTop, { borderColor: factionAccent, borderTopWidth: fortificationWeight }]} />
            <View pointerEvents="none" style={[styles.wallBottom, { borderColor: factionAccent, borderBottomWidth: fortificationWeight }]} />
            <Text pointerEvents="none" style={[styles.gateLabel, { color: factionAccent }]}>
              {currentWagonStage.id === 'grand' ? 'GRAND GATE' : currentWagonStage.id === 'capital' ? 'CAPITAL GATE' : currentWagonStage.id === 'stronghold' ? 'STRONGHOLD GATE' : currentWagonStage.id === 'town' ? 'TOWN GATE' : 'FORT GATE'}
            </Text>
          </>
        ) : null}
      </View>
      {settlementAdjacencyBonuses.length ? (
        <View
          testID="district-overlay-controls"
          accessibilityLabel="District overlay filters"
          style={[styles.districtOverlayControls, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.districtOverlayLabel, { color: theme.colors.textMuted }]}>DISTRICT OVERLAY</Text>
          <View style={styles.districtOverlayButtons}>
            {settlementDistrictOverlayFilters.map(filter => {
              const active = districtOverlayFilter === filter.id;
              const toneColor = semanticColor(theme, filter.tone);
              return (
                <Pressable
                  key={filter.id}
                  testID={'district-overlay-filter-' + filter.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={filter.label + ' district overlay, ' + districtOverlayCounts[filter.id] + ' active'}
                  onPress={() => {
                    setDistrictOverlayFilter(filter.id);
                    setSelectedDistrictId(null);
                    setDistrictCodexOpen(false);
                  }}
                  style={[
                    styles.districtOverlayButton,
                    {
                      borderColor: active ? toneColor : theme.colors.border,
                      backgroundColor: active
                        ? blendColor(toneColor, theme.colors.surface1, theme.dark ? 0.16 : 0.08)
                        : theme.colors.surface2
                    }
                  ]}
                >
                  <Text style={[styles.districtOverlayButtonText, { color: active ? toneColor : theme.colors.textMuted }]}>
                    {filter.label}
                  </Text>
                  <Text style={[styles.districtOverlayCount, { color: active ? toneColor : theme.colors.textMuted }]}>
                    {districtOverlayCounts[filter.id]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
      <View style={styles.sceneLegend}>
        <Text style={[styles.sceneLegendText, { color: theme.colors.textMuted }]}>
          {districtOverlayFilter === 'all' ? 'Tap structures · marked ground = build' : districtOverlayFilter.charAt(0).toUpperCase() + districtOverlayFilter.slice(1) + ' districts shown'}
        </Text>
        <Text style={[styles.sceneLegendCount, { color: factionAccent }]}>{placedIds.length}/{buildings.length}</Text>
      </View>

      {selectedDistrict ? (
        <View
          testID="district-inspector"
          style={[styles.inspectorSheet, { backgroundColor: theme.colors.surface1, borderColor: semanticColor(theme, selectedDistrictTone) }]}
        >
          <View style={[styles.inspectorHandle, { backgroundColor: theme.colors.border }]} />
          <View style={styles.inspectorHeader}>
            <View style={styles.inspectorCopy}>
              <Text style={[styles.inspectorEyebrow, { color: semanticColor(theme, selectedDistrictTone) }]}>ACTIVE DISTRICT</Text>
              <Text style={[styles.inspectorTitle, { color: theme.colors.text }]} numberOfLines={1}>{selectedDistrict.name}</Text>
            </View>
            <View style={styles.inspectorPreviewChips}>
              <SemanticChip
                label={(selectedDistrictCategory?.charAt(0).toUpperCase() ?? '') + (selectedDistrictCategory?.slice(1) ?? '')}
                tone={selectedDistrictTone}
                compact
              />
              <SemanticChip label="Active" tone="positive" compact />
            </View>
          </View>
          <Text style={[styles.inspectorHint, { color: theme.colors.textMuted }]}>{selectedDistrict.description}</Text>
          <View style={[styles.districtMemberSummary, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface2 }]}>
            <Text style={[styles.districtMemberSummaryText, { color: theme.colors.text }]}>
              {selectedDistrictBuildingA?.name ?? selectedDistrict.buildingA} · Lv.{buildingLevels[selectedDistrict.buildingA] ?? 0}
            </Text>
            <Text style={[styles.districtMemberSummaryJoin, { color: semanticColor(theme, selectedDistrictTone) }]}>+</Text>
            <Text style={[styles.districtMemberSummaryText, { color: theme.colors.text }]}>
              {selectedDistrictBuildingB?.name ?? selectedDistrict.buildingB} · Lv.{buildingLevels[selectedDistrict.buildingB] ?? 0}
            </Text>
          </View>
          <View style={styles.section}>
            <DistrictEffects bonus={selectedDistrict} state="active" />
          </View>
          <View style={styles.inspectorActions}>
            {selectedDistrictBuildingA ? (
              <View style={styles.inspectorAction}>
                <SecondaryButton
                  label={'Review ' + selectedDistrictBuildingA.name}
                  onPress={() => {
                    setSelectedDistrictId(null);
                    setSelectedBuildingId(selectedDistrictBuildingA.id);
                    setRelocationTargetPlotId(null);
                  }}
                />
              </View>
            ) : null}
            {selectedDistrictBuildingB ? (
              <View style={styles.inspectorAction}>
                <SecondaryButton
                  label={'Review ' + selectedDistrictBuildingB.name}
                  onPress={() => {
                    setSelectedDistrictId(null);
                    setSelectedBuildingId(selectedDistrictBuildingB.id);
                    setRelocationTargetPlotId(null);
                  }}
                />
              </View>
            ) : null}
          </View>
          <View style={styles.button}>
            <SecondaryButton label="Close district" onPress={() => setSelectedDistrictId(null)} />
          </View>
        </View>
      ) : selectedBuilding ? (
        <View style={[styles.inspectorSheet, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
          <View style={[styles.inspectorHandle, { backgroundColor: theme.colors.border }]} />
          <View style={styles.inspectorHeader}>
            <View style={styles.inspectorCopy}>
              <Text style={[styles.inspectorEyebrow, { color: theme.colors.textMuted }]}>RELOCATE BUILDING</Text>
              <Text style={[styles.inspectorTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {selectedBuilding.name} · Lv.{buildingLevels[selectedBuilding.id] ?? 0}
              </Text>
            </View>
            <SemanticChip
              label={selectedBuildingCurrentBonuses.length + ' current districts'}
              tone={selectedBuildingCurrentBonuses.length ? 'positive' : 'neutral'}
              compact
            />
          </View>
          {relocationTarget ? (
            <>
              <View style={styles.relocationSummaryRow}>
                <SemanticChip label={'Gain +' + relocationTarget.gain} tone={relocationTarget.gain ? 'positive' : 'neutral'} compact />
                <SemanticChip label={'Lose -' + relocationTarget.loss} tone={relocationTarget.loss ? 'warning' : 'neutral'} compact />
                <SemanticChip
                  label={'Net ' + (relocationTarget.net >= 0 ? '+' : '') + relocationTarget.net}
                  tone={relocationTarget.tone}
                  compact
                />
                <SemanticChip
                  label={'Network ' + settlementAdjacencyBonuses.length + ' → ' + (settlementAdjacencyBonuses.length + relocationTarget.net)}
                  tone={relocationTarget.net > 0 ? 'positive' : relocationTarget.net < 0 ? 'warning' : 'neutral'}
                  compact
                />
              </View>
              <Text style={[styles.inspectorHint, { color: theme.colors.textMuted }]}>
                {relocationTarget.gainedBonuses.length
                  ? 'Gains ' + relocationTarget.gainedBonuses.map(bonus => bonus.name).join(' + ') + '. '
                  : 'No new district gained. '}
                {relocationTarget.lostBonuses.length
                  ? 'Loses ' + relocationTarget.lostBonuses.map(bonus => bonus.name).join(' + ') + '.'
                  : 'No current district lost.'}
              </Text>
              <View style={styles.inspectorActions}>
                <View style={styles.inspectorAction}>
                  <SecondaryButton label="Choose another plot" onPress={() => setRelocationTargetPlotId(null)} />
                </View>
                <View style={styles.inspectorAction}>
                  <PrimaryButton
                    label="Confirm free move"
                    onPress={() => {
                      if (!relocationTargetPlotId) return;
                      const ok = moveBuilding(selectedBuilding.id, relocationTargetPlotId);
                      setMessage(ok ? 'Building relocated. District bonuses recalculated.' : 'That building cannot be moved to this plot.');
                      if (ok) {
                        setSelectedBuildingId(null);
                        setRelocationTargetPlotId(null);
                      }
                    }}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.inspectorHint, { color: theme.colors.textMuted }]}>
                Compare every open plot first. Each badge shows district gains, losses and net change.
              </Text>
              <View style={styles.inspectorActions}>
                <View style={styles.inspectorAction}>
                  <SecondaryButton label="Cancel move" onPress={() => {
                    setSelectedBuildingId(null);
                    setRelocationTargetPlotId(null);
                  }} />
                </View>
                <View style={styles.inspectorAction}><SecondaryButton label="Kingdom upgrades" onPress={onExit} /></View>
              </View>
            </>
          )}
          <BuildingLevelPreview building={selectedBuilding} level={buildingLevels[selectedBuilding.id] ?? 0} wallet={resources} />
        </View>
      ) : selectedPlot ? (
        <>
          <View style={[styles.inspectorSheet, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
            <View style={[styles.inspectorHandle, { backgroundColor: theme.colors.border }]} />
            <View style={styles.inspectorHeader}>
              <View style={styles.inspectorCopy}>
                <Text style={[styles.inspectorEyebrow, { color: theme.colors.textMuted }]}>BUILD SITE</Text>
                <Text style={[styles.inspectorTitle, { color: theme.colors.text }]}>Choose a blueprint</Text>
              </View>
              <View style={styles.inspectorPreviewChips}>
                <SemanticChip label={selectedPlot.id.replace('plot_', '').toUpperCase()} tone="blue" compact />
                {previewBuilding ? (
                  <SemanticChip
                    label={previewPlacementQuality.label + ' · ' + previewPlacementQuality.summary}
                    tone={previewPlacementQuality.tone}
                    compact
                  />
                ) : null}
              </View>
            </View>
            {previewBuilding ? (
              <Text style={[styles.inspectorHint, { color: theme.colors.textMuted }]}>
                {previewPlacementQuality.label} placement for {previewBuilding.name}
                {previewDistrictBonuses.length
                  ? ' · activates ' + previewDistrictBonuses.map(bonus => bonus.name).join(' + ') + '.'
                  : ' · no district bonus activates here.'}
              </Text>
            ) : null}
          </View>
          {availableBuildings.length ? (
            <View style={styles.list}>
              {availableBuildings.map(building => {
                const potentialBonuses = previewBonuses(building.id);
                const affordable = canPayBuildingCost(resources, building.constructionCost);
                const tutorialBuildingFocused = tutorialFocus?.kind === 'settlement-building' && tutorialFocus.buildingId === building.id;
                const roleColor = semanticColor(theme, buildingRolePresentation[building.role]?.tone ?? 'neutral');
                const previewed = previewBuildingId === building.id;
                const placementQuality = settlementPlacementQuality(potentialBonuses.length);
                return (
                  <TutorialFocus key={building.id} active={tutorialBuildingFocused} label={tutorialBuildingFocused ? tutorialFocus.label : undefined}>
                    <View
                      testID={'settlement-blueprint-' + building.id}
                      style={[styles.constructionOption, { borderColor: previewed ? theme.colors.gold : roleColor, borderWidth: previewed ? 2 : 1, backgroundColor: theme.colors.surface1 }]}
                    >
                      <BuildingHeading building={building} />
                      <Text style={[styles.optionDescription, { color: theme.colors.textMuted }]}>{building.description}</Text>
                      <View style={styles.chips}>
                        <SemanticChip label={affordable ? 'Materials available' : 'Materials missing'} tone={affordable ? 'positive' : 'warning'} compact />
                        <SemanticChip
                          label={placementQuality.label + ' · ' + placementQuality.summary}
                          tone={placementQuality.tone}
                          compact
                        />
                      </View>
                      <BuildingCosts cost={building.constructionCost} wallet={resources} />
                      {potentialBonuses.length ? (
                        <View style={styles.section}>
                          <SemanticChip label={'Activates ' + potentialBonuses.length + (potentialBonuses.length === 1 ? ' district' : ' districts')} tone="blue" compact />
                          {potentialBonuses.map(bonus => (
                            <View key={bonus.id} style={[styles.preview, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface2 }]}>
                              <Text style={[styles.bonusName, { color: theme.colors.text }]}>{bonus.name}</Text>
                              <DistrictEffects bonus={bonus} state="preview" />
                            </View>
                          ))}
                        </View>
                      ) : null}
                      <View style={styles.previewAction}>
                        <SecondaryButton
                          label={previewed ? 'Previewing placement' : potentialBonuses.length ? 'Preview district' : 'Preview placement'}
                          onPress={() => {
                            setPreviewBuildingId(building.id);
                            if (blueprintPlannerOpen) setPlanningBuildingId(building.id);
                          }}
                        />
                      </View>
                      <View style={styles.button}>
                        <PrimaryButton
                          label={'Build ' + building.name}
                          disabled={!affordable}
                          onPress={() => {
                            const ok = constructBuilding(building.id, selectedPlot.id);
                            setMessage(ok ? building.name + ' constructed. District bonuses recalculated.' : 'This building cannot be constructed here yet.');
                            if (ok) {
                              setSelectedPlotId(null);
                              setPreviewBuildingId(null);
                              setBlueprintPlannerOpen(false);
                              setPlanningBuildingId(null);
                              if (tutorialBuildingFocused) onTutorialFocusComplete?.();
                            }
                          }}
                        />
                        {tutorialBuildingFocused ? (
                          <View style={styles.button}>
                            <SecondaryButton label="Build later" onPress={() => {
                              onTutorialFocusComplete?.();
                              setMessage('Blueprint learned. Build it when the resources and timing suit your plan.');
                            }} />
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </TutorialFocus>
                );
              })}
            </View>
          ) : <Text style={[styles.sceneHelp, { color: theme.colors.textMuted }]}>No unlocked unbuilt buildings are currently available.</Text>}
        </>
      ) : (
        <Text style={[styles.sceneHelp, { color: theme.colors.textMuted }]}>Tap a structure to manage it or marked ground to expand.</Text>
      )}

      <View
        testID="district-codex"
        style={[styles.districtCodex, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
      >
        <Pressable
          testID="district-codex-toggle"
          accessibilityRole="button"
          accessibilityState={{ expanded: districtCodexOpen }}
          accessibilityLabel={
            'District Codex, ' +
            settlementAdjacencyBonuses.length +
            ' of ' +
            adjacencyRecipes.length +
            ' active'
          }
          onPress={() => {
            setDistrictCodexOpen(open => !open);
            if (!districtCodexOpen) {
              setSelectedDistrictId(null);
              setSelectedBuildingId(null);
              setRelocationTargetPlotId(null);
              setSelectedPlotId(null);
              setPreviewBuildingId(null);
              setBlueprintPlannerOpen(false);
              setPlanningBuildingId(null);
            }
          }}
          style={styles.districtCodexToggle}
        >
          <View style={styles.districtCodexCopy}>
            <Text style={[styles.districtCodexEyebrow, { color: theme.colors.textMuted }]}>DISTRICT CODEX</Text>
            <Text style={[styles.districtCodexTitle, { color: theme.colors.text }]}>
              {settlementAdjacencyBonuses.length}/{adjacencyRecipes.length} active
            </Text>
          </View>
          <View style={styles.districtCodexSummary}>
            {districtPlacementAttentionCount ? (
              <SemanticChip label={districtPlacementAttentionCount + ' placement'} tone="blue" compact />
            ) : null}
            {districtDevelopingCount ? (
              <SemanticChip label={districtDevelopingCount + ' developing'} tone="neutral" compact />
            ) : null}
          </View>
          <Text style={[styles.districtCodexAction, { color: theme.colors.gold }]}>
            {districtCodexOpen ? 'CLOSE' : 'OPEN'}
          </Text>
        </Pressable>

        {districtCodexOpen ? (
          <View testID="district-codex-panel" style={[styles.districtCodexPanel, { borderTopColor: theme.colors.border }]}>
            {districtCodexRows.map((row, index) => {
              const statePresentation = districtRecipePresentation[row.state];
              return (
                <View
                  key={row.bonus.id}
                  testID={'district-codex-row-' + row.bonus.id}
                  style={[
                    styles.districtCodexRow,
                    index ? { borderTopColor: theme.colors.border, borderTopWidth: StyleSheet.hairlineWidth } : undefined
                  ]}
                >
                  <View style={styles.districtCodexRowHeader}>
                    <View style={styles.districtCodexRowCopy}>
                      <Text style={[styles.districtCodexRowName, { color: theme.colors.text }]}>{row.bonus.name}</Text>
                      <Text style={[styles.districtCodexPair, { color: theme.colors.textMuted }]}>
                        {row.first?.name ?? row.bonus.buildingA} + {row.second?.name ?? row.bonus.buildingB}
                      </Text>
                    </View>
                    <View style={styles.districtCodexRowChips}>
                      <SemanticChip
                        label={row.category.charAt(0).toUpperCase() + row.category.slice(1)}
                        tone={row.tone}
                        compact
                      />
                      <SemanticChip {...statePresentation} compact />
                    </View>
                  </View>
                  <Text style={[styles.districtCodexDescription, { color: theme.colors.textMuted }]}>
                    {row.bonus.description}
                  </Text>
                  <DistrictEffects
                    bonus={row.bonus}
                    state={row.state === 'active' ? 'active' : 'inactive'}
                  />
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
      {message ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.colors.text }]}>{message}</Text> : null}
      <SecondaryButton label="Return to Kingdom" onPress={onExit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 10, paddingBottom: 30, gap: 8 },
  hud: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 8 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 17, lineHeight: 21, fontWeight: '900', marginTop: 1 },
  stageBadge: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  stageBadgeText: { fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 0.65 },
  resourceStrip: { flexDirection: 'row', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 5, marginTop: 7, gap: 2 },
  resourceCell: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 2 },
  resourceCopy: { flex: 1, minWidth: 0 },
  resourceValue: { fontSize: 9.5, lineHeight: 12, fontWeight: '900' },
  resourceLabel: { fontSize: 7, lineHeight: 9, fontWeight: '700' },
  hudFooter: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 },
  hudStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, flexShrink: 1 },
  nextGoalInline: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
  nextGoalEyebrow: { fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.85 },
  nextGoalTitle: { fontSize: 10.5, lineHeight: 13, fontWeight: '900', maxWidth: '100%' },
  body: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 },
  districtOverlayControls: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 7, paddingVertical: 6, gap: 5 },
  districtOverlayLabel: { fontSize: 6.5, lineHeight: 8, fontWeight: '900', letterSpacing: 0.8 },
  districtOverlayButtons: { flexDirection: 'row', gap: 4 },
  districtOverlayButton: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: 9, paddingHorizontal: 4, paddingVertical: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 3 },
  districtOverlayButtonText: { fontSize: 7.5, lineHeight: 10, fontWeight: '900' },
  districtOverlayCount: { fontSize: 6.5, lineHeight: 9, fontWeight: '900' },
  sceneLegend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 3, marginTop: -1 },
  sceneLegendText: { fontSize: 9.5, lineHeight: 13, fontWeight: '700' },
  sceneLegendCount: { fontSize: 10, lineHeight: 13, fontWeight: '900' },
  districtCodex: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  districtCodexToggle: { minHeight: 52, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  districtCodexCopy: { flex: 1, minWidth: 0 },
  districtCodexEyebrow: { fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.85 },
  districtCodexTitle: { fontSize: 12, lineHeight: 15, fontWeight: '900', marginTop: 1 },
  districtCodexSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', flexShrink: 1 },
  districtCodexAction: { fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 0.65 },
  districtCodexPanel: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 9, paddingBottom: 5 },
  districtCodexRow: { paddingVertical: 8 },
  districtCodexRowHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  districtCodexRowCopy: { flex: 1, minWidth: 0 },
  districtCodexRowName: { fontSize: 11.5, lineHeight: 15, fontWeight: '900' },
  districtCodexPair: { fontSize: 9, lineHeight: 12, fontWeight: '700', marginTop: 1 },
  districtCodexRowChips: { alignItems: 'flex-end', gap: 3 },
  districtCodexDescription: { fontSize: 9.5, lineHeight: 14, marginTop: 5 },
  blueprintPlannerLauncher: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 10 },
  blueprintPlannerLauncherCopy: { flex: 1, minWidth: 0 },
  blueprintPlannerLauncherText: { fontSize: 11.5, lineHeight: 15, fontWeight: '800', marginTop: 1 },
  blueprintPlannerLauncherAction: { fontSize: 9, lineHeight: 12, fontWeight: '900', letterSpacing: 0.7 },
  blueprintPlanner: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 9, paddingTop: 7, paddingBottom: 8 },
  blueprintPlannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  blueprintPlannerCopy: { flex: 1, minWidth: 0 },
  blueprintPlannerEyebrow: { fontSize: 7.5, lineHeight: 10, fontWeight: '900', letterSpacing: 0.85 },
  blueprintPlannerTitle: { fontSize: 13, lineHeight: 17, fontWeight: '900', marginTop: 1 },
  blueprintPlannerClose: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  blueprintPlannerCloseText: { fontSize: 7.5, lineHeight: 10, fontWeight: '900', letterSpacing: 0.5 },
  blueprintPlannerRow: { gap: 6, paddingTop: 7, paddingRight: 4 },
  blueprintPlannerChip: { width: 112, borderWidth: 1, borderRadius: 11, paddingHorizontal: 8, paddingVertical: 6 },
  blueprintPlannerChipName: { fontSize: 9.5, lineHeight: 12, fontWeight: '900' },
  blueprintPlannerChipQuality: { fontSize: 7.5, lineHeight: 10, fontWeight: '800', marginTop: 2 },
  networkHint: { minHeight: 54, borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 10 },
  networkHintCopy: { flex: 1, minWidth: 0 },
  networkHintEyebrow: { fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.8 },
  networkHintTitle: { fontSize: 12.5, lineHeight: 16, fontWeight: '900', marginTop: 1 },
  networkHintDetail: { fontSize: 9.5, lineHeight: 12, fontWeight: '700', marginTop: 1 },
  networkHintAction: { fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 0.65 },
  section: { gap: 8, marginTop: 10 },
  map: { borderRadius: 26, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  unlockCelebration: { position: 'absolute', top: 10, left: '20%', right: '20%', zIndex: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6, alignItems: 'center', opacity: 0.96 },
  unlockCelebrationLabel: { fontSize: 7.5, lineHeight: 10, fontWeight: '900', letterSpacing: 0.9 },
  unlockCelebrationDetail: { fontSize: 11, lineHeight: 14, fontWeight: '900', marginTop: 1, maxWidth: '100%' },

  districtZoneLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 2 },
  districtTagLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 18 },
  districtZone: { position: 'absolute', borderWidth: 1, borderRadius: 999 },
  districtZoneLabel: { position: 'absolute', minHeight: 18, borderWidth: 1, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 3 },
  districtZoneDot: { width: 5, height: 5, borderRadius: 999 },
  districtZoneText: { flex: 1, fontSize: 6.5, lineHeight: 9, fontWeight: '900', letterSpacing: 0.25 },
  districtLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 3 },
  districtLinkGlow: { position: 'absolute', height: 7, borderRadius: 999 },
  districtLink: { position: 'absolute', height: 2.5, borderRadius: 999 },
  districtPreviewLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 4 },
  districtPreviewLink: { position: 'absolute', height: 1, borderTopWidth: 2, borderStyle: 'dashed', opacity: 0.9 },
  relocationPreviewLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 5 },
  relocationPreviewLink: { position: 'absolute', height: 1, borderTopWidth: 2.5, borderStyle: 'dashed', opacity: 0.92 },
  plot: { position: 'absolute', width: '27%', height: '23%', borderRadius: 14, alignItems: 'center', justifyContent: 'center', padding: 4, overflow: 'visible' },
  landmarkPlot: { width: '32%', height: '27%' },
  plotSurface: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 13 },
  selectionHalo: { position: 'absolute', left: '50%', bottom: '24%', marginLeft: -35, width: 70, height: 24, borderRadius: 999, borderWidth: 2 },
  unlockFocusRing: { position: 'absolute', left: '50%', top: '50%', marginLeft: -38, marginTop: -32, width: 76, height: 64, borderRadius: 18, borderWidth: 2, opacity: 0.72 },
  districtPreviewPartnerRing: { position: 'absolute', left: '50%', top: '50%', marginLeft: -36, marginTop: -30, width: 72, height: 60, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', opacity: 0.78 },
  landmarkDistrictPreviewPartnerRing: { marginLeft: -48, marginTop: -40, width: 96, height: 80, borderRadius: 22 },
  placementQualityBadge: { position: 'absolute', top: 4, alignSelf: 'center', zIndex: 10, borderWidth: 1, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, opacity: 0.96 },
  placementQualityBadgeText: { fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.35 },
  blueprintPlanQualityBadge: { position: 'absolute', top: 4, alignSelf: 'center', zIndex: 10, borderWidth: 1, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, opacity: 0.96 },
  blueprintPlanQualityText: { fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.35 },
  relocationPlanBadge: { position: 'absolute', top: 3, alignSelf: 'center', zIndex: 11, minWidth: 64, borderWidth: 1, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center', opacity: 0.97 },
  relocationPlanText: { fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.3 },
  relocationPlanBest: { fontSize: 5.5, lineHeight: 7, fontWeight: '900', letterSpacing: 0.5, marginTop: 1 },
  districtOpportunityBadge: { position: 'absolute', top: 4, left: 5, zIndex: 9, flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 2, opacity: 0.94 },
  districtOpportunityDot: { width: 5, height: 5, borderRadius: 999 },
  districtOpportunityText: { fontSize: 6.5, lineHeight: 9, fontWeight: '900', letterSpacing: 0.35 },
  landmarkUnlockFocusRing: { marginLeft: -50, marginTop: -42, width: 100, height: 84, borderRadius: 22 },
  districtMemberFocusRing: { position: 'absolute', left: '50%', top: '50%', marginLeft: -38, marginTop: -32, width: 76, height: 64, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', opacity: 0.9 },
  landmarkDistrictMemberFocusRing: { marginLeft: -50, marginTop: -42, width: 100, height: 84, borderRadius: 22 },

  landmarkSelectionHalo: { marginLeft: -44, width: 88, height: 30, bottom: '22%' },
  buildingAmbience: { position: 'absolute', left: '50%', top: '50%', marginLeft: -41, marginTop: -41, width: 82, height: 82, alignItems: 'center', justifyContent: 'center' },
  landmarkAmbience: { marginLeft: -55, marginTop: -59, width: 110, height: 110, transform: [{ translateY: -3 }] },
  buildingPad: { width: 72, height: 64, alignItems: 'center', justifyContent: 'flex-end' },
  selectedBuildingPad: { transform: [{ scale: 1.045 }] },
  landmarkBuildingPad: { width: 94, height: 84, transform: [{ translateY: -5 }] },
  buildingFootprint: { position: 'absolute', left: 7, right: 7, bottom: 1, height: 16, borderRadius: 999, opacity: 0.14 },
  landmarkFootprint: { left: 4, right: 4, height: 22, opacity: 0.2 },
  plotGuideBadge: { position: 'absolute', top: -12, right: -8, zIndex: 5, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  plotGuideText: { color: '#111318', fontSize: 8, lineHeight: 11, fontWeight: '900' },
  plotBuildingName: { fontSize: 9.5, lineHeight: 13, fontWeight: '900', textAlign: 'center', marginTop: 0, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, maxWidth: '96%' },
  levelPill: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 1, marginTop: 2 },
  plotLevel: { fontSize: 8.5, lineHeight: 11 },
  emptyPlus: { fontSize: 27, fontWeight: '600' },
  buildPlotArt: { position: 'absolute', left: '50%', top: '50%', marginLeft: -42, marginTop: -42, width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  emptyBadge: { position: 'absolute', bottom: 5, alignSelf: 'center', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 3, opacity: 0.9 },
  buildReadyBadge: { position: 'absolute', top: 4, alignSelf: 'center', zIndex: 8, borderWidth: 1, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  buildReadyText: { color: '#111318', fontSize: 7.5, lineHeight: 10, fontWeight: '900', letterSpacing: 0.45 },
  buildReadyDot: { position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: 999, zIndex: 8 },
  upgradeReadyBadge: { position: 'absolute', top: 4, right: 5, zIndex: 9, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 2 },
  upgradeReadyText: { color: '#111318', fontSize: 6.5, lineHeight: 9, fontWeight: '900', letterSpacing: 0.3 },
  emptyPlusCompact: { fontSize: 13, lineHeight: 15, fontWeight: '900' },
  emptyText: { fontSize: 9.5, lineHeight: 13, fontWeight: '900' },
  terrain: { position: 'absolute', right: 5, bottom: 4, alignItems: 'center', justifyContent: 'center' },
  lockText: { fontSize: 10, lineHeight: 14, fontWeight: '800', textTransform: 'uppercase', marginTop: 3 },
  wallTop: { position: 'absolute', left: '3%', right: '3%', top: 3, borderTopWidth: 2, opacity: 0.75 },
  wallBottom: { position: 'absolute', left: '3%', right: '3%', bottom: 3, borderBottomWidth: 2, opacity: 0.75 },
  gateLabel: { position: 'absolute', bottom: 7, alignSelf: 'center', fontSize: 9, lineHeight: 12, fontWeight: '900' },
  inspectorSheet: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingTop: 7, paddingBottom: 11 },
  inspectorHandle: { width: 34, height: 3, borderRadius: 999, alignSelf: 'center', opacity: 0.7, marginBottom: 7 },
  inspectorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inspectorCopy: { flex: 1, minWidth: 0 },
  inspectorPreviewChips: { alignItems: 'flex-end', gap: 4 },
  inspectorEyebrow: { fontSize: 7.5, lineHeight: 10, fontWeight: '900', letterSpacing: 0.9 },
  inspectorTitle: { fontSize: 15, lineHeight: 19, fontWeight: '900', marginTop: 1 },
  inspectorHint: { fontSize: 10.5, lineHeight: 15, marginTop: 5 },
  inspectorActions: { flexDirection: 'row', gap: 7, marginTop: 8 },
  inspectorAction: { flex: 1 },
  districtMemberSummary: { borderWidth: 1, borderRadius: 11, marginTop: 8, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  districtMemberSummaryText: { flex: 1, fontSize: 9, lineHeight: 12, fontWeight: '900', textAlign: 'center' },
  districtMemberSummaryJoin: { fontSize: 12, lineHeight: 15, fontWeight: '900' },
  relocationSummaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  constructionOption: { borderWidth: 1, borderRadius: 14, padding: 11 },
  optionDescription: { fontSize: 11.5, lineHeight: 17, marginTop: 4 },
  previewAction: { marginTop: 7 },
  sceneHelp: { fontSize: 10.5, lineHeight: 15, textAlign: 'center', paddingVertical: 3 },
  list: { gap: 8 },
  button: { marginTop: 8 },
  bonusName: { fontSize: 16, lineHeight: 22, fontWeight: '900' },
  preview: { borderWidth: 1, borderRadius: 12, padding: 12 },
  recipe: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  message: { fontSize: 13, lineHeight: 19, textAlign: 'center', fontWeight: '800' }
});
