import type {
  EncounterDefinition,
  EnemyFantasyThreatFamily,
  UnitDefinition
} from './types';

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

function hasTag(unit: UnitDefinition, tag: string) {
  return unit.battleTags?.includes(tag as never) ?? false;
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
