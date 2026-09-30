import type { EnemyFantasyThreatFamily, FactionId, FormationShapeDefinition, UnitDefinition, UnitRole } from '../../game/types';
import type { EnemyArmyProfileId, EnemyRoleAssignment } from '../../game/encounters';
import { humanClassPortrait } from './humanBattleArt';
import type { HumanPortraitKey, HumanFigureKey } from './humanBattleArt';

export type PortraitKey = 'captain_portrait' | 'ranger_portrait' | 'priest_portrait'
  | 'raider_portrait' | 'missile_portrait' | 'warg_portrait' | HumanPortraitKey;
export type FigureKey = 'captain_unit' | 'ranger_unit' | 'priest_unit' | 'raider_unit' | 'missile_unit' | 'warg_unit' | HumanFigureKey;
export function figureForPortrait(portrait: PortraitKey): FigureKey {
  return portrait.replace('_portrait', '_unit') as FigureKey;
}
export type ArtKey = FigureKey | PortraitKey | 'greenkeep_sky' | 'greenkeep_ground' | 'greenkeep_location';
export type ArmySide = 'ally' | 'enemy';
export type ExchangeRecord = Readonly<{ exchange: number; dealt: number; taken: number; healed: number; skill: string | null }>;
export type StageToken = Readonly<{ slot: number; x: number; y: number; size: number; row: 'front' | 'middle' | 'rear' }>;

export const roleNames: Record<UnitRole, string> = {
  frontline: 'Frontline', melee: 'Melee', ranged: 'Ranged', support: 'Support', cavalry: 'Mounted', skirmish: 'Skirmish'
};

/** Exact generated Human classes first; preserve existing archetypes for uncovered classes. */
export function allyPortrait(unit: UnitDefinition): PortraitKey | null {
  if (unit.faction !== 'human' || unit.battleTags?.some(tag => ['flying', 'large', 'construct', 'beast'].includes(tag))) return null;
  const exactPortrait = humanClassPortrait(unit);
  if (exactPortrait) return exactPortrait;
  if (unit.role === 'cavalry') return null; // Never disguise a mounted class as foot infantry.
  if (unit.battleTags?.includes('magic')) return null;
  if (unit.role === 'support') return 'priest_portrait';
  if (unit.role === 'ranged' || unit.role === 'skirmish') return 'ranger_portrait';
  return 'captain_portrait';
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

/** True formation geometry. Coordinates and size depend on SHAPE, not survivors.
 * Slots retain their row index even when a neighbour is empty/routed. Both fronts
 * face the centre; enemy left/right is mirrored into the player's perspective.
 * The fixed five-slot pitch makes a 2-wide screen narrower than a 5-wide rank.
 */
export function stageTokens(shape: FormationShapeDefinition, occupied: readonly number[], side: ArmySide, width: number, height: number): StageToken[] {
  const wanted = new Set(occupied);
  const safeW = Math.max(120, finite(width, 336));
  const safeH = Math.max(160, finite(height, 320));
  const pitch = (safeW - 32) / 5;
  const fractions = side === 'enemy'
    ? { rear: .105, middle: .25, front: .395 }
    : { front: .605, middle: .75, rear: .895 };
  const size = Math.max(8, Math.floor(Math.min(64, pitch * .82, safeH * .145 - 10)));
  return ranks.flatMap(row => shape.rows[row].flatMap((slot, index, all) => {
    if (!wanted.has(slot)) return [];
    const offset = (index - (all.length - 1) / 2) * pitch;
    return [{ slot, row, x: safeW / 2 + (side === 'enemy' ? -offset : offset), y: fractions[row] * safeH, size }];
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
