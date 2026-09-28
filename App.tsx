import React from 'react';
import { AppGate } from './src/AppGate';
import { SaveProvider } from './src/save/SaveProvider';
import { ThemeProvider } from './src/theme/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      <SaveProvider>
        <AppGate />
      </SaveProvider>
    </ThemeProvider>
  );
}
