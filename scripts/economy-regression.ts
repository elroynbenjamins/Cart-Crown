import {
  canAffordCost,
  clampArmyReadiness,
  getArmyResupplyCost,
  getBattleReadinessWear,
  getExpansionCost,
  payResourceCost
} from '../src/game/balance';
import {
  fortMusterOptions,
  humanResourceSites
} from '../src/game/chapter2';
import {
  marcherAuxiliaryOptions,
  marcherResourceSites,
  marcherWarningChoices
} from '../src/game/chapter3';
import {
  crownroadResourceSites,
  lastLoyalistChoices,
  strongholdMusterOptions
} from '../src/game/chapter4';
import {
  capitalResourceSites
} from '../src/game/chapter5';
import {
  encounterRewards,
  getEncounter,
  getEnemyArmyProfile,
  getEnemyFormationTactic
} from '../src/game/encounters';
import type { EncounterId } from '../src/game/encounters';
import {
  advancedPromotions,
  canUnitEquipEquipment,
  equipmentDefinitions,
  recruitPromotions
} from '../src/game/equipment';
import {
  elfThirdRecruitOptions,
  factionChapterTwoResourceSites,
  orcThirdRecruitOptions
} from '../src/game/factionChapter2';
import {
  elfFourthRecruitOptions,
  factionChapterThreeResourceSites,
  orcFourthRecruitOptions
} from '../src/game/factionChapter3';
import {
  elfChapterFiveReinforcement,
  elfFifthRecruitOptions,
  factionChapterFourResourceSites,
  orcChapterFiveReinforcement,
  orcFifthRecruitOptions
} from '../src/game/factionChapter4';
import {
  factionChapterFiveResourceSites
} from '../src/game/factionChapter5';
import {
  elfStarterResources,
  elfStarterUnits,
  orcStarterResources,
  orcStarterUnits
} from '../src/game/factionStarts';
import {
  getBuildingLevelDefinition,
  getBuildings,
  getFactionBuildingIds
} from '../src/game/kingdom';
import {
  humanRecruitOptions,
  starterResources,
  starterUnits
} from '../src/game/data';
import { getCommanderPaths } from '../src/game/commanders';
import {
  formationShapes,
  getFactionDoctrines
} from '../src/game/formation';
import { evaluateFormationPreset } from '../src/game/loadoutAnalysis';
import {
  buildFormation,
  simulate
} from './balance-regression';
import type {
  SimulationResult
} from './balance-regression';
import type {
  FactionId,
  FormationPreset,
  FormationShapeId,
  ResourceSiteDefinition,
  ResourceWallet,
  UnitDefinition
} from '../src/game/types';

type EconomyState = {
  faction: FactionId;
  resources: ResourceWallet;
  levels: Record<string, number>;
  unlockedSites: Set<string>;
  stage:
    | 'camp'
    | 'settlement'
    | 'fort'
    | 'town'
    | 'stronghold'
    | 'capital'
    | 'grand';
  expeditionTickets: number;
  defenseCompleted: boolean;
  recoveryActivities: number;
  transitionRecoveries: number;
  armyReadiness: number;
  resupplyCount: number;
  resupplyProvisions: number;
  purchasedGearIds: string[];
  battlesWon: number;
  battleDefeats: number;
  formationSwitches: number;
  lastFormationShapeId: FormationShapeId | null;
  weakestWinHpPercent: number;
  equipmentSpent: ResourceWallet;
};

type TransitionRow = {
  faction: FactionId;
  target: string;
  chapter: number;
  recoveryActivities: number;
  resources: ResourceWallet;
  readiness: number;
  resupplies: number;
  resupplyProvisions: number;
};

const failures: string[] = [];
const rows: TransitionRow[] = [];

const ZERO: ResourceWallet = {
  gold: 0,
  wood: 0,
  stone: 0,
  iron: 0,
  provisions: 0
};

const allSites: ResourceSiteDefinition[] = [
  ...humanResourceSites,
  ...marcherResourceSites,
  ...crownroadResourceSites,
  ...capitalResourceSites,
  ...factionChapterTwoResourceSites,
  ...factionChapterThreeResourceSites,
  ...factionChapterFourResourceSites,
  ...factionChapterFiveResourceSites
];

const siteById = new Map(
  allSites.map(site => [site.id, site])
);

const stageRank: Record<EconomyState['stage'], number> = {
  camp: 0,
  settlement: 1,
  fort: 2,
  town: 3,
  stronghold: 4,
  capital: 5,
  grand: 6
};

const squadCapByStage: Record<EconomyState['stage'], number> = {
  camp: 2,
  settlement: 3,
  fort: 4,
  town: 5,
  stronghold: 6,
  capital: 6,
  grand: 6
};

