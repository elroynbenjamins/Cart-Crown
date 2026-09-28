import type {
  ChapterNode,
  RecruitOption,
  ResourceSiteDefinition
} from './types';

export const elfFifthRecruitOptions: RecruitOption[] = [
  {
    id: 'blade_warden',
    archetype: 'Mobile Melee',
    pitch: 'A fast melee Warden who can fight on an exposed flank without ruining Elven open-space formations.',
    tradeoff: 'Less armor than a Spear Warden.',
    unit: {
      id: 'elf_blade_warden',
      name: 'Ilyra',
      className: 'Blade Warden',
      faction: 'elf',
      role: 'melee',
      tier: 4,
      level: 7,
      hp: 118,
      attack: 24,
      armor: 8,
      speed: 14
    }
  },
  {
    id: 'druid',
    archetype: 'Living Ward Support',
    pitch: 'A high-tier support squad built around commander power, ward sustain and protected center positions.',
    tradeoff: 'Low direct damage.',
    unit: {
      id: 'elf_druid',
      name: 'Faelyn',
      className: 'Druid',
      faction: 'elf',
      role: 'support',
      tier: 4,
      level: 7,
      hp: 112,
      attack: 13,
      armor: 8,
      speed: 12
    }
  },
  {
    id: 'moon_ranger',
    archetype: 'Precision Ranged',
    pitch: 'A veteran ranged unit with strong rear/flank pressure and excellent synergy with empty adjacent cells.',
    tradeoff: 'Vulnerable if the formation collapses.',
    unit: {
      id: 'elf_moon_ranger',
      name: 'Selith',
      className: 'Moon Ranger',
      faction: 'elf',
      role: 'ranged',
      tier: 4,
      level: 7,
      hp: 104,
      attack: 27,
      armor: 6,
      speed: 14
    }
  }
];

export const orcFifthRecruitOptions: RecruitOption[] = [
  {
    id: 'ironhide',
    archetype: 'Heavy Melee',
    pitch: 'A heavily armored clan fighter that keeps a five-squad warband aggressive while anchoring the center.',
    tradeoff: 'Slowest Orc choice.',
    unit: {
      id: 'orc_ironhide',
      name: 'Krug',
      className: 'Ironhide',
      faction: 'orc',
      role: 'frontline',
      tier: 4,
      level: 7,
      hp: 165,
      attack: 23,
      armor: 14,
      speed: 8
    }
  },
  {
    id: 'axe_thrower',
    archetype: 'Ranged Raider',
    pitch: 'A ranged pressure squad that still plays close enough to benefit from aggressive Warband layouts.',
    tradeoff: 'Less range control than a dedicated Bone Hunter.',
    unit: {
      id: 'orc_axe_thrower',
      name: 'Zakka',
      className: 'Axe Thrower',
      faction: 'orc',
      role: 'ranged',
      tier: 4,
      level: 7,
      hp: 118,
      attack: 26,
      armor: 7,
      speed: 12
    }
  },
  {
    id: 'bone_shaman',
    archetype: 'Momentum Support',
    pitch: 'A support specialist that strengthens commander bursts and keeps Momentum builds from stalling in long fights.',
    tradeoff: 'Lowest personal attack.',
    unit: {
      id: 'orc_bone_shaman',
      name: 'Mazra',
      className: 'Bone Shaman',
      faction: 'orc',
      role: 'support',
      tier: 4,
      level: 7,
      hp: 120,
      attack: 14,
      armor: 8,
      speed: 10
    }
  }
];

export const factionChapterFourResourceSites: ResourceSiteDefinition[] = [
  {
    id: 'elf_burned_ward_reclamation',
    faction: 'elf',
    name: 'Burned Ward Reclamation',
    icon: '🌱',
    description: 'Reclaimed ash-groves provide spiritwood, herbs and repaired rootway stores.',
    productionPerActivity: { wood: 4, provisions: 3 }
  },
  {
    id: 'orc_steppe_war_camp',
    faction: 'orc',
    name: 'Steppe War Camp',
    icon: '⛺',
    description: 'A permanent two-front camp gathers tribute, meat and captured war material.',
    productionPerActivity: { gold: 4, provisions: 4 }
  }
];

export const elfChapterFiveNodes: ChapterNode[] = [
  { id: 'elf5_node_1', name: 'Worldroot Muster', type: 'event', completed: false, current: true },
  { id: 'elf5_node_2', name: 'The Wounded Worldroot', type: 'battle', completed: false },
  { id: 'elf5_node_3', name: 'Rootscar Records', type: 'event', completed: false },
  { id: 'elf5_node_4', name: 'Ashen Rootkeepers', type: 'elite', completed: false },
  { id: 'elf5_node_5', name: 'The Root Seal', type: 'event', completed: false },
  { id: 'elf5_node_6', name: 'Worldroot Guardian', type: 'boss', completed: false }
];

export const orcChapterFiveNodes: ChapterNode[] = [
  { id: 'orc5_node_1', name: 'High Warhold Muster', type: 'event', completed: false, current: true },
  { id: 'orc5_node_2', name: 'No Clan Left Behind', type: 'battle', completed: false },
  { id: 'orc5_node_3', name: 'Missing Warfires', type: 'event', completed: false },
  { id: 'orc5_node_4', name: 'Ashen Clanbreakers', type: 'elite', completed: false },
  { id: 'orc5_node_5', name: 'The Clan Seal', type: 'event', completed: false },
  { id: 'orc5_node_6', name: 'Last Clanbreaker', type: 'boss', completed: false }
];
