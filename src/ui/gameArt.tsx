import { humanFigureForClass } from './portraitBattle/humanArt';
import { ReferenceArt } from './portraitBattle/Art';
import React from 'react';
import { Image, View } from 'react-native';
import type {
  ChapterNode,
  EnemyFantasyThreatFamily,
  FactionId,
  UnitRole,
  WagonStage
} from '../game/types';
import type { EnemyArmyProfileId } from '../game/encounters';
import {
  getBuildingVisualKind,
  getEnemyVisualKind,
  getClassLoadoutVisuals,
  getCommanderVisualKind,
  getEquipmentVisualKind,
  getResourceSiteVisualKind,
  getUnitVisualKind,
  getWagonItemVisualKind
} from '../game/visualManifest';
import {
  buildingProductionAsset,
  commanderProductionAsset,
  enemyProductionAsset,
  equipmentProductionAsset,
  factionCrestProductionAsset,
  getProductionAssetSource,
  resourceProductionAsset,
  resourceSiteProductionAsset,
  storySceneProductionAsset,
  uiProductionAsset,
  unitProductionAsset,
  wagonItemProductionAsset
} from './productionAssets';

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
  | 'wagon_repair'
  | 'enemy_raider'
  | 'enemy_mercenary'
  | 'enemy_ashen'
  | 'enemy_scout'
  | 'enemy_hollow';

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
  ],
  enemy_raider: [
    { x: 8, y: 3, w: 4, h: 4, color: 'skin' },
    { x: 6, y: 2, w: 8, h: 2, color: 'brown' },
    { x: 5, y: 7, w: 10, h: 7, color: 'leather' },
    { x: 6, y: 8, w: 8, h: 2, color: 'red' },
    { x: 4, y: 9, w: 2, h: 5, color: 'skin' },
    { x: 14, y: 9, w: 2, h: 5, color: 'skin' },
    { x: 7, y: 14, w: 2, h: 4, color: 'brown' },
    { x: 11, y: 14, w: 2, h: 4, color: 'brown' },
    { x: 2, y: 9, w: 1, h: 8, color: 'steel' },
    { x: 1, y: 15, w: 3, h: 2, color: 'steelDark' }
  ],
  enemy_mercenary: [
    { x: 8, y: 3, w: 4, h: 4, color: 'skin' },
    { x: 6, y: 1, w: 8, h: 4, color: 'steelDark' },
    { x: 4, y: 7, w: 12, h: 8, color: 'steel' },
    { x: 6, y: 8, w: 8, h: 5, color: 'red' },
    { x: 3, y: 8, w: 3, h: 5, color: 'steelDark' },
    { x: 14, y: 8, w: 3, h: 5, color: 'steelDark' },
    { x: 7, y: 15, w: 2, h: 4, color: 'steelDark' },
    { x: 11, y: 15, w: 2, h: 4, color: 'steelDark' },
    { x: 16, y: 7, w: 1, h: 10, color: 'wood' },
    { x: 15, y: 6, w: 3, h: 2, color: 'steel' }
  ],
  enemy_ashen: [
    { x: 8, y: 3, w: 4, h: 4, color: 'steelDark' },
    { x: 6, y: 2, w: 8, h: 3, color: 'outline' },
    { x: 5, y: 7, w: 10, h: 8, color: 'outline' },
    { x: 6, y: 8, w: 8, h: 5, color: 'red' },
    { x: 7, y: 15, w: 2, h: 4, color: 'steelDark' },
    { x: 11, y: 15, w: 2, h: 4, color: 'steelDark' },
    { x: 4, y: 7, w: 2, h: 7, color: 'red' },
    { x: 14, y: 7, w: 2, h: 7, color: 'red' },
    { x: 8, y: 4, w: 1, h: 1, color: 'gold' },
    { x: 11, y: 4, w: 1, h: 1, color: 'gold' }
  ],
  enemy_scout: [
    { x: 8, y: 4, w: 4, h: 3, color: 'skin' },
    { x: 6, y: 2, w: 8, h: 5, color: 'green' },
    { x: 6, y: 7, w: 8, h: 7, color: 'brown' },
    { x: 7, y: 8, w: 6, h: 5, color: 'green' },
    { x: 7, y: 14, w: 2, h: 4, color: 'brown' },
    { x: 11, y: 14, w: 2, h: 4, color: 'brown' },
    { x: 15, y: 4, w: 1, h: 12, color: 'brownLight' },
    { x: 16, y: 6, w: 1, h: 8, color: 'brownLight' },
    { x: 9, y: 8, w: 8, h: 1, color: 'steel' }
  ],
  enemy_hollow: [
    { x: 7, y: 2, w: 6, h: 5, color: 'greenLight' },
    { x: 5, y: 6, w: 10, h: 8, color: 'green' },
    { x: 3, y: 7, w: 3, h: 7, color: 'wood' },
    { x: 14, y: 7, w: 3, h: 7, color: 'wood' },
    { x: 6, y: 14, w: 3, h: 5, color: 'wood' },
    { x: 11, y: 14, w: 3, h: 5, color: 'wood' },
    { x: 8, y: 4, w: 1, h: 1, color: 'red' },
    { x: 11, y: 4, w: 1, h: 1, color: 'red' },
    { x: 5, y: 5, w: 2, h: 2, color: 'greenLight' },
    { x: 13, y: 5, w: 2, h: 2, color: 'greenLight' }
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

function ProductionAssetFrame({
  assetId,
  width,
  height = width,
  children
}: {
  assetId: string;
  width: number;
  height?: number;
  children: React.ReactNode;
}) {
  const source = getProductionAssetSource(assetId);
  if (!source) return <>{children}</>;

  return (
    <Image
      source={source}
      resizeMode="contain"
      style={{ width, height }}
    />
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

function FactionUnitSilhouette({
  faction,
  className,
  size
}: {
  faction: FactionId;
  className: string;
  size: number;
}) {
  if (faction === 'human') return null;
  const kind = getUnitVisualKind(className);
  const mounted =
    kind === 'scout_rider' ||
    kind === 'cavalryman' ||
    kind === 'lancer' ||
    kind === 'mounted_archer';

  if (faction === 'elf') {
    return (
      <>
        <View
          style={{
            position: 'absolute',
            left: size * 0.27,
            top: size * 0.2,
            width: size * 0.1,
            height: size * 0.035,
            backgroundColor: palette.elfSkin
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: size * 0.27,
            top: size * 0.2,
            width: size * 0.1,
            height: size * 0.035,
            backgroundColor: palette.elfSkin
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: size * 0.24,
            top: size * 0.39,
            width: size * 0.09,
            height: size * 0.28,
            backgroundColor: palette.elf
          }}
        />
        {kind === 'archer' || kind === 'scout' || kind === 'mounted_archer' ? (
          <View
            style={{
              position: 'absolute',
              right: size * 0.17,
              top: size * 0.34,
              width: size * 0.06,
              height: size * 0.36,
              backgroundColor: palette.elfLight
            }}
          />
        ) : null}
        {mounted ? (
          <>
            <View
              style={{
                position: 'absolute',
                right: size * 0.07,
                top: size * 0.43,
                width: size * 0.16,
                height: size * 0.11,
                backgroundColor: palette.brownLight
              }}
            />
            <View
              style={{
                position: 'absolute',
                right: size * 0.02,
                top: size * 0.38,
                width: size * 0.1,
                height: size * 0.1,
                backgroundColor: palette.brownLight
              }}
            />
            <View
              style={{
                position: 'absolute',
                right: size * 0.055,
                top: size * 0.28,
                width: size * 0.025,
                height: size * 0.14,
                backgroundColor: palette.elfLight,
                transform: [{ rotate: '-24deg' }]
              }}
            />
            <View
              style={{
                position: 'absolute',
                right: size * 0.01,
                top: size * 0.28,
                width: size * 0.025,
                height: size * 0.14,
                backgroundColor: palette.elfLight,
                transform: [{ rotate: '24deg' }]
              }}
            />
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: size * 0.15,
          top: size * 0.34,
          width: size * 0.2,
          height: size * 0.13,
          backgroundColor: palette.orc
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: size * 0.15,
          top: size * 0.34,
          width: size * 0.2,
          height: size * 0.13,
          backgroundColor: palette.orc
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.42,
          top: size * 0.3,
          width: size * 0.04,
          height: size * 0.06,
          backgroundColor: palette.cloth
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: size * 0.42,
          top: size * 0.3,
          width: size * 0.04,
          height: size * 0.06,
          backgroundColor: palette.cloth
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.34,
          top: size * 0.13,
          width: size * 0.32,
          height: size * 0.05,
          backgroundColor: palette.brown
        }}
      />
      {mounted ? (
        <>
          <View
            style={{
              position: 'absolute',
              right: size * 0.05,
              top: size * 0.42,
              width: size * 0.21,
              height: size * 0.13,
              backgroundColor: palette.outline
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: size * 0.4,
              width: size * 0.12,
              height: size * 0.11,
              backgroundColor: palette.steelDark
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: size * 0.075,
              top: size * 0.32,
              width: size * 0.035,
              height: size * 0.11,
              backgroundColor: palette.outline,
              transform: [{ rotate: '-18deg' }]
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: size * 0.015,
              top: size * 0.32,
              width: size * 0.035,
              height: size * 0.11,
              backgroundColor: palette.outline,
              transform: [{ rotate: '18deg' }]
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: -size * 0.02,
              top: size * 0.48,
              width: size * 0.09,
              height: size * 0.035,
              backgroundColor: palette.cloth
            }}
          />
        </>
      ) : null}
    </>
  );
}

function FantasyUnitOverlay({
  className,
  faction,
  size
}: {
  className: string;
  faction: FactionId;
  size: number;
}) {
  const key = className.toLowerCase();
  const magical =
    key.includes('mage') ||
    key.includes('apprentice') ||
    key.includes('initiate') ||
    key.includes('spell') ||
    key.includes('druid') ||
    key.includes('shaman') ||
    key.includes('spirit');
  const flying =
    key.includes('griffin') ||
    key.includes('eagle') ||
    key.includes('wyvern') ||
    key.includes('moonwing');
  const large =
    key.includes('golem') ||
    key.includes('ent') ||
    key.includes('guardian') ||
    key.includes('troll') ||
    key.includes('mammoth');

  if (!magical && !flying && !large) return null;

  const accent =
    faction === 'elf'
      ? palette.elfLight
      : faction === 'orc'
        ? palette.orcLight
        : palette.humanLight;
  const secondary =
    faction === 'elf'
      ? palette.greenLight
      : faction === 'orc'
        ? palette.red
        : palette.gold;

  return (
    <>
      {large ? (
        <>
          <View
            style={{
              position: 'absolute',
              left: size * 0.08,
              right: size * 0.08,
              top: size * 0.3,
              height: size * 0.38,
              borderRadius: size * 0.12,
              backgroundColor: accent,
              opacity: 0.42
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: size * 0.04,
              top: size * 0.38,
              width: size * 0.18,
              height: size * 0.26,
              borderRadius: size * 0.08,
              backgroundColor: secondary,
              opacity: 0.75,
              transform: [{ rotate: '-8deg' }]
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: size * 0.04,
              top: size * 0.38,
              width: size * 0.18,
              height: size * 0.26,
              borderRadius: size * 0.08,
              backgroundColor: secondary,
              opacity: 0.75,
              transform: [{ rotate: '8deg' }]
            }}
          />
          {key.includes('ent') || key.includes('grove') ? (
            <>
              <View
                style={{
                  position: 'absolute',
                  left: size * 0.14,
                  top: size * 0.09,
                  width: size * 0.06,
                  height: size * 0.28,
                  backgroundColor: palette.greenLight,
                  transform: [{ rotate: '-28deg' }]
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  right: size * 0.14,
                  top: size * 0.09,
                  width: size * 0.06,
                  height: size * 0.28,
                  backgroundColor: palette.greenLight,
                  transform: [{ rotate: '28deg' }]
                }}
              />
            </>
          ) : null}
          {key.includes('mammoth') || key.includes('troll') ? (
            <>
              <View
                style={{
                  position: 'absolute',
                  left: size * 0.12,
                  top: size * 0.14,
                  width: size * 0.1,
                  height: size * 0.16,
                  backgroundColor: palette.cloth,
                  transform: [{ rotate: '-24deg' }]
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  right: size * 0.12,
                  top: size * 0.14,
                  width: size * 0.1,
                  height: size * 0.16,
                  backgroundColor: palette.cloth,
                  transform: [{ rotate: '24deg' }]
                }}
              />
            </>
          ) : null}
        </>
      ) : null}
      {flying ? (
        <>
          <View
            style={{
              position: 'absolute',
              left: size * 0.02,
              top: size * 0.31,
              width: size * 0.3,
              height: size * 0.13,
              borderRadius: size * 0.08,
              backgroundColor: accent,
              opacity: 0.9,
              transform: [{ rotate: '-27deg' }]
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: size * 0.02,
              top: size * 0.31,
              width: size * 0.3,
              height: size * 0.13,
              borderRadius: size * 0.08,
              backgroundColor: accent,
              opacity: 0.9,
              transform: [{ rotate: '27deg' }]
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: size * 0.09,
              top: size * 0.24,
              width: size * 0.2,
              height: size * 0.065,
              backgroundColor: secondary,
              opacity: 0.9,
              transform: [{ rotate: '-38deg' }]
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: size * 0.09,
              top: size * 0.24,
              width: size * 0.2,
              height: size * 0.065,
              backgroundColor: secondary,
              opacity: 0.9,
              transform: [{ rotate: '38deg' }]
            }}
          />
        </>
      ) : null}
      {magical ? (
        <>
          <View
            style={{
              position: 'absolute',
              right: size * 0.08,
              top: size * 0.12,
              width: size * 0.14,
              height: size * 0.14,
              borderRadius: size,
              backgroundColor: secondary,
              opacity: 0.95
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: size * 0.135,
              top: size * 0.23,
              width: size * 0.035,
              height: size * 0.46,
              backgroundColor: accent,
              transform: [{ rotate: '8deg' }]
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: size * 0.19,
              top: size * 0.18,
              width: size * 0.12,
              height: size * 0.04,
              borderRadius: size,
              backgroundColor: accent,
              opacity: 0.75
            }}
          />
        </>
      ) : null}
    </>
  );
}

export function UnitSprite({
  className,
  faction = 'human',
  size = 52,
  preferHumanArt = true
}: {
  className: string;
  faction?: FactionId;
  size?: number;
  preferHumanArt?: boolean;
}) {
  const kind = getUnitVisualKind(className);
  const production = unitProductionAsset(faction, className, kind);
  const mounted =
    kind === 'scout_rider' ||
    kind === 'cavalryman' ||
    kind === 'lancer' ||
    kind === 'mounted_archer';
  const classKey = className.toLowerCase();
  const flying =
    classKey.includes('griffin') ||
    classKey.includes('eagle') ||
    classKey.includes('wyvern') ||
    classKey.includes('moonwing');
  const large =
    classKey.includes('golem') ||
    classKey.includes('ent') ||
    classKey.includes('guardian') ||
    classKey.includes('troll') ||
    classKey.includes('mammoth');
  const productionScale =
    large
      ? size <= 32
        ? 1.22
        : 1.14
      : flying
        ? size <= 32
          ? 1.18
          : 1.08
        : mounted && size <= 32
          ? 1.12
          : 1;
  const productionSize = size * productionScale;

  const humanArt = preferHumanArt ? humanFigureForClass(faction, className) : null;
  const fallback = (
    <ProductionAssetFrame
        assetId={production.id}
        width={productionSize}
        height={productionSize}
      >
        <View style={{ width: size, height: size, position: 'relative' }}>
          <PixelSprite artKey={unitArtKey(className)} size={size} faction={faction} />
          <FactionUnitSilhouette faction={faction} className={className} size={size} />
          <FantasyUnitOverlay className={className} faction={faction} size={size} />
        </View>
      </ProductionAssetFrame>
  );

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}
    >
      {humanArt ? <ReferenceArt art={humanArt} width={productionSize} height={productionSize}
        fallback={fallback} /> : fallback}
    </View>
  );
}

function EquipmentKindSprite({
  kind,
  faction,
  size
}: {
  kind: ReturnType<typeof getEquipmentVisualKind>;
  faction: FactionId;
  size: number;
}) {
  if (kind === 'artifact') {
    const accent =
      faction === 'elf'
        ? palette.elfLight
        : faction === 'orc'
          ? palette.orcLight
          : palette.humanLight;
    const core =
      faction === 'elf'
        ? palette.greenLight
        : faction === 'orc'
          ? palette.red
          : palette.gold;

    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        <View style={{
          position: 'absolute',
          left: size * 0.2,
          top: size * 0.2,
          width: size * 0.6,
          height: size * 0.6,
          borderWidth: Math.max(1, size * 0.08),
          borderColor: accent,
          transform: [{ rotate: '45deg' }],
          backgroundColor: palette.outline
        }} />
        <View style={{
          position: 'absolute',
          left: size * 0.34,
          top: size * 0.34,
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: size * 0.16,
          backgroundColor: core
        }} />
        <View style={{
          position: 'absolute',
          left: size * 0.46,
          top: size * 0.08,
          width: size * 0.08,
          height: size * 0.84,
          backgroundColor: accent,
          opacity: 0.65
        }} />
      </View>
    );
  }

  const keyByKind: Record<Exclude<ReturnType<typeof getEquipmentVisualKind>, 'artifact'>, ArtKey> = {
    sword: 'eq_sword',
    spear: 'eq_spear',
    bow: 'eq_bow',
    shield: 'eq_shield',
    armor: 'eq_armor',
    horse: 'eq_horse'
  };

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <PixelSprite artKey={keyByKind[kind]} size={size} faction={faction} />
      {faction === 'elf' ? (
        <>
          {(kind === 'sword' || kind === 'spear') ? (
            <View style={{ position: 'absolute', left: size * 0.43, top: size * 0.08, width: size * 0.08, height: size * 0.56, backgroundColor: palette.blue, opacity: 0.7 }} />
          ) : null}
          {kind === 'bow' ? (
            <View style={{ position: 'absolute', right: size * 0.16, top: size * 0.17, width: size * 0.07, height: size * 0.58, backgroundColor: palette.elfLight }} />
          ) : null}
          {kind === 'shield' ? (
            <View style={{ position: 'absolute', left: size * 0.34, top: size * 0.21, width: size * 0.32, height: size * 0.16, backgroundColor: palette.elfLight, transform: [{ rotate: '45deg' }] }} />
          ) : null}
          {kind === 'armor' ? (
            <View style={{ position: 'absolute', left: size * 0.29, right: size * 0.29, top: size * 0.36, height: size * 0.08, backgroundColor: palette.elfLight }} />
          ) : null}
          {kind === 'horse' ? (
            <>
              <View style={{ position: 'absolute', right: size * 0.1, top: size * 0.12, width: size * 0.04, height: size * 0.2, backgroundColor: palette.elfLight, transform: [{ rotate: '-22deg' }] }} />
              <View style={{ position: 'absolute', right: size * 0.02, top: size * 0.12, width: size * 0.04, height: size * 0.2, backgroundColor: palette.elfLight, transform: [{ rotate: '22deg' }] }} />
            </>
          ) : null}
        </>
      ) : faction === 'orc' ? (
        <>
          {(kind === 'sword' || kind === 'spear') ? (
            <>
              <View style={{ position: 'absolute', left: size * 0.3, top: size * 0.17, width: size * 0.12, height: size * 0.08, backgroundColor: palette.cloth, transform: [{ rotate: '-25deg' }] }} />
              <View style={{ position: 'absolute', right: size * 0.25, top: size * 0.3, width: size * 0.11, height: size * 0.07, backgroundColor: palette.cloth, transform: [{ rotate: '22deg' }] }} />
            </>
          ) : null}
          {kind === 'bow' ? (
            <View style={{ position: 'absolute', left: size * 0.2, top: size * 0.15, width: size * 0.08, height: size * 0.62, backgroundColor: palette.brown }} />
          ) : null}
          {kind === 'shield' ? (
            <>
              <View style={{ position: 'absolute', left: size * 0.18, top: size * 0.22, width: size * 0.13, height: size * 0.12, backgroundColor: palette.cloth }} />
              <View style={{ position: 'absolute', right: size * 0.17, top: size * 0.31, width: size * 0.14, height: size * 0.1, backgroundColor: palette.cloth }} />
            </>
          ) : null}
          {kind === 'armor' ? (
            <View style={{ position: 'absolute', left: size * 0.18, right: size * 0.18, top: size * 0.34, height: size * 0.12, backgroundColor: palette.orc }} />
          ) : null}
          {kind === 'horse' ? (
            <>
              <View style={{ position: 'absolute', right: size * 0.04, top: size * 0.24, width: size * 0.18, height: size * 0.13, backgroundColor: palette.outline }} />
              <View style={{ position: 'absolute', right: 0, top: size * 0.29, width: size * 0.09, height: size * 0.05, backgroundColor: palette.cloth }} />
            </>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

export function EquipmentSprite({
  equipmentId,
  faction = 'human',
  size = 38
}: {
  equipmentId: string;
  faction?: FactionId | 'global';
  size?: number;
}) {
  const kind = getEquipmentVisualKind(equipmentId);
  const production = equipmentProductionAsset(faction, equipmentId, kind);
  const renderFaction: FactionId = faction === 'global' ? 'human' : faction;
  return (
    <ProductionAssetFrame assetId={production.id} width={size}>
      <EquipmentKindSprite kind={kind} faction={renderFaction} size={size} />
    </ProductionAssetFrame>
  );
}

export function RelicGuardianSprite({
  stageId,
  faction,
  size = 64
}: {
  stageId: 'rune_sentinel' | 'sky_keeper' | 'relic_guardian';
  faction: FactionId;
  size?: number;
}) {
  const accent =
    faction === 'elf'
      ? palette.elfLight
      : faction === 'orc'
        ? palette.orcLight
        : palette.humanLight;
  const core =
    faction === 'elf'
      ? palette.greenLight
      : faction === 'orc'
        ? palette.red
        : palette.gold;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {stageId === 'rune_sentinel' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.24, top: size * 0.16, width: size * 0.52, height: size * 0.52, borderRadius: size * 0.26, borderWidth: Math.max(2, size * 0.07), borderColor: accent }} />
          <View style={{ position: 'absolute', left: size * 0.39, top: size * 0.31, width: size * 0.22, height: size * 0.22, transform: [{ rotate: '45deg' }], backgroundColor: core }} />
          <View style={{ position: 'absolute', left: size * 0.46, top: size * 0.62, width: size * 0.08, height: size * 0.25, backgroundColor: palette.steel }} />
        </>
      ) : stageId === 'sky_keeper' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.39, top: size * 0.28, width: size * 0.22, height: size * 0.34, borderRadius: size * 0.11, backgroundColor: core }} />
          <View style={{ position: 'absolute', left: size * 0.03, top: size * 0.18, width: size * 0.4, height: size * 0.24, backgroundColor: accent, transform: [{ rotate: '-22deg' }] }} />
          <View style={{ position: 'absolute', right: size * 0.03, top: size * 0.18, width: size * 0.4, height: size * 0.24, backgroundColor: accent, transform: [{ rotate: '22deg' }] }} />
          <View style={{ position: 'absolute', left: size * 0.44, top: size * 0.05, width: size * 0.12, height: size * 0.16, borderRadius: size * 0.06, backgroundColor: palette.steel }} />
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', left: size * 0.18, top: size * 0.19, width: size * 0.64, height: size * 0.58, borderRadius: size * 0.16, backgroundColor: palette.steelDark, borderWidth: Math.max(2, size * 0.06), borderColor: accent }} />
          <View style={{ position: 'absolute', left: size * 0.32, top: size * 0.3, width: size * 0.36, height: size * 0.3, transform: [{ rotate: '45deg' }], backgroundColor: core }} />
          <View style={{ position: 'absolute', left: size * 0.08, top: size * 0.05, width: size * 0.18, height: size * 0.34, backgroundColor: accent, transform: [{ rotate: '-28deg' }] }} />
          <View style={{ position: 'absolute', right: size * 0.08, top: size * 0.05, width: size * 0.18, height: size * 0.34, backgroundColor: accent, transform: [{ rotate: '28deg' }] }} />
        </>
      )}
    </View>
  );
}

