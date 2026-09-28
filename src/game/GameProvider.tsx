import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  humanRecruitOptions,
  starterWagonItems,
  wagonStages
} from './data';
import {
  chapterTwoNodes,
  fortMusterOptions,
  humanResourceSites
} from './chapter2';
import {
  chapterThreeNodes,
  marcherAuxiliaryOptions
} from './chapter3';
import {
  advancedPromotions,
  equipmentDefinitions,
  getAdvancedPromotionsForClass,
  getEquipment,
  getRecruitPromotionByEquipment,
  recruitPromotions
} from './equipment';
import {
  encounterRewards
} from './encounters';
import type { EncounterId } from './encounters';
import {
  getCommanderPath,
  getCommanderPaths
} from './commanders';
import { analyzeFormation, formationCells, getFactionDoctrines } from './formation';
import {
  canPayBuildingCost,
  getBuildingLevelDefinition,
  getBuildings
} from './kingdom';
import {
  analyzeSettlementAdjacency,
  applyCostMultiplier,
  humanSettlementPlots,
  isSettlementPlotUnlocked
} from './settlement';
import { sideModes } from './sideModes';
import type {
  AdvancedPromotionDefinition,
  BattleResult,
  ActiveSettlementAdjacencyBonus,
  BuildingDefinition,
  CampaignAvailability,
  ChapterNode,
  CommanderPathDefinition,
  EquipmentDefinition,
  EquipmentSlot,
  FactionId,
  FormationBonus,
  FormationDoctrine,
  PromotionDefinition,
  RecruitOption,
  ResourceSiteDefinition,
  ResourceWallet,
  SettlementAdjacencyEffects,
  SideModeDefinition,
  SideModeId,
  UnitDefinition,
  UnitEquipmentLoadout,
  WagonItemDefinition,
  WagonStage
} from './types';
import {
  getRewardedAdPlacement,
  showRewardedAd
} from '../ads/rewardedAds';
import type {
  RewardedAdPlacementId,
  RewardedAdResult
} from '../ads/rewardedAds';
import type {
  FactionGameState,
  GameSnapshot,
  SharedProgress
} from '../save/types';

type RewardedAdClaimState = Partial<Record<RewardedAdPlacementId, number>>;

type GameContextValue = {
  resources: ResourceWallet;
  units: UnitDefinition[];
  formation: Array<string | null>;
  wagonItems: WagonItemDefinition[];
  currentWagonStage: WagonStage;
  chapterNumber: number;
  chapterNodes: ChapterNode[];
  activeFaction: FactionId;
  completedCampaigns: FactionId[];
  campaignAvailability: CampaignAvailability[];
  formationDoctrineId: string;
  formationDoctrines: FormationDoctrine[];
  formationBonuses: FormationBonus[];
  formationAnalysis: ReturnType<typeof analyzeFormation>;
  activeSquadCap: number;
  formationCells: number[];
  holdTheRoadWon: boolean;
  settlementUpgraded: boolean;
  recruitChoiceAvailable: boolean;
  recruitChosen: boolean;
  markedRaidersInvestigated: boolean;
  forgeUnlocked: boolean;
  firstPromotionComplete: boolean;
  equipmentInventory: string[];
  unitEquipment: Record<string, UnitEquipmentLoadout>;
  equipmentDefinitions: EquipmentDefinition[];
  recruitPromotions: PromotionDefinition[];
  advancedPromotions: AdvancedPromotionDefinition[];
  mercenaryPatrolWon: boolean;
  commanderChoiceUnlocked: boolean;
  commanderPathId: string | null;
  commanderPaths: CommanderPathDefinition[];
  activeCommanderPath: CommanderPathDefinition | null;
  commanderRespecCost: number;
  refugeeCampSecured: boolean;
  buildingLevels: Record<string, number>;
  buildingPlacements: Record<string, string | null>;
  buildings: BuildingDefinition[];
  settlementAdjacencyBonuses: ActiveSettlementAdjacencyBonus[];
  settlementEffects: SettlementAdjacencyEffects;
  fourthRecruitChoiceAvailable: boolean;
  fourthRecruitChosen: boolean;
  fortMusterOptions: RecruitOption[];
  marcherAuxiliaryOptions: RecruitOption[];
  unlockedResourceSites: string[];
  resourceSites: ResourceSiteDefinition[];
  productionStock: ResourceWallet;
  kingdomDefenseCompleted: boolean;
  kingdomDefenseRuns: number;
  signalTowerUnlocked: boolean;
  ironProvostWon: boolean;
  fortUpgradeAvailable: boolean;
  townUpgradeAvailable: boolean;
  canUpgradeToTown: boolean;
  canUpgradeToFort: boolean;
  lastBattleResult: BattleResult | null;
  canUpgradeSettlement: boolean;
  sideModeDefinitions: SideModeDefinition[];
  expeditionTickets: number;
  expeditionRunsCompleted: number;
  formationTrialCompleted: boolean;
  rewardedAdClaims: RewardedAdClaimState;
  rewardedAdMessage: string | null;
  finishEncounter: (encounterId: EncounterId) => void;
  completeMarkedRaiders: () => boolean;
  completeRefugeeCamp: () => boolean;
  upgradeSettlement: () => boolean;
  upgradeToFort: () => boolean;
  constructBuilding: (buildingId: string, plotId: string) => boolean;
  moveBuilding: (buildingId: string, targetPlotId: string) => boolean;
  upgradeBuilding: (buildingId: string) => boolean;
  isBuildingUnlocked: (buildingId: string) => boolean;
  chooseRecruit: (choiceId: string) => boolean;
  chooseFortRecruit: (choiceId: string) => boolean;
  chooseMarcherAuxiliary: (choiceId: string) => boolean;
  unlockTimberCamp: () => boolean;
  claimProduction: () => boolean;
  completeKingdomDefense: () => boolean;
  completeBrokenSignalTower: () => boolean;
  upgradeToTown: () => boolean;
  getEquipmentCraftCost: (equipment: EquipmentDefinition) => Partial<ResourceWallet>;
  craftEquipment: (equipmentId: string) => boolean;
  equipEquipment: (unitId: string, equipmentId: string) => boolean;
  upgradeEquippedItem: (unitId: string, targetEquipmentId: string) => boolean;
  promoteMira: (equipmentId: string) => boolean;
  advancedPromoteUnit: (unitId: string, promotionId: string) => boolean;
  getAdvancedPromotionsForUnit: (unitId: string) => AdvancedPromotionDefinition[];
  chooseCommanderPath: (pathId: string) => boolean;
  moveFormationUnit: (unitId: string, targetSlot: number) => boolean;
  moveWagonItem: (itemId: string, x: number, y: number) => boolean;
  rotateWagonItem: (itemId: string) => boolean;
  resetWagon: () => void;
  setFormationDoctrine: (doctrineId: string) => boolean;
  isSideModeUnlocked: (id: SideModeId) => boolean;
  consumeExpeditionTicket: () => boolean;
  finishExpedition: () => void;
  completeFormationTrial: () => boolean;
  claimRewardedAd: (placementId: RewardedAdPlacementId) => Promise<RewardedAdResult>;
  completeCampaign: (faction: FactionId) => void;
  recruitOptions: RecruitOption[];
};

