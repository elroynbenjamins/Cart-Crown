import { ChapterNode, RegionDefinition, ResourceWallet, UnitDefinition, WagonItemDefinition, WagonStage } from './types';

export const starterResources: ResourceWallet = {
  gold: 120,
  wood: 90,
  stone: 20,
  iron: 0,
  provisions: 18
};

export const wagonStages: WagonStage[] = [
  { id: 'camp', name: 'Camp Frame', width: 4, height: 4, formationSlots: 2 },
  { id: 'settlement', name: 'Settlement Bed', width: 4, height: 5, formationSlots: 3 },
  { id: 'fort', name: 'Fort Frame', width: 5, height: 5, formationSlots: 4 },
  { id: 'town', name: 'Town Chassis', width: 5, height: 6, formationSlots: 5 },
  { id: 'stronghold', name: 'Stronghold Wagon', width: 6, height: 7, formationSlots: 6 },
  { id: 'capital', name: 'Capital Wagon', width: 7, height: 8, formationSlots: 6 },
  { id: 'grand', name: 'Grand Campaign Expansion', width: 7, height: 9, formationSlots: 6 }
];

export const starterUnits: UnitDefinition[] = [
  {
    id: 'hum_militia',
    name: 'Harlan',
    className: 'Militia',
    faction: 'human',
    role: 'frontline',
    tier: 1,
    level: 2,
    hp: 100,
    attack: 11,
    armor: 5,
    speed: 9
  },
  {
    id: 'hum_recruit',
    name: 'Mira',
    className: 'Recruit',
    faction: 'human',
    role: 'frontline',
    tier: 1,
    level: 1,
    hp: 85,
    attack: 9,
    armor: 3,
    speed: 10,
    promotionReady: false
  }
];

export const starterWagonItems: WagonItemDefinition[] = [
  {
    id: 'rations',
    name: 'Basic Rations',
    shortName: 'Rations',
    faction: 'global',
    width: 2,
    height: 1,
    effect: '+3 endurance',
    x: 0,
    y: 0
  },
  {
    id: 'medicine',
    name: 'Herb Medicine',
    shortName: 'Medicine',
    faction: 'global',
    width: 1,
    height: 2,
    effect: '2 healing charges',
    x: 2,
    y: 0
  },
  {
    id: 'banner',
    name: 'Command Banner',
    shortName: 'Banner',
    faction: 'global',
    width: 1,
    height: 2,
    effect: '+8 morale',
    x: 3,
    y: 0
  },
  {
    id: 'repair',
    name: 'Repair Kit',
    shortName: 'Repair',
    faction: 'global',
    width: 2,
    height: 1,
    effect: 'Restore armor',
    x: 0,
    y: 2
  }
];

export const humanRegions: RegionDefinition[] = [
  { id: 'greenkeep_outskirts', name: 'Greenkeep Outskirts', faction: 'human', x: 13, y: 58, state: 'current' },
  { id: 'greenkeep_vale', name: 'Greenkeep Vale', faction: 'human', x: 24, y: 55, state: 'locked' },
  { id: 'iron_hills', name: 'Iron Hills', faction: 'human', x: 30, y: 31, state: 'locked' },
  { id: 'border_marches', name: 'Border Marches', faction: 'human', x: 39, y: 52, state: 'locked' },
  { id: 'crownspire', name: 'Crownspire', faction: 'neutral', x: 58, y: 48, state: 'locked' }
];

export const chapterOneNodes: ChapterNode[] = [
  { id: 'node_1', name: 'The Last Two', type: 'story', completed: true },
  { id: 'node_2', name: 'Hold the Road', type: 'battle', completed: false, current: true },
  { id: 'node_3', name: 'Marked Raiders', type: 'event', completed: false },
  { id: 'node_4', name: 'Mercenary Patrol', type: 'elite', completed: false },
  { id: 'node_5', name: 'Refugee Camp', type: 'supply', completed: false },
  { id: 'node_6', name: 'The Toll Captain', type: 'boss', completed: false }
];
