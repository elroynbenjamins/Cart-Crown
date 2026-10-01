import type { EnemyFantasyThreatFamily, FactionId } from '../../game/types';
import type { EncounterId } from '../../game/encounters';

// Scope to the authored Human road. Bosses, fantasy encounters and other regions
// keep the established backdrop until they have matching illustration assets.
const greenkeepEncounters: readonly EncounterId[] = [
  'hold_the_road', 'mercenary_patrol', 'ch2_defend_camp',
  'ch2_beyond_fires', 'ch2_brace', 'ch2_take_watch'
];
export function hasGreenkeepScenery(
  encounterId: EncounterId, faction: FactionId,
  difficulty: 'Normal' | 'Elite' | 'Boss', fantasyThreat?: EnemyFantasyThreatFamily
) {
  return faction === 'human' && difficulty !== 'Boss' && !fantasyThreat
    && greenkeepEncounters.includes(encounterId);
}

/** Cover the floor without stretching a shallow source strip into a tall image.
 * One small horizon image and at most eleven cached ground images; no particles,
 * random decoration, timers, additional bitmaps, or changes to formation slots.
 */
export function roadSceneryLayout(width: number, height: number) {
  const w = Number.isFinite(width) ? Math.max(220, Math.min(1200, width)) : 336;
  const h = Number.isFinite(height) ? Math.max(160, Math.min(580, height)) : 320;
  const horizonHeight = Math.round(Math.max(22, Math.min(48, h * .08)));
  const tileHeight = w * 57 / 240;
  const count = Math.ceil((h - horizonHeight) / tileHeight);
  return {
    width: w, height: h, horizonHeight, tileHeight,
    tiles: Array.from({ length: count }, (_, index) => ({
      index, y: horizonHeight + index * tileHeight,
      mirrored: index % 2 === 1
    }))
  };
}
