import type {
  ChapterNode,
  RecruitOption,
  ResourceSiteDefinition
} from './types';

export const chapterTwoNodes: ChapterNode[] = [
  { id: 'ch2_node_1', name: 'Strength in Numbers', type: 'event', completed: false, current: true },
  { id: 'ch2_node_2', name: 'Tools of War', type: 'battle', completed: false },
  { id: 'ch2_node_3', name: 'Riders on the Road', type: 'battle', completed: false },
  { id: 'ch2_node_4', name: 'No Army Fights Forever', type: 'elite', completed: false },
  { id: 'ch2_node_5', name: 'The Long Way Around', type: 'event', completed: false },
  { id: 'ch2_node_6', name: 'The Iron Line', type: 'battle', completed: false },
  { id: 'ch2_node_7', name: 'Supplies for War', type: 'supply', completed: false },
  { id: 'ch2_node_8', name: 'Break Their Hold', type: 'boss', completed: false }
];

export const fortMusterOptions: RecruitOption[] = [
  {
    id: 'crossbowman',
    archetype: 'Burst Ranged',
    pitch: 'Heavy ranged damage with slower initiative. Excellent behind a protected Human line.',
    tradeoff: 'Less mobile than Archer/Ranger builds.',
    unit: {
      id: 'hum_crossbow_reinforcement',
      name: 'Garrick',
      className: 'Crossbowman',
      faction: 'human',
      role: 'ranged',
      tier: 2,
      level: 3,
      hp: 100,
      attack: 18,
      armor: 5,
      speed: 8
    }
  },
  {
    id: 'man_at_arms',
    archetype: 'Heavy Frontline',
    pitch: 'A durable professional infantry squad that immediately strengthens defensive formations.',
    tradeoff: 'Slow and provides little ranged pressure.',
    unit: {
      id: 'hum_man_at_arms_reinforcement',
      name: 'Roland',
      className: 'Man-at-Arms',
      faction: 'human',
      role: 'frontline',
      tier: 2,
      level: 3,
      hp: 125,
      attack: 14,
      armor: 9,
      speed: 7
    }
  },
  {
    id: 'fort_scout',
    archetype: 'Cavalry Potential',
    pitch: 'Fast scout who can become a Scout Rider by assigning a Trained Horse from the new Stable.',
    tradeoff: 'Starts weaker than the specialized Crossbowman or Man-at-Arms.',
    unit: {
      id: 'hum_fort_scout',
      name: 'Rowan',
      className: 'Scout',
      faction: 'human',
      role: 'skirmish',
      tier: 2,
      level: 3,
      hp: 100,
      attack: 13,
      armor: 5,
      speed: 15
    }
  }
];

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
