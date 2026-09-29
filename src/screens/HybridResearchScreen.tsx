import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import {
  getResearchGemFinishCost,
  getResearchRemainingHours
} from '../game/progression';
import type { FantasyRecruitTemplate } from '../game/progression';
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
import { TutorialFocus } from '../ui/TutorialFocus';
import type { TutorialFocusTarget } from '../game/tutorial';

function formatHours(hours: number) {
  if (hours <= 0) return 'Ready';
  if (hours < 1) return Math.max(1, Math.ceil(hours * 60)) + ' min';
  const whole = Math.floor(hours);
  const minutes = Math.ceil((hours - whole) * 60);
  return minutes > 0 ? whole + 'h ' + minutes + 'm' : whole + 'h';
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

export function HybridResearchScreen({
  onExit,
  tutorialFocus,
  onTutorialFocusComplete
}: {
  onExit: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    units,
    resources,
    gems,
    fantasyProgressionChapter,
    completedStoryGates,
    researchProgress,
    unlockedFantasyClasses,
    hybridFamilyUnlock,
    hybridResearchDefinitions,
    hybridRecruitOptions,
    hybridPrerequisitesMet,
    startFantasyResearch,
    claimFantasyResearch,
    watchFantasyResearchAd,
    finishFantasyResearchWithGems,
    recruitFantasyUnit
  } = useGame();

  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
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
    hybridFamilyUnlock &&
    completedStoryGates.includes(hybridFamilyUnlock.storyGateId)
  );
  const firstStoryUnit = hybridFamilyUnlock
    ? units.find(unit => unit.id === hybridFamilyUnlock.firstStoryRewardUnitId) ?? null
    : null;
  const research = hybridResearchDefinitions[0] ?? null;
  const progress = research ? researchProgress[research.id] : null;
  const elapsedHours =
    progress?.startedAt
      ? Math.max(0, (now - progress.startedAt) / (60 * 60 * 1000))
      : 0;
  const remainingHours =
    research && progress
      ? getResearchRemainingHours(
          research,
          elapsedHours,
          progress.rewardedAdsWatched
        )
      : research?.durationHours ?? 0;
  const gemCost = research
    ? getResearchGemFinishCost(research, remainingHours)
    : 0;
  const readyToClaim =
    Boolean(progress?.startedAt) &&
    !progress?.completed &&
    remainingHours <= 0;

  const startResearch = () => {
    if (!research) return false;
    const ok = startFantasyResearch(research.id);
    setMessage(
      ok
        ? research.name + ' started.'
        : !hybridPrerequisitesMet
          ? 'Complete this faction’s Magic and Flying research first.'
          : 'Finish any active fantasy research before starting the legendary doctrine.'
    );
    setNow(Date.now());
    return ok;
  };

  const watchAd = async () => {
    if (!research) return;
    const result = await watchFantasyResearchAd(research.id);
    setMessage(
      result.status === 'rewarded'
        ? 'Legendary doctrine advanced.'
        : 'A rewarded ad is not available right now.'
    );
    setNow(Date.now());
  };

  const finishWithGems = () => {
    if (!research) return;
    const ok = finishFantasyResearchWithGems(research.id);
    setMessage(
      ok
        ? research.name + ' completed.'
        : 'Not enough Gems to finish this doctrine.'
    );
    setNow(Date.now());
  };

  const claim = () => {
    if (!research) return;
    const ok = claimFantasyResearch(research.id);
    setMessage(
      ok
        ? research.name + ' completed.'
        : 'Research is not complete yet.'
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
    return ok;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        eyebrow="CHAPTER 8 · LEGENDARY WARFARE"
        title="Legendary Orders"
        body="Legendary hybrids combine Magic and Flying strengths, but they still consume 2 deployment capacity and retain real counters. They are late-game specialists, not an automatic replacement for the rest of your army."
        accent={accent}
        status={
          <StatusPill
            label={
              storyUnlocked
                ? 'LEGENDARY UNLOCKED'
                : fantasyProgressionChapter >= 8
                  ? 'LEGENDARY GATE'
                  : 'COMPLETE THREE SEALS'
            }
            tone={storyUnlocked ? 'ready' : 'neutral'}
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
            label="PREREQS"
            value={hybridPrerequisitesMet ? 'READY' : '2 LINES'}
            caption="Magic + Flying"
            tone={hybridPrerequisitesMet ? 'positive' : 'neutral'}
          />
          <MetricTile
            label="CAPACITY"
            value="2"
            caption="per hybrid"
            tone="neutral"
          />
        </View>
      </ScreenHero>

      <SectionTitle
        title={hybridFamilyUnlock?.buildingName ?? 'Legendary institution'}
        trailing={storyUnlocked ? 'Established' : 'Locked'}
      />
      <GameCard
        accent={storyUnlocked ? accent : undefined}
        faction={activeFaction}
        state={storyUnlocked ? 'ready' : 'default'}
      >
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {storyUnlocked
                ? 'A legendary order answers the kingdom'
                : 'Complete the Three Seals meta campaign'}
            </Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              {storyUnlocked && firstStoryUnit
                ? firstStoryUnit.name +
                  ' joined as your first ' +
                  firstStoryUnit.className +
                  '. Complete the legendary doctrine to train more.'
                : 'Legendary orders only open after the full faction campaign arc converges. They then require both earlier Magic and Flying research before repeatable training begins.'}
            </Text>
          </View>
          {firstStoryUnit ? (
            <View style={[styles.sprite, { borderColor: accent }]}>
              <UnitSprite
                className={firstStoryUnit.className}
                faction={activeFaction}
                size={50}
              />
            </View>
          ) : null}
        </View>
      </GameCard>

      <SectionTitle title="Legendary doctrine" trailing="Max 24h" />
      {research ? (
        <TutorialFocus
          active={
            tutorialFocus?.kind === 'research-start' &&
            tutorialFocus.family === 'hybrid' &&
            !progress &&
            storyUnlocked &&
            hybridPrerequisitesMet
          }
          label={
            tutorialFocus?.kind === 'research-start' &&
            tutorialFocus.family === 'hybrid' &&
            !progress &&
            storyUnlocked &&
            hybridPrerequisitesMet
              ? tutorialFocus.label
              : undefined
          }
        >
        <GameCard
          accent={progress ? accent : undefined}
          faction={activeFaction}
          state={progress?.completed ? 'ready' : progress ? 'selected' : 'default'}
        >
          <View style={styles.header}>
            <View style={styles.copy}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {research.name}
              </Text>
              <Text style={[styles.unlocks, { color: accent }]}>
                Unlocks {research.unlocksClasses.join(' + ')}
              </Text>
            </View>
            <StatusPill
              label={
                progress?.completed
                  ? 'DONE'
                  : readyToClaim
                    ? 'READY'
                    : progress
                      ? formatHours(remainingHours)
                      : storyUnlocked && hybridPrerequisitesMet
                        ? 'AVAILABLE'
                        : 'LOCKED'
              }
              tone={
                progress?.completed || readyToClaim
                  ? 'ready'
                  : progress
                    ? 'current'
                    : 'neutral'
              }
            />
          </View>

          <Text style={[styles.body, { color: theme.colors.textMuted }]}>
            {research.description}
          </Text>

          {!hybridPrerequisitesMet ? (
            <Text style={[styles.warning, { color: theme.colors.danger }]}>
              Complete all Chapter 4 Magic and Chapter 5 Flying research for this faction first.
            </Text>
          ) : null}

          {progress && !progress.completed ? (
            <View style={styles.progressRow}>
              <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
                Ads {progress.rewardedAdsWatched}/{research.rewardedAdsToComplete}
              </Text>
              <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
                Finish {gemCost} Gems
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {!progress ? (
              <PrimaryButton
                label={'Start · ' + research.durationHours + 'h'}
                disabled={!storyUnlocked || !hybridPrerequisitesMet}
                onPress={() => {
                  const ok = startResearch();
                  if (
                    ok &&
                    tutorialFocus?.kind === 'research-start' &&
                    tutorialFocus.family === 'hybrid'
                  ) {
                    onTutorialFocusComplete?.();
                  }
                }}
              />
            ) : progress.completed ? (
              <SecondaryButton
                label="Research Complete"
                disabled
                onPress={() => undefined}
              />
            ) : readyToClaim ? (
              <PrimaryButton label="Complete Research" onPress={claim} />
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
                    progress.rewardedAdsWatched >= research.rewardedAdsToComplete
                  }
                  onPress={() => void watchAd()}
                />
                <SecondaryButton
                  label={'Finish · ' + gemCost + ' Gems'}
                  disabled={gems < gemCost}
                  onPress={finishWithGems}
                />
              </>
            )}
          </View>
        </GameCard>
        </TutorialFocus>
      ) : null}

      <SectionTitle
        title="Train legendary hybrids"
        trailing={
          research?.unlocksClasses.every(className =>
            unlockedFantasyClasses.includes(className)
          )
            ? 'Unlocked'
            : 'Research required'
        }
      />
      <View style={styles.list}>
        {hybridRecruitOptions.map(template => {
          const unlocked = unlockedFantasyClasses.includes(template.className);
          const affordable = Object.entries(template.cost).every(
            ([resource, amount]) =>
              resources[resource as keyof typeof resources] >= (amount ?? 0)
          );
          const tutorialTrainingFocused =
            tutorialFocus?.kind === 'research-train' &&
            tutorialFocus.family === 'hybrid' &&
            unlocked;

          return (
            <TutorialFocus
              key={template.id}
              active={tutorialTrainingFocused}
              label={
                tutorialTrainingFocused
                  ? tutorialFocus.label
                  : undefined
              }
            >
            <GameCard
              accent={unlocked ? accent : undefined}
              faction={activeFaction}
              state={unlocked ? 'ready' : 'default'}
            >
              <View style={styles.row}>
                <View style={[styles.sprite, { borderColor: accent }]}>
                  <UnitSprite
                    className={template.className}
                    faction={activeFaction}
                    size={50}
                  />
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.title, { color: theme.colors.text }]}>
                    {template.className}
                  </Text>
                  <Text style={[styles.unlocks, { color: accent }]}>
                    {template.role.toUpperCase()} · MAGIC + FLYING · TIER {template.tier} · 2 CAP
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
                  onPress={() => {
                    const ok = recruit(template);
                    if (ok && tutorialTrainingFocused) {
                      onTutorialFocusComplete?.();
                    }
                  }}
                />
              </View>
            </GameCard>
            </TutorialFocus>
          );
        })}
      </View>

      {message ? (
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>
          {message}
        </Text>
      ) : null}

      <SecondaryButton label="Return to Army" onPress={onExit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 34, gap: 12 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  copy: { flex: 1 },
  sprite: {
    width: 64,
    height: 66,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { fontSize: 16, fontWeight: '900' },
  unlocks: {
    fontSize: 9.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 2
  },
  body: { fontSize: 11.5, lineHeight: 17, marginTop: 6 },
  warning: { fontSize: 10.5, lineHeight: 15, fontWeight: '900', marginTop: 10 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10
  },
  progressText: { fontSize: 10, fontWeight: '800' },
  actions: { gap: 8, marginTop: 12 },
  cost: { fontSize: 10.5, fontWeight: '800', marginTop: 8 },
  button: { marginTop: 10 },
  message: { textAlign: 'center', fontSize: 10.5, fontWeight: '800' }
});
