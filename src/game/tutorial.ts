import type {
  BuildingDefinition,
  EnemyFantasyThreatFamily,
  FactionId,
  NavId,
  SideModeId,
  UnitDefinition
} from './types';

export type TutorialView =
  | NavId
  | 'battlePrep'
  | 'battle'
  | 'results'
  | 'settlement'
  | 'fantasyResearch'
  | 'flyingResearch'
  | 'largeResearch'
  | 'hybridResearch'
  | 'other';

export type TutorialTarget =
  | 'campaign'
  | 'kingdom'
  | 'formation'
  | 'army'
  | 'wagon'
  | 'settlement'
  | 'forge'
  | 'none';

export type TutorialFocusTarget =
  | { kind: 'nav'; nav: NavId; label: string }
  | { kind: 'campaign-current'; label: string }
  | { kind: 'campaign-activities'; label: string; modeId?: SideModeId }
  | { kind: 'battle-begin'; label: string }
  | { kind: 'battle-readiness'; label: string }
  | { kind: 'results-continue'; label: string }
  | { kind: 'formation-unit'; unitId: string; label: string }
  | { kind: 'formation-basics'; label: string }
  | { kind: 'formation-shape'; label: string }
  | { kind: 'settlement-first-plot'; label: string }
  | { kind: 'settlement-building'; buildingId: string; label: string }
  | { kind: 'forge-craft'; label: string }
  | { kind: 'army-equipment'; label: string }
  | { kind: 'kingdom-production'; label: string }
  | { kind: 'army-fantasy'; family: 'magic' | 'flying' | 'large' | 'hybrid'; label: string }
  | { kind: 'research-start'; family: 'magic' | 'flying' | 'large' | 'hybrid'; label: string }
  | { kind: 'research-train'; family: 'magic' | 'flying' | 'large' | 'hybrid'; label: string };

export type TutorialMoment = {
  key: string;
  kind: 'core' | 'system' | 'unit' | 'building';
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  target: TutorialTarget;
  focusAfterPrimary?: TutorialFocusTarget;
  stepLabel?: string;
};

export type TutorialBuildingState = {
  definition: BuildingDefinition;
  level: number;
  unlocked: boolean;
};

export type TutorialContext = {
  faction: FactionId;
  view: TutorialView;
  tutorialSeen: string[];
  units: UnitDefinition[];
  buildings: TutorialBuildingState[];
  settlementUpgraded: boolean;
  forgeUnlocked: boolean;
  forgeLevel: number;
  firstPromotionComplete: boolean;
  commanderPathId: string | null;
  armyReadiness: number;
  unlockedResourceSites: number;
  wagonStageId: string;
  warTableUnlocked: boolean;
  kingdomTrialsUnlocked: boolean;
  kingdomDefenseModeUnlocked: boolean;
  expeditionsUnlocked: boolean;
  siegesUnlocked: boolean;
  relicHuntsUnlocked: boolean;
  magicStoryUnlocked: boolean;
  flyingStoryUnlocked: boolean;
  largeStoryUnlocked: boolean;
  hybridStoryUnlocked: boolean;
  hybridPrerequisitesMet: boolean;
  completedMagicResearch: number;
  completedFlyingResearch: number;
  completedLargeResearch: number;
  completedHybridResearch: number;
  enemyFantasyThreatFamily: EnemyFantasyThreatFamily | null;
};

export const CORE_TUTORIAL_KEYS = [
  'core:kingdom',
  'core:campaign',
  'core:battle-prep',
  'core:battle',
  'core:results'
] as const;

export const SYSTEM_TUTORIAL_KEYS = [
  'system:settlement',
  'system:formation',
  'system:forge',
  'system:promotion',
  'system:commander',
  'system:readiness',
  'system:production',
  'system:advanced-formations',
  'system:war-table',
  'system:kingdom-trials',
  'system:kingdom-defense-repeatable',
  'system:expeditions',
  'system:sieges',
  'system:relic-hunts',
  'system:magic-discovery',
  'system:magic-research',
  'system:magic-training',
  'system:flying-discovery',
  'system:flying-research',
  'system:flying-training',
  'system:large-discovery',
  'system:large-research',
  'system:large-training',
  'system:hybrid-discovery',
  'system:hybrid-prerequisites',
  'system:hybrid-research',
  'system:hybrid-training',
  'system:enemy-fantasy-threat'
] as const;

export const FACTION_TUTORIAL_KEYS = [
  'faction:intro'
] as const;

const starterUnitIds: Record<FactionId, Set<string>> = {
  human: new Set(['hum_militia', 'hum_recruit']),
  elf: new Set(['elf_warden', 'elf_forest_scout']),
  orc: new Set(['orc_youngblood', 'orc_hunter'])
};

