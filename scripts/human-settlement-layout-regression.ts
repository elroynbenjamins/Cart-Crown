import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  HUMAN_SETTLEMENT_PLATE_ASPECT_RATIO,
  HUMAN_SETTLEMENT_PLOT_HEIGHT,
  HUMAN_SETTLEMENT_PLOT_WIDTH,
  HUMAN_SETTLEMENT_LANDMARK_HEIGHT,
  HUMAN_SETTLEMENT_LANDMARK_WIDTH,
  HUMAN_SETTLEMENT_STAGE_PLATES,
  humanSettlementBuildingSpriteSize,
  humanSettlementPlatePlotCenters,
  humanSettlementPlatePlotCenter,
  humanSettlementPlatePlotPositions,
  humanSettlementStagePlate,
  settlementActionLayout
} from '../src/ui/settlementActionLayout';

const ids = [
  'plot_nw', 'plot_n', 'plot_ne',
  'plot_w', 'plot_center', 'plot_e',
  'plot_sw', 'plot_s', 'plot_se'
];
assert.equal(HUMAN_SETTLEMENT_PLATE_ASPECT_RATIO, 540 / 960);
assert.deepEqual(Object.keys(humanSettlementPlatePlotPositions).sort(), [...ids].sort());

for (const plotId of ids) {
  const position = humanSettlementPlatePlotPositions[plotId]!;
  const center = humanSettlementPlatePlotCenter(plotId);
  assert.ok(center, plotId + ' must have a canonical center');
  assert.deepEqual(humanSettlementPlatePlotCenters[plotId], center);
  const landmark = plotId === 'plot_center';
  const expectedX = Number.parseFloat(position.left) / 100 +
    (landmark ? HUMAN_SETTLEMENT_LANDMARK_WIDTH : HUMAN_SETTLEMENT_PLOT_WIDTH) / 2;
  const expectedY = Number.parseFloat(position.top) / 100 +
    (landmark ? HUMAN_SETTLEMENT_LANDMARK_HEIGHT : HUMAN_SETTLEMENT_PLOT_HEIGHT) / 2;
  assert.ok(Math.abs(center.x - expectedX) < 0.00001, plotId + ' horizontal anchor drift');
  assert.ok(Math.abs(center.y - expectedY) < 0.00001, plotId + ' vertical anchor drift');
  assert.ok(center.x > 0 && center.x < 1 && center.y > 0 && center.y < 1);
}
assert.equal(humanSettlementPlatePlotCenter('missing'), null);

const stages = ['camp', 'settlement', 'fort', 'town', 'stronghold', 'capital', 'grand'];
assert.deepEqual(Object.keys(HUMAN_SETTLEMENT_STAGE_PLATES), stages);
for (const stage of stages) assert.ok(humanSettlementStagePlate(stage));
assert.equal(new Set(stages.map(stage => humanSettlementStagePlate(stage))).size, 5);
assert.equal(humanSettlementStagePlate('stronghold'), 'capital');
assert.equal(humanSettlementStagePlate('capital'), 'capital');
assert.equal(humanSettlementStagePlate('grand'), 'capital');

// The two source screens must use the same anchors; keep artwork alignment
// deterministic at compact portrait widths and tablet-constrained width.
for (const width of [280, 320, 340, 388, 438]) {
  const height = Math.round(width / HUMAN_SETTLEMENT_PLATE_ASPECT_RATIO);
  for (const plotId of ids) {
    const geometry = settlementActionLayout(width, height, humanSettlementPlatePlotCenters[plotId]!, 112);
    assert.ok(geometry.left >= 0 && geometry.top >= 0, width + ' ' + plotId + ' negative action anchor');
    assert.ok(geometry.width <= width, width + ' ' + plotId + ' action too wide');
    assert.ok(geometry.left + geometry.width <= width + 0.001, width + ' ' + plotId + ' action outside right');
    assert.ok(geometry.top + 112 <= height + 0.001, width + ' ' + plotId + ' action outside bottom');

    const hall = humanSettlementBuildingSpriteSize(plotId, 'KINGDOM', width);
    const barracks = humanSettlementBuildingSpriteSize(plotId, 'ARMY', width);
    assert.ok(hall > barracks, plotId + ' must preserve Hall silhouette after relocation');
    assert.ok(hall >= 60 && hall <= 160, plotId + ' Hall would dominate/clamp the scene');
    assert.ok(barracks >= 45 && barracks <= 140, plotId + ' regular building size is out of range');
  }
  const northern = humanSettlementBuildingSpriteSize('plot_n', 'ARMY', width);
  const southern = humanSettlementBuildingSpriteSize('plot_s', 'ARMY', width);
  assert.ok(southern > northern, 'Depth scale must favor the foreground without changing plot IDs');
  assert.equal(humanSettlementBuildingSpriteSize('plot_n', 'ARMY', NaN),
    humanSettlementBuildingSpriteSize('plot_n', 'ARMY', 340),
    'Unmeasured width must have a stable default size');
}

// Check actual runtime wiring as well as pure geometry: a helper not consumed
// by both screens would allow the visual contracts to drift again.
const previewSource = readFileSync('src/ui/HumanKingdomScenePreview.tsx', 'utf8');
const settlementSource = readFileSync('src/screens/SettlementScreen.tsx', 'utf8');
const gameArtSource = readFileSync('src/ui/gameArt.tsx', 'utf8');
assert.match(previewSource, /humanSettlementBuildingSpriteSize\(plotId, building\.role, plateWidth\)/);
assert.match(settlementSource, /humanSettlementBuildingSpriteSize\(plot\.id, building\.role, mapWidth\)/);
assert.match(gameArtSource, /human-stage-environment-/);
assert.match(gameArtSource, /human-stronghold-supply-caravan/);
assert.match(gameArtSource, /capital-quayside-market-/);
assert.match(gameArtSource, /human-grand-campaign-standard/);
assert.doesNotMatch(gameArtSource, /grand-campaign-tent-/,
  'Campaign tents should not return to the visible water at the foot of the Capital plate');

console.log('Human settlement geometry, relocated Hall scale and seven-tier visual wiring OK.');
