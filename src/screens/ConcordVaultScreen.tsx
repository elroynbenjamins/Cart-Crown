import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';

export function ConcordVaultScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const { chapterNodes, completeConcordVault } = useGame();

  const completed = Boolean(
    chapterNodes.find(node => node.id === 'ch6_node_3')?.completed
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <Text style={[styles.eyebrow, { color: theme.colors.human }]}>CROWNSPIRE VAULT</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Concord Vault</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Beneath a neutral road shrine lies a sealed maintenance vault built for Human, Elf and Orc engineers before the Crownfall.
        </Text>
      </GameCard>

      <SectionTitle title="Recovered evidence" />

      <GameCard>
        <View style={styles.row}>
          <Text style={styles.icon}>🔐</Text>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Concord Cache</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              Neutral stores join Greenkeep’s production network: +6 Gold, +3 Iron and +2 Provisions per meaningful activity.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.noteTitle, { color: theme.colors.text }]}>The Beacon was shared</Text>
        <Text style={[styles.noteBody, { color: theme.colors.textMuted }]}>
          The maintenance plans confirm the Concord Beacon was never Human property. Its safeguards required all three peoples to participate, explaining why the Ashen Court needed every faction destabilized at once.
        </Text>
      </GameCard>

      {!completed ? (
        <PrimaryButton label="Open the Concord Cache" onPress={() => completeConcordVault()} />
      ) : (
        <PrimaryButton label="Enter the Ashen Court District" onPress={onComplete} />
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
  rowBody: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  noteTitle: { fontSize: 15, fontWeight: '900' },
  noteBody: { fontSize: 11, lineHeight: 17, marginTop: 5 }
});
