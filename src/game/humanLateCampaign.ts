import type {
  ChapterNode,
  EncounterDefinition,
  FormationShapeId,
  ResourceWallet
} from './types';

export type HumanLateChapter = 5 | 6 | 7;

export type HumanLateEncounterId =
  | 'human_ch5_m01'
  | 'human_ch5_m03'
  | 'human_ch5_m04'
  | 'human_ch5_m07'
  | 'human_ch5_m08'
  | 'human_ch5_m09'
  | 'human_ch5_m10'
  | 'human_ch5_m11'
  | 'human_ch6_m01'
  | 'human_ch6_m02'
  | 'human_ch6_m04'
  | 'human_ch6_m05'
  | 'human_ch6_m07'
  | 'human_ch6_m08'
  | 'human_ch6_m09'
  | 'human_ch6_m10'
  | 'human_ch6_m11'
  | 'human_ch7_m01'
  | 'human_ch7_m02'
  | 'human_ch7_m03'
  | 'human_ch7_m04'
  | 'human_ch7_m06'
  | 'human_ch7_m07'
  | 'human_ch7_m08'
  | 'human_ch7_m10'
  | 'human_ch7_m11';

export type HumanLateMissionDefinition = {
  id: string;
  chapter: HumanLateChapter;
  order: number;
  name: string;
  type: ChapterNode['type'];
  briefing: string;
  unlockText: string;
  reward: Partial<ResourceWallet>;
  encounterId?: HumanLateEncounterId;
};

const mission = (
  chapter: HumanLateChapter,
  order: number,
  name: string,
  type: ChapterNode['type'],
  briefing: string,
  unlockText: string,
  reward: Partial<ResourceWallet>,
  encounterId?: HumanLateEncounterId
): HumanLateMissionDefinition => ({
  id: 'ch' + chapter + '_node_' + order,
  chapter,
  order,
  name,
  type,
  briefing,
  unlockText,
  reward,
  encounterId
});

