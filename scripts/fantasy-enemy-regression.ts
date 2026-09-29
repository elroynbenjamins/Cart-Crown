import {
  getEncounter
} from '../src/game/encounters';
import {
  getEnemyFantasyThreatAssessment
} from '../src/game/enemyFantasy';
import type {
  UnitDefinition
} from '../src/game/types';

function check(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) throw new Error(message);
}

const unit = (
  id: string,
  className: string,
  role: UnitDefinition['role'],
  battleTags: UnitDefinition['battleTags'] = []
): UnitDefinition => ({
  id,
  name: className,
  className,
  faction: 'human',
  role,
  tier: 5,
  level: 10,
  hp: 120,
  attack: 24,
  armor: 10,
  speed: 12,
  battleTags
});

function runEncounterCoverage() {
  check(
    getEncounter('war_table_ashen_hex_circle')
      .fantasyThreat === 'magic',
    'Chapter 4 fantasy contract must expose Magic threat metadata.'
  );
  check(
    getEncounter('war_table_sky_raiders')
      .fantasyThreat === 'flying',
    'Chapter 5 fantasy contract must expose Flying threat metadata.'
  );
  check(
    getEncounter('war_table_golem_breach')
      .fantasyThreat === 'large',
    'Chapter 6 fantasy contract must expose Large threat metadata.'
  );
  check(
    getEncounter('elf_ashen_druid')
      .fantasyThreat === 'magic',
    'The Ashen Druid story boss should teach enemy Magic pressure.'
  );
  check(
    getEncounter('elf_worldroot_guardian')
      .fantasyThreat === 'large',
    'The Worldroot Guardian story boss should teach enemy Large-unit pressure.'
  );
  check(
    !getEncounter('hold_the_road')
      .fantasyThreat,
    'Early Chapter 1 encounters must not gain fantasy threats retroactively.'
  );
}

function runMagicCounterCoverage() {
  const encounter =
    getEncounter('war_table_ashen_hex_circle');
  const exposed =
    getEnemyFantasyThreatAssessment(
      encounter,
      [
        unit('sword', 'Swordsman', 'melee')
      ]
    );
  const countered =
    getEnemyFantasyThreatAssessment(
      encounter,
      [
        unit('ward', 'Dawnkeeper', 'support', ['magic', 'support']),
        unit('guard', 'Shield Guard', 'frontline')
      ]
    );

  check(
    exposed?.family === 'magic' &&
      !exposed.countered &&
      exposed.incomingDamageMultiplier > 1,
    'Unscreened armies must take extra pressure from enemy Magic.'
  );
  check(
    countered?.countered &&
      countered.incomingDamageMultiplier < 1 &&
      countered.outgoingDamageMultiplier > 1,
    'Support and magical specialists must meaningfully counter enemy Magic.'
  );
}

function runFlyingCounterCoverage() {
  const encounter =
    getEncounter('war_table_sky_raiders');
  const exposed =
    getEnemyFantasyThreatAssessment(
      encounter,
      [
        unit('guard', 'Shield Guard', 'frontline'),
        unit('sword', 'Swordsman', 'melee')
      ]
    );
  const countered =
    getEnemyFantasyThreatAssessment(
      encounter,
      [
        unit('archer', 'Archer', 'ranged', ['ranged']),
        unit('ranger', 'Ranger', 'skirmish', ['ranged'])
      ]
    );

  check(
    exposed?.family === 'flying' &&
      !exposed.countered &&
      exposed.incomingDamageMultiplier >= 1.1,
    'Armies without ranged coverage must be vulnerable to enemy flyers.'
  );
  check(
    countered?.countered &&
      countered.incomingDamageMultiplier < 1 &&
      countered.outgoingDamageMultiplier > 1,
    'Ranged and skirmish squads must form a practical anti-air answer.'
  );
}

function runLargeCounterCoverage() {
  const encounter =
    getEncounter('war_table_golem_breach');
  const exposed =
    getEnemyFantasyThreatAssessment(
      encounter,
      [
        unit('sword', 'Swordsman', 'melee'),
        unit('guard', 'Shield Guard', 'frontline')
      ]
    );
  const countered =
    getEnemyFantasyThreatAssessment(
      encounter,
      [
        unit('spear', 'Veteran Spearman', 'frontline'),
        unit('lancer', 'Royal Lancer', 'cavalry')
      ]
    );

  check(
    exposed?.family === 'large' &&
      !exposed.countered &&
      exposed.incomingDamageMultiplier >= 1.1,
    'Armies without anti-large tools must be vulnerable to enemy Large units.'
  );
  check(
    countered?.countered &&
      countered.incomingDamageMultiplier < 1 &&
      countered.outgoingDamageMultiplier > 1,
    'Spears and lancers must remain reliable Large-unit counters.'
  );
}

runEncounterCoverage();
runMagicCounterCoverage();
runFlyingCounterCoverage();
runLargeCounterCoverage();

console.log(
  'PASS: authored enemy Magic, Flying and Large threats expose readable counters and leave early battles unchanged.'
);
