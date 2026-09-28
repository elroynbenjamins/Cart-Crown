import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { NavId } from './game/types';
import type { EncounterId } from './game/encounters';
import type { SaveSlotId } from './save/types';
import { useGame } from './game/GameProvider';
import { ArmyScreen } from './screens/ArmyScreen';
import { BattlePrepScreen } from './screens/BattlePrepScreen';
import { BattleScreen } from './screens/BattleScreen';
import { BrokenSignalTowerScreen } from './screens/BrokenSignalTowerScreen';
import { BrokenArchivesScreen } from './screens/BrokenArchivesScreen';
import { CampaignScreen } from './screens/CampaignScreen';
import { CommanderChoiceScreen } from './screens/CommanderChoiceScreen';
import { EquipmentManageScreen } from './screens/EquipmentManageScreen';
import { ExpeditionScreen } from './screens/ExpeditionScreen';
import { ForgeScreen } from './screens/ForgeScreen';
import { FormationScreen } from './screens/FormationScreen';
import { FortMusterScreen } from './screens/FortMusterScreen';
import { FormationTrialScreen } from './screens/FormationTrialScreen';
import { KingdomScreen } from './screens/KingdomScreen';
import { MarkedRaidersScreen } from './screens/MarkedRaidersScreen';
import { LastLoyalistsScreen } from './screens/LastLoyalistsScreen';
import { MarcherEnvoyScreen } from './screens/MarcherEnvoyScreen';
import { PromotionScreen } from './screens/PromotionScreen';
import { RecruitmentScreen } from './screens/RecruitmentScreen';
import { RefugeeCampScreen } from './screens/RefugeeCampScreen';
import { KingdomDefenseScreen } from './screens/KingdomDefenseScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { RoyalLedgerScreen } from './screens/RoyalLedgerScreen';
import { RoyalDecreesScreen } from './screens/RoyalDecreesScreen';
import { StrongholdMusterScreen } from './screens/StrongholdMusterScreen';
import { EmptyThroneScreen } from './screens/EmptyThroneScreen';
import { ThreeWarningsScreen } from './screens/ThreeWarningsScreen';
import { DividedMarchScreen } from './screens/DividedMarchScreen';
import { SettlementScreen } from './screens/SettlementScreen';
import { TimberClaimScreen } from './screens/TimberClaimScreen';
import { WagonScreen } from './screens/WagonScreen';
import { useGameTheme } from './theme/ThemeProvider';

type FlowScreen =
  | 'battlePrep'
  | 'battle'
  | 'results'
  | 'recruitment'
  | 'markedRaiders'
  | 'forge'
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
  | 'settlement'
  | 'expedition'
  | 'formationTrial';

