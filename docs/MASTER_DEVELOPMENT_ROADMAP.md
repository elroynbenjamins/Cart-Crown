# Cart & Crown — Master Product, Gameplay, Visual and Release Roadmap

**Baseline:** 2026-10-21 | **Reviewed repository:** `elroynbenjamins/Cart-Crown`, `main` at `58b5a91afe6f5bd1cc62f2de83846e0921d7007d` | **Document status:** actionable planning guidance, not proof of completed QA.

> This document is the handoff source of truth for WHAT WE SHOULD IMPROVE NEXT. Live code and tests are authoritative for WHAT IS IMPLEMENTED NOW. Before each pass, inspect the newest `main`; do not overwrite improvements made after this baseline.

**Phase 0 reconciliation (2026-10-22):** [Canonical implementation inventory](PHASE0_IMPLEMENTATION_INVENTORY.md) records runtime node IDs, evidence levels and known design/type differences. [Android screenshot baseline ledger](ANDROID_SCREENSHOT_BASELINE.md) distinguishes successful opening smoke screenshots from the remaining full screen/tier matrix. The README now describes the current seven-chapter Human campaign; historical text in Git history is not an active plan. **Phase 0 remains open** until this change passes PR CI and durable full baseline screenshots are captured.\n\n## 0. Product vision and non-negotiable design decisions

- **Name:** Cart & Crown (repository `Cart-Crown`; also referred to as Backpack Kingdoms during concept development).
- **Platform:** portrait-first, mobile-first offline-capable strategy RPG, with tactile fantasy pixel art and compact, polished interfaces.
- **Core loop:** advance a deliberately authored campaign -> prepare the army and limited-capacity logistics wagon -> command 3x3 formations through readable tactical battles -> earn materials/equipment -> grow a visible, placeable settlement -> unlock new military options and activities -> repeat.
- **Three factions:** Human first, Elf and Orc unlock after the Human campaign; faction states persist in the same save, and their tactical identities remain distinct (Human Orders, Elven Wards, Orc Momentum). Shared Three Seals endgame exists.
- **Human campaign contract:** 70 fixed missions across seven chapters, exactly **7/8/11/11/11/11/11**. No random replacement or procedurally shuffled story progression. **Squad cap:** 2 in Chapter 1, 3 from Chapter 2, 4 after Chapter 3 mission 2, 5 after Chapter 4 mission 2, 6 after Chapter 5 mission 2. Six is the permanent normal cap. Strong factions and tactical variation must not require seven or more active squads.
- **Mobile legibility over spectacle:** silhouettes, hierarchy, readable icons, meaningful impact feedback; avoid noisy UI, tiny labels, fuzzy art, exaggerated animation and resource-heavy particle systems. No text baked into illustrations.
- **Settlement direction:** the settlement dominates the Kingdom screen. Buildings genuinely sit on fixed plots with consistent perspective/foot anchors. The surroundings remain recognizably continuous while architecture, walls, density, roads and activity mature visibly across tiers.
- **Positive-only adjacency:** adjacent buildings may grant district bonuses; poor placement must not impose hidden penalties. Moving built structures preserves levels.
- **Progression should introduce complexity gradually:** progressively unlock side modes; favor contextual tutorials, not a wall of buttons. Avoid mandatory repetitive farming as a substitute for story pacing.
- **Regression-safe development:** new visual layers must not secretly change combat math, rewards, save identity, formation order, current faction, battle timing or progression gates.
- **No unnecessary rewrite:** prioritize narrow, testable vertical slices; preserve existing strong art such as Human Ranger and Spearman. Do not re-generate full asset libraries where just a few classes are weak.
- **Do not add unapproved online multiplayer, accounts, cloud sync, IAP monetization or persistent internet dependency.** Rewarded-ad adapter currently has mock development behavior; production monetization is a separate launch decision.

## 1. Snapshot of what exists at this baseline

