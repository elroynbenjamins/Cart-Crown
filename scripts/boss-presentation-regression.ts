import assert from 'node:assert/strict';
import { encounters, type EncounterId } from '../src/game/encounters';
import {
  BOSS_COMPACT_RAIL_WIDTH,
  BOSS_MAX_MARKS_PER_RAIL,
  BOSS_RAIL_WIDTH,
  bossSignatureByEncounter,
  canAnimateBossIntro,
  getBossPresentation
} from '../src/ui/bossPresentation';

const expected = {
  elf_hollow_warden: 'hollow_roots',
  orc_stonejaw_champion: 'stonejaw',
  return_to_crownspire: 'ashen_regent',
  unbound_beacon: 'beacon'
} as const;
assert.deepEqual(bossSignatureByEncounter, expected);
const encounterSnapshot = JSON.stringify(encounters);
let variants = 0;

for (const [id, encounter] of Object.entries(encounters)) {
  const encounterId = id as EncounterId;
  const signature = bossSignatureByEncounter[encounterId];
  if (!signature) {
    assert.equal(getBossPresentation(encounterId, encounter.difficulty, true, false), null);
    continue;
  }
  assert.equal(encounter.difficulty, 'Boss', `${id} must still be a real boss.`);
  for (const dark of [false, true]) {
    for (const compact of [false, true]) {
      const model = getBossPresentation(encounterId, 'Boss', dark, compact);
      assert.ok(model);
      assert.equal(model.signature, signature);
      assert.ok(model.introMs >= 400 && model.introMs <= 1000);
      assert.ok(Math.abs(model.drift) <= 8);
      assert.match(model.material, /^#[0-9A-Fa-f]{6}$/);
      assert.match(model.light, /^#[0-9A-Fa-f]{6}$/);
      assert.ok(model.marks.length > 0 && model.marks.length <= BOSS_MAX_MARKS_PER_RAIL);
      const railWidth = compact ? BOSS_COMPACT_RAIL_WIDTH : BOSS_RAIL_WIDTH;
      assert.ok(1 + railWidth < 14, 'Decoration must stay outside the card content inset.');
      const scale = railWidth / BOSS_RAIL_WIDTH;
      for (const mark of model.marks) {
        assert.ok([mark.x, mark.y, mark.width, mark.height].every(Number.isFinite));
        assert.ok(mark.width > 0 && mark.height > 0);
        assert.ok(mark.y >= 0 && mark.y < 100);
        const extent = mark.shape === 'diamond' ? (mark.width + mark.height) / Math.sqrt(2) : mark.width;
        const center = mark.x + mark.width / 2;
        assert.ok(center - extent / 2 >= 0 && center + extent / 2 <= BOSS_RAIL_WIDTH);
        for (const railHeight of [128, 240, 460, 700]) {
          const top = railHeight * mark.y / 100;
          assert.ok(top + Math.min(0, model.drift) >= 0, 'Intro drift must stay within the rail.');
          assert.ok(top + mark.height * scale + Math.max(0, model.drift) <= railHeight,
            'Decorations must fit short and tall battle cards.');
        }
      }
      if (compact) {
        assert.ok(model.marks.every(mark => !mark.optional));
        const full = getBossPresentation(encounterId, 'Boss', dark, false)!;
        assert.ok(model.marks.length < full.marks.length);
      }
      assert.deepEqual(model, getBossPresentation(encounterId, 'Boss', dark, compact),
        'No randomness or render-time particle accumulation.');
      variants++;
    }
  }
  for (const ordinaryDifficulty of ['Normal', 'Elite'] as const) {
    assert.equal(getBossPresentation(encounterId, ordinaryDifficulty, true, false), null,
      'Named enemies must not receive boss effects at an ordinary difficulty.');
  }
  assert.notEqual(
    getBossPresentation(encounterId, 'Boss', true, false)!.light,
    getBossPresentation(encounterId, 'Boss', false, false)!.light,
    'Light mode needs a separately authored palette.'
  );
}

assert.equal(variants, 16, 'Every selected boss must exist in encounter data.');
for (const reduced of [null, false, true]) {
  for (const appState of [null, 'active', 'background', 'inactive', 'unknown']) {
    assert.equal(canAnimateBossIntro(reduced, appState), reduced === false && appState === 'active');
  }
}
assert.equal(JSON.stringify(encounters), encounterSnapshot, 'Visual lookups must not mutate combat data.');
console.log(`PASS: ${variants} boss theme/layout variants, exact encounter mapping, rail bounds, finite budgets and reduced-motion/background policy.`);
