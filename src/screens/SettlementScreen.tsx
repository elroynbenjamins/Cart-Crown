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
import { BuildingSprite, LockIcon, ResourceSprite, SettlementBuildingAmbience, SettlementBuildPlotSprite, SettlementTerrainBackdrop } from '../ui/gameArt';
import { SemanticChip, SemanticText } from '../ui/SemanticUI';
import { semanticColor } from '../ui/semanticColors';
import { BuildingCosts, BuildingHeading, BuildingLevelPreview, DistrictEffects } from '../ui/SettlementUI';
import { buildingRolePresentation, districtRecipePresentation, districtRecipeState } from '../ui/settlementPresentation';
import { TutorialFocus } from '../ui/TutorialFocus';
import type { TutorialFocusTarget } from '../game/tutorial';

const settlementPlotPositions: Record<string, { left: ViewStyle['left']; top: ViewStyle['top'] }> = {
  plot_nw: { left: '3%', top: '9%' },
  plot_n: { left: '36%', top: '5%' },
  plot_ne: { left: '69%', top: '10%' },
  plot_w: { left: '2%', top: '38%' },
  plot_center: { left: '34%', top: '34%' },
  plot_e: { left: '71%', top: '39%' },
  plot_sw: { left: '4%', top: '70%' },
  plot_s: { left: '37%', top: '72%' },
  plot_se: { left: '70%', top: '69%' }
};

