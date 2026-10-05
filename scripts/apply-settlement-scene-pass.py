"""One-shot, baseline-checked source transform; removed after the verified pass."""
from pathlib import Path
import subprocess

screen = Path('src/screens/SettlementScreen.tsx')
tests = Path('scripts/settlement-ui-regression.ts')
for path, expected in [(screen, 'facfc3ea3f84a2f87a0c7cdc8662e641e411196d'), (tests, '6a0356f0ffbf01447ec7b43814495bc74cfd1650')]:
    actual = subprocess.check_output(['git', 'hash-object', str(path)], text=True).strip()
    assert actual == expected, f'Refusing to overwrite changed baseline: {path}: {actual}'
s = screen.read_text()
def replace(old, new):
    global s
    assert s.count(old) == 1, f'Expected one screen match: {old[:100]!r}, got {s.count(old)}'
    s = s.replace(old, new)

replace("import React, { useEffect, useMemo, useState } from 'react';", "import React, { useEffect, useMemo, useRef, useState } from 'react';")
replace("import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';", "import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';")
replace("import type { ViewStyle } from 'react-native';", "import type { ViewStyle } from 'react-native';\nimport { settlementActionLayout } from '../ui/settlementActionLayout';")
replace("type SettlementBuildingAction = 'inspect' | 'move';", "type SettlementBuildingAction = 'inspect' | 'move' | 'upgrade';")
replace('    constructBuilding, moveBuilding, upgradeBuilding\n', '    constructBuilding, moveBuilding, upgradeBuilding, settlementUpgraded,\n    markedRaidersInvestigated, refugeeCampSecured, commanderPathId\n')
replace('  const [selectedBuildingAction, setSelectedBuildingAction] = useState<SettlementBuildingAction | null>(null);', '  const [selectedBuildingAction, commitBuildingAction] = useState<SettlementBuildingAction | null>(null);')
replace('  const [relocationTargetPlotId, setRelocationTargetPlotId] = useState<string | null>(null);', '''  const [relocationTargetPlotId, commitRelocationTarget] = useState<string | null>(null);
  // Invalidate old confirmation callbacks on action/target changes and on first use.
  const interactionVersion = useRef(0);
  const setSelectedBuildingAction = (action: SettlementBuildingAction | null) => {
    interactionVersion.current += 1;
    commitBuildingAction(action);
  };
  const setRelocationTargetPlotId = (plotId: string | null) => {
    interactionVersion.current += 1;
    commitRelocationTarget(plotId);
  };
  const [measuredMapWidth, setMeasuredMapWidth] = useState(0);
  const [measuredActionHeight, setMeasuredActionHeight] = useState(112);
  const [measuredActionChrome, setMeasuredActionChrome] = useState(112);''')
replace('  const selectedBuilding = buildings.find(building => building.id === selectedBuildingId) ?? null;', '''  const selectedBuilding = Object.values(buildingPlacements).includes(selectedBuildingId)
    ? buildings.find(building => building.id === selectedBuildingId) ?? null
    : null;''')
replace('  const mapWidth = Math.max(300, safeViewportWidth - 20);', '  const mapWidth = measuredMapWidth > 0 ? measuredMapWidth : Math.max(300, safeViewportWidth - 20);')

# Remove the old nested, overflowing touch strip. The replacement is a map sibling.
a = s.index("                  {buildingSelected ? (\n                    <View\n                      testID={'building-action-strip-' + building.id}")
b = s.index('                </>\n              ) : unlocked ? (', a)
s = s[:a] + s[b:]
a = s.index('          const nextUpgradeDefinition = building ?')
b = s.index('          const depthScale =', a)
s = s[:a] + s[b:]
# Details will be in the same scene card, never a second inspector below the map.
a = s.index("      ) : selectedBuilding && selectedBuildingAction === 'move' ? (")
b = s.index('      ) : selectedBuilding ? null : selectedPlot ? (', a)
s = s[:a] + s[b:]
# Repeated taps close selection; long-press always opens without spending.
replace('''                if (building) {
                  setSelectedBuildingId(building.id);
                  setSelectedBuildingAction(null);''', '''                if (building) {
                  setSelectedBuildingId(buildingSelected ? null : building.id);
                  setSelectedBuildingAction(null);''')

