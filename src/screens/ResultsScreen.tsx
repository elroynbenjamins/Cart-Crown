import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SecondaryButton, SectionTitle, StatusPill } from '../ui/components';
import { ResourceSprite, StoryScene } from '../ui/gameArt';

export function ResultsScreen({ onContinue }: { onContinue: () => void }) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    lastBattleResult,
    claimRewardedAd,
    rewardedAdClaims,
    rewardedAdMessage
  } = useGame();

  if (!lastBattleResult) {
    return (
      <View style={styles.fallback}>
        <Text style={[styles.fallbackText, { color: theme.colors.text }]}>No battle result available.</Text>
        <PrimaryButton label="Return" onPress={onContinue} />
      </View>
    );
  }

  const rewards = Object.entries(lastBattleResult.rewards).filter(([, value]) => Boolean(value));
  const salvageClaimed = (rewardedAdClaims.salvage_boost ?? 0) >= 1;
  const mercenaryResult = lastBattleResult.id === 'mercenary_patrol_result';
  const tollCaptainResult = lastBattleResult.id === 'toll_captain_result';
  const ironRoadResult = lastBattleResult.id === 'iron_road_skirmish_result';
  const ironProvostResult = lastBattleResult.id === 'iron_provost_result';
  const borderFortResult = lastBattleResult.id === 'border_fort_result';
  const siegeRoadResult = lastBattleResult.id === 'siege_road_result';
  const lordMarshalResult =
    lastBattleResult.id === 'lord_marshal_veyr_result';
  const brokenStandardsResult =
    lastBattleResult.id === 'broken_standards_result';
  const crownroadAmbushResult =
    lastBattleResult.id === 'crownroad_ambush_result';
  const pretenderGeneralResult =
    lastBattleResult.id === 'pretender_general_result';
  const oldRoyalLandsResult =
    lastBattleResult.id === 'old_royal_lands_result';
  const ashenEnvoyResult =
    lastBattleResult.id === 'ashen_envoy_result';
  const crownspireGateResult =
    lastBattleResult.id === 'gate_of_crownspire_result';
  const sunderedFieldsResult =
    lastBattleResult.id === 'sundered_fields_result';
  const ashenCourtResult =
    lastBattleResult.id === 'ashen_court_result';
  const returnToCrownspireResult =
    lastBattleResult.id === 'return_to_crownspire_result';
  const elfOpeningResult =
    lastBattleResult.id === 'elf_wardbreakers_result';
  const orcOpeningResult =
    lastBattleResult.id === 'orc_red_road_result';
  const elfEliteResult =
    lastBattleResult.id === 'elf_ashen_tracks_result';
  const elfBossResult =
    lastBattleResult.id === 'elf_hollow_warden_result';
  const orcEliteResult =
    lastBattleResult.id === 'orc_invader_scouts_result';
  const orcBossResult =
    lastBattleResult.id === 'orc_blamecaller_result';
  const elfChapterTwoBattleResult =
    lastBattleResult.id === 'elf_last_heartgrove_result';
  const elfChapterTwoEliteResult =
    lastBattleResult.id === 'elf_ward_hunters_result';
  const elfChapterTwoBossResult =
    lastBattleResult.id === 'elf_ashroot_stalker_result';
  const orcChapterTwoBattleResult =
    lastBattleResult.id === 'orc_gather_clans_result';
  const orcChapterTwoEliteResult =
    lastBattleResult.id === 'orc_stonejaw_challengers_result';
  const orcChapterTwoBossResult =
    lastBattleResult.id === 'orc_clanbreaker_result';
  const elfChapterThreeBattleResult =
    lastBattleResult.id === 'elf_moonlit_pass_result';
  const elfChapterThreeEliteResult =
    lastBattleResult.id === 'elf_ashen_groves_result';
  const elfChapterThreeBossResult =
    lastBattleResult.id === 'elf_pale_ranger_result';
  const orcChapterThreeBattleResult =
    lastBattleResult.id === 'orc_stonejaw_trial_result';
  const orcChapterThreeEliteResult =
    lastBattleResult.id === 'orc_broken_steppe_result';
  const orcChapterThreeBossResult =
    lastBattleResult.id === 'orc_stonejaw_champion_result';
  const elfChapterFourBattleResult =
    lastBattleResult.id === 'elf_roots_in_ash_result';
  const elfChapterFourEliteResult =
    lastBattleResult.id === 'elf_two_fronts_result';
  const elfChapterFourBossResult =
    lastBattleResult.id === 'elf_ashen_druid_result';
  const orcChapterFourBattleResult =
    lastBattleResult.id === 'orc_two_front_war_result';
  const orcChapterFourEliteResult =
    lastBattleResult.id === 'orc_broken_steppe_war_result';
  const orcChapterFourBossResult =
    lastBattleResult.id === 'orc_split_chieftain_result';
  const elfChapterFiveBattleResult =
    lastBattleResult.id === 'elf_wounded_worldroot_result';
  const elfChapterFiveEliteResult =
    lastBattleResult.id === 'elf_ashen_rootkeepers_result';
  const elfChapterFiveBossResult =
    lastBattleResult.id === 'elf_worldroot_guardian_result';
  const orcChapterFiveBattleResult =
    lastBattleResult.id === 'orc_no_clan_left_behind_result';
  const orcChapterFiveEliteResult =
    lastBattleResult.id === 'orc_ashen_clanbreakers_result';
  const orcChapterFiveBossResult =
    lastBattleResult.id === 'orc_last_clanbreaker_result';
  const elfChapterSixOpeningResult =
    lastBattleResult.id === 'elf_stars_over_crownspire_result';
  const orcChapterSixOpeningResult =
    lastBattleResult.id === 'orc_truth_at_crownspire_result';
  const elfChapterSixEliteResult =
    lastBattleResult.id === 'elf_ashen_starwatch_result';
  const elfChapterSixBossResult =
    lastBattleResult.id === 'elf_return_through_roots_result';
  const orcChapterSixEliteResult =
    lastBattleResult.id === 'orc_ashen_warfires_result';
  const orcChapterSixBossResult =
    lastBattleResult.id === 'orc_crownspire_warmaster_result';
  const metaConvergenceResult =
    lastBattleResult.id === 'three_seals_convergence_result';
  const metaTriumvirateResult =
    lastBattleResult.id === 'ashen_triumvirate_result';
  const metaFinalResult =
    lastBattleResult.id === 'unbound_beacon_result';
  const resultScene =
    returnToCrownspireResult ||
    crownspireGateResult ||
    ashenCourtResult ||
    ashenEnvoyResult ||
    elfChapterSixBossResult ||
    orcChapterSixBossResult ||
    metaConvergenceResult ||
    metaTriumvirateResult ||
    metaFinalResult
      ? 'crownspire'
      : 'victory';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.resultHeader}>
        <StatusPill label="VICTORY" tone="done" />
        <Text style={[styles.title, { color: theme.colors.text }]}>{lastBattleResult.title}</Text>
        <Text style={[styles.summary, { color: theme.colors.textMuted }]}>
          {lastBattleResult.summary}
        </Text>
        <View style={styles.resultScene}>
          <StoryScene scene={resultScene} faction={activeFaction} size={248} />
        </View>
      </View>

      <SectionTitle title="Rewards" />
      <GameCard faction={activeFaction} state="ready">
        <View style={styles.rewards}>
          {rewards.map(([key, value]) => (
            <View key={key} style={[styles.reward, { backgroundColor: theme.colors.surface2 }]}>
              <ResourceSprite
                resource={key as 'gold' | 'wood' | 'stone' | 'iron' | 'provisions'}
                size={30}
              />
              <Text style={[styles.rewardValue, { color: theme.colors.text }]}>+{value}</Text>
              <Text style={[styles.rewardLabel, { color: theme.colors.textMuted }]}>{key}</Text>
            </View>
          ))}
        </View>
      </GameCard>

      <GameCard faction={activeFaction} state={salvageClaimed ? 'ready' : 'default'}>
        <Text style={[styles.salvageTitle, { color: theme.colors.text }]}>Battlefield Salvage</Text>
        <Text style={[styles.salvageBody, { color: theme.colors.textMuted }]}>
          Optional rewarded ad. Skipping it does not reduce the normal battle reward.
        </Text>
        <Text style={[styles.salvageReward, { color: theme.colors.gold }]}>+3 Wood · +1 Iron</Text>
        <View style={styles.salvageButton}>
          <SecondaryButton
            label={salvageClaimed ? 'Salvage claimed' : 'Watch optional ad'}
            disabled={salvageClaimed}
            onPress={() => void claimRewardedAd('salvage_boost')}
          />
        </View>
        {rewardedAdMessage ? (
          <Text style={[styles.adMessage, { color: theme.colors.textMuted }]}>{rewardedAdMessage}</Text>
        ) : null}
      </GameCard>

      <SectionTitle title="What changed" />
      {metaFinalResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>THREE SEALS COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The Concord is restored</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Oath, Root and Clan Seals stabilize the Beacon together. No single faction controls Crownspire, and the Ashen Court can no longer force the old system through one authority.
            </Text>
          </GameCard>
        </>
      ) : metaTriumvirateResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>ALLIANCE HOLDS</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The Ashen Triumvirate breaks</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              All three armies keep their approaches open. The final Ashen Regent is now forcing the Beacon without the safeguards.
            </Text>
          </GameCard>
        </>
      ) : metaConvergenceResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>THREE ROADS, ONE CHAMBER</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The alliance reaches the Concord Chamber</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Human, Elf and Orc forces now hold simultaneous routes into Crownspire. The three Seals can be restored to the chamber.
            </Text>
          </GameCard>
        </>
      ) : elfChapterSixBossResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ELF CAMPAIGN COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>Root Seal recovered</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Heartgrove has recovered its part of the original Concord safeguard. The completed Elven kingdom remains available, and the Root Seal now counts toward Three Seals.
            </Text>
          </GameCard>
        </>
      ) : elfChapterSixEliteResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ROOT SEAL CHAMBER OPEN</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The Ashen Starwatch falls</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Root Seal is finally visible, but the Rootbound Regent seizes it and retreats through the collapsing rootways.
            </Text>
          </GameCard>
        </>
      ) : orcChapterSixBossResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>ORC CAMPAIGN COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>Clan Seal recovered</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Confederacy has recovered its part of the original Concord safeguard. The completed Orc kingdom remains available, and the Clan Seal now counts toward Three Seals.
            </Text>
          </GameCard>
        </>
      ) : orcChapterSixEliteResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>CLAN SEAL CHAMBER OPEN</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The Ashen Warfires break</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Clan Seal is reached, but the final Ashen Warmaster seizes it and tries to fracture the Confederacy during the retreat.
            </Text>
          </GameCard>
        </>
      ) : elfChapterSixOpeningResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>CROWNSPIRE ROOTWAY</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The Starwatch is broken</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The chosen Worldroot Attunement carried the army through the first Crownspire defense. The next lead is the old Concord Rootway.
            </Text>
          </GameCard>
        </>
      ) : orcChapterSixOpeningResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>CROWNSPIRE WARPATH</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The Warfire Guard breaks</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The active Clan Pact held through the first Crownspire battle. The united clans can now trace the original Concord Warpath.
            </Text>
          </GameCard>
        </>
      ) : elfChapterFiveBossResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ELF CHAPTER 5 COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>Starroot Conclave project unlocked</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Worldroot Guardian is released. The Root Seal was not recovered here; it has been traced to Crownspire.
            </Text>
          </GameCard>
        </>
      ) : elfChapterFiveEliteResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ROOT SEAL CONFIRMED</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The Seal survived the Crownfall</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The remaining root-signature points toward Crownspire.
            </Text>
          </GameCard>
        </>
      ) : elfChapterFiveBattleResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>WORLDROOT RECORDS</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The scars follow Concord geometry</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Securing the scar line opens Rootscar Records and the Worldroot Nursery.
            </Text>
          </GameCard>
        </>
      ) : orcChapterFiveBossResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>ORC CHAPTER 5 COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>Warfire Confederacy project unlocked</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Last Clanbreaker falls. The Clan Seal survived and was taken toward Crownspire.
            </Text>
          </GameCard>
        </>
      ) : orcChapterFiveEliteResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>CLAN SEAL CONFIRMED</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The old oath-stones agree</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Every surviving oath points toward Crownspire.
            </Text>
          </GameCard>
        </>
      ) : orcChapterFiveBattleResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>UNITED CLAN DEPOT</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>The isolated clans return</Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The missing Warfires form a deliberate pattern and the united depot can now support the six-squad campaign.
            </Text>
          </GameCard>
        </>
      ) : elfChapterFourBossResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ELF CHAPTER 4 COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Worldroot Sanctuary project unlocked
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Ashen Druid is defeated. Mature the Enclave to Lv.4 military/logistics infrastructure and Lv.2 Stag/Beacon support, then establish the six-squad Worldroot Sanctuary.
            </Text>
          </GameCard>
        </>
      ) : elfChapterFourEliteResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>TWO FRONTS HELD</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Ashen Druid identified
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Captured orders show one Druid is coordinating both attacks. The Living Root Council can now authorize the final hunt.
            </Text>
          </GameCard>
        </>
      ) : elfChapterFourBattleResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ASH-GROVE RECOVERY</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Burned wards can be reclaimed
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The first ash-root line is secured. Reclaiming the burned ward will add permanent wood/provision production and open the route to the two-front battle.
            </Text>
          </GameCard>
        </>
      ) : orcChapterFourBossResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>ORC CHAPTER 4 COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              High Warhold project unlocked
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Split-Chieftain yields. Mature the Great Warhold to Lv.4 military/logistics infrastructure and Lv.2 Warg/Watchfire support, then raise the six-squad High Warhold.
            </Text>
          </GameCard>
        </>
      ) : orcChapterFourEliteResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>FALSE ORDERS EXPOSED</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              The two-front war was engineered
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Ashen couriers fed different orders to both fronts. The Two-Front Council can now bind the clans before confronting the Split-Chieftain.
            </Text>
          </GameCard>
        </>
      ) : orcChapterFourBattleResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>STEPPE WAR CAMP</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Both roads held
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Emberclan can establish a permanent Steppe War Camp, adding Gold and Provisions to regional production.
            </Text>
          </GameCard>
        </>
      ) : elfChapterThreeBossResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ELF CHAPTER 3 COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Heartgrove can become an Enclave
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Pale Ranger is defeated. Upgrade Warden Lodge, Moon Forge and Caravan Grove to Lv.3, maintain Stag and Ward infrastructure, then establish the Enclave.
            </Text>
          </GameCard>
        </>
      ) : elfChapterThreeEliteResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ASHEN GROVES</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              The Pale Ranger is identified
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Captured route orders point to a former border ranger coordinating the sabotage beyond Moonlit Pass.
            </Text>
          </GameCard>
        </>
      ) : elfChapterThreeBattleResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>MOONLIT PASS</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Silent beacon route opened
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The pass is secure enough to relight Moonlit Watch and add it to regional production.
            </Text>
          </GameCard>
        </>
      ) : orcChapterThreeBossResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>ORC CHAPTER 3 COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Emberclan can raise the Great Warhold
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Stonejaw Champion yields. Upgrade the Clan Yard, Bone Forge and War Cartwright to Lv.3, maintain Warg and Watchfire infrastructure, then build the Great Warhold.
            </Text>
          </GameCard>
        </>
      ) : orcChapterThreeEliteResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>BROKEN STEPPE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Another false clan war exposed
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Steppe raiders used forged standards to make Stonejaw and Emberclan blame one another.
            </Text>
          </GameCard>
        </>
      ) : orcChapterThreeBattleResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>STONEJAW TRIAL</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Quarry roads opened
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Passing the trial opens Stonejaw Quarry and its permanent stone/iron production.
            </Text>
          </GameCard>
        </>
      ) : elfChapterTwoBossResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ELF CHAPTER 2 COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Heartgrove can become a Wardhold
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Ashroot Stalker is defeated. Upgrade the Warden Lodge, Moon Forge and Caravan Grove, then fund the Wardhold project to open Moonlit Pass.
            </Text>
          </GameCard>
        </>
      ) : elfChapterTwoEliteResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>WARD NETWORK</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Ward Beacon blueprint unlocked
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Ward Hunters carried route maps that can be reused to rebuild Heartgrove’s far-sight network.
            </Text>
          </GameCard>
        </>
      ) : elfChapterTwoBattleResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>HEARTGROVE HOLDS</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Moonwell route opened
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The inner grove is secure enough to restore the Moonwell Grove and begin permanent regional production.
            </Text>
          </GameCard>
        </>
      ) : orcChapterTwoBossResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>ORC CHAPTER 2 COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Emberclan can become a Warhold
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Clanbreaker is defeated. Upgrade the Clan Yard, Bone Forge and War Cartwright, then raise the Warhold before entering the Stonejaw Trial.
            </Text>
          </GameCard>
        </>
      ) : orcChapterTwoEliteResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>CLAN SIGNALS</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Watchfire blueprint unlocked
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Stonejaw challenge exposes the need for faster clan signals before a larger warband can move safely.
            </Text>
          </GameCard>
        </>
      ) : orcChapterTwoBattleResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>CLANS GATHERED</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Red Plains hunt opened
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The envoys arrive safely. Emberclan can now secure Warg Pens and permanent hunt routes.
            </Text>
          </GameCard>
        </>
      ) : elfBossResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ELF CHAPTER 1 COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Commander specialization unlocked
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Hollow Warden is freed from the corruption. Heartgrove now recognizes your command, unlocking Windcaller, Thorn Warden and Moon Seer paths.
            </Text>
          </GameCard>
        </>
      ) : elfEliteResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>WARDEN TRAIL</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Ashen Tracks cleared
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The attackers used the same tools that damaged the wardstones. Establish the Wayfarer Camp before confronting the Hollow Warden.
            </Text>
          </GameCard>
        </>
      ) : orcBossResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>ORC CHAPTER 1 COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Commander specialization unlocked
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Blamecaller is defeated. Emberclan now recognizes your command, unlocking Bloodchief, Warglord and Warcaller paths.
            </Text>
          </GameCard>
        </>
      ) : orcEliteResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>CLAN EVIDENCE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Invader scouts broken
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Their maps mark multiple clans for retaliation. Gather supplies at the clanfire before hunting the Blamecaller.
            </Text>
          </GameCard>
        </>
      ) : elfOpeningResult ? (
        <>
          <GameCard accent={theme.colors.elf}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.elf }]}>ELF CAMPAIGN</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Outer ward secured
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Wardbreakers carried ash residue that does not belong to the Heartgrove. The next lead is Whispering Roots.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Wards change the formation game</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              Elven squads begin strongest when they preserve open space instead of copying the tight Human line.
            </Text>
          </GameCard>
        </>
      ) : orcOpeningResult ? (
        <>
          <GameCard accent={theme.colors.orc}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.orc }]}>ORC CAMPAIGN</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Red Road held
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The attackers used stolen clan marks over foreign-made equipment. The next lead is Broken Clan Marks.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Momentum starts with aggression</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              Orc squads benefit from aggressive adjacency and successful attacks rather than Elven spacing or Human discipline.
            </Text>
          </GameCard>
        </>
      ) : returnToCrownspireResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>HUMAN CAMPAIGN COMPLETE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Human Oath Seal recovered
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Greenkeep has completed the Human campaign. The Elf and Orc campaigns are now unlocked in this save, while the completed Human kingdom remains available to revisit.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>One seal of three</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              The Human Oath Seal is only one part of the original Concord safeguard. The Root Seal and Clan Seal must still be recovered through the Elf and Orc campaigns before the final Three Seals campaign can begin.
            </Text>
          </GameCard>
        </>
      ) : ashenCourtResult ? (
        <>
          <GameCard accent={theme.colors.danger}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.danger }]}>CROWNFALL CONFIRMED</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              The Court forced the Beacon
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Records in the Ashen district confirm the Crownfall began when the Court bypassed the three-part Concord safeguards.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Next: The Forced Beacon</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              Greenkeep now knows the truth. The final objective is to recover the Human Oath Seal before the Court can repeat the activation.
            </Text>
          </GameCard>
        </>
      ) : sunderedFieldsResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>CROWNSPIRE ACCESS</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Concord maintenance route found
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Securing the Sundered Fields exposes a sealed route into the old shared infrastructure beneath Crownspire.
            </Text>
          </GameCard>
        </>
      ) : crownspireGateResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>FINAL HUMAN TIER UNLOCKED</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Prepare the Grand Campaign
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Crownspire’s western gate is open. Max the Capital command and supply network, maintain an active Royal Decree, then fund the 7×9 Grand Campaign expansion.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Crownspire is no longer neutral</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              Ashen Court troops are operating inside the fortress approaches. Greenkeep must now enter Crownspire itself and reach the old Concord Beacon.
            </Text>
          </GameCard>
        </>
      ) : ashenEnvoyResult ? (
        <>
          <GameCard accent={theme.colors.danger}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.danger }]}>ASHEN COURT</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              The hidden network steps into the open
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The Envoy’s retinue carried a private Royal Ledger linking the false flags, marcher orders and Crownroad command structure.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Next: The Royal Ledger</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              The ledger is the first document that names the Ashen Court directly and traces its payments to Crownspire.
            </Text>
          </GameCard>
        </>
      ) : oldRoyalLandsResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>ROYAL ARCHIVES</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Administrative records recovered
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The captured estate ledgers point toward intentionally altered records in the old royal archives. The next trail leads to the Broken Archives.
            </Text>
          </GameCard>
        </>
      ) : pretenderGeneralResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>KINGDOM TIER UNLOCKED</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Greenkeep can become a Capital
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The old royal command is broken. Mature the Stronghold infrastructure, then fund the Capital project to unlock provincial Royal Decrees.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>No crown, but an authority</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              Greenkeep is now the strongest organized government in the western realm. The next question is not who holds the old throne, but how the realm should be governed while Crownspire remains unresolved.
            </Text>
          </GameCard>
        </>
      ) : crownroadAmbushResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>VETERAN PRISONERS</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              The old court still has soldiers
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Captured officers insist they still serve lawful royal command, but none can name a living ruler who issued their orders.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Next: The Last Loyalists</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              Greenkeep now has enough prisoners and records to identify the remaining officer network behind the Crownroad attacks.
            </Text>
          </GameCard>
        </>
      ) : brokenStandardsResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>BROKEN ROYAL AUTHORITY</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              The standards are genuine—but contradictory
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Each defeated company carried a legitimate royal standard from a different year. The army is fighting fragments of the same old state.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Next: The Empty Throne</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              The captured route records point toward an abandoned royal audience hall farther along the Crownroad.
            </Text>
          </GameCard>
        </>
      ) : lordMarshalResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>KINGDOM TIER UNLOCKED</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Greenkeep can become a Stronghold
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Veyr’s defeat gives Greenkeep authority across the western marches. Raise Barracks, Forge and Wagonwright to Lv.4, War Room and Quartermaster to Lv.3, Stable and Signal Tower to Lv.2, then fund the Stronghold project.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>The Broken Crown</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              Veyr’s records point beyond the marcher lords toward officers still issuing orders in the name of a crown that no longer has a ruler.
            </Text>
          </GameCard>
        </>
      ) : siegeRoadResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>MARCHER EVIDENCE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              The false orders match
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Captured dispatches prove the same hand altered the warnings sent to all three marcher houses.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Next: The Divided March</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              Greenkeep can finally place the documents side by side and force the marcher captains to confront the manipulation.
            </Text>
          </GameCard>
        </>
      ) : borderFortResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>BORDER INTELLIGENCE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Three contradictory warnings
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The captured fort contains orders from three marcher authorities, each naming a different enemy and each claiming the others are compromised.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Next: Three Warnings</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              Greenkeep must decide which reports are genuine before committing deeper into the Border Marches.
            </Text>
          </GameCard>
        </>
      ) : ironProvostResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>KINGDOM TIER UNLOCKED</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Greenkeep can become a Town
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Upgrade Barracks, Forge and Wagonwright to Lv.3, keep a Stable and construct the Signal Tower, then fund the final Town expansion.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>The Iron Road Is Open</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              With the Provost removed, Greenkeep controls the western supply route. The divided Border Marches are now within reach.
            </Text>
          </GameCard>
        </>
      ) : ironRoadResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>REGIONAL PRODUCTION</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Iron Hills Mine secured
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Every completed campaign battle, Expedition or Kingdom Defense now adds +2 Iron to Greenkeep's unclaimed regional production.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>The Iron Road Opens</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              The mine road is usable again. Scouts report an abandoned timber camp farther along the route.
            </Text>
          </GameCard>
        </>
      ) : tollCaptainResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>KINGDOM TIER UNLOCKED</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Greenkeep can become a Fort
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The road fort provides the stone and authority needed for expansion. Upgrade Barracks, Forge and Wagonwright to Lv.2, then invest the final Fort construction cost in the Kingdom.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Western Road Secured</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              Greenkeep now controls the western approach. Chapter 2 can push toward the Iron Road once the new Fort is ready.
            </Text>
          </GameCard>
        </>
      ) : mercenaryResult ? (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>COMMANDER MILESTONE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Choose your command specialization
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              The army now recognizes you as its formal commander. Choose whether your leadership specializes in the line, ranged formations or mounted warfare.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Crownspire Coin</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              The Green Banner Company was paid in genuine Crownspire coin. The attacks are no longer just random frontier violence.
            </Text>
          </GameCard>
        </>
      ) : (
        <>
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>KINGDOM MILESTONE</Text>
            <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
              Greenkeep can now be established
            </Text>
            <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
              Return to the Kingdom and upgrade the camp. This expands the Supply Wagon from 4×4 to 4×5 and raises active squad capacity to 3 while keeping all 9 formation positions available.
            </Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Marked Raiders</Text>
            <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
              The weapons left on the road carry crude Orc clan marks, but the buckles beneath them were forged in Human workshops. Something about the attack does not fit.
            </Text>
          </GameCard>
        </>
      )}

      <PrimaryButton
        label={mercenaryResult ? 'Choose Commander Path' : 'Return to Kingdom'}
        onPress={onContinue}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 14 },
  resultHeader: { alignItems: 'center', paddingVertical: 18 },
  victory: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  title: { fontSize: 30, fontWeight: '900', marginTop: 6 },
  summary: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8, maxWidth: 330 },
  rewards: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reward: { minWidth: '47%', flexGrow: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
  resultScene: { alignItems: 'center', marginTop: 12 },
  rewardValue: { fontSize: 18, fontWeight: '900', marginTop: 5 },
  rewardLabel: { fontSize: 10, textTransform: 'capitalize', marginTop: 2 },
  salvageTitle: { fontSize: 15, fontWeight: '900' },
  salvageBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  salvageReward: { fontSize: 11, fontWeight: '900', marginTop: 7 },
  salvageButton: { marginTop: 11 },
  adMessage: { fontSize: 10, textAlign: 'center', marginTop: 7 },
  unlockEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  unlockTitle: { fontSize: 18, fontWeight: '900', marginTop: 5 },
  unlockBody: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  storyTitle: { fontSize: 16, fontWeight: '900' },
  storyBody: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  fallback: { flex: 1, padding: 20, justifyContent: 'center', gap: 16 },
  fallbackText: { textAlign: 'center' }
});
