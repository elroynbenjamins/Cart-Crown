import type { EncounterDefinition, FormationShapeId, ResourceWallet, UnitRole } from './types';

export type EncounterId =
  | 'hold_the_road'
  | 'war_table_broken_spear'
  | 'war_table_blackwood_ambush'
  | 'war_table_red_banner'
  | 'war_table_dusk_riders'
  | 'war_table_stonegate_pikes'
  | 'war_table_ashen_reserves'
  | 'war_table_hollow_guard'
  | 'war_table_ironclad_push'
  | 'war_table_crownroad_lancers'
  | 'war_table_ashen_hex_circle'
  | 'war_table_sky_raiders'
  | 'war_table_golem_breach'
  | 'mercenary_patrol'
  | 'toll_captain'
  | 'reclaim_outpost'
  | 'ch2_defend_camp'
  | 'ch2_beyond_fires'
  | 'ch2_brace'
  | 'ch2_take_watch'
  | 'ch2_riders_banner'
  | 'iron_road_skirmish'
  | 'iron_provost'
  | 'border_fort'
  | 'siege_road'
  | 'lord_marshal_veyr'
  | 'broken_standards'
  | 'crownroad_ambush'
  | 'pretender_general'
  | 'old_royal_lands'
  | 'ashen_envoy'
  | 'gate_of_crownspire'
  | 'sundered_fields'
  | 'ashen_court'
  | 'return_to_crownspire'
  | 'elf_wardbreakers'
  | 'elf_ashen_tracks'
  | 'elf_hollow_warden'
  | 'orc_red_road'
  | 'orc_invader_scouts'
  | 'orc_blamecaller'
  | 'elf_last_heartgrove'
  | 'elf_ward_hunters'
  | 'elf_ashroot_stalker'
  | 'orc_gather_clans'
  | 'orc_stonejaw_challengers'
  | 'orc_clanbreaker'
  | 'elf_moonlit_pass'
  | 'elf_ashen_groves'
  | 'elf_pale_ranger'
  | 'orc_stonejaw_trial'
  | 'orc_broken_steppe'
  | 'orc_stonejaw_champion'
  | 'elf_roots_in_ash'
  | 'elf_two_fronts'
  | 'elf_ashen_druid'
  | 'orc_two_front_war'
  | 'orc_broken_steppe_war'
  | 'orc_split_chieftain'
  | 'elf_wounded_worldroot'
  | 'elf_ashen_rootkeepers'
  | 'elf_worldroot_guardian'
  | 'orc_no_clan_left_behind'
  | 'orc_ashen_clanbreakers'
  | 'orc_last_clanbreaker'
  | 'elf_stars_over_crownspire'
  | 'orc_truth_at_crownspire'
  | 'elf_ashen_starwatch'
  | 'elf_return_through_roots'
  | 'orc_ashen_warfires'
  | 'orc_crownspire_warmaster'
  | 'three_seals_convergence'
  | 'ashen_triumvirate'
  | 'unbound_beacon';

export type EncounterReward = {
  resources: Partial<ResourceWallet>;
  storySummary: string;
};

