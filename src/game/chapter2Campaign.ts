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
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Unlock the third squad and teach the first meaningful three-squad formation choices.',
    unlocks: ['third_deployment_slot', 'formation_2_1', 'formation_1_1_1'],
    mandatory: true
  },
  {
    id: 'ch2_tools_of_war',
    order: 2,
    name: 'Tools of War',
    kind: 'upgrade',
    deploymentCap: 3,
    lesson: 'Introduce predictable military crafting with an immediately useful recipe.',
    unlocks: ['workshop_level_1', 'basic_military_crafting'],
    mandatory: true
  },
  {
    id: 'ch2_riders_on_the_road',
    order: 3,
    name: 'Riders on the Road',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Make charge and anti-charge counters readable before cavalry becomes a player system.',
    unlocks: ['anti_charge_readability', 'charge_telegraph'],
    mandatory: true
  },
  {
    id: 'ch2_no_army_fights_forever',
    order: 4,
    name: 'No Army Fights Forever',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Teach injuries, reserve substitution and offline recovery through an actual costly battle.',
    unlocks: ['injuries', 'reserve_substitution', 'offline_recovery'],
    mandatory: true
  },
  {
    id: 'ch2_long_way_around',
    order: 5,
    name: 'The Long Way Around',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Introduce flank pressure and show why outer positioning matters.',
    unlocks: ['flank_threats', 'wide_three_squad_formation'],
    mandatory: true
  },
  {
    id: 'ch2_iron_line',
    order: 6,
    name: 'The Iron Line',
    kind: 'battle',
    deploymentCap: 3,
    lesson: 'Introduce Iron Wall as the first named enemy formation without revealing an exact solution.',
    unlocks: ['enemy_formation_preview', 'iron_wall'],
    mandatory: true
  },
  {
    id: 'ch2_supplies_for_war',
    order: 7,
    name: 'Supplies for War',
    kind: 'event',
    deploymentCap: 3,
    lesson: 'Teach optional preparation as a pressure valve rather than a mandatory grind gate.',
    unlocks: ['preparation_recommendation', 'side_content_pressure_valve'],
    mandatory: true
  },
  {
    id: 'ch2_break_their_hold',
    order: 8,
    name: 'Break Their Hold',
    kind: 'boss',
    deploymentCap: 3,
    lesson: 'Test healthy squads, counter awareness, Iron Wall pressure and limited flank threat together.',
    unlocks: ['chapter_three', 'frostmarch_route'],
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
  if (completedMissionIds.includes('ch2_long_way_around')) return 6;
  if (completedMissionIds.includes('ch2_no_army_fights_forever')) return 5;
  return 4;
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
