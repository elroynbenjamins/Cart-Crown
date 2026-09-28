import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SecondaryButton } from '../ui/components';

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
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>FORMATION TRIAL 01</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Protected Advance</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Learn the core Human combined-arms concept without needing stronger equipment.
        </Text>
      </GameCard>

      <GameCard>
        <Text style={[styles.goalTitle, { color: theme.colors.text }]}>Objective</Text>
        <Text style={[styles.goalBody, { color: theme.colors.textMuted }]}>
          Harlan must stand in the front row. Mira must stand in the same column somewhere behind him.
        </Text>

        <View style={styles.checks}>
          <Text style={[styles.check, { color: harlanFront ? theme.colors.primary : theme.colors.textMuted }]}>
            {harlanFront ? '✓' : '○'} Harlan in front row
          </Text>
          <Text style={[styles.check, { color: miraBehind ? theme.colors.primary : theme.colors.textMuted }]}>
            {miraBehind ? '✓' : '○'} Mira behind the front
          </Text>
          <Text style={[styles.check, { color: sameColumn ? theme.colors.primary : theme.colors.textMuted }]}>
            {sameColumn ? '✓' : '○'} Same column protection
          </Text>
        </View>
      </GameCard>

      <GameCard>
        <Text style={[styles.rewardTitle, { color: theme.colors.text }]}>First-clear reward</Text>
        <Text style={[styles.rewardBody, { color: theme.colors.gold }]}>25 Gold · 4 Iron</Text>
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
  goalTitle: { fontSize: 17, fontWeight: '900' },
  goalBody: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  checks: { gap: 8, marginTop: 14 },
  check: { fontSize: 12, fontWeight: '800' },
  rewardTitle: { fontSize: 15, fontWeight: '900' },
  rewardBody: { fontSize: 13, fontWeight: '900', marginTop: 5 },
  rewardNote: { fontSize: 10.5, lineHeight: 16, marginTop: 5 },
  message: { textAlign: 'center', fontSize: 11, lineHeight: 16, fontWeight: '800' }
});
