import {
  getArmyReadinessProfile,
  getArmyResupplyCost,
  getBattleReadinessWear,
  getEnemyStrikePressure,
  getTacticalSpeedDamageMultiplier,
  getUnitCombatProfile
} from '../src/game/balance';
import { royalDecrees } from '../src/game/capital';
import {
  marcherAuxiliaryOptions
} from '../src/game/chapter3';
import { fortMusterOptions } from '../src/game/chapter2';
import { strongholdMusterOptions } from '../src/game/chapter4';
import { getCommanderPaths } from '../src/game/commanders';
import { humanRecruitOptions, starterUnits } from '../src/game/data';
import {
  advancedPromotions,
  canUnitEquipEquipment,
  equipmentDefinitions,
  recruitPromotions
} from '../src/game/equipment';
import { getEncounter } from '../src/game/encounters';
import type { EncounterId } from '../src/game/encounters';
import {
  elfThirdRecruitOptions,
  orcThirdRecruitOptions
} from '../src/game/factionChapter2';
import {
  elfFourthRecruitOptions,
  orcFourthRecruitOptions
} from '../src/game/factionChapter3';
import {
  elfChapterFiveReinforcement,
  elfFifthRecruitOptions,
  orcChapterFiveReinforcement,
  orcFifthRecruitOptions
} from '../src/game/factionChapter4';
import { factionMandates } from '../src/game/factionChapter5';
import { elfStarterUnits, orcStarterUnits } from '../src/game/factionStarts';
import { analyzeFormation } from '../src/game/formation';
import type {
  CommanderPathDefinition,
  EquipmentDefinition,
  FactionId,
  UnitDefinition
} from '../src/game/types';

type CombatModifier = {
  attackMultiplier: number;
  armorMultiplier: number;
  speedMultiplier: number;
  commanderSkillPowerMultiplier?: number;
};

type SimulationInput = {
  faction: FactionId;
  units: UnitDefinition[];
  doctrineId: string;
  commander: CommanderPathDefinition | null;
  encounterId: EncounterId;
  squadCap: number;
  readiness: number;
  modifier?: CombatModifier;
  alliance?: boolean;
};

type SimulationResult = {
  victory: boolean;
  turns: number;
  remainingHp: number;
  maxHp: number;
  enemyRemainingHp: number;
};

type ScenarioRow = {
  label: string;
  faction: FactionId;
  chapter: number;
  encounterId: EncounterId;
  result: SimulationResult;
};

const bossByFaction: Record<FactionId, EncounterId[]> = {
  human: [
    'toll_captain',
    'iron_provost',
    'lord_marshal_veyr',
    'pretender_general',
    'gate_of_crownspire',
    'return_to_crownspire'
  ],
  elf: [
    'elf_hollow_warden',
    'elf_ashroot_stalker',
    'elf_pale_ranger',
    'elf_ashen_druid',
    'elf_worldroot_guardian',
    'elf_return_through_roots'
  ],
  orc: [
    'orc_blamecaller',
    'orc_clanbreaker',
    'orc_stonejaw_champion',
    'orc_split_chieftain',
    'orc_last_clanbreaker',
    'orc_crownspire_warmaster'
  ]
};

const squadCaps: Record<FactionId, number[]> = {
  human: [3, 4, 5, 6, 6, 6],
  elf: [2, 3, 4, 5, 6, 6],
  orc: [2, 3, 4, 5, 6, 6]
};

const gearTierByChapter = [1, 1, 2, 2, 3, 3];

const doctrineByFaction: Record<FactionId, string> = {
  human: 'human_balanced',
  elf: 'elf_open',
  orc: 'orc_warband'
};

