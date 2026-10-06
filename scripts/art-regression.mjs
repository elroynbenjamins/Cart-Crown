import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { crc32, validateAlphaAtlasPng, validateScenePng, validateSpritePng } from './png-integrity.mjs';

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

// Opaque scenery has a distinct contract; introducing it must not make opaque,
// oversized, or incorrectly sized unit/equipment PNGs valid sprites.
function sceneFixture({ alpha = false, transparent = false, filter = 0 } = {}) {
  const width = 8, height = 4, channels = alpha ? 4 : 3;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = alpha ? 6 : 2;
  const stride = width * channels + 1;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = filter;
    for (let x = 0; x < width; x++) {
      const offset = y * stride + 1 + x * channels;
      raw[offset] = 40 + x; raw[offset + 1] = 90 + y; raw[offset + 2] = 120;
      if (alpha) raw[offset + 3] = transparent && x === 0 && y === 0 ? 254 : 255;
    }
  }
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const sceneFixtureContract = { width: 8, height: 4, maxBytes: 1024 };
for (const alpha of [false, true]) {
  const scene = validateScenePng(sceneFixture({ alpha }), sceneFixtureContract);
  assert.equal(scene.visible, 32); assert.equal(scene.transparent, 0);
  assert.deepEqual([...scene.pixels.subarray(0, 3)], [40, 90, 120]);
}
const opaqueSceneFixture = sceneFixture();
assert.throws(() => validateScenePng(opaqueSceneFixture), /explicit dimensions/);
assert.throws(() => validateScenePng(opaqueSceneFixture, { ...sceneFixtureContract, width: 9 }), /Scene must be 9x4/);
assert.throws(() => validateScenePng(opaqueSceneFixture, { ...sceneFixtureContract, maxBytes: opaqueSceneFixture.length - 1 }), /file size/);
assert.throws(() => validateScenePng(sceneFixture({ alpha: true, transparent: true }), sceneFixtureContract), /fully opaque/);
assert.throws(() => validateScenePng(opaqueSceneFixture.subarray(0, -1), sceneFixtureContract), /Truncated/);
const corruptSceneFixture = Buffer.from(opaqueSceneFixture); corruptSceneFixture[45] ^= 1;
assert.throws(() => validateScenePng(corruptSceneFixture, sceneFixtureContract), /CRC mismatch/);
assert.throws(() => validateScenePng(sceneFixture({ filter: 5 }), sceneFixtureContract), /row filter/);
assert.throws(() => validateScenePng(Buffer.concat([opaqueSceneFixture, Buffer.from([0])]), sceneFixtureContract), /trailing/);
// RGB PNGs can declare keyed transparency in tRNS despite having no alpha channel.
const keyedTransparentScene = Buffer.concat([opaqueSceneFixture.subarray(0, 33), chunk('tRNS', Buffer.from([0, 40, 0, 90, 0, 120])), opaqueSceneFixture.subarray(33)]);
assert.throws(() => validateScenePng(keyedTransparentScene, sceneFixtureContract), /transparency chunk/);
assert.throws(() => validateSpritePng(opaqueSceneFixture), /256x256/);