const chapterEncounters: Record<
  FactionId,
  Record<number, EncounterId[]>
> = {
  human: {
    1: [
      'hold_the_road',
      'mercenary_patrol',
      'toll_captain'
    ],
    2: [
      'iron_road_skirmish',
      'iron_provost'
    ],
    3: [
      'border_fort',
      'siege_road',
      'lord_marshal_veyr'
    ],
    4: [
      'broken_standards',
      'crownroad_ambush',
      'pretender_general'
    ],
    5: [
      'old_royal_lands',
      'ashen_envoy',
      'gate_of_crownspire'
    ]
  },
  elf: {
    1: [
      'elf_wardbreakers',
      'elf_ashen_tracks',
      'elf_hollow_warden'
    ],
    2: [
      'elf_last_heartgrove',
      'elf_ward_hunters',
      'elf_ashroot_stalker'
    ],
    3: [
      'elf_moonlit_pass',
      'elf_ashen_groves',
      'elf_pale_ranger'
    ],
    4: [
      'elf_roots_in_ash',
      'elf_two_fronts',
      'elf_ashen_druid'
    ],
    5: [
      'elf_wounded_worldroot',
      'elf_ashen_rootkeepers',
      'elf_worldroot_guardian'
    ]
  },
  orc: {
    1: [
      'orc_red_road',
      'orc_invader_scouts',
      'orc_blamecaller'
    ],
    2: [
      'orc_gather_clans',
      'orc_stonejaw_challengers',
      'orc_clanbreaker'
    ],
    3: [
      'orc_stonejaw_trial',
      'orc_broken_steppe',
      'orc_stonejaw_champion'
    ],
    4: [
      'orc_two_front_war',
      'orc_broken_steppe_war',
      'orc_split_chieftain'
    ],
    5: [
      'orc_no_clan_left_behind',
      'orc_ashen_clanbreakers',
      'orc_last_clanbreaker'
    ]
  }
};

const gearPackages: Record<
  FactionId,
  Record<number, string[]>
> = {
  human: {
    1: ['hum_iron_sword'],
    2: ['hum_padded_armor', 'hum_wood_shield'],
    3: ['hum_steel_sword', 'hum_hunting_bow'],
    4: ['hum_chainmail', 'hum_longbow'],
    5: ['hum_tempered_sword', 'hum_heavy_plate']
  },
  elf: {
    2: ['elf_spiritwood_spear', 'elf_leafweave'],
    3: ['elf_moonsilver_spear', 'elf_moonweave'],
    4: ['elf_trained_stag', 'elf_rider_bow'],
    5: ['elf_veteran_stag', 'elf_starbow']
  },
  orc: {
    2: ['orc_iron_axe', 'orc_warhide'],
    3: ['orc_blackiron_axe', 'orc_reinforced_warhide'],
    4: ['orc_trained_warg', 'orc_raider_axe'],
    5: ['orc_veteran_warg', 'orc_bloodaxe']
  }
};

const doctrineUnlockRank: Record<string, number> = {
  Start: 0,
  Settlement: 1,
  Fort: 2,
  Town: 3,
  Stronghold: 4
};

const gearTargetUnit: Record<string, string> = {
  hum_iron_sword: 'hum_recruit',
  hum_padded_armor: 'hum_militia',
  hum_wood_shield: 'hum_militia',
  hum_steel_sword: 'hum_recruit',
  hum_hunting_bow: 'hum_archer_reinforcement',
  hum_chainmail: 'hum_militia',
  hum_longbow: 'hum_archer_reinforcement',
  hum_tempered_sword: 'hum_recruit',
  hum_heavy_plate: 'hum_militia',

  elf_spiritwood_spear: 'elf_warden',
  elf_leafweave: 'elf_warden',
  elf_moonsilver_spear: 'elf_warden',
  elf_moonweave: 'elf_warden',
  elf_trained_stag: 'elf_stag_scout',
  elf_rider_bow: 'elf_stag_scout',
  elf_veteran_stag: 'elf_stag_scout',
  elf_starbow: 'elf_stag_scout',

  orc_iron_axe: 'orc_youngblood',
  orc_warhide: 'orc_youngblood',
  orc_blackiron_axe: 'orc_youngblood',
  orc_reinforced_warhide: 'orc_youngblood',
  orc_trained_warg: 'orc_warg_scout',
  orc_raider_axe: 'orc_warg_scout',
  orc_veteran_warg: 'orc_warg_scout',
  orc_bloodaxe: 'orc_warg_scout'
};

function invariant(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) throw new Error(message);
}

