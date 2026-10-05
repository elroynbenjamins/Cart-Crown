import type {
  ChapterNode,
  ResourceWallet,
  UnitDefinition,
  WagonItemDefinition
} from './types';
import { starterWagonItems } from './data';
import { getEarlyCampaignNodes } from './earlyCampaign';

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
  }
];

export const elfChapterOneNodes: ChapterNode[] = getEarlyCampaignNodes('elf', 1);

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
  }
];

export const orcChapterOneNodes: ChapterNode[] = getEarlyCampaignNodes('orc', 1);

export function factionStarterWagonItems(): WagonItemDefinition[] {
  return starterWagonItems.map(item => ({ ...item }));
}
