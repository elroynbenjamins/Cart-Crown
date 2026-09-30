import type { useGame } from '../game/GameProvider';
import type { ResearchDefinition } from '../game/progression';
import { canStartResearch, getResearchGemFinishCost, getResearchRemainingHours } from '../game/progression';
import type { ResearchVisualState } from './researchPresentation';
import { researchCostRows } from './researchPresentation';
import type { SemanticTone } from './semanticColors';

export type MasteryFamily = 'magic' | 'flying' | 'large' | 'hybrid';
export type MasteryResearchState = Pick<ReturnType<typeof useGame>,
  'activeFaction' | 'fantasyProgressionChapter' | 'completedStoryGates' | 'researchProgress' |
  'unlockedFantasyClasses' | 'magicFamilyUnlock' | 'flyingFamilyUnlock' | 'largeFamilyUnlock' | 'hybridFamilyUnlock' | 'hybridPrerequisitesMet' |
  'magicResearchDefinitions' | 'flyingResearchDefinitions' | 'largeResearchDefinitions' | 'hybridResearchDefinitions' |
  'fantasyRecruitOptions' | 'flyingRecruitOptions' | 'largeRecruitOptions' | 'hybridRecruitOptions' |
  'units' | 'formation' | 'resources' | 'gems'>;

export const masteryFamilyPresentation: Record<MasteryFamily, { title: string; label: string; eyebrow: string; tone: SemanticTone; body: string }> = {
  magic: {
    title: 'Arcane Research', label: 'Magic', eyebrow: 'CHAPTER 4 · AGE OF MAGIC', tone: 'violet',
    body: 'Research spellcasting branches, then train squads separately. Casters still need protection and have real counters.'
  },
  flying: {
    title: 'Aerial Training', label: 'Flying', eyebrow: 'CHAPTER 5 · THE SKY OPENS', tone: 'cyan',
    body: 'Research aerial handling, then choose a squad to train. Flight opens new tactics without removing anti-air threats.'
  },
  large: {
    title: 'Large Unit Mastery', label: 'Monsters & constructs', eyebrow: 'LATE CAMPAIGN MASTERY', tone: 'orange',
    body: 'Research repeatable Large-unit training. Compare each class and its deployment cost before adding it to your roster.'
  },
  hybrid: {
    title: 'Legendary Orders', label: 'Legendary warfare', eyebrow: 'LATE CAMPAIGN MASTERY', tone: 'violet',
    body: 'Research hybrid training after Three Seals. These specialists combine battle traits; they do not replace an entire army.'
  }
};

/** Clock ticks do not reopen a transaction that is waiting for its provider state update. */
export function masterySnapshotKey(family: MasteryFamily, state: MasteryResearchState): string {
  return JSON.stringify([
    family, state.activeFaction, state.fantasyProgressionChapter, state.completedStoryGates,
    state.researchProgress, state.unlockedFantasyClasses, state.hybridPrerequisitesMet,
    state.resources, state.gems, state.units.map(unit => unit.id)
  ]);
}

