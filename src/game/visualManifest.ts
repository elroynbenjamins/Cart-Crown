export type UnitVisualKind =
  | 'infantry'
  | 'archer'
  | 'scout'
  | 'scout_rider'
  | 'cavalryman'
  | 'lancer'
  | 'mounted_archer';

export type EquipmentVisualKind =
  | 'sword'
  | 'spear'
  | 'bow'
  | 'shield'
  | 'armor'
  | 'horse';

export type BuildingVisualKind =
  | 'hall'
  | 'barracks'
  | 'forge'
  | 'wagonwright'
  | 'quartermaster'
  | 'war_room'
  | 'stable'
  | 'signal_tower'
  | 'officer_academy';

export type ResourceVisualKind =
  | 'gold'
  | 'wood'
  | 'stone'
  | 'iron'
  | 'provisions';

export type WagonItemVisualKind =
  | 'rations'
  | 'medicine'
  | 'banner'
  | 'repair';

export const VISUAL_ASSET_VERSION = 2;

export const unitClassVisuals: Record<string, UnitVisualKind> = {
  militia: 'infantry',
  recruit: 'infantry',
  swordsman: 'infantry',
  spearman: 'infantry',
  'shield infantry': 'infantry',
  greatswordsman: 'infantry',
  pikeman: 'infantry',
  'shield spearman': 'infantry',
  'royal guard': 'infantry',
  champion: 'infantry',
  halberdier: 'infantry',
  'field medic': 'infantry',
  'field chaplain': 'infantry',
  warden: 'infantry',
  youngblood: 'infantry',
  archer: 'archer',
  longbowman: 'archer',
  marksman: 'archer',
  scout: 'scout',
  ranger: 'scout',
  'border ranger': 'scout',
  'forest scout': 'scout',
  hunter: 'scout',
  'scout rider': 'scout_rider',
  cavalryman: 'cavalryman',
  'heavy cavalry': 'cavalryman',
  lancer: 'lancer',
  'mounted archer': 'mounted_archer'
};

export const equipmentVisuals: Record<string, EquipmentVisualKind> = {
  hum_iron_sword: 'sword',
  hum_steel_sword: 'sword',
  hum_greatsword: 'sword',
  hum_tempered_sword: 'sword',
  hum_royal_greatsword: 'sword',
  hum_infantry_spear: 'spear',
  hum_long_pike: 'spear',
  hum_cavalry_lance: 'spear',
  hum_hunting_bow: 'bow',
  hum_longbow: 'bow',
  hum_rider_bow: 'bow',
  hum_warbow: 'bow',
  hum_wood_shield: 'shield',
  hum_kite_shield: 'shield',
  hum_tower_shield: 'shield',
  hum_padded_armor: 'armor',
  hum_chainmail: 'armor',
  hum_ranger_coat: 'armor',
  hum_heavy_plate: 'armor',
  hum_trained_horse: 'horse',
  hum_veteran_warhorse: 'horse'
};

export const buildingVisuals: Record<string, BuildingVisualKind> = {
  hall: 'hall',
  barracks: 'barracks',
  forge: 'forge',
  wagonwright: 'wagonwright',
  quartermaster: 'quartermaster',
  war_room: 'war_room',
  stable: 'stable',
  signal_tower: 'signal_tower',
  officer_academy: 'officer_academy'
};

export const resourceVisuals: Record<string, ResourceVisualKind> = {
  gold: 'gold',
  wood: 'wood',
  stone: 'stone',
  iron: 'iron',
  provisions: 'provisions'
};

export const wagonItemVisuals: Record<string, WagonItemVisualKind> = {
  rations: 'rations',
  medicine: 'medicine',
  banner: 'banner',
  repair: 'repair'
};

export function getUnitVisualKind(className: string): UnitVisualKind {
  const key = className.trim().toLowerCase();
  const exact = unitClassVisuals[key];
  if (exact) return exact;
  if (key.includes('mounted') && key.includes('archer')) return 'mounted_archer';
  if (key.includes('rider')) return 'scout_rider';
  if (key.includes('lance')) return 'lancer';
  if (key.includes('caval')) return 'cavalryman';
  if (key.includes('arch') || key.includes('bow')) return 'archer';
  if (key.includes('scout') || key.includes('ranger')) return 'scout';
  return 'infantry';
}

export function getEquipmentVisualKind(equipmentId: string): EquipmentVisualKind {
  return equipmentVisuals[equipmentId] ?? 'sword';
}

export function getBuildingVisualKind(buildingId: string): BuildingVisualKind {
  return buildingVisuals[buildingId] ?? 'hall';
}

export function getWagonItemVisualKind(itemId: string): WagonItemVisualKind {
  return wagonItemVisuals[itemId] ?? 'rations';
}
