import type {
  BuildingDefinition,
  BuildingLevelDefinition,
  FactionId,
  ResourceWallet
} from './types';

export const humanBuildings: BuildingDefinition[] = [
  {
    id: 'hall',
    faction: 'human',
    name: 'Greenkeep Hall',
    role: 'KINGDOM',
    icon: '🏰',
    maxLevel: 6,
    constructionCost: {},
    description: 'Raises the settlement tier and gates major kingdom expansion.'
  },
  {
    id: 'barracks',
    faction: 'human',
    name: 'Barracks',
    role: 'ARMY',
    icon: '🛡️',
    maxLevel: 5,
    constructionCost: {},
    description: 'Unlocks deeper infantry training and class promotion branches.'
  },
  {
    id: 'forge',
    faction: 'human',
    name: 'Field Forge',
    role: 'EQUIPMENT',
    icon: '⚒️',
    maxLevel: 5,
    constructionCost: { gold: 30, wood: 6 },
    description: 'Crafts and upgrades assigned troop weapons, armor and shields.'
  },
  {
    id: 'wagonwright',
    faction: 'human',
    name: 'Wagonwright',
    role: 'LOGISTICS',
    icon: '🛞',
    maxLevel: 5,
    constructionCost: {},
    description: 'Improves campaign logistics and prepares future Wagon expansions.'
  },
  {
    id: 'quartermaster',
    faction: 'human',
    name: 'Quartermaster',
    role: 'SUPPLY',
    icon: '📦',
    maxLevel: 5,
    constructionCost: { gold: 45, wood: 18, provisions: 8 },
    description: 'Improves provisions, expedition preparation and common supply recovery.'
  },
  {
    id: 'war_room',
    faction: 'human',
    name: 'War Room',
    role: 'COMMAND',
    icon: '🗺️',
    maxLevel: 5,
    constructionCost: { gold: 70, wood: 20, stone: 5 },
    description: 'Supports commander specialization, doctrine planning and later retraining.'
  },
  {
    id: 'stable',
    faction: 'human',
    name: 'Stable',
    role: 'MOUNT',
    icon: '🐎',
    maxLevel: 5,
    constructionCost: { gold: 80, wood: 30, provisions: 10 },
    description: 'Unlocks cavalry recruitment, mount training and mounted equipment.'
  },
  {
    id: 'signal_tower',
    faction: 'human',
    name: 'Signal Tower',
    role: 'SCOUT',
    icon: '🔥',
    maxLevel: 5,
    constructionCost: { gold: 65, wood: 20, stone: 10 },
    description: 'Restores the frontier warning network and improves enemy intelligence.'
  },
  {
    id: 'officer_academy',
    faction: 'human',
    name: 'Officer Academy',
    role: 'COMMAND',
    icon: '🎖️',
    maxLevel: 5,
    constructionCost: { gold: 150, wood: 45, stone: 20, iron: 10 },
    description: 'Trains veteran officers and turns Stronghold command into a permanent army system.'
  }
];

