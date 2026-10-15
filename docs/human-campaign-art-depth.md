# Human campaign artwork depth — production pass 1

**Status: Chapter 2 Iron Hills artwork shipped for Campaign mission cards; Chapters 3–7 remain on fallbacks.** Five separate Iron Hills environment crops have been cleaned of poster titles/borders and packaged locally. The two earlier concept boards that did not match the final seven-chapter lore were not bundled.

## Existing state and integration

- 70 fixed Human mission blueprints, seven chapters; Chapter 1 retains its six existing full-frame paintings.
- Human art direction: 36 named scene compositions (six Chapter 1, five per later chapter), with one unique boss composition planned per chapter.
- Every mission has a stable chapter/order scene mapping in src/game/humanCampaignArtDirection.ts.
- Both campaign cards and the late-mission detail screen now resolve images using src/ui/humanCampaignMissionArt.ts.
- Chapter 2 now uses five distinct **144×72 optimized JPEG mission-card images** (muster, smithy, road, defensive line and unique fortress boss composition). These are intentionally small thumbnails for 84–104pt Campaign cards. The separate full-resolution 724×362 PNG cuts remain part of the generation pack, not the APK. Chapters 3–7 still display Chapter 1 fallbacks until their new art ships.

## Art approval bar

Generate one image per scene, not a UI poster or sprite sheet. Match the sharp, painterly-clustered fantasy pixel-art style of the existing six PNGs. Recommended format: 2:1 opaque RGB landscape, ~724×362 pixels or an integer multiple. No text, logos, UI, frame, watermarks, or blurry painted textures. Strong simple foreground silhouettes should be recognizable at an 84–104-point campaign card crop. Keep key details away from the top-right corner (region badge) and bottom-left corner (mission icon).

Keep the same blue-and-gold Human identity, but strongly differentiate the chapter environments: Iron Hills (slate/iron), Frostmarch (winter ice), Greywatch (war-scarred fortifications), Crownroad (royal highways), Glass Keep (restrained violet arcane damage), Blackstone (ember-dark siege). Bosses should have distinctive environments and a readable named commander/fortress threat; no generic reusable boss painting.

Every new asset should be visually reviewed, compressed to roughly <800KB if possible, and confirmed on Android. Register each with a literal require in src/ui/humanCampaignMissionArt.ts, so Metro can bundle it. Do not use a dynamic path. Run campaign-art:check, typecheck, existing art and UI regressions, and check actual theme/light/dark screenshots.

## Asset production sequence

1. **Chapter 2 / Iron Hills — complete for Campaign thumbnails:** Iron Hills Muster, Tools of War smithy, Riders on the Road, Iron Line shieldwall, unique Iron Provost boss fortress. Before exposing these illustrations on large screens, use the separately provided full-resolution PNG variants rather than stretching card thumbnails.
2. **Chapter 3 / Frostmarch:** snowy pass, cavalry flank, winter smithy, layered host battlefield, unique Frostgate boss.
3. **Chapter 4 / Greywatch:** long front, war camp, broken ground, outer breach, unique Greywatch siege boss.
4. **Chapter 5 / Crownroad:** royal causeway, six-banner muster, flying assault, combined-arms field, unique Crownroad boss.
5. **Chapter 6 / Glass Keep:** spellfire field, wardfield, Human arcanist camp, silent crystal ground, unique Glass Keep boss.
6. **Chapter 7 / Blackstone:** stone road, siege preparations, tower duel, breached city, unique Blackstone final boss.

Per-mission art directions, scene IDs, and scene assignments are part of the typed art direction source. The fallback registry allows incremental release without missing-asset build failures.

## What this pass does not do

It introduces five dedicated Chapter 2 Campaign-thumbnail assets, but does not yet bundle large-format Chapter 2 illustrations or introduce new artwork for Chapters 3–7. It does not change combat gameplay or saves. The new regression verifies each JPEG exists and is statically required; visual fidelity and Android screenshots still require direct inspection. The Iron Provost picture is a unique fortress composition, not a guaranteed illustrated portrait of the named commander.
