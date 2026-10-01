import React, { memo, useState } from 'react';
import { Image, View } from 'react-native';
import type { ReactNode } from 'react';
import { getProductionAssetSource } from '../productionAssets';
import type { ArtKey } from './model';
import { humanArtFrames } from './humanArt';

// These frames exclude the transparent production padding. UI is always real text.
const frames: Record<ArtKey, readonly [number, number, number, number]> = {
  ...humanArtFrames,
  captain_unit: [0, 0, 256, 256], ranger_unit: [0, 0, 256, 256], priest_unit: [0, 0, 256, 256],
  raider_unit: [0, 0, 256, 256], missile_unit: [0, 0, 256, 256], warg_unit: [0, 0, 256, 256],
  captain_portrait: [8, 8, 240, 240], ranger_portrait: [8, 8, 240, 240],
  priest_portrait: [8, 8, 240, 240], raider_portrait: [8, 8, 240, 240],
  missile_portrait: [8, 8, 240, 240], warg_portrait: [8, 8, 240, 240],
  greenkeep_sky: [8, 36, 240, 184], greenkeep_ground: [8, 99, 240, 57],
  greenkeep_location: [8, 59, 240, 138]
};

export const ReferenceArt = memo(function ReferenceArt({ art, width, height = width, fallback, onError }: {
  art: ArtKey; width: number; height?: number; fallback?: ReactNode; onError?: () => void;
}) {
  const [failedArt, setFailedArt] = useState<ArtKey | null>(null);
  const source = getProductionAssetSource('battle_portrait.' + art);
  if (!source || failedArt === art) return <View style={{ width, height }}>{fallback}</View>;
  const [x, y, w, h] = frames[art];
  const scale = Math.max(width / w, height / h);
  return (
    <View pointerEvents="none" accessible={false} style={{ width, height, overflow: 'hidden' }}>
      <Image
        source={source}
        resizeMode="stretch"
        fadeDuration={0}
        onError={() => { setFailedArt(art); onError?.(); }}
        style={{ position: 'absolute', width: 256 * scale, height: 256 * scale,
          left: (width - w * scale) / 2 - x * scale,
          top: (height - h * scale) / 2 - y * scale }}
      />
    </View>
  );
});
