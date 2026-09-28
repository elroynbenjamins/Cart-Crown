import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SecondaryButton, SectionTitle } from '../ui/components';

const rewardIcons: Record<string, string> = {
  gold: '🪙',
  wood: '🪵',
  stone: '🪨',
  iron: '⛓',
  provisions: '🍞'
};

export function ResultsScreen({ onContinue }: { onContinue: () => void }) {
  const { theme } = useGameTheme();
  const {
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

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.resultHeader}>
        <Text style={[styles.victory, { color: theme.colors.primary }]}>VICTORY</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{lastBattleResult.title}</Text>
        <Text style={[styles.summary, { color: theme.colors.textMuted }]}>
          {lastBattleResult.summary}
        </Text>
      </View>

      <SectionTitle title="Rewards" />
      <GameCard>
        <View style={styles.rewards}>
          {rewards.map(([key, value]) => (
            <View key={key} style={[styles.reward, { backgroundColor: theme.colors.surface2 }]}>
              <Text style={styles.rewardIcon}>{rewardIcons[key] ?? '◆'}</Text>
              <Text style={[styles.rewardValue, { color: theme.colors.text }]}>+{value}</Text>
              <Text style={[styles.rewardLabel, { color: theme.colors.textMuted }]}>{key}</Text>
            </View>
          ))}
        </View>
      </GameCard>

      <GameCard>
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
      {oldRoyalLandsResult ? (
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
  rewardIcon: { fontSize: 22 },
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
