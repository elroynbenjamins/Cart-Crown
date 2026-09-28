import {
  chapterOneNodes,
  starterResources,
  starterUnits,
  starterWagonItems
} from '../game/data';
import { initialHumanPlacements } from '../game/settlement';
import {
  elfChapterOneNodes,
  elfStarterResources,
  elfStarterUnits,
  factionStarterWagonItems,
  orcChapterOneNodes,
  orcStarterResources,
  orcStarterUnits
} from '../game/factionStarts';
import type { FactionId } from '../game/types';
import type {
  FactionGameState,
  GameSnapshot,
  SaveRecord,
  SaveSlotId,
  SaveSlotMetadata
} from './types';

export const SAVE_SCHEMA_VERSION = 13;

export function createHumanFactionState(): FactionGameState {
  return {
    faction: 'human',
    chapterNumber: 1,
    resources: { ...starterResources },
    units: starterUnits.map(unit => ({ ...unit })),
    formation: [
      null,
      'hum_militia',
      null,
      null,
      null,
      null,
      null,
      null,
      'hum_recruit'
    ],
    formationShapeId: 'balanced_333',
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
    formationTrialCompleted: false
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
      'elf_warden',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'elf_forest_scout'
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
      'orc_hunter',
      null,
      null,
      null,
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
      metaCampaignComplete: false
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

  const factionOrder: FactionId[] = ['human', 'elf', 'orc'];
  const storedSnapshot = record.snapshot;
  const activeState = storedSnapshot.factionStates[storedSnapshot.activeFaction];
  const activeFaction =
    activeState?.faction === storedSnapshot.activeFaction
      ? storedSnapshot.activeFaction
      : factionOrder.find(faction => {
          const state = storedSnapshot.factionStates[faction];
          return state?.faction === faction;
        });

  if (!activeFaction) {
    return null;
  }

  const snapshot =
    activeFaction === storedSnapshot.activeFaction
      ? storedSnapshot
      : {
          ...storedSnapshot,
          activeFaction
        };

  return {
    snapshot,
    metadata: metadataFromSnapshot(slotId, snapshot, record.metadata)
  };
}