| Domain | Repository evidence | Assessment |
| --- | --- | --- |
| Human campaign | `src/game/campaignMissionRoadmap.ts`; Chapters 1–7 runtime node arrays; `src/game/humanLateCampaign.ts`; `scripts/campaign-mission-roadmap-regression.ts` asserts 70 live nodes and Chapter 5–7 encounter wiring | **Implemented in source / verify by full playthrough.** The typed blueprint's `implementationStatus: 'blueprint'` does NOT reliably reflect runtime status. Reconcile it rather than assuming 70 missions remain to implement. |
| Mission artwork | `docs/human-campaign-art-depth.md`; `src/ui/humanCampaignMissionArt.ts` | **Packaged:** 36 Human scene compositions (6 in Ch1 + 5 each in Ch2–7) cover all 70 slots; seven finales have their own composition. Focus next on scene use, quality/legibility and battle-specific art, not replacing them wholesale. |
| Settlement | `src/screens/SettlementScreen.tsx`; `src/ui/HumanKingdomScenePreview.tsx`; `src/ui/gameArt.tsx` | Interactive placement, movement, upgrade and plot actions exist; visual coordination and compact Android usability still need real-device verification. |
| Human settlement backgrounds | `assets/game/scenes/human/settlement/` contains camp/settlement/fort/town/capital | Advanced stronghold/grand stages currently reuse capital plate with overlays in `SettlementTerrainBackdrop`; audit whether genuinely different enough. |
| Elf/Orc settlement visuals | `gameArt.tsx` has procedural/faction backdrop and atlas fallbacks; dedicated `assets/game/scenes/{elf,orc}/settlement/` directories not present at baseline | Strong candidate for bespoke stage plates and more faction-specific building integration. Do not say entirely absent: existing fallback scenes and sprites work. |
| Combat | `src/screens/BattleScreen.tsx`, `src/ui/portraitBattle/*`; `docs/portrait-battle-implementation.md`, `docs/human-battlefield-concept-pass.md` | Portrait battle view, true 3x3 formation slots, orders, VFX and Human archetype sprites exist; directional facing, elite/boss fidelity, feedback and readability are main gaps. |
| Unit assets | `assets/game/units/human` (27 class assets), Elf (13), Orc (13); `assets/game/battle_portraits/human` has portrait/figure pairs | Preserve strong units; commission missing or weaker exact class identities rather than generic token recolors. Audit Recruit/Militia and current production mapping. |
| Other activities | `src/game/sideModes.ts`: War Table, Kingdom Trials, Kingdom Defense, Expeditions, Offensive Sieges, Relic Hunts | All have screens/logic and regressions; improve first glance, unlock pacing, depth, rewards and tutorials before inventing many modes. |
| UI | `src/AppShell.tsx`; `src/theme/themes.ts`; `src/ui/components.tsx` | Original/Charcoal, Pure Black, Light; route history and Android Back resolver exist. Need cross-screen design polish and usability audit. |
| Saving | `src/save/*`; Save Provider retry regression, two local slots | Test lifecycle, restart, corruption/recovery and progress preservation. Development's no-legacy-migration choice must be revisited **before first public release**, never used to justify data loss in shipped builds. |
| Android | Expo SDK 57 / React Native 0.86, Android package `com.elroybenjamins.cartcrown`; CI, native APK smoke, AAB QA workflow | Build infrastructure exists. CI pass not independently executed by this roadmap review; physical signed-device and Play listing checks remain gate. |
| Inconsistency | `README.md` still contains older chapter descriptions; `campaignMissionRoadmap.ts` blueprint status is stale | **Phase 0 priority:** eliminate contradictory sources of truth without altering a working story save. |

**Statuses:** Present in source = found in code; Tested = relevant CI or device evidence reviewed and passing; Accepted = manually reviewed gameplay/art on target Android devices; Planned = do not claim implemented.

## 2. Prioritized milestone map

| Phase | Priority | Theme | Depends on |
| --- | --- | --- | --- |
| P0 | P0/critical | Baseline reconciliation, source-of-truth audit and QA evidence | none |
| P1 | P0/critical | Human settlement/Kingdom visual finish | P0 |
| P2 | P0/critical | Battle visual identity and gameplay readability | P0 |
| P3 | P1/high | Campaign presentation, chapter endings, story choices | P0 + initial P2 |
| P4 | P1/high | Army, loadouts, equipment and tactical preparation UX | P0 |
| P5 | P1/high | Reward economy, offline progression and six side modes | P0 + P4 |
| P6 | P1/high | Elf/Orc visual parity and faction onboarding | P1 art contracts + P2 art contracts |
| P7 | P1/high | Global UX, interaction polish, sound/haptics accessibility | P1–P6 as needed |
| P8 | P0/critical RELEASE GATE | Real Android QA, save durability, policy/store deliverables | all release-scoped phases |
| P9 | P2/later | Retention improvements and optional content beyond polished launch | P8 beta feedback |

