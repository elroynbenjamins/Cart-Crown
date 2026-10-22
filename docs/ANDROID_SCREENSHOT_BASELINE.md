# Android screenshot baseline — evidence and capture ledger

**Created:** 2026-10-22 | **Status:** provisional automated evidence; **comprehensive visual baseline not yet complete**.

## Existing native evidence (do not confuse with mockups)

The last successful pre-Phase-0 Android native validation ran on [GitHub Actions run 39560069799](https://github.com/elroynbenjamins/Cart-Crown/actions/runs/39560069799), source commit `4c12089c59c14c15dedd9421a434d20876bb5b73`. It built an installable temporary-key signed APK, installed it in an Android 15 emulator, used a native UI-hierarchy probe, and generated actual screenshots under `artifacts/android/smoke/`.

- **Viewport scenarios:** `compact-360x640` (720×1280 at 320 dpi) and `regular-412x915` (1080×2400 at 420 dpi).
- **Existing per-viewport capture names:** `-save-select`, `-new-campaign`, `-resumed`, `-kingdom-guidance`, `-campaign`, `-battle-prep`, `-battle-tutorial`, `-battle-active`, `-victory`, `-results`, `-results-unobscured`, `-results-light`, `-results-charcoal`, `-results-dark-restored`, `-persisted-save`.
- **Run evidence:** `android-visuals-39560069799` artifact (PNG screenshots + smoke-report/actions JSON); `android-native-39560069799` (APK, reports and evidence). Both were reported nonexpired on 2026-10-22. **GitHub workflow retention is seven days.** Download and preserve copies before expiry; artifact links themselves are not a permanent image baseline.
- **What smoke actually verifies:** first Human battle and result, theme cycling *on Results*, offline install/launch, background resume and a cold-save restart. It does **not** test all themes on all screens or prove 70-mission end-to-end completion.

Source capture script: [`scripts/android-native-smoke.py`](../scripts/android-native-smoke.py). Native workflow: [`.github/workflows/android-native.yml`](../.github/workflows/android-native.yml). Screens from earlier artifacts must not be passed off as captures of a later SHA.

## Missing Phase 0 visual acceptance matrix

| Screen | Early Human | Mid Human | Late Human | Compact + regular | Three themes | State |
| --- | --- | --- | --- | --- | --- | --- |
| Kingdom / settlement hero | Partial opening guidance | Not captured | Not captured | Opening only | No | **Open** |
| Settlement interactive plot placement | No | No | No | No | No | **Open** |
| Campaign map & mission list | Partial opening | No | No | Opening only | No | **Open** |
| Battle Prep / formation preview | First battle | No | No | First battle | No | **Open** |
| Live Battle / boss | First battle | No | No | First battle | No | **Open** |
| Results / rewards | First battle | No | No | First battle | **Yes: Results only** | **Partial** |
| Army / equipment / loadouts | No | No | No | No | No | **Open** |
| Formation screen | No | No | No | No | No | **Open** |
| Activities hub + mode first glance | No | No | No | No | No | **Open** |
| Elf / Orc faction settlement and battle | N/A | N/A | N/A | No | No | **Open for faction QA** |

**Target visual evidence per approved change:** 360×640 and 412×915, Original/Charcoal + Pure Black + Light, native APK with SHA; note scrolling, text clipping, plot anchors, banner/icon sharpness, modal overlap, status/navigation bars and touch target access. For Human tiers include at least camp, town/stronghold, capital/grand, with the same terrain anchor reference. Preserve before/after captures for visual PRs.

## Repeatable workflow

1. Build/obtain a native APK for the **exact branch SHA**. Never substitute design mocks or screenshot renders for installed-app evidence.
2. Run `scripts/android-native-smoke.py` with the actual APK and UI-probe APK, or use the Android native GitHub workflow; record source commit, emulator API/size/density, workflow run URL and smoke result.
3. For mid/late and otherwise unreachable states, build a **debug-only deterministic fixture** that opens real game screens with known save data. Never ship fixture/QA controls in production, and never silently alter the normal campaign or saves.
4. Capture UI and image assets to durable `docs/qa-baselines/<sha>/` or another explicitly retained artifact store. Compare to an approved reference and write down visual defects. GitHub's seven-day smoke artifacts are an interim reference only.
5. Finish this baseline **before** starting a high-impact settlement or combat visual rework, and preserve a matching post-change set.

## Signoff

- **Code/CI baseline:** yes, previous main and native emulator successful (see links).
- **Durable complete screenshot set committed/preserved:** **NO**.
- **Late-game screenshots:** **NO**.
- **Manual visual inspection at all required widths/themes:** **NO**.
- **Physical Android device validation:** **NO** (release gate, not Phase 0 document cleanup).

These are explicit open items; do not mark Phase 0 fully completed until the evidence exists.
