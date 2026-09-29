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
      key="human-last-loyalists"
      eyebrow="CROWNROAD DECISION · CHAPTER 4"
      title="The Last Loyalists"
      body="The captured officers finally accept that no living monarch is issuing their orders. A smaller loyalist force still guards the Pretender General, and Greenkeep must decide how to break that final allegiance."
      scope="The Pretender General encounter only, including a rematch. This recorded approach cannot be switched here and does not alter other encounters."
      options={lastLoyalistChoices}
      recordedId={lastLoyalistsChoiceId}
      canChoose={activeFaction === 'human' && chapterNumber === 4 && Boolean(chapterNodes.find(node => node.id === 'ch4_node_5')?.current)}
      onChoose={chooseLastLoyalistsApproach}
      continueLabel="Confront the Pretender General"
      onContinue={onComplete}
      portrait={<StoryCharacterPortrait role="officer" size={42} />}
      illustration={<StoryScene scene="grand_council" size={192} />}
    />
  );
}
