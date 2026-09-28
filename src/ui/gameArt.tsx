import React from 'react';
import { View } from 'react-native';
import type { FactionId, WagonStage } from '../game/types';
import {
  getBuildingVisualKind,
  getEquipmentVisualKind,
  getUnitVisualKind,
  getWagonItemVisualKind
} from '../game/visualManifest';

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
  | 'greenLight'
  | 'elf'
  | 'elfLight'
  | 'orc'
  | 'orcLight'
  | 'food'
  | 'red'
  | 'blue'
  | 'elfSkin'
  | 'orcSkin';

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
  | 'building_officer_academy'
  | 'resource_gold'
  | 'resource_wood'
  | 'resource_stone'
  | 'resource_iron'
  | 'resource_provisions'
  | 'wagon_rations'
  | 'wagon_medicine'
  | 'wagon_banner'
  | 'wagon_repair';

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
  greenLight: '#82965D',
  elf: '#4F7F5B',
  elfLight: '#82B68A',
  orc: '#9A5544',
  orcLight: '#C97960',
  food: '#D8B86E',
  red: '#B44B48',
  blue: '#4F83B6',
  elfSkin: '#D8C7A5',
  orcSkin: '#78934D'
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
    { x: 12, y: 3, w: 3, h: 6, color: 'steelDark' },
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
  ],
  resource_gold: [
    { x: 6, y: 12, w: 8, h: 3, color: 'gold' },
    { x: 7, y: 9, w: 8, h: 3, color: 'gold' },
    { x: 5, y: 6, w: 8, h: 3, color: 'gold' },
    { x: 7, y: 5, w: 4, h: 1, color: 'food' }
  ],
  resource_wood: [
    { x: 4, y: 7, w: 12, h: 4, color: 'wood' },
    { x: 3, y: 11, w: 12, h: 4, color: 'brownLight' },
    { x: 5, y: 6, w: 2, h: 2, color: 'food' },
    { x: 12, y: 13, w: 2, h: 2, color: 'food' }
  ],
  resource_stone: [
    { x: 5, y: 8, w: 10, h: 7, color: 'stone' },
    { x: 7, y: 6, w: 6, h: 3, color: 'stoneLight' },
    { x: 4, y: 11, w: 3, h: 3, color: 'steelDark' }
  ],
  resource_iron: [
    { x: 5, y: 7, w: 10, h: 4, color: 'steel' },
    { x: 4, y: 11, w: 10, h: 4, color: 'steelDark' },
    { x: 7, y: 6, w: 6, h: 1, color: 'cloth' }
  ],
  resource_provisions: [
    { x: 5, y: 8, w: 10, h: 7, color: 'food' },
    { x: 7, y: 6, w: 6, h: 3, color: 'brownLight' },
    { x: 9, y: 9, w: 2, h: 5, color: 'cloth' }
  ],
  wagon_rations: [
    { x: 4, y: 8, w: 12, h: 8, color: 'food' },
    { x: 6, y: 6, w: 8, h: 3, color: 'brownLight' },
    { x: 9, y: 9, w: 2, h: 6, color: 'cloth' }
  ],
  wagon_medicine: [
    { x: 7, y: 6, w: 6, h: 10, color: 'red' },
    { x: 8, y: 4, w: 4, h: 3, color: 'steel' },
    { x: 8, y: 10, w: 4, h: 2, color: 'cloth' }
  ],
  wagon_banner: [
    { x: 6, y: 3, w: 2, h: 14, color: 'wood' },
    { x: 8, y: 4, w: 8, h: 7, color: 'human' },
    { x: 10, y: 6, w: 3, h: 2, color: 'gold' }
  ],
  wagon_repair: [
    { x: 5, y: 7, w: 10, h: 3, color: 'steel' },
    { x: 9, y: 9, w: 3, h: 8, color: 'wood' },
    { x: 4, y: 12, w: 5, h: 2, color: 'steelDark' }
  ]
};

// Small helper so the sprites stay resolution-independent while retaining hard pixel edges.
function factionTint(color: PaletteKey, faction: FactionId) {
  if (color === 'human') {
    return faction === 'elf' ? palette.elf : faction === 'orc' ? palette.orc : palette.human;
  }
  if (color === 'humanLight') {
    return faction === 'elf'
      ? palette.elfLight
      : faction === 'orc'
        ? palette.orcLight
        : palette.humanLight;
  }
  if (color === 'skin') {
    return faction === 'elf'
      ? palette.elfSkin
      : faction === 'orc'
        ? palette.orcSkin
        : palette.skin;
  }
  return palette[color];
}

