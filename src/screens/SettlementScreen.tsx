import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { ViewStyle } from 'react-native';
import {
  humanSettlementPlots,
  isSettlementPlotUnlocked
} from '../game/settlement';
import { useGame } from '../game/GameProvider';
import type { ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  Pill,
  PrimaryButton,
  SectionTitle
} from '../ui/components';

const resourceIcons: Record<keyof ResourceWallet, string> = {
  gold: '🪙',
  wood: '🪵',
  stone: '🪨',
  iron: '⛓',
  provisions: '🍞'
};

const terrainMarks: Record<string, string> = {
  grass: '·',
  high_ground: '⌃',
  roadside: '═',
  square: '◇'
};

export function SettlementScreen({ onExit }: { onExit: () => void }) {
  const { theme } = useGameTheme();
  const {
    resources,
    currentWagonStage,
    buildings,
    buildingLevels,
    buildingPlacements,
    isBuildingUnlocked,
    constructBuilding
  } = useGame();

  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedPlot = humanSettlementPlots.find(plot => plot.id === selectedPlotId) ?? null;

  const placedIds = useMemo(
    () =>
      Object.values(buildingPlacements).filter(
        (value): value is string => Boolean(value)
      ),
    [buildingPlacements]
  );

  const availableBuildings = buildings.filter(
    building =>
      isBuildingUnlocked(building.id) &&
      !placedIds.includes(building.id)
  );

  const formatCost = (cost: Partial<ResourceWallet>) =>
    Object.entries(cost)
      .map(
        ([key, amount]) =>
          resourceIcons[key as keyof ResourceWallet] + ' ' + String(amount)
      )
      .join('  ');

  const canAfford = (cost: Partial<ResourceWallet>) =>
    Object.entries(cost).every(([key, amount]) => {
      const resourceKey = key as keyof ResourceWallet;
      return resources[resourceKey] >= (amount ?? 0);
    });

  const stageLabel =
    currentWagonStage.id === 'fort'
      ? 'GREENKEEP FORT'
      : currentWagonStage.id === 'settlement'
        ? 'GREENKEEP SETTLEMENT'
        : 'REFUGEE CAMP';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <Text style={[styles.eyebrow, { color: theme.colors.human }]}>SETTLEMENT VIEW</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{stageLabel}</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Choose which unlocked building goes on each available plot. Placement is visual for now; building type and level determine the gameplay effect.
        </Text>
      </GameCard>

      <View
        style={[
          styles.map,
          {
            backgroundColor: theme.colors.surface1,
            borderColor: theme.colors.border
          }
        ]}
      >
        <View style={[styles.roadHorizontal, { backgroundColor: theme.colors.surface3 }]} />
        <View style={[styles.roadVertical, { backgroundColor: theme.colors.surface3 }]} />

        {humanSettlementPlots.map(plot => {
          const unlocked = isSettlementPlotUnlocked(plot, currentWagonStage.id);
          const buildingId = buildingPlacements[plot.id] ?? null;
          const building = buildingId
            ? buildings.find(candidate => candidate.id === buildingId) ?? null
            : null;
          const level = building ? buildingLevels[building.id] ?? 0 : 0;
          const selected = selectedPlotId === plot.id;

          return (
            <Pressable
              key={plot.id}
              disabled={!unlocked || Boolean(building)}
              onPress={() => {
                setSelectedPlotId(selected ? null : plot.id);
                setMessage(null);
              }}
              style={[
                styles.plot,
                {
                  left: (String(5 + plot.column * 32) + '%') as ViewStyle['left'],
                  top: (String(7 + plot.row * 31) + '%') as ViewStyle['top'],
                  backgroundColor: building
                    ? theme.colors.surface2
                    : unlocked
                      ? theme.colors.appBg
                      : theme.colors.surface3,
                  borderColor: selected
                    ? theme.colors.gold
                    : building
                      ? theme.colors.human
                      : theme.colors.border,
                  opacity: unlocked ? 1 : 0.45
                }
              ]}
            >
              {building ? (
                <>
                  <Text style={styles.buildingIcon}>{building.icon}</Text>
                  <Text
                    style={[styles.plotBuildingName, { color: theme.colors.text }]}
                    numberOfLines={2}
                  >
                    {building.name}
                  </Text>
                  <Text style={[styles.plotLevel, { color: theme.colors.gold }]}>
                    Lv.{level}
                  </Text>
                </>
              ) : unlocked ? (
                <>
                  <Text style={[styles.emptyPlus, { color: selected ? theme.colors.gold : theme.colors.textMuted }]}>
                    +
                  </Text>
                  <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                    Empty
                  </Text>
                  <Text style={[styles.terrain, { color: theme.colors.textMuted }]}>
                    {terrainMarks[plot.terrain] ?? '·'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.lock}>🔒</Text>
                  <Text style={[styles.lockText, { color: theme.colors.textMuted }]}>
                    {plot.unlockStage}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}

        {currentWagonStage.id === 'fort' ? (
          <>
            <View style={[styles.wallTop, { borderColor: theme.colors.gold }]} />
            <View style={[styles.wallBottom, { borderColor: theme.colors.gold }]} />
            <Text style={[styles.gateLabel, { color: theme.colors.gold }]}>FORT GATE</Text>
          </>
        ) : null}
      </View>

      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: theme.colors.textMuted }]}>
          Fixed plots · tap an empty unlocked plot to construct
        </Text>
        <Pill label={String(placedIds.length) + ' BUILT'} />
      </View>

      {selectedPlot ? (
        <>
          <SectionTitle title="Construct Building" trailing={selectedPlot.id.replace('plot_', '').toUpperCase()} />
          {availableBuildings.length > 0 ? (
            <View style={styles.buildingList}>
              {availableBuildings.map(building => (
                <GameCard key={building.id} accent={theme.colors.primary}>
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>{building.icon}</Text>
                    <View style={styles.optionCopy}>
                      <Text style={[styles.optionName, { color: theme.colors.text }]}>
                        {building.name}
                      </Text>
                      <Text style={[styles.optionRole, { color: theme.colors.human }]}>
                        {building.role}
                      </Text>
                    </View>
                    <Text style={[styles.cost, { color: theme.colors.gold }]}>
                      {formatCost(building.constructionCost)}
                    </Text>
                  </View>
                  <Text style={[styles.optionBody, { color: theme.colors.textMuted }]}>
                    {building.description}
                  </Text>
                  <View style={styles.button}>
                    <PrimaryButton
                      label={'Build ' + building.name}
                      disabled={!canAfford(building.constructionCost)}
                      onPress={() => {
                        const ok = constructBuilding(building.id, selectedPlot.id);
                        setMessage(
                          ok
                            ? building.name + ' constructed.'
                            : 'This building cannot be constructed here yet.'
                        );
                        if (ok) setSelectedPlotId(null);
                      }}
                    />
                  </View>
                </GameCard>
              ))}
            </View>
          ) : (
            <GameCard>
              <Text style={[styles.none, { color: theme.colors.textMuted }]}>
                No unlocked unbuilt buildings are currently available.
              </Text>
            </GameCard>
          )}
        </>
      ) : (
        <GameCard>
          <Text style={[styles.none, { color: theme.colors.textMuted }]}>
            Select an empty plot to see buildings you can buy and place.
          </Text>
        </GameCard>
      )}

      {message ? (
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
      ) : null}

      <PrimaryButton label="Return to Kingdom" onPress={onExit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 13 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 27, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 11.5, lineHeight: 17, marginTop: 6 },
  map: {
    height: 370,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  roadHorizontal: {
    position: 'absolute',
    left: '0%',
    top: '46%',
    width: '100%',
    height: 28,
    opacity: 0.65
  },
  roadVertical: {
    position: 'absolute',
    left: '46%',
    top: '0%',
    width: 28,
    height: '100%',
    opacity: 0.65
  },
  plot: {
    position: 'absolute',
    width: '27%',
    height: '25%',
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5
  },
  buildingIcon: { fontSize: 25 },
  plotBuildingName: { fontSize: 9.5, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  plotLevel: { fontSize: 8.5, fontWeight: '900', marginTop: 2 },
  emptyPlus: { fontSize: 28, fontWeight: '600' },
  emptyText: { fontSize: 9, fontWeight: '800' },
  terrain: { position: 'absolute', right: 7, bottom: 5, fontSize: 10 },
  lock: { fontSize: 18 },
  lockText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', marginTop: 4 },
  wallTop: {
    position: 'absolute',
    left: '3%',
    right: '3%',
    top: 3,
    borderTopWidth: 2,
    opacity: 0.75
  },
  wallBottom: {
    position: 'absolute',
    left: '3%',
    right: '3%',
    bottom: 3,
    borderBottomWidth: 2,
    opacity: 0.75
  },
  gateLabel: { position: 'absolute', bottom: 7, alignSelf: 'center', fontSize: 8, fontWeight: '900' },
  legend: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  legendText: { flex: 1, fontSize: 9.5, lineHeight: 14 },
  buildingList: { gap: 9 },
  optionHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  optionIcon: { fontSize: 25 },
  optionCopy: { flex: 1 },
  optionName: { fontSize: 15, fontWeight: '900' },
  optionRole: { fontSize: 8.5, fontWeight: '900', marginTop: 2 },
  cost: { fontSize: 8.5, fontWeight: '900', maxWidth: 110, textAlign: 'right' },
  optionBody: { fontSize: 10.5, lineHeight: 15, marginTop: 7 },
  button: { marginTop: 10 },
  none: { fontSize: 11, lineHeight: 16, textAlign: 'center' },
  message: { fontSize: 10.5, lineHeight: 16, textAlign: 'center', fontWeight: '800' }
});
