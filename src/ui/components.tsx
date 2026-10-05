import React from 'react';
import type { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { FactionId, ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { ResourceSprite, UnitSprite } from './gameArt';
import { shouldAcceptActionPress } from '../game/mobileSession';

export type CardState = 'default' | 'selected' | 'ready' | 'locked' | 'danger';

function factionAccentFor(faction: FactionId | undefined, theme: ReturnType<typeof useGameTheme>['theme']) {
  if (faction === 'elf') return theme.colors.elf;
  if (faction === 'orc') return theme.colors.orc;
  if (faction === 'human') return theme.colors.human;
  return null;
}

export function GameCard({
  children,
  accent,
  faction,
  state = 'default',
  ornament = Boolean(faction),
  style
}: PropsWithChildren<{
  accent?: string;
  faction?: FactionId;
  state?: CardState;
  ornament?: boolean;
  style?: StyleProp<ViewStyle>;
}>) {
  const { theme } = useGameTheme();
  const factionAccent = factionAccentFor(faction, theme);
  const stateAccent =
    state === 'ready'
      ? theme.colors.primary
      : state === 'selected'
        ? theme.colors.gold
        : state === 'danger'
          ? theme.colors.danger
          : state === 'locked'
            ? theme.colors.border
            : null;
  const edge = accent ?? stateAccent ?? factionAccent ?? theme.colors.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface1,
          borderColor: edge,
          opacity: state === 'locked' ? 0.68 : 1
        },
        style
      ]}
    >
      {ornament && factionAccent ? (
        <>
          <View pointerEvents="none" style={[styles.cardFactionRail, { backgroundColor: factionAccent }]} />
          <View pointerEvents="none" style={[styles.cardCornerTop, { borderColor: factionAccent }]} />
          <View pointerEvents="none" style={[styles.cardCornerBottom, { borderColor: factionAccent }]} />
        </>
      ) : null}
      {state === 'selected' || state === 'ready' ? (
        <View
          pointerEvents="none"
          style={[
            styles.cardStateGlow,
            {
              borderColor:
                state === 'ready' ? theme.colors.primary + '66' : theme.colors.gold + '66'
            }
          ]}
        />
      ) : null}
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

export function ScreenHero({
  eyebrow,
  title,
  body,
  accent,
  status,
  children
}: PropsWithChildren<{
  eyebrow: string;
  title: string;
  body?: string;
  accent?: string;
  status?: React.ReactNode;
}>) {
  const { theme } = useGameTheme();

  return (
    <GameCard
      accent={accent}
      ornament={false}
      style={styles.screenHero}
    >
      <View style={styles.screenHeroHeader}>
        <View style={styles.screenHeroCopy}>
          <Text
            style={[
              styles.screenHeroEyebrow,
              { color: accent ?? theme.colors.textMuted }
            ]}
          >
            {eyebrow}
          </Text>
          <Text
            style={[
              styles.screenHeroTitle,
              { color: theme.colors.text }
            ]}
          >
            {title}
          </Text>
        </View>
        {status ? (
          <View style={styles.screenHeroStatus}>
            {status}
          </View>
        ) : null}
      </View>
      {body ? (
        <Text
          style={[
            styles.screenHeroBody,
            { color: theme.colors.textMuted }
          ]}
        >
          {body}
        </Text>
      ) : null}
      {children ? (
        <View style={styles.screenHeroContent}>
          {children}
        </View>
      ) : null}
    </GameCard>
  );
}

