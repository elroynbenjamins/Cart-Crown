import React, { memo, useState } from 'react';
import { Image, View } from 'react-native';
import type { ReactNode } from 'react';
import { getProductionAssetSource } from '../productionAssets';

/**
 * Stays dormant until reviewed, literal Metro asset entries are present.
 * Crucially it changes ONLY the actor on the portrait battlefield stage;
 * original portrait rails, loadout icons and all fallbacks are untouched.
 */
export const DirectionalStageFigure = memo(function DirectionalStageFigure({
  assetId, size, fallback
}: { assetId: string | null; size: number; fallback: ReactNode }) {
  const [badSource, setBadSource] = useState<string | null>(null);
  const source = assetId ? getProductionAssetSource(assetId) : null;
  if (!assetId || !source || badSource === assetId) return <>{fallback}</>;
  return <View pointerEvents="none" accessible={false} testID={'directional-stage-' + assetId}
    style={{ width: size, height: size }}>
    <Image source={source} resizeMode="contain" fadeDuration={0}
      onError={() => setBadSource(assetId)}
      style={{ width: size, height: size }} />
  </View>;
});
