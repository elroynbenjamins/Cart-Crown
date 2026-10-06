import { getCampaignActiveSquadCap } from './campaignMissionRoadmap';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AppState } from 'react-native';
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
  elfChapterThreeNodes,
  elfChapterTwoNodes,
  elfThirdRecruitOptions,
  factionChapterTwoResourceSites,
  orcChapterThreeNodes,
  orcChapterTwoNodes,
  orcThirdRecruitOptions
} from './factionChapter2';
import {
  elfChapterFourNodes,
  elfFourthRecruitOptions,
  factionChapterThreeResourceSites,
  orcChapterFourNodes,
  orcFourthRecruitOptions
} from './factionChapter3';
import {
  elfChapterFiveNodes,
  elfChapterFiveReinforcement,
  elfFifthRecruitOptions,
  factionChapterFourResourceSites,
  orcChapterFiveNodes,
  orcChapterFiveReinforcement,
  orcFifthRecruitOptions
} from './factionChapter4';
import {
  elfChapterSixNodes,
  factionChapterFiveResourceSites,
  getFactionMandate,
  getFactionMandates,
  orcChapterSixNodes
} from './factionChapter5';
import type {
  FactionMandateDefinition,
  FactionMandateId
} from './factionChapter5';
import {
  chapterThreeNodes,
  marcherAuxiliaryOptions,
  marcherResourceSites,
  marcherWarningChoices
} from './chapter3';
import type {
  MarcherWarningChoice,
  MarcherWarningChoiceId
} from './chapter3';
import {
  chapterFourNodes,
  crownroadResourceSites,
  lastLoyalistChoices,
  strongholdMusterOptions
} from './chapter4';
import type {
  LastLoyalistsChoice,
  LastLoyalistsChoiceId
} from './chapter4';
import {
  capitalResourceSites,
  chapterFiveNodes
} from './chapter5';
import {
  chapterSixNodes,
  crownspireResourceSites
} from './chapter6';
import {
  getRoyalDecree,
  royalDecrees
} from './capital';
import type {
  RoyalDecreeDefinition,
  RoyalDecreeId
} from './capital';
import {
  advancedPromotions,
  canUnitEquipEquipment,
  equipmentDefinitions,
  equipmentSatisfiesRequirement,
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
import {
  analyzeFormation,
  formationCells,
  formationShapes,
  getFactionDoctrines,
  getFormationShape,
  getPreferredFormationSlots,
  reflowFormationToShape
} from './formation';
import {
  applyArmyLoadoutEquipment
} from './armyLoadouts';
import {
  canPayBuildingCost,
  getBuildingLevelDefinition,
  getBuildings,
  getFactionBuildingIds
} from './kingdom';
import {
  analyzeSettlementAdjacency,
  applyCostMultiplier,
  getInitialSettlementPlacements,
  getSettlementPlots,
  isSettlementPlotUnlocked
} from './settlement';
import { sideModes } from './sideModes';
import {
  evaluateWarTableBonus,
  getWarTableContractByEncounter,
  getWarTablePostedContracts,
  isWarTableBoardCleared
} from './warTable';
import type { WarTableBattleSummary } from './warTable';
import {
  MAX_EXPEDITION_TICKETS,
  getExpeditionRewardMultiplier,
  getExpeditionTicketsAfterChapterTransition,
  getKingdomDefenseRewardMultiplier,
  getSiegeRewardMultiplier,
  getWarTableBoardRewardMultiplier,
  scaleResourceReward
} from './sideModeBalance';
import {
  createExpeditionRun,
  getExpeditionBaseReward,
  getExpeditionCompletionReward,
  getExpeditionPreparation,
  resolveExpeditionChoice
} from './expeditions';
import type { ExpeditionRunState } from './expeditions';
import {
  createSiegeRun,
  getSiegePreparation,
  getSiegeReward,
  resolveSiegeChoice
} from './sieges';
import type { SiegeRunState } from './sieges';
import {
  createRelicHuntRun,
  getRelicAffinitySnapshot,
  relicRewards,
  resolveRelicGuardian
} from './relicHunts';
import type { RelicHuntRunState } from './relicHunts';
import {
  evaluateKingdomTrial,
  isKingdomTrialUnlocked,
  kingdomTrialOrder
} from './kingdomTrials';
import type { KingdomTrialId } from './kingdomTrials';
import {
  canStartResearch,
  getArmyDeploymentCapacity,
  getFamilyUnlock,
  getFantasyRecruitTemplates,
  getFantasyStoryRewardUnit,
  getResearchGemFinishCost,
  getResearchRemainingHours,
  researchDefinitions
} from './progression';
import type {
  FamilyUnlockDefinition,
  FantasyRecruitTemplate,
  ResearchDefinition
} from './progression';
import {
  clampArmyReadiness,
  getArmyResupplyCost,
  getBattleReadinessWear,
  getExpansionCost
} from './balance';
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
  FormationPreset,
  FormationPresetSlotId,
  FormationShapeDefinition,
  FormationShapeId,
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
  ResearchProgressState,
  SharedProgress
} from '../save/types';
import { buildFactionSwitchSnapshot } from '../save/schema';
import { createKeyedInFlightGuard } from './mobileSession';

type RewardedAdClaimState = Partial<Record<RewardedAdPlacementId, number>>;

