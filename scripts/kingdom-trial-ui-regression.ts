import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as trials from '../src/game/kingdomTrials';
import * as presentation from '../src/ui/kingdomTrialPresentation';
import { factions } from '../src/game/factions';
import { themes } from '../src/theme/themes';
import * as semantic from '../src/ui/semanticColors';
import type { FactionId, FormationShapeId } from '../src/game/types';
import type { KingdomTrialId } from '../src/game/kingdomTrials';

// Real TSX and provider-action bodies, with isolated native hosts. Not native layout/TalkBack testing.
let checks = 0;
function check(condition: unknown, message: string) { assert.ok(condition, message); checks += 1; }
type Element = { type: string | Function; props: Record<string, any> };
function nodes(tree: any, name: string): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, name));
  if (!tree?.type || !tree?.props) return [];
  const actual = typeof tree.type === 'string' ? tree.type : tree.type.name;
  return [...(actual === name ? [tree] : []), ...nodes(tree.props.children, name), ...nodes(tree.props.footer, name)];
}
function textOf(tree: any): string {
  if (typeof tree === 'number' || typeof tree === 'string') return String(tree);
  if (Array.isArray(tree)) return tree.map(textOf).join(' ');
  return tree?.props ? textOf(tree.props.children) : '';
}
function commit(tree: any) { const found = nodes(tree, 'DecisionCommit'); assert.equal(found.length, 1); return found[0]!.props; }
function control(tree: any, label: string) {
  const found = nodes(tree, 'Pressable').find(node => node.props.accessibilityLabel === label);
  assert.ok(found, 'Missing disclosure: ' + label); return found.props;
}
const source = readFileSync('src/screens/FormationTrialScreen.tsx', 'utf8');
const output = ts.transpileModule(source, { fileName: 'FormationTrialScreen.tsx', reportDiagnostics: true,
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } });
assert.equal((output.diagnostics ?? []).filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error).length, 0);
function harness(game: any, supplied: Record<string, any> = {}) {
  let cursor = 0;
  const hooks: any[] = [];
  const cleanups: Array<() => void> = [];
  const props = { onEditFormation: () => {}, onExit: () => {}, ...supplied };
  const jsx = (type: Element['type'], values: any, ...children: any[]): Element => ({ type, props: {
    ...(values ?? {}), ...(children.length ? { children: children.length === 1 ? children[0] : children } : {})
  } });
  const react: any = {
    __esModule: true, createElement: jsx, Fragment: 'Fragment',
    useState(initial: any) {
      const index = cursor++; if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial;
      return [hooks[index], (next: any) => { hooks[index] = typeof next === 'function' ? next(hooks[index]) : next; }];
    },
    useRef(initial: any) { const index = cursor++; if (!(index in hooks)) hooks[index] = { current: initial }; return hooks[index]; },
    useEffect(effect: () => any) { const index = cursor++; if (!(index in hooks)) { hooks[index] = true; const cleanup = effect(); if (cleanup) cleanups.push(cleanup); } }
  };
  react.default = react;
  const hosts = (names: string[]) => Object.fromEntries(names.map(name => {
    const fn = (values: any) => jsx(name, values); Object.defineProperty(fn, 'name', { value: name }); return [name, fn];
  }));
  const requireLocal = (request: string): any => {
    if (request === 'react') return react;
    if (request === 'react-native') return { Pressable: 'Pressable', View: 'View', Text: 'Text', StyleSheet: { create: (styles: any) => styles } };
    if (request.endsWith('/GameProvider')) return { useGame: () => game };
    if (request.endsWith('/factions')) return { factions };
    if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: themes.original }) };
    if (request.endsWith('/kingdomTrialPresentation')) return presentation;
    if (request.endsWith('/semanticColors')) return semantic;
    if (request.endsWith('/DecisionUI')) return hosts(['DecisionLayout', 'DecisionCommit', 'DecisionIntro']);
    if (request.endsWith('/components')) return hosts(['GameCard', 'SecondaryButton']);
    if (request.endsWith('/gameArt')) return hosts(['FactionCrest']);
    if (request.endsWith('/SemanticUI')) return hosts(['SemanticChip']);
    throw new Error('Unexpected Trials UI dependency: ' + request);
  };
  const module = { exports: {} as any };
  new Function('require', 'module', 'exports', output.outputText)(requireLocal, module, module.exports);
  return {
    render() { cursor = 0; return module.exports.FormationTrialScreen(props); },
    reward(values: any) { return module.exports.TrialRewardSummary(values); },
    dispose() { cleanups.forEach(cleanup => cleanup()); }
  };
}

