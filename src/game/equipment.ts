import type {
  AdvancedPromotionDefinition,
  EquipmentDefinition,
  PromotionDefinition,
  UnitDefinition
} from './types';

export const equipmentDefinitions: EquipmentDefinition[] = [
  {
    id: 'hum_iron_sword',
    name: 'Iron Sword',
    faction: 'human',
    slot: 'weapon',
    tier: 1,
    tags: ['sword', 'melee', 'human'],
    attackBonus: 4,
    armorBonus: 0,
    speedBonus: 0,
    craftCost: { wood: 4, iron: 2 },
    requiredForgeLevel: 1,
    description: 'Reliable frontier sword. Opens the Swordsman promotion path.'
  },
  {
    id: 'hum_infantry_spear',
    name: 'Infantry Spear',
    faction: 'human',
    slot: 'weapon',
    tier: 1,
    tags: ['spear', 'reach', 'human'],
    attackBonus: 3,
    armorBonus: 1,
    speedBonus: 0,
    craftCost: { wood: 6, iron: 1 },
    requiredForgeLevel: 1,
    description: 'Long-reach infantry weapon. Opens the Spearman promotion path.'
  },
  {
    id: 'hum_hunting_bow',
    name: 'Hunting Bow',
    faction: 'human',
    slot: 'weapon',
    tier: 1,
    tags: ['bow', 'ranged', 'human'],
    attackBonus: 5,
    armorBonus: 0,
    speedBonus: 1,
    craftCost: { wood: 7, iron: 1 },
    requiredForgeLevel: 1,
    description: 'Simple frontier bow. Opens the Archer promotion path.'
  },
  {
    id: 'hum_padded_armor',
    name: 'Padded Armor',
    faction: 'human',
    slot: 'armor',
    tier: 1,
    tags: ['armor', 'light', 'human'],
    attackBonus: 0,
    armorBonus: 3,
    speedBonus: 0,
    craftCost: { gold: 18, wood: 3 },
    requiredForgeLevel: 1,
    description: 'Basic assigned protection. Improves a squad without changing its class.'
  },
  {
    id: 'hum_wood_shield',
    name: 'Wooden Shield',
    faction: 'human',
    slot: 'shield',
    tier: 1,
    tags: ['shield', 'human'],
    attackBonus: 0,
    armorBonus: 3,
    speedBonus: -1,
    craftCost: { gold: 15, wood: 5 },
    requiredForgeLevel: 1,
    description: 'Basic shield protection for compatible Human infantry.'
  },
  {
    id: 'hum_steel_sword',
    name: 'Steel Sword',
    faction: 'human',
    slot: 'weapon',
    tier: 2,
    tags: ['sword', 'melee', 'human', 'steel'],
    attackBonus: 7,
    armorBonus: 0,
    speedBonus: 0,
    craftCost: { gold: 35, iron: 7 },
    requiredForgeLevel: 2,
    upgradeFromId: 'hum_iron_sword',
    description: 'Tier II sword. A direct equipment improvement that keeps the same class.'
  },
  {
    id: 'hum_greatsword',
    name: 'Greatsword',
    faction: 'human',
    slot: 'weapon',
    tier: 2,
    tags: ['sword', 'greatsword', 'melee', 'human'],
    attackBonus: 10,
    armorBonus: -1,
    speedBonus: -1,
    craftCost: { gold: 45, iron: 9 },
    requiredForgeLevel: 2,
    upgradeFromId: 'hum_iron_sword',
    description: 'Heavy offensive reforge used to promote a Swordsman into a Greatswordsman.'
  },
  {
    id: 'hum_long_pike',
    name: 'Long Pike',
    faction: 'human',
    slot: 'weapon',
    tier: 2,
    tags: ['spear', 'pike', 'reach', 'human'],
    attackBonus: 6,
    armorBonus: 2,
    speedBonus: -1,
    craftCost: { gold: 35, wood: 8, iron: 5 },
    requiredForgeLevel: 2,
    upgradeFromId: 'hum_infantry_spear',
    description: 'Long anti-charge weapon used by Pikemen.'
  },
  {
    id: 'hum_longbow',
    name: 'Longbow',
    faction: 'human',
    slot: 'weapon',
    tier: 2,
    tags: ['bow', 'longbow', 'ranged', 'human'],
    attackBonus: 9,
    armorBonus: 0,
    speedBonus: 0,
    craftCost: { gold: 35, wood: 10, iron: 2 },
    requiredForgeLevel: 2,
    upgradeFromId: 'hum_hunting_bow',
    description: 'Tier II ranged weapon used by Longbowmen.'
  },
  {
    id: 'hum_chainmail',
    name: 'Chainmail',
    faction: 'human',
    slot: 'armor',
    tier: 2,
    tags: ['armor', 'medium', 'human'],
    attackBonus: 0,
    armorBonus: 7,
    speedBonus: -1,
    craftCost: { gold: 40, iron: 8 },
    requiredForgeLevel: 2,
    upgradeFromId: 'hum_padded_armor',
    description: 'Professional armor for trained Human troops.'
  },
  {
    id: 'hum_kite_shield',
    name: 'Kite Shield',
    faction: 'human',
    slot: 'shield',
    tier: 2,
    tags: ['shield', 'kite', 'human'],
    attackBonus: 0,
    armorBonus: 7,
    speedBonus: -1,
    craftCost: { gold: 35, wood: 5, iron: 6 },
    requiredForgeLevel: 2,
    upgradeFromId: 'hum_wood_shield',
    description: 'Professional shield used by defensive infantry branches.'
  },
  {
    id: 'hum_ranger_coat',
    name: 'Ranger Coat',
    faction: 'human',
    slot: 'armor',
    tier: 2,
    tags: ['armor', 'light', 'ranger', 'human'],
    attackBonus: 1,
    armorBonus: 4,
    speedBonus: 2,
    craftCost: { gold: 38, wood: 5, iron: 3 },
    requiredForgeLevel: 2,
    upgradeFromId: 'hum_padded_armor',
    description: 'Mobile field gear used for the Ranger branch.'
  },
  {
    id: 'hum_trained_horse',
    name: 'Trained Horse',
    faction: 'human',
    slot: 'mount',
    tier: 1,
    tags: ['mount', 'horse', 'human'],
    attackBonus: 1,
    armorBonus: 1,
    speedBonus: 5,
    craftCost: { gold: 55, provisions: 8 },
    requiredForgeLevel: 0,
    requiredStableLevel: 1,
    description: 'A trained campaign horse. Assigning it to a Scout opens the Scout Rider cavalry path.'
  },
  {
    id: 'hum_cavalry_lance',
    name: 'Cavalry Lance',
    faction: 'human',
    slot: 'weapon',
    tier: 2,
    tags: ['lance', 'cavalry', 'human'],
    attackBonus: 8,
    armorBonus: 0,
    speedBonus: 0,
    craftCost: { gold: 45, wood: 6, iron: 6 },
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    description: 'Long charge weapon used to specialize a Scout Rider into a Lancer.'
  },
  {
    id: 'hum_rider_bow',
    name: 'Rider Bow',
    faction: 'human',
    slot: 'weapon',
    tier: 2,
    tags: ['bow', 'cavalry', 'ranged', 'human'],
    attackBonus: 7,
    armorBonus: 0,
    speedBonus: 1,
    craftCost: { gold: 42, wood: 9, iron: 2 },
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    description: 'Compact mounted bow used to specialize a Scout Rider into a Mounted Archer.'
  },
  {
    id: 'hum_tempered_sword',
    name: 'Tempered Steel Sword',
    faction: 'human',
    slot: 'weapon',
    tier: 3,
    tags: ['sword', 'melee', 'human', 'tempered'],
    attackBonus: 11,
    armorBonus: 0,
    speedBonus: 0,
    craftCost: { gold: 75, iron: 12 },
    requiredForgeLevel: 3,
    upgradeFromId: 'hum_steel_sword',
    description: 'Tier III sword for veteran infantry and cavalry.'
  },
  {
    id: 'hum_royal_greatsword',
    name: 'Royal Greatsword',
    faction: 'human',
    slot: 'weapon',
    tier: 3,
    tags: ['sword', 'greatsword', 'melee', 'human', 'royal'],
    attackBonus: 15,
    armorBonus: -1,
    speedBonus: -2,
    craftCost: { gold: 90, iron: 15 },
    requiredForgeLevel: 3,
    upgradeFromId: 'hum_greatsword',
    description: 'Stronghold-grade heavy blade for elite offensive infantry.'
  },
  {
    id: 'hum_warbow',
    name: 'Warbow',
    faction: 'human',
    slot: 'weapon',
    tier: 3,
    tags: ['bow', 'warbow', 'ranged', 'human'],
    attackBonus: 13,
    armorBonus: 0,
    speedBonus: 0,
    craftCost: { gold: 80, wood: 14, iron: 4 },
    requiredForgeLevel: 3,
    upgradeFromId: 'hum_longbow',
    description: 'Powerful Stronghold bow built for veteran marksmen.'
  },
  {
    id: 'hum_heavy_plate',
    name: 'Heavy Plate',
    faction: 'human',
    slot: 'armor',
    tier: 3,
    tags: ['armor', 'heavy', 'human', 'plate'],
    attackBonus: 0,
    armorBonus: 12,
    speedBonus: -2,
    craftCost: { gold: 95, iron: 16 },
    requiredForgeLevel: 3,
    upgradeFromId: 'hum_chainmail',
    description: 'Stronghold-grade plate armor for elite frontline and cavalry units.'
  },
  {
    id: 'hum_tower_shield',
    name: 'Tower Shield',
    faction: 'human',
    slot: 'shield',
    tier: 3,
    tags: ['shield', 'tower', 'human'],
    attackBonus: 0,
    armorBonus: 11,
    speedBonus: -1,
    craftCost: { gold: 80, wood: 8, iron: 12 },
    requiredForgeLevel: 3,
    upgradeFromId: 'hum_kite_shield',
    description: 'Large Stronghold shield used by the heaviest Human defensive troops.'
  },
  {
    id: 'hum_veteran_warhorse',
    name: 'Veteran Warhorse',
    faction: 'human',
    slot: 'mount',
    tier: 3,
    tags: ['mount', 'horse', 'warhorse', 'human'],
    attackBonus: 2,
    armorBonus: 3,
    speedBonus: 7,
    craftCost: { gold: 110, provisions: 16 },
    requiredForgeLevel: 0,
    requiredStableLevel: 2,
    upgradeFromId: 'hum_trained_horse',
    description: 'Battle-trained mount for elite cavalry formations.'
  },

  {
    id: 'elf_spiritwood_spear',
    name: 'Spiritwood Spear',
    faction: 'elf',
    slot: 'weapon',
    tier: 1,
    tags: ['spear', 'elf', 'spiritwood'],
    attackBonus: 4,
    armorBonus: 1,
    speedBonus: 1,
    craftCost: { wood: 6, iron: 1 },
    requiredForgeLevel: 1,
    description: 'Flexible Warden spear grown around a moon-silver core.'
  },
  {
    id: 'elf_moonbow',
    name: 'Moonbow',
    faction: 'elf',
    slot: 'weapon',
    tier: 1,
    tags: ['bow', 'elf', 'ranged'],
    attackBonus: 6,
    armorBonus: 0,
    speedBonus: 1,
    craftCost: { wood: 8, iron: 1 },
    requiredForgeLevel: 1,
    description: 'Light Elven bow built for mobile rear and flank positions.'
  },
  {
    id: 'elf_leafweave',
    name: 'Leafweave Armor',
    faction: 'elf',
    slot: 'armor',
    tier: 1,
    tags: ['armor', 'light', 'elf'],
    attackBonus: 0,
    armorBonus: 4,
    speedBonus: 1,
    craftCost: { gold: 18, wood: 4 },
    requiredForgeLevel: 1,
    description: 'Layered living-fiber protection that preserves Elven mobility.'
  },
  {
    id: 'elf_trained_stag',
    name: 'Trained Stag',
    faction: 'elf',
    slot: 'mount',
    tier: 2,
    tags: ['mount', 'stag', 'elf'],
    attackBonus: 1,
    armorBonus: 1,
    speedBonus: 6,
    craftCost: { gold: 65, provisions: 10 },
    requiredForgeLevel: 0,
    requiredStableLevel: 1,
    description: 'A trained campaign Stag. Assign it to a Stag Scout to create a true mounted branch.'
  },
  {
    id: 'elf_moon_lance',
    name: 'Moon Lance',
    faction: 'elf',
    slot: 'weapon',
    tier: 2,
    tags: ['lance', 'cavalry', 'elf'],
    attackBonus: 9,
    armorBonus: 0,
    speedBonus: 1,
    craftCost: { gold: 44, wood: 7, iron: 5 },
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    description: 'Light charge lance used by Stag Lancers.'
  },
  {
    id: 'elf_rider_bow',
    name: 'Stag Rider Bow',
    faction: 'elf',
    slot: 'weapon',
    tier: 2,
    tags: ['bow', 'cavalry', 'ranged', 'elf'],
    attackBonus: 8,
    armorBonus: 0,
    speedBonus: 2,
    craftCost: { gold: 42, wood: 10, iron: 2 },
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    description: 'Compact Moonbow tuned for accurate fire from a moving Stag.'
  },
  {
    id: 'elf_moonsilver_spear',
    name: 'Moonsilver Spear',
    faction: 'elf',
    slot: 'weapon',
    tier: 2,
    tags: ['spear', 'elf', 'moonsilver'],
    attackBonus: 8,
    armorBonus: 2,
    speedBonus: 1,
    craftCost: { gold: 40, wood: 6, iron: 6 },
    requiredForgeLevel: 2,
    upgradeFromId: 'elf_spiritwood_spear',
    description: 'Veteran Warden spear that keeps reach without sacrificing speed.'
  },
  {
    id: 'elf_moonweave',
    name: 'Moonweave Armor',
    faction: 'elf',
    slot: 'armor',
    tier: 2,
    tags: ['armor', 'light', 'elf', 'moonweave'],
    attackBonus: 0,
    armorBonus: 7,
    speedBonus: 2,
    craftCost: { gold: 42, wood: 6, iron: 3 },
    requiredForgeLevel: 2,
    upgradeFromId: 'elf_leafweave',
    description: 'Veteran light armor woven for Wards, Pathfinders and Stag riders.'
  },

  {
    id: 'orc_iron_axe',
    name: 'Clan Iron Axe',
    faction: 'orc',
    slot: 'weapon',
    tier: 1,
    tags: ['axe', 'melee', 'orc'],
    attackBonus: 5,
    armorBonus: 0,
    speedBonus: 0,
    craftCost: { wood: 4, iron: 2 },
    requiredForgeLevel: 1,
    description: 'Heavy clan axe built for Youngbloods and raiders.'
  },
  {
    id: 'orc_hunter_bow',
    name: 'Horn Bow',
    faction: 'orc',
    slot: 'weapon',
    tier: 1,
    tags: ['bow', 'ranged', 'orc'],
    attackBonus: 6,
    armorBonus: 0,
    speedBonus: 0,
    craftCost: { wood: 7, iron: 1 },
    requiredForgeLevel: 1,
    description: 'Compact hunting bow used by Orc scouts and Bone Hunters.'
  },
  {
    id: 'orc_warhide',
    name: 'Warhide Armor',
    faction: 'orc',
    slot: 'armor',
    tier: 1,
    tags: ['armor', 'medium', 'orc'],
    attackBonus: 0,
    armorBonus: 5,
    speedBonus: 0,
    craftCost: { gold: 16, wood: 3, iron: 1 },
    requiredForgeLevel: 1,
    description: 'Layered hide and iron plates designed for aggressive warbands.'
  },
  {
    id: 'orc_trained_warg',
    name: 'Trained Warg',
    faction: 'orc',
    slot: 'mount',
    tier: 2,
    tags: ['mount', 'warg', 'orc'],
    attackBonus: 2,
    armorBonus: 1,
    speedBonus: 6,
    craftCost: { gold: 62, provisions: 12 },
    requiredForgeLevel: 0,
    requiredStableLevel: 1,
    description: 'A trained war Warg. Assign it to a Warg Scout to open mounted Orc progression.'
  },
  {
    id: 'orc_warg_lance',
    name: 'Warg Lance',
    faction: 'orc',
    slot: 'weapon',
    tier: 2,
    tags: ['lance', 'cavalry', 'orc'],
    attackBonus: 10,
    armorBonus: 0,
    speedBonus: 0,
    craftCost: { gold: 45, wood: 6, iron: 7 },
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    description: 'Heavy thrusting weapon for Warg Lancers.'
  },
  {
    id: 'orc_raider_axe',
    name: 'Raider Axe',
    faction: 'orc',
    slot: 'weapon',
    tier: 2,
    tags: ['axe', 'cavalry', 'orc'],
    attackBonus: 9,
    armorBonus: 1,
    speedBonus: 1,
    craftCost: { gold: 42, wood: 4, iron: 7 },
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    description: 'Short brutal axe used by Warg Raiders in sustained melee.'
  },
  {
    id: 'orc_blackiron_axe',
    name: 'Black-Iron Axe',
    faction: 'orc',
    slot: 'weapon',
    tier: 2,
    tags: ['axe', 'melee', 'orc', 'blackiron'],
    attackBonus: 9,
    armorBonus: 1,
    speedBonus: 0,
    craftCost: { gold: 40, iron: 8 },
    requiredForgeLevel: 2,
    upgradeFromId: 'orc_iron_axe',
    description: 'Veteran clan weapon forged for longer wars and heavier armor.'
  },
  {
    id: 'orc_reinforced_warhide',
    name: 'Reinforced Warhide',
    faction: 'orc',
    slot: 'armor',
    tier: 2,
    tags: ['armor', 'heavy', 'orc', 'warhide'],
    attackBonus: 0,
    armorBonus: 8,
    speedBonus: -1,
    craftCost: { gold: 40, iron: 7, wood: 4 },
    requiredForgeLevel: 2,
    upgradeFromId: 'orc_warhide',
    description: 'Reinforced hide for Clan Warriors, Warg riders and frontline raiders.'
  },

  {
    id: 'elf_veteran_stag',
    name: 'Veteran Stag',
    faction: 'elf',
    slot: 'mount',
    tier: 3,
    tags: ['mount', 'stag', 'elf', 'veteran'],
    attackBonus: 2,
    armorBonus: 3,
    speedBonus: 8,
    craftCost: { gold: 105, provisions: 16 },
    requiredForgeLevel: 0,
    requiredStableLevel: 2,
    upgradeFromId: 'elf_trained_stag',
    description: 'Veteran Stag mount that upgrades an existing mounted Elven squad without changing class.'
  },
  {
    id: 'elf_star_lance',
    name: 'Star Lance',
    faction: 'elf',
    slot: 'weapon',
    tier: 3,
    tags: ['lance', 'cavalry', 'elf', 'star'],
    attackBonus: 13,
    armorBonus: 1,
    speedBonus: 1,
    craftCost: { gold: 76, wood: 8, iron: 10 },
    requiredForgeLevel: 3,
    requiredStableLevel: 2,
    upgradeFromId: 'elf_moon_lance',
    description: 'Tier III Stag-lancer weapon for stronger charges without forcing another class promotion.'
  },
  {
    id: 'elf_starbow',
    name: 'Starbow',
    faction: 'elf',
    slot: 'weapon',
    tier: 3,
    tags: ['bow', 'cavalry', 'ranged', 'elf', 'star'],
    attackBonus: 12,
    armorBonus: 0,
    speedBonus: 2,
    craftCost: { gold: 74, wood: 14, iron: 5 },
    requiredForgeLevel: 3,
    requiredStableLevel: 2,
    upgradeFromId: 'elf_rider_bow',
    description: 'Tier III mounted bow for veteran Rangers and open-flank cavalry.'
  },
  {
    id: 'elf_starweave',
    name: 'Starweave Armor',
    faction: 'elf',
    slot: 'armor',
    tier: 3,
    tags: ['armor', 'light', 'elf', 'starweave'],
    attackBonus: 1,
    armorBonus: 10,
    speedBonus: 2,
    craftCost: { gold: 78, wood: 8, iron: 7 },
    requiredForgeLevel: 3,
    upgradeFromId: 'elf_moonweave',
    description: 'Tier III Elven armor that preserves speed while substantially improving protection.'
  },

  {
    id: 'orc_veteran_warg',
    name: 'Veteran Warg',
    faction: 'orc',
    slot: 'mount',
    tier: 3,
    tags: ['mount', 'warg', 'orc', 'veteran'],
    attackBonus: 3,
    armorBonus: 3,
    speedBonus: 8,
    craftCost: { gold: 108, provisions: 18 },
    requiredForgeLevel: 0,
    requiredStableLevel: 2,
    upgradeFromId: 'orc_trained_warg',
    description: 'Veteran Warg that upgrades an existing mounted warband without forcing another promotion.'
  },
  {
    id: 'orc_bonehook_lance',
    name: 'Bonehook Lance',
    faction: 'orc',
    slot: 'weapon',
    tier: 3,
    tags: ['lance', 'cavalry', 'orc', 'bonehook'],
    attackBonus: 14,
    armorBonus: 1,
    speedBonus: 0,
    craftCost: { gold: 78, wood: 7, iron: 12 },
    requiredForgeLevel: 3,
    requiredStableLevel: 2,
    upgradeFromId: 'orc_warg_lance',
    description: 'Tier III Warg-lancer weapon built for violent opening impact.'
  },
  {
    id: 'orc_bloodaxe',
    name: 'Bloodaxe',
    faction: 'orc',
    slot: 'weapon',
    tier: 3,
    tags: ['axe', 'cavalry', 'orc', 'bloodaxe'],
    attackBonus: 13,
    armorBonus: 2,
    speedBonus: 1,
    craftCost: { gold: 75, wood: 5, iron: 12 },
    requiredForgeLevel: 3,
    requiredStableLevel: 2,
    upgradeFromId: 'orc_raider_axe',
    description: 'Tier III Raider weapon for sustained mounted melee and Momentum pressure.'
  },
  {
    id: 'orc_ironhide_plate',
    name: 'Ironhide Plate',
    faction: 'orc',
    slot: 'armor',
    tier: 3,
    tags: ['armor', 'heavy', 'orc', 'ironhide'],
    attackBonus: 0,
    armorBonus: 12,
    speedBonus: -1,
    craftCost: { gold: 82, iron: 14, wood: 5 },
    requiredForgeLevel: 3,
    upgradeFromId: 'orc_reinforced_warhide',
    description: 'Tier III Orc armor built to keep melee units alive deep into Momentum fights.'
  },

  {
    id: 'hum_oathglass_relic',
    name: 'Oathglass Lens',
    faction: 'human',
    slot: 'artifact',
    tier: 4,
    rarity: 'relic',
    tags: ['artifact', 'relic', 'magic', 'human'],
    attackBonus: 6,
    armorBonus: 4,
    speedBonus: 2,
    craftCost: {},
    requiredForgeLevel: 0,
    description: 'Unique Relic Hunt artifact. Refracted oath-runes sharpen offense, protection and tactical timing without replacing normal equipment.'
  },
  {
    id: 'elf_moonroot_relic',
    name: 'Moonroot Sigil',
    faction: 'elf',
    slot: 'artifact',
    tier: 4,
    rarity: 'relic',
    tags: ['artifact', 'relic', 'magic', 'elf'],
    attackBonus: 4,
    armorBonus: 4,
    speedBonus: 4,
    craftCost: {},
    requiredForgeLevel: 0,
    description: 'Unique Relic Hunt artifact. Living moonroot channels speed and warding into whichever squad carries the sigil.'
  },
  {
    id: 'orc_emberfang_relic',
    name: 'Emberfang Totem',
    faction: 'orc',
    slot: 'artifact',
    tier: 4,
    rarity: 'relic',
    tags: ['artifact', 'relic', 'magic', 'orc'],
    attackBonus: 7,
    armorBonus: 5,
    speedBonus: 1,
    craftCost: {},
    requiredForgeLevel: 0,
    description: 'Unique Relic Hunt artifact. The bound emberfang strengthens pressure and staying power without consuming a weapon slot.'
  }
];

