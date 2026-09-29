import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, StyleSheet, View } from 'react-native';
import {
  BOSS_COMPACT_RAIL_WIDTH,
  BOSS_RAIL_WIDTH,
  canAnimateBossIntro,
  type BossPresentation
} from './bossPresentation';

function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    let receivedEvent = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      receivedEvent = true;
      if (mounted) setReduced(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted && !receivedEvent) setReduced(value);
    }).catch(() => {
      if (mounted && !receivedEvent) setReduced(true);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}

function useBossEntrance(duration: number) {
  const progress = useRef(new Animated.Value(0)).current;
  const entered = useRef(false);
  const animation = useRef<ReturnType<typeof Animated.timing> | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        entered.current = true;
        animation.current?.stop();
        progress.setValue(1);
      }
    });
    return () => {
      subscription.remove();
      animation.current?.stop();
    };
  }, [progress]);

  useEffect(() => {
    if (reducedMotion === null) return;
    if (!canAnimateBossIntro(reducedMotion, AppState.currentState)) {
      entered.current = true;
      animation.current?.stop();
      progress.setValue(1);
      return;
    }
    if (entered.current) return;
    entered.current = true;
    animation.current = Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      isInteraction: false,
      useNativeDriver: true
    });
    animation.current.start();
    return () => {
      animation.current?.stop();
      // An interrupted intro must never leave an invisible or half-settled layer.
      progress.setValue(1);
    };
  }, [duration, progress, reducedMotion]);
  return progress;
}

/** Decorations stay outside the card's 14dp content inset. No hit targets or game state. */
export function BossBattlefieldDetails({
  presentation,
  compact,
  dark
}: {
  presentation: BossPresentation;
  compact: boolean;
  dark: boolean;
}) {
  const progress = useBossEntrance(presentation.introMs);
  const railWidth = compact ? BOSS_COMPACT_RAIL_WIDTH : BOSS_RAIL_WIDTH;
  const scale = railWidth / BOSS_RAIL_WIDTH;
  const drift = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [presentation.drift, 0],
    extrapolate: 'clamp'
  });
  const glow = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [dark ? 0.12 : 0.08, dark ? 0.58 : 0.38],
    extrapolate: 'clamp'
  });

  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={'boss-atmosphere-' + presentation.signature}
      style={styles.layer}
    >
      <View style={[styles.wash, { backgroundColor: presentation.material, opacity: dark ? 0.055 : 0.025 }]} />
      <View style={[styles.rim, { borderColor: presentation.material, opacity: dark ? 0.55 : 0.34 }]} />
      {(['left', 'right'] as const).map(side => (
        <View
          key={side}
          style={[
            styles.rail,
            { width: railWidth },
            side === 'left' ? styles.left : styles.right
          ]}
        >
          {presentation.marks.map((mark, index) => (
            <Animated.View
              key={index}
              style={[
                styles.mark,
                {
                  left: mark.x * scale,
                  top: `${mark.y}%` as `${number}%`,
                  width: mark.width * scale,
                  height: mark.height * scale,
                  backgroundColor: mark.shape === 'ring'
                    ? 'transparent'
                    : mark.glow ? presentation.light : presentation.material,
                  borderWidth: mark.shape === 'ring' ? 1 : 0,
                  borderColor: presentation.light,
                  borderRadius: mark.shape === 'ring' ? mark.width * scale / 2 : 0,
                  opacity: mark.glow ? glow : dark ? 0.46 : 0.3,
                  transform: [
                    { translateY: mark.glow ? drift : 0 },
                    { rotate: mark.shape === 'diamond' ? '45deg' : '0deg' }
                  ]
                }
              ]}
            />
          ))}
        </View>
      ))}
      {(['left', 'right'] as const).map(side => (
        <View
          key={'corner-' + side}
          style={[
            styles.corner,
            {
              borderColor: presentation.light,
              opacity: dark ? 0.52 : 0.32,
              borderRadius: presentation.signature === 'hollow_roots' ? 8 : 1
            },
            side === 'left' ? styles.cornerLeft : styles.cornerRight
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 14, overflow: 'hidden' },
  wash: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  rim: { position: 'absolute', left: 3, right: 3, top: 3, bottom: 3, borderWidth: 1, borderRadius: 12 },
  rail: { position: 'absolute', top: 34, bottom: 9, overflow: 'hidden' },
  left: { left: 1 },
  right: { right: 1, transform: [{ scaleX: -1 }] },
  mark: { position: 'absolute' },
  corner: { position: 'absolute', width: 22, height: 8, top: 5, borderTopWidth: 2 },
  cornerLeft: { left: 5, borderLeftWidth: 2 },
  cornerRight: { right: 5, borderRightWidth: 2 }
});
