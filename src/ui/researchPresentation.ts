import type { ResourceWallet } from '../game/types';
import type { SemanticTone } from './semanticColors';

/** Display only. Timer completion and spending remain owned by progression/GameProvider. */
export function formatResearchDuration(hours: number): string {
  if (!Number.isFinite(hours)) return 'Time unavailable';
  if (hours <= 0) return 'Ready';
  const minutes = Math.max(1, Math.ceil(hours * 60));
  const wholeHours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (wholeHours === 0) return minutes + ' min';
  return wholeHours + 'h' + (remainder > 0 ? ' ' + remainder + 'm' : '');
}

export type ResearchVisualState = 'locked' | 'available' | 'active' | 'claimable' | 'complete';
export const researchStatePresentation: Record<ResearchVisualState, { label: string; tone: SemanticTone }> = {
  locked: { label: 'Locked', tone: 'neutral' },
  available: { label: 'Available', tone: 'blue' },
  active: { label: 'Researching', tone: 'cyan' },
  claimable: { label: 'Ready to complete', tone: 'positive' },
  complete: { label: 'Complete', tone: 'positive' }
};

const resourceLabels: Record<keyof ResourceWallet, string> = {
  gold: 'Gold', wood: 'Wood', stone: 'Stone', iron: 'Iron', provisions: 'Provisions'
};

/** Match authored costs to the real wallet; never derive a cost from a class name or tier. */
export function researchCostRows(cost: Partial<ResourceWallet>, wallet: ResourceWallet) {
  return (Object.keys(resourceLabels) as Array<keyof ResourceWallet>).flatMap(resource => {
    const required = cost[resource];
    if (typeof required !== 'number' || !Number.isFinite(required) || required <= 0) return [];
    const available = wallet[resource];
    const known = Number.isFinite(available);
    const missing = known ? Math.max(0, required - available) : null;
    return [{ resource, label: resourceLabels[resource], required, available: known ? available : null, missing }];
  });
}
