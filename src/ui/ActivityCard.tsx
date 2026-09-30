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
  highlight = false
}: {
  mode: SideModeDefinition;
  faction: FactionId;
  accent: string;
  status: string;
  actionLabel: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  const { theme } = useGameTheme();
  const presentation =
    activityPresentation[mode.id];

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
          <Text
            style={[
              styles.name,
              { color: theme.colors.text }
            ]}
            numberOfLines={1}
          >
            {mode.name}
          </Text>
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
        <Text
          style={[
            styles.status,
            { color: accent }
          ]}
          numberOfLines={1}
        >
          {status}
        </Text>
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
  name: {
    fontSize: 15,
    fontWeight: '900'
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
  status: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900'
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