const navItems: Array<{ id: NavId; label: string; icon: string }> = [
  { id: 'kingdom', label: 'Kingdom', icon: '♜' },
  { id: 'campaign', label: 'Campaign', icon: '◇' },
  { id: 'formation', label: 'Formation', icon: '▦' },
  { id: 'wagon', label: 'Wagon', icon: '▤' },
  { id: 'army', label: 'Army', icon: '♞' }
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
  recruitment: 'Recruitment',
  markedRaiders: 'Marked Raiders',
  forge: 'Field Forge',
  promotion: 'Promotion',
  equipment: 'Equipment',
  commanderChoice: 'Commander Path',
  refugeeCamp: 'Refugee Camp',
  fortMuster: 'Fort Muster',
  timberClaim: 'Timber Claim',
  kingdomDefense: 'Kingdom Defense',
  brokenSignalTower: 'Broken Signal Tower',
  marcherEnvoy: 'Marcher Envoy',
  threeWarnings: 'Three Warnings',
  dividedMarch: 'The Divided March',
  strongholdMuster: 'Stronghold Muster',
  emptyThrone: 'The Empty Throne',
  lastLoyalists: 'The Last Loyalists',
  royalDecrees: 'Royal Decrees',
  brokenArchives: 'Broken Archives',
  royalLedger: 'The Royal Ledger',
  settlement: 'Settlement',
  expedition: 'Expedition',
  formationTrial: 'Formation Trial'
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
  const [activeEncounterId, setActiveEncounterId] = useState<EncounterId>('hold_the_road');
  const [equipmentUnitId, setEquipmentUnitId] = useState('hum_recruit');
  const { theme, cycleTheme } = useGameTheme();
  const {
    finishEncounter,
    lastBattleResult,
    commanderPathId,
    firstPromotionComplete
  } = useGame();

  const openRecruitment = () => setFlow('recruitment');

  const renderScreen = () => {
    if (flow === 'battlePrep') {
      return (
        <BattlePrepScreen
          encounterId={activeEncounterId}
          onBegin={() => setFlow('battle')}
        />
      );
    }

    if (flow === 'battle') {
      return (
        <BattleScreen
          encounterId={activeEncounterId}
          onFinished={() => {
            finishEncounter(activeEncounterId);
            setFlow('results');
          }}
        />
      );
    }

    if (flow === 'results') {
      return (
        <ResultsScreen
          onContinue={() => {
            if (lastBattleResult?.id === 'mercenary_patrol_result' && !commanderPathId) {
              setFlow('commanderChoice');
              return;
            }
            setFlow(null);
            setActive('kingdom');
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
            setFlow(null);
            setActive('army');
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
            setFlow(null);
            setActive('formation');
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

    if (flow === 'settlement') {
      return (
        <SettlementScreen
          onExit={() => {
            setFlow(null);
            setActive('kingdom');
          }}
        />
      );
    }

    if (flow === 'expedition') {
      return (
        <ExpeditionScreen
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
            onOpenTimberClaim={() => setFlow('timberClaim')}
            onOpenKingdomDefense={() => setFlow('kingdomDefense')}
            onOpenBrokenSignalTower={() => setFlow('brokenSignalTower')}
            onStartIronProvost={() => {
              setActiveEncounterId('iron_provost');
              setFlow('battlePrep');
            }}
            onOpenMarcherEnvoy={() => setFlow('marcherEnvoy')}
            onStartBorderFort={() => {
              setActiveEncounterId('border_fort');
              setFlow('battlePrep');
            }}
            onOpenThreeWarnings={() => setFlow('threeWarnings')}
            onStartSiegeRoad={() => {
              setActiveEncounterId('siege_road');
              setFlow('battlePrep');
            }}
            onOpenDividedMarch={() => setFlow('dividedMarch')}
            onStartLordMarshal={() => {
              setActiveEncounterId('lord_marshal_veyr');
              setFlow('battlePrep');
            }}
            onOpenStrongholdMuster={() => setFlow('strongholdMuster')}
            onStartBrokenStandards={() => {
              setActiveEncounterId('broken_standards');
              setFlow('battlePrep');
            }}
            onOpenEmptyThrone={() => setFlow('emptyThrone')}
            onStartCrownroadAmbush={() => {
              setActiveEncounterId('crownroad_ambush');
              setFlow('battlePrep');
            }}
            onOpenLastLoyalists={() => setFlow('lastLoyalists')}
            onStartPretenderGeneral={() => {
              setActiveEncounterId('pretender_general');
              setFlow('battlePrep');
            }}
            onOpenRoyalDecrees={() => setFlow('royalDecrees')}
            onStartOldRoyalLands={() => {
              setActiveEncounterId('old_royal_lands');
              setFlow('battlePrep');
            }}
            onOpenBrokenArchives={() => setFlow('brokenArchives')}
            onStartAshenEnvoy={() => {
              setActiveEncounterId('ashen_envoy');
              setFlow('battlePrep');
            }}
            onOpenRoyalLedger={() => setFlow('royalLedger')}
            onStartGateOfCrownspire={() => {
              setActiveEncounterId('gate_of_crownspire');
              setFlow('battlePrep');
            }}
            onOpenExpedition={() => setFlow('expedition')}
            onOpenFormationTrial={() => setFlow('formationTrial')}
          />
        );
      case 'formation':
        return <FormationScreen />;
      case 'wagon':
        return <WagonScreen />;
      case 'army':
        return (
          <ArmyScreen
            onOpenRecruitment={openRecruitment}
            onOpenForge={() => setFlow('forge')}
            onOpenPromotion={() => setFlow('promotion')}
            onOpenCommander={() => setFlow('commanderChoice')}
            onOpenEquipment={(unitId) => {
              setEquipmentUnitId(unitId);
              setFlow('equipment');
            }}
          />
        );
      case 'kingdom':
      default:
        return (
          <KingdomScreen
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

  const canGoBack =
    flow === 'battlePrep' ||
    flow === 'recruitment' ||
    flow === 'markedRaiders' ||
    flow === 'forge' ||
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
    flow === 'settlement' ||
    flow === 'expedition' ||
    flow === 'formationTrial';
  const title = flow ? flowTitles[flow] : screenTitles[active];

  const goBack = () => {
    if (canGoBack) {
      setFlow(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.appBg }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.appBg}
      />

      <View style={[styles.topBar, { borderBottomColor: theme.colors.border }]}>
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
          ) : null}
          <View>
            <Text style={[styles.brand, { color: theme.colors.gold }]}>CART & CROWN</Text>
            <Text style={[styles.screenTitle, { color: theme.colors.text }]}>{title}</Text>
          </View>
        </View>

        {flow !== 'battle' ? (
          <View style={styles.topActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Return to save slots"
              onPress={onExitToSaves}
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
              <Text style={styles.themeIcon}>{theme.dark ? '◐' : '☼'}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.screen}>{renderScreen()}</View>

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

            return (
              <Pressable
                key={item.id}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setActive(item.id)}
                style={styles.navItem}
              >
                <View
                  style={[
                    styles.navIconWrap,
                    selected ? { backgroundColor: theme.colors.primary + '2F' } : undefined
                  ]}
                >
                  <Text
                    style={[
                      styles.navIcon,
                      { color: selected ? theme.colors.primary : theme.colors.textMuted }
                    ]}
                  >
                    {item.icon}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.navLabel,
                    { color: selected ? theme.colors.primary : theme.colors.textMuted }
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    height: 66,
    paddingHorizontal: 17,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backText: { fontSize: 30, lineHeight: 32, marginTop: -3 },
  brand: { fontSize: 9, letterSpacing: 1.8, fontWeight: '900' },
  screenTitle: { fontSize: 21, lineHeight: 26, fontWeight: '900', marginTop: 1 },
  slotButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  slotButtonText: { fontSize: 11, fontWeight: '900' },
  themeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  themeIcon: { fontSize: 18, color: '#D9A84E' },
  screen: { flex: 1 },
  bottomNav: {
    height: 76,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 4
  },
  navItem: { flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center' },
  navIconWrap: { width: 36, height: 31, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 20, fontWeight: '900' },
  navLabel: { fontSize: 9, fontWeight: '800', marginTop: 2 }
});
