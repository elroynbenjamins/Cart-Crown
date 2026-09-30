import React from 'react';
import { EarlyHumanEventScreen } from './EarlyHumanEventScreen';

export function MarkedRaidersScreen({ onOpenForge, onExit }: {
  onOpenForge: () => void;
  onExit: () => void;
}) {
  return <EarlyHumanEventScreen eventId="marked_raiders" onOpenForge={onOpenForge} onExit={onExit} />;
}
