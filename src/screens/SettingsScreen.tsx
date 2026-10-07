import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getTacticalGuidanceFeatures,
  requiresSeverePreparationConfirmation,
  tacticalGuidanceOptions
} from '../game/tacticalGuidance';
import type { TacticalGuidanceLevel } from '../game/tacticalGuidance';
import { factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import { usePreferences } from '../preferences/PreferencesProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SecondaryButton } from '../ui/components';
import { DecisionIntro } from '../ui/DecisionUI';
import { SemanticChip } from '../ui/SemanticUI';
import { semanticColor } from '../ui/semanticColors';

type ResetRequest = { historyKey: string; serial: number };
type ResetFeedback = { faction: string; historyKey: string; failed: boolean };

export function SettingsScreen() {
  const { theme } = useGameTheme();
  const preferences = usePreferences();
  const game = useGame();
  const { tacticalGuidance } = preferences;
  const { activeFaction, tutorialSeen } = game;
  const factionName = factions[activeFaction].name;
  const historyKey = JSON.stringify([activeFaction, tutorialSeen]);
  const recordedCount = new Set(tutorialSeen).size;
  const [expanded, setExpanded] = useState(false);
  const [request, setRequest] = useState<ResetRequest | null>(null);
  const [resetFeedback, setResetFeedback] = useState<ResetFeedback | null>(null);
  const [guidanceFeedback, setGuidanceFeedback] = useState<string | null>(null);
  const alive = useRef(true);
  const serial = useRef(0);
  const requestRef = useRef<ResetRequest | null>(null);
  const submittedReset = useRef<string | null>(null);
  const pendingGuidance = useRef<{ from: TacticalGuidanceLevel; to: TacticalGuidanceLevel } | null>(null);
  const latest = useRef({ game, preferences, historyKey });
  latest.current = { game, preferences, historyKey };

  // A prompt never follows the player into a different faction or changed tutorial history.
  if (requestRef.current && requestRef.current.historyKey !== historyKey) requestRef.current = null;
  if (pendingGuidance.current && pendingGuidance.current.from !== tacticalGuidance) pendingGuidance.current = null;
  const confirmingReset = request !== null && requestRef.current === request && request.historyKey === historyKey;
  const resetPending = submittedReset.current === historyKey;
  const activeOption = tacticalGuidanceOptions.find(option => option.id === tacticalGuidance)!;
  const features = getTacticalGuidanceFeatures(tacticalGuidance);
  const featureRows = [
    { label: 'Scout fit scores', enabled: features.showFitScores },
    { label: 'Counter hints', enabled: features.showCounterHints },
    { label: 'Loadouts sorted by fit', enabled: features.sortLoadoutsByFit },
    { label: 'Recommended loadout', enabled: features.showRecommendedLoadout },
    { label: 'Adjustment checklist', enabled: features.showAdjustmentChecklist },
    { label: 'Guided fix actions', enabled: features.allowGuidedActions },
    { label: 'Severely Underprepared launch confirmation', enabled: requiresSeverePreparationConfirmation(tacticalGuidance, 'severely_underprepared') }
  ];

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; requestRef.current = null; };
  }, []);

  const selectGuidance = (level: TacticalGuidanceLevel) => {
    if (!alive.current || latest.current.preferences.tacticalGuidance !== tacticalGuidance || level === tacticalGuidance) return;
    if (pendingGuidance.current?.from === tacticalGuidance && pendingGuidance.current.to === level) return;
    pendingGuidance.current = { from: tacticalGuidance, to: level };
    try {
      latest.current.preferences.setTacticalGuidance(level);
      // Do not claim disk persistence; PreferencesProvider owns that operation.
      setGuidanceFeedback('Guidance updated. Combat difficulty is unchanged.');
    } catch {
      pendingGuidance.current = null;
      setGuidanceFeedback('Guidance could not be changed. Please try again.');
    }
  };
  const cancelReset = () => {
    if (!alive.current || requestRef.current !== request) return;
    requestRef.current = null;
    setRequest(null);
  };
  const reviewReset = () => {
    if (!alive.current || latest.current.historyKey !== historyKey || !recordedCount || resetPending) return;
    const next = { historyKey, serial: ++serial.current };
    requestRef.current = next;
    setRequest(next);
    setResetFeedback(null);
  };
  const confirmReset = () => {
    if (!alive.current || !request || requestRef.current !== request || latest.current.historyKey !== request.historyKey || submittedReset.current === historyKey) return;
    requestRef.current = null;
    submittedReset.current = historyKey;
    setRequest(null);
    try {
      latest.current.game.resetTutorialGuidance();
      setResetFeedback({ faction: activeFaction, historyKey, failed: false });
    } catch {
      submittedReset.current = null;
      setResetFeedback({ faction: activeFaction, historyKey, failed: true });
    }
  };
  const resetMessage = resetFeedback?.faction !== activeFaction ? null
    : resetFeedback.failed ? 'Tutorial history could not be reset. Please try again.'
      : recordedCount === 0 ? 'Tutorial history cleared. Lessons return as their conditions are met.'
        : resetFeedback.historyKey === historyKey ? 'Updating tutorial history…'
          : 'Tutorial history has changed. Review it again before replaying lessons.';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <DecisionIntro eyebrow="GAMEPLAY PREFERENCES" title="Guidance & tutorials"
        body="Choose how much tactical help you see. Guidance does not change enemy strength, rewards or progression."
        accent={semanticColor(theme, 'blue')} />

      <View style={styles.sectionHeader}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.colors.text }]}>Tactical Guidance</Text>
        <SemanticChip label="App-wide" tone="blue" compact />
      </View>
      <GameCard ornament={false}>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>Tap to apply. No separate Save button is needed.</Text>
        <View style={styles.choices}>
          {tacticalGuidanceOptions.map(option => {
            const selected = option.id === tacticalGuidance;
            return (
              <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ checked: selected }}
                accessibilityLabel={option.name + '. ' + option.summary + (option.id === 'standard' ? ' Recommended default.' : '')}
                accessibilityHint={selected ? 'This mode is active.' : 'Applies this guidance mode immediately.'}
                onPress={() => selectGuidance(option.id)}
                style={({ pressed }) => [styles.choice, {
                  backgroundColor: selected ? theme.colors.surface2 : 'transparent',
                  borderColor: selected ? semanticColor(theme, 'currency') : theme.colors.border,
                  opacity: pressed ? 0.86 : 1
                }]}>
                <View accessible={false} style={[styles.radio, { borderColor: selected ? semanticColor(theme, 'currency') : theme.colors.textMuted }]}>
                  {selected ? <View style={[styles.radioDot, { backgroundColor: semanticColor(theme, 'currency') }]} /> : null}
                </View>
                <View style={styles.choiceCopy}>
                  <Text style={[styles.choiceName, { color: theme.colors.text }]}>{option.name}</Text>
                  <Text style={[styles.body, { color: theme.colors.textMuted }]}>{option.summary}</Text>
                  {selected || option.id === 'standard' ? (
                    <View style={styles.badges}>
                      {selected ? <SemanticChip label="Active" tone="positive" compact /> : null}
                      {option.id === 'standard' ? <SemanticChip label="Recommended default" tone="blue" compact /> : null}
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel="Guidance details"
          onPress={() => setExpanded(value => !value)}
          style={({ pressed }) => [styles.disclosure, { borderTopColor: theme.colors.border, opacity: pressed ? 0.86 : 1 }]}>
          <Text style={[styles.disclosureText, { color: semanticColor(theme, 'blue') }]}>{expanded ? 'Hide' : 'View'} {activeOption.name} details</Text>
          <Text accessible={false} style={[styles.disclosureMark, { color: theme.colors.textMuted }]}>{expanded ? '−' : '+'}</Text>
        </Pressable>
        {expanded ? (
          <View style={styles.details}>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{activeOption.detail}</Text>
            {featureRows.map(row => (
              <View key={row.label} style={styles.featureRow}>
                <Text style={[styles.featureLabel, { color: theme.colors.text }]}>{row.label}</Text>
                <SemanticChip label={row.enabled ? 'On' : 'Off'} tone={row.enabled ? 'blue' : 'neutral'} compact />
              </View>
            ))}
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>Scouting and unlock requirements still apply. Guidance never automatically equips, deploys or spends for you.</Text>
          </View>
        ) : null}
        {guidanceFeedback ? <Text accessibilityLiveRegion="polite" style={[styles.feedback, { color: theme.colors.text }]}>{guidanceFeedback}</Text> : null}
      </GameCard>

      <View style={styles.sectionHeader}>
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.colors.text }]}>Tutorial replay</Text>
        <SemanticChip label={factionName + ' · This save'} tone="cyan" compact />
      </View>
      <GameCard ornament={false}>
        <Text style={[styles.choiceName, { color: theme.colors.text }]}>First-time & unlock lessons</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>{recordedCount} tutorial {recordedCount === 1 ? 'record' : 'records'}. Replay clears only this faction's lesson history, not campaign progress.</Text>
        {confirmingReset ? (
          <View style={[styles.resetPanel, { borderColor: semanticColor(theme, 'warning'), backgroundColor: theme.colors.surface2 }]}>
            <SemanticChip label="Confirmation required" tone="warning" compact />
            <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={[styles.choiceName, { color: theme.colors.text }]}>Replay {factionName} tutorials?</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>Lessons reappear when their normal conditions are met. Your army, equipment, resources, campaign progress and guidance setting stay unchanged.</Text>
            <SecondaryButton label="Keep tutorial history" onPress={cancelReset} />
            <PrimaryButton label="Confirm tutorial replay" onPress={confirmReset} />
          </View>
        ) : (
          <View style={styles.resetAction}>
            <SecondaryButton label={resetPending ? 'Updating tutorial history…' : 'Review tutorial replay'} disabled={!recordedCount || resetPending} onPress={reviewReset} />
            {!recordedCount ? <Text style={[styles.note, { color: theme.colors.textMuted }]}>No recorded lessons to reset. New lessons appear as you reach their unlocks.</Text> : null}
          </View>
        )}
        {resetMessage ? <Text accessibilityLiveRegion="polite" style={[styles.feedback, { color: theme.colors.text }]}>{resetMessage}</Text> : null}
      </GameCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 24, gap: 9 },
  sectionHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, lineHeight: 19, fontWeight: '900', flexGrow: 1 },
  choices: { gap: 6, marginTop: 8 },
  choice: { minHeight: 48, borderWidth: 1, borderRadius: 10, padding: 9, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  choiceCopy: { flex: 1, minWidth: 0, gap: 3 },
  choiceName: { fontSize: 13.5, lineHeight: 17, fontWeight: '900' },
  body: { fontSize: 11, lineHeight: 15 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  disclosure: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, marginTop: 9, paddingVertical: 8 },
  disclosureText: { flex: 1, minWidth: 0, fontSize: 12, lineHeight: 16, fontWeight: '800' },
  disclosureMark: { fontSize: 20, lineHeight: 24, width: 24, textAlign: 'center' },
  details: { gap: 7 },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  featureLabel: { flex: 1, minWidth: 120, fontSize: 11, lineHeight: 15 },
  note: { fontSize: 10.5, lineHeight: 15 },
  resetPanel: { marginTop: 9, padding: 9, gap: 7, borderRadius: 10, borderWidth: 1 },
  resetAction: { marginTop: 9, gap: 6 },
  feedback: { marginTop: 8, fontSize: 11, lineHeight: 15, fontWeight: '700' }
});
