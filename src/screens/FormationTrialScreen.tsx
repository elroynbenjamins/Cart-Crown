import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { KingdomTrialId } from '../game/kingdomTrials';
import { useGame } from '../game/GameProvider';
import { factions } from '../game/factions';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionCommit, DecisionIntro, DecisionLayout } from '../ui/DecisionUI';
import { GameCard, SecondaryButton } from '../ui/components';
import { FactionCrest, FormationTrialScene } from '../ui/gameArt';
import { SemanticChip } from '../ui/SemanticUI';
import { semanticColor } from '../ui/semanticColors';
import { getKingdomTrialView, trialMedalNames, trialScreenKey } from '../ui/kingdomTrialPresentation';
import type { ResourceWallet } from '../game/types';

export function TrialRewardSummary({ reward, claimed = false }: {
  reward: Partial<ResourceWallet>; claimed?: boolean;
}) {
  const { theme } = useGameTheme();
  const labels: Record<keyof ResourceWallet, string> = {
    gold: 'Gold', wood: 'Wood', iron: 'Iron', stone: 'Stone', provisions: 'Provisions'
  };
  return (
    <View style={styles.reward}>
      <Text style={[styles.heading, { color: theme.colors.text }]}>{claimed ? 'First-clear reward · already claimed' : 'First-clear reward'}</Text>
      <View style={styles.badges}>
        {(Object.keys(labels) as Array<keyof ResourceWallet>).map(resource => {
          const amount = reward[resource];
          return typeof amount === 'number' && amount > 0 ? (
            <SemanticChip key={resource} label={amount + ' ' + labels[resource]} tone={claimed ? 'neutral' : 'currency'} />
          ) : null;
        })}
      </View>
      <Text style={[styles.note, { color: theme.colors.textMuted }]}>
        {claimed ? 'Completion record, not a new payout. This medal cannot be claimed again.' : 'Added only when you claim this medal. Meeting the objectives does not claim it automatically.'}
      </Text>
    </View>
  );
}

type Feedback = { faction: string; id: KingdomTrialId; failed: boolean };

