import type { NavId } from './types';

export type HardwareBackAction =
  | 'block_battle'
  | 'continue_results'
  | 'prepare_rematch'
  | 'go_history'
  | 'close_flow'
  | 'go_kingdom'
  | 'exit_app';

export type NavigationRoute = {
  active: NavId;
  flow: string | null;
};

export function sameNavigationRoute(
  left: NavigationRoute,
  right: NavigationRoute
) {
  return (
    left.active === right.active &&
    left.flow === right.flow
  );
}

export function pushNavigationHistory(
  history: NavigationRoute[],
  route: NavigationRoute,
  maxEntries = 32
) {
  const last = history[history.length - 1];

  if (last && sameNavigationRoute(last, route)) {
    return history;
  }

  return [...history, route].slice(-maxEntries);
}

export function popNavigationHistory(
  history: NavigationRoute[]
) {
  if (history.length === 0) {
    return {
      history,
      route: null as NavigationRoute | null
    };
  }

  return {
    history: history.slice(0, -1),
    route: history[history.length - 1]
  };
}

export function resolveHardwareBackAction({
  flow,
  canGoBack,
  active,
  hasHistory = false
}: {
  flow: string | null;
  canGoBack: boolean;
  active: NavId;
  hasHistory?: boolean;
}): HardwareBackAction {
  if (flow === 'battle') return 'block_battle';
  if (flow === 'results') return 'continue_results';
  if (flow === 'defeatResults') return 'prepare_rematch';
  if (hasHistory) return 'go_history';
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


export function createKeyedInFlightGuard<Key>() {
  const active = new Set<Key>();

  return {
    tryStart(key: Key) {
      if (active.has(key)) return false;
      active.add(key);
      return true;
    },
    finish(key: Key) {
      active.delete(key);
    },
    has(key: Key) {
      return active.has(key);
    }
  };
}
