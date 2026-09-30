export type FactionId = 'human' | 'elf' | 'orc';
export type CampaignId = FactionId | 'meta';
export type NavId = 'kingdom' | 'campaign' | 'formation' | 'wagon' | 'army';
export type UnitRole = 'frontline' | 'melee' | 'ranged' | 'support' | 'cavalry' | 'skirmish';
export type EnemyFantasyThreatFamily =
  | 'magic'
  | 'flying'
  | 'large'
  | 'hybrid';

export type UnitBattleTag =
  | 'ground'
  | 'mounted'
  | 'ranged'
  | 'magic'
  | 'flying'
  | 'large'
  | 'construct'
  | 'beast'
  | 'anti_air'
  | 'anti_large'
  | 'armored'
  | 'support'
  | 'charge';

export type FormationShapeId =
  | 'balanced_333'
  | 'assault_432'
  | 'deep_234'
  | 'wide_vanguard_522'
  | 'protected_rear_225'
  | 'reinforced_center_252'
  | 'heavy_front_441'
  | 'spear_wall_531'
  | 'skirmish_screen_243';

export type FormationShapeDefinition = {
  id: FormationShapeId;
  name: string;
  layout: string;
  rows: {
    front: number[];
    middle: number[];
    rear: number[];
  };
  unlock: 'Start' | 'Settlement' | 'Fort' | 'Town' | 'Stronghold';
  summary: string;
  strength: string;
  risk: string;
};

export type FormationPresetSlotId = 1 | 2 | 3;

export type FormationPreset = {
  slotId: FormationPresetSlotId;
  formationShapeId: FormationShapeId;
  formationDoctrineId: string;
  formation: Array<string | null>;
  unitEquipment?: Record<string, UnitEquipmentLoadout>;
};
export type SideModeId = 'war_table' | 'expeditions' | 'formation_trials' | 'kingdom_defense' | 'sieges' | 'relic_hunts';
export type EquipmentSlot = 'weapon' | 'armor' | 'shield' | 'mount' | 'artifact';
export type EquipmentRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'relic';
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
  battleTags?: UnitBattleTag[];
  deploymentCapacity?: 1 | 2 | 3;
  promotionReady?: boolean;
};

export type EquipmentDefinition = {
  id: string;
  name: string;
  faction: FactionId | 'global';
  slot: EquipmentSlot;
  tier: number;
  rarity?: EquipmentRarity;
  tags: string[];
  attackBonus: number;
  armorBonus: number;
  speedBonus: number;
  craftCost: Partial<ResourceWallet>;
  requiredForgeLevel: number;
  requiredStableLevel?: number;
  upgradeFromId?: string;
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

export type AdvancedPromotionDefinition = {
  id: string;
  faction: FactionId;
  fromClass: string;
  toClass: string;
  role: UnitRole;
  requiredEquippedIds: string[];
  requiredBarracksLevel: number;
  requiredForgeLevel: number;
  requiredStableLevel?: number;
  requiredOfficerAcademyLevel?: number;
  attackBonus: number;
  armorBonus: number;
  speedBonus: number;
  pitch: string;
};

export type BuildingRole =
  | 'KINGDOM'
  | 'ARMY'
  | 'EQUIPMENT'
  | 'LOGISTICS'
  | 'SUPPLY'
  | 'COMMAND'
  | 'MOUNT'
  | 'SCOUT';

export type BuildingDefinition = {
  id: string;
  faction: FactionId;
  name: string;
  role: BuildingRole;
  icon: string;
  maxLevel: number;
  constructionCost: Partial<ResourceWallet>;
  description: string;
};

export type SettlementPlotDefinition = {
  id: string;
  row: number;
  column: number;
  unlockStage: 'camp' | 'settlement' | 'fort' | 'town' | 'stronghold';
  terrain: 'grass' | 'high_ground' | 'roadside' | 'square';
};

export type SettlementAdjacencyEffects = {
  equipmentCostMultiplier: number;
  mountCostMultiplier: number;
  expeditionWoodBonus: number;
  expeditionProvisionBonus: number;
  dailyProvisionBonus: number;
  commanderSkillPowerMultiplier: number;
  commanderRespecDiscount: number;
  commanderSkillEarlyTrigger: boolean;
  detailedIntel: boolean;
};

export type SettlementAdjacencyBonusDefinition = {
  id: string;
  name: string;
  buildingA: string;
  buildingB: string;
  description: string;
  effectText: string;
  effects: Partial<SettlementAdjacencyEffects>;
};

export type ActiveSettlementAdjacencyBonus = SettlementAdjacencyBonusDefinition & {
  plotA: string;
  plotB: string;
};

export type BuildingLevelDefinition = {
  buildingId: string;
  level: number;
  cost: Partial<ResourceWallet>;
  effect: string;
  requirement: string;
};

export type UnitEquipmentLoadout = Partial<Record<EquipmentSlot, string>>;

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
  pressureMultiplier?: number;
  fantasyThreat?: EnemyFantasyThreatFamily;
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

export type ResourceSiteDefinition = {
  id: string;
  faction: FactionId;
  name: string;
  icon: string;
  description: string;
  productionPerActivity: Partial<ResourceWallet>;
};

export type SideModeDefinition = {
  id: SideModeId;
  name: string;
  subtitle: string;
  description: string;
  unlockStage: 'camp' | 'settlement' | 'fort' | 'stronghold';
  rewardFocus: string;
  example: string;
};

export type CampaignAvailability = {
  id: CampaignId;
  unlocked: boolean;
  completed: boolean;
  unlockText: string;
};
