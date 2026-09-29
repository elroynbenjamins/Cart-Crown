import type { RoyalDecreeDefinition } from '../game/capital';
import type { FactionMandateDefinition } from '../game/factionChapter5';
import type { SemanticTone } from './semanticColors';
import { statTone } from './semanticColors';

// Presentation only: the authored policy fields and GameProvider own all effects and spending.
export type PolicyEffects = Partial<
  Pick<RoyalDecreeDefinition, 'attackMultiplier' | 'armorMultiplier' | 'productionMultiplier' | 'equipmentCostMultiplier'> &
  Pick<FactionMandateDefinition, 'speedMultiplier' | 'commanderSkillPowerMultiplier' | 'detailedIntel'>
>;
export type PolicyOption = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  effectText: string;
  effects: PolicyEffects;
};
export type PolicyDisplayState = 'active' | 'preview' | 'available';
export type PolicyEffectRow = { key: keyof PolicyEffects; label: string; value: string; tone: SemanticTone };
export type PolicyChangeRow = { key: keyof PolicyEffects; label: string; before: string; after: string; tone: SemanticTone };

const multiplierFields = [
  { key: 'attackMultiplier', label: 'Army attack', lowerIsBetter: false, category: 'Combat', tone: 'blue' },
  { key: 'armorMultiplier', label: 'Army armor', lowerIsBetter: false, category: 'Combat', tone: 'blue' },
  { key: 'speedMultiplier', label: 'Army speed', lowerIsBetter: false, category: 'Combat', tone: 'blue' },
  { key: 'productionMultiplier', label: 'Regional production', lowerIsBetter: false, category: 'Production', tone: 'green' },
  { key: 'equipmentCostMultiplier', label: 'Equipment crafting / upgrade costs', lowerIsBetter: true, category: 'Equipment', tone: 'violet' },
  { key: 'commanderSkillPowerMultiplier', label: 'Commander skill power', lowerIsBetter: false, category: 'Command', tone: 'rose' }
] as const;

function multiplier(value: number | undefined): number | null {
  if (value === undefined) return 1;
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function policyPercent(value: number): string {
  const percentage = Math.round((value - 1) * 10000) / 100;
  return (percentage > 0 ? '+' : '') + percentage + '%';
}

/** Available options remain neutral; the active or explicitly previewed choice gets value emphasis. */
export function policyEffectRows(effects: PolicyEffects, state: PolicyDisplayState): PolicyEffectRow[] {
  const rows: PolicyEffectRow[] = [];
  for (const field of multiplierFields) {
    const value = multiplier(effects[field.key]);
    if (value === null || Math.abs(value - 1) < 0.000001) continue;
    rows.push({
      key: field.key, label: field.label, value: policyPercent(value),
      tone: state === 'available' ? 'neutral' : statTone(value, 'multiplier', field.lowerIsBetter)
    });
  }
  if (effects.detailedIntel === true) {
    rows.push({ key: 'detailedIntel', label: 'Battle Prep intel', value: 'Detailed intel', tone: state === 'available' ? 'neutral' : 'positive' });
  }
  return rows;
}

/** Before/after are contributions of these policies, not final army totals or relative win chances. */
export function policyChangeRows(current: PolicyEffects, proposed: PolicyEffects): PolicyChangeRow[] {
  const rows: PolicyChangeRow[] = [];
  for (const field of multiplierFields) {
    const before = multiplier(current[field.key]);
    const after = multiplier(proposed[field.key]);
    if (before === null || after === null || Math.abs(after - before) < 0.000001) continue;
    rows.push({
      key: field.key, label: field.label,
      before: policyPercent(before), after: policyPercent(after),
      tone: statTone(after - before, 'delta', field.lowerIsBetter)
    });
  }
  const beforeIntel = current.detailedIntel === true;
  const afterIntel = proposed.detailedIntel === true;
  if (beforeIntel !== afterIntel) rows.push({
    key: 'detailedIntel', label: 'Detailed intel from this policy',
    before: beforeIntel ? 'Provided' : 'Not provided', after: afterIntel ? 'Provided' : 'Not provided',
    tone: afterIntel ? 'positive' : 'negative'
  });
  return rows;
}

/** Categories identify actual effect fields. They do not rank, recommend or imply rarity. */
export function policyCategories(effects: PolicyEffects): Array<{ label: string; tone: SemanticTone }> {
  const categories = new Map<string, SemanticTone>();
  for (const field of multiplierFields) {
    const value = multiplier(effects[field.key]);
    if (value !== null && Math.abs(value - 1) >= 0.000001) categories.set(field.category, field.tone);
  }
  if (effects.detailedIntel === true) categories.set('Scouting', 'cyan');
  return Array.from(categories, ([label, tone]) => ({ label, tone }));
}

export function policyCommitState(activeId: string | null, selectedId: string | null, gold: number, switchCost: number) {
  const current = Boolean(selectedId && activeId === selectedId);
  const switching = Boolean(selectedId && activeId && activeId !== selectedId);
  const cost = switching ? Number.isFinite(switchCost) && switchCost >= 0 ? switchCost : null : 0;
  const balance = Number.isFinite(gold) && gold >= 0 ? gold : null;
  const missing = cost === null ? null : cost === 0 ? 0 : balance === null ? null : Math.max(0, cost - balance);
  return {
    current, switching, cost, balance, missing,
    canCommit: Boolean(selectedId && !current && missing === 0 && cost !== null),
    balanceAfter: cost !== null && balance !== null && balance >= cost ? balance - cost : null
  };
}