export const encounters: Record<EncounterId, EncounterDefinition> = {
  hold_the_road: {
    id: 'hold_the_road',
    name: 'Hold the Crossing',
    subtitle: 'A raider patrol is blocking the crossing that keeps Greenkeep connected to the refugee road.',
    enemyName: 'Road Raiders',
    enemyCount: 3,
    enemyHp: 128,
    difficulty: 'Normal'
  },
  war_table_broken_spear: {
    id: 'war_table_broken_spear',
    name: 'Broken Spear Company',
    subtitle: 'A shield-heavy deserter company has occupied a supply crossing outside the main campaign route.',
    enemyName: 'Broken Spear Company',
    enemyCount: 5,
    enemyHp: 190,
    difficulty: 'Normal'
  },
  war_table_blackwood_ambush: {
    id: 'war_table_blackwood_ambush',
    name: 'Blackwood Ambush',
    subtitle: 'Scouts found a lightly screened missile band preparing an ambush from protected ground.',
    enemyName: 'Blackwood Bowband',
    enemyCount: 5,
    enemyHp: 205,
    difficulty: 'Normal'
  },
  war_table_red_banner: {
    id: 'war_table_red_banner',
    name: 'Red Banner Raiders',
    subtitle: 'An aggressive raiding host is probing the frontier for a quick fight before reinforcements arrive.',
    enemyName: 'Red Banner Raiders',
    enemyCount: 6,
    enemyHp: 255,
    difficulty: 'Elite'
  },
  war_table_dusk_riders: {
    id: 'war_table_dusk_riders',
    name: 'Dusk Riders',
    subtitle: 'Mounted hunters are cutting messengers off from the outer roads and refusing a direct stand.',
    enemyName: 'Dusk Riders',
    enemyCount: 4,
    enemyHp: 180,
    difficulty: 'Normal'
  },
  war_table_stonegate_pikes: {
    id: 'war_table_stonegate_pikes',
    name: 'Stonegate Pikes',
    subtitle: 'A hired spear wall has braced across a narrow crossing and is charging tolls to every caravan.',
    enemyName: 'Stonegate Pikes',
    enemyCount: 5,
    enemyHp: 205,
    difficulty: 'Normal'
  },
  war_table_ashen_reserves: {
    id: 'war_table_ashen_reserves',
    name: 'Ashen Reserve Company',
    subtitle: 'Veteran reserves are drilling a reinforced center and reacting quickly to every threatened lane.',
    enemyName: 'Ashen Reserve Company',
    enemyCount: 6,
    enemyHp: 235,
    difficulty: 'Elite'
  },
  war_table_hollow_guard: {
    id: 'war_table_hollow_guard',
    name: 'Hollow Guard',
    subtitle: 'A patient deep formation is escorting seized supplies through the frontier under layered protection.',
    enemyName: 'Hollow Guard',
    enemyCount: 6,
    enemyHp: 245,
    difficulty: 'Elite'
  },
  war_table_ironclad_push: {
    id: 'war_table_ironclad_push',
    name: 'Ironclad Push',
    subtitle: 'Two dense combat ranks are advancing with almost no rear protection and daring anyone to meet them head-on.',
    enemyName: 'Ironclad Company',
    enemyCount: 7,
    enemyHp: 280,
    difficulty: 'Elite'
  },
  war_table_crownroad_lancers: {
    id: 'war_table_crownroad_lancers',
    name: 'Crownroad Lancers',
    subtitle: 'Veteran riders are using speed and repeated lane changes to keep local patrols off balance.',
    enemyName: 'Crownroad Lancers',
    enemyCount: 6,
    enemyHp: 270,
    difficulty: 'Elite'
  },
  war_table_ashen_hex_circle: {
    id: 'war_table_ashen_hex_circle',
    name: 'Ashen Hex Circle',
    subtitle: 'An Ashen ritual cell is testing battlefield hexes against patrol routes and hiding its casters behind a warded screen.',
    enemyName: 'Ashen Hex Circle',
    enemyCount: 6,
    enemyHp: 760,
    difficulty: 'Elite',
    fantasyThreat: 'magic'
  },
  war_table_sky_raiders: {
    id: 'war_table_sky_raiders',
    name: 'Sky Raiders',
    subtitle: 'Aerial raiders are bypassing road defenses and striking messengers, supply wagons and exposed rear positions.',
    enemyName: 'Ashen Sky Raiders',
    enemyCount: 6,
    enemyHp: 980,
    difficulty: 'Elite',
    fantasyThreat: 'flying'
  },
  war_table_golem_breach: {
    id: 'war_table_golem_breach',
    name: 'Golem Breach',
    subtitle: 'Oversized Ashen constructs are advancing in a compact assault column and smashing through ordinary roadblocks.',
    enemyName: 'Ashen Golem Vanguard',
    enemyCount: 6,
    enemyHp: 1280,
    difficulty: 'Elite',
    fantasyThreat: 'large'
  },
  mercenary_patrol: {
    id: 'mercenary_patrol',
    name: 'Spears at Dawn',
    subtitle: 'A contracted mounted screen tests Greenkeep before its employer can be identified.',
    enemyName: 'Green Banner Riders',
    enemyCount: 4,
    enemyHp: 220,
    difficulty: 'Elite'
  },
  toll_captain: {
    id: 'toll_captain',
    name: 'Cut Off the Captain',
    subtitle: 'The road captain is isolated from the old toll fort. Breaking his escort will cut the defenders off from outside support.',
    enemyName: 'Captain Escort',
    enemyCount: 4,
    enemyHp: 255,
    difficulty: 'Elite'
  },
  reclaim_outpost: {
    id: 'reclaim_outpost',
    name: 'Reclaim the Outpost',
    subtitle: 'The remaining garrison has fallen back into the old Greenkeep toll fort. The road is ready for one final assault.',
    enemyName: 'Outpost Garrison',
    enemyCount: 5,
    enemyHp: 340,
    difficulty: 'Boss'
  },
  ch2_defend_camp: {
    id: 'ch2_defend_camp',
    name: 'They Found Us',
    subtitle: 'A probing force strikes the permanent camp before Greenkeep can secure the surrounding roads.',
    enemyName: 'Roadside Probe',
    enemyCount: 5,
    enemyHp: 310,
    difficulty: 'Normal'
  },
  ch2_beyond_fires: {
    id: 'ch2_beyond_fires',
    name: 'The Iron Line',
    subtitle: 'A dense shield line protects the enemy rear and introduces the first named formation problem.',
    enemyName: 'Iron Line Company',
    enemyCount: 5,
    enemyHp: 360,
    difficulty: 'Elite'
  },
  ch2_brace: {
    id: 'ch2_brace',
    name: 'Riders on the Road',
    subtitle: 'Mounted raiders test the young warband and make anti-charge positioning matter for the first time.',
    enemyName: 'Road Lancers',
    enemyCount: 5,
    enemyHp: 330,
    difficulty: 'Elite'
  },
  ch2_take_watch: {
    id: 'ch2_take_watch',
    name: 'Take the Watch',
    subtitle: 'A fortified watch post controls the roads around Greenkeep and must be taken before the Outpost can expand.',
    enemyName: 'Watch Garrison',
    enemyCount: 7,
    enemyHp: 565,
    difficulty: 'Elite'
  },
  ch2_riders_banner: {
    id: 'ch2_riders_banner',
    name: "The Rider's Banner",
    subtitle: 'The mounted commander behind the regional probes gathers a full field force to break Greenkeep before the Outpost can hold.',
    enemyName: "Rider's Banner Host",
    enemyCount: 7,
    enemyHp: 760,
    difficulty: 'Boss'
  },
  iron_road_skirmish: {
    id: 'iron_road_skirmish',
    name: 'Tools of War',
    subtitle: 'Greenkeep’s first Fort patrol runs into mercenaries guarding an abandoned roadside mine.',
    enemyName: 'Iron Road Mercenaries',
    enemyCount: 5,
    enemyHp: 285,
    difficulty: 'Elite'
  },
  iron_provost: {
    id: 'iron_provost',
    name: 'Break Their Hold',
    subtitle: 'The Crown-trained officer controlling the Iron Road has fortified the old mine headquarters.',
    enemyName: 'Iron Provost Guard',
    enemyCount: 6,
    enemyHp: 470,
    difficulty: 'Boss'
  },
  border_fort: {
    id: 'border_fort',
    name: 'Border Fort',
    subtitle: 'The first marcher strongpoint refuses Greenkeep passage and raises two different house banners over the same gate.',
    enemyName: 'Marcher Fort Guard',
    enemyCount: 6,
    enemyHp: 390,
    difficulty: 'Elite'
  },
  siege_road: {
    id: 'siege_road',
    name: 'Siege Road',
    subtitle: 'Greenkeep must break through a fortified marcher road before the false orders isolate the remaining houses.',
    enemyName: 'Siege Road Column',
    enemyCount: 6,
    enemyHp: 560,
    difficulty: 'Elite'
  },
  lord_marshal_veyr: {
    id: 'lord_marshal_veyr',
    name: 'Lord Marshal Veyr',
    subtitle: 'Veyr gathers the loyal marcher companies beneath one standard and challenges Greenkeep at the old crown road.',
    enemyName: 'Veyr’s Marshal Guard',
    enemyCount: 6,
    enemyHp: 760,
    difficulty: 'Boss'
  },
  broken_standards: {
    id: 'broken_standards',
    name: 'Broken Standards',
    subtitle: 'Royal companies with mismatched banners block the Stronghold army’s first march toward the abandoned court.',
    enemyName: 'Broken Standard Companies',
    enemyCount: 6,
    enemyHp: 610,
    difficulty: 'Normal'
  },
  crownroad_ambush: {
    id: 'crownroad_ambush',
    name: 'Crownroad Ambush',
    subtitle: 'A veteran force attacks Greenkeep’s full six-squad column among the abandoned royal wagons.',
    enemyName: 'Crownroad Veterans',
    enemyCount: 6,
    enemyHp: 790,
    difficulty: 'Elite'
  },
  pretender_general: {
    id: 'pretender_general',
    name: 'The Pretender General',
    subtitle: 'The officer commanding the last royal companies claims emergency authority over the crownless realm.',
    enemyName: 'Pretender General’s Host',
    enemyCount: 6,
    enemyHp: 1280,
    difficulty: 'Boss'
  },
  old_royal_lands: {
    id: 'old_royal_lands',
    name: 'Old Royal Lands',
    subtitle: 'Greenkeep’s Capital army enters the abandoned royal estates where patrols still enforce obsolete Crown decrees.',
    enemyName: 'Royal Estate Patrol',
    enemyCount: 6,
    enemyHp: 930,
    difficulty: 'Elite'
  },
  ashen_envoy: {
    id: 'ashen_envoy',
    name: 'Ashen Envoy',
    subtitle: 'A masked delegation offers Greenkeep recognition in exchange for ending the investigation into the old royal records.',
    enemyName: 'Ashen Envoy Retinue',
    enemyCount: 6,
    enemyHp: 1180,
    difficulty: 'Elite'
  },
  gate_of_crownspire: {
    id: 'gate_of_crownspire',
    name: 'Gate of Crownspire',
    subtitle: 'Ashen Court forces hold the western gate while Greenkeep’s Capital army pushes toward the neutral fortress.',
    enemyName: 'Ashen Gate Vanguard',
    enemyCount: 6,
    enemyHp: 1580,
    difficulty: 'Boss'
  },
  sundered_fields: {
    id: 'sundered_fields',
    name: 'Sundered Fields',
    subtitle: 'The Grand Campaign crosses the battlefield where the first Crownfall evacuation collapsed.',
    enemyName: 'Ashen Field Cohort',
    enemyCount: 6,
    enemyHp: 1380,
    difficulty: 'Elite'
  },
  ashen_court: {
    id: 'ashen_court',
    name: 'Ashen Court',
    subtitle: 'Greenkeep assaults the Court district inside Crownspire before the Beacon chamber can be sealed.',
    enemyName: 'Ashen Court Inner Guard',
    enemyCount: 6,
    enemyHp: 1780,
    difficulty: 'Elite'
  },
  return_to_crownspire: {
    id: 'return_to_crownspire',
    name: 'Return to Crownspire',
    subtitle: 'The final Human assault reaches the Concord chamber and the Ashen commander holding the Oath Seal.',
    enemyName: 'Ashen Court Regent',
    enemyCount: 6,
    enemyHp: 2400,
    difficulty: 'Boss'
  },
  elf_wardbreakers: {
    id: 'elf_wardbreakers',
    name: 'Wardbreakers',
    subtitle: 'Unknown cutters are damaging the outer Heartgrove wardstones and leaving signs meant to implicate foreign raiders.',
    enemyName: 'Wardbreaker Band',
    enemyCount: 3,
    enemyHp: 132,
    difficulty: 'Normal'
  },
  elf_ashen_tracks: {
    id: 'elf_ashen_tracks',
    name: 'Ashen Tracks',
    subtitle: 'The Wardens follow ash-marked bootprints into a grove where the outer wards have been deliberately weakened.',
    enemyName: 'Ashen Trackers',
    enemyCount: 4,
    enemyHp: 245,
    difficulty: 'Elite'
  },
  elf_hollow_warden: {
    id: 'elf_hollow_warden',
    name: 'The Hollow Warden',
    subtitle: 'A corrupted guardian blocks the rootway while hidden agents continue damaging the Heartgrove wards.',
    enemyName: 'Hollow Warden',
    enemyCount: 5,
    enemyHp: 280,
    difficulty: 'Boss'
  },
  orc_red_road: {
    id: 'orc_red_road',
    name: 'Blood on the Red Road',
    subtitle: 'Armed strangers wearing stolen clan marks attack travelers near Emberclan territory.',
    enemyName: 'False-Marked Raiders',
    enemyCount: 3,
    enemyHp: 138,
    difficulty: 'Normal'
  },
  orc_invader_scouts: {
    id: 'orc_invader_scouts',
    name: 'Invader Scouts',
    subtitle: 'Emberclan catches a foreign scouting party carrying copied clan symbols and maps of rival Orc camps.',
    enemyName: 'Foreign Scouts',
    enemyCount: 4,
    enemyHp: 255,
    difficulty: 'Elite'
  },
  orc_blamecaller: {
    id: 'orc_blamecaller',
    name: 'The Blamecaller',
    subtitle: 'A mercenary agitator is paying raiders to attack under stolen clan marks and spread calls for retaliation.',
    enemyName: 'Blamecaller Warband',
    enemyCount: 5,
    enemyHp: 385,
    difficulty: 'Boss'
  },
  elf_last_heartgrove: {
    id: 'elf_last_heartgrove',
    name: 'The Last Heartgrove',
    subtitle: 'Wardens defend the surviving inner grove while ash-marked raiders test every weak point in the ward line.',
    enemyName: 'Ash-Marked Raiders',
    enemyCount: 4,
    enemyHp: 315,
    difficulty: 'Normal'
  },
  elf_ward_hunters: {
    id: 'elf_ward_hunters',
    name: 'Ward Hunters',
    subtitle: 'Specialists carrying ward-cutting tools move through the moonwell paths toward the sanctuary.',
    enemyName: 'Ward Hunter Cell',
    enemyCount: 5,
    enemyHp: 445,
    difficulty: 'Elite'
  },
  elf_ashroot_stalker: {
    id: 'elf_ashroot_stalker',
    name: 'Ashroot Stalker',
    subtitle: 'A corrupted stalker feeds on broken ward lines and guards the road toward Moonlit Pass.',
    enemyName: 'Ashroot Stalker',
    enemyCount: 5,
    enemyHp: 640,
    difficulty: 'Boss'
  },
  orc_gather_clans: {
    id: 'orc_gather_clans',
    name: 'Gather the Clans',
    subtitle: 'Emberclan escorts envoys across the Red Plains while false-marked raiders try to prevent the clans from meeting.',
    enemyName: 'Red Plains Raiders',
    enemyCount: 4,
    enemyHp: 325,
    difficulty: 'Normal'
  },
  orc_stonejaw_challengers: {
    id: 'orc_stonejaw_challengers',
    name: 'Stonejaw Challengers',
    subtitle: 'A rival warband tests Emberclan strength before allowing passage toward the Stonejaw Range.',
    enemyName: 'Stonejaw Challengers',
    enemyCount: 5,
    enemyHp: 465,
    difficulty: 'Elite'
  },
  orc_clanbreaker: {
    id: 'orc_clanbreaker',
    name: 'Clanbreaker',
    subtitle: 'A paid agitator and his veterans are trying to turn the gathered clans against one another before the council can bind them.',
    enemyName: 'Clanbreaker Host',
    enemyCount: 5,
    enemyHp: 665,
    difficulty: 'Boss'
  },
  elf_moonlit_pass: {
    id: 'elf_moonlit_pass',
    name: 'Moonlit Pass',
    subtitle: 'The Wardhold column enters a narrow pass where ward beacons have gone silent one by one.',
    enemyName: 'Moonlit Pass Raiders',
    enemyCount: 5,
    enemyHp: 520,
    difficulty: 'Normal'
  },
  elf_ashen_groves: {
    id: 'elf_ashen_groves',
    name: 'Ashen Groves',
    subtitle: 'A hidden cell has burned ward roots and planted false tracks through the eastern groves.',
    enemyName: 'Ashen Grove Cell',
    enemyCount: 6,
    enemyHp: 690,
    difficulty: 'Elite'
  },
  elf_pale_ranger: {
    id: 'elf_pale_ranger',
    name: 'The Pale Ranger',
    subtitle: 'A former border ranger now commands the saboteurs controlling the far end of Moonlit Pass.',
    enemyName: 'Pale Ranger Host',
    enemyCount: 6,
    enemyHp: 920,
    difficulty: 'Boss'
  },
  orc_stonejaw_trial: {
    id: 'orc_stonejaw_trial',
    name: 'The Stonejaw Trial',
    subtitle: 'The Warhold enters Stonejaw territory and must prove strength without allowing the trial to become another clan war.',
    enemyName: 'Stonejaw Trial Warband',
    enemyCount: 5,
    enemyHp: 540,
    difficulty: 'Normal'
  },
  orc_broken_steppe: {
    id: 'orc_broken_steppe',
    name: 'Broken Steppe',
    subtitle: 'Foreign weapons and false clan standards appear among raiders crossing the Broken Steppe.',
    enemyName: 'Broken Steppe Raiders',
    enemyCount: 6,
    enemyHp: 710,
    difficulty: 'Elite'
  },
  orc_stonejaw_champion: {
    id: 'orc_stonejaw_champion',
    name: 'Stonejaw Champion',
    subtitle: 'A champion convinced the clans are being betrayed challenges Emberclan before the new oath can hold.',
    enemyName: 'Stonejaw Champion Host',
    enemyCount: 6,
    enemyHp: 950,
    difficulty: 'Boss'
  },
  elf_roots_in_ash: {
    id: 'elf_roots_in_ash',
    name: 'Roots in Ash',
    subtitle: 'The Enclave pushes into groves where living roots and ash-corrupted growth are tangled together.',
    enemyName: 'Ashroot Warband',
    enemyCount: 6,
    enemyHp: 760,
    difficulty: 'Normal'
  },
  elf_two_fronts: {
    id: 'elf_two_fronts',
    name: 'Two Fronts',
    subtitle: 'Wardbreakers strike the rootways while an Ashen force attacks the outer grove at the same time.',
    enemyName: 'Ashen Twin Front',
    enemyCount: 6,
    enemyHp: 980,
    difficulty: 'Elite'
  },
  elf_ashen_druid: {
    id: 'elf_ashen_druid',
    name: 'Ashen Druid',
    subtitle: 'A corrupted Druid is forcing the burned wards to feed an Ashen ritual around the Worldroot approaches.',
    enemyName: 'Ashen Druid Circle',
    enemyCount: 6,
    enemyHp: 1320,
    difficulty: 'Boss',
    fantasyThreat: 'magic'
  },
  orc_two_front_war: {
    id: 'orc_two_front_war',
    name: 'War on Two Fronts',
    subtitle: 'Emberclan must hold the Steppe road while a second false-standard force attacks the rear clan camps.',
    enemyName: 'Split-Front Raiders',
    enemyCount: 6,
    enemyHp: 790,
    difficulty: 'Normal'
  },
  orc_broken_steppe_war: {
    id: 'orc_broken_steppe_war',
    name: 'Broken Steppe War',
    subtitle: 'The false standards spread into a larger Steppe battle while rival clans receive contradictory orders.',
    enemyName: 'Broken Steppe Warhost',
    enemyCount: 6,
    enemyHp: 1010,
    difficulty: 'Elite'
  },
  orc_split_chieftain: {
    id: 'orc_split_chieftain',
    name: 'The Split-Chieftain',
    subtitle: 'A chieftain manipulated by Ashen couriers tries to divide the gathered clans before the two-front pact can hold.',
    enemyName: 'Split-Chieftain Host',
    enemyCount: 6,
    enemyHp: 1360,
    difficulty: 'Boss'
  },
  elf_wounded_worldroot: {
    id: 'elf_wounded_worldroot',
    name: 'The Wounded Worldroot',
    subtitle: 'The Sanctuary reaches the ancient Worldroot basin where Ashen cuts still pulse through living ward-lines.',
    enemyName: 'Worldroot Scar Guard',
    enemyCount: 6,
    enemyHp: 1180,
    difficulty: 'Normal'
  },
  elf_ashen_rootkeepers: {
    id: 'elf_ashen_rootkeepers',
    name: 'Ashen Rootkeepers',
    subtitle: 'Corrupted keepers are sealing the deepest maintenance roots and destroying records of the old Concord safeguards.',
    enemyName: 'Ashen Rootkeepers',
    enemyCount: 6,
    enemyHp: 1510,
    difficulty: 'Elite'
  },
  elf_worldroot_guardian: {
    id: 'elf_worldroot_guardian',
    name: 'Worldroot Guardian',
    subtitle: 'A guardian bound to damaged Crownfall instructions blocks the route that still points toward the Root Seal.',
    enemyName: 'Worldroot Guardian',
    enemyCount: 6,
    enemyHp: 1960,
    difficulty: 'Boss',
    fantasyThreat: 'large'
  },
  orc_no_clan_left_behind: {
    id: 'orc_no_clan_left_behind',
    name: 'No Clan Left Behind',
    subtitle: 'The High Warhold marches to recover isolated clans before Ashen agents can erase their Warfires and histories.',
    enemyName: 'Ashen Isolation Warband',
    enemyCount: 6,
    enemyHp: 1210,
    difficulty: 'Normal'
  },
  orc_ashen_clanbreakers: {
    id: 'orc_ashen_clanbreakers',
    name: 'Ashen Clanbreakers',
    subtitle: 'Veteran agitators attack the united clans with forged oaths, stolen banners and contradictory blood-debts.',
    enemyName: 'Ashen Clanbreakers',
    enemyCount: 6,
    enemyHp: 1540,
    difficulty: 'Elite'
  },
  orc_last_clanbreaker: {
    id: 'orc_last_clanbreaker',
    name: 'Last Clanbreaker',
    subtitle: 'The final Ashen organizer guarding the old clan oath-stones refuses to let the clans learn where the Clan Seal was taken.',
    enemyName: 'Last Clanbreaker Host',
    enemyCount: 6,
    enemyHp: 2010,
    difficulty: 'Boss'
  },
  elf_stars_over_crownspire: {
    id: 'elf_stars_over_crownspire',
    name: 'Stars over Crownspire',
    subtitle: 'The Starroot Conclave enters the neutral approaches under a chosen Worldroot Attunement.',
    enemyName: 'Ashen Starwatch',
    enemyCount: 6,
    enemyHp: 1680,
    difficulty: 'Elite'
  },
  orc_truth_at_crownspire: {
    id: 'orc_truth_at_crownspire',
    name: 'The Truth at Crownspire',
    subtitle: 'The Warfire Confederacy reaches Crownspire with every clan bound by one active Pact.',
    enemyName: 'Ashen Warfire Guard',
    enemyCount: 6,
    enemyHp: 1710,
    difficulty: 'Elite'
  },
  elf_ashen_starwatch: {
    id: 'elf_ashen_starwatch',
    name: 'Ashen Starwatch',
    subtitle: 'The Conclave assaults the observatory network guarding the Root Seal chamber.',
    enemyName: 'Ashen Starwatch',
    enemyCount: 6,
    enemyHp: 2140,
    difficulty: 'Elite'
  },
  elf_return_through_roots: {
    id: 'elf_return_through_roots',
    name: 'Return through the Roots',
    subtitle: 'An Ashen Regent retreats through Crownspire with the Root Seal while the living rootways collapse behind the army.',
    enemyName: 'Rootbound Ashen Regent',
    enemyCount: 6,
    enemyHp: 2860,
    difficulty: 'Boss'
  },
  orc_ashen_warfires: {
    id: 'orc_ashen_warfires',
    name: 'Ashen Warfires',
    subtitle: 'The Confederacy assaults false Warfires guarding the Clan Seal chamber.',
    enemyName: 'Ashen Warfire Host',
    enemyCount: 6,
    enemyHp: 2190,
    difficulty: 'Elite',
    fantasyThreat: 'magic'
  },
  orc_crownspire_warmaster: {
    id: 'orc_crownspire_warmaster',
    name: 'Truth at Crownspire',
    subtitle: 'The final Ashen Warmaster retreats with the Clan Seal and tries to fracture the Confederacy one last time.',
    enemyName: 'Ashen Warfire Regent',
    enemyCount: 6,
    enemyHp: 2920,
    difficulty: 'Boss'
  },
  three_seals_convergence: {
    id: 'three_seals_convergence',
    name: 'Converging Roads',
    subtitle: 'The lead army opens the central Crownspire road while Human, Elf and Orc allied forces converge from three directions.',
    enemyName: 'Ashen Convergence Guard',
    enemyCount: 6,
    enemyHp: 2380,
    difficulty: 'Elite'
  },
  ashen_triumvirate: {
    id: 'ashen_triumvirate',
    name: 'Ashen Triumvirate',
    subtitle: 'Three senior Ashen commanders launch a coordinated attack to break the alliance before the Seals can stabilize the Beacon.',
    enemyName: 'Ashen Triumvirate',
    enemyCount: 6,
    enemyHp: 2860,
    difficulty: 'Elite'
  },
  unbound_beacon: {
    id: 'unbound_beacon',
    name: 'The Unbound Beacon',
    subtitle: 'The last Ashen Regent forces the Beacon beyond its safeguards while all three allied armies hold the chamber approaches.',
    enemyName: 'Unbound Beacon Regent',
    enemyCount: 6,
    enemyHp: 3600,
    difficulty: 'Boss',
    fantasyThreat: 'hybrid'
  }
};