logic = r'''  const selectedBuildingLevel = selectedBuilding ? buildingLevels[selectedBuilding.id] ?? 0 : 0;
  const selectedNextUpgrade = selectedBuilding && selectedBuildingLevel < selectedBuilding.maxLevel
    ? getBuildingLevelDefinition(selectedBuilding.id, selectedBuildingLevel + 1) : null;
  const sourcePlotId = selectedBuilding
    ? Object.entries(buildingPlacements).find(([, id]) => id === selectedBuilding.id)?.[0] : undefined;
  const selectedCanMove = Boolean(selectedBuilding && selectedBuildingLevel > 0 && sourcePlotId) && settlementPlots.some(plot =>
    isSettlementPlotUnlocked(plot, currentWagonStage.id) && !buildingPlacements[plot.id]
  );
  const humanUpgradeGate = activeFaction !== 'human' || !selectedBuilding ? null
    : selectedBuilding.id === 'barracks' && !settlementUpgraded ? 'Establish the settlement first.'
    : selectedBuilding.id === 'forge' && !markedRaidersInvestigated ? 'Complete the Marked Raiders investigation first.'
    : selectedBuilding.id === 'quartermaster' && !refugeeCampSecured ? 'Secure the Refugee Camp first.'
    : selectedBuilding.id === 'war_room' && !commanderPathId ? 'Choose a commander path first.' : null;
  const selectedUpgradeBlocker = !selectedBuilding ? 'Select a building.'
    : selectedBuilding.role === 'KINGDOM' ? 'Settlement expansion is managed through the current Kingdom goal.'
    : selectedBuildingLevel >= selectedBuilding.maxLevel ? 'Maximum building level reached.'
    : !selectedNextUpgrade ? 'No direct next-level upgrade is listed.'
    : !isBuildingUnlocked(selectedBuilding.id) ? selectedNextUpgrade.requirement
    : selectedBuildingLevel >= maxBuildingLevelForStage ? 'Expand the settlement to unlock Level ' + (selectedBuildingLevel + 1) + '.'
    : humanUpgradeGate
    ? humanUpgradeGate
    : !canPayBuildingCost(resources, selectedNextUpgrade.cost) ? 'Missing upgrade materials. The exact shortages are listed below.' : null;
  const renderedInteractionVersion = interactionVersion.current;
  const closeBuildingSelection = () => {
    setSelectedBuildingId(null);
    setSelectedBuildingAction(null);
    setRelocationTargetPlotId(null);
    setMessage(null);
  };
  const confirmSceneUpgrade = () => {
    if (interactionVersion.current !== renderedInteractionVersion || selectedBuildingAction !== 'upgrade' ||
        !selectedBuilding || !selectedNextUpgrade || selectedUpgradeBlocker) return;
    interactionVersion.current += 1;
    const ok = upgradeBuilding(selectedBuilding.id);
    if (ok) setSelectedBuildingAction(null);
    setMessage(ok ? selectedBuilding.name + ' upgraded to Level ' + selectedNextUpgrade.level + '.'
      : 'Upgrade not completed. Recheck the current campaign requirement and resources; nothing was upgraded.');
  };
  const confirmSceneMove = () => {
    if (interactionVersion.current !== renderedInteractionVersion || !relocationMode ||
        !selectedBuilding || !relocationTargetPlotId || !relocationTarget) return;
    interactionVersion.current += 1;
    const ok = moveBuilding(selectedBuilding.id, relocationTargetPlotId);
    if (ok) {
      setSelectedBuildingAction(null);
      setRelocationTargetPlotId(null);
    }
    setMessage(ok ? 'Building relocated. District bonuses recalculated.' : 'This destination is no longer available. Choose another unlocked empty plot.');
  };
  // Android Back dismisses details/move preview first, then the selected building.
  useEffect(() => {
    if (!selectedBuilding) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedBuildingAction || relocationTargetPlotId) {
        setSelectedBuildingAction(null);
        setRelocationTargetPlotId(null);
        setMessage(null);
      } else closeBuildingSelection();
      return true;
    });
    return () => subscription.remove();
  }, [selectedBuilding?.id, selectedBuildingAction, relocationTargetPlotId]);
  useEffect(() => {
    closeBuildingSelection();
    setSelectedPlotId(null);
    setPreviewBuildingId(null);
    setBlueprintPlannerOpen(false);
    setPlanningBuildingId(null);
    setSelectedDistrictId(null);
  }, [activeFaction]);
  const actionAnchorId = relocationMode && relocationTarget ? relocationTarget.plotId : sourcePlotId;
  const actionAnchor = (actionAnchorId ? settlementPlotCenters[actionAnchorId] : null) ?? { x: 0.5, y: 0.5 };
  const actionLayout = settlementActionLayout(mapWidth, mapHeight, actionAnchor, measuredActionHeight);
  const actionDetailHeight = Math.max(64, Math.min(280,
    Math.max(actionAnchor.y, 1 - actionAnchor.y) * mapHeight - 74 - measuredActionChrome));
  const buildingDetails = selectedBuilding && selectedBuildingAction === 'inspect' ? (
    <View testID="scene-building-inspect" style={styles.sceneDetailsContent}>
      <SemanticChip label={selectedBuildingCurrentBonuses.length + ' active districts'} tone={selectedBuildingCurrentBonuses.length ? 'positive' : 'neutral'} compact />
      <BuildingLevelPreview building={selectedBuilding} level={selectedBuildingLevel} wallet={resources} />
      <SecondaryButton label="Close details" onPress={() => setSelectedBuildingAction(null)} />
    </View>
  ) : selectedBuilding && selectedBuildingAction === 'upgrade' ? (
    <View testID="scene-building-upgrade-review" style={styles.sceneDetailsContent}>
      <Text style={[styles.sceneDetailTitle, { color: theme.colors.text }]}>Upgrade review · no resources spent yet</Text>
      {selectedNextUpgrade ? <>
        <SemanticChip label={'Level ' + selectedBuildingLevel + ' → ' + selectedNextUpgrade.level} tone="blue" compact />
        <Text style={[styles.sceneDetailText, { color: theme.colors.text }]}>{selectedNextUpgrade.effect}</Text>
        <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>{selectedNextUpgrade.requirement}</Text>
        <BuildingCosts cost={selectedNextUpgrade.cost} wallet={resources} title="Upgrade cost" />
      </> : null}
      {selectedUpgradeBlocker ? <Text accessibilityLiveRegion="polite" style={[styles.sceneDetailText, { color: semanticColor(theme, 'warning') }]}>{selectedUpgradeBlocker}</Text> : null}
      {selectedNextUpgrade ? <PrimaryButton label={'Confirm upgrade to Level ' + selectedNextUpgrade.level} disabled={Boolean(selectedUpgradeBlocker)} onPress={confirmSceneUpgrade} /> : null}
      <SecondaryButton label="Cancel upgrade" onPress={() => setSelectedBuildingAction(null)} />
    </View>
  ) : selectedBuilding && relocationMode ? (
    <View testID="scene-building-move-review" style={styles.sceneDetailsContent}>
      {relocationTarget ? <>
        <Text style={[styles.sceneDetailTitle, { color: theme.colors.text }]}>Move to {settlementPlotLabels[relocationTarget.plotId] ?? relocationTarget.plotId} · free</Text>
        <View style={styles.relocationSummaryRow}>
          <SemanticChip label={'Gain +' + relocationTarget.gain} tone={relocationTarget.gain ? 'positive' : 'neutral'} compact />
          <SemanticChip label={'Lose -' + relocationTarget.loss} tone={relocationTarget.loss ? 'warning' : 'neutral'} compact />
          <SemanticChip label={'Net ' + (relocationTarget.net >= 0 ? '+' : '') + relocationTarget.net} tone={relocationTarget.tone} compact />
          <SemanticChip label={'Network ' + settlementAdjacencyBonuses.length + ' → ' + (settlementAdjacencyBonuses.length + relocationTarget.net)} tone={relocationTarget.tone} compact />
        </View>
        <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>
          {relocationTarget.gainedBonuses.length ? 'Gains ' + relocationTarget.gainedBonuses.map(bonus => bonus.name).join(' + ') + '. ' : 'No new district gained. '}
          {relocationTarget.lostBonuses.length ? 'Loses ' + relocationTarget.lostBonuses.map(bonus => bonus.name).join(' + ') + '.' : 'No current district lost.'}
        </Text>
        <PrimaryButton label="Confirm free move" onPress={confirmSceneMove} />
        <SecondaryButton label="Choose another plot" onPress={() => setRelocationTargetPlotId(null)} />
      </> : <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>
        {selectedCanMove ? 'Tap an open plot to preview a free move. Badges compare district gains and losses.' : 'No unlocked empty plot is available.'}
      </Text>}
      <SecondaryButton label="Cancel move" onPress={() => { setSelectedBuildingAction(null); setRelocationTargetPlotId(null); }} />
    </View>
  ) : null;

'''
replace('  return (\n    <ScrollView contentContainerStyle={styles.content}', logic + '  return (\n    <ScrollView contentContainerStyle={styles.content}')
replace('''      <View style={[styles.map, { height: mapHeight, backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
        <View pointerEvents="none" style={styles.backdrop}>''', '''      <View
        testID="settlement-scene"
        onLayout={event => {
          const width = event.nativeEvent.layout.width;
          if (Number.isFinite(width) && width > 0) setMeasuredMapWidth(previous => Math.abs(previous - width) < 0.5 ? previous : width);
        }}
        style={[styles.map, { height: mapHeight, backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
      >
        <Pressable testID="settlement-clear-selection" accessible={false} importantForAccessibility="no" disabled={!selectedBuilding} onPress={closeBuildingSelection} style={styles.sceneDismissSurface} />
        <View pointerEvents="none" style={styles.backdrop}>''')
