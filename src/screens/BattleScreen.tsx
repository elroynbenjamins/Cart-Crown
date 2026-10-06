import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState } from 'react-native';
import {
  getEncounterForChapter,
  getEnemyArmyProfile,
  getEnemyFormationTactic,
  getEnemyRoleAssignments
} from '../game/encounters';
import {
  clampArmyReadiness,
  getArmyReadinessProfile,
  getEnemyStrikePressure,
  getTacticalSpeedDamageMultiplier,
  getUnitCombatProfile
} from '../game/balance';
import {
  getFormationMatchup,
  getFormationShape
} from '../game/formation';
import {
  getFantasyCombatEdge,
  getFlyingCombatEdge,
  getLargeCombatEdge,
  getHybridCombatEdge
} from '../game/progression';
import { getEnemyFantasyThreatAssessment } from '../game/enemyFantasy';
import type { EncounterId } from '../game/encounters';
import { useGame } from '../game/GameProvider';
import {
  appStateAllowsBattleProgress,
  createOneShotGate
} from '../game/mobileSession';
import { useGameTheme } from '../theme/ThemeProvider';
import type { CommanderSkillEffectType, UnitRole } from '../game/types';
import { PortraitBattleView } from '../ui/portraitBattle/PortraitBattleView';
import { appendExchange, type ExchangeRecord } from '../ui/portraitBattle/model';

type ActiveEffect = {
  type: CommanderSkillEffectType;
  power: number;
  remaining: number;
};

type BattleSpeed = 1 | 2;
type FormationIntegrityState =
  | 'stable'
  | 'pressured'
  | 'breaking'
  | 'breached';

function getFormationIntegrityState(value: number): FormationIntegrityState {
  if (value > 70) return 'stable';
  if (value > 40) return 'pressured';
  if (value > 15) return 'breaking';
  return 'breached';
}

function integrityAttackMultiplier(state: FormationIntegrityState) {
  return state === 'stable'
    ? 1
    : state === 'pressured'
      ? 0.98
      : state === 'breaking'
        ? 0.92
        : 0.82;
}

function integrityDefenseMultiplier(state: FormationIntegrityState) {
  return state === 'stable'
    ? 1
    : state === 'pressured'
      ? 0.98
      : state === 'breaking'
        ? 0.9
        : 0.78;
}

function integrityVulnerabilityMultiplier(state: FormationIntegrityState) {
  return state === 'stable'
    ? 1
    : state === 'pressured'
      ? 1.02
      : state === 'breaking'
        ? 1.08
        : 1.16;
}

function integrityLabel(state: FormationIntegrityState) {
  return state === 'stable'
    ? 'Stable'
    : state === 'pressured'
      ? 'Pressured'
      : state === 'breaking'
        ? 'Breaking'
        : 'Breached';
}

type ExchangeFeedback = {
  outgoing: number;
  incoming: number;
  healed: number;
  activeSlot: number | null;
  enemySlot: number | null;
  supportSlots: number[];
  activeRole: UnitRole | null;
  commanderSkillName: string | null;
  ongoingDamage: number;
};

export type BattleCombatSummary = {
  victory: boolean;
  exchanges: number;
  damageDealt: number;
  damageTaken: number;
  healing: number;
  remainingHp: number;
  maxHp: number;
  enemyRemainingHp: number;
  enemyMaxHp: number;
  startingReadiness: number;
  readinessWear: number;
  resultingReadiness: number;
};

const combatLines = [
  'The front line catches the enemy advance.',
  'Your formation turns spacing into a clean counterattack.',
  'The enemy regroups around its strongest fighters.',
  'Your squads hold their lanes and press the center.',
  'The enemy line starts to fracture.',
  'Your army drives the remaining fighters from the field.'
];

