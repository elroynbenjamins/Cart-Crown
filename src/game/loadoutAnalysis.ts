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
  getFormationMatchup,
  getFormationShape,
  getPreferredFormationSlots
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
  openSquadSlots: number;
  strengths: string[];
  risks: string[];
};

export type TacticalAdjustmentKind =
  | 'repair_preset'
  | 'fill_slot'
  | 'counter_shape'
  | 'role_swap'
  | 'reposition';

export type TacticalAdjustmentAdvice = {
  kind: TacticalAdjustmentKind;
  title: string;
  detail: string;
  priority: number;
  suggestedUnitId?: string;
  replaceUnitId?: string;
  suggestedShapeId?: FormationShapeId;
  targetSlot?: number;
};

type GetTacticalAdjustmentAdviceInput = {
  preset: FormationPreset;
  evaluation: LoadoutFitEvaluation;
  units: UnitDefinition[];
  enemyShapeId: FormationShapeId;
  enemyArmyProfileId: EnemyArmyProfileId;
  squadCap: number;
  availableCounterShapeIds: FormationShapeId[];
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

type RoleNeed = {
  roles: UnitRole[];
  minimum: number;
  label: string;
  purpose: string;
};

const roleNeeds: Partial<Record<EnemyArmyProfileId, RoleNeed>> = {
  missile_company: {
    roles: ['cavalry', 'skirmish'],
    minimum: 2,
    label: 'mobile pressure',
    purpose: 'reach the protected missile line before its rear pressure builds'
  },
  mounted_hunters: {
    roles: ['frontline', 'support'],
    minimum: 2,
    label: 'holding power',
    purpose: 'absorb the enemy opening charge without losing the formation'
  },
  shield_host: {
    roles: ['ranged'],
    minimum: 2,
    label: 'ranged pressure',
    purpose: 'avoid grinding directly into the shield wall'
  },
  raider_pack: {
    roles: ['frontline', 'support'],
    minimum: 2,
    label: 'holding power',
    purpose: 'survive the raiders’ fast opening exchanges'
  },
  shock_warband: {
    roles: ['frontline', 'support'],
    minimum: 2,
    label: 'staying power',
    purpose: 'stabilize against sustained melee pressure'
  },
  warded_host: {
    roles: ['cavalry', 'skirmish'],
    minimum: 2,
    label: 'mobile disruption',
    purpose: 'get onto the protected specialists behind the screen'
  }
};

function unitUtility(unit: UnitDefinition) {
  return (
    unit.attack +
    unit.armor * 1.1 +
    unit.speed * 0.55 +
    unit.hp / 22
  );
}

function getValidPresetUnits(
  preset: FormationPreset,
  units: UnitDefinition[],
  squadCap: number
) {
  const unitById = new Map(units.map(unit => [unit.id, unit]));
  const seen = new Set<string>();
  const entries: Array<{
    unit: UnitDefinition;
    slot: number;
  }> = [];

  preset.formation.forEach((unitId, slot) => {
    if (
      !unitId ||
      seen.has(unitId) ||
      entries.length >= squadCap
    ) {
      return;
    }

    const unit = unitById.get(unitId);
    if (!unit) return;

    seen.add(unitId);
    entries.push({ unit, slot });
  });

  return entries;
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
    openSquadSlots,
    strengths,
    risks
  };
}

