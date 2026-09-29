import {
  getFormationMatchup
} from './formation';
import type {
  FactionId,
  FormationShapeId,
  UnitDefinition
} from './types';

export type RelicFamily =
  | 'magic'
  | 'flying'
  | 'large'
  | 'hybrid';

export type RelicAffinitySnapshot = {
  magic: number;
  flying: number;
  large: number;
  hybrid: number;
};

export type RelicGuardianStage = {
  id: string;
  name: Record<FactionId, string>;
  description: string;
  formationShapeId: FormationShapeId;
  baseThreat: number;
  wear: number;
  primaryFamily: RelicFamily;
  secondaryFamily?: RelicFamily;
};

export type RelicHuntRunState = {
  stageIndex: number;
  readiness: number;
  basePower: number;
  playerShapeId: FormationShapeId;
  wagonStageId: string;
  affinities: RelicAffinitySnapshot;
  failed: boolean;
  completed: boolean;
  path: string[];
  lastSummary: string | null;
};

export type RelicGuardianResolution = {
  ok: boolean;
  success: boolean;
  state: RelicHuntRunState;
  effectivePower: number;
  threat: number;
  counterMultiplier: number;
  matchup: ReturnType<
    typeof getFormationMatchup
  >;
  summary: string;
};

export type RelicRewardDefinition = {
  artifactId: string;
  artifactName: string;
  cosmeticId: string;
  cosmeticName: string;
  loreId: string;
};

export const relicGuardianStages:
  RelicGuardianStage[] = [
    {
      id: 'rune_sentinel',
      name: {
        human: 'Oathglass Sentinel',
        elf: 'Moonroot Sentinel',
        orc: 'Emberfang Sentinel'
      },
      description:
        'A warded guardian turns conventional pressure aside. Arcane or spirit-infused troops can disrupt the binding runes and expose the core.',
      formationShapeId:
        'reinforced_center_252',
      baseThreat: 188,
      wear: 7,
      primaryFamily: 'magic'
    },
    {
      id: 'sky_keeper',
      name: {
        human: 'Skyglass Keeper',
        elf: 'Starwing Keeper',
        orc: 'Stormfang Keeper'
      },
      description:
        'The second guardian controls vertical space and protected firing lanes. Flying units are the cleanest counter, while magic can still force openings.',
      formationShapeId:
        'protected_rear_225',
      baseThreat: 224,
      wear: 9,
      primaryFamily: 'flying',
      secondaryFamily: 'magic'
    },
    {
      id: 'relic_guardian',
      name: {
        human: 'The Oathglass Guardian',
        elf: 'The Moonroot Guardian',
        orc: 'The Emberfang Guardian'
      },
      description:
        'The final relic guardian adapts to a single doctrine. Mixed fantasy families, Large units or legendary hybrids create the strongest breakthrough.',
      formationShapeId:
        'heavy_front_441',
      baseThreat: 266,
      wear: 11,
      primaryFamily: 'large',
      secondaryFamily: 'hybrid'
    }
  ];

export const relicRewards:
  Record<FactionId, RelicRewardDefinition> = {
    human: {
      artifactId: 'hum_oathglass_relic',
      artifactName: 'Oathglass Lens',
      cosmeticId:
        'relic_hunter_oathglass',
      cosmeticName:
        'Oathglass Relic Hunter',
      loreId: 'oathglass_relic_restored'
    },
    elf: {
      artifactId: 'elf_moonroot_relic',
      artifactName: 'Moonroot Sigil',
      cosmeticId:
        'relic_hunter_moonroot',
      cosmeticName:
        'Moonroot Relic Hunter',
      loreId: 'moonroot_relic_restored'
    },
    orc: {
      artifactId: 'orc_emberfang_relic',
      artifactName: 'Emberfang Totem',
      cosmeticId:
        'relic_hunter_emberfang',
      cosmeticName:
        'Emberfang Relic Hunter',
      loreId: 'emberfang_relic_restored'
    }
  };

const stageThreatMultiplier:
  Record<string, number> = {
    camp: 0.78,
    settlement: 0.86,
    fort: 0.92,
    town: 0.96,
    stronghold: 1,
    capital: 1.1,
    grand: 1.22
  };

export function getRelicAffinitySnapshot(
  activeUnits: UnitDefinition[]
): RelicAffinitySnapshot {
  const snapshot: RelicAffinitySnapshot = {
    magic: 0,
    flying: 0,
    large: 0,
    hybrid: 0
  };

  for (const unit of activeUnits) {
    const tags = unit.battleTags ?? [];
    const magic = tags.includes('magic');
    const flying = tags.includes('flying');
    const large = tags.includes('large');

    if (magic) snapshot.magic += 1;
    if (flying) snapshot.flying += 1;
    if (large) snapshot.large += 1;
    if (magic && flying) {
      snapshot.hybrid += 1;
    }
  }

  return snapshot;
}

export function getRelicGuardianThreat(
  stage: RelicGuardianStage,
  wagonStageId: string
) {
  return Math.round(
    stage.baseThreat *
      (
        stageThreatMultiplier[
          wagonStageId
        ] ?? 1
      )
  );
}

function familyCount(
  snapshot: RelicAffinitySnapshot,
  family: RelicFamily
) {
  return snapshot[family];
}

