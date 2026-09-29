import {
  buildArmy,
  buildFormation,
  defaultCommander,
  defaultModifierForFaction,
  normalArmy,
  shapeFor,
  simulate,
  strongArmy
} from './balance-regression';
import {
  analyzeFormation
} from '../src/game/formation';
import {
  getKingdomDefenseEffectivePower,
  getKingdomDefenseReadinessLoss,
  getKingdomDefenseThreat,
  getKingdomDefenseWaves
} from '../src/game/kingdomDefense';
import {
  createExpeditionRun,
  getExpeditionBaseReward,
  resolveExpeditionChoice
} from '../src/game/expeditions';
import {
  getWarTablePostedContracts
} from '../src/game/warTable';
import type {
  CommanderPathDefinition,
  FactionId,
  FormationShapeId,
  SettlementAdjacencyEffects,
  UnitDefinition
} from '../src/game/types';

type Profile = 'under' | 'normal' | 'optimized';

const failures: string[] = [];

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

const squadCaps: Record<FactionId, number[]> = {
  human: [3, 4, 5, 6, 6, 6],
  elf: [2, 3, 4, 5, 6, 6],
  orc: [2, 3, 4, 5, 6, 6]
};

function expect(
  condition: unknown,
  message: string
) {
  if (!condition) failures.push(message);
}

function hpRatio(result: {
  remainingHp: number;
  maxHp: number;
}) {
  return result.maxHp > 0
    ? result.remainingHp / result.maxHp
    : 0;
}

function stageFor(
  faction: FactionId,
  chapter: number
) {
  if (faction === 'human') {
    return chapter <= 1
      ? 'settlement'
      : chapter === 2
        ? 'fort'
        : chapter === 3
          ? 'town'
          : chapter === 4
            ? 'stronghold'
            : chapter === 5
              ? 'capital'
              : 'grand';
  }

  return chapter <= 1
    ? 'camp'
    : chapter === 2
      ? 'settlement'
      : chapter === 3
        ? 'fort'
        : chapter === 4
          ? 'town'
          : chapter === 5
            ? 'stronghold'
            : 'capital';
}

function armyFor(
  faction: FactionId,
  chapter: number,
  profile: Profile
) {
  const cap =
    squadCaps[faction][chapter - 1] ?? 6;

  if (profile === 'optimized') {
    return strongArmy(faction, chapter);
  }

  if (profile === 'normal') {
    return normalArmy(faction, chapter);
  }

  const missing =
    chapter >= 4 ? 2 : 1;
  return buildArmy(faction, chapter).slice(
    0,
    Math.max(1, cap - missing)
  );
}

function readinessFor(profile: Profile) {
  return profile === 'under' ? 45 : 100;
}

function commanderFor(
  faction: FactionId,
  profile: Profile
) {
  return profile === 'under'
    ? null
    : defaultCommander(faction);
}

function sideModeBasePower({
  faction,
  chapter,
  units,
  shapeId,
  commander
}: {
  faction: FactionId;
  chapter: number;
  units: UnitDefinition[];
  shapeId: FormationShapeId;
  commander: CommanderPathDefinition | null;
}) {
  const formation =
    buildFormation(
      units,
      faction,
      shapeId
    );
  const doctrineId =
    faction === 'human'
      ? 'human_balanced'
      : faction === 'elf'
        ? 'elf_open'
        : 'orc_warband';
  const analysis =
    analyzeFormation(
      formation,
      units,
      faction,
      doctrineId,
      shapeId
    );

  const raw = units.reduce(
    (total, unit) =>
      total +
      unit.attack +
      unit.armor * 1.5 +
      unit.speed * 0.45,
    0
  );

  const command =
    commander
      ? 1 +
        (commander.attackMultiplier - 1) * 0.45 +
        (commander.armorMultiplier - 1) * 0.55
      : 1;

  return Math.round(
    raw *
      analysis.attackMultiplier *
      analysis.armorMultiplier *
      command
  );
}

