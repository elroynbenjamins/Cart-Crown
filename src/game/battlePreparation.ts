import type {
  EncounterDefinition,
  EquipmentDefinition,
  UnitDefinition,
  UnitEquipmentLoadout
} from './types';
import type { FormationMatchupResult } from './formation';

export type BattlePreparationStatus =
  | 'ready'
  | 'risky'
  | 'severely_underprepared';

export type BattlePreparationFactorId =
  | 'squads'
  | 'readiness'
  | 'rations'
  | 'formation'
  | 'equipment';

export type BattlePreparationFactorSeverity =
  | 'good'
  | 'neutral'
  | 'caution'
  | 'danger';

export type BattlePreparationFactor = {
  id: BattlePreparationFactorId;
  label: string;
  severity: BattlePreparationFactorSeverity;
  summary: string;
  detail: string;
  riskWeight: number;
};

export type BattlePreparationAssessment = {
  status: BattlePreparationStatus;
  factors: BattlePreparationFactor[];
  concernCount: number;
  equipment: {
    equippedUnits: number;
    activeUnits: number;
    coverage: number;
    averageTier: number;
    expectedTier: number;
  };
};

type BattlePreparationInput = {
  activeUnits: UnitDefinition[];
  squadCap: number;
  armyReadiness: number;
  hasRations: boolean;
  difficulty: EncounterDefinition['difficulty'];
  formationMatchupResult: FormationMatchupResult;
  wagonStageId: string;
  unitEquipment: Record<string, UnitEquipmentLoadout>;
  equipmentDefinitions: EquipmentDefinition[];
};

