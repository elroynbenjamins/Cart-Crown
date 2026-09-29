// Presentation only: these helpers never change game state or costs.
export function getDecisionFooterLayout(availableHeight: number, fontScale: number) {
  const height = Number.isFinite(availableHeight) ? Math.max(0, availableHeight) : 0;
  const scale = Number.isFinite(fontScale) ? Math.max(1, fontScale) : 1;
  return {
    docked: height >= 560 && scale < 1.6,
    maxHeight: Math.floor(height * 0.4)
  };
}

export function signedStat(value: number): string {
  return value > 0 ? '+' + value : String(value);
}
