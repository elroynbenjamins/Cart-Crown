import React from 'react';
import { MasteryResearchScreen } from './MasteryResearchScreen';
import type { MasteryScreenProps } from './MasteryResearchScreen';

export function LargeResearchScreen(props: MasteryScreenProps) {
  return <MasteryResearchScreen family="large" {...props} />;
}
