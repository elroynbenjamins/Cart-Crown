# Android asset recovery — 2026-09-29

Native release compilation run 36559462256 failed in AAPT2 while compiling Marksman, Shield Spearman and Warbringer images. Header-only art checks had not detected their damaged PNG payloads.

A full chunk/CRC/inflate/scanline/alpha audit then identified 14 invalid sprite files. Eleven are restored from original conversation attachments or reviewed contact-sheet pixels (nearest-neighbour extraction; no class substitutions). The newly uploaded Git blob hashes were checked against the validated local files before committing.

Restored: Human Border Ranger, Ranger, Scout, Scout Rider, Lancer, Marksman, Shield Spearman; Elf Stag Lancer; Orc Bone Hunter, Warbringer, Warg Rider. Recovered mounted art has transparent padding to avoid edge clipping.

Three original starter files could not be recovered from the available source: Human Militia, Elf Forest Scout, Orc Youngblood. Their corrupt PNGs and static registrations are removed. UnitSprite already provides faction-aware code-rendered fallbacks, so these units remain visible/playable without borrowing a different class's production art. Their production asset specifications remain as outstanding restoration work; re-register only when intact originals/replacements pass the full art check. The original corrupt bytes remain in Git history.

The strengthened art:check validates PNG chunk CRCs and ordering, bounded complete zlib decompression, actual unfiltered pixel rows, real transparency, nonempty visible content, size, registration and exact duplicates. Deliberately corrupt fixtures verify the validator itself.

This audit fixes packaging integrity. It does not claim the three fallback sprites have regained production art, nor that a successful JavaScript test suite proves native rendering or device performance.
