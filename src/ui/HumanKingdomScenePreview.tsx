import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BuildingDefinition, WagonStage } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { BuildingSprite, SettlementTerrainBackdrop } from './gameArt';
import { HUMAN_SETTLEMENT_PLATE_ASPECT_RATIO, humanSettlementBuildingSpriteSize, humanSettlementPlotDepthIndex, humanSettlementPlatePlotPositions } from './settlementActionLayout';

type HumanStageId = WagonStage['id'];

const stages: ReadonlyArray<{
  id: HumanStageId;
  label: string;
  narrative: string;
}> = [
  { id: 'camp', label: 'Frontier Camp', narrative: 'A few wagons and a fragile banner' },
  { id: 'settlement', label: 'New Settlement', narrative: 'Permanent homes among the old roads' },
  { id: 'fort', label: 'Fortified Outpost', narrative: 'Walls and watchtowers secure Greenkeep' },
  { id: 'town', label: 'Walled Town', narrative: 'A growing town with protected streets' },
  { id: 'stronghold', label: 'Royal Stronghold', narrative: 'The kingdom’s army has a permanent home' },
  { id: 'capital', label: 'Greenkeep Capital', narrative: 'A mature capital commands the realm' },
  { id: 'grand', label: 'Grand Campaign', narrative: 'The realm gathers beneath its banners' }
];

/** Narrative metadata only — no gameplay or settlement/save mutation. */
export function humanKingdomGrowthStage(stageId: HumanStageId) {
  const index = Math.max(0, stages.findIndex(stage => stage.id === stageId));
  return { ...stages[index]!, tier: index + 1, total: stages.length };
}

const plotOrder = Object.keys(humanSettlementPlatePlotPositions) as Array<keyof typeof humanSettlementPlatePlotPositions>;