const stageRank: Record<string, number> = {
  camp: 0,
  settlement: 1,
  fort: 2,
  town: 3,
  stronghold: 4,
  capital: 5,
  grand: 6
};

function seen(context: TutorialContext, key: string) {
  return context.tutorialSeen.includes(key);
}

function foundationReady(context: TutorialContext) {
  return context.faction === 'human'
    ? seen(context, 'core:results')
    : seen(context, 'faction:intro');
}

function factionIntroMoment(
  context: TutorialContext
): TutorialMoment | null {
  if (
    context.faction === 'human' ||
    seen(context, 'faction:intro') ||
    !['kingdom', 'campaign'].includes(context.view)
  ) {
    return null;
  }

  if (context.faction === 'elf') {
    return {
      key: 'faction:intro',
      kind: 'core',
      eyebrow: 'NEW FACTION',
      title: 'Elves fight differently',
      body:
        'You already know the core game, so this campaign skips the beginner tutorial. Elven Wards reward spacing, diagonals and open cells; tight Human lines are often less effective here. New Elven squads, buildings and systems will still be introduced when they unlock.',
      primaryLabel: 'Show the first Elven objective',
      target: 'campaign',
      focusAfterPrimary: {
        kind: 'campaign-current',
        label: 'TAP CURRENT OBJECTIVE'
      }
    };
  }

  return {
    key: 'faction:intro',
    kind: 'core',
    eyebrow: 'NEW FACTION',
    title: 'Orcs build Momentum',
    body:
      'You already know the core game, so this campaign skips the beginner tutorial. Orc formations reward aggressive adjacency, charges and sustained pressure. New Orc squads, buildings and systems will still be introduced when they unlock.',
    primaryLabel: 'Show the first Orc objective',
    target: 'campaign',
    focusAfterPrimary: {
      kind: 'campaign-current',
      label: 'TAP CURRENT OBJECTIVE'
    }
  };
}

export function tutorialUnitKey(unitId: string) {
  return 'unit:' + unitId;
}

export function tutorialBuildingKey(buildingId: string) {
  return 'building:' + buildingId;
}

function coreMoment(
  context: TutorialContext
): TutorialMoment | null {
  if (
    context.faction === 'human' &&
    context.view === 'kingdom' &&
    !seen(context, 'core:kingdom')
  ) {
    return {
      key: 'core:kingdom',
      kind: 'core',
      eyebrow: 'GUIDED START',
      stepLabel: 'STEP 1 OF 5',
      title: 'This camp is your command center',
      body:
        'Kingdom shows your settlement, resources and buildings. You start small; campaign victories turn this camp into a real realm. For now, your next decision is on the Campaign screen.',
      primaryLabel: 'Show me where to go',
      target: 'none',
      focusAfterPrimary: {
        kind: 'nav',
        nav: 'campaign',
        label: 'TAP CAMPAIGN'
      }
    };
  }

  if (
    context.faction === 'human' &&
    seen(context, 'core:kingdom') &&
    context.view === 'campaign' &&
    !seen(context, 'core:campaign')
  ) {
    return {
      key: 'core:campaign',
      kind: 'core',
      eyebrow: 'CAMPAIGN',
      stepLabel: 'STEP 2 OF 5',
      title: 'Advance one objective at a time',
      body:
        'The campaign is deliberately staged. Complete the highlighted objective, then the next node opens. Your first fight teaches the basics before recruitment, buildings and deeper formations are introduced.',
      primaryLabel: 'Show the first objective',
      target: 'none',
      focusAfterPrimary: {
        kind: 'campaign-current',
        label: 'TAP CURRENT OBJECTIVE'
      }
    };
  }

  if (
    context.faction === 'human' &&
    seen(context, 'core:campaign') &&
    context.view === 'battlePrep' &&
    !seen(context, 'core:battle-prep')
  ) {
    return {
      key: 'core:battle-prep',
      kind: 'core',
      eyebrow: 'BATTLE PREP',
      stepLabel: 'STEP 3 OF 5',
      title: 'Prepare before committing',
      body:
        'Battle Prep is where you check active squads, formation, enemy information and Army Readiness. Early fights are readable, but later battles expect you to react to counters instead of simply having higher numbers.',
      primaryLabel: 'Show Begin Battle',
      target: 'none',
      focusAfterPrimary: {
        kind: 'battle-begin',
        label: 'TAP BEGIN BATTLE'
      }
    };
  }

  if (
    context.faction === 'human' &&
    seen(context, 'core:battle-prep') &&
    context.view === 'battle' &&
    !seen(context, 'core:battle')
  ) {
    return {
      key: 'core:battle',
      kind: 'core',
      eyebrow: 'AUTO-BATTLE',
      stepLabel: 'STEP 4 OF 5',
      title: 'Your preparation decides the fight',
      body:
        'Combat resolves automatically so your strategic choices matter most. Watch which squads deal damage, which take pressure, and how your formation behaves. The battle begins only after you dismiss this lesson.',
      primaryLabel: 'Begin Battle',
      target: 'none'
    };
  }

  if (
    context.faction === 'human' &&
    seen(context, 'core:battle') &&
    context.view === 'results' &&
    !seen(context, 'core:results')
  ) {
    return {
      key: 'core:results',
      kind: 'core',
      eyebrow: 'AFTER ACTION',
      stepLabel: 'STEP 5 OF 5',
      title: 'Rewards and losses carry forward',
      body:
        'Results show what the army earned and how much condition remains. Rewards are already secured here. Army Readiness persists into later battles, so repeated hard fights eventually require rest and provisions.',
      primaryLabel: 'Show Continue',
      target: 'none',
      focusAfterPrimary: {
        kind: 'results-continue',
        label: 'TAP CONTINUE'
      }
    };
  }

  return null;
}