function expect(condition: unknown, message: string) {
  if (!condition) failures.push(message);
}

function cloneWallet(
  wallet: ResourceWallet
): ResourceWallet {
  return { ...wallet };
}

function add(
  wallet: ResourceWallet,
  reward: Partial<ResourceWallet>
): ResourceWallet {
  return {
    gold: wallet.gold + (reward.gold ?? 0),
    wood: wallet.wood + (reward.wood ?? 0),
    stone: wallet.stone + (reward.stone ?? 0),
    iron: wallet.iron + (reward.iron ?? 0),
    provisions:
      wallet.provisions +
      (reward.provisions ?? 0)
  };
}

function addToSpent(
  current: ResourceWallet,
  cost: Partial<ResourceWallet>
): ResourceWallet {
  return add(current, cost);
}

function deficits(
  wallet: ResourceWallet,
  cost: Partial<ResourceWallet>
): ResourceWallet {
  return {
    gold: Math.max(
      0,
      (cost.gold ?? 0) - wallet.gold
    ),
    wood: Math.max(
      0,
      (cost.wood ?? 0) - wallet.wood
    ),
    stone: Math.max(
      0,
      (cost.stone ?? 0) - wallet.stone
    ),
    iron: Math.max(
      0,
      (cost.iron ?? 0) - wallet.iron
    ),
    provisions: Math.max(
      0,
      (cost.provisions ?? 0) -
        wallet.provisions
    )
  };
}

function deficitTotal(wallet: ResourceWallet) {
  return (
    wallet.gold +
    wallet.wood +
    wallet.stone +
    wallet.iron +
    wallet.provisions
  );
}

function productionFor(
  state: EconomyState
): Partial<ResourceWallet> {
  let total: ResourceWallet = { ...ZERO };

  for (const id of state.unlockedSites) {
    const site = siteById.get(id);
    if (!site) continue;
    total = add(total, site.productionPerActivity);
  }

  return total;
}

function accrueProduction(state: EconomyState) {
  state.resources = add(
    state.resources,
    productionFor(state)
  );
}

function resupplyIfFatigued(
  state: EconomyState,
  context: string
) {
  if (state.armyReadiness >= 70) return;

  const cost = getArmyResupplyCost(
    state.armyReadiness,
    squadCapByStage[state.stage],
    true,
    true
  );

  expect(
    state.resources.provisions >= cost,
    context +
      ' cannot afford a prepared-army resupply of ' +
      cost +
      ' provisions at ' +
      state.armyReadiness +
      '% Readiness.'
  );

  if (state.resources.provisions < cost) return;

  state.resources = {
    ...state.resources,
    provisions:
      state.resources.provisions - cost
  };
  state.resupplyCount += 1;
  state.resupplyProvisions += cost;
  state.armyReadiness = 100;
}

function applyBattleWear(
  state: EconomyState,
  difficulty: 'Normal' | 'Elite' | 'Boss',
  remainingHp: number,
  context: string
) {
  const wear = getBattleReadinessWear(
    remainingHp,
    100,
    difficulty,
    true,
    true,
    true
  );

  state.armyReadiness = clampArmyReadiness(
    state.armyReadiness - wear
  );
  resupplyIfFatigued(state, context);
}

function addEncounter(
  state: EconomyState,
  id: EncounterId
) {
  state.resources = add(
    state.resources,
    encounterRewards[id].resources
  );
  accrueProduction(state);

  const encounter = getEncounter(id);
  applyBattleWear(
    state,
    encounter.difficulty,
    representativeRemainingHp[encounter.difficulty],
    state.faction + ' ' + encounter.name
  );
}

function addEvent(
  state: EconomyState,
  reward: Partial<ResourceWallet>,
  unlockSite?: string
) {
  state.resources = add(state.resources, reward);
  if (unlockSite) {
    invariant(
      siteById.has(unlockSite),
      'Unknown resource site: ' + unlockSite
    );
    state.unlockedSites.add(unlockSite);
  }
}

function rewardScore(
  deficit: ResourceWallet,
  reward: Partial<ResourceWallet>
) {
  const keys = [
    'gold',
    'wood',
    'stone',
    'iron',
    'provisions'
  ] as const;

  return keys.reduce((score, key) => {
    const missing = deficit[key];
    if (missing <= 0) return score;
    return (
      score +
      Math.min(
        1,
        (reward[key] ?? 0) / missing
      )
    );
  }, 0);
}

function expeditionReward(
  state: EconomyState
): Partial<ResourceWallet> {
  const ids = getFactionBuildingIds(
    state.faction
  );
  const logistics =
    state.levels[ids.logistics] ?? 0;

  return add(
    {
      gold: 40,
      wood: 8 + (logistics >= 2 ? 1 : 0),
      stone: 2,
      iron: 1,
      provisions: 4
    },
    productionFor(state)
  );
}

