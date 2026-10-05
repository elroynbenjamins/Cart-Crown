"""One-shot source transform. Remove this file after verified changes are published."""
from pathlib import Path
import subprocess

screen = Path('src/screens/SettlementScreen.tsx')
tests = Path('scripts/settlement-ui-regression.ts')
for path, expected in [(screen, '5c28a733ec6fb711941c1c110010ff41b0a8c5c5'), (tests, '244de9df02c9c9eed436915236a3d67cc569abc3')]:
    actual = subprocess.check_output(['git', 'hash-object', str(path)], text=True).strip()
    assert actual == expected, f'Changed baseline: {path}: {actual}'
s = screen.read_text()
def replace(old, new):
    global s
    assert s.count(old) == 1, f'Expected one screen match: {old[:100]!r}, got {s.count(old)}'
    s = s.replace(old, new)

replace('const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);', 'const [selectedPlotId, commitSelectedPlot] = useState<string | null>(null);')
replace('const [previewBuildingId, setPreviewBuildingId] = useState<string | null>(null);', '''const [previewBuildingId, commitPreviewBuilding] = useState<string | null>(null);
  const [constructionReviewOpen, commitConstructionReview] = useState(false);
  const [measuredConstructionHeight, setMeasuredConstructionHeight] = useState(250);
  const [measuredConstructionHeader, setMeasuredConstructionHeader] = useState(64);''')
replace('  const settlementPlots = getSettlementPlots(activeFaction);', '''  // Changing a construction input invalidates even a queued handler from the same render.
  const setSelectedPlotId = (id: string | null) => {
    interactionVersion.current += 1;
    commitSelectedPlot(id);
    commitConstructionReview(false);
  };
  const setPreviewBuildingId = (id: string | null) => {
    interactionVersion.current += 1;
    commitPreviewBuilding(id);
  };
  const setConstructionReviewOpen = (open: boolean) => {
    interactionVersion.current += 1;
    commitConstructionReview(open);
  };
  const settlementPlots = getSettlementPlots(activeFaction);''')
replace('  const availableBuildings = buildings.filter(building => isBuildingUnlocked(building.id) && !placedIds.includes(building.id));', '''  const availableBuildings = buildings.filter(building =>
    isBuildingUnlocked(building.id) && !placedIds.includes(building.id) && (buildingLevels[building.id] ?? 0) <= 0
  );''')
replace('    if (!selectedPlot) return [];\n    return previewBonusesAtPlot(selectedPlot, buildingId);', '''    if (!selectedPlot || buildingPlacements[selectedPlot.id] || !isSettlementPlotUnlocked(selectedPlot, currentWagonStage.id)) return [];
    return previewBonusesAtPlot(selectedPlot, buildingId);''')
# Delete the legacy below-map construction list, retaining district inspection and the idle hint.
a = s.index('      ) : selectedBuilding ? null : selectedPlot ? (')
b = s.index("      ) : (\n        <Text style={[styles.sceneHelp", a)
s = s[:a] + '      ) : selectedBuilding || selectedPlot ? null' + s[b:]
# The old branch's opening parenthesis is no longer needed for a null expression.
s = s.replace(') : selectedBuilding || selectedPlot ? null      ) : (', ') : selectedBuilding || selectedPlot ? null : (')

