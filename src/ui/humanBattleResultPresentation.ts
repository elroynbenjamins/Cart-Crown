import { humanCampaignSceneSets } from '../game/humanCampaignArtDirection';
import type { HumanCampaignChapter } from '../game/humanCampaignArtDirection';
import { humanLateMissions } from '../game/humanLateCampaign';
import type { HumanLateChapter, HumanLateMissionDefinition } from '../game/humanLateCampaign';

/**
 * An after-action moment is derived from the encounter that actually won.
 * Do not infer it from the current chapter: completing a boss can advance
 * the chapter before Results renders, or the player may return much later.
 */
export type HumanBattleResultMoment = Readonly<{
  chapter: HumanLateChapter;
  missionOrder: number;
  missionCount: number;
  name: string;
  region: string;
  takeaway: string;
  boss: boolean;
  final: boolean;
  nextRegion: string | null;
}>;

const byBattleResult = new Map<string, HumanLateMissionDefinition>();
for (const mission of humanLateMissions) {
  if (mission.encounterId) byBattleResult.set(mission.encounterId + '_result', mission);
}

export function humanBattleResultMoment(resultId: string): HumanBattleResultMoment | null {
  const mission = byBattleResult.get(resultId);
  if (!mission) return null;

  const chapter = mission.chapter;
  const final = chapter === 7 && mission.type === 'boss';
  const nextChapter = (chapter + 1) as HumanCampaignChapter;
  return {
    chapter,
    missionOrder: mission.order,
    missionCount: humanLateMissions.filter(candidate => candidate.chapter === chapter).length,
    name: mission.name,
    region: humanCampaignSceneSets[chapter].region,
    takeaway: mission.unlockText,
    boss: mission.type === 'boss',
    final,
    nextRegion: mission.type === 'boss' && !final
      ? humanCampaignSceneSets[nextChapter].region
      : null
  };
}
