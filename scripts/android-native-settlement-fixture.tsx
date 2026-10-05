import React from 'react';
import { GameProvider } from './src/game/GameProvider';
import { createHumanFactionState, createInitialGameSnapshot } from './src/save/schema';
import { SettlementScreen } from './src/screens/SettlementScreen';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AndroidWindowFrame } from './src/ui/AndroidWindowFrame';

const snapshot = createInitialGameSnapshot();
const human = createHumanFactionState();

Object.assign(human, {
  chapterNumber: 6,
  wagonStageId: 'grand',
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
    wagonwright: 3,
    forge: 3,
    quartermaster: 3,
    war_room: 3,
    stable: 3,
    signal_tower: 3,
    officer_academy: 3
  },
  buildingPlacements: {
    plot_nw: 'forge',
    plot_n: 'barracks',
    plot_ne: 'wagonwright',
    plot_w: 'quartermaster',
    plot_center: 'hall',
    plot_e: 'stable',
    plot_sw: 'war_room',
    plot_s: 'signal_tower',
    plot_se: 'officer_academy'
  }
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
