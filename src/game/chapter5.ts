import { humanLateChapterNodes } from './humanLateCampaign';
import type {
  ChapterNode,
  ResourceSiteDefinition
} from './types';

export const chapterFiveNodes: ChapterNode[] = humanLateChapterNodes[5].map(node => ({ ...node }));

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