export type EnemyFormationTactic = {
  formationShapeId: FormationShapeId;
  name: string;
  summary: string;
  attackMultiplier: number;
  armorMultiplier: number;
  speedMultiplier: number;
};

const enemyFormationProfiles: Record<FormationShapeId, Omit<EnemyFormationTactic, 'formationShapeId'>> = {
  balanced_333: {
    name: 'Balanced Line',
    summary: 'Even depth with no obvious weak lane.',
    attackMultiplier: 1,
    armorMultiplier: 1,
    speedMultiplier: 1
  },
  assault_432: {
    name: 'Assault Line',
    summary: 'Four squads press the first rank while a smaller rear line trades safety for tempo.',
    attackMultiplier: 1.06,
    armorMultiplier: 0.98,
    speedMultiplier: 1.02
  },
  deep_234: {
    name: 'Deep Formation',
    summary: 'A narrow screen protects deeper reserves and makes the enemy harder to finish quickly.',
    attackMultiplier: 1,
    armorMultiplier: 1.05,
    speedMultiplier: 0.98
  },
  wide_vanguard_522: {
    name: 'Wide Vanguard',
    summary: 'A five-wide front is difficult to flank but has little depth if the line breaks.',
    attackMultiplier: 1.02,
    armorMultiplier: 1.06,
    speedMultiplier: 0.97
  },
  protected_rear_225: {
    name: 'Protected Rear',
    summary: 'A thin screen buys time for dangerous ranged or support pressure from the rear.',
    attackMultiplier: 1.07,
    armorMultiplier: 0.96,
    speedMultiplier: 1
  },
  reinforced_center_252: {
    name: 'Reinforced Center',
    summary: 'A dense reserve reinforces whichever lane starts to fail.',
    attackMultiplier: 1.04,
    armorMultiplier: 1.04,
    speedMultiplier: 0.98
  },
  heavy_front_441: {
    name: 'Heavy Front',
    summary: 'Two combat-heavy ranks push hard with almost no safe rear line.',
    attackMultiplier: 1.08,
    armorMultiplier: 1.04,
    speedMultiplier: 0.95
  },
  spear_wall_531: {
    name: 'Spear Wall',
    summary: 'A broad braced line absorbs charges and slows the fight into a frontal grind.',
    attackMultiplier: 0.99,
    armorMultiplier: 1.09,
    speedMultiplier: 0.92
  },
  skirmish_screen_243: {
    name: 'Skirmish Screen',
    summary: 'A light front and mobile middle rank create faster, less predictable exchanges.',
    attackMultiplier: 1.03,
    armorMultiplier: 0.95,
    speedMultiplier: 1.08
  },
  forward_line_411: {
    name: 'Forward Line',
    summary: 'Four squads press first contact while one middle reserve and one rear squad preserve minimal depth.',
    attackMultiplier: 1.05,
    armorMultiplier: 0.97,
    speedMultiplier: 1.02
  },
  iron_wall_501: {
    name: 'Iron Wall',
    summary: 'Five squads lock the frontage with no second line behind them and only one protected rear position.',
    attackMultiplier: 0.98,
    armorMultiplier: 1.08,
    speedMultiplier: 0.92
  },
  layered_core_231: {
    name: 'Layered Core',
    summary: 'A narrow screen protects a mobile three-squad center and one dedicated rear position.',
    attackMultiplier: 1.01,
    armorMultiplier: 1.02,
    speedMultiplier: 1.03
  }
};

