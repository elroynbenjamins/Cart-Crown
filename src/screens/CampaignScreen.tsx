import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { rewardedAdPlacements } from '../ads/rewardedAds';
import { factions, factionOrder } from '../game/factions';
import { humanRegions } from '../game/data';
import { useGame } from '../game/GameProvider';
import type { CampaignId, SideModeId } from '../game/types';
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
import { CampaignNodeSprite, FactionCrest, LockIcon, RegionMapBackdrop } from '../ui/gameArt';
import { FactionOpeningCampaignScreen } from './FactionOpeningCampaignScreen';
import { TutorialFocus } from '../ui/TutorialFocus';
import { ActivityCard } from '../ui/ActivityCard';
import {
  activityGroups,
  activityPresentation
} from '../game/activityPresentation';
import type { TutorialFocusTarget } from '../game/tutorial';

type CampaignView = 'story' | 'activities' | 'factions';

export function CampaignScreen({
  onStartBattle,
  onOpenMarkedRaiders,
  onStartMercenary,
  onOpenRefugeeCamp,
  onStartTollCaptain,
  onOpenFortMuster,
  onStartIronRoad,
  onOpenTimberClaim,
  onOpenKingdomDefense,
  onOpenBrokenSignalTower,
  onStartIronProvost,
  onOpenMarcherEnvoy,
  onStartBorderFort,
  onOpenThreeWarnings,
  onStartSiegeRoad,
  onOpenDividedMarch,
  onStartLordMarshal,
  onOpenStrongholdMuster,
  onStartBrokenStandards,
  onOpenEmptyThrone,
  onStartCrownroadAmbush,
  onOpenLastLoyalists,
  onStartPretenderGeneral,
  onOpenRoyalDecrees,
  onStartOldRoyalLands,
  onOpenBrokenArchives,
  onStartAshenEnvoy,
  onOpenRoyalLedger,
  onStartGateOfCrownspire,
  onOpenGrandCouncil,
  onStartSunderedFields,
  onOpenConcordVault,
  onStartAshenCourt,
  onOpenForcedBeacon,
  onStartReturnToCrownspire,
  onStartFactionOpeningBattle,
  onOpenFactionInvestigation,
  onStartFactionEliteBattle,
  onOpenFactionSupply,
  onStartFactionBoss,
  onOpenFactionChapterTwoRecruitment,
  onStartFactionChapterTwoBattle,
  onOpenFactionChapterTwoResource,
  onStartFactionChapterTwoElite,
  onOpenFactionChapterTwoCouncil,
  onStartFactionChapterTwoBoss,
  onOpenFactionChapterThreeRecruitment,
  onStartFactionChapterThreeBattle,
  onOpenFactionChapterThreeResource,
  onStartFactionChapterThreeElite,
  onOpenFactionChapterThreeCouncil,
  onStartFactionChapterThreeBoss,
  onOpenFactionChapterFourRecruitment,
  onStartFactionChapterFourBattle,
  onOpenFactionChapterFourResource,
  onStartFactionChapterFourElite,
  onOpenFactionChapterFourCouncil,
  onStartFactionChapterFourBoss,
  onOpenFactionChapterFiveMuster,
  onStartFactionChapterFiveBattle,
  onOpenFactionChapterFiveResource,
  onStartFactionChapterFiveElite,
  onOpenFactionChapterFiveSeal,
  onStartFactionChapterFiveBoss,
  onOpenFactionMandate,
  onStartFactionChapterSixBattle,
  onOpenFactionChapterSixConcord,
  onStartFactionChapterSixElite,
  onOpenFactionChapterSixSeal,
  onStartFactionChapterSixBoss,
  onOpenMetaCampaign,
  onOpenWarTable,
  onOpenExpedition,
  onOpenSiege,
  onOpenRelicHunt,
  onOpenFormationTrial,
  tutorialFocus,
  onTutorialFocusComplete
}: {
  onStartBattle: () => void;
  onOpenMarkedRaiders: () => void;
  onStartMercenary: () => void;
  onOpenRefugeeCamp: () => void;
  onStartTollCaptain: () => void;
  onOpenFortMuster: () => void;
  onStartIronRoad: () => void;
  onOpenTimberClaim: () => void;
  onOpenKingdomDefense: () => void;
  onOpenBrokenSignalTower: () => void;
  onStartIronProvost: () => void;
  onOpenMarcherEnvoy: () => void;
  onStartBorderFort: () => void;
  onOpenThreeWarnings: () => void;
  onStartSiegeRoad: () => void;
  onOpenDividedMarch: () => void;
  onStartLordMarshal: () => void;
  onOpenStrongholdMuster: () => void;
  onStartBrokenStandards: () => void;
  onOpenEmptyThrone: () => void;
  onStartCrownroadAmbush: () => void;
  onOpenLastLoyalists: () => void;
  onStartPretenderGeneral: () => void;
  onOpenRoyalDecrees: () => void;
  onStartOldRoyalLands: () => void;
  onOpenBrokenArchives: () => void;
  onStartAshenEnvoy: () => void;
  onOpenRoyalLedger: () => void;
  onStartGateOfCrownspire: () => void;
  onOpenGrandCouncil: () => void;
  onStartSunderedFields: () => void;
  onOpenConcordVault: () => void;
  onStartAshenCourt: () => void;
  onOpenForcedBeacon: () => void;
  onStartReturnToCrownspire: () => void;
  onStartFactionOpeningBattle: () => void;
  onOpenFactionInvestigation: () => void;
  onStartFactionEliteBattle: () => void;
  onOpenFactionSupply: () => void;
  onStartFactionBoss: () => void;
  onOpenFactionChapterTwoRecruitment: () => void;
  onStartFactionChapterTwoBattle: () => void;
  onOpenFactionChapterTwoResource: () => void;
  onStartFactionChapterTwoElite: () => void;
  onOpenFactionChapterTwoCouncil: () => void;
  onStartFactionChapterTwoBoss: () => void;
  onOpenFactionChapterThreeRecruitment: () => void;
  onStartFactionChapterThreeBattle: () => void;
  onOpenFactionChapterThreeResource: () => void;
  onStartFactionChapterThreeElite: () => void;
  onOpenFactionChapterThreeCouncil: () => void;
  onStartFactionChapterThreeBoss: () => void;
  onOpenFactionChapterFourRecruitment: () => void;
  onStartFactionChapterFourBattle: () => void;
  onOpenFactionChapterFourResource: () => void;
  onStartFactionChapterFourElite: () => void;
  onOpenFactionChapterFourCouncil: () => void;
  onStartFactionChapterFourBoss: () => void;
  onOpenFactionChapterFiveMuster: () => void;
  onStartFactionChapterFiveBattle: () => void;
  onOpenFactionChapterFiveResource: () => void;
  onStartFactionChapterFiveElite: () => void;
  onOpenFactionChapterFiveSeal: () => void;
  onStartFactionChapterFiveBoss: () => void;
  onOpenFactionMandate: () => void;
  onStartFactionChapterSixBattle: () => void;
  onOpenFactionChapterSixConcord: () => void;
  onStartFactionChapterSixElite: () => void;
  onOpenFactionChapterSixSeal: () => void;
  onStartFactionChapterSixBoss: () => void;
  onOpenMetaCampaign: () => void;
  onOpenWarTable: () => void;
  onOpenExpedition: () => void;
  onOpenSiege: () => void;
  onOpenRelicHunt: () => void;
  onOpenFormationTrial: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNumber,
    chapterNodes,
    settlementUpgraded,
    firstPromotionComplete,
    mercenaryPatrolWon,
    commanderPathId,
    refugeeCampSecured,
    fourthRecruitChosen,
    unlockedResourceSites,
    kingdomDefenseCompleted,
    kingdomDefenseRuns,
    signalTowerUnlocked,
    ironProvostWon,
    marcherWarningChoiceId,
    dividedMarchResolved,
    lordMarshalWon,
    sixthRecruitChosen,
    lastLoyalistsChoiceId,
    pretenderGeneralWon,
    royalDecreeId,
    campaignAvailability,
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
    claimRewardedAd,
    rewardedAdClaims,
    rewardedAdMessage
  } = useGame();
  const [view, setView] = useState<CampaignView>('story');
  const completed = chapterNodes.filter(node => node.completed).length;

  if (activeFaction !== 'human') {
    return (
      <FactionOpeningCampaignScreen
        onStartOpeningBattle={onStartFactionOpeningBattle}
        onOpenInvestigation={onOpenFactionInvestigation}
        onStartEliteBattle={onStartFactionEliteBattle}
        onOpenSupply={onOpenFactionSupply}
        onStartBoss={onStartFactionBoss}
        onOpenChapterTwoRecruitment={onOpenFactionChapterTwoRecruitment}
        onStartChapterTwoBattle={onStartFactionChapterTwoBattle}
        onOpenChapterTwoResource={onOpenFactionChapterTwoResource}
        onStartChapterTwoElite={onStartFactionChapterTwoElite}
        onOpenChapterTwoCouncil={onOpenFactionChapterTwoCouncil}
        onStartChapterTwoBoss={onStartFactionChapterTwoBoss}
        onOpenChapterThreeRecruitment={onOpenFactionChapterThreeRecruitment}
        onStartChapterThreeBattle={onStartFactionChapterThreeBattle}
        onOpenChapterThreeResource={onOpenFactionChapterThreeResource}
        onStartChapterThreeElite={onStartFactionChapterThreeElite}
        onOpenChapterThreeCouncil={onOpenFactionChapterThreeCouncil}
        onStartChapterThreeBoss={onStartFactionChapterThreeBoss}
        onOpenChapterFourRecruitment={onOpenFactionChapterFourRecruitment}
        onStartChapterFourBattle={onStartFactionChapterFourBattle}
        onOpenChapterFourResource={onOpenFactionChapterFourResource}
        onStartChapterFourElite={onStartFactionChapterFourElite}
        onOpenChapterFourCouncil={onOpenFactionChapterFourCouncil}
        onStartChapterFourBoss={onStartFactionChapterFourBoss}
        onOpenChapterFiveMuster={onOpenFactionChapterFiveMuster}
        onStartChapterFiveBattle={onStartFactionChapterFiveBattle}
        onOpenChapterFiveResource={onOpenFactionChapterFiveResource}
        onStartChapterFiveElite={onStartFactionChapterFiveElite}
        onOpenChapterFiveSeal={onOpenFactionChapterFiveSeal}
        onStartChapterFiveBoss={onStartFactionChapterFiveBoss}
        onOpenFactionMandate={onOpenFactionMandate}
        onStartChapterSixBattle={onStartFactionChapterSixBattle}
        onOpenChapterSixConcord={onOpenFactionChapterSixConcord}
        onStartChapterSixElite={onStartFactionChapterSixElite}
        onOpenChapterSixSeal={onOpenFactionChapterSixSeal}
        onStartChapterSixBoss={onStartFactionChapterSixBoss}
        onOpenMetaCampaign={onOpenMetaCampaign}
        onOpenWarTable={onOpenWarTable}
        onOpenExpedition={onOpenExpedition}
        onOpenSiege={onOpenSiege}
        onOpenRelicHunt={onOpenRelicHunt}
        onOpenFormationTrial={onOpenFormationTrial}
        onOpenKingdomDefense={onOpenKingdomDefense}
        tutorialFocus={tutorialFocus}
        onTutorialFocusComplete={onTutorialFocusComplete}
      />
    );
  }

  const campaignById = (id: CampaignId) =>
    campaignAvailability.find(campaign => campaign.id === id);

  const renderStory = () => (
    <>
      <ScreenHero
        eyebrow={'CHAPTER ' + chapterNumber}
        title={
          chapterNumber === 1
            ? 'The Last Wagon'
            : chapterNumber === 2
              ? 'The Iron Road'
              : chapterNumber === 3
                ? 'Border Kingdoms'
                : chapterNumber === 4
                  ? 'The Broken Crown'
                  : chapterNumber === 5
                    ? 'Old Royal Lands'
                    : 'Return to Crownspire'
        }
        body={
          chapterNumber === 1
            ? 'Reach ruined Greenkeep with the surviving squads.'
            : chapterNumber === 2
              ? 'Use Greenkeep Fort to reopen the road toward the Iron Hills.'
              : chapterNumber === 3
                ? 'Carry Greenkeep’s authority into the divided Border Marches.'
                : chapterNumber === 4
                  ? 'Push beyond the marcher crisis toward the broken western crown.'
                  : chapterNumber === 5
                    ? 'Govern the western realm as a Capital and trace the final royal records toward Crownspire.'
                    : 'Lead the Grand Campaign into Crownspire and confront the Ashen Court around the Concord Beacon.'
        }
        accent={theme.colors.human}
        status={<StatusPill label="HUMAN" tone="current" />}
      >
        <View style={styles.chapterMetrics}>
          <MetricTile
            label="OBJECTIVES"
            value={completed + '/6'}
            caption="completed this chapter"
            tone="positive"
          />
          <MetricTile
            label="CAMPAIGN"
            value={'CH ' + chapterNumber}
            caption="current story tier"
            tone="gold"
          />
        </View>
      </ScreenHero>

      <SectionTitle title="Caelora" trailing="Western frontier" />

      <View style={[styles.map, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
        <RegionMapBackdrop faction="human" chapter={chapterNumber} />
        <View style={[styles.humanTerritory, { backgroundColor: theme.colors.human + '24' }]} />
        <View style={[styles.neutralTerritory, { backgroundColor: theme.colors.gold + '18' }]} />

        {humanRegions.map(region => {
          const greenkeepUnlocked = region.id === 'greenkeep_vale' && settlementUpgraded;
          const ironRoadUnlocked = region.id === 'iron_hills' && chapterNumber >= 2;
          const borderUnlocked =
            region.id === 'border_marches' && chapterNumber >= 3;
          const crownspireUnlocked =
            region.id === 'crownspire' && chapterNumber >= 5;
          const active =
            region.state === 'current' ||
            greenkeepUnlocked ||
            ironRoadUnlocked ||
            borderUnlocked ||
            crownspireUnlocked;
          const locked =
            region.state === 'locked' &&
            !greenkeepUnlocked &&
            !ironRoadUnlocked &&
            !borderUnlocked &&
            !crownspireUnlocked;
          const accent = region.faction === 'neutral' ? theme.colors.gold : theme.colors.human;

          return (
            <View
              key={region.id}
              style={[
                styles.region,
                {
                  left: (String(region.x) + '%') as ViewStyle['left'],
                  top: (String(region.y) + '%') as ViewStyle['top']
                }
              ]}
            >
              <View
                style={[
                  styles.regionDot,
                  {
                    borderColor: accent,
                    backgroundColor: active ? accent : theme.colors.surface2,
                    opacity: locked ? 0.5 : 1
                  }
                ]}
              >
                <Text style={[styles.regionDotText, { color: active ? '#FFFFFF' : accent }]}>
                  {active ? '●' : locked ? '×' : '○'}
                </Text>
              </View>
              <Text
                style={[
                  styles.regionName,
                  { color: locked ? theme.colors.textMuted : theme.colors.text }
                ]}
                numberOfLines={2}
              >
                {region.name}
              </Text>
            </View>
          );
        })}

        <View style={[styles.route, { backgroundColor: theme.colors.human }]} />
      </View>

      <SectionTitle
        title={
          chapterNumber === 1
            ? 'Greenkeep Outskirts'
            : chapterNumber === 2
              ? 'Iron Hills Approach'
              : chapterNumber === 3
                ? 'Border Marches'
                : chapterNumber === 4
                  ? 'Crown Road'
                  : chapterNumber === 5
                    ? 'Old Royal Lands'
                    : 'Crownspire Basin'
        }
        trailing="Current region"
      />

      <View style={styles.nodeList}>
        {chapterNodes.map((node, index) => {
          const chapterOneBattle =
            chapterNumber === 1 &&
            node.current &&
            node.type === 'battle' &&
            node.id === 'node_2';
          const chapterOneStory =
            chapterNumber === 1 &&
            node.current &&
            node.type === 'event' &&
            node.id === 'node_3';
          const mercenaryPlayable =
            chapterNumber === 1 &&
            node.current &&
            node.id === 'node_4' &&
            firstPromotionComplete &&
            !mercenaryPatrolWon;
          const refugeePlayable =
            chapterNumber === 1 &&
            node.current &&
            node.id === 'node_5' &&
            Boolean(commanderPathId) &&
            !refugeeCampSecured;
          const bossPlayable =
            chapterNumber === 1 &&
            node.current &&
            node.id === 'node_6' &&
            refugeeCampSecured;

          const fortMusterPlayable =
            chapterNumber === 2 &&
            node.current &&
            node.id === 'ch2_node_1' &&
            !fourthRecruitChosen;
          const ironRoadPlayable =
            chapterNumber === 2 &&
            node.current &&
            node.id === 'ch2_node_2' &&
            fourthRecruitChosen;
          const timberPlayable =
            chapterNumber === 2 &&
            node.current &&
            node.id === 'ch2_node_3' &&
            unlockedResourceSites.includes('iron_hills_mine');
          const defensePlayable =
            chapterNumber === 2 &&
            node.current &&
            node.id === 'ch2_node_4';
          const signalPlayable =
            chapterNumber === 2 &&
            node.current &&
            node.id === 'ch2_node_5' &&
            kingdomDefenseCompleted &&
            !signalTowerUnlocked;
          const provostPlayable =
            chapterNumber === 2 &&
            node.current &&
            node.id === 'ch2_node_6' &&
            signalTowerUnlocked &&
            !ironProvostWon;

          const marcherEnvoyPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_1';
          const borderFortPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_2';
          const warningsPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_3' &&
            !marcherWarningChoiceId;
          const siegeRoadPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_4' &&
            Boolean(marcherWarningChoiceId);
          const dividedMarchPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_5' &&
            !dividedMarchResolved;
          const lordMarshalPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_6' &&
            dividedMarchResolved &&
            !lordMarshalWon;

          const strongholdMusterPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_1' &&
            !sixthRecruitChosen;
          const brokenStandardsPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_2' &&
            sixthRecruitChosen;
          const emptyThronePlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_3';
          const crownroadAmbushPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_4';
          const lastLoyalistsPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_5' &&
            !lastLoyalistsChoiceId;
          const pretenderGeneralPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_6' &&
            Boolean(lastLoyalistsChoiceId) &&
            !pretenderGeneralWon;

          const capitalCouncilPlayable =
            chapterNumber === 5 &&
            node.current &&
            node.id === 'ch5_node_1' &&
            !royalDecreeId;
          const oldRoyalLandsPlayable =
            chapterNumber === 5 &&
            node.current &&
            node.id === 'ch5_node_2' &&
            Boolean(royalDecreeId);
          const brokenArchivesPlayable =
            chapterNumber === 5 &&
            node.current &&
            node.id === 'ch5_node_3';
          const ashenEnvoyPlayable =
            chapterNumber === 5 &&
            node.current &&
            node.id === 'ch5_node_4';
          const royalLedgerPlayable =
            chapterNumber === 5 &&
            node.current &&
            node.id === 'ch5_node_5';
          const crownspireGatePlayable =
            chapterNumber === 5 &&
            node.current &&
            node.id === 'ch5_node_6';

          const grandCouncilPlayable =
            chapterNumber === 6 &&
            node.current &&
            node.id === 'ch6_node_1';
          const sunderedFieldsPlayable =
            chapterNumber === 6 &&
            node.current &&
            node.id === 'ch6_node_2';
          const concordVaultPlayable =
            chapterNumber === 6 &&
            node.current &&
            node.id === 'ch6_node_3';
          const ashenCourtPlayable =
            chapterNumber === 6 &&
            node.current &&
            node.id === 'ch6_node_4';
          const forcedBeaconPlayable =
            chapterNumber === 6 &&
            node.current &&
            node.id === 'ch6_node_5';
          const returnToCrownspirePlayable =
            chapterNumber === 6 &&
            node.current &&
            node.id === 'ch6_node_6';

          const playable =
            chapterOneBattle ||
            chapterOneStory ||
            mercenaryPlayable ||
            refugeePlayable ||
            bossPlayable ||
            fortMusterPlayable ||
            ironRoadPlayable ||
            timberPlayable ||
            defensePlayable ||
            signalPlayable ||
            provostPlayable ||
            marcherEnvoyPlayable ||
            borderFortPlayable ||
            warningsPlayable ||
            siegeRoadPlayable ||
            dividedMarchPlayable ||
            lordMarshalPlayable ||
            strongholdMusterPlayable ||
            brokenStandardsPlayable ||
            emptyThronePlayable ||
            crownroadAmbushPlayable ||
            lastLoyalistsPlayable ||
            pretenderGeneralPlayable ||
            capitalCouncilPlayable ||
            oldRoyalLandsPlayable ||
            brokenArchivesPlayable ||
            ashenEnvoyPlayable ||
            royalLedgerPlayable ||
            crownspireGatePlayable ||
            grandCouncilPlayable ||
            sunderedFieldsPlayable ||
            concordVaultPlayable ||
            ashenCourtPlayable ||
            forcedBeaconPlayable ||
            returnToCrownspirePlayable;

          const status = node.completed
            ? 'DONE'
            : node.id === 'node_4' && node.current && !firstPromotionComplete
              ? 'PROMOTE FIRST'
              : node.id === 'node_5' && node.current && !commanderPathId
                ? 'CHOOSE COMMANDER'
                : refugeePlayable
                  ? 'WELCOME REFUGEES'
                  : fortMusterPlayable
                    ? 'CHOOSE SQUAD'
                    : ironRoadPlayable
                      ? 'PLAY'
                      : timberPlayable
                        ? 'SECURE SITE'
                        : defensePlayable
                          ? 'DEFEND'
                          : signalPlayable
                            ? 'RESTORE'
                            : provostPlayable
                              ? 'BOSS'
                              : marcherEnvoyPlayable
                                ? 'CHOOSE AUXILIARY'
                                : borderFortPlayable
                                  ? 'PLAY'
                                  : warningsPlayable
                                    ? 'CHOOSE DOCTRINE'
                                    : siegeRoadPlayable
                                      ? 'PLAY'
                                      : dividedMarchPlayable
                                        ? 'UNITE MARCHES'
                                        : lordMarshalPlayable
                                          ? 'BOSS'
                                          : strongholdMusterPlayable
                                            ? 'CHOOSE SQUAD'
                                            : brokenStandardsPlayable
                                              ? 'PLAY'
                                              : emptyThronePlayable
                                                ? 'INVESTIGATE'
                                                : crownroadAmbushPlayable
                                                  ? 'PLAY'
                                                  : lastLoyalistsPlayable
                                                    ? 'CHOOSE APPROACH'
                                                    : pretenderGeneralPlayable
                                                      ? 'BOSS'
                                                      : capitalCouncilPlayable
                                                        ? 'CHOOSE DECREE'
                                                        : oldRoyalLandsPlayable
                                                          ? 'PLAY'
                                                          : brokenArchivesPlayable
                                                            ? 'INVESTIGATE'
                                                            : ashenEnvoyPlayable
                                                              ? 'ELITE'
                                                              : royalLedgerPlayable
                                                                ? 'READ LEDGER'
                                                                : crownspireGatePlayable
                                                                  ? 'BOSS'
                                                                  : grandCouncilPlayable
                                                                    ? 'COUNCIL'
                                                                    : sunderedFieldsPlayable
                                                                      ? 'PLAY'
                                                                      : concordVaultPlayable
                                                                        ? 'OPEN VAULT'
                                                                        : ashenCourtPlayable
                                                                          ? 'ELITE'
                                                                          : forcedBeaconPlayable
                                                                            ? 'TRUTH'
                                                                            : returnToCrownspirePlayable
                                                                              ? 'FINAL BOSS'
                                                                              : bossPlayable
                                ? 'BOSS'
                            : playable
                              ? 'PLAY'
                              : node.current
                                ? 'NEXT'
                                : 'LOCKED';

          const action = chapterOneBattle
            ? onStartBattle
            : chapterOneStory
              ? onOpenMarkedRaiders
              : mercenaryPlayable
                ? onStartMercenary
                : refugeePlayable
                  ? onOpenRefugeeCamp
                  : bossPlayable
                    ? onStartTollCaptain
                    : fortMusterPlayable
                      ? onOpenFortMuster
                      : ironRoadPlayable
                        ? onStartIronRoad
                        : timberPlayable
                          ? onOpenTimberClaim
                          : defensePlayable
                            ? onOpenKingdomDefense
                            : signalPlayable
                              ? onOpenBrokenSignalTower
                              : provostPlayable
                                ? onStartIronProvost
                                : marcherEnvoyPlayable
                                  ? onOpenMarcherEnvoy
                                  : borderFortPlayable
                                    ? onStartBorderFort
                                    : warningsPlayable
                                      ? onOpenThreeWarnings
                                      : siegeRoadPlayable
                                        ? onStartSiegeRoad
                                        : dividedMarchPlayable
                                          ? onOpenDividedMarch
                                          : lordMarshalPlayable
                                            ? onStartLordMarshal
                                            : strongholdMusterPlayable
                                              ? onOpenStrongholdMuster
                                              : brokenStandardsPlayable
                                                ? onStartBrokenStandards
                                                : emptyThronePlayable
                                                  ? onOpenEmptyThrone
                                                  : crownroadAmbushPlayable
                                                    ? onStartCrownroadAmbush
                                                    : lastLoyalistsPlayable
                                                      ? onOpenLastLoyalists
                                                      : pretenderGeneralPlayable
                                                        ? onStartPretenderGeneral
                                                        : capitalCouncilPlayable
                                                          ? onOpenRoyalDecrees
                                                          : oldRoyalLandsPlayable
                                                            ? onStartOldRoyalLands
                                                            : brokenArchivesPlayable
                                                              ? onOpenBrokenArchives
                                                              : ashenEnvoyPlayable
                                                                ? onStartAshenEnvoy
                                                                : royalLedgerPlayable
                                                                  ? onOpenRoyalLedger
                                                                  : crownspireGatePlayable
                                                                    ? onStartGateOfCrownspire
                                                                    : grandCouncilPlayable
                                                                      ? onOpenGrandCouncil
                                                                      : sunderedFieldsPlayable
                                                                        ? onStartSunderedFields
                                                                        : concordVaultPlayable
                                                                          ? onOpenConcordVault
                                                                          : ashenCourtPlayable
                                                                            ? onStartAshenCourt
                                                                            : forcedBeaconPlayable
                                                                              ? onOpenForcedBeacon
                                                                              : returnToCrownspirePlayable
                                                                                ? onStartReturnToCrownspire
                                                                                : undefined;

          return (
            <Pressable
              key={node.id}
              disabled={!playable}
              onPress={() => {
                if (
                  tutorialFocus?.kind === 'campaign-current' &&
                  node.current
                ) {
                  onTutorialFocusComplete?.();
                }
                action?.();
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
            >
              <TutorialFocus
                active={Boolean(
                  tutorialFocus?.kind === 'campaign-current' &&
                  node.current &&
                  playable
                )}
                label={
                  tutorialFocus?.kind === 'campaign-current' &&
                  node.current
                    ? tutorialFocus.label
                    : undefined
                }
              >
              <GameCard
                accent={node.current ? theme.colors.human : undefined}
                faction="human"
                state={node.completed ? 'ready' : node.current ? 'selected' : 'locked'}
                style={styles.nodeCard}
              >
                <View
                  style={[
                    styles.nodeIcon,
                    {
                      backgroundColor: node.completed
                        ? theme.colors.primary
                        : node.current
                          ? theme.colors.human
                          : theme.colors.surface2
                    }
                  ]}
                >
                  <CampaignNodeSprite
                    type={node.type}
                    faction="human"
                    active={node.completed || node.current}
                    size={26}
                  />
                </View>
                <View style={styles.nodeCopy}>
                  <Text style={[styles.nodeMeta, { color: theme.colors.textMuted }]}>
                    {String(index + 1).padStart(2, '0')} · {node.type.toUpperCase()}
                  </Text>
                  <Text style={[styles.nodeName, { color: theme.colors.text }]}>{node.name}</Text>
                </View>
                <StatusPill
                  label={status}
                  tone={
                    node.completed
                      ? 'done'
                      : status.includes('BOSS')
                        ? 'boss'
                        : status === 'ELITE'
                          ? 'elite'
                          : playable
                            ? 'ready'
                            : node.current
                              ? 'current'
                              : 'locked'
                  }
                />
              </GameCard>
              </TutorialFocus>
            </Pressable>
          );
        })}
      </View>
    </>
  );

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
  const activitiesUnlocked =
    availableSideModes.length > 0;

  const openMode = (id: SideModeId) => {
    if (id === 'war_table') onOpenWarTable();
    if (id === 'expeditions') onOpenExpedition();
    if (id === 'sieges') onOpenSiege();
    if (id === 'relic_hunts') onOpenRelicHunt();
    if (id === 'formation_trials') onOpenFormationTrial();
    if (id === 'kingdom_defense') onOpenKingdomDefense();
  };

  const activityAttention = (id: SideModeId) => {
    if (id === 'expeditions' && activeExpeditionRun) {
      if (activeExpeditionRun.completed) {
        return { label: 'NEW REWARD', tone: 'reward' as const };
      }
      if (activeExpeditionRun.failed) {
        return { label: 'REVIEW', tone: 'review' as const };
      }
      return { label: 'RESUME', tone: 'resume' as const };
    }
    if (id === 'sieges' && activeSiegeRun) {
      if (activeSiegeRun.completed) {
        return { label: 'NEW REWARD', tone: 'reward' as const };
      }
      if (activeSiegeRun.failed) {
        return { label: 'REVIEW', tone: 'review' as const };
      }
      return { label: 'RESUME', tone: 'resume' as const };
    }
    if (id === 'relic_hunts') {
      if (activeRelicHuntRun) {
        if (activeRelicHuntRun.completed) {
          return {
            label: relicHuntRewardClaimed ? 'RUN COMPLETE' : 'NEW RELIC',
            tone: 'reward' as const
          };
        }
        if (activeRelicHuntRun.failed) {
          return { label: 'REVIEW', tone: 'review' as const };
        }
        return { label: 'RESUME', tone: 'resume' as const };
      }
      if (!relicHuntRewardClaimed) {
        return { label: 'FIRST CLEAR', tone: 'unique' as const };
      }
    }
    return null;
  };

  const activitiesNeedAttention =
    availableSideModes.some(mode => {
      const attention = activityAttention(mode.id);
      return attention && attention.tone !== 'unique';
    });

  const activityStatus = (id: SideModeId) => {
    if (id === 'war_table') {
      return 'Board ' +
        (warTableCycle + 1) +
        ' · ' +
        warTableCompletedContractIds.length +
        '/3';
    }
    if (id === 'expeditions') {
      return activeExpeditionRun
        ? activeExpeditionRun.completed
          ? 'Loot ready'
          : activeExpeditionRun.failed
            ? 'Run ended'
            : 'Stage ' +
              (activeExpeditionRun.stageIndex + 1) +
              '/5 · Active'
        : expeditionTickets +
          (expeditionTickets === 1 ? ' ticket' : ' tickets') +
          ' · ' +
          expeditionRunsCompleted +
          ' clears';
    }
    if (id === 'sieges') {
      return activeSiegeRun
        ? activeSiegeRun.completed
          ? 'Reward ready'
          : activeSiegeRun.failed
            ? 'Assault ended'
            : 'Stage ' +
              (activeSiegeRun.stageIndex + 1) +
              '/4 · Active'
        : siegeRunsCompleted +
          (siegeRunsCompleted === 1 ? ' clear' : ' clears');
    }
    if (id === 'relic_hunts') {
      return activeRelicHuntRun
        ? activeRelicHuntRun.completed
          ? relicHuntRewardClaimed
            ? 'Run complete'
            : 'Relic ready'
          : activeRelicHuntRun.failed
            ? 'Hunt ended'
            : 'Guardian ' +
              (activeRelicHuntRun.stageIndex + 1) +
              '/3 · Active'
        : relicHuntRewardClaimed
          ? relicHuntRunsCompleted + ' clears · Claimed'
          : 'First-clear Relic';
    }
    if (id === 'formation_trials') {
      return kingdomTrialCompletions.length + '/3 medals';
    }
    return kingdomDefenseCompleted
      ? kingdomDefenseRuns +
        (kingdomDefenseRuns === 1 ? ' clear' : ' clears')
      : 'Endurance';
  };

  const activityActionLabel = (id: SideModeId) => {
    const attention = activityAttention(id);
    if (attention?.tone === 'reward') {
      return id === 'relic_hunts' && !relicHuntRewardClaimed
        ? 'Claim Relic'
        : 'Claim reward';
    }
    if (attention?.tone === 'review') return 'Review';
    if (attention?.tone === 'resume') return 'Resume';
    return 'Open';
  };

  const renderActivities = () => (
    <>
      <ScreenHero
        eyebrow="OPTIONAL MODES"
        title="Beyond the Campaign"
        body="Repeatable modes test formation and wagon builds without requiring another story chapter."
        accent={theme.colors.primary}
        status={<StatusPill label="REPEATABLE" tone="available" />}
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
            <SectionTitle
              title={group.title}
              trailing={
                modes.length +
                (modes.length === 1
                  ? ' mode'
                  : ' modes')
              }
            />
            <Text
              style={[
                styles.activityGroupSubtitle,
                { color: theme.colors.textMuted }
              ]}
            >
              {group.subtitle}
            </Text>
            <View style={styles.activityList}>
              {modes.map(mode => {
                const attention =
                  activityAttention(mode.id);
                return (
                  <ActivityCard
                    key={mode.id}
                    mode={mode}
                    faction="human"
                    accent={theme.colors.primary}
                    status={activityStatus(mode.id)}
                    actionLabel={activityActionLabel(mode.id)}
                    highlight={attention?.tone === 'reward'}
                    attentionLabel={attention?.label}
                    attentionTone={attention?.tone}
                    onPress={() => openMode(mode.id)}
                  />
                );
              })}
            </View>
          </View>
        );
      })}

      {isSideModeUnlocked('expeditions') ? (
        <>
          <SectionTitle title="Optional rewarded ads" trailing="No forced ads" />
          <GameCard>
            <Text style={[styles.adTitle, { color: theme.colors.text }]}>Extra Expedition Ticket</Text>
            <Text style={[styles.adBody, { color: theme.colors.textMuted }]}>
              Rewarded only. Skipping it never removes a normal reward or blocks progression.
            </Text>
            <Text style={[styles.adReward, { color: theme.colors.gold }]}>
              {rewardedAdPlacements.find(p => p.id === 'expedition_ticket')?.rewardSummary}
            </Text>
            <View style={styles.modeButton}>
              <SecondaryButton
                label={
                  (rewardedAdClaims.expedition_ticket ?? 0) >= 1
                    ? 'Reward claimed'
                    : 'Watch optional ad'
                }
                disabled={(rewardedAdClaims.expedition_ticket ?? 0) >= 1}
                onPress={() => void claimRewardedAd('expedition_ticket')}
              />
            </View>
            {rewardedAdMessage ? (
              <Text style={[styles.adMessage, { color: theme.colors.textMuted }]}>{rewardedAdMessage}</Text>
            ) : null}
          </GameCard>
        </>
      ) : null}
    </>
  );

  const renderFactions = () => (
    <>
      <ScreenHero
        eyebrow="CAMPAIGNS"
        title="Three Perspectives"
        body="Humans are the required first campaign. Finishing Human Chapter 6 unlocks Elves and Orcs together. Completing all three unlocks the final Three Seals campaign."
        accent={theme.colors.gold}
        status={
          <StatusPill
            label={
              campaignAvailability.filter(
                campaign => campaign.completed
              ).length + '/3 COMPLETE'
            }
            tone="current"
          />
        }
      />

      {factionOrder.map(id => {
        const faction = factions[id];
        const availability = campaignById(id);
        const accent =
          id === 'human' ? theme.colors.human : id === 'elf' ? theme.colors.elf : theme.colors.orc;

        return (
          <GameCard
            key={id}
            faction={id}
            state={
              id === activeFaction
                ? 'selected'
                : availability?.completed
                  ? 'ready'
                  : availability?.unlocked
                    ? 'default'
                    : 'locked'
            }
            accent={availability?.unlocked ? accent : undefined}
          >
            <View style={styles.factionHeader}>
              <FactionCrest faction={id} size={46} />
              <View style={styles.factionCopy}>
                <Text style={[styles.factionName, { color: theme.colors.text }]}>{faction.name}</Text>
                <Text style={[styles.factionCampaign, { color: accent }]}>{faction.campaignName}</Text>
              </View>
              <StatusPill
                label={
                  id === activeFaction
                    ? 'CURRENT'
                    : availability?.completed
                      ? 'COMPLETE'
                      : availability?.unlocked
                        ? 'AVAILABLE'
                        : 'LOCKED'
                }
                tone={
                  id === activeFaction
                    ? 'current'
                    : availability?.completed
                      ? 'done'
                      : availability?.unlocked
                        ? 'available'
                        : 'locked'
                }
              />
            </View>
            <Text style={[styles.factionSubtitle, { color: theme.colors.textMuted }]}>
              {faction.campaignSubtitle}
            </Text>
            <View style={[styles.mechanicBox, { backgroundColor: theme.colors.surface2 }]}>
              <Text style={[styles.mechanicName, { color: theme.colors.text }]}>
                Unique mechanic: {faction.mechanicName}
              </Text>
              <Text style={[styles.mechanicBody, { color: theme.colors.textMuted }]}>
                {faction.mechanicSummary}
              </Text>
            </View>
            <Text style={[styles.replayReason, { color: theme.colors.gold }]}>
              Why replay: {faction.replayReason}
            </Text>
            {!availability?.unlocked ? (
              <View style={styles.unlockRow}>
                <LockIcon color={theme.colors.textMuted} size={20} />
                <Text style={[styles.unlockText, { color: theme.colors.textMuted }]}>
                  {availability?.unlockText}
                </Text>
              </View>
            ) : null}

            {availability?.unlocked && id !== activeFaction ? (
              <View style={styles.modeButton}>
                <SecondaryButton
                  label={
                    hasFactionState(id)
                      ? 'Switch to ' + faction.name
                      : 'Start ' + faction.name + ' Campaign'
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

      <GameCard accent={campaignById('meta')?.unlocked ? theme.colors.gold : undefined}>
        <Text style={[styles.modeName, { color: theme.colors.text }]}>Three Seals</Text>
        <Text style={[styles.modeBody, { color: theme.colors.textMuted }]}>
          Final single-player Crownspire campaign. The currently active completed faction leads while the other two arrive as allied NPC armies.
        </Text>
        {campaignById('meta')?.unlocked ? (
          <View style={styles.modeButton}>
            <PrimaryButton
              label={campaignById('meta')?.completed ? 'View Restored Concord' : 'Enter Three Seals Campaign'}
              onPress={onOpenMetaCampaign}
            />
          </View>
        ) : (
          <View style={styles.unlockRow}>
            <LockIcon color={theme.colors.textMuted} size={20} />
            <Text style={[styles.unlockText, { color: theme.colors.textMuted }]}>
              {campaignById('meta')?.unlockText}
            </Text>
          </View>
        )}
      </GameCard>
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.segment, { backgroundColor: theme.colors.surface1 }]}>
        {(activitiesUnlocked
          ? (['story', 'activities', 'factions'] as CampaignView[])
          : (['story', 'factions'] as CampaignView[])
        ).map(option => {
          const focused =
            tutorialFocus?.kind === 'campaign-activities' &&
            option === 'activities';

          return (
            <TutorialFocus
              key={option}
              active={focused}
              label={focused ? tutorialFocus.label : undefined}
              style={styles.tutorialSegmentFocus}
            >
              <Pressable
                onPress={() => {
                  if (focused) {
                    onTutorialFocusComplete?.();
                  }
                  setView(option);
                }}
                style={[
                  styles.segmentButton,
                  view === option ? { backgroundColor: theme.colors.surface2 } : undefined
                ]}
              >
                <View style={styles.segmentLabelRow}>
                  <Text
                    style={[
                      styles.segmentText,
                      { color: view === option ? theme.colors.primary : theme.colors.textMuted }
                    ]}
                  >
                    {option === 'story' ? 'Story' : option === 'activities' ? 'Activities' : 'Factions'}
                  </Text>
                  {option === 'activities' && activitiesNeedAttention ? (
                    <View
                      style={[
                        styles.segmentDot,
                        { backgroundColor: theme.colors.gold }
                      ]}
                    />
                  ) : null}
                </View>
              </Pressable>
            </TutorialFocus>
          );
        })}
      </View>

      {view === 'story' ? renderStory() : view === 'activities' ? renderActivities() : renderFactions()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  segment: {
    flexDirection: 'row',
    borderRadius: 13,
    padding: 4,
    gap: 4
  },
  tutorialSegmentFocus: { flex: 1 },
  segmentButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  segmentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  segmentText: { fontSize: 10, fontWeight: '900' },
  segmentDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  chapterMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  map: { height: 330, borderRadius: 22, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  humanTerritory: {
    position: 'absolute', left: '-10%', top: '12%', width: '62%', height: '88%',
    borderTopRightRadius: 160, borderBottomRightRadius: 120
  },
  neutralTerritory: {
    position: 'absolute', left: '46%', top: '10%', width: '54%', height: '90%',
    borderTopLeftRadius: 140, borderBottomLeftRadius: 90
  },
  region: { position: 'absolute', width: 88, marginLeft: -22, marginTop: -22, alignItems: 'center' },
  regionDot: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  regionDotText: { fontSize: 13, fontWeight: '900' },
  regionName: { textAlign: 'center', fontSize: 10, lineHeight: 13, marginTop: 4, fontWeight: '800' },
  route: { position: 'absolute', left: '15%', top: '62%', width: '26%', height: 3, transform: [{ rotate: '-4deg' }], opacity: 0.4 },
  nodeList: { gap: 8 },
  nodeCard: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
  nodeIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nodeIconText: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  nodeCopy: { flex: 1 },
  nodeMeta: { fontSize: 10, fontWeight: '800' },
  nodeName: { fontSize: 15, fontWeight: '900', marginTop: 3 },
  chevron: { fontSize: 10, fontWeight: '900' },
  activityHeroTitle: { fontSize: 20, fontWeight: '900' },
  activityHeroBody: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  activityGroup: { gap: 7 },
  activityGroupSubtitle: { fontSize: 10.5, lineHeight: 15, marginTop: -6 },
  activityList: { gap: 8 },
  modeHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  modeCopy: { flex: 1 },
  modeName: { fontSize: 17, fontWeight: '900' },
  modeSubtitle: { fontSize: 10, fontWeight: '900', marginTop: 2, textTransform: 'uppercase' },
  modeBody: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  modeExample: { fontSize: 11, fontWeight: '800', marginTop: 8 },
  modeReward: { fontSize: 10.5, fontWeight: '800', marginTop: 6 },
  modeMeta: { fontSize: 10, marginTop: 7, fontWeight: '700' },
  modeStatusRow: { marginTop: 8, alignItems: 'flex-start' },
  modeButton: { marginTop: 12 },
  adTitle: { fontSize: 15, fontWeight: '900' },
  adBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  adReward: { fontSize: 11, fontWeight: '900', marginTop: 7 },
  adMessage: { fontSize: 10, textAlign: 'center', marginTop: 8 },
  factionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  factionMark: { width: 48, height: 52, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  factionLetter: { fontSize: 19, fontWeight: '900' },
  factionCopy: { flex: 1 },
  factionName: { fontSize: 17, fontWeight: '900' },
  factionCampaign: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  factionSubtitle: { fontSize: 12, lineHeight: 17, marginTop: 9 },
  mechanicBox: { borderRadius: 14, padding: 10, marginTop: 10 },
  mechanicName: { fontSize: 11, fontWeight: '900' },
  mechanicBody: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  replayReason: { fontSize: 10.5, lineHeight: 15, fontWeight: '800', marginTop: 9 },
  unlockRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },
  unlockText: { flex: 1, fontSize: 10.5, lineHeight: 15, fontWeight: '700' }
});
