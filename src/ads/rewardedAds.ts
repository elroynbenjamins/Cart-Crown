export type RewardedAdPlacementId =
  | 'daily_supply'
  | 'expedition_ticket'
  | 'salvage_boost'
  | 'scout_report'
  | 'field_rally'
  | 'fantasy_research';

export type RewardedAdPlacement = {
  id: RewardedAdPlacementId;
  name: string;
  description: string;
  capPerSession: number;
  rewardSummary: string;
};

export const rewardedAdPlacements: RewardedAdPlacement[] = [
  {
    id: 'daily_supply',
    name: 'Daily Supply Cart',
    description: 'Optional settlement supply bonus.',
    capPerSession: 1,
    rewardSummary: '+15 Wood and +15 Provisions'
  },
  {
    id: 'expedition_ticket',
    name: 'Extra Expedition Ticket',
    description: 'One optional additional side-mode run.',
    capPerSession: 1,
    rewardSummary: '+1 Expedition Ticket'
  },
  {
    id: 'salvage_boost',
    name: 'Battlefield Salvage',
    description: 'Optional post-battle common-material recovery.',
    capPerSession: 1,
    rewardSummary: '+25% common materials from the latest battle'
  },
  {
    id: 'scout_report',
    name: 'Scout Report',
    description: 'Reveal one additional enemy preparation detail.',
    capPerSession: 2,
    rewardSummary: '+1 Scout Report'
  },
  {
    id: 'field_rally',
    name: 'Field Rally',
    description: 'Retry an expedition without paying its normal provision cost.',
    capPerSession: 1,
    rewardSummary: '+1 Field Rally'
  },
  {
    id: 'fantasy_research',
    name: 'Accelerate Research',
    description: 'Optional research acceleration for a fantasy troop doctrine.',
    capPerSession: 12,
    rewardSummary: 'Research advanced by one step'
  }
];

export type RewardedAdResult =
  | { status: 'rewarded'; provider: 'mock' | 'live' }
  | { status: 'unavailable'; provider: 'none' }
  | { status: 'closed'; provider: 'live' };

declare const __DEV__: boolean;

export async function showRewardedAd(
  _placementId: RewardedAdPlacementId
): Promise<RewardedAdResult> {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    await new Promise(resolve => setTimeout(resolve, 350));
    return { status: 'rewarded', provider: 'mock' };
  }

  return { status: 'unavailable', provider: 'none' };
}

export function getRewardedAdPlacement(id: RewardedAdPlacementId) {
  return rewardedAdPlacements.find(placement => placement.id === id) ?? null;
}
