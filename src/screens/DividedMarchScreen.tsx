import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { marcherResourceSites } from '../game/chapter3';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionIntro } from '../ui/DecisionUI';
import { EventIllustration, EventResolution, EventRewardPanel } from '../ui/CampaignEventUI';
import { GameCard } from '../ui/components';
import { ResourceSiteSprite, StoryCharacterPortrait, StoryScene } from '../ui/gameArt';

export function DividedMarchScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useGameTheme();
  const { activeFaction, chapterNumber, chapterNodes, dividedMarchResolved, completeDividedMarch } = useGame();
  const depot = marcherResourceSites.find(site => site.id === 'marcher_depot');

  return (
    <EventResolution
      key="human-cold-roads"
      title="Prepare the Cold Roads"
      completed={dividedMarchResolved}
      canResolve={activeFaction === 'human' && chapterNumber === 3 && Boolean(chapterNodes.find(node => node.id === 'ch3_node_10')?.current)}
      label="Prepare the Cold Roads"
      continueLabel="March to Frostgate"
      onResolve={completeDividedMarch}
      onContinue={onComplete}
    >
      <DecisionIntro
        eyebrow="FROSTMARCH EVENT · CHAPTER 3"
        title="Cold Roads"
        body="With the Layered Host defeated, Greenkeep secures the cold-road depots before the Frostgate assault. The army can now recover supplies without turning this preparation beat into mandatory grinding."
        accent={theme.colors.human}
      />
      <GameCard ornament={false}>
        <StoryCharacterPortrait role="delegate" size={46} />
        <Text style={[styles.heading, { color: theme.colors.text }]}>Shared stores</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>Quartermasters consolidate provisions and regional stores so the final Frostmarch battle begins with a prepared roster instead of an exhausted one.</Text>
      </GameCard>
      <EventRewardPanel
        title="Campaign stores"
        kind="immediate"
        completed={dividedMarchResolved}
        values={{ gold: 40, provisions: 10 }}
        detail="A one-time grant when the captains unite."
        note="These resources are separate from the depot’s recurring production. Reopening the report grants nothing again."
      />
      {depot ? (
        <EventRewardPanel
          title={depot.name}
          kind="production"
          completed={dividedMarchResolved}
          values={depot.productionPerActivity}
          art={<ResourceSiteSprite siteId={depot.id} faction="human" size={46} />}
          detail="Base production per eligible activity after the site is unlocked."
          note="This is not an immediate payout. Production modifiers may change the amount; collect accumulated stock in Kingdom."
        />
      ) : null}
      <GameCard ornament={false}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>Frostgate is next</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>The remaining Frostmarch host has withdrawn behind Frostgate. Its final defense combines layered depth, mounted pressure and protected ranged units.</Text>
      </GameCard>
      <EventIllustration><StoryScene scene="grand_council" size={192} /></EventIllustration>
    </EventResolution>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 16, lineHeight: 22, fontWeight: '900', marginTop: 6 },
  body: { fontSize: 14, lineHeight: 20, marginTop: 6 }
});
