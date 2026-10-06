import { chapterFourNodes } from '../src/game/chapter4';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function humanLoadoutsUnlocked(chapterNumber: number, nodes = chapterFourNodes) {
  return chapterNumber > 4 ||
    (
      chapterNumber === 4 &&
      Boolean(nodes.find(node => node.id === 'ch4_node_6')?.completed)
    );
}

assert(!humanLoadoutsUnlocked(1), 'Human loadouts must stay locked in Chapter 1');
assert(!humanLoadoutsUnlocked(2), 'Human loadouts must stay locked in Chapter 2');
assert(!humanLoadoutsUnlocked(3), 'Human loadouts must stay locked in Chapter 3');
assert(!humanLoadoutsUnlocked(4), 'Chapter 4 must open with manual formation management');

const beforePrepare = chapterFourNodes.map(node => ({
  ...node,
  completed: node.id === 'ch4_node_5'
}));
assert(
  !humanLoadoutsUnlocked(4, beforePrepare),
  'Hold the Breach must not unlock loadouts early'
);

const afterPrepare = chapterFourNodes.map(node => ({
  ...node,
  completed: Number(node.id.split('_').at(-1)) <= 6
}));
assert(
  humanLoadoutsUnlocked(4, afterPrepare),
  'Prepare for Battle must unlock Human loadouts'
);
assert(humanLoadoutsUnlocked(5), 'Loadouts must remain unlocked after Chapter 4');

console.log('PASS: Human Army Loadouts unlock at Prepare for Battle and remain locked beforehand.');