function unitMoment(
  context: TutorialContext
): TutorialMoment | null {
  if (!foundationReady(context)) return null;
  if (
    !['formation', 'army', 'kingdom', 'campaign'].includes(
      context.view
    )
  ) {
    return null;
  }

  const newUnit = context.units.find(
    unit =>
      !starterUnitIds[context.faction].has(unit.id) &&
      !seen(context, tutorialUnitKey(unit.id))
  );

  if (!newUnit) return null;

  const capacity =
    (newUnit.deploymentCapacity ?? 1) > 1
      ? ' It uses ' +
        String(newUnit.deploymentCapacity) +
        ' deployment capacity when fielded.'
      : '';

  return {
    key: tutorialUnitKey(newUnit.id),
    kind: 'unit',
    eyebrow: 'NEW SQUAD UNLOCKED',
    title:
      newUnit.name + ' · ' + newUnit.className,
    body:
      'Role: ' +
      newUnit.role.toUpperCase() +
      '. HP ' +
      newUnit.hp +
      ' · ATK ' +
      newUnit.attack +
      ' · ARM ' +
      newUnit.armor +
      ' · SPD ' +
      newUnit.speed +
      '.' +
      capacity +
      ' New squads are not automatically the best fit for every battle—place them deliberately in Formation.',
    primaryLabel: 'Show me the squad',
    target: 'formation',
    focusAfterPrimary: {
      kind: 'formation-unit',
      unitId: newUnit.id,
      label: 'SELECT NEW SQUAD'
    }
  };
}

function buildingMoment(
  context: TutorialContext
): TutorialMoment | null {
  if (!foundationReady(context)) return null;
  if (
    !['kingdom', 'campaign', 'army', 'formation'].includes(
      context.view
    )
  ) {
    return null;
  }

  const building = context.buildings.find(
    entry =>
      entry.unlocked &&
      entry.level <= 0 &&
      !seen(
        context,
        tutorialBuildingKey(entry.definition.id)
      )
  );

  if (!building) return null;

  return {
    key: tutorialBuildingKey(
      building.definition.id
    ),
    kind: 'building',
    eyebrow: 'NEW BUILDING UNLOCKED',
    title: building.definition.name,
    body:
      building.definition.description +
      ' The blueprint is now available, but it still needs a free Settlement plot and its construction resources.',
    primaryLabel: 'Show me where to build it',
    target: 'settlement',
    focusAfterPrimary: {
      kind: 'settlement-building',
      buildingId: building.definition.id,
      label: 'BUILD ' + building.definition.name.toUpperCase()
    }
  };
}

