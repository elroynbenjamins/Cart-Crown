import assert from 'node:assert/strict';
import { campaignMissionRoadmap, campaignMissionCountsByChapter } from '../src/game/campaignMissionRoadmap';
import {
  humanCampaignMissionCounts,
  humanCampaignSceneForMission,
  humanCampaignSceneForNode,
  humanCampaignSceneSets
} from '../src/game/humanCampaignArtDirection';
import type { HumanCampaignChapter } from '../src/game/humanCampaignArtDirection';

const chapters: HumanCampaignChapter[] = [1, 2, 3, 4, 5, 6, 7];
const allSceneIds = new Set<string>();
let missionCount = 0;
let bossCount = 0;

assert.equal(campaignMissionRoadmap.length, 70, 'Campaign must retain its agreed 70 missions');

for (const chapter of chapters) {
  const set = humanCampaignSceneSets[chapter];
  const count = humanCampaignMissionCounts[chapter];
  assert.equal(count, campaignMissionCountsByChapter[chapter], 'Art and gameplay mission counts must agree');
  assert.equal(set.missionScenes.length, count, 'Every runtime mission needs a scene assignment');
  assert.ok(set.scenes.length >= 5 && set.scenes.length <= 6, 'Aim for 4-5 scene types plus unique finale');
  assert.equal(set.scenes.filter(scene => scene.boss).length, 1, 'Exactly one boss composition per chapter');
  assert.equal(set.scenes[set.scenes.length - 1]?.boss, true, 'Finale scene should occupy final art slot');

  const keysUsed = new Set<string>();
  for (const blueprint of campaignMissionRoadmap.filter(m => m.chapter === chapter)) {
    const { chapterOrder: order } = blueprint;
    const scene = humanCampaignSceneForMission(chapter, order);
    assert.ok(scene, 'No unassigned artwork for ' + blueprint.name);
    keysUsed.add(scene.id);
    const nodeId = chapter === 1 ? 'node_' + order : 'ch' + chapter + '_node_' + order;
    assert.equal(humanCampaignSceneForNode(chapter, nodeId)?.id, scene.id, 'Node and mission screens must resolve same scene');
    if (blueprint.kind === 'boss') {
      bossCount++;
      assert.equal(scene.boss, true, 'Boss must use its chapter finale art slot');
    } else {
      assert.equal(scene.boss, false, 'Non-boss should never use a boss illustration');
    }
    missionCount++;
  }
  assert.ok(keysUsed.size >= 4, 'Each chapter needs at least four different authored visual compositions');
  for (const scene of set.scenes) {
    assert.ok(!allSceneIds.has(scene.id), 'Scene ID must be unique across all chapters: ' + scene.id);
    allSceneIds.add(scene.id);
    assert.ok(scene.location && scene.direction && scene.title, 'Artist needs concrete scene art direction');
  }
}

assert.equal(missionCount, 70);
assert.equal(bossCount, 7);
assert.equal(humanCampaignSceneForNode(3, 'ch2_node_8'), null, 'Cross-chapter node IDs must be rejected');
assert.equal(humanCampaignSceneForNode(1, 'ch1_node_7'), null, 'Chapter 1 has a different runtime ID form');
assert.equal(humanCampaignSceneForMission(5, 12), null, 'Do not invent extra missions');

console.log('Human campaign art registry: 70 assignments, 7 finale slots and unique chapter scenes validated.');