replace('  // Android Back dismisses details/move preview first, then the selected building.', r'''  const closeConstruction = () => {
    setSelectedPlotId(null);
    setPreviewBuildingId(null);
    setBlueprintPlannerOpen(false);
    setPlanningBuildingId(null);
    setMessage(null);
  };
  const dismissSceneSelection = () => {
    closeBuildingSelection();
    closeConstruction();
  };
  const constructionPlotAvailable = Boolean(selectedPlot && !buildingPlacements[selectedPlot.id] &&
    isSettlementPlotUnlocked(selectedPlot, currentWagonStage.id));
  const constructionBlocker = !constructionPlotAvailable ? 'This plot is no longer available. Choose another unlocked empty plot.'
    : !previewBuilding ? 'Choose an unlocked, unbuilt blueprint.'
    : !canPayBuildingCost(resources, previewBuilding.constructionCost) ? 'Materials missing. Review the exact shortages below.' : null;
  const tutorialConstructionFocused = tutorialFocus?.kind === 'settlement-building' &&
    tutorialFocus.buildingId === previewBuilding?.id;
  const confirmSceneConstruction = () => {
    if (latestInteractionRender.current !== interactionRender || interactionVersion.current !== renderedInteractionVersion ||
        !constructionReviewOpen || !selectedPlot || !previewBuilding || constructionBlocker || selectedBuilding) return;
    interactionVersion.current += 1;
    const ok = constructBuilding(previewBuilding.id, selectedPlot.id);
    if (ok) {
      setSelectedPlotId(null);
      setPreviewBuildingId(null);
      setBlueprintPlannerOpen(false);
      setPlanningBuildingId(null);
      setSelectedBuildingId(previewBuilding.id);
      setSelectedBuildingAction(null);
      setRelocationTargetPlotId(null);
      if (tutorialConstructionFocused) onTutorialFocusComplete?.();
    }
    setMessage(ok ? previewBuilding.name + ' constructed. District bonuses recalculated.'
      : 'This building cannot be constructed here yet. Recheck the plot, unlock and resources; nothing was built.');
  };
  const constructionAnchor = (selectedPlot ? settlementPlotCenters[selectedPlot.id] : null) ?? { x: 0.5, y: 0.5 };
  // Keep a clear side of the selected plot; only the card content scrolls.
  const constructionMaxHeight = Math.max(180, Math.min(380,
    Math.max(constructionAnchor.y, 1 - constructionAnchor.y) * mapHeight - 74));
  const constructionLayout = settlementActionLayout(mapWidth, mapHeight, constructionAnchor,
    Math.min(measuredConstructionHeight, constructionMaxHeight));
  const constructionScrollHeight = Math.max(64, constructionMaxHeight - measuredConstructionHeader - 16);
  // Invalidate any retained confirmation callback when the screen leaves the tree.
  useEffect(() => () => { interactionVersion.current += 1; }, []);
  // Android Back leaves a review first, then dismisses the selected plot/building.''')
replace('''    if (!selectedBuilding) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedBuildingAction || relocationTargetPlotId) {''', '''    if (!selectedBuilding && !selectedPlot) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedPlot && !selectedBuilding) {
        if (constructionReviewOpen) { setConstructionReviewOpen(false); setMessage(null); }
        else closeConstruction();
        return true;
      }
      if (selectedBuildingAction || relocationTargetPlotId) {''')
replace('  }, [selectedBuilding?.id, selectedBuildingAction, relocationTargetPlotId]);', '  }, [selectedBuilding?.id, selectedBuildingAction, relocationTargetPlotId, selectedPlot?.id, constructionReviewOpen]);')
replace('disabled={!selectedBuilding} onPress={closeBuildingSelection} style={styles.sceneDismissSurface}', 'disabled={!selectedBuilding && !selectedPlot} onPress={dismissSceneSelection} style={styles.sceneDismissSurface}')
replace('''                  const previewCandidate = planningBuilding ?? districtCandidate ?? affordableBuildings[0] ?? availableBuildings[0] ?? null;
                  setSelectedPlotId(plot.id);
                  setPreviewBuildingId(previewCandidate?.id ?? null);''', '''                  const tutorialCandidate = tutorialFocus?.kind === 'settlement-building'
                    ? availableBuildings.find(candidate => candidate.id === tutorialFocus.buildingId) ?? null : null;
                  const previewCandidate = planningBuilding ?? tutorialCandidate ?? previewBuilding ?? districtCandidate ?? affordableBuildings[0] ?? availableBuildings[0] ?? null;
                  setSelectedPlotId(plot.id);
                  setPreviewBuildingId(previewCandidate?.id ?? null);
                  setConstructionReviewOpen(Boolean(previewCandidate && (planningBuilding || tutorialCandidate || constructionReviewOpen)));''')
