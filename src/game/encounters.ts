import type { EncounterDefinition, ResourceWallet } from './types';

export type EncounterId =
  | 'hold_the_road'
  | 'mercenary_patrol'
  | 'toll_captain'
  | 'iron_road_skirmish';

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
  },
  toll_captain: {
    id: 'toll_captain',
    name: 'The Toll Captain',
    subtitle: 'The mercenary captain holding the old Greenkeep toll fort refuses to abandon the road.',
    enemyName: 'Toll Captain Host',
    enemyCount: 5,
    enemyHp: 340,
    difficulty: 'Boss'
  },
  iron_road_skirmish: {
    id: 'iron_road_skirmish',
    name: 'Iron Road Skirmish',
    subtitle: 'Greenkeep’s first Fort patrol runs into mercenaries guarding an abandoned roadside mine.',
    enemyName: 'Iron Road Mercenaries',
    enemyCount: 5,
    enemyHp: 285,
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
  },
  toll_captain: {
    resources: { gold: 120, wood: 90, stone: 45, iron: 12, provisions: 8 },
    storySummary: 'The old toll fort falls. Greenkeep now controls the western road and has the stone, timber and authority needed to become a true Fort.'
  },
  iron_road_skirmish: {
    resources: { gold: 55, iron: 6, provisions: 3 },
    storySummary: 'The patrol secures the roadside mine. Greenkeep can now draw a steady trickle of iron from the Iron Hills approach.'
  }
};

export function getEncounter(id: EncounterId) {
  return encounters[id];
}