/** Read-only presentation. An explicitly invalid selection never resolves to a different purchase. */
export function getMasteryResearchView(family: MasteryFamily, state: MasteryResearchState, now: number, researchId?: string) {
  const definitions = {
    magic: state.magicResearchDefinitions, flying: state.flyingResearchDefinitions,
    large: state.largeResearchDefinitions, hybrid: state.hybridResearchDefinitions
  }[family].filter(item => item.family === family && item.faction === state.activeFaction);
  const familyUnlock = {
    magic: state.magicFamilyUnlock, flying: state.flyingFamilyUnlock,
    large: state.largeFamilyUnlock, hybrid: state.hybridFamilyUnlock
  }[family];
  const unlock = familyUnlock?.family === family && familyUnlock.faction === state.activeFaction ? familyUnlock : null;
  const storyUnlocked = Boolean(unlock && state.completedStoryGates.includes(unlock.storyGateId));
  const prerequisitesMet = family !== 'hybrid' || state.hybridPrerequisitesMet;
  const allResearch = [
    ...state.magicResearchDefinitions, ...state.flyingResearchDefinitions,
    ...state.largeResearchDefinitions, ...state.hybridResearchDefinitions
  ].filter(item => item.faction === state.activeFaction);
  const remaining = (item: ResearchDefinition) => {
    const entry = state.researchProgress[item.id];
    if (!entry || typeof entry.startedAt !== 'number' || !Number.isFinite(entry.startedAt)) return item.durationHours;
    return getResearchRemainingHours(item, Math.max(0, (now - entry.startedAt) / 3_600_000), entry.rewardedAdsWatched);
  };
  const inspect = (research: ResearchDefinition | null) => {
    const progress = research ? state.researchProgress[research.id] : undefined;
    const hasStarted = typeof progress?.startedAt === 'number' && Number.isFinite(progress.startedAt);
    const remainingHours = research ? remaining(research) : 0;
    const otherActive = allResearch.find(item => {
      const entry = state.researchProgress[item.id];
      return item.id !== research?.id && entry && !entry.completed && entry.startedAt !== null && remaining(item) > 0;
    }) ?? null;
    const canStart = Boolean(research && !hasStarted && !progress?.completed && prerequisitesMet && !otherActive &&
      canStartResearch(research, state.fantasyProgressionChapter, state.completedStoryGates));
    const visualState: ResearchVisualState = progress?.completed ? 'complete'
      : hasStarted ? remainingHours <= 0 ? 'claimable' : 'active'
        : canStart ? 'available' : 'locked';
    const requirement = !research ? 'No matching research is available for this selection.'
      : !canStartResearch(research, state.fantasyProgressionChapter, state.completedStoryGates)
        ? family === 'large' ? 'Complete this faction’s Chapter 6 campaign and its Large-unit discovery.'
          : family === 'hybrid' ? 'Complete Three Seals and this faction’s legendary discovery.'
            : 'Reach Chapter ' + research.chapterRequired + ' and complete this faction’s ' + (family === 'magic' ? 'Magic' : 'Flying') + ' discovery.'
        : !prerequisitesMet ? 'Complete this faction’s Magic and Flying research first.'
          : otherActive ? 'Finish active research: ' + otherActive.name + '.' : null;
    const gemCost = research ? getResearchGemFinishCost(research, remainingHours) : 0;
    return {
      research, progress, remainingHours, otherActive, canStart, visualState, requirement, gemCost,
      canPayGems: visualState === 'active' && Number.isFinite(state.gems) && state.gems >= gemCost,
      canWatchAd: visualState === 'active' && Boolean(research && progress && progress.rewardedAdsWatched < research.rewardedAdsToComplete)
    };
  };
  const researchOptions = definitions.map(item => ({ ...inspect(item), research: item }));
  // Initial focus only; explicit player selection is retained by the screen after each action.
  const initial = researchOptions.find(item => item.visualState === 'claimable') ??
    researchOptions.find(item => item.visualState === 'active') ??
    researchOptions.find(item => item.visualState === 'available') ??
    researchOptions.find(item => item.visualState !== 'complete') ?? researchOptions[0];
  const selectedResearch = researchId === undefined ? initial?.research ?? null
    : definitions.find(item => item.id === researchId) ?? null;
  const selected = inspect(selectedResearch);
  const templates = {
    magic: state.fantasyRecruitOptions, flying: state.flyingRecruitOptions,
    large: state.largeRecruitOptions, hybrid: state.hybridRecruitOptions
  }[family].filter(item => item.faction === state.activeFaction && item.family === family).map(template => {
    const unlocked = state.unlockedFantasyClasses.includes(template.className);
    const costs = researchCostRows(template.cost, state.resources);
    return { template, unlocked, affordable: costs.every(row => row.missing === 0), costs, capacity: template.deploymentCapacity ?? 1 };
  });
  const firstUnit = unlock ? state.units.find(unit => unit.id === unlock.firstStoryRewardUnitId && unit.faction === state.activeFaction) ?? null : null;
  return {
    ...selected, researchOptions, unlock, storyUnlocked, prerequisitesMet, templates, firstUnit,
    completedCount: researchOptions.filter(item => item.visualState === 'complete').length,
    firstUnitFielded: Boolean(firstUnit && state.formation.includes(firstUnit.id))
  };
}
