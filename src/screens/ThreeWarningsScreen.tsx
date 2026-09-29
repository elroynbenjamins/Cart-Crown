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
      key="human-three-warnings"
      eyebrow="BORDER INTELLIGENCE · CHAPTER 3"
      title="Three Warnings"
      body="Three marcher authorities sent contradictory warnings. You cannot verify every report before the Siege Road closes, so your army must choose how it will operate."
      scope="Siege Road and Lord Marshal Veyr. The choice is locked for this event; it is not a permanent army upgrade or a side-mode bonus."
      options={marcherWarningChoices}
      recordedId={marcherWarningChoiceId}
      canChoose={activeFaction === 'human' && chapterNumber === 3 && Boolean(chapterNodes.find(node => node.id === 'ch3_node_3')?.current)}
      onChoose={chooseMarcherWarning}
      continueLabel="Continue to Siege Road"
      onContinue={onComplete}
      portrait={<StoryCharacterPortrait role="officer" size={42} />}
      illustration={<StoryScene scene="grand_council" size={192} />}
    />
  );
}
