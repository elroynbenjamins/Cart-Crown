import {
  getFormationMatchup
} from './formation';
import type {
  FactionId,
  FormationShapeId,
  ResourceWallet,
  SettlementAdjacencyEffects,
  WagonItemDefinition
} from './types';

export type ExpeditionNodeType =
  | 'battle'
  | 'event'
  | 'supply'
  | 'elite'
  | 'boss';

export type ExpeditionStageDefinition = {
  id: string;
  title: string;
  type: ExpeditionNodeType;
  summary: string;
};

export type ExpeditionChoiceDefinition = {
  id: string;
  stageIndex: number;
  type: ExpeditionNodeType;
  names: Record<FactionId, string>;
  description: string;
  formationShapeId?: FormationShapeId;
  baseThreat?: number;
  wear?: number;
  supplyCost?: number;
  supplyDelta?: number;
  readinessDelta?: number;
  powerBonusDelta?: number;
  loot?: Partial<ResourceWallet>;
};

export type ExpeditionRunState = {
  stageIndex: number;
  readiness: number;
  supplies: number;
  powerBonus: number;
  loot: ResourceWallet;
  path: string[];
  failed: boolean;
  completed: boolean;
  lastSummary: string | null;
};

export type ExpeditionPreparation = {
  initialSupplies: number;
  hasRations: boolean;
  hasMedicine: boolean;
  hasRepairKit: boolean;
  bonuses: Array<{
    label: string;
    value: string;
  }>;
};

export type ExpeditionResolution = {
  ok: boolean;
  combat: boolean;
  success: boolean;
  state: ExpeditionRunState;
  effectivePower?: number;
  threat?: number;
  matchup?: ReturnType<
    typeof getFormationMatchup
  >;
  summary: string;
};

export const expeditionStages:
  ExpeditionStageDefinition[] = [
    {
      id: 'approach',
      title: 'Choose the Approach',
      type: 'battle',
      summary:
        'Pick a safer road or take a harder shortcut for better loot.'
    },
    {
      id: 'crossroads',
      title: 'Crossroads Event',
      type: 'event',
      summary:
        'Trade time, supplies or risk for a stronger run.'
    },
    {
      id: 'respite',
      title: 'Field Respite',
      type: 'supply',
      summary:
        'Recover Readiness or invest in temporary expedition power.'
    },
    {
      id: 'elite',
      title: 'Elite Blockade',
      type: 'elite',
      summary:
        'Choose which dangerous formation you want to solve.'
    },
    {
      id: 'boss',
      title: 'Route Boss',
      type: 'boss',
      summary:
        'Defeat the route commander to secure everything gathered during the run.'
    }
  ];

