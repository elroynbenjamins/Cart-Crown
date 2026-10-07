import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import type {
  FactionId,
  SideModeDefinition
} from '../game/types';
import {
  activityPresentation
} from '../game/activityPresentation';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  PrimaryButton,
  SecondaryButton,
  StatusPill
} from './components';
import { ActivityEmblem } from './ActivityEmblem';

export function ActivityCard({
  mode,
  faction,
  accent,
  status,
  actionLabel,
  onPress,
  highlight = false,
  attentionLabel,
  attentionTone = 'resume'
}: {
  mode: SideModeDefinition;
  faction: FactionId;
  accent: string;
  status: string;
  actionLabel: string;
  onPress: () => void;
  highlight?: boolean;
  attentionLabel?: string;
  attentionTone?: 'reward' | 'resume' | 'review' | 'unique';
}) {
  const { theme } = useGameTheme();
  const presentation =
    activityPresentation[mode.id];
  const attentionColor =
    attentionTone === 'reward'
      ? theme.colors.gold
      : attentionTone === 'review'
        ? theme.colors.danger
        : attentionTone === 'unique'
          ? theme.colors.info
          : accent;

  return (
    <GameCard
      faction={faction}
      accent={highlight ? theme.colors.gold : accent}
      state={highlight ? 'selected' : 'default'}
      ornament={false}
      style={styles.card}
    >
      <View style={styles.header}>
        <ActivityEmblem mode={mode.id} />
        <View style={styles.copy}>
          <View style={styles.badgeRow}>
            <StatusPill
              label={presentation.badge}
              tone={mode.id === 'relic_hunts' ? 'boss' : 'available'}
            />
          </View>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.name,
                { color: theme.colors.text }
              ]}
              numberOfLines={2}
            >
              {mode.name}
            </Text>
            {attentionLabel ? (
              <View
                accessibilityLabel={attentionLabel}
                style={[
                  styles.notificationDot,
                  { backgroundColor: attentionColor }
                ]}
              />
            ) : null}
          </View>
          <Text
            style={[
              styles.purpose,
              { color: theme.colors.textMuted }
            ]}
            numberOfLines={2}
          >
            {presentation.purpose}
          </Text>
        </View>
      </View>

      <View style={[styles.metaRow, { borderColor: theme.colors.border }]}>
        <View style={styles.statusRow}>
          <Text
            style={[
              styles.status,
              { color: accent }
            ]}
          >
            {status}
          </Text>
          {attentionLabel ? (
            <View style={[styles.attentionBadge, { backgroundColor: attentionColor + '16', borderColor: attentionColor + '60' }]}>
              <Text style={[styles.attention, { color: attentionColor }]}>
                {attentionLabel}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.rewardRow}>
          <View style={[styles.rewardMark, { backgroundColor: theme.colors.gold }]} />
          <Text style={[styles.reward, { color: theme.colors.gold }]}>
            {mode.rewardFocus}
          </Text>
        </View>
      </View>

      <View style={styles.button}>
        {highlight ? (
          <PrimaryButton label={actionLabel} onPress={onPress} />
        ) : (
          <SecondaryButton label={actionLabel} onPress={onPress} />
        )}
      </View>
    </GameCard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900'
  },
  notificationDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  purpose: {
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 3
  },
  metaRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    marginTop: 9,
    gap: 6
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6
  },
  status: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: '900'
  },
  attentionBadge: {
    maxWidth: '100%',
    flexShrink: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  attention: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '900',
    letterSpacing: 0.4
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5
  },
  rewardMark: {
    width: 5,
    height: 5,
    marginTop: 6,
    transform: [{ rotate: '45deg' }]
  },
  reward: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800'
  },
  button: {
    marginTop: 9
  }
});
