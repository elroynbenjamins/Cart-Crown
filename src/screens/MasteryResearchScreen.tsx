import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import type { TutorialFocusTarget } from '../game/tutorial';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionCommit, DecisionIntro, DecisionLayout, DecisionOption, DecisionStats } from '../ui/DecisionUI';
import { GameCard, SecondaryButton } from '../ui/components';
import { FactionCrest, UnitSprite } from '../ui/gameArt';
import { SemanticChip, SemanticText, UnitBadges } from '../ui/SemanticUI';
import { rolePresentation, semanticColor } from '../ui/semanticColors';
import { ResearchCosts, ResearchGemCost, ResearchStateChip, ResearchUnlocks } from '../ui/ResearchUI';
import { formatResearchDuration } from '../ui/researchPresentation';
import { getMasteryResearchView, masteryFamilyPresentation, masterySnapshotKey } from '../ui/masteryResearchPresentation';
import type { MasteryFamily } from '../ui/masteryResearchPresentation';
import { TutorialFocus } from '../ui/TutorialFocus';

export type MasteryScreenProps = {
  onExit: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
};
type Tab = 'research' | 'training';
type Action = 'start' | 'claim' | 'gems' | 'train';
type Draft = { scope: string; tab: Tab; id?: string; researchId?: string; focusKey?: string };

