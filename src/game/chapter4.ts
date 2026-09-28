import type {
  ChapterNode,
  RecruitOption,
  ResourceSiteDefinition
} from './types';

export const chapterFourNodes: ChapterNode[] = [
  { id: 'ch4_node_1', name: 'Stronghold Muster', type: 'event', completed: false, current: true },
  { id: 'ch4_node_2', name: 'Broken Standards', type: 'battle', completed: false },
  { id: 'ch4_node_3', name: 'The Empty Throne', type: 'event', completed: false },
  { id: 'ch4_node_4', name: 'Crownroad Ambush', type: 'elite', completed: false },
  { id: 'ch4_node_5', name: 'The Last Loyalists', type: 'event', completed: false },
  { id: 'ch4_node_6', name: 'The Pretender General', type: 'boss', completed: false }
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
