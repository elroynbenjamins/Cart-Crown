# Human battlefield concept pass

## Implemented
- The 12 approved Human portrait/figure pairs are supplied by PR #110, with explicit mappings for 15 existing classes. This pass builds on that integration.
- Six early Human road encounters use the existing cropped Greenkeep skyline and ground art. The floor repeats a small texture at its native aspect ratio, joining reflected vertical edges to avoid cut bands, with a neutral dimming layer; this is an initial illustrated surface, not a new full-scene painting.
- Other factions, regions, all bosses and fantasy-threat encounters retain their previous regional/boss backdrops. Missing images or load errors reveal the underlying backdrop.
- All nine formations retain their saved row/slot identities. Slightly tighter centre spacing gives more height to the ranks and allows larger figures, while geometry checks preserve mount/motion clearance even across opposing armies.
- Allied portraits show actual levels; class captions increase from 10 to 11 points. Selection uses a ground ring rather than a full sprite box, and stronger contact shadows help ground the figures.
- No new image assets, dependencies or animation clocks. No combat rules, statistics, rewards, persistence, orientation, safe-area handling or outcome-footer behavior changed.

## Validation
Local execution of every repository regression script passed. Portrait regression retains 4,682,140 checks; the new illustrated-field regression adds 248,948 checks covering encounter/faction/fantasy boundaries, texture count/aspect, both opposing formations, actual TSX scenery composition, all three themes, and load-error fallback. Full PNG decode passed for 124 registered game images.

Dependency-resolved CI and native Android verification are required before merging. Local TypeScript execution is not a substitute for a full typecheck. Native early-campaign tests do not imply all promoted Human classes, dense bosses, defeat flow or physical-device performance were tested.

## Art still to do
The live field reuses the supplied three-quarter figures and cropped scenery. Dedicated front/back-facing poses and seamless full-region battlefield illustrations are still needed to match the concept more closely. Unsupported classes and opening recruits keep their existing art; they are not silently given a different class's elite equipment.
