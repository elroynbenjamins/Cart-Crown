export type FactionId = 'human' | 'elf' | 'orc';
export type NavId = 'kingdom' | 'campaign' | 'formation' | 'wagon' | 'army';
export type UnitRole = 'frontline' | 'melee' | 'ranged' | 'support' | 'cavalry' | 'skirmish';

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
