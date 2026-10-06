import type { ImageSourcePropType } from 'react-native';
import type { FactionId } from '../game/types';
import type {
  BuildingVisualKind,
  CommanderVisualKind,
  EnemyVisualKind,
  EquipmentVisualKind,
  ResourceSiteVisualKind,
  ResourceVisualKind,
  StorySceneVisualKind,
  UnitVisualKind,
  WagonItemVisualKind
} from '../game/visualManifest';

export const PRODUCTION_ASSET_PIPELINE_VERSION = 5;
export const PRODUCTION_ASSET_ROOT = 'assets/game';

export type ProductionAssetCategory =
  | 'unit'
  | 'faction_crest'
  | 'equipment'
  | 'building'
  | 'enemy'
  | 'commander'
  | 'story_scene'
  | 'settlement_background'
  | 'resource_site'
  | 'resource'
  | 'wagon_item'
  | 'ui';

export type ProductionAssetSpec = {
  id: string;
  category: ProductionAssetCategory;
  relativePath: string;
  width: number;
  height: number;
  transparent: boolean;
  safeMarginPercent: number;
  notes: string;
};

const slug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

function spec(
  id: string,
  category: ProductionAssetCategory,
  relativePath: string,
  width: number,
  height: number,
  transparent: boolean,
  safeMarginPercent: number,
  notes: string
): ProductionAssetSpec {
  return {
    id,
    category,
    relativePath,
    width,
    height,
    transparent,
    safeMarginPercent,
    notes
  };
}

export function unitProductionAsset(
  faction: FactionId,
  className: string,
  kind: UnitVisualKind
) {
  const classSlug = slug(className);
  return spec(
    'unit.' + faction + '.' + classSlug,
    'unit',
    PRODUCTION_ASSET_ROOT + '/units/' + faction + '/' + classSlug + '.png',
    256,
    256,
    true,
    10,
    'Exact class artwork for ' + className + '. Preserve the ' + kind + ' gameplay silhouette; centered feet and weapon; no text or baked UI.'
  );
}

export function factionCrestProductionAsset(faction: FactionId) {
  return spec(
    'faction_crest.' + faction,
    'faction_crest',
    PRODUCTION_ASSET_ROOT + '/factions/' + faction + '/crest.png',
    256,
    256,
    true,
    12,
    'Faction crest only. No text, frame, label or background.'
  );
}

export function equipmentProductionAsset(
  faction: FactionId | 'global',
  equipmentId: string,
  kind: EquipmentVisualKind
) {
  return spec(
    'equipment.' + equipmentId,
    'equipment',
    PRODUCTION_ASSET_ROOT + '/equipment/' + faction + '/' + slug(equipmentId) + '.png',
    256,
    256,
    true,
    12,
    'Exact gameplay item. Keep orientation and grip readable at 38–56 px.'
  );
}

export function buildingProductionAsset(
  faction: FactionId,
  buildingId: string,
  kind: BuildingVisualKind
) {
  return spec(
    'building.' + buildingId,
    'building',
    PRODUCTION_ASSET_ROOT + '/buildings/' + faction + '/' + slug(buildingId) + '.png',
    256,
    256,
    true,
    8,
    'Isometric-ish front/three-quarter pixel building, readable at settlement-grid scale. Visual kind: ' + kind + '.'
  );
}

export function enemyProductionAsset(kind: EnemyVisualKind) {
  return spec(
    'enemy.' + kind,
    'enemy',
    PRODUCTION_ASSET_ROOT + '/enemies/' + kind + '.png',
    256,
    256,
    true,
    10,
    'Combat token silhouette. Do not include HP bars, names or difficulty badges.'
  );
}

export function commanderProductionAsset(
  faction: FactionId,
  pathId: string,
  kind: CommanderVisualKind
) {
  return spec(
    'commander.' + pathId,
    'commander',
    PRODUCTION_ASSET_ROOT + '/commanders/' + faction + '/' + slug(pathId) + '.png',
    512,
    512,
    true,
    9,
    'Bust/full-body commander portrait that preserves the specialization silhouette. Visual kind: ' + kind + '.'
  );
}

