import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { inflateSync, deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';

// This is a validator for this project's 8-bit non-interlaced RGBA/GA asset
// contract, not a general PNG renderer. See https://www.w3.org/TR/png-3/.
// Header-only checks missed three corrupt sprite streams that broke AAPT2.
const SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex');
const crcTable = Array.from({ length: 256 }, (_, initial) => {
  let value = initial;
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 255] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}
function requireCondition(value, message) {
  if (!value) throw new Error(message);
}
function paeth(a, b, c) {
  const estimate = a + b - c;
  const da = Math.abs(estimate - a), db = Math.abs(estimate - b), dc = Math.abs(estimate - c);
  return da <= db && da <= dc ? a : db <= dc ? b : c;
}

export function decodeProductionPng(bytes) {
  requireCondition(bytes.length >= 57 && bytes.length <= 2097152, 'Invalid or oversized PNG byte count');
  requireCondition(bytes.subarray(0, 8).equals(SIGNATURE), 'Invalid PNG signature');
  let offset = 8, header = null, ended = false, dataClosed = false;
  const idat = [];
  while (offset < bytes.length) {
    requireCondition(offset + 12 <= bytes.length, 'Truncated chunk header');
    const length = bytes.readUInt32BE(offset);
    const end = offset + 12 + length;
    requireCondition(end <= bytes.length, 'Truncated chunk payload');
    const name = bytes.toString('ascii', offset + 4, offset + 8);
    requireCondition(/^[A-Za-z]{4}$/.test(name), 'Invalid chunk type');
    requireCondition(crc32(bytes.subarray(offset + 4, end - 4)) === bytes.readUInt32BE(end - 4), name + ' checksum mismatch');
    const data = bytes.subarray(offset + 8, end - 4);
    requireCondition(header || name === 'IHDR', 'IHDR must be first');
    if (name === 'IHDR') {
      requireCondition(!header && length === 13, 'Invalid or duplicate IHDR');
      header = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), colorType: data[9] };
      requireCondition(header.width > 0 && header.height > 0 && header.width <= 2048 && header.height <= 2048, 'Image dimensions exceed decode budget');
      requireCondition(data[8] === 8 && [4, 6].includes(data[9]) && data[10] === 0 && data[11] === 0 && data[12] === 0,
        'Expected 8-bit non-interlaced GA/RGBA PNG');
    } else if (name === 'IDAT') {
      requireCondition(!dataClosed, 'IDAT chunks must be consecutive');
      idat.push(data);
    } else if (name === 'IEND') {
      requireCondition(length === 0 && idat.length > 0 && end === bytes.length, 'Invalid IEND or trailing data');
      ended = true;
    } else {
      requireCondition(!['acTL', 'fcTL', 'fdAT'].includes(name), 'Animated PNG is outside the static sprite contract');
      requireCondition(name === 'PLTE' || (bytes[offset + 4] & 32) !== 0, 'Unknown critical chunk');
      if (idat.length) dataClosed = true;
    }
    offset = end;
  }
  requireCondition(ended && header && idat.length > 0, 'Missing IHDR, IDAT or IEND');
  const channels = header.colorType === 6 ? 4 : 2;
  const stride = header.width * channels;
  const expected = (stride + 1) * header.height;
  requireCondition(expected <= 16779264, 'Decoded image exceeds memory budget');
  const compressed = Buffer.concat(idat);
  const result = inflateSync(compressed, { maxOutputLength: expected + 1, info: true });
  requireCondition(result.engine.bytesWritten === compressed.length, 'Extra data after the zlib stream');
  const filtered = result.buffer;
  requireCondition(filtered.length === expected, 'Decoded scanline byte count does not match IHDR');
  const pixels = Buffer.alloc(stride * header.height);
  for (let y = 0; y < header.height; y++) {
    const filter = filtered[y * (stride + 1)];
    requireCondition(filter <= 4, 'Invalid scanline filter');
    for (let x = 0; x < stride; x++) {
      const at = y * stride + x;
      const a = x >= channels ? pixels[at - channels] : 0;
      const b = y > 0 ? pixels[at - stride] : 0;
      const c = y > 0 && x >= channels ? pixels[at - stride - channels] : 0;
      const predictor = filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b : filter === 3 ? Math.floor((a + b) / 2) : paeth(a, b, c);
      pixels[at] = (filtered[y * (stride + 1) + 1 + x] + predictor) & 255;
    }
  }
  let visible = 0, transparent = 0;
  for (let i = channels - 1; i < pixels.length; i += channels) {
    if (pixels[i] > 0) visible++;
    if (pixels[i] < 255) transparent++;
  }
  requireCondition(visible > 0 && transparent > 0, 'Sprite must have visible pixels and actual transparency');
  return { ...header, visible, transparent, pixels };
}

