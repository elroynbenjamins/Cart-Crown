import {
  evaluateKingdomTrial,
  isKingdomTrialUnlocked,
  kingdomTrialOrder
} from '../src/game/kingdomTrials';
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

function formation(
  entries: Array<[number, string]>
) {
  const value =
    Array<string | null>(9).fill(null);
  entries.forEach(([slot, id]) => {
    value[slot] = id;
  });
  return value;
}

function runUnlockChain() {
  check(
    !isKingdomTrialUnlocked('bronze', [], 1) &&
      isKingdomTrialUnlocked('bronze', [], 2),
    'Bronze must stay locked in Chapter 1 and unlock in Chapter 2.'
  );
  check(
    !isKingdomTrialUnlocked('silver', [], 3),
    'Silver unlocked before Bronze.'
  );
  check(
    isKingdomTrialUnlocked(
      'silver',
      ['bronze'],
      3
    ),
    'Silver did not unlock after Bronze in Chapter 3.'
  );
  check(
    !isKingdomTrialUnlocked(
      'gold',
      ['bronze'],
      4
    ),
    'Gold unlocked before Silver.'
  );
  check(
    isKingdomTrialUnlocked(
      'gold',
      ['bronze', 'silver'],
      4
    ),
    'Gold did not unlock after Silver in Chapter 4.'
  );
  check(
    kingdomTrialOrder.join(',') ===
      'bronze,silver,gold',
    'Kingdom Trial medal order changed.'
  );
}

function runHumanCoverage() {
  const bronze = evaluateKingdomTrial(
    'bronze',
    {
      faction: 'human',
      formation: formation([
        [1, 'hum_militia'],
        [4, 'hum_recruit']
      ]),
      formationShapeId: 'balanced_333',
      formationDoctrineId: 'human_hold'
    }
  );
  check(
    bronze.passed,
    'Valid Human Bronze protected lane failed.'
  );

  const silver = evaluateKingdomTrial(
    'silver',
    {
      faction: 'human',
      formation: formation([
        [0, 'hum_militia'],
        [3, 'hum_recruit'],
        [8, 'human_third']
      ]),
      formationShapeId: 'deep_234',
      formationDoctrineId: 'human_hold'
    }
  );
  check(
    silver.passed,
    'Valid Human Silver depth setup failed.'
  );

  const gold = evaluateKingdomTrial(
    'gold',
    {
      faction: 'human',
      formation: formation([
        [0, 'hum_militia'],
        [2, 'hum_recruit'],
        [5, 'human_third'],
        [8, 'human_fourth']
      ]),
      formationShapeId: 'deep_234',
      formationDoctrineId: 'human_volley'
    }
  );
  check(
    gold.passed,
    'Valid Human Gold doctrine setup failed.'
  );
}

function runElfCoverage() {
  const bronze = evaluateKingdomTrial(
    'bronze',
    {
      faction: 'elf',
      formation: formation([
        [0, 'elf_warden'],
        [8, 'elf_bow']
      ]),
      formationShapeId: 'balanced_333',
      formationDoctrineId: 'elf_open'
    }
  );
  check(
    bronze.passed,
    'Valid Elf Bronze spacing failed.'
  );

  const silver = evaluateKingdomTrial(
    'silver',
    {
      faction: 'elf',
      formation: formation([
        [0, 'elf_a'],
        [3, 'elf_b'],
        [8, 'elf_c']
      ]),
      formationShapeId: 'deep_234',
      formationDoctrineId: 'elf_open'
    }
  );
  check(
    silver.passed,
    'Valid Elf Silver layered spacing failed.'
  );

  const gold = evaluateKingdomTrial(
    'gold',
    {
      faction: 'elf',
      formation: formation([
        [0, 'elf_a'],
        [3, 'elf_b'],
        [5, 'elf_c'],
        [8, 'elf_d']
      ]),
      formationShapeId: 'deep_234',
      formationDoctrineId: 'elf_crescent'
    }
  );
  check(
    gold.passed,
    'Valid Elf Gold crescent setup failed.'
  );
}

function runOrcCoverage() {
  const bronze = evaluateKingdomTrial(
    'bronze',
    {
      faction: 'orc',
      formation: formation([
        [0, 'orc_a'],
        [1, 'orc_b']
      ]),
      formationShapeId: 'balanced_333',
      formationDoctrineId: 'orc_warband'
    }
  );
  check(
    bronze.passed,
    'Valid Orc Bronze cohesion failed.'
  );

  const silver = evaluateKingdomTrial(
    'silver',
    {
      faction: 'orc',
      formation: formation([
        [0, 'orc_a'],
        [1, 'orc_b'],
        [5, 'orc_c']
      ]),
      formationShapeId: 'assault_432',
      formationDoctrineId: 'orc_warband'
    }
  );
  check(
    silver.passed,
    'Valid Orc Silver assault failed.'
  );

  const gold = evaluateKingdomTrial(
    'gold',
    {
      faction: 'orc',
      formation: formation([
        [0, 'orc_a'],
        [1, 'orc_b'],
        [2, 'orc_c'],
        [4, 'orc_d']
      ]),
      formationShapeId: 'assault_432',
      formationDoctrineId: 'orc_rush'
    }
  );
  check(
    gold.passed,
    'Valid Orc Gold pressure setup failed.'
  );
}

function runFailureCoverage() {
  const wrongShape = evaluateKingdomTrial(
    'silver',
    {
      faction: 'human',
      formation: formation([
        [0, 'a'],
        [3, 'b'],
        [8, 'c']
      ]),
      formationShapeId: 'balanced_333',
      formationDoctrineId: 'human_hold'
    }
  );
  check(
    !wrongShape.passed,
    'Silver can be bypassed with the starter shape.'
  );

  const wrongDoctrine = evaluateKingdomTrial(
    'gold',
    {
      faction: 'orc',
      formation: formation([
        [0, 'a'],
        [1, 'b'],
        [2, 'c'],
        [4, 'd']
      ]),
      formationShapeId: 'assault_432',
      formationDoctrineId: 'orc_warband'
    }
  );
  check(
    !wrongDoctrine.passed,
    'Gold can be bypassed without its doctrine.'
  );
}

function runSaveMigrationCoverage() {
  const legacy = createNewSaveRecord(1);
  const human =
    legacy.snapshot.factionStates.human;
  check(human, 'Human save fixture missing.');

  human.formationTrialCompleted = true;
  delete human.kingdomTrialCompletions;

  const normalized =
    normalizeSaveRecord(1, legacy);
  const migrated =
    normalized?.snapshot.factionStates.human;

  check(
    migrated?.kingdomTrialCompletions?.join(',') ===
      'bronze',
    'Legacy Formation Trial clear did not migrate to Bronze.'
  );

  const malformed = createNewSaveRecord(1);
  const malformedHuman =
    malformed.snapshot.factionStates.human;
  check(
    malformedHuman,
    'Malformed save fixture missing.'
  );
  malformedHuman.kingdomTrialCompletions = [
    'gold',
    'silver'
  ];

  const repaired =
    normalizeSaveRecord(1, malformed)
      ?.snapshot.factionStates.human;

  check(
    repaired?.kingdomTrialCompletions?.length === 0,
    'Impossible medal chain was not repaired.'
  );
}

runUnlockChain();
runHumanCoverage();
runElfCoverage();
runOrcCoverage();
runFailureCoverage();
runSaveMigrationCoverage();

console.log(
  'PASS: Kingdom Trials unlock sequentially, validate faction formations and preserve legacy saves.'
);
