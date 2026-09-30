import type { EnemyFantasyThreatFamily, FactionId, FormationShapeDefinition, UnitDefinition, UnitRole } from '../../game/types';
import type { EnemyArmyProfileId, EnemyRoleAssignment } from '../../game/encounters';

export type PortraitKey = 'captain_portrait' | 'ranger_portrait' | 'priest_portrait'
  | 'raider_portrait' | 'missile_portrait' | 'warg_portrait';
export type FigureKey = 'captain_unit' | 'ranger_unit' | 'priest_unit' | 'raider_unit' | 'missile_unit' | 'warg_unit';
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

/** This is a small archetype portrait library, not art coverage for every promotion. */
export function allyPortrait(unit: UnitDefinition): PortraitKey | null {
  if (unit.faction !== 'human' || unit.battleTags?.some(tag => ['flying', 'large', 'construct', 'beast'].includes(tag))) return null;
  if (unit.role === 'cavalry') return null; // Never disguise a mounted class as foot infantry.
  if (unit.battleTags?.includes('magic')) return null;
  if (unit.role === 'support') return 'priest_portrait';
  if (unit.role === 'ranged' || unit.role === 'skirmish') return 'ranger_portrait';
  return 'captain_portrait';
}

export function enemyPortrait(role: UnitRole, profile: EnemyArmyProfileId, name: string, boss: boolean, fantasyThreat?: EnemyFantasyThreatFamily): PortraitKey | null {
  if (fantasyThreat) return null; // Preserve current magic/air/large/hybrid identity.
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

export function battleLayout(width: number, height: number, fontScale = 1) {
  const w = Number.isFinite(width) ? Math.max(280, width) : 360;
  const h = Number.isFinite(height) ? height : 640;
  const stacked = w < 350 || fontScale > 1.25;
  const railWidth = Math.floor(Math.min(112, Math.max(72, (w - 24) * .225)));
  return {
    stacked,
    railWidth,
    stageHeight: Math.round(Math.max(340, Math.min(470, h - 445))),
    // Stacked mode puts portraits in horizontal rails; the battlefield gains width.
    stageWidth: Math.max(132, stacked ? w - 24 : w - 24 - railWidth * 2 - 8),
    portraitSize: railWidth - 10,
  };
}

/** Cinematic line-up, not a replacement formation editor or a second combat grid.
 * Preserve real slot IDs/rank labels; arrange only occupied squads into readable
 * opposing columns. Exact saved formation/counters remain in the details panel.
 */
export function stageTokens(shape: FormationShapeDefinition, occupied: readonly number[], side: ArmySide, width: number, height: number): StageToken[] {
  const wanted = new Set(occupied);
  const entries = (['front', 'middle', 'rear'] as const).flatMap(row =>
    shape.rows[row].filter(slot => wanted.has(slot)).map(slot => ({ row, slot })));
  const safeW = Math.max(120, width), safeH = Math.max(160, height);
  const columns = entries.length > 5 ? 2 : 1;
  const lines = Math.max(3, Math.ceil(entries.length / columns));
  const size = Math.floor(Math.min(62, safeW * (columns === 1 ? .34 : .205), (safeH - 24) / lines * .82));
  return entries.map((entry, index) => {
    const lane = Math.floor(index / columns), column = index % columns;
    const fraction = columns === 1 ? .255 : column === 0 ? .15 : .365;
    const x = (side === 'ally' ? fraction : 1 - fraction) * safeW;
    return { ...entry, x, y: 12 + (lane + .5) * (safeH - 24) / lines, size };
  });
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