function chunk(type, payload) {
  const body = Buffer.concat([Buffer.from(type), payload]);
  const size = Buffer.alloc(4); size.writeUInt32BE(payload.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([size, body, crc]);
}
function fixture(raw, compressed = deflateSync(raw)) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(2, 0); header.writeUInt32BE(2, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([SIGNATURE, chunk('IHDR', header), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}
function runDecoderChecks() {
  const pixels = Buffer.from([0,0,0,0, 120,80,30,255, 8,12,16,255, 255,60,90,128]);
  for (let filter = 0; filter <= 4; filter++) {
    const raw = Buffer.alloc(18);
    for (let y = 0; y < 2; y++) {
      raw[y * 9] = filter;
      for (let x = 0; x < 8; x++) {
        const at = y * 8 + x;
        const a = x >= 4 ? pixels[at - 4] : 0, b = y ? pixels[at - 8] : 0;
        const c = y && x >= 4 ? pixels[at - 12] : 0;
        const predictor = filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b : filter === 3 ? Math.floor((a+b)/2) : paeth(a,b,c);
        raw[y*9+1+x] = (pixels[at] - predictor) & 255;
      }
    }
    assert.deepEqual(decodeProductionPng(fixture(raw)).pixels, pixels);
  }
  const raw = Buffer.from([0,0,0,0,0,120,80,30,255,0,8,12,16,255,255,60,90,128]);
  const valid = fixture(raw), corrupted = Buffer.from(valid); corrupted[45] ^= 1;
  assert.throws(() => decodeProductionPng(corrupted), /checksum/);
  assert.throws(() => decodeProductionPng(valid.subarray(0, valid.length - 5)), /Truncated/);
  assert.throws(() => decodeProductionPng(Buffer.concat([valid, Buffer.from([0])])), /trailing/);
  assert.throws(() => decodeProductionPng(fixture(raw, Buffer.from('not zlib'))));
  assert.throws(() => decodeProductionPng(fixture(raw.subarray(0,17))), /scanline/);
  assert.throws(() => decodeProductionPng(fixture(Buffer.alloc(18))), /visible/);
  const invalidFilter = Buffer.from(raw); invalidFilter[0] = 5;
  assert.throws(() => decodeProductionPng(fixture(invalidFilter)), /filter/);
}
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(name) : name.endsWith('.png') ? [name] : [];
  });
}
runDecoderChecks();
const directory = process.env.PNG_CHECK_ROOT ?? 'assets/game';
const files = walk(directory), errors = [];
requireCondition(files.length > 0, 'No production PNGs found');
for (const file of files) {
  try { decodeProductionPng(fs.readFileSync(file)); }
  catch (error) { errors.push(file + ': ' + error.message); }
}
if (errors.length) throw new Error('PNG data integrity failed:\n' + errors.join('\n'));
const recovered = {
  'assets/game/units/human/marksman.png': '2a68e7e0af4e60bec870a34da791e1657ac8fa84e499e2cc52031c821d94b741',
  'assets/game/units/human/shield_spearman.png': '61055c14d9fda2aa5316c66a29602cb97987af369c9287541172321264aaa502',
  'assets/game/units/orc/warbringer.png': '81f6e3df8b7b3b9b5910c1addc9fcbee1396fb2dce020a305460739fc5682b9b'
};
// The repair manifest is evidence, not a permanent ban on future reviewed art.
if (process.env.PNG_VERIFY_REPAIR === '1') for (const [file, hash] of Object.entries(recovered)) {
  assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), hash);
}
console.log(`PASS: ${files.length} PNGs decoded; chunk bounds/order/CRC, zlib checksum, all scanlines, alpha and decoder negative cases verified.`);
