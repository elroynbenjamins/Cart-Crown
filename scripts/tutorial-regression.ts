import { readFileSync } from 'node:fs';
import {
  CORE_TUTORIAL_KEYS,
  FACTION_TUTORIAL_KEYS,
  SYSTEM_TUTORIAL_KEYS,
  getNextTutorialMoment,
  getTutorialCompletionKeys,
  isCoreTutorialComplete,
  shouldRequestChapterOneReview,
  tutorialBuildingKey,
  tutorialUnitKey,
  type TutorialContext
} from '../src/game/tutorial';
import {
  humanRecruitOptions,
  starterUnits
} from '../src/game/data';
import {
  elfStarterUnits,
  orcStarterUnits
} from '../src/game/factionStarts';
import { elfThirdRecruitOptions } from '../src/game/factionChapter2';
import { getBuildings } from '../src/game/kingdom';
import {
  createNewSaveRecord,
  normalizeSaveRecord
} from '../src/save/schema';

const failures: string[] = [];

function expect(
  condition: unknown,
  message: string
) {
  if (!condition) failures.push(message);
}

function baseContext(
  overrides: Partial<TutorialContext> = {}
): TutorialContext {
  return {
    faction: 'human',
    view: 'kingdom',
    tutorialSeen: [],
    units: starterUnits.map(unit => ({ ...unit })),
    buildings: [],
    settlementUpgraded: false,
    forgeUnlocked: false,
    forgeLevel: 0,
    firstPromotionComplete: false,
    commanderPathId: null,
    armyReadiness: 100,
    unlockedResourceSites: 0,
    wagonStageId: 'camp',
    ...overrides
  };
}

function runCoreSequence() {
  const steps: Array<{
    view: TutorialContext['view'];
    expected: string;
    focus?: string;
  }> = [
    {
      view: 'kingdom',
      expected: 'core:kingdom',
      focus: 'nav'
    },
    {
      view: 'campaign',
      expected: 'core:campaign',
      focus: 'campaign-current'
    },
    {
      view: 'battlePrep',
      expected: 'core:battle-prep',
      focus: 'battle-begin'
    },
    { view: 'battle', expected: 'core:battle' },
    {
      view: 'results',
      expected: 'core:results',
      focus: 'results-continue'
    }
  ];

  const seen: string[] = [];

  for (const step of steps) {
    const moment = getNextTutorialMoment(
      baseContext({
        view: step.view,
        tutorialSeen: [...seen]
      })
    );

    expect(
      moment?.key === step.expected,
      'Core tutorial sequence expected ' +
        step.expected +
        ' on ' +
        step.view +
        ', got ' +
        String(moment?.key)
    );

    if (step.focus) {
      expect(
        moment?.focusAfterPrimary?.kind ===
          step.focus,
        step.expected +
          ' no longer hands off to the expected ' +
          step.focus +
          ' spotlight.'
      );
    } else {
      expect(
        !moment?.focusAfterPrimary,
        step.expected +
          ' unexpectedly leaves a stale spotlight.'
      );
    }

    if (moment) seen.push(moment.key);
  }

  expect(
    isCoreTutorialComplete(seen),
    'Core tutorial did not report completion after all five lessons.'
  );
}

function runFactionIntroCoverage() {
  const elfIntro = getNextTutorialMoment(
    baseContext({
      faction: 'elf',
      view: 'campaign',
      tutorialSeen: [],
      units: elfStarterUnits.map(unit => ({ ...unit }))
    })
  );

  expect(
    elfIntro?.key === 'faction:intro',
    'Fresh Elf campaign does not receive a faction-mechanic introduction.'
  );
  expect(
    elfIntro?.focusAfterPrimary?.kind ===
      'campaign-current',
    'Elf introduction does not hand off to the first campaign objective.'
  );

  const orcIntro = getNextTutorialMoment(
    baseContext({
      faction: 'orc',
      view: 'kingdom',
      tutorialSeen: [],
      units: orcStarterUnits.map(unit => ({ ...unit }))
    })
  );

  expect(
    orcIntro?.key === 'faction:intro',
    'Fresh Orc campaign does not receive a faction-mechanic introduction.'
  );

  const elfThird =
    elfThirdRecruitOptions[0]?.unit;
  if (!elfThird) {
    failures.push(
      'Elf third-unit tutorial fixture is missing.'
    );
    return;
  }

  const elfUnitLesson =
    getNextTutorialMoment(
      baseContext({
        faction: 'elf',
        view: 'formation',
        tutorialSeen: ['faction:intro'],
        units: [
          ...elfStarterUnits.map(unit => ({
            ...unit
          })),
          { ...elfThird }
        ]
      })
    );

  expect(
    elfUnitLesson?.key ===
      tutorialUnitKey(elfThird.id),
    'Elf unlock guidance remains blocked after faction introduction.'
  );
}

