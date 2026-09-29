import type { RelicHuntRunState } from '../game/relicHunts';
import type { SiegeRunState } from '../game/sieges';
import type { ExpeditionRunState } from '../game/expeditions';
import type {
  BattleResult,
  ChapterNode,
  FactionId,
  FormationPreset,
  FormationShapeId,
  ResourceWallet,
  UnitDefinition,
  UnitEquipmentLoadout,
  WagonItemDefinition
} from '../game/types';

export type SaveSlotId = 1 | 2;

export type ResearchProgressState = {
  startedAt: number | null;
  rewardedAdsWatched: number;
  completed: boolean;
};

export type FactionGameState = {
  faction: FactionId;
  chapterNumber: number;
  resources: ResourceWallet;
  units: UnitDefinition[];
  formation: Array<string | null>;
  formationShapeId?: FormationShapeId;
  formationPresets?: FormationPreset[];
  wagonItems: WagonItemDefinition[];
  wagonStageId: string;
  armyReadiness?: number;
  chapterNodes: ChapterNode[];
  formationDoctrineId: string;
  holdTheRoadWon: boolean;
  settlementUpgraded: boolean;
  recruitChoiceAvailable: boolean;
  recruitChosen: boolean;
  markedRaidersInvestigated: boolean;
  forgeUnlocked: boolean;
  firstPromotionComplete: boolean;
  equipmentInventory: string[];
  unitEquipment: Record<string, UnitEquipmentLoadout>;
  mercenaryPatrolWon: boolean;
  commanderChoiceUnlocked: boolean;
  commanderPathId: string | null;
  refugeeCampSecured: boolean;
  buildingLevels: Record<string, number>;
  buildingPlacements: Record<string, string | null>;
  fourthRecruitChoiceAvailable: boolean;
  fourthRecruitChosen: boolean;
  unlockedResourceSites: string[];
  productionStock: ResourceWallet;
  kingdomDefenseCompleted: boolean;
  kingdomDefenseRuns: number;
  signalTowerUnlocked: boolean;
  ironProvostWon: boolean;
  marcherWarningChoiceId: string | null;
  dividedMarchResolved: boolean;
  lordMarshalWon: boolean;
  lastLoyalistsChoiceId: string | null;
  pretenderGeneralWon: boolean;
  royalDecreeId: string | null;
  factionMandateId: string | null;
  lastBattleResult: BattleResult | null;
  expeditionTickets: number;
  expeditionRunsCompleted: number;
  activeExpeditionRun?: ExpeditionRunState | null;
  expeditionRewardChapter: number;
  expeditionRewardedRunsThisChapter: number;
  warTableCycle: number;
  warTableBoardChapter: number;
  warTableCompletedContractIds: string[];
  warTableBonusContractIds: string[];
  warTableContractsCompleted: number;
  warTableBonusObjectivesCompleted: number;
  warTableBoardsClearedThisChapter: number;
  kingdomDefenseRewardChapter: number;
  kingdomDefenseRewardedRunsThisChapter: number;
  siegeRunsCompleted: number;
  activeSiegeRun?: SiegeRunState | null;
  siegeRewardChapter: number;
  siegeRewardedRunsThisChapter: number;
  relicHuntRunsCompleted: number;
  activeRelicHuntRun?: RelicHuntRunState | null;
  relicHuntRewardClaimed: boolean;
  formationTrialCompleted: boolean;
  kingdomTrialCompletions?: string[];
  completedStoryGates?: string[];
  researchProgress?: Record<string, ResearchProgressState>;
  unlockedFantasyClasses?: string[];
  fantasyRecruitSerial?: number;
  tutorialSeen?: string[];
};

export type SharedProgress = {
  completedCampaigns: FactionId[];
  achievements: string[];
  lore: string[];
  cosmetics: string[];
  metaCampaignStep: number;
  metaCampaignComplete: boolean;
  gems?: number;
  reviewPromptShown?: boolean;
};

export type GameSnapshot = {
  schemaVersion: 13;
  activeFaction: FactionId;
  shared: SharedProgress;
  factionStates: Record<FactionId, FactionGameState | null>;
};

export type SaveSlotMetadata = {
  slotId: SaveSlotId;
  createdAt: string;
  updatedAt: string;
  faction: FactionId;
  kingdomName: string;
  chapterLabel: string;
  activeSquads: number;
  humanCampaignComplete: boolean;
  elfCampaignUnlocked: boolean;
  orcCampaignUnlocked: boolean;
};

export type SaveRecord = {
  metadata: SaveSlotMetadata;
  snapshot: GameSnapshot;
};
