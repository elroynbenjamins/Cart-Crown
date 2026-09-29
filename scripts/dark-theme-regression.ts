import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { DEFAULT_THEME_ID, themes, type GameTheme } from '../src/theme/themes';
import { getBattlefieldSurfaces } from '../src/theme/battlefieldSurfaces';
import { semanticPalettes } from '../src/ui/semanticColors';
import { encounters } from '../src/game/encounters';

// Color/model and real-component element tests, not a substitute for native screenshots.
let assertions = 0;
function check(value: unknown, message: string) { assert.ok(value, message); assertions++; }
function rgb(hex: string) {
  assert.match(hex, /^#[\dA-F]{6}$/i);
  return [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
}
function neutral(hex: string) { const [r, g, b] = rgb(hex); return r === g && g === b; }
function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map(value => {
    const s = value / 255;
    return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
  });
  return r! * .2126 + g! * .7152 + b! * .0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
assert.equal(DEFAULT_THEME_ID, 'dark');
assert.equal(themes.dark.colors.appBg, '#000000');
assert.deepEqual(Object.keys(themes), ['original', 'dark', 'light']);
for (const theme of [themes.original, themes.dark]) {
  const structural = ['appBg', 'surface1', 'surface2', 'surface3', 'border', 'text', 'textMuted'] as const;
  for (const token of structural) check(neutral(theme.colors[token]), `${theme.id}.${token} regained a color cast`);
  const levels = ['appBg', 'surface1', 'surface2', 'surface3', 'border'] as const;
  levels.slice(1).forEach((token, i) => check(luminance(theme.colors[token]) > luminance(theme.colors[levels[i]!]), 'Surface levels must stay distinguishable'));
  for (const token of ['appBg', 'surface1', 'surface2', 'surface3'] as const) {
    check(contrast(theme.colors.text, theme.colors[token]) >= 7, `${theme.id}: primary text on ${token}`);
    check(contrast(theme.colors.textMuted, theme.colors[token]) >= 4.5, `${theme.id}: secondary text on ${token}`);
  }
  for (const color of Object.values(semanticPalettes.dark)) {
    check(contrast(color, theme.colors.surface2) >= 4.5, `${theme.id}: semantic text must remain readable`);
  }
  check(theme.colors.info !== theme.colors.danger && theme.colors.primary !== theme.colors.gold, 'Preserve semantic accents');
}
check(neutral(semanticPalettes.dark.neutral), 'Neutral chips must not reintroduce blue-grey text');
for (const theme of Object.values(themes)) check(contrast(theme.colors.onPrimary, theme.colors.primary) >= 4.5, `${theme.id}: filled-button label contrast`);
assert.equal(themes.light.colors.appBg, '#F3EFE6');
assert.equal(themes.light.colors.surface1, '#FFFFFF');

// Render the actual components against small host stubs; inspect their real styles.
type Element = { type: string | Function; props: Record<string, any> };
const appearance: { theme: GameTheme } = { theme: themes.dark };
const react: any = {
  __esModule: true, Fragment: 'Fragment',
  createElement: (type: Element['type'], props: any, ...children: any[]) => ({ type, props: { ...props, children } }),
  useRef: (value: any) => ({ current: value }),
  useCallback: (callback: any) => callback
};
react.default = react;
function load(file: string) {
  const source = readFileSync(file, 'utf8');
  const output = ts.transpileModule(source, { fileName: file, compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.React, esModuleInterop: true
  } }).outputText;
  const module = { exports: {} as any };
  const requireStub = (name: string): any => {
    if (name === 'react') return react;
    if (name === 'react-native') return { View: 'View', Text: 'Text', Pressable: 'Pressable',
      Animated: { View: 'Animated.View' }, StyleSheet: { create: (value: any) => value } };
    if (name.endsWith('/ThemeProvider')) return { useGameTheme: () => appearance };
    if (name.endsWith('/battlefieldSurfaces')) return { getBattlefieldSurfaces };
    if (name === './gameArt') return { ResourceSprite: 'ResourceSprite', UnitSprite: 'UnitSprite' };
    if (name.endsWith('/mobileSession')) return { shouldAcceptActionPress: () => true };
    throw new Error('Unexpected test dependency: ' + name);
  };
  new Function('require', 'module', 'exports', output)(requireStub, module, module.exports);
  return module.exports;
}
function elements(tree: any): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(elements);
  return tree?.props ? [tree, ...elements(tree.props.children)] : [];
}
function style(value: any): Record<string, any> { return Object.assign({}, ...(Array.isArray(value) ? value.flat(Infinity).filter(Boolean) : [value])); }
const components = load(resolve('src/ui/components.tsx'));
const battle = load(resolve('src/ui/battleVisualsBase.tsx'));
for (const theme of Object.values(themes)) {
  appearance.theme = theme;
  for (const faction of ['human', 'elf', 'orc']) {
    const atmosphere = components.ScreenAtmosphere({ faction, section: 'flow' });
    check(theme.dark ? atmosphere === null : atmosphere !== null, 'Colored screen washes must be absent only in dark modes');
    for (const id of Object.keys(encounters)) {
      const region = battle.getBattlefieldScene(id, faction);
      const snapshot = JSON.stringify(region);
      const palette = getBattlefieldSurfaces(theme, region);
      check(theme.dark ? Object.values(palette).every(neutral) : palette.sky === region.sky && palette.ground === region.ground, 'Battlefield fill palette');
      check(JSON.stringify(region) === snapshot, 'Never mutate shared regional definitions');
      const rendered = battle.BattlefieldBackdrop({ encounterId: id, faction, difficulty: 'Normal', compact: false });
      const fills = elements(rendered).filter(node => style(node.props.style).backgroundColor).slice(0, 3);
      check(fills.length === 3, 'Backdrop must retain sky, horizon and ground');
      check(fills.every((node, index) => style(node.props.style).backgroundColor === [palette.sky, palette.horizon, palette.ground][index]), 'Rendered fills must use the resolved palette');
    }
  }
  for (const stage of ['prep', 'battle', 'results']) {
    check(components.FlowProgress({ stage, faction: 'human' }) !== null, 'Changing background must not remove flow navigation');
  }
  for (const disabled of [false, true]) {
    const button = components.PrimaryButton({ label: 'View Results', disabled });
    const label = elements(button).find(node => node.type === 'Text')!;
    check(style(label.props.style).color === (disabled ? theme.colors.textMuted : theme.colors.onPrimary), 'Real button must use its contrasted foreground');
  }
}
const provider = readFileSync('src/theme/ThemeProvider.tsx', 'utf8');
check(provider.includes('useState<ThemeId>(DEFAULT_THEME_ID)'), 'App must start in Pure Black');
check(readFileSync('.github/workflows/android-native.yml', 'utf8').includes("'src/theme/**'"), 'Theme edits must trigger native validation');
console.log(`PASS: ${assertions} neutral-surface, contrast, regional-scene and real-component theme assertions.`);
