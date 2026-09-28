import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { starterUnits } from '../game/data';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, SectionTitle, UnitPortrait } from '../ui/components';

const slotLocks = ['Settlement', 'Fort', 'Town', 'Stronghold'];

export function FormationScreen() {
  const { theme } = useGameTheme();
  const slots = Array.from({ length: 6 });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard>
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>ACTIVE FORMATION</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Balanced Line</Text>
          </View>
          <Pill label="2 / 2 squads" color={theme.colors.human + '55'} />
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Your formation grows with the settlement. Positioning will matter more as new roles unlock.
        </Text>
      </GameCard>

      <SectionTitle title="Battle formation" trailing="Front → Back" />

      <View style={styles.board}>
        {slots.map((_, index) => {
          const unit = starterUnits[index];
          const locked = index >= starterUnits.length;
          const rowLabel = index < 3 ? 'FRONT' : 'BACK';

          return (
            <View
              key={index}
              style={[
                styles.slot,
                {
                  backgroundColor: unit ? theme.colors.surface1 : theme.colors.surface2,
                  borderColor: unit ? theme.colors.human : theme.colors.border,
                  opacity: locked ? 0.68 : 1
                }
              ]}
            >
              <Text style={[styles.rowLabel, { color: theme.colors.textMuted }]}>{rowLabel}</Text>
              {unit ? (
                <>
                  <View style={[styles.slotPortrait, { borderColor: theme.colors.human }]}>
                    <Text style={[styles.slotInitial, { color: theme.colors.human }]}>
                      {unit.name[0]}
                    </Text>
                  </View>
                  <Text style={[styles.slotName, { color: theme.colors.text }]}>{unit.name}</Text>
                  <Text style={[styles.slotClass, { color: theme.colors.textMuted }]}>
                    {unit.className}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.lock, { color: theme.colors.textMuted }]}>🔒</Text>
                  <Text style={[styles.lockTitle, { color: theme.colors.textMuted }]}>
                    Slot {index + 1}
                  </Text>
                  <Text style={[styles.lockRule, { color: theme.colors.textMuted }]}>
                    {slotLocks[index - 2] ?? 'Locked'}
                  </Text>
                </>
              )}
            </View>
          );
        })}
      </View>

      <SectionTitle title="Active squads" />

      <View style={styles.unitList}>
        {starterUnits.map(unit => (
          <GameCard key={unit.id}>
            <View style={styles.unitRow}>
              <UnitPortrait
                name={unit.name}
                className={unit.className}
                accent={theme.colors.human}
                compact
              />
              <View style={styles.stats}>
                <Text style={[styles.stat, { color: theme.colors.text }]}>HP {unit.hp}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ATK {unit.attack}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ARM {unit.armor}</Text>
              </View>
            </View>
          </GameCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 9
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  slot: {
    width: '31.5%',
    aspectRatio: 0.82,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowLabel: {
    position: 'absolute',
    left: 8,
    top: 7,
    fontSize: 8,
    fontWeight: '900'
  },
  slotPortrait: {
    width: 45,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  slotInitial: {
    fontSize: 18,
    fontWeight: '900'
  },
  slotName: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 7
  },
  slotClass: {
    fontSize: 9,
    marginTop: 2
  },
  lock: {
    fontSize: 19
  },
  lockTitle: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 6
  },
  lockRule: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 3
  },
  unitList: {
    gap: 8
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  stats: {
    alignItems: 'flex-end',
    gap: 3
  },
  stat: {
    fontSize: 10,
    fontWeight: '800'
  }
});
