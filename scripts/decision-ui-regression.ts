import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';
import { getDecisionFooterLayout, signedStat } from '../src/ui/decisionPresentation';
import * as semantic from '../src/ui/semanticColors';
import { themes } from '../src/theme/themes';

// These are interaction/model tests of the real TSX, not native rendering or screenshot tests.
// Native hosts and the provider are isolated so this runs with the existing CI dependencies.
type Element = { type: string | Function; props: Record<string, any> };
const root = process.cwd();
let assertions = 0;
function check(condition: unknown, message: string) {
  assert.ok(condition, message);
  assertions += 1;
}
function nodes(tree: any, name: string): Element[] {
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, name));
  if (!tree || typeof tree !== 'object' || !tree.type || !tree.props) return [];
  const typeName = typeof tree.type === 'string' ? tree.type : tree.type.name;
  return [
    ...(typeName === name ? [tree] : []),
    ...nodes(tree.props.children, name),
    ...nodes(tree.props.footer, name)
  ];
}
function commit(tree: any) {
  const results = nodes(tree, 'DecisionCommit');
  assert.equal(results.length, 1, 'Every screen must expose exactly one confirmation model.');
  return results[0]!.props;
}

function harness(file: string, exportName: string, game: Record<string, any>, props: Record<string, any> = {}) {
  let cursor = 0;
  const hooks: any[] = [];
  const dimensions = { width: 360, height: 800, fontScale: 1, scale: 1 };
  const appearance = { theme: themes.dark };
  const jsx = (type: Element['type'], supplied: any, ...children: any[]): Element => ({
    type,
    props: {
      ...(supplied ?? {}),
      ...(children.length ? { children: children.length === 1 ? children[0] : children } : {})
    }
  });
  const react: any = {
    __esModule: true,
    createElement: jsx,
    Fragment: 'Fragment',
    useEffect() {},
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
  const components = Object.fromEntries([
    'GameCard', 'PrimaryButton', 'SecondaryButton', 'ResourceAmountRow', 'ResourceChip',
    'UnitPortrait', 'MetricTile', 'ScreenHero', 'SectionTitle', 'StatusPill', 'Pill'
  ].map(name => [name, host(name)]));
  const art = Object.fromEntries([
    'UnitSprite', 'EquipmentSprite', 'CommanderPortrait', 'ResourceSprite'
  ].map(name => [name, host(name)]));
  const cache = new Map<string, any>();
  function load(filename: string): any {
    const absolute = resolve(root, filename);
    if (cache.has(absolute)) return cache.get(absolute);
    const source = readFileSync(absolute, 'utf8');
    const output = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
      fileName: absolute,
      reportDiagnostics: true
    });
    const errors = (output.diagnostics ?? []).filter(item => item.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, 'TSX transpile failed: ' + filename);
    const mod = { exports: {} as any };
    cache.set(absolute, mod.exports);
    const localRequire = (request: string): any => {
      if (request === 'react') return react;
      if (request === 'react-native') return {
        Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',
        StyleSheet: { create: (styles: any) => styles }, useWindowDimensions: () => dimensions
      };
      if (request.endsWith('/GameProvider')) return { useGame: () => game };
      if (request.endsWith('/ThemeProvider')) return { useGameTheme: () => ({ theme: appearance.theme }) };
      if (request.endsWith('/factions')) return { factions: {
        human: { name: 'Human' }, elf: { name: 'Elf' }, orc: { name: 'Orc' }
      } };
      if (request.endsWith('/equipment')) return { getEquipment: (id: string) => game.equipmentDefinitions?.find((item: any) => item.id === id) };
      if (request.endsWith('/components')) return components;
      if (request.endsWith('/gameArt')) return art;
      if (request.endsWith('/TutorialFocus')) return { TutorialFocus: host('TutorialFocus') };
      if (request.endsWith('/FormationShapeMiniature')) {
        return { FormationShapeMiniature: host('FormationShapeMiniature') };
      }
      if (request.endsWith('/decisionPresentation')) return { getDecisionFooterLayout, signedStat };
      if (request.endsWith('/semanticColors')) return semantic;
      if (request.endsWith('/DecisionUI') || request.endsWith('/SemanticUI')) return load(resolve(dirname(absolute), request + '.tsx'));
      throw new Error('Unexpected decision-screen dependency: ' + request);
    };
    new Function('require', 'module', 'exports', output.outputText)(localRequire, mod, mod.exports);
    cache.set(absolute, mod.exports);
    return mod.exports;
  }
  const component = load(file)[exportName];
  return {
    game, dimensions, appearance,
    render() { cursor = 0; return component(props); }
  };
}