export function getRelicCounterMultiplier(
  stage: RelicGuardianStage,
  affinities: RelicAffinitySnapshot
) {
  if (stage.id === 'relic_guardian') {
    const familiesPresent = (
      [
        affinities.magic,
        affinities.flying,
        affinities.large
      ].filter(count => count > 0)
    ).length;

    return Math.min(
      1.36,
      1 +
        familiesPresent * 0.07 +
        Math.min(
          0.12,
          affinities.large * 0.06
        ) +
        Math.min(
          0.12,
          affinities.hybrid * 0.12
        )
    );
  }

  const primary = familyCount(
    affinities,
    stage.primaryFamily
  );
  const secondary =
    stage.secondaryFamily
      ? familyCount(
          affinities,
          stage.secondaryFamily
        )
      : 0;

  return Math.min(
    1.3,
    1 +
      Math.min(
        0.22,
        primary * 0.11
      ) +
      Math.min(
        0.08,
        secondary * 0.04
      )
  );
}

export function getRelicEffectivePower({
  basePower,
  playerShapeId,
  stage,
  readiness,
  affinities
}: {
  basePower: number;
  playerShapeId: FormationShapeId;
  stage: RelicGuardianStage;
  readiness: number;
  affinities: RelicAffinitySnapshot;
}) {
  const matchup =
    getFormationMatchup(
      playerShapeId,
      stage.formationShapeId
    );
  const formationMultiplier =
    matchup.outgoingDamageMultiplier /
    matchup.incomingDamageMultiplier;
  const readinessMultiplier =
    readiness >= 70
      ? 1
      : 0.86 +
        0.14 *
          Math.max(0, readiness) /
          70;
  const counterMultiplier =
    getRelicCounterMultiplier(
      stage,
      affinities
    );

  return {
    value: Math.round(
      basePower *
        formationMultiplier *
        readinessMultiplier *
        counterMultiplier
    ),
    matchup,
    counterMultiplier
  };
}

function getRelicWear({
  stage,
  effectivePower,
  threat
}: {
  stage: RelicGuardianStage;
  effectivePower: number;
  threat: number;
}) {
  const ratio =
    threat > 0
      ? effectivePower / threat
      : 1;

  const adjustment =
    ratio >= 1.3
      ? -3
      : ratio >= 1.15
        ? -2
        : ratio >= 1
          ? -1
          : 5;

  return Math.max(
    effectivePower >= threat
      ? 3
      : 10,
    stage.wear + adjustment
  );
}

export function createRelicHuntRun({
  readiness,
  basePower,
  playerShapeId,
  wagonStageId,
  affinities
}: {
  readiness: number;
  basePower: number;
  playerShapeId: FormationShapeId;
  wagonStageId: string;
  affinities: RelicAffinitySnapshot;
}): RelicHuntRunState {
  return {
    stageIndex: 0,
    readiness: Math.max(
      25,
      Math.min(
        100,
        Math.round(readiness)
      )
    ),
    basePower: Math.max(
      0,
      Math.round(basePower)
    ),
    playerShapeId,
    wagonStageId,
    affinities: { ...affinities },
    failed: false,
    completed: false,
    path: [],
    lastSummary: null
  };
}

export function resolveRelicGuardian({
  faction,
  run
}: {
  faction: FactionId;
  run: RelicHuntRunState;
}): RelicGuardianResolution {
  if (run.failed || run.completed) {
    const stage =
      relicGuardianStages[
        Math.min(
          run.stageIndex,
          relicGuardianStages.length - 1
        )
      ]!;
    const effective =
      getRelicEffectivePower({
        basePower: run.basePower,
        playerShapeId:
          run.playerShapeId,
        stage,
        readiness: run.readiness,
        affinities: run.affinities
      });
    return {
      ok: false,
      success: false,
      state: run,
      effectivePower: effective.value,
      threat:
        getRelicGuardianThreat(
          stage,
          run.wagonStageId
        ),
      counterMultiplier:
        effective.counterMultiplier,
      matchup: effective.matchup,
      summary:
        'This Relic Hunt is already resolved.'
    };
  }

  const stage =
    relicGuardianStages[
      run.stageIndex
    ];
  if (!stage) {
    throw new Error(
      'Missing Relic Hunt guardian stage.'
    );
  }

  const threat =
    getRelicGuardianThreat(
      stage,
      run.wagonStageId
    );
  const effective =
    getRelicEffectivePower({
      basePower: run.basePower,
      playerShapeId:
        run.playerShapeId,
      stage,
      readiness: run.readiness,
      affinities: run.affinities
    });
  const success =
    effective.value >= threat;
  const readiness = Math.max(
    25,
    run.readiness -
      getRelicWear({
        stage,
        effectivePower:
          effective.value,
        threat
      })
  );

  if (!success) {
    const failed: RelicHuntRunState = {
      ...run,
      readiness,
      failed: true,
      path: [
        ...run.path,
        stage.id
      ],
      lastSummary:
        stage.name[faction] +
        ' repelled the hunt. The chain breaks at ' +
        readiness +
        '% Readiness.'
    };

    return {
      ok: true,
      success: false,
      state: failed,
      effectivePower:
        effective.value,
      threat,
      counterMultiplier:
        effective.counterMultiplier,
      matchup: effective.matchup,
      summary:
        failed.lastSummary ??
        'Relic Hunt failed.'
    };
  }

  const stageIndex =
    run.stageIndex + 1;
  const completed =
    stageIndex >=
    relicGuardianStages.length;
  const next: RelicHuntRunState = {
    ...run,
    stageIndex,
    readiness,
    failed: false,
    completed,
    path: [
      ...run.path,
      stage.id
    ],
    lastSummary:
      stage.name[faction] +
      ' defeated. Readiness is now ' +
      readiness +
      '%.'
  };

  return {
    ok: true,
    success: true,
    state: next,
    effectivePower:
      effective.value,
    threat,
    counterMultiplier:
      effective.counterMultiplier,
    matchup: effective.matchup,
    summary:
      next.lastSummary ??
      'Relic guardian defeated.'
  };
}