export function BattleScreen({
  encounterId,
  pausedForTutorial = false,
  onFinished,
  onDefeated
}: {
  encounterId: EncounterId;
  pausedForTutorial?: boolean;
  onFinished: (summary: BattleCombatSummary) => void;
  onDefeated: (summary: BattleCombatSummary) => void;
}) {
  const { theme } = useGameTheme();
  const {
    units,
    formation,
    activeFormationShape,
    formationAnalysis,
    activeSquadCap,
    activeFaction,
    chapterNumber,
    armyReadiness,
    recordBattleWear,
    activeCommanderPath,
    activeMarcherWarningChoice,
    activeLastLoyalistsChoice,
    activeRoyalDecree,
    activeFactionMandate,
    settlementEffects
  } = useGame();

  const encounter =
    getEncounterForChapter(
      encounterId,
      chapterNumber
    );
  const enemyTactic = useMemo(
    () => getEnemyFormationTactic(encounterId),
    [encounterId]
  );
  const enemyShape = useMemo(
    () => getFormationShape(enemyTactic.formationShapeId),
    [enemyTactic.formationShapeId]
  );
  const enemyArmyProfile = useMemo(
    () => getEnemyArmyProfile(encounterId),
    [encounterId]
  );
  const enemyAssignments = useMemo(
    () =>
      getEnemyRoleAssignments(
        encounterId,
        enemyShape.rows,
        encounter.enemyCount
      ),
    [encounter.enemyCount, encounterId, enemyShape.rows]
  );
  const formationMatchup = useMemo(
    () => getFormationMatchup(activeFormationShape.id, enemyShape.id),
    [activeFormationShape.id, enemyShape.id]
  );
  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;
  const marcherDoctrineActive = [
    'siege_road',
    'ch3_through_gap',
    'ch3_wolves_wing',
    'ch3_layered_host',
    'lord_marshal_veyr'
  ].includes(encounterId);
  const loyalistApproachActive =
    encounterId === 'pretender_general';
  const metaAllianceActive = [
    'three_seals_convergence',
    'ashen_triumvirate',
    'unbound_beacon'
  ].includes(encounterId);
  const marcherAttackMultiplier =
    marcherDoctrineActive && activeMarcherWarningChoice
      ? activeMarcherWarningChoice.attackMultiplier
      : 1;
  const marcherArmorMultiplier =
    marcherDoctrineActive && activeMarcherWarningChoice
      ? activeMarcherWarningChoice.armorMultiplier
      : 1;
  const marcherSpeedMultiplier =
    marcherDoctrineActive && activeMarcherWarningChoice
      ? activeMarcherWarningChoice.speedMultiplier
      : 1;
  const loyalistAttackMultiplier =
    loyalistApproachActive && activeLastLoyalistsChoice
      ? activeLastLoyalistsChoice.attackMultiplier
      : 1;
  const loyalistArmorMultiplier =
    loyalistApproachActive && activeLastLoyalistsChoice
      ? activeLastLoyalistsChoice.armorMultiplier
      : 1;
  const loyalistRetaliationMultiplier =
    loyalistApproachActive && activeLastLoyalistsChoice
      ? activeLastLoyalistsChoice.retaliationMultiplier
      : 1;
  const decreeAttackMultiplier =
    activeRoyalDecree?.attackMultiplier ?? 1;
  const decreeArmorMultiplier =
    activeRoyalDecree?.armorMultiplier ?? 1;
  const mandateAttackMultiplier =
    activeFactionMandate?.attackMultiplier ?? 1;
  const mandateArmorMultiplier =
    activeFactionMandate?.armorMultiplier ?? 1;
  const mandateSpeedMultiplier =
    activeFactionMandate?.speedMultiplier ?? 1;
  const mandateCommanderSkillMultiplier =
    activeFactionMandate?.commanderSkillPowerMultiplier ?? 1;
  const allianceAttackMultiplier = metaAllianceActive ? 1.1 : 1;
  const allianceArmorMultiplier = metaAllianceActive ? 1.08 : 1;

  const activeUnits = useMemo(
    () =>
      formation
        .filter((unitId): unitId is string => Boolean(unitId))
        .map(unitId => units.find(unit => unit.id === unitId))
        .filter((unit): unit is NonNullable<typeof unit> => Boolean(unit)),
    [formation, units]
  );

  const fantasyCombatEdge = useMemo(
    () =>
      getFantasyCombatEdge(
        activeUnits,
        enemyArmyProfile.id
      ),
    [activeUnits, enemyArmyProfile.id]
  );

  const flyingCombatEdge = useMemo(
    () =>
      getFlyingCombatEdge(
        activeUnits,
        enemyArmyProfile.id
      ),
    [activeUnits, enemyArmyProfile.id]
  );

  const largeCombatEdge = useMemo(
    () =>
      getLargeCombatEdge(
        activeUnits,
        enemyArmyProfile.id
      ),
    [activeUnits, enemyArmyProfile.id]
  );
  const hybridCombatEdge = useMemo(
    () =>
      getHybridCombatEdge(
        activeUnits,
        enemyArmyProfile.id
      ),
    [activeUnits, enemyArmyProfile.id]
  );
  const enemyFantasyThreat = useMemo(
    () =>
      getEnemyFantasyThreatAssessment(
        encounter,
        activeUnits
      ),
    [activeUnits, encounter]
  );

  const activeFormationSlots = useMemo(
    () =>
      formation
        .map((unitId, slot) => (unitId ? slot : null))
        .filter((slot): slot is number => slot !== null),
    [formation]
  );

  const combatProfile = useMemo(
    () => getUnitCombatProfile(activeUnits),
    [activeUnits]
  );
  const readinessProfile = getArmyReadinessProfile(armyReadiness);
  const partyMaxHp =
    combatProfile.maxHp > 0
      ? Math.max(
          1,
          Math.round(combatProfile.maxHp * readinessProfile.hpMultiplier)
        )
      : 0;
  const partyAttack = activeUnits.reduce((total, unit) => {
    const commanderMultiplier =
      activeCommanderPath?.favoredRoles.includes(unit.role)
        ? activeCommanderPath.attackMultiplier
        : 1;
    return total + unit.attack * commanderMultiplier;
  }, 0) * readinessProfile.attackMultiplier;

  const favoredCount = activeCommanderPath
    ? activeUnits.filter(unit => activeCommanderPath.favoredRoles.includes(unit.role)).length
    : 0;
  const favoredFraction = activeUnits.length > 0 ? favoredCount / activeUnits.length : 0;
  const commanderArmorMultiplier = activeCommanderPath
    ? 1 + (activeCommanderPath.armorMultiplier - 1) * favoredFraction
    : 1;
  const commanderSpeedMultiplier = activeCommanderPath
    ? 1 + (activeCommanderPath.speedMultiplier - 1) * favoredFraction
    : 1;

  const [partyHp, setPartyHp] = useState(partyMaxHp);
  const [enemyHp, setEnemyHp] = useState(encounter.enemyHp);
  const [turn, setTurn] = useState(0);
  const [skillTriggered, setSkillTriggered] = useState(false);
  const [activeEffect, setActiveEffect] = useState<ActiveEffect | null>(null);
  const [battleSpeed, setBattleSpeed] = useState<BattleSpeed>(1);
  const [manualPaused, setManualPaused] = useState(false);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeRecord[]>([]);
  const [appIsActive, setAppIsActive] = useState(
    appStateAllowsBattleProgress(AppState.currentState)
  );
  const [exchangeFeedback, setExchangeFeedback] = useState<ExchangeFeedback | null>(null);
  const [battleTotals, setBattleTotals] = useState({
    damageDealt: 0,
    damageTaken: 0,
    healing: 0
  });
  const [partyIntegrity, setPartyIntegrity] = useState(100);
  const [enemyIntegrity, setEnemyIntegrity] = useState(100);
  const partyIntegrityState = getFormationIntegrityState(partyIntegrity);
  const enemyIntegrityState = getFormationIntegrityState(enemyIntegrity);
  const outcomeCommitGateRef = useRef(
    createOneShotGate()
  );
  const attackPulse = useRef(new Animated.Value(0)).current;
  const impactPulse = useRef(new Animated.Value(0)).current;
  const feedbackPulse = useRef(new Animated.Value(0)).current;
  const [lastAction, setLastAction] = useState(
    enemyArmyProfile.name +
      ' in ' +
      enemyTactic.name +
      ' meets your ' +
      activeFormationShape.name +
      '. ' +
      formationMatchup.title +
      '.'
  );

  const defeated = partyHp <= 0;
  const finished = enemyHp <= 0 && !defeated;
  const battleEnded = finished || defeated;
  const tacticalSpeedDamageMultiplier =
    getTacticalSpeedDamageMultiplier(
      combatProfile.speedStatMultiplier,
      formationAnalysis.speedMultiplier,
      commanderSpeedMultiplier,
      marcherSpeedMultiplier,
      mandateSpeedMultiplier
    ) * readinessProfile.speedMultiplier;
  const supportRecovery = Math.round(
    combatProfile.supportRecovery * formationAnalysis.healingMultiplier
  );
  const enemyPressureMultiplier =
    enemyTactic.attackMultiplier *
    (1 + (enemyTactic.speedMultiplier - 1) * 0.6);
  const liveEnemyCount =
    enemyHp <= 0
      ? 0
      : Math.max(
          1,
          Math.ceil(
            encounter.enemyCount *
              (enemyHp / Math.max(1, encounter.enemyHp))
          )
        );
  const defeatedEnemySlots = useMemo(() => {
    const defeatedCount = Math.max(
      0,
      enemyAssignments.length - liveEnemyCount
    );
    if (defeatedCount === 0) return new Set<number>();
    return new Set(
      enemyAssignments
        .slice(enemyAssignments.length - defeatedCount)
        .map(assignment => assignment.slot)
    );
  }, [enemyAssignments, liveEnemyCount]);
  const bossSlot =
    encounter.difficulty === 'Boss'
      ? enemyAssignments[0]?.slot ?? null
      : null;

  const battleEffects: Array<{
    key: string;
    label: string;
    color: string;
  }> = [];
  if (enemyFantasyThreat) {
    battleEffects.push({
      key: 'enemy-fantasy-threat',
      label:
        enemyFantasyThreat.label +
        (enemyFantasyThreat.countered
          ? ' · countered'
          : ' · exposed'),
      color: enemyFantasyThreat.countered
        ? theme.colors.primary
        : theme.colors.danger
    });
  }
  if (fantasyCombatEdge) {
    battleEffects.push({
      key: 'fantasy-edge',
      label:
        fantasyCombatEdge.title +
        (fantasyCombatEdge.favorable
          ? ' · favorable'
          : ' · countered'),
      color: fantasyCombatEdge.favorable
        ? factionAccent
        : theme.colors.danger
    });
  }
  if (flyingCombatEdge) {
    battleEffects.push({
      key: 'flying-edge',
      label:
        flyingCombatEdge.title +
        (flyingCombatEdge.favorable
          ? ' · favorable'
          : ' · countered'),
      color: flyingCombatEdge.favorable
        ? theme.colors.primary
        : theme.colors.danger
    });
  }
  if (largeCombatEdge) {
    battleEffects.push({
      key: 'large-edge',
      label:
        largeCombatEdge.title +
        (largeCombatEdge.favorable
          ? ' · breakthrough'
          : ' · countered'),
      color: largeCombatEdge.favorable
        ? theme.colors.gold
        : theme.colors.danger
    });
  }
  if (hybridCombatEdge) {
    battleEffects.push({
      key: 'hybrid-edge',
      label:
        hybridCombatEdge.title +
        (hybridCombatEdge.favorable
          ? ' · legendary edge'
          : ' · countered'),
      color: hybridCombatEdge.favorable
        ? theme.colors.gold
        : theme.colors.danger
    });
  }
  if (metaAllianceActive) {
    battleEffects.push({
      key: 'alliance',
      label: 'Three Seals · +10% ATK / +8% ARM',
      color: theme.colors.gold
    });
  }
  if (activeFactionMandate) {
    battleEffects.push({
      key: 'mandate',
      label: activeFactionMandate.name,
      color: factionAccent
    });
  }
  if (activeRoyalDecree) {
    battleEffects.push({
      key: 'decree',
      label: activeRoyalDecree.name,
      color: theme.colors.primary
    });
  }
  if (loyalistApproachActive && activeLastLoyalistsChoice) {
    battleEffects.push({
      key: 'loyalists',
      label: activeLastLoyalistsChoice.name,
      color: theme.colors.gold
    });
  }
  if (marcherDoctrineActive && activeMarcherWarningChoice) {
    battleEffects.push({
      key: 'marcher',
      label: activeMarcherWarningChoice.name,
      color: theme.colors.primary
    });
  }
  if (activeCommanderPath) {
    battleEffects.push({
      key: 'commander',
      label: activeCommanderPath.name + ' · ' + activeCommanderPath.skill.name,
      color: theme.colors.gold
    });
  }
  battleEffects.push({
    key: 'formation-integrity',
    label: 'Your line · ' + integrityLabel(partyIntegrityState),
    color:
      partyIntegrityState === 'stable'
        ? factionAccent
        : partyIntegrityState === 'pressured'
          ? theme.colors.gold
          : theme.colors.danger
  });
  battleEffects.push({
    key: 'enemy-integrity',
    label: 'Enemy line · ' + integrityLabel(enemyIntegrityState),
    color:
      enemyIntegrityState === 'stable'
        ? theme.colors.textMuted
        : enemyIntegrityState === 'pressured'
          ? theme.colors.gold
          : theme.colors.danger
  });
  useEffect(() => {
    if (!exchangeFeedback || !appIsActive || manualPaused || pausedForTutorial) return;

    const duration = battleSpeed === 2 ? 85 : 135;
    attackPulse.stopAnimation();
    impactPulse.stopAnimation();
    feedbackPulse.stopAnimation();
    attackPulse.setValue(0);
    impactPulse.setValue(0);
    feedbackPulse.setValue(0);

    const animation = Animated.parallel([
      Animated.sequence([
        Animated.timing(attackPulse, {
          toValue: 1,
          duration,
          useNativeDriver: true
        }),
        Animated.timing(attackPulse, {
          toValue: 0,
          duration,
          useNativeDriver: true
        })
      ]),
      Animated.sequence([
        Animated.timing(impactPulse, {
          toValue: 1,
          duration: Math.max(70, Math.round(duration * 0.8)),
          useNativeDriver: true
        }),
        Animated.timing(impactPulse, {
          toValue: 0,
          duration: Math.max(70, Math.round(duration * 0.8)),
          useNativeDriver: true
        })
      ]),
      Animated.sequence([
        Animated.timing(feedbackPulse, {
          toValue: 1,
          duration,
          useNativeDriver: true
        }),
        Animated.timing(feedbackPulse, {
          toValue: 0,
          duration,
          useNativeDriver: true
        })
      ])
    ]);
    animation.start();
    return () => {
      animation.stop();
      attackPulse.setValue(0);
      impactPulse.setValue(0);
      feedbackPulse.setValue(0);
    };
  }, [
    appIsActive,
    manualPaused,
    pausedForTutorial,
    attackPulse,
    battleSpeed,
    exchangeFeedback,
    feedbackPulse,
    impactPulse
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      nextState => {
        setAppIsActive(
          appStateAllowsBattleProgress(nextState)
        );
      }
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (
      battleEnded ||
      !appIsActive ||
      manualPaused ||
      pausedForTutorial
    ) {
      return;
    }

    const timer = setTimeout(() => {
      let effect = activeEffect;
      let skillDamage = 0;
      let commanderSkillName: string | null = null;
      let action = combatLines[Math.min(turn, combatLines.length - 1)] ?? combatLines[combatLines.length - 1]!;
      const activeSlot =
        activeFormationSlots.length > 0
          ? activeFormationSlots[turn % activeFormationSlots.length]!
          : null;
      const attackingUnit =
        activeSlot !== null
          ? units.find(unit => unit.id === formation[activeSlot]) ?? null
          : null;
      const exchangeEnemyCount =
        enemyHp <= 0
          ? 0
          : Math.max(
              1,
              Math.ceil(
                encounter.enemyCount *
                  (enemyHp / Math.max(1, encounter.enemyHp))
              )
            );
      const liveEnemyAssignments = enemyAssignments.slice(
        0,
        exchangeEnemyCount
      );
      const targetAssignment =
        liveEnemyAssignments.length > 0
          ? liveEnemyAssignments[turn % liveEnemyAssignments.length]!
          : null;

      const commanderSkillTurn =
        settlementEffects.commanderSkillEarlyTrigger ? 0 : 1;

      if (
        activeCommanderPath &&
        !skillTriggered &&
        turn === commanderSkillTurn
      ) {
        const skill = activeCommanderPath.skill;
        commanderSkillName = skill.name;
        const adjustedSkillPower = Math.max(
          1,
          Math.round(
            skill.power *
              settlementEffects.commanderSkillPowerMultiplier *
              mandateCommanderSkillMultiplier
          )
        );
        setSkillTriggered(true);
        action =
          activeCommanderPath.name +
          ' uses ' +
          skill.name +
          (settlementEffects.commanderSkillEarlyTrigger
            ? ' through the General Staff.'
            : settlementEffects.commanderSkillPowerMultiplier > 1
              ? ' through the Command Network.'
              : '.');

        if (skill.effectType === 'single_damage') {
          skillDamage = adjustedSkillPower;
        } else {
          skillDamage = Math.max(
            6,
            Math.round(adjustedSkillPower * 0.55)
          );
          effect = {
            type: skill.effectType,
            power: adjustedSkillPower,
            remaining: skill.durationExchanges
          };
        }
      }

      let ongoingDamage = 0;
      let attackFactor = 1;
      let retaliationFactor = 1;

      if (effect && effect.remaining > 0) {
        if (effect.type === 'bleed') {
          ongoingDamage += effect.power;
        } else if (effect.type === 'armor_break') {
          attackFactor += 0.15;
        } else if (effect.type === 'morale_break') {
          retaliationFactor -= 0.25;
        }
      }

      const momentum =
        activeFaction === 'orc'
          ? 1 + Math.min(0.28, turn * 0.04 + formationAnalysis.momentumPerExchange * turn * 0.015)
          : 1;

      const rawPlayerStrike = Math.max(
        18,
        Math.round(
          (partyAttack + 5 + turn * 2) *
            formationAnalysis.attackMultiplier *
            marcherAttackMultiplier *
            loyalistAttackMultiplier *
            decreeAttackMultiplier *
            mandateAttackMultiplier *
            allianceAttackMultiplier *
            (fantasyCombatEdge?.attackMultiplier ?? 1) *
            (flyingCombatEdge?.attackMultiplier ?? 1) *
            (largeCombatEdge?.attackMultiplier ?? 1) *
            (hybridCombatEdge?.attackMultiplier ?? 1) *
            (enemyFantasyThreat?.outgoingDamageMultiplier ?? 1) *
            momentum *
            attackFactor *
            tacticalSpeedDamageMultiplier *
            integrityAttackMultiplier(partyIntegrityState)
        )
      );
      const playerDamage = Math.max(
        1,
        Math.round(
          ((rawPlayerStrike + skillDamage + ongoingDamage) /
            (
              enemyTactic.armorMultiplier *
              enemyArmyProfile.armorMultiplier
            )) *
            formationMatchup.outgoingDamageMultiplier *
            integrityVulnerabilityMultiplier(enemyIntegrityState)
        )
      );

      const enemyTimingMultiplier =
        turn === 0
          ? enemyArmyProfile.openingPressureMultiplier
          : enemyArmyProfile.sustainedPressureMultiplier;

      const rawEnemyStrike = getEnemyStrikePressure(
        encounter,
        activeSquadCap,
        turn
      );
      const enemyStrike = Math.max(
        4,
        Math.round(
          (rawEnemyStrike *
            enemyPressureMultiplier *
            enemyTimingMultiplier *
            formationMatchup.incomingDamageMultiplier *
            (fantasyCombatEdge?.incomingDamageMultiplier ?? 1) *
            (flyingCombatEdge?.incomingDamageMultiplier ?? 1) *
            (largeCombatEdge?.incomingDamageMultiplier ?? 1) *
            (hybridCombatEdge?.incomingDamageMultiplier ?? 1) *
            (enemyFantasyThreat?.incomingDamageMultiplier ?? 1) *
            retaliationFactor *
            loyalistRetaliationMultiplier) /
            Math.max(
              0.7,
              combatProfile.armorStatMultiplier *
                formationAnalysis.armorMultiplier *
                commanderArmorMultiplier *
                marcherArmorMultiplier *
                loyalistArmorMultiplier *
                decreeArmorMultiplier *
                mandateArmorMultiplier *
                allianceArmorMultiplier *
                integrityDefenseMultiplier(partyIntegrityState)
            )
        )
      );

      const actualPlayerDamage = Math.min(enemyHp, playerDamage);
      const damagedPartyHp = Math.max(0, partyHp - enemyStrike);
      const actualEnemyDamage = partyHp - damagedPartyHp;
      const healedPartyHp =
        damagedPartyHp <= 0 || supportRecovery <= 0
          ? damagedPartyHp
          : Math.min(partyMaxHp, damagedPartyHp + supportRecovery);
      const actualHealing = healedPartyHp - damagedPartyHp;
      const supportSlots =
        actualHealing > 0
          ? activeFormationSlots.filter(slot => {
              const supportUnitId = formation[slot];
              const supportUnit = units.find(
                unit => unit.id === supportUnitId
              );
              return supportUnit?.role === 'support';
            })
          : [];

      const partyPressureLoss = Math.max(
        2,
        Math.round(
          (actualEnemyDamage / Math.max(1, partyMaxHp)) * 58 +
            Math.max(0, enemyPressureMultiplier - 1) * 18
        )
      );
      const partyRecovery = Math.min(
        6,
        Math.round(
          (actualHealing / Math.max(1, partyMaxHp)) * 30 +
            (formationAnalysis.armorMultiplier > 1 ? 1 : 0)
        )
      );
      const enemyPressureLoss = Math.max(
        2,
        Math.round(
          (actualPlayerDamage / Math.max(1, encounter.enemyHp)) * 64 +
            Math.max(0, formationAnalysis.attackMultiplier - 1) * 14
        )
      );
      const enemyDepthResistance =
        enemyShape.id === 'layered_core_231'
          ? 0.72
          : enemyShape.id === 'iron_wall_501'
            ? 0.82
            : 1;
      const nextPartyIntegrity = Math.max(
        0,
        Math.min(
          100,
          partyIntegrity - partyPressureLoss + partyRecovery
        )
      );
      const nextEnemyIntegrity = Math.max(
        0,
        Math.min(
          100,
          enemyIntegrity -
            Math.max(1, Math.round(enemyPressureLoss * enemyDepthResistance))
        )
      );
      const nextPartyIntegrityState =
        getFormationIntegrityState(nextPartyIntegrity);
      const nextEnemyIntegrityState =
        getFormationIntegrityState(nextEnemyIntegrity);
      const integrityEvent =
        nextPartyIntegrityState !== partyIntegrityState
          ? ' Your line is now ' +
            integrityLabel(nextPartyIntegrityState).toUpperCase() +
            '.'
          : nextEnemyIntegrityState !== enemyIntegrityState
            ? ' Enemy line is now ' +
              integrityLabel(nextEnemyIntegrityState).toUpperCase() +
              '.'
            : '';

      setEnemyHp(Math.max(0, enemyHp - playerDamage));
      setPartyHp(healedPartyHp);
      setPartyIntegrity(nextPartyIntegrity);
      setEnemyIntegrity(nextEnemyIntegrity);
      setExchangeFeedback({
        outgoing: actualPlayerDamage,
        incoming: actualEnemyDamage,
        healed: actualHealing,
        activeSlot,
        enemySlot: targetAssignment?.slot ?? null,
        supportSlots,
        activeRole: attackingUnit?.role ?? null,
        commanderSkillName,
        ongoingDamage
      });
      setBattleTotals(previous => ({
        damageDealt: previous.damageDealt + actualPlayerDamage,
        damageTaken: previous.damageTaken + actualEnemyDamage,
        healing: previous.healing + actualHealing
      }));
      setExchangeHistory(previous => appendExchange(previous, {
        exchange: turn + 1,
        dealt: actualPlayerDamage,
        taken: actualEnemyDamage,
        healed: actualHealing,
        skill: commanderSkillName
      }));
      setTurn(previous => previous + 1);
      setLastAction(
        (attackingUnit
          ? attackingUnit.className + ' leads the exchange. '
          : '') +
          (ongoingDamage > 0
            ? action + ' Ongoing damage adds ' + ongoingDamage + ' before enemy formation armor.'
            : turn === 0
              ? action +
                ' ' +
                enemyArmyProfile.pressureSummary +
                '. ' +
                formationMatchup.summary +
                (fantasyCombatEdge
                  ? ' ' + fantasyCombatEdge.detail
                  : '') +
                (flyingCombatEdge
                  ? ' ' + flyingCombatEdge.detail
                  : '') +
                (largeCombatEdge
                  ? ' ' + largeCombatEdge.detail
                  : '') +
                (hybridCombatEdge
                  ? ' ' + hybridCombatEdge.detail
                  : '') +
                (enemyFantasyThreat
                  ? ' ' + enemyFantasyThreat.detail
                  : '')
              : action) +
          integrityEvent
      );

      if (effect) {
        const remaining = effect.remaining - 1;
        setActiveEffect(remaining > 0 ? { ...effect, remaining } : null);
      }
    }, Math.max(
      battleSpeed === 2 ? 180 : 360,
      Math.round(
        650 /
          (
            formationAnalysis.speedMultiplier *
            commanderSpeedMultiplier *
            marcherSpeedMultiplier *
            mandateSpeedMultiplier *
            battleSpeed
          )
      )
    ));

    return () => clearTimeout(timer);
  }, [
    activeCommanderPath,
    activeEffect,
    appIsActive,
    manualPaused,
    pausedForTutorial,
    activeFaction,
    activeFormationSlots,
    battleSpeed,
    commanderArmorMultiplier,
    commanderSpeedMultiplier,
    activeSquadCap,
    battleEnded,
    combatProfile.armorStatMultiplier,
    encounter,
    enemyAssignments,
    enemyHp,
    enemyPressureMultiplier,
    enemyTactic,
    enemyArmyProfile,
    enemyFantasyThreat,
    formation,
    units,
    formationAnalysis,
    formationMatchup,
    partyAttack,
    partyHp,
    partyIntegrity,
    partyIntegrityState,
    enemyIntegrity,
    enemyIntegrityState,
    skillTriggered,
    turn,
    settlementEffects.commanderSkillPowerMultiplier,
    settlementEffects.commanderSkillEarlyTrigger,
    marcherAttackMultiplier,
    marcherArmorMultiplier,
    marcherSpeedMultiplier,
    loyalistAttackMultiplier,
    loyalistArmorMultiplier,
    loyalistRetaliationMultiplier,
    decreeAttackMultiplier,
    decreeArmorMultiplier,
    mandateAttackMultiplier,
    mandateArmorMultiplier,
    mandateSpeedMultiplier,
    mandateCommanderSkillMultiplier,
    allianceAttackMultiplier,
    allianceArmorMultiplier,
    tacticalSpeedDamageMultiplier,
    supportRecovery,
    partyMaxHp
  ]);

  const finishBattle = () => {
    if (!battleEnded || !outcomeCommitGateRef.current()) return;
    const wear = recordBattleWear(partyHp, partyMaxHp, encounter.difficulty, finished);
    const summary: BattleCombatSummary = {
      victory: finished,
      exchanges: turn,
      damageDealt: battleTotals.damageDealt,
      damageTaken: battleTotals.damageTaken,
      healing: battleTotals.healing,
      remainingHp: partyHp,
      maxHp: partyMaxHp,
      enemyRemainingHp: enemyHp,
      enemyMaxHp: encounter.enemyHp,
      startingReadiness: armyReadiness,
      readinessWear: wear,
      resultingReadiness: clampArmyReadiness(armyReadiness - wear)
    };
    if (finished) onFinished(summary);
    else onDefeated(summary);
  };

  return <PortraitBattleView
    key={encounterId}
    encounterId={encounterId}
    encounterName={encounter.name}
    enemyName={encounter.enemyName}
    difficulty={encounter.difficulty}
    faction={activeFaction}
    enemyProfile={enemyArmyProfile.id}
    fantasyThreat={encounter.fantasyThreat}
    formation={formation}
    units={units}
    shape={activeFormationShape}
    enemyShape={enemyShape}
    enemies={enemyAssignments.map(assignment => ({
      ...assignment,
      down: defeatedEnemySlots.has(assignment.slot),
      boss: assignment.slot === bossSlot
    }))}
    partyHp={partyHp}
    partyMaxHp={partyMaxHp}
    enemyHp={enemyHp}
    enemyMaxHp={encounter.enemyHp}
    turn={turn}
    speed={battleSpeed}
    paused={manualPaused || pausedForTutorial || !appIsActive}
    controlsLocked={pausedForTutorial}
    outcome={finished ? 'victory' : defeated ? 'defeat' : null}
    activeSlot={exchangeFeedback?.activeSlot ?? null}
    enemySlot={exchangeFeedback?.enemySlot ?? null}
    supportSlots={exchangeFeedback?.supportSlots ?? []}
    activeRole={exchangeFeedback?.activeRole ?? null}
    healed={exchangeFeedback?.healed ?? 0}
    attackPulse={attackPulse}
    impactPulse={impactPulse}
    records={exchangeHistory}
    initialLog={lastAction}
    matchup={formationMatchup.title + '. ' + formationMatchup.summary}
    effects={battleEffects}
    status={activeEffect}
    onToggleSpeed={() => setBattleSpeed(previous => previous === 1 ? 2 : 1)}
    onTogglePause={() => setManualPaused(previous => !previous)}
    onComplete={finishBattle}
  />;
}
