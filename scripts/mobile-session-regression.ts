import {
  appStateAllowsBattleProgress,
  createKeyedInFlightGuard,
  createOneShotGate,
  createSerialTaskQueue,
  resolveHardwareBackAction,
  shouldAcceptActionPress
} from '../src/game/mobileSession';
import {
  getTacticalGuidanceFeatures,
  requiresSeverePreparationConfirmation
} from '../src/game/tacticalGuidance';

const failures: string[] = [];

function expect(condition: unknown, message: string) {
  if (!condition) failures.push(message);
}

async function runSerialQueueCoverage() {
  const queue = createSerialTaskQueue();
  const order: string[] = [];

  let releaseFirst!: () => void;
  const firstBlock = new Promise<void>(resolve => {
    releaseFirst = resolve;
  });

  const first = queue.enqueue(async () => {
    order.push('first:start');
    await firstBlock;
    order.push('first:end');
  });

  const second = queue.enqueue(async () => {
    order.push('second');
  });

  await Promise.resolve();

  expect(
    order.join('|') === 'first:start',
    'Second storage write started before the first write completed.'
  );

  releaseFirst();
  await Promise.all([first, second]);

  expect(
    order.join('|') === 'first:start|first:end|second',
    'Serialized storage writes completed out of invocation order.'
  );

  const recoveryQueue = createSerialTaskQueue();
  let recovered = false;

  await recoveryQueue
    .enqueue(async () => {
      throw new Error('expected write failure');
    })
    .catch(() => undefined);

  await recoveryQueue.enqueue(async () => {
    recovered = true;
  });

  expect(
    recovered,
    'Storage queue did not recover after a rejected write.'
  );
}

function runBackCoverage() {
  expect(
    resolveHardwareBackAction({
      flow: 'battle',
      canGoBack: false,
      active: 'campaign'
    }) === 'block_battle',
    'Hardware Back no longer blocks accidental battle exit.'
  );

  expect(
    resolveHardwareBackAction({
      flow: 'results',
      canGoBack: false,
      active: 'campaign'
    }) === 'continue_results',
    'Hardware Back no longer follows Results continuation.'
  );

  expect(
    resolveHardwareBackAction({
      flow: 'battlePrep',
      canGoBack: true,
      active: 'campaign'
    }) === 'close_flow',
    'Hardware Back no longer closes ordinary flow screens.'
  );

  expect(
    resolveHardwareBackAction({
      flow: null,
      canGoBack: false,
      active: 'formation'
    }) === 'go_kingdom',
    'Hardware Back no longer returns a secondary tab to the root Kingdom screen.'
  );

  expect(
    resolveHardwareBackAction({
      flow: null,
      canGoBack: false,
      active: 'kingdom'
    }) === 'exit_app',
    'Hardware Back no longer exits only from the root Kingdom screen.'
  );
}

function runPressCoverage() {
  expect(
    !shouldAcceptActionPress(1000, 1200),
    'Rapid duplicate action press was accepted inside the 450 ms guard.'
  );
  expect(
    shouldAcceptActionPress(1000, 1450),
    'Action press at the guard boundary was incorrectly rejected.'
  );
  expect(
    shouldAcceptActionPress(0, 1000),
    'First practical action press was rejected.'
  );
}

function runOneShotCoverage() {
  const gate = createOneShotGate();

  expect(
    gate(),
    'One-shot battle gate rejected the first outcome commit.'
  );
  expect(
    !gate(),
    'One-shot battle gate accepted a duplicate outcome commit.'
  );

  const remountedGate = createOneShotGate();
  expect(
    remountedGate(),
    'A fresh mounted battle did not receive a fresh outcome gate.'
  );
}

function runAppStateCoverage() {
  expect(
    appStateAllowsBattleProgress('active'),
    'Active app state no longer permits battle progress.'
  );
  expect(
    !appStateAllowsBattleProgress('background') &&
      !appStateAllowsBattleProgress('inactive') &&
      !appStateAllowsBattleProgress('unknown'),
    'Battle can progress while the app is not active.'
  );
}

function runInFlightCoverage() {
  const guard = createKeyedInFlightGuard<string>();

  expect(
    guard.tryStart('salvage'),
    'First rewarded-ad claim could not acquire its in-flight lock.'
  );
  expect(
    guard.has('salvage'),
    'Rewarded-ad claim lock was not recorded.'
  );
  expect(
    !guard.tryStart('salvage'),
    'Duplicate rewarded-ad claim acquired the same lock concurrently.'
  );
  expect(
    guard.tryStart('daily_supply'),
    'Different rewarded-ad placement was unnecessarily blocked.'
  );

  guard.finish('salvage');

  expect(
    !guard.has('salvage') &&
      guard.tryStart('salvage'),
    'Rewarded-ad claim could not be retried after its prior request finished.'
  );
}

function runSeverePreparationConfirmationCoverage() {
  expect(
    requiresSeverePreparationConfirmation(
      'full',
      'severely_underprepared'
    ),
    'Full Guidance no longer requires an explicit confirmation for Severely Underprepared battle starts.'
  );

  for (const level of [
    'standard',
    'off'
  ] as const) {
    expect(
      !requiresSeverePreparationConfirmation(
        level,
        'severely_underprepared'
      ),
      level +
        ' Guidance unexpectedly added an extra battle-start confirmation.'
    );
  }

  for (const status of [
    'ready',
    'risky'
  ] as const) {
    expect(
      !requiresSeverePreparationConfirmation(
        'full',
        status
      ),
      'Full Guidance is adding confirmation friction outside the Severe preparation state.'
    );
  }
}

function runTacticalGuidanceCoverage() {
  const full = getTacticalGuidanceFeatures('full');
  const standard = getTacticalGuidanceFeatures('standard');
  const off = getTacticalGuidanceFeatures('off');

  expect(
    full.showRecommendedLoadout &&
      full.showAdjustmentChecklist &&
      full.allowGuidedActions &&
      full.sortLoadoutsByFit,
    'Full Tactical Guidance no longer enables the recommendation and guided-action layer.'
  );

  expect(
    standard.showFitScores &&
      standard.showCounterHints &&
      !standard.showRecommendedLoadout &&
      !standard.showAdjustmentChecklist &&
      !standard.allowGuidedActions &&
      !standard.sortLoadoutsByFit,
    'Standard Tactical Guidance no longer shows mechanics without choosing for the player.'
  );

  expect(
    !off.showFitScores &&
      !off.showCounterHints &&
      !off.showRecommendedLoadout &&
      !off.showAdjustmentChecklist &&
      !off.allowGuidedActions &&
      !off.sortLoadoutsByFit,
    'Off Tactical Guidance no longer removes optional coaching while preserving core gameplay.'
  );
}

async function main() {
  runBackCoverage();
  runPressCoverage();
  runOneShotCoverage();
  runAppStateCoverage();
  runInFlightCoverage();
  runSeverePreparationConfirmationCoverage();
  runTacticalGuidanceCoverage();
  await runSerialQueueCoverage();

  if (failures.length > 0) {
    console.error(
      '\nMOBILE SESSION REGRESSION FAILURES (' +
        failures.length +
        '):'
    );
    failures.forEach((failure, index) => {
      console.error(
        String(index + 1) + '. ' + failure
      );
    });
    throw new Error(
      String(failures.length) +
        ' mobile-session guardrail(s) failed.'
    );
  }

  console.log(
    'PASS: Android Back routing, rapid-press throttling, one-shot battle completion, background battle pause, rewarded-ad in-flight locking, tactical-guidance separation, severe-prep confirmation boundaries and serialized save writes remain protected.'
  );
}

void main();