export function storySceneProductionAsset(
  scene: StorySceneVisualKind,
  faction: FactionId
) {
  // Camp panoramas retain the reviewed generator output. Android downsamples
  // these local sources to the displayed banner size in FactionCampScene.
  const camp = scene === 'camp';
  return spec(
    'scene.' + faction + '.' + scene,
    'story_scene',
    PRODUCTION_ASSET_ROOT + '/scenes/' + faction + '/' + scene + '.png',
    camp ? 1672 : 768,
    camp ? 941 : 432,
    false,
    5,
    camp
      ? 'Opaque faction camp panorama. Center-cover crop to a shallow banner; no baked text or UI.'
      : '16:9 story scene with no text. Keep important subjects inside the central 80%.'
  );
}

export type SettlementBackgroundStage = 'camp' | 'settlement' | 'fort' | 'town' | 'capital';

export function settlementBackgroundProductionAsset(
  faction: FactionId,
  stage: SettlementBackgroundStage
) {
  return spec(
    'settlement_background.' + faction + '.' + stage,
    'settlement_background',
    PRODUCTION_ASSET_ROOT + '/scenes/' + faction + '/settlement/' + stage + '.jpg',
    540,
    960,
    false,
    3,
    'Opaque portrait settlement world plate. Keep gameplay build pads clear; no baked building sprites, text or UI.'
  );
}

export function resourceSiteProductionAsset(
  faction: FactionId,
  siteId: string,
  kind: ResourceSiteVisualKind
) {
  return spec(
    'resource_site.' + siteId,
    'resource_site',
    PRODUCTION_ASSET_ROOT + '/resource_sites/' + faction + '/' + slug(siteId) + '.png',
    256,
    256,
    true,
    10,
    'Regional production location icon. Visual kind: ' + kind + '.'
  );
}

export function resourceProductionAsset(kind: ResourceVisualKind) {
  return spec(
    'resource.' + kind,
    'resource',
    PRODUCTION_ASSET_ROOT + '/resources/' + kind + '.png',
    128,
    128,
    true,
    12,
    'Shared resource icon. Must remain legible around 20–32 px.'
  );
}

export function wagonItemProductionAsset(itemId: string, kind: WagonItemVisualKind) {
  return spec(
    'wagon_item.' + itemId,
    'wagon_item',
    PRODUCTION_ASSET_ROOT + '/wagon_items/' + slug(itemId) + '.png',
    256,
    256,
    true,
    10,
    'Campaign-pack item; preserve footprint readability and silhouette. Visual kind: ' + kind + '.'
  );
}

export function uiProductionAsset(id: string) {
  const treasury = id === 'treasury_atlas';
  return spec(
    'ui.' + id,
    'ui',
    PRODUCTION_ASSET_ROOT + '/ui/' + slug(id) + '.png',
    treasury ? 1536 : 96,
    treasury ? 1024 : 96,
    true,
    treasury ? 1.5625 : 14,
    treasury
      ? 'Transparent 3-by-2 treasury atlas: gold, wood, stone / iron, provisions, victory cache. Render one reviewed 512px square cell at a time; safe margin is per cell (8px).'
      : 'Small UI glyph. Must stay legible around 20–32 px.'
  );
}

