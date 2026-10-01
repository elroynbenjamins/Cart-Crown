import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  formationShapes,
  getFormationMatchup
} from '../src/game/formation';
import {
  getEnemyFormationTactic
} from '../src/game/encounters';
import {
  getFormationMiniatureRows
} from '../src/ui/FormationMiniature';

const shape = (id: string) => {
  const found = formationShapes.find(candidate => candidate.id === id);
  assert.ok(found, 'Missing formation ' + id);
  return found;
};

for (const id of ['forward_line_411','iron_wall_501','layered_core_231']) {
  const current = shape(id);
  const ally = getFormationMiniatureRows(current, 'ally');
  const enemy = getFormationMiniatureRows(current, 'enemy');
  assert.deepEqual(ally.map(row => row.key), ['front','middle','rear']);
  assert.deepEqual(enemy.map(row => row.key), ['rear','middle','front']);
  assert.equal(ally.reduce((sum,row)=>sum+row.slots.length,0), 6);
  assert.equal(enemy.reduce((sum,row)=>sum+row.slots.length,0), 6);
}
assert.equal(shape('iron_wall_501').rows.middle.length, 0);
assert.equal(getFormationMiniatureRows(shape('iron_wall_501'),'ally')[1]!.slots.length, 0);
assert.equal(getFormationMiniatureRows(shape('iron_wall_501'),'enemy')[1]!.slots.length, 0);

assert.equal(getEnemyFormationTactic('war_table_red_banner').formationShapeId, 'forward_line_411');
assert.equal(getEnemyFormationTactic('war_table_stonegate_pikes').formationShapeId, 'iron_wall_501');
assert.equal(getEnemyFormationTactic('war_table_ashen_reserves').formationShapeId, 'layered_core_231');

for (const [player, enemy] of [
  ['forward_line_411','layered_core_231'],
  ['iron_wall_501','forward_line_411'],
  ['layered_core_231','iron_wall_501']
] as const) {
  assert.equal(getFormationMatchup(player, enemy).result, 'advantage');
}

const prep = readFileSync('src/screens/BattlePrepScreen.tsx','utf8');
assert.ok(prep.includes('<FormationMiniature'));
assert.ok(prep.includes('label="YOU"'));
assert.ok(prep.includes('label="ENEMY"'));
assert.ok(prep.includes('formationMatchup.summary'));
assert.ok(prep.includes('Formation comparison. You '));
assert.ok(prep.includes('formationDuel'));
assert.ok(prep.includes('formationRead'));

const mini = readFileSync('src/ui/FormationMiniature.tsx','utf8');
assert.ok(mini.includes('No') === false, 'Miniature should stay graphical rather than inserting explanatory prose');
assert.ok(mini.includes('row.slots.length > 0'));
assert.ok(mini.includes('importantForAccessibility="no-hide-descendants"'));

console.log('PASS: Battle Prep compares player/enemy formations, preserves compact geometry, and maps three War Table encounters to compact tactics.');
