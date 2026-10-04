import type { EncounterId } from './encounters';
import type {
  ChapterNode,
  FactionId,
  ResourceWallet
} from './types';

export type EarlyCampaignMissionMode = 'battle' | 'event';

export type EarlyCampaignMission = {
  nodeId: string;
  chapter: 1 | 2;
  order: number;
  canonicalName: string;
  names: Record<FactionId, string>;
  nodeType: ChapterNode['type'];
  mode: EarlyCampaignMissionMode;
  encounterId?: EncounterId;
  actionLabel: string;
  purpose: string;
  briefing: string;
  unlockSummary: string;
  eventReward?: Partial<ResourceWallet>;
};

const factionNames = (
  human: string,
  elf = human,
  orc = human
): Record<FactionId, string> => ({ human, elf, orc });

export const earlyCampaignMissions: EarlyCampaignMission[] = [
  {
    nodeId: 'early_ch1_01',
    chapter: 1,
    order: 1,
    canonicalName: 'A Banner Still Flies',
    names: factionNames(
      'A Banner Still Flies',
      'A Ward Still Glows',
      'A Warbanner Still Flies'
    ),
    nodeType: 'battle',
    mode: 'battle',
    encounterId: 'early_banner_still_flies',
    actionLabel: 'PLAY',
    purpose: 'Learn the first two-squad deployment through action instead of a text wall.',
    briefing: 'A small hostile force has found the remnant before it is ready. Form two squads and prove the survivors can still fight as one.',
    unlockSummary: 'Campaign battle flow and basic deployment.'
  },
  {
    nodeId: 'early_ch1_02',
    chapter: 1,
    order: 2,
    canonicalName: 'Hold the Crossing',
    names: factionNames(
      'Hold the Crossing',
      'Hold the Rootway',
      'Hold the Red Crossing'
    ),
    nodeType: 'battle',
    mode: 'battle',
    encounterId: 'early_hold_crossing',
    actionLabel: 'HOLD',
    purpose: 'Teach front/rear protection and establish Hold Line as the first commander-order concept.',
    briefing: 'One attacker is pushing harder than the rest. A careless rear deployment will be punished even if the army is strong enough on paper.',
    unlockSummary: 'Hold Line tactical lesson.'
  },
  {
    nodeId: 'early_ch1_03',
    chapter: 1,
    order: 3,
    canonicalName: 'Rebuild the Barracks',
    names: factionNames(
      'Rebuild the Barracks',
      'Rebuild the Warden Lodge',
      'Rebuild the Clan Yard'
    ),
    nodeType: 'event',
    mode: 'event',
    actionLabel: 'REBUILD',
    purpose: 'Create the first clear settlement-to-army progression beat.',
    briefing: 'The army needs somewhere to train, repair gear and turn survivors into disciplined squads. Salvage from the road can make the first military works usable again.',
    unlockSummary: 'Early military training, forge access and the first promotion path.',
    eventReward: { gold: 20, wood: 10, iron: 2 }
  },
  {
    nodeId: 'early_ch1_04',
    chapter: 1,
    order: 4,
    canonicalName: 'Spears at Dawn',
    names: factionNames(
      'Spears at Dawn',
      'Moon-Spears at Dawn',
      'Spears at First Fire'
    ),
    nodeType: 'battle',
    mode: 'battle',
    encounterId: 'early_spears_at_dawn',
    actionLabel: 'PLAY',
    purpose: 'Prove that a suitable counter can matter more than a slightly higher Power value.',
    briefing: 'Fast raiders are testing the rebuilt force. A prepared spear line or another sensible answer can blunt their opening pressure.',
    unlockSummary: 'Counter and anti-charge readability.'
  },
  {
    nodeId: 'early_ch1_05',
    chapter: 1,
    order: 5,
    canonicalName: 'Cut Off the Captain',
    names: factionNames(
      'Cut Off the Captain',
      'Cut Off the Ashen Captain',
      'Cut Off the Blamecaller'
    ),
    nodeType: 'elite',
    mode: 'battle',
    encounterId: 'early_cut_off_captain',
    actionLabel: 'ELITE',
    purpose: 'Introduce priority targets and the Commander path without requiring RTS-style micromanagement.',
    briefing: 'A stronger officer is coordinating the enemy line from behind ordinary fighters. Breaking the command link is more valuable than trading evenly across the whole field.',
    unlockSummary: 'Focus Target lesson and Commander choice.'
  },
  {
    nodeId: 'early_ch1_06',
    chapter: 1,
    order: 6,
    canonicalName: 'The Broken Road',
    names: factionNames(
      'The Broken Road',
      'The Broken Rootway',
      'The Broken Red Road'
    ),
    nodeType: 'battle',
    mode: 'battle',
    encounterId: 'early_broken_road',
    actionLabel: 'PLAY',
    purpose: 'Remove most forced guidance and test known systems together.',
    briefing: 'The road ahead is no longer a tutorial skirmish. Mixed enemy roles can seriously injure a squad if the line is poorly protected.',
    unlockSummary: 'Independent tactical play and the first meaningful injury pressure.'
  },
  {
    nodeId: 'early_ch1_07',
    chapter: 1,
    order: 7,
    canonicalName: 'Reclaim the Outpost',
    names: factionNames(
      'Reclaim the Outpost',
      'Reclaim the Wardstone',
      'Reclaim the War Camp'
    ),
    nodeType: 'boss',
    mode: 'battle',
    encounterId: 'early_reclaim_outpost',
    actionLabel: 'BOSS',
    purpose: 'Test Chapter 1 knowledge without introducing another new mechanic.',
    briefing: 'A recognizable frontline protects the force holding your first real foothold. Poor positioning can still win, but it should cost injuries and readiness.',
    unlockSummary: 'Chapter 1 completion and settlement expansion.'
  },

  {
    nodeId: 'early_ch2_01',
    chapter: 2,
    order: 1,
    canonicalName: 'Strength in Numbers',
    names: factionNames(
      'Strength in Numbers',
      'A Wider Ward',
      'More Banners'
    ),
    nodeType: 'battle',
    mode: 'battle',
    encounterId: 'early_strength_in_numbers',
    actionLabel: 'PLAY',
    purpose: 'Make the third active squad immediately meaningful.',
    briefing: 'The enlarged force can now create a real front and rear. The enemy is conventional; the lesson is how much the extra squad changes deployment.',
    unlockSummary: 'Three-squad warfare and 2-1 / 1-1-1 concepts.'
  },
  {
    nodeId: 'early_ch2_02',
    chapter: 2,
    order: 2,
    canonicalName: 'Tools of War',
    names: factionNames(
      'Tools of War',
      'Tools of the Grove',
      'Tools of the Clan'
    ),
    nodeType: 'event',
    mode: 'event',
    actionLabel: 'CRAFT',
    purpose: 'Connect predictable crafting materials to military progression.',
    briefing: 'Better formations are not enough if the kingdom cannot replace weapons and reinforce equipment. Establish a reliable supply of basic military materials.',
    unlockSummary: 'Workshop/forge reinforcement and a guaranteed material package.',
    eventReward: { gold: 20, wood: 8, iron: 4 }
  },
  {
    nodeId: 'early_ch2_03',
    chapter: 2,
    order: 3,
    canonicalName: 'Riders on the Road',
    names: factionNames(
      'Riders on the Road',
      'Stag Riders on the Trail',
      'Wargs on the Road'
    ),
    nodeType: 'battle',
    mode: 'battle',
    encounterId: 'early_riders_on_road',
    actionLabel: 'PLAY',
    purpose: 'Make mounted pressure and anti-charge counters readable before cavalry becomes a major player system.',
    briefing: 'Mounted attackers are using momentum instead of sustained melee. Watch the opening charge and protect the lane it is trying to break.',
    unlockSummary: 'Charge telegraph and anti-charge counter lesson.'
  },
  {
    nodeId: 'early_ch2_04',
    chapter: 2,
    order: 4,
    canonicalName: 'No Army Fights Forever',
    names: factionNames(
      'No Army Fights Forever',
      'No Host Fights Forever',
      'No Warband Fights Forever'
    ),
    nodeType: 'elite',
    mode: 'battle',
    encounterId: 'early_no_army_fights_forever',
    actionLabel: 'ELITE',
    purpose: 'Make injuries and reserve rotation a gameplay lesson rather than a tutorial page.',
    briefing: 'This opponent is tuned to create attrition. Winning with a badly hurt squad is possible, but carrying that damage forward should make the next choice harder.',
    unlockSummary: 'Injury, recovery and reserve-rotation lesson.'
  },
  {
    nodeId: 'early_ch2_05',
    chapter: 2,
    order: 5,
    canonicalName: 'The Long Way Around',
    names: factionNames(
      'The Long Way Around',
      'The Hidden Rootway',
      'The Long Hunt Around'
    ),
    nodeType: 'battle',
    mode: 'battle',
    encounterId: 'early_long_way_around',
    actionLabel: 'PLAY',
    purpose: 'Introduce real flank pressure against outer and rear positions.',
    briefing: 'A fast enemy group is avoiding the strongest part of your line. Wider coverage or a properly placed interceptor can keep the rear from becoming exposed.',
    unlockSummary: 'Flank-threat readability.'
  },
  {
    nodeId: 'early_ch2_06',
    chapter: 2,
    order: 6,
    canonicalName: 'The Iron Line',
    names: factionNames(
      'The Iron Line',
      'The Ashen Line',
      'The Stonejaw Line'
    ),
    nodeType: 'elite',
    mode: 'battle',
    encounterId: 'early_iron_line',
    actionLabel: 'ELITE',
    purpose: 'Introduce the first named enemy formation without handing the player an exact solution.',
    briefing: 'A broad packed frontline is sheltering its more valuable rear fighters. Breaking it, outlasting it or attacking an edge are all valid answers.',
    unlockSummary: 'Iron Wall enemy-formation preview.'
  },
  {
    nodeId: 'early_ch2_07',
    chapter: 2,
    order: 7,
    canonicalName: 'Supplies for War',
    names: factionNames(
      'Supplies for War',
      'Stores for the Host',
      'Supplies for the Warband'
    ),
    nodeType: 'supply',
    mode: 'event',
    actionLabel: 'SUPPLY',
    purpose: 'Teach optional preparation as a pressure valve instead of mandatory grinding.',
    briefing: 'The next assault is stronger than the road skirmishes. Secure supplies now, or continue with the army you already have if you trust the preparation.',
    unlockSummary: 'Preparation recommendation and side-content pressure valve.',
    eventReward: { gold: 35, wood: 6, provisions: 8 }
  },
  {
    nodeId: 'early_ch2_08',
    chapter: 2,
    order: 8,
    canonicalName: 'Break Their Hold',
    names: factionNames(
      'Break Their Hold',
      'Break the Ashen Hold',
      'Break the Rival Hold'
    ),
    nodeType: 'boss',
    mode: 'battle',
    encounterId: 'early_break_their_hold',
    actionLabel: 'BOSS',
    purpose: 'Deliver the first finale where weak preparation can realistically cause failure even on Standard.',
    briefing: 'The final position combines a dense frontline, a protected rear threat and pressure on the wing. Healthy squads and sensible deployment should be favored, not guaranteed.',
    unlockSummary: 'Chapter 2 completion and the route toward Chapter 3.'
  }
];

