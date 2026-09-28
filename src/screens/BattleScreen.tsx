import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { holdTheRoadEncounter } from '../game/data';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, ProgressBar } from '../ui/components';

const combatLines = [
  'Harlan locks shields and catches the first charge.',
  'Mira strikes through the opening in the raider line.',
  'The raiders regroup around their captain.',
  'Harlan drives the center back from the refugee wagons.',
  'Mira lands the final clean hit. The road opens.'
];

export function BattleScreen({ onFinished }: { onFinished: () => void }) {
  const { theme } = useGameTheme();
  const { units, formation, unlockedFormationSlots } = useGame();
  const activeUnits = useMemo(
    () =>
      unlockedFormationSlots
        .map(slot => formation[slot])
        .filter((unitId): unitId is string => Boolean(unitId))
        .map(unitId => units.find(unit => unit.id === unitId))
        .filter((unit): unit is NonNullable<typeof unit> => Boolean(unit)),
    [formation, units, unlockedFormationSlots]
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
      const playerStrike = Math.max(18, partyAttack + 5 + turn * 2);
      const enemyStrike = Math.max(7, 15 - Math.floor(turn / 2));

      setEnemyHp(previous => Math.max(0, previous - playerStrike));
      setPartyHp(previous => Math.max(1, previous - enemyStrike));
      setTurn(previous => previous + 1);
    }, 650);

    return () => clearTimeout(timer);
  }, [finished, partyAttack, turn]);

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
        <View style={styles.side}>
          <Text style={[styles.sideLabel, { color: theme.colors.human }]}>YOUR LINE</Text>
          <View style={styles.tokens}>
            {activeUnits.map(unit => (
              <View
                key={unit.id}
                style={[
                  styles.unitToken,
                  { borderColor: theme.colors.human, backgroundColor: theme.colors.surface2 }
                ]}
              >
                <Text style={[styles.unitInitial, { color: theme.colors.human }]}>{unit.name[0]}</Text>
                <Text style={[styles.tokenName, { color: theme.colors.text }]}>{unit.className}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.hpLabel, { color: theme.colors.text }]}>
            {partyHp} / {partyMaxHp} HP
          </Text>
          <ProgressBar value={partyMaxHp > 0 ? partyHp / partyMaxHp : 0} color={theme.colors.primary} />
        </View>

        <Text style={[styles.versus, { color: theme.colors.textMuted }]}>VS</Text>

        <View style={styles.side}>
          <Text style={[styles.sideLabel, { color: theme.colors.danger }]}>ROAD RAIDERS</Text>
          <View style={styles.tokens}>
            {Array.from({ length: holdTheRoadEncounter.enemyCount }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.unitToken,
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
          <ProgressBar
            value={enemyHp / holdTheRoadEncounter.enemyHp}
            color={theme.colors.danger}
          />
        </View>
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
  screen: {
    flex: 1,
    padding: 16,
    gap: 14
  },
  topCopy: {
    alignItems: 'center',
    paddingTop: 8
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4
  },
  title: {
    fontSize: 27,
    fontWeight: '900',
    marginTop: 4
  },
  turn: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5
  },
  arena: {
    flex: 1,
    justifyContent: 'center',
    gap: 14
  },
  side: {
    gap: 8
  },
  sideLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
    textAlign: 'center'
  },
  tokens: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  unitToken: {
    width: 82,
    height: 82,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  unitInitial: {
    fontSize: 23,
    fontWeight: '900'
  },
  tokenName: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4
  },
  hpLabel: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right'
  },
  versus: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center'
  },
  logLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1
  },
  logLine: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    marginTop: 5
  }
});
