import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import {
  analyzeSettlementAdjacency, getSettlementAdjacencyBonuses,
  getSettlementPlots, isSettlementPlotUnlocked
} from '../game/settlement';
import { canPayBuildingCost } from '../game/kingdom';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SecondaryButton, SectionTitle } from '../ui/components';
import { BuildingSprite, LockIcon, PlotTerrainSprite, SettlementTerrainBackdrop } from '../ui/gameArt';
import { SemanticChip, SemanticText } from '../ui/SemanticUI';
import { semanticColor } from '../ui/semanticColors';
import { BuildingCosts, BuildingHeading, BuildingLevelPreview, DistrictEffects } from '../ui/SettlementUI';
import { buildingRolePresentation, districtRecipePresentation, districtRecipeState } from '../ui/settlementPresentation';
import { TutorialFocus } from '../ui/TutorialFocus';
import type { TutorialFocusTarget } from '../game/tutorial';

export function SettlementScreen({ onExit, tutorialFocus, onTutorialFocusComplete }: {
  onExit: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
}) {
  const { theme } = useGameTheme();
  const { fontScale } = useWindowDimensions();
  const {
    activeFaction, resources, currentWagonStage, buildings, buildingLevels,
    buildingPlacements, settlementAdjacencyBonuses, isBuildingUnlocked,
    constructBuilding, moveBuilding
  } = useGame();
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const settlementPlots = getSettlementPlots(activeFaction);
  const adjacencyRecipes = getSettlementAdjacencyBonuses(activeFaction);
  const factionAccent = activeFaction === 'elf' ? theme.colors.elf : activeFaction === 'orc' ? theme.colors.orc : theme.colors.human;
  const selectedPlot = settlementPlots.find(plot => plot.id === selectedPlotId) ?? null;
  const selectedBuilding = buildings.find(building => building.id === selectedBuildingId) ?? null;
  const placedIds = useMemo(() => Object.values(buildingPlacements).filter((value): value is string => Boolean(value)), [buildingPlacements]);
  const availableBuildings = buildings.filter(building => isBuildingUnlocked(building.id) && !placedIds.includes(building.id));
  const guidedPlotId = (
    tutorialFocus?.kind === 'settlement-first-plot' || tutorialFocus?.kind === 'settlement-building'
  ) && !selectedPlotId
    ? settlementPlots.find(plot => isSettlementPlotUnlocked(plot, currentWagonStage.id) && !buildingPlacements[plot.id])?.id ?? null
    : null;
  const activeBonusIds = new Set(settlementAdjacencyBonuses.map(bonus => bonus.id));

  // Read-only preview, using the same adjacency calculation as the game. No costs or levels are committed here.
  const previewBonuses = (buildingId: string) => {
    if (!selectedPlot) return [];
    return analyzeSettlementAdjacency(
      { ...buildingPlacements, [selectedPlot.id]: buildingId },
      { ...buildingLevels, [buildingId]: Math.max(1, buildingLevels[buildingId] ?? 0) },
      activeFaction
    ).bonuses.filter(bonus => !activeBonusIds.has(bonus.id));
  };

  const stageLabel = activeFaction === 'elf'
    ? currentWagonStage.id === 'capital' ? 'STARROOT CONCLAVE'
      : currentWagonStage.id === 'stronghold' ? 'WORLDROOT SANCTUARY'
      : currentWagonStage.id === 'town' ? 'HEARTGROVE ENCLAVE'
      : currentWagonStage.id === 'fort' ? 'HEARTGROVE WARDHOLD'
      : currentWagonStage.id === 'settlement' ? 'HEARTGROVE SANCTUARY' : 'HEARTGROVE REFUGE'
    : activeFaction === 'orc'
      ? currentWagonStage.id === 'capital' ? 'WARFIRE CONFEDERACY'
        : currentWagonStage.id === 'stronghold' ? 'EMBERCLAN HIGH WARHOLD'
        : currentWagonStage.id === 'town' ? 'EMBERCLAN GREAT WARHOLD'
        : currentWagonStage.id === 'fort' ? 'EMBERCLAN WARHOLD'
        : currentWagonStage.id === 'settlement' ? 'EMBERCLAN WARCAMP' : 'EMBERCLAN CAMP'
      : currentWagonStage.id === 'grand' ? 'GREENKEEP GRAND CAMPAIGN'
        : currentWagonStage.id === 'capital' ? 'GREENKEEP CAPITAL'
        : currentWagonStage.id === 'stronghold' ? 'GREENKEEP STRONGHOLD'
        : currentWagonStage.id === 'town' ? 'GREENKEEP TOWN'
        : currentWagonStage.id === 'fort' ? 'GREENKEEP FORT'
        : currentWagonStage.id === 'settlement' ? 'GREENKEEP SETTLEMENT' : 'REFUGEE CAMP';
  const mapHeight = Math.max(390, Math.ceil(370 * Math.max(1, Number.isFinite(fontScale) ? fontScale : 1)));

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={factionAccent} ornament={false}>
        <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>SETTLEMENT</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>{stageLabel}</Text>
        <View style={styles.chips}>
          <SemanticChip label={placedIds.length + ' built'} tone="neutral" compact />
          <SemanticChip label={settlementAdjacencyBonuses.length + ' active districts'} tone={settlementAdjacencyBonuses.length ? 'positive' : 'neutral'} compact />
          <SemanticChip label="Relocation is free" tone="cyan" compact />
        </View>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Tap an empty plot to build. Tap a structure to inspect its levels or move it to an empty unlocked plot. Districts connect up, down, left or right—not diagonally.
        </Text>
      </GameCard>

      <View style={[styles.map, { height: mapHeight, backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <SettlementTerrainBackdrop faction={activeFaction} />
          <View style={[styles.roadHorizontal, { backgroundColor: theme.colors.surface3 }]} />
          <View style={[styles.roadVertical, { backgroundColor: theme.colors.surface3 }]} />
        </View>
        {settlementPlots.map(plot => {
          const unlocked = isSettlementPlotUnlocked(plot, currentWagonStage.id);
          const buildingId = buildingPlacements[plot.id] ?? null;
          const building = buildingId ? buildings.find(candidate => candidate.id === buildingId) ?? null : null;
          const level = building ? buildingLevels[building.id] ?? 0 : 0;
          const plotSelected = selectedPlotId === plot.id;
          const buildingSelected = Boolean(building) && selectedBuildingId === building?.id;
          const tutorialPlotFocused = guidedPlotId === plot.id;
          const roleTone = building ? buildingRolePresentation[building.role]?.tone ?? 'neutral' : 'neutral';
          const roleColor = semanticColor(theme, roleTone);
          const selected = plotSelected || buildingSelected;
          const districtCount = building ? settlementAdjacencyBonuses.filter(bonus => bonus.buildingA === building.id || bonus.buildingB === building.id).length : 0;
          return (
            <Pressable
              key={plot.id}
              testID={'settlement-' + plot.id}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: !unlocked }}
              accessibilityLabel={building
                ? building.name + ', ' + (buildingRolePresentation[building.role]?.label ?? building.role) + ', Level ' + level + ', ' + districtCount + ' active districts'
                : plot.id.replace('plot_', 'Plot ') + (unlocked ? ', empty' : ', locked until ' + plot.unlockStage)}
              accessibilityHint={!unlocked ? undefined : building ? 'Inspect levels or select this building to relocate.' : selectedBuildingId ? 'Move the selected building here for free.' : 'Show construction choices. Selecting a plot does not spend resources.'}
              disabled={!unlocked}
              onPress={() => {
                setMessage(null);
                if (building) {
                  setSelectedBuildingId(buildingSelected ? null : building.id);
                  setSelectedPlotId(null);
                  return;
                }
                if (selectedBuildingId) {
                  const ok = moveBuilding(selectedBuildingId, plot.id);
                  setMessage(ok ? 'Building relocated. District bonuses recalculated.' : 'That building cannot be moved to this plot.');
                  if (ok) setSelectedBuildingId(null);
                  return;
                }
                setSelectedPlotId(plotSelected ? null : plot.id);
                if (tutorialPlotFocused && tutorialFocus?.kind === 'settlement-first-plot') onTutorialFocusComplete?.();
              }}
              style={[
                styles.plot,
                {
                  left: (String(5 + plot.column * 32) + '%') as ViewStyle['left'],
                  top: (String(7 + plot.row * 31) + '%') as ViewStyle['top'],
                  backgroundColor: building ? theme.colors.surface2 : unlocked ? theme.colors.appBg : theme.colors.surface3,
                  borderColor: tutorialPlotFocused || selected ? theme.colors.gold : building ? roleColor : theme.colors.border,
                  borderWidth: tutorialPlotFocused || selected ? 3 : 1.5,
                  transform: tutorialPlotFocused ? [{ scale: 1.05 }] : undefined
                }
              ]}
            >
              {tutorialPlotFocused ? (
                <View pointerEvents="none" style={[styles.plotGuideBadge, { backgroundColor: theme.colors.gold }]}>
                  <Text style={styles.plotGuideText}>{tutorialFocus?.kind === 'settlement-building' ? 'TAP EMPTY PLOT' : tutorialFocus?.label}</Text>
                </View>
              ) : null}
              {building ? (
                <>
                  <BuildingSprite buildingId={building.id} faction={building.faction} size={44} />
                  <Text style={[styles.plotBuildingName, { color: roleColor }]} numberOfLines={2}>{building.name}</Text>
                  <SemanticText tone="neutral" style={styles.plotLevel}>Lv.{level}</SemanticText>
                </>
              ) : unlocked ? (
                <>
                  <Text style={[styles.emptyPlus, { color: selected || selectedBuildingId ? theme.colors.gold : semanticColor(theme, 'neutral') }]}>+</Text>
                  <SemanticText tone="neutral" style={styles.emptyText}>{selectedBuildingId ? 'Move here' : 'Empty'}</SemanticText>
                  <View style={styles.terrain}><PlotTerrainSprite terrain={plot.terrain} color={theme.colors.textMuted} size={24} /></View>
                </>
              ) : (
                <>
                  <LockIcon color={semanticColor(theme, 'neutral')} size={25} />
                  <SemanticText tone="neutral" style={styles.lockText}>{plot.unlockStage}</SemanticText>
                </>
              )}
            </Pressable>
          );
        })}
        {['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id) ? (
          <>
            <View pointerEvents="none" style={[styles.wallTop, { borderColor: theme.colors.gold }]} />
            <View pointerEvents="none" style={[styles.wallBottom, { borderColor: theme.colors.gold }]} />
            <Text pointerEvents="none" style={[styles.gateLabel, { color: theme.colors.textMuted }]}>
              {currentWagonStage.id === 'grand' ? 'GRAND GATE' : currentWagonStage.id === 'capital' ? 'CAPITAL GATE' : currentWagonStage.id === 'stronghold' ? 'STRONGHOLD GATE' : currentWagonStage.id === 'town' ? 'TOWN GATE' : 'FORT GATE'}
            </Text>
          </>
        ) : null}
      </View>
      <View style={styles.chips}>
        <SemanticChip label="Color = building purpose" tone="neutral" compact />
        <SemanticChip label="Gold outline = selected" tone="currency" compact />
      </View>

      {selectedBuilding ? (
        <GameCard accent={theme.colors.gold} ornament={false}>
          <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>SELECTED BUILDING</Text>
          <View style={styles.section}><BuildingHeading building={selectedBuilding} level={buildingLevels[selectedBuilding.id] ?? 0} /></View>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>Tap any empty unlocked plot to relocate. Levels and upgrades are preserved; district bonuses update immediately.</Text>
          <View style={styles.button}><SecondaryButton label="Cancel move" onPress={() => setSelectedBuildingId(null)} /></View>
          <BuildingLevelPreview building={selectedBuilding} level={buildingLevels[selectedBuilding.id] ?? 0} wallet={resources} />
          <View style={styles.button}><SecondaryButton label="Review upgrades in Kingdom" onPress={onExit} /></View>
        </GameCard>
      ) : selectedPlot ? (
        <>
          <SectionTitle title="Construct Building" trailing={selectedPlot.id.replace('plot_', '').toUpperCase()} />
          {availableBuildings.length ? (
            <View style={styles.list}>
              {availableBuildings.map(building => {
                const potentialBonuses = previewBonuses(building.id);
                const affordable = canPayBuildingCost(resources, building.constructionCost);
                const tutorialBuildingFocused = tutorialFocus?.kind === 'settlement-building' && tutorialFocus.buildingId === building.id;
                const roleColor = semanticColor(theme, buildingRolePresentation[building.role]?.tone ?? 'neutral');
                return (
                  <TutorialFocus key={building.id} active={tutorialBuildingFocused} label={tutorialBuildingFocused ? tutorialFocus.label : undefined}>
                    <GameCard accent={roleColor} ornament={false}>
                      <BuildingHeading building={building} />
                      <Text style={[styles.body, { color: theme.colors.textMuted }]}>{building.description}</Text>
                      <View style={styles.chips}><SemanticChip label={affordable ? 'Materials available' : 'Materials missing'} tone={affordable ? 'positive' : 'warning'} compact /></View>
                      <BuildingCosts cost={building.constructionCost} wallet={resources} />
                      {potentialBonuses.length ? (
                        <View style={styles.section}>
                          <SemanticChip label="Would activate on this plot" tone="blue" compact />
                          {potentialBonuses.map(bonus => (
                            <View key={bonus.id} style={[styles.preview, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface2 }]}>
                              <Text style={[styles.bonusName, { color: theme.colors.text }]}>{bonus.name}</Text>
                              <DistrictEffects bonus={bonus} state="preview" />
                            </View>
                          ))}
                        </View>
                      ) : null}
                      <View style={styles.button}>
                        <PrimaryButton
                          label={'Build ' + building.name}
                          disabled={!affordable}
                          onPress={() => {
                            const ok = constructBuilding(building.id, selectedPlot.id);
                            setMessage(ok ? building.name + ' constructed. District bonuses recalculated.' : 'This building cannot be constructed here yet.');
                            if (ok) {
                              setSelectedPlotId(null);
                              if (tutorialBuildingFocused) onTutorialFocusComplete?.();
                            }
                          }}
                        />
                        {tutorialBuildingFocused ? (
                          <View style={styles.button}>
                            <SecondaryButton label="Build later" onPress={() => {
                              onTutorialFocusComplete?.();
                              setMessage('Blueprint learned. Build it when the resources and timing suit your plan.');
                            }} />
                          </View>
                        ) : null}
                      </View>
                    </GameCard>
                  </TutorialFocus>
                );
              })}
            </View>
          ) : <GameCard ornament={false}><Text style={[styles.body, { color: theme.colors.textMuted }]}>No unlocked unbuilt buildings are currently available.</Text></GameCard>}
        </>
      ) : <GameCard ornament={false}><Text style={[styles.body, { color: theme.colors.textMuted }]}>Choose an empty plot to see construction costs and possible district bonuses, or select a built structure to inspect its levels and relocate it.</Text></GameCard>}

      <SectionTitle title="Active District Bonuses" trailing={String(settlementAdjacencyBonuses.length)} />
      {settlementAdjacencyBonuses.length ? (
        <View style={styles.list}>
          {settlementAdjacencyBonuses.map(bonus => (
            <GameCard key={bonus.id} accent={semanticColor(theme, 'positive')} ornament={false}>
              <Text style={[styles.bonusName, { color: theme.colors.text }]}>{bonus.name}</Text>
              <View style={styles.chips}><SemanticChip label="Active" tone="positive" compact /></View>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>{bonus.description}</Text>
              <DistrictEffects bonus={bonus} state="active" />
            </GameCard>
          ))}
        </View>
      ) : <GameCard ornament={false}><Text style={[styles.body, { color: theme.colors.textMuted }]}>No district synergy is active yet. Compatible buildings must be built and adjacent.</Text></GameCard>}

      <SectionTitle title="District Recipes" trailing="Orthogonal" />
      <GameCard ornament={false}>
        {adjacencyRecipes.map(bonus => {
          const first = buildings.find(building => building.id === bonus.buildingA);
          const second = buildings.find(building => building.id === bonus.buildingB);
          const state = districtRecipeState(bonus, activeBonusIds, buildingLevels, buildingPlacements, isBuildingUnlocked);
          return (
            <View key={bonus.id} style={[styles.recipe, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.bonusName, { color: theme.colors.text }]}>{bonus.name}</Text>
              <View style={styles.chips}><SemanticChip {...districtRecipePresentation[state]} compact /></View>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>{first?.name ?? bonus.buildingA} + {second?.name ?? bonus.buildingB}</Text>
              <DistrictEffects bonus={bonus} state={state === 'active' ? 'active' : 'inactive'} />
            </View>
          );
        })}
      </GameCard>
      {message ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.colors.text }]}>{message}</Text> : null}
      <SecondaryButton label="Return to Kingdom" onPress={onExit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 13 },
  eyebrow: { fontSize: 11, lineHeight: 16, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  section: { gap: 8, marginTop: 12 },
  map: { borderRadius: 22, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  roadHorizontal: { position: 'absolute', left: '0%', top: '46%', width: '100%', height: 28, opacity: 0.65 },
  roadVertical: { position: 'absolute', left: '46%', top: '0%', width: 28, height: '100%', opacity: 0.65 },
  plot: { position: 'absolute', width: '27%', height: '25%', borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 5 },
  plotGuideBadge: { position: 'absolute', top: -12, right: -8, zIndex: 5, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  plotGuideText: { color: '#111318', fontSize: 8, lineHeight: 11, fontWeight: '900' },
  plotBuildingName: { fontSize: 11, lineHeight: 15, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  plotLevel: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  emptyPlus: { fontSize: 28, fontWeight: '600' },
  emptyText: { fontSize: 12, lineHeight: 17, fontWeight: '800' },
  terrain: { position: 'absolute', right: 5, bottom: 4, alignItems: 'center', justifyContent: 'center' },
  lockText: { fontSize: 11, lineHeight: 16, fontWeight: '800', textTransform: 'uppercase', marginTop: 4 },
  wallTop: { position: 'absolute', left: '3%', right: '3%', top: 3, borderTopWidth: 2, opacity: 0.75 },
  wallBottom: { position: 'absolute', left: '3%', right: '3%', bottom: 3, borderBottomWidth: 2, opacity: 0.75 },
  gateLabel: { position: 'absolute', bottom: 7, alignSelf: 'center', fontSize: 9, lineHeight: 12, fontWeight: '900' },
  list: { gap: 10 },
  button: { marginTop: 10 },
  bonusName: { fontSize: 16, lineHeight: 22, fontWeight: '900' },
  preview: { borderWidth: 1, borderRadius: 12, padding: 12 },
  recipe: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  message: { fontSize: 13, lineHeight: 19, textAlign: 'center', fontWeight: '800' }
});