const unit = (id: string) => ({ id, name: id, className: id + ' class', faction: 'human', role: 'frontline', tier: 2, battleTags: ['armored'], hp: 100, attack: 20, armor: 10, speed: 8, level: 2 });
const equipment = (id: string, overrides: Record<string, any> = {}) => ({
  id, name: id, faction: 'human', slot: 'weapon', tier: 1, description: id + ' description',
  requiredForgeLevel: 1, attackBonus: 5, armorBonus: 0, speedBonus: -1, ...overrides
});

function testRecruitment() {
  let recruited = 0;
  let completed = 0;
  let accepts = true;
  const game = {
    recruitOptions: ['A', 'B'].map(id => ({ id, unit: unit(id), archetype: 'Guard', pitch: 'Holds the line', tradeoff: 'Less mobile' })),
    chooseRecruit: (_id: string) => { recruited += 1; return accepts; }
  };
  const h = harness('src/screens/RecruitmentScreen.tsx', 'RecruitmentScreen', game, { onComplete: () => { completed += 1; } });
  let tree = h.render();
  check(nodes(tree, 'UnitBadges')[0]!.props.role === 'frontline', 'Recruit role must come from the real unit record.');
  check(nodes(tree, 'DecisionStats')[0]!.props.presentation === undefined, 'Absolute recruit stats must not be styled as bonuses.');
  nodes(tree, 'DecisionOption')[1]!.props.onSelect();
  check(recruited === 0, 'Selecting a recruit must not recruit or spend anything.');
  tree = h.render();
  check(commit(tree).label === 'Recruit B class', 'Confirmation must follow selected recruit.');
  const action = commit(tree).onConfirm;
  action(); action();
  check(recruited === 1 && completed === 1, 'Recruitment must commit once even with a repeated stale tap.');

  accepts = false;
  const failed = harness('src/screens/RecruitmentScreen.tsx', 'RecruitmentScreen', game);
  commit(failed.render()).onConfirm();
  check(Boolean(commit(failed.render()).message), 'Failed recruitment needs visible feedback.');
}

function testPromotion() {
  let promoted = 0;
  let completed = 0;
  const game: any = {
    units: [unit('hum_recruit')], equipmentInventory: [], equipmentDefinitions: [equipment('sword')],
    firstPromotionComplete: false,
    recruitPromotions: [{ id: 'swords', toClass: 'Swordsman', role: 'melee', pitch: 'Stronger attacks', requiredEquipmentId: 'sword', attackBonus: 5, armorBonus: 2, speedBonus: -1 }],
    promoteMira: (id: string) => { promoted += 1; game.firstPromotionComplete = true; return id === 'sword'; }
  };
  const h = harness('src/screens/PromotionScreen.tsx', 'PromotionScreen', game, {
    onOpenForge: () => {}, onComplete: () => { completed += 1; }
  });
  nodes(h.render(), 'DecisionOption')[0]!.props.onSelect();
  let tree = h.render();
  check(promoted === 0 && commit(tree).disabled, 'Selecting an unavailable promotion must not promote.');
  commit(tree).onConfirm();
  check(promoted === 0, 'Missing equipment must block confirmation as well as disable the button.');
  game.equipmentInventory = ['sword'];
  tree = h.render();
  const bonuses = nodes(tree, 'DecisionStats')[0]!.props.items;
  check(bonuses.find((item: any) => item.label === 'Class speed').value === '-1', 'Negative class tradeoffs must stay visible.');
  check(nodes(tree, 'DecisionStats')[0]!.props.presentation === 'delta', 'Class changes must use the signed bonus palette.');
  const action = commit(tree).onConfirm;
  action(); action();
  check(promoted === 1, 'Promotion must not double-commit.');
  tree = h.render();
  check(nodes(tree, 'DecisionOption').length === 0, 'Completed promotion should not keep offering obsolete path buttons.');
  commit(tree).onConfirm();
  check(completed === 1, 'Promotion completion must still return to Army.');
}

