import type {
  ChapterNode,
  RecruitOption,
  ResourceSiteDefinition
} from './types';

export const elfChapterTwoNodes: ChapterNode[] = [
  { id: 'elf2_node_1', name: 'Sanctuary Muster', type: 'event', completed: false, current: true },
  { id: 'elf2_node_2', name: 'The Last Heartgrove', type: 'battle', completed: false },
  { id: 'elf2_node_3', name: 'Moonwell Grove', type: 'event', completed: false },
  { id: 'elf2_node_4', name: 'Ward Hunters', type: 'elite', completed: false },
  { id: 'elf2_node_5', name: 'Root Council', type: 'event', completed: false },
  { id: 'elf2_node_6', name: 'Ashroot Stalker', type: 'boss', completed: false }
];

export const orcChapterTwoNodes: ChapterNode[] = [
  { id: 'orc2_node_1', name: 'Clan Muster', type: 'event', completed: false, current: true },
  { id: 'orc2_node_2', name: 'Gather the Clans', type: 'battle', completed: false },
  { id: 'orc2_node_3', name: 'Warg Pens', type: 'event', completed: false },
  { id: 'orc2_node_4', name: 'Stonejaw Challengers', type: 'elite', completed: false },
  { id: 'orc2_node_5', name: 'Warfire Council', type: 'event', completed: false },
  { id: 'orc2_node_6', name: 'Clanbreaker', type: 'boss', completed: false }
];

export const elfChapterThreeNodes: ChapterNode[] = [
  { id: 'elf3_node_1', name: 'Moonlit Pass Muster', type: 'event', completed: false, current: true },
  { id: 'elf3_node_2', name: 'Moonlit Pass', type: 'battle', completed: false },
  { id: 'elf3_node_3', name: 'Silent Beacons', type: 'event', completed: false },
  { id: 'elf3_node_4', name: 'Ashen Groves', type: 'elite', completed: false },
  { id: 'elf3_node_5', name: 'Rootway Council', type: 'event', completed: false },
  { id: 'elf3_node_6', name: 'The Pale Ranger', type: 'boss', completed: false }
];

export const orcChapterThreeNodes: ChapterNode[] = [
  { id: 'orc3_node_1', name: 'Stonejaw Muster', type: 'event', completed: false, current: true },
  { id: 'orc3_node_2', name: 'The Stonejaw Trial', type: 'battle', completed: false },
  { id: 'orc3_node_3', name: 'Trial Fires', type: 'event', completed: false },
  { id: 'orc3_node_4', name: 'Broken Steppe', type: 'elite', completed: false },
  { id: 'orc3_node_5', name: 'Clan Oath', type: 'event', completed: false },
  { id: 'orc3_node_6', name: 'Stonejaw Champion', type: 'boss', completed: false }
];

export const elfThirdRecruitOptions: RecruitOption[] = [
  {
    id: 'grove_acolyte',
    archetype: 'Ward Support',
    pitch: 'A support specialist that strengthens center wards and healing-oriented formations.',
    tradeoff: 'Low direct damage.',
    unit: {
      id: 'elf_grove_acolyte',
      name: 'Syllen',
      className: 'Grove Acolyte',
      faction: 'elf',
      role: 'support',
      tier: 2,
      level: 3,
      hp: 88,
      attack: 9,
      armor: 5,
      speed: 12
    }
  },
  {
    id: 'bow_warden',
    archetype: 'Precision Ranged',
    pitch: 'Adds immediate ranged pressure while benefiting strongly from open rear and flank cells.',
    tradeoff: 'Less durable than another Warden.',
    unit: {
      id: 'elf_bow_warden',
      name: 'Aeris',
      className: 'Bow Warden',
      faction: 'elf',
      role: 'ranged',
      tier: 2,
      level: 3,
      hp: 86,
      attack: 17,
      armor: 4,
      speed: 13
    }
  },
  {
    id: 'stag_scout',
    archetype: 'Mounted Potential',
    pitch: 'Fast mobile scout that opens the Stag-mounted line later.',
    tradeoff: 'Lower immediate damage than the Bow Warden.',
    unit: {
      id: 'elf_stag_scout',
      name: 'Thalen',
      className: 'Stag Scout',
      faction: 'elf',
      role: 'skirmish',
      tier: 2,
      level: 3,
      hp: 92,
      attack: 13,
      armor: 4,
      speed: 16
    }
  }
];

export const orcThirdRecruitOptions: RecruitOption[] = [
  {
    id: 'clan_warrior',
    archetype: 'Melee Anchor',
    pitch: 'A tougher melee squad that amplifies Warband adjacency and Momentum gain.',
    tradeoff: 'Slower than the other choices.',
    unit: {
      id: 'orc_clan_warrior',
      name: 'Durog',
      className: 'Clan Warrior',
      faction: 'orc',
      role: 'melee',
      tier: 2,
      level: 3,
      hp: 128,
      attack: 17,
      armor: 7,
      speed: 9
    }
  },
  {
    id: 'war_drummer',
    archetype: 'Momentum Support',
    pitch: 'Support unit built around morale, commander skills and sustained Momentum pressure.',
    tradeoff: 'Low personal damage.',
    unit: {
      id: 'orc_war_drummer',
      name: 'Mogra',
      className: 'War Drummer',
      faction: 'orc',
      role: 'support',
      tier: 2,
      level: 3,
      hp: 105,
      attack: 9,
      armor: 5,
      speed: 9
    }
  },
  {
    id: 'warg_scout',
    archetype: 'Warg Potential',
    pitch: 'Fast scout that opens the Warg-mounted progression line later.',
    tradeoff: 'Less armor than the Clan Warrior.',
    unit: {
      id: 'orc_warg_scout',
      name: 'Rakka',
      className: 'Warg Scout',
      faction: 'orc',
      role: 'skirmish',
      tier: 2,
      level: 3,
      hp: 108,
      attack: 14,
      armor: 4,
      speed: 15
    }
  }
];

export const factionChapterTwoResourceSites: ResourceSiteDefinition[] = [
  {
    id: 'elf_moonwell_herbs',
    faction: 'elf',
    name: 'Moonwell Herb Grove',
    icon: '🌿',
    description: 'Restored moonwell paths provide herbs and food for the Wayfarer Caravan.',
    productionPerActivity: { wood: 3, provisions: 4 }
  },
  {
    id: 'orc_red_plains_hunt',
    faction: 'orc',
    name: 'Red Plains Hunt',
    icon: '🦬',
    description: 'Clan hunting routes provide meat, hide, wagon timber and salvage for the War Cart.',
    productionPerActivity: { gold: 3, wood: 4, provisions: 5 }
  }
];
