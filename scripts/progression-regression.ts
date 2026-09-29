import {
  MAX_MAJOR_RESEARCH_GEM_COST,
  MAX_STANDARD_RESEARCH_HOURS,
  MAJOR_RESEARCH_REWARDED_ADS,
  campaignProgression,
  canStartResearch,
  familyUnlocks,
  fantasyStoryRewardUnits,
  getArmyDeploymentCapacity,
  getFantasyStoryRewardUnit,
  getResearchGemFinishCost,
  getResearchRemainingHours,
  getUnitDeploymentCapacity,
  researchDefinitions,
  unitHasBattleTag
} from '../src/game/progression';
import {
  chapterOneCampaign,
  getChapterOneMissionName,
  getChapterOneRosterCap,
  getChapterOneSquadCap
} from '../src/game/chapter1Campaign';
import {
  chapterOneFifthReinforcements,
  chapterTwoSeventhReinforcements
} from '../src/game/earlyReinforcements';
import { getCampaignCapacity } from '../src/game/campaignCapacity';
import {
  chapterTwoCampaign,
  chapterTwoTerritoryRoutes,
  getChapterTwoRosterCap,
  getChapterTwoSquadCap,
  getChapterTwoTerritoryName
} from '../src/game/chapter2Campaign';

const failures: string[] = [];

function expect(condition: unknown, message: string) {
  if (!condition) failures.push(message);
}

function runCampaignCurveCoverage() {
  expect(
    campaignProgression.length === 8,
    'Campaign progression must define Chapters 1-8.'
  );

  campaignProgression.forEach((stage, index) => {
    expect(
      stage.chapter === index + 1,
      'Campaign chapters must stay contiguous and ordered.'
    );
    expect(
      stage.endSquadCap >= stage.startSquadCap,
      'A chapter may not reduce the active squad cap.'
    );
    expect(
      stage.endSquadCap <= 9,
      'Active squad cap must remain nine or lower.'
    );
    expect(
      stage.endRosterCap >= stage.startRosterCap,
      'A chapter may not reduce roster capacity.'
    );
    expect(
      stage.startRosterCap >= stage.startSquadCap &&
        stage.endRosterCap >= stage.endSquadCap,
      'Roster capacity may not fall below deployed squad capacity.'
    );
  });

  const expectedFamilies = new Map([
    [4, 'magic'],
    [5, 'flying'],
    [7, 'large'],
    [8, 'hybrid']
  ]);

  for (const [chapter, family] of expectedFamilies) {
    expect(
      campaignProgression.find(stage => stage.chapter === chapter)?.newFamily === family,
      'Chapter ' + chapter + ' must introduce ' + family + '.'
    );
  }

  expect(
    campaignProgression[0]?.startSquadCap === 3 &&
      campaignProgression[0]?.endSquadCap === 5 &&
      campaignProgression[0]?.startRosterCap === 5 &&
      campaignProgression[0]?.endRosterCap === 9,
    'Chapter 1 must remain a 3→5 deployment and 5→9 roster progression.'
  );
  expect(
    campaignProgression[1]?.startSquadCap === 5 &&
      campaignProgression[1]?.endSquadCap === 7 &&
      campaignProgression[1]?.endRosterCap === 16,
    'Chapter 2 must remain a 5→7 deployment progression ending near 16 roster slots.'
  );
  expect(
    campaignProgression[2]?.startSquadCap === 7 &&
      campaignProgression[2]?.endSquadCap === 9 &&
      campaignProgression[2]?.endRosterCap === 30,
    'Chapter 3 must reach the nine-squad battlefield and roughly 30 roster slots.'
  );

  campaignProgression.slice(3).forEach(stage => {
    expect(
      stage.startSquadCap === 9 && stage.endSquadCap === 9,
      'Chapter ' + stage.chapter + ' must keep the nine-squad long-term battlefield cap.'
    );
  });
}


