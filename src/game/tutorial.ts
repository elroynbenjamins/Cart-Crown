import type {
  BuildingDefinition,
  FactionId,
  NavId,
  UnitDefinition
} from './types';

export type TutorialView =
  | NavId
  | 'battlePrep'
  | 'battle'
  | 'results'
  | 'settlement'
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

export type TutorialMoment = {
  key: string;
  kind: 'core' | 'system' | 'unit' | 'building';
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  target: TutorialTarget;
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
  'system:side-modes'
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
      primaryLabel: 'Open Campaign',
      target: 'campaign'
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
      primaryLabel: 'I understand',
      target: 'none'
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
      primaryLabel: 'Review the battlefield',
      target: 'none'
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
      primaryLabel: 'View Results',
      target: 'none'
    };
  }

  return null;
}

function unitMoment(
  context: TutorialContext
): TutorialMoment | null {
  if (!seen(context, 'core:results')) return null;
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
    primaryLabel: 'Open Formation',
    target: 'formation'
  };
}

function buildingMoment(
  context: TutorialContext
): TutorialMoment | null {
  if (!seen(context, 'core:results')) return null;
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
    primaryLabel: 'Open Settlement',
    target: 'settlement'
  };
}

function systemMoment(
  context: TutorialContext
): TutorialMoment | null {
  if (!seen(context, 'core:results')) return null;

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
      primaryLabel: 'Open Settlement',
      target: 'settlement'
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
      primaryLabel: 'Arrange my squads',
      target: 'none'
    };
  }

  if (
    context.forgeUnlocked &&
    context.forgeLevel > 0 &&
    ['kingdom', 'army'].includes(context.view) &&
    !seen(context, 'system:forge')
  ) {
    return {
      key: 'system:forge',
      kind: 'system',
      eyebrow: 'SYSTEM UNLOCKED',
      title: 'Equipment changes progression',
      body:
        'The Forge creates real equipment for individual squads. Weapons, armor, shields and mounts improve combat stats, and some class branches require specific gear combinations rather than only higher levels.',
      primaryLabel: 'Open Forge',
      target: 'forge'
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
    context.armyReadiness < 100 &&
    ['kingdom', 'battlePrep'].includes(context.view) &&
    !seen(context, 'system:readiness')
  ) {
    return {
      key: 'system:readiness',
      kind: 'system',
      eyebrow: 'ARMY CONDITION',
      title: 'Readiness carries between battles',
      body:
        'Damage creates campaign wear. At 70–100% Readiness there is no combat penalty, so you should not resupply after every normal win. Below 70%, fatigue starts reducing effective HP, attack and speed. Rest & Resupply uses provisions to restore the army.',
      primaryLabel: 'Got it',
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
      primaryLabel: 'Understood',
      target: 'none'
    };
  }

  if (
    (stageRank[context.wagonStageId] ?? 0) >= 2 &&
    ['formation', 'battlePrep'].includes(context.view) &&
    !seen(context, 'system:advanced-formations')
  ) {
    return {
      key: 'system:advanced-formations',
      kind: 'system',
      eyebrow: 'TACTICAL SYSTEM',
      title: 'Formation shapes have counters',
      body:
        'Fort-tier armies unlock specialized shapes such as wide fronts and protected rear lines. No shape is simply best: enemy geometry can create an edge or expose a weakness. Save useful setups as loadouts so you can switch quickly in Battle Prep.',
      primaryLabel: 'Open Formation',
      target: 'formation'
    };
  }

  if (
    (stageRank[context.wagonStageId] ?? 0) >= 2 &&
    context.view === 'campaign' &&
    !seen(context, 'system:side-modes')
  ) {
    return {
      key: 'system:side-modes',
      kind: 'system',
      eyebrow: 'OPTIONAL ACTIVITIES',
      title: 'Recovery content is now available',
      body:
        'Expeditions, Formation Trials and Kingdom Defense provide extra resources or tactical practice when you want them. They are useful recovery tools, but normal campaign progress is balanced so they should not become mandatory farming.',
      primaryLabel: 'Got it',
      target: 'none'
    };
  }

  return null;
}

export function getNextTutorialMoment(
  context: TutorialContext
): TutorialMoment | null {
  const core = coreMoment(context);
  if (core) return core;

  const system = systemMoment(context);
  if (system?.key === 'system:settlement') {
    return system;
  }

  return (
    unitMoment(context) ??
    buildingMoment(context) ??
    system
  );
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
      'toll_captain_result' &&
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
