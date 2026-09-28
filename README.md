# Cart & Crown

Cart & Crown is a portrait-first mobile strategy RPG built around three connected systems:

- **Kingdom** — rebuild a faction settlement and unlock troops, equipment and logistics.
- **Formation** — choose which combat squads fight and where they stand.
- **Supply Wagon** — pack food, medicine, ammunition, banners, artifacts and support gear into a limited grid.

The first playable slice starts intentionally small with **2 Human squads** and a **4x4 Supply Wagon**. The first settlement upgrade expands the wagon to 4x5 and unlocks a third recruit choice.

## Tech direction

- Expo / React Native / TypeScript
- Portrait mobile layout
- Data-driven gameplay definitions
- Original, Dark and Light themes from shared semantic tokens
- Static or lightly animated 2D art; no 3D or free-roaming world
- Single-player first

## Initial navigation

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

The current implementation is a foundation vertical slice. Game balance values are placeholders until the database is imported into code.
