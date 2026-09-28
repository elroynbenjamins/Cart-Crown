import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, ResourceAmountRow, SecondaryButton, StatusPill } from '../ui/components';

function areOrthogonallyAdjacent(a: number, b: number) {
  const aRow = Math.floor(a / 3);
  const aColumn = a % 3;
  const bRow = Math.floor(b / 3);
  const bColumn = b % 3;
  return Math.abs(aRow - bRow) + Math.abs(aColumn - bColumn) === 1;
}

export function FormationTrialScreen({
  onEditFormation,
  onExit
}: {
  onEditFormation: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    formation,
    formationTrialCompleted,
    completeFormationTrial
  } = useGame();
  const [message, setMessage] = useState<string | null>(null);

  const occupiedSlots = formation
    .map((unitId, index) => (unitId ? index : -1))
    .filter(index => index >= 0);

  const harlan = formation.indexOf('hum_militia');
  const mira = formation.indexOf('hum_recruit');
  const humanFront = harlan >= 0 && harlan <= 2;
  const humanBehind = mira >= 3;
  const humanColumn = harlan >= 0 && mira >= 0 && harlan % 3 === mira % 3;

  const elfSpread =
    occupiedSlots.length >= 2 &&
    occupiedSlots.every((slot, index) =>
      occupiedSlots
        .slice(index + 1)
        .every(other => !areOrthogonallyAdjacent(slot, other))
    );

  const orcCohesion =
    occupiedSlots.length >= 2 &&
    occupiedSlots.some((slot, index) =>
      occupiedSlots
        .slice(index + 1)
        .some(other => areOrthogonallyAdjacent(slot, other))
    );

  const accent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const title =
    activeFaction === 'elf'
      ? 'Open Order'
      : activeFaction === 'orc'
        ? 'Warband Cohesion'
        : 'Protected Advance';

  const body =
    activeFaction === 'elf'
      ? 'Practice the Elven spacing rule: field at least two squads without placing any pair directly beside one another.'
      : activeFaction === 'orc'
        ? 'Practice Orc pressure: field at least two squads and place at least one pair directly beside one another.'
        : 'Learn the core Human combined-arms concept without needing stronger equipment.';

  const check = () => {
    if (completeFormationTrial()) {
      setMessage('Trial complete! +25 Gold and +4 Iron.');
      return;
    }

    setMessage(
      activeFaction === 'elf'
        ? 'Not quite. Separate every active squad so no two are orthogonally adjacent.'
        : activeFaction === 'orc'
          ? 'Not quite. Put at least two active squads directly beside one another.'
          : 'Not quite. Put Harlan in the front row and Mira directly behind him in the same column.'
    );
  };

  return (
    <View style={styles.content}>
      <GameCard accent={accent} faction={activeFaction}>
        <Text style={[styles.eyebrow, { color: accent }]}>FORMATION TRIAL 01</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>{body}</Text>
      </GameCard>

      <GameCard faction={activeFaction} state={formationTrialCompleted ? 'ready' : 'default'}>
        <View style={styles.goalHeader}>
          <Text style={[styles.goalTitle, { color: theme.colors.text }]}>Objective</Text>
          <StatusPill
            label={formationTrialCompleted ? 'COMPLETE' : 'IN PROGRESS'}
            tone={formationTrialCompleted ? 'done' : 'current'}
          />
        </View>

        {activeFaction === 'human' ? (
          <>
            <Text style={[styles.goalBody, { color: theme.colors.textMuted }]}>
              Harlan must stand in the front row. Mira must stand in the same column somewhere behind him.
            </Text>
            <View style={styles.checks}>
              <View style={styles.checkRow}>
                <StatusPill label={humanFront ? 'DONE' : 'TODO'} tone={humanFront ? 'done' : 'locked'} />
                <Text style={[styles.check, { color: theme.colors.text }]}>Harlan in front row</Text>
              </View>
              <View style={styles.checkRow}>
                <StatusPill label={humanBehind ? 'DONE' : 'TODO'} tone={humanBehind ? 'done' : 'locked'} />
                <Text style={[styles.check, { color: theme.colors.text }]}>Mira behind the front</Text>
              </View>
              <View style={styles.checkRow}>
                <StatusPill label={humanColumn ? 'DONE' : 'TODO'} tone={humanColumn ? 'done' : 'locked'} />
                <Text style={[styles.check, { color: theme.colors.text }]}>Same column protection</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.goalBody, { color: theme.colors.textMuted }]}>
              {activeFaction === 'elf'
                ? 'Keep two or more active squads separated so each has room to maneuver.'
                : 'Place two or more active squads so at least one pair shares an edge.'}
            </Text>
            <View style={styles.checks}>
              <View style={styles.checkRow}>
                <StatusPill
                  label={occupiedSlots.length >= 2 ? 'DONE' : 'TODO'}
                  tone={occupiedSlots.length >= 2 ? 'done' : 'locked'}
                />
                <Text style={[styles.check, { color: theme.colors.text }]}>At least two active squads</Text>
              </View>
              <View style={styles.checkRow}>
                <StatusPill
                  label={(activeFaction === 'elf' ? elfSpread : orcCohesion) ? 'DONE' : 'TODO'}
                  tone={(activeFaction === 'elf' ? elfSpread : orcCohesion) ? 'done' : 'locked'}
                />
                <Text style={[styles.check, { color: theme.colors.text }]}>
                  {activeFaction === 'elf' ? 'Open spacing maintained' : 'Adjacent warband pair'}
                </Text>
              </View>
            </View>
          </>
        )}
      </GameCard>

      <GameCard faction={activeFaction}>
        <Text style={[styles.rewardTitle, { color: theme.colors.text }]}>First-clear reward</Text>
        <View style={styles.rewardRow}>
          <ResourceAmountRow prefix="+" values={{ gold: 25, iron: 4 }} />
        </View>
        <Text style={[styles.rewardNote, { color: theme.colors.textMuted }]}>
          Trials reward tactical understanding rather than raw army strength.
        </Text>
      </GameCard>

      {message ? (
        <Text style={[styles.message, { color: formationTrialCompleted ? theme.colors.primary : theme.colors.gold }]}>
          {message}
        </Text>
      ) : null}

      {formationTrialCompleted ? (
        <PrimaryButton label="Return to Campaign" onPress={onExit} />
      ) : (
        <>
          <PrimaryButton label="Check Formation" onPress={check} />
          <SecondaryButton label="Edit Formation" onPress={onEditFormation} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 16, gap: 13 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 26, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  goalTitle: { fontSize: 17, fontWeight: '900' },
  goalBody: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  checks: { gap: 8, marginTop: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  check: { flex: 1, fontSize: 12, fontWeight: '800' },
  rewardTitle: { fontSize: 15, fontWeight: '900' },
  rewardRow: { marginTop: 8 },
  rewardNote: { fontSize: 10.5, lineHeight: 16, marginTop: 5 },
  message: { textAlign: 'center', fontSize: 11, lineHeight: 16, fontWeight: '800' }
});