function testCommander() {
  for (const faction of ['human', 'elf', 'orc']) {
    let choices = 0;
    let returned = 0;
    const paths = ['A', 'B'].map(id => ({
      id, faction, name: id, title: 'Commander ' + id, favoredRoles: ['frontline', 'support'],
      passiveName: 'Discipline', passiveDescription: 'Supports the line', attackMultiplier: 1.1, armorMultiplier: 1.05, speedMultiplier: 1,
      skill: { name: 'Rally', description: 'Automatic battle skill', effectType: 'morale_break' }
    }));
    const game: any = {
      activeFaction: faction, resources: { gold: 10 }, commanderPaths: paths,
      commanderPathId: 'A', commanderRespecCost: 50,
      chooseCommanderPath: (id: string) => { choices += 1; game.resources = { gold: game.resources.gold - 50 }; game.commanderPathId = id; return true; }
    };
    const h = harness('src/screens/CommanderChoiceScreen.tsx', 'CommanderChoiceScreen', game, { onComplete: () => { returned += 1; } });
    let tree = h.render();
    check(nodes(tree, 'RoleChip').length === 4, 'Every favored commander role should have a labelled chip.');
    check(nodes(tree, 'DecisionStats')[0]!.props.presentation === 'multiplier', 'Commander stats must compare against ×1, not zero.');
    check(commit(tree).detail.includes('Current specialization'), faction + ' current path needs truthful cost wording.');
    commit(tree).onConfirm();
    check(returned === 1 && choices === 0, 'Returning from a current commander must not respec.');
    nodes(tree, 'DecisionOption')[1]!.props.onSelect();
    tree = h.render();
    check(commit(tree).disabled && commit(tree).warning.includes('40'), 'Unaffordable retraining needs an exact shortfall.');
    commit(tree).onConfirm();
    check(choices === 0, 'Unaffordable commander changes must not commit.');
    game.resources = { gold: 100 };
    tree = h.render();
    check(commit(tree).label.includes('50 Gold'), 'Paid retraining must show its price at confirmation.');
    const action = commit(tree).onConfirm;
    action(); action();
    check(choices === 1 && game.resources.gold === 50, 'Commander retraining must be charged once.');
    check(commit(h.render()).label === 'Return to Army', 'Commander confirmation must transition to the current specialization.');
  }
}

function forgeFixture() {
  let crafts = 0;
  let tutorialCompletions = 0;
  let exited = 0;
  const game: any = {
    resources: { gold: 100, wood: 100, iron: 100 },
    equipmentDefinitions: [
      equipment('sword'), equipment('bow'), equipment('locked', { requiredForgeLevel: 3 }),
      equipment('upgrade', { upgradeFromId: 'sword' }), equipment('elf', { faction: 'elf' })
    ],
    equipmentInventory: [], buildingLevels: { forge: 1 }, settlementAdjacencyBonuses: [], firstPromotionComplete: false,
    getEquipmentCraftCost: (item: any) => ({ gold: item.id === 'sword' ? 9 : 25, iron: 2 }),
    craftEquipment: (id: string) => {
      crafts += 1;
      game.resources = { ...game.resources, gold: game.resources.gold - (id === 'sword' ? 9 : 25), iron: game.resources.iron - 2 };
      game.equipmentInventory = [...game.equipmentInventory, id];
      return true;
    }
  };
  const h = harness('src/screens/ForgeScreen.tsx', 'ForgeScreen', game, {
    onOpenPromotion: () => {}, onExit: () => { exited += 1; },
    tutorialFocus: { kind: 'forge-craft', label: 'CRAFT' },
    onTutorialFocusComplete: () => { tutorialCompletions += 1; }
  });
  return { h, game, counts: () => ({ crafts, tutorialCompletions, exited }) };
}
function testForge() {
  const { h, game, counts } = forgeFixture();
  let tree = h.render();
  check(nodes(tree, 'DecisionOption').length === 2, 'Forge must preserve faction, level and upgrade-recipe filtering.');
  check(commit(tree).detail.includes('9 Gold'), 'Forge confirmation must use the effective provider cost.');
  nodes(tree, 'DecisionOption')[1]!.props.onSelect();
  check(counts().crafts === 0, 'Selecting a recipe must never spend resources.');
  tree = h.render();
  check(commit(tree).detail.includes('25 Gold'), 'Craft footer must track the selected recipe.');
  nodes(tree, 'DecisionOption')[0]!.props.onSelect();
  game.resources = { gold: 0, iron: 0, wood: 0 };
  tree = h.render();
  check(commit(tree).disabled && commit(tree).warning.includes('9 more Gold'), 'Craft shortfall must remain visible and exact.');
  commit(tree).onConfirm();
  check(counts().crafts === 0, 'Disabled craft handler must not spend resources.');
  game.resources = { gold: 100, iron: 100, wood: 100 };
  tree = h.render();
  check(nodes(tree, 'TutorialFocus').some(node => node.props.active), 'The Forge lesson must still expose an active tutorial target.');
  const stats = nodes(tree, 'DecisionStats')[0]!.props.items;
  check(stats.find((item: any) => item.label === 'Speed').value === '-1', 'Forge must not hide negative speed tradeoffs.');
  check(nodes(tree, 'DecisionStats')[0]!.props.presentation === 'delta', 'Forge item stats must be colored as signed bonuses.');
  check(nodes(tree, 'TierChip').length === 2 && nodes(tree, 'RarityChip').length === 0, 'Forge must label actual tiers without inventing rarity.');
  const action = commit(tree).onConfirm;
  action(); action();
  check(counts().crafts === 1 && counts().tutorialCompletions === 1, 'Craft and tutorial completion must fire exactly once for one committed snapshot.');
  commit(h.render()).onConfirm();
  check(counts().crafts === 2, 'A subsequent explicit craft after state refresh must still be allowed.');

  const later = forgeFixture();
  tree = later.h.render();
  nodes(tree, 'SecondaryButton').find(node => node.props.label === 'Craft later')!.props.onPress();
  check(later.counts().crafts === 0 && later.counts().tutorialCompletions === 1, 'Craft later must preserve tutorial skipping without spending.');
  nodes(tree, 'SecondaryButton').find(node => node.props.label === 'Return')!.props.onPress();
  check(later.counts().exited === 1, 'Forge Return must preserve its callback.');
}

