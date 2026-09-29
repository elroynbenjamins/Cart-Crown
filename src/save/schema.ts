import {
  chapterOneNodes,
  starterResources,
  starterUnits,
  starterWagonItems,
  wagonStages
} from '../game/data';
import { clampArmyReadiness } from '../game/balance';
import { getCampaignCapacity } from '../game/campaignCapacity';
import {
  formationShapes,
  getFactionDoctrines
} from '../game/formation';
import { initialHumanPlacements } from '../game/settlement';
import {
  CORE_TUTORIAL_KEYS,
  SYSTEM_TUTORIAL_KEYS,
  tutorialBuildingKey,
  tutorialUnitKey
} from '../game/tutorial';
import { chapterTwoNodes } from '../game/chapter2';
import { chapterThreeNodes } from '../game/chapter3';
import { chapterFourNodes } from '../game/chapter4';
import { chapterFiveNodes } from '../game/chapter5';
import { chapterSixNodes } from '../game/chapter6';
import {
  elfChapterTwoNodes,
  elfChapterThreeNodes,
  orcChapterTwoNodes,
  orcChapterThreeNodes
} from '../game/factionChapter2';
import {
  elfChapterFourNodes,
  orcChapterFourNodes
} from '../game/factionChapter3';
import {
  elfChapterFiveNodes,
  orcChapterFiveNodes
} from '../game/factionChapter4';
import {
  elfChapterSixNodes,
  orcChapterSixNodes
} from '../game/factionChapter5';
import {
  elfChapterOneNodes,
  elfStarterResources,
  elfStarterUnits,
  factionStarterWagonItems,
  orcChapterOneNodes,
  orcStarterResources,
  orcStarterUnits
} from '../game/factionStarts';
import type {
  ChapterNode,
  FactionId,
  FormationPreset,
  FormationShapeId,
  ResourceWallet,
  UnitDefinition
} from '../game/types';
import type {
  FactionGameState,
  GameSnapshot,
  SaveRecord,
  SaveSlotId,
  SaveSlotMetadata
} from './types';

export const SAVE_SCHEMA_VERSION = 13;

const factionOrder: FactionId[] = ['human', 'elf', 'orc'];

const saveStageRank: Record<string, number> = {
  camp: 0,
  settlement: 1,
  fort: 2,
  town: 3,
  stronghold: 4,
  capital: 5,
  grand: 6
};

const formationUnlockRank = {
  Start: 0,
  Settlement: 1,
  Fort: 2,
  Town: 3,
  Stronghold: 4
} as const;

function validStageForFaction(
  faction: FactionId,
  value: unknown,
  fallback: string
) {
  const validIds =
    faction === 'human'
      ? new Set([
          'camp',
          'settlement',
          'fort',
          'town',
          'stronghold',
          'capital',
          'grand'
        ])
      : new Set([
          'camp',
          'settlement',
          'fort',
          'town',
          'stronghold',
          'capital'
        ]);

  return typeof value === 'string' &&
    validIds.has(value)
    ? value
    : fallback;
}

function expectedChapterForStage(
  faction: FactionId,
  stageId: string
) {
  if (faction === 'human') {
    return stageId === 'grand'
      ? 6
      : stageId === 'capital'
        ? 5
        : stageId === 'stronghold'
          ? 4
          : stageId === 'town'
            ? 3
            : stageId === 'fort'
              ? 2
              : 1;
  }

  return stageId === 'capital'
    ? 6
    : stageId === 'stronghold'
      ? 5
      : stageId === 'town'
        ? 4
        : stageId === 'fort'
          ? 3
          : stageId === 'settlement'
            ? 2
            : 1;
}

function nodesForChapter(
  faction: FactionId,
  chapter: number
): ChapterNode[] {
  if (faction === 'human') {
    if (chapter === 2) return chapterTwoNodes;
    if (chapter === 3) return chapterThreeNodes;
    if (chapter === 4) return chapterFourNodes;
    if (chapter === 5) return chapterFiveNodes;
    if (chapter >= 6) return chapterSixNodes;
    return chapterOneNodes;
  }

  if (faction === 'elf') {
    if (chapter === 2) return elfChapterTwoNodes;
    if (chapter === 3) return elfChapterThreeNodes;
    if (chapter === 4) return elfChapterFourNodes;
    if (chapter === 5) return elfChapterFiveNodes;
    if (chapter >= 6) return elfChapterSixNodes;
    return elfChapterOneNodes;
  }

  if (chapter === 2) return orcChapterTwoNodes;
  if (chapter === 3) return orcChapterThreeNodes;
  if (chapter === 4) return orcChapterFourNodes;
  if (chapter === 5) return orcChapterFiveNodes;
  if (chapter >= 6) return orcChapterSixNodes;
  return orcChapterOneNodes;
}

function nonNegativeInteger(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : fallback;
}

function sanitizeWallet(
  value: unknown,
  fallback: ResourceWallet
): ResourceWallet {
  const source =
    value && typeof value === 'object'
      ? (value as Partial<ResourceWallet>)
      : {};

  return {
    gold: nonNegativeInteger(source.gold, fallback.gold),
    wood: nonNegativeInteger(source.wood, fallback.wood),
    stone: nonNegativeInteger(source.stone, fallback.stone),
    iron: nonNegativeInteger(source.iron, fallback.iron),
    provisions: nonNegativeInteger(
      source.provisions,
      fallback.provisions
    )
  };
}

