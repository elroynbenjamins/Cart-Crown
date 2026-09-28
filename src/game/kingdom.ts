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

export const elfBuildings: BuildingDefinition[] = [
  {
    id: 'elf_heartgrove_hall',
    faction: 'elf',
    name: 'Heartgrove Sanctuary',
    role: 'KINGDOM',
    icon: '🌳',
    maxLevel: 5,
    constructionCost: {},
    description: 'Anchors the restored Heartgrove settlement and future ward expansion.'
  },
  {
    id: 'elf_warden_lodge',
    faction: 'elf',
    name: 'Warden Lodge',
    role: 'ARMY',
    icon: '🏹',
    maxLevel: 5,
    constructionCost: {},
    description: 'Trains Wardens, scouts and deeper Elven troop branches.'
  },
  {
    id: 'elf_moon_forge',
    faction: 'elf',
    name: 'Moon Forge',
    role: 'EQUIPMENT',
    icon: '🌙',
    maxLevel: 5,
    constructionCost: { gold: 28, wood: 8 },
    description: 'Shapes moon-silver, spiritwood and warded equipment.'
  },
  {
    id: 'elf_caravan_grove',
    faction: 'elf',
    name: 'Caravan Grove',
    role: 'LOGISTICS',
    icon: '🍃',
    maxLevel: 5,
    constructionCost: {},
    description: 'Improves the Wayfarer Caravan and rootway logistics.'
  },
  {
    id: 'elf_spirit_stores',
    faction: 'elf',
    name: 'Spirit Stores',
    role: 'SUPPLY',
    icon: '🌿',
    maxLevel: 5,
    constructionCost: { gold: 40, wood: 14, provisions: 8 },
    description: 'Stores herbs, food and ward reagents for long campaigns.'
  },
  {
    id: 'elf_council_glade',
    faction: 'elf',
    name: 'Council Glade',
    role: 'COMMAND',
    icon: '🌀',
    maxLevel: 5,
    constructionCost: { gold: 55, wood: 18, stone: 4 },
    description: 'Supports commander paths, ward doctrine and later retraining.'
  },
  {
    id: 'elf_stag_enclosure',
    faction: 'elf',
    name: 'Stag Enclosure',
    role: 'MOUNT',
    icon: '🦌',
    maxLevel: 5,
    constructionCost: { gold: 70, wood: 24, provisions: 10 },
    description: 'Trains Stags and unlocks mounted Elven progression.'
  },
  {
    id: 'elf_ward_beacon',
    faction: 'elf',
    name: 'Ward Beacon',
    role: 'SCOUT',
    icon: '✨',
    maxLevel: 5,
    constructionCost: { gold: 58, wood: 16, stone: 8 },
    description: 'Extends ward-sight and reveals threats along the rootways.'
  }
];

