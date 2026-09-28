import type { EquipmentDefinition, PromotionDefinition } from './types';

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
    description: 'Simple frontier bow. Opens the Archer promotion path.'
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

export function getEquipment(id: string) {
  return equipmentDefinitions.find(item => item.id === id) ?? null;
}

export function getRecruitPromotionByEquipment(equipmentId: string) {
  return recruitPromotions.find(promotion => promotion.requiredEquipmentId === equipmentId) ?? null;
}
