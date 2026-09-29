import React, { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, SecondaryButton } from './components';
import { DecisionCommit, DecisionLayout, DecisionOption } from './DecisionUI';
import { EmphasisText, SemanticChip, SemanticText } from './SemanticUI';
import { semanticColor } from './semanticColors';
import { policyCategories, policyChangeRows, policyCommitState, policyEffectRows } from './policyPresentation';
import type { PolicyDisplayState, PolicyEffects, PolicyOption } from './policyPresentation';

export function PolicyEffectsList({ effects, state, fallback }: {
  effects: PolicyEffects; state: PolicyDisplayState; fallback: string;
}) {
  const { theme } = useGameTheme();
  const rows = policyEffectRows(effects, state);
  return (
    <View style={styles.effects}>
      {rows.length ? rows.map(row => (
        <View key={row.key} style={styles.effectRow}>
          <Text style={[styles.effectLabel, { color: theme.colors.textMuted }]}>{row.label}</Text>
          <SemanticText tone={row.tone} style={styles.effectValue}>{row.value}</SemanticText>
        </View>
      )) : <Text style={[styles.body, { color: theme.colors.textMuted }]}>{fallback}</Text>}
    </View>
  );
}

export function PolicyReplacementPreview({ current, proposed }: { current: PolicyOption; proposed: PolicyOption }) {
  const { theme } = useGameTheme();
  const rows = policyChangeRows(current.effects, proposed.effects);
  return (
    <GameCard ornament={false} accent={semanticColor(theme, 'blue')}>
      <SemanticChip label="Replacement preview · not applied" tone="blue" />
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {current.name} → {proposed.name}
      </Text>
      {rows.map(row => (
        <View key={row.key} style={[styles.changeRow, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.effectLabel, { color: theme.colors.text }]}>{row.label}</Text>
          <View style={styles.changeValues}>
            <SemanticText tone="neutral" style={styles.body}>{row.before}</SemanticText>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>→</Text>
            <SemanticText tone={row.tone} style={styles.effectValue}>{row.after}</SemanticText>
            <SemanticChip label={row.tone === 'negative' ? 'Tradeoff' : 'Gain'} tone={row.tone} compact />
          </View>
        </View>
      ))}
      {!rows.length ? <Text style={[styles.body, { color: theme.colors.textMuted }]}>No change to the listed policy modifiers.</Text> : null}
      <Text style={[styles.note, { color: theme.colors.textMuted }]}>
        These are policy contributions, not final army totals. Buildings, equipment and other sources keep their own effects.
      </Text>
    </GameCard>
  );
}

