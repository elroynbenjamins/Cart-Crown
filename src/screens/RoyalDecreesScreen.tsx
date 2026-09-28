import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SectionTitle } from '../ui/components';
import { FactionCrest, StoryScene } from '../ui/gameArt';

export function RoyalDecreesScreen({
  onExit
}: {
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    resources,
    royalDecrees,
    royalDecreeId,
    activeRoyalDecree,
    royalDecreeSwitchCost,
    chooseRoyalDecree
  } = useGame();

  const [selectedId, setSelectedId] = useState(
    royalDecreeId ?? royalDecrees[0]?.id ?? ''
  );
  const [message, setMessage] = useState<string | null>(null);

  const selected =
    royalDecrees.find(decree => decree.id === selectedId) ?? null;
  const switching =
    Boolean(royalDecreeId) && selectedId !== royalDecreeId;

  const confirm = () => {
    if (!selected) return;
    const ok = chooseRoyalDecree(selected.id);
    setMessage(
      ok
        ? selected.name + ' is now the active Royal Decree.'
        : 'Not enough Gold to replace the current decree.'
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>CAPITAL ADMINISTRATION</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Royal Decrees</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              Greenkeep now governs more than one road and settlement. One decree can be active at a time. The first choice is free; replacing it later costs {royalDecreeSwitchCost} Gold.
            </Text>
          </View>
          <FactionCrest faction="human" size={52} />
        </View>
        <View style={styles.sceneWrap}>
          <StoryScene scene="grand_council" size={236} />
        </View>
      </GameCard>

      <SectionTitle title="Choose the Capital’s priority" trailing={activeRoyalDecree ? '1 active' : 'Choose 1'} />

      <View style={styles.list}>
        {royalDecrees.map(decree => {
          const current = royalDecreeId === decree.id;
          const selectedOption = selectedId === decree.id;

          return (
            <View key={decree.id} onTouchEnd={() => setSelectedId(decree.id)}>
              <GameCard accent={selectedOption ? theme.colors.gold : current ? theme.colors.primary : undefined}>
                <View style={styles.header}>
                  <View style={styles.copy}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>
                      {decree.name}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.human }]}>
                      {decree.subtitle}
                    </Text>
                  </View>
                  <Pill label={current ? 'ACTIVE' : selectedOption ? 'SELECTED' : 'DECREE'} />
                </View>
                <Text style={[styles.description, { color: theme.colors.textMuted }]}>
                  {decree.description}
                </Text>
                <Text style={[styles.effect, { color: theme.colors.primary }]}>
                  {decree.effectText}
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
            {royalDecreeId === selected.id
              ? 'This decree is already active.'
              : switching
                ? 'Replacing the current decree costs ' + royalDecreeSwitchCost + ' Gold. You currently have ' + resources.gold + ' Gold.'
                : 'Your first Capital decree is free.'}
          </Text>
          <View style={styles.button}>
            <PrimaryButton
              label={
                royalDecreeId === selected.id
                  ? 'Current Decree'
                  : switching
                    ? 'Enact for ' + royalDecreeSwitchCost + ' Gold'
                    : 'Enact ' + selected.name
              }
              disabled={
                royalDecreeId === selected.id ||
                (switching && resources.gold < royalDecreeSwitchCost)
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
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroCopy: { flex: 1 },
  sceneWrap: { alignItems: 'center', marginTop: 10 },
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
