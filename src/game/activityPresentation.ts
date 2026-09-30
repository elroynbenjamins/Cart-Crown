import type {
  SideModeId
} from './types';

export type ActivityGroupId =
  | 'quick'
  | 'runs'
  | 'mastery';

export type ActivityPresentation = {
  group: ActivityGroupId;
  badge: string;
  purpose: string;
};

export const activityGroups: Array<{
  id: ActivityGroupId;
  title: string;
  subtitle: string;
}> = [
  {
    id: 'quick',
    title: 'Quick Battles',
    subtitle: 'Short tactical fights'
  },
  {
    id: 'runs',
    title: 'Persistent Runs',
    subtitle: 'Saved multi-stage runs'
  },
  {
    id: 'mastery',
    title: 'Mastery',
    subtitle: 'Build tests & unique rewards'
  }
];

export const activityPresentation:
  Record<SideModeId, ActivityPresentation> = {
    war_table: {
      group: 'quick',
      badge: 'QUICK',
      purpose: 'Counter-focused contracts.'
    },
    formation_trials: {
      group: 'mastery',
      badge: 'PUZZLE',
      purpose: 'Formation puzzles with fixed constraints.'
    },
    kingdom_defense: {
      group: 'runs',
      badge: 'ENDURANCE',
      purpose: 'Escalating waves on one army.'
    },
    expeditions: {
      group: 'runs',
      badge: 'ROGUELITE',
      purpose: 'Branching run with saved Readiness and loot.'
    },
    sieges: {
      group: 'runs',
      badge: 'ASSAULT',
      purpose: 'Multi-stage fortress assault.'
    },
    relic_hunts: {
      group: 'mastery',
      badge: 'RELIC',
      purpose: 'Three guardians. One unique Relic.'
    }
  };
