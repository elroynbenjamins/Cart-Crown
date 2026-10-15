# Human campaign artwork depth — production pass 1

**Status: Chapters 1–4 have bundled mission illustrations; Chapter 4 is in integration/validation.** The generated Frostmarch source boards are only staging art, not in-game UI. Their picture areas were cropped into five clean 724×362 PNGs, with original caption bars excluded and no Frostwyrm, Frost Lord or unrelated boss introduced.

## Existing state and integration

- 70 fixed Human mission blueprints, seven chapters; Chapter 1 retains its six existing full-frame paintings.
- Human art direction: 36 named scene compositions (six Chapter 1, five per later chapter), with one unique boss composition planned per chapter.
- Every mission has a stable chapter/order scene mapping in src/game/humanCampaignArtDirection.ts.
- Both campaign cards and the late-mission detail screen now resolve images using src/ui/humanCampaignMissionArt.ts.
- Chapter 2 / Iron Hills has five shipped 724×362 PNGs registered with literal `require` paths.
- Chapter 3 / Frostmarch now has five 724×362 RGB PNGs (`frostmarch_pass`, `frostmarch_cavalry`, `frostmarch_forge`, `frostmarch_layered_host`, `frostmarch_frostgate_boss`), statically registered for all 11 missions. The final boss shows Frostgate fortress and defensive troops; the canon battle remains the Marshal / Layered Host encounter.
- Chapter 4 / Greywatch has five 724×362 RGB PNGs (`greywatch_marches`, `greywatch_war_camp`, `greywatch_broken_ground`, `greywatch_breach`, `greywatch_siege_boss`), registered for all 11 missions; the Siege of Greywatch finale remains the existing Pretender General encounter.
- Chapters 5–7 still display temporary Chapter 1 fallbacks until their own illustrations are produced.

## Art approval bar

Generate one image per scene, not a UI poster or sprite sheet. Match the sharp, painterly-clustered fantasy pixel-art style of the existing six PNGs. Recommended format: 2:1 opaque RGB landscape, ~724×362 pixels or an integer multiple. No text, logos, UI, frame, watermarks, or blurry painted textures. Strong simple foreground silhouettes should be recognizable at an 84–104-point campaign card crop. Keep key details away from the top-right corner (region badge) and bottom-left corner (mission icon).

Keep the same blue-and-gold Human identity, but strongly differentiate the chapter environments: Iron Hills (slate/iron), Frostmarch (winter ice), Greywatch (war-scarred fortifications), Crownroad (royal highways), Glass Keep (restrained violet arcane damage), Blackstone (ember-dark siege). Bosses should have distinctive environments and a readable named commander/fortress threat; no generic reusable boss painting.

Every new asset should be visually reviewed, compressed to roughly <800KB if possible, and confirmed on Android. Register each with a literal require in src/ui/humanCampaignMissionArt.ts, so Metro can bundle it. Do not use a dynamic path. Run campaign-art:check, typecheck, existing art and UI regressions, and check actual theme/light/dark screenshots.

## Asset production sequence

1. **Chapter 2 / Iron Hills:** Iron Hills Muster, Tools of War smithy, Riders on the Road, Iron Line shieldwall, unique Iron Provost boss fortress.
2. **Chapter 3 / Frostmarch:** snowy pass, cavalry flank, winter smithy, layered host battlefield, unique Frostgate boss.
3. **Chapter 4 / Greywatch:** long front, war camp, broken ground, outer breach, unique Greywatch siege boss.
4. **Chapter 5 / Crownroad:** royal causeway, six-banner muster, flying assault, combined-arms field, unique Crownroad boss.
5. **Chapter 6 / Glass Keep:** spellfire field, wardfield, Human arcanist camp, silent crystal ground, unique Glass Keep boss.
6. **Chapter 7 / Blackstone:** stone road, siege preparations, tower duel, breached city, unique Blackstone final boss.

Per-mission art directions, scene IDs, and scene assignments are part of the typed art direction source. The fallback registry allows incremental release without missing-asset build failures.

## What this pass does not do

Chapter 2 and Chapter 3 are now art-complete for the campaign mission cards; Chapters 4–7 remain to be illustrated. Combat, saves, rewards, chapter unlocks and squad progression are unchanged. Generated board source files, art previews and transfer archives are not bundled into the app. Android screenshot review is still required before claiming device-level validation.