overlay = r'''        {selectedBuilding ? (
          <View testID="settlement-scene-actions-layer" pointerEvents="box-none" style={styles.sceneActionsLayer}>
            <View
              testID={'building-action-strip-' + selectedBuilding.id}
              onLayout={event => {
                const height = event.nativeEvent.layout.height;
                if (Number.isFinite(height) && height > 0) setMeasuredActionHeight(previous => Math.abs(previous - height) < 0.5 ? previous : height);
              }}
              style={[styles.sceneActionStrip, { ...actionLayout, maxHeight: mapHeight - 16, backgroundColor: theme.colors.surface1, borderColor: theme.colors.gold }]}
            >
              <View onLayout={event => {
                const height = event.nativeEvent.layout.height;
                if (Number.isFinite(height) && height > 0) setMeasuredActionChrome(previous => Math.abs(previous - height) < 0.5 ? previous : height);
              }}>
                <View style={styles.sceneActionHeading}>
                  <View style={styles.sceneActionHeadingCopy}>
                    <Text style={[styles.sceneActionName, { color: theme.colors.text }]} numberOfLines={2}>{selectedBuilding.name}</Text>
                    <Text style={[styles.sceneActionLevel, { color: theme.colors.textMuted }]}>Lv.{selectedBuildingLevel} · {buildingRolePresentation[selectedBuilding.role]?.label ?? selectedBuilding.role}</Text>
                  </View>
                  <Pressable testID="building-action-close" accessibilityRole="button" accessibilityLabel="Close building actions" onPress={closeBuildingSelection} style={styles.sceneActionClose}>
                    <Text style={[styles.sceneCloseText, { color: theme.colors.text }]}>×</Text>
                  </Pressable>
                </View>
                <View style={styles.sceneActionRow}>
                  {(['inspect', 'move', 'upgrade'] as const).map(action => {
                    const active = selectedBuildingAction === action;
                    const disabled = action === 'move' && !selectedCanMove;
                    const ready = action === 'upgrade' && !selectedUpgradeBlocker;
                    const label = action === 'inspect' ? 'Inspect' : action === 'move' ? 'Move' : 'Upgrade';
                    return <Pressable
                      key={action}
                      testID={'building-action-' + action + '-' + selectedBuilding.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active, disabled }}
                      accessibilityLabel={(action === 'upgrade' ? 'Review upgrade for ' : label + ' ') + selectedBuilding.name}
                      accessibilityHint={action === 'upgrade' ? 'Review benefits, requirements and cost before confirming. Opening this review never spends resources.' : disabled ? 'No unlocked empty plot is available.' : undefined}
                      disabled={disabled}
                      onPress={() => { setSelectedBuildingAction(action); setRelocationTargetPlotId(null); setMessage(null); }}
                      style={({ pressed }) => [styles.sceneActionButton, {
                        backgroundColor: active || ready ? blendColor(theme.colors.gold, theme.colors.surface1, 0.16) : theme.colors.surface2,
                        borderColor: active ? theme.colors.gold : theme.colors.border,
                        opacity: disabled ? 0.45 : pressed ? 0.75 : 1
                      }]}
                    >
                      {ready ? <View pointerEvents="none" style={[styles.sceneActionReadyDot, { backgroundColor: theme.colors.gold }]} /> : null}
                      <Text style={[styles.sceneActionText, { color: active || ready ? theme.colors.gold : theme.colors.text }]}>{label}</Text>
                    </Pressable>;
                  })}
                </View>
                {!selectedCanMove && !buildingDetails ? <Text style={[styles.sceneFeedback, { color: theme.colors.textMuted }]}>No unlocked empty plots for moving.</Text> : null}
                {message ? <Text testID="scene-building-feedback" accessibilityLiveRegion="polite" style={[styles.sceneFeedback, { color: theme.colors.text }]}>{message}</Text> : null}
              </View>
              {buildingDetails ? <ScrollView testID="scene-building-details-scroll" nestedScrollEnabled style={{ maxHeight: actionDetailHeight }} contentContainerStyle={styles.sceneDetailsScroll}>
                {buildingDetails}
              </ScrollView> : null}
            </View>
          </View>
        ) : null}
'''
replace("        {['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id) ? (", overlay + "        {['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id) ? (")
replace("'Tap structures · marked ground = build'", "'Tap buildings for actions · marked ground = build'")
replace('{message ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.colors.text }]}>{message}</Text> : null}', '{message && !selectedBuilding ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.colors.text }]}>{message}</Text> : null}')
a = s.index('  sceneActionStrip: {')
b = s.index('\n\n  landmarkSelectionHalo:', a)
s = s[:a] + '''  sceneDismissSurface: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  sceneActionsLayer: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  sceneActionStrip: { position: 'absolute', borderWidth: 1, borderRadius: 16, padding: 6, elevation: 12, overflow: 'hidden' },
  sceneActionHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sceneActionHeadingCopy: { flex: 1, minWidth: 0, paddingLeft: 5 },
  sceneActionName: { fontSize: 13, lineHeight: 18, fontWeight: '900' },
  sceneActionLevel: { fontSize: 11, lineHeight: 16 },
  sceneActionClose: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  sceneCloseText: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
  sceneActionRow: { flexDirection: 'row', gap: 5 },
  sceneActionButton: { flex: 1, minWidth: 48, minHeight: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 4, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 3 },
  sceneActionText: { fontSize: 12, lineHeight: 17, fontWeight: '900', flexShrink: 1, textAlign: 'center' },
  sceneActionReadyDot: { width: 5, height: 5, borderRadius: 999 },
  sceneDetailsScroll: { padding: 6, paddingTop: 10 },
  sceneDetailsContent: { gap: 8 },
  sceneDetailTitle: { fontSize: 12, lineHeight: 18, fontWeight: '900' },
  sceneDetailText: { fontSize: 12, lineHeight: 18 },
  sceneFeedback: { fontSize: 12, lineHeight: 17, fontWeight: '700', padding: 6 },''' + s[b:]
