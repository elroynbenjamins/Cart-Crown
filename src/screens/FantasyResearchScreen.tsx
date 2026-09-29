import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import {
  getResearchGemFinishCost,
  getResearchRemainingHours
} from '../game/progression';
import type {
  FantasyRecruitTemplate,
  ResearchDefinition
} from '../game/progression';
import { factions } from '../game/factions';
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
import { UnitSprite } from '../ui/gameArt';

function formatHours(hours: number) {
  if (hours <= 0) return 'Ready';
  if (hours < 1) {
    return Math.max(1, Math.ceil(hours * 60)) + ' min';
  }
  const whole = Math.floor(hours);
  const minutes = Math.ceil((hours - whole) * 60);
  return minutes > 0
    ? whole + 'h ' + minutes + 'm'
    : whole + 'h';
}

function formatCost(cost: FantasyRecruitTemplate['cost']) {
  return Object.entries(cost)
    .filter(([, amount]) => (amount ?? 0) > 0)
    .map(([resource, amount]) =>
      String(amount) +
      ' ' +
      resource.charAt(0).toUpperCase() +
      resource.slice(1)
    )
    .join(' · ');
}

export function FantasyResearchScreen({
  onExit
}: {
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNumber,
    units,
    resources,
    gems,
    completedStoryGates,
    researchProgress,
    unlockedFantasyClasses,
    magicFamilyUnlock,
    magicResearchDefinitions,
    fantasyRecruitOptions,
    startFantasyResearch,
    claimFantasyResearch,
    watchFantasyResearchAd,
    finishFantasyResearchWithGems,
    recruitFantasyUnit
  } = useGame();
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(
      () => setNow(Date.now()),
      30_000
    );
    return () => clearInterval(timer);
  }, []);

  const faction = factions[activeFaction];
  const accent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;
  const storyUnlocked = Boolean(
    magicFamilyUnlock &&
    completedStoryGates.includes(
      magicFamilyUnlock.storyGateId
    )
  );
  const firstStoryUnit = magicFamilyUnlock
    ? units.find(
        unit =>
          unit.id ===
          magicFamilyUnlock.firstStoryRewardUnitId
      ) ?? null
    : null;

  const researchStatus = (
    research: ResearchDefinition
  ) => {
    const progress = researchProgress[research.id];
    if (!progress) {
      return {
        progress: null,
        remainingHours: research.durationHours,
        gemCost: research.baseGemFinishCost
      };
    }

    const elapsedHours =
      progress.startedAt === null
        ? 0
        : Math.max(
            0,
            (now - progress.startedAt) /
              (60 * 60 * 1000)
          );
    const remainingHours = getResearchRemainingHours(
      research,
      elapsedHours,
      progress.rewardedAdsWatched
    );

    return {
      progress,
      remainingHours,
      gemCost: getResearchGemFinishCost(
        research,
        remainingHours
      )
    };
  };

  const activeResearchId = useMemo(() => {
    for (const research of magicResearchDefinitions) {
      const status = researchStatus(research);
      if (
        status.progress &&
        !status.progress.completed &&
        status.progress.startedAt !== null &&
        status.remainingHours > 0
      ) {
        return research.id;
      }
    }
    return null;
  }, [
    magicResearchDefinitions,
    now,
    researchProgress
  ]);

  const runResearchAction = (
    research: ResearchDefinition,
    action:
      | 'start'
      | 'claim'
      | 'gems'
  ) => {
    const ok =
      action === 'start'
        ? startFantasyResearch(research.id)
        : action === 'claim'
          ? claimFantasyResearch(research.id)
          : finishFantasyResearchWithGems(
              research.id
            );
    setMessage(
      ok
        ? action === 'start'
          ? research.name + ' started.'
          : research.name + ' completed.'
        : action === 'gems'
          ? 'Not enough Gems to finish this research.'
          : 'This research cannot be completed yet.'
    );
    setNow(Date.now());
  };

  const runResearchAd = async (
    research: ResearchDefinition
  ) => {
    const result = await watchFantasyResearchAd(
      research.id
    );
    setMessage(
      result.status === 'rewarded'
        ? 'Research accelerated.'
        : 'A rewarded ad is not available right now.'
    );
    setNow(Date.now());
  };

  const recruit = (template: FantasyRecruitTemplate) => {
    const ok = recruitFantasyUnit(template.id);
    setMessage(
      ok
        ? template.className + ' recruited to the roster.'
        : 'Requirements or resources are missing for this recruitment.'
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        eyebrow="CHAPTER 4 · AGE OF MAGIC"
        title="Arcane Research"
        body={
          'Magic is a specialist layer, not a replacement for your normal army. Protect casters, use them into favorable formations, and keep conventional squads for warded enemies.'
        }
        accent={accent}
        status={
          <StatusPill
            label={
              storyUnlocked
                ? 'MAGIC UNLOCKED'
                : chapterNumber >= 4
                  ? 'STORY GATE'
                  : 'CHAPTER 4'
            }
            tone={
              storyUnlocked
                ? 'ready'
                : 'neutral'
            }
          />
        }
      >
        <View style={styles.metrics}>
          <MetricTile
            label="GEMS"
            value={gems}
            caption="account-wide"
            tone={gems > 0 ? 'positive' : 'neutral'}
          />
          <MetricTile
            label="RESEARCH"
            value={
              magicResearchDefinitions.filter(
                research =>
                  researchProgress[research.id]
                    ?.completed
              ).length +
              '/' +
              magicResearchDefinitions.length
            }
            caption="magic doctrines"
            tone="info"
          />
        </View>
      </ScreenHero>

      <SectionTitle
        title={magicFamilyUnlock?.buildingName ?? 'Magic institution'}
        trailing={storyUnlocked ? 'Established' : 'Locked'}
      />
      <GameCard
        accent={storyUnlocked ? accent : undefined}
        faction={activeFaction}
        state={storyUnlocked ? 'ready' : 'default'}
      >
        <View style={styles.institutionRow}>
          <View style={styles.copy}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {storyUnlocked
                ? 'The institution is operational'
                : 'Complete the Chapter 4 discovery'}
            </Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              {storyUnlocked && firstStoryUnit
                ? firstStoryUnit.name +
                  ' joined as your first ' +
                  firstStoryUnit.className +
                  '. Research now turns that discovery into repeatable troop branches.'
                : activeFaction === 'human'
                  ? 'Recover the Empty Throne records to reclaim the Arcane Academy.'
                  : activeFaction === 'elf'
                    ? 'Recover the burned ward records to awaken the Circle of Ancients.'
                    : 'Recover the steppe war-camp rites to call the ancestors through the Spirit Lodge.'}
            </Text>
          </View>
          {firstStoryUnit ? (
            <View
              style={[
                styles.sprite,
                { borderColor: accent }
              ]}
            >
              <UnitSprite
                className={firstStoryUnit.className}
                faction={activeFaction}
                size={42}
              />
            </View>
          ) : null}
        </View>
      </GameCard>

      <SectionTitle
        title="Research"
        trailing={
          activeResearchId
            ? '1 active'
            : '1 at a time'
        }
      />
      <View style={styles.list}>
        {magicResearchDefinitions.map(research => {
          const {
            progress,
            remainingHours,
            gemCost
          } = researchStatus(research);
          const completed = Boolean(progress?.completed);
          const started =
            Boolean(progress?.startedAt) && !completed;
          const readyToClaim =
            started && remainingHours <= 0;
          const locked =
            !storyUnlocked ||
            chapterNumber < research.chapterRequired;
          const blockedByOther =
            Boolean(activeResearchId) &&
            activeResearchId !== research.id &&
            !completed;

          return (
            <GameCard
              key={research.id}
              accent={
                completed || started
                  ? accent
                  : undefined
              }
              faction={activeFaction}
              state={
                completed
                  ? 'ready'
                  : started
                    ? 'selected'
                    : 'default'
              }
            >
              <View style={styles.header}>
                <View style={styles.copy}>
                  <Text style={[styles.researchName, { color: theme.colors.text }]}>
                    {research.name}
                  </Text>
                  <Text style={[styles.unlocks, { color: accent }]}>
                    Unlocks {research.unlocksClasses.join(' + ')}
                  </Text>
                </View>
                <StatusPill
                  label={
                    completed
                      ? 'DONE'
                      : readyToClaim
                        ? 'READY'
                        : started
                          ? formatHours(remainingHours)
                          : locked
                            ? 'LOCKED'
                            : 'AVAILABLE'
                  }
                  tone={
                    completed || readyToClaim
                      ? 'ready'
                      : started
                        ? 'current'
                        : 'neutral'
                  }
                />
              </View>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>
                {research.description}
              </Text>

              {started && progress ? (
                <View style={styles.progressRow}>
                  <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
                    Ads {progress.rewardedAdsWatched}/{research.rewardedAdsToComplete}
                  </Text>
                  <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
                    Finish {gemCost} Gems
                  </Text>
                </View>
              ) : null}

              <View style={styles.actionStack}>
                {!progress ? (
                  <PrimaryButton
                    label={
                      blockedByOther
                        ? 'Finish Current Research First'
                        : 'Start · ' +
                          research.durationHours +
                          'h'
                    }
                    disabled={locked || blockedByOther}
                    onPress={() =>
                      runResearchAction(
                        research,
                        'start'
                      )
                    }
                  />
                ) : completed ? (
                  <SecondaryButton
                    label="Research Complete"
                    disabled
                    onPress={() => undefined}
                  />
                ) : readyToClaim ? (
                  <PrimaryButton
                    label="Complete Research"
                    onPress={() =>
                      runResearchAction(
                        research,
                        'claim'
                      )
                    }
                  />
                ) : (
                  <>
                    <PrimaryButton
                      label={
                        'Watch Ad · ' +
                        progress.rewardedAdsWatched +
                        '/' +
                        research.rewardedAdsToComplete
                      }
                      disabled={
                        progress.rewardedAdsWatched >=
                        research.rewardedAdsToComplete
                      }
                      onPress={() =>
                        void runResearchAd(research)
                      }
                    />
                    <SecondaryButton
                      label={
                        'Finish · ' +
                        gemCost +
                        ' Gems'
                      }
                      disabled={gems < gemCost}
                      onPress={() =>
                        runResearchAction(
                          research,
                          'gems'
                        )
                      }
                    />
                  </>
                )}
              </View>
            </GameCard>
          );
        })}
      </View>

      <SectionTitle
        title="Train magic squads"
        trailing={
          unlockedFantasyClasses.length > 0
            ? 'Research unlocked'
            : 'Research required'
        }
      />
      <View style={styles.list}>
        {fantasyRecruitOptions.map(template => {
          const unlocked =
            unlockedFantasyClasses.includes(
              template.className
            );
          const affordable = Object.entries(
            template.cost
          ).every(
            ([resource, amount]) =>
              resources[
                resource as keyof typeof resources
              ] >= (amount ?? 0)
          );

          return (
            <GameCard
              key={template.id}
              accent={unlocked ? accent : undefined}
              faction={activeFaction}
              state={unlocked ? 'ready' : 'default'}
            >
              <View style={styles.recruitRow}>
                <View
                  style={[
                    styles.sprite,
                    { borderColor: accent }
                  ]}
                >
                  <UnitSprite
                    className={template.className}
                    faction={activeFaction}
                    size={42}
                  />
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.researchName, { color: theme.colors.text }]}>
                    {template.className}
                  </Text>
                  <Text style={[styles.unlocks, { color: accent }]}>
                    {template.role.toUpperCase()} · TIER {template.tier}
                  </Text>
                  <Text style={[styles.body, { color: theme.colors.textMuted }]}>
                    HP {template.hp} · ATK {template.attack} · ARM {template.armor} · SPD {template.speed}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cost, { color: theme.colors.textMuted }]}>
                {formatCost(template.cost)}
              </Text>
              <View style={styles.button}>
                <PrimaryButton
                  label={
                    unlocked
                      ? affordable
                        ? 'Train ' + template.className
                        : 'Missing Resources'
                      : 'Research Required'
                  }
                  disabled={!unlocked || !affordable}
                  onPress={() => recruit(template)}
                />
              </View>
            </GameCard>
          );
        })}
      </View>

      {message ? (
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>
          {message}
        </Text>
      ) : null}

      <SecondaryButton
        label="Return to Army"
        onPress={onExit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 34,
    gap: 12
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  list: { gap: 10 },
  institutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  recruitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  copy: { flex: 1 },
  sprite: {
    width: 54,
    height: 58,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900'
  },
  researchName: {
    fontSize: 16,
    fontWeight: '900'
  },
  unlocks: {
    marginTop: 2,
    fontSize: 9.5,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  body: {
    marginTop: 6,
    fontSize: 11.5,
    lineHeight: 17
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10
  },
  progressText: {
    fontSize: 10,
    fontWeight: '800'
  },
  actionStack: {
    gap: 8,
    marginTop: 12
  },
  cost: {
    marginTop: 8,
    fontSize: 10.5,
    fontWeight: '800'
  },
  button: {
    marginTop: 10
  },
  message: {
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '800'
  }
});
