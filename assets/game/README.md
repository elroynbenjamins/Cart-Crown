# Cart & Crown production art pipeline

The game currently uses code-rendered pixel art as a safe fallback. Final PNG art can replace those fallbacks without changing gameplay IDs or screen code.

## Folder contract

- `units/<faction>/<visual-kind>.png` — 256×256 transparent
- `equipment/<faction>/<equipment-id>.png` — 256×256 transparent
- `buildings/<faction>/<building-id>.png` — 256×256 transparent
- `enemies/<enemy-kind>.png` — 256×256 transparent
- `commanders/<faction>/<commander-id>.png` — 512×512 transparent
- `resource_sites/<faction>/<site-id>.png` — 256×256 transparent
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
