import {
  battleOrderDefinitions,
  decrementBattleOrderCooldowns,
  getUnlockedBattleOrders
} from '../src/game/battleOrders';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(
  JSON.stringify(getUnlockedBattleOrders(1, 'hold_the_road')) ===
    JSON.stringify(['hold']),
  'Hold the Crossing should introduce Hold without later orders'
);
assert(
  getUnlockedBattleOrders(1, 'mercenary_patrol').includes('focus'),
  'Cut Off the Captain must unlock Focus'
);
assert(
  !getUnlockedBattleOrders(3, 'siege_road').includes('push'),
  'Push must stay locked before Through the Gap'
);
assert(
  getUnlockedBattleOrders(3, 'ch3_through_gap').includes('push'),
  'Through the Gap must unlock Push'
);
assert(
  !getUnlockedBattleOrders(4, 'ch4_broken_ground').includes('reinforce'),
  'Reinforce must stay locked before Hold the Breach'
);
assert(
  getUnlockedBattleOrders(4, 'crownroad_ambush').includes('reinforce'),
  'Hold the Breach must unlock Reinforce'
);
assert(
  !getUnlockedBattleOrders(5, 'old_royal_lands').includes('rally'),
  'Too Many Fronts must occur before Rally unlocks'
);
assert(
  getUnlockedBattleOrders(5, 'ch5_rally_line').includes('rally'),
  'Rally the Line must unlock Rally'
);
assert(
  getUnlockedBattleOrders(6, 'sundered_fields').includes('rally'),
  'Chapter 6 must retain Rally'
);

const hold = battleOrderDefinitions.hold;
const focus = battleOrderDefinitions.focus;
const push = battleOrderDefinitions.push;
const reinforce = battleOrderDefinitions.reinforce;
const rally = battleOrderDefinitions.rally;

assert(
  hold.effects.incomingDamageMultiplier < 1 &&
    hold.effects.attackMultiplier < 1 &&
    hold.effects.partyIntegrityLossMultiplier < 1,
  'Hold must trade offense for protection and cohesion'
);
assert(
  focus.effects.attackMultiplier > 1 &&
    focus.effects.enemyIntegrityPressureMultiplier > 1,
  'Focus must increase offensive pressure'
);
assert(
  push.effects.attackMultiplier > focus.effects.attackMultiplier &&
    push.effects.incomingDamageMultiplier > 1 &&
    push.effects.partyIntegrityLossMultiplier > 1,
  'Push must be the strongest offensive order and carry real defensive risk'
);
assert(
  reinforce.effects.immediateIntegrityRestore > 0 &&
    reinforce.effects.incomingDamageMultiplier < 1 &&
    reinforce.effects.attackMultiplier < 1,
  'Reinforce must restore/stabilize the line at an offensive opportunity cost'
);
assert(
  rally.effects.immediateIntegrityRestore > reinforce.effects.immediateIntegrityRestore &&
    rally.effects.partyIntegrityLossMultiplier < reinforce.effects.partyIntegrityLossMultiplier &&
    rally.cooldownExchanges > reinforce.cooldownExchanges,
  'Rally must be the stronger emergency stabilization order with a longer cooldown'
);

const cooldowns = decrementBattleOrderCooldowns({
  hold: hold.cooldownExchanges,
  push: 1,
  reinforce: 0
});
assert(
  cooldowns.hold === hold.cooldownExchanges - 1,
  'Cooldowns must tick once per exchange'
);
assert(cooldowns.push === 0, 'Cooldowns must reach zero cleanly');
assert(cooldowns.reinforce === 0, 'Cooldowns must never become negative');

for (const definition of Object.values(battleOrderDefinitions)) {
  assert(definition.durationExchanges >= 1, definition.id + ' needs a duration');
  assert(definition.cooldownExchanges > definition.durationExchanges, definition.id + ' must not be spammable');
}

console.log('PASS: Commander battle order unlocks, trade-offs and cooldowns remain protected.');
