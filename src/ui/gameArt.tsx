import React from 'react';
import { View } from 'react-native';

type PaletteKey =
  | 'outline'
  | 'human'
  | 'humanLight'
  | 'skin'
  | 'leather'
  | 'brown'
  | 'brownLight'
  | 'steel'
  | 'steelDark'
  | 'cloth'
  | 'roof'
  | 'roofLight'
  | 'stone'
  | 'stoneLight'
  | 'wood'
  | 'gold'
  | 'green'
  | 'greenLight';

type PixelPart = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: PaletteKey;
};

type ArtKey =
  | 'human_infantry'
  | 'human_archer'
  | 'human_scout'
  | 'human_scout_rider'
  | 'human_cavalryman'
  | 'human_lancer'
  | 'human_mounted_archer'
  | 'eq_sword'
  | 'eq_spear'
  | 'eq_bow'
  | 'eq_shield'
  | 'eq_armor'
  | 'eq_horse'
  | 'building_hall'
  | 'building_barracks'
  | 'building_forge'
  | 'building_wagonwright'
  | 'building_quartermaster'
  | 'building_war_room'
  | 'building_stable'
  | 'building_signal_tower'
  | 'building_officer_academy';

const palette: Record<PaletteKey, string> = {
  outline: '#182027',
  human: '#527AA7',
  humanLight: '#7FA6CC',
  skin: '#D3A378',
  leather: '#73513D',
  brown: '#795139',
  brownLight: '#A87850',
  steel: '#ADB7BB',
  steelDark: '#64727A',
  cloth: '#E6DBC5',
  roof: '#8D4732',
  roofLight: '#C06B48',
  stone: '#858A88',
  stoneLight: '#B5B4AA',
  wood: '#6F4932',
  gold: '#D9A84E',
  green: '#5C7242',
  greenLight: '#82965D'
};

