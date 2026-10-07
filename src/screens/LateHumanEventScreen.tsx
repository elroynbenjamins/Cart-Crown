import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionIntro } from '../ui/DecisionUI';
import { EventIllustration, EventResolution, EventRewardPanel } from '../ui/CampaignEventUI';
import { GameCard } from '../ui/components';
import { SemanticChip, SemanticText } from '../ui/SemanticUI';
import { FactionCrest, ResourceSiteSprite, StoryCharacterPortrait, StoryScene, WagonStageSprite } from '../ui/gameArt';
import { getHumanOathSealStatus, getLateHumanEvent, getLateHumanEventState } from '../ui/lateHumanEventPresentation';
import type { LateHumanEventId } from '../ui/lateHumanEventPresentation';

export function LateHumanEventScreen({ eventId, onComplete }: {
  eventId: LateHumanEventId;
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const game = useGame();
  const {
    activeFaction, chapterNumber, chapterNodes, unlockedResourceSites,
    completedCampaigns, activeRoyalDecree, metaCampaignUnlocked, metaCampaignComplete
  } = game;
  const event = getLateHumanEvent(eventId);

  if (!event || activeFaction !== 'human') {
    return (
      <View style={styles.unavailable}>
        <DecisionIntro
          eyebrow="HUMAN CAMPAIGN"
          title="Event unavailable"
          body="Open this event from its Human campaign chapter. No rewards or progress have been changed."
          accent={theme.colors.textMuted}
        />
      </View>
    );
  }

  const { completed, canResolve } = getLateHumanEventState(activeFaction, chapterNumber, chapterNodes, eventId);
  const siteUnlocked = Boolean(event.site && unlockedResourceSites.includes(event.site.id));
  const seal = event.showSeal ? getHumanOathSealStatus(completed, completedCampaigns) : null;
  const resolve = () => {
    if (!canResolve || completed) return false;
    return game[event.action]();
  };

  return (
    <EventResolution
      key={event.nodeId}
      title={event.title}
      completed={completed}
      canResolve={canResolve}
      label={event.actionLabel}
      continueLabel={event.continueLabel}
      onResolve={resolve}
      onContinue={onComplete}
    >
      <View style={styles.badges}>
        <FactionCrest faction="human" size={40} />
        <SemanticChip {...event.purpose} />
        <SemanticChip
          label={completed ? 'Event recorded' : canResolve ? 'Current event · preview' : 'Event preview · locked'}
          tone={completed ? 'positive' : canResolve ? 'blue' : 'neutral'}
        />
      </View>
      <DecisionIntro eyebrow={'HUMAN · CHAPTER ' + event.chapter} title={event.title} body={event.body} accent={theme.colors.human} />

      {event.findings.length > 0 ? (
        <GameCard ornament={false}>
          <SemanticChip label={completed ? 'Evidence recorded' : 'Evidence preview'} tone={completed ? 'positive' : 'violet'} />
          {event.findings.map(finding => (
            <View key={finding.title} style={styles.finding}>
              <View style={styles.panelHeader}>
                {finding.portrait === 'human' ? <FactionCrest faction="human" size={40} /> : null}
                {finding.portrait === 'ashen' ? <StoryCharacterPortrait role="ashen" size={44} /> : null}
                <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>{finding.title}</Text>
              </View>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>{finding.detail}</Text>
            </View>
          ))}
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>
            Recording evidence advances this event. It does not apply an army stat bonus or grant resources immediately.
          </Text>
        </GameCard>
      ) : null}

      {event.resources ? (
        <EventRewardPanel
          title="Final provisioning"
          kind="immediate"
          completed={completed}
          values={event.resources}
          detail="Granted once when the Grand Council is completed."
          note="Added to your resource balance, not to production stock. These provisions do not automatically restore Readiness or pack the wagon."
          art={<WagonStageSprite stageId="grand" faction="human" size={48} />}
        />
      ) : null}

      {event.site ? (
        <EventRewardPanel
          title={event.site.name}
          kind="production"
          completed={siteUnlocked}
          values={event.site.productionPerActivity}
          detail="Base production per eligible activity after this site is unlocked."
          note="This is recurring output, not an immediate payout. Modifiers may change the amount; collect accumulated stock in Kingdom."
          art={<ResourceSiteSprite siteId={event.site.id} faction="human" size={46} />}
        />
      ) : null}

      {event.showDecree ? (
        <GameCard ornament={false}>
          <View style={styles.badges}>
            <SemanticChip label="Royal Decree · unchanged" tone="violet" />
            <SemanticChip label={activeRoyalDecree ? 'Currently active' : 'None selected'} tone={activeRoyalDecree ? 'positive' : 'neutral'} />
          </View>
          <View style={styles.panelHeader}>
            <StoryCharacterPortrait role="delegate" size={44} />
            <SemanticText tone="violet" style={styles.heading}>{activeRoyalDecree?.name ?? 'No Royal Decree selected'}</SemanticText>
          </View>
          {activeRoyalDecree ? <Text style={[styles.body, { color: theme.colors.text }]}>{activeRoyalDecree.effectText}</Text> : null}
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>
            {activeRoyalDecree
              ? 'Your existing decree remains active. This council does not replace it, charge a switching fee or stack another copy of its bonuses.'
              : 'This council does not choose a Royal Decree for you. Policy selection and its requirements remain separate.'}
          </Text>
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>The policy shown is your current choice, not a historical snapshot saved by this event.</Text>
        </GameCard>
      ) : null}

      {seal ? (
        <>
          <GameCard ornament={false}>
            <SemanticChip label={seal.label} tone={seal.tone} />
            <Text accessibilityRole="header" style={[styles.heading, styles.standalone, { color: theme.colors.text }]}>Human Oath Seal</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{seal.detail}</Text>
          </GameCard>
          <GameCard ornament={false}>
            <SemanticChip
              label={metaCampaignComplete ? 'Three Seals completed' : metaCampaignUnlocked ? 'Three Seals available' : 'Three Seals locked'}
              tone={metaCampaignComplete ? 'positive' : metaCampaignUnlocked ? 'blue' : 'neutral'}
            />
            <Text accessibilityRole="header" style={[styles.heading, styles.standalone, { color: theme.colors.text }]}>The shared campaign</Text>
            <View style={[styles.badges, styles.spaced]}>
              {(['human', 'elf', 'orc'] as const).map(faction => {
                const recovered = completedCampaigns.includes(faction);
                const name = faction === 'human' ? 'Oath Seal' : faction === 'elf' ? 'Root Seal' : 'Clan Seal';
                return <SemanticChip key={faction} label={name + (recovered ? ' · recovered' : ' · not recovered')} tone={recovered ? 'positive' : 'neutral'} compact />;
              })}
            </View>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              {metaCampaignComplete
                ? 'The shared campaign is already complete. Reopening this report grants no further rewards.'
                : metaCampaignUnlocked
                  ? 'The shared campaign is available in Campaign. This report does not start or complete it.'
                  : 'Complete the Human, Elf and Orc campaigns to unlock Three Seals. Discovering this evidence is not a substitute for their final battles.'}
            </Text>
          </GameCard>
        </>
      ) : null}

      <EventIllustration>
        <StoryScene scene={event.scene} faction="human" size={236} />
        {eventId === 'royal_ledger' ? <StoryScene scene="crownspire" faction="human" size={160} /> : null}
      </EventIllustration>
    </EventResolution>
  );
}

const styles = StyleSheet.create({
  unavailable: { padding: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, alignItems: 'center' },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  heading: { flex: 1, minWidth: 0, fontSize: 14.5, lineHeight: 19, fontWeight: '900' },
  standalone: { marginTop: 8, flex: 0 },
  finding: { marginTop: 4 },
  spaced: { marginTop: 8 },
  body: { fontSize: 11.5, lineHeight: 16, marginTop: 6 },
  note: { fontSize: 10.5, lineHeight: 15, marginTop: 6 }
});
