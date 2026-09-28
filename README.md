# Cart & Crown

Cart & Crown is a portrait-first mobile strategy RPG built around **Kingdom progression, a 3×3 combat Formation, a limited logistics Wagon, persistent troop equipment, faction-specific command styles, and regional development**.

## Current prototype

- **2 independent save slots**, autosaved locally.
- Save schema v5 stores separate Human / Elf / Orc states plus shared unlocks.
- Older development saves migrate automatically.
- Human campaign is the required first playthrough.
- Original / Dark / Light themes.
- 3×3 formation board with army capacity growing from 2 to 6 squads.
- Persistent per-unit loadouts: weapon, armor, shield, mount and artifact.
- Equipment upgrades can improve a class without changing it.
- Advanced promotions require gear combinations plus Kingdom building levels.
- Human Orders, Elven Ward rules and Orc Momentum rules.
- Three commander specializations per faction.
- Expeditions, Formation Trials and Kingdom Defense.
- Optional rewarded-ad placements through one provider adapter; development uses mock rewards.

## Human progression implemented

### Chapter 1 — The Last Wagon
1. Hold the Road
2. Greenkeep Settlement
3. Marked Raiders
4. First weapon / Mira promotion
5. Mercenary Patrol
6. Commander specialization
7. Refugee Camp / Quartermaster
8. Toll Captain
9. Build Greenkeep Fort

### Chapter 2 — The Iron Road
Fort construction now begins the next progression tier:

1. **Fort Muster** — choose a fourth active squad:
   - Crossbowman
   - Man-at-Arms
   - Scout with cavalry potential
2. **Iron Road Skirmish** — secures the Iron Hills Mine.
3. **Timber Claim** — secures the Greenwood Timber Camp.
4. **Kingdom Defense** — survive three consecutive defense waves.
5. Broken Signal Tower — next story expansion.
6. The Iron Provost — future Chapter 2 boss.

## Stable and first cavalry path

Greenkeep Fort unlocks **Stable Lv.1**.

The Stable can produce a **Trained Horse**. Assigning the horse to any Human Scout opens:

> Scout + Trained Horse → **Scout Rider**

Scout Rider becomes the first true cavalry class and can later branch into Cavalryman, Lancer or Mounted Archer.

## Regional production

Fort-tier territory can produce resources after meaningful activities instead of using background timers.

Current sites:

- **Greenkeep Farms** — +6 Provisions per completed activity.
- **Iron Hills Mine** — +2 Iron per completed activity.
- **Greenwood Timber Camp** — +5 Wood per completed activity.

Campaign battles, Expeditions and Kingdom Defense advance production. Stock accumulates separately and is claimed from the Kingdom screen.

## Kingdom Defense

Kingdom Defense becomes available during Chapter 2 and remains repeatable afterward.

The current first defense uses three escalating waves:

1. Road Raiders
2. Mercenary Bowline
3. Green Banner Assault

Defense Power is calculated from:
- active squad stats
- formation attack/armor synergies
- commander specialization bonuses

If the player's Defense Power is below the next wave's threat, they are encouraged to improve formation, equipment or Kingdom infrastructure before retrying.

## Kingdom building

Campaign milestones unlock opportunities; Kingdom investment turns them into permanent systems.

Current Human buildings:
- Greenkeep Hall
- Barracks
- Field Forge
- Wagonwright
- Quartermaster
- War Room
- Stable

Examples:
- Barracks II unlocks advanced troop branches.
- Forge II unlocks Tier II equipment.
- Wagonwright II improves Expedition supply recovery.
- Quartermaster II improves provisions and grants another base Expedition Ticket.
- War Room II reduces commander retraining cost.
- Stable I unlocks mount production and Scout Rider progression.

## Tech

- Expo SDK 57
- React Native 0.86
- React 19.2
- TypeScript
- AsyncStorage local persistence

## Run

```bash
npm install
npm run start
npm run android
npm run typecheck
```

Temporary letters and emoji are placeholders for the final portrait/equipment art pipeline.
