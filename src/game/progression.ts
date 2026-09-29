import type {
  FactionId,
  ResourceWallet,
  UnitBattleTag,
  UnitDefinition
} from './types';
import type { EnemyArmyProfileId } from './encounters';

export type TroopFamily =
  | 'conventional'
  | 'magic'
  | 'flying'
  | 'large'
  | 'hybrid';

export type CampaignProgressionStage = {
  chapter: number;
  theme: string;
  startSquadCap: number;
  endSquadCap: number;
  startRosterCap: number;
  endRosterCap: number;
  wagon: string;
  settlementStage:
    | 'camp'
    | 'settlement'
    | 'fort'
    | 'town'
    | 'stronghold'
    | 'capital'
    | 'grand';
  newFamily: TroopFamily | null;
  difficultyLesson: string;
};

export type FamilyUnlockDefinition = {
  faction: FactionId;
  family: Exclude<TroopFamily, 'conventional'>;
  chapterRequired: number;
  storyGateId: string;
  buildingName: string;
  firstStoryRewardUnitId: string;
  firstStoryRewardClass: string;
  campaignGateCanBeBypassed: false;
};

export type ResearchDefinition = {
  id: string;
  faction: FactionId;
  family: Exclude<TroopFamily, 'conventional'>;
  name: string;
  chapterRequired: number;
  storyGateId: string;
  durationHours: number;
  baseGemFinishCost: number;
  rewardedAdsToComplete: 3;
  unlocksClasses: string[];
  description: string;
};

export type FantasyRecruitTemplate = {
  id: string;
  researchId: string;
  faction: FactionId;
  family: Exclude<TroopFamily, 'conventional'>;
  className: string;
  role: UnitDefinition['role'];
  tier: number;
  level: number;
  hp: number;
  attack: number;
  armor: number;
  speed: number;
  battleTags: UnitBattleTag[];
  deploymentCapacity?: 1 | 2 | 3;
  cost: Partial<ResourceWallet>;
};

export const MAX_STANDARD_RESEARCH_HOURS = 24;
export const MAX_MAJOR_RESEARCH_GEM_COST = 30;
export const MAJOR_RESEARCH_REWARDED_ADS = 3;

export const campaignProgression: CampaignProgressionStage[] = [
  {
    chapter: 1,
    theme: 'Survive, recruit and establish a permanent camp',
    startSquadCap: 3,
    endSquadCap: 5,
    startRosterCap: 5,
    endRosterCap: 9,
    wagon: 'Worn Backpack → Pack Gear',
    settlementStage: 'settlement',
    newFamily: null,
    difficultyLesson: 'Front/rear positioning, Readiness, recovery and first equipment branches'
  },
  {
    chapter: 2,
    theme: 'Claim the road and turn the camp into an outpost',
    startSquadCap: 5,
    endSquadCap: 7,
    startRosterCap: 9,
    endRosterCap: 16,
    wagon: 'Pack Gear → Handcart',
    settlementStage: 'fort',
    newFamily: null,
    difficultyLesson: 'Three rows, cavalry, Brace/Charge counters, Support and reserves'
  },
  {
    chapter: 3,
    theme: 'Become a recognized regional military power',
    startSquadCap: 7,
    endSquadCap: 9,
    startRosterCap: 16,
    endRosterCap: 30,
    wagon: 'Handcart → Supply Cart',
    settlementStage: 'town',
    newFamily: null,
    difficultyLesson: 'Advanced formations, logistics, multi-battle campaigns and faction doctrine'
  },
  {
    chapter: 4,
    theme: 'The age of magic',
    startSquadCap: 9,
    endSquadCap: 9,
    startRosterCap: 30,
    endRosterCap: 30,
    wagon: 'Supply Cart',
    settlementStage: 'stronghold',
    newFamily: 'magic',
    difficultyLesson: 'Area pressure, caster protection and magic counterplay'
  },
  {
    chapter: 5,
    theme: 'The sky opens',
    startSquadCap: 9,
    endSquadCap: 9,
    startRosterCap: 30,
    endRosterCap: 30,
    wagon: 'Supply Cart → Wagon',
    settlementStage: 'capital',
    newFamily: 'flying',
    difficultyLesson: 'Backline access, interception, anti-air and aerial pressure'
  },
  {
    chapter: 6,
    theme: 'Combined arms',
    startSquadCap: 9,
    endSquadCap: 9,
    startRosterCap: 30,
    endRosterCap: 32,
    wagon: 'Wagon → Kingdom Caravan',
    settlementStage: 'grand',
    newFamily: null,
    difficultyLesson: 'Mixed enemy doctrines, reserves and attrition'
  },
  {
    chapter: 7,
    theme: 'Monsters and constructs',
    startSquadCap: 9,
    endSquadCap: 9,
    startRosterCap: 32,
    endRosterCap: 34,
    wagon: 'Kingdom Caravan',
    settlementStage: 'grand',
    newFamily: 'large',
    difficultyLesson: 'Deployment capacity, anti-large and formation breaking'
  },
  {
    chapter: 8,
    theme: 'Legendary warfare',
    startSquadCap: 9,
    endSquadCap: 9,
    startRosterCap: 34,
    endRosterCap: 36,
    wagon: 'Kingdom Caravan',
    settlementStage: 'grand',
    newFamily: 'hybrid',
    difficultyLesson: 'Hybrid threats and authored late-game army compositions'
  }
]

