import React, { memo, useState } from 'react';
import { Image, View } from 'react-native';
import type { ReactNode } from 'react';
import { getProductionAssetSource } from '../productionAssets';

/**
 * Battle-stage sprite only. Portrait rails/Army cards keep the approved art.
 * Never display an empty actor while Android decodes a newly added PNG.
 * Exact source IDs are vetted separately by directionalStageModel.
 */
export const DirectionalStageFigure = memo(function DirectionalStageFigure({
  assetId, size, fallback
}: { assetId: string | null; size: number; fallback: ReactNode }) {
  const [badSource, setBadSource] = useState<string | null>(null);
  const [readySource, setReadySource] = useState<string | null>(null);
  const source = assetId ? getProductionAssetSource(assetId) : null;
  if (!assetId || !source || badSource === assetId) return <>{fallback}</>;

  const ready = readySource === assetId;
  return <View pointerEvents="none" accessible={false}
    testID={'directional-stage-' + assetId}
    style={{ width: size, height: size, overflow: 'visible' }}>
    {!ready ? fallback : null}
    <Image source={source} resizeMode="contain" fadeDuration={0}
      onLoad={() => setReadySource(assetId)}
      onError={() => { setBadSource(assetId); setReadySource(null); }}
      style={{ position: 'absolute', width: size, height: size, opacity: ready ? 1 : 0 }} />
  </View>;
});
