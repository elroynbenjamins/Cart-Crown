import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { validateSpritePng } from './png-integrity.mjs';
const manifest = JSON.parse(fs.readFileSync('assets/game/battle_portraits/human_v1/manifest.json', 'utf8'));
for (const [id, spec] of Object.entries(manifest.assets)) {
  const bytes = fs.readFileSync(spec.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), spec.sha256, id + ': unreviewed image bytes');
  const image = validateSpritePng(bytes);
  assert.equal(image.colorType, 6);
  let left = 256, top = 256, right = 0, bottom = 0;
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    if (image.pixels[(y * 256 + x) * 4 + 3] > 0) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
    }
  }
  assert.deepEqual([left, top, right, bottom], spec.visible_bounds, id + ': alpha bounds mismatch');
  const margin = id.endsWith('_portrait') ? 8 : 12;
  assert.ok(left >= margin && top >= margin && right <= 256 - margin && bottom <= 256 - margin,
    id + ': artwork touches its frame');
  assert.ok(image.visible > 7000, id + ': implausibly tiny or empty character');
}
console.log('PASS: all 24 Human art payloads match reviewed pixels and real transparent safe margins.');
