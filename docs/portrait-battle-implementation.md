# Portrait formation battlefield

Portrait orientation is unchanged. Enemy portraits sit at the top; allied portraits sit below the full-width battlefield. Both portrait rails scroll horizontally. Only battle hides the outer shell header/progress strip to reclaim vertical space. Native safe-area handling remains in App/AndroidWindowFrame.

## Formation geometry

stageTokens derives each point from the saved FormationShapeDefinition.rows and each slot index within its complete rank. It does not spread surviving or occupied squads. All nine shapes therefore retain their actual front/middle/rear geometry, including 5-2-2, 2-2-5, 4-3-2, 2-5-2 and 5-3-1. Enemy ranks mirror the player's point of view; both frontlines face the engagement area. Empty positions stay blank; routed enemies remain dimmed in place.

Portrait tap locates the matching real slot, and long press opens squad details. Selection does not alter combat targets, slots, time or damage. Shared army HP is displayed once per side; there are no invented per-unit health bars or unit damage contributions. Logs record aggregate army exchanges.

## Controller integration

The existing damage, progression, commander, readiness and enemy-fantasy calculations stay in BattleScreen. Only presentation is replaced. Pause gates the existing exchange timer; tutorial and background pauses cannot be overridden by the UI. Completion and wear remain guarded by the existing one-shot gate. Results/Defeat Report callbacks retain the complete summary payload. The outcome footer is outside the scroll container.

## Artwork

The original 15 PNGs are copied byte-for-byte from the approved conversation implementation pack, not re-encoded or manually transcribed. Their manifest records hashes and provenance. Conventional Human/raider portraits are a small archetype library. Other factions, mounts, magic/large/flying/hybrid units and named bosses retain their specific existing art. The reference characters remain three-quarter/side-facing artwork; a future directional-art pass can improve facing without altering formation geometry. The three scenery assets are retained for future composition; the current battlefield retains region/faction/boss atmosphere rather than using Greenkeep everywhere.

## Verification

The portrait regression exercises all 512 occupancy masks for each formation and side across phone widths, heights and text scales, collision bounds with mounted overscale, enemy mirroring, actual component ordering, rail selection, fixed footer, live pause/completion wiring and fantasy forwarding. Source-model checks are not a substitute for native build/capture review. Native workflow runs on these UI/controller changes.
