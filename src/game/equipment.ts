import type {
  AdvancedPromotionDefinition,
  EquipmentDefinition,
  PromotionDefinition
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
  }
];

export function getEquipment(id: string) {
  return equipmentDefinitions.find(item => item.id === id) ?? null;
}

export function getRecruitPromotionByEquipment(equipmentId: string) {
  return recruitPromotions.find(promotion => promotion.requiredEquipmentId === equipmentId) ?? null;
}

export function getAdvancedPromotionsForClass(className: string) {
  return advancedPromotions.filter(promotion => promotion.fromClass === className);
}
