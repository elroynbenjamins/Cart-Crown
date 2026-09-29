import type { EncounterId } from '../game/encounters';
import type { UnitRole } from '../game/types';

/** Presentation only: no battle stats, phase changes, damage or persistence. */
export type BossAtmosphereKind = 'roots' | 'stonejaw' | 'ash' | 'beacon';
export type BossPalette = Readonly<{ accent: string; secondary: string }>;
export type BossDecor = Readonly<{
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: keyof BossPalette;
  opacity: number;
  rotate?: number;
  round?: boolean;
  outline?: boolean;
  detail?: boolean;
}>;

// Explicit IDs: an ordinary Warden/Champion or a neighbouring story node
// must not accidentally inherit boss presentation through a name substring.
export const bossAtmospheres = {
  elf_hollow_warden: 'roots',
  elf_ashroot_stalker: 'roots',
  elf_worldroot_guardian: 'roots',
  orc_stonejaw_champion: 'stonejaw',
  return_to_crownspire: 'ash',
  unbound_beacon: 'beacon'
} as const satisfies Partial<Record<EncounterId, BossAtmosphereKind>>;

export function getBossAtmosphere(
  encounterId: string,
  difficulty: 'Normal' | 'Elite' | 'Boss'
): BossAtmosphereKind | null {
  if (difficulty !== 'Boss' || !Object.prototype.hasOwnProperty.call(bossAtmospheres, encounterId)) {
    return null;
  }
  return bossAtmospheres[encounterId as keyof typeof bossAtmospheres];
}

const palettes: Record<BossAtmosphereKind, Readonly<{ dark: BossPalette; light: BossPalette }>> = {
  roots: {
    dark: { accent: '#9FD4AF', secondary: '#BCA1D9' },
    light: { accent: '#356447', secondary: '#705089' }
  },
  stonejaw: {
    dark: { accent: '#DBB687', secondary: '#B1A496' },
    light: { accent: '#805126', secondary: '#62605B' }
  },
  ash: {
    dark: { accent: '#E6A286', secondary: '#A69AAB' },
    light: { accent: '#99482E', secondary: '#635468' }
  },
  beacon: {
    dark: { accent: '#91D9E5', secondary: '#DCC08A' },
    light: { accent: '#286576', secondary: '#8A6228' }
  }
};

export function getBossPalette(kind: BossAtmosphereKind, dark: boolean): BossPalette {
  return palettes[kind][dark ? 'dark' : 'light'];
}

