import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import type { UnitDefinition } from '../src/game/types';
import { humanBattleArtClasses, humanClassPortrait } from '../src/ui/portraitBattle/humanBattleArt';
import { allyPortrait, enemyPortrait, figureForPortrait } from '../src/ui/portraitBattle/model';

const manifest = JSON.parse(readFileSync('assets/game/battle_portraits/human_v1/manifest.json', 'utf8'));
const registry = readFileSync('src/ui/productionAssets.ts', 'utf8');
const registrations = new Map([...registry.matchAll(/'([^']+)': require\('\.\.\/\.\.\/([^']+)'\)/g)]
  .map(match => [match[1]!, match[2]!]));
assert.equal(humanBattleArtClasses.length, 12);
assert.equal(new Set(humanBattleArtClasses.map(entry => entry.slug)).size, 12);
assert.equal(Object.keys(manifest.assets).length, 24);
const allHashes = new Set<string>();
let mappings = 0;
for (const entry of humanBattleArtClasses) {
  const unit: UnitDefinition = { id: entry.slug, name: 'Class portrait fixture', className: entry.className,
    faction: 'human', role: entry.role, tier: 3, level: 5, hp: 100, attack: 10, armor: 5, speed: 5 };
  const portrait = humanClassPortrait(unit);
  assert.equal(portrait, `human_${entry.slug}_portrait`);
  assert.equal(allyPortrait(unit), portrait, 'The live portrait model must select the exact class before generic role art');
  assert.equal(humanClassPortrait({ ...unit, className: ` ${entry.className.toUpperCase()} ` }), portrait);
  assert.equal(figureForPortrait(portrait!), `human_${entry.slug}_unit`);
  for (const faction of ['elf', 'orc'] as const) {
    assert.equal(humanClassPortrait({ ...unit, faction }), null);
    assert.equal(allyPortrait({ ...unit, faction }), null);
  }
  for (const battleTags of [['magic'], ['flying'], ['large'], ['construct'], ['beast']] as UnitDefinition['battleTags'][]) {
    assert.equal(humanClassPortrait({ ...unit, battleTags }), null);
    assert.equal(allyPortrait({ ...unit, battleTags }), null);
  }
  assert.equal(humanClassPortrait({ ...unit, className: entry.className + ' Impostor' }), null);
  for (const role of ['frontline', 'melee', 'ranged', 'support', 'cavalry', 'skirmish'] as const) {
    if (role !== entry.role) assert.equal(humanClassPortrait({ ...unit, role }), null);
  }
  for (const kind of ['portrait', 'unit'] as const) {
    const spec = manifest.assets[`${entry.slug}_${kind}`];
    assert.equal(registrations.get(`battle_portrait.human_${entry.slug}_${kind}`), spec.path);
    const bytes = readFileSync(spec.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), spec.sha256, 'Asset differs from reviewed export');
    assert.equal(bytes.readUInt32BE(16), 256);
    assert.equal(bytes.readUInt32BE(20), 256);
    assert.equal(bytes[25], 6, 'Keep RGBA alpha, not a black-backed JPEG');
    assert.ok(bytes.length < 200000 && bytes.length > 1000);
    assert.ok(!allHashes.has(spec.sha256), 'Accidental duplicate generated class image');
    allHashes.add(spec.sha256);
    const [x0, y0, x1, y1] = spec.visible_bounds as number[];
    const inset = kind === 'portrait' ? 8 : 12;
    assert.ok(x0! >= inset && y0! >= inset && x1! <= 256 - inset && y1! <= 256 - inset,
      `${entry.slug}: keep weapons/mount inside safe source margins`);
    if (kind === 'unit') assert.equal(registrations.get(`unit.human.${entry.slug}`), spec.path,
      'Army/Formation and battle must share one physical unit image');
  }
  mappings++;
}
for (const [className, role] of [['Militia','frontline'], ['Recruit','melee'], ['Mounted Archer','cavalry'],
  ['Siege Engineer','support'], ['Griffin Rider','cavalry'], ['Archer','ranged']] as const) {
  assert.equal(humanClassPortrait({ className, role, faction: 'human' }), null, 'Uncovered classes retain existing art');
}
assert.equal(enemyPortrait('frontline', 'raider_pack', 'Raider', false), 'raider_portrait');
for (const family of ['magic', 'flying', 'large', 'hybrid'] as const) {
  assert.equal(enemyPortrait('frontline', 'elite_command', 'Enemy', false, family), null);
}

// Render the real art frame with deterministic host mocks, including onError.
const source = readFileSync('src/ui/portraitBattle/Art.tsx', 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
let failure: string | null = null;
let available = true;
const react: any = { __esModule: true, memo: (fn: any) => fn,
  createElement: (type: any, props: any, ...children: any[]) => ({ type, props: { ...props, children } }),
  useState: () => [failure, (next: string) => { failure = next; }] };
react.default = react;
const loaded = { exports: {} as any };
new Function('require', 'module', 'exports', output)((name: string) => {
  if (name === 'react') return react;
  if (name === 'react-native') return { Image: 'Image', View: 'View' };
  if (name.endsWith('productionAssets')) return { getProductionAssetSource: (key: string) =>
    available && registrations.has(key) ? key : null };
  throw new Error('Unexpected renderer import: ' + name);
}, loaded, loaded.exports);
function images(node: any): any[] {
  return Array.isArray(node) ? node.flatMap(images) : node?.props
    ? [...(node.type === 'Image' ? [node] : []), ...images(node.props.children)] : [];
}
let frames = 0;
for (const entry of humanBattleArtClasses) for (const kind of ['portrait', 'unit'] as const) {
  for (const size of [28, 40, 48, 56, 96, 128]) {
    failure = null; available = true;
    const art = `human_${entry.slug}_${kind}`;
    const props = { art, width: size, fallback: 'existing-unit-fallback' };
    const tree = loaded.exports.ReferenceArt(props), actual = images(tree);
    assert.equal(actual.length, 1, 'One cached image per frame, not a layered sprite sheet');
    assert.equal(actual[0].props.source, `battle_portrait.${art}`);
    assert.equal(actual[0].props.fadeDuration, 0);
    assert.equal(actual[0].props.style.width, kind === 'portrait' ? 256 * size / 240 : size);
    assert.equal(tree.props.style.width, size);
    assert.equal(tree.props.style.height, size);
    assert.equal(tree.props.style.overflow, 'hidden');
    actual[0].props.onError();
    assert.equal(images(loaded.exports.ReferenceArt(props)).length, 0, 'A decoding error must render the existing fallback');
    failure = null; available = false;
    assert.equal(images(loaded.exports.ReferenceArt(props)).length, 0, 'A missing registration must render the existing fallback');
    frames++;
  }
}
console.log(`PASS: ${mappings} exact Human class mappings, 24 checksummed PNGs/shared figure sources, ${frames} rendered art frames, faction/fantasy exclusions and decode fallbacks.`);
