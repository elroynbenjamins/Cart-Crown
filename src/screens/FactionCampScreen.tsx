import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  Pill,
  ResourceChip,
  SectionTitle,
  UnitPortrait
} from '../ui/components';

export function FactionCampScreen() {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    resources,
    units,
    currentWagonStage,
    formation
  } = useGame();

  const faction = factions[activeFaction];
  const accent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const campName =
    activeFaction === 'elf'
      ? 'Heartgrove Refuge'
      : activeFaction === 'orc'
        ? 'Emberclan Camp'
        : 'Greenkeep';

  const activeUnits = formation
    .filter((unitId): unitId is string => Boolean(unitId))
    .map(unitId => units.find(unit => unit.id === unitId))
    .filter((unit): unit is NonNullable<typeof unit> => Boolean(unit));

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <Text style={[styles.eyebrow, { color: accent }]}>
          {faction.name.toUpperCase()} CAMPAIGN
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{campName}</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          {faction.campaignSubtitle}
        </Text>
      </GameCard>

      <View style={styles.resources}>
        <ResourceChip icon="🪙" value={resources.gold} label="Gold" />
        <ResourceChip icon="🪵" value={resources.wood} label="Wood" />
        <ResourceChip icon="🪨" value={resources.stone} label="Stone" />
        <ResourceChip icon="🍞" value={resources.provisions} label="Supply" />
      </View>

      <View style={styles.summaryRow}>
        <GameCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>CAMPAIGN GRID</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {currentWagonStage.width}×{currentWagonStage.height}
          </Text>
          <Text style={[styles.summaryNote, { color: accent }]}>
            {faction.wagonName}
          </Text>
        </GameCard>

        <GameCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>ACTIVE ARMY</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {activeUnits.length}/2
          </Text>
          <Text style={[styles.summaryNote, { color: accent }]}>starting squads</Text>
        </GameCard>
      </View>

      <SectionTitle title={'Unique mechanic · ' + faction.mechanicName} />
      <GameCard accent={accent}>
        <Text style={[styles.mechanicName, { color: theme.colors.text }]}>
          {faction.mechanicName}
        </Text>
        <Text style={[styles.mechanicBody, { color: theme.colors.textMuted }]}>
          {faction.mechanicSummary}
        </Text>
        <Text style={[styles.identity, { color: accent }]}>
          {faction.gameplayIdentity}
        </Text>
      </GameCard>

      <SectionTitle title="Starting Army" trailing={String(activeUnits.length)} />
      <View style={styles.unitList}>
        {activeUnits.map(unit => (
          <GameCard key={unit.id}>
            <View style={styles.unitRow}>
              <UnitPortrait
                name={unit.name}
                className={unit.className + ' · Lv. ' + unit.level}
                accent={accent}
                compact
              />
              <Pill label={unit.role.toUpperCase()} />
            </View>
          </GameCard>
        ))}
      </View>

      <GameCard>
        <Text style={[styles.guideTitle, { color: theme.colors.text }]}>Next objective</Text>
        <Text style={[styles.guideBody, { color: theme.colors.textMuted }]}>
          Open Campaign to fight the first Chapter 1 battle. This faction has its own army, formation and progression state; switching campaigns does not overwrite the others.
        </Text>
      </GameCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  resources: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: { flex: 1 },
  summaryLabel: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1 },
  summaryValue: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  summaryNote: { fontSize: 9.5, fontWeight: '800', marginTop: 3 },
  mechanicName: { fontSize: 17, fontWeight: '900' },
  mechanicBody: { fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  identity: { fontSize: 10.5, lineHeight: 15, fontWeight: '900', marginTop: 8 },
  unitList: { gap: 8 },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  guideTitle: { fontSize: 15, fontWeight: '900' },
  guideBody: { fontSize: 11, lineHeight: 17, marginTop: 5 }
});