export const orcBuildings: BuildingDefinition[] = [
  {
    id: 'orc_warhold',
    faction: 'orc',
    name: 'Emberclan Warhold',
    role: 'KINGDOM',
    icon: '🪨',
    maxLevel: 5,
    constructionCost: {},
    description: 'Anchors the clan settlement and gates Warhold expansion.'
  },
  {
    id: 'orc_clan_yard',
    faction: 'orc',
    name: 'Clan Yard',
    role: 'ARMY',
    icon: '🪓',
    maxLevel: 5,
    constructionCost: {},
    description: 'Trains clan warriors and deeper Orc troop branches.'
  },
  {
    id: 'orc_bone_forge',
    faction: 'orc',
    name: 'Bone Forge',
    role: 'EQUIPMENT',
    icon: '⚒️',
    maxLevel: 5,
    constructionCost: { gold: 26, wood: 6, iron: 2 },
    description: 'Forges black iron, bone fittings and clan weapons.'
  },
  {
    id: 'orc_cartwright',
    faction: 'orc',
    name: 'War Cartwright',
    role: 'LOGISTICS',
    icon: '🛞',
    maxLevel: 5,
    constructionCost: {},
    description: 'Reinforces the War Cart and campaign hauling capacity.'
  },
  {
    id: 'orc_smokehouse',
    faction: 'orc',
    name: 'Smokehouse',
    role: 'SUPPLY',
    icon: '🍖',
    maxLevel: 5,
    constructionCost: { gold: 35, wood: 15, provisions: 8 },
    description: 'Preserves hunt supplies and keeps warbands provisioned.'
  },
  {
    id: 'orc_war_council',
    faction: 'orc',
    name: 'War Council',
    role: 'COMMAND',
    icon: '🔥',
    maxLevel: 5,
    constructionCost: { gold: 52, wood: 16, stone: 5 },
    description: 'Coordinates clan commanders, Momentum doctrine and later retraining.'
  },
  {
    id: 'orc_warg_pens',
    faction: 'orc',
    name: 'Warg Pens',
    role: 'MOUNT',
    icon: '🐺',
    maxLevel: 5,
    constructionCost: { gold: 68, wood: 22, provisions: 12 },
    description: 'Breeds and trains Wargs for mounted Orc branches.'
  },
  {
    id: 'orc_watchfire',
    faction: 'orc',
    name: 'Watchfire',
    role: 'SCOUT',
    icon: '🔥',
    maxLevel: 5,
    constructionCost: { gold: 54, wood: 18, stone: 8 },
    description: 'Links clan signals and improves battlefield intelligence.'
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
  },
  {
    buildingId: 'war_room',
    level: 5,
    cost: { gold: 285, wood: 65, stone: 45 },
    effect: 'Grand Campaign command map prepared for Crownspire operations.',
    requirement: 'Gate of Crownspire opened'
  },
  {
    buildingId: 'quartermaster',
    level: 5,
    cost: { gold: 245, wood: 80, provisions: 45 },
    effect: 'Grand Campaign stores prepared for the final Human offensive.',
    requirement: 'Gate of Crownspire opened'
  },
  {
    buildingId: 'stable',
    level: 4,
    cost: { gold: 220, wood: 50, provisions: 35 },
    effect: 'Long-range remount network prepared for Crownspire.',
    requirement: 'Gate of Crownspire opened'
  },
  {
    buildingId: 'signal_tower',
    level: 4,
    cost: { gold: 210, wood: 45, stone: 45 },
    effect: 'Capital signal network reaches the Crownspire approaches.',
    requirement: 'Gate of Crownspire opened'
  }
];