export const familyUnlocks: FamilyUnlockDefinition[] = [
  {
    faction: 'human',
    family: 'magic',
    chapterRequired: 4,
    storyGateId: 'human_reclaim_arcane_academy',
    buildingName: 'Arcane Academy',
    firstStoryRewardUnitId: 'hum_apprentice',
    firstStoryRewardClass: 'Apprentice',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'elf',
    family: 'magic',
    chapterRequired: 4,
    storyGateId: 'elf_awaken_circle_of_ancients',
    buildingName: 'Circle of Ancients',
    firstStoryRewardUnitId: 'elf_initiate',
    firstStoryRewardClass: 'Initiate',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'orc',
    family: 'magic',
    chapterRequired: 4,
    storyGateId: 'orc_call_the_ancestors',
    buildingName: 'Spirit Lodge',
    firstStoryRewardUnitId: 'orc_shaman',
    firstStoryRewardClass: 'Shaman',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'human',
    family: 'flying',
    chapterRequired: 5,
    storyGateId: 'human_establish_griffin_aerie',
    buildingName: 'Griffin Aerie',
    firstStoryRewardUnitId: 'hum_griffin_rider',
    firstStoryRewardClass: 'Griffin Rider',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'elf',
    family: 'flying',
    chapterRequired: 5,
    storyGateId: 'elf_establish_eagle_sanctuary',
    buildingName: 'Eagle Sanctuary',
    firstStoryRewardUnitId: 'elf_eagle_rider',
    firstStoryRewardClass: 'Eagle Rider',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'orc',
    family: 'flying',
    chapterRequired: 5,
    storyGateId: 'orc_establish_wyvern_roost',
    buildingName: 'Wyvern Roost',
    firstStoryRewardUnitId: 'orc_wyvern_rider',
    firstStoryRewardClass: 'Wyvern Rider',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'human',
    family: 'large',
    chapterRequired: 7,
    storyGateId: 'human_awaken_stone_guardian',
    buildingName: 'Construct Foundry',
    firstStoryRewardUnitId: 'hum_stone_golem',
    firstStoryRewardClass: 'Stone Golem',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'elf',
    family: 'large',
    chapterRequired: 7,
    storyGateId: 'elf_awaken_ancient_ent',
    buildingName: 'Ancient Grove',
    firstStoryRewardUnitId: 'elf_ancient_ent',
    firstStoryRewardClass: 'Ancient Ent',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'orc',
    family: 'large',
    chapterRequired: 7,
    storyGateId: 'orc_bind_war_troll',
    buildingName: 'Great Beast Pens',
    firstStoryRewardUnitId: 'orc_war_troll',
    firstStoryRewardClass: 'War Troll',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'human',
    family: 'hybrid',
    chapterRequired: 8,
    storyGateId: 'human_legendary_orders',
    buildingName: 'High Arcane Aerie',
    firstStoryRewardUnitId: 'hum_arcane_griffin_rider',
    firstStoryRewardClass: 'Arcane Griffin Rider',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'elf',
    family: 'hybrid',
    chapterRequired: 8,
    storyGateId: 'elf_legendary_orders',
    buildingName: 'Moonwing Sanctuary',
    firstStoryRewardUnitId: 'elf_moonwing_spellweaver',
    firstStoryRewardClass: 'Moonwing Spellweaver',
    campaignGateCanBeBypassed: false
  },
  {
    faction: 'orc',
    family: 'hybrid',
    chapterRequired: 8,
    storyGateId: 'orc_legendary_orders',
    buildingName: 'Elder Wyvern Shrine',
    firstStoryRewardUnitId: 'orc_wyvern_war_shaman',
    firstStoryRewardClass: 'Wyvern War Shaman',
    campaignGateCanBeBypassed: false
  }
];

