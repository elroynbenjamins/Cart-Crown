import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, UnitPortrait } from '../ui/components';
import { StoryScene } from '../ui/gameArt';

export function MarcherEnvoyScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    marcherAuxiliaryOptions,
    chooseMarcherAuxiliary
  } = useGame();
  const [selectedId, setSelectedId] = useState(
    marcherAuxiliaryOptions[0]?.id ?? ''
  );
  const [chosen, setChosen] = useState(false);

  const selected =
    marcherAuxiliaryOptions.find(option => option.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected) return;
    if (chooseMarcherAuxiliary(selected.id)) {
      setChosen(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>CHAPTER 3 · BORDER KINGDOMS</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Marcher Envoy</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Greenkeep Town draws its first formal visitor from the Border Marches. The envoy warns that the marcher lords are divided and offers one experienced auxiliary squad before you enter their territory.
        </Text>
        <View style={styles.sceneWrap}>
          <StoryScene scene="marcher_envoy" size={236} />
        </View>
      </GameCard>

      <GameCard>
        <Text style={[styles.storyTitle, { color: theme.colors.text }]}>A divided frontier</Text>
        <Text style={[styles.storyBody, { color: theme.colors.textMuted }]}>
          Three marcher houses claim they are defending the same roads, yet their soldiers have begun stopping one another at old forts. Crownspire coin appears in every camp.
        </Text>
      </GameCard>

      <View style={styles.list}>
        {marcherAuxiliaryOptions.map(option => {
          const selectedOption = selectedId === option.id;

          return (
            <PressableCard
              key={option.id}
              selected={selectedOption}
              onPress={() => setSelectedId(option.id)}
            >
              <GameCard accent={selectedOption ? theme.colors.gold : undefined}>
                <View style={styles.optionHeader}>
                  <UnitPortrait
                    name={option.unit.name}
                    className={option.unit.className + ' · Lv. ' + option.unit.level}
                    accent={selectedOption ? theme.colors.gold : theme.colors.human}
                    faction={option.unit.faction}
                  />
                  <Pill label={option.archetype.toUpperCase()} />
                </View>
                <Text style={[styles.pitch, { color: theme.colors.text }]}>{option.pitch}</Text>
                <Text style={[styles.tradeoff, { color: theme.colors.textMuted }]}>
                  Tradeoff: {option.tradeoff}
                </Text>
              </GameCard>
            </PressableCard>
          );
        })}
      </View>

      {chosen ? (
        <PrimaryButton label="Enter the Border Marches" onPress={onComplete} />
      ) : (
        <PrimaryButton
          label={selected ? 'Accept ' + selected.unit.className : 'Choose auxiliary'}
          disabled={!selected}
          onPress={confirm}
        />
      )}
    </ScrollView>
  );
}

function PressableCard({
  children,
  onPress
}: {
  children: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <View onTouchEnd={onPress}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  sceneWrap: { alignItems: 'center', marginTop: 10 },
  storyTitle: { fontSize: 16, fontWeight: '900' },
  storyBody: { fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  list: { gap: 9 },
  optionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pitch: { fontSize: 11.5, lineHeight: 17, fontWeight: '800', marginTop: 10 },
  tradeoff: { fontSize: 10.5, lineHeight: 15, marginTop: 5 }
});
