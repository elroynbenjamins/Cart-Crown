import type { EncounterId } from './encounters';
import type { SideModeDefinition } from './types';

export const sideModes: SideModeDefinition[] = [
  {
    id: 'war_table',
    name: 'War Table',
    subtitle: 'Optional scout contracts',
    description:
      'Choose short field contracts that test different enemy formations without advancing the story. Rewards are useful, but intentionally modest so campaign farming is never required.',
    unlockStage: 'camp',
    rewardFocus: 'Gold, provisions and formation practice',
    example: 'Choose a contract → inspect the enemy → prepare → fight'
  },
  {
    id: 'formation_trials',
    name: 'Kingdom Trials',
    subtitle: 'Tactical challenge rules',
    description:
      'Solve formation challenges with special constraints. Trials reward understanding of rows, protection and counters rather than simply bringing a stronger army.',
    unlockStage: 'settlement',
    rewardFocus: 'Gold, crafting materials and mastery rewards',
    example: 'Protect the rear squad and win with only 3 active units.'
  },
  {
    id: 'kingdom_defense',
    name: 'Kingdom Defense',
    subtitle: 'Multi-wave endurance',
    description:
      'After your first story defense, return for endurance battles where one formation and wagon must survive several incoming waves.',
    unlockStage: 'fort',
    rewardFocus: 'Resource bundles and settlement materials',
    example: 'Survive 5 waves before the settlement falls.'
  },
  {
    id: 'expeditions',
    name: 'Expeditions',
    subtitle: 'Branching repeatable runs',
    description:
      'Take your army through a short route of battles, events, supplies and a boss. Your wagon and readiness must last for the full run.',
    unlockStage: 'fort',
    rewardFocus: 'Resources, route loot and build experimentation',
    example: 'Battle → Event/Supply → Elite → Boss'
  },
  {
    id: 'relic_hunts',
    name: 'Relic Hunts',
    subtitle: 'Late-game boss chains',
    description:
      'Special boss routes built around rare artifacts and demanding faction-specific builds.',
    unlockStage: 'stronghold',
    rewardFocus: 'Unique artifacts and cosmetics',
    example: 'Track a relic guardian through three escalating encounters.'
  }
];

export type WarTableContract = {
  id: string;
  encounterId: EncounterId;
  tacticalNote: string;
  rewardLabel: string;
};

export const warTableContracts: WarTableContract[] = [
  {
    id: 'broken_spear_company',
    encounterId: 'war_table_broken_spear',
    tacticalNote:
      'A 5-2-2 shield-heavy front absorbs direct pressure. Look for flanks, ranged focus or a way to punish its thin middle.',
    rewardLabel: 'Gold + Iron + Provisions'
  },
  {
    id: 'blackwood_ambush',
    encounterId: 'war_table_blackwood_ambush',
    tacticalNote:
      'A 2-2-5 protected rear hides most of its damage behind a light screen. Backline pressure and speed matter more than brute force.',
    rewardLabel: 'Gold + Wood + Provisions'
  },
  {
    id: 'red_banner_raiders',
    encounterId: 'war_table_red_banner',
    tacticalNote:
      'A 4-3-2 assault shape tries to win the opening exchanges. A stable frontline and disciplined counter-pressure can outlast it.',
    rewardLabel: 'Gold + Iron + Provisions'
  }
];

