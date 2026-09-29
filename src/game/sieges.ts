import { getFormationMatchup } from './formation';
import type {
  FactionId,
  FormationShapeId,
  ResourceWallet,
  WagonItemDefinition
} from './types';

export type SiegeStageId =
  | 'approach'
  | 'breach'
  | 'courtyard'
  | 'commander';

export type SiegeChoice = {
  id: string;
  stageIndex: number;
  stageId: SiegeStageId;
  name: string;
  description: string;
  formationShapeId: FormationShapeId;
  baseThreat: number;
  wear: number;
  supplyCost?: number;
  readinessDelta?: number;
  powerBonusDelta?: number;
  minimumEngineering?: number;
};

export type SiegePreparation = {
  initialSupplies: number;
  powerMultiplier: number;
  engineering: number;
  permanentIntel: boolean;
  hasRations: boolean;
  hasMedicine: boolean;
  bonuses: Array<{
    label: string;
    value: string;
  }>;
};

export type SiegeRunState = {
  stageIndex: number;
  readiness: number;
  supplies: number;
  powerBonus: number;
  rewardMultiplier: 0 | 0.5 | 1;
  basePower: number;
  preparationMultiplier: number;
  playerShapeId: FormationShapeId;
  wagonStageId: string;
  engineering: number;
  permanentIntel: boolean;
  hasRations: boolean;
  hasMedicine: boolean;
  path: string[];
  failed: boolean;
  completed: boolean;
  lastSummary: string | null;
};

export type SiegeResolution = {
  ok: boolean;
  success: boolean;
  state: SiegeRunState;
  effectivePower?: number;
  threat?: number;
  matchup?: ReturnType<typeof getFormationMatchup>;
  summary: string;
};

export const siegeStages = [
  {
    id: 'approach' as const,
    name: 'Approach',
    summary:
      'Reach the walls under enemy pressure and choose how much risk to take before the breach.'
  },
  {
    id: 'breach' as const,
    name: 'Breach the Gate',
    summary:
      'Break through fortifications using direct force or engineering preparation.'
  },
  {
    id: 'courtyard' as const,
    name: 'Take the Courtyard',
    summary:
      'Fight through the inner defenders before they can reform around the keep.'
  },
  {
    id: 'commander' as const,
    name: 'Defeat the Commander',
    summary:
      'The final garrison commander holds the keep with the strongest remaining formation.'
  }
];

const choices: SiegeChoice[] = [
  {
    id: 'approach_shielded',
    stageIndex: 0,
    stageId: 'approach',
    name: 'Shielded Advance',
    description:
      'Advance methodically behind cover. Safer, but gives the defenders more time to prepare the inner line.',
    formationShapeId: 'wide_vanguard_522',
    baseThreat: 146,
    wear: 6
  },
  {
    id: 'approach_flank',
    stageIndex: 0,
    stageId: 'approach',
    name: 'Night Flanking March',
    description:
      'Spend one field supply to reach a weak angle. Harder opening contact, but the route grants a temporary siege-power bonus.',
    formationShapeId: 'skirmish_screen_243',
    baseThreat: 158,
    wear: 7,
    supplyCost: 1,
    powerBonusDelta: 0.04
  },
  {
    id: 'breach_ram',
    stageIndex: 1,
    stageId: 'breach',
    name: 'Ram the Main Gate',
    description:
      'Use prepared engineering crews against a braced spear wall. Reliable when the Forge and Logistics network are developed.',
    formationShapeId: 'spear_wall_531',
    baseThreat: 176,
    wear: 8,
    minimumEngineering: 1
  },
  {
    id: 'breach_sappers',
    stageIndex: 1,
    stageId: 'breach',
    name: 'Send the Sappers',
    description:
      'Spend two supplies to undermine a weaker section. Requires stronger engineering, but reduces the direct pressure of the breach.',
    formationShapeId: 'deep_234',
    baseThreat: 160,
    wear: 6,
    supplyCost: 2,
    minimumEngineering: 2,
    powerBonusDelta: 0.05
  },
  {
    id: 'courtyard_center',
    stageIndex: 2,
    stageId: 'courtyard',
    name: 'Break the Center',
    description:
      'Attack the reserve-heavy center before the garrison can rotate defenders between lanes.',
    formationShapeId: 'reinforced_center_252',
    baseThreat: 194,
    wear: 9
  },
  {
    id: 'courtyard_towers',
    stageIndex: 2,
    stageId: 'courtyard',
    name: 'Clear the Towers',
    description:
      'Target the protected rear positions first. The fight is slightly harder, but winning preserves more momentum for the commander.',
    formationShapeId: 'protected_rear_225',
    baseThreat: 201,
    wear: 8,
    powerBonusDelta: 0.04
  },
  {
    id: 'commander_keep',
    stageIndex: 3,
    stageId: 'commander',
    name: 'Storm the Keep',
    description:
      'The enemy commander commits a heavy 4–4–1 line with almost no protected rear. This is the decisive assault.',
    formationShapeId: 'heavy_front_441',
    baseThreat: 228,
    wear: 11
  }
];

