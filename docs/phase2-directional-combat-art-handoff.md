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
