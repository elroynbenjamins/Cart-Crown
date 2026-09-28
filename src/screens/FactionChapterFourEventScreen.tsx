import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';
import { CampaignNodeSprite, FactionCrest, ResourceSiteSprite } from '../ui/gameArt';

export function FactionChapterFourEventScreen({
  stage,
  onComplete
}: {
  stage: 'resource' | 'council';
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNodes,
    completeFactionChapterFourEvent
  } = useGame();

  const elf = activeFaction === 'elf';
  const accent = elf ? theme.colors.elf : theme.colors.orc;
  const nodeId =
    stage === 'resource'
      ? elf
        ? 'elf4_node_3'
        : 'orc4_node_3'
      : elf
        ? 'elf4_node_5'
        : 'orc4_node_5';

  const completed = Boolean(
    chapterNodes.find(node => node.id === nodeId)?.completed
  );

  const title =
    stage === 'resource'
      ? elf
        ? 'The Burned Ward'
        : 'Split Warfire'
      : elf
        ? 'Living Root Council'
        : 'Two-Front Council';

  const body =
    stage === 'resource'
      ? elf
        ? 'The Enclave rebuilds a burned ward line instead of abandoning it, proving the corrupted groves can be restored rather than cut away.'
        : 'Emberclan establishes a permanent war camp between both fronts so false orders cannot isolate one clan from the other.'
      : elf
        ? 'The Enclave binds living rootways into the campaign network and authorizes Stag riders to carry ward-signals through ash territory.'
        : 'The clans agree that no front may be reinforced at the cost of abandoning another. Warg riders become the Warhold’s rapid response force.';

  const result =
    stage === 'resource'
      ? elf
        ? 'Unlocks Burned Ward Reclamation production.'
        : 'Unlocks Steppe War Camp production.'
      : elf
        ? 'Unlocks veteran Stag training and prepares the Ashen Druid hunt.'
        : 'Unlocks veteran Warg training and prepares the Split-Chieftain hunt.';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: accent }]}>CHAPTER 4 EVENT</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{body}</Text>
          </View>
          <FactionCrest faction={activeFaction} size={48} />
        </View>
      </GameCard>

      <SectionTitle title={stage === 'resource' ? 'Regional recovery' : 'Faction doctrine'} />

      <GameCard>
        <View style={styles.row}>
          <View style={styles.eventArt}>
            {stage === 'resource' ? (
              <ResourceSiteSprite
                siteId={elf ? 'elf_burned_ward_reclamation' : 'orc_steppe_war_camp'}
                faction={activeFaction}
                size={48}
              />
            ) : (
              <CampaignNodeSprite type="event" faction={activeFaction} active size={36} />
            )}
          </View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
              {stage === 'resource' ? 'Permanent infrastructure' : 'Mounted response unlocked'}
            </Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              {result}
            </Text>
          </View>
        </View>
      </GameCard>

      {!completed ? (
        <PrimaryButton
          label={stage === 'resource' ? 'Secure the Recovery Site' : 'Complete the Council'}
          onPress={() => completeFactionChapterFourEvent(stage)}
        />
      ) : (
        <PrimaryButton
          label={
            stage === 'resource'
              ? elf
                ? 'Fight on Two Fronts'
                : 'Enter the Broken Steppe War'
              : elf
                ? 'Confront the Ashen Druid'
                : 'Confront the Split-Chieftain'
          }
          onPress={onComplete}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroCopy: { flex: 1 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  row: { flexDirection: 'row', gap: 12 },
  eventArt: { width: 54, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '900' },
  rowBody: { fontSize: 11, lineHeight: 16, marginTop: 4 }
});
