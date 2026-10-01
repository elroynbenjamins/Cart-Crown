# Human battlefield concept pass

## Implemented
- The 12 approved Human portrait/figure pairs are supplied by PR #110, with explicit mappings for 15 existing classes.
- Six early Human road encounters now use one full illustrated Greenkeep Road scene as the primary battlefield background. It is bundled as a 512×341 mobile JPEG and rendered once with `cover`, so there are no repeated ground seams.
- The previous cropped-sky + reflected-ground treatment remains a second fallback. If that also fails, the established regional backdrop remains visible. Other factions, regions, bosses and fantasy-threat encounters are unaffected.
- All nine formations retain their saved row/slot identities. Larger figures, actual allied level badges, clearer class captions, ground selection rings and stronger contact shadows remain from the first polish pass.
- Pure Black, top enemy/bottom ally portrait rails, shared army HP, 1×/2× speed, pause gates and fixed outcome controls are unchanged.
- No new dependency, animation clock, combat formula, progression rule, reward, save-schema or orientation change.

## Validation
The illustrated-field regression now covers the full scene file contract, encounter/faction/fantasy gating, all opposing formation clearances, full-scene rendering across all themes, one-bitmap usage, `cover` scaling, legacy Greenkeep fallback and final regional fallback.

Dependency-resolved CI and native Android validation are required before merge. A successful early Human native route does not imply dense bosses, defeat flow, every promoted class or physical-device frame-rate has been profiled.

## Art still to do
The next Human art pass is dedicated combat-facing figures: enemy-facing/front-facing and allied-facing/back/three-quarter poses for infantry, ranged, support and mounted archetypes. This will let the two armies visibly face the engagement centre instead of relying on the current three-quarter source figures. More bespoke promoted-class portraits can follow after those core directional silhouettes are stable.
