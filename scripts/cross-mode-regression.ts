import {
  MAX_EXPEDITION_TICKETS,
  getExpeditionRewardMultiplier,
  getExpeditionTicketsAfterChapterTransition,
  getKingdomDefenseRewardMultiplier,
  getSiegeRewardMultiplier,
  getWarTableBoardRewardMultiplier,
  scaleResourceReward
} from '../src/game/sideModeBalance';
import {
  getKingdomTrialRequiredChapter,
  isKingdomTrialUnlocked,
  kingdomTrialRewards
} from '../src/game/kingdomTrials';
import {
  getWarTablePostedContracts
} from '../src/game/warTable';
import {
  encounterRewards
} from '../src/game/encounters';
import {
  createExpeditionRun,
  getExpeditionBaseReward,
  getExpeditionCompletionReward,
  resolveExpeditionChoice
} from '../src/game/expeditions';
import {
  getSiegeReward
} from '../src/game/sieges';
import type {
  ResourceWallet,
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

function gold(
  reward: Partial<ResourceWallet>
) {
  return reward.gold ?? 0;
}

function runRewardBands() {
  check(
    getWarTableBoardRewardMultiplier(0) === 1 &&
      getWarTableBoardRewardMultiplier(1) === 0.5 &&
      getWarTableBoardRewardMultiplier(2) === 0 &&
      getWarTableBoardRewardMultiplier(99) === 0,
    'War Table must taper full -> half -> practice within a chapter.'
  );

  check(
    getKingdomDefenseRewardMultiplier({
      firstClear: true,
      currentChapter: 2,
      rewardChapter: 1,
      rewardedRunsThisChapter: 0
    }) === 1,
    'First Kingdom Defense clear must keep its authored full reward.'
  );
  check(
    getKingdomDefenseRewardMultiplier({
      firstClear: false,
      currentChapter: 3,
      rewardChapter: 2,
      rewardedRunsThisChapter: 9
    }) === 0.5,
    'First repeat Kingdom Defense in a new chapter must pay half.'
  );
  check(
    getKingdomDefenseRewardMultiplier({
      firstClear: false,
      currentChapter: 3,
      rewardChapter: 3,
      rewardedRunsThisChapter: 1
    }) === 0,
    'Additional Kingdom Defense repeats must become practice-only.'
  );

  check(
    getSiegeRewardMultiplier({
      currentChapter: 3,
      rewardChapter: 2,
      rewardedRunsThisChapter: 9
    }) === 1 &&
      getSiegeRewardMultiplier({
        currentChapter: 3,
        rewardChapter: 3,
        rewardedRunsThisChapter: 1
      }) === 0.5 &&
      getSiegeRewardMultiplier({
        currentChapter: 3,
        rewardChapter: 3,
        rewardedRunsThisChapter: 2
      }) === 0,
    'Sieges must taper full -> half -> practice each chapter.'
  );

  check(
    getExpeditionRewardMultiplier({
      currentChapter: 3,
      rewardChapter: 2,
      rewardedRunsThisChapter: 9
    }) === 1 &&
      getExpeditionRewardMultiplier({
        currentChapter: 3,
        rewardChapter: 3,
        rewardedRunsThisChapter: 1
      }) === 0.5 &&
      getExpeditionRewardMultiplier({
        currentChapter: 3,
        rewardChapter: 3,
        rewardedRunsThisChapter: 2
      }) === 0,
    'Expeditions must taper full -> half -> free practice each chapter.'
  );

  check(
    MAX_EXPEDITION_TICKETS === 3,
    'Expedition ticket storage cap drifted.'
  );
  check(
    getExpeditionTicketsAfterChapterTransition(0, 3) === 1 &&
      getExpeditionTicketsAfterChapterTransition(2, 4) === 3 &&
      getExpeditionTicketsAfterChapterTransition(3, 5) === 3 &&
      getExpeditionTicketsAfterChapterTransition(1, 2) === 1,
    'Chapter transitions no longer provide one earned Expedition ticket from Chapter 3 onward or violate the storage cap.'
  );

  const half = scaleResourceReward(
    { gold: 5, iron: 3 },
    0.5
  );
  check(
    half.gold === 3 &&
      half.iron === 2,
    'Half rewards must round small positive resources instead of erasing them.'
  );
  check(
    Object.keys(
      scaleResourceReward(
        { gold: 99, iron: 10 },
        0
      )
    ).length === 0,
    'Practice rewards must not leak resources.'
  );
}

function runTrialPacing() {
  check(
    getKingdomTrialRequiredChapter('bronze') === 2 &&
      getKingdomTrialRequiredChapter('silver') === 3 &&
      getKingdomTrialRequiredChapter('gold') === 4,
    'Kingdom Trial medals must stay spread across Chapters 2, 3 and 4.'
  );

  check(
    isKingdomTrialUnlocked(
      'bronze',
      [],
      2
    ) &&
      !isKingdomTrialUnlocked(
        'silver',
        ['bronze'],
        2
      ) &&
      isKingdomTrialUnlocked(
        'silver',
        ['bronze'],
        3
      ) &&
      !isKingdomTrialUnlocked(
        'gold',
        ['bronze', 'silver'],
        3
      ) &&
      isKingdomTrialUnlocked(
        'gold',
        ['bronze', 'silver'],
        4
      ),
    'Trial chapter gates no longer prevent reward stacking in one chapter.'
  );
}

function maxWarTableGold(
  chapter: number
) {
  const fullBoard =
    getWarTablePostedContracts({
      cycle: 0,
      boardChapter: chapter
    });
  const halfBoard =
    getWarTablePostedContracts({
      cycle: 1,
      boardChapter: chapter
    });

  const boardGold = (
    contracts: typeof fullBoard,
    multiplier: 0.5 | 1
  ) =>
    contracts.reduce(
      (sum, contract) => {
        const base =
          encounterRewards[
            contract.encounterId
          ].resources;
        const combined = {
          gold:
            gold(base) +
            gold(contract.bonusReward)
        };
        return (
          sum +
          gold(
            scaleResourceReward(
              combined,
              multiplier
            )
          )
        );
      },
      0
    );

  return (
    boardGold(fullBoard, 1) +
    boardGold(halfBoard, 0.5)
  );
}

function expeditionGold(
  multiplier: 0 | 0.5 | 1
) {
  let run = createExpeditionRun({
    readiness: 100,
    supplies: 8,
    basePower: 999,
    playerShapeId: 'assault_432',
    wagonStageId: 'fort',
    hasRations: true,
    hasMedicine: true,
    baseReward: getExpeditionBaseReward({
      logisticsLevel: 2,
      settlementEffects: neutralEffects
    }),
    rewardMultiplier: multiplier
  });

  for (const choiceId of [
    'approach_shortcut',
    'event_salvage',
    'supply_cache',
    'elite_bowline',
    'boss_routebreaker'
  ]) {
    const result =
      resolveExpeditionChoice({
        faction: 'human',
        run,
        choiceId
      });
    check(
      result.ok && result.success,
      'Cross-mode Expedition fixture failed at ' +
        choiceId
    );
    run = result.state;
  }

  return gold(
    getExpeditionCompletionReward(run)
  );
}

function runEconomyEnvelope() {
  const ch2Gold =
    maxWarTableGold(2) +
    30 +
    gold(kingdomTrialRewards.bronze);

  const ch3Gold =
    maxWarTableGold(3) +
    30 +
    gold(kingdomTrialRewards.silver) +
    expeditionGold(1) +
    expeditionGold(0.5) +
    gold(getSiegeReward(1)) +
    gold(getSiegeReward(0.5));

  const ch4Gold =
    maxWarTableGold(4) +
    30 +
    gold(kingdomTrialRewards.gold) +
    expeditionGold(1) +
    expeditionGold(0.5) +
    gold(getSiegeReward(1)) +
    gold(getSiegeReward(0.5));

  check(
    ch2Gold <= 300,
    'Chapter 2 optional-mode Gold envelope is too high: ' +
      ch2Gold
  );
  check(
    ch3Gold <= 650,
    'Chapter 3 optional-mode Gold envelope is too high: ' +
      ch3Gold
  );
  check(
    ch4Gold <= 675,
    'Chapter 4 optional-mode Gold envelope is too high: ' +
      ch4Gold
  );

  console.log(
    'Optional Gold envelopes · Ch2 ' +
      ch2Gold +
      ' · Ch3 ' +
      ch3Gold +
      ' · Ch4 ' +
      ch4Gold
  );
}

runRewardBands();
runTrialPacing();
runEconomyEnvelope();

console.log(
  'PASS: cross-mode reward fatigue, Siege/Expedition pacing, Trial chapter gates, ticket caps and bounded optional-resource envelopes remain intact.'
);
