import { humanPortraitForClass } from './humanArt';
import type { HumanPortraitKey, HumanFigureKey } from './humanArt';
import type { EnemyFantasyThreatFamily, FactionId, FormationShapeDefinition, UnitDefinition, UnitRole } from '../../game/types';
import type { EnemyArmyProfileId, EnemyRoleAssignment } from '../../game/encounters';

export type PortraitKey = 'captain_portrait' | 'ranger_portrait' | 'priest_portrait'
  | 'raider_portrait' | 'missile_portrait' | 'warg_portrait' | HumanPortraitKey;
export type FigureKey = 'captain_unit' | 'ranger_unit' | 'priest_unit' | 'raider_unit' | 'missile_unit' | 'warg_unit' | HumanFigureKey;
export function figureForPortrait(portrait: PortraitKey): FigureKey {
  return portrait.replace('_portrait', '_unit') as FigureKey;
}
export type ArtKey = FigureKey | PortraitKey | 'greenkeep_sky' | 'greenkeep_ground' | 'greenkeep_location';

/**
 * Encounter theatre, not a gameplay modifier. Distinct ranks help players
 * recognize dangerous fights before opening a squad detail or combat log.
 */
export function battleSpectacleCue(difficulty: 'Normal' | 'Elite' | 'Boss') {
  switch (difficulty) {
    case 'Boss': return { label: 'BOSS ENCOUNTER', short: 'BOSS', prominence: 3 } as const;
    case 'Elite': return { label: 'ELITE ENCOUNTER', short: 'ELITE', prominence: 2 } as const;
    default: return { label: 'FIELD ENGAGEMENT', short: 'NORMAL', prominence: 1 } as const;
  }
}

/**
 * Compact battle-only formation cue. Derive the description from authored slot
 * counts, not current survivors: a routed squad must not make the line visually
 * reorganize or change the formation's tactical identity.
 */
export function stageFormationReadout(shape: FormationShapeDefinition) {
  const front = shape.rows.front.length;
  const middle = shape.rows.middle.length;
  const rear = shape.rows.rear.length;
  const posture = middle === 0
    ? 'No middle rank'
    : front >= 5
      ? 'Wide frontline'
      : rear >= 4
        ? 'Deep rear line'
        : middle >= 4
          ? 'Strong center'
          : front >= 4
            ? 'Forward pressure'
            : front < middle
              ? 'Protected center'
              : 'Balanced ranks';
  return {
    posture,
    ranks: front + ' front · ' + middle + ' mid · ' + rear + ' rear',
    label: shape.name + ' · ' + posture
  } as const;
}

export const stageRoleLetters: Readonly<Record<UnitRole, string>> = {
  frontline: 'F',
  melee: 'M',
  ranged: 'R',
  support: '+',
  cavalry: 'C',
  skirmish: 'K'
};

export type ArmySide = 'ally' | 'enemy';
export type ExchangeRecord = Readonly<{ exchange: number; dealt: number; taken: number; healed: number; skill: string | null }>;
export type StageToken = Readonly<{ slot: number; x: number; y: number; size: number; row: 'front' | 'middle' | 'rear' }>;
export type IntegrityTier = 'stable' | 'pressured' | 'breaking' | 'breached';

/** Use the state computed by the combat engine; visual code never sets integrity thresholds. */
export function stageIntegrityReadout(value: number, state: IntegrityTier) {
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 100;
  const label = state === 'stable' ? 'Stable' : state === 'pressured' ? 'Pressured'
    : state === 'breaking' ? 'Breaking' : 'Breached';
  return { percent, label, fractured: state === 'breaking' || state === 'breached' } as const;
}

/** A single real-damage trail on the existing exchange pulse; never invents per-squad HP. */
export function stageAttackTrail(
  allies: readonly StageToken[], enemies: readonly StageToken[],
  attackerSlot: number | null, targetSlot: number | null,
  role: UnitRole | null, actualDamage: number
) {
  if (!Number.isFinite(actualDamage) || actualDamage <= 0 || (role !== 'ranged' && role !== 'cavalry')) return null;
  const attacker = allies.find(item => item.slot === attackerSlot);
  const target = enemies.find(item => item.slot === targetSlot);
  if (!attacker || !target) return null;
  const x = attacker.x;
  const y = attacker.y - attacker.size * .3;
  return {
    x, y,
    dx: target.x - x,
    dy: target.y + target.size * .3 - y,
    kind: role === 'ranged' ? 'arrow' : 'charge'
  } as const;
}

/** Fracture marks follow genuine occupied frontline anchors, not fixed screen percentages.
 * Returns null when no army actor exists. Routed enemy slots are deliberately
 * retained in the source formation so row geometry does not shift after losses.
 */