# Add a non-interactive ghost only for the valid plot/blueprint under review.
replace('''                  <View pointerEvents="none" style={styles.buildPlotArt}>
                    <SettlementBuildPlotSprite''', '''                  {plotSelected && previewBuilding && constructionPlotAvailable ? (
                    <View pointerEvents="none" testID="construction-ghost-preview" style={styles.constructionGhost}>
                      <BuildingSprite buildingId={previewBuilding.id} faction={activeFaction} size={62} />
                      <Text style={[styles.constructionGhostLabel, { color: theme.colors.gold, backgroundColor: theme.colors.surface1 }]}>PREVIEW</Text>
                    </View>
                  ) : null}
                  <View pointerEvents="none" style={styles.buildPlotArt}>
                    <SettlementBuildPlotSprite''')

overlay = r'''        {selectedPlot && !selectedBuilding ? (
          <View testID="settlement-construction-layer" pointerEvents="box-none" style={styles.sceneActionsLayer}>
            <View
              testID="scene-construction-card"
              onLayout={event => {
                const height = event.nativeEvent.layout.height;
                if (Number.isFinite(height) && height > 0) setMeasuredConstructionHeight(previous => Math.abs(previous - height) < 0.5 ? previous : height);
              }}
              style={[styles.sceneActionStrip, { ...constructionLayout, maxHeight: constructionMaxHeight,
                backgroundColor: theme.colors.surface1, borderColor: factionAccent }]}
            >
              <View onLayout={event => {
                const height = event.nativeEvent.layout.height;
                if (Number.isFinite(height) && height > 0) setMeasuredConstructionHeader(previous => Math.abs(previous - height) < 0.5 ? previous : height);
              }} style={styles.sceneActionHeading}>
                <View style={styles.sceneActionHeadingCopy}>
                  <Text style={[styles.sceneActionLevel, { color: factionAccent }]}>BUILD SITE · {settlementPlotLabels[selectedPlot.id] ?? selectedPlot.id}</Text>
                  <Text accessibilityRole="header" style={[styles.sceneActionName, { color: theme.colors.text }]}>
                    {constructionReviewOpen ? 'Review construction' : 'Choose a blueprint'}
                  </Text>
                </View>
                <Pressable testID="construction-close" accessibilityRole="button" accessibilityLabel="Close construction without building" onPress={closeConstruction} style={styles.sceneActionClose}>
                  <Text style={[styles.sceneCloseText, { color: theme.colors.text }]}>×</Text>
                </Pressable>
              </View>
              <ScrollView
                key={(constructionReviewOpen ? 'review:' : 'picker:') + (previewBuildingId ?? '')}
                testID="scene-construction-scroll"
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={{ maxHeight: constructionScrollHeight }}
                contentContainerStyle={styles.sceneDetailsScroll}
              >
                {message ? <Text testID="scene-construction-feedback" accessibilityLiveRegion="polite" style={[styles.sceneFeedback, { color: theme.colors.text }]}>{message}</Text> : null}
                {!constructionPlotAvailable ? (
                  <Text accessibilityLiveRegion="polite" style={[styles.sceneDetailText, { color: semanticColor(theme, 'warning') }]}>{constructionBlocker}</Text>
                ) : constructionReviewOpen ? (
                  <View testID="scene-construction-review" style={styles.sceneDetailsContent}>
                    {previewBuilding ? (
                      <TutorialFocus active={tutorialConstructionFocused} label={tutorialConstructionFocused ? tutorialFocus?.label : undefined}>
                        <View style={styles.sceneDetailsContent}>
                          <BuildingHeading building={previewBuilding} />
                          <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>Preview only · nothing built or spent yet.</Text>
                          <Text style={[styles.sceneDetailText, { color: theme.colors.text }]}>{getBuildingLevelDefinition(previewBuilding.id, 1)?.effect ?? previewBuilding.description}</Text>
                          <SemanticChip label={previewPlacementQuality.label + ' · ' + previewPlacementQuality.summary} tone={previewPlacementQuality.tone} compact />
                          <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>
                            {previewDistrictBonuses.length ? 'Activates ' + previewDistrictBonuses.map(bonus => bonus.name).join(' + ') + '.' : 'No district bonus activates here.'}
                          </Text>
                          {previewDistrictBonuses.map(bonus => <View key={bonus.id} style={[styles.preview, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface2 }]}>
                            <Text style={[styles.sceneDetailTitle, { color: theme.colors.text }]}>{bonus.name}</Text>
                            <DistrictEffects bonus={bonus} state="preview" />
                          </View>)}
                          {constructionBlocker ? <Text accessibilityLiveRegion="polite" style={[styles.sceneDetailText, { color: semanticColor(theme, 'warning') }]}>{constructionBlocker}</Text> : null}
                          <BuildingCosts cost={previewBuilding.constructionCost} wallet={resources} />
                          <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>Build places this blueprint on the {settlementPlotLabels[selectedPlot.id] ?? selectedPlot.id} plot and spends the listed construction cost once.</Text>
                          <PrimaryButton label={'Build ' + previewBuilding.name} disabled={Boolean(constructionBlocker)} onPress={confirmSceneConstruction} />
                          {tutorialConstructionFocused ? <SecondaryButton label="Build later" onPress={() => {
                            setConstructionReviewOpen(false);
                            onTutorialFocusComplete?.();
                            setMessage('Blueprint learned. Build it when the resources and timing suit your plan.');
                          }} /> : null}
                        </View>
                      </TutorialFocus>
                    ) : <Text style={[styles.sceneDetailText, { color: semanticColor(theme, 'warning') }]}>This blueprint is no longer available. Choose another blueprint.</Text>}
                    <SecondaryButton label="Choose another blueprint" onPress={() => { setConstructionReviewOpen(false); setMessage(null); }} />
                  </View>
                ) : (
                  <View testID="scene-construction-picker" style={styles.sceneDetailsContent}>
                    <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>Select a blueprint to review its cost. Selection never spends resources.</Text>
                    {previewBuilding ? <View style={styles.sceneDetailsContent}>
                      <Text style={[styles.sceneDetailTitle, { color: theme.colors.text }]}>Preview: {previewBuilding.name}</Text>
                      <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>{previewDistrictBonuses.length ? 'Activates ' + previewDistrictBonuses.map(bonus => bonus.name).join(' + ') + '.' : 'No district bonus activates here.'}</Text>
                    </View> : null}
                    {availableBuildings.map(building => {
                      const quality = settlementPlacementQuality(previewBonuses(building.id).length);
                      const affordable = canPayBuildingCost(resources, building.constructionCost);
                      const focused = tutorialFocus?.kind === 'settlement-building' && tutorialFocus.buildingId === building.id;
                      const previewed = previewBuildingId === building.id;
                      const role = buildingRolePresentation[building.role];
                      return <TutorialFocus key={building.id} active={focused} label={focused ? tutorialFocus?.label : undefined}>
                        <View testID={'settlement-blueprint-' + building.id}>
                          <Pressable
                            testID={'construction-select-' + building.id}
                            accessibilityRole="button"
                            accessibilityState={{ selected: previewed }}
                            accessibilityLabel={'Review ' + building.name + ', ' + quality.label + ' placement, ' + (affordable ? 'materials available' : 'materials missing')}
                            accessibilityHint="Shows construction benefits and cost; no resources are spent."
                            onPress={() => { setPreviewBuildingId(building.id); setConstructionReviewOpen(true); setMessage(null); if (blueprintPlannerOpen) setPlanningBuildingId(building.id); }}
                            style={({ pressed }) => [styles.constructionChoice, {
                              borderColor: previewed ? theme.colors.gold : theme.colors.border,
                              backgroundColor: theme.colors.surface2, opacity: pressed ? 0.75 : 1
                            }]}
                          >
                            <View pointerEvents="none" style={styles.constructionChoiceHeading}>
                              <BuildingSprite buildingId={building.id} faction={activeFaction} size={32} />
                              <View style={styles.sceneActionHeadingCopy}>
                                <Text style={[styles.sceneActionName, { color: theme.colors.text }]}>{building.name}</Text>
                                <Text style={[styles.sceneActionLevel, { color: semanticColor(theme, role?.tone ?? 'neutral') }]}>{role?.label ?? building.role}</Text>
                              </View>
                            </View>
                            <View pointerEvents="none" style={styles.chips}>
                              <SemanticChip label={affordable ? 'Materials available' : 'Materials missing'} tone={affordable ? 'positive' : 'warning'} compact />
                              <SemanticChip label={quality.label + ' · ' + quality.summary} tone={quality.tone} compact />
                            </View>
                          </Pressable>
                        </View>
                      </TutorialFocus>;
                    })}
                    {!availableBuildings.length ? <Text style={[styles.sceneDetailText, { color: theme.colors.textMuted }]}>No unlocked unbuilt buildings are currently available.</Text> : null}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        ) : null}
'''
replace('        {selectedBuilding ? (\n          <View testID="settlement-scene-actions-layer"', overlay + '        {selectedBuilding ? (\n          <View testID="settlement-scene-actions-layer"')
replace('{message && !selectedBuilding ? <Text accessibilityLiveRegion="polite"', '{message && !selectedBuilding && !selectedPlot ? <Text accessibilityLiveRegion="polite"')
replace('  sceneDetailsContent: { gap: 8 },', '''  sceneDetailsContent: { gap: 8 },
  constructionChoice: { minWidth: 48, minHeight: 48, borderWidth: 1, borderRadius: 12, padding: 9, gap: 5 },
  constructionChoiceHeading: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  constructionGhost: { position: 'absolute', left: '50%', top: '50%', marginLeft: -36, marginTop: -42, width: 72, alignItems: 'center', opacity: 0.65, zIndex: 7 },
  constructionGhostLabel: { fontSize: 9, lineHeight: 13, fontWeight: '900', paddingHorizontal: 5, borderRadius: 4 },''')
