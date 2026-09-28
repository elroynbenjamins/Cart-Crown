import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';
import { CampaignNodeSprite, FactionCrest, ResourceSiteSprite } from '../ui/gameArt';

export function FactionChapterThreeEventScreen({
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
    completeFactionChapterThreeEvent
  } = useGame();

  const elf = activeFaction === 'elf';
  const accent = elf ? theme.colors.elf : theme.colors.orc;
  const nodeId =
    stage === 'resource'
      ? elf ? 'elf3_node_3' : 'orc3_node_3'
      : elf ? 'elf3_node_5' : 'orc3_node_5';
  const completed = Boolean(
    chapterNodes.find(node => node.id === nodeId)?.completed
  );

  const title =
    stage === 'resource'
      ? elf ? 'Silent Beacons' : 'Trial Fires'
      : elf ? 'Rootway Council' : 'Clan Oath';

  const body =
    stage === 'resource'
      ? elf
        ? 'The Wardhold relights the silent moon-beacons and reopens a protected route through the pass.'
        : 'Stonejaw allows Emberclan to light trial fires along the quarry roads after the first challenge is passed.'
      : elf
        ? 'Heartgrove agrees to bind the Moonlit Pass rootways into one protected network before confronting the Pale Ranger.'
        : 'The clans swear a temporary Stonejaw Oath: no clan may answer a false standard without first calling the others.';

  const result =
    stage === 'resource'
      ? elf
        ? 'Unlocks Moonlit Watch regional production.'
        : 'Unlocks Stonejaw Quarry regional production.'
      : elf
        ? 'The Wardhold is politically ready to become an Enclave after the Pale Ranger is removed.'
        : 'The Warhold is politically ready to become a Great Warhold after the Stonejaw Champion yields.';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: accent }]}>CHAPTER 3 EVENT</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{body}</Text>
          </View>
          <FactionCrest faction={activeFaction} size={48} />
        </View>
      </GameCard>

      <SectionTitle title={stage === 'resource' ? 'Regional network' : 'Faction agreement'} />

      <GameCard>
        <View style={styles.row}>
          <View style={styles.eventArt}>
            {stage === 'resource' ? (
              <ResourceSiteSprite
                siteId={elf ? 'elf_moonlit_watch' : 'orc_stonejaw_quarry'}
                faction={activeFaction}
                size={48}
              />
            ) : (
              <CampaignNodeSprite type="event" faction={activeFaction} active size={36} />
            )}
          </View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
              {stage === 'resource' ? 'Permanent route secured' : 'The next tier is prepared'}
            </Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              {result}
            </Text>
          </View>
        </View>
      </GameCard>

      {!completed ? (
        <PrimaryButton
          label={stage === 'resource' ? 'Restore the Route' : 'Seal the Agreement'}
          onPress={() => completeFactionChapterThreeEvent(stage)}
        />
      ) : (
        <PrimaryButton
          label={
            stage === 'resource'
              ? elf ? 'Enter the Ashen Groves' : 'Cross the Broken Steppe'
              : elf ? 'Confront the Pale Ranger' : 'Face the Stonejaw Champion'
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