// Six separate icons must not bleed into a neighboring icon when cropped from
// one source. Margins are exact by default; only the reviewed treasury contract
// below permits a tightly capped amount of alpha-mask quantization roundoff.
function atlasFixture({ blankCell = -1, spill = null, opaque = false } = {}) {
  const width = 48, height = 32, stride = width * 4 + 1;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = Math.floor(y / 16) * 3 + Math.floor(x / 16);
      const inside = x % 16 >= 3 && x % 16 < 13 && y % 16 >= 3 && y % 16 < 13;
      const offset = y * stride + 1 + x * 4;
      raw[offset] = 50 + cell * 20; raw[offset + 1] = 100; raw[offset + 2] = 140;
      raw[offset + 3] = opaque || (inside && cell !== blankCell) ? 255 : 0;
    }
  }
  if (spill) for (const pixel of Array.isArray(spill) ? spill : [spill]) {
    raw[pixel.y * stride + 1 + pixel.x * 4 + 3] = pixel.alpha ?? 1;
  }
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const atlasFixtureContract = { width: 48, height: 32, maxBytes: 1024, columns: 3, rows: 2, margin: 2, minCellCoverage: 0.1 };
const validAtlasFixture = atlasFixture();
assert.deepEqual(validateAlphaAtlasPng(validAtlasFixture, atlasFixtureContract).cells.map(cell => cell.visible), [100, 100, 100, 100, 100, 100]);
assert.throws(() => validateAlphaAtlasPng(validAtlasFixture), /explicit dimensions/);
assert.throws(() => validateAlphaAtlasPng(validAtlasFixture, { ...atlasFixtureContract, width: 49 }), /Atlas must be 49x32/);
assert.throws(() => validateAlphaAtlasPng(validAtlasFixture, { ...atlasFixtureContract, maxBytes: validAtlasFixture.length - 1 }), /file size/);
assert.throws(() => validateAlphaAtlasPng(validAtlasFixture, { ...atlasFixtureContract, margin: 0 }), /transparent margins/);
assert.throws(() => validateAlphaAtlasPng(atlasFixture({ blankCell: 5 }), atlasFixtureContract), /cell 2,1.*blank/);
assert.throws(() => validateAlphaAtlasPng(atlasFixture({ spill: { x: 0, y: 8 } }), atlasFixtureContract), /transparent margin/);
assert.throws(() => validateAlphaAtlasPng(atlasFixture({ spill: { x: 16, y: 8 } }), atlasFixtureContract), /transparent margin/);
assert.throws(() => validateAlphaAtlasPng(atlasFixture({ spill: { x: 8, y: 16 } }), atlasFixtureContract), /transparent margin/);
assert.throws(() => validateAlphaAtlasPng(atlasFixture({ opaque: true }), atlasFixtureContract), /real transparency/);
const atlasRoundoffContract = { ...atlasFixtureContract, maxMarginAlpha: 1, maxMarginPixels: 32 };
const sparseRoundoff = Array.from({ length: 32 }, (_, x) => ({ x, y: 0, alpha: 1 }));
assert.equal(validateAlphaAtlasPng(atlasFixture({ spill: sparseRoundoff }), atlasRoundoffContract).marginNoisePixels, 32);
assert.throws(() => validateAlphaAtlasPng(atlasFixture({ spill: [...sparseRoundoff, { x: 32, y: 0, alpha: 1 }] }), atlasRoundoffContract), /margin roundoff budget/);
assert.throws(() => validateAlphaAtlasPng(atlasFixture({ spill: { x: 16, y: 8, alpha: 2 } }), atlasRoundoffContract), /transparent margin/);
assert.throws(() => validateAlphaAtlasPng(validAtlasFixture, { ...atlasRoundoffContract, maxMarginAlpha: 2 }), /roundoff allowance/);
const corruptAtlasFixture = Buffer.from(validAtlasFixture); corruptAtlasFixture[45] ^= 1;
assert.throws(() => validateAlphaAtlasPng(corruptAtlasFixture, atlasFixtureContract), /CRC mismatch/);
assert.throws(() => validateSpritePng(validAtlasFixture), /256x256/);

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

function jpegDimensions(bytes) {
  assert.equal(bytes[0], 0xff, 'JPEG must start with SOI.');
  assert.equal(bytes[1], 0xd8, 'JPEG must start with SOI.');
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    const marker = bytes[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x00 || marker === 0xff) { offset += 1; continue; }
    const length = bytes.readUInt16BE(offset + 2);
    assert.ok(length >= 2 && offset + 2 + length <= bytes.length, 'JPEG segment is truncated.');
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7)
      };
    }
    offset += 2 + length;
  }
  throw new Error('JPEG has no supported SOF dimensions.');
}

