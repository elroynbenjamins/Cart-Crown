import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';
import { royalDecrees } from '../src/game/capital';
import { getFactionMandates } from '../src/game/factionChapter5';
import * as presentation from '../src/ui/policyPresentation';
import * as colors from '../src/ui/semanticColors';
import { getDecisionFooterLayout } from '../src/ui/decisionPresentation';
import { themes } from '../src/theme/themes';
import type { PolicyOption } from '../src/ui/policyPresentation';

// Real screen TSX with isolated native hosts/provider callbacks. Not native rendering or device QA.
let checks = 0;
function check(condition: unknown, message: string) { assert.ok(condition, message); checks += 1; }
type Element = { type: string | Function; props: Record<string, any> };
function nodes(tree: any, name: string): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(item => nodes(item, name));
  if (!tree || typeof tree !== 'object' || !tree.props) return [];
  const typeName = typeof tree.type === 'string' ? tree.type : tree.type?.name;
  return [
    ...(typeName === name ? [tree] : []),
    ...nodes(tree.props.children, name), ...nodes(tree.props.footer, name)
  ];
}
function text(tree: any): string {
  if (Array.isArray(tree)) return tree.map(text).join(' ');
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  return tree?.props ? text(tree.props.children) : '';
}
function commit(tree: any) {
  const found = nodes(tree, 'DecisionCommit');
  assert.equal(found.length, 1, 'A policy screen must expose exactly one confirmation model.');
  return found[0]!.props;
}
function choose(tree: any, index: number) {
  const card = nodes(tree, 'DecisionOption')[index];
  assert.ok(card, 'Missing policy card ' + index);
  card.props.onSelect();
}

function harness(file: string, exportName: string, game: any = {}, initialProps: Record<string, any> = {}) {
  let props = initialProps;
  let cursor = 0;
  const hooks: any[] = [];
  const dimensions = { width: 360, height: 800, fontScale: 1, scale: 1 };
  let theme = themes.original;
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
    useRef(initial: any) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { current: initial };
      return hooks[index];
    }
  };
  react.default = react;
  const host = (name: string) => {
    const component = (properties: any) => jsx(name, properties);
    Object.defineProperty(component, 'name', { value: name });
    return component;
  };
  const cache = new Map<string, any>();
  function load(filename: string): any {
    const absolute = resolve(filename);
    if (cache.has(absolute)) return cache.get(absolute);
    const output = ts.transpileModule(readFileSync(absolute, 'utf8'), {
      fileName: absolute, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true }
    });
    assert.equal((output.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error).length, 0);
    const module = { exports: {} as any };
    const localRequire = (request: string): any => {
      if (request === 'react') return react;
      if (request === 'react-native') return {
        View: 'View', Text: 'Text', Pressable: 'Pressable', ScrollView: 'ScrollView',
        useWindowDimensions: () => dimensions, StyleSheet: { create: (styles: any) => styles, hairlineWidth: 1 }
      };
      if (request.endsWith('/GameProvider')) return { useGame: () => game };
      if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme }) };
      if (request.endsWith('/policyPresentation')) return presentation;
      if (request.endsWith('/semanticColors')) return colors;
      if (request.endsWith('/decisionPresentation')) return { getDecisionFooterLayout };
      if (request.endsWith('/PolicyDecision') || request.endsWith('/DecisionUI')) return load(resolve(dirname(absolute), request + '.tsx'));
      if (request.endsWith('/SemanticUI')) return Object.fromEntries(['SemanticChip', 'SemanticText', 'StatValue', 'EmphasisText'].map(name => [name, host(name)]));
      if (request.endsWith('/components')) return Object.fromEntries(['GameCard', 'PrimaryButton', 'SecondaryButton'].map(name => [name, host(name)]));
      if (request.endsWith('/gameArt')) return Object.fromEntries(['FactionCrest', 'StoryScene'].map(name => [name, host(name)]));
      throw new Error('Unexpected policy UI dependency: ' + request);
    };
    new Function('require', 'module', 'exports', output.outputText)(localRequire, module, module.exports);
    cache.set(absolute, module.exports);
    return module.exports;
  }
  const component = load(file)[exportName];
  return {
    dimensions,
    setTheme(value: typeof themes.original) { theme = value; },
    render(nextProps?: Record<string, any>) { if (nextProps) props = nextProps; cursor = 0; return component(props); }
  };
}