const enemyFormationByEncounter: Record<EncounterId, FormationShapeId> = {
  hold_the_road: 'skirmish_screen_243',
  war_table_broken_spear: 'wide_vanguard_522',
  war_table_blackwood_ambush: 'protected_rear_225',
  war_table_red_banner: 'forward_line_411',
  war_table_dusk_riders: 'skirmish_screen_243',
  war_table_stonegate_pikes: 'iron_wall_501',
  war_table_ashen_reserves: 'layered_core_231',
  war_table_hollow_guard: 'deep_234',
  war_table_ironclad_push: 'heavy_front_441',
  war_table_crownroad_lancers: 'skirmish_screen_243',
  war_table_ashen_hex_circle: 'protected_rear_225',
  war_table_sky_raiders: 'skirmish_screen_243',
  war_table_golem_breach: 'heavy_front_441',
  mercenary_patrol: 'assault_432',
  toll_captain: 'wide_vanguard_522',
  reclaim_outpost: 'iron_wall_501',
  ch2_defend_camp: 'assault_432',
  ch2_beyond_fires: 'iron_wall_501',
  ch2_brace: 'skirmish_screen_243',
  ch2_take_watch: 'wide_vanguard_522',
  ch2_riders_banner: 'assault_432',
  iron_road_skirmish: 'balanced_333',
  iron_provost: 'spear_wall_531',
  border_fort: 'wide_vanguard_522',
  siege_road: 'spear_wall_531',
  lord_marshal_veyr: 'reinforced_center_252',
  broken_standards: 'assault_432',
  crownroad_ambush: 'skirmish_screen_243',
  pretender_general: 'reinforced_center_252',
  old_royal_lands: 'balanced_333',
  ashen_envoy: 'protected_rear_225',
  gate_of_crownspire: 'heavy_front_441',
  sundered_fields: 'skirmish_screen_243',
  ashen_court: 'protected_rear_225',
  return_to_crownspire: 'heavy_front_441',

  elf_wardbreakers: 'skirmish_screen_243',
  elf_ashen_tracks: 'skirmish_screen_243',
  elf_hollow_warden: 'deep_234',
  elf_last_heartgrove: 'deep_234',
  elf_ward_hunters: 'protected_rear_225',
  elf_ashroot_stalker: 'skirmish_screen_243',
  elf_moonlit_pass: 'deep_234',
  elf_ashen_groves: 'protected_rear_225',
  elf_pale_ranger: 'protected_rear_225',
  elf_roots_in_ash: 'deep_234',
  elf_two_fronts: 'skirmish_screen_243',
  elf_ashen_druid: 'protected_rear_225',
  elf_wounded_worldroot: 'deep_234',
  elf_ashen_rootkeepers: 'reinforced_center_252',
  elf_worldroot_guardian: 'reinforced_center_252',
  elf_stars_over_crownspire: 'skirmish_screen_243',
  elf_ashen_starwatch: 'protected_rear_225',
  elf_return_through_roots: 'reinforced_center_252',

  orc_red_road: 'assault_432',
  orc_invader_scouts: 'skirmish_screen_243',
  orc_blamecaller: 'wide_vanguard_522',
  orc_gather_clans: 'assault_432',
  orc_stonejaw_challengers: 'wide_vanguard_522',
  orc_clanbreaker: 'heavy_front_441',
  orc_stonejaw_trial: 'wide_vanguard_522',
  orc_broken_steppe: 'skirmish_screen_243',
  orc_stonejaw_champion: 'heavy_front_441',
  orc_two_front_war: 'assault_432',
  orc_broken_steppe_war: 'wide_vanguard_522',
  orc_split_chieftain: 'heavy_front_441',
  orc_no_clan_left_behind: 'assault_432',
  orc_ashen_clanbreakers: 'heavy_front_441',
  orc_last_clanbreaker: 'heavy_front_441',
  orc_truth_at_crownspire: 'wide_vanguard_522',
  orc_ashen_warfires: 'spear_wall_531',
  orc_crownspire_warmaster: 'heavy_front_441',

  three_seals_convergence: 'reinforced_center_252',
  ashen_triumvirate: 'heavy_front_441',
  unbound_beacon: 'balanced_333'
};

