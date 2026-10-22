import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { CampaignNodeSprite, FactionCrest, LockIcon } from '../ui/gameArt';
import { CampaignJourneyMap } from '../ui/CampaignJourneyMap';
import { humanCampaignArtworkForNode, humanCampaignArtworkForMission } from '../ui/humanCampaignMissionArt';
import { HumanChapterTransitionBanner } from '../ui/HumanChapterTransitionBanner';
import { HumanCampaignFrontCard } from '../ui/HumanCampaignFrontCard';
import { humanChapterStories } from '../ui/humanCampaignStoryPresentation';
import { FactionOpeningCampaignScreen } from './FactionOpeningCampaignScreen';
import { TutorialFocus } from '../ui/TutorialFocus';
import { ActivityCard } from '../ui/ActivityCard';
import {
  activityGroups,
  activityPresentation
} from '../game/activityPresentation';
import type { TutorialFocusTarget } from '../game/tutorial';

type CampaignView = 'story' | 'activities' | 'factions';

const humanChapterVisuals: Record<number, {
  tint: string;
  label: string;
  glow: string;
  phase: string;
  force: string;
  threat: string;
  directive: string;
}> = {
  1: {
    tint: '#173A66',
    label: 'GREENKEEP',
    glow: '#6EA8E8',
    phase: 'SURVIVE',
    force: '2 SQUADS',
    threat: 'RAIDERS',
    directive: 'Hold the remnant together and reclaim a foothold.'
  },
  2: {
    tint: '#5A4A36',
    label: 'IRON HILLS',
    glow: '#C8A56A',
    phase: 'MUSTER',
    force: '3 SQUADS',
    threat: 'IRON LINE',
    directive: 'Build a real warband and learn to break disciplined formations.'
  },
  3: {
    tint: '#355B75',
    label: 'FROSTMARCH',
    glow: '#9BD8F0',
    phase: 'BREAKTHROUGH',
    force: '4 SQUADS',
    threat: 'LAYERED HOST',
    directive: 'Master cavalry, flanks and formation integrity in the frozen march.'
  },
  4: {
    tint: '#514A43',
    label: 'GREYWATCH',
    glow: '#D8B66A',
    phase: 'FORTIFY',
    force: '5 SQUADS',
    threat: 'ELITE WAR',
    directive: 'Choose doctrine, prepare loadouts and turn a warband into an army.'
  },
  5: {
    tint: '#253F72',
    label: 'CROWNROAD',
    glow: '#E6C45B',
    phase: 'KINGDOM WAR',
    force: '6 SQUADS',
    threat: 'COMBINED ARMS',
    directive: 'Field the full army and answer pressure from ground and sky at once.'
  },
  6: {
    tint: '#4C3C73',
    label: 'GLASS KEEP',
    glow: '#BCA7F0',
    phase: 'ARCANE FRONT',
    force: '6 SQUADS',
    threat: 'MAGES',
    directive: 'Break wards and control a battlefield reshaped by arcane warfare.'
  },
  7: {
    tint: '#623932',
    label: 'BLACKSTONE',
    glow: '#E2936E',
    phase: 'FINAL SIEGE',
    force: '6 SQUADS',
    threat: 'WAR MACHINES',
    directive: 'Breach the fortress, protect the siege effort and end the campaign.'
  }
};

function humanChapterVisual(chapter: number) {
  return humanChapterVisuals[chapter] ?? humanChapterVisuals[1]!;
}