function LoadoutGlyph({
  kind,
  faction,
  size
}: {
  kind: ReturnType<typeof getClassLoadoutVisuals>[number];
  faction: FactionId;
  size: number;
}) {
  if (kind === 'stag') {
    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        <EquipmentKindSprite kind="horse" faction="elf" size={size} />
      </View>
    );
  }
  if (kind === 'warg') {
    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        <EquipmentKindSprite kind="horse" faction="orc" size={size} />
      </View>
    );
  }
  if (kind === 'drum') {
    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        <View style={{ position: 'absolute', left: size * 0.18, right: size * 0.18, top: size * 0.28, bottom: size * 0.18, borderRadius: size * 0.25, backgroundColor: palette.brown, borderWidth: Math.max(1, size * 0.06), borderColor: palette.orcLight }} />
        <View style={{ position: 'absolute', left: size * 0.47, top: size * 0.08, width: size * 0.06, height: size * 0.76, backgroundColor: palette.wood, transform: [{ rotate: '32deg' }] }} />
      </View>
    );
  }
  if (kind === 'ward') {
    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        <View style={{ position: 'absolute', left: size * 0.32, top: size * 0.16, width: size * 0.36, height: size * 0.36, transform: [{ rotate: '45deg' }], backgroundColor: palette.blue }} />
        <View style={{ position: 'absolute', left: size * 0.44, top: size * 0.55, width: size * 0.12, height: size * 0.24, backgroundColor: palette.wood }} />
      </View>
    );
  }

  const equipmentKind =
    kind === 'blade'
      ? 'sword'
      : kind === 'spear'
        ? 'spear'
        : kind === 'bow'
          ? 'bow'
          : kind === 'shield'
            ? 'shield'
            : 'armor';

  return (
    <EquipmentKindSprite
      kind={equipmentKind}
      faction={faction}
      size={size}
    />
  );
}

