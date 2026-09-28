import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle, StatusPill } from '../ui/components';
import { CampaignNodeSprite, FactionCrest, ResourceSiteSprite } from '../ui/gameArt';

export function FactionChapterFiveEventScreen({
  stage,
  onComplete
}: {
  stage: 'muster' | 'resource' | 'seal';
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNodes,
    completeFactionChapterFiveEvent
  } = useGame();

  const elf = activeFaction === 'elf';
  const accent = elf ? theme.colors.elf : theme.colors.orc;

  const nodeId =
    stage === 'muster'
      ? elf
        ? 'elf5_node_1'
        : 'orc5_node_1'
      : stage === 'resource'
        ? elf
          ? 'elf5_node_3'
          : 'orc5_node_3'
        : elf
          ? 'elf5_node_5'
          : 'orc5_node_5';

  const completed = Boolean(
    chapterNodes.find(node => node.id === nodeId)?.completed
  );

  const title =
    stage === 'muster'
      ? elf
        ? 'Worldroot Muster'
        : 'High Warhold Muster'
      : stage === 'resource'
        ? elf
          ? 'Rootscar Records'
          : 'Missing Warfires'
        : elf
          ? 'Echo of the Root Seal'
          : 'Echo of the Clan Seal';

  const body =
    stage === 'muster'
      ? elf
        ? 'The Worldroot Sanctuary can already field six squads. The final preparation is not another recruit: the army must commit enough food and repair stock to keep all six formations moving together.'
        : 'The High Warhold has reached the six-squad cap. Every clan now contributes to one campaign column instead of sending separate warbands.'
      : stage === 'resource'
        ? elf
          ? 'The Worldroot scars contain maintenance records from before the Crownfall. They show the Root Seal was one part of a three-part Concord safeguard.'
          : 'The missing Warfires were not destroyed. Their keepers were bribed to extinguish them at specific times, isolating clans during the Crownfall.'
        : elf
          ? 'The records do not contain the Root Seal itself. They reveal that its living signature still points toward Crownspire, where the real Seal must be recovered.'
          : 'Old clan oath-stones confirm the Clan Seal survived the Crownfall and was taken toward Crownspire. The High Warhold now knows what it must recover.';

  const result =
    stage === 'muster'
      ? elf
        ? '+25 Provisions · +25 Gold for the Worldroot march.'
        : '+28 Provisions · +20 Gold from the united clans.'
      : stage === 'resource'
        ? elf
          ? 'Unlocks Worldroot Nursery: +5 Wood and +4 Provisions per meaningful activity.'
          : 'Unlocks United Clan Depot: +3 Iron and +4 Provisions per meaningful activity.'
        : elf
          ? 'Root Seal location identified; Worldroot Guardian becomes the last obstacle before the Crownspire road.'
          : 'Clan Seal location identified; the Last Clanbreaker becomes the final obstacle before the Crownspire road.';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent} faction={activeFaction}>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: accent }]}>CHAPTER 5</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{body}</Text>
          </View>
          <FactionCrest faction={activeFaction} size={48} />
        </View>
      </GameCard>

      <SectionTitle
        title={
          stage === 'muster'
            ? 'Six-squad campaign'
            : stage === 'resource'
              ? 'Recovered network'
              : 'Concord evidence'
        }
      />

      <GameCard faction={activeFaction} state={completed ? 'ready' : 'default'}>
        <View style={styles.row}>
          <View style={styles.eventArt}>
            {stage === 'muster' ? (
              <FactionCrest faction={activeFaction} size={44} />
            ) : stage === 'resource' ? (
              <ResourceSiteSprite
                siteId={elf ? 'elf_worldroot_nursery' : 'orc_united_clan_depot'}
                faction={activeFaction}
                size={48}
              />
            ) : (
              <CampaignNodeSprite type="event" faction={activeFaction} active size={38} />
            )}
          </View>
          <View style={styles.copy}>
            <View style={styles.progressHeader}>
              <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
                {stage === 'seal' ? 'The Seal is not recovered yet' : 'Campaign progress'}
              </Text>
              <StatusPill label={completed ? 'DONE' : 'ACTIVE'} tone={completed ? 'done' : 'current'} />
            </View>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              {result}
            </Text>
          </View>
        </View>
      </GameCard>

      {!completed ? (
        <PrimaryButton
          label={
            stage === 'muster'
              ? 'Commit the Campaign Stores'
              : stage === 'resource'
                ? 'Secure the Records'
                : 'Trace the Seal to Crownspire'
          }
          onPress={() => completeFactionChapterFiveEvent(stage)}
        />
      ) : (
        <PrimaryButton
          label={
            stage === 'muster'
              ? elf
                ? 'March to the Wounded Worldroot'
                : 'Leave No Clan Behind'
              : stage === 'resource'
                ? elf
                  ? 'Confront the Ashen Rootkeepers'
                  : 'Hunt the Ashen Clanbreakers'
                : elf
                  ? 'Face the Worldroot Guardian'
                  : 'Face the Last Clanbreaker'
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
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  eventArt: { width: 54, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowTitle: { fontSize: 15, fontWeight: '900' },
  rowBody: { fontSize: 11, lineHeight: 16, marginTop: 4 }
});