export const elfBuildingLevels: BuildingLevelDefinition[] = [
  {
    buildingId: 'elf_warden_lodge',
    level: 2,
    cost: { gold: 50, wood: 24 },
    effect: 'Advanced Warden training unlocked for Chapter 2.',
    requirement: 'Heartgrove Sanctuary'
  },
  {
    buildingId: 'elf_moon_forge',
    level: 2,
    cost: { gold: 62, wood: 12, iron: 6 },
    effect: 'Tier II Elven equipment preparation unlocked.',
    requirement: 'Heartgrove Sanctuary'
  },
  {
    buildingId: 'elf_caravan_grove',
    level: 2,
    cost: { gold: 42, wood: 32 },
    effect: 'Rootway frame reinforcement improves Expedition supply recovery.',
    requirement: 'Heartgrove Sanctuary'
  },
  {
    buildingId: 'elf_spirit_stores',
    level: 2,
    cost: { gold: 52, wood: 18, provisions: 10 },
    effect: 'Prepared herb stores grant +1 base Expedition Ticket.',
    requirement: 'Moonwell Grove restored'
  },
  {
    buildingId: 'elf_council_glade',
    level: 2,
    cost: { gold: 70, wood: 18 },
    effect: 'Commander retraining cost reduced.',
    requirement: 'Elf commander chosen'
  },
  {
    buildingId: 'elf_ward_beacon',
    level: 2,
    cost: { gold: 72, wood: 18, stone: 12 },
    effect: 'Permanent detailed enemy scouting through the ward network.',
    requirement: 'Ward Hunters defeated'
  },
  {
    buildingId: 'elf_warden_lodge',
    level: 3,
    cost: { gold: 96, wood: 42, iron: 5 },
    effect: 'Veteran Warden training prepared for the Heartgrove Enclave.',
    requirement: 'Moonlit Pass secured'
  },
  {
    buildingId: 'elf_moon_forge',
    level: 3,
    cost: { gold: 108, wood: 20, iron: 12 },
    effect: 'Veteran moon-forging prepared for the Enclave tier.',
    requirement: 'Moonlit Pass secured'
  },
  {
    buildingId: 'elf_caravan_grove',
    level: 3,
    cost: { gold: 82, wood: 52, iron: 5 },
    effect: 'Enclave caravan frame prepared.',
    requirement: 'Moonlit Pass secured'
  },
  {
    buildingId: 'elf_stag_enclosure',
    level: 2,
    cost: { gold: 88, wood: 24, provisions: 14 },
    effect: 'Veteran Stag training prepared for deeper mounted branches.',
    requirement: 'Root Council'
  },
  {
    buildingId: 'elf_warden_lodge',
    level: 4,
    cost: { gold: 145, wood: 60, iron: 10 },
    effect: 'Elite Warden training prepared for the Worldroot Sanctuary.',
    requirement: 'Roots in Ash secured'
  },
  {
    buildingId: 'elf_moon_forge',
    level: 4,
    cost: { gold: 165, wood: 28, iron: 22 },
    effect: 'Elite moon-forging prepared for Worldroot equipment.',
    requirement: 'Roots in Ash secured'
  },
  {
    buildingId: 'elf_caravan_grove',
    level: 4,
    cost: { gold: 130, wood: 78, iron: 10 },
    effect: 'Heavy rootway caravan frame prepared for the Worldroot Sanctuary.',
    requirement: 'Roots in Ash secured'
  },
  {
    buildingId: 'elf_council_glade',
    level: 3,
    cost: { gold: 120, wood: 28, stone: 12 },
    effect: 'Ash-grove campaign command prepared for the Sanctuary tier.',
    requirement: 'Living Root Council'
  },
  {
    buildingId: 'elf_spirit_stores',
    level: 3,
    cost: { gold: 105, wood: 30, provisions: 20 },
    effect: 'Large herb and reagent stores support six active squads.',
    requirement: 'Living Root Council'
  },
  {
    buildingId: 'elf_warden_lodge',
    level: 5,
    cost: { gold: 225, wood: 85, iron: 18 },
    effect: 'Starroot command training prepared for the final Crownspire campaign.',
    requirement: 'Worldroot Guardian defeated'
  },
  {
    buildingId: 'elf_moon_forge',
    level: 5,
    cost: { gold: 250, wood: 38, iron: 34 },
    effect: 'Master moon-forging prepared for Crownspire operations.',
    requirement: 'Worldroot Guardian defeated'
  },
  {
    buildingId: 'elf_caravan_grove',
    level: 5,
    cost: { gold: 205, wood: 105, iron: 18 },
    effect: 'Starroot Conclave caravan frame prepared.',
    requirement: 'Worldroot Guardian defeated'
  },
  {
    buildingId: 'elf_council_glade',
    level: 4,
    cost: { gold: 185, wood: 42, stone: 25 },
    effect: 'The Council can govern a multi-region Starroot Conclave.',
    requirement: 'Echo of the Root Seal traced'
  },
  {
    buildingId: 'elf_spirit_stores',
    level: 4,
    cost: { gold: 165, wood: 44, provisions: 30 },
    effect: 'Conclave stores support the final Crownspire campaign.',
    requirement: 'Echo of the Root Seal traced'
  },
  {
    buildingId: 'elf_stag_enclosure',
    level: 3,
    cost: { gold: 145, wood: 34, provisions: 24 },
    effect: 'Master Stag routes prepared for Crownspire.',
    requirement: 'Worldroot Guardian defeated'
  },
  {
    buildingId: 'elf_ward_beacon',
    level: 3,
    cost: { gold: 150, wood: 30, stone: 24 },
    effect: 'The ward network reaches the Crownspire approaches.',
    requirement: 'Worldroot Guardian defeated'
  }
];