type GameProviderProps = PropsWithChildren<{
  initialSnapshot: GameSnapshot;
  onSnapshotChange: (snapshot: GameSnapshot) => Promise<void> | void;
}>;

const GameContext = createContext<GameContextValue | null>(null);

function cloneResources(resources: ResourceWallet): ResourceWallet {
  return { ...resources };
}

function cloneUnits(units: UnitDefinition[]): UnitDefinition[] {
  return units.map(unit => ({ ...unit }));
}

function cloneWagon(items: WagonItemDefinition[]): WagonItemDefinition[] {
  return items.map(item => ({ ...item }));
}

function cloneNodes(nodes: ChapterNode[]): ChapterNode[] {
  return nodes.map(node => ({ ...node }));
}

function cloneLoadouts(
  loadouts: Record<string, UnitEquipmentLoadout>
): Record<string, UnitEquipmentLoadout> {
  return Object.fromEntries(
    Object.entries(loadouts).map(([unitId, loadout]) => [unitId, { ...loadout }])
  );
}

function itemDimensions(item: WagonItemDefinition) {
  return item.rotation === 90
    ? { width: item.height, height: item.width }
    : { width: item.width, height: item.height };
}

function overlaps(a: WagonItemDefinition, b: WagonItemDefinition) {
  const ad = itemDimensions(a);
  const bd = itemDimensions(b);

  return !(
    a.x + ad.width <= b.x ||
    b.x + bd.width <= a.x ||
    a.y + ad.height <= b.y ||
    b.y + bd.height <= a.y
  );
}

function canPlaceItem(
  item: WagonItemDefinition,
  otherItems: WagonItemDefinition[],
  stage: WagonStage
) {
  const dimensions = itemDimensions(item);

  if (
    item.x < 0 ||
    item.y < 0 ||
    item.x + dimensions.width > stage.width ||
    item.y + dimensions.height > stage.height
  ) {
    return false;
  }

  return otherItems.every(other => !overlaps(item, other));
}

function canAfford(resources: ResourceWallet, cost: Partial<ResourceWallet>) {
  return Object.entries(cost).every(([key, amount]) => {
    const resourceKey = key as keyof ResourceWallet;
    return resources[resourceKey] >= (amount ?? 0);
  });
}

function payCost(resources: ResourceWallet, cost: Partial<ResourceWallet>): ResourceWallet {
  const next = { ...resources };
  for (const [key, amount] of Object.entries(cost)) {
    const resourceKey = key as keyof ResourceWallet;
    next[resourceKey] -= amount ?? 0;
  }
  return next;
}

function addResources(
  resources: ResourceWallet,
  reward: Partial<ResourceWallet>
): ResourceWallet {
  return {
    gold: resources.gold + (reward.gold ?? 0),
    wood: resources.wood + (reward.wood ?? 0),
    stone: resources.stone + (reward.stone ?? 0),
    iron: resources.iron + (reward.iron ?? 0),
    provisions: resources.provisions + (reward.provisions ?? 0)
  };
}

function applyEquipmentDelta(
  unit: UnitDefinition,
  removeItem: EquipmentDefinition | null,
  addItem: EquipmentDefinition | null
): UnitDefinition {
  return {
    ...unit,
    attack: unit.attack - (removeItem?.attackBonus ?? 0) + (addItem?.attackBonus ?? 0),
    armor: unit.armor - (removeItem?.armorBonus ?? 0) + (addItem?.armorBonus ?? 0),
    speed: unit.speed - (removeItem?.speedBonus ?? 0) + (addItem?.speedBonus ?? 0)
  };
}

const stageRank: Record<string, number> = {
  camp: 0,
  settlement: 1,
  fort: 2,
  town: 3,
  stronghold: 4,
  capital: 5,
  grand: 6
};

const sideModeUnlockRank: Record<SideModeDefinition['unlockStage'], number> = {
  settlement: 1,
  fort: 2,
  stronghold: 4
};