export function ClassLoadoutPreview({
  className,
  faction,
  size = 32
}: {
  className: string;
  faction: FactionId;
  size?: number;
}) {
  const loadout = getClassLoadoutVisuals(className, faction);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {loadout.map((kind, index) => (
        <View
          key={kind + '-' + String(index)}
          style={{
            width: size + 8,
            height: size + 8,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            backgroundColor:
              faction === 'elf'
                ? palette.elf + '24'
                : faction === 'orc'
                  ? palette.orc + '24'
                  : palette.human + '24'
          }}
        >
          <LoadoutGlyph kind={kind} faction={faction} size={size} />
        </View>
      ))}
    </View>
  );
}

function FactionBuildingSilhouette({
  buildingId,
  faction,
  size
}: {
  buildingId: string;
  faction: FactionId;
  size: number;
}) {
  if (faction === 'human') return null;
  const kind = getBuildingVisualKind(buildingId);

  if (faction === 'elf') {
    return (
      <>
        <View
          style={{
            position: 'absolute',
            left: size * 0.14,
            bottom: size * 0.08,
            width: size * 0.1,
            height: size * 0.48,
            backgroundColor: palette.wood
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: size * 0.14,
            bottom: size * 0.08,
            width: size * 0.1,
            height: size * 0.48,
            backgroundColor: palette.wood
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: size * 0.08,
            right: size * 0.08,
            top: size * 0.11,
            height: size * 0.13,
            backgroundColor: palette.elf,
            borderRadius: size * 0.08
          }}
        />
        {kind === 'signal_tower' || kind === 'war_room' ? (
          <View
            style={{
              position: 'absolute',
              left: size * 0.42,
              top: size * 0.02,
              width: size * 0.16,
              height: size * 0.16,
              borderRadius: size * 0.08,
              backgroundColor: palette.elfLight
            }}
          />
        ) : null}
        {kind === 'stable' ? (
          <>
            <View style={{ position: 'absolute', left: size * 0.05, bottom: size * 0.13, width: size * 0.16, height: size * 0.1, backgroundColor: palette.elfLight }} />
            <View style={{ position: 'absolute', right: size * 0.05, bottom: size * 0.13, width: size * 0.16, height: size * 0.1, backgroundColor: palette.elfLight }} />
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: size * 0.04,
          top: size * 0.18,
          width: size * 0.18,
          height: size * 0.08,
          backgroundColor: palette.outline,
          transform: [{ rotate: '-34deg' }]
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: size * 0.04,
          top: size * 0.18,
          width: size * 0.18,
          height: size * 0.08,
          backgroundColor: palette.outline,
          transform: [{ rotate: '34deg' }]
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.12,
          right: size * 0.12,
          top: size * 0.08,
          height: size * 0.08,
          backgroundColor: palette.orc
        }}
      />
      {kind === 'forge' ? (
        <View style={{ position: 'absolute', right: size * 0.13, top: size * 0.31, width: size * 0.11, height: size * 0.11, backgroundColor: palette.red }} />
      ) : null}
      {kind === 'stable' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.03, bottom: size * 0.08, width: size * 0.2, height: size * 0.06, backgroundColor: palette.outline }} />
          <View style={{ position: 'absolute', right: size * 0.03, bottom: size * 0.08, width: size * 0.2, height: size * 0.06, backgroundColor: palette.outline }} />
        </>
      ) : null}
    </>
  );
}

const settlementAnchorAtlasCells: Record<string, { x: number; y: number }> = {
  hall: { x: 0, y: 0 },
  barracks: { x: 86, y: 0 },
  wagonwright: { x: 172, y: 0 },
  elf_heartgrove_hall: { x: 0, y: 86 },
  elf_warden_lodge: { x: 86, y: 86 },
  elf_caravan_grove: { x: 172, y: 86 },
  orc_warhold: { x: 0, y: 172 },
  orc_clan_yard: { x: 86, y: 172 },
  orc_cartwright: { x: 172, y: 172 }
};

const settlementAnchorFactionAliases: Partial<Record<FactionId, Record<string, string>>> = {
  elf: {
    hall: 'elf_heartgrove_hall',
    barracks: 'elf_warden_lodge',
    wagonwright: 'elf_caravan_grove'
  },
  orc: {
    hall: 'orc_warhold',
    barracks: 'orc_clan_yard',
    wagonwright: 'orc_cartwright'
  }
};

function settlementAnchorAtlasBuildingId(buildingId: string, faction: FactionId) {
  return settlementAnchorFactionAliases[faction]?.[buildingId]
    ?? (settlementAnchorAtlasCells[buildingId] ? buildingId : null);
}

function SettlementAnchorAtlasSprite({
  buildingId,
  faction,
  size
}: {
  buildingId: string;
  faction: FactionId;
  size: number;
}) {
  const source = getProductionAssetSource('ui.settlement_anchor_atlas');
  const atlasBuildingId = settlementAnchorAtlasBuildingId(buildingId, faction);
  const cell = atlasBuildingId ? settlementAnchorAtlasCells[atlasBuildingId] : null;
  if (!source || !cell) return null;

  const cellSize = 84;
  const scale = size / cellSize;
  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={source}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          left: -cell.x * scale,
          top: -cell.y * scale,
          width: 256 * scale,
          height: 256 * scale
        }}
      />
    </View>
  );
}

const settlementSupportAtlasCells: Partial<Record<ReturnType<typeof getBuildingVisualKind>, { x: number; y: number }>> = {
  forge: { x: 0, y: 0 },
  quartermaster: { x: 86, y: 0 },
  stable: { x: 172, y: 0 },
  war_room: { x: 0, y: 86 },
  signal_tower: { x: 86, y: 86 },
  officer_academy: { x: 172, y: 86 }
};

const settlementSupportAtlasAssetIds: Record<FactionId, string> = {
  human: 'ui.settlement_support_human_atlas',
  elf: 'ui.settlement_support_elf_atlas',
  orc: 'ui.settlement_support_orc_atlas'
};

function SettlementSupportAtlasSprite({
  kind,
  faction,
  size
}: {
  kind: ReturnType<typeof getBuildingVisualKind>;
  faction: FactionId;
  size: number;
}) {
  const source = getProductionAssetSource(settlementSupportAtlasAssetIds[faction]);
  const cell = settlementSupportAtlasCells[kind];
  if (!source || !cell) return null;

  const cellSize = 84;
  const scale = size / cellSize;
  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={source}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          left: -cell.x * scale,
          top: -cell.y * scale,
          width: 256 * scale,
          height: 256 * scale
        }}
      />
    </View>
  );
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
  const production = buildingProductionAsset(faction, buildingId, kind);
  const individualSource = getProductionAssetSource(production.id);
  if (individualSource) {
    return <Image source={individualSource} resizeMode="contain" style={{ width: size, height: size }} />;
  }
  if (settlementAnchorAtlasBuildingId(buildingId, faction) && getProductionAssetSource('ui.settlement_anchor_atlas')) {
    return <SettlementAnchorAtlasSprite buildingId={buildingId} faction={faction} size={size} />;
  }
  if (settlementSupportAtlasCells[kind] && getProductionAssetSource(settlementSupportAtlasAssetIds[faction])) {
    return <SettlementSupportAtlasSprite kind={kind} faction={faction} size={size} />;
  }
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
  return (
    <ProductionAssetFrame assetId={production.id} width={size}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        <PixelSprite artKey={keyByKind[kind]} size={size} faction={faction} />
        <FactionBuildingSilhouette buildingId={buildingId} faction={faction} size={size} />
      </View>
    </ProductionAssetFrame>
  );
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
  const production = resourceProductionAsset(resource);
  return (
    <ProductionAssetFrame assetId={production.id} width={size}>
      <PixelSprite artKey={keyByResource[resource]} size={size} />
    </ProductionAssetFrame>
  );
}

