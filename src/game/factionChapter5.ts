import type {
  ChapterNode,
  ResourceSiteDefinition
} from './types';

export type FactionMandateId =
  | 'living_canopy'
  | 'moonwatch'
  | 'rootway_stewardship'
  | 'blood_hunt'
  | 'iron_clan'
  | 'shared_spoils';

export type FactionMandateDefinition = {
  id: FactionMandateId;
  faction: 'elf' | 'orc';
  name: string;
  subtitle: string;
  description: string;
  effectText: string;
  attackMultiplier: number;
  armorMultiplier: number;
  speedMultiplier: number;
  productionMultiplier: number;
  commanderSkillPowerMultiplier: number;
  detailedIntel: boolean;
};

export const factionChapterFiveResourceSites: ResourceSiteDefinition[] = [
  {
    id: 'elf_worldroot_nursery',
    faction: 'elf',
    name: 'Worldroot Nursery',
    icon: '🌳',
    description: 'Protected shoots from the wounded Worldroot provide spiritwood, herbs and food for the final campaign.',
    productionPerActivity: { wood: 5, provisions: 4 }
  },
  {
    id: 'orc_united_clan_depot',
    faction: 'orc',
    name: 'United Clan Depot',
    icon: '🔥',
    description: 'Every clan contributes food, iron and captured stores to one guarded depot.',
    productionPerActivity: { iron: 3, provisions: 4 }
  }
];

export const elfChapterSixNodes: ChapterNode[] = [
  { id: 'elf6_node_1', name: 'Starroot Council', type: 'event', completed: false, current: true },
  { id: 'elf6_node_2', name: 'Stars over Crownspire', type: 'battle', completed: false },
  { id: 'elf6_node_3', name: 'Concord Rootway', type: 'event', completed: false },
  { id: 'elf6_node_4', name: 'Ashen Starwatch', type: 'elite', completed: false },
  { id: 'elf6_node_5', name: 'The Root Seal', type: 'event', completed: false },
  { id: 'elf6_node_6', name: 'Return through the Roots', type: 'boss', completed: false }
];

export const orcChapterSixNodes: ChapterNode[] = [
  { id: 'orc6_node_1', name: 'Confederacy Council', type: 'event', completed: false, current: true },
  { id: 'orc6_node_2', name: 'The Truth at Crownspire', type: 'battle', completed: false },
  { id: 'orc6_node_3', name: 'Concord Warpath', type: 'event', completed: false },
  { id: 'orc6_node_4', name: 'Ashen Warfires', type: 'elite', completed: false },
  { id: 'orc6_node_5', name: 'The Clan Seal', type: 'event', completed: false },
  { id: 'orc6_node_6', name: 'Truth at Crownspire', type: 'boss', completed: false }
];

export const factionMandates: FactionMandateDefinition[] = [
  {
    id: 'living_canopy',
    faction: 'elf',
    name: 'Living Canopy',
    subtitle: 'Worldroot Attunement',
    description: 'Layer the army beneath overlapping living wards, prioritizing survival while the rootways close behind it.',
    effectText: '+9% army armor',
    attackMultiplier: 1,
    armorMultiplier: 1.09,
    speedMultiplier: 1,
    productionMultiplier: 1,
    commanderSkillPowerMultiplier: 1,
    detailedIntel: false
  },
  {
    id: 'moonwatch',
    faction: 'elf',
    name: 'Moonwatch',
    subtitle: 'Worldroot Attunement',
    description: 'Bind scouts, Ward Beacons and Moonlit Watch into one far-sight network.',
    effectText: '+6% speed and detailed Battle Prep intel',
    attackMultiplier: 1,
    armorMultiplier: 1,
    speedMultiplier: 1.06,
    productionMultiplier: 1,
    commanderSkillPowerMultiplier: 1,
    detailedIntel: true
  },
  {
    id: 'rootway_stewardship',
    faction: 'elf',
    name: 'Rootway Stewardship',
    subtitle: 'Worldroot Attunement',
    description: 'Use the rebuilt rootways to move supplies instead of concentrating power at the front.',
    effectText: '+25% regional production',
    attackMultiplier: 1,
    armorMultiplier: 1,
    speedMultiplier: 1,
    productionMultiplier: 1.25,
    commanderSkillPowerMultiplier: 1,
    detailedIntel: false
  },
  {
    id: 'blood_hunt',
    faction: 'orc',
    name: 'Blood Hunt Pact',
    subtitle: 'Clan Pact',
    description: 'The clans agree that the first warband to find the enemy must strike immediately instead of waiting for every banner.',
    effectText: '+9% army attack and +3% speed',
    attackMultiplier: 1.09,
    armorMultiplier: 1,
    speedMultiplier: 1.03,
    productionMultiplier: 1,
    commanderSkillPowerMultiplier: 1,
    detailedIntel: false
  },
  {
    id: 'iron_clan',
    faction: 'orc',
    name: 'Iron Clan Pact',
    subtitle: 'Clan Pact',
    description: 'Every clan assigns veteran shields and Ironhides to protect the shared line.',
    effectText: '+10% army armor',
    attackMultiplier: 1,
    armorMultiplier: 1.1,
    speedMultiplier: 1,
    productionMultiplier: 1,
    commanderSkillPowerMultiplier: 1,
    detailedIntel: false
  },
  {
    id: 'shared_spoils',
    faction: 'orc',
    name: 'Shared Spoils Pact',
    subtitle: 'Clan Pact',
    description: 'Captured food, metal and tribute are pooled before clan shares are distributed.',
    effectText: '+25% regional production',
    attackMultiplier: 1,
    armorMultiplier: 1,
    speedMultiplier: 1,
    productionMultiplier: 1.25,
    commanderSkillPowerMultiplier: 1,
    detailedIntel: false
  }
];

export function getFactionMandates(faction: 'elf' | 'orc') {
  return factionMandates.filter(mandate => mandate.faction === faction);
}

export function getFactionMandate(id: string | null) {
  if (!id) return null;
  return factionMandates.find(mandate => mandate.id === id) ?? null;
}