export function HumanKingdomScenePreview({
  stageId,
  buildings,
  buildingLevels,
  buildingPlacements,
  onOpenSettlement
}: {
  stageId: HumanStageId;
  buildings: BuildingDefinition[];
  buildingLevels: Record<string, number>;
  buildingPlacements: Record<string, string | null>;
  onOpenSettlement: () => void;
}) {
  const { theme } = useGameTheme();
  const [plateWidth, setPlateWidth] = useState(340);
  const spriteScale = Math.max(0.82, Math.min(1.12, plateWidth / 340));
  const growth = humanKingdomGrowthStage(stageId);
  const placed = plotOrder.flatMap(plotId => {
    const buildingId = buildingPlacements[plotId];
    const building = buildingId && (buildingLevels[buildingId] ?? 0) > 0
      ? buildings.find(candidate => candidate.id === buildingId)
      : null;
    return building ? [{ plotId, building }] : [];
  });

  return (
    <Pressable
      testID="kingdom-settlement-hero"
      accessibilityRole="button"
      accessibilityLabel={'Explore ' + growth.label + ', tier ' + growth.tier + ' of ' + growth.total + '. Open interactive settlement.'}
      accessibilityHint="Opens construction plots, moving buildings and building upgrades."
      onPress={onOpenSettlement}
      style={[styles.frame, { borderColor: theme.colors.human + 'A8', backgroundColor: theme.colors.surface1 }]}
    >
      <View
        testID="kingdom-settlement-plate"
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        onLayout={event => {
          const width = event.nativeEvent.layout.width;
          if (Number.isFinite(width) && width > 0) {
            setPlateWidth(previous => Math.abs(previous - width) < 0.5 ? previous : width);
          }
        }}
        style={styles.plate}
      >
        <SettlementTerrainBackdrop faction="human" stageId={stageId} />
        {placed.map(({ plotId, building }) => {
          const landmark = plotId === 'plot_center';
          const row = plotId.endsWith('sw') || plotId === 'plot_s' || plotId.endsWith('se') ? 2
            : plotId === 'plot_n' || plotId === 'plot_nw' || plotId === 'plot_ne' ? 0 : 1;
          const depthScale = row === 0 ? 0.86 : row === 2 ? 1.1 : 1;
          return (
            <View
              key={plotId}
              testID={'kingdom-hero-building-' + plotId}
              style={[
                styles.plot,
                landmark ? styles.landmarkPlot : undefined,
                {
                  left: humanSettlementPlatePlotPositions[plotId]!.left,
                  top: humanSettlementPlatePlotPositions[plotId]!.top,
                  zIndex: humanSettlementPlotDepthIndex(plotId)
                }
              ]}
            >
              <View
                style={[
                  styles.footprint,
                  landmark ? styles.landmarkFootprint : undefined,
                  { transform: [{ scaleX: depthScale * spriteScale }, { scaleY: spriteScale }] }
                ]}
              />
              <View style={[styles.buildingArt, landmark ? styles.landmarkBuildingArt : undefined]}>
                <BuildingSprite
                  buildingId={building.id}
                  faction="human"
                  size={Math.round(humanSettlementBuildingSpriteSize(plotId, building.role, plateWidth) * (landmark ? 1 : 1.14))}
                />
              </View>
            </View>
          );
        })}
        <View style={styles.topShade} />
        <View style={[styles.stagePlaque, { borderColor: theme.colors.human + '99' }]}>
          <Text style={styles.eyebrow}>GREENKEEP · TIER {growth.tier} / {growth.total}</Text>
          <Text style={styles.stageName}>{growth.label}</Text>
          <Text style={styles.narrative}>{growth.narrative}</Text>
        </View>
        <View style={styles.bottomShade} />
        <View style={styles.bottomBar}>
          <View style={styles.stageProgress}>
            {stages.map((stage, index) => (
              <View
                key={stage.id}
                style={[styles.tierMarker, {
                  backgroundColor: index < growth.tier ? '#EBC577' : '#FFFFFF46',
                  opacity: index === growth.tier - 1 ? 1 : 0.8
                }]}
              />
            ))}
          </View>
          <Text style={styles.enterText}>EXPLORE SETTLEMENT  ›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: { borderWidth: 1.5, borderRadius: 16, overflow: 'hidden', width: '100%' },
  // Match the uncropped 540 × 960 production plates. Altering this ratio
  // would shift visible building feet away from their painted ground plots.
  plate: { width: '100%', aspectRatio: HUMAN_SETTLEMENT_PLATE_ASPECT_RATIO, position: 'relative', overflow: 'hidden' },
  plot: {
    position: 'absolute', width: '28%', height: '24%',
    alignItems: 'center', justifyContent: 'center'
  },
  landmarkPlot: { width: '34%', height: '29%' },
  footprint: {
    position: 'absolute', left: '50%', marginLeft: -33, width: 66, height: 18, bottom: '17%',
    borderRadius: 100, backgroundColor: '#090F0C', opacity: 0.36
  },
  landmarkFootprint: { marginLeft: -48, width: 96, height: 26, bottom: '18%' },
  buildingArt: { position: 'absolute', left: 0, right: 0, bottom: '17%', alignItems: 'center', justifyContent: 'flex-end' },
  landmarkBuildingArt: { bottom: '18%' },
  topShade: { position: 'absolute', left: 0, right: 0, top: 0, height: '17%', backgroundColor: '#101E25', opacity: 0.14 },
  stagePlaque: {
    position: 'absolute', top: 10, left: 10, right: '20%',
    backgroundColor: '#101B24DC', borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 9, paddingVertical: 7, gap: 2
  },
  eyebrow: { color: '#DAB86D', fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 1 },
  stageName: { color: '#F7F1E7', fontSize: 14, lineHeight: 18, fontWeight: '900' },
  narrative: { color: '#E3E7E7', fontSize: 9, lineHeight: 12, fontWeight: '700' },
  bottomShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 72, backgroundColor: '#0B151CCC', opacity: 0.93 },
  bottomBar: {
    position: 'absolute', left: 10, right: 10, bottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8
  },
  stageProgress: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  tierMarker: { width: 17, height: 5, borderRadius: 4 },
  enterText: { fontSize: 9.5, lineHeight: 14, color: '#FFFFFF', fontWeight: '900', letterSpacing: 0.55 }
});
