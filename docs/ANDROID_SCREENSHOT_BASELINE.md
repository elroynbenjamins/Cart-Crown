# Android screenshot baseline — evidence and capture ledger

**Created:** 2026-10-22 | **Status:** provisional automated evidence; **comprehensive visual baseline not yet complete**.

## Existing native evidence (do not confuse with mockups)

The last successful pre-Phase-0 Android native validation ran on [GitHub Actions run 39560069799](https://github.com/elroynbenjamins/Cart-Crown/actions/runs/39560069799), source commit `4c12089c59c14c15dedd9421a434d20876bb5b73`. It built an installable temporary-key signed APK, installed it in an Android 15 emulator, used a native UI-hierarchy probe, and generated actual screenshots under `artifacts/android/smoke/`.

- **Viewport scenarios:** `compact-360x640` (720×1280 at 320 dpi) and `regular-412x915` (1080×2400 at 420 dpi).
- **Existing per-viewport capture names:** `-save-select`, `-new-campaign`, `-resumed`, `-kingdom-guidance`, `-campaign`, `-battle-prep`, `-battle-tutorial`, `-battle-active`, `-victory`, `-results`, `-results-unobscured`, `-results-light`, `-results-charcoal`, `-results-dark-restored`, `-persisted-save`.
- **Run evidence:** `android-visuals-39560069799` artifact (PNG screenshots + smoke-report/actions JSON); `android-native-39560069799` (APK, reports and evidence). Both were reported nonexpired on 2026-10-22. **GitHub workflow retention is seven days.** Download and preserve copies before expiry; artifact links themselves are not a permanent image baseline.
- **What smoke actually verifies:** first Human battle and result, theme cycling *on Results*, offline install/launch, background resume and a cold-save restart. It does **not** test all themes on all screens or prove 70-mission end-to-end completion.

Source capture script: [`scripts/android-native-smoke.py`](../scripts/android-native-smoke.py). Native workflow: [`.github/workflows/android-native.yml`](../.github/workflows/android-native.yml). Screens from earlier artifacts must not be passed off as captures of a later SHA.

## Extended native capture pass — VERIFIED 2026-10-22

**[Android native validation run 39747572648](https://github.com/elroynbenjamins/Cart-Crown/actions/runs/39747572648) PASSED** for PR #208 (merged into main as `6824a5d1510cdb76af938933b6a2a33c91b00cbb`). The workflow tested PR head `ebcf8069998ec8749f905949ef693198b64a8357`; the `source-commit.txt` inside the captured artifact records the synthetic PR-checkout merge SHA `08a84ec8f4f944201ec930db16ab0f36e5f1c07b`. **This is not a separate full native build of the subsequent squash-merge SHA.**

- Exact GitHub artifact: `android-visuals-39747572648`, artifact ID `12412264204` (not expired at inspection), **46 real PNG screenshots** and the source/smoke/actions JSON evidence.
- Retrieved ZIP SHA-256: `742dcbd9036bbc24684a3ef856d7ee3236ef23288153277d8537fd8d70b0286b`; the screenshot ZIP was downloaded and inspected on 2026-10-22.
- The existing opening battle/results smoke still passes both `360×640` and `412×915` emulated DP viewports with restart/save checks and Results theme cycles.
- **16 new verified screenshots** (eight per viewport) with **zero supplemental capture errors** in `smoke-report.json`: `-kingdom-dark`, `-kingdom-light`, `-kingdom-charcoal`, `-settlement-dark`, `-formation-dark`, `-wagon-dark`, `-army-dark`, `-campaign-postbattle-dark`.
- The new Kingdom and Campaign screenshots are captured **after the first battle and without the tutorial coach overlay**; the previous screenshot pack's initial Kingdom/Campaign/Battle Prep states are still useful for tutorial QA but cannot certify unobstructed layout.
- Manual contact-sheet inspection confirms all eight requested subjects are visibly rendered, not blank PNGs. In the early `camp` plate the main architectural landmark already looks developed; compare to town/capital before approving progression identity in P1. This is a visual audit observation, **not** a gameplay regression.
- These are opening Human screenshots only. No mid/late Human tier, boss, Elf/Orc, side-mode or physical-device baseline has been established by this test. The script treats supplemental capture errors as report entries, so the **JSON content and actual PNGs must be inspected** on future runs rather than assuming `status=passed` alone proves all supplemental screenshots exist.

## Grand-stage Settlement fixture — verified native capture, **not visual acceptance**

A separate **[successful native Settlement fixture run 39747225373](https://github.com/elroynbenjamins/Cart-Crown/actions/runs/39747225373)** from exact source SHA `54a8e08d01085f76c25f7b393de06fb7e3bdcf52` supplies two additional REAL Android captures, using `scripts/android-native-settlement-fixture.tsx` rather than full normal gameplay. Artifact `android-settlement-39747225373` (ID `12413200254`); downloaded ZIP SHA-256 `6569dd95e9d1a205b90a7684f3f9f94c298330753f2918a44f5638112e7e0bd0`. Files: `smoke/compact-360x640-overview.png` (720×1280) and `smoke/regular-large-text-overview.png` (1080×2400 at **1.35× system font**).

Both fixtures report `status=passed` and display the actual `SettlementScreen` set to `grand` with nine buildings. **Manual visual review found blockers:** broad semi-transparent grey blocks across the upper plot row; dark/brown label-like overlay strips across structures/terrain; several bright upgrade arrows over buildings. The Grand scenery itself is detailed, but the UI chrome currently overwhelms it at compact dimensions and enlarged font size. A green native launch/screenshot smoke test is **not** visual acceptance. This finding was passed to the [Phase 1 settlement PR](https://github.com/elroynbenjamins/Cart-Crown/pull/203) for plot/action-strip polish. Neither screenshot establishes a valid normal-game Grand save, campaign progression, or theme parity.

## Automated screenshot integrity gate — Phase 0 follow-up

The **Android native workflow** now runs `scripts/android-visual-baseline-audit.py` against its freshly captured installed-APK screenshots *after* the required gameplay/save smoke. It fails the native job when any of the following is missing or inconsistent: the correct 40-character source SHA, both 360×640 and 412×915 emulator scenarios, successful battle/results, the 46 expected original and supplemental PNG files, correct physical pixel dimensions (720×1280 and 1080×2400), valid PNG signatures/chunk CRCs, distinct theme screenshots, or zero-error supplemental capture reports.

The audit writes `screenshot-baseline-audit.json` into the native smoke artifact as a reproducible receipt. `scripts/android-visual-baseline-audit-regression.py` exercises missing-image, wrong-resolution, duplicate-theme, reported-error and invalid-SHA failure cases in the regular CI workflow. These tests protect the **integrity of evidence**, not artistic quality.

A green run therefore establishes the exact expected screenshots were generated at the required resolutions. **It does not certify** plot grounding, legibility, chapter/boss appearances, late-stage progression, all themes on every screen or physical-device suitability. Issue #204 remains open until those visual acceptance tasks are complete.

## Missing Phase 0 visual acceptance matrix

| Screen | Early Human | Mid Human | Late Human | Compact + regular | Three themes | State |
| --- | --- | --- | --- | --- | --- | --- |
| Kingdom / settlement hero | **Captured clean, 3 themes** | Not captured | Not captured | **Both** | **Kingdom only** | **Early captured, stages pending** |
| Settlement interactive plot placement | **Captured initial screen** | Not captured | **Grand fixture only; visual blockers** | **Both** | Dark only | **Early + fixture captured, UI acceptance open** |
| Campaign map & mission list | **Captured clean postbattle** | Not captured | Not captured | **Both** | Dark only | **Early captured, later open** |
| Battle Prep / formation preview | First battle, tutorial overlay | Not captured | Not captured | Both | No | **Unobstructed capture open** |
| Live Battle / boss | First battle | Not captured | Not captured | Both | No | **Boss/later open** |
| Results / rewards | First battle | Not captured | Not captured | Both | **Results only** | **Early captured** |
| Army / equipment / loadouts | **Opening roster** | Not captured | Not captured | **Both** | Dark only | **Early captured, later open** |
| Formation screen | **Opening two-squad formation** | Not captured | Not captured | **Both** | Dark only | **Early captured, later open** |
| Supply Wagon | **Opening wagon** | Not captured | Not captured | **Both** | Dark only | **Early captured, later open** |
| Activities hub + mode first glance | No | No | No | No | No | **Open** |
| Elf / Orc faction settlement and battle | N/A | N/A | N/A | No | No | **Open for faction QA** |

**Target visual evidence per approved change:** 360×640 and 412×915, Original/Charcoal + Pure Black + Light, native APK with SHA; note scrolling, text clipping, plot anchors, banner/icon sharpness, modal overlap, status/navigation bars and touch target access. For Human tiers include at least camp, town/stronghold, capital/grand, with the same terrain anchor reference. Preserve before/after captures for visual PRs.

## Repeatable workflow

1. Build/obtain a native APK for the **exact branch SHA**. Never substitute design mocks or screenshot renders for installed-app evidence.
2. Run `scripts/android-native-smoke.py` with the actual APK and UI-probe APK, or use the Android native GitHub workflow; record source commit, emulator API/size/density, workflow run URL and smoke result.
3. For mid/late and otherwise unreachable states, build a **debug-only deterministic fixture** that opens real game screens with known save data. Never ship fixture/QA controls in production, and never silently alter the normal campaign or saves.
4. Capture UI and image assets to durable `docs/qa-baselines/<sha>/` or another explicitly retained artifact store. Compare to an approved reference and write down visual defects. GitHub artifacts are time-limited; historic runs used seven-day retention. Future native artifacts use up-to-90-day retention once the separately reviewed retention workflow change is merged.
5. Finish this baseline **before** starting a high-impact settlement or combat visual rework, and preserve a matching post-change set.

## Signoff

- **Code/CI baseline:** yes, previous main and native emulator successful (see links).
- **Durable complete screenshot set committed/preserved:** **NO**.
- **Late-game screenshots:** **NO**.
- **Manual visual inspection at all required widths/themes:** **NO**.
- **Physical Android device validation:** **NO** (release gate, not Phase 0 document cleanup).

These are explicit open items; do not mark Phase 0 fully completed until the evidence exists.