export const humanLateMissions: HumanLateMissionDefinition[] = [
  mission(5, 1, 'Too Many Fronts', 'battle',
    'Five squads are forced to answer pressure in the center and on both wings. The battle is designed to make the final deployment slot feel earned.',
    'Prove the army is ready to expand beyond five active squads.',
    { gold: 135, iron: 10, provisions: 6 }, 'human_ch5_m01'),
  mission(5, 2, 'The Sixth Banner', 'upgrade',
    'Greenkeep raises its final normal campaign banner. Six active squads are now the permanent campaign cap.',
    'Sixth active squad and mature six-squad formations.',
    { gold: 70, wood: 24, stone: 18 }),
  mission(5, 3, 'Rally the Line', 'battle',
    'Multiple sections of the formation begin under pressure. Rally becomes an emergency stabilization tool rather than a heal.',
    'Rally commander order.',
    { gold: 145, iron: 11, provisions: 7 }, 'human_ch5_m03'),
  mission(5, 4, 'Above the Shieldwall', 'battle',
    'The first true flying threat bypasses ordinary frontline protection and hunts valuable rear squads.',
    'Flying threat family and aerial target warnings.',
    { gold: 155, wood: 10, iron: 9, provisions: 7 }, 'human_ch5_m04'),
  mission(5, 5, 'Answers to the Sky', 'upgrade',
    'The army formalizes anti-air doctrine after surviving its first aerial attack.',
    'Anti-air research branch and reliable counters to Flying units.',
    { gold: 80, iron: 14, provisions: 5 }),
  mission(5, 6, "Commander's Hand", 'event',
    'Your chosen Commander turns doctrine into a unique active battlefield order while the interface stays limited to three meaningful combat actions.',
    'First Commander-specific active order.',
    { gold: 90, provisions: 8 }),
  mission(5, 7, 'Three Lines Deep', 'battle',
    'A mature Layered Core uses a screen, reinforcement layer and protected specialists in the rear.',
    'Advanced Layered Core enemy formation.',
    { gold: 170, stone: 15, iron: 12, provisions: 7 }, 'human_ch5_m07'),
  mission(5, 8, 'Hammer and Wing', 'battle',
    'A heavy center assault and fast cavalry wing arrive together. Overcommitting to either threat exposes the other.',
    'Combined breakthrough + flank threat readability.',
    { gold: 180, iron: 15, provisions: 8 }, 'human_ch5_m08'),
  mission(5, 9, 'The Strongest Army?', 'battle',
    'The highest displayed Army Power is deliberately a poor matchup. A slightly weaker counter composition should perform better.',
    'Army Power is an estimate, not an automatic solution.',
    { gold: 185, iron: 12, provisions: 9 }, 'human_ch5_m09'),
  mission(5, 10, "Crown's Muster", 'operation',
    'Three threat profiles are condensed into one operation. The emphasis is roster depth, reserves and surviving attrition.',
    'Multi-battle operation language and reserve planning.',
    { gold: 205, wood: 20, iron: 16, provisions: 10 }, 'human_ch5_m10'),
  mission(5, 11, 'Battle for the Crownroad', 'boss',
    'The complete six-squad combat loop is tested against an elite center, mounted wing, aerial pressure and a competent reserve.',
    'Chapter 5 complete and the road to Arcane Warfare.',
    { gold: 330, wood: 150, stone: 110, iron: 42, provisions: 14 }, 'human_ch5_m11'),

  mission(6, 1, 'Strange Fire', 'battle',
    'Ashen spellfire appears on the field for the first time. Magic is introduced as battlefield manipulation rather than raw ranged damage.',
    'Magic threat family.',
    { gold: 190, iron: 14, provisions: 8 }, 'human_ch6_m01'),
  mission(6, 2, 'The First Ward', 'battle',
    'Enemy wards absorb and redirect pressure until the army attacks the protected structure in the right order.',
    'Ward protection and magical shielding readability.',
    { gold: 195, stone: 16, iron: 13, provisions: 8 }, 'human_ch6_m02'),
  mission(6, 3, 'Call the Arcanist', 'event',
    'Greenkeep formally adds arcane specialists to its war doctrine instead of treating magic as an unexplained enemy exception.',
    'Human Magic research family.',
    { gold: 100, wood: 10, provisions: 8 }),
  mission(6, 4, 'Power Has a Price', 'battle',
    'Powerful magic creates openings but also destabilizes the formation around the caster. Positioning becomes part of spell strength.',
    'Magic risk/reward positioning.',
    { gold: 205, iron: 15, provisions: 9 }, 'human_ch6_m04'),
  mission(6, 5, 'Break the Spell', 'battle',
    'A protected caster must be reached through conventional troops while wards keep shifting the efficient target.',
    'Anti-magic target priority.',
    { gold: 215, stone: 14, iron: 16, provisions: 9 }, 'human_ch6_m05'),
  mission(6, 6, 'Paths of the Arcane', 'choice',
    'The army chooses whether its first mature arcane doctrine favors protection and control or aggressive disruption. The alternate path remains available later.',
    'Arcane doctrine preference.',
    { gold: 110, iron: 8 }),
  mission(6, 7, 'Fire from Above', 'battle',
    'Flying pressure and magic arrive together, forcing the player to protect the rear while still disrupting spell support.',
    'Combined Flying + Magic threat.',
    { gold: 225, iron: 18, provisions: 10 }, 'human_ch6_m07'),
  mission(6, 8, 'The Silent Ground', 'battle',
    'Suppression effects reduce the value of familiar active orders and reward a stable formation that can function without constant intervention.',
    'Order suppression encounter.',
    { gold: 230, stone: 16, provisions: 10 }, 'human_ch6_m08'),
  mission(6, 9, 'Wards and Steel', 'battle',
    'Conventional elite infantry protects arcane support. Neither pure anti-magic nor pure frontline power solves the encounter alone.',
    'Arcane combined-arms formation.',
    { gold: 240, iron: 20, provisions: 10 }, 'human_ch6_m09'),
  mission(6, 10, 'The Arcane General', 'battle',
    'An enemy commander actively changes which ward and lane receives support, creating the first adaptive magical command battle.',
    'Adaptive magical commander behavior.',
    { gold: 255, stone: 18, iron: 20, provisions: 11 }, 'human_ch6_m10'),
  mission(6, 11, 'Siege of the Glass Keep', 'boss',
    'The Glass Keep combines protected casters, flying pressure, layered troops and changing wards in the final Arcane Warfare test.',
    'Chapter 6 complete and the Blackstone siege road.',
    { gold: 390, wood: 170, stone: 135, iron: 50, provisions: 16 }, 'human_ch6_m11'),

  mission(7, 1, 'The Stone Road', 'battle',
    'The final campaign opens on fortified approaches built to slow a six-squad army before it can reach the walls.',
    'Blackstone siege approach.',
    { gold: 245, stone: 20, iron: 18, provisions: 10 }, 'human_ch7_m01'),
  mission(7, 2, 'Break the Gate', 'siege',
    'The army attacks a defended gate while siege pressure and ordinary formation integrity must be managed at the same time.',
    'Siege objective: breach a fortified gate.',
    { gold: 260, wood: 16, stone: 18, iron: 22, provisions: 10 }, 'human_ch7_m02'),
  mission(7, 3, 'Protect the Engineers', 'defense',
    'Enemy sorties target the engineers rather than the strongest squad. The formation must protect an objective instead of simply winning trades.',
    'Defense objective protection.',
    { gold: 255, wood: 20, iron: 20, provisions: 12 }, 'human_ch7_m03'),
  mission(7, 4, 'Fire on the Walls', 'siege',
    'Ranged pressure, siege engines and wall defenders create lanes that matter for both protection and damage output.',
    'Wall pressure and siege-support targeting.',
    { gold: 270, stone: 20, iron: 24, provisions: 11 }, 'human_ch7_m04'),
  mission(7, 5, 'Two Ways In', 'choice',
    'Choose a direct breach or a slower undermining route. Both remain viable and change only the immediate tactical emphasis.',
    'Siege route preference.',
    { gold: 120, wood: 14, stone: 10 }),
  mission(7, 6, 'Under Their Towers', 'siege',
    'Tower fire punishes static formations, forcing the army to solve protection while continuing to advance.',
    'Tower threat and siege movement pressure.',
    { gold: 280, stone: 22, iron: 25, provisions: 12 }, 'human_ch7_m06'),
  mission(7, 7, 'The Enemy at Our Walls', 'defense',
    'A counterattack reaches Greenkeep-held siege lines. The player must defend captured ground without losing the offensive position.',
    'Counter-siege defense.',
    { gold: 285, wood: 16, iron: 24, provisions: 13 }, 'human_ch7_m07'),
  mission(7, 8, 'Hold Until Dawn', 'defense',
    'A long night assault tests reserves and readiness. The goal is stability under repeated pressure rather than a fast damage race.',
    'Attrition defense and reserve endurance.',
    { gold: 295, provisions: 16, iron: 22 }, 'human_ch7_m08'),
  mission(7, 9, 'Siegecraft', 'upgrade',
    'Recovered engineering notes turn the siege lessons into permanent doctrine for the final urban assault.',
    'Final siegecraft upgrade package.',
    { gold: 130, wood: 20, stone: 16, iron: 12 }),
  mission(7, 10, 'The Breached City', 'operation',
    'The army fights through several urban pressure points as one operation, with no new mechanic introduced this late.',
    'Urban operation and final preparation check.',
    { gold: 320, wood: 18, stone: 20, iron: 28, provisions: 14 }, 'human_ch7_m10'),
  mission(7, 11, 'Fall of Blackstone', 'boss',
    'Every mature Human system comes together in the final campaign battle: six squads, Commander doctrine, counters, siege pressure, reserves and arcane threats.',
    'Human campaign complete and the Oath Seal secured.',
    { gold: 520, wood: 220, stone: 180, iron: 70, provisions: 20 }, 'human_ch7_m11')
];

