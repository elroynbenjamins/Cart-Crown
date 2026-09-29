import React from 'react';
import { ReinforcementMusterScreen } from './ReinforcementMusterScreen';

export function FactionRecruitmentScreen({ onComplete }: { onComplete: () => void }) {
  return <ReinforcementMusterScreen kind="faction_third" onComplete={onComplete} />;
}