function systemMoment(
  context: TutorialContext
): TutorialMoment | null {
  if (!foundationReady(context)) return null;

  if (
    context.settlementUpgraded &&
    context.view === 'kingdom' &&
    !seen(context, 'system:settlement')
  ) {
    return {
      key: 'system:settlement',
      kind: 'system',
      eyebrow: 'SYSTEM UNLOCKED',
      title: 'Settlement building',
      body:
        'Your settlement is now more than a backdrop. Place unlocked buildings on open plots, then upgrade the structures required by future chapter expansions. Build for progression first; adjacency bonuses are optimization, not an early requirement.',
      primaryLabel: 'Show me a building plot',
      target: 'settlement',
      focusAfterPrimary: {
        kind: 'settlement-first-plot',
        label: 'TAP AN EMPTY PLOT'
      }
    };
  }

  if (
    context.units.length >
      starterUnitIds[context.faction].size &&
    context.view === 'formation' &&
    !seen(context, 'system:formation')
  ) {
    return {
      key: 'system:formation',
      kind: 'system',
      eyebrow: 'SYSTEM UNLOCKED',
      title: 'Formation now matters',
      body:
        'You have more squads than the opening pair. Tap a squad, then a position to place or move it. Front, middle and rear rows behave differently, and later formation shapes trade protection, width and pressure.',
      primaryLabel: 'Show me how to place a squad',
      target: 'none',
      focusAfterPrimary: {
        kind: 'formation-basics',
        label: 'SELECT A SQUAD'
      }
    };
  }

  if (
    context.forgeLevel > 0 &&
    (
      context.faction !== 'human' ||
      context.forgeUnlocked
    ) &&
    ['kingdom', 'army'].includes(context.view) &&
    !seen(context, 'system:forge')
  ) {
    if (context.faction !== 'human') {
      return {
        key: 'system:forge',
        kind: 'system',
        eyebrow: 'SYSTEM UNLOCKED',
        title: 'Equipment is now available',
        body:
          'Your faction forge enables equipment progression for individual squads. Gear changes stats and later class branches, but you do not need to buy something immediately just because it unlocked.',
        primaryLabel: 'Show Unit Equipment',
        target: 'army',
        focusAfterPrimary: {
          kind: 'army-equipment',
          label: 'OPEN UNIT EQUIPMENT'
        }
      };
    }

    return {
      key: 'system:forge',
      kind: 'system',
      eyebrow: 'SYSTEM UNLOCKED',
      title: 'Equipment changes progression',
      body:
        'The Forge creates real equipment for individual squads. Weapons, armor, shields and mounts improve combat stats, and some class branches require specific gear combinations rather than only higher levels.',
      primaryLabel: 'Show the Forge',
      target: 'forge',
      focusAfterPrimary: {
        kind: 'forge-craft',
        label: 'CRAFT YOUR FIRST ITEM'
      }
    };
  }

  if (
    context.firstPromotionComplete &&
    context.view === 'army' &&
    !seen(context, 'system:promotion')
  ) {
    return {
      key: 'system:promotion',
      kind: 'system',
      eyebrow: 'UNIT PROGRESSION',
      title: 'Promotion paths can branch',
      body:
        'Your first promotion is complete. Future upgrades can depend on class, buildings and equipped gear. A mounted weapon can create a very different squad from the same base unit, so upgrades are choices rather than a single ladder.',
      primaryLabel: 'Got it',
      target: 'none'
    };
  }

  if (
    context.commanderPathId &&
    context.view === 'army' &&
    !seen(context, 'system:commander')
  ) {
    return {
      key: 'system:commander',
      kind: 'system',
      eyebrow: 'COMMANDER SPECIALIZATION',
      title: 'Build around your commander',
      body:
        'Commander paths favor specific battlefield roles and add an active combat skill. You do not need a perfect meta composition, but matching several squads to the commander creates a noticeable edge.',
      primaryLabel: 'Understood',
      target: 'none'
    };
  }

  if (
    context.armyReadiness < 70 &&
    ['kingdom', 'battlePrep'].includes(context.view) &&
    !seen(context, 'system:readiness')
  ) {
    return {
      key: 'system:readiness',
      kind: 'system',
      eyebrow: 'ARMY CONDITION',
      title: 'Readiness carries between battles',
      body:
        'Your army has now dropped below 70% Readiness, so fatigue is actively reducing effective HP, attack and speed. Rest & Resupply uses provisions to restore the army. Above 70%, there is no combat penalty, so normal wins do not require immediate recovery.',
      primaryLabel:
        context.view === 'battlePrep'
          ? 'Show Readiness'
          : 'Got it',
      target: 'none',
      ...(context.view === 'battlePrep'
        ? {
            focusAfterPrimary: {
              kind: 'battle-readiness' as const,
              label: 'ARMY READINESS'
            }
          }
        : {})
    };
  }

  if (
    context.view === 'battlePrep' &&
    context.enemyFantasyThreatFamily &&
    !seen(context, 'system:enemy-fantasy-threat')
  ) {
    const lesson =
      context.enemyFantasyThreatFamily === 'magic'
        ? {
            title: 'Enemy magic needs a screen and a counter',
            body:
              'Some later armies bring real spell pressure. Battle Prep now shows an Enemy Fantasy Threat card with your counter coverage. Support, your own magic specialists and durable frontline protection help stabilize enemy Magic.'
          }
        : context.enemyFantasyThreatFamily === 'flying'
          ? {
              title: 'Enemy flyers can bypass ordinary screens',
              body:
                'Flying enemies can reach protected lanes unless you contest the air. Ranged and skirmish squads provide practical anti-air pressure; Battle Prep shows whether your current army has enough coverage.'
            }
          : context.enemyFantasyThreatFamily === 'large'
            ? {
                title: 'Large enemies demand focused answers',
                body:
                  'Oversized enemies can break ordinary lines. Spears, lancers and concentrated ranged fire are your main anti-large tools. Check the Enemy Fantasy Threat card before committing.'
              }
            : {
                title: 'Legendary enemies combine multiple threats',
                body:
                  'Legendary hybrids combine magic and flight. You need both warding/support and enough ranged pressure to contest the air; solving only one half leaves the army exposed.'
              };

    return {
      key: 'system:enemy-fantasy-threat',
      kind: 'system',
      eyebrow: 'NEW ENEMY THREAT',
      title: lesson.title,
      body:
        lesson.body +
        ' These counters are tactical advantages, not hard requirements—you can still fight without them, but the battle will be riskier.',
      primaryLabel: 'Show the counter read',
      target: 'none'
    };
  }

  if (
    context.unlockedResourceSites > 0 &&
    context.view === 'kingdom' &&
    !seen(context, 'system:production')
  ) {
    return {
      key: 'system:production',
      kind: 'system',
      eyebrow: 'REGIONAL PRODUCTION',
      title: 'Secured regions now work for you',
      body:
        'Some campaign victories unlock farms, mines, camps or depots. Meaningful activities add their output to regional stock. Claim that stock from Kingdom when you need it; it is part of normal progression, not an ad reward.',
      primaryLabel: 'Show regional stock',
      target: 'kingdom',
      focusAfterPrimary: {
        kind: 'kingdom-production',
        label: 'REGIONAL PRODUCTION'
      }
    };
  }

  if (
    context.magicStoryUnlocked &&
    context.view === 'army' &&
    !seen(context, 'system:magic-discovery')
  ) {
    const name =
      context.faction === 'human'
        ? 'Arcane Academy'
        : context.faction === 'elf'
          ? 'Circle of Ancients'
          : 'Spirit Lodge';

    return {
      key: 'system:magic-discovery',
      kind: 'system',
      eyebrow: 'NEW TROOP FAMILY',
      title: 'Magic has entered the campaign',
      body:
        name +
        ' is now operational. Magic adds specialist pressure and support, but it does not replace conventional frontline protection. Dense shields are vulnerable to magic; exposed casters are vulnerable to pressure. Research turns the first story discovery into repeatable training.',
      primaryLabel: 'Show Arcane Research',
      target: 'army',
      focusAfterPrimary: {
        kind: 'army-fantasy',
        family: 'magic',
        label: 'OPEN ARCANE RESEARCH'
      }
    };
  }

  if (
    context.magicStoryUnlocked &&
    context.view === 'fantasyResearch' &&
    !seen(context, 'system:magic-research')
  ) {
    return {
      key: 'system:magic-research',
      kind: 'system',
      eyebrow: 'RESEARCH',
      title: 'Research one doctrine at a time',
      body:
        'Starting research costs no Gems. The timer progresses normally while you play or leave the app. Rewarded ads and Gems only shorten the wait; neither is required. Complete a doctrine to unlock its repeatable training recipe.',
      primaryLabel: 'Show available research',
      target: 'none',
      focusAfterPrimary: {
        kind: 'research-start',
        family: 'magic',
        label: 'START RESEARCH'
      }
    };
  }

  if (
    context.completedMagicResearch > 0 &&
    context.view === 'fantasyResearch' &&
    !seen(context, 'system:magic-training')
  ) {
    return {
      key: 'system:magic-training',
      kind: 'system',
      eyebrow: 'TRAINING UNLOCKED',
      title: 'Research unlocks training—not free troops',
      body:
        'The doctrine is complete, so its class can now be trained repeatedly. New magic squads still cost normal resources and use deployment capacity. Build them when they solve a tactical need rather than replacing every conventional unit.',
      primaryLabel: 'Show trainable class',
      target: 'none',
      focusAfterPrimary: {
        kind: 'research-train',
        family: 'magic',
        label: 'TRAIN THIS CLASS'
      }
    };
  }

  if (
    context.flyingStoryUnlocked &&
    context.view === 'army' &&
    !seen(context, 'system:flying-discovery')
  ) {
    const name =
      context.faction === 'human'
        ? 'Griffin Aerie'
        : context.faction === 'elf'
          ? 'Eagle Sanctuary'
          : 'Wyvern Roost';

    return {
      key: 'system:flying-discovery',
      kind: 'system',
      eyebrow: 'NEW TROOP FAMILY',
      title: 'Aerial warfare is now available',
      body:
        name +
        ' is now operational. Flying squads can reach protected backlines and create charge pressure, but concentrated missile fire and anti-air units punish careless deployment. Treat aerial troops as specialists, not automatic upgrades.',
      primaryLabel: 'Show Aerial Training',
      target: 'army',
      focusAfterPrimary: {
        kind: 'army-fantasy',
        family: 'flying',
        label: 'OPEN AERIAL TRAINING'
      }
    };
  }

  if (
    context.flyingStoryUnlocked &&
    context.view === 'flyingResearch' &&
    !seen(context, 'system:flying-research')
  ) {
    return {
      key: 'system:flying-research',
      kind: 'system',
      eyebrow: 'AERIAL RESEARCH',
      title: 'Handling research unlocks the branch',
      body:
        'Only one fantasy research project runs at a time. Let the timer finish normally, or optionally shorten it with rewarded ads or Gems. Completing the handling doctrine unlocks your faction’s repeatable flying branches.',
      primaryLabel: 'Show available research',
      target: 'none',
      focusAfterPrimary: {
        kind: 'research-start',
        family: 'flying',
        label: 'START RESEARCH'
      }
    };
  }

  if (
    context.completedFlyingResearch > 0 &&
    context.view === 'flyingResearch' &&
    !seen(context, 'system:flying-training')
  ) {
    return {
      key: 'system:flying-training',
      kind: 'system',
      eyebrow: 'AERIAL TRAINING',
      title: 'Choose aerial troops for the matchup',
      body:
        'Your researched flying classes can now be trained repeatedly. They still cost resources and deployment capacity. Use them to pressure backlines or exploit weak anti-air; keep a ground plan when enemy ranged pressure is concentrated.',
      primaryLabel: 'Show trainable class',
      target: 'none',
      focusAfterPrimary: {
        kind: 'research-train',
        family: 'flying',
        label: 'TRAIN THIS CLASS'
      }
    };
  }

  if (
    context.largeStoryUnlocked &&
    context.view === 'army' &&
    !seen(context, 'system:large-discovery')
  ) {
    const name =
      context.faction === 'human'
        ? 'Construct Foundry'
        : context.faction === 'elf'
          ? 'Ancient Grove'
          : 'Great Beast Pens';

    return {
      key: 'system:large-discovery',
      kind: 'system',
      eyebrow: 'CHAPTER 7 MASTERY',
      title: 'Large units change army capacity',
      body:
        name +
        ' is now operational. Large units are powerful formation breakers, but each consumes 2 deployment capacity while occupying one formation cell. Concentrated missiles and disciplined anti-large troops can punish them, so a Large unit is a composition choice rather than a free upgrade.',
      primaryLabel: 'Show Large Unit Mastery',
      target: 'army',
      focusAfterPrimary: {
        kind: 'army-fantasy',
        family: 'large',
        label: 'OPEN LARGE UNIT MASTERY'
      }
    };
  }

  if (
    context.largeStoryUnlocked &&
    context.view === 'largeResearch' &&
    !seen(context, 'system:large-research')
  ) {
    return {
      key: 'system:large-research',
      kind: 'system',
      eyebrow: 'MASTERY RESEARCH',
      title: 'Master the first Large discovery',
      body:
        'Large-unit mastery uses the same optional research model as other fantasy families: the timer finishes naturally, while rewarded ads or Gems only shorten the wait. Completing mastery unlocks repeatable Large-unit training.',
      primaryLabel: 'Show mastery research',
      target: 'none',
      focusAfterPrimary: {
        kind: 'research-start',
        family: 'large',
        label: 'START MASTERY'
      }
    };
  }

  if (
    context.completedLargeResearch > 0 &&
    context.view === 'largeResearch' &&
    !seen(context, 'system:large-training')
  ) {
    return {
      key: 'system:large-training',
      kind: 'system',
      eyebrow: 'LARGE TRAINING',
      title: 'Power costs deployment space',
      body:
        'Your mastered Large classes can now be trained repeatedly. Every Large squad costs normal resources and 2 deployment capacity, so adding one usually means benching or replacing conventional squads. Use them when breakthrough power is worth that trade.',
      primaryLabel: 'Show trainable Large unit',
      target: 'none',
      focusAfterPrimary: {
        kind: 'research-train',
        family: 'large',
        label: 'TRAIN THIS LARGE UNIT'
      }
    };
  }

  if (
    context.hybridStoryUnlocked &&
    context.view === 'army' &&
    !seen(context, 'system:hybrid-discovery')
  ) {
    const name =
      context.faction === 'human'
        ? 'High Arcane Aerie'
        : context.faction === 'elf'
          ? 'Moonwing Sanctuary'
          : 'Elder Wyvern Shrine';

    return {
      key: 'system:hybrid-discovery',
      kind: 'system',
      eyebrow: 'LEGENDARY TROOP FAMILY',
      title: 'Magic and flight can now be combined',
      body:
        name +
        ' is now operational. Your first legendary hybrid is a story reward, but repeatable training is intentionally gated behind completed Magic and Flying research. Hybrids consume 2 deployment capacity and still face warded and anti-air counters.',
      primaryLabel: 'Show Legendary Orders',
      target: 'army',
      focusAfterPrimary: {
        kind: 'army-fantasy',
        family: 'hybrid',
        label: 'OPEN LEGENDARY ORDERS'
      }
    };
  }

  if (
    context.hybridStoryUnlocked &&
    context.view === 'hybridResearch' &&
    !context.hybridPrerequisitesMet &&
    !seen(context, 'system:hybrid-prerequisites')
  ) {
    return {
      key: 'system:hybrid-prerequisites',
      kind: 'system',
      eyebrow: 'LEGENDARY PREREQUISITES',
      title: 'Finish the earlier fantasy branches first',
      body:
        'The story reward is yours immediately, but repeatable legendary training remains locked until this faction’s Magic and Flying research are complete. This keeps Chapter 8 as a culmination of earlier fantasy progression rather than a shortcut around it.',
      primaryLabel: 'Got it',
      target: 'none'
    };
  }

  if (
    context.hybridStoryUnlocked &&
    context.hybridPrerequisitesMet &&
    context.view === 'hybridResearch' &&
    !seen(context, 'system:hybrid-research')
  ) {
    return {
      key: 'system:hybrid-research',
      kind: 'system',
      eyebrow: 'LEGENDARY DOCTRINE',
      title: 'Legendary research is now available',
      body:
        'The legendary doctrine uses the same optional timer model as earlier fantasy research. Let it finish naturally, or shorten it with rewarded ads or Gems. Completing it unlocks repeatable hybrid training.',
      primaryLabel: 'Show legendary research',
      target: 'none',
      focusAfterPrimary: {
        kind: 'research-start',
        family: 'hybrid',
        label: 'START LEGENDARY RESEARCH'
      }
    };
  }

  if (
    context.completedHybridResearch > 0 &&
    context.view === 'hybridResearch' &&
    !seen(context, 'system:hybrid-training')
  ) {
    return {
      key: 'system:hybrid-training',
      kind: 'system',
      eyebrow: 'LEGENDARY TRAINING',
      title: 'Legendary does not mean universal',
      body:
        'Repeatable hybrids are now available, but each costs significant resources and 2 deployment capacity. Use them to crack protected formations or combine arcane pressure with backline access; switch away when wards or concentrated anti-air make their premium inefficient.',
      primaryLabel: 'Show trainable hybrid',
      target: 'none',
      focusAfterPrimary: {
        kind: 'research-train',
        family: 'hybrid',
        label: 'TRAIN THIS HYBRID'
      }
    };
  }

  if (
    (stageRank[context.wagonStageId] ?? 0) >= 2 &&
    context.view === 'formation' &&
    !seen(context, 'system:advanced-formations')
  ) {
    return {
      key: 'system:advanced-formations',
      kind: 'system',
      eyebrow: 'TACTICAL SYSTEM',
      title: 'Formation shapes have counters',
      body:
        'Fort-tier armies unlock specialized shapes such as wide fronts and protected rear lines. No shape is simply best: enemy geometry can create an edge or expose a weakness. Save useful setups as loadouts so you can switch quickly in Battle Prep.',
      primaryLabel: 'Show formation shapes',
      target: 'formation',
      focusAfterPrimary: {
        kind: 'formation-shape',
        label: 'CHOOSE A SHAPE'
      }
    };
  }

  if (
    context.warTableUnlocked &&
    context.view === 'campaign' &&
    !seen(context, 'system:war-table')
  ) {
    return {
      key: 'system:war-table',
      kind: 'system',
      eyebrow: 'NEW ACTIVITY',
      title: 'War Table unlocked',
      body:
        'Your scouts now post optional contracts away from the main campaign route. Use the War Table to practice formation counters and recover modest resources. Campaign progress never requires farming these battles.',
      primaryLabel: 'Show War Table',
      target: 'none',
      focusAfterPrimary: {
        kind: 'campaign-activities',
        modeId: 'war_table',
        label: 'TAP ACTIVITIES'
      }
    };
  }

  if (
    context.kingdomTrialsUnlocked &&
    context.view === 'campaign' &&
    !seen(context, 'system:kingdom-trials')
  ) {
    return {
      key: 'system:kingdom-trials',
      kind: 'system',
      eyebrow: 'NEW ACTIVITY',
      title: 'Kingdom Trials unlocked',
      body:
        'Trials are tactical challenges rather than normal power checks. Their rules ask you to use rows, protection and counters deliberately, so a better formation can matter more than a larger army.',
      primaryLabel: 'Show Kingdom Trials',
      target: 'none',
      focusAfterPrimary: {
        kind: 'campaign-activities',
        modeId: 'formation_trials',
        label: 'TAP ACTIVITIES'
      }
    };
  }

  if (
    context.kingdomDefenseModeUnlocked &&
    context.view === 'campaign' &&
    !seen(context, 'system:kingdom-defense-repeatable')
  ) {
    return {
      key: 'system:kingdom-defense-repeatable',
      kind: 'system',
      eyebrow: 'ACTIVITY EXPANDED',
      title: 'Kingdom Defense is now repeatable',
      body:
        'You survived the story defense. From now on, Kingdom Defense also works as optional endurance content for settlement materials. Readiness and supplies carry real weight across the waves.',
      primaryLabel: 'Show Kingdom Defense',
      target: 'none',
      focusAfterPrimary: {
        kind: 'campaign-activities',
        modeId: 'kingdom_defense',
        label: 'TAP ACTIVITIES'
      }
    };
  }

  if (
    context.expeditionsUnlocked &&
    context.view === 'campaign' &&
    !seen(context, 'system:expeditions')
  ) {
    return {
      key: 'system:expeditions',
      kind: 'system',
      eyebrow: 'NEW ACTIVITY',
      title: 'Expeditions unlocked',
      body:
        'Your growing kingdom can now support longer branching runs. One formation and wagon loadout must last through the route, so preparation and resource management matter more than in a single skirmish.',
      primaryLabel: 'Show Expeditions',
      target: 'none',
      focusAfterPrimary: {
        kind: 'campaign-activities',
        modeId: 'expeditions',
        label: 'TAP ACTIVITIES'
      }
    };
  }

  if (
    context.siegesUnlocked &&
    context.view === 'campaign' &&
    !seen(context, 'system:sieges')
  ) {
    return {
      key: 'system:sieges',
      kind: 'system',
      eyebrow: 'NEW ACTIVITY',
      title: 'Offensive Sieges unlocked',
      body:
        'Your army can now attack fortified positions away from the main campaign. Sieges are four-stage assaults: approach, breach, courtyard and commander. Forge, Army, Command, Logistics and Wagon preparation all affect the run, and failed assaults keep their Readiness loss.',
      primaryLabel: 'Show Offensive Sieges',
      target: 'none',
      focusAfterPrimary: {
        kind: 'campaign-activities',
        modeId: 'sieges',
        label: 'TAP ACTIVITIES'
      }
    };
  }

  if (
    context.relicHuntsUnlocked &&
    context.view === 'campaign' &&
    !seen(context, 'system:relic-hunts')
  ) {
    return {
      key: 'system:relic-hunts',
      kind: 'system',
      eyebrow: 'LATE-GAME ACTIVITY',
      title: 'Relic Hunts unlocked',
      body:
        'Your first fantasy class gives access to Relic Hunts. These are three-guardian mastery chains built around Magic, Flying, Large and hybrid counters. The first clear awards a unique Artifact-slot item and account cosmetic; later clears are practice only.',
      primaryLabel: 'Show Relic Hunts',
      target: 'none',
      focusAfterPrimary: {
        kind: 'campaign-activities',
        modeId: 'relic_hunts',
        label: 'TAP ACTIVITIES'
      }
    };
  }

  return null;
}

