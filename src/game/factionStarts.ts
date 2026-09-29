import type {
  ChapterNode,
  ResourceWallet,
  UnitDefinition,
  WagonItemDefinition
} from './types';
import { starterWagonItems } from './data';

export const elfStarterResources: ResourceWallet = {
  gold: 110,
  wood: 80,
  stone: 18,
  iron: 0,
  provisions: 20
};

export const elfStarterUnits: UnitDefinition[] = [
  {
    id: 'elf_warden',
    name: 'Liora',
    className: 'Warden',
    faction: 'elf',
    role: 'frontline',
    tier: 1,
    level: 2,
    hp: 92,
    attack: 11,
    armor: 5,
    speed: 12
  },
  {
    id: 'elf_forest_scout',
    name: 'Cael',
    className: 'Forest Scout',
    faction: 'elf',
    role: 'skirmish',
    tier: 1,
    level: 1,
    hp: 80,
    attack: 13,
    armor: 3,
    speed: 15
  },
  {
    id: 'elf_young_archer',
    name: 'Erynd',
    className: 'Young Archer',
    faction: 'elf',
    role: 'ranged',
    tier: 1,
    level: 1,
    hp: 76,
    attack: 12,
    armor: 3,
    speed: 14,
    battleTags: ['ground', 'ranged']
  }
];

export const elfChapterOneNodes: ChapterNode[] = [
  { id: 'elf_node_1', name: 'The Last Wardstone', type: 'story', completed: true },
  { id: 'elf_node_2', name: 'Wardbreakers', type: 'battle', completed: false, current: true },
  { id: 'elf_node_3', name: 'Whispering Roots', type: 'event', completed: false },
  { id: 'elf_node_4', name: 'Ashen Tracks', type: 'elite', completed: false },
  { id: 'elf_node_5', name: 'Wayfarer Camp', type: 'supply', completed: false },
  { id: 'elf_node_6', name: 'The Hollow Warden', type: 'boss', completed: false }
];

export const orcStarterResources: ResourceWallet = {
  gold: 95,
  wood: 85,
  stone: 16,
  iron: 2,
  provisions: 22
};

export const orcStarterUnits: UnitDefinition[] = [
  {
    id: 'orc_youngblood',
    name: 'Korga',
    className: 'Youngblood',
    faction: 'orc',
    role: 'melee',
    tier: 1,
    level: 2,
    hp: 110,
    attack: 13,
    armor: 4,
    speed: 10
  },
  {
    id: 'orc_hunter',
    name: 'Varka',
    className: 'Hunter',
    faction: 'orc',
    role: 'skirmish',
    tier: 1,
    level: 1,
    hp: 92,
    attack: 13,
    armor: 3,
    speed: 12
  },
  {
    id: 'orc_spearhand',
    name: 'Brakka',
    className: 'Spearhand',
    faction: 'orc',
    role: 'frontline',
    tier: 1,
    level: 1,
    hp: 102,
    attack: 12,
    armor: 4,
    speed: 9,
    battleTags: ['ground', 'anti_large']
  }
];

export const orcChapterOneNodes: ChapterNode[] = [
  { id: 'orc_node_1', name: 'The Accused Clan', type: 'story', completed: true },
  { id: 'orc_node_2', name: 'Blood on the Red Road', type: 'battle', completed: false, current: true },
  { id: 'orc_node_3', name: 'Broken Clan Marks', type: 'event', completed: false },
  { id: 'orc_node_4', name: 'Invader Scouts', type: 'elite', completed: false },
  { id: 'orc_node_5', name: 'Gathering Fire', type: 'supply', completed: false },
  { id: 'orc_node_6', name: 'The Blamecaller', type: 'boss', completed: false }
];

export function factionStarterWagonItems(): WagonItemDefinition[] {
  return starterWagonItems.map(item => ({ ...item }));
}
