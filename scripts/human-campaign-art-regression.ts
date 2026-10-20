import assert from 'node:assert/strict';
import { humanStoryBeatArtwork, humanStoryBeats } from '../src/ui/humanStoryEventPresentation';

import { humanChapterTransition } from '../src/ui/humanChapterTransition';
import { humanBattleResultMoment } from '../src/ui/humanBattleResultPresentation';
import { humanLateMissions } from '../src/game/humanLateCampaign';
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


const glassKeepIds = [
  'glass_keep_strange_fire', 'glass_keep_wardfield', 'glass_keep_arcanists',
  'glass_keep_silent_ground', 'glass_keep_siege_boss'
];
const glassKeepUsed = new Set<string>();
for (const id of glassKeepIds) {
  const assetPath = path.join(process.cwd(), 'assets/campaign/missions/' + id + '.png');
  assert.ok(fs.existsSync(assetPath), 'Missing Glass Keep PNG: ' + assetPath);
  assert.ok(artRegistry.includes(id + ": require('../../assets/campaign/missions/" + id + ".png')"),
    'Glass Keep artwork must have a static Metro registration: ' + id);
}
for (let order = 1; order <= 11; order++) {
  const scene = humanCampaignSceneForMission(6, order);
  assert.ok(scene && glassKeepIds.includes(scene.id), 'Chapter 6 mission lacks regional artwork: ' + order);
  assert.equal(humanCampaignSceneForNode(6, 'ch6_node_' + order)?.id, scene.id,
    'Glass Keep mission card / detail view artwork mismatch: ' + order);
  glassKeepUsed.add(scene.id);
}
assert.equal(glassKeepUsed.size, 5, 'Each of the five Glass Keep images must appear in Chapter 6');
assert.equal(humanCampaignSceneForMission(6, 11)?.id, 'glass_keep_siege_boss',
  'Siege of the Glass Keep must use its own Arcane General boss illustration');

// Chapter 7 concludes the fixed Human campaign with five bundled Blackstone plates.
// All eleven missions must use regional artwork, and the final boss must never
// accidentally fall back to a generic fortress or another chapter's image.
const blackstoneIds = [
  'blackstone_stone_road', 'blackstone_siege_lines', 'blackstone_tower_war',
  'blackstone_breached_city', 'blackstone_final_boss'
];
const blackstoneUsed = new Set<string>();
for (const id of blackstoneIds) {
  const assetPath = path.join(process.cwd(), 'assets/campaign/missions/' + id + '.png');
  assert.ok(fs.existsSync(assetPath), 'Missing Blackstone PNG: ' + assetPath);
  assert.ok(artRegistry.includes(id + ": require('../../assets/campaign/missions/" + id + ".png')"),
    'Blackstone artwork must have static Metro registration: ' + id);
}
for (let order = 1; order <= 11; order++) {
  const scene = humanCampaignSceneForMission(7, order);
  assert.ok(scene && blackstoneIds.includes(scene.id), 'Chapter 7 mission lacks Blackstone art: ' + order);
  assert.equal(humanCampaignSceneForNode(7, 'ch7_node_' + order)?.id, scene.id,
    'Blackstone mission card / detail view scene mismatch: ' + order);
  blackstoneUsed.add(scene.id);
}
assert.equal(blackstoneUsed.size, 5, 'Each of the five Blackstone images must appear in Chapter 7');
assert.equal(humanCampaignSceneForMission(7, 11)?.id, 'blackstone_final_boss',
  'Fall of Blackstone must have its own final boss art');


// Present chapter handoffs only at the new front; preserve battle reward flow.
assert.equal(humanChapterTransition(1, 0, 7), null);
for (let chapter = 2; chapter <= 7; chapter++) {
  const count = humanCampaignMissionCounts[chapter as HumanCampaignChapter];
  const result = humanChapterTransition(chapter, 0, count);
  assert.equal(result?.kind, 'next-front', 'Every chapter transition needs a region reveal');
  assert.equal(result?.securedChapter, chapter - 1);
  assert.equal(result?.revealedChapter, chapter);
  assert.equal(result?.revealedRegion, humanCampaignSceneSets[chapter as HumanCampaignChapter].region);
  assert.ok(result?.securedBoss && result.revealedMission);
  assert.equal(humanChapterTransition(chapter, 1, count), null,
    'A first completed mission must retire the one-off previous-front announcement');
}
assert.equal(humanChapterTransition(7, 11, 11)?.kind, 'finale',
  'Full Blackstone completion deserves a distinct Human campaign ending');
assert.equal(humanChapterTransition(7, 10, 11), null, 'Do not claim the final siege is won early');
for (const invalid of [-1, 0, 8, 99, NaN]) {
  assert.equal(humanChapterTransition(invalid, 0, 11), null, 'Invalid chapter should not invent victories');
}
const storyScreen = fs.readFileSync('src/screens/CampaignScreen.tsx', 'utf8');
const transitionBanner = fs.readFileSync('src/ui/HumanChapterTransitionBanner.tsx', 'utf8');
assert.ok(storyScreen.includes('<HumanChapterTransitionBanner chapterNumber={chapterNumber} completed={completed} total={chapterNodes.length} />'),
  'Use actual saved completion state to drive chapter reveal');
assert.ok(transitionBanner.includes('humanCampaignArtworkForMission('),
  'Use existing registered mission art instead of a placeholder image');
