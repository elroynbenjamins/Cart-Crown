import React from 'react';
import { AppGate } from './src/AppGate';
import { SaveProvider } from './src/save/SaveProvider';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { PreferencesProvider } from './src/preferences/PreferencesProvider';
import { AndroidWindowFrame } from './src/ui/AndroidWindowFrame';

export default function App() {
  return (
    <ThemeProvider>
      <AndroidWindowFrame>
        <PreferencesProvider>
          <SaveProvider>
            <AppGate />
          </SaveProvider>
        </PreferencesProvider>
      </AndroidWindowFrame>
    </ThemeProvider>
  );
}