A phase can consist of small independent pull requests; do not wait to run regression tests until every phase is complete.

## P0 — Correctness, consolidation and design-system baseline (FIRST)

**Problem:** multiple narrative layers were implemented at different times. The master 70-mission blueprint still labels items `blueprint`, while regression source asserts that all 70 nodes exist in live chapter arrays. README includes older 6-chapter Human arcs alongside current seven-chapter structure, potentially confusing future agents.

**Work packages**
1. Inspect the current `main` branch head, list active PRs and map old/duplicate mission documentation to current runtime. Do not rewrite canonical node IDs, story choices or save fields merely to tidy names.
2. Create a generated/verified **mission contract report**: 70 blueprint IDs -> live node IDs -> kind -> expected squad cap -> encounter/reward resolution -> artwork mapping -> chapter/end unlock. Replace misleading default implementation flags with grounded runtime linkage OR rename fields to clearly mean roadmap migration stage; keep compatible consumers.
3. Reconcile README with canonical seven-chapter Human campaign, separate Elf/Orc six-chapter stories, and Three Seals. Document the different scopes explicitly.
4. Run `npm run typecheck`, `npm run campaign-roadmap:check`, `npm run campaign-art:check`, `npm run art:check` and all existing CI regressions; record commit/CI URL. A code inspection alone never counts as green CI.
5. Establish a compact **screenshot baseline** (360x640, 412x915; Light/Pure Black/Charcoal; Kingdom, Settlement, Campaign, Battle Prep, Battle, Results, Army, Formation, Activities; Human early/mid/late). Review on installed native build if available.
6. Audit code complexity: extremely large `SettlementScreen.tsx`, `CampaignScreen.tsx`, `gameArt.tsx`, `AppShell.tsx`. Extract pure data/selectors and smaller presentational components **incrementally**, with parity tests; avoid speculative sweeping refactors.
7. Each future PR must include: what was wrong, exact affected files, tests, before/after screen capture where visual, and no unrelated balance/save changes.

**Acceptance gate:** one canonical campaign inventory, all 70 maps accounted for, no documentation contradiction, passing applicable CI and baseline screenshots saved. **Current status (2026-10-22):** inventory + README + runtime ID guard prepared in Phase 0 PR; old names archived in Git history; pre-PR main CI and prior native smoke were green. Comprehensive screenshot coverage, behavior audit of early-node type differences, current-PR CI and merge must still be confirmed before declaring P0 complete.

## P1 — Human Kingdom and settlement visual overhaul (highest visual ROI)

**Goal:** show a believable progression from vulnerable outpost to powerful kingdom, with the settlement as the dominant main-screen hero rather than a generic menu backdrop.

**Work packages**
1. **Stage art matrix:** validate 7 stage presentations (camp, settlement, fort, town, stronghold, capital, grand) against the actual 5 shipped Human plates. Keep terrain continuity while differentiating stronghold/capital/grand via approved stage-specific structures, construction progression or new clean background plates when overlays are inadequate. Never flatten movable buildings into terrain art.
2. **Plot alignment:** enforce one canonical plot anchor set used by Kingdom preview and interactive Settlement. Feet/bases must visibly touch the actual pads. Test portrait aspect ratios, safe areas, overlay ordering, tall/short devices. No floating rooftops or mis-scaled buildings.
3. **Building art:** audit each building at 60–128px, role readability, consistent lighting/angle, alpha bleed, collisions with labels. Keep a real sense of scale (hall landmark larger); selectively upgrade Human buildings that look worse than the agreed pixel standard.
4. **Interaction:** tapping a building selects it; anchored compact strip handles Inspect / Move / Upgrade, with clear valid/invalid placement, costs, adjacency preview and cancellation. Existing free relocation preserves levels and earns only positive district bonus. Touch targets and popover positioning must work on narrow screens.
5. **Ambient polish:** subtle banners, chimneys, torch glow, tree/water movement, people/guards where appropriate, placement dust or upgrade pulse. Respect reduced-motion and battery use; keep full scene static while scrolling.
6. **Kingdom priorities:** surface current build priority, claimable production, one current campaign objective and upgrade readiness without burying or covering the artwork. Push minor economy details into compact expandable panels.
7. **Upgrade moment:** visually rewarding settlement transformation and tier banner without gameplay latency or asset flashes.