// Only these reviewed panorama files use the scene contract. Apart from the
// explicit treasury atlas below, other assets retain the 256x256 alpha contract.
// Unknown scene files fail rather than escaping checks through their directory.
const campScenes = new Map([
  ['assets/game/scenes/human/camp.png', { assetId: 'scene.human.camp', width: 1672, height: 941, maxBytes: 3500000 }],
  ['assets/game/scenes/elf/camp.png', { assetId: 'scene.elf.camp', width: 1672, height: 941, maxBytes: 3500000 }],
  ['assets/game/scenes/orc/camp.png', { assetId: 'scene.orc.camp', width: 1672, height: 941, maxBytes: 3500000 }]
]);
const campSceneByteBudget = 9000000;
const settlementBackgrounds = new Map([
  ['assets/game/scenes/human/settlement/camp.jpg', { assetId: 'settlement_background.human.camp', width: 540, height: 960, maxBytes: 240000 }],
  ['assets/game/scenes/human/settlement/settlement.jpg', { assetId: 'settlement_background.human.settlement', width: 540, height: 960, maxBytes: 240000 }],
  ['assets/game/scenes/human/settlement/fort.jpg', { assetId: 'settlement_background.human.fort', width: 540, height: 960, maxBytes: 240000 }],
  ['assets/game/scenes/human/settlement/town.jpg', { assetId: 'settlement_background.human.town', width: 540, height: 960, maxBytes: 240000 }],
  ['assets/game/scenes/human/settlement/capital.jpg', { assetId: 'settlement_background.human.capital', width: 540, height: 960, maxBytes: 260000 }]
]);
const settlementBackgroundByteBudget = 1050000;
const treasuryAtlas = {
  relativePath: 'assets/game/ui/treasury_atlas.png', assetId: 'ui.treasury_atlas',
  width: 1536, height: 1024, maxBytes: 3000000, columns: 3, rows: 2,
  margin: 8, minCellCoverage: 0.1,
  // The reviewed unchanged source has exactly 15 isolated alpha-1 pixels in
  // its gutters. Permit at most 32 of these 1/255 mask-roundoff pixels across
  // the ENTIRE atlas; alpha >= 2 or a dense residue still fails. No other asset
  // category or atlas receives this tolerance.
  maxMarginAlpha: 1, maxMarginPixels: 32
};
const settlementHumanV2Atlas = {
  width: 330, height: 330, maxBytes: 200000, columns: 3, rows: 3,
  margin: 2, minCellCoverage: 0.1
};
const sprites = walk(path.join(root, 'assets/game')).filter(file => file.endsWith('.png')).sort();
assert.ok(sprites.length > 0, 'No production PNGs found');
let settlementBackgroundBytes = 0;
for (const [relativePath, contract] of settlementBackgrounds) {
  const full = path.join(root, relativePath);
  try {
    assert.ok(fs.existsSync(full), 'Settlement background is missing.');
    const bytes = fs.readFileSync(full);
    settlementBackgroundBytes += bytes.length;
    assert.ok(bytes.length <= contract.maxBytes, 'Settlement background exceeds file-size budget.');
    assert.equal(bytes.at(-2), 0xff, 'JPEG must end with EOI.');
    assert.equal(bytes.at(-1), 0xd9, 'JPEG must end with EOI.');
    const dimensions = jpegDimensions(bytes);
    assert.equal(dimensions.width, contract.width, 'Settlement background has wrong width.');
    assert.equal(dimensions.height, contract.height, 'Settlement background has wrong height.');
  } catch (error) {
    failures.push(relativePath + ': ' + error.message);
  }
}
if (settlementBackgroundBytes > settlementBackgroundByteBudget) {
  failures.push('Settlement backgrounds exceed the shared ' + settlementBackgroundByteBudget + '-byte budget: ' + settlementBackgroundBytes + ' bytes.');
}
const hashes = new Map();
let campSceneBytes = 0;
for (const file of sprites) {
  const rel = relative(file), bytes = fs.readFileSync(file);
  try {
    const scene = campScenes.get(rel);
    if (rel === treasuryAtlas.relativePath) validateAlphaAtlasPng(bytes, treasuryAtlas);
    else if (scene) {
      campSceneBytes += bytes.length;
      validateScenePng(bytes, scene);
    }
    else {
      assert.ok(!rel.startsWith('assets/game/scenes/'), 'Scene has no reviewed image contract.');
      validateSpritePng(bytes);
    }
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
if (campSceneBytes > campSceneByteBudget) {
  failures.push('Camp scenes exceed the shared ' + campSceneByteBudget + '-byte budget: ' + campSceneBytes + ' bytes.');
}
const registry = fs.readFileSync(path.join(root, 'src/ui/productionAssets.ts'), 'utf8');
const registered = new Set([...registry.matchAll(/require\('\.\.\/\.\.\/(assets\/game\/[^']+\.(?:png|jpg))'\)/g)].map(match => match[1]));
const spritePaths = new Set(sprites.map(relative));
const productionAssetPaths = new Set([
  ...spritePaths,
  ...settlementBackgrounds.keys()
]);
for (const sprite of spritePaths) {
  if (!registered.has(sprite)) failures.push(sprite + ' exists but is not registered in productionAssetSources.');
}
for (const asset of settlementBackgrounds.keys()) {
  if (!registered.has(asset)) failures.push(asset + ' exists but is not registered in productionAssetSources.');
}
for (const asset of registered) {
  if (!productionAssetPaths.has(asset)) failures.push(asset + ' is registered but the file does not exist.');
}
for (const [relativePath, background] of settlementBackgrounds) {
  const expected = "'" + background.assetId + "': require('../../" + relativePath + "')";
  if (!registry.includes(expected)) failures.push('Settlement background is not registered: ' + background.assetId + '.');
}
for (const [relativePath, scene] of campScenes) {
  if (!spritePaths.has(relativePath)) failures.push('Camp scene is missing: ' + relativePath + '.');
  const expected = "'" + scene.assetId + "': require('../../" + relativePath + "')";
  if (!registry.includes(expected)) failures.push('Camp scene is not registered for its faction: ' + scene.assetId + '.');
}
if (!spritePaths.has(treasuryAtlas.relativePath)) failures.push('Treasury atlas is missing.');
const treasuryRegistration = "'" + treasuryAtlas.assetId + "': require('../../" + treasuryAtlas.relativePath + "')";
if (!registry.includes(treasuryRegistration)) failures.push('Treasury atlas is not registered as ui.treasury_atlas.');
const settlementHumanV2ModulePath = path.join(root, 'src/ui/generated/humanSettlementAtlas.ts');
if (!fs.existsSync(settlementHumanV2ModulePath)) {
  failures.push('Embedded high-detail Human settlement atlas module is missing.');
} else {
  try {
    const moduleSource = fs.readFileSync(settlementHumanV2ModulePath, 'utf8');
    const match = moduleSource.match(/humanSettlementAtlasBase64\s*=\s*'([^']+)'/);
    assert.ok(match, 'Embedded Human settlement atlas base64 payload is missing.');
    const bytes = Buffer.from(match[1], 'base64');
    validateAlphaAtlasPng(bytes, settlementHumanV2Atlas);
  } catch (error) {
    failures.push('Embedded high-detail Human settlement atlas: ' + error.message);
  }
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

const settlementSupportAtlases = [
  ['human', 'assets/game/ui/settlement_support_human_atlas.png', 'ui.settlement_support_human_atlas'],
  ['elf', 'assets/game/ui/settlement_support_elf_atlas.png', 'ui.settlement_support_elf_atlas'],
  ['orc', 'assets/game/ui/settlement_support_orc_atlas.png', 'ui.settlement_support_orc_atlas']
];
const settlementSupportCells = {
  forge: [0, 0],
  quartermaster: [86, 0],
  stable: [172, 0],
  war_room: [0, 86],
  signal_tower: [86, 86],
  officer_academy: [172, 86]
};
for (const [faction, relativePath, assetId] of settlementSupportAtlases) {
  const atlasPath = path.join(root, relativePath);
  if (!fs.existsSync(atlasPath)) {
    failures.push('Settlement support atlas is missing for ' + faction + '.');
    continue;
  }
  try {
    const atlas = validateSpritePng(fs.readFileSync(atlasPath));
    const channels = atlas.colorType === 6 ? 4 : 2;
    for (const [kind, [x0, y0]] of Object.entries(settlementSupportCells)) {
      let visible = 0;
      for (let y = y0; y < Math.min(256, y0 + 84); y++) {
        for (let x = x0; x < Math.min(256, x0 + 84); x++) {
          if (atlas.pixels[(y * 256 + x) * channels + channels - 1] > 0) visible++;
        }
      }
      if (visible < 120) failures.push('Settlement support atlas ' + faction + ' cell ' + kind + ' is unexpectedly blank.');
    }
  } catch (error) {
    failures.push('Settlement support atlas ' + faction + ': ' + error.message);
  }
  const expectedRegistration = "'" + assetId + "': require('../../" + relativePath + "')";
  if (!registry.includes(expectedRegistration)) {
    failures.push('Settlement support atlas is not registered for ' + faction + '.');
  }
}

const settlementWorldDetailAtlases = [
  ['world', 'assets/game/ui/settlement_world_human_atlas.png'],
  ['people', 'assets/game/ui/settlement_people_human_atlas.png'],
  ['nature', 'assets/game/ui/settlement_nature_human_atlas.png'],
  ['scene_v2', 'assets/game/ui/settlement_scene_human_v2_atlas.png']
];
for (const [label, relativePath] of settlementWorldDetailAtlases) {
  const atlasPath = path.join(root, relativePath);
  if (!fs.existsSync(atlasPath)) {
    failures.push('Settlement world-detail atlas is missing: ' + label + '.');
    continue;
  }
  try {
    const atlas = validateSpritePng(fs.readFileSync(atlasPath));
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
        if (visible < 80) failures.push('Settlement ' + label + ' atlas cell ' + x0 + ',' + y0 + ' is unexpectedly blank.');
      }
    }
  } catch (error) {
    failures.push('Settlement world-detail atlas ' + label + ': ' + error.message);
  }
}
for (const [assetId, relativePath] of [
  ['ui.settlement_world_human_atlas', 'assets/game/ui/settlement_world_human_atlas.png'],
  ['ui.settlement_people_human_atlas', 'assets/game/ui/settlement_people_human_atlas.png'],
  ['ui.settlement_nature_human_atlas', 'assets/game/ui/settlement_nature_human_atlas.png'],
  ['ui.settlement_scene_human_v2_atlas', 'assets/game/ui/settlement_scene_human_v2_atlas.png']
]) {
  const expected = "'" + assetId + "': require('../../" + relativePath + "')";
  if (!registry.includes(expected)) failures.push('Settlement world-detail atlas is not registered: ' + assetId + '.');
}

const gameArt = fs.readFileSync(path.join(root, 'src/ui/gameArt.tsx'), 'utf8');
const settlementHumanV2Cells = {
  hall: [0, 0],
  barracks: [110, 0],
  wagonwright: [220, 0],
  forge: [0, 110],
  quartermaster: [110, 110],
  stable: [220, 110],
  war_room: [0, 220],
  signal_tower: [110, 220],
  officer_academy: [220, 220]
};
for (const [buildingId, [x, y]] of Object.entries(settlementHumanV2Cells)) {
  if (!gameArt.includes(buildingId + ': { x: ' + x + ', y: ' + y + ' }')) {
    failures.push('High-detail Human settlement atlas mapping missing or moved for ' + buildingId + '.');
  }
}
if (
  !gameArt.includes("faction === 'human'") ||
  !gameArt.includes('settlementHumanV2AtlasUri') ||
  !gameArt.includes("from './generated/humanSettlementAtlas'")
) {
  failures.push('Human BuildingSprite must prefer the embedded high-detail settlement atlas.');
}

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
for (const expected of [
  "road_cross: { x: 86, y: 86 }",
  "torch_banner: { x: 86, y: 172 }",
  "guard: { x: 172, y: 0 }",
  "horse: { x: 172, y: 172 }",
  "tree_large: { x: 0, y: 0 }",
  "rocks: { x: 0, y: 172 }",
  "dock: { x: 0, y: 0 }",
  "sailboat: { x: 86, y: 0 }",
  "waterfall: { x: 172, y: 0 }",
  "build_dirt: { x: 0, y: 86 }",
  "market: { x: 172, y: 86 }",
  "wagon: { x: 0, y: 172 }",
  "fountain: { x: 86, y: 172 }",
  "gate: { x: 172, y: 172 }"
]) {
  if (!gameArt.includes(expected)) failures.push('Settlement world-detail cell mapping missing: ' + expected);
}
if (!gameArt.includes('SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas"')) {
  failures.push('Human settlement backdrop must render the world-detail atlas.');
}
if (!gameArt.includes('SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas"')) {
  failures.push('Human settlement backdrop must render ambient people from the production atlas.');
}
if (!gameArt.includes('SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas"')) {
  failures.push('Human settlement backdrop must render nature details from the production atlas.');
}
for (const faction of ['human', 'elf', 'orc']) {
  if (!gameArt.includes(faction + ": 'ui.settlement_scene_human_v2_atlas'")) {
    failures.push('Settlement shared scene atlas routing missing for ' + faction + '.');
  }
}
for (const faction of ['elf', 'orc']) {
  if (!gameArt.includes(faction + ": '#")) {
    failures.push('Settlement scene tint missing for ' + faction + '.');
  }
}
if (!gameArt.includes('assetId={sceneAssetId}') || !gameArt.includes('tintColor={sceneTint}')) {
  failures.push('Settlement backdrop must route and tint shared scene-detail art by faction.');
}
if (!gameArt.includes('export function SettlementBuildPlotSprite')) {
  failures.push('Settlement build plots must use the scene-detail production atlas when available.');
}
if (!gameArt.includes('AccessibilityInfo.isReduceMotionEnabled()') || !gameArt.includes("'reduceMotionChanged'")) {
  failures.push('Settlement ambient motion must respect reduced-motion accessibility.');
}
if (!gameArt.includes('useNativeDriver: true') || !gameArt.includes('Animated.loop(')) {
  failures.push('Settlement ambient motion must use lightweight native-driver loops.');
}
for (const token of ['smokeLift', 'glowPulse', 'bannerSway', 'waterShift', 'boatBob']) {
  if (!gameArt.includes(token)) failures.push('Settlement ambient motion signal missing: ' + token + '.');
}
for (const [kind, [x, y]] of Object.entries(settlementSupportCells)) {
  if (!gameArt.includes(kind + ': { x: ' + x + ', y: ' + y + ' }')) {
    failures.push('Settlement support renderer mapping missing or moved for ' + kind + '.');
  }
}
for (const faction of ['human', 'elf', 'orc']) {
  if (!gameArt.includes(faction + ": 'ui.settlement_support_" + faction + "_atlas'")) {
    failures.push('Settlement support asset routing missing for ' + faction + '.');
  }
}
if (!gameArt.includes('settlementSupportAtlasCells[kind]')) {
  failures.push('Settlement support renderer must route faction building visual kinds through the atlas.');
}
if (!gameArt.includes('function SettlementGrowthLayer')) {
  failures.push('Settlement stage growth layer is missing.');
}
if (!gameArt.includes('const settlementGrowthTint')) {
  failures.push('Settlement stage growth must preserve faction-specific visual tinting.');
}
for (const rank of [1, 2, 3, 4, 5, 6]) {
  if (!gameArt.includes('rank >= ' + rank)) {
    failures.push('Settlement stage growth threshold missing for rank ' + rank + '.');
  }
}
for (const token of [
  'settlementWorldHumanCells.road_straight',
  'settlementNatureHumanCells.stone_wall',
  'settlementPeopleHumanCells.merchant',
  'settlementSceneHumanV2Cells.market',
  'settlementSceneHumanV2Cells.dock',
  'settlementSceneHumanV2Cells.gate'
]) {
  if (!gameArt.includes(token)) failures.push('Settlement growth visual layer missing: ' + token + '.');
}
if (failures.length) {
  console.error('\nART REGRESSION FAILED');
  failures.forEach(failure => console.error('- ' + failure));
  process.exit(1);
}
console.log('PASS: ' + sprites.length + ' game PNGs fully decoded: CRCs, zlib payload, scanline/filter integrity, sprite alpha / explicit scene opacity / atlas gutters, size, registration and exact duplicates.');
