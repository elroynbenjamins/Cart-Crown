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

// All image categories use the same complete decoder. Their dimensions,
// permitted color types, byte limits and alpha requirements remain separate.
function decodePng(bytes, contract) {
  requireValid(bytes.length >= 57 && bytes.length <= contract.maxBytes, 'Invalid ' + contract.label.toLowerCase() + ' file size');
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
      requireValid(header.width === contract.width && header.height === contract.height, contract.label + ' must be ' + contract.width + 'x' + contract.height);
      requireValid(data[8] === 8 && contract.colorTypes.includes(header.colorType), contract.colorMessage);
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
      requireValid(!contract.opaque || type !== 'tRNS', 'Scene must not include a transparency chunk');
      if (idats.length) idatEnded = true;
    }
    cursor = end + 4;
  }
  requireValid(ended && cursor === bytes.length, 'Missing IEND or trailing PNG data');
  const channels = header.colorType === 6 ? 4 : header.colorType === 2 ? 3 : 2;
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
  if (header.colorType === 2) {
    visible = header.width * header.height;
  } else {
    for (let i = channels - 1; i < pixels.length; i += channels) {
      if (pixels[i] < 255) transparent++;
      if (pixels[i] > 0) visible++;
    }
  }
  return { ...header, pixels, transparent, visible };
}

/** Validate/decode the unchanged 256x256, 200KB, noninterlaced alpha-sprite contract. */
export function validateSpritePng(bytes) {
  const decoded = decodePng(bytes, {
    label: 'Sprite', width: 256, height: 256, maxBytes: 200000,
    colorTypes: [4, 6], colorMessage: 'Sprite must use 8-bit alpha color type 4 or 6'
  });
  requireValid(decoded.transparent > 0, 'Alpha header is present but all pixels are opaque');
  requireValid(decoded.visible > 0, 'Sprite contains no visible pixels');
  return decoded;
}

/** Opaque scene images need an explicit reviewed size and file budget. */
export function validateScenePng(bytes, contract) {
  requireValid(
    Number.isInteger(contract?.width) && contract.width > 0 && contract.width <= 2048 &&
      Number.isInteger(contract?.height) && contract.height > 0 && contract.height <= 2048 &&
      Number.isInteger(contract?.maxBytes) && contract.maxBytes >= 57 && contract.maxBytes <= 4000000,
    'Scene requires explicit dimensions up to 2048x2048 and a file budget up to 4000000 bytes'
  );
  const decoded = decodePng(bytes, {
    label: 'Scene', width: contract.width, height: contract.height, maxBytes: contract.maxBytes,
    colorTypes: [2, 6], colorMessage: 'Scene must use 8-bit RGB or RGBA color type 2 or 6', opaque: true
  });
  requireValid(decoded.transparent === 0 && decoded.visible === decoded.width * decoded.height, 'Scene must be fully opaque');
  return decoded;
}

/** An explicitly sized alpha atlas must keep every icon inside its own cell. */
export function validateAlphaAtlasPng(bytes, contract) {
  requireValid(
    Number.isInteger(contract?.width) && contract.width > 0 && contract.width <= 2048 &&
      Number.isInteger(contract?.height) && contract.height > 0 && contract.height <= 2048 &&
      Number.isInteger(contract?.maxBytes) && contract.maxBytes >= 57 && contract.maxBytes <= 3000000,
    'Atlas requires explicit dimensions up to 2048x2048 and a file budget up to 3000000 bytes'
  );
  requireValid(
    Number.isInteger(contract.columns) && contract.columns > 0 && contract.columns <= 8 &&
      Number.isInteger(contract.rows) && contract.rows > 0 && contract.rows <= 8 &&
      Number.isInteger(contract.margin) && contract.margin > 0 &&
      contract.margin * 2 < Math.floor(contract.width / contract.columns) &&
      contract.margin * 2 < Math.floor(contract.height / contract.rows) &&
      Number.isFinite(contract.minCellCoverage) && contract.minCellCoverage > 0 && contract.minCellCoverage <= 1,
    'Atlas requires an explicit cell grid, positive transparent margins and minimum cell coverage'
  );
  const maxMarginAlpha = contract.maxMarginAlpha ?? 0;
  const maxMarginPixels = contract.maxMarginPixels ?? 0;
  requireValid(
    Number.isInteger(maxMarginAlpha) && maxMarginAlpha >= 0 && maxMarginAlpha <= 1 &&
      Number.isInteger(maxMarginPixels) && maxMarginPixels >= 0 && maxMarginPixels <= 32 &&
      (maxMarginAlpha > 0 || maxMarginPixels === 0),
    'Atlas margin roundoff allowance must be explicit and bounded to alpha 1 at 32 pixels'
  );
  const decoded = decodePng(bytes, {
    label: 'Atlas', width: contract.width, height: contract.height, maxBytes: contract.maxBytes,
    colorTypes: [4, 6], colorMessage: 'Atlas must use 8-bit alpha color type 4 or 6'
  });
  requireValid(decoded.transparent > 0, 'Atlas must contain real transparency');
  requireValid(decoded.visible > 0, 'Atlas contains no visible pixels');
  const channels = decoded.colorType === 6 ? 4 : 2;
  const cells = [];
  let marginNoisePixels = 0;
  for (let row = 0; row < contract.rows; row++) {
    for (let column = 0; column < contract.columns; column++) {
      const left = Math.floor(column * decoded.width / contract.columns);
      const right = Math.floor((column + 1) * decoded.width / contract.columns);
      const top = Math.floor(row * decoded.height / contract.rows);
      const bottom = Math.floor((row + 1) * decoded.height / contract.rows);
      let visible = 0;
      for (let y = top; y < bottom; y++) {
        for (let x = left; x < right; x++) {
          const alpha = decoded.pixels[(y * decoded.width + x) * channels + channels - 1];
          const margin = x < left + contract.margin || x >= right - contract.margin ||
            y < top + contract.margin || y >= bottom - contract.margin;
          if (margin) {
            requireValid(alpha <= maxMarginAlpha, 'Atlas cell ' + column + ',' + row + ' has visible pixels in its transparent margin at ' + x + ',' + y);
            if (alpha > 0) {
              marginNoisePixels++;
              requireValid(marginNoisePixels <= maxMarginPixels, 'Atlas exceeds its margin roundoff budget of ' + maxMarginPixels + ' pixels');
            }
          } else if (alpha > 0) visible++;
        }
      }
      const innerArea = (right - left - contract.margin * 2) * (bottom - top - contract.margin * 2);
      requireValid(visible >= Math.ceil(innerArea * contract.minCellCoverage), 'Atlas cell ' + column + ',' + row + ' is unexpectedly blank or too sparse');
      cells.push({ column, row, visible });
    }
  }
  return { ...decoded, cells, marginNoisePixels };
}