export function getEnemyFormationTactic(id: EncounterId): EnemyFormationTactic {
  const formationShapeId = enemyFormationByEncounter[id] ?? 'balanced_333';
  return {
    formationShapeId,
    ...enemyFormationProfiles[formationShapeId]
  };
}


export type EnemyArmyProfileId =
  | 'raider_pack'
  | 'mercenary_line'
  | 'shield_host'
  | 'missile_company'
  | 'mounted_hunters'
  | 'shock_warband'
  | 'warded_host'
  | 'elite_command';

export type EnemyArmyProfile = {
  id: EnemyArmyProfileId;
  name: string;
  summary: string;
  pressureSummary: string;
  rolePlan: {
    front: UnitRole[];
    middle: UnitRole[];
    rear: UnitRole[];
  };
  roleLabels: Partial<Record<UnitRole, string>>;
  openingPressureMultiplier: number;
  sustainedPressureMultiplier: number;
  armorMultiplier: number;
};

export type EnemyRoleAssignment = {
  slot: number;
  row: 'front' | 'middle' | 'rear';
  role: UnitRole;
  label: string;
};

const enemyArmyProfiles: Record<EnemyArmyProfileId, EnemyArmyProfile> = {
  raider_pack: {
    id: 'raider_pack',
    name: 'Raider Pack',
    summary: 'Loose skirmishers and bruisers try to win the opening exchanges before discipline matters.',
    pressureSummary: 'Fast opening · weaker staying power',
    rolePlan: {
      front: ['skirmish', 'melee'],
      middle: ['skirmish', 'melee', 'cavalry'],
      rear: ['ranged', 'skirmish']
    },
    roleLabels: {
      skirmish: 'Raider',
      melee: 'Bruiser',
      cavalry: 'Rider',
      ranged: 'Bow Raider'
    },
    openingPressureMultiplier: 1.03,
    sustainedPressureMultiplier: 0.99,
    armorMultiplier: 0.99
  },
  mercenary_line: {
    id: 'mercenary_line',
    name: 'Mercenary Company',
    summary: 'A disciplined combined-arms company mixes infantry, missiles and field support.',
    pressureSummary: 'Balanced pressure · no major role weakness',
    rolePlan: {
      front: ['frontline', 'melee'],
      middle: ['melee', 'ranged'],
      rear: ['ranged', 'support']
    },
    roleLabels: {
      frontline: 'Shield',
      melee: 'Sword',
      ranged: 'Crossbow',
      support: 'Sergeant'
    },
    openingPressureMultiplier: 1,
    sustainedPressureMultiplier: 1,
    armorMultiplier: 1
  },
  shield_host: {
    id: 'shield_host',
    name: 'Shield Host',
    summary: 'Dense infantry absorbs pressure while a smaller second line protects the approach.',
    pressureSummary: 'Durable front · slower damage pressure',
    rolePlan: {
      front: ['frontline', 'frontline', 'melee'],
      middle: ['frontline', 'melee'],
      rear: ['ranged', 'support']
    },
    roleLabels: {
      frontline: 'Shield',
      melee: 'Guard',
      ranged: 'Archer',
      support: 'Standard'
    },
    openingPressureMultiplier: 0.99,
    sustainedPressureMultiplier: 0.99,
    armorMultiplier: 1.02
  },
  missile_company: {
    id: 'missile_company',
    name: 'Missile Company',
    summary: 'A light screen protects a dangerous concentration of ranged troops in the deeper ranks.',
    pressureSummary: 'Pressure grows after the opening · fragile if reached',
    rolePlan: {
      front: ['frontline', 'skirmish'],
      middle: ['ranged', 'melee'],
      rear: ['ranged', 'support', 'ranged']
    },
    roleLabels: {
      frontline: 'Screen',
      skirmish: 'Scout',
      melee: 'Guard',
      ranged: 'Marksman',
      support: 'Spotter'
    },
    openingPressureMultiplier: 0.99,
    sustainedPressureMultiplier: 1.02,
    armorMultiplier: 0.99
  },
  mounted_hunters: {
    id: 'mounted_hunters',
    name: 'Mounted Hunters',
    summary: 'Fast riders and scouts try to create an early breakthrough before a longer melee develops.',
    pressureSummary: 'Strong opening charge · fades in long fights',
    rolePlan: {
      front: ['cavalry', 'skirmish'],
      middle: ['cavalry', 'melee'],
      rear: ['ranged', 'skirmish']
    },
    roleLabels: {
      cavalry: 'Rider',
      skirmish: 'Scout',
      melee: 'Hunter',
      ranged: 'Horse Bow'
    },
    openingPressureMultiplier: 1.04,
    sustainedPressureMultiplier: 0.98,
    armorMultiplier: 0.98
  },
  shock_warband: {
    id: 'shock_warband',
    name: 'Shock Warband',
    summary: 'Aggressive melee fighters pile into the front and middle ranks to keep pressure high.',
    pressureSummary: 'Heavy opening pressure · lighter protection',
    rolePlan: {
      front: ['melee', 'frontline', 'melee'],
      middle: ['melee', 'cavalry'],
      rear: ['skirmish', 'melee']
    },
    roleLabels: {
      frontline: 'Breaker',
      melee: 'Crusher',
      cavalry: 'Rider',
      skirmish: 'Flanker'
    },
    openingPressureMultiplier: 1.04,
    sustainedPressureMultiplier: 1.01,
    armorMultiplier: 0.98
  },
  warded_host: {
    id: 'warded_host',
    name: 'Warded Host',
    summary: 'Protective support and ranged specialists stabilize a smaller frontline instead of racing for damage.',
    pressureSummary: 'Protected specialists · steady later pressure',
    rolePlan: {
      front: ['frontline', 'melee'],
      middle: ['support', 'melee'],
      rear: ['support', 'ranged', 'ranged']
    },
    roleLabels: {
      frontline: 'Warden',
      melee: 'Keeper',
      ranged: 'Watcher',
      support: 'Ward'
    },
    openingPressureMultiplier: 0.98,
    sustainedPressureMultiplier: 1.01,
    armorMultiplier: 1.02
  },
  elite_command: {
    id: 'elite_command',
    name: 'Elite Command',
    summary: 'Veteran guards, specialists and command support cover one another with few obvious role gaps.',
    pressureSummary: 'Small all-round elite bonus',
    rolePlan: {
      front: ['frontline', 'melee'],
      middle: ['melee', 'support', 'cavalry'],
      rear: ['ranged', 'support']
    },
    roleLabels: {
      frontline: 'Vanguard',
      melee: 'Veteran',
      ranged: 'Marksman',
      support: 'Officer',
      cavalry: 'Lancer'
    },
    openingPressureMultiplier: 1.02,
    sustainedPressureMultiplier: 1.02,
    armorMultiplier: 1.01
  }
};

const enemyArmyProfileByFormation: Record<FormationShapeId, EnemyArmyProfileId> = {
  balanced_333: 'mercenary_line',
  assault_432: 'shock_warband',
  deep_234: 'warded_host',
  wide_vanguard_522: 'shield_host',
  protected_rear_225: 'missile_company',
  reinforced_center_252: 'elite_command',
  heavy_front_441: 'shock_warband',
  spear_wall_531: 'shield_host',
  skirmish_screen_243: 'raider_pack',
  forward_line_411: 'shock_warband',
  iron_wall_501: 'shield_host',
  layered_core_231: 'elite_command'
};