const settlementResourceOrder = ['gold', 'wood', 'stone', 'iron', 'provisions'] as const;
const settlementResourceLabels: Record<(typeof settlementResourceOrder)[number], string> = {
  gold: 'Gold',
  wood: 'Wood',
  stone: 'Stone',
  iron: 'Iron',
  provisions: 'Food'
};

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
  const nextSuggestedBuilding = availableBuildings[0] ?? null;
  const nextSuggestedPlot = settlementPlots.find(plot => isSettlementPlotUnlocked(plot, currentWagonStage.id) && !buildingPlacements[plot.id]) ?? null;
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
  const mapHeight = Math.max(520, Math.ceil(370 * Math.max(1, Number.isFinite(fontScale) ? fontScale : 1)));
  const fortificationWeight =
    currentWagonStage.id === 'grand' ? 5
      : currentWagonStage.id === 'capital' ? 4
        : currentWagonStage.id === 'stronghold' ? 3.5
          : currentWagonStage.id === 'town' ? 3
            : 2;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={factionAccent} ornament={false}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: factionAccent }]}>CART & CROWN · SETTLEMENT</Text>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>{stageLabel}</Text>
          </View>
          <View style={[styles.stageBadge, { borderColor: factionAccent, backgroundColor: theme.colors.surface2 }]}>
            <Text style={[styles.stageBadgeText, { color: factionAccent }]}>{currentWagonStage.id.toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.resourceStrip, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface2 }]}>
          {settlementResourceOrder.map(resource => (
            <View key={resource} style={styles.resourceCell}>
              <ResourceSprite resource={resource} size={20} />
              <View style={styles.resourceCopy}>
                <Text style={[styles.resourceValue, { color: theme.colors.text }]}>{resources[resource]}</Text>
                <Text style={[styles.resourceLabel, { color: theme.colors.textMuted }]}>{settlementResourceLabels[resource]}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.chips}>
          <SemanticChip label={placedIds.length + ' built'} tone="neutral" compact />
          <SemanticChip label={settlementAdjacencyBonuses.length + ' districts'} tone={settlementAdjacencyBonuses.length ? 'positive' : 'neutral'} compact />
        </View>

        {nextSuggestedBuilding && nextSuggestedPlot ? (
          <View style={[styles.nextGoal, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface2 }]}>
            <View style={styles.nextGoalCopy}>
              <Text style={[styles.nextGoalEyebrow, { color: theme.colors.textMuted }]}>NEXT BUILD</Text>
              <Text style={[styles.nextGoalTitle, { color: theme.colors.text }]} numberOfLines={1}>{nextSuggestedBuilding.name}</Text>
            </View>
            <SemanticChip label="Open plot ready" tone="currency" compact />
          </View>
        ) : null}

        <Text style={[styles.heroHint, { color: theme.colors.textMuted }]}>
          Tap a building to manage it. Tap open ground to expand.
        </Text>
      </GameCard>

      <View style={[styles.map, { height: mapHeight, backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
        <View pointerEvents="none" style={styles.backdrop}>
          <SettlementTerrainBackdrop faction={activeFaction} stageId={currentWagonStage.id} />
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
          const landmark = plot.id === 'plot_center';
          const districtCount = building ? settlementAdjacencyBonuses.filter(bonus => bonus.buildingA === building.id || bonus.buildingB === building.id).length : 0;
          const visualPosition = settlementPlotPositions[plot.id] ?? {
            left: (String(5 + plot.column * 32) + '%') as ViewStyle['left'],
            top: (String(7 + plot.row * 31) + '%') as ViewStyle['top']
          };
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
                  left: visualPosition.left,
                  top: visualPosition.top,
                  backgroundColor: 'transparent',
                  borderColor: tutorialPlotFocused || selected ? theme.colors.gold : building ? roleColor : theme.colors.border,
                  borderWidth: tutorialPlotFocused || selected ? 3 : building ? 1 : 1.5,
                  borderStyle: building || selected || tutorialPlotFocused ? 'solid' : 'dashed',
                  transform: tutorialPlotFocused ? [{ scale: 1.05 }] : undefined
                },
                landmark ? styles.landmarkPlot : undefined
              ]}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.plotSurface,
                  {
                    backgroundColor: building ? theme.colors.surface1 : unlocked ? 'transparent' : theme.colors.surface3,
                    opacity: building ? 0.22 : unlocked ? 0.08 : 0.78
                  }
                ]}
              />
              {tutorialPlotFocused ? (
                <View pointerEvents="none" style={[styles.plotGuideBadge, { backgroundColor: theme.colors.gold }]}>
                  <Text style={styles.plotGuideText}>{tutorialFocus?.kind === 'settlement-building' ? 'TAP EMPTY PLOT' : tutorialFocus?.label}</Text>
                </View>
              ) : null}
              {building ? (
                <>
                  <View pointerEvents="none" style={[styles.buildingAmbience, landmark ? styles.landmarkAmbience : undefined]}>
                    <SettlementBuildingAmbience
                      buildingId={building.id}
                      role={building.role}
                      faction={building.faction}
                      level={level}
                      size={landmark ? 98 : 82}
                    />
                  </View>
                  <View style={[styles.buildingPad, landmark ? styles.landmarkBuildingPad : undefined]}>
                    <View pointerEvents="none" style={[styles.buildingFootprint, landmark ? styles.landmarkFootprint : undefined, { backgroundColor: roleColor }]} />
                    <BuildingSprite buildingId={building.id} faction={building.faction} size={landmark ? 78 : 62} />
                  </View>
                  {selected || landmark ? (
                    <Text style={[styles.plotBuildingName, { color: roleColor, backgroundColor: theme.colors.surface1 }]} numberOfLines={1}>{building.name}</Text>
                  ) : null}
                  <View style={[styles.levelPill, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
                    <SemanticText tone="neutral" style={styles.plotLevel}>Lv.{level}</SemanticText>
                  </View>
                </>
              ) : unlocked ? (
                <>
                  <View pointerEvents="none" style={styles.buildPlotArt}>
                    <SettlementBuildPlotSprite
                      terrain={plot.terrain}
                      faction={activeFaction}
                      selected={plotSelected}
                      moveTarget={Boolean(selectedBuildingId)}
                      size={84}
                      color={theme.colors.textMuted}
                    />
                  </View>
                  <View pointerEvents="none" style={[styles.emptyBadge, { backgroundColor: theme.colors.surface1 }]}>
                    <Text style={[styles.emptyPlusCompact, { color: selected || selectedBuildingId ? theme.colors.gold : semanticColor(theme, 'neutral') }]}>+</Text>
                    <SemanticText tone="neutral" style={styles.emptyText}>{selectedBuildingId ? 'Move' : 'Build'}</SemanticText>
                  </View>
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
            <View pointerEvents="none" style={[styles.wallTop, { borderColor: factionAccent, borderTopWidth: fortificationWeight }]} />
            <View pointerEvents="none" style={[styles.wallBottom, { borderColor: factionAccent, borderBottomWidth: fortificationWeight }]} />
            <Text pointerEvents="none" style={[styles.gateLabel, { color: factionAccent }]}>
              {currentWagonStage.id === 'grand' ? 'GRAND GATE' : currentWagonStage.id === 'capital' ? 'CAPITAL GATE' : currentWagonStage.id === 'stronghold' ? 'STRONGHOLD GATE' : currentWagonStage.id === 'town' ? 'TOWN GATE' : 'FORT GATE'}
            </Text>
          </>
        ) : null}
      </View>
      <View style={styles.mapLegend}>
        <SemanticChip label="Tap buildings" tone="neutral" compact />
        <SemanticChip label="Gold = selected" tone="currency" compact />
        <SemanticChip label="Dashed = build plot" tone="blue" compact />
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
          <SectionTitle title="Construct Building" trailing={selectedPlot.id.replace('plot_', '').toUpperCase()}
          />
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
  content: { padding: 12, paddingBottom: 32, gap: 11 },
  heroHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 9, lineHeight: 13, fontWeight: '900', letterSpacing: 1.05 },
  title: { fontSize: 21, lineHeight: 26, fontWeight: '900', marginTop: 2 },
  stageBadge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, marginTop: 1 },
  stageBadgeText: { fontSize: 9, lineHeight: 12, fontWeight: '900', letterSpacing: 0.7 },
  resourceStrip: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, paddingHorizontal: 6, paddingVertical: 7, marginTop: 11, gap: 2 },
  resourceCell: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 3 },
  resourceCopy: { flex: 1, minWidth: 0 },
  resourceValue: { fontSize: 10, lineHeight: 13, fontWeight: '900' },
  resourceLabel: { fontSize: 7.5, lineHeight: 10, fontWeight: '700' },
  nextGoal: { marginTop: 9, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextGoalCopy: { flex: 1, minWidth: 0 },
  nextGoalEyebrow: { fontSize: 8, lineHeight: 10, fontWeight: '900', letterSpacing: 0.9 },
  nextGoalTitle: { fontSize: 13, lineHeight: 17, fontWeight: '900', marginTop: 1 },
  heroHint: { fontSize: 10.5, lineHeight: 15, marginTop: 9 },
  body: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  mapLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: -2 },
  section: { gap: 8, marginTop: 12 },
  map: { borderRadius: 22, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  plot: { position: 'absolute', width: '27%', height: '23%', borderRadius: 14, alignItems: 'center', justifyContent: 'center', padding: 4, overflow: 'hidden' },
  landmarkPlot: { width: '32%', height: '27%', zIndex: 2 },
  plotSurface: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 13 },
  buildingAmbience: { position: 'absolute', left: '50%', top: '50%', marginLeft: -41, marginTop: -41, width: 82, height: 82, alignItems: 'center', justifyContent: 'center' },
  landmarkAmbience: { marginLeft: -49, marginTop: -49, width: 98, height: 98 },
  buildingPad: { width: 70, height: 62, alignItems: 'center', justifyContent: 'flex-end' },
  landmarkBuildingPad: { width: 86, height: 78 },
  buildingFootprint: { position: 'absolute', left: 7, right: 7, bottom: 1, height: 16, borderRadius: 999, opacity: 0.18 },
  landmarkFootprint: { left: 6, right: 6, height: 20, opacity: 0.22 },
  plotGuideBadge: { position: 'absolute', top: -12, right: -8, zIndex: 5, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  plotGuideText: { color: '#111318', fontSize: 8, lineHeight: 11, fontWeight: '900' },
  plotBuildingName: { fontSize: 9.5, lineHeight: 13, fontWeight: '900', textAlign: 'center', marginTop: 0, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, maxWidth: '96%' },
  levelPill: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 1, marginTop: 2 },
  plotLevel: { fontSize: 8.5, lineHeight: 11 },
  emptyPlus: { fontSize: 27, fontWeight: '600' },
  buildPlotArt: { position: 'absolute', left: '50%', top: '50%', marginLeft: -42, marginTop: -42, width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  emptyBadge: { position: 'absolute', bottom: 5, alignSelf: 'center', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 3, opacity: 0.9 },
  emptyPlusCompact: { fontSize: 13, lineHeight: 15, fontWeight: '900' },
  emptyText: { fontSize: 9.5, lineHeight: 13, fontWeight: '900' },
  terrain: { position: 'absolute', right: 5, bottom: 4, alignItems: 'center', justifyContent: 'center' },
  lockText: { fontSize: 10, lineHeight: 14, fontWeight: '800', textTransform: 'uppercase', marginTop: 3 },
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
