import {
  applyKingdomDefenseChoice,
  getKingdomDefenseEffectivePower,
  getKingdomDefenseFortification,
  getKingdomDefenseReadinessLoss,
  getKingdomDefenseThreat,
  getKingdomDefenseWaves
} from '../src/game/kingdomDefense';
import type { SettlementAdjacencyEffects } from '../src/game/types';

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

const buildingIds = {
  hall: 'hall',
  army: 'army',
  logistics: 'logistics',
  supply: 'supply',
  command: 'command',
  scout: 'scout'
};

function runWaveCoverage() {
  for (const faction of ['human', 'elf', 'orc'] as const) {
    const story =
      getKingdomDefenseWaves(
        faction,
        false
      );
    const repeatable =
      getKingdomDefenseWaves(
        faction,
        true
      );

    check(
      story.length === 3,
      faction +
        ' story defense must remain a three-wave introduction.'
    );
    check(
      repeatable.length === 5,
      faction +
        ' repeatable defense must contain five waves.'
    );
    check(
      Boolean(story.at(-1)?.final),
      faction +
        ' story defense lacks a final wave.'
    );
    check(
      Boolean(repeatable.at(-1)?.final),
      faction +
        ' endurance defense lacks a final wave.'
    );

    const layouts = repeatable.map(
      wave => wave.formationShapeId
    );
    check(
      layouts.join(',') ===
        [
          'skirmish_screen_243',
          'wide_vanguard_522',
          'protected_rear_225',
          'assault_432',
          'reinforced_center_252'
        ].join(','),
      faction +
        ' endurance wave formation identity changed.'
    );

    for (let index = 1; index < repeatable.length; index += 1) {
      check(
        repeatable[index]!.threat >
          repeatable[index - 1]!.threat,
        faction +
          ' endurance threat must escalate each wave.'
      );
    }
  }
}

function runStageScalingCoverage() {
  const wave =
    getKingdomDefenseWaves(
      'human',
      true
    )[4]!;
  const fort =
    getKingdomDefenseThreat(
      wave,
      'fort',
      true
    );
  const town =
    getKingdomDefenseThreat(
      wave,
      'town',
      true
    );
  const stronghold =
    getKingdomDefenseThreat(
      wave,
      'stronghold',
      true
    );

  check(
    fort < town && town < stronghold,
    'Repeatable defense no longer scales with kingdom stage.'
  );

  check(
    getKingdomDefenseThreat(
      wave,
      'grand',
      false
    ) === wave.threat,
    'Story defense should not scale beyond its authored Chapter 2 threat.'
  );
}

function runFortificationCoverage() {
  const bare =
    getKingdomDefenseFortification({
      buildingLevels: {
        hall: 3,
        army: 1,
        logistics: 1,
        supply: 0,
        command: 0,
        scout: 0
      },
      buildingIds,
      wagonItems: [],
      settlementEffects: neutralEffects
    });

  const prepared =
    getKingdomDefenseFortification({
      buildingLevels: {
        hall: 4,
        army: 3,
        logistics: 2,
        supply: 2,
        command: 2,
        scout: 2
      },
      buildingIds,
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
      ],
      settlementEffects: neutralEffects
    });

  check(
    prepared.powerMultiplier >
      bare.powerMultiplier,
    'Building levels no longer strengthen Kingdom Defense.'
  );
  check(
    prepared.supplyReserve >
      bare.supplyReserve,
    'Wagon/stores no longer expand the defense reserve.'
  );
  check(
    prepared.permanentIntel,
    'Scout building no longer grants permanent defense intel.'
  );
  check(
    prepared.hasRations &&
      prepared.hasMedicine &&
      prepared.hasRepairKit,
    'Packed defense supplies are not detected.'
  );
}