function runChapterOneCoverage() {
  expect(
    chapterOneCampaign.length === 10,
    'Chapter 1 must contain exactly ten authored main missions.'
  );

  chapterOneCampaign.forEach((mission, index) => {
    expect(
      mission.order === index + 1,
      'Chapter 1 mission order must remain contiguous.'
    );
    expect(
      mission.mandatory === true,
      mission.id + ' must remain part of the authored Chapter 1 backbone.'
    );
    expect(
      mission.rosterCap >= mission.deploymentCap,
      mission.id + ' roster capacity fell below deployment capacity.'
    );
  });

  expect(
    getChapterOneSquadCap([]) === 3 &&
      getChapterOneRosterCap([]) === 5,
    'Chapter 1 must begin at 3 deployed / 5 roster.'
  );
  expect(
    getChapterOneSquadCap(['ch1_fourth_squad']) === 4 &&
      getChapterOneRosterCap(['ch1_fourth_squad']) === 7,
    'The fourth-squad milestone must establish 4 deployed / 7 roster.'
  );
  expect(
    getChapterOneSquadCap(['ch1_forward_camp']) === 5 &&
      getChapterOneRosterCap(['ch1_forward_camp']) === 9,
    'The forward-camp milestone must establish 5 deployed / 9 roster.'
  );

  expect(
    getChapterOneMissionName('ch1_boss', 'human') === 'The Toll Captain' &&
      getChapterOneMissionName('ch1_boss', 'elf') === 'The Hollow Warden' &&
      getChapterOneMissionName('ch1_boss', 'orc') === 'The Blamecaller',
    'Chapter 1 faction boss identities drifted.'
  );

  const expectedFactions = ['human', 'elf', 'orc'] as const;
  for (const faction of expectedFactions) {
    const fifth = chapterOneFifthReinforcements[faction];
    const seventh = chapterTwoSeventhReinforcements[faction];

    expect(
      fifth.faction === faction && fifth.deploymentCapacity === 1,
      faction + ' Chapter 1 fifth reinforcement is invalid.'
    );
    expect(
      seventh.faction === faction &&
        seventh.role === 'support' &&
        seventh.deploymentCapacity === 1,
      faction + ' Chapter 2 seventh reinforcement must remain a non-magical support squad.'
    );
    expect(
      !seventh.battleTags?.includes('magic'),
      faction + ' Chapter 2 support may not introduce Magic before Chapter 4.'
    );
  }

  const humanOpening = getCampaignCapacity('human', 1, [
    { id: 'node_1', name: 'The Last Three', type: 'story', completed: true },
    { id: 'node_2', name: 'Hold the Road', type: 'battle', completed: false, current: true }
  ]);
  const humanElite = getCampaignCapacity('human', 1, [
    { id: 'node_3', name: 'Marked Raiders', type: 'event', completed: true },
    { id: 'node_4', name: 'Mercenary Patrol', type: 'elite', completed: false, current: true }
  ]);
  const humanBoss = getCampaignCapacity('human', 1, [
    { id: 'node_5', name: 'Refugee Camp', type: 'supply', completed: true },
    { id: 'node_6', name: 'The Toll Captain', type: 'boss', completed: false, current: true }
  ]);

  expect(
    humanOpening.deploymentCap === 3 &&
      humanOpening.rosterCap === 5 &&
      humanElite.deploymentCap === 4 &&
      humanElite.rosterCap === 7 &&
      humanBoss.deploymentCap === 5 &&
      humanBoss.rosterCap === 9,
    'Runtime Chapter 1 capacity derivation no longer matches the authored 3→4→5 curve.'
  );
}

