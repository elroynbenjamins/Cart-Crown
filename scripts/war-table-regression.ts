import {
  evaluateWarTableBonus,
  getWarTablePostedContracts,
  isWarTableBoardCleared,
  warTableContracts
} from '../src/game/warTable';
import {
  encounterRewards,
  getEncounter,
  getEnemyFormationTactic
} from '../src/game/encounters';
import {
  createNewSaveRecord,
  normalizeSaveRecord
} from '../src/save/schema';

function check(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function runTierCoverage() {
  const chapterOne =
    getWarTablePostedContracts({
      cycle: 0,
      boardChapter: 1
    });
  const chapterTwo =
    getWarTablePostedContracts({
      cycle: 0,
      boardChapter: 2
    });
  const chapterThree =
    getWarTablePostedContracts({
      cycle: 0,
      boardChapter: 3
    });

  check(
    chapterOne.length === 3 &&
      chapterOne.every(
        contract =>
          contract.tier === 'standard'
      ),
    'Chapter 1 board must contain exactly three Standard contracts.'
  );

  check(
    chapterTwo.length === 3 &&
      chapterTwo.filter(
        contract =>
          contract.tier === 'standard'
      ).length === 2 &&
      chapterTwo.filter(
        contract =>
          contract.tier === 'veteran'
      ).length === 1,
    'Chapter 2 board must introduce one Veteran slot.'
  );

  check(
    chapterThree.length === 3 &&
      chapterThree.some(
        contract =>
          contract.tier === 'standard'
      ) &&
      chapterThree.some(
        contract =>
          contract.tier === 'veteran'
      ) &&
      chapterThree.some(
        contract =>
          contract.tier === 'elite'
      ),
    'Chapter 3 board must contain Standard, Veteran and Elite contracts.'
  );
}

function runRotationCoverage() {
  const first =
    getWarTablePostedContracts({
      cycle: 0,
      boardChapter: 3
    }).map(contract => contract.id);
  const second =
    getWarTablePostedContracts({
      cycle: 1,
      boardChapter: 3
    }).map(contract => contract.id);
  const third =
    getWarTablePostedContracts({
      cycle: 2,
      boardChapter: 3
    }).map(contract => contract.id);

  check(
    first.join(',') !==
      second.join(','),
    'Refreshing the board did not rotate the posted contracts.'
  );
  check(
    second.join(',') !==
      third.join(','),
    'Consecutive War Table cycles repeated the same full board.'
  );

  for (
    const posted of [first, second, third]
  ) {
    check(
      new Set(posted).size ===
        posted.length,
      'A War Table board contains a duplicate contract.'
    );
  }
}

function runContractCatalogCoverage() {
  check(
    warTableContracts.length >= 9,
    'War Table contract catalog did not expand beyond the original board.'
  );

  const categories =
    new Set(
      warTableContracts.map(
        contract => contract.category
      )
    );
  check(
    categories.size >= 5,
    'War Table does not contain enough contract category variety.'
  );

  for (
    const contract of warTableContracts
  ) {
    check(
      contract.encounterId.startsWith(
        'war_table_'
      ),
      'War Table contract points at a non-War-Table encounter.'
    );

    const encounter =
      getEncounter(contract.encounterId);
    const tactic =
      getEnemyFormationTactic(
        contract.encounterId
      );
    const reward =
      encounterRewards[
        contract.encounterId
      ];

    check(
      Boolean(encounter),
      'Missing War Table encounter for ' +
        contract.id
    );
    check(
      Boolean(tactic.formationShapeId),
      'Missing formation identity for ' +
        contract.id
    );
    check(
      Boolean(reward),
      'Missing base reward for ' +
        contract.id
    );
    check(
      (reward.resources.gold ?? 0) <= 55,
      'War Table base Gold reward is too high for quick-session content: ' +
        contract.id
    );
    check(
      (contract.bonusReward.gold ?? 0) <=
        12,
      'War Table bonus Gold is too high: ' +
        contract.id
    );
  }
}

function runBonusCoverage() {
  const swift =
    warTableContracts.find(
      contract =>
        contract.bonusObjective.type ===
        'swift'
    );
  const healthy =
    warTableContracts.find(
      contract =>
        contract.bonusObjective.type ===
        'healthy'
    );
  const lowWear =
    warTableContracts.find(
      contract =>
        contract.bonusObjective.type ===
        'low_wear'
    );

  check(
    swift &&
      swift.bonusObjective.type ===
        'swift',
    'Swift bonus fixture missing.'
  );
  check(
    healthy &&
      healthy.bonusObjective.type ===
        'healthy',
    'Healthy bonus fixture missing.'
  );
  check(
    lowWear &&
      lowWear.bonusObjective.type ===
        'low_wear',
    'Low-wear bonus fixture missing.'
  );

  check(
    evaluateWarTableBonus(
      swift,
      {
        exchanges:
          swift.bonusObjective
            .exchanges,
        remainingHp: 40,
        maxHp: 100,
        readinessWear: 20
      }
    ),
    'Swift objective should pass at its exact exchange limit.'
  );
  check(
    !evaluateWarTableBonus(
      swift,
      {
        exchanges:
          swift.bonusObjective
            .exchanges + 1,
        remainingHp: 100,
        maxHp: 100,
        readinessWear: 0
      }
    ),
    'Swift objective should fail above its exchange limit.'
  );

  check(
    evaluateWarTableBonus(
      healthy,
      {
        exchanges: 20,
        remainingHp:
          healthy.bonusObjective
            .hpPercent,
        maxHp: 100,
        readinessWear: 20
      }
    ),
    'Healthy objective should pass at its exact HP threshold.'
  );
  check(
    !evaluateWarTableBonus(
      healthy,
      {
        exchanges: 1,
        remainingHp:
          healthy.bonusObjective
            .hpPercent - 1,
        maxHp: 100,
        readinessWear: 0
      }
    ),
    'Healthy objective should fail below its HP threshold.'
  );

  check(
    evaluateWarTableBonus(
      lowWear,
      {
        exchanges: 20,
        remainingHp: 1,
        maxHp: 100,
        readinessWear:
          lowWear.bonusObjective
            .maxWear
      }
    ),
    'Low-wear objective should pass at its exact limit.'
  );
  check(
    !evaluateWarTableBonus(
      lowWear,
      {
        exchanges: 1,
        remainingHp: 100,
        maxHp: 100,
        readinessWear:
          lowWear.bonusObjective
            .maxWear + 1
      }
    ),
    'Low-wear objective should fail above its limit.'
  );
}

function runBoardClearCoverage() {
  const posted =
    getWarTablePostedContracts({
      cycle: 0,
      boardChapter: 2
    });

  check(
    !isWarTableBoardCleared({
      postedContracts: posted,
      completedContractIds:
        posted
          .slice(0, 2)
          .map(contract => contract.id)
    }),
    'War Table board refreshed before every posted contract was cleared.'
  );

  check(
    isWarTableBoardCleared({
      postedContracts: posted,
      completedContractIds:
        posted.map(
          contract => contract.id
        )
    }),
    'War Table board did not become refreshable after all contracts cleared.'
  );
}

function runSaveCoverage() {
  const record =
    createNewSaveRecord(1);
  const human =
    record.snapshot.factionStates.human;
  check(
    human,
    'Human save fixture missing.'
  );

  human.chapterNumber = 5;
  human.warTableCycle = 7;
  human.warTableBoardChapter = 99;
  human.warTableCompletedContractIds = [
    warTableContracts[0]!.id,
    'not_a_contract'
  ];
  human.warTableBonusContractIds = [
    warTableContracts[0]!.id,
    warTableContracts[1]!.id,
    'bad_bonus'
  ];
  human.warTableContractsCompleted = 22;
  human.warTableBonusObjectivesCompleted = 11;
  human.warTableBoardsClearedThisChapter = 2;

  const normalized =
    normalizeSaveRecord(1, record);
  const restored =
    normalized?.snapshot.factionStates.human;

  check(
    restored?.warTableCycle === 7,
    'War Table cycle was not preserved.'
  );
  check(
    restored?.warTableBoardChapter === 6,
    'War Table board chapter was not clamped to the current six-chapter campaign range.'
  );
  check(
    restored?.warTableCompletedContractIds.length ===
      1,
    'Unknown War Table contract IDs survived save sanitization.'
  );
  check(
    restored?.warTableBonusContractIds.join(',') ===
      warTableContracts[0]!.id,
    'Bonus completion survived without a matching cleared contract.'
  );
  check(
    restored?.warTableContractsCompleted ===
      22 &&
      restored.warTableBonusObjectivesCompleted ===
        11,
    'War Table lifetime counters were not preserved.'
  );
  check(
    restored?.warTableBoardsClearedThisChapter === 2,
    'War Table per-chapter board reward count was not preserved.'
  );
}

runTierCoverage();
runRotationCoverage();
runContractCatalogCoverage();
runBonusCoverage();
runBoardClearCoverage();
runSaveCoverage();

console.log(
  'PASS: War Table tiers, rotation, categories, objectives, rewards, board clearing and save sanitization remain valid.'
);
