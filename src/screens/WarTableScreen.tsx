import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  getEncounter,
  getEnemyFormationTactic
} from '../game/encounters';
import type { EncounterId } from '../game/encounters';
import {
  getFormationShape
} from '../game/formation';
import { useGame } from '../game/GameProvider';
import {
  getWarTableCategoryLabel,
  getWarTablePostedContracts,
  getWarTableTierLabel,
  isWarTableBoardCleared
} from '../game/warTable';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  PrimaryButton,
  ResourceAmountRow,
  ScreenHero,
  SecondaryButton,
  SectionTitle,
  StatusPill
} from '../ui/components';

export function WarTableScreen({
  onStartBattle
}: {
  onStartBattle: (
    encounterId: EncounterId
  ) => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNumber,
    warTableCycle,
    warTableBoardChapter,
    warTableCompletedContractIds,
    warTableBonusContractIds,
    warTableContractsCompleted,
    warTableBonusObjectivesCompleted,
    refreshWarTableBoard
  } = useGame();

  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const contracts =
    getWarTablePostedContracts({
      cycle: warTableCycle,
      boardChapter: warTableBoardChapter
    });

  const boardCleared =
    isWarTableBoardCleared({
      postedContracts: contracts,
      completedContractIds:
        warTableCompletedContractIds
    });

  const completedOnBoard =
    contracts.filter(contract =>
      warTableCompletedContractIds.includes(
        contract.id
      )
    ).length;

  const tierUpgradePending =
    Math.min(chapterNumber, 6) >
    warTableBoardChapter;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        eyebrow="QUICK BATTLE MODE"
        title="War Table"
        body="Scouts post a small rotating set of short contracts. Each fight tests a different enemy formation, and every contract has an optional performance objective for a modest bonus."
        accent={factionAccent}
        status={
          <StatusPill
            label={
              'BOARD ' +
              (warTableCycle + 1)
            }
            tone="available"
          />
        }
      />

      <GameCard
        accent={factionAccent}
        faction={activeFaction}
      >
        <View style={styles.boardHeader}>
          <View style={styles.headerCopy}>
            <Text
              style={[
                styles.noticeTitle,
                { color: theme.colors.text }
              ]}
            >
              Rotating scout contracts
            </Text>
            <Text
              style={[
                styles.noticeBody,
                {
                  color:
                    theme.colors.textMuted
                }
              ]}
            >
              Clear the posted board to rotate in
              a new set. Standard contracts arrive
              first; Veteran and Elite slots join
              later as the campaign advances.
            </Text>
          </View>
          <StatusPill
            label={
              completedOnBoard +
              '/' +
              contracts.length +
              ' CLEARED'
            }
            tone={
              boardCleared
                ? 'done'
                : 'current'
            }
          />
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text
              style={[
                styles.statLabel,
                {
                  color:
                    theme.colors.textMuted
                }
              ]}
            >
              LIFETIME CONTRACTS
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: theme.colors.text }
              ]}
            >
              {warTableContractsCompleted}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text
              style={[
                styles.statLabel,
                {
                  color:
                    theme.colors.textMuted
                }
              ]}
            >
              BONUS OBJECTIVES
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: theme.colors.gold }
              ]}
            >
              {
                warTableBonusObjectivesCompleted
              }
            </Text>
          </View>
        </View>

        {tierUpgradePending ? (
          <View
            style={[
              styles.unlockNotice,
              {
                backgroundColor:
                  theme.colors.surface2,
                borderColor:
                  theme.colors.border
              }
            ]}
          >
            <Text
              style={[
                styles.unlockTitle,
                { color: theme.colors.gold }
              ]}
            >
              NEW TIER AVAILABLE
            </Text>
            <Text
              style={[
                styles.unlockBody,
                {
                  color:
                    theme.colors.textMuted
                }
              ]}
            >
              Campaign progress has unlocked
              stronger contracts or a new fantasy
              threat family. Finish this board and
              refresh it to expand the rotation.
            </Text>
          </View>
        ) : null}
      </GameCard>

      <SectionTitle
        title="Posted Contracts"
        trailing={
          contracts.length + ' active'
        }
      />

      {contracts.map(contract => {
        const encounter =
          getEncounter(contract.encounterId);
        const tactic =
          getEnemyFormationTactic(
            contract.encounterId
          );
        const shape =
          getFormationShape(
            tactic.formationShapeId
          );
        const completed =
          warTableCompletedContractIds.includes(
            contract.id
          );
        const bonusComplete =
          warTableBonusContractIds.includes(
            contract.id
          );
        const tierLabel =
          getWarTableTierLabel(
            contract.tier
          );
        const categoryLabel =
          getWarTableCategoryLabel(
            contract.category
          );

        return (
          <GameCard
            key={contract.id}
            faction={activeFaction}
            state={
              completed
                ? 'ready'
                : contract.tier === 'elite'
                  ? 'selected'
                  : 'default'
            }
            accent={
              contract.tier === 'elite'
                ? theme.colors.gold
                : completed
                  ? theme.colors.primary
                  : factionAccent
            }
          >
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text
                  style={[
                    styles.category,
                    {
                      color:
                        contract.tier ===
                        'elite'
                          ? theme.colors.gold
                          : factionAccent
                    }
                  ]}
                >
                  {categoryLabel.toUpperCase()}
                </Text>
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
                    {
                      color:
                        theme.colors.textMuted
                    }
                  ]}
                >
                  {encounter.subtitle}
                </Text>
              </View>
              <StatusPill
                label={
                  completed
                    ? 'CLEARED'
                    : tierLabel
                }
                tone={
                  completed
                    ? 'done'
                    : contract.tier ===
                        'elite'
                      ? 'elite'
                      : contract.tier ===
                          'veteran'
                        ? 'current'
                        : 'neutral'
                }
              />
            </View>

            {encounter.fantasyThreat ? (
              <View style={styles.threatRow}>
                <StatusPill
                  label={
                    encounter.fantasyThreat.toUpperCase() +
                    ' THREAT'
                  }
                  tone="elite"
                />
              </View>
            ) : null}

            <View
              style={[
                styles.intel,
                {
                  backgroundColor:
                    theme.colors.surface2,
                  borderColor:
                    theme.colors.border
                }
              ]}
            >
              <Text
                style={[
                  styles.intelLabel,
                  { color: factionAccent }
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
                  {
                    color:
                      theme.colors.textMuted
                  }
                ]}
              >
                {contract.tacticalNote}
              </Text>
            </View>

            <View style={styles.rewardBlock}>
              <Text
                style={[
                  styles.rewardTitle,
                  { color: theme.colors.text }
                ]}
              >
                Base reward
              </Text>
              <Text
                style={[
                  styles.reward,
                  { color: theme.colors.gold }
                ]}
              >
                {contract.rewardLabel}
              </Text>
            </View>

            <View
              style={[
                styles.bonusBox,
                {
                  borderColor:
                    bonusComplete
                      ? theme.colors.primary
                      : theme.colors.border,
                  backgroundColor:
                    theme.colors.surface2
                }
              ]}
            >
              <View style={styles.bonusHeader}>
                <View style={styles.headerCopy}>
                  <Text
                    style={[
                      styles.bonusEyebrow,
                      {
                        color:
                          bonusComplete
                            ? theme.colors.primary
                            : theme.colors.gold
                      }
                    ]}
                  >
                    BONUS OBJECTIVE
                  </Text>
                  <Text
                    style={[
                      styles.bonusText,
                      {
                        color:
                          theme.colors.text
                      }
                    ]}
                  >
                    {
                      contract
                        .bonusObjective
                        .label
                    }
                  </Text>
                </View>
                {completed ? (
                  <StatusPill
                    label={
                      bonusComplete
                        ? 'ACHIEVED'
                        : 'MISSED'
                    }
                    tone={
                      bonusComplete
                        ? 'done'
                        : 'neutral'
                    }
                  />
                ) : null}
              </View>
              <View style={styles.bonusReward}>
                <ResourceAmountRow
                  prefix="+"
                  values={
                    contract.bonusReward
                  }
                />
              </View>
            </View>

            <View style={styles.button}>
              <PrimaryButton
                label={
                  completed
                    ? 'Contract Cleared'
                    : 'Prepare for Contract'
                }
                disabled={completed}
                onPress={() =>
                  onStartBattle(
                    contract.encounterId
                  )
                }
              />
            </View>
          </GameCard>
        );
      })}

      {boardCleared ? (
        <GameCard
          faction={activeFaction}
          accent={theme.colors.gold}
          state="ready"
        >
          <View style={styles.refreshHeader}>
            <View style={styles.headerCopy}>
              <Text
                style={[
                  styles.refreshTitle,
                  { color: theme.colors.text }
                ]}
              >
                Board cleared
              </Text>
              <Text
                style={[
                  styles.noticeBody,
                  {
                    color:
                      theme.colors.textMuted
                  }
                ]}
              >
                Rotate the War Table to post a
                fresh set of contracts. New
                campaign tiers are picked up when
                the board refreshes.
              </Text>
            </View>
            <StatusPill
              label="READY"
              tone="done"
            />
          </View>
          <View style={styles.button}>
            <SecondaryButton
              label="Refresh War Table"
              onPress={refreshWarTableBoard}
            />
          </View>
        </GameCard>
      ) : null}

      <GameCard
        faction={activeFaction}
        ornament={false}
      >
        <Text
          style={[
            styles.footerTitle,
            { color: theme.colors.text }
          ]}
        >
          Optional by design
        </Text>
        <Text
          style={[
            styles.noticeBody,
            { color: theme.colors.textMuted }
          ]}
        >
          Contracts do not advance campaign nodes.
          Base rewards stay below major story
          payouts, and bonus objectives reward
          cleaner play rather than mandatory
          grinding.
        </Text>
      </GameCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12
  },
  boardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  headerCopy: {
    flex: 1
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '900'
  },
  noticeBody: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  stat: {
    flex: 1
  },
  statLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  statValue: {
    fontSize: 19,
    fontWeight: '900',
    marginTop: 2
  },
  unlockNotice: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 12
  },
  unlockTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  unlockBody: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 4
  },
  category: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  name: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2
  },
  subtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16
  },
  threatRow: {
    marginTop: 8,
    alignItems: 'flex-start'
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
  rewardBlock: {
    marginTop: 10
  },
  rewardTitle: {
    fontSize: 10,
    fontWeight: '900'
  },
  reward: {
    marginTop: 3,
    fontSize: 10.5,
    fontWeight: '800'
  },
  bonusBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 11
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9
  },
  bonusEyebrow: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.7
  },
  bonusText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 3
  },
  bonusReward: {
    marginTop: 8
  },
  button: {
    marginTop: 12
  },
  refreshHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  refreshTitle: {
    fontSize: 17,
    fontWeight: '900'
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '900'
  }
});
