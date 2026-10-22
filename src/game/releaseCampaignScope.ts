import type { FactionId } from './types';
import type { GameSnapshot } from '../save/types';

/**
 * Version 1.0 ships the complete Human campaign first.
 * This policy is a runtime availability gate, NOT a save migration or
 * deletion of the authored Elf/Orc content. Future releases can widen it.
 */
export const releaseCampaignScope = {
  version: '1.0',
  playableFactions: ['human'] as const,
  futureFactions: ['elf', 'orc'] as const,
  metaCampaignReleased: false
} as const;

export function isFactionCampaignReleased(faction: FactionId): boolean {
  return releaseCampaignScope.playableFactions.some(allowed => allowed === faction);
}

export const futureFactionMessage =
  'Planned for a future update. The complete Human campaign is the focus of version 1.0.';

/**
 * Open pre-release Elf/Orc saves on their existing Human kingdom instead.
 * All saved factionStates and shared achievements are retained; the source
 * snapshot is not mutated or persisted by this presentation-only adjustment.
 * A later normal game save can persist the changed activeFaction safely.
 */
export function playableSnapshotForRelease(snapshot: GameSnapshot): GameSnapshot | null {
  if (isFactionCampaignReleased(snapshot.activeFaction)) {
    return snapshot.factionStates[snapshot.activeFaction] ? snapshot : null;
  }
  if (!snapshot.factionStates.human) return null;
  return { ...snapshot, activeFaction: 'human' };
}
