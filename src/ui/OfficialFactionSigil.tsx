import React from 'react';
import { Image, View } from 'react-native';
import type { FactionId } from '../game/types';

/**
 * Approved three-realm heraldry, shared with the launcher / save-select brand.
 * These are the exact insignias painted on its standards, rather than a
 * second independent interpretation of the Orc, Elf, or Human factions.
 *
 * Regions are pixel coordinates on the reviewed 1254×1254 master artwork.
 * Use a clipped, scaled Image instead of an external image processor or
 * remote asset; Metro packages the image once and React Native caches it.
 */
export const officialHeraldry = {
  orc: { emblem: 'boar', flag: 'red', centerX: 195, centerY: 635, crop: 236, bg: '#781A1B', border: '#DBAF60' },
  elf: { emblem: 'stag', flag: 'green', centerX: 1081, centerY: 623, crop: 236, bg: '#0C442E', border: '#DBC998' },
  human: { emblem: 'fleur-de-lis', flag: 'blue', centerX: 630, centerY: 956, crop: 236, bg: '#11346D', border: '#E5B95F' }
} as const;

const APPROVED_MASTER = require('../../assets/branding/approved-three-faction-logo.png');
const MASTER_SIZE = 1254;

export function OfficialFactionSigil({ faction, size = 46 }: { faction: FactionId; size?: number }) {
  const symbol = officialHeraldry[faction];
  const scale = size / symbol.crop;
  const width = MASTER_SIZE * scale;
  const left = (symbol.crop / 2 - symbol.centerX) * scale;
  const top = (symbol.crop / 2 - symbol.centerY) * scale;
  return (
    <View
      testID={'faction-official-sigil-' + faction}
      accessibilityRole="image"
      accessibilityLabel={faction.charAt(0).toUpperCase() + faction.slice(1) + ' heraldry: ' +
        symbol.emblem + ' on ' + symbol.flag + ' banner'}
      style={{
        width: size, height: size, overflow: 'hidden',
        borderRadius: Math.max(3, size * 0.17),
        borderWidth: Math.max(0.8, size * 0.025),
        borderColor: symbol.border, backgroundColor: symbol.bg
      }}
    >
      <Image
        source={APPROVED_MASTER}
        resizeMode="stretch"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: 'absolute',
          width, height: width,
          left, top
        }}
      />
    </View>
  );
}