**Acceptance:** compare early/mid/final stages side by side: unmistakable power growth; all nine Human building types legible; foot anchors on plots; no blocked building controls; no image decode errors or frame drops in normal interaction. Existing purchase/move/upgrade save tests still pass.

**Implementation owners:** `src/screens/KingdomScreen.tsx`, `src/screens/SettlementScreen.tsx`, `src/ui/HumanKingdomScenePreview.tsx`, `src/ui/settlementActionLayout.ts`, `src/ui/gameArt.tsx`, `src/ui/productionAssets.ts`, `assets/game/scenes/human/settlement`, settlement UI regression.

## P2 — Battlefield spectacle, silhouettes and tactical clarity

**Goal:** battles should feel like armies confronting one another, with each class readable and player decisions visibly consequential.

**Work packages**
1. **Battle facing:** create a limited approved set of directionally appropriate ally back/three-quarter poses and enemy front/three-quarter poses (infantry, ranged, support, cavalry). Maintain class-specific details, no flip that reverses shields or creates implausible weapon orientation. Pilot Human before other factions.
2. **Formation staging:** retain exact 3x3 slot geometry and full rows; visually distinguish packed Iron Wall, deep Layered Core, flanking cavalry, protected ranged rears. Enemy and ally frontlines visibly face the engagement center. Do not invent per-unit HP/individual damage when engine uses shared army HP/aggregate exchanges.
3. **Attack feedback:** compact sword clash, arrows, magic and charge effects, formation-integrity crack, Guard/Brace/Charge/Rally/Reinforce signals, telegraphed major attacks, selected target highlight; feedback must correspond to real computed events and pause/resume state.
4. **Enemy/boss identity:** unique silhouettes for actual named bosses and elite threat families; stronger chapter-appropriate environments, boss entrance and result moment. Never silently change enemy abilities just to suit visual art.
5. **Battle readability:** enemy intent, counter roles, active orders and cooldowns easy to see in 1–2 glances. Give an optional inspect without blocking flow; make critical alerts accessible by text/icons as well as color.
6. **Performance:** limit simultaneous animated layers, use reduced-motion fallbacks, avoid large continuously animating full-screen compositing. Verify 1x/2x speed, pause, background transition, one-shot results and overlays in native release.
7. **Art audit:** preserve high-quality unit icons; prioritize any weak Recruit, Militia, promotion, Siege Engineer, support, mounts and exact class mappings based on current screenshots and existing art audit, not historical assumptions.

**Acceptance:** no slot drift in all nine formation shapes; compact screen legibility; stable Android release FPS and memory; battle/results produce correct saved rewards only once; clearly distinct boss fight versus normal battle.

**Implementation owners:** `src/ui/portraitBattle/*`, `src/screens/BattleScreen.tsx`, `src/ui/BattleExchangeVfx.tsx`, `src/ui/battleVisuals*.tsx`, `src/ui/bossPresentation.ts`, production assets and combat regressions.

## P3 — Campaign journey, narrative moments and endings

**Baseline:** all 70 Human mission slots have bundled chapter-specific art; recent code changes added human victory art and chapter-aware CTA routing.

**Work packages**
1. Improve chapter map first glance: clear current/frontier/boss state, next objective, chapter identity, enemy threat and unlock information; no huge repeated headers or confusing completed-card density.
2. Reuse approved 36 mission illustrations intentionally: show chapter region clearly, use correct individual boss scene, no unrelated labels or lore; check crop, Light/Dark and asset load fallback. Do **not** commission 70 new images by default.
3. Chapter transition arc: victory banner -> meaningful rewards -> new map/front reveals -> settlement expansion or troop unlock. Keep actions predictable, nonblocking and skippable on replay/re-entry.
4. Story choices should show consequences and what is permanent versus boss-only; never allow a second unintentional claim/choice through resume or Back navigation.
5. Review all result continuation routes (Campaign, Kingdom, War Table, Three Seals) with honest labels; preserve recent result-route fixes.
6. Add/verify elite and boss threat identity, chapter completion feedback, end-of-Human reveal of unlocked Elf/Orc factions, and satisfying Three Seals finale.
7. Run a scripted full **Human 70-mission** progression audit, including each nonbattle event, squad-cap milestone, builder gate, reward and saved reload.

