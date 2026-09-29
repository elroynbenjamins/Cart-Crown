import type { ChapterNode, FactionId } from './types';

export type CampaignCapacity = {
  deploymentCap: number;
  rosterCap: number;
};

const chapterOneMilestones: Record<
  FactionId,
  { early: string; late: string }
> = {
  human: { early: 'node_3', late: 'node_5' },
  elf: { early: 'elf_node_3', late: 'elf_node_5' },
  orc: { early: 'orc_node_3', late: 'orc_node_5' }
};

const chapterTwoMilestones: Record<
  FactionId,
  { early: string; late: string }
> = {
  human: { early: 'ch2_node_2', late: 'ch2_node_4' },
  elf: { early: 'elf2_node_2', late: 'elf2_node_4' },
  orc: { early: 'orc2_node_2', late: 'orc2_node_4' }
};

const chapterThreeMilestones: Record<
  FactionId,
  { early: string; late: string }
> = {
  human: { early: 'ch3_node_2', late: 'ch3_node_4' },
  elf: { early: 'elf3_node_2', late: 'elf3_node_4' },
  orc: { early: 'orc3_node_2', late: 'orc3_node_4' }
};

function completed(
  nodes: ChapterNode[],
  id: string
) {
  return nodes.some(
    node => node.id === id && Boolean(node.completed)
  );
}

function reached(
  nodes: ChapterNode[],
  id: string
) {
  return nodes.some(
    node =>
      node.id === id &&
      (Boolean(node.completed) || Boolean(node.current))
  );
}

export function getCampaignCapacity(
  faction: FactionId,
  chapterNumber: number,
  nodes: ChapterNode[]
): CampaignCapacity {
  if (chapterNumber <= 1) {
    const milestone = chapterOneMilestones[faction];
    if (
      completed(nodes, milestone.late) ||
      reached(
        nodes,
        faction === 'human'
          ? 'node_6'
          : faction === 'elf'
            ? 'elf_node_6'
            : 'orc_node_6'
      )
    ) {
      return { deploymentCap: 5, rosterCap: 9 };
    }
    if (
      completed(nodes, milestone.early) ||
      reached(
        nodes,
        faction === 'human'
          ? 'node_4'
          : faction === 'elf'
            ? 'elf_node_4'
            : 'orc_node_4'
      )
    ) {
      return { deploymentCap: 4, rosterCap: 7 };
    }
    return { deploymentCap: 3, rosterCap: 5 };
  }

  if (chapterNumber === 2) {
    const milestone = chapterTwoMilestones[faction];
    if (
      completed(nodes, milestone.late) ||
      reached(
        nodes,
        faction === 'human'
          ? 'ch2_node_5'
          : faction === 'elf'
            ? 'elf2_node_5'
            : 'orc2_node_5'
      )
    ) {
      return { deploymentCap: 7, rosterCap: 16 };
    }
    if (
      completed(nodes, milestone.early) ||
      reached(
        nodes,
        faction === 'human'
          ? 'ch2_node_3'
          : faction === 'elf'
            ? 'elf2_node_3'
            : 'orc2_node_3'
      )
    ) {
      return { deploymentCap: 6, rosterCap: 12 };
    }
    return { deploymentCap: 5, rosterCap: 9 };
  }

  // Pass 2 activates the new curve through Chapter 2. Later chapters
  // stay at seven deployed squads until their dedicated balance pass
  // raises the battlefield to the authored nine-squad cap.
  if (chapterNumber >= 3) {
    return {
      deploymentCap: 7,
      rosterCap:
        chapterNumber >= 8
          ? 36
          : chapterNumber === 7
            ? 34
            : chapterNumber === 6
              ? 32
              : 30
    };
  }

  return { deploymentCap: 3, rosterCap: 5 };
}
