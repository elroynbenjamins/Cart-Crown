import type {
  ChapterNode,
  ResourceSiteDefinition
} from './types';

export const chapterFiveNodes: ChapterNode[] = [
  { id: 'ch5_node_1', name: 'Capital Council', type: 'event', completed: false, current: true },
  { id: 'ch5_node_2', name: 'Old Royal Lands', type: 'battle', completed: false },
  { id: 'ch5_node_3', name: 'Broken Archives', type: 'event', completed: false },
  { id: 'ch5_node_4', name: 'Ashen Envoy', type: 'elite', completed: false },
  { id: 'ch5_node_5', name: 'The Royal Ledger', type: 'event', completed: false },
  { id: 'ch5_node_6', name: 'Gate of Crownspire', type: 'boss', completed: false }
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
