# Android native checkpoint

The native QA workflow builds the real production App entry point with Expo prebuild and Gradle assembleRelease. It changes only the temporary app name and Android application ID to `com.elroybenjamins.cartcrown.qa`, preserving the production installation and its data. The resulting x86_64 APK is emulator-only and test-signed, not a Play Store or physical-phone release.

## First native attempt: 2026-09-29

Run 36550706358 generated the Android project, compiled native code and bundled 773 JavaScript modules with 88 asset files. AAPT2 resource compilation then failed on Marksman, Shield Spearman and Warbringer PNGs. No APK or emulator gameplay was produced by that attempt. Its failure logs are retained in artifact 11025231123.

Inspection of the exact Git blob bytes confirmed corrupted PNG streams; the old art test read headers but did not validate chunk lengths, checksums or decoded data.

Repairs preserve the source artwork:
- Marksman and Shield Spearman were restored from the original advanced sprite montage's integer pixel grid, removing the preview background and restoring the original 256x256 transparent image. A known-good Longbowman recovered by the same method was RGBA-byte-identical to the repository control. No interpolated or invented artwork was introduced.
- Warbringer contained an extra base64 character. Removing that character recovered a PNG whose original IDAT CRC, zlib checksum, complete 262400-byte scanline stream and Pillow decode all validate.
- Repair SHA256s: Marksman `2a68e7e0af4e60bec870a34da791e1657ac8fa84e499e2cc52031c821d94b741`; Shield Spearman `61055c14d9fda2aa5316c66a29602cb97987af369c9287541172321264aaa502`; Warbringer `81f6e3df8b7b3b9b5910c1addc9fcbee1396fb2dce020a305460739fc5682b9b`.

The production art gate now decodes every game PNG, validates all chunk CRCs and bounds, validates the zlib checksum and exact scanline length, reverses all five filters, and checks actual alpha pixels. Decoder tests include corrupt, truncated and malformed fixtures. Asset checks are not a substitute for a native APK build or visual inspection.

## Test coverage and limits

The emulator runner targets the actual opening save/tutorial/battle/Results flow at compact 1x and tall 2x layouts, followed by background/resume and a process relaunch. Each successful checkpoint must be supported by raw screenshots, UI XML and events; a missing checkpoint fails the job. Until the workflow passes, these are intended checks rather than completed results.

Raw emulator gfxinfo/memory output is diagnostic, not a physical-phone FPS benchmark. Major boss encounters, all themes, large fonts, Android versions other than the configured API level, billing and store review integration require separate test cases.
