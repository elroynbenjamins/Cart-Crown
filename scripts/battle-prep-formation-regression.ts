import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  encounters,
  getEnemyFormationTactic,
  getEnemyRoleAssignments
} from '../src/game/encounters';
import { getFormationShape } from '../src/game/formation';

const expected = {
  mercenary_patrol: 'forward_line_411',
  ch2_beyond_fires: 'layered_core_231',
  border_fort: 'iron_wall_501',
  elf_ward_hunters: 'layered_core_231',
  orc_red_road: 'forward_line_411',
  orc_stonejaw_challengers: 'iron_wall_501'
} as const;

assert.equal(
  getEnemyFormationTactic('hold_the_road').formationShapeId,
  'skirmish_screen_243',
  'Opening tutorial encounter should retain its established formation.'
);

for (const [id, shapeId] of Object.entries(expected)) {
  const encounterId = id as keyof typeof expected;
  const encounter = encounters[encounterId];
  const tactic = getEnemyFormationTactic(encounterId);
  assert.equal(tactic.formationShapeId, shapeId, id + ' lost compact enemy formation');
  const shape = getFormationShape(shapeId);
  const visibleSlots = [
    ...shape.rows.front,
    ...shape.rows.middle,
    ...shape.rows.rear
  ];
  assert.ok(
    encounter.enemyCount <= visibleSlots.length,
    id + ' has more enemies than visible compact formation positions'
  );
  const assignments = getEnemyRoleAssignments(
    encounterId,
    shape.rows,
    encounter.enemyCount
  );
  assert.equal(assignments.length, encounter.enemyCount, id + ' lost enemy tokens');
  assert.equal(
    new Set(assignments.map(item => item.slot)).size,
    assignments.length,
    id + ' duplicated an enemy formation slot'
  );
  assert.ok(
    assignments.every(item => visibleSlots.includes(item.slot)),
    id + ' placed an enemy outside the authored formation'
  );
}

const miniature = readFileSync('src/ui/FormationShapeMiniature.tsx', 'utf8');
assert.ok(miniature.includes("facing === 'down'"), 'Enemy formation miniature must reverse rank order.');
assert.ok(miniature.includes('shape.rows.front') && miniature.includes('shape.rows.middle') && miniature.includes('shape.rows.rear'));
assert.ok(miniature.includes('slots.length > 0'), 'Empty ranks must render deliberately rather than disappear silently.');

const prep = readFileSync('src/screens/BattlePrepScreen.tsx', 'utf8');
assert.ok(prep.includes('FormationShapeMiniature'));
assert.ok(prep.includes('facing="up"'), 'Player miniature must face toward the engagement.');
assert.ok(prep.includes('facing="down"'), 'Enemy miniature must face toward the engagement.');
assert.ok(prep.includes('YOU') && prep.includes('ENEMY'));
assert.ok(prep.includes('formationMatchup.summary'), 'Battle Prep must explain the formation edge.');
assert.ok(prep.includes("shape={shape}") && prep.includes('Quick formation switch'));
assert.ok(prep.includes('Squads on positions shared by both shapes stay put'), 'Battle Prep must explain compact-shape reflow accurately.');

const formationScreen = readFileSync('src/screens/FormationScreen.tsx', 'utf8');
assert.ok(formationScreen.includes("from '../ui/FormationShapeMiniature'"));
assert.ok(!formationScreen.includes('function FormationShapeMiniature('), 'FormationScreen must use the shared miniature component.');

console.log('PASS: Battle Prep formation diagrams, compact enemy assignments, token capacity, facing and switch guidance.');
