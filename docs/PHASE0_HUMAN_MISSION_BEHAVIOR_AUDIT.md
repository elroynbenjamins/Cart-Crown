# Phase 0 — Human Chapters 1–4 mission behavior reconciliation

**Audited:** 2026-10-22, against main starting at `20126e6fcbf1f30772a487e5f8d4e02cd483dfbd`. **Evidence standard:** source-level routing and completion-handler inspection, plus `scripts/human-mission-route-regression.ts`. This is NOT a manual 70-mission playthrough or proof of fully balanced gameplay.

## Findings

All **19** differences between the canonical design roadmap's `kind` and Chapter 1–4 live node `type` have a traceable production route or a deliberately separate promotion UI. No duplicate campaign node is required. All retain their current saved `node_X` / `chX_node_Y` IDs. Source checks protect the campaign action, AppShell flow, GameProvider completion/encounter branch and notable effect; they cannot demonstrate the result on a physical device.

### Classification

| Mission | Design → live | Actual gameplay entry → completion | Assessment |
| --- | --- | --- | --- |
| Ch1 M3 Rebuild the Barracks | upgrade → event | Marked Raiders → `completeMarkedRaiders`; unlocks Forge and advances | **Redesigned story beat**, no additional building-upgrade node required |
| Ch1 M4 Spears at Dawn | battle → event | Forge/Promotion UI → `promoteMira` → M5 | **Redesigned tutorial beat**; must not add an unrelated battle |
| Ch1 M5 Cut Off the Captain | battle → elite | Mercenary Patrol battle → commander-choice unlock | **Presentation vocabulary** (elite encounter) |
| Ch1 M6 The Broken Road | battle → supply | Refugee Camp event → `completeRefugeeCamp` and resources | **Redesigned supply beat** |
| Ch2 M1 Strength in Numbers | battle → event | Fort Muster → `chooseFortRecruit` | **Redesigned recruitment beat**; 3-squad cap already active |
| Ch2 M2 Tools of War | upgrade → battle | Iron Road Skirmish → mine resource-site unlock | **Design-intent drift**: older crafting/upgrade lesson does not automatically resolve in this node |
| Ch2 M4 No Army Fights Forever | battle → elite | Kingdom Defense screen → `completeKingdomDefense` with first-clear rewards | **Redesigned side-mode defense**; current `elite` card label may be confusing |
| Ch2 M5 The Long Way Around | battle → event | Broken Signal Tower → quarry and signal network unlock | **Redesigned infrastructure beat**, no separate flank battle |
| Ch2 M7 Supplies for War | event → supply | Timber Claim event → Greenwood camp unlock | **Presentation vocabulary** (supply event) |
| Ch3 M1 Into Frostmarch | story → event | Marcher Envoy → `chooseMarcherAuxiliary` | **Redesigned chapter-opening recruitment** |
| Ch3 M3 Frozen Steel | upgrade → battle | Froststeel encounter → resources and M4 | **Design-intent drift**: this does not automatically perform the old upgrade lesson |
| Ch3 M5 Choose Your Rider | choice → event | Three Warnings → `chooseMarcherWarning`; persists rider doctrine ID | **Presentation vocabulary** (choice rendered as event) |
| Ch3 M6 The Line Buckles | battle → elite | Siege Road battle → M7 | **Presentation vocabulary** (elite encounter) |
| Ch4 M2 Raise Another Banner | upgrade → battle | Broken Standards battle → M3; active squad cap increases after M2 | **Redesigned squad-unlock beat** |
| Ch4 M3 Two Ways to War | choice → event | Commander choice screen → `chooseCommanderPath` → M4 | **Presentation vocabulary** (choice rendered as event) |
| Ch4 M5 Hold the Breach | battle → elite | Crownroad Ambush battle → M6 | **Presentation vocabulary** (elite encounter) |
| Ch4 M6 Prepare for Battle | upgrade → event | Empty Throne narrative event → salvage-yard unlock | **Design-intent drift**: prior generic preparation upgrade is not the live event |
| Ch4 M8 Veteran Steel | upgrade → event | Stronghold Muster → `chooseStrongholdRecruit` → M9 | **Redesigned roster beat**; recruit ≠ sixth active slot (that unlocks Ch5 M2) |
| Ch4 M10 The Forked Banner | choice → event | Last Loyalists → `chooseLastLoyalistsApproach` persists approach ID | **Presentation vocabulary** (choice rendered as event) |

**Important distinction:** `ChapterNode.type` is partly a card/icon/interaction category, whereas design `CampaignMissionKind` describes the initially planned lesson or format. A mismatch does not establish failure. Conversely, a valid route does not prove the exact design lesson was taught.

## Changes made in this pass

1. Added `human-mission-routes:check` to `package.json` and CI. It compares all 19 exact node IDs and runtime types, asserts the matching Campaign action / AppShell entry, and checks the associated GameProvider encounter or event completion path. It also fails on any **new unclassified** design/runtime difference.
2. Guarded `completeMarkedRaiders`, `promoteMira` and `chooseFortRecruit` so stale screens or out-of-order calls cannot advance the wrong faction/chapter/mission. They must be invoked in the correct live Human node. This intentionally does not change normal progression or saved ID fields.
3. Preserved every current source `kind`, legacy design intent and node name in the roadmap for traceability, rather than silently rewriting them to make the count look reconciled.

## Further work / acceptance boundaries

- **Interactive test still required:** use seeded debug-only saves / native emulator to complete the first four chapters and confirm selected doctrine persistence, rewards exactly once, chapter gates, equipment/promotion states and full UI Back/resume. The new regression inspects code; it does not mount React or run combat.
- **Design decision:** decide whether to update the old roadmap purpose/unlock wording for Ch2 M2, Ch3 M3 and Ch4 M6, or add separate optional teaching surfaces. Do not force extra battles or requirements into the existing ordered campaign.
- **Presentation improvement candidate:** Ch2 M4 routes to **Kingdom Defense**, yet its original `elite` node type can display “ELITE ENCOUNTER”. Update the card's semantic label/icon through the visual design pass without changing saved node IDs.
- **No automatic migration:** all initial Chapter 1–4 IDs remain untouched; no save schema changes; no army/encounter balance changes.
- **Completion gate:** this audit is **source verified / automated CI guarded**, not Android manually accepted. Issue #205 remains open for device/integration-level proof.
