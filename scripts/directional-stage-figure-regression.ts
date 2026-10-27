import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Evaluate the real TSX with tiny native stubs. These assertions test the
// runtime fallback behavior without claiming that generated art is approved.
const source = fs.readFileSync('src/ui/portraitBattle/DirectionalStageFigure.tsx', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: {
  jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS, esModuleInterop: true
} }).outputText;

let failedId: string | null = null;
let loadedId: string | null = null;
let stateIndex = 0;
let lookups: string[] = [];
const registered = 'battle_directional.human.shield_infantry_ally_back';
const sourceImage = { uri: 'static-fixture.png' };
const react: any = {
  __esModule: true,
  Fragment: 'Fragment',
  createElement: (type: any, props: any, ...children: any[]) =>
    ({ type, props: { ...props, children } }),
  memo: (component: any) => component,
  useState: (_initial: any) => {
    const slot = stateIndex++;
    return slot === 0
      ? [failedId, (next: string | null) => { failedId = next; }]
      : [loadedId, (next: string | null) => { loadedId = next; }];
  }
};
react.default = react;
const moduleStub: any = { exports: {} };
new Function('require', 'module', 'exports', js)((id: string) => {
  if (id === 'react') return react;
  if (id === 'react-native') return { View: 'View', Image: 'Image' };
  if (id === '../productionAssets') return {
    getProductionAssetSource: (key: string) => {
      lookups.push(key);
      return key === registered ? sourceImage : null;
    }
  };
  throw new Error('Unexpected dependency ' + id);
}, moduleStub, moduleStub.exports);

const Figure = moduleStub.exports.DirectionalStageFigure;
const fallback = react.createElement('ApprovedOldSprite', { size: 42 });
function show(assetId: string | null, size = 42) {
  stateIndex = 0;
  return Figure({ assetId, size, fallback });
}

let result = show(null);
assert.equal(result.type, 'Fragment', 'Missing pilot asset must retain approved art');
assert.equal(result.props.children[0], fallback);
result = show('battle_directional.human.field_medic_ally_back');
assert.equal(result.type, 'Fragment', 'Unregistered pilot class must retain approved art');
result = show(registered);
assert.equal(result.type, 'View');
assert.equal(result.props.pointerEvents, 'none', 'Battle art must not intercept taps');
assert.equal(result.props.testID, 'directional-stage-' + registered);
assert.equal(result.props.style.width, 42);
assert.equal(result.props.style.height, 42);
assert.equal(result.props.children[0], fallback,
  'Approved actor art must remain visible until directional image onLoad');
const renderedImage = result.props.children[1];
assert.equal(renderedImage.type, 'Image');
assert.equal(renderedImage.props.source, sourceImage);
assert.equal(renderedImage.props.resizeMode, 'contain', 'Do not crop directional lances, bows or hooves');
assert.equal(renderedImage.props.fadeDuration, 0, 'Avoid transient fades that obscure facing');
assert.equal(renderedImage.props.style.opacity, 0,
  'An unready PNG must not replace the original character with an empty texture');
renderedImage.props.onLoad();
result = show(registered);
assert.equal(result.props.children[0], null,
  'Approved fallback must be hidden only after the replacement has decoded');
assert.equal(result.props.children[1].props.style.opacity, 1);
assert.equal(show('battle_directional.human.field_medic_ally_back').type, 'Fragment',
  'An alternate unregistered asset must not display the previously loaded pose');
result.props.children[1].props.onError();
assert.equal(show(registered).type, 'Fragment', 'A missing/corrupt asset must fall back immediately');
assert.ok(lookups.includes(registered));
assert.ok(!/setInterval|setTimeout|Animated\.loop/.test(source),
  'Directional sprites must not add animation clocks');
assert.ok(!source.includes('getProductionAssetSource(\x27battle_portrait'),
  'Keep portrait rails and battle stage art separate');
console.log('PASS: stage-only directional art, loaded-only swap, decoder fallback, tap safety and registration gating.');