function testSharedPresentation() {
  const option = harness('src/ui/DecisionUI.tsx', 'DecisionOption', {}, {
    title: 'Long commander title', subtitle: 'Current specialization', selected: true, onSelect: () => {}
  }).render();
  check(option.type === 'Pressable' && option.props.accessibilityRole === 'radio', 'Choice cards need an accessible native selection control.');
  check(option.props.accessibilityState.selected === true, 'Selection must be exposed to assistive technology.');
  check(nodes(option, 'PrimaryButton').length === 0, 'Selecting a choice card must not contain a nested commit action.');

  const h = harness('src/ui/DecisionUI.tsx', 'DecisionLayout', {}, {
    children: { type: 'ContentSentinel', props: {} }, footer: { type: 'FooterSentinel', props: {} }
  });
  let tree = h.render();
  tree.props.onLayout({ nativeEvent: { layout: { height: 680 } } });
  tree = h.render();
  check(nodes(tree, 'ScrollView').some(node => node.props.testID === 'decision-footer'), 'Tall normal-text content should keep confirmation in reach.');
  check(nodes(tree, 'FooterSentinel').length === 1, 'Confirmation must never be duplicated.');
  h.dimensions.fontScale = 2;
  tree = h.render();
  check(!nodes(tree, 'ScrollView').some(node => node.props.testID === 'decision-footer'), 'Large text must fall back to one scroll flow.');
  h.dimensions.fontScale = 1;
  tree.props.onLayout({ nativeEvent: { layout: { height: 440 } } });
  tree = h.render();
  check(!nodes(tree, 'ScrollView').some(node => node.props.testID === 'decision-footer'), 'Short screens must not lose content space to a fixed dock.');
  check(nodes(tree, 'FooterSentinel').length === 1, 'Inline mode must retain the confirmation.');
  check(signedStat(-2) === '-2' && signedStat(0) === '0' && signedStat(5) === '+5', 'Stat formatting must preserve penalties and zero values.');
  check(!getDecisionFooterLayout(Number.NaN, 1).docked, 'Unknown layout dimensions must use a safe inline fallback.');

  for (const file of ['RecruitmentScreen', 'PromotionScreen', 'CommanderChoiceScreen', 'ForgeScreen']) {
    const source = readFileSync(resolve(root, 'src/screens/' + file + '.tsx'), 'utf8');
    check(!source.includes('onTouchEnd'), file + ' must not use release-after-scroll selection handlers.');
  }
}

