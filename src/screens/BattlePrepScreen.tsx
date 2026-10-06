import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getEncounterForChapter,
  getEnemyArmyProfile,
  getEnemyFormationTactic,
  getEnemyRoleAssignments
} from '../game/encounters';
import {
  getFormationCounters,
  getFormationMatchup,
  getFormationShape
} from '../game/formation';
import {
  getArmyReadinessProfile,
  getUnitCombatProfile
} from '../game/balance';
import {
  getFantasyCombatEdge,
  getFlyingCombatEdge,
  getLargeCombatEdge,
  getHybridCombatEdge
} from '../game/progression';
import { getEnemyFantasyThreatAssessment } from '../game/enemyFantasy';
import {
  assessBattlePreparation,
  getPreparationEquipmentUnitId
} from '../game/battlePreparation';
import type { BattlePreparationFixTarget } from '../game/battlePreparation';
import {
  evaluateFormationPreset,
  getTacticalAdjustmentAdvice
} from '../game/loadoutAnalysis';
import type { TacticalAdjustmentAdvice } from '../game/loadoutAnalysis';
import type { FormationPresetSlotId } from '../game/types';
import type { EncounterId } from '../game/encounters';
import { useGame } from '../game/GameProvider';
import {
  getTacticalGuidanceFeatures,
  requiresSeverePreparationConfirmation
} from '../game/tacticalGuidance';
import { usePreferences } from '../preferences/PreferencesProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  MetricTile,
  Pill,
  PrimaryButton,
  ProgressBar,
  ScreenHero,
  SecondaryButton,
  SectionTitle,
  StatusPill,
  UnitPortrait
} from '../ui/components';
import { EnemySprite } from '../ui/gameArt';
import { FormationMiniature } from '../ui/FormationMiniature';
import { TutorialFocus } from '../ui/TutorialFocus';
import type { TutorialFocusTarget } from '../game/tutorial';

