import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as guidance from '../src/game/tacticalGuidance';
import { factions } from '../src/game/factions';
import { themes } from '../src/theme/themes';
import { semanticColor, semanticChipColors, contrastRatio } from '../src/ui/semanticColors';
import type { TacticalGuidanceLevel } from '../src/game/tacticalGuidance';
import type { FactionId } from '../src/game/types';

// Actual screen TSX and the current provider reset action, with isolated native hosts.
// These checks do not substitute for Android rendering, TalkBack or device screenshots.
type Element = { type: string | Function; props: Record<string, any> };
let checks = 0;
function check(value: unknown, message: string) { assert.ok(value, message); checks += 1; }
function nodes(tree: any, name: string): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, name));
  if (!tree?.type || !tree?.props) return [];
  const typeName = typeof tree.type === 'string' ? tree.type : tree.type.name;
  return [...(typeName === name ? [tree] : []), ...nodes(tree.props.children, name)];
}
function text(tree: any): string {
  if (tree == null || typeof tree === 'boolean') return '';
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  return Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);
}
function action(tree: any, label: string) {
  const node = [...nodes(tree, 'PrimaryButton'), ...nodes(tree, 'SecondaryButton')].find(item => item.props.label === label);
  assert.ok(node, 'Missing action: ' + label);
  return node.props;
}
function choice(tree: any, mode: TacticalGuidanceLevel) {
  const name = guidance.tacticalGuidanceOptions.find(option => option.id === mode)!.name;
  const node = nodes(tree, 'Pressable').find(item => item.props.accessibilityRole === 'radio' && item.props.accessibilityLabel.startsWith(name + '.'));
  assert.ok(node, 'Missing guidance choice: ' + mode);
  return node.props;
}
function disclosure(tree: any) {
  return nodes(tree, 'Pressable').find(item => item.props.accessibilityLabel === 'Guidance details')!.props;
}
const screenPath = 'src/screens/SettingsScreen.tsx';
const screenSource = readFileSync(screenPath, 'utf8');
const providerSource = ts.createSourceFile('GameProvider.tsx', readFileSync('src/game/GameProvider.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function resetAction(setTutorialSeen: (value: string[]) => void): () => void {
  const found: ts.Expression[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'resetTutorialGuidance' && node.initializer) found.push(node.initializer);
    ts.forEachChild(node, visit);
  };
  visit(providerSource);
  assert.equal(found.length, 1, 'Expected one authoritative tutorial reset action.');
  const output = ts.transpileModule('(' + found[0]!.getText(providerSource) + ')', {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
  }).outputText.trim().replace(/;$/, '');
  return new Function('setTutorialSeen', 'return ' + output)(setTutorialSeen);
}