screen.write_text(s)

Path('src/ui/settlementActionLayout.ts').write_text('''/** Keep scene controls within native parent bounds, preferring the clear side of the building. */
export function settlementActionLayout(
  mapWidth: number, mapHeight: number, anchor: { x: number; y: number }, measuredHeight: number
): { left: number; top: number; width: number } {
  const safe = (value: number, fallback: number) => Number.isFinite(value) && value > 0 ? value : fallback;
  const w = safe(mapWidth, 360);
  const h = safe(mapHeight, 600);
  const inset = Math.min(8, w / 4, h / 4);
  const width = Math.min(320, w - inset * 2);
  const height = Math.min(safe(measuredHeight, 112), h - inset * 2);
  const norm = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.5;
  const x = norm(anchor.x) * w;
  const y = norm(anchor.y) * h;
  const above = y - 58 - height;
  const below = y + 58;
  const preferred = above >= inset ? above : below + height <= h - inset ? below
    : y > h / 2 ? above : below;
  return {
    left: Math.max(inset, Math.min(w - inset - width, x - width / 2)),
    top: Math.max(inset, Math.min(h - inset - height, preferred)),
    width
  };
}
''')

# Extend the existing native-host interaction harness, preserving all its old coverage.
t = tests.read_text()
def treplace(old, new):
    global t
    assert t.count(old) == 1, f'Expected one test match: {old[:100]!r}, got {t.count(old)}'
    t = t.replace(old, new)