const groups = [
  { faction: 'human', definitions: royalDecrees },
  { faction: 'elf', definitions: getFactionMandates('elf') },
  { faction: 'orc', definitions: getFactionMandates('orc') }
] as const;

function effectChecks() {
  const expected: Record<string, Array<[string, string]>> = {
    royal_muster: [['attackMultiplier', '+7%'], ['armorMultiplier', '+7%']],
    provincial_tithe: [['productionMultiplier', '+25%']],
    masterwork_commission: [['equipmentCostMultiplier', '-12%']],
    living_canopy: [['armorMultiplier', '+9%']],
    moonwatch: [['speedMultiplier', '+6%'], ['detailedIntel', 'Detailed intel']],
    rootway_stewardship: [['productionMultiplier', '+25%']],
    blood_hunt: [['attackMultiplier', '+9%'], ['speedMultiplier', '+3%']],
    iron_clan: [['armorMultiplier', '+10%']],
    shared_spoils: [['productionMultiplier', '+25%']]
  };
  for (const group of groups) for (const policy of group.definitions) {
    const before = JSON.stringify(policy);
    const active = presentation.policyEffectRows(policy, 'active');
    assert.deepEqual(active.map(row => [row.key, row.value]), expected[policy.id], policy.id + ' effect mismatch');
    check(active.every(row => row.tone === 'positive'), policy.id + ' benefits should be positive, including reduced costs.');
    check(presentation.policyEffectRows(policy, 'available').every(row => row.tone === 'neutral'), 'Unselected policies must not appear active.');
    check(presentation.policyEffectRows(policy, 'preview').every(row => row.tone === 'positive'), 'Explicit preview values should be emphasized.');
    check(JSON.stringify(policy) === before, 'Policy presentation must not mutate authored data.');
    check(presentation.policyChangeRows(policy, policy).length === 0, 'Current policy must not manufacture a change.');
    const categories = presentation.policyCategories(policy);
    check(new Set(categories.map(item => item.label)).size === categories.length, 'Policy categories must not duplicate.');
  }
  for (const group of groups) for (const first of group.definitions) for (const second of group.definitions) {
    const forward = presentation.policyChangeRows(first, second);
    const reverse = presentation.policyChangeRows(second, first);
    for (const row of forward) {
      const inverse = reverse.find(candidate => candidate.key === row.key);
      check(inverse?.before === row.after && inverse.after === row.before, 'Policy replacement values must reverse exactly.');
      check(inverse?.tone !== row.tone, 'Returning to the original policy must reverse benefit/tradeoff polarity.');
    }
  }
  const muster = royalDecrees[0]!;
  const crafting = royalDecrees[2]!;
  const changes = presentation.policyChangeRows(muster, crafting);
  check(changes.find(row => row.key === 'attackMultiplier')?.tone === 'negative', 'Giving up attack must be a visible tradeoff.');
  check(changes.find(row => row.key === 'equipmentCostMultiplier')?.tone === 'positive', 'A new crafting discount must be a gain.');
  const loseIntel = presentation.policyChangeRows(getFactionMandates('elf')[1]!, getFactionMandates('elf')[0]!);
  check(loseIntel.find(row => row.key === 'detailedIntel')?.after === 'Not provided', 'Intel comparison must describe this policy, not promise loss of all scouting.');
  check(presentation.policyEffectRows({ armorMultiplier: 0.9 }, 'preview')[0]?.tone === 'negative', 'Actual combat penalties must display as penalties.');
  check(presentation.policyEffectRows({ equipmentCostMultiplier: 1.2 }, 'active')[0]?.tone === 'negative', 'Cost increases must display as penalties.');
  check(presentation.policyEffectRows({ attackMultiplier: 1, armorMultiplier: Number.NaN }, 'active').length === 0, 'Neutral and invalid numbers must not manufacture benefits.');
  check(presentation.policyPercent(1.07) === '+7%' && presentation.policyPercent(0.88) === '-12%', 'Percentage formatting must avoid floating-point artifacts.');
  for (const theme of Object.values(themes)) for (const tone of ['positive', 'negative', 'currency', 'blue', 'green', 'cyan', 'violet', 'rose', 'neutral'] as const) {
    check(colors.contrastRatio(colors.semanticColor(theme, tone), theme.colors.surface1) >= 4.5, 'Policy foreground needs readable contrast in ' + theme.id);
    const chip = colors.semanticChipColors(theme, tone);
    check(colors.contrastRatio(chip.text, chip.background) >= 4.5, 'Policy chip needs readable contrast in ' + theme.id);
  }
}

