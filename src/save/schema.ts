import {
  chapterOneNodes,
  starterResources,
  starterUnits,
  starterWagonItems
} from '../game/data';
import type {
  BattleResult,
  ChapterNode,
  FactionId,
  ResourceWallet,
  UnitDefinition,
  WagonItemDefinition
} from '../game/types';
import type {
  FactionGameState,
  GameSnapshot,
  SaveRecord,
  SaveSlotId,
  SaveSlotMetadata
} from './types';

export const SAVE_SCHEMA_VERSION = 3;

type LegacyGameSnapshotV1 = {
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

type LegacyFactionGameStateV2 = Omit<
  FactionGameState,
  'mercenaryPatrolWon' | 'commanderChoiceUnlocked' | 'commanderPathId'
>;

type LegacyGameSnapshotV2 = {
  schemaVersion: 2;
  activeFaction: FactionId;
  shared: GameSnapshot['shared'];
  factionStates: Record<FactionId, LegacyFactionGameStateV2 | null>;
};

function normalizeFormation(formation: Array<string | null>) {
  return Array.from({ length: 9 }, (_, index) => formation[index] ?? null);
}

function commanderDefaults(state: LegacyFactionGameStateV2): FactionGameState {
  return {
    ...state,
    formation: normalizeFormation(state.formation),
    mercenaryPatrolWon: false,
    commanderChoiceUnlocked: false,
    commanderPathId: null
  };
}

export function createHumanFactionState(): FactionGameState {
  return {
    faction: 'human',
    resources: { ...starterResources },
    units: starterUnits.map(unit => ({ ...unit })),
    formation: [
      null,
      'hum_militia',
      null,
      null,
      null,
      null,
      null,
      null,
      'hum_recruit'
    ],
    wagonItems: starterWagonItems.map(item => ({ ...item })),
    wagonStageId: 'camp',
    chapterNodes: chapterOneNodes.map(node => ({ ...node })),
    formationDoctrineId: 'human_hold',
    holdTheRoadWon: false,
    settlementUpgraded: false,
    recruitChoiceAvailable: false,
    recruitChosen: false,
    markedRaidersInvestigated: false,
    forgeUnlocked: false,
    firstPromotionComplete: false,
    equipmentInventory: [],
    unitWeapons: {},
    mercenaryPatrolWon: false,
    commanderChoiceUnlocked: false,
    commanderPathId: null,
    lastBattleResult: null,
    expeditionTickets: 1,
    expeditionRunsCompleted: 0,
    formationTrialCompleted: false
  };
}

export function createInitialGameSnapshot(): GameSnapshot {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    activeFaction: 'human',
    shared: {
      completedCampaigns: [],
      achievements: [],
      lore: [],
      cosmetics: []
    },
    factionStates: {
      human: createHumanFactionState(),
      elf: null,
      orc: null
    }
  };
}

function migrateV1(snapshot: LegacyGameSnapshotV1): GameSnapshot {
  const human: FactionGameState = {
    faction: 'human',
    resources: { ...snapshot.resources },
    units: snapshot.units.map(unit => ({ ...unit })),
    formation: normalizeFormation(snapshot.formation),
    wagonItems: snapshot.wagonItems.map(item => ({ ...item })),
    wagonStageId: snapshot.wagonStageId,
    chapterNodes: snapshot.chapterNodes.map(node => ({ ...node })),
    formationDoctrineId: snapshot.formationDoctrineId,
    holdTheRoadWon: snapshot.holdTheRoadWon,
    settlementUpgraded: snapshot.settlementUpgraded,
    recruitChoiceAvailable: snapshot.recruitChoiceAvailable,
    recruitChosen: snapshot.recruitChosen,
    markedRaidersInvestigated: false,
    forgeUnlocked: false,
    firstPromotionComplete: false,
    equipmentInventory: [],
    unitWeapons: {},
    mercenaryPatrolWon: false,
    commanderChoiceUnlocked: false,
    commanderPathId: null,
    lastBattleResult: snapshot.lastBattleResult ? { ...snapshot.lastBattleResult } : null,
    expeditionTickets: snapshot.expeditionTickets,
    expeditionRunsCompleted: snapshot.expeditionRunsCompleted,
    formationTrialCompleted: snapshot.formationTrialCompleted
  };

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    activeFaction: snapshot.activeFaction,
    shared: {
      completedCampaigns: [...snapshot.completedCampaigns],
      achievements: [],
      lore: [],
      cosmetics: []
    },
    factionStates: {
      human,
      elf: null,
      orc: null
    }
  };
}