treplace("import * as requirements from '../src/ui/researchPresentation';", "import * as requirements from '../src/ui/researchPresentation';\nimport * as sceneLayout from '../src/ui/settlementActionLayout';")
treplace('  const hooks: any[] = [];', '''  const hooks: any[] = [];
  let effects: Array<() => any> = [];
  let back: (() => boolean) | null = null;''')
treplace('    useEffect: () => undefined,', '''    useEffect: (effect: () => any) => { effects.push(effect); },
    useRef: (initial: any) => {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { current: initial };
      return hooks[index];
    },''')
treplace("        Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',", "        Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',\n        BackHandler: { addEventListener: (_: string, handler: () => boolean) => { back = handler; return { remove: () => { back = null; } }; } },")
treplace("      if (request.endsWith('/settlementPresentation')) return presentation;", "      if (request.endsWith('/settlementPresentation')) return presentation;\n      if (request.endsWith('/settlementActionLayout')) return sceneLayout;")
treplace('  return { props, game, dimensions, render() { cursor = 0; return component(props); } };', '''  return { props, game, dimensions,
    render() { cursor = 0; effects = []; return component(props); },
    installBack() { return effects.find(effect => String(effect).includes('BackHandler.addEventListener'))?.(); },
    back() { return back?.() ?? false; }
  };''')
