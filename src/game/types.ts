export type FactionId = 'human' | 'elf' | 'orc';
export type CampaignId = FactionId | 'meta';
export type NavId = 'kingdom' | 'campaign' | 'formation' | 'wagon' | 'army';
export type UnitRole = 'frontline' | 'melee' | 'ranged' | 'support' | 'cavalry' | 'skirmish';
export type SideModeId = 'expeditions' | 'formation_trials' | 'kingdom_defense' | 'relic_hunts';
export type EquipmentSlot = 'weapon' | 'armor' | 'shield' | 'mount' | 'artifact';
export type CommanderSkillEffectType =
  | 'single_damage'
  | 'bleed'
  | 'morale_break'
  | 'armor_break';

export type ResourceWallet = {
  gold: number;
  wood: number;
  stone: number;
  iron: number;
  provisions: number;
};

export type UnitDefinition = {
  id: string;
  name: string;
  className: string;
  faction: FactionId;
  role: UnitRole;
  tier: number;
  level: number;
  hp: number;
  attack: number;
  armor: number;
  speed: number;
  promotionReady?: boolean;
};

export type EquipmentDefinition = {
  id: string;
  name: string;
  faction: FactionId | 'global';
  slot: EquipmentSlot;
  tier: number;
  tags: string[];
  attackBonus: number;
  armorBonus: number;
  speedBonus: number;
  craftCost: Partial<ResourceWallet>;
  description: string;
};

export type CommanderSkillDefinition = {
  id: string;
  name: string;
  effectType: CommanderSkillEffectType;
  power: number;
  durationExchanges: number;
  description: string;
};

export type CommanderPathDefinition = {
  id: string;
  faction: FactionId;
  name: string;
  title: string;
  favoredRoles: UnitRole[];
  passiveName: string;
  passiveDescription: string;
  attackMultiplier: number;
  armorMultiplier: number;
  speedMultiplier: number;
  skill: CommanderSkillDefinition;
};

export type PromotionDefinition = {
  id: string;
  faction: FactionId;
  fromClass: string;
  toClass: string;
  role: UnitRole;
  requiredEquipmentId: string;
  attackBonus: number;
  armorBonus: number;
  speedBonus: number;
  pitch: string;
};

export type WagonItemDefinition = {
  id: string;
  name: string;
  shortName: string;
  faction: FactionId | 'global';
  width: number;
  height: number;
  rotation: 0 | 90;
  effect: string;
  x: number;
  y: number;
};

export type WagonStage = {
  id: string;
  name: string;
  width: number;
  height: number;
  formationSlots: number;
};

export type RegionDefinition = {
  id: string;
  name: string;
  faction: FactionId | 'neutral';
  x: number;
  y: number;
  state: 'current' | 'locked' | 'secured' | 'hostile';
};

export type ChapterNode = {
  id: string;
  name: string;
  type: 'story' | 'battle' | 'event' | 'elite' | 'supply' | 'boss';
  completed: boolean;
  current?: boolean;
};

export type RecruitOption = {
  id: string;
  unit: UnitDefinition;
  archetype: string;
  pitch: string;
  tradeoff: string;
};

export type BattleResult = {
  id: string;
  title: string;
  victory: boolean;
  summary: string;
  rewards: Partial<ResourceWallet>;
  casualties: number;
};

export type EncounterDefinition = {
  id: string;
  name: string;
  subtitle: string;
  enemyName: string;
  enemyCount: number;
  enemyHp: number;
  difficulty: 'Normal' | 'Elite' | 'Boss';
};

export type FormationBonus = {
  id: string;
  name: string;
  description: string;
  value: string;
  active: boolean;
};

export type FormationDoctrine = {
  id: string;
  faction: FactionId;
  name: string;
  description: string;
  unlock: 'Start' | 'Settlement' | 'Fort' | 'Town' | 'Stronghold';
};

export type SideModeDefinition = {
  id: SideModeId;
  name: string;
  subtitle: string;
  description: string;
  unlockStage: 'settlement' | 'fort' | 'stronghold';
  rewardFocus: string;
  example: string;
};

export type CampaignAvailability = {
  id: CampaignId;
  unlocked: boolean;
  completed: boolean;
  unlockText: string;
};