const expectedEquipmentTierByStage: Record<string, number> = {
  camp: 0,
  settlement: 0.5,
  fort: 1,
  town: 1.25,
  stronghold: 1.75,
  capital: 2,
  grand: 2.25
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function getEquipmentProfile({
  activeUnits,
  wagonStageId,
  unitEquipment,
  equipmentDefinitions
}: Pick<
  BattlePreparationInput,
  | 'activeUnits'
  | 'wagonStageId'
  | 'unitEquipment'
  | 'equipmentDefinitions'
>) {
  const equipmentById = new Map(
    equipmentDefinitions.map(item => [item.id, item])
  );
  let equippedUnits = 0;
  const tiers: number[] = [];

  activeUnits.forEach(unit => {
    const equippedIds = Object.values(
      unitEquipment[unit.id] ?? {}
    ).filter((id): id is string => Boolean(id));
    const items = equippedIds
      .map(id => equipmentById.get(id))
      .filter(
        (item): item is EquipmentDefinition =>
          Boolean(item)
      );

    if (items.length > 0) {
      equippedUnits += 1;
      tiers.push(
        ...items.map(item => item.tier)
      );
    }
  });

  const activeCount = activeUnits.length;
  const coverage =
    activeCount > 0
      ? equippedUnits / activeCount
      : 0;
  const averageTier =
    tiers.length > 0
      ? tiers.reduce((sum, tier) => sum + tier, 0) /
        tiers.length
      : 0;

  return {
    equippedUnits,
    activeUnits: activeCount,
    coverage,
    averageTier,
    expectedTier:
      expectedEquipmentTierByStage[wagonStageId] ?? 0
  };
}

function getSquadFactor(
  activeCount: number,
  squadCap: number
): BattlePreparationFactor {
  const missing = Math.max(
    0,
    squadCap - activeCount
  );

  if (missing === 0) {
    return {
      id: 'squads',
      label: 'Army size',
      severity: 'good',
      summary: 'Full field strength',
      detail:
        String(activeCount) +
        '/' +
        String(squadCap) +
        ' active squads are deployed.',
      riskWeight: 0
    };
  }

  if (missing === 1) {
    return {
      id: 'squads',
      label: 'Army size',
      severity: 'caution',
      summary: 'One squad short',
      detail:
        String(activeCount) +
        '/' +
        String(squadCap) +
        ' active squads are deployed.',
      riskWeight: 18
    };
  }

  return {
    id: 'squads',
    label: 'Army size',
    severity: 'danger',
    summary:
      String(missing) + ' squads short',
    detail:
      String(activeCount) +
      '/' +
      String(squadCap) +
      ' active squads are deployed.',
    riskWeight:
      30 + Math.max(0, missing - 2) * 8
  };
}

function getReadinessFactor(
  readiness: number
): BattlePreparationFactor {
  if (readiness >= 70) {
    return {
      id: 'readiness',
      label: 'Readiness',
      severity: 'good',
      summary: 'Fresh',
      detail:
        String(Math.round(readiness)) +
        '% readiness applies no fatigue penalty.',
      riskWeight: 0
    };
  }

  if (readiness >= 55) {
    return {
      id: 'readiness',
      label: 'Readiness',
      severity: 'caution',
      summary: 'Worn',
      detail:
        String(Math.round(readiness)) +
        '% readiness is reducing battle performance.',
      riskWeight: 10
    };
  }

  if (readiness >= 40) {
    return {
      id: 'readiness',
      label: 'Readiness',
      severity: 'danger',
      summary: 'Heavily worn',
      detail:
        String(Math.round(readiness)) +
        '% readiness creates a meaningful fatigue penalty.',
      riskWeight: 22
    };
  }

  return {
    id: 'readiness',
    label: 'Readiness',
    severity: 'danger',
    summary: 'Exhausted',
    detail:
      String(Math.round(readiness)) +
      '% readiness is near the maximum fatigue penalty.',
    riskWeight: 35
  };
}

function getRationsFactor(
  hasRations: boolean,
  difficulty: EncounterDefinition['difficulty']
): BattlePreparationFactor {
  if (hasRations) {
    return {
      id: 'rations',
      label: 'Supplies',
      severity: 'good',
      summary: 'Rations packed',
      detail:
        'Rations reduce post-battle readiness wear.',
      riskWeight: 0
    };
  }

  const weight =
    difficulty === 'Boss'
      ? 12
      : difficulty === 'Elite'
        ? 8
        : 6;

  return {
    id: 'rations',
    label: 'Supplies',
    severity:
      difficulty === 'Boss'
        ? 'caution'
        : 'neutral',
    summary: 'No rations',
    detail:
      difficulty === 'Boss'
        ? 'A boss battle without rations increases recovery pressure if the fight is costly.'
        : 'No rations are packed, so battle wear will recover less efficiently.',
    riskWeight: weight
  };
}

function getFormationFactor(
  result: FormationMatchupResult
): BattlePreparationFactor {
  if (result === 'advantage') {
    return {
      id: 'formation',
      label: 'Formation',
      severity: 'good',
      summary: 'Direct formation edge',
      detail:
        'Your current formation has a soft counter advantage.',
      riskWeight: -3
    };
  }

  if (result === 'disadvantage') {
    return {
      id: 'formation',
      label: 'Formation',
      severity: 'caution',
      summary: 'Formation exposed',
      detail:
        'The enemy formation has a soft counter advantage against your current shape.',
      riskWeight: 9
    };
  }

  return {
    id: 'formation',
    label: 'Formation',
    severity: 'neutral',
    summary: 'Neutral matchup',
    detail:
      'Neither formation has a direct counter advantage.',
    riskWeight: 0
  };
}

function getEquipmentFactor(
  profile: ReturnType<typeof getEquipmentProfile>,
  difficulty: EncounterDefinition['difficulty']
): BattlePreparationFactor {
  if (
    profile.expectedTier <= 0 ||
    profile.activeUnits === 0
  ) {
    return {
      id: 'equipment',
      label: 'Equipment',
      severity: 'neutral',
      summary: 'Starter gear acceptable',
      detail:
        'The opening campaign does not assume issued equipment on every squad.',
      riskWeight: 0
    };
  }

  const tierGap =
    profile.expectedTier - profile.averageTier;
  const strongCoverage =
    profile.coverage >= 0.75;
  const adequateTier =
    profile.averageTier >=
    profile.expectedTier - 0.25;

  if (strongCoverage && adequateTier) {
    return {
      id: 'equipment',
      label: 'Equipment',
      severity: 'good',
      summary: 'Gear keeps pace',
      detail:
        String(profile.equippedUnits) +
        '/' +
        String(profile.activeUnits) +
        ' squads have equipment; average equipped tier ' +
        profile.averageTier.toFixed(1) +
        '.',
      riskWeight: 0
    };
  }

  const veryLight =
    profile.coverage < 0.4 ||
    tierGap >= 1;
  const riskWeight = veryLight
    ? difficulty === 'Boss'
      ? 14
      : 12
    : 7;

  return {
    id: 'equipment',
    label: 'Equipment',
    severity: veryLight
      ? 'caution'
      : 'neutral',
    summary: veryLight
      ? 'Gear is light for this stage'
      : 'Gear is slightly behind',
    detail:
      String(profile.equippedUnits) +
      '/' +
      String(profile.activeUnits) +
      ' squads have equipment; average equipped tier ' +
      profile.averageTier.toFixed(1) +
      ' versus roughly ' +
      profile.expectedTier.toFixed(1) +
      ' expected for this campaign stage.',
    riskWeight
  };
}

export function assessBattlePreparation({
  activeUnits,
  squadCap,
  armyReadiness,
  hasRations,
  difficulty,
  formationMatchupResult,
  wagonStageId,
  unitEquipment,
  equipmentDefinitions
}: BattlePreparationInput): BattlePreparationAssessment {
  const equipment = getEquipmentProfile({
    activeUnits,
    wagonStageId,
    unitEquipment,
    equipmentDefinitions
  });

  const factors: BattlePreparationFactor[] = [
    getSquadFactor(activeUnits.length, squadCap),
    getReadinessFactor(armyReadiness),
    getRationsFactor(hasRations, difficulty),
    getFormationFactor(formationMatchupResult),
    getEquipmentFactor(equipment, difficulty)
  ];

  let risk = factors.reduce(
    (sum, factor) => sum + factor.riskWeight,
    0
  );

  const missingSquads = Math.max(
    0,
    squadCap - activeUnits.length
  );
  const critical =
    missingSquads >= 2 ||
    armyReadiness < 40 ||
    (
      difficulty === 'Boss' &&
      missingSquads >= 1 &&
      armyReadiness < 55
    );

  if (
    difficulty === 'Elite' &&
    risk >= 18
  ) {
    risk += 2;
  }
  if (
    difficulty === 'Boss' &&
    risk >= 18
  ) {
    risk += 4;
  }

  risk = clamp(risk, 0, 100);

  const status: BattlePreparationStatus =
    critical || risk >= 36
      ? 'severely_underprepared'
      : risk >= 12
        ? 'risky'
        : 'ready';

  return {
    status,
    factors,
    concernCount: factors.filter(
      factor =>
        factor.severity === 'caution' ||
        factor.severity === 'danger'
    ).length,
    equipment
  };
}
