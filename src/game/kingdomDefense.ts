import { getFormationMatchup } from './formation';
import type {
  FactionId,
  FormationShapeId,
  SettlementAdjacencyEffects,
  WagonItemDefinition
} from './types';

export type KingdomDefenseWave = {
  id: string;
  name: string;
  pressure: string;
  formationShapeId: FormationShapeId;
  threat: number;
  wear: number;
  final?: boolean;
};

export type KingdomDefenseChoiceId =
  | 'rest'
  | 'reinforce'
  | 'scout'
  | 'hold';

export type KingdomDefenseBuildingIds = {
  hall: string;
  army: string;
  logistics: string;
  supply: string;
  command: string;
  scout: string;
};

export type KingdomDefenseFortification = {
  powerMultiplier: number;
  supplyReserve: number;
  permanentIntel: boolean;
  bonuses: Array<{
    label: string;
    value: string;
  }>;
  hasRations: boolean;
  hasMedicine: boolean;
  hasRepairKit: boolean;
};

export type KingdomDefenseChoiceResult = {
  reserve: number;
  readiness: number;
  nextWavePowerBonus: number;
  revealNextWave: boolean;
  summary: string;
};

const storyWaves: Record<
  FactionId,
  KingdomDefenseWave[]
> = {
  human: [
    {
      id: 'story_road_raiders',
      name: 'Road Raiders',
      pressure:
        'Fast skirmishers probe the outer approaches before the main attack arrives.',
      formationShapeId: 'skirmish_screen_243',
      threat: 84,
      wear: 5
    },
    {
      id: 'story_bowline',
      name: 'Mercenary Bowline',
      pressure:
        'A protected missile line tries to exhaust the defenders from behind a compact screen.',
      formationShapeId: 'protected_rear_225',
      threat: 104,
      wear: 7
    },
    {
      id: 'story_assault',
      name: 'Green Banner Assault',
      pressure:
        'The main company commits an aggressive 4–3–2 push against Greenkeep.',
      formationShapeId: 'assault_432',
      threat: 124,
      wear: 9,
      final: true
    }
  ],
  elf: [
    {
      id: 'story_ashwood',
      name: 'Ashwood Raiders',
      pressure:
        'Fast raiders test the outer rootways and try to collapse the ward line early.',
      formationShapeId: 'skirmish_screen_243',
      threat: 84,
      wear: 5
    },
    {
      id: 'story_wardbreakers',
      name: 'Wardbreaker Bowline',
      pressure:
        'Missile troops hide behind a compact screen and target the grove paths.',
      formationShapeId: 'protected_rear_225',
      threat: 104,
      wear: 7
    },
    {
      id: 'story_grove_assault',
      name: 'Ashen Grove Assault',
      pressure:
        'A coordinated assault tries to break the Heartgrove ward network at once.',
      formationShapeId: 'assault_432',
      threat: 124,
      wear: 9,
      final: true
    }
  ],
  orc: [
    {
      id: 'story_steppe',
      name: 'Steppe Raiders',
      pressure:
        'Fast attackers hit the outer fires before the clans can fully muster.',
      formationShapeId: 'skirmish_screen_243',
      threat: 84,
      wear: 5
    },
    {
      id: 'story_clanbreaker_bows',
      name: 'Clanbreaker Bowline',
      pressure:
        'A protected missile line tries to bleed the Warhold before the main clash.',
      formationShapeId: 'protected_rear_225',
      threat: 104,
      wear: 7
    },
    {
      id: 'story_warhost',
      name: 'Ashen Warhost Assault',
      pressure:
        'The main warhost commits a heavy opening push against the clan line.',
      formationShapeId: 'assault_432',
      threat: 124,
      wear: 9,
      final: true
    }
  ]
};

const enduranceWaves: Record<
  FactionId,
  KingdomDefenseWave[]
