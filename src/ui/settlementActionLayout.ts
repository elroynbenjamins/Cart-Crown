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


/**
 * Art plate anchors shared by the interactive Human settlement and its
 * read-only Kingdom hero preview. Coordinates are the TOP-LEFT of the
 * 28%-wide plot boxes, not the position of the building sprite itself.
 * Moving these needs a matching revision of the 540×960 background plates.
 */
export const humanSettlementPlatePlotPositions: Record<string, { left: `${number}%`; top: `${number}%` }> = {
  plot_nw: { left: '8%', top: '18%' },
  plot_n: { left: '36%', top: '14%' },
  plot_ne: { left: '62%', top: '8%' },
  plot_w: { left: '4%', top: '28%' },
  plot_center: { left: '36%', top: '30%' },
  plot_e: { left: '62%', top: '26%' },
  plot_sw: { left: '4%', top: '40%' },
  plot_s: { left: '36%', top: '45%' },
  plot_se: { left: '62%', top: '42%' }
};
