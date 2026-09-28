import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';

export function ForcedBeaconScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const { chapterNodes, completeForcedBeacon } = useGame();

  const completed = Boolean(
    chapterNodes.find(node => node.id === 'ch6_node_5')?.completed
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.danger}>
        <Text style={[styles.eyebrow, { color: theme.colors.danger }]}>CROWNFALL TRUTH</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>The Forced Beacon</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Ashen Court records show the Crownfall began when the Court bypassed the Concord safeguards and tried to force the Beacon to answer a single authority.
        </Text>
      </GameCard>

      <SectionTitle title="What actually happened" />

      <GameCard>
        <View style={styles.row}>
          <Text style={styles.icon}>⚡</Text>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Forced activation</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              The Beacon fractured because one faction’s authority was substituted for the three-part Concord. The disaster was engineered, not accidental.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard>
        <View style={styles.row}>
          <Text style={styles.icon}>🛡️</Text>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Human Oath Seal located</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              The Human component of the original safeguard—the Oath Seal—is still held inside Crownspire. Recovering it is now Greenkeep’s final objective.
            </Text>
          </View>
        </View>
      </GameCard>

      {!completed ? (
        <PrimaryButton label="Commit to the Final Assault" onPress={() => completeForcedBeacon()} />
      ) : (
        <PrimaryButton label="Return to Crownspire" onPress={onComplete} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  row: { flexDirection: 'row', gap: 12 },
  icon: { fontSize: 28 },
  copy: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '900' },
  rowBody: { fontSize: 11, lineHeight: 16, marginTop: 4 }
});
