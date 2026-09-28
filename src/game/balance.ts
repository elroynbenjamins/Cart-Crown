import type {
  EncounterDefinition,
  FactionId,
  ResourceWallet,
  UnitDefinition
} from './types';

export type ExpansionStage =
  | 'fort'
  | 'town'
  | 'stronghold'
  | 'capital'
  | 'grand';

/**
 * Expansion costs are intentionally lower than the sum of the prerequisite
 * building upgrades. The player should usually arrive at a chapter transition
 * close to ready, then need at most a small amount of side-mode recovery after
 * spending on equipment.
 */
export const expansionCosts: Record<
  FactionId,
  Partial<Record<ExpansionStage, Partial<ResourceWallet>>>
> = {
  human: {
    fort: { gold: 110, wood: 50, stone: 25, iron: 6 },
    town: { gold: 160, wood: 75, stone: 50, iron: 16 },
    stronghold: { gold: 220, wood: 105, stone: 75, iron: 24 },
    capital: { gold: 300, wood: 135, stone: 100, iron: 32 },
    grand: { gold: 400, wood: 180, stone: 145, iron: 48 }
  },
  elf: {
    fort: { gold: 105, wood: 55, stone: 26 },
    town: { gold: 155, wood: 75, stone: 48, iron: 6 },
    stronghold: { gold: 215, wood: 105, stone: 75, iron: 18 },
    capital: { gold: 295, wood: 140, stone: 105, iron: 30 }
  },
  orc: {
    fort: { gold: 100, wood: 50, stone: 24, iron: 5 },
    town: { gold: 150, wood: 70, stone: 46, iron: 12 },
    stronghold: { gold: 220, wood: 100, stone: 72, iron: 26 },
    capital: { gold: 300, wood: 135, stone: 100, iron: 40 }
  }
};

export function getExpansionCost(
  faction: FactionId,
  stage: ExpansionStage
): Partial<ResourceWallet> {
  return expansionCosts[faction][stage] ?? {};
}

export function canAffordCost(
  resources: ResourceWallet,
  cost: Partial<ResourceWallet>
) {
  return Object.entries(cost).every(([key, amount]) => {
    const resourceKey = key as keyof ResourceWallet;
    return resources[resourceKey] >= (amount ?? 0);
  });
}

export function payResourceCost(
  resources: ResourceWallet,
  cost: Partial<ResourceWallet>
): ResourceWallet {
  return {
    gold: resources.gold - (cost.gold ?? 0),
    wood: resources.wood - (cost.wood ?? 0),
    stone: resources.stone - (cost.stone ?? 0),
    iron: resources.iron - (cost.iron ?? 0),
    provisions: resources.provisions - (cost.provisions ?? 0)
  };
}

const BUILDING_LEVEL_COST_MULTIPLIER: Record<number, number> = {
  2: 0.75,
  3: 0.65,
  4: 0.55,
  5: 0.45
};

export function rebalanceBuildingCost(
  level: number,
  cost: Partial<ResourceWallet>
): Partial<ResourceWallet> {
  const multiplier = BUILDING_LEVEL_COST_MULTIPLIER[level] ?? 1;
  const next: Partial<ResourceWallet> = {};

  (Object.keys(cost) as Array<keyof ResourceWallet>).forEach(key => {
    const value = cost[key];
    if (value === undefined) return;
    next[key] = Math.max(1, Math.ceil(value * multiplier));
  });

  return next;
}

export function rebalanceConstructionCost(
  cost: Partial<ResourceWallet>
): Partial<ResourceWallet> {
  const next: Partial<ResourceWallet> = {};

  (Object.keys(cost) as Array<keyof ResourceWallet>).forEach(key => {
    const value = cost[key];
    if (value === undefined) return;
    next[key] = Math.max(1, Math.ceil(value * 0.75));
  });

  return next;
}

export type UnitCombatProfile = {
  maxHp: number;
  totalAttack: number;
  averageArmor: number;
  averageSpeed: number;
  armorStatMultiplier: number;
  speedStatMultiplier: number;
  supportRecovery: number;
};

export function getUnitCombatProfile(
  units: UnitDefinition[]
): UnitCombatProfile {
  if (units.length === 0) {
    return {
      maxHp: 0,
      totalAttack: 0,
      averageArmor: 0,
      averageSpeed: 0,
      armorStatMultiplier: 1,
      speedStatMultiplier: 1,
      supportRecovery: 0
    };
  }

  const maxHp = units.reduce((total, unit) => total + unit.hp, 0);
  const totalAttack = units.reduce((total, unit) => total + unit.attack, 0);
  const averageArmor =
    units.reduce((total, unit) => total + unit.armor, 0) / units.length;
  const averageSpeed =
    units.reduce((total, unit) => total + unit.speed, 0) / units.length;

  const armorStatMultiplier = Math.min(
    1.55,
    1 + Math.max(0, averageArmor - 3) * 0.035
  );
  const speedStatMultiplier = Math.max(
    0.92,
    Math.min(1.12, 1 + (averageSpeed - 10) * 0.0125)
  );
  const supportRecovery = units
    .filter(unit => unit.role === 'support')
    .reduce(
      (total, unit) => total + Math.max(2, Math.round(unit.attack * 0.25)),
      0
    );

  return {
    maxHp,
    totalAttack,
    averageArmor,
    averageSpeed,
    armorStatMultiplier,
    speedStatMultiplier,
    supportRecovery
  };
}

export function getEnemyStrikePressure(
  encounter: EncounterDefinition,
  squadCap: number,
  turn: number
) {
  const difficultyPressure =
    encounter.difficulty === 'Boss'
      ? 6
      : encounter.difficulty === 'Elite'
        ? 3
        : 0;
  const base = 9 + Math.max(2, squadCap) * 2 + difficultyPressure;
  const escalation = 1 + Math.min(0.18, turn * 0.012);
  return Math.round(base * escalation);
}

export function getTacticalSpeedDamageMultiplier(
  unitSpeedMultiplier: number,
  formationSpeedMultiplier: number,
  commanderSpeedMultiplier: number,
  storySpeedMultiplier: number,
  mandateSpeedMultiplier: number
) {
  const tacticalSpeed =
    formationSpeedMultiplier *
    commanderSpeedMultiplier *
    storySpeedMultiplier *
    mandateSpeedMultiplier;

  return unitSpeedMultiplier * (1 + (tacticalSpeed - 1) * 0.6);
}
