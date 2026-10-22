# Phase 1 — Human Kingdom visual and interaction acceptance sheet

Branch scope: layout, presentation and touch UX only. This is **not** a claim of native Android acceptance or seven independently painted stage plates.

## Current implementation

- All nine Human plots take their visual positions from `humanSettlementPlatePlotPositions` in `src/ui/settlementActionLayout.ts`.
- The interactive scene uses derived centers for district links and contextual controls; its background retains the original 540×960 aspect ratio, with a maximum plate width of 438 device-independent pixels on larger screens.
- The Kingdom hero uses the same aspect ratio, responsive plot anchors and stage-specific building scale. Buildings remain independent movable sprites, never painted permanently into a stage plate.
- The existing stage-aware procedural overlay is retained and supplemented with a small number of stage-specific static atlas details on the perimeter. Ambient building smoke, banners and people were already implemented in the interactive scene.
- Tapping an occupied building exposes Inspect / Move / Upgrade directly beside the scene; tapping the same building again closes the strip (except when choosing a relocation). Costs and district changes remain previews until confirmed. No save schema or economy changes.
- CI now runs `human-settlement:check` for the exact plot/stage contract and contextual action positions.

## Follow-up implementation — October 22, second pass

- Scale now derives from both **building role** and **plot depth**. Moving the Kingdom Hall from center to a side plot keeps it larger than ordinary structures on that same plot, while front-row units still read closer than back-row units.
- The Kingdom hero and interactive Human settlement use the same `humanSettlementBuildingSpriteSize` selector; the hero has a fixed foot anchor instead of vertically centering the sprite within the plot.
- Simplified rectangular faux towers and Grand tents were removed from the already detailed Capital illustration. The three late tiers now carry distinctive unobtrusive *existing-asset* dressing near the quay and real wall edges: defensive supplies and sentries (Stronghold), traders (Capital), supply caravan and royal muster (Grand).
- `human-settlement:check` verifies the sizing contract at phone/tablet widths and guards against unintentional reintroduction of tents positioned over water.
- These edits do **not** constitute independently painted Stronghold/Grand plates, full mobile screenshots or native-art acceptance. Maintain those acceptance gates.

## Actual art inventory

| Settlement tier | Packaged plate | Specialization |
| --- | --- | --- |
| 1 Camp | camp | Vulnerable encampment |
| 2 Settlement | settlement | Permanent civilian footprint |
| 3 Fort | fort | Permanent defensive works |
| 4 Town | town | Growing streets and civic density |
| 5 Stronghold | capital | Defensive skyline, watchtowers, blue/military accents and guard details |
| 6 Capital | capital | Stronger walls, ceremonial banners and civic details |
| 7 Grand | capital | Mature walls, gold banners, campaign tents and mounted troops |

Stronghold and Grand still share the packaged Capital base plate. They are **not** independent full scene illustrations. Commission two clean approved plates when the on-device comparison shows insufficient differentiation; maintain the same 540×960 plate contract, empty movable plots and landscape continuity.

## Native Android visual acceptance checklist (not yet executed)

Test with a save at Camp, Settlement, Fort, Town, Stronghold, Capital and Grand. At each tier, compare Kingdom hero versus interactive Settlement without changing placements. At minimum capture:

- Narrow 320×568, typical 360×640, large 412×915 portrait; additionally a larger-width device to check the 438px map cap.
- All nine plots at vacant/built/selected; high Hall in the center, shallow northern row and taller southern row. Check sprite feet on pads, shadows and no clipping against overlays.
- Tap each occupied building, Inspect, cancel, enter Move, preview destination, compare positive district bonus gains/losses, cancel, confirm; upgrade blocked/affordable/confirmed; Android Back dismissal.
- Inspect close/scroll/hit targets with increased Android font scale; verify no menu clips or overlaps touch controls.
- Check the Stronghold/Capital/Grand silhouette at a glance without reading the stage caption.
- Verify save/reload and faction switch preserve buildings, positions, levels and rewards.
- Verify no image loading flashes, jank or excessive battery usage on a native release build.

**Pass/fail:** No visual acceptance is recorded until actual screenshots and the native Android interaction matrix have been reviewed. Scope this PR as a first technical integration pass, not Phase 1 final sign-off.
