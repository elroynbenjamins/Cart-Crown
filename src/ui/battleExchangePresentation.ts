import type { UnitRole } from '../game/types';

/** Healing supplements, never replaces, an army's attack animation. */
export function getExchangeVisuals(role: UnitRole | null, healed: number) {
  return {
    attack: role === 'ranged' ? 'arrow' : role === 'cavalry' ? 'charge'
      : role === 'skirmish' ? 'skirmish' : role === 'support' ? 'ward'
      : role === 'frontline' || role === 'melee' ? 'slash' : null,
    heal: Number.isFinite(healed) && healed > 0
  } as const;
}
