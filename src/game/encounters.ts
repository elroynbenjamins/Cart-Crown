import type { EncounterDefinition, ResourceWallet } from './types';

export type EncounterId =
  | 'hold_the_road'
  | 'mercenary_patrol'
  | 'toll_captain'
  | 'iron_road_skirmish'
  | 'iron_provost'
  | 'border_fort'
  | 'siege_road'
  | 'lord_marshal_veyr'
  | 'broken_standards'
  | 'crownroad_ambush';

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
  },
  iron_provost: {
    id: 'iron_provost',
    name: 'The Iron Provost',
    subtitle: 'The Crown-trained officer controlling the Iron Road has fortified the old mine headquarters.',
    enemyName: 'Iron Provost Guard',
    enemyCount: 6,
    enemyHp: 470,
    difficulty: 'Boss'
  },
  border_fort: {
    id: 'border_fort',
    name: 'Border Fort',
    subtitle: 'The first marcher strongpoint refuses Greenkeep passage and raises two different house banners over the same gate.',
    enemyName: 'Marcher Fort Guard',
    enemyCount: 6,
    enemyHp: 390,
    difficulty: 'Elite'
  },
  siege_road: {
    id: 'siege_road',
    name: 'Siege Road',
    subtitle: 'Greenkeep must break through a fortified marcher road before the false orders isolate the remaining houses.',
    enemyName: 'Siege Road Column',
    enemyCount: 6,
    enemyHp: 560,
    difficulty: 'Elite'
  },
  lord_marshal_veyr: {
    id: 'lord_marshal_veyr',
    name: 'Lord Marshal Veyr',
    subtitle: 'Veyr gathers the loyal marcher companies beneath one standard and challenges Greenkeep at the old crown road.',
    enemyName: 'Veyr’s Marshal Guard',
    enemyCount: 6,
    enemyHp: 760,
    difficulty: 'Boss'
  },
  broken_standards: {
    id: 'broken_standards',
    name: 'Broken Standards',
    subtitle: 'Royal companies with mismatched banners block the Stronghold army’s first march toward the abandoned court.',
    enemyName: 'Broken Standard Companies',
    enemyCount: 6,
    enemyHp: 610,
    difficulty: 'Normal'
  },
  crownroad_ambush: {
    id: 'crownroad_ambush',
    name: 'Crownroad Ambush',
    subtitle: 'A veteran force attacks Greenkeep’s full six-squad column among the abandoned royal wagons.',
    enemyName: 'Crownroad Veterans',
    enemyCount: 6,
    enemyHp: 790,
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
  },
  iron_provost: {
    resources: { gold: 180, wood: 100, stone: 90, iron: 25, provisions: 10 },
    storySummary: 'The Iron Provost falls and the road network opens. Greenkeep now has the wealth and authority to grow into a true Town.'
  },
  border_fort: {
    resources: { gold: 85, stone: 12, iron: 7, provisions: 4 },
    storySummary: 'The border fort yields. Its orders show three separate marcher authorities issuing contradictory warnings about the same enemy.'
  },
  siege_road: {
    resources: { gold: 105, wood: 18, stone: 16, iron: 9, provisions: 5 },
    storySummary: 'Siege Road is opened. Captured dispatches prove the marcher houses were deliberately given conflicting commands.'
  },
  lord_marshal_veyr: {
    resources: { gold: 260, wood: 150, stone: 120, iron: 35, provisions: 12 },
    storySummary: 'Lord Marshal Veyr is defeated. The Border Marches recognize Greenkeep as the strongest western authority and the road toward the broken Crown opens.'
  },
  broken_standards: {
    resources: { gold: 120, wood: 20, iron: 12, provisions: 6 },
    storySummary: 'The mismatched royal companies scatter. Their standards all carry legitimate seals from different years, suggesting authority was deliberately fragmented.'
  },
  crownroad_ambush: {
    resources: { gold: 145, wood: 24, stone: 18, iron: 14, provisions: 7 },
    storySummary: 'The ambush fails. Greenkeep captures veteran officers who still claim to serve a court that no longer exists.'
  }
};

export function getEncounter(id: EncounterId) {
  return encounters[id];
}
