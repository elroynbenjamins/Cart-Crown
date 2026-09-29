import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEncounter } from '../game/encounters';
import type { EncounterId } from '../game/encounters';
import { getArmyReadinessProfile } from '../game/balance';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  MetricTile,
  PrimaryButton,
  ScreenHero,
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
      <ScreenHero
        eyebrow="AFTER ACTION"
        title={encounter.name}
        body="Your force withdrew before the enemy line broke. The encounter remains available at full strength."
        accent={theme.colors.danger}
        status={<StatusPill label="DEFEAT" tone="elite" />}
      >
        <View style={styles.heroMeta}>
          <StatusPill label="NO PERMANENT LOSSES" tone="done" />
          <StatusPill label="ENEMY UNCHANGED" tone="neutral" />
        </View>
      </ScreenHero>

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
          <MetricTile
            label="DAMAGE DEALT"
            value={battleSummary.damageDealt}
            tone="positive"
          />
          <MetricTile
            label="DAMAGE TAKEN"
            value={battleSummary.damageTaken}
            tone="danger"
          />
          <MetricTile
            label="ENEMY HP LEFT"
            value={enemyHpPercent + '%'}
            tone="gold"
            caption="How close the line came to breaking"
          />
          <MetricTile
            label="READINESS WEAR"
            value={'-' + battleSummary.readinessWear}
            tone="danger"
            caption={'Now ' + armyReadiness + '%'}
          />
        </View>
      </GameCard>

      <SectionTitle title="Consequences" trailing="No inventory loss" />
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
          <View style={styles.secondaryActionRow}>
            <View style={styles.secondaryAction}>
              <SecondaryButton
                label="Formation"
                onPress={onOpenFormation}
              />
            </View>
            <View style={styles.secondaryAction}>
              <SecondaryButton
                label="Supply Wagon"
                onPress={onOpenWagon}
              />
            </View>
          </View>
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
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
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
    gap: 9,
    marginTop: 13
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 8
  },
  secondaryAction: {
    flex: 1
  }
});
