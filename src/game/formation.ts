import type {
  FactionId,
  FormationBonus,
  FormationDoctrine,
  FormationShapeDefinition,
  FormationShapeId,
  UnitDefinition,
  UnitRole
} from './types';

export const formationCells = Array.from({ length: 9 }, (_, index) => index);

export const formationShapes: FormationShapeDefinition[] = [
  {
    id: 'balanced_333',
    name: 'Balanced Line',
    layout: '3–3–3',
    rows: { front: [0, 1, 2], middle: [3, 4, 5], rear: [6, 7, 8] },
    unlock: 'Start',
    summary: 'Even depth across all three lines. Easy to read and hard to exploit.',
    strength: 'Reliable mixed armies',
    risk: 'No specialized pressure'
  },
  {
    id: 'assault_432',
    name: 'Assault Line',
    layout: '4–3–2',
    rows: { front: [0, 1, 2, 3], middle: [4, 5, 6], rear: [7, 8] },
    unlock: 'Settlement',
    summary: 'Commits more bodies forward while keeping enough depth for a mixed force.',
    strength: 'Melee pressure and aggressive cavalry',
    risk: 'Less protected ranged space'
  },
  {
    id: 'deep_234',
    name: 'Deep Formation',
    layout: '2–3–4',
    rows: { front: [0, 1], middle: [2, 3, 4], rear: [5, 6, 7, 8] },
    unlock: 'Settlement',
    summary: 'A narrow screen protects a deeper reserve and ranged line.',
    strength: 'Support, ranged and counterattacks',
    risk: 'Thin first contact'
  },
  {
    id: 'wide_vanguard_522',
    name: 'Wide Vanguard',
    layout: '5–2–2',
    rows: { front: [0, 1, 2, 3, 4], middle: [5, 6], rear: [7, 8] },
    unlock: 'Fort',
    summary: 'A broad first line denies easy flanks and lets durable infantry occupy more frontage.',
    strength: 'Shield infantry and line holders',
    risk: 'Limited depth behind the front'
  },
  {
    id: 'protected_rear_225',
    name: 'Protected Rear',
    layout: '2–2–5',
    rows: { front: [0, 1], middle: [2, 3], rear: [4, 5, 6, 7, 8] },
    unlock: 'Fort',
    summary: 'A compact screen buys time for a large ranged or support back line.',
    strength: 'Archers, crossbows and support',
    risk: 'Breakthroughs are dangerous'
  },
  {
    id: 'reinforced_center_252',
    name: 'Reinforced Center',
    layout: '2–5–2',
    rows: { front: [0, 1], middle: [2, 3, 4, 5, 6], rear: [7, 8] },
    unlock: 'Town',
    summary: 'A dense central reserve can reinforce either side and absorb a broken front.',
    strength: 'Flexible elites and reserves',
    risk: 'Front line starts narrow'
  },
  {
    id: 'spear_wall_531',
    name: 'Spear Wall',
    layout: '5–3–1',
    rows: { front: [0, 1, 2, 3, 4], middle: [5, 6, 7], rear: [8] },
    unlock: 'Town',
    summary: 'Maximum frontage with a supporting second rank and almost no rear depth.',
    strength: 'Spears, shields and anti-charge armies',
    risk: 'Very little protected rear space'
  },
  {
    id: 'skirmish_screen_243',
    name: 'Skirmish Screen',
    layout: '2–4–3',
    rows: { front: [0, 1], middle: [2, 3, 4, 5], rear: [6, 7, 8] },
    unlock: 'Town',
    summary: 'A light screen gives mobile troops room to rotate through the middle.',
    strength: 'Scouts, cavalry and flexible ranged units',
    risk: 'Less staying power on first contact'
  },
  {
    id: 'heavy_front_441',
    name: 'Heavy Front',
    layout: '4–4–1',
    rows: { front: [0, 1, 2, 3], middle: [4, 5, 6, 7], rear: [8] },
    unlock: 'Stronghold',
    summary: 'Two heavy combat ranks overwhelm the center at the cost of rear protection.',
    strength: 'Veteran melee and shock troops',
    risk: 'Almost no safe ranged line'
  }
];

