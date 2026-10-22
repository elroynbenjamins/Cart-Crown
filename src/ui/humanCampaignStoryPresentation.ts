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

/**
 * Roadmap unlock IDs describe intended chapter beats, not necessarily runtime
 * unlock grants. Only deployment slots below are verified against the live
 * GameProvider cap selector. Other entries are marked "story": research,
 * training, orders and siege tools may require additional playable steps.
 */
export const humanCampaignSystemMilestones: Record<HumanCampaignChapter, readonly Readonly<{
  mission: number;
  unlockId: string;
  kind: 'deployment' | 'story';
  label: string;
}>[]> = {
  1: [
    { mission: 2, unlockId: 'hold_line_order', kind: 'story', label: 'Hold Line battle lesson' },
    { mission: 5, unlockId: 'focus_target_order', kind: 'story', label: 'Focus Target tactics' }
  ],
  2: [],
  3: [{ mission: 2, unlockId: 'fourth_deployment_slot', kind: 'deployment', label: 'Fourth active squad slot' }],
  4: [
    { mission: 2, unlockId: 'fifth_deployment_slot', kind: 'deployment', label: 'Fifth active squad slot' },
    { mission: 5, unlockId: 'reinforce_order', kind: 'story', label: 'Reinforce tactics' }
  ],
  5: [
    { mission: 2, unlockId: 'sixth_deployment_slot', kind: 'deployment', label: 'Sixth active squad slot' },
    { mission: 3, unlockId: 'rally_order', kind: 'story', label: 'Rally tactics' },
    { mission: 5, unlockId: 'anti_air_counter_branch', kind: 'story', label: 'Anti-air doctrine' }
  ],
  6: [{ mission: 3, unlockId: 'first_mage_squad', kind: 'story', label: 'Arcanist storyline' }],
  7: [
    { mission: 2, unlockId: 'battering_ram', kind: 'story', label: 'Siege gate operation' },
    { mission: 4, unlockId: 'field_ballista', kind: 'story', label: 'Wall artillery encounter' }
  ]
};

export type HumanCampaignNodeSnapshot = Readonly<{
  id: string;
  name: string;
  type: string;
  completed: boolean;
  current?: boolean;
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
  latestUnlock: string | null;
  upcomingUnlock: string | null;
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
  const milestones = humanCampaignSystemMilestones[chapter];
  const achieved = milestones.filter(item => nodes[item.mission - 1]?.completed);
  const upcoming = milestones.find(item => !nodes[item.mission - 1]?.completed);
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
    latestUnlock: achieved.length
      ? (achieved[achieved.length - 1]!.kind === 'deployment' ? 'DEPLOYMENT UNLOCKED · ' : 'STORY INTRODUCED · ') +
        achieved[achieved.length - 1]!.label
      : null,
    upcomingUnlock: upcoming
      ? (upcoming.kind === 'deployment' ? 'NEXT DEPLOYMENT · ' : 'UPCOMING STORY · ') +
        upcoming.label + ' · mission ' + upcoming.mission
      : null,
    milestoneMessage: nextBlueprint?.purpose ?? (chapter === 7
      ? 'The Human campaign is complete.' : 'The next front awaits.'),
    finished: nextNode === null
  };
}