export const fantasyStoryRewardUnits: UnitDefinition[] = [
  {
    id: 'hum_apprentice',
    name: 'Alden',
    className: 'Apprentice',
    faction: 'human',
    role: 'support',
    tier: 4,
    level: 7,
    hp: 108,
    attack: 18,
    armor: 6,
    speed: 9,
    battleTags: ['ground', 'magic', 'support'],
    deploymentCapacity: 1
  },
  {
    id: 'elf_initiate',
    name: 'Nymira',
    className: 'Initiate',
    faction: 'elf',
    role: 'support',
    tier: 4,
    level: 7,
    hp: 98,
    attack: 18,
    armor: 5,
    speed: 13,
    battleTags: ['ground', 'magic', 'support'],
    deploymentCapacity: 1
  },
  {
    id: 'orc_shaman',
    name: 'Ghorra',
    className: 'Shaman',
    faction: 'orc',
    role: 'support',
    tier: 4,
    level: 7,
    hp: 122,
    attack: 17,
    armor: 7,
    speed: 9,
    battleTags: ['ground', 'magic', 'support'],
    deploymentCapacity: 1
  },
  {
    id: 'hum_griffin_rider',
    name: 'Ser Kael',
    className: 'Griffin Rider',
    faction: 'human',
    role: 'cavalry',
    tier: 5,
    level: 9,
    hp: 138,
    attack: 25,
    armor: 10,
    speed: 18,
    battleTags: ['flying', 'mounted', 'beast', 'charge'],
    deploymentCapacity: 1
  },
  {
    id: 'elf_eagle_rider',
    name: 'Ilyra',
    className: 'Eagle Rider',
    faction: 'elf',
    role: 'skirmish',
    tier: 5,
    level: 9,
    hp: 120,
    attack: 24,
    armor: 7,
    speed: 21,
    battleTags: ['flying', 'mounted', 'beast', 'ranged'],
    deploymentCapacity: 1
  },
  {
    id: 'orc_wyvern_rider',
    name: 'Kragg',
    className: 'Wyvern Rider',
    faction: 'orc',
    role: 'cavalry',
    tier: 5,
    level: 9,
    hp: 150,
    attack: 28,
    armor: 9,
    speed: 17,
    battleTags: ['flying', 'mounted', 'beast', 'charge'],
    deploymentCapacity: 1
  },
  {
    id: 'hum_stone_golem',
    name: 'Bastion IX',
    className: 'Stone Golem',
    faction: 'human',
    role: 'frontline',
    tier: 7,
    level: 12,
    hp: 245,
    attack: 31,
    armor: 20,
    speed: 5,
    battleTags: ['ground', 'large', 'construct', 'armored'],
    deploymentCapacity: 2
  },
  {
    id: 'elf_ancient_ent',
    name: 'Thornwake',
    className: 'Ancient Ent',
    faction: 'elf',
    role: 'frontline',
    tier: 7,
    level: 12,
    hp: 228,
    attack: 30,
    armor: 16,
    speed: 7,
    battleTags: ['ground', 'large', 'support'],
    deploymentCapacity: 2
  },
  {
    id: 'orc_war_troll',
    name: 'Morgash',
    className: 'War Troll',
    faction: 'orc',
    role: 'melee',
    tier: 7,
    level: 12,
    hp: 260,
    attack: 36,
    armor: 13,
    speed: 7,
    battleTags: ['ground', 'large', 'beast'],
    deploymentCapacity: 2
  },
  {
    id: 'hum_arcane_griffin_rider',
    name: 'Valerius',
    className: 'Arcane Griffin Rider',
    faction: 'human',
    role: 'cavalry',
    tier: 8,
    level: 14,
    hp: 168,
    attack: 36,
    armor: 13,
    speed: 19,
    battleTags: ['flying', 'mounted', 'beast', 'magic', 'charge'],
    deploymentCapacity: 2
  },
  {
    id: 'elf_moonwing_spellweaver',
    name: 'Selene',
    className: 'Moonwing Spellweaver',
    faction: 'elf',
    role: 'support',
    tier: 8,
    level: 14,
    hp: 142,
    attack: 34,
    armor: 10,
    speed: 22,
    battleTags: ['flying', 'mounted', 'magic', 'support'],
    deploymentCapacity: 2
  },
  {
    id: 'orc_wyvern_war_shaman',
    name: 'Drazha',
    className: 'Wyvern War Shaman',
    faction: 'orc',
    role: 'support',
    tier: 8,
    level: 14,
    hp: 178,
    attack: 35,
    armor: 12,
    speed: 18,
    battleTags: ['flying', 'mounted', 'beast', 'magic', 'support'],
    deploymentCapacity: 2
  }
];