> = {
  human: [
    {
      id: 'endurance_scouts',
      name: 'Border Skirmishers',
      pressure:
        'A mobile screen searches for weak lanes before heavier troops arrive.',
      formationShapeId: 'skirmish_screen_243',
      threat: 90,
      wear: 5
    },
    {
      id: 'endurance_shields',
      name: 'Broken Spear Host',
      pressure:
        'A 5–2–2 shield front spreads across the approaches and denies easy flanks.',
      formationShapeId: 'wide_vanguard_522',
      threat: 108,
      wear: 6
    },
    {
      id: 'endurance_bows',
      name: 'Blackwood Bowline',
      pressure:
        'A 2–2–5 protected rear line concentrates ranged pressure behind a thin screen.',
      formationShapeId: 'protected_rear_225',
      threat: 126,
      wear: 7
    },
    {
      id: 'endurance_assault',
      name: 'Red Banner Assault',
      pressure:
        'A 4–3–2 assault commits heavily to the opening exchanges.',
      formationShapeId: 'assault_432',
      threat: 144,
      wear: 8
    },
    {
      id: 'endurance_command',
      name: 'Ironroad Marshal',
      pressure:
        'An elite 2–5–2 command host keeps reserves ready to reinforce whichever lane starts to break.',
      formationShapeId: 'reinforced_center_252',
      threat: 162,
      wear: 10,
      final: true
    }
  ],
  elf: [
    {
      id: 'endurance_scouts',
      name: 'Ashwood Stalkers',
      pressure:
        'A mobile screen searches the rootways for gaps in the ward line.',
      formationShapeId: 'skirmish_screen_243',
      threat: 90,
      wear: 5
    },
    {
      id: 'endurance_shields',
      name: 'Ashen Shield Host',
      pressure:
        'A broad first rank pushes through multiple grove approaches at once.',
      formationShapeId: 'wide_vanguard_522',
      threat: 108,
      wear: 6
    },
    {
      id: 'endurance_bows',
      name: 'Wardbreaker Bowline',
      pressure:
        'A deep missile line focuses on exposed ward anchors and support routes.',
      formationShapeId: 'protected_rear_225',
      threat: 126,
      wear: 7
    },
    {
      id: 'endurance_assault',
      name: 'Rootburn Assault',
      pressure:
        'Aggressive infantry tries to pin the Elven line before it can rotate.',
      formationShapeId: 'assault_432',
      threat: 144,
      wear: 8
    },
    {
      id: 'endurance_command',
      name: 'Ashen Grove Marshal',
      pressure:
        'An elite central reserve adapts to the ward network and reinforces the threatened approach.',
      formationShapeId: 'reinforced_center_252',
      threat: 162,
      wear: 10,
      final: true
    }
  ],
  orc: [
    {
      id: 'endurance_scouts',
      name: 'Steppe Stalkers',
      pressure:
        'Fast skirmishers circle the outer fires and test the Warhold response.',
      formationShapeId: 'skirmish_screen_243',
      threat: 90,
      wear: 5
    },
    {
      id: 'endurance_shields',
      name: 'Stonejaw Shield Host',
      pressure:
        'A broad 5–2–2 front tries to blunt the warband before momentum can build.',
      formationShapeId: 'wide_vanguard_522',
      threat: 108,
      wear: 6
    },
    {
      id: 'endurance_bows',
      name: 'Clanbreaker Bowline',
      pressure:
        'A protected rear line attempts to weaken the clans before the charge reaches it.',
      formationShapeId: 'protected_rear_225',
      threat: 126,
      wear: 7
    },
    {
      id: 'endurance_assault',
      name: 'Ashen Bloodrush',
      pressure:
        'A 4–3–2 assault meets the warbands head-on with heavy opening pressure.',
      formationShapeId: 'assault_432',
      threat: 144,
      wear: 8
    },
    {
      id: 'endurance_command',
      name: 'Clanbreaker Warmarshal',
      pressure:
        'An elite reserve-heavy host absorbs the first clash and feeds strength into the center.',
      formationShapeId: 'reinforced_center_252',
      threat: 162,
      wear: 10,
      final: true
    }
  ]
};

const stageThreatMultiplier: Record<
  string,
  number
> = {
  camp: 0.82,
  settlement: 0.92,
  fort: 1,
  town: 1.12,
  stronghold: 1.25,
  capital: 1.4,
  grand: 1.52
};

export function getKingdomDefenseWaves(
  faction: FactionId,
  repeatable: boolean
) {
  return repeatable
    ? enduranceWaves[faction]
    : storyWaves[faction];
}

export function getKingdomDefenseThreat(
  wave: KingdomDefenseWave,
  wagonStageId: string,
  repeatable: boolean
) {
  const stageMultiplier = repeatable
    ? stageThreatMultiplier[wagonStageId] ?? 1
    : 1;

  return Math.round(
    wave.threat * stageMultiplier
  );
}

