import {
  humanCampaignMissionCounts,
  humanCampaignSceneSets
} from '../game/humanCampaignArtDirection';
import type { HumanCampaignChapter } from '../game/humanCampaignArtDirection';

export type HumanChapterTransition = Readonly<{
  kind: 'next-front' | 'finale';
  securedChapter: HumanCampaignChapter;
  securedRegion: string;
  securedBoss: string;
  revealedChapter: HumanCampaignChapter | null;
  revealedRegion: string | null;
  revealedMission: string | null;
}>;

/**
 * Pure, derived storytelling: no modal, timer, save flag, or reward payout.
 * The reveal lives only until the first current-chapter mission is completed,
 * avoiding repeated popups every time Campaign is opened. The final campaign
 * accolade persists as an earned achievement while Chapter 7 stays complete.
 */
export function humanChapterTransition(
  chapterNumber: number, completedCurrentChapter: number, currentMissionCount: number
): HumanChapterTransition | null {
  if (!Number.isInteger(chapterNumber) || !Number.isInteger(completedCurrentChapter) ||
      !Number.isInteger(currentMissionCount) || currentMissionCount <= 0 ||
      completedCurrentChapter < 0 || completedCurrentChapter > currentMissionCount) return null;
  if (chapterNumber === 7 && currentMissionCount === humanCampaignMissionCounts[7] &&
      completedCurrentChapter === currentMissionCount) {
    const chapter = humanCampaignSceneSets[7];
    return {
      kind: 'finale',
      securedChapter: 7,
      securedRegion: chapter.region,
      securedBoss: chapter.scenes[chapter.scenes.length - 1]!.title,
      revealedChapter: null,
      revealedRegion: null,
      revealedMission: null
    };
  }
  if (chapterNumber < 2 || chapterNumber > 7 || completedCurrentChapter !== 0 ||
      currentMissionCount !== humanCampaignMissionCounts[chapterNumber as HumanCampaignChapter]) return null;
  const securedChapter = (chapterNumber - 1) as HumanCampaignChapter;
  const revealedChapter = chapterNumber as HumanCampaignChapter;
  const previous = humanCampaignSceneSets[securedChapter];
  const next = humanCampaignSceneSets[revealedChapter];
  return {
    kind: 'next-front',
    securedChapter,
    securedRegion: previous.region,
    securedBoss: previous.scenes[previous.scenes.length - 1]!.title,
    revealedChapter,
    revealedRegion: next.region,
    revealedMission: next.scenes[next.missionScenes[0]!]!.title
  };
}