function PixelSprite({
  artKey,
  size,
  faction = 'human'
}: {
  artKey: ArtKey;
  size: number;
  faction?: FactionId;
}) {
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
            backgroundColor: factionTint(part.color, faction)
          }}
        />
      ))}
    </View>
  );
}

export function unitArtKey(className: string): ArtKey {
  const kind = getUnitVisualKind(className);
  const keyByKind: Record<ReturnType<typeof getUnitVisualKind>, ArtKey> = {
    infantry: 'human_infantry',
    archer: 'human_archer',
    scout: 'human_scout',
    scout_rider: 'human_scout_rider',
    cavalryman: 'human_cavalryman',
    lancer: 'human_lancer',
    mounted_archer: 'human_mounted_archer'
  };
  return keyByKind[kind];
}

export function UnitSprite({
  className,
  faction = 'human',
  size = 52
}: {
  className: string;
  faction?: FactionId;
  size?: number;
}) {
  return <PixelSprite artKey={unitArtKey(className)} size={size} faction={faction} />;
}

export function EquipmentSprite({
  equipmentId,
  faction = 'human',
  size = 38
}: {
  equipmentId: string;
  faction?: FactionId;
  size?: number;
}) {
  const kind = getEquipmentVisualKind(equipmentId);
  const keyByKind: Record<ReturnType<typeof getEquipmentVisualKind>, ArtKey> = {
    sword: 'eq_sword',
    spear: 'eq_spear',
    bow: 'eq_bow',
    shield: 'eq_shield',
    armor: 'eq_armor',
    horse: 'eq_horse'
  };
  return <PixelSprite artKey={keyByKind[kind]} size={size} faction={faction} />;
}

