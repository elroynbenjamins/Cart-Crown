import type { FactionId } from './types';

export type FactionDefinition = {
  id: FactionId;
  name: string;
  campaignName: string;
  campaignSubtitle: string;
  mechanicName: string;
  mechanicSummary: string;
  wagonName: string;
  unlockRule: 'always' | 'human_complete';
  gameplayIdentity: string;
  replayReason: string;
};

export const factions: Record<FactionId, FactionDefinition> = {
  human: {
    id: 'human',
    name: 'Humans',
    campaignName: 'The Greenkeep Remnant',
    campaignSubtitle: 'Rebuild the western realm and expose the false war.',
    mechanicName: 'Orders',
    mechanicSummary: 'Disciplined doctrines reward protected lines, combined arms and organized positioning.',
    wagonName: 'Supply Wagon',
    unlockRule: 'always',
    gameplayIdentity: 'Balanced armor, cavalry, engineering and structured formations.',
    replayReason: 'The most flexible army and the clearest introduction to formation and logistics.'
  },
  elf: {
    id: 'elf',
    name: 'Elves',
    campaignName: 'The Heartgrove Wardens',
    campaignSubtitle: 'Restore the failing wards and trace the engineered corruption.',
    mechanicName: 'Wards',
    mechanicSummary: 'Spacing, diagonals and open cells create precision and magical support bonuses.',
    wagonName: 'Wayfarer Caravan',
    unlockRule: 'human_complete',
    gameplayIdentity: 'Precision ranged units, mobility, support and positional spacing.',
    replayReason: 'Human tight-line habits stop being optimal; empty space and flanks become resources.'
  },
  orc: {
    id: 'orc',
    name: 'Orcs',
    campaignName: 'The Emberclan',
    campaignSubtitle: 'Unite the clans, survive invasion and disprove the blame.',
    mechanicName: 'Momentum',
    mechanicSummary: 'Aggressive adjacency, charges and successful attacks build escalating battle pressure.',
    wagonName: 'War Cart',
    unlockRule: 'human_complete',
    gameplayIdentity: 'Melee pressure, morale, Warg cavalry and battle momentum.',
    replayReason: 'The campaign rewards aggressive formations, clan unlocks and high-risk combat rhythms.'
  }
};

export const factionOrder: FactionId[] = ['human', 'elf', 'orc'];