export function WagonItemSprite({
  itemId,
  size = 28
}: {
  itemId: string;
  size?: number;
}) {
  const kind = getWagonItemVisualKind(itemId);
  const production = wagonItemProductionAsset(itemId, kind);
  const keyByKind: Record<ReturnType<typeof getWagonItemVisualKind>, ArtKey> = {
    rations: 'wagon_rations',
    medicine: 'wagon_medicine',
    banner: 'wagon_banner',
    repair: 'wagon_repair'
  };
  return (
    <ProductionAssetFrame assetId={production.id} width={size}>
      <PixelSprite artKey={keyByKind[kind]} size={size} />
    </ProductionAssetFrame>
  );
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


function EnemyFantasyOverlay({
  fantasyThreat,
  role,
  size
}: {
  fantasyThreat?: EnemyFantasyThreatFamily;
  role?: UnitRole;
  size: number;
}) {
  if (!fantasyThreat) return null;

  if (fantasyThreat === 'magic') {
    return (
      <>
        <View
          style={{
            position: 'absolute',
            right: size * 0.05,
            top: size * 0.06,
            width: size * 0.18,
            height: size * 0.18,
            borderRadius: size,
            borderWidth: Math.max(1, size * 0.025),
            borderColor: palette.red,
            backgroundColor: palette.red + '44'
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: size * 0.125,
            top: size * 0.2,
            width: Math.max(2, size * 0.04),
            height: size * 0.42,
            backgroundColor: palette.gold,
            transform: [{ rotate: '8deg' }]
          }}
        />
        {role === 'support' ? (
          <View
            style={{
              position: 'absolute',
              left: size * 0.12,
              bottom: size * 0.08,
              width: size * 0.76,
              height: size * 0.14,
              borderRadius: size,
              borderWidth: Math.max(1, size * 0.02),
              borderColor: palette.red,
              opacity: 0.8
            }}
          />
        ) : role === 'ranged' ? (
          <>
            <View
              style={{
                position: 'absolute',
                left: size * 0.05,
                top: size * 0.24,
                width: size * 0.42,
                height: Math.max(2, size * 0.035),
                backgroundColor: palette.gold,
                transform: [{ rotate: '-28deg' }]
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: size * 0.22,
                top: size * 0.12,
                width: size * 0.05,
                height: size * 0.4,
                backgroundColor: palette.red,
                transform: [{ rotate: '20deg' }]
              }}
            />
          </>
        ) : role === 'frontline' ? (
          <View
            style={{
              position: 'absolute',
              left: size * 0.06,
              top: size * 0.3,
              width: size * 0.3,
              height: size * 0.4,
              borderWidth: Math.max(1, size * 0.025),
              borderColor: palette.gold,
              borderRadius: size * 0.07,
              opacity: 0.85
            }}
          />
        ) : (
          <View
            style={{
              position: 'absolute',
              left: size * 0.08,
              top: size * 0.42,
              width: size * 0.42,
              height: Math.max(2, size * 0.04),
              backgroundColor: palette.red,
              transform: [{ rotate: '-38deg' }]
            }}
          />
        )}
      </>
    );
  }

  if (fantasyThreat === 'flying') {
    return (
      <>
        <View
          style={{
            position: 'absolute',
            left: -size * 0.04,
            top: size * 0.25,
            width: size * 0.36,
            height: size * 0.13,
            borderRadius: size * 0.08,
            backgroundColor: palette.red,
            opacity: 0.88,
            transform: [{ rotate: '-28deg' }]
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: -size * 0.04,
            top: size * 0.25,
            width: size * 0.36,
            height: size * 0.13,
            borderRadius: size * 0.08,
            backgroundColor: palette.red,
            opacity: 0.88,
            transform: [{ rotate: '28deg' }]
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: size * 0.15,
            bottom: size * 0.02,
            width: size * 0.7,
            height: Math.max(2, size * 0.045),
            borderRadius: size,
            backgroundColor: palette.gold,
            opacity: 0.55
          }}
        />
        {role === 'cavalry' ? (
          <View
            style={{
              position: 'absolute',
              right: size * 0.02,
              top: size * 0.48,
              width: size * 0.52,
              height: Math.max(2, size * 0.04),
              backgroundColor: palette.gold,
              transform: [{ rotate: '-18deg' }]
            }}
          />
        ) : role === 'ranged' ? (
          <View
            style={{
              position: 'absolute',
              left: size * 0.4,
              top: size * 0.05,
              width: size * 0.06,
              height: size * 0.45,
              backgroundColor: palette.gold,
              transform: [{ rotate: '12deg' }]
            }}
          />
        ) : (
          <>
            <View
              style={{
                position: 'absolute',
                left: size * 0.08,
                top: size * 0.54,
                width: size * 0.18,
                height: size * 0.08,
                backgroundColor: palette.gold,
                transform: [{ rotate: '-22deg' }]
              }}
            />
            <View
              style={{
                position: 'absolute',
                right: size * 0.08,
                top: size * 0.54,
                width: size * 0.18,
                height: size * 0.08,
                backgroundColor: palette.gold,
                transform: [{ rotate: '22deg' }]
              }}
            />
          </>
        )}
      </>
    );
  }

  if (fantasyThreat === 'large') {
    return (
      <>
        <View
          style={{
            position: 'absolute',
            left: size * 0.04,
            right: size * 0.04,
            top: size * 0.26,
            height: size * 0.46,
            borderRadius: size * 0.1,
            borderWidth: Math.max(2, size * 0.035),
            borderColor: palette.red,
            opacity: 0.5
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: -size * 0.04,
            top: size * 0.38,
            width: size * 0.22,
            height: size * 0.25,
            borderRadius: size * 0.06,
            backgroundColor: palette.leather,
            opacity: 0.9
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: -size * 0.04,
            top: size * 0.38,
            width: size * 0.22,
            height: size * 0.25,
            borderRadius: size * 0.06,
            backgroundColor: palette.leather,
            opacity: 0.9
          }}
        />
        {role === 'ranged' ? (
          <View
            style={{
              position: 'absolute',
              right: size * 0.04,
              top: size * 0.08,
              width: size * 0.24,
              height: size * 0.24,
              borderRadius: size,
              backgroundColor: palette.stoneLight,
              borderWidth: Math.max(1, size * 0.025),
              borderColor: palette.gold
            }}
          />
        ) : role === 'support' ? (
          <View
            style={{
              position: 'absolute',
              left: size * 0.12,
              right: size * 0.12,
              bottom: size * 0.02,
              height: size * 0.12,
              borderRadius: size,
              borderWidth: Math.max(1, size * 0.025),
              borderColor: palette.gold
            }}
          />
        ) : role === 'melee' ? (
          <View
            style={{
              position: 'absolute',
              left: size * 0.07,
              top: size * 0.15,
              width: size * 0.45,
              height: Math.max(2, size * 0.045),
              backgroundColor: palette.gold,
              transform: [{ rotate: '-42deg' }]
            }}
          />
        ) : null}
      </>
    );
  }

  if (fantasyThreat === 'hybrid') {
    return (
      <>
        <View
          style={{
            position: 'absolute',
            left: -size * 0.03,
            top: size * 0.24,
            width: size * 0.34,
            height: size * 0.12,
            borderRadius: size,
            backgroundColor: palette.red,
            transform: [{ rotate: '-26deg' }]
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: -size * 0.03,
            top: size * 0.24,
            width: size * 0.34,
            height: size * 0.12,
            borderRadius: size,
            backgroundColor: palette.red,
            transform: [{ rotate: '26deg' }]
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: size * 0.08,
            top: size * 0.05,
            width: size * 0.18,
            height: size * 0.18,
            borderRadius: size,
            backgroundColor: palette.gold
          }}
        />
      </>
    );
  }

  return null;
}

export function EnemySprite({
  enemyName,
  armyProfileId,
  fantasyThreat,
  role,
  size = 42
}: {
  enemyName: string;
  armyProfileId?: EnemyArmyProfileId;
  fantasyThreat?: EnemyFantasyThreatFamily;
  role?: UnitRole;
  size?: number;
}) {
  const kind = getEnemyVisualKind(enemyName, armyProfileId);
  const production = enemyProductionAsset(kind);
  const productionSource = getProductionAssetSource(production.id);
  const threatScale =
    fantasyThreat === 'large'
      ? 1.14
      : fantasyThreat === 'flying'
        ? 1.06
        : 1;
  const visualSize = size * threatScale;
  const keyByKind: Record<ReturnType<typeof getEnemyVisualKind>, ArtKey> = {
    raider: 'enemy_raider',
    mercenary: 'enemy_mercenary',
    ashen: 'enemy_ashen',
    scout: 'enemy_scout',
    hollow: 'enemy_hollow',
    stalker: 'enemy_hollow',
    champion: 'enemy_mercenary',
    ranger: 'enemy_scout',
    agitator: 'enemy_raider',
    shield_host: 'enemy_mercenary',
    missile_company: 'enemy_scout',
    mounted_hunters: 'human_scout_rider',
    shock_warband: 'enemy_raider',
    warded_host: 'enemy_hollow',
    elite_command: 'enemy_mercenary'
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}
    >
      {productionSource ? (
        <Image
          source={productionSource}
          resizeMode="contain"
          style={{ width: visualSize, height: visualSize }}
        />
      ) : (
        <PixelSprite artKey={keyByKind[kind]} size={visualSize} />
      )}
      <EnemyFantasyOverlay
        fantasyThreat={fantasyThreat}
        role={role}
        size={size}
      />
      {!productionSource && kind === 'stalker' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.05, top: size * 0.26, width: size * 0.2, height: size * 0.08, backgroundColor: palette.greenLight, transform: [{ rotate: '-28deg' }] }} />
          <View style={{ position: 'absolute', right: size * 0.05, top: size * 0.26, width: size * 0.2, height: size * 0.08, backgroundColor: palette.greenLight, transform: [{ rotate: '28deg' }] }} />
          <View style={{ position: 'absolute', left: size * 0.38, top: size * 0.02, width: size * 0.24, height: size * 0.08, backgroundColor: palette.red }} />
        </>
      ) : null}
      {!productionSource && kind === 'champion' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.03, top: size * 0.27, width: size * 0.25, height: size * 0.13, backgroundColor: palette.orc }} />
          <View style={{ position: 'absolute', right: size * 0.03, top: size * 0.27, width: size * 0.25, height: size * 0.13, backgroundColor: palette.orc }} />
          <View style={{ position: 'absolute', left: size * 0.32, top: 0, width: size * 0.36, height: size * 0.08, backgroundColor: palette.gold }} />
        </>
      ) : null}
      {!productionSource && kind === 'ranger' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.17, top: size * 0.14, width: size * 0.12, height: size * 0.5, backgroundColor: palette.elf, opacity: 0.9 }} />
          <View style={{ position: 'absolute', right: size * 0.09, top: size * 0.2, width: size * 0.06, height: size * 0.58, backgroundColor: palette.elfLight }} />
        </>
      ) : null}
      {!productionSource && kind === 'agitator' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.11, top: size * 0.08, width: size * 0.78, height: size * 0.08, backgroundColor: palette.red }} />
          <View style={{ position: 'absolute', left: size * 0.45, top: 0, width: size * 0.1, height: size * 0.22, backgroundColor: palette.wood }} />
        </>
      ) : null}
    </View>
  );
}

export function FactionCrest({
  faction,
  size = 46
}: {
  faction: FactionId;
  size?: number;
}) {
  const production = factionCrestProductionAsset(faction);
  const productionSource = getProductionAssetSource(production.id);
  if (productionSource) {
    return (
      <Image
        source={productionSource}
        resizeMode="contain"
        style={{ width: size, height: size }}
      />
    );
  }

  const accent =
    faction === 'elf'
      ? palette.elf
      : faction === 'orc'
        ? palette.orc
        : palette.human;
  const accentLight =
    faction === 'elf'
      ? palette.elfLight
      : faction === 'orc'
        ? palette.orcLight
        : palette.humanLight;

  return (
    <View style={{ width: size, height: size, position: 'relative', alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.08,
          width: size * 0.72,
          height: size * 0.7,
          backgroundColor: accent,
          borderWidth: Math.max(1, size * 0.045),
          borderColor: palette.gold
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.04,
          width: size * 0.46,
          height: size * 0.28,
          backgroundColor: accent
        }}
      />
      {faction === 'human' ? (
        <>
          <View style={{ position: 'absolute', top: size * 0.25, width: size * 0.12, height: size * 0.31, backgroundColor: palette.gold }} />
          <View style={{ position: 'absolute', top: size * 0.34, width: size * 0.36, height: size * 0.1, backgroundColor: palette.gold }} />
        </>
      ) : faction === 'elf' ? (
        <>
          <View style={{ position: 'absolute', top: size * 0.19, width: size * 0.1, height: size * 0.4, backgroundColor: accentLight }} />
          <View style={{ position: 'absolute', top: size * 0.31, left: size * 0.27, width: size * 0.19, height: size * 0.07, backgroundColor: accentLight }} />
          <View style={{ position: 'absolute', top: size * 0.31, right: size * 0.27, width: size * 0.19, height: size * 0.07, backgroundColor: accentLight }} />
          <View style={{ position: 'absolute', top: size * 0.46, left: size * 0.31, width: size * 0.15, height: size * 0.06, backgroundColor: accentLight }} />
          <View style={{ position: 'absolute', top: size * 0.46, right: size * 0.31, width: size * 0.15, height: size * 0.06, backgroundColor: accentLight }} />
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', top: size * 0.23, left: size * 0.27, width: size * 0.13, height: size * 0.26, backgroundColor: palette.outline }} />
          <View style={{ position: 'absolute', top: size * 0.23, right: size * 0.27, width: size * 0.13, height: size * 0.26, backgroundColor: palette.outline }} />
          <View style={{ position: 'absolute', top: size * 0.42, left: size * 0.36, width: size * 0.1, height: size * 0.18, backgroundColor: palette.cloth }} />
          <View style={{ position: 'absolute', top: size * 0.42, right: size * 0.36, width: size * 0.1, height: size * 0.18, backgroundColor: palette.cloth }} />
        </>
      )}
    </View>
  );
}