const enemyArmyProfileOverrides: Partial<Record<EncounterId, EnemyArmyProfileId>> = {
  war_table_broken_spear: 'shield_host',
  war_table_blackwood_ambush: 'missile_company',
  war_table_red_banner: 'shock_warband',
  war_table_dusk_riders: 'mounted_hunters',
  war_table_stonegate_pikes: 'shield_host',
  war_table_ashen_reserves: 'elite_command',
  war_table_hollow_guard: 'warded_host',
  war_table_ironclad_push: 'shock_warband',
  war_table_crownroad_lancers: 'mounted_hunters',
  war_table_ashen_hex_circle: 'warded_host',
  war_table_sky_raiders: 'mounted_hunters',
  war_table_golem_breach: 'shock_warband',
  mercenary_patrol: 'mercenary_line',
  ch2_defend_camp: 'raider_pack',
  ch2_beyond_fires: 'mercenary_line',
  ch2_brace: 'mounted_hunters',
  ch2_take_watch: 'shield_host',
  ch2_riders_banner: 'mounted_hunters',
  iron_road_skirmish: 'mercenary_line',
  lord_marshal_veyr: 'elite_command',
  pretender_general: 'elite_command',
  ashen_envoy: 'missile_company',
  return_to_crownspire: 'elite_command',

  elf_hollow_warden: 'warded_host',
  elf_last_heartgrove: 'warded_host',
  elf_pale_ranger: 'mounted_hunters',
  elf_ashen_druid: 'warded_host',
  elf_ashen_rootkeepers: 'warded_host',
  elf_worldroot_guardian: 'elite_command',
  elf_stars_over_crownspire: 'mounted_hunters',
  elf_return_through_roots: 'warded_host',

  orc_invader_scouts: 'mounted_hunters',
  orc_broken_steppe: 'mounted_hunters',
  orc_broken_steppe_war: 'mounted_hunters',
  orc_stonejaw_champion: 'shock_warband',
  orc_split_chieftain: 'shock_warband',
  orc_crownspire_warmaster: 'elite_command',

  three_seals_convergence: 'elite_command',
  ashen_triumvirate: 'elite_command',
  unbound_beacon: 'elite_command'
};

export function getEnemyArmyProfile(id: EncounterId): EnemyArmyProfile {
  const tactic = getEnemyFormationTactic(id);
  const profileId =
    enemyArmyProfileOverrides[id] ??
    enemyArmyProfileByFormation[tactic.formationShapeId];

  return enemyArmyProfiles[profileId];
}

function centerFirstEnemySlots(slots: number[]) {
  const middle = (slots.length - 1) / 2;
  return [...slots].sort(
    (a, b) =>
      Math.abs(slots.indexOf(a) - middle) -
      Math.abs(slots.indexOf(b) - middle)
  );
}

function getFantasyThreatRolePlan(
  id: EncounterId
): {
  rolePlan: EnemyArmyProfile['rolePlan'];
  roleLabels: EnemyArmyProfile['roleLabels'];
} | null {
  const threat = encounters[id].fantasyThreat;
  if (!threat) return null;

  if (threat === 'magic') {
    return {
      rolePlan: {
        front: ['frontline', 'melee'],
        middle: ['support', 'ranged', 'melee'],
        rear: ['support', 'ranged', 'support']
      },
      roleLabels: {
        frontline: 'Ward Guard',
        melee: 'Hexblade',
        ranged: 'Spellbow',
        support: 'Hexcaster'
      }
    };
  }

  if (threat === 'flying') {
    return {
      rolePlan: {
        front: ['skirmish', 'cavalry'],
        middle: ['cavalry', 'skirmish', 'ranged'],
        rear: ['ranged', 'skirmish']
      },
      roleLabels: {
        cavalry: 'Sky Raider',
        skirmish: 'Talon Scout',
        ranged: 'Sky Archer',
        melee: 'Wingblade'
      }
    };
  }

  if (threat === 'large') {
    return {
      rolePlan: {
        front: ['frontline', 'melee', 'frontline'],
        middle: ['frontline', 'melee'],
        rear: ['ranged', 'support']
      },
      roleLabels: {
        frontline: 'Golem',
        melee: 'Crusher',
        ranged: 'Stone Hurler',
        support: 'Binder'
      }
    };
  }

  return {
    rolePlan: {
      front: ['cavalry', 'frontline'],
      middle: ['support', 'ranged', 'cavalry'],
      rear: ['support', 'ranged']
    },
    roleLabels: {
      frontline: 'Legend Guard',
      cavalry: 'Arcane Flyer',
      ranged: 'Spellwing',
      support: 'War Caster'
    }
  };
}

export function getEnemyRoleAssignments(
  id: EncounterId,
  rows: {
    front: number[];
    middle: number[];
    rear: number[];
  },
  enemyCount: number
): EnemyRoleAssignment[] {
  const profile = getEnemyArmyProfile(id);
  const fantasyPresentation =
    getFantasyThreatRolePlan(id);
  const rolePlan =
    fantasyPresentation?.rolePlan ??
    profile.rolePlan;
  const roleLabels =
    fantasyPresentation?.roleLabels ??
    profile.roleLabels;
  const rowEntries = [
    ['front', rows.front],
    ['middle', rows.middle],
    ['rear', rows.rear]
  ] as const;
  const cappedCount = Math.max(0, Math.min(9, enemyCount));
  const capacities = rowEntries.map(([, slots]) => slots.length);
  const ideals = capacities.map(capacity => (cappedCount * capacity) / 9);
  const counts = ideals.map(value => Math.floor(value));
  let remaining =
    cappedCount -
    counts.reduce((sum, value) => sum + value, 0);

  while (remaining > 0) {
    let bestRow = -1;
    let bestNeed = -Infinity;

    counts.forEach((count, index) => {
      if (count >= capacities[index]!) return;
      const need = ideals[index]! - count;
      if (need > bestNeed) {
        bestNeed = need;
        bestRow = index;
      }
    });

    if (bestRow < 0) break;
    counts[bestRow] = counts[bestRow]! + 1;
    remaining -= 1;
  }

  const assignments: EnemyRoleAssignment[] = [];

  rowEntries.forEach(([row, slots], rowIndex) => {
    const rowRolePlan = rolePlan[row];
    centerFirstEnemySlots(slots)
      .slice(0, counts[rowIndex] ?? 0)
      .forEach((slot, index) => {
        const role =
          rowRolePlan[index % rowRolePlan.length] ??
          'melee';
        assignments.push({
          slot,
          row,
          role,
          label:
            roleLabels[role] ??
            role.charAt(0).toUpperCase() +
              role.slice(1)
        });
      });
  });

  return assignments;
}

