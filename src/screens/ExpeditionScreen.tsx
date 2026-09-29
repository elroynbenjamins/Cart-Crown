import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  expeditionStages,
  getExpeditionChoice,
  getExpeditionChoices,
  getExpeditionCompletionReward,
  getExpeditionEffectivePower,
  getExpeditionPreparation,
  getExpeditionThreat
} from '../game/expeditions';
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
import { CampaignNodeSprite } from '../ui/gameArt';

export function ExpeditionScreen({
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
    expeditionTickets,
    expeditionRunsCompleted,
    activeExpeditionRun,
    expeditionNextRewardMultiplier,
    startExpeditionRun,
    resolveExpeditionRouteChoice,
    abandonExpeditionRun,
    finishExpedition,
    claimRewardedAd,
    rewardedAdClaims,
    rewardedAdMessage,
    armyReadiness,
    formationShapeId,
    wagonItems,
    buildingLevels,
    factionBuildingIds
  } = useGame();

  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const expeditionTitle =
    activeFaction === 'elf'
      ? 'Rootway Expedition'
      : activeFaction === 'orc'
        ? 'Warpath Expedition'
        : 'Iron Road Expedition';

  const preparation = useMemo(
    () =>
      getExpeditionPreparation({
        buildingLevels,
        buildingIds: {
          logistics:
            factionBuildingIds.logistics,
          supply:
            factionBuildingIds.supply
        },
        wagonItems
      }),
    [
      buildingLevels,
      factionBuildingIds.logistics,
      factionBuildingIds.supply,
      wagonItems
    ]
  );

  const currentShape =
    getFormationShape(formationShapeId);

  const currentChoices =
    activeExpeditionRun &&
    !activeExpeditionRun.failed &&
    !activeExpeditionRun.completed
      ? getExpeditionChoices(
          activeFaction,
          activeExpeditionRun.stageIndex
        )
      : [];

  const completionReward =
    activeExpeditionRun?.completed
      ? getExpeditionCompletionReward(
          activeExpeditionRun
        )
      : null;

  const routeProgress =
    activeExpeditionRun
      ? Math.min(
          1,
          activeExpeditionRun.stageIndex /
            expeditionStages.length
        )
      : 0;

  const chosenAtStage = (
    stageIndex: number
  ) => {
    if (!activeExpeditionRun) return null;
    const choiceId =
      activeExpeditionRun.path[stageIndex];
    if (!choiceId) return null;

    const choice =
      getExpeditionChoice(choiceId);
    return choice
      ? choice.names[activeFaction]
      : null;
  };

  const resolve = (
    choiceId: string
  ) => {
    resolveExpeditionRouteChoice(
      choiceId
    );
  };

  const finish = () => {
    if (finishExpedition()) {
      onExit();
    }
  };

  const failAndExit = () => {
    abandonExpeditionRun();
    onExit();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        eyebrow={
          activeExpeditionRun
            ? 'ROGUELITE RUN'
            : 'OPTIONAL MODE'
        }
        title={expeditionTitle}
        body={
          activeExpeditionRun
            ? 'The route is active. Army power, formation shape and Wagon preparation were locked when you departed; Readiness and temporary bonuses now carry through every node.'
            : 'Choose a branching five-node route. Harder branches offer better unsecured loot, but only defeating the route boss banks the full haul.'
        }
        accent={factionAccent}
        status={
          <StatusPill
            label={
              activeExpeditionRun
                ? activeExpeditionRun.completed
                  ? 'BOSS DEFEATED'
                  : activeExpeditionRun.failed
                    ? 'RUN FAILED'
                    : 'RUN ACTIVE'
                : String(expeditionTickets) +
                  (expeditionTickets === 1
                    ? ' TICKET'
                    : ' TICKETS')
            }
            tone={
              activeExpeditionRun?.completed
                ? 'done'
                : activeExpeditionRun?.failed
                  ? 'elite'
                  : activeExpeditionRun
                    ? 'current'
                    : expeditionTickets > 0
                      ? 'available'
                      : 'locked'
            }
          />
        }
      />

      {!activeExpeditionRun ? (
        <>
          <SectionTitle
            title="Departure Prep"
            trailing={
              expeditionRunsCompleted +
              (expeditionRunsCompleted === 1
                ? ' clear'
                : ' clears')
            }
          />

          <GameCard
            faction={activeFaction}
            accent={factionAccent}
          >
            <View style={styles.rewardBand}>
              <StatusPill
                label={getSideModeRewardLabel(
                  expeditionNextRewardMultiplier
                )}
                tone={
                  expeditionNextRewardMultiplier === 1
                    ? 'ready'
                    : expeditionNextRewardMultiplier === 0.5
                      ? 'current'
                      : 'neutral'
                }
              />
              <Text style={[styles.rewardBandText, { color: theme.colors.textMuted }]}>
                {expeditionNextRewardMultiplier === 1
                  ? 'First rewarded clear this chapter uses full payout and consumes a ticket.'
                  : expeditionNextRewardMultiplier === 0.5
                    ? 'Second rewarded clear pays 50% and consumes a ticket.'
                    : 'Further runs are free practice: no ticket consumed and no resources banked.'}
              </Text>
            </View>

            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  READINESS
                </Text>
                <Text
                  style={[
                    styles.metricValue,
                    {
                      color:
                        armyReadiness >= 70
                          ? theme.colors.primary
                          : theme.colors.gold
                    }
                  ]}
                >
                  {armyReadiness}%
                </Text>
              </View>
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  FORMATION
                </Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: theme.colors.text }
                  ]}
                >
                  {currentShape.layout}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  FIELD SUPPLIES
                </Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: theme.colors.gold }
                  ]}
                >
                  {preparation.initialSupplies}
                </Text>
              </View>
            </View>

            <View style={styles.bonusGrid}>
              {preparation.bonuses.map(
                bonus => (
                  <View
                    key={
                      bonus.label +
                      bonus.value
                    }
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
                    <Text
                      style={[
                        styles.bonusLabel,
                        {
                          color:
                            theme.colors.textMuted
                        }
                      ]}
                    >
                      {bonus.label}
                    </Text>
                    <Text
                      style={[
                        styles.bonusValue,
                        {
                          color:
                            theme.colors.text
                        }
                      ]}
                    >
                      {bonus.value}
                    </Text>
                  </View>
                )
              )}
            </View>

            <Text
              style={[
                styles.note,
                { color: theme.colors.textMuted }
              ]}
            >
              Once the expedition starts, this
              loadout is frozen for the run.
              Temporary route bonuses can improve
              it, but backing out cannot swap in a
              stronger formation or Wagon.
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
            title="Route Structure"
            trailing="5 stages"
          />
          {expeditionStages.map(
            (stage, index) => (
              <GameCard
                key={stage.id}
                faction={activeFaction}
                ornament={false}
              >
                <View style={styles.nodeRow}>
                  <View
                    style={[
                      styles.nodeMark,
                      {
                        borderColor:
                          theme.colors.border
                      }
                    ]}
                  >
                    <CampaignNodeSprite
                      type={stage.type}
                      faction={activeFaction}
                      active={index === 0}
                      size={28}
                    />
                  </View>
                  <View style={styles.nodeCopy}>
                    <Text
                      style={[
                        styles.nodeType,
                        {
                          color:
                            theme.colors.textMuted
                        }
                      ]}
                    >
                      STAGE {index + 1} ·{' '}
                      {stage.type.toUpperCase()}
                    </Text>
                    <Text
                      style={[
                        styles.nodeName,
                        {
                          color:
                            theme.colors.text
                        }
                      ]}
                    >
                      {stage.title}
                    </Text>
                    <Text
                      style={[
                        styles.nodeSummary,
                        {
                          color:
                            theme.colors.textMuted
                        }
                      ]}
                    >
                      {stage.summary}
                    </Text>
                  </View>
                </View>
              </GameCard>
            )
          )}

          <PrimaryButton
            label={
              expeditionNextRewardMultiplier === 0
                ? 'Start Practice Expedition'
                : expeditionTickets > 0
                  ? 'Depart on Expedition'
                  : 'No tickets available'
            }
            disabled={
              expeditionNextRewardMultiplier > 0 &&
              expeditionTickets <= 0
            }
            onPress={startExpeditionRun}
          />
          {expeditionNextRewardMultiplier > 0 ? (
            <SecondaryButton
              label={
                (
                  rewardedAdClaims
                    .expedition_ticket ?? 0
                ) >= 1
                  ? 'Extra ticket claimed'
                  : 'Watch optional ad for +1 ticket'
              }
              disabled={
                (
                  rewardedAdClaims
                    .expedition_ticket ?? 0
                ) >= 1
              }
              onPress={() =>
                void claimRewardedAd(
                  'expedition_ticket'
                )
              }
            />
          ) : null}
        </>
      ) : (
        <>
          <GameCard
            faction={activeFaction}
            accent={factionAccent}
          >
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  READINESS
                </Text>
                <Text
                  style={[
                    styles.metricValue,
                    {
                      color:
                        activeExpeditionRun.readiness >=
                        70
                          ? theme.colors.primary
                          : theme.colors.gold
                    }
                  ]}
                >
                  {
                    activeExpeditionRun.readiness
                  }
                  %
                </Text>
              </View>
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  FIELD SUPPLIES
                </Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: theme.colors.gold }
                  ]}
                >
                  {
                    activeExpeditionRun.supplies
                  }
                </Text>
              </View>
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  RUN POWER
                </Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: theme.colors.text }
                  ]}
                >
                  +
                  {Math.round(
                    activeExpeditionRun.powerBonus *
                      100
                  )}
                  %
                </Text>
              </View>
            </View>
            <ProgressBar
              value={routeProgress}
              color={factionAccent}
            />
          </GameCard>

          <SectionTitle
            title="Route"
            trailing={
              activeExpeditionRun.completed
                ? 'Complete'
                : activeExpeditionRun.failed
                  ? 'Failed'
                  : 'Stage ' +
                    (
                      activeExpeditionRun.stageIndex +
                      1
                    ) +
                    ' / ' +
                    expeditionStages.length
            }
          />

          <View style={styles.route}>
            {expeditionStages.map(
              (stage, index) => {
                const completed =
                  index <
                  activeExpeditionRun.stageIndex;
                const current =
                  !activeExpeditionRun.failed &&
                  !activeExpeditionRun.completed &&
                  index ===
                    activeExpeditionRun.stageIndex;
                const chosen =
                  chosenAtStage(index);

                return (
                  <GameCard
                    key={stage.id}
                    faction={activeFaction}
                    state={
                      completed
                        ? 'ready'
                        : current
                          ? 'selected'
                          : 'locked'
                    }
                    accent={
                      completed
                        ? theme.colors.primary
                        : current
                          ? theme.colors.gold
                          : undefined
                    }
                  >
                    <View style={styles.nodeRow}>
                      <View
                        style={[
                          styles.nodeMark,
                          {
                            borderColor:
                              completed
                                ? theme.colors.primary
                                : current
                                  ? theme.colors.gold
                                  : theme.colors.border
                          }
                        ]}
                      >
                        <CampaignNodeSprite
                          type={stage.type}
                          faction={activeFaction}
                          active={
                            completed || current
                          }
                          size={28}
                        />
                      </View>
                      <View
                        style={styles.nodeCopy}
                      >
                        <Text
                          style={[
                            styles.nodeType,
                            {
                              color:
                                theme.colors
                                  .textMuted
                            }
                          ]}
                        >
                          {stage.type.toUpperCase()}
                        </Text>
                        <Text
                          style={[
                            styles.nodeName,
                            {
                              color:
                                theme.colors.text
                            }
                          ]}
                        >
                          {chosen ??
                            stage.title}
                        </Text>
                      </View>
                      <StatusPill
                        label={
                          completed
                            ? 'DONE'
                            : current
                              ? 'CURRENT'
                              : 'AHEAD'
                        }
                        tone={
                          completed
                            ? 'done'
                            : current
                              ? 'current'
                              : 'locked'
                        }
                      />
                    </View>
                  </GameCard>
                );
              }
            )}
          </View>

          {activeExpeditionRun.lastSummary ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.message,
                {
                  color:
                    activeExpeditionRun.failed
                      ? theme.colors.danger
                      : theme.colors.gold
                }
              ]}
            >
              {
                activeExpeditionRun.lastSummary
              }
            </Text>
          ) : null}

          {activeExpeditionRun.failed ? (
            <GameCard
              faction={activeFaction}
              state="danger"
              accent={theme.colors.danger}
            >
              <Text
                style={[
                  styles.failTitle,
                  { color: theme.colors.text }
                ]}
              >
                Expedition Failed
              </Text>
              <Text
                style={[
                  styles.failBody,
                  {
                    color:
                      theme.colors.textMuted
                  }
                ]}
              >
                The ticket is spent and combat
                Readiness loss remains. Route loot
                was unsecured, so it is not paid
                out.
              </Text>
              <View style={styles.unsecured}>
                <Text
                  style={[
                    styles.rewardTitle,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  Unsecured loot lost
                </Text>
                <ResourceAmountRow
                  values={
                    activeExpeditionRun.loot
                  }
                />
              </View>
              <View style={styles.button}>
                <PrimaryButton
                  label="End Expedition"
                  onPress={failAndExit}
                />
              </View>
            </GameCard>
          ) : activeExpeditionRun.completed ? (
            <GameCard
              faction={activeFaction}
              state="ready"
              accent={theme.colors.primary}
            >
              <View style={styles.finishHeader}>
                <View
                  style={styles.headerCopy}
                >
                  <Text
                    style={[
                      styles.finishTitle,
                      { color: theme.colors.text }
                    ]}
                  >
                    Route Boss Defeated
                  </Text>
                  <Text
                    style={[
                      styles.failBody,
                      {
                        color:
                          theme.colors.textMuted
                      }
                    ]}
                  >
                    {activeExpeditionRun.rewardMultiplier > 0
                      ? 'The expedition haul is secured. Claiming it advances regional production one cycle.'
                      : 'Practice run complete. The route is recorded, but no resources or regional production are awarded.'}
                  </Text>
                </View>
                <StatusPill
                  label="SECURED"
                  tone="done"
                />
              </View>
              {completionReward ? (
                <View style={styles.rewardRow}>
                  <ResourceAmountRow
                    prefix="+"
                    values={completionReward}
                  />
                </View>
              ) : null}
              <View style={styles.button}>
                <PrimaryButton
                  label="Secure Loot & Return"
                  onPress={finish}
                />
              </View>
            </GameCard>
          ) : (
            <>
              <SectionTitle
                title={
                  expeditionStages[
                    activeExpeditionRun
                      .stageIndex
                  ]?.title ??
                  'Choose Route'
                }
                trailing={
                  currentChoices.length +
                  (currentChoices.length === 1
                    ? ' option'
                    : ' options')
                }
              />

              {currentChoices.map(choice => {
                const combat =
                  choice.type === 'battle' ||
                  choice.type === 'elite' ||
                  choice.type === 'boss';
                const threat =
                  combat
                    ? getExpeditionThreat(
                        choice,
                        activeExpeditionRun
                          .wagonStageId
                      )
                    : null;
                const effective =
                  combat &&
                  choice.formationShapeId
                    ? getExpeditionEffectivePower({
                        basePower:
                          activeExpeditionRun
                            .basePower,
                        playerShapeId:
                          activeExpeditionRun
                            .playerShapeId,
                        enemyShapeId:
                          choice.formationShapeId,
                        readiness:
                          activeExpeditionRun
                            .readiness,
                        powerBonus:
                          activeExpeditionRun
                            .powerBonus
                      })
                    : null;
                const enemyShape =
                  choice.formationShapeId
                    ? getFormationShape(
                        choice.formationShapeId
                      )
                    : null;
                const canAfford =
                  activeExpeditionRun.supplies >=
                  (choice.supplyCost ?? 0);
                const hasLoot = Object.values(
                  choice.loot ?? {}
                ).some(
                  value => (value ?? 0) > 0
                );

                return (
                  <GameCard
                    key={choice.id}
                    faction={activeFaction}
                    accent={
                      choice.type === 'boss' ||
                      choice.type === 'elite'
                        ? theme.colors.gold
                        : factionAccent
                    }
                  >
                    <View
                      style={styles.choiceHeader}
                    >
                      <View
                        style={styles.headerCopy}
                      >
                        <Text
                          style={[
                            styles.choiceName,
                            {
                              color:
                                theme.colors.text
                            }
                          ]}
                        >
                          {choice.name}
                        </Text>
                        <Text
                          style={[
                            styles.choiceBody,
                            {
                              color:
                                theme.colors
                                  .textMuted
                            }
                          ]}
                        >
                          {choice.description}
                        </Text>
                      </View>
                      <StatusPill
                        label={choice.type.toUpperCase()}
                        tone={
                          choice.type === 'boss'
                            ? 'boss'
                            : choice.type === 'elite'
                              ? 'elite'
                              : choice.type === 'supply'
                                ? 'ready'
                                : 'available'
                        }
                      />
                    </View>

                    {combat &&
                    enemyShape &&
                    effective &&
                    threat !== null ? (
                      <View
                        style={[
                          styles.intel,
                          {
                            borderColor:
                              theme.colors.border,
                            backgroundColor:
                              theme.colors.surface2
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.intelLabel,
                            {
                              color:
                                factionAccent
                            }
                          ]}
                        >
                          ENEMY FORMATION
                        </Text>
                        <Text
                          style={[
                            styles.intelValue,
                            {
                              color:
                                theme.colors.text
                            }
                          ]}
                        >
                          {enemyShape.layout} ·{' '}
                          {enemyShape.name}
                        </Text>
                        <Text
                          style={[
                            styles.intelBody,
                            {
                              color:
                                theme.colors
                                  .textMuted
                            }
                          ]}
                        >
                          {effective.matchup.summary}
                        </Text>
                        <View
                          style={styles.powerRow}
                        >
                          <Text
                            style={[
                              styles.powerText,
                              {
                                color:
                                  effective.value >=
                                  threat
                                    ? theme.colors
                                        .primary
                                    : theme.colors
                                        .gold
                              }
                            ]}
                          >
                            Power {effective.value}
                          </Text>
                          <Text
                            style={[
                              styles.powerText,
                              {
                                color:
                                  theme.colors.danger
                              }
                            ]}
                          >
                            Threat {threat}
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    <View
                      style={styles.effectRow}
                    >
                      {(choice.supplyCost ?? 0) >
                      0 ? (
                        <StatusPill
                          label={
                            '-' +
                            choice.supplyCost +
                            ' SUPPLY'
                          }
                          tone={
                            canAfford
                              ? 'current'
                              : 'locked'
                          }
                        />
                      ) : null}
                      {(choice.supplyDelta ?? 0) >
                      0 ? (
                        <StatusPill
                          label={
                            '+' +
                            choice.supplyDelta +
                            ' SUPPLY'
                          }
                          tone="ready"
                        />
                      ) : null}
                      {(choice.readinessDelta ??
                        0) !== 0 ? (
                        <StatusPill
                          label={
                            (
                              (choice.readinessDelta ??
                                0) > 0
                                ? '+'
                                : ''
                            ) +
                            choice.readinessDelta +
                            ' READINESS'
                          }
                          tone={
                            (
                              choice.readinessDelta ??
                              0
                            ) > 0
                              ? 'ready'
                              : 'elite'
                          }
                        />
                      ) : null}
                      {(choice.powerBonusDelta ??
                        0) > 0 ? (
                        <StatusPill
                          label={
                            '+' +
                            Math.round(
                              (
                                choice.powerBonusDelta ??
                                0
                              ) * 100
                            ) +
                            '% RUN POWER'
                          }
                          tone="available"
                        />
                      ) : null}
                    </View>

                    {hasLoot ? (
                      <View
                        style={styles.lootRow}
                      >
                        <Text
                          style={[
                            styles.rewardTitle,
                            {
                              color:
                                theme.colors
                                  .textMuted
                            }
                          ]}
                        >
                          Unsecured route loot
                        </Text>
                        <ResourceAmountRow
                          prefix="+"
                          values={
                            choice.loot ?? {}
                          }
                        />
                      </View>
                    ) : null}

                    <View style={styles.button}>
                      <PrimaryButton
                        label={
                          canAfford
                            ? combat
                              ? 'Take Route & Fight'
                              : 'Choose This Route'
                            : 'Not Enough Field Supplies'
                        }
                        disabled={!canAfford}
                        onPress={() =>
                          resolve(choice.id)
                        }
                      />
                    </View>
                  </GameCard>
                );
              })}

              <SecondaryButton
                label="Return to Campaign · Run Saved"
                onPress={onExit}
              />
            </>
          )}
        </>
      )}

      {rewardedAdMessage ? (
        <Text
          style={[
            styles.adMessage,
            { color: theme.colors.textMuted }
          ]}
        >
          {rewardedAdMessage}
        </Text>
      ) : null}
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
    gap: 7,
    marginBottom: 12
  },
  rewardBandText: {
    fontSize: 10.5,
    lineHeight: 16
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  metric: {
    flex: 1
  },
  metricLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2
  },
  bonusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10
  },
  bonus: {
    minWidth: '45%',
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
    marginTop: 10
  },
  actions: {
    gap: 8,
    marginTop: 12
  },
  route: {
    gap: 7
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  nodeMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nodeCopy: {
    flex: 1
  },
  nodeType: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  nodeName: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2
  },
  nodeSummary: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4
  },
  message: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800'
  },
  choiceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  headerCopy: {
    flex: 1
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
    gap: 10,
    marginTop: 9
  },
  powerText: {
    fontSize: 11,
    fontWeight: '900'
  },
  effectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10
  },
  lootRow: {
    marginTop: 11,
    gap: 6
  },
  rewardTitle: {
    fontSize: 10,
    fontWeight: '900'
  },
  button: {
    marginTop: 12
  },
  failTitle: {
    fontSize: 18,
    fontWeight: '900'
  },
  failBody: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5
  },
  unsecured: {
    gap: 6,
    marginTop: 10
  },
  finishHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  finishTitle: {
    fontSize: 18,
    fontWeight: '900'
  },
  rewardRow: {
    marginTop: 10
  },
  adMessage: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center'
  }
});
