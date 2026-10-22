# Verified early-Human Android screenshot baseline — 2026-10-21

**Source type:** REAL native release-test APK on Android 15 emulator (not a designed mockup). **Inspected:** 2026-10-22. **Source commit:** `4c12089c59c14c15dedd9421a434d20876bb5b73`.

- [Successful original native validation run](https://github.com/elroynbenjamins/Cart-Crown/actions/runs/39560069799)
- Original GitHub artifact: `android-visuals-39560069799` (artifact ID `12328450236`, historical seven-day retention).
- Retrieved screenshot ZIP SHA-256: `fbafeadeebaf75dcb0cc33cb330e9d81af12bdf2b951a40d3f9786ac7b5a3feb`.
- ZIP members: **30 native PNG screenshots** (15 per viewport), plus `smoke/smoke-report.json`, `smoke/actions.json`, `source-commit.txt`.
- Exact physical bitmap pixel sizes: `720×1280` at 320 dpi (approx. **360×640 dp**) and `1080×2400` at 420 dpi (approx. **412×915 dp**).
- Smoke report: `status=passed`, `combat_verified=true`, `bosses_verified=false`, `physical_device_verified=false`, `performance_profiled=false`. Both scenarios succeeded for first battle/results, background resume, cold restart and theme captures on the Results screen.

## Screenshots present per viewport

The files are named `smoke/<viewport>-<name>.png`, where `<viewport>` is either `compact-360x640` or `regular-412x915`.

```text
save-select
new-campaign
resumed
kingdom-guidance
campaign
battle-prep
battle-tutorial
battle-active
victory
results
results-unobscured
results-light
results-charcoal
results-dark-restored
persisted-save
```

## Manual visual observations (2026-10-22)

Reviewed the five corresponding **Kingdom / Campaign / Battle Prep / live Battle / Results** images side by side across both emulator sizes.

- The compact **Kingdom, Campaign and Battle Prep** screenshots are dominated by the onboarding tutorial coach overlay, obscuring much of the underlying UI. They prove that the tutorial is displayed, **not** that these base screens are fully laid out and approved without a coach.
- On the regular viewport, the early settlement plate, Campaign chapter card, Battle Prep header, live battlefield and Results panel appear in their intended route order. Readability, touch interaction and color/contrast acceptance are **not certified** solely from a contact sheet.
- The captured battle is the first normal battle, **Hold the Crossing**. No boss, late Human tier, Formation/Army/Wagon, side-mode or alternate-faction visual parity is covered here.
- The Results screen has matching themed captures at both viewports. This does not certify all three themes on other screens.

## Retention policy and limits

The original GitHub artifact used **seven-day** retention and could expire; the SHA-256 above allows verifying an externally saved ZIP. Phase 0 now changes native workflows to retain **newly produced** screenshots/reports for **up to 90 days**. This is **not permanent storage**, does not retroactively extend historical artifacts and is subject to any lower repository/organization retention maximum.

For a permanent accepted screenshot baseline, attach the approved subset to a tagged release or commit appropriately compressed, carefully chosen PNGs under `docs/qa-baselines/<source-sha>/`. Never confuse an art concept, fixture preview, or different SHA with a native main-branch screenshot. See [the full coverage ledger](../ANDROID_SCREENSHOT_BASELINE.md) and [issue #204](https://github.com/elroynbenjamins/Cart-Crown/issues/204).
