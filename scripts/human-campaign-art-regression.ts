import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
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


/** The Chapter 2 paintings must be real statically bundled images, not a
 * fallback-only scene plan. The art-regression script separately checks PNGs. */
const artRegistry = fs.readFileSync(path.join(process.cwd(), 'src/ui/humanCampaignMissionArt.ts'), 'utf8');
for (const id of [
  'iron_hills_muster', 'iron_hills_smithy', 'iron_hills_road',
  'iron_hills_iron_line', 'iron_hills_provost_boss'
]) {
  const expected = id + ": require('../../assets/campaign/missions/" + id + ".png')";
  assert.ok(artRegistry.includes(expected), 'Missing static Iron Hills asset registration: ' + id);
}
for (let order = 1; order <= 8; order++) {
  const scene = humanCampaignSceneForMission(2, order);
  assert.ok(scene, 'Missing Iron Hills scene for mission ' + order);
  assert.ok(artRegistry.includes(scene.id + ": require("), 'Iron Hills mission must use its new painting: ' + order);
}

// All eleven Frostmarch missions must now reference the bundled chapter art,
// not any of the temporary Chapter 1 fallback paintings.
const frostIds = [
  'frostmarch_pass', 'frostmarch_cavalry', 'frostmarch_forge',
  'frostmarch_layered_host', 'frostmarch_frostgate_boss'
];
for (const id of frostIds) {
  const assetPath = path.join(process.cwd(), 'assets/campaign/missions/' + id + '.png');
  assert.ok(fs.existsSync(assetPath), 'Missing Frostmarch PNG: ' + assetPath);
  assert.ok(artRegistry.includes(id + ": require('../../assets/campaign/missions/" + id + ".png')"),
    'Missing static Frostmarch art registration: ' + id);
}
const frostScenesUsed = new Set<string>();
for (let order = 1; order <= 11; order++) {
  const scene = humanCampaignSceneForMission(3, order);
  assert.ok(scene && frostIds.includes(scene.id), 'Frostmarch mission must use regional artwork: ' + order);
  frostScenesUsed.add(scene.id);
}
assert.equal(frostScenesUsed.size, 5, 'All five Frostmarch plates must be visible in the chapter');
assert.equal(humanCampaignSceneForMission(3, 11)?.id, 'frostmarch_frostgate_boss',
  'The Frostgate chapter finale requires its own fortress painting');


const greywatchIds = [
  'greywatch_marches', 'greywatch_war_camp',
  'greywatch_broken_ground', 'greywatch_breach', 'greywatch_siege_boss'
];
const greywatchScenesUsed = new Set<string>();
for (const id of greywatchIds) {
  const assetPath = path.join(process.cwd(), 'assets/campaign/missions/' + id + '.png');
  assert.ok(fs.existsSync(assetPath), 'Missing Greywatch PNG: ' + assetPath);
  assert.ok(artRegistry.includes(id + ": require('../../assets/campaign/missions/" + id + ".png')"),
    'Missing static Greywatch art registration: ' + id);
}
for (let order = 1; order <= 11; order++) {
  const scene = humanCampaignSceneForMission(4, order);
  assert.ok(scene && greywatchIds.includes(scene.id), 'Greywatch mission requires regional art: ' + order);
  const node = humanCampaignSceneForNode(4, 'ch4_node_' + order);
  assert.equal(node?.id, scene.id, 'Greywatch mission screens must agree on art: ' + order);
  greywatchScenesUsed.add(scene.id);
}
assert.equal(greywatchScenesUsed.size, 5, 'All five Greywatch images must appear in the chapter');
assert.equal(humanCampaignSceneForMission(4, 11)?.id, 'greywatch_siege_boss',
  'Siege of Greywatch must use its own illustration');


const crownroadIds = [
  'crownroad_long_front', 'crownroad_six_banners', 'crownroad_sky_threat',
  'crownroad_layered_war', 'crownroad_battle_boss'
];
const crownroadUsed = new Set<string>();
for (const id of crownroadIds) {
  const assetPath = path.join(process.cwd(), 'assets/campaign/missions/' + id + '.png');
  assert.ok(fs.existsSync(assetPath), 'Missing Crownroad image: ' + assetPath);
  assert.ok(artRegistry.includes(id + ": require('../../assets/campaign/missions/" + id + ".png')"),
    'Crownroad art must be statically registered: ' + id);
}
for (let order = 1; order <= 11; order++) {
  const scene = humanCampaignSceneForMission(5, order);
  assert.ok(scene && crownroadIds.includes(scene.id), 'Chapter 5 mission lacks regional art: ' + order);
  assert.equal(humanCampaignSceneForNode(5, 'ch5_node_' + order)?.id, scene.id,
    'Chapter 5 mission node / art resolution mismatch: ' + order);
  crownroadUsed.add(scene.id);
}
assert.equal(crownroadUsed.size, 5, 'All Crownroad scenes must appear in the chapter');
assert.equal(humanCampaignSceneForMission(5, 11)?.id, 'crownroad_battle_boss',
  'Battle for the Crownroad must have unique boss illustration');

console.log('Human campaign art registry: 70 assignments, 7 finale slots and unique chapter scenes validated.');
