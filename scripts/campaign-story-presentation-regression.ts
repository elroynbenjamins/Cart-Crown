import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { humanCampaignMissionCounts, humanCampaignSceneSets } from '../src/game/humanCampaignArtDirection';
import type { HumanCampaignChapter } from '../src/game/humanCampaignArtDirection';
import { getCampaignMissionBlueprint } from '../src/game/campaignMissionRoadmap';
import {
  humanCampaignProgressCue,
  humanChapterStories
} from '../src/ui/humanCampaignStoryPresentation';
import type { HumanCampaignNodeSnapshot } from '../src/ui/humanCampaignStoryPresentation';

const chapters: HumanCampaignChapter[] = [1, 2, 3, 4, 5, 6, 7];
const nodesFor = (chapter: HumanCampaignChapter, completed = 0): HumanCampaignNodeSnapshot[] =>
  Array.from({ length: humanCampaignMissionCounts[chapter] }, (_, index) => ({
    id: chapter === 1 ? 'node_' + (index + 1) : 'ch' + chapter + '_node_' + (index + 1),
    name: getCampaignMissionBlueprint(chapter, index + 1)!.name,
    type: index === humanCampaignMissionCounts[chapter] - 1 ? 'boss' : 'battle',
    completed: index < completed,
    current: index === completed
  }));

const voices = new Set<string>();
const stakes = new Set<string>();
for (const chapter of chapters) {
  const story = humanChapterStories[chapter];
  assert.ok(story.tone && story.stakes && story.enemy && story.secured && story.nextFront);
  assert.ok(!voices.has(story.tone), 'Every chapter needs its own identity');
  assert.ok(!stakes.has(story.stakes), 'Every chapter needs distinctive narrative stakes');
  voices.add(story.tone);
  stakes.add(story.stakes);

  const start = humanCampaignProgressCue(chapter, nodesFor(chapter));
  assert.ok(start, 'Every chapter must provide a briefing');
  assert.equal(start.region, humanCampaignSceneSets[chapter].region);
  assert.equal(start.total, humanCampaignMissionCounts[chapter]);
  assert.equal(start.nextMissionOrder, 1);
  assert.equal(start.nextMissionName, getCampaignMissionBlueprint(chapter, 1)?.name);
  assert.equal(start.bossName, getCampaignMissionBlueprint(chapter, start.total)?.name);
  assert.equal(start.bossState, 'ahead');
  assert.ok(start.nextSceneLocation);
  assert.ok(start.squadMessage.includes('squad'));

  const boss = humanCampaignProgressCue(chapter, nodesFor(chapter, start.total - 1));
  assert.ok(boss);
  assert.equal(boss.bossState, 'current');
  assert.equal(boss.nextMissionKind, 'boss');
  assert.equal(boss.nextMissionOrder, start.total);

  const done = humanCampaignProgressCue(chapter, nodesFor(chapter, start.total));
  assert.ok(done);
  assert.equal(done.finished, true);
  assert.equal(done.bossState, 'secured');
  assert.equal(done.nextMissionOrder, null);
  assert.equal(done.nextSceneLocation, null);
}

assert.equal(voices.size, 7);
assert.equal(humanCampaignProgressCue(0, nodesFor(1)), null, 'Invalid chapter must fail closed');
assert.equal(humanCampaignProgressCue(1, nodesFor(1).slice(1)), null, 'Partial mission arrays must fail closed');

for (const [chapter, expectedBefore, expectedAfter] of [
  [3, 3, 4], [4, 4, 5], [5, 5, 6]
] as const) {
  const before = humanCampaignProgressCue(chapter, nodesFor(chapter, 1))!;
  const after = humanCampaignProgressCue(chapter, nodesFor(chapter, 2))!;
  assert.equal(before.currentSquadCap, expectedBefore, 'No early squad unlock in Chapter ' + chapter);
  assert.equal(after.currentSquadCap, expectedAfter, 'Squad milestone should occur after mission 2 in Chapter ' + chapter);
  assert.ok(before.squadMessage.includes('mission 2'), 'Pending expansion must say when it unlocks');
}
assert.equal(humanCampaignProgressCue(1, nodesFor(1))!.currentSquadCap, 2);
assert.equal(humanCampaignProgressCue(2, nodesFor(2))!.currentSquadCap, 3);
assert.equal(humanCampaignProgressCue(6, nodesFor(6))!.currentSquadCap, 6);
assert.equal(humanCampaignProgressCue(7, nodesFor(7))!.currentSquadCap, 6);

const irregular = nodesFor(3, 0);
irregular[0] = { ...irregular[0]!, completed: true, current: false };
irregular[1] = { ...irregular[1]!, current: true };
const snapshot = JSON.stringify(irregular);
const cue = humanCampaignProgressCue(3, irregular)!;
assert.equal(cue.nextMissionOrder, 2, 'Follow live current node, not just completed count');
assert.equal(JSON.stringify(irregular), snapshot, 'Presentation must not mutate live campaign nodes');

const campaignSource = readFileSync('src/screens/CampaignScreen.tsx', 'utf8');
assert.ok(campaignSource.includes('HumanCampaignFrontCard'), 'Live screen must mount the briefing');
assert.ok(campaignSource.includes('human-campaign-mission-disclosure'), 'Full mission list needs a player-controlled disclosure');
assert.ok(campaignSource.includes("node.type !== 'boss'"), 'Finale must remain visible in focused layout');
const transitionSource = readFileSync('src/ui/HumanChapterTransitionBanner.tsx', 'utf8');
assert.ok(transitionSource.includes('nextStory?.stakes'), 'Region reveal must introduce new chapter stakes');
console.log('Human campaign Phase 3 presentation regression passed: seven regions, 70 missions, squad milestones and focused navigation.');
