import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { humanCampaignMissionCounts, humanCampaignSceneSets } from '../src/game/humanCampaignArtDirection';
import type { HumanCampaignChapter } from '../src/game/humanCampaignArtDirection';
import { getCampaignMissionBlueprint } from '../src/game/campaignMissionRoadmap';
import {
  humanCampaignProgressCue,
  humanChapterStories,
  humanCampaignSystemMilestones
} from '../src/ui/humanCampaignStoryPresentation';
import type { HumanCampaignNodeSnapshot } from '../src/ui/humanCampaignStoryPresentation';
import { activeJourneyPointId } from '../src/ui/campaignJourneySelection';
import { humanMissionReportState } from '../src/ui/humanMissionReportState';
import { humanCampaignDisplayNodeType } from '../src/ui/humanCampaignNodePresentation';
import { humanLateMissions } from '../src/game/humanLateCampaign';

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
  for (const milestone of humanCampaignSystemMilestones[chapter]) {
    assert.ok(
      getCampaignMissionBlueprint(chapter, milestone.mission)?.unlocks.includes(milestone.unlockId),
      'Milestone must reference a real blueprint story beat: ' + milestone.unlockId
    );
    assert.ok(milestone.kind === 'story' || milestone.kind === 'deployment');
    if (milestone.kind === 'deployment') {
      assert.ok(milestone.unlockId.endsWith('_deployment_slot'), 'Only verified slot gates count as deployed unlocks');
    }
  }
  const firstMilestone = humanCampaignSystemMilestones[chapter][0];
  if (firstMilestone) {
    assert.ok(start.upcomingUnlock?.includes(firstMilestone.label), 'Upcoming unlock should be visible');
    const afterMilestone = humanCampaignProgressCue(chapter, nodesFor(chapter, firstMilestone.mission))!;
    assert.ok(afterMilestone.latestUnlock?.includes(firstMilestone.label), 'Recorded unlock should be visible');
    assert.ok(afterMilestone.latestUnlock?.startsWith(
      firstMilestone.kind === 'deployment' ? 'DEPLOYMENT UNLOCKED' : 'STORY INTRODUCED'
    ), 'A roadmap-only milestone must not be described as a usable system unlock');
  }

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

// Exercise every authored slot without advancing or mutating a save.
let inspectedSlots = 0;
for (const chapter of chapters) {
  for (let completed = 0; completed < humanCampaignMissionCounts[chapter]; completed++) {
    const live = nodesFor(chapter, completed);
    const cue = humanCampaignProgressCue(chapter, live)!;
    assert.equal(cue.nextMissionOrder, completed + 1);
    assert.equal(cue.nextMissionName, getCampaignMissionBlueprint(chapter, completed + 1)?.name);
    assert.equal(cue.completed, completed);
    assert.ok(cue.nextSceneLocation);
    inspectedSlots++;
  }
}
assert.equal(inspectedSlots, 70, 'Inspect all 70 authored mission states');

const route = [
  { id: 'greenkeep' }, { id: 'frostmarch' }, { id: 'blackstone' }
];
assert.equal(activeJourneyPointId('greenkeep', route, null), 'greenkeep');
assert.equal(activeJourneyPointId('greenkeep', route, { frontId: 'greenkeep', pointId: 'frostmarch' }), 'frostmarch');
assert.equal(activeJourneyPointId('blackstone', route, { frontId: 'greenkeep', pointId: 'frostmarch' }), 'blackstone',
  'A chapter transition must focus its newly current marker');
assert.equal(activeJourneyPointId('greenkeep', route, { frontId: 'greenkeep', pointId: 'missing' }), 'greenkeep',
  'Deleted/missing map points should not remain selected');

const irregular = nodesFor(3, 0);
irregular[0] = { ...irregular[0]!, completed: true, current: false };
irregular[1] = { ...irregular[1]!, current: true };
const snapshot = JSON.stringify(irregular);
const cue = humanCampaignProgressCue(3, irregular)!;
assert.equal(cue.nextMissionOrder, 2, 'Follow live current node, not just completed count');
assert.equal(JSON.stringify(irregular), snapshot, 'Presentation must not mutate live campaign nodes');

// Chapter 2 mission 4 is saved as an 'elite' node for compatibility, but the
// actual route is Kingdom Defense. UI must not mislabel it as an elite duel.
assert.equal(humanCampaignDisplayNodeType(2, { id: 'ch2_node_4', type: 'elite' }), 'defense');
assert.equal(humanCampaignDisplayNodeType(2, { id: 'ch2_node_8', type: 'boss' }), 'boss');
assert.equal(humanCampaignDisplayNodeType(3, { id: 'ch3_node_6', type: 'elite' }), 'elite');

