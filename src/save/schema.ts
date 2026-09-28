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
  UnitEquipmentLoadout,
  WagonItemDefinition
} from '../game/types';
import type {
  FactionGameState,
  GameSnapshot,
  SaveRecord,
  SaveSlotId,
  SaveSlotMetadata,
  SharedProgress
} from './types';

export const SAVE_SCHEMA_VERSION = 4;

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

type LegacyFactionV2 = {
  faction: FactionId;
  resources: ResourceWallet;
  units: UnitDefinition[];
  formation: Array<string | null>;
  wagonItems: WagonItemDefinition[];
  wagonStageId: string;
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
  unitWeapons: Record<string, string | null>;
  lastBattleResult: BattleResult | null;
  expeditionTickets: number;
  expeditionRunsCompleted: number;
  formationTrialCompleted: boolean;
};

type LegacyFactionV3 = LegacyFactionV2 & {
  mercenaryPatrolWon: boolean;
  commanderChoiceUnlocked: boolean;
  commanderPathId: string | null;
};

type LegacySnapshotV2 = {
  schemaVersion: 2;
  activeFaction: FactionId;
  shared: SharedProgress;
  factionStates: Record<FactionId, LegacyFactionV2 | null>;
};

type LegacySnapshotV3 = {
  schemaVersion: 3;
  activeFaction: FactionId;
  shared: SharedProgress;
  factionStates: Record<FactionId, LegacyFactionV3 | null>;
};

function normalizeFormation(formation: Array<string | null>) {
  return Array.from({ length: 9 }, (_, index) => formation[index] ?? null);
}

function defaultBuildings(
  settlementUpgraded: boolean,
  forgeUnlocked: boolean,
  commanderPathId: string | null
) {
  return {
    hall: settlementUpgraded ? 2 : 1,
    barracks: 1,
    forge: forgeUnlocked ? 1 : 0,
    wagonwright: 1,
    quartermaster: 0,
    war_room: commanderPathId ? 1 : 0,
    stable: 0
  };
}

function equipmentFromWeapons(
  unitWeapons: Record<string, string | null>
): Record<string, UnitEquipmentLoadout> {
  const result: Record<string, UnitEquipmentLoadout> = {};

  for (const [unitId, equipmentId] of Object.entries(unitWeapons)) {
    if (equipmentId) {
      result[unitId] = { weapon: equipmentId };
    }
  }

  return result;
}

function upgradeLegacyFaction(
  state: LegacyFactionV2 | LegacyFactionV3
): FactionGameState {
  const v3 = state as Partial<LegacyFactionV3>;

  return {
    faction: state.faction,
    resources: { ...state.resources },
    units: state.units.map(unit => ({ ...unit })),
    formation: normalizeFormation(state.formation),
    wagonItems: state.wagonItems.map(item => ({ ...item })),
    wagonStageId: state.wagonStageId,
    chapterNodes: state.chapterNodes.map(node => ({ ...node })),
    formationDoctrineId: state.formationDoctrineId,
    holdTheRoadWon: state.holdTheRoadWon,
    settlementUpgraded: state.settlementUpgraded,
    recruitChoiceAvailable: state.recruitChoiceAvailable,
    recruitChosen: state.recruitChosen,
    markedRaidersInvestigated: state.markedRaidersInvestigated,
    forgeUnlocked: state.forgeUnlocked,
    firstPromotionComplete: state.firstPromotionComplete,
    equipmentInventory: [...state.equipmentInventory],
    unitEquipment: equipmentFromWeapons(state.unitWeapons),
    mercenaryPatrolWon: v3.mercenaryPatrolWon ?? false,
    commanderChoiceUnlocked: v3.commanderChoiceUnlocked ?? false,
    commanderPathId: v3.commanderPathId ?? null,
    refugeeCampSecured: false,
    buildingLevels: defaultBuildings(
      state.settlementUpgraded,
      state.forgeUnlocked,
      v3.commanderPathId ?? null
    ),
    lastBattleResult: state.lastBattleResult ? { ...state.lastBattleResult } : null,
    expeditionTickets: state.expeditionTickets,
    expeditionRunsCompleted: state.expeditionRunsCompleted,
    formationTrialCompleted: state.formationTrialCompleted
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
    unitEquipment: {},
    mercenaryPatrolWon: false,
    commanderChoiceUnlocked: false,
    commanderPathId: null,
    refugeeCampSecured: false,
    buildingLevels: {
      hall: 1,
      barracks: 1,
      forge: 0,
      wagonwright: 1,
      quartermaster: 0,
      war_room: 0,
      stable: 0
    },
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
    ...createHumanFactionState(),
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
    buildingLevels: defaultBuildings(
      snapshot.settlementUpgraded,
      false,
      null
    ),
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

function migrateV2(snapshot: LegacySnapshotV2): GameSnapshot {
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
        ? upgradeLegacyFaction(snapshot.factionStates.human)
        : createHumanFactionState(),
      elf: snapshot.factionStates.elf
        ? upgradeLegacyFaction(snapshot.factionStates.elf)
        : null,
      orc: snapshot.factionStates.orc
        ? upgradeLegacyFaction(snapshot.factionStates.orc)
        : null
    }
  };
}

function migrateV3(snapshot: LegacySnapshotV3): GameSnapshot {
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
        ? upgradeLegacyFaction(snapshot.factionStates.human)
        : createHumanFactionState(),
      elf: snapshot.factionStates.elf
        ? upgradeLegacyFaction(snapshot.factionStates.elf)
        : null,
      orc: snapshot.factionStates.orc
        ? upgradeLegacyFaction(snapshot.factionStates.orc)
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
  if (current.refugeeCampSecured) {
    chapterLabel = 'Chapter 1 · The Toll Captain';
  } else if (current.mercenaryPatrolWon && !current.commanderPathId) {
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
    snapshot?: GameSnapshot | LegacyGameSnapshotV1 | LegacySnapshotV2 | LegacySnapshotV3;
  };

  if (!record.snapshot) {
    return null;
  }

  let snapshot: GameSnapshot;

  if (record.snapshot.schemaVersion === 4) {
    snapshot = record.snapshot as GameSnapshot;
  } else if (record.snapshot.schemaVersion === 3) {
    snapshot = migrateV3(record.snapshot as LegacySnapshotV3);
  } else if (record.snapshot.schemaVersion === 2) {
    snapshot = migrateV2(record.snapshot as LegacySnapshotV2);
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