# Fail before writing if the obsolete spending path survived.
assert s.count('constructBuilding(') == 1, 'Construction must have exactly one guarded confirmation path.'
screen.write_text(s)

t = tests.read_text()
def treplace(old, new):
    global t
    assert t.count(old) == 1, f'Expected one test match: {old[:100]!r}, got {t.count(old)}'
    t = t.replace(old, new)
# Preserve all old assertions; explicitly open the new read-only review before its Build button.
treplace("        const cost = nodes(tree, 'BuildingCosts').find(node => node.props.cost === forge.constructionCost);", "    pressTestId(tree, 'construction-select-' + forge.id); tree = f.h.render();\n    const cost = nodes(tree, 'BuildingCosts').find(node => node.props.cost === forge.constructionCost);")
treplace("  const forge = poor.game.buildings.find((building: any) => building.role === 'EQUIPMENT');\n  press(tree, 'Build ' + forge.name);", "  const forge = poor.game.buildings.find((building: any) => building.role === 'EQUIPMENT');\n  pressTestId(tree, 'construction-select-' + forge.id); tree = poor.h.render();\n  press(tree, 'Build ' + forge.name);")
# Allow testing cleanup and faction-reset effects without running timers in this host harness.
treplace("    installBack() { return effects.find(effect => String(effect).includes('BackHandler.addEventListener'))?.(); },", "    installBack() { return effects.find(effect => String(effect).includes('BackHandler.addEventListener'))?.(); },\n    installUnmountGuard() { return effects.find(effect => /return.*interactionVersion\\.current/s.test(String(effect)) && !String(effect).includes('BackHandler'))?.(); },\n    resetFactionSelection() { return effects.find(effect => String(effect).includes('closeBuildingSelection();') && String(effect).includes('setSelectedPlotId(null)'))?.(); },")

