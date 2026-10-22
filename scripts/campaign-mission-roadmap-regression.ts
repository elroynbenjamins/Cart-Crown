import fs from 'node:fs';
import path from 'node:path';
import { chapterOneNodes } from '../src/game/data';
import { chapterTwoNodes } from '../src/game/chapter2';
import { chapterThreeNodes } from '../src/game/chapter3';
import { chapterFourNodes } from '../src/game/chapter4';
import { chapterFiveNodes } from '../src/game/chapter5';
import { chapterSixNodes } from '../src/game/chapter6';
import { chapterSevenNodes } from '../src/game/chapter7';
import {
  humanLateEncounterDefinitions,
  humanLateEncounterFormations,
  humanLateMissions
} from '../src/game/humanLateCampaign';
import {
  campaignMissionCountsByChapter,
  campaignMissionRoadmap,
  expectedActiveSquadsByChapter,
  getCampaignChapterBlueprints,
  getCampaignActiveSquadCap
} from '../src/game/campaignMissionRoadmap';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const expectedCounts = [7, 8, 11, 11, 11, 11, 11];
const expectedTotal = expectedCounts.reduce((sum, count) => sum + count, 0);

assert(
  campaignMissionRoadmap.length === expectedTotal,
  'Expected ' + expectedTotal + ' roadmap missions, found ' + campaignMissionRoadmap.length
);

const missionNames = new Set<string>();
const missionIds = new Set<string>();

campaignMissionRoadmap.forEach((mission, index) => {
  assert(
    mission.globalOrder === index + 1,
    'Mission ' + mission.name + ' should have global order ' + (index + 1) + ', found ' + mission.globalOrder
  );
  assert(!missionNames.has(mission.name), 'Duplicate mission name: ' + mission.name);
  assert(!missionIds.has(mission.id), 'Duplicate mission id: ' + mission.id);
  assert(
    mission.expectedActiveSquads <= 6,
    mission.name + ' exceeds the permanent six-squad campaign cap'
  );
  const expectedSquadsAtMission =
    mission.globalOrder <= 7
      ? 2
      : mission.globalOrder <= 16
        ? 3
        : mission.globalOrder <= 27
          ? 4
          : mission.globalOrder <= 38
            ? 5
            : 6;
  assert(
    mission.expectedActiveSquads === expectedSquadsAtMission,
    mission.name +
      ' does not match the staged squad cadence at mission ' +
      mission.globalOrder
  );
  missionNames.add(mission.name);
  missionIds.add(mission.id);
});

