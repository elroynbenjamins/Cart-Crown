import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';
import { CampaignNodeSprite, FactionCrest } from '../ui/gameArt';

export type FactionChapterOneEventStage =
  | 'investigation'
  | 'supply';

export function FactionChapterOneEventScreen({
  stage,
  onComplete
}: {
  stage: FactionChapterOneEventStage;
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    completeFactionChapterOneEvent,
    chapterNodes
  } = useGame();

  const faction = factions[activeFaction];
  const elf = activeFaction === 'elf';
  const accent = elf ? theme.colors.elf : theme.colors.orc;

  const eventNodeId =
    stage === 'investigation'
      ? elf
        ? 'elf_node_3'
        : 'orc_node_3'
      : elf
        ? 'elf_node_5'
        : 'orc_node_5';

  const completed = Boolean(
    chapterNodes.find(node => node.id === eventNodeId)?.completed
  );

  const title =
    stage === 'investigation'
      ? elf
        ? 'Whispering Roots'
        : 'Broken Clan Marks'
      : elf
        ? 'Wayfarer Camp'
        : 'Gathering Fire';

  const body =
    stage === 'investigation'
      ? elf
        ? 'The damaged roots remember metal tools, ash-grey residue and footsteps that deliberately avoided normal forest paths.'
        : 'The stolen clan marks were painted over foreign-made straps and buckles. Someone wanted the attack blamed on a real Orc clan.'
      : elf
        ? 'Wardens establish a light Wayfarer camp beside a living rootway, gathering herbs, timber and enough provisions for the next hunt.'
        : 'Nearby clans answer Emberclan’s fire signal with food, timber and spare iron. The warband can now hunt the leader spreading the false blame.';

  const resultText =
    stage === 'investigation'
      ? elf
        ? 'The ash residue matches traces found near the failing wardstones. +5 Gold · +4 Wood.'
        : 'The forged marks prove the attackers were disguised. +5 Gold · +2 Iron.'
      : elf
        ? '+24 Wood · +14 Provisions.'
        : '+20 Wood · +4 Iron · +16 Provisions.';

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GameCard accent={accent}>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: accent }]}>
              {faction.name.toUpperCase()} · CHAPTER 1
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              {body}
            </Text>
          </View>
          <FactionCrest faction={activeFaction} size={48} />
        </View>
      </GameCard>

      <SectionTitle
        title={stage === 'investigation' ? 'Evidence' : 'Campaign supplies'}
      />

      <GameCard>
        <View style={styles.row}>
          <View style={styles.eventIcon}>
            <CampaignNodeSprite
              type={stage === 'investigation' ? 'event' : 'supply'}
              faction={activeFaction}
              active
              size={32}
            />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
              {stage === 'investigation'
                ? 'The story does not fit'
                : 'Ready for the next fight'}
            </Text>
            <Text
              style={[styles.rowBody, { color: theme.colors.textMuted }]}
            >
              {resultText}
            </Text>
          </View>
        </View>
      </GameCard>

      {!completed ? (
        <PrimaryButton
          label={
            stage === 'investigation'
              ? 'Record the Evidence'
              : 'Prepare the Campaign'
          }
          onPress={() => {
            completeFactionChapterOneEvent(stage);
          }}
        />
      ) : (
        <PrimaryButton
          label={
            stage === 'investigation'
              ? elf
                ? 'Follow the Ashen Tracks'
                : 'Hunt the Invader Scouts'
              : elf
                ? 'Challenge the Hollow Warden'
                : 'Confront the Blamecaller'
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
  eventIcon: { width: 42, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '900' },
  rowBody: { fontSize: 11, lineHeight: 16, marginTop: 4 }
});
