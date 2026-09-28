import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SectionTitle } from '../ui/components';

export function LastLoyalistsScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    lastLoyalistChoices,
    lastLoyalistsChoiceId,
    chooseLastLoyalistsApproach
  } = useGame();

  const [selectedId, setSelectedId] = useState(
    lastLoyalistsChoiceId ?? lastLoyalistChoices[0]?.id ?? ''
  );

  const selected =
    lastLoyalistChoices.find(choice => choice.id === selectedId) ?? null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>CROWNROAD DECISION</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>The Last Loyalists</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          The captured officers finally accept that no living monarch is issuing their orders. A smaller loyalist force still guards the Pretender General, and Greenkeep must decide how to break that final allegiance.
        </Text>
      </GameCard>

      <SectionTitle title="Choose your approach" trailing="Pretender General" />

      <View style={styles.list}>
        {lastLoyalistChoices.map(choice => {
          const chosen = selectedId === choice.id;
          const locked = Boolean(lastLoyalistsChoiceId);

          return (
            <View
              key={choice.id}
              onTouchEnd={() => {
                if (!locked) setSelectedId(choice.id);
              }}
            >
              <GameCard accent={chosen ? theme.colors.gold : undefined}>
                <View style={styles.header}>
                  <View style={styles.copy}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>
                      {choice.name}
                    </Text>
                    <Text style={[styles.description, { color: theme.colors.textMuted }]}>
                      {choice.description}
                    </Text>
                  </View>
                  <Pill label={locked && chosen ? 'LOCKED' : chosen ? 'SELECTED' : 'OPTION'} />
                </View>
                <Text style={[styles.effect, { color: theme.colors.primary }]}>
                  {choice.effectText}
                </Text>
              </GameCard>
            </View>
          );
        })}
      </View>

      {lastLoyalistsChoiceId ? (
        <PrimaryButton label="Confront the Pretender General" onPress={onComplete} />
      ) : (
        <PrimaryButton
          label={selected ? 'Choose ' + selected.name : 'Choose approach'}
          disabled={!selected}
          onPress={() => {
            if (selected) chooseLastLoyalistsApproach(selected.id);
          }}
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
  effect: { fontSize: 10.5, lineHeight: 15, fontWeight: '900', marginTop: 9 }
});
