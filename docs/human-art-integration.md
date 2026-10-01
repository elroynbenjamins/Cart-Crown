# Generated Human art integration — 2026-09-30

The approved Human sprite sheets are now individual RGBA production assets, not a flattened UI screenshot. The new library contains 12 portrait/figure pairs (24 PNGs). All are 256×256 with a transparent border; figures are contained in a 232px envelope with a common bottom anchor. Export used original sheet pixels and nearest-neighbour resizing, not a generated recreation or an opaque black background.

## Exact gameplay mappings

| Artwork pair | Gameplay classes |
| --- | --- |
| Captain illustration | Swordsman (this does not add a commander or rename the class) |
| Ranger | Archer, Ranger, Scout |
| Priest | Field Chaplain |
| Shield infantry | Shield Infantry, Man-at-Arms |
| Spearman | Spearman |
| Lancer with horse | Lancer |
| Crossbowman | Crossbowman |
| Field medic | Field Medic |
| Halberdier | Halberdier |
| Banner captain | Banner Captain |
| Heavy cavalry with horse | Heavy Cavalry |
| Veteran guard | Royal Guard |

The exact whitelist prevents a mounted archer becoming a lancer, an engineer becoming a crossbowman, or a two-handed sword promotion becoming a shield soldier. Recruit, Militia and unsupported classes keep their old production or code-rendered fallback. Elven/Orc classes, fantasy units, and authored enemies/bosses are not replaced. Multiple squads of the same supported class share an archetype portrait; these are not unique character portraits.

## Runtime wiring

- `portraitBattle/humanArt.ts` owns the pure faction/class/role mapping and framing metadata.
- `portraitBattle/model.ts` resolves approved portrait keys only after excluding magic/flying/large/construct/beast metadata. Each portrait has a matching battlefield figure.
- `portraitBattle/Art.tsx` uses the existing static-image renderer, zero fade, and existing-class fallback on missing/decode-error sources.
- `gameArt.tsx` uses the same exact Human figure mapping in `UnitSprite`, so Army, Formation and other existing unit displays benefit too. The old production files stay available as fallbacks.
- PortraitBattleView requests `preferHumanArt={false}` in its fallback element: an image error must not re-request the same failed new image.
- Formation coordinates, token size, shared army HP, combat values, rewards, save state, enemy targeting, timers, screen orientation and Pure Black theme are unchanged.

## Source provenance and validation

`assets/game/battle_portraits/human/manifest.json` records each source conversation file ID/SHA256, crop bounds, visible-content bounds, final path and final SHA256. Source-sheet subjects were isolated by alpha components to keep long cavalry lances intact instead of cutting them at artificial grid boundaries. Small detached edge pixels within four source pixels were retained. Bust portraits can naturally crop shoulders or held equipment; complete battlefield figures are contained inside their source images and all exported frames.

The full existing PNG decoder checks all registered images. `scripts/human-art-regression.ts` verifies all 24 files and 15 mappings, complete pairs, original export hashes, safe framing, faction/fantasy exclusions, role compatibility, missing-image fallback and reloading after promotion to another image. Existing exhaustive three-rank formation and UI regression suites remain unchanged except for Archer's new expected portrait key.

Native release APK compilation/emulator review must be verified separately before merge. Automated decoding and mapping checks alone are not proof of appearance or physical-device performance. Facing-direction animation sheets and additional class-specific art remain separate future work.
