import React from 'react';
import { EarlyFactionEventScreen } from './EarlyFactionEventScreen';

export type FactionChapterOneEventStage = 'investigation' | 'supply';

export function FactionChapterOneEventScreen({ stage, onComplete }: {
  stage: FactionChapterOneEventStage;
  onComplete: () => void;
}) {
  return <EarlyFactionEventScreen request={{ chapter: 1, stage }} onComplete={onComplete} />;
}
