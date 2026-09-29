import React, { type PropsWithChildren } from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { useGameTheme } from '../theme/ThemeProvider';

/** Native Android edge-to-edge insets; keep the existing iOS/web frame unchanged. */
export function AndroidWindowFrame({ children }: PropsWithChildren) {
  const { theme } = useGameTheme();
  if (Platform.OS !== 'android') return <>{children}</>;
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}
      style={[styles.fill, { backgroundColor: theme.colors.appBg }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.fill}>
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