assert.ok(!/setTimeout\(|<Modal\b|\baddResources\(|\bclaimRewardedAd\(/i.test(transitionBanner),
  'Chapter reveal must be non-modal and never grant a reward outside the ordinary battle flow');


const storyArtSource = fs.readFileSync('src/ui/HumanStoryEventHero.tsx', 'utf8');
assert.ok(storyArtSource.includes("humanCampaignArtworkForMission(art.chapter, art.order).source"),
  'Story event artwork must resolve through real bundled mission art, never a dynamic require');
assert.ok(storyArtSource.includes("testID={'human-story-hero-' + beat}"),
  'Story hero requires stable test and accessibility identity');
assert.ok(!/setTimeout\(|<Modal\b|claimReward\(|addResources\(/.test(storyArtSource),
  'Story illustration cannot own rewards, modal interruptions, or timers');
assert.equal(Object.keys(humanStoryBeats).length, 14, 'Keep all fourteen high-impact Human story beats covered');
for (const [beat, definition] of Object.entries(humanStoryBeats)) {
  const picture = humanStoryBeatArtwork(beat as keyof typeof humanStoryBeats);
  assert.ok(picture, 'Unresolved artwork for story beat ' + beat);
  assert.equal(picture.chapter, definition.chapter);
  assert.equal(picture.sceneId, humanCampaignSceneForMission(definition.chapter, definition.order)?.id);
  assert.ok(picture.caption && picture.region && picture.character,
    'Every story panel needs a grounded chapter, descriptive caption and portrait role');
}
for (const [path, expected] of [
  ['src/screens/EarlyHumanEventScreen.tsx', '<HumanStoryEventHero beat={eventId} />'],
  ['src/screens/LateHumanEventScreen.tsx', '<HumanStoryEventHero beat={eventId} />'],
  ['src/screens/CommanderChoiceScreen.tsx', '<HumanStoryEventHero beat="commander_choice" />'],
  ['src/screens/MarcherEnvoyScreen.tsx', '<HumanStoryEventHero beat="marcher_envoy" />'],
  ['src/screens/DividedMarchScreen.tsx', '<HumanStoryEventHero beat="divided_march" />'],
  ['src/screens/ThreeWarningsScreen.tsx', 'hero={<HumanStoryEventHero beat="rider_doctrine" />}'],
  ['src/screens/LastLoyalistsScreen.tsx', 'hero={<HumanStoryEventHero beat="forked_banner" />}']
] as const) {
  assert.ok(fs.readFileSync(path, 'utf8').includes(expected), path + ' has lost its regional story artwork');
}



// After-action screen must reflect the won Human mission, not an unrelated
// early Greenkeep milestone. Results use the completed encounter ID because
// chapter advancement can occur before this screen mounts.
const lateBattleMissions = humanLateMissions.filter(mission => mission.encounterId);
assert.ok(lateBattleMissions.length >= 20, 'All late Human battle encounters should have their own victory moment');
for (const mission of lateBattleMissions) {
  const moment = humanBattleResultMoment(mission.encounterId + '_result');
  assert.ok(moment, 'Missing victory moment for ' + mission.name);
  assert.equal(moment.chapter, mission.chapter);
  assert.equal(moment.missionOrder, mission.order);
  assert.equal(moment.missionCount, 11);
  assert.equal(moment.name, mission.name);
  assert.equal(moment.boss, mission.type === 'boss');
  assert.equal(moment.region, humanCampaignSceneSets[mission.chapter].region);
  assert.ok(moment.takeaway, 'Victory moment should explain progression: ' + mission.name);
  if (moment.boss && mission.chapter < 7) {
    assert.equal(moment.nextRegion, humanCampaignSceneSets[(mission.chapter + 1) as HumanCampaignChapter].region,
      'Boss victory must reveal the actual next region');
  } else {
    assert.equal(moment.nextRegion, null, 'Do not claim an unearned chapter transition');
  }
}
assert.equal(humanBattleResultMoment('human_ch5_m02_result'), null,
  'Story and upgrade missions without a battle must never invent a battle result');
assert.equal(humanBattleResultMoment('hold_the_road_result'), null,
  'Initial Human victory is handled by its own milestone');
assert.equal(humanBattleResultMoment('elf_ashen_tracks_result'), null,
  'Other faction battles must not show Human victory artwork');
assert.equal(humanBattleResultMoment('human_ch7_m10_result')?.final, false,
  'The penultimate battle cannot claim campaign completion');
assert.equal(humanBattleResultMoment('human_ch7_m11_result')?.final, true,
  'Fall of Blackstone must show the final Human victory');

const resultScreenSource = fs.readFileSync('src/screens/ResultsScreen.tsx', 'utf8');
const momentSource = fs.readFileSync('src/ui/HumanMissionVictoryMoment.tsx', 'utf8');
assert.ok(resultScreenSource.includes('<HumanMissionVictoryMoment moment={lateHumanMoment} />'),
  'Results should surface late Human artwork immediately after the rewards');
assert.ok(resultScreenSource.includes("lastBattleResult.id === 'hold_the_road_result' ? ("),
  'Chapter 1 Greenkeep establishment messaging must be restricted to the actual opening victory');
assert.ok(resultScreenSource.includes('{lateHumanMoment ? null : metaFinalResult ? ('),
  'Later Human missions must not fall into the legacy What changed results chain');
assert.ok(momentSource.includes('humanCampaignArtworkForMission(moment.chapter, moment.missionOrder)'),
  'Victory artwork must reuse the approved region-specific mission paintings');
assert.ok(!/setTimeout\(|<Modal\b|\bsetResources\(|\bclaimRewardedAd\(/.test(momentSource),
  'Victory art cannot re-award rewards, block navigation or require a timed modal');

console.log('Human campaign art registry: 70 assignments, 7 finale slots and encounter-specific victory results validated.');
