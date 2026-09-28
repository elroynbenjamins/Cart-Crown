# Cart & Crown

Cart & Crown is a portrait-first mobile strategy RPG built around **Kingdom progression, a 3×3 combat Formation, and a limited logistics Wagon**.

## Current prototype

- Human campaign is the required first playthrough.
- Finishing Humans will unlock Elf and Orc campaigns inside that save.
- Completing all three factions will unlock the final Three Seals campaign.
- 3 independent local save slots with autosave.
- Original / Dark / Light themes.
- 3×3 formation board with a maximum army size that grows from 2 to 6 squads.
- Human Orders, with data definitions already prepared for Elven Wards and Orc Momentum.
- Drag/rotate Wagon logistics.
- First connected story battle and Greenkeep settlement upgrade.
- First reinforcement choice: Archer / Scout / Field Medic.
- Side-mode foundation:
  - Expeditions
  - Formation Trials
  - Kingdom Defense (later unlock)
  - Relic Hunts (later unlock)
- Optional rewarded-ad placements are scaffolded through one adapter. Development builds use a mock reward; no production ad SDK is connected yet.

## Opening loop

1. Choose one of 3 save slots.
2. Start the Human campaign.
3. Prepare the 4×4 Supply Wagon and 3×3 formation.
4. Fight **Hold the Road**.
5. Claim rewards and uncover the first false-flag clue.
6. Establish Greenkeep.
7. Expand the Wagon to 4×5 and active army capacity to 3.
8. Recruit Archer, Scout or Field Medic.
9. Experiment with Human formation Orders, Expeditions and Formation Trials.

## Tech

- Expo SDK 57
- React Native 0.86
- React 19.2
- TypeScript
- AsyncStorage for 3 local save slots

## Run

```bash
npm install
npm run start
npm run android
npm run typecheck
```

Temporary letters and emoji are placeholders for the final portrait/equipment art pipeline.