// Every late noncombat mission report must offer a route back to Campaign.
// Completing Ch5/6 bosses replaces the node array; reopening a stale report
// must not strand the user after the new chapter has started.
assert.equal(humanLateMissions.length, 33, 'Human late chapters need all 33 authored slots');
for (const mission of humanLateMissions) {
  const activeNode = { current: true, completed: false };
  const base = {
    activeFaction: 'human',
    chapterNumber: mission.chapter,
    missionChapter: mission.chapter,
    node: activeNode,
    resolvedOnThisScreen: false
  };
  assert.equal(humanMissionReportState(base), 'ready', mission.id + ' is playable at the active node');
  assert.equal(humanMissionReportState({ ...base, node: { current: false, completed: true } }), 'completed');
  assert.equal(humanMissionReportState({ ...base, resolvedOnThisScreen: true, node: undefined }), 'completed',
    'Successful completion must remain available after replacing nodes: ' + mission.id);
  assert.equal(humanMissionReportState({ ...base, chapterNumber: mission.chapter + 1, node: undefined }), 'completed',
    'Later saved chapters imply completed prior reports: ' + mission.id);
  assert.equal(humanMissionReportState({ ...base, activeFaction: 'elf' }), 'unavailable',
    'Never show Human reports in another faction');
  assert.equal(humanMissionReportState({ ...base, node: { current: false, completed: false } }), 'unavailable',
    'Locked future nodes are not playable');
  assert.equal(humanMissionReportState({ ...base, chapterNumber: mission.chapter - 1, node: undefined }), 'unavailable',
    'Cannot complete future chapters early');
}
assert.equal(humanMissionReportState({
  activeFaction: 'human', chapterNumber: 7, missionChapter: null,
  node: undefined, resolvedOnThisScreen: false
}), 'unavailable', 'Unknown mission IDs cannot create a completed report');

const campaignSource = readFileSync('src/screens/CampaignScreen.tsx', 'utf8');
assert.ok(campaignSource.includes('HumanCampaignFrontCard'), 'Live screen must mount the briefing');
const frontCardSource = readFileSync('src/ui/HumanCampaignFrontCard.tsx', 'utf8');
assert.ok(frontCardSource.includes('cue.upcomingUnlock') && frontCardSource.includes('cue.latestUnlock'), 'Visible system unlock cues must be wired');
assert.ok(frontCardSource.includes("cue.bossState === 'current' ? s.bossActive") && frontCardSource.includes('{story.finale}'), 'Current chapter bosses need a distinct illustrated introduction');
assert.ok(frontCardSource.includes('activeSquadCap ?? cue.currentSquadCap'), 'Wagon cap must constrain displayed usable squads');
assert.ok(frontCardSource.includes('cue.nextMissionOrder ?? humanCampaignMissionCounts[cue.chapter]'),
  'Chapter hero art must follow the current authored mission and show finale after completion');
assert.ok(frontCardSource.includes('human-campaign-jump-to-current') &&
  frontCardSource.includes('onPress={onViewCurrentMission}'),
  'The chapter brief must provide a real, accessible in-page current mission jump');
assert.ok(campaignSource.includes('storyScroll.current?.scrollTo') &&
  campaignSource.includes('onLayout={event => { missionListTop.current = event.nativeEvent.layout.y; }}'),
  'Current mission jump must use measured screen layout instead of hard-coded scroll distances');
assert.ok(campaignSource.includes('missionHistory?.chapter === chapterNumber') &&
  campaignSource.includes('expanded: !showAllMissions'),
  'Expanding mission history must reset when the player reaches a new chapter');
const eventSource = readFileSync('src/ui/CampaignEventUI.tsx', 'utf8');
const lateStorySource = readFileSync('src/screens/HumanMissionScreen.tsx', 'utf8');
assert.ok(eventSource.includes('initiallyExpanded = false') && lateStorySource.includes('<EventIllustration initiallyExpanded>'),
  'Late Human story illustrations should open visibly without altering other campaign event defaults');

assert.ok(campaignSource.includes('activeSquadCap={activeSquadCap}'), 'Live cap must be supplied to the story briefing');
assert.ok(campaignSource.includes('human-campaign-mission-disclosure'), 'Full mission list needs a player-controlled disclosure');
assert.ok(campaignSource.includes('humanCampaignDisplayNodeType(chapterNumber, node)') &&
  campaignSource.includes("displayType === 'defense' ? 'KINGDOM DEFENSE' : 'ELITE ENCOUNTER'"),
  'Kingdom Defense must be represented correctly without changing saved chapter node type');
const missionScreenSource = readFileSync('src/screens/HumanMissionScreen.tsx', 'utf8');
assert.ok(missionScreenSource.includes('humanMissionReportState({') &&
  missionScreenSource.includes('<SecondaryButton label="Return to Campaign" onPress={onContinue} />') &&
  missionScreenSource.includes('if (accepted) setResolvedNodeId(nodeId)'),
  'Late mission reports need a safe exit after success, failed routing and chapter advance');
assert.ok(campaignSource.includes("node.type !== 'boss'"), 'Finale must remain visible in focused layout');
const mapSource = readFileSync('src/ui/CampaignJourneyMap.tsx', 'utf8');
assert.ok(mapSource.includes('regionArtwork ?? mapSources[faction]'), 'Map should reuse the current chapter artwork');
assert.ok(mapSource.includes('activeJourneyPointId'), 'Map should reset a stale selected region');
assert.ok(mapSource.includes('flex: 1'), 'Pins should fit narrow-screen route rows');
assert.ok(campaignSource.includes('finalHumanFrontSecured'), 'Final Blackstone route must show as secured');
assert.ok(campaignSource.includes('regionArtwork={humanCampaignArtworkForMission(chapterNumber, 1).source}'),
  'Current regional painting must be wired into the journey map');

const transitionSource = readFileSync('src/ui/HumanChapterTransitionBanner.tsx', 'utf8');
assert.ok(transitionSource.includes('nextStory?.stakes'), 'Region reveal must introduce new chapter stakes');
console.log('Human campaign Phase 3 presentation regression passed: seven regions, 70 missions, squad milestones, current art, navigation and illustration visibility.');
