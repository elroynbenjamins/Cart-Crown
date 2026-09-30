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
    subtitle: 'Short tactical sessions'
  },
  {
    id: 'runs',
    title: 'Persistent Runs',
    subtitle: 'Multi-stage modes with saved progress'
  },
  {
    id: 'mastery',
    title: 'Mastery',
    subtitle: 'Puzzles, build checks and unique rewards'
  }
];

export const activityPresentation:
  Record<SideModeId, ActivityPresentation> = {
    war_table: {
      group: 'quick',
      badge: 'QUICK',
      purpose: 'Fast formation-counter contracts.'
    },
    formation_trials: {
      group: 'mastery',
      badge: 'PUZZLE',
      purpose: 'Formation challenges with authored constraints.'
    },
    kingdom_defense: {
      group: 'runs',
      badge: 'ENDURANCE',
      purpose: 'Hold one army through escalating waves.'
    },
    expeditions: {
      group: 'runs',
      badge: 'ROGUELITE',
      purpose: 'Branching route with persistent Readiness and loot.'
    },
    sieges: {
      group: 'runs',
      badge: 'ASSAULT',
      purpose: 'Staged fortress attack with preparation choices.'
    },
    relic_hunts: {
      group: 'mastery',
      badge: 'RELIC',
      purpose: 'Fantasy-counter boss chain with a unique first-clear reward.'
    }
  };
