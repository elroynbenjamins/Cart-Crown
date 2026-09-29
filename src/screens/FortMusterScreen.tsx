import React from 'react';
import { ReinforcementMusterScreen } from './ReinforcementMusterScreen';

export function FortMusterScreen({ onComplete }: { onComplete: () => void }) {
  return <ReinforcementMusterScreen kind="fort" onComplete={onComplete} />;
}
