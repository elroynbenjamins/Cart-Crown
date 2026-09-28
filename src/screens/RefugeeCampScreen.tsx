import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';

export function RefugeeCampScreen({ onExit }: { onExit: () => void }) {
  const { theme } = useGameTheme();
  const {
    refugeeCampSecured,
    completeRefugeeCamp
  } = useGame();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <Text style={[styles.eyebrow, { color: theme.colors.human }]}>SUPPLY EVENT</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Refugee Camp</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Families displaced from the western road have gathered outside Greenkeep. Taking them in costs organization, but several are experienced teamsters, cooks and storekeepers.
        </Text>
      </GameCard>

      <SectionTitle title="Kingdom impact" />

      <GameCard>
        <View style={styles.impactRow}>
          <Text style={styles.icon}>📦</Text>
          <View style={styles.impactCopy}>
            <Text style={[styles.impactTitle, { color: theme.colors.text }]}>Quartermaster unlocked</Text>
            <Text style={[styles.impactBody, { color: theme.colors.textMuted }]}>
              A permanent support building for provisions, Expeditions and daily supply efficiency.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard>
        <View style={styles.impactRow}>
          <Text style={styles.icon}>🍞</Text>
          <View style={styles.impactCopy}>
            <Text style={[styles.impactTitle, { color: theme.colors.text }]}>Recovered stores</Text>
            <Text style={[styles.impactBody, { color: theme.colors.textMuted }]}>
              +20 Provisions · +15 Wood. The new residents bring carts, preserved food and salvageable timber.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.noteTitle, { color: theme.colors.text }]}>Why this matters</Text>
        <Text style={[styles.noteBody, { color: theme.colors.textMuted }]}>
          Campaign milestones unlock the people and knowledge needed for buildings. The Kingdom then decides where resources are invested and which systems improve first.
        </Text>
      </GameCard>

      {!refugeeCampSecured ? (
        <PrimaryButton
          label="Welcome the Refugees"
          onPress={() => {
            completeRefugeeCamp();
          }}
        />
      ) : (
        <PrimaryButton label="Return to Campaign" onPress={onExit} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  impactRow: { flexDirection: 'row', gap: 12 },
  icon: { fontSize: 28 },
  impactCopy: { flex: 1 },
  impactTitle: { fontSize: 15, fontWeight: '900' },
  impactBody: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  noteTitle: { fontSize: 15, fontWeight: '900' },
  noteBody: { fontSize: 11, lineHeight: 17, marginTop: 5 }
});
