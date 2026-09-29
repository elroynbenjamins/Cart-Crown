import React, { useRef, useState } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionCommit, DecisionIntro, DecisionLayout, DecisionOption } from './DecisionUI';
import { GameCard } from './components';
import { SemanticChip, SemanticText } from './SemanticUI';
import { eventEffectRows, eventResourceRows, eventRewardLabel } from './campaignEventPresentation';
import type { EventEffectRow, EventTacticalEffects } from './campaignEventPresentation';

export function EventEffectList({ rows }: { rows: readonly EventEffectRow[] }) {
  const { theme } = useGameTheme();
  return (
    <View style={styles.effects}>
      {rows.map(row => (
        <View key={row.id} style={[styles.effectRow, { backgroundColor: theme.colors.surface2 }]}>
          <Text style={[styles.effectLabel, { color: theme.colors.text }]}>{row.label}</Text>
          <SemanticText tone={row.tone} style={styles.effectValue}>{row.value}</SemanticText>
        </View>
      ))}
    </View>
  );
}

/** Optional illustration, never a gate or a new tutorial. The story itself stays visible. */
export function EventIllustration({ children }: PropsWithChildren) {
  const { theme } = useGameTheme();
  const [expanded, setExpanded] = useState(false);
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? 'Hide event illustration' : 'View event illustration'}
        onPress={() => setExpanded(previous => !previous)}
        style={({ pressed }) => [styles.disclosure, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Text style={[styles.disclosureText, { color: theme.colors.textMuted }]}>{expanded ? 'Hide illustration' : 'View illustration'}</Text>
      </Pressable>
      {expanded ? <View style={styles.illustration}>{children}</View> : null}
    </View>
  );
}

type StoryChoice = EventTacticalEffects & { id: string; name: string; description: string; effectText: string };

/** One chapter decision, not a respec menu. Merely selecting a draft never calls the provider. */
export function ChapterDecision<T extends StoryChoice>({
  eyebrow, title, body, scope, options, recordedId, canChoose, onChoose, continueLabel, onContinue, illustration, portrait
}: {
  eyebrow: string; title: string; body: string; scope: string;
  options: readonly T[]; recordedId: T['id'] | null; canChoose: boolean;
  onChoose: (id: T['id']) => boolean; continueLabel: string; onContinue: () => void;
  illustration?: ReactNode; portrait?: ReactNode;
}) {
  const { theme } = useGameTheme();
  const [draftId, setDraftId] = useState<string | null>(recordedId ?? options[0]?.id ?? null);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const submitted = useRef(false);
  const finalId = recordedId ?? acceptedId;
  const recorded = finalId !== null;
  // Reloaded saves always win over a stale local draft.
  const selected = options.find(option => option.id === (recorded ? finalId : draftId)) ?? null;

  const confirm = () => {
    if (recorded || !selected || !canChoose || submitted.current) return;
    submitted.current = true;
    try {
      if (onChoose(selected.id)) {
        setAcceptedId(selected.id);
        setMessage('Decision recorded. The listed effects apply only to the encounters shown.');
        return;
      }
    } catch {
      // The provider is authoritative. A rejected/failed action must never appear successful.
    }
    submitted.current = false;
    setMessage('The decision was not completed. Check that this is the current campaign event, then try again.');
  };

  return (
    <DecisionLayout footer={
      <DecisionCommit
        title={recorded ? selected?.name ?? 'Decision recorded' : selected?.name ?? 'Choose an approach'}
        detail={recorded ? 'This event choice is recorded and cannot be replaced here.' : 'No resource cost. Confirming records one choice for this event.'}
        warning={!recorded ? !canChoose ? 'Reach this event in the campaign before confirming.' : 'After confirmation, the other options cannot be selected for this event.' : null}
        message={message}
        label={recorded ? continueLabel : selected ? 'Confirm ' + selected.name : 'Choose an approach'}
        disabled={!recorded && (!selected || !canChoose)}
        onConfirm={recorded ? onContinue : confirm}
      />
    }>
      <DecisionIntro eyebrow={eyebrow} title={title} body={body} accent={theme.colors.gold} />
      <GameCard ornament={false}>
        <View style={styles.badges}>
          <SemanticChip label={recorded ? 'Decision recorded' : 'Chapter decision · preview'} tone={recorded ? 'positive' : 'blue'} />
          <SemanticChip label="No resource cost" tone="neutral" />
        </View>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Applies to</Text>
        <Text style={[styles.body, { color: theme.colors.text }]}>{scope}</Text>
        <Text style={[styles.note, { color: theme.colors.textMuted }]}>These are this choice’s contributions, not final army totals or a win prediction. Other sources of bonuses and intel remain separate.</Text>
      </GameCard>
      {options.map(option => {
        const highlighted = selected?.id === option.id;
        const state = highlighted ? recorded ? 'recorded' : 'preview' : 'unselected';
        const rows = eventEffectRows(option, state);
        const status = recorded ? highlighted ? 'Recorded choice' : 'Not chosen' : highlighted ? 'Preview · not active' : 'Alternative · not active';
        return (
          <DecisionOption
            key={option.id}
            title={option.name}
            subtitle={status}
            selected={highlighted}
            disabled={recorded}
            art={portrait}
            accessibilitySummary={option.description + '. ' + rows.map(row => row.label + ': ' + row.value).join('. ') + '. Applies to ' + scope}
            onSelect={() => {
              if (recorded) return;
              setDraftId(option.id);
              setMessage(null);
            }}
          >
            <SemanticChip label={status} tone={highlighted ? recorded ? 'positive' : 'blue' : 'neutral'} compact />
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{option.description}</Text>
            <EventEffectList rows={rows} />
          </DecisionOption>
        );
      })}
      {illustration ? <EventIllustration>{illustration}</EventIllustration> : null}
    </DecisionLayout>
  );
}

