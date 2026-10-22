/**
 * Human-first 1.0 must be consistent across save loading, provider controls,
 * faction previews and documentation. No gameplay state is mutated here.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFactionGameState, createInitialGameSnapshot } from '../src/save/schema';
import {
  futureFactionMessage, isFactionCampaignReleased, playableSnapshotForRelease,
  releaseCampaignScope
} from '../src/game/releaseCampaignScope';
import type { FactionId } from '../src/game/types';

assert.equal(releaseCampaignScope.version, '1.0');
assert.deepEqual([...releaseCampaignScope.playableFactions], ['human']);
assert.deepEqual([...releaseCampaignScope.futureFactions], ['elf', 'orc']);
assert.equal(releaseCampaignScope.metaCampaignReleased, false);
assert.ok(futureFactionMessage.toLowerCase().includes('future update'));

for (const faction of ['human', 'elf', 'orc'] as FactionId[]) {
  assert.equal(isFactionCampaignReleased(faction), faction === 'human',
    'The release gate must not depend on previous campaign completion');
}
const newGame = createInitialGameSnapshot();
assert.equal(newGame.activeFaction, 'human');
assert.equal(playableSnapshotForRelease(newGame), newGame,
  'Normal Human starts should not cause an unnecessary copy or write');

for (const faction of ['elf', 'orc'] as const) {
  const oldSave = {
    ...newGame,
    activeFaction: faction,
    shared: {
      ...newGame.shared,
      completedCampaigns: ['human', 'elf', 'orc'] as FactionId[],
      gems: 99
    },
    factionStates: {
      ...newGame.factionStates,
      [faction]: createFactionGameState(faction)
    }
  };
  const before = JSON.stringify(oldSave);
  const previousFaction = oldSave.factionStates[faction];
  const human = oldSave.factionStates.human;
  const playable = playableSnapshotForRelease(oldSave);
  assert.ok(playable);
  assert.notEqual(playable, oldSave, 'Historical off-faction saves need an in-memory release view');
  assert.equal(playable.activeFaction, 'human');
  assert.equal(playable.factionStates[faction], previousFaction,
    'Locked faction campaign data must survive intact');
  assert.equal(playable.factionStates.human, human,
    'Previously recorded Human progress must be resumed, not restarted');
  assert.equal(playable.shared, oldSave.shared,
    'Shared completion, gems, achievements and cosmetics must remain');
  assert.equal(JSON.stringify(oldSave), before, 'Release gating may never mutate the stored snapshot');
  assert.equal(isFactionCampaignReleased(faction), false, 'Even fully completed saves stay Human-only in 1.0');
  assert.equal(playableSnapshotForRelease(playable), playable, 'Reopening Human must be stable');

  const noHuman = {
    ...oldSave,
    factionStates: { ...oldSave.factionStates, human: null }
  };
  assert.equal(playableSnapshotForRelease(noHuman), null,
    'If Human state is absent, preserve the slot instead of silently resetting it');
  assert.equal(JSON.stringify(noHuman.factionStates[faction]), JSON.stringify(previousFaction));
}

const read = (path: string) => readFileSync(path, 'utf8');
const provider = read('src/game/GameProvider.tsx');
const screen = read('src/screens/CampaignScreen.tsx');
const saveProvider = read('src/save/SaveProvider.tsx');
const saveSelect = read('src/screens/SaveSelectScreen.tsx');
const shell = read('src/AppShell.tsx');
const roadmap = read('docs/MASTER_DEVELOPMENT_ROADMAP.md');
const readme = read('README.md');

assert.ok(provider.includes("if (!isFactionCampaignReleased(faction)) return false;"),
  'Provider must block direct Elf/Orc faction switches, not just hide their buttons');
assert.ok(provider.includes("unlocked: isFactionCampaignReleased('elf') && humanComplete") &&
  provider.includes("unlocked: isFactionCampaignReleased('orc') && humanComplete"),
  'Completion of the Human campaign must not override the release gate');
assert.ok(provider.includes('releaseCampaignScope.metaCampaignReleased && allComplete') &&
  provider.includes('releaseCampaignScope.metaCampaignReleased &&'),
  'Three Seals stays disabled in 1.0 even for beta players who completed all factions');
assert.ok(screen.includes("!released") &&
  screen.includes("'FUTURE UPDATE'") &&
  screen.includes('released && availability?.unlocked') &&
  screen.includes("releaseCampaignScope.metaCampaignReleased && campaignById('meta')?.unlocked"),
  'Faction cards must preview future campaigns and never offer playable actions');
assert.ok(saveProvider.includes('playableSnapshotForRelease(record.snapshot)') &&
  saveProvider.includes('...record, snapshot: playable') &&
  saveProvider.includes('This save has no Human campaign available'),
  'Old non-Human save slots must safely resume Human or preserve unreadable future data');
assert.ok(saveSelect.includes("'FUTURE UPDATE'") &&
  saveSelect.includes('Your {metadata.faction') &&
  saveSelect.includes('slotSelectionMessage'),
  'Save selection must not claim unreleased factions are ready');
assert.ok(shell.includes("flow === 'metaCampaign' && releaseCampaignScope.metaCampaignReleased") &&
  shell.includes("if (releaseCampaignScope.metaCampaignReleased) openFlow('metaCampaign')"),
  'Old navigation paths cannot bypass the Three Seals gate');
assert.ok(readme.includes('**Human-only launch:**') &&
  roadmap.includes('Launch scope decision — 1.0 Human-first'),
  'Canonical docs must establish which campaigns are actually included at launch');

console.log('PASS: Human-only 1.0 release gate, future-content UI, 3-faction legacy save preservation and Three Seals lock.');