export function stageFractureLine(
  tokens: readonly StageToken[], side: ArmySide, width: number, height: number
) {
  if (!tokens.length || !Number.isFinite(width) || !Number.isFinite(height) || width < 120 || height < 160) return null;
  const front = tokens.filter(token => token.row === 'front');
  const pivot = front.length ? front : [...tokens].sort((a, b) =>
    side === 'enemy' ? b.y - a.y : a.y - b.y).slice(0, 1);
  const left = Math.min(...pivot.map(token => token.x - token.size / 2));
  const right = Math.max(...pivot.map(token => token.x + token.size / 2));
  const bandWidth = Math.max(28, Math.min(width - 8, right - left));
  const top = side === 'enemy'
    ? Math.max(...pivot.map(token => token.y + token.size / 2)) + 4
    : Math.min(...pivot.map(token => token.y - token.size / 2)) - 4;
  return {
    left: Math.max(4, Math.min(width - bandWidth - 4, left)),
    top: Math.max(4, Math.min(height - 4, top)),
    width: bandWidth
  } as const;
}

/** Static on-field signal derived from the currently active commander order.
 * A signal never changes position, targeting, integrity or battle calculations.
 * Missing actors deliberately produce no false defensive/offensive formation.
 */
export type StageOrderBand = Readonly<{
  id: 'hold' | 'focus' | 'push' | 'reinforce';
  label: string;
  left: number;
  top: number;
  width: number;
}>;

export function stageOrderBand(
  order: string | null,
  allies: readonly StageToken[],
  enemies: readonly StageToken[],
  targetSlot: number | null,
  width: number,
  height: number
): StageOrderBand | null {
  if (!['hold', 'focus', 'push', 'reinforce'].includes(order ?? '')) return null;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 120 || height < 160) return null;
  const id = order as StageOrderBand['id'];
  if (id === 'focus') {
    const target = enemies.find(unit => unit.slot === targetSlot);
    if (!target) return null;
    const bandWidth = 42;
    return {
      id, label: 'FOCUS',
      left: Math.max(4, Math.min(width - bandWidth - 4, target.x - bandWidth / 2)),
      top: Math.max(4, Math.min(height - 18, target.y + target.size / 2 + 2)),
      width: bandWidth
    };
  }
  // Use the real occupied ranks, never the shape's unoccupied authored slots.
  // The nearest occupied row to the engagement is the active defensive line.
  const ordered = [...allies].sort((a, b) => a.y - b.y);
  const backline = [...allies].sort((a, b) => b.y - a.y);
  const pivot = id === 'reinforce' ? backline[0] : ordered[0];
  if (!pivot) return null;
  const line = allies.filter(unit => unit.row === pivot.row);
  const left = Math.min(...line.map(unit => unit.x - unit.size / 2));
  const right = Math.max(...line.map(unit => unit.x + unit.size / 2));
  const padding = 4;
  const bandWidth = Math.max(40, Math.min(width - 2 * padding, right - left));
  return {
    id,
    label: id === 'hold' ? 'BRACED' : id === 'push' ? 'ADVANCE' : 'REINFORCE',
    left: Math.max(padding, Math.min(width - bandWidth - padding, left)),
    top: Math.max(4, Math.min(height - 18, Math.min(...line.map(unit => unit.y - unit.size / 2)) - 16)),
    width: bandWidth
  };
}

export const roleNames: Record<UnitRole, string> = {
  frontline: 'Frontline', melee: 'Melee', ranged: 'Ranged', support: 'Support', cavalry: 'Mounted', skirmish: 'Skirmish'
};

/** Only publish matching portrait/figure pairs for approved Human classes. */
export function allyPortrait(unit: UnitDefinition): PortraitKey | null {
  if (unit.battleTags?.some(tag => ['magic', 'flying', 'large', 'construct', 'beast'].includes(tag))) return null;
  return humanPortraitForClass(unit.faction, unit.className, unit.role);
}

export function enemyPortrait(role: UnitRole, profile: EnemyArmyProfileId, name: string, boss: boolean, fantasyThreat?: EnemyFantasyThreatFamily): PortraitKey | null {
  if (fantasyThreat) return null;
  if (boss) return null; // Named bosses retain their existing authored identity.
  if (role === 'cavalry') return /warg/i.test(name) ? 'warg_portrait' : null;
  if (profile === 'raider_pack' || profile === 'missile_company' || profile === 'shock_warband') {
    if (role === 'ranged') return 'missile_portrait';
    if (role === 'support') return null;
    return 'raider_portrait';
  }
  return null;
}

export function healthFraction(hp: number, maximum: number): number {
  if (!Number.isFinite(hp) || !Number.isFinite(maximum) || maximum <= 0) return 0;
  return Math.max(0, Math.min(1, hp / maximum));
}

