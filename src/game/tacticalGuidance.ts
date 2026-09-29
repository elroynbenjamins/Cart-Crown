export type TacticalGuidanceLevel =
  | 'full'
  | 'standard'
  | 'off';

export type TacticalGuidanceFeatures = {
  showFitScores: boolean;
  sortLoadoutsByFit: boolean;
  showRecommendedLoadout: boolean;
  showAdjustmentChecklist: boolean;
  allowGuidedActions: boolean;
  showCounterHints: boolean;
};

export const tacticalGuidanceOptions: Array<{
  id: TacticalGuidanceLevel;
  name: string;
  summary: string;
  detail: string;
}> = [
  {
    id: 'standard',
    name: 'Standard',
    summary: 'Mechanics visible, decisions stay yours.',
    detail:
      'Shows Scout Report fit scores, formation edges and normal readiness warnings, but does not tell you which loadout to pick or walk you through changes.'
  },
  {
    id: 'full',
    name: 'Full guidance',
    summary: 'Adds recommendations and step-by-step tactical help.',
    detail:
      'Highlights the best saved loadout, explains weaknesses and lets you open guided formation fixes. Every actual change still requires your confirmation.'
  },
  {
    id: 'off',
    name: 'Off',
    summary: 'Facts only.',
    detail:
      'Scout Reports reveal enemy composition and exact combat modifiers, but optional fit scores, counter hints and tactical recommendations are hidden.'
  }
];

export function getTacticalGuidanceFeatures(
  level: TacticalGuidanceLevel
): TacticalGuidanceFeatures {
  if (level === 'full') {
    return {
      showFitScores: true,
      sortLoadoutsByFit: true,
      showRecommendedLoadout: true,
      showAdjustmentChecklist: true,
      allowGuidedActions: true,
      showCounterHints: true
    };
  }

  if (level === 'off') {
    return {
      showFitScores: false,
      sortLoadoutsByFit: false,
      showRecommendedLoadout: false,
      showAdjustmentChecklist: false,
      allowGuidedActions: false,
      showCounterHints: false
    };
  }

  return {
    showFitScores: true,
    sortLoadoutsByFit: false,
    showRecommendedLoadout: false,
    showAdjustmentChecklist: false,
    allowGuidedActions: false,
    showCounterHints: true
  };
}

export function isTacticalGuidanceLevel(
  value: string | null
): value is TacticalGuidanceLevel {
  return (
    value === 'full' ||
    value === 'standard' ||
    value === 'off'
  );
}
