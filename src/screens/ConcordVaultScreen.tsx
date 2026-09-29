import React from 'react';
import { LateHumanEventScreen } from './LateHumanEventScreen';

export function ConcordVaultScreen({ onComplete }: { onComplete: () => void }) {
  return <LateHumanEventScreen eventId="concord_vault" onComplete={onComplete} />;
}
