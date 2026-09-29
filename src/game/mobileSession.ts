import type { NavId } from './types';

export type HardwareBackAction =
  | 'block_battle'
  | 'continue_results'
  | 'close_flow'
  | 'go_kingdom'
  | 'exit_app';

export function resolveHardwareBackAction({
  flow,
  canGoBack,
  active
}: {
  flow: string | null;
  canGoBack: boolean;
  active: NavId;
}): HardwareBackAction {
  if (flow === 'battle') return 'block_battle';
  if (flow === 'results') return 'continue_results';
  if (canGoBack) return 'close_flow';
  if (active !== 'kingdom') return 'go_kingdom';
  return 'exit_app';
}

export function shouldAcceptActionPress(
  lastPressAt: number,
  now: number,
  minimumGapMs = 450
) {
  return now - lastPressAt >= minimumGapMs;
}

export function createOneShotGate() {
  let committed = false;

  return () => {
    if (committed) return false;
    committed = true;
    return true;
  };
}

export function appStateAllowsBattleProgress(
  state: string
) {
  return state === 'active';
}


export function createSerialTaskQueue() {
  let chain = Promise.resolve();

  return {
    enqueue(task: () => Promise<void>) {
      chain = chain.then(task, task);
      return chain;
    },
    wait() {
      return chain;
    }
  };
}
