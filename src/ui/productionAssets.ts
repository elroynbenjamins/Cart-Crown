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

export const PRODUCTION_ASSET_PIPELINE_VERSION = 2;
export const PRODUCTION_ASSET_ROOT = 'assets/game';

export type ProductionAssetCategory =
  | 'unit'
  | 'faction_crest'
  | 'equipment'
  | 'building'
  | 'enemy'
  | 'commander'
  | 'story_scene'
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
  return spec(
    'scene.' + faction + '.' + scene,
    'story_scene',
    PRODUCTION_ASSET_ROOT + '/scenes/' + faction + '/' + scene + '.png',
    768,
    432,
    false,
    5,
    '16:9 story scene with no text. Keep important subjects inside the central 80%.'
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
  return spec(
    'ui.' + id,
    'ui',
    PRODUCTION_ASSET_ROOT + '/ui/' + slug(id) + '.png',
    96,
    96,
    true,
    14,
    'Small UI glyph. Must stay legible around 20–32 px.'
  );
}

// Static React Native image sources must be registered with require(...).
// Keep this map intentionally empty until a reviewed PNG is committed.
// Adding a source here automatically replaces the code-rendered fallback everywhere.
export const productionAssetSources: Partial<Record<string, ImageSourcePropType>> = {};

export function getProductionAssetSource(assetId: string) {
  return productionAssetSources[assetId] ?? null;
}
