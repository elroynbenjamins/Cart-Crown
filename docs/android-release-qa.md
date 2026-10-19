# Android release readiness — Cart & Crown

This is a **release gate**, not a claim that the game is already ready for
Google Play. Always validate a fresh production build from the **current
main branch** after merging release changes.

## Automated checks

1. \`npm run typecheck\`, \`npm run save:check\`,
   \`npm run save-provider:check\`, \`npm run tutorial:check\`,
   Human campaign, formation, art, story and battle regressions must pass.
2. The Android native workflow must build a release APK containing JavaScript
   and both ARM64 and x86_64 native libraries.
3. \`scripts/android-release-apk-audit.py\` checks the *built APK's* AAPT
   metadata: package ID, positive version code, version name, Android target
   SDK >=36, min SDK, 64-bit support, visible app label. Its JSON record is
   uploaded as \`artifacts/android/release-metadata-audit.json\`.
4. Fresh Android 15 emulator smoke: first launch, tutorial, initial Human
   battle and results, theme cycling, cold restart and save restoration,
   compact **360×640** plus regular **412×915** displays.
5. The Expo Android Fresco native initialization guard must be present in
   the generated MainApplication before Fabric starts. This also applies to
   local \`expo prebuild --clean\` builds.

## Manual gates before Play submission

- **Install a locally signed Play-equivalent release AAB/APK on physical
  Android devices.** CI's APK uses a *temporary testing keystore*, never the
  developer's release signing credentials.
- Test Android Back, predictive Back/edge gesture, status/navigation bars
  and touch targets on phones with different aspect ratios, display sizes
  and increased system font sizes.
- Verify low-memory/process-death restore after *actual progress*,
  incomplete battles, corrupted primary save with backup recovery, storage
  nearly full, and an explicit storage permission/error retry.
- Review tutorial readability and scroll reachability on short screens and
  with Reduce Motion enabled.
- Ensure the final branded launcher/adaptive icon, splash treatment,
  store screenshots, privacy policy, data safety questionnaire, age/content
  classification and final listing are approved. The repository currently
  has no explicit app icon/adaptive icon in \`app.json\` — **open release
  task**, not silently considered done.
- Produce the final AAB with an incremented versionCode and the correct
  **Play upload signing key**. Never upload or commit the keystore.
- Keep saved data backward compatible, including old slots for other
  playable factions. Check multiple pre-existing slots after upgrading.

## What this automation does not prove

An Android emulator pass is *not* physical-device validation. An APK audit is
not a Google Play production-signing test. Passing the Human campaign
smoke does not mean all 70 missions, all factions or late-game equipment
have been manually played end-to-end.
