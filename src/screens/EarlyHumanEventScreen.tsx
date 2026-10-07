import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionCommit, DecisionIntro, DecisionLayout } from '../ui/DecisionUI';
import { EventIllustration, EventRewardPanel } from '../ui/CampaignEventUI';
import { GameCard, SecondaryButton } from '../ui/components';
import { SemanticChip } from '../ui/SemanticUI';
import { semanticColor } from '../ui/semanticColors';
import { BuildingSprite, EquipmentSprite, ResourceSiteSprite, StoryScene } from '../ui/gameArt';
import { getEarlyHumanEventView } from '../ui/earlyHumanEventPresentation';
import type { EarlyHumanEventId } from '../ui/earlyHumanEventPresentation';

export function EarlyHumanEventScreen({ eventId, onExit, onOpenForge }: {
  eventId: EarlyHumanEventId;
  onExit: () => void;
  onOpenForge?: () => void;
}) {
  const { theme } = useGameTheme();
  const game = useGame();
  const view = getEarlyHumanEventView(eventId, game);
  const identity = view?.identity ?? game.activeFaction + ':' + eventId;
  const [feedback, setFeedback] = useState<{ identity: string; text: string } | null>(null);
  const submitted = useRef<string | null>(null);
  const latest = useRef({ identity, view, game, onExit, onOpenForge });
  latest.current = { identity, view, game, onExit, onOpenForge };

  const leave = () => {
    if (latest.current.identity === identity) latest.current.onExit();
  };
  const resolve = () => {
    const current = latest.current;
    if (current.identity !== identity || !current.view?.canResolve || submitted.current === identity) return;
    submitted.current = identity;
    try {
      if (current.game[current.view.event.action]()) {
        setFeedback({ identity, text: 'Event accepted. The report will reflect the recorded rewards and unlocks.' });
        return;
      }
    } catch {
      // Only an accepted provider action may advance the report; rejection remains retryable.
    }
    submitted.current = null;
    setFeedback({ identity, text: 'The event was not completed. Check the campaign requirements and try again.' });
  };
  const openForge = () => {
    const current = latest.current;
    if (current.identity === identity && current.view?.completed && current.view.buildingUnlocked) current.onOpenForge?.();
  };

  if (!view) {
    return (
      <DecisionLayout footer={<DecisionCommit title="Human campaign event" label="Return to Campaign" onConfirm={leave} />}>
        <DecisionIntro eyebrow="EVENT UNAVAILABLE" title="Human campaign event" body="This report belongs to the Human campaign. No event rewards can be claimed from another faction." accent={semanticColor(theme, 'neutral')} />
      </DecisionLayout>
    );
  }

  const { event } = view;
  const forgeLink = view.completed && view.buildingUnlocked && eventId === 'marked_raiders' && Boolean(onOpenForge);
  const pending = !view.completed && submitted.current === identity;
  const confirmLabel = forgeLink ? view.buildingLevel > 0 ? 'View Field Forge in Kingdom' : 'Open Kingdom · build Field Forge'
    : view.completed || !view.canResolve ? 'Return to Campaign' : pending ? 'Updating event…' : event.actionLabel;

  return (
    <DecisionLayout footer={
      <DecisionCommit
        title={view.completed ? event.title + ' · recorded' : event.title}
        detail={view.completed
          ? 'Reopening this report cannot grant the reward again.'
          : 'No resource cost. Reading this preview grants nothing; confirming completes this event once.'}
        warning={!view.completed ? view.requirement : null}
        message={feedback?.identity === identity ? feedback.text : null}
        label={confirmLabel}
        disabled={pending}
        onConfirm={forgeLink ? openForge : view.completed || !view.canResolve ? leave : resolve}
      >
        {forgeLink || view.canResolve ? <SecondaryButton label={view.completed ? 'Return to Campaign' : 'Return without completing'} onPress={leave} /> : null}
      </DecisionCommit>
    }>
      <View style={styles.badges}>
        <SemanticChip label={event.purpose.label} tone={event.purpose.tone} />
        <SemanticChip label={view.status} tone={view.tone} />
      </View>
      <DecisionIntro eyebrow={'HUMAN CAMPAIGN · CHAPTER ' + event.chapter} title={event.title} body={event.body} accent={semanticColor(theme, event.purpose.tone)} />

      {eventId === 'marked_raiders' ? (
        <GameCard ornament={false}>
          <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>Evidence recovered from the road</Text>
          <View style={styles.evidenceRow}>
            <EquipmentSprite equipmentId="hum_iron_sword" faction="orc" size={40} />
            <View style={styles.copy}>
              <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Crude Orc clan marks</Text>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>Painted symbols combine marks that no real clan would normally use together.</Text>
            </View>
          </View>
          <View style={[styles.evidenceRow, styles.rule, { borderTopColor: theme.colors.border }]}>
            <EquipmentSprite equipmentId="hum_padded_armor" faction="human" size={40} />
            <View style={styles.copy}>
              <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Human-forged buckles</Text>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>Western Greenkeep workshop stamps remain under the paint. The equipment was assembled closer to home.</Text>
            </View>
          </View>
          <Text style={[styles.note, styles.spaced, { color: theme.colors.textMuted }]}>Evidence illustrations, not usable equipment rewards. The event recovers materials and records the clue.</Text>
        </GameCard>
      ) : null}

      {event.resources ? (
        <EventRewardPanel
          title={eventId === 'marked_raiders' ? 'Recovered materials' : 'Recovered stores'}
          kind="immediate"
          completed={view.completed}
          values={event.resources}
          detail={view.completed ? 'One-time event grant recorded. These amounts are not your current balance.' : 'Added once when you complete this event. These are reward amounts, not your current balance.'}
          note={eventId === 'refugee_camp' ? 'Provisions enter your resource balance. Welcoming the refugees does not restore Readiness, pack the wagon or create an Expedition ticket.' : 'No weapon, armor or crafting purchase is included. Crafting and equipping remain separate actions.'}
        />
      ) : null}

      {event.building ? (
        <GameCard ornament={false}>
          <View style={styles.evidenceRow}>
            <BuildingSprite buildingId={event.building.id} faction="human" size={44} />
            <View style={styles.copy}>
              <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>{event.building.name}</Text>
              <View style={styles.spaced}><SemanticChip label={view.buildingLabel} tone={view.buildingTone} /></View>
            </View>
          </View>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>{event.building.detail}</Text>
          <Text style={[styles.note, styles.spaced, { color: theme.colors.textMuted }]}>The status above is the current building state. A blueprint still needs a construction plot and materials; unlocking it is not a free building or upgrade.</Text>
        </GameCard>
      ) : null}

      {view.site ? (
        <EventRewardPanel
          title={view.site.name}
          kind="production"
          completed={view.completed}
          values={view.site.productionPerActivity}
          art={<ResourceSiteSprite siteId={view.site.id} faction="human" size={46} />}
          detail="Base production per eligible activity after securing this site."
          note="This is not an immediate Wood payout. Existing activity reward limits and production modifiers still apply. Collect accumulated regional stock in Kingdom. Securing the site does not construct a settlement building."
        />
      ) : null}

      {eventId === 'refugee_camp' ? <EventIllustration><StoryScene scene="refugee_camp" faction="human" size={236} /></EventIllustration> : null}
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5 },
  heading: { fontSize: 14.5, lineHeight: 19, fontWeight: '900' },
  rowTitle: { fontSize: 12, lineHeight: 16, fontWeight: '800' },
  body: { fontSize: 11.5, lineHeight: 16, marginTop: 5 },
  note: { fontSize: 10.5, lineHeight: 15 },
  evidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  copy: { flex: 1, minWidth: 0 },
  spaced: { marginTop: 6 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 }
});
