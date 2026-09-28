import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, UnitPortrait } from '../ui/components';

export function FactionRecruitmentScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    recruitOptions,
    recruitChosen,
    chooseRecruit
  } = useGame();

  const [selectedId, setSelectedId] = useState(
    recruitOptions[0]?.id ?? ''
  );
  const [message, setMessage] = useState<string | null>(null);

  const faction = factions[activeFaction];
  const accent =
    activeFaction === 'elf' ? theme.colors.elf : theme.colors.orc;
  const selected =
    recruitOptions.find(option => option.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected) return;
    if (chooseRecruit(selected.id)) {
      setMessage(selected.unit.className + ' joined the campaign.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <Text style={[styles.eyebrow, { color: accent }]}>
          {activeFaction === 'elf' ? 'SANCTUARY MUSTER' : 'CLAN MUSTER'}
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Choose your third squad
        </Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          {faction.name} can now support a third active squad. This choice begins Chapter 2 and should complement your commander path and formation style.
        </Text>
      </GameCard>

      <View style={styles.list}>
        {recruitOptions.map(option => {
          const selectedOption = selectedId === option.id;

          return (
            <View
              key={option.id}
              onTouchEnd={() => {
                if (!recruitChosen) setSelectedId(option.id);
              }}
            >
              <GameCard accent={selectedOption ? theme.colors.gold : undefined}>
                <View style={styles.header}>
                  <UnitPortrait
                    name={option.unit.name}
                    className={option.unit.className + ' · Lv. ' + option.unit.level}
                    accent={selectedOption ? theme.colors.gold : accent}
                  />
                  <Pill label={option.archetype.toUpperCase()} />
                </View>
                <Text style={[styles.pitch, { color: theme.colors.text }]}>
                  {option.pitch}
                </Text>
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

      {recruitChosen ? (
        <PrimaryButton label="Continue Chapter 2" onPress={onComplete} />
      ) : (
        <PrimaryButton
          label={selected ? 'Recruit ' + selected.unit.className : 'Choose squad'}
          disabled={!selected}
          onPress={confirm}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  list: { gap: 9 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pitch: { fontSize: 11.5, lineHeight: 17, fontWeight: '800', marginTop: 10 },
  tradeoff: { fontSize: 10.5, lineHeight: 15, marginTop: 5 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 10 },
  stat: { fontSize: 9.5, fontWeight: '900' },
  message: { textAlign: 'center', fontSize: 10.5, fontWeight: '800' }
});