function sanitizeUnits(
  value: unknown,
  faction: FactionId,
  fallback: UnitDefinition[]
) {
  if (!Array.isArray(value)) {
    return fallback.map(unit => ({ ...unit }));
  }

  const seen = new Set<string>();
  const units = value
    .filter(
      (candidate): candidate is UnitDefinition =>
        Boolean(
          candidate &&
            typeof candidate === 'object' &&
            typeof candidate.id === 'string' &&
            candidate.faction === faction &&
            !seen.has(candidate.id)
        )
    )
    .map(unit => {
      seen.add(unit.id);
      return { ...unit };
    });

  return units.length > 0
    ? units
    : fallback.map(unit => ({ ...unit }));
}

function sanitizeNodes(
  value: unknown,
  fallback: ChapterNode[]
): ChapterNode[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback.map(node => ({ ...node }));
  }

  const allowedIds = new Set(
    fallback.map(node => node.id)
  );
  const nodes = value.filter(
    (node): node is ChapterNode =>
      Boolean(
        node &&
          typeof node === 'object' &&
          typeof node.id === 'string' &&
          typeof node.name === 'string' &&
          allowedIds.has(node.id)
      )
  );

  if (
    nodes.length !== fallback.length ||
    new Set(nodes.map(node => node.id)).size !==
      fallback.length
  ) {
    return fallback.map(node => ({ ...node }));
  }

  let currentKept = false;
  return nodes.map(node => {
    if (!node.current) {
      return { ...node };
    }

    if (!currentKept) {
      currentKept = true;
      return { ...node, current: true };
    }

    return { ...node, current: false };
  });
}

function sanitizeFormation(
  value: unknown,
  units: UnitDefinition[],
  deploymentCap: number
): Array<string | null> {
  const validUnitIds = new Set(
    units.map(unit => unit.id)
  );
  const seen = new Set<string>();
  const cap = Math.max(1, Math.min(9, deploymentCap));
  let active = 0;

  return Array.from({ length: 9 }, (_, index) => {
    const candidate =
      Array.isArray(value) && typeof value[index] === 'string'
        ? value[index]
        : null;

    if (
      !candidate ||
      !validUnitIds.has(candidate) ||
      seen.has(candidate) ||
      active >= cap
    ) {
      return null;
    }

    seen.add(candidate);
    active += 1;
    return candidate;
  });
}

function validShapeForStage(
  value: unknown,
  stageId: string
): FormationShapeId {
  const rank = saveStageRank[stageId] ?? 0;
  const shape = formationShapes.find(
    candidate => candidate.id === value
  );

  return shape &&
    rank >= formationUnlockRank[shape.unlock]
    ? shape.id
    : 'balanced_333';
}

function validDoctrineForStage(
  value: unknown,
  faction: FactionId,
  stageId: string,
  fallback: string
) {
  const rank = saveStageRank[stageId] ?? 0;
  const doctrines = getFactionDoctrines(faction);
  const doctrine = doctrines.find(
    candidate => candidate.id === value
  );

  if (
    doctrine &&
    rank >= formationUnlockRank[doctrine.unlock]
  ) {
    return doctrine.id;
  }

  const defaultDoctrine = doctrines.find(
    candidate => candidate.id === fallback
  );
  return defaultDoctrine?.id ?? doctrines[0]?.id ?? fallback;
}

function sanitizePresets(
  value: unknown,
  units: UnitDefinition[],
  faction: FactionId,
  stageId: string,
  deploymentCap: number
): FormationPreset[] {
  if (!Array.isArray(value)) return [];

  const rank = saveStageRank[stageId] ?? 0;
  const validUnitIds = new Set(
    units.map(unit => unit.id)
  );
  const cap = Math.max(1, Math.min(9, deploymentCap));
  const doctrines = getFactionDoctrines(faction);
  const bySlot = new Map<number, FormationPreset>();

  for (const raw of value) {
    if (
      !raw ||
      typeof raw !== 'object' ||
      ![1, 2, 3].includes(raw.slotId) ||
      !Array.isArray(raw.formation)
    ) {
      continue;
    }

    const shape = formationShapes.find(
      candidate =>
        candidate.id === raw.formationShapeId &&
        rank >= formationUnlockRank[candidate.unlock]
    );
    const doctrine = doctrines.find(
      candidate =>
        candidate.id === raw.formationDoctrineId &&
        rank >= formationUnlockRank[candidate.unlock]
    );

    if (!shape || !doctrine) continue;

    const seen = new Set<string>();
    let active = 0;
    const formation = Array.from(
      { length: 9 },
      (_, index) => {
        const unitId =
          typeof raw.formation[index] === 'string'
            ? raw.formation[index]
            : null;

        if (
          !unitId ||
          !validUnitIds.has(unitId) ||
          seen.has(unitId) ||
          active >= cap
        ) {
          return null;
        }

        seen.add(unitId);
        active += 1;
        return unitId;
      }
    );

    if (active === 0) continue;

    bySlot.set(raw.slotId, {
      slotId: raw.slotId,
      formationShapeId: shape.id,
      formationDoctrineId: doctrine.id,
      formation
    });
  }

  return [...bySlot.values()].sort(
    (a, b) => a.slotId - b.slotId
  );
}

function sanitizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter(
        (entry): entry is string =>
          typeof entry === 'string'
      )
    )
  ];
}

export function sanitizeFactionGameState(
  faction: FactionId,
  value: unknown
): FactionGameState | null {
  if (
    !value ||
    typeof value !== 'object' ||
    (value as Partial<FactionGameState>).faction !== faction
  ) {
    return null;
  }

  const stored = value as Partial<FactionGameState>;
  const defaults = createFactionGameState(faction);
  const definedStored = Object.fromEntries(
    Object.entries(stored).filter(
      ([, entry]) => entry !== undefined
    )
  ) as Partial<FactionGameState>;

  const stageId = validStageForFaction(
    faction,
    stored.wagonStageId,
    defaults.wagonStageId
  );
  const chapterNumber = expectedChapterForStage(
    faction,
    stageId
  );
  const chapterDefaults = nodesForChapter(
    faction,
    chapterNumber
  );

  const units = sanitizeUnits(
    stored.units,
    faction,
    defaults.units
  );
  const chapterNodes = sanitizeNodes(
    stored.chapterNodes,
    chapterDefaults
  );
  const campaignCapacity = getCampaignCapacity(
    faction,
    chapterNumber,
    chapterNodes
  );
  const formation = sanitizeFormation(
    stored.formation,
    units,
    campaignCapacity.deploymentCap
  );
  const formationShapeId = validShapeForStage(
    stored.formationShapeId,
    stageId
  );
  const formationDoctrineId = validDoctrineForStage(
    stored.formationDoctrineId,
    faction,
    stageId,
    defaults.formationDoctrineId
  );

  const storedTutorialSeen = sanitizeStringArray(
    stored.tutorialSeen
  );
  const progressedLegacySave =
    stored.tutorialSeen === undefined &&
    (
      chapterNumber > 1 ||
      Boolean(stored.holdTheRoadWon) ||
      Boolean(stored.settlementUpgraded) ||
      Boolean(stored.recruitChosen) ||
      Boolean(stored.firstPromotionComplete) ||
      Boolean(stored.commanderPathId)
    );

  const tutorialSeen = progressedLegacySave
    ? [
        ...new Set([
          ...CORE_TUTORIAL_KEYS,
          ...SYSTEM_TUTORIAL_KEYS,
          ...units
            .filter(
              unit =>
                !defaults.units.some(
                  starter => starter.id === unit.id
                )
            )
            .map(unit => tutorialUnitKey(unit.id)),
          ...Object.keys(
            stored.buildingLevels ?? {}
          ).map(tutorialBuildingKey)
        ])
      ]
    : storedTutorialSeen;

  return {
    ...defaults,
    ...definedStored,
    faction,
    chapterNumber,
    resources: sanitizeWallet(
      stored.resources,
      defaults.resources
    ),
    units,
    formation,
    formationShapeId,
    formationPresets: sanitizePresets(
      stored.formationPresets,
      units,
      faction,
      stageId,
      campaignCapacity.deploymentCap
    ),
    wagonItems: Array.isArray(stored.wagonItems)
      ? stored.wagonItems.map(item => ({ ...item }))
      : defaults.wagonItems.map(item => ({ ...item })),
    wagonStageId: stageId,
    armyReadiness: clampArmyReadiness(
      typeof stored.armyReadiness === 'number'
        ? stored.armyReadiness
        : defaults.armyReadiness ?? 100
    ),
    chapterNodes,
    formationDoctrineId,
    equipmentInventory: sanitizeStringArray(
      stored.equipmentInventory
    ),
    buildingLevels:
      stored.buildingLevels &&
      typeof stored.buildingLevels === 'object'
        ? Object.fromEntries(
            Object.entries(stored.buildingLevels).map(
              ([id, level]) => [
                id,
                nonNegativeInteger(level, 0)
              ]
            )
          )
        : { ...defaults.buildingLevels },
    buildingPlacements:
      stored.buildingPlacements &&
      typeof stored.buildingPlacements === 'object'
        ? { ...stored.buildingPlacements }
        : { ...defaults.buildingPlacements },
    unlockedResourceSites: sanitizeStringArray(
      stored.unlockedResourceSites
    ),
    productionStock: sanitizeWallet(
      stored.productionStock,
      defaults.productionStock
    ),
    kingdomDefenseRuns: nonNegativeInteger(
      stored.kingdomDefenseRuns,
      defaults.kingdomDefenseRuns
    ),
    expeditionTickets: nonNegativeInteger(
      stored.expeditionTickets,
      defaults.expeditionTickets
    ),
    expeditionRunsCompleted: nonNegativeInteger(
      stored.expeditionRunsCompleted,
      defaults.expeditionRunsCompleted
    ),
    tutorialSeen
  };
}