const choices: ExpeditionChoiceDefinition[] = [
  {
    id: 'approach_patrol',
    stageIndex: 0,
    type: 'battle',
    names: {
      human: 'Old Road Patrol',
      elf: 'Outer Rootway Patrol',
      orc: 'Outer Warpath Patrol'
    },
    description:
      'The safer approach uses a mobile skirmish screen. Lower risk, but the recovered cache is small.',
    formationShapeId: 'skirmish_screen_243',
    baseThreat: 88,
    wear: 5,
    loot: {
      gold: 10,
      wood: 4
    }
  },
  {
    id: 'approach_shortcut',
    stageIndex: 0,
    type: 'battle',
    names: {
      human: 'Broken Spear Crossing',
      elf: 'Ashen Thorn Crossing',
      orc: 'Stonejaw Cut'
    },
    description:
      'A shield-heavy 5–2–2 host controls the shortcut. Harder, but iron and coin are already stacked nearby.',
    formationShapeId: 'wide_vanguard_522',
    baseThreat: 104,
    wear: 6,
    loot: {
      gold: 16,
      iron: 2,
      wood: 2
    }
  },
  {
    id: 'event_salvage',
    stageIndex: 1,
    type: 'event',
    names: {
      human: 'Search the Tollhouse',
      elf: 'Search the Fallen Waystone',
      orc: 'Search the Burned Camp'
    },
    description:
      'Spend one field supply and lose a little time, but recover valuables and route information.',
    supplyCost: 1,
    readinessDelta: -2,
    powerBonusDelta: 0.03,
    loot: {
      gold: 12,
      stone: 2
    }
  },
  {
    id: 'event_travelers',
    stageIndex: 1,
    type: 'event',
    names: {
      human: 'Escort Stranded Travelers',
      elf: 'Guide Lost Wayfarers',
      orc: 'Guide a Separated Clan Band'
    },
    description:
      'Take the slower humane route. The group shares provisions and leaves your army better supplied.',
    readinessDelta: -1,
    supplyDelta: 2,
    loot: {
      provisions: 2
    }
  },
  {
    id: 'supply_spring',
    stageIndex: 2,
    type: 'supply',
    names: {
      human: 'Hidden Spring',
      elf: 'Moonwell Respite',
      orc: 'Coldstone Spring'
    },
    description:
      'Spend one field supply on a proper halt. Medicine improves the value of the stop indirectly by preserving later combat wear.',
    supplyCost: 1,
    readinessDelta: 18,
    supplyDelta: 1
  },
  {
    id: 'supply_cache',
    stageIndex: 2,
    type: 'supply',
    names: {
      human: 'Sealed Campaign Cache',
      elf: 'Sealed Warden Cache',
      orc: 'Buried War Cache'
    },
    description:
      'Take only a short rest, but repair useful gear and gain a temporary combat edge for the rest of this expedition.',
    readinessDelta: 4,
    supplyDelta: 1,
    powerBonusDelta: 0.06,
    loot: {
      wood: 4,
      iron: 2
    }
  },
  {
    id: 'elite_assault',
    stageIndex: 3,
    type: 'elite',
    names: {
      human: 'Veteran Raider Assault',
      elf: 'Ashen Vanguard',
      orc: 'Veteran Clanbreakers'
    },
    description:
      'An aggressive 4–3–2 force wants to decide the battle early. The loot is reliable if you can absorb the opening pressure.',
    formationShapeId: 'assault_432',
    baseThreat: 128,
    wear: 8,
    loot: {
      gold: 20,
      iron: 3
    }
  },
  {
    id: 'elite_bowline',
    stageIndex: 3,
    type: 'elite',
    names: {
      human: 'Blackwood Bowline',
      elf: 'Wardbreaker Bowline',
      orc: 'Clanbreaker Bowline'
    },
    description:
      'A 2–2–5 protected rear line carries more loot, but punishes formations that cannot reach its backline.',
    formationShapeId: 'protected_rear_225',
    baseThreat: 136,
    wear: 8,
    loot: {
      gold: 22,
      wood: 5,
      provisions: 2
    }
  },
  {
    id: 'boss_routebreaker',
    stageIndex: 4,
    type: 'boss',
    names: {
      human: 'The Roadbreaker',
      elf: 'The Rootbreaker',
      orc: 'The Warpath Breaker'
    },
    description:
      'The route commander holds a reinforced 2–5–2 center. Win here to bank the full expedition haul.',
    formationShapeId: 'reinforced_center_252',
    baseThreat: 154,
    wear: 10,
    loot: {
      gold: 25,
      stone: 3,
      iron: 2
    }
  }
];

const stageThreatMultiplier:
  Record<string, number> = {
    camp: 0.82,
    settlement: 0.92,
    fort: 1,
    town: 1.12,
    stronghold: 1.25,
    capital: 1.4,
    grand: 1.52
  };

const emptyWallet = (): ResourceWallet => ({
  gold: 0,
  wood: 0,
  stone: 0,
  iron: 0,
  provisions: 0
});

function addLoot(
  wallet: ResourceWallet,
  extra: Partial<ResourceWallet>
) {
  return {
    gold: wallet.gold + (extra.gold ?? 0),
    wood: wallet.wood + (extra.wood ?? 0),
    stone: wallet.stone + (extra.stone ?? 0),
    iron: wallet.iron + (extra.iron ?? 0),
    provisions:
      wallet.provisions +
      (extra.provisions ?? 0)
  };
}

export function createExpeditionRun({
  readiness,
  supplies
}: {
  readiness: number;
  supplies: number;
}): ExpeditionRunState {
  return {
    stageIndex: 0,
    readiness: Math.max(
      0,
      Math.min(100, readiness)
    ),
    supplies: Math.max(
      0,
      Math.floor(supplies)
    ),
    powerBonus: 0,
    loot: emptyWallet(),
    path: [],
    failed: false,
    completed: false,
    lastSummary: null
  };
}

export function getExpeditionChoices(
  faction: FactionId,
  stageIndex: number
) {
  return choices
    .filter(
      choice =>
        choice.stageIndex === stageIndex
    )
    .map(choice => ({
      ...choice,
      name: choice.names[faction]
    }));
}

