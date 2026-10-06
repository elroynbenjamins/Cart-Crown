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

console.log(
  'Campaign mission roadmap OK: ' +
    campaignMissionRoadmap.length +
    ' missions across 7 chapters; squad cadence 2->3->4->5->6 locked.'
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
