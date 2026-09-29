import type { FactionId } from './types';

export type ChapterOneMissionKind =
  | 'story'
  | 'battle'
  | 'event'
  | 'choice'
  | 'elite'
  | 'boss'
  | 'upgrade';

export type ChapterOneMissionDefinition = {
  id: string;
  order: number;
  names: Record<FactionId, string>;
  kind: ChapterOneMissionKind;
  deploymentCap: 3 | 4 | 5;
  rosterCap: 5 | 7 | 9;
  lesson: string;
  unlocks: string[];
  mandatory: true;
};

export const chapterOneCampaign: ChapterOneMissionDefinition[] = [
  {
    id: 'ch1_last_survivors',
    order: 1,
    names: {
      human: 'The Last Three',
      elf: 'The Last Wardstone',
      orc: 'The Accused Clan'
    },
    kind: 'story',
    deploymentCap: 3,
    rosterCap: 5,
    lesson: 'Establish the faction, its three opening squads and the reason this small warband must grow.',
    unlocks: ['campaign', 'three_squad_formation'],
    mandatory: true
  },
  {
    id: 'ch1_first_clash',
    order: 2,
    names: {
      human: 'Hold the Road',
      elf: 'Wardbreakers',
      orc: 'Blood on the Red Road'
    },
    kind: 'battle',
    deploymentCap: 3,
    rosterCap: 5,
    lesson: 'Teach front/rear protection and basic role matchups through a real but recoverable fight.',
    unlocks: ['battle_report', 'readiness'],
    mandatory: true
  },
  {
    id: 'ch1_investigate',
    order: 3,
    names: {
      human: 'Marked Raiders',
      elf: 'Whispering Roots',
      orc: 'Broken Clan Marks'
    },
    kind: 'event',
    deploymentCap: 3,
    rosterCap: 5,
    lesson: 'Reveal that the opening attacks are organized and introduce the first equipment/recruitment decision.',
    unlocks: ['first_recruit_choice', 'basic_equipment_branch'],
    mandatory: true
  },
  {
    id: 'ch1_fourth_squad',
    order: 4,
    names: {
      human: 'Greenkeep Muster',
      elf: 'Wayfarer Muster',
      orc: 'Clan Muster'
    },
    kind: 'choice',
    deploymentCap: 4,
    rosterCap: 7,
    lesson: 'The first chosen reinforcement expands the army without revealing the whole future troop tree.',
    unlocks: ['fourth_deployment_slot'],
    mandatory: true
  },
  {
    id: 'ch1_pack_animal',
    order: 5,
    names: {
      human: 'A Mule and a Road',
      elf: 'The Stag Trail',
      orc: 'Beast of Burden'
    },
    kind: 'event',
    deploymentCap: 4,
    rosterCap: 7,
    lesson: 'Teach that field logistics and carrying capacity grow separately from combat strength.',
    unlocks: ['pack_animal', 'expanded_cargo'],
    mandatory: true
  },
  {
    id: 'ch1_training',
    order: 6,
    names: {
      human: 'Arms for the Muster',
      elf: 'Lessons beneath the Boughs',
      orc: 'Trial by Iron'
    },
    kind: 'event',
    deploymentCap: 4,
    rosterCap: 7,
    lesson: 'Require the first meaningful troop/equipment improvement before the elite encounter.',
    unlocks: ['first_troop_upgrade'],
    mandatory: true
  },
  {
    id: 'ch1_elite',
    order: 7,
    names: {
      human: 'Mercenary Patrol',
      elf: 'Ashen Tracks',
      orc: 'Invader Scouts'
    },
    kind: 'elite',
    deploymentCap: 4,
    rosterCap: 7,
    lesson: 'Punish weak positioning, ignored counters and low Readiness for the first time.',
    unlocks: ['elite_enemy_mechanics', 'commander_doctrine_preview'],
    mandatory: true
  },
  {
    id: 'ch1_forward_camp',
    order: 8,
    names: {
      human: 'Refugee Camp',
      elf: 'Wayfarer Camp',
      orc: 'Gathering Fire'
    },
    kind: 'event',
    deploymentCap: 5,
    rosterCap: 9,
    lesson: 'Give the fifth squad and force a push-versus-resupply preparation decision before the boss.',
    unlocks: ['fifth_deployment_slot', 'fifth_story_reinforcement'],
    mandatory: true
  },
  {
    id: 'ch1_boss',
    order: 9,
    names: {
      human: 'The Toll Captain',
      elf: 'The Hollow Warden',
      orc: 'The Blamecaller'
    },
    kind: 'boss',
    deploymentCap: 5,
    rosterCap: 9,
    lesson: 'Test formation, counters, equipment and Readiness together; underprepared armies should normally fail.',
    unlocks: ['chapter_one_clear'],
    mandatory: true
  },
  {
    id: 'ch1_permanent_camp',
    order: 10,
    names: {
      human: 'A Place Worth Holding',
      elf: 'A Sanctuary Replanted',
      orc: 'A Fire That Stays'
    },
    kind: 'upgrade',
    deploymentCap: 5,
    rosterCap: 9,
    lesson: 'Convert survival into a permanent faction base and open the territorial Chapter 2 loop.',
    unlocks: ['permanent_camp', 'chapter_two'],
    mandatory: true
  }
];

export function getChapterOneMissionName(
  missionId: string,
  faction: FactionId
) {
  return (
    chapterOneCampaign.find(mission => mission.id === missionId)?.names[faction] ??
    null
  );
}

export function getChapterOneSquadCap(completedMissionIds: string[]) {
  if (
    completedMissionIds.includes('ch1_forward_camp') ||
    completedMissionIds.includes('ch1_boss') ||
    completedMissionIds.includes('ch1_permanent_camp')
  ) {
    return 5;
  }
  if (
    completedMissionIds.includes('ch1_fourth_squad') ||
    completedMissionIds.includes('ch1_pack_animal') ||
    completedMissionIds.includes('ch1_training') ||
    completedMissionIds.includes('ch1_elite')
  ) {
    return 4;
  }
  return 3;
}

export function getChapterOneRosterCap(completedMissionIds: string[]) {
  if (
    completedMissionIds.includes('ch1_forward_camp') ||
    completedMissionIds.includes('ch1_boss') ||
    completedMissionIds.includes('ch1_permanent_camp')
  ) {
    return 9;
  }
  if (
    completedMissionIds.includes('ch1_fourth_squad') ||
    completedMissionIds.includes('ch1_pack_animal') ||
    completedMissionIds.includes('ch1_training') ||
    completedMissionIds.includes('ch1_elite')
  ) {
    return 7;
  }
  return 5;
}