export function MetricTile({
  label,
  value,
  caption,
  tone = 'neutral'
}: {
  label: string;
  value: string | number;
  caption?: string;
  tone?: 'positive' | 'danger' | 'gold' | 'info' | 'neutral';
}) {
  const { theme } = useGameTheme();
  const accent =
    tone === 'positive'
      ? theme.colors.primary
      : tone === 'danger'
        ? theme.colors.danger
        : tone === 'gold'
          ? theme.colors.gold
          : tone === 'info'
            ? theme.colors.info
            : theme.colors.textMuted;

  return (
    <View
      style={[
        styles.metricTile,
        {
          backgroundColor: theme.colors.surface2,
          borderColor: accent + '36'
        }
      ]}
    >
      <Text
        style={[
          styles.metricTileLabel,
          { color: theme.colors.textMuted }
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.metricTileValue,
          { color: accent }
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      {caption ? (
        <Text
          style={[
            styles.metricTileCaption,
            { color: theme.colors.textMuted }
          ]}
          numberOfLines={2}
        >
          {caption}
        </Text>
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


export type StatusTone =
  | 'ready'
  | 'locked'
  | 'selected'
  | 'current'
  | 'done'
  | 'boss'
  | 'elite'
  | 'available'
  | 'neutral';

export function StatusPill({
  label,
  tone = 'neutral'
}: {
  label: string;
  tone?: StatusTone;
}) {
  const { theme } = useGameTheme();
  const fill =
    tone === 'ready' || tone === 'done'
      ? theme.colors.primary + '2F'
      : tone === 'selected' || tone === 'current' || tone === 'boss'
        ? theme.colors.gold + '30'
        : tone === 'elite'
          ? theme.colors.danger + '28'
          : tone === 'available'
            ? theme.colors.info + '28'
            : tone === 'locked'
              ? theme.colors.surface3
              : theme.colors.surface2;
  const textColor =
    tone === 'ready' || tone === 'done'
      ? theme.colors.primary
      : tone === 'selected' || tone === 'current' || tone === 'boss'
        ? theme.colors.gold
        : tone === 'elite'
          ? theme.colors.danger
          : tone === 'available'
            ? theme.colors.info
            : tone === 'locked'
              ? theme.colors.textMuted
              : theme.colors.text;
  const symbol =
    tone === 'ready' || tone === 'done'
      ? '✓'
      : tone === 'selected' || tone === 'current'
        ? '●'
        : tone === 'boss'
          ? '♛'
          : tone === 'elite'
            ? '✦'
            : tone === 'available'
              ? '◇'
              : tone === 'locked'
                ? '○'
                : '•';

  return (
    <View style={[styles.statusPill, { backgroundColor: fill, borderColor: textColor + '55' }]}>
      <Text style={[styles.statusSymbol, { color: textColor }]}>{symbol}</Text>
      <Text style={[styles.statusText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function FlowProgress({
  stage,
  faction
}: {
  stage: 'prep' | 'battle' | 'results';
  faction: FactionId;
}) {
  const { theme } = useGameTheme();
  const accent = factionAccentFor(faction, theme) ?? theme.colors.primary;
  const stages: Array<{ id: 'prep' | 'battle' | 'results'; label: string }> = [
    { id: 'prep', label: 'PREP' },
    { id: 'battle', label: 'BATTLE' },
    { id: 'results', label: 'RESULT' }
  ];
  const currentIndex = stages.findIndex(item => item.id === stage);

  return (
    <View
      style={[
        styles.flowProgress,
        {
          backgroundColor: theme.colors.surface1,
          borderColor: theme.colors.border
        }
      ]}
    >
      {stages.map((item, index) => {
        const completed = index < currentIndex;
        const current = index === currentIndex;

        return (
          <View
            key={item.id}
            style={[
              styles.flowSegment,
              {
                backgroundColor: current
                  ? accent + '26'
                  : completed
                    ? theme.colors.surface2
                    : 'transparent',
                borderColor: current
                  ? accent + '66'
                  : 'transparent'
              }
            ]}
          >
            <Text
              style={[
                styles.flowSegmentMark,
                {
                  color: current || completed
                    ? accent
                    : theme.colors.textMuted
                }
              ]}
            >
              {completed ? '✓' : current ? '●' : '○'}
            </Text>
            <Text
              style={[
                styles.flowLabel,
                {
                  color: current
                    ? theme.colors.text
                    : theme.colors.textMuted
                }
              ]}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function ScreenAtmosphere({
  faction,
  section
}: {
  faction: FactionId;
  section: 'kingdom' | 'campaign' | 'formation' | 'wagon' | 'army' | 'flow';
}) {
  const { theme } = useGameTheme();
  // Dark UI stays black/charcoal; faction color belongs to content, not a full-screen wash.
  if (theme.dark) return null;
  const accent = factionAccentFor(faction, theme) ?? theme.colors.primary;
  const secondary =
    faction === 'elf'
      ? theme.colors.primary
      : faction === 'orc'
        ? theme.colors.danger
        : theme.colors.info;

  return (
    <View pointerEvents="none" style={styles.atmosphere}>
      <View
        style={[
          styles.atmosphereHalo,
          {
            backgroundColor: accent + (theme.dark ? '12' : '0C'),
            top: section === 'campaign' ? 16 : -24,
            right: section === 'army' ? -80 : -44
          }
        ]}
      />
      <View
        style={[
          styles.atmosphereHaloSmall,
          {
            backgroundColor: secondary + (theme.dark ? '0D' : '08'),
            bottom: section === 'wagon' ? 20 : -42,
            left: section === 'formation' ? -44 : -72
          }
        ]}
      />
      <View style={[styles.atmosphereRule, { backgroundColor: accent + '2A' }]} />
    </View>
  );
}

function useGuardedPress(
  onPress: (() => void) | undefined,
  disabled: boolean | undefined
) {
  const lastPressAtRef = React.useRef(0);

  return React.useCallback(() => {
    if (disabled || !onPress) return;

    const now = Date.now();
    if (
      !shouldAcceptActionPress(
        lastPressAtRef.current,
        now
      )
    ) {
      return;
    }

    lastPressAtRef.current = now;
    onPress();
  }, [disabled, onPress]);
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
  const guardedPress = useGuardedPress(onPress, disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={guardedPress}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: disabled ? theme.colors.surface3 : theme.colors.primary,
          borderColor: disabled ? theme.colors.border : '#00000030',
          borderTopColor: disabled ? theme.colors.border : '#FFFFFF55',
          borderBottomColor: disabled ? theme.colors.border : '#00000065',
          borderBottomWidth: pressed && !disabled ? 2 : 4,
          paddingTop: pressed && !disabled ? 11 : 9,
          opacity: pressed && !disabled ? 0.94 : 1,
          transform: [{ translateY: pressed && !disabled ? 1 : 0 }]
        }
      ]}
    >
      <Text
        style={[
          styles.primaryButtonText,
          { color: disabled ? theme.colors.textMuted : theme.colors.onPrimary }
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
  const guardedPress = useGuardedPress(onPress, disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={guardedPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        {
          backgroundColor: pressed && !disabled ? theme.colors.surface3 : theme.colors.surface2,
          borderColor: pressed && !disabled ? theme.colors.textMuted : theme.colors.border,
          borderBottomWidth: pressed && !disabled ? 1 : 3,
          paddingTop: pressed && !disabled ? 10 : 8,
          opacity: disabled ? 0.5 : 1,
          transform: [{ translateY: pressed && !disabled ? 1 : 0 }]
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
  art,
  value,
  label
}: {
  icon?: string;
  art?: React.ReactNode;
  value: number;
  label?: string;
}) {
  const { theme } = useGameTheme();

  return (
    <View style={[styles.resourceChip, { backgroundColor: theme.colors.surface2 }]}>
      {art ?? <Text style={styles.resourceIcon}>{icon ?? ''}</Text>}
      <View>
        <Text style={[styles.resourceValue, { color: theme.colors.text }]}>{value}</Text>
        {label ? (
          <Text style={[styles.resourceLabel, { color: theme.colors.textMuted }]}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function ResourceAmountRow({
  values,
  prefix = '',
  compact = false
}: {
  values: Partial<ResourceWallet>;
  prefix?: string;
  compact?: boolean;
}) {
  const { theme } = useGameTheme();
  const order: Array<keyof ResourceWallet> = [
    'gold',
    'wood',
    'stone',
    'iron',
    'provisions'
  ];

  return (
    <View style={styles.resourceAmountRow}>
      {order.map(resource => {
        const value = values[resource] ?? 0;
        if (!value) return null;
        return (
          <View
            key={resource}
            style={[
              styles.resourceAmount,
              compact ? styles.resourceAmountCompact : undefined,
              { backgroundColor: theme.colors.surface2 }
            ]}
          >
            <ResourceSprite resource={resource} size={compact ? 20 : 24} />
            <Text style={[styles.resourceAmountText, { color: theme.colors.text }]}>
              {prefix}{value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function UnitPortrait({
  name,
  className,
  accent,
  compact,
  faction = 'human'
}: {
  name: string;
  className: string;
  accent: string;
  compact?: boolean;
  faction?: FactionId;
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
        <UnitSprite className={className} faction={faction} size={compact ? 42 : 54} />
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
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.progressTrack, { backgroundColor: theme.colors.surface3 }]}
    >
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    position: 'relative',
    overflow: 'hidden'
  },
  cardFactionRail: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    opacity: 0.85
  },
  cardCornerTop: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 13,
    height: 13,
    borderTopWidth: 2,
    borderRightWidth: 2,
    opacity: 0.45
  },
  cardCornerBottom: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    opacity: 0.32
  },
  cardStateGlow: {
    position: 'absolute',
    left: 3,
    right: 3,
    top: 3,
    bottom: 3,
    borderRadius: 16,
    borderWidth: 1
  },
  sectionTitleRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    flexShrink: 1
  },
  sectionTrailing: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
    maxWidth: '45%',
    textAlign: 'right'
  },
  screenHero: {
    paddingVertical: 18,
    paddingHorizontal: 16
  },
  screenHeroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12
  },
  screenHeroCopy: {
    flex: 1,
    minWidth: 0
  },
  screenHeroEyebrow: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '900',
    letterSpacing: 1.2
  },
  screenHeroTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    marginTop: 4
  },
  screenHeroStatus: {
    paddingTop: 1
  },
  screenHeroBody: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 8,
    maxWidth: 360
  },
  screenHeroContent: {
    marginTop: 14
  },
  metricTile: {
    minWidth: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 10
  },
  metricTileLabel: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '900',
    letterSpacing: 0.7
  },
  metricTileValue: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    marginTop: 3
  },
  metricTileCaption: {
    fontSize: 8.5,
    lineHeight: 12,
    marginTop: 2
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
  statusPill: {
    minHeight: 29,
    borderRadius: 999,
    paddingHorizontal: 9,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  statusSymbol: {
    fontSize: 9,
    fontWeight: '900'
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3
  },
  flowProgress: {
    minHeight: 40,
    marginHorizontal: 14,
    marginTop: 7,
    marginBottom: 1,
    borderWidth: 1,
    borderRadius: 13,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  flowSegment: {
    flex: 1,
    minHeight: 30,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  flowSegmentMark: {
    fontSize: 8,
    fontWeight: '900'
  },
  flowLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.65
  },
  atmosphere: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden'
  },
  atmosphereHalo: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115
  },
  atmosphereHaloSmall: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85
  },
  atmosphereRule: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 0,
    height: 1
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 9
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    flexShrink: 1
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    flexShrink: 1
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
  resourceAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  resourceAmount: {
    minHeight: 34,
    borderRadius: 11,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  resourceAmountCompact: {
    minHeight: 28,
    paddingHorizontal: 6
  },
  resourceAmountText: {
    fontSize: 10.5,
    fontWeight: '900'
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
