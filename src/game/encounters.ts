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
  | 'orc_stonejaw_champion';

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
    enemyHp: 365,
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
  }
};

export function getEncounter(id: EncounterId) {
  return encounters[id];
}
