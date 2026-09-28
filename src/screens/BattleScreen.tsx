import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getEncounter, getEnemyFormationTactic } from '../game/encounters';
import {
  getArmyReadinessProfile,
  getEnemyStrikePressure,
  getTacticalSpeedDamageMultiplier,
  getUnitCombatProfile
} from '../game/balance';
import { getFormationShape } from '../game/formation';
import type { EncounterId } from '../game/encounters';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import type { CommanderSkillEffectType } from '../game/types';
import { GameCard, PrimaryButton, ProgressBar } from '../ui/components';
import { EnemySprite, UnitSprite } from '../ui/gameArt';

type ActiveEffect = {
  type: CommanderSkillEffectType;
  power: number;
  remaining: number;
};

const combatLines = [
  'The front line catches the enemy advance.',
  'Your formation turns spacing into a clean counterattack.',
  'The enemy regroups around its strongest fighters.',
  'Your squads hold their lanes and press the center.',
  'The enemy line starts to fracture.',
  'Your army drives the remaining fighters from the field.'
];

function centerFirst(slots: number[]) {
  const middle = (slots.length - 1) / 2;
  return [...slots].sort(
    (a, b) => Math.abs(slots.indexOf(a) - middle) - Math.abs(slots.indexOf(b) - middle)
  );
}

function getEnemyOccupiedSlots(
  rows: { front: number[]; middle: number[]; rear: number[] },
  enemyCount: number
) {
  const rowList = [rows.front, rows.middle, rows.rear];
  const capacities = rowList.map(row => row.length);
  const ideals = capacities.map(capacity => (enemyCount * capacity) / 9);
  const counts = ideals.map(value => Math.floor(value));
  let remaining = Math.max(0, Math.min(9, enemyCount) - counts.reduce((sum, value) => sum + value, 0));

  while (remaining > 0) {
    let bestRow = -1;
    let bestNeed = -Infinity;

    counts.forEach((count, index) => {
      if (count >= capacities[index]!) return;
      const need = ideals[index]! - count;
      if (need > bestNeed) {
        bestNeed = need;
        bestRow = index;
      }
    });

    if (bestRow < 0) break;
    counts[bestRow] = counts[bestRow]! + 1;
    remaining -= 1;
  }

  const occupied = new Set<number>();
  rowList.forEach((row, index) => {
    centerFirst(row)
      .slice(0, counts[index] ?? 0)
      .forEach(slot => occupied.add(slot));
  });
  return occupied;
}

function slotWidthForRow(count: number) {
  if (count >= 5) return 44;
  if (count === 4) return 54;
  if (count === 3) return 66;
  if (count === 2) return 78;
  return 84;
}

