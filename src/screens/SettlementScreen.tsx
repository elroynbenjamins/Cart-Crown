import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import { settlementActionLayout } from '../ui/settlementActionLayout';
import {
  analyzeSettlementAdjacency, getSettlementAdjacencyBonuses,
  getSettlementPlots, isSettlementPlotUnlocked
} from '../game/settlement';
import { canPayBuildingCost, getBuildingLevelDefinition } from '../game/kingdom';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { PrimaryButton, SecondaryButton } from '../ui/components';
import { BuildingSprite, LockIcon, ResourceSprite, SettlementBuildingAmbience, SettlementBuildPlotSprite, SettlementDistrictAmbience, SettlementSceneAtmosphere, SettlementTerrainBackdrop } from '../ui/gameArt';
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

const fortWorldPositions: Record<string, { left: ViewStyle['left']; top: ViewStyle['top'] }> = {
  plot_nw: { left: '10%', top: '21%' },
  plot_n: { left: '37%', top: '10%' },
  plot_ne: { left: '65%', top: '21%' },
  plot_w: { left: '5%', top: '42%' },
  plot_center: { left: '33%', top: '33%' },
  plot_e: { left: '70%', top: '42%' },
  plot_sw: { left: '11%', top: '62%' },
  plot_s: { left: '38%', top: '70%' },
  plot_se: { left: '66%', top: '62%' }
};

const humanSettlementBackgroundPositions: Record<string, { left: ViewStyle['left']; top: ViewStyle['top'] }> = {
  plot_nw: { left: '8%', top: '18%' },
  plot_n: { left: '36%', top: '14%' },
  plot_ne: { left: '62%', top: '8%' },
  plot_w: { left: '4%', top: '28%' },
  plot_center: { left: '36%', top: '30%' },
  plot_e: { left: '62%', top: '26%' },
  plot_sw: { left: '4%', top: '40%' },
  plot_s: { left: '36%', top: '45%' },
  plot_se: { left: '62%', top: '42%' }
};

const humanSettlementBackgroundCenters: Record<string, { x: number; y: number }> = {
  plot_nw: { x: 0.22, y: 0.30 },
  plot_n: { x: 0.50, y: 0.26 },
  plot_ne: { x: 0.76, y: 0.20 },
  plot_w: { x: 0.18, y: 0.40 },
  plot_center: { x: 0.50, y: 0.42 },
  plot_e: { x: 0.76, y: 0.38 },
  plot_sw: { x: 0.18, y: 0.52 },
  plot_s: { x: 0.50, y: 0.57 },
  plot_se: { x: 0.76, y: 0.54 }
};

