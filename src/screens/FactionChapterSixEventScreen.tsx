import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';

export function FactionChapterSixEventScreen({
  stage,
  onComplete
}: {
  stage: 'concord' | 'seal';
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNodes,
    completeFactionChapterSixEvent
  } = useGame();

  const elf = activeFaction === 'elf';
  const accent = elf ? theme.colors.elf : theme.colors.orc;
  const nodeId =
    stage === 'concord'
      ? elf
        ? 'elf6_node_3'
        : 'orc6_node_3'
      : elf
        ? 'elf6_node_5'
        : 'orc6_node_5';

  const completed = Boolean(
    chapterNodes.find(node => node.id === nodeId)?.completed
  );

  const title =
    stage === 'concord'
      ? elf
        ? 'Concord Rootway'
        : 'Concord Warpath'
      : elf
        ? 'The Root Seal'
        : 'The Clan Seal';

  const body =
    stage === 'concord'
      ? elf
        ? 'The rootway beneath Crownspire contains Human engineering marks and Orc oath-stones beside Elven ward roots. The old Concord was physical infrastructure shared by all three peoples.'
        : 'The warpath beneath Crownspire was maintained jointly: Human roadworks, Elven root supports and Orc oath-stones all guarded the same Beacon approach.'
      : elf
        ? 'The Root Seal is finally within reach, but an Ashen Regent tears it from the living cradle and retreats deeper into Crownspire. The final battle will decide whether Heartgrove actually recovers it.'
        : 'The Clan Seal is found inside an old oath chamber, but an Ashen Warmaster seizes it before the clans can restore the oath. The final battle will decide whether the Seal returns to Orc hands.';

  const finding =
    stage === 'concord'
      ? elf
        ? 'Shared maintenance records prove the Root Seal was designed to work only beside the Human and Orc Seals.'
        : 'The warpath records prove the Clan Seal was never an Orc weapon; it was one-third of a shared safeguard.'
      : elf
        ? 'Root Seal located · not yet secured'
        : 'Clan Seal located · not yet secured';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <Text style={[styles.eyebrow, { color: accent }]}>FINAL FACTION CHAPTER</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>{body}</Text>
      </GameCard>

      <SectionTitle title={stage === 'concord' ? 'Concord evidence' : 'Seal chamber'} />

      <GameCard>
        <View style={styles.row}>
          <Text style={styles.icon}>{stage === 'concord' ? '🔗' : '🔐'}</Text>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
              {stage === 'concord' ? 'Three peoples, one system' : 'The final objective'}
            </Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              {finding}
            </Text>
          </View>
        </View>
      </GameCard>

      {!completed ? (
        <PrimaryButton
          label={stage === 'concord' ? 'Secure the Concord Route' : 'Pursue the Seal'}
          onPress={() => completeFactionChapterSixEvent(stage)}
        />
      ) : (
        <PrimaryButton
          label={
            stage === 'concord'
              ? elf
                ? 'Assault the Ashen Starwatch'
                : 'Break the Ashen Warfires'
              : elf
                ? 'Return through the Roots'
                : 'Take the Truth at Crownspire'
          }
          onPress={onComplete}
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
  row: { flexDirection: 'row', gap: 12 },
  icon: { fontSize: 28 },
  copy: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '900' },
  rowBody: { fontSize: 11, lineHeight: 16, marginTop: 4 }
});
