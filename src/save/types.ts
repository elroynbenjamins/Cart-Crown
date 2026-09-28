import type {
  BattleResult,
  ChapterNode,
  FactionId,
  ResourceWallet,
  UnitDefinition,
  WagonItemDefinition
} from '../game/types';

export type SaveSlotId = 1 | 2 | 3;

export type GameSnapshot = {
  schemaVersion: 1;
  resources: ResourceWallet;
  units: UnitDefinition[];
  formation: Array<string | null>;
  wagonItems: WagonItemDefinition[];
  wagonStageId: string;
  chapterNodes: ChapterNode[];
  activeFaction: FactionId;
  completedCampaigns: FactionId[];
  formationDoctrineId: string;
  holdTheRoadWon: boolean;
  settlementUpgraded: boolean;
  recruitChoiceAvailable: boolean;
  recruitChosen: boolean;
  lastBattleResult: BattleResult | null;
  expeditionTickets: number;
  expeditionRunsCompleted: number;
  formationTrialCompleted: boolean;
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
