# Faction camp panoramas

Three original pixel-art illustrations generated with the built-in image generation tool on 2026-10-05. The complete prompts and generation method are recorded in [prompts.json](prompts.json).

| Asset | Setting | Production ID |
| --- | --- | --- |
| `human/camp.png` | Greenkeep: a covered wagon, two travelers, blue banners and a frontier camp at dawn | `scene.human.camp` |
| `elf/camp.png` | Heartgrove: a spiritwood lodge, woodland caravan, stag and ward stones | `scene.elf.camp` |
| `orc/camp.png` | Emberclan: a rugged supply cart, warg, timber-and-hide hall and campfire | `scene.orc.camp` |

## Runtime integration

`FactionCampScene` in `src/ui/gameArt.tsx` loads the corresponding statically registered source from `src/ui/productionAssets.ts`. The Human panorama appears on Save Select; the active faction's panorama appears on Faction Camp. No network download or new image dependency is required.

The generator returned 1672×941, fully opaque RGB PNGs. These reviewed originals are preserved byte-for-byte. They render with a centered cover crop inside the existing width × 0.48 banner. Approximately 7.4% is cropped from the top and bottom; wagons, travelers and faction buildings stay inside the displayed region. Each screen measures its actual card interior, including safe-area insets, and reserves the banner's aspect ratio before the image loads. Camp banners use up to 520 layout points; Save Select uses up to 300. The Save Select crest sits at the lower right to leave the travelers visible.

The native image uses `resizeMethod="resize"` to request decoding near its displayed size on Android, with no loading fade. Images are decorative and hidden from accessibility navigation. A failed faction source falls back to the existing code-rendered camp; changing factions resolves the new faction's own source. The scene adds no animation loop or game-state mutation.

## Validation

`npm run art:check` fully decodes every PNG and checks CRCs, compression, row filters, dimensions, opacity and static registration. Only these three scene paths have the opaque panorama contract; the existing 256×256 alpha-sprite contract remains unchanged. Each camp PNG has a 3,500,000-byte limit; the three together have a 9,000,000-byte limit. The current set totals 8,489,110 bytes.

Android native validation also publishes a compact `android-visuals-<run_id>` artifact with real phone-size screenshots, smoke results and the exact source commit. The full APK/build evidence artifact remains available separately.


## Settlement world progression backgrounds

Human settlement progression uses five opaque portrait background plates beneath the transparent building layer:

- `human/settlement/camp.jpg` — rough camp/outpost, dirt paths and minimal fencing
- `human/settlement/settlement.jpg` — early permanent settlement, cleaner paths and modest perimeter
- `human/settlement/fort.jpg` — defensive fort, real walls/gate/watchtowers
- `human/settlement/town.jpg` — developed town, refined roads/plaza/quayside
- `human/settlement/capital.jpg` — stronghold/capital/grand shell, full prestigious fortification

The surrounding coastline, cliffs, waterfall and distant valley stay compositionally stable while settlement infrastructure becomes stronger. Gameplay buildings remain separate transparent sprites and are positioned over the clear build pads. Stronghold, Capital and Grand currently share the capital plate; later passes may split those top tiers without changing settlement data.
