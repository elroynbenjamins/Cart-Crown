import {
  createExpeditionRun,
  expeditionStages,
  getExpeditionBaseReward,
  getExpeditionChoices,
  getExpeditionCompletionReward,
  getExpeditionEffectivePower,
  getExpeditionPreparation,
  getExpeditionThreat,
  resolveExpeditionChoice
} from '../src/game/expeditions';
import {
  createNewSaveRecord,
  normalizeSaveRecord
} from '../src/save/schema';
import type {
  SettlementAdjacencyEffects
} from '../src/game/types';

function check(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) throw new Error(message);
}

const neutralEffects: SettlementAdjacencyEffects = {
  equipmentCostMultiplier: 1,
  mountCostMultiplier: 1,
  expeditionWoodBonus: 0,
  expeditionProvisionBonus: 0,
  dailyProvisionBonus: 0,
  commanderSkillPowerMultiplier: 1,
  commanderRespecDiscount: 0,
  commanderSkillEarlyTrigger: false,
  detailedIntel: false
};

function runRouteCoverage() {
  check(
    expeditionStages.length === 5,
    'Expedition route must remain five stages.'
  );
  check(
    getExpeditionChoices('human', 0).length === 2,
    'Approach must offer two branches.'
  );
  check(
    getExpeditionChoices('human', 1).length === 2,
    'Crossroads event must offer two branches.'
  );
  check(
    getExpeditionChoices('human', 2).length === 2,
    'Supply stage must offer two branches.'
  );
  check(
    getExpeditionChoices('human', 3).length === 2,
    'Elite stage must offer two branches.'
  );
  check(
    getExpeditionChoices('human', 4).length === 1,
    'Boss stage must have one authored final encounter.'
  );
}

