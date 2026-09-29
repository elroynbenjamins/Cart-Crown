import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { PropsWithChildren } from 'react';
import { useGameTheme } from '../theme/ThemeProvider';

export function TutorialFocus({
  active,
  label,
  children
}: PropsWithChildren<{
  active: boolean;
  label?: string;
}>) {
  const { theme } = useGameTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 680,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 680,
          useNativeDriver: true
        })
      ])
    );

    loop.start();
    return () => {
      loop.stop();
      pulse.setValue(0);
    };
  }, [active, pulse]);

  if (!active) return <>{children}</>;

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025]
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.42, 0.95]
  });

  return (
    <View style={styles.wrap}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.focusRing,
          {
            borderColor: theme.colors.gold,
            opacity,
            transform: [{ scale }]
          }
        ]}
      />
      {label ? (
        <View
          pointerEvents="none"
          style={[
            styles.label,
            {
              backgroundColor: theme.colors.gold,
              borderColor: theme.colors.appBg
            }
          ]}
        >
          <Text style={styles.labelText}>
            {label}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    minWidth: 0
  },
  focusRing: {
    position: 'absolute',
    left: -5,
    right: -5,
    top: -5,
    bottom: -5,
    borderWidth: 3,
    borderRadius: 18,
    zIndex: 20
  },
  label: {
    position: 'absolute',
    right: 6,
    top: -14,
    zIndex: 21,
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  labelText: {
    color: '#111318',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '900',
    letterSpacing: 0.55
  }
});
