import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { encounters } from '../src/game/encounters';
import { bossSignatureByEncounter, getBossPresentation } from '../src/ui/bossPresentation';

// Render the real component without native runtime; visual screenshots remain a device QA gate.
const source = readFileSync('src/ui/BossStageSilhouette.tsx', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: {
  jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS, esModuleInterop: true
} }).outputText;
const react: any = {
  __esModule: true,
  createElement: (type: any, props: any, ...children: any[]) => ({ type, props: { ...props, children } }),
  memo: (component: any) => component
};
react.default = react;
const module: any = { exports: {} };
new Function('require', 'module', 'exports', js)((id: string) => {
  if (id === 'react') return react;
  if (id === 'react-native') return { View: 'View', StyleSheet: { create: (styles: any) => styles } };
  throw new Error('Unexpected dependency: ' + id);
}, module, module.exports);
const { bossStagePieces, BossStageSilhouette } = module.exports;
let checked = 0;
const shapes = new Set<string>();
for (const [id, signature] of Object.entries(bossSignatureByEncounter)) {
  const encounter = encounters[id as keyof typeof encounters];
  assert.ok(encounter && encounter.difficulty === 'Boss', 'Only real boss encounters may have signatures');
  const presentation = getBossPresentation(id as keyof typeof encounters, 'Boss', true, false)!;
  assert.equal(presentation.signature, signature);
  const pieces = bossStagePieces(signature);
  assert.ok(pieces.length >= 3 && pieces.length <= 5, 'Keep overlays compact');
  shapes.add(JSON.stringify(pieces));
  for (const p of pieces) {
    assert.ok([p.x,p.y,p.width,p.height,p.rotate ?? 0].every(Number.isFinite), 'All silhouette geometry must be finite');
    assert.ok(p.x >= 0 && p.y >= 0 && p.width > 0 && p.height > 0, 'Positive geometry');
    assert.ok(p.x + p.width <= 100 && p.y + p.height <= 100, 'Fit on the silhouette canvas');
    assert.ok(['plate','spike','staff','banner','ring'].includes(p.shape));
    checked++;
  }
  for (const size of [24, 42, 64, 96]) {
    const tree = BossStageSilhouette({ signature, size, material: presentation.material, light: presentation.light });
    assert.equal(tree.props.style[1].width, size,
      'Boss decoration cannot stretch beyond the authored actor slot and obscure neighbors');
    assert.equal(tree.props.style[1].height, size,
      'Boss decorative height must not overlap a neighboring enemy rank');
    assert.equal(tree.props.testID, 'boss-stage-silhouette-' + signature);
    assert.equal(tree.props.pointerEvents, 'none');
    assert.equal(tree.props.importantForAccessibility, 'no-hide-descendants');
    assert.equal(tree.props.children.length, 1);
    assert.equal(tree.props.children[0].length, pieces.length);
    checked++;
  }
}
assert.equal(shapes.size, Object.keys(bossSignatureByEncounter).length,
  'Every mapped boss needs distinct actual silhouette geometry');
assert.ok(!/Animated\.|setTimeout\(|setInterval\(/.test(source), 'Silhouettes must be entirely static');
const battleSource = readFileSync('src/ui/portraitBattle/PortraitBattleView.tsx', 'utf8');
assert.ok(battleSource.includes('getBossPresentation(p.encounterId, p.difficulty') &&
  battleSource.includes('item.boss && !item.down && signatureBoss') &&
  battleSource.includes('<BossStageSilhouette') &&
  battleSource.includes('enemyFigure(item, item.boss'),
  'Only living genuine boss actors get the silhouette; keep the established sprite');
console.log(`PASS: ${checked} bounded static silhouette and named-encounter checks across all signature bosses.`);
