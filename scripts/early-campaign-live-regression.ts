import { chapterOneNodes } from '../src/game/data';
import { chapterTwoNodes } from '../src/game/chapter2';
import { getCampaignActiveSquadCap } from '../src/game/campaignCapacity';
import {
  encounters,
  getEnemyFormationTactic,
  type EncounterId
} from '../src/game/encounters';
import { shouldRequestChapterOneReview } from '../src/game/tutorial';

function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const chapterOneNames = [
  'A Banner Still Flies',
  'Hold the Crossing',
  'Rebuild the Barracks',
  'Spears at Dawn',
  'Cut Off the Captain',
  'The Broken Road',
  'Reclaim the Outpost'
];
const chapterTwoNames = [
  'Strength in Numbers',
  'Tools of War',
  'Riders on the Road',
  'No Army Fights Forever',
  'The Long Way Around',
  'The Iron Line',
  'Supplies for War',
  'Break Their Hold'
];

expect(chapterOneNodes.length === 7, 'Live Chapter 1 must have seven missions.');
expect(chapterTwoNodes.length === 8, 'Live Chapter 2 must have eight missions.');
expect(
  chapterOneNodes.every((node, index) => node.name === chapterOneNames[index]),
  'Live Chapter 1 names/order drifted from the roadmap.'
);
expect(
  chapterTwoNodes.every((node, index) => node.name === chapterTwoNames[index]),
  'Live Chapter 2 names/order drifted from the roadmap.'
);
expect(
  chapterOneNodes[0]?.completed === true &&
    chapterOneNodes[1]?.current === true,
  'Fresh Chapter 1 must treat A Banner Still Flies as the intro and Hold the Crossing as the first playable mission.'
);
expect(
  chapterTwoNodes[0]?.current === true,
  'Fresh Chapter 2 must open on Strength in Numbers.'
);

const chapterTwoBefore = chapterTwoNodes.map(node => ({ ...node }));
const chapterTwoAfter = chapterTwoNodes.map(node =>
  node.id === 'ch2_m01'
    ? { ...node, completed: true, current: false }
    : { ...node }
);

expect(
  getCampaignActiveSquadCap({
    faction: 'human',
    chapterNumber: 1,
    stageFormationSlots: 3,
    chapterNodes: chapterOneNodes
  }) === 2,
  'Chapter 1 must remain capped at two active squads even after the settlement grows.'
);
expect(
  getCampaignActiveSquadCap({
    faction: 'human',
    chapterNumber: 2,
    stageFormationSlots: 4,
    chapterNodes: chapterTwoBefore
  }) === 2,
  'Chapter 2 must begin with the two-squad core.'
);
expect(
  getCampaignActiveSquadCap({
    faction: 'human',
    chapterNumber: 2,
    stageFormationSlots: 4,
    chapterNodes: chapterTwoAfter
  }) === 3,
  'Strength in Numbers must unlock exactly the third active squad.'
);
expect(
  getCampaignActiveSquadCap({
    faction: 'human',
    chapterNumber: 3,
    stageFormationSlots: 5,
    chapterNodes: []
  }) === 4,
  'Existing Chapter 3 must not exceed four active squads while the later migration is pending.'
);
expect(
  getCampaignActiveSquadCap({
    faction: 'human',
    chapterNumber: 4,
    stageFormationSlots: 6,
    chapterNodes: []
  }) === 5,
  'Existing Chapter 4 must not exceed five active squads while the later migration is pending.'
);
expect(
  getCampaignActiveSquadCap({
    faction: 'human',
    chapterNumber: 5,
    stageFormationSlots: 6,
    chapterNodes: []
  }) === 6,
  'Chapter 5+ must cap at six active squads.'
);
expect(
  getCampaignActiveSquadCap({
    faction: 'elf',
    chapterNumber: 2,
    stageFormationSlots: 3,
    chapterNodes: []
  }) === 3,
  'Faction campaigns not yet migrated must retain their stage-driven cap.'
);

const earlyBattles: EncounterId[] = [
  'ch1_hold_crossing',
  'ch1_spears_at_dawn',
  'ch1_cut_off_captain',
  'ch1_broken_road',
  'ch1_reclaim_outpost',
  'ch2_strength_in_numbers',
  'ch2_riders_on_road',
  'ch2_no_army_fights_forever',
  'ch2_long_way_around',
  'ch2_iron_line',
  'ch2_break_their_hold'
];

for (const encounterId of earlyBattles) {
  expect(Boolean(encounters[encounterId]), encounterId + ' is missing from live encounter data.');
}

expect(
  getEnemyFormationTactic('ch2_iron_line').formationShapeId === 'iron_wall_501',
  'The Iron Line must visibly use the Iron Wall formation.'
);
expect(
  getEnemyFormationTactic('ch2_break_their_hold').formationShapeId === 'iron_wall_501',
  'Break Their Hold must retain the Iron Wall finale identity.'
);
expect(
  getEnemyFormationTactic('ch2_long_way_around').formationShapeId === 'skirmish_screen_243',
  'The Long Way Around must retain a flank/skirmish staging identity.'
);

expect(
  shouldRequestChapterOneReview({
    activeFaction: 'human',
    activeView: 'kingdom',
    lastBattleResultId: 'ch1_reclaim_outpost_result',
    reviewPromptShown: false,
    tutorialActive: false
  }),
  'Review prompt must fire only after the new Chapter 1 finale returns to Kingdom.'
);
expect(
  !shouldRequestChapterOneReview({
    activeFaction: 'human',
    activeView: 'kingdom',
    lastBattleResultId: 'ch1_broken_road_result',
    reviewPromptShown: false,
    tutorialActive: false
  }),
  'Review prompt must not interrupt an earlier Chapter 1 reward flow.'
);

console.log(
  'PASS: live Chapters 1-2 use the roadmap mission lists, staged 2->3 squad cap, named formation beats and new Chapter 1 review trigger.'
);