function runChapterTwoCoverage() {
  expect(
    chapterTwoCampaign.length === 10,
    'Chapter 2 must contain exactly ten authored main missions.'
  );

  chapterTwoCampaign.forEach((mission, index) => {
    expect(
      mission.order === index + 1,
      'Chapter 2 mission order must remain contiguous.'
    );
    expect(
      mission.mandatory === true,
      mission.id + ' must remain part of the authored Chapter 2 backbone.'
    );
  });

  const expectedNames = [
    'They Found Us',
    'Beyond the Fires',
    'Three Roads',
    'Horse and Rider',
    'Brace!',
    'The Long Haul',
    'Those Who Remain',
    'Take the Watch',
    'Build Something Worth Defending',
    "The Rider's Banner"
  ];
  expect(
    chapterTwoCampaign.every((mission, index) => mission.name === expectedNames[index]),
    'Chapter 2 authored mission names or order drifted.'
  );

  expect(
    chapterTwoCampaign[0]?.deploymentCap === 5,
    'Chapter 2 must open at five deployed squads.'
  );
  expect(
    chapterTwoCampaign.find(mission => mission.id === 'ch2_beyond_fires')?.deploymentCap === 6,
    'Beyond the Fires must unlock/use the sixth deployment slot.'
  );
  expect(
    chapterTwoCampaign.find(mission => mission.id === 'ch2_take_watch')?.deploymentCap === 7 &&
      chapterTwoCampaign.at(-1)?.deploymentCap === 7,
    'Take the Watch must establish the seven-squad Chapter 2 end state.'
  );

  expect(getChapterTwoSquadCap([]) === 5, 'Chapter 2 squad cap must begin at five.');
  expect(
    getChapterTwoSquadCap(['ch2_beyond_fires']) === 6,
    'Beyond the Fires must raise the Chapter 2 squad cap to six.'
  );
  expect(
    getChapterTwoSquadCap(['ch2_beyond_fires', 'ch2_take_watch']) === 7,
    'Take the Watch must raise the Chapter 2 squad cap to seven.'
  );

  expect(getChapterTwoRosterCap([]) === 9, 'Chapter 2 roster cap must begin at nine.');
  expect(
    getChapterTwoRosterCap(['ch2_beyond_fires']) === 12,
    'Beyond the Fires must expand the roster to twelve.'
  );
  expect(
    getChapterTwoRosterCap(['ch2_beyond_fires', 'ch2_take_watch']) === 16,
    'Take the Watch must expand the roster to sixteen.'
  );

  expect(
    chapterTwoTerritoryRoutes.length === 3,
    'Chapter 2 must offer exactly three first-route priorities.'
  );
  expect(
    new Set(chapterTwoTerritoryRoutes.map(route => route.benefit)).size === 3,
    'Trade, materials and mounts must each have a distinct Chapter 2 route.'
  );

  expect(
    getChapterTwoTerritoryName('trade_route', 'human') === "Old King's Road" &&
      getChapterTwoTerritoryName('resource_route', 'human') === 'Iron Ford' &&
      getChapterTwoTerritoryName('grazing_route', 'human') === 'Greenfields',
    'Human Chapter 2 route names drifted.'
  );
  expect(
    getChapterTwoTerritoryName('trade_route', 'elf') === 'Silver Path' &&
      getChapterTwoTerritoryName('resource_route', 'elf') === 'Stonegrove' &&
      getChapterTwoTerritoryName('grazing_route', 'elf') === 'Windmeadow',
    'Elf Chapter 2 route names drifted.'
  );
  expect(
    getChapterTwoTerritoryName('trade_route', 'orc') === "Trader's Cut" &&
      getChapterTwoTerritoryName('resource_route', 'orc') === 'Blackstone Pass' &&
      getChapterTwoTerritoryName('grazing_route', 'orc') === 'Redgrass Plains',
    'Orc Chapter 2 route names drifted.'
  );
}

function runFamilyGateCoverage() {
  const expectedChapter = {
    magic: 4,
    flying: 5,
    large: 7,
    hybrid: 8
  } as const;

  expect(
    familyUnlocks.length === 12,
    'Each of the three factions needs four fantasy-family story gates.'
  );

  for (const unlock of familyUnlocks) {
    expect(
      unlock.chapterRequired === expectedChapter[unlock.family],
      unlock.faction + ' ' + unlock.family + ' unlock moved to the wrong chapter.'
    );
    expect(
      unlock.campaignGateCanBeBypassed === false,
      unlock.faction + ' ' + unlock.family + ' story gate became bypassable.'
    );

    const reward = getFantasyStoryRewardUnit(
      unlock.firstStoryRewardUnitId
    );
    expect(
      Boolean(reward),
      unlock.firstStoryRewardUnitId + ' story reward unit is missing.'
    );
    expect(
      reward?.faction === unlock.faction,
      unlock.firstStoryRewardUnitId + ' belongs to the wrong faction.'
    );
    expect(
      reward?.className === unlock.firstStoryRewardClass,
      unlock.firstStoryRewardUnitId + ' has the wrong story-reward class.'
    );
  }
}

