import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getEncounter } from '../game/encounters';
import {
  getArmyReadinessProfile,
  getEnemyStrikePressure,
  getTacticalSpeedDamageMultiplier,
  getUnitCombatProfile
} from '../game/balance';
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
  const [lastAction, setLastAction] = useState(combatLines[0]!);

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

      const playerStrike = Math.max(
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
      const rawEnemyStrike = getEnemyStrikePressure(
        encounter,
        activeSquadCap,
        turn
      );
      const enemyStrike = Math.max(
        4,
        Math.round(
          (rawEnemyStrike *
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
        Math.max(0, previous - playerStrike - skillDamage - ongoingDamage)
      );
      setPartyHp(previous => {
        const damaged = Math.max(0, previous - enemyStrike);
        if (damaged <= 0 || supportRecovery <= 0) return damaged;
        return Math.min(partyMaxHp, damaged + supportRecovery);
      });
      setTurn(previous => previous + 1);
      setLastAction(
        ongoingDamage > 0
          ? action + ' Ongoing damage deals ' + ongoingDamage + '.'
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
        <Text style={[styles.sideLabel, { color: factionAccent }]}>YOUR 3×3 FORMATION</Text>
        <View style={styles.miniBoard}>
          {formation.map((unitId, index) => {
            const unit = units.find(candidate => candidate.id === unitId);
            const favored = Boolean(
              unit && activeCommanderPath?.favoredRoles.includes(unit.role)
            );

            return (
              <View
                key={index}
                style={[
                  styles.miniSlot,
                  {
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
                    <UnitSprite className={unit.className} faction={unit.faction} size={32} />
                    <Text style={[styles.tokenName, { color: theme.colors.text }]} numberOfLines={1}>
                      {unit.className}
                    </Text>
                  </>
                ) : null}
              </View>
            );
          })}
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
          {encounter.enemyName.toUpperCase()}
        </Text>
        <View style={styles.enemyTokens}>
          {Array.from({ length: encounter.enemyCount }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.enemyToken,
                { borderColor: theme.colors.danger, backgroundColor: theme.colors.surface2 }
              ]}
            >
              <EnemySprite enemyName={encounter.enemyName} size={34} />
              <Text style={[styles.tokenName, { color: theme.colors.text }]}>
                {encounter.difficulty === 'Boss'
                  ? 'Boss Guard'
                  : encounter.difficulty === 'Elite'
                    ? 'Elite'
                    : 'Raider'}
              </Text>
            </View>
          ))}
        </View>
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
  screen: { flex: 1, padding: 16, gap: 12 },
  topCopy: { alignItems: 'center', paddingTop: 5 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  title: { fontSize: 27, fontWeight: '900', marginTop: 4 },
  turn: { fontSize: 12, fontWeight: '800', marginTop: 5 },
  arena: { flex: 1, justifyContent: 'center', gap: 8 },
  sideLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1, textAlign: 'center' },
  miniBoard: { alignSelf: 'center', width: 252, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  miniSlot: {
    width: 80,
    height: 53,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  enemyTokens: { flexDirection: 'row', justifyContent: 'center', gap: 7 },
  enemyToken: {
    width: 64,
    height: 58,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  unitInitial: { fontSize: 17, fontWeight: '900' },
  tokenName: { fontSize: 7.5, fontWeight: '800', marginTop: 2, maxWidth: '94%' },
  hpLabel: { fontSize: 10, fontWeight: '800', textAlign: 'right' },
  readinessLine: { fontSize: 9, fontWeight: '900', textAlign: 'center' },
  commanderLine: { fontSize: 9.5, fontWeight: '900', textAlign: 'center' },
  versus: { fontSize: 12, fontWeight: '900', textAlign: 'center', marginVertical: 2 },
  logLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  logLine: { fontSize: 12, lineHeight: 18, fontWeight: '700', marginTop: 4 },
  effectLine: { fontSize: 9.5, fontWeight: '900', marginTop: 6, textTransform: 'uppercase' }
});
