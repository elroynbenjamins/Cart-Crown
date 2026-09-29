import { inflateSync } from 'node:zlib';

const SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex');
const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function requireValid(condition, message) {
  if (!condition) throw new Error(message);
}
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** Validate/decode the repository's 8-bit, noninterlaced, alpha sprite contract. */
export function validateSpritePng(bytes) {
  requireValid(bytes.length >= 57 && bytes.length <= 200000, 'Invalid sprite file size');
  requireValid(bytes.subarray(0, 8).equals(SIGNATURE), 'Invalid PNG signature');
  let cursor = 8, header = null, ended = false, idatEnded = false;
  const idats = [];
  while (cursor < bytes.length) {
    requireValid(cursor + 12 <= bytes.length, 'Truncated PNG chunk');
    const length = bytes.readUInt32BE(cursor);
    const type = bytes.toString('ascii', cursor + 4, cursor + 8);
    const end = cursor + 8 + length;
    requireValid(end + 4 <= bytes.length, `Truncated ${type} payload`);
    requireValid(crc32(bytes.subarray(cursor + 4, end)) === bytes.readUInt32BE(end), `${type} CRC mismatch`);
    const data = bytes.subarray(cursor + 8, end);
    if (type === 'IHDR') {
      requireValid(cursor === 8 && !header && length === 13, 'Invalid or repeated IHDR');
      header = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), colorType: data[9] };
      requireValid(header.width === 256 && header.height === 256, 'Sprite must be 256x256');
      requireValid(data[8] === 8 && [4, 6].includes(header.colorType), 'Sprite must use 8-bit alpha color type 4 or 6');
      requireValid(data[10] === 0 && data[11] === 0 && data[12] === 0, 'Unsupported PNG compression/filter/interlace');
    } else if (type === 'IDAT') {
      requireValid(header && !idatEnded, 'Misordered IDAT');
      idats.push(data);
    } else if (type === 'IEND') {
      requireValid(header && idats.length && length === 0, 'Invalid IEND');
      ended = true;
      cursor = end + 4;
      break;
    } else {
      requireValid(header, 'IHDR must be first');
      requireValid(type === 'PLTE' || (type.charCodeAt(0) & 32), `Unknown critical chunk ${type}`);
      if (idats.length) idatEnded = true;
    }
    cursor = end + 4;
  }
  requireValid(ended && cursor === bytes.length, 'Missing IEND or trailing PNG data');
  const channels = header.colorType === 6 ? 4 : 2;
  const stride = header.width * channels;
  const expected = (stride + 1) * header.height;
  const compressed = Buffer.concat(idats);
  const inflated = inflateSync(compressed, { maxOutputLength: expected + 1, info: true });
  const scanlines = inflated.buffer;
  requireValid(scanlines.length === expected, 'Decoded scanline size does not match dimensions');
  requireValid(inflated.engine.bytesWritten === compressed.length, 'Trailing compressed IDAT data');
  const pixels = Buffer.alloc(stride * header.height);
  for (let y = 0; y < header.height; y++) {
    const start = y * (stride + 1), filter = scanlines[start];
    requireValid(filter <= 4, 'Invalid PNG row filter');
    for (let x = 0; x < stride; x++) {
      const index = y * stride + x;
      const a = x >= channels ? pixels[index - channels] : 0;
      const b = y > 0 ? pixels[index - stride] : 0;
      const c = x >= channels && y > 0 ? pixels[index - stride - channels] : 0;
      const predictor = filter === 1 ? a : filter === 2 ? b : filter === 3
        ? Math.floor((a + b) / 2) : filter === 4 ? paeth(a, b, c) : 0;
      pixels[index] = (scanlines[start + 1 + x] + predictor) & 255;
    }
  }
  let transparent = 0, visible = 0;
  for (let i = channels - 1; i < pixels.length; i += channels) {
    if (pixels[i] < 255) transparent++;
    if (pixels[i] > 0) visible++;
  }
  requireValid(transparent > 0, 'Alpha header is present but all pixels are opaque');
  requireValid(visible > 0, 'Sprite contains no visible pixels');
  return { ...header, pixels, transparent, visible };
}
