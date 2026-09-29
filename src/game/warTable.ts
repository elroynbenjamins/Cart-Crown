import type { EncounterId } from './encounters';
import type {
  ResourceWallet
} from './types';

export type WarTableTier =
  | 'standard'
  | 'veteran'
  | 'elite';

export type WarTableCategory =
  | 'breakthrough'
  | 'ambush'
  | 'pursuit'
  | 'hold'
  | 'counter'
  | 'hunt';

export type WarTableBonusObjective =
  | {
      type: 'swift';
      exchanges: number;
      label: string;
    }
  | {
      type: 'healthy';
      hpPercent: number;
      label: string;
    }
  | {
      type: 'low_wear';
      maxWear: number;
      label: string;
    };

export type WarTableContract = {
  id: string;
  encounterId: EncounterId;
  category: WarTableCategory;
  tier: WarTableTier;
  unlockChapter: number;
  tacticalNote: string;
  rewardLabel: string;
  bonusObjective: WarTableBonusObjective;
  bonusReward: Partial<ResourceWallet>;
};

export type WarTableBattleSummary = {
  exchanges: number;
  remainingHp: number;
  maxHp: number;
  readinessWear: number;
};

export const warTableContracts: WarTableContract[] = [
  {
    id: 'broken_spear_company',
    encounterId: 'war_table_broken_spear',
    category: 'breakthrough',
    tier: 'standard',
    unlockChapter: 1,
    tacticalNote:
      'A 5–2–2 shield-heavy front absorbs direct pressure. Concentrated depth or a formation counter matters more than raw frontage.',
    rewardLabel: 'Gold + Iron + Provisions',
    bonusObjective: {
      type: 'healthy',
      hpPercent: 65,
      label: 'Finish with at least 65% army HP'
    },
    bonusReward: { gold: 8, iron: 1 }
  },
  {
    id: 'blackwood_ambush',
    encounterId: 'war_table_blackwood_ambush',
    category: 'ambush',
    tier: 'standard',
    unlockChapter: 1,
    tacticalNote:
      'A 2–2–5 protected rear hides most of its damage behind a thin screen. Reach the backline before sustained fire takes over.',
    rewardLabel: 'Gold + Wood + Provisions',
    bonusObjective: {
      type: 'swift',
      exchanges: 8,
      label: 'Win in 8 exchanges or fewer'
    },
    bonusReward: { gold: 6, wood: 2 }
  },
  {
    id: 'dusk_riders',
    encounterId: 'war_table_dusk_riders',
    category: 'pursuit',
    tier: 'standard',
    unlockChapter: 1,
    tacticalNote:
      'Fast mounted hunters use a 2–4–3 skirmish screen. Wide pressure can close their maneuver lanes before they rotate through the middle.',
    rewardLabel: 'Gold + Provisions',
    bonusObjective: {
      type: 'low_wear',
      maxWear: 6,
      label: 'Take no more than 6 Readiness wear'
    },
    bonusReward: { gold: 8, provisions: 1 }
  },
  {
    id: 'stonegate_pikes',
    encounterId: 'war_table_stonegate_pikes',
    category: 'hold',
    tier: 'standard',
    unlockChapter: 1,
    tacticalNote:
      'A 5–3–1 spear wall is difficult to crack head-on but gives up almost all protected rear depth.',
    rewardLabel: 'Gold + Stone',
    bonusObjective: {
      type: 'healthy',
      hpPercent: 70,
      label: 'Finish with at least 70% army HP'
    },
    bonusReward: { gold: 6, stone: 2 }
  },
  {
    id: 'red_banner_raiders',
    encounterId: 'war_table_red_banner',
    category: 'hunt',
    tier: 'veteran',
    unlockChapter: 2,
    tacticalNote:
      'A 4–3–2 assault tries to win the opening exchanges. A deep formation can absorb that pressure and answer with reserves.',
    rewardLabel: 'Gold + Iron + Provisions',
    bonusObjective: {
      type: 'swift',
      exchanges: 9,
      label: 'Win in 9 exchanges or fewer'
    },
    bonusReward: { gold: 10, iron: 1 }
  },
  {
    id: 'ashen_reserves',
    encounterId: 'war_table_ashen_reserves',
    category: 'counter',
    tier: 'veteran',
    unlockChapter: 2,
    tacticalNote:
      'A 2–5–2 reserve-heavy line reinforces whichever lane starts to fail. Stretch it across the width or attack around the center.',
    rewardLabel: 'Gold + Stone + Iron',
    bonusObjective: {
      type: 'low_wear',
      maxWear: 8,
      label: 'Take no more than 8 Readiness wear'
    },
    bonusReward: { gold: 10, stone: 2 }
  },
  {
    id: 'hollow_guard',
    encounterId: 'war_table_hollow_guard',
    category: 'hold',
    tier: 'veteran',
    unlockChapter: 2,
    tacticalNote:
      'A 2–3–4 deep guard wants a long fight. Broad frontage can pressure the narrow first rank before its reserves stabilize.',
    rewardLabel: 'Gold + Wood + Provisions',
    bonusObjective: {
      type: 'healthy',
      hpPercent: 60,
      label: 'Finish with at least 60% army HP'
    },
    bonusReward: { gold: 8, provisions: 2 }
  },
  {
    id: 'ironclad_push',
    encounterId: 'war_table_ironclad_push',
    category: 'breakthrough',
    tier: 'elite',
    unlockChapter: 3,
    tacticalNote:
      'A 4–4–1 heavy front commits almost everything to two combat ranks. Survive the pressure and punish the exposed rear.',
    rewardLabel: 'Gold + Iron + Stone',
    bonusObjective: {
      type: 'healthy',
      hpPercent: 55,
      label: 'Finish with at least 55% army HP'
    },
    bonusReward: { gold: 12, iron: 2 }
  },
  {
    id: 'crownroad_lancers',
    encounterId: 'war_table_crownroad_lancers',
    category: 'pursuit',
    tier: 'elite',
    unlockChapter: 3,
    tacticalNote:
      'Veteran mounted hunters use mobility and repeated lane changes. Deny open lanes and force them into a direct exchange.',
    rewardLabel: 'Gold + Provisions + Iron',
    bonusObjective: {
      type: 'swift',
      exchanges: 10,
      label: 'Win in 10 exchanges or fewer'
    },
    bonusReward: { gold: 12, provisions: 2 }
  },
  {
    id: 'ashen_hex_circle',
    encounterId: 'war_table_ashen_hex_circle',
    category: 'counter',
    tier: 'veteran',
    unlockChapter: 4,
    tacticalNote:
      'Magic threat: a warded caster line builds pressure behind protection. Bring support, your own magic specialists or enough frontline stability to survive the spell cycle.',
    rewardLabel: 'Gold + Wood + Provisions',
    bonusObjective: {
      type: 'low_wear',
      maxWear: 10,
      label: 'Take no more than 10 Readiness wear'
    },
    bonusReward: { gold: 10, wood: 2 }
  },
  {
    id: 'sky_raiders',
    encounterId: 'war_table_sky_raiders',
    category: 'pursuit',
    tier: 'elite',
    unlockChapter: 5,
    tacticalNote:
      'Flying threat: aerial squads bypass ordinary screens and attack protected lanes. Ranged and skirmish pressure act as practical anti-air.',
    rewardLabel: 'Gold + Provisions + Iron',
    bonusObjective: {
      type: 'healthy',
      hpPercent: 60,
      label: 'Finish with at least 60% army HP'
    },
    bonusReward: { gold: 12, provisions: 2 }
  },
  {
    id: 'golem_breach',
    encounterId: 'war_table_golem_breach',
    category: 'breakthrough',
    tier: 'elite',
    unlockChapter: 6,
    tacticalNote:
      'Large threat: oversized constructs trade speed for breakthrough power. Spears, lancers and concentrated ranged fire are the most reliable answers.',
    rewardLabel: 'Gold + Stone + Iron',
    bonusObjective: {
      type: 'swift',
      exchanges: 11,
      label: 'Win in 11 exchanges or fewer'
    },
    bonusReward: { gold: 12, iron: 2 }
  }
];

