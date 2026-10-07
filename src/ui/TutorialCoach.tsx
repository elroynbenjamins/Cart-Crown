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

  const coachTip =
    moment.kind === 'unit'
      ? 'The gold highlight will show this squad in Formation. You can keep its current position or change it; the lesson is about learning the control, not forcing a specific build.'
      : moment.kind === 'building'
        ? 'Unlocking a blueprint does not obligate you to spend resources. Inspect it now, build it when it fits your plan.'
        : moment.key === 'system:forge'
          ? 'Equipment is optional at the moment it unlocks. The tutorial can be acknowledged without buying anything.'
          : moment.key === 'system:readiness'
            ? 'Readiness only becomes a combat penalty below 70%. This warning appears when recovery actually matters.'
            : moment.focusAfterPrimary
              ? 'After this explanation, the next useful control will pulse in gold. If you leave the screen before using it, the lesson will return later.'
              : 'This is a one-time explanation. You can replay tutorial guidance for the current faction from Settings.';

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
              {coachTip}
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
    padding: 10,
    paddingBottom: 14
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12
  },
  topRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  eyebrow: {
    flexShrink: 1,
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 1
  },
  stepPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  stepText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    marginTop: 8
  },
  body: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 6
  },
  tip: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 8
  },
  tipLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9
  },
  tipText: {
    fontSize: 9.5,
    lineHeight: 13,
    marginTop: 3
  },
  primary: {
    minHeight: 44,
    marginTop: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900'
  }
});
