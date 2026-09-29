import React from 'react';
import { ReinforcementMusterScreen } from './ReinforcementMusterScreen';

export function FactionFourthRecruitmentScreen({ onComplete }: { onComplete: () => void }) {
  return <ReinforcementMusterScreen kind="faction_fourth" onComplete={onComplete} />;
}