function defenseReward(
  state: EconomyState
): Partial<ResourceWallet> {
  const first = !state.defenseCompleted;
  return add(
    {
      gold: first ? 85 : 60,
      wood: first ? 10 : 8,
      stone: first ? 10 : 6,
      iron: first ? 4 : 2,
      provisions: first ? 6 : 5
    },
    productionFor(state)
  );
}

function runExpedition(
  state: EconomyState,
  countsAsRecovery: boolean
) {
  invariant(
    state.expeditionTickets > 0,
    'No Expedition ticket available.'
  );
  state.expeditionTickets -= 1;
  state.resources = add(
    state.resources,
    expeditionReward(state)
  );
  applyBattleWear(
    state,
    'Elite',
    70,
    state.faction + ' Expedition'
  );

  if (countsAsRecovery) {
    state.recoveryActivities += 1;
    state.transitionRecoveries += 1;
  }
}

function runDefense(
  state: EconomyState,
  countsAsRecovery: boolean
) {
  invariant(
    stageRank[state.stage] >=
      stageRank.fort,
    'Kingdom Defense used before Fort tier.'
  );

  state.resources = add(
    state.resources,
    defenseReward(state)
  );
  state.defenseCompleted = true;

  applyBattleWear(
    state,
    'Elite',
    65,
    state.faction + ' Kingdom Defense'
  );

  if (countsAsRecovery) {
    state.recoveryActivities += 1;
    state.transitionRecoveries += 1;
  }
}

function recoverForCost(
  state: EconomyState,
  cost: Partial<ResourceWallet>,
  context: string
) {
  let guard = 0;

  while (!canAffordCost(state.resources, cost)) {
    guard += 1;
    invariant(
      guard <= 60,
      context +
        ' exceeded 60 recovery activities.'
    );

    const deficit = deficits(
      state.resources,
      cost
    );

    const candidates: Array<{
      type: 'expedition' | 'defense';
      score: number;
    }> = [];

    if (
      stageRank[state.stage] >=
        stageRank.settlement &&
      state.expeditionTickets > 0
    ) {
      candidates.push({
        type: 'expedition',
        score: rewardScore(
          deficit,
          expeditionReward(state)
        )
      });
    }

    if (
      stageRank[state.stage] >= stageRank.fort
    ) {
      candidates.push({
        type: 'defense',
        score: rewardScore(
          deficit,
          defenseReward(state)
        )
      });
    }

    invariant(
      candidates.length > 0,
      context +
        ' has no non-ad recovery route for deficit ' +
        JSON.stringify(deficit)
    );

    candidates.sort(
      (a, b) => b.score - a.score
    );
    const best = candidates[0];
    invariant(
      best && best.score > 0,
      context +
        ' recovery activities cannot produce the missing resource: ' +
        JSON.stringify(deficit)
    );

    if (best.type === 'expedition') {
      runExpedition(state, true);
    } else {
      runDefense(state, true);
    }
  }
}

function spend(
  state: EconomyState,
  cost: Partial<ResourceWallet>,
  context: string
) {
  recoverForCost(state, cost, context);
  state.resources = payResourceCost(
    state.resources,
    cost
  );
}

function ensureBuildingLevel(
  state: EconomyState,
  buildingId: string,
  target: number,
  context: string
) {
  let current =
    state.levels[buildingId] ?? 0;

  if (current <= 0 && target >= 1) {
    const building = getBuildings(
      state.faction
    ).find(candidate => candidate.id === buildingId);
    invariant(
      building,
      'Missing building: ' + buildingId
    );

    spend(
      state,
      building.constructionCost,
      context +
        ' construct ' +
        building.name
    );
    current = 1;
    state.levels[buildingId] = 1;
  }

  for (
    let level = current + 1;
    level <= target;
    level += 1
  ) {
    const definition =
      getBuildingLevelDefinition(
        buildingId,
        level
      );
    invariant(
      definition,
      'Missing level ' +
        level +
        ' for ' +
        buildingId
    );

    spend(
      state,
      definition.cost,
      context +
        ' ' +
        buildingId +
        ' Lv.' +
        level
    );

    state.levels[buildingId] = level;

    const ids = getFactionBuildingIds(
      state.faction
    );
    if (
      buildingId === ids.supply &&
      level === 2
    ) {
      state.expeditionTickets += 1;
    }
  }
}

