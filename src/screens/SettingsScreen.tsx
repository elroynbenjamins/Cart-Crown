import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { GuidanceMode } from '../game/types';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, SectionTitle } from '../ui/components';

const guidanceOptions: Array<{
  id: GuidanceMode;
  name: string;
  short: string;
  description: string;
  includes: string;
}> = [
  {
    id: 'full',
    name: 'Full Guidance',
    short: 'Recommended for learning',
    description:
      'Shows scouted loadout fit, exact tactical weaknesses, named squad swaps, target positions and guided OPEN actions.',
    includes:
      'Exact recommendations · guided changes · fit scores'
  },
  {
    id: 'hints',
    name: 'Hints Only',
    short: 'Strategic clues, no hand-holding',
    description:
      'Shows formation edges and broad tactical strengths or risks, but does not tell you exactly which squad to swap or where to move it.',
    includes:
      'Formation clues · broad warnings · no guided fixes'
  },
  {
    id: 'off',
    name: 'Off',
    short: 'Self-directed play',
    description:
      'Hides tactical recommendations and counter suggestions. Core status information such as squad count, readiness, food and raw combat modifiers remains visible.',
    includes:
      'Core information only · no recommendations'
  }
];

export function SettingsScreen() {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    guidanceMode,
    setGuidanceMode
  } = useGame();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GameCard faction={activeFaction} accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>
          PLAYER ASSISTANCE
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Tactical Guidance
        </Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Choose how much Battle Prep interprets scouting and formation data for you. This setting changes assistance only; it does not change enemy stats, combat difficulty, rewards or progression.
        </Text>
      </GameCard>

      <SectionTitle
        title="Guidance level"
        trailing="Applies to this save slot"
      />

      <View style={styles.optionList}>
        {guidanceOptions.map(option => {
          const selected = option.id === guidanceMode;

          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setGuidanceMode(option.id)}
              style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
            >
              <GameCard
                accent={selected ? theme.colors.gold : undefined}
                faction={activeFaction}
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionCopy}>
                    <Text
                      style={[
                        styles.optionName,
                        {
                          color: selected
                            ? theme.colors.gold
                            : theme.colors.text
                        }
                      ]}
                    >
                      {option.name}
                    </Text>
                    <Text
                      style={[
                        styles.optionShort,
                        { color: theme.colors.textMuted }
                      ]}
                    >
                      {option.short}
                    </Text>
                  </View>
                  <Pill
                    label={selected ? 'ACTIVE' : 'SELECT'}
                    color={
                      selected
                        ? theme.colors.gold + '40'
                        : undefined
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.optionBody,
                    { color: theme.colors.text }
                  ]}
                >
                  {option.description}
                </Text>
                <Text
                  style={[
                    styles.optionIncludes,
                    { color: theme.colors.textMuted }
                  ]}
                >
                  {option.includes}
                </Text>
              </GameCard>
            </Pressable>
          );
        })}
      </View>

      <GameCard>
        <Text style={[styles.noteTitle, { color: theme.colors.text }]}>
          Difficulty stays separate
        </Text>
        <Text style={[styles.noteBody, { color: theme.colors.textMuted }]}>
          A player can use Full Guidance on a demanding combat setting while learning, or turn guidance Off on a normal playthrough once they understand the systems. The two choices should not be tied together.
        </Text>
      </GameCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 13
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1
  },
  title: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    marginTop: 4
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8
  },
  optionList: { gap: 9 },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10
  },
  optionCopy: { flex: 1 },
  optionName: {
    fontSize: 15,
    fontWeight: '900'
  },
  optionShort: {
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 3
  },
  optionBody: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 9
  },
  optionIncludes: {
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '800',
    marginTop: 7
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '900'
  },
  noteBody: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5
  }
});
