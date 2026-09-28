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
  analyzeSettlementAdjacency,
  humanAdjacencyBonuses,
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
  SecondaryButton,
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
    settlementAdjacencyBonuses,
    isBuildingUnlocked,
    constructBuilding,
    moveBuilding
  } = useGame();

  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedPlot =
    humanSettlementPlots.find(plot => plot.id === selectedPlotId) ?? null;
  const selectedBuilding =
    buildings.find(building => building.id === selectedBuildingId) ?? null;

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

  const activeBonusIds = new Set(
    settlementAdjacencyBonuses.map(bonus => bonus.id)
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

  const previewBonusNames = (buildingId: string) => {
    if (!selectedPlot) return [];

    const hypotheticalPlacements = {
      ...buildingPlacements,
      [selectedPlot.id]: buildingId
    };
    const hypotheticalLevels = {
      ...buildingLevels,
      [buildingId]: Math.max(1, buildingLevels[buildingId] ?? 0)
    };

    return analyzeSettlementAdjacency(
      hypotheticalPlacements,
      hypotheticalLevels
    ).bonuses
      .filter(bonus => !activeBonusIds.has(bonus.id))
      .map(bonus => bonus.name);
  };

  const stageLabel =
    currentWagonStage.id === 'capital'
      ? 'GREENKEEP CAPITAL'
      : currentWagonStage.id === 'stronghold'
        ? 'GREENKEEP STRONGHOLD'
        : currentWagonStage.id === 'town'
        ? 'GREENKEEP TOWN'
        : currentWagonStage.id === 'fort'
          ? 'GREENKEEP FORT'
          : currentWagonStage.id === 'settlement'
            ? 'GREENKEEP SETTLEMENT'
            : 'REFUGEE CAMP';

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GameCard accent={theme.colors.human}>
        <Text style={[styles.eyebrow, { color: theme.colors.human }]}>
          SETTLEMENT VIEW
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {stageLabel}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Orthogonally adjacent buildings can form District Bonuses. Tap a built
          structure to relocate it, then tap an empty unlocked plot. Moving is
          free and never removes building levels.
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
        <View
          style={[
            styles.roadHorizontal,
            { backgroundColor: theme.colors.surface3 }
          ]}
        />
        <View
          style={[
            styles.roadVertical,
            { backgroundColor: theme.colors.surface3 }
          ]}
        />

        {humanSettlementPlots.map(plot => {
          const unlocked = isSettlementPlotUnlocked(
            plot,
            currentWagonStage.id
          );
          const buildingId = buildingPlacements[plot.id] ?? null;
          const building = buildingId
            ? buildings.find(candidate => candidate.id === buildingId) ?? null
            : null;
          const level = building ? buildingLevels[building.id] ?? 0 : 0;
          const plotSelected = selectedPlotId === plot.id;
          const buildingSelected =
            Boolean(building) && selectedBuildingId === building?.id;

          return (
            <Pressable
              key={plot.id}
              disabled={!unlocked}
              onPress={() => {
                setMessage(null);

                if (building) {
                  setSelectedBuildingId(
                    buildingSelected ? null : building.id
                  );
                  setSelectedPlotId(null);
                  return;
                }

                if (selectedBuildingId) {
                  const ok = moveBuilding(selectedBuildingId, plot.id);
                  setMessage(
                    ok
                      ? 'Building relocated. District bonuses recalculated.'
                      : 'That building cannot be moved to this plot.'
                  );
                  if (ok) setSelectedBuildingId(null);
                  return;
                }

                setSelectedPlotId(plotSelected ? null : plot.id);
              }}
              style={[
                styles.plot,
                {
                  left: (String(5 + plot.column * 32) +
                    '%') as ViewStyle['left'],
                  top: (String(7 + plot.row * 31) +
                    '%') as ViewStyle['top'],
                  backgroundColor: building
                    ? theme.colors.surface2
                    : unlocked
                      ? theme.colors.appBg
                      : theme.colors.surface3,
                  borderColor:
                    plotSelected || buildingSelected
                      ? theme.colors.gold
                      : building
                        ? theme.colors.human
                        : theme.colors.border,
                  borderWidth:
                    plotSelected || buildingSelected ? 3 : 1.5,
                  opacity: unlocked ? 1 : 0.45
                }
              ]}
            >
              {building ? (
                <>
                  <Text style={styles.buildingIcon}>{building.icon}</Text>
                  <Text
                    style={[
                      styles.plotBuildingName,
                      { color: theme.colors.text }
                    ]}
                    numberOfLines={2}
                  >
                    {building.name}
                  </Text>
                  <Text
                    style={[styles.plotLevel, { color: theme.colors.gold }]}
                  >
                    Lv.{level}
                  </Text>
                </>
              ) : unlocked ? (
                <>
                  <Text
                    style={[
                      styles.emptyPlus,
                      {
                        color:
                          plotSelected || selectedBuildingId
                            ? theme.colors.gold
                            : theme.colors.textMuted
                      }
                    ]}
                  >
                    +
                  </Text>
                  <Text
                    style={[
                      styles.emptyText,
                      {
                        color: selectedBuildingId
                          ? theme.colors.gold
                          : theme.colors.textMuted
                      }
                    ]}
                  >
                    {selectedBuildingId ? 'Move here' : 'Empty'}
                  </Text>
                  <Text
                    style={[
                      styles.terrain,
                      { color: theme.colors.textMuted }
                    ]}
                  >
                    {terrainMarks[plot.terrain] ?? '·'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.lock}>🔒</Text>
                  <Text
                    style={[
                      styles.lockText,
                      { color: theme.colors.textMuted }
                    ]}
                  >
                    {plot.unlockStage}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}

        {['fort', 'town', 'stronghold', 'capital', 'grand'].includes(
          currentWagonStage.id
        ) ? (
          <>
            <View
              style={[styles.wallTop, { borderColor: theme.colors.gold }]}
            />
            <View
              style={[
                styles.wallBottom,
                { borderColor: theme.colors.gold }
              ]}
            />
            <Text
              style={[styles.gateLabel, { color: theme.colors.gold }]}
            >
              {currentWagonStage.id === 'capital'
                ? 'CAPITAL GATE'
                : currentWagonStage.id === 'stronghold'
                  ? 'STRONGHOLD GATE'
                  : currentWagonStage.id === 'town'
                  ? 'TOWN GATE'
                  : 'FORT GATE'}
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.legend}>
        <Text
          style={[styles.legendText, { color: theme.colors.textMuted }]}
        >
          Up/down/left/right adjacency only · relocation is free
        </Text>
        <Pill label={String(placedIds.length) + ' BUILT'} />
      </View>

      {selectedBuilding ? (
        <GameCard accent={theme.colors.gold}>
          <Text
            style={[styles.selectionLabel, { color: theme.colors.gold }]}
          >
            RELOCATE
          </Text>
          <Text
            style={[styles.selectionTitle, { color: theme.colors.text }]}
          >
            {selectedBuilding.icon} {selectedBuilding.name}
          </Text>
          <Text
            style={[styles.selectionBody, { color: theme.colors.textMuted }]}
          >
            Tap any empty unlocked plot. Building level and upgrades are
            preserved; active district bonuses update immediately.
          </Text>
          <View style={styles.button}>
            <SecondaryButton
              label="Cancel move"
              onPress={() => setSelectedBuildingId(null)}
            />
          </View>
        </GameCard>
      ) : selectedPlot ? (
        <>
          <SectionTitle
            title="Construct Building"
            trailing={selectedPlot.id.replace('plot_', '').toUpperCase()}
          />
          {availableBuildings.length > 0 ? (
            <View style={styles.buildingList}>
              {availableBuildings.map(building => {
                const potentialBonuses = previewBonusNames(building.id);

                return (
                  <GameCard
                    key={building.id}
                    accent={theme.colors.primary}
                  >
                    <View style={styles.optionHeader}>
                      <Text style={styles.optionIcon}>{building.icon}</Text>
                      <View style={styles.optionCopy}>
                        <Text
                          style={[
                            styles.optionName,
                            { color: theme.colors.text }
                          ]}
                        >
                          {building.name}
                        </Text>
                        <Text
                          style={[
                            styles.optionRole,
                            { color: theme.colors.human }
                          ]}
                        >
                          {building.role}
                        </Text>
                      </View>
                      <Text
                        style={[styles.cost, { color: theme.colors.gold }]}
                      >
                        {formatCost(building.constructionCost)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionBody,
                        { color: theme.colors.textMuted }
                      ]}
                    >
                      {building.description}
                    </Text>

                    {potentialBonuses.length > 0 ? (
                      <Text
                        style={[
                          styles.potentialBonus,
                          { color: theme.colors.primary }
                        ]}
                      >
                        Creates: {potentialBonuses.join(' · ')}
                      </Text>
                    ) : null}

                    <View style={styles.button}>
                      <PrimaryButton
                        label={'Build ' + building.name}
                        disabled={!canAfford(building.constructionCost)}
                        onPress={() => {
                          const ok = constructBuilding(
                            building.id,
                            selectedPlot.id
                          );
                          setMessage(
                            ok
                              ? building.name +
                                  ' constructed. District bonuses recalculated.'
                              : 'This building cannot be constructed here yet.'
                          );
                          if (ok) setSelectedPlotId(null);
                        }}
                      />
                    </View>
                  </GameCard>
                );
              })}
            </View>
          ) : (
            <GameCard>
              <Text
                style={[styles.none, { color: theme.colors.textMuted }]}
              >
                No unlocked unbuilt buildings are currently available.
              </Text>
            </GameCard>
          )}
        </>
      ) : (
        <GameCard>
          <Text style={[styles.none, { color: theme.colors.textMuted }]}>
            Tap an empty plot to build, or tap a constructed building to move
            it and tune your adjacency bonuses.
          </Text>
        </GameCard>
      )}

      <SectionTitle
        title="Active District Bonuses"
        trailing={String(settlementAdjacencyBonuses.length)}
      />

      {settlementAdjacencyBonuses.length > 0 ? (
        <View style={styles.bonusList}>
          {settlementAdjacencyBonuses.map(bonus => (
            <GameCard key={bonus.id} accent={theme.colors.primary}>
              <View style={styles.bonusHeader}>
                <Text
                  style={[styles.bonusName, { color: theme.colors.text }]}
                >
                  {bonus.name}
                </Text>
                <Pill label="ACTIVE" color={theme.colors.primary + '33'} />
              </View>
              <Text
                style={[styles.bonusBody, { color: theme.colors.textMuted }]}
              >
                {bonus.description}
              </Text>
              <Text
                style={[styles.bonusEffect, { color: theme.colors.primary }]}
              >
                {bonus.effectText}
              </Text>
            </GameCard>
          ))}
        </View>
      ) : (
        <GameCard>
          <Text style={[styles.none, { color: theme.colors.textMuted }]}>
            No district synergy is active yet. Move compatible buildings next
            to each other to create one.
          </Text>
        </GameCard>
      )}

      <SectionTitle title="District Recipes" trailing="Orthogonal" />
      <GameCard>
        <View style={styles.recipeList}>
          {humanAdjacencyBonuses.map(bonus => {
            const first =
              buildings.find(building => building.id === bonus.buildingA);
            const second =
              buildings.find(building => building.id === bonus.buildingB);
            const active = activeBonusIds.has(bonus.id);

            return (
              <View
                key={bonus.id}
                style={[
                  styles.recipeRow,
                  { borderBottomColor: theme.colors.border }
                ]}
              >
                <View style={styles.recipeCopy}>
                  <Text
                    style={[styles.recipeName, { color: theme.colors.text }]}
                  >
                    {first?.icon} {first?.name} + {second?.icon}{' '}
                    {second?.name}
                  </Text>
                  <Text
                    style={[
                      styles.recipeEffect,
                      {
                        color: active
                          ? theme.colors.primary
                          : theme.colors.textMuted
                      }
                    ]}
                  >
                    {bonus.effectText}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.recipeStatus,
                    {
                      color: active
                        ? theme.colors.primary
                        : theme.colors.textMuted
                    }
                  ]}
                >
                  {active ? 'ACTIVE' : '—'}
                </Text>
              </View>
            );
          })}
        </View>
      </GameCard>

      {message ? (
        <Text
          style={[styles.message, { color: theme.colors.textMuted }]}
        >
          {message}
        </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5
  },
  buildingIcon: { fontSize: 25 },
  plotBuildingName: {
    fontSize: 9.5,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4
  },
  plotLevel: { fontSize: 8.5, fontWeight: '900', marginTop: 2 },
  emptyPlus: { fontSize: 28, fontWeight: '600' },
  emptyText: { fontSize: 9, fontWeight: '800' },
  terrain: { position: 'absolute', right: 7, bottom: 5, fontSize: 10 },
  lock: { fontSize: 18 },
  lockText: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 4
  },
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
  gateLabel: {
    position: 'absolute',
    bottom: 7,
    alignSelf: 'center',
    fontSize: 8,
    fontWeight: '900'
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10
  },
  legendText: { flex: 1, fontSize: 9.5, lineHeight: 14 },
  selectionLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  selectionTitle: { fontSize: 16, fontWeight: '900', marginTop: 3 },
  selectionBody: { fontSize: 10.5, lineHeight: 16, marginTop: 5 },
  buildingList: { gap: 9 },
  optionHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  optionIcon: { fontSize: 25 },
  optionCopy: { flex: 1 },
  optionName: { fontSize: 15, fontWeight: '900' },
  optionRole: { fontSize: 8.5, fontWeight: '900', marginTop: 2 },
  cost: {
    fontSize: 8.5,
    fontWeight: '900',
    maxWidth: 110,
    textAlign: 'right'
  },
  optionBody: { fontSize: 10.5, lineHeight: 15, marginTop: 7 },
  potentialBonus: { fontSize: 9.5, lineHeight: 14, fontWeight: '900', marginTop: 7 },
  button: { marginTop: 10 },
  none: { fontSize: 11, lineHeight: 16, textAlign: 'center' },
  bonusList: { gap: 8 },
  bonusHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  bonusName: { fontSize: 14, fontWeight: '900' },
  bonusBody: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  bonusEffect: { fontSize: 10, lineHeight: 15, fontWeight: '900', marginTop: 6 },
  recipeList: { gap: 0 },
  recipeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  recipeCopy: { flex: 1 },
  recipeName: { fontSize: 10.5, fontWeight: '900' },
  recipeEffect: { fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  recipeStatus: { fontSize: 8.5, fontWeight: '900' },
  message: {
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '800'
  }
});
