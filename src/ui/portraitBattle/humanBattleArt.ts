import type { UnitDefinition } from '../../game/types';

/** Explicit Human class art. No substring matching or enemy/faction substitution.
 * Portraits describe a class archetype, not a bespoke likeness of a named squad.
 * Figures reuse the existing unit PNG path so Army/Formation and combat agree.
 */
export const humanBattleArtClasses = [
  { className: 'Man-at-Arms', slug: 'man_at_arms', role: 'frontline' },
  { className: 'Ranger', slug: 'ranger', role: 'skirmish' },
  { className: 'Field Chaplain', slug: 'field_chaplain', role: 'support' },
  { className: 'Lancer', slug: 'lancer', role: 'cavalry' },
  { className: 'Shield Infantry', slug: 'shield_infantry', role: 'frontline' },
  { className: 'Spearman', slug: 'spearman', role: 'frontline' },
  { className: 'Crossbowman', slug: 'crossbowman', role: 'ranged' },
  { className: 'Field Medic', slug: 'field_medic', role: 'support' },
  { className: 'Halberdier', slug: 'halberdier', role: 'frontline' },
  { className: 'Banner Captain', slug: 'banner_captain', role: 'support' },
  { className: 'Heavy Cavalry', slug: 'heavy_cavalry', role: 'cavalry' },
  { className: 'Royal Guard', slug: 'royal_guard', role: 'frontline' },
] as const;

export type HumanArtSlug = typeof humanBattleArtClasses[number]['slug'];
export type HumanPortraitKey = `human_${HumanArtSlug}_portrait`;
export type HumanFigureKey = `human_${HumanArtSlug}_unit`;

export function humanClassPortrait(unit: Pick<UnitDefinition, 'className' | 'faction' | 'role' | 'battleTags'>): HumanPortraitKey | null {
  if (unit.faction !== 'human') return null;
  if (unit.battleTags?.some(tag => ['magic', 'flying', 'large', 'construct', 'beast'].includes(tag))) return null;
  const key = unit.className.trim().toLowerCase();
  const match = humanBattleArtClasses.find(entry => entry.className.toLowerCase() === key && entry.role === unit.role);
  return match ? `human_${match.slug}_portrait` : null;
}