function migrateV2(snapshot: LegacyGameSnapshotV2): GameSnapshot {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    activeFaction: snapshot.activeFaction,
    shared: {
      completedCampaigns: [...snapshot.shared.completedCampaigns],
      achievements: [...snapshot.shared.achievements],
      lore: [...snapshot.shared.lore],
      cosmetics: [...snapshot.shared.cosmetics]
    },
    factionStates: {
      human: snapshot.factionStates.human
        ? commanderDefaults(snapshot.factionStates.human)
        : createHumanFactionState(),
      elf: snapshot.factionStates.elf
        ? commanderDefaults(snapshot.factionStates.elf)
        : null,
      orc: snapshot.factionStates.orc
        ? commanderDefaults(snapshot.factionStates.orc)
        : null
    }
  };
}

export function metadataFromSnapshot(
  slotId: SaveSlotId,
  snapshot: GameSnapshot,
  existing?: SaveSlotMetadata
): SaveSlotMetadata {
  const now = new Date().toISOString();
  const current =
    snapshot.factionStates[snapshot.activeFaction] ??
    snapshot.factionStates.human ??
    createHumanFactionState();
  const humanComplete = snapshot.shared.completedCampaigns.includes('human');

  let chapterLabel = 'Chapter 1 · Hold the Road';
  if (current.mercenaryPatrolWon && !current.commanderPathId) {
    chapterLabel = 'Chapter 1 · Choose Commander';
  } else if (current.mercenaryPatrolWon) {
    chapterLabel = 'Chapter 1 · Refugee Camp';
  } else if (current.firstPromotionComplete) {
    chapterLabel = 'Chapter 1 · Mercenary Patrol';
  } else if (current.markedRaidersInvestigated) {
    chapterLabel = 'Chapter 1 · First Promotion';
  } else if (current.holdTheRoadWon) {
    chapterLabel = 'Chapter 1 · Marked Raiders';
  }

  return {
    slotId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    faction: snapshot.activeFaction,
    kingdomName: current.settlementUpgraded ? 'Greenkeep Settlement' : 'Refugee Camp',
    chapterLabel,
    activeSquads: current.formation.filter(Boolean).length,
    humanCampaignComplete: humanComplete,
    elfCampaignUnlocked: humanComplete,
    orcCampaignUnlocked: humanComplete
  };
}

export function createNewSaveRecord(slotId: SaveSlotId): SaveRecord {
  const snapshot = createInitialGameSnapshot();
  return {
    snapshot,
    metadata: metadataFromSnapshot(slotId, snapshot)
  };
}

export function normalizeSaveRecord(
  slotId: SaveSlotId,
  value: unknown
): SaveRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as {
    metadata?: SaveSlotMetadata;
    snapshot?: GameSnapshot | LegacyGameSnapshotV1 | LegacyGameSnapshotV2;
  };
  if (!record.snapshot) {
    return null;
  }

  let snapshot: GameSnapshot;
  if (record.snapshot.schemaVersion === 3) {
    snapshot = record.snapshot as GameSnapshot;
  } else if (record.snapshot.schemaVersion === 2) {
    snapshot = migrateV2(record.snapshot as LegacyGameSnapshotV2);
  } else if (record.snapshot.schemaVersion === 1) {
    snapshot = migrateV1(record.snapshot as LegacyGameSnapshotV1);
  } else {
    return null;
  }

  return {
    snapshot,
    metadata: {
      ...metadataFromSnapshot(slotId, snapshot, record.metadata),
      updatedAt: record.metadata?.updatedAt ?? new Date().toISOString()
    }
  };
}
