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


## Chapter 6 — Return to Crownspire complete

The final Human campaign is now fully playable:

1. **Grand Council**
   - confirms the final objective
   - grants +50 Gold and +30 Provisions
   - keeps the current Royal Decree active
2. **Sundered Fields**
   - first Grand Campaign battle inside the Crownspire approaches
3. **Concord Vault**
   - proves the Concord Beacon was maintained jointly by Humans, Elves and Orcs
   - unlocks **Concord Vault Cache**
   - +6 Gold, +3 Iron and +2 Provisions per meaningful activity
4. **Ashen Court**
   - elite assault on the Court district inside Crownspire
5. **The Forced Beacon**
   - confirms the Crownfall was caused by the Ashen Court bypassing the three-part Concord safeguards
   - locates the Human Oath Seal
6. **Return to Crownspire**
   - final Human boss against the Ashen Court Regent
   - recovers the Human Oath Seal
   - completes the Human campaign

Completing Humans adds the Oath Seal to shared progress and changes both Elf and Orc campaigns from locked to available in the same save.

The completed Human kingdom remains preserved for revisiting and side activities.


## Same-save faction switching

Completing the Human campaign now unlocks **both Elves and Orcs** in the same save.

The Factions tab provides real actions:
- **Start Elves Campaign**
- **Start Orcs Campaign**
- **Switch to Humans / Elves / Orcs** once that faction state already exists

Each faction has its own independent state inside the save:
- resources
- units
- 3×3 formation
- campaign grid
- chapter nodes
- equipment/loadouts
- progression flags

Switching explicitly saves the current faction first, changes the save's active faction, then remounts the game from the target faction state. Returning to Humans restores the completed Greenkeep kingdom exactly where it was.

## Elf campaign opening

Elves begin fresh at **Heartgrove Refuge** with:
- Liora — Warden
- Cael — Forest Scout
- 4×4 Wayfarer Caravan
- **Open Order** formation doctrine

Their starting formation deliberately keeps the two squads separated to demonstrate **Wards / open-space positioning**.

Chapter 1 begins:
1. The Last Wardstone
2. **Wardbreakers** — playable opening battle
3. Whispering Roots
4. Ashen Tracks
5. Wayfarer Camp
6. The Hollow Warden

## Orc campaign opening

Orcs begin fresh at **Emberclan Camp** with:
- Korga — Youngblood
- Varka — Hunter
- 4×4 War Cart
- **Warband** formation doctrine

Their two starting squads are placed adjacent to demonstrate the opposite tactical instinct: **aggressive adjacency and Momentum**.

Chapter 1 begins:
1. The Accused Clan
2. **Blood on the Red Road** — playable opening battle
3. Broken Clan Marks
4. Invader Scouts
5. Gathering Fire
6. The Blamecaller


## Elf and Orc Chapter 1 complete

Both alternate campaigns now continue beyond their opening battle.

### Elves — Fading Wards
1. The Last Wardstone
2. Wardbreakers
3. **Whispering Roots**
4. **Ashen Tracks** — Elite
5. **Wayfarer Camp**
6. **The Hollow Warden** — Boss

Defeating the Hollow Warden unlocks the Elf commander choice:
- Windcaller
- Thorn Warden
- Moon Seer

### Orcs — Blamed Blood
1. The Accused Clan
2. Blood on the Red Road
3. **Broken Clan Marks**
4. **Invader Scouts** — Elite
5. **Gathering Fire**
6. **The Blamecaller** — Boss

Defeating the Blamecaller unlocks the Orc commander choice:
- Bloodchief
- Warglord
- Warcaller

Both Chapter 1s now have faction-specific evidence, supply rewards, battle results and save-slot objective labels.


## Elf and Orc settlement progression

Alternate factions now grow visible settlements instead of reusing Greenkeep.

### Elves

Chapter 1 completion + an Elf commander allows construction of **Heartgrove Sanctuary**.

