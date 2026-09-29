import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { getResearchGemFinishCost, getResearchRemainingHours } from '../game/progression';
import type { FantasyRecruitTemplate, ResearchDefinition } from '../game/progression';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, MetricTile, PrimaryButton, ScreenHero, SecondaryButton, SectionTitle, StatusPill } from '../ui/components';
import { UnitSprite } from '../ui/gameArt';
import { UnitBadges } from '../ui/SemanticUI';
import { semanticColor } from '../ui/semanticColors';
import { ResearchGemCost, ResearchRecruitCard, ResearchStateChip, ResearchUnlocks } from '../ui/ResearchUI';

export function FantasyResearchScreen({ onExit }: { onExit: () => void }) {
  const { theme } = useGameTheme();
  const {
    activeFaction, chapterNumber, units, resources, gems, completedStoryGates,
    researchProgress, unlockedFantasyClasses, magicFamilyUnlock, magicResearchDefinitions,
    fantasyRecruitOptions, startFantasyResearch, claimFantasyResearch, watchFantasyResearchAd,
    finishFantasyResearchWithGems, recruitFantasyUnit
  } = useGame();
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const accent = semanticColor(theme, 'violet');
  const storyUnlocked = Boolean(magicFamilyUnlock && completedStoryGates.includes(magicFamilyUnlock.storyGateId));
  const firstStoryUnit = magicFamilyUnlock
    ? units.find(unit => unit.id === magicFamilyUnlock.firstStoryRewardUnitId) ?? null
    : null;

  const researchStatus = (research: ResearchDefinition) => {
    const progress = researchProgress[research.id];
    if (!progress) return { progress: null, remainingHours: research.durationHours, gemCost: research.baseGemFinishCost };
    const elapsedHours = progress.startedAt === null
      ? 0
      : Math.max(0, (now - progress.startedAt) / (60 * 60 * 1000));
    const remainingHours = getResearchRemainingHours(research, elapsedHours, progress.rewardedAdsWatched);
    return { progress, remainingHours, gemCost: getResearchGemFinishCost(research, remainingHours) };
  };

  const activeResearchId = useMemo(() => {
    for (const research of magicResearchDefinitions) {
      const status = researchStatus(research);
      if (status.progress && !status.progress.completed && status.progress.startedAt !== null && status.remainingHours > 0) return research.id;
    }
    return null;
  }, [magicResearchDefinitions, now, researchProgress]);

  const runResearchAction = (research: ResearchDefinition, action: 'start' | 'claim' | 'gems') => {
    const ok = action === 'start' ? startFantasyResearch(research.id)
      : action === 'claim' ? claimFantasyResearch(research.id)
        : finishFantasyResearchWithGems(research.id);
    setMessage(ok
      ? action === 'start' ? research.name + ' started.' : research.name + ' completed.'
      : action === 'gems' ? 'Not enough Gems to finish this research.' : 'This research cannot be completed yet.');
    setNow(Date.now());
  };

  const runResearchAd = async (research: ResearchDefinition) => {
    const result = await watchFantasyResearchAd(research.id);
    setMessage(result.status === 'rewarded' ? 'Research accelerated.' : 'A rewarded ad is not available right now.');
    setNow(Date.now());
  };

  const recruit = (template: FantasyRecruitTemplate) => {
    const ok = recruitFantasyUnit(template.id);
    setMessage(ok ? template.className + ' recruited to the roster.' : 'Requirements or resources are missing for this recruitment.');
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHero
        eyebrow="CHAPTER 4 · AGE OF MAGIC"
        title="Arcane Research"
        body="Magic is a specialist layer, not a replacement for your normal army. Protect casters, use them into favorable formations, and keep conventional squads for warded enemies."
        accent={accent}
        status={<StatusPill label={storyUnlocked ? 'MAGIC UNLOCKED' : chapterNumber >= 4 ? 'STORY GATE' : 'CHAPTER 4'} tone={storyUnlocked ? 'ready' : 'neutral'} />}
      >
        <View style={styles.metrics}>
          <MetricTile label="GEMS" value={gems} caption="account-wide" tone="gold" />
          <MetricTile
            label="RESEARCH"
            value={magicResearchDefinitions.filter(research => researchProgress[research.id]?.completed).length + '/' + magicResearchDefinitions.length}
            caption="magic doctrines"
            tone="info"
          />
        </View>
      </ScreenHero>

      <SectionTitle title={magicFamilyUnlock?.buildingName ?? 'Magic institution'} trailing={storyUnlocked ? 'Established' : 'Locked'} />
      <GameCard accent={storyUnlocked ? accent : undefined} faction={activeFaction} state={storyUnlocked ? 'ready' : 'default'}>
        <View style={styles.institutionRow}>
          <View style={styles.copy}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {storyUnlocked ? 'The institution is operational' : 'Complete the Chapter 4 discovery'}
            </Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              {storyUnlocked && firstStoryUnit
                ? firstStoryUnit.name + ' joined as your first ' + firstStoryUnit.className + '. Research now turns that discovery into repeatable troop branches.'
                : activeFaction === 'human'
                  ? 'Recover the Empty Throne records to reclaim the Arcane Academy.'
                  : activeFaction === 'elf'
                    ? 'Recover the burned ward records to awaken the Circle of Ancients.'
                    : 'Recover the steppe war-camp rites to call the ancestors through the Spirit Lodge.'}
            </Text>
          </View>
          {firstStoryUnit ? (
            <View style={[styles.sprite, { borderColor: accent }]}>
              <UnitSprite className={firstStoryUnit.className} faction={activeFaction} size={42} />
            </View>
          ) : null}
        </View>
        {firstStoryUnit ? (
          <View style={styles.badges}>
            <UnitBadges role={firstStoryUnit.role} tier={firstStoryUnit.tier} battleTags={firstStoryUnit.battleTags} compact />
          </View>
        ) : null}
      </GameCard>

      <SectionTitle title="Research" trailing={activeResearchId ? '1 active' : '1 at a time'} />
      <View style={styles.list}>
        {magicResearchDefinitions.map(research => {
          const { progress, remainingHours, gemCost } = researchStatus(research);
          const completed = Boolean(progress?.completed);
          const started = Boolean(progress?.startedAt) && !completed;
          const readyToClaim = started && remainingHours <= 0;
          const locked = !storyUnlocked || chapterNumber < research.chapterRequired;
          const blockedByOther = Boolean(activeResearchId) && activeResearchId !== research.id && !completed;
          return (
            <GameCard key={research.id} accent={completed || started ? accent : undefined} faction={activeFaction} state={completed ? 'ready' : started ? 'selected' : 'default'}>
              <Text style={[styles.researchName, { color: accent }]}>{research.name}</Text>
              <View style={styles.badges}>
                <ResearchStateChip state={completed ? 'complete' : readyToClaim ? 'claimable' : started ? 'active' : locked ? 'locked' : 'available'} remainingHours={remainingHours} />
              </View>
              <ResearchUnlocks classes={research.unlocksClasses} templates={fantasyRecruitOptions} />
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>{research.description}</Text>
              {started && progress && !readyToClaim ? (
                <View style={styles.progressRow}>
                  <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
                    Ads {progress.rewardedAdsWatched}/{research.rewardedAdsToComplete}
                  </Text>
                  <ResearchGemCost cost={gemCost} balance={gems} />
                </View>
              ) : null}
              <View style={styles.actionStack}>
                {!progress ? (
                  <PrimaryButton
                    label={blockedByOther ? 'Finish Current Research First' : 'Start · ' + research.durationHours + 'h'}
                    disabled={locked || blockedByOther}
                    onPress={() => runResearchAction(research, 'start')}
                  />
                ) : completed ? (
                  <SecondaryButton label="Research Complete" disabled onPress={() => undefined} />
                ) : readyToClaim ? (
                  <PrimaryButton label="Complete Research" onPress={() => runResearchAction(research, 'claim')} />
                ) : (
                  <>
                    <PrimaryButton
                      label={'Watch Ad · ' + progress.rewardedAdsWatched + '/' + research.rewardedAdsToComplete}
                      disabled={progress.rewardedAdsWatched >= research.rewardedAdsToComplete}
                      onPress={() => void runResearchAd(research)}
                    />
                    <SecondaryButton label={'Finish · ' + gemCost + ' Gems'} disabled={gems < gemCost} onPress={() => runResearchAction(research, 'gems')} />
                  </>
                )}
              </View>
            </GameCard>
          );
        })}
      </View>

      <SectionTitle title="Train magic squads" trailing={unlockedFantasyClasses.length > 0 ? 'Research unlocked' : 'Research required'} />
      <View style={styles.list}>
        {fantasyRecruitOptions.map(template => {
          const unlocked = unlockedFantasyClasses.includes(template.className);
          const affordable = Object.entries(template.cost).every(([resource, amount]) => resources[resource as keyof typeof resources] >= (amount ?? 0));
          return <ResearchRecruitCard key={template.id} template={template} unlocked={unlocked} affordable={affordable} wallet={resources} onTrain={() => recruit(template)} />;
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
  list: { gap: 10 },
  institutionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  sprite: { width: 54, height: 58, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 17, lineHeight: 23, fontWeight: '900' },
  researchName: { fontSize: 17, lineHeight: 23, fontWeight: '900' },
  body: { marginTop: 6, fontSize: 13, lineHeight: 19 },
  badges: { marginTop: 8 },
  progressRow: { gap: 7, marginTop: 10 },
  progressText: { fontSize: 12, lineHeight: 18, fontWeight: '800' },
  actionStack: { gap: 8, marginTop: 12 },
  message: { textAlign: 'center', fontSize: 13, lineHeight: 19, fontWeight: '800' }
});
