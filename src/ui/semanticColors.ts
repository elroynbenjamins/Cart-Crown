import type { UnitBattleTag, UnitRole } from '../game/types';
import type { GameTheme } from '../theme/themes';

// Presentation only. Role, tier and rarity are different concepts; none implies another.
export type SemanticTone =
  | 'neutral' | 'positive' | 'negative' | 'warning' | 'currency'
  | 'blue' | 'red' | 'orange' | 'green' | 'violet' | 'cyan' | 'rose';
export type StatPresentation = 'absolute' | 'delta' | 'multiplier';

export const semanticPalettes: Record<'dark' | 'light', Record<SemanticTone, string>> = {
  dark: {
    neutral: '#D6D6D6', positive: '#8DE4AC', negative: '#FFABA7',
    warning: '#FFD485', currency: '#FFDB85', blue: '#94CDFF',
    red: '#FFABA7', orange: '#FFC18B', green: '#8DE4AC',
    violet: '#D6B7FF', cyan: '#82E1EC', rose: '#FFA6D2'
  },
  light: {
    neutral: '#3E4B57', positive: '#175A34', negative: '#98252E',
    warning: '#754608', currency: '#72500D', blue: '#17548A',
    red: '#98252E', orange: '#863B12', green: '#175A34',
    violet: '#63318C', cyan: '#105867', rose: '#882256'
  }
};

export const rolePresentation: Record<UnitRole, { label: string; tone: SemanticTone }> = {
  frontline: { label: 'Frontline', tone: 'blue' },
  melee: { label: 'Melee', tone: 'red' },
  ranged: { label: 'Ranged', tone: 'orange' },
  support: { label: 'Support', tone: 'green' },
  cavalry: { label: 'Cavalry', tone: 'cyan' },
  skirmish: { label: 'Skirmisher', tone: 'violet' }
};

export const battleTagPresentation: Record<UnitBattleTag, { label: string; tone: SemanticTone }> = {
  ground: { label: 'Ground', tone: 'neutral' },
  mounted: { label: 'Mounted', tone: 'cyan' },
  ranged: { label: 'Ranged', tone: 'orange' },
  magic: { label: 'Magic', tone: 'violet' },
  flying: { label: 'Flying', tone: 'cyan' },
  large: { label: 'Large', tone: 'currency' },
  construct: { label: 'Construct', tone: 'blue' },
  beast: { label: 'Beast', tone: 'orange' },
  anti_air: { label: 'Anti-air', tone: 'blue' },
  anti_large: { label: 'Anti-large', tone: 'currency' },
  armored: { label: 'Armored', tone: 'blue' },
  support: { label: 'Support', tone: 'green' },
  charge: { label: 'Charge', tone: 'red' }
};

export const rarityPresentation = {
  common: { label: 'Common', tone: 'neutral' },
  uncommon: { label: 'Uncommon', tone: 'green' },
  rare: { label: 'Rare', tone: 'blue' },
  epic: { label: 'Epic', tone: 'violet' },
  legendary: { label: 'Legendary', tone: 'currency' },
  mythic: { label: 'Mythic', tone: 'rose' }
} as const;
export type PresentedRarity = keyof typeof rarityPresentation;

export function semanticColor(theme: Pick<GameTheme, 'dark'>, tone: SemanticTone): string {
  return semanticPalettes[theme.dark ? 'dark' : 'light'][tone];
}

function rgb(hex: string): number[] {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error('Expected an opaque six-digit hex color.');
  return [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
}

export function blendColor(foreground: string, background: string, opacity: number): string {
  const alpha = Math.max(0, Math.min(1, Number.isFinite(opacity) ? opacity : 0));
  const bg = rgb(background);
  return '#' + rgb(foreground).map((channel, index) =>
    Math.round(channel * alpha + bg[index]! * (1 - alpha)).toString(16).padStart(2, '0')
  ).join('');
}

export function semanticChipColors(theme: Pick<GameTheme, 'dark' | 'colors'>, tone: SemanticTone) {
  const text = semanticColor(theme, tone);
  return {
    text,
    background: blendColor(text, theme.colors.surface1, theme.dark ? 0.10 : 0.06),
    border: blendColor(text, theme.colors.surface1, 0.48)
  };
}

export function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const channels = rgb(hex).map(value => {
      const s = value / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
  };
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Absolute HP/attack values are not bonuses. Multipliers are compared with 1, deltas with 0. */
export function statTone(
  value: string | number,
  presentation: StatPresentation = 'absolute',
  lowerIsBetter = false
): SemanticTone {
  if (presentation === 'absolute') return 'neutral';
  const normalized = String(value).trim().replace(/^[×x]/, '').replace(/%$/, '').replace(/−/g, '-');
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(normalized)) return 'neutral';
  const number = Number(normalized);
  if (!Number.isFinite(number)) return 'neutral';
  const delta = number - (presentation === 'multiplier' ? 1 : 0);
  if (Math.abs(delta) < 0.000001) return 'neutral';
  return (lowerIsBetter ? -delta : delta) > 0 ? 'positive' : 'negative';
}

export function tierTone(tier: number): SemanticTone {
  if (!Number.isInteger(tier) || tier < 1) return 'neutral';
  return tier === 1 ? 'neutral' : tier === 2 ? 'blue' : tier === 3 ? 'violet' : tier === 4 ? 'currency' : 'rose';
}

/** Never invent rarity from a tier, item name or missing value. */
export function getRarityPresentation(value: unknown) {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(rarityPresentation, key)
    ? rarityPresentation[key as PresentedRarity]
    : null;
}

export type EmphasisPart = { text: string; tone?: SemanticTone };

/** Only explicitly signed bonus tokens or named resource amounts receive emphasis. */
export function emphasisParts(text: string, mode: 'bonuses' | 'resources'): EmphasisPart[] {
  const expression = mode === 'bonuses'
    ? /[+−-]\d+(?:\.\d+)?%?/g
    : /\b\d+(?:,\d{3})*(?:\.\d+)?\s+(?:more\s+)?(?:Gold|Wood|Stone|Iron|Provisions)\b/gi;
  const parts: EmphasisPart[] = [];
  let start = 0;
  for (const match of text.matchAll(expression)) {
    const index = match.index ?? 0;
    if (index > start) parts.push({ text: text.slice(start, index) });
    parts.push({ text: match[0], tone: mode === 'resources' ? 'currency' : statTone(match[0], 'delta') });
    start = index + match[0].length;
  }
  if (start < text.length) parts.push({ text: text.slice(start) });
  return parts.length ? parts : [{ text }];
}
