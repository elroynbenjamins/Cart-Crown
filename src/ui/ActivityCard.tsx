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
  SecondaryButton,
  StatusPill
} from './components';

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
        <View style={styles.copy}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.name,
                { color: theme.colors.text }
              ]}
              numberOfLines={1}
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
        <StatusPill
          label={presentation.badge}
          tone={
            mode.id === 'relic_hunts'
              ? 'boss'
              : 'available'
          }
        />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.statusRow}>
          <Text
            style={[
              styles.status,
              { color: accent }
            ]}
            numberOfLines={1}
          >
            {status}
          </Text>
          {attentionLabel ? (
            <Text
              style={[
                styles.attention,
                { color: attentionColor }
              ]}
              numberOfLines={1}
            >
              {attentionLabel}
            </Text>
          ) : null}
        </View>
        <Text
          style={[
            styles.reward,
            { color: theme.colors.gold }
          ]}
          numberOfLines={1}
        >
          {mode.rewardFocus}
        </Text>
      </View>

      <View style={styles.button}>
        <SecondaryButton
          label={actionLabel}
          onPress={onPress}
        />
      </View>
    </GameCard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9
  },
  copy: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '900'
  },
  notificationDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  purpose: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 3
  },
  metaRow: {
    marginTop: 9,
    gap: 3
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  status: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900'
  },
  attention: {
    flexShrink: 0,
    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: '900',
    letterSpacing: 0.55
  },
  reward: {
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: '800'
  },
  button: {
    marginTop: 10
  }
});