function runPreparationCoverage() {
  const basic = getExpeditionPreparation({
    buildingLevels: {
      logistics: 1,
      supply: 0
    },
    buildingIds: {
      logistics: 'logistics',
      supply: 'supply'
    },
    wagonItems: []
  });

  const prepared = getExpeditionPreparation({
    buildingLevels: {
      logistics: 2,
      supply: 2
    },
    buildingIds: {
      logistics: 'logistics',
      supply: 'supply'
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
    prepared.initialSupplies > basic.initialSupplies,
    'Wagon/logistics preparation no longer expands Expedition supplies.'
  );
  check(
    prepared.hasRations &&
      prepared.hasMedicine &&
      prepared.hasRepairKit,
    'Expedition preparation does not detect packed utility items.'
  );
}

function runThreatAndFormationCoverage() {
  const risky = getExpeditionChoices('human', 0)
    .find(choice => choice.id === 'approach_shortcut');
  check(risky, 'Risky approach fixture missing.');

  const fortThreat = getExpeditionThreat(
    risky,
    'fort'
  );
  const strongholdThreat = getExpeditionThreat(
    risky,
    'stronghold'
  );
  check(
    fortThreat !== null &&
      strongholdThreat !== null &&
      strongholdThreat > fortThreat,
    'Expedition threat does not scale with kingdom tier.'
  );

  check(
    risky.formationShapeId,
    'Risky approach is missing enemy formation.'
  );

  const advantage = getExpeditionEffectivePower({
    basePower: 120,
    playerShapeId: 'assault_432',
    enemyShapeId: risky.formationShapeId,
    readiness: 100,
    powerBonus: 0
  });
  const exposed = getExpeditionEffectivePower({
    basePower: 120,
    playerShapeId: 'deep_234',
    enemyShapeId: risky.formationShapeId,
    readiness: 100,
    powerBonus: 0
  });

  check(
    advantage.matchup.result === 'advantage',
    'Expedition combat ignores known formation counters.'
  );
  check(
    exposed.matchup.result === 'disadvantage',
    'Expedition combat does not recognize an exposed formation.'
  );
  check(
    advantage.value > exposed.value,
    'Formation matchup no longer changes Expedition effective power.'
  );
}

function runFullSuccessCoverage() {
  const baseReward = getExpeditionBaseReward({
    logisticsLevel: 2,
    settlementEffects: {
      ...neutralEffects,
      expeditionWoodBonus: 3,
      expeditionProvisionBonus: 2
    }
  });

  let run = createExpeditionRun({
    readiness: 100,
    supplies: 6,
    basePower: 250,
    playerShapeId: 'assault_432',
    wagonStageId: 'fort',
    hasRations: true,
    hasMedicine: true,
    baseReward
  });

  check(
    run.basePower === 250 &&
      run.playerShapeId === 'assault_432' &&
      run.wagonStageId === 'fort',
    'Expedition did not freeze departure combat state.'
  );

  for (const choiceId of [
    'approach_patrol',
    'event_salvage',
    'supply_cache',
    'elite_bowline',
    'boss_routebreaker'
  ]) {
    const result = resolveExpeditionChoice({
      faction: 'human',
      run,
      choiceId
    });
    check(
      result.ok && result.success,
      'Expected successful route failed at ' + choiceId + ': ' + result.summary
    );
    run = result.state;
  }

  check(
    run.completed && !run.failed,
    'Boss victory did not complete the Expedition.'
  );
  check(
    run.path.length === 5,
    'Completed Expedition did not retain all route choices.'
  );
  check(
    run.powerBonus >= 0.09,
    'Temporary route power bonuses did not accumulate.'
  );
  check(
    run.loot.gold > 0 &&
      run.loot.iron > 0,
    'Risk/reward route did not accumulate unsecured loot.'
  );

  const finalReward =
    getExpeditionCompletionReward(run);
  check(
    finalReward.gold > baseReward.gold &&
      finalReward.iron > baseReward.iron,
    'Boss clear does not bank route loot on top of the base reward.'
  );
}

function runSupplyGateCoverage() {
  const run = createExpeditionRun({
    readiness: 90,
    supplies: 0,
    basePower: 200,
    playerShapeId: 'balanced_333',
    wagonStageId: 'fort',
    hasRations: false,
    hasMedicine: false,
    baseReward: getExpeditionBaseReward({
      logisticsLevel: 1,
      settlementEffects: neutralEffects
    })
  });

  const afterApproach =
    resolveExpeditionChoice({
      faction: 'human',
      run,
      choiceId: 'approach_patrol'
    });
  check(
    afterApproach.ok &&
      afterApproach.success,
    'Safe approach fixture unexpectedly failed.'
  );

  const blocked = resolveExpeditionChoice({
    faction: 'human',
    run: afterApproach.state,
    choiceId: 'event_salvage'
  });
  check(
    !blocked.ok,
    'Supply-gated event can be selected with zero field supplies.'
  );

  const fallback = resolveExpeditionChoice({
    faction: 'human',
    run: afterApproach.state,
    choiceId: 'event_travelers'
  });
  check(
    fallback.ok &&
      fallback.success &&
      fallback.state.supplies > 0,
    'Zero-supply runs no longer have a valid recovery branch.'
  );
}

function runFailureCoverage() {
  const run = createExpeditionRun({
    readiness: 100,
    supplies: 3,
    basePower: 45,
    playerShapeId: 'deep_234',
    wagonStageId: 'fort',
    hasRations: false,
    hasMedicine: false,
    baseReward: getExpeditionBaseReward({
      logisticsLevel: 1,
      settlementEffects: neutralEffects
    })
  });

  const result = resolveExpeditionChoice({
    faction: 'human',
    run,
    choiceId: 'approach_shortcut'
  });

  check(
    result.ok &&
      !result.success &&
      result.state.failed,
    'Underpowered Expedition battle did not fail the run.'
  );
  check(
    result.state.readiness <= 92,
    'Failed Expedition battle no longer causes meaningful Readiness wear.'
  );
  check(
    !result.state.completed,
    'Failed Expedition incorrectly counts as complete.'
  );
}

function runSaveResumeCoverage() {
  const record = createNewSaveRecord(1);
  const human =
    record.snapshot.factionStates.human;
  check(human, 'Human save fixture missing.');

  const run = createExpeditionRun({
    readiness: 82,
    supplies: 4,
    basePower: 155,
    playerShapeId: 'assault_432',
    wagonStageId: 'fort',
    hasRations: true,
    hasMedicine: false,
    baseReward: getExpeditionBaseReward({
      logisticsLevel: 2,
      settlementEffects: neutralEffects
    })
  });
  const first = resolveExpeditionChoice({
    faction: 'human',
    run,
    choiceId: 'approach_patrol'
  });
  check(first.ok, 'Save fixture route did not resolve.');

  human.activeExpeditionRun = first.state;

  const normalized =
    normalizeSaveRecord(1, record);
  const resumed =
    normalized?.snapshot.factionStates.human
      ?.activeExpeditionRun;

  check(
    resumed?.stageIndex === 1,
    'Active Expedition stage was not preserved across save normalization.'
  );
  check(
    resumed?.path[0] === 'approach_patrol',
    'Active Expedition route path was not preserved.'
  );
  check(
    resumed?.basePower === 155 &&
      resumed.playerShapeId === 'assault_432',
    'Frozen Expedition loadout was not preserved across save/reload.'
  );
}

runRouteCoverage();
runPreparationCoverage();
runThreatAndFormationCoverage();
runFullSuccessCoverage();
runSupplyGateCoverage();
runFailureCoverage();
runSaveResumeCoverage();

console.log(
  'PASS: Expeditions branch, scale, preserve loadouts, persist runs, apply attrition, gate supplies and secure loot only after the boss.'
);
