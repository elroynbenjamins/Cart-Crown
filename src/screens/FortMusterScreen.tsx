import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, UnitPortrait } from '../ui/components';

export function FortMusterScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useGameTheme();
  const {
    fortMusterOptions,
    fourthRecruitChosen,
    chooseFortRecruit
  } = useGame();
  const [selectedId, setSelectedId] = useState(fortMusterOptions[0]?.id ?? '');
  const [message, setMessage] = useState<string | null>(null);

  const selected = fortMusterOptions.find(option => option.id === selectedId);

  const confirm = () => {
    if (!selected) return;
    if (chooseFortRecruit(selected.id)) {
      setMessage(selected.unit.className + ' joined the Fort garrison.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <Text style={[styles.eyebrow, { color: theme.colors.human }]}>CHAPTER 2 · FORT MUSTER</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Choose your fourth squad</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Greenkeep Fort can support another active squad. This choice shapes how the army enters the Iron Road.
        </Text>
      </GameCard>

      <View style={styles.list}>
        {fortMusterOptions.map(option => {
          const selectedOption = option.id === selectedId;

          return (
            <View key={option.id} onTouchEnd={() => setSelectedId(option.id)}>
              <GameCard accent={selectedOption ? theme.colors.gold : undefined}>
                <View style={styles.header}>
                  <UnitPortrait
                    name={option.unit.name}
                    className={option.unit.className + ' · Lv. ' + option.unit.level}
                    accent={selectedOption ? theme.colors.gold : theme.colors.human}
                  />
                  <Pill label={option.archetype.toUpperCase()} />
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

      {message ? (
        <Text style={[styles.message, { color: theme.colors.primary }]}>{message}</Text>
      ) : null}

      {fourthRecruitChosen ? (
        <PrimaryButton label="Continue to the Iron Road" onPress={onComplete} />
      ) : (
        <PrimaryButton
          label={selected ? 'Recruit ' + selected.unit.className : 'Choose a squad'}
          disabled={!selected}
          onPress={confirm}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.15 },
  title: { fontSize: 27, lineHeight: 33, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  list: { gap: 9 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pitch: { fontSize: 12, lineHeight: 17, fontWeight: '800', marginTop: 11 },
  tradeoff: { fontSize: 10.5, lineHeight: 15, marginTop: 5 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 10 },
  stat: { fontSize: 9.5, fontWeight: '900' },
  message: { textAlign: 'center', fontSize: 11, fontWeight: '800' }
});
