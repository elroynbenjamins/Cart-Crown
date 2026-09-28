# Cart & Crown production art pipeline

The game currently uses code-rendered pixel art as a safe fallback. Final PNG art can replace those fallbacks without changing gameplay IDs or screen code.

## Folder contract

- `units/<faction>/<class-name>.png` — 256×256 transparent
- `factions/<faction>/crest.png` — 256×256 transparent
- `equipment/<faction>/<equipment-id>.png` — 256×256 transparent
- `buildings/<faction>/<building-id>.png` — 256×256 transparent
- `enemies/<enemy-kind>.png` — 256×256 transparent
- `commanders/<faction>/<commander-id>.png` — 512×512 transparent
- `resource_sites/<faction>/<site-id>.png` — 256×256 transparent
- `resources/<resource-id>.png` — 128×128 transparent
- `wagon_items/<item-id>.png` — 256×256 transparent
- `scenes/<faction>/<scene-id>.png` — 768×432 opaque/background scene
- `ui/<ui-id>.png` — 96×96 transparent

## Art rules

Use crisp handcrafted pixel art with visible square pixels, clustered shading, limited palettes and consistent pixel scale. Do not bake text, labels, numbers, arrows, logos, borders, rarity frames, HP bars or UI controls into the image.

Keep the important silhouette inside the safe margin recorded by `src/ui/productionAssets.ts`. Weapons and antlers may approach the margin but must never clip.

Human art should remain grounded medieval steel/wood/blue cloth. Elves use lighter silhouettes, spiritwood, moon-silver, living wards and Stags. Orcs use broad silhouettes, rough iron/bone, red/rust cloth and Wargs.

## Activation workflow

1. Add the reviewed PNG at the path defined by the production asset spec.
2. Add a static `require(...)` entry to `productionAssetSources` in `src/ui/productionAssets.ts`.
3. Run typecheck/CI.
4. The existing renderer automatically uses the PNG; if the source is absent it keeps the code-rendered fallback.

This means final art can be introduced incrementally without changing screen layouts or gameplay/data IDs.


## First production batch — starter_identity_v1

Generate and review these first because they are visible immediately in the three campaign openings:

- Human: `units/human/militia.png`, `units/human/recruit.png`, `factions/human/crest.png`, `equipment/human/hum_trained_horse.png`
- Elf: `units/elf/warden.png`, `units/elf/forest_scout.png`, `factions/elf/crest.png`, `equipment/elf/elf_trained_stag.png`
- Orc: `units/orc/youngblood.png`, `units/orc/hunter.png`, `factions/orc/crest.png`, `equipment/orc/orc_trained_warg.png`

The canonical machine-readable batch is `src/ui/productionAssetBatches.ts`.

Starter-specific art direction:
- **Militia / Recruit:** grounded medieval survival gear, blue cloth accents, practical steel/wood, visibly under-equipped compared with later Human tiers.
- **Warden:** slim Elven frontline silhouette, leaf/ward motifs, moon-silver accents, no bulky Human plate.
- **Forest Scout:** hood or leaf mantle, long graceful bow, light spiritwood equipment, fast readable silhouette.
- **Youngblood:** broad Orc frame, rough iron/bone, tusks, rust/red cloth, deliberately less refined than later clan elites.
- **Hunter:** rugged Orc skirmisher with compact bow and bone/wood details; lighter than Youngblood but still broad-bodied.
- **Horse:** normal grounded campaign horse, leather tack, no fantasy ornament.
- **Stag:** clearly a stag rather than a horse—antlers are mandatory and must remain readable at 40–56 px.
- **Warg:** low, heavy predatory silhouette with ears/snout; must not read as a dark horse.
- **Crests:** bold simple faction symbols with no text and strong small-size recognition.
