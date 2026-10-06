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
    warTableUnlocked: false,
    kingdomTrialsUnlocked: false,
    kingdomDefenseModeUnlocked: false,
    expeditionsUnlocked: false,
    siegesUnlocked: false,
    relicHuntsUnlocked: false,
    magicStoryUnlocked: false,
    flyingStoryUnlocked: false,
    largeStoryUnlocked: false,
    hybridStoryUnlocked: false,
    hybridPrerequisitesMet: false,
    completedMagicResearch: 0,
    completedFlyingResearch: 0,
    completedLargeResearch: 0,
    completedHybridResearch: 0,
    enemyFantasyThreatFamily: null,
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

  const warTable = getNextTutorialMoment(
    baseContext({
      view: 'campaign',
      tutorialSeen: core,
      warTableUnlocked: true
    })
  );
  expect(
    warTable?.key === 'system:war-table',
    'War Table lesson did not trigger when the first optional mode unlocked.'
  );
  expect(
    warTable?.focusAfterPrimary?.kind ===
      'campaign-activities' &&
      warTable.focusAfterPrimary.modeId ===
        'war_table',
    'War Table lesson does not route to the newly visible activity.'
  );

  const kingdomTrials = getNextTutorialMoment(
    baseContext({
      view: 'campaign',
      tutorialSeen: [
        ...core,
        'system:war-table'
      ],
      warTableUnlocked: true,
      kingdomTrialsUnlocked: true
    })
  );
  expect(
    kingdomTrials?.key ===
      'system:kingdom-trials',
    'Kingdom Trials lesson did not wait for its own progression gate.'
  );

  const kingdomDefense =
    getNextTutorialMoment(
      baseContext({
        view: 'campaign',
        tutorialSeen: [
          ...core,
          'system:war-table',
          'system:kingdom-trials'
        ],
        warTableUnlocked: true,
        kingdomTrialsUnlocked: true,
        kingdomDefenseModeUnlocked: true
      })
    );
  expect(
    kingdomDefense?.key ===
      'system:kingdom-defense-repeatable',
    'Repeatable Kingdom Defense lesson did not wait for the story defense clear.'
  );

  const expeditions = getNextTutorialMoment(
    baseContext({
      view: 'campaign',
      tutorialSeen: [
        ...core,
        'system:war-table',
        'system:kingdom-trials',
        'system:kingdom-defense-repeatable'
      ],
      warTableUnlocked: true,
      kingdomTrialsUnlocked: true,
      kingdomDefenseModeUnlocked: true,
      expeditionsUnlocked: true
    })
  );
  expect(
    expeditions?.key === 'system:expeditions',
    'Expedition lesson did not wait until the later campaign gate.'
  );

  const sieges = getNextTutorialMoment(
    baseContext({
      view: 'campaign',
      tutorialSeen: [
        ...core,
        'system:war-table',
        'system:kingdom-trials',
        'system:kingdom-defense-repeatable',
        'system:expeditions'
      ],
      warTableUnlocked: true,
      kingdomTrialsUnlocked: true,
      kingdomDefenseModeUnlocked: true,
      expeditionsUnlocked: true,
      siegesUnlocked: true
    })
  );

  expect(
    sieges?.key === 'system:sieges',
    'Offensive Siege lesson did not wait for its Chapter 3 progression gate.'
  );

  const relicHunts = getNextTutorialMoment(
    baseContext({
      view: 'campaign',
      tutorialSeen: [
        ...core,
        'system:war-table',
        'system:kingdom-trials',
        'system:kingdom-defense-repeatable',
        'system:expeditions',
        'system:sieges'
      ],
      warTableUnlocked: true,
      kingdomTrialsUnlocked: true,
      kingdomDefenseModeUnlocked: true,
      expeditionsUnlocked: true,
      siegesUnlocked: true,
      relicHuntsUnlocked: true
    })
  );

  expect(
    relicHunts?.key ===
      'system:relic-hunts',
    'Relic Hunt lesson did not trigger after its fantasy-class progression gate.'
  );
  expect(
    relicHunts?.focusAfterPrimary?.kind ===
      'campaign-activities' &&
      relicHunts.focusAfterPrimary.modeId ===
        'relic_hunts',
    'Relic Hunt lesson does not route to the new activity.'
  );
  expect(
    sieges?.key === 'system:sieges',
    'Offensive Siege lesson did not wait for its own Chapter 3 activity gate.'
  );
  expect(
    sieges?.focusAfterPrimary?.kind ===
      'campaign-activities' &&
      sieges.focusAfterPrimary.modeId ===
        'sieges',
    'Offensive Siege lesson does not route to the Siege activity.'
  );
}

