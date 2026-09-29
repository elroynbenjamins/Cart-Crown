import {
  createRelicHuntRun,
  getRelicAffinitySnapshot,
  getRelicCounterMultiplier,
  getRelicGuardianThreat,
  relicGuardianStages,
  relicRewards,
  resolveRelicGuardian
} from '../src/game/relicHunts';
import { getEquipment } from '../src/game/equipment';
import {
  createNewSaveRecord,
  normalizeSaveRecord
} from '../src/save/schema';
import type { UnitDefinition } from '../src/game/types';

function check(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) throw new Error(message);
}

function unit(
  id: string,
  battleTags: UnitDefinition['battleTags']
): UnitDefinition {
  return {
    id,
    name: id,
    className: id,
    faction: 'human',
    role: 'melee',
    tier: 4,
    level: 8,
    hp: 130,
    attack: 22,
    armor: 10,
    speed: 10,
    battleTags
  };
}

function runStructureCoverage() {
  check(
    relicGuardianStages.length === 3,
    'Relic Hunt must remain a three-guardian chain.'
  );
  check(
    relicGuardianStages
      .map(stage => stage.primaryFamily)
      .join(',') ===
      'magic,flying,large',
    'Relic guardian fantasy-counter order changed.'
  );
}

function runAffinityCoverage() {
  const snapshot =
    getRelicAffinitySnapshot([
      unit('mage', ['ground', 'magic']),
      unit('griffin', [
        'flying',
        'mounted',
        'magic'
      ]),
      unit('golem', [
        'ground',
        'large',
        'construct'
      ])
    ]);

  check(
    snapshot.magic === 2,
    'Magic affinity count is incorrect.'
  );
  check(
    snapshot.flying === 1,
    'Flying affinity count is incorrect.'
  );
  check(
    snapshot.large === 1,
    'Large affinity count is incorrect.'
  );
  check(
    snapshot.hybrid === 1,
    'Magic+Flying hybrid affinity count is incorrect.'
  );
}

function runCounterCoverage() {
  const none = {
    magic: 0,
    flying: 0,
    large: 0,
    hybrid: 0
  };
  const magic = {
    magic: 2,
    flying: 0,
    large: 0,
    hybrid: 0
  };
  const mixed = {
    magic: 2,
    flying: 1,
    large: 1,
    hybrid: 1
  };

  check(
    getRelicCounterMultiplier(
      relicGuardianStages[0]!,
      magic
    ) >
      getRelicCounterMultiplier(
        relicGuardianStages[0]!,
        none
      ),
    'Magic no longer counters the first relic guardian.'
  );

  check(
    getRelicCounterMultiplier(
      relicGuardianStages[1]!,
      mixed
    ) >
      getRelicCounterMultiplier(
        relicGuardianStages[1]!,
        magic
      ),
    'Flying no longer improves the second guardian matchup.'
  );

  check(
    getRelicCounterMultiplier(
      relicGuardianStages[2]!,
      mixed
    ) >
      getRelicCounterMultiplier(
        relicGuardianStages[2]!,
        magic
      ),
    'Fantasy diversity/Large/Hybrid no longer improves the final guardian matchup.'
  );
}