function runResearchCoverage() {
  for (const research of researchDefinitions) {
    expect(
      research.durationHours > 0 &&
        research.durationHours <= MAX_STANDARD_RESEARCH_HOURS,
      research.id + ' exceeds the 24-hour standard research cap.'
    );
    expect(
      research.baseGemFinishCost > 0 &&
        research.baseGemFinishCost <= MAX_MAJOR_RESEARCH_GEM_COST,
      research.id + ' exceeds the 30-gem major unlock ceiling.'
    );
    expect(
      research.rewardedAdsToComplete === MAJOR_RESEARCH_REWARDED_ADS,
      research.id + ' no longer uses the three-ad completion rule.'
    );

    expect(
      !canStartResearch(
        research,
        research.chapterRequired,
        []
      ),
      research.id + ' can bypass its story gate.'
    );
    expect(
      !canStartResearch(
        research,
        research.chapterRequired - 1,
        [research.storyGateId]
      ),
      research.id + ' can bypass its campaign chapter.'
    );
    expect(
      canStartResearch(
        research,
        research.chapterRequired,
        [research.storyGateId]
      ),
      research.id + ' cannot start after meeting both campaign gates.'
    );

    const startCost = getResearchGemFinishCost(
      research,
      research.durationHours
    );
    const halfwayCost = getResearchGemFinishCost(
      research,
      research.durationHours / 2
    );
    const almostDoneCost = getResearchGemFinishCost(
      research,
      Math.min(0.5, research.durationHours)
    );

    expect(
      startCost === research.baseGemFinishCost,
      research.id + ' start gem cost drifted from its configured price.'
    );
    expect(
      halfwayCost < startCost,
      research.id + ' gem finish price does not fall as time passes.'
    );
    expect(
      almostDoneCost < halfwayCost || halfwayCost === 1,
      research.id + ' near-complete finish cost is not lower than halfway.'
    );

    expect(
      getResearchRemainingHours(research, 0, 3) === 0,
      research.id + ' is not fully completable by three rewarded ads.'
    );
    expect(
      getResearchRemainingHours(research, 0, 1) <
        research.durationHours,
      research.id + ' first rewarded ad gives no acceleration.'
    );
    expect(
      getResearchRemainingHours(research, 0, 0) ===
        research.durationHours,
      research.id + ' changes duration without time or ads.'
    );
  }

  const majorResearch = researchDefinitions.filter(
    research => research.durationHours === 24
  );
  expect(
    majorResearch.length >= 9,
    'Major fantasy-family research coverage is unexpectedly thin.'
  );
  majorResearch.forEach(research => {
    expect(
      research.baseGemFinishCost === 30,
      research.id + ' should cost 30 gems when instantly finished from 24h.'
    );
  });
}

function runBattleTagAndCapacityCoverage() {
  const uniqueIds = new Set(
    fantasyStoryRewardUnits.map(unit => unit.id)
  );
  expect(
    uniqueIds.size === fantasyStoryRewardUnits.length,
    'Fantasy story reward unit ids must remain unique.'
  );

  for (const unit of fantasyStoryRewardUnits) {
    expect(
      getUnitDeploymentCapacity(unit) >= 1,
      unit.id + ' has invalid deployment capacity.'
    );
  }

  const magic = fantasyStoryRewardUnits.filter(unit =>
    unitHasBattleTag(unit, 'magic')
  );
  const flying = fantasyStoryRewardUnits.filter(unit =>
    unitHasBattleTag(unit, 'flying')
  );
  const large = fantasyStoryRewardUnits.filter(unit =>
    unitHasBattleTag(unit, 'large')
  );

  expect(magic.length >= 6, 'Magic unit coverage is missing.');
  expect(flying.length >= 6, 'Flying unit coverage is missing.');
  expect(large.length === 3, 'Each faction needs one Chapter 7 Large story reward.');

  large.forEach(unit => {
    expect(
      getUnitDeploymentCapacity(unit) === 2,
      unit.id + ' must consume two deployment capacity.'
    );
  });

  const legendary = fantasyStoryRewardUnits.filter(
    unit => unit.tier >= 8
  );
  legendary.forEach(unit => {
    expect(
      unitHasBattleTag(unit, 'magic') &&
        unitHasBattleTag(unit, 'flying'),
      unit.id + ' must remain a Magic + Flying hybrid.'
    );
    expect(
      getUnitDeploymentCapacity(unit) === 2,
      unit.id + ' legendary hybrid must consume two deployment capacity.'
    );
  });

  const sampleNormal = fantasyStoryRewardUnits.find(
    unit => unit.id === 'hum_apprentice'
  );
  const sampleLarge = fantasyStoryRewardUnits.find(
    unit => unit.id === 'hum_stone_golem'
  );
  expect(
    Boolean(sampleNormal && sampleLarge),
    'Capacity regression sample units are missing.'
  );
  if (sampleNormal && sampleLarge) {
    expect(
      getArmyDeploymentCapacity([
        sampleNormal,
        sampleNormal,
        sampleLarge
      ]) === 4,
      'Army deployment capacity no longer counts Large units as two.'
    );
  }
}

function main() {
  runCampaignCurveCoverage();
  runChapterOneCoverage();
  runChapterTwoCoverage();
  runFamilyGateCoverage();
  runResearchCoverage();
  runBattleTagAndCapacityCoverage();

  if (failures.length > 0) {
    console.error('\nFantasy progression regression failures:');
    failures.forEach(failure => console.error('- ' + failure));
    process.exitCode = 1;
    return;
  }

  console.log(
    'PASS: authored Chapters 1-2, 3→5→7→9 campaign growth, early reinforcements, fantasy family gates, 24h/30-gem/3-ad research rules, battle tags and deployment capacity remain inside the intended guardrails.'
  );
}

main();