function runEnemyFantasyTutorialCoverage() {
  const moment = getNextTutorialMoment(
    baseContext({
      view: 'battlePrep',
      tutorialSeen: [
        ...CORE_TUTORIAL_KEYS,
        'system:readiness'
      ],
      wagonStageId: 'stronghold',
      enemyFantasyThreatFamily: 'flying'
    })
  );

  expect(
    moment?.key === 'system:enemy-fantasy-threat',
    'The first enemy fantasy encounter does not teach its counter system in Battle Prep.'
  );
  expect(
    moment?.title.toLowerCase().includes('fly'),
    'Flying enemy tutorial copy does not explain the active threat family.'
  );
  expect(
    !moment?.focusAfterPrimary,
    'Enemy fantasy lesson should not trap the user on a non-interactive spotlight.'
  );

  const repeated = getNextTutorialMoment(
    baseContext({
      view: 'battlePrep',
      tutorialSeen: [
        ...CORE_TUTORIAL_KEYS,
        'system:readiness',
        'system:enemy-fantasy-threat'
      ],
      wagonStageId: 'stronghold',
      enemyFantasyThreatFamily: 'large'
    })
  );

  expect(
    repeated?.key !== 'system:enemy-fantasy-threat',
    'Enemy fantasy counter lesson repeats after it has already been completed.'
  );
}

