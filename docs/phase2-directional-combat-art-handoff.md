# Phase 2 — Directional Battle Sprite Production & Acceptance Handoff

**Scope:** Cart & Crown / Backpack Kingdoms, portrait battle renderer `src/ui/portraitBattle/PortraitBattleView.tsx`.
**State at 2026-10-22:** Stage geometry, facing indicators, damage-linked effects, integrity feedback and additional signature-boss silhouettes are implemented on PR #201. **Dedicated directional PNG sprite poses are NOT yet integrated.** The stage-only opt-in selection and image fallback code are wired, but no directional sprites are registered until approved. The generated battle illustration is a concept/reference, not proof of in-game artwork.

## Camera and facing contract

The production battle is **vertical**. Enemies occupy the upper half and allied squads the lower half. **Do not use horizontal, left-vs-right sprite-sheet poses as if they faced the actual opponent.**

- Allied **battle-stage** figures: back/over-shoulder or three-quarter-back, visually aimed **up the screen** toward the enemy front. No portrait card changes.
- Enemy battle-stage figures: front or three-quarter-front, visually aimed **down the screen** toward the allied front.
- Match existing Human illustration quality, lighting, silhouette/material proportions and class equipment. Do not horizontal-flip asymmetrical shields, heraldry, archer bows, hand grips or mounted gear.
- Each class must retain its own equipment, not borrow a generic image with an incorrect weapon. The current Human `humanArt.ts` mapping is the authority on **existing portraits**; never replace those mappings to approximate a different class.
- Keep actual 3×3 authored slot geometry and row depth from `portraitBattle/model.ts`. Never change `stageTokens` to fit new art.

## Deliverables and safe integration order

Create a **small Human pilot** of four pairs before producing the remaining classes:
1. Shield infantry: rear-facing blue/gold shield wall and hostile front-facing red/iron shield infantry.
2. Ranger or crossbowman: clearly held/aimed ranged weapon, blue/gold rear and hostile red front.
3. Heavy cavalry: complete believable mounted silhouette (horse, rider, lance), correct foe-facing; reserve mount headroom.
4. Field Medic or Field Chaplain: unmistakable cloth/staff/support silhouette, no mistaken blade or bow.

For a production PNG:
- Transparent 256×256 RGBA with no baked labels, HP bars, frames, shadows or typography.
- Clear feet/hoof ground anchor, centered x, consistent baseline y across poses.
- Consistent pixel density/nearest-neighbour master; keep enough transparency at top for lance/standard.
- Provide two documented versions per pilot class: `ally_back` and `enemy_front` (do not assume mirroring).
- Preview at **32, 42, 56 and 72 display pixels** in a real battle; weapons, mount, role and faction must remain identifiable at 32/42.
- Build asset registry entries using **literal Metro requires**, never dynamic template requires; ensure all files load offline.
- Run `npm run directional-art:check`. It deliberately passes with no new art and keeps approved fallbacks; once `assets/game/battle_directional/human` exists, it requires exactly four complete paired poses, reviewed orientation/equipment notes, explicit signoff and matching static Metro registry entries.
- Do not label an experimental sheet as production-ready merely because a PNG passes alpha/geometry checks; inspect at 32/42 px, compare against current high-quality Ranger/Spearman, then set `approvedForRuntime` with a human-reviewed manifest.
- Prefer new battle-stage assets only; portrait rails, Army cards, equipment and existing strong Ranger/Spearman art stay intact.
- Only opt a class into the new asset if it passes the above checks; others retain existing sprites. Avoid an all-or-nothing replacement.

## Boss artwork acceptance

The seven **Human campaign boss** encounter IDs are:
`toll_captain`, `ch2_riders_banner`, `iron_provost`, `lord_marshal_veyr`, `pretender_general`, `gate_of_crownspire`, `return_to_crownspire`.

PR #201 gives these unique encounter-specific heraldry and stage-silhouette **extensions** via `bossPresentation.ts` and `BossStageSilhouette.tsx`; this is a temporary legibility layer, **not a claim that seven bespoke boss characters have been painted**.

Paint distinct hero-size frontal boss sprites and a portrait per named Human boss: toll-gate captain, mounted standard bearer, dense iron provost, frost marshal, false general, ashen gate commander and regent. Retain authentic enemy fantasy IDs and fallback sprites until each bespoke asset passes Android render and baseline screenshot review.

## Real-event-only feedback contract

