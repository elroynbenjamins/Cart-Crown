# Cart & Crown

Cart & Crown is a portrait-first mobile strategy RPG built around **Kingdom progression, a 3×3 combat Formation, a limited logistics Wagon, persistent troop equipment, faction-specific command styles, and a visible growing settlement**.

## Current prototype

- **2 independent save slots**, autosaved locally.
- Current development saves use one clean schema; backwards migration code has been removed because the game has not shipped yet.
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

## Visual settlement building

Greenkeep now has a dedicated **Settlement View**.

It uses a fixed 3×3 board rather than a free-roaming city-builder:

- Camp: 4 usable plots
- Settlement: 6 usable plots
- Fort: 9 usable plots

Starting structures:
- Hall
- Barracks
- Wagonwright

Story milestones unlock **building blueprints**, not free buildings. The player then opens Settlement View, taps an empty plot, pays the construction cost and places the building.

Examples:
- Marked Raiders → Field Forge blueprint
- Commander milestone → War Room blueprint
- Refugee Camp → Quartermaster blueprint
- Greenkeep Fort → Stable blueprint

Building placement is intentionally cosmetic/organizational for now. The gameplay effect comes from what is built and its level, so players cannot accidentally ruin a save with a bad layout. Adjacency/district bonuses can be added later if the settlement layer proves fun.

## Human progression implemented

### Chapter 1 — The Last Wagon
1. Hold the Road
2. Greenkeep Settlement
3. Marked Raiders
4. Build Field Forge
5. First weapon / Mira promotion
6. Mercenary Patrol
7. Commander specialization
8. Refugee Camp / Quartermaster
9. Toll Captain
10. Build Greenkeep Fort

### Chapter 2 — The Iron Road
1. Fort Muster — choose a fourth active squad
2. Iron Road Skirmish — secure the Iron Hills Mine
3. Timber Claim — secure the Greenwood Timber Camp
4. Kingdom Defense — survive three waves
5. Broken Signal Tower — next story expansion
6. The Iron Provost — future Chapter 2 boss

## Stable and first cavalry path

Greenkeep Fort unlocks the **Stable blueprint**. After the player constructs Stable Lv.1, a Trained Horse becomes available.

> Scout + Trained Horse → **Scout Rider**

Scout Rider is the first true cavalry class and can later branch into Cavalryman, Lancer or Mounted Archer.

## Regional production

Fort-tier territory can produce resources after meaningful activities instead of background timers.

Current sites:
- Greenkeep Farms — +6 Provisions per activity
- Iron Hills Mine — +2 Iron per activity
- Greenwood Timber Camp — +5 Wood per activity

Campaign battles, Expeditions and Kingdom Defense advance production. Stock accumulates separately and can be claimed from the Kingdom screen.

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

Temporary letters and emoji are placeholders for the final portrait/equipment/settlement art pipeline.
