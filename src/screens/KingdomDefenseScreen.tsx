import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, ProgressBar, ResourceAmountRow, SecondaryButton, StatusPill } from '../ui/components';

const wavesByFaction = {
  human: [
    { id: 'wave_1', name: 'Road Raiders', threat: 90, pressure: 'Light melee rush' },
    { id: 'wave_2', name: 'Mercenary Bowline', threat: 115, pressure: 'Ranged pressure behind shields' },
    { id: 'wave_3', name: 'Green Banner Assault', threat: 140, pressure: 'Mixed elite attack' }
  ],
  elf: [
    { id: 'wave_1', name: 'Ashwood Raiders', threat: 90, pressure: 'Fast pressure through the outer paths' },
    { id: 'wave_2', name: 'Wardbreaker Bowline', threat: 115, pressure: 'Ranged pressure against the grove line' },
    { id: 'wave_3', name: 'Ashen Grove Assault', threat: 140, pressure: 'Mixed elite attack on the ward network' }
  ],
  orc: [
    { id: 'wave_1', name: 'Steppe Raiders', threat: 90, pressure: 'Fast melee pressure at the outer fires' },
    { id: 'wave_2', name: 'Clanbreaker Bowline', threat: 115, pressure: 'Ranged pressure against the warband line' },
    { id: 'wave_3', name: 'Ashen Warhost Assault', threat: 140, pressure: 'Mixed elite attack on the Warhold' }
  ]
} as const;

export function KingdomDefenseScreen({
  onEditFormation,
  onExit
}: {
  onEditFormation: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
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
  const [firstClearReward, setFirstClearReward] = useState(false);
  const waves = wavesByFaction[activeFaction];

  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;
  const defenseTitle =
    activeFaction === 'elf'
      ? 'Heartgrove Defense'
      : activeFaction === 'orc'
        ? 'Warhold Defense'
        : 'Kingdom Defense';
  const victoryTitle =
    activeFaction === 'elf'
      ? 'Heartgrove Holds'
      : activeFaction === 'orc'
        ? 'The Warhold Holds'
        : 'Greenkeep Holds';

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
      const wasFirstClear = !kingdomDefenseCompleted;
      const ok = completeKingdomDefense();
      if (ok) setFirstClearReward(wasFirstClear);
      setComplete(ok);
      return;
    }

    setWaveIndex(previous => previous + 1);
    setFailed(false);
  };

  return (
    <View style={styles.content}>
      <GameCard accent={factionAccent} faction={activeFaction}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: factionAccent }]}>FORT SIDE MODE</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{defenseTitle}</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              One formation and one Wagon must hold through consecutive waves. Your tactical setup carries through the entire defense.
            </Text>
          </View>
          <StatusPill
            label={kingdomDefenseCompleted ? 'REPEATABLE' : 'FIRST DEFENSE'}
            tone={kingdomDefenseCompleted ? 'available' : 'current'}
          />
        </View>
      </GameCard>

      <GameCard
        faction={activeFaction}
        state={defensePower >= currentWave.threat ? 'ready' : 'danger'}
        accent={defensePower >= currentWave.threat ? theme.colors.primary : theme.colors.gold}
      >
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

      <GameCard faction={activeFaction}>
        <View style={styles.waveHeader}>
          <Text style={[styles.waveLabel, { color: theme.colors.gold }]}>
            WAVE {waveIndex + 1} / {waves.length}
          </Text>
          <StatusPill
            label={waveIndex === waves.length - 1 ? 'FINAL' : 'ACTIVE'}
            tone={waveIndex === waves.length - 1 ? 'boss' : 'current'}
          />
        </View>
        <Text style={[styles.waveName, { color: theme.colors.text }]}>{currentWave.name}</Text>
        <Text style={[styles.waveBody, { color: theme.colors.textMuted }]}>{currentWave.pressure}</Text>
      </GameCard>

      {failed ? (
        <GameCard accent={theme.colors.danger} faction={activeFaction} state="danger">
          <Text style={[styles.failTitle, { color: theme.colors.text }]}>The line will not hold</Text>
          <Text style={[styles.failBody, { color: theme.colors.textMuted }]}>
            Improve equipment, change formation synergies, or adjust commander specialization before attempting this wave again.
          </Text>
        </GameCard>
      ) : null}

      {complete ? (
        <GameCard accent={theme.colors.primary} faction={activeFaction} state="ready">
          <View style={styles.completeHeader}>
            <Text style={[styles.failTitle, { color: theme.colors.text }]}>{victoryTitle}</Text>
            <StatusPill label="DEFENDED" tone="done" />
          </View>
          <View style={styles.rewardRow}>
            <ResourceAmountRow
              prefix="+"
              values={
                firstClearReward
                  ? { gold: 75, stone: 10, iron: 4, provisions: 5 }
                  : { gold: 50, stone: 6, iron: 2, provisions: 5 }
              }
            />
          </View>
          <Text style={[styles.failBody, { color: theme.colors.textMuted }]}>
            Regional production also advances one cycle.
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
  waveHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  waveLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  waveName: { fontSize: 18, fontWeight: '900', marginTop: 3 },
  waveBody: { fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  completeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rewardRow: { marginTop: 9 },
  failTitle: { fontSize: 16, fontWeight: '900' },
  failBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  button: { marginTop: 11 }
});
