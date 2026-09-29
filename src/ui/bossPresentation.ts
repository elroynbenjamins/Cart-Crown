import type { EncounterId } from '../game/encounters';

// Presentation only: no HP thresholds, phases, attacks, rewards or save writes.
export type BossSignature = 'hollow_roots' | 'stonejaw' | 'ashen_regent' | 'beacon';
export type BossMark = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'bar' | 'diamond' | 'ring';
  glow?: boolean;
  optional?: boolean;
}>;
export type BossPresentation = Readonly<{
  signature: BossSignature;
  name: string;
  material: string;
  light: string;
  introMs: number;
  drift: number;
  marks: readonly BossMark[];
}>;

// Exact encounter IDs avoid decorating ordinary enemies with boss-only tells.
export const bossSignatureByEncounter: Readonly<Partial<Record<EncounterId, BossSignature>>> = {
  elf_hollow_warden: 'hollow_roots',
  orc_stonejaw_champion: 'stonejaw',
  return_to_crownspire: 'ashen_regent',
  unbound_beacon: 'beacon'
};

export const BOSS_RAIL_WIDTH = 12;
export const BOSS_COMPACT_RAIL_WIDTH = 9;
export const BOSS_MAX_MARKS_PER_RAIL = 12;

const definitions: Readonly<Record<BossSignature, {
  name: string;
  dark: readonly [string, string];
  light: readonly [string, string];
  introMs: number;
  drift: number;
  marks: readonly BossMark[];
}>> = {
  hollow_roots: {
    name: 'Hollow Warden',
    dark: ['#75946B', '#B89BD9'],
    light: ['#3D5940', '#6D497E'],
    introMs: 800,
    drift: 5,
    marks: [
      { x: 2, y: 10, width: 3, height: 28, shape: 'bar' },
      { x: 4, y: 15, width: 6, height: 3, shape: 'bar' },
      { x: 7, y: 12, width: 2, height: 9, shape: 'bar' },
      { x: 2, y: 37, width: 4, height: 24, shape: 'bar' },
      { x: 4, y: 44, width: 6, height: 3, shape: 'bar' },
      { x: 7, y: 41, width: 2, height: 10, shape: 'bar' },
      { x: 4, y: 66, width: 3, height: 29, shape: 'bar' },
      { x: 2, y: 74, width: 8, height: 3, shape: 'bar' },
      { x: 6, y: 27, width: 3, height: 3, shape: 'diamond', glow: true },
      { x: 5, y: 55, width: 4, height: 4, shape: 'ring', glow: true },
      { x: 2, y: 85, width: 3, height: 3, shape: 'diamond', glow: true, optional: true }
    ]
  },
  stonejaw: {
    name: 'Stonejaw Champion',
    dark: ['#A9927A', '#D4BA90'],
    light: ['#735B43', '#826038'],
    introMs: 580,
    drift: 7,
    marks: [
      { x: 2, y: 11, width: 7, height: 15, shape: 'bar' },
      { x: 3, y: 18, width: 5, height: 6, shape: 'bar' },
      { x: 1, y: 39, width: 8, height: 18, shape: 'bar' },
      { x: 4, y: 47, width: 6, height: 5, shape: 'bar' },
      { x: 3, y: 70, width: 7, height: 14, shape: 'bar' },
      { x: 2, y: 78, width: 5, height: 6, shape: 'bar' },
      { x: 6, y: 29, width: 3, height: 3, shape: 'diamond', glow: true },
      { x: 2, y: 58, width: 3, height: 3, shape: 'diamond', glow: true },
      { x: 7, y: 88, width: 2, height: 2, shape: 'bar', glow: true, optional: true }
    ]
  },
  ashen_regent: {
    name: 'Ashen Court Regent',
    dark: ['#965D52', '#EBAB79'],
    light: ['#80534C', '#8B4C22'],
    introMs: 950,
    drift: -8,
    marks: [
      { x: 3, y: 10, width: 3, height: 13, shape: 'bar' },
      { x: 3, y: 38, width: 3, height: 19, shape: 'bar' },
      { x: 3, y: 70, width: 3, height: 15, shape: 'bar' },
      { x: 6, y: 20, width: 3, height: 3, shape: 'diamond', glow: true },
      { x: 2, y: 31, width: 2, height: 2, shape: 'diamond', glow: true },
      { x: 6, y: 52, width: 3, height: 3, shape: 'diamond', glow: true },
      { x: 2, y: 62, width: 3, height: 3, shape: 'bar', glow: true },
      { x: 6, y: 84, width: 3, height: 3, shape: 'diamond', glow: true },
      { x: 7, y: 44, width: 2, height: 2, shape: 'bar', glow: true, optional: true },
      { x: 1, y: 89, width: 2, height: 2, shape: 'bar', optional: true }
    ]
  },
  beacon: {
    name: 'Unbound Beacon',
    dark: ['#739BA8', '#E1C478'],
    light: ['#356473', '#826522'],
    introMs: 1000,
    drift: -4,
    marks: [
      { x: 4, y: 10, width: 2, height: 30, shape: 'bar' },
      { x: 2, y: 20, width: 8, height: 8, shape: 'ring', glow: true },
      { x: 4, y: 38, width: 2, height: 30, shape: 'bar' },
      { x: 2, y: 48, width: 8, height: 8, shape: 'ring', glow: true },
      { x: 4, y: 68, width: 2, height: 30, shape: 'bar' },
      { x: 2, y: 78, width: 8, height: 8, shape: 'ring', glow: true },
      { x: 5, y: 14, width: 2, height: 2, shape: 'diamond', glow: true, optional: true },
      { x: 5, y: 42, width: 2, height: 2, shape: 'diamond', glow: true, optional: true },
      { x: 5, y: 72, width: 2, height: 2, shape: 'diamond', glow: true, optional: true }
    ]
  }
};

export function getBossPresentation(
  encounterId: EncounterId,
  difficulty: 'Normal' | 'Elite' | 'Boss',
  dark: boolean,
  compact: boolean
): BossPresentation | null {
  const signature = bossSignatureByEncounter[encounterId];
  if (difficulty !== 'Boss' || !signature) return null;
  const source = definitions[signature];
  const [material, light] = dark ? source.dark : source.light;
  return {
    signature,
    name: source.name,
    material,
    light,
    introMs: source.introMs,
    drift: source.drift,
    marks: compact ? source.marks.filter(mark => !mark.optional) : source.marks
  };
}

export function canAnimateBossIntro(reduceMotion: boolean | null, appState: string | null) {
  // null means the OS preference has not resolved yet: do not guess.
  return reduceMotion === false && appState === 'active';
}