const byTier = (tier: WarTableTier) =>
  warTableContracts.filter(
    contract => contract.tier === tier
  );

function pickRotating(
  contracts: WarTableContract[],
  cycle: number,
  count: number
) {
  if (contracts.length === 0 || count <= 0) {
    return [];
  }

  const result: WarTableContract[] = [];
  const start =
    ((cycle % contracts.length) +
      contracts.length) %
    contracts.length;

  for (
    let offset = 0;
    offset < contracts.length &&
    result.length < count;
    offset += 1
  ) {
    const contract =
      contracts[
        (start + offset) %
          contracts.length
      ]!;

    if (
      !result.some(
        existing =>
          existing.id === contract.id
      )
    ) {
      result.push(contract);
    }
  }

  return result;
}

export function getWarTablePostedContracts({
  cycle,
  boardChapter
}: {
  cycle: number;
  boardChapter: number;
}) {
  const chapter = Math.max(
    1,
    Math.floor(boardChapter)
  );
  const standard = byTier('standard').filter(
    contract =>
      contract.unlockChapter <= chapter
  );
  const veteran = byTier('veteran').filter(
    contract =>
      contract.unlockChapter <= chapter
  );
  const elite = byTier('elite').filter(
    contract =>
      contract.unlockChapter <= chapter
  );

  if (chapter <= 1) {
    return pickRotating(
      standard,
      cycle,
      3
    );
  }

  if (chapter === 2) {
    return [
      ...pickRotating(
        standard,
        cycle,
        2
      ),
      ...pickRotating(
        veteran,
        cycle,
        1
      )
    ];
  }

  return [
    ...pickRotating(
      standard,
      cycle,
      1
    ),
    ...pickRotating(
      veteran,
      cycle,
      1
    ),
    ...pickRotating(
      elite,
      cycle,
      1
    )
  ];
}