export function getExpeditionChoice(
  id: string
) {
  return choices.find(
    choice => choice.id === id
  ) ?? null;
}

export function getExpeditionThreat(
  choice: ExpeditionChoiceDefinition,
  wagonStageId: string
) {
  if (choice.baseThreat === undefined) {
    return null;
  }

  return Math.round(
    choice.baseThreat *
      (
        stageThreatMultiplier[
          wagonStageId
        ] ?? 1
      )
  );
}

export function getExpeditionPreparation({
  buildingLevels,
  buildingIds,
  wagonItems
}: {
  buildingLevels: Record<string, number>;
  buildingIds: {
    logistics: string;
    supply: string;
  };
  wagonItems: WagonItemDefinition[];
}): ExpeditionPreparation {
  const logisticsLevel =
    buildingLevels[
      buildingIds.logistics
    ] ?? 0;
  const supplyLevel =
    buildingLevels[
      buildingIds.supply
    ] ?? 0;

  const hasRations =
    wagonItems.some(
      item => item.id === 'rations'
    );
  const hasMedicine =
    wagonItems.some(
      item => item.id === 'medicine'
    );
  const hasRepairKit =
    wagonItems.some(
      item => item.id === 'repair'
    );

  const initialSupplies = Math.min(
    8,
    2 +
      (hasRations ? 1 : 0) +
      (hasMedicine ? 1 : 0) +
      (hasRepairKit ? 1 : 0) +
      (logisticsLevel >= 2 ? 1 : 0) +
      (supplyLevel >= 2 ? 1 : 0)
  );

  const bonuses: ExpeditionPreparation['bonuses'] = [
    {
      label: 'Field supplies',
      value: String(initialSupplies)
    },
    {
      label: 'Logistics',
      value:
        logisticsLevel >= 2
          ? '+1 supply'
          : 'Basic'
    },
    {
      label: 'Stores',
      value:
        supplyLevel >= 2
          ? '+1 supply'
          : 'Basic'
    }
  ];

  if (hasRations) {
    bonuses.push({
      label: 'Rations',
      value: 'Lower battle wear'
    });
  }
  if (hasMedicine) {
    bonuses.push({
      label: 'Medicine',
      value: 'Lower battle wear'
    });
  }
  if (hasRepairKit) {
    bonuses.push({
      label: 'Repair Kit',
      value: 'Extra route supply'
    });
  }

  return {
    initialSupplies,
    hasRations,
    hasMedicine,
    hasRepairKit,
    bonuses
  };
}

export function getExpeditionEffectivePower({
  basePower,
  playerShapeId,
  enemyShapeId,
  readiness,
  powerBonus
}: {
  basePower: number;
  playerShapeId: FormationShapeId;
  enemyShapeId: FormationShapeId;
  readiness: number;
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
        (1 + powerBonus) *
        formationMultiplier *
        readinessMultiplier
    ),
    matchup
  };
}

export function getExpeditionWear({
  choice,
  effectivePower,
  threat,
  hasRations,
  hasMedicine
}: {
  choice: ExpeditionChoiceDefinition;
  effectivePower: number;
  threat: number;
  hasRations: boolean;
  hasMedicine: boolean;
}) {
  const baseWear = choice.wear ?? 0;
  const ratio =
    threat > 0
      ? effectivePower / threat
      : 1;

  let loss =
    baseWear +
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
    effectivePower >= threat ? 2 : 8,
    loss
  );
}