type GameContextValue = {
  resources: ResourceWallet;
  units: UnitDefinition[];
  formation: Array<string | null>;
  wagonItems: WagonItemDefinition[];
  currentWagonStage: WagonStage;
  armyReadiness: number;
  armyResupplyCost: number;
  chapterNumber: number;
  chapterNodes: ChapterNode[];
  activeFaction: FactionId;
  completedCampaigns: FactionId[];
  campaignAvailability: CampaignAvailability[];
  metaCampaignStep: number;
  metaCampaignComplete: boolean;
  metaCampaignUnlocked: boolean;
  hasFactionState: (faction: FactionId) => boolean;
  switchFaction: (faction: FactionId) => Promise<boolean>;
  flushSnapshot: () => Promise<void>;
  tutorialSeen: string[];
  markTutorialSeen: (key: string) => void;
  resetTutorialGuidance: () => void;
  reviewPromptShown: boolean;
  markReviewPromptShown: () => void;
  gems: number;
  completedStoryGates: string[];
  researchProgress: Record<string, ResearchProgressState>;
  unlockedFantasyClasses: string[];
  magicFamilyUnlock: FamilyUnlockDefinition | null;
  magicResearchDefinitions: ResearchDefinition[];
  fantasyRecruitOptions: FantasyRecruitTemplate[];
  flyingFamilyUnlock: FamilyUnlockDefinition | null;
  flyingResearchDefinitions: ResearchDefinition[];
  flyingRecruitOptions: FantasyRecruitTemplate[];
  largeFamilyUnlock: FamilyUnlockDefinition | null;
  largeResearchDefinitions: ResearchDefinition[];
  largeRecruitOptions: FantasyRecruitTemplate[];
  hybridFamilyUnlock: FamilyUnlockDefinition | null;
  hybridResearchDefinitions: ResearchDefinition[];
  hybridRecruitOptions: FantasyRecruitTemplate[];
  hybridPrerequisitesMet: boolean;
  fantasyProgressionChapter: number;
  formationShapeId: FormationShapeId;
  formationShapes: FormationShapeDefinition[];
  activeFormationShape: FormationShapeDefinition;
  formationPresets: FormationPreset[];
  formationDoctrineId: string;
  formationDoctrines: FormationDoctrine[];
  formationBonuses: FormationBonus[];
  formationAnalysis: ReturnType<typeof analyzeFormation>;
  activeSquadCap: number;
  activeDeploymentCapacity: number;
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
  strongholdMusterOptions: RecruitOption[];
  sixthRecruitChosen: boolean;
  marcherWarningChoices: MarcherWarningChoice[];
  marcherWarningChoiceId: string | null;
  activeMarcherWarningChoice: MarcherWarningChoice | null;
  dividedMarchResolved: boolean;
  lordMarshalWon: boolean;
  lastLoyalistChoices: LastLoyalistsChoice[];
  lastLoyalistsChoiceId: string | null;
  activeLastLoyalistsChoice: LastLoyalistsChoice | null;
  pretenderGeneralWon: boolean;
  royalDecrees: RoyalDecreeDefinition[];
  royalDecreeId: string | null;
  activeRoyalDecree: RoyalDecreeDefinition | null;
  royalDecreeSwitchCost: number;
  factionMandates: FactionMandateDefinition[];
  factionMandateId: string | null;
  activeFactionMandate: FactionMandateDefinition | null;
  factionMandateSwitchCost: number;
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
  strongholdUpgradeAvailable: boolean;
  canUpgradeToStronghold: boolean;
  capitalUpgradeAvailable: boolean;
  canUpgradeToCapital: boolean;
  grandUpgradeAvailable: boolean;
  canUpgradeToGrand: boolean;
  canUpgradeToFort: boolean;
  lastBattleResult: BattleResult | null;
  canUpgradeSettlement: boolean;
  factionFortUpgradeAvailable: boolean;
  canUpgradeFactionFort: boolean;
  factionTownUpgradeAvailable: boolean;
  canUpgradeFactionTown: boolean;
  factionStrongholdUpgradeAvailable: boolean;
  canUpgradeFactionStronghold: boolean;
  factionCapitalUpgradeAvailable: boolean;
  canUpgradeFactionCapital: boolean;
  factionFourthRecruitOptions: RecruitOption[];
  factionFifthRecruitOptions: RecruitOption[];
  factionFifthRecruitChosen: boolean;
  factionBuildingIds: {
    hall: string;
    army: string;
    forge: string;
    logistics: string;
    supply: string;
    command: string;
    mount: string;
    scout: string;
  };
  sideModeDefinitions: SideModeDefinition[];
  expeditionTickets: number;
  expeditionRunsCompleted: number;
  activeExpeditionRun: ExpeditionRunState | null;
  expeditionRewardChapter: number;
  expeditionRewardedRunsThisChapter: number;
  expeditionNextRewardMultiplier: 0 | 0.5 | 1;
  warTableCycle: number;
  warTableBoardChapter: number;
  warTableCompletedContractIds: string[];
  warTableBonusContractIds: string[];
  warTableContractsCompleted: number;
  warTableBonusObjectivesCompleted: number;
  warTableBoardsClearedThisChapter: number;
  warTableBoardRewardMultiplier: 0 | 0.5 | 1;
  kingdomDefenseRewardChapter: number;
  kingdomDefenseRewardedRunsThisChapter: number;
  kingdomDefenseNextRewardMultiplier: 0 | 0.5 | 1;
  siegeRunsCompleted: number;
  activeSiegeRun: SiegeRunState | null;
  siegeRewardChapter: number;
  siegeRewardedRunsThisChapter: number;
  siegeNextRewardMultiplier: 0 | 0.5 | 1;
  relicHuntRunsCompleted: number;
  activeRelicHuntRun: RelicHuntRunState | null;
  relicHuntRewardClaimed: boolean;
  relicCollectionClaimedFactions: FactionId[];
  formationTrialCompleted: boolean;
  kingdomTrialCompletions: KingdomTrialId[];
  rewardedAdClaims: RewardedAdClaimState;
  rewardedAdMessage: string | null;
  finishEncounter: (
    encounterId: EncounterId,
    battleSummary?: WarTableBattleSummary
  ) => void;
  recordBattleWear: (
    remainingHp: number,
    maxHp: number,
    difficulty: 'Normal' | 'Elite' | 'Boss',
    victory: boolean
  ) => number;
  restAndResupplyArmy: () => boolean;
  completeFactionChapterOneEvent: (
    stage: 'investigation' | 'supply'
  ) => boolean;
  completeFactionChapterTwoEvent: (
    stage: 'resource' | 'council'
  ) => boolean;
  completeFactionChapterThreeEvent: (
    stage: 'resource' | 'council'
  ) => boolean;
  completeFactionChapterFourEvent: (
    stage: 'resource' | 'council'
  ) => boolean;
  completeFactionChapterFiveEvent: (
    stage: 'muster' | 'resource' | 'seal'
  ) => boolean;
  completeFactionChapterSixEvent: (
    stage: 'concord' | 'seal'
  ) => boolean;
  completeMetaCouncil: () => boolean;
  completeMetaConcordChamber: () => boolean;
  completeMarkedRaiders: () => boolean;
  completeRefugeeCamp: () => boolean;
  upgradeSettlement: () => boolean;
  upgradeToFort: () => boolean;
  upgradeFactionToFort: () => boolean;
  upgradeFactionToTown: () => boolean;
  upgradeFactionToStronghold: () => boolean;
  upgradeFactionToCapital: () => boolean;
  constructBuilding: (buildingId: string, plotId: string) => boolean;
  moveBuilding: (buildingId: string, targetPlotId: string) => boolean;
  upgradeBuilding: (buildingId: string) => boolean;
  isBuildingUnlocked: (buildingId: string) => boolean;
  chooseRecruit: (choiceId: string) => boolean;
  chooseFactionFourthRecruit: (choiceId: string) => boolean;
  chooseFactionFifthRecruit: (choiceId: string) => boolean;
  chooseFortRecruit: (choiceId: string) => boolean;
  chooseMarcherAuxiliary: (choiceId: string) => boolean;
  chooseStrongholdRecruit: (choiceId: string) => boolean;
  completeEmptyThrone: () => boolean;
  chooseLastLoyalistsApproach: (choiceId: LastLoyalistsChoiceId) => boolean;
  chooseFactionMandate: (mandateId: FactionMandateId) => boolean;
  completeBrokenArchives: () => boolean;
  completeRoyalLedger: () => boolean;
  completeGrandCouncil: () => boolean;
  completeConcordVault: () => boolean;
  completeForcedBeacon: () => boolean;
  chooseMarcherWarning: (choiceId: MarcherWarningChoiceId) => boolean;
  completeDividedMarch: () => boolean;
  unlockTimberCamp: () => boolean;
  claimProduction: () => boolean;
  completeKingdomDefense: () => boolean;
  commitKingdomDefenseReadiness: (
    readiness: number
  ) => void;
  completeBrokenSignalTower: () => boolean;
  upgradeToTown: () => boolean;
  upgradeToStronghold: () => boolean;
  upgradeToCapital: () => boolean;
  upgradeToGrand: () => boolean;
  chooseRoyalDecree: (decreeId: RoyalDecreeId) => boolean;
  getEquipmentCraftCost: (equipment: EquipmentDefinition) => Partial<ResourceWallet>;
  craftEquipment: (equipmentId: string) => boolean;
  equipEquipment: (unitId: string, equipmentId: string) => boolean;
  upgradeEquippedItem: (unitId: string, targetEquipmentId: string) => boolean;
  promoteMira: (equipmentId: string) => boolean;
  advancedPromoteUnit: (unitId: string, promotionId: string) => boolean;
  getAdvancedPromotionsForUnit: (unitId: string) => AdvancedPromotionDefinition[];
  chooseCommanderPath: (pathId: string) => boolean;
  moveFormationUnit: (unitId: string, targetSlot: number) => boolean;
  placeFormationUnit: (unitId: string, targetSlot: number) => boolean;
  moveWagonItem: (itemId: string, x: number, y: number) => boolean;
  rotateWagonItem: (itemId: string) => boolean;
  resetWagon: () => void;
  setFormationShape: (shapeId: FormationShapeId) => boolean;
  setFormationDoctrine: (doctrineId: string) => boolean;
  saveFormationPreset: (slotId: FormationPresetSlotId) => boolean;
  applyFormationPreset: (slotId: FormationPresetSlotId) => boolean;
  clearFormationPreset: (slotId: FormationPresetSlotId) => boolean;
  isSideModeUnlocked: (id: SideModeId) => boolean;
  refreshWarTableBoard: () => boolean;
  consumeExpeditionTicket: () => boolean;
  startExpeditionRun: () => boolean;
  resolveExpeditionRouteChoice: (
    choiceId: string
  ) => boolean;
  abandonExpeditionRun: () => void;
  finishExpedition: () => boolean;
  startSiegeRun: () => boolean;
  resolveSiegeStageChoice: (
    choiceId: string
  ) => boolean;
  abandonSiegeRun: () => void;
  finishSiegeRun: () => boolean;
  startRelicHuntRun: () => boolean;
  resolveRelicHuntStage: () => boolean;
  abandonRelicHuntRun: () => void;
  finishRelicHuntRun: () => boolean;
  completeFormationTrial: () => boolean;
  completeKingdomTrial: (
    trialId: KingdomTrialId
  ) => boolean;
  claimRewardedAd: (placementId: RewardedAdPlacementId) => Promise<RewardedAdResult>;
  startFantasyResearch: (researchId: string) => boolean;
  claimFantasyResearch: (researchId: string) => boolean;
  watchFantasyResearchAd: (researchId: string) => Promise<RewardedAdResult>;
  finishFantasyResearchWithGems: (researchId: string) => boolean;
  recruitFantasyUnit: (templateId: string) => boolean;
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

function cloneResearchProgress(
  progress: Record<string, ResearchProgressState> | undefined
): Record<string, ResearchProgressState> {
  if (!progress) return {};

  return Object.fromEntries(
    Object.entries(progress).map(([id, entry]) => [
      id,
      {
        startedAt: entry.startedAt,
        rewardedAdsWatched: entry.rewardedAdsWatched,
        completed: entry.completed
      }
    ])
  );
}

function cloneFormationPresets(
  presets: FormationPreset[] | undefined
): FormationPreset[] {
  if (!Array.isArray(presets)) return [];

  return presets
    .filter(
      preset =>
        preset &&
        [1, 2, 3].includes(preset.slotId) &&
        Array.isArray(preset.formation)
    )
    .map(preset => ({
      slotId: preset.slotId,
      formationShapeId: preset.formationShapeId,
      formationDoctrineId: preset.formationDoctrineId,
      formation: Array.from(
        { length: 9 },
        (_, index) => preset.formation[index] ?? null
      ),
      ...(preset.unitEquipment
        ? {
            unitEquipment: cloneLoadouts(
              preset.unitEquipment
            )
          }
        : {})
    }))
    .sort((a, b) => a.slotId - b.slotId);
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

const formationShapeUnlockRank: Record<FormationShapeDefinition['unlock'], number> = {
  Start: 0,
  Settlement: 1,
  Fort: 2,
  Town: 3,
  Stronghold: 4
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
  const [armyReadiness, setArmyReadiness] = useState(
    clampArmyReadiness(initialFaction.armyReadiness ?? 100)
  );
  const [chapterNumber, setChapterNumber] = useState(initialFaction.chapterNumber);
  const [chapterNodes, setChapterNodes] = useState<ChapterNode[]>(() => cloneNodes(initialFaction.chapterNodes));
  const [activeFaction] = useState<FactionId>(initialSnapshot.activeFaction);
  const [sharedProgress, setSharedProgress] = useState<SharedProgress>(() => ({
    completedCampaigns: [...initialSnapshot.shared.completedCampaigns],
    achievements: [...initialSnapshot.shared.achievements],
    lore: [...initialSnapshot.shared.lore],
    cosmetics: [...initialSnapshot.shared.cosmetics],
    metaCampaignStep: initialSnapshot.shared.metaCampaignStep,
    metaCampaignComplete: initialSnapshot.shared.metaCampaignComplete,
    gems: Math.max(
      0,
      Math.floor(initialSnapshot.shared.gems ?? 0)
    ),
    reviewPromptShown: Boolean(
      initialSnapshot.shared.reviewPromptShown
    )
  }));
  const [formationShapeId, setFormationShapeIdState] = useState<FormationShapeId>(
    initialFaction.formationShapeId ?? 'balanced_333'
  );
  const [formationPresets, setFormationPresets] = useState<FormationPreset[]>(
    () => cloneFormationPresets(initialFaction.formationPresets)
  );
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
  const [marcherWarningChoiceId, setMarcherWarningChoiceId] = useState<string | null>(
    initialFaction.marcherWarningChoiceId
  );
  const [dividedMarchResolved, setDividedMarchResolved] = useState(
    initialFaction.dividedMarchResolved
  );
  const [lordMarshalWon, setLordMarshalWon] = useState(initialFaction.lordMarshalWon);
  const [lastLoyalistsChoiceId, setLastLoyalistsChoiceId] = useState<string | null>(
    initialFaction.lastLoyalistsChoiceId
  );
  const [pretenderGeneralWon, setPretenderGeneralWon] = useState(
    initialFaction.pretenderGeneralWon
  );
  const [royalDecreeId, setRoyalDecreeId] = useState<string | null>(
    initialFaction.royalDecreeId
  );
  const [factionMandateId, setFactionMandateId] = useState<string | null>(
    initialFaction.factionMandateId
  );
  const [lastBattleResult, setLastBattleResult] = useState<BattleResult | null>(
    initialFaction.lastBattleResult ? { ...initialFaction.lastBattleResult } : null
  );
  const [expeditionTickets, setExpeditionTickets] = useState(initialFaction.expeditionTickets);
  const [expeditionRunsCompleted, setExpeditionRunsCompleted] = useState(initialFaction.expeditionRunsCompleted);
  const [activeExpeditionRun, setActiveExpeditionRun] = useState<ExpeditionRunState | null>(
    () => initialFaction.activeExpeditionRun
      ? {
          ...initialFaction.activeExpeditionRun,
          loot: { ...initialFaction.activeExpeditionRun.loot },
          baseReward: { ...initialFaction.activeExpeditionRun.baseReward },
          path: [...initialFaction.activeExpeditionRun.path]
        }
      : null
  );
  const [expeditionRewardChapter, setExpeditionRewardChapter] = useState(
    initialFaction.expeditionRewardChapter
  );
  const [expeditionRewardedRunsThisChapter, setExpeditionRewardedRunsThisChapter] = useState(
    initialFaction.expeditionRewardedRunsThisChapter
  );
  const [warTableCycle, setWarTableCycle] = useState(
    initialFaction.warTableCycle
  );
  const [warTableBoardChapter, setWarTableBoardChapter] = useState(
    initialFaction.warTableBoardChapter
  );
  const [warTableCompletedContractIds, setWarTableCompletedContractIds] = useState<string[]>(
    () => [...initialFaction.warTableCompletedContractIds]
  );
  const [warTableBonusContractIds, setWarTableBonusContractIds] = useState<string[]>(
    () => [...initialFaction.warTableBonusContractIds]
  );
  const [warTableContractsCompleted, setWarTableContractsCompleted] = useState(
    initialFaction.warTableContractsCompleted
  );
  const [warTableBonusObjectivesCompleted, setWarTableBonusObjectivesCompleted] = useState(
    initialFaction.warTableBonusObjectivesCompleted
  );
  const [warTableBoardsClearedThisChapter, setWarTableBoardsClearedThisChapter] = useState(
    initialFaction.warTableBoardsClearedThisChapter
  );
  const [kingdomDefenseRewardChapter, setKingdomDefenseRewardChapter] = useState(
    initialFaction.kingdomDefenseRewardChapter
  );
  const [kingdomDefenseRewardedRunsThisChapter, setKingdomDefenseRewardedRunsThisChapter] = useState(
    initialFaction.kingdomDefenseRewardedRunsThisChapter
  );
  const [siegeRunsCompleted, setSiegeRunsCompleted] = useState(
    initialFaction.siegeRunsCompleted
  );
  const [activeSiegeRun, setActiveSiegeRun] = useState<SiegeRunState | null>(
    () => initialFaction.activeSiegeRun
      ? {
          ...initialFaction.activeSiegeRun,
          path: [...initialFaction.activeSiegeRun.path]
        }
      : null
  );
  const [siegeRewardChapter, setSiegeRewardChapter] = useState(
    initialFaction.siegeRewardChapter
  );
  const [siegeRewardedRunsThisChapter, setSiegeRewardedRunsThisChapter] = useState(
    initialFaction.siegeRewardedRunsThisChapter
  );
  const [relicHuntRunsCompleted, setRelicHuntRunsCompleted] = useState(
    initialFaction.relicHuntRunsCompleted
  );
  const [activeRelicHuntRun, setActiveRelicHuntRun] = useState<RelicHuntRunState | null>(
    () => initialFaction.activeRelicHuntRun
      ? {
          ...initialFaction.activeRelicHuntRun,
          affinities: { ...initialFaction.activeRelicHuntRun.affinities },
          path: [...initialFaction.activeRelicHuntRun.path]
        }
      : null
  );
  const [relicHuntRewardClaimed, setRelicHuntRewardClaimed] = useState(
    initialFaction.relicHuntRewardClaimed
  );
  const [formationTrialCompleted, setFormationTrialCompleted] = useState(initialFaction.formationTrialCompleted);
  const [kingdomTrialCompletions, setKingdomTrialCompletions] = useState<KingdomTrialId[]>(
    () => {
      const stored = (initialFaction.kingdomTrialCompletions ?? [])
        .filter((id): id is KingdomTrialId =>
          kingdomTrialOrder.includes(id as KingdomTrialId)
        );
      if (
        initialFaction.formationTrialCompleted &&
        !stored.includes('bronze')
      ) {
        return ['bronze', ...stored];
      }
      return stored;
    }
  );
  const [completedStoryGates, setCompletedStoryGates] = useState<string[]>(
    () => [...(initialFaction.completedStoryGates ?? [])]
  );
  const [researchProgress, setResearchProgress] = useState<Record<string, ResearchProgressState>>(
    () => cloneResearchProgress(initialFaction.researchProgress)
  );
  const [unlockedFantasyClasses, setUnlockedFantasyClasses] = useState<string[]>(
    () => [...(initialFaction.unlockedFantasyClasses ?? [])]
  );
  const [fantasyRecruitSerial, setFantasyRecruitSerial] = useState(
    initialFaction.fantasyRecruitSerial ?? 0
  );
  const [tutorialSeen, setTutorialSeen] = useState<string[]>(
    () => [...(initialFaction.tutorialSeen ?? [])]
  );
  const [rewardedAdClaims, setRewardedAdClaims] = useState<RewardedAdClaimState>({});
  const [rewardedAdMessage, setRewardedAdMessage] = useState<string | null>(null);

  const expeditionNextRewardMultiplier =
    getExpeditionRewardMultiplier({
      currentChapter: chapterNumber,
      rewardChapter: expeditionRewardChapter,
      rewardedRunsThisChapter:
        expeditionRewardedRunsThisChapter
    });
  const warTableBoardRewardMultiplier =
    getWarTableBoardRewardMultiplier(
      warTableBoardsClearedThisChapter
    );
  const siegeNextRewardMultiplier =
    getSiegeRewardMultiplier({
      currentChapter: chapterNumber,
      rewardChapter: siegeRewardChapter,
      rewardedRunsThisChapter:
        siegeRewardedRunsThisChapter
    });

  const kingdomDefenseNextRewardMultiplier =
    getKingdomDefenseRewardMultiplier({
      firstClear:
        !kingdomDefenseCompleted &&
        activeFaction === 'human' &&
        Boolean(
          chapterNodes.find(
            node => node.id === 'ch2_node_4'
          )?.current
        ),
      currentChapter: chapterNumber,
      rewardChapter:
        kingdomDefenseRewardChapter,
      rewardedRunsThisChapter:
        kingdomDefenseRewardedRunsThisChapter
    });

  const relicCollectionClaimedFactions = (
    Object.entries(relicRewards) as Array<
      [FactionId, (typeof relicRewards)[FactionId]]
    >
  )
    .filter(([, reward]) =>
      sharedProgress.cosmetics.includes(
        reward.cosmeticId
      )
    )
    .map(([faction]) => faction);

  const gems = sharedProgress.gems ?? 0;
  const magicFamilyUnlock = useMemo(
    () => getFamilyUnlock(activeFaction, 'magic'),
    [activeFaction]
  );
  const magicResearchDefinitions = useMemo(
    () =>
      researchDefinitions.filter(
        research =>
          research.faction === activeFaction &&
          research.family === 'magic'
      ),
    [activeFaction]
  );
  const fantasyRecruitOptions = useMemo(
    () => getFantasyRecruitTemplates(activeFaction, 'magic'),
    [activeFaction]
  );
  const flyingFamilyUnlock = useMemo(
    () => getFamilyUnlock(activeFaction, 'flying'),
    [activeFaction]
  );
  const flyingResearchDefinitions = useMemo(
    () =>
      researchDefinitions.filter(
        research =>
          research.faction === activeFaction &&
          research.family === 'flying'
      ),
    [activeFaction]
  );
  const flyingRecruitOptions = useMemo(
    () => getFantasyRecruitTemplates(activeFaction, 'flying'),
    [activeFaction]
  );
  const largeFamilyUnlock = useMemo(
    () => getFamilyUnlock(activeFaction, 'large'),
    [activeFaction]
  );
  const largeResearchDefinitions = useMemo(
    () =>
      researchDefinitions.filter(
        research =>
          research.faction === activeFaction &&
          research.family === 'large'
      ),
    [activeFaction]
  );
  const largeRecruitOptions = useMemo(
    () => getFantasyRecruitTemplates(activeFaction, 'large'),
    [activeFaction]
  );
  const hybridFamilyUnlock = useMemo(
    () => getFamilyUnlock(activeFaction, 'hybrid'),
    [activeFaction]
  );
  const hybridResearchDefinitions = useMemo(
    () =>
      researchDefinitions.filter(
        research =>
          research.faction === activeFaction &&
          research.family === 'hybrid'
      ),
    [activeFaction]
  );
  const hybridRecruitOptions = useMemo(
    () => getFantasyRecruitTemplates(activeFaction, 'hybrid'),
    [activeFaction]
  );
  const hybridPrerequisitesMet = useMemo(() => {
    const magicComplete = magicResearchDefinitions.every(
      research => Boolean(researchProgress[research.id]?.completed)
    );
    const flyingComplete = flyingResearchDefinitions.every(
      research => Boolean(researchProgress[research.id]?.completed)
    );
    return magicComplete && flyingComplete;
  }, [
    flyingResearchDefinitions,
    magicResearchDefinitions,
    researchProgress
  ]);
  const fantasyProgressionChapter =
    sharedProgress.metaCampaignComplete
      ? 8
      : sharedProgress.completedCampaigns.includes(activeFaction)
        ? 7
        : chapterNumber;
  const factionFantasyResearchDefinitions = useMemo(
    () =>
      researchDefinitions.filter(
        research => research.faction === activeFaction
      ),
    [activeFaction]
  );

  useEffect(() => {
    if (!magicFamilyUnlock || chapterNumber < 4) return;

    const discoveryNodeId =
      activeFaction === 'human'
        ? 'ch4_node_3'
        : activeFaction === 'elf'
          ? 'elf4_node_3'
          : 'orc4_node_3';
    const discoveryComplete =
      chapterNumber > 4 ||
      Boolean(
        chapterNodes.find(
          node => node.id === discoveryNodeId
        )?.completed
      );

    if (
      !discoveryComplete ||
      completedStoryGates.includes(
        magicFamilyUnlock.storyGateId
      )
    ) {
      return;
    }

    setCompletedStoryGates(previous =>
      previous.includes(magicFamilyUnlock.storyGateId)
        ? previous
        : [...previous, magicFamilyUnlock.storyGateId]
    );

    const reward = getFantasyStoryRewardUnit(
      magicFamilyUnlock.firstStoryRewardUnitId
    );
    if (reward) {
      setUnits(previous =>
        previous.some(unit => unit.id === reward.id)
          ? previous
          : [...previous, { ...reward }]
      );
    }
  }, [
    activeFaction,
    chapterNodes,
    chapterNumber,
    completedStoryGates,
    magicFamilyUnlock
  ]);

  useEffect(() => {
    if (!flyingFamilyUnlock || chapterNumber < 5) return;

    const discoveryNodeId =
      activeFaction === 'human'
        ? 'ch5_node_3'
        : activeFaction === 'elf'
          ? 'elf5_node_3'
          : 'orc5_node_3';
    const discoveryComplete =
      chapterNumber > 5 ||
      Boolean(
        chapterNodes.find(
          node => node.id === discoveryNodeId
        )?.completed
      );

    if (
      !discoveryComplete ||
      completedStoryGates.includes(
        flyingFamilyUnlock.storyGateId
      )
    ) {
      return;
    }

    setCompletedStoryGates(previous =>
      previous.includes(flyingFamilyUnlock.storyGateId)
        ? previous
        : [...previous, flyingFamilyUnlock.storyGateId]
    );

    const reward = getFantasyStoryRewardUnit(
      flyingFamilyUnlock.firstStoryRewardUnitId
    );
    if (reward) {
      setUnits(previous =>
        previous.some(unit => unit.id === reward.id)
          ? previous
          : [...previous, { ...reward }]
      );
    }
  }, [
    activeFaction,
    chapterNodes,
    chapterNumber,
    completedStoryGates,
    flyingFamilyUnlock
  ]);

  useEffect(() => {
    if (
      !largeFamilyUnlock ||
      fantasyProgressionChapter < 7 ||
      !sharedProgress.completedCampaigns.includes(activeFaction)
    ) {
      return;
    }

    if (
      completedStoryGates.includes(
        largeFamilyUnlock.storyGateId
      )
    ) {
      return;
    }

    setCompletedStoryGates(previous =>
      previous.includes(largeFamilyUnlock.storyGateId)
        ? previous
        : [...previous, largeFamilyUnlock.storyGateId]
    );

    const reward = getFantasyStoryRewardUnit(
      largeFamilyUnlock.firstStoryRewardUnitId
    );
    if (reward) {
      setUnits(previous =>
        previous.some(unit => unit.id === reward.id)
          ? previous
          : [...previous, { ...reward }]
      );
    }
  }, [
    activeFaction,
    completedStoryGates,
    fantasyProgressionChapter,
    largeFamilyUnlock,
    sharedProgress.completedCampaigns
  ]);

  useEffect(() => {
    if (
      !hybridFamilyUnlock ||
      fantasyProgressionChapter < 8 ||
      !sharedProgress.metaCampaignComplete
    ) {
      return;
    }

    if (
      completedStoryGates.includes(
        hybridFamilyUnlock.storyGateId
      )
    ) {
      return;
    }

    setCompletedStoryGates(previous =>
      previous.includes(hybridFamilyUnlock.storyGateId)
        ? previous
        : [...previous, hybridFamilyUnlock.storyGateId]
    );

    const reward = getFantasyStoryRewardUnit(
      hybridFamilyUnlock.firstStoryRewardUnitId
    );
    if (reward) {
      setUnits(previous =>
        previous.some(unit => unit.id === reward.id)
          ? previous
          : [...previous, { ...reward }]
      );
    }
  }, [
    completedStoryGates,
    fantasyProgressionChapter,
    hybridFamilyUnlock,
    sharedProgress.metaCampaignComplete
  ]);

  const currentWagonStage = useMemo(
    () => wagonStages.find(stage => stage.id === wagonStageId) ?? wagonStages[0]!,
    [wagonStageId]
  );

  const buildings = useMemo(() => getBuildings(activeFaction), [activeFaction]);
  const factionBuildingIds = useMemo(
    () => getFactionBuildingIds(activeFaction),
    [activeFaction]
  );
  const settlementAnalysis = useMemo(
    () =>
      analyzeSettlementAdjacency(
        buildingPlacements,
        buildingLevels,
        activeFaction
      ),
    [activeFaction, buildingLevels, buildingPlacements]
  );
  const settlementAdjacencyBonuses = settlementAnalysis.bonuses;
  const settlementEffects = settlementAnalysis.effects;

  const resourceSites = useMemo(
    () =>
      [
        ...humanResourceSites,
        ...marcherResourceSites,
        ...crownroadResourceSites,
        ...capitalResourceSites,
        ...crownspireResourceSites,
        ...factionChapterTwoResourceSites,
        ...factionChapterThreeResourceSites,
        ...factionChapterFourResourceSites,
        ...factionChapterFiveResourceSites
      ].filter(site => site.faction === activeFaction),
    [activeFaction]
  );
  const formationDoctrines = useMemo(
    () => getFactionDoctrines(activeFaction),
    [activeFaction]
  );

  const activeMarcherWarningChoice = useMemo(
    () =>
      marcherWarningChoices.find(
        choice => choice.id === marcherWarningChoiceId
      ) ?? null,
    [marcherWarningChoiceId]
  );

  const activeLastLoyalistsChoice = useMemo(
    () =>
      lastLoyalistChoices.find(
        choice => choice.id === lastLoyalistsChoiceId
      ) ?? null,
    [lastLoyalistsChoiceId]
  );

  const activeRoyalDecree = useMemo(
    () => getRoyalDecree(royalDecreeId),
    [royalDecreeId]
  );
  const royalDecreeSwitchCost = 100;

  const factionMandates = useMemo(
    () =>
      activeFaction === 'human'
        ? []
        : getFactionMandates(activeFaction),
    [activeFaction]
  );
  const activeFactionMandate = useMemo(
    () => getFactionMandate(factionMandateId),
    [factionMandateId]
  );
  const factionMandateSwitchCost = 100;

  const activeFormationShape = useMemo(
    () => getFormationShape(formationShapeId),
    [formationShapeId]
  );
  const formationAnalysis = useMemo(
    () => analyzeFormation(
      formation,
      units,
      activeFaction,
      formationDoctrineId,
      formationShapeId
    ),
    [activeFaction, formation, formationDoctrineId, formationShapeId, units]
  );

  const commanderPaths = useMemo(
    () => getCommanderPaths(activeFaction),
    [activeFaction]
  );
  const activeCommanderPath = useMemo(
    () => getCommanderPath(commanderPathId),
    [commanderPathId]
  );
  const expeditionPreparation = useMemo(
    () =>
      getExpeditionPreparation({
        buildingLevels,
        buildingIds: {
          logistics: factionBuildingIds.logistics,
          supply: factionBuildingIds.supply
        },
        wagonItems
      }),
    [
      buildingLevels,
      factionBuildingIds.logistics,
      factionBuildingIds.supply,
      wagonItems
    ]
  );

  const expeditionBaseReward = useMemo(
    () =>
      getExpeditionBaseReward({
        logisticsLevel:
          buildingLevels[factionBuildingIds.logistics] ?? 0,
        settlementEffects
      }),
    [
      buildingLevels,
      factionBuildingIds.logistics,
      settlementEffects
    ]
  );


  const expeditionBasePower = useMemo(
    () => {
      const activeUnits = formation
        .filter(
          (unitId): unitId is string =>
            Boolean(unitId)
        )
        .map(unitId =>
          units.find(unit => unit.id === unitId)
        )
        .filter(
          (unit): unit is UnitDefinition =>
            Boolean(unit)
        );

      const raw = activeUnits.reduce(
        (total, unit) =>
          total +
          unit.attack +
          unit.armor * 1.5 +
          unit.speed * 0.45,
        0
      );

      const command =
        activeCommanderPath
          ? 1 +
            (activeCommanderPath.attackMultiplier - 1) * 0.45 +
            (activeCommanderPath.armorMultiplier - 1) * 0.55
          : 1;

      return Math.round(
        raw *
          formationAnalysis.attackMultiplier *
          formationAnalysis.armorMultiplier *
          command
      );
    },
    [
      activeCommanderPath,
      formation,
      formationAnalysis,
      units
    ]
  );

  const relicAffinitySnapshot = useMemo(
    () => {
      const activeUnits = formation
        .filter(
          (unitId): unitId is string =>
            Boolean(unitId)
        )
        .map(unitId =>
          units.find(unit => unit.id === unitId)
        )
        .filter(
          (unit): unit is UnitDefinition =>
            Boolean(unit)
        );

      return getRelicAffinitySnapshot(
        activeUnits
      );
    },
    [formation, units]
  );

  const siegePreparation = useMemo(
    () =>
      getSiegePreparation({
        buildingLevels,
        buildingIds: {
          army: factionBuildingIds.army,
          forge: factionBuildingIds.forge,
          logistics: factionBuildingIds.logistics,
          supply: factionBuildingIds.supply,
          command: factionBuildingIds.command,
          scout: factionBuildingIds.scout
        },
        wagonItems
      }),
    [
      buildingLevels,
      factionBuildingIds.army,
      factionBuildingIds.forge,
      factionBuildingIds.logistics,
      factionBuildingIds.supply,
      factionBuildingIds.command,
      factionBuildingIds.scout,
      wagonItems
    ]
  );

  const commanderBaseRespecCost =
    commanderPathId &&
    (buildingLevels[factionBuildingIds.command] ?? 0) >= 2
      ? 50
      : commanderPathId
        ? 75
        : 0;
  const commanderRespecCost = Math.max(
    0,
    commanderBaseRespecCost - settlementEffects.commanderRespecDiscount
  );

  const formationBonuses = formationAnalysis.bonuses;
  const activeSquadCap = Math.min(
    currentWagonStage.formationSlots,
    getCampaignActiveSquadCap(chapterNumber, chapterNodes)
  );
  const activeDeploymentCapacity = useMemo(
    () =>
      getArmyDeploymentCapacity(
        formation
          .filter((unitId): unitId is string => Boolean(unitId))
          .map(unitId => units.find(unit => unit.id === unitId))
          .filter((unit): unit is UnitDefinition => Boolean(unit))
      ),
    [formation, units]
  );
  const hasPackedRations = wagonItems.some(item => item.id === 'rations');
  const hasPackedMedicine = wagonItems.some(item => item.id === 'medicine');
  const armyResupplyCost = getArmyResupplyCost(
    armyReadiness,
    activeSquadCap,
    hasPackedRations,
    hasPackedMedicine
  );
  const sixthRecruitChosen = units.some(unit =>
    [
      'hum_royal_guard_reinforcement',
      'hum_siege_engineer_reinforcement',
      'hum_banner_captain_reinforcement'
    ].includes(unit.id)
  );
  const recruitOptions =
    activeFaction === 'elf'
      ? elfThirdRecruitOptions
      : activeFaction === 'orc'
        ? orcThirdRecruitOptions
        : humanRecruitOptions;

  const factionFourthRecruitOptions =
    activeFaction === 'elf'
      ? elfFourthRecruitOptions
      : activeFaction === 'orc'
        ? orcFourthRecruitOptions
        : [];

  const factionFifthRecruitOptions =
    activeFaction === 'elf'
      ? elfFifthRecruitOptions
      : activeFaction === 'orc'
        ? orcFifthRecruitOptions
        : [];

  const factionFifthRecruitChosen =
    factionFifthRecruitOptions.length > 0 &&
    units.some(unit =>
      factionFifthRecruitOptions.some(
        option => option.unit.id === unit.id
      )
    );

  const completedCampaigns = sharedProgress.completedCampaigns;
  const metaCampaignStep = sharedProgress.metaCampaignStep;
  const metaCampaignComplete = sharedProgress.metaCampaignComplete;
  const metaCampaignUnlocked =
    completedCampaigns.includes('human') &&
    completedCampaigns.includes('elf') &&
    completedCampaigns.includes('orc');

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
        completed: metaCampaignComplete,
        unlockText: metaCampaignComplete
          ? 'Concord restored'
          : allComplete
            ? 'Three Seals campaign unlocked'
            : 'Complete all three faction campaigns'
      }
    ];
  }, [completedCampaigns, metaCampaignComplete]);

  const factionChapterOneBossWon =
    activeFaction === 'elf'
      ? Boolean(chapterNodes.find(node => node.id === 'elf_node_6')?.completed)
      : activeFaction === 'orc'
        ? Boolean(chapterNodes.find(node => node.id === 'orc_node_6')?.completed)
        : false;

  const canUpgradeSettlement =
    activeFaction === 'human'
      ? holdTheRoadWon &&
        !settlementUpgraded &&
        resources.wood >= 90 &&
        resources.stone >= 20
      : activeFaction === 'elf'
        ? factionChapterOneBossWon &&
          Boolean(commanderPathId) &&
          !settlementUpgraded &&
          resources.wood >= 70 &&
          resources.stone >= 15 &&
          resources.provisions >= 8
        : factionChapterOneBossWon &&
          Boolean(commanderPathId) &&
          !settlementUpgraded &&
          resources.wood >= 70 &&
          resources.stone >= 15 &&
          resources.iron >= 4;

  const tollCaptainWon = Boolean(
    chapterNodes.find(node => node.id === 'node_7')?.completed
  );
  const fortUpgradeAvailable =
    activeFaction === 'human' &&
    tollCaptainWon &&
    currentWagonStage.id === 'settlement';
  const canUpgradeToFort =
    fortUpgradeAvailable &&
    (buildingLevels.barracks ?? 0) >= 2 &&
    (buildingLevels.forge ?? 0) >= 2 &&
    (buildingLevels.wagonwright ?? 0) >= 2 &&
    canAfford(resources, getExpansionCost('human', 'fort'));

  const factionChapterTwoBossWon =
    activeFaction === 'elf'
      ? Boolean(chapterNodes.find(node => node.id === 'elf2_node_6')?.completed)
      : activeFaction === 'orc'
        ? Boolean(chapterNodes.find(node => node.id === 'orc2_node_6')?.completed)
        : false;

  const factionFortUpgradeAvailable =
    activeFaction !== 'human' &&
    factionChapterTwoBossWon &&
    currentWagonStage.id === 'settlement';

  const canUpgradeFactionFort =
    factionFortUpgradeAvailable &&
    (buildingLevels[factionBuildingIds.army] ?? 0) >= 2 &&
    (buildingLevels[factionBuildingIds.forge] ?? 0) >= 2 &&
    (buildingLevels[factionBuildingIds.logistics] ?? 0) >= 2 &&
    (buildingLevels[factionBuildingIds.command] ?? 0) >= 1 &&
    canAfford(resources, getExpansionCost(activeFaction, 'fort'));

  const factionChapterThreeBossWon =
    activeFaction === 'elf'
      ? Boolean(chapterNodes.find(node => node.id === 'elf3_node_6')?.completed)
      : activeFaction === 'orc'
        ? Boolean(chapterNodes.find(node => node.id === 'orc3_node_6')?.completed)
        : false;

  const factionTownUpgradeAvailable =
    activeFaction !== 'human' &&
    factionChapterThreeBossWon &&
    currentWagonStage.id === 'fort';

  const canUpgradeFactionTown =
    factionTownUpgradeAvailable &&
    (buildingLevels[factionBuildingIds.army] ?? 0) >= 3 &&
    (buildingLevels[factionBuildingIds.forge] ?? 0) >= 3 &&
    (buildingLevels[factionBuildingIds.logistics] ?? 0) >= 3 &&
    (buildingLevels[factionBuildingIds.mount] ?? 0) >= 1 &&
    (buildingLevels[factionBuildingIds.scout] ?? 0) >= 1 &&
    canAfford(resources, getExpansionCost(activeFaction, 'town'));

  const factionChapterFourBossWon =
    activeFaction === 'elf'
      ? Boolean(chapterNodes.find(node => node.id === 'elf4_node_6')?.completed)
      : activeFaction === 'orc'
        ? Boolean(chapterNodes.find(node => node.id === 'orc4_node_6')?.completed)
        : false;

  const factionStrongholdUpgradeAvailable =
    activeFaction !== 'human' &&
    factionChapterFourBossWon &&
    currentWagonStage.id === 'town';

  const canUpgradeFactionStronghold =
    factionStrongholdUpgradeAvailable &&
    (buildingLevels[factionBuildingIds.army] ?? 0) >= 4 &&
    (buildingLevels[factionBuildingIds.forge] ?? 0) >= 4 &&
    (buildingLevels[factionBuildingIds.logistics] ?? 0) >= 4 &&
    (buildingLevels[factionBuildingIds.command] ?? 0) >= 2 &&
    (buildingLevels[factionBuildingIds.supply] ?? 0) >= 2 &&
    (buildingLevels[factionBuildingIds.mount] ?? 0) >= 1 &&
    (buildingLevels[factionBuildingIds.scout] ?? 0) >= 1 &&
    canAfford(resources, getExpansionCost(activeFaction, 'stronghold'));

  const factionChapterFiveBossWon =
    activeFaction === 'elf'
      ? Boolean(chapterNodes.find(node => node.id === 'elf5_node_6')?.completed)
      : activeFaction === 'orc'
        ? Boolean(chapterNodes.find(node => node.id === 'orc5_node_6')?.completed)
        : false;

  const factionCapitalUpgradeAvailable =
    activeFaction !== 'human' &&
    factionChapterFiveBossWon &&
    currentWagonStage.id === 'stronghold';

  const canUpgradeFactionCapital =
    factionCapitalUpgradeAvailable &&
    (buildingLevels[factionBuildingIds.army] ?? 0) >= 5 &&
    (buildingLevels[factionBuildingIds.forge] ?? 0) >= 5 &&
    (buildingLevels[factionBuildingIds.logistics] ?? 0) >= 5 &&
    (buildingLevels[factionBuildingIds.command] ?? 0) >= 3 &&
    (buildingLevels[factionBuildingIds.supply] ?? 0) >= 3 &&
    (buildingLevels[factionBuildingIds.mount] ?? 0) >= 2 &&
    (buildingLevels[factionBuildingIds.scout] ?? 0) >= 2 &&
    canAfford(resources, getExpansionCost(activeFaction, 'capital'));

  const townUpgradeAvailable =
    ironProvostWon && currentWagonStage.id === 'fort';

  const canUpgradeToTown =
    townUpgradeAvailable &&
    (buildingLevels.barracks ?? 0) >= 3 &&
    (buildingLevels.forge ?? 0) >= 3 &&
    (buildingLevels.wagonwright ?? 0) >= 3 &&
    (buildingLevels.stable ?? 0) >= 1 &&
    (buildingLevels.signal_tower ?? 0) >= 1 &&
    canAfford(resources, getExpansionCost('human', 'town'));

  const strongholdUpgradeAvailable =
    lordMarshalWon && currentWagonStage.id === 'town';

  const canUpgradeToStronghold =
    strongholdUpgradeAvailable &&
    (buildingLevels.barracks ?? 0) >= 4 &&
    (buildingLevels.forge ?? 0) >= 4 &&
    (buildingLevels.wagonwright ?? 0) >= 4 &&
    (buildingLevels.war_room ?? 0) >= 2 &&
    (buildingLevels.quartermaster ?? 0) >= 2 &&
    (buildingLevels.stable ?? 0) >= 1 &&
    (buildingLevels.signal_tower ?? 0) >= 1 &&
    canAfford(resources, getExpansionCost('human', 'stronghold'));

  const capitalUpgradeAvailable =
    pretenderGeneralWon && currentWagonStage.id === 'stronghold';

  const canUpgradeToCapital =
    capitalUpgradeAvailable &&
    (buildingLevels.barracks ?? 0) >= 5 &&
    (buildingLevels.forge ?? 0) >= 5 &&
    (buildingLevels.wagonwright ?? 0) >= 5 &&
    (buildingLevels.war_room ?? 0) >= 3 &&
    (buildingLevels.quartermaster ?? 0) >= 3 &&
    (buildingLevels.stable ?? 0) >= 2 &&
    (buildingLevels.signal_tower ?? 0) >= 2 &&
    (buildingLevels.officer_academy ?? 0) >= 1 &&
    canAfford(resources, getExpansionCost('human', 'capital'));

  const gateOfCrownspireWon = Boolean(
    chapterNumber === 5 &&
      chapterNodes.find(node => node.id === 'ch5_node_6')?.completed
  );
  const grandUpgradeAvailable =
    gateOfCrownspireWon && currentWagonStage.id === 'capital';
  const canUpgradeToGrand =
    grandUpgradeAvailable &&
    Boolean(royalDecreeId) &&
    (buildingLevels.barracks ?? 0) >= 5 &&
    (buildingLevels.forge ?? 0) >= 5 &&
    (buildingLevels.wagonwright ?? 0) >= 5 &&
    (buildingLevels.war_room ?? 0) >= 4 &&
    (buildingLevels.quartermaster ?? 0) >= 4 &&
    (buildingLevels.stable ?? 0) >= 3 &&
    (buildingLevels.signal_tower ?? 0) >= 3 &&
    (buildingLevels.officer_academy ?? 0) >= 2 &&
    canAfford(resources, getExpansionCost('human', 'grand'));

  const currentFactionState = useMemo<FactionGameState>(
    () => ({
      faction: activeFaction,
      chapterNumber,
      resources,
      units,
      formation,
      formationShapeId,
      formationPresets,
      wagonItems,
      wagonStageId,
      armyReadiness,
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
      marcherWarningChoiceId,
      dividedMarchResolved,
      lordMarshalWon,
      lastLoyalistsChoiceId,
      pretenderGeneralWon,
      royalDecreeId,
      factionMandateId,
      lastBattleResult,
      expeditionTickets,
      expeditionRunsCompleted,
      activeExpeditionRun,
      expeditionRewardChapter,
      expeditionRewardedRunsThisChapter,
      warTableCycle,
      warTableBoardChapter,
      warTableCompletedContractIds,
      warTableBonusContractIds,
      warTableContractsCompleted,
      warTableBonusObjectivesCompleted,
      warTableBoardsClearedThisChapter,
      kingdomDefenseRewardChapter,
      kingdomDefenseRewardedRunsThisChapter,
      siegeRunsCompleted,
      activeSiegeRun,
      siegeRewardChapter,
      siegeRewardedRunsThisChapter,
      relicHuntRunsCompleted,
      activeRelicHuntRun,
      relicHuntRewardClaimed,
      formationTrialCompleted,
      kingdomTrialCompletions,
      completedStoryGates,
      researchProgress,
      unlockedFantasyClasses,
      fantasyRecruitSerial,
      tutorialSeen
    }),
    [
      activeFaction,
      chapterNumber,
      resources,
      units,
      formation,
      formationShapeId,
      formationPresets,
      wagonItems,
      wagonStageId,
      armyReadiness,
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
      marcherWarningChoiceId,
      dividedMarchResolved,
      lordMarshalWon,
      lastLoyalistsChoiceId,
      pretenderGeneralWon,
      royalDecreeId,
      factionMandateId,
      lastBattleResult,
      expeditionTickets,
      expeditionRunsCompleted,
      activeExpeditionRun,
      expeditionRewardChapter,
      expeditionRewardedRunsThisChapter,
      warTableCycle,
      warTableBoardChapter,
      warTableCompletedContractIds,
      warTableBonusContractIds,
      warTableContractsCompleted,
      warTableBonusObjectivesCompleted,
      warTableBoardsClearedThisChapter,
      kingdomDefenseRewardChapter,
      kingdomDefenseRewardedRunsThisChapter,
      formationTrialCompleted,
      kingdomTrialCompletions,
      completedStoryGates,
      researchProgress,
      unlockedFantasyClasses,
      fantasyRecruitSerial,
      tutorialSeen
    ]
  );

  const snapshot = useMemo<GameSnapshot>(
    () => ({
      schemaVersion: 13,
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
  const switchingFactionRef = useRef(false);
  const snapshotRef = useRef(snapshot);
  const rewardedAdInFlightRef = useRef(
    createKeyedInFlightGuard<RewardedAdPlacementId>()
  );
  snapshotRef.current = snapshot;

  useEffect(() => {
    saveCallbackRef.current = onSnapshotChange;
  }, [onSnapshotChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!switchingFactionRef.current) {
        void saveCallbackRef.current(snapshot);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [snapshot]);

  const flushSnapshot = async () => {
    if (switchingFactionRef.current) return;
    await saveCallbackRef.current(snapshotRef.current);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      nextState => {
        if (nextState !== 'active') {
          void flushSnapshot();
        }
      }
    );

    return () => subscription.remove();
  }, []);

  useEffect(
    () => () => {
      if (!switchingFactionRef.current) {
        void saveCallbackRef.current(snapshotRef.current);
      }
    },
    []
  );

  const markTutorialSeen = (key: string) => {
    setTutorialSeen(previous =>
      previous.includes(key)
        ? previous
        : [...previous, key]
    );
  };

  const resetTutorialGuidance = () => {
    setTutorialSeen([]);
  };

  const reviewPromptShown = Boolean(
    sharedProgress.reviewPromptShown
  );

  const markReviewPromptShown = () => {
    setSharedProgress(previous => ({
      ...previous,
      reviewPromptShown: true
    }));
  };

  const hasFactionState = (faction: FactionId) =>
    snapshot.factionStates[faction]?.faction === faction;

  const switchFaction = async (faction: FactionId) => {
    if (faction === activeFaction) return true;

    const humanComplete =
      sharedProgress.completedCampaigns.includes('human');

    if (faction !== 'human' && !humanComplete) {
      return false;
    }

    const nextSnapshot = buildFactionSwitchSnapshot(
      snapshot,
      currentFactionState,
      faction
    );
    if (!nextSnapshot) return false;

    switchingFactionRef.current = true;

    try {
      await saveCallbackRef.current(nextSnapshot);
      return true;
    } catch {
      switchingFactionRef.current = false;
      return false;
    }
  };

  const accrueRegionalProduction = () => {
    setProductionStock(previous => {
      const next = { ...previous };
      for (const siteId of unlockedResourceSites) {
        const site = [
          ...humanResourceSites,
          ...marcherResourceSites,
          ...crownroadResourceSites,
          ...capitalResourceSites,
          ...crownspireResourceSites,
          ...factionChapterTwoResourceSites,
          ...factionChapterThreeResourceSites,
          ...factionChapterFourResourceSites,
          ...factionChapterFiveResourceSites
        ].find(candidate => candidate.id === siteId);
        if (!site) continue;
        const productionMultiplier =
          (activeRoyalDecree?.productionMultiplier ?? 1) *
          (activeFactionMandate?.productionMultiplier ?? 1);
        next.gold += Math.ceil(
          (site.productionPerActivity.gold ?? 0) * productionMultiplier
        );
        next.wood += Math.ceil(
          (site.productionPerActivity.wood ?? 0) * productionMultiplier
        );
        next.stone += Math.ceil(
          (site.productionPerActivity.stone ?? 0) * productionMultiplier
        );
        next.iron += Math.ceil(
          (site.productionPerActivity.iron ?? 0) * productionMultiplier
        );
        next.provisions += Math.ceil(
          (site.productionPerActivity.provisions ?? 0) * productionMultiplier
        );
      }
      return next;
    });
  };

  const recordBattleWear = (
    remainingHp: number,
    maxHp: number,
    difficulty: 'Normal' | 'Elite' | 'Boss',
    victory: boolean
  ) => {
    const wear = getBattleReadinessWear(
      remainingHp,
      maxHp,
      difficulty,
      victory,
      hasPackedRations,
      hasPackedMedicine
    );

    if (wear <= 0) return 0;
    setArmyReadiness(previous =>
      clampArmyReadiness(previous - wear)
    );
    return wear;
  };

  const restAndResupplyArmy = () => {
    if (armyReadiness >= 100) return true;
    if (resources.provisions < armyResupplyCost) return false;

    setResources(previous => ({
      ...previous,
      provisions: previous.provisions - armyResupplyCost
    }));
    setArmyReadiness(100);
    return true;
  };

  const finishEncounter = (
    encounterId: EncounterId,
    battleSummary?: WarTableBattleSummary
  ) => {
    const reward = encounterRewards[encounterId];

    if (encounterId.startsWith('war_table_')) {
      if (!isSideModeUnlocked('war_table')) return;

      const contract =
        getWarTableContractByEncounter(encounterId);
      const postedContracts =
        getWarTablePostedContracts({
          cycle: warTableCycle,
          boardChapter: warTableBoardChapter
        });

      if (
        !contract ||
        !postedContracts.some(
          posted => posted.id === contract.id
        ) ||
        warTableCompletedContractIds.includes(
          contract.id
        )
      ) {
        return;
      }

      const bonusAchieved =
        Boolean(
          battleSummary &&
          evaluateWarTableBonus(
            contract,
            battleSummary
          )
        );
      const scaledBaseReward =
        scaleResourceReward(
          reward.resources,
          warTableBoardRewardMultiplier
        );
      const scaledBonusReward =
        bonusAchieved
          ? scaleResourceReward(
              contract.bonusReward,
              warTableBoardRewardMultiplier
            )
          : {};
      const totalReward = {
        gold:
          (scaledBaseReward.gold ?? 0) +
          (scaledBonusReward.gold ?? 0),
        wood:
          (scaledBaseReward.wood ?? 0) +
          (scaledBonusReward.wood ?? 0),
        stone:
          (scaledBaseReward.stone ?? 0) +
          (scaledBonusReward.stone ?? 0),
        iron:
          (scaledBaseReward.iron ?? 0) +
          (scaledBonusReward.iron ?? 0),
        provisions:
          (scaledBaseReward.provisions ?? 0) +
          (scaledBonusReward.provisions ?? 0)
      };
      const willClearBoard =
        postedContracts.every(
          posted =>
            posted.id === contract.id ||
            warTableCompletedContractIds.includes(
              posted.id
            )
        );

      if (warTableBoardRewardMultiplier > 0) {
        setResources(previous =>
          addResources(previous, totalReward)
        );
      }
      setWarTableCompletedContractIds(
        previous => [
          ...previous,
          contract.id
        ]
      );
      setWarTableContractsCompleted(
        previous => previous + 1
      );

      if (bonusAchieved) {
        setWarTableBonusContractIds(
          previous => [
            ...previous,
            contract.id
          ]
        );
        setWarTableBonusObjectivesCompleted(
          previous => previous + 1
        );
      }

      if (willClearBoard) {
        setWarTableBoardsClearedThisChapter(
          previous => previous + 1
        );

        if (warTableBoardRewardMultiplier === 1) {
          accrueRegionalProduction();
        }
      }

      setLastBattleResult({
        id: encounterId + '_result',
        title: 'War Table Contract Complete',
        victory: true,
        summary:
          reward.storySummary +
          (bonusAchieved
            ? ' Bonus objective achieved: ' +
              contract.bonusObjective.label +
              '.'
            : ' The bonus objective was not completed this time.'),
        rewards:
          warTableBoardRewardMultiplier > 0
            ? totalReward
            : {},
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_wardbreakers') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf_node_2') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'elf_node_3') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_wardbreakers_result',
        title: 'Outer Ward Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_red_road') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc_node_2') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'orc_node_3') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_red_road_result',
        title: 'Red Road Held',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_ashen_tracks') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf_node_4') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'elf_node_5') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_ashen_tracks_result',
        title: 'Ashen Tracks Cleared',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_hollow_warden') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setCommanderChoiceUnlocked(true);
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'elf_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setSharedProgress(previous => ({
        ...previous,
        lore: previous.lore.includes('elf_ward_sabotage')
          ? previous.lore
          : [...previous.lore, 'elf_ward_sabotage']
      }));
      setLastBattleResult({
        id: 'elf_hollow_warden_result',
        title: 'Hollow Warden Freed',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_invader_scouts') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc_node_4') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'orc_node_5') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_invader_scouts_result',
        title: 'Invader Scouts Broken',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_blamecaller') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setCommanderChoiceUnlocked(true);
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'orc_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setSharedProgress(previous => ({
        ...previous,
        lore: previous.lore.includes('orc_false_clan_war')
          ? previous.lore
          : [...previous.lore, 'orc_false_clan_war']
      }));
      setLastBattleResult({
        id: 'orc_blamecaller_result',
        title: 'Blamecaller Defeated',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_last_heartgrove') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf2_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf2_node_2') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'elf2_node_3') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_last_heartgrove_result',
        title: 'Heartgrove Road Held',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_ward_hunters') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf2_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf2_node_4') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'elf2_node_5') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_ward_hunters_result',
        title: 'Ward Hunters Broken',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_ashroot_stalker') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf2_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'elf2_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'elf_ashroot_stalker_result',
        title: 'Ashroot Stalker Defeated',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_gather_clans') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc2_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc2_node_2') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'orc2_node_3') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_gather_clans_result',
        title: 'Clan Road Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_stonejaw_challengers') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc2_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc2_node_4') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'orc2_node_5') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_stonejaw_challengers_result',
        title: 'Stonejaw Challenge Won',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_clanbreaker') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc2_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'orc2_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'orc_clanbreaker_result',
        title: 'Clanbreaker Defeated',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_moonlit_pass') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf3_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf3_node_2') return { ...node, completed: true, current: false };
          if (node.id === 'elf3_node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_moonlit_pass_result',
        title: 'Moonlit Pass Entered',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_ashen_groves') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf3_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf3_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'elf3_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_ashen_groves_result',
        title: 'Ashen Groves Cleared',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_pale_ranger') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf3_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'elf3_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'elf_pale_ranger_result',
        title: 'Pale Ranger Defeated',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_stonejaw_trial') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc3_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc3_node_2') return { ...node, completed: true, current: false };
          if (node.id === 'orc3_node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_stonejaw_trial_result',
        title: 'Stonejaw Trial Passed',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_broken_steppe') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc3_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc3_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'orc3_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_broken_steppe_result',
        title: 'Broken Steppe Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_stonejaw_champion') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc3_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'orc3_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'orc_stonejaw_champion_result',
        title: 'Stonejaw Champion Yields',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_roots_in_ash') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf4_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf4_node_2') return { ...node, completed: true, current: false };
          if (node.id === 'elf4_node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_roots_in_ash_result',
        title: 'Roots in Ash Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_two_fronts') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf4_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf4_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'elf4_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_two_fronts_result',
        title: 'Both Fronts Hold',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_ashen_druid') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf4_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'elf4_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'elf_ashen_druid_result',
        title: 'Ashen Druid Defeated',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_two_front_war') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc4_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc4_node_2') return { ...node, completed: true, current: false };
          if (node.id === 'orc4_node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_two_front_war_result',
        title: 'Two Fronts Held',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_broken_steppe_war') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc4_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc4_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'orc4_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_broken_steppe_war_result',
        title: 'Steppe Warhost Broken',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_split_chieftain') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc4_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'orc4_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'orc_split_chieftain_result',
        title: 'Split-Chieftain Yields',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_wounded_worldroot') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf5_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf5_node_2') return { ...node, completed: true, current: false };
          if (node.id === 'elf5_node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_wounded_worldroot_result',
        title: 'Worldroot Scar Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_ashen_rootkeepers') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf5_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf5_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'elf5_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_ashen_rootkeepers_result',
        title: 'Rootkeepers Defeated',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_worldroot_guardian') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf5_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setSharedProgress(previous => ({
        ...previous,
        lore: previous.lore.includes('elf_root_seal_traced')
          ? previous.lore
          : [...previous.lore, 'elf_root_seal_traced']
      }));
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'elf5_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'elf_worldroot_guardian_result',
        title: 'Worldroot Guardian Released',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_no_clan_left_behind') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc5_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc5_node_2') return { ...node, completed: true, current: false };
          if (node.id === 'orc5_node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_no_clan_left_behind_result',
        title: 'Isolated Clans Recovered',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_ashen_clanbreakers') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc5_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc5_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'orc5_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_ashen_clanbreakers_result',
        title: 'Clanbreakers Defeated',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_last_clanbreaker') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc5_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setSharedProgress(previous => ({
        ...previous,
        lore: previous.lore.includes('orc_clan_seal_traced')
          ? previous.lore
          : [...previous.lore, 'orc_clan_seal_traced']
      }));
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'orc5_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'orc_last_clanbreaker_result',
        title: 'Last Clanbreaker Defeated',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_stars_over_crownspire') {
      if (
        activeFaction !== 'elf' ||
        !factionMandateId ||
        !chapterNodes.find(node => node.id === 'elf6_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf6_node_2') return { ...node, completed: true, current: false };
          if (node.id === 'elf6_node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_stars_over_crownspire_result',
        title: 'Starwatch Broken',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_truth_at_crownspire') {
      if (
        activeFaction !== 'orc' ||
        !factionMandateId ||
        !chapterNodes.find(node => node.id === 'orc6_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc6_node_2') return { ...node, completed: true, current: false };
          if (node.id === 'orc6_node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_truth_at_crownspire_result',
        title: 'Crownspire Warpath Open',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_ashen_starwatch') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf6_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'elf6_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'elf6_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'elf_ashen_starwatch_result',
        title: 'Ashen Starwatch Falls',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'elf_return_through_roots') {
      if (
        activeFaction !== 'elf' ||
        !chapterNodes.find(node => node.id === 'elf6_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'elf6_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setSharedProgress(previous => ({
        ...previous,
        completedCampaigns: previous.completedCampaigns.includes('elf')
          ? previous.completedCampaigns
          : [...previous.completedCampaigns, 'elf'],
        lore: previous.lore.includes('elf_root_seal')
          ? previous.lore
          : [...previous.lore, 'elf_root_seal']
      }));
      setLastBattleResult({
        id: 'elf_return_through_roots_result',
        title: 'Root Seal Recovered',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_ashen_warfires') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc6_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'orc6_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'orc6_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'orc_ashen_warfires_result',
        title: 'Ashen Warfires Broken',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'orc_crownspire_warmaster') {
      if (
        activeFaction !== 'orc' ||
        !chapterNodes.find(node => node.id === 'orc6_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'orc6_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setSharedProgress(previous => ({
        ...previous,
        completedCampaigns: previous.completedCampaigns.includes('orc')
          ? previous.completedCampaigns
          : [...previous.completedCampaigns, 'orc'],
        lore: previous.lore.includes('orc_clan_seal')
          ? previous.lore
          : [...previous.lore, 'orc_clan_seal']
      }));
      setLastBattleResult({
        id: 'orc_crownspire_warmaster_result',
        title: 'Clan Seal Recovered',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'three_seals_convergence') {
      if (!metaCampaignUnlocked || metaCampaignStep !== 1) return;

      setResources(previous => addResources(previous, reward.resources));
      setSharedProgress(previous => ({
        ...previous,
        metaCampaignStep: 2
      }));
      setLastBattleResult({
        id: 'three_seals_convergence_result',
        title: 'Three Roads Converge',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ashen_triumvirate') {
      if (!metaCampaignUnlocked || metaCampaignStep !== 3) return;

      setResources(previous => addResources(previous, reward.resources));
      setSharedProgress(previous => ({
        ...previous,
        metaCampaignStep: 4
      }));
      setLastBattleResult({
        id: 'ashen_triumvirate_result',
        title: 'Triumvirate Broken',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'unbound_beacon') {
      if (!metaCampaignUnlocked || metaCampaignStep !== 4) return;

      setResources(previous => addResources(previous, reward.resources));
      setSharedProgress(previous => ({
        ...previous,
        metaCampaignStep: 5,
        metaCampaignComplete: true,
        achievements: previous.achievements.includes('concord_restored')
          ? previous.achievements
          : [...previous.achievements, 'concord_restored'],
        lore: previous.lore.includes('three_seals_restored')
          ? previous.lore
          : [...previous.lore, 'three_seals_restored']
      }));
      setLastBattleResult({
        id: 'unbound_beacon_result',
        title: 'Concord Restored',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

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
      if (
        mercenaryPatrolWon ||
        !firstPromotionComplete ||
        !chapterNodes.find(node => node.id === 'node_5')?.current
      ) return;
      setMercenaryPatrolWon(true);
      setCommanderChoiceUnlocked(true);
      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'node_5') return { ...node, completed: true, current: false };
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
      if (chapterNodes.find(node => node.id === 'node_7')?.completed || !refugeeCampSecured) {
        return;
      }

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'node_7'
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

    if (encounterId === 'riders_on_the_road') {
      if (
        chapterNumber !== 2 ||
        !chapterNodes.find(node => node.id === 'ch2_node_3')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch2_node_3') return { ...node, completed: true, current: false };
          if (node.id === 'ch2_node_4') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'riders_on_the_road_result',
        title: 'Riders Driven Off',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'the_iron_line') {
      if (
        chapterNumber !== 2 ||
        !chapterNodes.find(node => node.id === 'ch2_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch2_node_6') return { ...node, completed: true, current: false };
          if (node.id === 'ch2_node_7') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'the_iron_line_result',
        title: 'Iron Wall Broken',
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
        !chapterNodes.find(node => node.id === 'ch2_node_8')?.current
      ) {
        return;
      }

      setIronProvostWon(true);
      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'ch2_node_8'
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
      return;
    }

    if (encounterId === 'ch3_frozen_steel') {
      if (
        chapterNumber !== 3 ||
        !chapterNodes.find(node => node.id === 'ch3_node_3')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch3_node_3') return { ...node, completed: true, current: false };
          if (node.id === 'ch3_node_4') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ch3_frozen_steel_result',
        title: 'Froststeel Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ch3_hooves_snow') {
      if (
        chapterNumber !== 3 ||
        !chapterNodes.find(node => node.id === 'ch3_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch3_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'ch3_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ch3_hooves_snow_result',
        title: 'Charge Lanes Closed',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'siege_road') {
      if (
        chapterNumber !== 3 ||
        !marcherWarningChoiceId ||
        !chapterNodes.find(node => node.id === 'ch3_node_6')?.current
      ) {
        return;
      }

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch3_node_6') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'ch3_node_7') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'siege_road_result',
        title: 'Siege Road Broken',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ch3_through_gap') {
      if (
        chapterNumber !== 3 ||
        !chapterNodes.find(node => node.id === 'ch3_node_7')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch3_node_7') return { ...node, completed: true, current: false };
          if (node.id === 'ch3_node_8') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ch3_through_gap_result',
        title: 'Gap Exploited',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ch3_wolves_wing') {
      if (
        chapterNumber !== 3 ||
        !chapterNodes.find(node => node.id === 'ch3_node_8')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch3_node_8') return { ...node, completed: true, current: false };
          if (node.id === 'ch3_node_9') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ch3_wolves_wing_result',
        title: 'Wing Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ch3_layered_host') {
      if (
        chapterNumber !== 3 ||
        !chapterNodes.find(node => node.id === 'ch3_node_9')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch3_node_9') return { ...node, completed: true, current: false };
          if (node.id === 'ch3_node_10') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ch3_layered_host_result',
        title: 'Layers Broken',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'lord_marshal_veyr') {
      if (
        chapterNumber !== 3 ||
        lordMarshalWon ||
        !dividedMarchResolved ||
        !chapterNodes.find(node => node.id === 'ch3_node_11')?.current
      ) {
        return;
      }

      setLordMarshalWon(true);
      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'ch3_node_11'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setSharedProgress(previous => ({
        ...previous,
        lore: previous.lore.includes('veyr_false_orders')
          ? previous.lore
          : [...previous.lore, 'veyr_false_orders']
      }));
      setLastBattleResult({
        id: 'lord_marshal_veyr_result',
        title: 'The Marches Yield',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ch4_long_front') {
      if (
        chapterNumber !== 4 ||
        !chapterNodes.find(node => node.id === 'ch4_node_1')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch4_node_1') return { ...node, completed: true, current: false };
          if (node.id === 'ch4_node_2') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ch4_long_front_result',
        title: 'Long Front Held',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'broken_standards') {
      if (
        chapterNumber !== 4 ||
        !chapterNodes.find(node => node.id === 'ch4_node_2')?.current
      ) {
        return;
      }

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch4_node_2') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'ch4_node_3') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'broken_standards_result',
        title: 'The Standards Break',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ch4_broken_ground') {
      if (
        chapterNumber !== 4 ||
        !chapterNodes.find(node => node.id === 'ch4_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch4_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'ch4_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ch4_broken_ground_result',
        title: 'Ground Stabilized',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'crownroad_ambush') {
      if (
        chapterNumber !== 4 ||
        !chapterNodes.find(node => node.id === 'ch4_node_5')?.current
      ) {
        return;
      }

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch4_node_5') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'ch4_node_6') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'crownroad_ambush_result',
        title: 'Crownroad Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ch4_wrong_army') {
      if (
        chapterNumber !== 4 ||
        !chapterNodes.find(node => node.id === 'ch4_node_7')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch4_node_7') return { ...node, completed: true, current: false };
          if (node.id === 'ch4_node_8') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ch4_wrong_army_result',
        title: 'Counter Army Rebuilt',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ch4_hunters_rear') {
      if (
        chapterNumber !== 4 ||
        !chapterNodes.find(node => node.id === 'ch4_node_9')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch4_node_9') return { ...node, completed: true, current: false };
          if (node.id === 'ch4_node_10') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ch4_hunters_rear_result',
        title: 'Rear Hunters Stopped',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'pretender_general') {
      if (
        chapterNumber !== 4 ||
        pretenderGeneralWon ||
        !lastLoyalistsChoiceId ||
        !chapterNodes.find(node => node.id === 'ch4_node_11')?.current
      ) {
        return;
      }

      setPretenderGeneralWon(true);
      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'ch4_node_11'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setSharedProgress(previous => ({
        ...previous,
        lore: previous.lore.includes('pretender_command_broken')
          ? previous.lore
          : [...previous.lore, 'pretender_command_broken']
      }));
      setLastBattleResult({
        id: 'pretender_general_result',
        title: 'The Pretender Falls',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'old_royal_lands') {
      if (
        chapterNumber !== 5 ||
        !royalDecreeId ||
        !chapterNodes.find(node => node.id === 'ch5_node_2')?.current
      ) {
        return;
      }

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch5_node_2') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'ch5_node_3') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'old_royal_lands_result',
        title: 'Old Royal Lands Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ashen_envoy') {
      if (
        chapterNumber !== 5 ||
        !chapterNodes.find(node => node.id === 'ch5_node_4')?.current
      ) {
        return;
      }

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch5_node_4') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'ch5_node_5') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ashen_envoy_result',
        title: 'Ashen Envoy Defeated',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'gate_of_crownspire') {
      if (
        chapterNumber !== 5 ||
        !chapterNodes.find(node => node.id === 'ch5_node_6')?.current
      ) {
        return;
      }

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'ch5_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setLastBattleResult({
        id: 'gate_of_crownspire_result',
        title: 'Gate of Crownspire Open',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'sundered_fields') {
      if (
        chapterNumber !== 6 ||
        !chapterNodes.find(node => node.id === 'ch6_node_2')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch6_node_2') return { ...node, completed: true, current: false };
          if (node.id === 'ch6_node_3') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'sundered_fields_result',
        title: 'Sundered Fields Secured',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'ashen_court') {
      if (
        chapterNumber !== 6 ||
        !chapterNodes.find(node => node.id === 'ch6_node_4')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      accrueRegionalProduction();
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch6_node_4') return { ...node, completed: true, current: false };
          if (node.id === 'ch6_node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      setLastBattleResult({
        id: 'ashen_court_result',
        title: 'Ashen Court District Falls',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
      return;
    }

    if (encounterId === 'return_to_crownspire') {
      if (
        chapterNumber !== 6 ||
        !chapterNodes.find(node => node.id === 'ch6_node_6')?.current
      ) return;

      setResources(previous => addResources(previous, reward.resources));
      setChapterNodes(previous =>
        previous.map(node =>
          node.id === 'ch6_node_6'
            ? { ...node, completed: true, current: false }
            : { ...node, current: false }
        )
      );
      setSharedProgress(previous => ({
        ...previous,
        completedCampaigns: previous.completedCampaigns.includes('human')
          ? previous.completedCampaigns
          : [...previous.completedCampaigns, 'human'],
        lore: previous.lore.includes('human_oath_seal')
          ? previous.lore
          : [...previous.lore, 'human_oath_seal']
      }));
      setLastBattleResult({
        id: 'return_to_crownspire_result',
        title: 'Human Oath Seal Recovered',
        victory: true,
        summary: reward.storySummary,
        rewards: { ...reward.resources },
        casualties: 0
      });
    }
  };

  const completeFactionChapterOneEvent = (
    stage: 'investigation' | 'supply'
  ) => {
    if (activeFaction === 'elf') {
      const nodeId =
        stage === 'investigation' ? 'elf_node_3' : 'elf_node_5';
      const nextId =
        stage === 'investigation' ? 'elf_node_4' : 'elf_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) {
        return false;
      }

      setResources(previous =>
        stage === 'investigation'
          ? {
              ...previous,
              gold: previous.gold + 5,
              wood: previous.wood + 4
            }
          : {
              ...previous,
              wood: previous.wood + 24,
              provisions: previous.provisions + 14
            }
      );
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) {
            return { ...node, completed: true, current: false };
          }
          if (node.id === nextId) {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      return true;
    }

    if (activeFaction === 'orc') {
      const nodeId =
        stage === 'investigation' ? 'orc_node_3' : 'orc_node_5';
      const nextId =
        stage === 'investigation' ? 'orc_node_4' : 'orc_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) {
        return false;
      }

      setResources(previous =>
        stage === 'investigation'
          ? {
              ...previous,
              gold: previous.gold + 5,
              iron: previous.iron + 2
            }
          : {
              ...previous,
              wood: previous.wood + 20,
              iron: previous.iron + 4,
              provisions: previous.provisions + 16
            }
      );
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) {
            return { ...node, completed: true, current: false };
          }
          if (node.id === nextId) {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      return true;
    }

    return false;
  };

  const completeFactionChapterTwoEvent = (
    stage: 'resource' | 'council'
  ) => {
    if (activeFaction === 'elf') {
      const nodeId =
        stage === 'resource' ? 'elf2_node_3' : 'elf2_node_5';
      const nextId =
        stage === 'resource' ? 'elf2_node_4' : 'elf2_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) {
        return false;
      }

      if (stage === 'resource') {
        setUnlockedResourceSites(previous =>
          previous.includes('elf_moonwell_herbs')
            ? previous
            : [...previous, 'elf_moonwell_herbs']
        );
        setResources(previous => ({
          ...previous,
          wood: previous.wood + 12,
          provisions: previous.provisions + 8
        }));
      } else {
        setResources(previous => ({
          ...previous,
          gold: previous.gold + 20,
          stone: previous.stone + 6
        }));
      }

      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) {
            return { ...node, completed: true, current: false };
          }
          if (node.id === nextId) {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      return true;
    }

    if (activeFaction === 'orc') {
      const nodeId =
        stage === 'resource' ? 'orc2_node_3' : 'orc2_node_5';
      const nextId =
        stage === 'resource' ? 'orc2_node_4' : 'orc2_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) {
        return false;
      }

      if (stage === 'resource') {
        setUnlockedResourceSites(previous =>
          previous.includes('orc_red_plains_hunt')
            ? previous
            : [...previous, 'orc_red_plains_hunt']
        );
        setResources(previous => ({
          ...previous,
          provisions: previous.provisions + 12,
          iron: previous.iron + 3
        }));
      } else {
        setResources(previous => ({
          ...previous,
          gold: previous.gold + 18,
          wood: previous.wood + 10
        }));
      }

      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) {
            return { ...node, completed: true, current: false };
          }
          if (node.id === nextId) {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
      return true;
    }

    return false;
  };

  const completeFactionChapterThreeEvent = (
    stage: 'resource' | 'council'
  ) => {
    if (activeFaction === 'elf') {
      const nodeId = stage === 'resource' ? 'elf3_node_3' : 'elf3_node_5';
      const nextId = stage === 'resource' ? 'elf3_node_4' : 'elf3_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) return false;

      if (stage === 'resource') {
        setUnlockedResourceSites(previous =>
          previous.includes('elf_moonlit_watch')
            ? previous
            : [...previous, 'elf_moonlit_watch']
        );
        setResources(previous => ({
          ...previous,
          gold: previous.gold + 12,
          provisions: previous.provisions + 6
        }));
      } else {
        setResources(previous => ({
          ...previous,
          gold: previous.gold + 24,
          wood: previous.wood + 10
        }));
      }

      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) return { ...node, completed: true, current: false };
          if (node.id === nextId) return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      return true;
    }

    if (activeFaction === 'orc') {
      const nodeId = stage === 'resource' ? 'orc3_node_3' : 'orc3_node_5';
      const nextId = stage === 'resource' ? 'orc3_node_4' : 'orc3_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) return false;

      if (stage === 'resource') {
        setUnlockedResourceSites(previous =>
          previous.includes('orc_stonejaw_quarry')
            ? previous
            : [...previous, 'orc_stonejaw_quarry']
        );
        setResources(previous => ({
          ...previous,
          stone: previous.stone + 8,
          iron: previous.iron + 5
        }));
      } else {
        setResources(previous => ({
          ...previous,
          gold: previous.gold + 22,
          provisions: previous.provisions + 8
        }));
      }

      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) return { ...node, completed: true, current: false };
          if (node.id === nextId) return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      return true;
    }

    return false;
  };

  const completeFactionChapterFourEvent = (
    stage: 'resource' | 'council'
  ) => {
    if (activeFaction === 'elf') {
      const nodeId = stage === 'resource' ? 'elf4_node_3' : 'elf4_node_5';
      const nextId = stage === 'resource' ? 'elf4_node_4' : 'elf4_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) return false;

      if (stage === 'resource') {
        setUnlockedResourceSites(previous =>
          previous.includes('elf_burned_ward_reclamation')
            ? previous
            : [...previous, 'elf_burned_ward_reclamation']
        );
        setResources(previous => ({
          ...previous,
          wood: previous.wood + 14,
          provisions: previous.provisions + 8
        }));
      } else {
        setResources(previous => ({
          ...previous,
          gold: previous.gold + 28,
          provisions: previous.provisions + 8
        }));
      }

      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) return { ...node, completed: true, current: false };
          if (node.id === nextId) return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      return true;
    }

    if (activeFaction === 'orc') {
      const nodeId = stage === 'resource' ? 'orc4_node_3' : 'orc4_node_5';
      const nextId = stage === 'resource' ? 'orc4_node_4' : 'orc4_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) return false;

      if (stage === 'resource') {
        setUnlockedResourceSites(previous =>
          previous.includes('orc_steppe_war_camp')
            ? previous
            : [...previous, 'orc_steppe_war_camp']
        );
        setResources(previous => ({
          ...previous,
          gold: previous.gold + 12,
          provisions: previous.provisions + 10
        }));
      } else {
        setResources(previous => ({
          ...previous,
          gold: previous.gold + 26,
          iron: previous.iron + 6
        }));
      }

      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) return { ...node, completed: true, current: false };
          if (node.id === nextId) return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      return true;
    }

    return false;
  };

  const completeFactionChapterFiveEvent = (
    stage: 'muster' | 'resource' | 'seal'
  ) => {
    if (activeFaction === 'elf') {
      const nodeId =
        stage === 'muster'
          ? 'elf5_node_1'
          : stage === 'resource'
            ? 'elf5_node_3'
            : 'elf5_node_5';
      const nextId =
        stage === 'muster'
          ? 'elf5_node_2'
          : stage === 'resource'
            ? 'elf5_node_4'
            : 'elf5_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) return false;

      if (stage === 'muster') {
        setResources(previous => ({
          ...previous,
          gold: previous.gold + 25,
          provisions: previous.provisions + 25
        }));
        setUnits(previous =>
          previous.some(unit => unit.id === elfChapterFiveReinforcement.id)
            ? previous
            : [...previous, { ...elfChapterFiveReinforcement }]
        );
        setFormation(previous => {
          if (previous.includes(elfChapterFiveReinforcement.id)) return previous;
          const next = [...previous];
          const preferredSlots = getPreferredFormationSlots(formationShapeId, elfChapterFiveReinforcement.role);
          const empty = preferredSlots.find(slot => next[slot] === null);
          if (empty !== undefined && next.filter(Boolean).length < activeSquadCap) {
            next[empty] = elfChapterFiveReinforcement.id;
          }
          return next;
        });
      } else if (stage === 'resource') {
        setUnlockedResourceSites(previous =>
          previous.includes('elf_worldroot_nursery')
            ? previous
            : [...previous, 'elf_worldroot_nursery']
        );
        setResources(previous => ({
          ...previous,
          wood: previous.wood + 16,
          provisions: previous.provisions + 10
        }));
        setSharedProgress(previous => ({
          ...previous,
          lore: previous.lore.includes('worldroot_concord_records')
            ? previous.lore
            : [...previous.lore, 'worldroot_concord_records']
        }));
      } else {
        setSharedProgress(previous => ({
          ...previous,
          lore: previous.lore.includes('elf_root_seal_location')
            ? previous.lore
            : [...previous.lore, 'elf_root_seal_location']
        }));
      }

      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) return { ...node, completed: true, current: false };
          if (node.id === nextId) return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      return true;
    }

    if (activeFaction === 'orc') {
      const nodeId =
        stage === 'muster'
          ? 'orc5_node_1'
          : stage === 'resource'
            ? 'orc5_node_3'
            : 'orc5_node_5';
      const nextId =
        stage === 'muster'
          ? 'orc5_node_2'
          : stage === 'resource'
            ? 'orc5_node_4'
            : 'orc5_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) return false;

      if (stage === 'muster') {
        setResources(previous => ({
          ...previous,
          gold: previous.gold + 20,
          provisions: previous.provisions + 28
        }));
        setUnits(previous =>
          previous.some(unit => unit.id === orcChapterFiveReinforcement.id)
            ? previous
            : [...previous, { ...orcChapterFiveReinforcement }]
        );
        setFormation(previous => {
          if (previous.includes(orcChapterFiveReinforcement.id)) return previous;
          const next = [...previous];
          const preferredSlots = getPreferredFormationSlots(formationShapeId, orcChapterFiveReinforcement.role);
          const empty = preferredSlots.find(slot => next[slot] === null);
          if (empty !== undefined && next.filter(Boolean).length < activeSquadCap) {
            next[empty] = orcChapterFiveReinforcement.id;
          }
          return next;
        });
      } else if (stage === 'resource') {
        setUnlockedResourceSites(previous =>
          previous.includes('orc_united_clan_depot')
            ? previous
            : [...previous, 'orc_united_clan_depot']
        );
        setResources(previous => ({
          ...previous,
          iron: previous.iron + 10,
          provisions: previous.provisions + 10
        }));
        setSharedProgress(previous => ({
          ...previous,
          lore: previous.lore.includes('missing_warfire_pattern')
            ? previous.lore
            : [...previous.lore, 'missing_warfire_pattern']
        }));
      } else {
        setSharedProgress(previous => ({
          ...previous,
          lore: previous.lore.includes('orc_clan_seal_location')
            ? previous.lore
            : [...previous.lore, 'orc_clan_seal_location']
        }));
      }

      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) return { ...node, completed: true, current: false };
          if (node.id === nextId) return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      return true;
    }

    return false;
  };

  const completeFactionChapterSixEvent = (
    stage: 'concord' | 'seal'
  ) => {
    if (activeFaction === 'elf') {
      const nodeId = stage === 'concord' ? 'elf6_node_3' : 'elf6_node_5';
      const nextId = stage === 'concord' ? 'elf6_node_4' : 'elf6_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) return false;

      setSharedProgress(previous => ({
        ...previous,
        lore:
          stage === 'concord'
            ? previous.lore.includes('elf_concord_rootway')
              ? previous.lore
              : [...previous.lore, 'elf_concord_rootway']
            : previous.lore.includes('elf_root_seal_reached')
              ? previous.lore
              : [...previous.lore, 'elf_root_seal_reached']
      }));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) return { ...node, completed: true, current: false };
          if (node.id === nextId) return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      return true;
    }

    if (activeFaction === 'orc') {
      const nodeId = stage === 'concord' ? 'orc6_node_3' : 'orc6_node_5';
      const nextId = stage === 'concord' ? 'orc6_node_4' : 'orc6_node_6';

      if (!chapterNodes.find(node => node.id === nodeId)?.current) return false;

      setSharedProgress(previous => ({
        ...previous,
        lore:
          stage === 'concord'
            ? previous.lore.includes('orc_concord_warpath')
              ? previous.lore
              : [...previous.lore, 'orc_concord_warpath']
            : previous.lore.includes('orc_clan_seal_reached')
              ? previous.lore
              : [...previous.lore, 'orc_clan_seal_reached']
      }));
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === nodeId) return { ...node, completed: true, current: false };
          if (node.id === nextId) return { ...node, current: true };
          return { ...node, current: false };
        })
      );
      return true;
    }

    return false;
  };

  const completeMetaCouncil = () => {
    if (!metaCampaignUnlocked || metaCampaignComplete || metaCampaignStep !== 0) {
      return false;
    }

    setSharedProgress(previous => ({
      ...previous,
      metaCampaignStep: 1,
      lore: previous.lore.includes('three_seals_council')
        ? previous.lore
        : [...previous.lore, 'three_seals_council']
    }));
    return true;
  };

  const completeMetaConcordChamber = () => {
    if (!metaCampaignUnlocked || metaCampaignComplete || metaCampaignStep !== 2) {
      return false;
    }

    setSharedProgress(previous => ({
      ...previous,
      metaCampaignStep: 3,
      lore: previous.lore.includes('three_seals_in_chamber')
        ? previous.lore
        : [...previous.lore, 'three_seals_in_chamber']
    }));
    return true;
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
    if (
      !mercenaryPatrolWon ||
      !commanderPathId ||
      refugeeCampSecured ||
      !chapterNodes.find(node => node.id === 'node_6')?.current
    ) return false;

    setRefugeeCampSecured(true);
    setResources(previous => ({
      ...previous,
      wood: previous.wood + 45,
      iron: previous.iron + 8,
      provisions: previous.provisions + 20
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'node_6') return { ...node, completed: true, current: false };
        if (node.id === 'node_7') return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const upgradeSettlement = () => {
    if (!canUpgradeSettlement) return false;

    if (activeFaction === 'human') {
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
    }

    setResources(previous => ({
      ...previous,
      wood: previous.wood - 70,
      stone: previous.stone - 15,
      iron:
        previous.iron -
        (activeFaction === 'orc' ? 4 : 0),
      provisions:
        previous.provisions -
        (activeFaction === 'elf' ? 8 : 0)
    }));
    setSettlementUpgraded(true);
    setWagonStageId('settlement');
    setChapterNumber(2);
    setChapterNodes(
      cloneNodes(
        activeFaction === 'elf'
          ? elfChapterTwoNodes
          : orcChapterTwoNodes
      )
    );
    setRecruitChoiceAvailable(true);
    setRecruitChosen(false);
    setBuildingLevels(previous => ({
      ...previous,
      [factionBuildingIds.hall]: 2,
      [factionBuildingIds.army]: 1,
      [factionBuildingIds.logistics]: 1
    }));
    setBuildingPlacements(
      getInitialSettlementPlacements(activeFaction)
    );
    return true;
  };

  const upgradeToFort = () => {
    if (!canUpgradeToFort) return false;

    setResources(previous =>
      payCost(previous, getExpansionCost('human', 'fort'))
    );
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

  const upgradeFactionToFort = () => {
    if (!canUpgradeFactionFort) return false;

    setResources(previous =>
      payCost(previous, getExpansionCost(activeFaction, 'fort'))
    );
    setWagonStageId('fort');
    setBuildingLevels(previous => ({
      ...previous,
      [factionBuildingIds.hall]: 3
    }));
    setChapterNumber(3);
    setExpeditionTickets(previous =>
      getExpeditionTicketsAfterChapterTransition(
        previous,
        3
      )
    );
    setChapterNodes(
      cloneNodes(
        activeFaction === 'elf'
          ? elfChapterThreeNodes
          : orcChapterThreeNodes
      )
    );
    setFourthRecruitChoiceAvailable(true);
    setFourthRecruitChosen(false);
    return true;
  };

  const upgradeFactionToTown = () => {
    if (!canUpgradeFactionTown) return false;

    setResources(previous =>
      payCost(previous, getExpansionCost(activeFaction, 'town'))
    );
    setWagonStageId('town');
    setBuildingLevels(previous => ({
      ...previous,
      [factionBuildingIds.hall]: 4
    }));
    setChapterNumber(4);
    setExpeditionTickets(previous =>
      getExpeditionTicketsAfterChapterTransition(
        previous,
        4
      )
    );
    setChapterNodes(
      cloneNodes(
        activeFaction === 'elf'
          ? elfChapterFourNodes
          : orcChapterFourNodes
      )
    );
    return true;
  };

  const upgradeFactionToStronghold = () => {
    if (!canUpgradeFactionStronghold) return false;

    setResources(previous =>
      payCost(previous, getExpansionCost(activeFaction, 'stronghold'))
    );
    setWagonStageId('stronghold');
    setBuildingLevels(previous => ({
      ...previous,
      [factionBuildingIds.hall]: 5
    }));
    setChapterNumber(5);
    setExpeditionTickets(previous =>
      getExpeditionTicketsAfterChapterTransition(
        previous,
        5
      )
    );
    setChapterNodes(
      cloneNodes(
        activeFaction === 'elf'
          ? elfChapterFiveNodes
          : orcChapterFiveNodes
      )
    );
    return true;
  };

  const upgradeFactionToCapital = () => {
    if (!canUpgradeFactionCapital) return false;

    setResources(previous =>
      payCost(previous, getExpansionCost(activeFaction, 'capital'))
    );
    setWagonStageId('capital');
    setBuildingLevels(previous => ({
      ...previous,
      [factionBuildingIds.hall]: 6
    }));
    setChapterNumber(6);
    setExpeditionTickets(previous =>
      getExpeditionTicketsAfterChapterTransition(
        previous,
        6
      )
    );
    setChapterNodes(
      cloneNodes(
        activeFaction === 'elf'
          ? elfChapterSixNodes
          : orcChapterSixNodes
      )
    );
    setFactionMandateId(null);
    return true;
  };

  const isBuildingUnlocked = (buildingId: string) => {
    if (activeFaction === 'human') {
      if (['hall', 'barracks', 'wagonwright'].includes(buildingId)) return true;
      if (buildingId === 'forge') return forgeUnlocked;
      if (buildingId === 'war_room') return commanderChoiceUnlocked;
      if (buildingId === 'quartermaster') return refugeeCampSecured;
      if (buildingId === 'stable') {
        return ['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
      }
      if (buildingId === 'signal_tower') return signalTowerUnlocked;
      if (buildingId === 'officer_academy') {
        return ['stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
      }
      return false;
    }

    if (!settlementUpgraded) return false;

    if (
      [
        factionBuildingIds.hall,
        factionBuildingIds.army,
        factionBuildingIds.logistics,
        factionBuildingIds.forge
      ].includes(buildingId)
    ) {
      return true;
    }

    if (buildingId === factionBuildingIds.command) {
      return commanderChoiceUnlocked;
    }

    if (buildingId === factionBuildingIds.supply) {
      return activeFaction === 'elf'
        ? unlockedResourceSites.includes('elf_moonwell_herbs')
        : unlockedResourceSites.includes('orc_red_plains_hunt');
    }

    if (buildingId === factionBuildingIds.scout) {
      return activeFaction === 'elf'
        ? Boolean(chapterNodes.find(node => node.id === 'elf2_node_4')?.completed) ||
            chapterNumber >= 3
        : Boolean(chapterNodes.find(node => node.id === 'orc2_node_4')?.completed) ||
            chapterNumber >= 3;
    }

    if (buildingId === factionBuildingIds.mount) {
      return activeFaction === 'elf'
        ? Boolean(chapterNodes.find(node => node.id === 'elf2_node_5')?.completed) ||
            chapterNumber >= 3
        : Boolean(chapterNodes.find(node => node.id === 'orc2_node_5')?.completed) ||
            chapterNumber >= 3;
    }

    return false;
  };

  const constructBuilding = (buildingId: string, plotId: string) => {
    if (!isBuildingUnlocked(buildingId)) return false;
    if ((buildingLevels[buildingId] ?? 0) > 0) return false;

    const building = buildings.find(candidate => candidate.id === buildingId);
    const plot = getSettlementPlots(activeFaction).find(
      candidate => candidate.id === plotId
    );

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

    const targetPlot = getSettlementPlots(activeFaction).find(
      plot => plot.id === targetPlotId
    );
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

    if (activeFaction === 'human') {
      if (buildingId === 'barracks' && !settlementUpgraded) return false;
      if (buildingId === 'forge' && !markedRaidersInvestigated) return false;
      if (buildingId === 'quartermaster' && !refugeeCampSecured) return false;
      if (buildingId === 'war_room' && !commanderPathId) return false;
    }

    setResources(previous => payCost(previous, definition.cost));
    setBuildingLevels(previous => ({
      ...previous,
      [buildingId]: targetLevel
    }));

    if (buildingId === factionBuildingIds.supply && targetLevel === 2) {
      setExpeditionTickets(previous =>
        Math.min(
          MAX_EXPEDITION_TICKETS,
          previous + 1
        )
      );
    }

    return true;
  };

  const chooseRecruit = (choiceId: string) => {
    if (!recruitChoiceAvailable || recruitChosen) return false;

    const choice = recruitOptions.find(option => option.id === choiceId);
    if (!choice) return false;

    setUnits(previous => [...previous, { ...choice.unit }]);
    setFormation(previous => {
      const next = [...previous];
      const preferredSlots = getPreferredFormationSlots(formationShapeId, choice.unit.role);
      const empty = preferredSlots.find(slot => next[slot] === null);

      if (empty !== undefined && next.filter(Boolean).length < activeSquadCap) {
        next[empty] = choice.unit.id;
      }
      return next;
    });
    setRecruitChosen(true);
    setRecruitChoiceAvailable(false);

    if (activeFaction === 'elf' || activeFaction === 'orc') {
      const musterId =
        activeFaction === 'elf'
          ? 'elf2_node_1'
          : 'orc2_node_1';
      const battleId =
        activeFaction === 'elf'
          ? 'elf2_node_2'
          : 'orc2_node_2';
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === musterId) {
            return { ...node, completed: true, current: false };
          }
          if (node.id === battleId) {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
    }

    return true;
  };

  const chooseFactionFourthRecruit = (choiceId: string) => {
    if (
      activeFaction === 'human' ||
      !fourthRecruitChoiceAvailable ||
      fourthRecruitChosen ||
      chapterNumber !== 3
    ) {
      return false;
    }

    const choice = factionFourthRecruitOptions.find(
      option => option.id === choiceId
    );
    if (!choice) return false;

    setUnits(previous => [...previous, { ...choice.unit }]);
    setFormation(previous => {
      const next = [...previous];
      const preferredSlots = getPreferredFormationSlots(formationShapeId, choice.unit.role);
      const empty = preferredSlots.find(slot => next[slot] === null);

      if (empty !== undefined && next.filter(Boolean).length < activeSquadCap) {
        next[empty] = choice.unit.id;
      }
      return next;
    });
    setFourthRecruitChosen(true);
    setFourthRecruitChoiceAvailable(false);

    const musterId =
      activeFaction === 'elf' ? 'elf3_node_1' : 'orc3_node_1';
    const battleId =
      activeFaction === 'elf' ? 'elf3_node_2' : 'orc3_node_2';

    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === musterId) return { ...node, completed: true, current: false };
        if (node.id === battleId) return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const chooseFactionFifthRecruit = (choiceId: string) => {
    if (
      activeFaction === 'human' ||
      factionFifthRecruitChosen ||
      chapterNumber !== 4 ||
      !chapterNodes.find(node =>
        node.id === (activeFaction === 'elf' ? 'elf4_node_1' : 'orc4_node_1')
      )?.current
    ) {
      return false;
    }

    const choice = factionFifthRecruitOptions.find(
      option => option.id === choiceId
    );
    if (!choice) return false;

    setUnits(previous => [...previous, { ...choice.unit }]);
    setFormation(previous => {
      const next = [...previous];
      const preferredSlots = getPreferredFormationSlots(formationShapeId, choice.unit.role);
      const empty = preferredSlots.find(slot => next[slot] === null);

      if (empty !== undefined && next.filter(Boolean).length < activeSquadCap) {
        next[empty] = choice.unit.id;
      }
      return next;
    });

    const musterId = activeFaction === 'elf' ? 'elf4_node_1' : 'orc4_node_1';
    const battleId = activeFaction === 'elf' ? 'elf4_node_2' : 'orc4_node_2';

    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === musterId) return { ...node, completed: true, current: false };
        if (node.id === battleId) return { ...node, current: true };
        return { ...node, current: false };
      })
    );

    return true;
  };

  const chooseFortRecruit = (choiceId: string) => {
    if (!fourthRecruitChoiceAvailable || fourthRecruitChosen) return false;

    const choice = fortMusterOptions.find(option => option.id === choiceId);
    if (!choice) return false;

    setUnits(previous => [...previous, { ...choice.unit }]);
    setFormation(previous => {
      const next = [...previous];
      const preferredSlots = getPreferredFormationSlots(formationShapeId, choice.unit.role);
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
      const preferredSlots = getPreferredFormationSlots(formationShapeId, choice.unit.role);
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

  const chooseStrongholdRecruit = (choiceId: string) => {
    if (
      chapterNumber !== 4 ||
      sixthRecruitChosen ||
      !chapterNodes.find(node => node.id === 'ch4_node_8')?.current
    ) {
      return false;
    }

    const choice = strongholdMusterOptions.find(option => option.id === choiceId);
    if (!choice) return false;

    setUnits(previous => [...previous, { ...choice.unit }]);
    setSixthRecruitChosen(true);
    setFormation(previous => {
      const next = [...previous];
      const preferredSlots = getPreferredFormationSlots(formationShapeId, choice.unit.role);
      const empty = preferredSlots.find(slot => next[slot] === null);

      if (empty !== undefined && next.filter(Boolean).length < activeSquadCap) {
        next[empty] = choice.unit.id;
      }
      return next;
    });
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch4_node_8') {
          return { ...node, completed: true, current: false };
        }
        if (node.id === 'ch4_node_9') {
          return { ...node, current: true };
        }
        return { ...node, current: false };
      })
    );
    return true;
  };

  const completeEmptyThrone = () => {
    if (
      chapterNumber !== 4 ||
      !chapterNodes.find(node => node.id === 'ch4_node_6')?.current
    ) {
      return false;
    }

    setUnlockedResourceSites(previous =>
      previous.includes('crownroad_salvage')
        ? previous
        : [...previous, 'crownroad_salvage']
    );
    setSharedProgress(previous => ({
      ...previous,
      lore: previous.lore.includes('empty_throne_records')
        ? previous.lore
        : [...previous.lore, 'empty_throne_records']
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch4_node_6') {
          return { ...node, completed: true, current: false };
        }
        if (node.id === 'ch4_node_7') {
          return { ...node, current: true };
        }
        return { ...node, current: false };
      })
    );
    return true;
  };

  const chooseLastLoyalistsApproach = (
    choiceId: LastLoyalistsChoiceId
  ) => {
    if (
      chapterNumber !== 4 ||
      lastLoyalistsChoiceId ||
      !chapterNodes.find(node => node.id === 'ch4_node_10')?.current
    ) {
      return false;
    }

    const choice = lastLoyalistChoices.find(option => option.id === choiceId);
    if (!choice) return false;

    setLastLoyalistsChoiceId(choiceId);
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch4_node_10') {
          return { ...node, completed: true, current: false };
        }
        if (node.id === 'ch4_node_11') {
          return { ...node, current: true };
        }
        return { ...node, current: false };
      })
    );
    return true;
  };

  const completeBrokenArchives = () => {
    if (
      chapterNumber !== 5 ||
      !chapterNodes.find(node => node.id === 'ch5_node_3')?.current
    ) {
      return false;
    }

    setUnlockedResourceSites(previous =>
      previous.includes('royal_archive_stores')
        ? previous
        : [...previous, 'royal_archive_stores']
    );
    setSharedProgress(previous => ({
      ...previous,
      lore: previous.lore.includes('archive_ash_marks')
        ? previous.lore
        : [...previous.lore, 'archive_ash_marks']
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch5_node_3') {
          return { ...node, completed: true, current: false };
        }
        if (node.id === 'ch5_node_4') {
          return { ...node, current: true };
        }
        return { ...node, current: false };
      })
    );
    return true;
  };

  const completeRoyalLedger = () => {
    if (
      chapterNumber !== 5 ||
      !chapterNodes.find(node => node.id === 'ch5_node_5')?.current
    ) {
      return false;
    }

    setSharedProgress(previous => ({
      ...previous,
      lore: previous.lore.includes('ashen_court_identified')
        ? previous.lore
        : [...previous.lore, 'ashen_court_identified']
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch5_node_5') {
          return { ...node, completed: true, current: false };
        }
        if (node.id === 'ch5_node_6') {
          return { ...node, current: true };
        }
        return { ...node, current: false };
      })
    );
    return true;
  };

  const completeGrandCouncil = () => {
    if (
      chapterNumber !== 6 ||
      !chapterNodes.find(node => node.id === 'ch6_node_1')?.current
    ) return false;

    setResources(previous => ({
      ...previous,
      gold: previous.gold + 50,
      provisions: previous.provisions + 30
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch6_node_1') return { ...node, completed: true, current: false };
        if (node.id === 'ch6_node_2') return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const completeConcordVault = () => {
    if (
      chapterNumber !== 6 ||
      !chapterNodes.find(node => node.id === 'ch6_node_3')?.current
    ) return false;

    setUnlockedResourceSites(previous =>
      previous.includes('concord_cache')
        ? previous
        : [...previous, 'concord_cache']
    );
    setSharedProgress(previous => ({
      ...previous,
      lore: previous.lore.includes('shared_concord_beacon')
        ? previous.lore
        : [...previous.lore, 'shared_concord_beacon']
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch6_node_3') return { ...node, completed: true, current: false };
        if (node.id === 'ch6_node_4') return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const completeForcedBeacon = () => {
    if (
      chapterNumber !== 6 ||
      !chapterNodes.find(node => node.id === 'ch6_node_5')?.current
    ) return false;

    setSharedProgress(previous => ({
      ...previous,
      lore: previous.lore.includes('forced_beacon_truth')
        ? previous.lore
        : [...previous.lore, 'forced_beacon_truth']
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch6_node_5') return { ...node, completed: true, current: false };
        if (node.id === 'ch6_node_6') return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const chooseMarcherWarning = (choiceId: MarcherWarningChoiceId) => {
    if (
      chapterNumber !== 3 ||
      marcherWarningChoiceId ||
      !chapterNodes.find(node => node.id === 'ch3_node_5')?.current
    ) {
      return false;
    }

    const choice = marcherWarningChoices.find(option => option.id === choiceId);
    if (!choice) return false;

    setMarcherWarningChoiceId(choiceId);
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch3_node_5') {
          return { ...node, completed: true, current: false };
        }
        if (node.id === 'ch3_node_6') {
          return { ...node, current: true };
        }
        return { ...node, current: false };
      })
    );
    return true;
  };

  const completeDividedMarch = () => {
    if (
      chapterNumber !== 3 ||
      dividedMarchResolved ||
      !chapterNodes.find(node => node.id === 'ch3_node_10')?.current
    ) {
      return false;
    }

    setDividedMarchResolved(true);
    setUnlockedResourceSites(previous =>
      previous.includes('marcher_depot')
        ? previous
        : [...previous, 'marcher_depot']
    );
    setResources(previous => ({
      ...previous,
      gold: previous.gold + 40,
      provisions: previous.provisions + 10
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch3_node_10') {
          return { ...node, completed: true, current: false };
        }
        if (node.id === 'ch3_node_11') {
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
      !chapterNodes.find(node => node.id === 'ch2_node_7')?.current
    ) {
      return false;
    }

    setUnlockedResourceSites(previous => [...previous, 'greenwood_camp']);
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'ch2_node_7') return { ...node, completed: true, current: false };
        if (node.id === 'ch2_node_8') return { ...node, current: true };
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
    const fullStoryClear =
      firstClear && storyDefenseActive;
    const rewardMultiplier =
      getKingdomDefenseRewardMultiplier({
        firstClear: fullStoryClear,
        currentChapter: chapterNumber,
        rewardChapter:
          kingdomDefenseRewardChapter,
        rewardedRunsThisChapter:
          kingdomDefenseRewardedRunsThisChapter
      });
    const reward = fullStoryClear
      ? {
          gold: 85,
          wood: 10,
          stone: 10,
          iron: 4,
          provisions: 6
        }
      : scaleResourceReward(
          {
            gold: 60,
            wood: 8,
            stone: 6,
            iron: 2,
            provisions: 5
          },
          rewardMultiplier
        );

    setKingdomDefenseCompleted(true);
    setKingdomDefenseRuns(previous => previous + 1);

    if (Object.keys(reward).length > 0) {
      setResources(previous =>
        addResources(previous, reward)
      );
    }

    if (!fullStoryClear && rewardMultiplier > 0) {
      setKingdomDefenseRewardChapter(
        chapterNumber
      );
      setKingdomDefenseRewardedRunsThisChapter(
        previous =>
          kingdomDefenseRewardChapter ===
          chapterNumber
            ? previous + 1
            : 1
      );
    }

    if (fullStoryClear || rewardMultiplier > 0) {
      accrueRegionalProduction();
    }

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

  const commitKingdomDefenseReadiness = (
    readiness: number
  ) => {
    setArmyReadiness(
      clampArmyReadiness(readiness)
    );
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

    setResources(previous =>
      payCost(previous, getExpansionCost('human', 'town'))
    );
    setWagonStageId('town');
    setBuildingLevels(previous => ({
      ...previous,
      hall: 4
    }));
    setChapterNumber(3);
    setExpeditionTickets(previous =>
      getExpeditionTicketsAfterChapterTransition(
        previous,
        3
      )
    );
    setChapterNodes(cloneNodes(chapterThreeNodes));
    return true;
  };

  const upgradeToStronghold = () => {
    if (!canUpgradeToStronghold) return false;

    setResources(previous =>
      payCost(previous, getExpansionCost('human', 'stronghold'))
    );
    setWagonStageId('stronghold');
    setBuildingLevels(previous => ({
      ...previous,
      hall: 5
    }));
    setChapterNumber(4);
    setExpeditionTickets(previous =>
      getExpeditionTicketsAfterChapterTransition(
        previous,
        4
      )
    );
    setChapterNodes(cloneNodes(chapterFourNodes));
    setMarcherWarningChoiceId(null);
    return true;
  };

  const upgradeToCapital = () => {
    if (!canUpgradeToCapital) return false;

    setResources(previous =>
      payCost(previous, getExpansionCost('human', 'capital'))
    );
    setWagonStageId('capital');
    setBuildingLevels(previous => ({
      ...previous,
      hall: 6
    }));
    setChapterNumber(5);
    setExpeditionTickets(previous =>
      getExpeditionTicketsAfterChapterTransition(
        previous,
        5
      )
    );
    setChapterNodes(cloneNodes(chapterFiveNodes));
    setLastLoyalistsChoiceId(null);
    return true;
  };

  const chooseFactionMandate = (mandateId: FactionMandateId) => {
    if (
      activeFaction === 'human' ||
      !['capital', 'grand'].includes(currentWagonStage.id)
    ) {
      return false;
    }

    const mandate = factionMandates.find(option => option.id === mandateId);
    if (!mandate) return false;

    const switching = Boolean(
      factionMandateId && factionMandateId !== mandateId
    );
    const cost = switching ? factionMandateSwitchCost : 0;

    if (resources.gold < cost) return false;

    if (cost > 0) {
      setResources(previous => ({
        ...previous,
        gold: previous.gold - cost
      }));
    }

    setFactionMandateId(mandateId);

    const councilId =
      activeFaction === 'elf' ? 'elf6_node_1' : 'orc6_node_1';
    const battleId =
      activeFaction === 'elf' ? 'elf6_node_2' : 'orc6_node_2';

    if (
      chapterNumber === 6 &&
      chapterNodes.find(node => node.id === councilId)?.current
    ) {
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === councilId) {
            return { ...node, completed: true, current: false };
          }
          if (node.id === battleId) {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
    }

    return true;
  };

  const chooseRoyalDecree = (decreeId: RoyalDecreeId) => {
    if (!['capital', 'grand'].includes(currentWagonStage.id)) return false;

    const decree = royalDecrees.find(option => option.id === decreeId);
    if (!decree) return false;

    const switching = Boolean(royalDecreeId && royalDecreeId !== decreeId);
    const cost = switching ? royalDecreeSwitchCost : 0;

    if (resources.gold < cost) return false;

    if (cost > 0) {
      setResources(previous => ({
        ...previous,
        gold: previous.gold - cost
      }));
    }

    setRoyalDecreeId(decreeId);

    if (
      chapterNumber === 5 &&
      chapterNodes.find(node => node.id === 'ch5_node_1')?.current
    ) {
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch5_node_1') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'ch5_node_2') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
    }

    return true;
  };

  const upgradeToGrand = () => {
    if (!canUpgradeToGrand) return false;

    setResources(previous =>
      payCost(previous, getExpansionCost('human', 'grand'))
    );
    setWagonStageId('grand');
    setChapterNumber(6);
    setExpeditionTickets(previous =>
      getExpeditionTicketsAfterChapterTransition(
        previous,
        6
      )
    );
    setChapterNodes(cloneNodes(chapterSixNodes));
    return true;
  };

  const getEquipmentCraftCost = (equipment: EquipmentDefinition) => {
    let multiplier =
      settlementEffects.equipmentCostMultiplier *
      (activeRoyalDecree?.equipmentCostMultiplier ?? 1);
    if (equipment.slot === 'mount') {
      multiplier *= settlementEffects.mountCostMultiplier;
    }
    return applyCostMultiplier(equipment.craftCost, multiplier);
  };

  const craftEquipment = (equipmentId: string) => {
    const activeForgeLevel =
      buildingLevels[factionBuildingIds.forge] ?? 0;
    const activeMountLevel =
      buildingLevels[factionBuildingIds.mount] ?? 0;
    const forgeAvailable =
      activeFaction === 'human'
        ? forgeUnlocked
        : activeForgeLevel > 0;

    if (!forgeAvailable) return false;

    const equipment = getEquipment(equipmentId);
    const forgeLevel = activeForgeLevel;
    const stableLevel = activeMountLevel;

    if (
      !equipment ||
      equipment.faction !== activeFaction ||
      equipment.rarity === 'relic' ||
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

    if (
      !equipment ||
      inventoryIndex < 0 ||
      !unit ||
      equipment.faction !== activeFaction ||
      unit.faction !== activeFaction ||
      !canUnitEquipEquipment(unit, equipment)
    ) return false;

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
    const forgeLevel =
      buildingLevels[factionBuildingIds.forge] ?? 0;
    const stableLevel =
      buildingLevels[factionBuildingIds.mount] ?? 0;
    const unit = units.find(candidate => candidate.id === unitId);

    if (
      !target ||
      !target.upgradeFromId ||
      target.requiredForgeLevel > forgeLevel ||
      (target.requiredStableLevel ?? 0) > stableLevel ||
      !unit ||
      target.faction !== activeFaction ||
      unit.faction !== activeFaction ||
      !canUnitEquipEquipment(unit, target)
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
    if (activeFaction === 'human') {
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'node_4') return { ...node, completed: true, current: false };
          if (node.id === 'node_5') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
    }
    return true;
  };

  const getAdvancedPromotionsForUnit = (unitId: string) => {
    const unit = units.find(candidate => candidate.id === unitId);
    return unit ? getAdvancedPromotionsForClass(unit.className) : [];
  };

  const advancedPromoteUnit = (unitId: string, promotionId: string) => {
    const unit = units.find(candidate => candidate.id === unitId);
    const promotion = advancedPromotions.find(candidate => candidate.id === promotionId);

    if (
      !unit ||
      !promotion ||
      promotion.faction !== activeFaction ||
      unit.faction !== activeFaction ||
      promotion.fromClass !== unit.className
    ) return false;

    const equippedIds = Object.values(unitEquipment[unitId] ?? {}).filter(
      (value): value is string => Boolean(value)
    );

    const meetsGear = promotion.requiredEquippedIds.every(requiredId =>
      equippedIds.some(equippedId =>
        equipmentSatisfiesRequirement(equippedId, requiredId)
      )
    );
    const meetsBuildings =
      (buildingLevels[factionBuildingIds.army] ?? 0) >=
        promotion.requiredBarracksLevel &&
      (buildingLevels[factionBuildingIds.forge] ?? 0) >=
        promotion.requiredForgeLevel &&
      (buildingLevels[factionBuildingIds.mount] ?? 0) >=
        (promotion.requiredStableLevel ?? 0) &&
      (buildingLevels.officer_academy ?? 0) >=
        (promotion.requiredOfficerAcademyLevel ?? 0);

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

    const chapterFourDoctrineMission =
      activeFaction === 'human' &&
      chapterNumber === 4 &&
      Boolean(chapterNodes.find(node => node.id === 'ch4_node_3')?.current);
    const cost = chapterFourDoctrineMission
      ? 0
      : commanderPathId
        ? commanderRespecCost
        : 0;
    if (resources.gold < cost) return false;

    if (cost > 0) {
      setResources(previous => ({
        ...previous,
        gold: previous.gold - cost
      }));
    }

    setCommanderPathId(pathId);

    if (activeFaction === 'human' && chapterNumber === 1) {
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'node_6') return { ...node, current: true };
          return { ...node, current: false };
        })
      );
    } else if (chapterFourDoctrineMission) {
      setChapterNodes(previous =>
        previous.map(node => {
          if (node.id === 'ch4_node_3') {
            return { ...node, completed: true, current: false };
          }
          if (node.id === 'ch4_node_4') {
            return { ...node, current: true };
          }
          return { ...node, current: false };
        })
      );
    }

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

  const placeFormationUnit = (unitId: string, targetSlot: number) => {
    if (!formationCells.includes(targetSlot)) return false;
    const incomingUnit = units.find(unit => unit.id === unitId);
    if (!incomingUnit) return false;

    const sourceSlot = formation.indexOf(unitId);
    const targetUnitId = formation[targetSlot] ?? null;
    const targetUnit = targetUnitId
      ? units.find(unit => unit.id === targetUnitId) ?? null
      : null;

    if (sourceSlot === targetSlot) return false;

    if (sourceSlot < 0) {
      const incomingCapacity =
        incomingUnit.deploymentCapacity ?? 1;
      const replacedCapacity =
        targetUnit?.deploymentCapacity ?? 0;
      const nextCapacity =
        activeDeploymentCapacity -
        replacedCapacity +
        incomingCapacity;

      if (nextCapacity > activeSquadCap) {
        return false;
      }
    }

    setFormation(previous => {
      const next = [...previous];
      const liveSource = next.indexOf(unitId);
      const liveTarget = next[targetSlot] ?? null;

      if (liveSource >= 0) {
        next[liveSource] = liveTarget;
      }
      next[targetSlot] = unitId;
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

  const setFormationShape = (shapeId: FormationShapeId) => {
    const shape = formationShapes.find(candidate => candidate.id === shapeId);
    if (!shape) return false;
    const currentRank = stageRank[currentWagonStage.id] ?? 0;
    if (currentRank < formationShapeUnlockRank[shape.unlock]) return false;
    setFormation(previous =>
      reflowFormationToShape(previous, units, shapeId)
    );
    setFormationShapeIdState(shapeId);
    return true;
  };

  const setFormationDoctrine = (doctrineId: string) => {
    if (!formationDoctrines.some(doctrine => doctrine.id === doctrineId)) return false;
    setFormationDoctrineId(doctrineId);
    return true;
  };

  const saveFormationPreset = (slotId: FormationPresetSlotId) => {
    if (![1, 2, 3].includes(slotId)) return false;
    if (!formation.some(Boolean)) return false;

    const activeUnitIds = formation.filter(
      (unitId): unitId is string =>
        Boolean(unitId)
    );
    const preset: FormationPreset = {
      slotId,
      formationShapeId,
      formationDoctrineId,
      formation: Array.from(
        { length: 9 },
        (_, index) => formation[index] ?? null
      ),
      unitEquipment: Object.fromEntries(
        activeUnitIds.map(unitId => [
          unitId,
          {
            ...(unitEquipment[unitId] ?? {})
          }
        ])
      )
    };

    setFormationPresets(previous =>
      [
        ...previous.filter(candidate => candidate.slotId !== slotId),
        preset
      ].sort((a, b) => a.slotId - b.slotId)
    );
    return true;
  };

  const applyFormationPreset = (slotId: FormationPresetSlotId) => {
    const preset = formationPresets.find(
      candidate => candidate.slotId === slotId
    );
    if (!preset) return false;

    const currentRank = stageRank[currentWagonStage.id] ?? 0;
    const shape = formationShapes.find(
      candidate => candidate.id === preset.formationShapeId
    );
    const doctrine = formationDoctrines.find(
      candidate => candidate.id === preset.formationDoctrineId
    );

    if (
      !shape ||
      !doctrine ||
      currentRank < formationShapeUnlockRank[shape.unlock] ||
      currentRank < formationShapeUnlockRank[doctrine.unlock]
    ) {
      return false;
    }

    const unitById = new Map(
      units.map(unit => [unit.id, unit])
    );
    const seenUnitIds = new Set<string>();
    let usedCapacity = 0;
    const nextFormation = Array.from(
      { length: 9 },
      (_, index) => {
        const unitId = preset.formation[index] ?? null;
        const unit = unitId
          ? unitById.get(unitId) ?? null
          : null;
        const unitCapacity =
          unit?.deploymentCapacity ?? 1;

        if (
          !unitId ||
          !unit ||
          seenUnitIds.has(unitId) ||
          usedCapacity + unitCapacity > activeSquadCap
        ) {
          return null;
        }

        seenUnitIds.add(unitId);
        usedCapacity += unitCapacity;
        return unitId;
      }
    );

    if (usedCapacity === 0) return false;

    if (preset.unitEquipment) {
      const appliedEquipment =
        applyArmyLoadoutEquipment({
          units,
          targetFormation: nextFormation,
          savedUnitEquipment:
            preset.unitEquipment,
          currentUnitEquipment:
            unitEquipment,
          equipmentInventory
        });

      setUnitEquipment(
        appliedEquipment.unitEquipment
      );
      setEquipmentInventory(
        appliedEquipment.equipmentInventory
      );
      setUnits(appliedEquipment.units);
    }

    setFormationShapeIdState(shape.id);
    setFormationDoctrineId(doctrine.id);
    setFormation(nextFormation);
    return true;
  };

  const clearFormationPreset = (slotId: FormationPresetSlotId) => {
    if (!formationPresets.some(candidate => candidate.slotId === slotId)) {
      return false;
    }

    setFormationPresets(previous =>
      previous.filter(candidate => candidate.slotId !== slotId)
    );
    return true;
  };

  const isSideModeUnlocked = (id: SideModeId) => {
    const completedNodes =
      chapterNodes.filter(node => node.completed).length;

    if (id === 'war_table') {
      if (chapterNumber > 1) return true;
      return activeFaction === 'human'
        ? mercenaryPatrolWon
        : completedNodes >= 3;
    }

    if (id === 'formation_trials') {
      return chapterNumber >= 2;
    }

    if (id === 'kingdom_defense') {
      return activeFaction === 'human'
        ? kingdomDefenseCompleted
        : chapterNumber >= 3;
    }

    if (id === 'expeditions') {
      return chapterNumber >= 3;
    }

    if (id === 'sieges') {
      if (chapterNumber > 3) return true;
      return (
        chapterNumber === 3 &&
        completedNodes >= 3
      );
    }

    if (id === 'relic_hunts') {
      return (
        chapterNumber >= 4 &&
        unlockedFantasyClasses.length > 0
      );
    }

    return false;
  };

  const refreshWarTableBoard = () => {
    const postedContracts =
      getWarTablePostedContracts({
        cycle: warTableCycle,
        boardChapter: warTableBoardChapter
      });

    if (
      !isSideModeUnlocked('war_table') ||
      !isWarTableBoardCleared({
        postedContracts,
        completedContractIds:
          warTableCompletedContractIds
      })
    ) {
      return false;
    }

    setWarTableCycle(
      previous => previous + 1
    );
    if (chapterNumber !== warTableBoardChapter) {
      setWarTableBoardsClearedThisChapter(0);
    }
    setWarTableBoardChapter(chapterNumber);
    setWarTableCompletedContractIds([]);
    setWarTableBonusContractIds([]);
    return true;
  };

  const consumeExpeditionTicket = () => {
    if (
      activeExpeditionRun ||
      !isSideModeUnlocked('expeditions') ||
      expeditionTickets <= 0
    ) {
      return false;
    }

    setExpeditionTickets(previous => previous - 1);
    return true;
  };

  const startExpeditionRun = () => {
    if (
      !isSideModeUnlocked('expeditions') ||
      activeExpeditionRun
    ) {
      return false;
    }

    const rewardMultiplier =
      getExpeditionRewardMultiplier({
        currentChapter: chapterNumber,
        rewardChapter: expeditionRewardChapter,
        rewardedRunsThisChapter:
          expeditionRewardedRunsThisChapter
      });

    if (
      rewardMultiplier > 0 &&
      !consumeExpeditionTicket()
    ) {
      return false;
    }

    setActiveExpeditionRun(
      createExpeditionRun({
        readiness: armyReadiness,
        supplies:
          expeditionPreparation.initialSupplies,
        basePower: expeditionBasePower,
        playerShapeId: formationShapeId,
        wagonStageId: currentWagonStage.id,
        hasRations:
          expeditionPreparation.hasRations,
        hasMedicine:
          expeditionPreparation.hasMedicine,
        baseReward: expeditionBaseReward,
        rewardMultiplier
      })
    );
    return true;
  };

  const resolveExpeditionRouteChoice = (
    choiceId: string
  ) => {
    if (!activeExpeditionRun) return false;

    const result = resolveExpeditionChoice({
      faction: activeFaction,
      run: activeExpeditionRun,
      choiceId
    });

    if (!result.ok) return false;

    setActiveExpeditionRun(result.state);

    if (result.combat) {
      setArmyReadiness(
        clampArmyReadiness(
          result.state.readiness
        )
      );
    }

    return true;
  };

  const abandonExpeditionRun = () => {
    setActiveExpeditionRun(null);
  };

  const finishExpedition = () => {
    if (
      !activeExpeditionRun ||
      !activeExpeditionRun.completed ||
      activeExpeditionRun.failed
    ) {
      return false;
    }

    const reward =
      getExpeditionCompletionReward(
        activeExpeditionRun
      );

    setExpeditionRunsCompleted(
      previous => previous + 1
    );

    if (activeExpeditionRun.rewardMultiplier > 0) {
      setExpeditionRewardChapter(
        chapterNumber
      );
      setExpeditionRewardedRunsThisChapter(
        previous =>
          expeditionRewardChapter === chapterNumber
            ? previous + 1
            : 1
      );
      accrueRegionalProduction();
      setResources(previous =>
        addResources(previous, reward)
      );
    }

    setArmyReadiness(
      clampArmyReadiness(
        activeExpeditionRun.readiness
      )
    );
    setActiveExpeditionRun(null);
    return true;
  };

  const startSiegeRun = () => {
    if (
      !isSideModeUnlocked('sieges') ||
      activeSiegeRun
    ) {
      return false;
    }

    const rewardMultiplier =
      getSiegeRewardMultiplier({
        currentChapter: chapterNumber,
        rewardChapter: siegeRewardChapter,
        rewardedRunsThisChapter:
          siegeRewardedRunsThisChapter
      });

    setActiveSiegeRun(
      createSiegeRun({
        readiness: armyReadiness,
        supplies:
          siegePreparation.initialSupplies,
        basePower: expeditionBasePower,
        preparationMultiplier:
          siegePreparation.powerMultiplier,
        playerShapeId: formationShapeId,
        wagonStageId: currentWagonStage.id,
        engineering:
          siegePreparation.engineering,
        permanentIntel:
          siegePreparation.permanentIntel,
        hasRations:
          siegePreparation.hasRations,
        hasMedicine:
          siegePreparation.hasMedicine,
        rewardMultiplier
      })
    );

    return true;
  };

  const resolveSiegeStageChoice = (
    choiceId: string
  ) => {
    if (!activeSiegeRun) return false;

    const result =
      resolveSiegeChoice({
        run: activeSiegeRun,
        choiceId
      });

    if (!result.ok) return false;

    setActiveSiegeRun(result.state);
    setArmyReadiness(
      clampArmyReadiness(
        result.state.readiness
      )
    );
    return true;
  };

  const abandonSiegeRun = () => {
    setActiveSiegeRun(null);
  };

  const finishSiegeRun = () => {
    if (
      !activeSiegeRun ||
      !activeSiegeRun.completed ||
      activeSiegeRun.failed
    ) {
      return false;
    }

    const reward =
      getSiegeReward(
        activeSiegeRun.rewardMultiplier
      );

    setSiegeRunsCompleted(
      previous => previous + 1
    );

    if (
      activeSiegeRun.rewardMultiplier > 0
    ) {
      setSiegeRewardChapter(
        chapterNumber
      );
      setSiegeRewardedRunsThisChapter(
        previous =>
          siegeRewardChapter === chapterNumber
            ? previous + 1
            : 1
      );
      accrueRegionalProduction();
      setResources(previous =>
        addResources(previous, reward)
      );
    }

    setArmyReadiness(
      clampArmyReadiness(
        activeSiegeRun.readiness
      )
    );
    setActiveSiegeRun(null);
    return true;
  };

  const startRelicHuntRun = () => {
    if (
      !isSideModeUnlocked('relic_hunts') ||
      activeRelicHuntRun
    ) {
      return false;
    }

    setActiveRelicHuntRun(
      createRelicHuntRun({
        readiness: armyReadiness,
        basePower: expeditionBasePower,
        playerShapeId: formationShapeId,
        wagonStageId: currentWagonStage.id,
        affinities: relicAffinitySnapshot
      })
    );
    return true;
  };

  const resolveRelicHuntStage = () => {
    if (!activeRelicHuntRun) return false;

    const result = resolveRelicGuardian({
      faction: activeFaction,
      run: activeRelicHuntRun
    });

    if (!result.ok) return false;

    setActiveRelicHuntRun(result.state);
    setArmyReadiness(
      clampArmyReadiness(
        result.state.readiness
      )
    );
    return true;
  };

  const abandonRelicHuntRun = () => {
    setActiveRelicHuntRun(null);
  };

  const finishRelicHuntRun = () => {
    if (
      !activeRelicHuntRun ||
      !activeRelicHuntRun.completed ||
      activeRelicHuntRun.failed
    ) {
      return false;
    }

    setRelicHuntRunsCompleted(
      previous => previous + 1
    );

    if (!relicHuntRewardClaimed) {
      const reward =
        relicRewards[activeFaction];

      setEquipmentInventory(previous =>
        previous.includes(reward.artifactId)
          ? previous
          : [
              ...previous,
              reward.artifactId
            ]
      );

      setSharedProgress(previous => ({
        ...previous,
        cosmetics: previous.cosmetics.includes(
          reward.cosmeticId
        )
          ? previous.cosmetics
          : [
              ...previous.cosmetics,
              reward.cosmeticId
            ],
        lore: previous.lore.includes(
          reward.loreId
        )
          ? previous.lore
          : [
              ...previous.lore,
              reward.loreId
            ]
      }));

      setRelicHuntRewardClaimed(true);
    }

    setArmyReadiness(
      clampArmyReadiness(
        activeRelicHuntRun.readiness
      )
    );
    setActiveRelicHuntRun(null);
    return true;
  };

  const completeKingdomTrial = (
    trialId: KingdomTrialId
  ) => {
    if (!isSideModeUnlocked('formation_trials')) {
      return false;
    }

    if (
      kingdomTrialCompletions.includes(trialId) ||
      !isKingdomTrialUnlocked(
        trialId,
        kingdomTrialCompletions,
        chapterNumber
      )
    ) {
      return false;
    }

    const evaluation = evaluateKingdomTrial(
      trialId,
      {
        faction: activeFaction,
        formation,
        formationShapeId,
        formationDoctrineId
      }
    );

    if (!evaluation.passed) return false;

    setKingdomTrialCompletions(previous => [
      ...previous,
      trialId
    ]);

    if (trialId === 'bronze') {
      setFormationTrialCompleted(true);
    }

    setResources(previous =>
      addResources(
        previous,
        evaluation.reward
      )
    );

    return true;
  };

  const completeFormationTrial = () =>
    completeKingdomTrial('bronze');

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

    if (!rewardedAdInFlightRef.current.tryStart(placementId)) {
      setRewardedAdMessage('Reward request already in progress.');
      return { status: 'unavailable', provider: 'none' };
    }
    let result: RewardedAdResult;
    try {
      result = await showRewardedAd(placementId);
    } finally {
      rewardedAdInFlightRef.current.finish(placementId);
    }

    if (result.status !== 'rewarded') {
      setRewardedAdMessage('Rewarded ads are not configured in this build yet.');
      return result;
    }

    if (placementId === 'daily_supply') {
      const quartermasterBonus =
        (buildingLevels[factionBuildingIds.supply] ?? 0) >= 2
          ? 5
          : 0;
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
      setExpeditionTickets(previous =>
        Math.min(
          MAX_EXPEDITION_TICKETS,
          previous + 1
        )
      );
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

  const getRemainingResearchHours = (
    research: ResearchDefinition,
    progress: ResearchProgressState
  ) => {
    const elapsedHours =
      progress.startedAt === null
        ? 0
        : Math.max(
            0,
            (Date.now() - progress.startedAt) /
              (60 * 60 * 1000)
          );

    return getResearchRemainingHours(
      research,
      elapsedHours,
      progress.rewardedAdsWatched
    );
  };

  const markFantasyResearchComplete = (
    research: ResearchDefinition
  ) => {
    setResearchProgress(previous => {
      const existing = previous[research.id] ?? {
        startedAt: Date.now(),
        rewardedAdsWatched: 0,
        completed: false
      };
      return {
        ...previous,
        [research.id]: {
          ...existing,
          completed: true
        }
      };
    });
    setUnlockedFantasyClasses(previous => [
      ...new Set([
        ...previous,
        ...research.unlocksClasses
      ])
    ]);
  };

  const startFantasyResearch = (researchId: string) => {
    const research = factionFantasyResearchDefinitions.find(
      candidate => candidate.id === researchId
    );
    if (!research) return false;

    const existing = researchProgress[research.id];
    if (existing?.completed || existing?.startedAt) {
      return false;
    }

    if (
      !canStartResearch(
        research,
        fantasyProgressionChapter,
        completedStoryGates
      )
    ) {
      return false;
    }

    if (
      research.family === 'hybrid' &&
      !hybridPrerequisitesMet
    ) {
      return false;
    }

    const anotherResearchActive =
      factionFantasyResearchDefinitions.some(candidate => {
        if (candidate.id === research.id) return false;
        const progress = researchProgress[candidate.id];
        if (
          !progress ||
          progress.completed ||
          progress.startedAt === null
        ) {
          return false;
        }
        return getRemainingResearchHours(
          candidate,
          progress
        ) > 0;
      });

    if (anotherResearchActive) return false;

    setResearchProgress(previous => ({
      ...previous,
      [research.id]: {
        startedAt: Date.now(),
        rewardedAdsWatched: 0,
        completed: false
      }
    }));
    return true;
  };

  const claimFantasyResearch = (researchId: string) => {
    const research = factionFantasyResearchDefinitions.find(
      candidate => candidate.id === researchId
    );
    const progress = research
      ? researchProgress[research.id]
      : null;

    if (!research || !progress) return false;
    if (progress.completed) return true;
    if (progress.startedAt === null) return false;
    if (getRemainingResearchHours(research, progress) > 0) {
      return false;
    }

    markFantasyResearchComplete(research);
    return true;
  };

  const watchFantasyResearchAd = async (
    researchId: string
  ): Promise<RewardedAdResult> => {
    const research = factionFantasyResearchDefinitions.find(
      candidate => candidate.id === researchId
    );
    const progress = research
      ? researchProgress[research.id]
      : null;

    if (
      !research ||
      !progress ||
      progress.completed ||
      progress.startedAt === null ||
      progress.rewardedAdsWatched >=
        research.rewardedAdsToComplete
    ) {
      return { status: 'unavailable', provider: 'none' };
    }

    const result = await claimRewardedAd(
      'fantasy_research'
    );
    if (result.status !== 'rewarded') return result;

    const nextAds = Math.min(
      research.rewardedAdsToComplete,
      progress.rewardedAdsWatched + 1
    );

    setResearchProgress(previous => ({
      ...previous,
      [research.id]: {
        ...(previous[research.id] ?? progress),
        rewardedAdsWatched: nextAds,
        completed:
          nextAds >= research.rewardedAdsToComplete
      }
    }));

    if (nextAds >= research.rewardedAdsToComplete) {
      setUnlockedFantasyClasses(previous => [
        ...new Set([
          ...previous,
          ...research.unlocksClasses
        ])
      ]);
    }

    return result;
  };

  const finishFantasyResearchWithGems = (
    researchId: string
  ) => {
    const research = factionFantasyResearchDefinitions.find(
      candidate => candidate.id === researchId
    );
    const progress = research
      ? researchProgress[research.id]
      : null;

    if (!research || !progress) return false;
    if (progress.completed) return true;
    if (progress.startedAt === null) return false;

    const remainingHours = getRemainingResearchHours(
      research,
      progress
    );
    const cost = getResearchGemFinishCost(
      research,
      remainingHours
    );

    if ((sharedProgress.gems ?? 0) < cost) {
      return false;
    }

    setSharedProgress(previous => ({
      ...previous,
      gems: Math.max(0, (previous.gems ?? 0) - cost)
    }));
    markFantasyResearchComplete(research);
    return true;
  };

  const recruitFantasyUnit = (templateId: string) => {
    const template = [
      ...fantasyRecruitOptions,
      ...flyingRecruitOptions,
      ...largeRecruitOptions,
      ...hybridRecruitOptions
    ].find(
      candidate => candidate.id === templateId
    );
    if (!template) return false;
    if (
      !unlockedFantasyClasses.includes(
        template.className
      )
    ) {
      return false;
    }
    if (!canAfford(resources, template.cost)) {
      return false;
    }

    const nextSerial = fantasyRecruitSerial + 1;
    const slug = template.className
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const unit: UnitDefinition = {
      id:
        activeFaction +
        '_' +
        slug +
        '_' +
        nextSerial,
      name:
        template.className +
        ' Cohort ' +
        nextSerial,
      className: template.className,
      faction: activeFaction,
      role: template.role,
      tier: template.tier,
      level: template.level,
      hp: template.hp,
      attack: template.attack,
      armor: template.armor,
      speed: template.speed,
      battleTags: [...template.battleTags],
      deploymentCapacity: template.deploymentCapacity ?? 1
    };

    setResources(previous =>
      payCost(previous, template.cost)
    );
    setUnits(previous => [...previous, unit]);
    setFantasyRecruitSerial(nextSerial);
    return true;
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
      armyReadiness,
      armyResupplyCost,
      chapterNumber,
      chapterNodes,
      activeFaction,
      completedCampaigns,
      campaignAvailability,
      metaCampaignStep,
      metaCampaignComplete,
      metaCampaignUnlocked,
      hasFactionState,
      switchFaction,
      flushSnapshot,
      tutorialSeen,
      markTutorialSeen,
      resetTutorialGuidance,
      reviewPromptShown,
      markReviewPromptShown,
      gems,
      completedStoryGates,
      researchProgress,
      unlockedFantasyClasses,
      magicFamilyUnlock,
      magicResearchDefinitions,
      fantasyRecruitOptions,
      flyingFamilyUnlock,
      flyingResearchDefinitions,
      flyingRecruitOptions,
      largeFamilyUnlock,
      largeResearchDefinitions,
      largeRecruitOptions,
      hybridFamilyUnlock,
      hybridResearchDefinitions,
      hybridRecruitOptions,
      hybridPrerequisitesMet,
      fantasyProgressionChapter,
      formationShapeId,
      formationShapes,
      activeFormationShape,
      formationPresets,
      formationDoctrineId,
      formationDoctrines,
      formationBonuses,
      formationAnalysis,
      activeSquadCap,
      activeDeploymentCapacity,
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
      strongholdMusterOptions,
      sixthRecruitChosen,
      marcherWarningChoices,
      marcherWarningChoiceId,
      activeMarcherWarningChoice,
      dividedMarchResolved,
      lordMarshalWon,
      lastLoyalistChoices,
      lastLoyalistsChoiceId,
      activeLastLoyalistsChoice,
      pretenderGeneralWon,
      royalDecrees,
      royalDecreeId,
      activeRoyalDecree,
      royalDecreeSwitchCost,
      factionMandates,
      factionMandateId,
      activeFactionMandate,
      factionMandateSwitchCost,
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
      strongholdUpgradeAvailable,
      canUpgradeToStronghold,
      capitalUpgradeAvailable,
      canUpgradeToCapital,
      grandUpgradeAvailable,
      canUpgradeToGrand,
      canUpgradeToFort,
      lastBattleResult,
      canUpgradeSettlement,
      factionFortUpgradeAvailable,
      canUpgradeFactionFort,
      factionTownUpgradeAvailable,
      canUpgradeFactionTown,
      factionStrongholdUpgradeAvailable,
      canUpgradeFactionStronghold,
      factionCapitalUpgradeAvailable,
      canUpgradeFactionCapital,
      factionFourthRecruitOptions,
      factionFifthRecruitOptions,
      factionFifthRecruitChosen,
      factionBuildingIds,
      sideModeDefinitions: sideModes,
      expeditionTickets,
      expeditionRunsCompleted,
      activeExpeditionRun,
      expeditionRewardChapter,
      expeditionRewardedRunsThisChapter,
      expeditionNextRewardMultiplier,
      warTableCycle,
      warTableBoardChapter,
      warTableCompletedContractIds,
      warTableBonusContractIds,
      warTableContractsCompleted,
      warTableBonusObjectivesCompleted,
      warTableBoardsClearedThisChapter,
      warTableBoardRewardMultiplier,
      kingdomDefenseRewardChapter,
      kingdomDefenseRewardedRunsThisChapter,
      kingdomDefenseNextRewardMultiplier,
      siegeRunsCompleted,
      activeSiegeRun,
      siegeRewardChapter,
      siegeRewardedRunsThisChapter,
      siegeNextRewardMultiplier,
      relicHuntRunsCompleted,
      activeRelicHuntRun,
      relicHuntRewardClaimed,
      relicCollectionClaimedFactions,
      formationTrialCompleted,
      kingdomTrialCompletions,
      rewardedAdClaims,
      rewardedAdMessage,
      finishEncounter,
      recordBattleWear,
      restAndResupplyArmy,
      completeFactionChapterOneEvent,
      completeFactionChapterTwoEvent,
      completeFactionChapterThreeEvent,
      completeFactionChapterFourEvent,
      completeFactionChapterFiveEvent,
      completeFactionChapterSixEvent,
      completeMetaCouncil,
      completeMetaConcordChamber,
      completeMarkedRaiders,
      completeRefugeeCamp,
      upgradeSettlement,
      upgradeToFort,
      upgradeFactionToFort,
      upgradeFactionToTown,
      upgradeFactionToStronghold,
      upgradeFactionToCapital,
      constructBuilding,
      moveBuilding,
      upgradeBuilding,
      isBuildingUnlocked,
      chooseRecruit,
      chooseFactionFourthRecruit,
      chooseFactionFifthRecruit,
      chooseFortRecruit,
      chooseMarcherAuxiliary,
      chooseStrongholdRecruit,
      completeEmptyThrone,
      chooseLastLoyalistsApproach,
      chooseFactionMandate,
      completeBrokenArchives,
      completeRoyalLedger,
      completeGrandCouncil,
      completeConcordVault,
      completeForcedBeacon,
      chooseMarcherWarning,
      completeDividedMarch,
      unlockTimberCamp,
      claimProduction,
      completeKingdomDefense,
      commitKingdomDefenseReadiness,
      completeBrokenSignalTower,
      upgradeToTown,
      upgradeToStronghold,
      upgradeToCapital,
      upgradeToGrand,
      chooseRoyalDecree,
      getEquipmentCraftCost,
      craftEquipment,
      equipEquipment,
      upgradeEquippedItem,
      promoteMira,
      advancedPromoteUnit,
      getAdvancedPromotionsForUnit,
      chooseCommanderPath,
      moveFormationUnit,
      placeFormationUnit,
      moveWagonItem,
      rotateWagonItem,
      resetWagon,
      setFormationShape,
      setFormationDoctrine,
      saveFormationPreset,
      applyFormationPreset,
      clearFormationPreset,
      isSideModeUnlocked,
      refreshWarTableBoard,
      consumeExpeditionTicket,
      startExpeditionRun,
      resolveExpeditionRouteChoice,
      abandonExpeditionRun,
      finishExpedition,
      startSiegeRun,
      resolveSiegeStageChoice,
      abandonSiegeRun,
      finishSiegeRun,
      startRelicHuntRun,
      resolveRelicHuntStage,
      abandonRelicHuntRun,
      finishRelicHuntRun,
      completeFormationTrial,
      completeKingdomTrial,
      claimRewardedAd,
      startFantasyResearch,
      claimFantasyResearch,
      watchFantasyResearchAd,
      finishFantasyResearchWithGems,
      recruitFantasyUnit,
      completeCampaign,
      recruitOptions
    }),
    [
      resources,
      units,
      formation,
      wagonItems,
      currentWagonStage,
      armyReadiness,
      armyResupplyCost,
      chapterNumber,
      chapterNodes,
      activeFaction,
      completedCampaigns,
      campaignAvailability,
      metaCampaignStep,
      metaCampaignComplete,
      metaCampaignUnlocked,
      flushSnapshot,
      tutorialSeen,
      reviewPromptShown,
      gems,
      completedStoryGates,
      researchProgress,
      unlockedFantasyClasses,
      magicFamilyUnlock,
      magicResearchDefinitions,
      fantasyRecruitOptions,
      flyingFamilyUnlock,
      flyingResearchDefinitions,
      flyingRecruitOptions,
      largeFamilyUnlock,
      largeResearchDefinitions,
      largeRecruitOptions,
      hybridFamilyUnlock,
      hybridResearchDefinitions,
      hybridRecruitOptions,
      hybridPrerequisitesMet,
      fantasyProgressionChapter,
      factionFantasyResearchDefinitions,
      fantasyRecruitSerial,
      formationShapeId,
      activeFormationShape,
      formationPresets,
      formationDoctrineId,
      formationDoctrines,
      formationBonuses,
      formationAnalysis,
      activeSquadCap,
      activeDeploymentCapacity,
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
      strongholdUpgradeAvailable,
      canUpgradeToStronghold,
      capitalUpgradeAvailable,
      canUpgradeToCapital,
      grandUpgradeAvailable,
      canUpgradeToGrand,
      canUpgradeToFort,
      lastBattleResult,
      canUpgradeSettlement,
      factionFortUpgradeAvailable,
      canUpgradeFactionFort,
      factionTownUpgradeAvailable,
      canUpgradeFactionTown,
      factionStrongholdUpgradeAvailable,
      canUpgradeFactionStronghold,
      factionCapitalUpgradeAvailable,
      canUpgradeFactionCapital,
      factionFourthRecruitOptions,
      factionFifthRecruitOptions,
      factionFifthRecruitChosen,
      factionBuildingIds,
      expeditionTickets,
      expeditionRunsCompleted,
      activeExpeditionRun,
      expeditionRewardChapter,
      expeditionRewardedRunsThisChapter,
      expeditionNextRewardMultiplier,
      warTableCycle,
      warTableBoardChapter,
      warTableCompletedContractIds,
      warTableBonusContractIds,
      warTableContractsCompleted,
      warTableBonusObjectivesCompleted,
      warTableBoardsClearedThisChapter,
      warTableBoardRewardMultiplier,
      kingdomDefenseRewardChapter,
      kingdomDefenseRewardedRunsThisChapter,
      kingdomDefenseNextRewardMultiplier,
      siegeRunsCompleted,
      activeSiegeRun,
      siegeRewardChapter,
      siegeRewardedRunsThisChapter,
      siegeNextRewardMultiplier,
      relicHuntRunsCompleted,
      activeRelicHuntRun,
      relicHuntRewardClaimed,
      relicCollectionClaimedFactions,
      formationTrialCompleted,
      kingdomTrialCompletions,
      rewardedAdClaims,
      rewardedAdMessage,
      recruitOptions
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
