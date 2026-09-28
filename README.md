# Cart & Crown

Cart & Crown is a portrait-first mobile strategy RPG built around **Kingdom progression, a 3×3 combat Formation, a limited logistics Wagon, and faction-specific command styles**.

## Current prototype

- **2 independent save slots**, both autosaved locally.
- Save schema v3 stores **shared progress + separate Human / Elf / Orc faction states** inside each slot.
- Older schema-v1 and schema-v2 development saves migrate automatically.
- Human campaign is the required first playthrough.
- Finishing Humans will unlock Elf and Orc campaigns in the same save while preserving the completed Human kingdom.
- Completing all three factions will unlock the final Three Seals campaign.
- Original / Dark / Light themes.
- 3×3 formation board with army capacity growing from 2 to 6 squads.
- Human Orders, Elven Ward rules and Orc Momentum rules.
- Drag/rotate Wagon logistics.
- Expeditions and Formation Trials, with Kingdom Defense and Relic Hunts defined for later.
- Optional rewarded-ad placements through one provider adapter; development uses mock rewards.

## Current Human opening

1. Choose Save 1 or Save 2.
2. Start with Harlan the Militia + Mira the Recruit.
3. Prepare the 4×4 Supply Wagon and 3×3 formation.
4. Fight **Hold the Road**.
5. Establish Greenkeep and expand to 3 active squads.
6. Investigate **Marked Raiders** and uncover false-flag equipment.
7. Unlock the **Field Forge**.
8. Craft Mira's first weapon:
   - Iron Sword → **Swordsman**
   - Infantry Spear → **Spearman**
   - Hunting Bow → **Archer**
9. Fight the elite **Mercenary Patrol**.
10. Recover genuine Crownspire payment records.
11. Choose a player-commander specialization.

## Commander paths

Every faction has three player-commander paths. Each path contains:

- favored unit roles
- a persistent passive multiplier
- one battle command skill
- a distinct effect type
- optional later retraining for Gold

### Humans
- **Vanguard Marshal** — frontline/melee; Command Strike causes direct damage + armor break.
- **Ranger-Captain** — ranged/skirmish; Suppressing Volley damages enemy morale.
- **Cavalry Marshal** — cavalry; Hammer Charge deals heavy single-target damage.

### Elves
- **Windcaller** — ranged/skirmish; Piercing Gale direct damage.
- **Thorn Warden** — frontline/support; Thornbind causes bleed.
- **Moon Seer** — support/ranged; Moonbrand causes morale pressure.

### Orcs
- **Bloodchief** — melee/frontline; Open the Wound causes bleed.
- **Warglord** — cavalry/skirmish; Terror Charge damages morale.
- **Warcaller** — support/melee; War Drum Shock breaks armor.

Commander skills automatically fire during auto-battle. Passive bonuses only scale favored roles, so army composition matters.

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