export const encounterRewards: Record<EncounterId, EncounterReward> = {
  hold_the_road: {
    resources: { gold: 45, wood: 12, iron: 3, provisions: 4 },
    storySummary: 'The raider patrol breaks. Refugees can finally reach the ruins of Greenkeep.'
  },
  war_table_broken_spear: {
    resources: { gold: 30, iron: 3, provisions: 2 },
    storySummary: 'The Broken Spear Company abandons the crossing. Your scouts recover a small cache without changing the campaign front.'
  },
  war_table_blackwood_ambush: {
    resources: { gold: 26, wood: 8, provisions: 3 },
    storySummary: 'The Blackwood ambush is scattered before it can close the road. The contract pays modestly and the campaign remains unchanged.'
  },
  war_table_red_banner: {
    resources: { gold: 48, iron: 4, provisions: 3 },
    storySummary: 'The Red Banner assault collapses under disciplined resistance. The contract pays out without changing the campaign front.'
  },
  war_table_dusk_riders: {
    resources: { gold: 28, provisions: 4 },
    storySummary: 'The Dusk Riders scatter from the road network. Scouts recover a modest contract payment and fresh provisions.'
  },
  war_table_stonegate_pikes: {
    resources: { gold: 30, stone: 5 },
    storySummary: 'The Stonegate wall breaks formation and abandons the crossing. Nearby caravans pay a small clearing bounty.'
  },
  war_table_ashen_reserves: {
    resources: { gold: 42, stone: 4, iron: 2 },
    storySummary: 'The reserve company withdraws after its central rotation is disrupted. The War Table records the tactical lesson.'
  },
  war_table_hollow_guard: {
    resources: { gold: 40, wood: 6, provisions: 3 },
    storySummary: 'The Hollow Guard gives up its seized stores rather than continue the layered retreat.'
  },
  war_table_ironclad_push: {
    resources: { gold: 52, iron: 5, stone: 3 },
    storySummary: 'The Ironclad Company finally loses momentum. Salvaged fittings and contract coin make up the reward.'
  },
  war_table_crownroad_lancers: {
    resources: { gold: 50, iron: 2, provisions: 5 },
    storySummary: 'The veteran riders are forced off the route after their maneuver lanes close. Patrol traffic resumes.'
  },
  war_table_ashen_hex_circle: {
    resources: { gold: 46, wood: 5, provisions: 4 },
    storySummary: 'The ritual cell collapses after its warded caster screen is disrupted. Patrols recover supplies and a useful record of Ashen spell tactics.'
  },
  war_table_sky_raiders: {
    resources: { gold: 52, iron: 3, provisions: 6 },
    storySummary: 'The Sky Raiders lose control of the air approaches and abandon the route. Scouts recover gear and intact supply packs.'
  },
  war_table_golem_breach: {
    resources: { gold: 55, stone: 6, iron: 5 },
    storySummary: 'The Golem Vanguard is dismantled before it reaches the inner roads. Salvaged stone and metal are returned to the kingdom.'
  },
  mercenary_patrol: {
    resources: { gold: 65, wood: 8, iron: 5, provisions: 3 },
    storySummary: 'The mercenaries retreat, leaving behind sealed pay records tied to Crownspire coin.'
  },
  toll_captain: {
    resources: { gold: 70, wood: 12, iron: 5, provisions: 4 },
    storySummary: 'The captain is cut off from the outpost. His dispatch case reveals how thin the remaining garrison has become.'
  },
  reclaim_outpost: {
    resources: { gold: 120, wood: 90, stone: 45, iron: 12, provisions: 8 },
    storySummary: 'The old outpost falls. Greenkeep controls the western road and has the stone, timber and authority needed to build beyond a temporary camp.'
  },
  ch2_defend_camp: {
    resources: { gold: 48, wood: 10, provisions: 5 },
    storySummary: 'The probing force breaks against the camp. Greenkeep survives, but remaining behind the fires will only invite a larger attack.'
  },
  ch2_beyond_fires: {
    resources: { gold: 55, wood: 8, stone: 5, provisions: 4 },
    storySummary: 'The outer approach is cleared. Greenkeep can now support a sixth deployed squad and organize Front, Middle and Rear lines.'
  },
  ch2_brace: {
    resources: { gold: 72, iron: 6, provisions: 5 },
    storySummary: 'The Road Lancers are stopped. Greenkeep proves that mounted shock can be answered by prepared spear lines and disciplined counter-charges.'
  },
  ch2_take_watch: {
    resources: { gold: 92, wood: 14, stone: 12, iron: 8, provisions: 5 },
    storySummary: 'The watch post falls. Its height opens the surrounding roads to proper scouting and lets Greenkeep field a seventh active squad.'
  },
  ch2_riders_banner: {
    resources: { gold: 190, wood: 90, stone: 72, iron: 24, provisions: 12 },
    storySummary: 'The Rider’s Banner falls. Captured dispatches prove that several local commanders were supplied and directed from beyond the region.'
  },
  iron_road_skirmish: {
    resources: { gold: 55, iron: 6, provisions: 3 },
    storySummary: 'The patrol secures the roadside mine. Greenkeep can now draw a steady trickle of iron from the Iron Hills approach.'
  },
  iron_provost: {
    resources: { gold: 180, wood: 100, stone: 90, iron: 25, provisions: 10 },
    storySummary: 'The Iron Provost falls and the road network opens. Greenkeep now has the wealth and authority to grow into a true Town.'
  },
  border_fort: {
    resources: { gold: 85, stone: 12, iron: 7, provisions: 4 },
    storySummary: 'The border fort yields. Its orders show three separate marcher authorities issuing contradictory warnings about the same enemy.'
  },
  siege_road: {
    resources: { gold: 105, wood: 18, stone: 16, iron: 9, provisions: 5 },
    storySummary: 'Siege Road is opened. Captured dispatches prove the marcher houses were deliberately given conflicting commands.'
  },
  lord_marshal_veyr: {
    resources: { gold: 260, wood: 150, stone: 120, iron: 35, provisions: 12 },
    storySummary: 'Lord Marshal Veyr is defeated. The Border Marches recognize Greenkeep as the strongest western authority and the road toward the broken Crown opens.'
  },
  broken_standards: {
    resources: { gold: 120, wood: 20, iron: 12, provisions: 6 },
    storySummary: 'The mismatched royal companies scatter. Their standards all carry legitimate seals from different years, suggesting authority was deliberately fragmented.'
  },
  crownroad_ambush: {
    resources: { gold: 145, wood: 24, stone: 18, iron: 14, provisions: 7 },
    storySummary: 'The ambush fails. Greenkeep captures veteran officers who still claim to serve a court that no longer exists.'
  },
  pretender_general: {
    resources: { gold: 430, wood: 210, stone: 175, iron: 55, provisions: 18 },
    storySummary: 'The Pretender General falls. With the old royal command broken, Greenkeep becomes the strongest organized authority in the western realm.'
  },
  old_royal_lands: {
    resources: { gold: 175, wood: 28, stone: 22, iron: 16, provisions: 8 },
    storySummary: 'The estate patrol yields. Greenkeep captures administrative ledgers that point toward deliberately altered records in the old royal archives.'
  },
  ashen_envoy: {
    resources: { gold: 210, wood: 32, stone: 24, iron: 20, provisions: 9 },
    storySummary: 'The Envoy’s retinue is defeated. Their private ledger names the Ashen Court and links the false orders across the western realm.'
  },
  gate_of_crownspire: {
    resources: { gold: 520, wood: 240, stone: 210, iron: 70, provisions: 20 },
    storySummary: 'The western gate opens. Greenkeep reaches Crownspire and can prepare a final Grand Campaign against the Ashen Court around the Concord Beacon.'
  },
  sundered_fields: {
    resources: { gold: 230, wood: 34, stone: 28, iron: 22, provisions: 10 },
    storySummary: 'The Sundered Fields are secured. Greenkeep reaches a sealed Concord maintenance route beneath Crownspire.'
  },
  ashen_court: {
    resources: { gold: 280, wood: 38, stone: 30, iron: 26, provisions: 12 },
    storySummary: 'The Ashen Court district falls. Records inside confirm the Court forced the Beacon activation that caused the Crownfall.'
  },
  return_to_crownspire: {
    resources: { gold: 700, wood: 300, stone: 260, iron: 90, provisions: 25 },
    storySummary: 'The Ashen Regent falls and Greenkeep recovers the Human Oath Seal. The Human campaign is complete.'
  },
  elf_wardbreakers: {
    resources: { gold: 42, wood: 10, provisions: 5 },
    storySummary: 'The Wardbreakers flee. Their tools carry unfamiliar ash residue that does not belong to the Heartgrove.'
  },
  elf_ashen_tracks: {
    resources: { gold: 58, wood: 12, provisions: 5 },
    storySummary: 'The Ashen Trackers are driven from the grove. Their tools match the damage found on the outer wardstones.'
  },
  elf_hollow_warden: {
    resources: { gold: 95, wood: 30, stone: 14, provisions: 8 },
    storySummary: 'The Hollow Warden is released from the corruption. The Wardens now know an organized network is attacking Heartgrove safeguards.'
  },
  orc_red_road: {
    resources: { gold: 40, wood: 8, iron: 2, provisions: 6 },
    storySummary: 'The false-marked raiders break. Their clan paint was applied over Human-made buckles and foreign leather.'
  },
  orc_invader_scouts: {
    resources: { gold: 55, wood: 10, iron: 3, provisions: 6 },
    storySummary: 'The foreign scouts are defeated. Their maps mark several clans as targets for manufactured reprisals.'
  },
  orc_blamecaller: {
    resources: { gold: 100, wood: 24, stone: 12, iron: 6, provisions: 10 },
    storySummary: 'The Blamecaller falls. Emberclan now has proof that outsiders are manufacturing clan violence to keep the Orcs divided.'
  },
  elf_last_heartgrove: {
    resources: { gold: 58, wood: 14, stone: 4, provisions: 6 },
    storySummary: 'The inner grove holds. The attackers were probing for moonwell routes rather than trying to seize territory.'
  },
  elf_ward_hunters: {
    resources: { gold: 72, wood: 14, stone: 8, provisions: 6 },
    storySummary: 'The Ward Hunters are defeated. Their route maps point toward a hidden organizer beyond the restored moonwell paths.'
  },
  elf_ashroot_stalker: {
    resources: { gold: 135, wood: 50, stone: 28, iron: 6, provisions: 10 },
    storySummary: 'The Ashroot Stalker falls. Heartgrove can now fortify the rootway and prepare to enter Moonlit Pass.'
  },
  orc_gather_clans: {
    resources: { gold: 56, wood: 12, iron: 3, provisions: 7 },
    storySummary: 'The clan envoys arrive safely. The raids were meant to keep the clans isolated and suspicious.'
  },
  orc_stonejaw_challengers: {
    resources: { gold: 70, wood: 12, stone: 7, iron: 5, provisions: 7 },
    storySummary: 'The Stonejaw challengers yield. Emberclan has earned the right to call a wider Warfire Council.'
  },
  orc_clanbreaker: {
    resources: { gold: 140, wood: 45, stone: 26, iron: 10, provisions: 12 },
    storySummary: 'The Clanbreaker falls. The gathered clans agree to march toward the Stonejaw Trial under a single temporary pact.'
  },
  elf_moonlit_pass: {
    resources: { gold: 78, wood: 16, stone: 8, provisions: 7 },
    storySummary: 'Moonlit Pass is entered. The silent beacons show the sabotage extends beyond Heartgrove itself.'
  },
  elf_ashen_groves: {
    resources: { gold: 95, wood: 18, stone: 10, iron: 4, provisions: 7 },
    storySummary: 'The Ashen Groves are cleared. The saboteurs carried route orders signed by a Pale Ranger beyond the pass.'
  },
  elf_pale_ranger: {
    resources: { gold: 185, wood: 80, stone: 55, iron: 12, provisions: 14 },
    storySummary: 'The Pale Ranger falls. Heartgrove controls Moonlit Pass and can grow into a permanent Enclave.'
  },
  orc_stonejaw_trial: {
    resources: { gold: 75, wood: 14, stone: 10, iron: 5, provisions: 8 },
    storySummary: 'Emberclan passes the first Stonejaw trial without turning it into a blood feud.'
  },
  orc_broken_steppe: {
    resources: { gold: 92, wood: 16, stone: 12, iron: 7, provisions: 8 },
    storySummary: 'The Broken Steppe raiders are defeated. Their false standards point to another attempt to split the clans.'
  },
  orc_stonejaw_champion: {
    resources: { gold: 190, wood: 75, stone: 52, iron: 18, provisions: 15 },
    storySummary: 'The Stonejaw Champion yields. The clans accept Emberclan’s oath and the Warhold can grow into a Great Warhold.'
  },
  elf_roots_in_ash: {
    resources: { gold: 105, wood: 22, stone: 12, provisions: 8 },
    storySummary: 'The Enclave holds the ash-root line and proves the burned groves can be reclaimed instead of abandoned.'
  },
  elf_two_fronts: {
    resources: { gold: 128, wood: 26, stone: 14, iron: 6, provisions: 9 },
    storySummary: 'Both Elven fronts hold. Captured orders point to an Ashen Druid coordinating the simultaneous attacks.'
  },
  elf_ashen_druid: {
    resources: { gold: 265, wood: 120, stone: 90, iron: 24, provisions: 18 },
    storySummary: 'The Ashen Druid falls. The Worldroot approaches are open and Heartgrove can prepare a true Sanctuary for six active squads.'
  },
  orc_two_front_war: {
    resources: { gold: 108, wood: 20, stone: 12, iron: 8, provisions: 10 },
    storySummary: 'Emberclan holds both roads. The attacks were deliberately timed to make each clan believe the other had abandoned it.'
  },
  orc_broken_steppe_war: {
    resources: { gold: 132, wood: 24, stone: 16, iron: 9, provisions: 10 },
    storySummary: 'The Steppe warhost breaks. Ashen couriers were feeding different battle orders to each front.'
  },
  orc_split_chieftain: {
    resources: { gold: 275, wood: 115, stone: 88, iron: 30, provisions: 20 },
    storySummary: 'The Split-Chieftain yields. The clans accept a permanent High Warhold and prepare to bring every clan into the next campaign.'
  },
  elf_wounded_worldroot: {
    resources: { gold: 145, wood: 30, stone: 18, provisions: 10 },
    storySummary: 'The Worldroot scar line is secured. Old maintenance roots reveal that the damage follows the same three-part Concord geometry seen at Crownspire.'
  },
  elf_ashen_rootkeepers: {
    resources: { gold: 175, wood: 34, stone: 22, iron: 8, provisions: 11 },
    storySummary: 'The Ashen Rootkeepers fall. Their records prove the Root Seal still exists and was moved toward Crownspire after the Crownfall.'
  },
  elf_worldroot_guardian: {
    resources: { gold: 360, wood: 160, stone: 120, iron: 36, provisions: 22 },
    storySummary: 'The Worldroot Guardian is released from the damaged command. The road to Crownspire is open, but the Root Seal itself still lies ahead.'
  },
  orc_no_clan_left_behind: {
    resources: { gold: 150, wood: 26, stone: 18, iron: 10, provisions: 12 },
    storySummary: 'The isolated clans are recovered. Their extinguished Warfires form a deliberate pattern leading toward the old Crownspire routes.'
  },
  orc_ashen_clanbreakers: {
    resources: { gold: 180, wood: 30, stone: 22, iron: 12, provisions: 12 },
    storySummary: 'The Ashen Clanbreakers are defeated. Oath-stones confirm the Clan Seal survived and was carried toward Crownspire.'
  },
  orc_last_clanbreaker: {
    resources: { gold: 370, wood: 150, stone: 115, iron: 42, provisions: 24 },
    storySummary: 'The Last Clanbreaker falls. Every surviving clan recognizes one Confederacy and one final road toward the Clan Seal at Crownspire.'
  },
  elf_stars_over_crownspire: {
    resources: { gold: 215, wood: 36, stone: 26, iron: 10, provisions: 12 },
    storySummary: 'The Ashen Starwatch is broken. The chosen Worldroot Attunement carries the Elven army into Crownspire’s Concord rootways.'
  },
  orc_truth_at_crownspire: {
    resources: { gold: 220, wood: 34, stone: 25, iron: 14, provisions: 13 },
    storySummary: 'The Ashen Warfire Guard breaks. The united clans enter Crownspire and begin tracing the original Concord warpath.'
  },
  elf_ashen_starwatch: {
    resources: { gold: 250, wood: 42, stone: 30, iron: 12, provisions: 14 },
    storySummary: 'The Ashen Starwatch falls. The Conclave reaches the Root Seal chamber before the final Regent can escape.'
  },
  elf_return_through_roots: {
    resources: { gold: 620, wood: 240, stone: 190, iron: 60, provisions: 26 },
    storySummary: 'The Rootbound Regent falls. Heartgrove recovers the Root Seal and the Elf campaign is complete.'
  },
  orc_ashen_warfires: {
    resources: { gold: 255, wood: 40, stone: 30, iron: 16, provisions: 15 },
    storySummary: 'The Ashen Warfires are extinguished. The Confederacy reaches the Clan Seal chamber before the Warmaster can escape.'
  },
  orc_crownspire_warmaster: {
    resources: { gold: 640, wood: 230, stone: 185, iron: 70, provisions: 28 },
    storySummary: 'The Ashen Warmaster falls. The united clans recover the Clan Seal and the Orc campaign is complete.'
  },
  three_seals_convergence: {
    resources: { gold: 320, wood: 60, stone: 50, iron: 24, provisions: 18 },
    storySummary: 'The Converging Roads are secured. All three allied armies now hold routes into the Concord Chamber.'
  },
  ashen_triumvirate: {
    resources: { gold: 420, wood: 70, stone: 60, iron: 30, provisions: 20 },
    storySummary: 'The Ashen Triumvirate breaks. The three-faction alliance holds long enough to begin the final Beacon stabilization.'
  },
  unbound_beacon: {
    resources: { gold: 1000, wood: 300, stone: 260, iron: 100, provisions: 40 },
    storySummary: 'The last Ashen Regent falls. The Oath, Root and Clan Seals stabilize the Beacon under the restored three-part Concord.'
  }
};