export const humanLateChapterNodes: Record<HumanLateChapter, ChapterNode[]> = {
  5: humanLateMissions.filter(m => m.chapter === 5).map((m, index) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    completed: false,
    current: index === 0
  })),
  6: humanLateMissions.filter(m => m.chapter === 6).map((m, index) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    completed: false,
    current: index === 0
  })),
  7: humanLateMissions.filter(m => m.chapter === 7).map((m, index) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    completed: false,
    current: index === 0
  }))
};

export const humanLateEncounterDefinitions: Record<HumanLateEncounterId, EncounterDefinition> = {
  human_ch5_m01: { id: 'human_ch5_m01', name: 'Too Many Fronts', subtitle: 'The enemy presses the center and both wings at once, exposing the limits of a five-squad army.', enemyName: 'Three-Front Host', enemyCount: 6, enemyHp: 900, difficulty: 'Elite' },
  human_ch5_m03: { id: 'human_ch5_m03', name: 'Rally the Line', subtitle: 'Several sections begin under heavy pressure and require disciplined stabilization.', enemyName: 'Linebreak Companies', enemyCount: 6, enemyHp: 980, difficulty: 'Elite' },
  human_ch5_m04: { id: 'human_ch5_m04', name: 'Above the Shieldwall', subtitle: 'Flying raiders bypass the frontline and dive directly toward the rear.', enemyName: 'Ashen Skywing', enemyCount: 6, enemyHp: 1020, difficulty: 'Elite', fantasyThreat: 'flying' },
  human_ch5_m07: { id: 'human_ch5_m07', name: 'Three Lines Deep', subtitle: 'A mature Layered Core reinforces whichever line begins to fail.', enemyName: 'Deep Line Cohort', enemyCount: 6, enemyHp: 1110, difficulty: 'Elite' },
  human_ch5_m08: { id: 'human_ch5_m08', name: 'Hammer and Wing', subtitle: 'Heavy center pressure and a mounted wing attack at the same time.', enemyName: 'Hammerwing Host', enemyCount: 6, enemyHp: 1160, difficulty: 'Elite' },
  human_ch5_m09: { id: 'human_ch5_m09', name: 'The Strongest Army?', subtitle: 'A deliberately awkward counter composition punishes generic high-Power deployments.', enemyName: 'Countermarch Guard', enemyCount: 6, enemyHp: 1200, difficulty: 'Elite', fantasyThreat: 'flying' },
  human_ch5_m10: { id: 'human_ch5_m10', name: "Crown's Muster", subtitle: 'Three threat profiles converge into one operation that tests roster depth and reserves.', enemyName: 'Crownroad Operation', enemyCount: 6, enemyHp: 1280, difficulty: 'Elite' },
  human_ch5_m11: { id: 'human_ch5_m11', name: 'Battle for the Crownroad', subtitle: 'The six-squad army faces an elite center, cavalry wing, aerial pressure and reserve response.', enemyName: 'Crownroad Grand Host', enemyCount: 6, enemyHp: 1680, difficulty: 'Boss', fantasyThreat: 'flying' },

  human_ch6_m01: { id: 'human_ch6_m01', name: 'Strange Fire', subtitle: 'Ashen spellfire reshapes the battlefield and introduces magical pressure.', enemyName: 'Ashen Fire Circle', enemyCount: 6, enemyHp: 1320, difficulty: 'Elite', fantasyThreat: 'magic' },
  human_ch6_m02: { id: 'human_ch6_m02', name: 'The First Ward', subtitle: 'A protected ward redirects pressure until its screen is broken in the right order.', enemyName: 'First Ward Guard', enemyCount: 6, enemyHp: 1380, difficulty: 'Elite', fantasyThreat: 'magic' },
  human_ch6_m04: { id: 'human_ch6_m04', name: 'Power Has a Price', subtitle: 'Powerful casters create openings while destabilizing the troops around them.', enemyName: 'Volatile Arcanists', enemyCount: 6, enemyHp: 1460, difficulty: 'Elite', fantasyThreat: 'magic' },
  human_ch6_m05: { id: 'human_ch6_m05', name: 'Break the Spell', subtitle: 'A protected caster must be reached through a conventional guard line and shifting wards.', enemyName: 'Wardbound Cohort', enemyCount: 6, enemyHp: 1510, difficulty: 'Elite', fantasyThreat: 'magic' },
  human_ch6_m07: { id: 'human_ch6_m07', name: 'Fire from Above', subtitle: 'Flying pressure and spell support arrive together.', enemyName: 'Skyfire Host', enemyCount: 6, enemyHp: 1600, difficulty: 'Elite', fantasyThreat: 'hybrid' },
  human_ch6_m08: { id: 'human_ch6_m08', name: 'The Silent Ground', subtitle: 'Suppression weakens familiar active orders and rewards stable fundamentals.', enemyName: 'Silence Wardens', enemyCount: 6, enemyHp: 1660, difficulty: 'Elite', fantasyThreat: 'magic' },
  human_ch6_m09: { id: 'human_ch6_m09', name: 'Wards and Steel', subtitle: 'Elite infantry and arcane support protect each other in a true combined-arms line.', enemyName: 'Wardsteel Cohort', enemyCount: 6, enemyHp: 1720, difficulty: 'Elite', fantasyThreat: 'magic' },
  human_ch6_m10: { id: 'human_ch6_m10', name: 'The Arcane General', subtitle: 'An adaptive commander moves magical support between threatened lanes.', enemyName: 'Arcane General Host', enemyCount: 6, enemyHp: 1840, difficulty: 'Elite', fantasyThreat: 'magic' },
  human_ch6_m11: { id: 'human_ch6_m11', name: 'Siege of the Glass Keep', subtitle: 'Protected casters, flying pressure, layered troops and changing wards defend the Keep.', enemyName: 'Glass Keep Host', enemyCount: 6, enemyHp: 2450, difficulty: 'Boss', fantasyThreat: 'hybrid' },

  human_ch7_m01: { id: 'human_ch7_m01', name: 'The Stone Road', subtitle: 'Fortified approaches slow the army before it can reach Blackstone.', enemyName: 'Stone Road Guard', enemyCount: 6, enemyHp: 1860, difficulty: 'Elite', fantasyThreat: 'large' },
  human_ch7_m02: { id: 'human_ch7_m02', name: 'Break the Gate', subtitle: 'A fortified gate must be breached while the formation survives concentrated pressure.', enemyName: 'Blackstone Gate Guard', enemyCount: 6, enemyHp: 1980, difficulty: 'Elite', fantasyThreat: 'large' },
  human_ch7_m03: { id: 'human_ch7_m03', name: 'Protect the Engineers', subtitle: 'Enemy sorties target siege engineers and exposed support positions.', enemyName: 'Blackstone Sortie', enemyCount: 6, enemyHp: 2020, difficulty: 'Elite' },
  human_ch7_m04: { id: 'human_ch7_m04', name: 'Fire on the Walls', subtitle: 'Wall defenders and siege engines create lethal protected lanes.', enemyName: 'Wallfire Cohort', enemyCount: 6, enemyHp: 2080, difficulty: 'Elite' },
  human_ch7_m06: { id: 'human_ch7_m06', name: 'Under Their Towers', subtitle: 'Tower fire punishes static formations during the advance.', enemyName: 'Tower Wardens', enemyCount: 6, enemyHp: 2160, difficulty: 'Elite' },
  human_ch7_m07: { id: 'human_ch7_m07', name: 'The Enemy at Our Walls', subtitle: 'A counterattack tries to retake the siege lines Greenkeep already captured.', enemyName: 'Blackstone Counterhost', enemyCount: 6, enemyHp: 2220, difficulty: 'Elite' },
  human_ch7_m08: { id: 'human_ch7_m08', name: 'Hold Until Dawn', subtitle: 'A long night assault tests reserves, readiness and formation stability.', enemyName: 'Night Assault Host', enemyCount: 6, enemyHp: 2300, difficulty: 'Elite' },
  human_ch7_m10: { id: 'human_ch7_m10', name: 'The Breached City', subtitle: 'Urban pressure points become one final operation through Blackstone.', enemyName: 'Breached City Guard', enemyCount: 6, enemyHp: 2400, difficulty: 'Elite', fantasyThreat: 'hybrid' },
  human_ch7_m11: { id: 'human_ch7_m11', name: 'Fall of Blackstone', subtitle: 'The final Human campaign battle combines siege pressure, reserves, arcane threats and elite defenders.', enemyName: 'Blackstone Crown Host', enemyCount: 6, enemyHp: 3300, difficulty: 'Boss', fantasyThreat: 'hybrid' }
};