treplace("    currentWagonStage: { id: 'fort' }, buildingLevels: levels, buildingPlacements: placements,", "    currentWagonStage: { id: 'fort' }, buildingLevels: levels, buildingPlacements: placements,\n    settlementUpgraded: true, markedRaidersInvestigated: true, refugeeCampSecured: true, commanderPathId: 'test-path',")
treplace("    pressTestId(tree, 'building-action-upgrade-' + forge.id);\n    tree = f.h.render();\n    check(f.calls.length === callsBeforeContextUpgrade + 1", "    pressTestId(tree, 'building-action-upgrade-' + forge.id);\n    tree = f.h.render();\n    check(f.calls.length === callsBeforeContextUpgrade, 'Opening the scene Upgrade review must never spend resources.');\n    check(nodes(tree, 'BuildingCosts').some(node => node.props.title === 'Upgrade cost'), 'Upgrade review must expose the current cost before confirmation.');\n    const confirmation = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Confirm upgrade to Level ' + (levelBeforeContextUpgrade + 1))!;\n    confirmation.props.onPress();\n    confirmation.props.onPress();\n    tree = f.h.render();\n    check(f.calls.length === callsBeforeContextUpgrade + 1")
# Existing Move assertions already test previews, exact district effects and free transactions.
extra = r'''
function testSceneActionsSafetyAndGeometry() {
  for (const faction of ['human', 'elf', 'orc'] as const) {
    const f = fixture(faction);
    const building = f.game.buildings.find((candidate: any) => candidate.role === 'ARMY')
      ?? f.game.buildings.find((candidate: any) => candidate.id === f.game.buildingPlacements.plot_w)!;
    const source = Object.keys(f.game.buildingPlacements).find(id => f.game.buildingPlacements[id] === building.id)!;
    let tree = f.h.render();
    plot(tree, source).props.onLongPress();
    tree = f.h.render();
    const map = nodes(tree, 'View').find(node => node.props.testID === 'settlement-scene')!;
    const layer = nodes(map, 'View').find(node => node.props.testID === 'settlement-scene-actions-layer')!;
    check(Boolean(layer) && layer.props.pointerEvents === 'box-none', 'Actions must live in a pass-through scene layer.');
    for (const p of nodes(map, 'Pressable').filter(node => String(node.props.testID).startsWith('settlement-plot_'))) {
      check(!nodes(p, 'View').some(node => String(node.props.testID).startsWith('building-action-strip-')), 'No action may be nested outside a building press target.');
    }
    const action = nodes(tree, 'Pressable').find(node => node.props.testID === 'building-action-inspect-' + building.id)!;
    const actionStyle = style(action.props.style({ pressed: false }));
    check(actionStyle.minHeight >= 48 && actionStyle.minWidth >= 48, 'Contextual controls must have real 48-point touch targets.');
    check(f.calls.length === 0, 'Long-pressing a building must be read-only.');
    map.props.onLayout({ nativeEvent: { layout: { width: 300 } } });
    tree = f.h.render();
    const stripStyle = style(nodes(tree, 'View').find(node => node.props.testID === 'building-action-strip-' + building.id)!.props.style);
    check(stripStyle.left >= 8 && stripStyle.left + stripStyle.width <= 292, 'Measured map width, not the window, must bound the action card.');

    pressTestId(tree, 'building-action-upgrade-' + building.id);
    tree = f.h.render();
    const oldUpgrade = nodes(tree, 'PrimaryButton').find(node => String(node.props.label).startsWith('Confirm upgrade'))!;
    press(tree, 'Cancel upgrade');
    oldUpgrade.props.onPress();
    tree = f.h.render();
    check(f.calls.length === 0, 'A canceled upgrade callback must not spend even before the next render.');

    f.game.resources = { gold: 0, wood: 0, stone: 0, iron: 0, provisions: 0 };
    pressTestId(tree, 'building-action-upgrade-' + building.id);
    tree = f.h.render();
    check(text(tree).includes('Missing upgrade materials'), 'Unavailable upgrades need visible shortage wording.');
    check(nodes(tree, 'PrimaryButton').some(node => String(node.props.label).startsWith('Confirm upgrade') && node.props.disabled), 'Insufficient materials must disable confirmation, not the read-only review.');
    f.game.resources = { gold: 1000, wood: 1000, stone: 1000, iron: 1000, provisions: 1000 };
    f.game.currentWagonStage = { id: 'camp' };
    tree = f.h.render();
    check(text(tree).includes('Expand the settlement'), 'Tier-blocked upgrades must explain the blocker in-scene.');
    f.game.currentWagonStage = { id: 'fort' };
    f.game.buildingLevels = { ...f.game.buildingLevels, [building.id]: building.maxLevel };
    tree = f.h.render();
    check(text(tree).includes('Maximum building level'), 'Maximum level must be distinguished from affordability.');
    f.game.buildingLevels = { ...f.game.buildingLevels, [building.id]: 1 };
    f.game.currentWagonStage = { id: 'fort' };
    tree = f.h.render();
    pressTestId(tree, 'building-action-move-' + building.id);
    tree = f.h.render();
    const target = Object.keys(f.game.buildingPlacements).find(id => !f.game.buildingPlacements[id] && !plot(tree, id).props.disabled)!;
    choosePlot(tree, target);
    tree = f.h.render();
    const staleMove = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Confirm free move')!;
    const cleanup = f.h.installBack();
    check(f.h.back(), 'Android Back must consume the move preview before navigation.');
    staleMove.props.onPress();
    cleanup?.();
    tree = f.h.render();
    check(f.calls.length === 0 && !nodes(tree, 'View').some(node => node.props.testID === 'scene-building-move-review'), 'Back cancels the preview without moving or spending.');
    const cleanupSelection = f.h.installBack();
    check(f.h.back(), 'A second Back must dismiss the selected building.');
    cleanupSelection?.();
    tree = f.h.render();
    check(!nodes(tree, 'View').some(node => node.props.testID === 'settlement-scene-actions-layer'), 'Dismissed selection must remove the scene action layer.');

    choosePlot(tree, source);
    tree = f.h.render();
    pressTestId(tree, 'building-action-move-' + building.id);
    tree = f.h.render();
    choosePlot(tree, target);
    tree = f.h.render();
    const confirm = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Confirm free move')!;
    confirm.props.onPress();
    confirm.props.onPress();
    tree = f.h.render();
    check(f.calls.length === 1 && f.calls[0][0] === 'move', 'Rapid repeated move confirmation must dispatch exactly once.');
    check(nodes(tree, 'View').some(node => node.props.testID === 'scene-building-feedback'), 'Completed moves need feedback on the scene.');
    pressTestId(tree, 'settlement-clear-selection');
    tree = f.h.render();
    check(!nodes(tree, 'View').some(node => node.props.testID === 'settlement-scene-actions-layer'), 'Tapping scenery must dismiss only the selection.');
  }
  for (const width of [280, 300, 340, 392, 768]) for (const height of [600, 720, 780]) {
    for (const x of [0, 0.135, 0.5, 0.855, 1]) for (const y of [0, 0.175, 0.475, 0.835, 1]) for (const measured of [112, 240, 360, 580]) {
      const box = sceneLayout.settlementActionLayout(width, height, { x, y }, measured);
      check(box.left >= 8 && box.top >= 8 && box.left + box.width <= width - 8 && box.top + Math.min(measured, height - 16) <= height - 8, 'Every action layout must stay inside its measured native map parent.');
    }
  }
  const fallback = sceneLayout.settlementActionLayout(NaN, Infinity, { x: NaN, y: Infinity }, NaN);
  check(Object.values(fallback).every(Number.isFinite), 'Unmeasured or invalid geometry must have finite fallbacks.');
}
'''
treplace('testEffects();\ntestRecipesAndInteractions();', extra + '\ntestSceneActionsSafetyAndGeometry();\ntestEffects();\ntestRecipesAndInteractions();')
tests.write_text(t)
print('Applied scene-level actions, confirmation safety, measured layout and regression extensions.')
