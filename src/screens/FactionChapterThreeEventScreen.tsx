import React from 'react';
import { EarlyFactionEventScreen } from './EarlyFactionEventScreen';

export function FactionChapterThreeEventScreen({ stage, onComplete }: {
  stage: 'resource' | 'council';
  onComplete: () => void;
}) {
  return <EarlyFactionEventScreen request={{ chapter: 3, stage }} onComplete={onComplete} />;
}