export const orcBuildingLevels: BuildingLevelDefinition[] = [
  {
    buildingId: 'orc_clan_yard',
    level: 2,
    cost: { gold: 48, wood: 24, iron: 2 },
    effect: 'Advanced clan training unlocked for Chapter 2.',
    requirement: 'Emberclan Warcamp'
  },
  {
    buildingId: 'orc_bone_forge',
    level: 2,
    cost: { gold: 60, wood: 10, iron: 8 },
    effect: 'Tier II Orc equipment preparation unlocked.',
    requirement: 'Emberclan Warcamp'
  },
  {
    buildingId: 'orc_cartwright',
    level: 2,
    cost: { gold: 40, wood: 34, iron: 4 },
    effect: 'Reinforced War Cart improves Expedition supply recovery.',
    requirement: 'Emberclan Warcamp'
  },
  {
    buildingId: 'orc_smokehouse',
    level: 2,
    cost: { gold: 50, wood: 18, provisions: 12 },
    effect: 'Prepared hunt stores grant +1 base Expedition Ticket.',
    requirement: 'Warg Pens secured'
  },
  {
    buildingId: 'orc_war_council',
    level: 2,
    cost: { gold: 68, wood: 18 },
    effect: 'Commander retraining cost reduced.',
    requirement: 'Orc commander chosen'
  },
  {
    buildingId: 'orc_watchfire',
    level: 2,
    cost: { gold: 70, wood: 18, stone: 12 },
    effect: 'Linked clan signals provide detailed enemy scouting.',
    requirement: 'Stonejaw Challengers defeated'
  },
  {
    buildingId: 'orc_clan_yard',
    level: 3,
    cost: { gold: 94, wood: 40, iron: 8 },
    effect: 'Veteran clan training prepared for the Great Warhold.',
    requirement: 'Stonejaw Trial passed'
  },
  {
    buildingId: 'orc_bone_forge',
    level: 3,
    cost: { gold: 106, wood: 18, iron: 14 },
    effect: 'Veteran black-iron forging prepared for the Great Warhold.',
    requirement: 'Stonejaw Trial passed'
  },
  {
    buildingId: 'orc_cartwright',
    level: 3,
    cost: { gold: 80, wood: 50, iron: 7 },
    effect: 'Great Warhold cart frame prepared.',
    requirement: 'Stonejaw Trial passed'
  },
  {
    buildingId: 'orc_warg_pens',
    level: 2,
    cost: { gold: 86, wood: 22, provisions: 16 },
    effect: 'Veteran Warg training prepared for deeper mounted branches.',
    requirement: 'Clan Oath'
  },
  {
    buildingId: 'orc_clan_yard',
    level: 4,
    cost: { gold: 150, wood: 58, iron: 16 },
    effect: 'Elite clan training prepared for the High Warhold.',
    requirement: 'War on Two Fronts secured'
  },
  {
    buildingId: 'orc_bone_forge',
    level: 4,
    cost: { gold: 168, wood: 24, iron: 28 },
    effect: 'Elite black-iron forging prepared for High Warhold equipment.',
    requirement: 'War on Two Fronts secured'
  },
  {
    buildingId: 'orc_cartwright',
    level: 4,
    cost: { gold: 132, wood: 74, iron: 14 },
    effect: 'Heavy War Cart frame prepared for the High Warhold.',
    requirement: 'War on Two Fronts secured'
  },
  {
    buildingId: 'orc_war_council',
    level: 3,
    cost: { gold: 118, wood: 26, stone: 14 },
    effect: 'Two-front command prepared for the High Warhold tier.',
    requirement: 'Two-Front Council'
  },
  {
    buildingId: 'orc_smokehouse',
    level: 3,
    cost: { gold: 102, wood: 30, provisions: 22 },
    effect: 'Large preserved stores support six active squads.',
    requirement: 'Two-Front Council'
  },
  {
    buildingId: 'orc_clan_yard',
    level: 5,
    cost: { gold: 230, wood: 80, iron: 26 },
    effect: 'Confederacy-wide veteran training prepared for Crownspire.',
    requirement: 'Last Clanbreaker defeated'
  },
  {
    buildingId: 'orc_bone_forge',
    level: 5,
    cost: { gold: 255, wood: 34, iron: 40 },
    effect: 'Master black-iron forging prepared for Crownspire.',
    requirement: 'Last Clanbreaker defeated'
  },
  {
    buildingId: 'orc_cartwright',
    level: 5,
    cost: { gold: 210, wood: 100, iron: 24 },
    effect: 'Confederacy War Cart frame prepared.',
    requirement: 'Last Clanbreaker defeated'
  },
  {
    buildingId: 'orc_war_council',
    level: 4,
    cost: { gold: 188, wood: 40, stone: 26 },
    effect: 'The Council can govern a permanent Warfire Confederacy.',
    requirement: 'Echo of the Clan Seal traced'
  },
  {
    buildingId: 'orc_smokehouse',
    level: 4,
    cost: { gold: 168, wood: 42, provisions: 34 },
    effect: 'Confederacy stores support the final Crownspire campaign.',
    requirement: 'Echo of the Clan Seal traced'
  },
  {
    buildingId: 'orc_warg_pens',
    level: 3,
    cost: { gold: 148, wood: 32, provisions: 26 },
    effect: 'Master Warg routes prepared for Crownspire.',
    requirement: 'Last Clanbreaker defeated'
  },
  {
    buildingId: 'orc_watchfire',
    level: 3,
    cost: { gold: 152, wood: 28, stone: 26 },
    effect: 'The Warfire network reaches the Crownspire approaches.',
    requirement: 'Last Clanbreaker defeated'
  }
];

