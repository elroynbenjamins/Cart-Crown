import type {
  BuildingRole, SettlementAdjacencyBonusDefinition, SettlementAdjacencyEffects
} from '../game/types';
import type { SemanticTone } from './semanticColors';
import { statTone } from './semanticColors';

// A building's purpose is not its level, rarity, affordability or selected state.
export const buildingRolePresentation: Record<BuildingRole, { label: string; tone: SemanticTone }> = {
  KINGDOM: { label: 'Kingdom', tone: 'violet' },
  ARMY: { label: 'Army', tone: 'blue' },
  EQUIPMENT: { label: 'Equipment', tone: 'orange' },
  LOGISTICS: { label: 'Logistics', tone: 'cyan' },
  SUPPLY: { label: 'Supply', tone: 'green' },
  COMMAND: { label: 'Command', tone: 'rose' },
  MOUNT: { label: 'Mounts', tone: 'cyan' },
  SCOUT: { label: 'Scouting', tone: 'blue' }
};

export type DistrictDisplayState = 'active' | 'preview' | 'inactive';
export type DistrictEffectRow = { key: keyof SettlementAdjacencyEffects; label: string; value: string; tone: SemanticTone };
const signed = (value: number) => (value > 0 ? '+' : '') + String(Math.round(value * 100) / 100);

/** Interpret typed effect fields, never guess polarity from the prose or the sign alone. */
export function districtEffectRows(effects: Partial<SettlementAdjacencyEffects>, state: DistrictDisplayState): DistrictEffectRow[] {
  const rows: DistrictEffectRow[] = [];
  const add = (key: keyof SettlementAdjacencyEffects, label: string, value: string, tone: SemanticTone) => {
    rows.push({ key, label, value, tone: state === 'inactive' ? 'neutral' : tone });
  };
  const multipliers = [
    ['equipmentCostMultiplier', 'Equipment crafting / upgrades', true],
    ['mountCostMultiplier', 'Mount crafting', true],
    ['commanderSkillPowerMultiplier', 'Commander skill power', false]
  ] as const;
  for (const [key, label, lowerIsBetter] of multipliers) {
    const value = effects[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    const delta = Math.round((value - 1) * 10000) / 100;
    add(key, label, signed(delta) + '%', statTone(value, 'multiplier', lowerIsBetter));
  }
  const additions = [
    ['expeditionWoodBonus', 'Expedition rewards', 'Wood'],
    ['expeditionProvisionBonus', 'Expedition rewards', 'Provisions'],
    ['dailyProvisionBonus', 'Daily supplies', 'Provisions']
  ] as const;
  for (const [key, label, unit] of additions) {
    const value = effects[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    add(key, label, signed(value) + ' ' + unit, statTone(value, 'delta'));
  }
  const discount = effects.commanderRespecDiscount;
  if (typeof discount === 'number' && Number.isFinite(discount)) {
    add('commanderRespecDiscount', 'Commander retraining cost', signed(-discount) + ' Gold', statTone(-discount, 'delta', true));
  }
  if (effects.commanderSkillEarlyTrigger !== undefined) {
    add('commanderSkillEarlyTrigger', 'Commander skill timing', effects.commanderSkillEarlyTrigger ? '1 exchange earlier' : 'Normal timing', effects.commanderSkillEarlyTrigger ? 'positive' : 'neutral');
  }
  if (effects.detailedIntel !== undefined) {
    add('detailedIntel', 'Battle Prep intel', effects.detailedIntel ? 'Detailed intel' : 'Standard intel', effects.detailedIntel ? 'positive' : 'neutral');
  }
  return rows;
}

export type DistrictRecipeState = 'active' | 'locked' | 'unbuilt' | 'unplaced' | 'separated';
export const districtRecipePresentation: Record<DistrictRecipeState, { label: string; tone: SemanticTone }> = {
  active: { label: 'Active', tone: 'positive' },
  locked: { label: 'Blueprint locked', tone: 'neutral' },
  unbuilt: { label: 'Buildings needed', tone: 'warning' },
  unplaced: { label: 'Placement needed', tone: 'warning' },
  separated: { label: 'Not adjacent', tone: 'blue' }
};

/** The game's adjacency analysis remains authoritative for activation. */
export function districtRecipeState(
  bonus: Pick<SettlementAdjacencyBonusDefinition, 'id' | 'buildingA' | 'buildingB'>,
  activeBonusIds: ReadonlySet<string>,
  levels: Record<string, number>,
  placements: Record<string, string | null>,
  isBuildingUnlocked: (id: string) => boolean
): DistrictRecipeState {
  if (activeBonusIds.has(bonus.id)) return 'active';
  const ids = [bonus.buildingA, bonus.buildingB];
  if (ids.some(id => !isBuildingUnlocked(id))) return 'locked';
  if (ids.some(id => (levels[id] ?? 0) <= 0)) return 'unbuilt';
  const placedIds = new Set(Object.values(placements));
  if (ids.some(id => !placedIds.has(id))) return 'unplaced';
  return 'separated';
}
