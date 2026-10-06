import React from 'react';
import { useGame } from '../game/GameProvider';
import { ChapterDecision } from '../ui/CampaignEventUI';
import { StoryCharacterPortrait, StoryScene } from '../ui/gameArt';

export function ThreeWarningsScreen({ onComplete }: { onComplete: () => void }) {
  const {
    activeFaction, chapterNumber, chapterNodes,
    marcherWarningChoices, marcherWarningChoiceId, chooseMarcherWarning
  } = useGame();

  return (
    <ChapterDecision
      key="human-rider-doctrine"
      eyebrow="MOUNTED DOCTRINE · CHAPTER 3"
      title="Choose Your Rider"
      body="The first Frostmarch rider is ready to specialize. Choose whether this mounted doctrine should favor impact, sustained melee or mobile scouting for the rest of Chapter 3."
      scope="Chapter 3 campaign battles only. This is a doctrine choice for the Frostmarch arc; later troop-branch systems can formalize permanent cavalry specialization."
      options={marcherWarningChoices}
      recordedId={marcherWarningChoiceId}
      canChoose={activeFaction === 'human' && chapterNumber === 3 && Boolean(chapterNodes.find(node => node.id === 'ch3_node_5')?.current)}
      onChoose={chooseMarcherWarning}
      continueLabel="Continue to The Line Buckles"
      onContinue={onComplete}
      portrait={<StoryCharacterPortrait role="officer" size={42} />}
      illustration={<StoryScene scene="grand_council" size={192} />}
    />
  );
}
