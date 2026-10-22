/**
 * Phase 0 guard: documentation must follow runtime rather than archived plans.
 * This is a source consistency check, not a full-gameplay acceptance test.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chapterOneNodes } from '../src/game/data';
import { chapterTwoNodes } from '../src/game/chapter2';
import { chapterThreeNodes } from '../src/game/chapter3';
import { chapterFourNodes } from '../src/game/chapter4';
import { chapterFiveNodes } from '../src/game/chapter5';
import { chapterSixNodes } from '../src/game/chapter6';
import { chapterSevenNodes } from '../src/game/chapter7';
import { campaignMissionCountsByChapter, campaignMissionRoadmap } from '../src/game/campaignMissionRoadmap';
import { humanCampaignMissionCounts, humanCampaignSceneSets } from '../src/game/humanCampaignArtDirection';

function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const readme = read('README.md');
const inventory = read('docs/PHASE0_IMPLEMENTATION_INVENTORY.md');
const master = read('docs/MASTER_DEVELOPMENT_ROADMAP.md');
const artDoc = read('docs/human-campaign-art-depth.md');
const chapterData = [
  { region: 'Greenkeep', nodes: chapterOneNodes },
  { region: 'Iron Hills', nodes: chapterTwoNodes },
  { region: 'Frostmarch', nodes: chapterThreeNodes },
  { region: 'Greywatch', nodes: chapterFourNodes },
  { region: 'Crownroad', nodes: chapterFiveNodes },
  { region: 'Glass Keep', nodes: chapterSixNodes },
  { region: 'Blackstone', nodes: chapterSevenNodes }
] as const;

assert(chapterData.length === 7, 'Exactly seven Human chapters required');
let totalNodes = 0;
let compositions = 0;
let finales = 0;
for (const [index, chapter] of chapterData.entries()) {
  const n = (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const count = chapter.nodes.length;
  totalNodes += count;
  const mapped = humanCampaignSceneSets[n];
  assert(count === campaignMissionCountsByChapter[n] &&
    count === humanCampaignMissionCounts[n],
    'Human chapter ' + n + ' roadmap, runtime and art counts drift');
  assert(mapped.region === chapter.region, 'Art region differs from runtime chapter ' + n);
  assert(mapped.missionScenes.length === count,
    'Chapter ' + n + ' artwork must map every live mission');
  assert(mapped.missionScenes.every(sceneIndex => mapped.scenes[sceneIndex]),
    'Chapter ' + n + ' artwork has invalid scene index');
  compositions += mapped.scenes.length;
  finales += mapped.scenes.filter(scene => scene.boss).length;
  assert(mapped.scenes.filter(scene => scene.boss).length === 1 &&
    mapped.scenes[mapped.missionScenes[count - 1]]?.boss,
    'Chapter ' + n + ' must map finale to a distinct boss scene');

  const chapterRow = '| ' + n + ' | ' + chapter.region + ' | ' + count + ' |';
  assert(readme.includes(chapterRow), 'README chapter ' + n + ' summary contradicts runtime');
  assert(inventory.includes('Human Ch' + n + ', ' + chapter.region),
    'Canonical inventory is missing Human chapter ' + n);
}
assert(totalNodes === 70 && campaignMissionRoadmap.length === 70,
  'Human campaign changed from its 70-node contract');
assert(compositions === 36 && finales === 7,
  'Human art direction must retain 36 scenes and seven finales');
assert(readme.includes('**own six-chapter**') && readme.includes('**Three Seals**'),
  'README must separate Elf/Orc campaigns and Three Seals from Human 70');
for (const oldHeading of [
  '## Chapter 4 — The Broken Crown',
  '## Chapter 5 — Old Royal Lands',
  '## Chapter 6 — Return to Crownspire'
]) {
  assert(!readme.includes(oldHeading), 'Restored obsolete README section: ' + oldHeading);
}
for (const required of [
  'docs/PHASE0_IMPLEMENTATION_INVENTORY.md',
  'docs/ANDROID_SCREENSHOT_BASELINE.md',
  'docs/MASTER_DEVELOPMENT_ROADMAP.md'
]) {
  assert(fs.existsSync(path.join(root, required)), 'Missing canonical document ' + required);
}
assert(!artDoc.includes('only Chapter 7 / Blackstone remains to be illustrated'),
  'Art documentation still calls shipped Blackstone art missing');
assert(master.includes('PHASE0_IMPLEMENTATION_INVENTORY.md') &&
  master.includes('ANDROID_SCREENSHOT_BASELINE.md'),
  'Master roadmap must link both evidence ledgers');
console.log('PASS: docs aligned with 70 live Human nodes, seven regions, 36 scenes, seven finales, separate Elf/Orc arcs and Phase 0 references.');
