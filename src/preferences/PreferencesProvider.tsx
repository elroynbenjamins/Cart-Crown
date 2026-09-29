import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { PropsWithChildren } from 'react';
import {
  isTacticalGuidanceLevel,
  type TacticalGuidanceLevel
} from '../game/tacticalGuidance';

const TACTICAL_GUIDANCE_KEY =
  '@cart-crown/tactical-guidance';

type PreferencesContextValue = {
  tacticalGuidance: TacticalGuidanceLevel;
  setTacticalGuidance: (
    level: TacticalGuidanceLevel
  ) => void;
};

const PreferencesContext =
  createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({
  children
}: PropsWithChildren) {
  const [tacticalGuidance, setTacticalGuidanceState] =
    useState<TacticalGuidanceLevel>('standard');

  useEffect(() => {
    let mounted = true;

    void AsyncStorage.getItem(
      TACTICAL_GUIDANCE_KEY
    ).then(value => {
      if (
        mounted &&
        isTacticalGuidanceLevel(value)
      ) {
        setTacticalGuidanceState(value);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      tacticalGuidance,
      setTacticalGuidance: level => {
        setTacticalGuidanceState(level);
        void AsyncStorage.setItem(
          TACTICAL_GUIDANCE_KEY,
          level
        );
      }
    }),
    [tacticalGuidance]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      'usePreferences must be used inside PreferencesProvider'
    );
  }
  return context;
}
