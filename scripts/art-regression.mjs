import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const spriteRoots = [
  path.join(root, 'assets/game/units'),
  path.join(root, 'assets/game/enemies')
];
const registryPath = path.join(root, 'src/ui/productionAssets.ts');
const failures = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function pngInfo(file) {
  const bytes = fs.readFileSync(file);
  const signature = bytes.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    return { valid: false, bytes };
  }
  return {
    valid: true,
    bytes,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25]
  };
}

const sprites = spriteRoots
  .flatMap(walk)
  .filter(file => file.toLowerCase().endsWith('.png'))
  .sort();

const hashes = new Map();

for (const file of sprites) {
  const rel = relative(file);
  const info = pngInfo(file);
  if (!info.valid) {
    failures.push(rel + ' is not a valid PNG.');
    continue;
  }
  if (info.width !== 256 || info.height !== 256) {
    failures.push(rel + ' must be 256x256, got ' + info.width + 'x' + info.height + '.');
  }
  if (![4, 6].includes(info.colorType)) {
    failures.push(rel + ' must preserve transparency (PNG color type 4 or 6).');
  }
  if (info.bytes.length < 180) {
    failures.push(rel + ' is suspiciously small (' + info.bytes.length + ' bytes).');
  }
  if (info.bytes.length > 200000) {
    failures.push(rel + ' is too large for a combat sprite (' + info.bytes.length + ' bytes).');
  }

  const hash = crypto.createHash('sha256').update(info.bytes).digest('hex');
  const matches = hashes.get(hash) ?? [];
  matches.push(rel);
  hashes.set(hash, matches);
}

for (const matches of hashes.values()) {
  if (matches.length > 1) {
    failures.push('Exact duplicate production sprites: ' + matches.join(' | '));
  }
}

const registry = fs.readFileSync(registryPath, 'utf8');
const registered = new Set(
  [...registry.matchAll(/require\('\.\.\/\.\.\/(assets\/game\/(?:units|enemies)\/[^']+\.png)'\)/g)]
    .map(match => match[1])
);

const spritePaths = new Set(sprites.map(relative));

for (const sprite of spritePaths) {
  if (!registered.has(sprite)) {
    failures.push(sprite + ' exists but is not registered in productionAssetSources.');
  }
}

for (const sprite of registered) {
  if (!spritePaths.has(sprite)) {
    failures.push(sprite + ' is registered but the file does not exist.');
  }
}

if (failures.length > 0) {
  console.error('\nART REGRESSION FAILED');
  failures.forEach(failure => console.error('- ' + failure));
  process.exit(1);
}

console.log(
  'PASS: ' +
    sprites.length +
    ' production unit/enemy sprites are 256x256 transparent PNGs, uniquely rendered, size-safe and registered.'
);