export function CampaignScreen({
  onStartBattle,
  onOpenMarkedRaiders,
  onStartMercenary,
  onOpenRefugeeCamp,
  onStartTollCaptain,
  onOpenFortMuster,
  onStartIronRoad,
  onStartRidersOnRoad,
  onOpenTimberClaim,
  onOpenKingdomDefense,
  onOpenBrokenSignalTower,
  onStartIronLine,
  onStartIronProvost,
  onOpenMarcherEnvoy,
  onStartBorderFort,
  onStartFrozenSteel,
  onStartHoovesSnow,
  onOpenThreeWarnings,
  onStartSiegeRoad,
  onStartThroughGap,
  onStartWolvesWing,
  onStartLayeredHost,
  onOpenDividedMarch,
  onStartLordMarshal,
  onStartLongFront,
  onStartBrokenStandards,
  onOpenChapterFourCommander,
  onStartBrokenGround,
  onStartCrownroadAmbush,
  onOpenEmptyThrone,
  onStartWrongArmy,
  onOpenStrongholdMuster,
  onStartHuntersRear,
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
  onOpenHumanLateMission,
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
  onStartRidersOnRoad: () => void;
  onOpenTimberClaim: () => void;
  onOpenKingdomDefense: () => void;
  onOpenBrokenSignalTower: () => void;
  onStartIronLine: () => void;
  onStartIronProvost: () => void;
  onOpenMarcherEnvoy: () => void;
  onStartBorderFort: () => void;
  onStartFrozenSteel: () => void;
  onStartHoovesSnow: () => void;
  onOpenThreeWarnings: () => void;
  onStartSiegeRoad: () => void;
  onStartThroughGap: () => void;
  onStartWolvesWing: () => void;
  onStartLayeredHost: () => void;
  onOpenDividedMarch: () => void;
  onStartLordMarshal: () => void;
  onStartLongFront: () => void;
  onStartBrokenStandards: () => void;
  onOpenChapterFourCommander: () => void;
  onStartBrokenGround: () => void;
  onStartCrownroadAmbush: () => void;
  onOpenEmptyThrone: () => void;
  onStartWrongArmy: () => void;
  onOpenStrongholdMuster: () => void;
  onStartHuntersRear: () => void;
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
  onOpenHumanLateMission: (nodeId: string) => void;
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
    activeSquadCap,
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
  const [showAllMissions, setShowAllMissions] = useState(false);
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

  const currentHumanRegionIndex =
    chapterNumber >= 7
      ? 7
      : chapterNumber >= 6
        ? 6
        : chapterNumber >= 5
          ? 5
          : chapterNumber >= 4
            ? 4
            : chapterNumber >= 3
              ? 3
              : chapterNumber >= 2
                ? 2
                : settlementUpgraded
                  ? 1
                  : 0;
  const currentChapterVisual = humanChapterVisual(chapterNumber);
  const activeMissionIndex = chapterNodes.findIndex(node => node.current && !node.completed);
  const firstUnfinishedIndex = chapterNodes.findIndex(node => !node.completed);
  const focusedMissionIndex = activeMissionIndex >= 0 ? activeMissionIndex : firstUnfinishedIndex;
  const finalHumanFrontSecured = chapterNumber === 7 && chapterNodes.length === 11 && completed === 11;

  const humanJourney = humanRegions.map((region, index) => ({
    id: region.id,
    name: region.name,
    status:
      index < currentHumanRegionIndex || (finalHumanFrontSecured && index === currentHumanRegionIndex)
        ? ('done' as const)
        : index === currentHumanRegionIndex
          ? ('current' as const)
          : ('locked' as const),
    detail:
      index < currentHumanRegionIndex
        ? 'Route secured'
        : index === currentHumanRegionIndex
          ? 'Current campaign region'
          : 'Advance the story to reveal this route'
  }));

  const renderStory = () => (
    <>
      <HumanChapterTransitionBanner chapterNumber={chapterNumber} completed={completed} total={chapterNodes.length} />
      <HumanCampaignFrontCard
        chapterNumber={chapterNumber}
        nodes={chapterNodes}
        activeSquadCap={activeSquadCap}
        accent={currentChapterVisual.glow}
        tint={currentChapterVisual.tint}
      />

      <SectionTitle title="Caelora" trailing="Western frontier" />

      <CampaignJourneyMap
        faction="human"
        accent={currentChapterVisual.glow}
        points={humanJourney}
        regionArtwork={humanCampaignArtworkForMission(chapterNumber, 1).source}
      />

      <SectionTitle
        title={
          chapterNumber === 1
            ? 'Greenkeep Outskirts'
            : chapterNumber === 2
              ? 'Iron Hills Approach'
              : chapterNumber === 3
                ? 'Frostmarch'
                : chapterNumber === 4
                  ? 'Greywatch Frontier'
                  : chapterNumber === 5
                    ? 'Crownroad Muster'
                    : chapterNumber === 6
                      ? 'Arcane Marches'
                      : 'Blackstone Siege'
        }
        trailing="Current region"
      />

      <Pressable
        testID="human-campaign-mission-disclosure"
        accessibilityRole="button"
        accessibilityState={{ expanded: showAllMissions }}
        accessibilityLabel={showAllMissions ? 'Focus on current campaign missions' : 'Show all chapter missions'}
        onPress={() => setShowAllMissions(value => !value)}
        style={[styles.missionDisclosure, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}
      >
        <Text style={[styles.missionDisclosureText, { color: theme.colors.text }]}>
          {showAllMissions ? 'Focus on current objective' : 'Show all ' + chapterNodes.length + ' missions'}
        </Text>
        <Text style={[styles.missionDisclosureHint, { color: theme.colors.textMuted }]}>
          {showAllMissions ? 'Hide completed and distant missions' : 'Current · next · chapter finale'}
        </Text>
      </Pressable>
      <View style={styles.nodeList}>
        {chapterNodes.map((node, index) => {
          const chapterVisual = humanChapterVisual(chapterNumber);
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
            node.id === 'node_5' &&
            firstPromotionComplete &&
            !mercenaryPatrolWon;
          const refugeePlayable =
            chapterNumber === 1 &&
            node.current &&
            node.id === 'node_6' &&
            Boolean(commanderPathId) &&
            !refugeeCampSecured;
          const bossPlayable =
            chapterNumber === 1 &&
            node.current &&
            node.id === 'node_7' &&
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
          const ridersPlayable =
            chapterNumber === 2 &&
            node.current &&
            node.id === 'ch2_node_3';
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
          const ironLinePlayable =
            chapterNumber === 2 &&
            node.current &&
            node.id === 'ch2_node_6' &&
            signalTowerUnlocked;
          const timberPlayable =
            chapterNumber === 2 &&
            node.current &&
            node.id === 'ch2_node_7' &&
            unlockedResourceSites.includes('iron_hills_mine');
          const provostPlayable =
            chapterNumber === 2 &&
            node.current &&
            node.id === 'ch2_node_8' &&
            signalTowerUnlocked &&
            unlockedResourceSites.includes('greenwood_camp') &&
            !ironProvostWon;

          const marcherEnvoyPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_1';
          const borderFortPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_2';
          const frozenSteelPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_3';
          const hoovesSnowPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_4';
          const warningsPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_5' &&
            !marcherWarningChoiceId;
          const siegeRoadPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_6' &&
            Boolean(marcherWarningChoiceId);
          const throughGapPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_7';
          const wolvesWingPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_8';
          const layeredHostPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_9';
          const dividedMarchPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_10' &&
            !dividedMarchResolved;
          const lordMarshalPlayable =
            chapterNumber === 3 &&
            node.current &&
            node.id === 'ch3_node_11' &&
            dividedMarchResolved &&
            !lordMarshalWon;

          const longFrontPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_1';
          const brokenStandardsPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_2';
          const chapterFourCommanderPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_3';
          const brokenGroundPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_4';
          const crownroadAmbushPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_5';
          const emptyThronePlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_6';
          const wrongArmyPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_7';
          const strongholdMusterPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_8' &&
            !sixthRecruitChosen;
          const huntersRearPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_9';
          const lastLoyalistsPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_10' &&
            !lastLoyalistsChoiceId;
          const pretenderGeneralPlayable =
            chapterNumber === 4 &&
            node.current &&
            node.id === 'ch4_node_11' &&
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

          const humanLatePlayable =
            chapterNumber >= 5 &&
            node.current;

          const playable =
            humanLatePlayable ||
            chapterOneBattle ||
            chapterOneStory ||
            mercenaryPlayable ||
            refugeePlayable ||
            bossPlayable ||
            fortMusterPlayable ||
            ironRoadPlayable ||
            ridersPlayable ||
            defensePlayable ||
            signalPlayable ||
            ironLinePlayable ||
            timberPlayable ||
            provostPlayable ||
            marcherEnvoyPlayable ||
            borderFortPlayable ||
            frozenSteelPlayable ||
            hoovesSnowPlayable ||
            warningsPlayable ||
            siegeRoadPlayable ||
            throughGapPlayable ||
            wolvesWingPlayable ||
            layeredHostPlayable ||
            dividedMarchPlayable ||
            lordMarshalPlayable ||
            longFrontPlayable ||
            brokenStandardsPlayable ||
            chapterFourCommanderPlayable ||
            brokenGroundPlayable ||
            crownroadAmbushPlayable ||
            emptyThronePlayable ||
            wrongArmyPlayable ||
            strongholdMusterPlayable ||
            huntersRearPlayable ||
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

          const lateStatus =
            node.type === 'boss'
              ? chapterNumber === 7
                ? 'FINAL BOSS'
                : 'BOSS'
              : node.type === 'siege'
                ? 'SIEGE'
                : node.type === 'defense'
                  ? 'DEFEND'
                  : node.type === 'operation'
                    ? 'OPERATION'
                    : node.type === 'choice'
                      ? 'CHOOSE'
                      : node.type === 'upgrade'
                        ? 'UPGRADE'
                        : node.type === 'event'
                          ? 'EVENT'
                          : 'PLAY';

          const status = node.completed
            ? 'DONE'
            : humanLatePlayable
              ? lateStatus
            : node.id === 'node_4' && node.current && !firstPromotionComplete
              ? 'PROMOTE FIRST'
              : node.id === 'node_6' && node.current && !commanderPathId
                ? 'CHOOSE COMMANDER'
                : refugeePlayable
                  ? 'WELCOME REFUGEES'
                  : fortMusterPlayable
                    ? 'CHOOSE SQUAD'
                    : ironRoadPlayable
                      ? 'PLAY'
                      : ridersPlayable
                        ? 'PLAY'
                        : defensePlayable
                          ? 'DEFEND'
                          : signalPlayable
                            ? 'RESTORE'
                            : ironLinePlayable
                              ? 'BREAK WALL'
                              : timberPlayable
                                ? 'PREPARE'
                                : provostPlayable
                                  ? 'BOSS'
                              : marcherEnvoyPlayable
                                ? 'CHOOSE AUXILIARY'
                                : borderFortPlayable
                                  ? 'PLAY'
                                  : frozenSteelPlayable
                                    ? 'PLAY'
                                    : hoovesSnowPlayable
                                      ? 'PLAY'
                                      : warningsPlayable
                                        ? 'CHOOSE RIDER'
                                        : siegeRoadPlayable
                                          ? 'PLAY'
                                          : throughGapPlayable
                                            ? 'PLAY'
                                            : wolvesWingPlayable
                                              ? 'PLAY'
                                              : layeredHostPlayable
                                                ? 'PLAY'
                                                : dividedMarchPlayable
                                                  ? 'PREPARE'
                                                  : lordMarshalPlayable
                                                    ? 'BOSS'
                                                    : longFrontPlayable
                                                      ? 'PLAY'
                                                      : brokenStandardsPlayable
                                                        ? 'PLAY'
                                                        : chapterFourCommanderPlayable
                                                          ? 'CHOOSE DOCTRINE'
                                                          : brokenGroundPlayable
                                                            ? 'PLAY'
                                                            : crownroadAmbushPlayable
                                                              ? 'HOLD'
                                                              : emptyThronePlayable
                                                                ? 'PREPARE'
                                                                : wrongArmyPlayable
                                                                  ? 'PLAY'
                                                                  : strongholdMusterPlayable
                                                                    ? 'CHOOSE ELITE'
                                                                    : huntersRearPlayable
                                                                      ? 'PLAY'
                                                                      : lastLoyalistsPlayable
                                                                        ? 'CHOOSE ROUTE'
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

          const action = humanLatePlayable
            ? () => onOpenHumanLateMission(node.id)
            : chapterOneBattle
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
                        : ridersPlayable
                          ? onStartRidersOnRoad
                          : defensePlayable
                            ? onOpenKingdomDefense
                            : signalPlayable
                              ? onOpenBrokenSignalTower
                              : ironLinePlayable
                                ? onStartIronLine
                                : timberPlayable
                                  ? onOpenTimberClaim
                                  : provostPlayable
                                    ? onStartIronProvost
                                : marcherEnvoyPlayable
                                  ? onOpenMarcherEnvoy
                                  : borderFortPlayable
                                    ? onStartBorderFort
                                    : frozenSteelPlayable
                                      ? onStartFrozenSteel
                                      : hoovesSnowPlayable
                                        ? onStartHoovesSnow
                                        : warningsPlayable
                                          ? onOpenThreeWarnings
                                          : siegeRoadPlayable
                                            ? onStartSiegeRoad
                                            : throughGapPlayable
                                              ? onStartThroughGap
                                              : wolvesWingPlayable
                                                ? onStartWolvesWing
                                                : layeredHostPlayable
                                                  ? onStartLayeredHost
                                                  : dividedMarchPlayable
                                                    ? onOpenDividedMarch
                                                    : lordMarshalPlayable
                                                      ? onStartLordMarshal
                                                      : longFrontPlayable
                                                        ? onStartLongFront
                                                        : brokenStandardsPlayable
                                                          ? onStartBrokenStandards
                                                          : chapterFourCommanderPlayable
                                                            ? onOpenChapterFourCommander
                                                            : brokenGroundPlayable
                                                              ? onStartBrokenGround
                                                              : crownroadAmbushPlayable
                                                                ? onStartCrownroadAmbush
                                                                : emptyThronePlayable
                                                                  ? onOpenEmptyThrone
                                                                  : wrongArmyPlayable
                                                                    ? onStartWrongArmy
                                                                    : strongholdMusterPlayable
                                                                      ? onOpenStrongholdMuster
                                                                      : huntersRearPlayable
                                                                        ? onStartHuntersRear
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

          // Keep the current front, the next step and its finale visible;
          // historical missions remain accessible in the disclosure above.
          if (!showAllMissions && !node.current && node.type !== 'boss' &&
              index !== focusedMissionIndex + 1 && index !== focusedMissionIndex) return null;

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
              style={({ pressed }) => ({
                opacity: pressed ? 0.84 : 1,
                transform: [{ translateY: pressed ? 1 : 0 }]
              })}
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
                accent={
                  node.current || node.type === 'boss'
                    ? chapterVisual.glow
                    : undefined
                }
                faction="human"
                state={node.completed ? 'ready' : node.current ? 'selected' : 'locked'}
                style={[
                  styles.nodeCard,
                  node.type === 'boss'
                    ? styles.nodeBossCard
                    : node.type === 'elite'
                      ? styles.nodeEliteCard
                      : undefined
                ]}
              >
                <View
                  style={[
                    styles.nodeVisual,
                    node.type === 'boss'
                      ? styles.nodeVisualBoss
                      : node.type === 'elite'
                        ? styles.nodeVisualElite
                        : undefined,
                    {
                      borderColor: node.completed
                        ? theme.colors.primary
                        : node.current || node.type === 'boss'
                          ? chapterVisual.glow
                          : theme.colors.border,
                      opacity: node.completed || node.current ? 1 : 0.48
                    }
                  ]}
                >
                  <Image
                    source={humanCampaignArtworkForNode(chapterNumber, node.id).source}
                    resizeMode="cover"
                    fadeDuration={0}
                    style={styles.nodeArt}
                  />
                  <View
                    pointerEvents="none"
                    style={[
                      styles.nodeChapterTint,
                      {
                        backgroundColor: chapterVisual.tint,
                        opacity: node.completed ? 0.08 : node.current ? 0.15 : 0.2
                      }
                    ]}
                  />
                  <View
                    pointerEvents="none"
                    style={[
                      styles.nodeChapterTag,
                      {
                        backgroundColor: theme.dark ? '#05070BCC' : '#F6F2E8DD',
                        borderColor: chapterVisual.glow
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.nodeChapterTagText,
                        { color: theme.dark ? chapterVisual.glow : chapterVisual.tint }
                      ]}
                      numberOfLines={1}
                    >
                      {chapterVisual.label}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.nodeTypeBadge,
                      {
                        backgroundColor: theme.dark
                          ? '#05070BCC'
                          : '#FFFFFFD9',
                        borderColor: node.current || node.type === 'boss'
                          ? chapterVisual.glow
                          : theme.colors.border
                      }
                    ]}
                  >
                    <CampaignNodeSprite
                      type={node.type}
                      faction="human"
                      active={node.completed || node.current}
                      size={17}
                    />
                  </View>
                </View>
                <View style={styles.nodeCopy}>
                  {node.type === 'boss' ? (
                    <Text
                      style={[
                        styles.nodeEncounterLabel,
                        { color: chapterVisual.glow }
                      ]}
                    >
                      CHAPTER FINALE
                    </Text>
                  ) : node.type === 'elite' ? (
                    <Text
                      style={[
                        styles.nodeEncounterLabel,
                        { color: theme.colors.gold }
                      ]}
                    >
                      ELITE ENCOUNTER
                    </Text>
                  ) : null}
                  <Text style={[styles.nodeMeta, { color: theme.colors.textMuted }]}>
                    {String(index + 1).padStart(2, '0')} · {node.type.toUpperCase()}
                  </Text>
                  <Text style={[styles.nodeName, { color: theme.colors.text }]}>{node.name}</Text>
                  {node.type === 'boss' && node.current && !node.completed ? (
                    <Text style={[styles.nodeBossHint, { color: theme.colors.textMuted }]}>
                      {humanChapterStories[chapterNumber as keyof typeof humanChapterStories]?.finale}
                    </Text>
                  ) : null}
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
        body="Repeatable tactical modes for formations, saved runs and mastery rewards."
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
        body="Humans are the required first campaign. Complete all seven Human chapters to unlock Elves and Orcs together. Completing all three faction campaigns unlocks the Three Seals finale."
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
                hitSlop={4}
                accessibilityRole="tab"
                accessibilityLabel={
                  option === 'story'
                    ? 'Story'
                    : option === 'activities'
                      ? activitiesNeedAttention
                        ? 'Activities, attention required'
                        : 'Activities'
                      : 'Factions'
                }
                accessibilityState={{ selected: view === option }}
                onPress={() => {
                  if (focused) {
                    onTutorialFocusComplete?.();
                  }
                  setView(option);
                }}
                style={({ pressed }) => [
                  styles.segmentButton,
                  view === option
                    ? {
                        backgroundColor: theme.colors.surface2,
                        borderColor: theme.colors.primary + '55'
                      }
                    : { borderColor: 'transparent' },
                  {
                    opacity: pressed ? 0.78 : 1,
                    transform: [{ translateY: pressed ? 1 : 0 }]
                  }
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
  content: { padding: 12, paddingBottom: 24, gap: 9 },
  segment: {
    flexDirection: 'row',
    borderRadius: 11,
    padding: 3,
    gap: 3
  },
  tutorialSegmentFocus: { flex: 1 },
  segmentButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1,
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
    gap: 6
  },
  chapterIdentity: {
    position: 'relative',
    overflow: 'hidden',
    gap: 8
  },
  chapterIdentityRail: {
    position: 'absolute',
    left: 0,
    top: 9,
    bottom: 9,
    width: 3,
    borderRadius: 2
  },
  chapterIdentityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  chapterCrestFrame: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  chapterIdentityCopy: {
    flex: 1,
    minWidth: 0
  },
  chapterIdentityEyebrow: {
    fontSize: 8.5,
    lineHeight: 11,
    letterSpacing: 0.9,
    fontWeight: '900'
  },
  chapterDirective: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    marginTop: 3
  },
  chapterIntelRow: {
    flexDirection: 'row',
    gap: 5
  },
  chapterIntel: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 6
  },
  chapterIntelLabel: {
    fontSize: 6.5,
    lineHeight: 8,
    letterSpacing: 0.55,
    fontWeight: '900'
  },
  chapterIntelValue: {
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: '900',
    marginTop: 2
  },
  map: { height: 304, borderRadius: 18, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  humanTerritory: {
    position: 'absolute', left: '-10%', top: '12%', width: '62%', height: '88%',
    borderTopRightRadius: 160, borderBottomRightRadius: 120
  },
  neutralTerritory: {
    position: 'absolute', left: '46%', top: '10%', width: '54%', height: '90%',
    borderTopLeftRadius: 140, borderBottomLeftRadius: 90
  },
  region: { position: 'absolute', width: 82, marginLeft: -20, marginTop: -20, alignItems: 'center' },
  regionDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  regionDotText: { fontSize: 12, fontWeight: '900' },
  regionName: { textAlign: 'center', fontSize: 10, lineHeight: 13, marginTop: 4, fontWeight: '800' },
  route: { position: 'absolute', left: '15%', top: '62%', width: '26%', height: 3, transform: [{ rotate: '-4deg' }], opacity: 0.4 },
  missionDisclosure: { borderRadius: 10, borderWidth: 1, minHeight: 40, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  missionDisclosureText: { fontSize: 10.5, lineHeight: 14, fontWeight: '900' },
  missionDisclosureHint: { fontSize: 9, lineHeight: 12 },
  nodeList: { gap: 6 },
  nodeCard: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 9 },
  nodeEliteCard: {
    minHeight: 76
  },
  nodeBossCard: {
    minHeight: 82,
    borderWidth: 1.5
  },
  nodeVisual: {
    width: 84,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative'
  },
  nodeVisualElite: {
    width: 92,
    height: 58,
    borderWidth: 1.5
  },
  nodeVisualBoss: {
    width: 104,
    height: 62,
    borderWidth: 2
  },
  nodeArt: {
    width: '100%',
    height: '100%'
  },
  nodeChapterTint: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  nodeChapterTag: {
    position: 'absolute',
    right: 3,
    top: 3,
    maxWidth: 56,
    minHeight: 14,
    paddingHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nodeChapterTagText: {
    fontSize: 6.5,
    lineHeight: 9,
    letterSpacing: 0.35,
    fontWeight: '900'
  },
  nodeTypeBadge: {
    position: 'absolute',
    left: 3,
    bottom: 3,
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nodeIconText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  nodeCopy: { flex: 1 },
  nodeEncounterLabel: {
    fontSize: 7.5,
    lineHeight: 9,
    letterSpacing: 0.75,
    fontWeight: '900',
    marginBottom: 2
  },
  nodeMeta: { fontSize: 10, fontWeight: '800' },
  nodeName: { fontSize: 14, fontWeight: '900', marginTop: 2 },
  nodeBossHint: { fontSize: 9.5, lineHeight: 13, marginTop: 4 },
  chevron: { fontSize: 10, fontWeight: '900' },
  activityHeroTitle: { fontSize: 18, fontWeight: '900' },
  activityHeroBody: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  activityGroup: { gap: 6 },
  activityGroupSubtitle: { fontSize: 10.5, lineHeight: 15, marginTop: -6 },
  activityList: { gap: 7 },
  modeHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  modeCopy: { flex: 1 },
  modeName: { fontSize: 15, fontWeight: '900' },
  modeSubtitle: { fontSize: 10, fontWeight: '900', marginTop: 2, textTransform: 'uppercase' },
  modeBody: { fontSize: 11, lineHeight: 16, marginTop: 6 },
  modeExample: { fontSize: 10.5, fontWeight: '800', marginTop: 6 },
  modeReward: { fontSize: 10.5, fontWeight: '800', marginTop: 6 },
  modeMeta: { fontSize: 10, marginTop: 7, fontWeight: '700' },
  modeStatusRow: { marginTop: 8, alignItems: 'flex-start' },
  modeButton: { marginTop: 9 },
  adTitle: { fontSize: 15, fontWeight: '900' },
  adBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  adReward: { fontSize: 11, fontWeight: '900', marginTop: 7 },
  adMessage: { fontSize: 10, textAlign: 'center', marginTop: 8 },
  factionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  factionMark: { width: 44, height: 48, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  factionLetter: { fontSize: 19, fontWeight: '900' },
  factionCopy: { flex: 1 },
  factionName: { fontSize: 15.5, fontWeight: '900' },
  factionCampaign: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  factionSubtitle: { fontSize: 11, lineHeight: 16, marginTop: 7 },
  mechanicBox: { borderRadius: 11, padding: 8, marginTop: 8 },
  mechanicName: { fontSize: 11, fontWeight: '900' },
  mechanicBody: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  replayReason: { fontSize: 10.5, lineHeight: 15, fontWeight: '800', marginTop: 9 },
  unlockRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },
  unlockText: { flex: 1, fontSize: 10.5, lineHeight: 15, fontWeight: '700' }
});