function testColorSemantics() {
  check(semantic.contrastRatio('#000000', '#FFFFFF') === 21, 'Contrast helper must match the known black/white ratio.');
  const tones = Object.keys(semantic.semanticPalettes.dark) as semantic.SemanticTone[];
  let minimum = Infinity;
  for (const theme of Object.values(themes)) {
    for (const tone of tones) {
      const color = semantic.semanticColor(theme, tone);
      for (const background of [theme.colors.appBg, theme.colors.surface1, theme.colors.surface2, theme.colors.surface3]) {
        const ratio = semantic.contrastRatio(color, background);
        minimum = Math.min(minimum, ratio);
        check(ratio >= 4.5, theme.name + '/' + tone + ' fails text contrast on ' + background + ': ' + ratio);
      }
      const chip = semantic.semanticChipColors(theme, tone);
      const ratio = semantic.contrastRatio(chip.text, chip.background);
      minimum = Math.min(minimum, ratio);
      check(ratio >= 4.5, theme.name + '/' + tone + ' chip label fails contrast.');
    }
  }
  console.log('Semantic palette minimum normal-state text contrast: ' + minimum.toFixed(2) + ':1 across Original, Dark and Light surfaces/chips.');

  check(semantic.statTone(100, 'absolute') === 'neutral', 'Absolute health is not a positive bonus.');
  for (const value of ['+5', 2, '+10%']) check(semantic.statTone(value, 'delta') === 'positive', 'Positive deltas should be green.');
  for (const value of ['-2', '−1', '-5%']) check(semantic.statTone(value, 'delta') === 'negative', 'Penalties should be red.');
  for (const value of ['0', '+0', 'not a stat', 'Infinity']) check(semantic.statTone(value, 'delta') === 'neutral', 'Zero/invalid deltas must be neutral.');
  check(semantic.statTone('×1.10', 'multiplier') === 'positive', 'Beneficial multipliers use the one baseline.');
  check(semantic.statTone('×1.00', 'multiplier') === 'neutral', 'An unchanged multiplier must not look like a buff.');
  check(semantic.statTone('×0.97', 'multiplier') === 'negative', 'Lower stat multipliers must read as penalties.');
  check(semantic.statTone('×0.90', 'multiplier', true) === 'positive', 'Reduced costs are beneficial when explicitly marked lower-is-better.');
  check(semantic.statTone('×1.10', 'multiplier', true) === 'negative', 'Higher costs are harmful when explicitly marked lower-is-better.');

  for (const [role, presentation] of Object.entries(semantic.rolePresentation)) {
    const tree = harness('src/ui/SemanticUI.tsx', 'RoleChip', {}, { role }).render();
    const chip = nodes(tree, 'SemanticChip')[0]!;
    check(chip.props.label === presentation.label && chip.props.tone === presentation.tone, 'Role mapping must preserve its text and consistent color.');
  }
  const traits = harness('src/ui/SemanticUI.tsx', 'UnitBadges', {}, {
    role: 'support', tier: 3, battleTags: ['ground', 'magic', 'flying', 'armored', 'support', 'magic']
  }).render();
  const labels = nodes(traits, 'SemanticChip').map(node => node.props.label);
  check(labels.join('|') === 'Magic|Flying|Armored', 'Battle badges must use authored tags without inventing or duplicating traits.');
  const chip = harness('src/ui/SemanticUI.tsx', 'SemanticChip', {}, { label: 'Flying', tone: 'cyan' });
  chip.appearance.theme = themes.light;
  const rendered = chip.render();
  const text = nodes(rendered, 'Text')[0]!;
  check(text.props.children === 'Flying', 'A badge must communicate its meaning without relying on hue.');
  check(text.props.numberOfLines === undefined, 'Trait labels must wrap instead of being silently truncated.');
  const tier = harness('src/ui/SemanticUI.tsx', 'TierChip', {}, { tier: 3 }).render();
  check(nodes(tier, 'SemanticChip')[0]!.props.label === 'Tier 3', 'A tier is not a rarity label.');
  for (const rarity of [undefined, null, 3, 'unknown', 'Tier 3', '__proto__']) {
    check(harness('src/ui/SemanticUI.tsx', 'RarityChip', {}, { rarity }).render() === null, 'Missing or invalid rarity must not create a Common/Rare label.');
  }
  for (const [rarity, presentation] of Object.entries(semantic.rarityPresentation)) {
    const result = harness('src/ui/SemanticUI.tsx', 'RarityChip', {}, { rarity }).render();
    check(nodes(result, 'SemanticChip')[0]!.props.label === presentation.label, 'Explicit rarity presentation must be retained.');
  }
  for (const value of ['+5', '-1', '0']) {
    const result = harness('src/ui/SemanticUI.tsx', 'StatValue', {}, { value, presentation: 'delta' }).render();
    check(result.props.children === value, 'Color styling must not replace or remove numeric signs.');
    const styles = result.props.style.flat(Infinity).filter(Boolean);
    check(styles[styles.length - 1].color === semantic.semanticColor(themes.dark, semantic.statTone(value, 'delta')), 'Actual StatValue must use the semantic tone.');
  }
  const mixed = '+5% attack · -2% speed · Tier 3';
  const parts = semantic.emphasisParts(mixed, 'bonuses');
  check(parts.map(part => part.text).join('') === mixed, 'Mixed bonus emphasis must preserve all visible text.');
  check(parts.filter(part => part.tone).map(part => part.tone).join('|') === 'positive|negative', 'Mixed bonuses must not color penalties green.');
  const cost = 'Retraining costs 50 Gold. Balance: 120 Gold.';
  const costParts = semantic.emphasisParts(cost, 'resources');
  check(costParts.map(part => part.text).join('') === cost && costParts.filter(part => part.tone).length === 2, 'Only resource amounts should pop within ordinary requirement text.');
}