const standardWarTableEncounters = new Set<EncounterId>([
  'war_table_broken_spear',
  'war_table_blackwood_ambush',
  'war_table_dusk_riders',
  'war_table_stonegate_pikes'
]);

const veteranWarTableEncounters = new Set<EncounterId>([
  'war_table_red_banner',
  'war_table_ashen_reserves',
  'war_table_hollow_guard'
]);

const eliteWarTableEncounters = new Set<EncounterId>([
  'war_table_ironclad_push',
  'war_table_crownroad_lancers'
]);

export function getWarTableEncounterScaling(
  id: EncounterId,
  chapterNumber: number
) {
  const chapter = Math.max(
    1,
    Math.min(6, Math.floor(chapterNumber))
  );

  if (standardWarTableEncounters.has(id)) {
    return {
      hpMultiplier:
        1 + (chapter - 1) * 0.22,
      pressureMultiplier:
        1 + (chapter - 1) * 0.04
    };
  }

  if (veteranWarTableEncounters.has(id)) {
    const laterChapter = Math.max(
      0,
      chapter - 2
    );
    return {
      hpMultiplier:
        2.15 + laterChapter * 0.3,
      pressureMultiplier:
        1.42 + laterChapter * 0.075
    };
  }

  if (eliteWarTableEncounters.has(id)) {
    const laterChapter = Math.max(
      0,
      chapter - 3
    );
    return {
      hpMultiplier:
        2.8 + laterChapter * 0.36,
      pressureMultiplier:
        1.65 + laterChapter * 0.09
    };
  }

  return {
    hpMultiplier: 1,
    pressureMultiplier: 1
  };
}

export function getEncounter(id: EncounterId) {
  return encounters[id];
}

export function getEncounterForChapter(
  id: EncounterId,
  chapterNumber: number
) {
  const encounter = getEncounter(id);
  if (!id.startsWith('war_table_')) {
    return encounter;
  }

  const scaling =
    getWarTableEncounterScaling(
      id,
      chapterNumber
    );

  return {
    ...encounter,
    enemyHp: Math.max(
      1,
      Math.round(
        encounter.enemyHp *
          scaling.hpMultiplier
      )
    ),
    pressureMultiplier:
      (encounter.pressureMultiplier ?? 1) *
      scaling.pressureMultiplier
  };
}
