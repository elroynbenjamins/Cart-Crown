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

// Unsupported promotions retain their exact sprites rather than borrowing the
// wrong weapon or mount. New artwork appears only for these reviewed pairs.
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
): HumanPortraitKey | 'captain_portrait' | null {
  if (faction !== 'human') return null;
  // Preserve the already-approved opening battle until simple starter pairs are
  // authored. This is the OLD portrait/figure, not a newly assigned elite outfit.
  if ((className === 'Recruit' || className === 'Militia') && role === 'frontline') return 'captain_portrait';
  if (!Object.prototype.hasOwnProperty.call(humanClassArt, className)) return null;
  const id = humanClassArt[className];
  return id && roles[id].includes(role) ? `human_${id}_portrait` : null;
}

const portraitFrame = [8, 8, 240, 240] as const;
const figureFrame = [0, 0, 256, 256] as const;
export const humanArtFrames = {
  human_captain_portrait: portraitFrame, human_captain_unit: figureFrame,
  human_ranger_portrait: portraitFrame, human_ranger_unit: figureFrame,
  human_priest_portrait: portraitFrame, human_priest_unit: figureFrame,
  human_infantry_portrait: portraitFrame, human_infantry_unit: figureFrame,
  human_spearman_portrait: portraitFrame, human_spearman_unit: figureFrame,
  human_lancer_portrait: portraitFrame, human_lancer_unit: figureFrame,
  human_crossbowman_portrait: portraitFrame, human_crossbowman_unit: figureFrame,
  human_field_medic_portrait: portraitFrame, human_field_medic_unit: figureFrame,
  human_halberdier_portrait: portraitFrame, human_halberdier_unit: figureFrame,
  human_banner_captain_portrait: portraitFrame, human_banner_captain_unit: figureFrame,
  human_heavy_cavalry_portrait: portraitFrame, human_heavy_cavalry_unit: figureFrame,
  human_royal_guard_portrait: portraitFrame, human_royal_guard_unit: figureFrame
} satisfies Readonly<Record<HumanArtKey, readonly [number, number, number, number]>>;

/** Used by Army/Formation cards, where UnitSprite receives class identity only. */
export function humanFigureForClass(faction: FactionId, className: string): HumanFigureKey | null {
  if (faction !== 'human' || !Object.prototype.hasOwnProperty.call(humanClassArt, className)) return null;
  const id = humanClassArt[className];
  return id ? `human_${id}_unit` : null;
}