export const ranks = ['front', 'middle', 'rear'] as const;
export type Rank = typeof ranks[number];
export const rankLabels: Record<Rank, string> = { front: 'Front', middle: 'Middle', rear: 'Rear' };

function finite(value: number, fallback: number) { return Number.isFinite(value) ? value : fallback; }

/** Uses the available battle viewport (after native insets), not the whole screen. */
export function battleLayout(width: number, height: number, fontScale = 1) {
  const w = Math.max(240, finite(width, 360));
  const h = Math.max(240, finite(height, 640));
  const scale = Math.max(1, Math.min(3, finite(fontScale, 1)));
  const compact = h < 680 || w < 360;
  const portraitSize = compact ? 48 : 56;
  const railHeight = portraitSize + 18 * scale + 6;
  const footerStacked = w < 300 || (w < 480 && scale > 1.25);
  const reserved = 46 * scale + 2 * railHeight + 44 * scale + 52 * scale + 26 + 32;
  return {
    compact, portraitSize, railHeight, footerStacked,
    portraitWidth: Math.max(64, portraitSize + 16),
    stageWidth: Math.max(220, w - 20),
    stageHeight: Math.round(Math.max(264, Math.min(580, h - reserved))),
    // Small/large-text screens scroll the content, never the outcome footer.
  };
}

export function rankForSlot(shape: FormationShapeDefinition, slot: number): Rank | null {
  return ranks.find(row => shape.rows[row].includes(slot)) ?? null;
}

type StageRankVisualProfile = Readonly<{
  /** Horizontal distance between authored slots in this rank. */
  spread?: number;
  /** Positive values move the rank toward the engagement line; negative values reserve it. */
  engagement?: number;
  /** Relative figure size for silhouette hierarchy. */
  scale?: number;
}>;

type StageFormationVisualProfile = Readonly<Partial<Record<Rank, StageRankVisualProfile>>>;

/**
 * Battlefield silhouettes for the compact six-squad formations.
 *
 * Slot ownership remains authoritative; these values only strengthen the authored
 * visual read. The same profile is mirrored for both armies so enemy tactics and
 * player formations communicate the same geometry at a glance.
 */
const stageFormationProfiles: Readonly<Record<string, StageFormationVisualProfile>> = {
  forward_line_411: {
    front: { spread: .94, engagement: .012, scale: 1.03 },
    middle: { spread: .5, engagement: -.006, scale: .88 },
    rear: { spread: .5, engagement: -.004, scale: .82 }
  },
  layered_core_231: {
    front: { spread: .62, engagement: -.01, scale: .92 },
    middle: { spread: .86, engagement: -.03, scale: .94 },
    rear: { spread: .5, engagement: -.02, scale: .78 }
  },
  iron_wall_501: {
    front: { spread: 1.1, engagement: .018, scale: 1.08 },
    rear: { spread: .5, engagement: -.004, scale: .8 }
  }
};

function stageRankVisual(shape: FormationShapeDefinition, row: Rank): StageRankVisualProfile {
  return stageFormationProfiles[shape.id]?.[row] ?? {};
}

export type StageDepthVisual = Readonly<{
  /** Perspective scale applied after the formation-specific silhouette scale. */
  scale: number;
  /** Ground-shadow width as a fraction of the final actor size. */
  shadowScale: number;
  /** Ground-shadow height in display points. */
  shadowHeight: number;
  /** Ground-shadow opacity; reserves recede into the field. */
  shadowOpacity: number;
  /** Draw order: contact ranks sit above their supporting ranks. */
  zIndex: number;
}>;

const stageRankDepth: Readonly<Record<Rank, StageDepthVisual>> = {
  front: { scale: 1.06, shadowScale: .82, shadowHeight: 7, shadowOpacity: .72, zIndex: 30 },
  middle: { scale: .94, shadowScale: .68, shadowHeight: 5, shadowOpacity: .5, zIndex: 20 },
  rear: { scale: .84, shadowScale: .56, shadowHeight: 4, shadowOpacity: .32, zIndex: 10 }
};

export function stageDepthVisual(row: Rank): StageDepthVisual {
  return stageRankDepth[row];
}

export type StageExchangeMotion = Readonly<{
  /** Whole-rank push toward first contact during the strike pulse. */
  advance: number;
  /** Supporting rank response toward first contact during the impact pulse. */
  reinforce: number;
  /** Defensive give away from first contact during the impact pulse. */
  brace: number;
  /** Vertical compression at peak impact; 1 keeps the authored silhouette. */
  impactScaleY: number;
}>;

const neutralStageExchangeMotion: StageExchangeMotion = {
  advance: 0,
  reinforce: 0,
  brace: 0,
  impactScaleY: 1
};