export function GameProvider({
  children,
  initialSnapshot,
  onSnapshotChange
}: GameProviderProps) {
  const initialFaction =
    initialSnapshot.factionStates[initialSnapshot.activeFaction] ??
    initialSnapshot.factionStates.human;

  if (!initialFaction) {
    throw new Error('Save has no playable faction state.');
  }

  const [resources, setResources] = useState<ResourceWallet>(() => cloneResources(initialFaction.resources));
  const [units, setUnits] = useState<UnitDefinition[]>(() => cloneUnits(initialFaction.units));
  const [formation, setFormation] = useState<Array<string | null>>(() => [...initialFaction.formation]);
  const [wagonItems, setWagonItems] = useState<WagonItemDefinition[]>(() => cloneWagon(initialFaction.wagonItems));
  const [wagonStageId, setWagonStageId] = useState(initialFaction.wagonStageId);
  const [chapterNumber, setChapterNumber] = useState(initialFaction.chapterNumber);
  const [chapterNodes, setChapterNodes] = useState<ChapterNode[]>(() => cloneNodes(initialFaction.chapterNodes));
  const [activeFaction] = useState<FactionId>(initialSnapshot.activeFaction);
  const [sharedProgress, setSharedProgress] = useState<SharedProgress>(() => ({
    completedCampaigns: [...initialSnapshot.shared.completedCampaigns],
    achievements: [...initialSnapshot.shared.achievements],
    lore: [...initialSnapshot.shared.lore],
    cosmetics: [...initialSnapshot.shared.cosmetics]
  }));
  const [formationDoctrineId, setFormationDoctrineId] = useState(initialFaction.formationDoctrineId);
  const [holdTheRoadWon, setHoldTheRoadWon] = useState(initialFaction.holdTheRoadWon);
  const [settlementUpgraded, setSettlementUpgraded] = useState(initialFaction.settlementUpgraded);
  const [recruitChoiceAvailable, setRecruitChoiceAvailable] = useState(initialFaction.recruitChoiceAvailable);
  const [recruitChosen, setRecruitChosen] = useState(initialFaction.recruitChosen);
  const [markedRaidersInvestigated, setMarkedRaidersInvestigated] = useState(initialFaction.markedRaidersInvestigated);
  const [forgeUnlocked, setForgeUnlocked] = useState(initialFaction.forgeUnlocked);
  const [firstPromotionComplete, setFirstPromotionComplete] = useState(initialFaction.firstPromotionComplete);
  const [equipmentInventory, setEquipmentInventory] = useState<string[]>(() => [...initialFaction.equipmentInventory]);
  const [unitEquipment, setUnitEquipment] = useState<Record<string, UnitEquipmentLoadout>>(
    () => cloneLoadouts(initialFaction.unitEquipment)
  );
  const [mercenaryPatrolWon, setMercenaryPatrolWon] = useState(initialFaction.mercenaryPatrolWon);
  const [commanderChoiceUnlocked, setCommanderChoiceUnlocked] = useState(initialFaction.commanderChoiceUnlocked);
  const [commanderPathId, setCommanderPathId] = useState<string | null>(initialFaction.commanderPathId);
  const [refugeeCampSecured, setRefugeeCampSecured] = useState(initialFaction.refugeeCampSecured);
  const [buildingLevels, setBuildingLevels] = useState<Record<string, number>>(
    () => ({ ...initialFaction.buildingLevels })
  );
  const [buildingPlacements, setBuildingPlacements] = useState<Record<string, string | null>>(
    () => ({ ...initialFaction.buildingPlacements })
  );
  const [fourthRecruitChoiceAvailable, setFourthRecruitChoiceAvailable] = useState(
    initialFaction.fourthRecruitChoiceAvailable
  );
  const [fourthRecruitChosen, setFourthRecruitChosen] = useState(initialFaction.fourthRecruitChosen);
  const [unlockedResourceSites, setUnlockedResourceSites] = useState<string[]>(
    () => [...initialFaction.unlockedResourceSites]
  );
  const [productionStock, setProductionStock] = useState<ResourceWallet>(
    () => ({ ...initialFaction.productionStock })
  );
  const [kingdomDefenseCompleted, setKingdomDefenseCompleted] = useState(
    initialFaction.kingdomDefenseCompleted
  );
  const [kingdomDefenseRuns, setKingdomDefenseRuns] = useState(initialFaction.kingdomDefenseRuns);
  const [signalTowerUnlocked, setSignalTowerUnlocked] = useState(initialFaction.signalTowerUnlocked);
  const [ironProvostWon, setIronProvostWon] = useState(initialFaction.ironProvostWon);
  const [lastBattleResult, setLastBattleResult] = useState<BattleResult | null>(
    initialFaction.lastBattleResult ? { ...initialFaction.lastBattleResult } : null
  );
  const [expeditionTickets, setExpeditionTickets] = useState(initialFaction.expeditionTickets);
  const [expeditionRunsCompleted, setExpeditionRunsCompleted] = useState(initialFaction.expeditionRunsCompleted);
  const [formationTrialCompleted, setFormationTrialCompleted] = useState(initialFaction.formationTrialCompleted);
  const [rewardedAdClaims, setRewardedAdClaims] = useState<RewardedAdClaimState>({});
  const [rewardedAdMessage, setRewardedAdMessage] = useState<string | null>(null);

  const currentWagonStage = useMemo(
    () => wagonStages.find(stage => stage.id === wagonStageId) ?? wagonStages[0]!,
    [wagonStageId]
  );

  const buildings = useMemo(() => getBuildings(activeFaction), [activeFaction]);
  const settlementAnalysis = useMemo(
    () => analyzeSettlementAdjacency(buildingPlacements, buildingLevels),
    [buildingLevels, buildingPlacements]
  );
  const settlementAdjacencyBonuses = settlementAnalysis.bonuses;
  const settlementEffects = settlementAnalysis.effects;

  const resourceSites = useMemo(
    () => humanResourceSites.filter(site => site.faction === activeFaction),
    [activeFaction]
  );
  const formationDoctrines = useMemo(
    () => getFactionDoctrines(activeFaction),
    [activeFaction]
  );

  const formationAnalysis = useMemo(
    () => analyzeFormation(formation, units, activeFaction, formationDoctrineId),
    [activeFaction, formation, formationDoctrineId, units]
  );

  const commanderPaths = useMemo(
    () => getCommanderPaths(activeFaction),
    [activeFaction]
  );
  const activeCommanderPath = useMemo(
    () => getCommanderPath(commanderPathId),
    [commanderPathId]
  );
  const commanderBaseRespecCost =
    commanderPathId && (buildingLevels.war_room ?? 0) >= 2 ? 50 : commanderPathId ? 75 : 0;
  const commanderRespecCost = Math.max(
    0,
    commanderBaseRespecCost - settlementEffects.commanderRespecDiscount
  );

  const formationBonuses = formationAnalysis.bonuses;
  const activeSquadCap = currentWagonStage.formationSlots;
  const completedCampaigns = sharedProgress.completedCampaigns;

  const campaignAvailability = useMemo<CampaignAvailability[]>(() => {
    const humanComplete = completedCampaigns.includes('human');
    const allComplete =
      completedCampaigns.includes('human') &&
      completedCampaigns.includes('elf') &&
      completedCampaigns.includes('orc');

    return [
      { id: 'human', unlocked: true, completed: humanComplete, unlockText: humanComplete ? 'Completed' : 'Available' },
      {
        id: 'elf',
        unlocked: humanComplete,
        completed: completedCampaigns.includes('elf'),
        unlockText: humanComplete ? 'Unlocked after Human campaign' : 'Complete Human campaign'
      },
      {
        id: 'orc',
        unlocked: humanComplete,
        completed: completedCampaigns.includes('orc'),
        unlockText: humanComplete ? 'Unlocked after Human campaign' : 'Complete Human campaign'
      },
      {
        id: 'meta',
        unlocked: allComplete,
        completed: false,
        unlockText: allComplete ? 'Three Seals campaign unlocked' : 'Complete all three faction campaigns'
      }
    ];
  }, [completedCampaigns]);

  const canUpgradeSettlement =
    holdTheRoadWon &&
    !settlementUpgraded &&
    resources.wood >= 90 &&
    resources.stone >= 20;

  const tollCaptainWon = Boolean(
    chapterNodes.find(node => node.id === 'node_6')?.completed
  );
  const fortUpgradeAvailable = tollCaptainWon && currentWagonStage.id === 'settlement';
  const canUpgradeToFort =
    fortUpgradeAvailable &&
    (buildingLevels.barracks ?? 0) >= 2 &&
    (buildingLevels.forge ?? 0) >= 2 &&
    (buildingLevels.wagonwright ?? 0) >= 2 &&
    resources.gold >= 150 &&
    resources.wood >= 70 &&
    resources.stone >= 35 &&
    resources.iron >= 10;

  const townUpgradeAvailable =
    ironProvostWon && currentWagonStage.id === 'fort';

  const canUpgradeToTown =
    townUpgradeAvailable &&
    (buildingLevels.barracks ?? 0) >= 3 &&
    (buildingLevels.forge ?? 0) >= 3 &&
    (buildingLevels.wagonwright ?? 0) >= 3 &&
    (buildingLevels.stable ?? 0) >= 1 &&
    (buildingLevels.signal_tower ?? 0) >= 1 &&
    resources.gold >= 250 &&
    resources.wood >= 120 &&
    resources.stone >= 80 &&
    resources.iron >= 25;

  const currentFactionState = useMemo<FactionGameState>(
    () => ({
      faction: activeFaction,
      chapterNumber,
      resources,
      units,
      formation,
      wagonItems,
      wagonStageId,
      chapterNodes,
      formationDoctrineId,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      markedRaidersInvestigated,
      forgeUnlocked,
      firstPromotionComplete,
      equipmentInventory,
      unitEquipment,
      mercenaryPatrolWon,
      commanderChoiceUnlocked,
      commanderPathId,
      refugeeCampSecured,
      buildingLevels,
      buildingPlacements,
      fourthRecruitChoiceAvailable,
      fourthRecruitChosen,
      unlockedResourceSites,
      productionStock,
      kingdomDefenseCompleted,
      kingdomDefenseRuns,
      signalTowerUnlocked,
      ironProvostWon,
      lastBattleResult,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted
    }),
    [
      activeFaction,
      chapterNumber,
      resources,
      units,
      formation,
      wagonItems,
      wagonStageId,
      chapterNodes,
      formationDoctrineId,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      markedRaidersInvestigated,
      forgeUnlocked,
      firstPromotionComplete,
      equipmentInventory,
      unitEquipment,
      mercenaryPatrolWon,
      commanderChoiceUnlocked,
      commanderPathId,
      refugeeCampSecured,
      buildingLevels,
      buildingPlacements,
      fourthRecruitChoiceAvailable,
      fourthRecruitChosen,
      unlockedResourceSites,
      productionStock,
      kingdomDefenseCompleted,
      kingdomDefenseRuns,
      signalTowerUnlocked,
      ironProvostWon,
      lastBattleResult,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted
    ]
  );

  const snapshot = useMemo<GameSnapshot>(
    () => ({
      schemaVersion: 7,
      activeFaction,
      shared: sharedProgress,
      factionStates: {
        ...initialSnapshot.factionStates,
        [activeFaction]: currentFactionState
      }
    }),
    [activeFaction, currentFactionState, initialSnapshot.factionStates, sharedProgress]
  );

  const saveCallbackRef = useRef(onSnapshotChange);

  useEffect(() => {
    saveCallbackRef.current = onSnapshotChange;
  }, [onSnapshotChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void saveCallbackRef.current(snapshot);
    }, 250);

    return () => {
      clearTimeout(timer);
      void saveCallbackRef.current(snapshot);
    };
  }, [snapshot]);

  const accrueRegionalProduction = () => {
    setProductionStock(previous => {
      const next = { ...previous };
      for (const siteId of unlockedResourceSites) {
        const site = [...humanResourceSites, ...marcherResourceSites].find(
          candidate => candidate.id === siteId
        );
        if (!site) continue;
        next.gold += site.productionPerActivity.gold ?? 0;
        next.wood += site.productionPerActivity.wood ?? 0;
        next.stone += site.productionPerActivity.stone ?? 0;
        next.iron += site.productionPerActivity.iron ?? 0;
        next.provisions += site.productionPerActivity.provisions ?? 0;
      }
      return next;
    });
  };

  const finishEncounter = (encounterId: EncounterId) => {
    const reward = encounterRewards[encounterId];

    if (encounterId === 'hold_the_road') {
      if (holdTheRoadWon) return;
      setHoldTheRoadWon(true);
      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'node_2') return { ...node, completed: true, current: false };
          if (node.id === 'node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'hold_the_road_result',
        title: 'Road Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'mercenary_patrol') {
      if (mercenaryPatrolWon || !firstPromotionComplete) return;
      setMercenaryPatrolWon(true);
      setCommanderChoiceUnlocked(true);
      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'node_4') return { ...node, completed: true, current: false };
          return { ...node, current: false };
        })
      );
      setSharedProgress(previous => ({
        ...previous,
        lore: previous.lore.includes('crown_coin_contracts')
          ? previous.lore
          : [...previous.lore, 'crown_coin_contracts']
      }));
      setLastBattleResult({
        id: 'mercenary_patrol_result',
        title: 'Mercenaries Broken',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'toll_captain') {
      if (chapterNodes.find(node => node.id === 'node_6')?.completed || !refugeeCampSecured) {
        return;
      }

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'toll_captain_result',
        title: 'The Western Road Is Ours',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'iron_road_skirmish') {
      if (chapterNumber !== 2 || !fourthRecruitChosen) return;

      const alreadyComplete = chapterNodes.find(node => node.id === 'ch2_node_2')?.completed;
      if (alreadyComplete) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setUnlockedResourceSites(previous =>
        previous.includes('iron_hills_mine')
          ? previous
          : [...previous, 'iron_hills_mine']
      );
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch2_node_2') return { ...node, completed: true, current: false };
          if (node.id === 'ch2_node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'iron_road_skirmish_result',
        title: 'Mine Road Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'iron_provost') {
      if (
        chapterNumber !== 2 ||
        ironProvostWon ||
        !signalTowerUnlocked ||
        !chapterNodes.find(node => node.id === 'ch2_node_6')?.current
      ) {
        return;
      }

      setIronProvostWon(true);
      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'ch2_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'iron_provost_result',
        title: 'The Iron Road Is Ours',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'border_fort') {
      if (
        chapterNumber !== 3 ||
        !chapterNodes.find(node => node.id === 'ch3_node_2')?.current
      ) {
        return;
      }

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch3_node_2') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'ch3_node_3') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setSharedProgress(previous => ({
        ...previous,
        lore: previous.lore.includes('three_marcher_warnings')
          ? previous.lore
          : [...previous.lore, 'three_marcher_warnings']
      }));
      setLastBattleResult({
        id: 'border_fort_result',
        title: 'Border Fort Opened',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
    }
  };

  const completeMarkedRaiders = () => {
    if (!holdTheRoadWon || markedRaidersInvestigated) return false;

    setMarkedRaidersInvestigated(true);
    setForgeUnlocked(true);
    setResources(previous => ({
      ...previous,
      wood: previous.wood + 5,
      iron: previous.iron + 2
    }));
    setSharedProgress(previous => ({
      ...previous,
      lore: previous.lore.includes('false_flag_forging')
        ? previous.lore
        : [...previous.lore, 'false_flag_forging']
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'node_3') return { ...node, completed: true, current: false };
        if (node.id === 'node_4') return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const completeRefugeeCamp = () => {
    if (!mercenaryPatrolWon || !commanderPathId || refugeeCampSecured) return false;

    setRefugeeCampSecured(true);
    setResources(previous => ({
      ...previous,
      wood: previous.wood + 45,
      iron: previous.iron + 8,
      provisions: previous.provisions + 20
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'node_5') return { ...node, completed: true, current: false };
        if (node.id === 'node_6') return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const upgradeSettlement = () => {
    if (!canUpgradeSettlement) return false;

    setResources(previous => ({
      ...previous,
      wood: previous.wood - 90,
      stone: previous.stone - 20
    }));
    setSettlementUpgraded(true);
    setBuildingLevels(previous => ({ ...previous, hall: 2 }));
    setRecruitChoiceAvailable(true);
    setWagonStageId('settlement');
    return true;
  };

  const upgradeToFort = () => {
    if (!canUpgradeToFort) return false;

    setResources(previous => ({
      ...previous,
      gold: previous.gold - 150,
      wood: previous.wood - 70,
      stone: previous.stone - 35,
      iron: previous.iron - 10
    }));
    setWagonStageId('fort');
    setBuildingLevels(previous => ({
      ...previous,
      hall: 3
    }));
    setChapterNumber(2);
    setChapterNodes(cloneNodes(chapterTwoNodes));
    setFourthRecruitChoiceAvailable(true);
    setUnlockedResourceSites(previous =>
      previous.includes('greenkeep_farms')
        ? previous
        : [...previous, 'greenkeep_farms']
    );
    return true;
  };

  const isBuildingUnlocked = (buildingId: string) => {
    if (['hall', 'barracks', 'wagonwright'].includes(buildingId)) return true;
    if (buildingId === 'forge') return forgeUnlocked;
    if (buildingId === 'war_room') return commanderChoiceUnlocked;
    if (buildingId === 'quartermaster') return refugeeCampSecured;
    if (buildingId === 'stable') {
      return ['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
    }
    if (buildingId === 'signal_tower') return signalTowerUnlocked;
    return false;
  };

  const constructBuilding = (buildingId: string, plotId: string) => {
    if (!isBuildingUnlocked(buildingId)) return false;
    if ((buildingLevels[buildingId] ?? 0) > 0) return false;

    const building = buildings.find(candidate => candidate.id === buildingId);
    const plot = humanSettlementPlots.find(candidate => candidate.id === plotId);

    if (!building || !plot) return false;
    if (!isSettlementPlotUnlocked(plot, currentWagonStage.id)) return false;
    if (buildingPlacements[plotId]) return false;
    if (Object.values(buildingPlacements).includes(buildingId)) return false;
    if (!canPayBuildingCost(resources, building.constructionCost)) return false;

    setResources(previous => payCost(previous, building.constructionCost));
    setBuildingLevels(previous => ({
      ...previous,
      [buildingId]: 1
    }));
    setBuildingPlacements(previous => ({
      ...previous,
      [plotId]: buildingId
    }));
    return true;
  };

  const moveBuilding = (buildingId: string, targetPlotId: string) => {
    if ((buildingLevels[buildingId] ?? 0) <= 0) return false;

    const targetPlot = humanSettlementPlots.find(plot => plot.id === targetPlotId);
    if (!targetPlot || !isSettlementPlotUnlocked(targetPlot, currentWagonStage.id)) {
      return false;
    }
    if (buildingPlacements[targetPlotId]) return false;

    const sourcePlotId = Object.entries(buildingPlacements).find(
      ([, value]) => value === buildingId
    )?.[0];

    if (!sourcePlotId) return false;

    setBuildingPlacements(previous => ({
      ...previous,
      [sourcePlotId]: null,
      [targetPlotId]: buildingId
    }));
    return true;
  };

  const upgradeBuilding = (buildingId: string) => {
    if (!isBuildingUnlocked(buildingId)) return false;

    const currentLevel = buildingLevels[buildingId] ?? 0;
    if (currentLevel <= 0) return false;

    const targetLevel = currentLevel + 1;
    const maxLevelByStage: Record<string, number> = {
      camp: 1,
      settlement: 2,
      fort: 3,
      town: 4,
      stronghold: 5,
      capital: 5,
      grand: 5
    };

    if (targetLevel > (maxLevelByStage[currentWagonStage.id] ?? 1)) {
      return false;
    }
    const definition = getBuildingLevelDefinition(buildingId, targetLevel);

    if (!definition || !canPayBuildingCost(resources, definition.cost)) return false;

    if (buildingId === 'barracks' && !settlementUpgraded) return false;
    if (buildingId === 'forge' && !markedRaidersInvestigated) return false;
    if (buildingId === 'quartermaster' && !refugeeCampSecured) return false;
    if (buildingId === 'war_room' && !commanderPathId) return false;

    setResources(previous => payCost(previous, definition.cost));
    setBuildingLevels(previous => ({
      ...previous,
      [buildingId]: targetLevel
    }));

    if (buildingId === 'quartermaster' && targetLevel === 2) {
      setExpeditionTickets(previous => previous + 1);
    }

    return true;
  };

  const chooseRecruit = (choiceId: string) => {
    if (!recruitChoiceAvailable || recruitChosen) return false;

    const choice = humanRecruitOptions.find(option => option.id === choiceId);
    if (!choice) return false;

    setUnits(previous => [...previous, { ...choice.unit }]);
    setFormation(previous => {
      const next = [...previous];
      const preferredSlots =
        choice.unit.role === 'ranged' || choice.unit.role === 'support'
          ? [6, 7, 8, 3, 4, 5, 0, 1, 2]
          : [3, 4, 5, 0, 1, 2, 6, 7, 8];
      const empty = preferredSlots.find(slot => next[slot] === null);

      if (empty !== undefined && next.filter(Boolean).length < activeSquadCap) {
        next[empty] = choice.unit.id;
      }
      return next;
    });
    setRecruitChosen(true);
    setRecruitChoiceAvailable(false);
    return true;
  };

  const chooseFortRecruit = (choiceId: string) => {
    if (!fourthRecruitChoiceAvailable || fourthRecruitChosen) return false;

    const choice = fortMusterOptions.find(option => option.id === choiceId);
    if (!choice) return false;

    setUnits(previous => [...previous, { ...choice.unit }]);
    setFormation(previous => {
      const next = [...previous];
      const preferredSlots =
        choice.unit.role === 'ranged'
          ? [6, 8, 7, 3, 5, 4, 0, 2, 1]
          : [3, 5, 4, 0, 2, 1, 6, 8, 7];
      const empty = preferredSlots.find(slot => next[slot] === null);
      if (empty !== undefined && next.filter(Boolean).length < activeSquadCap) {
        next[empty] = choice.unit.id;
      }
      return next;
    });
    setFourthRecruitChosen(true);
    setFourthRecruitChoiceAvailable(false);
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch2_node_1') return { ...node, completed: true, current: false };
        if (node.id === 'ch2_node_2') return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const chooseMarcherAuxiliary = (choiceId: string) => {
    if (
      chapterNumber !== 3 ||
      !chapterNodes.find(node => node.id === 'ch3_node_1')?.current ||
      units.some(unit => unit.id.startsWith('hum_marcher_'))
    ) {
      return false;
    }

    const choice = marcherAuxiliaryOptions.find(
      option => option.id === choiceId
    );
    if (!choice) return false;

    setUnits(previous => [...previous, { ...choice.unit }]);
    setFormation(previous => {
      const next = [...previous];
      const preferredSlots =
        choice.unit.role === 'support' || choice.unit.role === 'skirmish'
          ? [6, 8, 7, 3, 5, 4, 0, 2, 1]
          : [3, 5, 4, 0, 2, 1, 6, 8, 7];
      const empty = preferredSlots.find(slot => next[slot] === null);

      if (
        empty !== undefined &&
        next.filter(Boolean).length < activeSquadCap
      ) {
        next[empty] = choice.unit.id;
      }
      return next;
    });

    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch3_node_1') {
          return { ...node, completed: true, current: false };
        }
        if (node.id === 'ch3_node_2') {
          return { ...node, current: true };
        }
        return { ...node, current: false };
      })
    );

    return true;
  };

  const unlockTimberCamp = () => {
    if (
      chapterNumber !== 2 ||
      unlockedResourceSites.includes('greenwood_camp') ||
      !chapterNodes.find(node => node.id === 'ch2_node_3')?.current
    ) {
      return false;
    }

    setUnlockedResourceSites(previous => [...previous, 'greenwood_camp']);
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch2_node_3') return { ...node, completed: true, current: false };
        if (node.id === 'ch2_node_4') return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const claimProduction = () => {
    const total =
      productionStock.gold +
      productionStock.wood +
      productionStock.stone +
      productionStock.iron +
      productionStock.provisions;

    if (total <= 0) return false;

    setResources(previous => addResources(previous, productionStock));
    setProductionStock({ gold: 0, wood: 0, stone: 0, iron: 0, provisions: 0 });
    return true;
  };

  const completeKingdomDefense = () => {
    if (chapterNumber < 2 || ['camp', 'settlement'].includes(currentWagonStage.id)) {
      return false;
    }

    const storyDefenseActive = Boolean(
      chapterNodes.find(node => node.id === 'ch2_node_4')?.current
    );
    const firstClear = !kingdomDefenseCompleted;

    setKingdomDefenseCompleted(true);
    setKingdomDefenseRuns(previous => previous + 1);
    setResources(previous => ({
      ...previous,
      gold: previous.gold + (firstClear ? 60 : 35),
      stone: previous.stone + (firstClear ? 8 : 4),
      provisions: previous.provisions + 4
    }));
    accrueRegionalProduction();

    if (storyDefenseActive) {
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch2_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'ch2_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
    }

    return true;
  };

  const completeBrokenSignalTower = () => {
    if (
      chapterNumber !== 2 ||
      signalTowerUnlocked ||
      !kingdomDefenseCompleted ||
      !chapterNodes.find(node => node.id === 'ch2_node_5')?.current
    ) {
      return false;
    }

    setSignalTowerUnlocked(true);
    setUnlockedResourceSites(previous =>
      previous.includes('old_quarry')
        ? previous
        : [...previous, 'old_quarry']
    );
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch2_node_5') {
          return { ...node, completed: true, current: false };
        }
        if (node.id === 'ch2_node_6') {
          return { ...node, current: true };
        }
        return { ...node, current: false };
      })
    );
    setSharedProgress(previous => ({
      ...previous,
      lore: previous.lore.includes('signal_network_restored')
        ? previous.lore
        : [...previous.lore, 'signal_network_restored']
    }));
    return true;
  };

  const upgradeToTown = () => {
    if (!canUpgradeToTown) return false;

    setResources(previous => ({
      ...previous,
      gold: previous.gold - 250,
      wood: previous.wood - 120,
      stone: previous.stone - 80,
      iron: previous.iron - 25
    }));
    setWagonStageId('town');
    setBuildingLevels(previous => ({
      ...previous,
      hall: 4
    }));
    setChapterNumber(3);
    setChapterNodes(cloneNodes(chapterThreeNodes));
    return true;
  };

  const getEquipmentCraftCost = (equipment: EquipmentDefinition) => {
    let multiplier = settlementEffects.equipmentCostMultiplier;
    if (equipment.slot === 'mount') {
      multiplier *= settlementEffects.mountCostMultiplier;
    }
    return applyCostMultiplier(equipment.craftCost, multiplier);
  };

  const craftEquipment = (equipmentId: string) => {
    if (!forgeUnlocked) return false;

    const equipment = getEquipment(equipmentId);
    const forgeLevel = buildingLevels.forge ?? 0;
    const stableLevel = buildingLevels.stable ?? 0;

    if (
      !equipment ||
      equipment.faction !== activeFaction ||
      equipment.upgradeFromId ||
      equipment.requiredForgeLevel > forgeLevel ||
      (equipment.requiredStableLevel ?? 0) > stableLevel
    ) {
      return false;
    }

    const effectiveCost = getEquipmentCraftCost(equipment);
    if (!canAfford(resources, effectiveCost)) return false;

    setResources(previous => payCost(previous, effectiveCost));
    setEquipmentInventory(previous => [...previous, equipment.id]);
    return true;
  };

  const equipEquipment = (unitId: string, equipmentId: string) => {
    const equipment = getEquipment(equipmentId);
    const inventoryIndex = equipmentInventory.indexOf(equipmentId);
    const unit = units.find(candidate => candidate.id === unitId);

    if (!equipment || inventoryIndex < 0 || !unit) return false;

    const currentId = unitEquipment[unitId]?.[equipment.slot] ?? null;
    const currentItem = currentId ? getEquipment(currentId) : null;

    setEquipmentInventory(previous => {
      const next = [...previous];
      next.splice(inventoryIndex, 1);
      if (currentId) next.push(currentId);
      return next;
    });

    setUnitEquipment(previous => ({
      ...previous,
      [unitId]: {
        ...(previous[unitId] ?? {}),
        [equipment.slot]: equipmentId
      }
    }));

    setUnits(previous =>
      previous.map(candidate =>
        candidate.id === unitId
          ? applyEquipmentDelta(candidate, currentItem, equipment)
          : candidate
      )
    );

    return true;
  };

  const upgradeEquippedItem = (unitId: string, targetEquipmentId: string) => {
    const target = getEquipment(targetEquipmentId);
    const forgeLevel = buildingLevels.forge ?? 0;
    const stableLevel = buildingLevels.stable ?? 0;
    const unit = units.find(candidate => candidate.id === unitId);

    if (
      !target ||
      !target.upgradeFromId ||
      target.requiredForgeLevel > forgeLevel ||
      (target.requiredStableLevel ?? 0) > stableLevel ||
      !unit
    ) {
      return false;
    }

    const effectiveCost = getEquipmentCraftCost(target);
    if (!canAfford(resources, effectiveCost)) return false;

    const currentId = unitEquipment[unitId]?.[target.slot] ?? null;
    if (currentId !== target.upgradeFromId) return false;

    const currentItem = getEquipment(currentId);

    setResources(previous => payCost(previous, effectiveCost));
    setUnitEquipment(previous => ({
      ...previous,
      [unitId]: {
        ...(previous[unitId] ?? {}),
        [target.slot]: target.id
      }
    }));
    setUnits(previous =>
      previous.map(candidate =>
        candidate.id === unitId
          ? applyEquipmentDelta(candidate, currentItem, target)
          : candidate
      )
    );

    return true;
  };

  const promoteMira = (equipmentId: string) => {
    if (firstPromotionComplete) return false;

    const promotion = getRecruitPromotionByEquipment(equipmentId);
    const equipment = getEquipment(equipmentId);
    const inventoryIndex = equipmentInventory.indexOf(equipmentId);
    const mira = units.find(unit => unit.id === 'hum_recruit');

    if (!promotion || !equipment || inventoryIndex < 0 || !mira || mira.className !== 'Recruit') {
      return false;
    }

    setEquipmentInventory(previous => {
      const next = [...previous];
      next.splice(inventoryIndex, 1);
      return next;
    });
    setUnitEquipment(previous => ({
      ...previous,
      hum_recruit: {
        ...(previous.hum_recruit ?? {}),
        weapon: equipmentId
      }
    }));
    setUnits(previous =>
      previous.map(unit =>
        unit.id === 'hum_recruit'
          ? {
              ...unit,
              className: promotion.toClass,
              role: promotion.role,
              tier: 2,
              attack: unit.attack + promotion.attackBonus + equipment.attackBonus,
              armor: unit.armor + promotion.armorBonus + equipment.armorBonus,
              speed: unit.speed + promotion.speedBonus + equipment.speedBonus,
              promotionReady: false
            }
          : unit
      )
    );
    setFirstPromotionComplete(true);
    return true;
  };

  const getAdvancedPromotionsForUnit = (unitId: string) => {
    const unit = units.find(candidate => candidate.id === unitId);
    return unit ? getAdvancedPromotionsForClass(unit.className) : [];
  };

  const advancedPromoteUnit = (unitId: string, promotionId: string) => {
    const unit = units.find(candidate => candidate.id === unitId);
    const promotion = advancedPromotions.find(candidate => candidate.id === promotionId);

    if (!unit || !promotion || promotion.fromClass !== unit.className) return false;

    const equippedIds = Object.values(unitEquipment[unitId] ?? {}).filter(
      (value): value is string => Boolean(value)
    );

    const meetsGear = promotion.requiredEquippedIds.every(id => equippedIds.includes(id));
    const meetsBuildings =
      (buildingLevels.barracks ?? 0) >= promotion.requiredBarracksLevel &&
      (buildingLevels.forge ?? 0) >= promotion.requiredForgeLevel &&
      (buildingLevels.stable ?? 0) >= (promotion.requiredStableLevel ?? 0);

    if (!meetsGear || !meetsBuildings) return false;

    setUnits(previous =>
      previous.map(candidate =>
        candidate.id === unitId
          ? {
              ...candidate,
              className: promotion.toClass,
              role: promotion.role,
              tier: candidate.tier + 1,
              attack: candidate.attack + promotion.attackBonus,
              armor: candidate.armor + promotion.armorBonus,
              speed: candidate.speed + promotion.speedBonus
            }
          : candidate
      )
    );

    return true;
  };

  const chooseCommanderPath = (pathId: string) => {
    if (!commanderChoiceUnlocked) return false;

    const path = commanderPaths.find(candidate => candidate.id === pathId);
    if (!path) return false;

    const cost = commanderPathId ? commanderRespecCost : 0;
    if (resources.gold < cost) return false;

    if (cost > 0) {
      setResources(previous => ({
        ...previous,
        gold: previous.gold - cost
      }));
    }

    setCommanderPathId(pathId);
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'node_5') return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const moveFormationUnit = (unitId: string, targetSlot: number) => {
    if (!formationCells.includes(targetSlot)) return false;

    const sourceSlot = formation.indexOf(unitId);
    if (sourceSlot < 0) return false;

    setFormation(previous => {
      const next = [...previous];
      const targetUnit = next[targetSlot];
      next[targetSlot] = unitId;
      next[sourceSlot] = targetUnit ?? null;
      return next;
    });
    return true;
  };

  const moveWagonItem = (itemId: string, x: number, y: number) => {
    const item = wagonItems.find(candidate => candidate.id === itemId);
    if (!item) return false;

    const moved: WagonItemDefinition = { ...item, x, y };
    const others = wagonItems.filter(candidate => candidate.id !== itemId);
    if (!canPlaceItem(moved, others, currentWagonStage)) return false;

    setWagonItems(previous =>
      previous.map(candidate => (candidate.id === itemId ? moved : candidate))
    );
    return true;
  };

  const rotateWagonItem = (itemId: string) => {
    const item = wagonItems.find(candidate => candidate.id === itemId);
    if (!item || item.width === item.height) return false;

    const rotated: WagonItemDefinition = {
      ...item,
      rotation: item.rotation === 0 ? 90 : 0
    };
    const others = wagonItems.filter(candidate => candidate.id !== itemId);
    if (!canPlaceItem(rotated, others, currentWagonStage)) return false;

    setWagonItems(previous =>
      previous.map(candidate => (candidate.id === itemId ? rotated : candidate))
    );
    return true;
  };

  const resetWagon = () => {
    setWagonItems(cloneWagon(starterWagonItems));
  };

  const setFormationDoctrine = (doctrineId: string) => {
    if (!formationDoctrines.some(doctrine => doctrine.id === doctrineId)) return false;
    setFormationDoctrineId(doctrineId);
    return true;
  };

  const isSideModeUnlocked = (id: SideModeId) => {
    const mode = sideModes.find(candidate => candidate.id === id);
    if (!mode) return false;
    return (stageRank[currentWagonStage.id] ?? 0) >= sideModeUnlockRank[mode.unlockStage];
  };

  const consumeExpeditionTicket = () => {
    if (!isSideModeUnlocked('expeditions') || expeditionTickets <= 0) return false;
    setExpeditionTickets(previous => previous - 1);
    return true;
  };

  const finishExpedition = () => {
    const extraWood = (buildingLevels.wagonwright ?? 0) >= 2 ? 1 : 0;
    setExpeditionRunsCompleted(previous => previous + 1);
    accrueRegionalProduction();
    setResources(previous => ({
      ...previous,
      gold: previous.gold + 35,
      wood:
        previous.wood +
        8 +
        extraWood +
        settlementEffects.expeditionWoodBonus,
      provisions:
        previous.provisions +
        4 +
        settlementEffects.expeditionProvisionBonus
    }));
  };

  const completeFormationTrial = () => {
    if (!isSideModeUnlocked('formation_trials') || formationTrialCompleted) return false;

    const harlan = formation.indexOf('hum_militia');
    const mira = formation.indexOf('hum_recruit');
    const harlanFront = harlan >= 0 && harlan <= 2;
    const miraBehind = mira >= 3;
    const sameColumn = harlan >= 0 && mira >= 0 && harlan % 3 === mira % 3;

    if (!harlanFront || !miraBehind || !sameColumn) return false;

    setFormationTrialCompleted(true);
    setResources(previous => ({
      ...previous,
      gold: previous.gold + 25,
      iron: previous.iron + 4
    }));
    return true;
  };

  const claimRewardedAd = async (
    placementId: RewardedAdPlacementId
  ): Promise<RewardedAdResult> => {
    const placement = getRewardedAdPlacement(placementId);
    if (!placement) return { status: 'unavailable', provider: 'none' };

    const used = rewardedAdClaims[placementId] ?? 0;
    if (used >= placement.capPerSession) {
      setRewardedAdMessage('Reward limit reached for this session.');
      return { status: 'unavailable', provider: 'none' };
    }

    const result = await showRewardedAd(placementId);
    if (result.status !== 'rewarded') {
      setRewardedAdMessage('Rewarded ads are not configured in this build yet.');
      return result;
    }

    if (placementId === 'daily_supply') {
      const quartermasterBonus = (buildingLevels.quartermaster ?? 0) >= 2 ? 5 : 0;
      setResources(previous => ({
        ...previous,
        wood: previous.wood + 15,
        provisions:
          previous.provisions +
          15 +
          quartermasterBonus +
          settlementEffects.dailyProvisionBonus
      }));
    } else if (placementId === 'expedition_ticket') {
      setExpeditionTickets(previous => previous + 1);
    } else if (placementId === 'salvage_boost') {
      setResources(previous => ({
        ...previous,
        wood: previous.wood + 3,
        iron: previous.iron + 1
      }));
    }

    setRewardedAdClaims(previous => ({
      ...previous,
      [placementId]: (previous[placementId] ?? 0) + 1
    }));
    setRewardedAdMessage(placement.rewardSummary);
    return result;
  };

  const completeCampaign = (faction: FactionId) => {
    setSharedProgress(previous => ({
      ...previous,
      completedCampaigns: previous.completedCampaigns.includes(faction)
        ? previous.completedCampaigns
        : [...previous.completedCampaigns, faction]
    }));
  };

  const value = useMemo<GameContextValue>(
    () => ({
      resources,
      units,
      formation,
      wagonItems,
      currentWagonStage,
      chapterNumber,
      chapterNodes,
      activeFaction,
      completedCampaigns,
      campaignAvailability,
      formationDoctrineId,
      formationDoctrines,
      formationBonuses,
      formationAnalysis,
      activeSquadCap,
      formationCells,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      markedRaidersInvestigated,
      forgeUnlocked,
      firstPromotionComplete,
      equipmentInventory,
      unitEquipment,
      equipmentDefinitions,
      recruitPromotions,
      advancedPromotions,
      mercenaryPatrolWon,
      commanderChoiceUnlocked,
      commanderPathId,
      commanderPaths,
      activeCommanderPath,
      commanderRespecCost,
      refugeeCampSecured,
      buildingLevels,
      buildingPlacements,
      buildings,
      settlementAdjacencyBonuses,
      settlementEffects,
      fourthRecruitChoiceAvailable,
      fourthRecruitChosen,
      fortMusterOptions,
      marcherAuxiliaryOptions,
      unlockedResourceSites,
      resourceSites,
      productionStock,
      kingdomDefenseCompleted,
      kingdomDefenseRuns,
      signalTowerUnlocked,
      ironProvostWon,
      fortUpgradeAvailable,
      townUpgradeAvailable,
      canUpgradeToTown,
      canUpgradeToFort,
      lastBattleResult,
      canUpgradeSettlement,
      sideModeDefinitions: sideModes,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted,
      rewardedAdClaims,
      rewardedAdMessage,
      finishEncounter,
      completeMarkedRaiders,
      completeRefugeeCamp,
      upgradeSettlement,
      upgradeToFort,
      constructBuilding,
      moveBuilding,
      upgradeBuilding,
      isBuildingUnlocked,
      chooseRecruit,
      chooseFortRecruit,
      chooseMarcherAuxiliary,
      unlockTimberCamp,
      claimProduction,
      completeKingdomDefense,
      completeBrokenSignalTower,
      upgradeToTown,
      getEquipmentCraftCost,
      craftEquipment,
      equipEquipment,
      upgradeEquippedItem,
      promoteMira,
      advancedPromoteUnit,
      getAdvancedPromotionsForUnit,
      chooseCommanderPath,
      moveFormationUnit,
      moveWagonItem,
      rotateWagonItem,
      resetWagon,
      setFormationDoctrine,
      isSideModeUnlocked,
      consumeExpeditionTicket,
      finishExpedition,
      completeFormationTrial,
      claimRewardedAd,
      completeCampaign,
      recruitOptions: humanRecruitOptions
    }),
    [
      resources,
      units,
      formation,
      wagonItems,
      currentWagonStage,
      chapterNumber,
      chapterNodes,
      activeFaction,
      completedCampaigns,
      campaignAvailability,
      formationDoctrineId,
      formationDoctrines,
      formationBonuses,
      formationAnalysis,
      activeSquadCap,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      markedRaidersInvestigated,
      forgeUnlocked,
      firstPromotionComplete,
      equipmentInventory,
      unitEquipment,
      mercenaryPatrolWon,
      commanderChoiceUnlocked,
      commanderPathId,
      commanderPaths,
      activeCommanderPath,
      commanderRespecCost,
      refugeeCampSecured,
      buildingLevels,
      buildingPlacements,
      buildings,
      settlementAdjacencyBonuses,
      settlementEffects,
      fourthRecruitChoiceAvailable,
      fourthRecruitChosen,
      unlockedResourceSites,
      resourceSites,
      productionStock,
      kingdomDefenseCompleted,
      kingdomDefenseRuns,
      signalTowerUnlocked,
      ironProvostWon,
      fortUpgradeAvailable,
      townUpgradeAvailable,
      canUpgradeToTown,
      canUpgradeToFort,
      lastBattleResult,
      canUpgradeSettlement,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted,
      rewardedAdClaims,
      rewardedAdMessage
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used inside GameProvider');
  }
  return context;
}
