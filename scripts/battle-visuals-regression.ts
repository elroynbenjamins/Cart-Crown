import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getExchangeVisuals } from '../src/ui/battleExchangePresentation';

const expected = {
  frontline: 'slash', melee: 'slash', ranged: 'arrow', cavalry: 'charge',
  skirmish: 'skirmish', support: 'ward'
} as const;
let cases = 0;
for (const role of Object.keys(expected) as Array<keyof typeof expected>) {
  for (const healed of [0, 1, 12, 999, -5, NaN, Infinity, -Infinity]) {
    const result = getExchangeVisuals(role, healed);
    assert.equal(result.attack, expected[role], `${role} attack replaced when healing=${healed}`);
    assert.equal(result.heal, Number.isFinite(healed) && healed > 0);
    cases++;
  }
}
assert.deepEqual(getExchangeVisuals(null, 4), { attack: null, heal: true });
assert.deepEqual(getExchangeVisuals(null, 0), { attack: null, heal: false });
assert.deepEqual(getExchangeVisuals(null, Infinity), { attack: null, heal: false });

const source = fs.readFileSync('src/ui/BattleExchangeVfx.tsx', 'utf8');
assert.ok(source.includes('pointerEvents="none"'));
assert.ok(source.includes('importantForAccessibility="no-hide-descendants"'));
assert.ok(source.includes('reduceMotionChanged') && source.includes('subscription.remove()'));
assert.ok(source.includes('if (mounted && !receivedEvent)'), 'Late initial motion lookup may overwrite a live event');
assert.ok(source.includes('outputRange: [0, .8, 1]'), 'VFX must vanish when exchange progress returns to zero');
assert.ok(source.includes("extrapolate: 'clamp'"));
assert.ok(source.includes('{visual.heal ? ('), 'Healing needs an independent visual channel');
assert.ok(!/Animated\.(loop|timing|spring)|setInterval\(|setTimeout\(/.test(source), 'Exchange VFX must not add animation clocks');
const facade = fs.readFileSync('src/ui/battleVisuals.tsx', 'utf8');
assert.ok(facade.includes("export { BattleVfxStrip } from './BattleExchangeVfx'"), 'BattleScreen must receive corrected effects');
assert.ok(facade.includes('BossBattlefieldDetails') && facade.includes('getBossPresentation'), 'Keep the merged signature boss implementation');
console.log(`PASS: ${cases + 3} exchange-visual cases, independent healing, zero-at-rest VFX, reduced-motion guards and signature-boss integration.`);