export const researchDefinitions: ResearchDefinition[] = [
  {
    id: 'human_mage_training',
    faction: 'human',
    family: 'magic',
    name: 'Mage Training',
    chapterRequired: 4,
    storyGateId: 'human_reclaim_arcane_academy',
    durationHours: 8,
    baseGemFinishCost: 12,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Mage'],
    description: 'Turns the first Human arcane discovery into a repeatable Mage training recipe.'
  },
  {
    id: 'human_battlemage_training',
    faction: 'human',
    family: 'magic',
    name: 'Battlemage Training',
    chapterRequired: 4,
    storyGateId: 'human_reclaim_arcane_academy',
    durationHours: 12,
    baseGemFinishCost: 18,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Battlemage'],
    description: 'Combines arcane training with sword and medium-armor doctrine.'
  },
  {
    id: 'elf_spellweaving',
    faction: 'elf',
    family: 'magic',
    name: 'Spellweaving',
    chapterRequired: 4,
    storyGateId: 'elf_awaken_circle_of_ancients',
    durationHours: 8,
    baseGemFinishCost: 12,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Spellweaver'],
    description: 'Formalizes battlefield spellcraft without replacing conventional Elven units.'
  },
  {
    id: 'elf_grove_calling',
    faction: 'elf',
    family: 'magic',
    name: 'Grove Calling',
    chapterRequired: 4,
    storyGateId: 'elf_awaken_circle_of_ancients',
    durationHours: 12,
    baseGemFinishCost: 18,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Druid'],
    description: 'Unlocks a control and support branch rooted in terrain and living wards.'
  },
  {
    id: 'orc_spirit_calling',
    faction: 'orc',
    family: 'magic',
    name: 'Spirit Calling',
    chapterRequired: 4,
    storyGateId: 'orc_call_the_ancestors',
    durationHours: 8,
    baseGemFinishCost: 12,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Spiritcaller'],
    description: 'Expands the Shaman line into battlefield spirit and curse control.'
  },
  {
    id: 'orc_war_shaman_training',
    faction: 'orc',
    family: 'magic',
    name: 'War Shaman Training',
    chapterRequired: 4,
    storyGateId: 'orc_call_the_ancestors',
    durationHours: 12,
    baseGemFinishCost: 18,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['War Shaman'],
    description: 'Combines Shaman rites with aggressive frontline equipment.'
  },
  {
    id: 'human_griffin_handling',
    faction: 'human',
    family: 'flying',
    name: 'Griffin Handling',
    chapterRequired: 5,
    storyGateId: 'human_establish_griffin_aerie',
    durationHours: 24,
    baseGemFinishCost: 30,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Griffin Rider', 'Griffin Lancer', 'Griffin Archer'],
    description: 'Major aerial doctrine unlocked only after the Griffin Aerie story gate.'
  },
  {
    id: 'elf_eagle_handling',
    faction: 'elf',
    family: 'flying',
    name: 'Great Eagle Handling',
    chapterRequired: 5,
    storyGateId: 'elf_establish_eagle_sanctuary',
    durationHours: 24,
    baseGemFinishCost: 30,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Eagle Rider', 'Eagle Archer'],
    description: 'Major aerial doctrine unlocked only after the Eagle Sanctuary story gate.'
  },
  {
    id: 'orc_wyvern_handling',
    faction: 'orc',
    family: 'flying',
    name: 'Wyvern Handling',
    chapterRequired: 5,
    storyGateId: 'orc_establish_wyvern_roost',
    durationHours: 24,
    baseGemFinishCost: 30,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Wyvern Rider', 'Wyvern Lancer'],
    description: 'Major aerial doctrine unlocked only after the Wyvern Roost story gate.'
  },
  {
    id: 'human_construct_mastery',
    faction: 'human',
    family: 'large',
    name: 'Construct Mastery',
    chapterRequired: 7,
    storyGateId: 'human_awaken_stone_guardian',
    durationHours: 24,
    baseGemFinishCost: 30,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Stone Golem', 'Arcane Golem'],
    description: 'Advanced construct doctrine; rare materials remain mandatory.'
  },
  {
    id: 'elf_ancient_guardian_mastery',
    faction: 'elf',
    family: 'large',
    name: 'Ancient Guardian Mastery',
    chapterRequired: 7,
    storyGateId: 'elf_awaken_ancient_ent',
    durationHours: 24,
    baseGemFinishCost: 30,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Ancient Ent', 'Grove Guardian'],
    description: 'Advanced living-guardian doctrine; story and material requirements cannot be skipped.'
  },
  {
    id: 'orc_great_beast_mastery',
    faction: 'orc',
    family: 'large',
    name: 'Great Beast Mastery',
    chapterRequired: 7,
    storyGateId: 'orc_bind_war_troll',
    durationHours: 24,
    baseGemFinishCost: 30,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['War Troll', 'War Mammoth'],
    description: 'Advanced great-beast doctrine; story and material requirements cannot be skipped.'
  },
  {
    id: 'human_legendary_hybrid_doctrine',
    faction: 'human',
    family: 'hybrid',
    name: 'Legendary Arcane Aerial Doctrine',
    chapterRequired: 8,
    storyGateId: 'human_legendary_orders',
    durationHours: 24,
    baseGemFinishCost: 30,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Arcane Griffin Rider'],
    description: 'Late-game hybrid doctrine requiring both Magic and Flying progression.'
  },
  {
    id: 'elf_legendary_hybrid_doctrine',
    faction: 'elf',
    family: 'hybrid',
    name: 'Moonwing Spell Doctrine',
    chapterRequired: 8,
    storyGateId: 'elf_legendary_orders',
    durationHours: 24,
    baseGemFinishCost: 30,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Moonwing Spellweaver'],
    description: 'Late-game hybrid doctrine requiring both Magic and Flying progression.'
  },
  {
    id: 'orc_legendary_hybrid_doctrine',
    faction: 'orc',
    family: 'hybrid',
    name: 'Wyvern War-Rite Doctrine',
    chapterRequired: 8,
    storyGateId: 'orc_legendary_orders',
    durationHours: 24,
    baseGemFinishCost: 30,
    rewardedAdsToComplete: 3,
    unlocksClasses: ['Wyvern War Shaman'],
    description: 'Late-game hybrid doctrine requiring both Magic and Flying progression.'
  }
];