export const factionBuildingIds = {
  human: {
    hall: 'hall',
    army: 'barracks',
    forge: 'forge',
    logistics: 'wagonwright',
    supply: 'quartermaster',
    command: 'war_room',
    mount: 'stable',
    scout: 'signal_tower'
  },
  elf: {
    hall: 'elf_heartgrove_hall',
    army: 'elf_warden_lodge',
    forge: 'elf_moon_forge',
    logistics: 'elf_caravan_grove',
    supply: 'elf_spirit_stores',
    command: 'elf_council_glade',
    mount: 'elf_stag_enclosure',
    scout: 'elf_ward_beacon'
  },
  orc: {
    hall: 'orc_warhold',
    army: 'orc_clan_yard',
    forge: 'orc_bone_forge',
    logistics: 'orc_cartwright',
    supply: 'orc_smokehouse',
    command: 'orc_war_council',
    mount: 'orc_warg_pens',
    scout: 'orc_watchfire'
  }
} satisfies Record<FactionId, Record<string, string>>;

export function getFactionBuildingIds(faction: FactionId) {
  return factionBuildingIds[faction];
}

export function getBuildings(faction: FactionId) {
  if (faction === 'elf') return elfBuildings;
  if (faction === 'orc') return orcBuildings;
  return humanBuildings;
}

export function getBuildingLevelDefinition(buildingId: string, level: number) {
  return [
    ...humanBuildingLevels,
    ...elfBuildingLevels,
    ...orcBuildingLevels
  ].find(
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
