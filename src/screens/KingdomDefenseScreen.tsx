import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, ProgressBar, SecondaryButton } from '../ui/components';

const waves = [
  { id: 'wave_1', name: 'Road Raiders', threat: 90, pressure: 'Light melee rush' },
  { id: 'wave_2', name: 'Mercenary Bowline', threat: 115, pressure: 'Ranged pressure behind shields' },
  { id: 'wave_3', name: 'Green Banner Assault', threat: 140, pressure: 'Mixed elite attack' }
];

export function KingdomDefenseScreen({
  onEditFormation,
  onExit
}: {
  onEditFormation: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    units,
    formation,
    formationAnalysis,
    activeCommanderPath,
    kingdomDefenseCompleted,
    completeKingdomDefense
  } = useGame();

  const [waveIndex, setWaveIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [complete, setComplete] = useState(false);

  const defensePower = useMemo(() => {
    const activeUnits = formation
      .filter((unitId): unitId is string => Boolean(unitId))
      .map(unitId => units.find(unit => unit.id === unitId))
      .filter((unit): unit is NonNullable<typeof unit> => Boolean(unit));

    const raw = activeUnits.reduce(
      (total, unit) =>
        total + unit.attack + unit.armor * 1.5 + unit.speed * 0.45,
      0
    );

    const command =
      activeCommanderPath
        ? 1 +
          (activeCommanderPath.attackMultiplier - 1) * 0.45 +
          (activeCommanderPath.armorMultiplier - 1) * 0.55
        : 1;

    return Math.round(
      raw *
        formationAnalysis.attackMultiplier *
        formationAnalysis.armorMultiplier *
        command
    );
  }, [
    activeCommanderPath,
    formation,
    formationAnalysis,
    units
  ]);

  const currentWave = waves[waveIndex] ?? waves[waves.length - 1]!;

  const resolveWave = () => {
    if (defensePower < currentWave.threat) {
      setFailed(true);
      return;
    }

    if (waveIndex >= waves.length - 1) {
      const ok = completeKingdomDefense();
      setComplete(ok);
      return;
    }

    setWaveIndex(previous => previous + 1);
    setFailed(false);
  };

  return (
    <View style={styles.content}>
      <GameCard accent={theme.colors.human}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>FORT SIDE MODE</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Kingdom Defense</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              One formation and one Wagon must hold through consecutive waves. Your tactical setup carries through the entire defense.
            </Text>
          </View>
          <Pill label={kingdomDefenseCompleted ? 'REPEATABLE' : 'FIRST DEFENSE'} />
        </View>
      </GameCard>

      <GameCard accent={defensePower >= currentWave.threat ? theme.colors.primary : theme.colors.gold}>
        <View style={styles.powerRow}>
          <View>
            <Text style={[styles.smallLabel, { color: theme.colors.textMuted }]}>DEFENSE POWER</Text>
            <Text style={[styles.power, { color: theme.colors.text }]}>{defensePower}</Text>
          </View>
          <View style={styles.threatCopy}>
            <Text style={[styles.smallLabel, { color: theme.colors.textMuted }]}>WAVE THREAT</Text>
            <Text style={[styles.power, { color: theme.colors.danger }]}>{currentWave.threat}</Text>
          </View>
        </View>
        <ProgressBar
          value={Math.min(1, defensePower / currentWave.threat)}
          color={defensePower >= currentWave.threat ? theme.colors.primary : theme.colors.gold}
        />
      </GameCard>

      <GameCard>
        <Text style={[styles.waveLabel, { color: theme.colors.gold }]}>
          WAVE {waveIndex + 1} / {waves.length}
        </Text>
        <Text style={[styles.waveName, { color: theme.colors.text }]}>{currentWave.name}</Text>
        <Text style={[styles.waveBody, { color: theme.colors.textMuted }]}>{currentWave.pressure}</Text>
      </GameCard>

      {failed ? (
        <GameCard accent={theme.colors.danger}>
          <Text style={[styles.failTitle, { color: theme.colors.text }]}>The line will not hold</Text>
          <Text style={[styles.failBody, { color: theme.colors.textMuted }]}>
            Improve equipment, change formation synergies, or adjust commander specialization before attempting this wave again.
          </Text>
        </GameCard>
      ) : null}

      {complete ? (
        <GameCard accent={theme.colors.primary}>
          <Text style={[styles.failTitle, { color: theme.colors.text }]}>Greenkeep Holds</Text>
          <Text style={[styles.failBody, { color: theme.colors.textMuted }]}>
            +60 Gold · +8 Stone · +4 Provisions. Regional production also advances one cycle.
          </Text>
          <View style={styles.button}>
            <PrimaryButton label="Return to Campaign" onPress={onExit} />
          </View>
        </GameCard>
      ) : (
        <>
          <PrimaryButton
            label={failed ? 'Retry Wave' : waveIndex === waves.length - 1 ? 'Defend Final Wave' : 'Defend Wave'}
            onPress={() => {
              if (failed) {
                setFailed(false);
              } else {
                resolveWave();
              }
            }}
          />
          <SecondaryButton label="Edit Formation" onPress={onEditFormation} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 16, gap: 13 },
  header: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 25, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 11.5, lineHeight: 17, marginTop: 6 },
  powerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  threatCopy: { alignItems: 'flex-end' },
  smallLabel: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1 },
  power: { fontSize: 24, fontWeight: '900', marginTop: 2 },
  waveLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  waveName: { fontSize: 18, fontWeight: '900', marginTop: 3 },
  waveBody: { fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  failTitle: { fontSize: 16, fontWeight: '900' },
  failBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  button: { marginTop: 11 }
});