// Percentage geometry is confined to the outer gutters. The formation, HP
// values, tutorial targets and combat text keep an unobstructed centre.
const leftDecor: Record<BossAtmosphereKind, readonly BossDecor[]> = {
  roots: [
    { id: 'root-low', x: 3, y: 66, width: 1.4, height: 21, color: 'accent', opacity: .4, rotate: -3 },
    { id: 'root-mid', x: 3.8, y: 50, width: 1.2, height: 18, color: 'accent', opacity: .4, rotate: 3 },
    { id: 'root-high', x: 2.6, y: 34, width: 1, height: 18, color: 'accent', opacity: .32, rotate: -2 },
    { id: 'branch-low', x: 3, y: 73, width: 7, height: .5, color: 'accent', opacity: .45, rotate: -18 },
    { id: 'branch-high', x: 3, y: 45, width: 6, height: .5, color: 'accent', opacity: .45, rotate: -20 },
    { id: 'corruption-bud', x: 8.5, y: 42, width: 1.6, height: 1.4, color: 'secondary', opacity: .65, rotate: 45 },
    { id: 'root-fork', x: 2.5, y: 57, width: 5, height: .4, color: 'secondary', opacity: .3, rotate: 22, detail: true },
    { id: 'spore', x: 9, y: 60, width: .9, height: .7, color: 'secondary', opacity: .55, detail: true }
  ],
  stonejaw: [
    { id: 'stone-foot', x: 1, y: 78, width: 10, height: 2.5, color: 'secondary', opacity: .48, rotate: 4 },
    { id: 'stone-crown', x: 2, y: 74, width: 6, height: 3, color: 'secondary', opacity: .42, rotate: -5 },
    { id: 'dust-wide', x: 2, y: 70, width: 9, height: .7, color: 'accent', opacity: .45 },
    { id: 'dust-high', x: 4, y: 65, width: 7, height: .45, color: 'accent', opacity: .32 },
    { id: 'crack', x: 2, y: 85, width: 7, height: .4, color: 'accent', opacity: .45, rotate: -20 },
    { id: 'stone-shard', x: 9, y: 77, width: 2, height: 1.1, color: 'accent', opacity: .55, rotate: 15 },
    { id: 'dust-speck', x: 5, y: 59, width: .8, height: .6, color: 'accent', opacity: .5, detail: true },
    { id: 'crack-fork', x: 8, y: 87, width: 4, height: .3, color: 'secondary', opacity: .45, rotate: 25, detail: true }
  ],
  ash: [
    { id: 'charred-pillar', x: 2, y: 47, width: 2.5, height: 29, color: 'secondary', opacity: .28 },
    { id: 'pillar-cap', x: 1, y: 46, width: 4.5, height: .7, color: 'secondary', opacity: .45 },
    { id: 'cinder-low', x: 7, y: 69, width: 1.3, height: 1, color: 'accent', opacity: .65, rotate: 35 },
    { id: 'cinder-mid', x: 4, y: 58, width: .9, height: 1.5, color: 'accent', opacity: .65, rotate: -15 },
    { id: 'cinder-high', x: 9, y: 39, width: 1.1, height: .7, color: 'accent', opacity: .55, rotate: 30 },
    { id: 'ash-bed', x: 2, y: 82, width: 9, height: .6, color: 'accent', opacity: .38 },
    { id: 'ash-flake', x: 7, y: 30, width: 1.2, height: .4, color: 'secondary', opacity: .45, rotate: -20, detail: true },
    { id: 'ember-trail', x: 9.5, y: 48, width: .6, height: 3, color: 'accent', opacity: .25, detail: true }
  ],
  beacon: [
    { id: 'energy-column', x: 4, y: 29, width: .75, height: 53, color: 'accent', opacity: .38 },
    { id: 'seal-high', x: 3.7, y: 39, width: 2.8, height: 1.8, color: 'accent', opacity: .65, outline: true, rotate: 45 },
    { id: 'seal-low', x: 3.7, y: 68, width: 2.8, height: 1.8, color: 'secondary', opacity: .65, outline: true, rotate: 45 },
    { id: 'conduit', x: 4, y: 56, width: 7, height: .4, color: 'accent', opacity: .4 },
    { id: 'seal-core', x: 3.5, y: 53, width: 1.8, height: 1.8, color: 'secondary', opacity: .75, rotate: 45 },
    { id: 'foot', x: 2, y: 83, width: 6, height: .5, color: 'secondary', opacity: .5 },
    { id: 'energy-thread', x: 6, y: 35, width: .4, height: 43, color: 'accent', opacity: .18, detail: true },
    { id: 'mote', x: 9, y: 63, width: 1, height: .8, color: 'accent', opacity: .6, rotate: 45, detail: true }
  ]
};

/** At most 16 decorative primitives; compact mode reduces this to 12. */
export function getBossDecor(kind: BossAtmosphereKind, compact: boolean): BossDecor[] {
  return leftDecor[kind].filter(part => !compact || !part.detail).flatMap(part => [
    { ...part, id: part.id + '-left' },
    { ...part, id: part.id + '-right', x: 100 - part.x - part.width, rotate: -(part.rotate ?? 0) }
  ]);
}

/** Healing supplements, never replaces, an army's attack animation. */
export function getExchangeVisuals(role: UnitRole | null, healed: number) {
  return {
    attack: role === 'ranged' ? 'arrow' : role === 'cavalry' ? 'charge'
      : role === 'skirmish' ? 'skirmish' : role === 'support' ? 'ward'
      : role === 'frontline' || role === 'melee' ? 'slash' : null,
    heal: Number.isFinite(healed) && healed > 0
  } as const;
}
