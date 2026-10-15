# Human campaign artwork depth — production pass 1

**Status: All seven Human chapters now have bundled mission illustrations, including five regional Blackstone scenes and its unique finale.** The generated Frostmarch source boards are only staging art, not in-game UI. Their picture areas were cropped into five clean 724×362 PNGs, with original caption bars excluded and no Frostwyrm, Frost Lord or unrelated boss introduced.

## Existing state and integration

- 70 fixed Human mission blueprints, seven chapters; Chapter 1 retains its six existing full-frame paintings.
- Human art direction: 36 named scene compositions (six Chapter 1, five per later chapter), with one unique boss composition planned per chapter.
- Every mission has a stable chapter/order scene mapping in src/game/humanCampaignArtDirection.ts.
- Both campaign cards and the late-mission detail screen now resolve images using src/ui/humanCampaignMissionArt.ts.
- Chapter 2 / Iron Hills has five shipped 724×362 PNGs registered with literal `require` paths.
- Chapter 3 / Frostmarch now has five 724×362 RGB PNGs (`frostmarch_pass`, `frostmarch_cavalry`, `frostmarch_forge`, `frostmarch_layered_host`, `frostmarch_frostgate_boss`), statically registered for all 11 missions. The final boss shows Frostgate fortress and defensive troops; the canon battle remains the Marshal / Layered Host encounter.
- Chapter 4 / Greywatch has five 724×362 RGB PNGs (`greywatch_marches`, `greywatch_war_camp`, `greywatch_broken_ground`, `greywatch_breach`, `greywatch_siege_boss`), registered for all 11 missions; the Siege of Greywatch finale remains the existing Pretender General encounter.
- Chapter 7 / Blackstone has five bundled 724×362 RGB PNGs (`blackstone_stone_road`, `blackstone_siege_lines`, `blackstone_tower_war`, `blackstone_breached_city`, `blackstone_final_boss`), registered across all 11 missions. The final battle stays the existing Fall of Blackstone encounter; generated UI text and invented enemy names were removed from the cropped art.

- Chapter 5 / Crownroad now has five bundled 724×362 RGB PNGs, statically wired to the existing 11 missions including their unique battle finale. Artwork is cropped from the AI-generated Crownroad scene board; story titles, captions and UI framing are excluded. No new boss lore has been introduced.

- Chapter 6 / Glass Keep has five bundled 724×362 RGB PNGs (`glass_keep_strange_fire`, `glass_keep_wardfield`, `glass_keep_arcanists`, `glass_keep_silent_ground`, `glass_keep_siege_boss`) with static registrations for all 11 missions. The finale remains the existing Arcane General / warded fortress encounter; lettering and unrelated generated boss names were cropped out of the scene images.

## Art approval bar

Generate one image per scene, not a UI poster or sprite sheet. Match the sharp, painterly-clustered fantasy pixel-art style of the existing six PNGs. Recommended format: 2:1 opaque RGB landscape, ~724×362 pixels or an integer multiple. No text, logos, UI, frame, watermarks, or blurry painted textures. Strong simple foreground silhouettes should be recognizable at an 84–104-point campaign card crop. Keep key details away from the top-right corner (region badge) and bottom-left corner (mission icon).

Keep the same blue-and-gold Human identity, but strongly differentiate the chapter environments: Iron Hills (slate/iron), Frostmarch (winter ice), Greywatch (war-scarred fortifications), Crownroad (royal highways), Glass Keep (restrained violet arcane damage), Blackstone (ember-dark siege). Bosses should have distinctive environments and a readable named commander/fortress threat; no generic reusable boss painting.

Every new asset should be visually reviewed, compressed to roughly <800KB if possible, and confirmed on Android. Register each with a literal require in src/ui/humanCampaignMissionArt.ts, so Metro can bundle it. Do not use a dynamic path. Run campaign-art:check, typecheck, existing art and UI regressions, and check actual theme/light/dark screenshots.

## Asset production sequence

1. **Chapter 2 / Iron Hills:** Iron Hills Muster, Tools of War smithy, Riders on the Road, Iron Line shieldwall, unique Iron Provost boss fortress.
2. **Chapter 3 / Frostmarch:** snowy pass, cavalry flank, winter smithy, layered host battlefield, unique Frostgate boss.
3. **Chapter 4 / Greywatch:** long front, war camp, broken ground, outer breach, unique Greywatch siege boss.
4. **Chapter 5 / Crownroad (shipped):** royal causeway, six-banner muster, flying assault, combined-arms field, unique Crownroad boss.
5. **Chapter 6 / Glass Keep (shipped):** spellfire field, wardfield, Human arcanist camp, silent crystal ground, unique Glass Keep boss.
6. **Chapter 7 / Blackstone:** stone road, siege preparations, tower duel, breached city, unique Blackstone final boss.

Per-mission art directions, scene IDs, and scene assignments are part of the typed art direction source. The fallback registry allows incremental release without missing-asset build failures.

## What this pass does not do

Chapters 1–6 have their chapter mission-card illustration sets bundled; only Chapter 7 / Blackstone remains to be illustrated. Combat, saves, rewards, chapter unlocks and squad progression are unchanged. Generated board source files, art previews and transfer archives are not bundled into the app. Android screenshot review is still required before claiming device-level validation.

## Human artwork pass completed

All 70 Human mission slots resolve to chapter-appropriate packaged illustration art. This provides 36 illustration compositions in total: six existing Chapter 1 artworks and five each for Chapters 2–7. The seven finale slots use their own chapter-specific artwork. All scenes are static Metro `require` registrations, not remote images; production PNG integrity is enforced by `npm run art:check` and per-chapter mapping by `npm run campaign-art:check`.

The work remains **mission-list/detail artwork only**, not a new battlefield backdrop or settlement visual pass. Rendering, game state, economy, rewards, save keys, story names, tutorial order and mission progression have not been changed.
