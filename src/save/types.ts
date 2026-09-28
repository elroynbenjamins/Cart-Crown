import type {
  BattleResult,
  ChapterNode,
  FactionId,
  FormationShapeId,
  ResourceWallet,
  UnitDefinition,
  UnitEquipmentLoadout,
  WagonItemDefinition
} from '../game/types';

export type SaveSlotId = 1 | 2;

export type FactionGameState = {
  faction: FactionId;
  chapterNumber: number;
  resources: ResourceWallet;
  units: UnitDefinition[];
  formation: Array<string | null>;
  formationShapeId?: FormationShapeId;
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
  formationTrialCompleted: boolean;
};

export type SharedProgress = {
  completedCampaigns: FactionId[];
  achievements: string[];
  lore: string[];
  cosmetics: string[];
  metaCampaignStep: number;
  metaCampaignComplete: boolean;
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