function runPacingCoverage() {
  const core = [...CORE_TUTORIAL_KEYS];

  const healthyReadiness =
    getNextTutorialMoment(
      baseContext({
        view: 'battlePrep',
        tutorialSeen: core,
        armyReadiness: 84
      })
    );

  expect(
    healthyReadiness?.key !==
      'system:readiness',
    'Readiness is being re-taught before fatigue creates a combat penalty.'
  );

  const fatiguedReadiness =
    getNextTutorialMoment(
      baseContext({
        view: 'battlePrep',
        tutorialSeen: core,
        armyReadiness: 65
      })
    );

  expect(
    fatiguedReadiness?.key ===
      'system:readiness',
    'Readiness warning does not appear once fatigue is actually active.'
  );

  const advancedDuringPrep =
    getNextTutorialMoment(
      baseContext({
        view: 'battlePrep',
        tutorialSeen: core,
        wagonStageId: 'fort'
      })
    );

  expect(
    advancedDuringPrep?.key !==
      'system:advanced-formations',
    'Advanced formation tutorial interrupts an active Battle Prep flow.'
  );

  const advancedInFormation =
    getNextTutorialMoment(
      baseContext({
        view: 'formation',
        tutorialSeen: core,
        wagonStageId: 'fort'
      })
    );

  expect(
    advancedInFormation?.key ===
      'system:advanced-formations',
    'Advanced formation tutorial no longer waits for the Formation screen.'
  );
}

function runCompletionCoverage() {
  const keys = getTutorialCompletionKeys(
    'unit:example',
    {
      kind: 'formation-unit',
      unitId: 'example',
      label: 'SELECT NEW SQUAD'
    }
  );

  expect(
    keys.includes('unit:example') &&
      keys.includes('system:formation'),
    'Completing the hands-on new-squad lesson does not also satisfy basic Formation teaching.'
  );

  const simple = getTutorialCompletionKeys(
    'core:campaign',
    {
      kind: 'campaign-current',
      label: 'TAP CURRENT OBJECTIVE'
    }
  );

  expect(
    simple.length === 1 &&
      simple[0] === 'core:campaign',
    'Ordinary tutorial focus completion marks unrelated lessons.'
  );
}

function runUnitUnlockCoverage() {
  const thirdUnit =
    humanRecruitOptions[0]?.unit;
  if (!thirdUnit) {
    failures.push(
      'Human third-unit fixture is missing.'
    );
    return;
  }

  const moment = getNextTutorialMoment(
    baseContext({
      view: 'formation',
      tutorialSeen: [...CORE_TUTORIAL_KEYS],
      units: [
        ...starterUnits.map(unit => ({ ...unit })),
        { ...thirdUnit }
      ]
    })
  );

  expect(
    moment?.key ===
      tutorialUnitKey(thirdUnit.id),
    'Newly recruited squad did not receive first-unlock guidance.'
  );
  expect(
    moment?.target === 'formation',
    'New squad guidance does not route to Formation.'
  );
  expect(
    moment?.focusAfterPrimary?.kind ===
      'formation-unit' &&
      moment.focusAfterPrimary.unitId ===
        thirdUnit.id,
    'New squad guidance does not spotlight the unlocked squad.'
  );

  const afterUnit = getNextTutorialMoment(
    baseContext({
      view: 'formation',
      tutorialSeen: [
        ...CORE_TUTORIAL_KEYS,
        tutorialUnitKey(thirdUnit.id)
      ],
      units: [
        ...starterUnits.map(unit => ({ ...unit })),
        { ...thirdUnit }
      ]
    })
  );

  expect(
    afterUnit?.key === 'system:formation',
    'Formation system lesson did not follow the first extra squad.'
  );
}