function sanitizeSharedProgress(
  value: unknown
): GameSnapshot['shared'] {
  const source =
    value && typeof value === 'object'
      ? (value as Partial<GameSnapshot['shared']>)
      : {};

  const completedCampaigns = [
    ...new Set(
      (Array.isArray(source.completedCampaigns)
        ? source.completedCampaigns
        : []
      ).filter(
        (faction): faction is FactionId =>
          factionOrder.includes(faction)
      )
    )
  ];

  return {
    completedCampaigns,
    achievements: sanitizeStringArray(
      source.achievements
    ),
    lore: sanitizeStringArray(source.lore),
    cosmetics: sanitizeStringArray(source.cosmetics),
    metaCampaignStep: Math.min(
      5,
      nonNegativeInteger(
        source.metaCampaignStep,
        0
      )
    ),
    metaCampaignComplete:
      Boolean(source.metaCampaignComplete) &&
      completedCampaigns.length === 3,
    reviewPromptShown:
      Boolean(source.reviewPromptShown)
  };
}

export function buildFactionSwitchSnapshot(
  snapshot: GameSnapshot,
  currentFactionState: FactionGameState,
  targetFaction: FactionId
): GameSnapshot | null {
  if (targetFaction === snapshot.activeFaction) {
    return {
      ...snapshot,
      factionStates: {
        ...snapshot.factionStates,
        [snapshot.activeFaction]: currentFactionState
      }
    };
  }

  if (
    targetFaction !== 'human' &&
    !snapshot.shared.completedCampaigns.includes(
      'human'
    )
  ) {
    return null;
  }

  const targetState =
    sanitizeFactionGameState(
      targetFaction,
      snapshot.factionStates[targetFaction]
    ) ?? createFactionGameState(targetFaction);

  return {
    ...snapshot,
    activeFaction: targetFaction,
    factionStates: {
      ...snapshot.factionStates,
      [snapshot.activeFaction]:
        sanitizeFactionGameState(
          snapshot.activeFaction,
          currentFactionState
        ) ?? currentFactionState,
      [targetFaction]: targetState
    }
  };
}


export function createHumanFactionState(): FactionGameState {
  return {
    faction: 'human',
    chapterNumber: 1,
    resources: { ...starterResources },
    units: starterUnits.map(unit => ({ ...unit })),
    formation: [
      'hum_recruit',
      'hum_militia',
      null,
      null,
      null,
      null,
      null,
      'hum_hunter',
      null
    ],
    formationShapeId: 'balanced_333',
    formationPresets: [],
    wagonItems: starterWagonItems.map(item => ({ ...item })),
    wagonStageId: 'camp',
    armyReadiness: 100,
    chapterNodes: chapterOneNodes.map(node => ({ ...node })),
    formationDoctrineId: 'human_hold',
    holdTheRoadWon: false,
    settlementUpgraded: false,
    recruitChoiceAvailable: false,
    recruitChosen: false,
    markedRaidersInvestigated: false,
    forgeUnlocked: false,
    firstPromotionComplete: false,
    equipmentInventory: [],
    unitEquipment: {},
    mercenaryPatrolWon: false,
    commanderChoiceUnlocked: false,
    commanderPathId: null,
    refugeeCampSecured: false,
    buildingLevels: {
      hall: 1,
      barracks: 1,
      forge: 0,
      wagonwright: 1,
      quartermaster: 0,
      war_room: 0,
      stable: 0,
      signal_tower: 0,
      officer_academy: 0
    },
    buildingPlacements: { ...initialHumanPlacements },
    fourthRecruitChoiceAvailable: false,
    fourthRecruitChosen: false,
    unlockedResourceSites: [],
    productionStock: { gold: 0, wood: 0, stone: 0, iron: 0, provisions: 0 },
    kingdomDefenseCompleted: false,
    kingdomDefenseRuns: 0,
    signalTowerUnlocked: false,
    ironProvostWon: false,
    marcherWarningChoiceId: null,
    dividedMarchResolved: false,
    lordMarshalWon: false,
    lastLoyalistsChoiceId: null,
    pretenderGeneralWon: false,
    royalDecreeId: null,
    factionMandateId: null,
    lastBattleResult: null,
    expeditionTickets: 1,
    expeditionRunsCompleted: 0,
    formationTrialCompleted: false,
    tutorialSeen: []
  };
}

export function createElfFactionState(): FactionGameState {
  const state = createHumanFactionState();

  return {
    ...state,
    faction: 'elf',
    resources: { ...elfStarterResources },
    units: elfStarterUnits.map(unit => ({ ...unit })),
    formation: [
      null,
      'elf_warden',
      null,
      null,
      'elf_forest_scout',
      null,
      null,
      'elf_young_archer',
      null
    ],
    wagonItems: factionStarterWagonItems(),
    chapterNumber: 1,
    chapterNodes: elfChapterOneNodes.map(node => ({ ...node })),
    formationDoctrineId: 'elf_open',
    buildingLevels: {
      elf_heartgrove_hall: 0,
      elf_warden_lodge: 0,
      elf_moon_forge: 0,
      elf_caravan_grove: 0,
      elf_spirit_stores: 0,
      elf_council_glade: 0,
      elf_stag_enclosure: 0,
      elf_ward_beacon: 0
    },
    buildingPlacements: {
      plot_nw: null,
      plot_n: null,
      plot_ne: null,
      plot_w: null,
      plot_center: null,
      plot_e: null,
      plot_sw: null,
      plot_s: null,
      plot_se: null
    }
  };
}

