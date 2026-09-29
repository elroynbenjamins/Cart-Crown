import { getBuildingLevelDefinition } from '../game/kingdom';
import type { BuildingDefinition, ResourceWallet } from '../game/types';
import { researchCostRows } from './researchPresentation';

export type KingdomBuildingState = 'locked' | 'blueprint' | 'upgrade' | 'maximum' | 'campaign';

/** Presentation only. A full wallet is not proof that the provider's progression checks pass. */
export function kingdomBuildingPresentation(
  building: BuildingDefinition,
  level: number,
  unlocked: boolean,
  wallet: ResourceWallet
) {
  const current = level > 0 ? getBuildingLevelDefinition(building.id, level) : null;
  const next = unlocked && level > 0 && level < building.maxLevel
    ? getBuildingLevelDefinition(building.id, level + 1)
    : null;
  const state: KingdomBuildingState = !unlocked ? 'locked'
    : level <= 0 ? 'blueprint'
      : level >= building.maxLevel ? 'maximum'
        : next ? 'upgrade' : 'campaign';
  const cost = state === 'blueprint' ? building.constructionCost : next?.cost ?? {};
  const rows = researchCostRows(cost, wallet);
  const materialsSufficient = rows.every(row => row.missing === 0);
  const status = state === 'locked' ? 'Blueprint locked'
    : state === 'blueprint' ? 'Not built'
      : state === 'maximum' ? 'Maximum level'
        : state === 'campaign' ? 'No direct upgrade'
          : materialsSufficient ? 'Materials sufficient' : 'Missing materials';
  return { state, current, next, cost, rows, materialsSufficient, status };
}

/** Existing Human unlock clues; other factions retain a broad, non-invented campaign hint. */
export function kingdomBuildingUnlockHint(building: BuildingDefinition): string {
  if (building.faction !== 'human') return 'Continue this faction’s campaign to unlock the blueprint.';
  const hints: Record<string, string> = {
    forge: 'Investigate Marked Raiders.',
    war_room: 'Win Mercenary Patrol.',
    quartermaster: 'Secure Refugee Camp.',
    stable: 'Raise Greenkeep Fort.',
    signal_tower: 'Restore the Broken Signal Tower.',
    officer_academy: 'Raise Greenkeep Stronghold.'
  };
  return hints[building.id] ?? 'Story milestone required.';
}