export function resolveExpeditionChoice({
  faction,
  run,
  choiceId,
  basePower,
  playerShapeId,
  wagonStageId,
  preparation
}: {
  faction: FactionId;
  run: ExpeditionRunState;
  choiceId: string;
  basePower: number;
  playerShapeId: FormationShapeId;
  wagonStageId: string;
  preparation: ExpeditionPreparation;
}): ExpeditionResolution {
  if (
    run.failed ||
    run.completed
  ) {
    return {
      ok: false,
      combat: false,
      success: false,
      state: run,
      summary:
        'This expedition is already resolved.'
    };
  }

  const choice = getExpeditionChoice(
    choiceId
  );

  if (
    !choice ||
    choice.stageIndex !== run.stageIndex
  ) {
    return {
      ok: false,
      combat: false,
      success: false,
      state: run,
      summary:
        'That route option is not available at the current stage.'
    };
  }

  const supplyCost =
    choice.supplyCost ?? 0;
  if (run.supplies < supplyCost) {
    return {
      ok: false,
      combat: false,
      success: false,
      state: run,
      summary:
        'Not enough field supplies for that route choice.'
    };
  }

  let readiness = Math.max(
    0,
    Math.min(
      100,
      run.readiness +
        (choice.readinessDelta ?? 0)
    )
  );
  const supplies = Math.max(
    0,
    Math.min(
      8,
      run.supplies -
        supplyCost +
        (choice.supplyDelta ?? 0)
    )
  );
  const powerBonus = Math.min(
    0.18,
    Math.max(
      0,
      run.powerBonus +
        (choice.powerBonusDelta ?? 0)
    )
  );
  let loot = addLoot(
    run.loot,
    choice.loot ?? {}
  );

  const combat =
    choice.type === 'battle' ||
    choice.type === 'elite' ||
    choice.type === 'boss';

  if (combat) {
    const threat =
      getExpeditionThreat(
        choice,
        wagonStageId
      );
    const enemyShapeId =
      choice.formationShapeId;

    if (
      threat === null ||
      !enemyShapeId
    ) {
      return {
        ok: false,
        combat: true,
        success: false,
        state: run,
        summary:
          'This expedition combat node is missing authored threat data.'
      };
    }

    const effective =
      getExpeditionEffectivePower({
        basePower,
        playerShapeId,
        enemyShapeId,
        readiness,
        powerBonus
      });
    const success =
      effective.value >= threat;
    const wear =
      getExpeditionWear({
        choice,
        effectivePower:
          effective.value,
        threat,
        hasRations:
          preparation.hasRations,
        hasMedicine:
          preparation.hasMedicine
      });

    readiness = Math.max(
      0,
      readiness - wear
    );

    if (!success) {
      const failedState: ExpeditionRunState = {
        ...run,
        readiness,
        supplies,
        powerBonus,
        loot,
        path: [
          ...run.path,
          choice.id
        ],
        failed: true,
        completed: false,
        lastSummary:
          choice.names[faction] +
          ' broke the expedition at ' +
          readiness +
          '% Readiness. Unsecured loot is lost.'
      };

      return {
        ok: true,
        combat: true,
        success: false,
        state: failedState,
        effectivePower:
          effective.value,
        threat,
        matchup:
          effective.matchup,
        summary:
          failedState.lastSummary ??
          'Expedition failed.'
      };
    }

    const nextStage =
      run.stageIndex + 1;
    const completed =
      nextStage >=
      expeditionStages.length;
    const nextState: ExpeditionRunState = {
      ...run,
      stageIndex: nextStage,
      readiness,
      supplies,
      powerBonus,
      loot,
      path: [
        ...run.path,
        choice.id
      ],
      failed: false,
      completed,
      lastSummary:
        choice.names[faction] +
        ' cleared. Readiness is now ' +
        readiness +
        '%.'
    };

    return {
      ok: true,
      combat: true,
      success: true,
      state: nextState,
      effectivePower:
        effective.value,
      threat,
      matchup:
        effective.matchup,
      summary:
        nextState.lastSummary ??
        'Expedition battle cleared.'
    };
  }

  const nextStage =
    run.stageIndex + 1;
  const completed =
    nextStage >=
    expeditionStages.length;
  const nextState: ExpeditionRunState = {
    ...run,
    stageIndex: nextStage,
    readiness,
    supplies,
    powerBonus,
    loot,
    path: [
      ...run.path,
      choice.id
    ],
    failed: false,
    completed,
    lastSummary:
      choice.names[faction] +
      ' resolved. Readiness ' +
      readiness +
      '%, supplies ' +
      supplies +
      '.'
  };

  return {
    ok: true,
    combat: false,
    success: true,
    state: nextState,
    summary:
      nextState.lastSummary ??
      'Expedition event resolved.'
  };
}

export function getExpeditionCompletionReward({
  run,
  logisticsLevel,
  settlementEffects
}: {
  run: ExpeditionRunState;
  logisticsLevel: number;
  settlementEffects: SettlementAdjacencyEffects;
}): ResourceWallet {
  return addLoot(
    {
      gold: 40,
      wood:
        8 +
        (logisticsLevel >= 2 ? 1 : 0) +
        settlementEffects.expeditionWoodBonus,
      stone: 2,
      iron: 1,
      provisions:
        4 +
        settlementEffects.expeditionProvisionBonus
    },
    run.loot
  );
}
