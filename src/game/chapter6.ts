import type {
  ChapterNode,
  ResourceSiteDefinition
} from './types';

export const chapterSixNodes: ChapterNode[] = [
  { id: 'ch6_node_1', name: 'Strange Fire', type: 'battle', completed: false, current: true },
  { id: 'ch6_node_2', name: 'The First Ward', type: 'battle', completed: false },
  { id: 'ch6_node_3', name: 'Call the Arcanist', type: 'event', completed: false },
  { id: 'ch6_node_4', name: 'Power Has a Price', type: 'battle', completed: false },
  { id: 'ch6_node_5', name: 'Break the Spell', type: 'battle', completed: false },
  { id: 'ch6_node_6', name: 'Paths of the Arcane', type: 'event', completed: false },
  { id: 'ch6_node_7', name: 'Fire from Above', type: 'battle', completed: false },
  { id: 'ch6_node_8', name: 'The Silent Ground', type: 'battle', completed: false },
  { id: 'ch6_node_9', name: 'Wards and Steel', type: 'battle', completed: false },
  { id: 'ch6_node_10', name: 'The Arcane General', type: 'elite', completed: false },
  { id: 'ch6_node_11', name: 'Siege of the Glass Keep', type: 'boss', completed: false }
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
