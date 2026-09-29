import React, { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { DEFAULT_THEME_ID, GameTheme, ThemeId, themes } from './themes';

type ThemeContextValue = {
  theme: GameTheme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const order: ThemeId[] = ['original', 'dark', 'light'];

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);

  const value = useMemo<ThemeContextValue>(() => ({
    theme: themes[themeId],
    themeId,
    setThemeId,
    cycleTheme: () => {
      const index = order.indexOf(themeId);
      setThemeId(order[(index + 1) % order.length] ?? DEFAULT_THEME_ID);
    }
  }), [themeId]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useGameTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useGameTheme must be used inside ThemeProvider');
  }
  return context;
}