const stageThreatMultiplier: Record<string, number> = {
  camp: 0.8,
  settlement: 0.9,
  fort: 0.76,
  town: 1.12,
  stronghold: 1.25,
  capital: 1.4,
  grand: 1.52
};

const emptyReward = (): ResourceWallet => ({
  gold: 0,
  wood: 0,
  stone: 0,
  iron: 0,
  provisions: 0
});

export function getSiegeChoices(stageIndex: number) {
  return choices.filter(
    choice => choice.stageIndex === stageIndex
  );
}

export function getSiegeChoice(id: string) {
  return choices.find(choice => choice.id === id) ?? null;
}

export function getSiegePreparation({
  buildingLevels,
  buildingIds,
  wagonItems
}: {
  buildingLevels: Record<string, number>;
  buildingIds: {
    army: string;
    forge: string;
    logistics: string;
    supply: string;
    command: string;
    scout: string;
  };
  wagonItems: WagonItemDefinition[];
}): SiegePreparation {
  const army =
    buildingLevels[buildingIds.army] ?? 0;
  const forge =
    buildingLevels[buildingIds.forge] ?? 0;
  const logistics =
    buildingLevels[buildingIds.logistics] ?? 0;
  const supply =
    buildingLevels[buildingIds.supply] ?? 0;
  const command =
    buildingLevels[buildingIds.command] ?? 0;
  const scout =
    buildingLevels[buildingIds.scout] ?? 0;

  const hasRations =
    wagonItems.some(item => item.id === 'rations');
  const hasMedicine =
    wagonItems.some(item => item.id === 'medicine');
  const hasRepairKit =
    wagonItems.some(item => item.id === 'repair');

  const engineering = Math.min(
    3,
    Math.floor(forge / 2) +
      (logistics >= 2 ? 1 : 0) +
      (hasRepairKit ? 1 : 0)
  );

  const initialSupplies = Math.min(
    8,
    2 +
      (supply >= 2 ? 1 : 0) +
      (logistics >= 2 ? 1 : 0) +
      (hasRations ? 1 : 0) +
      (hasMedicine ? 1 : 0) +
      (hasRepairKit ? 1 : 0)
  );

  const powerMultiplier =
    1 +
    Math.min(0.08, army * 0.015) +
    Math.min(0.06, command * 0.015) +
    Math.min(0.06, forge * 0.012);

  return {
    initialSupplies,
    powerMultiplier,
    engineering,
    permanentIntel: scout >= 2,
    hasRations,
    hasMedicine,
    bonuses: [
      {
        label: 'Army support',
        value:
          '+' +
          Math.round(
            Math.min(0.08, army * 0.015) * 100
          ) +
          '% power'
      },
      {
        label: 'Engineering',
        value: String(engineering)
      },
      {
        label: 'Field supplies',
        value: String(initialSupplies)
      },
      {
        label: 'Command support',
        value:
          '+' +
          Math.round(
            Math.min(0.06, command * 0.015) * 100
          ) +
          '% power'
      }
    ]
  };
}

export function getSiegeThreat(
  choice: SiegeChoice,
  wagonStageId: string
) {
  return Math.round(
    choice.baseThreat *
      (stageThreatMultiplier[wagonStageId] ?? 1)
  );
}

export function getSiegeEffectivePower({
  basePower,
  playerShapeId,
  enemyShapeId,
  readiness,
  preparationMultiplier,
  powerBonus
}: {
  basePower: number;
  playerShapeId: FormationShapeId;
  enemyShapeId: FormationShapeId;
  readiness: number;
  preparationMultiplier: number;
  powerBonus: number;
}) {
  const matchup =
    getFormationMatchup(
      playerShapeId,
      enemyShapeId
    );
  const formationMultiplier =
    matchup.outgoingDamageMultiplier /
    matchup.incomingDamageMultiplier;
  const readinessMultiplier =
    readiness >= 70
      ? 1
      : 0.88 +
        0.12 *
          Math.max(0, readiness) /
          70;

  return {
    value: Math.round(
      basePower *
        preparationMultiplier *
        (1 + powerBonus) *
        formationMultiplier *
        readinessMultiplier
    ),
    matchup
  };
}

function getSiegeWear({
  choice,
  effectivePower,
  threat,
  hasRations,
  hasMedicine
}: {
  choice: SiegeChoice;
  effectivePower: number;
  threat: number;
  hasRations: boolean;
  hasMedicine: boolean;
}) {
  const ratio =
    threat > 0 ? effectivePower / threat : 1;

  let loss =
    choice.wear +
    (
      ratio >= 1.25
        ? -3
        : ratio >= 1.1
          ? -2
          : ratio >= 1
            ? -1
            : 4
    );

  if (hasRations) loss -= 1;
  if (hasMedicine) loss -= 1;

  return Math.max(
    effectivePower >= threat ? 2 : 9,
    loss
  );
}

