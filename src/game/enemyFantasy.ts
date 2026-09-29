import type {
  EncounterDefinition,
  EnemyFantasyThreatFamily,
  UnitBattleTag,
  UnitDefinition
} from './types';

export type EnemyFantasyExchangeBehavior = {
  label: string;
  detail: string;
  damageMultiplier: number;
  isSpecial: boolean;
};

export type EnemyFantasyThreatAssessment = {
  family: EnemyFantasyThreatFamily;
  label: string;
  counterLabel: string;
  counterScore: number;
  requiredCounterScore: number;
  countered: boolean;
  outgoingDamageMultiplier: number;
  incomingDamageMultiplier: number;
  detail: string;
};

function hasTag(unit: UnitDefinition, tag: UnitBattleTag) {
  return unit.battleTags?.includes(tag) ?? false;
}

function magicCounterScore(units: UnitDefinition[]) {
  return units.reduce((score, unit) => {
    if (unit.role === 'support' || hasTag(unit, 'magic')) return score + 1;
    if (unit.role === 'frontline') return score + 0.5;
    return score;
  }, 0);
}

function airCounterScore(units: UnitDefinition[]) {
  return units.reduce((score, unit) => {
    if (hasTag(unit, 'anti_air')) return score + 1.5;
    if (unit.role === 'ranged' || unit.role === 'skirmish') return score + 1;
    return score;
  }, 0);
}

function largeCounterScore(units: UnitDefinition[]) {
  return units.reduce((score, unit) => {
    const key = unit.className.toLowerCase();
    if (
      hasTag(unit, 'anti_large') ||
      key.includes('spear') ||
      key.includes('lancer') ||
      key.includes('pike')
    ) {
      return score + 1;
    }
    if (unit.role === 'ranged') return score + 0.5;
    return score;
  }, 0);
}

export function getEnemyFantasyThreatAssessment(
  encounter: EncounterDefinition,
  activeUnits: UnitDefinition[]
): EnemyFantasyThreatAssessment | null {
  const family = encounter.fantasyThreat;
  if (!family) return null;

  if (family === 'magic') {
    const counterScore = magicCounterScore(activeUnits);
    const countered = counterScore >= 2;
    return {
      family,
      label: 'Enemy spell pressure',
      counterLabel: 'Wards / support',
      counterScore,
      requiredCounterScore: 2,
      countered,
      outgoingDamageMultiplier: countered ? 1.03 : 1,
      incomingDamageMultiplier: countered ? 0.95 : 1.08,
      detail: countered
        ? 'Your support and magical specialists can stabilize the enemy spell pressure.'
        : 'Enemy magic is not adequately screened. Bring support, magic specialists or a sturdier frontline.'
    };
  }

  if (family === 'flying') {
    const counterScore = airCounterScore(activeUnits);
    const countered = counterScore >= 2;
    return {
      family,
      label: 'Enemy aerial pressure',
      counterLabel: 'Ranged / anti-air',
      counterScore,
      requiredCounterScore: 2,
      countered,
      outgoingDamageMultiplier: countered ? 1.06 : 1,
      incomingDamageMultiplier: countered ? 0.94 : 1.1,
      detail: countered
        ? 'Your ranged screen can contest the air and punish repeated aerial approaches.'
        : 'Enemy flyers can reach protected lanes freely. Add ranged, skirmish or dedicated anti-air pressure.'
    };
  }

  if (family === 'large') {
    const counterScore = largeCounterScore(activeUnits);
    const countered = counterScore >= 2;
    return {
      family,
      label: 'Enemy Large-unit pressure',
      counterLabel: 'Spears / ranged focus',
      counterScore,
      requiredCounterScore: 2,
      countered,
      outgoingDamageMultiplier: countered ? 1.06 : 1,
      incomingDamageMultiplier: countered ? 0.96 : 1.1,
      detail: countered
        ? 'Your anti-large tools can focus oversized targets before they break the line.'
        : 'The army lacks enough anti-large pressure. Spears, lancers and concentrated ranged fire are the safest answer.'
    };
  }

  const wardScore = magicCounterScore(activeUnits);
  const airScore = airCounterScore(activeUnits);
  const counterScore = Math.min(wardScore, airScore);
  const countered = wardScore >= 2 && airScore >= 2;

  return {
    family,
    label: 'Enemy legendary hybrid pressure',
    counterLabel: 'Wards + anti-air',
    counterScore,
    requiredCounterScore: 2,
    countered,
    outgoingDamageMultiplier: countered ? 1.05 : 1,
    incomingDamageMultiplier: countered ? 0.95 : 1.12,
    detail: countered
      ? 'The army has both warding support and enough ranged pressure to answer the hybrid threat.'
      : 'Legendary enemy pressure combines magic and flight. Counter both halves: ward the spell pressure and contest the air.'
  };
}