function spendGearPackage(
  state: EconomyState,
  chapter: number
) {
  const packageIds =
    gearPackages[state.faction][chapter] ?? [];

  for (const id of packageIds) {
    if (state.purchasedGearIds.includes(id)) continue;

    const equipment =
      equipmentDefinitions.find(
        item => item.id === id
      );
    invariant(
      equipment,
      'Missing equipment: ' + id
    );

    const buildingIds = getFactionBuildingIds(state.faction);
    if (equipment.requiredForgeLevel > 0) {
      ensureBuildingLevel(
        state,
        buildingIds.forge,
        equipment.requiredForgeLevel,
        state.faction + ' equipment forge requirement'
      );
    }
    if ((equipment.requiredStableLevel ?? 0) > 0) {
      ensureBuildingLevel(
        state,
        buildingIds.mount,
        equipment.requiredStableLevel ?? 0,
        state.faction + ' equipment mount requirement'
      );
    }

    spend(
      state,
      equipment.craftCost,
      state.faction +
        ' Chapter ' +
        chapter +
        ' representative equipment ' +
        equipment.name
    );

    state.equipmentSpent = addToSpent(
      state.equipmentSpent,
      equipment.craftCost
    );
    state.purchasedGearIds.push(id);
  }
}

function transitionTargets(
  faction: FactionId,
  target:
    | 'fort'
    | 'town'
    | 'stronghold'
    | 'capital'
    | 'grand'
): Record<string, number> {
  const ids = getFactionBuildingIds(faction);

  if (faction === 'human') {
    if (target === 'fort') {
      return {
        [ids.army]: 2,
        [ids.forge]: 2,
        [ids.logistics]: 2
      };
    }
    if (target === 'town') {
      return {
        [ids.army]: 3,
        [ids.forge]: 3,
        [ids.logistics]: 3,
        [ids.mount]: 1,
        [ids.scout]: 1
      };
    }
    if (target === 'stronghold') {
      return {
        [ids.army]: 4,
        [ids.forge]: 4,
        [ids.logistics]: 4,
        [ids.command]: 2,
        [ids.supply]: 2,
        [ids.mount]: 1,
        [ids.scout]: 1
      };
    }
    if (target === 'capital') {
      return {
        [ids.army]: 5,
        [ids.forge]: 5,
        [ids.logistics]: 5,
        [ids.command]: 3,
        [ids.supply]: 3,
        [ids.mount]: 2,
        [ids.scout]: 2,
        officer_academy: 1
      };
    }
    return {
      [ids.army]: 5,
      [ids.forge]: 5,
      [ids.logistics]: 5,
      [ids.command]: 4,
      [ids.supply]: 4,
      [ids.mount]: 3,
      [ids.scout]: 3,
      officer_academy: 2
    };
  }

  if (target === 'fort') {
    return {
      [ids.army]: 2,
      [ids.forge]: 2,
      [ids.logistics]: 2,
      [ids.command]: 1
    };
  }
  if (target === 'town') {
    return {
      [ids.army]: 3,
      [ids.forge]: 3,
      [ids.logistics]: 3,
      [ids.mount]: 1,
      [ids.scout]: 1
    };
  }
  if (target === 'stronghold') {
    return {
      [ids.army]: 4,
      [ids.forge]: 4,
      [ids.logistics]: 4,
      [ids.command]: 2,
      [ids.supply]: 2,
      [ids.mount]: 1,
      [ids.scout]: 1
    };
  }

  invariant(
    target === 'capital',
    faction +
      ' does not use transition ' +
      target
  );

  return {
    [ids.army]: 5,
    [ids.forge]: 5,
    [ids.logistics]: 5,
    [ids.command]: 3,
    [ids.supply]: 3,
    [ids.mount]: 2,
    [ids.scout]: 2
  };
}

function prepareTransition(
  state: EconomyState,
  chapter: number,
  target:
    | 'fort'
    | 'town'
    | 'stronghold'
    | 'capital'
    | 'grand'
) {
  state.transitionRecoveries = 0;
  const targets = transitionTargets(
    state.faction,
    target
  );

  for (const [buildingId, level] of Object.entries(
    targets
  )) {
    ensureBuildingLevel(
      state,
      buildingId,
      level,
      state.faction +
        ' Chapter ' +
        chapter +
        ' → ' +
        target
    );
  }

  spend(
    state,
    getExpansionCost(
      state.faction,
      target
    ),
    state.faction +
      ' Chapter ' +
      chapter +
      ' expansion to ' +
      target
  );

  state.stage = target;

  rows.push({
    faction: state.faction,
    target,
    chapter,
    recoveryActivities:
      state.transitionRecoveries,
    resources: cloneWallet(state.resources),
    readiness: state.armyReadiness,
    resupplies: state.resupplyCount,
    resupplyProvisions: state.resupplyProvisions
  });

  expect(
    state.transitionRecoveries <= 3,
    state.faction +
      ' Chapter ' +
      chapter +
      ' → ' +
      target +
      ' requires ' +
      state.transitionRecoveries +
      ' extra recovery activities; expected at most 3.'
  );
}

