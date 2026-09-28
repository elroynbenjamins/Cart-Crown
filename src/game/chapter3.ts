import type { ChapterNode, RecruitOption } from './types';

export const chapterThreeNodes: ChapterNode[] = [
  { id: 'ch3_node_1', name: 'Marcher Envoy', type: 'event', completed: false, current: true },
  { id: 'ch3_node_2', name: 'Border Fort', type: 'battle', completed: false },
  { id: 'ch3_node_3', name: 'Three Warnings', type: 'event', completed: false },
  { id: 'ch3_node_4', name: 'Siege Road', type: 'elite', completed: false },
  { id: 'ch3_node_5', name: 'The Divided March', type: 'event', completed: false },
  { id: 'ch3_node_6', name: 'Lord Marshal Veyr', type: 'boss', completed: false }
];

export const marcherAuxiliaryOptions: RecruitOption[] = [
  {
    id: 'marcher_halberdier',
    archetype: 'Control Frontline',
    pitch: 'A professional polearm squad built to hold lanes and punish mounted enemies.',
    tradeoff: 'Slower than lighter infantry and offers no ranged pressure.',
    unit: {
      id: 'hum_marcher_halberdier',
      name: 'Bran',
      className: 'Halberdier',
      faction: 'human',
      role: 'frontline',
      tier: 3,
      level: 5,
      hp: 135,
      attack: 19,
      armor: 10,
      speed: 7
    }
  },
  {
    id: 'marcher_chaplain',
    archetype: 'Morale Support',
    pitch: 'A field chaplain who stabilizes hard battles and fits support-oriented formations.',
    tradeoff: 'Low direct damage compared with an additional combat squad.',
    unit: {
      id: 'hum_marcher_chaplain',
      name: 'Edwin',
      className: 'Field Chaplain',
      faction: 'human',
      role: 'support',
      tier: 3,
      level: 5,
      hp: 105,
      attack: 10,
      armor: 7,
      speed: 9
    }
  },
  {
    id: 'marcher_ranger',
    archetype: 'Mobile Skirmisher',
    pitch: 'A Border Ranger brings speed and ranged pressure without requiring another cavalry investment.',
    tradeoff: 'Less durable than the Halberdier and less supportive than the Chaplain.',
    unit: {
      id: 'hum_marcher_ranger',
      name: 'Sabine',
      className: 'Border Ranger',
      faction: 'human',
      role: 'skirmish',
      tier: 3,
      level: 5,
      hp: 105,
      attack: 18,
      armor: 6,
      speed: 15
    }
  }
];