export function getTacticalAdjustmentAdvice({
  preset,
  evaluation,
  units,
  enemyShapeId,
  enemyArmyProfileId,
  squadCap,
  availableCounterShapeIds
}: GetTacticalAdjustmentAdviceInput): TacticalAdjustmentAdvice[] {
  const advice: TacticalAdjustmentAdvice[] = [];
  const activeEntries = getValidPresetUnits(
    preset,
    units,
    squadCap
  );
  const activeUnitIds = new Set(
    activeEntries.map(entry => entry.unit.id)
  );
  const benchedUnits = units.filter(
    unit => !activeUnitIds.has(unit.id)
  );

  if (evaluation.missingSquads > 0) {
    advice.push({
      kind: 'repair_preset',
      title: 'Repair the saved loadout',
      detail:
        String(evaluation.missingSquads) +
        ' saved squad' +
        (evaluation.missingSquads === 1 ? ' is' : 's are') +
        ' no longer available. Apply it, fill the gaps, then overwrite the preset.',
      priority: 100
    });
  }

  const roleNeed = roleNeeds[enemyArmyProfileId];
  const activeRoleCount = roleNeed
    ? activeEntries.filter(entry =>
        roleNeed.roles.includes(entry.unit.role)
      ).length
    : 0;
  const needsRole =
    roleNeed && activeRoleCount < roleNeed.minimum;

  const usefulBench = roleNeed
    ? benchedUnits
        .filter(unit => roleNeed.roles.includes(unit.role))
        .sort(
          (a, b) =>
            unitUtility(b) - unitUtility(a)
        )[0] ?? null
    : null;

  if (evaluation.openSquadSlots > 0) {
    const fallbackBench =
      [...benchedUnits].sort(
        (a, b) => unitUtility(b) - unitUtility(a)
      )[0] ?? null;
    const candidate = usefulBench ?? fallbackBench;

    const openSlots = preset.formation
      .map((unitId, index) => (unitId ? -1 : index))
      .filter(index => index >= 0);
    const preferredOpenSlot = candidate
      ? getPreferredFormationSlots(
          preset.formationShapeId,
          candidate.role
        ).find(slot => openSlots.includes(slot))
      : undefined;
    const targetSlot =
      preferredOpenSlot ?? openSlots[0];

    advice.push({
      kind: 'fill_slot',
      title: candidate
        ? 'Fill the open squad slot with ' + candidate.name
        : 'Fill the open squad slot',
      detail: candidate
        ? candidate.className +
          ' adds ' +
          (needsRole && roleNeed
            ? roleNeed.label + ' to ' + roleNeed.purpose + '.'
            : 'more field strength before committing.')
        : 'This preset is below the current squad cap, so the enemy gets full-tier pressure against a smaller force.',
      priority: 92,
      suggestedUnitId: candidate?.id,
      targetSlot
    });
  }

  if (
    evaluation.matchupResult === 'disadvantage' &&
    availableCounterShapeIds.length > 0
  ) {
    const bestCounter = availableCounterShapeIds
      .map(shapeId => ({
        shape: getFormationShape(shapeId),
        analysis:
          activeEntries.length > 0
            ? analyzeFormation(
                preset.formation,
                activeEntries.map(entry => entry.unit),
                activeEntries[0]?.unit.faction ?? 'human',
                preset.formationDoctrineId,
                shapeId
              )
            : null
      }))
      .sort((a, b) => {
        const score = (value: typeof a) =>
          value.analysis
            ? value.analysis.attackMultiplier * 3 +
              value.analysis.armorMultiplier * 3 +
              value.analysis.speedMultiplier +
              value.analysis.healingMultiplier
            : 0;
        return score(b) - score(a);
      })[0];

    if (bestCounter) {
      advice.push({
        kind: 'counter_shape',
        title:
          'Switch to ' +
          bestCounter.shape.layout +
          ' ' +
          bestCounter.shape.name,
        detail:
          'Your saved shape is directly exposed to ' +
          getFormationShape(enemyShapeId).name +
          '. This unlocked counter removes that formation disadvantage.',
        priority: 88,
        suggestedShapeId: bestCounter.shape.id
      });
    }
  }

  if (
    needsRole &&
    roleNeed &&
    usefulBench &&
    evaluation.openSquadSlots === 0
  ) {
    const weights = enemyRoleWeights[enemyArmyProfileId];
    const replaceCandidate = [...activeEntries]
      .filter(
        entry =>
          !roleNeed.roles.includes(entry.unit.role)
      )
      .sort((a, b) => {
        const aWeight = weights[a.unit.role] ?? 0;
        const bWeight = weights[b.unit.role] ?? 0;
        if (aWeight !== bWeight) {
          return aWeight - bWeight;
        }
        return (
          unitUtility(a.unit) -
          unitUtility(b.unit)
        );
      })[0];

    if (replaceCandidate) {
      advice.push({
        kind: 'role_swap',
        title:
          'Swap ' +
          replaceCandidate.unit.name +
          ' for ' +
          usefulBench.name,
        detail:
          usefulBench.className +
          ' adds ' +
          roleNeed.label +
          ' to ' +
          roleNeed.purpose +
          '.',
        priority: 80,
        suggestedUnitId: usefulBench.id,
        replaceUnitId: replaceCandidate.unit.id,
        targetSlot: replaceCandidate.slot
      });
    }
  }

  if (
    needsRole &&
    roleNeed &&
    !usefulBench
  ) {
    advice.push({
      kind: 'role_swap',
      title: 'This roster is short on ' + roleNeed.label,
      detail:
        'No benched squad currently fills the needed role mix. Lean on the formation counter now and prioritize ' +
        roleNeed.roles.join(' / ') +
        ' when the roster next changes.',
      priority: 58
    });
  }

  const emptySlots = preset.formation
    .map((unitId, index) =>
      unitId ? -1 : index
    )
    .filter(index => index >= 0);

  const misplaced = activeEntries.find(entry => {
    const preferred = getPreferredFormationSlots(
      preset.formationShapeId,
      entry.unit.role
    );
    return (
      !preferred.includes(entry.slot) &&
      preferred.some(slot => emptySlots.includes(slot))
    );
  });

  if (misplaced) {
    const targetSlot = getPreferredFormationSlots(
      preset.formationShapeId,
      misplaced.unit.role
    ).find(slot => emptySlots.includes(slot));

    if (targetSlot !== undefined) {
      const shape = getFormationShape(
        preset.formationShapeId
      );
      const rowName = shape.rows.front.includes(targetSlot)
        ? 'front'
        : shape.rows.middle.includes(targetSlot)
          ? 'middle'
          : 'rear';

      advice.push({
        kind: 'reposition',
        title: 'Reposition ' + misplaced.unit.name,
        detail:
          misplaced.unit.className +
          ' is outside its preferred lane. Move it toward the ' +
          rowName +
          ' row before saving this setup again.',
        priority: 52,
        suggestedUnitId: misplaced.unit.id,
        targetSlot
      });
    }
  }

  return advice
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
}
