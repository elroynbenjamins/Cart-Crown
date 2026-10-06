import type { EncounterId } from './encounters';

export type BattleOrderId = 'hold' | 'focus' | 'push' | 'reinforce' | 'rally';

export type BattleOrderEffects = {
  attackMultiplier: number;
  incomingDamageMultiplier: number;
  partyIntegrityLossMultiplier: number;
  enemyIntegrityPressureMultiplier: number;
  immediateIntegrityRestore: number;
};

export type BattleOrderDefinition = {
  id: BattleOrderId;
  label: string;
  accessibilityLabel: string;
  durationExchanges: number;
  cooldownExchanges: number;
  effects: BattleOrderEffects;
};

export const battleOrderDefinitions: Record<BattleOrderId, BattleOrderDefinition> = {
  hold: {
    id: 'hold',
    label: 'HOLD',
    accessibilityLabel: 'Commander order Hold the Line',
    durationExchanges: 2,
    cooldownExchanges: 5,
    effects: {
      attackMultiplier: 0.92,
      incomingDamageMultiplier: 0.82,
      partyIntegrityLossMultiplier: 0.6,
      enemyIntegrityPressureMultiplier: 0.9,
      immediateIntegrityRestore: 0
    }
  },
  focus: {
    id: 'focus',
    label: 'FOCUS',
    accessibilityLabel: 'Commander order Focus Target',
    durationExchanges: 1,
    cooldownExchanges: 4,
    effects: {
      attackMultiplier: 1.16,
      incomingDamageMultiplier: 1,
      partyIntegrityLossMultiplier: 1,
      enemyIntegrityPressureMultiplier: 1.18,
      immediateIntegrityRestore: 0
    }
  },
  push: {
    id: 'push',
    label: 'PUSH',
    accessibilityLabel: 'Commander order Push Forward',
    durationExchanges: 2,
    cooldownExchanges: 6,
    effects: {
      attackMultiplier: 1.2,
      incomingDamageMultiplier: 1.1,
      partyIntegrityLossMultiplier: 1.15,
      enemyIntegrityPressureMultiplier: 1.28,
      immediateIntegrityRestore: 0
    }
  },
  reinforce: {
    id: 'reinforce',
    label: 'REINFORCE',
    accessibilityLabel: 'Commander order Reinforce the Line',
    durationExchanges: 1,
    cooldownExchanges: 7,
    effects: {
      attackMultiplier: 0.96,
      incomingDamageMultiplier: 0.9,
      partyIntegrityLossMultiplier: 0.72,
      enemyIntegrityPressureMultiplier: 0.92,
      immediateIntegrityRestore: 22
    }
  },
  rally: {
    id: 'rally',
    label: 'RALLY',
    accessibilityLabel: 'Commander order Rally the Line',
    durationExchanges: 2,
    cooldownExchanges: 10,
    effects: {
      attackMultiplier: 0.98,
      incomingDamageMultiplier: 0.92,
      partyIntegrityLossMultiplier: 0.58,
      enemyIntegrityPressureMultiplier: 0.95,
      immediateIntegrityRestore: 30
    }
  }
};

const chapterOneFocusEncounters = new Set<EncounterId>([
  'mercenary_patrol',
  'toll_captain'
]);

const chapterThreePushEncounters = new Set<EncounterId>([
  'ch3_through_gap',
  'ch3_wolves_wing',
  'ch3_layered_host',
  'lord_marshal_veyr'
]);

const chapterFourReinforceEncounters = new Set<EncounterId>([
  'crownroad_ambush',
  'ch4_wrong_army',
  'ch4_hunters_rear',
  'pretender_general'
]);

const chapterFiveRallyEncounters = new Set<EncounterId>([
  'ch5_rally_line',
  'ch5_above_shieldwall',
  'ch5_three_lines_deep',
  'ch5_hammer_wing',
  'ch5_strongest_army',
  'gate_of_crownspire'
]);

export function getUnlockedBattleOrders(
  chapterNumber: number,
  encounterId: EncounterId
): BattleOrderId[] {
  const unlocked: BattleOrderId[] = ['hold'];

  if (
    chapterNumber >= 2 ||
    chapterOneFocusEncounters.has(encounterId)
  ) {
    unlocked.push('focus');
  }

  if (
    chapterNumber >= 4 ||
    chapterThreePushEncounters.has(encounterId)
  ) {
    unlocked.push('push');
  }

  if (
    chapterNumber >= 5 ||
    chapterFourReinforceEncounters.has(encounterId)
  ) {
    unlocked.push('reinforce');
  }

  if (
    chapterNumber >= 6 ||
    chapterFiveRallyEncounters.has(encounterId)
  ) {
    unlocked.push('rally');
  }

  return unlocked;
}

export function getBattleOrderDefinition(id: BattleOrderId) {
  return battleOrderDefinitions[id];
}

export function decrementBattleOrderCooldowns(
  cooldowns: Partial<Record<BattleOrderId, number>>
) {
  return Object.fromEntries(
    Object.entries(cooldowns).map(([id, value]) => [
      id,
      Math.max(0, (value ?? 0) - 1)
    ])
  ) as Partial<Record<BattleOrderId, number>>;
}