export function CampaignNodeSprite({
  type,
  faction,
  active = false,
  size = 32
}: {
  type: ChapterNode['type'];
  faction: FactionId;
  active?: boolean;
  size?: number;
}) {
  const accent =
    faction === 'elf'
      ? palette.elf
      : faction === 'orc'
        ? palette.orc
        : palette.human;
  const dim = active ? accent : palette.steelDark;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {type === 'battle' || type === 'elite' || type === 'boss' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.19, top: size * 0.18, width: size * 0.12, height: size * 0.63, backgroundColor: dim, transform: [{ rotate: '-36deg' }] }} />
          <View style={{ position: 'absolute', right: size * 0.19, top: size * 0.18, width: size * 0.12, height: size * 0.63, backgroundColor: type === 'boss' ? palette.gold : dim, transform: [{ rotate: '36deg' }] }} />
          {type !== 'battle' ? (
            <View style={{ position: 'absolute', left: size * 0.36, top: size * 0.05, width: size * 0.28, height: size * 0.12, backgroundColor: type === 'boss' ? palette.gold : palette.red }} />
          ) : null}
        </>
      ) : type === 'supply' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.18, top: size * 0.26, width: size * 0.64, height: size * 0.48, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', left: size * 0.29, top: size * 0.14, width: size * 0.42, height: size * 0.18, backgroundColor: palette.food }} />
        </>
      ) : type === 'event' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.45, top: size * 0.16, width: size * 0.1, height: size * 0.48, backgroundColor: dim }} />
          <View style={{ position: 'absolute', left: size * 0.45, top: size * 0.72, width: size * 0.1, height: size * 0.1, backgroundColor: dim }} />
          <View style={{ position: 'absolute', left: size * 0.35, top: size * 0.08, width: size * 0.3, height: size * 0.12, backgroundColor: dim }} />
        </>
      ) : (
        <FactionCrest faction={faction} size={size} />
      )}
    </View>
  );
}

export function FactionCampScene({
  faction,
  size = 170
}: {
  faction: FactionId;
  size?: number;
}) {
  const accent =
    faction === 'elf'
      ? palette.elf
      : faction === 'orc'
        ? palette.orc
        : palette.human;

  return (
    <View style={{ width: size, height: size * 0.48, position: 'relative', overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: size * 0.16,
          backgroundColor: faction === 'orc' ? palette.brown : palette.green
        }}
      />
      {faction === 'elf' ? (
        <>
          {[0.05, 0.18, 0.76, 0.89].map((x, index) => (
            <View key={String(index)} style={{ position: 'absolute', left: size * x, bottom: size * 0.1 }}>
              <View style={{ width: size * 0.05, height: size * 0.21, backgroundColor: palette.wood }} />
              <View style={{ position: 'absolute', left: -size * 0.045, top: -size * 0.09, width: size * 0.14, height: size * 0.13, backgroundColor: palette.elf }} />
            </View>
          ))}
          <View style={{ position: 'absolute', left: size * 0.37, bottom: size * 0.1 }}>
            <SettlementStageSprite stageId="camp" faction="elf" size={size * 0.43} />
          </View>
        </>
      ) : faction === 'orc' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.18, bottom: size * 0.12, width: size * 0.19, height: size * 0.2, backgroundColor: palette.orc }} />
          <View style={{ position: 'absolute', right: size * 0.17, bottom: size * 0.12, width: size * 0.22, height: size * 0.24, backgroundColor: palette.orc }} />
          <View style={{ position: 'absolute', left: size * 0.48, bottom: size * 0.1, width: size * 0.04, height: size * 0.25, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', left: size * 0.44, top: size * 0.03, width: size * 0.12, height: size * 0.12, backgroundColor: palette.red }} />
          <View style={{ position: 'absolute', left: size * 0.05, bottom: size * 0.09 }}>
            <WagonStageSprite stageId="camp" faction="orc" size={size * 0.42} />
          </View>
        </>
      ) : (
        <View style={{ position: 'absolute', left: size * 0.28, bottom: size * 0.08 }}>
          <SettlementStageSprite stageId="settlement" faction="human" size={size * 0.46} />
        </View>
      )}
      <View
        style={{
          position: 'absolute',
          left: size * 0.44,
          top: size * 0.03,
          width: size * 0.12,
          height: size * 0.035,
          backgroundColor: accent
        }}
      />
    </View>
  );
}


const settlementWorldHumanCells = {
  plot_grass: { x: 0, y: 0 },
  plot_stone: { x: 86, y: 0 },
  plot_fenced: { x: 172, y: 0 },
  road_straight: { x: 0, y: 86 },
  road_cross: { x: 86, y: 86 },
  fence_gate: { x: 172, y: 86 },
  supplies: { x: 0, y: 172 },
  torch_banner: { x: 86, y: 172 },
  target_sign: { x: 172, y: 172 }
} as const;

const settlementPeopleHumanCells = {
  farmer: { x: 0, y: 0 },
  porter: { x: 86, y: 0 },
  guard: { x: 172, y: 0 },
  knight: { x: 0, y: 86 },
  smith: { x: 86, y: 86 },
  merchant: { x: 172, y: 86 },
  worker: { x: 0, y: 172 },
  woman: { x: 86, y: 172 },
  horse: { x: 172, y: 172 }
} as const;

const settlementNatureHumanCells = {
  tree_large: { x: 0, y: 0 },
  tree_dark: { x: 86, y: 0 },
  conifer: { x: 172, y: 0 },
  bush_flowers: { x: 0, y: 86 },
  bush_blue: { x: 86, y: 86 },
  hedge: { x: 172, y: 86 },
  rocks: { x: 0, y: 172 },
  fence: { x: 86, y: 172 },
  stone_wall: { x: 172, y: 172 }
} as const;

function SettlementDetailAtlasSprite({
  assetId,
  cell,
  size,
  opacity = 1
}: {
  assetId: string;
  cell: { x: number; y: number };
  size: number;
  opacity?: number;
}) {
  const source = getProductionAssetSource(assetId);
  if (!source) return null;
  const cellSize = 84;
  const scale = size / cellSize;
  return (
    <View style={{ width: size, height: size, overflow: 'hidden', opacity }}>
      <Image
        source={source}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          left: -cell.x * scale,
          top: -cell.y * scale,
          width: 256 * scale,
          height: 256 * scale
        }}
      />
    </View>
  );
}