export function getKingdomDefenseFortification({
  buildingLevels,
  buildingIds,
  wagonItems,
  settlementEffects
}: {
  buildingLevels: Record<string, number>;
  buildingIds: KingdomDefenseBuildingIds;
  wagonItems: WagonItemDefinition[];
  settlementEffects: SettlementAdjacencyEffects;
}): KingdomDefenseFortification {
  const armyLevel =
    buildingLevels[buildingIds.army] ?? 0;
  const hallLevel =
    buildingLevels[buildingIds.hall] ?? 0;
  const commandLevel =
    buildingLevels[buildingIds.command] ?? 0;
  const supplyLevel =
    buildingLevels[buildingIds.supply] ?? 0;
  const logisticsLevel =
    buildingLevels[buildingIds.logistics] ?? 0;
  const scoutLevel =
    buildingLevels[buildingIds.scout] ?? 0;

  const hasRations =
    wagonItems.some(item => item.id === 'rations');
  const hasMedicine =
    wagonItems.some(item => item.id === 'medicine');
  const hasRepairKit =
    wagonItems.some(item => item.id === 'repair');

  const garrisonBonus = Math.min(
    0.1,
    armyLevel * 0.025
  );
  const settlementBonus = Math.min(
    0.06,
    Math.max(0, hallLevel - 2) * 0.015
  );
  const commandBonus = Math.min(
    0.06,
    commandLevel * 0.015
  );

  const powerMultiplier =
    1 +
    garrisonBonus +
    settlementBonus +
    commandBonus;

  const supplyReserve = Math.min(
    8,
    1 +
      (hasRations ? 1 : 0) +
      (hasMedicine ? 1 : 0) +
      (hasRepairKit ? 1 : 0) +
      supplyLevel +
      (logisticsLevel >= 2 ? 1 : 0)
  );

  const permanentIntel =
    scoutLevel >= 2 ||
    settlementEffects.detailedIntel;

  const bonuses: KingdomDefenseFortification['bonuses'] = [
    {
      label: 'Garrison',
      value:
        '+' +
        Math.round(garrisonBonus * 100) +
        '% defense'
    },
    {
      label: 'Settlement works',
      value:
        '+' +
        Math.round(settlementBonus * 100) +
        '% defense'
    },
    {
      label: 'Command',
      value:
        '+' +
        Math.round(commandBonus * 100) +
        '% defense'
    },
    {
      label: 'Field reserve',
      value: supplyReserve + ' supplies'
    }
  ];

  if (permanentIntel) {
    bonuses.push({
      label: 'Signal network',
      value: 'Full wave intel'
    });
  }

  return {
    powerMultiplier,
    supplyReserve,
    permanentIntel,
    bonuses,
    hasRations,
    hasMedicine,
    hasRepairKit
  };
}

export function getKingdomDefenseEffectivePower({
  basePower,
  playerShapeId,
  waveShapeId,
  readiness,
  fortificationMultiplier,
  nextWavePowerBonus
}: {
  basePower: number;
  playerShapeId: FormationShapeId;
  waveShapeId: FormationShapeId;
  readiness: number;
  fortificationMultiplier: number;
  nextWavePowerBonus: number;
}) {
  const matchup = getFormationMatchup(
    playerShapeId,
    waveShapeId
  );
  const formationMultiplier =
    matchup.outgoingDamageMultiplier /
    matchup.incomingDamageMultiplier;
  const readinessMultiplier =
    readiness >= 70
      ? 1
      : 0.88 +
        0.12 *
          Math.max(0, readiness) /
          70;

  return {
    value: Math.round(
      basePower *
        fortificationMultiplier *
        (1 + nextWavePowerBonus) *
        formationMultiplier *
        readinessMultiplier
    ),
    matchup
  };
}

export function getKingdomDefenseReadinessLoss({
  wave,
  effectivePower,
  threat,
  hasRations,
  hasMedicine
}: {
  wave: KingdomDefenseWave;
  effectivePower: number;
  threat: number;
  hasRations: boolean;
  hasMedicine: boolean;
}) {
  const ratio =
    threat > 0 ? effectivePower / threat : 1;
  const marginReduction =
    ratio >= 1.25
      ? 3
      : ratio >= 1.1
        ? 2
        : ratio >= 1
          ? 1
          : -3;

  let loss = wave.wear - marginReduction;

  if (hasRations) loss -= 1;
  if (hasMedicine) loss -= 1;

  return Math.max(
    effectivePower >= threat ? 2 : 8,
    loss
  );
}

export function applyKingdomDefenseChoice({
  choice,
  reserve,
  readiness,
  fortification
}: {
  choice: KingdomDefenseChoiceId;
  reserve: number;
  readiness: number;
  fortification: KingdomDefenseFortification;
}): KingdomDefenseChoiceResult | null {
  if (choice === 'hold') {
    return {
      reserve,
      readiness,
      nextWavePowerBonus: 0,
      revealNextWave: false,
      summary:
        'The army holds position and conserves its remaining field supplies.'
    };
  }

  if (choice === 'rest') {
    const cost = 2;
    if (reserve < cost) return null;

    const restored =
      16 +
      (fortification.hasMedicine ? 6 : 0);

    return {
      reserve: reserve - cost,
      readiness: Math.min(
        100,
        readiness + restored
      ),
      nextWavePowerBonus: 0,
      revealNextWave: false,
      summary:
        'Medicine, food and rest restore ' +
        restored +
        ' Readiness before the next attack.'
    };
  }

  if (choice === 'reinforce') {
    const cost = 1;
    if (reserve < cost) return null;

    const bonus =
      0.08 +
      (fortification.hasRepairKit ? 0.04 : 0);

    return {
      reserve: reserve - cost,
      readiness,
      nextWavePowerBonus: bonus,
      revealNextWave: false,
      summary:
        'Repair crews reinforce the line for +' +
        Math.round(bonus * 100) +
        '% defense power on the next wave.'
    };
  }

  const cost = 1;
  if (reserve < cost) return null;

  return {
    reserve: reserve - cost,
    readiness,
    nextWavePowerBonus:
      0.04 +
      (fortification.permanentIntel ? 0.02 : 0),
    revealNextWave: true,
    summary:
      'Scouts reveal the next formation and prepare a small counter-plan before contact.'
  };
}
