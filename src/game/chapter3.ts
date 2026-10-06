import type {
  ChapterNode,
  RecruitOption,
  ResourceSiteDefinition
} from './types';

export type MarcherWarningChoiceId =
  | 'fortify_route'
  | 'hunt_couriers'
  | 'verify_beacons';

export type MarcherWarningChoice = {
  id: MarcherWarningChoiceId;
  name: string;
  description: string;
  effectText: string;
  attackMultiplier: number;
  armorMultiplier: number;
  speedMultiplier: number;
  detailedIntel: boolean;
};

export const chapterThreeNodes: ChapterNode[] = [
  { id: 'ch3_node_1', name: 'Into Frostmarch', type: 'story', completed: false, current: true },
  { id: 'ch3_node_2', name: 'A Wider Front', type: 'battle', completed: false },
  { id: 'ch3_node_3', name: 'Frozen Steel', type: 'event', completed: false },
  { id: 'ch3_node_4', name: 'Hooves in the Snow', type: 'battle', completed: false },
  { id: 'ch3_node_5', name: 'Choose Your Rider', type: 'event', completed: false },
  { id: 'ch3_node_6', name: 'The Line Buckles', type: 'battle', completed: false },
  { id: 'ch3_node_7', name: 'Through the Gap', type: 'battle', completed: false },
  { id: 'ch3_node_8', name: 'Wolves on the Wing', type: 'elite', completed: false },
  { id: 'ch3_node_9', name: 'The Layered Host', type: 'battle', completed: false },
  { id: 'ch3_node_10', name: 'Cold Roads', type: 'supply', completed: false },
  { id: 'ch3_node_11', name: 'Battle for Frostgate', type: 'boss', completed: false }
];

export const marcherAuxiliaryOptions: RecruitOption[] = [
  {
    id: 'marcher_halberdier',
    archetype: 'Control Frontline',
    pitch: 'A professional polearm squad built to hold lanes and punish mounted enemies.',
    tradeoff: 'Slower than lighter infantry and offers no ranged pressure.',
    unit: {
      id: 'hum_marcher_halberdier',
      name: 'Bran',
      className: 'Halberdier',
      faction: 'human',
      role: 'frontline',
      tier: 3,
      level: 5,
      hp: 135,
      attack: 19,
      armor: 10,
      speed: 7
    }
  },
  {
    id: 'marcher_chaplain',
    archetype: 'Morale Support',
    pitch: 'A field chaplain who stabilizes hard battles and fits support-oriented formations.',
    tradeoff: 'Low direct damage compared with an additional combat squad.',
    unit: {
      id: 'hum_marcher_chaplain',
      name: 'Edwin',
      className: 'Field Chaplain',
      faction: 'human',
      role: 'support',
      tier: 3,
      level: 5,
      hp: 105,
      attack: 10,
      armor: 7,
      speed: 9
    }
  },
  {
    id: 'marcher_ranger',
    archetype: 'Mobile Skirmisher',
    pitch: 'A Border Ranger brings speed and ranged pressure without requiring another cavalry investment.',
    tradeoff: 'Less durable than the Halberdier and less supportive than the Chaplain.',
    unit: {
      id: 'hum_marcher_ranger',
      name: 'Sabine',
      className: 'Border Ranger',
      faction: 'human',
      role: 'skirmish',
      tier: 3,
      level: 5,
      hp: 105,
      attack: 18,
      armor: 6,
      speed: 15
    }
  }
];

export const marcherWarningChoices: MarcherWarningChoice[] = [
  {
    id: 'fortify_route',
    name: 'Fortify the Supply Route',
    description: 'Assume the roads are compromised and move behind reinforced wagon guards.',
    effectText: '+10% armor in Chapter 3 campaign battles',
    attackMultiplier: 1,
    armorMultiplier: 1.1,
    speedMultiplier: 1,
    detailedIntel: false
  },
  {
    id: 'hunt_couriers',
    name: 'Hunt the False Couriers',
    description: 'Move aggressively against messengers carrying contradictory orders between forts.',
    effectText: '+8% attack and +3% speed in Chapter 3 campaign battles',
    attackMultiplier: 1.08,
    armorMultiplier: 1,
    speedMultiplier: 1.03,
    detailedIntel: false
  },
  {
    id: 'verify_beacons',
    name: 'Verify Every Beacon',
    description: 'Slow the advance long enough to confirm which warning fires are genuine.',
    effectText: 'Detailed intel and +5% speed in Chapter 3 campaign battles',
    attackMultiplier: 1,
    armorMultiplier: 1,
    speedMultiplier: 1.05,
    detailedIntel: true
  }
];

export const marcherResourceSites: ResourceSiteDefinition[] = [
  {
    id: 'marcher_depot',
    faction: 'human',
    name: 'Marcher Supply Depot',
    icon: '🏚️',
    description: 'A reconciled border depot collects tolls and forwards supplies to Greenkeep.',
    productionPerActivity: { gold: 6, provisions: 2 }
  }
];
