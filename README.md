# Cart & Crown

Cart & Crown is a portrait-first mobile strategy RPG built around **Kingdom progression, a visible settlement, a 3×3 combat Formation, a limited logistics Wagon, persistent troop equipment, faction-specific command styles, and regional development**.

## Current prototype

- **2 independent local save slots**
- Clean development save schema; no backwards migration system is maintained before release
- Human campaign is the required first playthrough
- Original / Dark / Light themes
- Fixed visual settlement board with purchasable/placeable buildings
- 3×3 combat Formation with army capacity growing from 2 to 6 squads
- Persistent unit equipment: weapon, armor, shield, mount and artifact
- Human Orders, Elven Wards and Orc Momentum
- Three commander specializations per faction
- Expeditions, Formation Trials and Kingdom Defense
- Optional rewarded-ad adapter; development builds use mock rewards

## Visual settlement

The player can now open **Settlement View** and see Greenkeep physically grow.

The board is intentionally structured and Codex-friendly rather than a freeform 3D city-builder:

- Camp: 4 usable plots
- Settlement: 6 usable plots
- Fort: 8 usable plots
- Town: 9 usable plots

Hall, Barracks and Wagonwright begin on the board. Other buildings are unlocked as blueprints by story milestones and then must be purchased and placed by the player.

Examples:

- Marked Raiders → Field Forge blueprint
- Commander milestone → War Room blueprint
- Refugee Camp → Quartermaster blueprint
- Fort → Stable blueprint
- Broken Signal Tower → Signal Tower blueprint

Placement is visual/organizational for now. Gameplay effects come from the building type and level, so the player cannot permanently damage a save by choosing the “wrong” plot.

## Human progression

### Chapter 1 — The Last Wagon

1. Hold the Road
2. Greenkeep Settlement
3. Marked Raiders
4. Buy/place Field Forge
5. First equipment and Mira promotion
6. Mercenary Patrol
7. Commander specialization
8. Refugee Camp / Quartermaster
9. Toll Captain
10. Build Greenkeep Fort

### Chapter 2 — The Iron Road

1. Fort Muster — choose a fourth squad
2. Iron Road Skirmish — secure Iron Hills Mine
3. Timber Claim — secure Greenwood Timber Camp
4. Kingdom Defense
5. Broken Signal Tower
6. The Iron Provost
7. Meet infrastructure requirements and build Greenkeep Town

### Chapter 3 — Border Kingdoms

A six-node campaign skeleton is prepared beginning with **Marcher Envoy**. Full Chapter 3 encounters are the next story expansion.

## First cavalry tree

After building Stable Lv.1:

> Scout + Trained Horse → **Scout Rider**

Scout Rider then has three equipment-driven branches:

- Scout Rider + Iron Sword → **Cavalryman**
- Scout Rider + Cavalry Lance → **Lancer**
- Scout Rider + Rider Bow → **Mounted Archer**

The mount remains assigned equipment throughout the branch.

## Signal Tower

Broken Signal Tower unlocks a placeable **Signal Tower** and the **Old Signal Quarry** regional site.

Signal Tower Lv.2 provides permanent detailed Battle Prep intelligence. Once built, players no longer need an optional Scout Report ad to reveal exact enemy information.

## Regional production

Current Human production sites:

- Greenkeep Farms — +6 Provisions per activity
- Iron Hills Mine — +2 Iron per activity
- Greenwood Timber Camp — +5 Wood per activity
- Old Signal Quarry — +3 Stone per activity

Campaign battles, Expeditions and Kingdom Defense advance one production cycle. Stock is claimed manually from the Kingdom screen.

## Town tier

Defeating the Iron Provost unlocks the Town project.

Requirements:

- Barracks Lv.3
- Forge Lv.3
- Wagonwright Lv.3
- Stable Lv.1
- Signal Tower Lv.1
- 250 Gold
- 120 Wood
- 80 Stone
- 25 Iron

Town construction:

- raises Hall to Lv.4
- expands Wagon from 5×5 to **5×6**
- raises active squad capacity from 4 to **5**
- unlocks the final settlement-board plot
- begins Chapter 3 / Border Kingdoms

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

Temporary letters and emoji are placeholders for the final portrait, equipment, world-map and settlement artwork.
