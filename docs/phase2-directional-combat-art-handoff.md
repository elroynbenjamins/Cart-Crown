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