function harness(game: any, preferences: any, theme = themes.original) {
  let cursor = 0;
  const hooks: any[] = [];
  const effects: Array<() => void> = [];
  const jsx = (type: Element['type'], supplied: any, ...children: any[]): Element => ({ type, props: {
    ...(supplied ?? {}), ...(children.length ? { children: children.length === 1 ? children[0] : children } : {})
  } });
  const react: any = {
    __esModule: true, createElement: jsx,
    useState(initial: any) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial;
      return [hooks[index], (next: any) => { hooks[index] = typeof next === 'function' ? next(hooks[index]) : next; }];
    },
    useRef(initial: any) { const index = cursor++; if (!(index in hooks)) hooks[index] = { current: initial }; return hooks[index]; },
    useEffect(effect: () => any) { const index = cursor++; if (!(index in hooks)) { hooks[index] = true; const cleanup = effect(); if (cleanup) effects.push(cleanup); } }
  };
  react.default = react;
  const hosts = (names: string[]) => Object.fromEntries(names.map(name => {
    const component = (props: any) => jsx(name, props);
    Object.defineProperty(component, 'name', { value: name });
    return [name, component];
  }));
  const compiled = ts.transpileModule(screenSource, {
    fileName: screenPath, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true }
  });
  assert.equal((compiled.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} as any };
  const localRequire = (id: string): any => {
    if (id === 'react') return react;
    if (id === 'react-native') return { Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View', StyleSheet: { create: (styles: any) => styles } };
    if (id.endsWith('/tacticalGuidance')) return guidance;
    if (id.endsWith('/factions')) return { factions };
    if (id.endsWith('/GameProvider')) return { useGame: () => game };
    if (id.endsWith('/PreferencesProvider')) return { usePreferences: () => ({ ...preferences }) };
    if (id.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme }) };
    if (id.endsWith('/components')) return hosts(['GameCard', 'PrimaryButton', 'SecondaryButton']);
    if (id.endsWith('/DecisionUI')) return hosts(['DecisionIntro']);
    if (id.endsWith('/SemanticUI')) return hosts(['SemanticChip']);
    if (id.endsWith('/semanticColors')) return { semanticColor };
    throw new Error('Unexpected Settings dependency: ' + id);
  };
  new Function('require', 'module', 'exports', compiled.outputText)(localRequire, module, module.exports);
  return {
    render() { cursor = 0; return module.exports.SettingsScreen(); },
    dispose() { effects.forEach(cleanup => cleanup()); }
  };
}
function fixture(faction: FactionId = 'human', level: TacticalGuidanceLevel = 'standard', theme = themes.original) {
  const histories: Record<FactionId, string[]> = { human: ['welcome', 'army'], elf: ['welcome', 'magic'], orc: ['welcome', 'flying'] };
  let resets = 0;
  const changes: TacticalGuidanceLevel[] = [];
  const game: any = {
    activeFaction: faction, units: [{ id: 'retained_squad' }], equipmentInventory: ['retained_sword'], formation: ['retained_squad'],
    resources: { gold: 127, wood: 73, provisions: 29 }, chapterNumber: 4, armyReadiness: 62,
    completedStoryGates: ['retained_gate'], sharedProgress: { gems: 17, completedCampaigns: ['human'] },
    buildings: [{ id: 'retained_building' }], reviewPromptShown: true
  };
  Object.defineProperty(game, 'tutorialSeen', { enumerable: true, get: () => histories[game.activeFaction as FactionId] });
  const reset = resetAction(values => { histories[game.activeFaction as FactionId] = values; });
  game.resetTutorialGuidance = () => { resets += 1; reset(); };
  const preferences = { tacticalGuidance: level, setTacticalGuidance: (mode: TacticalGuidanceLevel) => { changes.push(mode); preferences.tacticalGuidance = mode; } };
  return { game, histories, preferences, changes, resets: () => resets, h: harness(game, preferences, theme) };
}
function protectedState(game: any) {
  const { tutorialSeen: _, resetTutorialGuidance: __, ...rest } = game;
  return JSON.stringify(rest);
}
const featureNames = ['Scout fit scores', 'Counter hints', 'Loadouts sorted by fit', 'Recommended loadout', 'Adjustment checklist', 'Guided fix actions', 'Severely Underprepared launch confirmation'];
function displayedFeatures(tree: any) {
  return featureNames.map(label => {
    const row = nodes(tree, 'View').find(item => {
      const children = Array.isArray(item.props.children) ? item.props.children : [item.props.children];
      return children.some((child: any) => child?.type === 'Text' && text(child) === label);
    });
    assert.ok(row, 'Missing feature row: ' + label);
    const chip = nodes(row, 'SemanticChip')[0]!;
    return chip.props.label;
  });
}
function testGuidance() {
  for (const faction of ['human', 'elf', 'orc'] as const) for (const level of ['standard', 'full', 'off'] as const) {
    const f = fixture(faction, level);
    let tree = f.h.render();
    const before = JSON.stringify([protectedState(f.game), f.histories]);
    check(f.changes.length === 0 && f.resets() === 0, 'Rendering Settings must not change any preference or game state.');
    const radios = nodes(tree, 'Pressable').filter(item => item.props.accessibilityRole === 'radio');
    check(radios.length === 3 && radios.filter(item => item.props.accessibilityState.checked).length === 1, 'Expose exactly one checked native radio choice.');
    check(choice(tree, level).accessibilityState.checked, 'Check the actual app-wide preference.');
    check(!disclosure(tree).accessibilityState.expanded && !text(tree).includes('Severely Underprepared launch confirmation'), 'Detailed explanations must start collapsed.');
    check(nodes(tree, 'PrimaryButton').length === 0, 'Ordinary Settings must not promote a one-tap reset as a primary action.');
    choice(tree, level).onPress(); check(f.changes.length === 0, 'Tapping the active mode is a no-op.');
    disclosure(tree).onPress(); tree = f.h.render();
    const expected = level === 'full' ? Array(7).fill('On') : level === 'off' ? Array(7).fill('Off') : ['On', 'On', 'Off', 'Off', 'Off', 'Off', 'Off'];
    assert.deepEqual(displayedFeatures(tree), expected);
    check(text(tree).includes(guidance.tacticalGuidanceOptions.find(option => option.id === level)!.detail), 'Show only the current mode explanation.');
    const next: TacticalGuidanceLevel = level === 'full' ? 'off' : 'full';
    const press = choice(tree, next).onPress;
    press(); press();
    check(f.changes.length === 1 && f.preferences.tacticalGuidance === next, 'Explicit guidance change calls the existing setter once.');
    tree = f.h.render();
    check(choice(tree, next).accessibilityState.checked && disclosure(tree).accessibilityState.expanded, 'Applied choice and expanded detail must stay in sync.');
    press(); check(f.changes.length === 1, 'Outdated option handlers must not write again.');
    check(JSON.stringify([protectedState(f.game), f.histories]) === before, 'Guidance changes cannot mutate combat, campaign, wallet or tutorial history.');
    check(nodes(tree, 'Text').some(item => item.props.accessibilityLiveRegion === 'polite'), 'Preference feedback must be exposed as a live region.');
    disclosure(tree).onPress(); check(!disclosure(f.h.render()).accessibilityState.expanded, 'Details must close without changing settings.');
    f.h.dispose();
  }
}
function testReset() {
  for (const faction of ['human', 'elf', 'orc'] as const) for (const level of ['standard', 'full', 'off'] as const) {
    const f = fixture(faction, level);
    const before = protectedState(f.game);
    const other = JSON.stringify(Object.entries(f.histories).filter(([key]) => key !== faction));
    action(f.h.render(), 'Review tutorial replay').onPress();
    let tree = f.h.render();
    check(f.resets() === 0 && f.histories[faction].length === 2, 'Reviewing replay must not reset anything.');
    check(text(tree).includes('Replay ' + factions[faction].name + ' tutorials?'), 'Confirmation must name the current faction.');
    check(nodes(tree, 'PrimaryButton').length === 1, 'Only the deliberate replay confirmation is primary.');
    const oldConfirm = action(tree, 'Confirm tutorial replay').onPress;
    action(tree, 'Keep tutorial history').onPress(); oldConfirm();
    check(f.resets() === 0, 'Cancelling must invalidate even an old confirmation callback.');
    action(f.h.render(), 'Review tutorial replay').onPress(); tree = f.h.render();
    oldConfirm(); check(f.resets() === 0, 'A cancelled confirmation cannot execute a newly opened request.');
    const confirm = action(tree, 'Confirm tutorial replay').onPress; confirm(); confirm();
    check(f.resets() === 1 && f.histories[faction].length === 0, 'Confirm invokes the actual provider reset once.');
    tree = f.h.render();
    check(action(tree, 'Review tutorial replay').disabled, 'An empty tutorial history cannot be reset again.');
    check(text(tree).includes('Tutorial history cleared'), 'Success should reflect the cleared provider state.');
    check(protectedState(f.game) === before && JSON.stringify(Object.entries(f.histories).filter(([key]) => key !== faction)) === other, 'Reset only the selected faction tutorial history, never other factions or progression.');
    check(f.preferences.tacticalGuidance === level && f.changes.length === 0, 'Tutorial replay must not alter assistance level.');
    f.h.dispose();
  }
}
function testInvalidationAndFailures() {
  const changed = fixture();
  action(changed.h.render(), 'Review tutorial replay').onPress();
  const old = action(changed.h.render(), 'Confirm tutorial replay').onPress;
  changed.game.activeFaction = 'elf'; let tree = changed.h.render(); old();
  check(changed.resets() === 0 && nodes(tree, 'PrimaryButton').length === 0, 'An old faction prompt must not reset the newly selected faction.');
  changed.game.activeFaction = 'human'; changed.h.render(); old();
  check(changed.resets() === 0, 'Returning to a former faction must not revive an obsolete prompt.');
  action(changed.h.render(), 'Review tutorial replay').onPress();
  const stale = action(changed.h.render(), 'Confirm tutorial replay').onPress;
  changed.histories.human = [...changed.histories.human, 'new_unlock']; tree = changed.h.render(); stale();
  check(changed.resets() === 0 && nodes(tree, 'PrimaryButton').length === 0, 'Newly recorded lessons must invalidate an old reset review.');
  action(tree, 'Review tutorial replay').onPress();
  const unmounted = action(changed.h.render(), 'Confirm tutorial replay').onPress;
  changed.h.dispose(); unmounted();
  check(changed.resets() === 0, 'Unmounted Settings handlers must not reset history.');

  const retry = fixture('orc', 'off');
  const realReset = retry.game.resetTutorialGuidance;
  retry.game.resetTutorialGuidance = () => { throw new Error('test'); };
  action(retry.h.render(), 'Review tutorial replay').onPress(); action(retry.h.render(), 'Confirm tutorial replay').onPress();
  tree = retry.h.render(); check(text(tree).includes('could not be reset') && retry.histories.orc.length === 2, 'A rejected reset cannot display success.');
  retry.game.resetTutorialGuidance = realReset;
  action(tree, 'Review tutorial replay').onPress(); action(retry.h.render(), 'Confirm tutorial replay').onPress();
  check(retry.resets() === 1 && retry.histories.orc.length === 0, 'Failed reset remains retryable.'); retry.h.dispose();

  const pending = fixture(); let pendingCalls = 0;
  pending.game.resetTutorialGuidance = () => { pendingCalls += 1; };
  action(pending.h.render(), 'Review tutorial replay').onPress(); action(pending.h.render(), 'Confirm tutorial replay').onPress();
  tree = pending.h.render();
  check(action(tree, 'Updating tutorial history…').disabled && !text(tree).includes('Tutorial history cleared'), 'Pending provider updates must not report completion.');
  action(tree, 'Updating tutorial history…').onPress(); check(pendingCalls === 1, 'A pending update must not be repeated.'); pending.h.dispose();

  const noHistory = fixture(); noHistory.histories.human = [];
  tree = noHistory.h.render(); action(tree, 'Review tutorial replay').onPress();
  check(noHistory.resets() === 0 && nodes(noHistory.h.render(), 'PrimaryButton').length === 0, 'No-history state must stay a safe no-op.'); noHistory.h.dispose();

  const failedPreference = fixture(); const realSet = failedPreference.preferences.setTacticalGuidance;
  failedPreference.preferences.setTacticalGuidance = () => { throw new Error('test'); };
  choice(failedPreference.h.render(), 'full').onPress();
  tree = failedPreference.h.render(); check(text(tree).includes('could not be changed') && choice(tree, 'standard').accessibilityState.checked, 'A failed setter cannot change the displayed preference.');
  failedPreference.preferences.setTacticalGuidance = realSet;
  choice(tree, 'full').onPress(); check(failedPreference.preferences.tacticalGuidance === 'full', 'Preference failures remain retryable.'); failedPreference.h.dispose();
}
function testPresentation() {
  for (const theme of Object.values(themes)) {
    const f = fixture('elf', 'off', theme);
    let tree = f.h.render();
    for (const mode of ['full', 'standard', 'off'] as const) {
      const styles = choice(tree, mode).style({ pressed: false });
      check(styles[0].minHeight >= 48 && !styles[0].height, 'Radio hit areas must remain generous and grow with content.');
    }
    check(disclosure(tree).style({ pressed: false })[0].minHeight >= 48, 'Disclosure needs a real touch target, not tiny text.');
    disclosure(tree).onPress(); tree = f.h.render();
    for (const label of nodes(tree, 'Text')) {
      check(label.props.numberOfLines === undefined, 'Settings text should wrap rather than truncate important instructions.');
    }
    for (const tone of ['blue', 'cyan', 'currency', 'positive', 'warning'] as const) {
      const colors = semanticChipColors(theme, tone);
      check(contrastRatio(colors.text, colors.background) >= 4.5, 'Settings chip contrast: ' + theme.name + '/' + tone);
    }
    f.h.dispose();
  }
  check(!screenSource.includes('onTouchEnd') && !screenSource.includes("position: 'absolute'"), 'Do not reintroduce touch-release selection or overlayed Settings controls.');
  check(!screenSource.includes('AsyncStorage') && !screenSource.includes('resetGame'), 'Settings must use the existing preference/reset boundaries, not write raw saves.');
}

testGuidance(); testReset(); testInvalidationAndFailures(); testPresentation();
console.log('PASS: ' + checks + ' Settings guidance, accessible-control and faction-scoped tutorial-reset checks. Native Android appearance and TalkBack remain separate QA.');