function costChecks() {
  check(presentation.policyCommitState(null, 'a', 0, 100).canCommit, 'First choice must stay free.');
  check(!presentation.policyCommitState('a', 'a', 0, 100).canCommit, 'Current policy must not charge or reapply.');
  const short = presentation.policyCommitState('a', 'b', 40, 75);
  check(short.cost === 75 && short.missing === 35 && !short.canCommit, 'Exact Gold shortfall required.');
  const exact = presentation.policyCommitState('a', 'b', 75, 75);
  check(exact.canCommit && exact.balanceAfter === 0, 'Exact balance must allow switching.');
  check(!presentation.policyCommitState(null, null, 100, 75).canCommit, 'An empty policy list must not commit.');
  check(!presentation.policyCommitState('a', 'b', Number.NaN, 75).canCommit, 'Unknown balance must not permit paid changes.');
  check(!presentation.policyCommitState('a', 'b', 500, Number.NaN).canCommit, 'Unknown price must not permit paid changes.');
  check(!presentation.policyCommitState('a', 'b', 500, -20).canCommit, 'Malformed negative prices must not become a reward.');
  check(presentation.policyCommitState('a', 'b', 0, 0).canCommit, 'An explicitly free replacement must remain possible.');
}

function fixture(group: typeof groups[number], initialActive: string | null = null) {
  const royal = group.faction === 'human';
  const calls: string[] = [];
  let accepted = true;
  let throws = false;
  let exits = 0;
  const game: any = {
    activeFaction: group.faction, resources: { gold: 140 },
    royalDecrees, royalDecreeId: initialActive, royalDecreeSwitchCost: 60,
    factionMandates: group.faction === 'human' ? [] : getFactionMandates(group.faction),
    factionMandateId: initialActive, factionMandateSwitchCost: 45
  };
  const idKey = royal ? 'royalDecreeId' : 'factionMandateId';
  const costKey = royal ? 'royalDecreeSwitchCost' : 'factionMandateSwitchCost';
  const provider = (id: string) => {
    calls.push(id);
    if (throws) throw new Error('simulated provider failure');
    if (!accepted || !group.definitions.some(option => option.id === id)) return false;
    const cost = game[idKey] && game[idKey] !== id ? game[costKey] : 0;
    if (game.resources.gold < cost) return false;
    game.resources = { gold: game.resources.gold - cost };
    game[idKey] = id;
    return true;
  };
  game.chooseRoyalDecree = provider;
  game.chooseFactionMandate = provider;
  const file = royal ? 'RoyalDecreesScreen' : 'FactionMandateScreen';
  const wrapper = harness('src/screens/' + file + '.tsx', file, game, { onExit: () => { exits += 1; } });
  const initial = wrapper.render();
  check(initial.type.name === 'PolicyDecision', 'Both routes must render the shared policy control.');
  const shared = harness('src/ui/PolicyDecision.tsx', 'PolicyDecision', {}, initial.props);
  return {
    game, calls, wrapper, shared,
    idKey, costKey,
    render: () => shared.render(wrapper.render().props),
    staleRender: () => shared.render(),
    setAccepted: (value: boolean) => { accepted = value; },
    setThrows: (value: boolean) => { throws = value; },
    exits: () => exits
  };
}

