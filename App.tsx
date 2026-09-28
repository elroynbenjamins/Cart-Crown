import React from 'react';
import { AppShell } from './src/AppShell';
import { GameProvider } from './src/game/GameProvider';
import { ThemeProvider } from './src/theme/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <AppShell />
      </GameProvider>
    </ThemeProvider>
  );
}
