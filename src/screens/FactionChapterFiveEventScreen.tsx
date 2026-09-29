import React from 'react';
import { LateFactionEventScreen } from './LateFactionEventScreen';

export function FactionChapterFiveEventScreen({ stage, onComplete }: {
  stage: 'muster' | 'resource' | 'seal';
  onComplete: () => void;
}) {
  return <LateFactionEventScreen request={{ chapter: 5, stage }} onComplete={onComplete} />;
}