function runBuildingUnlockCoverage() {
  const forge = getBuildings('human').find(
    building => building.id === 'forge'
  );
  if (!forge) {
    failures.push('Human Forge fixture is missing.');
    return;
  }

  const settlementMoment =
    getNextTutorialMoment(
      baseContext({
        view: 'kingdom',
        tutorialSeen: [...CORE_TUTORIAL_KEYS],
        settlementUpgraded: true,
        buildings: [
          {
            definition: forge,
            level: 0,
            unlocked: true
          }
        ]
      })
    );

  expect(
    settlementMoment?.key ===
      'system:settlement',
    'Settlement overview should teach before individual building blueprints.'
  );

  const buildingMoment =
    getNextTutorialMoment(
      baseContext({
        view: 'kingdom',
        tutorialSeen: [
          ...CORE_TUTORIAL_KEYS,
          'system:settlement'
        ],
        settlementUpgraded: true,
        buildings: [
          {
            definition: forge,
            level: 0,
            unlocked: true
          }
        ]
      })
    );

  expect(
    buildingMoment?.key ===
      tutorialBuildingKey('forge'),
    'Newly unlocked Forge did not receive a building unlock card.'
  );
  expect(
    buildingMoment?.target === 'settlement',
    'Building unlock guidance does not route to Settlement.'
  );
  expect(
    buildingMoment?.focusAfterPrimary?.kind ===
      'settlement-building' &&
      buildingMoment.focusAfterPrimary.buildingId ===
        'forge',
    'Building unlock guidance does not carry the Forge blueprint into Settlement focus.'
  );
}

function runSystemCoverage() {
  const core = [...CORE_TUTORIAL_KEYS];

  const forge = getNextTutorialMoment(
    baseContext({
      view: 'kingdom',
      tutorialSeen: [
        ...core,
        'system:settlement'
      ],
      settlementUpgraded: true,
      forgeUnlocked: true,
      forgeLevel: 1
    })
  );
  expect(
    forge?.key === 'system:forge',
    'Forge system lesson did not trigger after construction.'
  );
  expect(
    forge?.focusAfterPrimary?.kind ===
      'forge-craft',
    'Forge lesson does not spotlight the first crafting action.'
  );

  const readiness = getNextTutorialMoment(
    baseContext({
      view: 'battlePrep',
      tutorialSeen: core,
      armyReadiness: 65
    })
  );
  expect(
    readiness?.key === 'system:readiness',
    'Readiness lesson did not trigger after first campaign wear.'
  );
  expect(
    readiness?.focusAfterPrimary?.kind ===
      'battle-readiness',
    'Battle Prep Readiness lesson does not spotlight the Readiness card.'
  );

  const readinessAtKingdom =
    getNextTutorialMoment(
      baseContext({
        view: 'kingdom',
        tutorialSeen: core,
        armyReadiness: 65
      })
    );
  expect(
    readinessAtKingdom?.key ===
      'system:readiness' &&
      !readinessAtKingdom.focusAfterPrimary,
    'Kingdom Readiness lesson should explain the system without leaving an invisible Battle Prep spotlight.'
  );

  const production = getNextTutorialMoment(
    baseContext({
      view: 'kingdom',
      tutorialSeen: core,
      unlockedResourceSites: 1
    })
  );
  expect(
    production?.key === 'system:production',
    'Regional production lesson did not trigger after first site unlock.'
  );
  expect(
    production?.focusAfterPrimary?.kind ===
      'kingdom-production',
    'Regional production lesson does not spotlight the claim area.'
  );

  const advanced = getNextTutorialMoment(
    baseContext({
      view: 'formation',
      tutorialSeen: core,
      wagonStageId: 'fort'
    })
  );
  expect(
    advanced?.key ===
      'system:advanced-formations',
    'Advanced formation lesson did not trigger at Fort tier.'
  );
  expect(
    advanced?.focusAfterPrimary?.kind ===
      'formation-shape',
    'Advanced formation lesson does not spotlight formation shapes.'
  );

  const sideModes = getNextTutorialMoment(
    baseContext({
      view: 'campaign',
      tutorialSeen: core,
      wagonStageId: 'fort'
    })
  );
  expect(
    sideModes?.key === 'system:side-modes',
    'Side-mode lesson did not trigger at Fort tier.'
  );
  expect(
    sideModes?.focusAfterPrimary?.kind ===
      'campaign-activities',
    'Side-mode lesson does not spotlight Activities.'
  );
}

