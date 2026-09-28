import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';
import { CampaignNodeSprite, FactionCrest, ResourceSiteSprite } from '../ui/gameArt';

export function FactionChapterTwoEventScreen({
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
    completeFactionChapterTwoEvent
  } = useGame();

  const elf = activeFaction === 'elf';
  const accent = elf ? theme.colors.elf : theme.colors.orc;
  const nodeId =
    stage === 'resource'
      ? elf
        ? 'elf2_node_3'
        : 'orc2_node_3'
      : elf
        ? 'elf2_node_5'
        : 'orc2_node_5';
  const completed = Boolean(
    chapterNodes.find(node => node.id === nodeId)?.completed
  );

  const title =
    stage === 'resource'
      ? elf
        ? 'Moonwell Grove'
        : 'Warg Pens'
      : elf
        ? 'Root Council'
        : 'Warfire Council';

  const body =
    stage === 'resource'
      ? elf
        ? 'The Wardens restore a moonwell grove that feeds both the sanctuary wards and the Wayfarer Caravan.'
        : 'Emberclan secures old Warg pens and the surrounding Red Plains hunting routes.'
      : elf
        ? 'Heartgrove elders agree to extend the rootway beyond the sanctuary and prepare Stag riders for Moonlit Pass.'
        : 'The gathered clans accept a temporary Warfire pact and open Warg training for the road toward Stonejaw.';

  const reward =
    stage === 'resource'
      ? elf
        ? 'Unlocks Moonwell Herb Grove production and Spirit Stores.'
        : 'Unlocks Red Plains Hunt production and Smokehouse.'
      : elf
        ? 'Unlocks Stag Enclosure and prepares the Ashroot Stalker hunt.'
        : 'Unlocks Warg Pens and prepares the Clanbreaker hunt.';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: accent }]}>CHAPTER 2 EVENT</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{body}</Text>
          </View>
          <FactionCrest faction={activeFaction} size={48} />
        </View>
      </GameCard>

      <SectionTitle title={stage === 'resource' ? 'Kingdom resource' : 'Faction council'} />
      <GameCard>
        <View style={styles.row}>
          <View style={styles.eventArt}>
            {stage === 'resource' ? (
              <ResourceSiteSprite
                siteId={elf ? 'elf_moonwell_herbs' : 'orc_red_plains_hunt'}
                faction={activeFaction}
                size={48}
              />
            ) : (
              <CampaignNodeSprite type="event" faction={activeFaction} active size={36} />
            )}
          </View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
              {stage === 'resource' ? 'Permanent infrastructure' : 'New campaign capability'}
            </Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              {reward}
            </Text>
          </View>
        </View>
      </GameCard>

      {!completed ? (
        <PrimaryButton
          label={stage === 'resource' ? 'Secure the Site' : 'Complete the Council'}
          onPress={() => completeFactionChapterTwoEvent(stage)}
        />
      ) : (
        <PrimaryButton
          label={
            stage === 'resource'
              ? elf
                ? 'Hunt the Ward Hunters'
                : 'Face the Stonejaw Challengers'
              : elf
                ? 'Track the Ashroot Stalker'
                : 'Confront the Clanbreaker'
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
