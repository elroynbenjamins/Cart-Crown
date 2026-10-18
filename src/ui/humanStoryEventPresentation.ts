import { humanCampaignSceneForMission } from '../game/humanCampaignArtDirection';

/**
 * Existing region paintings are contextual backdrops, not bespoke depictions
 * of a decision, its actors or its loot. No effect on choice/reward logic.
 */
export const humanStoryBeats = {
  commander_choice: { chapter: 1, order: 3, caption: 'Greenkeep · command muster', character: 'officer' },
  marked_raiders: { chapter: 1, order: 3, caption: 'Greenkeep · recovered military stores', character: 'officer' },
  refugee_camp: { chapter: 1, order: 6, caption: 'Greenkeep · displaced families on the road', character: 'refugee' },
  timber_claim: { chapter: 2, order: 7, caption: 'Iron Hills · wartime supply routes', character: 'delegate' },
  marcher_envoy: { chapter: 3, order: 1, caption: 'Frostmarch · the frontier approach', character: 'envoy' },
  rider_doctrine: { chapter: 3, order: 4, caption: 'Frostmarch · mounted scouts', character: 'officer' },
  divided_march: { chapter: 3, order: 10, caption: 'Frostmarch · cold-road depots', character: 'delegate' },
  forked_banner: { chapter: 4, order: 10, caption: 'Greywatch · routes to the siege', character: 'officer' },
  empty_throne: { chapter: 4, order: 6, caption: 'Greywatch · preparations for battle', character: 'officer' },
  broken_archives: { chapter: 5, order: 3, caption: 'Crownroad · the contested royal lands', character: 'archivist' },
  royal_ledger: { chapter: 5, order: 5, caption: 'Crownroad · Ashen Court evidence', character: 'ashen' },
  grand_council: { chapter: 6, order: 1, caption: 'Glass Keep front · grand campaign', character: 'delegate' },
  concord_vault: { chapter: 6, order: 3, caption: 'Glass Keep front · recovered Concord records', character: 'archivist' },
  forced_beacon: { chapter: 6, order: 5, caption: 'Glass Keep front · the final objective', character: 'ashen' }
} as const;

export type HumanStoryBeat = keyof typeof humanStoryBeats;

export function humanStoryBeatArtwork(beat: HumanStoryBeat) {
  const def = humanStoryBeats[beat];
  const scene = humanCampaignSceneForMission(def.chapter, def.order);
  return scene ? { ...def, sceneId: scene.id, region: scene.location } : null;
}