**Acceptance:** each of seven chapters has its own recognizable palette, region, finale and new front reveal; no wrong artwork, stale completion banners, repeat grants or dead-end CTAs.

**Implementation owners:** `src/screens/CampaignScreen.tsx`, `src/screens/HumanMissionScreen.tsx`, `src/ui/CampaignJourneyMap.tsx`, `src/ui/HumanChapterTransitionBanner.tsx`, `src/ui/HumanMissionVictoryMoment.tsx`, `src/game/resultContinuation.ts`.

## P4 — Army management, equipment, logistics and advanced tactical UX

**Do not rebuild existing loadout system:** there are loadout modules and regression checks. Improve flow and ensure actual behavior meets player expectation.

**Work packages**
1. Army card: compact but expressive class portrait, level, readiness, role, promotion availability, equipment gaps and active/reserve state, with tap-to-drilldown.
2. Loadouts: named/saveable formation and equipment presets where already supported; clear slot limitations, preview of displaced slots, safe equip/replace, no silent changes, quick selection from Battle Prep. Explicitly test what a loadout stores and what it does not.
3. Equipment: readable slots (weapon, armor, shield, mount, artifact); contextual stat comparison, available-crafting/upgrades, eligibility, promotions, best-equipped guidance and reversible choices. Keep selected squad identity after screen transitions.
4. Formation: make Guard, reserve, open-space Elven Wards and adjacent Orc Momentum legible; display why arrangement helps rather than raw numbers only.
5. Wagon: intuitive grid limits, item effects, preparation recommendation for upcoming mission, safe drag/drop or robust tap placement, no surprising item deletion; preserve true logistics constraints.
6. Battle Prep: one-screen actionable checklist for weakness, counters, supplies, readiness and formation; signal if lower Power can be a better tactical match. Show exact mechanics only where grounded in game simulation.
7. New troop-family complexity: inspect magic/flying/large/hybrid unlock gates, research queues and tutorial context. Add clear previews/feedback, not broad new progression branches before balance review.

**Acceptance:** from mission preview to prepared army in a few obvious actions; loadouts survive save/load and faction switch, equipment cannot duplicate, invalid team layouts cannot enter battle, no loss of an unlocked squad.

**Implementation owners:** `src/screens/ArmyScreen.tsx`, `FormationScreen.tsx`, `WagonScreen.tsx`, `EquipmentManageScreen.tsx`, `BattlePrepScreen.tsx`, `src/game/armyLoadouts.ts`, `loadoutAnalysis.ts`, `equipment.ts`, `battlePreparation.ts`.

## P5 — Progression economy and the six existing Activities modes

**Baseline:** War Table, Kingdom Trials, Kingdom Defense, Expeditions, Offensive Sieges and Relic Hunts are already represented in code. Prefer deepening existing modes instead of introducing more buttons.

**Work packages**
1. Modes hub: hide or clearly lock unavailable modes until their settlement/story gate; first-glance progress, remaining rewards and relevant notification dots; deep links to the actual mode. Match tutorial only when newly unlocked.
2. War Table: short, distinct scout contracts; no exploitative resource loop; challenges communicate enemy formation identity and counters.
3. Kingdom Trials: mastery through composition restrictions and meaningful 3x3 formations; transparent first-clear versus repeat rewards, failure learning.
4. Kingdom Defense: true multi-wave attrition, clear carryover readiness/supplies, settlement defense visuals and explicit survival objectives.
5. Expeditions: interesting route forks/event/supply/boss decisions; replayable without identical repeated outcomes, with transparent rewards and recovery costs.
6. Offensive Sieges: strengthen stage identities (Approach, Breach, Courtyard, Commander), telegraphs, route choice, engineering, checkpointing, defender defenses and carried attrition; distinguish a staged siege operation from four generic buttons. Keep the existing logic and make the tactical difference visible.
7. Relic Hunts: hunt progression, unique boss art, rare artifact reveal, obvious newly obtained relic -> best squad equip flow; test repeat/claimed state.
8. Economy: write progression balance harness for 70 Human missions, initial two squads to six, two local saves, crafting prices, build materials and recovery. Review agreed offline healing design (**10% per hour**) and in-game-day equivalence (**six hours offline**) against actual code before labeling either live; decide/fix mismatches explicitly. Ensure players can progress without relying on rewarded ads.
9. Measure target first-try win chances by difficulty (provisional design targets: Standard ~85%, Veteran ~75%, Iron ~60%) through simulation and playtest; never claim actual success percentages from static code alone.

