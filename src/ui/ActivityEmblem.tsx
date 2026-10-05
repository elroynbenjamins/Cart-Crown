import React from 'react';
import { View } from 'react-native';
import type { SideModeId } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';

type PixelPart = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  rotate?: string;
};

/** Small, static pixel emblems: each activity has a distinct silhouette. */
export function ActivityEmblem({
  mode,
  size = 56
}: {
  mode: SideModeId;
  size?: number;
}) {
  const { theme } = useGameTheme();
  const colors = theme.colors;
  const scale = size / 56;
  const accent =
    mode === 'relic_hunts' ? colors.gold
      : mode === 'sieges' ? colors.orc
        : mode === 'expeditions' ? colors.elf
          : mode === 'kingdom_defense' ? colors.primary
            : mode === 'formation_trials' ? colors.info
              : colors.human;
  const ink = colors.text;
  const ground = colors.surface1;
  const muted = colors.textMuted;
  const parts: PixelPart[] = [];
  const part = (x: number, y: number, w: number, h: number, color: string, rotate?: string) => {
    parts.push({ x, y, w, h, color, rotate });
  };

  if (mode === 'war_table') {
    // A sealed field contract, with crossed swords above its lower edge.
    part(13, 10, 30, 34, muted);
    part(16, 13, 24, 28, ground);
    part(20, 17, 15, 2, accent);
    part(20, 22, 10, 2, muted);
    part(21, 26, 3, 19, ink, '-42deg');
    part(32, 26, 3, 19, ink, '42deg');
    part(14, 38, 10, 3, accent, '-42deg');
    part(33, 38, 10, 3, accent, '42deg');
  } else if (mode === 'formation_trials') {
    // Nine formation cells, with a visibly different front line and flank.
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        const active = row === 0 || (row === 2 && column === 1);
        part(11 + column * 12, 11 + row * 12, 9, 9, active ? accent : muted);
        part(13 + column * 12, 13 + row * 12, 5, 5, active ? ground : colors.surface3);
      }
    }
  } else if (mode === 'kingdom_defense') {
    // A broad battlement and a central shield.
    part(10, 20, 36, 23, muted);
    [10, 24, 38].forEach(x => part(x, 12, 8, 10, ink));
    part(13, 24, 30, 19, ground);
    part(20, 22, 16, 16, accent);
    part(23, 38, 10, 4, accent);
    part(26, 42, 4, 3, accent);
    part(26, 25, 4, 13, ground);
    part(23, 28, 10, 3, ground);
  } else if (mode === 'expeditions') {
    // A winding trail between a supply stop and the destination flag.
    part(12, 37, 6, 6, accent);
    part(17, 36, 12, 3, muted);
    part(26, 27, 3, 12, muted);
    part(26, 26, 12, 3, muted);
    part(35, 19, 3, 10, muted);
    part(34, 10, 3, 14, ink);
    part(37, 10, 10, 7, accent);
    part(20, 27, 5, 5, colors.gold);
    part(10, 12, 3, 10, accent);
    part(7, 15, 9, 4, accent);
  } else if (mode === 'sieges') {
    // A breached gate and an advancing assault arrow.
    part(12, 20, 10, 23, muted);
    part(34, 20, 10, 23, muted);
    part(12, 12, 5, 10, ink);
    part(19, 12, 5, 10, ink);
    part(32, 12, 5, 10, ink);
    part(39, 12, 5, 10, ink);
    part(20, 21, 16, 6, muted);
    part(24, 24, 8, 10, ground);
    part(26, 30, 4, 16, accent);
    part(23, 32, 10, 4, accent);
    part(20, 35, 16, 3, accent);
    part(23, 27, 3, 5, accent);
    part(30, 27, 3, 5, accent);
  } else {
    // A faceted relic, lifted above a stone pedestal.
    part(23, 11, 10, 3, accent);
    part(18, 14, 20, 10, accent);
    part(21, 24, 14, 5, accent);
    part(25, 29, 6, 4, accent);
    part(25, 14, 3, 12, ink);
    part(21, 17, 5, 3, ink);
    part(21, 37, 14, 4, muted);
    part(16, 41, 24, 4, ink);
    part(10, 21, 3, 3, accent);
    part(43, 21, 3, 3, accent);
    part(13, 10, 2, 4, muted);
    part(41, 10, 2, 4, muted);
  }

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: 12,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: accent + '70'
      }}
    >
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: accent }} />
      {parts.map((pixel, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: pixel.x * scale,
            top: pixel.y * scale,
            width: pixel.w * scale,
            height: pixel.h * scale,
            backgroundColor: pixel.color,
            transform: pixel.rotate ? [{ rotate: pixel.rotate }] : undefined
          }}
        />
      ))}
    </View>
  );
}
