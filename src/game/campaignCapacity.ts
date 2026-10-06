import type { ChapterNode, FactionId } from './types';

export function getCampaignActiveSquadCap({
  faction,
  chapterNumber,
  stageFormationSlots,
  chapterNodes
}: {
  faction: FactionId;
  chapterNumber: number;
  stageFormationSlots: number;
  chapterNodes: ChapterNode[];
}) {
  if (faction !== 'human') {
    return stageFormationSlots;
  }

  const roadmapCap =
    chapterNumber <= 1
      ? 2
      : chapterNumber === 2
        ? chapterNodes.some(
            node =>
              node.id === 'ch2_m01' &&
              node.completed
          )
          ? 3
          : 2
        : chapterNumber === 3
          ? 4
          : chapterNumber === 4
            ? 5
            : 6;

  return Math.min(stageFormationSlots, roadmapCap);
}
