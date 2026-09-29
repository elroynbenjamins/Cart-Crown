// Guards the visible identity of authored enemy fantasy threat families.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getEnemyRoleAssignments
} from '../src/game/encounters';

const rows = {
  front: [0, 1, 2],
  middle: [3, 4, 5],
  rear: [6, 7, 8]
};

function labels(id: Parameters<typeof getEnemyRoleAssignments>[0]) {
  return getEnemyRoleAssignments(id, rows, 6)
    .map(assignment => assignment.label);
}

const magicLabels = labels('war_table_ashen_hex_circle');
assert.ok(
  magicLabels.some(label =>
    ['Hexcaster', 'Spellbow', 'Hexblade', 'Ward Guard'].includes(label)
  ),
  'Magic threats lost their caster/ward battlefield role identity.'
);

const flyingLabels = labels('war_table_sky_raiders');
assert.ok(
  flyingLabels.some(label =>
    ['Sky Raider', 'Talon Scout', 'Sky Archer', 'Wingblade'].includes(label)
  ),
  'Flying threats lost their aerial battlefield role identity.'
);

const largeLabels = labels('war_table_golem_breach');
assert.ok(
  largeLabels.some(label =>
    ['Golem', 'Crusher', 'Stone Hurler', 'Binder'].includes(label)
  ),
  'Large threats lost their oversized battlefield role identity.'
);

const earlyLabels = labels('hold_the_road');
assert.ok(
  earlyLabels.every(label =>
    ![
      'Hexcaster',
      'Spellbow',
      'Sky Raider',
      'Sky Archer',
      'Golem',
      'Crusher'
    ].includes(label)
  ),
  'Early conventional encounters incorrectly inherited fantasy role labels.'
);

const gameArt = readFileSync(
  'src/ui/gameArt.tsx',
  'utf8'
);
assert.ok(
  gameArt.includes('function EnemyFantasyOverlay'),
  'EnemySprite no longer contains its fantasy visual overlay.'
);
for (const family of ['magic', 'flying', 'large']) {
  assert.ok(
    gameArt.includes("fantasyThreat === '" + family + "'"),
    'EnemySprite is missing the ' + family + ' visual branch.'
  );
}
assert.ok(
  gameArt.includes('fantasyThreat?: EnemyFantasyThreatFamily'),
  'EnemySprite no longer accepts authored fantasy threat metadata.'
);
assert.ok(
  gameArt.includes('role?: UnitRole'),
  'EnemySprite no longer receives enemy battlefield role context.'
);

const battle = readFileSync(
  'src/screens/BattleScreen.tsx',
  'utf8'
);
assert.ok(
  battle.includes('EnemyFantasyThreatAura') &&
    battle.includes('fantasyThreat={encounter.fantasyThreat}') &&
    battle.includes('role={assignment?.role}'),
  'Live Battle no longer forwards threat/role identity into enemy visuals.'
);

assert.ok(
  battle.includes('getEnemyFantasyExchangeBehavior') &&
    battle.includes('INCOMING ·') &&
    battle.includes('enemyFantasyExchangeBehavior?.damageMultiplier'),
  'Live Battle no longer telegraphs or applies the authored fantasy attack rhythm.'
);

const prep = readFileSync(
  'src/screens/BattlePrepScreen.tsx',
  'utf8'
);
assert.ok(
  prep.includes('fantasyThreat={encounter.fantasyThreat}'),
  'Battle Prep portrait no longer exposes enemy fantasy identity.'
);

assert.ok(
  prep.includes('getEnemyFantasyPatternSummary') &&
    prep.includes('PATTERN ·'),
  'Battle Prep no longer explains the enemy fantasy attack rhythm before combat.'
);

const visuals = readFileSync(
  'src/ui/battleVisuals.tsx',
  'utf8'
);
assert.ok(
  visuals.includes('export function EnemyFantasyThreatAura'),
  'Battle arena lost the fantasy threat aura component.'
);
for (const family of ['magic', 'flying', 'large']) {
  assert.ok(
    visuals.includes("fantasyThreat === '" + family + "'"),
    'Battle arena is missing the ' + family + ' threat motif.'
  );
}

console.log(
  'PASS: Magic, Flying and Large enemies keep distinct roles, sprite overlays and battlefield threat motifs without contaminating early conventional encounters.'
);
