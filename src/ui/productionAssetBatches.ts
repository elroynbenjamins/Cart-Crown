import {
  factionCrestProductionAsset,
  buildingProductionAsset,
  equipmentProductionAsset,
  enemyProductionAsset,
  type ProductionAssetSpec,
  unitProductionAsset
} from './productionAssets';
import {
  getBuildingVisualKind,
  getEquipmentVisualKind,
  getUnitVisualKind
} from '../game/visualManifest';

export type ProductionAssetBatch = {
  id: string;
  name: string;
  purpose: string;
  assets: ProductionAssetSpec[];
};

export const starterProductionBatch: ProductionAssetBatch = {
  id: 'starter_identity_v1',
  name: 'Starter Faction Identity',
  purpose:
    'First final-PNG batch: everything visible before or around the first battle in all three faction campaigns.',
  assets: [
    unitProductionAsset('human', 'Militia', getUnitVisualKind('Militia')),
    unitProductionAsset('human', 'Recruit', getUnitVisualKind('Recruit')),
    unitProductionAsset('elf', 'Warden', getUnitVisualKind('Warden')),
    unitProductionAsset(
      'elf',
      'Forest Scout',
      getUnitVisualKind('Forest Scout')
    ),
    unitProductionAsset(
      'orc',
      'Youngblood',
      getUnitVisualKind('Youngblood')
    ),
    unitProductionAsset('orc', 'Hunter', getUnitVisualKind('Hunter')),

    factionCrestProductionAsset('human'),
    factionCrestProductionAsset('elf'),
    factionCrestProductionAsset('orc'),

    equipmentProductionAsset(
      'human',
      'hum_trained_horse',
      getEquipmentVisualKind('hum_trained_horse')
    ),
    equipmentProductionAsset(
      'elf',
      'elf_trained_stag',
      getEquipmentVisualKind('elf_trained_stag')
    ),
    equipmentProductionAsset(
      'orc',
      'orc_trained_warg',
      getEquipmentVisualKind('orc_trained_warg')
    )
  ]
};

export const earlyProgressionProductionBatch: ProductionAssetBatch = {
  id: 'early_progression_v2',
  name: 'Early Progression',
  purpose:
    'Final PNGs for the first class upgrades, Chapter 2 faction recruits and their Tier-1 equipment.',
  assets: [
    unitProductionAsset('human', 'Swordsman', getUnitVisualKind('Swordsman')),
    unitProductionAsset('human', 'Spearman', getUnitVisualKind('Spearman')),
    unitProductionAsset('human', 'Archer', getUnitVisualKind('Archer')),
    unitProductionAsset('elf', 'Grove Acolyte', getUnitVisualKind('Grove Acolyte')),
    unitProductionAsset('elf', 'Bow Warden', getUnitVisualKind('Bow Warden')),
    unitProductionAsset('elf', 'Stag Scout', getUnitVisualKind('Stag Scout')),
    unitProductionAsset('orc', 'Clan Warrior', getUnitVisualKind('Clan Warrior')),
    unitProductionAsset('orc', 'War Drummer', getUnitVisualKind('War Drummer')),
    unitProductionAsset('orc', 'Warg Scout', getUnitVisualKind('Warg Scout')),

    equipmentProductionAsset('human', 'hum_iron_sword', getEquipmentVisualKind('hum_iron_sword')),
    equipmentProductionAsset('human', 'hum_infantry_spear', getEquipmentVisualKind('hum_infantry_spear')),
    equipmentProductionAsset('human', 'hum_hunting_bow', getEquipmentVisualKind('hum_hunting_bow')),
    equipmentProductionAsset('human', 'hum_padded_armor', getEquipmentVisualKind('hum_padded_armor')),
    equipmentProductionAsset('human', 'hum_wood_shield', getEquipmentVisualKind('hum_wood_shield')),
    equipmentProductionAsset('elf', 'elf_spiritwood_spear', getEquipmentVisualKind('elf_spiritwood_spear')),
    equipmentProductionAsset('elf', 'elf_moonbow', getEquipmentVisualKind('elf_moonbow')),
    equipmentProductionAsset('elf', 'elf_leafweave', getEquipmentVisualKind('elf_leafweave')),
    equipmentProductionAsset('orc', 'orc_iron_axe', getEquipmentVisualKind('orc_iron_axe')),
    equipmentProductionAsset('orc', 'orc_hunter_bow', getEquipmentVisualKind('orc_hunter_bow')),
    equipmentProductionAsset('orc', 'orc_warhide', getEquipmentVisualKind('orc_warhide'))
  ]
};

