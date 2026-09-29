import type { MarcherWarningChoice } from '../game/chapter3';
import type { LastLoyalistsChoice } from '../game/chapter4';
import type { ResourceWallet } from '../game/types';
import { statTone } from './semanticColors';
import type { SemanticTone } from './semanticColors';

// Presentation only. Story actions and combat remain owned by their existing game modules.
export type EventEffectState = 'preview' | 'recorded' | 'unselected';
export type EventTacticalEffects = Partial<
  Pick<MarcherWarningChoice, 'attackMultiplier' | 'armorMultiplier' | 'speedMultiplier' | 'detailedIntel'> &
  Pick<LastLoyalistsChoice, 'retaliationMultiplier'>
>;
export type EventEffectRow = { id: string; label: string; value: string; tone: SemanticTone };

const fields = [
  { key: 'attackMultiplier', label: 'Army attack', lowerIsBetter: false },
  { key: 'armorMultiplier', label: 'Army armor', lowerIsBetter: false },
  { key: 'speedMultiplier', label: 'Army speed', lowerIsBetter: false },
  { key: 'retaliationMultiplier', label: 'Enemy retaliation', lowerIsBetter: true }
] as const;

export function eventEffectRows(effects: EventTacticalEffects, state: EventEffectState): EventEffectRow[] {
  const rows: EventEffectRow[] = [];
  for (const field of fields) {
    const value = effects[field.key] ?? 1;
    if (!Number.isFinite(value) || value < 0 || Math.abs(value - 1) < 0.000001) continue;
    const percent = Math.round((value - 1) * 10000) / 100;
    rows.push({
      id: field.key, label: field.label,
      value: (percent > 0 ? '+' : '') + percent + '%',
      tone: state === 'unselected' ? 'neutral' : statTone(value, 'multiplier', field.lowerIsBetter)
    });
  }
  if (effects.detailedIntel === true) rows.push({
    id: 'detailedIntel', label: 'Battle Prep intel from this choice', value: 'Detailed intel',
    tone: state === 'unselected' ? 'neutral' : 'positive'
  });
  return rows;
}

const resourceLabels: Record<keyof ResourceWallet, string> = {
  gold: 'Gold', wood: 'Wood', stone: 'Stone', iron: 'Iron', provisions: 'Provisions'
};

/** Labels never imply a preview was already received, or that production is an immediate payout. */
export function eventResourceRows(values: Partial<ResourceWallet>): EventEffectRow[] {
  return (Object.keys(resourceLabels) as Array<keyof ResourceWallet>).flatMap(key => {
    const amount = values[key];
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount === 0) return [];
    return [{
      id: key, label: resourceLabels[key], value: (amount > 0 ? '+' : '') + amount,
      tone: amount > 0 ? 'positive' as const : 'negative' as const
    }];
  });
}

export function eventRewardLabel(kind: 'immediate' | 'production' | 'blueprint', completed: boolean): string {
  if (kind === 'immediate') return completed ? 'Received once' : 'One-time reward preview';
  if (kind === 'production') return completed ? 'Production site unlocked' : 'Production unlock preview';
  return completed ? 'Blueprint unlocked' : 'Blueprint preview';
}
