import React from 'react';
import { LateHumanEventScreen } from './LateHumanEventScreen';

export function BrokenArchivesScreen({ onComplete }: { onComplete: () => void }) {
  return <LateHumanEventScreen eventId="broken_archives" onComplete={onComplete} />;
}