function runFormationCoverage() {
  const wave =
    getKingdomDefenseWaves(
      'human',
      true
    ).find(
      candidate =>
        candidate.formationShapeId ===
        'wide_vanguard_522'
    );
  check(wave, 'Wide Vanguard wave fixture missing.');

  const advantage =
    getKingdomDefenseEffectivePower({
      basePower: 120,
      playerShapeId: 'assault_432',
      waveShapeId: wave.formationShapeId,
      readiness: 100,
      fortificationMultiplier: 1,
      nextWavePowerBonus: 0
    });

  const disadvantage =
    getKingdomDefenseEffectivePower({
      basePower: 120,
      playerShapeId: 'deep_234',
      waveShapeId: wave.formationShapeId,
      readiness: 100,
      fortificationMultiplier: 1,
      nextWavePowerBonus: 0
    });

  check(
    advantage.matchup.result === 'advantage',
    'Known formation counter is not recognized in defense.'
  );
  check(
    disadvantage.matchup.result === 'disadvantage',
    'Known exposed formation is not recognized in defense.'
  );
  check(
    advantage.value >
      disadvantage.value,
    'Formation counter no longer changes effective defense power.'
  );

  const tired =
    getKingdomDefenseEffectivePower({
      basePower: 120,
      playerShapeId: 'assault_432',
      waveShapeId: wave.formationShapeId,
      readiness: 45,
      fortificationMultiplier: 1,
      nextWavePowerBonus: 0
    });

  check(
    tired.value < advantage.value,
    'Low Readiness no longer matters in endurance defense.'
  );
}

function runChoiceCoverage() {
  const fortification =
    getKingdomDefenseFortification({
      buildingLevels: {
        hall: 3,
        army: 2,
        logistics: 2,
        supply: 1,
        command: 1,
        scout: 0
      },
      buildingIds,
      wagonItems: [
        {
          id: 'medicine',
          name: 'Medicine',
          shortName: 'Medicine',
          faction: 'global',
          width: 1,
          height: 1,
          rotation: 0,
          effect: '',
          x: 0,
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
          x: 1,
          y: 0
        }
      ],
      settlementEffects: neutralEffects
    });

  const rest =
    applyKingdomDefenseChoice({
      choice: 'rest',
      reserve: 5,
      readiness: 60,
      fortification
    });
  check(rest, 'Rest choice unexpectedly unavailable.');
  check(
    rest.reserve === 3 &&
      rest.readiness > 60,
    'Rest choice does not trade supplies for Readiness.'
  );

  const reinforce =
    applyKingdomDefenseChoice({
      choice: 'reinforce',
      reserve: 5,
      readiness: 80,
      fortification
    });
  check(reinforce, 'Reinforce choice unexpectedly unavailable.');
  check(
    reinforce.reserve === 4 &&
      reinforce.nextWavePowerBonus >= 0.12,
    'Repair Kit no longer improves Reinforce Works.'
  );

  const scout =
    applyKingdomDefenseChoice({
      choice: 'scout',
      reserve: 5,
      readiness: 80,
      fortification
    });
  check(scout, 'Scout choice unexpectedly unavailable.');
  check(
    scout.reserve === 4 &&
      scout.revealNextWave,
    'Scout choice no longer spends supply to reveal the next wave.'
  );

  const hold =
    applyKingdomDefenseChoice({
      choice: 'hold',
      reserve: 1,
      readiness: 80,
      fortification
    });
  check(hold, 'Hold choice unexpectedly unavailable.');
  check(
    hold.reserve === 1 &&
      hold.nextWavePowerBonus === 0,
    'Hold Position should conserve the field reserve.'
  );

  const impossible =
    applyKingdomDefenseChoice({
      choice: 'rest',
      reserve: 1,
      readiness: 60,
      fortification
    });
  check(
    impossible === null,
    'Rest can be used without enough supplies.'
  );
}

function runWearCoverage() {
  const wave =
    getKingdomDefenseWaves(
      'human',
      true
    )[3]!;

  const cleanWin =
    getKingdomDefenseReadinessLoss({
      wave,
      effectivePower: 190,
      threat: 140,
      hasRations: true,
      hasMedicine: true
    });
  const narrowWin =
    getKingdomDefenseReadinessLoss({
      wave,
      effectivePower: 142,
      threat: 140,
      hasRations: false,
      hasMedicine: false
    });
  const loss =
    getKingdomDefenseReadinessLoss({
      wave,
      effectivePower: 110,
      threat: 140,
      hasRations: false,
      hasMedicine: false
    });

  check(
    cleanWin < narrowWin,
    'Winning with a stronger defense should reduce wear.'
  );
  check(
    loss >= 8,
    'A broken defense no longer causes meaningful Readiness loss.'
  );
}

runWaveCoverage();
runStageScalingCoverage();
runFortificationCoverage();
runFormationCoverage();
runChoiceCoverage();
runWearCoverage();

console.log(
  'PASS: Kingdom Defense waves, formations, fortifications, supplies, Readiness and between-wave choices remain inside the intended endurance rules.'
);
