# Cart & Crown

Cart & Crown is a portrait-first mobile strategy RPG built around **Kingdom progression, a 3×3 combat Formation, a limited logistics Wagon, persistent troop equipment, and faction-specific command styles**.

## Current prototype

- **2 independent save slots**, both autosaved locally.
- Save schema v4 stores shared progress plus separate Human / Elf / Orc faction states.
- Older development saves migrate automatically.
- Human campaign is the required first playthrough.
- Original / Dark / Light themes.
- 3×3 formation board with army capacity growing from 2 to 6 squads.
- Human Orders, Elven Ward rules and Orc Momentum rules.
- Drag/rotate Wagon logistics.
- Persistent per-unit equipment loadouts: weapon, armor, shield, mount and artifact.
- Equipment can improve without changing class.
- Class promotions require specific gear combinations plus Kingdom building levels.
- Expeditions and Formation Trials are playable; Kingdom Defense and Relic Hunts are later unlocks.
- Optional rewarded-ad placements use one provider adapter; development uses mock rewards.

## Human Chapter 1 loop

1. Start with Harlan the Militia + Mira the Recruit.
2. Fight **Hold the Road**.
3. Establish Greenkeep Settlement.
4. Investigate **Marked Raiders** and unlock the Field Forge.
5. Craft Mira's first class weapon:
   - Iron Sword → **Swordsman**
   - Infantry Spear → **Spearman**
   - Hunting Bow → **Archer**
6. Defeat the elite **Mercenary Patrol**.
7. Choose a player-commander specialization.
8. Welcome the **Refugee Camp**, unlocking the Quartermaster.
9. Upgrade Greenkeep buildings.
10. Defeat **The Toll Captain**.
11. Meet Fort requirements and construct **Greenkeep Fort**.

## Equipment progression

Assigned gear does not occupy Wagon space.

Examples of non-class upgrades:
- Iron Sword → Steel Sword
- Padded Armor → Chainmail
- Wooden Shield → Kite Shield
- Hunting Bow → Longbow

Advanced class branches require both gear and infrastructure:
- Swordsman + Kite Shield + Chainmail + Barracks II + Forge II → **Shield Infantry**
- Swordsman + Greatsword + Barracks II + Forge II → **Greatswordsman**
- Spearman + Long Pike → **Pikeman**
- Spearman + Kite Shield → **Shield Spearman**
- Archer + Longbow → **Longbowman**
- Archer + Ranger Coat → **Ranger**

## Kingdom building

Campaign milestones unlock buildings and specialists. The player decides where resources are invested.

Current Human buildings:
- Greenkeep Hall
- Barracks
- Field Forge
- Wagonwright
- Quartermaster
- War Room
- Stable

Examples:
- **Barracks II** unlocks advanced class training.
- **Forge II** unlocks Tier II equipment.
- **Wagonwright II** improves Expedition supply recovery.
- **Quartermaster II** grants an extra base Expedition Ticket.
- **War Room II** reduces commander retraining cost from 75 to 50 Gold.

### Fort tier

After defeating the Toll Captain, Greenkeep can become a Fort only if:
- Barracks Lv.2
- Forge Lv.2
- Wagonwright Lv.2
- 150 Gold
- 70 Wood
- 35 Stone
- 10 Iron

Fort construction then:
- raises Hall to Lv.3
- expands the Wagon to **5×5**
- increases active squad capacity to **4**
- opens the Stable
- unlocks the **Kingdom Defense** side-mode tier

## Commander paths

Each faction has three player-commander paths with favored roles, passive bonuses and an automatic battle command skill.

Humans:
- Vanguard Marshal — melee/frontline, armor break
- Ranger-Captain — ranged/skirmish, morale pressure
- Cavalry Marshal — cavalry, heavy direct damage

Elves:
- Windcaller — ranged/skirmish
- Thorn Warden — frontline/support, bleed
- Moon Seer — support/ranged, morale pressure

Orcs:
- Bloodchief — melee/frontline, bleed
- Warglord — cavalry/skirmish, morale pressure
- Warcaller — support/melee, armor break

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
