# Phase 0 — Canonical implementation inventory and evidence ledger

**Inventory date:** 2026-10-22. **Audited main:** [`c1c0cf2`](https://github.com/elroynbenjamins/Cart-Crown/commit/c1c0cf25421f539506cbf9341924db8c79c9be6d). **Change status:** Phase 0 source/documentation reconciliation in progress; Android-wide visual baseline remains open.

## Authority and evidence levels

1. **Runtime source and current tests** define what exists. For Human chapters use the chapter node arrays, `humanLateCampaign.ts`, `CampaignScreen.tsx` and battle/event flows. Preserve saved node IDs and the current faction save schema.
2. `src/game/campaignMissionRoadmap.ts` is the **design contract**, not a second runtime campaign. `implementationStatus: 'live'` means an ordered runtime node exists, **not** that every specified lesson/unlock/reward is proven. `runtimeNodeId` is the safe join key.
3. **CI-success** proves the commands in that workflow passed for that SHA, but is not a full campaign playthrough or visual approval.
4. **Native Android emulator screenshot** proves the specific captured installed-APK state. **Physical Android signoff** is separate and currently unverified.
5. This inventory supersedes old implementation claims in the pre-Phase-0 README. [Legacy text is preserved in Git history](https://github.com/elroynbenjamins/Cart-Crown/blob/c1c0cf25421f539506cbf9341924db8c79c9be6d/README.md), not promoted to a new feature plan.

## Campaign contract — source inventory

| Domain | Live source | State / proof | Do not duplicate |
| --- | --- | --- | --- |
| Human Ch1, Greenkeep | `data.ts:chapterOneNodes` | **7** live nodes (`node_1`–`node_7`) | Old "The Last Wagon" chapter |
| Human Ch2, Iron Hills | `chapter2.ts:chapterTwoNodes` | **8** live nodes (`ch2_node_1`–`ch2_node_8`) | Old "The Iron Road" chapter |
| Human Ch3, Frostmarch | `chapter3.ts:chapterThreeNodes` | **11** live nodes | Old "Border Kingdoms" chapter |
| Human Ch4, Greywatch | `chapter4.ts:chapterFourNodes` | **11** live nodes | Old "The Broken Crown" chapter |
| Human Ch5, Crownroad | `chapter5.ts`, `humanLateCampaign.ts` | **11** runtime/late-mission pairs and encounters | Old "Old Royal Lands" chapter |
| Human Ch6, Glass Keep | `chapter6.ts`, `humanLateCampaign.ts` | **11** runtime/late-mission pairs and encounters | Old "Return to Crownspire" finale |
| Human Ch7, Blackstone | `chapter7.ts`, `humanLateCampaign.ts` | **11** runtime/late-mission pairs and encounters | Treat as finale of the **current** Human arc |
| Elf campaign | `factionChapter2.ts`–`factionChapter5.ts`, `factionStarts.ts`, related faction screens | Separate **six-chapter** campaign, available after Human completion | Do not append its chapters to Human 70 |
| Orc campaign | Same faction modules and faction screens | Separate **six-chapter** campaign, available after Human completion | Do not append its chapters to Human 70 |
| Three Seals | `metaCampaign.ts`, `MetaCampaignScreen.tsx` | Shared **five-step** endgame following all three faction campaigns | Do not create a fourth faction campaign |

Normal active-squad cap: **2** in Ch1; **3** from Ch2; **4** after Ch3 mission 2; **5** after Ch4 mission 2; **6** after Ch5 mission 2 and thereafter. The regression checks this cadence. Do not use earlier Stronghold-based seven/other unlock assumptions to change the present cap.

**Contract enforcement:** `scripts/campaign-mission-roadmap-regression.ts` asserts 70 unique ordered roadmap entries, counts 7/8/11/11/11/11/11, canonical live node names and IDs, matching `runtimeNodeId` for all 70, stage caps, and Chapter 5–7 encounter/formation definitions. Passing that test proves linkage, not that every optional design bullet has a runtime side effect.

**Human mission-card art:** `humanCampaignArtDirection.ts` assigns all 70 slots to 36 scene compositions; `humanCampaignMissionArt.ts` registers their packaged PNGs (Ch1 6; Ch2–7 5 each, one boss finale per chapter). Audit actual Android sharpness, story-specific variety and battlefield usage separately. These are **card illustrations**, not evidence of 36 unique combat backdrops.

## Other functionality — present, verification needed

| Area | Source / protection | Present vs. incomplete verification |
| --- | --- | --- |
| Formation, tactical combat, boss staging | `formation.ts`, `encounters.ts`, `BattleScreen.tsx`, `portraitBattle/*`; battle/formation regressions | Implemented code and CI coverage; full seven-chapter tactical/boss gameplay and Android legibility unverified |
| Settlement, relocation, district bonuses | `settlement.ts`, `SettlementScreen.tsx`, `HumanKingdomScenePreview.tsx`; settlement/kingdom UI checks | Interactive stage presentation exists; plot alignment, short-screen interactions and stronger tier differentiation still need review |
| Human settlement art | `assets/game/scenes/human/settlement/` (camp, settlement, fort, town, capital) | Five plates exist; stronghold/grand reuse capital-based treatment/overlays; dedicated visual parity **planned** |
| Elf/Orc visuals | `assets/game/scenes/elf/camp.png`, `orc/camp.png`, `gameArt.tsx`, faction building art | Fallback/procedural presentations exist; new settlement tier plates **planned**, not all absent |
| Equipment, promotions, presets | `equipment.ts`, `armyLoadouts.ts`, Army/Equipment/Formation/Battle Prep screens and relevant checks | Core paths present; full save/equip edge-cases and UX polish open |
| War Table | `sideModes.ts`, `warTable.ts`, screen & regression | Present; repeat-play depth/clarity open |
| Kingdom Trials | `kingdomTrials.ts`, screen & regression | Present; challenge variety/UX open |
| Kingdom Defense | `kingdomDefense.ts`, screen & regression | Present; wave tuning/recovery QA open |
| Expeditions | `expeditions.ts`, screen & regression | Present; route variety, rewards, attrition QA open |
| Offensive Sieges | `sieges.ts`, screen & regression | Present; stage spectacle/campaign integration QA open |
| Relic Hunts | `relicHunts.ts`, screen & regression | Present; rare reveal and equip flow QA open |
| Saves / faction switching | `src/save/*`, `GameProvider.tsx`, save/provider/cross-mode regressions | Two-slot local saves and save-state flows present; low-memory restore, backup corruption, old-slot upgrade on devices open |
| UI / navigation / accessibility | `AppShell.tsx`, `src/theme/*`, `src/ui/*`, UI regression matrix | Themes, routes, Android Back contract present; actual touch/font/contrast/Back gesture tests open |
| Android production | Expo SDK 57, RN 0.86, `app.json`, CI + APK/AAB workflows | Build/smoke infrastructure present; upload signing, final icon, Play listing, physical QA **not certified** |

## Human early-mission behavior audit — source checked

See [the 19-mission routing and completion audit](PHASE0_HUMAN_MISSION_BEHAVIOR_AUDIT.md). All 19 Chapter 1–4 discrepancies now have source-traced Campaign/AppShell/handler routing and an automated regression (`npm run human-mission-routes:check`) covering their stable IDs, effects and navigation anchors. Three early action handlers were further guarded against stale-screen/out-of-order invocation. **Do not treat this as a manual gameplay playthrough:** reward semantics, device Back/navigation and design-intent differences still require native QA; issue #205 stays open.

## Known design-versus-runtime differences to investigate

A live node is not automatically an exact enactment of its roadmap `kind`. **19 Chapter 1–4 nodes have a different runtime `type`** (e.g. `event`, `elite`, `supply` in place of planned `battle`/`upgrade`/`choice`). This can be deliberate presentation, an older event path, or unfinished behavior; it is **not** evidence by itself that the node is broken. Audit behavior before changing types or rewards.

| Mission | Design `kind` | Current runtime `type` | Follow-up |
| --- | --- | --- | --- |
| Ch1 M3 Rebuild the Barracks | upgrade | event | Verify actual construction/upgrade gate |
| Ch1 M4 Spears at Dawn | battle | event | Verify intended lesson/encounter or intentionally noncombat flow |
| Ch1 M5 Cut Off the Captain | battle | elite | Elite treatment may be correct |
| Ch1 M6 The Broken Road | battle | supply | Verify optional supply node resolution |
| Ch2 M1 Strength in Numbers | battle | event | Verify third-squad unlock, no forced extra battle |
| Ch2 M2 Tools of War | upgrade | battle | Verify crafting explanation/side effects |
| Ch2 M4 No Army Fights Forever | battle | elite | Verify injury and recovery lesson |
| Ch2 M5 The Long Way Around | battle | event | Verify flank lesson |
| Ch2 M7 Supplies for War | event | supply | Likely presentation type distinction |
| Ch3 M1 Into Frostmarch | story | event | Verify chapter intro |
| Ch3 M3 Frozen Steel | upgrade | battle | Verify equipment gate |
| Ch3 M5 Choose Your Rider | choice | event | Verify real selection persists |
| Ch3 M6 The Line Buckles | battle | elite | Likely elite variant |
| Ch4 M2 Raise Another Banner | upgrade | battle | Verify fifth-squad unlock occurs on completion |
| Ch4 M3 Two Ways to War | choice | event | Verify selected doctrine persists |
| Ch4 M5 Hold the Breach | battle | elite | Verify elite treatment |
| Ch4 M6 Prepare for Battle | upgrade | event | Verify actual readiness instruction |
| Ch4 M8 Veteran Steel | upgrade | event | Verify upgrade unlock |
| Ch4 M10 The Forked Banner | choice | event | Verify decision persisted |

**Do not bulk-normalize these types:** the runtime `ChapterNode` type and the design's `CampaignMissionKind` intentionally have different vocabularies. Tests should assert stable linkage and observed behavior separately, not force types to equal.

## Baseline test and Android evidence

- [CI on audited main `c1c0cf2` — success](https://github.com/elroynbenjamins/Cart-Crown/actions/runs/39560149509), 2026-10-21. Tests include TypeScript, save/provider, balance, economy, missions, art, screens and battle regressions. **The Phase 0 PR itself must get a separate green CI run.**
- [Native Android APK validation — success](https://github.com/elroynbenjamins/Cart-Crown/actions/runs/39560069799), 2026-10-21, code SHA `4c12089c59c14c15dedd9421a434d20876bb5b73` (preceding main commit). Native test and screenshot artifacts were available when inventoried, but expire on GitHub after seven days.
- [AAB audit — success](https://github.com/elroynbenjamins/Cart-Crown/actions/runs/39393929218), 2026-10-20, older SHA `b2fe659d63dd70780bd0d426937d414157eee4b8`. Neither an Android emulator run nor AAB CI proves release signing/physical device acceptance.
- See [Android screenshot baseline ledger](ANDROID_SCREENSHOT_BASELINE.md) for the captures that exist and the missing matrix.
- Local `npm` test commands could not be executed in the documentation-review environment; GitHub Actions is the verifiable CI evidence. Do not claim a local test pass.

## Outstanding P0 completion gates

- [x] Establish canonical Human/Elf/Orc/Three Seals scopes and preserve current IDs.
- [x] Resolve misleading Human mission status and link design entries to existing runtime IDs (subject to PR merge and CI).
- [x] Rebuild README as a concise overview, removing contradictory active chapter descriptions (subject to PR merge).
- [x] Inventory known mismatches without rewriting game behavior.
- [ ] **Pass Phase 0 PR CI** on its actual commit; review test report and merge safely.
- [ ] **Capture and retain** the comprehensive Android baseline for both viewport sizes, three themes, early/mid/late Human screens and core side modes — see ledger. Current native smoke only covers a subset.
- [ ] Verify each differing early Human node's actual encounter, unlock, choice and reward behavior, then add targeted acceptance checks where missing.
- [ ] Conduct physical Android device signoff and restart/save-upgrade testing later in P8; do not count emulators as phones.
