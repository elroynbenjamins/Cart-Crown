import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { humanResourceSites } from '../game/chapter2';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionIntro } from '../ui/DecisionUI';
import { EventResolution, EventRewardPanel } from '../ui/CampaignEventUI';
import { GameCard } from '../ui/components';
import { SemanticChip } from '../ui/SemanticUI';
import { BuildingSprite, ResourceSiteSprite } from '../ui/gameArt';

export function BrokenSignalTowerScreen({ onExit }: { onExit: () => void }) {
  const { theme } = useGameTheme();
  const {
    activeFaction, chapterNumber, chapterNodes, buildingLevels, kingdomDefenseCompleted,
    signalTowerUnlocked, completeBrokenSignalTower
  } = useGame();
  const quarry = humanResourceSites.find(site => site.id === 'old_quarry');
  const level = buildingLevels.signal_tower ?? 0;

  return (
    <EventResolution
      key="human-signal-tower"
      title="Restore the Signal Network"
      completed={signalTowerUnlocked}
      canResolve={activeFaction === 'human' && chapterNumber === 2 && kingdomDefenseCompleted && Boolean(chapterNodes.find(node => node.id === 'ch2_node_5')?.current)}
      label="Restore the Signal Network"
      continueLabel="Continue to The Iron Line"
      onResolve={completeBrokenSignalTower}
      onContinue={onExit}
    >
      <DecisionIntro
        eyebrow="IRON ROAD EVENT · CHAPTER 2"
        title="The Long Way Around"
        body="The direct road is too exposed to trust. Restoring the old frontier beacon opens a safer approach and gives Greenkeep enough warning to challenge the Iron Line ahead."
        accent={theme.colors.gold}
      />
      <EventRewardPanel
        title="Signal Tower blueprint"
        kind="blueprint"
        completed={signalTowerUnlocked}
        art={<BuildingSprite buildingId="signal_tower" faction="human" size={46} />}
        detail="Unlocks the placeable Signal Tower. Completing this event does not construct or upgrade the building."
        note="Build it in Settlement, then reach Level 2 to obtain detailed enemy information in Battle Prep from the tower."
      />
      <GameCard ornament={false}>
        <SemanticChip
          label={level >= 2 ? 'Tower Level ' + level + ' · intel requirement met' : level > 0 ? 'Tower Level ' + level + ' · upgrade needed for intel' : 'Signal Tower not built'}
          tone={level >= 2 ? 'positive' : level > 0 ? 'warning' : 'neutral'}
        />
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>This is the tower’s current state, not the blueprint preview. Other sources of scouting remain separate.</Text>
      </GameCard>
      {quarry ? (
        <EventRewardPanel
          title={quarry.name}
          kind="production"
          completed={signalTowerUnlocked}
          values={quarry.productionPerActivity}
          art={<ResourceSiteSprite siteId={quarry.id} faction="human" size={46} />}
          detail="Base production per eligible activity after the quarry joins the regional network."
          note="Unlocking the site is not an immediate Stone payout. Modifiers may change later output; collect accumulated production in Kingdom."
        />
      ) : null}
    </EventResolution>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 14, lineHeight: 20, marginTop: 8 }
});
