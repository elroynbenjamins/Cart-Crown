import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';

const rewardIcons: Record<string, string> = {
  gold: '🪙',
  wood: '🪵',
  stone: '🪨',
  iron: '⛓',
  provisions: '🍞'
};

export function ResultsScreen({ onContinue }: { onContinue: () => void }) {
  const { theme } = useGameTheme();
  const { lastBattleResult } = useGame();

  if (!lastBattleResult) {
    return (
      <View style={styles.fallback}>
        <Text style={[styles.fallbackText, { color: theme.colors.text }]}>No battle result available.</Text>
        <PrimaryButton label="Return" onPress={onContinue} />
      </View>
    );
  }

  const rewards = Object.entries(lastBattleResult.rewards).filter(([, value]) => Boolean(value));

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
            <View
              key={key}
              style={[styles.reward, { backgroundColor: theme.colors.surface2 }]}
            >
              <Text style={styles.rewardIcon}>{rewardIcons[key] ?? '◆'}</Text>
              <Text style={[styles.rewardValue, { color: theme.colors.text }]}>+{value}</Text>
              <Text style={[styles.rewardLabel, { color: theme.colors.textMuted }]}>
                {key}
              </Text>
            </View>
          ))}
        </View>
      </GameCard>

      <SectionTitle title="What changed" />
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.unlockEyebrow, { color: theme.colors.gold }]}>KINGDOM MILESTONE</Text>
        <Text style={[styles.unlockTitle, { color: theme.colors.text }]}>
          Greenkeep can now be established
        </Text>
        <Text style={[styles.unlockBody, { color: theme.colors.textMuted }]}>
          Return to the Kingdom and upgrade the camp. This expands the Supply Wagon from 4×4 to 4×5 and unlocks your third formation slot.
        </Text>
      </GameCard>

      <GameCard>
        <Text style={[styles.storyTitle, { color: theme.colors.text }]}>Marked Raiders</Text>
        <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
          The weapons left on the road carry crude Orc clan marks, but the buckles beneath them were forged in Human workshops. Something about the attack does not fit.
        </Text>
      </GameCard>

      <PrimaryButton label="Return to Kingdom" onPress={onContinue} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 30,
    gap: 14
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 18
  },
  victory: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    marginTop: 6
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 330
  },
  rewards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  reward: {
    minWidth: '47%',
    flexGrow: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center'
  },
  rewardIcon: {
    fontSize: 22
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 5
  },
  rewardLabel: {
    fontSize: 10,
    textTransform: 'capitalize',
    marginTop: 2
  },
  unlockEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1
  },
  unlockTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 5
  },
  unlockBody: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  storyBody: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5
  },
  fallback: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 16
  },
  fallbackText: {
    textAlign: 'center'
  }
});