**Acceptance:** every mode unlocks when expected and can be entered, abandoned, resumed and completed correctly; rewards neither duplicate nor force a daily grind; campaign progress remains the primary engine.

**Implementation owners:** `src/game/sideModes.ts`, `sideModeBalance.ts`, `sieges.ts`, `expeditions.ts`, `kingdomDefense.ts`, `kingdomTrials.ts`, `relicHunts.ts`; corresponding screens and regression scripts.

## P6 — Elf and Orc art/gameplay parity

**Goal:** not palette-swapped Humans. Elves should convey inhabited forest cities, wards and living architecture; Orcs should convey built-out strongholds, warfires, clans and rugged defensive works.

**Work packages**
1. Build **faction-specific stage art matrices**: provisional 5–7 distinct visual growth steps. Reuse established background and building contracts, but commission clean settlement plates where existing procedurally drawn world/backdrop lacks polish.
2. Elven settlements: graceful forest clearing -> structured grove -> warded refuge -> fortified woodland city -> ancient sanctuary; readable paths and building pads; no background buildings in movable slots.
3. Orc settlements: exposed camp -> organized clan camp -> palisaded warhold -> imposing fortified confederacy; fires, banners, pathways and rugged architecture, without visual clutter.
4. Review Elf/Orc 13-per-faction unit production PNGs, unique/specialist art, mounted Stag/Warg silhouette and enemy bosses. Do not merely tint Human soldiers; retain existing good designs.
5. Restore art mapping/crop consistency across Factions, Kingdom, Settlement, Army, Formation and Battle; avoid fallback to wrong-faction illustration.
6. Faction switching: verify each faction's progress, finances, slots, unit/equipment states and settlement positions survive switching and reloading; Human completion remains preserved. Verify unlock messaging on completion and shared Seals only when actually earned.
7. Revisit Elf Ward/Orc Momentum tutorials and combat feedback, making each faction's positional rules visibly distinct.

**Acceptance:** three factions are identifiable without reading labels; stage growth looks real; no one faction feels unfinished compared with Humans; save isolation holds.

**Implementation owners:** `src/screens/FactionKingdomScreen.tsx`, `FactionCampScreen.tsx`, `src/ui/gameArt.tsx`, `assets/game/scenes/{elf,orc}`, `assets/game/units/{elf,orc}`, `src/game/factions.ts` and saved-faction tests.

## P7 — Cross-app game-feel, UI consistency, accessibility and optional audio

**Work packages**
1. Centralize reusable surfaces, buttons, tabs, modal placements, action strips, tooltips, notification dots, status colors and typography; existing 3 themes remain supported.
2. Review home/Kingdom, Campaign, Army, Wagon, Formation, Activities, Equipment, Settings, Save Select and every Results flow at 360x640/412x915. Favor compact safe-area layouts, not shrinking text to unreadable size.
3. One deliberate navigation behavior: Android Back/predictive edge Back, nested details, modal closes, active battles, victory/defeat, save selection. Do not duplicate screen history entries or escape an active battle accidentally.
4. Onboarding: guided first battle/formation/build, then context prompts for new mechanics and modes; skip previously understood basics on alternate factions. Must be scrollable at large font scales; no trapped tutorial.
5. Add UI sounds and optional haptics only after visual flows stabilize, with user controls (master music/sfx/haptics), low-volume defaults and silent/reduced-motion respect. Do not assume audio already exists; package dependencies are not present in current manifest.
6. Icons and crests: maintain consistent faction colors and crisp pixels at mobile scale; polish missing generic icons, currencies, wagon items, equipment, but avoid mass replacement.
7. Image/animation performance: predecode bundled art, stable layout, memoized heavy subviews where useful; profile real Android rather than optimizing blindly.

