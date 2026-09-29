import React from 'react';
import { useGame } from '../game/GameProvider';
import { PolicyDecision } from '../ui/PolicyDecision';
import { FactionCrest, StoryScene } from '../ui/gameArt';

export function RoyalDecreesScreen({ onExit }: { onExit: () => void }) {
  const {
    resources, royalDecrees, royalDecreeId,
    royalDecreeSwitchCost, chooseRoyalDecree
  } = useGame();

  return (
    <PolicyDecision
      key="royal-decrees"
      title="Royal Decrees"
      eyebrow="CAPITAL ADMINISTRATION"
      options={royalDecrees.map(decree => ({ ...decree, effects: decree }))}
      activeId={royalDecreeId}
      gold={resources.gold}
      switchCost={royalDecreeSwitchCost}
      verb="Enact"
      art={<FactionCrest faction="human" size={42} />}
      scene={<StoryScene scene="grand_council" size={160} />}
      onChoose={id => {
        const choice = royalDecrees.find(decree => decree.id === id);
        return choice ? chooseRoyalDecree(choice.id) : false;
      }}
      onExit={onExit}
    />
  );
}