/**
 * Formation personality during one existing exchange pulse.
 *
 * These values never affect targeting, timing or combat math. They only reuse the
 * already-running attack/impact animation so formation identity survives contact:
 * Forward Line surges, Layered Core feeds its middle rank forward, and Iron Wall
 * visibly absorbs the hit as one braced line.
 */
type StageFormationExchangeProfile = Readonly<Partial<Record<Rank, Readonly<Partial<StageExchangeMotion>>>>>;

const stageFormationExchangeProfiles: Readonly<Record<string, StageFormationExchangeProfile>> = {
  forward_line_411: {
    front: { advance: 1.8 }
  },
  layered_core_231: {
    middle: { reinforce: 1.8 }
  },
  iron_wall_501: {
    front: { brace: .8, impactScaleY: .96 }
  }
};

export function stageExchangeMotion(shape: FormationShapeDefinition, row: Rank): StageExchangeMotion {
  const profile = stageFormationExchangeProfiles[shape.id]?.[row];
  return {
    advance: profile?.advance ?? neutralStageExchangeMotion.advance,
    reinforce: profile?.reinforce ?? neutralStageExchangeMotion.reinforce,
    brace: profile?.brace ?? neutralStageExchangeMotion.brace,
    impactScaleY: profile?.impactScaleY ?? neutralStageExchangeMotion.impactScaleY
  };
}

/** True formation geometry. Coordinates and size depend on SHAPE, not survivors.
 * Slots retain their row index even when a neighbour is empty/routed. Both fronts
 * face the centre; enemy left/right is mirrored into the player's perspective.
 * Formation-specific staging strengthens silhouette identity without changing slots:
 * Iron Wall sits broad and close to contact, while Layered Core stays compact/deep.
 */
export function stageTokens(shape: FormationShapeDefinition, occupied: readonly number[], side: ArmySide, width: number, height: number): StageToken[] {
  const wanted = new Set(occupied);
  const safeW = Math.max(120, finite(width, 336));
  const safeH = Math.max(160, finite(height, 320));
  const pitch = (safeW - 32) / 5;
  const fractions = side === 'enemy'
    ? { rear: .095, middle: .245, front: .397 }
    : { front: .603, middle: .755, rear: .905 };
  // Use more of each slot while preserving movement clearance and the optional
  // 1.12x small-mount fallback. The budget depends on the full shape, not losses.
  const available = Math.min(72, pitch * .94, safeH * .16 - 8);
  const baseSize = Math.max(8, Math.floor(available <= 32 ? available / 1.12 : available));
  const towardCentre = side === 'enemy' ? 1 : -1;

  return ranks.flatMap(row => shape.rows[row].flatMap((slot, index, all) => {
    if (!wanted.has(slot)) return [];

    const visual = stageRankVisual(shape, row);
    const rowPitch = pitch * (visual.spread ?? 1);
    const offset = (index - (all.length - 1) / 2) * rowPitch;
    const depth = stageDepthVisual(row);
    const rawSize = baseSize * (visual.scale ?? 1) * depth.scale;
    const spacingLimit = all.length > 1 ? rowPitch * .9 : available * 1.04;
    let size = Math.max(8, Math.floor(Math.min(rawSize, spacingLimit)));
    // Small mounted fallbacks can render at 1.12×. If compression pushes a
    // row below that threshold, re-budget the authored slot gap for the
    // rendered footprint so compact ranks still never overlap.
    if (all.length > 1 && size <= 32 && size * 1.12 > rowPitch * .9) {
      size = Math.max(8, Math.floor((rowPitch * .9) / 1.12));
    }
    const y = (fractions[row] + (visual.engagement ?? 0) * towardCentre) * safeH;

    return [{
      slot,
      row,
      x: safeW / 2 + (side === 'enemy' ? -offset : offset),
      y,
      size
    }];
  }));
}

export function appendExchange(history: readonly ExchangeRecord[], record: ExchangeRecord): ExchangeRecord[] {
  if (record.exchange <= 0 || history.some(item => item.exchange === record.exchange)) return [...history];
  return [...history, record].slice(-5);
}

export function rosterForFormation(formation: readonly (string | null)[], units: readonly UnitDefinition[]) {
  return formation.flatMap((id, slot) => {
    const unit = id ? units.find(candidate => candidate.id === id) : null;
    return unit ? [{ slot, unit }] : [];
  });
}

// Keep the reference artwork confined to its actual region.
export function usesGreenkeepArtwork(sceneId: string, faction: FactionId): boolean {
  return sceneId === 'greenkeep_road' && faction === 'human';
}

export type EnemyToken = EnemyRoleAssignment & { down: boolean; boss: boolean };
