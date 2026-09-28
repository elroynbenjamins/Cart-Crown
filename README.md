# Cart & Crown

Cart & Crown is a portrait-first mobile strategy RPG built around **Kingdom progression, a 3×3 combat Formation, and a limited logistics Wagon**.

## Current prototype

- **2 independent save slots**, both autosaved locally.
- Save schema v2 stores **shared progress + separate Human / Elf / Orc faction states** inside each slot.
- Existing schema-v1 development saves migrate into the Human state automatically.
- Human campaign is the required first playthrough.
- Finishing Humans will unlock Elf and Orc campaigns in the same save while preserving the completed Human kingdom.
- Completing all three factions will unlock the final Three Seals campaign.
- Original / Dark / Light themes.
- 3×3 formation board with army capacity growing from 2 to 6 squads.
- Human Orders, with engine rules already prepared for Elven Wards and Orc Momentum.
- Drag/rotate Wagon logistics.
- Side-mode foundation: Expeditions, Formation Trials, Kingdom Defense and Relic Hunts.
- Optional rewarded-ad placements through one provider adapter; development uses mock rewards.

## Current Human opening

1. Choose Save 1 or Save 2.
2. Start with Harlan the Militia + Mira the Recruit.
3. Prepare the 4×4 Supply Wagon and 3×3 formation.
4. Fight **Hold the Road**.
5. Establish Greenkeep and expand to 3 active squads.
6. Investigate **Marked Raiders** and discover the first false-flag evidence.
7. Unlock the **Field Forge**.
8. Craft Mira's first weapon:
   - Iron Sword → **Swordsman**
   - Infantry Spear → **Spearman**
   - Hunting Bow → **Archer**
9. The crafted weapon becomes assigned troop equipment and no longer occupies Wagon space.

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
