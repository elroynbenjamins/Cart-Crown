import {
  chapterOneNodes,
  starterResources,
  starterUnits,
  starterWagonItems
} from '../game/data';
import { initialHumanPlacements } from '../game/settlement';
import type {
  FactionGameState,
  GameSnapshot,
  SaveRecord,
  SaveSlotId,
  SaveSlotMetadata
} from './types';

export const SAVE_SCHEMA_VERSION = 7;

export function createHumanFactionState(): FactionGameState {
  return {
    faction: 'human',
    chapterNumber: 1,
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
      stable: 0,
      signal_tower: 0
    },
    buildingPlacements: { ...initialHumanPlacements },
    fourthRecruitChoiceAvailable: false,
    fourthRecruitChosen: false,
    unlockedResourceSites: [],
    productionStock: { gold: 0, wood: 0, stone: 0, iron: 0, provisions: 0 },
    kingdomDefenseCompleted: false,
    kingdomDefenseRuns: 0,
    signalTowerUnlocked: false,
    ironProvostWon: false,
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

  if (current.chapterNumber >= 3) {
    chapterLabel = 'Chapter 3 · Marcher Envoy';
  } else if (current.chapterNumber === 2) {
    chapterLabel = current.ironProvostWon
      ? 'Chapter 2 · Raise Greenkeep Town'
      : current.signalTowerUnlocked
        ? 'Chapter 2 · The Iron Provost'
        : current.kingdomDefenseCompleted
          ? 'Chapter 2 · Broken Signal Tower'
          : current.unlockedResourceSites.includes('greenwood_camp')
            ? 'Chapter 2 · Kingdom Defense'
            : current.unlockedResourceSites.includes('iron_hills_mine')
              ? 'Chapter 2 · Timber Claim'
              : current.fourthRecruitChosen
                ? 'Chapter 2 · Iron Road Skirmish'
                : 'Chapter 2 · Fort Muster';
  } else if (current.refugeeCampSecured) {
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

  const kingdomName =
    current.wagonStageId === 'town'
      ? 'Greenkeep Town'
      : current.wagonStageId === 'fort'
        ? 'Greenkeep Fort'
        : current.settlementUpgraded
          ? 'Greenkeep Settlement'
          : 'Refugee Camp';

  return {
    slotId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    faction: snapshot.activeFaction,
    kingdomName,
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

  const record = value as Partial<SaveRecord>;

  if (
    !record.snapshot ||
    record.snapshot.schemaVersion !== SAVE_SCHEMA_VERSION ||
    !record.snapshot.factionStates
  ) {
    return null;
  }

  return {
    snapshot: record.snapshot,
    metadata: metadataFromSnapshot(slotId, record.snapshot, record.metadata)
  };
}
