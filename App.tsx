import React from 'react';
import { AppGate } from './src/AppGate';
import { SaveProvider } from './src/save/SaveProvider';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { PreferencesProvider } from './src/preferences/PreferencesProvider';

export default function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <SaveProvider>
          <AppGate />
        </SaveProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
