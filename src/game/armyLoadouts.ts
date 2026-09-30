import {
  canUnitEquipEquipment,
  getEquipment
} from './equipment';
import type {
  EquipmentSlot,
  UnitDefinition,
  UnitEquipmentLoadout
} from './types';

const equipmentSlots: EquipmentSlot[] = [
  'weapon',
  'armor',
  'shield',
  'mount',
  'artifact'
];

function cloneLoadouts(
  source: Record<string, UnitEquipmentLoadout>
): Record<string, UnitEquipmentLoadout> {
  return Object.fromEntries(
    Object.entries(source).map(([unitId, loadout]) => [
      unitId,
      { ...loadout }
    ])
  );
}

function addCount(
  counts: Map<string, number>,
  equipmentId: string
) {
  counts.set(
    equipmentId,
    (counts.get(equipmentId) ?? 0) + 1
  );
}

function takeCount(
  counts: Map<string, number>,
  equipmentId: string
) {
  const count = counts.get(equipmentId) ?? 0;
  if (count <= 0) return false;
  if (count === 1) {
    counts.delete(equipmentId);
  } else {
    counts.set(equipmentId, count - 1);
  }
  return true;
}

function equipmentTotals(
  loadout: UnitEquipmentLoadout
) {
  return equipmentSlots.reduce(
    (total, slot) => {
      const item = getEquipment(loadout[slot] ?? '');
      if (!item) return total;
      total.attack += item.attackBonus;
      total.armor += item.armorBonus;
      total.speed += item.speedBonus;
      return total;
    },
    { attack: 0, armor: 0, speed: 0 }
  );
}

function applyUnitEquipmentTotals(
  unit: UnitDefinition,
  current: UnitEquipmentLoadout,
  next: UnitEquipmentLoadout
): UnitDefinition {
  const before = equipmentTotals(current);
  const after = equipmentTotals(next);

  return {
    ...unit,
    attack: unit.attack - before.attack + after.attack,
    armor: unit.armor - before.armor + after.armor,
    speed: unit.speed - before.speed + after.speed
  };
}

export type ArmyLoadoutEquipmentResult = {
  unitEquipment: Record<string, UnitEquipmentLoadout>;
  equipmentInventory: string[];
  units: UnitDefinition[];
  missingEquipment: Array<{
    unitId: string;
    slot: EquipmentSlot;
    equipmentId: string;
  }>;
};

export function applyArmyLoadoutEquipment({
  units,
  targetFormation,
  savedUnitEquipment,
  currentUnitEquipment,
  equipmentInventory
}: {
  units: UnitDefinition[];
  targetFormation: Array<string | null>;
  savedUnitEquipment:
    | Record<string, UnitEquipmentLoadout>
    | undefined;
  currentUnitEquipment: Record<
    string,
    UnitEquipmentLoadout
  >;
  equipmentInventory: string[];
}): ArmyLoadoutEquipmentResult {
  if (!savedUnitEquipment) {
    return {
      unitEquipment: cloneLoadouts(
        currentUnitEquipment
      ),
      equipmentInventory: [
        ...equipmentInventory
      ],
      units: units.map(unit => ({ ...unit })),
      missingEquipment: []
    };
  }

  const unitById = new Map(
    units.map(unit => [unit.id, unit])
  );
  const targetIds = targetFormation.filter(
    (unitId): unitId is string =>
      typeof unitId === 'string' &&
      unitById.has(unitId)
  );
  const targetSet = new Set(targetIds);

  const pool = new Map<string, number>();
  for (const equipmentId of equipmentInventory) {
    if (getEquipment(equipmentId)) {
      addCount(pool, equipmentId);
    }
  }
  for (const loadout of Object.values(
    currentUnitEquipment
  )) {
    for (const slot of equipmentSlots) {
      const equipmentId = loadout[slot];
      if (
        equipmentId &&
        getEquipment(equipmentId)
      ) {
        addCount(pool, equipmentId);
      }
    }
  }

  const nextUnitEquipment: Record<
    string,
    UnitEquipmentLoadout
  > = {};
  const missingEquipment:
    ArmyLoadoutEquipmentResult['missingEquipment'] =
      [];

  for (const unitId of targetIds) {
    const unit = unitById.get(unitId);
    if (!unit) continue;

    const hasSavedLoadout =
      Object.prototype.hasOwnProperty.call(
        savedUnitEquipment,
        unitId
      );
    const requested =
      savedUnitEquipment[unitId] ?? {};
    const current =
      currentUnitEquipment[unitId] ?? {};
    const next: UnitEquipmentLoadout = {};

    if (!hasSavedLoadout) {
      for (const slot of equipmentSlots) {
        const currentId = current[slot];
        if (
          currentId &&
          takeCount(pool, currentId)
        ) {
          next[slot] = currentId;
        }
      }
      nextUnitEquipment[unitId] = next;
      continue;
    }

    for (const slot of equipmentSlots) {
      const requestedId = requested[slot];

      if (!requestedId) {
        continue;
      }

      const item = getEquipment(requestedId);
      const valid =
        item &&
        item.slot === slot &&
        canUnitEquipEquipment(unit, item);

      if (
        valid &&
        takeCount(pool, requestedId)
      ) {
        next[slot] = requestedId;
        continue;
      }

      missingEquipment.push({
        unitId,
        slot,
        equipmentId: requestedId
      });

      const currentId = current[slot];
      const currentItem = currentId
        ? getEquipment(currentId)
        : null;

      if (
        currentId &&
        currentItem &&
        currentItem.slot === slot &&
        canUnitEquipEquipment(
          unit,
          currentItem
        ) &&
        takeCount(pool, currentId)
      ) {
        next[slot] = currentId;
      }
    }

    nextUnitEquipment[unitId] = next;
  }

  for (const unit of units) {
    if (targetSet.has(unit.id)) continue;

    const current =
      currentUnitEquipment[unit.id] ?? {};
    const next: UnitEquipmentLoadout = {};

    for (const slot of equipmentSlots) {
      const equipmentId = current[slot];
      if (
        equipmentId &&
        takeCount(pool, equipmentId)
      ) {
        next[slot] = equipmentId;
      }
    }

    if (Object.keys(next).length > 0) {
      nextUnitEquipment[unit.id] = next;
    }
  }

  const nextInventory: string[] = [];
  for (const [equipmentId, count] of pool) {
    for (let index = 0; index < count; index += 1) {
      nextInventory.push(equipmentId);
    }
  }

  const nextUnits = units.map(unit =>
    applyUnitEquipmentTotals(
      unit,
      currentUnitEquipment[unit.id] ?? {},
      nextUnitEquipment[unit.id] ?? {}
    )
  );

  return {
    unitEquipment: nextUnitEquipment,
    equipmentInventory: nextInventory,
    units: nextUnits,
    missingEquipment
  };
}
