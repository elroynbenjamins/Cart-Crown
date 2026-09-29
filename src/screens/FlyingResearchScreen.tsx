import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { getResearchGemFinishCost, getResearchRemainingHours } from '../game/progression';
import type { FantasyRecruitTemplate } from '../game/progression';
import type { TutorialFocusTarget } from '../game/tutorial';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, MetricTile, PrimaryButton, ScreenHero, SecondaryButton, SectionTitle, StatusPill } from '../ui/components';
import { UnitSprite } from '../ui/gameArt';
import { UnitBadges } from '../ui/SemanticUI';
import { semanticColor } from '../ui/semanticColors';
import { ResearchGemCost, ResearchRecruitCard, ResearchStateChip, ResearchUnlocks } from '../ui/ResearchUI';
import { TutorialFocus } from '../ui/TutorialFocus';

export function FlyingResearchScreen({ onExit, tutorialFocus, onTutorialFocusComplete }: {
  onExit: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction, chapterNumber, units, resources, gems, completedStoryGates,
    researchProgress, unlockedFantasyClasses, flyingFamilyUnlock, flyingResearchDefinitions,
    flyingRecruitOptions, startFantasyResearch, claimFantasyResearch, watchFantasyResearchAd,
    finishFantasyResearchWithGems, recruitFantasyUnit
  } = useGame();
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const accent = semanticColor(theme, 'cyan');
  const storyUnlocked = Boolean(flyingFamilyUnlock && completedStoryGates.includes(flyingFamilyUnlock.storyGateId));
  const firstStoryUnit = flyingFamilyUnlock ? units.find(unit => unit.id === flyingFamilyUnlock.firstStoryRewardUnitId) ?? null : null;
  const research = flyingResearchDefinitions[0] ?? null;
  const progress = research ? researchProgress[research.id] : null;
  const elapsedHours = progress?.startedAt ? Math.max(0, (now - progress.startedAt) / (60 * 60 * 1000)) : 0;
  const remainingHours = research && progress
    ? getResearchRemainingHours(research, elapsedHours, progress.rewardedAdsWatched)
    : research?.durationHours ?? 0;
  const gemCost = research ? getResearchGemFinishCost(research, remainingHours) : 0;
  const readyToClaim = Boolean(progress?.startedAt) && !progress?.completed && remainingHours <= 0;
  const tutorialResearchFocused = tutorialFocus?.kind === 'research-start' && tutorialFocus.family === 'flying' && Boolean(research) && !progress && storyUnlocked;

  const startResearch = () => {
    if (!research) return;
    const ok = startFantasyResearch(research.id);
    setMessage(ok ? research.name + ' started.' : 'Finish any active fantasy research and meet the Chapter 5 story gate first.');
    setNow(Date.now());
    if (ok && tutorialResearchFocused) onTutorialFocusComplete?.();
  };
  const watchAd = async () => {
    if (!research) return;
    const result = await watchFantasyResearchAd(research.id);
    setMessage(result.status === 'rewarded' ? 'Aerial research accelerated.' : 'A rewarded ad is not available right now.');
    setNow(Date.now());
  };
  const finishWithGems = () => {
    if (!research) return;
    const ok = finishFantasyResearchWithGems(research.id);
    setMessage(ok ? research.name + ' completed.' : 'Not enough Gems to finish this research.');
    setNow(Date.now());
  };
  const claim = () => {
    if (!research) return;
    const ok = claimFantasyResearch(research.id);
    setMessage(ok ? research.name + ' completed.' : 'Research is not complete yet.');
    setNow(Date.now());
  };
  const recruit = (template: FantasyRecruitTemplate) => {
    const ok = recruitFantasyUnit(template.id);
    setMessage(ok ? template.className + ' recruited to the roster.' : 'Requirements or resources are missing for this recruitment.');
    return ok;
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHero
        eyebrow="CHAPTER 5 · THE SKY OPENS"
        title="Aerial Training"
        body="Flying squads can bypass ground screens and reach protected backlines, but concentrated missile fire is a deliberate anti-air counter. They should widen your options, not become an automatic best army."
        accent={accent}
        status={<StatusPill label={storyUnlocked ? 'FLYING UNLOCKED' : chapterNumber >= 5 ? 'STORY GATE' : 'CHAPTER 5'} tone={storyUnlocked ? 'ready' : 'neutral'} />}
      >
        <View style={styles.metrics}>
          <MetricTile label="GEMS" value={gems} caption="account-wide" tone="gold" />
          <MetricTile label="AIR UNITS" value={units.filter(unit => unit.battleTags?.includes('flying')).length} caption="owned squads" tone="info" />
        </View>
      </ScreenHero>

      <SectionTitle title={flyingFamilyUnlock?.buildingName ?? 'Aerial institution'} trailing={storyUnlocked ? 'Established' : 'Locked'} />
      <GameCard accent={storyUnlocked ? accent : undefined} faction={activeFaction} state={storyUnlocked ? 'ready' : 'default'}>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{storyUnlocked ? 'The skies are open' : 'Complete the Chapter 5 discovery'}</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              {storyUnlocked && firstStoryUnit
                ? firstStoryUnit.name + ' joined as your first ' + firstStoryUnit.className + '. Complete handling research to train additional aerial branches.'
                : activeFaction === 'human'
                  ? 'Recover the Chapter 5 records and establish the Griffin Aerie.'
                  : activeFaction === 'elf'
                    ? 'Restore the Chapter 5 route and establish the Eagle Sanctuary.'
                    : 'Recover the Chapter 5 war-route and establish the Wyvern Roost.'}
            </Text>
          </View>
          {firstStoryUnit ? (
            <View style={[styles.sprite, { borderColor: accent }]}>
              <UnitSprite className={firstStoryUnit.className} faction={activeFaction} size={44} />
            </View>
          ) : null}
        </View>
        {firstStoryUnit ? (
          <View style={styles.badges}>
            <UnitBadges role={firstStoryUnit.role} tier={firstStoryUnit.tier} battleTags={firstStoryUnit.battleTags} compact />
          </View>
        ) : null}
      </GameCard>

      <SectionTitle title="Handling research" trailing="Max 24h" />
      {research ? (
        <TutorialFocus active={tutorialResearchFocused} label={tutorialResearchFocused ? tutorialFocus.label : undefined}>
          <GameCard accent={progress ? accent : undefined} faction={activeFaction} state={progress?.completed ? 'ready' : progress ? 'selected' : 'default'}>
            <Text style={[styles.title, { color: accent }]}>{research.name}</Text>
            <View style={styles.badges}>
              <ResearchStateChip
                state={progress?.completed ? 'complete' : readyToClaim ? 'claimable' : progress ? 'active' : storyUnlocked ? 'available' : 'locked'}
                remainingHours={remainingHours}
              />
            </View>
            <ResearchUnlocks classes={research.unlocksClasses} templates={flyingRecruitOptions} />
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{research.description}</Text>
            {progress && !progress.completed && !readyToClaim ? (
              <View style={styles.progressRow}>
                <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>Ads {progress.rewardedAdsWatched}/{research.rewardedAdsToComplete}</Text>
                <ResearchGemCost cost={gemCost} balance={gems} />
              </View>
            ) : null}
            <View style={styles.actions}>
              {!progress ? (
                <PrimaryButton label={'Start · ' + research.durationHours + 'h'} disabled={!storyUnlocked} onPress={startResearch} />
              ) : progress.completed ? (
                <SecondaryButton label="Research Complete" disabled onPress={() => undefined} />
              ) : readyToClaim ? (
                <PrimaryButton label="Complete Research" onPress={claim} />
              ) : (
                <>
                  <PrimaryButton
                    label={'Watch Ad · ' + progress.rewardedAdsWatched + '/' + research.rewardedAdsToComplete}
                    disabled={progress.rewardedAdsWatched >= research.rewardedAdsToComplete}
                    onPress={() => void watchAd()}
                  />
                  <SecondaryButton label={'Finish · ' + gemCost + ' Gems'} disabled={gems < gemCost} onPress={finishWithGems} />
                </>
              )}
            </View>
          </GameCard>
        </TutorialFocus>
      ) : null}

      <SectionTitle
        title="Train aerial squads"
        trailing={research?.unlocksClasses.every(className => unlockedFantasyClasses.includes(className)) ? 'Unlocked' : 'Research required'}
      />
      <View style={styles.list}>
        {flyingRecruitOptions.map(template => {
          const unlocked = unlockedFantasyClasses.includes(template.className);
          const affordable = Object.entries(template.cost).every(([resource, amount]) => resources[resource as keyof typeof resources] >= (amount ?? 0));
          const tutorialTrainingFocused = tutorialFocus?.kind === 'research-train' && tutorialFocus.family === 'flying' && unlocked;
          return (
            <TutorialFocus key={template.id} active={tutorialTrainingFocused} label={tutorialTrainingFocused ? tutorialFocus.label : undefined}>
              <ResearchRecruitCard template={template} unlocked={unlocked} affordable={affordable} wallet={resources} onTrain={() => {
                const ok = recruit(template);
                if (ok && tutorialTrainingFocused) onTutorialFocusComplete?.();
              }} />
            </TutorialFocus>
          );
        })}
      </View>
      {message ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.colors.text }]}>{message}</Text> : null}
      <SecondaryButton label="Return to Army" onPress={onExit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 34, gap: 12 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  list: { gap: 10 },
  copy: { flex: 1, minWidth: 0 },
  sprite: { width: 56, height: 60, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, lineHeight: 23, fontWeight: '900' },
  body: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  badges: { marginTop: 8 },
  progressRow: { gap: 7, marginTop: 10 },
  progressText: { fontSize: 12, lineHeight: 18, fontWeight: '800' },
  actions: { gap: 8, marginTop: 12 },
  message: { textAlign: 'center', fontSize: 13, lineHeight: 19, fontWeight: '800' }
});
