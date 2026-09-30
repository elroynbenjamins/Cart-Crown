import React from 'react';
import { MasteryResearchScreen } from './MasteryResearchScreen';
import type { MasteryScreenProps } from './MasteryResearchScreen';

export function FantasyResearchScreen(props: MasteryScreenProps) {
  return <MasteryResearchScreen family="magic" {...props} />;
}