export function getNextTutorialMoment(
  context: TutorialContext
): TutorialMoment | null {
  const core = coreMoment(context);
  if (core) return core;

  const factionIntro = factionIntroMoment(context);
  if (factionIntro) return factionIntro;

  const system = systemMoment(context);
  if (
    system?.key === 'system:settlement' ||
    system?.key === 'system:magic-discovery' ||
    system?.key === 'system:flying-discovery' ||
    system?.key === 'system:large-discovery' ||
    system?.key === 'system:hybrid-discovery' ||
    system?.key === 'system:enemy-fantasy-threat'
  ) {
    return system;
  }

  return (
    unitMoment(context) ??
    buildingMoment(context) ??
    system
  );
}

export function getTutorialCompletionKeys(
  tutorialKey: string,
  focus: TutorialFocusTarget | null
) {
  return focus?.kind === 'formation-unit'
    ? [tutorialKey, 'system:formation']
    : [tutorialKey];
}

export function shouldRequestChapterOneReview({
  activeFaction,
  activeView,
  lastBattleResultId,
  reviewPromptShown,
  tutorialActive
}: {
  activeFaction: FactionId;
  activeView: TutorialView;
  lastBattleResultId: string | null;
  reviewPromptShown: boolean;
  tutorialActive: boolean;
}) {
  return (
    activeFaction === 'human' &&
    activeView === 'kingdom' &&
    lastBattleResultId ===
      'ch1_reclaim_outpost_result' &&
    !reviewPromptShown &&
    !tutorialActive
  );
}

export function isCoreTutorialComplete(
  tutorialSeen: string[]
) {
  return CORE_TUTORIAL_KEYS.every(
    key => tutorialSeen.includes(key)
  );
}