const sprites: Record<ArtKey, PixelPart[]> = {
  human_infantry: [
    { x: 8, y: 3, w: 4, h: 4, color: 'skin' },
    { x: 7, y: 2, w: 6, h: 2, color: 'steelDark' },
    { x: 6, y: 7, w: 8, h: 7, color: 'human' },
    { x: 7, y: 8, w: 6, h: 2, color: 'humanLight' },
    { x: 6, y: 12, w: 8, h: 2, color: 'leather' },
    { x: 7, y: 14, w: 2, h: 4, color: 'leather' },
    { x: 11, y: 14, w: 2, h: 4, color: 'leather' },
    { x: 6, y: 18, w: 3, h: 1, color: 'outline' },
    { x: 11, y: 18, w: 3, h: 1, color: 'outline' },
    { x: 4, y: 8, w: 2, h: 5, color: 'skin' },
    { x: 14, y: 8, w: 2, h: 5, color: 'skin' },
    { x: 2, y: 9, w: 1, h: 8, color: 'steel' },
    { x: 1, y: 16, w: 3, h: 1, color: 'steelDark' },
    { x: 16, y: 9, w: 3, h: 6, color: 'wood' },
    { x: 17, y: 10, w: 2, h: 4, color: 'humanLight' }
  ],
  human_archer: [
    { x: 8, y: 3, w: 4, h: 4, color: 'skin' },
    { x: 8, y: 2, w: 5, h: 2, color: 'leather' },
    { x: 6, y: 7, w: 8, h: 7, color: 'human' },
    { x: 7, y: 12, w: 7, h: 2, color: 'leather' },
    { x: 7, y: 14, w: 2, h: 4, color: 'leather' },
    { x: 11, y: 14, w: 2, h: 4, color: 'leather' },
    { x: 4, y: 8, w: 3, h: 2, color: 'skin' },
    { x: 13, y: 8, w: 3, h: 2, color: 'skin' },
    { x: 16, y: 5, w: 1, h: 11, color: 'brownLight' },
    { x: 17, y: 6, w: 1, h: 2, color: 'brownLight' },
    { x: 18, y: 8, w: 1, h: 5, color: 'brownLight' },
    { x: 17, y: 13, w: 1, h: 2, color: 'brownLight' },
    { x: 8, y: 9, w: 10, h: 1, color: 'steel' },
    { x: 6, y: 18, w: 3, h: 1, color: 'outline' },
    { x: 11, y: 18, w: 3, h: 1, color: 'outline' }
  ],
  human_scout: [
    { x: 8, y: 4, w: 4, h: 3, color: 'skin' },
    { x: 7, y: 2, w: 6, h: 4, color: 'human' },
    { x: 6, y: 7, w: 8, h: 7, color: 'outline' },
    { x: 7, y: 8, w: 6, h: 6, color: 'human' },
    { x: 5, y: 9, w: 2, h: 4, color: 'leather' },
    { x: 13, y: 9, w: 2, h: 4, color: 'leather' },
    { x: 7, y: 14, w: 2, h: 4, color: 'leather' },
    { x: 11, y: 14, w: 2, h: 4, color: 'leather' },
    { x: 4, y: 11, w: 1, h: 5, color: 'steel' },
    { x: 3, y: 15, w: 3, h: 1, color: 'steelDark' },
    { x: 6, y: 18, w: 3, h: 1, color: 'outline' },
    { x: 11, y: 18, w: 3, h: 1, color: 'outline' }
  ],
  human_scout_rider: [
    { x: 4, y: 11, w: 11, h: 5, color: 'brown' },
    { x: 14, y: 9, w: 4, h: 5, color: 'brownLight' },
    { x: 15, y: 8, w: 2, h: 2, color: 'brownLight' },
    { x: 5, y: 16, w: 2, h: 3, color: 'outline' },
    { x: 11, y: 16, w: 2, h: 3, color: 'outline' },
    { x: 2, y: 11, w: 3, h: 2, color: 'brown' },
    { x: 8, y: 5, w: 4, h: 6, color: 'human' },
    { x: 9, y: 3, w: 3, h: 3, color: 'skin' },
    { x: 9, y: 2, w: 4, h: 2, color: 'outline' },
    { x: 7, y: 8, w: 2, h: 4, color: 'leather' }
  ],
  human_cavalryman: [
    { x: 4, y: 11, w: 11, h: 5, color: 'brown' },
    { x: 14, y: 9, w: 4, h: 5, color: 'brownLight' },
    { x: 15, y: 8, w: 2, h: 2, color: 'brownLight' },
    { x: 5, y: 16, w: 2, h: 3, color: 'outline' },
    { x: 11, y: 16, w: 2, h: 3, color: 'outline' },
    { x: 8, y: 5, w: 4, h: 6, color: 'human' },
    { x: 9, y: 3, w: 3, h: 3, color: 'skin' },
    { x: 8, y: 2, w: 5, h: 2, color: 'steelDark' },
    { x: 6, y: 7, w: 2, h: 5, color: 'steel' },
    { x: 2, y: 7, w: 1, h: 8, color: 'steel' },
    { x: 1, y: 14, w: 3, h: 1, color: 'steelDark' }
  ],
  human_lancer: [
    { x: 4, y: 11, w: 11, h: 5, color: 'brownLight' },
    { x: 14, y: 9, w: 4, h: 5, color: 'brownLight' },
    { x: 15, y: 8, w: 2, h: 2, color: 'brownLight' },
    { x: 5, y: 16, w: 2, h: 3, color: 'outline' },
    { x: 11, y: 16, w: 2, h: 3, color: 'outline' },
    { x: 8, y: 5, w: 4, h: 6, color: 'human' },
    { x: 9, y: 3, w: 3, h: 3, color: 'skin' },
    { x: 8, y: 2, w: 5, h: 2, color: 'steelDark' },
    { x: 12, y: 1, w: 1, h: 12, color: 'wood' },
    { x: 11, y: 0, w: 3, h: 2, color: 'steel' }
  ],
  human_mounted_archer: [
    { x: 4, y: 11, w: 11, h: 5, color: 'brown' },
    { x: 14, y: 9, w: 4, h: 5, color: 'brownLight' },
    { x: 15, y: 8, w: 2, h: 2, color: 'brownLight' },
    { x: 5, y: 16, w: 2, h: 3, color: 'outline' },
    { x: 11, y: 16, w: 2, h: 3, color: 'outline' },
    { x: 8, y: 5, w: 4, h: 6, color: 'human' },
    { x: 9, y: 3, w: 3, h: 3, color: 'skin' },
    { x: 13, y: 5, w: 1, h: 8, color: 'brownLight' },
    { x: 14, y: 6, w: 1, h: 2, color: 'brownLight' },
    { x: 15, y: 8, w: 1, h: 4, color: 'brownLight' },
    { x: 9, y: 7, w: 7, h: 1, color: 'steel' }
  ],
  eq_sword: [
    { x: 9, y: 2, w: 2, h: 11, color: 'steel' },
    { x: 8, y: 3, w: 1, h: 8, color: 'steelDark' },
    { x: 6, y: 12, w: 7, h: 2, color: 'gold' },
    { x: 9, y: 14, w: 2, h: 4, color: 'leather' }
  ],
  eq_spear: [
    { x: 9, y: 4, w: 2, h: 14, color: 'wood' },
    { x: 8, y: 1, w: 4, h: 4, color: 'steel' },
    { x: 9, y: 0, w: 2, h: 2, color: 'steelDark' }
  ],
  eq_bow: [
    { x: 6, y: 3, w: 2, h: 3, color: 'brownLight' },
    { x: 5, y: 6, w: 2, h: 8, color: 'brownLight' },
    { x: 6, y: 14, w: 2, h: 3, color: 'brownLight' },
    { x: 13, y: 3, w: 1, h: 14, color: 'cloth' },
    { x: 7, y: 9, w: 7, h: 1, color: 'steel' }
  ],
  eq_shield: [
    { x: 5, y: 3, w: 10, h: 12, color: 'steelDark' },
    { x: 6, y: 4, w: 8, h: 9, color: 'steel' },
    { x: 7, y: 5, w: 6, h: 8, color: 'human' },
    { x: 9, y: 5, w: 2, h: 8, color: 'steel' }
  ],
  eq_armor: [
    { x: 6, y: 5, w: 8, h: 10, color: 'steelDark' },
    { x: 4, y: 6, w: 3, h: 6, color: 'steel' },
    { x: 13, y: 6, w: 3, h: 6, color: 'steel' },
    { x: 8, y: 5, w: 4, h: 3, color: 'steel' },
    { x: 7, y: 9, w: 6, h: 1, color: 'human' }
  ],
  eq_horse: [
    { x: 4, y: 9, w: 10, h: 6, color: 'brown' },
    { x: 13, y: 6, w: 4, h: 6, color: 'brownLight' },
    { x: 14, y: 5, w: 2, h: 2, color: 'brownLight' },
    { x: 5, y: 15, w: 2, h: 4, color: 'outline' },
    { x: 11, y: 15, w: 2, h: 4, color: 'outline' },
    { x: 2, y: 9, w: 3, h: 2, color: 'brown' }
  ],
  building_hall: [
    { x: 4, y: 9, w: 12, h: 8, color: 'stoneLight' },
    { x: 3, y: 6, w: 14, h: 4, color: 'roof' },
    { x: 6, y: 4, w: 8, h: 3, color: 'roofLight' },
    { x: 8, y: 11, w: 4, h: 6, color: 'wood' },
    { x: 5, y: 12, w: 2, h: 2, color: 'human' },
    { x: 13, y: 12, w: 2, h: 2, color: 'human' }
  ],
  building_barracks: [
    { x: 4, y: 9, w: 12, h: 8, color: 'stoneLight' },
    { x: 3, y: 6, w: 14, h: 4, color: 'roof' },
    { x: 7, y: 12, w: 3, h: 5, color: 'wood' },
    { x: 12, y: 11, w: 2, h: 2, color: 'human' }
  ],
  building_forge: [
    { x: 4, y: 10, w: 11, h: 7, color: 'stone' },
    { x: 3, y: 7, w: 13, h: 4, color: 'roof' },
    { x: 12, y: 3, w: 3, h: 6, color: 'stoneDark' as PaletteKey },
    { x: 7, y: 12, w: 4, h: 4, color: 'outline' },
    { x: 8, y: 13, w: 2, h: 2, color: 'gold' }
  ],
  building_wagonwright: [
    { x: 4, y: 9, w: 12, h: 8, color: 'wood' },
    { x: 3, y: 6, w: 14, h: 4, color: 'roofLight' },
    { x: 7, y: 11, w: 5, h: 5, color: 'brownLight' },
    { x: 5, y: 15, w: 3, h: 3, color: 'outline' },
    { x: 12, y: 15, w: 3, h: 3, color: 'outline' }
  ],
  building_quartermaster: [
    { x: 4, y: 9, w: 12, h: 8, color: 'stoneLight' },
    { x: 3, y: 6, w: 14, h: 4, color: 'roofLight' },
    { x: 6, y: 12, w: 3, h: 3, color: 'wood' },
    { x: 11, y: 12, w: 3, h: 3, color: 'wood' },
    { x: 8, y: 4, w: 4, h: 2, color: 'gold' }
  ],
  building_war_room: [
    { x: 4, y: 9, w: 12, h: 8, color: 'stone' },
    { x: 3, y: 6, w: 14, h: 4, color: 'roof' },
    { x: 6, y: 11, w: 8, h: 3, color: 'human' },
    { x: 9, y: 13, w: 2, h: 4, color: 'wood' }
  ],
  building_stable: [
    { x: 3, y: 9, w: 14, h: 8, color: 'wood' },
    { x: 2, y: 6, w: 16, h: 4, color: 'roofLight' },
    { x: 7, y: 11, w: 6, h: 6, color: 'brown' },
    { x: 4, y: 12, w: 2, h: 2, color: 'brownLight' }
  ],
  building_signal_tower: [
    { x: 8, y: 3, w: 5, h: 14, color: 'stoneLight' },
    { x: 7, y: 2, w: 7, h: 3, color: 'stone' },
    { x: 9, y: 7, w: 3, h: 2, color: 'outline' },
    { x: 10, y: 0, w: 1, h: 3, color: 'wood' },
    { x: 11, y: 0, w: 4, h: 2, color: 'human' }
  ],
  building_officer_academy: [
    { x: 4, y: 9, w: 12, h: 8, color: 'stoneLight' },
    { x: 3, y: 6, w: 14, h: 4, color: 'roof' },
    { x: 5, y: 4, w: 3, h: 3, color: 'stone' },
    { x: 12, y: 4, w: 3, h: 3, color: 'stone' },
    { x: 9, y: 11, w: 2, h: 6, color: 'wood' },
    { x: 8, y: 7, w: 4, h: 2, color: 'gold' }
  ]
};

