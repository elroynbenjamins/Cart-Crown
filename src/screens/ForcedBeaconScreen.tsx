import React from 'react';
import { LateHumanEventScreen } from './LateHumanEventScreen';

export function ForcedBeaconScreen({ onComplete }: { onComplete: () => void }) {
  return <LateHumanEventScreen eventId="forced_beacon" onComplete={onComplete} />;
}