function runWarTableMatrix() {
  console.log('\nWar Table side-mode matrix');
  console.log(
    'Faction Ch Profile    W/L  AvgTurns AvgHP% Contracts'
  );

  for (const faction of [
    'human',
    'elf',
    'orc'
  ] as const) {
    for (const chapter of [1, 2, 3, 6]) {
      const boardChapter =
        Math.min(chapter, 3);
      const contracts =
        getWarTablePostedContracts({
          cycle: 0,
          boardChapter
        });

      for (const profile of [
        'under',
        'normal',
        'optimized'
      ] as const) {
        const units =
          armyFor(
            faction,
            chapter,
            profile
          );
        const shapeId =
          shapeFor(
            faction,
            chapter
          );
        const commander =
          commanderFor(
            faction,
            profile
          );
        const readiness =
          readinessFor(profile);
        const results =
          contracts.map(contract =>
            simulate({
              faction,
              units,
              doctrineId:
                faction === 'human'
                  ? 'human_balanced'
                  : faction === 'elf'
                    ? 'elf_open'
                    : 'orc_warband',
              shapeId,
              commander,
              encounterId:
                contract.encounterId,
              squadCap:
                squadCaps[faction][chapter - 1] ??
                6,
              readiness,
              encounterChapter: chapter,
              modifier:
                defaultModifierForFaction(
                  faction,
                  chapter
                )
            })
          );
        const wins =
          results.filter(
            result => result.victory
          ).length;
        const avgTurns =
          results.reduce(
            (sum, result) =>
              sum + result.turns,
            0
          ) / results.length;
        const avgHp =
          results.reduce(
            (sum, result) =>
              sum + hpRatio(result),
            0
          ) / results.length;

        console.log(
          faction.padEnd(6) +
            ' ' +
            String(chapter).padStart(2) +
            ' ' +
            profile.padEnd(10) +
            ' ' +
            wins +
            '/' +
            results.length +
            '  ' +
            avgTurns.toFixed(1).padStart(8) +
            ' ' +
            String(
              Math.round(avgHp * 100)
            ).padStart(6) +
            '% ' +
            contracts
              .map(contract => contract.tier[0])
              .join('')
        );

        if (profile === 'normal') {
          expect(
            wins >= 2,
            faction +
              ' Chapter ' +
              chapter +
              ' normal army clears fewer than 2/3 posted War Table contracts.'
          );
        }

        if (
          profile === 'under' &&
          chapter >= 2
        ) {
          expect(
            wins < results.length,
            faction +
              ' Chapter ' +
              chapter +
              ' underprepared army sweeps the whole War Table board.'
          );
        }

        if (
          profile === 'optimized' &&
          chapter >= 3
        ) {
          expect(
            avgTurns >= 2.2,
            faction +
              ' Chapter ' +
              chapter +
              ' optimized army trivializes War Table in ' +
              avgTurns.toFixed(1) +
              ' average exchanges.'
          );
        }
      }
    }
  }
}

function runDefenseMatrix() {
  console.log('\nKingdom Defense side-mode matrix');
  console.log(
    'Faction Ch Profile    Cleared EndReadiness'
  );

  for (const faction of [
    'human',
    'elf',
    'orc'
  ] as const) {
    for (const chapter of [3, 4, 5, 6]) {
      for (const profile of [
        'under',
        'normal',
        'optimized'
      ] as const) {
        const units =
          armyFor(
            faction,
            chapter,
            profile
          );
        const shapeId =
          shapeFor(
            faction,
            chapter
          );
        const commander =
          commanderFor(
            faction,
            profile
          );
        const basePower =
          sideModeBasePower({
            faction,
            chapter,
            units,
            shapeId,
            commander
          });
        const waves =
          getKingdomDefenseWaves(
            faction,
            true
          );
        let readiness =
          readinessFor(profile);
        let cleared = 0;

        for (const wave of waves) {
          const threat =
            getKingdomDefenseThreat(
              wave,
              stageFor(faction, chapter),
              true
            );
          const effective =
            getKingdomDefenseEffectivePower({
              basePower,
              playerShapeId: shapeId,
              waveShapeId:
                wave.formationShapeId,
              readiness,
              fortificationMultiplier:
                profile === 'under'
                  ? 1.03
                  : profile === 'normal'
                    ? 1.1
                    : 1.18,
              nextWavePowerBonus:
                profile === 'optimized'
                  ? 0.08
                  : 0
            });

          if (
            effective.value <
            threat
          ) {
            break;
          }

          readiness = Math.max(
            25,
            readiness -
              getKingdomDefenseReadinessLoss({
                wave,
                effectivePower:
                  effective.value,
                threat,
                hasRations:
                  profile !== 'under',
                hasMedicine:
                  profile === 'optimized'
              })
          );
          cleared += 1;
        }

        console.log(
          faction.padEnd(6) +
            ' ' +
            String(chapter).padStart(2) +
            ' ' +
            profile.padEnd(10) +
            ' ' +
            String(cleared).padStart(3) +
            '/5   ' +
            String(readiness).padStart(3) +
            '%'
        );

        if (profile === 'normal') {
          expect(
            cleared === 5,
            faction +
              ' Chapter ' +
              chapter +
              ' normal army cannot clear repeatable Kingdom Defense.'
          );
          expect(
            readiness <= 92,
            faction +
              ' Chapter ' +
              chapter +
              ' Kingdom Defense leaves a normal army almost untouched (' +
              readiness +
              '%).'
          );
        }

        if (profile === 'under') {
          expect(
            cleared < 5,
            faction +
              ' Chapter ' +
              chapter +
              ' underprepared army clears all five Kingdom Defense waves.'
          );
        }

        if (profile === 'optimized') {
          expect(
            cleared === 5,
            faction +
              ' Chapter ' +
              chapter +
              ' optimized army cannot clear Kingdom Defense.'
          );
          expect(
            readiness <= 96,
            faction +
              ' Chapter ' +
              chapter +
              ' optimized Kingdom Defense run is nearly wear-free (' +
              readiness +
              '%).'
          );
        }
      }
    }
  }
}