export const humanBuildingLevels: BuildingLevelDefinition[] = [
  {
    buildingId: 'barracks',
    level: 2,
    cost: { gold: 55, wood: 25 },
    effect: 'Advanced infantry training unlocked. Required for Mira’s second class branch.',
    requirement: 'Greenkeep Settlement'
  },
  {
    buildingId: 'forge',
    level: 2,
    cost: { gold: 70, iron: 10, wood: 10 },
    effect: 'Tier II equipment upgrades unlocked.',
    requirement: 'Marked Raiders investigated'
  },
  {
    buildingId: 'wagonwright',
    level: 2,
    cost: { gold: 45, wood: 35, iron: 4 },
    effect: 'Reinforced campaign frame. +1 common supply reward from Expeditions.',
    requirement: 'Greenkeep Settlement'
  },
  {
    buildingId: 'quartermaster',
    level: 2,
    cost: { gold: 60, wood: 20, provisions: 10 },
    effect: 'Prepared Stores: +1 base Expedition Ticket in this faction.',
    requirement: 'Refugee Camp secured'
  },
  {
    buildingId: 'war_room',
    level: 2,
    cost: { gold: 85, wood: 20 },
    effect: 'Commander retraining cost reduced from 75 Gold to 50 Gold.',
    requirement: 'Commander path chosen'
  },
  {
    buildingId: 'signal_tower',
    level: 2,
    cost: { gold: 80, wood: 20, stone: 15 },
    effect: 'Permanent detailed enemy scouting in Battle Prep; Scout Report ads become unnecessary.',
    requirement: 'Broken Signal Tower restored'
  },
  {
    buildingId: 'barracks',
    level: 3,
    cost: { gold: 105, wood: 45, iron: 8 },
    effect: 'Professional drill yard. Opens the next tier of Human troop specialization.',
    requirement: 'Iron Road secured'
  },
  {
    buildingId: 'forge',
    level: 3,
    cost: { gold: 120, iron: 18, stone: 8 },
    effect: 'Tier III forging infrastructure prepared.',
    requirement: 'Iron Road secured'
  },
  {
    buildingId: 'wagonwright',
    level: 3,
    cost: { gold: 90, wood: 60, iron: 8 },
    effect: 'Town chassis preparation complete.',
    requirement: 'Iron Road secured'
  },
  {
    buildingId: 'stable',
    level: 2,
    cost: { gold: 95, wood: 25, provisions: 15 },
    effect: 'Veteran mount training prepared for heavier cavalry branches.',
    requirement: 'Greenkeep Fort'
  },
  {
    buildingId: 'barracks',
    level: 4,
    cost: { gold: 155, wood: 65, iron: 14 },
    effect: 'Stronghold drill grounds prepared for elite Human troop branches.',
    requirement: 'Border Marches secured'
  },
  {
    buildingId: 'forge',
    level: 4,
    cost: { gold: 175, iron: 28, stone: 12 },
    effect: 'Elite forging floor prepared for Stronghold equipment.',
    requirement: 'Border Marches secured'
  },
  {
    buildingId: 'wagonwright',
    level: 4,
    cost: { gold: 140, wood: 85, iron: 14 },
    effect: 'Heavy campaign chassis ready for the Stronghold Wagon.',
    requirement: 'Border Marches secured'
  },
  {
    buildingId: 'war_room',
    level: 3,
    cost: { gold: 130, wood: 30, stone: 15 },
    effect: 'March-wide command planning prepared for the Stronghold tier.',
    requirement: 'Border Marches secured'
  },
  {
    buildingId: 'quartermaster',
    level: 3,
    cost: { gold: 110, wood: 35, provisions: 20 },
    effect: 'Large campaign stores support six active squads.',
    requirement: 'Border Marches secured'
  },
  {
    buildingId: 'officer_academy',
    level: 2,
    cost: { gold: 165, wood: 45, stone: 20 },
    effect: 'Veteran curriculum prepared for later commander and elite-unit upgrades.',
    requirement: 'Greenkeep Stronghold'
  },
  {
    buildingId: 'barracks',
    level: 5,
    cost: { gold: 230, wood: 95, iron: 24 },
    effect: 'Capital drill command prepared for top-tier Human formations.',
    requirement: 'Pretender General defeated'
  },
  {
    buildingId: 'forge',
    level: 5,
    cost: { gold: 260, iron: 42, stone: 20 },
    effect: 'Masterwork forging floor prepared for Capital equipment.',
    requirement: 'Pretender General defeated'
  },
  {
    buildingId: 'wagonwright',
    level: 5,
    cost: { gold: 210, wood: 125, iron: 22 },
    effect: 'Capital campaign chassis prepared.',
    requirement: 'Pretender General defeated'
  },
  {
    buildingId: 'war_room',
    level: 4,
    cost: { gold: 190, wood: 45, stone: 25 },
    effect: 'Provincial command planning prepared for Capital administration.',
    requirement: 'Pretender General defeated'
  },
  {
    buildingId: 'quartermaster',
    level: 4,
    cost: { gold: 165, wood: 55, provisions: 30 },
    effect: 'Provincial stores support the Capital campaign network.',
    requirement: 'Pretender General defeated'
  },
  {
    buildingId: 'stable',
    level: 3,
    cost: { gold: 155, wood: 35, provisions: 25 },
    effect: 'Capital remount program supports long-range cavalry operations.',
    requirement: 'Pretender General defeated'
  },
  {
    buildingId: 'signal_tower',
    level: 3,
    cost: { gold: 145, wood: 35, stone: 30 },
    effect: 'Regional signal network prepared for Capital governance.',
    requirement: 'Pretender General defeated'
  },
  {
    buildingId: 'officer_academy',
    level: 3,
    cost: { gold: 205, wood: 55, stone: 30 },
    effect: 'Senior officers prepared for provincial administration and final campaign planning.',
    requirement: 'Pretender General defeated'
  }
];

export function getBuildings(faction: FactionId) {
  return faction === 'human' ? humanBuildings : [];
}

export function getBuildingLevelDefinition(buildingId: string, level: number) {
  return humanBuildingLevels.find(
    definition => definition.buildingId === buildingId && definition.level === level
  ) ?? null;
}

export function canPayBuildingCost(
  resources: ResourceWallet,
  cost: Partial<ResourceWallet>
) {
  return Object.entries(cost).every(([key, amount]) => {
    const resourceKey = key as keyof ResourceWallet;
    return resources[resourceKey] >= (amount ?? 0);
  });
}
