import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, UnitPortrait } from '../ui/components';

export function RecruitmentScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useGameTheme();
  const { recruitOptions, chooseRecruit } = useGame();
  const [selectedId, setSelectedId] = useState(recruitOptions[0]?.id ?? '');

  const selected = recruitOptions.find(option => option.id === selectedId);

  const confirm = () => {
    if (selected && chooseRecruit(selected.id)) {
      onComplete();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.colors.human }]}>FIRST REINFORCEMENTS</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Choose your third squad</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Greenkeep can support one more warband. This is your first meaningful army-building choice.
        </Text>
      </View>

      <View style={styles.choices}>
        {recruitOptions.map(option => {
          const selectedOption = option.id === selectedId;

          return (
            <View key={option.id} onTouchEnd={() => setSelectedId(option.id)}>
              <GameCard accent={selectedOption ? theme.colors.primary : undefined}>
                <View style={styles.choiceHeader}>
                  <UnitPortrait
                    name={option.unit.name}
                    className={option.unit.className + ' · ' + option.archetype}
                    accent={selectedOption ? theme.colors.primary : theme.colors.human}
                  />
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: selectedOption ? theme.colors.primary : theme.colors.border,
                        backgroundColor: selectedOption ? theme.colors.primary : 'transparent'
                      }
                    ]}
                  />
                </View>

                <Text style={[styles.pitch, { color: theme.colors.text }]}>{option.pitch}</Text>
                <Text style={[styles.tradeoff, { color: theme.colors.textMuted }]}>
                  Tradeoff: {option.tradeoff}
                </Text>

                <View style={styles.stats}>
                  <Text style={[styles.stat, { color: theme.colors.text }]}>HP {option.unit.hp}</Text>
                  <Text style={[styles.stat, { color: theme.colors.text }]}>ATK {option.unit.attack}</Text>
                  <Text style={[styles.stat, { color: theme.colors.text }]}>ARM {option.unit.armor}</Text>
                  <Text style={[styles.stat, { color: theme.colors.text }]}>SPD {option.unit.speed}</Text>
                </View>
              </GameCard>
            </View>
          );
        })}
      </View>

      <PrimaryButton
        label={selected ? 'Recruit ' + selected.unit.className : 'Choose a recruit'}
        disabled={!selected}
        onPress={confirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 30,
    gap: 14
  },
  header: {
    paddingVertical: 10
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    marginTop: 5
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7
  },
  choices: {
    gap: 10
  },
  choiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2
  },
  pitch: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 12
  },
  tradeoff: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  stat: {
    fontSize: 10,
    fontWeight: '900'
  }
});