expectedCounts.forEach((count, zeroBasedChapter) => {
  const chapter = (zeroBasedChapter + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const missions = getCampaignChapterBlueprints(chapter);

  assert(
    missions.length === count,
    'Chapter ' + chapter + ' expected ' + count + ' missions, found ' + missions.length
  );
  assert(
    campaignMissionCountsByChapter[chapter] === count,
    'Chapter ' + chapter + ' count declaration drifted'
  );

  missions.forEach((mission, index) => {
    assert(
      mission.chapterOrder === index + 1,
      'Chapter ' + chapter + ' mission order is not contiguous at ' + mission.name
    );
  });

  assert(
    missions[missions.length - 1]?.expectedActiveSquads === expectedActiveSquadsByChapter[chapter],
    'Chapter ' + chapter + ' must end at its declared squad cap'
  );
});

const unlockMission = (unlock: string) =>
  campaignMissionRoadmap.find(mission => mission.unlocks.includes(unlock));

assert(unlockMission('hold_line_order')?.globalOrder === 2, 'Hold Line must unlock in mission 2');
assert(unlockMission('focus_target_order')?.globalOrder === 5, 'Focus Target must unlock in mission 5');
assert(
  unlockMission('third_deployment_slot')?.globalOrder === 8,
  'Third deployment slot must open Chapter 2'
);
assert(
  unlockMission('fourth_deployment_slot')?.globalOrder === 17,
  'Fourth deployment slot must unlock in Chapter 3 mission 2'
);
assert(
  unlockMission('fifth_deployment_slot')?.globalOrder === 28,
  'Fifth deployment slot must unlock in Chapter 4 mission 2'
);
assert(
  unlockMission('sixth_deployment_slot')?.globalOrder === 39,
  'Sixth deployment slot must unlock in Chapter 5 mission 2'
);
assert(
  unlockMission('first_mage_squad')?.globalOrder === 51,
  'Mage progression must begin in Chapter 6'
);
assert(
  unlockMission('battering_ram')?.globalOrder === 61,
  'First true siege support must begin in Chapter 7'
);

const afterSixthSlot = campaignMissionRoadmap.filter(mission => mission.globalOrder >= 39);
assert(
  afterSixthSlot.every(mission => mission.expectedActiveSquads === 6),
  'Normal campaign squad count must stop increasing after the sixth slot'
);

assert(getCampaignActiveSquadCap(1) === 2, 'Chapter 1 runtime cap must be 2');
assert(getCampaignActiveSquadCap(2) === 3, 'Chapter 2 runtime cap must be 3');
assert(getCampaignActiveSquadCap(3) === 3, 'Chapter 3 must open at 3 squads');
assert(
  getCampaignActiveSquadCap(3, [{ id: 'ch3_node_2', completed: true }]) === 4,
  'Chapter 3 mission 2 must unlock squad 4'
);
assert(getCampaignActiveSquadCap(4) === 4, 'Chapter 4 must open at 4 squads');
assert(
  getCampaignActiveSquadCap(4, [{ id: 'ch4_node_2', completed: true }]) === 5,
  'Chapter 4 mission 2 must unlock squad 5'
);
assert(getCampaignActiveSquadCap(5) === 5, 'Chapter 5 must open at 5 squads');
assert(
  getCampaignActiveSquadCap(5, [{ id: 'ch5_node_2', completed: true }]) === 6,
  'Chapter 5 mission 2 must unlock squad 6'
);
assert(getCampaignActiveSquadCap(6) === 6, 'Chapter 6 runtime cap must remain 6');
assert(getCampaignActiveSquadCap(99) === 6, 'Late campaign runtime cap must never exceed 6');


const liveChapterOneNames = [
  'A Banner Still Flies',
  'Hold the Crossing',
  'Rebuild the Barracks',
  'Spears at Dawn',
  'Cut Off the Captain',
  'The Broken Road',
  'Reclaim the Outpost'
];
const liveChapterTwoNames = [
  'Strength in Numbers',
  'Tools of War',
  'Riders on the Road',
  'No Army Fights Forever',
  'The Long Way Around',
  'The Iron Line',
  'Supplies for War',
  'Break Their Hold'
];

assert(chapterOneNodes.length === 7, 'Live Chapter 1 must contain seven missions');
assert(
  chapterOneNodes.every((node, index) => node.name === liveChapterOneNames[index]),
  'Live Chapter 1 mission order drifted from the roadmap'
);
assert(chapterTwoNodes.length === 8, 'Live Chapter 2 must contain eight missions');
assert(
  chapterTwoNodes.every((node, index) => node.name === liveChapterTwoNames[index]),
  'Live Chapter 2 mission order drifted from the roadmap'
);


const liveChapterThreeNames = [
  'Into Frostmarch',
  'A Wider Front',
  'Frozen Steel',
  'Hooves in the Snow',
  'Choose Your Rider',
  'The Line Buckles',
  'Through the Gap',
  'Wolves on the Wing',
  'The Layered Host',
  'Cold Roads',
  'Battle for Frostgate'
];
const liveChapterFourNames = [
  'The Long Front',
  'Raise Another Banner',
  'Two Ways to War',
  'Broken Ground',
  'Hold the Breach',
  'Prepare for Battle',
  'The Wrong Army',
  'Veteran Steel',
  'Hunters in the Rear',
  'The Forked Banner',
  'Siege of Greywatch'
];

assert(chapterThreeNodes.length === 11, 'Live Chapter 3 must contain eleven missions');
assert(
  chapterThreeNodes.every((node, index) => node.name === liveChapterThreeNames[index]),
  'Live Chapter 3 mission order drifted from the roadmap'
);
assert(chapterFourNodes.length === 11, 'Live Chapter 4 must contain eleven missions');
assert(
  chapterFourNodes.every((node, index) => node.name === liveChapterFourNames[index]),
  'Live Chapter 4 mission order drifted from the roadmap'
);


const liveLateChapters = [
  chapterFiveNodes,
  chapterSixNodes,
  chapterSevenNodes
];
for (const [offset, nodes] of liveLateChapters.entries()) {
  const chapter = offset + 5;
  const roadmap = getCampaignChapterBlueprints(chapter);
  const runtime = humanLateMissions.filter(
    mission => mission.chapter === chapter
  );

  assert(
    nodes.length === 11 &&
      runtime.length === 11 &&
      roadmap.length === 11,
    'Human Chapter ' + chapter + ' must expose all eleven canonical missions'
  );

  nodes.forEach((node, index) => {
    const blueprint = roadmap[index];
    const mission = runtime[index];
    assert(
      Boolean(blueprint) &&
        Boolean(mission) &&
        node.id === mission?.id &&
        node.name === blueprint?.name &&
        mission?.name === blueprint?.name &&
        node.type === blueprint?.kind &&
        mission?.type === blueprint?.kind,
      'Human Chapter ' + chapter +
        ' runtime mission ' + (index + 1) +
        ' drifted from the 70-mission roadmap'
    );

    const combatLike = [
      'battle',
      'boss',
      'operation',
      'siege',
      'defense'
    ].includes(node.type);

    if (combatLike) {
      assert(
        Boolean(mission?.encounterId),
        node.name + ' must have a playable encounter'
      );
      const encounterId = mission!.encounterId!;
      assert(
        Boolean(humanLateEncounterDefinitions[encounterId]),
        node.name + ' is missing its encounter definition'
      );
      assert(
        Boolean(humanLateEncounterFormations[encounterId]),
        node.name + ' is missing its authored enemy formation'
      );
    } else {
      assert(
        !mission?.encounterId,
        node.name + ' should resolve through the Human mission briefing flow'
      );
    }
  });
}

assert(
  humanLateMissions.length === 33,
  'Human Chapters 5-7 must contribute 33 live missions'
);
assert(
  [
    ...chapterOneNodes,
    ...chapterTwoNodes,
    ...chapterThreeNodes,
    ...chapterFourNodes,
    ...chapterFiveNodes,
    ...chapterSixNodes,
    ...chapterSevenNodes
  ].length === 70,
  'The live Human campaign must contain exactly 70 missions'
);

const campaignScreenSource = fs.readFileSync(
  path.join(process.cwd(), 'src/screens/CampaignScreen.tsx'),
  'utf8'
);
const journeyMapSource = fs.readFileSync(
  path.join(process.cwd(), 'src/ui/CampaignJourneyMap.tsx'),
  'utf8'
);

for (const label of [
  'GREENKEEP',
  'IRON HILLS',
  'FROSTMARCH',
  'GREYWATCH',
  'CROWNROAD',
  'GLASS KEEP',
  'BLACKSTONE'
]) {
  assert(
    campaignScreenSource.includes("label: '" + label + "'"),
    'Human campaign chapter identity is missing ' + label
  );
}
for (const phase of [
  'SURVIVE',
  'MUSTER',
  'BREAKTHROUGH',
  'FORTIFY',
  'KINGDOM WAR',
  'ARCANE FRONT',
  'FINAL SIEGE'
]) {
  assert(
    campaignScreenSource.includes("phase: '" + phase + "'"),
    'Human campaign chapter phase is missing ' + phase
  );
}
assert(
  campaignScreenSource.includes('CHAPTER FINALE') &&
    campaignScreenSource.includes('ELITE ENCOUNTER'),
  'Human elite and chapter-finale missions must retain distinct presentation'
);
const frontCardSource = fs.readFileSync(
  path.join(process.cwd(), 'src/ui/HumanCampaignFrontCard.tsx'),
  'utf8'
);
assert(
  campaignScreenSource.includes('<HumanCampaignFrontCard') &&
    frontCardSource.includes('cue.squadMessage') &&
    frontCardSource.includes('cue.bossState') &&
    frontCardSource.includes('cue.nextMissionName'),
  'Human campaign must retain live squad strength, boss threat and current objective'
);
assert(
  journeyMapSource.includes('points.slice(0, 8)'),
  'The Human campaign journey map must expose all eight route regions'
);
assert(
  journeyMapSource.includes('routeProgressWidth') &&
    journeyMapSource.includes('width: routeProgressWidth'),
  'The Human campaign journey map must visualize route progress'
);

// Phase 0 guard: the authored roadmap and saved runtime IDs must never drift.
// Roadmap kinds/unlocks are design targets, not proof of event/reward fidelity;
// the early chapters intentionally contain different runtime presentation types.
const canonicalLiveNodes = [
  chapterOneNodes, chapterTwoNodes, chapterThreeNodes, chapterFourNodes,
  chapterFiveNodes, chapterSixNodes, chapterSevenNodes
];
const linkedNodeIds = new Set<string>();
for (const blueprint of campaignMissionRoadmap) {
  const node = canonicalLiveNodes[blueprint.chapter - 1][blueprint.chapterOrder - 1];
  assert(Boolean(node), 'Missing live node for ' + blueprint.id);
  assert(
    blueprint.implementationStatus === 'live',
    'Misleading blueprint-only status for ' + blueprint.id
  );
  assert(
    blueprint.runtimeNodeId === node.id,
    blueprint.id + ' must link to saved runtime node ' + node.id
  );
  assert(
    blueprint.name === node.name,
    blueprint.id + ' title differs from the live runtime node'
  );
  assert(!linkedNodeIds.has(node.id), 'Duplicate canonical runtime node ID ' + node.id);
  linkedNodeIds.add(node.id);
}
assert(linkedNodeIds.size === 70, 'Expected 70 distinct saved runtime IDs');

console.log(
  'PASS: all 70 Human campaign missions, live Chapters 1-7 ordering, eight-region presentation, chapter identity, late combat wiring and 2->3->4->5->6 squad cadence remain protected.'
);
