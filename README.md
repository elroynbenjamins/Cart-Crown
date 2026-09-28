# Cart & Crown

Cart & Crown is a portrait-first mobile strategy RPG built around three connected systems:

- **Kingdom** — rebuild a faction settlement and unlock troops, equipment and logistics.
- **Formation** — choose which combat squads fight and where they stand.
- **Supply Wagon** — pack food, medicine, ammunition, banners, artifacts and support gear into a limited grid.

The first playable slice starts intentionally small with **2 Human squads** and a **4x4 Supply Wagon**.

## Current vertical slice

The current `main` branch now supports the first connected progression loop:

1. Open Chapter 1 in **Campaign**.
2. Enter **Hold the Road** battle preparation.
3. Watch the first deterministic auto-battle.
4. Receive resources and the first story clue.
5. Return to **Kingdom** and establish Greenkeep.
6. Supply Wagon expands from **4x4 to 4x5**.
7. Formation expands from **2 to 3 active slots**.
8. Choose the first reinforcement: **Archer / Scout / Field Medic**.
9. Reposition squads in Formation and drag/rotate logistics in the Wagon.

## Tech direction

- Expo / React Native / TypeScript
- Portrait mobile layout
- Data-driven gameplay definitions
- Original, Dark and Light themes from shared semantic tokens
- Static or lightly animated 2D art; no 3D or free-roaming world
- Single-player first

## Main navigation

1. Kingdom
2. Campaign
3. Formation
4. Wagon
5. Army

## Development

```bash
npm install
npm run start
npm run android
npm run typecheck
```

Balance values and temporary letter/emoji art are placeholders until the database and final generated assets are imported.
