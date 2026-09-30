import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  activityGroups,
  activityPresentation
} from '../src/game/activityPresentation';
import { sideModes } from '../src/game/sideModes';
import {
  getRarityPresentation
} from '../src/ui/semanticColors';

assert.deepEqual(
  activityGroups.map(group => group.id),
  ['quick', 'runs', 'mastery'],
  'Activities must remain grouped into quick, persistent-run and mastery sections.'
);

for (const mode of sideModes) {
  const presentation =
    activityPresentation[mode.id];
  assert.ok(
    presentation,
    'Missing Activity presentation for ' + mode.id
  );
  assert.ok(
    activityGroups.some(
      group => group.id === presentation.group
    ),
    'Activity ' + mode.id + ' points at an unknown group.'
  );
  assert.ok(
    presentation.purpose.length <= 90,
    'Activity purpose is too long for the compact mobile card: ' + mode.id
  );
}

assert.equal(
  activityPresentation.relic_hunts.group,
  'mastery',
  'Relic Hunts must stay grouped with mastery content.'
);
assert.equal(
  getRarityPresentation('relic')?.label,
  'Relic',
  'Relic rarity presentation is missing.'
);

const human = readFileSync(
  'src/screens/CampaignScreen.tsx',
  'utf8'
);
const faction = readFileSync(
  'src/screens/FactionOpeningCampaignScreen.tsx',
  'utf8'
);
const card = readFileSync(
  'src/ui/ActivityCard.tsx',
  'utf8'
);
const relic = readFileSync(
  'src/screens/RelicHuntScreen.tsx',
  'utf8'
);

for (const [name, source] of [
  ['Human Campaign', human],
  ['Faction Campaign', faction]
] as const) {
  assert.ok(
    source.includes('activityGroups.map'),
    name + ' must render grouped Activities.'
  );
  assert.ok(
    source.includes('ActivityCard'),
    name + ' must use the compact shared Activity card.'
  );
}

assert.ok(
  card.includes('numberOfLines={2}'),
  'Compact Activity purpose text needs a mobile line cap.'
);
assert.ok(
  relic.includes('Relic Collection') &&
    relic.includes('relicCollectionClaimedFactions'),
  'Relic Hunt must expose account collection progress.'
);
assert.ok(
  relic.includes('RelicGuardianSprite') &&
    relic.includes('EquipmentSprite'),
  'Relic Hunt must visually distinguish guardians and the artifact reward.'
);
assert.ok(
  relic.includes('RarityChip'),
  'Relic Hunt reward preview must show explicit rarity.'
);

console.log(
  'PASS: Activities stay grouped and compact, Relic rarity is explicit, and the Relic Hunt exposes guardian/reward visuals plus 3-faction collection progress.'
);
