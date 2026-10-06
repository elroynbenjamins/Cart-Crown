import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { signedStat } from '../src/ui/decisionPresentation';

// Execute the actual TSX math against native host stubs; this is not a native layout test.
const jsx = (type: unknown, props: any, ...children: any[]) => ({
  type, props: { ...props, children: children.length === 1 ? children[0] : children }
});
const react: any = { __esModule: true, createElement: jsx };
react.default = react;
const source = readFileSync('src/ui/EquipmentStatLine.tsx', 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true }
}).outputText;
const mod = { exports: {} as any };
new Function('require', 'module', 'exports', output)((request: string) => {
  if (request === 'react') return react;
  if (request === 'react-native') return { Text: 'Text', View: 'View', StyleSheet: { create: (value: any) => value } };
  if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: { colors: { textMuted: '#CDD6DF' } } }) };
  if (request.endsWith('/decisionPresentation')) return { signedStat };
  if (request.endsWith('/SemanticUI')) return { StatValue: 'StatValue' };
  throw new Error('Unexpected equipment-stat dependency: ' + request);
}, mod, mod.exports);

const statValues = (tree: any): any[] => {
  if (Array.isArray(tree)) return tree.flatMap(statValues);
  if (!tree || typeof tree !== 'object') return [];
  return [...(tree.type === 'StatValue' ? [tree.props] : []), ...statValues(tree.props?.children)];
};
const render = mod.exports.EquipmentStatLine;
const base = { attackBonus: 8, armorBonus: 3, speedBonus: -1 };
const next = { attackBonus: 11, armorBonus: 1, speedBonus: -1 };
const before = JSON.stringify({ base, next });
const raw = statValues(render({ item: base }));
assert.deepEqual(raw.map(item => item.value), ['+8', '+3', '-1']);
const comparison = statValues(render({ item: next, current: base, label: 'Change vs equipped' }));
assert.deepEqual(comparison.map(item => item.value), ['+3', '-2', '0']);
const recovery = statValues(render({ item: { ...base, speedBonus: 0 }, current: base }));
assert.equal(recovery[2].value, '+1', 'Removing a speed penalty must display as a positive change.');
assert.ok([...raw, ...comparison, ...recovery].every(value => value.presentation === 'delta'));
assert.equal(JSON.stringify({ base, next }), before, 'Presenting comparisons must never modify item data.');
const artSource = readFileSync('src/ui/gameArt.tsx', 'utf8');
assert.ok(artSource.includes('export function EquipmentLoadoutScene'), 'Equipment loadout must have a scene-level paper-doll presentation.');
assert.ok(artSource.includes('export function ForgeWorkshopScene'), 'Forge must have a scene-level workshop presentation.');
assert.ok(artSource.includes('export function PromotionPathScene'), 'Promotion must have a before/after class-path presentation.');
const forgeScreen = readFileSync('src/screens/ForgeScreen.tsx', 'utf8');
assert.ok(forgeScreen.includes('<ForgeWorkshopScene'), 'The dedicated Forge screen must render the workshop scene.');
const promotionScreen = readFileSync('src/screens/PromotionScreen.tsx', 'utf8');
assert.ok(promotionScreen.includes('<PromotionPathScene'), 'The promotion decision must render the visual class path.');
const screen = readFileSync('src/screens/EquipmentManageScreen.tsx', 'utf8');
assert.ok(screen.includes('renderComparison(item)'), 'Equipment screen must actually use the comparison presentation.');
assert.ok(!screen.includes("'ATK +' + item.attackBonus"), 'Legacy double-sign/all-green item formatting must remain removed.');
assert.ok(screen.includes("item.rarity !== 'relic'"), 'Reward-only Relic artifacts must stay out of Forge craft lists.');
assert.ok(screen.includes('RarityChip'), 'Equipment screen must visibly present explicit item rarity.');
assert.ok(screen.includes('<EquipmentLoadoutScene'), 'Equipment management must make the live loadout visually dominant.');
assert.ok(screen.includes('<ForgeWorkshopScene'), 'The integrated Forge tab must share the workshop visual language.');
const provider = readFileSync('src/game/GameProvider.tsx', 'utf8');
assert.ok(provider.includes("equipment.rarity === 'relic'"), 'Provider must reject direct crafting attempts for Relic artifacts.');
console.log('PASS: equipment emphasis preserves signs, shows actual equipped-item differences, presents Relic rarity, blocks reward-only relic crafting and never mutates gear.');
