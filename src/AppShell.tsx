import React, { useEffect, useRef, useState } from 'react';
import * as StoreReview from 'expo-store-review';
import {
  BackHandler,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { NavId } from './game/types';
import type { BattlePreparationFixTarget } from './game/battlePreparation';
import { resolveHardwareBackAction } from './game/mobileSession';
import {
  getNextTutorialMoment,
  getTutorialCompletionKeys,
  shouldRequestChapterOneReview
} from './game/tutorial';
import type { TutorialFocusTarget } from './game/tutorial';
import { getEncounter } from './game/encounters';
import type { EncounterId } from './game/encounters';
import type { SaveSlotId } from './save/types';
import { useGame } from './game/GameProvider';
import { ArmyScreen } from './screens/ArmyScreen';
import { BattlePrepScreen } from './screens/BattlePrepScreen';
import { BattleScreen, type BattleCombatSummary } from './screens/BattleScreen';
import { BrokenSignalTowerScreen } from './screens/BrokenSignalTowerScreen';
import { BrokenArchivesScreen } from './screens/BrokenArchivesScreen';
import { CampaignScreen } from './screens/CampaignScreen';
import { CommanderChoiceScreen } from './screens/CommanderChoiceScreen';
import { ConcordVaultScreen } from './screens/ConcordVaultScreen';
import { EquipmentManageScreen } from './screens/EquipmentManageScreen';
import { ExpeditionScreen } from './screens/ExpeditionScreen';
import { SiegeScreen } from './screens/SiegeScreen';
import { RelicHuntScreen } from './screens/RelicHuntScreen';
import { FactionCampScreen } from './screens/FactionCampScreen';
import { FactionChapterTwoEventScreen } from './screens/FactionChapterTwoEventScreen';
import { FactionChapterThreeEventScreen } from './screens/FactionChapterThreeEventScreen';
import { FactionChapterFourEventScreen } from './screens/FactionChapterFourEventScreen';
import { FactionChapterFiveEventScreen } from './screens/FactionChapterFiveEventScreen';
import { FactionChapterSixEventScreen } from './screens/FactionChapterSixEventScreen';
import { FactionMandateScreen } from './screens/FactionMandateScreen';
import { FactionFourthRecruitmentScreen } from './screens/FactionFourthRecruitmentScreen';
import { FactionFifthRecruitmentScreen } from './screens/FactionFifthRecruitmentScreen';
import { FantasyResearchScreen } from './screens/FantasyResearchScreen';
import { FlyingResearchScreen } from './screens/FlyingResearchScreen';
import { LargeResearchScreen } from './screens/LargeResearchScreen';
import { HybridResearchScreen } from './screens/HybridResearchScreen';
import { FactionKingdomScreen } from './screens/FactionKingdomScreen';
import { FactionRecruitmentScreen } from './screens/FactionRecruitmentScreen';
import { FactionChapterOneEventScreen } from './screens/FactionChapterOneEventScreen';
import { ForgeScreen } from './screens/ForgeScreen';
import { FormationScreen, type FormationGuide } from './screens/FormationScreen';
import { FortMusterScreen } from './screens/FortMusterScreen';
import { FormationTrialScreen } from './screens/FormationTrialScreen';
import { ForcedBeaconScreen } from './screens/ForcedBeaconScreen';
import { GrandCouncilScreen } from './screens/GrandCouncilScreen';
import { KingdomScreen } from './screens/KingdomScreen';
import { MarkedRaidersScreen } from './screens/MarkedRaidersScreen';
import { LastLoyalistsScreen } from './screens/LastLoyalistsScreen';
import { MarcherEnvoyScreen } from './screens/MarcherEnvoyScreen';
import { MetaCampaignScreen } from './screens/MetaCampaignScreen';
import { PromotionScreen } from './screens/PromotionScreen';
import { RecruitmentScreen } from './screens/RecruitmentScreen';
import { RefugeeCampScreen } from './screens/RefugeeCampScreen';
import { KingdomDefenseScreen } from './screens/KingdomDefenseScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { DefeatResultsScreen } from './screens/DefeatResultsScreen';
import { RoyalLedgerScreen } from './screens/RoyalLedgerScreen';
import { RoyalDecreesScreen } from './screens/RoyalDecreesScreen';
import { StrongholdMusterScreen } from './screens/StrongholdMusterScreen';
import { EmptyThroneScreen } from './screens/EmptyThroneScreen';
import { ThreeWarningsScreen } from './screens/ThreeWarningsScreen';
import { DividedMarchScreen } from './screens/DividedMarchScreen';
import { SettlementScreen } from './screens/SettlementScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TimberClaimScreen } from './screens/TimberClaimScreen';
import { WagonScreen } from './screens/WagonScreen';
import { WarTableScreen } from './screens/WarTableScreen';
import { useGameTheme } from './theme/ThemeProvider';
import { FlowProgress, ScreenAtmosphere } from './ui/components';
import { TutorialCoach } from './ui/TutorialCoach';
import { TutorialFocus } from './ui/TutorialFocus';
import { AppNavIcon, FactionCrest, ThemeModeIcon } from './ui/gameArt';

type FlowScreen =
  | 'battlePrep'
  | 'battle'
  | 'results'
  | 'defeatResults'
  | 'recruitment'
  | 'markedRaiders'
  | 'forge'
  | 'fantasyResearch'
  | 'flyingResearch'
  | 'largeResearch'
  | 'hybridResearch'
  | 'promotion'
  | 'equipment'
  | 'commanderChoice'
  | 'refugeeCamp'
  | 'fortMuster'
  | 'timberClaim'
  | 'kingdomDefense'
  | 'brokenSignalTower'
  | 'marcherEnvoy'
  | 'threeWarnings'
  | 'dividedMarch'
  | 'strongholdMuster'
  | 'emptyThrone'
  | 'lastLoyalists'
  | 'royalDecrees'
  | 'brokenArchives'
  | 'royalLedger'
  | 'grandCouncil'
  | 'concordVault'
  | 'forcedBeacon'
  | 'factionInvestigation'
  | 'factionSupply'
  | 'factionRecruitment'
  | 'factionChapterTwoResource'
  | 'factionChapterTwoCouncil'
  | 'factionFourthRecruitment'
  | 'factionChapterThreeResource'
  | 'factionChapterThreeCouncil'
  | 'factionFifthRecruitment'
  | 'factionChapterFourResource'
  | 'factionChapterFourCouncil'
  | 'factionChapterFiveMuster'
  | 'factionChapterFiveResource'
  | 'factionChapterFiveSeal'
  | 'factionMandate'
  | 'factionChapterSixConcord'
  | 'factionChapterSixSeal'
  | 'metaCampaign'
  | 'settlement'
  | 'warTable'
  | 'expedition'
  | 'siege'
  | 'relicHunt'
  | 'formationTrial'
  | 'settings'
  | 'preparationFix';

const navItems: Array<{ id: NavId; label: string }> = [
  { id: 'kingdom', label: 'Kingdom' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'formation', label: 'Formation' },
  { id: 'wagon', label: 'Wagon' },
  { id: 'army', label: 'Army' }
];

const screenTitles: Record<NavId, string> = {
  kingdom: 'Kingdom',
  campaign: 'Campaign',
  formation: 'Formation',
  wagon: 'Supply Wagon',
  army: 'Army'
};

const flowTitles: Record<FlowScreen, string> = {
  battlePrep: 'Battle Prep',
  battle: 'Battle',
  results: 'Results',
  defeatResults: 'Defeat Report',
  recruitment: 'Recruitment',
  markedRaiders: 'Marked Raiders',
  forge: 'Field Forge',
  fantasyResearch: 'Arcane Research',
  flyingResearch: 'Aerial Training',
  largeResearch: 'Large Unit Mastery',
  hybridResearch: 'Legendary Orders',
  promotion: 'Promotion',
  equipment: 'Equipment',
  commanderChoice: 'Commander Path',
  refugeeCamp: 'Refugee Camp',
  fortMuster: 'Fort Muster',
  timberClaim: 'Timber Claim',
  kingdomDefense: 'Kingdom Defense',
  brokenSignalTower: 'Broken Signal Tower',
  marcherEnvoy: 'Into Frostmarch',
  threeWarnings: 'Choose Your Rider',
  dividedMarch: 'Cold Roads',
  strongholdMuster: 'Veteran Steel',
  emptyThrone: 'Prepare for Battle',
  lastLoyalists: 'The Forked Banner',
  royalDecrees: 'Royal Decrees',
  brokenArchives: 'Broken Archives',
  royalLedger: 'The Royal Ledger',
  grandCouncil: 'Grand Council',
  concordVault: 'Concord Vault',
  forcedBeacon: 'The Forced Beacon',
  factionInvestigation: 'Campaign Investigation',
  factionSupply: 'Campaign Supplies',
  factionRecruitment: 'Faction Muster',
  factionChapterTwoResource: 'Chapter 2 Resource',
  factionChapterTwoCouncil: 'Chapter 2 Council',
  factionFourthRecruitment: 'Faction Muster',
  factionChapterThreeResource: 'Chapter 3 Route',
  factionChapterThreeCouncil: 'Chapter 3 Council',
  factionFifthRecruitment: 'Faction Muster',
  factionChapterFourResource: 'Chapter 4 Recovery',
  factionChapterFourCouncil: 'Chapter 4 Council',
  factionChapterFiveMuster: 'Chapter 5 Muster',
  factionChapterFiveResource: 'Chapter 5 Records',
  factionChapterFiveSeal: 'Seal Trace',
  factionMandate: 'Faction Strategy',
  factionChapterSixConcord: 'Concord Route',
  factionChapterSixSeal: 'The Seal',
  metaCampaign: 'Three Seals',
  settlement: 'Settlement',
  warTable: 'War Table',
  expedition: 'Expedition',
  siege: 'Offensive Siege',
  relicHunt: 'Relic Hunt',
  formationTrial: 'Kingdom Trial',
  settings: 'Settings',
  preparationFix: 'Preparation Fix'
};

export function AppShell({
  saveSlotId,
  onExitToSaves
}: {
  saveSlotId: SaveSlotId;
  onExitToSaves: () => void;
}) {
  const [active, setActive] = useState<NavId>('kingdom');
  const [flow, setFlow] = useState<FlowScreen | null>(null);
  const [commanderChoiceReturn, setCommanderChoiceReturn] =
    useState<'army' | 'campaign'>('army');
  const [activeEncounterId, setActiveEncounterId] = useState<EncounterId>('hold_the_road');
  const [lastCombatSummary, setLastCombatSummary] = useState<BattleCombatSummary | null>(null);
  const [equipmentUnitId, setEquipmentUnitId] = useState('hum_recruit');
  const [formationGuide, setFormationGuide] = useState<FormationGuide | null>(null);
  const [formationReturnFlow, setFormationReturnFlow] =
    useState<'formationTrial' | 'kingdomDefense' | 'expedition' | 'siege' | 'relicHunt' | null>(null);
  const [wagonReturnFlow, setWagonReturnFlow] =
    useState<'kingdomDefense' | 'expedition' | 'siege' | null>(null);
  const [preparationFixTarget, setPreparationFixTarget] =
    useState<BattlePreparationFixTarget | null>(null);
  const [tutorialFocus, setTutorialFocus] =
    useState<TutorialFocusTarget | null>(null);
  const [tutorialFocusKey, setTutorialFocusKey] =
    useState<string | null>(null);
  const reviewAttemptedRef = useRef(false);
  const { theme, cycleTheme } = useGameTheme();
  const {
    activeFaction,
    finishEncounter,
    flushSnapshot,
    lastBattleResult,
    commanderPathId,
    firstPromotionComplete,
    settlementUpgraded,
    units,
    buildings,
    buildingLevels,
    isBuildingUnlocked,
    factionBuildingIds,
    forgeUnlocked,
    armyReadiness,
    unlockedResourceSites,
    currentWagonStage,
    isSideModeUnlocked,
    completedStoryGates,
    researchProgress,
    magicFamilyUnlock,
    magicResearchDefinitions,
    flyingFamilyUnlock,
    flyingResearchDefinitions,
    largeFamilyUnlock,
    largeResearchDefinitions,
    hybridFamilyUnlock,
    hybridResearchDefinitions,
    hybridPrerequisitesMet,
    tutorialSeen,
    markTutorialSeen,
    reviewPromptShown,
    markReviewPromptShown
  } = useGame();

  const tutorialView =
    flow === 'battlePrep' ||
    flow === 'battle' ||
    flow === 'results' ||
    flow === 'settlement' ||
    flow === 'fantasyResearch' ||
    flow === 'flyingResearch' ||
    flow === 'largeResearch' ||
    flow === 'hybridResearch'
      ? flow
      : flow
        ? 'other'
        : active;

  const nextTutorialMoment = getNextTutorialMoment({
    faction: activeFaction,
    view: tutorialView,
    tutorialSeen,
    units,
    buildings: buildings.map(definition => ({
      definition,
      level: buildingLevels[definition.id] ?? 0,
      unlocked: isBuildingUnlocked(definition.id)
    })),
    settlementUpgraded,
    forgeUnlocked,
    forgeLevel:
      buildingLevels[factionBuildingIds.forge] ?? 0,
    firstPromotionComplete,
    commanderPathId,
    armyReadiness,
    unlockedResourceSites:
      unlockedResourceSites.length,
    wagonStageId: currentWagonStage.id,
    warTableUnlocked: isSideModeUnlocked('war_table'),
    kingdomTrialsUnlocked:
      isSideModeUnlocked('formation_trials'),
    kingdomDefenseModeUnlocked:
      isSideModeUnlocked('kingdom_defense'),
    expeditionsUnlocked:
      isSideModeUnlocked('expeditions'),
    siegesUnlocked:
      isSideModeUnlocked('sieges'),
    relicHuntsUnlocked:
      isSideModeUnlocked('relic_hunts'),
    magicStoryUnlocked: Boolean(
      magicFamilyUnlock &&
      completedStoryGates.includes(
        magicFamilyUnlock.storyGateId
      )
    ),
    flyingStoryUnlocked: Boolean(
      flyingFamilyUnlock &&
      completedStoryGates.includes(
        flyingFamilyUnlock.storyGateId
      )
    ),
    largeStoryUnlocked: Boolean(
      largeFamilyUnlock &&
      completedStoryGates.includes(
        largeFamilyUnlock.storyGateId
      )
    ),
    hybridStoryUnlocked: Boolean(
      hybridFamilyUnlock &&
      completedStoryGates.includes(
        hybridFamilyUnlock.storyGateId
      )
    ),
    hybridPrerequisitesMet,
    completedMagicResearch:
      magicResearchDefinitions.filter(
        research => researchProgress[research.id]?.completed
      ).length,
    completedFlyingResearch:
      flyingResearchDefinitions.filter(
        research => researchProgress[research.id]?.completed
      ).length,
    completedLargeResearch:
      largeResearchDefinitions.filter(
        research => researchProgress[research.id]?.completed
      ).length,
    completedHybridResearch:
      hybridResearchDefinitions.filter(
        research => researchProgress[research.id]?.completed
      ).length,
    enemyFantasyThreatFamily:
      flow === 'battlePrep'
        ? getEncounter(activeEncounterId).fantasyThreat ?? null
        : null
  });

  const tutorialMoment =
    tutorialFocus ? null : nextTutorialMoment;

  const openRecruitment = () => setFlow('recruitment');

  const exitToSaveSlots = async () => {
    await flushSnapshot();
    onExitToSaves();
  };

  const handleResultsContinue = () => {
    if (
      [
        'mercenary_patrol_result',
        'elf_hollow_warden_result',
        'orc_blamecaller_result'
      ].includes(lastBattleResult?.id ?? '') &&
      !commanderPathId
    ) {
      setCommanderChoiceReturn('army');
      setFlow('commanderChoice');
      return;
    }

    if (
      [
        'elf_return_through_roots_result',
        'orc_crownspire_warmaster_result'
      ].includes(lastBattleResult?.id ?? '')
    ) {
      setFlow(null);
      setActive('campaign');
      return;
    }

    if (
      activeEncounterId.startsWith('war_table_')
    ) {
      setFlow('warTable');
      setActive('campaign');
      return;
    }

    if (
      [
        'three_seals_convergence_result',
        'ashen_triumvirate_result',
        'unbound_beacon_result'
      ].includes(lastBattleResult?.id ?? '')
    ) {
      setFlow('metaCampaign');
      setActive('campaign');
      return;
    }

    setFlow(null);
    setActive('kingdom');
  };

  const completeTutorialFocus = () => {
    if (tutorialFocusKey) {
      getTutorialCompletionKeys(
        tutorialFocusKey,
        tutorialFocus
      ).forEach(markTutorialSeen);
    }

    setTutorialFocus(null);
    setTutorialFocusKey(null);
  };

  const cancelTutorialFocus = () => {
    setTutorialFocus(null);
    setTutorialFocusKey(null);
  };

  const handleTutorialPrimary = () => {
    if (!tutorialMoment) return;

    const target = tutorialMoment.target;
    const focus = tutorialMoment.focusAfterPrimary ?? null;

    if (focus) {
      setTutorialFocus(focus);
      setTutorialFocusKey(tutorialMoment.key);
    } else {
      markTutorialSeen(tutorialMoment.key);
      setTutorialFocus(null);
      setTutorialFocusKey(null);
    }

    if (target === 'campaign') {
      setFlow(null);
      setActive('campaign');
    } else if (target === 'kingdom') {
      setFlow(null);
      setActive('kingdom');
    } else if (target === 'formation') {
      setFlow(null);
      setActive('formation');
    } else if (target === 'army') {
      setFlow(null);
      setActive('army');
    } else if (target === 'wagon') {
      setFlow(null);
      setActive('wagon');
    } else if (target === 'settlement') {
      setActive('kingdom');
      setFlow('settlement');
    } else if (target === 'forge') {
      setActive('kingdom');
      setFlow('forge');
    }
  };

  useEffect(() => {
    if (
      reviewAttemptedRef.current ||
      !shouldRequestChapterOneReview({
        activeFaction,
        activeView: tutorialView,
        lastBattleResultId:
          lastBattleResult?.id ?? null,
        reviewPromptShown,
        tutorialActive: Boolean(
          tutorialMoment || tutorialFocus
        )
      })
    ) {
      return;
    }

    reviewAttemptedRef.current = true;

    const timer = setTimeout(() => {
      void (async () => {
        try {
          if (!(await StoreReview.hasAction())) {
            return;
          }

          markReviewPromptShown();
          await StoreReview.requestReview();
        } catch {
          // Store-controlled review prompts may be unavailable
          // or suppressed. Never interrupt the normal game flow.
        }
      })();
    }, 900);

    return () => clearTimeout(timer);
  }, [
    active,
    activeFaction,
    flow,
    lastBattleResult?.id,
    markReviewPromptShown,
    reviewPromptShown,
    tutorialMoment,
    tutorialFocus
  ]);

  const renderScreen = () => {
    if (flow === 'settings') {
      return <SettingsScreen />;
    }

    if (flow === 'preparationFix') {
      if (preparationFixTarget === 'formation') {
        return <FormationScreen />;
      }

      if (preparationFixTarget === 'wagon') {
        return <WagonScreen />;
      }

      if (preparationFixTarget === 'equipment') {
        return (
          <EquipmentManageScreen
            unitId={equipmentUnitId}
            onExit={() => setFlow('battlePrep')}
          />
        );
      }

      return <FormationScreen />;
    }

    if (flow === 'battlePrep') {
      return (
        <BattlePrepScreen
          encounterId={activeEncounterId}
          tutorialFocus={tutorialFocus}
          onTutorialFocusComplete={completeTutorialFocus}
          onOpenAdjustment={(adjustment, presetSlotId) => {
            setFormationGuide({
              adjustment,
              presetSlotId
            });
            setFlow(null);
            setActive('formation');
          }}
          onOpenPreparationFix={(target, unitId) => {
            setPreparationFixTarget(target);
            if (unitId) {
              setEquipmentUnitId(unitId);
            }
            setFlow('preparationFix');
          }}
          onBegin={() => {
            setLastCombatSummary(null);
            setFormationGuide(null);
            setFlow('battle');
          }}
        />
      );
    }

    if (flow === 'battle') {
      return (
        <BattleScreen
          encounterId={activeEncounterId}
          pausedForTutorial={
            tutorialMoment?.key === 'core:battle'
          }
          onFinished={summary => {
            setLastCombatSummary(summary);
            finishEncounter(
              activeEncounterId,
              summary
            );
            setFlow('results');
          }}
          onDefeated={summary => {
            setLastCombatSummary(summary);
            setFlow('defeatResults');
          }}
        />
      );
    }

    if (flow === 'results') {
      return (
        <ResultsScreen
          battleSummary={lastCombatSummary}
          onContinue={handleResultsContinue}
          tutorialFocus={tutorialFocus}
          onTutorialFocusComplete={completeTutorialFocus}
        />
      );
    }

    if (
      flow === 'defeatResults' &&
      lastCombatSummary
    ) {
      return (
        <DefeatResultsScreen
          encounterId={activeEncounterId}
          battleSummary={lastCombatSummary}
          onPrepareRematch={() =>
            setFlow('battlePrep')
          }
          onOpenFormation={() => {
            setPreparationFixTarget('formation');
            setFlow('preparationFix');
          }}
          onOpenWagon={() => {
            setPreparationFixTarget('wagon');
            setFlow('preparationFix');
          }}
          onLeave={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'recruitment') {
      return (
        <RecruitmentScreen
          onComplete={() => {
            setFlow(null);
            setActive('formation');
          }}
        />
      );
    }

    if (flow === 'markedRaiders') {
      return (
        <MarkedRaidersScreen
          onOpenForge={() => {
            setFlow(null);
            setActive('kingdom');
          }}
          onExit={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'forge') {
      return (
        <ForgeScreen
          onOpenPromotion={() => setFlow('promotion')}
          tutorialFocus={tutorialFocus}
          onTutorialFocusComplete={completeTutorialFocus}
          onExit={() => {
            setFlow(null);
            setActive('army');
          }}
        />
      );
    }

    if (flow === 'fantasyResearch') {
      return (
        <FantasyResearchScreen
          tutorialFocus={tutorialFocus}
          onTutorialFocusComplete={completeTutorialFocus}
          onExit={() => {
            setFlow(null);
            setActive('army');
          }}
        />
      );
    }

    if (flow === 'flyingResearch') {
      return (
        <FlyingResearchScreen
          tutorialFocus={tutorialFocus}
          onTutorialFocusComplete={completeTutorialFocus}
          onExit={() => {
            setFlow(null);
            setActive('army');
          }}
        />
      );
    }

    if (flow === 'largeResearch') {
      return (
        <LargeResearchScreen
          tutorialFocus={tutorialFocus}
          onTutorialFocusComplete={completeTutorialFocus}
          onExit={() => {
            setFlow(null);
            setActive('army');
          }}
        />
      );
    }

    if (flow === 'hybridResearch') {
      return (
        <HybridResearchScreen
          tutorialFocus={tutorialFocus}
          onTutorialFocusComplete={completeTutorialFocus}
          onExit={() => {
            setFlow(null);
            setActive('army');
          }}
        />
      );
    }

    if (flow === 'promotion') {
      return (
        <PromotionScreen
          onOpenForge={() => setFlow('forge')}
          onComplete={() => {
            markTutorialSeen('system:promotion');
            setFlow(null);
            setActive('army');
          }}
        />
      );
    }

    if (flow === 'equipment') {
      return (
        <EquipmentManageScreen
          unitId={equipmentUnitId}
          onExit={() => {
            setFlow(null);
            setActive('army');
          }}
        />
      );
    }

    if (flow === 'commanderChoice') {
      return (
        <CommanderChoiceScreen
          onComplete={() => {
            markTutorialSeen('system:commander');
            setFlow(null);
            setActive(commanderChoiceReturn);
          }}
        />
      );
    }

    if (flow === 'refugeeCamp') {
      return (
        <RefugeeCampScreen
          onExit={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'fortMuster') {
      return (
        <FortMusterScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'timberClaim') {
      return (
        <TimberClaimScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'kingdomDefense') {
      return (
        <KingdomDefenseScreen
          onExit={() => {
            setFlow(null);
            setActive('campaign');
          }}
          onEditFormation={() => {
            setFormationReturnFlow('kingdomDefense');
            setFlow(null);
            setActive('formation');
          }}
          onEditWagon={() => {
            setWagonReturnFlow('kingdomDefense');
            setFlow(null);
            setActive('wagon');
          }}
        />
      );
    }

    if (flow === 'brokenSignalTower') {
      return (
        <BrokenSignalTowerScreen
          onExit={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'marcherEnvoy') {
      return (
        <MarcherEnvoyScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'threeWarnings') {
      return (
        <ThreeWarningsScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'dividedMarch') {
      return (
        <DividedMarchScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'strongholdMuster') {
      return (
        <StrongholdMusterScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'emptyThrone') {
      return (
        <EmptyThroneScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'lastLoyalists') {
      return (
        <LastLoyalistsScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'royalDecrees') {
      return (
        <RoyalDecreesScreen
          onExit={() => {
            setFlow(null);
            setActive('kingdom');
          }}
        />
      );
    }

    if (flow === 'brokenArchives') {
      return (
        <BrokenArchivesScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'royalLedger') {
      return (
        <RoyalLedgerScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'grandCouncil') {
      return (
        <GrandCouncilScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'concordVault') {
      return (
        <ConcordVaultScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'forcedBeacon') {
      return (
        <ForcedBeaconScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionInvestigation') {
      return (
        <FactionChapterOneEventScreen
          stage="investigation"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionSupply') {
      return (
        <FactionChapterOneEventScreen
          stage="supply"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionRecruitment') {
      return (
        <FactionRecruitmentScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionChapterTwoResource') {
      return (
        <FactionChapterTwoEventScreen
          stage="resource"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionChapterTwoCouncil') {
      return (
        <FactionChapterTwoEventScreen
          stage="council"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionFourthRecruitment') {
      return (
        <FactionFourthRecruitmentScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionChapterThreeResource') {
      return (
        <FactionChapterThreeEventScreen
          stage="resource"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionChapterThreeCouncil') {
      return (
        <FactionChapterThreeEventScreen
          stage="council"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionFifthRecruitment') {
      return (
        <FactionFifthRecruitmentScreen
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionChapterFourResource') {
      return (
        <FactionChapterFourEventScreen
          stage="resource"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionChapterFourCouncil') {
      return (
        <FactionChapterFourEventScreen
          stage="council"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionChapterFiveMuster') {
      return (
        <FactionChapterFiveEventScreen
          stage="muster"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionChapterFiveResource') {
      return (
        <FactionChapterFiveEventScreen
          stage="resource"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionChapterFiveSeal') {
      return (
        <FactionChapterFiveEventScreen
          stage="seal"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionMandate') {
      return (
        <FactionMandateScreen
          onExit={() => {
            setFlow(null);
            setActive('kingdom');
          }}
        />
      );
    }

    if (flow === 'factionChapterSixConcord') {
      return (
        <FactionChapterSixEventScreen
          stage="concord"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'factionChapterSixSeal') {
      return (
        <FactionChapterSixEventScreen
          stage="seal"
          onComplete={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'metaCampaign') {
      return (
        <MetaCampaignScreen
          onStartConvergence={() => {
            setActiveEncounterId('three_seals_convergence');
            setFlow('battlePrep');
          }}
          onStartTriumvirate={() => {
            setActiveEncounterId('ashen_triumvirate');
            setFlow('battlePrep');
          }}
          onStartFinalBoss={() => {
            setActiveEncounterId('unbound_beacon');
            setFlow('battlePrep');
          }}
          onExit={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'settlement') {
      return (
        <SettlementScreen
          tutorialFocus={tutorialFocus}
          onTutorialFocusComplete={completeTutorialFocus}
          onExit={() => {
            setFlow(null);
            setActive('kingdom');
          }}
        />
      );
    }

    if (flow === 'warTable') {
      return (
        <WarTableScreen
          onStartBattle={encounterId => {
            setActiveEncounterId(encounterId);
            setFlow('battlePrep');
          }}
        />
      );
    }

    if (flow === 'expedition') {
      return (
        <ExpeditionScreen
          onEditFormation={() => {
            setFormationReturnFlow('expedition');
            setFlow(null);
            setActive('formation');
          }}
          onEditWagon={() => {
            setWagonReturnFlow('expedition');
            setFlow(null);
            setActive('wagon');
          }}
          onExit={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'siege') {
      return (
        <SiegeScreen
          onEditFormation={() => {
            setFormationReturnFlow('siege');
            setFlow(null);
            setActive('formation');
          }}
          onEditWagon={() => {
            setWagonReturnFlow('siege');
            setFlow(null);
            setActive('wagon');
          }}
          onExit={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'relicHunt') {
      return (
        <RelicHuntScreen
          onEditFormation={() => {
            setFormationReturnFlow('relicHunt');
            setFlow(null);
            setActive('formation');
          }}
          onExit={() => {
            setFlow(null);
            setActive('campaign');
          }}
        />
      );
    }

    if (flow === 'formationTrial') {
      return (
        <FormationTrialScreen
          onExit={() => {
            setFlow(null);
            setActive('campaign');
          }}
          onEditFormation={() => {
            setFormationReturnFlow('formationTrial');
            setFlow(null);
            setActive('formation');
          }}
        />
      );
    }

    switch (active) {
      case 'campaign':
        return (
          <CampaignScreen
            tutorialFocus={tutorialFocus}
            onTutorialFocusComplete={completeTutorialFocus}
            onStartBattle={() => {
              setActiveEncounterId('hold_the_road');
              setFlow('battlePrep');
            }}
            onOpenMarkedRaiders={() => setFlow('markedRaiders')}
            onStartMercenary={() => {
              setActiveEncounterId('mercenary_patrol');
              setFlow('battlePrep');
            }}
            onOpenRefugeeCamp={() => setFlow('refugeeCamp')}
            onStartTollCaptain={() => {
              setActiveEncounterId('toll_captain');
              setFlow('battlePrep');
            }}
            onOpenFortMuster={() => setFlow('fortMuster')}
            onStartIronRoad={() => {
              setActiveEncounterId('iron_road_skirmish');
              setFlow('battlePrep');
            }}
            onStartRidersOnRoad={() => {
              setActiveEncounterId('riders_on_the_road');
              setFlow('battlePrep');
            }}
            onOpenTimberClaim={() => setFlow('timberClaim')}
            onOpenKingdomDefense={() => setFlow('kingdomDefense')}
            onOpenBrokenSignalTower={() => setFlow('brokenSignalTower')}
            onStartIronLine={() => {
              setActiveEncounterId('the_iron_line');
              setFlow('battlePrep');
            }}
            onStartIronProvost={() => {
              setActiveEncounterId('iron_provost');
              setFlow('battlePrep');
            }}
            onOpenMarcherEnvoy={() => setFlow('marcherEnvoy')}
            onStartBorderFort={() => {
              setActiveEncounterId('border_fort');
              setFlow('battlePrep');
            }}
            onStartFrozenSteel={() => {
              setActiveEncounterId('ch3_frozen_steel');
              setFlow('battlePrep');
            }}
            onStartHoovesSnow={() => {
              setActiveEncounterId('ch3_hooves_snow');
              setFlow('battlePrep');
            }}
            onOpenThreeWarnings={() => setFlow('threeWarnings')}
            onStartSiegeRoad={() => {
              setActiveEncounterId('siege_road');
              setFlow('battlePrep');
            }}
            onStartThroughGap={() => {
              setActiveEncounterId('ch3_through_gap');
              setFlow('battlePrep');
            }}
            onStartWolvesWing={() => {
              setActiveEncounterId('ch3_wolves_wing');
              setFlow('battlePrep');
            }}
            onStartLayeredHost={() => {
              setActiveEncounterId('ch3_layered_host');
              setFlow('battlePrep');
            }}
            onOpenDividedMarch={() => setFlow('dividedMarch')}
            onStartLordMarshal={() => {
              setActiveEncounterId('lord_marshal_veyr');
              setFlow('battlePrep');
            }}
            onStartLongFront={() => {
              setActiveEncounterId('ch4_long_front');
              setFlow('battlePrep');
            }}
            onStartBrokenStandards={() => {
              setActiveEncounterId('broken_standards');
              setFlow('battlePrep');
            }}
            onOpenChapterFourCommander={() => {
              setCommanderChoiceReturn('campaign');
              setFlow('commanderChoice');
            }}
            onStartBrokenGround={() => {
              setActiveEncounterId('ch4_broken_ground');
              setFlow('battlePrep');
            }}
            onStartCrownroadAmbush={() => {
              setActiveEncounterId('crownroad_ambush');
              setFlow('battlePrep');
            }}
            onOpenEmptyThrone={() => setFlow('emptyThrone')}
            onStartWrongArmy={() => {
              setActiveEncounterId('ch4_wrong_army');
              setFlow('battlePrep');
            }}
            onOpenStrongholdMuster={() => setFlow('strongholdMuster')}
            onStartHuntersRear={() => {
              setActiveEncounterId('ch4_hunters_rear');
              setFlow('battlePrep');
            }}
            onOpenLastLoyalists={() => setFlow('lastLoyalists')}
            onStartPretenderGeneral={() => {
              setActiveEncounterId('pretender_general');
              setFlow('battlePrep');
            }}
            onStartOldRoyalLands={() => {
              setActiveEncounterId('old_royal_lands');
              setFlow('battlePrep');
            }}
            onOpenRoyalDecrees={() => setFlow('royalDecrees')}
            onStartCh5RallyLine={() => {
              setActiveEncounterId('ch5_rally_line');
              setFlow('battlePrep');
            }}
            onStartCh5AboveShieldwall={() => {
              setActiveEncounterId('ch5_above_shieldwall');
              setFlow('battlePrep');
            }}
            onOpenBrokenArchives={() => setFlow('brokenArchives')}
            onOpenRoyalLedger={() => setFlow('royalLedger')}
            onStartAshenEnvoy={() => {
              setActiveEncounterId('ashen_envoy');
              setFlow('battlePrep');
            }}
            onStartCh5HammerWing={() => {
              setActiveEncounterId('ch5_hammer_wing');
              setFlow('battlePrep');
            }}
            onStartCh5StrongestArmy={() => {
              setActiveEncounterId('ch5_strongest_army');
              setFlow('battlePrep');
            }}
            onStartCh5CrownsMuster={() => {
              setActiveEncounterId('ch5_crowns_muster');
              setFlow('battlePrep');
            }}
            onStartGateOfCrownspire={() => {
              setActiveEncounterId('gate_of_crownspire');
              setFlow('battlePrep');
            }}
            onStartSunderedFields={() => {
              setActiveEncounterId('sundered_fields');
              setFlow('battlePrep');
            }}
            onStartCh6FirstWard={() => {
              setActiveEncounterId('ch6_first_ward');
              setFlow('battlePrep');
            }}
            onOpenGrandCouncil={() => setFlow('grandCouncil')}
            onStartCh6PowerPrice={() => {
              setActiveEncounterId('ch6_power_price');
              setFlow('battlePrep');
            }}
            onStartCh6BreakSpell={() => {
              setActiveEncounterId('ch6_break_spell');
              setFlow('battlePrep');
            }}
            onOpenConcordVault={() => setFlow('concordVault')}
            onStartCh6FireFromAbove={() => {
              setActiveEncounterId('ch6_fire_from_above');
              setFlow('battlePrep');
            }}
            onStartCh6SilentGround={() => {
              setActiveEncounterId('ch6_silent_ground');
              setFlow('battlePrep');
            }}
            onStartCh6WardsSteel={() => {
              setActiveEncounterId('ch6_wards_steel');
              setFlow('battlePrep');
            }}
            onStartAshenCourt={() => {
              setActiveEncounterId('ashen_court');
              setFlow('battlePrep');
            }}
            onStartReturnToCrownspire={() => {
              setActiveEncounterId('return_to_crownspire');
              setFlow('battlePrep');
            }}
            onStartFactionOpeningBattle={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_wardbreakers'
                  : 'orc_red_road'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionInvestigation={() =>
              setFlow('factionInvestigation')
            }
            onStartFactionEliteBattle={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_ashen_tracks'
                  : 'orc_invader_scouts'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionSupply={() => setFlow('factionSupply')}
            onStartFactionBoss={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_hollow_warden'
                  : 'orc_blamecaller'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterTwoRecruitment={() =>
              setFlow('factionRecruitment')
            }
            onStartFactionChapterTwoBattle={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_last_heartgrove'
                  : 'orc_gather_clans'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterTwoResource={() =>
              setFlow('factionChapterTwoResource')
            }
            onStartFactionChapterTwoElite={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_ward_hunters'
                  : 'orc_stonejaw_challengers'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterTwoCouncil={() =>
              setFlow('factionChapterTwoCouncil')
            }
            onStartFactionChapterTwoBoss={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_ashroot_stalker'
                  : 'orc_clanbreaker'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterThreeRecruitment={() =>
              setFlow('factionFourthRecruitment')
            }
            onStartFactionChapterThreeBattle={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_moonlit_pass'
                  : 'orc_stonejaw_trial'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterThreeResource={() =>
              setFlow('factionChapterThreeResource')
            }
            onStartFactionChapterThreeElite={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_ashen_groves'
                  : 'orc_broken_steppe'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterThreeCouncil={() =>
              setFlow('factionChapterThreeCouncil')
            }
            onStartFactionChapterThreeBoss={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_pale_ranger'
                  : 'orc_stonejaw_champion'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterFourRecruitment={() =>
              setFlow('factionFifthRecruitment')
            }
            onStartFactionChapterFourBattle={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_roots_in_ash'
                  : 'orc_two_front_war'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterFourResource={() =>
              setFlow('factionChapterFourResource')
            }
            onStartFactionChapterFourElite={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_two_fronts'
                  : 'orc_broken_steppe_war'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterFourCouncil={() =>
              setFlow('factionChapterFourCouncil')
            }
            onStartFactionChapterFourBoss={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_ashen_druid'
                  : 'orc_split_chieftain'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterFiveMuster={() =>
              setFlow('factionChapterFiveMuster')
            }
            onStartFactionChapterFiveBattle={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_wounded_worldroot'
                  : 'orc_no_clan_left_behind'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterFiveResource={() =>
              setFlow('factionChapterFiveResource')
            }
            onStartFactionChapterFiveElite={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_ashen_rootkeepers'
                  : 'orc_ashen_clanbreakers'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterFiveSeal={() =>
              setFlow('factionChapterFiveSeal')
            }
            onStartFactionChapterFiveBoss={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_worldroot_guardian'
                  : 'orc_last_clanbreaker'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionMandate={() => setFlow('factionMandate')}
            onStartFactionChapterSixBattle={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_stars_over_crownspire'
                  : 'orc_truth_at_crownspire'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterSixConcord={() =>
              setFlow('factionChapterSixConcord')
            }
            onStartFactionChapterSixElite={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_ashen_starwatch'
                  : 'orc_ashen_warfires'
              );
              setFlow('battlePrep');
            }}
            onOpenFactionChapterSixSeal={() =>
              setFlow('factionChapterSixSeal')
            }
            onStartFactionChapterSixBoss={() => {
              setActiveEncounterId(
                activeFaction === 'elf'
                  ? 'elf_return_through_roots'
                  : 'orc_crownspire_warmaster'
              );
              setFlow('battlePrep');
            }}
            onOpenMetaCampaign={() => setFlow('metaCampaign')}
            onOpenWarTable={() => setFlow('warTable')}
            onOpenExpedition={() => setFlow('expedition')}
            onOpenSiege={() => setFlow('siege')}
            onOpenRelicHunt={() => setFlow('relicHunt')}
            onOpenFormationTrial={() => setFlow('formationTrial')}
          />
        );
      case 'formation':
        return (
          <FormationScreen
            guide={formationGuide}
            tutorialFocus={tutorialFocus}
            onTutorialFocusComplete={completeTutorialFocus}
            onClearGuide={() => setFormationGuide(null)}
            onReturnToMode={
              formationReturnFlow
                ? () => {
                    const target = formationReturnFlow;
                    setFormationReturnFlow(null);
                    setActive('campaign');
                    setFlow(target);
                  }
                : undefined
            }
            returnToModeLabel={
              formationReturnFlow === 'formationTrial'
                ? 'Back to Kingdom Trials'
                : formationReturnFlow === 'kingdomDefense'
                  ? 'Back to Kingdom Defense'
                  : formationReturnFlow === 'expedition'
                    ? 'Back to Expedition'
                    : formationReturnFlow === 'siege'
                      ? 'Back to Offensive Siege'
                      : formationReturnFlow === 'relicHunt'
                        ? 'Back to Relic Hunt'
                        : undefined
            }
            onReturnToBattlePrep={
              formationGuide
                ? () => {
                    setFormationGuide(null);
                    setFlow('battlePrep');
                  }
                : undefined
            }
          />
        );
      case 'wagon':
        return (
          <WagonScreen
            onReturnToMode={
              wagonReturnFlow
                ? () => {
                    const target = wagonReturnFlow;
                    setWagonReturnFlow(null);
                    setActive('campaign');
                    setFlow(target);
                  }
                : undefined
            }
            returnToModeLabel={
              wagonReturnFlow === 'kingdomDefense'
                ? 'Back to Kingdom Defense'
                : wagonReturnFlow === 'expedition'
                  ? 'Back to Expedition'
                  : wagonReturnFlow === 'siege'
                    ? 'Back to Offensive Siege'
                    : undefined
            }
          />
        );
      case 'army':
        return (
          <ArmyScreen
            tutorialFocus={tutorialFocus}
            onTutorialFocusComplete={completeTutorialFocus}
            onOpenRecruitment={openRecruitment}
            onOpenForge={() => setFlow('forge')}
            onOpenPromotion={() => setFlow('promotion')}
            onOpenCommander={() => {
              setCommanderChoiceReturn('army');
              setFlow('commanderChoice');
            }}
            onOpenFantasyResearch={() => setFlow('fantasyResearch')}
            onOpenFlyingResearch={() => setFlow('flyingResearch')}
            onOpenLargeResearch={() => setFlow('largeResearch')}
            onOpenHybridResearch={() => setFlow('hybridResearch')}
            onOpenEquipment={(unitId) => {
              setEquipmentUnitId(unitId);
              setFlow('equipment');
            }}
          />
        );
      case 'kingdom':
      default:
        if (activeFaction !== 'human') {
          if (settlementUpgraded) {
            return (
              <FactionKingdomScreen
                tutorialFocus={tutorialFocus}
                onTutorialFocusComplete={completeTutorialFocus}
                onOpenSettlement={() => setFlow('settlement')}
                onOpenRecruitment={() => setFlow('factionRecruitment')}
                onOpenCommander={() => {
                  setCommanderChoiceReturn('army');
                  setFlow('commanderChoice');
                }}
                onOpenFactionMandate={() => setFlow('factionMandate')}
              />
            );
          }

          return (
            <FactionCampScreen
              onOpenCommander={() => {
                setCommanderChoiceReturn('army');
                setFlow('commanderChoice');
              }}
            />
          );
        }

        return (
          <KingdomScreen
            tutorialFocus={tutorialFocus}
            onTutorialFocusComplete={completeTutorialFocus}
            onOpenRecruitment={openRecruitment}
            onOpenSettlement={() => setFlow('settlement')}
            onOpenRoyalDecrees={() => setFlow('royalDecrees')}
            onOpenForge={() => {
              if (firstPromotionComplete) {
                setEquipmentUnitId('hum_recruit');
                setFlow('equipment');
              } else {
                setFlow('forge');
              }
            }}
          />
        );
    }
  };

  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;
  const battleFlowStage =
    flow === 'battlePrep'
      ? 'prep'
      : flow === 'battle'
        ? 'battle'
        : flow === 'results' ||
            flow === 'defeatResults'
          ? 'results'
          : null;

  const canGoBack =
    flow === 'battlePrep' ||
    flow === 'defeatResults' ||
    flow === 'recruitment' ||
    flow === 'markedRaiders' ||
    flow === 'forge' ||
    flow === 'fantasyResearch' ||
    flow === 'flyingResearch' ||
    flow === 'largeResearch' ||
    flow === 'hybridResearch' ||
    flow === 'promotion' ||
    flow === 'equipment' ||
    flow === 'commanderChoice' ||
    flow === 'refugeeCamp' ||
    flow === 'fortMuster' ||
    flow === 'timberClaim' ||
    flow === 'kingdomDefense' ||
    flow === 'brokenSignalTower' ||
    flow === 'marcherEnvoy' ||
    flow === 'threeWarnings' ||
    flow === 'dividedMarch' ||
    flow === 'strongholdMuster' ||
    flow === 'emptyThrone' ||
    flow === 'lastLoyalists' ||
    flow === 'royalDecrees' ||
    flow === 'brokenArchives' ||
    flow === 'royalLedger' ||
    flow === 'grandCouncil' ||
    flow === 'concordVault' ||
    flow === 'forcedBeacon' ||
    flow === 'factionInvestigation' ||
    flow === 'factionSupply' ||
    flow === 'factionRecruitment' ||
    flow === 'factionChapterTwoResource' ||
    flow === 'factionChapterTwoCouncil' ||
    flow === 'factionFourthRecruitment' ||
    flow === 'factionChapterThreeResource' ||
    flow === 'factionChapterThreeCouncil' ||
    flow === 'factionFifthRecruitment' ||
    flow === 'factionChapterFourResource' ||
    flow === 'factionChapterFourCouncil' ||
    flow === 'factionChapterFiveMuster' ||
    flow === 'factionChapterFiveResource' ||
    flow === 'factionChapterFiveSeal' ||
    flow === 'factionMandate' ||
    flow === 'factionChapterSixConcord' ||
    flow === 'factionChapterSixSeal' ||
    flow === 'metaCampaign' ||
    flow === 'settlement' ||
    flow === 'warTable' ||
    flow === 'expedition' ||
    flow === 'siege' ||
    flow === 'relicHunt' ||
    flow === 'formationTrial' ||
    flow === 'settings' ||
    flow === 'preparationFix';
  const title = flow ? flowTitles[flow] : screenTitles[active];

  const goBack = () => {
    if (!canGoBack) return;

    cancelTutorialFocus();

    if (
      flow === 'preparationFix' ||
      flow === 'defeatResults'
    ) {
      setFlow('battlePrep');
      return;
    }

    setFlow(null);
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const action = resolveHardwareBackAction({
          flow,
          canGoBack,
          active
        });

        if (action === 'block_battle') {
          return true;
        }

        if (action === 'continue_results') {
          cancelTutorialFocus();
          handleResultsContinue();
          return true;
        }

        if (action === 'prepare_rematch') {
          setTutorialFocus(null);
          setFlow('battlePrep');
          return true;
        }

        if (action === 'close_flow') {
          cancelTutorialFocus();
          setFlow(
            flow === 'preparationFix'
              ? 'battlePrep'
              : null
          );
          return true;
        }

        if (action === 'go_kingdom') {
          cancelTutorialFocus();
          setActive('kingdom');
          return true;
        }

        void flushSnapshot().finally(() => {
          BackHandler.exitApp();
        });
        return true;
      }
    );

    return () => subscription.remove();
  }, [
    active,
    canGoBack,
    commanderPathId,
    flow,
    flushSnapshot,
    lastBattleResult?.id
  ]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.appBg }]}>
      <ScreenAtmosphere
        faction={activeFaction}
        section={flow ? 'flow' : active}
      />
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.appBg}
      />

      {flow !== 'battle' ? (
      <View
        style={[
          styles.topBar,
          {
            borderBottomColor: factionAccent + '55',
            backgroundColor: theme.colors.appBg + (theme.dark ? 'F0' : 'F7')
          }
        ]}
      >
        <View style={styles.titleArea}>
          {canGoBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={goBack}
              style={[styles.backButton, { backgroundColor: theme.colors.surface1 }]}
            >
              <Text style={[styles.backText, { color: theme.colors.text }]}>‹</Text>
            </Pressable>
          ) : (
            <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.headerCrest}>
              <FactionCrest faction={activeFaction} size={34} />
            </View>
          )}
          <View style={styles.titleCopy}>
            <Text style={[styles.brand, { color: theme.colors.gold }]}>CART & CROWN</Text>
            <Text style={[styles.screenTitle, { color: theme.colors.text }]} numberOfLines={1}>{title}</Text>
          </View>
        </View>

        <View style={styles.topActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Return to save slots"
              onPress={() => {
                void exitToSaveSlots();
              }}
              style={[
                styles.slotButton,
                {
                  backgroundColor: theme.colors.surface1,
                  borderColor: theme.colors.border
                }
              ]}
            >
              <Text style={[styles.slotButtonText, { color: theme.colors.text }]}>
                S{saveSlotId}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              onPress={() => {
                setFormationGuide(null);
                cancelTutorialFocus();
                setFlow('settings');
              }}
              style={({ pressed }) => [
                styles.settingsButton,
                {
                  backgroundColor: theme.colors.surface1,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.78 : 1
                }
              ]}
            >
              <Text
                style={[
                  styles.settingsButtonText,
                  { color: theme.colors.gold }
                ]}
              >
                ⚙
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change theme"
              onPress={cycleTheme}
              style={({ pressed }) => [
                styles.themeButton,
                {
                  backgroundColor: theme.colors.surface1,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.78 : 1
                }
              ]}
            >
              <ThemeModeIcon dark={theme.dark} color={theme.colors.gold} size={20} />
            </Pressable>
        </View>
      </View>

      ) : null}

      {battleFlowStage && flow !== 'battle' ? (
        <FlowProgress stage={battleFlowStage} faction={activeFaction} />
      ) : null}

      <View style={styles.screen}>{renderScreen()}</View>

      {tutorialMoment ? (
        <TutorialCoach
          faction={activeFaction}
          moment={tutorialMoment}
          onPrimary={handleTutorialPrimary}
        />
      ) : null}

      {!flow ? (
        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: theme.colors.surface1,
              borderTopColor: theme.colors.border
            }
          ]}
        >
          {navItems.map(item => {
            const selected = item.id === active;

            const tutorialNavFocused =
              tutorialFocus?.kind === 'nav' &&
              tutorialFocus.nav === item.id;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected }}
                onPress={() => {
                  if (item.id !== 'formation') {
                    setFormationGuide(null);
                    setFormationReturnFlow(null);
                  }
                  if (item.id !== 'wagon') {
                    setWagonReturnFlow(null);
                  }
                  if (tutorialNavFocused) {
                    completeTutorialFocus();
                  } else if (tutorialFocus) {
                    cancelTutorialFocus();
                  }
                  setActive(item.id);
                }}
                style={({ pressed }) => [
                  styles.navItem,
                  { opacity: pressed ? 0.78 : 1, transform: [{ translateY: pressed ? 1 : 0 }] }
                ]}
              >
                <TutorialFocus
                  active={tutorialNavFocused}
                  label={
                    tutorialNavFocused
                      ? tutorialFocus.label
                      : undefined
                  }
                >
                  <View style={styles.navFocusContent}>
                    <View
                      style={[
                        styles.navIconWrap,
                        {
                          backgroundColor: selected ? factionAccent + '24' : 'transparent',
                          borderColor: selected ? factionAccent + '80' : 'transparent'
                        }
                      ]}
                    >
                      <AppNavIcon
                        kind={item.id}
                        color={selected ? factionAccent : theme.colors.textMuted}
                        size={26}
                      />
                    </View>
                    <Text
                      style={[
                        styles.navLabel,
                        { color: selected ? factionAccent : theme.colors.textMuted }
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    <View
                      pointerEvents="none"
                      style={[
                        styles.navSelectionMark,
                        { backgroundColor: selected ? factionAccent : 'transparent' }
                      ]}
                    />
                  </View>
                </TutorialFocus>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  topBar: {
    height: 66,
    zIndex: 2,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleArea: { flexDirection: 'row', alignItems: 'center', gap: 9, minWidth: 0, flex: 1 },
  titleCopy: { flex: 1, minWidth: 0 },
  headerCrest: { width: 34, alignItems: 'center', justifyContent: 'center' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backText: { fontSize: 28, lineHeight: 30, marginTop: -3 },
  brand: { fontSize: 8, letterSpacing: 1.55, fontWeight: '900' },
  screenTitle: { fontSize: 19, lineHeight: 23, fontWeight: '900', marginTop: 1 },
  slotButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  slotButtonText: { fontSize: 11, fontWeight: '900' },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingsButtonText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '900'
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  screen: { flex: 1, zIndex: 1 },
  bottomNav: {
    height: 72,
    zIndex: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 3
  },
  navItem: { flex: 1, minHeight: 60, alignItems: 'center', justifyContent: 'center' },
  navFocusContent: { alignItems: 'center', justifyContent: 'center', minWidth: 50 },
  navIconWrap: { width: 42, height: 34, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 10, fontWeight: '900', marginTop: 3 },
  navSelectionMark: { width: 14, height: 3, borderRadius: 2, marginTop: 4 }
});
