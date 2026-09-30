// Guards the visible identity of authored enemy fantasy threat families.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  getEncounter,
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

const hybridLabels = labels('unbound_beacon');
assert.ok(
  hybridLabels.some(label =>
    ['Legend Guard', 'Arcane Flyer', 'Spellwing', 'War Caster'].includes(label)
  ),
  'Hybrid threats lost their combined magic/flight battlefield role identity.'
);
assert.equal(
  getEncounter('unbound_beacon').fantasyThreat,
  'hybrid',
  'The final Beacon battle no longer exercises the Hybrid threat presentation path.'
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
for (const family of ['magic', 'flying', 'large', 'hybrid']) {
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
for (const role of ['support', 'ranged', 'cavalry', 'melee']) {
  assert.ok(
    gameArt.includes("role === '" + role + "'"),
    'Enemy fantasy sprite overlays lost the ' + role + ' role distinction.'
  );
}

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
  battle.includes('EnemyFantasyStrikeVfx') &&
    battle.includes('progress={impactPulse}'),
  'Live Battle no longer drives threat-specific exchange VFX from the existing impact pulse.'
);
assert.ok(
  battle.includes('assignment?.label') &&
    battle.includes('.slice(0, 4)'),
  'Dense enemy rows no longer preserve authored fantasy-role identity.'
);

const prep = readFileSync(
  'src/screens/BattlePrepScreen.tsx',
  'utf8'
);
assert.ok(
  prep.includes('fantasyThreat={encounter.fantasyThreat}'),
  'Battle Prep portrait no longer exposes enemy fantasy identity.'
);

const visuals = readFileSync(
  'src/ui/battleVisuals.tsx',
  'utf8'
);
assert.ok(
  visuals.includes('export function EnemyFantasyThreatAura'),
  'Battle arena lost the fantasy threat aura component.'
);
assert.ok(
  visuals.includes('export function EnemyFantasyStrikeVfx') &&
    visuals.includes('progress.interpolate'),
  'Battle arena lost threat-specific exchange VFX or stopped using the shared exchange animation progress.'
);
assert.ok(
  !/EnemyFantasyStrikeVfx[\s\S]*?(setInterval\(|setTimeout\(|Animated\.loop)/.test(visuals),
  'Enemy fantasy exchange VFX must not create an independent animation clock.'
);
for (const family of ['magic', 'flying', 'large', 'hybrid']) {
  assert.ok(
    visuals.includes("fantasyThreat === '" + family + "'"),
    'Battle arena is missing the ' + family + ' threat motif.'
  );
}

console.log(
  'PASS: Magic, Flying, Large and Hybrid enemies keep distinct roles, role-sensitive overlays, battlefield motifs and exchange VFX without contaminating early conventional encounters.'
);