The Sanctuary:
- expands the Wayfarer Caravan from 4×4 to 4×5
- raises active squad capacity from 2 to 3
- opens **Sanctuary Muster**
- enables the visual settlement placement screen

Elf buildings:
- Heartgrove Sanctuary
- Warden Lodge
- Moon Forge
- Caravan Grove
- Spirit Stores
- Council Glade
- Stag Enclosure
- Ward Beacon

Elf adjacency:
- Warden Lodge + Moon Forge → **Mooncraft Circle**
- Caravan Grove + Spirit Stores → **Rootway Stores**
- Warden Lodge + Stag Enclosure → **Stag Warden Path**
- Council Glade + Ward Beacon → **Far-Sight Circle**
- Heartgrove Sanctuary + Council Glade → **Heartgrove Council**

### Orcs

Chapter 1 completion + an Orc commander allows construction of **Emberclan Warcamp**.

The Warcamp:
- expands the War Cart from 4×4 to 4×5
- raises active squad capacity from 2 to 3
- opens **Clan Muster**
- enables the visual settlement placement screen

Orc buildings:
- Emberclan Warhold
- Clan Yard
- Bone Forge
- War Cartwright
- Smokehouse
- War Council
- Warg Pens
- Watchfire

Orc adjacency:
- Clan Yard + Bone Forge → **War Smiths**
- War Cartwright + Smokehouse → **Raid Stores**
- Clan Yard + Warg Pens → **Pack Yard**
- War Council + Watchfire → **War Signals**
- Emberclan Warhold + War Council → **Chieftain Seat**

## Elf Chapter 2 — The Last Heartgrove

1. Sanctuary Muster — choose a third squad
   - Grove Acolyte
   - Bow Warden
   - Stag Scout
2. The Last Heartgrove
3. Moonwell Grove
4. Ward Hunters
5. Root Council
6. Ashroot Stalker

Chapter 2 unlocks Moonwell regional production, Spirit Stores, Ward Beacon and Stag Enclosure.

Defeating the Ashroot Stalker unlocks the **Heartgrove Wardhold** project. The Wardhold expands the caravan to 5×5, raises active squad capacity to 4 and begins Chapter 3 / Moonlit Pass.

## Orc Chapter 2 — Gather the Clans

1. Clan Muster — choose a third squad
   - Clan Warrior
   - War Drummer
   - Warg Scout
2. Gather the Clans
3. Warg Pens
4. Stonejaw Challengers
5. Warfire Council
6. Clanbreaker

Chapter 2 unlocks Red Plains Hunt production, Smokehouse, Watchfire and Warg Pens.

Defeating the Clanbreaker unlocks the **Emberclan Warhold** project. The Warhold expands the War Cart to 5×5, raises active squad capacity to 4 and begins Chapter 3 / The Stonejaw Trial.


## Elf Chapter 3 — Moonlit Pass

Heartgrove Wardhold now supports a fourth active squad and Chapter 3 is fully playable:

1. **Moonlit Pass Muster**
   - Spear Warden
   - Pathfinder
   - Spiritkeeper
2. **Moonlit Pass**
3. **Silent Beacons**
   - unlocks Moonlit Watch production
   - +4 Gold and +3 Provisions per meaningful activity
4. **Ashen Groves**
5. **Rootway Council**
6. **The Pale Ranger**

Defeating the Pale Ranger unlocks the **Heartgrove Enclave** project.

Enclave requirements:
- Warden Lodge Lv.3
- Moon Forge Lv.3
- Caravan Grove Lv.3
- Stag Enclosure built
- Ward Beacon built
- 245 Gold
- 115 Wood
- 75 Stone
- 10 Iron

The Enclave expands the Wayfarer Caravan from 5×5 to **5×6**, raises the active squad cap from 4 to **5**, and begins Elf Chapter 4 / **Roots in Ash**.

## Orc Chapter 3 — The Stonejaw Trial

