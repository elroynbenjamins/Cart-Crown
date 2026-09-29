import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  evaluateKingdomTrial,
  kingdomTrialOrder
} from '../game/kingdomTrials';
import type { KingdomTrialId } from '../game/kingdomTrials';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  PrimaryButton,
  ResourceAmountRow,
  ScreenHero,
  SecondaryButton,
  SectionTitle,
  StatusPill
} from '../ui/components';

export function FormationTrialScreen({
  onEditFormation,
  onExit
}: {
  onEditFormation: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    formation,
    formationShapeId,
    formationDoctrineId,
    kingdomTrialCompletions,
    completeKingdomTrial
  } = useGame();
  const [message, setMessage] =
    useState<string | null>(null);

  const accent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const completedCount =
    kingdomTrialCompletions.length;
  const currentTrialId =
    kingdomTrialOrder.find(
      id =>
        !kingdomTrialCompletions.includes(id)
    ) ?? null;

  const evaluations = useMemo(
    () =>
      Object.fromEntries(
        kingdomTrialOrder.map(id => [
          id,
          evaluateKingdomTrial(id, {
            faction: activeFaction,
            formation,
            formationShapeId,
            formationDoctrineId
          })
        ])
      ) as Record<
        KingdomTrialId,
        ReturnType<typeof evaluateKingdomTrial>
      >,
    [
      activeFaction,
      formation,
      formationDoctrineId,
      formationShapeId
    ]
  );

  const visibleIds = currentTrialId
    ? kingdomTrialOrder.filter(
        id =>
          kingdomTrialCompletions.includes(id) ||
          id === currentTrialId
      )
    : [...kingdomTrialOrder];

  const checkCurrent = () => {
    if (!currentTrialId) return;

    if (
      completeKingdomTrial(currentTrialId)
    ) {
      const medal =
        evaluations[currentTrialId].medal;
      setMessage(
        medal +
          ' Trial complete. The next challenge is now available.'
      );
      return;
    }

    const missing =
      evaluations[currentTrialId].checks
        .filter(check => !check.passed)
        .map(check => check.label);

    setMessage(
      missing.length > 0
        ? 'Still needed: ' +
            missing.slice(0, 2).join(' · ')
        : 'This setup changed before the trial could be recorded. Recheck the formation.'
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        eyebrow="OPTIONAL TACTICAL MODE"
        title="Kingdom Trials"
        body="Master one lesson at a time. Bronze teaches your faction identity, Silver adds formation geometry, and Gold combines shape with doctrine."
        accent={accent}
        status={
          <StatusPill
            label={
              completedCount +
              '/3 MEDALS'
            }
            tone={
              completedCount === 3
                ? 'done'
                : 'current'
            }
          />
        }
      />

      <GameCard
        faction={activeFaction}
        accent={accent}
      >
        <View style={styles.medalRow}>
          {kingdomTrialOrder.map(id => {
            const completed =
              kingdomTrialCompletions.includes(id);
            const current =
              id === currentTrialId;

            return (
              <StatusPill
                key={id}
                label={
                  id.toUpperCase() +
                  (completed ? ' ✓' : '')
                }
                tone={
                  completed
                    ? 'done'
                    : current
                      ? 'current'
                      : 'locked'
                }
              />
            );
          })}
        </View>
        <Text
          style={[
            styles.progressNote,
            { color: theme.colors.textMuted }
          ]}
        >
          Future trial details stay hidden until
          the previous medal is earned.
        </Text>
      </GameCard>

      {visibleIds.map(id => {
        const evaluation = evaluations[id];
        const completed =
          kingdomTrialCompletions.includes(id);
        const current = id === currentTrialId;

        return (
          <GameCard
            key={id}
            faction={activeFaction}
            state={
              completed
                ? 'ready'
                : current
                  ? 'selected'
                  : 'default'
            }
            accent={
              completed || current
                ? accent
                : undefined
            }
          >
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text
                  style={[
                    styles.eyebrow,
                    {
                      color: completed
                        ? theme.colors.primary
                        : theme.colors.gold
                    }
                  ]}
                >
                  {evaluation.medal} TRIAL
                </Text>
                <Text
                  style={[
                    styles.title,
                    { color: theme.colors.text }
                  ]}
                >
                  {evaluation.title}
                </Text>
              </View>
              <StatusPill
                label={
                  completed
                    ? 'COMPLETE'
                    : 'CURRENT'
                }
                tone={
                  completed
                    ? 'done'
                    : 'current'
                }
              />
            </View>

            <Text
              style={[
                styles.body,
                { color: theme.colors.textMuted }
              ]}
            >
              {evaluation.body}
            </Text>

            {!completed ? (
              <>
                <View
                  style={[
                    styles.lesson,
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
                      styles.lessonLabel,
                      { color: accent }
                    ]}
                  >
                    WHAT THIS TEACHES
                  </Text>
                  <Text
                    style={[
                      styles.lessonBody,
                      { color: theme.colors.text }
                    ]}
                  >
                    {evaluation.lesson}
                  </Text>
                </View>

                <SectionTitle
                  title="Objectives"
                  trailing={
                    evaluation.checks.filter(
                      check => check.passed
                    ).length +
                    '/' +
                    evaluation.checks.length
                  }
                />
                <View style={styles.checks}>
                  {evaluation.checks.map(check => (
                    <View
                      key={check.id}
                      style={styles.checkRow}
                    >
                      <StatusPill
                        label={
                          check.passed
                            ? 'DONE'
                            : 'TODO'
                        }
                        tone={
                          check.passed
                            ? 'done'
                            : 'locked'
                        }
                      />
                      <Text
                        style={[
                          styles.check,
                          { color: theme.colors.text }
                        ]}
                      >
                        {check.label}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.actions}>
                  <PrimaryButton
                    label={
                      evaluation.passed
                        ? 'Claim ' +
                          evaluation.medal +
                          ' Medal'
                        : 'Check Formation'
                    }
                    onPress={checkCurrent}
                  />
                  <SecondaryButton
                    label="Edit Formation"
                    onPress={onEditFormation}
                  />
                </View>
              </>
            ) : null}

            <View style={styles.reward}>
              <Text
                style={[
                  styles.rewardTitle,
                  { color: theme.colors.text }
                ]}
              >
                {completed
                  ? 'Reward claimed'
                  : 'First-clear reward'}
              </Text>
              <ResourceAmountRow
                prefix="+"
                values={evaluation.reward}
              />
            </View>
          </GameCard>
        );
      })}

      {message ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            styles.message,
            {
              color:
                completedCount === 3
                  ? theme.colors.primary
                  : theme.colors.gold
            }
          ]}
        >
          {message}
        </Text>
      ) : null}

      {completedCount === 3 ? (
        <GameCard
          faction={activeFaction}
          accent={theme.colors.gold}
          state="ready"
        >
          <View style={styles.masteryHeader}>
            <View style={styles.headerCopy}>
              <Text
                style={[
                  styles.eyebrow,
                  { color: theme.colors.gold }
                ]}
              >
                TRIAL TRACK COMPLETE
              </Text>
              <Text
                style={[
                  styles.masteryTitle,
                  { color: theme.colors.text }
                ]}
              >
                Formation Mastery
              </Text>
            </View>
            <StatusPill
              label="3 / 3"
              tone="done"
            />
          </View>
          <Text
            style={[
              styles.body,
              { color: theme.colors.textMuted }
            ]}
          >
            You have completed the foundational
            Kingdom Trials for this faction. Later
            challenge sets can build on these
            medals without forcing campaign
            progression.
          </Text>
        </GameCard>
      ) : null}

      <SecondaryButton
        label="Return to Campaign"
        onPress={onExit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 34,
    gap: 13
  },
  medalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  progressNote: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  headerCopy: {
    flex: 1
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    marginTop: 4
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7
  },
  lesson: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 12
  },
  lessonLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  lessonBody: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 4
  },
  checks: {
    gap: 8
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  check: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800'
  },
  actions: {
    gap: 8,
    marginTop: 14
  },
  reward: {
    gap: 7,
    marginTop: 14
  },
  rewardTitle: {
    fontSize: 12,
    fontWeight: '900'
  },
  message: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800'
  },
  masteryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  masteryTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    marginTop: 3
  }
});
