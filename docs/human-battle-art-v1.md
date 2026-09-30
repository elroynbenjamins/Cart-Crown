# Human battle art v1

Implements the approved generated Human art in the existing portrait-first battle UI.
This is an art integration, not a combat, unlock or formation change.

## Shipped class coverage

| Class | Portrait | Battlefield / Army figure |
|---|---|---|
| Man-at-Arms | Blue/gold captain archetype | Sword and shield |
| Ranger | Green hood and quiver | Drawn bow |
| Field Chaplain | Blue/white hooded priest | Staff and support gesture |
| Lancer | Plumed mounted-soldier archetype | Horse and lance |
| Shield Infantry | Helm and blue shield | Armored sword/shield infantry |
| Spearman | Kettle helm and spear | Spear and blue pennant |
| Crossbowman | Kettle helm and quiver | Crossbow firing stance |
| Field Medic | White hood and supplies | Support/healing gesture |
| Halberdier | Mail, helm and polearm | Full halberd |
| Banner Captain | Fur mantle and standard | Sword and tall blue standard |
| Heavy Cavalry | Closed helm and plume | Armored mounted archetype |
| Royal Guard | Veteran shield-bearing archetype | Heavy sword/shield infantry |

These are class illustrations, not equipment paper dolls or personal likenesses of
named recruits. The generated Heavy Cavalry illustration carries a lance as well
as depicting an armored rider; its in-game sword-based promotion requirements
have NOT been changed. This is a presentation limitation for a later exact-gear
art pass, not a different weapon unlock.

The Human art resolver requires exact class + faction + role and excludes magic,
flying, large, construct and beast tags. Other classes keep their existing
portrait/fallback behavior. Elf/Orc units and all enemy/boss art are unchanged.
No broad 'ranged means archer' or 'support means priest' override is introduced
for these new entries. Existing generic fallback archetypes are preserved only
for classes not covered by this batch.

## Runtime assets

- Twelve 256x256 RGBA portraits under `assets/game/battle_portraits/human_v1/`.
- Twelve corresponding figures replace their existing `assets/game/units/human/`
  PNGs. The battle-figure registry aliases the same physical file, so global
  `UnitSprite` users and combat use the same figure without duplicate PNG copies.
- Portrait alpha is inset by at least 8px; unit figures by at least 12px.
- At most one image per portrait/figure; no new clocks, shaders or dependencies.
- Normal missing/decode-error fallbacks remain active.
- Full formation rank/slot positioning, shared HP, controls and black theme are
  unchanged. No class is granted early and no save record is altered.

The original four sheets were separated by their actual alpha components rather
than equal grid cuts: mounted units and long weapons extend across grid columns.
Associated antialias fringe pixels within 12 source pixels were retained, then
assets were tightly cropped and fitted using nearest-neighbour resampling. See
`manifest.json` for source SHA256, source crop bounds, output bounds and byte hashes.
Original source sheets are retained in the conversation implementation pack, not
bundled in the APK. They are not repainted or generated again for integration.

## Checks

`npm run art:check` now also verifies these exports' full decoded alpha bounds and
checksums. The existing portrait CI gate imports `human-battle-art-regression.ts`
for exact class/faction/role/tag mapping, paired shared image registrations and
144 small/full art-frame render cases including missing/decode-error fallbacks.
Existing exhaustive stable-slot geometry tests remain intact.

The paired asset contact sheet was visually checked on black/charcoal at 200px
and 56px portrait / 40px figure examples. This does not prove device frame rate.
A normal native smoke pass exercises the existing first Human battle and packages
all new art; it does not by itself prove a native playthrough of every later class.