Emberclan Warhold now supports a fourth active squad and Chapter 3 is fully playable:

1. **Stonejaw Muster**
   - Spear Raider
   - Bone Hunter
   - Warbringer
2. **The Stonejaw Trial**
3. **Trial Fires**
   - unlocks Stonejaw Quarry production
   - +3 Stone and +2 Iron per meaningful activity
4. **Broken Steppe**
5. **Clan Oath**
6. **Stonejaw Champion**

Defeating the Stonejaw Champion unlocks the **Emberclan Great Warhold** project.

Great Warhold requirements:
- Clan Yard Lv.3
- Bone Forge Lv.3
- War Cartwright Lv.3
- Warg Pens built
- Watchfire built
- 240 Gold
- 110 Wood
- 70 Stone
- 20 Iron

The Great Warhold expands the War Cart from 5×5 to **5×6**, raises active squad capacity from 4 to **5**, and begins Orc Chapter 4 / **War on Two Fronts**.


## Elf Chapter 4 — Roots in Ash

The five-squad Enclave tier is now playable:

1. **Ashen Grove Muster**
   - Blade Warden
   - Druid
   - Moon Ranger
2. **Roots in Ash**
3. **The Burned Ward**
   - unlocks Burned Ward Reclamation
   - +4 Wood and +3 Provisions per meaningful activity
4. **Two Fronts**
5. **Living Root Council**
6. **Ashen Druid**

Defeating the Ashen Druid unlocks the **Worldroot Sanctuary** project.

Worldroot Sanctuary requirements:
- Warden Lodge Lv.4
- Moon Forge Lv.4
- Caravan Grove Lv.4
- Council Glade Lv.3
- Spirit Stores Lv.3
- Stag Enclosure Lv.2
- Ward Beacon Lv.2
- 390 Gold
- 175 Wood
- 130 Stone
- 35 Iron

Worldroot Sanctuary:
- expands the Wayfarer Caravan from 5×6 to **6×7**
- raises active squad capacity from 5 to **6**
- begins Elf Chapter 5 / **The Wounded Worldroot**

## Orc Chapter 4 — War on Two Fronts

The five-squad Great Warhold tier is now playable:

1. **Warhold Muster**
   - Ironhide
   - Axe Thrower
   - Bone Shaman
2. **War on Two Fronts**
3. **Split Warfire**
   - unlocks Steppe War Camp
   - +4 Gold and +4 Provisions per meaningful activity
4. **Broken Steppe War**
5. **Two-Front Council**
6. **The Split-Chieftain**

Defeating the Split-Chieftain unlocks the **Emberclan High Warhold** project.

High Warhold requirements:
- Clan Yard Lv.4
- Bone Forge Lv.4
- War Cartwright Lv.4
- War Council Lv.3
- Smokehouse Lv.3
- Warg Pens Lv.2
- Watchfire Lv.2
- 400 Gold
- 170 Wood
- 125 Stone
- 45 Iron

High Warhold:
- expands the War Cart from 5×6 to **6×7**
- raises active squad capacity from 5 to **6**
- begins Orc Chapter 5 / **No Clan Left Behind**

## Stag and Warg mounted branches

Alternate-faction mount buildings now drive real equipment-based promotions.

### Elves
- Stag Scout + Trained Stag → **Stag Rider**
- Stag Rider + Stag Rider Bow → **Mounted Ranger**
- Stag Rider + Moon Lance → **Stag Lancer**

### Orcs
- Warg Scout + Trained Warg → **Warg Rider**
- Warg Rider + Raider Axe → **Warg Raider**
- Warg Rider + Warg Lance → **Warg Lancer**

The mount is assigned equipment, not a consumed promotion token.

Tier III upgrades are also available without forcing another class change:
- Veteran Stag
- Star Lance
- Starbow
- Starweave Armor
- Veteran Warg
- Bonehook Lance
- Bloodaxe
- Ironhide Plate