// Small helper so the sprites stay resolution-independent while retaining hard pixel edges.
function PixelSprite({ artKey, size }: { artKey: ArtKey; size: number }) {
  const unit = size / 20;
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {sprites[artKey].map((part, index) => (
        <View
          key={artKey + '-' + String(index)}
          style={{
            position: 'absolute',
            left: part.x * unit,
            top: part.y * unit,
            width: part.w * unit,
            height: part.h * unit,
            backgroundColor: palette[part.color]
          }}
        />
      ))}
    </View>
  );
}

export function unitArtKey(className: string): ArtKey {
  const value = className.toLowerCase();
  if (value.includes('mounted archer')) return 'human_mounted_archer';
  if (value.includes('scout rider')) return 'human_scout_rider';
  if (value.includes('lancer')) return 'human_lancer';
  if (value.includes('cavalry')) return 'human_cavalryman';
  if (value.includes('archer')) return 'human_archer';
  if (value.includes('scout') || value.includes('ranger')) return 'human_scout';
  return 'human_infantry';
}

export function UnitSprite({
  className,
  size = 52
}: {
  className: string;
  size?: number;
}) {
  return <PixelSprite artKey={unitArtKey(className)} size={size} />;
}

export function EquipmentSprite({
  equipmentId,
  size = 38
}: {
  equipmentId: string;
  size?: number;
}) {
  const value = equipmentId.toLowerCase();
  let key: ArtKey = 'eq_sword';

  if (value.includes('bow')) key = 'eq_bow';
  else if (value.includes('spear') || value.includes('pike') || value.includes('lance')) key = 'eq_spear';
  else if (value.includes('shield')) key = 'eq_shield';
  else if (value.includes('armor') || value.includes('mail') || value.includes('plate') || value.includes('coat')) key = 'eq_armor';
  else if (value.includes('horse')) key = 'eq_horse';

  return <PixelSprite artKey={key} size={size} />;
}

export function BuildingSprite({
  buildingId,
  size = 50
}: {
  buildingId: string;
  size?: number;
}) {
  const keyById: Record<string, ArtKey> = {
    hall: 'building_hall',
    barracks: 'building_barracks',
    forge: 'building_forge',
    wagonwright: 'building_wagonwright',
    quartermaster: 'building_quartermaster',
    war_room: 'building_war_room',
    stable: 'building_stable',
    signal_tower: 'building_signal_tower',
    officer_academy: 'building_officer_academy'
  };

  return <PixelSprite artKey={keyById[buildingId] ?? 'building_hall'} size={size} />;
}