function interactionChecks() {
  for (const group of groups) {
    const f = fixture(group);
    let tree = f.render();
    check(nodes(tree, 'DecisionOption').length === 3, 'Each faction has exactly its three authored policies.');
    const balance = f.game.resources.gold;
    choose(tree, 1);
    tree = f.render();
    check(f.calls.length === 0 && f.game.resources.gold === balance && f.game[f.idKey] === null, 'Draft selection must not activate or spend.');
    check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Preview · not active'), 'The preview must be explicitly labelled.');
    const freeAction = commit(tree).onConfirm;
    freeAction(); freeAction();
    check(f.calls.length === 1 && f.game.resources.gold === balance, 'First enactment must be free and ignore a repeated stale tap.');
    tree = f.render();
    check(commit(tree).label === 'Return to Kingdom', 'An active policy must offer a no-charge return.');
    commit(tree).onConfirm();
    check(f.exits() === 1 && f.calls.length === 1, 'Returning must not call the policy setter.');
    choose(tree, 2);
    tree = f.render();
    const comparison = nodes(tree, 'PolicyReplacementPreview');
    check(comparison.length === 1 && comparison[0]!.props.current.id === group.definitions[1]!.id, 'Comparison must use the actual active policy.');
    check(commit(tree).detail.includes(String(balance - f.game[f.costKey]) + ' Gold'), 'Confirmation must show the post-switch balance.');
    const paidAction = commit(tree).onConfirm;
    paidAction(); paidAction();
    check(f.calls.length === 2 && f.game.resources.gold === balance - f.game[f.costKey], 'Paid switching must charge once.');
    // Rerender without refreshing provider props, then tap a different draft: still the same stale transaction snapshot.
    tree = f.staleRender();
    choose(tree, 0);
    tree = f.staleRender();
    commit(tree).onConfirm();
    check(f.calls.length === 2, 'Changing selection cannot bypass the same-snapshot commit guard.');
    tree = f.render();
    check(commit(tree).title === group.definitions[2]!.name, 'A changed active ID must invalidate an old draft.');

    const poor = fixture(group, group.definitions[0]!.id);
    poor.game.resources = { gold: 1 };
    tree = poor.render(); choose(tree, 1); tree = poor.render();
    check(commit(tree).disabled && commit(tree).warning.includes(String(poor.game[poor.costKey] - 1)), 'Unaffordable changes must state the shortfall.');
    commit(tree).onConfirm();
    check(poor.calls.length === 0, 'Disabled paid changes must also be blocked by the handler.');
    poor.game.resources = { gold: poor.game[poor.costKey] };
    tree = poor.render();
    poor.setAccepted(false);
    commit(tree).onConfirm(); tree = poor.render();
    check(commit(tree).message.includes('campaign requirements'), 'Provider rejections must not be falsely reported only as a Gold shortage.');
    check(poor.game[poor.idKey] === group.definitions[0]!.id, 'A rejected change must keep the active policy.');
    poor.setAccepted(true);
    commit(tree).onConfirm();
    check(poor.calls.length === 2 && poor.game.resources.gold === 0, 'A rejected change must permit a valid later retry.');

    const failed = fixture(group);
    failed.setThrows(true); commit(failed.render()).onConfirm();
    check(commit(failed.render()).message.includes('Could not confirm'), 'Unexpected failure must provide feedback, not a success banner.');
    failed.setThrows(false); commit(failed.render()).onConfirm();
    check(failed.calls.length === 2, 'A thrown confirmation must release the in-flight guard.');

    const cancel = fixture(group, group.definitions[0]!.id);
    tree = cancel.render(); choose(tree, 2); tree = cancel.render();
    nodes(tree, 'SecondaryButton').find(node => node.props.label === 'Return without changing')!.props.onPress();
    check(cancel.exits() === 1 && cancel.calls.length === 0, 'Leaving a draft must not enact it.');
  }
}