function newHumanState(): EconomyState {
  return {
    faction: 'human',
    resources: cloneWallet(starterResources),
    levels: {
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
    unlockedSites: new Set(),
    stage: 'camp',
    expeditionTickets: 1,
    defenseCompleted: false,
    recoveryActivities: 0,
    transitionRecoveries: 0,
    armyReadiness: 100,
    resupplyCount: 0,
    resupplyProvisions: 0,
    purchasedGearIds: [],
    battlesWon: 0,
    battleDefeats: 0,
    formationSwitches: 0,
    lastFormationShapeId: null,
    weakestWinHpPercent: 100,
    equipmentSpent: { ...ZERO }
  };
}

function newFactionState(
  faction: 'elf' | 'orc'
): EconomyState {
  const ids = getFactionBuildingIds(faction);

  return {
    faction,
    resources: cloneWallet(
      faction === 'elf'
        ? elfStarterResources
        : orcStarterResources
    ),
    levels: {
      [ids.hall]: 0,
      [ids.army]: 0,
      [ids.forge]: 0,
      [ids.logistics]: 0,
      [ids.supply]: 0,
      [ids.command]: 0,
      [ids.mount]: 0,
      [ids.scout]: 0
    },
    unlockedSites: new Set(),
    stage: 'camp',
    expeditionTickets: 1,
    defenseCompleted: false,
    recoveryActivities: 0,
    transitionRecoveries: 0,
    armyReadiness: 100,
    resupplyCount: 0,
    resupplyProvisions: 0,
    purchasedGearIds: [],
    battlesWon: 0,
    battleDefeats: 0,
    formationSwitches: 0,
    lastFormationShapeId: null,
    weakestWinHpPercent: 100,
    equipmentSpent: { ...ZERO }
  };
}

function playFactionChapterOne(
  state: EconomyState
) {
  invariant(
    state.faction !== 'human',
    'Faction Chapter 1 helper is Elf/Orc only.'
  );
  const ids = chapterEncounters[state.faction][1];
  invariant(
    ids?.length === 3,
    'Missing faction Chapter 1 route.'
  );

  addEncounter(state, ids[0]!);

  if (state.faction === 'elf') {
    addEvent(state, { gold: 5, wood: 4 });
  } else {
    addEvent(state, { gold: 5, iron: 2 });
  }

  addEncounter(state, ids[1]!);

  if (state.faction === 'elf') {
    addEvent(state, {
      wood: 24,
      provisions: 14
    });
  } else {
    addEvent(state, {
      wood: 20,
      iron: 4,
      provisions: 16
    });
  }

  addEncounter(state, ids[2]!);

  const settlementCost =
    state.faction === 'elf'
      ? {
          wood: 70,
          stone: 15,
          provisions: 8
        }
      : {
          wood: 70,
          stone: 15,
          iron: 4
        };

  invariant(
    canAffordCost(
      state.resources,
      settlementCost
    ),
    state.faction +
      ' cannot establish its starter settlement from guaranteed Chapter 1 rewards.'
  );

  state.resources = payResourceCost(
    state.resources,
    settlementCost
  );
  state.stage = 'settlement';

  const buildingIds =
    getFactionBuildingIds(state.faction);
  state.levels[buildingIds.hall] = 2;
  state.levels[buildingIds.army] = 1;
  state.levels[buildingIds.logistics] = 1;
}

function playHumanChapterOne(
  state: EconomyState
) {
  addEncounter(state, 'hold_the_road');

  const settlementCost = {
    wood: 90,
    stone: 20
  };

  invariant(
    canAffordCost(
      state.resources,
      settlementCost
    ),
    'Human starter Settlement is not affordable after Hold the Road.'
  );
  state.resources = payResourceCost(
    state.resources,
    settlementCost
  );
  state.stage = 'settlement';
  state.levels.hall = 2;

  addEvent(state, { wood: 5, iron: 2 });

  ensureBuildingLevel(
    state,
    'forge',
    1,
    'Human Chapter 1 mandatory Forge'
  );
  spendGearPackage(state, 1);

  addEncounter(state, 'mercenary_patrol');
  addEvent(state, {
    wood: 45,
    iron: 8,
    provisions: 20
  });
  addEncounter(state, 'toll_captain');
}

function playHumanChapter(
  state: EconomyState,
  chapter: number
) {
  spendGearPackage(state, chapter);
  const ids = chapterEncounters.human[chapter];
  invariant(
    ids,
    'Missing Human Chapter ' +
      chapter +
      ' route.'
  );

  if (chapter === 2) {
    addEncounter(
      state,
      'iron_road_skirmish'
    );
    state.unlockedSites.add(
      'iron_hills_mine'
    );
    state.unlockedSites.add(
      'greenwood_camp'
    );

    runDefense(state, false);

    state.unlockedSites.add('old_quarry');

    addEncounter(state, 'iron_provost');
    return;
  }

  if (chapter === 3) {
    addEncounter(state, ids[0]!);
    addEncounter(state, ids[1]!);
    addEvent(
      state,
      { gold: 40, provisions: 10 },
      'marcher_depot'
    );
    addEncounter(state, ids[2]!);
    return;
  }

  if (chapter === 4) {
    addEncounter(state, ids[0]!);
    addEvent(
      state,
      {},
      'crownroad_salvage'
    );
    addEncounter(state, ids[1]!);
    addEncounter(state, ids[2]!);
    return;
  }

  if (chapter === 5) {
    addEncounter(state, ids[0]!);
    addEvent(
      state,
      {},
      'royal_archive_stores'
    );
    addEncounter(state, ids[1]!);
    addEncounter(state, ids[2]!);
    return;
  }

  invariant(
    false,
    'Unsupported Human economy chapter ' +
      chapter
  );
}

function playFactionChapter(
  state: EconomyState,
  chapter: number
) {
  invariant(
    state.faction !== 'human',
    'Faction helper is Elf/Orc only.'
  );

  spendGearPackage(state, chapter);

  const ids =
    chapterEncounters[state.faction][chapter];
  invariant(
    ids?.length === 3,
    'Missing ' +
      state.faction +
      ' Chapter ' +
      chapter +
      ' route.'
  );

  if (chapter === 5) {
    if (state.faction === 'elf') {
      addEvent(state, {
        gold: 25,
        provisions: 25
      });
    } else {
      addEvent(state, {
        gold: 20,
        provisions: 28
      });
    }
  }

  addEncounter(state, ids[0]!);

  if (chapter === 2) {
    if (state.faction === 'elf') {
      addEvent(
        state,
        { wood: 12, provisions: 8 },
        'elf_moonwell_herbs'
      );
    } else {
      addEvent(
        state,
        { provisions: 12, iron: 3 },
        'orc_red_plains_hunt'
      );
    }
  } else if (chapter === 3) {
    if (state.faction === 'elf') {
      addEvent(
        state,
        { gold: 12, provisions: 6 },
        'elf_moonlit_watch'
      );
    } else {
      addEvent(
        state,
        { stone: 8, iron: 5 },
        'orc_stonejaw_quarry'
      );
    }
  } else if (chapter === 4) {
    if (state.faction === 'elf') {
      addEvent(
        state,
        { wood: 14, provisions: 8 },
        'elf_burned_ward_reclamation'
      );
    } else {
      addEvent(
        state,
        { gold: 12, provisions: 10 },
        'orc_steppe_war_camp'
      );
    }
  } else if (chapter === 5) {
    if (state.faction === 'elf') {
      addEvent(
        state,
        { wood: 16, provisions: 10 },
        'elf_worldroot_nursery'
      );
    } else {
      addEvent(
        state,
        { iron: 10, provisions: 10 },
        'orc_united_clan_depot'
      );
    }
  }

  addEncounter(state, ids[1]!);

  if (chapter === 2) {
    if (state.faction === 'elf') {
      addEvent(state, {
        gold: 20,
        stone: 6
      });
    } else {
      addEvent(state, {
        gold: 18,
        wood: 10
      });
    }
  } else if (chapter === 3) {
    if (state.faction === 'elf') {
      addEvent(state, {
        gold: 24,
        wood: 10
      });
    } else {
      addEvent(state, {
        gold: 22,
        provisions: 8
      });
    }
  } else if (chapter === 4) {
    if (state.faction === 'elf') {
      addEvent(state, {
        gold: 28,
        provisions: 8
      });
    } else {
      addEvent(state, {
        gold: 26,
        iron: 6
      });
    }
  }

  addEncounter(state, ids[2]!);
}

function runHumanPath() {
  const state = newHumanState();

  playHumanChapterOne(state);
  prepareTransition(state, 1, 'fort');
  state.unlockedSites.add('greenkeep_farms');

  playHumanChapter(state, 2);
  prepareTransition(state, 2, 'town');

  playHumanChapter(state, 3);
  prepareTransition(state, 3, 'stronghold');

  playHumanChapter(state, 4);
  prepareTransition(state, 4, 'capital');

  playHumanChapter(state, 5);
  prepareTransition(state, 5, 'grand');

  expect(
    state.recoveryActivities <= 8,
    'Human campaign needs ' +
      state.recoveryActivities +
      ' total recovery activities before Chapter 6; expected at most 8.'
  );

  return state;
}

function runFactionPath(
  faction: 'elf' | 'orc'
) {
  const state = newFactionState(faction);

  playFactionChapterOne(state);

  playFactionChapter(state, 2);
  prepareTransition(state, 2, 'fort');

  playFactionChapter(state, 3);
  prepareTransition(state, 3, 'town');

  playFactionChapter(state, 4);
  prepareTransition(
    state,
    4,
    'stronghold'
  );

  playFactionChapter(state, 5);
  prepareTransition(
    state,
    5,
    'capital'
  );

  expect(
    state.recoveryActivities <= 8,
    faction +
      ' campaign needs ' +
      state.recoveryActivities +
      ' total recovery activities before Chapter 6; expected at most 8.'
  );

  return state;
}

function formatWallet(wallet: ResourceWallet) {
  return (
    'G' +
    wallet.gold +
    ' W' +
    wallet.wood +
    ' S' +
    wallet.stone +
    ' I' +
    wallet.iron +
    ' P' +
    wallet.provisions
  );
}

function printRows() {
  console.log(
    '\nEconomy progression regression'
  );
  console.log(
    'Faction Ch Target      Recovery  Ready  Resupplies  Rest P  Resources after expansion'
  );

  for (const row of rows) {
    console.log(
      row.faction.padEnd(6) +
        ' ' +
        String(row.chapter).padStart(2, ' ') +
        ' ' +
        row.target.padEnd(11) +
        ' ' +
        String(row.recoveryActivities).padStart(
          8,
          ' '
        ) +
        '  ' +
        String(row.readiness).padStart(5, ' ') +
        '%  ' +
        String(row.resupplies).padStart(10, ' ') +
        '  ' +
        String(row.resupplyProvisions).padStart(6, ' ') +
        '  ' +
        formatWallet(row.resources)
    );
  }
}

function main() {
  const human = runHumanPath();
  const elf = runFactionPath('elf');
  const orc = runFactionPath('orc');

  printRows();

  console.log(
    '\nRepresentative equipment spend'
  );
  console.log(
    'Human ' +
      formatWallet(human.equipmentSpent)
  );
  console.log(
    'Elf   ' +
      formatWallet(elf.equipmentSpent)
  );
  console.log(
    'Orc   ' +
      formatWallet(orc.equipmentSpent)
  );

  console.log(
    '\nPrepared-army field recovery'
  );
  console.log(
    'Human ' +
      human.resupplyCount +
      ' resupplies · ' +
      human.resupplyProvisions +
      ' provisions'
  );
  console.log(
    'Elf   ' +
      elf.resupplyCount +
      ' resupplies · ' +
      elf.resupplyProvisions +
      ' provisions'
  );
  console.log(
    'Orc   ' +
      orc.resupplyCount +
      ' resupplies · ' +
      orc.resupplyProvisions +
      ' provisions'
  );

  expect(
    human.resupplyCount <= 6,
    'Human prepared campaign now requires ' +
      human.resupplyCount +
      ' field resupplies before Chapter 6; expected at most 6.'
  );
  expect(
    elf.resupplyCount <= 6,
    'Elf prepared campaign now requires ' +
      elf.resupplyCount +
      ' field resupplies before Chapter 6; expected at most 6.'
  );
  expect(
    orc.resupplyCount <= 6,
    'Orc prepared campaign now requires ' +
      orc.resupplyCount +
      ' field resupplies before Chapter 6; expected at most 6.'
  );

  expect(
    human.resupplyProvisions <= 70,
    'Human prepared campaign spends too many provisions on field recovery: ' +
      human.resupplyProvisions
  );
  expect(
    elf.resupplyProvisions <= 70,
    'Elf prepared campaign spends too many provisions on field recovery: ' +
      elf.resupplyProvisions
  );
  expect(
    orc.resupplyProvisions <= 70,
    'Orc prepared campaign spends too many provisions on field recovery: ' +
      orc.resupplyProvisions
  );

  if (failures.length > 0) {
    console.error(
      '\nECONOMY REGRESSION FAILURES (' +
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
        ' deterministic economy guardrail(s) failed.'
    );
  }

  console.log(
    '\nPASS: every faction reaches its final campaign tier without ads while paying required buildings, expansion costs, representative equipment and realistic Readiness resupply costs, with recovery activity remaining inside the anti-grind guardrails.'
  );
}

main();
