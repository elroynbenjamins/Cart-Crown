import React, {
  useMemo,
  useState
} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  applyKingdomDefenseChoice,
  getKingdomDefenseEffectivePower,
  getKingdomDefenseFortification,
  getKingdomDefenseReadinessLoss,
  getKingdomDefenseThreat,
  getKingdomDefenseWaves
} from '../game/kingdomDefense';
import type {
  KingdomDefenseChoiceId
} from '../game/kingdomDefense';
import { getFormationShape } from '../game/formation';
import { useGame } from '../game/GameProvider';
import {
  getSideModeRewardLabel,
  scaleResourceReward
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

export function KingdomDefenseScreen({
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
    units,
    formation,
    formationShapeId,
    formationAnalysis,
    activeCommanderPath,
    armyReadiness,
    wagonItems,
    currentWagonStage,
    buildingLevels,
    factionBuildingIds,
    settlementEffects,
    kingdomDefenseCompleted,
    kingdomDefenseNextRewardMultiplier,
    completeKingdomDefense,
    commitKingdomDefenseReadiness
  } = useGame();

  const [firstClearAtStart] =
    useState(!kingdomDefenseCompleted);
  const [repeatable] =
    useState(
      activeFaction !== 'human' ||
      kingdomDefenseCompleted
    );
  const [runRewardMultiplier] =
    useState(
      kingdomDefenseNextRewardMultiplier
    );
  const [started, setStarted] =
    useState(false);
  const [waveIndex, setWaveIndex] =
    useState(0);
  const [runReadiness, setRunReadiness] =
    useState(armyReadiness);
  const [betweenWaves, setBetweenWaves] =
    useState(false);
  const [failed, setFailed] =
    useState(false);
  const [complete, setComplete] =
    useState(false);
  const [nextWavePowerBonus, setNextWavePowerBonus] =
    useState(0);
  const [revealedWaves, setRevealedWaves] =
    useState<string[]>([]);
  const [message, setMessage] =
    useState<string | null>(null);

  const waves = getKingdomDefenseWaves(
    activeFaction,
    repeatable
  );

  const fortification = useMemo(
    () =>
      getKingdomDefenseFortification({
        buildingLevels,
        buildingIds: factionBuildingIds,
        wagonItems,
        settlementEffects
      }),
    [
      buildingLevels,
      factionBuildingIds,
      settlementEffects,
      wagonItems
    ]
  );

  const [reserve, setReserve] = useState(
    fortification.supplyReserve
  );

  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const defenseTitle =
    activeFaction === 'elf'
      ? 'Heartgrove Defense'
      : activeFaction === 'orc'
        ? 'Warhold Defense'
        : 'Kingdom Defense';

  const victoryTitle =
    activeFaction === 'elf'
      ? 'Heartgrove Holds'
      : activeFaction === 'orc'
        ? 'The Warhold Holds'
        : 'Greenkeep Holds';

  const baseDefensePower = useMemo(() => {
    const activeUnits = formation
      .filter(
        (unitId): unitId is string =>
          Boolean(unitId)
      )
      .map(unitId =>
        units.find(unit => unit.id === unitId)
      )
      .filter(
        (unit): unit is NonNullable<typeof unit> =>
          Boolean(unit)
      );

    // Unit stats already include equipped-item deltas when gear is assigned.
    const raw = activeUnits.reduce(
      (total, unit) =>
        total +
        unit.attack +
        unit.armor * 1.5 +
        unit.speed * 0.45,
      0
    );

    const command =
      activeCommanderPath
        ? 1 +
          (
            activeCommanderPath.attackMultiplier -
            1
          ) *
            0.45 +
          (
            activeCommanderPath.armorMultiplier -
            1
          ) *
            0.55
        : 1;

    return Math.round(
      raw *
        formationAnalysis.attackMultiplier *
        formationAnalysis.armorMultiplier *
        command
    );
  }, [
    activeCommanderPath,
    formation,
    formationAnalysis,
    units
  ]);

  const currentWave =
    waves[waveIndex] ??
    waves[waves.length - 1]!;

  const waveThreat = getKingdomDefenseThreat(
    currentWave,
    currentWagonStage.id,
    repeatable
  );

  const power = getKingdomDefenseEffectivePower({
    basePower: baseDefensePower,
    playerShapeId: formationShapeId,
    waveShapeId: currentWave.formationShapeId,
    readiness: runReadiness,
    fortificationMultiplier:
      fortification.powerMultiplier,
    nextWavePowerBonus
  });

  const enemyShape = getFormationShape(
    currentWave.formationShapeId
  );
  const hasIntel =
    waveIndex === 0 ||
    fortification.permanentIntel ||
    revealedWaves.includes(currentWave.id);

  const waveProgress =
    waves.length > 0
      ? waveIndex / waves.length
      : 0;

  const resolveWave = () => {
    if (
      !started ||
      failed ||
      complete ||
      betweenWaves
    ) {
      return;
    }

    const success =
      power.value >= waveThreat;
    const readinessLoss =
      getKingdomDefenseReadinessLoss({
        wave: currentWave,
        effectivePower: power.value,
        threat: waveThreat,
        hasRations:
          fortification.hasRations,
        hasMedicine:
          fortification.hasMedicine
      });
    const nextReadiness = Math.max(
      0,
      runReadiness - readinessLoss
    );

    setRunReadiness(nextReadiness);
    commitKingdomDefenseReadiness(
      nextReadiness
    );
    setNextWavePowerBonus(0);

    if (!success) {
      setFailed(true);
      setMessage(
        'The line broke on wave ' +
          (waveIndex + 1) +
          '. The army leaves the attempt at ' +
          nextReadiness +
          '% Readiness.'
      );
      return;
    }

    if (waveIndex >= waves.length - 1) {
      const ok = completeKingdomDefense();
      setComplete(ok);
      setMessage(
        ok
          ? 'Every wave has been repelled.'
          : 'The defense could not be recorded.'
      );
      return;
    }

    setWaveIndex(previous => previous + 1);
    setBetweenWaves(true);
    setMessage(
      'Wave cleared. Readiness fell by ' +
        readinessLoss +
        ' to ' +
        nextReadiness +
        '%. Choose one preparation before the next attack.'
    );
  };

  const chooseBetweenWave = (
    choice: KingdomDefenseChoiceId
  ) => {
    const choiceResult =
      applyKingdomDefenseChoice({
        choice,
        reserve,
        readiness: runReadiness,
        fortification
      });

    if (!choiceResult) {
      setMessage(
        'Not enough field supplies for that preparation.'
      );
      return;
    }

    setReserve(choiceResult.reserve);
    setRunReadiness(
      choiceResult.readiness
    );
    setNextWavePowerBonus(
      choiceResult.nextWavePowerBonus
    );

    if (choiceResult.revealNextWave) {
      setRevealedWaves(previous =>
        previous.includes(currentWave.id)
          ? previous
          : [
              ...previous,
              currentWave.id
            ]
      );
    }

    setBetweenWaves(false);
    setMessage(choiceResult.summary);
  };

  const choiceCards: Array<{
    id: KingdomDefenseChoiceId;
    title: string;
    cost: number;
    body: string;
  }> = [
    {
      id: 'rest',
      title: 'Rest & Treat',
      cost: 2,
      body:
        'Spend field stores to restore Readiness. Medicine improves the recovery.'
    },
    {
      id: 'reinforce',
      title: 'Reinforce Works',
      cost: 1,
      body:
        'Prepare the defenses for one wave. A packed Repair Kit increases the bonus.'
    },
    {
      id: 'scout',
      title: 'Scout Approaches',
      cost: 1,
      body:
        'Reveal the next formation and gain a small counter-plan bonus.'
    },
    {
      id: 'hold',
      title: 'Hold Position',
      cost: 0,
      body:
        'Conserve supplies and face the next attack without an extra preparation.'
    }
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        eyebrow={
          repeatable
            ? 'REPEATABLE ENDURANCE'
            : 'CHAPTER 2 DEFENSE'
        }
        title={defenseTitle}
        body={
          repeatable
            ? 'Five attacks arrive back-to-back. Formation, Wagon stores, settlement defenses and Readiness must last through the full run.'
            : 'Hold through three escalating attacks. This first defense introduces the endurance rules before the repeatable five-wave mode unlocks.'
        }
        accent={factionAccent}
        status={
          <StatusPill
            label={
              repeatable
                ? '5 WAVES'
                : 'STORY DEFENSE'
            }
            tone={
              repeatable
                ? 'available'
                : 'current'
            }
          />
        }
      />

      <GameCard
        faction={activeFaction}
        accent={factionAccent}
      >
        <View style={styles.rewardBand}>
          <StatusPill
            label={getSideModeRewardLabel(
              runRewardMultiplier
            )}
            tone={
              runRewardMultiplier === 1
                ? 'ready'
                : runRewardMultiplier === 0.5
                  ? 'current'
                  : 'neutral'
            }
          />
          <Text style={[styles.rewardBandText, { color: theme.colors.textMuted }]}>
            {firstClearAtStart
              ? 'First clear uses the authored full defense reward.'
              : runRewardMultiplier === 0.5
                ? 'First repeat clear this chapter pays half resources.'
                : 'Further repeat defenses are practice only until the next chapter.'}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBlock}>
            <Text
              style={[
                styles.smallLabel,
                { color: theme.colors.textMuted }
              ]}
            >
              READINESS
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    runReadiness >= 70
                      ? theme.colors.primary
                      : theme.colors.gold
                }
              ]}
            >
              {runReadiness}%
            </Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text
              style={[
                styles.smallLabel,
                { color: theme.colors.textMuted }
              ]}
            >
              FIELD SUPPLIES
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: theme.colors.gold }
              ]}
            >
              {reserve}
            </Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text
              style={[
                styles.smallLabel,
                { color: theme.colors.textMuted }
              ]}
            >
              BASE POWER
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: theme.colors.text }
              ]}
            >
              {baseDefensePower}
            </Text>
          </View>
        </View>
        <ProgressBar
          value={Math.min(
            1,
            Math.max(0, runReadiness / 100)
          )}
          color={
            runReadiness >= 70
              ? theme.colors.primary
              : theme.colors.gold
          }
        />
      </GameCard>

      <SectionTitle
        title="Settlement Defense"
        trailing={
          '+' +
          Math.round(
            (fortification.powerMultiplier - 1) *
              100
          ) +
          '% power'
        }
      />
      <GameCard faction={activeFaction}>
        <View style={styles.bonusGrid}>
          {fortification.bonuses.map(
            bonus => (
              <View
                key={bonus.label}
                style={[
                  styles.bonusChip,
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
                    { color: theme.colors.text }
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
          Army, Hall and Command building levels
          strengthen the defensive works. Wagon
          Rations, Medicine and Repair Kits expand
          what you can do between waves.
        </Text>
      </GameCard>

      <SectionTitle
        title="Defense Route"
        trailing={
          complete
            ? 'Cleared'
            : 'Wave ' +
              (waveIndex + 1) +
              ' / ' +
              waves.length
        }
      />
      <GameCard faction={activeFaction}>
        <View style={styles.waveTrack}>
          {waves.map((wave, index) => {
            const cleared =
              complete ||
              index < waveIndex;
            const current =
              !complete &&
              index === waveIndex;

            return (
              <StatusPill
                key={wave.id}
                label={
                  String(index + 1) +
                  (wave.final ? ' · FINAL' : '')
                }
                tone={
                  cleared
                    ? 'done'
                    : current
                      ? wave.final
                        ? 'boss'
                        : 'current'
                      : 'locked'
                }
              />
            );
          })}
        </View>
        <ProgressBar
          value={
            complete
              ? 1
              : waveProgress
          }
          color={factionAccent}
        />
      </GameCard>

      {!complete && !failed ? (
        <GameCard
          faction={activeFaction}
          state={
            hasIntel &&
            power.value >= waveThreat
              ? 'ready'
              : 'default'
          }
          accent={
            currentWave.final
              ? theme.colors.danger
              : factionAccent
          }
        >
          <View style={styles.waveHeader}>
            <View style={styles.headerCopy}>
              <Text
                style={[
                  styles.waveLabel,
                  {
                    color:
                      currentWave.final
                        ? theme.colors.danger
                        : theme.colors.gold
                  }
                ]}
              >
                WAVE {waveIndex + 1}
                {currentWave.final
                  ? ' · FINAL'
                  : ''}
              </Text>
              <Text
                style={[
                  styles.waveName,
                  { color: theme.colors.text }
                ]}
              >
                {hasIntel
                  ? currentWave.name
                  : 'Unscouted Attack'}
              </Text>
            </View>
            <StatusPill
              label={
                power.matchup.result ===
                'advantage'
                  ? 'FORMATION EDGE'
                  : power.matchup.result ===
                      'disadvantage'
                    ? 'EXPOSED'
                    : 'EVEN'
              }
              tone={
                power.matchup.result ===
                'advantage'
                  ? 'available'
                  : power.matchup.result ===
                      'disadvantage'
                    ? 'elite'
                    : 'current'
              }
            />
          </View>

          <Text
            style={[
              styles.waveBody,
              { color: theme.colors.textMuted }
            ]}
          >
            {hasIntel
              ? currentWave.pressure
              : 'The exact formation is hidden. Spend field supplies on Scout Approaches between waves, or improve your signal network for permanent intelligence.'}
          </Text>

          {hasIntel ? (
            <View
              style={[
                styles.intelBox,
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
                  styles.intelLabel,
                  { color: factionAccent }
                ]}
              >
                ENEMY FORMATION
              </Text>
              <Text
                style={[
                  styles.intelValue,
                  { color: theme.colors.text }
                ]}
              >
                {enemyShape.layout} · {enemyShape.name}
              </Text>
              <Text
                style={[
                  styles.intelBody,
                  {
                    color:
                      theme.colors.textMuted
                  }
                ]}
              >
                {power.matchup.summary}
              </Text>
            </View>
          ) : null}

          <View style={styles.powerRow}>
            <View>
              <Text
                style={[
                  styles.smallLabel,
                  { color: theme.colors.textMuted }
                ]}
              >
                EFFECTIVE DEFENSE
              </Text>
              <Text
                style={[
                  styles.power,
                  { color: theme.colors.text }
                ]}
              >
                {power.value}
              </Text>
            </View>
            <View style={styles.threatCopy}>
              <Text
                style={[
                  styles.smallLabel,
                  { color: theme.colors.textMuted }
                ]}
              >
                WAVE THREAT
              </Text>
              <Text
                style={[
                  styles.power,
                  {
                    color:
                      hasIntel
                        ? theme.colors.danger
                        : theme.colors.textMuted
                  }
                ]}
              >
                {hasIntel
                  ? waveThreat
                  : '???'}
              </Text>
            </View>
          </View>

          {hasIntel ? (
            <ProgressBar
              value={Math.min(
                1,
                power.value / waveThreat
              )}
              color={
                power.value >= waveThreat
                  ? theme.colors.primary
                  : theme.colors.gold
              }
            />
          ) : null}
        </GameCard>
      ) : null}

      {betweenWaves &&
      !failed &&
      !complete ? (
        <>
          <SectionTitle
            title="Between Waves"
            trailing={reserve + ' supplies left'}
          />
          {choiceCards.map(choice => (
            <GameCard
              key={choice.id}
              faction={activeFaction}
              ornament={false}
            >
              <View style={styles.choiceHeader}>
                <View style={styles.headerCopy}>
                  <Text
                    style={[
                      styles.choiceTitle,
                      { color: theme.colors.text }
                    ]}
                  >
                    {choice.title}
                  </Text>
                  <Text
                    style={[
                      styles.choiceBody,
                      {
                        color:
                          theme.colors.textMuted
                      }
                    ]}
                  >
                    {choice.body}
                  </Text>
                </View>
                <StatusPill
                  label={
                    choice.cost === 0
                      ? 'FREE'
                      : choice.cost +
                        ' SUPPLY'
                  }
                  tone={
                    reserve >= choice.cost
                      ? 'available'
                      : 'locked'
                  }
                />
              </View>
              <View style={styles.button}>
                <SecondaryButton
                  label={'Choose ' + choice.title}
                  disabled={
                    reserve < choice.cost
                  }
                  onPress={() =>
                    chooseBetweenWave(
                      choice.id
                    )
                  }
                />
              </View>
            </GameCard>
          ))}
        </>
      ) : null}

      {message ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            styles.message,
            {
              color: failed
                ? theme.colors.danger
                : theme.colors.gold
            }
          ]}
        >
          {message}
        </Text>
      ) : null}

      {failed ? (
        <GameCard
          accent={theme.colors.danger}
          faction={activeFaction}
          state="danger"
        >
          <Text
            style={[
              styles.failTitle,
              { color: theme.colors.text }
            ]}
          >
            The defense has broken
          </Text>
          <Text
            style={[
              styles.failBody,
              { color: theme.colors.textMuted }
            ]}
          >
            This attempt is over. Readiness loss
            remains, so regroup, resupply or change
            the formation before starting another
            defense.
          </Text>
          <View style={styles.actions}>
            <PrimaryButton
              label="Review Formation"
              onPress={onEditFormation}
            />
            <SecondaryButton
              label="Return to Campaign"
              onPress={onExit}
            />
          </View>
        </GameCard>
      ) : complete ? (
        <GameCard
          accent={theme.colors.primary}
          faction={activeFaction}
          state="ready"
        >
          <View style={styles.completeHeader}>
            <Text
              style={[
                styles.failTitle,
                { color: theme.colors.text }
              ]}
            >
              {victoryTitle}
            </Text>
            <StatusPill
              label="DEFENDED"
              tone="done"
            />
          </View>
          <View style={styles.rewardRow}>
            <ResourceAmountRow
              prefix="+"
              values={
                firstClearAtStart
                  ? {
                      gold: 85,
                      wood: 10,
                      stone: 10,
                      iron: 4,
                      provisions: 6
                    }
                  : scaleResourceReward(
                      {
                        gold: 60,
                        wood: 8,
                        stone: 6,
                        iron: 2,
                        provisions: 5
                      },
                      runRewardMultiplier
                    )
              }
            />
          </View>
          <Text
            style={[
              styles.failBody,
              { color: theme.colors.textMuted }
            ]}
          >
            {firstClearAtStart || runRewardMultiplier > 0
              ? 'Regional production also advances one cycle. '
              : 'Practice clears do not advance regional production. '}
            The army finishes at{' '}
            {runReadiness}% Readiness.
          </Text>
          <View style={styles.button}>
            <PrimaryButton
              label="Return to Campaign"
              onPress={onExit}
            />
          </View>
        </GameCard>
      ) : !betweenWaves ? (
        <View style={styles.actions}>
          {!started ? (
            <>
              <PrimaryButton
                label={
                  repeatable
                    ? 'Begin Endurance Defense'
                    : 'Begin Story Defense'
                }
                onPress={() => {
                  setStarted(true);
                  setMessage(
                    'Formation and Wagon loadout are now locked for this defense.'
                  );
                }}
              />
              <SecondaryButton
                label="Edit Formation"
                onPress={onEditFormation}
              />
              <SecondaryButton
                label="Edit Wagon"
                onPress={onEditWagon}
              />
            </>
          ) : (
            <PrimaryButton
              label={
                currentWave.final
                  ? 'Defend Final Wave'
                  : 'Defend Wave ' +
                    (waveIndex + 1)
              }
              onPress={resolveWave}
            />
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 34,
    gap: 13
  },
  rewardBand: {
    gap: 7,
    marginBottom: 12
  },
  rewardBandText: {
    fontSize: 10.5,
    lineHeight: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10
  },
  summaryBlock: {
    flex: 1
  },
  smallLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 1
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2
  },
  bonusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  bonusChip: {
    minWidth: '46%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 11,
    padding: 9
  },
  bonusLabel: {
    fontSize: 9,
    fontWeight: '800'
  },
  bonusValue: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '900',
    marginTop: 2
  },
  note: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 9
  },
  waveTrack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  waveHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  headerCopy: {
    flex: 1
  },
  waveLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1
  },
  waveName: {
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3
  },
  waveBody: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 6
  },
  intelBox: {
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
    marginTop: 13,
    marginBottom: 10
  },
  threatCopy: {
    alignItems: 'flex-end'
  },
  power: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2
  },
  choiceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  choiceTitle: {
    fontSize: 15,
    fontWeight: '900'
  },
  choiceBody: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 4
  },
  button: {
    marginTop: 11
  },
  actions: {
    gap: 8
  },
  message: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800'
  },
  failTitle: {
    fontSize: 17,
    fontWeight: '900'
  },
  failBody: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6
  },
  completeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  rewardRow: {
    marginTop: 10
  }
});
