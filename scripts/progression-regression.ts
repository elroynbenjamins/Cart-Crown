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
      stage.endSquadCap <= 6,
      'Active squad cap must remain six or lower.'
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
    campaignProgression[0]?.startSquadCap === 2 &&
      campaignProgression[0]?.endSquadCap === 3,
    'Chapter 1 must remain a 2→3 squad progression.'
  );
  expect(
    campaignProgression[1]?.endSquadCap === 4,
    'Chapter 2 must end at four active squads.'
  );
  expect(
    campaignProgression[2]?.endSquadCap === 5,
    'Chapter 3 must end at five active squads.'
  );
  expect(
    campaignProgression[3]?.endSquadCap === 6,
    'Chapter 4 must reach the six-squad long-term cap.'
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
    'PASS: Chapters 1-8, fantasy family gates, 24h/30-gem/3-ad research rules, non-bypassable story gates, battle tags and deployment capacity remain inside the intended guardrails.'
  );
}

main();
