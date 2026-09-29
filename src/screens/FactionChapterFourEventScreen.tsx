import React from 'react';
import { LateFactionEventScreen } from './LateFactionEventScreen';

export function FactionChapterFourEventScreen({ stage, onComplete }: {
  stage: 'resource' | 'council';
  onComplete: () => void;
}) {
  return <LateFactionEventScreen request={{ chapter: 4, stage }} onComplete={onComplete} />;
}
