import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  getRelicAffinitySnapshot,
  getRelicEffectivePower,
  getRelicGuardianThreat,
  relicGuardianStages,
  relicRewards
} from '../game/relicHunts';
import { getFormationShape } from '../game/formation';
import { getEquipment } from '../game/equipment';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  PrimaryButton,
  ProgressBar,
  ScreenHero,
  SecondaryButton,
  SectionTitle,
  StatusPill
} from '../ui/components';
import { RarityChip } from '../ui/SemanticUI';
import {
  EquipmentSprite,
  RelicGuardianSprite
} from '../ui/gameArt';

export function RelicHuntScreen({
  onEditFormation,
  onExit
}: {
  onEditFormation: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    units,
    formation,
    activeRelicHuntRun,
    relicHuntRunsCompleted,
    relicHuntRewardClaimed,
    relicCollectionClaimedFactions,
    equipmentInventory,
    unitEquipment,
    equipEquipment,
    startRelicHuntRun,
    resolveRelicHuntStage,
    abandonRelicHuntRun,
    finishRelicHuntRun,
    armyReadiness
  } = useGame();

  const accent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const activeUnits = useMemo(
    () =>
      formation
        .filter(
          (id): id is string =>
            Boolean(id)
        )
        .map(id =>
          units.find(unit => unit.id === id)
        )
        .filter(
          (unit): unit is NonNullable<typeof unit> =>
            Boolean(unit)
        ),
    [formation, units]
  );

  const currentAffinities = useMemo(
    () =>
      getRelicAffinitySnapshot(
        activeUnits
      ),
    [activeUnits]
  );

  const reward =
    relicRewards[activeFaction];
  const artifact =
    getEquipment(reward.artifactId);
  const [justClaimed, setJustClaimed] =
    useState(false);
  const [equipMessage, setEquipMessage] =
    useState<string | null>(null);

  const recommendedRelicUnit = useMemo(() => {
    const deployed = activeUnits.filter(
      unit => unit.faction === activeFaction
    );
    const candidates =
      deployed.length > 0
        ? deployed
        : units.filter(
            unit => unit.faction === activeFaction
          );

    return candidates.reduce<
      (typeof candidates)[number] | null
    >((best, candidate) => {
      if (!best) return candidate;
      const bestPower =
        best.attack + best.armor + best.speed;
      const candidatePower =
        candidate.attack +
        candidate.armor +
        candidate.speed;
      return candidatePower > bestPower
        ? candidate
        : best;
    }, null);
  }, [activeFaction, activeUnits, units]);

  const equippedRelicUnit =
    units.find(
      unit =>
        unitEquipment[unit.id]?.artifact ===
        reward.artifactId
    ) ?? null;
  const relicInInventory =
    equipmentInventory.includes(
      reward.artifactId
    );

  const currentStage =
    activeRelicHuntRun &&
    !activeRelicHuntRun.failed &&
    !activeRelicHuntRun.completed
      ? relicGuardianStages[
          activeRelicHuntRun.stageIndex
        ]
      : null;

  const currentThreat =
    activeRelicHuntRun &&
    currentStage
      ? getRelicGuardianThreat(
          currentStage,
          activeRelicHuntRun.wagonStageId
        )
      : null;

  const currentPower =
    activeRelicHuntRun &&
    currentStage
      ? getRelicEffectivePower({
          basePower:
            activeRelicHuntRun.basePower,
          playerShapeId:
            activeRelicHuntRun.playerShapeId,
          stage: currentStage,
          readiness:
            activeRelicHuntRun.readiness,
          affinities:
            activeRelicHuntRun.affinities
        })
      : null;

  const progress =
    activeRelicHuntRun
      ? Math.min(
          1,
          activeRelicHuntRun.stageIndex /
            relicGuardianStages.length
        )
      : 0;

  const totalFantasy =
    currentAffinities.magic +
    currentAffinities.flying +
    currentAffinities.large;

  const finish = () => {
    const firstClear = !relicHuntRewardClaimed;
    if (finishRelicHuntRun()) {
      if (firstClear) {
        setJustClaimed(true);
        setEquipMessage(null);
      } else {
        onExit();
      }
    }
  };

  const equipRelicToRecommended = () => {
    if (!recommendedRelicUnit) {
      setEquipMessage('No eligible squad is available.');
      return;
    }
    setEquipMessage(
      equipEquipment(
        recommendedRelicUnit.id,
        reward.artifactId
      )
        ? 'Equipped to ' +
          recommendedRelicUnit.className +
          '.'
        : 'Could not equip the Relic.'
    );
  };

  const failAndExit = () => {
    abandonRelicHuntRun();
    onExit();
  };

  if (justClaimed) {
    return (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHero
          eyebrow="FIRST-CLEAR REWARD"
          title="Relic Earned"
          body="Your unique artifact is now in inventory. Equip it now, or leave it there for later."
          accent={theme.colors.gold}
          status={
            <StatusPill
              label="NEW RELIC"
              tone="done"
            />
          }
        />

        <GameCard
          faction={activeFaction}
          state="ready"
          accent={theme.colors.gold}
        >
          <View style={styles.rewardHeader}>
            <View
              style={[
                styles.rewardArt,
                {
                  borderColor: theme.colors.info,
                  backgroundColor:
                    theme.colors.surface2
                }
              ]}
            >
              <EquipmentSprite
                equipmentId={reward.artifactId}
                faction={activeFaction}
                size={56}
              />
            </View>
            <View style={styles.stageCopy}>
              <Text
                style={[
                  styles.rewardName,
                  { color: theme.colors.text }
                ]}
              >
                {reward.artifactName}
              </Text>
              <View style={styles.rewardBadges}>
                <RarityChip rarity={artifact?.rarity} />
                <StatusPill
                  label="ARTIFACT"
                  tone="current"
                />
              </View>
            </View>
          </View>

          {artifact ? (
            <Text
              style={[
                styles.rewardStats,
                { color: theme.colors.info }
              ]}
            >
              +{artifact.attackBonus} ATK · +{artifact.armorBonus} ARM · +{artifact.speedBonus} SPD
            </Text>
          ) : null}

          <Text
            style={[
              styles.note,
              { color: theme.colors.textMuted }
            ]}
          >
            {recommendedRelicUnit
              ? 'Best fit: ' +
                recommendedRelicUnit.className +
                '. Ranked by current ATK + ARM + SPD, prioritizing deployed squads.'
              : 'No deployed squad is available. The Relic will stay safely in inventory.'}
          </Text>

          <View style={styles.actions}>
            <PrimaryButton
              label={
                equippedRelicUnit
                  ? 'Equipped to ' +
                    equippedRelicUnit.className
                  : recommendedRelicUnit
                    ? 'Equip to ' +
                      recommendedRelicUnit.className
                    : 'No squad available'
              }
              disabled={
                Boolean(equippedRelicUnit) ||
                !recommendedRelicUnit ||
                !relicInInventory
              }
              onPress={equipRelicToRecommended}
            />
            {equipMessage ? (
              <Text
                style={[
                  styles.note,
                  {
                    color: equippedRelicUnit
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }
                ]}
              >
                {equipMessage}
              </Text>
            ) : null}
            <SecondaryButton
              label={
                equippedRelicUnit
                  ? 'Return to Activities'
                  : 'Not now · Return'
              }
              onPress={onExit}
            />
          </View>
        </GameCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        eyebrow="LATE-GAME MASTERY"
        title="Relic Hunt"
        body={
          activeRelicHuntRun
            ? 'The chain is active. Formation, army strength and fantasy-family counters were locked when the hunt began. Readiness carries across all three guardians.'
            : 'Track a relic through three escalating guardians. These encounters are built around fantasy-unit counters rather than general resource farming.'
        }
        accent={accent}
        status={
          <StatusPill
            label={
              activeRelicHuntRun
                ? activeRelicHuntRun.completed
                  ? 'RELIC SECURED'
                  : activeRelicHuntRun.failed
                    ? 'CHAIN BROKEN'
                    : 'HUNT ACTIVE'
                : relicHuntRewardClaimed
                  ? 'PRACTICE'
                  : 'UNIQUE REWARD'
            }
            tone={
              activeRelicHuntRun?.completed
                ? 'done'
                : activeRelicHuntRun?.failed
                  ? 'elite'
                  : activeRelicHuntRun
                    ? 'current'
                    : relicHuntRewardClaimed
                      ? 'neutral'
                      : 'available'
            }
          />
        }
      />

      {!activeRelicHuntRun ? (
        <>
          <SectionTitle
            title="Relic Loadout"
            trailing={
              relicHuntRunsCompleted +
              (relicHuntRunsCompleted === 1
                ? ' clear'
                : ' clears')
            }
          />

          <GameCard
            faction={activeFaction}
            accent={accent}
          >
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.label,
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
                    styles.value,
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
                    styles.label,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  FANTASY SQUADS
                </Text>
                <Text
                  style={[
                    styles.value,
                    {
                      color:
                        totalFantasy > 0
                          ? theme.colors.gold
                          : theme.colors.textMuted
                    }
                  ]}
                >
                  {totalFantasy}
                </Text>
              </View>
            </View>

            <View style={styles.affinityGrid}>
              {(
                [
                  ['MAGIC', currentAffinities.magic],
                  ['FLYING', currentAffinities.flying],
                  ['LARGE', currentAffinities.large],
                  ['HYBRID', currentAffinities.hybrid]
                ] as const
              ).map(([label, count]) => (
                <View
                  key={label}
                  style={[
                    styles.affinity,
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
                      styles.affinityLabel,
                      {
                        color:
                          theme.colors.textMuted
                      }
                    ]}
                  >
                    {label}
                  </Text>
                  <Text
                    style={[
                      styles.affinityValue,
                      {
                        color:
                          count > 0
                            ? accent
                            : theme.colors.textMuted
                      }
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              style={[
                styles.note,
                { color: theme.colors.textMuted }
              ]}
            >
              Magic is the first reliable counter.
              Flying helps heavily against the
              second guardian. Large units,
              multiple fantasy families and
              legendary hybrids are strongest
              against the final guardian.
            </Text>

            {totalFantasy === 0 ? (
              <Text
                style={[
                  styles.warning,
                  { color: theme.colors.gold }
                ]}
              >
                Your current formation contains no
                fantasy squad. The hunt can still
                be attempted, but the guardians
                are intentionally tuned to punish
                a purely conventional army.
              </Text>
            ) : null}

            <View style={styles.actions}>
              <SecondaryButton
                label="Edit Formation"
                onPress={onEditFormation}
              />
            </View>
          </GameCard>

          <SectionTitle
            title="Guardian Chain"
            trailing="3 encounters"
          />

          {relicGuardianStages.map(
            (stage, index) => (
              <GameCard
                key={stage.id}
                faction={activeFaction}
                ornament={false}
              >
                <View style={styles.stageRow}>
                  <View
                    style={[
                      styles.guardianIcon,
                      {
                        borderColor:
                          theme.colors.border,
                        backgroundColor:
                          theme.colors.surface2
                      }
                    ]}
                  >
                    <RelicGuardianSprite
                      stageId={stage.id as 'rune_sentinel' | 'sky_keeper' | 'relic_guardian'}
                      faction={activeFaction}
                      size={54}
                    />
                  </View>
                  <View style={styles.stageCopy}>
                    <Text
                      style={[
                        styles.stageEyebrow,
                        {
                          color:
                            theme.colors.textMuted
                        }
                      ]}
                    >
                      GUARDIAN {index + 1}
                    </Text>
                    <Text
                      style={[
                        styles.stageTitle,
                        {
                          color:
                            theme.colors.text
                        }
                      ]}
                    >
                      {stage.name[activeFaction]}
                    </Text>
                    <Text
                      style={[
                        styles.stageBody,
                        {
                          color:
                            theme.colors.textMuted
                        }
                      ]}
                    >
                      {stage.description}
                    </Text>
                  </View>
                  <StatusPill
                    label={
                      stage.primaryFamily.toUpperCase()
                    }
                    tone="current"
                  />
                </View>
              </GameCard>
            )
          )}

          <SectionTitle
            title="First-Clear Reward"
            trailing={
              relicHuntRewardClaimed
                ? 'Claimed'
                : 'Unique'
            }
          />

          <GameCard
            faction={activeFaction}
            accent={theme.colors.gold}
          >
            <View style={styles.rewardHeader}>
              <View
                style={[
                  styles.rewardArt,
                  {
                    borderColor:
                      theme.colors.info,
                    backgroundColor:
                      theme.colors.surface2
                  }
                ]}
              >
                <EquipmentSprite
                  equipmentId={reward.artifactId}
                  faction={activeFaction}
                  size={48}
                />
              </View>
              <View style={styles.stageCopy}>
                <Text
                  style={[
                    styles.rewardName,
                    { color: theme.colors.text }
                  ]}
                >
                  {reward.artifactName}
                </Text>
                <View style={styles.rewardBadges}>
                  <RarityChip
                    rarity={artifact?.rarity}
                  />
                  <StatusPill
                    label="ARTIFACT SLOT"
                    tone="current"
                  />
                </View>
              </View>
            </View>
            {artifact ? (
              <Text
                style={[
                  styles.rewardStats,
                  { color: theme.colors.info }
                ]}
              >
                +{artifact.attackBonus} ATK · +{artifact.armorBonus} ARM · +{artifact.speedBonus} SPD
              </Text>
            ) : null}
            <Text
              style={[
                styles.stageBody,
                {
                  color:
                    theme.colors.textMuted
                }
              ]}
            >
              Also unlocks the account cosmetic
              “{reward.cosmeticName}”. The relic
              occupies the Artifact equipment slot
              and does not replace weapon, armor,
              shield or mount gear.
            </Text>
          </GameCard>

          <SectionTitle
            title="Relic Collection"
            trailing={
              relicCollectionClaimedFactions.length +
              '/3'
            }
          />
          <GameCard ornament={false}>
            <View style={styles.collectionList}>
              {(
                ['human', 'elf', 'orc'] as const
              ).map(faction => {
                const collected =
                  relicCollectionClaimedFactions.includes(
                    faction
                  );
                const relic =
                  relicRewards[faction];

                return (
                  <View
                    key={faction}
                    style={[
                      styles.collectionRow,
                      {
                        borderColor:
                          theme.colors.border
                      }
                    ]}
                  >
                    <EquipmentSprite
                      equipmentId={relic.artifactId}
                      faction={faction}
                      size={34}
                    />
                    <View style={styles.stageCopy}>
                      <Text
                        style={[
                          styles.collectionName,
                          {
                            color:
                              collected
                                ? theme.colors.info
                                : theme.colors.text
                          }
                        ]}
                      >
                        {relic.artifactName}
                      </Text>
                      <Text
                        style={[
                          styles.collectionFaction,
                          {
                            color:
                              theme.colors.textMuted
                          }
                        ]}
                      >
                        {faction.toUpperCase()}
                      </Text>
                    </View>
                    <StatusPill
                      label={
                        collected
                          ? 'COLLECTED'
                          : faction === activeFaction
                            ? 'AVAILABLE'
                            : 'OTHER FACTION'
                      }
                      tone={
                        collected
                          ? 'done'
                          : faction === activeFaction
                            ? 'available'
                            : 'locked'
                      }
                    />
                  </View>
                );
              })}
            </View>
          </GameCard>

          <PrimaryButton
            label={
              relicHuntRewardClaimed
                ? 'Begin Practice Relic Hunt'
                : 'Begin Relic Hunt'
            }
            onPress={startRelicHuntRun}
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
                <Text
                  style={[
                    styles.label,
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
                    styles.value,
                    {
                      color:
                        activeRelicHuntRun.readiness >= 70
                          ? theme.colors.primary
                          : theme.colors.gold
                    }
                  ]}
                >
                  {activeRelicHuntRun.readiness}%
                </Text>
              </View>
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  MAGIC
                </Text>
                <Text
                  style={[
                    styles.value,
                    { color: theme.colors.text }
                  ]}
                >
                  {
                    activeRelicHuntRun
                      .affinities.magic
                  }
                </Text>
              </View>
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  FLYING
                </Text>
                <Text
                  style={[
                    styles.value,
                    { color: theme.colors.text }
                  ]}
                >
                  {
                    activeRelicHuntRun
                      .affinities.flying
                  }
                </Text>
              </View>
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  LARGE
                </Text>
                <Text
                  style={[
                    styles.value,
                    { color: theme.colors.text }
                  ]}
                >
                  {
                    activeRelicHuntRun
                      .affinities.large
                  }
                </Text>
              </View>
            </View>
            <ProgressBar
              value={progress}
              color={accent}
            />
          </GameCard>

          <View style={styles.track}>
            {relicGuardianStages.map(
              (stage, index) => (
                <StatusPill
                  key={stage.id}
                  label={
                    String(index + 1) +
                    ' · ' +
                    stage.primaryFamily.toUpperCase()
                  }
                  tone={
                    index <
                    activeRelicHuntRun.stageIndex
                      ? 'done'
                      : index ===
                            activeRelicHuntRun.stageIndex &&
                          !activeRelicHuntRun.failed &&
                          !activeRelicHuntRun.completed
                        ? 'current'
                        : 'locked'
                  }
                />
              )
            )}
          </View>

          {activeRelicHuntRun.lastSummary ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.message,
                {
                  color:
                    activeRelicHuntRun.failed
                      ? theme.colors.danger
                      : theme.colors.gold
                }
              ]}
            >
              {
                activeRelicHuntRun
                  .lastSummary
              }
            </Text>
          ) : null}

          {activeRelicHuntRun.failed ? (
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
                The relic chain has broken
              </Text>
              <Text
                style={[
                  styles.note,
                  {
                    color:
                      theme.colors.textMuted
                  }
                ]}
              >
                Combat Readiness loss remains. No
                relic or cosmetic is awarded on a
                failed chain.
              </Text>
              <View style={styles.actions}>
                <PrimaryButton
                  label="End Relic Hunt"
                  onPress={failAndExit}
                />
              </View>
            </GameCard>
          ) : activeRelicHuntRun.completed ? (
            <GameCard
              faction={activeFaction}
              state="ready"
              accent={theme.colors.gold}
            >
              <View style={styles.completeHeader}>
                <View style={styles.stageCopy}>
                  <Text
                    style={[
                      styles.failTitle,
                      { color: theme.colors.text }
                    ]}
                  >
                    Relic secured
                  </Text>
                  <Text
                    style={[
                      styles.note,
                      {
                        color:
                          theme.colors.textMuted
                      }
                    ]}
                  >
                    {relicHuntRewardClaimed
                      ? 'This was a mastery replay. The unique reward was already claimed.'
                      : reward.artifactName +
                        ' and the ' +
                        reward.cosmeticName +
                        ' cosmetic are ready to claim.'}
                  </Text>
                </View>
                <StatusPill
                  label="3 / 3"
                  tone="done"
                />
              </View>
              <View style={styles.actions}>
                <PrimaryButton
                  label={
                    relicHuntRewardClaimed
                      ? 'Finish Practice Hunt'
                      : 'Claim Relic'
                  }
                  onPress={finish}
                />
              </View>
            </GameCard>
          ) : currentStage &&
            currentPower &&
            currentThreat !== null ? (
            <>
              <SectionTitle
                title={
                  currentStage.name[
                    activeFaction
                  ]
                }
                trailing={
                  'Guardian ' +
                  (
                    activeRelicHuntRun.stageIndex +
                    1
                  ) +
                  '/3'
                }
              />
              <GameCard
                faction={activeFaction}
                accent={
                  activeRelicHuntRun.stageIndex === 2
                    ? theme.colors.gold
                    : accent
                }
              >
                <View style={styles.guardianHero}>
                  <RelicGuardianSprite
                    stageId={currentStage.id as 'rune_sentinel' | 'sky_keeper' | 'relic_guardian'}
                    faction={activeFaction}
                    size={82}
                  />
                </View>
                <Text
                  style={[
                    styles.stageBody,
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  {currentStage.description}
                </Text>

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
                      styles.affinityLabel,
                      { color: accent }
                    ]}
                  >
                    GUARDIAN FORMATION
                  </Text>
                  <Text
                    style={[
                      styles.intelValue,
                      { color: theme.colors.text }
                    ]}
                  >
                    {
                      getFormationShape(
                        currentStage
                          .formationShapeId
                      ).layout
                    }{' '}
                    ·{' '}
                    {
                      getFormationShape(
                        currentStage
                          .formationShapeId
                      ).name
                    }
                  </Text>
                  <Text
                    style={[
                      styles.stageBody,
                      {
                        color:
                          theme.colors.textMuted
                      }
                    ]}
                  >
                    {currentPower.matchup.summary}
                  </Text>

                  <View style={styles.powerRow}>
                    <Text
                      style={[
                        styles.power,
                        {
                          color:
                            currentPower.value >=
                            currentThreat
                              ? theme.colors.primary
                              : theme.colors.gold
                        }
                      ]}
                    >
                      Hunt Power {currentPower.value}
                    </Text>
                    <Text
                      style={[
                        styles.power,
                        {
                          color:
                            theme.colors.danger
                        }
                      ]}
                    >
                      Threat {currentThreat}
                    </Text>
                  </View>
                </View>

                <View style={styles.chips}>
                  <StatusPill
                    label={
                      currentStage.primaryFamily.toUpperCase() +
                      ' COUNTER'
                    }
                    tone="current"
                  />
                  {currentStage.secondaryFamily ? (
                    <StatusPill
                      label={
                        currentStage.secondaryFamily.toUpperCase() +
                        ' SUPPORT'
                      }
                      tone="available"
                    />
                  ) : null}
                  <StatusPill
                    label={
                      '+' +
                      Math.round(
                        (
                          currentPower
                            .counterMultiplier -
                          1
                        ) * 100
                      ) +
                      '% FANTASY EDGE'
                    }
                    tone={
                      currentPower.counterMultiplier >
                      1
                        ? 'ready'
                        : 'locked'
                    }
                  />
                </View>

                <View style={styles.actions}>
                  <PrimaryButton
                    label={
                      activeRelicHuntRun.stageIndex === 2
                        ? 'Challenge Final Guardian'
                        : 'Challenge Guardian'
                    }
                    onPress={
                      resolveRelicHuntStage
                    }
                  />
                </View>
              </GameCard>

              <SecondaryButton
                label="Return to Campaign · Hunt Saved"
                onPress={onExit}
              />
            </>
          ) : null}
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
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10
  },
  metric: {
    flexGrow: 1,
    minWidth: '21%'
  },
  label: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.7
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2
  },
  affinityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8
  },
  affinity: {
    minWidth: '22%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8
  },
  affinityLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.7
  },
  affinityValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2
  },
  note: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 10
  },
  warning: {
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 8
  },
  actions: {
    gap: 8,
    marginTop: 12
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  guardianIcon: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  guardianHero: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  stageCopy: {
    flex: 1
  },
  stageEyebrow: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  stageTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2
  },
  stageBody: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 5
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11
  },
  rewardArt: {
    width: 62,
    height: 62,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rewardBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5
  },
  rewardName: {
    fontSize: 18,
    fontWeight: '900'
  },
  rewardStats: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 5
  },
  collectionList: {
    gap: 8
  },
  collectionRow: {
    minHeight: 50,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 6
  },
  collectionName: {
    fontSize: 12,
    fontWeight: '900'
  },
  collectionFaction: {
    fontSize: 8.5,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: 0.6
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
  intel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 12
  },
  intelValue: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3
  },
  powerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10
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
