import { getCampaignActiveSquadCap, getCampaignMissionBlueprint } from '../game/campaignMissionRoadmap';
import { humanCampaignMissionCounts, humanCampaignSceneSets } from '../game/humanCampaignArtDirection';
import type { HumanCampaignChapter } from '../game/humanCampaignArtDirection';

/**
 * Narrative copy is presentation-only. Progress, squad caps and mission identity
 * must always come from live chapter nodes, never from an inferred story flag.
 */
export type HumanChapterStory = Readonly<{
  tone: string;
  stakes: string;
  enemy: string;
  finale: string;
  secured: string;
  nextFront: string;
}>;

export const humanChapterStories: Record<HumanCampaignChapter, HumanChapterStory> = {
  1: {
    tone: 'SURVIVAL · GREENKEEP',
    stakes: 'A handful of survivors defend the last road home. Every recovered outpost matters.',
    enemy: 'Raider captain behind a stolen palisade',
    finale: 'Retake the outpost before the survivors lose their refuge.',
    secured: 'The remnant has a home again, and the first banner still flies.',
    nextFront: 'Iron Hills: recruit a third squad and prepare for disciplined warfare.'
  },
  2: {
    tone: 'MUSTER · IRON HILLS',
    stakes: 'A fragile camp becomes a trained warband. Forge equipment, form ranks and hold the iron roads.',
    enemy: 'The Iron Provost and his shieldwall guard',
    finale: 'Break the Provost\'s protected line to open the mountain route.',
    secured: 'The iron roads are free. Greenkeep can now march beyond the hills.',
    nextFront: 'Frostmarch: brace for cavalry, deep formations and a fourth deployment slot.'
  },
  3: {
    tone: 'FRONTIER · FROSTMARCH',
    stakes: 'Snow closes the passes while cavalry hunts the flanks. The army must learn to survive a broken line.',
    enemy: 'The Lord Marshal at Frostgate',
    finale: 'Hold the frozen front and break through Frostgate.',
    secured: 'The frozen frontier holds, but the real war stretches far beyond the pass.',
    nextFront: 'Greywatch: reinforce the army and prepare for a fortified war.'
  },
  4: {
    tone: 'FORTIFICATION · GREYWATCH',
    stakes: 'One battle is no longer enough. Veteran guards, reserves and siege camps decide the frontier.',
    enemy: 'The Pretender General behind Greywatch walls',
    finale: 'Breach Greywatch and unseat its entrenched commander.',
    secured: 'Greywatch has fallen, opening the great road to the crown.',
    nextFront: 'Crownroad: raise the sixth banner and master combined arms.'
  },
  5: {
    tone: 'ARMY · CROWNROAD',
    stakes: 'Six banners face threats on the ground and in the sky. Counters matter more than raw army power.',
    enemy: 'The royal host across the causeway',
    finale: 'Win the causeway battle against a coordinated six-squad host.',
    secured: 'The Crownroad belongs to the kingdom. Strange light now gathers ahead.',
    nextFront: 'Glass Keep: confront wards, arcanists and magical suppression.'
  },
  6: {
    tone: 'ARCANE · GLASS KEEP',
    stakes: 'Unfamiliar wards reshape the battlefield. Steel alone cannot defeat the spellbound general.',
    enemy: 'The Arcane General behind the ward pillars',
    finale: 'Shatter the warded fortress and defeat its arcane command.',
    secured: 'The wards are broken. Only Blackstone stands between the army and victory.',
    nextFront: 'Blackstone: prepare engineers and six squads for the final siege.'
  },
  7: {
    tone: 'FINAL SIEGE · BLACKSTONE',
    stakes: 'The road ends at the black citadel. Protect engineers, withstand counterattacks and reach the gate.',
    enemy: 'The last enemy command inside Blackstone',
    finale: 'Survive the final assault and bring the seven-chapter war to an end.',
    secured: 'Blackstone has fallen. The Human campaign is complete.',
    nextFront: 'The Human campaign is complete. Review the factions that are now available.'
  }
};

export type HumanCampaignNodeSnapshot = Readonly<{
  id: string;
  name: string;
  type: string;
  completed: boolean;
  current: boolean;
}>;

export type HumanCampaignProgressCue = Readonly<{
  chapter: HumanCampaignChapter;
  region: string;
  completed: number;
  total: number;
  currentSquadCap: number;
  nextMissionName: string;
  nextMissionOrder: number | null;
  nextMissionKind: string | null;
  nextSceneLocation: string | null;
  bossName: string;
  bossState: 'secured' | 'current' | 'ahead';
  squadMessage: string;
  milestoneMessage: string;
  finished: boolean;
}>;

/** Pure selector: safe across resume, Back, chapter advances and reordered screens. */
export function humanCampaignProgressCue(
  chapterNumber: number,
  nodes: readonly HumanCampaignNodeSnapshot[]
): HumanCampaignProgressCue | null {
  const chapter = chapterNumber as HumanCampaignChapter;
  const count = humanCampaignMissionCounts[chapter];
  if (!count || nodes.length !== count) return null;
  const completed = nodes.filter(node => node.completed).length;
  const currentIndex = nodes.findIndex(node => node.current && !node.completed);
  const nextIndex = currentIndex >= 0 ? currentIndex : nodes.findIndex(node => !node.completed);
  const nextNode = nextIndex < 0 ? null : nodes[nextIndex]!;
  const order = nextIndex < 0 ? null : nextIndex + 1;
  const currentSquadCap = getCampaignActiveSquadCap(chapter, nodes.map(node => ({ id: node.id, completed: node.completed })));
  const bossName = getCampaignMissionBlueprint(chapter, count)?.name ?? nodes[count - 1]?.name ?? 'Chapter finale';
  const bossNode = nodes[count - 1]!;
  const bossState = bossNode.completed ? 'secured' : bossNode.current ? 'current' : 'ahead';
  const expansion = chapter >= 3 && chapter <= 5 ? nodes[1] : null;
  let squadMessage: string;
  if (chapter === 1) squadMessage = '2 active squads · third squad opens in Chapter 2';
  else if (chapter === 2) squadMessage = '3 active squads · next expansion in Frostmarch';
  else if (expansion && !expansion.completed) {
    squadMessage = currentSquadCap + ' active squads · squad ' + (currentSquadCap + 1) + ' unlocks after mission 2';
  } else {
    squadMessage = currentSquadCap + ' active squads · ' +
      (currentSquadCap === 6 ? 'normal campaign cap reached' : 'new slot unlocked');
  }

  const nextBlueprint = order === null ? null : getCampaignMissionBlueprint(chapter, order);
  return {
    chapter,
    region: humanCampaignSceneSets[chapter].region,
    completed,
    total: count,
    currentSquadCap,
    nextMissionName: nextNode?.name ?? 'Chapter complete',
    nextMissionOrder: order,
    nextMissionKind: nextNode?.type ?? null,
    nextSceneLocation: order === null ? null : humanCampaignSceneSets[chapter].scenes[
      humanCampaignSceneSets[chapter].missionScenes[order - 1]!
    ]?.location ?? null,
    bossName,
    bossState,
    squadMessage,
    milestoneMessage: nextBlueprint?.purpose ?? (chapter === 7
      ? 'The Human campaign is complete.' : 'The next front awaits.'),
    finished: nextNode === null
  };
}
