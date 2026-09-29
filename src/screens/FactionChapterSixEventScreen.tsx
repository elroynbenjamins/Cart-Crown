import React from 'react';
import { LateFactionEventScreen } from './LateFactionEventScreen';

export function FactionChapterSixEventScreen({ stage, onComplete }: {
  stage: 'concord' | 'seal';
  onComplete: () => void;
}) {
  return <LateFactionEventScreen request={{ chapter: 6, stage }} onComplete={onComplete} />;
}
