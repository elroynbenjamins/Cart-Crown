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
  deploymentCap: 5 | 6 | 7;
  lesson: string;
  unlocks: string[];
  mandatory: true;
};

export const chapterTwoCampaign: ChapterTwoMissionDefinition[] = [
  {
    id: 'ch2_defend_camp',
    order: 1,
    name: 'They Found Us',
    kind: 'battle',
    deploymentCap: 5,
    lesson: 'Defending a settlement means the player now has something to lose.',
    unlocks: ['defensive_battle_context'],
    mandatory: true
  },
  {
    id: 'ch2_beyond_fires',
    order: 2,
    name: 'Beyond the Fires',
    kind: 'battle',
    deploymentCap: 6,
    lesson: 'Introduce Front, Middle and Rear with the default 2-2-2 layout.',
    unlocks: ['middle_row', 'sixth_deployment_slot'],
    mandatory: true
  },
  {
    id: 'ch2_three_roads',
    order: 3,
    name: 'Three Roads',
    kind: 'choice',
    deploymentCap: 6,
    lesson: 'Choose which territorial benefit arrives first without permanently losing the other routes.',
    unlocks: ['chapter_two_route_choice'],
    mandatory: true
  },
  {
    id: 'ch2_horse_rider',
    order: 4,
    name: 'Horse and Rider',
    kind: 'event',
    deploymentCap: 6,
    lesson: 'An experienced troop, mount and weapon define the first cavalry branch.',
    unlocks: ['cavalry', 'first_trained_mount'],
    mandatory: true
  },
  {
    id: 'ch2_brace',
    order: 5,
    name: 'Brace!',
    kind: 'battle',
    deploymentCap: 6,
    lesson: 'Cavalry is powerful but Spears and Pikes punish unsupported charges.',
    unlocks: ['brace', 'charge'],
    mandatory: true
  },
  {
    id: 'ch2_long_haul',
    order: 6,
    name: 'The Long Haul',
    kind: 'event',
    deploymentCap: 6,
    lesson: 'Territorial expansion needs logistics, not just more combat power.',
    unlocks: ['handcart', 'expanded_field_supplies'],
    mandatory: true
  },
  {
    id: 'ch2_those_remain',
    order: 7,
    name: 'Those Who Remain',
    kind: 'choice',
    deploymentCap: 6,
    lesson: 'Introduce the first non-magical Support squad and a small diplomacy consequence.',
    unlocks: ['support', 'neighbor_relation'],
    mandatory: true
  },
  {
    id: 'ch2_take_watch',
    order: 8,
    name: 'Take the Watch',
    kind: 'battle',
    deploymentCap: 7,
    lesson: 'A strategic assault rewards preparation and expands formation management.',
    unlocks: ['seventh_deployment_slot', 'formation_presets', 'improved_scouting'],
    mandatory: true
  },
  {
    id: 'ch2_build_outpost',
    order: 9,
    name: 'Build Something Worth Defending',
    kind: 'upgrade',
    deploymentCap: 7,
    lesson: 'Secure territory and resources before the permanent Camp becomes an Outpost.',
    unlocks: ['outpost', 'five_major_building_slots'],
    mandatory: true
  },
  {
    id: 'ch2_riders_banner',
    order: 10,
    name: "The Rider's Banner",
    kind: 'boss',
    deploymentCap: 7,
    lesson: 'Test three rows, Cavalry, Spears, Support, Readiness and formation choice together.',
    unlocks: ['chapter_three', 'territorial_post_specialization'],
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
  earlyEffect: string;
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
    summary: 'Earlier merchant access and stronger Gold flow.',
    earlyEffect: '+80 Gold now · +3 Gold per meaningful Chapter 2 activity'
  },
  {
    id: 'resource_route',
    names: {
      human: 'Iron Ford',
      elf: 'Stonegrove',
      orc: 'Blackstone Pass'
    },
    benefit: 'materials',
    summary: 'Earlier construction and equipment materials.',
    earlyEffect: '+18 Wood · +12 Stone · +8 Iron now · +2 Wood / +1 Iron per Chapter 2 activity'
  },
  {
    id: 'grazing_route',
    names: {
      human: 'Greenfields',
      elf: 'Windmeadow',
      orc: 'Redgrass Plains'
    },
    benefit: 'mounts',
    summary: 'Earlier and cheaper access to trained mounts.',
    earlyEffect: '+14 Provisions now · 25% lower mount crafting costs during Chapter 2'
  }
];

export function getChapterTwoSquadCap(completedMissionIds: string[]) {
  if (completedMissionIds.includes('ch2_take_watch')) return 7;
  if (completedMissionIds.includes('ch2_beyond_fires')) return 6;
  return 5;
}

export function getChapterTwoRosterCap(completedMissionIds: string[]) {
  if (completedMissionIds.includes('ch2_take_watch')) return 16;
  if (completedMissionIds.includes('ch2_beyond_fires')) return 12;
  return 9;
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
