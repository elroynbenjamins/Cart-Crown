import {
  SAVE_SCHEMA_VERSION,
  buildFactionSwitchSnapshot,
  createInitialGameSnapshot,
  createNewSaveRecord,
  createOrcFactionState,
  metadataFromSnapshot,
  normalizeSaveRecord
} from '../src/save/schema';
import type {
  GameSnapshot,
  SaveRecord
} from '../src/save/types';

const failures: string[] = [];

function check(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) throw new Error(message);
}

function expect(
  condition: unknown,
  message: string
) {
  if (!condition) failures.push(message);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalize(
  record: SaveRecord,
  slot: 1 | 2 = 1
) {
  return normalizeSaveRecord(
    slot,
    JSON.parse(JSON.stringify(record))
  );
}

function runFreshRoundTrip() {
  const record = createNewSaveRecord(1);
  const normalized = normalize(record);

  check(
    normalized,
    'Fresh save failed to normalize.'
  );

  const human =
    normalized.snapshot.factionStates.human;
  check(human, 'Fresh Human state disappeared.');

  expect(
    normalized.snapshot.schemaVersion ===
      SAVE_SCHEMA_VERSION,
    'Fresh save changed schema version.'
  );
  expect(
    normalized.snapshot.activeFaction === 'human',
    'Fresh save changed active faction.'
  );
  expect(
    human.armyReadiness === 100,
    'Fresh save did not retain 100 Readiness.'
  );
  expect(
    human.formationShapeId === 'balanced_333',
    'Fresh save changed starter formation shape.'
  );
  expect(
    (human.formationPresets ?? []).length === 0,
    'Fresh save unexpectedly created presets.'
  );
  expect(
    human.formation.filter(Boolean).length === 2,
    'Fresh save changed starter active squad count.'
  );
  expect(
    normalized.metadata.activeSquads === 2,
    'Fresh metadata active squad count drifted.'
  );
  expect(
    normalized.metadata.chapterLabel.includes(
      'Chapter 1'
    ),
    'Fresh metadata lost Chapter 1 label.'
  );
}

function runBackwardCompatibleV13Defaults() {
  const record = createNewSaveRecord(1);
  const human =
    record.snapshot.factionStates.human;
  check(human, 'Human state missing.');

  delete human.armyReadiness;
  delete human.formationShapeId;
  delete human.formationPresets;

  const normalized = normalize(record);
  check(
    normalized,
    'Older v13-compatible save failed normalization.'
  );
  const repaired =
    normalized.snapshot.factionStates.human;
  check(repaired, 'Repaired Human state missing.');

  expect(
    repaired.armyReadiness === 100,
    'Missing v13 Readiness did not default to 100.'
  );
  expect(
    repaired.formationShapeId ===
      'balanced_333',
    'Missing v13 formation shape did not default safely.'
  );
  expect(
    Array.isArray(repaired.formationPresets) &&
      repaired.formationPresets.length === 0,
    'Missing v13 formation presets did not default to empty.'
  );
}

function runCorruptionRepair() {
  const record = createNewSaveRecord(1);
  const human =
    record.snapshot.factionStates.human;
  check(human, 'Human state missing.');

  human.armyReadiness = 999;
  human.wagonStageId = 'camp';
  human.chapterNumber = 6;
  human.resources = {
    gold: -50,
    wood: 13.8,
    stone: -4,
    iron: 2.9,
    provisions: -9
  };

  human.units = [
    ...human.units,
    { ...human.units[0]! },
    {
      ...createOrcFactionState().units[0]!
    }
  ];

  human.formation = [
    'hum_militia',
    'hum_militia',
    'hum_recruit',
    'missing_unit',
    null,
    null,
    null,
    null,
    null
  ];

  human.formationShapeId =
    'heavy_front_441';
  human.formationDoctrineId =
    'human_volley';

  human.formationPresets = [
    {
      slotId: 1,
      formationShapeId: 'heavy_front_441',
      formationDoctrineId: 'human_hold',
      formation: [...human.formation]
    },
    {
      slotId: 2,
      formationShapeId: 'balanced_333',
      formationDoctrineId: 'human_hold',
      formation: [
        'hum_militia',
        'hum_militia',
        'hum_recruit',
        'missing_unit',
        null,
        null,
        null,
        null,
        null
      ]
    },
    {
      slotId: 2,
      formationShapeId: 'balanced_333',
      formationDoctrineId: 'human_hold',
      formation: [
        'hum_recruit',
        'hum_militia',
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ]
    },
    {
      slotId: 3,
      formationShapeId: 'balanced_333',
      formationDoctrineId: 'elf_open',
      formation: [
        'hum_militia',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ]
    }
  ];

  human.chapterNodes = [
    {
      id: 'ch6_node_1',
      name: 'Wrong Chapter',
      type: 'event',
      current: true,
      completed: false
    }
  ];

  human.expeditionTickets = -8;
  human.kingdomDefenseRuns = -3;
  human.productionStock = {
    gold: -1,
    wood: -2,
    stone: 4.7,
    iron: -4,
    provisions: 3.2
  };
  human.buildingLevels = {
    ...human.buildingLevels,
    forge: -5,
    barracks: 2.9
  };
  human.unlockedResourceSites = [
    'greenkeep_farms',
    'greenkeep_farms'
  ];

  record.snapshot.shared = {
    completedCampaigns: [
      'human',
      'human',
      'dragon' as never
    ],
    achievements: ['a', 'a'],
    lore: ['l', 'l'],
    cosmetics: ['c', 'c'],
    metaCampaignStep: 99,
    metaCampaignComplete: true
  };

  const normalized = normalize(record);
  check(
    normalized,
    'Corrupted but repairable save was rejected.'
  );

  const repaired =
    normalized.snapshot.factionStates.human;
  check(repaired, 'Repaired Human state missing.');

  expect(
    repaired.armyReadiness === 100,
    'Readiness was not clamped to 100.'
  );
  expect(
    repaired.chapterNumber === 1,
    'Camp-tier Human save did not repair to Chapter 1.'
  );
  expect(
    repaired.chapterNodes.some(
      node => node.id === 'node_1'
    ) &&
      !repaired.chapterNodes.some(
        node => node.id === 'ch6_node_1'
      ),
    'Wrong chapter-node set was not repaired.'
  );
  expect(
    repaired.resources.gold === 0 &&
      repaired.resources.wood === 13 &&
      repaired.resources.stone === 0 &&
      repaired.resources.iron === 2 &&
      repaired.resources.provisions === 0,
    'Resource wallet was not sanitized to finite non-negative integers.'
  );

  const activeIds =
    repaired.formation.filter(
      (id): id is string => Boolean(id)
    );
  expect(
    activeIds.length === 2 &&
      new Set(activeIds).size === 2 &&
      activeIds.includes('hum_militia') &&
      activeIds.includes('hum_recruit'),
    'Formation did not remove duplicate/stale units or respect Camp cap.'
  );
  expect(
    repaired.formationShapeId ===
      'balanced_333',
    'Locked formation shape was not repaired.'
  );
  expect(
    repaired.formationDoctrineId ===
      'human_hold',
    'Locked doctrine was not repaired to faction default.'
  );

  const presets =
    repaired.formationPresets ?? [];
  expect(
    presets.length === 1 &&
      presets[0]?.slotId === 2,
    'Invalid/locked/cross-faction presets were not removed or duplicate slots deduplicated.'
  );
  expect(
    presets[0]?.formation.filter(Boolean)
      .length === 2 &&
      new Set(
        presets[0]?.formation.filter(Boolean)
      ).size === 2,
    'Surviving formation preset was not sanitized.'
  );

  expect(
    repaired.expeditionTickets === 0 &&
      repaired.kingdomDefenseRuns === 0,
    'Negative run counters were not repaired.'
  );
  expect(
    repaired.productionStock.gold === 0 &&
      repaired.productionStock.wood === 0 &&
      repaired.productionStock.stone === 4 &&
      repaired.productionStock.iron === 0 &&
      repaired.productionStock.provisions === 3,
    'Production stock was not sanitized.'
  );
  expect(
    repaired.buildingLevels.forge === 0 &&
      repaired.buildingLevels.barracks === 2,
    'Building levels were not sanitized.'
  );
  expect(
    repaired.unlockedResourceSites.length === 1,
    'Duplicate unlocked resource sites were not deduplicated.'
  );

  expect(
    normalized.snapshot.shared.completedCampaigns.length ===
      1 &&
      normalized.snapshot.shared.completedCampaigns[0] ===
        'human',
    'Shared completed campaigns were not sanitized.'
  );
  expect(
    normalized.snapshot.shared.metaCampaignStep === 5 &&
      normalized.snapshot.shared.metaCampaignComplete ===
        false,
    'Meta campaign state was not clamped/locked to valid campaign completion.'
  );
  expect(
    normalized.snapshot.shared.achievements.length ===
      1 &&
      normalized.snapshot.shared.lore.length === 1 &&
      normalized.snapshot.shared.cosmetics.length === 1,
    'Shared string collections were not deduplicated.'
  );
  expect(
    normalized.metadata.activeSquads === 2,
    'Metadata did not reflect sanitized formation.'
  );
}

function runActiveFactionRepair() {
  const record = createNewSaveRecord(1);

  record.snapshot.activeFaction = 'elf';
  record.snapshot.factionStates.elf = null;

  const normalized = normalize(record);
  check(
    normalized,
    'Save with broken active-faction pointer was rejected.'
  );
  expect(
    normalized.snapshot.activeFaction === 'human',
    'Broken active-faction pointer did not fall back to Human.'
  );

  const wrongKey = createNewSaveRecord(1);
  wrongKey.snapshot.shared.completedCampaigns = [
    'human'
  ];
  wrongKey.snapshot.activeFaction = 'elf';
  wrongKey.snapshot.factionStates.elf =
    createOrcFactionState();

  const wrongNormalized = normalize(wrongKey);
  check(
    wrongNormalized,
    'Save with wrong faction state under Elf key was rejected entirely.'
  );
  expect(
    wrongNormalized.snapshot.factionStates.elf ===
      null &&
      wrongNormalized.snapshot.activeFaction ===
        'human',
    'Wrong-key faction state was not discarded and active faction repaired.'
  );
}

function runUnrecoverableSaveRejection() {
  const record = createNewSaveRecord(1);
  record.snapshot.factionStates = {
    human: createOrcFactionState() as never,
    elf: createOrcFactionState() as never,
    orc: null
  };
  record.snapshot.activeFaction = 'human';

  expect(
    normalize(record) === null,
    'Save with no valid faction state should be rejected.'
  );

  const wrongSchema = createNewSaveRecord(1);
  (
    wrongSchema.snapshot as unknown as {
      schemaVersion: number;
    }
  ).schemaVersion = 999;

  expect(
    normalize(wrongSchema) === null,
    'Unknown schema version should be rejected.'
  );
}

function runFactionSwitchRoundTrip() {
  const snapshot = createInitialGameSnapshot();
  const currentHuman =
    snapshot.factionStates.human;
  check(currentHuman, 'Human state missing.');

  currentHuman.resources = {
    ...currentHuman.resources,
    gold: 777
  };
  currentHuman.armyReadiness = 55;

  expect(
    buildFactionSwitchSnapshot(
      snapshot,
      currentHuman,
      'orc'
    ) === null,
    'Orc faction switch was allowed before Human completion.'
  );

  snapshot.shared.completedCampaigns = [
    'human'
  ];

  const toElf = buildFactionSwitchSnapshot(
    snapshot,
    currentHuman,
    'elf'
  );
  check(
    toElf,
    'Elf switch failed after Human completion.'
  );
  expect(
    toElf.activeFaction === 'elf',
    'Elf switch did not update active faction.'
  );
  expect(
    toElf.factionStates.human?.resources.gold ===
      777 &&
      toElf.factionStates.human?.armyReadiness ===
        55,
    'Human current state was not preserved during faction switch.'
  );
  check(
    toElf.factionStates.elf,
    'Elf state was not created on first switch.'
  );

  const currentElf = clone(
    toElf.factionStates.elf
  );
  currentElf.resources.gold = 333;
  currentElf.armyReadiness = 73;

  const backHuman = buildFactionSwitchSnapshot(
    toElf,
    currentElf,
    'human'
  );
  check(
    backHuman,
    'Switch back to Human failed.'
  );
  expect(
    backHuman.activeFaction === 'human',
    'Switch back did not restore Human as active faction.'
  );
  expect(
    backHuman.factionStates.elf?.resources.gold ===
      333 &&
      backHuman.factionStates.elf?.armyReadiness ===
        73,
    'Elf current state was not preserved when switching away.'
  );
  expect(
    backHuman.factionStates.human?.resources.gold ===
      777 &&
      backHuman.factionStates.human?.armyReadiness ===
        55,
    'Stored Human state changed after returning from Elf.'
  );

  const switchRecord: SaveRecord = {
    snapshot: backHuman,
    metadata: metadataFromSnapshot(
      2,
      backHuman
    )
  };

  const reloaded = normalize(
    switchRecord,
    2
  );
  check(
    reloaded,
    'Faction-switched snapshot failed JSON save/reload.'
  );
  expect(
    reloaded.snapshot.factionStates.human
      ?.resources.gold === 777 &&
      reloaded.snapshot.factionStates.elf
        ?.resources.gold === 333,
    'Faction-specific resource state did not survive save/reload.'
  );
  expect(
    reloaded.snapshot.factionStates.human
      ?.armyReadiness === 55 &&
      reloaded.snapshot.factionStates.elf
        ?.armyReadiness === 73,
    'Faction-specific Readiness did not survive save/reload.'
  );
  expect(
    reloaded.metadata.slotId === 2 &&
      reloaded.metadata.faction === 'human',
    'Metadata did not follow the active faction after round trip.'
  );
}

function runMultiFactionMetadata() {
  const snapshot: GameSnapshot =
    createInitialGameSnapshot();
  snapshot.shared.completedCampaigns = [
    'human'
  ];
  snapshot.factionStates.elf =
    clone(
      buildFactionSwitchSnapshot(
        snapshot,
        snapshot.factionStates.human!,
        'elf'
      )!.factionStates.elf
    );
  snapshot.factionStates.orc =
    createOrcFactionState();
  snapshot.activeFaction = 'orc';

  const orc = snapshot.factionStates.orc;
  check(orc, 'Orc state missing.');
  orc.formation = [
    'orc_youngblood',
    'orc_hunter',
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ];

  const metadata = metadataFromSnapshot(
    1,
    snapshot
  );

  expect(
    metadata.faction === 'orc' &&
      metadata.activeSquads === 2 &&
      metadata.elfCampaignUnlocked &&
      metadata.orcCampaignUnlocked,
    'Multi-faction slot metadata does not reflect active Orc state and Human unlock.'
  );
}

function main() {
  runFreshRoundTrip();
  runBackwardCompatibleV13Defaults();
  runCorruptionRepair();
  runActiveFactionRepair();
  runUnrecoverableSaveRejection();
  runFactionSwitchRoundTrip();
  runMultiFactionMetadata();

  if (failures.length > 0) {
    console.error(
      '\nSAVE REGRESSION FAILURES (' +
        failures.length +
        '):'
    );
    failures.forEach((failure, index) => {
      console.error(
        String(index + 1) +
          '. ' +
          failure
      );
    });
    throw new Error(
      String(failures.length) +
        ' save-integrity guardrail(s) failed.'
    );
  }

  console.log(
    'PASS: fresh saves, older v13 optional fields, corruption repair, stage/chapter coherence, formation/preset sanitization, active-faction repair, faction switching, JSON round trips and metadata remain valid.'
  );
}

main();