export function createSiegeRun({
  readiness,
  supplies,
  basePower,
  preparationMultiplier,
  playerShapeId,
  wagonStageId,
  engineering,
  permanentIntel,
  hasRations,
  hasMedicine,
  rewardMultiplier
}: {
  readiness: number;
  supplies: number;
  basePower: number;
  preparationMultiplier: number;
  playerShapeId: FormationShapeId;
  wagonStageId: string;
  engineering: number;
  permanentIntel: boolean;
  hasRations: boolean;
  hasMedicine: boolean;
  rewardMultiplier: 0 | 0.5 | 1;
}): SiegeRunState {
  return {
    stageIndex: 0,
    readiness: Math.max(
      25,
      Math.min(100, Math.round(readiness))
    ),
    supplies: Math.max(
      0,
      Math.min(8, Math.floor(supplies))
    ),
    powerBonus: 0,
    rewardMultiplier,
    basePower: Math.max(0, Math.round(basePower)),
    preparationMultiplier: Math.max(
      1,
      Math.min(1.25, preparationMultiplier)
    ),
    playerShapeId,
    wagonStageId,
    engineering: Math.max(
      0,
      Math.min(3, Math.floor(engineering))
    ),
    permanentIntel,
    hasRations,
    hasMedicine,
    path: [],
    failed: false,
    completed: false,
    lastSummary: null
  };
}

export function resolveSiegeChoice({
  run,
  choiceId
}: {
  run: SiegeRunState;
  choiceId: string;
}): SiegeResolution {
  if (run.failed || run.completed) {
    return {
      ok: false,
      success: false,
      state: run,
      summary: 'This siege is already resolved.'
    };
  }

  const choice = getSiegeChoice(choiceId);
  if (
    !choice ||
    choice.stageIndex !== run.stageIndex
  ) {
    return {
      ok: false,
      success: false,
      state: run,
      summary:
        'That siege plan is not available at the current stage.'
    };
  }

  if (
    (choice.minimumEngineering ?? 0) >
    run.engineering
  ) {
    return {
      ok: false,
      success: false,
      state: run,
      summary:
        'Your siege engineering is not developed enough for that plan.'
    };
  }

  const supplyCost = choice.supplyCost ?? 0;
  if (run.supplies < supplyCost) {
    return {
      ok: false,
      success: false,
      state: run,
      summary:
        'Not enough siege supplies for that plan.'
    };
  }

  const supplies =
    run.supplies - supplyCost;
  const preFightReadiness = Math.max(
    25,
    Math.min(
      100,
      run.readiness +
        (choice.readinessDelta ?? 0)
    )
  );
  const powerBonus = Math.min(
    0.2,
    run.powerBonus +
      (choice.powerBonusDelta ?? 0)
  );
  const threat =
    getSiegeThreat(
      choice,
      run.wagonStageId
    );
  const effective =
    getSiegeEffectivePower({
      basePower: run.basePower,
      playerShapeId: run.playerShapeId,
      enemyShapeId: choice.formationShapeId,
      readiness: preFightReadiness,
      preparationMultiplier:
        run.preparationMultiplier,
      powerBonus
    });
  const success =
    effective.value >= threat;
  const wear =
    getSiegeWear({
      choice,
      effectivePower: effective.value,
      threat,
      hasRations: run.hasRations,
      hasMedicine: run.hasMedicine
    });
  const readiness = Math.max(
    25,
    preFightReadiness - wear
  );

  if (!success) {
    const failed: SiegeRunState = {
      ...run,
      readiness,
      supplies,
      powerBonus,
      path: [...run.path, choice.id],
      failed: true,
      completed: false,
      lastSummary:
        choice.name +
        ' failed. The assault breaks at ' +
        readiness +
        '% Readiness.'
    };

    return {
      ok: true,
      success: false,
      state: failed,
      effectivePower: effective.value,
      threat,
      matchup: effective.matchup,
      summary: failed.lastSummary ?? 'Siege failed.'
    };
  }

  const stageIndex = run.stageIndex + 1;
  const completed =
    stageIndex >= siegeStages.length;
  const next: SiegeRunState = {
    ...run,
    stageIndex,
    readiness,
    supplies,
    powerBonus,
    path: [...run.path, choice.id],
    failed: false,
    completed,
    lastSummary:
      choice.name +
      ' succeeded. Readiness is now ' +
      readiness +
      '%.'
  };

  return {
    ok: true,
    success: true,
    state: next,
    effectivePower: effective.value,
    threat,
    matchup: effective.matchup,
    summary: next.lastSummary ?? 'Siege stage cleared.'
  };
}

export function getSiegeReward(
  multiplier: 0 | 0.5 | 1
): ResourceWallet {
  if (multiplier <= 0) {
    return emptyReward();
  }

  const reward: ResourceWallet = {
    gold: 82,
    wood: 14,
    stone: 12,
    iron: 7,
    provisions: 6
  };

  return {
    gold: Math.round(reward.gold * multiplier),
    wood: Math.round(reward.wood * multiplier),
    stone: Math.round(reward.stone * multiplier),
    iron: Math.round(reward.iron * multiplier),
    provisions: Math.round(
      reward.provisions * multiplier
    )
  };
}
