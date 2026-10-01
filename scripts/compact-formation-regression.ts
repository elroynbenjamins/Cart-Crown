import assert from 'node:assert/strict';
import {
  formationShapes,
  getFormationMatchup,
  getFormationVisibleSlots,
  getPreferredFormationSlots,
  reflowFormationToShape
} from '../src/game/formation';
import { stageTokens } from '../src/ui/portraitBattle/model';
import {
  createNewSaveRecord,
  normalizeSaveRecord
} from '../src/save/schema';
import type {
  FormationShapeId,
  UnitDefinition,
  UnitRole
} from '../src/game/types';

const compact: Array<{
  id: FormationShapeId;
  layout: string;
  rows: [number, number, number];
}> = [
  { id: 'forward_line_411', layout: '4–1–1', rows: [4, 1, 1] },
  { id: 'iron_wall_501', layout: '5–0–1', rows: [5, 0, 1] },
  { id: 'layered_core_231', layout: '2–3–1', rows: [2, 3, 1] }
];

for (const expected of compact) {
  const shape = formationShapes.find(candidate => candidate.id === expected.id);
  assert.ok(shape, expected.id + ' is missing');
  assert.equal(shape.layout, expected.layout);
  assert.deepEqual(
    [shape.rows.front.length, shape.rows.middle.length, shape.rows.rear.length],
    expected.rows
  );
  const visible = getFormationVisibleSlots(shape.id);
  assert.equal(visible.length, 6, shape.id + ' must expose exactly six positions');
  assert.equal(new Set(visible).size, 6, shape.id + ' has duplicate positions');
  assert.ok(visible.every(slot => slot >= 0 && slot < 9));

  const ally = stageTokens(shape, visible, 'ally', 360, 360);
  const enemy = stageTokens(shape, visible, 'enemy', 360, 360);
  assert.equal(ally.length, 6);
  assert.equal(enemy.length, 6);
  for (const row of ['front', 'middle', 'rear'] as const) {
    const allyRow = ally.filter(token => token.row === row);
    const enemyRow = enemy.filter(token => token.row === row);
    assert.equal(allyRow.length, shape.rows[row].length);
    assert.equal(enemyRow.length, shape.rows[row].length);
    if (allyRow.length) {
      assert.ok(allyRow.every(token => token.y > 180), 'Allied ranks stay on the lower half');
      assert.ok(enemyRow.every(token => token.y < 180), 'Enemy ranks stay on the upper half');
    }
  }
}

assert.equal(getFormationMatchup('iron_wall_501', 'forward_line_411').result, 'advantage');
assert.equal(getFormationMatchup('layered_core_231', 'iron_wall_501').result, 'advantage');
assert.equal(getFormationMatchup('forward_line_411', 'layered_core_231').result, 'advantage');
assert.equal(getFormationMatchup('forward_line_411', 'iron_wall_501').result, 'disadvantage');

for (const { id } of compact) {
  let advantages = 0;
  let disadvantages = 0;
  for (const opponent of formationShapes) {
    if (opponent.id === id) continue;
    const result = getFormationMatchup(id, opponent.id).result;
    if (result === 'advantage') advantages += 1;
    if (result === 'disadvantage') disadvantages += 1;
  }
  assert.ok(advantages >= 2, id + ' needs at least two meaningful advantages');
  assert.ok(disadvantages >= 2, id + ' needs at least two meaningful disadvantages');
}

const roles: UnitRole[] = ['frontline', 'melee', 'ranged', 'support', 'cavalry', 'skirmish'];
const units: UnitDefinition[] = roles.map((role, index) => ({
  id: 'compact_' + role,
  name: 'Compact ' + role,
  className: 'Test ' + role,
  faction: 'human',
  role,
  tier: 1,
  level: 1,
  hp: 10,
  attack: 5,
  armor: 5,
  speed: 5
}));
const hiddenFormation = [
  units[0]!.id,
  null,
  units[1]!.id,
  null,
  units[2]!.id,
  null,
  units[3]!.id,
  units[4]!.id,
  units[5]!.id
];
for (const { id } of compact) {
  const reflowed = reflowFormationToShape(hiddenFormation, units, id);
  const visible = new Set(getFormationVisibleSlots(id));
  const deployed = reflowed.filter((unitId): unitId is string => Boolean(unitId));
  assert.equal(deployed.length, 6, id + ' lost a squad during reflow');
  assert.equal(new Set(deployed).size, 6, id + ' duplicated a squad during reflow');
  reflowed.forEach((unitId, slot) => {
    if (unitId) assert.ok(visible.has(slot), id + ' left a squad in a hidden slot');
  });
  for (const role of roles) {
    assert.ok(
      getPreferredFormationSlots(id, role).every(slot => visible.has(slot)),
      id + ' returned a hidden preferred slot for ' + role
    );
  }
}

// A compact formation must also repair safely when loaded from a stored save
// that still contains units in legacy slots 7–9.
const save = createNewSaveRecord(1);
const human = save.snapshot.factionStates.human!;
human.formationShapeId = 'forward_line_411';
human.formation = [
  null, null, null, null, null, null,
  human.units[0]!.id,
  human.units[1]!.id,
  null
];
const normalized = normalizeSaveRecord(1, JSON.parse(JSON.stringify(save)));
assert.ok(normalized);
const repaired = normalized.snapshot.factionStates.human!;
assert.equal(repaired.formationShapeId, 'forward_line_411');
assert.equal(repaired.formation.filter(Boolean).length, 2);
const visible = new Set(getFormationVisibleSlots('forward_line_411'));
repaired.formation.forEach((unitId, slot) => {
  if (unitId) assert.ok(visible.has(slot), 'Save normalization left a hidden compact slot occupied');
});

console.log('PASS: compact 4–1–1, 5–0–1 and 2–3–1 geometry, counters, reflow and save normalization.');
