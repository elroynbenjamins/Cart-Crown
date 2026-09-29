import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getEncounter,
  getEnemyFormationTactic
} from '../game/encounters';
import type { EncounterId } from '../game/encounters';
import { getFormationShape } from '../game/formation';
import { warTableContracts } from '../game/sideModes';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  PrimaryButton,
  ScreenHero,
  SectionTitle,
  StatusPill
} from '../ui/components';

export function WarTableScreen({
  onStartBattle
}: {
  onStartBattle: (encounterId: EncounterId) => void;
}) {
  const { theme } = useGameTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        eyebrow="OPTIONAL MODE"
        title="War Table"
        body="Scouts post short contracts away from the main campaign. Use them to practice counters, test formations and earn modest supplies without advancing the story."
        accent={theme.colors.primary}
        status={<StatusPill label="SCOUT CONTRACTS" tone="available" />}
      />

      <GameCard accent={theme.colors.primary}>
        <Text style={[styles.noticeTitle, { color: theme.colors.text }]}>
          Optional by design
        </Text>
        <Text style={[styles.noticeBody, { color: theme.colors.textMuted }]}>
          War Table victories do not unlock campaign nodes. Rewards are deliberately smaller than story milestones so this mode helps recovery and experimentation without becoming mandatory farming.
        </Text>
      </GameCard>

      <SectionTitle
        title="Available Contracts"
        trailing={warTableContracts.length + ' posted'}
      />

      {warTableContracts.map(contract => {
        const encounter = getEncounter(contract.encounterId);
        const tactic = getEnemyFormationTactic(
          contract.encounterId
        );
        const shape = getFormationShape(
          tactic.formationShapeId
        );

        return (
          <GameCard
            key={contract.id}
            accent={
              encounter.difficulty === 'Elite'
                ? theme.colors.gold
                : theme.colors.primary
            }
          >
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text
                  style={[
                    styles.name,
                    { color: theme.colors.text }
                  ]}
                >
                  {encounter.name}
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    { color: theme.colors.textMuted }
                  ]}
                >
                  {encounter.subtitle}
                </Text>
              </View>
              <StatusPill
                label={encounter.difficulty.toUpperCase()}
                tone={
                  encounter.difficulty === 'Elite'
                    ? 'elite'
                    : 'neutral'
                }
              />
            </View>

            <View
              style={[
                styles.intel,
                {
                  backgroundColor: theme.colors.surface2,
                  borderColor: theme.colors.border
                }
              ]}
            >
              <Text
                style={[
                  styles.intelLabel,
                  { color: theme.colors.primary }
                ]}
              >
                ENEMY FORMATION
              </Text>
              <Text
                style={[
                  styles.intelValue,
                  { color: theme.colors.text }
                ]}
              >
                {shape.layout} · {tactic.name}
              </Text>
              <Text
                style={[
                  styles.note,
                  { color: theme.colors.textMuted }
                ]}
              >
                {contract.tacticalNote}
              </Text>
            </View>

            <Text
              style={[
                styles.reward,
                { color: theme.colors.gold }
              ]}
            >
              Reward focus: {contract.rewardLabel}
            </Text>

            <View style={styles.button}>
              <PrimaryButton
                label="Prepare for Skirmish"
                onPress={() =>
                  onStartBattle(contract.encounterId)
                }
              />
            </View>
          </GameCard>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '900'
  },
  noticeBody: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  headerCopy: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: '900'
  },
  subtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16
  },
  intel: {
    marginTop: 11,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10
  },
  intelLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  intelValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '900'
  },
  note: {
    marginTop: 6,
    fontSize: 10.5,
    lineHeight: 15
  },
  reward: {
    marginTop: 9,
    fontSize: 10.5,
    fontWeight: '800'
  },
  button: {
    marginTop: 12
  }
});