const provider = ts.createSourceFile('GameProvider.tsx', readFileSync('src/game/GameProvider.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function providerAction(name: string, scope: Record<string, any>) {
  const found: ts.Expression[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && node.initializer) found.push(node.initializer);
    ts.forEachChild(node, visit);
  };
  visit(provider); assert.equal(found.length, 1, 'Provider action not uniquely found: ' + name);
  const code = ts.transpileModule('(' + found[0]!.getText(provider) + ')', {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
  }).outputText.trim().replace(/;$/, '');
  return new Function(...Object.keys(scope), 'return ' + code)(...Object.values(scope));
}
function formation(entries: Array<[number, string]>) {
  const slots = Array<string | null>(9).fill(null);
  for (const [index, id] of entries) slots[index] = id;
  return slots;
}
// Established valid examples; the production evaluator, not the fixture, decides pass/fail.
function setup(faction: FactionId, id: KingdomTrialId) {
  const shape: FormationShapeId = id === 'bronze' ? 'balanced_333' : faction === 'orc' ? 'assault_432' : 'deep_234';
  const entries: Record<FactionId, Record<KingdomTrialId, Array<[number, string]>>> = {
    human: { bronze: [[1, 'hum_militia'], [4, 'hum_recruit']], silver: [[0, 'hum_militia'], [3, 'hum_recruit'], [8, 'human_third']], gold: [[0, 'hum_militia'], [2, 'hum_recruit'], [5, 'human_third'], [8, 'human_fourth']] },
    elf: { bronze: [[0, 'elf_warden'], [8, 'elf_bow']], silver: [[0, 'elf_a'], [3, 'elf_b'], [8, 'elf_c']], gold: [[0, 'elf_a'], [3, 'elf_b'], [5, 'elf_c'], [8, 'elf_d']] },
    orc: { bronze: [[0, 'orc_a'], [1, 'orc_b']], silver: [[0, 'orc_a'], [1, 'orc_b'], [5, 'orc_c']], gold: [[0, 'orc_a'], [1, 'orc_b'], [2, 'orc_c'], [4, 'orc_d']] }
  };
  const doctrines = id === 'gold' ? { human: 'human_volley', elf: 'elf_crescent', orc: 'orc_rush' } : { human: 'human_hold', elf: 'elf_open', orc: 'orc_warband' };
  return { formation: formation(entries[faction][id]), formationShapeId: shape, formationDoctrineId: doctrines[faction] };
}
function fixture(faction: FactionId, id: KingdomTrialId) {
  const calls: KingdomTrialId[] = [];
  const game: any = {
    activeFaction: faction, chapterNumber: trials.getKingdomTrialRequiredChapter(id), ...setup(faction, id),
    kingdomTrialCompletions: trials.kingdomTrialOrder.slice(0, trials.kingdomTrialOrder.indexOf(id)),
    formationTrialCompleted: id !== 'bronze', chapterNodes: [],
    resources: { gold: 100, wood: 100, stone: 100, iron: 100, provisions: 100 },
    units: [{ id: 'roster_sentinel', hp: 123 }], armyReadiness: 58, buildingLevels: { forge: 2 },
    equipmentInventory: ['sword'], unitEquipment: {}, productionStock: { wood: 17 },
    sharedProgress: { gems: 21 }, tutorialSeen: ['existing_lesson'],
    preferences: { tacticalGuidance: 'off' }, activeSquadCap: 9,
    otherFaction: { kingdomTrialCompletions: ['bronze'], resources: { gold: 55 } }
  };
  for (const [setter, field] of Object.entries({ setResources: 'resources', setKingdomTrialCompletions: 'kingdomTrialCompletions', setFormationTrialCompleted: 'formationTrialCompleted' })) {
    game[setter] = (next: any) => { game[field] = typeof next === 'function' ? next(game[field]) : next; };
  }
  game.isSideModeUnlocked = (mode: string) => providerAction('isSideModeUnlocked', game)(mode);
  game.completeKingdomTrial = (trialId: KingdomTrialId) => {
    calls.push(trialId);
    return providerAction('completeKingdomTrial', {
      ...game, ...trials,
      addResources: (wallet: any, reward: any) => Object.fromEntries(Object.entries(wallet).map(([resource, value]) => [resource, (value as number) + (reward[resource] ?? 0)]))
    })(trialId);
  };
  return { game, calls };
}
function protectedState(game: any) {
  return JSON.stringify([game.units, game.formation, game.formationShapeId, game.formationDoctrineId,
    game.armyReadiness, game.buildingLevels, game.equipmentInventory, game.unitEquipment, game.productionStock,
    game.sharedProgress, game.tutorialSeen, game.preferences, game.activeSquadCap, game.chapterNodes, game.otherFaction]);
}
function testEveryMedal() {
  for (const faction of ['human', 'elf', 'orc'] as const) for (const id of trials.kingdomTrialOrder) {
    const { game, calls } = fixture(faction, id);
    let edits = 0, exits = 0;
    const h = harness(game, { onEditFormation: () => { edits += 1; }, onExit: () => { exits += 1; } });
    const before = protectedState(game);
    const walletBefore = { ...game.resources };
    const tree = h.render();
    const view = presentation.getKingdomTrialView(game);
    check(view.current?.passed && commit(tree).label === 'Claim ' + presentation.trialMedalNames[id] + ' Medal', faction + '/' + id + ' must offer the correct first claim.');
    check(calls.length === 0 && protectedState(game) === before, 'Rendering cannot claim, rearrange or advance anything.');
    const reward = nodes(tree, 'TrialRewardSummary');
    check(reward.length === 1 && !reward[0]!.props.claimed, 'Only the current reward is expanded by default.');
    assert.deepEqual(reward[0]!.props.reward, trials.kingdomTrialRewards[id]); checks += 1;
    check(!textOf(tree).includes(view.current!.lesson), 'Extra lesson details start collapsed.');
    control(tree, 'Trial lesson').onPress();
    check(control(h.render(), 'Trial lesson').accessibilityState.expanded, 'Lesson disclosure exposes its expanded state.');
    check(textOf(h.render()).includes(view.current!.lesson) && calls.length === 0, 'Opening a lesson only reveals text.');
    const progress = nodes(tree, 'View').find(node => node.props.accessibilityRole === 'progressbar')!;
    check(progress.props.accessibilityValue.now === view.current!.checks.length, 'Objective progress must reflect actual evaluator results.');
    const action = commit(tree).onConfirm;
    action(); action();
    check(calls.length === 1 && game.kingdomTrialCompletions.includes(id), 'One confirmation must record exactly one medal.');
    for (const resource of Object.keys(game.resources)) check(game.resources[resource] === walletBefore[resource] + (trials.kingdomTrialRewards[id][resource as keyof typeof game.resources] ?? 0), 'Only the exact authored reward may be added: ' + resource);
    check(protectedState(game) === before, 'Claim must leave battle, production, preference, tutorial and other-faction data untouched.');
    if (id === 'bronze') check(game.formationTrialCompleted, 'The legacy Bronze completion flag must still be written.');
    let after = h.render();
    check(commit(after).message.includes('recorded'), 'Success feedback needs reflected completion state.');
    const recordButton = control(after, presentation.trialMedalNames[id] + ' medal record');
    check(recordButton.accessibilityState.expanded === false, 'Completed records start collapsed.');
    recordButton.onPress(); after = h.render();
    check(nodes(after, 'TrialRewardSummary').some(node => node.props.claimed), 'Expanded history must identify rewards as already claimed.');
    check(calls.length === 1, 'Expanding history must never reclaim a medal.');
    const reopened = harness(game); const report = reopened.render();
    check(commit(report).label === 'Return to Campaign', 'A chapter-gated or finished track must not expose another claim.');
    action(); check(calls.length === 1, 'Old completed-trial handlers cannot replay the reward.');
    commit(after).onConfirm(); check(exits === 1 && edits === 0, 'Finished or chapter-gated track keeps the normal return route.');
    reopened.dispose(); h.dispose();
  }
}
function testGatesAndVisibility() {
  for (const faction of ['human', 'elf', 'orc'] as const) for (let chapter = 1; chapter <= 4; chapter += 1) {
    for (let completed = 0; completed <= 3; completed += 1) {
      const { game, calls } = fixture(faction, 'bronze');
      game.chapterNumber = chapter; game.kingdomTrialCompletions = trials.kingdomTrialOrder.slice(0, completed);
      const view = presentation.getKingdomTrialView(game);
      const next = trials.kingdomTrialOrder[completed] ?? null;
      const expected = next && trials.isKingdomTrialUnlocked(next, game.kingdomTrialCompletions, chapter) ? next : null;
      check(view.currentId === expected, 'Respect authored chapter and previous-medal gates.');
      const h = harness(game); const tree = h.render();
      for (const item of view.track) {
        if (!item.claimed && !item.current) {
          const future = trials.evaluateKingdomTrial(item.id, { faction, ...setup(faction, item.id) });
          check(item.record === null && !textOf(tree).includes(future.title) && !textOf(tree).includes(future.lesson), 'Future titles and lessons must remain hidden.');
          check(!nodes(tree, 'Pressable').some(node => node.props.accessibilityLabel === item.name + ' medal record'), 'Locked medals must not expose a history disclosure.');
        }
      }
      check(calls.length === 0, 'Gate inspection is read-only.'); h.dispose();
    }
  }
  const { game } = fixture('human', 'bronze');
  game.kingdomTrialCompletions = ['silver'];
  check(!presentation.getKingdomTrialView(game).consistent && presentation.getKingdomTrialView(game).current === null, 'Impossible records should not manufacture reward eligibility.');
  game.kingdomTrialCompletions = ['bronze', 'bronze'];
  check(presentation.getKingdomTrialView(game).completed.length === 1, 'Duplicate records must not inflate the displayed count.');
}
function testChangesAndRetries() {
  for (const faction of ['human', 'elf', 'orc'] as const) for (const id of trials.kingdomTrialOrder) {
    const { game, calls } = fixture(faction, id); let edits = 0;
    const h = harness(game, { onEditFormation: () => { edits += 1; } });
    const old = commit(h.render()).onConfirm;
    game.formation = Array(9).fill(null); let tree = h.render();
    check(commit(tree).label === 'Edit Formation', 'An unmet trial should prioritize preparation, not pretend to claim.');
    check(nodes(tree, 'SemanticChip').some(node => node.props.label === 'Still needed' && node.props.tone === 'warning'), 'Unmet objectives use labeled amber emphasis.');
    commit(tree).onConfirm(); check(edits === 1 && calls.length === 0, 'Edit action only navigates.');
    old(); check(calls.length === 0, 'A stale passing-formation handler must not claim after a change.');
    Object.assign(game, setup(faction, id)); tree = h.render();
    check(commit(tree).label.startsWith('Claim'), 'Returning with a corrected formation must update eligibility.');
    h.dispose(); commit(tree).onConfirm(); check(calls.length === 0, 'Unmounted claims must not execute.');
  }
  for (const failMode of ['return', 'throw'] as const) {
    const { game, calls } = fixture('human', 'bronze'); const real = game.completeKingdomTrial;
    let attempts = 0;
    game.completeKingdomTrial = (id: KingdomTrialId) => { attempts += 1; if (attempts === 1) { if (failMode === 'throw') throw new Error('test'); return false; } return real(id); };
    const h = harness(game); commit(h.render()).onConfirm();
    check(commit(h.render()).message.includes('could not'), 'Rejected claim must show failure, not completion.');
    commit(h.render()).onConfirm(); check(calls.length === 1 && game.kingdomTrialCompletions.includes('bronze'), 'Rejected claims remain retryable.'); h.dispose();
  }
  const pending = fixture('orc', 'bronze'); let attempts = 0;
  pending.game.completeKingdomTrial = () => { attempts += 1; return true; };
  const h = harness(pending.game); commit(h.render()).onConfirm();
  let tree = h.render(); check(commit(tree).disabled && commit(tree).message === 'Recording medal…', 'Wait for provider completion before claiming success.');
  pending.game.resources = { ...pending.game.resources, gold: 999 }; tree = h.render(); commit(tree).onConfirm();
  check(attempts === 1, 'Unrelated resource updates cannot reopen a pending claim.'); h.dispose();
  const stale = fixture('human', 'bronze'); const hs = harness(stale.game); const oldFaction = commit(hs.render()).onConfirm;
  stale.game.activeFaction = 'elf'; Object.assign(stale.game, setup('elf', 'bronze')); hs.render(); oldFaction();
  check(stale.calls.length === 0, 'Old faction handlers must not execute another faction action.'); hs.dispose();

  const sequence = fixture('human', 'bronze'); sequence.game.chapterNumber = 4;
  const joined = harness(sequence.game); commit(joined.render()).onConfirm();
  Object.assign(sequence.game, setup('human', 'silver')); let joinedTree = joined.render();
  check(commit(joinedTree).label === 'Claim Silver Medal', 'The next eligible trial becomes current without another screen.');
  commit(joinedTree).onConfirm(); Object.assign(sequence.game, setup('human', 'gold')); joinedTree = joined.render();
  check(commit(joinedTree).label === 'Claim Gold Medal', 'Gold still requires the first two recorded medals.');
  commit(joinedTree).onConfirm(); const finished = joined.render();
  check(presentation.getKingdomTrialView(sequence.game).allComplete && commit(finished).label === 'Return to Campaign', 'A fully complete track cannot loop into another reward.');
  const wallet = JSON.stringify(sequence.game.resources);
  control(finished, 'Bronze medal record').onPress(); let records = joined.render();
  control(records, 'Silver medal record').onPress(); records = joined.render();
  check(nodes(records, 'TrialRewardSummary').length === 1 && nodes(records, 'TrialRewardSummary')[0]!.props.claimed, 'Only one historical record expands at a time.');
  check(JSON.stringify(sequence.game.resources) === wallet, 'History cannot grant any resource.'); joined.dispose();
}
function testPresentation() {
  const { game } = fixture('human', 'bronze'); const h = harness(game);
  const preview = h.reward({ reward: trials.kingdomTrialRewards.bronze });
  check(nodes(preview, 'SemanticChip').some(node => node.props.label === '25 Gold' && node.props.tone === 'currency'), 'Prospective reward amounts must be explicit.');
  const historical = h.reward({ reward: trials.kingdomTrialRewards.bronze, claimed: true });
  check(nodes(historical, 'SemanticChip').every(node => node.props.tone === 'neutral') && textOf(historical).includes('not a new payout'), 'Historical rewards cannot imply an unclaimed gain.');
  check(!source.includes('onTouchEnd') && !source.includes('ScrollView'), 'Replace the old page with shared responsive controls, not a parallel legacy layout.');
  for (const theme of Object.values(themes)) for (const tone of ['blue', 'positive', 'warning', 'neutral', 'currency', 'cyan'] as const) {
    const colors = semantic.semanticChipColors(theme, tone);
    check(semantic.contrastRatio(colors.text, colors.background) >= 4.5, 'Trial semantic text contrast on ' + theme.name + '/' + tone);
  }
  h.dispose();
}

testEveryMedal(); testGatesAndVisibility(); testChangesAndRetries(); testPresentation();
console.log('PASS: ' + checks + ' Kingdom Trials UI, first-clear, gate, disclosure and provider-action checks across all factions. Native visual QA remains separate.');