extra = r'''
function testOnSceneConstruction() {
  for (const faction of ['human', 'elf', 'orc'] as const) {
    const f = fixture(faction);
    const forge = f.game.buildings.find((building: any) => building.role === 'EQUIPMENT')!;
    const other = f.game.buildings.find((building: any) => building.id !== forge.id && !Object.values(f.game.buildingPlacements).includes(building.id))!;
    const snapshot = () => JSON.stringify({ resources: f.game.resources, levels: f.game.buildingLevels, placements: f.game.buildingPlacements });
    const original = snapshot();
    let tree = f.h.render();
    choosePlot(tree, 'plot_nw'); tree = f.h.render();
    const scene = nodes(tree, 'View').find(node => node.props.testID === 'settlement-scene')!;
    check(nodes(scene, 'View').some(node => node.props.testID === 'scene-construction-picker'), faction + ': picker must render inside the scene.');
    check(nodes(tree, 'View').filter(node => node.props.testID === 'scene-construction-card').length === 1, 'There must be only one construction card.');
    check(!nodes(tree, 'PrimaryButton').some(node => String(node.props.label).startsWith('Build ')), 'The picker must never expose a spending action before a blueprint review.');
    check(snapshot() === original && f.calls.length === 0, 'Opening an empty plot must not change game state.');
    const choices = nodes(tree, 'Pressable').filter(node => String(node.props.testID).startsWith('construction-select-'));
    check(choices.length > 1, 'All unlocked unbuilt choices must remain available.');
    for (const choice of choices) {
      const box = style(choice.props.style({ pressed: false }));
      check(box.minWidth >= 48 && box.minHeight >= 48, 'Blueprint choices need real accessible touch targets.');
    }
    const ghost = nodes(tree, 'View').find(node => node.props.testID === 'construction-ghost-preview')!;
    check(Boolean(ghost) && ghost.props.pointerEvents === 'none', 'Preview art must not intercept the selected plot.');
    const expectedDistrict = settlement.getSettlementAdjacencyBonuses(faction).find(bonus => bonus.buildingB === forge.id)!;
    pressTestId(tree, 'construction-select-' + forge.id); tree = f.h.render();
    const review = nodes(tree, 'View').find(node => node.props.testID === 'scene-construction-review')!;
    check(Boolean(review) && !nodes(tree, 'View').some(node => node.props.testID === 'scene-construction-picker'), 'Review must replace the list instead of stacking large cards.');
    check(nodes(review, 'BuildingCosts')[0]?.props.cost === forge.constructionCost, 'Review must use the live provider construction cost.');
    check(nodes(review, 'DistrictEffects').some(node => node.props.bonus.id === expectedDistrict.id && node.props.state === 'preview'), 'Review must show exact predicted district effects.');
    check(snapshot() === original && f.calls.length === 0, 'Review, including ghost art and district effects, must remain read-only.');
    const staleReview = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Build ' + forge.name)!;
    press(tree, 'Choose another blueprint');
    staleReview.props.onPress();
    tree = f.h.render();
    check(f.calls.length === 0, 'Returning to the picker must invalidate a queued Build callback immediately.');
    pressTestId(tree, 'construction-select-' + other.id); tree = f.h.render();
    const otherBuild = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Build ' + other.name)!;
    check(Boolean(otherBuild) && !nodes(tree, 'PrimaryButton').some(node => node.props.label === 'Build ' + forge.name), 'Only the reviewed blueprint may be built.');
    staleReview.props.onPress();
    check(f.calls.length === 0, 'A prior blueprint confirmation cannot build the old choice.');
    choosePlot(tree, 'plot_n');
    otherBuild.props.onPress();
    tree = f.h.render();
    check(f.calls.length === 0 && snapshot() === original, 'Changing the selected plot must invalidate old confirmations before render.');
    check(text(tree).includes('BUILD SITE') && text(tree).includes('North'), 'The review must name its new destination plot.');

    const cleanupBack = f.h.installBack();
    check(f.h.back(), 'Back must return from construction review to the picker.');
    cleanupBack?.(); tree = f.h.render();
    check(nodes(tree, 'View').some(node => node.props.testID === 'scene-construction-picker'), 'Back should preserve the selected plot on the first dismissal.');
    const cleanupPicker = f.h.installBack();
    check(f.h.back(), 'A second Back must close the selected build site.');
    cleanupPicker?.(); tree = f.h.render();
    check(!nodes(tree, 'View').some(node => node.props.testID === 'scene-construction-card'), 'Back must leave no hidden construction card.');

    choosePlot(tree, 'plot_nw'); tree = f.h.render();
    pressTestId(tree, 'construction-select-' + forge.id); tree = f.h.render();
    const beforeClose = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Build ' + forge.name)!;
    pressTestId(tree, 'construction-close'); beforeClose.props.onPress(); tree = f.h.render();
    check(f.calls.length === 0 && !nodes(tree, 'View').some(node => node.props.testID === 'construction-ghost-preview'), 'Close must cancel confirmations and clear preview art.');

    choosePlot(tree, 'plot_nw'); tree = f.h.render();
    pressTestId(tree, 'construction-select-' + forge.id); tree = f.h.render();
    const oldWalletBuild = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Build ' + forge.name)!;
    f.game.resources = { gold: 0, wood: 0, stone: 0, iron: 0, provisions: 0 }; tree = f.h.render();
    oldWalletBuild.props.onPress();
    const poorBuild = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Build ' + forge.name)!;
    poorBuild.props.onPress();
    check(poorBuild.props.disabled && text(tree).includes('Materials missing') && f.calls.length === 0, 'Changed and insufficient resources must disable and guard construction.');
    f.game.resources = { gold: 500, wood: 500, stone: 500, iron: 500, provisions: 500 };
    f.locked.add(forge.id); tree = f.h.render();
    check(!nodes(tree, 'PrimaryButton').some(node => String(node.props.label).startsWith('Build ')), 'A blueprint that becomes locked must lose its Build action.');
    check(text(tree).includes('no longer available'), 'A newly unavailable blueprint must explain its state.');
    f.locked.delete(forge.id); tree = f.h.render();
    const beforeTaken = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Build ' + forge.name)!;
    f.game.buildingPlacements = { ...f.game.buildingPlacements, plot_nw: other.id }; f.refresh(); tree = f.h.render();
    beforeTaken.props.onPress();
    check(f.calls.length === 0 && text(tree).includes('plot is no longer available'), 'A plot occupied during review must be blocked, never overwritten.');
    check(!nodes(tree, 'View').some(node => node.props.testID === 'construction-ghost-preview'), 'An invalid destination must not keep ghost art.');
    f.game.buildingPlacements = { ...f.game.buildingPlacements, plot_nw: null }; f.refresh(); tree = f.h.render();
    f.fail(true); press(tree, 'Build ' + forge.name); tree = f.h.render();
    check(nodes(tree, 'Text').some(node => node.props.testID === 'scene-construction-feedback') && text(tree).includes('cannot be constructed'), 'A rejected provider transaction must leave the review and failure feedback on the scene.');
    f.fail(false);
    const attempts = f.calls.length;
    const beforeSuccess = { ...f.game.resources };
    const confirmation = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Build ' + forge.name)!;
    confirmation.props.onPress(); confirmation.props.onPress(); tree = f.h.render();
    check(f.calls.length === attempts + 1 && f.calls.at(-1)?.[0] === 'build', 'Repeated Build confirmation must dispatch only one construction transaction.');
    check(f.game.buildingPlacements.plot_nw === forge.id && f.game.buildingLevels[forge.id] === 1, 'Successful construction must place exactly the reviewed blueprint at Level 1.');
    for (const [resource, amount] of Object.entries(forge.constructionCost)) check(f.game.resources[resource] === beforeSuccess[resource] - Number(amount), 'Each authored material cost must be spent exactly once.');
    check(nodes(tree, 'View').some(node => node.props.testID === 'building-action-strip-' + forge.id), 'Successful construction must hand off to the new building actions.');
    check(!nodes(tree, 'View').some(node => node.props.testID === 'scene-construction-card' || node.props.testID === 'construction-ghost-preview'), 'Successful construction must clear all temporary picker/review art.');
    check(f.game.settlementAdjacencyBonuses.some((bonus: any) => bonus.id === expectedDistrict.id), 'Committed districts must match the construction preview.');
  }

  const none = fixture('human');
  none.game.buildings.forEach((building: any) => none.locked.add(building.id));
  choosePlot(none.h.render(), 'plot_nw'); let tree = none.h.render();
  check(text(tree).includes('No unlocked unbuilt buildings'), 'An empty catalog needs an on-scene explanation.');
  pressTestId(tree, 'settlement-clear-selection'); tree = none.h.render();
  check(!nodes(tree, 'View').some(node => node.props.testID === 'scene-construction-card'), 'Scenery dismissal must close an empty catalog.');

  const tutorial = fixture('human', { kind: 'settlement-building', buildingId: 'quartermaster', label: 'BUILD SUPPLY' });
  choosePlot(tutorial.h.render(), 'plot_nw'); tree = tutorial.h.render();
  check(nodes(tree, 'BuildingHeading').some(node => node.props.building.id === 'quartermaster'), 'A first-time building tutorial must select its requested blueprint, not a more profitable district alternative.');
  const staleTutorialBuild = nodes(tree, 'PrimaryButton').find(node => String(node.props.label).startsWith('Build '))!;
  press(tree, 'Build later'); staleTutorialBuild.props.onPress();
  check(tutorial.calls.length === 0 && tutorial.counts().completed === 1, 'Build later must invalidate queued construction and only finish the teaching step.');

  const unmount = fixture('elf');
  choosePlot(unmount.h.render(), 'plot_nw'); tree = unmount.h.render();
  const candidate = unmount.game.buildings.find((building: any) => building.role === 'EQUIPMENT')!;
  pressTestId(tree, 'construction-select-' + candidate.id); tree = unmount.h.render();
  const retained = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Build ' + candidate.name)!;
  const cleanup = unmount.h.installUnmountGuard();
  check(typeof cleanup === 'function', 'The construction screen needs an unmount invalidation guard.');
  cleanup?.(); retained.props.onPress();
  check(unmount.calls.length === 0, 'Unmounted construction confirmations must not mutate a save.');

  const switched = fixture('human');
  choosePlot(switched.h.render(), 'plot_nw'); tree = switched.h.render();
  pressTestId(tree, 'construction-select-forge'); tree = switched.h.render();
  const previousFaction = nodes(tree, 'PrimaryButton').find(node => node.props.label === 'Build Field Forge')!;
  switched.game.activeFaction = 'orc'; switched.game.buildings = kingdom.getBuildings('orc');
  switched.game.buildingPlacements = settlement.getInitialSettlementPlacements('orc');
  tree = switched.h.render(); switched.h.resetFactionSelection(); previousFaction.props.onPress(); tree = switched.h.render();
  check(switched.calls.length === 0 && !nodes(tree, 'View').some(node => node.props.testID === 'scene-construction-card'), 'Faction change must clear construction and reject callbacks from the old faction.');
}
'''
treplace('testSceneActionsSafetyAndGeometry();\ntestEffects();', extra + '\ntestOnSceneConstruction();\ntestSceneActionsSafetyAndGeometry();\ntestEffects();')
tests.write_text(t)
print('Applied on-scene blueprint picker, safe construction review, ghost preview, handoff and all-faction regression coverage.')
