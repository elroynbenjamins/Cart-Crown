import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';

export function GrandCouncilScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const { chapterNodes, activeRoyalDecree, completeGrandCouncil } = useGame();

  const completed = Boolean(
    chapterNodes.find(node => node.id === 'ch6_node_1')?.completed
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>FINAL HUMAN CAMPAIGN</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Grand Council</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Greenkeep’s officers, quartermasters and provincial delegates agree on one final objective: enter Crownspire, reach the Concord Beacon, and expose the Ashen Court before it can force another activation.
        </Text>
      </GameCard>

      <SectionTitle title="Campaign mandate" />

      <GameCard>
        <View style={styles.row}>
          <Text style={styles.icon}>📜</Text>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
              {activeRoyalDecree?.name ?? 'Capital administration'}
            </Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              Your current Royal Decree remains active throughout the Grand Campaign. Greenkeep does not abandon its governing priorities just because the army has reached Crownspire.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard>
        <View style={styles.row}>
          <Text style={styles.icon}>🛒</Text>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Final provisioning</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              Completing the council grants +50 Gold and +30 Provisions for the Crownspire push.
            </Text>
          </View>
        </View>
      </GameCard>

      {!completed ? (
        <PrimaryButton label="Authorize the Grand Campaign" onPress={() => completeGrandCouncil()} />
      ) : (
        <PrimaryButton label="March to the Sundered Fields" onPress={onComplete} />
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
