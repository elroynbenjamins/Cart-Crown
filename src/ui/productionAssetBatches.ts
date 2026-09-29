import {
  factionCrestProductionAsset,
  equipmentProductionAsset,
  enemyProductionAsset,
  type ProductionAssetSpec,
  unitProductionAsset
} from './productionAssets';
import {
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

export const productionAssetBatches: ProductionAssetBatch[] = [
  starterProductionBatch,
  earlyProgressionProductionBatch,
  enemyIdentityProductionBatch,
  midgameUnitsProductionBatch
];

export function getProductionBatch(id: string) {
  return productionAssetBatches.find(batch => batch.id === id) ?? null;
}
