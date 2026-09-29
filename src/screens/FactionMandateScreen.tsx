import React from 'react';
import { useGame } from '../game/GameProvider';
import { PolicyDecision } from '../ui/PolicyDecision';
import { FactionCrest } from '../ui/gameArt';

export function FactionMandateScreen({ onExit }: { onExit: () => void }) {
  const {
    activeFaction, resources, factionMandates, factionMandateId,
    factionMandateSwitchCost, chooseFactionMandate
  } = useGame();
  const options = factionMandates.filter(mandate => mandate.faction === activeFaction);
  const elf = activeFaction === 'elf';

  return (
    <PolicyDecision
      key={'mandates:' + activeFaction}
      title={elf ? 'Worldroot Attunement' : 'Clan Pact'}
      eyebrow={elf ? 'STARROOT CONCLAVE' : 'WARFIRE CONFEDERACY'}
      options={options.map(mandate => ({ ...mandate, effects: mandate }))}
      activeId={factionMandateId}
      gold={resources.gold}
      switchCost={factionMandateSwitchCost}
      verb="Adopt"
      art={<FactionCrest faction={activeFaction} size={42} />}
      onChoose={id => {
        const choice = options.find(mandate => mandate.id === id);
        return choice ? chooseFactionMandate(choice.id) : false;
      }}
      onExit={onExit}
    />
  );
}
