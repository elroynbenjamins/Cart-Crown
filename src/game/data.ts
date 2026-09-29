import type {
  ChapterNode,
  EncounterDefinition,
  RecruitOption,
  RegionDefinition,
  ResourceWallet,
  TransportStage,
  UnitDefinition,
  WagonItemDefinition,
  WagonStage
} from './types';

export const starterResources: ResourceWallet = {
  gold: 120,
  wood: 90,
  stone: 20,
  iron: 0,
  provisions: 18
};

export const wagonStages: WagonStage[] = [
  { id: 'camp', name: 'Worn Pack', width: 4, height: 4, formationSlots: 3 },
  { id: 'settlement', name: 'Pack Gear', width: 4, height: 5, formationSlots: 5 },
  { id: 'fort', name: 'Handcart', width: 5, height: 5, formationSlots: 7 },
  { id: 'town', name: 'Supply Cart', width: 5, height: 6, formationSlots: 9 },
  { id: 'stronghold', name: 'Campaign Wagon', width: 6, height: 7, formationSlots: 9 },
  { id: 'capital', name: 'Royal Wagon', width: 7, height: 8, formationSlots: 9 },
  { id: 'grand', name: 'Kingdom Caravan', width: 7, height: 9, formationSlots: 9 }
];

export const transportStages: TransportStage[] = [
  { id: 'worn_pack', name: 'Worn Backpack', width: 4, height: 4 },
  { id: 'pack_gear', name: 'Pack Gear', width: 4, height: 5 },
  { id: 'handcart', name: 'Handcart', width: 5, height: 5 },
  { id: 'supply_cart', name: 'Supply Cart', width: 5, height: 6 },
  { id: 'wagon', name: 'Campaign Wagon', width: 6, height: 7 },
  { id: 'kingdom_caravan', name: 'Kingdom Caravan', width: 7, height: 9 }
];

export const formationUnlockOrder = [1, 4, 0, 3, 2, 5];

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
  },
  {
    id: 'hum_hunter',
    name: 'Edric',
    className: 'Hunter',
    faction: 'human',
    role: 'ranged',
    tier: 1,
    level: 1,
    hp: 78,
    attack: 11,
    armor: 2,
    speed: 11
  }
];

export const humanRefugeeReinforcements: UnitDefinition[] = [
  {
    id: 'hum_refugee_scout',
    name: 'Caleb',
    className: 'Scout',
    faction: 'human',
    role: 'skirmish',
    tier: 1,
    level: 2,
    hp: 90,
    attack: 11,
    armor: 3,
    speed: 14
  },
  {
    id: 'hum_refugee_spear',
    name: 'Bren',
    className: 'Spearman',
    faction: 'human',
    role: 'frontline',
    tier: 1,
    level: 2,
    hp: 96,
    attack: 11,
    armor: 5,
    speed: 9
  }
];

export const humanRecruitOptions: RecruitOption[] = [
  {
    id: 'archer',
    archetype: 'Ranged',
    pitch: 'Immediate ranged pressure and the first ammunition build.',
    tradeoff: 'Lower armor and needs arrows on longer expeditions.',
    unit: {
      id: 'hum_archer_reinforcement',
      name: 'Elise',
      className: 'Archer',
      faction: 'human',
      role: 'ranged',
      tier: 2,
      level: 2,
      hp: 90,
      attack: 15,
      armor: 4,
      speed: 11
    }
  },
  {
    id: 'scout',
    archetype: 'Skirmish',
    pitch: 'Fast flexible unit that opens the mounted line later.',
    tradeoff: 'Less immediate damage than the Archer.',
    unit: {
      id: 'hum_scout_reinforcement',
      name: 'Tomas',
      className: 'Scout',
      faction: 'human',
      role: 'skirmish',
      tier: 2,
      level: 2,
      hp: 95,
      attack: 12,
      armor: 4,
      speed: 14
    }
  },
  {
    id: 'medic',
    archetype: 'Support',
    pitch: 'Early sustain and stronger medicine synergies.',
    tradeoff: 'Adds little direct damage.',
    unit: {
      id: 'hum_medic_reinforcement',
      name: 'Mara',
      className: 'Field Medic',
      faction: 'human',
      role: 'support',
      tier: 2,
      level: 2,
      hp: 90,
      attack: 8,
      armor: 5,
      speed: 10
    }
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
    rotation: 0,
    effect: '-10% wear · -15% rest',
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
    rotation: 0,
    effect: '-20% wear · -20% rest',
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
    rotation: 0,
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
    rotation: 0,
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

export const holdTheRoadEncounter: EncounterDefinition = {
  id: 'hold_the_road',
  name: 'Hold the Road',
  subtitle: 'A raider patrol is blocking the refugee road to Greenkeep.',
  enemyName: 'Road Raiders',
  enemyCount: 3,
  enemyHp: 128,
  difficulty: 'Normal'
};

export const holdTheRoadRewards: Partial<ResourceWallet> = {
  gold: 45,
  wood: 12,
  iron: 3,
  provisions: 4
};
