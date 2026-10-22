/**
 * Phase 0: guard the REAL routing/completion contracts behind the 19 early Human
 * mission-kind differences. This is a SOURCE contract, not device playtesting.
 * A design kind need not equal the runtime display type (elite / supply / event).
 *
 * Update this audit only after inspecting the actual UI route AND completion
 * handler. Never change saved node IDs merely to satisfy a roadmap type.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chapterOneNodes } from '../src/game/data';
import { chapterTwoNodes } from '../src/game/chapter2';
import { chapterThreeNodes } from '../src/game/chapter3';
import { chapterFourNodes } from '../src/game/chapter4';
import { getCampaignMissionBlueprint } from '../src/game/campaignMissionRoadmap';

type AuditCase = {
  chapter: 1 | 2 | 3 | 4;
  order: number;
  runtimeType: string;
  flag: string | null;
  callback: string | null;
  sink: string; // battle:<encounter ID> or action:<GameProvider function>
  flow?: string;
  effect: string[];
  rationale: string;
};

const cases: AuditCase[] = [
  { chapter: 1, order: 3, runtimeType: 'event', flag: 'chapterOneStory', callback: 'onOpenMarkedRaiders',
    sink: 'action:completeMarkedRaiders', flow: 'markedRaiders', effect: ['setForgeUnlocked(true)', "node.id === 'node_4'"],
    rationale: 'Investigate and unlock Forge; the old upgrade kind is not a second building node.' },
  { chapter: 1, order: 4, runtimeType: 'event', flag: null, callback: null,
    sink: 'action:promoteMira', effect: ['setFirstPromotionComplete(true)', "node.id === 'node_5'"],
    rationale: 'Mira is promoted from the dedicated promotion UI; no Campaign node button.' },
  { chapter: 1, order: 5, runtimeType: 'elite', flag: 'mercenaryPlayable', callback: 'onStartMercenary',
    sink: 'battle:mercenary_patrol', effect: ['setCommanderChoiceUnlocked(true)', "node.id === 'node_5'"],
    rationale: 'Elite treatment for a real mercenary battle.' },
  { chapter: 1, order: 6, runtimeType: 'supply', flag: 'refugeePlayable', callback: 'onOpenRefugeeCamp',
    sink: 'action:completeRefugeeCamp', flow: 'refugeeCamp', effect: ['setRefugeeCampSecured(true)', "node.id === 'node_7'"],
    rationale: 'Refugee/supply decision, not a duplicate battle.' },
  { chapter: 2, order: 1, runtimeType: 'event', flag: 'fortMusterPlayable', callback: 'onOpenFortMuster',
    sink: 'action:chooseFortRecruit', flow: 'fortMuster', effect: ['setFourthRecruitChosen(true)', "node.id === 'ch2_node_2'"],
    rationale: 'Recruit the next squad; not the original planned battle.' },
  { chapter: 2, order: 2, runtimeType: 'battle', flag: 'ironRoadPlayable', callback: 'onStartIronRoad',
    sink: 'battle:iron_road_skirmish', effect: ["'iron_hills_mine'", "node.id === 'ch2_node_3'"],
    rationale: 'Secures the Iron Hills Mine rather than automatically completing a crafting tutorial.' },
  { chapter: 2, order: 4, runtimeType: 'elite', flag: 'defensePlayable', callback: 'onOpenKingdomDefense',
    sink: 'action:completeKingdomDefense', flow: 'kingdomDefense', effect: ['setKingdomDefenseCompleted(true)', "node.id === 'ch2_node_5'"],
    rationale: 'Story Kingdom Defense multiwave clear; elite label does not mean one regular encounter.' },
  { chapter: 2, order: 5, runtimeType: 'event', flag: 'signalPlayable', callback: 'onOpenBrokenSignalTower',
    sink: 'action:completeBrokenSignalTower', flow: 'brokenSignalTower', effect: ['setSignalTowerUnlocked(true)', "node.id === 'ch2_node_6'"],
    rationale: 'Repairs the Signal Tower after Defense; not the original flank battle.' },
  { chapter: 2, order: 7, runtimeType: 'supply', flag: 'timberPlayable', callback: 'onOpenTimberClaim',
    sink: 'action:unlockTimberCamp', flow: 'timberClaim', effect: ["'greenwood_camp'", "node.id === 'ch2_node_8'"],
    rationale: 'Supply claim and lumber site unlock, not a battle.' },
  { chapter: 3, order: 1, runtimeType: 'event', flag: 'marcherEnvoyPlayable', callback: 'onOpenMarcherEnvoy',
    sink: 'action:chooseMarcherAuxiliary', flow: 'marcherEnvoy', effect: ['setUnits(previous', "node.id === 'ch3_node_2'"],
    rationale: 'Chapter entrance recruit event.' },
  { chapter: 3, order: 3, runtimeType: 'battle', flag: 'frozenSteelPlayable', callback: 'onStartFrozenSteel',
    sink: 'battle:ch3_frozen_steel', effect: ['Froststeel Secured', "node.id === 'ch3_node_4'"],
    rationale: 'Battle for Froststeel; not evidence an upgrade/crafting step was added.' },
  { chapter: 3, order: 5, runtimeType: 'event', flag: 'warningsPlayable', callback: 'onOpenThreeWarnings',
    sink: 'action:chooseMarcherWarning', flow: 'threeWarnings', effect: ['setMarcherWarningChoiceId(choiceId)', "node.id === 'ch3_node_6'"],
    rationale: 'Persistent Chapter 3 rider-doctrine choice represented by event UI.' },
  { chapter: 3, order: 6, runtimeType: 'elite', flag: 'siegeRoadPlayable', callback: 'onStartSiegeRoad',
    sink: 'battle:siege_road', effect: ['Siege Road Broken', "node.id === 'ch3_node_7'"],
    rationale: 'Elite version of a battle, not a missing combat encounter.' },
  { chapter: 4, order: 2, runtimeType: 'battle', flag: 'brokenStandardsPlayable', callback: 'onStartBrokenStandards',
    sink: 'battle:broken_standards', effect: ['The Standards Break', "node.id === 'ch4_node_3'"],
    rationale: 'Fifth active deployment unlock follows the battle; not a standalone upgrade screen.' },
  { chapter: 4, order: 3, runtimeType: 'event', flag: 'chapterFourCommanderPlayable', callback: 'onOpenChapterFourCommander',
    sink: 'action:chooseCommanderPath', flow: 'commanderChoice', effect: ['chapterFourDoctrineMission', "node.id === 'ch4_node_4'"],
    rationale: 'Commander doctrine choice represented by event UI.' },
  { chapter: 4, order: 5, runtimeType: 'elite', flag: 'crownroadAmbushPlayable', callback: 'onStartCrownroadAmbush',
    sink: 'battle:crownroad_ambush', effect: ['Crownroad Secured', "node.id === 'ch4_node_6'"],
    rationale: 'Elite battle treatment.' },
  { chapter: 4, order: 6, runtimeType: 'event', flag: 'emptyThronePlayable', callback: 'onOpenEmptyThrone',
    sink: 'action:completeEmptyThrone', flow: 'emptyThrone', effect: ["'crownroad_salvage'", "node.id === 'ch4_node_7'"],
    rationale: 'Narrative discovery and salvage-site unlock, not a generic preparation upgrade.' },
  { chapter: 4, order: 8, runtimeType: 'event', flag: 'strongholdMusterPlayable', callback: 'onOpenStrongholdMuster',
    sink: 'action:chooseStrongholdRecruit', flow: 'strongholdMuster', effect: ['setUnits(previous', "node.id === 'ch4_node_9'"],
    rationale: 'Elite reserve recruitment; sixth active deployment is still gated by Chapter 5 mission 2.' },
  { chapter: 4, order: 10, runtimeType: 'event', flag: 'lastLoyalistsPlayable', callback: 'onOpenLastLoyalists',
    sink: 'action:chooseLastLoyalistsApproach', flow: 'lastLoyalists', effect: ['setLastLoyalistsChoiceId(choiceId)', "node.id === 'ch4_node_11'"],
    rationale: 'Route/loyalist decision represented by event UI.' }
];

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

const read = (sourcePath: string) =>
  fs.readFileSync(path.join(process.cwd(), sourcePath), 'utf8');
const campaign = read('src/screens/CampaignScreen.tsx');
const shell = read('src/AppShell.tsx');
const provider = read('src/game/GameProvider.tsx');
const promotion = read('src/screens/PromotionScreen.tsx');
const nodes = [chapterOneNodes, chapterTwoNodes, chapterThreeNodes, chapterFourNodes];

function handlerSource(name: string): string {
  const start = provider.indexOf('  const ' + name + ' =');
  assert(start >= 0, 'Missing GameProvider action ' + name);
  const next = provider.indexOf('\n  const ', start + 1);
  return provider.slice(start, next < 0 ? undefined : next);
}

function battleSource(encounterId: string): string {
  const marker = "    if (encounterId === '" + encounterId + "') {";
  const start = provider.indexOf(marker);
  assert(start >= 0, 'Missing finishEncounter handler for ' + encounterId);
  const next = provider.indexOf("\n    if (encounterId === '", start + marker.length);
  return provider.slice(start, next < 0 ? undefined : next);
}

assert(cases.length === 19, 'Expected exactly the 19 audited early Human differences');
const uniqueIds = new Set<string>();
for (const item of cases) {
  const blueprint = getCampaignMissionBlueprint(item.chapter, item.order);
  const node = nodes[item.chapter - 1][item.order - 1];
  const label = 'Human Chapter ' + item.chapter + ' mission ' + item.order;
  assert(Boolean(blueprint) && Boolean(node), 'Missing ' + label);
  assert(blueprint!.runtimeNodeId === node.id, label + ' must retain the saved node ID');
  assert(blueprint!.implementationStatus === 'live', label + ' must be linked to a live node');
  assert(blueprint!.kind !== node.type, label + ' no longer differs; update the audit deliberately');
  assert(node.type === item.runtimeType, label + ' runtime presentation type changed');
  assert(!uniqueIds.has(node.id), 'Duplicate audit ID ' + node.id);
  uniqueIds.add(node.id);

  if (item.flag && item.callback) {
    const flagStart = campaign.indexOf('const ' + item.flag + ' =');
    assert(flagStart >= 0, label + ' missing Campaign playable predicate ' + item.flag);
    assert(
      campaign.slice(flagStart, flagStart + 230).includes("node.id === '" + node.id + "'"),
      label + ' is not gated by its exact runtime node'
    );
    const routePattern = new RegExp(':\\s*' + item.flag + '\\s*\\?\\s*' + item.callback + '\\b');
    assert(routePattern.test(campaign), label + ' missing Campaign action mapping');
    const callbackStart = shell.indexOf(item.callback + '={() =>');
    assert(callbackStart >= 0, label + ' missing AppShell callback');
    const callbackBody = shell.slice(callbackStart, callbackStart + 230);
    if (item.sink.startsWith('battle:')) {
      const encounter = item.sink.slice('battle:'.length);
      assert(callbackBody.includes("setActiveEncounterId('" + encounter + "')"),
        label + ' AppShell battle route changed');
      assert(callbackBody.includes("openFlow('battlePrep')"), label + ' must open battle preparation');
    } else {
      assert(callbackBody.includes("openFlow('" + item.flow + "')"),
        label + ' AppShell event flow changed');
    }
  } else {
    assert(item.chapter === 1 && item.order === 4, 'Only Mira promotion bypasses the Campaign tap');
    assert(promotion.includes('promoteMira(selected.requiredEquipmentId)'),
      'Mira event must complete from the Promotion screen');
  }

  const actionName = item.sink.startsWith('action:')
    ? item.sink.slice('action:'.length)
    : null;
  const source = actionName ? handlerSource(actionName) : battleSource(item.sink.slice('battle:'.length));
  assert(source.includes("node.id === '" + node.id + "'"), label + ' completion does not refer to this node');
  assert(source.includes('completed: true'), label + ' does not mark its node complete');
  for (const effect of item.effect) {
    assert(source.includes(effect), label + ' lost required source-level evidence ' + effect);
  }
  assert(item.rationale.length > 25, label + ' lacks an audit rationale');
}
assert(uniqueIds.size === 19, 'Each differing runtime node must be audited once');

const actualDifferences = nodes.flatMap((chapterNodes, chapterOffset) =>
  chapterNodes.flatMap((node, index) =>
    getCampaignMissionBlueprint(chapterOffset + 1, index + 1)?.kind !== node.type
      ? [node.id]
      : []
  )
);
assert(actualDifferences.length === cases.length,
  'New design/runtime differences need classification, found ' + actualDifferences.length);
for (const id of actualDifferences) assert(uniqueIds.has(id), 'Unclassified differing node ' + id);

console.log('PASS: all 19 Human Ch1-4 design/runtime type differences have intact UI routing, GameProvider completion anchors and documented intent. Source-level contract only; device playthrough and reward semantics remain separate QA.');