export function BattleScreen({
  encounterId,
  onFinished,
  onDefeated
}: {
  encounterId: EncounterId;
  onFinished: () => void;
  onDefeated: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    units,
    formation,
    activeFormationShape,
    formationAnalysis,
    activeSquadCap,
    activeFaction,
    armyReadiness,
    recordBattleWear,
    activeCommanderPath,
    activeMarcherWarningChoice,
    activeLastLoyalistsChoice,
    activeRoyalDecree,
    activeFactionMandate,
    settlementEffects
  } = useGame();

  const encounter = getEncounter(encounterId);
  const enemyTactic = useMemo(
    () => getEnemyFormationTactic(encounterId),
    [encounterId]
  );
  const enemyShape = useMemo(
    () => getFormationShape(enemyTactic.formationShapeId),
    [enemyTactic.formationShapeId]
  );
  const enemyOccupiedSlots = useMemo(
    () => getEnemyOccupiedSlots(enemyShape.rows, encounter.enemyCount),
    [enemyShape.rows, encounter.enemyCount]
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
  const [lastAction, setLastAction] = useState(
    enemyTactic.name + ' meets your ' + activeFormationShape.name + '.'
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

  useEffect(() => {
    if (battleEnded) return;

    const timer = setTimeout(() => {
      let effect = activeEffect;
      let skillDamage = 0;
      let action = combatLines[Math.min(turn, combatLines.length - 1)] ?? combatLines[combatLines.length - 1]!;

      const commanderSkillTurn =
        settlementEffects.commanderSkillEarlyTrigger ? 0 : 1;

      if (
        activeCommanderPath &&
        !skillTriggered &&
        turn === commanderSkillTurn
      ) {
        const skill = activeCommanderPath.skill;
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
            momentum *
            attackFactor *
            tacticalSpeedDamageMultiplier
        )
      );
      const playerDamage = Math.max(
        1,
        Math.round(
          (rawPlayerStrike + skillDamage + ongoingDamage) /
            enemyTactic.armorMultiplier
        )
      );

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

      setEnemyHp(previous =>
        Math.max(0, previous - playerDamage)
      );
      setPartyHp(previous => {
        const damaged = Math.max(0, previous - enemyStrike);
        if (damaged <= 0 || supportRecovery <= 0) return damaged;
        return Math.min(partyMaxHp, damaged + supportRecovery);
      });
      setTurn(previous => previous + 1);
      setLastAction(
        ongoingDamage > 0
          ? action + ' Ongoing damage adds ' + ongoingDamage + ' before enemy formation armor.'
          : turn === 0
            ? action + ' The ' + enemyTactic.name + ' changes the opening pressure.'
            : action
      );

      if (effect) {
        const remaining = effect.remaining - 1;
        setActiveEffect(remaining > 0 ? { ...effect, remaining } : null);
      }
    }, Math.max(
      360,
      Math.round(
        650 /
          (
            formationAnalysis.speedMultiplier *
            commanderSpeedMultiplier *
            marcherSpeedMultiplier *
            mandateSpeedMultiplier
          )
      )
    ));

    return () => clearTimeout(timer);
  }, [
    activeCommanderPath,
    activeEffect,
    activeFaction,
    commanderArmorMultiplier,
    commanderSpeedMultiplier,
    activeSquadCap,
    battleEnded,
    combatProfile.armorStatMultiplier,
    encounter,
    enemyPressureMultiplier,
    enemyTactic,
    formationAnalysis,
    partyAttack,
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

          return (
            <View
              key={slot}
              style={[
                styles.miniSlot,
                {
                  width,
                  backgroundColor: unit ? theme.colors.surface2 : theme.colors.appBg,
                  borderColor: favored
                    ? theme.colors.gold
                    : unit
                      ? factionAccent
                      : theme.colors.border
                }
              ]}
            >
              {unit ? (
                <>
                  <UnitSprite
                    className={unit.className}
                    faction={unit.faction}
                    size={dense ? 20 : 24}
                  />
                  {!dense ? (
                    <Text style={[styles.tokenName, { color: theme.colors.text }]} numberOfLines={1}>
                      {unit.className}
                    </Text>
                  ) : null}
                </>
              ) : null}
            </View>
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
          const occupied = enemyOccupiedSlots.has(slot);

          return (
            <View
              key={slot}
              style={[
                styles.enemySlot,
                {
                  width,
                  borderColor: occupied ? theme.colors.danger : theme.colors.border,
                  backgroundColor: occupied ? theme.colors.surface2 : theme.colors.appBg,
                  opacity: occupied ? 1 : 0.45
                }
              ]}
            >
              {occupied ? (
                <>
                  <EnemySprite enemyName={encounter.enemyName} size={dense ? 21 : 25} />
                  {!dense ? (
                    <Text style={[styles.tokenName, { color: theme.colors.text }]}>
                      {encounter.difficulty === 'Boss'
                        ? 'Guard'
                        : encounter.difficulty === 'Elite'
                          ? 'Elite'
                          : 'Unit'}
                    </Text>
                  ) : null}
                </>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topCopy}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>AUTO-BATTLE</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{encounter.name}</Text>
        <Text style={[styles.turn, { color: theme.colors.textMuted }]}>
          {finished ? 'Victory' : defeated ? 'Defeat' : 'Exchange ' + String(turn + 1)}
        </Text>
      </View>

      <GameCard style={styles.arena}>
        <Text style={[styles.sideLabel, { color: factionAccent }]}>
          YOUR {activeFormationShape.layout} · {activeFormationShape.name.toUpperCase()}
        </Text>
        <View style={styles.formationBoard}>
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

        {metaAllianceActive ? (
          <Text style={[styles.commanderLine, { color: theme.colors.gold }]}>
            Three Seals Alliance · +10% ATK · +8% ARM
          </Text>
        ) : null}

        {activeFactionMandate ? (
          <Text style={[styles.commanderLine, { color: factionAccent }]}>
            {activeFactionMandate.name}
          </Text>
        ) : null}

        {activeRoyalDecree ? (
          <Text style={[styles.commanderLine, { color: theme.colors.primary }]}>
            {activeRoyalDecree.name}
          </Text>
        ) : null}

        {loyalistApproachActive && activeLastLoyalistsChoice ? (
          <Text style={[styles.commanderLine, { color: theme.colors.gold }]}>
            {activeLastLoyalistsChoice.name}
          </Text>
        ) : null}

        {marcherDoctrineActive && activeMarcherWarningChoice ? (
          <Text style={[styles.commanderLine, { color: theme.colors.primary }]}>
            {activeMarcherWarningChoice.name}
          </Text>
        ) : null}

        {activeCommanderPath ? (
          <Text style={[styles.commanderLine, { color: theme.colors.gold }]}>
            {activeCommanderPath.name} · {activeCommanderPath.skill.name}
          </Text>
        ) : null}

        <Text style={[styles.versus, { color: theme.colors.textMuted }]}>VS</Text>

        <Text style={[styles.sideLabel, { color: theme.colors.danger }]}>
          ENEMY {enemyShape.layout} · {enemyTactic.name.toUpperCase()}
        </Text>
        <View style={styles.formationBoard}>
          {renderEnemyRow(enemyShape.rows.front)}
          {renderEnemyRow(enemyShape.rows.middle)}
          {renderEnemyRow(enemyShape.rows.rear)}
        </View>
        <Text style={[styles.enemyDoctrine, { color: theme.colors.textMuted }]}>
          ATK ×{enemyTactic.attackMultiplier.toFixed(2)} · ARM ×{enemyTactic.armorMultiplier.toFixed(2)} · SPD ×{enemyTactic.speedMultiplier.toFixed(2)}
        </Text>
        <Text style={[styles.hpLabel, { color: theme.colors.text }]}>
          {enemyHp} / {encounter.enemyHp} HP
        </Text>
        <ProgressBar value={enemyHp / encounter.enemyHp} color={theme.colors.danger} />
      </GameCard>

      <GameCard
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
          <Text style={[styles.effectLine, { color: theme.colors.gold }]}>
            {activeEffect.type.replace('_', ' ')} · {activeEffect.remaining} exchanges remaining
          </Text>
        ) : null}
      </GameCard>

      {finished ? (
        <PrimaryButton
          label="View Results"
          onPress={() => {
            recordBattleWear(
              partyHp,
              partyMaxHp,
              encounter.difficulty,
              true
            );
            onFinished();
          }}
        />
      ) : null}
      {defeated ? (
        <PrimaryButton
          label="Regroup"
          onPress={() => {
            recordBattleWear(
              partyHp,
              partyMaxHp,
              encounter.difficulty,
              false
            );
            onDefeated();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 10 },
  topCopy: { alignItems: 'center', paddingTop: 3 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { fontSize: 24, fontWeight: '900', marginTop: 3 },
  turn: { fontSize: 11, fontWeight: '800', marginTop: 4 },
  arena: { flex: 1, justifyContent: 'center', gap: 5 },
  sideLabel: { fontSize: 8.5, fontWeight: '900', letterSpacing: 0.8, textAlign: 'center' },
  formationBoard: { alignSelf: 'center', gap: 3, minWidth: 220 },
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
  tokenName: { fontSize: 6.5, fontWeight: '800', marginTop: 1, maxWidth: '94%' },
  hpLabel: { fontSize: 9, fontWeight: '800', textAlign: 'right' },
  readinessLine: { fontSize: 8.5, fontWeight: '900', textAlign: 'center' },
  enemyDoctrine: { fontSize: 8, fontWeight: '800', textAlign: 'center' },
  commanderLine: { fontSize: 8.5, fontWeight: '900', textAlign: 'center' },
  versus: { fontSize: 10, fontWeight: '900', textAlign: 'center', marginVertical: 1 },
  logLabel: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1.1 },
  logLine: { fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 3 },
  effectLine: { fontSize: 9, fontWeight: '900', marginTop: 5, textTransform: 'uppercase' }
});
