import React from 'react';
import { ReinforcementMusterScreen } from './ReinforcementMusterScreen';

export function FactionFifthRecruitmentScreen({ onComplete }: { onComplete: () => void }) {
  return <ReinforcementMusterScreen kind="faction_fifth" onComplete={onComplete} />;
}
