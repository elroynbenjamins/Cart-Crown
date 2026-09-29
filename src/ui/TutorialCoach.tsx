import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { FactionId } from '../game/types';
import type { TutorialMoment } from '../game/tutorial';
import { useGameTheme } from '../theme/ThemeProvider';

export function TutorialCoach({
  faction,
  moment,
  onPrimary
}: {
  faction: FactionId;
  moment: TutorialMoment;
  onPrimary: () => void;
}) {
  const { theme } = useGameTheme();
  const accent =
    faction === 'elf'
      ? theme.colors.elf
      : faction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => undefined}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface1,
              borderColor: accent
            }
          ]}
        >
          <View style={styles.topRow}>
            <Text
              style={[
                styles.eyebrow,
                { color: accent }
              ]}
            >
              {moment.eyebrow}
            </Text>
            {moment.stepLabel ? (
              <View
                style={[
                  styles.stepPill,
                  {
                    backgroundColor:
                      theme.colors.surface2,
                    borderColor:
                      theme.colors.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.stepText,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  {moment.stepLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            style={[
              styles.title,
              { color: theme.colors.text }
            ]}
          >
            {moment.title}
          </Text>

          <Text
            style={[
              styles.body,
              { color: theme.colors.textMuted }
            ]}
          >
            {moment.body}
          </Text>

          <View
            style={[
              styles.tip,
              {
                backgroundColor:
                  theme.colors.surface2,
                borderColor:
                  theme.colors.border
              }
            ]}
          >
            <Text
              style={[
                styles.tipLabel,
                { color: theme.colors.gold }
              ]}
            >
              COACH TIP
            </Text>
            <Text
              style={[
                styles.tipText,
                { color: theme.colors.text }
              ]}
            >
              You only see each lesson once in this faction. First-time unlock tips can be replayed from Settings.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={moment.primaryLabel}
            onPress={onPrimary}
            style={({ pressed }) => [
              styles.primary,
              {
                backgroundColor: accent,
                opacity: pressed ? 0.84 : 1
              }
            ]}
          >
            <Text style={styles.primaryText}>
              {moment.primaryLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(4, 7, 12, 0.72)',
    padding: 14,
    paddingBottom: 22
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 17
  },
  topRow: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  eyebrow: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.25
  },
  stepPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  stepText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7
  },
  title: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    marginTop: 11
  },
  body: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10
  },
  tip: {
    marginTop: 15,
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 11
  },
  tipLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9
  },
  tipText: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4
  },
  primary: {
    minHeight: 48,
    marginTop: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  }
});