export function createOrcFactionState(): FactionGameState {
  const state = createHumanFactionState();

  return {
    ...state,
    faction: 'orc',
    resources: { ...orcStarterResources },
    units: orcStarterUnits.map(unit => ({ ...unit })),
    formation: [
      'orc_youngblood',
      null,
      'orc_spearhand',
      null,
      'orc_hunter',
      null,
      null,
      null,
      null
    ],
    wagonItems: factionStarterWagonItems(),
    chapterNumber: 1,
    chapterNodes: orcChapterOneNodes.map(node => ({ ...node })),
    formationDoctrineId: 'orc_warband',
    buildingLevels: {
      orc_warhold: 0,
      orc_clan_yard: 0,
      orc_bone_forge: 0,
      orc_cartwright: 0,
      orc_smokehouse: 0,
      orc_war_council: 0,
      orc_warg_pens: 0,
      orc_watchfire: 0
    },
    buildingPlacements: {
      plot_nw: null,
      plot_n: null,
      plot_ne: null,
      plot_w: null,
      plot_center: null,
      plot_e: null,
      plot_sw: null,
      plot_s: null,
      plot_se: null
    }
  };
}

export function createFactionGameState(
  faction: FactionId
): FactionGameState {
  if (faction === 'elf') return createElfFactionState();
  if (faction === 'orc') return createOrcFactionState();
  return createHumanFactionState();
}

export function createInitialGameSnapshot(): GameSnapshot {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    activeFaction: 'human',
    shared: {
      completedCampaigns: [],
      achievements: [],
      lore: [],
      cosmetics: [],
      metaCampaignStep: 0,
      metaCampaignComplete: false,
      reviewPromptShown: false
    },
    factionStates: {
      human: createHumanFactionState(),
      elf: null,
      orc: null
    }
  };
}

