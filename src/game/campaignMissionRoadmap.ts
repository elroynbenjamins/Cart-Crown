export type CampaignMissionKind =
  | 'story'
  | 'battle'
  | 'upgrade'
  | 'choice'
  | 'event'
  | 'boss'
  | 'operation'
  | 'siege'
  | 'defense';

export type CampaignTutorialMode = 'guided' | 'contextual' | 'independent';
export type CampaignMissionImplementationStatus = 'blueprint' | 'live';

export type CampaignMissionBlueprint = {
  id: string;
  chapter: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  chapterOrder: number;
  globalOrder: number;
  name: string;
  kind: CampaignMissionKind;
  purpose: string;
  enemyProfile: string;
  unlocks: string[];
  tutorialMode: CampaignTutorialMode;
  expectedActiveSquads: 2 | 3 | 4 | 5 | 6;
  systemTags: string[];
  implementationStatus: CampaignMissionImplementationStatus;
  runtimeNodeId?: string;
};

/**
 * Canonical mission roadmap agreed for the campaign-rework passes.
 *
 * This file deliberately lives separately from the legacy chapter node arrays.
 * Runtime wiring is being migrated chapter-by-chapter so the current campaign
 * cannot end up half-converted. Each pass can move a blueprint to "live" and
 * attach its runtimeNodeId once the encounter/reward/save flow is wired.
 */
