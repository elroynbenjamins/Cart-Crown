import {
  chapterOneNodes,
  starterResources,
  starterUnits,
  starterWagonItems
} from '../game/data';
import type { GameSnapshot, SaveRecord, SaveSlotId, SaveSlotMetadata } from './types';

export const SAVE_SCHEMA_VERSION = 1;

export function createInitialGameSnapshot(): GameSnapshot {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
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
    activeFaction: 'human',
    completedCampaigns: [],
    formationDoctrineId: 'human_hold',
    holdTheRoadWon: false,
    settlementUpgraded: false,
    recruitChoiceAvailable: false,
    recruitChosen: false,
    lastBattleResult: null,
    expeditionTickets: 1,
    expeditionRunsCompleted: 0,
    formationTrialCompleted: false
  };
}

export function metadataFromSnapshot(
  slotId: SaveSlotId,
  snapshot: GameSnapshot,
  existing?: SaveSlotMetadata
): SaveSlotMetadata {
  const now = new Date().toISOString();
  const activeSquads = snapshot.formation.filter(Boolean).length;
  const humanComplete = snapshot.completedCampaigns.includes('human');

  return {
    slotId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    faction: snapshot.activeFaction,
    kingdomName: snapshot.settlementUpgraded ? 'Greenkeep Settlement' : 'Refugee Camp',
    chapterLabel: snapshot.holdTheRoadWon ? 'Chapter 1 · Marked Raiders' : 'Chapter 1 · Hold the Road',
    activeSquads,
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
  value: SaveRecord | null
): SaveRecord | null {
  if (!value || !value.snapshot || value.snapshot.schemaVersion !== SAVE_SCHEMA_VERSION) {
    return null;
  }

  return {
    snapshot: value.snapshot,
    metadata: {
      ...metadataFromSnapshot(slotId, value.snapshot, value.metadata),
      updatedAt: value.metadata?.updatedAt ?? new Date().toISOString()
    }
  };
}
