import React from 'react';
import { LateHumanEventScreen } from './LateHumanEventScreen';

export function EmptyThroneScreen({ onComplete }: { onComplete: () => void }) {
  return <LateHumanEventScreen eventId="empty_throne" onComplete={onComplete} />;
}
