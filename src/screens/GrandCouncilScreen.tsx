import React from 'react';
import { LateHumanEventScreen } from './LateHumanEventScreen';

export function GrandCouncilScreen({ onComplete }: { onComplete: () => void }) {
  return <LateHumanEventScreen eventId="grand_council" onComplete={onComplete} />;
}