export const fantasyRecruitTemplates: FantasyRecruitTemplate[] = [
  {
    id: 'human_mage',
    researchId: 'human_mage_training',
    faction: 'human',
    family: 'magic',
    className: 'Mage',
    role: 'ranged',
    tier: 4,
    level: 7,
    hp: 104,
    attack: 24,
    armor: 5,
    speed: 10,
    battleTags: ['ground', 'magic', 'ranged'],
    deploymentCapacity: 2,
    cost: { gold: 140, wood: 10, iron: 18, provisions: 4 }
  },
  {
    id: 'human_battlemage',
    researchId: 'human_battlemage_training',
    faction: 'human',
    family: 'magic',
    className: 'Battlemage',
    role: 'melee',
    tier: 4,
    level: 7,
    hp: 132,
    attack: 22,
    armor: 11,
    speed: 9,
    battleTags: ['ground', 'magic', 'armored'],
    deploymentCapacity: 2,
    cost: { gold: 175, iron: 25, provisions: 6 }
  },
  {
    id: 'elf_spellweaver',
    researchId: 'elf_spellweaving',
    faction: 'elf',
    family: 'magic',
    className: 'Spellweaver',
    role: 'ranged',
    tier: 4,
    level: 7,
    hp: 98,
    attack: 24,
    armor: 4,
    speed: 14,
    battleTags: ['ground', 'magic', 'ranged'],
    cost: { gold: 140, wood: 15, provisions: 4 }
  },
  {
    id: 'elf_druid',
    researchId: 'elf_grove_calling',
    faction: 'elf',
    family: 'magic',
    className: 'Druid',
    role: 'support',
    tier: 4,
    level: 7,
    hp: 112,
    attack: 18,
    armor: 7,
    speed: 12,
    battleTags: ['ground', 'magic', 'support'],
    cost: { gold: 165, wood: 20, provisions: 8 }
  },
  {
    id: 'orc_spiritcaller',
    researchId: 'orc_spirit_calling',
    faction: 'orc',
    family: 'magic',
    className: 'Spiritcaller',
    role: 'ranged',
    tier: 4,
    level: 7,
    hp: 116,
    attack: 23,
    armor: 6,
    speed: 10,
    battleTags: ['ground', 'magic', 'ranged'],
    cost: { gold: 135, wood: 10, provisions: 6 }
  },
  {
    id: 'orc_war_shaman',
    researchId: 'orc_war_shaman_training',
    faction: 'orc',
    family: 'magic',
    className: 'War Shaman',
    role: 'support',
    tier: 4,
    level: 7,
    hp: 140,
    attack: 22,
    armor: 10,
    speed: 9,
    battleTags: ['ground', 'magic', 'support', 'armored'],
    cost: { gold: 175, iron: 18, provisions: 8 }
  },

  {
    id: 'human_griffin_rider',
    researchId: 'human_griffin_handling',
    faction: 'human',
    family: 'flying',
    className: 'Griffin Rider',
    role: 'cavalry',
    tier: 5,
    level: 9,
    hp: 138,
    attack: 25,
    armor: 10,
    speed: 18,
    battleTags: ['flying', 'mounted', 'beast', 'charge'],
    cost: { gold: 240, iron: 24, provisions: 10 }
  },
  {
    id: 'human_griffin_lancer',
    researchId: 'human_griffin_handling',
    faction: 'human',
    family: 'flying',
    className: 'Griffin Lancer',
    role: 'cavalry',
    tier: 5,
    level: 9,
    hp: 145,
    attack: 28,
    armor: 11,
    speed: 17,
    battleTags: ['flying', 'mounted', 'beast', 'charge', 'armored'],
    cost: { gold: 280, iron: 32, provisions: 12 }
  },
  {
    id: 'human_griffin_archer',
    researchId: 'human_griffin_handling',
    faction: 'human',
    family: 'flying',
    className: 'Griffin Archer',
    role: 'ranged',
    tier: 5,
    level: 9,
    hp: 125,
    attack: 27,
    armor: 8,
    speed: 18,
    battleTags: ['flying', 'mounted', 'beast', 'ranged'],
    cost: { gold: 270, wood: 18, iron: 22, provisions: 12 }
  },
  {
    id: 'elf_eagle_rider',
    researchId: 'elf_eagle_handling',
    faction: 'elf',
    family: 'flying',
    className: 'Eagle Rider',
    role: 'skirmish',
    tier: 5,
    level: 9,
    hp: 120,
    attack: 24,
    armor: 7,
    speed: 21,
    battleTags: ['flying', 'mounted', 'beast', 'ranged'],
    cost: { gold: 230, wood: 20, iron: 10, provisions: 10 }
  },
  {
    id: 'elf_eagle_archer',
    researchId: 'elf_eagle_handling',
    faction: 'elf',
    family: 'flying',
    className: 'Eagle Archer',
    role: 'ranged',
    tier: 5,
    level: 9,
    hp: 112,
    attack: 27,
    armor: 6,
    speed: 22,
    battleTags: ['flying', 'mounted', 'beast', 'ranged'],
    cost: { gold: 265, wood: 25, iron: 12, provisions: 12 }
  },
  {
    id: 'orc_wyvern_rider',
    researchId: 'orc_wyvern_handling',
    faction: 'orc',
    family: 'flying',
    className: 'Wyvern Rider',
    role: 'cavalry',
    tier: 5,
    level: 9,
    hp: 150,
    attack: 28,
    armor: 9,
    speed: 17,
    battleTags: ['flying', 'mounted', 'beast', 'charge'],
    cost: { gold: 245, iron: 22, provisions: 12 }
  },
  {
    id: 'orc_wyvern_lancer',
    researchId: 'orc_wyvern_handling',
    faction: 'orc',
    family: 'flying',
    className: 'Wyvern Lancer',
    role: 'cavalry',
    tier: 5,
    level: 9,
    hp: 158,
    attack: 31,
    armor: 10,
    speed: 16,
    battleTags: ['flying', 'mounted', 'beast', 'charge', 'armored'],
    cost: { gold: 285, iron: 30, provisions: 14 }
  },

  {
    id: 'human_stone_golem',
    researchId: 'human_construct_mastery',
    faction: 'human',
    family: 'large',
    className: 'Stone Golem',
    role: 'frontline',
    tier: 7,
    level: 12,
    hp: 245,
    attack: 31,
    armor: 20,
    speed: 5,
    battleTags: ['ground', 'large', 'construct', 'armored'],
    deploymentCapacity: 2,
    cost: { gold: 420, stone: 55, iron: 40, provisions: 8 }
  },
  {
    id: 'human_arcane_golem',
    researchId: 'human_construct_mastery',
    faction: 'human',
    family: 'large',
    className: 'Arcane Golem',
    role: 'frontline',
    tier: 7,
    level: 12,
    hp: 225,
    attack: 36,
    armor: 18,
    speed: 6,
    battleTags: ['ground', 'large', 'construct', 'armored', 'magic'],
    deploymentCapacity: 2,
    cost: { gold: 500, stone: 45, iron: 45, provisions: 8 }
  },
  {
    id: 'elf_ancient_ent',
    researchId: 'elf_ancient_guardian_mastery',
    faction: 'elf',
    family: 'large',
    className: 'Ancient Ent',
    role: 'frontline',
    tier: 7,
    level: 12,
    hp: 228,
    attack: 30,
    armor: 16,
    speed: 7,
    battleTags: ['ground', 'large', 'support'],
    deploymentCapacity: 2,
    cost: { gold: 390, wood: 65, provisions: 18 }
  },
  {
    id: 'elf_grove_guardian',
    researchId: 'elf_ancient_guardian_mastery',
    faction: 'elf',
    family: 'large',
    className: 'Grove Guardian',
    role: 'support',
    tier: 7,
    level: 12,
    hp: 210,
    attack: 28,
    armor: 17,
    speed: 8,
    battleTags: ['ground', 'large', 'support', 'magic'],
    deploymentCapacity: 2,
    cost: { gold: 455, wood: 75, provisions: 20 }
  },
  {
    id: 'orc_war_troll',
    researchId: 'orc_great_beast_mastery',
    faction: 'orc',
    family: 'large',
    className: 'War Troll',
    role: 'melee',
    tier: 7,
    level: 12,
    hp: 260,
    attack: 36,
    armor: 13,
    speed: 7,
    battleTags: ['ground', 'large', 'beast'],
    deploymentCapacity: 2,
    cost: { gold: 400, iron: 30, provisions: 28 }
  },
  {
    id: 'orc_war_mammoth',
    researchId: 'orc_great_beast_mastery',
    faction: 'orc',
    family: 'large',
    className: 'War Mammoth',
    role: 'frontline',
    tier: 7,
    level: 12,
    hp: 290,
    attack: 34,
    armor: 15,
    speed: 6,
    battleTags: ['ground', 'large', 'beast', 'armored', 'charge'],
    deploymentCapacity: 2,
    cost: { gold: 520, iron: 35, provisions: 34 }
  },
];

