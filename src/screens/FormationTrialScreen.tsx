import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, ResourceAmountRow, SecondaryButton, StatusPill } from '../ui/components';

export function FormationTrialScreen({
  onEditFormation,
  onExit
}: {
  onEditFormation: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const { formation, formationTrialCompleted, completeFormationTrial } = useGame();
  const [message, setMessage] = useState<string | null>(null);

  const harlan = formation.indexOf('hum_militia');
  const mira = formation.indexOf('hum_recruit');
  const harlanFront = harlan >= 0 && harlan <= 2;
  const miraBehind = mira >= 3;
  const sameColumn = harlan >= 0 && mira >= 0 && harlan % 3 === mira % 3;

  const check = () => {
    if (completeFormationTrial()) {
      setMessage('Trial complete! +25 Gold and +4 Iron.');
    } else {
      setMessage('Not quite. Put Harlan in the front row and Mira directly behind him in the same column.');
    }
  };

  return (
    <View style={styles.content}>
      <GameCard accent={theme.colors.gold} faction="human">
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>FORMATION TRIAL 01</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Protected Advance</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Learn the core Human combined-arms concept without needing stronger equipment.
        </Text>
      </GameCard>

      <GameCard faction="human" state={formationTrialCompleted ? 'ready' : 'default'}>
        <View style={styles.goalHeader}>
          <Text style={[styles.goalTitle, { color: theme.colors.text }]}>Objective</Text>
          <StatusPill
            label={formationTrialCompleted ? 'COMPLETE' : 'IN PROGRESS'}
            tone={formationTrialCompleted ? 'done' : 'current'}
          />
        </View>
        <Text style={[styles.goalBody, { color: theme.colors.textMuted }]}>
          Harlan must stand in the front row. Mira must stand in the same column somewhere behind him.
        </Text>

        <View style={styles.checks}>
          <View style={styles.checkRow}>
            <StatusPill label={harlanFront ? 'DONE' : 'TODO'} tone={harlanFront ? 'done' : 'locked'} />
            <Text style={[styles.check, { color: theme.colors.text }]}>Harlan in front row</Text>
          </View>
          <View style={styles.checkRow}>
            <StatusPill label={miraBehind ? 'DONE' : 'TODO'} tone={miraBehind ? 'done' : 'locked'} />
            <Text style={[styles.check, { color: theme.colors.text }]}>Mira behind the front</Text>
          </View>
          <View style={styles.checkRow}>
            <StatusPill label={sameColumn ? 'DONE' : 'TODO'} tone={sameColumn ? 'done' : 'locked'} />
            <Text style={[styles.check, { color: theme.colors.text }]}>Same column protection</Text>
          </View>
        </View>
      </GameCard>

      <GameCard faction="human">
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
