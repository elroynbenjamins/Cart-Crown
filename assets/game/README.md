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
- `scenes/<faction>/<scene-id>.png` — opaque/background scene; camp panoramas use reviewed 1672×941 originals, other planned scenes use 768×432
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

Opaque scenes have a separate, explicit size/opacity/file-budget contract in `scripts/art-regression.mjs`. They do not use or relax the 256×256 transparent sprite contract. See [the faction camp scene notes](scenes/README.md) for the current panorama set and generation prompts.

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


## Second production batch — early_progression_v2

This batch covers the first meaningful class and equipment choices after the starter campaigns:

- Human units: Swordsman, Spearman, Archer
- Elf units: Grove Acolyte, Bow Warden, Stag Scout
- Orc units: Clan Warrior, War Drummer, Warg Scout
- Human Tier-1 gear: Iron Sword, Infantry Spear, Hunting Bow, Padded Armor, Wooden Shield
- Elf Tier-1 gear: Spiritwood Spear, Moonbow, Leafweave Armor
- Orc Tier-1 gear: Clan Iron Axe, Horn Bow, Warhide Armor

Production goals:
- promoted Human classes should look trained but still clearly below Tier II professionals;
- Grove Acolyte reads as magical/support, Bow Warden as ranged, Stag Scout as mounted;
- Clan Warrior reads as frontline, War Drummer as support, Warg Scout as mounted;
- the weapon/icon silhouette must stay recognizable at 38–56 px;
- armor icons should communicate faction material language without any text or rarity frame.


## Third production batch — enemy_identity_v3

This batch replaces the enemy code-rendered fallback with optimized 256×256 transparent PNG sprites.

Named threat sprites:
- Raider
- Mercenary
- Ashen
- Scout
- Hollow
- Ashroot Stalker
- Stonejaw Champion
- Pale Ranger
- Agitator / Clanbreaker

Tactical army-identity sprites:
- Shield Host
- Missile Company
- Mounted Hunters
- Shock Warband
- Warded Host
- Elite Command

Battle Prep and live combat pass the current enemy army profile into the art renderer. Named bosses keep bespoke silhouettes; otherwise the tactical army identity controls the sprite so formation and Scout Report information is visually reinforced.

Performance rule:
- enemy combat tokens should prefer one cached production PNG over layered React Native fallback views;
- keep enemy PNGs at 256×256 transparent source size and render them down at token scale;
- avoid multi-frame sprite sheets unless a later profiling pass proves they are worthwhile.


## Fourth production batch — midgame_units_v4

This batch replaces generic fallback silhouettes for the directly recruited classes that dominate Chapters 2–4.

Human:
- Scout
- Field Medic
- Crossbowman
- Man-at-Arms
- Halberdier
- Field Chaplain
- Border Ranger
- Royal Guard
- Siege Engineer
- Banner Captain

Elf:
- Spear Warden
- Pathfinder
- Spiritkeeper
- Blade Warden
- Druid
- Moon Ranger

Orc:
- Spear Raider
- Bone Hunter
- Warbringer
- Ironhide
- Axe Thrower
- Bone Shaman

All use the same 256×256 transparent production contract as the starter sprites. They are intentionally compact, nearest-neighbour pixel assets so exact class art can replace multi-view fallback rendering without requiring battle-screen changes.

Art direction:
- Human midgame classes become progressively more disciplined and heraldic while keeping practical steel/wood construction.
- Elven classes use slimmer silhouettes, moon-silver, spiritwood, ward/light motifs and cleaner weapon lines.
- Orc classes use broader silhouettes, rough iron/bone, rust cloth and visibly heavier melee/support equipment.
- Support classes must read as support at 38–56 px through staff, banner, tome/drum or glow cues rather than text.


## Fifth production batch — advanced_promotions_v5

This batch closes the remaining visual gaps in the established advanced promotion trees.

Human:
- Shield Infantry
- Greatswordsman
- Pikeman
- Shield Spearman
- Longbowman
- Ranger
- Scout Rider
- Cavalryman
- Lancer
- Mounted Archer
- Champion
- Marksman
- Heavy Cavalry

Elf mounted branch:
- Stag Rider
- Mounted Ranger
- Stag Lancer

Orc mounted branch:
- Warg Rider
- Warg Raider
- Warg Lancer

Mounted sprites include the mount in the exact class PNG, so horse/stag/warg progression remains visually obvious even when the unit is rendered at small battle-token size. The assets keep the same 256×256 transparent, nearest-neighbour production contract and require no extra battle animation sheets.
## Campaign journey maps

Campaign journey routes reuse each faction's reviewed opaque `scenes/<faction>/camp.png` panorama as the offline backdrop. Do not add duplicate campaign-map PNGs unless they receive a separate production-art contract and registration.