export function SettlementTerrainBackdrop({
  faction = 'human',
  stageId = 'camp'
}: {
  faction?: FactionId;
  stageId?: WagonStage['id'];
}) {
  const rank = stageRanks[stageId] ?? 0;
  const accent = faction === 'elf' ? palette.elfLight : faction === 'orc' ? palette.orcLight : palette.humanLight;
  const ground =
    faction === 'elf'
      ? '#2D4934'
      : faction === 'orc'
        ? '#47352A'
        : '#354B37';
  const clearing =
    faction === 'elf'
      ? '#456448'
      : faction === 'orc'
        ? '#634738'
        : '#52684B';
  const road = faction === 'orc' ? '#76563E' : '#846E50';
  const roadEdge = faction === 'elf' ? '#557053' : faction === 'orc' ? '#553C30' : '#5B5946';
  const roadWidth = rank >= 3 ? 30 : rank >= 1 ? 25 : 20;
  const foliage = [
    { left: '2%', top: '7%' }, { left: '88%', top: '8%' },
    { left: '1%', top: '78%' }, { left: '90%', top: '75%' }
  ] as const;
  const stones = [
    { left: '12%', top: '31%' }, { left: '84%', top: '31%' },
    { left: '16%', top: '64%' }, { left: '81%', top: '67%' },
    { left: '43%', top: '13%' }, { left: '53%', top: '82%' }
  ] as const;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: ground,
        overflow: 'hidden'
      }}
    >
      <View style={{ position: 'absolute', left: '3%', top: '5%', width: '32%', height: '25%', backgroundColor: clearing, opacity: 0.58 }} />
      <View style={{ position: 'absolute', right: '3%', top: '7%', width: '30%', height: '23%', backgroundColor: clearing, opacity: 0.52 }} />
      <View style={{ position: 'absolute', left: '6%', bottom: '5%', width: '30%', height: '24%', backgroundColor: clearing, opacity: 0.47 }} />
      <View style={{ position: 'absolute', right: '5%', bottom: '5%', width: '31%', height: '25%', backgroundColor: clearing, opacity: 0.5 }} />

      {faction === 'human' ? (
        <>
          <View key="settlement-world-road-cross" style={{ position: 'absolute', left: '37%', top: '38%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.road_cross} size={104} opacity={0.92} />
          </View>
          <View style={{ position: 'absolute', left: '8%', top: '40%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.road_straight} size={76} opacity={0.75} />
          </View>
          <View style={{ position: 'absolute', right: '8%', top: '48%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.road_straight} size={76} opacity={0.72} />
          </View>
          <View style={{ position: 'absolute', left: '8%', bottom: '7%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.fence_gate} size={62} opacity={0.9} />
          </View>
          <View style={{ position: 'absolute', left: '15%', top: '55%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.supplies} size={48} opacity={0.92} />
          </View>
          <View style={{ position: 'absolute', right: '12%', top: '57%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={44} opacity={0.92} />
          </View>
          {rank >= 1 ? (
            <>
              <View style={{ position: 'absolute', left: '43%', top: '5%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={46} opacity={0.95} />
              </View>
              <View style={{ position: 'absolute', left: '2%', top: '4%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.tree_large} size={64} opacity={0.95} />
              </View>
              <View style={{ position: 'absolute', right: '1%', top: '6%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.conifer} size={58} opacity={0.95} />
              </View>
              <View style={{ position: 'absolute', left: '1%', bottom: '3%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.rocks} size={52} opacity={0.9} />
              </View>
              <View style={{ position: 'absolute', right: '2%', bottom: '2%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.bush_flowers} size={50} opacity={0.95} />
              </View>
              <View style={{ position: 'absolute', left: '10%', bottom: '17%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.farmer} size={34} opacity={0.96} />
              </View>
              <View style={{ position: 'absolute', right: '12%', bottom: '18%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.worker} size={34} opacity={0.96} />
              </View>
            </>
          ) : null}
          {rank >= 2 ? (
            <>
              <View style={{ position: 'absolute', left: '23%', top: '31%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.guard} size={32} opacity={0.98} />
              </View>
              <View style={{ position: 'absolute', right: '24%', top: '31%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.merchant} size={32} opacity={0.98} />
              </View>
              <View style={{ position: 'absolute', left: '18%', bottom: '2%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.fence} size={58} opacity={0.9} />
              </View>
            </>
          ) : null}
          {rank >= 3 ? (
            <>
              <View style={{ position: 'absolute', left: '52%', bottom: '8%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.horse} size={40} opacity={0.98} />
              </View>
              <View style={{ position: 'absolute', right: '31%', top: '12%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.knight} size={34} opacity={0.98} />
              </View>
              <View style={{ position: 'absolute', left: '31%', top: '14%' }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.stone_wall} size={56} opacity={0.74} />
              </View>
            </>
          ) : null}
        </>
      ) : null}

      <View style={{ position: 'absolute', left: 0, right: 0, top: '46%', height: roadWidth + 6, backgroundColor: roadEdge, opacity: faction === 'human' ? 0.16 : 0.78 }} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: '47%', height: roadWidth, backgroundColor: road, opacity: faction === 'human' ? 0.2 : 0.94 }} />
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: '46%', width: roadWidth + 6, backgroundColor: roadEdge, opacity: faction === 'human' ? 0.16 : 0.78 }} />
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: '47%', width: roadWidth, backgroundColor: road, opacity: faction === 'human' ? 0.2 : 0.94 }} />

      {rank >= 1 ? (
        <>
          <View style={{ position: 'absolute', left: '8%', top: '43%', width: '18%', height: 3, backgroundColor: palette.wood, opacity: 0.7 }} />
          <View style={{ position: 'absolute', right: '8%', top: '56%', width: '18%', height: 3, backgroundColor: palette.wood, opacity: 0.7 }} />
          <View style={{ position: 'absolute', left: '42%', top: '8%', width: 3, height: '17%', backgroundColor: palette.wood, opacity: 0.65 }} />
        </>
      ) : null}

      {rank >= 2 ? (
        <>
          <View style={{ position: 'absolute', left: '1.5%', right: '1.5%', top: 5, height: 3, backgroundColor: accent, opacity: 0.62 }} />
          <View style={{ position: 'absolute', left: '1.5%', right: '1.5%', bottom: 5, height: 3, backgroundColor: accent, opacity: 0.62 }} />
          <View style={{ position: 'absolute', left: 5, top: '2%', bottom: '2%', width: 3, backgroundColor: accent, opacity: 0.48 }} />
          <View style={{ position: 'absolute', right: 5, top: '2%', bottom: '2%', width: 3, backgroundColor: accent, opacity: 0.48 }} />
        </>
      ) : null}

      {rank >= 3 ? stones.map((stone, index) => (
        <View
          key={'road-stone-' + String(index)}
          style={{
            position: 'absolute',
            left: stone.left,
            top: stone.top,
            width: index % 2 === 0 ? 7 : 5,
            height: index % 3 === 0 ? 5 : 4,
            backgroundColor: palette.stoneLight,
            opacity: 0.4
          }}
        />
      )) : null}

      {foliage.map((spot, index) => faction === 'orc' ? (
        <View key={'edge-' + String(index)} style={{ position: 'absolute', left: spot.left, top: spot.top, width: 23, height: 24 }}>
          <View style={{ position: 'absolute', left: 10, top: 3, width: 4, height: 19, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', left: 3, top: 7, width: 18, height: 5, backgroundColor: palette.orc }} />
          <View style={{ position: 'absolute', left: 0, top: 15, width: 7, height: 6, backgroundColor: palette.stone }} />
        </View>
      ) : (
        <View key={'edge-' + String(index)} style={{ position: 'absolute', left: spot.left, top: spot.top, width: 24, height: 26 }}>
          <View style={{ position: 'absolute', left: 10, top: 10, width: 5, height: 16, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', left: 2, top: 3, width: 20, height: 12, backgroundColor: faction === 'elf' ? palette.elf : palette.green }} />
          <View style={{ position: 'absolute', left: 6, top: 0, width: 13, height: 9, backgroundColor: faction === 'elf' ? palette.elfLight : palette.greenLight }} />
        </View>
      ))}

      {faction === 'human' ? (
        <>
          <View style={{ position: 'absolute', left: '3%', bottom: '33%', width: 28, height: 20, borderWidth: 2, borderColor: palette.wood, opacity: 0.72 }} />
          <View style={{ position: 'absolute', right: '3%', top: '34%', width: 24, height: 17, backgroundColor: palette.food, opacity: 0.24 }} />
        </>
      ) : faction === 'elf' ? (
        <>
          <View style={{ position: 'absolute', left: '8%', top: '17%', width: 7, height: 7, backgroundColor: palette.elfLight, opacity: 0.9 }} />
          <View style={{ position: 'absolute', right: '9%', bottom: '16%', width: 9, height: 9, backgroundColor: palette.blue, opacity: 0.72 }} />
          <View style={{ position: 'absolute', left: '14%', bottom: '12%', width: 17, height: 4, backgroundColor: palette.elfLight, opacity: 0.48 }} />
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', left: '7%', top: '17%', width: 13, height: 5, backgroundColor: palette.red, opacity: 0.82 }} />
          <View style={{ position: 'absolute', right: '7%', bottom: '16%', width: 16, height: 6, backgroundColor: palette.red, opacity: 0.72 }} />
          <View style={{ position: 'absolute', right: '12%', top: '18%', width: 6, height: 15, backgroundColor: palette.outline, opacity: 0.75 }} />
        </>
      )}

      {rank >= 4 ? (
        <>
          <View style={{ position: 'absolute', left: '25%', top: 12, width: 10, height: 7, backgroundColor: accent, opacity: 0.68 }} />
          <View style={{ position: 'absolute', right: '25%', top: 12, width: 10, height: 7, backgroundColor: accent, opacity: 0.68 }} />
          <View style={{ position: 'absolute', left: '23%', bottom: 12, width: 12, height: 7, backgroundColor: accent, opacity: 0.62 }} />
          <View style={{ position: 'absolute', right: '23%', bottom: 12, width: 12, height: 7, backgroundColor: accent, opacity: 0.62 }} />
        </>
      ) : null}
    </View>
  );
}

export function ResourceSiteSprite({
  siteId,
  faction = 'human',
  size = 48
}: {
  siteId: string;
  faction?: FactionId;
  size?: number;
}) {
  const kind = getResourceSiteVisualKind(siteId);
  const production = resourceSiteProductionAsset(faction, siteId, kind);
  const productionSource = getProductionAssetSource(production.id);
  if (productionSource) {
    return <Image source={productionSource} resizeMode="contain" style={{ width: size, height: size }} />;
  }
  const accent = faction === 'elf' ? palette.elf : faction === 'orc' ? palette.orc : palette.human;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View style={{ position: 'absolute', left: size * 0.08, right: size * 0.08, bottom: size * 0.08, height: size * 0.16, backgroundColor: kind === 'hunt' ? palette.brown : palette.green }} />
      {kind === 'farm' ? (
        <>
          {[0.2, 0.38, 0.56, 0.74].map((x, index) => (
            <View key={String(index)} style={{ position: 'absolute', left: size * x, bottom: size * 0.16, width: size * 0.05, height: size * 0.42, backgroundColor: palette.food }} />
          ))}
        </>
      ) : kind === 'mine' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.18, bottom: size * 0.18, width: size * 0.64, height: size * 0.48, backgroundColor: palette.stone }} />
          <View style={{ position: 'absolute', left: size * 0.35, bottom: size * 0.18, width: size * 0.3, height: size * 0.31, backgroundColor: palette.outline }} />
          <View style={{ position: 'absolute', right: size * 0.18, top: size * 0.12, width: size * 0.12, height: size * 0.12, backgroundColor: palette.steel }} />
        </>
      ) : kind === 'timber' ? (
        <>
          {[0.18, 0.42, 0.68].map((x, index) => (
            <View key={String(index)} style={{ position: 'absolute', left: size * x, bottom: size * 0.18 }}>
              <View style={{ width: size * 0.08, height: size * 0.36, backgroundColor: palette.wood }} />
              <View style={{ position: 'absolute', left: -size * 0.07, top: -size * 0.14, width: size * 0.22, height: size * 0.18, backgroundColor: palette.green }} />
            </View>
          ))}
        </>
      ) : kind === 'herb_grove' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.19, bottom: size * 0.18, width: size * 0.16, height: size * 0.24, backgroundColor: palette.elf }} />
          <View style={{ position: 'absolute', right: size * 0.19, bottom: size * 0.18, width: size * 0.16, height: size * 0.24, backgroundColor: palette.elfLight }} />
          <View style={{ position: 'absolute', left: size * 0.38, bottom: size * 0.15, width: size * 0.24, height: size * 0.24, borderRadius: size * 0.12, backgroundColor: palette.blue }} />
        </>
      ) : kind === 'hunt' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.18, bottom: size * 0.2, width: size * 0.5, height: size * 0.28, backgroundColor: palette.brownLight }} />
          <View style={{ position: 'absolute', right: size * 0.15, bottom: size * 0.32, width: size * 0.22, height: size * 0.2, backgroundColor: palette.brownLight }} />
          <View style={{ position: 'absolute', left: size * 0.25, bottom: size * 0.13, width: size * 0.08, height: size * 0.18, backgroundColor: palette.outline }} />
          <View style={{ position: 'absolute', left: size * 0.53, bottom: size * 0.13, width: size * 0.08, height: size * 0.18, backgroundColor: palette.outline }} />
        </>
      ) : kind === 'beacon' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.44, bottom: size * 0.14, width: size * 0.12, height: size * 0.54, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', left: size * 0.29, top: size * 0.12, width: size * 0.42, height: size * 0.13, backgroundColor: palette.elf }} />
          <View style={{ position: 'absolute', left: size * 0.4, top: size * 0.02, width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1, backgroundColor: palette.blue }} />
        </>
      ) : kind === 'quarry' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.12, bottom: size * 0.14, width: size * 0.76, height: size * 0.42, backgroundColor: palette.stone }} />
          <View style={{ position: 'absolute', left: size * 0.22, top: size * 0.12, width: size * 0.19, height: size * 0.19, backgroundColor: palette.stoneLight }} />
          <View style={{ position: 'absolute', right: size * 0.18, top: size * 0.18, width: size * 0.2, height: size * 0.16, backgroundColor: palette.steel }} />
          <View style={{ position: 'absolute', left: size * 0.45, top: size * 0.02, width: size * 0.07, height: size * 0.44, backgroundColor: palette.wood, transform: [{ rotate: '34deg' }] }} />
        </>
      ) : kind === 'archive' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.2, bottom: size * 0.16, width: size * 0.6, height: size * 0.48, backgroundColor: palette.stoneLight }} />
          <View style={{ position: 'absolute', left: size * 0.28, top: size * 0.2, width: size * 0.44, height: size * 0.1, backgroundColor: palette.gold }} />
          <View style={{ position: 'absolute', left: size * 0.31, bottom: size * 0.17, width: size * 0.12, height: size * 0.27, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', right: size * 0.31, bottom: size * 0.17, width: size * 0.12, height: size * 0.27, backgroundColor: palette.wood }} />
        </>
      ) : kind === 'vault' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.16, bottom: size * 0.15, width: size * 0.68, height: size * 0.5, backgroundColor: palette.steelDark }} />
          <View style={{ position: 'absolute', left: size * 0.31, bottom: size * 0.17, width: size * 0.38, height: size * 0.38, borderRadius: size * 0.19, backgroundColor: palette.steel }} />
          <View style={{ position: 'absolute', left: size * 0.46, bottom: size * 0.29, width: size * 0.08, height: size * 0.12, backgroundColor: palette.gold }} />
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', left: size * 0.15, bottom: size * 0.16, width: size * 0.7, height: size * 0.34, backgroundColor: kind === 'salvage' ? palette.steelDark : palette.wood }} />
          <View style={{ position: 'absolute', left: size * 0.25, top: size * 0.19, width: size * 0.5, height: size * 0.09, backgroundColor: accent }} />
        </>
      )}
    </View>
  );
}

export function RegionMapBackdrop({
  faction,
  chapter,
  compact = false
}: {
  faction: FactionId;
  chapter: number;
  compact?: boolean;
}) {
  const height = compact ? 122 : 170;
  const accent = faction === 'elf' ? palette.elf : faction === 'orc' ? palette.orc : palette.human;
  const ground = faction === 'elf' ? '#263D30' : faction === 'orc' ? '#5A3A2B' : '#405542';

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: ground, overflow: 'hidden' }}>
      {faction === 'elf' ? (
        <>
          {(['4%', '18%', '73%', '87%'] as const).map((left, index) => (
            <View key={String(index)} style={{ position: 'absolute', left, top: index % 2 ? 12 : 28, width: 34, height: 34, backgroundColor: palette.elf, opacity: 0.55 }} />
          ))}
          <View style={{ position: 'absolute', left: '8%', right: '8%', top: '48%', height: 7, backgroundColor: palette.elfLight, opacity: 0.55, transform: [{ rotate: '-8deg' }] }} />
          <View style={{ position: 'absolute', left: chapter >= 2 ? '58%' : '38%', top: chapter >= 3 ? '14%' : '34%', width: 27, height: 27, borderRadius: 14, backgroundColor: palette.blue, opacity: 0.75 }} />
        </>
      ) : faction === 'orc' ? (
        <>
          <View style={{ position: 'absolute', left: '4%', right: '4%', top: '56%', height: 8, backgroundColor: palette.brownLight, opacity: 0.65, transform: [{ rotate: '5deg' }] }} />
          {(['12%', '30%', '68%', '84%'] as const).map((left, index) => (
            <View key={String(index)} style={{ position: 'absolute', left, top: index % 2 ? 18 : 32, width: 18, height: 13, backgroundColor: palette.red, opacity: 0.62 }} />
          ))}
          {chapter >= 3 ? (
            <>
              <View style={{ position: 'absolute', right: '12%', top: '10%', width: 0, height: 0, borderLeftWidth: 24, borderRightWidth: 24, borderBottomWidth: 44, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: palette.stone }} />
              <View style={{ position: 'absolute', right: '28%', top: '20%', width: 0, height: 0, borderLeftWidth: 19, borderRightWidth: 19, borderBottomWidth: 34, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: palette.stoneLight }} />
            </>
          ) : null}
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', left: '3%', right: '3%', top: '55%', height: 7, backgroundColor: palette.brownLight, opacity: 0.6, transform: [{ rotate: '-4deg' }] }} />
          <View style={{ position: 'absolute', left: '11%', top: '20%', width: 48, height: 34, backgroundColor: palette.green, opacity: 0.65 }} />
          <View style={{ position: 'absolute', right: '8%', top: '13%', width: 0, height: 0, borderLeftWidth: 28, borderRightWidth: 28, borderBottomWidth: 50, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: palette.stone }} />
          {chapter >= 5 ? (
            <View style={{ position: 'absolute', right: '18%', bottom: '13%', width: 25, height: 44, backgroundColor: palette.stoneLight, borderTopWidth: 5, borderTopColor: palette.gold }} />
          ) : null}
        </>
      )}
      <View style={{ position: 'absolute', left: '12%', right: '12%', bottom: compact ? height * 0.13 : 18, height: 4, backgroundColor: accent, opacity: 0.48 }} />
    </View>
  );
}


export function CommanderPortrait({
  pathId,
  faction,
  size = 76
}: {
  pathId: string;
  faction: FactionId;
  size?: number;
}) {
  const kind = getCommanderVisualKind(pathId);
  const production = commanderProductionAsset(faction, pathId, kind);
  const productionSource = getProductionAssetSource(production.id);
  if (productionSource) {
    return <Image source={productionSource} resizeMode="contain" style={{ width: size, height: size }} />;
  }
  const baseClass =
    kind === 'ranger' || kind === 'windcaller'
      ? 'Ranger'
      : kind === 'cavalry'
        ? 'Cavalryman'
        : kind === 'warglord'
          ? 'Warg Scout'
          : 'Swordsman';

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <UnitSprite className={baseClass} faction={faction} size={size} />

      {kind === 'vanguard' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.08, top: size * 0.4, width: size * 0.22, height: size * 0.34, backgroundColor: palette.human, borderWidth: Math.max(1, size * 0.025), borderColor: palette.steel }} />
          <View style={{ position: 'absolute', right: size * 0.12, top: size * 0.17, width: size * 0.05, height: size * 0.56, backgroundColor: palette.steel }} />
          <View style={{ position: 'absolute', right: size * 0.2, top: size * 0.19, width: size * 0.2, height: size * 0.05, backgroundColor: palette.gold }} />
        </>
      ) : null}

      {kind === 'ranger' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.17, top: size * 0.11, width: size * 0.34, height: size * 0.12, backgroundColor: palette.green }} />
          <View style={{ position: 'absolute', right: size * 0.08, top: size * 0.18, width: size * 0.05, height: size * 0.58, backgroundColor: palette.brownLight }} />
          <View style={{ position: 'absolute', left: size * 0.2, bottom: size * 0.07, width: size * 0.48, height: size * 0.06, backgroundColor: palette.green, transform: [{ rotate: '-10deg' }] }} />
        </>
      ) : null}

      {kind === 'cavalry' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.15, top: size * 0.04, width: size * 0.7, height: size * 0.07, backgroundColor: palette.gold }} />
          <View style={{ position: 'absolute', right: size * 0.02, top: size * 0.38, width: size * 0.16, height: size * 0.08, backgroundColor: palette.steel }} />
        </>
      ) : null}

      {kind === 'windcaller' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.02, top: size * 0.24, width: size * 0.42, height: size * 0.04, backgroundColor: palette.elfLight, transform: [{ rotate: '-16deg' }] }} />
          <View style={{ position: 'absolute', right: size * 0.01, top: size * 0.46, width: size * 0.44, height: size * 0.04, backgroundColor: palette.elfLight, transform: [{ rotate: '13deg' }] }} />
          <View style={{ position: 'absolute', left: size * 0.39, top: size * 0.04, width: size * 0.22, height: size * 0.08, backgroundColor: palette.blue }} />
        </>
      ) : null}

      {kind === 'thorn' ? (
        <>
          {[0.08, 0.28, 0.5, 0.72].map((left, index) => (
            <View
              key={String(index)}
              style={{
                position: 'absolute',
                left: size * left,
                bottom: size * 0.1,
                width: size * 0.05,
                height: size * (0.18 + (index % 2) * 0.06),
                backgroundColor: palette.greenLight,
                transform: [{ rotate: index % 2 ? '18deg' : '-18deg' }]
              }}
            />
          ))}
          <View style={{ position: 'absolute', left: size * 0.07, top: size * 0.4, width: size * 0.25, height: size * 0.32, backgroundColor: palette.elf, borderWidth: Math.max(1, size * 0.02), borderColor: palette.elfLight }} />
        </>
      ) : null}

      {kind === 'moon' ? (
        <>
          <View style={{ position: 'absolute', right: size * 0.04, top: size * 0.04, width: size * 0.27, height: size * 0.27, borderRadius: size * 0.135, backgroundColor: palette.blue }} />
          <View style={{ position: 'absolute', right: size * 0.01, top: size * 0.01, width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11, backgroundColor: palette.outline }} />
          <View style={{ position: 'absolute', left: size * 0.2, bottom: size * 0.07, width: size * 0.6, height: size * 0.05, backgroundColor: palette.elfLight }} />
        </>
      ) : null}

      {kind === 'bloodchief' ? (
        <>
          <View style={{ position: 'absolute', right: size * 0.08, top: size * 0.18, width: size * 0.08, height: size * 0.54, backgroundColor: palette.steelDark, transform: [{ rotate: '14deg' }] }} />
          <View style={{ position: 'absolute', right: 0, top: size * 0.13, width: size * 0.22, height: size * 0.14, backgroundColor: palette.steel }} />
          <View style={{ position: 'absolute', left: size * 0.16, top: size * 0.08, width: size * 0.68, height: size * 0.07, backgroundColor: palette.red }} />
        </>
      ) : null}

      {kind === 'warglord' ? (
        <>
          <View style={{ position: 'absolute', right: 0, top: size * 0.42, width: size * 0.27, height: size * 0.17, backgroundColor: palette.outline }} />
          <View style={{ position: 'absolute', right: size * 0.02, top: size * 0.34, width: size * 0.06, height: size * 0.13, backgroundColor: palette.outline, transform: [{ rotate: '18deg' }] }} />
          <View style={{ position: 'absolute', left: size * 0.14, top: size * 0.06, width: size * 0.72, height: size * 0.06, backgroundColor: palette.orcLight }} />
        </>
      ) : null}

      {kind === 'warcaller' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.02, bottom: size * 0.08, width: size * 0.32, height: size * 0.32, borderRadius: size * 0.16, backgroundColor: palette.brown, borderWidth: Math.max(1, size * 0.03), borderColor: palette.orcLight }} />
          <View style={{ position: 'absolute', left: size * 0.1, top: size * 0.25, width: size * 0.05, height: size * 0.5, backgroundColor: palette.wood, transform: [{ rotate: '28deg' }] }} />
          <View style={{ position: 'absolute', right: size * 0.14, top: size * 0.08, width: size * 0.1, height: size * 0.16, backgroundColor: palette.red }} />
        </>
      ) : null}
    </View>
  );
}

