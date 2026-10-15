/**
 * Art-direction source of truth for the 70-mission Human campaign.
 *
 * Important: a scene slot is NOT proof that its bespoke PNG has shipped.
 * All unfulfilled slots use an existing, packaged fallback until an approved
 * pixel illustration is committed and statically registered in the UI module.
 *
 * This table intentionally uses stable chapter + mission order, not fuzzy
 * mission-name matching: titles may change without silently moving artwork.
 */
export type HumanCampaignChapter = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type HumanCampaignFallbackArt =
  | 'frontier' | 'crossing' | 'construction' | 'wagon' | 'defense' | 'ambush';

export type HumanCampaignScene = {
  id: string;
  title: string;
  location: string;
  direction: string;
  fallback: HumanCampaignFallbackArt;
  boss: boolean;
};

export type HumanCampaignSceneSet = {
  region: string;
  scenes: readonly [
    HumanCampaignScene, HumanCampaignScene, HumanCampaignScene,
    HumanCampaignScene, HumanCampaignScene
  ];
  /** Explicit scene slot for every mission in the chapter (zero-based). */
  missionScenes: readonly number[];
};

const scene = (
  id: string, title: string, location: string, direction: string,
  fallback: HumanCampaignFallbackArt, boss = false
): HumanCampaignScene => ({ id, title, location, direction, fallback, boss });