The generic equipment screen now uses the active faction's actual buildings:
- Field Forge / Stable / Barracks for Humans
- Moon Forge / Stag Enclosure / Warden Lodge for Elves
- Bone Forge / Warg Pens / Clan Yard for Orcs


## Elf Chapter 5 — The Wounded Worldroot

The six-squad Worldroot Sanctuary tier is now fully playable:

1. **Worldroot Muster**
   - no seventh squad; the combat cap remains six
   - +25 Gold and +25 Provisions
2. **The Wounded Worldroot**
3. **Rootscar Records**
   - unlocks Worldroot Nursery
   - +5 Wood and +4 Provisions per meaningful activity
   - confirms the Worldroot damage follows the same three-part Concord geometry
4. **Ashen Rootkeepers**
5. **Echo of the Root Seal**
   - confirms the Root Seal survived
   - traces its living signature toward Crownspire
   - does not recover the Seal yet
6. **Worldroot Guardian**

Defeating the Worldroot Guardian unlocks the **Starroot Conclave** project.

Starroot Conclave requirements:
- Warden Lodge Lv.5
- Moon Forge Lv.5
- Caravan Grove Lv.5
- Council Glade Lv.4
- Spirit Stores Lv.4
- Stag Enclosure Lv.3
- Ward Beacon Lv.3
- 650 Gold
- 270 Wood
- 210 Stone
- 65 Iron

Starroot Conclave:
- expands the Wayfarer Caravan from 6×7 to **7×8**
- keeps the six-squad cap
- begins Elf Chapter 6 / **Stars over Crownspire**
- unlocks **Worldroot Attunements**

### Worldroot Attunements
One can be active at a time:
- **Living Canopy** — +9% army armor
- **Moonwatch** — +6% speed and detailed Battle Prep intel
- **Rootway Stewardship** — +25% regional production

The first Attunement is free. Changing it later costs 100 Gold.

## Orc Chapter 5 — No Clan Left Behind

The six-squad High Warhold tier is now fully playable:

1. **High Warhold Muster**
   - no seventh squad; all six squads march under one column
   - +20 Gold and +28 Provisions
2. **No Clan Left Behind**
3. **Missing Warfires**
   - unlocks United Clan Depot
   - +3 Iron and +4 Provisions per meaningful activity
   - proves the Warfires were deliberately extinguished in a coordinated pattern
4. **Ashen Clanbreakers**
5. **Echo of the Clan Seal**
   - confirms the Clan Seal survived
   - traces the old oath-stones toward Crownspire
6. **Last Clanbreaker**

Defeating the Last Clanbreaker unlocks the **Warfire Confederacy** project.

Warfire Confederacy requirements:
- Clan Yard Lv.5
- Bone Forge Lv.5
- War Cartwright Lv.5
- War Council Lv.4
- Smokehouse Lv.4
- Warg Pens Lv.3
- Watchfire Lv.3
- 660 Gold
- 260 Wood
- 200 Stone
- 80 Iron

Warfire Confederacy:
- expands the War Cart from 6×7 to **7×8**
- keeps the six-squad cap
- begins Orc Chapter 6 / **The Truth at Crownspire**
- unlocks **Clan Pacts**

### Clan Pacts
One can be active at a time:
- **Blood Hunt Pact** — +9% attack and +3% speed
- **Iron Clan Pact** — +10% armor
- **Shared Spoils Pact** — +25% regional production

The first Pact is free. Changing it later costs 100 Gold.

## Chapter 6 opening

The first strategic choice immediately affects gameplay.

After choosing an Attunement or Pact:
- Elves play **Stars over Crownspire**
- Orcs play **The Truth at Crownspire**

Winning opens:
- **Concord Rootway** for Elves
- **Concord Warpath** for Orcs

The remaining Chapter 6 nodes are reserved for the next final-campaign pass, where the Root Seal and Clan Seal will actually be recovered.