function runReviewTimingCoverage() {
  const eligible = {
    activeFaction: 'human' as const,
    activeView: 'kingdom' as const,
    lastBattleResultId:
      'toll_captain_result',
    reviewPromptShown: false,
    tutorialActive: false
  };

  expect(
    shouldRequestChapterOneReview(eligible),
    'Chapter 1 review request is not eligible after returning to Kingdom.'
  );
  expect(
    !shouldRequestChapterOneReview({
      ...eligible,
      activeView: 'results'
    }),
    'Review request would interrupt the Results reward flow.'
  );
  expect(
    !shouldRequestChapterOneReview({
      ...eligible,
      tutorialActive: true
    }),
    'Review request would overlap an active tutorial lesson.'
  );
  expect(
    !shouldRequestChapterOneReview({
      ...eligible,
      reviewPromptShown: true
    }),
    'Review request can repeat after already being shown.'
  );
  expect(
    !shouldRequestChapterOneReview({
      ...eligible,
      activeFaction: 'elf'
    }),
    'Review request incorrectly triggers from a later faction campaign.'
  );
}

function runLegacySaveCoverage() {
  const fresh = createNewSaveRecord(1);
  const freshHuman =
    fresh.snapshot.factionStates.human;
  if (!freshHuman) {
    failures.push('Fresh Human save missing.');
    return;
  }

  delete freshHuman.tutorialSeen;

  const normalizedFresh = normalizeSaveRecord(
    1,
    JSON.parse(JSON.stringify(fresh))
  );
  expect(
    normalizedFresh?.snapshot.factionStates.human
      ?.tutorialSeen?.length === 0,
    'A genuinely fresh older-v13 save was incorrectly marked as tutorial-complete.'
  );

  const progressed = createNewSaveRecord(1);
  const progressedHuman =
    progressed.snapshot.factionStates.human;
  if (!progressedHuman) {
    failures.push(
      'Progressed Human save fixture missing.'
    );
    return;
  }

  delete progressedHuman.tutorialSeen;
  progressedHuman.holdTheRoadWon = true;
  progressedHuman.recruitChosen = true;
  progressedHuman.units.push({
    ...humanRecruitOptions[0]!.unit
  });

  const normalizedProgressed =
    normalizeSaveRecord(
      1,
      JSON.parse(JSON.stringify(progressed))
    );
  const seeded =
    normalizedProgressed?.snapshot.factionStates
      .human?.tutorialSeen ?? [];

  expect(
    CORE_TUTORIAL_KEYS.every(key =>
      seeded.includes(key)
    ),
    'Progressed older-v13 save did not suppress retroactive beginner tutorial.'
  );
  expect(
    FACTION_TUTORIAL_KEYS.every(key =>
      seeded.includes(key)
    ),
    'Progressed older-v13 save did not suppress retroactive faction-intro backlog.'
  );
  expect(
    SYSTEM_TUTORIAL_KEYS.every(key =>
      seeded.includes(key)
    ),
    'Progressed older-v13 save did not suppress retroactive system-tip backlog.'
  );
  expect(
    seeded.includes(
      tutorialUnitKey(
        humanRecruitOptions[0]!.unit.id
      )
    ),
    'Existing recruited unit was not seeded as previously learned on a legacy save.'
  );
}

function runAppIdentityCoverage() {
  const app = JSON.parse(
    readFileSync('app.json', 'utf8')
  );
  const pkg = JSON.parse(
    readFileSync('package.json', 'utf8')
  );

  expect(
    app.expo?.android?.package ===
      'com.elroybenjamins.cartcrown',
    'Android package name drifted from com.elroybenjamins.cartcrown.'
  );
  expect(
    pkg.dependencies?.['expo-store-review'] ===
      '~57.0.3',
    'expo-store-review is missing or not pinned to the SDK 57 compatible recommendation.'
  );
}

function main() {
  runCoreSequence();
  runFactionIntroCoverage();
  runPacingCoverage();
  runCompletionCoverage();
  runUnitUnlockCoverage();
  runBuildingUnlockCoverage();
  runSystemCoverage();
  runReviewTimingCoverage();
  runLegacySaveCoverage();
  runAppIdentityCoverage();

  if (failures.length > 0) {
    console.error(
      '\nTUTORIAL REGRESSION FAILURES (' +
        failures.length +
        '):'
    );
    failures.forEach((failure, index) => {
      console.error(
        String(index + 1) + '. ' + failure
      );
    });
    throw new Error(
      String(failures.length) +
        ' tutorial/onboarding guardrail(s) failed.'
    );
  }

  console.log(
    'PASS: staged onboarding, faction-specific intros, non-repetitive pacing, transactional spotlight completion, first-unit/building guidance, system unlock lessons, legacy-save behavior, post-Chapter-1 review timing and Android app identity remain protected.'
  );
}

main();