export const earlyChapterOneBossNodeId = 'early_ch1_07';
export const earlyChapterTwoBossNodeId = 'early_ch2_08';
export const earlyCommanderUnlockNodeId = 'early_ch1_05';
export const earlyCommanderRequiredNodeId = 'early_ch1_06';
export const earlyPromotionGateNodeId = 'early_ch1_04';

export function getEarlyCampaignMission(nodeId: string) {
  return earlyCampaignMissions.find(mission => mission.nodeId === nodeId) ?? null;
}

export function getEarlyCampaignMissionByEncounter(encounterId: EncounterId) {
  return earlyCampaignMissions.find(mission => mission.encounterId === encounterId) ?? null;
}

export function getEarlyCampaignNodes(
  faction: FactionId,
  chapter: 1 | 2
): ChapterNode[] {
  return earlyCampaignMissions
    .filter(mission => mission.chapter === chapter)
    .map((mission, index) => ({
      id: mission.nodeId,
      name: mission.names[faction],
      type: mission.nodeType,
      completed: false,
      current: index === 0
    }));
}

export function getNextEarlyCampaignNodeId(nodeId: string) {
  const mission = getEarlyCampaignMission(nodeId);
  if (!mission) return null;

  return (
    earlyCampaignMissions.find(
      candidate =>
        candidate.chapter === mission.chapter &&
        candidate.order === mission.order + 1
    )?.nodeId ?? null
  );
}

export function isEarlyCampaignNodeId(nodeId: string) {
  return nodeId.startsWith('early_ch1_') || nodeId.startsWith('early_ch2_');
}


export function getCampaignSquadCap(
  chapterNumber: number,
  stageFormationSlots: number
) {
  return Math.max(
    2,
    Math.min(
      Math.max(2, stageFormationSlots),
      Math.min(6, Math.max(2, chapterNumber + 1))
    )
  );
}
