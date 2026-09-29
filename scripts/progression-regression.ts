import {
  MAX_MAJOR_RESEARCH_GEM_COST,
  MAX_STANDARD_RESEARCH_HOURS,
  MAJOR_RESEARCH_REWARDED_ADS,
  campaignProgression,
  canStartResearch,
  familyUnlocks,
  fantasyRecruitTemplates,
  fantasyStoryRewardUnits,
  getArmyDeploymentCapacity,
  getFantasyCombatEdge,
  getFantasyRecruitTemplates,
  getFlyingCombatEdge,
  getFantasyStoryRewardUnit,
  getResearchGemFinishCost,
  getResearchRemainingHours,
  getUnitDeploymentCapacity,
  researchDefinitions,
  unitHasBattleTag
} from '../src/game/progression';
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

function runPlayableMagicCoverage() {
  expect(
    fantasyRecruitTemplates.filter(
      template => template.family === 'magic'
    ).length === 6,
    'Chapter 4 needs exactly two repeatable magic branches per faction.'
  );

  for (const faction of ['human', 'elf', 'orc'] as const) {
    const templates = getFantasyRecruitTemplates(
      faction,
      'magic'
    );
    expect(
      templates.length === 2,
      faction +
        ' must expose two repeatable Chapter 4 magic branches.'
    );

    for (const template of templates) {
      expect(
        template.battleTags.includes('magic'),
        template.id + ' is missing the magic battle tag.'
      );
      expect(
        researchDefinitions.some(
          research =>
            research.id === template.researchId &&
            research.faction === faction &&
            research.family === 'magic'
        ),
        template.id + ' is not linked to valid magic research.'
      );
      expect(
        Object.values(template.cost).some(
          amount => (amount ?? 0) > 0
        ),
        template.id + ' must have a real recruitment cost.'
      );
    }
  }

  const mageTemplate = fantasyRecruitTemplates.find(
    template => template.id === 'human_mage'
  );
  expect(Boolean(mageTemplate), 'Human Mage template is missing.');
  if (!mageTemplate) return;

  const mage = {
    id: 'test_mage',
    name: 'Test Mage',
    className: mageTemplate.className,
    faction: mageTemplate.faction,
    role: mageTemplate.role,
    tier: mageTemplate.tier,
    level: mageTemplate.level,
    hp: mageTemplate.hp,
    attack: mageTemplate.attack,
    armor: mageTemplate.armor,
    speed: mageTemplate.speed,
    battleTags: mageTemplate.battleTags,
    deploymentCapacity: 1 as const
  };
  const shield = {
    id: 'test_guard',
    name: 'Test Guard',
    className: 'Guard',
    faction: 'human' as const,
    role: 'frontline' as const,
    tier: 4,
    level: 7,
    hp: 150,
    attack: 18,
    armor: 14,
    speed: 8
  };

  const shieldEdge = getFantasyCombatEdge(
    [mage, shield, { ...shield, id: 'test_guard_2' }],
    'shield_host'
  );
  const wardedEdge = getFantasyCombatEdge(
    [mage, shield, { ...shield, id: 'test_guard_2' }],
    'warded_host'
  );
  const exposedEdge = getFantasyCombatEdge(
    [mage],
    'shock_warband'
  );

  expect(
    Boolean(
      shieldEdge &&
      shieldEdge.attackMultiplier > 1 &&
      shieldEdge.favorable
    ),
    'Magic must create a modest edge into Shield Hosts.'
  );
  expect(
    Boolean(
      wardedEdge &&
      wardedEdge.attackMultiplier < 1 &&
      !wardedEdge.favorable
    ),
    'Warded Hosts must counter direct magic pressure.'
  );
  expect(
    Boolean(
      exposedEdge &&
      exposedEdge.incomingDamageMultiplier > 1 &&
      !exposedEdge.favorable
    ),
    'Unprotected casters must be vulnerable to shock pressure.'
  );
}

function runPlayableFlyingCoverage() {
  const flyingTemplates = fantasyRecruitTemplates.filter(
    template => template.family === 'flying'
  );
  expect(
    flyingTemplates.length === 7,
    'Chapter 5 needs seven faction-specific repeatable flying branches.'
  );

  const expectedCounts = {
    human: 3,
    elf: 2,
    orc: 2
  } as const;

  for (const faction of ['human', 'elf', 'orc'] as const) {
    const templates = getFantasyRecruitTemplates(
      faction,
      'flying'
    );
    expect(
      templates.length === expectedCounts[faction],
      faction + ' has the wrong number of flying training branches.'
    );
    templates.forEach(template => {
      expect(
        template.battleTags.includes('flying'),
        template.id + ' is missing the flying battle tag.'
      );
      expect(
        researchDefinitions.some(
          research =>
            research.id === template.researchId &&
            research.faction === faction &&
            research.family === 'flying'
        ),
        template.id + ' is not linked to valid flying research.'
      );
    });
  }

  const riderTemplate = flyingTemplates.find(
    template => template.id === 'human_griffin_rider'
  );
  expect(
    Boolean(riderTemplate),
    'Human Griffin Rider template is missing.'
  );
  if (!riderTemplate) return;

  const rider = {
    id: 'test_griffin',
    name: 'Test Griffin Rider',
    className: riderTemplate.className,
    faction: riderTemplate.faction,
    role: riderTemplate.role,
    tier: riderTemplate.tier,
    level: riderTemplate.level,
    hp: riderTemplate.hp,
    attack: riderTemplate.attack,
    armor: riderTemplate.armor,
    speed: riderTemplate.speed,
    battleTags: riderTemplate.battleTags,
    deploymentCapacity: 1 as const
  };

  const shieldEdge = getFlyingCombatEdge(
    [rider],
    'shield_host'
  );
  const antiAirEdge = getFlyingCombatEdge(
    [rider],
    'missile_company'
  );

  expect(
    Boolean(
      shieldEdge &&
      shieldEdge.attackMultiplier > 1 &&
      shieldEdge.favorable
    ),
    'Flying squads must pressure protected ground backlines.'
  );
  expect(
    Boolean(
      antiAirEdge &&
      antiAirEdge.incomingDamageMultiplier > 1 &&
      !antiAirEdge.favorable
    ),
    'Missile Companies must remain a meaningful anti-air counter.'
  );
}

function main() {
  runCampaignCurveCoverage();
  runChapterTwoCoverage();
  runFamilyGateCoverage();
  runResearchCoverage();
  runBattleTagAndCapacityCoverage();
  runPlayableMagicCoverage();
  runPlayableFlyingCoverage();

  if (failures.length > 0) {
    console.error('\nFantasy progression regression failures:');
    failures.forEach(failure => console.error('- ' + failure));
    process.exitCode = 1;
    return;
  }

  console.log(
    'PASS: campaign growth, fantasy gates, research rules, playable magic and flying branches, counterplay, battle tags and deployment capacity remain inside the intended guardrails.'
  );
}

main();
