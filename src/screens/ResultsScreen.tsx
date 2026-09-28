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
      {tollCaptainResult ? (
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
