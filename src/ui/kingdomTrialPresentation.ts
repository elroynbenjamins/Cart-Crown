import type { useGame } from '../game/GameProvider';
import {
  evaluateKingdomTrial,
  getKingdomTrialRequiredChapter,
  isKingdomTrialUnlocked,
  kingdomTrialOrder
} from '../game/kingdomTrials';
import type { KingdomTrialId } from '../game/kingdomTrials';
import type { SemanticTone } from './semanticColors';

export type TrialScreenState = Pick<ReturnType<typeof useGame>,
  'activeFaction' | 'chapterNumber' | 'formation' | 'formationShapeId' |
  'formationDoctrineId' | 'kingdomTrialCompletions' | 'isSideModeUnlocked'>;

export const trialMedalNames: Record<KingdomTrialId, string> = {
  bronze: 'Bronze', silver: 'Silver', gold: 'Gold'
};

/** Only state that can change trial eligibility; unrelated currency or display updates are not a new claim. */
export function trialScreenKey(state: TrialScreenState): string {
  return JSON.stringify([
    state.activeFaction, state.chapterNumber, state.formation, state.formationShapeId,
    state.formationDoctrineId, state.kingdomTrialCompletions,
    state.isSideModeUnlocked('formation_trials')
  ]);
}

/** Display only. Completion, rewards and save migration remain owned by the existing game model. */
export function getKingdomTrialView(state: TrialScreenState) {
  const completed = kingdomTrialOrder.filter(id => state.kingdomTrialCompletions.includes(id));
  const consistent = completed.every((id, index) => kingdomTrialOrder[index] === id) &&
    state.kingdomTrialCompletions.every(id => kingdomTrialOrder.includes(id));
  const modeUnlocked = state.isSideModeUnlocked('formation_trials');
  const nextId = kingdomTrialOrder.find(id => !completed.includes(id)) ?? null;
  const currentId = consistent && modeUnlocked && nextId &&
    isKingdomTrialUnlocked(nextId, completed, state.chapterNumber) ? nextId : null;
  const context = {
    faction: state.activeFaction, formation: state.formation,
    formationShapeId: state.formationShapeId, formationDoctrineId: state.formationDoctrineId
  };
  const current = currentId ? evaluateKingdomTrial(currentId, context) : null;
  const track = kingdomTrialOrder.map(id => {
    const claimed = completed.includes(id);
    const isCurrent = id === currentId;
    const tone: SemanticTone = claimed ? 'positive' : isCurrent ? 'blue' : 'neutral';
    return {
      id, name: trialMedalNames[id], claimed, current: isCurrent, tone,
      chapter: getKingdomTrialRequiredChapter(id),
      status: claimed ? 'Claimed' : isCurrent ? 'Current' : 'Locked',
      // Never evaluate or expose a future trial's title, lesson, checks or rewards here.
      record: consistent && claimed ? evaluateKingdomTrial(id, context) : null
    };
  });
  return {
    completed, consistent, currentId, current, track, nextId,
    nextChapter: nextId ? getKingdomTrialRequiredChapter(nextId) : null,
    allComplete: consistent && completed.length === kingdomTrialOrder.length,
    passedCount: current?.checks.filter(check => check.passed).length ?? 0
  };
}
