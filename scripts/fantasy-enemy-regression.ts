import {
  getEncounter
} from '../src/game/encounters';
import {
  getEnemyFantasyExchangeBehavior,
  getEnemyFantasyPatternSummary,
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
        unit('mage', 'Mage', 'ranged', ['magic']),
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

function runExchangePatternCoverage() {
  const exposed = [
    unit('sword', 'Swordsman', 'melee')
  ];
  const counters = {
    magic: [
      unit('ward', 'Dawnkeeper', 'support', ['magic', 'support']),
      unit('mage', 'Mage', 'ranged', ['magic'])
    ],
    flying: [
      unit('archer', 'Archer', 'ranged', ['ranged']),
      unit('ranger', 'Ranger', 'skirmish', ['ranged'])
    ],
    large: [
      unit('spear', 'Veteran Spearman', 'frontline'),
      unit('lancer', 'Royal Lancer', 'cavalry')
    ],
    hybrid: [
      unit('ward', 'Dawnkeeper', 'support', ['magic', 'support']),
      unit('mage', 'Mage', 'ranged', ['magic']),
      unit('archer', 'Archer', 'ranged', ['ranged']),
      unit('ranger', 'Ranger', 'skirmish', ['ranged'])
    ]
  } as const;

  const cases = [
    {
      family: 'magic' as const,
      encounter: getEncounter('war_table_ashen_hex_circle'),
      specialLabel: 'Hex Surge'
    },
    {
      family: 'flying' as const,
      encounter: getEncounter('war_table_sky_raiders'),
      specialLabel: 'Aerial Dive'
    },
    {
      family: 'large' as const,
      encounter: getEncounter('war_table_golem_breach'),
      specialLabel: 'Ground Slam'
    },
    {
      family: 'hybrid' as const,
      encounter: {
        ...getEncounter('war_table_sky_raiders'),
        id: 'test_hybrid_threat',
        fantasyThreat: 'hybrid' as const
      },
      specialLabel: 'Legendary Assault'
    }
  ];

  for (const testCase of cases) {
    const exposedCycle = [0, 1, 2].map(turn =>
      getEnemyFantasyExchangeBehavior(
        testCase.encounter,
        exposed,
        turn
      )
    );
    const counteredCycle = [0, 1, 2].map(turn =>
      getEnemyFantasyExchangeBehavior(
        testCase.encounter,
        [...counters[testCase.family]],
        turn
      )
    );

    check(
      exposedCycle.every(Boolean) &&
        counteredCycle.every(Boolean),
      testCase.family +
        ' exchange behavior disappeared from its fantasy encounter.'
    );

    const exposedAverage =
      exposedCycle.reduce(
        (sum, behavior) =>
          sum + (behavior?.damageMultiplier ?? 0),
        0
      ) / 3;
    const counteredAverage =
      counteredCycle.reduce(
        (sum, behavior) =>
          sum + (behavior?.damageMultiplier ?? 0),
        0
      ) / 3;

    check(
      Math.abs(exposedAverage - 1) < 0.000001 &&
        Math.abs(counteredAverage - 1) < 0.000001,
      testCase.family +
        ' rhythm changed average damage instead of only redistributing it.'
    );

    const exposedSpecials =
      exposedCycle.filter(
        behavior => behavior?.isSpecial
      );
    const counteredSpecials =
      counteredCycle.filter(
        behavior => behavior?.isSpecial
      );

    check(
      exposedSpecials.length === 1 &&
        counteredSpecials.length === 1 &&
        exposedSpecials[0]?.label ===
          testCase.specialLabel,
      testCase.family +
        ' must telegraph exactly one signature move per three exchanges.'
    );

    check(
      (counteredSpecials[0]?.damageMultiplier ?? 99) <
        (exposedSpecials[0]?.damageMultiplier ?? 0),
      testCase.family +
        ' counter preparation no longer reduces the signature spike.'
    );

    check(
      Boolean(
        getEnemyFantasyPatternSummary(
          testCase.encounter
        )
      ),
      testCase.family +
        ' threat no longer exposes its Battle Prep pattern summary.'
    );
  }

  check(
    getEnemyFantasyExchangeBehavior(
      getEncounter('hold_the_road'),
      exposed,
      0
    ) === null &&
      getEnemyFantasyPatternSummary(
        getEncounter('hold_the_road')
      ) === null,
    'Early conventional encounters incorrectly received fantasy attack rhythms.'
  );
}

runEncounterCoverage();
runMagicCounterCoverage();
runFlyingCounterCoverage();
runLargeCounterCoverage();
runExchangePatternCoverage();

console.log(
  'PASS: authored enemy fantasy threats expose readable counters, deterministic average-neutral attack rhythms and leave early conventional battles unchanged.'
);
