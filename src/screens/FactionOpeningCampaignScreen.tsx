import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { factionOrder, factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import type { FactionId } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  Pill,
  PrimaryButton,
  SectionTitle
} from '../ui/components';

const nodeIcons: Record<string, string> = {
  story: '◆',
  battle: '⚔',
  event: '?',
  elite: '✦',
  supply: '▣',
  boss: '♛'
};

export function FactionOpeningCampaignScreen({
  onStartOpeningBattle
}: {
  onStartOpeningBattle: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNodes,
    campaignAvailability,
    hasFactionState,
    switchFaction
  } = useGame();

  const faction = factions[activeFaction];
  const accent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const openingBattleId =
    activeFaction === 'elf' ? 'elf_node_2' : 'orc_node_2';

  const campaignById = (id: FactionId) =>
    campaignAvailability.find(campaign => campaign.id === id);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <Text style={[styles.eyebrow, { color: accent }]}>
          CHAPTER 1
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {activeFaction === 'elf' ? 'Fading Wards' : 'Blamed Blood'}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          {faction.campaignSubtitle}
        </Text>
      </GameCard>

      <GameCard accent={accent}>
        <Text style={[styles.mechanicLabel, { color: theme.colors.textMuted }]}>
          UNIQUE MECHANIC · {faction.mechanicName.toUpperCase()}
        </Text>
        <Text style={[styles.mechanicBody, { color: theme.colors.text }]}>
          {faction.mechanicSummary}
        </Text>
      </GameCard>

      <SectionTitle title={activeFaction === 'elf' ? 'Outer Heartgrove' : 'Emberclan Territory'} trailing="Current region" />

      <View style={styles.nodeList}>
        {chapterNodes.map((node, index) => {
          const playable =
            node.current &&
            node.id === openingBattleId &&
            node.type === 'battle';
          const status = node.completed
            ? 'DONE'
            : playable
              ? 'PLAY'
              : node.current
                ? 'NEXT'
                : 'LOCKED';

          return (
            <View key={node.id} style={styles.nodeWrap}>
              {index > 0 ? (
                <View style={[styles.connector, { backgroundColor: theme.colors.border }]} />
              ) : null}
              <GameCard accent={node.current ? accent : undefined}>
                <View style={styles.nodeRow}>
                  <View
                    style={[
                      styles.nodeIcon,
                      {
                        borderColor: node.completed
                          ? theme.colors.primary
                          : node.current
                            ? accent
                            : theme.colors.border
                      }
                    ]}
                  >
                    <Text
                      style={{
                        color: node.completed
                          ? theme.colors.primary
                          : node.current
                            ? accent
                            : theme.colors.textMuted
                      }}
                    >
                      {nodeIcons[node.type] ?? '·'}
                    </Text>
                  </View>
                  <View style={styles.nodeCopy}>
                    <Text style={[styles.nodeName, { color: theme.colors.text }]}>
                      {node.name}
                    </Text>
                    <Text style={[styles.nodeType, { color: theme.colors.textMuted }]}>
                      {node.type.toUpperCase()}
                    </Text>
                  </View>
                  <Pill label={status} />
                </View>

                {playable ? (
                  <View style={styles.nodeButton}>
                    <PrimaryButton label={'Start ' + node.name} onPress={onStartOpeningBattle} />
                  </View>
                ) : null}
              </GameCard>
            </View>
          );
        })}
      </View>

      <SectionTitle title="Campaigns in this save" />
      <View style={styles.factionList}>
        {factionOrder.map(id => {
          const definition = factions[id];
          const availability = campaignById(id);
          const current = id === activeFaction;
          const stateExists = hasFactionState(id);
          const factionAccent =
            id === 'human'
              ? theme.colors.human
              : id === 'elf'
                ? theme.colors.elf
                : theme.colors.orc;

          return (
            <GameCard key={id} accent={current ? factionAccent : undefined}>
              <View style={styles.factionHeader}>
                <View style={styles.factionCopy}>
                  <Text style={[styles.factionName, { color: theme.colors.text }]}>
                    {definition.name}
                  </Text>
                  <Text style={[styles.factionSubtitle, { color: factionAccent }]}>
                    {definition.campaignName}
                  </Text>
                </View>
                <Pill
                  label={
                    current
                      ? 'CURRENT'
                      : availability?.completed
                        ? 'COMPLETE'
                        : availability?.unlocked
                          ? 'AVAILABLE'
                          : 'LOCKED'
                  }
                />
              </View>

              {availability?.unlocked && !current ? (
                <View style={styles.switchButton}>
                  <PrimaryButton
                    label={
                      stateExists
                        ? 'Switch to ' + definition.name
                        : 'Start ' + definition.name + ' Campaign'
                    }
                    onPress={() => {
                      void switchFaction(id);
                    }}
                  />
                </View>
              ) : null}
            </GameCard>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  mechanicLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  mechanicBody: { fontSize: 12, lineHeight: 18, fontWeight: '800', marginTop: 5 },
  nodeList: { gap: 0 },
  nodeWrap: { position: 'relative' },
  connector: { width: 2, height: 10, alignSelf: 'center' },
  nodeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nodeIcon: { width: 38, height: 38, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nodeCopy: { flex: 1 },
  nodeName: { fontSize: 14, fontWeight: '900' },
  nodeType: { fontSize: 8.5, fontWeight: '800', marginTop: 2 },
  nodeButton: { marginTop: 10 },
  factionList: { gap: 8 },
  factionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  factionCopy: { flex: 1 },
  factionName: { fontSize: 15, fontWeight: '900' },
  factionSubtitle: { fontSize: 9.5, fontWeight: '800', marginTop: 2 },
  switchButton: { marginTop: 10 }
});
