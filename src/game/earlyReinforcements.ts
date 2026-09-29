import type { FactionId, UnitDefinition } from './types';

export const chapterOneFifthReinforcements: Record<FactionId, UnitDefinition> = {
  human: {
    id: 'hum_refugee_guard',
    name: 'Bren',
    className: 'Refugee Guard',
    faction: 'human',
    role: 'frontline',
    tier: 2,
    level: 2,
    hp: 108,
    attack: 12,
    armor: 7,
    speed: 8,
    battleTags: ['ground', 'armored'],
    deploymentCapacity: 1
  },
  elf: {
    id: 'elf_wayfarer_blade',
    name: 'Maelis',
    className: 'Wayfarer Blade',
    faction: 'elf',
    role: 'melee',
    tier: 2,
    level: 2,
    hp: 94,
    attack: 15,
    armor: 5,
    speed: 13,
    battleTags: ['ground'],
    deploymentCapacity: 1
  },
  orc: {
    id: 'orc_clan_axeman',
    name: 'Goruk',
    className: 'Clan Axeman',
    faction: 'orc',
    role: 'melee',
    tier: 2,
    level: 2,
    hp: 118,
    attack: 16,
    armor: 5,
    speed: 9,
    battleTags: ['ground'],
    deploymentCapacity: 1
  }
};

export const chapterTwoSeventhReinforcements: Record<FactionId, UnitDefinition> = {
  human: {
    id: 'hum_banner_sergeant',
    name: 'Sabine',
    className: 'Banner Sergeant',
    faction: 'human',
    role: 'support',
    tier: 2,
    level: 3,
    hp: 104,
    attack: 10,
    armor: 7,
    speed: 9,
    battleTags: ['ground', 'support'],
    deploymentCapacity: 1
  },
  elf: {
    id: 'elf_wayfarer_healer',
    name: 'Ithiel',
    className: 'Wayfarer Healer',
    faction: 'elf',
    role: 'support',
    tier: 2,
    level: 3,
    hp: 94,
    attack: 9,
    armor: 5,
    speed: 12,
    battleTags: ['ground', 'support'],
    deploymentCapacity: 1
  },
  orc: {
    id: 'orc_clan_standard',
    name: 'Urgra',
    className: 'Clan Standard-Bearer',
    faction: 'orc',
    role: 'support',
    tier: 2,
    level: 3,
    hp: 116,
    attack: 10,
    armor: 6,
    speed: 9,
    battleTags: ['ground', 'support'],
    deploymentCapacity: 1
  }
};

export function getChapterOneFifthReinforcement(faction: FactionId) {
  return { ...chapterOneFifthReinforcements[faction] };
}

export function getChapterTwoSeventhReinforcement(faction: FactionId) {
  return { ...chapterTwoSeventhReinforcements[faction] };
}