// Static React Native image sources must be registered with require(...).
// Adding a source here automatically replaces the code-rendered fallback everywhere.
// Militia, Forest Scout and Youngblood currently use the existing code-rendered
// fallback: their source PNGs were corrupt and no intact original was available.
// Restore their registrations only after the replacement files pass art:check.
// Spiritwood Spear likewise uses its existing Elven spear renderer after the
// all-category native audit found an unrecoverable compressed PNG payload.
export const productionAssetSources: Partial<Record<string, ImageSourcePropType>> = {
  'ui.treasury_atlas': require('../../assets/game/ui/treasury_atlas.png'),

  'scene.human.camp': require('../../assets/game/scenes/human/camp.png'),
  'scene.elf.camp': require('../../assets/game/scenes/elf/camp.png'),
  'scene.orc.camp': require('../../assets/game/scenes/orc/camp.png'),

  'settlement_background.human.camp': require('../../assets/game/scenes/human/settlement/camp.jpg'),
  'settlement_background.human.settlement': require('../../assets/game/scenes/human/settlement/settlement.jpg'),
  'settlement_background.human.fort': require('../../assets/game/scenes/human/settlement/fort.jpg'),
  'settlement_background.human.town': require('../../assets/game/scenes/human/settlement/town.jpg'),
  'settlement_background.human.capital': require('../../assets/game/scenes/human/settlement/capital.jpg'),

  // Generated Human portrait/figure pairs. Existing exact-class fallback art stays registered.
  'battle_portrait.human_captain_portrait': require('../../assets/game/battle_portraits/human/captain_portrait.png'),
  'battle_portrait.human_ranger_portrait': require('../../assets/game/battle_portraits/human/ranger_portrait.png'),
  'battle_portrait.human_priest_portrait': require('../../assets/game/battle_portraits/human/priest_portrait.png'),
  'battle_portrait.human_infantry_portrait': require('../../assets/game/battle_portraits/human/infantry_portrait.png'),
  'battle_portrait.human_spearman_portrait': require('../../assets/game/battle_portraits/human/spearman_portrait.png'),
  'battle_portrait.human_lancer_portrait': require('../../assets/game/battle_portraits/human/lancer_portrait.png'),
  'battle_portrait.human_captain_unit': require('../../assets/game/battle_portraits/human/captain_unit.png'),
  'battle_portrait.human_ranger_unit': require('../../assets/game/battle_portraits/human/ranger_unit.png'),
  'battle_portrait.human_priest_unit': require('../../assets/game/battle_portraits/human/priest_unit.png'),
  'battle_portrait.human_lancer_unit': require('../../assets/game/battle_portraits/human/lancer_unit.png'),
  'battle_portrait.human_infantry_unit': require('../../assets/game/battle_portraits/human/infantry_unit.png'),
  'battle_portrait.human_spearman_unit': require('../../assets/game/battle_portraits/human/spearman_unit.png'),
  'battle_portrait.human_crossbowman_portrait': require('../../assets/game/battle_portraits/human/crossbowman_portrait.png'),
  'battle_portrait.human_field_medic_portrait': require('../../assets/game/battle_portraits/human/field_medic_portrait.png'),
  'battle_portrait.human_halberdier_portrait': require('../../assets/game/battle_portraits/human/halberdier_portrait.png'),
  'battle_portrait.human_banner_captain_portrait': require('../../assets/game/battle_portraits/human/banner_captain_portrait.png'),
  'battle_portrait.human_heavy_cavalry_portrait': require('../../assets/game/battle_portraits/human/heavy_cavalry_portrait.png'),
  'battle_portrait.human_royal_guard_portrait': require('../../assets/game/battle_portraits/human/royal_guard_portrait.png'),
  'battle_portrait.human_crossbowman_unit': require('../../assets/game/battle_portraits/human/crossbowman_unit.png'),
  'battle_portrait.human_field_medic_unit': require('../../assets/game/battle_portraits/human/field_medic_unit.png'),
  'battle_portrait.human_halberdier_unit': require('../../assets/game/battle_portraits/human/halberdier_unit.png'),
  'battle_portrait.human_banner_captain_unit': require('../../assets/game/battle_portraits/human/banner_captain_unit.png'),
  'battle_portrait.human_heavy_cavalry_unit': require('../../assets/game/battle_portraits/human/heavy_cavalry_unit.png'),
  'battle_portrait.human_royal_guard_unit': require('../../assets/game/battle_portraits/human/royal_guard_unit.png'),

  'ui.settlement_anchor_atlas': require('../../assets/game/ui/settlement_anchor_atlas.png'),
  'ui.settlement_world_human_atlas': require('../../assets/game/ui/settlement_world_human_atlas.png'),
  'ui.settlement_people_human_atlas': require('../../assets/game/ui/settlement_people_human_atlas.png'),
  'ui.settlement_nature_human_atlas': require('../../assets/game/ui/settlement_nature_human_atlas.png'),
  'ui.settlement_scene_human_v2_atlas': require('../../assets/game/ui/settlement_scene_human_v2_atlas.png'),
  'ui.settlement_support_human_atlas': require('../../assets/game/ui/settlement_support_human_atlas.png'),
  'ui.settlement_support_elf_atlas': require('../../assets/game/ui/settlement_support_elf_atlas.png'),
  'ui.settlement_support_orc_atlas': require('../../assets/game/ui/settlement_support_orc_atlas.png'),

  'unit.human.recruit': require('../../assets/game/units/human/recruit.png'),
  'unit.elf.warden': require('../../assets/game/units/elf/warden.png'),
  'unit.orc.hunter': require('../../assets/game/units/orc/hunter.png'),

  'faction_crest.human': require('../../assets/game/factions/human/crest.png'),
  'faction_crest.elf': require('../../assets/game/factions/elf/crest.png'),
  'faction_crest.orc': require('../../assets/game/factions/orc/crest.png'),

  'equipment.hum_trained_horse': require('../../assets/game/equipment/human/hum_trained_horse.png'),
  'equipment.elf_trained_stag': require('../../assets/game/equipment/elf/elf_trained_stag.png'),
  'equipment.orc_trained_warg': require('../../assets/game/equipment/orc/orc_trained_warg.png'),

  'unit.human.swordsman': require('../../assets/game/units/human/swordsman.png'),
  'unit.human.spearman': require('../../assets/game/units/human/spearman.png'),
  'unit.human.archer': require('../../assets/game/units/human/archer.png'),
  'unit.elf.grove_acolyte': require('../../assets/game/units/elf/grove_acolyte.png'),
  'unit.elf.bow_warden': require('../../assets/game/units/elf/bow_warden.png'),
  'unit.elf.stag_scout': require('../../assets/game/units/elf/stag_scout.png'),
  'unit.orc.clan_warrior': require('../../assets/game/units/orc/clan_warrior.png'),
  'unit.orc.war_drummer': require('../../assets/game/units/orc/war_drummer.png'),
  'unit.orc.warg_scout': require('../../assets/game/units/orc/warg_scout.png'),

  'unit.human.scout': require('../../assets/game/units/human/scout.png'),
  'unit.human.field_medic': require('../../assets/game/units/human/field_medic.png'),
  'unit.human.crossbowman': require('../../assets/game/units/human/crossbowman.png'),
  'unit.human.man_at_arms': require('../../assets/game/units/human/man_at_arms.png'),
  'unit.human.halberdier': require('../../assets/game/units/human/halberdier.png'),
  'unit.human.field_chaplain': require('../../assets/game/units/human/field_chaplain.png'),
  'unit.human.border_ranger': require('../../assets/game/units/human/border_ranger.png'),
  'unit.human.royal_guard': require('../../assets/game/units/human/royal_guard.png'),
  'unit.human.siege_engineer': require('../../assets/game/units/human/siege_engineer.png'),
  'unit.human.banner_captain': require('../../assets/game/units/human/banner_captain.png'),
  'unit.elf.spear_warden': require('../../assets/game/units/elf/spear_warden.png'),
  'unit.elf.pathfinder': require('../../assets/game/units/elf/pathfinder.png'),
  'unit.elf.spiritkeeper': require('../../assets/game/units/elf/spiritkeeper.png'),
  'unit.elf.blade_warden': require('../../assets/game/units/elf/blade_warden.png'),
  'unit.elf.druid': require('../../assets/game/units/elf/druid.png'),
  'unit.elf.moon_ranger': require('../../assets/game/units/elf/moon_ranger.png'),
  'unit.orc.spear_raider': require('../../assets/game/units/orc/spear_raider.png'),
  'unit.orc.bone_hunter': require('../../assets/game/units/orc/bone_hunter.png'),
  'unit.orc.warbringer': require('../../assets/game/units/orc/warbringer.png'),
  'unit.orc.ironhide': require('../../assets/game/units/orc/ironhide.png'),
  'unit.orc.axe_thrower': require('../../assets/game/units/orc/axe_thrower.png'),
  'unit.orc.bone_shaman': require('../../assets/game/units/orc/bone_shaman.png'),

  'unit.human.shield_infantry': require('../../assets/game/units/human/shield_infantry.png'),
  'unit.human.greatswordsman': require('../../assets/game/units/human/greatswordsman.png'),
  'unit.human.pikeman': require('../../assets/game/units/human/pikeman.png'),
  'unit.human.shield_spearman': require('../../assets/game/units/human/shield_spearman.png'),
  'unit.human.longbowman': require('../../assets/game/units/human/longbowman.png'),
  'unit.human.ranger': require('../../assets/game/units/human/ranger.png'),
  'unit.human.scout_rider': require('../../assets/game/units/human/scout_rider.png'),
  'unit.human.cavalryman': require('../../assets/game/units/human/cavalryman.png'),
  'unit.human.lancer': require('../../assets/game/units/human/lancer.png'),
  'unit.human.mounted_archer': require('../../assets/game/units/human/mounted_archer.png'),
  'unit.human.champion': require('../../assets/game/units/human/champion.png'),
  'unit.human.marksman': require('../../assets/game/units/human/marksman.png'),
  'unit.human.heavy_cavalry': require('../../assets/game/units/human/heavy_cavalry.png'),
  'unit.elf.stag_rider': require('../../assets/game/units/elf/stag_rider.png'),
  'unit.elf.mounted_ranger': require('../../assets/game/units/elf/mounted_ranger.png'),
  'unit.elf.stag_lancer': require('../../assets/game/units/elf/stag_lancer.png'),
  'unit.orc.warg_rider': require('../../assets/game/units/orc/warg_rider.png'),
  'unit.orc.warg_raider': require('../../assets/game/units/orc/warg_raider.png'),
  'unit.orc.warg_lancer': require('../../assets/game/units/orc/warg_lancer.png'),

  'equipment.hum_iron_sword': require('../../assets/game/equipment/human/hum_iron_sword.png'),
  'equipment.hum_infantry_spear': require('../../assets/game/equipment/human/hum_infantry_spear.png'),
  'equipment.hum_hunting_bow': require('../../assets/game/equipment/human/hum_hunting_bow.png'),
  'equipment.hum_padded_armor': require('../../assets/game/equipment/human/hum_padded_armor.png'),
  'equipment.hum_wood_shield': require('../../assets/game/equipment/human/hum_wood_shield.png'),
  'equipment.elf_moonbow': require('../../assets/game/equipment/elf/elf_moonbow.png'),
  'equipment.elf_leafweave': require('../../assets/game/equipment/elf/elf_leafweave.png'),
  'equipment.orc_iron_axe': require('../../assets/game/equipment/orc/orc_iron_axe.png'),
  'equipment.orc_hunter_bow': require('../../assets/game/equipment/orc/orc_hunter_bow.png'),
  'equipment.orc_warhide': require('../../assets/game/equipment/orc/orc_warhide.png'),

  'enemy.raider': require('../../assets/game/enemies/raider.png'),
  'enemy.mercenary': require('../../assets/game/enemies/mercenary.png'),
  'enemy.ashen': require('../../assets/game/enemies/ashen.png'),
  'enemy.scout': require('../../assets/game/enemies/scout.png'),
  'enemy.hollow': require('../../assets/game/enemies/hollow.png'),
  'enemy.stalker': require('../../assets/game/enemies/stalker.png'),
  'enemy.champion': require('../../assets/game/enemies/champion.png'),
  'enemy.ranger': require('../../assets/game/enemies/ranger.png'),
  'enemy.agitator': require('../../assets/game/enemies/agitator.png'),
  'enemy.shield_host': require('../../assets/game/enemies/shield_host.png'),
  'enemy.missile_company': require('../../assets/game/enemies/missile_company.png'),
  'enemy.mounted_hunters': require('../../assets/game/enemies/mounted_hunters.png'),
  'enemy.shock_warband': require('../../assets/game/enemies/shock_warband.png'),
  'enemy.warded_host': require('../../assets/game/enemies/warded_host.png'),
  'enemy.elite_command': require('../../assets/game/enemies/elite_command.png'),
  'battle_portrait.captain_unit': require('../../assets/game/battle_portraits/captain_unit.png'),
  'battle_portrait.ranger_unit': require('../../assets/game/battle_portraits/ranger_unit.png'),
  'battle_portrait.priest_unit': require('../../assets/game/battle_portraits/priest_unit.png'),
  'battle_portrait.raider_unit': require('../../assets/game/battle_portraits/raider_unit.png'),
  'battle_portrait.missile_unit': require('../../assets/game/battle_portraits/missile_unit.png'),
  'battle_portrait.warg_unit': require('../../assets/game/battle_portraits/warg_unit.png'),
  'battle_portrait.captain_portrait': require('../../assets/game/battle_portraits/captain_portrait.png'),
  'battle_portrait.ranger_portrait': require('../../assets/game/battle_portraits/ranger_portrait.png'),
  'battle_portrait.priest_portrait': require('../../assets/game/battle_portraits/priest_portrait.png'),
  'battle_portrait.raider_portrait': require('../../assets/game/battle_portraits/raider_portrait.png'),
  'battle_portrait.missile_portrait': require('../../assets/game/battle_portraits/missile_portrait.png'),
  'battle_portrait.warg_portrait': require('../../assets/game/battle_portraits/warg_portrait.png'),
  'battle_portrait.greenkeep_sky': require('../../assets/game/battle_portraits/greenkeep_sky.png'),
  'battle_portrait.greenkeep_ground': require('../../assets/game/battle_portraits/greenkeep_ground.png'),
  'battle_portrait.greenkeep_location': require('../../assets/game/battle_portraits/greenkeep_location.png'),







};

export function getProductionAssetSource(assetId: string) {
  return productionAssetSources[assetId] ?? null;
}