export const formationDoctrines: FormationDoctrine[] = [
  {
    id: 'human_balanced',
    faction: 'human',
    name: 'Balanced Line',
    description: 'A flexible Human order with a small bonus to both offense and defense.',
    unlock: 'Start'
  },
  {
    id: 'human_hold',
    faction: 'human',
    name: 'Hold the Line',
    description: 'Front-row discipline improves armor but slightly reduces speed.',
    unlock: 'Start'
  },
  {
    id: 'human_volley',
    faction: 'human',
    name: 'Volley Discipline',
    description: 'Ranged squads behind a frontline gain stronger coordinated fire.',
    unlock: 'Settlement'
  },
  {
    id: 'elf_open',
    faction: 'elf',
    name: 'Open Order',
    description: 'Elven squads with space around them gain speed and precision.',
    unlock: 'Start'
  },
  {
    id: 'elf_crescent',
    faction: 'elf',
    name: 'Crescent Formation',
    description: 'Separated left and right pressure creates crossfire and flank bonuses.',
    unlock: 'Settlement'
  },
  {
    id: 'elf_ward',
    faction: 'elf',
    name: 'Living Ward',
    description: 'A support unit in the center anchors protective ward-lines.',
    unlock: 'Fort'
  },
  {
    id: 'orc_warband',
    faction: 'orc',
    name: 'Warband',
    description: 'Adjacent Orc melee squads build morale and attack power together.',
    unlock: 'Start'
  },
  {
    id: 'orc_rush',
    faction: 'orc',
    name: 'Blood Rush',
    description: 'Front-row aggression trades some armor for stronger opening pressure.',
    unlock: 'Settlement'
  },
  {
    id: 'orc_pincer',
    faction: 'orc',
    name: 'Pack Pincer',
    description: 'Mounted units attacking from opposite flanks amplify the opening charge.',
    unlock: 'Fort'
  }
];

export type FormationAnalysis = {
  attackMultiplier: number;
  armorMultiplier: number;
  speedMultiplier: number;
  healingMultiplier: number;
  momentumPerExchange: number;
  bonuses: FormationBonus[];
};

type SlotPosition = {
  row: 'front' | 'middle' | 'rear';
  rowIndex: number;
  x: number;
  y: number;
};

export function getFormationShape(id: FormationShapeId | string | null | undefined) {
  return formationShapes.find(shape => shape.id === id) ?? formationShapes[0]!;
}

export function getFormationRows(id: FormationShapeId | string | null | undefined) {
  return getFormationShape(id).rows;
}

export function getFormationShapeByLayout(layout: string) {
  return formationShapes.find(shape => shape.layout === layout) ?? formationShapes[0]!;
}

function centerFirst(indices: number[]) {
  const middle = (indices.length - 1) / 2;
  return [...indices].sort(
    (a, b) => Math.abs(indices.indexOf(a) - middle) - Math.abs(indices.indexOf(b) - middle)
  );
}

function edgeFirst(indices: number[]) {
  if (indices.length <= 2) return [...indices];
  const result: number[] = [];
  let left = 0;
  let right = indices.length - 1;
  while (left <= right) {
    result.push(indices[left]!);
    if (right !== left) result.push(indices[right]!);
    left += 1;
    right -= 1;
  }
  return result;
}

export function getPreferredFormationSlots(
  shapeId: FormationShapeId | string | null | undefined,
  role: UnitRole
) {
  const rows = getFormationRows(shapeId);

  if (role === 'ranged' || role === 'support') {
    return [
      ...centerFirst(rows.rear),
      ...centerFirst(rows.middle),
      ...centerFirst(rows.front)
    ];
  }

  if (role === 'cavalry' || role === 'skirmish') {
    return [
      ...edgeFirst(rows.front),
      ...edgeFirst(rows.middle),
      ...edgeFirst(rows.rear)
    ];
  }

  return [
    ...centerFirst(rows.front),
    ...centerFirst(rows.middle),
    ...centerFirst(rows.rear)
  ];
}

function buildSlotPositions(shapeId: FormationShapeId | string | null | undefined) {
  const rows = getFormationRows(shapeId);
  const positions = new Map<number, SlotPosition>();

  ([
    ['front', rows.front, 0],
    ['middle', rows.middle, 1],
    ['rear', rows.rear, 2]
  ] as const).forEach(([row, slots, y]) => {
    slots.forEach((slot, rowIndex) => {
      positions.set(slot, {
        row,
        rowIndex,
        x: slots.length === 1 ? 0.5 : rowIndex / (slots.length - 1),
        y
      });
    });
  });

  return positions;
}

