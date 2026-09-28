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
