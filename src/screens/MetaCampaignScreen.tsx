import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { getAllianceNames } from '../game/metaCampaign';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, SecondaryButton } from '../ui/components';
import { DecisionCommit, DecisionIntro, DecisionLayout, DecisionStats } from '../ui/DecisionUI';
import { CampaignStageList } from '../ui/CampaignStageList';
import { EventIllustration } from '../ui/CampaignEventUI';
import { SemanticChip } from '../ui/SemanticUI';
import { getMetaCampaignView, metaAlliancePreview } from '../ui/metaCampaignPresentation';
import { FactionCrest, StoryScene } from '../ui/gameArt';

export function MetaCampaignScreen({ onStartConvergence, onStartTriumvirate, onStartFinalBoss, onExit }: {
  onStartConvergence: () => void;
  onStartTriumvirate: () => void;
  onStartFinalBoss: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction, completedCampaigns, metaCampaignUnlocked, metaCampaignStep,
    metaCampaignComplete, completeMetaCouncil, completeMetaConcordChamber
  } = useGame();
  const view = getMetaCampaignView({ completedCampaigns, metaCampaignUnlocked, metaCampaignStep, metaCampaignComplete });
  const lead = factions[activeFaction];
  const allies = getAllianceNames(activeFaction);
  const accent = activeFaction === 'elf' ? theme.colors.elf : activeFaction === 'orc' ? theme.colors.orc : theme.colors.human;
  const identity = [activeFaction, metaCampaignStep, metaCampaignComplete, metaCampaignUnlocked, ...view.seals.map(seal => seal.recovered)].join(':');
  const liveIdentity = useRef(identity);
  liveIdentity.current = identity;
  const submitted = useRef<string | null>(null);
  const [feedback, setFeedback] = useState<{ identity: string; text: string } | null>(null);

  const proceed = () => {
    // Old event handlers and rapid taps must not bypass a changed faction, gate or stage.
    if (!view.playable || !view.action || liveIdentity.current !== identity || submitted.current === identity) return;
    submitted.current = identity;
    setFeedback(null);
    try {
      let accepted = true;
      switch (view.action) {
        case 'council': accepted = completeMetaCouncil(); break;
        case 'chamber': accepted = completeMetaConcordChamber(); break;
        case 'convergence': onStartConvergence(); break;
        case 'triumvirate': onStartTriumvirate(); break;
        case 'finalBoss': onStartFinalBoss(); break;
      }
      if (accepted) return;
    } catch {
      // Keep failed actions retryable and never report success or advance locally.
    }
    submitted.current = null;
    setFeedback({ identity, text: 'This objective could not be continued. Check the current campaign state and try again.' });
  };

  return (
    <DecisionLayout footer={
      <DecisionCommit
        title={view.title}
        detail={!view.playable
          ? view.complete ? 'All five stages are complete. No rewards are granted by reopening this report.' : 'Return to Campaign to review the unlock requirements.'
          : view.isBattle
            ? 'Opens Battle Prep for this objective. Review your army there before starting the fight.'
            : 'Records this event only. No resource reward, recovery or battle victory is granted here.'}
        message={feedback?.identity === identity ? feedback.text : null}
        label={view.actionLabel}
        onConfirm={view.playable ? proceed : onExit}
      >
        {view.playable ? <SecondaryButton label="Return without advancing" onPress={onExit} /> : null}
      </DecisionCommit>
    }>
      <View style={styles.badges}>
        <SemanticChip label={view.complete ? 'Shared campaign completed' : view.playable ? 'Shared campaign available' : view.unlocked ? 'Progress needs review' : 'Shared campaign locked'} tone={view.tone} />
        <SemanticChip label={view.recovered + '/3 Seals recovered'} tone={view.recovered === 3 ? 'positive' : 'neutral'} />
      </View>
      <DecisionIntro
        eyebrow="SHARED ENDGAME"
        title="Three Seals"
        body={view.complete
          ? 'The Concord Beacon has been restored under all three Seals.'
          : 'Bring the Human Oath Seal, Elven Root Seal and Orc Clan Seal together. Your selected faction leads the shared campaign; the other two provide alliance support.'}
        accent={accent}
      />
      <GameCard ornament={false}>
        <View style={styles.badges}>
          <SemanticChip label={view.complete ? '5/5 stages complete' : view.playable ? view.completedCount + '/5 stages complete' : 'Progression locked'} tone={view.tone} />
          {view.playable ? <SemanticChip label={view.isBattle ? 'Battle preparation next' : 'Council event'} tone={view.isBattle ? 'blue' : 'violet'} compact /> : null}
        </View>
        <Text accessibilityRole="header" style={[styles.heading, styles.spaced, { color: theme.colors.text }]}>{view.title}</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>{view.summary}</Text>
      </GameCard>
      <CampaignStageList key={identity} rows={view.rows} currentId={view.currentId} />

      <GameCard ornament={false}>
        <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>Recovered Seals</Text>
        {view.seals.map(seal => (
          <View key={seal.faction} style={[styles.sealRow, { borderTopColor: theme.colors.border }]}>
            <FactionCrest faction={seal.faction} size={34} />
            <View style={styles.copy}>
              <Text style={[styles.rowTitle, { color: theme.colors.text }]}>{seal.name}</Text>
              <Text style={[styles.note, { color: theme.colors.textMuted }]}>{seal.people}</Text>
              <View style={styles.status}>
                <SemanticChip label={seal.recovered ? 'Recovered' : 'Not recovered'} tone={seal.recovered ? 'positive' : 'neutral'} compact />
              </View>
            </View>
          </View>
        ))}
        <Text style={[styles.note, styles.spaced, { color: theme.colors.textMuted }]}>Each Seal is recorded by completing its faction campaign. Viewing this list does not grant one.</Text>
      </GameCard>

      <GameCard ornament={false}>
        <View style={styles.leadRow}>
          <FactionCrest faction={activeFaction} size={40} />
          <View style={styles.copy}>
            <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>{lead.name}</Text>
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>{view.complete ? 'Currently selected faction' : 'Current lead army'}</Text>
          </View>
        </View>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>Allies: {allies.join(' + ')}.</Text>
        <View style={[styles.badges, styles.spaced]}>
          <SemanticChip label="Alliance support" tone="cyan" />
          <SemanticChip label="Three Seals battles only" tone="neutral" compact />
        </View>
        <DecisionStats presentation="multiplier" items={[
          { label: 'Alliance attack', value: '×' + metaAlliancePreview.attackMultiplier.toFixed(2) },
          { label: 'Alliance armor', value: '×' + metaAlliancePreview.armorMultiplier.toFixed(2) }
        ]} />
        <Text style={[styles.note, styles.spaced, { color: theme.colors.textMuted }]}>Applies in Converging Roads, Ashen Triumvirate and The Unbound Beacon. These contributions are not permanent squad upgrades, final army totals or additional roster units.</Text>
        <Text style={[styles.note, styles.spaced, { color: theme.colors.textMuted }]}>To change the lead army, return to Campaign and switch factions. This report uses the currently selected faction, not a saved record of who led earlier battles.</Text>
      </GameCard>
      <EventIllustration>
        <StoryScene scene="crownspire" faction={activeFaction} size={240} />
      </EventIllustration>
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  heading: { fontSize: 16, lineHeight: 22, fontWeight: '900' },
  body: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  note: { fontSize: 12, lineHeight: 18 },
  spaced: { marginTop: 10 },
  copy: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 14, lineHeight: 20, fontWeight: '800' },
  sealRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  status: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  leadRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }
});