function neighborSlots(
  slot: number,
  shapeId: FormationShapeId | string | null | undefined
) {
  const positions = buildSlotPositions(shapeId);
  const current = positions.get(slot);
  if (!current) return [];

  return formationCells.filter(otherSlot => {
    if (otherSlot === slot) return false;
    const other = positions.get(otherSlot);
    if (!other) return false;

    if (other.row === current.row) {
      return Math.abs(other.rowIndex - current.rowIndex) === 1;
    }

    return Math.abs(other.y - current.y) === 1 && Math.abs(other.x - current.x) <= 0.27;
  });
}

export function areFormationSlotsAdjacent(
  shapeId: FormationShapeId | string | null | undefined,
  a: number,
  b: number
) {
  return neighborSlots(a, shapeId).includes(b);
}

export function areFormationSlotsVerticallyAligned(
  shapeId: FormationShapeId | string | null | undefined,
  a: number,
  b: number
) {
  const positions = buildSlotPositions(shapeId);
  const first = positions.get(a);
  const second = positions.get(b);
  if (!first || !second || first.row === second.row) return false;

  return Math.abs(first.x - second.x) <= 0.28;
}

function unitAt(
  formation: Array<string | null>,
  units: UnitDefinition[],
  index: number
) {
  const id = formation[index];
  return id ? units.find(unit => unit.id === id) ?? null : null;
}

function occupied(formation: Array<string | null>, index: number) {
  return Boolean(formation[index]);
}

function adjacentPairs(
  formation: Array<string | null>,
  units: UnitDefinition[],
  shapeId: FormationShapeId | string | null | undefined
) {
  let pairs = 0;

  for (const index of formationCells) {
    const unit = unitAt(formation, units, index);
    if (!unit) continue;

    for (const neighbor of neighborSlots(index, shapeId)) {
      if (neighbor <= index) continue;
      const other = unitAt(formation, units, neighbor);
      if (!other) continue;
      if (
        ['frontline', 'melee', 'cavalry'].includes(unit.role) &&
        ['frontline', 'melee', 'cavalry'].includes(other.role)
      ) {
        pairs += 1;
      }
    }
  }

  return pairs;
}

export function getFactionDoctrines(faction: FactionId) {
  return formationDoctrines.filter(doctrine => doctrine.faction === faction);
}

function applyShapeIdentity(
  shapeId: FormationShapeId,
  rearSpecialistPresent: boolean,
  pushBonus: (bonus: FormationBonus) => void
) {
  let attack = 0;
  let armor = 0;
  let speed = 0;
  let healing = 0;

  if (shapeId === 'assault_432') {
    attack += 0.03;
    speed += 0.02;
    armor -= 0.01;
  } else if (shapeId === 'deep_234') {
    armor += 0.03;
    healing += 0.04;
  } else if (shapeId === 'wide_vanguard_522') {
    armor += 0.04;
    speed -= 0.02;
  } else if (shapeId === 'protected_rear_225') {
    if (rearSpecialistPresent) {
      attack += 0.04;
      healing += 0.04;
    }
    armor -= 0.02;
  } else if (shapeId === 'reinforced_center_252') {
    attack += 0.02;
    armor += 0.03;
  } else if (shapeId === 'spear_wall_531') {
    armor += 0.05;
    speed -= 0.03;
  } else if (shapeId === 'skirmish_screen_243') {
    attack += 0.02;
    speed += 0.05;
    armor -= 0.02;
  } else if (shapeId === 'heavy_front_441') {
    attack += 0.04;
    armor += 0.03;
    speed -= 0.03;
  }

  if (attack !== 0 || armor !== 0 || speed !== 0 || healing !== 0) {
    const shape = getFormationShape(shapeId);
    const parts: string[] = [];
    if (attack) parts.push((attack > 0 ? '+' : '') + String(Math.round(attack * 100)) + '% ATK');
    if (armor) parts.push((armor > 0 ? '+' : '') + String(Math.round(armor * 100)) + '% ARM');
    if (speed) parts.push((speed > 0 ? '+' : '') + String(Math.round(speed * 100)) + '% SPD');
    if (healing) parts.push((healing > 0 ? '+' : '') + String(Math.round(healing * 100)) + '% healing');
    pushBonus({
      id: 'shape_' + shape.id,
      name: shape.layout + ' · ' + shape.name,
      description: shape.summary,
      value: parts.join(' · '),
      active: true
    });
  }

  return { attack, armor, speed, healing };
}

