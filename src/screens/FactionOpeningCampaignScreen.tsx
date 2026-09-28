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
import { CampaignNodeSprite, FactionCrest, RegionMapBackdrop } from '../ui/gameArt';

export function FactionOpeningCampaignScreen({
  onStartOpeningBattle,
  onOpenInvestigation,
  onStartEliteBattle,
  onOpenSupply,
  onStartBoss,
  onOpenChapterTwoRecruitment,
  onStartChapterTwoBattle,
  onOpenChapterTwoResource,
  onStartChapterTwoElite,
  onOpenChapterTwoCouncil,
  onStartChapterTwoBoss,
  onOpenChapterThreeRecruitment,
  onStartChapterThreeBattle,
  onOpenChapterThreeResource,
  onStartChapterThreeElite,
  onOpenChapterThreeCouncil,
  onStartChapterThreeBoss,
  onOpenChapterFourRecruitment,
  onStartChapterFourBattle,
  onOpenChapterFourResource,
  onStartChapterFourElite,
  onOpenChapterFourCouncil,
  onStartChapterFourBoss
}: {
  onStartOpeningBattle: () => void;
  onOpenInvestigation: () => void;
  onStartEliteBattle: () => void;
  onOpenSupply: () => void;
  onStartBoss: () => void;
  onOpenChapterTwoRecruitment: () => void;
  onStartChapterTwoBattle: () => void;
  onOpenChapterTwoResource: () => void;
  onStartChapterTwoElite: () => void;
  onOpenChapterTwoCouncil: () => void;
  onStartChapterTwoBoss: () => void;
  onOpenChapterThreeRecruitment: () => void;
  onStartChapterThreeBattle: () => void;
  onOpenChapterThreeResource: () => void;
  onStartChapterThreeElite: () => void;
  onOpenChapterThreeCouncil: () => void;
  onStartChapterThreeBoss: () => void;
  onOpenChapterFourRecruitment: () => void;
  onStartChapterFourBattle: () => void;
  onOpenChapterFourResource: () => void;
  onStartChapterFourElite: () => void;
  onOpenChapterFourCouncil: () => void;
  onStartChapterFourBoss: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNumber,
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

  const chapterTwo = chapterNumber === 2;
  const chapterThree = chapterNumber === 3;
  const chapterFour = chapterNumber === 4;
  const chapterFive = chapterNumber >= 5;
  const ids =
    chapterFive
      ? {
          muster: '',
          battle: '',
          eventA: '',
          elite: '',
          eventB: '',
          boss: ''
        }
      : activeFaction === 'elf'
      ? chapterFour
        ? {
            muster: 'elf4_node_1',
            battle: 'elf4_node_2',
            eventA: 'elf4_node_3',
            elite: 'elf4_node_4',
            eventB: 'elf4_node_5',
            boss: 'elf4_node_6'
          }
        : chapterThree
          ? {
              muster: 'elf3_node_1',
              battle: 'elf3_node_2',
              eventA: 'elf3_node_3',
              elite: 'elf3_node_4',
              eventB: 'elf3_node_5',
              boss: 'elf3_node_6'
            }
          : chapterTwo
            ? {
                muster: 'elf2_node_1',
                battle: 'elf2_node_2',
                eventA: 'elf2_node_3',
                elite: 'elf2_node_4',
                eventB: 'elf2_node_5',
                boss: 'elf2_node_6'
              }
            : {
                muster: '',
                battle: 'elf_node_2',
                eventA: 'elf_node_3',
                elite: 'elf_node_4',
                eventB: 'elf_node_5',
                boss: 'elf_node_6'
              }
      : chapterFour
        ? {
            muster: 'orc4_node_1',
            battle: 'orc4_node_2',
            eventA: 'orc4_node_3',
            elite: 'orc4_node_4',
            eventB: 'orc4_node_5',
            boss: 'orc4_node_6'
          }
        : chapterThree
          ? {
              muster: 'orc3_node_1',
              battle: 'orc3_node_2',
              eventA: 'orc3_node_3',
              elite: 'orc3_node_4',
              eventB: 'orc3_node_5',
              boss: 'orc3_node_6'
            }
          : chapterTwo
            ? {
                muster: 'orc2_node_1',
                battle: 'orc2_node_2',
                eventA: 'orc2_node_3',
                elite: 'orc2_node_4',
                eventB: 'orc2_node_5',
                boss: 'orc2_node_6'
              }
            : {
                muster: '',
                battle: 'orc_node_2',
                eventA: 'orc_node_3',
                elite: 'orc_node_4',
                eventB: 'orc_node_5',
                boss: 'orc_node_6'
              };

  const campaignById = (id: FactionId) =>
    campaignAvailability.find(campaign => campaign.id === id);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <View style={styles.chapterHero}>
          <View style={styles.chapterCopy}>
            <Text style={[styles.eyebrow, { color: accent }]}>
              CHAPTER {chapterNumber}
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {activeFaction === 'elf'
                ? chapterFive
                  ? 'The Wounded Worldroot'
                  : chapterFour
                    ? 'Roots in Ash'
                  : chapterThree
                    ? 'Moonlit Pass'
                    : chapterTwo
                      ? 'The Last Heartgrove'
                      : 'Fading Wards'
                : chapterFive
                  ? 'No Clan Left Behind'
                  : chapterFour
                    ? 'War on Two Fronts'
                  : chapterThree
                    ? 'The Stonejaw Trial'
                    : chapterTwo
                      ? 'Gather the Clans'
                      : 'Blamed Blood'}
            </Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              {faction.campaignSubtitle}
            </Text>
          </View>
          <FactionCrest faction={activeFaction} size={52} />
        </View>
      </GameCard>

      <GameCard accent={accent}>
        <Text style={[styles.mechanicLabel, { color: theme.colors.textMuted }]}>
          UNIQUE MECHANIC · {faction.mechanicName.toUpperCase()}
        </Text>
        <Text style={[styles.mechanicBody, { color: theme.colors.text }]}>
          {faction.mechanicSummary}
        </Text>
      </GameCard>

      <SectionTitle
        title={
          activeFaction === 'elf'
            ? chapterFive
              ? 'Worldroot Basin'
              : chapterFour
                ? 'Ashen Groves'
              : chapterThree
                ? 'Moonlit Pass'
                : chapterTwo
                  ? 'Heartgrove'
                  : 'Outer Heartgrove'
            : chapterFive
              ? 'Great Warhold March'
              : chapterFour
                ? 'Broken Steppe'
              : chapterThree
                ? 'Stonejaw Range'
                : chapterTwo
                  ? 'Red Plains'
                  : 'Emberclan Territory'
        }
        trailing="Current region"
      />

      <View style={[styles.regionPreview, { borderColor: accent }]}>
        <RegionMapBackdrop faction={activeFaction} chapter={chapterNumber} />
        <View style={styles.regionRoute}>
          <View style={[styles.routeDot, { backgroundColor: accent }]} />
          <View style={[styles.routeLine, { backgroundColor: accent }]} />
          <View style={[styles.routeDot, { backgroundColor: chapterNumber >= 2 ? accent : theme.colors.border }]} />
          <View style={[styles.routeLine, { backgroundColor: chapterNumber >= 2 ? accent : theme.colors.border }]} />
          <View style={[styles.routeDot, { backgroundColor: chapterNumber >= 3 ? accent : theme.colors.border }]} />
        </View>
      </View>

      <View style={styles.nodeList}>
        {chapterNodes.map((node, index) => {
          const musterPlayable =
            (chapterTwo || chapterThree || chapterFour) &&
            node.current &&
            node.id === ids.muster;
          const battlePlayable =
            node.current && node.id === ids.battle;
          const eventAPlayable =
            node.current && node.id === ids.eventA;
          const elitePlayable =
            node.current && node.id === ids.elite;
          const eventBPlayable =
            node.current && node.id === ids.eventB;
          const bossPlayable =
            node.current && node.id === ids.boss;
          const playable =
            musterPlayable ||
            battlePlayable ||
            eventAPlayable ||
            elitePlayable ||
            eventBPlayable ||
            bossPlayable;
          const status = node.completed
            ? 'DONE'
            : bossPlayable
              ? 'BOSS'
              : elitePlayable
                ? 'ELITE'
                : musterPlayable
                  ? 'CHOOSE SQUAD'
                  : eventAPlayable
                    ? chapterFour
                      ? 'RECOVER'
                      : chapterThree
                        ? 'RESTORE ROUTE'
                        : chapterTwo
                        ? 'SECURE SITE'
                        : 'INVESTIGATE'
                    : eventBPlayable
                      ? chapterFour
                        ? 'COUNCIL'
                        : chapterThree
                          ? 'OATH / COUNCIL'
                          : chapterTwo
                          ? 'COUNCIL'
                          : 'PREPARE'
                      : battlePlayable
                        ? 'PLAY'
                        : node.current
                          ? 'NEXT'
                          : 'LOCKED';

          const action = musterPlayable
            ? chapterFour
              ? onOpenChapterFourRecruitment
              : chapterThree
                ? onOpenChapterThreeRecruitment
                : onOpenChapterTwoRecruitment
            : battlePlayable
              ? chapterFour
                ? onStartChapterFourBattle
                : chapterThree
                  ? onStartChapterThreeBattle
                  : chapterTwo
                    ? onStartChapterTwoBattle
                    : onStartOpeningBattle
              : eventAPlayable
                ? chapterFour
                  ? onOpenChapterFourResource
                  : chapterThree
                    ? onOpenChapterThreeResource
                    : chapterTwo
                      ? onOpenChapterTwoResource
                      : onOpenInvestigation
                : elitePlayable
                  ? chapterFour
                    ? onStartChapterFourElite
                    : chapterThree
                      ? onStartChapterThreeElite
                      : chapterTwo
                        ? onStartChapterTwoElite
                        : onStartEliteBattle
                  : eventBPlayable
                    ? chapterFour
                      ? onOpenChapterFourCouncil
                      : chapterThree
                        ? onOpenChapterThreeCouncil
                        : chapterTwo
                          ? onOpenChapterTwoCouncil
                          : onOpenSupply
                    : bossPlayable
                      ? chapterFour
                        ? onStartChapterFourBoss
                        : chapterThree
                          ? onStartChapterThreeBoss
                          : chapterTwo
                            ? onStartChapterTwoBoss
                            : onStartBoss
                      : undefined;

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
                    <CampaignNodeSprite
                      type={node.type}
                      faction={activeFaction}
                      active={node.completed || node.current}
                      size={26}
                    />
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

                {playable && action ? (
                  <View style={styles.nodeButton}>
                    <PrimaryButton
                      label={
                        musterPlayable
                          ? chapterFour
                            ? 'Choose fifth squad'
                            : chapterThree
                              ? 'Choose fourth squad'
                              : 'Choose third squad'
                          : eventAPlayable
                            ? chapterFour
                              ? 'Recover ' + node.name
                              : chapterThree
                                ? 'Restore ' + node.name
                                : chapterTwo
                                ? 'Secure ' + node.name
                                : 'Investigate ' + node.name
                            : eventBPlayable
                              ? chapterFour
                                ? 'Open ' + node.name
                                : chapterThree
                                  ? 'Complete ' + node.name
                                  : chapterTwo
                                  ? 'Open ' + node.name
                                  : 'Prepare at ' + node.name
                              : bossPlayable
                                ? 'Challenge ' + node.name
                                : 'Start ' + node.name
                      }
                      onPress={action}
                    />
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
                <FactionCrest faction={id} size={38} />
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
  chapterHero: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  chapterCopy: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  mechanicLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  mechanicBody: { fontSize: 12, lineHeight: 18, fontWeight: '800', marginTop: 5 },
  regionPreview: { height: 150, borderWidth: 1, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  regionRoute: { position: 'absolute', left: '18%', right: '18%', bottom: 18, flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 14, height: 14, borderRadius: 7 },
  routeLine: { flex: 1, height: 3, opacity: 0.8 },
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
