import type {
  ChapterNode,
  ResourceSiteDefinition
} from './types';

export const chapterFiveNodes: ChapterNode[] = [
  { id: 'ch5_node_1', name: 'Too Many Fronts', type: 'battle', completed: false, current: true },
  { id: 'ch5_node_2', name: 'The Sixth Banner', type: 'event', completed: false },
  { id: 'ch5_node_3', name: 'Rally the Line', type: 'battle', completed: false },
  { id: 'ch5_node_4', name: 'Above the Shieldwall', type: 'battle', completed: false },
  { id: 'ch5_node_5', name: 'Answers to the Sky', type: 'event', completed: false },
  { id: 'ch5_node_6', name: "Commander's Hand", type: 'event', completed: false },
  { id: 'ch5_node_7', name: 'Three Lines Deep', type: 'battle', completed: false },
  { id: 'ch5_node_8', name: 'Hammer and Wing', type: 'battle', completed: false },
  { id: 'ch5_node_9', name: 'The Strongest Army?', type: 'elite', completed: false },
  { id: 'ch5_node_10', name: "Crown's Muster", type: 'event', completed: false },
  { id: 'ch5_node_11', name: 'Battle for the Crownroad', type: 'boss', completed: false }
];

export const capitalResourceSites: ResourceSiteDefinition[] = [
  {
    id: 'royal_archive_stores',
    faction: 'human',
    name: 'Royal Archive Stores',
    icon: '📚',
    description: 'Recovered ledgers, seals and administrative stores give Greenkeep a steady stream of reusable records and Crown coin.',
    productionPerActivity: { gold: 8, stone: 2 }
  }
];