function runFantasyFamilyCoverage() {
  const core = [...CORE_TUTORIAL_KEYS];

  const magicDiscovery = getNextTutorialMoment(
    baseContext({
      view: 'army',
      tutorialSeen: core,
      magicStoryUnlocked: true,
      wagonStageId: 'stronghold'
    })
  );

  expect(
    magicDiscovery?.key ===
      'system:magic-discovery',
    'Magic family discovery is not introduced when the story gate opens.'
  );
  expect(
    magicDiscovery?.focusAfterPrimary?.kind ===
      'army-fantasy' &&
      magicDiscovery.focusAfterPrimary.family ===
        'magic',
    'Magic discovery does not route to the Arcane Research Army card.'
  );

  const magicResearch = getNextTutorialMoment(
    baseContext({
      view: 'fantasyResearch',
      tutorialSeen: [
        ...core,
        'system:magic-discovery'
      ],
      magicStoryUnlocked: true
    })
  );

  expect(
    magicResearch?.key ===
      'system:magic-research',
    'Arcane Research screen does not teach the research timer/optional acceleration model.'
  );
  expect(
    magicResearch?.focusAfterPrimary?.kind ===
      'research-start' &&
      magicResearch.focusAfterPrimary.family ===
        'magic',
    'Arcane Research lesson does not spotlight a valid Start Research action.'
  );

  const magicTraining = getNextTutorialMoment(
    baseContext({
      view: 'fantasyResearch',
      tutorialSeen: [
        ...core,
        'system:magic-discovery',
        'system:magic-research'
      ],
      magicStoryUnlocked: true,
      completedMagicResearch: 1
    })
  );

  expect(
    magicTraining?.key ===
      'system:magic-training',
    'First completed magic doctrine does not introduce repeatable training.'
  );
  expect(
    magicTraining?.focusAfterPrimary?.kind ===
      'research-train' &&
      magicTraining.focusAfterPrimary.family ===
        'magic',
    'Magic training lesson does not spotlight the newly trainable class.'
  );

  const flyingDiscovery = getNextTutorialMoment(
    baseContext({
      view: 'army',
      tutorialSeen: [
        ...core,
        'system:magic-discovery',
        'system:magic-research',
        'system:magic-training'
      ],
      magicStoryUnlocked: true,
      flyingStoryUnlocked: true,
      wagonStageId: 'capital'
    })
  );

  expect(
    flyingDiscovery?.key ===
      'system:flying-discovery',
    'Flying family discovery is not introduced when the Chapter 5 story gate opens.'
  );
  expect(
    flyingDiscovery?.focusAfterPrimary?.kind ===
      'army-fantasy' &&
      flyingDiscovery.focusAfterPrimary.family ===
        'flying',
    'Flying discovery does not route to the Aerial Training Army card.'
  );

  const flyingResearch = getNextTutorialMoment(
    baseContext({
      view: 'flyingResearch',
      tutorialSeen: [
        ...core,
        'system:flying-discovery'
      ],
      flyingStoryUnlocked: true
    })
  );

  expect(
    flyingResearch?.key ===
      'system:flying-research',
    'Aerial Training screen does not explain handling research.'
  );
  expect(
    flyingResearch?.focusAfterPrimary?.kind ===
      'research-start' &&
      flyingResearch.focusAfterPrimary.family ===
        'flying',
    'Aerial research lesson does not spotlight Start Research.'
  );

  const flyingTraining = getNextTutorialMoment(
    baseContext({
      view: 'flyingResearch',
      tutorialSeen: [
        ...core,
        'system:flying-discovery',
        'system:flying-research'
      ],
      flyingStoryUnlocked: true,
      completedFlyingResearch: 1
    })
  );

  expect(
    flyingTraining?.key ===
      'system:flying-training',
    'First completed flying doctrine does not introduce aerial recruitment.'
  );
  expect(
    flyingTraining?.focusAfterPrimary?.kind ===
      'research-train' &&
      flyingTraining.focusAfterPrimary.family ===
        'flying',
    'Flying training lesson does not spotlight the newly trainable aerial class.'
  );
  const largeDiscovery = getNextTutorialMoment(
    baseContext({
      view: 'army',
      tutorialSeen: [
        ...core,
        'system:magic-discovery',
        'system:magic-research',
        'system:magic-training',
        'system:flying-discovery',
        'system:flying-research',
        'system:flying-training'
      ],
      magicStoryUnlocked: true,
      flyingStoryUnlocked: true,
      largeStoryUnlocked: true,
      wagonStageId: 'grand'
    })
  );

  expect(
    largeDiscovery?.key ===
      'system:large-discovery',
    'Large-unit mastery is not introduced after the Chapter 7 gate opens.'
  );
  expect(
    largeDiscovery?.focusAfterPrimary?.kind ===
      'army-fantasy' &&
      largeDiscovery.focusAfterPrimary.family ===
        'large',
    'Large discovery does not route to the Large Unit Mastery Army card.'
  );

  const largeResearch = getNextTutorialMoment(
    baseContext({
      view: 'largeResearch',
      tutorialSeen: [
        ...core,
        'system:large-discovery'
      ],
      largeStoryUnlocked: true
    })
  );

  expect(
    largeResearch?.key ===
      'system:large-research',
    'Large Unit Mastery screen does not explain mastery research.'
  );
  expect(
    largeResearch?.focusAfterPrimary?.kind ===
      'research-start' &&
      largeResearch.focusAfterPrimary.family ===
        'large',
    'Large mastery lesson does not spotlight Start Mastery.'
  );

  const largeTraining = getNextTutorialMoment(
    baseContext({
      view: 'largeResearch',
      tutorialSeen: [
        ...core,
        'system:large-discovery',
        'system:large-research'
      ],
      largeStoryUnlocked: true,
      completedLargeResearch: 1
    })
  );

  expect(
    largeTraining?.key ===
      'system:large-training',
    'First completed Large mastery does not introduce repeatable Large training.'
  );
  expect(
    largeTraining?.focusAfterPrimary?.kind ===
      'research-train' &&
      largeTraining.focusAfterPrimary.family ===
        'large',
    'Large training lesson does not spotlight the newly trainable Large class.'
  );

  const priorFantasySeen = [
    ...core,
    'system:magic-discovery',
    'system:magic-research',
    'system:magic-training',
    'system:flying-discovery',
    'system:flying-research',
    'system:flying-training',
    'system:large-discovery',
    'system:large-research',
    'system:large-training'
  ];

  const hybridDiscovery = getNextTutorialMoment(
    baseContext({
      view: 'army',
      tutorialSeen: priorFantasySeen,
      magicStoryUnlocked: true,
      flyingStoryUnlocked: true,
      largeStoryUnlocked: true,
      hybridStoryUnlocked: true,
      wagonStageId: 'grand'
    })
  );

  expect(
    hybridDiscovery?.key ===
      'system:hybrid-discovery',
    'Legendary hybrid family is not introduced after the Chapter 8 story gate opens.'
  );
  expect(
    hybridDiscovery?.focusAfterPrimary?.kind ===
      'army-fantasy' &&
      hybridDiscovery.focusAfterPrimary.family ===
        'hybrid',
    'Legendary discovery does not route to the Legendary Orders Army card.'
  );

  const hybridPrerequisites = getNextTutorialMoment(
    baseContext({
      view: 'hybridResearch',
      tutorialSeen: [
        ...priorFantasySeen,
        'system:hybrid-discovery'
      ],
      hybridStoryUnlocked: true,
      hybridPrerequisitesMet: false
    })
  );

  expect(
    hybridPrerequisites?.key ===
      'system:hybrid-prerequisites',
    'Legendary Orders does not explain why Magic and Flying research are prerequisites.'
  );
  expect(
    !hybridPrerequisites?.focusAfterPrimary,
    'Locked legendary prerequisites should not spotlight a disabled research button.'
  );

  const hybridResearch = getNextTutorialMoment(
    baseContext({
      view: 'hybridResearch',
      tutorialSeen: [
        ...priorFantasySeen,
        'system:hybrid-discovery',
        'system:hybrid-prerequisites'
      ],
      hybridStoryUnlocked: true,
      hybridPrerequisitesMet: true
    })
  );

  expect(
    hybridResearch?.key ===
      'system:hybrid-research',
    'Legendary doctrine research is not introduced after prerequisites are complete.'
  );
  expect(
    hybridResearch?.focusAfterPrimary?.kind ===
      'research-start' &&
      hybridResearch.focusAfterPrimary.family ===
        'hybrid',
    'Legendary doctrine lesson does not spotlight Start Research.'
  );

  const hybridTraining = getNextTutorialMoment(
    baseContext({
      view: 'hybridResearch',
      tutorialSeen: [
        ...priorFantasySeen,
        'system:hybrid-discovery',
        'system:hybrid-prerequisites',
        'system:hybrid-research'
      ],
      hybridStoryUnlocked: true,
      hybridPrerequisitesMet: true,
      completedHybridResearch: 1
    })
  );

  expect(
    hybridTraining?.key ===
      'system:hybrid-training',
    'Completed legendary doctrine does not introduce repeatable hybrid training.'
  );
  expect(
    hybridTraining?.focusAfterPrimary?.kind ===
      'research-train' &&
      hybridTraining.focusAfterPrimary.family ===
        'hybrid',
    'Legendary training lesson does not spotlight the trainable hybrid.'
  );
}

function runReviewTimingCoverage() {
  const eligible = {
    activeFaction: 'human' as const,
    activeView: 'kingdom' as const,
    lastBattleResultId:
      'ch1_reclaim_outpost_result',
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
  runEnemyFantasyTutorialCoverage();
  runFantasyFamilyCoverage();
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
    'PASS: staged onboarding, faction-specific intros, non-repetitive pacing, transactional spotlight completion, first-unit/building guidance, fantasy enemy counter teaching, system unlock lessons, legacy-save behavior, post-Chapter-1 review timing and Android app identity remain protected.'
  );
}

main();
