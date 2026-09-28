import type {
  CommanderPathDefinition,
  CommanderSkillEffectType,
  FactionId,
  UnitRole
} from './types';

function path(
  id: string,
  faction: FactionId,
  name: string,
  title: string,
  favoredRoles: UnitRole[],
  passiveName: string,
  passiveDescription: string,
  attackMultiplier: number,
  armorMultiplier: number,
  speedMultiplier: number,
  skillName: string,
  skillEffectType: CommanderSkillEffectType,
  skillPower: number,
  skillDuration: number,
  skillDescription: string
): CommanderPathDefinition {
  return {
    id,
    faction,
    name,
    title,
    favoredRoles,
    passiveName,
    passiveDescription,
    attackMultiplier,
    armorMultiplier,
    speedMultiplier,
    skill: {
      id: id + '_skill',
      name: skillName,
      effectType: skillEffectType,
      power: skillPower,
      durationExchanges: skillDuration,
      description: skillDescription
    }
  };
}

export const commanderPaths: CommanderPathDefinition[] = [
  path(
    'hum_vanguard',
    'human',
    'Vanguard Marshal',
    'Commander of the Line',
    ['frontline', 'melee'],
    'Steel Discipline',
    'Frontline and melee squads deal 8% more damage and gain 5% armor.',
    1.08,
    1.05,
    1,
    'Command Strike',
    'armor_break',
    18,
    2,
    'A precise strike damages the enemy and reduces enemy armor for 2 exchanges.'
  ),
  path(
    'hum_ranger_captain',
    'human',
    'Ranger-Captain',
    'Commander of the Bow',
    ['ranged', 'skirmish'],
    'Measured Volley',
    'Ranged and skirmish squads deal 10% more damage and gain 4% speed.',
    1.1,
    1,
    1.04,
    'Suppressing Volley',
    'morale_break',
    16,
    2,
    'A coordinated volley deals damage and lowers enemy morale, reducing retaliation.'
  ),
  path(
    'hum_cavalry_marshal',
    'human',
    'Cavalry Marshal',
    'Commander of the Charge',
    ['cavalry'],
    'Mounted Doctrine',
    'Cavalry squads deal 14% more damage and gain 8% speed.',
    1.14,
    1,
    1.08,
    'Hammer Charge',
    'single_damage',
    28,
    0,
    'A heavy focused charge deals a large burst of direct damage.'
  ),

  path(
    'elf_windcaller',
    'elf',
    'Windcaller',
    'Commander of the Open Path',
    ['ranged', 'skirmish'],
    'Open-Sky Precision',
    'Ranged and skirmish squads gain 10% attack and 7% speed.',
    1.1,
    1,
    1.07,
    'Piercing Gale',
    'single_damage',
    24,
    0,
    'A cutting gust strikes one priority target with precise direct damage.'
  ),
  path(
    'elf_thorn_warden',
    'elf',
    'Thorn Warden',
    'Commander of the Living Line',
    ['frontline', 'support'],
    'Living Bulwark',
    'Frontline and support squads gain 9% armor and 5% attack.',
    1.05,
    1.09,
    1,
    'Thornbind',
    'bleed',
    9,
    3,
    'Living thorns wound the enemy and continue dealing damage for 3 exchanges.'
  ),
  path(
    'elf_moon_seer',
    'elf',
    'Moon Seer',
    'Commander of the Ward',
    ['support', 'ranged'],
    'Moonlit Guidance',
    'Support and ranged squads gain 7% attack and 6% armor.',
    1.07,
    1.06,
    1,
    'Moonbrand',
    'morale_break',
    18,
    2,
    'A luminous mark damages enemy resolve and weakens retaliation.'
  ),

  path(
    'orc_bloodchief',
    'orc',
    'Bloodchief',
    'Commander of the Axe',
    ['melee', 'frontline'],
    'Red Momentum',
    'Melee and frontline squads gain 12% attack.',
    1.12,
    1,
    1,
    'Open the Wound',
    'bleed',
    11,
    3,
    'A brutal hit opens a wound that continues dealing damage for 3 exchanges.'
  ),
  path(
    'orc_warglord',
    'orc',
    'Warglord',
    'Commander of the Hunt',
    ['cavalry', 'skirmish'],
    'Pack Command',
    'Cavalry and skirmish squads gain 12% attack and 8% speed.',
    1.12,
    1,
    1.08,
    'Terror Charge',
    'morale_break',
    22,
    2,
    'A Warg-led charge deals damage and crushes enemy morale for 2 exchanges.'
  ),
  path(
    'orc_warcaller',
    'orc',
    'Warcaller',
    'Commander of the Drum',
    ['support', 'melee'],
    'Battle Rhythm',
    'Support and melee squads gain 8% attack and 6% armor.',
    1.08,
    1.06,
    1,
    'War Drum Shock',
    'armor_break',
    15,
    2,
    'A thunderous command disrupts enemy guard and lowers armor for 2 exchanges.'
  )
];

export function getCommanderPaths(faction: FactionId) {
  return commanderPaths.filter(pathDefinition => pathDefinition.faction === faction);
}

export function getCommanderPath(id: string | null) {
  if (!id) return null;
  return commanderPaths.find(pathDefinition => pathDefinition.id === id) ?? null;
}