export const humanLateEncounterFormations: Record<
  HumanLateEncounterId,
  FormationShapeId
> = {
  human_ch5_m01: 'wide_vanguard_522',
  human_ch5_m03: 'reinforced_center_252',
  human_ch5_m04: 'skirmish_screen_243',
  human_ch5_m07: 'layered_core_231',
  human_ch5_m08: 'assault_432',
  human_ch5_m09: 'spear_wall_531',
  human_ch5_m10: 'deep_234',
  human_ch5_m11: 'layered_core_231',
  human_ch6_m01: 'protected_rear_225',
  human_ch6_m02: 'reinforced_center_252',
  human_ch6_m04: 'protected_rear_225',
  human_ch6_m05: 'layered_core_231',
  human_ch6_m07: 'skirmish_screen_243',
  human_ch6_m08: 'deep_234',
  human_ch6_m09: 'reinforced_center_252',
  human_ch6_m10: 'layered_core_231',
  human_ch6_m11: 'layered_core_231',
  human_ch7_m01: 'heavy_front_441',
  human_ch7_m02: 'iron_wall_501',
  human_ch7_m03: 'assault_432',
  human_ch7_m04: 'protected_rear_225',
  human_ch7_m06: 'iron_wall_501',
  human_ch7_m07: 'wide_vanguard_522',
  human_ch7_m08: 'layered_core_231',
  human_ch7_m10: 'deep_234',
  human_ch7_m11: 'layered_core_231'
};

