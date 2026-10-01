import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { encounters, type EncounterId } from '../src/game/encounters';
import { themes } from '../src/theme/themes';
import { formationShapes } from '../src/game/formation';
import { hasGreenkeepScenery, roadSceneryLayout } from '../src/ui/portraitBattle/scenery';
import { stageTokens } from '../src/ui/portraitBattle/model';

let checks = 0;
const expected = ['hold_the_road', 'mercenary_patrol', 'ch2_defend_camp', 'ch2_beyond_fires', 'ch2_brace', 'ch2_take_watch'];
for (const [id, encounter] of Object.entries(encounters)) {
  assert.equal(hasGreenkeepScenery(id as EncounterId, 'human', encounter.difficulty), expected.includes(id)); checks++;
  for (const faction of ['elf', 'orc'] as const) {
    assert.equal(hasGreenkeepScenery(id as EncounterId, faction, encounter.difficulty), false); checks++;
  }
  assert.equal(hasGreenkeepScenery(id as EncounterId, 'human', 'Boss'), false); checks++;
  for (const threat of ['magic', 'flying', 'large', 'hybrid'] as const) {
    assert.equal(hasGreenkeepScenery(id as EncounterId, 'human', 'Normal', threat), false); checks++;
  }
}
for (const width of [220, 300, 340, 392, 460, 748, 1180, NaN, Infinity, -100]) {
  for (const height of [160, 264, 320, 440, 580, NaN, Infinity, -100]) {
    const layout = roadSceneryLayout(width, height);
    assert.ok(layout.tiles.length >= 1 && layout.tiles.length <= 11);
    assert.ok(Number.isFinite(layout.width) && Number.isFinite(layout.height));
    assert.ok(Math.abs(layout.tileHeight / layout.width - 57 / 240) < 1e-10, 'Do not vertically stretch the floor texture');
    assert.equal(layout.tiles[0]!.y, layout.horizonHeight);
    const last = layout.tiles.at(-1)!;
    assert.ok(last.y < layout.height && last.y + layout.tileHeight >= layout.height);
    for (let i = 1; i < layout.tiles.length; i++) {
      assert.ok(Math.abs(layout.tiles[i]!.y - (layout.tiles[i - 1]!.y + layout.tileHeight)) < 1e-8);
    }
    assert.deepEqual(layout, roadSceneryLayout(width, height)); checks += 6;
  }
}
// Opposing armies as well as adjacent ranks must remain separated at animation peaks.
for (const width of [220, 300, 340, 392, 748]) for (const height of [264, 320, 440, 580]) {
  for (const ally of formationShapes) for (const enemy of formationShapes) {
    const all = [...stageTokens(ally, [0,1,2,3,4,5,6,7,8], 'ally', width, height),
      ...stageTokens(enemy, [0,1,2,3,4,5,6,7,8], 'enemy', width, height)];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const a = all[i]!, b = all[j]!;
      const halfA = a.size * (a.size <= 32 ? 1.12 : 1) / 2;
      const halfB = b.size * (b.size <= 32 ? 1.12 : 1) / 2;
      assert.ok(Math.abs(a.x - b.x) >= halfA + halfB || Math.abs(a.y - b.y) >= halfA + halfB + 4,
        `Overlapping actors for ${ally.id}/${enemy.id} at ${width}x${height}`); checks++;
    }
  }
}
assert.ok(stageTokens(formationShapes[0]!, [0], 'ally', 340, 264)[0]!.size > 28, 'Improve compact figures');
assert.ok(stageTokens(formationShapes[0]!, [0], 'ally', 392, 518)[0]!.size > 59, 'Improve regular figures');

// Run the actual scenery component with host stubs, not a duplicate rendering model.
let failed = false, assetAvailable = true;
const appearance = { theme: themes.dark };
const react: any = { __esModule: true, Fragment: 'Fragment', memo: (fn: any) => fn,
  useState: () => [failed, (value: boolean) => { failed = value; }],
  createElement: (type: any, props: any, ...children: any[]) => ({ type, props: { ...props, children } }) };
react.default = react;
const source = readFileSync('src/ui/portraitBattle/IllustratedBattlefieldBackdrop.tsx', 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
const mod = { exports: {} as any };
new Function('require', 'module', 'exports', output)((name: string) => {
  if (name === 'react') return react;
  if (name === 'react-native') return { View: 'View', StyleSheet: { create: (x: any) => x } };
  if (name === './scenery') return { hasGreenkeepScenery, roadSceneryLayout };
  if (name === './Art') return { ReferenceArt: 'ReferenceArt' };
  if (name.endsWith('ThemeProvider')) return { useGameTheme: () => appearance };
  if (name.endsWith('battleVisuals')) return { BattlefieldBackdrop: 'BaseBackdrop' };
  if (name.endsWith('productionAssets')) return { getProductionAssetSource: () => assetAvailable ? 1 : null };
  throw new Error(name);
}, mod, mod.exports);
function nodes(t: any): any[] { return Array.isArray(t) ? t.flatMap(nodes) : t?.props ? [t, ...nodes(t.props.children)] : []; }
const props = { encounterId: 'hold_the_road', faction: 'human', difficulty: 'Normal', compact: true, width: 340, height: 264 };
for (const theme of Object.values(themes)) {
  appearance.theme = theme;
  failed = false; assetAvailable = true;
  let tree = nodes(mod.exports.IllustratedBattlefieldBackdrop(props));
  const layer = tree.find(n => n.props.testID === 'greenkeep-illustrated-battlefield');
  assert.ok(layer && layer.props.pointerEvents === 'none');
  assert.equal(layer.props.importantForAccessibility, 'no-hide-descendants');
  assert.ok(tree.some(n => n.type === 'BaseBackdrop'), 'Keep the original scenery under the art');
  const images = tree.filter(n => n.type === 'ReferenceArt');
  assert.ok(images.length >= 2 && images.length <= 12);
  assert.equal(new Set(images.map(n => n.props.art)).size, 2, 'Only two cached image sources');
  images[0]!.props.onError();
  tree = nodes(mod.exports.IllustratedBattlefieldBackdrop(props));
  assert.equal(tree.filter(n => n.type === 'ReferenceArt').length, 0, 'Failed scene must reveal existing backdrop');
  assert.ok(tree.some(n => n.type === 'BaseBackdrop')); checks += 7;
}
failed = false; assetAvailable = false;
assert.equal(nodes(mod.exports.IllustratedBattlefieldBackdrop(props)).filter(n => n.type === 'ReferenceArt').length, 0);
assetAvailable = true;
for (const overrides of [{ faction: 'elf' }, { difficulty: 'Boss' }, { fantasyThreat: 'magic' }, { encounterId: 'iron_road_skirmish' }]) {
  assert.equal(nodes(mod.exports.IllustratedBattlefieldBackdrop({ ...props, ...overrides })).filter(n => n.type === 'ReferenceArt').length, 0);
}
assert.ok(!/Animated\.(loop|timing|spring)|setInterval\(|setTimeout\(/.test(source));
const view = readFileSync('src/ui/portraitBattle/PortraitBattleView.tsx', 'utf8');
assert.ok(view.includes('<IllustratedBattlefieldBackdrop') && view.includes('fantasyThreat={p.fantasyThreat}'));
assert.ok(view.includes('Lv. {card.level}'), 'Show real allied levels rather than concept health values');
assert.ok(view.includes('height: 10, borderWidth: 1.5, borderRadius: 99'), 'Selected squads should use ground rings');
console.log(`PASS: ${checks} scenery gating, bounded textures, opposing-formation clearances, actual component fallbacks and theme checks.`);
