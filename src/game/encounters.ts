import type { EncounterDefinition, ResourceWallet } from './types';

export type EncounterId = 'hold_the_road' | 'mercenary_patrol';

export type EncounterReward = {
  resources: Partial<ResourceWallet>;
  storySummary: string;
};

export const encounters: Record<EncounterId, EncounterDefinition> = {
  hold_the_road: {
    id: 'hold_the_road',
    name: 'Hold the Road',
    subtitle: 'A raider patrol is blocking the refugee road to Greenkeep.',
    enemyName: 'Road Raiders',
    enemyCount: 3,
    enemyHp: 128,
    difficulty: 'Normal'
  },
  mercenary_patrol: {
    id: 'mercenary_patrol',
    name: 'Mercenary Patrol',
    subtitle: 'A contracted warband is sweeping the road before Greenkeep can trace its employer.',
    enemyName: 'Green Banner Company',
    enemyCount: 4,
    enemyHp: 220,
    difficulty: 'Elite'
  }
};

export const encounterRewards: Record<EncounterId, EncounterReward> = {
  hold_the_road: {
    resources: { gold: 45, wood: 12, iron: 3, provisions: 4 },
    storySummary: 'The raider patrol breaks. Refugees can finally reach the ruins of Greenkeep.'
  },
  mercenary_patrol: {
    resources: { gold: 65, wood: 8, iron: 5, provisions: 3 },
    storySummary: 'The mercenaries retreat, leaving behind sealed pay records tied to Crownspire coin.'
  }
};

export function getEncounter(id: EncounterId) {
  return encounters[id];
}