function presentationChecks() {
  const current: PolicyOption = { ...royalDecrees[0]!, effects: royalDecrees[0]! };
  const proposed: PolicyOption = { ...royalDecrees[2]!, effects: royalDecrees[2]! };
  const preview = harness('src/ui/PolicyDecision.tsx', 'PolicyReplacementPreview', {}, { current, proposed }).render();
  check(text(preview).includes('not final army totals'), 'Replacement preview must not claim whole-army prediction.');
  check(nodes(preview, 'SemanticChip').some(node => node.props.label === 'Tradeoff'), 'Lost benefits must be explicitly labelled as tradeoffs.');
  check(nodes(preview, 'SemanticText').some(node => node.props.tone === 'negative'), 'Losing army bonuses must not stay green.');
  check(nodes(preview, 'SemanticText').some(node => node.props.tone === 'positive' && text(node).includes('-12%')), 'Crafting discount should stand out as positive.');
  const available = harness('src/ui/PolicyDecision.tsx', 'PolicyEffectsList', {}, { effects: proposed.effects, state: 'available', fallback: proposed.effectText }).render();
  check(nodes(available, 'SemanticText').every(node => node.props.tone === 'neutral'), 'Inactive values must not mimic the active card.');
  const option = harness('src/ui/DecisionUI.tsx', 'DecisionOption', {}, {
    title: 'Policy', subtitle: 'Preview', selected: true, accessibilitySummary: 'Army armor: +7%', onSelect: () => {}
  }).render();
  check(option.props.accessibilityRole === 'radio' && option.props.accessibilityState.selected, 'Draft selection needs accessible state.');
  check(option.props.accessibilityLabel.includes('+7%'), 'Accessible summary must include the real effect.');
  const layout = harness('src/ui/DecisionUI.tsx', 'DecisionLayout', {}, {
    footer: { type: 'PolicyFooter', props: {} }, children: { type: 'PolicyList', props: {} }
  });
  let tree = layout.render();
  tree.props.onLayout({ nativeEvent: { layout: { height: 680 } } }); tree = layout.render();
  check(nodes(tree, 'ScrollView').some(node => node.props.testID === 'decision-footer'), 'Tall content should keep the confirmation within reach.');
  layout.dimensions.fontScale = 2; tree = layout.render();
  check(!nodes(tree, 'ScrollView').some(node => node.props.testID === 'decision-footer'), 'Large text must use ordinary scrolling.');
  check(nodes(tree, 'PolicyFooter').length === 1, 'Large-text fallback must not duplicate confirmation.');
  const empty = harness('src/ui/PolicyDecision.tsx', 'PolicyDecision', {}, {
    title: 'Policies', eyebrow: 'Council', options: [], activeId: null, gold: 0, switchCost: 50,
    verb: 'Adopt', onChoose: () => { throw new Error('Must not choose'); }, onExit: () => {}
  });
  tree = empty.render();
  check(commit(tree).disabled && nodes(tree, 'SecondaryButton').length === 1, 'Empty policy choices must still allow returning.');
  commit(tree).onConfirm();
  const f = fixture(groups[1]);
  f.game.factionMandates = [...getFactionMandates('elf'), ...getFactionMandates('orc')];
  let wrapped = f.wrapper.render();
  check(wrapped.props.options.length === 3 && wrapped.props.options.every((item: any) => item.faction === 'elf'), 'Elf route must not expose Orc policies.');
  check(wrapped.props.onChoose('blood_hunt') === false && f.calls.length === 0, 'An invalid/cross-faction ID must not reach the provider.');
  const elfKey = wrapped.props.key;
  f.game.activeFaction = 'orc'; wrapped = f.wrapper.render();
  check(wrapped.props.key !== elfKey && wrapped.props.options.every((item: any) => item.faction === 'orc'), 'Changing faction must remount the draft and filter choices.');
  for (const file of ['src/ui/PolicyDecision.tsx', 'src/screens/RoyalDecreesScreen.tsx', 'src/screens/FactionMandateScreen.tsx']) {
    const source = readFileSync(resolve(file), 'utf8');
    check(!source.includes('onTouchEnd'), 'Scrolling must not use touch-release policy selection.');
    check(!source.includes('numberOfLines='), 'Policy names and comparisons must not be truncated.');
  }
}

effectChecks();
costChecks();
interactionChecks();
presentationChecks();
console.log('PASS: ' + checks + ' policy effect, cost and real-TSX interaction/model checks across Human, Elf and Orc choices. Native visual QA is separate.');