export function metadataFromSnapshot(
  slotId: SaveSlotId,
  snapshot: GameSnapshot,
  existing?: SaveSlotMetadata
): SaveSlotMetadata {
  const now = new Date().toISOString();
  const current =
    snapshot.factionStates[snapshot.activeFaction] ??
    snapshot.factionStates.human ??
    createHumanFactionState();

  const humanComplete = snapshot.shared.completedCampaigns.includes('human');

  let chapterLabel = 'Chapter 1 · Hold the Road';

  if (current.faction === 'elf') {
    chapterLabel =
      current.chapterNumber >= 6
        ? snapshot.shared.completedCampaigns.includes('elf')
          ? 'Elf Campaign Complete · Root Seal'
          : current.chapterNodes.find(node => node.id === 'elf6_node_6')?.current
            ? 'Elf Chapter 6 · Return through the Roots'
            : current.chapterNodes.find(node => node.id === 'elf6_node_5')?.current
              ? 'Elf Chapter 6 · The Root Seal'
              : current.chapterNodes.find(node => node.id === 'elf6_node_4')?.current
                ? 'Elf Chapter 6 · Ashen Starwatch'
                : current.chapterNodes.find(node => node.id === 'elf6_node_3')?.current
                  ? 'Elf Chapter 6 · Concord Rootway'
                  : current.chapterNodes.find(node => node.id === 'elf6_node_2')?.current
                    ? 'Elf Chapter 6 · Stars over Crownspire'
                    : 'Elf Chapter 6 · Starroot Council'
        : current.chapterNumber === 5
          ? current.chapterNodes.find(node => node.id === 'elf5_node_6')?.current
            ? 'Elf Chapter 5 · Worldroot Guardian'
            : current.chapterNodes.find(node => node.id === 'elf5_node_5')?.current
              ? 'Elf Chapter 5 · Echo of the Root Seal'
              : current.chapterNodes.find(node => node.id === 'elf5_node_4')?.current
                ? 'Elf Chapter 5 · Ashen Rootkeepers'
                : current.chapterNodes.find(node => node.id === 'elf5_node_3')?.current
                  ? 'Elf Chapter 5 · Rootscar Records'
                  : current.chapterNodes.find(node => node.id === 'elf5_node_2')?.current
                    ? 'Elf Chapter 5 · The Wounded Worldroot'
                    : 'Elf Chapter 5 · Worldroot Muster'
        : current.chapterNumber === 4
          ? current.chapterNodes.find(node => node.id === 'elf4_node_6')?.current
            ? 'Elf Chapter 4 · Ashen Druid'
            : current.chapterNodes.find(node => node.id === 'elf4_node_5')?.current
              ? 'Elf Chapter 4 · Living Root Council'
              : current.chapterNodes.find(node => node.id === 'elf4_node_4')?.current
                ? 'Elf Chapter 4 · Two Fronts'
                : current.chapterNodes.find(node => node.id === 'elf4_node_3')?.current
                  ? 'Elf Chapter 4 · The Burned Ward'
                  : current.chapterNodes.find(node => node.id === 'elf4_node_2')?.current
                    ? 'Elf Chapter 4 · Roots in Ash'
                    : 'Elf Chapter 4 · Ashen Grove Muster'
        : current.chapterNumber === 3
          ? current.chapterNodes.find(node => node.id === 'elf3_node_6')?.current
            ? 'Elf Chapter 3 · The Pale Ranger'
            : current.chapterNodes.find(node => node.id === 'elf3_node_5')?.current
              ? 'Elf Chapter 3 · Rootway Council'
              : current.chapterNodes.find(node => node.id === 'elf3_node_4')?.current
                ? 'Elf Chapter 3 · Ashen Groves'
                : current.chapterNodes.find(node => node.id === 'elf3_node_3')?.current
                  ? 'Elf Chapter 3 · Silent Beacons'
                  : current.chapterNodes.find(node => node.id === 'elf3_node_2')?.current
                    ? 'Elf Chapter 3 · Moonlit Pass'
                    : 'Elf Chapter 3 · Moonlit Pass Muster'
        : current.chapterNumber === 2
          ? current.chapterNodes.find(node => node.id === 'elf2_node_6')?.current
            ? 'Elf Chapter 2 · Ashroot Stalker'
            : current.chapterNodes.find(node => node.id === 'elf2_node_5')?.current
              ? 'Elf Chapter 2 · Root Council'
              : current.chapterNodes.find(node => node.id === 'elf2_node_4')?.current
                ? 'Elf Chapter 2 · Ward Hunters'
                : current.chapterNodes.find(node => node.id === 'elf2_node_3')?.current
                  ? 'Elf Chapter 2 · Moonwell Grove'
                  : current.chapterNodes.find(node => node.id === 'elf2_node_2')?.current
                    ? 'Elf Chapter 2 · The Last Heartgrove'
                    : 'Elf Chapter 2 · Sanctuary Muster'
          : current.commanderChoiceUnlocked
            ? current.commanderPathId
              ? 'Elf Chapter 1 Complete · Build Sanctuary'
              : 'Elf Chapter 1 Complete · Choose Commander'
            : current.chapterNodes.find(node => node.id === 'elf_node_6')?.current
              ? 'Elf Chapter 1 · The Hollow Warden'
              : current.chapterNodes.find(node => node.id === 'elf_node_5')?.current
                ? 'Elf Chapter 1 · Wayfarer Camp'
                : current.chapterNodes.find(node => node.id === 'elf_node_4')?.current
                  ? 'Elf Chapter 1 · Ashen Tracks'
                  : current.chapterNodes.find(node => node.id === 'elf_node_3')?.current
                    ? 'Elf Chapter 1 · Whispering Roots'
                    : 'Elf Chapter 1 · Wardbreakers';
  } else if (current.faction === 'orc') {
    chapterLabel =
      current.chapterNumber >= 6
        ? snapshot.shared.completedCampaigns.includes('orc')
          ? 'Orc Campaign Complete · Clan Seal'
          : current.chapterNodes.find(node => node.id === 'orc6_node_6')?.current
            ? 'Orc Chapter 6 · Truth at Crownspire'
            : current.chapterNodes.find(node => node.id === 'orc6_node_5')?.current
              ? 'Orc Chapter 6 · The Clan Seal'
              : current.chapterNodes.find(node => node.id === 'orc6_node_4')?.current
                ? 'Orc Chapter 6 · Ashen Warfires'
                : current.chapterNodes.find(node => node.id === 'orc6_node_3')?.current
                  ? 'Orc Chapter 6 · Concord Warpath'
                  : current.chapterNodes.find(node => node.id === 'orc6_node_2')?.current
                    ? 'Orc Chapter 6 · The Truth at Crownspire'
                    : 'Orc Chapter 6 · Confederacy Council'
        : current.chapterNumber === 5
          ? current.chapterNodes.find(node => node.id === 'orc5_node_6')?.current
            ? 'Orc Chapter 5 · Last Clanbreaker'
            : current.chapterNodes.find(node => node.id === 'orc5_node_5')?.current
              ? 'Orc Chapter 5 · Echo of the Clan Seal'
              : current.chapterNodes.find(node => node.id === 'orc5_node_4')?.current
                ? 'Orc Chapter 5 · Ashen Clanbreakers'
                : current.chapterNodes.find(node => node.id === 'orc5_node_3')?.current
                  ? 'Orc Chapter 5 · Missing Warfires'
                  : current.chapterNodes.find(node => node.id === 'orc5_node_2')?.current
                    ? 'Orc Chapter 5 · No Clan Left Behind'
                    : 'Orc Chapter 5 · High Warhold Muster'
        : current.chapterNumber === 4
          ? current.chapterNodes.find(node => node.id === 'orc4_node_6')?.current
            ? 'Orc Chapter 4 · The Split-Chieftain'
            : current.chapterNodes.find(node => node.id === 'orc4_node_5')?.current
              ? 'Orc Chapter 4 · Two-Front Council'
              : current.chapterNodes.find(node => node.id === 'orc4_node_4')?.current
                ? 'Orc Chapter 4 · Broken Steppe War'
                : current.chapterNodes.find(node => node.id === 'orc4_node_3')?.current
                  ? 'Orc Chapter 4 · Split Warfire'
                  : current.chapterNodes.find(node => node.id === 'orc4_node_2')?.current
                    ? 'Orc Chapter 4 · War on Two Fronts'
                    : 'Orc Chapter 4 · Warhold Muster'
        : current.chapterNumber === 3
          ? current.chapterNodes.find(node => node.id === 'orc3_node_6')?.current
            ? 'Orc Chapter 3 · Stonejaw Champion'
            : current.chapterNodes.find(node => node.id === 'orc3_node_5')?.current
              ? 'Orc Chapter 3 · Clan Oath'
              : current.chapterNodes.find(node => node.id === 'orc3_node_4')?.current
                ? 'Orc Chapter 3 · Broken Steppe'
                : current.chapterNodes.find(node => node.id === 'orc3_node_3')?.current
                  ? 'Orc Chapter 3 · Trial Fires'
                  : current.chapterNodes.find(node => node.id === 'orc3_node_2')?.current
                    ? 'Orc Chapter 3 · The Stonejaw Trial'
                    : 'Orc Chapter 3 · Stonejaw Muster'
        : current.chapterNumber === 2
          ? current.chapterNodes.find(node => node.id === 'orc2_node_6')?.current
            ? 'Orc Chapter 2 · Clanbreaker'
            : current.chapterNodes.find(node => node.id === 'orc2_node_5')?.current
              ? 'Orc Chapter 2 · Warfire Council'
              : current.chapterNodes.find(node => node.id === 'orc2_node_4')?.current
                ? 'Orc Chapter 2 · Stonejaw Challengers'
                : current.chapterNodes.find(node => node.id === 'orc2_node_3')?.current
                  ? 'Orc Chapter 2 · Warg Pens'
                  : current.chapterNodes.find(node => node.id === 'orc2_node_2')?.current
                    ? 'Orc Chapter 2 · Gather the Clans'
                    : 'Orc Chapter 2 · Clan Muster'
          : current.commanderChoiceUnlocked
            ? current.commanderPathId
              ? 'Orc Chapter 1 Complete · Raise Warcamp'
              : 'Orc Chapter 1 Complete · Choose Commander'
            : current.chapterNodes.find(node => node.id === 'orc_node_6')?.current
              ? 'Orc Chapter 1 · The Blamecaller'
              : current.chapterNodes.find(node => node.id === 'orc_node_5')?.current
                ? 'Orc Chapter 1 · Gathering Fire'
                : current.chapterNodes.find(node => node.id === 'orc_node_4')?.current
                  ? 'Orc Chapter 1 · Invader Scouts'
                  : current.chapterNodes.find(node => node.id === 'orc_node_3')?.current
                    ? 'Orc Chapter 1 · Broken Clan Marks'
                    : 'Orc Chapter 1 · Blood on the Red Road';
  } else if (humanComplete) {
    chapterLabel = 'Human Campaign Complete · Oath Seal';
  } else if (current.chapterNumber >= 6) {
    chapterLabel = current.chapterNodes.find(node => node.id === 'ch6_node_6')?.current
      ? 'Chapter 6 · Return to Crownspire'
      : current.chapterNodes.find(node => node.id === 'ch6_node_5')?.current
        ? 'Chapter 6 · The Forced Beacon'
        : current.chapterNodes.find(node => node.id === 'ch6_node_4')?.current
          ? 'Chapter 6 · Ashen Court'
          : current.chapterNodes.find(node => node.id === 'ch6_node_3')?.current
            ? 'Chapter 6 · Concord Vault'
            : current.chapterNodes.find(node => node.id === 'ch6_node_2')?.current
              ? 'Chapter 6 · Sundered Fields'
              : 'Chapter 6 · Grand Council';
  } else if (current.chapterNumber === 5) {
    chapterLabel = current.chapterNodes.find(node => node.id === 'ch5_node_6')?.current
      ? 'Chapter 5 · Gate of Crownspire'
      : current.chapterNodes.find(node => node.id === 'ch5_node_5')?.current
        ? 'Chapter 5 · The Royal Ledger'
        : current.chapterNodes.find(node => node.id === 'ch5_node_4')?.current
          ? 'Chapter 5 · Ashen Envoy'
          : current.chapterNodes.find(node => node.id === 'ch5_node_3')?.current
            ? 'Chapter 5 · Broken Archives'
            : current.chapterNodes.find(node => node.id === 'ch5_node_2')?.current
              ? 'Chapter 5 · Old Royal Lands'
              : 'Chapter 5 · Capital Council';
  } else if (current.chapterNumber === 4) {
    chapterLabel = current.pretenderGeneralWon
      ? 'Chapter 4 · Raise Greenkeep Capital'
      : current.chapterNodes.find(node => node.id === 'ch4_node_6')?.current
        ? 'Chapter 4 · The Pretender General'
        : current.chapterNodes.find(node => node.id === 'ch4_node_5')?.current
          ? 'Chapter 4 · The Last Loyalists'
          : current.chapterNodes.find(node => node.id === 'ch4_node_4')?.current
            ? 'Chapter 4 · Crownroad Ambush'
            : current.chapterNodes.find(node => node.id === 'ch4_node_3')?.current
              ? 'Chapter 4 · The Empty Throne'
              : current.chapterNodes.find(node => node.id === 'ch4_node_2')?.current
                ? 'Chapter 4 · Broken Standards'
                : 'Chapter 4 · Stronghold Muster';
  } else if (current.chapterNumber === 3) {
    chapterLabel = current.lordMarshalWon
      ? 'Chapter 3 · Raise Greenkeep Stronghold'
      : current.chapterNodes.find(node => node.id === 'ch3_node_6')?.current
        ? 'Chapter 3 · Lord Marshal Veyr'
        : current.chapterNodes.find(node => node.id === 'ch3_node_5')?.current
          ? 'Chapter 3 · The Divided March'
          : current.chapterNodes.find(node => node.id === 'ch3_node_4')?.current
            ? 'Chapter 3 · Siege Road'
            : current.chapterNodes.find(node => node.id === 'ch3_node_3')?.current
              ? 'Chapter 3 · Three Warnings'
              : current.chapterNodes.find(node => node.id === 'ch3_node_2')?.current
                ? 'Chapter 3 · Border Fort'
                : 'Chapter 3 · Marcher Envoy';
  } else if (current.chapterNumber === 2) {
    chapterLabel = current.ironProvostWon
      ? 'Chapter 2 · Raise Greenkeep Town'
      : current.signalTowerUnlocked
        ? 'Chapter 2 · The Iron Provost'
        : current.kingdomDefenseCompleted
          ? 'Chapter 2 · Broken Signal Tower'
          : current.unlockedResourceSites.includes('greenwood_camp')
            ? 'Chapter 2 · Kingdom Defense'
            : current.unlockedResourceSites.includes('iron_hills_mine')
              ? 'Chapter 2 · Timber Claim'
              : current.fourthRecruitChosen
                ? 'Chapter 2 · Iron Road Skirmish'
                : 'Chapter 2 · Fort Muster';
  } else if (current.refugeeCampSecured) {
    chapterLabel = 'Chapter 1 · The Toll Captain';
  } else if (current.mercenaryPatrolWon && !current.commanderPathId) {
    chapterLabel = 'Chapter 1 · Choose Commander';
  } else if (current.mercenaryPatrolWon) {
    chapterLabel = 'Chapter 1 · Refugee Camp';
  } else if (current.firstPromotionComplete) {
    chapterLabel = 'Chapter 1 · Mercenary Patrol';
  } else if (current.markedRaidersInvestigated) {
    chapterLabel = 'Chapter 1 · First Promotion';
  } else if (current.holdTheRoadWon) {
    chapterLabel = 'Chapter 1 · Marked Raiders';
  }

  const kingdomName =
    current.faction === 'elf'
      ? current.wagonStageId === 'capital'
        ? 'Starroot Conclave'
        : current.wagonStageId === 'stronghold'
          ? 'Worldroot Sanctuary'
        : current.wagonStageId === 'town'
          ? 'Heartgrove Enclave'
          : current.wagonStageId === 'fort'
          ? 'Heartgrove Wardhold'
          : current.settlementUpgraded
            ? 'Heartgrove Sanctuary'
            : 'Heartgrove Refuge'
      : current.faction === 'orc'
        ? current.wagonStageId === 'capital'
          ? 'Warfire Confederacy'
          : current.wagonStageId === 'stronghold'
            ? 'Emberclan High Warhold'
          : current.wagonStageId === 'town'
            ? 'Emberclan Great Warhold'
            : current.wagonStageId === 'fort'
            ? 'Emberclan Warhold'
            : current.settlementUpgraded
              ? 'Emberclan Warcamp'
              : 'Emberclan Camp'
        : current.wagonStageId === 'grand'
          ? 'Greenkeep Grand Campaign'
          : current.wagonStageId === 'capital'
            ? 'Greenkeep Capital'
            : current.wagonStageId === 'stronghold'
              ? 'Greenkeep Stronghold'
              : current.wagonStageId === 'town'
                ? 'Greenkeep Town'
                : current.wagonStageId === 'fort'
                  ? 'Greenkeep Fort'
                  : current.settlementUpgraded
                    ? 'Greenkeep Settlement'
                    : 'Refugee Camp';

  return {
    slotId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    faction: snapshot.activeFaction,
    kingdomName,
    chapterLabel,
    activeSquads: current.formation.filter(Boolean).length,
    humanCampaignComplete: humanComplete,
    elfCampaignUnlocked: humanComplete,
    orcCampaignUnlocked: humanComplete
  };
}

