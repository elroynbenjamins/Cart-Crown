import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SectionTitle } from '../ui/components';

export function FactionMandateScreen({
  onExit
}: {
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    resources,
    factionMandates,
    factionMandateId,
    activeFactionMandate,
    factionMandateSwitchCost,
    chooseFactionMandate
  } = useGame();

  const accent =
    activeFaction === 'elf' ? theme.colors.elf : theme.colors.orc;
  const [selectedId, setSelectedId] = useState(
    factionMandateId ?? factionMandates[0]?.id ?? ''
  );
  const [message, setMessage] = useState<string | null>(null);

  const selected =
    factionMandates.find(mandate => mandate.id === selectedId) ?? null;
  const switching =
    Boolean(factionMandateId) && selectedId !== factionMandateId;

  const confirm = () => {
    if (!selected) return;
    const ok = chooseFactionMandate(selected.id);
    setMessage(
      ok
        ? selected.name + ' is now active.'
        : 'Not enough Gold to replace the current choice.'
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <Text style={[styles.eyebrow, { color: accent }]}>
          {activeFaction === 'elf' ? 'STARROOT CONCLAVE' : 'WARFIRE CONFEDERACY'}
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {activeFaction === 'elf' ? 'Worldroot Attunement' : 'Clan Pact'}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          One strategic priority can be active at a time. The first choice is free; replacing it later costs {factionMandateSwitchCost} Gold.
        </Text>
      </GameCard>

      <SectionTitle
        title={activeFaction === 'elf' ? 'Choose an attunement' : 'Choose a pact'}
        trailing={activeFactionMandate ? '1 active' : 'Choose 1'}
      />

      <View style={styles.list}>
        {factionMandates.map(mandate => {
          const current = factionMandateId === mandate.id;
          const selectedOption = selectedId === mandate.id;

          return (
            <View
              key={mandate.id}
              onTouchEnd={() => setSelectedId(mandate.id)}
            >
              <GameCard accent={selectedOption ? accent : undefined}>
                <View style={styles.header}>
                  <View style={styles.copy}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>
                      {mandate.name}
                    </Text>
                    <Text style={[styles.subtitle, { color: accent }]}>
                      {mandate.subtitle}
                    </Text>
                  </View>
                  <Pill label={current ? 'ACTIVE' : selectedOption ? 'SELECTED' : 'OPTION'} />
                </View>
                <Text style={[styles.description, { color: theme.colors.textMuted }]}>
                  {mandate.description}
                </Text>
                <Text style={[styles.effect, { color: theme.colors.primary }]}>
                  {mandate.effectText}
                </Text>
              </GameCard>
            </View>
          );
        })}
      </View>

      {selected ? (
        <GameCard>
          <Text style={[styles.confirmTitle, { color: theme.colors.text }]}>
            {selected.name}
          </Text>
          <Text style={[styles.confirmBody, { color: theme.colors.textMuted }]}>
            {factionMandateId === selected.id
              ? 'This choice is already active.'
              : switching
                ? 'Replacing the current choice costs ' + factionMandateSwitchCost + ' Gold. You have ' + resources.gold + ' Gold.'
                : 'Your first choice is free.'}
          </Text>
          <View style={styles.button}>
            <PrimaryButton
              label={
                factionMandateId === selected.id
                  ? 'Current Choice'
                  : switching
                    ? 'Adopt for ' + factionMandateSwitchCost + ' Gold'
                    : 'Adopt ' + selected.name
              }
              disabled={
                factionMandateId === selected.id ||
                (switching && resources.gold < factionMandateSwitchCost)
              }
              onPress={confirm}
            />
          </View>
        </GameCard>
      ) : null}

      {message ? (
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>
          {message}
        </Text>
      ) : null}

      <PrimaryButton label="Return to Kingdom" onPress={onExit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  list: { gap: 9 },
  header: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  copy: { flex: 1 },
  name: { fontSize: 17, fontWeight: '900' },
  subtitle: { fontSize: 9.5, fontWeight: '900', marginTop: 2 },
  description: { fontSize: 11, lineHeight: 16, marginTop: 8 },
  effect: { fontSize: 10.5, lineHeight: 15, fontWeight: '900', marginTop: 8 },
  confirmTitle: { fontSize: 16, fontWeight: '900' },
  confirmBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  button: { marginTop: 10 },
  message: { textAlign: 'center', fontSize: 10.5, fontWeight: '800' }
});
