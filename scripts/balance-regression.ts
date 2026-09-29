import {
  getArmyReadinessProfile,
  getArmyResupplyCost,
  getBattleReadinessWear,
  getEnemyStrikePressure,
  getTacticalSpeedDamageMultiplier,
  getUnitCombatProfile
} from '../src/game/balance';
import { royalDecrees } from '../src/game/capital';
import { fortMusterOptions } from '../src/game/chapter2';
import { marcherAuxiliaryOptions } from '../src/game/chapter3';
import {
  lastLoyalistChoices,
  strongholdMusterOptions
} from '../src/game/chapter4';
import { getCommanderPaths } from '../src/game/commanders';
import { humanRecruitOptions, starterUnits } from '../src/game/data';
import {
  advancedPromotions,
  canUnitEquipEquipment,
  equipmentDefinitions,
  recruitPromotions
} from '../src/game/equipment';
import {
  encounters,
  getEncounter,
  getEnemyArmyProfile,
  getEnemyFormationTactic,
  getEnemyRoleAssignments
} from '../src/game/encounters';
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
import {
  analyzeFormation,
  formationShapes,
  getFormationMatchup,
  getFormationShape
} from '../src/game/formation';
import type {
  CommanderPathDefinition,
  EquipmentDefinition,
  FactionId,
  FormationShapeId,
  UnitDefinition
} from '../src/game/types';

type CombatModifier = {
  attackMultiplier: number;
  armorMultiplier: number;
  speedMultiplier: number;
  retaliationMultiplier?: number;
  commanderSkillPowerMultiplier?: number;
};

type SimulationInput = {
  faction: FactionId;
  units: UnitDefinition[];
  doctrineId: string;
  shapeId: FormationShapeId;
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
  shapeId: FormationShapeId;
  encounterId: EncounterId;
  result: SimulationResult;
};

const failures: string[] = [];

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

const shapeByFactionChapter: Record<FactionId, FormationShapeId[]> = {
  human: [
    'balanced_333',
    'balanced_333',
    'reinforced_center_252',
    'reinforced_center_252',
    'wide_vanguard_522',
    'wide_vanguard_522'
  ],
  elf: [
    'balanced_333',
    'deep_234',
    'protected_rear_225',
    'skirmish_screen_243',
    'protected_rear_225',
    'protected_rear_225'
  ],
  orc: [
    'balanced_333',
    'assault_432',
    'wide_vanguard_522',
    'heavy_front_441',
    'heavy_front_441',
    'heavy_front_441'
  ]
};

function invariant(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) throw new Error(message);
}

function expect(condition: unknown, message: string) {
  if (!condition) failures.push(message);
}

function cloneUnit(unit: UnitDefinition): UnitDefinition {
  return { ...unit };
}

function optionUnit(
  options: Array<{ unit: UnitDefinition }>,
  id: string
): UnitDefinition {
  const option = options.find(candidate => candidate.unit.id === id);
  invariant(option, 'Missing recruit option: ' + id);
  return cloneUnit(option.unit);
}

