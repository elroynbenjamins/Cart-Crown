import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { starterUnits } from '../game/data';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, SectionTitle, UnitPortrait } from '../ui/components';

const recruitChoices = [
  {
    name: 'Archer',
    role: 'Ranged',
    pitch: 'Immediate ranged pressure and the first ammunition build.'
  },
  {
    name: 'Scout',
    role: 'Skirmish',
    pitch: 'Fast flexible unit that can later become mounted.'
  },
  {
    name: 'Field Medic',
    role: 'Support',
    pitch: 'Early sustain and stronger medicine synergies.'
  }
];

export function ArmyScreen() {
  const { theme } = useGameTheme();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>GREENKEEP REMNANT</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Army</Text>
          </View>
          <Pill label="2 active" color={theme.colors.human + '55'} />
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Your first squads are survivors, not disposable cards. Experience and equipment shape their promotion paths.
        </Text>
      </GameCard>

      <SectionTitle title="Active squads" />

      <View style={styles.unitList}>
        {starterUnits.map(unit => (
          <GameCard key={unit.id}>
            <View style={styles.unitRow}>
              <UnitPortrait
                name={unit.name}
                className={unit.className + ' · Lv. ' + unit.level}
                accent={theme.colors.human}
              />
              <View style={styles.stats}>
                <Text style={[styles.stat, { color: theme.colors.text }]}>HP {unit.hp}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ATK {unit.attack}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ARM {unit.armor}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>SPD {unit.speed}</Text>
              </View>
            </View>

            {unit.className === 'Recruit' ? (
              <View style={[styles.promotionPreview, { backgroundColor: theme.colors.surface2 }]}>
                <Text style={[styles.previewTitle, { color: theme.colors.text }]}>Future promotion</Text>
                <Text style={[styles.previewBody, { color: theme.colors.textMuted }]}>
                  Equipment will decide whether this recruit becomes infantry, ranged, support or a scout.
                </Text>
              </View>
            ) : null}
          </GameCard>
        ))}
      </View>

      <SectionTitle title="Third squad" trailing="Unlocks at Settlement" />

      <GameCard>
        <Text style={[styles.lockedTitle, { color: theme.colors.text }]}>First Reinforcements</Text>
        <Text style={[styles.lockedBody, { color: theme.colors.textMuted }]}>
          After Hold the Road, Greenkeep can support one more squad. You will choose one of three early paths.
        </Text>

        <View style={styles.choiceList}>
          {recruitChoices.map(choice => (
            <View
              key={choice.name}
              style={[styles.choice, { backgroundColor: theme.colors.surface2 }]}
            >
              <View style={[styles.choiceIcon, { borderColor: theme.colors.human }]}>
                <Text style={[styles.choiceInitial, { color: theme.colors.human }]}>
                  {choice.name[0]}
                </Text>
              </View>
              <View style={styles.choiceCopy}>
                <Text style={[styles.choiceName, { color: theme.colors.text }]}>
                  {choice.name}
                </Text>
                <Text style={[styles.choiceRole, { color: theme.colors.human }]}>
                  {choice.role}
                </Text>
                <Text style={[styles.choicePitch, { color: theme.colors.textMuted }]}>
                  {choice.pitch}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </GameCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start'
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
    marginTop: 8
  },
  unitList: {
    gap: 10
  },
  unitRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  stats: {
    alignItems: 'flex-end',
    gap: 2
  },
  stat: {
    fontSize: 10,
    fontWeight: '800'
  },
  promotionPreview: {
    borderRadius: 14,
    padding: 11,
    marginTop: 12
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '900'
  },
  previewBody: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3
  },
  lockedTitle: {
    fontSize: 17,
    fontWeight: '900'
  },
  lockedBody: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5
  },
  choiceList: {
    gap: 8,
    marginTop: 14
  },
  choice: {
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center'
  },
  choiceIcon: {
    width: 42,
    height: 48,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  choiceInitial: {
    fontSize: 17,
    fontWeight: '900'
  },
  choiceCopy: {
    flex: 1
  },
  choiceName: {
    fontSize: 14,
    fontWeight: '900'
  },
  choiceRole: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 2
  },
  choicePitch: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3
  }
});