const mission = (
  chapter: CampaignMissionBlueprint['chapter'],
  chapterOrder: number,
  globalOrder: number,
  name: string,
  kind: CampaignMissionKind,
  purpose: string,
  enemyProfile: string,
  unlocks: string[],
  tutorialMode: CampaignTutorialMode,
  expectedActiveSquads: CampaignMissionBlueprint['expectedActiveSquads'],
  systemTags: string[]
): CampaignMissionBlueprint => ({
  id: \`roadmap_ch\${chapter}_m\${String(chapterOrder).padStart(2, '0')}\`,
  chapter,
  chapterOrder,
  globalOrder,
  name,
  kind,
  purpose,
  enemyProfile,
  unlocks,
  tutorialMode,
  expectedActiveSquads,
  systemTags,
  implementationStatus: 'blueprint'
});

export const campaignChapterThemes: Record<CampaignMissionBlueprint['chapter'], string> = {
  1: 'The Remnant — learn how to command a small surviving force.',
  2: 'Building a Warband — composition, counters, injuries and the first named enemy formation.',
  3: 'Frostmarch — four-squad warfare, cavalry, Formation Integrity and Layered Core.',
  4: 'Fortifying the Realm — five squads, commander choice, Reinforce, loadouts and elite branches.',
  5: 'The Army Becomes a Kingdom — six squads, Rally, Flying and full combined-arms warfare.',
  6: 'Arcane Warfare — Mages manipulate positioning, protection and Formation Integrity.',
  7: 'Walls & War Machines — siege support, objectives, settlement defense and urban combat.'
};

export const campaignMissionRoadmap: CampaignMissionBlueprint[] = [
  mission(
    1, 1, 1, 'A Banner Still Flies', 'story',
    'Teach mission selection, two-squad deployment and the first battle without front-loading every system.',
    'Two weak melee squads; Standard should be very forgiving while still permitting light casualties.',
    ['campaign_basics'],
    'guided', 2, ['onboarding', 'deployment', 'battle']
  ),
  mission(
    1, 2, 2, 'Hold the Crossing', 'battle',
    'Teach frontline/rear positioning and the first limited commander intervention.',
    'Two enemies with one visibly aggressive attacker that punishes careless rear placement.',
    ['hold_line_order'],
    'guided', 2, ['formation', 'commander_order', 'protection']
  ),
  mission(
    1, 3, 3, 'Rebuild the Barracks', 'upgrade',
    'Create the first direct settlement-to-army progression link.',
    'Short conventional skirmish followed by a guided Barracks construction action.',
    ['barracks_level_1', 'first_recruit_upgrade'],
    'guided', 2, ['settlement', 'army_progression']
  ),
  mission(
    1, 4, 4, 'Spears at Dawn', 'battle',
    'Teach the first troop upgrade and show that counters can matter more than raw Power.',
    'A primitive mounted or charging threat that rewards a spear-style response without requiring it.',
    ['first_counter_upgrade', 'counter_readability'],
    'guided', 2, ['counter', 'anti_charge', 'troop_upgrade']
  ),
  mission(
    1, 5, 5, 'Cut Off the Captain', 'battle',
    'Introduce priority targeting without turning the game into manual RTS micromanagement.',
    'Three enemies including a noticeably stronger leader or supporting unit.',
    ['focus_target_order'],
    'guided', 2, ['commander_order', 'priority_target']
  ),
  mission(
    1, 6, 6, 'The Broken Road', 'battle',
    'Remove most forced guidance and test the known systems together.',
    'Mixed force where poor front/rear positioning can create the first serious injury.',
    ['side_mission_visibility'],
    'contextual', 2, ['independent_play', 'injury_preview']
  ),
  mission(
    1, 7, 7, 'Reclaim the Outpost', 'boss',
    'Chapter-one competency test using only mechanics already introduced.',
    'Recognizable frontline protecting a more dangerous rear threat; poor positioning should create costly victories.',
    ['chapter_1_complete', 'early_village_progression', 'review_prompt_eligible'],
    'independent', 2, ['boss', 'formation', 'chapter_gate']
  ),

  mission(
    2, 1, 8, 'Strength in Numbers', 'battle',
    'Unlock the third squad and make three-squad geometry immediately meaningful.',
    'A conventional three-enemy force that can be answered with a broad line or protected rear.',
    ['third_deployment_slot', 'formation_2_1', 'formation_1_1_1'],
    'guided', 3, ['deployment', 'formation']
  ),
  mission(
    2, 2, 9, 'Tools of War', 'upgrade',
    'Introduce predictable military crafting with an immediately useful recipe.',
    'Moderate infantry battle followed by the first Workshop/Smithy craft.',
    ['workshop_level_1', 'basic_military_crafting'],
    'guided', 3, ['crafting', 'settlement']
  ),
  mission(
    2, 3, 10, 'Riders on the Road', 'battle',
    'Make mounted counters readable before cavalry becomes a player system.',
    'First proper charge-focused opponent; spear-type units should clearly outperform higher-Power bad matchups.',
    ['anti_charge_readability', 'charge_telegraph'],
    'contextual', 3, ['cavalry_preview', 'counter', 'anti_charge']
  ),
  mission(
    2, 4, 11, 'No Army Fights Forever', 'battle',
    'Teach injuries, reserve substitution and the value of rotating squads.',
    'Harder battle tuned to commonly leave one squad heavily injured without scripting the outcome.',
    ['injuries', 'reserve_substitution', 'offline_recovery'],
    'guided', 3, ['injury', 'recovery', 'roster']
  ),
  mission(
    2, 5, 12, 'The Long Way Around', 'battle',
    'Introduce flank pressure and make outer positioning matter.',
    'One fast enemy pressures an outer or rear position while the center remains manageable.',
    ['flank_threats', 'wide_three_squad_formation'],
    'contextual', 3, ['flank', 'formation']
  ),
  mission(
    2, 6, 13, 'The Iron Line', 'battle',
    'Introduce the first named enemy formation without providing an exact solution.',
    'Basic Iron Wall with a broad packed frontline and protected rear damage.',
    ['enemy_formation_preview', 'iron_wall'],
    'independent', 3, ['enemy_formation', 'iron_wall', 'protection']
  ),
  mission(
    2, 7, 14, 'Supplies for War', 'event',
    'Teach optional preparation as a pressure valve rather than mandatory grinding.',
    'Encounter is slightly above an average unprepared state and points toward side content only when useful.',
    ['preparation_recommendation', 'side_content_pressure_valve'],
    'independent', 3, ['economy', 'preparation', 'side_content']
  ),
  mission(
    2, 8, 15, 'Break Their Hold', 'boss',
    'First finale where weak preparation can realistically cause failure even on Standard.',
    'Iron Wall plus protected rear threat and limited flank pressure; healthy level-appropriate squads should remain favored.',
    ['chapter_2_complete', 'frostmarch_route'],
    'independent', 3, ['boss', 'iron_wall', 'flank', 'chapter_gate']
  ),

  mission(
    3, 1, 16, 'Into Frostmarch', 'story',
    'Establish the region and difficulty increase before introducing another mechanic.',
    'Disciplined infantry around player level with visibly better equipment but no new tactical family.',
    ['frostmarch_region', 'frostmarch_material_preview'],
    'independent', 3, ['region', 'difficulty_curve']
  ),
  mission(
    3, 2, 17, 'A Wider Front', 'battle',
    'Unlock the fourth squad after the player first feels three-squad limitations.',
    'Enemy frontage deliberately strains three squads but remains beatable before the unlock.',
    ['fourth_deployment_slot', 'formation_2_2', 'formation_3_1', 'formation_2_1_1'],
    'contextual', 4, ['deployment', 'formation']
  ),
  mission(
    3, 3, 18, 'Frozen Steel', 'upgrade',
    'Introduce regional resources with one immediately useful recipe.',
    'Armored enemies encourage a reinforced spear/weapon package without hard-locking progression.',
    ['froststeel', 'reinforced_spear_recipe'],
    'contextual', 4, ['regional_resource', 'crafting', 'armor']
  ),
  mission(
    3, 4, 19, 'Hooves in the Snow', 'battle',
    'Properly introduce cavalry, charge preparation and brace/interception readability.',
    'Mounted enemy begins far enough away for CHARGE PREPARING and BRACED feedback to matter.',
    ['stable_progression', 'first_mounted_squad', 'charge_telegraph'],
    'contextual', 4, ['cavalry', 'charge', 'anti_charge']
  ),
  mission(
    3, 5, 20, 'Choose Your Rider', 'choice',
    'Make the first mounted specialization a tactical sidegrade rather than a stat upgrade.',
    'Mixed frontline and ranged enemy lets Lancer breakthrough or Sword Rider rear pressure both succeed.',
    ['cavalry_branch_lancer', 'cavalry_branch_sword_rider'],
    'contextual', 4, ['troop_branch', 'cavalry']
  ),
  mission(
    3, 6, 21, 'The Line Buckles', 'battle',
    'Expose Formation Integrity states to the player after they have already existed internally.',
    'Shock infantry deals high cohesion pressure but only moderate raw damage.',
    ['formation_integrity_ui', 'pressured_state', 'breaking_state', 'breach_state'],
    'contextual', 4, ['formation_integrity', 'breakthrough']
  ),
  mission(
    3, 7, 22, 'Through the Gap', 'battle',
    'Introduce Push Forward as a behavior-changing order used to exploit a wavering enemy line.',
    'Enemy deliberately creates a breach opportunity but can punish reckless overextension.',
    ['push_forward_order'],
    'guided', 4, ['commander_order', 'breakthrough']
  ),
  mission(
    3, 8, 23, 'Wolves on the Wing', 'battle',
    'Teach genuine flank pressure against vulnerable backline units.',
    'Fast mounted or Warg-style enemy begins on the wing and seeks exposed rear targets.',
    ['flank_warning', 'wide_four_squad_formation'],
    'independent', 4, ['flank', 'cavalry', 'rear_threat']
  ),
  mission(
    3, 9, 24, 'The Layered Host', 'battle',
    'Introduce the Layered Core and visible reserve reinforcement.',
    'Deep formation absorbs an initial breach and replaces a failing layer with a reserve.',
    ['layered_core', 'reserve_reinforcement_readability'],
    'independent', 4, ['enemy_formation', 'layered_core', 'reserve']
  ),
  mission(
    3, 10, 25, 'Cold Roads', 'event',
    'Unlock another optional Activity only after the campaign demonstrates why preparation can help.',
    'Attrition-focused road encounter with modest Gold, squad XP and common material pressure.',
    ['midgame_activity_unlock'],
    'independent', 4, ['activity', 'preparation', 'attrition']
  ),
  mission(
    3, 11, 26, 'Battle for Frostgate', 'boss',
    'Combine four squads, cavalry, flanking and Layered Core without introducing anything new.',
    'Layered defense, one reserve, one mounted/flanking threat and protected ranged damage.',
    ['chapter_3_complete', 'town_progression'],
    'independent', 4, ['boss', 'layered_core', 'cavalry', 'chapter_gate']
  ),

  mission(
    4, 1, 27, 'The Long Front', 'battle',
    'Make the four-squad army feel stretched before granting another slot.',
    'Wide enemy deployment creates simultaneous pressure and exposes one under-supported wing.',
    [],
    'independent', 4, ['formation', 'pressure']
  ),
  mission(
    4, 2, 28, 'Raise Another Banner', 'upgrade',
    'Unlock the fifth active squad and the first visually dramatic formation shapes.',
    'Conventional battle preceding a major Command Hall capacity upgrade.',
    ['fifth_deployment_slot', 'formation_3_2', 'formation_4_1', 'formation_2_2_1'],
    'contextual', 5, ['deployment', 'formation']
  ),
  mission(
    4, 3, 29, 'Two Ways to War', 'choice',
    'Introduce the second Commander as a doctrine choice rather than a direct upgrade.',
    'Encounter is deliberately viable with either defensive stability or adaptive repositioning.',
    ['second_commander'],
    'guided', 5, ['commander', 'doctrine']
  ),
  mission(
    4, 4, 30, 'Broken Ground', 'battle',
    'Demonstrate that Commander behavior changes how the same army solves shifting pressure.',
    'Pressure changes lanes over the course of battle, rewarding different doctrines differently.',
    ['commander_doctrine_comparison'],
    'independent', 5, ['commander', 'adaptive_ai']
  ),
  mission(
    4, 5, 31, 'Hold the Breach', 'battle',
    'Introduce Reinforce as a positional priority rather than a heal or teleport.',
    'Shock troops repeatedly pressure one section until the player redirects reserve strength.',
    ['reinforce_order'],
    'guided', 5, ['commander_order', 'reserve', 'formation_integrity']
  ),
  mission(
    4, 6, 32, 'Prepare for Battle', 'upgrade',
    'Unlock saved army loadouts when rebuilding formations by hand has become friction.',
    'Two upcoming enemy previews differ enough to justify maintaining alternate armies.',
    ['army_loadouts', 'three_loadout_slots'],
    'guided', 5, ['loadout', 'quality_of_life']
  ),
  mission(
    4, 7, 33, 'The Wrong Army', 'battle',
    'Teach that the highest displayed Army Power is not automatically the best matchup.',
    'Heavy cavalry and aggressive wings punish a generic high-Power army more than an appropriate counter loadout.',
    ['counter_loadout_lesson'],
    'independent', 5, ['counter', 'loadout', 'army_power']
  ),
  mission(
    4, 8, 34, 'Veteran Steel', 'upgrade',
    'Unlock the first elite troop upgrade as an investment, not a mandatory gate.',
    'Hard encounter rewards specialization but remains beatable without an elite squad.',
    ['first_elite_troop_branch'],
    'contextual', 5, ['elite_unit', 'troop_branch']
  ),
  mission(
    4, 9, 35, 'Hunters in the Rear', 'battle',
    'Upgrade enemy targeting behavior so flankers actively seek Support and Ranged units.',
    'Smart enemy rear hunters punish exposed valuable roles rather than blindly attacking the nearest target.',
    ['advanced_enemy_targeting'],
    'independent', 5, ['enemy_ai', 'flank', 'priority_target']
  ),
  mission(
    4, 10, 36, 'The Forked Banner', 'choice',
    'Introduce a regional priority choice that changes what becomes easier first without permanent lockout.',
    'Player chooses a heavy-material or mounted-development route before eventually securing both.',
    ['regional_priority_choice'],
    'independent', 5, ['region', 'economy', 'choice']
  ),
  mission(
    4, 11, 37, 'Siege of Greywatch', 'boss',
    'Test roster, Commander, loadout, counters and five-squad formation planning together.',
    'Layered defense, elite Guard, cavalry wing and ranged core with reserve behavior.',
    ['chapter_4_complete', 'fortified_town_progression'],
    'independent', 5, ['boss', 'combined_arms', 'chapter_gate']
  ),

  mission(
    5, 1, 38, 'Too Many Fronts', 'battle',
    'Make five squads feel insufficient before the final normal deployment slot is awarded.',
    'Center and wing are pressured simultaneously; the reserve cannot comfortably cover both.',
    [],
    'independent', 5, ['pressure', 'formation']
  ),
  mission(
    5, 2, 39, 'The Sixth Banner', 'upgrade',
    'Unlock the permanent six-squad campaign cap and the mature formation set.',
    'Strong conventional battle followed by Command Hall capacity progression.',
    ['sixth_deployment_slot', 'formation_3_3', 'formation_4_2', 'formation_2_2_2', 'formation_3_2_1'],
    'contextual', 6, ['deployment', 'formation']
  ),
  mission(
    5, 3, 40, 'Rally the Line', 'battle',
    'Introduce Rally as emergency stabilization rather than healing.',
    'Multiple sections become Pressured or Breaking so the player must decide when stabilization matters most.',
    ['rally_order'],
    'guided', 6, ['commander_order', 'morale', 'formation_integrity']
  ),
  mission(
    5, 4, 41, 'Above the Shieldwall', 'battle',
    'Introduce the first advanced fantasy battlefield family with Flying units.',
    'Air threat can bypass ordinary frontline protection and pressure Ranged or Support units.',
    ['flying_threat_family'],
    'contextual', 6, ['flying', 'rear_threat']
  ),
  mission(
    5, 5, 42, 'Answers to the Sky', 'upgrade',
    'Teach reliable anti-air counterplay without making a dedicated counter mandatory.',
    'Flying threat returns inside a more complex composition that conventional ranged can survive but anti-air handles efficiently.',
    ['anti_air_counter_branch'],
    'contextual', 6, ['anti_air', 'flying', 'counter']
  ),
  mission(
    5, 6, 43, "Commander's Hand", 'event',
    'Unlock the first Commander-specific active order and preserve the three-button battle limit.',
    'Encounter geometry is selected to make doctrine-specific behavior visibly valuable.',
    ['first_commander_unique_order'],
    'contextual', 6, ['commander', 'commander_order']
  ),
  mission(
    5, 7, 44, 'Three Lines Deep', 'battle',
    'Run the first fully mature deep-formation battle.',
    'Advanced Layered Core uses front, reinforcement layer and protected rear specialists.',
    ['advanced_layered_core'],
    'independent', 6, ['layered_core', 'reserve', 'formation_integrity']
  ),
  mission(
    5, 8, 45, 'Hammer and Wing', 'battle',
    'Force the player to answer simultaneous breakthrough and flank threats.',
    'Heavy center pressure combines with fast wing cavalry; overcommitting to either problem exposes the other.',
    [],
    'independent', 6, ['combined_arms', 'breakthrough', 'flank']
  ),
  mission(
    5, 9, 46, 'The Strongest Army?', 'battle',
    'Deliberately challenge the habitual highest-Power loadout.',
    'Anti-cavalry front, Flying threat and protected ranged core reward a lower-Power but better-matched army.',
    ['army_power_is_estimate_lesson'],
    'independent', 6, ['loadout', 'counter', 'army_power']
  ),
  mission(
    5, 10, 47, "Crown's Muster", 'operation',
    'Preview multi-battle operations and make roster depth/injuries matter.',
    'Three upcoming encounters show different threat profiles; one operation reserve can rotate between them.',
    ['multi_battle_operation_preview', 'operation_reserve_slot'],
    'independent', 6, ['operation', 'attrition', 'roster']
  ),
  mission(
    5, 11, 48, 'Battle for the Crownroad', 'boss',
    'Test the complete standard six-squad combat loop without relying on a giant stat check.',
    'Elite center, mounted wing, Flying/ranged pressure, reserve and competent enemy Commander behavior.',
    ['chapter_5_complete', 'major_settlement_progression'],
    'independent', 6, ['boss', 'combined_arms', 'chapter_gate']
  ),

  mission(
    6, 1, 49, 'Strange Fire', 'battle',
    'Preview magic as battlefield manipulation rather than simply higher ranged damage.',
    'Enemy caster slows movement or Formation Integrity recovery while dealing only moderate raw damage.',
    ['magic_threat_preview'],
    'independent', 6, ['magic', 'control']
  ),
  mission(
    6, 2, 50, 'The First Ward', 'battle',
    'Introduce magical protection and lightweight Arcane Resistance.',
    'Defensive caster wards a vulnerable ally, improving cohesion/resistance rather than simply adding HP.',
    ['arcane_resistance_readability', 'ward_effects'],
    'contextual', 6, ['magic', 'ward', 'resistance']
  ),
  mission(
    6, 3, 51, 'Call the Arcanist', 'event',
    'Unlock the first player Mage and teach that routine spell use remains automated.',
    'Conventional clustered enemies make the first generalist caster immediately useful.',
    ['first_mage_squad'],
    'guided', 6, ['magic', 'unit_unlock']
  ),
  mission(
    6, 4, 52, 'Power Has a Price', 'battle',
    'Teach that Mages are fragile and depend on conventional formation protection.',
    'Fast enemy pressure punishes an exposed caster while Guard relationships remain valuable.',
    ['mage_exposure_readability'],
    'contextual', 6, ['magic', 'protection', 'flank']
  ),
  mission(
    6, 5, 53, 'Break the Spell', 'battle',
    'Introduce cast telegraphs and anti-caster interruption without making every hit interrupt.',
    'Protected enemy Mage prepares a dangerous major spell that can be pressured, bypassed or interrupted.',
    ['major_cast_telegraph', 'spell_interrupt'],
    'contextual', 6, ['magic', 'interrupt', 'priority_target']
  ),
  mission(
    6, 6, 54, 'Paths of the Arcane', 'choice',
    'Branch the starter Mage toward damage, control or protection identities.',
    'Mixed enemy composition makes multiple specializations viable rather than presenting one correct branch.',
    ['mage_specialization'],
    'contextual', 6, ['magic', 'troop_branch']
  ),
  mission(
    6, 7, 55, 'Fire from Above', 'battle',
    'Combine Magic and Flying so tactical families support each other instead of existing in isolation.',
    'Enemy caster disrupts anti-air response while Flying pressure targets the backline.',
    [],
    'independent', 6, ['magic', 'flying', 'combined_arms']
  ),
  mission(
    6, 8, 56, 'The Silent Ground', 'battle',
    'Introduce a small number of readable temporary battlefield-control zones.',
    'Frozen/arcane ground modifies movement, charge or spell effectiveness without covering the whole battlefield.',
    ['battlefield_control_zones'],
    'contextual', 6, ['magic', 'control_zone', 'positioning']
  ),
  mission(
    6, 9, 57, 'Wards and Steel', 'battle',
    'Create the first mature physical/magical protection puzzle.',
    'Heavy Guard protects a Ward Mage that protects a ranged core; several bypass and pressure solutions remain valid.',
    [],
    'independent', 6, ['magic', 'guard', 'combined_arms']
  ),
  mission(
    6, 10, 58, 'The Arcane General', 'battle',
    'Introduce an enemy Commander whose doctrine intentionally supports a magical army.',
    'Arcane Commander protects casters, favors Layered formations and times a defensive bulwark order.',
    ['enemy_arcane_commander_doctrine'],
    'independent', 6, ['commander', 'magic', 'enemy_ai']
  ),
  mission(
    6, 11, 59, 'Siege of the Glass Keep', 'boss',
    'Combine the full Mage layer with established Flying, reserve and Commander systems.',
    'Heavy front, control Mage, ranged rear, Flying wing, reserve and Arcane Commander.',
    ['chapter_6_complete'],
    'independent', 6, ['boss', 'magic', 'combined_arms', 'chapter_gate']
  ),

  mission(
    7, 1, 60, 'The Stone Road', 'battle',
    'Introduce fortified positions before asking the player to manage a full siege.',
    'Checkpoint uses barricades, elevated ranged pressure and a narrow approach.',
    ['fortification_preview'],
    'contextual', 6, ['siege_preview', 'terrain', 'fortification']
  ),
  mission(
    7, 2, 61, 'Break the Gate', 'siege',
    'Introduce gates through the existing Integrity language and the first Siege Support tool.',
    'Wooden gate progresses through intact, pressured, cracking and breached while the army protects a Ram.',
    ['battering_ram', 'first_siege_support_slot', 'structure_integrity'],
    'guided', 6, ['siege', 'structure', 'siege_support']
  ),
  mission(
    7, 3, 62, 'Protect the Engineers', 'defense',
    'Teach explicit objective protection and clear failure conditions.',
    'Enemy Flankers attempt to reach engineers during a timed dismantling objective.',
    ['objective_failure_readability'],
    'contextual', 6, ['objective', 'escort', 'flank']
  ),
  mission(
    7, 4, 63, 'Fire on the Walls', 'siege',
    'Introduce defensive artillery and the Field Ballista.',
    'Wall Ballista telegraphs high-value shots and can be rushed, counter-fired, bypassed or endured.',
    ['field_ballista'],
    'contextual', 6, ['siege', 'artillery', 'anti_structure', 'anti_air']
  ),
  mission(
    7, 5, 64, 'Two Ways In', 'choice',
    'Make siege strategy begin before combat through route selection.',
    'Player chooses the heavily defended main gate or a weaker side wall covered by ranged units.',
    ['siege_route_choice'],
    'independent', 6, ['siege', 'choice', 'route']
  ),
  mission(
    7, 6, 65, 'Under Their Towers', 'siege',
    'Expand defensive structures and give selected squads explicit anti-structure value.',
    'Arrow or heavy tower has range/cadence limitations and becomes vulnerable once attackers close.',
    ['tower_defenses', 'siegebreaker_tag'],
    'independent', 6, ['siege', 'tower', 'anti_structure']
  ),
  mission(
    7, 7, 66, 'The Enemy at Our Walls', 'defense',
    'Make the player defend their own settlement so building investments become visible on the battlefield.',
    'Enemy assault interacts with the player Gate, Watchtower and militia-style settlement support.',
    ['settlement_defense_battle'],
    'independent', 6, ['settlement', 'defense', 'siege']
  ),
  mission(
    7, 8, 67, 'Hold Until Dawn', 'defense',
    'Introduce survival victory conditions instead of always requiring enemy elimination.',
    'Timed or wave-based assault makes Hold, Rally, reserves and disciplined attrition especially valuable.',
    ['survival_objective'],
    'independent', 6, ['defense', 'survival', 'attrition']
  ),
  mission(
    7, 9, 68, 'Siegecraft', 'upgrade',
    'Expand siege preparation into meaningful two-slot support loadouts.',
    'Upcoming siege previews reward different Ram, Ballista, Siege Tower or Supply Wagon combinations.',
    ['second_siege_support_slot', 'siege_loadouts', 'siege_tower', 'supply_wagon'],
    'contextual', 6, ['siege', 'loadout', 'siege_support']
  ),
  mission(
    7, 10, 69, 'The Breached City', 'operation',
    'Show that a breach begins a new tactical problem rather than ending the siege.',
    'Outer breach flows into tighter urban combat with reduced cavalry charge space and useful flank streets.',
    ['urban_combat'],
    'independent', 6, ['siege', 'urban', 'multi_stage']
  ),
  mission(
    7, 11, 70, 'Fall of Blackstone', 'boss',
    'Run the first full offensive siege operation with checkpoints and carried attrition.',
    'Outer defenses, breach response and inner-fortress combined-arms battle use the complete siege toolkit.',
    ['chapter_7_complete', 'engineering_yard', 'siege_checkpointing'],
    'independent', 6, ['boss', 'siege', 'operation', 'chapter_gate']
  )
];

export const campaignMissionCountsByChapter: Record<CampaignMissionBlueprint['chapter'], number> = {
  1: 7,
  2: 8,
  3: 11,
  4: 11,
  5: 11,
  6: 11,
  7: 11
};

export const expectedActiveSquadsByChapter: Record<
  CampaignMissionBlueprint['chapter'],
  CampaignMissionBlueprint['expectedActiveSquads']
> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 6,
  7: 6
};

export function getCampaignMissionBlueprint(chapter: number, chapterOrder: number) {
  return campaignMissionRoadmap.find(
    candidate => candidate.chapter === chapter && candidate.chapterOrder === chapterOrder
  ) ?? null;
}

export function getCampaignChapterBlueprints(chapter: number) {
  return campaignMissionRoadmap.filter(candidate => candidate.chapter === chapter);
}