function promoteHumanRecruit(unit: UnitDefinition): UnitDefinition {
  const promotion = recruitPromotions.find(
    candidate => candidate.id === 'promote_recruit_swordsman'
  );
  invariant(promotion, 'Missing baseline Human recruit promotion.');

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
  invariant(promotion, 'Missing advanced promotion: ' + promotionId);
  invariant(
    unit.className === promotion.fromClass,
    'Promotion ' +
      promotionId +
      ' expected ' +
      promotion.fromClass +
      ', got ' +
      unit.className
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
  const recruitIndex = units.findIndex(
    unit => unit.id === 'hum_recruit'
  );
  invariant(recruitIndex >= 0, 'Human starter recruit missing.');
  const recruit = units[recruitIndex];
  invariant(recruit, 'Human starter recruit missing.');
  units[recruitIndex] = promoteHumanRecruit(recruit);

  units.push(
    optionUnit(humanRecruitOptions, 'hum_archer_reinforcement')
  );

  if (chapter >= 2) {
    units.push(
      optionUnit(
        fortMusterOptions,
        'hum_man_at_arms_reinforcement'
      )
    );
  }

  if (chapter >= 3) {
    units.push(
      optionUnit(
        marcherAuxiliaryOptions,
        'hum_marcher_ranger'
      )
    );
  }

  if (chapter >= 4) {
    units.push(
      optionUnit(
        strongholdMusterOptions,
        'hum_banner_captain_reinforcement'
      )
    );
  }

  return units.slice(
    0,
    squadCaps.human[chapter - 1] ?? 6
  );
}

function buildElfArmy(chapter: number): UnitDefinition[] {
  const units = elfStarterUnits.map(cloneUnit);

  if (chapter >= 2) {
    units.push(
      optionUnit(
        elfThirdRecruitOptions,
        'elf_grove_acolyte'
      )
    );
  }

  if (chapter >= 3) {
    units.push(
      optionUnit(
        elfFourthRecruitOptions,
        'elf_pathfinder'
      )
    );
  }

  if (chapter >= 4) {
    units.push(
      optionUnit(
        elfFifthRecruitOptions,
        'elf_moon_ranger'
      )
    );
  }

  if (chapter >= 5) {
    units.push(cloneUnit(elfChapterFiveReinforcement));
  }

  return units.slice(
    0,
    squadCaps.elf[chapter - 1] ?? 6
  );
}

function buildOrcArmy(chapter: number): UnitDefinition[] {
  const units = orcStarterUnits.map(cloneUnit);

  if (chapter >= 2) {
    units.push(
      optionUnit(
        orcThirdRecruitOptions,
        'orc_war_drummer'
      )
    );
  }

  if (chapter >= 3) {
    units.push(
      optionUnit(
        orcFourthRecruitOptions,
        'orc_bone_hunter'
      )
    );
  }

  if (chapter >= 4) {
    units.push(
      optionUnit(
        orcFifthRecruitOptions,
        'orc_ironhide'
      )
    );
  }

  if (chapter >= 5) {
    units.push(cloneUnit(orcChapterFiveReinforcement));
  }

  return units.slice(
    0,
    squadCaps.orc[chapter - 1] ?? 6
  );
}

function buildArmy(
  faction: FactionId,
  chapter: number
) {
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
      : new Set([
          'weapon',
          'armor',
          'shield',
          'mount',
          'artifact'
        ]);

  return units.map(unit => {
    let next = { ...unit };
    const slots = [
      'weapon',
      'armor',
      'shield',
      'mount',
      'artifact'
    ] as const;

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
        .sort(
          (a, b) =>
            equipmentScore(b) - equipmentScore(a)
        );

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

function centerFirst(slots: number[]) {
  const middle = (slots.length - 1) / 2;
  return [...slots].sort(
    (a, b) =>
      Math.abs(slots.indexOf(a) - middle) -
      Math.abs(slots.indexOf(b) - middle)
  );
}

function outerFirst(slots: number[]) {
  const middle = (slots.length - 1) / 2;
  return [...slots].sort(
    (a, b) =>
      Math.abs(slots.indexOf(b) - middle) -
      Math.abs(slots.indexOf(a) - middle)
  );
}

function buildFormation(
  units: UnitDefinition[],
  faction: FactionId,
  shapeId: FormationShapeId
): Array<string | null> {
  const formation: Array<string | null> =
    Array(9).fill(null);
  const shape = getFormationShape(shapeId);
  const allSlots = [
    ...shape.rows.front,
    ...shape.rows.middle,
    ...shape.rows.rear
  ];

  const place = (
    unit: UnitDefinition,
    preferred: number[]
  ) => {
    const slot = [...preferred, ...allSlots].find(
      index => formation[index] === null
    );
    invariant(
      slot !== undefined,
      'No formation slot available for ' +
        faction +
        ' ' +
        shapeId
    );
    formation[slot] = unit.id;
  };

  if (faction === 'human') {
    for (const unit of units) {
      if (
        unit.role === 'ranged' ||
        unit.role === 'support'
      ) {
        place(unit, [
          ...centerFirst(shape.rows.rear),
          ...centerFirst(shape.rows.middle)
        ]);
      } else if (
        unit.role === 'skirmish' ||
        unit.role === 'cavalry'
      ) {
        place(unit, [
          ...outerFirst(shape.rows.middle),
          ...outerFirst(shape.rows.front),
          ...outerFirst(shape.rows.rear)
        ]);
      } else {
        place(unit, [
          ...centerFirst(shape.rows.front),
          ...centerFirst(shape.rows.middle)
        ]);
      }
    }
    return formation;
  }

  if (faction === 'elf') {
    for (const unit of units) {
      if (
        unit.role === 'ranged' ||
        unit.role === 'support'
      ) {
        place(unit, [
          ...outerFirst(shape.rows.rear),
          ...outerFirst(shape.rows.middle)
        ]);
      } else if (
        unit.role === 'skirmish' ||
        unit.role === 'cavalry'
      ) {
        place(unit, [
          ...outerFirst(shape.rows.middle),
          ...outerFirst(shape.rows.rear),
          ...outerFirst(shape.rows.front)
        ]);
      } else {
        place(unit, [
          ...outerFirst(shape.rows.front),
          ...outerFirst(shape.rows.middle)
        ]);
      }
    }
    return formation;
  }

  const pressure = [...units].sort((a, b) => {
    const pressureRole = (unit: UnitDefinition) =>
      ['frontline', 'melee', 'cavalry'].includes(
        unit.role
      )
        ? 0
        : 1;
    return pressureRole(a) - pressureRole(b);
  });

  for (const unit of pressure) {
    if (
      ['frontline', 'melee', 'cavalry'].includes(
        unit.role
      )
    ) {
      place(unit, [
        ...centerFirst(shape.rows.front),
        ...centerFirst(shape.rows.middle)
      ]);
    } else {
      place(unit, [
        ...centerFirst(shape.rows.rear),
        ...centerFirst(shape.rows.middle),
        ...centerFirst(shape.rows.front)
      ]);
    }
  }

  return formation;
}

function simulate(
  input: SimulationInput
): SimulationResult {
  const encounter = getEncounter(input.encounterId);
  const enemyTactic = getEnemyFormationTactic(
    input.encounterId
  );
  const enemyArmyProfile = getEnemyArmyProfile(
    input.encounterId
  );
  const formation = buildFormation(
    input.units,
    input.faction,
    input.shapeId
  );
  const formationAnalysis = analyzeFormation(
    formation,
    input.units,
    input.faction,
    input.doctrineId,
    input.shapeId
  );
  const profile = getUnitCombatProfile(input.units);
  const readiness = getArmyReadinessProfile(
    input.readiness
  );
  const modifier = input.modifier ?? {
    attackMultiplier: 1,
    armorMultiplier: 1,
    speedMultiplier: 1,
    commanderSkillPowerMultiplier: 1
  };

  const maxHp =
    profile.maxHp > 0
      ? Math.max(
          1,
          Math.round(
            profile.maxHp * readiness.hpMultiplier
          )
        )
      : 0;

  const favoredCount = input.commander
    ? input.units.filter(unit =>
        input.commander?.favoredRoles.includes(
          unit.role
        )
      ).length
    : 0;
  const favoredFraction =
    input.units.length > 0
      ? favoredCount / input.units.length
      : 0;

  const partyAttack =
    input.units.reduce((total, unit) => {
      const commanderMultiplier =
        input.commander?.favoredRoles.includes(
          unit.role
        )
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
    profile.supportRecovery *
      formationAnalysis.healingMultiplier
  );

  const formationMatchup = getFormationMatchup(
    input.shapeId,
    enemyTactic.formationShapeId
  );

  const enemyPressureMultiplier =
    enemyTactic.attackMultiplier *
    (1 +
      (enemyTactic.speedMultiplier - 1) * 0.6);

  let partyHp = maxHp;
  let enemyHp = encounter.enemyHp;
  let turn = 0;
  let skillTriggered = false;
  let effect:
    | {
        type:
          | 'single_damage'
          | 'bleed'
          | 'morale_break'
          | 'armor_break';
        power: number;
        remaining: number;
      }
    | null = null;

  while (
    partyHp > 0 &&
    enemyHp > 0 &&
    turn < 100
  ) {
    let currentEffect = effect;
    let skillDamage = 0;

    if (
      input.commander &&
      !skillTriggered &&
      turn === 1
    ) {
      const skill = input.commander.skill;
      const adjustedSkillPower = Math.max(
        1,
        Math.round(
          skill.power *
            (modifier.commanderSkillPowerMultiplier ??
              1)
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

    if (
      currentEffect &&
      currentEffect.remaining > 0
    ) {
      if (currentEffect.type === 'bleed') {
        ongoingDamage += currentEffect.power;
      } else if (
        currentEffect.type === 'armor_break'
      ) {
        attackFactor += 0.15;
      } else if (
        currentEffect.type === 'morale_break'
      ) {
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

    const allianceAttack = input.alliance
      ? 1.1
      : 1;
    const allianceArmor = input.alliance
      ? 1.08
      : 1;

    const rawPlayerStrike = Math.max(
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

    const playerDamage = Math.max(
      1,
      Math.round(
        ((rawPlayerStrike +
          skillDamage +
          ongoingDamage) /
          (
            enemyTactic.armorMultiplier *
            enemyArmyProfile.armorMultiplier
          )) *
          formationMatchup.outgoingDamageMultiplier
      )
    );

    const enemyTimingMultiplier =
      turn === 0
        ? enemyArmyProfile.openingPressureMultiplier
        : enemyArmyProfile.sustainedPressureMultiplier;

    const rawEnemyStrike = getEnemyStrikePressure(
      encounter,
      input.squadCap,
      turn
    );
    const enemyStrike = Math.max(
      4,
      Math.round(
        (rawEnemyStrike *
          enemyPressureMultiplier *
          enemyTimingMultiplier *
          formationMatchup.incomingDamageMultiplier *
          retaliationFactor *
          (modifier.retaliationMultiplier ?? 1)) /
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
      enemyHp - playerDamage
    );

    const damaged = Math.max(
      0,
      partyHp - enemyStrike
    );
    partyHp =
      damaged <= 0 || supportRecovery <= 0
        ? damaged
        : Math.min(
            maxHp,
            damaged + supportRecovery
          );

    turn += 1;

    if (currentEffect) {
      const remaining =
        currentEffect.remaining - 1;
      effect =
        remaining > 0
          ? {
              ...currentEffect,
              remaining
            }
          : null;
    } else {
      effect = null;
    }
  }

  return {
    victory: enemyHp <= 0 && partyHp > 0,
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
      candidate =>
        candidate.id === 'royal_muster'
    );
    invariant(decree, 'Royal Muster missing.');
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
  invariant(
    mandate,
    'Default faction mandate missing for ' +
      faction
  );

  return {
    attackMultiplier: mandate.attackMultiplier,
    armorMultiplier: mandate.armorMultiplier,
    speedMultiplier: mandate.speedMultiplier,
    commanderSkillPowerMultiplier:
      mandate.commanderSkillPowerMultiplier
  };
}

function normalArmy(
  faction: FactionId,
  chapter: number
) {
  return applyGear(
    buildArmy(faction, chapter),
    gearTierByChapter[chapter - 1] ?? 3,
    'light'
  );
}

function strongArmy(
  faction: FactionId,
  chapter: number
) {
  return applyGear(
    buildArmy(faction, chapter),
    Math.min(3, chapter),
    'full'
  );
}

function shapeFor(
  faction: FactionId,
  chapter: number
) {
  return (
    shapeByFactionChapter[faction][
      chapter - 1
    ] ?? 'balanced_333'
  );
}

function runChapterMatrix() {
  const rows: ScenarioRow[] = [];

  for (const faction of [
    'human',
    'elf',
    'orc'
  ] as const) {
    for (
      let chapter = 1;
      chapter <= 6;
      chapter += 1
    ) {
      const encounterId =
        bossByFaction[faction][chapter - 1];
      invariant(
        encounterId,
        'Missing boss mapping for ' +
          faction +
          ' chapter ' +
          chapter
      );

      const squadCap =
        squadCaps[faction][chapter - 1] ?? 6;
      const commander =
        defaultCommander(faction);
      const modifier =
        defaultModifierForFaction(
          faction,
          chapter
        );
      const shapeId = shapeFor(
        faction,
        chapter
      );
      const normalUnits = normalArmy(
        faction,
        chapter
      );
      const strongUnits = strongArmy(
        faction,
        chapter
      );

      const normal = simulate({
        faction,
        units: normalUnits,
        doctrineId:
          doctrineByFaction[faction],
        shapeId,
        commander,
        encounterId,
        squadCap,
        readiness: 100,
        modifier
      });

      const thresholdTwin = simulate({
        faction,
        units: normalUnits,
        doctrineId:
          doctrineByFaction[faction],
        shapeId,
        commander,
        encounterId,
        squadCap,
        readiness: 70,
        modifier
      });

      const strong = simulate({
        faction,
        units: strongUnits,
        doctrineId:
          doctrineByFaction[faction],
        shapeId,
        commander,
        encounterId,
        squadCap,
        readiness: 100,
        modifier
      });

      const missingCount =
        chapter >= 4 ? 2 : 1;
      const underUnits = buildArmy(
        faction,
        chapter
      ).slice(
        0,
        Math.max(
          1,
          squadCap - missingCount
        )
      );
      const underprepared = simulate({
        faction,
        units: underUnits,
        doctrineId:
          doctrineByFaction[faction],
        shapeId,
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
          shapeId,
          encounterId,
          result: normal
        },
        {
          label: 'strong',
          faction,
          chapter,
          shapeId,
          encounterId,
          result: strong
        },
        {
          label: 'under',
          faction,
          chapter,
          shapeId,
          encounterId,
          result: underprepared
        }
      );

      expect(
        normal.victory,
        faction +
          ' chapter ' +
          chapter +
          ' normal army can no longer clear ' +
          encounterId
      );
      expect(
        strong.victory,
        faction +
          ' chapter ' +
          chapter +
          ' strong army can no longer clear ' +
          encounterId
      );
      expect(
        normal.victory ===
          thresholdTwin.victory &&
          normal.turns ===
            thresholdTwin.turns &&
          normal.remainingHp ===
            thresholdTwin.remainingHp,
        faction +
          ' chapter ' +
          chapter +
          ' changed between 100 and 70 Readiness despite the no-penalty threshold'
      );

      if (chapter >= 4) {
        expect(
          !underprepared.victory,
          faction +
            ' chapter ' +
            chapter +
            ' remains too forgiving: a fatigued army missing two squads still clears ' +
            encounterId
        );
      }

      if (chapter >= 5) {
        expect(
          strong.turns >= 4,
          faction +
            ' chapter ' +
            chapter +
            ' strong army trivializes ' +
            encounterId +
            ' in fewer than four exchanges'
        );
      }

      expect(
        ratio(strong) + 0.001 >=
          ratio(normal),
        faction +
          ' chapter ' +
          chapter +
          ' strong legal gear performs worse than the normal loadout'
      );
    }
  }

  return rows;
}

function runCommanderCoverage() {
  for (const faction of [
    'human',
    'elf',
    'orc'
  ] as const) {
    const chapter = 5;
    const encounterId =
      bossByFaction[faction][chapter - 1];
    invariant(
      encounterId,
      'Missing commander coverage encounter.'
    );
    const units = normalArmy(
      faction,
      chapter
    );
    const squadCap =
      squadCaps[faction][chapter - 1] ?? 6;
    const shapeId = shapeFor(
      faction,
      chapter
    );

    for (const commander of getCommanderPaths(
      faction
    )) {
      const result = simulate({
        faction,
        units,
        doctrineId:
          doctrineByFaction[faction],
        shapeId,
        commander,
        encounterId,
        squadCap,
        readiness: 100
      });

      expect(
        result.victory,
        commander.name +
          ' can no longer clear the representative ' +
          faction +
          ' chapter 5 boss with a normal army'
      );
    }
  }
}

function runHumanStoryChoiceCoverage() {
  const faction: FactionId = 'human';
  const chapter = 4;
  const units = normalArmy(faction, chapter);
  const encounterId: EncounterId = 'pretender_general';
  const outcomes = new Set<string>();

  for (const choice of lastLoyalistChoices) {
    const result = simulate({
      faction,
      units,
      doctrineId: doctrineByFaction.human,
      shapeId: shapeFor('human', chapter),
      commander: defaultCommander('human'),
      encounterId,
      squadCap: 6,
      readiness: 100,
      modifier: {
        attackMultiplier: choice.attackMultiplier,
        armorMultiplier: choice.armorMultiplier,
        speedMultiplier: 1,
        retaliationMultiplier: choice.retaliationMultiplier,
        commanderSkillPowerMultiplier: 1
      }
    });

    expect(
      result.victory,
      'Human Chapter 4 became impossible with Loyalist approach: ' +
        choice.name
    );

    outcomes.add(
      [
        result.turns,
        result.remainingHp,
        result.enemyRemainingHp
      ].join('|')
    );
  }

  expect(
    outcomes.size >= 2,
    'The three Loyalist approaches no longer produce distinct Chapter 4 combat outcomes.'
  );
}

function runLatePolicyCoverage() {
  const humanUnits = normalArmy(
    'human',
    6
  );
  for (const decree of royalDecrees) {
    const result = simulate({
      faction: 'human',
      units: humanUnits,
      doctrineId: doctrineByFaction.human,
      shapeId: shapeFor('human', 6),
      commander:
        defaultCommander('human'),
      encounterId: 'return_to_crownspire',
      squadCap: 6,
      readiness: 100,
      modifier: {
        attackMultiplier:
          decree.attackMultiplier,
        armorMultiplier:
          decree.armorMultiplier,
        speedMultiplier: 1,
        commanderSkillPowerMultiplier: 1
      }
    });
    expect(
      result.victory,
      'Human Chapter 6 became impossible with Royal Decree: ' +
        decree.name
    );
  }

  for (const faction of [
    'elf',
    'orc'
  ] as const) {
    const units = normalArmy(faction, 6);
    const encounterId =
      bossByFaction[faction][5];
    invariant(
      encounterId,
      'Missing faction Chapter 6 boss.'
    );

    for (const mandate of factionMandates.filter(
      candidate =>
        candidate.faction === faction
    )) {
      const result = simulate({
        faction,
        units,
        doctrineId:
          doctrineByFaction[faction],
        shapeId: shapeFor(faction, 6),
        commander:
          defaultCommander(faction),
        encounterId,
        squadCap: 6,
        readiness: 100,
        modifier: {
          attackMultiplier:
            mandate.attackMultiplier,
          armorMultiplier:
            mandate.armorMultiplier,
          speedMultiplier:
            mandate.speedMultiplier,
          commanderSkillPowerMultiplier:
            mandate.commanderSkillPowerMultiplier
        }
      });
      expect(
        result.victory,
        faction +
          ' Chapter 6 became impossible with mandate: ' +
          mandate.name
      );
    }
  }
}

function runMountedBranchCoverage() {
  {
    const units = buildElfArmy(4);
    const removeIndex = units.findIndex(
      unit => unit.id === 'elf_pathfinder'
    );
    if (removeIndex >= 0) {
      units.splice(removeIndex, 1);
    }
    units.push(
      optionUnit(
        elfThirdRecruitOptions,
        'elf_stag_scout'
      )
    );

    const stagIndex = units.findIndex(
      unit => unit.id === 'elf_stag_scout'
    );
    invariant(
      stagIndex >= 0,
      'Stag Scout missing from branch scenario.'
    );
    let stag = units[stagIndex];
    invariant(stag, 'Stag Scout missing.');
    stag = applyAdvancedPromotion(
      stag,
      'stag_scout_stag_rider'
    );
    stag = applyAdvancedPromotion(
      stag,
      'stag_rider_mounted_ranger'
    );
    units[stagIndex] = stag;

    const result = simulate({
      faction: 'elf',
      units: applyGear(
        units,
        2,
        'light'
      ),
      doctrineId: 'elf_crescent',
      shapeId: 'skirmish_screen_243',
      commander:
        getCommanderPaths('elf').find(
          path => path.id === 'elf_windcaller'
        ) ?? null,
      encounterId: 'elf_ashen_druid',
      squadCap: 5,
      readiness: 100
    });

    expect(
      result.victory,
      'Mounted Ranger Stag branch no longer clears the Chapter 4 benchmark.'
    );
  }

  {
    const units = buildOrcArmy(4);
    const removeIndex = units.findIndex(
      unit => unit.id === 'orc_bone_hunter'
    );
    if (removeIndex >= 0) {
      units.splice(removeIndex, 1);
    }
    units.push(
      optionUnit(
        orcThirdRecruitOptions,
        'orc_warg_scout'
      )
    );

    const wargIndex = units.findIndex(
      unit => unit.id === 'orc_warg_scout'
    );
    invariant(
      wargIndex >= 0,
      'Warg Scout missing from branch scenario.'
    );
    let warg = units[wargIndex];
    invariant(warg, 'Warg Scout missing.');
    warg = applyAdvancedPromotion(
      warg,
      'warg_scout_warg_rider'
    );
    warg = applyAdvancedPromotion(
      warg,
      'warg_rider_warg_raider'
    );
    units[wargIndex] = warg;

    const result = simulate({
      faction: 'orc',
      units: applyGear(
        units,
        2,
        'light'
      ),
      doctrineId: 'orc_warband',
      shapeId: 'heavy_front_441',
      commander:
        getCommanderPaths('orc').find(
          path => path.id === 'orc_warglord'
        ) ?? null,
      encounterId: 'orc_split_chieftain',
      squadCap: 5,
      readiness: 100
    });

    expect(
      result.victory,
      'Warg Raider branch no longer clears the Chapter 4 benchmark.'
    );
  }
}

function runFormationCoverage() {
  const representative = {
    human: normalArmy('human', 5),
    elf: normalArmy('elf', 5),
    orc: normalArmy('orc', 5)
  };

  const signatures = new Set<string>();

  for (const shape of formationShapes) {
    const formation = buildFormation(
      representative.human,
      'human',
      shape.id
    );
    const analysis = analyzeFormation(
      formation,
      representative.human,
      'human',
      'human_balanced',
      shape.id
    );
    signatures.add(
      [
        analysis.attackMultiplier.toFixed(3),
        analysis.armorMultiplier.toFixed(3),
        analysis.speedMultiplier.toFixed(3),
        analysis.healingMultiplier.toFixed(3)
      ].join('|')
    );

    expect(
      analysis.attackMultiplier > 0.7 &&
        analysis.armorMultiplier > 0.7 &&
        analysis.speedMultiplier > 0.7,
      shape.name +
        ' generated an invalid combat multiplier.'
    );
  }

  expect(
    signatures.size >= 5,
    'Formation shapes are no longer producing meaningfully distinct combat profiles.'
  );

  const fitShapes: Record<
    FactionId,
    FormationShapeId[]
  > = {
    human: [
      'wide_vanguard_522',
      'reinforced_center_252'
    ],
    elf: [
      'protected_rear_225',
      'skirmish_screen_243'
    ],
    orc: [
      'assault_432',
      'heavy_front_441'
    ]
  };

  for (const faction of [
    'human',
    'elf',
    'orc'
  ] as const) {
    const encounterId =
      bossByFaction[faction][4];
    invariant(
      encounterId,
      'Missing Chapter 5 formation benchmark.'
    );

    for (const shapeId of fitShapes[faction]) {
      const result = simulate({
        faction,
        units: representative[faction],
        doctrineId:
          doctrineByFaction[faction],
        shapeId,
        commander:
          defaultCommander(faction),
        encounterId,
        squadCap: 6,
        readiness: 100
      });

      expect(
        result.victory,
        faction +
          ' fitted formation ' +
          shapeId +
          ' can no longer clear the Chapter 5 benchmark.'
      );
    }
  }
}

function runFormationMatchupCoverage() {
  const specialized = formationShapes.filter(
    shape => shape.id !== 'balanced_333'
  );

  for (const shape of formationShapes) {
    const mirror = getFormationMatchup(
      shape.id,
      shape.id
    );
    expect(
      mirror.result === 'even' &&
        mirror.outgoingDamageMultiplier === 1 &&
        mirror.incomingDamageMultiplier === 1,
      shape.name +
        ' mirror matchup is no longer neutral.'
    );
  }

  for (const enemy of formationShapes) {
    const balanced = getFormationMatchup(
      'balanced_333',
      enemy.id
    );
    expect(
      balanced.result === 'even',
      'Balanced Line should remain the neutral baseline against ' +
        enemy.name +
        '.'
    );
  }

  for (const shape of specialized) {
    let advantages = 0;
    let disadvantages = 0;

    for (const enemy of formationShapes) {
      if (enemy.id === shape.id) continue;
      const forward = getFormationMatchup(
        shape.id,
        enemy.id
      );
      const reverse = getFormationMatchup(
        enemy.id,
        shape.id
      );

      if (forward.result === 'advantage') {
        advantages += 1;
        expect(
          reverse.result === 'disadvantage',
          shape.name +
            ' advantage against ' +
            enemy.name +
            ' is not symmetric.'
        );
      } else if (
        forward.result === 'disadvantage'
      ) {
        disadvantages += 1;
        expect(
          reverse.result === 'advantage',
          shape.name +
            ' disadvantage against ' +
            enemy.name +
            ' is not symmetric.'
        );
      }
    }

    expect(
      advantages >= 2 && disadvantages >= 2,
      shape.name +
        ' no longer has enough meaningful counters and weaknesses (' +
        advantages +
        ' advantages / ' +
        disadvantages +
        ' disadvantages).'
    );
  }
}

function runEnemyFormationCoverage() {
  const ids = [
    ...bossByFaction.human,
    ...bossByFaction.elf,
    ...bossByFaction.orc,
    'three_seals_convergence',
    'ashen_triumvirate',
    'unbound_beacon'
  ] as EncounterId[];

  const shapeIds = new Set(
    ids.map(
      id =>
        getEnemyFormationTactic(id)
          .formationShapeId
    )
  );
  const nonNeutral = ids.filter(id => {
    const tactic =
      getEnemyFormationTactic(id);
    return (
      tactic.attackMultiplier !== 1 ||
      tactic.armorMultiplier !== 1 ||
      tactic.speedMultiplier !== 1
    );
  });

  expect(
    shapeIds.size >= 6,
    'Boss and endgame enemies no longer use enough distinct formation shapes.'
  );
  expect(
    nonNeutral.length >= 12,
    'Enemy formations are no longer materially affecting enough boss encounters.'
  );
}

function runEnemyArmyIdentityCoverage() {
  const ids = Object.keys(encounters) as EncounterId[];
  const profileIds = new Set(
    ids.map(id => getEnemyArmyProfile(id).id)
  );

  expect(
    profileIds.size >= 7,
    'Enemy encounters no longer expose enough distinct army identities.'
  );

  for (const id of ids) {
    const encounter = getEncounter(id);
    const tactic = getEnemyFormationTactic(id);
    const shape = getFormationShape(
      tactic.formationShapeId
    );
    const profile = getEnemyArmyProfile(id);
    const assignments =
      getEnemyRoleAssignments(
        id,
        shape.rows,
        encounter.enemyCount
      );

    expect(
      assignments.length ===
        Math.min(9, encounter.enemyCount),
      id +
        ' enemy role assignment count no longer matches encounter size.'
    );

    expect(
      new Set(
        assignments.map(assignment => assignment.slot)
      ).size === assignments.length,
      id +
        ' assigns multiple enemy roles to the same formation slot.'
    );

    if (encounter.enemyCount >= 4) {
      expect(
        new Set(
          assignments.map(assignment => assignment.role)
        ).size >= 2,
        id +
          ' no longer presents a readable mixed enemy composition.'
      );
    }

    expect(
      profile.openingPressureMultiplier >= 0.96 &&
        profile.openingPressureMultiplier <= 1.05 &&
        profile.sustainedPressureMultiplier >= 0.96 &&
        profile.sustainedPressureMultiplier <= 1.05 &&
        profile.armorMultiplier >= 0.96 &&
        profile.armorMultiplier <= 1.05,
      id +
        ' army identity modifiers escaped the intended soft tactical range.'
    );
  }
}

function runMetaCoverage() {
  for (const faction of [
    'human',
    'elf',
    'orc'
  ] as const) {
    const units = normalArmy(faction, 6);
    const result = simulate({
      faction,
      units,
      doctrineId:
        doctrineByFaction[faction],
      shapeId: shapeFor(faction, 6),
      commander:
        defaultCommander(faction),
      encounterId: 'unbound_beacon',
      squadCap: 6,
      readiness: 70,
      modifier:
        defaultModifierForFaction(
          faction,
          6
        ),
      alliance: true
    });

    expect(
      result.victory,
      faction +
        ' completed-faction army can no longer lead the final Three Seals boss at the 70% no-penalty threshold'
    );

    const under = simulate({
      faction,
      units: buildArmy(
        faction,
        6
      ).slice(0, 4),
      doctrineId:
        doctrineByFaction[faction],
      shapeId: shapeFor(faction, 6),
      commander:
        defaultCommander(faction),
      encounterId: 'unbound_beacon',
      squadCap: 6,
      readiness: 45,
      alliance: true
    });

    expect(
      !under.victory,
      faction +
        ' final meta encounter is too forgiving: four fatigued un-geared squads still win'
    );
  }
}

function runReadinessCoverage() {
  const fresh =
    getArmyReadinessProfile(100);
  const threshold =
    getArmyReadinessProfile(70);
  const fatigued =
    getArmyReadinessProfile(69);
  const exhausted =
    getArmyReadinessProfile(25);

  expect(
    JSON.stringify(fresh) ===
      JSON.stringify(threshold),
    '70% Readiness must remain a true no-penalty threshold.'
  );
  expect(
    fatigued.hpMultiplier < 1 &&
      fatigued.attackMultiplier < 1 &&
      fatigued.speedMultiplier < 1,
    '69% Readiness should begin applying fatigue.'
  );
  expect(
    exhausted.hpMultiplier >= 0.85 &&
      exhausted.attackMultiplier >= 0.92 &&
      exhausted.speedMultiplier >= 0.95,
    'Minimum Readiness penalties became harsher than the intended cap.'
  );

  const suppliedWear =
    getBattleReadinessWear(
      60,
      100,
      'Elite',
      true,
      true,
      true
    );
  const unsuppliedWear =
    getBattleReadinessWear(
      60,
      100,
      'Elite',
      true,
      false,
      false
    );
  expect(
    suppliedWear < unsuppliedWear,
    'Rations and medicine no longer reduce battle wear.'
  );

  const suppliedCost =
    getArmyResupplyCost(
      50,
      6,
      true,
      true
    );
  const unsuppliedCost =
    getArmyResupplyCost(
      50,
      6,
      false,
      false
    );
  expect(
    suppliedCost < unsuppliedCost,
    'Rations and medicine no longer reduce field resupply cost.'
  );
}

function printRows(rows: ScenarioRow[]) {
  console.log(
    '\nBalance regression matrix'
  );
  console.log(
    'Faction Ch State   Result Turns HP% Shape                 Encounter'
  );

  for (const row of rows) {
    const hp = Math.round(
      ratio(row.result) * 100
    )
      .toString()
      .padStart(3, ' ');
    const result = row.result.victory
      ? 'WIN '
      : 'LOSS';

    console.log(
      row.faction.padEnd(6) +
        ' ' +
        String(row.chapter).padStart(2, ' ') +
        ' ' +
        row.label.padEnd(7) +
        ' ' +
        result +
        ' ' +
        String(row.result.turns).padStart(
          5,
          ' '
        ) +
        ' ' +
        hp +
        '% ' +
        row.shapeId.padEnd(21) +
        ' ' +
        row.encounterId
    );
  }
}

function main() {
  runReadinessCoverage();
  const rows = runChapterMatrix();
  runCommanderCoverage();
  runHumanStoryChoiceCoverage();
  runLatePolicyCoverage();
  runMountedBranchCoverage();
  runFormationCoverage();
  runFormationMatchupCoverage();
  runEnemyFormationCoverage();
  runEnemyArmyIdentityCoverage();
  runMetaCoverage();

  printRows(rows);

  if (failures.length > 0) {
    console.error(
      '\nBALANCE REGRESSION FAILURES (' +
        failures.length +
        '):'
    );
    failures.forEach((failure, index) => {
      console.error(
        String(index + 1) +
          '. ' +
          failure
      );
    });
    throw new Error(
      String(failures.length) +
        ' deterministic balance guardrail(s) failed.'
    );
  }

  console.log(
    '\nPASS: chapter bosses, Readiness thresholds, commander paths, Loyalist approaches, formation shapes, formation counters, enemy formations, enemy army identities, late policies, mounted branches and Three Seals remain inside the intended deterministic guardrails.'
  );
}

main();
