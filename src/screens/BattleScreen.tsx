import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
import { GameCard, PrimaryButton, ProgressBar } from '../ui/components';
import { EnemySprite, UnitSprite } from '../ui/gameArt';
import {
  BattlefieldBackdrop,
  BattleStatusMarker,
  BattleVfxStrip,
  EnemyFantasyThreatAura
} from '../ui/battleVisuals';

type ActiveEffect = {
  type: CommanderSkillEffectType;
  power: number;
  remaining: number;
};

type BattleSpeed = 1 | 2;

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

function slotWidthForRow(count: number) {
  if (count >= 5) return 44;
  if (count === 4) return 54;
  if (count === 3) return 66;
  if (count === 2) return 78;
  return 84;
}

function attackCueForRole(role: UnitRole) {
  if (role === 'ranged') return '➶';
  if (role === 'support') return '✦';
  if (role === 'cavalry') return '↯';
  if (role === 'skirmish') return '›';
  if (role === 'frontline') return '◆';
  return '⚔';
}

function activeEffectCopy(effect: ActiveEffect) {
  if (effect.type === 'bleed') {
    return {
      title: 'BLEED',
      detail:
        '+' +
        effect.power +
        ' ongoing damage · ' +
        effect.remaining +
        ' exchanges'
    };
  }
  if (effect.type === 'armor_break') {
    return {
      title: 'ARMOR BREAK',
      detail:
        '+15% outgoing pressure · ' +
        effect.remaining +
        ' exchanges'
    };
  }
  if (effect.type === 'morale_break') {
    return {
      title: 'MORALE BREAK',
      detail:
        '-25% enemy retaliation · ' +
        effect.remaining +
        ' exchanges'
    };
  }
  return {
    title: 'COMMANDER EFFECT',
    detail: effect.remaining + ' exchanges'
  };
}

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
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const compactLayout = windowHeight < 760 || windowWidth < 360;
  const veryCompactLayout = windowHeight < 680;
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
  const enemyAssignmentsBySlot = useMemo(
    () =>
      new Map(
        enemyAssignments.map(assignment => [
          assignment.slot,
          assignment
        ])
      ),
    [enemyAssignments]
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
  const marcherDoctrineActive =
    encounterId === 'siege_road' || encounterId === 'lord_marshal_veyr';
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
  const [appIsActive, setAppIsActive] = useState(
    appStateAllowsBattleProgress(AppState.currentState)
  );
  const [exchangeFeedback, setExchangeFeedback] = useState<ExchangeFeedback | null>(null);
  const [battleTotals, setBattleTotals] = useState({
    damageDealt: 0,
    damageTaken: 0,
    healing: 0
  });
  const battleScrollRef = useRef<ScrollView>(null);
  const outcomeCommitGateRef = useRef(
    createOneShotGate()
  );
  const attackPulse = useRef(new Animated.Value(0)).current;
  const impactPulse = useRef(new Animated.Value(0)).current;
  const feedbackPulse = useRef(new Animated.Value(0)).current;
  const outcomePulse = useRef(new Animated.Value(0)).current;
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
  const visibleBattleEffects = compactLayout
    ? battleEffects.slice(0, 3)
    : battleEffects;
  const hiddenBattleEffectCount = Math.max(
    0,
    battleEffects.length - visibleBattleEffects.length
  );

  useEffect(() => {
    if (!battleEnded) return;

    outcomePulse.stopAnimation();
    outcomePulse.setValue(0);
    Animated.spring(outcomePulse, {
      toValue: 1,
      friction: 7,
      tension: 70,
      useNativeDriver: true
    }).start();

    if (!compactLayout) return;

    const timer = setTimeout(() => {
      battleScrollRef.current?.scrollToEnd({ animated: true });
    }, 180);

    return () => clearTimeout(timer);
  }, [battleEnded, compactLayout, outcomePulse]);

  useEffect(() => {
    if (!exchangeFeedback) return;

    const duration = battleSpeed === 2 ? 85 : 135;
    attackPulse.stopAnimation();
    impactPulse.stopAnimation();
    feedbackPulse.stopAnimation();
    attackPulse.setValue(0);
    impactPulse.setValue(0);
    feedbackPulse.setValue(0);

    Animated.parallel([
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
    ]).start();
  }, [
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
            tacticalSpeedDamageMultiplier
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
            formationMatchup.outgoingDamageMultiplier
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
                allianceArmorMultiplier
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

      setEnemyHp(Math.max(0, enemyHp - playerDamage));
      setPartyHp(healedPartyHp);
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
              : action)
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

  const renderPlayerRow = (slots: number[]) => {
    const width = slotWidthForRow(slots.length);
    const dense = slots.length >= 5;

    return (
      <View style={styles.formationRow}>
        {slots.map(slot => {
          const unitId = formation[slot] ?? null;
          const unit = units.find(candidate => candidate.id === unitId);
          const favored = Boolean(
            unit && activeCommanderPath?.favoredRoles.includes(unit.role)
          );
          const active =
            Boolean(unit) &&
            !battleEnded &&
            exchangeFeedback?.activeSlot === slot;
          const healingSource =
            Boolean(unit) &&
            !battleEnded &&
            Boolean(exchangeFeedback?.healed) &&
            Boolean(exchangeFeedback?.supportSlots.includes(slot));
          const attackTranslateY =
            unit?.role === 'cavalry'
              ? 7
              : unit?.role === 'skirmish'
                ? 5
                : unit?.role === 'frontline' || unit?.role === 'melee'
                  ? 3
                  : unit?.role === 'ranged'
                    ? -2
                    : 0;
          const attackScale =
            unit?.role === 'cavalry'
              ? 1.1
              : unit?.role === 'ranged'
                ? 1.045
                : unit?.role === 'support'
                  ? 1.06
                  : 1.075;

          return (
            <Animated.View
              key={slot}
              style={[
                styles.miniSlot,
                compactLayout && styles.slotCompact,
                {
                  width,
                  backgroundColor: active
                    ? theme.colors.gold + '18'
                    : healingSource
                      ? factionAccent + '18'
                      : unit
                        ? theme.colors.surface2
                        : theme.colors.appBg,
                  borderColor: active
                    ? theme.colors.gold
                    : healingSource
                      ? factionAccent
                      : favored
                        ? theme.colors.gold
                        : unit
                          ? factionAccent
                          : theme.colors.border,
                  borderWidth: active || healingSource ? 2 : 1.2
                },
                active
                  ? {
                      transform: [
                        {
                          translateY: attackPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, attackTranslateY]
                          })
                        },
                        {
                          scale: attackPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, attackScale]
                          })
                        }
                      ]
                    }
                  : healingSource
                    ? {
                        transform: [
                          {
                            scale: feedbackPulse.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.06]
                            })
                          }
                        ]
                      }
                    : null
              ]}
            >
              {unit ? (
                <>
                  <UnitSprite
                    className={unit.className}
                    faction={unit.faction}
                    size={
                      dense
                        ? compactLayout
                          ? 18
                          : 20
                        : compactLayout
                          ? 21
                          : 24
                    }
                  />
                  {active ? (
                    <Text
                      style={[
                        styles.roleCue,
                        { color: theme.colors.gold }
                      ]}
                    >
                      {attackCueForRole(unit.role)}
                    </Text>
                  ) : null}
                  {healingSource ? (
                    <Text
                      style={[
                        styles.healCue,
                        { color: factionAccent }
                      ]}
                    >
                      +{exchangeFeedback?.healed ?? 0}
                    </Text>
                  ) : null}
                  {!dense ? (
                    <Text style={[styles.tokenName, { color: theme.colors.text }]} numberOfLines={1}>
                      {unit.className}
                    </Text>
                  ) : null}
                </>
              ) : null}
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const renderEnemyRow = (slots: number[]) => {
    const width = slotWidthForRow(slots.length);
    const dense = slots.length >= 5;

    return (
      <View style={styles.formationRow}>
        {slots.map(slot => {
          const assignment =
            enemyAssignmentsBySlot.get(slot);
          const occupied = Boolean(assignment);
          const fallen =
            occupied && defeatedEnemySlots.has(slot);
          const targeted =
            occupied &&
            !fallen &&
            !battleEnded &&
            exchangeFeedback?.enemySlot === slot;
          const boss = occupied && bossSlot === slot;

          return (
            <Animated.View
              key={slot}
              style={[
                styles.enemySlot,
                compactLayout && styles.slotCompact,
                {
                  width,
                  borderColor: fallen
                    ? theme.colors.border
                    : boss
                      ? theme.colors.gold
                      : theme.colors.danger,
                  backgroundColor: fallen
                    ? theme.colors.appBg
                    : targeted
                      ? theme.colors.danger + '18'
                      : theme.colors.surface2,
                  borderWidth: targeted || boss ? 2 : 1.2,
                  opacity: fallen ? 0.22 : occupied ? 1 : 0.4
                },
                targeted
                  ? {
                      transform: [
                        {
                          translateX: impactPulse.interpolate({
                            inputRange: [0, 0.35, 0.7, 1],
                            outputRange: [0, -3, 3, 0]
                          })
                        },
                        {
                          scale: impactPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.07]
                          })
                        }
                      ]
                    }
                  : null
              ]}
            >
              {occupied ? (
                <>
                  {boss ? (
                    <Text
                      style={[
                        styles.bossSlotMark,
                        {
                          color: fallen
                            ? theme.colors.textMuted
                            : theme.colors.gold
                        }
                      ]}
                    >
                      ♛
                    </Text>
                  ) : (
                    <EnemySprite
                      enemyName={encounter.enemyName}
                      armyProfileId={enemyArmyProfile.id}
                      fantasyThreat={encounter.fantasyThreat}
                      role={assignment?.role}
                      size={
                        dense
                          ? compactLayout
                            ? 18
                            : 21
                          : compactLayout
                            ? 22
                            : 25
                      }
                    />
                  )}
                  <Text
                    style={[
                      styles.tokenName,
                      dense && styles.tokenNameDense,
                      {
                        color: boss
                          ? theme.colors.gold
                          : fallen
                            ? theme.colors.textMuted
                            : theme.colors.text
                      }
                    ]}
                    numberOfLines={1}
                  >
                    {fallen
                      ? 'DOWN'
                      : boss
                        ? 'BOSS'
                        : dense
                          ? assignment?.role.slice(0, 3).toUpperCase()
                          : assignment?.label}
                  </Text>
                </>
              ) : null}
            </Animated.View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.viewport}>
    <ScrollView
      ref={battleScrollRef}
      style={styles.scroll}
      contentContainerStyle={[
        styles.screen,
        compactLayout && styles.screenCompact
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={[styles.topCopy, compactLayout && styles.topCopyCompact]}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>AUTO-BATTLE</Text>
        <Text
          style={[
            styles.title,
            compactLayout && styles.titleCompact,
            { color: theme.colors.text }
          ]}
          numberOfLines={compactLayout ? 1 : 2}
        >
          {encounter.name}
        </Text>
        <View style={styles.turnRow}>
          <Text style={[styles.turn, { color: theme.colors.textMuted }]}>
            {finished ? 'Victory' : defeated ? 'Defeat' : 'Exchange ' + String(turn + 1)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={'Battle speed ' + battleSpeed + ' times'}
            hitSlop={8}
            disabled={battleEnded}
            onPress={() =>
              setBattleSpeed(previous => (previous === 1 ? 2 : 1))
            }
            style={({ pressed }) => [
              styles.speedButton,
              {
                backgroundColor: theme.colors.surface2,
                borderColor: theme.colors.border,
                opacity: battleEnded ? 0.5 : pressed ? 0.75 : 1
              }
            ]}
          >
            <Text style={[styles.speedButtonText, { color: theme.colors.gold }]}>
              {battleSpeed}×
            </Text>
          </Pressable>
        </View>
      </View>

      <GameCard
        style={[
          styles.arena,
          compactLayout && styles.arenaCompact
        ]}
      >
        <BattlefieldBackdrop
          encounterId={encounterId}
          faction={activeFaction}
          difficulty={encounter.difficulty}
          compact={compactLayout}
        />
        <EnemyFantasyThreatAura
          fantasyThreat={encounter.fantasyThreat}
          compact={compactLayout}
        />

        <Text style={[styles.sideLabel, { color: factionAccent }]}>
          YOUR {activeFormationShape.layout} · {activeFormationShape.name.toUpperCase()}
        </Text>
        <View
          style={[
            styles.formationBoard,
            compactLayout && styles.formationBoardCompact
          ]}
        >
          {renderPlayerRow(activeFormationShape.rows.front)}
          {renderPlayerRow(activeFormationShape.rows.middle)}
          {renderPlayerRow(activeFormationShape.rows.rear)}
        </View>
        <Text style={[styles.hpLabel, { color: theme.colors.text }]}>
          {partyHp} / {partyMaxHp} HP
        </Text>
        <ProgressBar value={partyMaxHp > 0 ? partyHp / partyMaxHp : 0} color={theme.colors.primary} />
        <Text style={[styles.readinessLine, { color: factionAccent }]}>
          Army Readiness {armyReadiness}% · {readinessProfile.label}
        </Text>

        {battleEffects.length > 0 ? (
          <View style={styles.effectChips}>
            {visibleBattleEffects.map(effect => (
              <View
                key={effect.key}
                style={[
                  styles.effectChip,
                  {
                    backgroundColor: effect.color + '14',
                    borderColor: effect.color + '55'
                  }
                ]}
              >
                <Text
                  style={[styles.effectChipText, { color: effect.color }]}
                  numberOfLines={1}
                >
                  {effect.label}
                </Text>
              </View>
            ))}
            {hiddenBattleEffectCount > 0 ? (
              <View
                style={[
                  styles.effectChip,
                  {
                    backgroundColor: theme.colors.surface2,
                    borderColor: theme.colors.border
                  }
                ]}
              >
                <Text
                  style={[
                    styles.effectChipText,
                    { color: theme.colors.textMuted }
                  ]}
                >
                  +{hiddenBattleEffectCount} MORE
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <Text style={[styles.versus, { color: theme.colors.textMuted }]}>VS</Text>

        <BattleVfxStrip
          role={exchangeFeedback?.activeRole ?? null}
          healed={exchangeFeedback?.healed ?? 0}
          progress={attackPulse}
        />

        {encounter.difficulty === 'Boss' ? (
          <View
            style={[
              styles.bossStage,
              compactLayout && styles.bossStageCompact,
              {
                backgroundColor: theme.colors.surface2,
                borderColor: theme.colors.gold + '66'
              }
            ]}
          >
            <View
              style={[
                styles.bossPortrait,
                {
                  borderColor: theme.colors.gold,
                  backgroundColor: theme.colors.appBg
                }
              ]}
            >
              <EnemySprite
                enemyName={encounter.enemyName}
                armyProfileId={enemyArmyProfile.id}
                fantasyThreat={encounter.fantasyThreat}
                size={compactLayout ? 40 : 48}
              />
            </View>
            <View style={styles.bossCopy}>
              <Text style={[styles.bossEyebrow, { color: theme.colors.gold }]}>
                BOSS ENCOUNTER
              </Text>
              <Text
                style={[
                  styles.bossName,
                  compactLayout && styles.bossNameCompact,
                  { color: theme.colors.text }
                ]}
                numberOfLines={1}
              >
                {encounter.enemyName}
              </Text>
              {!veryCompactLayout ? (
                <Text
                  style={[
                    styles.bossPressure,
                    { color: theme.colors.textMuted }
                  ]}
                  numberOfLines={1}
                >
                  {enemyArmyProfile.pressureSummary}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <Text style={[styles.sideLabel, { color: theme.colors.danger }]}>
          ENEMY {enemyShape.layout} · {enemyTactic.name.toUpperCase()} · {liveEnemyCount}/{encounter.enemyCount} ACTIVE
        </Text>
        <View
          style={[
            styles.formationBoard,
            compactLayout && styles.formationBoardCompact
          ]}
        >
          {renderEnemyRow(enemyShape.rows.front)}
          {renderEnemyRow(enemyShape.rows.middle)}
          {renderEnemyRow(enemyShape.rows.rear)}
        </View>
        {!veryCompactLayout ? (
          <Text style={[styles.enemyArmyLine, { color: theme.colors.gold }]}>
            {enemyArmyProfile.name} · {enemyArmyProfile.pressureSummary}
          </Text>
        ) : null}
        {!compactLayout ? (
          <Text style={[styles.enemyDoctrine, { color: theme.colors.textMuted }]}>
            Formation ATK ×{enemyTactic.attackMultiplier.toFixed(2)} · ARM ×{enemyTactic.armorMultiplier.toFixed(2)} · SPD ×{enemyTactic.speedMultiplier.toFixed(2)}
          </Text>
        ) : null}
        <Text
          style={[
            styles.matchupLine,
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
          {formationMatchup.result === 'advantage'
            ? 'Formation edge'
            : formationMatchup.result === 'disadvantage'
              ? 'Formation exposed'
              : 'Formation neutral'}
          {' · dealt ×' + formationMatchup.outgoingDamageMultiplier.toFixed(2)}
          {' · received ×' + formationMatchup.incomingDamageMultiplier.toFixed(2)}
        </Text>
        <Text style={[styles.hpLabel, { color: theme.colors.text }]}>
          {enemyHp} / {encounter.enemyHp} HP
        </Text>
        <ProgressBar value={enemyHp / encounter.enemyHp} color={theme.colors.danger} />
        <BattleStatusMarker
          effectType={activeEffect?.type ?? null}
          remaining={activeEffect?.remaining ?? 0}
        />

        {exchangeFeedback ? (
          <Animated.View
            style={[
              styles.exchangeFeedback,
              compactLayout && styles.exchangeFeedbackCompact,
              {
                transform: [
                  {
                    scale: feedbackPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.035]
                    })
                  }
                ]
              }
            ]}
          >
            <View
              style={[
                styles.exchangeMetric,
                {
                  backgroundColor: theme.colors.surface2,
                  borderColor: theme.colors.primary + '55'
                }
              ]}
            >
              <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>DEALT</Text>
              <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                -{exchangeFeedback.outgoing}
              </Text>
            </View>
            <View
              style={[
                styles.exchangeMetric,
                {
                  backgroundColor: theme.colors.surface2,
                  borderColor: theme.colors.danger + '55'
                }
              ]}
            >
              <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>TAKEN</Text>
              <Text style={[styles.metricValue, { color: theme.colors.danger }]}>
                -{exchangeFeedback.incoming}
              </Text>
            </View>
            {exchangeFeedback.healed > 0 ? (
              <View
                style={[
                  styles.exchangeMetric,
                  {
                    backgroundColor: theme.colors.surface2,
                    borderColor: factionAccent + '55'
                  }
                ]}
              >
                <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>HEAL</Text>
                <Text style={[styles.metricValue, { color: factionAccent }]}>
                  +{exchangeFeedback.healed}
                </Text>
              </View>
            ) : null}
            {exchangeFeedback.commanderSkillName ? (
              <View
                style={[
                  styles.skillMetric,
                  {
                    backgroundColor: theme.colors.gold + '14',
                    borderColor: theme.colors.gold + '55'
                  }
                ]}
              >
                <Text style={[styles.skillMetricText, { color: theme.colors.gold }]} numberOfLines={1}>
                  {exchangeFeedback.commanderSkillName}
                </Text>
              </View>
            ) : null}
          </Animated.View>
        ) : null}
      </GameCard>

      {battleEnded ? (
        <Animated.View
          style={[
            styles.outcomeWrap,
            {
              opacity: outcomePulse,
              transform: [
                {
                  translateY: outcomePulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0]
                  })
                },
                {
                  scale: outcomePulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1]
                  })
                }
              ]
            }
          ]}
        >
          <GameCard
            accent={
              finished
                ? theme.colors.primary
                : theme.colors.danger
            }
            state={finished ? 'ready' : 'danger'}
          >
            <View style={styles.outcomeHeader}>
              <Text
                style={[
                  styles.outcomeTitle,
                  {
                    color: finished
                      ? theme.colors.primary
                      : theme.colors.danger
                  }
                ]}
              >
                {finished ? 'VICTORY' : 'DEFEAT'}
              </Text>
              <Text style={[styles.outcomeMeta, { color: theme.colors.textMuted }]}>
                {turn} exchanges
              </Text>
            </View>
            <Text style={[styles.outcomeBody, { color: theme.colors.text }]}>
              {finished
                ? encounter.enemyName +
                  ' break from the field. ' +
                  Math.round(
                    partyMaxHp > 0
                      ? (partyHp / partyMaxHp) * 100
                      : 0
                  ) +
                  '% army HP remains.'
                : 'The formation is forced to withdraw. Adjust the formation, equipment or readiness before another attempt.'}
            </Text>
          </GameCard>
        </Animated.View>
      ) : null}

      <GameCard
        style={compactLayout ? styles.logCardCompact : undefined}
        accent={
          finished
            ? theme.colors.primary
            : defeated
              ? theme.colors.danger
              : activeEffect
                ? theme.colors.gold
                : theme.colors.border
        }
      >
        <Text style={[styles.logLabel, { color: theme.colors.textMuted }]}>COMBAT LOG</Text>
        <Text style={[styles.logLine, { color: theme.colors.text }]}>
          {finished
            ? encounter.enemyName + ' break and retreat.'
            : defeated
              ? 'Your formation is forced to withdraw. No campaign progress is lost.'
              : lastAction}
        </Text>
        {activeEffect ? (
          <View
            style={[
              styles.statusEffect,
              {
                backgroundColor: theme.colors.gold + '12',
                borderColor: theme.colors.gold + '55'
              }
            ]}
          >
            <View style={styles.statusEffectHeader}>
              <Text style={[styles.statusEffectTitle, { color: theme.colors.gold }]}>
                {activeEffectCopy(activeEffect).title}
              </Text>
              <Text style={[styles.statusEffectTurns, { color: theme.colors.textMuted }]}>
                {activeEffect.remaining} LEFT
              </Text>
            </View>
            <Text style={[styles.statusEffectBody, { color: theme.colors.text }]}>
              {activeEffectCopy(activeEffect).detail}
            </Text>
          </View>
        ) : null}
      </GameCard>

    </ScrollView>

    {battleEnded ? (
      <View
        testID="battle-outcome-actions"
        style={[
          styles.outcomeActions,
          compactLayout && styles.outcomeActionsCompact,
          { backgroundColor: theme.colors.appBg, borderTopColor: theme.colors.border }
        ]}
      >
      {finished ? (
        <PrimaryButton
          label="View Results"
          onPress={() => {
            if (!outcomeCommitGateRef.current()) return;

            const wear = recordBattleWear(
              partyHp,
              partyMaxHp,
              encounter.difficulty,
              true
            );
            onFinished({
              victory: true,
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
              resultingReadiness: clampArmyReadiness(
                armyReadiness - wear
              )
            });
          }}
        />
      ) : null}
      {defeated ? (
        <PrimaryButton
          label="View Defeat Report"
          onPress={() => {
            if (!outcomeCommitGateRef.current()) return;

            const wear = recordBattleWear(
              partyHp,
              partyMaxHp,
              encounter.difficulty,
              false
            );
            onDefeated({
              victory: false,
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
              resultingReadiness: clampArmyReadiness(
                armyReadiness - wear
              )
            });
          }}
        />
      ) : null}
      </View>
    ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, minHeight: 0 },
  outcomeActions: { flexShrink: 0, padding: 16, paddingTop: 10, borderTopWidth: 1 },
  outcomeActionsCompact: { padding: 11, paddingTop: 8 },
  scroll: { flex: 1 },
  screen: { flexGrow: 1, padding: 16, gap: 10 },
  screenCompact: { padding: 11, gap: 7 },
  topCopy: { alignItems: 'center', paddingTop: 3 },
  topCopyCompact: { paddingTop: 0 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { fontSize: 24, fontWeight: '900', marginTop: 3, textAlign: 'center' },
  titleCompact: { fontSize: 20, marginTop: 2 },
  turnRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  turn: { fontSize: 11, fontWeight: '800' },
  speedButton: {
    minWidth: 38,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9
  },
  speedButtonText: { fontSize: 10, fontWeight: '900' },
  arena: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 5,
    overflow: 'hidden',
    position: 'relative'
  },
  arenaCompact: { gap: 3 },
  sideLabel: { fontSize: 8.5, fontWeight: '900', letterSpacing: 0.8, textAlign: 'center' },
  formationBoard: { alignSelf: 'center', gap: 3, minWidth: 220 },
  formationBoardCompact: { gap: 2, minWidth: 205 },
  formationRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  miniSlot: {
    height: 38,
    borderRadius: 9,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  enemySlot: {
    height: 38,
    borderRadius: 9,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  slotCompact: { height: 33, borderRadius: 8 },
  roleCue: {
    position: 'absolute',
    top: 1,
    right: 3,
    fontSize: 8,
    fontWeight: '900'
  },
  healCue: {
    position: 'absolute',
    top: 1,
    left: 3,
    fontSize: 7,
    fontWeight: '900'
  },
  bossSlotMark: { fontSize: 15, lineHeight: 16, fontWeight: '900' },
  bossStage: {
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1,
    padding: 7,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '94%',
    gap: 9
  },
  bossStageCompact: { minHeight: 52, paddingVertical: 5 },
  bossPortrait: {
    width: 54,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bossCopy: { flex: 1, minWidth: 0 },
  bossEyebrow: { fontSize: 7.5, fontWeight: '900', letterSpacing: 0.9 },
  bossName: { fontSize: 14, fontWeight: '900', marginTop: 2 },
  bossNameCompact: { fontSize: 12.5 },
  bossPressure: { fontSize: 7.8, fontWeight: '700', marginTop: 2 },
  tokenName: { fontSize: 6.5, fontWeight: '800', marginTop: 1, maxWidth: '94%' },
  tokenNameDense: { fontSize: 5.3, letterSpacing: 0.2 },
  hpLabel: { fontSize: 9, fontWeight: '800', textAlign: 'right' },
  readinessLine: { fontSize: 8.5, fontWeight: '900', textAlign: 'center' },
  enemyArmyLine: { fontSize: 8.5, fontWeight: '900', textAlign: 'center' },
  enemyDoctrine: { fontSize: 8, fontWeight: '800', textAlign: 'center' },
  matchupLine: { fontSize: 8.5, fontWeight: '900', textAlign: 'center' },
  effectChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 4
  },
  effectChip: {
    maxWidth: '48%',
    minHeight: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  effectChipText: { fontSize: 7.3, fontWeight: '900', textAlign: 'center' },
  exchangeFeedback: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
    marginTop: 2
  },
  exchangeFeedbackCompact: { gap: 3, marginTop: 1 },
  exchangeMetric: {
    minWidth: 54,
    minHeight: 31,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7
  },
  metricLabel: { fontSize: 6.7, fontWeight: '900', letterSpacing: 0.5 },
  metricValue: { fontSize: 11, fontWeight: '900', marginTop: 1 },
  skillMetric: {
    maxWidth: 126,
    minHeight: 31,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  skillMetricText: { fontSize: 7.5, fontWeight: '900', textAlign: 'center' },
  commanderLine: { fontSize: 8.5, fontWeight: '900', textAlign: 'center' },
  versus: { fontSize: 10, fontWeight: '900', textAlign: 'center', marginVertical: 1 },
  outcomeWrap: { width: '100%' },
  outcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  outcomeTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 1.1 },
  outcomeMeta: { fontSize: 9, fontWeight: '800' },
  outcomeBody: { fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 5 },
  logLabel: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1.1 },
  logLine: { fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 3 },
  statusEffect: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginTop: 7
  },
  statusEffectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  statusEffectTitle: { fontSize: 8.5, fontWeight: '900', letterSpacing: 0.7 },
  statusEffectTurns: { fontSize: 7.5, fontWeight: '900' },
  statusEffectBody: { fontSize: 9, lineHeight: 13, fontWeight: '700', marginTop: 3 },
  effectLine: { fontSize: 9, fontWeight: '900', marginTop: 5, textTransform: 'uppercase' },
  logCardCompact: { paddingVertical: 9 }
});
