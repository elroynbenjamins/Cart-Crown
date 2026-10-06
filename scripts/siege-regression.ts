import { readFileSync } from 'node:fs';
import {
  createSiegeRun,
  getSiegeChoice,
  getSiegePreparation,
  getSiegeReward,
  getSiegeThreat,
  resolveSiegeChoice,
  siegeStages
} from '../src/game/sieges';
import {
  getSiegeRewardMultiplier
} from '../src/game/sideModeBalance';
import {
  createNewSaveRecord,
  normalizeSaveRecord
} from '../src/save/schema';

function check(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) throw new Error(message);
}

function runStructureCoverage() {
  check(
    siegeStages.length === 4,
    'Offensive Siege must remain a four-stage assault.'
  );
  check(
    siegeStages.map(stage => stage.id).join(',') ===
      'approach,breach,courtyard,commander',
    'Siege stage order changed.'
  );
}

function runPreparationCoverage() {
  const basic = getSiegePreparation({
    buildingLevels: {
      army: 1,
      forge: 1,
      logistics: 1,
      supply: 0,
      command: 0,
      scout: 0
    },
    buildingIds: {
      army: 'army',
      forge: 'forge',
      logistics: 'logistics',
      supply: 'supply',
      command: 'command',
      scout: 'scout'
    },
    wagonItems: []
  });

  const prepared = getSiegePreparation({
    buildingLevels: {
      army: 4,
      forge: 4,
      logistics: 3,
      supply: 3,
      command: 3,
      scout: 2
    },
    buildingIds: {
      army: 'army',
      forge: 'forge',
      logistics: 'logistics',
      supply: 'supply',
      command: 'command',
      scout: 'scout'
    },
    wagonItems: [
      {
        id: 'rations',
        name: 'Rations',
        shortName: 'Rations',
        faction: 'global',
        width: 1,
        height: 1,
        rotation: 0,
        effect: '',
        x: 0,
        y: 0
      },
      {
        id: 'medicine',
        name: 'Medicine',
        shortName: 'Medicine',
        faction: 'global',
        width: 1,
        height: 1,
        rotation: 0,
        effect: '',
        x: 1,
        y: 0
      },
      {
        id: 'repair',
        name: 'Repair',
        shortName: 'Repair',
        faction: 'global',
        width: 1,
        height: 1,
        rotation: 0,
        effect: '',
        x: 2,
        y: 0
      }
    ]
  });

  check(
    prepared.powerMultiplier >
      basic.powerMultiplier,
    'Army/Forge/Command development no longer improves Siege power.'
  );
  check(
    prepared.engineering >
      basic.engineering,
    'Forge/Logistics/Repair preparation no longer improves Siege engineering.'
  );
  check(
    prepared.initialSupplies >
      basic.initialSupplies,
    'Siege preparation no longer expands field supplies.'
  );
  check(
    prepared.permanentIntel,
    'Scout development no longer records Siege intelligence.'
  );
}

function runScalingCoverage() {
  const boss = getSiegeChoice(
    'commander_keep'
  );
  check(boss, 'Siege commander fixture missing.');

  const fort = getSiegeThreat(
    boss,
    'fort'
  );
  const town = getSiegeThreat(
    boss,
    'town'
  );
  const stronghold = getSiegeThreat(
    boss,
    'stronghold'
  );

  check(
    fort < town &&
      town < stronghold,
    'Siege threat does not scale with kingdom stage.'
  );
}

function runFallbackBreachCoverage() {
  let run = createSiegeRun({
    readiness: 100,
    supplies: 5,
    basePower: 420,
    preparationMultiplier: 1.1,
    playerShapeId: 'assault_432',
    wagonStageId: 'fort',
    engineering: 0,
    permanentIntel: false,
    hasRations: true,
    hasMedicine: false,
    rewardMultiplier: 1
  });

  const approach = resolveSiegeChoice({
    run,
    choiceId: 'approach_flank'
  });
  check(
    approach.ok && approach.success,
    'Engineering-0 fixture could not reach the breach.'
  );
  run = approach.state;

  const ladders = resolveSiegeChoice({
    run,
    choiceId: 'breach_ladders'
  });
  check(
    ladders.ok,
    'Engineering 0 can soft-lock the Siege because Improvised Ladders are unavailable.'
  );
  check(
    getSiegeChoice('breach_ladders')?.minimumEngineering === undefined,
    'Improvised Ladders unexpectedly require Engineering.'
  );
}

