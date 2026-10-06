import type { FactionId } from './types';

export type ChapterTwoMissionKind =
  | 'battle'
  | 'event'
  | 'choice'
  | 'upgrade'
  | 'boss';

export type ChapterTwoMissionDefinition = {
  id: string;
  order: number;
  name: string;
  kind: ChapterTwoMissionKind;
  deploymentCap: 2 | 3;
  lesson: string;
  unlocks: string[];
  mandatory: true;
};

export const chapterTwoCampaign: ChapterTwoMissionDefinition[] = [
  {
    id: 'ch2_strength_in_numbers',
    order: 1,
    name: 'Strength in Numbers',
    kind: 'battle',
    deploymentCap: 2,
    lesson: 'Win with the two-squad core before the third active squad slot becomes available.',
    unlocks: ['third_deployment_slot', 'formation_2_1', 'formation_1_1_1'],
    mandatory: true
  },
  {
    id: 'ch2_tools_of_war',
    order: 2,
    name: 'Tools of War',
    kind: 'upgrade',
    deploymentCap: 3,
    lesson: 'Connect predictable military crafting to troop progression without opening a huge recipe catalogue.',
    unlocks: ['basic_military_crafting'],
    mandatory: true
  },
  {
    id: 'ch2_riders_on_road',
    order: 3,
    name: 'Riders on the Road',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Make charge telegraphs and anti-charge counters readable before player cavalry arrives later.',
    unlocks: ['charge_telegraph', 'anti_charge_readability'],
    mandatory: true
  },
  {
    id: 'ch2_no_army_fights_forever',
    order: 4,
    name: 'No Army Fights Forever',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Teach injuries, recovery and reserve substitution through an encounter that commonly leaves wear.',
    unlocks: ['injury_rotation', 'offline_recovery'],
    mandatory: true
  },
  {
    id: 'ch2_long_way_around',
    order: 5,
    name: 'The Long Way Around',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Introduce flank pressure and punish an exposed outer or rear position.',
    unlocks: ['flank_threats'],
    mandatory: true
  },
  {
    id: 'ch2_iron_line',
    order: 6,
    name: 'The Iron Line',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Introduce the Iron Wall as the first named enemy formation without revealing an exact solution.',
    unlocks: ['enemy_formation_preview', 'iron_wall'],
    mandatory: true
  },
  {
    id: 'ch2_supplies_for_war',
    order: 7,
    name: 'Supplies for War',
    kind: 'event',
    deploymentCap: 3,
    lesson: 'Present optional preparation as a pressure valve rather than mandatory grinding.',
    unlocks: ['preparation_recommendation', 'signal_network'],
    mandatory: true
  },
  {
    id: 'ch2_break_their_hold',
    order: 8,
    name: 'Break Their Hold',
    kind: 'boss',
    deploymentCap: 3,
    lesson: 'Test counters, recovery, flank awareness and the Iron Wall with real failure pressure.',
    unlocks: ['chapter_three'],
    mandatory: true
  }
];

export type ChapterTwoTerritoryRouteId =
  | 'trade_route'
  | 'resource_route'
  | 'grazing_route';

export type ChapterTwoTerritoryRouteDefinition = {
  id: ChapterTwoTerritoryRouteId;
  names: Record<FactionId, string>;
  benefit: 'trade' | 'materials' | 'mounts';
  summary: string;
};

export const chapterTwoTerritoryRoutes: ChapterTwoTerritoryRouteDefinition[] = [
  {
    id: 'trade_route',
    names: {
      human: "Old King's Road",
      elf: 'Silver Path',
      orc: "Trader's Cut"
    },
    benefit: 'trade',
    summary: 'Earlier merchant access and stronger Gold flow.'
  },
  {
    id: 'resource_route',
    names: {
      human: 'Iron Ford',
      elf: 'Stonegrove',
      orc: 'Blackstone Pass'
    },
    benefit: 'materials',
    summary: 'Earlier construction and equipment materials.'
  },
  {
    id: 'grazing_route',
    names: {
      human: 'Greenfields',
      elf: 'Windmeadow',
      orc: 'Redgrass Plains'
    },
    benefit: 'mounts',
    summary: 'Earlier and cheaper access to trained mounts.'
  }
];

export function getChapterTwoSquadCap(completedMissionIds: string[]) {
  return completedMissionIds.includes('ch2_strength_in_numbers') ? 3 : 2;
}

export function getChapterTwoRosterCap(completedMissionIds: string[]) {
  return completedMissionIds.includes('ch2_strength_in_numbers') ? 5 : 4;
}

export function getChapterTwoTerritoryName(
  routeId: ChapterTwoTerritoryRouteId,
  faction: FactionId
) {
  return (
    chapterTwoTerritoryRoutes.find(route => route.id === routeId)?.names[faction] ??
    null
  );
}
