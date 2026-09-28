import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { factions } from '../game/factions';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SectionTitle } from '../ui/components';
import { CommanderPortrait, FactionCrest } from '../ui/gameArt';

const effectLabels: Record<string, string> = {
  single_damage: 'Direct Damage',
  bleed: 'Bleed',
  morale_break: 'Morale Break',
  armor_break: 'Armor Break'
};

export function CommanderChoiceScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    resources,
    commanderPaths,
    commanderPathId,
    commanderRespecCost,
    chooseCommanderPath
  } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(
    commanderPathId ?? commanderPaths[0]?.id ?? null
  );
  const [message, setMessage] = useState<string | null>(null);

  const selected = commanderPaths.find(path => path.id === selectedId) ?? null;
  const faction = factions[activeFaction];
  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;
  const isRespec = Boolean(commanderPathId && selectedId !== commanderPathId);
  const canAfford = !isRespec || resources.gold >= commanderRespecCost;

  const confirm = () => {
    if (!selected) return;
    const ok = chooseCommanderPath(selected.id);
    if (!ok) {
      setMessage('You do not have enough Gold to retrain your command style.');
      return;
    }
    setMessage(
      commanderPathId
        ? 'Commander path updated.'
        : selected.name + ' chosen as your commander specialization.'
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>COMMAND PATH</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>What kind of commander will you become?</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              Your commander specialization boosts certain squad roles and gives one command skill that fires automatically during battle.
            </Text>
          </View>
          <FactionCrest faction={activeFaction} size={52} />
        </View>
        {commanderPathId ? (
          <Text style={[styles.respec, { color: theme.colors.textMuted }]}>
            Retraining later costs {commanderRespecCost} Gold.
          </Text>
        ) : (
          <Text style={[styles.respec, { color: theme.colors.primary }]}>
            Your first commander specialization is free.
          </Text>
        )}
      </GameCard>

      <SectionTitle
        title={faction.name + ' commander paths'}
        trailing="Choose 1 of 3"
      />

      <View style={styles.pathList}>
        {commanderPaths.map(path => {
          const chosen = path.id === selectedId;
          const current = path.id === commanderPathId;

          return (
            <View key={path.id}>
              <GameCard accent={chosen ? theme.colors.gold : current ? theme.colors.primary : undefined}>
                <View style={styles.pathHeader}>
                  <View style={styles.commanderPortrait}>
                    <CommanderPortrait pathId={path.id} faction={path.faction} size={66} />
                  </View>
                  <View style={styles.pathCopy}>
                    <Text style={[styles.pathName, { color: theme.colors.text }]}>{path.name}</Text>
                    <Text style={[styles.pathTitle, { color: factionAccent }]}>{path.title}</Text>
                  </View>
                  <Pill label={current ? 'CURRENT' : chosen ? 'SELECTED' : path.favoredRoles.join(' + ').toUpperCase()} />
                </View>

                <Text style={[styles.passiveName, { color: theme.colors.text }]}>
                  Passive · {path.passiveName}
                </Text>
                <Text style={[styles.description, { color: theme.colors.textMuted }]}>
                  {path.passiveDescription}
                </Text>

                <View style={[styles.skillBox, { backgroundColor: theme.colors.surface2 }]}>
                  <View style={styles.skillHeader}>
                    <Text style={[styles.skillName, { color: theme.colors.text }]}>
                      Command Skill · {path.skill.name}
                    </Text>
                    <Text style={[styles.effectType, { color: theme.colors.gold }]}>
                      {effectLabels[path.skill.effectType] ?? path.skill.effectType}
                    </Text>
                  </View>
                  <Text style={[styles.description, { color: theme.colors.textMuted }]}>
                    {path.skill.description}
                  </Text>
                </View>

                <View style={styles.multiplierRow}>
                  <Text style={[styles.multiplier, { color: theme.colors.text }]}>
                    ATK ×{path.attackMultiplier.toFixed(2)}
                  </Text>
                  <Text style={[styles.multiplier, { color: theme.colors.text }]}>
                    ARM ×{path.armorMultiplier.toFixed(2)}
                  </Text>
                  <Text style={[styles.multiplier, { color: theme.colors.text }]}>
                    SPD ×{path.speedMultiplier.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.chooseButton}>
                  <PrimaryButton
                    label={chosen ? 'Selected' : 'Choose ' + path.name}
                    onPress={() => setSelectedId(path.id)}
                  />
                </View>
              </GameCard>
            </View>
          );
        })}
      </View>

      {selected ? (
        <GameCard accent={theme.colors.gold}>
          <View style={styles.confirmRow}>
            <CommanderPortrait pathId={selected.id} faction={selected.faction} size={72} />
            <View style={styles.confirmCopy}>
              <Text style={[styles.confirmLabel, { color: theme.colors.gold }]}>CONFIRM COMMAND</Text>
              <Text style={[styles.confirmTitle, { color: theme.colors.text }]}>{selected.name}</Text>
              <Text style={[styles.confirmBody, { color: theme.colors.textMuted }]}>
                Favored roles: {selected.favoredRoles.join(', ')}. {isRespec ? 'Retraining will cost ' + commanderRespecCost + ' Gold.' : 'This first choice costs no Gold.'}
              </Text>
            </View>
          </View>
          <View style={styles.confirmButton}>
            <PrimaryButton
              label={
                commanderPathId === selected.id
                  ? 'Current specialization'
                  : isRespec
                    ? 'Retrain for ' + commanderRespecCost + ' Gold'
                    : 'Become ' + selected.name
              }
              disabled={commanderPathId === selected.id || !canAfford}
              onPress={confirm}
            />
          </View>
        </GameCard>
      ) : null}

      {message ? (
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
      ) : null}

      {commanderPathId ? (
        <PrimaryButton label="Return to Army" onPress={onComplete} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroCopy: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12, lineHeight: 18, marginTop: 7 },
  respec: { fontSize: 10.5, fontWeight: '800', marginTop: 9 },
  pathList: { gap: 10 },
  pathHeader: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  commanderPortrait: { width: 72, alignItems: 'center', justifyContent: 'center' },
  pathCopy: { flex: 1 },
  pathName: { fontSize: 18, fontWeight: '900' },
  pathTitle: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  passiveName: { fontSize: 12, fontWeight: '900', marginTop: 12 },
  description: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  skillBox: { borderRadius: 14, padding: 10, marginTop: 11 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  skillName: { flex: 1, fontSize: 11, fontWeight: '900' },
  effectType: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  multiplierRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  multiplier: { fontSize: 9.5, fontWeight: '900' },
  chooseButton: { marginTop: 11 },
  confirmRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  confirmCopy: { flex: 1 },
  confirmLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  confirmTitle: { fontSize: 19, fontWeight: '900', marginTop: 4 },
  confirmBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  confirmButton: { marginTop: 11 },
  message: { fontSize: 10.5, lineHeight: 16, textAlign: 'center', fontWeight: '800' }
});