**Acceptance:** no clipped buttons, horizontal overflow, unreadable contrast, stale overlays or surprising Back navigation in all themes. Optional feedback always has off switches.

## P8 — Mandatory Android release/QA gate

**Baseline:** Expo SDK 57 / RN 0.86, `app.json` Android package `com.elroybenjamins.cartcrown`, native Fresco initialization plugin, CI and QA-only AAB pipeline. `app.json` currently lacks explicitly configured final launcher/adaptive icon; versioning for Play release needs formal configuration.

**Release checklist**
1. On latest `main`, run full CI regression suite; produce a reproducible clean native build and Android release APK/AAB with source SHA and audit evidence.
2. Run native Android emulator smoke on compact and regular profiles; inspect screenshots rather than trusting exit code alone. Test normal/Light/Pure Black/Charcoal, fresh install and saved restore.
3. Physically install release-signed test builds on at least one low/mid Android device and ideally two aspect ratios. Test cold start, low-memory restore, frame pacing, touch targets, gesture Back, and 1x/2x battle.
4. Entire **70-mission Human route** plus representative Elf/Orc early/late battles, settlement tiers, gear/relic flows, six side modes, faction switches and Three Seals; verify no dead ends or double rewards.
5. Save integrity: all two save slots, corrupted primary and backup restoration, storage unavailable/full, aborted save, process death, app upgrades. Do NOT silently clear pre-release data from testers; once shipped to Play, require explicit backward-compatible save migrations.
6. Android package, target SDK >=36 and 64-bit ABIs audited from **actual built** file; Expo SDK upgrades only when compatibility, Play requirement and regression evidence justify them. Do not upgrade merely because a higher SDK exists.
7. Final app icon/adaptive icon, splash/loading screen, privacy policy, data safety, store listing screenshots, age rating, content description, accessibility and Play review readiness.
8. Final distribution AAB must be signed with correct Play upload key and versionCode incremented; never commit signing material. CI's QA AAB **is not a production-upload artifact**.
9. Rewarded ads: if retained, replace mock provider only after policy/data-safety/reliability checks and verify offline gameplay without ads. Avoid gating core campaign behind ad availability.
10. Release through internal closed testing first, collect crash reports and adjust only verified issues; do not claim release ready based solely on the automated AAB QA workflow.

**Acceptance:** checked release worksheet with verified build SHA, signed artifact, two physical-device test notes, save-upgrade pass, screenshot comparisons and resolved blockers.

**Implementation owners:** `.github/workflows/*`, `scripts/android-* `, `docs/android-release-qa.md`, `app.json`, `src/save/*`, `src/AppGate.tsx`, `src/AppShell.tsx`.

## P9 — Later / only after beta evidence

Possible additions: richer settlement inhabitants and construction progression, localized UI, accessibility features, more authored Contracts/Trials/Siege variations, optional quality-of-life bookmarks, cosmetic-only settlement customization, narrative codex, achievement gallery, seasonal or replay challenges. Each must have an explicit retention rationale and cannot compromise the offline story experience. Do **not** divert attention into more factions or monetization before polished core release.

## 3. Art commissioning checklist — grouped rather than regenerating everything

**Art contract**
- Pixel-art fidelity should match the strong Human militia/recruit/ranger/spearman production quality and chapter mission paintings.
- Gameplay unit/equipment/building icons: transparent RGBA, crisp nearest-neighbor edges, high silhouette contrast, center anchor, safety padding, no background/words/frames. Preserve established 256x256 production icon convention when appropriate; Human portrait/figure pair assets retain their existing manifests/contracts.
- Terrain: portrait 540x960 where using existing settlement plate pipeline, with consistent plot reference positions and no buildings prepainted into build pads.
- Missions: 724x362-ish 2:1 full-frame scenes, no baked UI/text; use packaged current chapter art as base.
- Deliver images as *individually addressable assets*, record stable filenames/ids, source manifests and proper `require` mapping; no runtime dynamic file paths.
- Visual review on actual in-game screen at intended display size, not a standalone enlarged image.

