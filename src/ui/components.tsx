import React from 'react';
import type { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useGameTheme } from '../theme/ThemeProvider';
import { UnitSprite } from './gameArt';

export function GameCard({
  children,
  accent,
  style
}: PropsWithChildren<{ accent?: string; style?: StyleProp<ViewStyle> }>) {
  const { theme } = useGameTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface1,
          borderColor: accent ?? theme.colors.border
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({
  title,
  trailing
}: {
  title: string;
  trailing?: string;
}) {
  const { theme } = useGameTheme();

  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {trailing ? (
        <Text style={[styles.sectionTrailing, { color: theme.colors.textMuted }]}>{trailing}</Text>
      ) : null}
    </View>
  );
}

export function Pill({
  label,
  color
}: {
  label: string;
  color?: string;
}) {
  const { theme } = useGameTheme();
  const fill = color ?? theme.colors.surface2;

  return (
    <View style={[styles.pill, { backgroundColor: fill }]}>
      <Text style={[styles.pillText, { color: theme.colors.text }]}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const { theme } = useGameTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: disabled ? theme.colors.surface3 : theme.colors.primary,
          opacity: pressed ? 0.85 : 1
        }
      ]}
    >
      <Text
        style={[
          styles.primaryButtonText,
          { color: disabled ? theme.colors.textMuted : '#FFFFFF' }
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const { theme } = useGameTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        {
          backgroundColor: theme.colors.surface2,
          borderColor: theme.colors.border,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1
        }
      ]}
    >
      <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ResourceChip({
  icon,
  value,
  label
}: {
  icon: string;
  value: number;
  label?: string;
}) {
  const { theme } = useGameTheme();

  return (
    <View style={[styles.resourceChip, { backgroundColor: theme.colors.surface2 }]}>
      <Text style={styles.resourceIcon}>{icon}</Text>
      <View>
        <Text style={[styles.resourceValue, { color: theme.colors.text }]}>{value}</Text>
        {label ? (
          <Text style={[styles.resourceLabel, { color: theme.colors.textMuted }]}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function UnitPortrait({
  name,
  className,
  accent,
  compact
}: {
  name: string;
  className: string;
  accent: string;
  compact?: boolean;
}) {
  const { theme } = useGameTheme();
  return (
    <View style={styles.portraitRow}>
      <View
        style={[
          compact ? styles.portraitCompact : styles.portrait,
          { borderColor: accent, backgroundColor: theme.colors.surface2 }
        ]}
      >
        <UnitSprite className={className} size={compact ? 42 : 54} />
      </View>
      <View style={styles.portraitCopy}>
        <Text style={[styles.unitName, { color: theme.colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.unitClass, { color: theme.colors.textMuted }]} numberOfLines={1}>
          {className}
        </Text>
      </View>
    </View>
  );
}

export function ProgressBar({
  value,
  color
}: {
  value: number;
  color?: string;
}) {
  const { theme } = useGameTheme();
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View style={[styles.progressTrack, { backgroundColor: theme.colors.surface3 }]}>
      <View
        style={[
          styles.progressFill,
          {
            width: (String(clamped * 100) + '%') as ViewStyle['width'],
            backgroundColor: color ?? theme.colors.primary
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16
  },
  sectionTitleRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800'
  },
  sectionTrailing: {
    fontSize: 12,
    fontWeight: '700'
  },
  pill: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800'
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '900'
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '900'
  },
  resourceChip: {
    minWidth: 96,
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 11,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  resourceIcon: {
    fontSize: 20
  },
  resourceValue: {
    fontSize: 14,
    fontWeight: '900'
  },
  resourceLabel: {
    fontSize: 10,
    marginTop: 1
  },
  portraitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
    flex: 1
  },
  portrait: {
    width: 58,
    height: 68,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  portraitCompact: {
    width: 46,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  portraitCopy: {
    flex: 1,
    minWidth: 0
  },
  unitName: {
    fontSize: 16,
    fontWeight: '900'
  },
  unitClass: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600'
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 999
  }
});
