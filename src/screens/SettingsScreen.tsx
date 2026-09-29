import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  tacticalGuidanceOptions
} from '../game/tacticalGuidance';
import { usePreferences } from '../preferences/PreferencesProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  Pill,
  SectionTitle
} from '../ui/components';

export function SettingsScreen() {
  const { theme } = useGameTheme();
  const {
    tacticalGuidance,
    setTacticalGuidance
  } = usePreferences();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GameCard accent={theme.colors.gold}>
        <Text
          style={[
            styles.eyebrow,
            { color: theme.colors.gold }
          ]}
        >
          GAMEPLAY PREFERENCES
        </Text>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text }
          ]}
        >
          Keep challenge and guidance separate
        </Text>
        <Text
          style={[
            styles.body,
            { color: theme.colors.textMuted }
          ]}
        >
          Tactical Guidance changes how much the game explains and suggests. It never changes enemy strength, rewards, progression or combat balance.
        </Text>
      </GameCard>

      <SectionTitle
        title="Tactical Guidance"
        trailing="App-wide"
      />

      <View style={styles.optionList}>
        {tacticalGuidanceOptions.map(option => {
          const selected =
            option.id === tacticalGuidance;

          return (
            <Pressable
              key={option.id}
              onPress={() =>
                setTacticalGuidance(option.id)
              }
              style={({ pressed }) => ({
                opacity: pressed ? 0.78 : 1
              })}
            >
              <GameCard
                accent={
                  selected
                    ? theme.colors.gold
                    : undefined
                }
              >
                <View style={styles.optionHeader}>
                  <View style={styles.optionCopy}>
                    <Text
                      style={[
                        styles.optionName,
                        { color: theme.colors.text }
                      ]}
                    >
                      {option.name}
                    </Text>
                    <Text
                      style={[
                        styles.optionSummary,
                        {
                          color:
                            selected
                              ? theme.colors.gold
                              : theme.colors.textMuted
                        }
                      ]}
                    >
                      {option.summary}
                    </Text>
                  </View>
                  {selected ? (
                    <Pill
                      label="ACTIVE"
                      color={
                        theme.colors.gold + '35'
                      }
                    />
                  ) : null}
                </View>

                <Text
                  style={[
                    styles.optionDetail,
                    { color: theme.colors.textMuted }
                  ]}
                >
                  {option.detail}
                </Text>
              </GameCard>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={[
          styles.footer,
          { color: theme.colors.textMuted }
        ]}
      >
        Recommended default: Standard. Full guidance is useful while learning the formation system; Off is for players who prefer to read the battlefield themselves.
      </Text>
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
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    marginTop: 5
  },
  body: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9
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
  optionSummary: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    marginTop: 4
  },
  optionDetail: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 9
  },
  footer: {
    fontSize: 9.5,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 8
  }
});