function expeditionRun({
  faction,
  chapter,
  profile,
  route
}: {
  faction: FactionId;
  chapter: number;
  profile: Profile;
  route: 'safe' | 'risky';
}) {
  const units =
    armyFor(
      faction,
      chapter,
      profile
    );
  const shapeId =
    shapeFor(
      faction,
      chapter
    );
  const commander =
    commanderFor(
      faction,
      profile
    );
  const basePower =
    sideModeBasePower({
      faction,
      chapter,
      units,
      shapeId,
      commander
    });

  let run = createExpeditionRun({
    readiness:
      readinessFor(profile),
    supplies:
      profile === 'under'
        ? 3
        : profile === 'normal'
          ? 5
          : 7,
    basePower,
    playerShapeId: shapeId,
    wagonStageId:
      stageFor(
        faction,
        chapter
      ),
    hasRations:
      profile !== 'under',
    hasMedicine:
      profile === 'optimized',
    baseReward:
      getExpeditionBaseReward({
        logisticsLevel:
          profile === 'under'
            ? 1
            : 2,
        settlementEffects:
          neutralEffects
      }),
    rewardMultiplier: 1
  });

  const choices =
    route === 'safe'
      ? [
          'approach_patrol',
          'event_travelers',
          'supply_spring',
          'elite_assault',
          'boss_routebreaker'
        ]
      : [
          'approach_shortcut',
          'event_salvage',
          'supply_cache',
          'elite_bowline',
          'boss_routebreaker'
        ];

  let combatNodes = 0;

  for (const choiceId of choices) {
    const result =
      resolveExpeditionChoice({
        faction,
        run,
        choiceId
      });

    if (!result.ok) {
      return {
        completed: false,
        failed: true,
        readiness: run.readiness,
        combatNodes
      };
    }

    run = result.state;
    if (result.combat) {
      combatNodes += 1;
    }
    if (
      run.failed ||
      run.completed
    ) {
      break;
    }
  }

  return {
    completed: run.completed,
    failed: run.failed,
    readiness: run.readiness,
    combatNodes
  };
}

function runExpeditionMatrix() {
  console.log('\nExpedition side-mode matrix');
  console.log(
    'Faction Ch Profile    Safe       Risky'
  );

  for (const faction of [
    'human',
    'elf',
    'orc'
  ] as const) {
    for (const chapter of [3, 4, 5, 6]) {
      for (const profile of [
        'under',
        'normal',
        'optimized'
      ] as const) {
        const safe =
          expeditionRun({
            faction,
            chapter,
            profile,
            route: 'safe'
          });
        const risky =
          expeditionRun({
            faction,
            chapter,
            profile,
            route: 'risky'
          });

        const flag = (
          value: typeof safe
        ) =>
          value.completed
            ? 'WIN ' +
              value.readiness +
              '%'
            : 'LOSS ' +
              value.readiness +
              '%';

        console.log(
          faction.padEnd(6) +
            ' ' +
            String(chapter).padStart(2) +
            ' ' +
            profile.padEnd(10) +
            ' ' +
            flag(safe).padEnd(10) +
            ' ' +
            flag(risky)
        );

        if (profile === 'normal') {
          expect(
            safe.completed,
            faction +
              ' Chapter ' +
              chapter +
              ' normal army cannot clear the safer Expedition route.'
          );
          expect(
            safe.readiness <= 92,
            faction +
              ' Chapter ' +
              chapter +
              ' safe Expedition leaves a normal army almost untouched (' +
              safe.readiness +
              '%).'
          );
        }

        if (profile === 'under') {
          expect(
            !risky.completed,
            faction +
              ' Chapter ' +
              chapter +
              ' underprepared army clears the risky Expedition route.'
          );
        }

        if (profile === 'optimized') {
          expect(
            risky.completed,
            faction +
              ' Chapter ' +
              chapter +
              ' optimized army cannot clear the risky Expedition route.'
          );
          expect(
            risky.readiness <= 96,
            faction +
              ' Chapter ' +
              chapter +
              ' risky Expedition is almost wear-free for optimized army (' +
              risky.readiness +
              '%).'
          );
        }
      }
    }
  }
}

runWarTableMatrix();
runDefenseMatrix();
runExpeditionMatrix();

if (failures.length > 0) {
  console.error(
    '\nSIDE-MODE DIFFICULTY FAILURES (' +
      failures.length +
      '):'
  );
  failures.forEach((failure, index) =>
    console.error(
      String(index + 1) +
        '. ' +
        failure
    )
  );
  throw new Error(
    failures.length +
      ' side-mode difficulty guardrail(s) failed.'
  );
}

console.log(
  '\nPASS: side modes distinguish underprepared, normal and optimized armies without becoming trivial or unfair across Chapters 1–6.'
);
