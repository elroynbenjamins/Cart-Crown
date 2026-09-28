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

export type EnemyVisualKind =
  | 'raider'
  | 'mercenary'
  | 'ashen'
  | 'scout'
  | 'hollow'
  | 'stalker'
  | 'champion'
  | 'ranger'
  | 'agitator';

export type ClassLoadoutVisualKind =
  | 'blade'
  | 'spear'
  | 'bow'
  | 'shield'
  | 'light_armor'
  | 'heavy_armor'
  | 'stag'
  | 'warg'
  | 'drum'
  | 'ward';

export type ResourceSiteVisualKind =
  | 'farm'
  | 'mine'
  | 'timber'
  | 'depot'
  | 'salvage'
  | 'archive'
  | 'vault'
  | 'herb_grove'
  | 'hunt'
  | 'beacon'
  | 'quarry';

export const VISUAL_ASSET_VERSION = 5;

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
  'grove acolyte': 'infantry',
  'spear warden': 'infantry',
  spiritkeeper: 'infantry',
  youngblood: 'infantry',
  'clan warrior': 'infantry',
  'war drummer': 'infantry',
  'spear raider': 'infantry',
  warbringer: 'infantry',
  archer: 'archer',
  'bow warden': 'archer',
  'bone hunter': 'archer',
  longbowman: 'archer',
  marksman: 'archer',
  scout: 'scout',
  ranger: 'scout',
  'border ranger': 'scout',
  'forest scout': 'scout',
  hunter: 'scout',
  pathfinder: 'scout',
  'scout rider': 'scout_rider',
  'stag scout': 'scout_rider',
  'warg scout': 'scout_rider',
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
  officer_academy: 'officer_academy',

  elf_heartgrove_hall: 'hall',
  elf_warden_lodge: 'barracks',
  elf_moon_forge: 'forge',
  elf_caravan_grove: 'wagonwright',
  elf_spirit_stores: 'quartermaster',
  elf_council_glade: 'war_room',
  elf_stag_enclosure: 'stable',
  elf_ward_beacon: 'signal_tower',

  orc_warhold: 'hall',
  orc_clan_yard: 'barracks',
  orc_bone_forge: 'forge',
  orc_cartwright: 'wagonwright',
  orc_smokehouse: 'quartermaster',
  orc_war_council: 'war_room',
  orc_warg_pens: 'stable',
  orc_watchfire: 'signal_tower'
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

export const resourceSiteVisuals: Record<string, ResourceSiteVisualKind> = {
  greenkeep_farms: 'farm',
  iron_hills_mine: 'mine',
  greenwood_camp: 'timber',
  marcher_depot: 'depot',
  crownroad_salvage: 'salvage',
  royal_archive_stores: 'archive',
  concord_cache: 'vault',
  elf_moonwell_herbs: 'herb_grove',
  orc_red_plains_hunt: 'hunt',
  elf_moonlit_watch: 'beacon',
  orc_stonejaw_quarry: 'quarry'
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

export function getResourceSiteVisualKind(siteId: string): ResourceSiteVisualKind {
  return resourceSiteVisuals[siteId] ?? 'depot';
}


export function getEnemyVisualKind(
  enemyName: string
): EnemyVisualKind {
  const key = enemyName.toLowerCase();
  if (key.includes('ashroot stalker')) return 'stalker';
  if (key.includes('stonejaw champion')) return 'champion';
  if (key.includes('pale ranger')) return 'ranger';
  if (key.includes('blamecaller') || key.includes('clanbreaker')) return 'agitator';
  if (key.includes('hollow') || key.includes('warden')) return 'hollow';
  if (key.includes('ashen') || key.includes('regent')) return 'ashen';
  if (key.includes('scout') || key.includes('tracker')) return 'scout';
  if (
    key.includes('merc') ||
    key.includes('guard') ||
    key.includes('provost') ||
    key.includes('veteran') ||
    key.includes('company') ||
    key.includes('column') ||
    key.includes('patrol') ||
    key.includes('host')
  ) {
    return 'mercenary';
  }
  return 'raider';
}


export function getClassLoadoutVisuals(
  className: string,
  faction: FactionId
): ClassLoadoutVisualKind[] {
  const key = className.trim().toLowerCase();

  if (faction === 'elf') {
    if (key.includes('stag')) return ['bow', 'stag'];
    if (key.includes('bow')) return ['bow', 'light_armor'];
    if (key.includes('spear')) return ['spear', 'light_armor'];
    if (key.includes('spirit') || key.includes('acolyte')) return ['ward', 'light_armor'];
    if (key.includes('pathfinder') || key.includes('scout') || key.includes('ranger')) {
      return ['bow', 'light_armor'];
    }
    return ['blade', 'light_armor'];
  }

  if (faction === 'orc') {
    if (key.includes('warg')) return ['spear', 'warg'];
    if (key.includes('drummer')) return ['drum', 'light_armor'];
    if (key.includes('bone hunter') || key.includes('hunter')) return ['bow', 'light_armor'];
    if (key.includes('spear')) return ['spear', 'heavy_armor'];
    if (key.includes('warbringer')) return ['blade', 'drum'];
    return ['blade', 'heavy_armor'];
  }

  if (key.includes('mounted archer')) return ['bow', 'light_armor'];
  if (key.includes('lancer')) return ['spear', 'heavy_armor'];
  if (key.includes('cavalry')) return ['blade', 'heavy_armor'];
  if (key.includes('archer') || key.includes('bow')) return ['bow', 'light_armor'];
  if (key.includes('spear') || key.includes('pike')) return ['spear', 'shield'];
  if (key.includes('shield')) return ['blade', 'shield'];
  return ['blade', 'heavy_armor'];
}
