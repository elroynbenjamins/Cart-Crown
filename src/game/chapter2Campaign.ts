import type { FactionId } from './types';

export type ChapterTwoMissionKind =
  | 'battle'
  | 'event'
  | 'upgrade'
  | 'boss';

export type ChapterTwoMissionDefinition = {
  id: string;
  order: number;
  name: string;
  kind: ChapterTwoMissionKind;
  deploymentCap: 3;
  lesson: string;
  unlocks: string[];
  mandatory: true;
};

export const chapterTwoCampaign: ChapterTwoMissionDefinition[] = [
  {
    id: 'ch2_strength_in_numbers',
    order: 1,
    name: 'Strength in Numbers',
    kind: 'event',
    deploymentCap: 3,
    lesson: 'The third active slot is now available, but roster depth still matters.',
    unlocks: ['third_deployment_slot', 'formation_2_1', 'formation_1_1_1'],
    mandatory: true
  },
  {
    id: 'ch2_tools_of_war',
    order: 2,
    name: 'Tools of War',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Connect predictable crafting materials directly to military progression.',
    unlocks: ['iron_hills_mine', 'basic_military_crafting'],
    mandatory: true
  },
  {
    id: 'ch2_riders_on_road',
    order: 3,
    name: 'Riders on the Road',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Mounted pressure is readable and can be countered without chasing raw Army Power.',
    unlocks: ['charge_telegraph', 'anti_charge_readability'],
    mandatory: true
  },
  {
    id: 'ch2_army_fights_forever',
    order: 4,
    name: 'No Army Fights Forever',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Injuries, readiness and reserve substitution make rotation meaningful.',
    unlocks: ['injury_rotation', 'offline_recovery'],
    mandatory: true
  },
  {
    id: 'ch2_long_way_around',
    order: 5,
    name: 'The Long Way Around',
    kind: 'event',
    deploymentCap: 3,
    lesson: 'Scouting and route pressure introduce the idea of protecting vulnerable approaches.',
    unlocks: ['signal_route', 'flank_warning'],
    mandatory: true
  },
  {
    id: 'ch2_iron_line',
    order: 6,
    name: 'The Iron Line',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Introduce a dense named enemy formation with a protected rear.',
    unlocks: ['enemy_formation_preview', 'iron_wall'],
    mandatory: true
  },
  {
    id: 'ch2_supplies_for_war',
    order: 7,
    name: 'Supplies for War',
    kind: 'event',
    deploymentCap: 3,
    lesson: 'Optional preparation is a pressure valve, not a mandatory grind wall.',
    unlocks: ['greenwood_camp', 'preparation_recommendation'],
    mandatory: true
  },
  {
    id: 'ch2_break_their_hold',
    order: 8,
    name: 'Break Their Hold',
    kind: 'boss',
    deploymentCap: 3,
    lesson: 'Test counters, injuries, formation reading and preparation together.',
    unlocks: ['chapter_three', 'fort_transition', 'fourth_deployment_slot'],
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

export function getChapterTwoSquadCap(_completedMissionIds: string[]) {
  return 3;
}

export function getChapterTwoRosterCap(completedMissionIds: string[]) {
  if (completedMissionIds.includes('ch2_break_their_hold')) return 8;
  if (completedMissionIds.includes('ch2_army_fights_forever')) return 7;
  return 6;
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
