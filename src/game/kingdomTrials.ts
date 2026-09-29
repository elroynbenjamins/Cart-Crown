import {
  areFormationSlotsAdjacent,
  areFormationSlotsVerticallyAligned,
  getFormationShape
} from './formation';
import type {
  FactionId,
  FormationShapeId,
  ResourceWallet
} from './types';

export const kingdomTrialOrder = [
  'bronze',
  'silver',
  'gold'
] as const;

export type KingdomTrialId =
  (typeof kingdomTrialOrder)[number];

export type KingdomTrialCheck = {
  id: string;
  label: string;
  passed: boolean;
};

export type KingdomTrialEvaluation = {
  id: KingdomTrialId;
  medal: 'BRONZE' | 'SILVER' | 'GOLD';
  title: string;
  body: string;
  lesson: string;
  reward: Partial<ResourceWallet>;
  checks: KingdomTrialCheck[];
  passed: boolean;
};

export type KingdomTrialContext = {
  faction: FactionId;
  formation: Array<string | null>;
  formationShapeId: FormationShapeId;
  formationDoctrineId: string;
};

export const kingdomTrialRewards:
  Record<KingdomTrialId, Partial<ResourceWallet>> = {
    bronze: { gold: 25, iron: 4 },
    silver: { gold: 40, iron: 6, provisions: 3 },
    gold: { gold: 60, iron: 8, provisions: 5 }
  };

function occupiedSlots(
  formation: Array<string | null>
) {
  return formation
    .map((unitId, index) =>
      unitId ? index : -1
    )
    .filter(index => index >= 0);
}

function adjacentPairCount(
  formation: Array<string | null>,
  shapeId: FormationShapeId
) {
  const occupied = occupiedSlots(formation);
  let pairs = 0;

  occupied.forEach((slot, index) => {
    occupied
      .slice(index + 1)
      .forEach(other => {
        if (
          areFormationSlotsAdjacent(
            shapeId,
            slot,
            other
          )
        ) {
          pairs += 1;
        }
      });
  });

  return pairs;
}

function allSeparated(
  formation: Array<string | null>,
  shapeId: FormationShapeId
) {
  const occupied = occupiedSlots(formation);

  return occupied.every((slot, index) =>
    occupied
      .slice(index + 1)
      .every(
        other =>
          !areFormationSlotsAdjacent(
            shapeId,
            slot,
            other
          )
      )
  );
}

function rowCount(
  formation: Array<string | null>,
  row: number[]
) {
  return row.filter(
    slot => Boolean(formation[slot])
  ).length;
}

function result(
  id: KingdomTrialId,
  medal: KingdomTrialEvaluation['medal'],
  title: string,
  body: string,
  lesson: string,
  checks: KingdomTrialCheck[]
): KingdomTrialEvaluation {
  return {
    id,
    medal,
    title,
    body,
    lesson,
    reward: kingdomTrialRewards[id],
    checks,
    passed: checks.every(check => check.passed)
  };
}

