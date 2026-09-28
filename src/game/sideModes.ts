import type { SideModeDefinition } from './types';

export const sideModes: SideModeDefinition[] = [
  {
    id: 'expeditions',
    name: 'Expeditions',
    subtitle: 'Branching repeatable runs',
    description: 'Take your army through a short route of battles, events, supplies and a boss. Your wagon must last the full run.',
    unlockStage: 'settlement',
    rewardFocus: 'Resources, blueprints and build experimentation',
    example: 'Battle → Event/Supply → Elite → Boss'
  },
  {
    id: 'formation_trials',
    name: 'Formation Trials',
    subtitle: 'Solve combat puzzles',
    description: 'Use formation rules and synergies to satisfy tactical objectives without needing a stronger kingdom.',
    unlockStage: 'settlement',
    rewardFocus: 'Gold, crafting materials and mastery rewards',
    example: 'Protect the rear squad and win with only 3 active units.'
  },
  {
    id: 'kingdom_defense',
    name: 'Kingdom Defense',
    subtitle: 'Multi-wave endurance',
    description: 'One formation and wagon must survive several incoming waves. Supplies persist between fights.',
    unlockStage: 'fort',
    rewardFocus: 'Large resource bundles and settlement materials',
    example: 'Survive 5 waves before Greenkeep falls.'
  },
  {
    id: 'relic_hunts',
    name: 'Relic Hunts',
    subtitle: 'Late-game boss chains',
    description: 'Special boss routes built around rare artifacts and demanding faction-specific builds.',
    unlockStage: 'stronghold',
    rewardFocus: 'Unique artifacts and cosmetics',
    example: 'Track a relic guardian through three escalating encounters.'
  }
];

export const expeditionRoute = [
  { id: 'exp_1', type: 'Battle', title: 'Road Skirmish' },
  { id: 'exp_2', type: 'Event', title: 'Abandoned Tollhouse' },
  { id: 'exp_3', type: 'Supply', title: 'Hidden Spring' },
  { id: 'exp_4', type: 'Elite', title: 'Veteran Raiders' },
  { id: 'exp_5', type: 'Boss', title: 'The Roadbreaker' }
] as const;
