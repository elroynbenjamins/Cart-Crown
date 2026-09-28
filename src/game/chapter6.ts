import type {
  ChapterNode,
  ResourceSiteDefinition
} from './types';

export const chapterSixNodes: ChapterNode[] = [
  { id: 'ch6_node_1', name: 'Grand Council', type: 'event', completed: false, current: true },
  { id: 'ch6_node_2', name: 'Sundered Fields', type: 'battle', completed: false },
  { id: 'ch6_node_3', name: 'Concord Vault', type: 'event', completed: false },
  { id: 'ch6_node_4', name: 'Ashen Court', type: 'elite', completed: false },
  { id: 'ch6_node_5', name: 'The Forced Beacon', type: 'event', completed: false },
  { id: 'ch6_node_6', name: 'Return to Crownspire', type: 'boss', completed: false }
];

export const crownspireResourceSites: ResourceSiteDefinition[] = [
  {
    id: 'concord_cache',
    faction: 'human',
    name: 'Concord Vault Cache',
    icon: '🔐',
    description: 'Recovered neutral stores and engineering stock from beneath Crownspire support the final campaign.',
    productionPerActivity: { gold: 6, iron: 3, provisions: 2 }
  }
];
