import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { crc32, validateSpritePng } from './png-integrity.mjs';

// Exercise the checker itself; a corrupted payload must never pass on its header.
function chunk(type, payload) {
  const data = Buffer.concat([Buffer.from(type), payload]);
  const size = Buffer.alloc(4); size.writeUInt32BE(payload.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(data));
  return Buffer.concat([size, data, crc]);
}
function fixture({ opaque = false, blank = false, filter = 0, short = false } = {}) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(256, 0); ihdr.writeUInt32BE(256, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(256 * 1025);
  for (let y = 0; y < 256; y++) {
    raw[y * 1025] = filter;
    if (opaque) for (let x = 0; x < 256; x++) raw[y * 1025 + 4 + x * 4] = 255;
  }
  if (!blank && !opaque) raw[4] = 255;
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(short ? raw.subarray(0, raw.length - 1) : raw)), chunk('IEND', Buffer.alloc(0))]);
}
const validFixture = fixture();
assert.equal(validateSpritePng(validFixture).visible, 1);
assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926);
const corruptFixture = Buffer.from(validFixture); corruptFixture[45] ^= 1;
assert.throws(() => validateSpritePng(corruptFixture), /CRC mismatch/);
assert.throws(() => validateSpritePng(validFixture.subarray(0, -1)), /Truncated/);
assert.throws(() => validateSpritePng(Buffer.concat([validFixture, Buffer.from([0])])), /trailing/);
assert.throws(() => validateSpritePng(fixture({ opaque: true })), /all pixels are opaque/);
assert.throws(() => validateSpritePng(fixture({ blank: true })), /no visible pixels/);
assert.throws(() => validateSpritePng(fixture({ short: true })), /scanline size/);
assert.throws(() => validateSpritePng(fixture({ filter: 5 })), /row filter/);