/** A draft is separate from the provider's active ID. No policy changes until confirmation. */
export function PolicyDecision({ title, eyebrow, options, activeId, gold, switchCost, verb, art, scene, onChoose, onExit }: {
  title: string;
  eyebrow: string;
  options: readonly PolicyOption[];
  activeId: string | null;
  gold: number;
  switchCost: number;
  verb: 'Enact' | 'Adopt';
  art?: ReactNode;
  scene?: ReactNode;
  onChoose: (id: string) => boolean;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const [draft, setDraft] = useState<{ id: string; against: string | null } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const lastCommit = useRef<{ activeId: string | null; gold: number; cost: number | null } | null>(null);
  const inFlight = useRef(false);
  const active = options.find(option => option.id === activeId) ?? null;
  const selected = draft && draft.against === activeId
    ? options.find(option => option.id === draft.id) ?? null
    : active ?? options[0] ?? null;
  const commit = policyCommitState(activeId, selected?.id ?? null, gold, switchCost);

  const confirm = () => {
    if (commit.current) { onExit(); return; }
    if (!selected || !commit.canCommit || inFlight.current) return;
    // A second stale event cannot spend again, even if it came from another selected card.
    if (lastCommit.current?.activeId === activeId && lastCommit.current.gold === gold && lastCommit.current.cost === commit.cost) return;
    inFlight.current = true;
    lastCommit.current = { activeId, gold, cost: commit.cost };
    try {
      const ok = onChoose(selected.id);
      if (!ok) lastCommit.current = null;
      setMessage(ok
        ? selected.name + ' is now active.'
        : 'Policy not changed. Check Capital access, campaign requirements and your current Gold.');
    } catch {
      lastCommit.current = null;
      setMessage('Could not confirm the policy change. Review the active policy and Gold before trying again.');
    } finally {
      inFlight.current = false;
    }
  };

  const detail = commit.current
    ? 'Already active. Returning costs no Gold.'
    : !selected ? 'Select an available policy to review it.'
      : commit.switching
        ? 'Replaces ' + (active?.name ?? 'the current policy') + '. Cost: ' + (commit.cost === null ? 'unavailable' : commit.cost + ' Gold') +
          '. Balance: ' + (commit.balance === null ? 'unavailable' : commit.balance + ' Gold') +
          (commit.balanceAfter === null ? '.' : '. After confirmation: ' + commit.balanceAfter + ' Gold.')
        : 'Your first choice is free. Only one policy can be active at a time.';
  const warning = commit.current || !selected ? null
    : commit.missing === null ? 'Cost or balance unavailable. Review your current resources before confirming.'
      : commit.missing > 0 ? 'Need ' + commit.missing + ' more Gold to replace the active policy.' : null;

  return (
    <DecisionLayout footer={
      <DecisionCommit
        title={selected?.name ?? 'No policy selected'}
        detail={detail}
        warning={warning}
        message={message}
        label={commit.current ? 'Return to Kingdom'
          : !selected ? 'Choose a policy'
            : commit.switching ? verb + ' · ' + (commit.cost === null ? 'Cost unavailable' : commit.cost + ' Gold')
              : verb + ' ' + selected.name}
        disabled={!commit.current && !commit.canCommit}
        onConfirm={confirm}
      >
        {!commit.current ? <SecondaryButton label="Return without changing" onPress={onExit} /> : null}
      </DecisionCommit>
    }>
      <GameCard ornament={false} accent={semanticColor(theme, 'currency')}>
        <View style={styles.heroRow}>
          <View style={styles.copy}>
            <SemanticText tone="currency" style={styles.eyebrow}>{eyebrow}</SemanticText>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          </View>
          {art ? <View style={styles.art}>{art}</View> : null}
        </View>
        <Text style={[styles.body, styles.topGap, { color: theme.colors.textMuted }]}>
          One policy can be active at a time. Selecting a card only previews it; confirming replaces the active choice.
        </Text>
        <View style={styles.chips}>
          <SemanticChip label={active ? 'Active · ' + active.name : activeId ? 'Active policy unavailable' : 'No active policy'} tone={active ? 'positive' : 'neutral'} />
          <SemanticChip label={commit.balance === null ? 'Balance unavailable' : commit.balance + ' Gold'} tone="currency" />
        </View>
        {scene ? <View style={styles.scene}>{scene}</View> : null}
      </GameCard>

      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.colors.text }]}>Policy choices</Text>
      {options.map(option => {
        const current = activeId === option.id;
        const selectedOption = selected?.id === option.id;
        const state: PolicyDisplayState = current ? 'active' : selectedOption ? 'preview' : 'available';
        const effectsSummary = policyEffectRows(option.effects, state).map(row => row.label + ': ' + row.value).join('. ');
        return (
          <DecisionOption
            key={option.id}
            title={option.name}
            subtitle={option.subtitle}
            selected={selectedOption}
            accessibilitySummary={(current ? 'Active policy. ' : selectedOption ? 'Preview, not active. ' : 'Not active. ') + option.description + '. ' + effectsSummary}
            onSelect={() => {
              setDraft({ id: option.id, against: activeId });
              setMessage(null);
            }}
          >
            <View style={styles.chips}>
              <SemanticChip label={current ? 'Active' : selectedOption ? 'Preview · not active' : 'Not active'} tone={current ? 'positive' : selectedOption ? 'blue' : 'neutral'} compact />
              {policyCategories(option.effects).map(category => <SemanticChip key={category.label} {...category} compact />)}
            </View>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{option.description}</Text>
            <PolicyEffectsList effects={option.effects} state={state} fallback={option.effectText} />
          </DecisionOption>
        );
      })}
      {!options.length ? <Text style={[styles.body, { color: theme.colors.textMuted }]}>No policy choices are available here. Return to Kingdom to continue the campaign.</Text> : null}
      {active && selected && selected.id !== active.id ? <PolicyReplacementPreview current={active} proposed={selected} /> : null}
      {selected && !commit.current ? (
        <EmphasisText mode="resources" text={commit.switching
          ? 'The switching cost is shown again at confirmation. Previewing does not spend Gold.'
          : 'The first selection costs 0 Gold. Future replacements use the listed switching cost.'}
          style={[styles.note, { color: theme.colors.textMuted }]}
        />
      ) : null}
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  art: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 11, lineHeight: 16, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 4 },
  sectionTitle: { fontSize: 17, lineHeight: 23, fontWeight: '900', marginTop: 8, marginBottom: 4 },
  body: { fontSize: 13, lineHeight: 19 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 9 },
  topGap: { marginTop: 8 },
  scene: { alignItems: 'center', marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  effects: { gap: 7 },
  effectRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 10, rowGap: 3 },
  effectLabel: { flexGrow: 1, flexShrink: 1, fontSize: 13, lineHeight: 19 },
  effectValue: { flexShrink: 1, fontSize: 14, lineHeight: 20, fontWeight: '900' },
  changeRow: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 8, gap: 4 },
  changeValues: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 }
});
