/** Keep scene controls within native parent bounds, preferring the clear side of the building. */
export function settlementActionLayout(
  mapWidth: number, mapHeight: number, anchor: { x: number; y: number }, measuredHeight: number
): { left: number; top: number; width: number } {
  const safe = (value: number, fallback: number) => Number.isFinite(value) && value > 0 ? value : fallback;
  const w = safe(mapWidth, 360);
  const h = safe(mapHeight, 600);
  const inset = Math.min(8, w / 4, h / 4);
  const width = Math.min(320, w - inset * 2);
  const height = Math.min(safe(measuredHeight, 112), h - inset * 2);
  const norm = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.5;
  const x = norm(anchor.x) * w;
  const y = norm(anchor.y) * h;
  const above = y - 58 - height;
  const below = y + 58;
  const preferred = above >= inset ? above : below + height <= h - inset ? below
    : y > h / 2 ? above : below;
  return {
    left: Math.max(inset, Math.min(w - inset - width, x - width / 2)),
    top: Math.max(inset, Math.min(h - inset - height, preferred)),
    width
  };
}
