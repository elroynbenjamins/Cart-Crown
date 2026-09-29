import type {
  ResourceWallet
} from './types';

export type SideModeRewardMultiplier =
  | 0
  | 0.5
  | 1;

export const MAX_EXPEDITION_TICKETS = 3;

export function getWarTableBoardRewardMultiplier(
  boardsClearedThisChapter: number
): SideModeRewardMultiplier {
  if (boardsClearedThisChapter <= 0) {
    return 1;
  }

  if (boardsClearedThisChapter === 1) {
    return 0.5;
  }

  return 0;
}

export function getKingdomDefenseRewardMultiplier({
  firstClear,
  currentChapter,
  rewardChapter,
  rewardedRunsThisChapter
}: {
  firstClear: boolean;
  currentChapter: number;
  rewardChapter: number;
  rewardedRunsThisChapter: number;
}): SideModeRewardMultiplier {
  if (firstClear) return 1;

  const runs =
    rewardChapter === currentChapter
      ? rewardedRunsThisChapter
      : 0;

  return runs <= 0 ? 0.5 : 0;
}

export function getExpeditionRewardMultiplier({
  currentChapter,
  rewardChapter,
  rewardedRunsThisChapter
}: {
  currentChapter: number;
  rewardChapter: number;
  rewardedRunsThisChapter: number;
}): SideModeRewardMultiplier {
  const runs =
    rewardChapter === currentChapter
      ? rewardedRunsThisChapter
      : 0;

  if (runs <= 0) return 1;
  if (runs === 1) return 0.5;
  return 0;
}

export function getSiegeRewardMultiplier({
  currentChapter,
  rewardChapter,
  rewardedRunsThisChapter
}: {
  currentChapter: number;
  rewardChapter: number;
  rewardedRunsThisChapter: number;
}): SideModeRewardMultiplier {
  const runs =
    rewardChapter === currentChapter
      ? rewardedRunsThisChapter
      : 0;

  if (runs <= 0) return 1;
  if (runs === 1) return 0.5;
  return 0;
}

export function scaleResourceReward(
  reward: Partial<ResourceWallet>,
  multiplier: SideModeRewardMultiplier
): Partial<ResourceWallet> {
  if (multiplier <= 0) return {};

  const scaled: Partial<ResourceWallet> = {};

  for (const [key, amount] of Object.entries(reward)) {
    const resource =
      key as keyof ResourceWallet;
    const value = amount ?? 0;

    if (value <= 0) continue;

    scaled[resource] = Math.max(
      1,
      Math.round(value * multiplier)
    );
  }

  return scaled;
}

export function getExpeditionTicketsAfterChapterTransition(
  currentTickets: number,
  chapterNumber: number
) {
  const tickets = Math.max(
    0,
    Math.floor(currentTickets)
  );

  if (chapterNumber < 3) {
    return Math.min(
      MAX_EXPEDITION_TICKETS,
      tickets
    );
  }

  return Math.min(
    MAX_EXPEDITION_TICKETS,
    tickets + 1
  );
}

export function getSideModeRewardLabel(
  multiplier: SideModeRewardMultiplier
) {
  if (multiplier === 1) {
    return 'FULL REWARDS';
  }

  if (multiplier === 0.5) {
    return '50% REWARDS';
  }

  return 'PRACTICE';
}