- `BattleScreen.tsx` owns shared army HP, `partyIntegrity`/`enemyIntegrity`, roles, active slots, damage, order and pause state; presentation **only** reads these values.
- Never assign fake per-unit HP, kills, crits or breaks to an actor.
- Only display a ranged/cavalry attack trace if an active ally, target, matching role and **actual positive outgoing damage** exist.
- The existing attack/impact pulse travels `0 → 1 → 0`. Do not directly animate projectile position from this value, or it visually returns to the shooter. A short pulse-driven source-to-target **line of fire** is safe; a one-way arrow animation would need its own explicitly supervised exchange-driven progress.
- Display `breaking`/`breached` formation indicators from real combat states, not inferred from sprite losses.
- Reduced-motion, manual pause, tutorial pause, Android background and 2× speed must not leave moving effects or obscure touch targets.
- Render named boss overlays only for `difficulty === 'Boss'` AND a real boss actor which is not routed.

## QA and release gate

1. `npm run typecheck`
2. `npm run boss:check`
3. `npx --no-install tsx scripts/portrait-battle-regression.ts`
4. `npm run battle-visuals:check`
5. `npx --no-install tsx scripts/illustrated-battlefield-regression.ts`
6. Native release QA: Android 320, 360 and 412 logical width; light/dark themes; Human chapter 1/3/7, ordinary/elite/boss encounters, one or two to six active squads, formations Forward Line/Iron Wall/Layered Core.
7. At 1× and 2× speed, pause/resume/background/re-enter and defeat/victory, check **zero backward-flying projectiles, no silhouette overlap/slot drift**, one-shot rewards and stable memory/frame pacing.

**Do not merge synthetic concept art into `assets/game` solely because it exists.** The next actual art PR should add verified, cropped, transparent, game-appropriate PNGs and the exact static require registry.


## Implementation checkpoint — 2026-10-22, class-specific stage pipeline

- `src/ui/portraitBattle/directionalStageModel.ts` selects **only exact** Human class/role pairs: Shield Infantry/frontline, Ranger/ranged, Heavy Cavalry/cavalry and Field Medic/support. It excludes fantasy tags and non-Human factions.
- Opposing art is restricted to exact matching ordinary Human enemy roles/labels in known profiles; the selector explicitly excludes bosses, magical enemies, crossbows borrowing Ranger bows, and sergeants borrowing Field Medic art. No generic role-to-picture substitution.
- `DirectionalStageFigure.tsx` consumes the static production registry, keeps the original sprite/portrait as fallback for missing or broken images, and never intercepts battlefield touches. It is mounted **only in actor slots** in `PortraitBattleView.tsx`; portrait rails and Army/Formation screens are untouched.
- CI now exercises exact selector whitelists, forbidden substitutions, native-image load failure fallback, and the existing production PNG and manifest gate via `npm run directional-art:check`.
- **No runtime directional PNGs have been approved or registered yet.** Multiple generated concept sheets depicted horizontal/side-facing figures and are not suitable for the game's top-vs-bottom stage. Transparent crop references are available in the conversation as `phase2_human_directional_reference_pack.zip`; their manifest explicitly says *candidate_reference_only*, not `approvedForRuntime`. Do not copy them into `assets/game/battle_directional/human` or set approval true.

### Activation sequence after genuinely correct art is available

1. Artist supplies eight **new** 256×256 transparent RGBA sprites with actual **ally up/back** and **enemy down/front** camera poses, consistent baseline and matching approved Human quality. Review the 32/42/56 px screenshots, not just full-size crops.
2. Place exactly the eight documented filenames under `assets/game/battle_directional/human`, with one `manifest.json` listing `version: 1`, explicit review and `approvedForRuntime: true` **only after** actual human visual signoff.
3. Add eight literal keys to `productionAssetSources` with `require('../../assets/game/battle_directional/human/<filename>.png')`. Keys are `battle_directional.human.<filename-without-ext>`; `directionalStageModel.ts` already resolves exactly these IDs.
4. Run `npm run art:check`, `npm run directional-art:check`, portrait battlefield regression, `npm run typecheck`, and native Android screenshots at 320, 360 and 412 logical widths.
5. Review screenshots in compact Iron Wall / Layered Core and 2× battle speed before merging. No need to alter any combat calculations or portraits.

## 2026-10-22 next implementation checkpoint — transparent vertical pilot v2

An eight-sprite art-review pack has now been generated in-chat (four classes × ally back/up + enemy front/down), with 256×256 RGBA pixel PNGs and side-by-side 32/42/56/72 px previews. Unlike the earlier horizontal concept crops, these eight images have **correct vertical battle-facing direction**. The review ZIP includes Python/Pillow drawing source, a candidate manifest with approval disabled, and independent technical validation.