export type StoryCharacterRole =
  | 'envoy'
  | 'refugee'
  | 'archivist'
  | 'delegate'
  | 'ashen'
  | 'officer';

export function StoryCharacterPortrait({
  role,
  faction = 'human',
  size = 64
}: {
  role: StoryCharacterRole;
  faction?: FactionId;
  size?: number;
}) {
  const className =
    role === 'officer'
      ? 'Swordsman'
      : role === 'ashen'
        ? 'Ranger'
        : role === 'refugee'
          ? 'Scout'
          : 'Recruit';

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <UnitSprite className={className} faction={faction} size={size} />
      {role === 'envoy' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.16, top: size * 0.06, width: size * 0.68, height: size * 0.08, backgroundColor: palette.gold }} />
          <View style={{ position: 'absolute', right: size * 0.06, top: size * 0.22, width: size * 0.14, height: size * 0.36, backgroundColor: palette.human }} />
        </>
      ) : null}
      {role === 'refugee' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.06, bottom: size * 0.1, width: size * 0.28, height: size * 0.22, backgroundColor: palette.brown }} />
          <View style={{ position: 'absolute', right: size * 0.06, bottom: size * 0.13, width: size * 0.21, height: size * 0.18, backgroundColor: palette.food }} />
        </>
      ) : null}
      {role === 'archivist' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.14, bottom: size * 0.07, width: size * 0.72, height: size * 0.08, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', left: size * 0.22, bottom: size * 0.14, width: size * 0.25, height: size * 0.11, backgroundColor: palette.cloth }} />
          <View style={{ position: 'absolute', right: size * 0.21, bottom: size * 0.14, width: size * 0.23, height: size * 0.11, backgroundColor: palette.gold }} />
        </>
      ) : null}
      {role === 'delegate' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.15, top: size * 0.08, width: size * 0.7, height: size * 0.08, backgroundColor: palette.humanLight }} />
          <View style={{ position: 'absolute', left: size * 0.24, bottom: size * 0.05, width: size * 0.52, height: size * 0.07, backgroundColor: palette.gold }} />
        </>
      ) : null}
      {role === 'ashen' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.12, right: size * 0.12, top: size * 0.07, height: size * 0.1, backgroundColor: palette.outline }} />
          <View style={{ position: 'absolute', left: size * 0.19, right: size * 0.19, bottom: size * 0.08, height: size * 0.1, backgroundColor: palette.red }} />
        </>
      ) : null}
    </View>
  );
}

