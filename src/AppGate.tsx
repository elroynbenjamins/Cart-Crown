import React from 'react';
import { AppShell } from './AppShell';
import { GameProvider } from './game/GameProvider';
import { useSaveSystem } from './save/SaveProvider';
import { SaveSelectScreen } from './screens/SaveSelectScreen';

export function AppGate() {
  const {
    selectedSlotId,
    selectedRecord,
    writeSnapshot,
    leaveToSaveSelect
  } = useSaveSystem();

  if (!selectedSlotId || !selectedRecord) {
    return <SaveSelectScreen />;
  }

  return (
    <GameProvider
      key={String(selectedSlotId) + '-' + selectedRecord.snapshot.activeFaction}
      initialSnapshot={selectedRecord.snapshot}
      onSnapshotChange={writeSnapshot}
    >
      <AppShell
        saveSlotId={selectedSlotId}
        onExitToSaves={leaveToSaveSelect}
      />
    </GameProvider>
  );
}
