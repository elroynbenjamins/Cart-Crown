import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';
import type { FactionId, ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, SectionTitle } from './components';
import { FactionCrest, ResourceSprite, StoryScene } from './gameArt';
import { TreasurySprite } from './TreasuryArt';

/** A single decorative entrance. Resource amounts are always fully visible. */
function useRewardEntrance() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    let entered = false;
    let receivedMotionEvent = false;
    let animation: ReturnType<typeof Animated.timing> | null = null;

    const settle = () => {
      entered = true;
      animation?.stop();
      progress.setValue(1);
    };
    const enter = (reducedMotion: boolean) => {
      if (!mounted) return;
      if (reducedMotion || AppState.currentState !== 'active') {
        settle();
        return;
      }
      if (entered) return;
      entered = true;
      animation = Animated.timing(progress, {
        toValue: 1,
        duration: 600,
        easing: Easing.linear,
        isInteraction: false,
        useNativeDriver: true
      });
      animation.start();
    };

    // At both endpoints the icons are at rest. Wait for the OS preference before moving.
    progress.setValue(0);
    const motionSubscription = AccessibilityInfo.addEventListener('reduceMotionChanged', reduced => {
      receivedMotionEvent = true;
      enter(reduced);
    });
    const appSubscription = AppState.addEventListener('change', state => {
      if (state !== 'active') settle();
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!receivedMotionEvent) enter(reduced);
    }).catch(() => {
      if (mounted && !receivedMotionEvent) settle();
    });

    return () => {
      mounted = false;
      motionSubscription.remove();
      appSubscription.remove();
      settle();
    };
  }, [progress]);

  return progress;
}

export function VictoryHeader({
  title,
  summary,
  faction,
  scene
}: {
  title: string;
  summary: string;
  faction: FactionId;
  scene: 'victory' | 'crownspire';
}) {
  const { theme } = useGameTheme();
  const showVictoryCache = scene === 'victory';

  return (
    <GameCard faction={faction} accent={theme.colors.gold}>
      <View style={styles.headerRow}>
        <View style={styles.victoryMark}>
          <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <FactionCrest faction={faction} size={42} />
          </View>
          <View style={styles.victoryCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.textMuted }]}>AFTER ACTION</Text>
            <Text accessibilityRole="header" style={[styles.victory, { color: theme.colors.gold }]}>VICTORY</Text>
          </View>
        </View>
        <View
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.scene,
            { borderColor: theme.colors.border },
            showVictoryCache && [
              styles.cacheScene,
              { backgroundColor: theme.colors.surface2, borderColor: theme.colors.gold + '55' }
            ]
          ]}
        >
          {showVictoryCache ? (
            <TreasurySprite kind="victory_cache" size={64}>
              <StoryScene scene="victory" faction={faction} size={64} />
            </TreasurySprite>
          ) : (
            <StoryScene scene={scene} faction={faction} size={102} />
          )}
        </View>
      </View>
      <Text style={[styles.title, showVictoryCache && styles.cacheTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.summary, { color: theme.colors.textMuted }]}>{summary}</Text>
    </GameCard>
  );
}

export function VictoryRewards({ rewards }: { rewards: Partial<ResourceWallet> }) {
  const { theme } = useGameTheme();
  const { fontScale } = useWindowDimensions();
  const progress = useRewardEntrance();
  const entries = (Object.entries(rewards) as Array<[keyof ResourceWallet, number]>)
    .filter(([, value]) => Boolean(value));
  const pairedRewards = entries.length === 4;
  const colors: Record<keyof ResourceWallet, string> = {
    gold: theme.colors.gold,
    wood: theme.dark ? '#D6A875' : '#925D2B',
    stone: theme.colors.textMuted,
    iron: theme.colors.info,
    provisions: theme.colors.primary
  };
  const labels: Record<keyof ResourceWallet, string> = {
    gold: 'Gold',
    wood: 'Wood',
    stone: 'Stone',
    iron: 'Iron',
    provisions: 'Provisions'
  };

  return (
    <View style={styles.rewardsSection}>
      <SectionTitle
        title="Rewards secured"
        trailing={entries.length > 0 ? 'Added to treasury' : 'No resources'}
      />
      <GameCard accent={theme.colors.gold} ornament={false}>
        {entries.length > 0 ? (
          <View style={styles.rewards}>
            {entries.map(([resource, value], index) => {
              const color = colors[resource];
              const start = index * 0.1;
              return (
                <View
                  key={resource}
                  accessible
                  accessibilityLabel={'+' + value + ' ' + labels[resource]}
                  style={[
                    styles.reward,
                    pairedRewards && styles.pairedReward,
                    {
                      minWidth: Math.min(150, 84 * fontScale),
                      backgroundColor: theme.colors.surface2,
                      borderColor: color + (theme.dark ? '70' : '55')
                    }
                  ]}
                >
                  <View pointerEvents="none" style={[styles.rewardEdge, { backgroundColor: color }]} />
                  <Animated.View
                    accessible={false}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={[
                      styles.rewardIcon,
                      pairedRewards && styles.pairedRewardIcon,
                      {
                        backgroundColor: color + (theme.dark ? '18' : '12'),
                        transform: [
                          {
                            scale: progress.interpolate({
                              inputRange: [start, start + 0.15, start + 0.35],
                              outputRange: [1, 1.075, 1],
                              extrapolate: 'clamp'
                            })
                          },
                          {
                            translateY: progress.interpolate({
                              inputRange: [start, start + 0.15, start + 0.35],
                              outputRange: [0, -3, 0],
                              extrapolate: 'clamp'
                            })
                          }
                        ]
                      }
                    ]}
                  >
                    <ResourceSprite resource={resource} size={38} />
                  </Animated.View>
                  <Text style={[styles.rewardValue, pairedRewards && styles.pairedRewardValue, { color }]}>+{value}</Text>
                  <Text style={[styles.rewardLabel, { color: theme.colors.text }]}>{labels[resource]}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.emptyRewards, { color: theme.colors.textMuted }]}>
            No resource rewards from this battle.
          </Text>
        )}
      </GameCard>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  victoryMark: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  victoryCopy: { flexShrink: 1 },
  eyebrow: { fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  victory: { fontSize: 21, lineHeight: 25, fontWeight: '900', letterSpacing: .8, marginTop: 1 },
  scene: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  cacheScene: { width: 78, height: 58, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16.5, fontWeight: '900', marginTop: 8 },
  cacheTitle: { marginTop: 6 },
  summary: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  rewardsSection: { gap: 6 },
  rewards: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  reward: { flexBasis: '30%', flexGrow: 1, borderWidth: 1, borderRadius: 10, padding: 8, paddingTop: 9, alignItems: 'center', overflow: 'hidden' },
  pairedReward: { flexBasis: '46%', padding: 7, paddingTop: 7 },
  rewardEdge: { position: 'absolute', top: 0, left: 15, right: 15, height: 2, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  rewardIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pairedRewardIcon: { width: 36, height: 36, borderRadius: 9 },
  rewardValue: { fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'], marginTop: 5, alignSelf: 'stretch', textAlign: 'center' },
  pairedRewardValue: { marginTop: 3 },
  rewardLabel: { fontSize: 9.5, fontWeight: '800', alignSelf: 'stretch', textAlign: 'center', marginTop: 2 },
  emptyRewards: { fontSize: 10.5, lineHeight: 15 }
});
