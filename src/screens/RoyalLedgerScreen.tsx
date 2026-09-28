import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';

export function RoyalLedgerScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const { chapterNodes, completeRoyalLedger } = useGame();

  const completed = Boolean(
    chapterNodes.find(node => node.id === 'ch5_node_5')?.completed
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.danger}>
        <Text style={[styles.eyebrow, { color: theme.colors.danger }]}>ASHEN COURT EVIDENCE</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>The Royal Ledger</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          The Envoy carried a private ledger linking mercenary payments, forged warnings, Crownroad officers and archive alterations to the same name: the Ashen Court.
        </Text>
      </GameCard>

      <SectionTitle title="The conspiracy is named" />

      <GameCard>
        <View style={styles.row}>
          <Text style={styles.icon}>🕯️</Text>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Ashen Court</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              A cross-racial network used legitimate institutions, false flags and manufactured emergencies to push every faction toward the same crisis.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard>
        <View style={styles.row}>
          <Text style={styles.icon}>🏰</Text>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Crownspire was always the target</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              The final payment trail ends at Crownspire. The Court was not simply exploiting the Crownfall—it was positioning people around the old Concord Beacon.
            </Text>
          </View>
        </View>
      </GameCard>

      {!completed ? (
        <PrimaryButton label="Copy the Ledger for Every Province" onPress={() => completeRoyalLedger()} />
      ) : (
        <PrimaryButton label="March to the Gate of Crownspire" onPress={onComplete} />
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
