import {
  applyArmyLoadoutEquipment
} from '../src/game/armyLoadouts';
import { starterUnits } from '../src/game/data';
import { getEquipment } from '../src/game/equipment';
import type {
  UnitDefinition,
  UnitEquipmentLoadout
} from '../src/game/types';

const failures: string[] = [];

function expect(
  condition: unknown,
  message: string
) {
  if (!condition) failures.push(message);
}

function withEquipment(
  unit: UnitDefinition,
  loadout: UnitEquipmentLoadout
): UnitDefinition {
  const bonuses = Object.values(loadout)
    .map(id => getEquipment(id ?? ''))
    .filter(
      (
        item
      ): item is NonNullable<
        ReturnType<typeof getEquipment>
      > => Boolean(item)
    )
    .reduce(
      (total, item) => ({
        attack:
          total.attack + item.attackBonus,
        armor:
          total.armor + item.armorBonus,
        speed:
          total.speed + item.speedBonus
      }),
      { attack: 0, armor: 0, speed: 0 }
    );

  return {
    ...unit,
    attack: unit.attack + bonuses.attack,
    armor: unit.armor + bonuses.armor,
    speed: unit.speed + bonuses.speed
  };
}

function equipmentCounts(
  inventory: string[],
  loadouts: Record<
    string,
    UnitEquipmentLoadout
  >
) {
  const counts = new Map<string, number>();
  const add = (id: string) =>
    counts.set(id, (counts.get(id) ?? 0) + 1);

  inventory.forEach(add);
  for (const loadout of Object.values(loadouts)) {
    Object.values(loadout)
      .filter(
        (id): id is string => Boolean(id)
      )
      .forEach(add);
  }
  return counts;
}

function sameCounts(
  left: Map<string, number>,
  right: Map<string, number>
) {
  const ids = new Set([
    ...left.keys(),
    ...right.keys()
  ]);
  return [...ids].every(
    id =>
      (left.get(id) ?? 0) ===
      (right.get(id) ?? 0)
  );
}

function runRelicMoveCoverage() {
  const loadouts = {
    front: {
      weapon: 'hum_iron_sword'
    },
    rear: {
      artifact: 'hum_oathglass_relic'
    },
    reserve: {
      shield: 'hum_wood_shield'
    }
  } satisfies Record<
    string,
    UnitEquipmentLoadout
  >;

  const units = [
    withEquipment(
      {
        ...starterUnits[0]!,
        id: 'front'
      },
      loadouts.front
    ),
    withEquipment(
      {
        ...starterUnits[1]!,
        id: 'rear'
      },
      loadouts.rear
    ),
    withEquipment(
      {
        ...starterUnits[0]!,
        id: 'reserve'
      },
      loadouts.reserve
    )
  ];

  const inventory = ['hum_iron_sword'];
  const beforeCounts = equipmentCounts(
    inventory,
    loadouts
  );

  const result = applyArmyLoadoutEquipment({
    units,
    targetFormation: [
      'front',
      null,
      'rear',
      null,
      null,
      null,
      null,
      null,
      null
    ],
    savedUnitEquipment: {
      front: {
        weapon: 'hum_iron_sword',
        artifact: 'hum_oathglass_relic'
      },
      rear: {
        weapon: 'hum_iron_sword'
      }
    },
    currentUnitEquipment: loadouts,
    equipmentInventory: inventory
  });

  expect(
    result.unitEquipment.front?.artifact ===
      'hum_oathglass_relic',
    'Unique Relic was not moved to the saved target squad.'
  );
  expect(
    result.unitEquipment.rear?.artifact ===
      undefined,
    'Relic remained duplicated on its previous wearer.'
  );
  expect(
    result.unitEquipment.rear?.weapon ===
      'hum_iron_sword',
    'Second owned sword copy was not assigned to the saved loadout.'
  );
  expect(
    result.unitEquipment.reserve?.shield ===
      'hum_wood_shield',
    'Unrelated reserve gear was not preserved.'
  );
  expect(
    sameCounts(
      beforeCounts,
      equipmentCounts(
        result.equipmentInventory,
        result.unitEquipment
      )
    ),
    'Applying an Army Loadout changed total owned item counts.'
  );

  const relic = getEquipment(
    'hum_oathglass_relic'
  );
  const front = result.units.find(
    unit => unit.id === 'front'
  );
  expect(
    Boolean(
      relic &&
        front &&
        front.attack ===
          starterUnits[0]!.attack +
            (getEquipment(
              'hum_iron_sword'
            )?.attackBonus ?? 0) +
            relic.attackBonus
    ),
    'Squad combat stats did not follow the newly equipped Relic.'
  );
}

function runMissingGearCoverage() {
  const currentLoadout = {
    front: {
      weapon: 'hum_iron_sword'
    }
  } satisfies Record<
    string,
    UnitEquipmentLoadout
  >;
  const units = [
    withEquipment(
      {
        ...starterUnits[0]!,
        id: 'front'
      },
      currentLoadout.front
    )
  ];

  const result = applyArmyLoadoutEquipment({
    units,
    targetFormation: [
      'front',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    savedUnitEquipment: {
      front: {
        weapon: 'hum_infantry_spear'
      }
    },
    currentUnitEquipment: currentLoadout,
    equipmentInventory: []
  });

  expect(
    result.missingEquipment.length === 1,
    'Unavailable saved gear was not reported.'
  );
  expect(
    result.unitEquipment.front?.weapon ===
      'hum_iron_sword',
    'Unavailable saved gear did not safely fall back to the current item.'
  );
}

function runLegacyCoverage() {
  const current = {
    front: {
      weapon: 'hum_iron_sword'
    }
  } satisfies Record<
    string,
    UnitEquipmentLoadout
  >;

  const result = applyArmyLoadoutEquipment({
    units: [
      withEquipment(
        {
          ...starterUnits[0]!,
          id: 'front'
        },
        current.front
      )
    ],
    targetFormation: [
      'front',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    savedUnitEquipment: undefined,
    currentUnitEquipment: current,
    equipmentInventory: [
      'hum_iron_sword',
      'hum_iron_sword'
    ]
  });

  expect(
    result.unitEquipment.front?.weapon ===
      'hum_iron_sword' &&
      result.equipmentInventory.length === 2,
    'Legacy formation-only preset unexpectedly changed equipment or duplicate inventory counts.'
  );
}

runRelicMoveCoverage();
runMissingGearCoverage();
runLegacyCoverage();

if (failures.length > 0) {
  console.error(
    'Army Loadout regression failures:'
  );
  failures.forEach(failure =>
    console.error('- ' + failure)
  );
  process.exit(1);
}

console.log(
  'PASS: Army Loadouts move owned gear and unique Relics without duplication, preserve reserve gear and duplicate inventory counts, fall back safely when saved gear is unavailable, and leave legacy formation-only presets untouched.'
);
