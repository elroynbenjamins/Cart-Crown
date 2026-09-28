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

Chapter 3 is now a complete playable progression arc:

1. **Marcher Envoy** — choose the fifth squad:
   - Halberdier — control/frontline
   - Field Chaplain — morale/support
   - Border Ranger — mobile skirmisher
2. **Border Fort** — first battle inside the divided Border Marches
3. **Three Warnings** — choose one Chapter 3 operational doctrine:
   - Fortify the Supply Route → +10% armor
   - Hunt the False Couriers → +8% attack and +3% speed
   - Verify Every Beacon → detailed intel and +5% speed
4. **Siege Road** — elite battle using the chosen doctrine
5. **The Divided March** — reconcile the marcher captains and unlock the Marcher Supply Depot
6. **Lord Marshal Veyr** — Chapter 3 boss
7. Meet infrastructure requirements and build **Greenkeep Stronghold**

The Marcher Supply Depot adds +6 Gold and +2 Provisions per meaningful activity.

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


## Settlement adjacency design

Settlement adjacency is now fully active and reversible.

Only orthogonal neighbors count. Relocating a building is free and preserves all levels.

Current districts:
- Arsenal District — Barracks + Forge
- Supply Yard — Wagonwright + Quartermaster
- Mounted Drill Yard — Barracks + Stable
- Command Network — War Room + Signal Tower
- Seat of Command — Hall + War Room

Settlement View previews potential district bonuses before construction and lists all active district effects.


## Stronghold tier

Defeating Lord Marshal Veyr unlocks the Stronghold project.

Requirements:
- Barracks Lv.4
- Forge Lv.4
- Wagonwright Lv.4
- War Room Lv.3
- Quartermaster Lv.3
- Stable Lv.2
- Signal Tower Lv.2
- 400 Gold
- 180 Wood
- 140 Stone
- 40 Iron

Stronghold construction:
- raises Greenkeep Hall to Lv.5
- expands the Wagon from 5×6 to **6×7**
- raises active squad capacity from 5 to **6**
- begins Chapter 4 / **The Broken Crown**

Building upgrade levels are now capped by settlement tier, so Stronghold-tier infrastructure cannot be pre-built while Greenkeep is still a Settlement/Fort.


## Chapter 4 — The Broken Crown

The Stronghold tier now begins a new playable campaign slice:

1. **Stronghold Muster** — choose the sixth and final active squad:
   - Royal Guard — elite frontline
   - Siege Engineer — heavy ranged
   - Banner Captain — command support
2. **Broken Standards** — first six-squad Stronghold battle
3. **The Empty Throne** — discover that royal military orders continued after the court stopped functioning
4. **Crownroad Ambush** — elite six-squad encounter
5. The Last Loyalists — next story expansion
6. The Pretender General — future Chapter 4 boss

The Empty Throne also unlocks the **Crownroad Salvage Yard**, adding +4 Wood and +3 Iron per meaningful activity.

## Stronghold equipment tier

Forge III / Barracks IV / Stronghold infrastructure now supports a new equipment tier:

- Steel Sword → Tempered Steel Sword
- Greatsword → Royal Greatsword
- Longbow → Warbow
- Chainmail → Heavy Plate
- Kite Shield → Tower Shield
- Trained Horse → Veteran Warhorse

These remain equipment upgrades first; they do not automatically change class.

New elite class branches include:
- Shield Infantry + Tower Shield + Heavy Plate → **Royal Guard**
- Greatswordsman + Royal Greatsword → **Champion**
- Longbowman + Warbow → **Marksman**
- Cavalryman + Veteran Warhorse + Heavy Plate + Tempered Steel Sword → **Heavy Cavalry**

Elite promotions also require a constructed **Officer Academy**.

## Officer Academy

The Stronghold unlocks Greenkeep’s ninth building blueprint: **Officer Academy**.

It supports elite-unit training and has a Stronghold-specific adjacency:

- **War Room + Officer Academy → General Staff**
  - commander skill triggers one exchange earlier

