import { humanLateChapterNodes } from './humanLateCampaign';
import type {
  ChapterNode,
  ResourceSiteDefinition
} from './types';

export const chapterSixNodes: ChapterNode[] = humanLateChapterNodes[6].map(node => ({ ...node }));

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