export function StoryScene({
  scene,
  faction = 'human',
  size = 240
}: {
  scene:
    | 'marcher_envoy'
    | 'refugee_camp'
    | 'broken_archives'
    | 'royal_ledger'
    | 'grand_council'
    | 'forced_beacon'
    | 'crownspire'
    | 'victory';
  faction?: FactionId;
  size?: number;
}) {
  const production = storySceneProductionAsset(scene, faction);
  const productionSource = getProductionAssetSource(production.id);
  const height = size * 0.45;
  if (productionSource) {
    return <Image source={productionSource} resizeMode="cover" style={{ width: size, height }} />;
  }
  const accent =
    faction === 'elf'
      ? palette.elf
      : faction === 'orc'
        ? palette.orc
        : palette.human;

  return (
    <View style={{ width: size, height, position: 'relative', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: scene === 'forced_beacon' || scene === 'royal_ledger' ? '#29262A' : '#344137' }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: height * 0.24, backgroundColor: scene === 'crownspire' || scene === 'grand_council' ? palette.stone : palette.brown }} />

      {scene === 'marcher_envoy' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.08, bottom: height * 0.18 }}><StoryCharacterPortrait role="envoy" size={height * 0.68} /></View>
          <View style={{ position: 'absolute', right: size * 0.1, bottom: height * 0.18 }}><FactionCrest faction="human" size={height * 0.52} /></View>
          <View style={{ position: 'absolute', left: '35%', right: '18%', top: height * 0.35, height: 5, backgroundColor: palette.gold }} />
        </>
      ) : null}

      {scene === 'refugee_camp' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.04, bottom: height * 0.08 }}><StoryCharacterPortrait role="refugee" size={height * 0.62} /></View>
          <View style={{ position: 'absolute', right: size * 0.12, bottom: height * 0.12, width: size * 0.24, height: height * 0.35, backgroundColor: palette.cloth }} />
          <View style={{ position: 'absolute', right: size * 0.08, bottom: height * 0.1, width: size * 0.32, height: 5, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', left: '42%', top: '24%' }}><WagonStageSprite stageId="camp" faction="human" size={height * 0.55} /></View>
        </>
      ) : null}

      {scene === 'broken_archives' ? (
        <>
          {[0.1, 0.36, 0.62].map((x, index) => (
            <View key={String(index)} style={{ position: 'absolute', left: size * x, bottom: height * 0.18, width: size * 0.18, height: height * 0.55, backgroundColor: palette.wood }}>
              <View style={{ position: 'absolute', left: 4, right: 4, top: 7, height: 5, backgroundColor: index % 2 ? palette.red : palette.gold }} />
              <View style={{ position: 'absolute', left: 4, right: 4, top: 19, height: 5, backgroundColor: palette.cloth }} />
              <View style={{ position: 'absolute', left: 4, right: 4, top: 31, height: 5, backgroundColor: palette.stoneLight }} />
            </View>
          ))}
          <View style={{ position: 'absolute', right: size * 0.04, bottom: height * 0.06 }}><StoryCharacterPortrait role="archivist" size={height * 0.62} /></View>
          <View style={{ position: 'absolute', left: size * 0.08, right: size * 0.08, top: height * 0.1, height: 4, backgroundColor: palette.steelDark, opacity: 0.7 }} />
        </>
      ) : null}

      {scene === 'royal_ledger' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.14, right: size * 0.14, bottom: height * 0.1, height: height * 0.35, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', left: size * 0.24, top: height * 0.3, width: size * 0.36, height: height * 0.22, backgroundColor: palette.cloth, transform: [{ rotate: '-7deg' }] }} />
          <View style={{ position: 'absolute', right: size * 0.2, top: height * 0.16, width: 7, height: height * 0.23, backgroundColor: palette.gold }} />
          <View style={{ position: 'absolute', right: size * 0.17, top: height * 0.11, width: 15, height: 15, borderRadius: 8, backgroundColor: palette.red }} />
          <View style={{ position: 'absolute', left: size * 0.03, bottom: height * 0.04 }}><StoryCharacterPortrait role="ashen" size={height * 0.54} /></View>
        </>
      ) : null}

      {scene === 'grand_council' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.14, right: size * 0.14, bottom: height * 0.12, height: height * 0.22, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', left: size * 0.06, bottom: height * 0.12 }}><StoryCharacterPortrait role="delegate" size={height * 0.5} /></View>
          <View style={{ position: 'absolute', right: size * 0.06, bottom: height * 0.12 }}><StoryCharacterPortrait role="officer" size={height * 0.5} /></View>
          <View style={{ position: 'absolute', left: '43%', top: '10%' }}><FactionCrest faction="human" size={height * 0.43} /></View>
        </>
      ) : null}

      {scene === 'forced_beacon' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.45, top: height * 0.12, width: size * 0.1, height: height * 0.72, backgroundColor: palette.stoneLight }} />
          <View style={{ position: 'absolute', left: size * 0.36, top: height * 0.02, width: size * 0.28, height: height * 0.22, borderRadius: height * 0.11, backgroundColor: palette.gold }} />
          <View style={{ position: 'absolute', left: size * 0.08, right: size * 0.08, top: height * 0.2, height: 5, backgroundColor: palette.red, transform: [{ rotate: '-8deg' }] }} />
          <View style={{ position: 'absolute', left: size * 0.08, right: size * 0.08, top: height * 0.38, height: 4, backgroundColor: palette.blue, transform: [{ rotate: '11deg' }] }} />
          <View style={{ position: 'absolute', left: size * 0.42, bottom: height * 0.04 }}><FactionCrest faction="human" size={height * 0.34} /></View>
        </>
      ) : null}

      {scene === 'crownspire' ? (
        <>
          {[0.14, 0.38, 0.64].map((x, index) => (
            <View key={String(index)} style={{ position: 'absolute', left: size * x, bottom: height * 0.18, width: size * (index === 1 ? 0.18 : 0.12), height: height * (index === 1 ? 0.62 : 0.48), backgroundColor: palette.stoneLight, borderTopWidth: 5, borderTopColor: palette.gold }} />
          ))}
          <View style={{ position: 'absolute', left: size * 0.05, right: size * 0.05, top: height * 0.18, height: 5, backgroundColor: palette.red, opacity: 0.65 }} />
        </>
      ) : null}

      {scene === 'victory' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.15, bottom: height * 0.12, width: 5, height: height * 0.58, backgroundColor: palette.wood }} />
          <View style={{ position: 'absolute', left: size * 0.17, top: height * 0.12, width: size * 0.26, height: height * 0.2, backgroundColor: accent }} />
          <View style={{ position: 'absolute', right: size * 0.12, bottom: height * 0.09 }}><FactionCrest faction={faction} size={height * 0.45} /></View>
          <View style={{ position: 'absolute', left: size * 0.43, right: size * 0.2, bottom: height * 0.2, height: 5, backgroundColor: palette.gold }} />
        </>
      ) : null}
    </View>
  );
}


export type AppNavIconKind = 'kingdom' | 'campaign' | 'formation' | 'wagon' | 'army';

export function AppNavIcon({
  kind,
  color,
  size = 22
}: {
  kind: AppNavIconKind;
  color: string;
  size?: number;
}) {
  const production = uiProductionAsset('nav_' + kind);
  const source = getProductionAssetSource(production.id);
  if (source) {
    return <Image source={source} resizeMode="contain" style={{ width: size, height: size }} />;
  }

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {kind === 'kingdom' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.2, right: size * 0.2, bottom: size * 0.12, height: size * 0.48, borderWidth: 2, borderColor: color }} />
          <View style={{ position: 'absolute', left: size * 0.12, top: size * 0.12, width: size * 0.22, height: size * 0.3, backgroundColor: color }} />
          <View style={{ position: 'absolute', right: size * 0.12, top: size * 0.12, width: size * 0.22, height: size * 0.3, backgroundColor: color }} />
        </>
      ) : kind === 'campaign' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.12, top: size * 0.62, width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, backgroundColor: color }} />
          <View style={{ position: 'absolute', left: size * 0.42, top: size * 0.38, width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, backgroundColor: color }} />
          <View style={{ position: 'absolute', right: size * 0.1, top: size * 0.12, width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, backgroundColor: color }} />
          <View style={{ position: 'absolute', left: size * 0.22, top: size * 0.51, width: size * 0.32, height: 2, backgroundColor: color, transform: [{ rotate: '-35deg' }] }} />
          <View style={{ position: 'absolute', left: size * 0.53, top: size * 0.27, width: size * 0.3, height: 2, backgroundColor: color, transform: [{ rotate: '-35deg' }] }} />
        </>
      ) : kind === 'formation' ? (
        <>
          {[0, 1, 2].map(row =>
            [0, 1, 2].map(col => (
              <View
                key={String(row) + '-' + String(col)}
                style={{
                  position: 'absolute',
                  left: size * (0.08 + col * 0.31),
                  top: size * (0.08 + row * 0.31),
                  width: size * 0.22,
                  height: size * 0.22,
                  borderWidth: 1.5,
                  borderColor: color
                }}
              />
            ))
          )}
        </>
      ) : kind === 'wagon' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.08, right: size * 0.08, top: size * 0.22, height: size * 0.46, borderWidth: 2, borderColor: color }} />
          <View style={{ position: 'absolute', left: size * 0.18, bottom: size * 0.04, width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11, borderWidth: 2, borderColor: color }} />
          <View style={{ position: 'absolute', right: size * 0.18, bottom: size * 0.04, width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11, borderWidth: 2, borderColor: color }} />
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', left: size * 0.39, top: size * 0.06, width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11, backgroundColor: color }} />
          <View style={{ position: 'absolute', left: size * 0.25, top: size * 0.3, width: size * 0.5, height: size * 0.38, backgroundColor: color }} />
          <View style={{ position: 'absolute', left: size * 0.2, bottom: size * 0.05, width: size * 0.18, height: size * 0.28, backgroundColor: color }} />
          <View style={{ position: 'absolute', right: size * 0.2, bottom: size * 0.05, width: size * 0.18, height: size * 0.28, backgroundColor: color }} />
        </>
      )}
    </View>
  );
}

export function ThemeModeIcon({
  dark,
  color,
  size = 20
}: {
  dark: boolean;
  color: string;
  size?: number;
}) {
  const production = uiProductionAsset(dark ? 'theme_dark' : 'theme_light');
  const source = getProductionAssetSource(production.id);
  if (source) {
    return <Image source={source} resizeMode="contain" style={{ width: size, height: size }} />;
  }

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {dark ? (
        <>
          <View style={{ position: 'absolute', left: 1, top: 1, width: size - 2, height: size - 2, borderRadius: size / 2, backgroundColor: color }} />
          <View style={{ position: 'absolute', left: size * 0.36, top: -1, width: size, height: size, borderRadius: size / 2, backgroundColor: palette.outline }} />
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', left: size * 0.28, top: size * 0.28, width: size * 0.44, height: size * 0.44, borderRadius: size * 0.22, backgroundColor: color }} />
          {[0, 45, 90, 135].map(angle => (
            <View
              key={String(angle)}
              style={{
                position: 'absolute',
                left: size * 0.47,
                top: size * 0.02,
                width: size * 0.06,
                height: size * 0.23,
                backgroundColor: color,
                transform: [{ rotate: String(angle) + 'deg' }, { translateY: size * 0.37 }]
              }}
            />
          ))}
        </>
      )}
    </View>
  );
}


export function LockIcon({
  color,
  size = 24
}: {
  color: string;
  size?: number;
}) {
  const production = uiProductionAsset('lock');
  const source = getProductionAssetSource(production.id);
  if (source) {
    return <Image source={source} resizeMode="contain" style={{ width: size, height: size }} />;
  }

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          left: size * 0.27,
          top: size * 0.08,
          width: size * 0.46,
          height: size * 0.42,
          borderWidth: Math.max(1, size * 0.08),
          borderColor: color,
          borderRadius: size * 0.22
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.17,
          right: size * 0.17,
          bottom: size * 0.08,
          height: size * 0.48,
          borderRadius: size * 0.1,
          backgroundColor: color
        }}
      />
    </View>
  );
}

export function PlotTerrainSprite({
  terrain,
  color,
  size = 28
}: {
  terrain: string;
  color: string;
  size?: number;
}) {
  const production = uiProductionAsset('terrain_' + terrain);
  const source = getProductionAssetSource(production.id);
  if (source) {
    return <Image source={source} resizeMode="contain" style={{ width: size, height: size }} />;
  }

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {terrain === 'high_ground' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.08, bottom: size * 0.12, width: 0, height: 0, borderLeftWidth: size * 0.2, borderRightWidth: size * 0.2, borderBottomWidth: size * 0.34, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
          <View style={{ position: 'absolute', right: size * 0.07, bottom: size * 0.12, width: 0, height: 0, borderLeftWidth: size * 0.17, borderRightWidth: size * 0.17, borderBottomWidth: size * 0.27, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color, opacity: 0.65 }} />
        </>
      ) : terrain === 'roadside' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.08, right: size * 0.08, top: size * 0.3, height: size * 0.12, backgroundColor: color, transform: [{ rotate: '-14deg' }] }} />
          <View style={{ position: 'absolute', left: size * 0.08, right: size * 0.08, bottom: size * 0.3, height: size * 0.12, backgroundColor: color, transform: [{ rotate: '-14deg' }] }} />
        </>
      ) : terrain === 'square' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.2, top: size * 0.2, width: size * 0.6, height: size * 0.6, borderWidth: Math.max(1, size * 0.07), borderColor: color, transform: [{ rotate: '45deg' }] }} />
          <View style={{ position: 'absolute', left: size * 0.45, top: size * 0.45, width: size * 0.1, height: size * 0.1, backgroundColor: color }} />
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', left: size * 0.2, bottom: size * 0.12, width: size * 0.12, height: size * 0.28, backgroundColor: color, transform: [{ rotate: '-18deg' }] }} />
          <View style={{ position: 'absolute', left: size * 0.43, bottom: size * 0.1, width: size * 0.11, height: size * 0.38, backgroundColor: color }} />
          <View style={{ position: 'absolute', right: size * 0.18, bottom: size * 0.12, width: size * 0.1, height: size * 0.25, backgroundColor: color, transform: [{ rotate: '19deg' }] }} />
        </>
      )}
    </View>
  );
}