export function FormationTrialScreen({ onEditFormation, onExit }: {
  onEditFormation: () => void; onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const game = useGame();
  const view = getKingdomTrialView(game);
  const key = trialScreenKey(game);
  const faction = game.activeFaction;
  const [lessonKey, setLessonKey] = useState<string | null>(null);
  const [record, setRecord] = useState<{ key: string; id: KingdomTrialId } | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const alive = useRef(true);
  const submitted = useRef<{ faction: string; id: KingdomTrialId } | null>(null);
  const latest = useRef({ game, key });
  latest.current = { game, key };
  const pending = submitted.current?.faction === faction && submitted.current.id === view.currentId;

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const stillCurrent = () => alive.current && latest.current.key === key && trialScreenKey(latest.current.game) === key;
  const claim = () => {
    if (!stillCurrent()) return;
    const current = getKingdomTrialView(latest.current.game);
    const id = current.currentId;
    if (!id || !current.current?.passed ||
      (submitted.current?.faction === faction && submitted.current.id === id)) return;
    submitted.current = { faction, id };
    let ok = false;
    try { ok = latest.current.game.completeKingdomTrial(id); } catch { ok = false; }
    if (!ok) submitted.current = null;
    setFeedback({ faction, id, failed: !ok });
  };
  const edit = () => { if (stillCurrent() && view.currentId && !pending) onEditFormation(); };
  const leave = () => { if (alive.current && latest.current.game.activeFaction === faction) onExit(); };
  const message = feedback?.faction !== faction ? null
    : feedback.failed ? 'The medal could not be recorded. Review your formation and try again.'
      : view.completed.includes(feedback.id) ? trialMedalNames[feedback.id] + ' medal recorded. The first-clear reward was added.'
        : 'Recording medal…';
  const remaining = view.current ? view.current.checks.length - view.passedCount : 0;

  return (
    <DecisionLayout footer={
      <DecisionCommit
        title={view.current ? trialMedalNames[view.current.id] + ' Trial' : view.allComplete ? 'Trial track complete' : 'Continue the campaign'}
        detail={view.current
          ? view.current.passed ? 'All current objectives met. Claim the medal to record completion.' : remaining + ' objective' + (remaining === 1 ? '' : 's') + ' remaining. Changes are made in Formation.'
          : view.allComplete ? 'All three first-clear rewards are recorded for this faction.' : 'Future trial details unlock with their chapter and previous medal.'}
        message={message}
        label={pending ? 'Recording medal…' : view.current ? view.current.passed ? 'Claim ' + trialMedalNames[view.current.id] + ' Medal' : 'Edit Formation' : 'Return to Campaign'}
        disabled={pending}
        onConfirm={view.current ? view.current.passed ? claim : edit : leave}
      >
        {view.current?.passed ? <SecondaryButton label="Edit Formation" disabled={pending} onPress={edit} /> : null}
        {view.current ? <SecondaryButton label="Return to Campaign" onPress={leave} /> : null}
      </DecisionCommit>
    }>
      <View style={styles.badges}>
        <FactionCrest faction={faction} size={32} />
        <SemanticChip label={factions[faction].name + ' · This save'} tone="cyan" />
        <SemanticChip label={view.completed.length + '/3 medals claimed'} tone={view.allComplete ? 'positive' : 'blue'} />
      </View>
      <DecisionIntro eyebrow="OPTIONAL TACTICAL MODE" title="Kingdom Trials"
        body="Practice formation, spacing and doctrine. Trials check your current setup; they do not start a battle."
        accent={semanticColor(theme, 'blue')} />
      <FormationTrialScene
        faction={faction}
        passedCount={view.passedCount}
        total={view.current?.checks.length ?? 3}
        allComplete={view.allComplete}
      />

      {view.current ? (
        <GameCard ornament={false} accent={semanticColor(theme, 'blue')}>
          <View style={styles.badges}>
            <SemanticChip label={trialMedalNames[view.current.id] + ' · Current trial'} tone="blue" />
            <SemanticChip label={view.current.passed ? 'Ready to claim · not claimed' : view.passedCount + '/' + view.current.checks.length + ' objectives met'} tone={view.current.passed ? 'positive' : 'neutral'} />
          </View>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>{view.current.title}</Text>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>{view.current.body}</Text>
          <View accessibilityRole="progressbar" accessibilityLabel="Trial objectives met"
            accessibilityValue={{ min: 0, max: view.current.checks.length, now: view.passedCount }}
            style={[styles.progressTrack, { backgroundColor: theme.colors.surface3 }]}>
            <View style={[styles.progressFill, { width: `${100 * view.passedCount / Math.max(1, view.current.checks.length)}%`, backgroundColor: semanticColor(theme, 'blue') }]} />
          </View>
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>Live objectives · based on your current formation</Text>
          <View style={styles.objectives}>
            {view.current.checks.map(check => (
              <View key={check.id} style={[styles.objective, { borderColor: theme.colors.border }]}>
                <Text style={[styles.objectiveText, { color: theme.colors.text }]}>{check.label}</Text>
                <SemanticChip label={check.passed ? 'Met ✓' : 'Still needed'} tone={check.passed ? 'positive' : 'warning'} compact />
              </View>
            ))}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Trial lesson" accessibilityState={{ expanded: lessonKey === key }}
            onPress={() => { if (stillCurrent()) setLessonKey(lessonKey === key ? null : key); }}
            style={({ pressed }) => [styles.disclosure, { opacity: pressed ? 0.86 : 1 }]}>
            <Text style={[styles.link, { color: semanticColor(theme, 'blue') }]}>{lessonKey === key ? 'Hide lesson' : 'What this teaches'}</Text>
            <Text accessible={false} style={[styles.mark, { color: theme.colors.textMuted }]}>{lessonKey === key ? '−' : '+'}</Text>
          </Pressable>
          {lessonKey === key ? <Text style={[styles.body, { color: theme.colors.textMuted }]}>{view.current.lesson}</Text> : null}
          <TrialRewardSummary reward={view.current.reward} />
        </GameCard>
      ) : (
        <GameCard ornament={false}>
          <SemanticChip label={view.allComplete ? 'Track complete ✓' : 'Next trial locked'} tone={view.allComplete ? 'positive' : 'neutral'} />
          <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>
            {!view.consistent ? 'Trial record needs review' : view.allComplete ? 'Formation Mastery' : view.nextId ? trialMedalNames[view.nextId] + ' · Chapter ' + view.nextChapter : 'Kingdom Trials'}
          </Text>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>
            {!view.consistent ? 'This medal history is inconsistent. Return to Campaign; no reward can be claimed from this report.'
              : view.allComplete ? 'All foundational trials are recorded. Changing your formation does not remove earned medals.'
                : 'Keep progressing the campaign. No repeated side-mode runs are required to unlock the next medal.'}
          </Text>
        </GameCard>
      )}

      <GameCard ornament={false}>
        <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>Medal track</Text>
        <Text style={[styles.note, { color: theme.colors.textMuted }]}>Completed records expand on demand. Future objectives stay hidden until unlocked.</Text>
        {view.track.map(item => {
          const expanded = record?.key === key && record.id === item.id;
          const summary = (
            <View style={styles.trackSummary}>
              <View style={styles.copy}>
                <Text style={[styles.heading, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.note, { color: theme.colors.textMuted }]}>Chapter {item.chapter}{item.record ? ' · View record' : ''}</Text>
              </View>
              <SemanticChip label={item.status + (item.claimed ? ' ✓' : '')} tone={item.tone} compact />
              {item.record ? <Text accessible={false} style={[styles.mark, { color: theme.colors.textMuted }]}>{expanded ? '−' : '+'}</Text> : null}
            </View>
          );
          return (
            <View key={item.id} style={[styles.trackItem, { borderTopColor: theme.colors.border }]}>
              {item.record ? (
                <Pressable accessibilityRole="button" accessibilityLabel={item.name + ' medal record'} accessibilityState={{ expanded }}
                  onPress={() => { if (stillCurrent()) setRecord(expanded ? null : { key, id: item.id }); }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}>
                  {summary}
                </Pressable>
              ) : summary}
              {expanded && item.record ? (
                <View style={styles.record}>
                  <Text style={[styles.heading, { color: theme.colors.text }]}>{item.record.title}</Text>
                  <Text style={[styles.body, { color: theme.colors.textMuted }]}>{item.record.lesson}</Text>
                  <TrialRewardSummary reward={item.record.reward} claimed />
                </View>
              ) : null}
            </View>
          );
        })}
      </GameCard>
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  title: { fontSize: 21, lineHeight: 28, fontWeight: '900', marginTop: 10 },
  heading: { fontSize: 15, lineHeight: 21, fontWeight: '900' },
  body: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  objectives: { gap: 8, marginTop: 12 },
  objective: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1, borderRadius: 12 },
  objectiveText: { flexGrow: 1, flexShrink: 1, flexBasis: 170, minWidth: 0, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 12 },
  progressFill: { height: 6, borderRadius: 3 },
  disclosure: { minHeight: 48, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  link: { flex: 1, minWidth: 0, fontSize: 14, lineHeight: 20, fontWeight: '800' },
  mark: { width: 24, fontSize: 20, lineHeight: 24, textAlign: 'center' },
  reward: { gap: 8, marginTop: 12 },
  trackItem: { borderTopWidth: 1, marginTop: 10 },
  trackSummary: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, minHeight: 56, paddingVertical: 10 },
  copy: { flex: 1, minWidth: 90 },
  record: { paddingBottom: 8 }
});