export const enemyIdentityProductionBatch: ProductionAssetBatch = {
  id: 'enemy_identity_v3',
  name: 'Enemy Army Identity',
  purpose:
    'Production sprites for named threats plus the tactical army identities used by Battle Prep, Scout Report and live combat.',
  assets: [
    enemyProductionAsset('raider'),
    enemyProductionAsset('mercenary'),
    enemyProductionAsset('ashen'),
    enemyProductionAsset('scout'),
    enemyProductionAsset('hollow'),
    enemyProductionAsset('stalker'),
    enemyProductionAsset('champion'),
    enemyProductionAsset('ranger'),
    enemyProductionAsset('agitator'),
    enemyProductionAsset('shield_host'),
    enemyProductionAsset('missile_company'),
    enemyProductionAsset('mounted_hunters'),
    enemyProductionAsset('shock_warband'),
    enemyProductionAsset('warded_host'),
    enemyProductionAsset('elite_command')
  ]
};

export const midgameUnitsProductionBatch: ProductionAssetBatch = {
  id: 'midgame_units_v4',
  name: 'Midgame Unit Identity',
  purpose:
    'Exact production sprites for directly recruited Human, Elf and Orc classes that dominate Chapters 2–4.',
  assets: [
    unitProductionAsset('human', 'Scout', getUnitVisualKind('Scout')),
    unitProductionAsset('human', 'Field Medic', getUnitVisualKind('Field Medic')),
    unitProductionAsset('human', 'Crossbowman', getUnitVisualKind('Crossbowman')),
    unitProductionAsset('human', 'Man-at-Arms', getUnitVisualKind('Man-at-Arms')),
    unitProductionAsset('human', 'Halberdier', getUnitVisualKind('Halberdier')),
    unitProductionAsset('human', 'Field Chaplain', getUnitVisualKind('Field Chaplain')),
    unitProductionAsset('human', 'Border Ranger', getUnitVisualKind('Border Ranger')),
    unitProductionAsset('human', 'Royal Guard', getUnitVisualKind('Royal Guard')),
    unitProductionAsset('human', 'Siege Engineer', getUnitVisualKind('Siege Engineer')),
    unitProductionAsset('human', 'Banner Captain', getUnitVisualKind('Banner Captain')),

    unitProductionAsset('elf', 'Spear Warden', getUnitVisualKind('Spear Warden')),
    unitProductionAsset('elf', 'Pathfinder', getUnitVisualKind('Pathfinder')),
    unitProductionAsset('elf', 'Spiritkeeper', getUnitVisualKind('Spiritkeeper')),
    unitProductionAsset('elf', 'Blade Warden', getUnitVisualKind('Blade Warden')),
    unitProductionAsset('elf', 'Druid', getUnitVisualKind('Druid')),
    unitProductionAsset('elf', 'Moon Ranger', getUnitVisualKind('Moon Ranger')),

    unitProductionAsset('orc', 'Spear Raider', getUnitVisualKind('Spear Raider')),
    unitProductionAsset('orc', 'Bone Hunter', getUnitVisualKind('Bone Hunter')),
    unitProductionAsset('orc', 'Warbringer', getUnitVisualKind('Warbringer')),
    unitProductionAsset('orc', 'Ironhide', getUnitVisualKind('Ironhide')),
    unitProductionAsset('orc', 'Axe Thrower', getUnitVisualKind('Axe Thrower')),
    unitProductionAsset('orc', 'Bone Shaman', getUnitVisualKind('Bone Shaman'))
  ]
};

export const advancedPromotionsProductionBatch: ProductionAssetBatch = {
  id: 'advanced_promotions_v5',
  name: 'Advanced Promotion Identity',
  purpose:
    'Exact production sprites for advanced Human promotion branches and mounted Stag/Warg branches so later progression never falls back to generic silhouettes.',
  assets: [
    unitProductionAsset('human', 'Shield Infantry', getUnitVisualKind('Shield Infantry')),
    unitProductionAsset('human', 'Greatswordsman', getUnitVisualKind('Greatswordsman')),
    unitProductionAsset('human', 'Pikeman', getUnitVisualKind('Pikeman')),
    unitProductionAsset('human', 'Shield Spearman', getUnitVisualKind('Shield Spearman')),
    unitProductionAsset('human', 'Longbowman', getUnitVisualKind('Longbowman')),
    unitProductionAsset('human', 'Ranger', getUnitVisualKind('Ranger')),
    unitProductionAsset('human', 'Scout Rider', getUnitVisualKind('Scout Rider')),
    unitProductionAsset('human', 'Cavalryman', getUnitVisualKind('Cavalryman')),
    unitProductionAsset('human', 'Lancer', getUnitVisualKind('Lancer')),
    unitProductionAsset('human', 'Mounted Archer', getUnitVisualKind('Mounted Archer')),
    unitProductionAsset('human', 'Champion', getUnitVisualKind('Champion')),
    unitProductionAsset('human', 'Marksman', getUnitVisualKind('Marksman')),
    unitProductionAsset('human', 'Heavy Cavalry', getUnitVisualKind('Heavy Cavalry')),

    unitProductionAsset('elf', 'Stag Rider', getUnitVisualKind('Stag Rider')),
    unitProductionAsset('elf', 'Mounted Ranger', getUnitVisualKind('Mounted Ranger')),
    unitProductionAsset('elf', 'Stag Lancer', getUnitVisualKind('Stag Lancer')),

    unitProductionAsset('orc', 'Warg Rider', getUnitVisualKind('Warg Rider')),
    unitProductionAsset('orc', 'Warg Raider', getUnitVisualKind('Warg Raider')),
    unitProductionAsset('orc', 'Warg Lancer', getUnitVisualKind('Warg Lancer'))
  ]
};

