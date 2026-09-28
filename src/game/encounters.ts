import type { EncounterDefinition, ResourceWallet } from './types';

export type EncounterId =
  | 'hold_the_road'
  | 'mercenary_patrol'
  | 'toll_captain'
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
    name: 'Hold the Road',
    subtitle: 'A raider patrol is blocking the refugee road to Greenkeep.',
    enemyName: 'Road Raiders',
    enemyCount: 3,
    enemyHp: 128,
    difficulty: 'Normal'
  },
  mercenary_patrol: {
    id: 'mercenary_patrol',
    name: 'Mercenary Patrol',
    subtitle: 'A contracted warband is sweeping the road before Greenkeep can trace its employer.',
    enemyName: 'Green Banner Company',
    enemyCount: 4,
    enemyHp: 220,
    difficulty: 'Elite'
  },
  toll_captain: {
    id: 'toll_captain',
    name: 'The Toll Captain',
    subtitle: 'The mercenary captain holding the old Greenkeep toll fort refuses to abandon the road.',
    enemyName: 'Toll Captain Host',
    enemyCount: 5,
    enemyHp: 340,
    difficulty: 'Boss'
  },
  iron_road_skirmish: {
    id: 'iron_road_skirmish',
    name: 'Iron Road Skirmish',
    subtitle: 'Greenkeep’s first Fort patrol runs into mercenaries guarding an abandoned roadside mine.',
    enemyName: 'Iron Road Mercenaries',
    enemyCount: 5,
    enemyHp: 285,
    difficulty: 'Elite'
  },
  iron_provost: {
    id: 'iron_provost',
    name: 'The Iron Provost',
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
    enemyHp: 1120,
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
    enemyHp: 340,
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
    difficulty: 'Boss'
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
    difficulty: 'Boss'
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
    difficulty: 'Elite'
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
    difficulty: 'Boss'
  }
};

export const encounterRewards: Record<EncounterId, EncounterReward> = {
  hold_the_road: {
    resources: { gold: 45, wood: 12, iron: 3, provisions: 4 },
    storySummary: 'The raider patrol breaks. Refugees can finally reach the ruins of Greenkeep.'
  },
  mercenary_patrol: {
    resources: { gold: 65, wood: 8, iron: 5, provisions: 3 },
    storySummary: 'The mercenaries retreat, leaving behind sealed pay records tied to Crownspire coin.'
  },
  toll_captain: {
    resources: { gold: 120, wood: 90, stone: 45, iron: 12, provisions: 8 },
    storySummary: 'The old toll fort falls. Greenkeep now controls the western road and has the stone, timber and authority needed to become a true Fort.'
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

export function getEncounter(id: EncounterId) {
  return encounters[id];
}