export const recruitPromotions: PromotionDefinition[] = [
  {
    id: 'promote_recruit_swordsman',
    faction: 'human',
    fromClass: 'Recruit',
    toClass: 'Swordsman',
    role: 'melee',
    requiredEquipmentId: 'hum_iron_sword',
    attackBonus: 5,
    armorBonus: 2,
    speedBonus: 0,
    pitch: 'Balanced melee fighter who can later branch toward shield infantry or great weapons.'
  },
  {
    id: 'promote_recruit_spearman',
    faction: 'human',
    fromClass: 'Recruit',
    toClass: 'Spearman',
    role: 'frontline',
    requiredEquipmentId: 'hum_infantry_spear',
    attackBonus: 4,
    armorBonus: 2,
    speedBonus: 0,
    pitch: 'Reach-focused frontline unit that can later specialize into pike or shield-spear roles.'
  },
  {
    id: 'promote_recruit_archer',
    faction: 'human',
    fromClass: 'Recruit',
    toClass: 'Archer',
    role: 'ranged',
    requiredEquipmentId: 'hum_hunting_bow',
    attackBonus: 6,
    armorBonus: 0,
    speedBonus: 1,
    pitch: 'Ranged specialist who benefits strongly from protected rear-row positions.'
  }
];

export const advancedPromotions: AdvancedPromotionDefinition[] = [
  {
    id: 'swordsman_shield_infantry',
    faction: 'human',
    fromClass: 'Swordsman',
    toClass: 'Shield Infantry',
    role: 'frontline',
    requiredEquippedIds: ['hum_kite_shield', 'hum_chainmail'],
    requiredBarracksLevel: 2,
    requiredForgeLevel: 2,
    attackBonus: 2,
    armorBonus: 5,
    speedBonus: -1,
    pitch: 'Defensive branch built around professional armor and a full shield line.'
  },
  {
    id: 'swordsman_greatswordsman',
    faction: 'human',
    fromClass: 'Swordsman',
    toClass: 'Greatswordsman',
    role: 'melee',
    requiredEquippedIds: ['hum_greatsword'],
    requiredBarracksLevel: 2,
    requiredForgeLevel: 2,
    attackBonus: 6,
    armorBonus: 1,
    speedBonus: -1,
    pitch: 'Heavy offensive branch trading defense for decisive melee damage.'
  },
  {
    id: 'spearman_pikeman',
    faction: 'human',
    fromClass: 'Spearman',
    toClass: 'Pikeman',
    role: 'frontline',
    requiredEquippedIds: ['hum_long_pike'],
    requiredBarracksLevel: 2,
    requiredForgeLevel: 2,
    attackBonus: 4,
    armorBonus: 3,
    speedBonus: -1,
    pitch: 'Long-reach control branch built to stop charges and hold lanes.'
  },
  {
    id: 'spearman_shield_spearman',
    faction: 'human',
    fromClass: 'Spearman',
    toClass: 'Shield Spearman',
    role: 'frontline',
    requiredEquippedIds: ['hum_kite_shield'],
    requiredBarracksLevel: 2,
    requiredForgeLevel: 2,
    attackBonus: 2,
    armorBonus: 5,
    speedBonus: -1,
    pitch: 'Durable spear-and-shield line that anchors Human formations.'
  },
  {
    id: 'archer_longbowman',
    faction: 'human',
    fromClass: 'Archer',
    toClass: 'Longbowman',
    role: 'ranged',
    requiredEquippedIds: ['hum_longbow'],
    requiredBarracksLevel: 2,
    requiredForgeLevel: 2,
    attackBonus: 6,
    armorBonus: 0,
    speedBonus: 0,
    pitch: 'Dedicated long-range damage branch.'
  },
  {
    id: 'archer_ranger',
    faction: 'human',
    fromClass: 'Archer',
    toClass: 'Ranger',
    role: 'skirmish',
    requiredEquippedIds: ['hum_ranger_coat'],
    requiredBarracksLevel: 2,
    requiredForgeLevel: 2,
    attackBonus: 3,
    armorBonus: 2,
    speedBonus: 3,
    pitch: 'Mobile ranged branch that trades raw volley power for speed and flexibility.'
  },
  {
    id: 'scout_scout_rider',
    faction: 'human',
    fromClass: 'Scout',
    toClass: 'Scout Rider',
    role: 'cavalry',
    requiredEquippedIds: ['hum_trained_horse'],
    requiredBarracksLevel: 1,
    requiredForgeLevel: 0,
    requiredStableLevel: 1,
    attackBonus: 3,
    armorBonus: 1,
    speedBonus: 4,
    pitch: 'The first mounted Human branch: fast reconnaissance cavalry that can later become Cavalryman, Lancer or Mounted Archer.'
  },
  {
    id: 'scout_rider_cavalryman',
    faction: 'human',
    fromClass: 'Scout Rider',
    toClass: 'Cavalryman',
    role: 'cavalry',
    requiredEquippedIds: ['hum_trained_horse', 'hum_iron_sword'],
    requiredBarracksLevel: 2,
    requiredForgeLevel: 1,
    requiredStableLevel: 1,
    attackBonus: 5,
    armorBonus: 3,
    speedBonus: 1,
    pitch: 'Balanced mounted soldier with sustained melee pressure and room to become heavy cavalry later.'
  },
  {
    id: 'scout_rider_lancer',
    faction: 'human',
    fromClass: 'Scout Rider',
    toClass: 'Lancer',
    role: 'cavalry',
    requiredEquippedIds: ['hum_trained_horse', 'hum_cavalry_lance'],
    requiredBarracksLevel: 2,
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    attackBonus: 8,
    armorBonus: 1,
    speedBonus: 1,
    pitch: 'Charge-focused cavalry with the strongest opening impact of the early Human mounted branches.'
  },
  {
    id: 'scout_rider_mounted_archer',
    faction: 'human',
    fromClass: 'Scout Rider',
    toClass: 'Mounted Archer',
    role: 'cavalry',
    requiredEquippedIds: ['hum_trained_horse', 'hum_rider_bow'],
    requiredBarracksLevel: 2,
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    attackBonus: 6,
    armorBonus: 0,
    speedBonus: 3,
    pitch: 'Mobile ranged cavalry that rewards flanks, speed and Ranger-Captain/Cavalry Marshal hybrid builds.'
  },
  {
    id: 'shield_infantry_royal_guard',
    faction: 'human',
    fromClass: 'Shield Infantry',
    toClass: 'Royal Guard',
    role: 'frontline',
    requiredEquippedIds: ['hum_tower_shield', 'hum_heavy_plate'],
    requiredBarracksLevel: 4,
    requiredForgeLevel: 3,
    requiredOfficerAcademyLevel: 1,
    attackBonus: 4,
    armorBonus: 8,
    speedBonus: -1,
    pitch: 'Elite defensive infantry built to anchor the center of a six-squad Stronghold formation.'
  },
  {
    id: 'greatswordsman_champion',
    faction: 'human',
    fromClass: 'Greatswordsman',
    toClass: 'Champion',
    role: 'melee',
    requiredEquippedIds: ['hum_royal_greatsword'],
    requiredBarracksLevel: 4,
    requiredForgeLevel: 3,
    requiredOfficerAcademyLevel: 1,
    attackBonus: 9,
    armorBonus: 2,
    speedBonus: 0,
    pitch: 'Elite shock infantry focused on decisive melee damage.'
  },
  {
    id: 'longbowman_marksman',
    faction: 'human',
    fromClass: 'Longbowman',
    toClass: 'Marksman',
    role: 'ranged',
    requiredEquippedIds: ['hum_warbow'],
    requiredBarracksLevel: 4,
    requiredForgeLevel: 3,
    requiredOfficerAcademyLevel: 1,
    attackBonus: 8,
    armorBonus: 1,
    speedBonus: 1,
    pitch: 'Stronghold ranged specialist with higher precision and sustained rear-line pressure.'
  },
  {
    id: 'cavalryman_heavy_cavalry',
    faction: 'human',
    fromClass: 'Cavalryman',
    toClass: 'Heavy Cavalry',
    role: 'cavalry',
    requiredEquippedIds: ['hum_veteran_warhorse', 'hum_heavy_plate', 'hum_tempered_sword'],
    requiredBarracksLevel: 4,
    requiredForgeLevel: 3,
    requiredOfficerAcademyLevel: 1,
    requiredStableLevel: 2,
    attackBonus: 7,
    armorBonus: 6,
    speedBonus: 1,
    pitch: 'Armored cavalry that trades some agility for sustained frontline charge pressure.'
  },

  {
    id: 'stag_scout_stag_rider',
    faction: 'elf',
    fromClass: 'Stag Scout',
    toClass: 'Stag Rider',
    role: 'cavalry',
    requiredEquippedIds: ['elf_trained_stag'],
    requiredBarracksLevel: 1,
    requiredForgeLevel: 0,
    requiredStableLevel: 1,
    attackBonus: 3,
    armorBonus: 1,
    speedBonus: 4,
    pitch: 'First mounted Elven branch: a fast Stag rider built around flanks, Wards and open cells.'
  },
  {
    id: 'stag_rider_mounted_ranger',
    faction: 'elf',
    fromClass: 'Stag Rider',
    toClass: 'Mounted Ranger',
    role: 'cavalry',
    requiredEquippedIds: ['elf_trained_stag', 'elf_rider_bow'],
    requiredBarracksLevel: 3,
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    attackBonus: 6,
    armorBonus: 1,
    speedBonus: 3,
    pitch: 'Mobile ranged Stag branch that excels on open flanks and diagonal firing lanes.'
  },
  {
    id: 'stag_rider_stag_lancer',
    faction: 'elf',
    fromClass: 'Stag Rider',
    toClass: 'Stag Lancer',
    role: 'cavalry',
    requiredEquippedIds: ['elf_trained_stag', 'elf_moon_lance'],
    requiredBarracksLevel: 3,
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    attackBonus: 8,
    armorBonus: 2,
    speedBonus: 2,
    pitch: 'Precision charge branch that trades some ranged flexibility for decisive opening impact.'
  },

  {
    id: 'warg_scout_warg_rider',
    faction: 'orc',
    fromClass: 'Warg Scout',
    toClass: 'Warg Rider',
    role: 'cavalry',
    requiredEquippedIds: ['orc_trained_warg'],
    requiredBarracksLevel: 1,
    requiredForgeLevel: 0,
    requiredStableLevel: 1,
    attackBonus: 4,
    armorBonus: 1,
    speedBonus: 4,
    pitch: 'First mounted Orc branch: aggressive Warg cavalry that accelerates Momentum through fast contact.'
  },
  {
    id: 'warg_rider_warg_raider',
    faction: 'orc',
    fromClass: 'Warg Rider',
    toClass: 'Warg Raider',
    role: 'cavalry',
    requiredEquippedIds: ['orc_trained_warg', 'orc_raider_axe'],
    requiredBarracksLevel: 3,
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    attackBonus: 7,
    armorBonus: 3,
    speedBonus: 2,
    pitch: 'Sustained mounted melee branch that keeps Momentum climbing after the opening charge.'
  },
  {
    id: 'warg_rider_warg_lancer',
    faction: 'orc',
    fromClass: 'Warg Rider',
    toClass: 'Warg Lancer',
    role: 'cavalry',
    requiredEquippedIds: ['orc_trained_warg', 'orc_warg_lance'],
    requiredBarracksLevel: 3,
    requiredForgeLevel: 2,
    requiredStableLevel: 1,
    attackBonus: 9,
    armorBonus: 1,
    speedBonus: 1,
    pitch: 'Charge-focused Warg branch built for explosive opening pressure.'
  }
];

