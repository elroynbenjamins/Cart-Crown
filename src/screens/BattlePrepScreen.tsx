import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { holdTheRoadEncounter } from '../game/data';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SectionTitle, UnitPortrait } from '../ui/components';

export function BattlePrepScreen({ onBegin }: { onBegin: () => void }) {
  const { theme } = useGameTheme();
  const { units, formation, wagonItems, unlockedFormationSlots } = useGame();
  const activeUnits = unlockedFormationSlots
    .map(slot => formation[slot])
    .filter((unitId): unitId is string => Boolean(unitId))
    .map(unitId => units.find(unit => unit.id === unitId))
    .filter((unit): unit is NonNullable<typeof unit> => Boolean(unit));

  const hasFood = wagonItems.some(item => item.id === 'rations');
  const hasMedicine = wagonItems.some(item => item.id === 'medicine');

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.danger}>
        <View style={styles.encounterHeader}>
          <View style={styles.encounterCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.danger }]}>BATTLE PREP</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{holdTheRoadEncounter.name}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {holdTheRoadEncounter.subtitle}
            </Text>
          </View>
          <Pill label={holdTheRoadEncounter.difficulty} color={theme.colors.danger + '35'} />
        </View>
      </GameCard>

      <SectionTitle title="Enemy" />
      <GameCard>
        <View style={styles.enemyRow}>
          <View style={[styles.enemyMark, { borderColor: theme.colors.danger }]}>
            <Text style={[styles.enemyMarkText, { color: theme.colors.danger }]}>R</Text>
          </View>
          <View style={styles.enemyCopy}>
            <Text style={[styles.enemyName, { color: theme.colors.text }]}>
              {holdTheRoadEncounter.enemyName}
            </Text>
            <Text style={[styles.enemyMeta, { color: theme.colors.textMuted }]}>
              {holdTheRoadEncounter.enemyCount} raiders · light armor · melee pressure
            </Text>
          </View>
        </View>
      </GameCard>

      <SectionTitle title="Your formation" trailing={String(activeUnits.length) + ' squads'} />
      <View style={styles.unitList}>
        {activeUnits.map(unit => (
          <GameCard key={unit.id}>
            <View style={styles.unitRow}>
              <UnitPortrait
                name={unit.name}
                className={unit.className + ' · Lv. ' + unit.level}
                accent={theme.colors.human}
                compact
              />
              <View style={styles.unitStats}>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ATK {unit.attack}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ARM {unit.armor}</Text>
              </View>
            </View>
          </GameCard>
        ))}
      </View>

      <SectionTitle title="Readiness" />
      <GameCard>
        <View style={styles.readinessList}>
          <View style={styles.readinessRow}>
            <Text style={[styles.readinessIcon, { color: hasFood ? theme.colors.primary : theme.colors.danger }]}>
              {hasFood ? '✓' : '!'}
            </Text>
            <Text style={[styles.readinessText, { color: theme.colors.text }]}>Food packed</Text>
          </View>
          <View style={styles.readinessRow}>
            <Text style={[styles.readinessIcon, { color: hasMedicine ? theme.colors.primary : theme.colors.gold }]}>
              {hasMedicine ? '✓' : '!'}
            </Text>
            <Text style={[styles.readinessText, { color: theme.colors.text }]}>Medicine available</Text>
          </View>
          <View style={styles.readinessRow}>
            <Text style={[styles.readinessIcon, { color: theme.colors.primary }]}>✓</Text>
            <Text style={[styles.readinessText, { color: theme.colors.text }]}>No ranged ammunition required</Text>
          </View>
        </View>
      </GameCard>

      <PrimaryButton label="Begin Battle" onPress={onBegin} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 30,
    gap: 14
  },
  encounterHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  encounterCopy: {
    flex: 1
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6
  },
  enemyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  enemyMark: {
    width: 58,
    height: 64,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  enemyMarkText: {
    fontSize: 22,
    fontWeight: '900'
  },
  enemyCopy: {
    flex: 1
  },
  enemyName: {
    fontSize: 16,
    fontWeight: '900'
  },
  enemyMeta: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  unitList: {
    gap: 8
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  unitStats: {
    alignItems: 'flex-end',
    gap: 3
  },
  stat: {
    fontSize: 10,
    fontWeight: '800'
  },
  readinessList: {
    gap: 10
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  readinessIcon: {
    width: 20,
    fontSize: 16,
    fontWeight: '900'
  },
  readinessText: {
    fontSize: 13,
    fontWeight: '700'
  }
});