function runEngineeringGateCoverage() {
  const run = createSiegeRun({
    readiness: 100,
    supplies: 8,
    basePower: 400,
    preparationMultiplier: 1.15,
    playerShapeId: 'assault_432',
    wagonStageId: 'fort',
    engineering: 1,
    permanentIntel: false,
    hasRations: true,
    hasMedicine: true,
    rewardMultiplier: 1
  });

  const approach = resolveSiegeChoice({
    run,
    choiceId: 'approach_shielded'
  });
  check(
    approach.ok && approach.success,
    'Engineering gate fixture could not clear approach.'
  );

  const blocked = resolveSiegeChoice({
    run: approach.state,
    choiceId: 'breach_sappers'
  });
  check(
    !blocked.ok,
    'Sapper breach can be used without Engineering 2.'
  );
}

function runAlertCoverage() {
  const boss = getSiegeChoice('commander_keep');
  check(boss, 'Commander fixture missing for alert coverage.');

  const calm = getSiegeThreat(
    boss,
    'town',
    -0.08
  );
  const neutral = getSiegeThreat(
    boss,
    'town',
    0
  );
  const alerted = getSiegeThreat(
    boss,
    'town',
    0.12
  );

  check(
    calm < neutral && neutral < alerted,
    'Defender Alert no longer changes later Siege threat.'
  );

  const base = createSiegeRun({
    readiness: 100,
    supplies: 8,
    basePower: 500,
    preparationMultiplier: 1.15,
    playerShapeId: 'assault_432',
    wagonStageId: 'fort',
    engineering: 3,
    permanentIntel: true,
    hasRations: true,
    hasMedicine: true,
    rewardMultiplier: 1
  });

  const shielded = resolveSiegeChoice({
    run: base,
    choiceId: 'approach_shielded'
  });
  const flank = resolveSiegeChoice({
    run: base,
    choiceId: 'approach_flank'
  });

  check(
    shielded.ok &&
      flank.ok &&
      shielded.success &&
      flank.success,
    'Alert route fixtures could not clear the approach.'
  );
  check(
    shielded.state.defenderAlert >
      flank.state.defenderAlert,
    'Slow frontal approach no longer raises later defender readiness relative to the flanking plan.'
  );
}

function runSuccessAndFailureCoverage() {
  let run = createSiegeRun({
    readiness: 100,
    supplies: 8,
    basePower: 420,
    preparationMultiplier: 1.16,
    playerShapeId: 'assault_432',
    wagonStageId: 'fort',
    engineering: 3,
    permanentIntel: true,
    hasRations: true,
    hasMedicine: true,
    rewardMultiplier: 1
  });

  for (const choiceId of [
    'approach_flank',
    'breach_sappers',
    'courtyard_towers',
    'commander_keep'
  ]) {
    const result = resolveSiegeChoice({
      run,
      choiceId
    });
    check(
      result.ok && result.success,
      'Prepared Siege failed at ' +
        choiceId +
        ': ' +
        result.summary
    );
    run = result.state;
  }

  check(
    run.completed && !run.failed,
    'Commander victory did not complete the Siege.'
  );
  check(
    run.path.length === 4,
    'Completed Siege did not preserve all four stage choices.'
  );
  check(
    run.readiness < 100,
    'Completed Siege caused no Readiness attrition.'
  );

  const weak = createSiegeRun({
    readiness: 45,
    supplies: 3,
    basePower: 70,
    preparationMultiplier: 1.02,
    playerShapeId: 'deep_234',
    wagonStageId: 'fort',
    engineering: 1,
    permanentIntel: false,
    hasRations: false,
    hasMedicine: false,
    rewardMultiplier: 1
  });
  const broken = resolveSiegeChoice({
    run: weak,
    choiceId: 'approach_shielded'
  });
  check(
    broken.ok &&
      !broken.success &&
      broken.state.failed,
    'Clearly underprepared Siege assault did not fail.'
  );
}

