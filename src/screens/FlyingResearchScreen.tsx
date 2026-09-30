import React from 'react';
import { MasteryResearchScreen } from './MasteryResearchScreen';
import type { MasteryScreenProps } from './MasteryResearchScreen';

export function FlyingResearchScreen(props: MasteryScreenProps) {
  return <MasteryResearchScreen family="flying" {...props} />;
}