export const settlementBuildingsProductionBatch: ProductionAssetBatch = {
  id: 'settlement_buildings_v6',
  name: 'Settlement Building Identity',
  purpose:
    'Gradual production-pixel replacement set for the authored Human, Elf and Orc settlement structures. The game can ship each PNG independently because BuildingSprite keeps its code-rendered fallback.',
  assets: [
    buildingProductionAsset('human', 'hall', getBuildingVisualKind('hall')),
    buildingProductionAsset('human', 'barracks', getBuildingVisualKind('barracks')),
    buildingProductionAsset('human', 'forge', getBuildingVisualKind('forge')),
    buildingProductionAsset('human', 'wagonwright', getBuildingVisualKind('wagonwright')),
    buildingProductionAsset('human', 'quartermaster', getBuildingVisualKind('quartermaster')),
    buildingProductionAsset('human', 'war_room', getBuildingVisualKind('war_room')),
    buildingProductionAsset('human', 'stable', getBuildingVisualKind('stable')),
    buildingProductionAsset('human', 'signal_tower', getBuildingVisualKind('signal_tower')),
    buildingProductionAsset('human', 'officer_academy', getBuildingVisualKind('officer_academy')),

    buildingProductionAsset('elf', 'elf_heartgrove_hall', getBuildingVisualKind('elf_heartgrove_hall')),
    buildingProductionAsset('elf', 'elf_warden_lodge', getBuildingVisualKind('elf_warden_lodge')),
    buildingProductionAsset('elf', 'elf_moon_forge', getBuildingVisualKind('elf_moon_forge')),
    buildingProductionAsset('elf', 'elf_caravan_grove', getBuildingVisualKind('elf_caravan_grove')),
    buildingProductionAsset('elf', 'elf_spirit_stores', getBuildingVisualKind('elf_spirit_stores')),
    buildingProductionAsset('elf', 'elf_council_glade', getBuildingVisualKind('elf_council_glade')),
    buildingProductionAsset('elf', 'elf_stag_enclosure', getBuildingVisualKind('elf_stag_enclosure')),
    buildingProductionAsset('elf', 'elf_ward_beacon', getBuildingVisualKind('elf_ward_beacon')),

    buildingProductionAsset('orc', 'orc_warhold', getBuildingVisualKind('orc_warhold')),
    buildingProductionAsset('orc', 'orc_clan_yard', getBuildingVisualKind('orc_clan_yard')),
    buildingProductionAsset('orc', 'orc_bone_forge', getBuildingVisualKind('orc_bone_forge')),
    buildingProductionAsset('orc', 'orc_cartwright', getBuildingVisualKind('orc_cartwright')),
    buildingProductionAsset('orc', 'orc_smokehouse', getBuildingVisualKind('orc_smokehouse')),
    buildingProductionAsset('orc', 'orc_war_council', getBuildingVisualKind('orc_war_council')),
    buildingProductionAsset('orc', 'orc_warg_pens', getBuildingVisualKind('orc_warg_pens')),
    buildingProductionAsset('orc', 'orc_watchfire', getBuildingVisualKind('orc_watchfire'))
  ]
};

export const productionAssetBatches: ProductionAssetBatch[] = [
  starterProductionBatch,
  earlyProgressionProductionBatch,
  enemyIdentityProductionBatch,
  midgameUnitsProductionBatch,
  advancedPromotionsProductionBatch,
  settlementBuildingsProductionBatch
];

export function getProductionBatch(id: string) {
  return productionAssetBatches.find(batch => batch.id === id) ?? null;
}
