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

/** Human plates are exported at 540×960 and must not be cropped differently in the two screens. */
export const HUMAN_SETTLEMENT_PLATE_ASPECT_RATIO = 540 / 960;
export const HUMAN_SETTLEMENT_PLOT_WIDTH = 0.28;
export const HUMAN_SETTLEMENT_PLOT_HEIGHT = 0.24;
export const HUMAN_SETTLEMENT_LANDMARK_WIDTH = 0.34;
export const HUMAN_SETTLEMENT_LANDMARK_HEIGHT = 0.29;

/**
 * The plot center, including the larger central Hall hit area, is the single
 * source for district links, building-action anchors and scene decorations.
 * Percentages match the painted Human settlement plate and the positioned
 * Pressables/preview plots. Keep all three consumers on this function.
 */
export function humanSettlementPlatePlotCenter(plotId: string): { x: number; y: number } | null {
  const position = humanSettlementPlatePlotPositions[plotId];
  if (!position) return null;
  const landmark = plotId === 'plot_center';
  return {
    x: Number.parseFloat(position.left) / 100 +
      (landmark ? HUMAN_SETTLEMENT_LANDMARK_WIDTH : HUMAN_SETTLEMENT_PLOT_WIDTH) / 2,
    y: Number.parseFloat(position.top) / 100 +
      (landmark ? HUMAN_SETTLEMENT_LANDMARK_HEIGHT : HUMAN_SETTLEMENT_PLOT_HEIGHT) / 2
  };
}

export const humanSettlementPlatePlotCenters: Record<string, { x: number; y: number }> =
  Object.fromEntries(
    Object.keys(humanSettlementPlatePlotPositions).map(id => [id, humanSettlementPlatePlotCenter(id)!])
  );

/** Five shipped plates cover seven stages. Advanced stages add distinct rim-only overlays. */
export const HUMAN_SETTLEMENT_STAGE_PLATES = {
  camp: 'camp',
  settlement: 'settlement',
  fort: 'fort',
  town: 'town',
  stronghold: 'capital',
  capital: 'capital',
  grand: 'capital'
} as const;

export function humanSettlementStagePlate(stageId: string): typeof HUMAN_SETTLEMENT_STAGE_PLATES[keyof typeof HUMAN_SETTLEMENT_STAGE_PLATES] {
  return HUMAN_SETTLEMENT_STAGE_PLATES[stageId as keyof typeof HUMAN_SETTLEMENT_STAGE_PLATES] ?? 'camp';
}

/**
 * Consistent stage-plate sprite proportions for Kingdom preview and editable
 * settlement. Plot position controls depth, while the Great Hall retains its
 * landmark silhouette even after being relocated away from the center plot.
 * Sizes are logical DP; the scene's existing pad transform supplies the final
 * ~1.14x on non-central world plots.
 */
export function humanSettlementBuildingSpriteSize(
  plotId: string,
  role: string,
  mapWidth: number
): number {
  const safeWidth = Number.isFinite(mapWidth) && mapWidth > 0 ? mapWidth : 340;
  const widthScale = Math.max(0.82, Math.min(1.12, safeWidth / 340));
  const isCenter = plotId === 'plot_center';
  const isBack = plotId === 'plot_nw' || plotId === 'plot_n' || plotId === 'plot_ne';
  const isFront = plotId === 'plot_sw' || plotId === 'plot_s' || plotId === 'plot_se';
  const depth = isBack ? 0.86 : isFront ? 1.1 : 1;
  const roleSize = role === 'KINGDOM' ? 98
    : role === 'MOUNT' ? 80
      : role === 'SCOUT' ? 71 : 76;
  return Math.round((isCenter
    ? role === 'KINGDOM' ? 142 : 114
    : roleSize * depth
  ) * widthScale);
}

/**
 * Pixel-art depth order follows the building's contact point (near its
 * footprint), not its role or the logical row in the save data. The central
 * Hall can be visually tall without covering a foreground building.
 *
 * Values deliberately stay under zIndex 18, which is reserved for district
 * labels. Tutorial/selection controls use the screen's higher focus layers.
 */
export function humanSettlementPlotDepthIndex(plotId: string): number {
  const position = humanSettlementPlatePlotPositions[plotId];
  if (!position) return 5;
  const height = plotId === 'plot_center'
    ? HUMAN_SETTLEMENT_LANDMARK_HEIGHT
    : HUMAN_SETTLEMENT_PLOT_HEIGHT;
  const foot = Number.parseFloat(position.top) / 100 + height * 0.83;
  return Math.max(5, Math.min(17, Math.round(5 + foot * 18)));
}
