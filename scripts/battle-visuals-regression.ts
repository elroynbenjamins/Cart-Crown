import assert from 'node:assert/strict';
import fs from 'node:fs';
import { encounters } from '../src/game/encounters';
import { themes } from '../src/theme/themes';
import type { BossAtmosphereKind } from '../src/ui/bossPresentation';
import { bossAtmospheres, getBossAtmosphere, getBossDecor, getBossPalette, getExchangeVisuals } from '../src/ui/bossPresentation';

const expected = {
  elf_hollow_warden: 'roots', elf_ashroot_stalker: 'roots', elf_worldroot_guardian: 'roots',
  orc_stonejaw_champion: 'stonejaw', return_to_crownspire: 'ash',
  unbound_beacon: 'beacon'
};
assert.deepEqual(bossAtmospheres, expected);
for (const [id, kind] of Object.entries(bossAtmospheres)) {
  const encounter = encounters[id as keyof typeof encounters];
  assert.ok(encounter, `Missing boss: ${id}`);
  assert.equal(encounter.difficulty, 'Boss', `${id} is not a boss`);
  assert.equal(getBossAtmosphere(id, 'Boss'), kind);
  assert.equal(getBossAtmosphere(id, 'Normal'), null);
  assert.equal(getBossAtmosphere(id, 'Elite'), null);
}
for (const id of ['hold_the_road', 'elf_ashen_tracks', 'orc_stonejaw_trial', 'ashen_triumvirate', 'new_unknown_boss', '__proto__', 'constructor']) {
  assert.equal(getBossAtmosphere(id, 'Boss'), null, `Unexpected boss treatment: ${id}`);
}

function luminance(hex: string) {
  const rgb = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0]! * .2126 + rgb[1]! * .7152 + rgb[2]! * .0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0]! + .05) / (values[1]! + .05);
}

const kinds: BossAtmosphereKind[] = ['roots', 'stonejaw', 'ash', 'beacon'];
const viewports = [[248, 400], [264, 720], [288, 900], [344, 1000], [400, 700]];
let geometryChecks = 0;
for (const kind of kinds) {
  for (const compact of [false, true]) {
    const parts = getBossDecor(kind, compact);
    assert.equal(parts.length, compact ? 12 : 16);
    assert.equal(new Set(parts.map(part => part.id)).size, parts.length);
    assert.deepEqual(parts, getBossDecor(kind, compact), 'Decor must be deterministic');
    assert.ok(!compact || parts.every(part => !part.detail));
    for (const part of parts) {
      assert.ok(part.width > 0 && part.height > 0 && part.opacity > 0 && part.opacity <= 1);
      assert.ok(part.x >= 0 && part.y >= 0 && part.x + part.width <= 100 && part.y + part.height <= 100);
      for (const [width, height] of viewports) {
        const w = part.width * width! / 100, h = part.height * height! / 100;
        const angle = Math.abs(part.rotate ?? 0) * Math.PI / 180;
        const halfW = (Math.abs(w * Math.cos(angle)) + Math.abs(h * Math.sin(angle))) / 2;
        const centre = (part.x + part.width / 2) * width! / 100;
        const left = centre - halfW, right = centre + halfW;
        assert.ok(left >= 0 && right <= width!, `${kind}/${part.id} clips at ${width}x${height}`);
        assert.ok(right <= width! * .17 || left >= width! * .83, `${kind}/${part.id} crosses into the reading area`);
        geometryChecks++;
      }
    }
  }
  for (const theme of Object.values(themes)) {
    const palette = getBossPalette(kind, theme.dark);
    for (const color of Object.values(palette)) assert.match(color, /^#[0-9A-F]{6}$/);
    // Contrast applies to the unblended accent, not to atmospheric low-opacity art.
    assert.ok(contrast(palette.accent, theme.colors.surface1) >= 3, `${kind} accent too faint in ${theme.id}`);
  }
}
assert.equal(new Set(kinds.map(kind => JSON.stringify(getBossDecor(kind, false)))).size, 4);
for (const role of ['frontline', 'melee', 'ranged', 'cavalry', 'skirmish', 'support'] as const) {
  assert.equal(getExchangeVisuals(role, 12).attack, getExchangeVisuals(role, 0).attack,
    `${role} attack was replaced by healing`);
  assert.equal(getExchangeVisuals(role, 12).heal, true);
}
assert.equal(getExchangeVisuals('melee', 12).attack, 'slash');
assert.equal(getExchangeVisuals('ranged', 12).attack, 'arrow');
assert.deepEqual(getExchangeVisuals(null, 4), { attack: null, heal: true });
for (const invalid of [0, -5, NaN, Infinity]) assert.equal(getExchangeVisuals(null, invalid).heal, false);

const source = fs.readFileSync('src/ui/battleVisuals.tsx', 'utf8');
assert.ok(source.includes('getBossAtmosphere(props.encounterId, props.difficulty)'));
assert.ok(source.includes('<RegionBackdrop {...props} difficulty="Normal" />'), 'Special bosses must replace generic embers');
assert.ok(source.includes('pointerEvents="none"'));
assert.ok(source.includes('reduceMotionChanged') && source.includes('subscription.remove()'));
assert.ok(source.includes('if (mounted && !receivedEvent)'), 'Late initial motion lookup may overwrite a live change');
assert.ok(source.includes('outputRange: [0, .8, 1]'), 'VFX must disappear when exchange progress returns to zero');
assert.ok(!/Animated\.(loop|timing|spring)|setInterval\(|setTimeout\(/.test(source), 'Presentation must not add animation clocks');
console.log(`PASS: 6 explicit bosses, 4 distinct treatments, ${geometryChecks} rotated-geometry checks, 3 themes, and independent healing/attack feedback.`);