const root = process.cwd();
const failures = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
function relative(file) { return path.relative(root, file).split(path.sep).join('/'); }
// All currently bundled game art shares the 256x256 alpha contract, including
// equipment and faction crests. Do not silently exclude a category from decoding.
const sprites = walk(path.join(root, 'assets/game')).filter(file => file.endsWith('.png')).sort();
assert.ok(sprites.length > 0, 'No production PNGs found');
const hashes = new Map();
for (const file of sprites) {
  const rel = relative(file), bytes = fs.readFileSync(file);
  try {
    validateSpritePng(bytes);
  } catch (error) {
    failures.push(rel + ': ' + error.message);
  }
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  const matches = hashes.get(hash) ?? [];
  matches.push(rel); hashes.set(hash, matches);
}
for (const matches of hashes.values()) {
  if (matches.length > 1) failures.push('Exact duplicate production PNGs: ' + matches.join(' | '));
}
const registry = fs.readFileSync(path.join(root, 'src/ui/productionAssets.ts'), 'utf8');
const registered = new Set([...registry.matchAll(/require\('\.\.\/\.\.\/(assets\/game\/[^']+\.png)'\)/g)].map(match => match[1]));
const spritePaths = new Set(sprites.map(relative));
for (const sprite of spritePaths) {
  if (!registered.has(sprite)) failures.push(sprite + ' exists but is not registered in productionAssetSources.');
}
for (const sprite of registered) {
  if (!spritePaths.has(sprite)) failures.push(sprite + ' is registered but the file does not exist.');
}

// The first settlement-art batch intentionally uses one compact 3x3 atlas so the
// nine faction anchors stay visually consistent and load as one production PNG.
const settlementAtlasPath = path.join(root, 'assets/game/ui/settlement_anchor_atlas.png');
if (!fs.existsSync(settlementAtlasPath)) {
  failures.push('Settlement anchor atlas is missing.');
} else {
  try {
    const atlas = validateSpritePng(fs.readFileSync(settlementAtlasPath));
    const channels = atlas.colorType === 6 ? 4 : 2;
    const origins = [0, 86, 172];
    for (const y0 of origins) {
      for (const x0 of origins) {
        let visible = 0;
        for (let y = y0; y < Math.min(256, y0 + 84); y++) {
          for (let x = x0; x < Math.min(256, x0 + 84); x++) {
            if (atlas.pixels[(y * 256 + x) * channels + channels - 1] > 0) visible++;
          }
        }
        if (visible < 150) failures.push('Settlement atlas cell ' + x0 + ',' + y0 + ' is unexpectedly blank.');
      }
    }
  } catch (error) {
    failures.push('Settlement anchor atlas: ' + error.message);
  }
}

// Human settlement support buildings use a second compact atlas. These six
// silhouettes come from the generated pixel-art visual pack and replace the
// coarse code fallback without changing settlement gameplay.
const settlementSupportAtlasPath = path.join(root, 'assets/game/ui/settlement_support_atlas.png');
if (!fs.existsSync(settlementSupportAtlasPath)) {
  failures.push('Settlement support atlas is missing.');
} else {
  try {
    const atlas = validateSpritePng(fs.readFileSync(settlementSupportAtlasPath));
    const channels = atlas.colorType === 6 ? 4 : 2;
    const cells = [[0, 0], [86, 0], [172, 0], [0, 86], [86, 86], [172, 86]];
    for (const [x0, y0] of cells) {
      let visible = 0;
      for (let y = y0; y < Math.min(256, y0 + 84); y++) {
        for (let x = x0; x < Math.min(256, x0 + 84); x++) {
          if (atlas.pixels[(y * 256 + x) * channels + channels - 1] > 0) visible++;
        }
      }
      if (visible < 120) failures.push('Settlement support atlas cell ' + x0 + ',' + y0 + ' is unexpectedly blank.');
    }
  } catch (error) {
    failures.push('Settlement support atlas: ' + error.message);
  }
}

const gameArt = fs.readFileSync(path.join(root, 'src/ui/gameArt.tsx'), 'utf8');
const settlementCells = {
  hall: [0, 0],
  barracks: [86, 0],
  wagonwright: [172, 0],
  elf_heartgrove_hall: [0, 86],
  elf_warden_lodge: [86, 86],
  elf_caravan_grove: [172, 86],
  orc_warhold: [0, 172],
  orc_clan_yard: [86, 172],
  orc_cartwright: [172, 172]
};
for (const [buildingId, [x, y]] of Object.entries(settlementCells)) {
  if (!gameArt.includes(buildingId + ': { x: ' + x + ', y: ' + y + ' }')) {
    failures.push('Settlement atlas mapping missing or moved for ' + buildingId + '.');
  }
}
const settlementAliases = [
  "hall: 'elf_heartgrove_hall'",
  "barracks: 'elf_warden_lodge'",
  "wagonwright: 'elf_caravan_grove'",
  "hall: 'orc_warhold'",
  "barracks: 'orc_clan_yard'",
  "wagonwright: 'orc_cartwright'"
];
for (const alias of settlementAliases) {
  if (!gameArt.includes(alias)) failures.push('Settlement faction alias missing: ' + alias);
}
if (!registry.includes("'ui.settlement_anchor_atlas': require('../../assets/game/ui/settlement_anchor_atlas.png')")) {
  failures.push('Settlement anchor atlas is not registered as a production source.');
}
const settlementSupportCells = {
  forge: [0, 0],
  quartermaster: [86, 0],
  stable: [172, 0],
  war_room: [0, 86],
  signal_tower: [86, 86],
  officer_academy: [172, 86]
};
for (const [buildingId, [x, y]] of Object.entries(settlementSupportCells)) {
  if (!gameArt.includes(buildingId + ': { x: ' + x + ', y: ' + y + ' }')) {
    failures.push('Settlement support atlas mapping missing or moved for ' + buildingId + '.');
  }
}
if (!gameArt.includes("faction === 'human' && settlementSupportAtlasCells[buildingId]")) {
  failures.push('Settlement support atlas must stay Human-only until Elf and Orc support art is authored.');
}
if (!registry.includes("'ui.settlement_support_atlas': require('../../assets/game/ui/settlement_support_atlas.png')")) {
  failures.push('Settlement support atlas is not registered as a production source.');
}
if (failures.length) {
  console.error('\nART REGRESSION FAILED');
  failures.forEach(failure => console.error('- ' + failure));
  process.exit(1);
}
console.log('PASS: ' + sprites.length + ' game PNGs fully decoded: CRCs, zlib payload, scanline/filter integrity, real alpha, size, registration and exact duplicates.');
