import React from 'react';
import { EarlyFactionEventScreen } from './EarlyFactionEventScreen';

export function FactionChapterTwoEventScreen({ stage, onComplete }: {
  stage: 'resource' | 'council';
  onComplete: () => void;
}) {
  return <EarlyFactionEventScreen request={{ chapter: 2, stage }} onComplete={onComplete} />;
}
