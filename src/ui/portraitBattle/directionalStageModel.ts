import type { UnitDefinition, UnitRole, FactionId, EnemyFantasyThreatFamily } from '../../game/types';
import type { EnemyArmyProfileId } from '../../game/encounters';

/**
 * Battle-stage art only. These exact class/role pairs are the first approved
 * directional targets. Portrait cards and Army/Formation icons remain as-is.
 * Never substitute a generic role for the wrong weapon, mount or support class.
 */
export const directionalPilot = {
  'Shield Infantry': { role: 'frontline', asset: 'shield_infantry' },
  'Ranger': { role: 'ranged', asset: 'ranger' },
  'Heavy Cavalry': { role: 'cavalry', asset: 'heavy_cavalry' },
  'Field Medic': { role: 'support', asset: 'field_medic' }
} as const;

export type DirectionalPilotAsset = typeof directionalPilot[keyof typeof directionalPilot]['asset'];
export type DirectionalView = 'ally_back' | 'enemy_front';

function stageKey(asset: DirectionalPilotAsset, view: DirectionalView) {
  return `battle_directional.human.${asset}_${view}` as const;
}

export function directionalAllyArtId(unit: UnitDefinition): string | null {
  if (unit.faction !== 'human' || unit.battleTags?.some(tag =>
    ['magic', 'flying', 'large', 'construct', 'beast'].includes(tag))) return null;
  if (!Object.prototype.hasOwnProperty.call(directionalPilot, unit.className)) return null;
  const spec = directionalPilot[unit.className as keyof typeof directionalPilot];
  return spec.role === unit.role ? stageKey(spec.asset, 'ally_back') : null;
}

/**
 * Do not assign a medical staff to an enemy sergeant, or Ranger bow to a
 * crossbow unit. The opposing sprite is limited to matching plain Human
 * enemy labels; named bosses/fantasy foes never receive these generic poses.
 */
const enemyArt: Readonly<Partial<Record<string, Readonly<{ role: UnitRole; asset: DirectionalPilotAsset }>>>> = {
  Shield: { role: 'frontline', asset: 'shield_infantry' },
  Archer: { role: 'ranged', asset: 'ranger' },
  'Heavy Cavalry': { role: 'cavalry', asset: 'heavy_cavalry' },
  'Field Medic': { role: 'support', asset: 'field_medic' }
};

export function directionalEnemyArtId(
  faction: FactionId,
  role: UnitRole,
  label: string,
  profile: EnemyArmyProfileId,
  boss: boolean,
  fantasyThreat?: EnemyFantasyThreatFamily
): string | null {
  if (faction !== 'human' || boss || fantasyThreat) return null;
  // Human mercenary/shield/missile formations are visibly human; other
  // profiles can contain wargs, beasts, fantasy threats or irregular mounts.
  if (!['mercenary_line', 'shield_host', 'missile_company'].includes(profile)) return null;
  if (!Object.prototype.hasOwnProperty.call(enemyArt, label)) return null;
  const entry = enemyArt[label];
  return entry && entry.role === role ? stageKey(entry.asset, 'enemy_front') : null;
}
