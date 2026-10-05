import React from 'react';
import { GameProvider } from './src/game/GameProvider';
import { createHumanFactionState, createInitialGameSnapshot } from './src/save/schema';
import { getInitialSettlementPlacements } from './src/game/settlement';
import { SettlementScreen } from './src/screens/SettlementScreen';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AndroidWindowFrame } from './src/ui/AndroidWindowFrame';

const snapshot = createInitialGameSnapshot();
const human = createHumanFactionState();

Object.assign(human, {
  chapterNumber: 2,
  wagonStageId: 'fort',
  resources: { gold: 1200, wood: 1200, stone: 1200, iron: 1200, provisions: 1200 },
  holdTheRoadWon: true,
  settlementUpgraded: true,
  recruitChoiceAvailable: false,
  recruitChosen: true,
  markedRaidersInvestigated: true,
  forgeUnlocked: true,
  mercenaryPatrolWon: true,
  commanderChoiceUnlocked: true,
  commanderPathId: 'hum_vanguard',
  refugeeCampSecured: true,
  signalTowerUnlocked: true,
  buildingLevels: {
    ...human.buildingLevels,
    hall: 3,
    barracks: 2,
    wagonwright: 2,
    forge: 0,
    quartermaster: 0,
    war_room: 0,
    stable: 0,
    signal_tower: 0,
    officer_academy: 0
  },
  buildingPlacements: getInitialSettlementPlacements('human')
});

snapshot.activeFaction = 'human';
snapshot.factionStates.human = human;

export default function App() {
  return (
    <ThemeProvider>
      <AndroidWindowFrame>
        <GameProvider initialSnapshot={snapshot} onSnapshotChange={() => undefined}>
          <SettlementScreen onExit={() => undefined} />
        </GameProvider>
      </AndroidWindowFrame>
    </ThemeProvider>
  );
}