export function BuildingSprite({
  buildingId,
  faction = 'human',
  size = 50
}: {
  buildingId: string;
  faction?: FactionId;
  size?: number;
}) {
  const kind = getBuildingVisualKind(buildingId);
  const keyByKind: Record<ReturnType<typeof getBuildingVisualKind>, ArtKey> = {
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
  return <PixelSprite artKey={keyByKind[kind]} size={size} faction={faction} />;
}

export function ResourceSprite({
  resource,
  size = 26
}: {
  resource: 'gold' | 'wood' | 'stone' | 'iron' | 'provisions';
  size?: number;
}) {
  const keyByResource: Record<typeof resource, ArtKey> = {
    gold: 'resource_gold',
    wood: 'resource_wood',
    stone: 'resource_stone',
    iron: 'resource_iron',
    provisions: 'resource_provisions'
  };
  return <PixelSprite artKey={keyByResource[resource]} size={size} />;
}

export function WagonItemSprite({
  itemId,
  size = 28
}: {
  itemId: string;
  size?: number;
}) {
  const kind = getWagonItemVisualKind(itemId);
  const keyByKind: Record<ReturnType<typeof getWagonItemVisualKind>, ArtKey> = {
    rations: 'wagon_rations',
    medicine: 'wagon_medicine',
    banner: 'wagon_banner',
    repair: 'wagon_repair'
  };
  return <PixelSprite artKey={keyByKind[kind]} size={size} />;
}

const stageRanks: Record<WagonStage['id'], number> = {
  camp: 0,
  settlement: 1,
  fort: 2,
  town: 3,
  stronghold: 4,
  capital: 5,
  grand: 6
};

export function SettlementStageSprite({
  stageId,
  faction = 'human',
  size = 72
}: {
  stageId: WagonStage['id'];
  faction?: FactionId;
  size?: number;
}) {
  const rank = stageRanks[stageId] ?? 0;
  const wallColor = faction === 'elf' ? palette.elf : faction === 'orc' ? palette.orc : palette.human;
  return (
    <View style={{ width: size, height: size * 0.78, position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          left: size * 0.08,
          right: size * 0.08,
          bottom: size * 0.04,
          height: size * 0.13,
          backgroundColor: palette.green
        }}
      />
      <View style={{ position: 'absolute', left: size * 0.27, bottom: size * 0.08 }}>
        <BuildingSprite buildingId="hall" faction={faction} size={size * 0.48} />
      </View>
      {rank >= 1 ? (
        <View style={{ position: 'absolute', left: size * 0.05, bottom: size * 0.06 }}>
          <BuildingSprite buildingId="barracks" faction={faction} size={size * 0.31} />
        </View>
      ) : null}
      {rank >= 2 ? (
        <>
          <View
            style={{
              position: 'absolute',
              left: size * 0.03,
              right: size * 0.03,
              bottom: size * 0.07,
              height: size * 0.07,
              borderWidth: Math.max(1, size * 0.025),
              borderColor: wallColor
            }}
          />
          <View style={{ position: 'absolute', right: size * 0.02, bottom: size * 0.07 }}>
            <BuildingSprite buildingId="signal_tower" faction={faction} size={size * 0.27} />
          </View>
        </>
      ) : null}
      {rank >= 3 ? (
        <View style={{ position: 'absolute', right: size * 0.18, bottom: size * 0.07 }}>
          <BuildingSprite buildingId="stable" faction={faction} size={size * 0.29} />
        </View>
      ) : null}
      {rank >= 4 ? (
        <View
          style={{
            position: 'absolute',
            left: size * 0.2,
            right: size * 0.2,
            top: size * 0.03,
            height: size * 0.045,
            backgroundColor: palette.gold
          }}
        />
      ) : null}
      {rank >= 5 ? (
        <View
          style={{
            position: 'absolute',
            left: size * 0.44,
            top: 0,
            width: size * 0.12,
            height: size * 0.12,
            backgroundColor: palette.gold
          }}
        />
      ) : null}
      {rank >= 6 ? (
        <View
          style={{
            position: 'absolute',
            left: size * 0.13,
            right: size * 0.13,
            top: size * 0.13,
            height: size * 0.025,
            backgroundColor: palette.gold
          }}
        />
      ) : null}
    </View>
  );
}

export function WagonStageSprite({
  stageId,
  faction = 'human',
  size = 72
}: {
  stageId: WagonStage['id'];
  faction?: FactionId;
  size?: number;
}) {
  const rank = stageRanks[stageId] ?? 0;
  const bodyWidth = size * Math.min(0.8, 0.5 + rank * 0.05);
  const bodyHeight = size * Math.min(0.38, 0.25 + rank * 0.02);
  const left = (size - bodyWidth) / 2;
  const accent = faction === 'elf' ? palette.elf : faction === 'orc' ? palette.orc : palette.human;
  const wheel = size * 0.16;

  return (
    <View style={{ width: size, height: size * 0.66, position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          left,
          bottom: wheel * 0.65,
          width: bodyWidth,
          height: bodyHeight,
          backgroundColor: palette.wood,
          borderWidth: Math.max(1, size * 0.02),
          borderColor: accent
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: left + bodyWidth * 0.12,
          bottom: wheel * 0.65 + bodyHeight * 0.2,
          width: bodyWidth * 0.18,
          height: bodyHeight * 0.52,
          backgroundColor: palette.food
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: left + bodyWidth * 0.12,
          bottom: wheel * 0.65 + bodyHeight * 0.2,
          width: bodyWidth * 0.18,
          height: bodyHeight * 0.52,
          backgroundColor: rank >= 3 ? palette.steel : palette.brownLight
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: left + bodyWidth * 0.14,
          bottom: 0,
          width: wheel,
          height: wheel,
          borderRadius: wheel / 2,
          backgroundColor: palette.outline,
          borderWidth: Math.max(1, size * 0.025),
          borderColor: palette.brownLight
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: left + bodyWidth * 0.14,
          bottom: 0,
          width: wheel,
          height: wheel,
          borderRadius: wheel / 2,
          backgroundColor: palette.outline,
          borderWidth: Math.max(1, size * 0.025),
          borderColor: palette.brownLight
        }}
      />
      {rank >= 2 ? (
        <View
          style={{
            position: 'absolute',
            left: size * 0.49,
            top: size * 0.01,
            width: Math.max(2, size * 0.035),
            height: size * 0.23,
            backgroundColor: palette.wood
          }}
        />
      ) : null}
      {rank >= 2 ? (
        <View
          style={{
            position: 'absolute',
            left: size * 0.52,
            top: size * 0.01,
            width: size * 0.19,
            height: size * 0.11,
            backgroundColor: accent
          }}
        />
      ) : null}
    </View>
  );
}
