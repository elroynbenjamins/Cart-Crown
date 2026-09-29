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
    fort: { gold: 100, wood: 45, stone: 22, iron: 5 },
    town: { gold: 135, wood: 65, stone: 42, iron: 13 },
    stronghold: { gold: 180, wood: 85, stone: 62, iron: 20 },
    capital: { gold: 240, wood: 110, stone: 82, iron: 26 },
    grand: { gold: 320, wood: 145, stone: 115, iron: 38 }
  },
  elf: {
    fort: { gold: 95, wood: 50, stone: 23 },
    town: { gold: 130, wood: 65, stone: 42, iron: 5 },
    stronghold: { gold: 175, wood: 88, stone: 62, iron: 15 },
    capital: { gold: 235, wood: 112, stone: 85, iron: 25 }
  },
  orc: {
    fort: { gold: 90, wood: 45, stone: 22, iron: 4 },
    town: { gold: 125, wood: 60, stone: 40, iron: 10 },
    stronghold: { gold: 180, wood: 84, stone: 60, iron: 22 },
    capital: { gold: 240, wood: 110, stone: 82, iron: 32 }
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
  2: 0.6,
  3: 0.45,
  4: 0.32,
  5: 0.24
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
    next[key] = Math.max(1, Math.ceil(value * 0.65));
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

export type ArmyReadinessProfile = {
  hpMultiplier: number;
  attackMultiplier: number;
  speedMultiplier: number;
  label: 'Fresh' | 'Worn' | 'Exhausted';
};

export function clampArmyReadiness(value: number) {
  return Math.max(25, Math.min(100, Math.round(value)));
}

export function getArmyReadinessProfile(
  readiness: number
): ArmyReadinessProfile {
  const normalized = clampArmyReadiness(readiness);

  if (normalized >= 70) {
    return {
      hpMultiplier: 1,
      attackMultiplier: 1,
      speedMultiplier: 1,
      label: 'Fresh'
    };
  }

  const fatigue = Math.min(1, Math.max(0, (70 - normalized) / 45));
  return {
    hpMultiplier: 1 - fatigue * 0.15,
    attackMultiplier: 1 - fatigue * 0.08,
    speedMultiplier: 1 - fatigue * 0.05,
    label: normalized >= 50 ? 'Worn' : 'Exhausted'
  };
}

export function getBattleReadinessWear(
  remainingHp: number,
  maxHp: number,
  difficulty: EncounterDefinition['difficulty'],
  victory: boolean,
  hasRations: boolean,
  hasMedicine: boolean
) {
  const hpRatio =
    maxHp > 0
      ? Math.max(0, Math.min(1, remainingHp / maxHp))
      : 0;
  const damageRatio = 1 - hpRatio;
  const difficultyWear =
    difficulty === 'Boss'
      ? 6
      : difficulty === 'Elite'
        ? 3
        : 0;

  let wear =
    damageRatio * 24 +
    difficultyWear +
    (victory ? 0 : 12);

  if (hasRations) wear *= 0.9;
  if (hasMedicine) wear *= 0.8;

  const rounded = Math.round(wear);
  if (!victory) return Math.max(20, rounded);
  if (damageRatio < 0.08 && difficulty === 'Normal') return 0;
  return Math.max(2, rounded);
}

export function getArmyResupplyCost(
  readiness: number,
  squadCap: number,
  hasRations: boolean,
  hasMedicine: boolean
) {
  const normalized = clampArmyReadiness(readiness);
  if (normalized >= 100) return 0;

  const missingBands = Math.max(1, Math.ceil((100 - normalized) / 10));
  const armyScale = Math.max(1, Math.ceil(Math.max(2, squadCap) / 2));
  let cost = missingBands * armyScale;

  if (hasRations) cost *= 0.85;
  if (hasMedicine) cost *= 0.8;

  return Math.max(1, Math.ceil(cost));
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
  const progressionPressure = Math.min(
    8,
    Math.floor(encounter.enemyHp / 700) * 2
  );
  const base =
    9 +
    Math.max(2, squadCap) * 2 +
    difficultyPressure +
    progressionPressure;
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