export type FantasyCombatEdge = {
  unitCount: number;
  attackMultiplier: number;
  incomingDamageMultiplier: number;
  title: string;
  detail: string;
  favorable: boolean;
};

export function getLargeCombatEdge(
  activeUnits: UnitDefinition[],
  enemyProfileId: EnemyArmyProfileId
): FantasyCombatEdge | null {
  const largeUnits = activeUnits.filter(unit =>
    unitHasBattleTag(unit, 'large')
  ).length;

  if (largeUnits === 0) return null;

  let attackMultiplier =
    1 + Math.min(0.07, largeUnits * 0.035);
  let incomingDamageMultiplier = 1;
  let title = 'Formation breaker';
  let detail =
    'Large units trade deployment capacity for raw staying power and can disrupt compact ground formations.';
  let favorable = true;

  if (
    enemyProfileId === 'shield_host' ||
    enemyProfileId === 'shock_warband'
  ) {
    attackMultiplier =
      1 + Math.min(0.12, largeUnits * 0.06);
    title = 'Crush the line';
    detail =
      'Large units excel at breaking dense shield and shock formations.';
  } else if (enemyProfileId === 'missile_company') {
    incomingDamageMultiplier =
      1 + Math.min(0.12, largeUnits * 0.06);
    title = 'Concentrated volleys';
    detail =
      'Massed ranged fire can focus large targets before they reach the line.';
    favorable = false;
  } else if (enemyProfileId === 'elite_command') {
    attackMultiplier =
      Math.max(0.94, 1 - largeUnits * 0.03);
    incomingDamageMultiplier =
      1 + Math.min(0.1, largeUnits * 0.05);
    title = 'Anti-large discipline';
    detail =
      'Elite command troops coordinate spears and focus fire against oversized targets.';
    favorable = false;
  }

  return {
    unitCount: largeUnits,
    attackMultiplier,
    incomingDamageMultiplier,
    title,
    detail,
    favorable
  };
}

