# Cart & Crown

**Cart & Crown** (also developed under the project name *Backpack Kingdoms*) is a portrait-first, offline-capable mobile strategy RPG built with Expo / React Native. Build a settlement, manage a limited-capacity wagon and equipment, deploy a 3×3 formation and advance through authored faction campaigns.

> **Source-of-truth rule:** this README is an overview, not a mission implementation checklist. Use [Phase 0 implementation inventory](docs/PHASE0_IMPLEMENTATION_INVENTORY.md) for verified code/test coverage, [Master Development Roadmap](docs/MASTER_DEVELOPMENT_ROADMAP.md) for remaining work, and current source + regression tests for runtime facts. Older campaign descriptions in [the pre-consolidation README](https://github.com/elroynbenjamins/Cart-Crown/blob/c1c0cf25421f539506cbf9341924db8c79c9be6d/README.md) are historical, **not** instructions to create another Human campaign.

## Version 1.0 release scope

**Human-only launch:** version 1.0 makes the full seven-chapter Human campaign playable. The Elven and Orc campaigns, plus the shared Three Seals endgame, remain authored in source but are **not playable in this release**, even after defeating Blackstone. Their Factions cards are labeled as future content; no fixed release date is promised.

The runtime gate lives in `src/game/releaseCampaignScope.ts` and is applied in campaign availability, faction switching, save selection and Three Seals navigation. Existing pre-release Elf/Orc saves are preserved. If a Human kingdom exists, loading an old save opens that Human kingdom without deleting the other faction states; saves without Human state are protected rather than overwritten. No save-schema change or combat balance change is introduced.

**1.0 completion target:** finish the 70 Human missions, verify all first-play and restore paths, polish the Human settlement/army/battles, and ship reliable offline Android play. Work on Elf/Orc art, balance and full QA is postponed to later updates.

## Current campaign structure

The **Human campaign is represented by 70 ordered runtime nodes across seven chapters**, not the older six-chapter Greenkeep/Crownspire narrative previously described here.

| Chapter | Region | Missions | Normal active-squad ceiling |
| --- | --- | ---: | --- |
| 1 | Greenkeep | 7 | 2 |
| 2 | Iron Hills | 8 | 3 |
| 3 | Frostmarch | 11 | 3 → 4 after mission 2 |
| 4 | Greywatch | 11 | 4 → 5 after mission 2 |
| 5 | Crownroad | 11 | 5 → 6 after mission 2 |
| 6 | Glass Keep | 11 | 6 |
| 7 | Blackstone | 11 | 6 |

The node IDs and mission names are defined in `src/game/data.ts`, `chapter2.ts`, `chapter3.ts`, `chapter4.ts`, and `chapter5.ts`–`chapter7.ts` (the latter derive from `humanLateCampaign.ts`). `src/game/campaignMissionRoadmap.ts` describes the design intent and now links to those **existing nodes**. The separate roadmap's tutorial goals, unlock descriptions and mission kinds must still be checked against actual event/encounter behavior before being called fully accepted.

Historically, Human completion was the prerequisite for the **Elf** and **Orc** faction campaigns in the same save. Each has its **own six-chapter** campaign and independent faction state. Completing all three campaigns is the designed prerequisite for the **Three Seals** five-step endgame. **For version 1.0 these additional campaigns remain locked regardless of completion**, preserving their content and saves for future releases. Do not confuse the seven-chapter Human contract with these separate campaigns.

## Implemented systems visible in source

- Two local save slots and three visual themes (Original/Charcoal, Pure Black, Light). Multi-faction progression/switching code remains in the repository but is gated for Human-only 1.0.
- Human **Orders**, Elven **Wards** and Orc **Momentum**; 3×3 battle formation, commander choices, progression to a maximum of six normal active squads.
- Persistent units, class promotions, equipment, formation/loadout controls and a limited logistics wagon.
- Visible stage-based Human settlement with purchase, placement, relocation, upgrade and positive-only adjacency bonuses; separate Elf and Orc settlement definitions and presentation paths.
- Six side modes with code and regression coverage: **War Table**, **Kingdom Trials**, **Kingdom Defense**, **Expeditions**, **Offensive Sieges** and **Relic Hunts**.
- Human mission-card artwork mapped to all 70 story nodes using **36 packaged compositions**, including seven distinct chapter finales; portrait combat art and faction crests.
- Save/provider tests, tutorials, Android Back/navigation support and Android CI release/smoke pipelines.

**Implemented in source is not equivalent to end-to-end playtested.** Balance, reward resolution, mission unlocks, physical-device UX and late-game save stability still require verification. See the inventory for known differences, evidence levels and open gates.

## Tech and local checks

- Expo SDK **57**, React Native **0.86**, TypeScript.
- Android package: `com.elroybenjamins.cartcrown`.

```bash
npm install
npm run typecheck
npm run campaign-roadmap:check
npm run release-scope:check
npm run campaign-art:check
npm run art:check
npm run balance:check
npm run save:check
npm run save-provider:check
```

`.github/workflows/ci.yml` runs the larger regression matrix on pushes to main and on pull requests. The separate Android native workflow builds and installs a test-signed APK in an emulator; it is **not** a release-signed physical-device test.

## Where to work next

- [Canonical Phase 0 implementation inventory](docs/PHASE0_IMPLEMENTATION_INVENTORY.md) — what is present, what tests prove, mismatches and remaining verification.
- [Android screenshot baseline ledger](docs/ANDROID_SCREENSHOT_BASELINE.md) — exact existing emulator evidence and incomplete capture matrix.
- [Master Development Roadmap](docs/MASTER_DEVELOPMENT_ROADMAP.md) — sequenced P0–P9 upgrades; read before any new implementation.
- [Android release QA](docs/android-release-qa.md) — minimum production checks, signing and store requirements.

**Avoid using historical README prose as an implementation specification. Do not rename live mission IDs, retroactively rewrite saves, or add a second campaign pathway to satisfy a legacy plan.**