function check(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function cloneUnit(unit: UnitDefinition): UnitDefinition {
  return { ...unit };
}

function optionUnit(
  options: Array<{ unit: UnitDefinition }>,
  id: string
): UnitDefinition {
  const option = options.find(candidate => candidate.unit.id === id);
  check(option, 'Missing recruit option: ' + id);
  return cloneUnit(option.unit);
}

function promoteHumanRecruit(unit: UnitDefinition): UnitDefinition {
  const promotion = recruitPromotions.find(
    candidate => candidate.id === 'promote_recruit_swordsman'
  );
  check(promotion, 'Missing baseline Human recruit promotion.');

  return {
    ...unit,
    className: promotion.toClass,
    role: promotion.role,
    tier: 2,
    attack: unit.attack + promotion.attackBonus,
    armor: unit.armor + promotion.armorBonus,
    speed: unit.speed + promotion.speedBonus,
    promotionReady: false
  };
}

function applyAdvancedPromotion(
  unit: UnitDefinition,
  promotionId: string
): UnitDefinition {
  const promotion = advancedPromotions.find(
    candidate => candidate.id === promotionId
  );
  check(promotion, 'Missing advanced promotion: ' + promotionId);
  check(
    unit.className === promotion.fromClass,
    'Promotion ' + promotionId + ' expected ' + promotion.fromClass + ', got ' + unit.className
  );

  return {
    ...unit,
    className: promotion.toClass,
    role: promotion.role,
    tier: unit.tier + 1,
    attack: unit.attack + promotion.attackBonus,
    armor: unit.armor + promotion.armorBonus,
    speed: unit.speed + promotion.speedBonus
  };
}

function buildHumanArmy(chapter: number): UnitDefinition[] {
  const units = starterUnits.map(cloneUnit);
  const recruitIndex = units.findIndex(unit => unit.id === 'hum_recruit');
  check(recruitIndex >= 0, 'Human starter recruit missing.');
  const recruit = units[recruitIndex];
  check(recruit, 'Human starter recruit missing.');
  units[recruitIndex] = promoteHumanRecruit(recruit);

  units.push(
    optionUnit(humanRecruitOptions, 'hum_archer_reinforcement')
  );

  if (chapter >= 2) {
    units.push(
      optionUnit(fortMusterOptions, 'hum_man_at_arms_reinforcement')
    );
  }

  if (chapter >= 3) {
    units.push(
      optionUnit(marcherAuxiliaryOptions, 'hum_marcher_ranger')
    );
  }

  if (chapter >= 4) {
    units.push(
      optionUnit(strongholdMusterOptions, 'hum_banner_captain_reinforcement')
    );
  }

  return units.slice(0, squadCaps.human[chapter - 1] ?? 6);
}

function buildElfArmy(chapter: number): UnitDefinition[] {
  const units = elfStarterUnits.map(cloneUnit);

  if (chapter >= 2) {
    units.push(
      optionUnit(elfThirdRecruitOptions, 'elf_grove_acolyte')
    );
  }

  if (chapter >= 3) {
    units.push(
      optionUnit(elfFourthRecruitOptions, 'elf_pathfinder')
    );
  }

  if (chapter >= 4) {
    units.push(
      optionUnit(elfFifthRecruitOptions, 'elf_moon_ranger')
    );
  }

  if (chapter >= 5) {
    units.push(cloneUnit(elfChapterFiveReinforcement));
  }

  return units.slice(0, squadCaps.elf[chapter - 1] ?? 6);
}

function buildOrcArmy(chapter: number): UnitDefinition[] {
  const units = orcStarterUnits.map(cloneUnit);

  if (chapter >= 2) {
    units.push(
      optionUnit(orcThirdRecruitOptions, 'orc_war_drummer')
    );
  }

  if (chapter >= 3) {
    units.push(
      optionUnit(orcFourthRecruitOptions, 'orc_bone_hunter')
    );
  }

  if (chapter >= 4) {
    units.push(
      optionUnit(orcFifthRecruitOptions, 'orc_ironhide')
    );
  }

  if (chapter >= 5) {
    units.push(cloneUnit(orcChapterFiveReinforcement));
  }

  return units.slice(0, squadCaps.orc[chapter - 1] ?? 6);
}

function buildArmy(faction: FactionId, chapter: number) {
  if (faction === 'elf') return buildElfArmy(chapter);
  if (faction === 'orc') return buildOrcArmy(chapter);
  return buildHumanArmy(chapter);
}

function equipmentScore(item: EquipmentDefinition) {
  return (
    item.attackBonus +
    item.armorBonus * 1.2 +
    item.speedBonus * 0.6
  );
}

function applyGear(
  units: UnitDefinition[],
  tier: number,
  mode: 'light' | 'full'
): UnitDefinition[] {
  const allowedSlots =
    mode === 'light'
      ? new Set(['weapon', 'armor', 'mount'])
      : new Set(['weapon', 'armor', 'shield', 'mount', 'artifact']);

  return units.map(unit => {
    let next = { ...unit };
    const slots = ['weapon', 'armor', 'shield', 'mount', 'artifact'] as const;

    for (const slot of slots) {
      if (!allowedSlots.has(slot)) continue;

      const candidates = equipmentDefinitions
        .filter(
          item =>
            item.faction === unit.faction &&
            item.slot === slot &&
            item.tier <= tier &&
            canUnitEquipEquipment(next, item)
        )
        .sort((a, b) => equipmentScore(b) - equipmentScore(a));

      const item = candidates[0];
      if (!item) continue;

      next = {
        ...next,
        attack: next.attack + item.attackBonus,
        armor: next.armor + item.armorBonus,
        speed: next.speed + item.speedBonus
      };
    }

    return next;
  });
}

function buildFormation(
  units: UnitDefinition[],
  faction: FactionId
): Array<string | null> {
  const formation: Array<string | null> = Array(9).fill(null);

  if (faction === 'elf') {
    const frontSlots = [0, 2, 4, 1, 3, 5, 7];
    const rearSlots = [6, 8, 4, 0, 2, 7, 1];
    const mobileSlots = [2, 8, 0, 6, 4, 1, 7, 3, 5];

    for (const unit of units) {
      const preferred =
        unit.role === 'ranged' || unit.role === 'support'
          ? rearSlots
          : unit.role === 'skirmish' || unit.role === 'cavalry'
            ? mobileSlots
            : frontSlots;
      const slot = preferred.find(index => formation[index] === null);
      check(slot !== undefined, 'No Elf formation slot available.');
      formation[slot] = unit.id;
    }
    return formation;
  }

  if (faction === 'orc') {
    const pressureSlots = [0, 1, 3, 4, 2, 5, 6, 7, 8];
    const sorted = [...units].sort((a, b) => {
      const pressureRole = (unit: UnitDefinition) =>
        ['frontline', 'melee', 'cavalry'].includes(unit.role) ? 0 : 1;
      return pressureRole(a) - pressureRole(b);
    });

    sorted.forEach((unit, index) => {
      const slot = pressureSlots[index];
      check(slot !== undefined, 'No Orc formation slot available.');
      formation[slot] = unit.id;
    });
    return formation;
  }

  const frontSlots = [1, 0, 2, 4, 3, 5];
  const rearSlots = [7, 6, 8, 4, 3, 5];
  const mobileSlots = [3, 5, 4, 0, 2, 1, 6, 8, 7];

  for (const unit of units) {
    const preferred =
      unit.role === 'ranged' || unit.role === 'support'
        ? rearSlots
        : unit.role === 'skirmish' || unit.role === 'cavalry'
          ? mobileSlots
          : frontSlots;
    const slot = preferred.find(index => formation[index] === null);
    check(slot !== undefined, 'No Human formation slot available.');
    formation[slot] = unit.id;
  }

  return formation;
}

function simulate(input: SimulationInput): SimulationResult {
  const encounter = getEncounter(input.encounterId);
  const formation = buildFormation(input.units, input.faction);
  const formationAnalysis = analyzeFormation(
    formation,
    input.units,
    input.faction,
    input.doctrineId
  );
  const profile = getUnitCombatProfile(input.units);
  const readiness = getArmyReadinessProfile(input.readiness);
  const modifier = input.modifier ?? {
    attackMultiplier: 1,
    armorMultiplier: 1,
    speedMultiplier: 1,
    commanderSkillPowerMultiplier: 1
  };

  const maxHp =
    profile.maxHp > 0
      ? Math.max(1, Math.round(profile.maxHp * readiness.hpMultiplier))
      : 0;

  const favoredCount = input.commander
    ? input.units.filter(unit =>
        input.commander?.favoredRoles.includes(unit.role)
      ).length
    : 0;
  const favoredFraction =
    input.units.length > 0 ? favoredCount / input.units.length : 0;

  const partyAttack =
    input.units.reduce((total, unit) => {
      const commanderMultiplier =
        input.commander?.favoredRoles.includes(unit.role)
          ? input.commander.attackMultiplier
          : 1;
      return total + unit.attack * commanderMultiplier;
    }, 0) * readiness.attackMultiplier;

  const commanderArmorMultiplier = input.commander
    ? 1 +
      (input.commander.armorMultiplier - 1) *
        favoredFraction
    : 1;
  const commanderSpeedMultiplier = input.commander
    ? 1 +
      (input.commander.speedMultiplier - 1) *
        favoredFraction
    : 1;

  const tacticalSpeed =
    getTacticalSpeedDamageMultiplier(
      profile.speedStatMultiplier,
      formationAnalysis.speedMultiplier,
      commanderSpeedMultiplier,
      1,
      modifier.speedMultiplier
    ) * readiness.speedMultiplier;

  const supportRecovery = Math.round(
    profile.supportRecovery * formationAnalysis.healingMultiplier
  );

  let partyHp = maxHp;
  let enemyHp = encounter.enemyHp;
  let turn = 0;
  let skillTriggered = false;
  let effect:
    | {
        type: 'single_damage' | 'bleed' | 'morale_break' | 'armor_break';
        power: number;
        remaining: number;
      }
    | null = null;

  while (partyHp > 0 && enemyHp > 0 && turn < 100) {
    let currentEffect = effect;
    let skillDamage = 0;

    if (input.commander && !skillTriggered && turn === 1) {
      const skill = input.commander.skill;
      const adjustedSkillPower = Math.max(
        1,
        Math.round(
          skill.power *
            (modifier.commanderSkillPowerMultiplier ?? 1)
        )
      );
      skillTriggered = true;

      if (skill.effectType === 'single_damage') {
        skillDamage = adjustedSkillPower;
      } else {
        skillDamage = Math.max(
          6,
          Math.round(adjustedSkillPower * 0.55)
        );
        currentEffect = {
          type: skill.effectType,
          power: adjustedSkillPower,
          remaining: skill.durationExchanges
        };
      }
    }

    let ongoingDamage = 0;
    let attackFactor = 1;
    let retaliationFactor = 1;

    if (currentEffect && currentEffect.remaining > 0) {
      if (currentEffect.type === 'bleed') {
        ongoingDamage += currentEffect.power;
      } else if (currentEffect.type === 'armor_break') {
        attackFactor += 0.15;
      } else if (currentEffect.type === 'morale_break') {
        retaliationFactor -= 0.25;
      }
    }

    const momentum =
      input.faction === 'orc'
        ? 1 +
          Math.min(
            0.28,
            turn * 0.04 +
              formationAnalysis.momentumPerExchange *
                turn *
                0.015
          )
        : 1;

    const allianceAttack = input.alliance ? 1.1 : 1;
    const allianceArmor = input.alliance ? 1.08 : 1;

    const playerStrike = Math.max(
      18,
      Math.round(
        (partyAttack + 5 + turn * 2) *
          formationAnalysis.attackMultiplier *
          modifier.attackMultiplier *
          allianceAttack *
          momentum *
          attackFactor *
          tacticalSpeed
      )
    );

    const rawEnemyStrike = getEnemyStrikePressure(
      encounter,
      input.squadCap,
      turn
    );
    const enemyStrike = Math.max(
      4,
      Math.round(
        (rawEnemyStrike * retaliationFactor) /
          Math.max(
            0.7,
            profile.armorStatMultiplier *
              formationAnalysis.armorMultiplier *
              commanderArmorMultiplier *
              modifier.armorMultiplier *
              allianceArmor
          )
      )
    );

    enemyHp = Math.max(
      0,
      enemyHp - playerStrike - skillDamage - ongoingDamage
    );

    const damaged = Math.max(0, partyHp - enemyStrike);
    partyHp =
      damaged <= 0 || supportRecovery <= 0
        ? damaged
        : Math.min(maxHp, damaged + supportRecovery);

    turn += 1;

    if (currentEffect) {
      const remaining = currentEffect.remaining - 1;
      effect =
        remaining > 0
          ? { ...currentEffect, remaining }
          : null;
    } else {
      effect = null;
    }
  }

  const victory = enemyHp <= 0 && partyHp > 0;

  return {
    victory,
    turns: turn,
    remainingHp: partyHp,
    maxHp,
    enemyRemainingHp: enemyHp
  };
}

function ratio(result: SimulationResult) {
  return result.maxHp > 0
    ? result.remainingHp / result.maxHp
    : 0;
}

function defaultCommander(faction: FactionId) {
  return getCommanderPaths(faction)[0] ?? null;
}

function defaultModifierForFaction(
  faction: FactionId,
  chapter: number
): CombatModifier {
  if (chapter < 6) {
    return {
      attackMultiplier: 1,
      armorMultiplier: 1,
      speedMultiplier: 1,
      commanderSkillPowerMultiplier: 1
    };
  }

  if (faction === 'human') {
    const decree = royalDecrees.find(
      candidate => candidate.id === 'royal_muster'
    );
    check(decree, 'Royal Muster missing.');
    return {
      attackMultiplier: decree.attackMultiplier,
      armorMultiplier: decree.armorMultiplier,
      speedMultiplier: 1,
      commanderSkillPowerMultiplier: 1
    };
  }

  const mandate = factionMandates.find(
    candidate =>
      candidate.faction === faction &&
      (faction === 'elf'
        ? candidate.id === 'living_canopy'
        : candidate.id === 'blood_hunt')
  );
  check(mandate, 'Default faction mandate missing for ' + faction);

  return {
    attackMultiplier: mandate.attackMultiplier,
    armorMultiplier: mandate.armorMultiplier,
    speedMultiplier: mandate.speedMultiplier,
    commanderSkillPowerMultiplier:
      mandate.commanderSkillPowerMultiplier
  };
}

function normalArmy(faction: FactionId, chapter: number) {
  const base = buildArmy(faction, chapter);
  return applyGear(
    base,
    gearTierByChapter[chapter - 1] ?? 3,
    'light'
  );
}

function strongArmy(faction: FactionId, chapter: number) {
  const base = buildArmy(faction, chapter);
  return applyGear(base, Math.min(3, chapter), 'full');
}

function runChapterMatrix() {
  const rows: ScenarioRow[] = [];

  for (const faction of ['human', 'elf', 'orc'] as const) {
    for (let chapter = 1; chapter <= 6; chapter += 1) {
      const encounterId = bossByFaction[faction][chapter - 1];
      check(encounterId, 'Missing boss mapping for ' + faction + ' chapter ' + chapter);
      const squadCap = squadCaps[faction][chapter - 1] ?? 6;
      const commander = defaultCommander(faction);
      const modifier = defaultModifierForFaction(faction, chapter);
      const normalUnits = normalArmy(faction, chapter);
      const strongUnits = strongArmy(faction, chapter);

      const normal = simulate({
        faction,
        units: normalUnits,
        doctrineId: doctrineByFaction[faction],
        commander,
        encounterId,
        squadCap,
        readiness: 100,
        modifier
      });

      const thresholdTwin = simulate({
        faction,
        units: normalUnits,
        doctrineId: doctrineByFaction[faction],
        commander,
        encounterId,
        squadCap,
        readiness: 70,
        modifier
      });

      const strong = simulate({
        faction,
        units: strongUnits,
        doctrineId: doctrineByFaction[faction],
        commander,
        encounterId,
        squadCap,
        readiness: 100,
        modifier
      });

      const missingCount = chapter >= 4 ? 2 : 1;
      const underUnits = buildArmy(faction, chapter).slice(
        0,
        Math.max(1, squadCap - missingCount)
      );
      const underprepared = simulate({
        faction,
        units: underUnits,
        doctrineId: doctrineByFaction[faction],
        commander,
        encounterId,
        squadCap,
        readiness: 45
      });

      rows.push(
        {
          label: 'normal',
          faction,
          chapter,
          encounterId,
          result: normal
        },
        {
          label: 'strong',
          faction,
          chapter,
          encounterId,
          result: strong
        },
        {
          label: 'under',
          faction,
          chapter,
          encounterId,
          result: underprepared
        }
      );

      check(
        normal.victory,
        faction + ' chapter ' + chapter + ' normal army can no longer clear ' + encounterId
      );
      check(
        strong.victory,
        faction + ' chapter ' + chapter + ' strong army can no longer clear ' + encounterId
      );
      check(
        normal.victory === thresholdTwin.victory &&
          normal.turns === thresholdTwin.turns &&
          normal.remainingHp === thresholdTwin.remainingHp,
        faction + ' chapter ' + chapter + ' changed between 100 and 70 Readiness despite the no-penalty threshold'
      );

      if (chapter >= 4) {
        check(
          !underprepared.victory,
          faction + ' chapter ' + chapter + ' remains too forgiving: a fatigued army missing two squads still clears ' + encounterId
        );
      }

      if (chapter >= 5) {
        check(
          strong.turns >= 4,
          faction + ' chapter ' + chapter + ' strong army trivializes ' + encounterId + ' in fewer than four exchanges'
        );
      }

      check(
        ratio(strong) + 0.001 >= ratio(normal),
        faction + ' chapter ' + chapter + ' strong legal gear performs worse than the normal loadout'
      );
    }
  }

  return rows;
}

function runCommanderCoverage() {
  for (const faction of ['human', 'elf', 'orc'] as const) {
    const chapter = 5;
    const encounterId = bossByFaction[faction][chapter - 1];
    check(encounterId, 'Missing commander coverage encounter.');
    const units = normalArmy(faction, chapter);
    const squadCap = squadCaps[faction][chapter - 1] ?? 6;

    for (const commander of getCommanderPaths(faction)) {
      const result = simulate({
        faction,
        units,
        doctrineId: doctrineByFaction[faction],
        commander,
        encounterId,
        squadCap,
        readiness: 100
      });

      check(
        result.victory,
        commander.name + ' can no longer clear the representative ' + faction + ' chapter 5 boss with a normal army'
      );
    }
  }
}

function runLatePolicyCoverage() {
  const humanUnits = normalArmy('human', 6);
  for (const decree of royalDecrees) {
    const result = simulate({
      faction: 'human',
      units: humanUnits,
      doctrineId: doctrineByFaction.human,
      commander: defaultCommander('human'),
      encounterId: 'return_to_crownspire',
      squadCap: 6,
      readiness: 100,
      modifier: {
        attackMultiplier: decree.attackMultiplier,
        armorMultiplier: decree.armorMultiplier,
        speedMultiplier: 1,
        commanderSkillPowerMultiplier: 1
      }
    });
    check(
      result.victory,
      'Human Chapter 6 became impossible with Royal Decree: ' + decree.name
    );
  }

  for (const faction of ['elf', 'orc'] as const) {
    const units = normalArmy(faction, 6);
    const encounterId = bossByFaction[faction][5];
    check(encounterId, 'Missing faction Chapter 6 boss.');

    for (const mandate of factionMandates.filter(
      candidate => candidate.faction === faction
    )) {
      const result = simulate({
        faction,
        units,
        doctrineId: doctrineByFaction[faction],
        commander: defaultCommander(faction),
        encounterId,
        squadCap: 6,
        readiness: 100,
        modifier: {
          attackMultiplier: mandate.attackMultiplier,
          armorMultiplier: mandate.armorMultiplier,
          speedMultiplier: mandate.speedMultiplier,
          commanderSkillPowerMultiplier:
            mandate.commanderSkillPowerMultiplier
        }
      });
      check(
        result.victory,
        faction + ' Chapter 6 became impossible with mandate: ' + mandate.name
      );
    }
  }
}

function runMountedBranchCoverage() {
  {
    const units = buildElfArmy(4);
    const index = units.findIndex(unit => unit.id === 'elf_pathfinder');
    if (index >= 0) {
      units.splice(index, 1);
    }
    units.push(
      optionUnit(elfThirdRecruitOptions, 'elf_stag_scout')
    );
    const stagIndex = units.findIndex(unit => unit.id === 'elf_stag_scout');
    check(stagIndex >= 0, 'Stag Scout missing from branch scenario.');
    let stag = units[stagIndex];
    check(stag, 'Stag Scout missing.');
    stag = applyAdvancedPromotion(stag, 'stag_scout_stag_rider');
    stag = applyAdvancedPromotion(stag, 'stag_rider_mounted_ranger');
    units[stagIndex] = stag;

    const result = simulate({
      faction: 'elf',
      units: applyGear(units, 2, 'light'),
      doctrineId: 'elf_crescent',
      commander:
        getCommanderPaths('elf').find(path => path.id === 'elf_windcaller') ??
        null,
      encounterId: 'elf_ashen_druid',
      squadCap: 5,
      readiness: 100
    });

    check(
      result.victory,
      'Mounted Ranger Stag branch no longer clears the Chapter 4 benchmark.'
    );
  }

  {
    const units = buildOrcArmy(4);
    const index = units.findIndex(unit => unit.id === 'orc_bone_hunter');
    if (index >= 0) {
      units.splice(index, 1);
    }
    units.push(
      optionUnit(orcThirdRecruitOptions, 'orc_warg_scout')
    );
    const wargIndex = units.findIndex(unit => unit.id === 'orc_warg_scout');
    check(wargIndex >= 0, 'Warg Scout missing from branch scenario.');
    let warg = units[wargIndex];
    check(warg, 'Warg Scout missing.');
    warg = applyAdvancedPromotion(warg, 'warg_scout_warg_rider');
    warg = applyAdvancedPromotion(warg, 'warg_rider_warg_raider');
    units[wargIndex] = warg;

    const result = simulate({
      faction: 'orc',
      units: applyGear(units, 2, 'light'),
      doctrineId: 'orc_warband',
      commander:
        getCommanderPaths('orc').find(path => path.id === 'orc_warglord') ??
        null,
      encounterId: 'orc_split_chieftain',
      squadCap: 5,
      readiness: 100
    });

    check(
      result.victory,
      'Warg Raider branch no longer clears the Chapter 4 benchmark.'
    );
  }
}

function runMetaCoverage() {
  for (const faction of ['human', 'elf', 'orc'] as const) {
    const units = normalArmy(faction, 6);
    const result = simulate({
      faction,
      units,
      doctrineId: doctrineByFaction[faction],
      commander: defaultCommander(faction),
      encounterId: 'unbound_beacon',
      squadCap: 6,
      readiness: 70,
      modifier: defaultModifierForFaction(faction, 6),
      alliance: true
    });

    check(
      result.victory,
      faction + ' completed-faction army can no longer lead the final Three Seals boss at the 70% no-penalty threshold'
    );

    const under = simulate({
      faction,
      units: buildArmy(faction, 6).slice(0, 4),
      doctrineId: doctrineByFaction[faction],
      commander: defaultCommander(faction),
      encounterId: 'unbound_beacon',
      squadCap: 6,
      readiness: 45,
      alliance: true
    });

    check(
      !under.victory,
      faction + ' final meta encounter is too forgiving: four fatigued un-geared squads still win'
    );
  }
}

function runReadinessCoverage() {
  const fresh = getArmyReadinessProfile(100);
  const threshold = getArmyReadinessProfile(70);
  const fatigued = getArmyReadinessProfile(69);
  const exhausted = getArmyReadinessProfile(25);

  check(
    JSON.stringify(fresh) === JSON.stringify(threshold),
    '70% Readiness must remain a true no-penalty threshold.'
  );
  check(
    fatigued.hpMultiplier < 1 &&
      fatigued.attackMultiplier < 1 &&
      fatigued.speedMultiplier < 1,
    '69% Readiness should begin applying fatigue.'
  );
  check(
    exhausted.hpMultiplier >= 0.85 &&
      exhausted.attackMultiplier >= 0.92 &&
      exhausted.speedMultiplier >= 0.95,
    'Minimum Readiness penalties became harsher than the intended cap.'
  );

  const suppliedWear = getBattleReadinessWear(
    60,
    100,
    'Elite',
    true,
    true,
    true
  );
  const unsuppliedWear = getBattleReadinessWear(
    60,
    100,
    'Elite',
    true,
    false,
    false
  );
  check(
    suppliedWear < unsuppliedWear,
    'Rations and medicine no longer reduce battle wear.'
  );

  const suppliedCost = getArmyResupplyCost(
    50,
    6,
    true,
    true
  );
  const unsuppliedCost = getArmyResupplyCost(
    50,
    6,
    false,
    false
  );
  check(
    suppliedCost < unsuppliedCost,
    'Rations and medicine no longer reduce field resupply cost.'
  );
}

function printRows(rows: ScenarioRow[]) {
  console.log('\nBalance regression matrix');
  console.log(
    'Faction Ch State   Result Turns HP% Encounter'
  );

  for (const row of rows) {
    const hp = Math.round(ratio(row.result) * 100)
      .toString()
      .padStart(3, ' ');
    const result = row.result.victory ? 'WIN ' : 'LOSS';
    console.log(
      row.faction.padEnd(6) +
        ' ' +
        String(row.chapter).padStart(2, ' ') +
        ' ' +
        row.label.padEnd(7) +
        ' ' +
        result +
        ' ' +
        String(row.result.turns).padStart(5, ' ') +
        ' ' +
        hp.padStart(3, ' ') +
        '% ' +
        row.encounterId
    );
  }
}

function main() {
  runReadinessCoverage();
  const rows = runChapterMatrix();
  runCommanderCoverage();
  runLatePolicyCoverage();
  runMountedBranchCoverage();
  runMetaCoverage();
  printRows(rows);
  console.log(
    '\nPASS: chapter bosses, Readiness thresholds, commander paths, late policies, mounted branches and Three Seals remain inside the intended deterministic guardrails.'
  );
}

main();
