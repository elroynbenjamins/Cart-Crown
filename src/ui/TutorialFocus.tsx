import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { useGameTheme } from '../theme/ThemeProvider';

export function TutorialFocus({
  active,
  label,
  style,
  children
}: PropsWithChildren<{
  active: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
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

  if (!active) {
    return <View style={style}>{children}</View>;
  }

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025]
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.42, 0.95]
  });

  return (
    <View style={[styles.wrap, style]}>
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
    left: -4,
    right: -4,
    top: -4,
    bottom: -4,
    borderWidth: 2,
    borderRadius: 14,
    zIndex: 20
  },
  label: {
    position: 'absolute',
    right: 5,
    top: -12,
    zIndex: 21,
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 6,
    paddingVertical: 3
  },
  labelText: {
    color: '#111318',
    fontSize: 7.5,
    lineHeight: 9,
    fontWeight: '900',
    letterSpacing: 0.55
  }
});