/** Shared workshop for all four families. Selection is always separate from a provider action. */
export function MasteryResearchScreen({ family, onExit, tutorialFocus, onTutorialFocusComplete }: MasteryScreenProps & { family: MasteryFamily }) {
  const { theme } = useGameTheme();
  const game = useGame();
  const [now, setNow] = useState(Date.now());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [gemReview, setGemReview] = useState<{ snapshot: string; researchId: string; cost: number } | null>(null);
  const [feedback, setFeedback] = useState<{ scope: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  const inFlight = useRef(false);
  const submitted = useRef<string | null>(null);
  const scope = family + ':' + game.activeFaction;
  const snapshot = masterySnapshotKey(family, game);
  const sameScope = draft?.scope === scope;
  const view = getMasteryResearchView(family, game, now, sameScope ? draft.researchId : undefined);
  const config = masteryFamilyPresentation[family];
  const focusedFamily = tutorialFocus && 'family' in tutorialFocus && tutorialFocus.family === family;
  const focusKey = focusedFamily ? tutorialFocus.kind : '';
  const defaultTab: Tab = focusedFamily && tutorialFocus?.kind === 'research-train' ? 'training' : 'research';
  // A newly introduced lesson can open its tab; ending a lesson does not reset the player's choice.
  const tab = sameScope && (!focusedFamily || draft.focusKey === focusKey) ? draft.tab : defaultTab;
  const selected = view.templates.find(item => sameScope && item.template.id === draft.id) ??
    view.templates.find(item => item.unlocked) ?? view.templates[0] ?? null;
  const reviewingGems = tab === 'research' && gemReview?.snapshot === snapshot &&
    gemReview.researchId === view.research?.id && view.visualState === 'active';
  const identity = [snapshot, tab, view.research?.id, selected?.template.id, focusKey, reviewingGems ? gemReview.cost : 'normal'].join('|');
  const latest = useRef({ game, scope, identity });
  latest.current = { game, scope, identity };

  useEffect(() => {
    alive.current = true;
    const refresh = setInterval(() => setNow(Date.now()), 30_000);
    return () => { alive.current = false; clearInterval(refresh); };
  }, []);

  const changeTab = (nextTab: Tab) => {
    if (!alive.current || latest.current.identity !== identity || inFlight.current) return;
    const linked = tab === 'research' && nextTab === 'training' && view.visualState === 'complete'
      ? view.templates.find(item => item.unlocked && item.template.researchId === view.research?.id) : null;
    setDraft({ scope, tab: nextTab, id: linked?.template.id ?? selected?.template.id, researchId: view.research?.id, focusKey });
    setGemReview(null);
  };
  const chooseResearch = (researchId: string) => {
    if (!alive.current || latest.current.identity !== identity || inFlight.current) return;
    setDraft({ scope, tab: 'research', id: selected?.template.id, researchId, focusKey });
    setGemReview(null);
    setFeedback(null);
  };
  const perform = (action: Action) => {
    if (!alive.current || latest.current.identity !== identity || inFlight.current || submitted.current === snapshot) return;
    const current = getMasteryResearchView(family, latest.current.game, Date.now(), view.research?.id);
    const choice = current.templates.find(item => item.template.id === selected?.template.id);
    const allowed = action === 'start' ? current.canStart
      : action === 'claim' ? current.visualState === 'claimable'
        : action === 'gems' ? reviewingGems && current.canPayGems && current.gemCost <= (gemReview?.cost ?? -1)
          : Boolean(choice?.unlocked && choice.affordable);
    if (!allowed || !current.research) {
      setNow(Date.now());
      setFeedback({ scope, text: 'Requirements changed. Review the current state before confirming.' });
      return;
    }
    submitted.current = snapshot;
    // Keep the completed doctrine selected instead of silently jumping to the next unstarted one.
    setDraft({ scope, tab, id: selected?.template.id, researchId: current.research.id, focusKey });
    let ok = false;
    try {
      ok = action === 'start' ? latest.current.game.startFantasyResearch(current.research.id)
        : action === 'claim' ? latest.current.game.claimFantasyResearch(current.research.id)
          : action === 'gems' ? latest.current.game.finishFantasyResearchWithGems(current.research.id)
            : latest.current.game.recruitFantasyUnit(choice!.template.id);
    } catch { ok = false; }
    if (!ok) submitted.current = null;
    setFeedback({ scope, text: !ok ? 'This action could not be completed. Check the current requirements and try again.'
      : action === 'train' ? choice!.template.className + ' added to the roster. Deploy it in Formation.'
        : action === 'start' ? current.research.name + ' started.' : current.research.name + ' completed.' });
    if (ok) {
      setGemReview(null);
      if (focusedFamily && ((action === 'start' && tutorialFocus?.kind === 'research-start') || (action === 'train' && tutorialFocus?.kind === 'research-train'))) {
        onTutorialFocusComplete?.();
      }
    }
    setNow(Date.now());
  };
  const watchAd = async () => {
    if (!alive.current || latest.current.identity !== identity || inFlight.current || submitted.current === snapshot) return;
    const current = getMasteryResearchView(family, latest.current.game, Date.now(), view.research?.id);
    if (!current.research || !current.canWatchAd) { setNow(Date.now()); return; }
    inFlight.current = true;
    setBusy(true);
    submitted.current = snapshot;
    setDraft({ scope, tab, id: selected?.template.id, researchId: current.research.id, focusKey });
    let rewarded = false;
    try {
      const result = await latest.current.game.watchFantasyResearchAd(current.research.id);
      rewarded = result.status === 'rewarded';
    } catch { rewarded = false; }
    finally {
      inFlight.current = false;
      if (!rewarded) submitted.current = null;
      if (alive.current) {
        setBusy(false);
        if (latest.current.scope === scope) {
          setFeedback({ scope, text: rewarded ? 'Research advanced.' : 'No ad reward was received. You can wait for the timer or try again.' });
          setNow(Date.now());
        }
      }
    }
  };
  const leave = () => { if (alive.current && !inFlight.current && latest.current.scope === scope) onExit(); };
  const pending = submitted.current === snapshot;
  const researchFocused = tab === 'research' && focusedFamily && tutorialFocus?.kind === 'research-start' && view.canStart;
  const trainingFocused = tab === 'training' && focusedFamily && tutorialFocus?.kind === 'research-train' && Boolean(selected?.unlocked);
  const trainingCost = selected?.costs.map(row => row.required + ' ' + row.label).join(' · ') || 'No resource cost';
  const shortfall = selected?.costs.filter(row => row.missing !== 0).map(row => row.missing === null ? 'Check ' + row.label : row.missing + ' ' + row.label + ' short').join(' · ');
  const actionLabel = busy ? 'Ad in progress…' : pending ? 'Updating…'
    : tab === 'training' ? selected ? 'Train ' + selected.template.className : 'No training available'
      : reviewingGems ? 'Spend ' + view.gemCost + ' Gems & finish'
        : view.visualState === 'complete' ? 'Review training'
          : view.visualState === 'claimable' ? 'Complete research · Free'
            : view.visualState === 'available' ? 'Start research · ' + formatResearchDuration(view.research?.durationHours ?? 0)
              : view.visualState === 'active' ? 'Researching · ' + formatResearchDuration(view.remainingHours) : 'Research locked';
  const disabled = busy || pending || (tab === 'training' ? !selected?.unlocked || !selected.affordable
    : reviewingGems ? !view.canPayGems : view.visualState === 'active' || view.visualState === 'locked');

  return (
    <DecisionLayout footer={
      <TutorialFocus active={Boolean(researchFocused || trainingFocused)} label={researchFocused || trainingFocused ? tutorialFocus?.label : undefined}>
        <DecisionCommit
          title={tab === 'training' ? selected?.template.className ?? 'Training' : view.research?.name ?? config.title}
          detail={tab === 'training'
            ? 'Cost: ' + trainingCost + '. Adds one roster unit; does not deploy it or increase capacity.'
            : reviewingGems ? 'Optional finish. Balance: ' + game.gems + ' Gems. After payment: ' + Math.max(0, game.gems - view.gemCost) + ' Gems.'
              : view.visualState === 'active' ? 'Wait for the timer, or choose an optional acceleration below.'
                : view.visualState === 'complete' ? 'Training is a separate resource purchase.' : 'Starting or claiming research has no resource cost.'}
          warning={tab === 'training' ? !selected?.unlocked ? 'Unlock this class through research first.' : shortfall || null
            : view.visualState === 'locked' ? view.requirement : null}
          message={feedback?.scope === scope ? feedback.text : null}
          label={actionLabel} disabled={disabled}
          onConfirm={() => tab === 'training' ? perform('train') : reviewingGems ? perform('gems')
            : view.visualState === 'complete' ? changeTab('training') : perform(view.visualState === 'claimable' ? 'claim' : 'start')}
        >
          {tab === 'research' && view.visualState === 'active' ? reviewingGems ? (
            <SecondaryButton label="Cancel Gem finish" disabled={busy} onPress={() => {
              if (alive.current && latest.current.identity === identity && !inFlight.current) setGemReview(null);
            }} />
          ) : (
            <>
              <SecondaryButton label={'Watch ad · ' + (view.progress?.rewardedAdsWatched ?? 0) + '/' + (view.research?.rewardedAdsToComplete ?? 3)} disabled={busy || pending || !view.canWatchAd} onPress={() => void watchAd()} />
              <SecondaryButton label="Review Gem finish" disabled={busy || pending || !view.canPayGems} onPress={() => {
                if (!alive.current || latest.current.identity !== identity || inFlight.current || submitted.current === snapshot) return;
                const current = getMasteryResearchView(family, latest.current.game, Date.now(), view.research?.id);
                if (current.research && current.canPayGems) setGemReview({ snapshot, researchId: current.research.id, cost: current.gemCost });
                setNow(Date.now());
              }} />
            </>
          ) : null}
          <SecondaryButton label="Return to Army" disabled={busy} onPress={leave} />
        </DecisionCommit>
      </TutorialFocus>
    }>
      <View style={styles.badges}>
        <FactionCrest faction={game.activeFaction} size={32} />
        <SemanticChip label={config.label} tone={config.tone} />
        <SemanticChip label={'Gems · ' + game.gems} tone="currency" />
        <SemanticChip label={'Research · ' + view.completedCount + '/' + view.researchOptions.length} tone="blue" />
      </View>
      <DecisionIntro eyebrow={config.eyebrow} title={config.title} body={config.body} accent={semanticColor(theme, config.tone)} />
      <View style={[styles.tabs, { backgroundColor: theme.colors.surface2 }]}>
        {(['research', 'training'] as const).map(nextTab => (
          <Pressable key={nextTab} accessibilityRole="tab" accessibilityState={{ selected: nextTab === tab, disabled: busy }}
            accessibilityLabel={nextTab === 'research' ? 'Research' : 'Training'} disabled={busy} onPress={() => changeTab(nextTab)}
            style={({ pressed }) => [styles.tab, { backgroundColor: nextTab === tab ? theme.colors.surface1 : 'transparent', borderColor: nextTab === tab ? theme.colors.gold : 'transparent', opacity: pressed ? 0.86 : 1 }]}>
            <Text style={[styles.tabText, { color: nextTab === tab ? theme.colors.text : theme.colors.textMuted }]}>{nextTab === 'research' ? 'Research' : 'Training'}</Text>
          </Pressable>
        ))}
      </View>
      {tab === 'research' ? (
        <>
          {view.researchOptions.length > 1 ? (
            <>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>Select a research branch to review. Selection does not start research or spend Gems.</Text>
              {view.researchOptions.map(option => (
                <DecisionOption key={option.research.id} title={option.research.name} titleTone={config.tone}
                  subtitle={formatResearchDuration(option.research.durationHours) + ' · ' + option.research.unlocksClasses.join(', ')}
                  selected={view.research?.id === option.research.id} disabled={busy}
                  accessibilitySummary={option.visualState + '. ' + (option.requirement ?? option.research.description)}
                  onSelect={() => chooseResearch(option.research.id)}>
                  <ResearchStateChip state={option.visualState} remainingHours={option.remainingHours} />
                  {view.research?.id === option.research.id ? (
                    <>
                      <Text style={[styles.body, { color: theme.colors.textMuted }]}>{option.research.description}</Text>
                      <ResearchUnlocks classes={option.research.unlocksClasses} templates={view.templates.map(item => item.template)} />
                      {option.visualState === 'active' ? <ResearchGemCost cost={option.gemCost} balance={game.gems} /> : null}
                    </>
                  ) : null}
                </DecisionOption>
              ))}
            </>
          ) : (
            <GameCard ornament={false}>
              <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>{view.research?.name ?? 'Research unavailable'}</Text>
              <View style={styles.spaced}><ResearchStateChip state={view.visualState} remainingHours={view.remainingHours} /></View>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>{view.research?.description ?? 'Research details are unavailable for this faction.'}</Text>
              {view.research ? <ResearchUnlocks classes={view.research.unlocksClasses} templates={view.templates.map(item => item.template)} /> : null}
              {view.visualState === 'active' ? <View style={styles.spaced}><ResearchGemCost cost={view.gemCost} balance={game.gems} /></View> : null}
            </GameCard>
          )}
          <GameCard ornament={false}>
            <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>Access & prerequisites</Text>
            <View style={styles.spaced}><SemanticChip label={view.storyUnlocked ? 'Story access recorded' : 'Story discovery required'} tone={view.storyUnlocked ? 'positive' : 'neutral'} /></View>
            {family === 'hybrid' ? <View style={styles.spaced}><SemanticChip label={view.prerequisitesMet ? 'Magic + Flying research complete' : 'Magic + Flying research required'} tone={view.prerequisitesMet ? 'positive' : 'warning'} /></View> : null}
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{view.unlock?.buildingName ?? 'Faction institution'} · Research does not construct or upgrade a settlement building.</Text>
            {view.requirement && view.visualState === 'locked' ? <Text style={[styles.body, { color: semanticColor(theme, 'warning') }]}>{view.requirement}</Text> : null}
            {view.firstUnit ? (
              <View style={styles.spaced}>
                <View style={styles.unitRow}>
                  <UnitSprite className={view.firstUnit.className} faction={view.firstUnit.faction} size={44} />
                  <View style={styles.copy}>
                    <SemanticText tone={rolePresentation[view.firstUnit.role]?.tone ?? 'neutral'} style={styles.heading}>{view.firstUnit.name}</SemanticText>
                    <UnitBadges role={view.firstUnit.role} tier={view.firstUnit.tier} battleTags={view.firstUnit.battleTags} />
                  </View>
                </View>
                <View style={styles.spaced}><SemanticChip label={view.firstUnitFielded ? 'Story unit · Fielded' : 'Story unit · In reserve'} tone="cyan" /></View>
                <Text style={[styles.note, { color: theme.colors.textMuted }]}>Current roster identity. Research does not grant this story unit again.</Text>
              </View>
            ) : view.storyUnlocked ? <Text style={[styles.note, { color: theme.colors.textMuted }]}>Story access is recorded. The original story unit was not found in this roster; viewing research does not grant a replacement.</Text> : null}
          </GameCard>
        </>
      ) : (
        <>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>Select a class to compare. These are recruitment stats before later equipment or training; capacity is the cost of deploying one unit.</Text>
          {view.templates.map(item => (
            <DecisionOption key={item.template.id} title={item.template.className} titleTone={rolePresentation[item.template.role]?.tone ?? 'neutral'}
              subtitle={'Level ' + item.template.level + ' · ' + item.capacity + ' deployment capacity'} selected={item.template.id === selected?.template.id} disabled={busy}
              art={<UnitSprite className={item.template.className} faction={item.template.faction} size={44} />}
              accessibilitySummary={'Training preview, not recruited. ' + item.capacity + ' deployment capacity. HP ' + item.template.hp + ', attack ' + item.template.attack + ', armor ' + item.template.armor + ', speed ' + item.template.speed}
              onSelect={() => {
                if (!alive.current || latest.current.identity !== identity || inFlight.current) return;
                setDraft({ scope, tab: 'training', id: item.template.id, researchId: view.research?.id, focusKey });
                setGemReview(null); setFeedback(null);
              }}>
              <UnitBadges role={item.template.role} tier={item.template.tier} battleTags={item.template.battleTags} />
              <View style={styles.badges}>
                <SemanticChip label={'Deployment cost · ' + item.capacity} tone={item.capacity > 1 ? 'warning' : 'neutral'} />
                <SemanticChip label={!item.unlocked ? 'Research required' : item.affordable ? 'Materials sufficient' : 'Missing materials'} tone={!item.unlocked ? 'neutral' : item.affordable ? 'positive' : 'warning'} />
              </View>
              <DecisionStats presentation="absolute" items={[{ label: 'HP', value: item.template.hp }, { label: 'Attack', value: item.template.attack }, { label: 'Armor', value: item.template.armor }, { label: 'Speed', value: item.template.speed }]} />
              {item.template.id === selected?.template.id ? <ResearchCosts cost={item.template.cost} wallet={game.resources} /> : null}
            </DecisionOption>
          ))}
          {!view.templates.length ? <Text style={[styles.body, { color: theme.colors.textMuted }]}>No training options are available for this faction.</Text> : null}
        </>
      )}
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 14, gap: 6 },
  tab: { flex: 1, minHeight: 48, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 14, lineHeight: 20, fontWeight: '800' },
  heading: { fontSize: 16, lineHeight: 22, fontWeight: '900' },
  body: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  spaced: { marginTop: 10 },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  copy: { flex: 1, minWidth: 0, gap: 6 }
});