export function getWarTableContract(
  contractId: string
) {
  return warTableContracts.find(
    contract => contract.id === contractId
  ) ?? null;
}

export function getWarTableContractByEncounter(
  encounterId: EncounterId
) {
  return warTableContracts.find(
    contract =>
      contract.encounterId === encounterId
  ) ?? null;
}

export function getWarTableTierLabel(
  tier: WarTableTier
) {
  return tier === 'standard'
    ? 'STANDARD'
    : tier === 'veteran'
      ? 'VETERAN'
      : 'ELITE';
}

export function getWarTableCategoryLabel(
  category: WarTableCategory
) {
  const labels: Record<
    WarTableCategory,
    string
  > = {
    breakthrough: 'Breakthrough',
    ambush: 'Ambush',
    pursuit: 'Pursuit',
    hold: 'Hold',
    counter: 'Counter-Formation',
    hunt: 'Hunt'
  };

  return labels[category];
}

export function evaluateWarTableBonus(
  contract: WarTableContract,
  summary: WarTableBattleSummary
) {
  const objective =
    contract.bonusObjective;

  if (objective.type === 'swift') {
    return (
      summary.exchanges <=
      objective.exchanges
    );
  }

  if (
    objective.type === 'low_wear'
  ) {
    return (
      summary.readinessWear <=
      objective.maxWear
    );
  }

  const hpPercent =
    summary.maxHp > 0
      ? (
          summary.remainingHp /
          summary.maxHp
        ) *
        100
      : 0;

  return hpPercent >= objective.hpPercent;
}

export function isWarTableBoardCleared({
  postedContracts,
  completedContractIds
}: {
  postedContracts: readonly WarTableContract[];
  completedContractIds: readonly string[];
}) {
  return (
    postedContracts.length > 0 &&
    postedContracts.every(
      contract =>
        completedContractIds.includes(
          contract.id
        )
    )
  );
}