export function createNewSaveRecord(slotId: SaveSlotId): SaveRecord {
  const snapshot = createInitialGameSnapshot();
  return {
    snapshot,
    metadata: metadataFromSnapshot(slotId, snapshot)
  };
}

export function normalizeSaveRecord(
  slotId: SaveSlotId,
  value: unknown
): SaveRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Partial<SaveRecord>;

  if (
    !record.snapshot ||
    record.snapshot.schemaVersion !== SAVE_SCHEMA_VERSION ||
    !record.snapshot.factionStates
  ) {
    return null;
  }

  const storedSnapshot = record.snapshot;
  const factionStates = {
    human: sanitizeFactionGameState(
      'human',
      storedSnapshot.factionStates.human
    ),
    elf: sanitizeFactionGameState(
      'elf',
      storedSnapshot.factionStates.elf
    ),
    orc: sanitizeFactionGameState(
      'orc',
      storedSnapshot.factionStates.orc
    )
  };

  const activeFaction =
    factionStates[storedSnapshot.activeFaction]
      ? storedSnapshot.activeFaction
      : factionOrder.find(
          faction => factionStates[faction]
        );

  if (!activeFaction) {
    return null;
  }

  const snapshot: GameSnapshot = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    activeFaction,
    shared: sanitizeSharedProgress(
      storedSnapshot.shared
    ),
    factionStates
  };

  return {
    snapshot,
    metadata: metadataFromSnapshot(
      slotId,
      snapshot,
      record.metadata
    )
  };
}
