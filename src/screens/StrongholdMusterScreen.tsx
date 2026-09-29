import React from 'react';
import { ReinforcementMusterScreen } from './ReinforcementMusterScreen';

export function StrongholdMusterScreen({ onComplete }: { onComplete: () => void }) {
  return <ReinforcementMusterScreen kind="stronghold" onComplete={onComplete} />;
}
