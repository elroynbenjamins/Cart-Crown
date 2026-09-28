# Cart & Crown

Cart & Crown is a portrait-first mobile strategy RPG built around **Kingdom progression, a visible settlement, building adjacency districts, a 3×3 combat Formation, a limited logistics Wagon, persistent troop equipment, faction-specific command styles, and regional development**.

## Current prototype

- **2 independent local save slots**
- Clean development save schema; backwards migration code is not maintained before release
- Human campaign is the required first playthrough
- Original / Dark / Light themes
- Fixed visual settlement board with purchasable/placeable/movable buildings
- Positive-only settlement adjacency bonuses
- 3×3 combat Formation with army capacity growing from 2 to 6 squads
- Persistent unit equipment: weapon, armor, shield, mount and artifact
- Human Orders, Elven Wards and Orc Momentum
- Three commander specializations per faction
- Expeditions, Formation Trials and Kingdom Defense
- Optional rewarded-ad adapter; development builds use mock rewards

## Visual settlement

Greenkeep uses a structured settlement board:

- Camp: 4 usable plots
- Settlement: 6 usable plots
- Fort: 8 usable plots
- Town: 9 usable plots

Buildings are unlocked as blueprints through story progression, then purchased and placed by the player.

Constructed buildings can be **relocated freely** between unlocked empty plots. Building levels are preserved.

### Adjacency / district bonuses

Only orthogonal adjacency counts: up, down, left and right. Diagonals do not.

Current Human district recipes:

- **Barracks + Field Forge → Arsenal District**
  - 10% lower equipment crafting and upgrade costs
- **Wagonwright + Quartermaster → Supply Yard**
  - +3 Wood and +2 Provisions from Expeditions
  - +5 Provisions from Daily Supply
- **Barracks + Stable → Mounted Drill Yard**
  - 15% lower mount crafting costs
- **War Room + Signal Tower → Command Network**
  - +15% commander skill power
  - detailed Battle Prep intelligence
- **Greenkeep Hall + War Room → Seat of Command**
  - -15 Gold commander retraining cost

Bonuses are positive-only. A poor layout never applies a penalty; it simply misses an optional district benefit.

Settlement View shows:
- active district bonuses
- all district recipes
- potential bonuses before constructing a building
- free building relocation

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
A six-node campaign skeleton is prepared beginning with **Marcher Envoy**.

## Cavalry progression

After constructing Stable Lv.1:

> Scout + Trained Horse → **Scout Rider**

Scout Rider then branches through assigned equipment:

- Scout Rider + Iron Sword → **Cavalryman**
- Scout Rider + Cavalry Lance → **Lancer**
- Scout Rider + Rider Bow → **Mounted Archer**

The **Mounted Drill Yard** adjacency reduces mount costs, making Barracks/Stable placement relevant to cavalry-heavy builds.

## Signal Tower and Command Network

Signal Tower Lv.2 permanently reveals detailed Battle Prep information.

Alternatively, placing the Signal Tower beside the War Room creates **Command Network**, which:
- provides detailed enemy intelligence immediately
- increases automatic commander-skill power by 15%

This gives settlement placement a direct combat-preparation effect.

## Regional production

Current Human production sites:

- Greenkeep Farms — +6 Provisions per activity
- Iron Hills Mine — +2 Iron per activity
- Greenwood Timber Camp — +5 Wood per activity
- Old Signal Quarry — +3 Stone per activity

Campaign battles, Expeditions and Kingdom Defense advance one production cycle. Stock is claimed manually from the Kingdom screen.

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

Temporary letters and emoji are placeholders for final portrait, equipment, world-map and settlement artwork.
