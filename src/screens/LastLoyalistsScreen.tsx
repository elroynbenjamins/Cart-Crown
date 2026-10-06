import React from 'react';
import { useGame } from '../game/GameProvider';
import { ChapterDecision } from '../ui/CampaignEventUI';
import { StoryCharacterPortrait, StoryScene } from '../ui/gameArt';

export function LastLoyalistsScreen({ onComplete }: { onComplete: () => void }) {
  const {
    activeFaction, chapterNumber, chapterNodes,
    lastLoyalistChoices, lastLoyalistsChoiceId, chooseLastLoyalistsApproach
  } = useGame();

  return (
    <ChapterDecision
      key="human-forked-banner"
      eyebrow="REGIONAL PRIORITY · CHAPTER 4"
      title="The Forked Banner"
      body="Greywatch can be approached through more than one strategic route. Choose which preparation advantage arrives first before the final siege; the other route is not permanently lost."
      scope="Siege of Greywatch only. This priority choice shapes the final Chapter 4 approach without permanently locking the campaign away from the other regional options."
      options={lastLoyalistChoices}
      recordedId={lastLoyalistsChoiceId}
      canChoose={activeFaction === 'human' && chapterNumber === 4 && Boolean(chapterNodes.find(node => node.id === 'ch4_node_10')?.current)}
      onChoose={chooseLastLoyalistsApproach}
      continueLabel="March on Greywatch"
      onContinue={onComplete}
      portrait={<StoryCharacterPortrait role="officer" size={42} />}
      illustration={<StoryScene scene="grand_council" size={192} />}
    />
  );
}
