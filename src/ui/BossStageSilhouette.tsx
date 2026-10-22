import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { BossSignature } from './bossPresentation';

// Silhouette extensions sit BEHIND the established boss artwork. They use no
// timers, random generation, textures, extra combat units or damage state.
export type BossStagePiece = Readonly<{
  x: number; y: number; width: number; height: number;
  rotate?: number; shape: 'plate' | 'spike' | 'staff' | 'banner' | 'ring';
}>;

const bossPieces: Readonly<Record<BossSignature, readonly BossStagePiece[]>> = {
  toll_gate: [
    { x: 7, y: 25, width: 9, height: 63, shape: 'plate' },
    { x: 84, y: 25, width: 9, height: 63, shape: 'plate' },
    { x: 11, y: 19, width: 78, height: 9, shape: 'plate' }
  ],
  riders_standard: [
    { x: 6, y: 7, width: 5, height: 84, shape: 'staff' },
    { x: 10, y: 12, width: 31, height: 29, shape: 'banner' },
    { x: 83, y: 7, width: 5, height: 84, rotate: -14, shape: 'staff' }
  ],
  iron_provost: [
    { x: 2, y: 22, width: 27, height: 25, shape: 'plate', rotate: -19 },
    { x: 71, y: 22, width: 27, height: 25, shape: 'plate', rotate: 19 },
    { x: 45, y: 7, width: 10, height: 23, shape: 'spike' }
  ],
  frostgate_marshal: [
    { x: 5, y: 7, width: 5, height: 83, shape: 'staff', rotate: 14 },
    { x: 6, y: 15, width: 25, height: 17, shape: 'banner' },
    { x: 73, y: 13, width: 20, height: 37, shape: 'spike', rotate: -16 }
  ],
  greywatch_pretender: [
    { x: 2, y: 12, width: 25, height: 72, shape: 'banner', rotate: -13 },
    { x: 73, y: 12, width: 25, height: 72, shape: 'banner', rotate: 13 },
    { x: 39, y: 0, width: 22, height: 26, shape: 'spike' }
  ],
  ashen_gate: [
    { x: 6, y: 12, width: 11, height: 78, shape: 'staff' },
    { x: 83, y: 12, width: 11, height: 78, shape: 'staff' },
    { x: 10, y: 8, width: 80, height: 16, shape: 'ring' }
  ],
  hollow_roots: [
    { x: 15, y: 1, width: 9, height: 43, shape: 'staff', rotate: -33 },
    { x: 76, y: 1, width: 9, height: 43, shape: 'staff', rotate: 33 },
    { x: 36, y: 0, width: 9, height: 28, shape: 'spike', rotate: -18 },
    { x: 59, y: 0, width: 9, height: 28, shape: 'spike', rotate: 18 }
  ],
  stonejaw: [
    { x: 2, y: 12, width: 24, height: 29, shape: 'spike', rotate: -35 },
    { x: 74, y: 12, width: 24, height: 29, shape: 'spike', rotate: 35 },
    { x: 1, y: 42, width: 24, height: 25, shape: 'plate' },
    { x: 75, y: 42, width: 24, height: 25, shape: 'plate' }
  ],
  ashen_regent: [
    { x: 13, y: 13, width: 21, height: 71, shape: 'banner', rotate: -14 },
    { x: 66, y: 13, width: 21, height: 71, shape: 'banner', rotate: 14 },
    { x: 28, y: 2, width: 12, height: 23, shape: 'spike', rotate: -18 },
    { x: 44, y: 0, width: 12, height: 26, shape: 'spike' },
    { x: 60, y: 2, width: 12, height: 23, shape: 'spike', rotate: 18 }
  ],
  beacon: [
    { x: 17, y: 6, width: 66, height: 61, shape: 'ring' },
    { x: 46, y: 0, width: 8, height: 75, shape: 'staff' },
    { x: 31, y: 7, width: 12, height: 22, shape: 'spike', rotate: -20 },
    { x: 57, y: 7, width: 12, height: 22, shape: 'spike', rotate: 20 }
  ]
};

/** Names and styles stay keyed to exact authored boss encounters. */
export function bossStagePieces(signature: BossSignature): readonly BossStagePiece[] {
  return bossPieces[signature];
}

/** Additional boss silhouette only: never replace the named EnemySprite itself. */
export const BossStageSilhouette = memo(function BossStageSilhouette({
  signature, size, material, light
}: { signature: BossSignature; size: number; material: string; light: string }) {
  const width = Math.max(20, Math.min(100, Number.isFinite(size) ? size : 40));
  const scale = width * 1.34;
  const pieces = bossStagePieces(signature);
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    testID={'boss-stage-silhouette-' + signature}
    style={[styles.canvas, { width: scale, height: scale,
      left: (width - scale) / 2, top: (width - scale) / 2 }]}>
    {pieces.map((piece, index) =>
      <View key={index} style={{
        position: 'absolute', left: scale * piece.x / 100, top: scale * piece.y / 100,
        width: scale * piece.width / 100, height: scale * piece.height / 100,
        transform: [{ rotate: `${piece.rotate ?? 0}deg` }],
        borderColor: light,
        borderWidth: piece.shape === 'ring' ? 1.5 : piece.shape === 'banner' ? 1 : 0,
        borderRadius: piece.shape === 'ring' ? scale * Math.min(piece.width, piece.height) / 2 : 1,
        backgroundColor: piece.shape === 'ring' ? 'transparent' :
          piece.shape === 'spike' || piece.shape === 'staff' ? light : material,
        opacity: piece.shape === 'ring' ? .76 : piece.shape === 'plate' ? .85 : .93
      }} />
    )}
  </View>;
});

const styles = StyleSheet.create({
  canvas: { position: 'absolute', zIndex: 0, overflow: 'visible' }
});