function runChainCoverage() {
  let specialized = createRelicHuntRun({
    readiness: 100,
    basePower: 245,
    playerShapeId: 'assault_432',
    wagonStageId: 'stronghold',
    affinities: {
      magic: 2,
      flying: 1,
      large: 1,
      hybrid: 1
    }
  });

  for (
    let index = 0;
    index < relicGuardianStages.length;
    index += 1
  ) {
    const result =
      resolveRelicGuardian({
        faction: 'human',
        run: specialized
      });

    check(
      result.ok && result.success,
      'Specialized Relic Hunt failed at guardian ' +
        String(index + 1) +
        ': ' +
        result.summary
    );
    specialized = result.state;
  }

  check(
    specialized.completed &&
      specialized.path.length === 3,
    'Successful Relic Hunt did not complete all three guardians.'
  );
  check(
    specialized.readiness < 100,
    'Successful Relic Hunt caused no persistent Readiness wear.'
  );

  const conventional = createRelicHuntRun({
    readiness: 70,
    basePower: 155,
    playerShapeId: 'balanced_333',
    wagonStageId: 'stronghold',
    affinities: {
      magic: 0,
      flying: 0,
      large: 0,
      hybrid: 0
    }
  });

  const failed =
    resolveRelicGuardian({
      faction: 'human',
      run: conventional
    });

  check(
    failed.ok &&
      !failed.success &&
      failed.state.failed,
    'Weak conventional army can brute-force the Relic Hunt opening guardian.'
  );
}

function runRewardCoverage() {
  for (const faction of [
    'human',
    'elf',
    'orc'
  ] as const) {
    const reward =
      relicRewards[faction];
    const artifact =
      getEquipment(reward.artifactId);

    check(
      artifact,
      faction +
        ' Relic Hunt artifact is missing from equipment definitions.'
    );
    check(
      artifact.faction === faction,
      faction +
        ' Relic Hunt artifact has the wrong faction.'
    );
    check(
      artifact.slot === 'artifact',
      faction +
        ' Relic Hunt reward does not use the Artifact slot.'
    );
    check(
      artifact.craftCost &&
        Object.keys(
          artifact.craftCost
        ).length === 0,
      faction +
        ' Relic Hunt artifact unexpectedly has a crafting path.'
    );
  }
}

function runScalingCoverage() {
  const boss =
    relicGuardianStages[2]!;
  const town =
    getRelicGuardianThreat(
      boss,
      'town'
    );
  const stronghold =
    getRelicGuardianThreat(
      boss,
      'stronghold'
    );
  const capital =
    getRelicGuardianThreat(
      boss,
      'capital'
    );

  check(
    town < stronghold &&
      stronghold < capital,
    'Relic guardian threat no longer scales with kingdom tier.'
  );
}

function runSaveCoverage() {
  const record =
    createNewSaveRecord(1);
  const human =
    record.snapshot.factionStates.human;
  check(human, 'Human save fixture missing.');

  const run =
    createRelicHuntRun({
      readiness: 88,
      basePower: 230,
      playerShapeId: 'assault_432',
      wagonStageId: 'stronghold',
      affinities: {
        magic: 2,
        flying: 1,
        large: 0,
        hybrid: 0
      }
    });

  const first =
    resolveRelicGuardian({
      faction: 'human',
      run
    });
  check(
    first.ok && first.success,
    'Relic save fixture could not clear guardian one.'
  );

  human.activeRelicHuntRun =
    first.state;
  human.relicHuntRunsCompleted = 3;
  human.relicHuntRewardClaimed = true;

  const normalized =
    normalizeSaveRecord(
      1,
      record
    );
  const restored =
    normalized?.snapshot.factionStates.human;

  check(
    restored?.activeRelicHuntRun?.stageIndex === 1 &&
      restored.activeRelicHuntRun.path[0] ===
        'rune_sentinel',
    'Active Relic Hunt did not survive save normalization.'
  );
  check(
    restored?.activeRelicHuntRun?.affinities.magic === 2 &&
      restored.activeRelicHuntRun.affinities.flying === 1,
    'Frozen fantasy affinity snapshot was not preserved.'
  );
  check(
    restored?.relicHuntRunsCompleted === 3 &&
      restored.relicHuntRewardClaimed,
    'Relic Hunt completion/reward state was not preserved.'
  );
}

runStructureCoverage();
runAffinityCoverage();
runCounterCoverage();
runChainCoverage();
runRewardCoverage();
runScalingCoverage();
runSaveCoverage();

console.log(
  'PASS: Relic Hunts preserve three-guardian fantasy counters, attrition, unique artifacts, tier scaling and save/resume state.'
);