function testFormationColorPreservation() {
  const shape = { id: 'balanced_333', layout: '3–3–3', name: 'Balanced Line', summary: 'Even depth', strength: 'Mixed armies', risk: 'No specialization', unlock: 'Start', rows: { front: [0, 1, 2], middle: [3, 4, 5], rear: [6, 7, 8] } };
  let moved = 0;
  const game: any = {
    units: [unit('A'), { ...unit('B'), role: 'ranged' }],
    formation: ['A', null, null, null, null, null, 'B', null, null],
    activeFaction: 'human', activeSquadCap: 3, formationShapeId: shape.id,
    formationShapes: [shape], activeFormationShape: shape, formationDoctrineId: 'human_balanced',
    formationDoctrines: [{ id: 'human_balanced', name: 'Balanced', description: 'Mixed army', unlock: 'Start' }],
    formationBonuses: [{ id: 'mixed', name: 'Mixed bonus', value: '+5% attack / -2% speed', description: 'Tradeoff' }],
    formationPresets: [], currentWagonStage: { id: 'camp' },
    moveFormationUnit: () => { moved += 1; return true; }, placeFormationUnit: () => true
  };
  const h = harness('src/screens/FormationScreen.tsx', 'FormationScreen', game);
  let tree = h.render();
  const slots = nodes(tree, 'Pressable').filter(node => node.props.accessibilityRole === 'button');
  check(slots.length === 9, 'Color pass must retain all nine logical formation positions.');
  check(slots[0]!.props.accessibilityLabel.includes('Frontline'), 'Formation slots must expose textual role information.');
  check(nodes(tree, 'UnitBadges').length === 2, 'Formation roster should show real role/trait badges.');
  check(nodes(tree, 'EmphasisText')[0]!.props.text === '+5% attack / -2% speed', 'Formation synergies must preserve the mixed source values.');
  slots[0]!.props.onPress();
  check(moved === 0, 'Colorized slot selection must not automatically move a squad.');
  tree = h.render();
  const selectedSlots = nodes(tree, 'Pressable').filter(node => node.props.accessibilityRole === 'button');
  check(selectedSlots[0]!.props.accessibilityState.selected, 'Role coloring must not erase selected state.');
  const border = selectedSlots[0]!.props.style.flat(Infinity).filter(Boolean).at(-1).borderColor;
  check(border === themes.dark.colors.gold, 'Gold outer highlight remains selection, not role color.');
  selectedSlots[1]!.props.onPress();
  check(moved === 1, 'Explicit placement after selection must still call the formation action.');
}

testRecruitment();
testPromotion();
testCommander();
testForge();
testSharedPresentation();
testColorSemantics();
testFormationColorPreservation();
console.log('PASS: ' + assertions + ' decision UI and semantic color interaction/model checks; native rendering still requires device QA.');
