import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('app.json', 'utf8')).expo;
const assets = [
  { path: './assets/branding/icon.png', transparent: false },
  { path: './assets/branding/adaptive-foreground.png', transparent: true },
  { path: './assets/branding/adaptive-monochrome.png', transparent: true }
];
assert.equal(config.icon, assets[0].path);
assert.equal(config.android.adaptiveIcon.foregroundImage, assets[1].path);
assert.equal(config.android.adaptiveIcon.monochromeImage, assets[2].path);
assert.equal(config.android.adaptiveIcon.backgroundColor.toLowerCase(), '#0b182a');
for (const asset of assets) {
  const png = readFileSync(asset.path);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Missing PNG signature: ' + asset.path);
  assert.equal(png.readUInt32BE(16), 1024, 'Icon width must meet Play export size: ' + asset.path);
  assert.equal(png.readUInt32BE(20), 1024, 'Icon height must meet Play export size: ' + asset.path);
  assert.equal(png[24], 8, 'Icons must use 8-bit color: ' + asset.path);
  assert.equal(png[25], 6, 'Icons must use an RGBA-safe PNG format: ' + asset.path);
  assert.ok(png.byteLength < 600000, 'Oversized pixel launcher art: ' + asset.path);
}
assert.ok(config.android.package === 'com.elroybenjamins.cartcrown',
  'Launcher graphics must not change production Android package identity.');
console.log('Cart & Crown branded launcher PNGs, adaptive layers and Android package verified.');