export function evaluateKingdomTrial(
  id: KingdomTrialId,
  context: KingdomTrialContext
): KingdomTrialEvaluation {
  const {
    faction,
    formation,
    formationShapeId,
    formationDoctrineId
  } = context;
  const shape = getFormationShape(
    formationShapeId
  );
  const occupied = occupiedSlots(formation);
  const frontCount = rowCount(
    formation,
    shape.rows.front
  );
  const middleCount = rowCount(
    formation,
    shape.rows.middle
  );
  const rearCount = rowCount(
    formation,
    shape.rows.rear
  );
  const adjacentPairs = adjacentPairCount(
    formation,
    formationShapeId
  );
  const separated = allSeparated(
    formation,
    formationShapeId
  );

  if (id === 'bronze') {
    if (faction === 'human') {
      const harlan =
        formation.indexOf('hum_militia');
      const mira =
        formation.indexOf('hum_recruit');

      return result(
        id,
        'BRONZE',
        'Protected Advance',
        'Build one protected lane: Harlan holds first contact while Mira works directly behind him.',
        'Learn how front, middle and rear placement changes who protects whom.',
        [
          {
            id: 'harlan-front',
            label: 'Harlan in the front row',
            passed:
              harlan >= 0 &&
              shape.rows.front.includes(harlan)
          },
          {
            id: 'mira-behind',
            label: 'Mira behind the front',
            passed:
              mira >= 0 &&
              (
                shape.rows.middle.includes(mira) ||
                shape.rows.rear.includes(mira)
              )
          },
          {
            id: 'protected-lane',
            label: 'Harlan and Mira aligned in one lane',
            passed:
              harlan >= 0 &&
              mira >= 0 &&
              areFormationSlotsVerticallyAligned(
                formationShapeId,
                harlan,
                mira
              )
          }
        ]
      );
    }

    if (faction === 'elf') {
      return result(
        id,
        'BRONZE',
        'Open Order',
        'Give your first Elven squads room to maneuver instead of packing the line tightly.',
        'Learn the spacing rule behind early Elven speed and precision.',
        [
          {
            id: 'two-squads',
            label: 'Field at least 2 squads',
            passed: occupied.length >= 2
          },
          {
            id: 'open-spacing',
            label: 'No active squads directly adjacent',
            passed:
              occupied.length >= 2 &&
              separated
          }
        ]
      );
    }

    return result(
      id,
      'BRONZE',
      'Warband Cohesion',
      'Build a compact Orc line so at least one pair can fight shoulder-to-shoulder.',
      'Learn how Orc pressure grows from direct adjacency.',
      [
        {
          id: 'two-squads',
          label: 'Field at least 2 squads',
          passed: occupied.length >= 2
        },
        {
          id: 'adjacent-pair',
          label: 'Create at least 1 adjacent pair',
          passed: adjacentPairs >= 1
        }
      ]
    );
  }

  if (id === 'silver') {
    if (faction === 'human') {
      return result(
        id,
        'SILVER',
        'Depth Before Damage',
        'Switch to a 2–3–4 Deep Formation and protect a real rear line behind a narrow screen.',
        'Specialized shapes trade frontage for depth. Learn to build around that trade.',
        [
          {
            id: 'deep-shape',
            label: 'Use Deep Formation · 2–3–4',
            passed:
              formationShapeId === 'deep_234'
          },
          {
            id: 'three-squads',
            label: 'Field at least 3 squads',
            passed: occupied.length >= 3
          },
          {
            id: 'front-screen',
            label: 'Keep at least 1 squad in front',
            passed: frontCount >= 1
          },
          {
            id: 'rear-line',
            label: 'Keep at least 1 squad in rear',
            passed: rearCount >= 1
          }
        ]
      );
    }

    if (faction === 'elf') {
      return result(
        id,
        'SILVER',
        'Layered Crescent',
        'Use 2–3–4 depth while preserving open lanes between three active squads.',
        'Learn to combine Elven spacing with a deeper formation instead of relying on the starter line.',
        [
          {
            id: 'deep-shape',
            label: 'Use Deep Formation · 2–3–4',
            passed:
              formationShapeId === 'deep_234'
          },
          {
            id: 'three-squads',
            label: 'Field at least 3 squads',
            passed: occupied.length >= 3
          },
          {
            id: 'open-spacing',
            label: 'Keep every active squad non-adjacent',
            passed:
              occupied.length >= 3 &&
              separated
          }
        ]
      );
    }

    return result(
      id,
      'SILVER',
      'Assault Line',
      'Use a 4–3–2 Assault Line and concentrate real pressure in the front rank.',
      'Learn how an aggressive shape gives Orc armies more first-contact pressure at the cost of rear safety.',
      [
        {
          id: 'assault-shape',
          label: 'Use Assault Line · 4–3–2',
          passed:
            formationShapeId === 'assault_432'
        },
        {
          id: 'three-squads',
          label: 'Field at least 3 squads',
          passed: occupied.length >= 3
        },
        {
          id: 'front-pressure',
          label: 'Place at least 2 squads in front',
          passed: frontCount >= 2
        },
        {
          id: 'adjacent-pair',
          label: 'Create at least 1 adjacent pair',
          passed: adjacentPairs >= 1
        }
      ]
    );
  }

  if (faction === 'human') {
    return result(
      id,
      'GOLD',
      'Volley Doctrine',
      'Combine Deep Formation with Volley Discipline and a four-squad layered line.',
      'Gold asks you to combine geometry and doctrine instead of solving either system alone.',
      [
        {
          id: 'deep-shape',
          label: 'Use Deep Formation · 2–3–4',
          passed:
            formationShapeId === 'deep_234'
        },
        {
          id: 'volley-doctrine',
          label: 'Use Volley Discipline',
          passed:
            formationDoctrineId === 'human_volley'
        },
        {
          id: 'four-squads',
          label: 'Field at least 4 squads',
          passed: occupied.length >= 4
        },
        {
          id: 'layered-line',
          label: 'Occupy front, middle and rear',
          passed:
            frontCount >= 1 &&
            middleCount >= 1 &&
            rearCount >= 1
        }
      ]
    );
  }

  if (faction === 'elf') {
    return result(
      id,
      'GOLD',
      'Crescent Mastery',
      'Combine Crescent Formation doctrine with a spaced 2–3–4 force occupying every depth layer.',
      'Gold turns Elven spacing into a full formation plan rather than a single passive bonus.',
      [
        {
          id: 'deep-shape',
          label: 'Use Deep Formation · 2–3–4',
          passed:
            formationShapeId === 'deep_234'
        },
        {
          id: 'crescent-doctrine',
          label: 'Use Crescent Formation doctrine',
          passed:
            formationDoctrineId === 'elf_crescent'
        },
        {
          id: 'four-squads',
          label: 'Field at least 4 squads',
          passed: occupied.length >= 4
        },
        {
          id: 'all-rows',
          label: 'Occupy front, middle and rear',
          passed:
            frontCount >= 1 &&
            middleCount >= 1 &&
            rearCount >= 1
        },
        {
          id: 'open-spacing',
          label: 'Keep every active squad non-adjacent',
          passed:
            occupied.length >= 4 &&
            separated
        }
      ]
    );
  }

  return result(
    id,
    'GOLD',
    'Blood Rush Mastery',
    'Combine Blood Rush doctrine with a four-squad 4–3–2 assault that creates multiple connected pressure points.',
    'Gold asks the Orc line to commit to an aggressive doctrine and formation together.',
    [
      {
        id: 'assault-shape',
        label: 'Use Assault Line · 4–3–2',
        passed:
          formationShapeId === 'assault_432'
      },
      {
        id: 'rush-doctrine',
        label: 'Use Blood Rush doctrine',
        passed:
          formationDoctrineId === 'orc_rush'
      },
      {
        id: 'four-squads',
        label: 'Field at least 4 squads',
        passed: occupied.length >= 4
      },
      {
        id: 'front-pressure',
        label: 'Place at least 3 squads in front',
        passed: frontCount >= 3
      },
      {
        id: 'two-links',
        label: 'Create at least 2 adjacent pairs',
        passed: adjacentPairs >= 2
      }
    ]
  );
}

export function isKingdomTrialUnlocked(
  id: KingdomTrialId,
  completed: readonly KingdomTrialId[]
) {
  const index = kingdomTrialOrder.indexOf(id);
  if (index <= 0) return true;

  return completed.includes(
    kingdomTrialOrder[index - 1]!
  );
}
