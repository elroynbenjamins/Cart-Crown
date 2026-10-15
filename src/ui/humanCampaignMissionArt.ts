import type { ImageSourcePropType } from 'react-native';
import {
  humanCampaignSceneForMission,
  humanCampaignSceneForNode
} from '../game/humanCampaignArtDirection';
import type { HumanCampaignFallbackArt, HumanCampaignScene } from '../game/humanCampaignArtDirection';

/**
 * Local, synchronous sources only: dynamic require(path) is not supported by
 * Metro. The six original Chapter 1 paintings are deliberately preserved.
 *
 * As art is approved, add one static require keyed by the scene's stable ID.
 * The resolver will immediately prefer it for every assigned mission, while
 * the fallback keeps partially shipped art packs safe on Android.
 */
const packagedOriginals: Record<string, ImageSourcePropType> = {
  greenkeep_banner: require('../../assets/campaign/missions/mission_01_frontier_watch.png'),
  greenkeep_crossing: require('../../assets/campaign/missions/mission_02_hold_the_crossing.png'),
  greenkeep_barracks: require('../../assets/campaign/missions/mission_03_build_the_outpost.png'),
  greenkeep_ambush: require('../../assets/campaign/missions/mission_06_ambush_in_the_pines.png'),
  greenkeep_road: require('../../assets/campaign/missions/mission_04_guard_the_wagon.png'),
  greenkeep_outpost_boss: require('../../assets/campaign/missions/mission_05_defend_the_village.png')
};

const fallbacks: Record<HumanCampaignFallbackArt, ImageSourcePropType> = {
  frontier: require('../../assets/campaign/missions/mission_01_frontier_watch.png'),
  crossing: require('../../assets/campaign/missions/mission_02_hold_the_crossing.png'),
  construction: require('../../assets/campaign/missions/mission_03_build_the_outpost.png'),
  wagon: require('../../assets/campaign/missions/mission_04_guard_the_wagon.png'),
  defense: require('../../assets/campaign/missions/mission_05_defend_the_village.png'),
  ambush: require('../../assets/campaign/missions/mission_06_ambush_in_the_pines.png')
};

export type HumanCampaignArtwork = {
  scene: HumanCampaignScene | null;
  source: ImageSourcePropType;
  /** False means an older painting is displayed until new art has shipped. */
  originalSceneArt: boolean;
};

function resolve(scene: HumanCampaignScene | null): HumanCampaignArtwork {
  if (!scene) {
    return { scene: null, source: fallbacks.frontier, originalSceneArt: false };
  }
  const source = packagedOriginals[scene.id];
  return {
    scene,
    source: source ?? fallbacks[scene.fallback],
    originalSceneArt: Boolean(source)
  };
}

export function humanCampaignArtworkForMission(
  chapter: number, chapterOrder: number
): HumanCampaignArtwork {
  return resolve(humanCampaignSceneForMission(chapter, chapterOrder));
}

export function humanCampaignArtworkForNode(
  chapter: number, nodeId: string
): HumanCampaignArtwork {
  return resolve(humanCampaignSceneForNode(chapter, nodeId));
}