export function EventRewardPanel({ title, kind, completed, values, detail, note, art }: {
  title: string; kind: 'immediate' | 'production' | 'blueprint'; completed: boolean;
  values?: Partial<ResourceWallet>; detail: string; note?: string; art?: ReactNode;
}) {
  const { theme } = useGameTheme();
  return (
    <GameCard ornament={false}>
      <SemanticChip label={eventRewardLabel(kind, completed)} tone={completed ? 'positive' : 'blue'} compact />
      <View style={styles.panelHeader}>
        {art ? <View style={styles.art}>{art}</View> : null}
        <Text style={[styles.panelTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.body, { color: theme.colors.textMuted }]}>{detail}</Text>
      {values ? <EventEffectList rows={eventResourceRows(values)} /> : null}
      {note ? <Text style={[styles.note, { color: theme.colors.textMuted }]}>{note}</Text> : null}
    </GameCard>
  );
}

/** Completion is explicit, once per mounted event; failed actions remain retryable. */
export function EventResolution({ completed, canResolve, title, label, continueLabel, onResolve, onContinue, children }: PropsWithChildren<{
  completed: boolean; canResolve: boolean; title: string; label: string; continueLabel: string;
  onResolve: () => boolean; onContinue: () => void;
}>) {
  const [message, setMessage] = useState<string | null>(null);
  const submitted = useRef(false);
  const resolve = () => {
    if (completed || !canResolve || submitted.current) return;
    submitted.current = true;
    try {
      if (onResolve()) {
        setMessage('Event completed. The report above shows its rewards and unlocks.');
        return;
      }
    } catch {
      // Do not navigate forward or display a claim on failure.
    }
    submitted.current = false;
    setMessage('This event could not be completed. Check the current campaign requirements and try again.');
  };
  return (
    <DecisionLayout footer={
      <DecisionCommit
        title={completed ? 'Event completed' : title}
        detail={completed ? 'Rewards cannot be claimed again by reopening this report.' : 'Opening this report does not grant rewards or spend resources.'}
        warning={!completed && !canResolve ? 'Reach this event in the campaign before completing it.' : null}
        message={message}
        label={completed ? continueLabel : label}
        disabled={!completed && !canResolve}
        onConfirm={completed ? onContinue : resolve}
      />
    }>{children}</DecisionLayout>
  );
}

const styles = StyleSheet.create({
  effects: { gap: 6, marginTop: 8 },
  effectRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderRadius: 10, padding: 10 },
  effectLabel: { flexGrow: 1, flexShrink: 1, fontSize: 13, lineHeight: 19 },
  effectValue: { fontSize: 15, lineHeight: 21, fontWeight: '900', flexShrink: 1 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  sectionLabel: { fontSize: 13, lineHeight: 19, fontWeight: '900', marginTop: 10 },
  body: { fontSize: 14, lineHeight: 20, marginTop: 5 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  disclosure: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12 },
  disclosureText: { fontSize: 13, lineHeight: 19, fontWeight: '800' },
  illustration: { alignItems: 'center', paddingBottom: 8 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  art: { width: 48, alignItems: 'center', justifyContent: 'center' },
  panelTitle: { fontSize: 16, lineHeight: 22, fontWeight: '900', flex: 1, minWidth: 0 }
});
