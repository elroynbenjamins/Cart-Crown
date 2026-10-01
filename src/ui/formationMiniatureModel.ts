import type { FormationShapeDefinition } from '../game/types';

export function getFormationMiniatureRows(
  shape: FormationShapeDefinition,
  side: 'ally' | 'enemy'
) {
  return side === 'enemy'
    ? [
        { key: 'rear' as const, slots: shape.rows.rear },
        { key: 'middle' as const, slots: shape.rows.middle },
        { key: 'front' as const, slots: shape.rows.front }
      ]
    : [
        { key: 'front' as const, slots: shape.rows.front },
        { key: 'middle' as const, slots: shape.rows.middle },
        { key: 'rear' as const, slots: shape.rows.rear }
      ];
}
