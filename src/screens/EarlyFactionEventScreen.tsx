import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionCommit, DecisionIntro, DecisionLayout } from '../ui/DecisionUI';
import { EventResolution, EventRewardPanel } from '../ui/CampaignEventUI';
import { SemanticChip } from '../ui/SemanticUI';
import { GameCard } from '../ui/components';
import { BuildingSprite, CampaignNodeSprite, FactionCrest, ResourceSiteSprite } from '../ui/gameArt';
import { getEarlyFactionEvent, getFactionEventState } from '../ui/factionEventPresentation';
import type { EarlyFactionEventRequest } from '../ui/factionEventPresentation';

export function EarlyFactionEventScreen({ request, onComplete }: {
  request: EarlyFactionEventRequest;
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction, chapterNumber, chapterNodes, buildings, buildingLevels, unlockedResourceSites,
    completeFactionChapterOneEvent, completeFactionChapterTwoEvent, completeFactionChapterThreeEvent
  } = useGame();
  const event = getEarlyFactionEvent(activeFaction, request);

  // Never turn an unexpected Human route into an Orc event or advance to a foreign encounter.
  if (!event) return (
    <DecisionLayout footer={<DecisionCommit title="Event unavailable" detail="Return using the Back control." label="Event unavailable" disabled />}>
      <DecisionIntro eyebrow="CAMPAIGN EVENT" title="Event unavailable" body="This event does not belong to the current faction or chapter route." accent={theme.colors.gold} />
    </DecisionLayout>
  );

  const { completed, canResolve } = getFactionEventState(chapterNodes, chapterNumber, event.chapter, event.nodeId);
  const factionName = event.faction === 'elf' ? 'ELVEN' : 'ORC';
  const accent = event.faction === 'elf' ? theme.colors.elf : theme.colors.orc;
  const building = event.buildingRole
    ? buildings.find(candidate => candidate.faction === event.faction && candidate.role === event.buildingRole) ?? null
    : null;
  const level = building ? buildingLevels[building.id] ?? 0 : 0;
  const siteUnlocked = Boolean(event.site && unlockedResourceSites.includes(event.site.id));
  const bossDefeated = Boolean(chapterNodes.find(node => node.id === event.bossNodeId)?.completed);

  const resolve = () => {
    if (!canResolve || completed) return false;
    if (request.chapter === 1) return completeFactionChapterOneEvent(request.stage);
    if (request.chapter === 2) return completeFactionChapterTwoEvent(request.stage);
    return completeFactionChapterThreeEvent(request.stage);
  };

  return (
    <EventResolution
      key={event.nodeId}
      completed={completed}
      canResolve={canResolve}
      title={event.title}
      label={event.actionLabel}
      continueLabel={event.continueLabel}
      onResolve={resolve}
      onContinue={onComplete}
    >
      <View style={styles.badges}>
        <FactionCrest faction={event.faction} size={40} />
        <SemanticChip {...event.purpose} />
        <SemanticChip label={completed ? 'Event recorded' : canResolve ? 'Current event · preview' : 'Event preview · locked'} tone={completed ? 'positive' : canResolve ? 'blue' : 'neutral'} />
      </View>
      <DecisionIntro eyebrow={factionName + ' · CHAPTER ' + event.chapter} title={event.title} body={event.body} accent={accent} />

      <EventRewardPanel
        title={event.stage === 'investigation' ? 'Recovered supplies' : 'Campaign stores'}
        kind="immediate"
        completed={completed}
        values={event.resources}
        detail={event.evidence ?? 'Granted once when this event is completed.'}
        note="One-time resources, separate from any recurring production. Viewing or reopening this report grants nothing."
        art={<CampaignNodeSprite type={event.stage === 'investigation' ? 'event' : 'supply'} faction={event.faction} active={canResolve} size={36} />}
      />

      {event.site ? (
        <EventRewardPanel
          title={event.site.name}
          kind="production"
          completed={siteUnlocked}
          values={event.site.productionPerActivity}
          detail="Base production per eligible activity after the site is unlocked."
          note="This is not an immediate payout. Modifiers may change the amount; collect accumulated stock in Kingdom."
          art={<ResourceSiteSprite siteId={event.site.id} faction={event.faction} size={46} />}
        />
      ) : null}

      {building ? (
        <GameCard ornament={false}>
          <View style={styles.badges}>
            <SemanticChip label={event.buildingRole === 'MOUNT' ? 'Mount infrastructure' : 'Supply infrastructure'} tone={event.buildingRole === 'MOUNT' ? 'cyan' : 'green'} compact />
            <SemanticChip
              label={level > 0 ? 'Built · Level ' + level : completed ? 'Blueprint unlocked · not built' : 'Blueprint preview'}
              tone={level > 0 || completed ? 'positive' : 'blue'}
              compact
            />
          </View>
          <View style={styles.panelHeader}>
            <BuildingSprite buildingId={building.id} faction={event.faction} size={44} />
            <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>{building.name}</Text>
          </View>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>
            {event.buildingRole === 'MOUNT'
              ? 'This council permits mount infrastructure; it does not grant a mounted squad. Construction, training and equipment requirements remain separate.'
              : 'The site permits this supply building. Unlocking its blueprint does not construct it or apply its building-level bonuses.'}
          </Text>
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>
            {level > 0 ? 'Current building level shown above. Further upgrades still use the existing Kingdom requirements.' : 'Choose a plot and pay construction costs separately in Settlement.'}
          </Text>
        </GameCard>
      ) : null}

      {event.expansion ? (
        <GameCard ornament={false}>
          <View style={styles.badges}>
            <SemanticChip label={completed ? 'Agreement recorded' : 'Agreement preview'} tone={completed ? 'positive' : 'blue'} />
            <SemanticChip label={bossDefeated ? 'Boss requirement completed' : 'Boss still required'} tone={bossDefeated ? 'positive' : 'warning'} />
          </View>
          <Text accessibilityRole="header" style={[styles.heading, styles.spaced, { color: theme.colors.text }]}>Road to {event.expansion.name}</Text>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>
            {bossDefeated
              ? 'The boss requirement is complete. Expansion still has its own costs and requirements in Kingdom.'
              : 'Defeat ' + event.expansion.boss + ' before expanding. Expansion costs and other requirements still apply in Kingdom.'}
          </Text>
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>Recording this agreement does not expand the settlement or increase army capacity.</Text>
        </GameCard>
      ) : null}
    </EventResolution>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  heading: { flex: 1, minWidth: 0, fontSize: 16, lineHeight: 22, fontWeight: '900' },
  spaced: { marginTop: 10, flex: 0 },
  body: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 8 }
});