**Important:** The pixel art is an authored lightweight prototype, not an artist-approved match for the existing Human Ranger/Spearman quality. Mounted Cavalry still needs better horse/rider distinction. The pack has `approvedForRuntime: false`; images have NOT been placed in `assets/game/battle_directional/human` and must not silently replace stronger art.

The `DirectionalStageFigure` component now keeps the original approved actor **visible until the replacement PNG fires onLoad**. Image errors or missing registry entries safely revert to existing art. The expanded regression checks loading state, loaded-only swap, decode errors and tap passthrough.

**Next art acceptance gate:** review ZIP and comparison image in the conversation; rework weak mounted pose and improve material highlights while preserving vertical facing and correct equipment. Only after visual signoff, add approved PNGs to Metro's literal registry, mark the reviewed manifest and perform native screenshot QA.


## Approved Human combat art pack — 2026-10-27

**Owner approval:** The individually generated higher-detail 16-bit-style Human pixel units (NOT the earlier programmatically drawn Godot-like placeholders) are the new visual quality baseline for combat-stage units. Preserve the exact visual method for future classes: one isolated fully transparent character per generation; cohesive blue/gold Human allied back/three-quarter-back pose, red/black enemy front pose, precise class-appropriate equipment, hand-painted coherent pixel clusters, readable metallic and cloth textures, grounded boots/hooves, no interface or labels baked into sprites. Favor the approved individually generated sprites over full-sheet concept composites.

The latest **16-image** GitHub-ready archive is attached to the conversation as `Cart_Crown_Phase2_16_Human_Battle_Sprites_GitHub.zip`. This is an external conversation artifact, **not a binary GitHub commit**. The archive contains `assets/game/battle_directional/human` with 16 PNGs (256×256 RGBA) and `manifest.json`, plus an idempotent `scripts/apply_human_battle_assets.py` installer.

Eight supported class pairs: Shield Infantry, Ranger, Heavy Cavalry, Field Medic, Spearman, Crossbowman, Swordsman (Great Sword pose), Banner Captain. The revised `directionalStageModel.ts` now contains exact class/role mapping and safe opponent labels; mismatched/fantasy units keep existing artwork. User-approved red Spearman shaft correction is included in `spearman_enemy_front.png`, preserving the original red armor and pennant with a single straighter shaft.

**To activate without breaking CI:** extract the ZIP at repository root on PR #201 branch; run `python scripts/apply_human_battle_assets.py`; commit all 16 PNGs plus manifest and updated `src/ui/productionAssets.ts`. Alternately upload the 16 PNGs + manifest through GitHub then update registry before expecting CI to pass. Do not commit the ZIP instead of extracted files.

Technical QA done locally: 16 PNGs validated against 256×256 RGBA and alpha-occupancy bounds, all entry SHA256 hashes verified, installer checked for first-run and repeat-run idempotence, 32/42/56/72-pixel preview generated. Native on-device rendering and FPS still must be rechecked **after** binaries are in the GitHub branch.


## Activation confirmed — 2026-10-27

The project owner uploaded the **16 original 1254×1254 PNG masters** to `main` at
`assets/game/Cart_Crown_Phase2_Human_Original_Master_Artwork/`
(commit `ab77dbd455a654d52f5fb5fb57b6b2e6fa6010d0`).

GitHub Actions `materialize-human-battle-art.yml` deterministically rendered all 16
**approved 256×256 RGBA battle sprites** with Pillow 12.3.0, checked each output
against the original owner-approved SHA256 fingerprint (including the corrected
red Spearman), and committed the 16 PNGs, the reviewed manifest, and 16 literal
Metro `require` entries to this Phase 2 branch at
`assets/game/battle_directional/human/`.

`DirectionalStageFigure` now resolves those production assets for exactly
the eight Human class pairs defined in `directionalStageModel.ts`; existing
Army cards and character portraits are not replaced. Unmatched role/label,
non-Human factions, fantasy beasts and named bosses retain the established
battle art. Native figures remain visible until `Image.onLoad`, including
error fallback.

This section supersedes the earlier dated *unshipped candidate* notes above.
The production PNGs are now committed. The remaining release gates are the
latest CI, complete Android bundle QA, native combat screenshot review and
pull request review/merge. Do not use the 1254px original PNGs directly in
Metro—those are high-resolution masters, not performance-bounded runtime art.
