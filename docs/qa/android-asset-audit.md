# Native asset audit — 2026-09-29

Real Android AAPT2 resource compilation exposed defects missed by the former header-only art regression. A full audit of 88 production PNGs found 16 corrupt images.

Recovered (13): Marksman, Shield Spearman, Warbringer, trained Warg equipment, Forest Scout, Stag Lancer, Border Ranger, Lancer, Ranger, Scout, Scout Rider, Bone Hunter and Warg Rider. Recovery used existing source artwork or checksum-constrained corrections, not replacement designs. All repaired files were independently verified with PNG chunk CRCs, complete zlib decoding and Pillow pixel loading; uploaded Git blob hashes were compared against validated local bytes.

Quarantined (3): Militia, Youngblood and Spiritwood Spear. Their damaged original bytes remain under `docs/qa/corrupt-png-fixtures/` and their existing code-rendered fallbacks remain active. Final replacement artwork is explicitly outstanding, not signed off.

The resulting runtime set contains 85 valid game PNGs, including 69 unit/enemy PNGs. Full PNG integrity validation now runs as part of `npm run art:check` and checks all game PNGs rather than only sprites.

Native run 36550706358 and retry 36552499657 both failed before producing a usable APK. This audit removes all identified corrupt runtime PNGs; the next Android build and actual emulator launch still need to pass before native behavior or graphics can be claimed as verified.
