import React from 'react';
import { EarlyHumanEventScreen } from './EarlyHumanEventScreen';

export function RefugeeCampScreen({ onExit }: { onExit: () => void }) {
  return <EarlyHumanEventScreen eventId="refugee_camp" onExit={onExit} />;
}