This is intentionally different from a generic percentage increase: settlement layout changes when the commander’s signature ability enters the battle.


## Chapter 4 climax — The Last Loyalists

After Crownroad Ambush, the player chooses how Greenkeep handles the remaining royal loyalists before the Pretender General fight:

- **Offer Amnesty**
  - +10% armor against the Pretender General
- **Publish the Royal Seals**
  - detailed boss intelligence
  - -20% enemy retaliation
- **Seize the Loyalist Arsenal**
  - +10% attack against the Pretender General

This is a one-boss tactical preparation choice, not a permanent account build.

## The Pretender General

The Pretender General is now the Chapter 4 boss.

Defeating him breaks the last organized royal command in the western realm and unlocks the **Greenkeep Capital** project.

Capital requirements:
- Barracks Lv.5
- Forge Lv.5
- Wagonwright Lv.5
- War Room Lv.4
- Quartermaster Lv.4
- Stable Lv.3
- Signal Tower Lv.3
- Officer Academy Lv.2
- 650 Gold
- 280 Wood
- 220 Stone
- 70 Iron

Capital construction:
- raises Greenkeep Hall to Lv.6
- expands the Wagon from 6×7 to **7×8**
- keeps the six-squad cap
- begins Chapter 5 / **Old Royal Lands**
- unlocks **Royal Decrees**

## Royal Decrees

Capital introduces one active policy at a time.

The first decree is free. Replacing it later costs 100 Gold.

- **Royal Muster**
  - +7% army attack
  - +7% army armor
- **Provincial Tithe**
  - +25% regional production from meaningful activities
- **Masterwork Commission**
  - -12% equipment crafting and upgrade costs

Royal Decrees are deliberately mutually exclusive so Capital becomes a strategic priority choice instead of another stack of passive bonuses.

## Chapter 5 — Old Royal Lands

The first Capital-era nodes are now connected:

1. **Capital Council** — choose the first Royal Decree
2. **Old Royal Lands** — first battle under Capital administration
3. **Broken Archives** — next story expansion
4. Ashen Envoy
5. The Royal Ledger
6. Gate of Crownspire

The Old Royal Lands battle is the first encounter that can immediately demonstrate the new decree system.


## Chapter 5 — Old Royal Lands complete

The Capital-era Human campaign is now playable through Crownspire:

1. **Capital Council**
   - choose the first Royal Decree
2. **Old Royal Lands**
   - first Capital battle
3. **Broken Archives**
   - recover records showing the same ash-marked alterations across multiple years
   - unlock **Royal Archive Stores**
   - +8 Gold and +2 Stone per meaningful activity
4. **Ashen Envoy**
   - first direct battle against the Ashen Court
5. **The Royal Ledger**
   - explicitly identifies the Ashen Court as the network behind the false flags, marcher warnings and manipulated royal command
6. **Gate of Crownspire**
   - Chapter 5 boss
   - opens the western approach to Crownspire

## Grand Campaign tier

Defeating the Gate of Crownspire unlocks the final Human logistics project.

Requirements:
- Barracks Lv.5
- Forge Lv.5
- Wagonwright Lv.5
- War Room Lv.5
- Quartermaster Lv.5
- Stable Lv.4
- Signal Tower Lv.4
- Officer Academy Lv.3
- one active Royal Decree
- 1000 Gold
- 420 Wood
- 360 Stone
- 120 Iron

Grand Campaign construction:
- expands the Wagon from 7×8 to **7×9**
- keeps the six-squad combat cap
- keeps Royal Decrees active
- begins Chapter 6 / **Return to Crownspire**

## Chapter 6 — Return to Crownspire

The final Human campaign structure is prepared:

1. Grand Council
2. Sundered Fields
3. Concord Vault
4. Ashen Court
5. The Forced Beacon
6. Return to Crownspire

This chapter is designed to resolve the Human perspective on the Crownfall, recover the Human Oath Seal, and set up the later multi-faction Three Seals campaign.
