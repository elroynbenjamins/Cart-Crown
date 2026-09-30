import type { FactionId, UnitRole } from '../../game/types';

// Explicit artwork coverage, not a new unit list or progression rule. The captain
// illustration is the Swordsman archetype; real unit names/levels stay in the UI.
export const humanArtIds = [
  'captain', 'ranger', 'priest', 'infantry', 'spearman', 'lancer',
  'crossbowman', 'field_medic', 'halberdier', 'banner_captain',
  'heavy_cavalry', 'royal_guard'
] as const;
export type HumanArtId = typeof humanArtIds[number];
export type HumanPortraitKey = `human_${HumanArtId}_portrait`;
export type HumanFigureKey = `human_${HumanArtId}_unit`;
export type HumanArtKey = HumanPortraitKey | HumanFigureKey;

// Do not collapse every promotion into one role illustration: two-handed swords,
// mounted bows, engineering, unarmoured recruits and fantasy classes retain their
// existing exact sprites until matching new portraits AND figures are available.
export const humanClassArt: Readonly<Record<string, HumanArtId>> = {
  'Swordsman': 'captain',
  'Archer': 'ranger',
  'Ranger': 'ranger',
  'Scout': 'ranger',
  'Field Chaplain': 'priest',
  'Shield Infantry': 'infantry',
  'Man-at-Arms': 'infantry',
  'Spearman': 'spearman',
  'Lancer': 'lancer',
  'Crossbowman': 'crossbowman',
  'Field Medic': 'field_medic',
  'Halberdier': 'halberdier',
  'Banner Captain': 'banner_captain',
  'Heavy Cavalry': 'heavy_cavalry',
  'Royal Guard': 'royal_guard'
};
const roles: Readonly<Record<HumanArtId, readonly UnitRole[]>> = {
  captain: ['frontline', 'melee'], ranger: ['ranged', 'skirmish'],
  priest: ['support'], infantry: ['frontline', 'melee'],
  spearman: ['frontline', 'melee'], lancer: ['cavalry'],
  crossbowman: ['ranged'], field_medic: ['support'],
  halberdier: ['frontline', 'melee'], banner_captain: ['support'],
  heavy_cavalry: ['cavalry'], royal_guard: ['frontline', 'melee']
};

export function humanPortraitForClass(
  faction: FactionId, className: string, role: UnitRole
): HumanPortraitKey | null {
  if (faction !== 'human' || !Object.prototype.hasOwnProperty.call(humanClassArt, className)) return null;
  const id = humanClassArt[className]!;
  return roles[id].includes(role) ? `human_${id}_portrait` : null;
}

export const humanArtFrames: Readonly<Record<HumanArtKey, readonly [number, number, number, number]>> =
  Object.fromEntries(humanArtIds.flatMap(id => [
    [`human_${id}_portrait`, [8, 8, 240, 240]],
    [`human_${id}_unit`, [0, 0, 256, 256]]
  ])) as Record<HumanArtKey, readonly [number, number, number, number]>;

/** Used by Army/Formation cards, where UnitSprite receives class identity only. */
export function humanFigureForClass(faction: FactionId, className: string): HumanFigureKey | null {
  if (faction !== 'human' || !Object.prototype.hasOwnProperty.call(humanClassArt, className)) return null;
  return `human_${humanClassArt[className]}_unit`;
}
