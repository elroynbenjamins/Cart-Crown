import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { holdTheRoadEncounter } from '../game/data';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, ProgressBar } from '../ui/components';

const combatLines = [
  'The front line catches the first charge.',
  'Your formation turns spacing into a clean counterattack.',
  'The raiders regroup around their captain.',
  'Your squads hold their lanes and break the center.',
  'The final raiders flee from the refugee road.'
];

export function BattleScreen({ onFinished }: { onFinished: () => void }) {
  const { theme } = useGameTheme();
  const {
    units,
    formation,
    formationAnalysis,
    activeFaction
  } = useGame();

  const activeUnits = useMemo(
    () =>
      formation
        .filter((unitId): unitId is string => Boolean(unitId))
        .map(unitId => units.find(unit => unit.id === unitId))
        .filter((unit): unit is NonNullable<typeof unit> => Boolean(unit)),
    [formation, units]
  );

  const partyMaxHp = activeUnits.reduce((total, unit) => total + unit.hp, 0);
  const partyAttack = activeUnits.reduce((total, unit) => total + unit.attack, 0);
  const [partyHp, setPartyHp] = useState(partyMaxHp);
  const [enemyHp, setEnemyHp] = useState(holdTheRoadEncounter.enemyHp);
  const [turn, setTurn] = useState(0);

  const finished = turn >= combatLines.length || enemyHp <= 0;

  useEffect(() => {
    if (finished) {
      return;
    }

    const timer = setTimeout(() => {
      const momentum =
        activeFaction === 'orc'
          ? 1 + Math.min(0.28, turn * 0.04 + formationAnalysis.momentumPerExchange * turn * 0.015)
          : 1;
      const playerStrike = Math.max(
        18,
        Math.round((partyAttack + 5 + turn * 2) * formationAnalysis.attackMultiplier * momentum)
      );
      const rawEnemyStrike = Math.max(7, 15 - Math.floor(turn / 2));
      const enemyStrike = Math.max(
        4,
        Math.round(rawEnemyStrike / Math.max(0.7, formationAnalysis.armorMultiplier))
      );

      setEnemyHp(previous => Math.max(0, previous - playerStrike));
      setPartyHp(previous => Math.max(1, previous - enemyStrike));
      setTurn(previous => previous + 1);
    }, Math.max(380, Math.round(650 / formationAnalysis.speedMultiplier)));

    return () => clearTimeout(timer);
  }, [
    activeFaction,
    enemyHp,
    finished,
    formationAnalysis,
    partyAttack,
    turn
  ]);

  const currentLine = combatLines[Math.min(turn, combatLines.length - 1)] ?? combatLines[0];

  return (
    <View style={styles.screen}>
      <View style={styles.topCopy}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>AUTO-BATTLE</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{holdTheRoadEncounter.name}</Text>
        <Text style={[styles.turn, { color: theme.colors.textMuted }]}>
          {finished ? 'Victory' : 'Exchange ' + String(turn + 1)}
        </Text>
      </View>

      <GameCard style={styles.arena}>
        <Text style={[styles.sideLabel, { color: theme.colors.human }]}>YOUR 3×3 FORMATION</Text>
        <View style={styles.miniBoard}>
          {formation.map((unitId, index) => {
            const unit = units.find(candidate => candidate.id === unitId);
            return (
              <View
                key={index}
                style={[
                  styles.miniSlot,
                  {
                    backgroundColor: unit ? theme.colors.surface2 : theme.colors.appBg,
                    borderColor: unit ? theme.colors.human : theme.colors.border
                  }
                ]}
              >
                {unit ? (
                  <>
                    <Text style={[styles.unitInitial, { color: theme.colors.human }]}>{unit.name[0]}</Text>
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

        <Text style={[styles.versus, { color: theme.colors.textMuted }]}>VS</Text>

        <Text style={[styles.sideLabel, { color: theme.colors.danger }]}>ROAD RAIDERS</Text>
        <View style={styles.enemyTokens}>
          {Array.from({ length: holdTheRoadEncounter.enemyCount }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.enemyToken,
                { borderColor: theme.colors.danger, backgroundColor: theme.colors.surface2 }
              ]}
            >
              <Text style={[styles.unitInitial, { color: theme.colors.danger }]}>R</Text>
              <Text style={[styles.tokenName, { color: theme.colors.text }]}>Raider</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.hpLabel, { color: theme.colors.text }]}>
          {enemyHp} / {holdTheRoadEncounter.enemyHp} HP
        </Text>
        <ProgressBar value={enemyHp / holdTheRoadEncounter.enemyHp} color={theme.colors.danger} />
      </GameCard>

      <GameCard accent={finished ? theme.colors.primary : theme.colors.gold}>
        <Text style={[styles.logLabel, { color: theme.colors.textMuted }]}>COMBAT LOG</Text>
        <Text style={[styles.logLine, { color: theme.colors.text }]}>
          {finished ? 'The raiders break and flee. Greenkeep is reachable.' : currentLine}
        </Text>
      </GameCard>

      {finished ? <PrimaryButton label="View Results" onPress={onFinished} /> : null}
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  enemyTokens: { flexDirection: 'row', justifyContent: 'center', gap: 7 },
  enemyToken: {
    width: 72,
    height: 60,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  unitInitial: { fontSize: 17, fontWeight: '900' },
  tokenName: { fontSize: 7.5, fontWeight: '800', marginTop: 2, maxWidth: '94%' },
  hpLabel: { fontSize: 10, fontWeight: '800', textAlign: 'right' },
  versus: { fontSize: 12, fontWeight: '900', textAlign: 'center', marginVertical: 2 },
  logLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  logLine: { fontSize: 12, lineHeight: 18, fontWeight: '700', marginTop: 4 }
});
