import type {
  ChapterNode,
  RecruitOption,
  ResourceSiteDefinition
} from './types';

export type LastLoyalistsChoiceId =
  | 'offer_amnesty'
  | 'publish_the_seals'
  | 'seize_the_arsenal';

export type LastLoyalistsChoice = {
  id: LastLoyalistsChoiceId;
  name: string;
  description: string;
  effectText: string;
  attackMultiplier: number;
  armorMultiplier: number;
  retaliationMultiplier: number;
  detailedIntel: boolean;
};

export const chapterFourNodes: ChapterNode[] = [
  { id: 'ch4_node_1', name: 'The Long Front', type: 'battle', completed: false, current: true },
  { id: 'ch4_node_2', name: 'Raise Another Banner', type: 'battle', completed: false },
  { id: 'ch4_node_3', name: 'Two Ways to War', type: 'event', completed: false },
  { id: 'ch4_node_4', name: 'Broken Ground', type: 'battle', completed: false },
  { id: 'ch4_node_5', name: 'Hold the Breach', type: 'elite', completed: false },
  { id: 'ch4_node_6', name: 'Prepare for Battle', type: 'event', completed: false },
  { id: 'ch4_node_7', name: 'The Wrong Army', type: 'battle', completed: false },
  { id: 'ch4_node_8', name: 'Veteran Steel', type: 'event', completed: false },
  { id: 'ch4_node_9', name: 'Hunters in the Rear', type: 'battle', completed: false },
  { id: 'ch4_node_10', name: 'The Forked Banner', type: 'event', completed: false },
  { id: 'ch4_node_11', name: 'Siege of Greywatch', type: 'boss', completed: false }
];

export const strongholdMusterOptions: RecruitOption[] = [
  {
    id: 'royal_guard',
    archetype: 'Elite Frontline',
    pitch: 'A heavily protected guard squad built to anchor six-squad formations and commander-centered lines.',
    tradeoff: 'Excellent defense but slower and less flexible than the other Stronghold recruits.',
    unit: {
      id: 'hum_royal_guard_reinforcement',
      name: 'Cedric',
      className: 'Royal Guard',
      faction: 'human',
      role: 'frontline',
      tier: 4,
      level: 7,
      hp: 165,
      attack: 22,
      armor: 15,
      speed: 7
    }
  },
  {
    id: 'siege_engineer',
    archetype: 'Heavy Ranged',
    pitch: 'A siege-trained ranged squad that hits hard against elite enemies and fortified encounters.',
    tradeoff: 'Slow and vulnerable when exposed on the frontline.',
    unit: {
      id: 'hum_siege_engineer_reinforcement',
      name: 'Petra',
      className: 'Siege Engineer',
      faction: 'human',
      role: 'ranged',
      tier: 4,
      level: 7,
      hp: 115,
      attack: 27,
      armor: 7,
      speed: 8
    }
  },
  {
    id: 'banner_captain',
    archetype: 'Command Support',
    pitch: 'A veteran banner captain that complements commander builds and keeps a six-squad army organized.',
    tradeoff: 'Lower personal damage than the Guard or Siege Engineer.',
    unit: {
      id: 'hum_banner_captain_reinforcement',
      name: 'Helena',
      className: 'Banner Captain',
      faction: 'human',
      role: 'support',
      tier: 4,
      level: 7,
      hp: 120,
      attack: 14,
      armor: 9,
      speed: 10
    }
  }
];

export const lastLoyalistChoices: LastLoyalistsChoice[] = [
  {
    id: 'offer_amnesty',
    name: 'Offer Amnesty',
    description: 'Promise rank-and-file loyalists safe return if they abandon the Pretender General before battle.',
    effectText: '+10% armor against the Pretender General',
    attackMultiplier: 1,
    armorMultiplier: 1.1,
    retaliationMultiplier: 1,
    detailedIntel: false
  },
  {
    id: 'publish_the_seals',
    name: 'Publish the Royal Seals',
    description: 'Distribute copies of the conflicting royal orders and force the Pretender General to defend the legitimacy of his command.',
    effectText: 'Detailed intel and -20% enemy retaliation',
    attackMultiplier: 1,
    armorMultiplier: 1,
    retaliationMultiplier: 0.8,
    detailedIntel: true
  },
  {
    id: 'seize_the_arsenal',
    name: 'Seize the Loyalist Arsenal',
    description: 'Strike the remaining supply depots before the final battle and turn their own weapons against them.',
    effectText: '+10% attack against the Pretender General',
    attackMultiplier: 1.1,
    armorMultiplier: 1,
    retaliationMultiplier: 1,
    detailedIntel: false
  }
];

export const crownroadResourceSites: ResourceSiteDefinition[] = [
  {
    id: 'crownroad_salvage',
    faction: 'human',
    name: 'Crownroad Salvage Yard',
    icon: '⚙️',
    description: 'Abandoned royal wagons and broken standards are stripped for usable campaign material.',
    productionPerActivity: { wood: 4, iron: 3 }
  }
];