const fortWorldCenters: Record<string, { x: number; y: number }> = {
  plot_nw: { x: 0.24, y: 0.33 },
  plot_n: { x: 0.505, y: 0.22 },
  plot_ne: { x: 0.785, y: 0.33 },
  plot_w: { x: 0.19, y: 0.54 },
  plot_center: { x: 0.5, y: 0.46 },
  plot_e: { x: 0.84, y: 0.54 },
  plot_sw: { x: 0.245, y: 0.74 },
  plot_s: { x: 0.51, y: 0.82 },
  plot_se: { x: 0.79, y: 0.74 }
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

type SettlementBuildingAction = 'inspect' | 'move' | 'upgrade';

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
    constructBuilding, moveBuilding, upgradeBuilding, settlementUpgraded,
    markedRaidersInvestigated, refugeeCampSecured, commanderPathId
  } = useGame();
  const [selectedPlotId, commitSelectedPlot] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedBuildingAction, commitBuildingAction] = useState<SettlementBuildingAction | null>(null);
  const [relocationTargetPlotId, commitRelocationTarget] = useState<string | null>(null);
  // Invalidate old confirmation callbacks on action/target changes and on first use.
  const interactionVersion = useRef(0);
  const setSelectedBuildingAction = (action: SettlementBuildingAction | null) => {
    interactionVersion.current += 1;
    commitBuildingAction(action);
  };
  const setRelocationTargetPlotId = (plotId: string | null) => {
    interactionVersion.current += 1;
    commitRelocationTarget(plotId);
  };
  const [measuredMapWidth, setMeasuredMapWidth] = useState(0);
  const [measuredActionHeight, setMeasuredActionHeight] = useState(112);
  const [measuredActionChrome, setMeasuredActionChrome] = useState(112);
  const [previewBuildingId, commitPreviewBuilding] = useState<string | null>(null);
  const [constructionReviewOpen, commitConstructionReview] = useState(false);
  const [measuredConstructionHeight, setMeasuredConstructionHeight] = useState(250);
  const [measuredConstructionHeader, setMeasuredConstructionHeader] = useState(64);
  const [blueprintPlannerOpen, setBlueprintPlannerOpen] = useState(false);
  const [planningBuildingId, setPlanningBuildingId] = useState<string | null>(null);
  const [districtOverlayFilter, setDistrictOverlayFilter] = useState<DistrictOverlayFilter>('all');
  const [districtOverlayOpen, setDistrictOverlayOpen] = useState(false);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [districtCodexOpen, setDistrictCodexOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [unlockCelebration, setUnlockCelebration] = useState<SettlementUnlockCelebration | null>(null);
  // Changing a construction input invalidates even a queued handler from the same render.
  const setSelectedPlotId = (id: string | null) => {
    interactionVersion.current += 1;
    commitSelectedPlot(id);
    commitConstructionReview(false);
  };
  const setPreviewBuildingId = (id: string | null) => {
    interactionVersion.current += 1;
    commitPreviewBuilding(id);
  };
  const setConstructionReviewOpen = (open: boolean) => {
    interactionVersion.current += 1;
    commitConstructionReview(open);
  };
  const settlementPlots = getSettlementPlots(activeFaction);
  const adjacencyRecipes = getSettlementAdjacencyBonuses(activeFaction);
  const factionAccent = activeFaction === 'elf' ? theme.colors.elf : activeFaction === 'orc' ? theme.colors.orc : theme.colors.human;
  const selectedPlot = settlementPlots.find(plot => plot.id === selectedPlotId) ?? null;
  const selectedBuilding = Object.values(buildingPlacements).includes(selectedBuildingId)
    ? buildings.find(building => building.id === selectedBuildingId) ?? null
    : null;
  const relocationMode = Boolean(selectedBuilding) && selectedBuildingAction === 'move';
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
  const availableBuildings = buildings.filter(building =>
    isBuildingUnlocked(building.id) && !placedIds.includes(building.id) && (buildingLevels[building.id] ?? 0) <= 0
  );
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
    if (!selectedPlot || buildingPlacements[selectedPlot.id] || !isSettlementPlotUnlocked(selectedPlot, currentWagonStage.id)) return [];
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
  const showDistrictOpportunities =
    activeFaction !== 'human' &&
    !['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id) &&
    !selectedPlotId &&
    !selectedBuildingId &&
    !unlockCelebration &&
    !blueprintPlannerOpen;
  const selectedBuildingCurrentBonuses = selectedBuilding
    ? settlementAdjacencyBonuses.filter(
        bonus => bonus.buildingA === selectedBuilding.id || bonus.buildingB === selectedBuilding.id
      )
    : [];
  const selectedBuildingCurrentBonusIds = new Set(selectedBuildingCurrentBonuses.map(bonus => bonus.id));
  const relocationPlanRatings = selectedBuilding && relocationMode
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
      : currentWagonStage.id === 'grand' ? 'GREENKEEP GRAND'
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
  const compactHud = safeViewportHeight < 720 || safeFontScale > 1.15;
  const mapHeight = Math.max(
    600,
    Math.min(760, Math.round(safeViewportHeight * 0.75 + Math.max(0, safeFontScale - 1) * 120))
  );
  const safeViewportWidth = Number.isFinite(viewportWidth) ? viewportWidth : 360;
  const mapWidth = measuredMapWidth > 0 ? measuredMapWidth : Math.max(300, safeViewportWidth - 20);
  const humanStagePlateActive = activeFaction === 'human';
  const worldRebuildActive =
    humanStagePlateActive ||
    ['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
  const districtAnalysisVisible =
    !worldRebuildActive ||
    districtOverlayOpen ||
    Boolean(selectedBuildingId || selectedDistrictId || selectedPlotId || blueprintPlannerOpen || relocationMode);
  const activePlotCenters = humanStagePlateActive
    ? humanSettlementBackgroundCenters
    : worldRebuildActive
      ? fortWorldCenters
      : settlementPlotCenters;
  const districtConnections = settlementAdjacencyBonuses.flatMap(bonus => {
    const first = activePlotCenters[bonus.plotA];
    const second = activePlotCenters[bonus.plotB];
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
      } as ViewStyle,
      activityStyle: {
        left: horizontal ? midpointX - 29 : midpointX - 68,
        top: horizontal ? midpointY + 7 : midpointY - 29,
        width: 58,
        height: 58
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
    const first = activePlotCenters[bonus.plotA];
    const second = activePlotCenters[bonus.plotB];
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
    const first = activePlotCenters[bonus.plotA];
    const second = activePlotCenters[bonus.plotB];
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
    const first = activePlotCenters[bonus.plotA];
    const second = activePlotCenters[bonus.plotB];
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

  const selectedBuildingLevel = selectedBuilding ? buildingLevels[selectedBuilding.id] ?? 0 : 0;
  const selectedNextUpgrade = selectedBuilding && selectedBuildingLevel < selectedBuilding.maxLevel
    ? getBuildingLevelDefinition(selectedBuilding.id, selectedBuildingLevel + 1) : null;
  const sourcePlotId = selectedBuilding
    ? Object.entries(buildingPlacements).find(([, id]) => id === selectedBuilding.id)?.[0] : undefined;
  const selectedCanMove = Boolean(selectedBuilding && selectedBuildingLevel > 0 && sourcePlotId) && settlementPlots.some(plot =>
    isSettlementPlotUnlocked(plot, currentWagonStage.id) && !buildingPlacements[plot.id]
  );
  const humanUpgradeGate = activeFaction !== 'human' || !selectedBuilding ? null
    : selectedBuilding.id === 'barracks' && !settlementUpgraded ? 'Establish the settlement first.'
    : selectedBuilding.id === 'forge' && !markedRaidersInvestigated ? 'Complete the Marked Raiders investigation first.'
    : selectedBuilding.id === 'quartermaster' && !refugeeCampSecured ? 'Secure the Refugee Camp first.'
    : selectedBuilding.id === 'war_room' && !commanderPathId ? 'Choose a commander path first.' : null;
  const selectedUpgradeBlocker = !selectedBuilding ? 'Select a building.'
    : selectedBuilding.role === 'KINGDOM' ? 'Settlement expansion is managed through the current Kingdom goal.'
    : selectedBuildingLevel <= 0 ? 'Construct this building first.'
    : selectedBuildingLevel >= selectedBuilding.maxLevel ? 'Maximum building level reached.'
    : !selectedNextUpgrade ? 'No direct next-level upgrade is listed.'
    : !isBuildingUnlocked(selectedBuilding.id) ? selectedNextUpgrade.requirement
    : selectedBuildingLevel >= maxBuildingLevelForStage ? 'Expand the settlement to unlock Level ' + (selectedBuildingLevel + 1) + '.'
    : humanUpgradeGate
    ? humanUpgradeGate
    : !canPayBuildingCost(resources, selectedNextUpgrade.cost) ? 'Missing upgrade materials. The exact shortages are listed below.' : null;
  const latestInteractionRender = useRef<object | null>(null);
  const interactionRender = {};
  latestInteractionRender.current = interactionRender;
  const renderedInteractionVersion = interactionVersion.current;
  const closeBuildingSelection = () => {
    setSelectedBuildingId(null);
    setSelectedBuildingAction(null);
    setRelocationTargetPlotId(null);
    setMessage(null);
  };
  const confirmSceneUpgrade = () => {
    if (latestInteractionRender.current !== interactionRender || interactionVersion.current !== renderedInteractionVersion || selectedBuildingAction !== 'upgrade' ||
        !selectedBuilding || !selectedNextUpgrade || selectedUpgradeBlocker) return;
    interactionVersion.current += 1;
    const ok = upgradeBuilding(selectedBuilding.id);
    if (ok) setSelectedBuildingAction(null);
    setMessage(ok ? selectedBuilding.name + ' upgraded to Level ' + selectedNextUpgrade.level + '.'
      : 'Upgrade not completed. Recheck the current campaign requirement and resources; nothing was upgraded.');
  };
  const confirmSceneMove = () => {
    if (latestInteractionRender.current !== interactionRender || interactionVersion.current !== renderedInteractionVersion || !relocationMode ||
        !selectedBuilding || !relocationTargetPlotId || !relocationTarget) return;
    interactionVersion.current += 1;
    const ok = moveBuilding(selectedBuilding.id, relocationTargetPlotId);
    if (ok) {
      setSelectedBuildingAction(null);
      setRelocationTargetPlotId(null);
    }
    setMessage(ok ? 'Building relocated. District bonuses recalculated.' : 'This destination is no longer available. Choose another unlocked empty plot.');
  };
  const closeConstruction = () => {
    setSelectedPlotId(null);
    setPreviewBuildingId(null);
    setBlueprintPlannerOpen(false);
    setPlanningBuildingId(null);
    setMessage(null);
  };
  const dismissSceneSelection = () => {
    closeBuildingSelection();
    closeConstruction();
  };
  const constructionPlotAvailable = Boolean(selectedPlot && !buildingPlacements[selectedPlot.id] &&
    isSettlementPlotUnlocked(selectedPlot, currentWagonStage.id));
  const constructionBlocker = !constructionPlotAvailable ? 'This plot is no longer available. Choose another unlocked empty plot.'
    : !previewBuilding ? 'Choose an unlocked, unbuilt blueprint.'
    : !canPayBuildingCost(resources, previewBuilding.constructionCost) ? 'Materials missing. Review the exact shortages below.' : null;
  const tutorialConstructionFocused = tutorialFocus?.kind === 'settlement-building' &&
    tutorialFocus.buildingId === previewBuilding?.id;
  const confirmSceneConstruction = () => {
    if (latestInteractionRender.current !== interactionRender || interactionVersion.current !== renderedInteractionVersion ||
        !constructionReviewOpen || !selectedPlot || !previewBuilding || constructionBlocker || selectedBuilding) return;
    interactionVersion.current += 1;
    const ok = constructBuilding(previewBuilding.id, selectedPlot.id);
    if (ok) {
      setSelectedPlotId(null);
      setPreviewBuildingId(null);
      setBlueprintPlannerOpen(false);
      setPlanningBuildingId(null);
      setSelectedBuildingId(previewBuilding.id);
      setSelectedBuildingAction(null);
      setRelocationTargetPlotId(null);
      if (tutorialConstructionFocused) onTutorialFocusComplete?.();
    }
    setMessage(ok ? previewBuilding.name + ' constructed. District bonuses recalculated.'
      : 'This building cannot be constructed here yet. Recheck the plot, unlock and resources; nothing was built.');
  };
  const constructionAnchor = (selectedPlot ? activePlotCenters[selectedPlot.id] : null) ?? { x: 0.5, y: 0.5 };
  // Keep a clear side of the selected plot; only the card content scrolls.
  const constructionMaxHeight = Math.max(180, Math.min(380,
    Math.max(constructionAnchor.y, 1 - constructionAnchor.y) * mapHeight - 74));
  const constructionLayout = settlementActionLayout(mapWidth, mapHeight, constructionAnchor,
    Math.min(measuredConstructionHeight, constructionMaxHeight));
  const constructionScrollHeight = Math.max(64, constructionMaxHeight - measuredConstructionHeader - 16);
  // Invalidate any retained confirmation callback when the screen leaves the tree.
  useEffect(() => () => { interactionVersion.current += 1; }, []);
  // Android Back leaves a review first, then dismisses the selected plot/building.
  useEffect(() => {
    if (!selectedBuilding && !selectedPlot) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedPlot && !selectedBuilding) {
        if (constructionReviewOpen) { setConstructionReviewOpen(false); setMessage(null); }
        else closeConstruction();
        return true;
      }
      if (selectedBuildingAction || relocationTargetPlotId) {
        setSelectedBuildingAction(null);
        setRelocationTargetPlotId(null);
        setMessage(null);
      } else closeBuildingSelection();
      return true;
    });
    return () => subscription.remove();
  }, [selectedBuilding?.id, selectedBuildingAction, relocationTargetPlotId, selectedPlot?.id, constructionReviewOpen]);
  useEffect(() => {
    closeBuildingSelection();
    setSelectedPlotId(null);
    setPreviewBuildingId(null);
    setBlueprintPlannerOpen(false);
    setPlanningBuildingId(null);
    setSelectedDistrictId(null);
    setDistrictOverlayOpen(false);
    setDistrictOverlayFilter('all');
  }, [activeFaction]);
  const actionAnchorId = relocationMode && relocationTarget ? relocationTarget.plotId : sourcePlotId;
  const actionAnchor = (actionAnchorId ? activePlotCenters[actionAnchorId] : null) ?? { x: 0.5, y: 0.5 };
  const actionLayout = settlementActionLayout(mapWidth, mapHeight, actionAnchor, measuredActionHeight);
  const actionDetailHeight = Math.max(64, Math.min(280,
    Math.max(actionAnchor.y, 1 - actionAnchor.y) * mapHeight - 74 - measuredActionChrome));
  const buildingDetails = selectedBuilding && selectedBuildingAction === 'inspect' ? (
    <View testID="scene-building-inspect" style={styles.sceneDetailsContent}>
      <SemanticChip label={selectedBuildingCurrentBonuses.length + ' active districts'} tone={selectedBuildingCurrentBonuses.length ? 'positive' : 'neutral'} compact />
      <BuildingLevelPreview building={selectedBuilding} level={selectedBuildingLevel} wallet={resources} />
      <SecondaryButton label="Close details" onPress={() => setSelectedBuildingAction(null)} />
    </View>
  ) : selectedBuilding && selectedBuildingAction === 'upgrade' ? (
    <View testID="scene-building-upgrade-review" style={styles.sceneDetailsContent}>
      <Text style={[styles.sceneDetailTitle, { color: theme.colors.text }]}>Upgrade review · no resources spent yet</Text>
      {selectedNextUpgrade ? <>
        <SemanticChip label={'Level ' + selectedBuildingLevel + ' → ' + selectedNextUpgrade.level} tone="blue" compact />
        <Text style={[styles.sceneDetailText, { color: theme.colors.text }]}>{selectedNextUpgrade.effect}</Text>
        <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>{selectedNextUpgrade.requirement}</Text>
        <BuildingCosts cost={selectedNextUpgrade.cost} wallet={resources} title="Upgrade cost" />
      </> : null}
      {selectedUpgradeBlocker ? <Text accessibilityLiveRegion="polite" style={[styles.sceneDetailText, { color: semanticColor(theme, 'warning') }]}>{selectedUpgradeBlocker}</Text> : null}
      {selectedNextUpgrade ? <PrimaryButton label={'Confirm upgrade to Level ' + selectedNextUpgrade.level} disabled={Boolean(selectedUpgradeBlocker)} onPress={confirmSceneUpgrade} /> : null}
      <SecondaryButton label="Cancel upgrade" onPress={() => setSelectedBuildingAction(null)} />
    </View>
  ) : selectedBuilding && relocationMode ? (
    <View testID="scene-building-move-review" style={styles.sceneDetailsContent}>
      {relocationTarget ? <>
        <Text style={[styles.sceneDetailTitle, { color: theme.colors.text }]}>Move to {settlementPlotLabels[relocationTarget.plotId] ?? relocationTarget.plotId} · free</Text>
        <View style={styles.relocationSummaryRow}>
          <SemanticChip label={'Gain +' + relocationTarget.gain} tone={relocationTarget.gain ? 'positive' : 'neutral'} compact />
          <SemanticChip label={'Lose -' + relocationTarget.loss} tone={relocationTarget.loss ? 'warning' : 'neutral'} compact />
          <SemanticChip label={'Net ' + (relocationTarget.net >= 0 ? '+' : '') + relocationTarget.net} tone={relocationTarget.tone} compact />
          <SemanticChip label={'Network ' + settlementAdjacencyBonuses.length + ' → ' + (settlementAdjacencyBonuses.length + relocationTarget.net)} tone={relocationTarget.tone} compact />
        </View>
        <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>
          {relocationTarget.gainedBonuses.length ? 'Gains ' + relocationTarget.gainedBonuses.map(bonus => bonus.name).join(' + ') + '. ' : 'No new district gained. '}
          {relocationTarget.lostBonuses.length ? 'Loses ' + relocationTarget.lostBonuses.map(bonus => bonus.name).join(' + ') + '.' : 'No current district lost.'}
        </Text>
        <PrimaryButton label="Confirm free move" onPress={confirmSceneMove} />
        <SecondaryButton label="Choose another plot" onPress={() => setRelocationTargetPlotId(null)} />
      </> : <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>
        {selectedCanMove ? 'Tap an open plot to preview a free move. Badges compare district gains and losses.' : 'No unlocked empty plot is available.'}
      </Text>}
      <SecondaryButton label="Cancel move" onPress={() => { setSelectedBuildingAction(null); setRelocationTargetPlotId(null); }} />
    </View>
  ) : null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.hud, compactHud ? styles.hudCompact : undefined, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, compactHud ? styles.eyebrowCompact : undefined, { color: factionAccent }]}>CART & CROWN</Text>
            <Text accessibilityRole="header" style={[styles.title, compactHud ? styles.titleCompact : undefined, { color: theme.colors.text }]} numberOfLines={1}>{stageLabel}</Text>
          </View>
          <View style={[styles.stageBadge, compactHud ? styles.stageBadgeCompact : undefined, { borderColor: factionAccent, backgroundColor: theme.colors.surface2 }]}>
            <Text style={[styles.stageBadgeText, compactHud ? styles.stageBadgeTextCompact : undefined, { color: factionAccent }]}>{currentWagonStage.id.toUpperCase()}</Text>
          </View>
        </View>

        <View
          style={[
            styles.resourceStrip,
            compactHud ? styles.resourceStripCompact : undefined,
            worldRebuildActive ? styles.worldResourceStrip : undefined,
            { backgroundColor: worldRebuildActive ? 'transparent' : theme.colors.surface2 }
          ]}
        >
          {settlementResourceOrder.map(resource => (
            <View
              key={resource}
              accessible
              accessibilityLabel={settlementResourceLabels[resource] + ' ' + resources[resource]}
              style={[styles.resourceCell, compactHud ? styles.resourceCellCompact : undefined]}
            >
              <ResourceSprite resource={resource} size={compactHud ? 15 : 18} />
              <View style={styles.resourceCopy}>
                <Text style={[styles.resourceValue, compactHud ? styles.resourceValueCompact : undefined, { color: theme.colors.text }]}>{resources[resource]}</Text>
                {!compactHud ? <Text style={[styles.resourceLabel, { color: theme.colors.textMuted }]}>{settlementResourceLabels[resource]}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.hudFooter, compactHud ? styles.hudFooterCompact : undefined]}>
          {compactHud ? (
            <Text
              accessible
              accessibilityLabel={
                placedIds.length + ' built, ' +
                settlementAdjacencyBonuses.length + ' districts' +
                (upgradeMaterialReadyIds.size ? ', ' + upgradeMaterialReadyIds.size + ' upgrades' : '') +
                (constructionReadyCount ? ', ' + constructionReadyCount + ' build ready' : '')
              }
              style={[styles.hudCompactSummary, { color: theme.colors.textMuted }]}
              numberOfLines={1}
            >
              {placedIds.length} built · {settlementAdjacencyBonuses.length} districts
              {upgradeMaterialReadyIds.size ? ' · ' + upgradeMaterialReadyIds.size + ' upgrades' : ''}
              {constructionReadyCount ? ' · ' + constructionReadyCount + ' build' : ''}
            </Text>
          ) : (
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
          )}
          {!compactHud && nextSuggestedBuilding && nextSuggestedPlot ? (
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
              setSelectedBuildingAction(null);
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
            setSelectedBuildingAction('move');
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

      <View
        testID="settlement-scene"
        onLayout={event => {
          const width = event.nativeEvent.layout.width;
          if (Number.isFinite(width) && width > 0) setMeasuredMapWidth(previous => Math.abs(previous - width) < 0.5 ? previous : width);
        }}
        style={[
          styles.map,
          humanStagePlateActive ? styles.authoredWorldMap : undefined,
          {
            height: mapHeight,
            backgroundColor: theme.colors.surface1,
            borderColor: humanStagePlateActive ? factionAccent + '55' : theme.colors.border
          }
        ]}
      >
        <Pressable testID="settlement-clear-selection" accessible={false} importantForAccessibility="no" disabled={!selectedBuilding && !selectedPlot} onPress={dismissSceneSelection} style={styles.sceneDismissSurface} />
        <View pointerEvents="none" style={styles.backdrop}>
          <SettlementTerrainBackdrop faction={activeFaction} stageId={currentWagonStage.id} />
        </View>
        <SettlementSceneAtmosphere faction={activeFaction} stageId={currentWagonStage.id} />
        <View
          pointerEvents="none"
          style={[styles.sceneInnerFrame, { borderColor: factionAccent + '66', opacity: humanStagePlateActive ? 0.12 : 0.72 }]}
        />
        <View
          pointerEvents="none"
          style={[styles.sceneShadeTop, { backgroundColor: theme.colors.surface1, opacity: humanStagePlateActive ? 0.04 : 0.16 }]}
        />
        <View
          pointerEvents="none"
          style={[styles.sceneShadeBottom, { backgroundColor: theme.colors.surface1, opacity: humanStagePlateActive ? 0.06 : 0.2 }]}
        />
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
                        borderColor: zoneBorder,
                        opacity: districtAnalysisVisible ? 1 : 0
                      }
                    ]}
                  />
                );
              })}
            </View>
            <View pointerEvents={districtAnalysisVisible ? "box-none" : "none"} style={styles.districtTagLayer}>
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
                      setSelectedBuildingAction(null);
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
                        opacity: districtAnalysisVisible ? (connection.focused ? 1 : dimmed ? 0.42 : 0.76) : 0
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
                  { backgroundColor: connection.color, opacity: districtAnalysisVisible ? (connection.focused ? 0.3 : districtFocusActive ? 0.05 : 0.1) : 0.015 }
                ]}
              />
              <View
                testID={'district-link-' + connection.id}
                style={[
                  connection.style,
                  styles.districtLink,
                  { backgroundColor: connection.color, opacity: districtAnalysisVisible ? (connection.focused ? 0.96 : districtFocusActive ? 0.28 : 0.56) : 0.12 }
                ]}
              />
            </React.Fragment>
          ))}
        </View>
        {visibleDistrictConnections.length ? (
          <View pointerEvents="none" style={styles.districtEnvironmentLayer}>
            {visibleDistrictConnections.map(connection => (
              <View
                key={'environment-' + connection.id}
                testID={'district-environment-' + connection.id}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[
                  connection.activityStyle,
                  styles.districtEnvironment,
                  { opacity: districtAnalysisVisible ? (connection.focused ? 1 : districtFocusActive ? 0.28 : 0.82) : 0 }
                ]}
              >
                <SettlementDistrictAmbience
                  category={connection.category}
                  faction={activeFaction}
                  focused={connection.focused}
                  size={58}
                />
              </View>
            ))}
          </View>
        ) : null}
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
          const relocationPlanVisible = Boolean(relocationPlan) && relocationMode && !building;
          const buildReady = unlocked && !building && !selectedBuildingId && !plotSelected && !blueprintPlannerOpen && constructionReadyCount > 0;
          const recommendedBuildPlot = buildReady && nextSuggestedPlot?.id === plot.id;
          const upgradeMaterialsReady = Boolean(building) && upgradeMaterialReadyIds.has(building!.id);
          const depthScale = plot.row === 0 ? 0.86 : plot.row === 2 ? 1.1 : 1;
          const buildingSize = worldRebuildActive
            ? landmark ? 110 : Math.round(66 * depthScale)
            : landmark ? 106 : Math.round(70 * depthScale);
          const ambienceSize = worldRebuildActive
            ? landmark ? 118 : Math.round(78 * depthScale)
            : landmark ? 126 : Math.round(94 * depthScale);
          const plotZIndex = tutorialPlotFocused || selected ? 30 : districtMemberFocused ? 29 : relocationPlanVisible ? 27 : districtPreviewPartner ? 26 : celebrationFocused ? 24 : landmark ? 16 : 5 + plot.row * 5;
          const buildingDistrictBonuses = building
            ? settlementAdjacencyBonuses.filter(bonus => bonus.buildingA === building.id || bonus.buildingB === building.id)
            : [];
          const districtCount = buildingDistrictBonuses.length;
          const districtActivityColor = buildingDistrictBonuses[0]
            ? semanticColor(theme, settlementDistrictTone(buildingDistrictBonuses[0]))
            : roleColor;
          const visualPosition = (
            humanStagePlateActive
              ? humanSettlementBackgroundPositions[plot.id]
              : worldRebuildActive
                ? fortWorldPositions[plot.id]
                : settlementPlotPositions[plot.id]
          ) ?? {
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
              accessibilityHint={!unlocked ? undefined : building ? 'Select this building to show Inspect, Move and Upgrade actions.' : relocationMode ? 'Preview this free relocation destination before confirming.' : 'Show construction choices. Selecting a plot does not spend resources.'}
              disabled={!unlocked}
              onLongPress={() => {
                if (!building) return;
                setMessage(null);
                setUnlockCelebration(null);
                setSelectedDistrictId(null);
                setDistrictCodexOpen(false);
                setSelectedBuildingId(building.id);
                setSelectedBuildingAction(null);
                setRelocationTargetPlotId(null);
                setSelectedPlotId(null);
                setPreviewBuildingId(null);
                setBlueprintPlannerOpen(false);
                setPlanningBuildingId(null);
              }}
              delayLongPress={280}
              onPress={() => {
                setMessage(null);
                setUnlockCelebration(null);
                setSelectedDistrictId(null);
                setDistrictCodexOpen(false);
                if (building) {
                  setSelectedBuildingId(building.id);
                  setSelectedBuildingAction(null);
                  setRelocationTargetPlotId(null);
                  setSelectedPlotId(null);
                  setPreviewBuildingId(null);
                  setBlueprintPlannerOpen(false);
                  setPlanningBuildingId(null);
                  return;
                }
                if (relocationMode) {
                  setRelocationTargetPlotId(relocationTargetSelected ? null : plot.id);
                  setPreviewBuildingId(null);
                  setSelectedPlotId(null);
                  return;
                }
                if (selectedBuildingId) {
                  setSelectedBuildingId(null);
                  setSelectedBuildingAction(null);
                  setRelocationTargetPlotId(null);
                }
                if (plotSelected) {
                  setSelectedPlotId(null);
                  setPreviewBuildingId(null);
                } else {
                  const opportunityCandidate = districtOpportunityByPlot.get(plot.id);
                  const districtCandidate = opportunityCandidate
                    ? availableBuildings.find(candidate => candidate.id === opportunityCandidate.buildingId) ?? null
                    : availableBuildings.find(candidate => previewBonusesAtPlot(plot, candidate.id).length > 0) ?? null;
                  const tutorialCandidate = tutorialFocus?.kind === 'settlement-building'
                    ? availableBuildings.find(candidate => candidate.id === tutorialFocus.buildingId) ?? null : null;
                  const previewCandidate = planningBuilding ?? tutorialCandidate ?? previewBuilding ?? districtCandidate ?? affordableBuildings[0] ?? availableBuildings[0] ?? null;
                  setSelectedPlotId(plot.id);
                  setPreviewBuildingId(previewCandidate?.id ?? null);
                  setConstructionReviewOpen(Boolean(previewCandidate && (planningBuilding || tutorialCandidate || constructionReviewOpen)));
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
                  borderWidth: worldRebuildActive
                    ? tutorialPlotFocused || selected ? 2.5 : relocationPlanVisible || blueprintPlanVisible || districtOpportunityVisible || recommendedBuildPlot ? 2 : 0
                    : tutorialPlotFocused || selected ? 2.5 : building ? 0 : relocationPlanVisible ? 2 : blueprintPlanVisible ? 2 : districtOpportunityVisible ? 2 : recommendedBuildPlot ? 2.25 : 1.5,
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
                    backgroundColor: building
                      ? theme.colors.surface1
                      : !unlocked
                        ? theme.colors.surface3
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
                                  : theme.colors.surface2,
                    opacity: worldRebuildActive
                      ? building ? selected ? 0.08 : 0 : unlocked ? selected || buildReady || blueprintPlanVisible || relocationPlanVisible ? 0.12 : 0 : 0.34
                      : building ? 0.12 : unlocked ? selected ? 0.18 : buildReady || blueprintPlanVisible || relocationPlanVisible || districtOpportunityVisible ? 0.14 : 0.06 : 0.72
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
                  <View
                    pointerEvents="none"
                    testID={'building-ground-shadow-' + building.id}
                    style={[
                      styles.buildingGroundShadow,
                      landmark ? styles.landmarkBuildingGroundShadow : undefined,
                      worldRebuildActive ? styles.worldBuildingGroundShadow : undefined,
                      {
                        opacity: humanStagePlateActive
                          ? selected ? 0.08 : 0.035
                          : selected ? 0.26 : worldRebuildActive ? 0.22 : 0.2,
                        transform: [
                          { scaleX: depthScale * (landmark ? 1.08 : 1) },
                          { scaleY: landmark ? 1.08 : 1 }
                        ]
                      }
                    ]}
                  />
                  <View
                    pointerEvents="none"
                    testID={'building-contact-shadow-' + building.id}
                    style={[
                      styles.buildingContactShadow,
                      landmark ? styles.landmarkBuildingContactShadow : undefined,
                      {
                        opacity: humanStagePlateActive
                          ? selected ? 0.16 : 0.08
                          : selected ? 0.34 : worldRebuildActive ? 0.28 : 0.28,
                        transform: [{ scaleX: depthScale }]
                      }
                    ]}
                  />
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
                  {districtCount > 0 && districtAnalysisVisible ? (
                    <View
                      pointerEvents="none"
                      testID={'building-district-aura-' + building.id}
                      style={[
                        styles.buildingDistrictAura,
                        landmark ? styles.landmarkDistrictAura : undefined,
                        {
                          borderColor: districtActivityColor,
                          backgroundColor: districtActivityColor + (districtCount > 1 ? '22' : '16'),
                          opacity: selected ? 0.46 : districtCount > 1 ? 0.84 : 0.72
                        }
                      ]}
                    />
                  ) : null}
                  <View
                    pointerEvents="none"
                    style={[
                      styles.buildingAmbience,
                      landmark ? styles.landmarkAmbience : undefined,
                      humanStagePlateActive
                        ? { opacity: selected ? 0.48 : districtAnalysisVisible && districtCount > 0 ? 0.2 : 0 }
                        : undefined
                    ]}
                  >
                    <SettlementBuildingAmbience
                      buildingId={building.id}
                      role={building.role}
                      faction={building.faction}
                      level={level}
                      activeDistricts={districtCount}
                      size={ambienceSize}
                    />
                  </View>
                  <View
                    style={[
                      styles.buildingPad,
                      landmark ? styles.landmarkBuildingPad : undefined,
                      worldRebuildActive ? landmark ? styles.worldLandmarkBuildingPad : styles.worldBuildingPad : undefined,
                      selected
                        ? worldRebuildActive
                          ? landmark ? styles.selectedWorldLandmarkBuildingPad : styles.selectedWorldBuildingPad
                          : styles.selectedBuildingPad
                        : undefined
                    ]}
                  >
                    {!worldRebuildActive ? (
                      <View
                        pointerEvents="none"
                        style={[
                          styles.buildingFootprint,
                          landmark ? styles.landmarkFootprint : undefined,
                          { backgroundColor: roleColor }
                        ]}
                      />
                    ) : null}
                    <BuildingSprite buildingId={building.id} faction={building.faction} size={buildingSize} />
                  </View>
                  {upgradeMaterialsReady && !selected && !worldRebuildActive ? (
                    <View
                      pointerEvents="none"
                      style={[styles.upgradeReadyBadge, { backgroundColor: theme.colors.gold }]}
                    >
                      <Text style={styles.upgradeReadyText}>UPGRADE</Text>
                    </View>
                  ) : null}
                  {!worldRebuildActive || selected ? (
                    <>
                      <Text
                        style={[
                          styles.plotBuildingName,
                          !selected && !landmark ? styles.plotBuildingNameCompact : undefined,
                          { color: roleColor, backgroundColor: theme.colors.surface1 }
                        ]}
                        numberOfLines={1}
                      >
                        {building.name}
                      </Text>
                      <View
                        testID={'building-level-status-' + building.id}
                        style={[styles.levelPill, { backgroundColor: theme.colors.surface1, borderColor: selected ? theme.colors.gold : theme.colors.border }]}
                      >
                        <SemanticText tone="neutral" style={styles.plotLevel}>Lv.{level}</SemanticText>
                        {districtCount > 0 ? (
                          <>
                            <View style={[styles.levelDistrictDot, { backgroundColor: districtActivityColor }]} />
                            <Text
                              testID={'building-district-count-' + building.id}
                              accessible={false}
                              style={[styles.levelDistrictCount, { color: districtActivityColor }]}
                            >
                              {districtCount}
                            </Text>
                          </>
                        ) : null}
                      </View>
                    </>
                  ) : null}
                </>
              ) : unlocked ? (
                <>
                  {buildReady ? (
                    recommendedBuildPlot ? (
                      worldRebuildActive ? (
                        <View
                          pointerEvents="none"
                          testID={'world-build-ready-' + plot.id}
                          style={[styles.worldBuildReadyMarker, { backgroundColor: theme.colors.gold, borderColor: theme.colors.surface1 }]}
                        >
                          <Text style={styles.worldBuildReadyPlus}>+</Text>
                        </View>
                      ) : (
                        <View
                          pointerEvents="none"
                          style={[styles.buildReadyBadge, { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold }]}
                        >
                          <Text style={styles.buildReadyText}>BUILD READY</Text>
                        </View>
                      )
                    ) : !worldRebuildActive ? (
                      <View
                        pointerEvents="none"
                        style={[styles.buildReadyDot, { backgroundColor: factionAccent }]}
                      />
                    ) : null
                  ) : null}
                  {plotSelected && previewBuilding && constructionPlotAvailable ? (
                    <View pointerEvents="none" testID="construction-ghost-preview" style={styles.constructionGhost}>
                      <View style={styles.constructionGroundShadow} />
                      <BuildingSprite buildingId={previewBuilding.id} faction={activeFaction} size={72} />
                      <Text style={[styles.constructionGhostLabel, { color: theme.colors.gold, backgroundColor: theme.colors.surface1 }]}>PREVIEW</Text>
                    </View>
                  ) : null}
                  <View
                    pointerEvents="none"
                    style={[
                      styles.buildPlotArt,
                      worldRebuildActive && !recommendedBuildPlot && !plotSelected && !relocationMode && !blueprintPlanVisible ? { opacity: 0 } : undefined
                    ]}
                  >
                    <SettlementBuildPlotSprite
                      terrain={plot.terrain}
                      faction={activeFaction}
                      selected={plotSelected}
                      moveTarget={relocationMode}
                      size={worldRebuildActive ? 76 : 94}
                      color={theme.colors.textMuted}
                    />
                  </View>
                  {!worldRebuildActive || recommendedBuildPlot || plotSelected || relocationMode ? (
                    <View pointerEvents="none" style={[styles.emptyBadge, worldRebuildActive ? styles.worldEmptyBadge : undefined, { backgroundColor: theme.colors.surface1 }]}>
                      <Text style={[styles.emptyPlusCompact, { color: selected || relocationMode ? theme.colors.gold : semanticColor(theme, 'neutral') }]}>+</Text>
                      <SemanticText tone="neutral" style={styles.emptyText}>
                        {relocationMode ? relocationTargetSelected ? 'Target' : 'Move' : buildReady ? 'Build' : 'Plot'}
                      </SemanticText>
                    </View>
                  ) : null}
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
        {selectedPlot && !selectedBuilding ? (
          <View testID="settlement-construction-layer" pointerEvents="box-none" style={styles.sceneActionsLayer}>
            <View
              testID="scene-construction-card"
              onLayout={event => {
                const height = event.nativeEvent.layout.height;
                if (Number.isFinite(height) && height > 0) setMeasuredConstructionHeight(previous => Math.abs(previous - height) < 0.5 ? previous : height);
              }}
              style={[styles.sceneActionStrip, { ...constructionLayout, maxHeight: constructionMaxHeight,
                backgroundColor: theme.colors.surface1, borderColor: factionAccent }]}
            >
              <View onLayout={event => {
                const height = event.nativeEvent.layout.height;
                if (Number.isFinite(height) && height > 0) setMeasuredConstructionHeader(previous => Math.abs(previous - height) < 0.5 ? previous : height);
              }} style={styles.sceneActionHeading}>
                <View style={styles.sceneActionHeadingCopy}>
                  <Text style={[styles.sceneActionLevel, { color: factionAccent }]}>BUILD SITE · {settlementPlotLabels[selectedPlot.id] ?? selectedPlot.id}</Text>
                  <Text accessibilityRole="header" style={[styles.sceneActionName, { color: theme.colors.text }]}>
                    {constructionReviewOpen ? 'Review construction' : 'Choose a blueprint'}
                  </Text>
                </View>
                <Pressable testID="construction-close" accessibilityRole="button" accessibilityLabel="Close construction without building" onPress={closeConstruction} style={styles.sceneActionClose}>
                  <Text style={[styles.sceneCloseText, { color: theme.colors.text }]}>×</Text>
                </Pressable>
              </View>
              <ScrollView
                key={(constructionReviewOpen ? 'review:' : 'picker:') + (previewBuildingId ?? '')}
                testID="scene-construction-scroll"
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={{ maxHeight: constructionScrollHeight }}
                contentContainerStyle={styles.sceneDetailsScroll}
              >
                {message ? <Text testID="scene-construction-feedback" accessibilityLiveRegion="polite" style={[styles.sceneFeedback, { color: theme.colors.text }]}>{message}</Text> : null}
                {!constructionPlotAvailable ? (
                  <Text accessibilityLiveRegion="polite" style={[styles.sceneDetailText, { color: semanticColor(theme, 'warning') }]}>{constructionBlocker}</Text>
                ) : constructionReviewOpen ? (
                  <View testID="scene-construction-review" style={styles.sceneDetailsContent}>
                    {previewBuilding ? (
                      <TutorialFocus active={tutorialConstructionFocused} label={tutorialConstructionFocused ? tutorialFocus?.label : undefined}>
                        <View style={styles.sceneDetailsContent}>
                          <BuildingHeading building={previewBuilding} />
                          <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>Preview only · nothing built or spent yet.</Text>
                          <Text style={[styles.sceneDetailText, { color: theme.colors.text }]}>{getBuildingLevelDefinition(previewBuilding.id, 1)?.effect ?? previewBuilding.description}</Text>
                          <SemanticChip label={previewPlacementQuality.label + ' · ' + previewPlacementQuality.summary} tone={previewPlacementQuality.tone} compact />
                          <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>
                            {previewDistrictBonuses.length ? 'Activates ' + previewDistrictBonuses.map(bonus => bonus.name).join(' + ') + '.' : 'No district bonus activates here.'}
                          </Text>
                          {previewDistrictBonuses.map(bonus => <View key={bonus.id} style={[styles.preview, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface2 }]}>
                            <Text style={[styles.sceneDetailTitle, { color: theme.colors.text }]}>{bonus.name}</Text>
                            <DistrictEffects bonus={bonus} state="preview" />
                          </View>)}
                          {constructionBlocker ? <Text accessibilityLiveRegion="polite" style={[styles.sceneDetailText, { color: semanticColor(theme, 'warning') }]}>{constructionBlocker}</Text> : null}
                          <BuildingCosts cost={previewBuilding.constructionCost} wallet={resources} />
                          <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>Build places this blueprint on the {settlementPlotLabels[selectedPlot.id] ?? selectedPlot.id} plot and spends the listed construction cost once.</Text>
                          <PrimaryButton label={'Build ' + previewBuilding.name} disabled={Boolean(constructionBlocker)} onPress={confirmSceneConstruction} />
                          {tutorialConstructionFocused ? <SecondaryButton label="Build later" onPress={() => {
                            setConstructionReviewOpen(false);
                            onTutorialFocusComplete?.();
                            setMessage('Blueprint learned. Build it when the resources and timing suit your plan.');
                          }} /> : null}
                        </View>
                      </TutorialFocus>
                    ) : <Text style={[styles.sceneDetailText, { color: semanticColor(theme, 'warning') }]}>This blueprint is no longer available. Choose another blueprint.</Text>}
                    <SecondaryButton label="Choose another blueprint" onPress={() => { setConstructionReviewOpen(false); setMessage(null); }} />
                  </View>
                ) : (
                  <View testID="scene-construction-picker" style={styles.sceneDetailsContent}>
                    <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>Select a blueprint to review its cost. Selection never spends resources.</Text>
                    {previewBuilding ? <View style={styles.sceneDetailsContent}>
                      <Text style={[styles.sceneDetailTitle, { color: theme.colors.text }]}>Preview: {previewBuilding.name}</Text>
                      <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>{previewDistrictBonuses.length ? 'Activates ' + previewDistrictBonuses.map(bonus => bonus.name).join(' + ') + '.' : 'No district bonus activates here.'}</Text>
                    </View> : null}
                    {availableBuildings.map(building => {
                      const quality = settlementPlacementQuality(previewBonuses(building.id).length);
                      const affordable = canPayBuildingCost(resources, building.constructionCost);
                      const focused = tutorialFocus?.kind === 'settlement-building' && tutorialFocus.buildingId === building.id;
                      const previewed = previewBuildingId === building.id;
                      const role = buildingRolePresentation[building.role];
                      return <TutorialFocus key={building.id} active={focused} label={focused ? tutorialFocus?.label : undefined}>
                        <View testID={'settlement-blueprint-' + building.id}>
                          <Pressable
                            testID={'construction-select-' + building.id}
                            accessibilityRole="button"
                            accessibilityState={{ selected: previewed }}
                            accessibilityLabel={'Review ' + building.name + ', ' + quality.label + ' placement, ' + (affordable ? 'materials available' : 'materials missing')}
                            accessibilityHint="Shows construction benefits and cost; no resources are spent."
                            onPress={() => { setPreviewBuildingId(building.id); setConstructionReviewOpen(true); setMessage(null); if (blueprintPlannerOpen) setPlanningBuildingId(building.id); }}
                            style={({ pressed }) => [styles.constructionChoice, {
                              borderColor: previewed ? theme.colors.gold : theme.colors.border,
                              backgroundColor: theme.colors.surface2, opacity: pressed ? 0.75 : 1
                            }]}
                          >
                            <View pointerEvents="none" style={styles.constructionChoiceHeading}>
                              <BuildingSprite buildingId={building.id} faction={activeFaction} size={32} />
                              <View style={styles.sceneActionHeadingCopy}>
                                <Text style={[styles.sceneActionName, { color: theme.colors.text }]}>{building.name}</Text>
                                <Text style={[styles.sceneActionLevel, { color: semanticColor(theme, role?.tone ?? 'neutral') }]}>{role?.label ?? building.role}</Text>
                              </View>
                            </View>
                            <View pointerEvents="none" style={styles.chips}>
                              <SemanticChip label={affordable ? 'Materials available' : 'Materials missing'} tone={affordable ? 'positive' : 'warning'} compact />
                              <SemanticChip label={quality.label + ' · ' + quality.summary} tone={quality.tone} compact />
                            </View>
                          </Pressable>
                        </View>
                      </TutorialFocus>;
                    })}
                    {!availableBuildings.length ? <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>No unlocked unbuilt buildings are currently available.</Text> : null}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        ) : null}
        {selectedBuilding ? (
          <View testID="settlement-scene-actions-layer" pointerEvents="box-none" style={styles.sceneActionsLayer}>
            <View
              testID={'building-action-strip-' + selectedBuilding.id}
              onLayout={event => {
                const height = event.nativeEvent.layout.height;
                if (Number.isFinite(height) && height > 0) setMeasuredActionHeight(previous => Math.abs(previous - height) < 0.5 ? previous : height);
              }}
              style={[styles.sceneActionStrip, { ...actionLayout, maxHeight: mapHeight - 16, backgroundColor: theme.colors.surface1, borderColor: theme.colors.gold }]}
            >
              <View onLayout={event => {
                const height = event.nativeEvent.layout.height;
                if (Number.isFinite(height) && height > 0) setMeasuredActionChrome(previous => Math.abs(previous - height) < 0.5 ? previous : height);
              }}>
                <View style={styles.sceneActionHeading}>
                  <View style={styles.sceneActionHeadingCopy}>
                    <Text style={[styles.sceneActionName, { color: theme.colors.text }]} numberOfLines={2}>{selectedBuilding.name}</Text>
                    <Text style={[styles.sceneActionLevel, { color: theme.colors.textMuted }]}>Lv.{selectedBuildingLevel} · {buildingRolePresentation[selectedBuilding.role]?.label ?? selectedBuilding.role}</Text>
                  </View>
                  <Pressable testID="building-action-close" accessibilityRole="button" accessibilityLabel="Close building actions" onPress={closeBuildingSelection} style={styles.sceneActionClose}>
                    <Text style={[styles.sceneCloseText, { color: theme.colors.text }]}>×</Text>
                  </Pressable>
                </View>
                <View style={styles.sceneActionRow}>
                  {(['inspect', 'move', 'upgrade'] as const).map(action => {
                    const active = selectedBuildingAction === action;
                    const disabled = action === 'move' && !selectedCanMove;
                    const ready = action === 'upgrade' && !selectedUpgradeBlocker;
                    const label = action === 'inspect' ? 'Inspect' : action === 'move' ? 'Move' : 'Upgrade';
                    return <Pressable
                      key={action}
                      testID={'building-action-' + action + '-' + selectedBuilding.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active, disabled }}
                      accessibilityLabel={(action === 'upgrade' ? 'Review upgrade for ' : label + ' ') + selectedBuilding.name}
                      accessibilityHint={action === 'upgrade' ? 'Review benefits, requirements and cost before confirming. Opening this review never spends resources.' : disabled ? 'No unlocked empty plot is available.' : undefined}
                      disabled={disabled}
                      onPress={() => { setSelectedBuildingAction(action); setRelocationTargetPlotId(null); setMessage(null); }}
                      style={({ pressed }) => [styles.sceneActionButton, {
                        backgroundColor: active || ready ? blendColor(theme.colors.gold, theme.colors.surface1, 0.16) : theme.colors.surface2,
                        borderColor: active ? theme.colors.gold : theme.colors.border,
                        opacity: disabled ? 0.45 : pressed ? 0.75 : 1
                      }]}
                    >
                      {ready ? <View pointerEvents="none" style={[styles.sceneActionReadyDot, { backgroundColor: theme.colors.gold }]} /> : null}
                      <Text style={[styles.sceneActionText, { color: active || ready ? theme.colors.gold : theme.colors.text }]}>{label}</Text>
                    </Pressable>;
                  })}
                </View>
                {!selectedCanMove && !buildingDetails ? <Text style={[styles.sceneFeedback, { color: theme.colors.textMuted }]}>No unlocked empty plots for moving.</Text> : null}
                {message ? <Text testID="scene-building-feedback" accessibilityLiveRegion="polite" style={[styles.sceneFeedback, { color: theme.colors.text }]}>{message}</Text> : null}
              </View>
              {buildingDetails ? <ScrollView testID="scene-building-details-scroll" nestedScrollEnabled style={{ maxHeight: actionDetailHeight }} contentContainerStyle={styles.sceneDetailsScroll}>
                {buildingDetails}
              </ScrollView> : null}
            </View>
          </View>
        ) : null}
        {['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id) ? (
          <>
            <View pointerEvents="none" style={[styles.wallTop, { borderColor: factionAccent, borderTopWidth: fortificationWeight, opacity: worldRebuildActive ? 0 : 0.75 }]} />
            <View pointerEvents="none" style={[styles.wallBottom, { borderColor: factionAccent, borderBottomWidth: fortificationWeight, opacity: worldRebuildActive ? 0 : 0.75 }]} />
            <Text pointerEvents="none" style={[styles.gateLabel, { color: factionAccent, opacity: worldRebuildActive ? 0 : 1 }]}>
              {currentWagonStage.id === 'grand' ? 'GRAND GATE' : currentWagonStage.id === 'capital' ? 'CAPITAL GATE' : currentWagonStage.id === 'stronghold' ? 'STRONGHOLD GATE' : currentWagonStage.id === 'town' ? 'TOWN GATE' : 'FORT GATE'}
            </Text>
          </>
        ) : null}

        {adjacencyRecipes.length && !selectedBuilding && !selectedPlot && !unlockCelebration && !blueprintPlannerOpen && !districtCodexOpen ? (
          <>
            <Pressable
              testID="district-overlay-launcher"
              accessibilityRole="button"
              accessibilityState={{ expanded: districtOverlayOpen }}
              accessibilityLabel={
                'District overlay, ' +
                settlementAdjacencyBonuses.length +
                ' active districts, ' +
                (districtOverlayOpen ? 'close filters' : 'open filters')
              }
              onPress={() => {
                setDistrictOverlayOpen(open => !open);
                setSelectedDistrictId(null);
                setDistrictCodexOpen(false);
              }}
              style={[
                styles.districtOverlayLauncher,
                {
                  backgroundColor: theme.colors.surface1,
                  borderColor: districtOverlayOpen ? factionAccent : theme.colors.border
                }
              ]}
            >
              <View style={[styles.districtOverlayLauncherDot, { backgroundColor: factionAccent }]} />
              <Text style={[styles.districtOverlayLauncherText, { color: theme.colors.text }]}>DISTRICTS</Text>
              <Text style={[styles.districtOverlayLauncherCount, { color: factionAccent }]}>
                {districtOverlayOpen ? '×' : settlementAdjacencyBonuses.length}
              </Text>
            </Pressable>

            {districtOverlayOpen ? (
              <View
                testID="district-overlay-controls"
                accessibilityLabel="District overlay filters"
                style={[styles.districtOverlayControls, { backgroundColor: theme.colors.surface1, borderColor: factionAccent + '88' }]}
              >
                <View style={styles.districtOverlayHeader}>
                  <View style={styles.districtOverlayHeaderCopy}>
                    <Text style={[styles.districtOverlayLabel, { color: theme.colors.textMuted }]}>DISTRICT OVERLAY</Text>
                    <Text style={[styles.districtOverlayHint, { color: theme.colors.textMuted }]}>Tap a filter</Text>
                  </View>
                  <Pressable
                    testID="district-codex-open"
                    accessibilityRole="button"
                    accessibilityLabel={
                      'Open District Codex, ' +
                      settlementAdjacencyBonuses.length +
                      ' of ' +
                      adjacencyRecipes.length +
                      ' active'
                    }
                    onPress={() => {
                      setDistrictCodexOpen(true);
                      setDistrictOverlayOpen(false);
                      setSelectedDistrictId(null);
                    }}
                    style={[styles.districtCodexInlineButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface2 }]}
                  >
                    <Text style={[styles.districtCodexInlineText, { color: theme.colors.gold }]}>CODEX</Text>
                  </Pressable>
                </View>
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
          </>
        ) : null}
      </View>
      {!worldRebuildActive ? (
        <View style={styles.sceneLegend}>
          <Text style={[styles.sceneLegendText, { color: theme.colors.textMuted }]}>
            {districtOverlayFilter === 'all' ? 'Tap buildings for actions · marked ground = build' : districtOverlayFilter.charAt(0).toUpperCase() + districtOverlayFilter.slice(1) + ' districts shown'}
          </Text>
          <Text style={[styles.sceneLegendCount, { color: factionAccent }]}>{placedIds.length}/{buildings.length}</Text>
        </View>
      ) : null}

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
                    setSelectedBuildingAction('inspect');
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
                    setSelectedBuildingAction('inspect');
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
      ) : selectedBuilding || selectedPlot || worldRebuildActive ? null : (
        <Text style={[styles.sceneHelp, { color: theme.colors.textMuted }]}>Tap a structure to manage it or marked ground to expand.</Text>
      )}

      {districtCodexOpen ? (
        <View
          testID="district-codex"
          style={[styles.districtCodex, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
        >
          <Pressable
            testID="district-codex-toggle"
            accessibilityRole="button"
            accessibilityState={{ expanded: true }}
            accessibilityLabel={
              'Close District Codex, ' +
              settlementAdjacencyBonuses.length +
              ' of ' +
              adjacencyRecipes.length +
              ' active'
            }
            onPress={() => setDistrictCodexOpen(false)}
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
            <Text style={[styles.districtCodexAction, { color: theme.colors.gold }]}>CLOSE</Text>
          </Pressable>

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
        </View>
      ) : null}
      {message && !selectedBuilding && !selectedPlot ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.colors.text }]}>{message}</Text> : null}
      <SecondaryButton label="Return to Kingdom" onPress={onExit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 10, paddingBottom: 30, gap: 8 },
  hud: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 8 },
  hudCompact: { borderRadius: 14, paddingHorizontal: 9, paddingVertical: 6 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 1.1 },
  eyebrowCompact: { fontSize: 7, lineHeight: 9, letterSpacing: 0.9 },
  title: { fontSize: 17, lineHeight: 21, fontWeight: '900', marginTop: 1 },
  titleCompact: { fontSize: 14, lineHeight: 17, marginTop: 0 },
  stageBadge: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  stageBadgeCompact: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  stageBadgeText: { fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 0.65 },
  stageBadgeTextCompact: { fontSize: 7, lineHeight: 9, letterSpacing: 0.5 },
  resourceStrip: { flexDirection: 'row', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 5, marginTop: 7, gap: 2 },
  resourceStripCompact: { borderRadius: 9, paddingHorizontal: 4, paddingVertical: 3, marginTop: 5 },
  worldResourceStrip: { borderRadius: 0, paddingHorizontal: 0, paddingVertical: 3 },
  resourceCell: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 2 },
  resourceCellCompact: { justifyContent: 'center', gap: 1 },
  resourceCopy: { flex: 1, minWidth: 0 },
  resourceValue: { fontSize: 9.5, lineHeight: 12, fontWeight: '900' },
  resourceValueCompact: { fontSize: 8.5, lineHeight: 10 },
  resourceLabel: { fontSize: 7, lineHeight: 9, fontWeight: '700' },
  hudFooter: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 },
  hudFooterCompact: { marginTop: 3, minHeight: 12 },
  hudCompactSummary: { flex: 1, minWidth: 0, fontSize: 8, lineHeight: 10, fontWeight: '800', letterSpacing: 0.1 },
  hudStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, flexShrink: 1 },
  nextGoalInline: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
  nextGoalEyebrow: { fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.85 },
  nextGoalTitle: { fontSize: 10.5, lineHeight: 13, fontWeight: '900', maxWidth: '100%' },
  body: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 },
  districtOverlayLauncher: { position: 'absolute', right: 9, top: 9, zIndex: 42, minHeight: 28, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.96, elevation: 5 },
  districtOverlayLauncherDot: { width: 6, height: 6, borderRadius: 999 },
  districtOverlayLauncherText: { fontSize: 7.5, lineHeight: 10, fontWeight: '900', letterSpacing: 0.65 },
  districtOverlayLauncherCount: { fontSize: 8, lineHeight: 10, fontWeight: '900' },
  districtOverlayControls: { position: 'absolute', left: 8, right: 8, top: 8, zIndex: 41, borderWidth: 1, borderRadius: 13, paddingHorizontal: 7, paddingVertical: 6, gap: 5, opacity: 0.98, elevation: 4 },
  districtOverlayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingRight: 88 },
  districtOverlayHeaderCopy: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  districtOverlayLabel: { fontSize: 6.5, lineHeight: 8, fontWeight: '900', letterSpacing: 0.8 },
  districtOverlayHint: { fontSize: 6.5, lineHeight: 8, fontWeight: '700' },
  districtCodexInlineButton: { minHeight: 24, borderWidth: 1, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
  districtCodexInlineText: { fontSize: 7, lineHeight: 9, fontWeight: '900', letterSpacing: 0.55 },
  districtOverlayButtons: { flexDirection: 'row', gap: 4, paddingRight: 88 },
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
  map: { borderRadius: 28, borderWidth: 2, overflow: 'hidden', position: 'relative', elevation: 3 },
  authoredWorldMap: { borderRadius: 24, borderWidth: 1, elevation: 1 },
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  sceneInnerFrame: { position: 'absolute', left: 5, right: 5, top: 5, bottom: 5, borderWidth: 1, borderRadius: 23, opacity: 0.72, zIndex: 1 },
  sceneShadeTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 34, opacity: 0.16, zIndex: 1 },
  sceneShadeBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 48, opacity: 0.2, zIndex: 1 },
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
  districtEnvironmentLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 4 },
  districtEnvironment: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  districtLinkGlow: { position: 'absolute', height: 7, borderRadius: 999 },
  districtLink: { position: 'absolute', height: 2.5, borderRadius: 999 },
  districtPreviewLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 4 },
  districtPreviewLink: { position: 'absolute', height: 1, borderTopWidth: 2, borderStyle: 'dashed', opacity: 0.9 },
  relocationPreviewLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 5 },
  relocationPreviewLink: { position: 'absolute', height: 1, borderTopWidth: 2.5, borderStyle: 'dashed', opacity: 0.92 },
  plot: { position: 'absolute', width: '28%', height: '24%', borderRadius: 17, alignItems: 'center', justifyContent: 'center', padding: 4, overflow: 'visible' },
  landmarkPlot: { width: '34%', height: '29%' },
  plotSurface: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: '#FFFFFF18' },
  selectionHalo: { position: 'absolute', left: '50%', bottom: '21%', marginLeft: -44, width: 88, height: 32, borderRadius: 999, borderWidth: 2.5, opacity: 0.96 },
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
  sceneDismissSurface: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 1 },
  sceneActionsLayer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 50 },
  sceneActionStrip: { position: 'absolute', borderWidth: 1, borderRadius: 16, padding: 6, elevation: 12, overflow: 'hidden' },
  sceneActionHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sceneActionHeadingCopy: { flex: 1, minWidth: 0, paddingLeft: 5 },
  sceneActionName: { fontSize: 13, lineHeight: 18, fontWeight: '900' },
  sceneActionLevel: { fontSize: 11, lineHeight: 16 },
  sceneActionClose: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  sceneCloseText: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  sceneActionRow: { flexDirection: 'row', gap: 5 },
  sceneActionButton: { flex: 1, minWidth: 48, minHeight: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 4, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 3 },
  sceneActionText: { fontSize: 12, lineHeight: 17, fontWeight: '900', flexShrink: 1, textAlign: 'center' },
  sceneActionReadyDot: { width: 5, height: 5, borderRadius: 999 },
  sceneDetailsScroll: { padding: 6, paddingTop: 10 },
  sceneDetailsContent: { gap: 8 },
  constructionChoice: { minWidth: 48, minHeight: 48, borderWidth: 1, borderRadius: 12, padding: 9, gap: 5 },
  constructionChoiceHeading: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  constructionGhost: { position: 'absolute', left: '50%', top: '50%', marginLeft: -38, marginTop: -44, width: 76, alignItems: 'center', opacity: 0.72, zIndex: 7 },
  constructionGroundShadow: { position: 'absolute', left: '50%', bottom: 13, marginLeft: -27, width: 54, height: 15, borderRadius: 999, backgroundColor: '#0A0D0B', opacity: 0.44 },
  constructionGhostLabel: { fontSize: 9, lineHeight: 13, fontWeight: '900', paddingHorizontal: 5, borderRadius: 4 },
  sceneDetailTitle: { fontSize: 12, lineHeight: 18, fontWeight: '900' },
  sceneDetailText: { fontSize: 12, lineHeight: 18 },
  sceneFeedback: { fontSize: 12, lineHeight: 17, fontWeight: '700', padding: 6 },

  landmarkSelectionHalo: { marginLeft: -54, width: 108, height: 38, bottom: '19%' },
  buildingGroundShadow: { position: 'absolute', left: '50%', bottom: '15%', marginLeft: -29, width: 58, height: 14, borderRadius: 999, backgroundColor: '#111712', opacity: 0.22 },
  landmarkBuildingGroundShadow: { bottom: '14%', marginLeft: -41, width: 82, height: 20 },
  worldBuildingGroundShadow: { bottom: '13%', height: 15, backgroundColor: '#0D120F' },
  buildingContactShadow: { position: 'absolute', left: '50%', bottom: '21%', marginLeft: -21, width: 42, height: 7, borderRadius: 999, backgroundColor: '#060806', opacity: 0.32 },
  landmarkBuildingContactShadow: { bottom: '20%', marginLeft: -29, width: 58, height: 9 },
  buildingDistrictAura: { position: 'absolute', left: 9, right: 9, bottom: 13, height: 22, borderRadius: 999, borderWidth: 1, opacity: 0.78, transform: [{ scaleX: 1.08 }] },
  landmarkDistrictAura: { left: 3, right: 3, bottom: 15, height: 30, borderWidth: 1.5, opacity: 0.82 },
  buildingAmbience: { position: 'absolute', left: '50%', top: '50%', marginLeft: -47, marginTop: -47, width: 94, height: 94, alignItems: 'center', justifyContent: 'center' },
  landmarkAmbience: { marginLeft: -63, marginTop: -67, width: 126, height: 126, transform: [{ translateY: -5 }] },
  buildingPad: { width: 82, height: 74, alignItems: 'center', justifyContent: 'flex-end', elevation: 4 },
  selectedBuildingPad: { transform: [{ scale: 1.075 }, { translateY: -2 }] },
  landmarkBuildingPad: { width: 110, height: 98, transform: [{ translateY: -9 }], elevation: 6 },
  worldBuildingPad: { transform: [{ scale: 1.14 }, { translateY: -1 }], elevation: 5 },
  worldLandmarkBuildingPad: { width: 122, height: 108, transform: [{ translateY: -11 }], elevation: 8 },
  selectedWorldBuildingPad: { transform: [{ scale: 1.18 }, { translateY: -3 }], elevation: 7 },
  selectedWorldLandmarkBuildingPad: { width: 122, height: 108, transform: [{ scale: 1.04 }, { translateY: -13 }], elevation: 10 },
  buildingFootprint: { position: 'absolute', left: 5, right: 5, bottom: 0, height: 20, borderRadius: 999, opacity: 0.18, transform: [{ scaleX: 1.08 }] },
  landmarkFootprint: { left: 1, right: 1, height: 27, opacity: 0.24 },
  plotGuideBadge: { position: 'absolute', top: -12, right: -8, zIndex: 5, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  plotGuideText: { color: '#111318', fontSize: 8, lineHeight: 11, fontWeight: '900' },
  plotBuildingName: { fontSize: 9.5, lineHeight: 13, fontWeight: '900', textAlign: 'center', marginTop: 0, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7, maxWidth: '96%', opacity: 0.98, elevation: 2 },
  plotBuildingNameCompact: { fontSize: 8.3, lineHeight: 11, maxWidth: '92%' },
  levelPill: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2, opacity: 0.96, flexDirection: 'row', alignItems: 'center', gap: 3 },
  plotLevel: { fontSize: 8.5, lineHeight: 11, fontWeight: '900' },
  levelDistrictDot: { width: 4, height: 4, borderRadius: 999 },
  levelDistrictCount: { fontSize: 7.5, lineHeight: 10, fontWeight: '900' },
  emptyPlus: { fontSize: 27, fontWeight: '600' },
  buildPlotArt: { position: 'absolute', left: '50%', top: '50%', marginLeft: -47, marginTop: -47, width: 94, height: 94, alignItems: 'center', justifyContent: 'center' },
  emptyBadge: { position: 'absolute', bottom: 4, alignSelf: 'center', minHeight: 27, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.96, elevation: 2 },
  worldEmptyBadge: { minHeight: 24, paddingHorizontal: 7, paddingVertical: 3, opacity: 0.9 },
  buildReadyBadge: { position: 'absolute', top: 3, alignSelf: 'center', zIndex: 8, minHeight: 24, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, elevation: 2 },
  buildReadyText: { color: '#111318', fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 0.5 },
  buildReadyDot: { position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: 999, zIndex: 8 },
  worldBuildReadyMarker: { position: 'absolute', top: 5, alignSelf: 'center', width: 24, height: 24, borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', zIndex: 9, elevation: 4 },
  worldBuildReadyPlus: { color: '#111318', fontSize: 17, lineHeight: 19, fontWeight: '900' },
  upgradeReadyBadge: { position: 'absolute', top: 3, right: 4, zIndex: 9, minHeight: 21, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  upgradeReadyText: { color: '#111318', fontSize: 6, lineHeight: 8, fontWeight: '900', letterSpacing: 0.25 },
  worldUpgradeReadyBadge: { top: 7, right: 8, width: 20, height: 20, minHeight: 20, paddingHorizontal: 0, paddingVertical: 0, borderWidth: 1.5, elevation: 4, opacity: 0.94 },
  worldUpgradeReadyText: { fontSize: 12, lineHeight: 14, letterSpacing: 0 },
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