export const humanCampaignSceneSets: Record<HumanCampaignChapter, HumanCampaignSceneSet> = {
  1: {
    region: 'Greenkeep',
    scenes: [
      scene('greenkeep_banner', 'The Last Banner', 'Greenkeep frontier camp', 'Underequipped survivors, a blue lion banner and a remote wooden watchtower at first light.', 'frontier'),
      scene('greenkeep_crossing', 'Hold the Crossing', 'River bridge', 'Cold running water, defended wooden crossing, blue shields against encroaching raiders.', 'crossing'),
      scene('greenkeep_barracks', 'Barracks Rebuilt', 'Restored outpost', 'Carpenters, half-built palisade and practical training yard; one hopeful repaired banner.', 'construction'),
      scene('greenkeep_road', 'Broken Road', 'Pine road and wagon track', 'A battered supply cart and watchful woods; limited visibility and raider silhouettes.', 'ambush'),
      scene('greenkeep_outpost_boss', 'Reclaim the Outpost', 'Raider-held gate', 'Unique finale artwork: charred timber gate, disciplined enemy rear line and captain silhouette.', 'defense', true)
    ],
    missionScenes: [0, 1, 2, 0, 3, 3, 4]
  },
  2: {
    region: 'Iron Hills',
    scenes: [
      scene('iron_hills_muster', 'Iron Hills Muster', 'Fort muster', 'Blue bannered soldiers arriving at rugged hill fort and crowded supply tents.', 'construction'),
      scene('iron_hills_smithy', 'Tools of War', 'Roadside ore works', 'Iron ore, timber braces, bright forge glow and cramped mountain workshop.', 'construction'),
      scene('iron_hills_road', 'Riders on the Road', 'Winding iron road', 'Riders approach through steep slate cliffs and a narrow highland track.', 'wagon'),
      scene('iron_hills_iron_line', 'The Iron Line', 'Shieldwall valley', 'Packed iron shields and a strong defended rear rank at a windswept hill pass.', 'crossing'),
      scene('iron_hills_provost_boss', 'Break Their Hold', 'Provost fortress', 'Unique boss: the Iron Provost and his disciplined guard outside an oppressive fortified keep.', 'defense', true)
    ],
    missionScenes: [0, 1, 2, 2, 2, 3, 1, 4]
  },
  3: {
    region: 'Frostmarch',
    scenes: [
      scene('frostmarch_pass', 'Into Frostmarch', 'Snowy frontier pass', 'Pine-clad mountains and a narrow snow road, weary standards under storm clouds.', 'wagon'),
      scene('frostmarch_cavalry', 'Hooves in the Snow', 'Ice-covered plain', 'Mounted scouts emerging from snowfall into a broad flank with visible hoof trails.', 'ambush'),
      scene('frostmarch_forge', 'Frozen Steel', 'Marcher smithy', 'Blue-grey winter fort and heated smithing tent near stacks of cold metal.', 'construction'),
      scene('frostmarch_layered_host', 'The Layered Host', 'Frozen battlefield', 'Three tiers of enemy shields and reserve banners staggered through falling snow.', 'crossing'),
      scene('frostmarch_frostgate_boss', 'Battle for Frostgate', 'Frostgate citadel', 'Unique boss: icy fortress bridge, Marshal standards and disciplined layered army.', 'defense', true)
    ],
    missionScenes: [0, 0, 2, 1, 1, 3, 3, 1, 3, 0, 4]
  },
  4: {
    region: 'Greywatch',
    scenes: [
      scene('greywatch_marches', 'The Long Front', 'Rolling border marches', 'Wide grey-green terrain and a stretched line of blue banners under threatening weather.', 'frontier'),
      scene('greywatch_war_camp', 'Raise Another Banner', 'Advanced siege camp', 'Five standards, repair wagons, wounded tents and veteran sentries beneath a stone wall.', 'construction'),
      scene('greywatch_broken_ground', 'Broken Ground', 'Broken rocky ravine', 'Uneven, fractured ground allowing rear ambushers and countercharges to flank the main army.', 'ambush'),
      scene('greywatch_breach', 'Hold the Breach', 'Outer curtain wall', 'A breached stronghold gate, battered defenses and heavily armoured enemy guards.', 'defense'),
      scene('greywatch_siege_boss', 'Siege of Greywatch', 'Greywatch fortress', 'Unique boss: tall smoke-scarred battlements, siege engines and the Pretender General.', 'defense', true)
    ],
    missionScenes: [0, 1, 1, 2, 3, 1, 2, 1, 2, 3, 4]
  },
  5: {
    region: 'Crownroad',
    scenes: [
      scene('crownroad_long_front', 'Too Many Fronts', 'Royal road plain', 'Expansive grasslands cut by a paved road, advancing blocks of six-squad armies.', 'wagon'),
      scene('crownroad_six_banners', 'The Sixth Banner', 'Royal army muster', 'Six blue standards around a full-scale army encampment at a golden hour.', 'frontier'),
      scene('crownroad_sky_threat', 'Above the Shieldwall', 'Windy uplands', 'Flying enemies silhouetted above a defensive shieldwall; clear aerial danger.', 'ambush'),
      scene('crownroad_layered_war', 'Three Lines Deep', 'Open combined-arms field', 'Heavy center, mounted wing and exposed rear units across multiple battle lines.', 'crossing'),
      scene('crownroad_battle_boss', 'Battle for the Crownroad', 'Royal causeway', 'Unique boss: six banners facing the royal host with cavalry, aerial silhouettes and elite guard.', 'defense', true)
    ],
    missionScenes: [0, 1, 3, 2, 1, 1, 3, 2, 3, 0, 4]
  },
  6: {
    region: 'Glass Keep',
    scenes: [
      scene('glass_keep_strange_fire', 'Strange Fire', 'Burned arcane plain', 'Dark ground scarred by violet spellfire, with restrained dangerous magical light.', 'ambush'),
      scene('glass_keep_wardfield', 'The First Ward', 'Warded ruins', 'Ancient ward stones in a ruined patrol road shelter a protected infantry line.', 'crossing'),
      scene('glass_keep_arcanists', 'Paths of the Arcane', 'Makeshift spell camp', 'Human arcanists study scrolls around blue ward-light in a guarded field camp.', 'construction'),
      scene('glass_keep_silent_ground', 'The Silent Ground', 'Suppressed crystal fields', 'Shattered glass formations and deadened magic marks under purple storm clouds.', 'frontier'),
      scene('glass_keep_siege_boss', 'Siege of the Glass Keep', 'Glass Keep arcane fortress', 'Unique boss: glittering ward pillars, siege formation and Arcane General above the gates.', 'defense', true)
    ],
    missionScenes: [0, 1, 2, 0, 1, 2, 0, 3, 1, 3, 4]
  },
  7: {
    region: 'Blackstone',
    scenes: [
      scene('blackstone_stone_road', 'The Stone Road', 'Fortress approach', 'Lava-red dusk on the last steep road to a brutal black stone fortress.', 'wagon'),
      scene('blackstone_siege_lines', 'Break the Gate', 'Siege trenches', 'Defended gates, blue siege cranes and hostile wall engines in layered earthworks.', 'construction'),
      scene('blackstone_tower_war', 'Under Their Towers', 'The outer curtain', 'Tower engines casting heavy shadows across a formation protecting its engineers.', 'defense'),
      scene('blackstone_breached_city', 'The Breached City', 'Blackstone streets', 'Collapsed inner wards and monumental dark stone alleys threaded with blue standards.', 'ambush'),
      scene('blackstone_final_boss', 'Fall of Blackstone', 'Blackstone throne gate', 'Unique final boss: vast breached black citadel, the enemy command and six allied banners.', 'defense', true)
    ],
    missionScenes: [0, 1, 1, 2, 2, 2, 0, 0, 1, 3, 4]
  }
};

/** The game's fixed Human campaign has exactly 70 missions across 7 chapters. */
export const humanCampaignMissionCounts: Record<HumanCampaignChapter, number> = {
  1: 7, 2: 8, 3: 11, 4: 11, 5: 11, 6: 11, 7: 11
};

export function humanCampaignSceneForMission(chapter: number, chapterOrder: number): HumanCampaignScene | null {
  const definition = humanCampaignSceneSets[chapter as HumanCampaignChapter];
  if (!definition || !Number.isInteger(chapterOrder)) return null;
  const index = definition.missionScenes[chapterOrder - 1];
  return index === undefined ? null : definition.scenes[index] ?? null;
}

/** Fail closed if a node ID is not of the expected Human chapter form. */
export function humanCampaignSceneForNode(chapter: number, nodeId: string): HumanCampaignScene | null {
  const match = chapter === 1
    ? /^node_(\d+)$/.exec(nodeId)
    : /^ch([2-7])_node_(\d+)$/.exec(nodeId);
  if (!match) return null;
  if (chapter > 1 && Number(match[1]) !== chapter) return null;
  return humanCampaignSceneForMission(chapter, Number(match[chapter === 1 ? 1 : 2]));
}