export function analyzeFormation(
  formation: Array<string | null>,
  units: UnitDefinition[],
  faction: FactionId,
  doctrineId: string,
  shapeId: FormationShapeId = 'balanced_333'
): FormationAnalysis {
  let attackMultiplier = 1;
  let armorMultiplier = 1;
  let speedMultiplier = 1;
  let healingMultiplier = 1;
  let momentumPerExchange = 0;

  const bonuses: FormationBonus[] = [];
  const shape = getFormationShape(shapeId);
  const rows = shape.rows;
  const positions = buildSlotPositions(shape.id);
  const activeUnits = formation
    .map((id, index) => ({
      unit: id ? units.find(candidate => candidate.id === id) ?? null : null,
      index
    }))
    .filter(entry => entry.unit !== null);

  const frontUnits = activeUnits.filter(entry => rows.front.includes(entry.index));
  const rearUnits = activeUnits.filter(entry => rows.rear.includes(entry.index));
  const flankUnits = activeUnits.filter(entry => {
    const position = positions.get(entry.index);
    return Boolean(position && (position.x <= 0.01 || position.x >= 0.99));
  });

  if (frontUnits.length > 0) {
    armorMultiplier += 0.04;
    bonuses.push({
      id: 'front_row',
      name: 'Front Line',
      description: 'Squads committed to the front row reinforce the formation.',
      value: '+4% formation armor',
      active: true
    });
  }

  const rearSpecialists = rearUnits.filter(
    entry => entry.unit?.role === 'ranged' || entry.unit?.role === 'support'
  );
  if (rearSpecialists.length > 0) {
    attackMultiplier += rearSpecialists.some(entry => entry.unit?.role === 'ranged') ? 0.05 : 0;
    healingMultiplier += rearSpecialists.some(entry => entry.unit?.role === 'support') ? 0.08 : 0;
    bonuses.push({
      id: 'rear_specialists',
      name: 'Rear Support',
      description: 'Ranged and support squads perform better from protected rear positions.',
      value: '+5% ranged / +8% healing',
      active: true
    });
  }

  if (flankUnits.length > 0) {
    const flankBonus = Math.min(0.08, flankUnits.length * 0.015);
    speedMultiplier += flankBonus;
    bonuses.push({
      id: 'flank_space',
      name: 'Flank Initiative',
      description: 'Units on the outer edges have clearer movement lanes.',
      value: '+' + String(Math.round(flankBonus * 100)) + '% speed',
      active: true
    });
  }

  const shapeIdentity = applyShapeIdentity(
    shape.id,
    rearSpecialists.length > 0,
    bonus => bonuses.push(bonus)
  );
  attackMultiplier += shapeIdentity.attack;
  armorMultiplier += shapeIdentity.armor;
  speedMultiplier += shapeIdentity.speed;
  healingMultiplier += shapeIdentity.healing;

  if (faction === 'human') {
    let protectedPositions = 0;

    for (const entry of activeUnits) {
      if (!entry.unit || !['ranged', 'support'].includes(entry.unit.role)) continue;
      const specialistPosition = positions.get(entry.index);
      if (!specialistPosition || specialistPosition.row === 'front') continue;

      const protectedByFront = rows.front.some(frontSlot => {
        const front = unitAt(formation, units, frontSlot);
        const frontPosition = positions.get(frontSlot);
        return Boolean(
          front &&
            frontPosition &&
            ['frontline', 'melee'].includes(front.role) &&
            Math.abs(frontPosition.x - specialistPosition.x) <= 0.28
        );
      });

      if (protectedByFront) protectedPositions += 1;
    }

    if (protectedPositions > 0) {
      const capped = Math.min(3, protectedPositions);
      attackMultiplier += capped * 0.04;
      armorMultiplier += capped * 0.02;
      bonuses.push({
        id: 'human_combined_arms',
        name: 'Protected Position',
        description: 'Human specialists aligned behind infantry gain coordinated protection.',
        value: '+' + String(capped * 4) + '% offense',
        active: true
      });
    }

    let frontAdjacent = 0;
    rows.front.forEach((slot, index) => {
      const next = rows.front[index + 1];
      if (next !== undefined && occupied(formation, slot) && occupied(formation, next)) {
        frontAdjacent += 1;
      }
    });

    if (frontAdjacent > 0) {
      armorMultiplier += Math.min(0.1, 0.04 + frontAdjacent * 0.02);
      bonuses.push({
        id: 'human_shield_line',
        name: 'Locked Line',
        description: 'Adjacent Human front-row squads brace together.',
        value: '+' + String(Math.min(10, 4 + frontAdjacent * 2)) + '% armor',
        active: true
      });
    }

    if (doctrineId === 'human_balanced') {
      attackMultiplier += 0.03;
      armorMultiplier += 0.03;
    } else if (doctrineId === 'human_hold') {
      armorMultiplier += 0.1;
      speedMultiplier -= 0.03;
    } else if (doctrineId === 'human_volley') {
      const rangedBehindLine = activeUnits.some(
        entry =>
          entry.unit?.role === 'ranged' &&
          (rows.middle.includes(entry.index) || rows.rear.includes(entry.index))
      );
      if (rangedBehindLine && frontUnits.length > 0) {
        attackMultiplier += 0.12;
      }
    }
  }

  if (faction === 'elf') {
    const openUnits = activeUnits.filter(entry =>
      neighborSlots(entry.index, shape.id).every(neighbor => !occupied(formation, neighbor))
    );

    if (openUnits.length > 0) {
      const bonus = Math.min(0.15, openUnits.length * 0.035);
      speedMultiplier += bonus;
      attackMultiplier += bonus * 0.5;
      bonuses.push({
        id: 'elf_open_order',
        name: 'Open Order',
        description: 'Elven squads with no nearby ally gain precision and speed.',
        value: '+' + String(Math.round(bonus * 100)) + '% speed',
        active: true
      });
    }

    const leftRanged = activeUnits.some(entry => {
      const position = positions.get(entry.index);
      return entry.unit?.role === 'ranged' && Boolean(position && position.x <= 0.01);
    });
    const rightRanged = activeUnits.some(entry => {
      const position = positions.get(entry.index);
      return entry.unit?.role === 'ranged' && Boolean(position && position.x >= 0.99);
    });
    if (leftRanged && rightRanged) {
      attackMultiplier += 0.1;
      bonuses.push({
        id: 'elf_crossfire',
        name: 'Crossfire',
        description: 'Ranged squads pressure the enemy from both flanks.',
        value: '+10% attack',
        active: true
      });
    }

    const centerSupport = activeUnits.some(entry => {
      const position = positions.get(entry.index);
      return entry.unit?.role === 'support' && Boolean(position && Math.abs(position.x - 0.5) <= 0.16);
    });
    if (centerSupport) {
      armorMultiplier += 0.06;
      healingMultiplier += 0.1;
      bonuses.push({
        id: 'elf_ward_anchor',
        name: 'Ward Anchor',
        description: 'A centered support squad stabilizes protective ward-lines.',
        value: '+6% armor / +10% healing',
        active: true
      });
    }

    if (doctrineId === 'elf_open') speedMultiplier += 0.05;
    if (doctrineId === 'elf_crescent' && leftRanged && rightRanged) attackMultiplier += 0.08;
    if (doctrineId === 'elf_ward' && centerSupport) armorMultiplier += 0.08;
  }

  if (faction === 'orc') {
    const pairs = adjacentPairs(formation, units, shape.id);
    if (pairs > 0) {
      const bonus = Math.min(0.16, pairs * 0.04);
      attackMultiplier += bonus;
      momentumPerExchange += pairs;
      bonuses.push({
        id: 'orc_warband',
        name: 'Warband',
        description: 'Adjacent Orc melee squads feed each other confidence and pressure.',
        value: '+' + String(Math.round(bonus * 100)) + '% attack',
        active: true
      });
    }

    const leftCavalry = activeUnits.some(entry => {
      const position = positions.get(entry.index);
      return entry.unit?.role === 'cavalry' && Boolean(position && position.x <= 0.01);
    });
    const rightCavalry = activeUnits.some(entry => {
      const position = positions.get(entry.index);
      return entry.unit?.role === 'cavalry' && Boolean(position && position.x >= 0.99);
    });
    if (leftCavalry && rightCavalry) {
      attackMultiplier += 0.12;
      speedMultiplier += 0.06;
      momentumPerExchange += 2;
      bonuses.push({
        id: 'orc_pack_pincer',
        name: 'Pack Pincer',
        description: 'Mounted pressure from both edges traps the enemy center.',
        value: '+12% attack / +6% speed',
        active: true
      });
    }

    if (doctrineId === 'orc_warband') momentumPerExchange += 1;
    if (doctrineId === 'orc_rush') {
      attackMultiplier += 0.1;
      armorMultiplier -= 0.05;
      momentumPerExchange += 1;
    }
    if (doctrineId === 'orc_pincer' && leftCavalry && rightCavalry) {
      attackMultiplier += 0.1;
      momentumPerExchange += 2;
    }
  }

  return {
    attackMultiplier,
    armorMultiplier,
    speedMultiplier,
    healingMultiplier,
    momentumPerExchange,
    bonuses
  };
}
