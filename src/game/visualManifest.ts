import type { FactionId } from './types';
import type { EnemyArmyProfileId } from './encounters';

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
  | 'horse'
  | 'artifact';

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
  | 'agitator'
  | 'shield_host'
  | 'missile_company'
  | 'mounted_hunters'
  | 'shock_warband'
  | 'warded_host'
  | 'elite_command';

export type CommanderVisualKind =
  | 'vanguard'
  | 'ranger'
  | 'cavalry'
  | 'windcaller'
  | 'thorn'
  | 'moon'
  | 'bloodchief'
  | 'warglord'
  | 'warcaller';

export type StorySceneVisualKind =
  | 'marcher_envoy'
  | 'refugee_camp'
  | 'broken_archives'
  | 'royal_ledger'
  | 'grand_council'
  | 'forced_beacon'
  | 'crownspire'
  | 'victory';

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

export const VISUAL_ASSET_VERSION = 12;

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
  crossbowman: 'archer',
  'man-at-arms': 'infantry',
  'siege engineer': 'infantry',
  'banner captain': 'infantry',
  'field medic': 'infantry',
  'field chaplain': 'infantry',
  warden: 'infantry',
  'grove acolyte': 'infantry',
  'spear warden': 'infantry',
  spiritkeeper: 'infantry',
  'blade warden': 'infantry',
  druid: 'infantry',
  youngblood: 'infantry',
  'clan warrior': 'infantry',
  'war drummer': 'infantry',
  'spear raider': 'infantry',
  warbringer: 'infantry',
  ironhide: 'infantry',
  'bone shaman': 'infantry',
  archer: 'archer',
  'bow warden': 'archer',
  'moon ranger': 'archer',
  'bone hunter': 'archer',
  'axe thrower': 'archer',
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
  'mounted archer': 'mounted_archer',
  'stag rider': 'scout_rider',
  'mounted ranger': 'mounted_archer',
  'stag lancer': 'lancer',
  'warg rider': 'scout_rider',
  'warg raider': 'cavalryman',
  'warg lancer': 'lancer'
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
  hum_veteran_warhorse: 'horse',

  elf_spiritwood_spear: 'spear',
  elf_moonsilver_spear: 'spear',
  elf_moonbow: 'bow',
  elf_rider_bow: 'bow',
  elf_starbow: 'bow',
  elf_moon_lance: 'spear',
  elf_star_lance: 'spear',
  elf_leafweave: 'armor',
  elf_moonweave: 'armor',
  elf_starweave: 'armor',
  elf_trained_stag: 'horse',
  elf_veteran_stag: 'horse',

  orc_iron_axe: 'sword',
  orc_blackiron_axe: 'sword',
  orc_raider_axe: 'sword',
  orc_bloodaxe: 'sword',
  orc_hunter_bow: 'bow',
  orc_warg_lance: 'spear',
  orc_bonehook_lance: 'spear',
  orc_warhide: 'armor',
  orc_reinforced_warhide: 'armor',
  orc_ironhide_plate: 'armor',
  orc_trained_warg: 'horse',
  orc_veteran_warg: 'horse',

  hum_oathglass_relic: 'artifact',
  elf_moonroot_relic: 'artifact',
  orc_emberfang_relic: 'artifact'
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
  orc_stonejaw_quarry: 'quarry',
  elf_burned_ward_reclamation: 'herb_grove',
  orc_steppe_war_camp: 'depot',
  elf_worldroot_nursery: 'herb_grove',
  orc_united_clan_depot: 'depot'
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
  enemyName: string,
  armyProfileId?: EnemyArmyProfileId
): EnemyVisualKind {
  const key = enemyName.toLowerCase();

  // Named threats keep their bespoke silhouettes even when their battle
  // formation uses a broader army profile.
  if (key.includes('worldroot guardian')) return 'hollow';
  if (key.includes('ashroot stalker')) return 'stalker';
  if (key.includes('stonejaw champion')) return 'champion';
  if (key.includes('pale ranger')) return 'ranger';
  if (key.includes('blamecaller') || key.includes('clanbreaker')) return 'agitator';
  if (key.includes('hollow warden')) return 'hollow';

  if (armyProfileId) {
    const profileVisuals: Record<EnemyArmyProfileId, EnemyVisualKind> = {
      raider_pack: 'raider',
      mercenary_line: 'mercenary',
      shield_host: 'shield_host',
      missile_company: 'missile_company',
      mounted_hunters: 'mounted_hunters',
      shock_warband: 'shock_warband',
      warded_host: 'warded_host',
      elite_command: 'elite_command'
    };
    return profileVisuals[armyProfileId];
  }

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


export const commanderVisuals: Record<string, CommanderVisualKind> = {
  hum_vanguard: 'vanguard',
  hum_ranger_captain: 'ranger',
  hum_cavalry_marshal: 'cavalry',
  elf_windcaller: 'windcaller',
  elf_thorn_warden: 'thorn',
  elf_moon_seer: 'moon',
  orc_bloodchief: 'bloodchief',
  orc_warglord: 'warglord',
  orc_warcaller: 'warcaller'
};

export function getCommanderVisualKind(pathId: string): CommanderVisualKind {
  return commanderVisuals[pathId] ?? 'vanguard';
}
