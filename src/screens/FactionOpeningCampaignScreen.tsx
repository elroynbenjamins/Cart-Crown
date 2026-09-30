import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { factionOrder, factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import type { FactionId, SideModeId } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  MetricTile,
  Pill,
  PrimaryButton,
  ScreenHero,
  SecondaryButton,
  SectionTitle,
  StatusPill
} from '../ui/components';
import { CampaignNodeSprite, FactionCrest, RegionMapBackdrop } from '../ui/gameArt';
import { TutorialFocus } from '../ui/TutorialFocus';
import { ActivityCard } from '../ui/ActivityCard';
import {
  activityGroups,
  activityPresentation
} from '../game/activityPresentation';
import type { TutorialFocusTarget } from '../game/tutorial';

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
  onStartChapterFourBoss,
  onOpenChapterFiveMuster,
  onStartChapterFiveBattle,
  onOpenChapterFiveResource,
  onStartChapterFiveElite,
  onOpenChapterFiveSeal,
  onStartChapterFiveBoss,
  onOpenFactionMandate,
  onStartChapterSixBattle,
  onOpenChapterSixConcord,
  onStartChapterSixElite,
  onOpenChapterSixSeal,
  onStartChapterSixBoss,
  onOpenMetaCampaign,
  onOpenWarTable,
  onOpenExpedition,
  onOpenSiege,
  onOpenRelicHunt,
  onOpenFormationTrial,
  onOpenKingdomDefense,
  tutorialFocus,
  onTutorialFocusComplete
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
  onOpenChapterFiveMuster: () => void;
  onStartChapterFiveBattle: () => void;
  onOpenChapterFiveResource: () => void;
  onStartChapterFiveElite: () => void;
  onOpenChapterFiveSeal: () => void;
  onStartChapterFiveBoss: () => void;
  onOpenFactionMandate: () => void;
  onStartChapterSixBattle: () => void;
  onOpenChapterSixConcord: () => void;
  onStartChapterSixElite: () => void;
  onOpenChapterSixSeal: () => void;
  onStartChapterSixBoss: () => void;
  onOpenMetaCampaign: () => void;
  onOpenWarTable: () => void;
  onOpenExpedition: () => void;
  onOpenSiege: () => void;
  onOpenRelicHunt: () => void;
  onOpenFormationTrial: () => void;
  onOpenKingdomDefense: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNumber,
    chapterNodes,
    campaignAvailability,
    completedCampaigns,
    hasFactionState,
    switchFaction,
    sideModeDefinitions,
    isSideModeUnlocked,
    expeditionTickets,
    expeditionRunsCompleted,
    activeExpeditionRun,
    siegeRunsCompleted,
    activeSiegeRun,
    relicHuntRunsCompleted,
    activeRelicHuntRun,
    relicHuntRewardClaimed,
    warTableCycle,
    warTableCompletedContractIds,
    kingdomTrialCompletions,
    kingdomDefenseCompleted,
    kingdomDefenseRuns
  } = useGame();

  const availableSideModes = sideModeDefinitions.filter(
    mode =>
      [
        'war_table',
        'formation_trials',
        'kingdom_defense',
        'expeditions',
        'sieges',
        'relic_hunts'
      ].includes(mode.id) &&
      isSideModeUnlocked(mode.id)
  );

  const openSideMode = (id: SideModeId) => {
    if (id === 'war_table') onOpenWarTable();
    if (id === 'expeditions') onOpenExpedition();
    if (id === 'sieges') onOpenSiege();
    if (id === 'relic_hunts') onOpenRelicHunt();
    if (id === 'formation_trials') onOpenFormationTrial();
    if (id === 'kingdom_defense') onOpenKingdomDefense();
  };

  const activityStatus = (id: SideModeId) => {
    if (id === 'war_table') {
      return 'Board ' +
        (warTableCycle + 1) +
        ' · ' +
        warTableCompletedContractIds.length +
        '/3 cleared';
    }
    if (id === 'expeditions') {
      return activeExpeditionRun
        ? activeExpeditionRun.completed
          ? 'Boss defeated · loot ready'
          : activeExpeditionRun.failed
            ? 'Run failed'
            : 'Run active · Stage ' +
              (activeExpeditionRun.stageIndex + 1) +
              '/5'
        : expeditionTickets +
          (expeditionTickets === 1 ? ' ticket' : ' tickets') +
          ' · ' +
          expeditionRunsCompleted +
          ' clears';
    }
    if (id === 'sieges') {
      return activeSiegeRun
        ? activeSiegeRun.completed
          ? 'Fortress captured · reward ready'
          : activeSiegeRun.failed
            ? 'Assault failed'
            : 'Siege active · Stage ' +
              (activeSiegeRun.stageIndex + 1) +
              '/4'
        : siegeRunsCompleted +
          (siegeRunsCompleted === 1 ? ' clear' : ' clears');
    }
    if (id === 'relic_hunts') {
      return activeRelicHuntRun
        ? activeRelicHuntRun.completed
          ? 'Relic secured · reward ready'
          : activeRelicHuntRun.failed
            ? 'Chain broken'
            : 'Hunt active · Guardian ' +
              (activeRelicHuntRun.stageIndex + 1) +
              '/3'
        : relicHuntRewardClaimed
          ? relicHuntRunsCompleted + ' clears · relic claimed'
          : 'Unique relic reward';
    }
    if (id === 'formation_trials') {
      return kingdomTrialCompletions.length + '/3 medals';
    }
    return kingdomDefenseCompleted
      ? kingdomDefenseRuns +
        (kingdomDefenseRuns === 1 ? ' clear' : ' clears')
      : 'Endurance defense';
  };

  const activityActionLabel = (id: SideModeId) =>
    id === 'expeditions' && activeExpeditionRun
      ? 'Resume Expedition'
      : id === 'sieges' && activeSiegeRun
        ? 'Resume Siege'
        : id === 'relic_hunts' && activeRelicHuntRun
          ? 'Resume Relic Hunt'
          : 'Open ' +
            (
              sideModeDefinitions.find(mode => mode.id === id)?.name ??
              'Activity'
            );

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
  const chapterFive = chapterNumber === 5;
  const chapterSix = chapterNumber >= 6;
  const ids =
    activeFaction === 'elf'
      ? chapterSix
        ? {
            muster: 'elf6_node_1',
            battle: 'elf6_node_2',
            eventA: 'elf6_node_3',
            elite: 'elf6_node_4',
            eventB: 'elf6_node_5',
            boss: 'elf6_node_6'
          }
        : chapterFive
          ? {
              muster: 'elf5_node_1',
              battle: 'elf5_node_2',
              eventA: 'elf5_node_3',
              elite: 'elf5_node_4',
              eventB: 'elf5_node_5',
              boss: 'elf5_node_6'
            }
          : chapterFour
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
      : chapterSix
        ? {
            muster: 'orc6_node_1',
            battle: 'orc6_node_2',
            eventA: 'orc6_node_3',
            elite: 'orc6_node_4',
            eventB: 'orc6_node_5',
            boss: 'orc6_node_6'
          }
        : chapterFive
          ? {
              muster: 'orc5_node_1',
              battle: 'orc5_node_2',
              eventA: 'orc5_node_3',
              elite: 'orc5_node_4',
              eventB: 'orc5_node_5',
              boss: 'orc5_node_6'
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
      <ScreenHero
        eyebrow={'CHAPTER ' + chapterNumber}
        title={
          activeFaction === 'elf'
            ? chapterSix
              ? 'Stars over Crownspire'
              : chapterFive
                ? 'The Wounded Worldroot'
                : chapterFour
                  ? 'Roots in Ash'
                  : chapterThree
                    ? 'Moonlit Pass'
                    : chapterTwo
                      ? 'The Last Heartgrove'
                      : 'Fading Wards'
            : chapterSix
              ? 'The Truth at Crownspire'
              : chapterFive
                ? 'No Clan Left Behind'
                : chapterFour
                  ? 'War on Two Fronts'
                  : chapterThree
                    ? 'The Stonejaw Trial'
                    : chapterTwo
                      ? 'Gather the Clans'
                      : 'Blamed Blood'
        }
        body={faction.campaignSubtitle}
        accent={accent}
        status={
          <View style={styles.heroCrest}>
            <FactionCrest faction={activeFaction} size={42} />
          </View>
        }
      >
        <View style={styles.chapterMetrics}>
          <MetricTile
            label="OBJECTIVES"
            value={
              chapterNodes.filter(node => node.completed).length +
              '/6'
            }
            caption="completed this chapter"
            tone="positive"
          />
          <MetricTile
            label="UNIQUE SYSTEM"
            value={faction.mechanicName}
            caption="active faction mechanic"
            tone="gold"
          />
        </View>
      </ScreenHero>

      {completedCampaigns.includes(activeFaction) ? (
        <GameCard accent={theme.colors.gold} state="ready">
          <Text style={[styles.mechanicLabel, { color: theme.colors.gold }]}>
            CAMPAIGN COMPLETE
          </Text>
          <Text style={[styles.mechanicBody, { color: theme.colors.text }]}>
            {activeFaction === 'elf'
              ? 'Root Seal recovered. Heartgrove remains available for side activities and equipment refinement.'
              : 'Clan Seal recovered. The Warfire Confederacy remains available for side activities and equipment refinement.'}
          </Text>
        </GameCard>
      ) : null}

      <GameCard accent={accent} ornament={false}>
        <Text style={[styles.mechanicLabel, { color: accent }]}>
          {faction.mechanicName.toUpperCase()}
        </Text>
        <Text style={[styles.mechanicBody, { color: theme.colors.textMuted }]}>
          {faction.mechanicSummary}
        </Text>
      </GameCard>

      <SectionTitle
        title={
          activeFaction === 'elf'
            ? chapterSix
              ? 'Crownspire Basin'
              : chapterFive
                ? 'Worldroot Basin'
                : chapterFour
                ? 'Ashen Groves'
              : chapterThree
                ? 'Moonlit Pass'
                : chapterTwo
                  ? 'Heartgrove'
                  : 'Outer Heartgrove'
            : chapterSix
              ? 'Crownspire Basin'
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
            (chapterTwo || chapterThree || chapterFour || chapterFive || chapterSix) &&
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
                  ? chapterSix
                    ? activeFaction === 'elf'
                      ? 'ATTUNE'
                      : 'CHOOSE PACT'
                    : chapterFive
                      ? 'MUSTER'
                      : 'CHOOSE SQUAD'
                  : eventAPlayable
                    ? chapterSix
                      ? 'CONCORD'
                      : chapterFive
                        ? 'RECORDS'
                      : chapterFour
                        ? 'RECOVER'
                      : chapterThree
                        ? 'RESTORE ROUTE'
                        : chapterTwo
                        ? 'SECURE SITE'
                        : 'INVESTIGATE'
                    : eventBPlayable
                      ? chapterSix
                        ? 'SEAL'
                        : chapterFive
                          ? 'TRACE SEAL'
                        : chapterFour
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
            ? chapterSix
              ? onOpenFactionMandate
              : chapterFive
                ? onOpenChapterFiveMuster
                : chapterFour
                  ? onOpenChapterFourRecruitment
                  : chapterThree
                    ? onOpenChapterThreeRecruitment
                    : onOpenChapterTwoRecruitment
            : battlePlayable
              ? chapterSix
                ? onStartChapterSixBattle
                : chapterFive
                  ? onStartChapterFiveBattle
                  : chapterFour
                    ? onStartChapterFourBattle
                    : chapterThree
                      ? onStartChapterThreeBattle
                      : chapterTwo
                        ? onStartChapterTwoBattle
                        : onStartOpeningBattle
              : eventAPlayable
                ? chapterSix
                  ? onOpenChapterSixConcord
                  : chapterFive
                    ? onOpenChapterFiveResource
                    : chapterFour
                      ? onOpenChapterFourResource
                      : chapterThree
                        ? onOpenChapterThreeResource
                        : chapterTwo
                          ? onOpenChapterTwoResource
                          : onOpenInvestigation
                : elitePlayable
                  ? chapterSix
                    ? onStartChapterSixElite
                    : chapterFive
                      ? onStartChapterFiveElite
                      : chapterFour
                        ? onStartChapterFourElite
                        : chapterThree
                          ? onStartChapterThreeElite
                          : chapterTwo
                            ? onStartChapterTwoElite
                            : onStartEliteBattle
                  : eventBPlayable
                    ? chapterSix
                      ? onOpenChapterSixSeal
                      : chapterFive
                        ? onOpenChapterFiveSeal
                        : chapterFour
                          ? onOpenChapterFourCouncil
                          : chapterThree
                            ? onOpenChapterThreeCouncil
                            : chapterTwo
                              ? onOpenChapterTwoCouncil
                              : onOpenSupply
                    : bossPlayable
                      ? chapterSix
                        ? onStartChapterSixBoss
                        : chapterFive
                          ? onStartChapterFiveBoss
                          : chapterFour
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
              <GameCard
                accent={node.current ? accent : undefined}
                faction={activeFaction}
                state={node.completed ? 'ready' : node.current ? 'selected' : 'locked'}
              >
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
                  <StatusPill
                    label={status}
                    tone={
                      node.completed
                        ? 'done'
                        : bossPlayable
                          ? 'boss'
                          : elitePlayable
                            ? 'elite'
                            : playable
                              ? 'ready'
                              : node.current
                                ? 'current'
                                : 'locked'
                    }
                  />
                </View>

                {playable && action ? (
                  <View style={styles.nodeButton}>
                    <PrimaryButton
                      label={
                        musterPlayable
                          ? chapterSix
                            ? activeFaction === 'elf'
                              ? 'Choose Worldroot Attunement'
                              : 'Choose Clan Pact'
                            : chapterFive
                              ? 'Prepare full army'
                              : chapterFour
                                ? 'Choose fifth squad'
                                : chapterThree
                                  ? 'Choose fourth squad'
                                  : 'Choose third squad'
                          : eventAPlayable
                            ? chapterSix
                              ? 'Open ' + node.name
                              : chapterFive
                                ? 'Secure ' + node.name
                              : chapterFour
                                ? 'Recover ' + node.name
                                : chapterThree
                                  ? 'Restore ' + node.name
                                  : chapterTwo
                                    ? 'Secure ' + node.name
                                    : 'Investigate ' + node.name
                            : eventBPlayable
                              ? chapterSix
                                ? 'Reach ' + node.name
                                : chapterFive
                                  ? 'Trace ' + node.name
                                : chapterFour
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

      {availableSideModes.length > 0 ? (
        <>
          <SectionTitle
            title="Activities"
            trailing={availableSideModes.length + ' unlocked'}
          />
          {activityGroups.map(group => {
            const modes =
              availableSideModes.filter(
                mode =>
                  activityPresentation[mode.id].group ===
                  group.id
              );
            if (modes.length === 0) return null;

            return (
              <View
                key={group.id}
                style={styles.activityGroup}
              >
                <Text
                  style={[
                    styles.activityGroupTitle,
                    { color: accent }
                  ]}
                >
                  {group.title}
                </Text>
                <Text
                  style={[
                    styles.activityGroupSubtitle,
                    { color: theme.colors.textMuted }
                  ]}
                >
                  {group.subtitle}
                </Text>
                <View style={styles.factionList}>
                  {modes.map(mode => {
                    const tutorialActivityFocused =
                      tutorialFocus?.kind ===
                        'campaign-activities' &&
                      mode.id ===
                        (tutorialFocus.modeId ??
                          availableSideModes[0]?.id);

                    return (
                      <TutorialFocus
                        key={mode.id}
                        active={tutorialActivityFocused}
                        label={
                          tutorialActivityFocused
                            ? tutorialFocus?.label
                            : undefined
                        }
                      >
                        <ActivityCard
                          mode={mode}
                          faction={activeFaction}
                          accent={accent}
                          status={activityStatus(mode.id)}
                          actionLabel={activityActionLabel(mode.id)}
                          highlight={
                            mode.id === 'relic_hunts' &&
                            !relicHuntRewardClaimed
                          }
                          onPress={() => {
                            if (tutorialActivityFocused) {
                              onTutorialFocusComplete?.();
                            }
                            openSideMode(mode.id);
                          }}
                        />
                      </TutorialFocus>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </>
      ) : null}

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
            <GameCard
              key={id}
              accent={current ? factionAccent : undefined}
              faction={id}
              state={
                current
                  ? 'selected'
                  : availability?.unlocked
                    ? 'default'
                    : 'locked'
              }
            >
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
                <StatusPill
                  label={
                    current
                      ? 'CURRENT'
                      : availability?.completed
                        ? 'COMPLETE'
                        : availability?.unlocked
                          ? 'AVAILABLE'
                          : 'LOCKED'
                  }
                  tone={
                    current
                      ? 'current'
                      : availability?.completed
                        ? 'done'
                        : availability?.unlocked
                          ? 'available'
                          : 'locked'
                  }
                />
              </View>

              {availability?.unlocked && !current ? (
                <View style={styles.switchButton}>
                  <SecondaryButton
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

      <GameCard accent={campaignAvailability.find(campaign => campaign.id === 'meta')?.unlocked ? theme.colors.gold : undefined}>
        <Text style={[styles.factionName, { color: theme.colors.text }]}>Three Seals</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Shared Crownspire endgame. Lead with the currently active completed faction while the other two arrive as allied NPC armies.
        </Text>
        {campaignAvailability.find(campaign => campaign.id === 'meta')?.unlocked ? (
          <View style={styles.switchButton}>
            <PrimaryButton
              label={
                campaignAvailability.find(campaign => campaign.id === 'meta')?.completed
                  ? 'View Restored Concord'
                  : 'Enter Three Seals Campaign'
              }
              onPress={onOpenMetaCampaign}
            />
          </View>
        ) : (
          <Text style={[styles.factionSubtitle, { color: theme.colors.textMuted }]}>
            Complete Human, Elf and Orc campaigns to unlock.
          </Text>
        )}
      </GameCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  heroCrest: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chapterMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  body: { fontSize: 12, lineHeight: 18, marginTop: 6 },
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
