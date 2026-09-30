import React from 'react';
import { EarlyHumanEventScreen } from './EarlyHumanEventScreen';

export function TimberClaimScreen({ onComplete }: { onComplete: () => void }) {
  return <EarlyHumanEventScreen eventId="timber_claim" onExit={onComplete} />;
}
