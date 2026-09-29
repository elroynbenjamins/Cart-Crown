import React from 'react';
import { LateHumanEventScreen } from './LateHumanEventScreen';

export function RoyalLedgerScreen({ onComplete }: { onComplete: () => void }) {
  return <LateHumanEventScreen eventId="royal_ledger" onComplete={onComplete} />;
}
