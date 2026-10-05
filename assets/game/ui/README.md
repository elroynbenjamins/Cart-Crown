# Treasury resource art

An original six-sprite pixel-art atlas generated with the built-in image generation tool on 2026-10-05. The initial prompt, cleanup prompt, source dimensions and checksum are recorded in [treasury-prompts.json](treasury-prompts.json). The final cleanup output is bundled unchanged.

| Cell | Sprite | Purpose |
| --- | --- | --- |
| Top left | Gold coins | Treasury, costs and rewards |
| Top middle | Bundled wood | Timber costs and rewards |
| Top right | Stone blocks | Stone costs and rewards |
| Bottom left | Iron ingots | Iron costs and rewards |
| Bottom middle | Bread and produce crate | Provisions and food costs |
| Bottom right | Open treasure chest | Ordinary victory header |

## Runtime integration

`TreasuryArt.tsx` clips one square cell from `ui.treasury_atlas`. The source is a 1536×1024 RGBA PNG with six 512×512 cells. Each cell scales proportionally to the requested size; adjacent cells stay outside the clipped view. The atlas is bundled locally and requires no network download or new dependency. Android uses `resizeMethod="resize"` to request decoding near the rendered atlas size, and image loading adds no fade.

`ResourceSprite` keeps individual `resource.*` production overrides first, uses the treasury atlas next, and retains its original code-rendered sprite if the atlas is absent or fails. The victory cache similarly retains the original victory scene as its fallback. Crownspire continues to use its dedicated story scene. The new art is decorative and hidden from accessibility navigation; resource amounts and labels remain available on their existing parent elements.

Four-resource victories use equal columns in a compact two-by-two layout. Large text can wrap and move the tiles to one column. The existing single, reduced-motion-aware reward entrance remains unchanged; the artwork adds no game-state mutation or animation loop.

## Asset validation

`npm run art:check` fully decodes the atlas and checks its PNG CRCs, compression, scanlines, exact dimensions, alpha, six-cell coverage and static registration. The file is 1,790,691 bytes, within its explicit 3,000,000-byte budget.

Every cell has an 8px reviewed gutter. The source contains 15 isolated gutter pixels at alpha 1/255, with all other gutter pixels at alpha zero. Only this atlas's validation contract allows up to 32 such mask-roundoff pixels in total; any gutter alpha of 2 or more fails. Default atlas checks remain strict, and other sprite and panorama contracts are unchanged.

Android smoke validation captures the unobscured reward screen at compact and regular phone sizes, including Pure Black, Light and Charcoal themes, so the actual clipped sprites and alpha rendering can be reviewed in the native app.
