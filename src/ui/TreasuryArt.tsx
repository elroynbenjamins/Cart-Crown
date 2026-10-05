import React, { useCallback, useState } from 'react';
import { Image, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { getProductionAssetSource, uiProductionAsset } from './productionAssets';

export type TreasurySpriteKind =
  | 'gold'
  | 'wood'
  | 'stone'
  | 'iron'
  | 'provisions'
  | 'victory_cache';

const cells: Record<TreasurySpriteKind, { column: number; row: number }> = {
  gold: { column: 0, row: 0 },
  wood: { column: 1, row: 0 },
  stone: { column: 2, row: 0 },
  iron: { column: 0, row: 1 },
  provisions: { column: 1, row: 1 },
  victory_cache: { column: 2, row: 1 }
};

/** One transparent atlas, clipped to an equal cell without stretching the art. */
export function TreasurySprite({
  kind,
  size = 26,
  children
}: {
  kind: TreasurySpriteKind;
  size?: number;
  children?: React.ReactNode;
}) {
  const atlas = uiProductionAsset('treasury_atlas');
  const source = getProductionAssetSource(atlas.id);
  const [failedSource, setFailedSource] = useState<ImageSourcePropType | null>(null);
  const onError = useCallback(() => {
    if (source) setFailedSource(source);
  }, [source]);
  const cell = cells[kind];
  const cellWidth = atlas.width / 3;
  const cellHeight = atlas.height / 2;
  const scale = size / Math.max(cellWidth, cellHeight);

  return (
    <View
      testID={'treasury-sprite-' + kind}
      pointerEvents="none"
      accessible={false}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      {source && failedSource !== source ? (
        <View
          style={{
            width: cellWidth * scale,
            height: cellHeight * scale,
            overflow: 'hidden'
          }}
        >
          <Image
            testID={'treasury-atlas-' + kind}
            source={source}
            resizeMode="stretch"
            resizeMethod="resize"
            fadeDuration={0}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            onError={onError}
            style={{
              position: 'absolute',
              left: -cell.column * cellWidth * scale,
              top: -cell.row * cellHeight * scale,
              width: atlas.width * scale,
              height: atlas.height * scale
            }}
          />
        </View>
      ) : children}
    </View>
  );
}