export function getEnemyFantasyPatternSummary(
  encounter: EncounterDefinition
) {
  if (encounter.fantasyThreat === 'magic') {
    return 'Hexcasters build power for a stronger surge every third exchange.';
  }
  if (encounter.fantasyThreat === 'flying') {
    return 'Flyers strike hard on the first exchange of each three-exchange pass, then circle.';
  }
  if (encounter.fantasyThreat === 'large') {
    return 'Large units spend one exchange winding up before a heavier Ground Slam.';
  }
  if (encounter.fantasyThreat === 'hybrid') {
    return 'Legendary hybrids alternate a sharp combined-arms strike with two lighter recovery exchanges.';
  }
  return null;
}

export function getEnemyFantasyExchangeBehavior(
  encounter: EncounterDefinition,
  activeUnits: UnitDefinition[],
  exchangeIndex: number
): EnemyFantasyExchangeBehavior | null {
  const assessment =
    getEnemyFantasyThreatAssessment(
      encounter,
      activeUnits
    );
  if (!assessment) return null;

  const phase =
    ((Math.floor(exchangeIndex) % 3) + 3) % 3;
  const countered = assessment.countered;

  if (assessment.family === 'magic') {
    const isSpecial = phase === 2;
    return {
      label: isSpecial ? 'Hex Surge' : 'Gathering Hex',
      detail: isSpecial
        ? countered
          ? 'Your wards blunt the completed hex before it fully lands.'
          : 'The caster line completes its ritual and releases a concentrated spell surge.'
        : 'The caster line is gathering power behind its screen.',
      damageMultiplier: isSpecial
        ? countered
          ? 1.02
          : 1.08
        : countered
          ? 0.99
          : 0.96,
      isSpecial
    };
  }

  if (assessment.family === 'flying') {
    const isSpecial = phase === 0;
    return {
      label: isSpecial ? 'Aerial Dive' : 'Circling Pass',
      detail: isSpecial
        ? countered
          ? 'Your ranged screen disrupts the dive before the flyers can fully commit.'
          : 'The aerial wing dives through exposed lanes before climbing away.'
        : 'The flyers circle and reset for another attack pass.',
      damageMultiplier: isSpecial
        ? countered
          ? 1.02
          : 1.06
        : countered
          ? 0.99
          : 0.97,
      isSpecial
    };
  }

  if (assessment.family === 'large') {
    const isSpecial = phase === 1;
    return {
      label: isSpecial ? 'Ground Slam' : 'Heavy Wind-up',
      detail: isSpecial
        ? countered
          ? 'Focused anti-large pressure disrupts the impact before the line fully buckles.'
          : 'The oversized front crashes into the line with its full weight.'
        : 'The heavy units reset their footing for another committed impact.',
      damageMultiplier: isSpecial
        ? countered
          ? 1.04
          : 1.14
        : countered
          ? 0.98
          : 0.93,
      isSpecial
    };
  }

  const isSpecial = phase === 0;
  return {
    label: isSpecial
      ? 'Legendary Assault'
      : 'Hybrid Recovery',
    detail: isSpecial
      ? countered
        ? 'Wards and anti-air pressure break up the combined assault before it peaks.'
        : 'Magic and flight converge into one short, high-pressure strike.'
      : 'The hybrid wing resets after its combined assault.',
    damageMultiplier: isSpecial
      ? countered
        ? 1.04
        : 1.08
      : countered
        ? 0.98
        : 0.96,
    isSpecial
  };
}

