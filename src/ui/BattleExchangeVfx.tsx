import React, { memo, useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import type { UnitRole } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { getExchangeVisuals } from './battleExchangePresentation';

function useReducedBattleMotion() {
  // Do not start decorative motion before the accessibility preference resolves.
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let mounted = true;
    let receivedEvent = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      receivedEvent = true;
      if (mounted) setReduced(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted && !receivedEvent) setReduced(value);
    }).catch(() => { /* Keep the non-animated fallback when unavailable. */ });
    return () => { mounted = false; subscription.remove(); };
  }, []);
  return reduced;
}

function Stroke({ x, y, length, angle, color }: {
  x: number; y: number; length: number; angle: number; color: string;
}) {
  return <View style={{ position: 'absolute', left: x, top: y, width: length,
    height: 2, backgroundColor: color, transform: [{ rotate: `${angle}deg` }] }} />;
}

/** Uses the existing exchange pulse. Never creates its own timer or animation. */
export const BattleVfxStrip = memo(function BattleVfxStrip({ role, healed, progress }: {
  role: UnitRole | null; healed: number; progress: Animated.Value;
}) {
  const { theme } = useGameTheme();
  const reducedMotion = useReducedBattleMotion();
  const visual = getExchangeVisuals(role, healed);
  const color = visual.attack === 'arrow' ? theme.colors.info
    : visual.attack === 'charge' ? theme.colors.gold
    : visual.attack === 'ward' ? theme.colors.primary : theme.colors.text;

  return (
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants" style={styles.vfxStrip}>
      {!reducedMotion && (visual.attack || visual.heal) ? (
        <Animated.View style={[styles.vfxCanvas, {
          // At rest progress is zero: no frozen projectile after the exchange.
          opacity: progress.interpolate({ inputRange: [0, .3, 1], outputRange: [0, .8, 1], extrapolate: 'clamp' }),
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-2, 2] }) }]
        }]}>
          {visual.attack === 'arrow' ? (
            <>
              <Stroke x={34} y={15} length={22} angle={90} color={color} />
              <Stroke x={38} y={23} length={8} angle={55} color={color} />
              <Stroke x={43} y={23} length={8} angle={125} color={color} />
            </>
          ) : visual.attack === 'charge' ? (
            <>
              <Stroke x={31} y={13} length={24} angle={72} color={color} />
              {[26, 36, 49].map((left, index) => (
                <View key={left} style={[styles.dust, { left, top: 22 + index % 2,
                  backgroundColor: color + '88', width: 7 + index, height: 4 + index }]} />
              ))}
            </>
          ) : visual.attack === 'skirmish' ? (
            <>
              <Stroke x={29} y={15} length={18} angle={63} color={color} />
              <Stroke x={43} y={15} length={18} angle={117} color={color} />
            </>
          ) : visual.attack === 'ward' ? (
            <View style={[styles.ward, { borderColor: color }]} />
          ) : visual.attack === 'slash' ? (
            <>
              <Stroke x={30} y={15} length={27} angle={42} color={color} />
              <Stroke x={30} y={15} length={27} angle={-42} color={color} />
            </>
          ) : null}
          {/* Independent channel: healing must never turn a melee hit into a ward. */}
          {visual.heal ? (
            <View style={[styles.heal, { borderColor: theme.colors.primary }]}>
              <View style={[styles.healHorizontal, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.healVertical, { backgroundColor: theme.colors.primary }]} />
            </View>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  vfxStrip: { alignSelf: 'center', width: 86, height: 34, marginVertical: -3, overflow: 'hidden' },
  vfxCanvas: { width: 86, height: 34, position: 'relative' },
  dust: { position: 'absolute', borderRadius: 3 },
  ward: { position: 'absolute', left: 34, top: 6, width: 20, height: 20,
    borderWidth: 2, transform: [{ rotate: '45deg' }] },
  heal: { position: 'absolute', left: 66, top: 8, width: 16, height: 16,
    borderRadius: 8, borderWidth: 1 },
  healHorizontal: { position: 'absolute', left: 3, top: 6, width: 8, height: 2 },
  healVertical: { position: 'absolute', left: 6, top: 3, width: 2, height: 8 }
});
