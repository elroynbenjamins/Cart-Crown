import React from 'react';
import { MasteryResearchScreen } from './MasteryResearchScreen';
import type { MasteryScreenProps } from './MasteryResearchScreen';

export function HybridResearchScreen(props: MasteryScreenProps) {
  return <MasteryResearchScreen family="hybrid" {...props} />;
}
