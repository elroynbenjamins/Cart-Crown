import type { FactionId, FormationBonus, FormationDoctrine, UnitDefinition } from './types';

export const formationCells = Array.from({ length: 9 }, (_, index) => index);
export const frontRow = [0, 1, 2];
export const middleRow = [3, 4, 5];
export const rearRow = [6, 7, 8];
export const leftFlank = [0, 3, 6];
export const centerColumn = [1, 4, 7];
export const rightFlank = [2, 5, 8];

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

function orthogonalNeighbors(index: number) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  const result: number[] = [];

  if (row > 0) result.push(index - 3);
  if (row < 2) result.push(index + 3);
  if (col > 0) result.push(index - 1);
  if (col < 2) result.push(index + 1);

  return result;
}

function adjacentPairs(indices: number[], formation: Array<string | null>, units: UnitDefinition[]) {
  let pairs = 0;

  for (const index of indices) {
    const unit = unitAt(formation, units, index);
    if (!unit) continue;

    for (const neighbor of orthogonalNeighbors(index)) {
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

export function analyzeFormation(
  formation: Array<string | null>,
  units: UnitDefinition[],
  faction: FactionId,
  doctrineId: string
): FormationAnalysis {
  let attackMultiplier = 1;
  let armorMultiplier = 1;
  let speedMultiplier = 1;
  let healingMultiplier = 1;
  let momentumPerExchange = 0;

  const bonuses: FormationBonus[] = [];
  const activeUnits = formation
    .map((id, index) => ({ unit: id ? units.find(candidate => candidate.id === id) ?? null : null, index }))
    .filter(entry => entry.unit !== null);

  const frontUnits = activeUnits.filter(entry => frontRow.includes(entry.index));
  const rearUnits = activeUnits.filter(entry => rearRow.includes(entry.index));
  const flankUnits = activeUnits.filter(
    entry => leftFlank.includes(entry.index) || rightFlank.includes(entry.index)
  );

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
    speedMultiplier += Math.min(0.08, flankUnits.length * 0.015);
    bonuses.push({
      id: 'flank_space',
      name: 'Flank Initiative',
      description: 'Units on the left and right edges have clearer movement lanes.',
      value: '+' + String(Math.round(Math.min(0.08, flankUnits.length * 0.015) * 100)) + '% speed',
      active: true
    });
  }

  if (faction === 'human') {
    let protectedColumns = 0;
    for (let col = 0; col < 3; col += 1) {
      const front = unitAt(formation, units, col);
      const middle = unitAt(formation, units, col + 3);
      const rear = unitAt(formation, units, col + 6);
      const protectedUnit = rear ?? middle;

      if (
        front &&
        protectedUnit &&
        ['frontline', 'melee'].includes(front.role) &&
        ['ranged', 'support'].includes(protectedUnit.role)
      ) {
        protectedColumns += 1;
      }
    }

    if (protectedColumns > 0) {
      attackMultiplier += protectedColumns * 0.04;
      armorMultiplier += protectedColumns * 0.02;
      bonuses.push({
        id: 'human_combined_arms',
        name: 'Protected Position',
        description: 'Human specialists directly behind infantry gain coordinated protection.',
        value: '+' + String(protectedColumns * 4) + '% offense',
        active: true
      });
    }

    const frontAdjacent =
      (occupied(formation, 0) && occupied(formation, 1) ? 1 : 0) +
      (occupied(formation, 1) && occupied(formation, 2) ? 1 : 0);

    if (frontAdjacent > 0) {
      armorMultiplier += 0.06;
      bonuses.push({
        id: 'human_shield_line',
        name: 'Locked Line',
        description: 'Adjacent Human front-row squads brace together.',
        value: '+6% armor',
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
          (middleRow.includes(entry.index) || rearRow.includes(entry.index))
      );
      if (rangedBehindLine && frontUnits.length > 0) {
        attackMultiplier += 0.12;
      }
    }
  }

  if (faction === 'elf') {
    const openUnits = activeUnits.filter(entry =>
      orthogonalNeighbors(entry.index).every(neighbor => !occupied(formation, neighbor))
    );

    if (openUnits.length > 0) {
      const bonus = Math.min(0.15, openUnits.length * 0.035);
      speedMultiplier += bonus;
      attackMultiplier += bonus * 0.5;
      bonuses.push({
        id: 'elf_open_order',
        name: 'Open Order',
        description: 'Elven squads with no orthogonally adjacent ally gain precision and speed.',
        value: '+' + String(Math.round(bonus * 100)) + '% speed',
        active: true
      });
    }

    const leftRanged = activeUnits.some(
      entry => leftFlank.includes(entry.index) && entry.unit?.role === 'ranged'
    );
    const rightRanged = activeUnits.some(
      entry => rightFlank.includes(entry.index) && entry.unit?.role === 'ranged'
    );
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

    const centerSupport = centerColumn.some(index => unitAt(formation, units, index)?.role === 'support');
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
    const pairs = adjacentPairs(formationCells, formation, units);
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

    const leftCavalry = activeUnits.some(
      entry => leftFlank.includes(entry.index) && entry.unit?.role === 'cavalry'
    );
    const rightCavalry = activeUnits.some(
      entry => rightFlank.includes(entry.index) && entry.unit?.role === 'cavalry'
    );
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
