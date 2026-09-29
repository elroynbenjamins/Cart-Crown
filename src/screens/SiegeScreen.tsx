import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  getSiegeChoices,
  getSiegeEffectivePower,
  getSiegePreparation,
  getSiegeReward,
  getSiegeThreat,
  siegeStages
} from '../game/sieges';
import {
  getFormationShape
} from '../game/formation';
import { useGame } from '../game/GameProvider';
import {
  getSideModeRewardLabel
} from '../game/sideModeBalance';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  PrimaryButton,
  ProgressBar,
  ResourceAmountRow,
  ScreenHero,
  SecondaryButton,
  SectionTitle,
  StatusPill
} from '../ui/components';

export function SiegeScreen({
  onEditFormation,
  onEditWagon,
  onExit
}: {
  onEditFormation: () => void;
  onEditWagon: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    armyReadiness,
    formationShapeId,
    buildingLevels,
    factionBuildingIds,
    wagonItems,
    siegeRunsCompleted,
    activeSiegeRun,
    siegeNextRewardMultiplier,
    startSiegeRun,
    resolveSiegeStageChoice,
    abandonSiegeRun,
    finishSiegeRun
  } = useGame();

  const accent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const preparation = useMemo(
    () =>
      getSiegePreparation({
        buildingLevels,
        buildingIds: {
          army: factionBuildingIds.army,
          forge: factionBuildingIds.forge,
          logistics: factionBuildingIds.logistics,
          supply: factionBuildingIds.supply,
          command: factionBuildingIds.command,
          scout: factionBuildingIds.scout
        },
        wagonItems
      }),
    [
      buildingLevels,
      factionBuildingIds,
      wagonItems
    ]
  );

  const currentShape =
    getFormationShape(formationShapeId);
  const currentStage =
    activeSiegeRun &&
    !activeSiegeRun.failed &&
    !activeSiegeRun.completed
      ? siegeStages[
          activeSiegeRun.stageIndex
        ]
      : null;
  const choices =
    currentStage
      ? getSiegeChoices(
          activeSiegeRun!.stageIndex
        )
      : [];
  const progress =
    activeSiegeRun
      ? Math.min(
          1,
          activeSiegeRun.stageIndex /
            siegeStages.length
        )
      : 0;

  const finish = () => {
    if (finishSiegeRun()) {
      onExit();
    }
  };

  const failAndExit = () => {
    abandonSiegeRun();
    onExit();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        eyebrow="OFFENSIVE SIDE MODE"
        title="Offensive Siege"
        body={
          activeSiegeRun
            ? 'The assault is underway. Readiness, supplies, formation and siege preparation are locked for this run.'
            : 'Lead a staged fortress assault: cross the approach, break the defenses, seize the courtyard and defeat the commander.'
        }
        accent={accent}
        status={
          <StatusPill
            label={
              activeSiegeRun
                ? activeSiegeRun.completed
                  ? 'KEEP TAKEN'
                  : activeSiegeRun.failed
                    ? 'ASSAULT BROKEN'
                    : 'SIEGE ACTIVE'
                : getSideModeRewardLabel(
                    siegeNextRewardMultiplier
                  )
            }
            tone={
              activeSiegeRun?.completed
                ? 'done'
                : activeSiegeRun?.failed
                  ? 'elite'
                  : activeSiegeRun
                    ? 'current'
                    : siegeNextRewardMultiplier === 1
                      ? 'ready'
                      : siegeNextRewardMultiplier === 0.5
                        ? 'current'
                        : 'neutral'
            }
          />
        }
      />

      {!activeSiegeRun ? (
        <>
          <GameCard
            faction={activeFaction}
            accent={accent}
          >
            <Text
              style={[
                styles.rewardBand,
                { color: theme.colors.text }
              ]}
            >
              {siegeNextRewardMultiplier === 1
                ? 'First rewarded siege this chapter pays the full fortress bounty.'
                : siegeNextRewardMultiplier === 0.5
                  ? 'Second rewarded siege this chapter pays 50%.'
                  : 'Further sieges are practice-only until the next chapter.'}
            </Text>
          </GameCard>

          <SectionTitle
            title="Siege Preparation"
            trailing={
              siegeRunsCompleted +
              (siegeRunsCompleted === 1
                ? ' clear'
                : ' clears')
            }
          />

          <GameCard faction={activeFaction}>
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                  READINESS
                </Text>
                <Text style={[styles.value, { color: armyReadiness >= 70 ? theme.colors.primary : theme.colors.gold }]}>
                  {armyReadiness}%
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                  ENGINEERING
                </Text>
                <Text style={[styles.value, { color: theme.colors.gold }]}>
                  {preparation.engineering}/3
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                  SUPPLIES
                </Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {preparation.initialSupplies}
                </Text>
              </View>
            </View>

            <View style={styles.bonusGrid}>
              {preparation.bonuses.map(
                bonus => (
                  <View
                    key={bonus.label}
                    style={[
                      styles.bonus,
                      {
                        borderColor:
                          theme.colors.border,
                        backgroundColor:
                          theme.colors.surface2
                      }
                    ]}
                  >
                    <Text style={[styles.bonusLabel, { color: theme.colors.textMuted }]}>
                      {bonus.label}
                    </Text>
                    <Text style={[styles.bonusValue, { color: theme.colors.text }]}>
                      {bonus.value}
                    </Text>
                  </View>
                )
              )}
            </View>

            <Text style={[styles.note, { color: theme.colors.textMuted }]}>
              Army, Forge and Command levels add siege power. Logistics, Supply buildings and packed Wagon items expand field supplies. Engineering level 2 unlocks the Sapper breach.
            </Text>

            <View style={styles.actions}>
              <SecondaryButton
                label="Edit Formation"
                onPress={onEditFormation}
              />
              <SecondaryButton
                label="Edit Wagon"
                onPress={onEditWagon}
              />
            </View>
          </GameCard>

          <SectionTitle
            title="Assault Plan"
            trailing="4 stages"
          />

          {siegeStages.map(
            (stage, index) => (
              <GameCard
                key={stage.id}
                faction={activeFaction}
                ornament={false}
              >
                <View style={styles.stageRow}>
                  <StatusPill
                    label={String(index + 1)}
                    tone={
                      index === 3
                        ? 'boss'
                        : 'current'
                    }
                  />
                  <View style={styles.headerCopy}>
                    <Text style={[styles.stageName, { color: theme.colors.text }]}>
                      {stage.name}
                    </Text>
                    <Text style={[styles.stageSummary, { color: theme.colors.textMuted }]}>
                      {stage.summary}
                    </Text>
                  </View>
                </View>
              </GameCard>
            )
          )}

          <PrimaryButton
            label={
              siegeNextRewardMultiplier === 0
                ? 'Begin Practice Siege'
                : 'Begin Offensive Siege'
            }
            onPress={startSiegeRun}
          />
        </>
      ) : (
        <>
          <GameCard
            faction={activeFaction}
            accent={accent}
          >
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                  READINESS
                </Text>
                <Text style={[styles.value, { color: activeSiegeRun.readiness >= 70 ? theme.colors.primary : theme.colors.gold }]}>
                  {activeSiegeRun.readiness}%
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                  SUPPLIES
                </Text>
                <Text style={[styles.value, { color: theme.colors.gold }]}>
                  {activeSiegeRun.supplies}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.label, { color: theme.colors.textMuted }]}>
                  MOMENTUM
                </Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  +{Math.round(activeSiegeRun.powerBonus * 100)}%
                </Text>
              </View>
            </View>
            <ProgressBar
              value={progress}
              color={accent}
            />
          </GameCard>

          <SectionTitle
            title="Siege Progress"
            trailing={
              activeSiegeRun.completed
                ? 'Complete'
                : activeSiegeRun.failed
                  ? 'Failed'
                  : 'Stage ' +
                    (activeSiegeRun.stageIndex + 1) +
                    '/4'
            }
          />

          <View style={styles.track}>
            {siegeStages.map(
              (stage, index) => (
                <StatusPill
                  key={stage.id}
                  label={
                    String(index + 1) +
                    ' · ' +
                    stage.name.toUpperCase()
                  }
                  tone={
                    index <
                    activeSiegeRun.stageIndex
                      ? 'done'
                      : index ===
                            activeSiegeRun.stageIndex &&
                          !activeSiegeRun.failed &&
                          !activeSiegeRun.completed
                        ? 'current'
                        : 'locked'
                  }
                />
              )
            )}
          </View>

          {activeSiegeRun.lastSummary ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.message,
                {
                  color:
                    activeSiegeRun.failed
                      ? theme.colors.danger
                      : theme.colors.gold
                }
              ]}
            >
              {activeSiegeRun.lastSummary}
            </Text>
          ) : null}

          {activeSiegeRun.failed ? (
            <GameCard
              faction={activeFaction}
              state="danger"
              accent={theme.colors.danger}
            >
              <Text style={[styles.failTitle, { color: theme.colors.text }]}>
                The assault has broken
              </Text>
              <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                The siege is over. Readiness loss remains, but practice and rewarded siege limits are not consumed by a failed assault.
              </Text>
              <View style={styles.actions}>
                <PrimaryButton
                  label="End Siege"
                  onPress={failAndExit}
                />
              </View>
            </GameCard>
          ) : activeSiegeRun.completed ? (
            <GameCard
              faction={activeFaction}
              state="ready"
              accent={theme.colors.primary}
            >
              <View style={styles.completeHeader}>
                <View style={styles.headerCopy}>
                  <Text style={[styles.failTitle, { color: theme.colors.text }]}>
                    Fortress Captured
                  </Text>
                  <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                    The commander is defeated. Secure the bounty and return to the campaign.
                  </Text>
                </View>
                <StatusPill
                  label="VICTORY"
                  tone="done"
                />
              </View>
              <View style={styles.reward}>
                <ResourceAmountRow
                  prefix="+"
                  values={getSiegeReward(
                    activeSiegeRun.rewardMultiplier
                  )}
                />
              </View>
              <View style={styles.actions}>
                <PrimaryButton
                  label={
                    activeSiegeRun.rewardMultiplier > 0
                      ? 'Secure Fortress Reward'
                      : 'Finish Practice Siege'
                  }
                  onPress={finish}
                />
              </View>
            </GameCard>
          ) : (
            <>
              <SectionTitle
                title={currentStage?.name ?? 'Siege Stage'}
                trailing={
                  choices.length +
                  (choices.length === 1
                    ? ' plan'
                    : ' plans')
                }
              />

              {choices.map(choice => {
                const engineeringReady =
                  activeSiegeRun.engineering >=
                  (choice.minimumEngineering ?? 0);
                const affordable =
                  activeSiegeRun.supplies >=
                  (choice.supplyCost ?? 0);
                const enemyShape =
                  getFormationShape(
                    choice.formationShapeId
                  );
                const threat =
                  getSiegeThreat(
                    choice,
                    activeSiegeRun.wagonStageId
                  );
                const effective =
                  getSiegeEffectivePower({
                    basePower:
                      activeSiegeRun.basePower,
                    playerShapeId:
                      activeSiegeRun.playerShapeId,
                    enemyShapeId:
                      choice.formationShapeId,
                    readiness:
                      activeSiegeRun.readiness,
                    preparationMultiplier:
                      activeSiegeRun.preparationMultiplier,
                    powerBonus:
                      Math.min(
                        0.2,
                        activeSiegeRun.powerBonus +
                          (choice.powerBonusDelta ?? 0)
                      )
                  });

                return (
                  <GameCard
                    key={choice.id}
                    faction={activeFaction}
                    accent={
                      choice.stageId === 'commander'
                        ? theme.colors.gold
                        : accent
                    }
                  >
                    <View style={styles.choiceHeader}>
                      <View style={styles.headerCopy}>
                        <Text style={[styles.choiceName, { color: theme.colors.text }]}>
                          {choice.name}
                        </Text>
                        <Text style={[styles.choiceBody, { color: theme.colors.textMuted }]}>
                          {choice.description}
                        </Text>
                      </View>
                      <StatusPill
                        label={
                          choice.stageId === 'commander'
                            ? 'COMMANDER'
                            : choice.stageId.toUpperCase()
                        }
                        tone={
                          choice.stageId === 'commander'
                            ? 'boss'
                            : 'available'
                        }
                      />
                    </View>

                    <View style={[styles.intel, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface2 }]}>
                      <Text style={[styles.intelLabel, { color: accent }]}>
                        DEFENDER FORMATION
                      </Text>
                      <Text style={[styles.intelValue, { color: theme.colors.text }]}>
                        {enemyShape.layout} · {enemyShape.name}
                      </Text>
                      <Text style={[styles.intelBody, { color: theme.colors.textMuted }]}>
                        {effective.matchup.summary}
                      </Text>
                      <View style={styles.powerRow}>
                        <Text style={[styles.power, { color: effective.value >= threat ? theme.colors.primary : theme.colors.gold }]}>
                          Assault {effective.value}
                        </Text>
                        <Text style={[styles.power, { color: theme.colors.danger }]}>
                          Defense {threat}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.chips}>
                      {(choice.supplyCost ?? 0) > 0 ? (
                        <StatusPill
                          label={'-' + choice.supplyCost + ' SUPPLY'}
                          tone={affordable ? 'current' : 'locked'}
                        />
                      ) : null}
                      {(choice.minimumEngineering ?? 0) > 0 ? (
                        <StatusPill
                          label={'ENGINEERING ' + choice.minimumEngineering}
                          tone={engineeringReady ? 'ready' : 'locked'}
                        />
                      ) : null}
                      {(choice.powerBonusDelta ?? 0) > 0 ? (
                        <StatusPill
                          label={'+' + Math.round((choice.powerBonusDelta ?? 0) * 100) + '% MOMENTUM'}
                          tone="available"
                        />
                      ) : null}
                    </View>

                    <View style={styles.actions}>
                      <PrimaryButton
                        label={
                          !engineeringReady
                            ? 'Engineering Too Low'
                            : !affordable
                              ? 'Not Enough Supplies'
                              : 'Execute Plan'
                        }
                        disabled={
                          !engineeringReady ||
                          !affordable
                        }
                        onPress={() =>
                          resolveSiegeStageChoice(
                            choice.id
                          )
                        }
                      />
                    </View>
                  </GameCard>
                );
              })}

              <SecondaryButton
                label="Return to Campaign · Siege Saved"
                onPress={onExit}
              />
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 34,
    gap: 12
  },
  rewardBand: {
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '800'
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  metric: { flex: 1 },
  label: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2
  },
  bonusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8
  },
  bonus: {
    minWidth: '46%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8
  },
  bonusLabel: {
    fontSize: 8.5,
    fontWeight: '800'
  },
  bonusValue: {
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: '900',
    marginTop: 2
  },
  note: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 8
  },
  actions: {
    gap: 8,
    marginTop: 12
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerCopy: { flex: 1 },
  stageName: {
    fontSize: 14,
    fontWeight: '900'
  },
  stageSummary: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4
  },
  track: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  message: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800'
  },
  failTitle: {
    fontSize: 18,
    fontWeight: '900'
  },
  completeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  reward: {
    marginTop: 10
  },
  choiceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  choiceName: {
    fontSize: 16,
    fontWeight: '900'
  },
  choiceBody: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5
  },
  intel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 11
  },
  intelLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  intelValue: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3
  },
  intelBody: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 5
  },
  powerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 9
  },
  power: {
    fontSize: 11,
    fontWeight: '900'
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10
  }
});