export const humanLateEncounterRewards: Record<HumanLateEncounterId, {
  resources: Partial<ResourceWallet>;
  storySummary: string;
}> = Object.fromEntries(
  humanLateMissions
    .filter((mission): mission is HumanLateMissionDefinition & { encounterId: HumanLateEncounterId } =>
      Boolean(mission.encounterId)
    )
    .map(mission => [
      mission.encounterId,
      {
        resources: mission.reward,
        storySummary: mission.briefing
      }
    ])
) as Record<HumanLateEncounterId, {
  resources: Partial<ResourceWallet>;
  storySummary: string;
}>;

export function getHumanLateMission(nodeId: string) {
  return humanLateMissions.find(mission => mission.id === nodeId) ?? null;
}

export function getHumanLateMissionByEncounter(encounterId: string) {
  return humanLateMissions.find(mission => mission.encounterId === encounterId) ?? null;
}

export function isHumanLateEncounterId(value: string): value is HumanLateEncounterId {
  return Object.prototype.hasOwnProperty.call(humanLateEncounterDefinitions, value);
}

export function nextHumanLateNodeId(
  chapter: HumanLateChapter,
  currentNodeId: string
) {
  const chapterMissions = humanLateMissions.filter(mission => mission.chapter === chapter);
  const index = chapterMissions.findIndex(mission => mission.id === currentNodeId);
  return index >= 0 && index + 1 < chapterMissions.length
    ? chapterMissions[index + 1]?.id ?? null
    : null;
}
