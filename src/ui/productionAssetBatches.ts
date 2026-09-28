import {
  factionCrestProductionAsset,
  equipmentProductionAsset,
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

export const productionAssetBatches: ProductionAssetBatch[] = [
  starterProductionBatch
];

export function getProductionBatch(id: string) {
  return productionAssetBatches.find(batch => batch.id === id) ?? null;
}
