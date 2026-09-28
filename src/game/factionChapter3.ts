import type {
  ChapterNode,
  RecruitOption,
  ResourceSiteDefinition
} from './types';

export const elfFourthRecruitOptions: RecruitOption[] = [
  {
    id: 'spear_warden',
    archetype: 'Ward Frontline',
    pitch: 'A disciplined spear Warden who can protect open rear cells without collapsing Elven spacing.',
    tradeoff: 'Less speed than the Pathfinder.',
    unit: {
      id: 'elf_spear_warden',
      name: 'Vaelis',
      className: 'Spear Warden',
      faction: 'elf',
      role: 'frontline',
      tier: 3,
      level: 5,
      hp: 118,
      attack: 17,
      armor: 9,
      speed: 11
    }
  },
  {
    id: 'pathfinder',
    archetype: 'Open-Flank Skirmisher',
    pitch: 'Extremely mobile scout built to exploit empty flank cells and Crescent formations.',
    tradeoff: 'Lower armor than the Spear Warden.',
    unit: {
      id: 'elf_pathfinder',
      name: 'Naeris',
      className: 'Pathfinder',
      faction: 'elf',
      role: 'skirmish',
      tier: 3,
      level: 5,
      hp: 98,
      attack: 18,
      armor: 5,
      speed: 17
    }
  },
  {
    id: 'spiritkeeper',
    archetype: 'Ward Support',
    pitch: 'A stronger support anchor for Living Ward formations and commander-focused builds.',
    tradeoff: 'Lowest direct damage of the three choices.',
    unit: {
      id: 'elf_spiritkeeper',
      name: 'Elyra',
      className: 'Spiritkeeper',
      faction: 'elf',
      role: 'support',
      tier: 3,
      level: 5,
      hp: 102,
      attack: 11,
      armor: 7,
      speed: 12
    }
  }
];

export const orcFourthRecruitOptions: RecruitOption[] = [
  {
    id: 'spear_raider',
    archetype: 'Aggressive Frontline',
    pitch: 'A reach-focused raider who keeps Momentum builds aggressive without sacrificing the front line.',
    tradeoff: 'Slower than the Bone Hunter.',
    unit: {
      id: 'orc_spear_raider',
      name: 'Gorak',
      className: 'Spear Raider',
      faction: 'orc',
      role: 'frontline',
      tier: 3,
      level: 5,
      hp: 138,
      attack: 20,
      armor: 8,
      speed: 9
    }
  },
  {
    id: 'bone_hunter',
    archetype: 'Ranged Pressure',
    pitch: 'Adds true ranged pressure to a warband while still benefiting from aggressive flank positioning.',
    tradeoff: 'Less durable than another melee squad.',
    unit: {
      id: 'orc_bone_hunter',
      name: 'Urga',
      className: 'Bone Hunter',
      faction: 'orc',
      role: 'ranged',
      tier: 3,
      level: 5,
      hp: 105,
      attack: 20,
      armor: 5,
      speed: 13
    }
  },
  {
    id: 'warbringer',
    archetype: 'Momentum Support',
    pitch: 'A command-heavy support fighter who helps a large warband keep Momentum from stalling.',
    tradeoff: 'Lower personal damage than the two combat choices.',
    unit: {
      id: 'orc_warbringer',
      name: 'Brakka',
      className: 'Warbringer',
      faction: 'orc',
      role: 'support',
      tier: 3,
      level: 5,
      hp: 118,
      attack: 13,
      armor: 7,
      speed: 10
    }
  }
];

export const factionChapterThreeResourceSites: ResourceSiteDefinition[] = [
  {
    id: 'elf_moonlit_watch',
    faction: 'elf',
    name: 'Moonlit Watch',
    icon: '🌙',
    description: 'Restored beacon paths provide coin, herbs and safe rootway access through Moonlit Pass.',
    productionPerActivity: { gold: 4, provisions: 3 }
  },
  {
    id: 'orc_stonejaw_quarry',
    faction: 'orc',
    name: 'Stonejaw Quarry',
    icon: '⛏️',
    description: 'The Stonejaw Trial opens a clan quarry that supplies hard stone and workable iron.',
    productionPerActivity: { stone: 3, iron: 2 }
  }
];

export const elfChapterFourNodes: ChapterNode[] = [
  { id: 'elf4_node_1', name: 'Ashen Grove Muster', type: 'event', completed: false, current: true },
  { id: 'elf4_node_2', name: 'Roots in Ash', type: 'battle', completed: false },
  { id: 'elf4_node_3', name: 'The Burned Ward', type: 'event', completed: false },
  { id: 'elf4_node_4', name: 'Two Fronts', type: 'elite', completed: false },
  { id: 'elf4_node_5', name: 'Living Root Council', type: 'event', completed: false },
  { id: 'elf4_node_6', name: 'Ashen Druid', type: 'boss', completed: false }
];

export const orcChapterFourNodes: ChapterNode[] = [
  { id: 'orc4_node_1', name: 'Warhold Muster', type: 'event', completed: false, current: true },
  { id: 'orc4_node_2', name: 'War on Two Fronts', type: 'battle', completed: false },
  { id: 'orc4_node_3', name: 'Split Warfire', type: 'event', completed: false },
  { id: 'orc4_node_4', name: 'Broken Steppe War', type: 'elite', completed: false },
  { id: 'orc4_node_5', name: 'Two-Front Council', type: 'event', completed: false },
  { id: 'orc4_node_6', name: 'The Split-Chieftain', type: 'boss', completed: false }
];
