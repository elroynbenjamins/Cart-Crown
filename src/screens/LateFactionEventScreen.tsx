import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionIntro, DecisionLayout, DecisionStats } from '../ui/DecisionUI';
import { EventIllustration, EventResolution, EventRewardPanel } from '../ui/CampaignEventUI';
import { SemanticChip, SemanticText, UnitBadges } from '../ui/SemanticUI';
import { rolePresentation } from '../ui/semanticColors';
import { getFactionEventState } from '../ui/factionEventPresentation';
import { getLateFactionEvent, getSealReportStatus } from '../ui/lateFactionEventPresentation';
import type { LateFactionEventRequest } from '../ui/lateFactionEventPresentation';
import { GameCard, SecondaryButton } from '../ui/components';
import { CampaignNodeSprite, FactionCrest, ResourceSiteSprite, StoryScene, UnitSprite } from '../ui/gameArt';

export function LateFactionEventScreen({ request, onComplete }: {
  request: LateFactionEventRequest;
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction, chapterNumber, chapterNodes, units, formation,
    completedCampaigns, unlockedResourceSites,
    completeFactionChapterFourEvent, completeFactionChapterFiveEvent, completeFactionChapterSixEvent
  } = useGame();
  const event = getLateFactionEvent(activeFaction, request);
  if (!event) return (
    <DecisionLayout footer={<SecondaryButton label="Return to Campaign" onPress={onComplete} />}>
      <DecisionIntro eyebrow="CAMPAIGN EVENT" title="Event unavailable" body="This event belongs to an Elf or Orc campaign." accent={theme.colors.gold} />
    </DecisionLayout>
  );

  const { completed, canResolve } = getFactionEventState(chapterNodes, chapterNumber, event.chapter, event.nodeId);
  const accent = event.faction === 'elf' ? theme.colors.elf : theme.colors.orc;
  const factionName = event.faction === 'elf' ? 'ELVEN' : 'ORC';
  const siteUnlocked = Boolean(event.site && unlockedResourceSites.includes(event.site.id));
  const rosterUnit = event.reinforcement ? units.find(unit => unit.id === event.reinforcement?.id) ?? null : null;
  const displayedUnit = rosterUnit ?? event.reinforcement;
  const reinforcementRecorded = completed || Boolean(rosterUnit);
  const fielded = Boolean(rosterUnit && formation.includes(rosterUnit.id));
  const sealStatus = event.stage === 'seal' && (event.chapter === 5 || event.chapter === 6)
    ? getSealReportStatus(event.faction, event.chapter, completed, completedCampaigns)
    : null;
  const hasResources = Object.values(event.resources).some(amount => (amount ?? 0) !== 0);

  const resolve = () => {
    if (!canResolve || completed) return false;
    if (request.chapter === 4) return completeFactionChapterFourEvent(request.stage);
    if (request.chapter === 5) return completeFactionChapterFiveEvent(request.stage);
    return completeFactionChapterSixEvent(request.stage);
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
        <FactionCrest faction={event.faction} size={40} />
        <SemanticChip {...event.purpose} />
        <SemanticChip
          label={completed ? 'Event recorded' : canResolve ? 'Current event · preview' : 'Event preview · locked'}
          tone={completed ? 'positive' : canResolve ? 'blue' : 'neutral'}
        />
      </View>
      <DecisionIntro eyebrow={factionName + ' · CHAPTER ' + event.chapter} title={event.title} body={event.body} accent={accent} />

      {displayedUnit ? (
        <GameCard ornament={false}>
          <View style={styles.badges}>
            <SemanticChip label={reinforcementRecorded ? 'Reinforcement recorded' : 'Reinforcement preview'} tone={reinforcementRecorded ? 'positive' : 'blue'} />
            {rosterUnit ? <SemanticChip label={fielded ? 'Fielded' : 'In reserve'} tone={fielded ? 'cyan' : 'neutral'} /> : null}
          </View>
          <View style={styles.panelHeader}>
            <UnitSprite className={displayedUnit.className} faction={event.faction} size={48} />
            <View style={styles.copy}>
              <SemanticText tone={rolePresentation[displayedUnit.role]?.tone ?? 'neutral'} style={styles.heading}>
                {displayedUnit.name} · {displayedUnit.className}
              </SemanticText>
              <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                {reinforcementRecorded ? 'One campaign reinforcement; reopening this report does not grant another.' : 'One existing campaign reinforcement, granted when you confirm this muster.'}
              </Text>
            </View>
          </View>
          <View style={styles.spaced}>
            <UnitBadges role={displayedUnit.role} tier={displayedUnit.tier} battleTags={displayedUnit.battleTags} />
          </View>
          {!reinforcementRecorded && event.reinforcement ? (
            <>
              <Text style={[styles.note, { color: theme.colors.textMuted }]}>Recruitment stats before later equipment or training changes.</Text>
              <DecisionStats items={[
                { label: 'Level', value: event.reinforcement.level },
                { label: 'HP', value: event.reinforcement.hp },
                { label: 'Attack', value: event.reinforcement.attack },
                { label: 'Armor', value: event.reinforcement.armor },
                { label: 'Speed', value: event.reinforcement.speed }
              ]} />
            </>
          ) : <Text style={[styles.note, { color: theme.colors.textMuted }]}>Review current squad stats and equipment in Army.</Text>}
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>This adds a roster squad, not extra army capacity. The current formation and deployment limits still apply.</Text>
        </GameCard>
      ) : null}

      {hasResources ? (
        <EventRewardPanel
          title="Campaign stores"
          kind="immediate"
          completed={completed}
          values={event.resources}
          detail="Granted once when this event is completed."
          note="Separate from recurring production. These supplies do not automatically heal or resupply the army."
          art={<CampaignNodeSprite type="supply" faction={event.faction} active={canResolve} size={36} />}
        />
      ) : null}
      {event.site ? (
        <EventRewardPanel
          title={event.site.name}
          kind="production"
          completed={siteUnlocked}
          values={event.site.productionPerActivity}
          detail="Base production per eligible activity after the site is unlocked."
          note="Not an immediate payout. Production modifiers may change the amount; collect accumulated stock in Kingdom."
          art={<ResourceSiteSprite siteId={event.site.id} faction={event.faction} size={46} />}
        />
      ) : null}

      {event.lore ? (
        <GameCard ornament={false}>
          <SemanticChip label={completed ? 'Evidence recorded' : 'Evidence preview'} tone={completed ? 'positive' : 'violet'} />
          <Text accessibilityRole="header" style={[styles.heading, styles.spaced, { color: theme.colors.text }]}>{event.lore.title}</Text>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>{event.lore.detail}</Text>
          {!hasResources ? <Text style={[styles.note, { color: theme.colors.textMuted }]}>Story progress only: no immediate resource grant or army stat bonus from this event.</Text> : null}
        </GameCard>
      ) : null}
      {sealStatus ? (
        <GameCard ornament={false}>
          <SemanticChip label={sealStatus.label} tone={sealStatus.tone} />
          <Text accessibilityRole="header" style={[styles.heading, styles.spaced, { color: theme.colors.text }]}>Seal recovery</Text>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>{sealStatus.detail}</Text>
        </GameCard>
      ) : null}
      {event.stage === 'council' ? (
        <GameCard ornament={false}>
          <SemanticChip label="Mounted campaign support" tone="cyan" />
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>This council records support for the campaign. It does not grant a mounted squad, construct a building or equip a mount.</Text>
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>Veteran mount equipment and promotions retain their own building and equipment requirements. The next battle remains part of the campaign.</Text>
        </GameCard>
      ) : null}
      {event.chapter === 6 ? (
        <EventIllustration><StoryScene scene="crownspire" faction={event.faction} size={192} /></EventIllustration>
      ) : null}
    </EventResolution>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  copy: { flex: 1, minWidth: 0 },
  heading: { fontSize: 16, lineHeight: 22, fontWeight: '900', flexShrink: 1 },
  body: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  spaced: { marginTop: 10 }
});
