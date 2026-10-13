import type { ChapterNode } from './types';
import { humanLateChapterNodes } from './humanLateCampaign';

export const chapterSevenNodes: ChapterNode[] =
  humanLateChapterNodes[7].map(node => ({ ...node }));