function runRewardCoverage() {
  check(
    getSiegeRewardMultiplier({
      currentChapter: 3,
      rewardChapter: 2,
      rewardedRunsThisChapter: 9
    }) === 1,
    'First Siege in a new chapter must pay full rewards.'
  );
  check(
    getSiegeRewardMultiplier({
      currentChapter: 3,
      rewardChapter: 3,
      rewardedRunsThisChapter: 1
    }) === 0.5,
    'Second Siege in a chapter must pay half rewards.'
  );
  check(
    getSiegeRewardMultiplier({
      currentChapter: 3,
      rewardChapter: 3,
      rewardedRunsThisChapter: 2
    }) === 0,
    'Further Sieges in a chapter must be practice-only.'
  );

  const full = getSiegeReward(1);
  const half = getSiegeReward(0.5);
  const practice = getSiegeReward(0);

  check(
    full.gold === 82 &&
      half.gold === 41 &&
      practice.gold === 0,
    'Siege reward scaling drifted.'
  );
}

function runSaveResumeCoverage() {
  const record = createNewSaveRecord(1);
  const human =
    record.snapshot.factionStates.human;
  check(human, 'Human save fixture missing.');

  const run = createSiegeRun({
    readiness: 83,
    supplies: 5,
    basePower: 230,
    preparationMultiplier: 1.11,
    playerShapeId: 'assault_432',
    wagonStageId: 'town',
    engineering: 2,
    permanentIntel: true,
    hasRations: true,
    hasMedicine: false,
    rewardMultiplier: 0.5
  });
  const first = resolveSiegeChoice({
    run,
    choiceId: 'approach_flank'
  });
  check(first.ok, 'Siege save fixture failed.');

  human.activeSiegeRun = first.state;
  human.siegeRunsCompleted = 4;
  human.siegeRewardChapter = 4;
  human.siegeRewardedRunsThisChapter = 1;

  const normalized =
    normalizeSaveRecord(1, record);
  const restored =
    normalized?.snapshot.factionStates.human;

  check(
    restored?.activeSiegeRun?.stageIndex === 1 &&
      restored.activeSiegeRun.path[0] ===
        'approach_flank',
    'Active Siege did not survive save normalization.'
  );
  check(
    restored?.activeSiegeRun?.preparationMultiplier ===
      1.11,
    'Frozen Siege preparation multiplier was not preserved.'
  );
  check(
    typeof restored?.activeSiegeRun?.defenderAlert === 'number',
    'Siege defender alert was not preserved/sanitized across save normalization.'
  );
  check(
    restored?.siegeRunsCompleted === 4 &&
      restored.siegeRewardedRunsThisChapter === 1,
    'Siege lifetime/chapter counters were not preserved.'
  );
}

runStructureCoverage();
runPreparationCoverage();
runScalingCoverage();
runFallbackBreachCoverage();
runEngineeringGateCoverage();
runAlertCoverage();
runSuccessAndFailureCoverage();
runRewardCoverage();
runSaveResumeCoverage();


const siegeScreenSource = readFileSync('src/screens/SiegeScreen.tsx', 'utf8');
const gameArtSource = readFileSync('src/ui/gameArt.tsx', 'utf8');
check(siegeScreenSource.includes('<SiegeAssaultScene'), 'Offensive Siege must render the scene-level fortress assault.');
check(gameArtSource.includes('export function SiegeAssaultScene'), 'Siege fortress scene component must remain available.');
check(gameArtSource.includes("testID={'siege-assault-scene-' + faction}"), 'Siege scene must remain faction-aware and testable.');

console.log(
  'PASS: Offensive Sieges preserve staged assault rules, preparation gates, attrition, reward fatigue and save/resume state.'
);