export function getFlyingCombatEdge(
  activeUnits: UnitDefinition[],
  enemyProfileId: EnemyArmyProfileId
): FantasyCombatEdge | null {
  const flyingUnits = activeUnits.filter(unit =>
    unitHasBattleTag(unit, 'flying')
  ).length;

  if (flyingUnits === 0) return null;

  let attackMultiplier =
    1 + Math.min(0.08, flyingUnits * 0.025);
  let incomingDamageMultiplier = 1;
  let title = 'Aerial pressure';
  let detail =
    'Flying squads bypass parts of the frontline and pressure protected rear positions.';
  let favorable = true;

  if (
    enemyProfileId === 'shield_host' ||
    enemyProfileId === 'elite_command'
  ) {
    attackMultiplier =
      1 + Math.min(0.12, flyingUnits * 0.04);
    title = 'Backline access';
    detail =
      'Flying squads can reach protected specialists behind a dense ground screen.';
  } else if (enemyProfileId === 'missile_company') {
    attackMultiplier =
      Math.max(0.94, 1 - flyingUnits * 0.02);
    incomingDamageMultiplier =
      1 + Math.min(0.12, flyingUnits * 0.04);
    title = 'Anti-air fire';
    detail =
      'Concentrated missile troops punish exposed aerial squads. Use ground pressure or a tougher screen to split their fire.';
    favorable = false;
  } else if (enemyProfileId === 'mounted_hunters') {
    attackMultiplier =
      1 + Math.min(0.09, flyingUnits * 0.03);
    title = 'Air superiority';
    detail =
      'Flying squads ignore much of the enemy mounted screen and can choose favorable engagements.';
  }

  return {
    unitCount: flyingUnits,
    attackMultiplier,
    incomingDamageMultiplier,
    title,
    detail,
    favorable
  };
}