**Suggested priority art batches**
- A1: Human plot alignment audit, late-tier stronghold/grand scene distinction, 1–3 weak building sprites only.
- A2: Directional Human infantry, ranged, support, cavalry field sprite pairs; targeted militia/recruit/promoted class correction.
- A3: Named boss identity and unique battle ambience for Human seven finales; do not change existing story art or invent enemy lore.
- A4: Elf settlement stage plates and building silhouette cleanup; Elf battle facing/warden/ward effects.
- A5: Orc settlement stage plates and building silhouette cleanup; Orc battle facing/warg/warfire effects.
- A6: HUD icons, resource/equipment/promotion highlights, achievement/relic reward moments, branded splash and launcher asset.

## 4. Operational procedure for future ChatGPT/Codex passes

For every user "continue" request:
1. Re-read this roadmap and check the **current latest `main`**, open PRs, and recent commits; do not assume this Oct 21 snapshot is still current.
2. Choose the highest-value incomplete item that does not conflict with active work. Record exact scope, changed paths and expected behavior.
3. Audit existing implementation first. If implemented, improve/verify rather than adding duplicate code. Keep components modular and testable.
4. Make one meaningful vertical slice at a time: implementation, precise wiring, regression test, any required visual asset, usability review.
5. Protect the canonical campaign, all factions, six-squad cap, formation coordinates, district rules, saved-state isolation and one-shot rewards.
6. Run applicable existing tests + typecheck; for native/visual changes, obtain actual Android QA and before/after captures. Clearly distinguish code assertions from physical-device proof.
7. Create a small PR or documented commit, merge only after required tests and conflicts pass; do not hide a failed build. Update this file's status and any outdated README claim.
8. Report: completed, verified, unresolved, next **one** recommended batch. Avoid generic "all improved" claims.

### Definition of done for any roadmap item

- Correct integrated behavior, not just helper code.
- No placeholder, broken sprite key or unrelated asset.
- Correct 360x640 + 412x915 layout in all three themes.
- Loading/error/empty/resume/Back states reviewed.
- Accessibility and reduced-motion handled when relevant.
- Regression test added for new logic or significant UI contract.
- Original balances, progression, saved faction state and reward one-shot preserved unless change explicitly approved.
- Linkable commit/PR and honest validation note.

## 5. Suggested initial sequence — next 10 passes

1. **P0.1 — Campaign/README/runtime contract reconciliation** (no mechanics redesign).
2. **P0.2 — Baseline screenshot + Android QA inventory** on current main.
3. **P1.1 — Human Kingdom hero plot-anchor and scale consistency**.
4. **P1.2 — Distinct Human stronghold/grand stages, compact overlays and upgrade feedback**.
5. **P1.3 — Settlement tap/long-press inspect/move/upgrade refinement**.
6. **P2.1 — Human directional battlefield sprite pilot and enemy staging**.
7. **P2.2 — Combat impact/telegraph/formation integrity polish plus boss readability**.
8. **P3.1 — Seven Human chapter transitions/results/navigation/story-choice pass**.
9. **P4.1 — Army formation/loadout/equipment Battle Prep flow and save tests**.
10. **P5.1 — Six Activities mode first-glance/unlock/claim flow audit and reward pacing**.

After pass 10, prioritize P6 Elf/Orc parity, then P7 broad UI/accessibility/audio polish and P8 release. Run release safety regressions continuously rather than treating release QA as a single last-day activity.

## 6. Open questions for later product decisions (NOT blockers to continue)

- Is the existing Human capital+overlay treatment enough to represent Stronghold and Grand, or should each have unique authored plates? Decide after side-by-side screenshots.
- Should later-stage Elf/Orc capital equivalents get full plates for every tier, or should authored base plates plus structured overlays meet the visual bar? Use in-device comparison.
- Should optional SFX/music ship in 1.0, or after mobile UX stabilization? Prefer minimal soundscape if it does not regress builds.
- Are rewarded ads needed at launch? Core campaign must stand alone; determine explicitly before a Play data safety declaration.
- What release balance should be measured for Standard/Veteran/Iron mode difficulty? Use simulation and actual tester outcomes before accepting the historical 85/75/60 design targets.

**Last reviewed:** 2026-10-21. **Update procedure:** each phase changes status only when evidence supports it. Never call a feature “not implemented” solely because one roadmap field is still `blueprint`, nor call it “device tested” solely because code or README says it exists.
