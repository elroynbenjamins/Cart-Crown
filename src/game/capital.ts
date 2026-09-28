export type RoyalDecreeId =
  | 'royal_muster'
  | 'provincial_tithe'
  | 'masterwork_commission';

export type RoyalDecreeDefinition = {
  id: RoyalDecreeId;
  name: string;
  subtitle: string;
  description: string;
  effectText: string;
  attackMultiplier: number;
  armorMultiplier: number;
  productionMultiplier: number;
  equipmentCostMultiplier: number;
};

export const royalDecrees: RoyalDecreeDefinition[] = [
  {
    id: 'royal_muster',
    name: 'Royal Muster',
    subtitle: 'Army Decree',
    description: 'Call veteran levies and professional officers into permanent campaign readiness.',
    effectText: '+7% army attack and +7% army armor in combat',
    attackMultiplier: 1.07,
    armorMultiplier: 1.07,
    productionMultiplier: 1,
    equipmentCostMultiplier: 1
  },
  {
    id: 'provincial_tithe',
    name: 'Provincial Tithe',
    subtitle: 'Administration Decree',
    description: 'Standardize contributions from farms, mines, depots and salvage camps under Greenkeep authority.',
    effectText: '+25% regional production gained from meaningful activities',
    attackMultiplier: 1,
    armorMultiplier: 1,
    productionMultiplier: 1.25,
    equipmentCostMultiplier: 1
  },
  {
    id: 'masterwork_commission',
    name: 'Masterwork Commission',
    subtitle: 'Crafting Decree',
    description: 'Reserve the best iron, timber and workshop time for army equipment production.',
    effectText: '-12% equipment crafting and upgrade costs',
    attackMultiplier: 1,
    armorMultiplier: 1,
    productionMultiplier: 1,
    equipmentCostMultiplier: 0.88
  }
];

export function getRoyalDecree(id: string | null) {
  if (!id) return null;
  return royalDecrees.find(decree => decree.id === id) ?? null;
}
