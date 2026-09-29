import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEncounter } from '../game/encounters';
import type { EncounterId } from '../game/encounters';
import { getArmyReadinessProfile } from '../game/balance';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  StatusPill
} from '../ui/components';
import type { BattleCombatSummary } from './BattleScreen';

export function DefeatResultsScreen({
  encounterId,
  battleSummary,
  onPrepareRematch,
  onOpenFormation,
  onOpenWagon,
  onLeave
}: {
  encounterId: EncounterId;
  battleSummary: BattleCombatSummary;
  onPrepareRematch: () => void;
  onOpenFormation: () => void;
  onOpenWagon: () => void;
  onLeave: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    armyReadiness,
    armyResupplyCost,
    resources,
    restAndResupplyArmy
  } = useGame();

  const encounter = getEncounter(encounterId);
  const readinessProfile =
    getArmyReadinessProfile(armyReadiness);
  const enemyHpPercent =
    battleSummary.enemyMaxHp > 0
      ? Math.max(
          0,
          Math.round(
            (battleSummary.enemyRemainingHp /
              battleSummary.enemyMaxHp) *
              100
          )
        )
      : 0;
  const canResupply =
    armyReadiness < 100 &&
    resources.provisions >= armyResupplyCost;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <StatusPill label="DEFEAT" tone="elite" />
        <Text
          style={[
            styles.title,
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
          Your force withdrew before the enemy line broke. The encounter remains available and no hidden comeback bonus has been applied.
        </Text>
      </View>

      <SectionTitle
        title="Battle report"
        trailing={
          String(battleSummary.exchanges) +
          ' exchanges'
        }
      />
      <GameCard
        faction={activeFaction}
        state="danger"
      >
        <View style={styles.metrics}>
          <View
            style={[
              styles.metric,
              { backgroundColor: theme.colors.surface2 }
            ]}
          >
            <Text
              style={[
                styles.metricValue,
                { color: theme.colors.primary }
              ]}
            >
              {battleSummary.damageDealt}
            </Text>
            <Text
              style={[
                styles.metricLabel,
                { color: theme.colors.textMuted }
              ]}
            >
              DAMAGE DEALT
            </Text>
          </View>

          <View
            style={[
              styles.metric,
              { backgroundColor: theme.colors.surface2 }
            ]}
          >
            <Text
              style={[
                styles.metricValue,
                { color: theme.colors.danger }
              ]}
            >
              {battleSummary.damageTaken}
            </Text>
            <Text
              style={[
                styles.metricLabel,
                { color: theme.colors.textMuted }
              ]}
            >
              DAMAGE TAKEN
            </Text>
          </View>

          <View
            style={[
              styles.metric,
              { backgroundColor: theme.colors.surface2 }
            ]}
          >
            <Text
              style={[
                styles.metricValue,
                { color: theme.colors.gold }
              ]}
            >
              {enemyHpPercent}%
            </Text>
            <Text
              style={[
                styles.metricLabel,
                { color: theme.colors.textMuted }
              ]}
            >
              ENEMY HP LEFT
            </Text>
          </View>

          <View
            style={[
              styles.metric,
              { backgroundColor: theme.colors.surface2 }
            ]}
          >
            <Text
              style={[
                styles.metricValue,
                { color: theme.colors.text }
              ]}
            >
              -{battleSummary.readinessWear}
            </Text>
            <Text
              style={[
                styles.metricLabel,
                { color: theme.colors.textMuted }
              ]}
            >
              READINESS
            </Text>
          </View>
        </View>
      </GameCard>

      <SectionTitle title="What was lost" />
      <GameCard faction={activeFaction}>
        <View style={styles.lossRow}>
          <StatusPill label="KEPT" tone="done" />
          <Text
            style={[
              styles.lossText,
              { color: theme.colors.text }
            ]}
          >
            Units and equipment
          </Text>
        </View>
        <View style={styles.lossRow}>
          <StatusPill label="KEPT" tone="done" />
          <Text
            style={[
              styles.lossText,
              { color: theme.colors.text }
            ]}
          >
            Gold and campaign resources
          </Text>
        </View>
        <View style={styles.lossRow}>
          <StatusPill label="UNCHANGED" tone="neutral" />
          <Text
            style={[
              styles.lossText,
              { color: theme.colors.text }
            ]}
          >
            Campaign progress
          </Text>
        </View>
        <View style={styles.lossRow}>
          <StatusPill label="WORN" tone="elite" />
          <Text
            style={[
              styles.lossText,
              { color: theme.colors.text }
            ]}
          >
            Army Readiness
          </Text>
        </View>
        <Text
          style={[
            styles.lossNote,
            { color: theme.colors.textMuted }
          ]}
        >
          The failed attempt grants no normal victory reward. The lasting cost is battle wear and the time/resources you choose to spend preparing the rematch.
        </Text>
      </GameCard>

      <SectionTitle
        title="Army condition"
        trailing={String(armyReadiness) + '%'}
      />
      <GameCard
        faction={activeFaction}
        state={
          armyReadiness >= 70
            ? 'ready'
            : armyReadiness >= 50
              ? 'default'
              : 'danger'
        }
      >
        <View style={styles.conditionHeader}>
          <View style={styles.conditionCopy}>
            <Text
              style={[
                styles.conditionTitle,
                { color: theme.colors.text }
              ]}
            >
              {readinessProfile.label}
            </Text>
            <Text
              style={[
                styles.conditionBody,
                { color: theme.colors.textMuted }
              ]}
            >
              Entered at {battleSummary.startingReadiness}% · lost {battleSummary.readinessWear} Readiness · now {armyReadiness}%.
            </Text>
          </View>
          <StatusPill
            label={
              armyReadiness >= 70
                ? 'COMBAT READY'
                : 'RECOVERY ADVISED'
            }
            tone={
              armyReadiness >= 70
                ? 'ready'
                : armyReadiness >= 50
                  ? 'available'
                  : 'elite'
            }
          />
        </View>

        {armyReadiness < 100 ? (
          <View style={styles.recoveryAction}>
            <SecondaryButton
              label={
                canResupply
                  ? 'Rest & Resupply · ' +
                    armyResupplyCost +
                    ' provisions'
                  : 'Need ' +
                    armyResupplyCost +
                    ' provisions to fully recover'
              }
              disabled={!canResupply}
              onPress={
                canResupply
                  ? restAndResupplyArmy
                  : undefined
              }
            />
          </View>
        ) : null}
      </GameCard>

      <SectionTitle title="Next attempt" />
      <GameCard faction={activeFaction}>
        <Text
          style={[
            styles.nextTitle,
            { color: theme.colors.text }
          ]}
        >
          Prepare the rematch
        </Text>
        <Text
          style={[
            styles.nextBody,
            { color: theme.colors.textMuted }
          ]}
        >
          Returning to Battle Prep recalculates Readiness, formation fit, supplies and equipment from your current army. The enemy receives no hidden reduction after a defeat.
        </Text>

        <View style={styles.nextActions}>
          <SecondaryButton
            label="Review Formation"
            onPress={onOpenFormation}
          />
          <SecondaryButton
            label="Review Supply Wagon"
            onPress={onOpenWagon}
          />
          <PrimaryButton
            label="Prepare Rematch"
            onPress={onPrepareRematch}
          />
        </View>
      </GameCard>

      <SecondaryButton
        label="Leave and return to Campaign"
        onPress={onLeave}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14
  },
  header: {
    alignItems: 'center',
    paddingVertical: 14
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 7
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 340,
    marginTop: 7
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  metric: {
    minWidth: '47%',
    flexGrow: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  metricValue: {
    fontSize: 19,
    fontWeight: '900'
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginTop: 3
  },
  lossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 8
  },
  lossText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: '800'
  },
  lossNote: {
    fontSize: 9.5,
    lineHeight: 15,
    marginTop: 3
  },
  conditionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10
  },
  conditionCopy: { flex: 1 },
  conditionTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  conditionBody: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5
  },
  recoveryAction: { marginTop: 12 },
  nextTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  nextBody: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 6
  },
  nextActions: {
    gap: 8,
    marginTop: 12
  }
});
