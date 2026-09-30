import type { useGame } from '../game/GameProvider';
import type { ResearchDefinition } from '../game/progression';
import { canStartResearch, getResearchGemFinishCost, getResearchRemainingHours } from '../game/progression';
import type { ResearchVisualState } from './researchPresentation';
import { researchCostRows } from './researchPresentation';
import type { SemanticTone } from './semanticColors';

export type MasteryFamily = 'large' | 'hybrid';
export type MasteryResearchState = Pick<ReturnType<typeof useGame>,
  'activeFaction' | 'fantasyProgressionChapter' | 'completedStoryGates' | 'researchProgress' |
  'unlockedFantasyClasses' | 'largeFamilyUnlock' | 'hybridFamilyUnlock' | 'hybridPrerequisitesMet' |
  'magicResearchDefinitions' | 'flyingResearchDefinitions' | 'largeResearchDefinitions' | 'hybridResearchDefinitions' |
  'largeRecruitOptions' | 'hybridRecruitOptions' | 'units' | 'formation' | 'resources' | 'gems'>;

export const masteryFamilyPresentation: Record<MasteryFamily, { title: string; label: string; tone: SemanticTone; body: string }> = {
  large: {
    title: 'Large Unit Mastery', label: 'Monsters & constructs', tone: 'orange',
    body: 'Research repeatable Large-unit training. Compare each class and its deployment cost before adding it to your roster.'
  },
  hybrid: {
    title: 'Legendary Orders', label: 'Legendary warfare', tone: 'violet',
    body: 'Research hybrid training after Three Seals. These specialists combine battle traits; they do not replace an entire army.'
  }
};

/** A clock tick must not clear transaction guards. Only real game-state changes do. */
export function masterySnapshotKey(family: MasteryFamily, state: MasteryResearchState): string {
  return JSON.stringify([
    family, state.activeFaction, state.fantasyProgressionChapter, state.completedStoryGates,
    state.researchProgress, state.unlockedFantasyClasses, state.hybridPrerequisitesMet,
    state.resources, state.gems, state.units.map(unit => unit.id)
  ]);
}

/** Presentation only: all progression, timer, currency and recruitment actions stay in GameProvider. */
export function getMasteryResearchView(family: MasteryFamily, state: MasteryResearchState, now: number) {
  const definitions = family === 'large' ? state.largeResearchDefinitions : state.hybridResearchDefinitions;
  const research = definitions.find(item => item.family === family && item.faction === state.activeFaction) ?? null;
  const familyUnlock = family === 'large' ? state.largeFamilyUnlock : state.hybridFamilyUnlock;
  const unlock = familyUnlock?.family === family && familyUnlock.faction === state.activeFaction ? familyUnlock : null;
  const progress = research ? state.researchProgress[research.id] : undefined;
  const hasStarted = typeof progress?.startedAt === 'number' && Number.isFinite(progress.startedAt);
  const remaining = (item: ResearchDefinition) => {
    const entry = state.researchProgress[item.id];
    if (!entry || typeof entry.startedAt !== 'number' || !Number.isFinite(entry.startedAt)) return item.durationHours;
    return getResearchRemainingHours(item, Math.max(0, (now - entry.startedAt) / 3_600_000), entry.rewardedAdsWatched);
  };
  const remainingHours = research ? remaining(research) : 0;
  const storyUnlocked = Boolean(unlock && state.completedStoryGates.includes(unlock.storyGateId));
  const prerequisitesMet = family !== 'hybrid' || state.hybridPrerequisitesMet;
  const allResearch = [
    ...state.magicResearchDefinitions, ...state.flyingResearchDefinitions,
    ...state.largeResearchDefinitions, ...state.hybridResearchDefinitions
  ].filter(item => item.faction === state.activeFaction);
  const otherActive = allResearch.find(item => {
    const entry = state.researchProgress[item.id];
    return item.id !== research?.id && entry && !entry.completed && entry.startedAt !== null && remaining(item) > 0;
  }) ?? null;
  const canStart = Boolean(research && !hasStarted && !progress?.completed && prerequisitesMet && !otherActive &&
    canStartResearch(research, state.fantasyProgressionChapter, state.completedStoryGates));
  const visualState: ResearchVisualState = progress?.completed ? 'complete'
    : hasStarted ? remainingHours <= 0 ? 'claimable' : 'active'
      : canStart ? 'available' : 'locked';
  const requirement = !research ? 'No mastery definition is available for this faction.'
    : !canStartResearch(research, state.fantasyProgressionChapter, state.completedStoryGates)
      ? family === 'large' ? 'Complete this faction’s Chapter 6 campaign and its Large-unit discovery.' : 'Complete Three Seals and this faction’s legendary discovery.'
      : !prerequisitesMet ? 'Complete this faction’s Magic and Flying research first.'
        : otherActive ? 'Finish active research: ' + otherActive.name + '.' : null;
  const gemCost = research ? getResearchGemFinishCost(research, remainingHours) : 0;
  const templates = (family === 'large' ? state.largeRecruitOptions : state.hybridRecruitOptions)
    .filter(item => item.faction === state.activeFaction && item.family === family)
    .map(template => {
      const unlocked = state.unlockedFantasyClasses.includes(template.className);
      const costs = researchCostRows(template.cost, state.resources);
      const affordable = costs.every(row => row.missing === 0);
      return { template, unlocked, affordable, costs, capacity: template.deploymentCapacity ?? 1 };
    });
  const firstUnit = unlock ? state.units.find(unit => unit.id === unlock.firstStoryRewardUnitId && unit.faction === state.activeFaction) ?? null : null;
  return {
    research, unlock, progress, visualState, storyUnlocked, prerequisitesMet, otherActive, canStart,
    remainingHours, gemCost, requirement, templates, firstUnit,
    firstUnitFielded: Boolean(firstUnit && state.formation.includes(firstUnit.id)),
    canPayGems: visualState === 'active' && Number.isFinite(state.gems) && state.gems >= gemCost,
    canWatchAd: visualState === 'active' && Boolean(research && progress && progress.rewardedAdsWatched < research.rewardedAdsToComplete)
  };
}