export function BattlePrepScreen({
  encounterId,
  onBegin,
  onOpenAdjustment,
  onOpenPreparationFix,
  tutorialFocus,
  onTutorialFocusComplete
}: {
  encounterId: EncounterId;
  onBegin: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
  onOpenAdjustment?: (
    adjustment: TacticalAdjustmentAdvice,
    presetSlotId: FormationPresetSlotId
  ) => void;
  onOpenPreparationFix?: (
    target: BattlePreparationFixTarget,
    unitId?: string
  ) => void;
}) {
  const { theme } = useGameTheme();
  const { tacticalGuidance } = usePreferences();
  const guidanceFeatures =
    getTacticalGuidanceFeatures(tacticalGuidance);
  const [showBattleDetails, setShowBattleDetails] = React.useState(false);
  const [
    showSevereBattleConfirmation,
    setShowSevereBattleConfirmation
  ] = React.useState(false);
  const {
    activeFaction,
    chapterNumber,
    resources,
    armyReadiness,
    armyResupplyCost,
    restAndResupplyArmy,
    units,
    formation,
    wagonItems,
    unitEquipment,
    equipmentDefinitions,
    formationBonuses,
    formationAnalysis,
    formationShapes,
    activeFormationShape,
    formationPresets,
    armyLoadoutsUnlocked,
    activeSquadCap,
    activeDeploymentCapacity,
    currentWagonStage,
    setFormationShape,
    applyFormationPreset,
    formationDoctrineId,
    formationDoctrines,
    activeCommanderPath,
    activeMarcherWarningChoice,
    activeLastLoyalistsChoice,
    activeRoyalDecree,
    activeFactionMandate,
    buildingLevels,
    factionBuildingIds,
    settlementEffects,
    claimRewardedAd,
    rewardedAdClaims,
    rewardedAdMessage
  } = useGame();

  const encounter =
    getEncounterForChapter(
      encounterId,
      chapterNumber
    );
  const enemyTactic = getEnemyFormationTactic(encounterId);
  const enemyShape = getFormationShape(enemyTactic.formationShapeId);
  const enemyArmyProfile = getEnemyArmyProfile(encounterId);
  const enemyAssignments = getEnemyRoleAssignments(
    encounterId,
    enemyShape.rows,
    encounter.enemyCount
  );
  const enemyComposition = Array.from(
    enemyAssignments.reduce((counts, assignment) => {
      counts.set(
        assignment.label,
        (counts.get(assignment.label) ?? 0) + 1
      );
      return counts;
    }, new Map<string, number>())
  )
    .map(([label, count]) => String(count) + ' ' + label)
    .join(' · ');
  const formationMatchup = getFormationMatchup(
    activeFormationShape.id,
    enemyShape.id
  );
  const stageRank: Record<string, number> = {
    camp: 0,
    settlement: 1,
    fort: 2,
    town: 3,
    stronghold: 4,
    capital: 5,
    grand: 6
  };
  const unlockRank: Record<string, number> = {
    Start: 0,
    Settlement: 1,
    Fort: 2,
    Town: 3,
    Stronghold: 4
  };
  const unlockedFormationShapes = formationShapes.filter(
    shape =>
      (stageRank[currentWagonStage.id] ?? 0) >=
      (unlockRank[shape.unlock] ?? 0)
  );
  const formationSwitchOptions = [...unlockedFormationShapes].sort(
    (a, b) => {
      if (a.id === activeFormationShape.id) return -1;
      if (b.id === activeFormationShape.id) return 1;

      if (!guidanceFeatures.sortLoadoutsByFit) {
        return (
          formationShapes.findIndex(shape => shape.id === a.id) -
          formationShapes.findIndex(shape => shape.id === b.id)
        );
      }

      const rank = {
        advantage: 0,
        even: 1,
        disadvantage: 2
      };
      return (
        rank[getFormationMatchup(a.id, enemyShape.id).result] -
        rank[getFormationMatchup(b.id, enemyShape.id).result]
      );
    }
  );
  const presetMatchesCurrent = (slotId: 1 | 2 | 3) => {
    const preset = formationPresets.find(
      candidate => candidate.slotId === slotId
    );
    if (!preset) return false;

    return (
      preset.formationShapeId === activeFormationShape.id &&
      preset.formationDoctrineId === formationDoctrineId &&
      Array.from({ length: 9 }).every(
        (_, index) =>
          (preset.formation[index] ?? null) ===
          (formation[index] ?? null)
      )
    );
  };

  const unlockedCounterShapes = getFormationCounters(enemyShape.id)
    .filter(
      shape =>
        (stageRank[currentWagonStage.id] ?? 0) >=
        (unlockRank[shape.unlock] ?? 0)
    );
  const unlockedCounters = unlockedCounterShapes
    .filter(shape => shape.id !== activeFormationShape.id)
    .slice(0, 3);
  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;
  const activeUnits = formation
    .filter((unitId): unitId is string => Boolean(unitId))
    .map(unitId => units.find(unit => unit.id === unitId))
    .filter((unit): unit is NonNullable<typeof unit> => Boolean(unit));

  const combatProfile = getUnitCombatProfile(activeUnits);
  const fantasyCombatEdge = getFantasyCombatEdge(
    activeUnits,
    enemyArmyProfile.id
  );
  const flyingCombatEdge = getFlyingCombatEdge(
    activeUnits,
    enemyArmyProfile.id
  );
  const largeCombatEdge = getLargeCombatEdge(
    activeUnits,
    enemyArmyProfile.id
  );
  const hybridCombatEdge = getHybridCombatEdge(
    activeUnits,
    enemyArmyProfile.id
  );
  const enemyFantasyThreat =
    getEnemyFantasyThreatAssessment(
      encounter,
      activeUnits
    );
  const readinessProfile = getArmyReadinessProfile(armyReadiness);
  const effectiveMaxHp = Math.round(
    combatProfile.maxHp * readinessProfile.hpMultiplier
  );
  const effectiveAttack = Math.round(
    combatProfile.totalAttack * readinessProfile.attackMultiplier
  );
  const formationFull =
    activeDeploymentCapacity >= activeSquadCap;
  const hasFood = wagonItems.some(item => item.id === 'rations');
  const hasMedicine = wagonItems.some(item => item.id === 'medicine');
  const preparation = assessBattlePreparation({
    activeUnits,
    squadCap: activeSquadCap,
    activeDeploymentCapacity,
    armyReadiness,
    hasRations: hasFood,
    difficulty: encounter.difficulty,
    formationMatchupResult: formationMatchup.result,
    wagonStageId: currentWagonStage.id,
    unitEquipment,
    equipmentDefinitions
  });
  const preparationConcerns = preparation.factors
    .filter(
      factor =>
        factor.severity === 'caution' ||
        factor.severity === 'danger'
    )
    .sort((a, b) => b.riskWeight - a.riskWeight);
  const preparationLabel =
    preparation.status === 'ready'
      ? 'READY'
      : preparation.status === 'risky'
        ? 'RISKY'
        : 'UNDERPREPARED';
  const preparationTitle =
    preparation.status === 'ready'
      ? 'Ready'
      : preparation.status === 'risky'
        ? 'Risky'
        : 'Severely underprepared';
  const preparationTone =
    preparation.status === 'ready'
      ? 'ready'
      : preparation.status === 'risky'
        ? 'available'
        : 'elite';
  const primaryPreparationConcern =
    preparationConcerns[0] ?? null;
  const equipmentFixUnitId =
    getPreparationEquipmentUnitId(
      activeUnits,
      unitEquipment,
      equipmentDefinitions
    );
  const equipmentFixUnit = equipmentFixUnitId
    ? activeUnits.find(unit => unit.id === equipmentFixUnitId) ?? null
    : null;
  const canFullyResupply =
    resources.provisions >= armyResupplyCost;

  const requiresBattleConfirmation =
    requiresSeverePreparationConfirmation(
      tacticalGuidance,
      preparation.status
    );

  React.useEffect(() => {
    setShowSevereBattleConfirmation(false);
  }, [
    encounterId,
    preparation.status,
    tacticalGuidance
  ]);

  const beginBattle = (
    confirmedSevere = false
  ) => {
    if (
      requiresBattleConfirmation &&
      !confirmedSevere
    ) {
      setShowSevereBattleConfirmation(true);
      return;
    }

    if (tutorialFocus?.kind === 'battle-begin') {
      onTutorialFocusComplete?.();
    }
    onBegin();
  };

  const preparationAction =
    tacticalGuidance === 'full' &&
    primaryPreparationConcern
      ? primaryPreparationConcern.id === 'readiness'
        ? {
            label: canFullyResupply
              ? 'Rest & Resupply · ' +
                armyResupplyCost +
                ' provisions'
              : 'Need ' +
                armyResupplyCost +
                ' provisions to recover',
            disabled: !canFullyResupply,
            onPress: canFullyResupply
              ? restAndResupplyArmy
              : undefined
          }
        : primaryPreparationConcern.id === 'squads'
          ? {
              label: 'Open Formation · fill squad slot',
              disabled: false,
              onPress: () =>
                onOpenPreparationFix?.('formation')
            }
          : primaryPreparationConcern.id === 'rations'
            ? {
                label: 'Open Supply Wagon · pack rations',
                disabled: false,
                onPress: () =>
                  onOpenPreparationFix?.('wagon')
              }
            : primaryPreparationConcern.id === 'formation'
              ? {
                  label: 'Open Formation · review setup',
                  disabled: false,
                  onPress: () =>
                    onOpenPreparationFix?.('formation')
                }
              : {
                  label: equipmentFixUnit
                    ? 'Open Equipment · ' + equipmentFixUnit.name
                    : 'Open Equipment',
                  disabled: !equipmentFixUnitId,
                  onPress: equipmentFixUnitId
                    ? () =>
                        onOpenPreparationFix?.(
                          'equipment',
                          equipmentFixUnitId
                        )
                    : undefined
                }
      : null;
  const marcherDoctrineActive =
    encounterId === 'siege_road' || encounterId === 'lord_marshal_veyr';
  const loyalistApproachActive =
    encounterId === 'pretender_general';
  const metaAllianceActive = [
    'three_seals_convergence',
    'ashen_triumvirate',
    'unbound_beacon'
  ].includes(encounterId);
  const marcherIntel =
    marcherDoctrineActive &&
    Boolean(activeMarcherWarningChoice?.detailedIntel);
  const towerIntel =
    (buildingLevels[factionBuildingIds.scout] ?? 0) >= 2 ||
    settlementEffects.detailedIntel;
  const loyalistIntel =
    loyalistApproachActive &&
    Boolean(activeLastLoyalistsChoice?.detailedIntel);
  const mandateIntel = Boolean(activeFactionMandate?.detailedIntel);
  const scoutReport =
    towerIntel ||
    marcherIntel ||
    loyalistIntel ||
    mandateIntel ||
    (rewardedAdClaims.scout_report ?? 0) > 0;

  const presetEvaluations = new Map(
    formationPresets.map(preset => [
      preset.slotId,
      evaluateFormationPreset({
        preset,
        units,
        faction: activeFaction,
        enemyShapeId: enemyShape.id,
        enemyArmyProfileId: enemyArmyProfile.id,
        squadCap: activeSquadCap
      })
    ])
  );

  const formationPresetOptions = armyLoadoutsUnlocked
    ? [...formationPresets].sort(
        (a, b) => {
          const aActive = presetMatchesCurrent(a.slotId);
          const bActive = presetMatchesCurrent(b.slotId);
          if (aActive && !bActive) return -1;
          if (bActive && !aActive) return 1;

          if (
            scoutReport &&
            guidanceFeatures.sortLoadoutsByFit
          ) {
            const aScore = presetEvaluations.get(a.slotId)?.score ?? 0;
            const bScore = presetEvaluations.get(b.slotId)?.score ?? 0;
            if (aScore !== bScore) return bScore - aScore;
          }

          if (!guidanceFeatures.sortLoadoutsByFit) {
            return a.slotId - b.slotId;
          }

          const rank = {
            advantage: 0,
            even: 1,
            disadvantage: 2
          };
          const aResult = getFormationMatchup(
            a.formationShapeId,
            enemyShape.id
          ).result;
          const bResult = getFormationMatchup(
            b.formationShapeId,
            enemyShape.id
          ).result;

          if (rank[aResult] !== rank[bResult]) {
            return rank[aResult] - rank[bResult];
          }
          return a.slotId - b.slotId;
        }
      )
    : [];

  const recommendedPreset =
    scoutReport &&
    guidanceFeatures.showRecommendedLoadout &&
    formationPresetOptions.length > 0
      ? formationPresetOptions.reduce((best, preset) => {
          if (!best) return preset;
          const bestScore =
            presetEvaluations.get(best.slotId)?.score ?? 0;
          const candidateScore =
            presetEvaluations.get(preset.slotId)?.score ?? 0;
          return candidateScore > bestScore
            ? preset
            : best;
        }, formationPresetOptions[0] ?? null)
      : null;
  const recommendedEvaluation = recommendedPreset
    ? presetEvaluations.get(recommendedPreset.slotId) ?? null
    : null;
  const tacticalAdjustments =
    scoutReport &&
    guidanceFeatures.showAdjustmentChecklist &&
    recommendedPreset &&
    recommendedEvaluation &&
    (
      recommendedEvaluation.score < 68 ||
      recommendedEvaluation.risks.length > 0
    )
      ? getTacticalAdjustmentAdvice({
          preset: recommendedPreset,
          evaluation: recommendedEvaluation,
          units,
          enemyShapeId: enemyShape.id,
          enemyArmyProfileId: enemyArmyProfile.id,
          squadCap: activeSquadCap,
          availableCounterShapeIds:
            unlockedCounterShapes.map(shape => shape.id)
        })
      : [];

  const doctrine = formationDoctrines.find(candidate => candidate.id === formationDoctrineId);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHero
        eyebrow="BATTLE PREP"
        title={encounter.name}
        body={encounter.subtitle}
        accent={
          encounter.difficulty === 'Boss'
            ? theme.colors.danger
            : encounter.difficulty === 'Elite'
              ? theme.colors.gold
              : factionAccent
        }
        status={
          <StatusPill
            label={encounter.difficulty.toUpperCase()}
            tone={
              encounter.difficulty === 'Boss'
                ? 'boss'
                : encounter.difficulty === 'Elite'
                  ? 'elite'
                  : 'neutral'
            }
          />
        }
      >
        <View style={styles.prepAtGlance}>
          <MetricTile
            label="ACTIVE SQUADS"
            value={
              String(activeUnits.length) +
              '/' +
              String(activeSquadCap)
            }
            tone={
              formationFull
                ? 'positive'
                : 'danger'
            }
          />
          <MetricTile
            label="READINESS"
            value={String(armyReadiness) + '%'}
            tone={
              armyReadiness >= 70
                ? 'positive'
                : armyReadiness >= 50
                  ? 'gold'
                  : 'danger'
            }
          />
        </View>
      </ScreenHero>

      <SectionTitle
        title="Enemy"
        trailing={
          settlementEffects.detailedIntel
            ? 'Command Network intel'
            : marcherIntel
              ? 'Verified Marcher intel'
              : loyalistIntel
                ? 'Loyalist intelligence'
                : mandateIntel
                  ? activeFactionMandate?.name ?? 'Faction intelligence'
                  : towerIntel
                ? 'Signal Tower intel'
                : scoutReport
                  ? 'Scouted'
                  : 'Partial intel'
        }
      />
      <GameCard>
        <View style={styles.enemyRow}>
          <View style={[styles.enemyMark, { borderColor: theme.colors.danger }]}>
            <EnemySprite
              enemyName={encounter.enemyName}
              armyProfileId={enemyArmyProfile.id}
              fantasyThreat={encounter.fantasyThreat}
              size={48}
            />
          </View>
          <View style={styles.enemyCopy}>
            <Text style={[styles.enemyName, { color: theme.colors.text }]}>
              {encounter.enemyName}
            </Text>
            <Text style={[styles.enemyMeta, { color: theme.colors.textMuted }]}>
              {scoutReport
                ? encounter.enemyCount + ' enemies · ' + encounter.enemyHp + ' total HP · exact strength revealed'
                : 'Enemy strength partially concealed · formation and supplies recommended'}
            </Text>
            <Text style={[styles.enemyFormation, { color: theme.colors.danger }]}>
              {enemyShape.layout} · {enemyTactic.name}
            </Text>
            <Text style={[styles.enemyArmy, { color: theme.colors.gold }]}>
              {scoutReport
                ? enemyArmyProfile.name + ' · ' + enemyArmyProfile.pressureSummary
                : 'Army composition concealed'}
            </Text>
            <Text style={[styles.enemyTactic, { color: theme.colors.textMuted }]}>
              {scoutReport
                ? enemyTactic.summary + ' ATK ×' + enemyTactic.attackMultiplier.toFixed(2) + ' · ARM ×' + enemyTactic.armorMultiplier.toFixed(2) + ' · SPD ×' + enemyTactic.speedMultiplier.toFixed(2)
                : 'Formation identified. Scout intel reveals role mix, timing and exact modifiers.'}
            </Text>
            {scoutReport ? (
              <Text style={[styles.enemyComposition, { color: theme.colors.text }]}>
                {enemyComposition}
              </Text>
            ) : null}
          </View>
        </View>

        {!scoutReport && !towerIntel ? (
          <View style={styles.scoutButton}>
            <SecondaryButton
              label="Watch optional ad for Scout Report"
              disabled={(rewardedAdClaims.scout_report ?? 0) >= 2}
              onPress={() => void claimRewardedAd('scout_report')}
            />
          </View>
        ) : null}
      </GameCard>

      {enemyFantasyThreat ? (
        <GameCard
          accent={
            enemyFantasyThreat.countered
              ? theme.colors.primary
              : theme.colors.danger
          }
          state={enemyFantasyThreat.countered ? 'ready' : 'danger'}
        >
          <View style={styles.planHeader}>
            <View style={styles.planCopy}>
              <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
                ENEMY FANTASY THREAT
              </Text>
              <Text style={[styles.planTitle, { color: theme.colors.text }]}>
                {enemyFantasyThreat.label}
              </Text>
            </View>
            <StatusPill
              label={enemyFantasyThreat.countered ? 'COUNTERED' : 'EXPOSED'}
              tone={enemyFantasyThreat.countered ? 'ready' : 'elite'}
            />
          </View>
          <Text style={[styles.planMatchup, { color: theme.colors.textMuted }]}>
            {enemyFantasyThreat.detail}
          </Text>
          <Text style={[styles.matchupEffect, { color: theme.colors.gold }]}>
            {enemyFantasyThreat.counterLabel} · coverage {enemyFantasyThreat.counterScore.toFixed(1)}/{enemyFantasyThreat.requiredCounterScore.toFixed(1)} · dealt ×{enemyFantasyThreat.outgoingDamageMultiplier.toFixed(2)} · received ×{enemyFantasyThreat.incomingDamageMultiplier.toFixed(2)}
          </Text>
        </GameCard>
      ) : null}

      <GameCard
        accent={
          formationMatchup.result === 'advantage'
            ? theme.colors.primary
            : formationMatchup.result === 'disadvantage'
              ? theme.colors.danger
              : factionAccent
        }
        faction={activeFaction}
        state={formationMatchup.result === 'disadvantage' ? 'danger' : 'default'}
      >
        <View style={styles.planHeader}>
          <View style={styles.planCopy}>
            <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
              BATTLE PLAN
            </Text>
            <Text style={[styles.planTitle, { color: theme.colors.text }]}>
              {activeFormationShape.layout} · {activeFormationShape.name}
            </Text>
          </View>
          <StatusPill
            label={
              formationMatchup.result === 'advantage'
                ? 'FORMATION EDGE'
                : formationMatchup.result === 'disadvantage'
                  ? 'EXPOSED'
                  : 'NEUTRAL'
            }
            tone={
              formationMatchup.result === 'advantage'
                ? 'ready'
                : formationMatchup.result === 'disadvantage'
                  ? 'elite'
                  : 'neutral'
            }
          />
        </View>
        <View
          accessibilityLabel={
            'Formation comparison. You ' +
            activeFormationShape.layout +
            ' versus enemy ' +
            enemyShape.layout +
            '. ' +
            formationMatchup.title
          }
          style={styles.formationDuel}
        >
          <FormationMiniature
            shape={activeFormationShape}
            side="ally"
            label="YOU"
            accent={factionAccent}
            muted={theme.colors.textMuted}
          />
          <View style={styles.formationVersus}>
            <Text style={[styles.formationVersusText, { color: theme.colors.gold }]}>
              VS
            </Text>
          </View>
          <FormationMiniature
            shape={enemyShape}
            side="enemy"
            label="ENEMY"
            accent={theme.colors.danger}
            muted={theme.colors.textMuted}
          />
        </View>
        <Text style={[styles.planMatchup, { color: theme.colors.textMuted }]}>
          {formationMatchup.title} · dealt ×{formationMatchup.outgoingDamageMultiplier.toFixed(2)} · received ×{formationMatchup.incomingDamageMultiplier.toFixed(2)}
        </Text>
        <Text
          style={[
            styles.formationRead,
            {
              color:
                formationMatchup.result === 'advantage'
                  ? theme.colors.primary
                  : formationMatchup.result === 'disadvantage'
                    ? theme.colors.danger
                    : theme.colors.textMuted
            }
          ]}
        >
          {formationMatchup.summary}
        </Text>
        {tacticalGuidance !== 'off' ? (
          <View
            style={[
              styles.preparationSummary,
              {
                borderColor:
                  preparation.status === 'ready'
                    ? theme.colors.primary + '55'
                    : preparation.status === 'risky'
                      ? theme.colors.gold + '55'
                      : theme.colors.danger + '66',
                backgroundColor: theme.colors.surface2
              }
            ]}
          >
            <View style={styles.preparationHeader}>
              <View style={styles.preparationCopy}>
                <Text
                  style={[
                    styles.preparationEyebrow,
                    { color: theme.colors.textMuted }
                  ]}
                >
                  PREPARATION
                </Text>
                <Text
                  style={[
                    styles.preparationTitle,
                    { color: theme.colors.text }
                  ]}
                >
                  {preparationTitle}
                </Text>
              </View>
              <StatusPill
                label={preparationLabel}
                tone={preparationTone}
              />
            </View>

            <Text
              style={[
                styles.preparationSummaryText,
                { color: theme.colors.textMuted }
              ]}
            >
              {preparationConcerns.length === 0
                ? 'No major preparation weaknesses detected.'
                : preparationConcerns.length +
                  ' concern' +
                  (preparationConcerns.length === 1 ? '' : 's') +
                  ' · ' +
                  preparationConcerns
                    .map(factor => factor.label)
                    .join(' · ')}
            </Text>

            {tacticalGuidance === 'full' &&
            preparationConcerns.length > 0 ? (
              <View style={styles.preparationDetails}>
                {preparationConcerns
                  .slice(0, 3)
                  .map(factor => (
                    <View
                      key={factor.id}
                      style={styles.preparationFactor}
                    >
                      <Text
                        style={[
                          styles.preparationFactorTitle,
                          {
                            color:
                              factor.severity === 'danger'
                                ? theme.colors.danger
                                : theme.colors.gold
                          }
                        ]}
                      >
                        {factor.label} · {factor.summary}
                      </Text>
                      <Text
                        style={[
                          styles.preparationFactorDetail,
                          { color: theme.colors.textMuted }
                        ]}
                      >
                        {factor.detail}
                      </Text>
                    </View>
                  ))}
              </View>
            ) : null}

            {tacticalGuidance === 'standard' ? (
              <Text
                style={[
                  styles.preparationModeHint,
                  { color: theme.colors.textMuted }
                ]}
              >
                Standard shows the overall preparation state and its broad causes; Full Guidance adds the detailed breakdown.
              </Text>
            ) : null}

            {preparationAction ? (
              <View style={styles.preparationAction}>
                <SecondaryButton
                  label={preparationAction.label}
                  disabled={
                    preparationAction.disabled ||
                    (!preparationAction.onPress &&
                      primaryPreparationConcern?.id !== 'readiness')
                  }
                  onPress={preparationAction.onPress}
                />
                <Text
                  style={[
                    styles.preparationActionHint,
                    { color: theme.colors.textMuted }
                  ]}
                >
                  Full Guidance opens the relevant system or performs only the explicitly confirmed recovery action. It never changes a tactical setup automatically.
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.planStatuses}>
          <StatusPill
            label={formationFull ? 'SQUADS FULL' : 'SQUAD MISSING'}
            tone={formationFull ? 'done' : 'elite'}
          />
          <StatusPill
            label={armyReadiness >= 70 ? 'ARMY READY' : 'FATIGUED'}
            tone={armyReadiness >= 70 ? 'ready' : armyReadiness >= 50 ? 'available' : 'elite'}
          />
          <StatusPill
            label={hasFood ? 'FOOD PACKED' : 'FOOD MISSING'}
            tone={hasFood ? 'done' : 'elite'}
          />
        </View>
        {guidanceFeatures.showCounterHints &&
        formationMatchup.result !== 'advantage' &&
        unlockedCounters.length > 0 ? (
          <Text style={[styles.planHint, { color: theme.colors.gold }]}>
            Counter available · {unlockedCounters.map(shape => shape.layout + ' ' + shape.name).join(' · ')}
          </Text>
        ) : null}
      </GameCard>

      {showBattleDetails ? (
        <>
      <SectionTitle
        title="Your formation"
        trailing={String(activeUnits.length) + ' / ' + String(activeSquadCap) + ' squads'}
      />
      <View style={styles.unitList}>
        {activeUnits.map(unit => (
          <GameCard key={unit.id} faction={unit.faction}>
            <View style={styles.unitRow}>
              <UnitPortrait
                name={unit.name}
                className={unit.className + ' · Lv. ' + unit.level}
                accent={factionAccent}
                faction={unit.faction}
                compact
              />
              <View style={styles.unitStats}>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ATK {unit.attack}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ARM {unit.armor}</Text>
              </View>
            </View>
          </GameCard>
        ))}
      </View>

      <GameCard
        accent={formationFull ? theme.colors.gold : theme.colors.danger}
        faction={activeFaction}
        state={formationFull ? 'default' : 'danger'}
      >
        <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>ARMY PROFILE</Text>
        <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
          {formationFull ? 'Full field strength' : 'Underfilled formation'}
        </Text>
        <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
          {effectiveMaxHp} HP · {effectiveAttack} ATK · Avg ARM {combatProfile.averageArmor.toFixed(1)} · Avg SPD {(combatProfile.averageSpeed * readinessProfile.speedMultiplier).toFixed(1)} · CAP {activeDeploymentCapacity}/{activeSquadCap}
        </Text>
        {!formationFull ? (
          <Text style={[styles.skillName, { color: theme.colors.danger }]}>
            Enemy pressure is tuned for {activeSquadCap} deployment capacity at this campaign tier. Fill the remaining capacity or improve gear before committing.
          </Text>
        ) : null}
      </GameCard>
        </>
      ) : null}

      {!armyLoadoutsUnlocked && activeFaction === 'human' ? (
        <GameCard ornament={false}>
          <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
            ARMY LOADOUTS LOCKED
          </Text>
          <Text style={[styles.recommendationHint, { color: theme.colors.textMuted }]}>
            Complete Chapter 4 mission 6, Prepare for Battle, to save and switch full army loadouts from Battle Prep.
          </Text>
        </GameCard>
      ) : null}

      {formationPresetOptions.length > 0 ? (
        <>
          {scoutReport &&
          guidanceFeatures.showRecommendedLoadout &&
          recommendedPreset &&
          recommendedEvaluation ? (
            <GameCard
              accent={
                recommendedEvaluation.rating === 'risky'
                  ? theme.colors.danger
                  : theme.colors.primary
              }
              state={
                recommendedEvaluation.rating === 'risky'
                  ? 'danger'
                  : 'default'
              }
            >
              <View style={styles.recommendationHeader}>
                <View style={styles.recommendationCopy}>
                  <Text
                    style={[
                      styles.doctrineLabel,
                      { color: theme.colors.textMuted }
                    ]}
                  >
                    SCOUTED LOADOUT READ
                  </Text>
                  <Text
                    style={[
                      styles.recommendationTitle,
                      { color: theme.colors.text }
                    ]}
                  >
                    {recommendedEvaluation.score >= 58
                      ? 'Loadout ' +
                        recommendedPreset.slotId +
                        ' fits this enemy best'
                      : 'Loadout ' +
                        recommendedPreset.slotId +
                        ' is the least risky saved option'}
                  </Text>
                </View>
                <Pill
                  label={'FIT ' + recommendedEvaluation.score}
                  color={
                    recommendedEvaluation.score >= 58
                      ? theme.colors.primary + '35'
                      : theme.colors.danger + '35'
                  }
                />
              </View>
              {recommendedEvaluation.strengths[0] ? (
                <Text
                  style={[
                    styles.recommendationStrength,
                    { color: theme.colors.primary }
                  ]}
                >
                  + {recommendedEvaluation.strengths[0]}
                </Text>
              ) : null}
              {recommendedEvaluation.risks[0] ? (
                <Text
                  style={[
                    styles.recommendationRisk,
                    { color: theme.colors.danger }
                  ]}
                >
                  ! {recommendedEvaluation.risks[0]}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.recommendationHint,
                  { color: theme.colors.textMuted }
                ]}
              >
                This is a situational recommendation based on the scouted army, saved squad roles and positioning—not a universal best formation.
              </Text>
              {tacticalAdjustments.length > 0 ? (
                <View style={styles.adjustmentList}>
                  <Text
                    style={[
                      styles.adjustmentHeading,
                      { color: theme.colors.text }
                    ]}
                  >
                    Improve before committing
                  </Text>
                  {tacticalAdjustments.map((adjustment, index) => (
                    <Pressable
                      key={
                        adjustment.kind +
                        ':' +
                        String(index) +
                        ':' +
                        adjustment.title
                      }
                      disabled={
                        !guidanceFeatures.allowGuidedActions ||
                        !onOpenAdjustment
                      }
                      onPress={() =>
                        guidanceFeatures.allowGuidedActions &&
                        onOpenAdjustment?.(
                          adjustment,
                          recommendedPreset.slotId
                        )
                      }
                      style={({ pressed }) => [
                        styles.adjustmentRow,
                        {
                          borderTopColor: theme.colors.border,
                          opacity: pressed ? 0.72 : 1
                        }
                      ]}
                    >
                      <View
                        style={[
                          styles.adjustmentIndex,
                          {
                            backgroundColor:
                              index === 0
                                ? theme.colors.gold + '30'
                                : theme.colors.surface2
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.adjustmentIndexText,
                            {
                              color:
                                index === 0
                                  ? theme.colors.gold
                                  : theme.colors.textMuted
                            }
                          ]}
                        >
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.adjustmentCopy}>
                        <Text
                          style={[
                            styles.adjustmentTitle,
                            { color: theme.colors.text }
                          ]}
                        >
                          {adjustment.title}
                        </Text>
                        <Text
                          style={[
                            styles.adjustmentDetail,
                            { color: theme.colors.textMuted }
                          ]}
                        >
                          {adjustment.detail}
                        </Text>
                      </View>
                      {guidanceFeatures.allowGuidedActions &&
                      onOpenAdjustment ? (
                        <Text
                          style={[
                            styles.adjustmentOpen,
                            { color: theme.colors.gold }
                          ]}
                        >
                          OPEN
                        </Text>
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </GameCard>
          ) : tacticalGuidance === 'full' ? (
            <Text
              style={[
                styles.recommendationHint,
                { color: theme.colors.textMuted }
              ]}
            >
              Scout Report unlocks full saved-loadout analysis using enemy troop composition.
            </Text>
          ) : null}

          <SectionTitle
            title="Tactical loadouts"
            trailing={
              scoutReport &&
              guidanceFeatures.showFitScores
                ? 'Scouted fit · shape · roles'
                : 'Shape · doctrine · positions'
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetSwitchStrip}
          >
            {formationPresetOptions.map(preset => {
              const presetShape = formationShapes.find(
                shape => shape.id === preset.formationShapeId
              );
              const presetDoctrine = formationDoctrines.find(
                candidate =>
                  candidate.id === preset.formationDoctrineId
              );
              const preview = getFormationMatchup(
                preset.formationShapeId,
                enemyShape.id
              );
              const evaluation =
                presetEvaluations.get(preset.slotId) ?? null;
              const recommended =
                scoutReport &&
                guidanceFeatures.showRecommendedLoadout &&
                recommendedPreset?.slotId === preset.slotId;
              const active = presetMatchesCurrent(
                preset.slotId
              );
              const previewColor =
                preview.result === 'advantage'
                  ? theme.colors.primary
                  : preview.result === 'disadvantage'
                    ? theme.colors.danger
                    : theme.colors.textMuted;
              const validSquads = preset.formation.filter(
                unitId =>
                  Boolean(
                    unitId &&
                      units.some(unit => unit.id === unitId)
                  )
              ).length;

              return (
                <Pressable
                  key={preset.slotId}
                  disabled={active}
                  onPress={() =>
                    applyFormationPreset(preset.slotId)
                  }
                  style={({ pressed }) => [
                    styles.presetSwitchCard,
                    {
                      borderColor: active
                        ? theme.colors.gold
                        : recommended
                          ? theme.colors.primary
                          : previewColor,
                      backgroundColor:
                        active || recommended
                          ? theme.colors.surface1
                          : theme.colors.surface2,
                      opacity: pressed ? 0.8 : 1
                    }
                  ]}
                >
                  <View style={styles.presetSwitchHeader}>
                    <Text
                      style={[
                        styles.presetSwitchTitle,
                        {
                          color: active
                            ? theme.colors.gold
                            : theme.colors.text
                        }
                      ]}
                    >
                      Loadout {preset.slotId}
                    </Text>
                    <Pill
                      label={
                        active
                          ? 'ACTIVE'
                          : recommended
                            ? evaluation && evaluation.score >= 58
                              ? 'RECOMMENDED'
                              : 'BEST SAVED'
                            : preview.result === 'advantage'
                              ? 'EDGE'
                              : preview.result === 'disadvantage'
                                ? 'EXPOSED'
                                : 'NEUTRAL'
                      }
                      color={
                        active
                          ? theme.colors.gold + '45'
                          : recommended
                            ? evaluation && evaluation.score >= 58
                              ? theme.colors.primary + '35'
                              : theme.colors.danger + '35'
                            : preview.result === 'advantage'
                              ? theme.colors.primary + '35'
                              : preview.result === 'disadvantage'
                                ? theme.colors.danger + '35'
                                : undefined
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.presetSwitchName,
                      { color: factionAccent }
                    ]}
                    numberOfLines={1}
                  >
                    {(presetShape?.layout ?? 'Formation') +
                      ' · ' +
                      (presetShape?.name ?? 'Saved shape')}
                  </Text>
                  <Text
                    style={[
                      styles.presetSwitchMeta,
                      { color: theme.colors.textMuted }
                    ]}
                    numberOfLines={2}
                  >
                    {(presetDoctrine?.name ?? 'Saved doctrine') +
                      ' · ' +
                      validSquads +
                      ' squads'}
                  </Text>
                  <Text
                    style={[
                      styles.presetSwitchEffect,
                      {
                        color:
                          scoutReport &&
                          guidanceFeatures.showFitScores &&
                          evaluation
                            ? evaluation.score >= 58
                              ? theme.colors.primary
                              : evaluation.score < 45
                                ? theme.colors.danger
                                : previewColor
                            : previewColor
                      }
                    ]}
                  >
                    {scoutReport &&
                    guidanceFeatures.showFitScores &&
                    evaluation
                      ? 'Fit ' +
                        evaluation.score +
                        ' · ' +
                        evaluation.validSquads +
                        '/' +
                        activeSquadCap +
                        ' squads'
                      : 'dealt ×' +
                        preview.outgoingDamageMultiplier.toFixed(2) +
                        ' · received ×' +
                        preview.incomingDamageMultiplier.toFixed(2)}
                  </Text>
                  {scoutReport &&
                  guidanceFeatures.showFitScores &&
                  evaluation ? (
                    <Text
                      style={[
                        styles.presetSwitchRead,
                        { color: theme.colors.textMuted }
                      ]}
                      numberOfLines={2}
                    >
                      {evaluation.strengths[0] ??
                        evaluation.risks[0] ??
                        'Balanced role mix with no major composition edge.'}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <Text
            style={[
              styles.presetSwitchHint,
              { color: theme.colors.textMuted }
            ]}
          >
            One tap restores the saved shape, doctrine and squad positions.
          </Text>
        </>
      ) : null}

      <SectionTitle
        title="Quick formation switch"
        trailing={String(unlockedFormationShapes.length) + ' unlocked'}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.formationSwitchStrip}
      >
        {formationSwitchOptions.map(shape => {
          const selected = shape.id === activeFormationShape.id;
          const preview = getFormationMatchup(
            shape.id,
            enemyShape.id
          );
          const previewColor =
            preview.result === 'advantage'
              ? theme.colors.primary
              : preview.result === 'disadvantage'
                ? theme.colors.danger
                : theme.colors.textMuted;

          return (
            <Pressable
              key={shape.id}
              disabled={selected}
              onPress={() => setFormationShape(shape.id)}
              style={({ pressed }) => [
                styles.formationSwitchCard,
                {
                  borderColor: selected
                    ? theme.colors.gold
                    : previewColor,
                  backgroundColor: selected
                    ? theme.colors.surface1
                    : theme.colors.surface2,
                  opacity: pressed ? 0.8 : 1
                }
              ]}
            >
              <View style={styles.formationSwitchHeader}>
                <Text
                  style={[
                    styles.formationSwitchLayout,
                    {
                      color: selected
                        ? theme.colors.gold
                        : factionAccent
                    }
                  ]}
                >
                  {shape.layout}
                </Text>
                <Pill
                  label={
                    selected
                      ? 'ACTIVE'
                      : preview.result === 'advantage'
                        ? 'EDGE'
                        : preview.result === 'disadvantage'
                          ? 'EXPOSED'
                          : 'NEUTRAL'
                  }
                  color={
                    selected
                      ? theme.colors.gold + '45'
                      : preview.result === 'advantage'
                        ? theme.colors.primary + '35'
                        : preview.result === 'disadvantage'
                          ? theme.colors.danger + '35'
                          : undefined
                  }
                />
              </View>
              <Text
                style={[
                  styles.formationSwitchName,
                  { color: theme.colors.text }
                ]}
                numberOfLines={1}
              >
                {shape.name}
              </Text>
              <Text
                style={[
                  styles.formationSwitchEffect,
                  { color: previewColor }
                ]}
              >
                dealt ×{preview.outgoingDamageMultiplier.toFixed(2)} · received ×{preview.incomingDamageMultiplier.toFixed(2)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={[styles.switchHint, { color: theme.colors.textMuted }]}>
        Switching here is immediate and saved. Squad slot assignments stay the same; only the formation geometry changes.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={showBattleDetails ? 'Hide battle details' : 'Show battle details'}
        onPress={() => setShowBattleDetails(previous => !previous)}
        style={({ pressed }) => [
          styles.detailsToggle,
          {
            backgroundColor: theme.colors.surface1,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.78 : 1
          }
        ]}
      >
        <View>
          <Text style={[styles.detailsToggleTitle, { color: theme.colors.text }]}>
            Battle details
          </Text>
          <Text style={[styles.detailsToggleBody, { color: theme.colors.textMuted }]}>
            Squad stats, order, matchup math, commander and formation synergies
          </Text>
        </View>
        <Text style={[styles.detailsToggleAction, { color: theme.colors.gold }]}>
          {showBattleDetails ? 'HIDE' : 'SHOW'}
        </Text>
      </Pressable>

      {showBattleDetails ? (
        <>
      <GameCard accent={theme.colors.gold} faction={activeFaction}>
        <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>ACTIVE ORDER</Text>
        <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
          {activeFormationShape.layout} · {activeFormationShape.name} · {doctrine?.name}
        </Text>
        <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
          Attack ×{formationAnalysis.attackMultiplier.toFixed(2)} · Armor ×{formationAnalysis.armorMultiplier.toFixed(2)} · Speed ×{formationAnalysis.speedMultiplier.toFixed(2)}
        </Text>
      </GameCard>

      <GameCard
        accent={
          formationMatchup.result === 'advantage'
            ? theme.colors.primary
            : formationMatchup.result === 'disadvantage'
              ? theme.colors.danger
              : theme.colors.gold
        }
        faction={activeFaction}
        state={formationMatchup.result === 'disadvantage' ? 'danger' : 'default'}
      >
        <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
          FORMATION MATCHUP
        </Text>
        <Text
          style={[
            styles.doctrineName,
            {
              color:
                formationMatchup.result === 'advantage'
                  ? theme.colors.primary
                  : formationMatchup.result === 'disadvantage'
                    ? theme.colors.danger
                    : theme.colors.text
            }
          ]}
        >
          {formationMatchup.title}
        </Text>
        <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
          {activeFormationShape.layout} {activeFormationShape.name} vs {enemyShape.layout} {enemyShape.name}
        </Text>
        <Text style={[styles.matchupSummary, { color: theme.colors.text }]}>
          {formationMatchup.summary}
        </Text>
        <Text style={[styles.matchupEffect, { color: theme.colors.gold }]}>
          Damage dealt ×{formationMatchup.outgoingDamageMultiplier.toFixed(2)} · Damage received ×{formationMatchup.incomingDamageMultiplier.toFixed(2)}
        </Text>
        {guidanceFeatures.showCounterHints &&
        formationMatchup.result !== 'advantage' &&
        unlockedCounters.length > 0 ? (
          <Text style={[styles.matchupHint, { color: theme.colors.textMuted }]}>
            Counter available above: {unlockedCounters.map(shape => shape.layout + ' ' + shape.name).join(' · ')}
          </Text>
        ) : null}
      </GameCard>

      {fantasyCombatEdge ? (
        <GameCard
          accent={
            fantasyCombatEdge.favorable
              ? factionAccent
              : theme.colors.danger
          }
          faction={activeFaction}
          state={fantasyCombatEdge.favorable ? 'ready' : 'danger'}
        >
          <View style={styles.planHeader}>
            <View style={styles.planCopy}>
              <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
                ARCANE MATCHUP
              </Text>
              <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
                {fantasyCombatEdge.title}
              </Text>
            </View>
            <StatusPill
              label={
                fantasyCombatEdge.favorable
                  ? 'ARCANE EDGE'
                  : 'COUNTERED'
              }
              tone={
                fantasyCombatEdge.favorable
                  ? 'ready'
                  : 'elite'
              }
            />
          </View>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {fantasyCombatEdge.detail}
          </Text>
          <Text style={[styles.matchupEffect, { color: theme.colors.gold }]}>
            Magic squads {fantasyCombatEdge.unitCount} · Damage dealt ×{fantasyCombatEdge.attackMultiplier.toFixed(2)} · Damage received ×{fantasyCombatEdge.incomingDamageMultiplier.toFixed(2)}
          </Text>
        </GameCard>
      ) : null}

      {flyingCombatEdge ? (
        <GameCard
          accent={
            flyingCombatEdge.favorable
              ? theme.colors.primary
              : theme.colors.danger
          }
          faction={activeFaction}
          state={flyingCombatEdge.favorable ? 'ready' : 'danger'}
        >
          <View style={styles.planHeader}>
            <View style={styles.planCopy}>
              <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
                AERIAL MATCHUP
              </Text>
              <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
                {flyingCombatEdge.title}
              </Text>
            </View>
            <StatusPill
              label={
                flyingCombatEdge.favorable
                  ? 'AIR EDGE'
                  : 'ANTI-AIR'
              }
              tone={
                flyingCombatEdge.favorable
                  ? 'ready'
                  : 'elite'
              }
            />
          </View>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {flyingCombatEdge.detail}
          </Text>
          <Text style={[styles.matchupEffect, { color: theme.colors.gold }]}>
            Flying squads {flyingCombatEdge.unitCount} · Damage dealt ×{flyingCombatEdge.attackMultiplier.toFixed(2)} · Damage received ×{flyingCombatEdge.incomingDamageMultiplier.toFixed(2)}
          </Text>
        </GameCard>
      ) : null}

      {largeCombatEdge ? (
        <GameCard
          accent={
            largeCombatEdge.favorable
              ? theme.colors.gold
              : theme.colors.danger
          }
          faction={activeFaction}
          state={largeCombatEdge.favorable ? 'ready' : 'danger'}
        >
          <View style={styles.planHeader}>
            <View style={styles.planCopy}>
              <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
                LARGE-UNIT MATCHUP
              </Text>
              <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
                {largeCombatEdge.title}
              </Text>
            </View>
            <StatusPill
              label={
                largeCombatEdge.favorable
                  ? 'BREAKTHROUGH'
                  : 'ANTI-LARGE'
              }
              tone={
                largeCombatEdge.favorable
                  ? 'ready'
                  : 'elite'
              }
            />
          </View>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {largeCombatEdge.detail}
          </Text>
          <Text style={[styles.matchupEffect, { color: theme.colors.gold }]}>
            Large units {largeCombatEdge.unitCount} · Damage dealt ×{largeCombatEdge.attackMultiplier.toFixed(2)} · Damage received ×{largeCombatEdge.incomingDamageMultiplier.toFixed(2)}
          </Text>
        </GameCard>
      ) : null}

      {hybridCombatEdge ? (
        <GameCard
          accent={
            hybridCombatEdge.favorable
              ? theme.colors.gold
              : theme.colors.danger
          }
          faction={activeFaction}
          state={hybridCombatEdge.favorable ? 'ready' : 'danger'}
        >
          <View style={styles.planHeader}>
            <View style={styles.planCopy}>
              <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
                LEGENDARY HYBRID MATCHUP
              </Text>
              <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
                {hybridCombatEdge.title}
              </Text>
            </View>
            <StatusPill
              label={
                hybridCombatEdge.favorable
                  ? 'LEGENDARY EDGE'
                  : 'COUNTERED'
              }
              tone={
                hybridCombatEdge.favorable
                  ? 'ready'
                  : 'elite'
              }
            />
          </View>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {hybridCombatEdge.detail}
          </Text>
          <Text style={[styles.matchupEffect, { color: theme.colors.gold }]}>
            Hybrids {hybridCombatEdge.unitCount} · Damage dealt ×{hybridCombatEdge.attackMultiplier.toFixed(2)} · Damage received ×{hybridCombatEdge.incomingDamageMultiplier.toFixed(2)}
          </Text>
        </GameCard>
      ) : null}

      {marcherDoctrineActive && activeMarcherWarningChoice ? (
        <GameCard accent={theme.colors.gold}>
          <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
            BORDER MARCH DOCTRINE
          </Text>
          <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
            {activeMarcherWarningChoice.name}
          </Text>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {activeMarcherWarningChoice.effectText}
          </Text>
        </GameCard>
      ) : null}

      {loyalistApproachActive && activeLastLoyalistsChoice ? (
        <GameCard accent={theme.colors.gold}>
          <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
            PRETENDER PREPARATION
          </Text>
          <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
            {activeLastLoyalistsChoice.name}
          </Text>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {activeLastLoyalistsChoice.effectText}
          </Text>
        </GameCard>
      ) : null}

      {activeFactionMandate ? (
        <GameCard accent={factionAccent} faction={activeFaction}>
          <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
            {activeFaction === 'elf' ? 'WORLDROOT ATTUNEMENT' : 'CLAN PACT'}
          </Text>
          <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
            {activeFactionMandate.name}
          </Text>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {activeFactionMandate.effectText}
          </Text>
        </GameCard>
      ) : null}

      {activeRoyalDecree ? (
        <GameCard accent={theme.colors.primary}>
          <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
            ROYAL DECREE
          </Text>
          <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
            {activeRoyalDecree.name}
          </Text>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {activeRoyalDecree.effectText}
          </Text>
        </GameCard>
      ) : null}

      {activeCommanderPath ? (
        <GameCard accent={factionAccent} faction={activeFaction}>
          <View style={styles.commandHeader}>
            <View style={styles.commandCopy}>
              <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>COMMANDER</Text>
              <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
                {activeCommanderPath.name}
              </Text>
            </View>
            <Pill label={activeCommanderPath.skill.effectType.replace('_', ' ').toUpperCase()} />
          </View>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {activeCommanderPath.passiveDescription}
          </Text>
          <Text style={[styles.skillName, { color: theme.colors.gold }]}>
            {activeCommanderPath.skill.name}: {activeCommanderPath.skill.description}
          </Text>
        </GameCard>
      ) : null}

      {formationBonuses.length > 0 ? (
        <>
          <SectionTitle title="Formation synergies" trailing={String(formationBonuses.length)} />
          <View style={styles.bonusList}>
            {formationBonuses.map(bonus => (
              <GameCard key={bonus.id} accent={theme.colors.primary}>
                <View style={styles.bonusHeader}>
                  <Text style={[styles.bonusName, { color: theme.colors.text }]}>{bonus.name}</Text>
                  <Text style={[styles.bonusValue, { color: theme.colors.primary }]}>{bonus.value}</Text>
                </View>
              </GameCard>
            ))}
          </View>
        </>
      ) : null}
        </>
      ) : null}

      <SectionTitle title="Army readiness" trailing={String(armyReadiness) + '%'} />
      <TutorialFocus
        active={tutorialFocus?.kind === 'battle-readiness'}
        label={tutorialFocus?.kind === 'battle-readiness' ? tutorialFocus.label : undefined}
      >
      <GameCard
        faction={activeFaction}
        state={
          armyReadiness >= 70
            ? 'ready'
            : armyReadiness >= 50
              ? 'default'
              : 'danger'
        }
        accent={armyReadiness >= 70 ? factionAccent : theme.colors.gold}
      >
        <View style={styles.readinessHeader}>
          <View>
            <Text style={[styles.readinessTitle, { color: theme.colors.text }]}>
              {readinessProfile.label}
            </Text>
            <Text style={[styles.readinessHint, { color: theme.colors.textMuted }]}>
              {armyReadiness >= 70
                ? 'No combat penalty. You can keep campaigning without resupplying.'
                : 'Repeated fighting is now reducing combat effectiveness until the army rests.'}
            </Text>
          </View>
          <StatusPill
            label={armyReadiness >= 70 ? 'FULL EFFECT' : 'FATIGUED'}
            tone={armyReadiness >= 70 ? 'ready' : armyReadiness >= 50 ? 'available' : 'elite'}
          />
        </View>
        <ProgressBar
          value={armyReadiness / 100}
          color={armyReadiness >= 70 ? factionAccent : theme.colors.gold}
        />
        {armyReadiness < 70 ? (
          <Text style={[styles.readinessPenalty, { color: theme.colors.gold }]}>
            Current effect · HP ×{readinessProfile.hpMultiplier.toFixed(2)} · ATK ×{readinessProfile.attackMultiplier.toFixed(2)} · SPD ×{readinessProfile.speedMultiplier.toFixed(2)}
          </Text>
        ) : null}
        {armyReadiness < 100 ? (
          <View style={styles.resupplyButton}>
            <SecondaryButton
              label={
                resources.provisions >= armyResupplyCost
                  ? 'Rest & Resupply · ' + armyResupplyCost + ' provisions'
                  : 'Need ' + armyResupplyCost + ' provisions to fully recover'
              }
              disabled={resources.provisions < armyResupplyCost}
              onPress={restAndResupplyArmy}
            />
          </View>
        ) : null}
        {tutorialFocus?.kind === 'battle-readiness' ? (
          <View style={styles.resupplyButton}>
            <SecondaryButton
              label="Understood"
              onPress={onTutorialFocusComplete}
            />
          </View>
        ) : null}
      </GameCard>
      </TutorialFocus>

      <SectionTitle title="Readiness" />
      <GameCard
        faction={activeFaction}
        state={formationFull && hasFood && hasMedicine ? 'ready' : !formationFull || !hasFood ? 'danger' : 'default'}
      >
        <View style={styles.readinessHeader}>
          <Text style={[styles.readinessTitle, { color: theme.colors.text }]}>Campaign supplies</Text>
          <StatusPill
            label={
              !formationFull
                ? 'SQUAD MISSING'
                : hasFood && hasMedicine
                  ? 'READY'
                  : !hasFood
                    ? 'FOOD MISSING'
                    : 'PARTIAL'
            }
            tone={formationFull && hasFood && hasMedicine ? 'ready' : !formationFull || !hasFood ? 'elite' : 'available'}
          />
        </View>
        <View style={styles.readinessList}>
          <View style={styles.readinessRow}>
            <StatusPill label={formationFull ? 'FULL' : 'UNDER'} tone={formationFull ? 'done' : 'elite'} />
            <Text style={[styles.readinessText, { color: theme.colors.text }]}>
              Formation · {activeUnits.length}/{activeSquadCap} squads
            </Text>
          </View>
          <View style={styles.readinessRow}>
            <StatusPill label={hasFood ? 'PACKED' : 'MISSING'} tone={hasFood ? 'done' : 'elite'} />
            <Text style={[styles.readinessText, { color: theme.colors.text }]}>Food</Text>
          </View>
          <View style={styles.readinessRow}>
            <StatusPill label={hasMedicine ? 'PACKED' : 'OPTIONAL'} tone={hasMedicine ? 'done' : 'available'} />
            <Text style={[styles.readinessText, { color: theme.colors.text }]}>Medicine</Text>
          </View>
        </View>
      </GameCard>

      {rewardedAdMessage ? (
        <Text style={[styles.adMessage, { color: theme.colors.textMuted }]}>{rewardedAdMessage}</Text>
      ) : null}

      <TutorialFocus
        active={tutorialFocus?.kind === 'battle-begin'}
        label={tutorialFocus?.kind === 'battle-begin' ? tutorialFocus.label : undefined}
      >
        <GameCard
          accent={
            preparation.status === 'ready'
              ? theme.colors.primary
              : preparation.status === 'risky'
                ? theme.colors.gold
                : theme.colors.danger
          }
          ornament={false}
          style={styles.commitCard}
        >
          <View style={styles.commitHeader}>
            <View style={styles.commitCopy}>
              <Text
                style={[
                  styles.commitEyebrow,
                  { color: theme.colors.textMuted }
                ]}
              >
                FINAL CHECK
              </Text>
              <Text
                style={[
                  styles.commitTitle,
                  { color: theme.colors.text }
                ]}
              >
                {showSevereBattleConfirmation
                  ? 'Commit despite the warning?'
                  : preparation.status === 'ready'
                    ? 'Army ready to deploy'
                    : preparation.status === 'risky'
                      ? 'You can deploy with risk'
                      : 'Preparation is incomplete'}
              </Text>
            </View>
            {tacticalGuidance !== 'off' ? (
              <StatusPill
                label={preparationLabel}
                tone={preparationTone}
              />
            ) : null}
          </View>

          {showSevereBattleConfirmation ? (
            <>
              <Text
                style={[
                  styles.commitBody,
                  { color: theme.colors.textMuted }
                ]}
              >
                Multiple preparation problems remain. This is not a guaranteed defeat, but the enemy will not be weakened if you proceed.
              </Text>
              <View style={styles.severeConfirmActions}>
                <SecondaryButton
                  label="Keep preparing"
                  onPress={() =>
                    setShowSevereBattleConfirmation(false)
                  }
                />
                <PrimaryButton
                  label="Fight anyway"
                  onPress={() => beginBattle(true)}
                />
              </View>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.commitBody,
                  { color: theme.colors.textMuted }
                ]}
              >
                {tacticalGuidance === 'off'
                  ? 'Your current formation, supplies and Readiness will be used as shown above.'
                  : preparation.status === 'ready'
                    ? 'No major preparation weakness is currently detected.'
                    : preparation.status === 'risky'
                      ? 'The battle is viable, but one or more preparation weaknesses remain.'
                      : 'Full Guidance will ask for confirmation before committing this force.'}
              </Text>
              <View style={styles.commitAction}>
                <PrimaryButton
                  label={
                    requiresBattleConfirmation
                      ? 'Begin Battle · Underprepared'
                      : 'Begin Battle'
                  }
                  onPress={() => beginBattle()}
                />
              </View>
            </>
          )}
        </GameCard>
      </TutorialFocus>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 12 },
  prepAtGlance: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  commitCard: {
    marginTop: 2
  },
  commitHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10
  },
  commitCopy: {
    flex: 1,
    minWidth: 0
  },
  commitEyebrow: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '900',
    letterSpacing: 0.9
  },
  commitTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    marginTop: 3
  },
  commitBody: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 8
  },
  commitAction: {
    marginTop: 12
  },
  severeConfirmActions: {
    gap: 8,
    marginTop: 12
  },

  enemyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  enemyMark: { width: 58, height: 64, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  enemyCopy: { flex: 1 },
  enemyName: { fontSize: 16, fontWeight: '900' },
  enemyMeta: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  enemyFormation: { fontSize: 11, fontWeight: '900', marginTop: 7 },
  enemyArmy: { fontSize: 10.5, fontWeight: '900', marginTop: 4 },
  enemyTactic: { fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  enemyComposition: { fontSize: 9.5, lineHeight: 14, marginTop: 5, fontWeight: '800' },
  scoutButton: { marginTop: 12 },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10
  },
  planCopy: { flex: 1 },
  planTitle: { fontSize: 16, fontWeight: '900', marginTop: 3 },
  planMatchup: { fontSize: 10.5, lineHeight: 15, marginTop: 7 },
  planStatuses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10
  },
  planHint: { fontSize: 9.5, lineHeight: 14, fontWeight: '900', marginTop: 9 },
  preparationSummary: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 10,
    marginTop: 10
  },
  preparationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 9
  },
  preparationCopy: { flex: 1 },
  preparationEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9
  },
  preparationTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2
  },
  preparationSummaryText: {
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 6
  },
  preparationDetails: {
    gap: 7,
    marginTop: 9
  },
  preparationFactor: {
    gap: 2
  },
  preparationFactorTitle: {
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: '900'
  },
  preparationFactorDetail: {
    fontSize: 8.8,
    lineHeight: 13
  },
  preparationModeHint: {
    fontSize: 8.5,
    lineHeight: 13,
    marginTop: 7
  },
  preparationAction: {
    marginTop: 10,
    gap: 6
  },
  preparationActionHint: {
    fontSize: 8.2,
    lineHeight: 12,
    textAlign: 'center',
    paddingHorizontal: 5
  },
  unitList: { gap: 8 },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitStats: { alignItems: 'flex-end', gap: 3 },
  stat: { fontSize: 10, fontWeight: '800' },
  doctrineLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  doctrineName: { fontSize: 16, fontWeight: '900', marginTop: 3 },
  doctrineBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  matchupSummary: { fontSize: 11, lineHeight: 16, marginTop: 8, fontWeight: '700' },
  formationDuel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 4
  },
  formationVersus: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  formationVersusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9
  },
  formationRead: {
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: '800',
    marginTop: 5
  },
  matchupEffect: { fontSize: 10, lineHeight: 15, marginTop: 7, fontWeight: '900' },
  matchupHint: { fontSize: 9.5, lineHeight: 14, marginTop: 7 },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10
  },
  recommendationCopy: { flex: 1 },
  recommendationTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 4
  },
  recommendationStrength: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '800',
    marginTop: 9
  },
  recommendationRisk: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '800',
    marginTop: 5
  },
  recommendationHint: {
    fontSize: 9.5,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 7
  },
  adjustmentList: { marginTop: 12 },
  adjustmentHeading: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  adjustmentRow: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 7
  },
  adjustmentIndex: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  adjustmentIndexText: {
    fontSize: 10,
    fontWeight: '900'
  },
  adjustmentCopy: { flex: 1 },
  adjustmentOpen: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginTop: 3
  },
  adjustmentTitle: {
    fontSize: 10.5,
    fontWeight: '900'
  },
  adjustmentDetail: {
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2
  },
  presetSwitchStrip: { gap: 8, paddingRight: 4 },
  presetSwitchCard: {
    width: 184,
    minHeight: 112,
    borderRadius: 15,
    borderWidth: 1.5,
    padding: 10
  },
  presetSwitchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7
  },
  presetSwitchTitle: { fontSize: 12.5, fontWeight: '900' },
  presetSwitchName: { fontSize: 10.5, fontWeight: '900', marginTop: 8 },
  presetSwitchMeta: { fontSize: 8.8, lineHeight: 13, marginTop: 4 },
  presetSwitchEffect: { fontSize: 8.8, fontWeight: '900', marginTop: 7 },
  presetSwitchRead: { fontSize: 8.5, lineHeight: 12, marginTop: 5 },
  presetSwitchHint: {
    fontSize: 9.5,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 10
  },
  formationSwitchStrip: { gap: 8, paddingRight: 4 },
  formationSwitchCard: {
    width: 154,
    minHeight: 92,
    borderRadius: 15,
    borderWidth: 1.5,
    padding: 10
  },
  formationSwitchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7
  },
  formationSwitchLayout: { fontSize: 15, fontWeight: '900' },
  formationSwitchName: { fontSize: 11.5, fontWeight: '900', marginTop: 8 },
  formationSwitchEffect: { fontSize: 8.8, fontWeight: '900', marginTop: 6 },
  switchHint: { fontSize: 9.5, lineHeight: 14, textAlign: 'center', paddingHorizontal: 10 },
  detailsToggle: {
    minHeight: 58,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  detailsToggleTitle: { fontSize: 13, fontWeight: '900' },
  detailsToggleBody: { fontSize: 9.5, lineHeight: 14, marginTop: 2, maxWidth: 260 },
  detailsToggleAction: { fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  commandHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  commandCopy: { flex: 1 },
  skillName: { fontSize: 10.5, lineHeight: 16, marginTop: 8, fontWeight: '800' },
  bonusList: { gap: 7 },
  bonusHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  bonusName: { fontSize: 12, fontWeight: '900' },
  bonusValue: { fontSize: 10, fontWeight: '900' },
  readinessHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  readinessTitle: { fontSize: 14, fontWeight: '900' },
  readinessList: { gap: 10 },
  readinessRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  readinessText: { fontSize: 13, fontWeight: '700' },
  readinessHint: { fontSize: 10.5, lineHeight: 15, marginTop: 3, maxWidth: 250 },
  readinessPenalty: { fontSize: 10, lineHeight: 15, fontWeight: '900', marginTop: 9 },
  resupplyButton: { marginTop: 11 },
  adMessage: { fontSize: 10, textAlign: 'center' }
});
