import fs from 'node:fs';
import path from 'node:path';
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

// Dedicated Chapter 2 image files should be locally bundled; otherwise Metro
// fails to resolve the static image requires on a real Android release build.
const ch2ArtRegistry = fs.readFileSync(
  path.join(process.cwd(), 'src/ui/humanCampaignMissionArt.ts'), 'utf8'
);
const ch2Assets = [
  'iron_hills_muster',
  'iron_hills_smithy',
  'iron_hills_road',
  'iron_hills_iron_line',
  'iron_hills_provost_boss'
];
for (const key of ch2Assets) {
  const relative = 'assets/campaign/missions/' + key + '.jpg';
  const bytes = fs.readFileSync(path.join(process.cwd(), relative));
  assert.ok(bytes.length > 1500 && bytes.length < 30000,
    'Iron Hills campaign-card artwork is missing or outside thumbnail budget: ' + key);
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'Iron Hills asset must start with JPEG marker: ' + key);
  assert.equal(bytes.readUInt16BE(bytes.length - 2), 0xffd9, 'Iron Hills asset is incomplete: ' + key);
  assert.ok(ch2ArtRegistry.includes(key + ": require('../../" + relative + "')"),
    'Iron Hills artwork is not registered in Metro: ' + key);
}
assert.deepEqual(humanCampaignSceneSets[2].scenes.map(s => s.id), ch2Assets,
  'Every Chapter 2 mission composition must resolve to the packaged image');

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

console.log('Human campaign art registry: 70 assignments, 7 finale slots, and all five Chapter 2 paintings validated.');
