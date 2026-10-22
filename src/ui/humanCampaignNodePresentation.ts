import type { ChapterNode } from '../game/types';

/**
 * Runtime node.type is part of the saved campaign contract and must not be
 * rewritten for visual/UI semantics. Chapter 2 mission 4 is played through
 * Kingdom Defense, not an elite field encounter.
 */
export function humanCampaignDisplayNodeType(
  chapterNumber: number,
  node: Pick<ChapterNode, 'id' | 'type'>
): ChapterNode['type'] {
  return chapterNumber === 2 && node.id === 'ch2_node_4' && node.type === 'elite'
    ? 'defense'
    : node.type;
}
