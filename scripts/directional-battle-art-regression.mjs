import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { validateSpritePng } from './png-integrity.mjs';

// Fail closed when somebody starts copying experimental poses into the release.
// Direction is an ART REVIEW criterion: geometry/alpha checks cannot certify
// that an arrow points up or that a horse looks like the right mount.
export const pilotClasses = ['shield_infantry', 'ranger', 'heavy_cavalry', 'field_medic', 'spearman', 'crossbowman', 'great_sword', 'banner_captain'];
const sides = ['ally_back', 'enemy_front'];
const root = 'assets/game/battle_directional/human';
const expected = pilotClasses.flatMap(unit => sides.map(side => unit + '_' + side + '.png'));
const registry = fs.readFileSync('src/ui/productionAssets.ts', 'utf8');

function literalRegistration(id, source) {
  const idQuoted = "'battle_directional.human." + id + "'";
  const sourceQuoted = "require('../../" + source + "')";
  return registry.includes(idQuoted) && registry.includes(sourceQuoted);
}

if (!fs.existsSync(root)) {
  // No missing production assets, no fake success claim. The fallback stage art
  // remains the approved Human figure pipeline until actual poses are vetted.
  for (const name of expected) {
    assert.ok(!registry.includes("'battle_directional.human." + name.replace('.png', '') + "'"),
      'Directional sprite registered without approved production files: ' + name);
  }
  console.log('PASS: directional pilot remains unshipped; approved figure fallbacks retained.');
} else {
  const names = fs.readdirSync(root);
  const manifestPath = path.join(root, 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'Direction-specific artwork needs a provenance/approval manifest.');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.version, 1);
  assert.equal(manifest.approvedForRuntime, true,
    'Do not wire generated concept/prototype sprites before Human art quality review.');
  assert.ok(typeof manifest.reviewedBy === 'string' && manifest.reviewedBy.trim().length >= 2,
    'Record art signoff, not an anonymous approval flag.');
  assert.ok(Array.isArray(manifest.entries), 'Review manifest needs one record per production pose.');
  assert.deepEqual([...names].filter(name => name.endsWith('.png')).sort(), [...expected].sort(),
    'Human pilot must ship exactly eight coherent ally/enemy sprite pairs.');
  assert.deepEqual([...manifest.entries].map(entry => entry.file).sort(), [...expected].sort(),
    'Each approved pose needs an exact manifest entry.');
  for (const name of expected) {
    const entry = manifest.entries.find(item => item.file === name);
    assert.ok(entry && entry.view === (name.endsWith('ally_back.png') ? 'up/back' : 'down/front'),
      'Every sprite needs the correct battle camera-facing review.');
    assert.ok(typeof entry.note === 'string' && entry.note.length >= 8,
      'Record verified equipment/silhouette differences for ' + name);
    const p = path.join(root, name);
    const content = fs.readFileSync(p);
    assert.equal(content.length, entry.bytes, 'Approved image byte count must match manifest: ' + name);
    assert.equal(createHash('sha256').update(content).digest('hex'), entry.sha256,
      'Production sprite differs from owner-approved artwork: ' + name);
    const decoded = validateSpritePng(content);
    assert.equal(decoded.width, 256);
    assert.equal(decoded.height, 256);
    assert.ok(decoded.transparent > 0,
      'Directional sprite must have an actually transparent background: ' + name);
    const channels = decoded.colorType === 6 ? 4 : 2;
    let visible = 0, minX = 256, maxX = -1, maxY = -1;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const alpha = decoded.pixels[(y * 256 + x) * channels + channels - 1];
      if (alpha > 32) { visible++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    }
    assert.ok(visible >= 3500 && maxX - minX + 1 >= 84 && maxY >= 170,
      'Pose is too sparse, tiny or floats above ground: ' + name);
    assert.ok(literalRegistration(name.replace('.png', ''), p.replaceAll('\\', '/')),
      'Use a matching explicit Metro require for each reviewed directional pose: ' + name);
  }
  console.log('PASS: all sixteen reviewed, size-bounded, alpha-transparent directional poses and literal Metro registrations.');
}