export function getFantasyCombatEdge(
  activeUnits: UnitDefinition[],
  enemyProfileId: EnemyArmyProfileId
): FantasyCombatEdge | null {
  const magicUnits = activeUnits.filter(unit =>
    unitHasBattleTag(unit, 'magic')
  ).length;

  if (magicUnits === 0) return null;

  const protectiveUnits = activeUnits.filter(unit =>
    unit.role === 'frontline' ||
    unit.role === 'melee' ||
    unit.role === 'cavalry'
  ).length;

  let attackMultiplier =
    1 + Math.min(0.06, magicUnits * 0.02);
  let title = 'Arcane pressure';
  let detail =
    'Magic adds flexible pressure without replacing conventional protection.';
  let favorable = true;

  if (enemyProfileId === 'shield_host') {
    attackMultiplier =
      1 + Math.min(0.12, magicUnits * 0.04);
    title = 'Arcane breach';
    detail =
      'Magic performs especially well into dense shield formations.';
  } else if (enemyProfileId === 'warded_host') {
    attackMultiplier =
      Math.max(0.92, 1 - magicUnits * 0.025);
    title = 'Enemy wards';
    detail =
      'Warded troops blunt direct spell pressure. Conventional damage remains important.';
    favorable = false;
  } else if (enemyProfileId === 'elite_command') {
    attackMultiplier =
      1 + Math.min(0.08, magicUnits * 0.03);
    title = 'Disrupt command';
    detail =
      'Magic can pressure protected command elements if the casters remain screened.';
  }

  const exposedCasters =
    protectiveUnits < 2 &&
    (
      enemyProfileId === 'mounted_hunters' ||
      enemyProfileId === 'shock_warband'
    );

  return {
    unitCount: magicUnits,
    attackMultiplier,
    incomingDamageMultiplier: exposedCasters ? 1.06 : 1,
    title,
    detail: exposedCasters
      ? detail + ' Your caster screen is thin, increasing incoming pressure.'
      : detail,
    favorable: favorable && !exposedCasters
  };
}

export function getFantasyRecruitTemplates(
  faction: FactionId,
  family: Exclude<TroopFamily, 'conventional'> = 'magic'
) {
  return fantasyRecruitTemplates.filter(
    template =>
      template.faction === faction &&
      template.family === family
  );
}

export function getUnitDeploymentCapacity(unit: UnitDefinition) {
  return unit.deploymentCapacity ?? 1;
}

export function unitHasBattleTag(
  unit: UnitDefinition,
  tag: UnitBattleTag
) {
  return unit.battleTags?.includes(tag) ?? false;
}

export function getArmyDeploymentCapacity(units: UnitDefinition[]) {
  return units.reduce(
    (total, unit) => total + getUnitDeploymentCapacity(unit),
    0
  );
}

export function canStartResearch(
  research: ResearchDefinition,
  currentChapter: number,
  completedStoryGates: string[]
) {
  return (
    currentChapter >= research.chapterRequired &&
    completedStoryGates.includes(research.storyGateId)
  );
}

export function getResearchRemainingHours(
  research: ResearchDefinition,
  elapsedHours: number,
  rewardedAdsWatched: number
) {
  const ads = Math.max(
    0,
    Math.min(research.rewardedAdsToComplete, Math.floor(rewardedAdsWatched))
  );
  const adReduction =
    research.durationHours *
    (ads / research.rewardedAdsToComplete);
  return Math.max(
    0,
    research.durationHours - Math.max(0, elapsedHours) - adReduction
  );
}

export function getResearchGemFinishCost(
  research: ResearchDefinition,
  remainingHours: number
) {
  if (remainingHours <= 0) return 0;
  const fraction = Math.min(
    1,
    remainingHours / research.durationHours
  );
  return Math.max(
    1,
    Math.ceil(research.baseGemFinishCost * fraction)
  );
}

export function getFamilyUnlock(
  faction: FactionId,
  family: Exclude<TroopFamily, 'conventional'>
) {
  return (
    familyUnlocks.find(
      unlock =>
        unlock.faction === faction &&
        unlock.family === family
    ) ?? null
  );
}

export function getFantasyStoryRewardUnit(id: string) {
  return fantasyStoryRewardUnits.find(unit => unit.id === id) ?? null;
}