export function getEquipment(id: string) {
  return equipmentDefinitions.find(item => item.id === id) ?? null;
}

export function canUnitEquipEquipment(
  unit: UnitDefinition,
  equipment: EquipmentDefinition
) {
  if (equipment.faction !== unit.faction) return false;

  if (equipment.slot === 'artifact') return true;

  if (equipment.slot === 'mount') {
    return (
      unit.role === 'cavalry' ||
      ['Scout', 'Stag Scout', 'Warg Scout'].includes(unit.className)
    );
  }

  if (equipment.slot === 'shield') {
    return ['frontline', 'melee', 'cavalry'].includes(unit.role);
  }

  if (equipment.slot === 'armor') {
    if (equipment.tags.includes('heavy') || equipment.tags.includes('plate')) {
      return ['frontline', 'melee', 'cavalry'].includes(unit.role);
    }
    return true;
  }

  if (equipment.slot === 'weapon') {
    const recruitException = unit.className === 'Recruit';
    const mountedWeapon =
      equipment.tags.includes('cavalry') ||
      equipment.tags.includes('lance');
    if (mountedWeapon) {
      return (
        unit.role === 'cavalry' ||
        ['Scout Rider', 'Stag Rider', 'Warg Rider'].includes(unit.className)
      );
    }

    if (
      equipment.tags.includes('bow') ||
      equipment.tags.includes('ranged')
    ) {
      return (
        recruitException ||
        ['ranged', 'skirmish', 'cavalry'].includes(unit.role)
      );
    }

    if (
      equipment.tags.includes('sword') ||
      equipment.tags.includes('axe') ||
      equipment.tags.includes('spear') ||
      equipment.tags.includes('reach') ||
      equipment.tags.includes('melee')
    ) {
      return (
        recruitException ||
        ['frontline', 'melee', 'cavalry'].includes(unit.role)
      );
    }
  }

  return true;
}

export function equipmentSatisfiesRequirement(
  equippedId: string,
  requiredId: string
) {
  let current = getEquipment(equippedId);
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    if (current.id === requiredId) return true;
    visited.add(current.id);
    current = current.upgradeFromId ? getEquipment(current.upgradeFromId) : null;
  }

  return false;
}

export function getRecruitPromotionByEquipment(equipmentId: string) {
  return recruitPromotions.find(promotion => promotion.requiredEquipmentId === equipmentId) ?? null;
}

export function getAdvancedPromotionsForClass(className: string) {
  return advancedPromotions.filter(promotion => promotion.fromClass === className);
}
