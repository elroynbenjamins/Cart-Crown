import type {
  ChapterNode,
  ResourceSiteDefinition,
  UnitDefinition
} from './types';

export const chapterTwoNodes: ChapterNode[] = [
  { id: 'ch2_node_1', name: 'They Found Us', type: 'battle', completed: false, current: true },
  { id: 'ch2_node_2', name: 'Beyond the Fires', type: 'battle', completed: false },
  { id: 'ch2_node_3', name: 'Three Roads', type: 'event', completed: false },
  { id: 'ch2_node_4', name: 'Horse and Rider', type: 'event', completed: false },
  { id: 'ch2_node_5', name: 'Brace!', type: 'elite', completed: false },
  { id: 'ch2_node_6', name: 'The Long Haul', type: 'supply', completed: false },
  { id: 'ch2_node_7', name: 'Those Who Remain', type: 'event', completed: false },
  { id: 'ch2_node_8', name: 'Take the Watch', type: 'elite', completed: false },
  { id: 'ch2_node_9', name: 'Build Something Worth Defending', type: 'event', completed: false },
  { id: 'ch2_node_10', name: "The Rider's Banner", type: 'boss', completed: false }
];

export const chapterTwoSupportUnit: UnitDefinition = {
  id: 'hum_banner_sergeant',
  name: 'Aldric',
  className: 'Banner Sergeant',
  faction: 'human',
  role: 'support',
  tier: 2,
  level: 3,
  hp: 104,
  attack: 10,
  armor: 6,
  speed: 9
};

export const chapterTwoDiplomacyUnits: Record<
  'protect' | 'contract' | 'allegiance',
  UnitDefinition
> = {
  protect: {
    ...chapterTwoSupportUnit,
    id: 'hum_banner_sergeant',
    name: 'Aldric'
  },
  contract: {
    id: 'hum_road_warden',
    name: 'Merrin',
    className: 'Road Warden',
    faction: 'human',
    role: 'support',
    tier: 2,
    level: 3,
    hp: 98,
    attack: 11,
    armor: 5,
    speed: 11
  },
  allegiance: {
    id: 'hum_veteran_standard',
    name: 'Oswin',
    className: 'Veteran Standard',
    faction: 'human',
    role: 'support',
    tier: 2,
    level: 3,
    hp: 112,
    attack: 9,
    armor: 8,
    speed: 8
  }
};

export const humanResourceSites: ResourceSiteDefinition[] = [
  {
    id: 'greenkeep_farms',
    faction: 'human',
    name: 'Greenkeep Farms',
    icon: '🌾',
    description: 'Restored fields supply the growing Fort and its campaign wagons.',
    productionPerActivity: { provisions: 6 }
  },
  {
    id: 'iron_hills_mine',
    faction: 'human',
    name: 'Iron Hills Mine',
    icon: '⛏️',
    description: 'A secured roadside mine sends workable ore back to Greenkeep.',
    productionPerActivity: { iron: 2 }
  },
  {
    id: 'greenwood_camp',
    faction: 'human',
    name: 'Greenwood Timber Camp',
    icon: '🪓',
    description: 'Foresters clear safe timber routes beside the Iron Road.',
    productionPerActivity: { wood: 5 }
  },
  {
    id: 'old_quarry',
    faction: 'human',
    name: 'Old Signal Quarry',
    icon: '🪨',
    description: 'Stone cut from the ridge below the restored signal tower supports Greenkeep expansion.',
    productionPerActivity: { stone: 3 }
  }
];
