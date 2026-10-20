import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('app.json', 'utf8')).expo;
const approved = './assets/branding/approved-three-faction-logo.png';
const bytes = readFileSync(approved);
assert.equal(config.icon, approved, 'Main launcher must use the user-approved emblem');
assert.equal(config.android.adaptiveIcon.foregroundImage, approved,
  'Adaptive launcher must use the same three-faction emblem, not the older wagon-only image');
assert.equal(config.android.adaptiveIcon.backgroundColor.toLowerCase(), '#0b182a');
assert.equal(config.android.adaptiveIcon.monochromeImage, undefined,
  'Do not show an outdated wagon-only icon when the Android themed icon is selected');
assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Approved emblem must be PNG');
assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR');
assert.equal(bytes.readUInt32BE(16), 1254, 'Reviewed emblem must retain its original width');
assert.equal(bytes.readUInt32BE(20), 1254, 'Reviewed emblem must retain its original height');
assert.equal(bytes[24], 8, 'Approved emblem must use 8-bit color');
assert.ok(bytes.length < 3000000, 'Approved emblem exceeds reasonable source-image budget');
assert.equal(config.android.package, 'com.elroybenjamins.cartcrown', 'Android package must remain unchanged');

const sigil = readFileSync('src/ui/OfficialFactionSigil.tsx', 'utf8');
const gameArt = readFileSync('src/ui/gameArt.tsx', 'utf8');
const save = readFileSync('src/screens/SaveSelectScreen.tsx', 'utf8');
for (const [faction, emblem, flag] of [
  ['orc', 'boar', 'red'], ['elf', 'stag', 'green'], ['human', 'fleur-de-lis', 'blue']
]) {
  assert.ok(sigil.includes(faction + ": { emblem: '" + emblem + "', flag: '" + flag + "'"),
    'In-game ' + faction + ' emblem must match the approved ' + flag + ' banner');
  assert.ok(sigil.includes("testID={'faction-official-sigil-' + faction}"),
    'Official sigils should have stable accessible identifiers');
}
assert.ok(sigil.includes("require('../../assets/branding/approved-three-faction-logo.png')"),
  'Official faction sigils must reuse the approved image, not independent sketches');
assert.ok(gameArt.includes('<OfficialFactionSigil faction={faction} size={size} />'),
  'All normal faction crests should display the approved standard');
assert.ok(save.includes('testID="official-three-realm-loading-logo"') &&
  save.includes('testID="official-three-realm-save-logo"') &&
  save.includes('Official faction banners: Human fleur-de-lis, Elf stag, Orc boar'),
  'Loading, save selection and available factions must use the exact three-realm branding');
console.log('PASS: user-approved Cart & Crown emblem, matching in-game Human/Elf/Orc standards, and Android package.');
