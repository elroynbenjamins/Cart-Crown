import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SectionTitle } from '../ui/components';

export function ThreeWarningsScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useGameTheme();
  const {
    marcherWarningChoices,
    marcherWarningChoiceId,
    chooseMarcherWarning
  } = useGame();

  const [selectedId, setSelectedId] = useState(
    marcherWarningChoiceId ?? marcherWarningChoices[0]?.id ?? ''
  );
  const [message, setMessage] = useState<string | null>(null);

  const selected = marcherWarningChoices.find(choice => choice.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected) return;
    if (chooseMarcherWarning(selected.id)) {
      setMessage(selected.name + ' locked for the rest of Chapter 3.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>BORDER INTELLIGENCE</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Three Warnings</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Three marcher authorities sent contradictory warnings. You cannot verify every report before the Siege Road closes, so your army must choose how it will operate.
        </Text>
      </GameCard>

      <SectionTitle title="Choose an operational doctrine" trailing="Chapter 3" />

      <View style={styles.list}>
        {marcherWarningChoices.map(choice => {
          const chosen = selectedId === choice.id;
          const locked = Boolean(marcherWarningChoiceId);

          return (
            <View key={choice.id} onTouchEnd={() => {
              if (!locked) setSelectedId(choice.id);
            }}>
              <GameCard accent={chosen ? theme.colors.gold : undefined}>
                <View style={styles.header}>
                  <View style={styles.copy}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>{choice.name}</Text>
                    <Text style={[styles.description, { color: theme.colors.textMuted }]}>
                      {choice.description}
                    </Text>
                  </View>
                  <Pill label={locked && chosen ? 'LOCKED' : chosen ? 'SELECTED' : 'OPTION'} />
                </View>
                <Text style={[styles.effect, { color: theme.colors.primary }]}>{choice.effectText}</Text>
              </GameCard>
            </View>
          );
        })}
      </View>

      <GameCard>
        <Text style={[styles.noteTitle, { color: theme.colors.text }]}>This is not a permanent character build</Text>
        <Text style={[styles.noteBody, { color: theme.colors.textMuted }]}>
          The choice applies to Chapter 3 campaign battles only. It represents how Greenkeep responds to unreliable intelligence in the Border Marches.
        </Text>
      </GameCard>

      {message ? (
        <Text style={[styles.message, { color: theme.colors.primary }]}>{message}</Text>
      ) : null}

      {marcherWarningChoiceId ? (
        <PrimaryButton label="Continue to Siege Road" onPress={onComplete} />
      ) : (
        <PrimaryButton
          label={selected ? 'Choose ' + selected.name : 'Choose doctrine'}
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
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  copy: { flex: 1 },
  name: { fontSize: 16, fontWeight: '900' },
  description: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  effect: { fontSize: 10.5, lineHeight: 15, fontWeight: '900', marginTop: 9 },
  noteTitle: { fontSize: 14, fontWeight: '900' },
  noteBody: { fontSize: 10.5, lineHeight: 16, marginTop: 5 },
  message: { textAlign: 'center', fontSize: 10.5, fontWeight: '800' }
});
