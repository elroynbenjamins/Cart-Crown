import type {
  FactionId,
  FormationPreset,
  FormationShapeId,
  UnitDefinition,
  UnitRole
} from './types';
import type { EnemyArmyProfileId } from './encounters';
import {
  analyzeFormation,
  getFormationMatchup
} from './formation';

export type LoadoutFitRating =
  | 'strong'
  | 'solid'
  | 'mixed'
  | 'risky';

export type LoadoutFitEvaluation = {
  score: number;
  rating: LoadoutFitRating;
  matchupResult: ReturnType<typeof getFormationMatchup>['result'];
  validSquads: number;
  savedSquads: number;
  missingSquads: number;
  strengths: string[];
  risks: string[];
};

type EvaluateFormationPresetInput = {
  preset: FormationPreset;
  units: UnitDefinition[];
  faction: FactionId;
  enemyShapeId: FormationShapeId;
  enemyArmyProfileId: EnemyArmyProfileId;
  squadCap: number;
};

const enemyRoleWeights: Record<
  EnemyArmyProfileId,
  Partial<Record<UnitRole, number>>
> = {
  raider_pack: {
    frontline: 3,
    melee: 1,
    support: 2,
    ranged: -1
  },
  mercenary_line: {},
  shield_host: {
    ranged: 3,
    support: 1,
    skirmish: 1,
    melee: -1,
    cavalry: -1
  },
  missile_company: {
    cavalry: 3,
    skirmish: 3,
    frontline: 1,
    ranged: -1
  },
  mounted_hunters: {
    frontline: 3,
    melee: 1,
    support: 1,
    ranged: -2
  },
  shock_warband: {
    frontline: 3,
    support: 2,
    ranged: 1,
    skirmish: -1
  },
  warded_host: {
    cavalry: 2,
    skirmish: 2,
    melee: 1,
    ranged: -1
  },
  elite_command: {}
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function roleCounts(units: UnitDefinition[]) {
  const counts: Record<UnitRole, number> = {
    frontline: 0,
    melee: 0,
    ranged: 0,
    support: 0,
    cavalry: 0,
    skirmish: 0
  };

  units.forEach(unit => {
    counts[unit.role] += 1;
  });

  return counts;
}

function getProfileRead(
  profileId: EnemyArmyProfileId,
  counts: Record<UnitRole, number>
) {
  const mobile = counts.cavalry + counts.skirmish;
  const holders = counts.frontline + counts.support;
  const ranged = counts.ranged;
  const meleeWeight = counts.frontline + counts.melee;

  if (profileId === 'missile_company') {
    return mobile >= 2
      ? {
          strength: 'Mobile squads can threaten the protected enemy rear.',
          risk: null
        }
      : {
          strength: null,
          risk: 'Few mobile squads can reach a protected missile line quickly.'
        };
  }

  if (profileId === 'mounted_hunters') {
    return holders >= 2
      ? {
          strength: 'Enough holding power is present to absorb the enemy opening charge.',
          risk: null
        }
      : {
          strength: null,
          risk: 'The preset has limited holding power against an early mounted charge.'
        };
  }

  if (profileId === 'shield_host') {
    return ranged >= 2
      ? {
          strength: 'Ranged pressure helps avoid grinding directly into the shield wall.',
          risk: null
        }
      : meleeWeight >= 4
        ? {
            strength: null,
            risk: 'This preset is melee-heavy into a durable shield host.'
          }
        : {
            strength: null,
            risk: null
          };
  }

  if (profileId === 'raider_pack') {
    return holders >= 2
      ? {
          strength: 'Frontline and support weight can survive the raiders’ fast opening.',
          risk: null
        }
      : {
          strength: null,
          risk: 'A light screen may take too much damage during the raiders’ opening burst.'
        };
  }

  if (profileId === 'shock_warband') {
    return holders >= 2
      ? {
          strength: 'The preset has enough staying power for the warband’s opening pressure.',
          risk: null
        }
      : {
          strength: null,
          risk: 'The preset is light on frontline/support squads against sustained melee pressure.'
        };
  }

  if (profileId === 'warded_host') {
    return mobile >= 2
      ? {
          strength: 'Mobile squads can disrupt the warded specialists behind the screen.',
          risk: null
        }
      : {
          strength: null,
          risk: 'Few mobile squads can disrupt the protected specialists behind the enemy line.'
        };
  }

  return {
    strength: null,
    risk: null
  };
}

export function evaluateFormationPreset({
  preset,
  units,
  faction,
  enemyShapeId,
  enemyArmyProfileId,
  squadCap
}: EvaluateFormationPresetInput): LoadoutFitEvaluation {
  const unitById = new Map(units.map(unit => [unit.id, unit]));
  const seen = new Set<string>();
  const validFormation = Array.from(
    { length: 9 },
    (_, index) => {
      const unitId = preset.formation[index] ?? null;
      if (
        !unitId ||
        seen.has(unitId) ||
        !unitById.has(unitId)
      ) {
        return null;
      }
      seen.add(unitId);
      return unitId;
    }
  );

  const savedSquads = preset.formation.filter(Boolean).length;
  const validUnits = validFormation
    .filter((unitId): unitId is string => Boolean(unitId))
    .map(unitId => unitById.get(unitId))
    .filter((unit): unit is UnitDefinition => Boolean(unit))
    .slice(0, Math.max(1, squadCap));

  const validIds = new Set(validUnits.map(unit => unit.id));
  const cappedFormation = validFormation.map(unitId =>
    unitId && validIds.has(unitId) ? unitId : null
  );

  const validSquads = validUnits.length;
  const missingSquads = Math.max(
    0,
    savedSquads - validSquads
  );
  const openSquadSlots = Math.max(
    0,
    squadCap - validSquads
  );

  const matchup = getFormationMatchup(
    preset.formationShapeId,
    enemyShapeId
  );

  let score = 50;
  const strengths: string[] = [];
  const risks: string[] = [];

  if (matchup.result === 'advantage') {
    score += 14;
    strengths.push('The saved formation directly counters the enemy shape.');
  } else if (matchup.result === 'disadvantage') {
    score -= 14;
    risks.push('The enemy formation directly exploits this saved shape.');
  }

  const weights = enemyRoleWeights[enemyArmyProfileId];
  const compositionScore = clamp(
    validUnits.reduce(
      (total, unit) => total + (weights[unit.role] ?? 0),
      0
    ),
    -10,
    10
  );
  score += compositionScore;

  const counts = roleCounts(validUnits);
  const profileRead = getProfileRead(
    enemyArmyProfileId,
    counts
  );
  if (profileRead.strength) {
    strengths.push(profileRead.strength);
  }
  if (profileRead.risk) {
    risks.push(profileRead.risk);
  }

  if (validSquads > 0) {
    const analysis = analyzeFormation(
      cappedFormation,
      validUnits,
      faction,
      preset.formationDoctrineId,
      preset.formationShapeId
    );
    const synergyScore = clamp(
      Math.round(
        (analysis.attackMultiplier - 1) * 28 +
          (analysis.armorMultiplier - 1) * 24 +
          (analysis.speedMultiplier - 1) * 14 +
          (analysis.healingMultiplier - 1) * 8 +
          Math.min(3, analysis.momentumPerExchange) * 1.5
      ),
      -4,
      10
    );

    score += synergyScore;

    if (synergyScore >= 6) {
      strengths.push('Saved squad positions activate strong formation and faction synergies.');
    } else if (synergyScore <= 0) {
      risks.push('This saved positioning activates few useful formation synergies.');
    }
  }

  if (missingSquads > 0) {
    score -= missingSquads * 6;
    risks.push(
      String(missingSquads) +
        ' saved squad' +
        (missingSquads === 1 ? ' is' : 's are') +
        ' no longer available.'
    );
  }

  if (openSquadSlots > 0) {
    score -= openSquadSlots * 4;
    risks.push(
      String(openSquadSlots) +
        ' active squad slot' +
        (openSquadSlots === 1 ? ' would' : 's would') +
        ' remain empty.'
    );
  }

  score = clamp(Math.round(score), 0, 100);

  const rating: LoadoutFitRating =
    score >= 68
      ? 'strong'
      : score >= 58
        ? 'solid'
        : score >= 45
          ? 'mixed'
          : 'risky';

  return {
    score,
    rating,
    matchupResult: matchup.result,
    validSquads,
    savedSquads,
    missingSquads,
    strengths,
    risks
  };
}
