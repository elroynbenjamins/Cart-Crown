import { humanFigureForClass } from './portraitBattle/humanArt';
import { ReferenceArt } from './portraitBattle/Art';
import { TreasurySprite } from './TreasuryArt';
import { humanSettlementAtlasBase64 } from './generated/humanSettlementAtlas';
import React from 'react';
import { AccessibilityInfo, Animated, Easing, Image, View } from 'react-native';
import type {
  BuildingRole,
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
  settlementBackgroundProductionAsset,
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

const settlementHumanV2BuildingCells: Record<string, { x: number; y: number }> = {
  hall: { x: 0, y: 0 },
  barracks: { x: 110, y: 0 },
  wagonwright: { x: 220, y: 0 },
  forge: { x: 0, y: 110 },
  quartermaster: { x: 110, y: 110 },
  stable: { x: 220, y: 110 },
  war_room: { x: 0, y: 220 },
  signal_tower: { x: 110, y: 220 },
  officer_academy: { x: 220, y: 220 }
};
const settlementHumanV2AtlasUri = 'data:image/png;base64,' + humanSettlementAtlasBase64;

function SettlementHumanV2BuildingSprite({
  buildingId,
  size
}: {
  buildingId: string;
  size: number;
}) {
  const cell = settlementHumanV2BuildingCells[buildingId];
  if (!cell) return null;

  const cellSize = 110;
  const scale = size / cellSize;
  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={{ uri: settlementHumanV2AtlasUri }}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          left: -cell.x * scale,
          top: -cell.y * scale,
          width: 330 * scale,
          height: 330 * scale
        }}
      />
    </View>
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
  if (
    faction === 'human' &&
    settlementHumanV2BuildingCells[buildingId]
  ) {
    return <SettlementHumanV2BuildingSprite buildingId={buildingId} size={size} />;
  }
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
      <TreasurySprite kind={resource} size={size}>
        <PixelSprite artKey={keyByResource[resource]} size={size} />
      </TreasurySprite>
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
  const [failedFactions, setFailedFactions] = React.useState<Partial<Record<FactionId, boolean>>>({});
  const production = storySceneProductionAsset('camp', faction);
  const productionSource = getProductionAssetSource(production.id);

  if (productionSource && !failedFactions[faction]) {
    return (
      <Image
        key={faction}
        source={productionSource}
        testID={'camp-panorama-' + faction}
        resizeMode="cover"
        resizeMethod="resize"
        fadeDuration={0}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        onError={() => setFailedFactions(previous => ({ ...previous, [faction]: true }))}
        style={{ width: size, height: size * 0.48, borderRadius: 6 }}
      />
    );
  }

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

const settlementSceneHumanV2Cells = {
  dock: { x: 0, y: 0 },
  sailboat: { x: 86, y: 0 },
  waterfall: { x: 172, y: 0 },
  build_dirt: { x: 0, y: 86 },
  build_banner: { x: 86, y: 86 },
  market: { x: 172, y: 86 },
  wagon: { x: 0, y: 172 },
  fountain: { x: 86, y: 172 },
  gate: { x: 172, y: 172 }
} as const;

const settlementSceneFactionAssetIds: Record<FactionId, string> = {
  human: 'ui.settlement_scene_human_v2_atlas',
  elf: 'ui.settlement_scene_human_v2_atlas',
  orc: 'ui.settlement_scene_human_v2_atlas'
};

const settlementSceneFactionTints: Record<FactionId, string | undefined> = {
  human: undefined,
  elf: '#65A989',
  orc: '#A25743'
};

function SettlementDetailAtlasSprite({
  assetId,
  cell,
  size,
  opacity = 1,
  tintColor
}: {
  assetId: string;
  cell: { x: number; y: number };
  size: number;
  opacity?: number;
  tintColor?: string;
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
          height: 256 * scale,
          tintColor
        }}
      />
    </View>
  );
}

function useSettlementAmbientMotion(duration = 2200) {
  const progress = React.useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (active) setReduceMotion(value);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    progress.stopAnimation();
    if (reduceMotion) {
      progress.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [duration, progress, reduceMotion]);

  return progress;
}

const settlementAmbientPeopleTint: Record<FactionId, string | undefined> = {
  human: undefined,
  elf: '#95DDBD',
  orc: '#D27A5D'
};

const settlementAmbientGlow: Record<FactionId, string> = {
  human: '#F0B45E',
  elf: '#68E0D5',
  orc: '#F06B3B'
};

const settlementAmbientPrimaryByRole: Record<BuildingRole, keyof typeof settlementPeopleHumanCells> = {
  KINGDOM: 'guard',
  ARMY: 'guard',
  EQUIPMENT: 'smith',
  LOGISTICS: 'worker',
  SUPPLY: 'merchant',
  COMMAND: 'knight',
  MOUNT: 'worker',
  SCOUT: 'guard'
};

const settlementAmbientSecondaryByRole: Record<BuildingRole, keyof typeof settlementPeopleHumanCells> = {
  KINGDOM: 'knight',
  ARMY: 'worker',
  EQUIPMENT: 'worker',
  LOGISTICS: 'porter',
  SUPPLY: 'porter',
  COMMAND: 'guard',
  MOUNT: 'horse',
  SCOUT: 'porter'
};

const settlementAmbientTertiaryByRole: Record<BuildingRole, keyof typeof settlementPeopleHumanCells> = {
  KINGDOM: 'woman',
  ARMY: 'guard',
  EQUIPMENT: 'porter',
  LOGISTICS: 'merchant',
  SUPPLY: 'woman',
  COMMAND: 'knight',
  MOUNT: 'porter',
  SCOUT: 'worker'
};

export function SettlementBuildingAmbience({
  buildingId,
  role,
  faction = 'human',
  level = 1,
  activeDistricts = 0,
  size = 84
}: {
  buildingId: string;
  role: BuildingRole;
  faction?: FactionId;
  level?: number;
  activeDistricts?: number;
  size?: number;
}) {
  const peopleSource = getProductionAssetSource('ui.settlement_people_human_atlas');
  const worldSource = getProductionAssetSource('ui.settlement_world_human_atlas');
  const natureSource = getProductionAssetSource('ui.settlement_nature_human_atlas');
  const sceneSource = getProductionAssetSource(settlementSceneFactionAssetIds[faction]);
  const tintColor = settlementAmbientPeopleTint[faction];
  const glow = settlementAmbientGlow[faction];
  const kind = getBuildingVisualKind(buildingId);
  const primary = settlementAmbientPrimaryByRole[role];
  const secondary = settlementAmbientSecondaryByRole[role];
  const tertiary = settlementAmbientTertiaryByRole[role];
  const smoky = kind === 'forge' || buildingId.includes('smokehouse');
  const showSecond = level >= 2 || role === 'KINGDOM' || role === 'MOUNT';
  const established = level >= 2;
  const veteran = level >= 4;
  const districtActive = activeDistricts > 0;
  const bustling = activeDistricts > 1 || level >= 3;
  const motion = useSettlementAmbientMotion(2200 + Math.max(0, level - 1) * 120);
  const idleLift = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] });
  const bannerSway = motion.interpolate({ inputRange: [0, 1], outputRange: ['-1.2deg', '1.2deg'] });
  const smokeLift = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const smokeFade = motion.interpolate({ inputRange: [0, 1], outputRange: [0.34, 0.14] });
  const glowPulse = motion.interpolate({ inputRange: [0, 1], outputRange: [0.42, 0.72] });
  const districtDrift = motion.interpolate({ inputRange: [0, 1], outputRange: [-1.6, 1.6] });
  const districtScale = motion.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {worldSource && role === 'ARMY' ? (
        <>
          <View style={{ position: 'absolute', right: 0, bottom: size * 0.03 }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={size * 0.34} opacity={0.86} tintColor={tintColor} />
          </View>
          {established ? (
            <View style={{ position: 'absolute', left: size * 0.02, top: size * 0.08 }}>
              <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={size * 0.27} opacity={0.82} tintColor={tintColor} />
            </View>
          ) : null}
        </>
      ) : null}
      {worldSource && (role === 'SUPPLY' || role === 'LOGISTICS' || role === 'EQUIPMENT') ? (
        <View style={{ position: 'absolute', right: -size * 0.01, bottom: size * 0.04 }}>
          <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.supplies} size={size * 0.36} opacity={0.9} tintColor={tintColor} />
        </View>
      ) : null}
      {sceneSource && role === 'SUPPLY' && established ? (
        <View style={{ position: 'absolute', left: -size * 0.07, bottom: size * 0.02 }}>
          <SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.market} size={size * 0.34} opacity={0.78} tintColor={settlementSceneFactionTints[faction]} />
        </View>
      ) : null}
      {worldSource && (role === 'SCOUT' || role === 'COMMAND' || role === 'KINGDOM') ? (
        <>
          <Animated.View style={{ position: 'absolute', right: size * 0.01, top: size * 0.04, transform: [{ rotate: bannerSway }] }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={size * 0.3} opacity={0.88} tintColor={tintColor} />
          </Animated.View>
          {(role === 'KINGDOM' || role === 'COMMAND') && established ? (
            <Animated.View style={{ position: 'absolute', left: size * 0.01, top: size * 0.06, transform: [{ rotate: bannerSway }] }}>
              <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={size * 0.27} opacity={0.82} tintColor={tintColor} />
            </Animated.View>
          ) : null}
        </>
      ) : null}
      {sceneSource && role === 'LOGISTICS' ? (
        <View style={{ position: 'absolute', left: -size * 0.05, bottom: -size * 0.02 }}>
          <SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.wagon} size={size * 0.38} opacity={0.78} tintColor={settlementSceneFactionTints[faction]} />
        </View>
      ) : null}
      {worldSource && role === 'MOUNT' ? (
        <>
          <View style={{ position: 'absolute', left: 0, bottom: size * 0.01 }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.fence_gate} size={size * 0.4} opacity={0.84} tintColor={tintColor} />
          </View>
          {established ? (
            <View style={{ position: 'absolute', right: -size * 0.04, bottom: size * 0.02 }}>
              <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.supplies} size={size * 0.26} opacity={0.74} tintColor={tintColor} />
            </View>
          ) : null}
        </>
      ) : null}
      {natureSource && established && role !== 'SCOUT' ? (
        <View style={{ position: 'absolute', left: size * 0.12, right: size * 0.12, bottom: -size * 0.03, height: size * 0.22, overflow: 'hidden', opacity: veteran ? 0.88 : 0.62 }}>
          <View style={{ position: 'absolute', left: 0, bottom: 0 }}>
            <SettlementDetailAtlasSprite
              assetId="ui.settlement_nature_human_atlas"
              cell={veteran ? settlementNatureHumanCells.stone_wall : settlementNatureHumanCells.fence}
              size={size * 0.54}
              opacity={veteran ? 0.9 : 0.72}
              tintColor={tintColor}
            />
          </View>
        </View>
      ) : null}
      {peopleSource ? (
        <Animated.View style={{ position: 'absolute', left: size * 0.02, bottom: 0, transform: [{ translateY: idleLift }] }}>
          <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells[primary]} size={size * 0.29} opacity={0.94} tintColor={tintColor} />
        </Animated.View>
      ) : null}
      {peopleSource && showSecond ? (
        <Animated.View style={{ position: 'absolute', right: role === 'MOUNT' ? -size * 0.03 : size * 0.07, bottom: role === 'MOUNT' ? -size * 0.02 : size * 0.01, transform: [{ translateY: idleLift }] }}>
          <SettlementDetailAtlasSprite
            assetId="ui.settlement_people_human_atlas"
            cell={settlementPeopleHumanCells[secondary]}
            size={size * (role === 'MOUNT' ? 0.42 : 0.27)}
            opacity={0.9}
            tintColor={tintColor}
          />
        </Animated.View>
      ) : null}
      {peopleSource && bustling ? (
        <Animated.View
          testID="settlement-district-worker"
          style={{
            position: 'absolute',
            left: size * 0.38,
            bottom: -size * 0.015,
            opacity: districtActive ? 0.92 : 0.7,
            transform: [{ translateX: districtDrift }, { translateY: idleLift }]
          }}
        >
          <SettlementDetailAtlasSprite
            assetId="ui.settlement_people_human_atlas"
            cell={settlementPeopleHumanCells[tertiary]}
            size={size * 0.22}
            opacity={0.9}
            tintColor={tintColor}
          />
        </Animated.View>
      ) : null}
      {districtActive ? (
        <Animated.View
          testID="settlement-district-activity-glow"
          style={{
            position: 'absolute',
            left: size * 0.19,
            right: size * 0.19,
            bottom: size * 0.015,
            height: Math.max(2, size * 0.045),
            borderRadius: size,
            backgroundColor: glow,
            opacity: glowPulse,
            transform: [{ scaleX: districtScale }]
          }}
        />
      ) : null}
      {smoky ? (
        <>
          <Animated.View style={{ position: 'absolute', right: size * 0.15, top: size * 0.12, width: size * 0.15, height: size * 0.15, borderRadius: size, backgroundColor: '#D8D1C3', opacity: smokeFade, transform: [{ translateY: smokeLift }] }} />
          <Animated.View style={{ position: 'absolute', right: size * 0.09, top: size * 0.02, width: size * 0.11, height: size * 0.11, borderRadius: size, backgroundColor: '#E8E1D5', opacity: smokeFade, transform: [{ translateY: smokeLift }] }} />
          <Animated.View style={{ position: 'absolute', right: size * 0.2, bottom: size * 0.11, width: size * 0.12, height: size * 0.09, borderRadius: size, backgroundColor: glow, opacity: glowPulse }} />
        </>
      ) : null}
      {faction === 'elf' && role !== 'EQUIPMENT' ? (
        <Animated.View style={{ position: 'absolute', left: size * 0.45, top: size * 0.08, width: size * 0.06, height: size * 0.06, borderRadius: size, backgroundColor: glow, opacity: glowPulse }} />
      ) : null}
      {faction === 'orc' && (role === 'ARMY' || role === 'COMMAND' || role === 'SCOUT') ? (
        <Animated.View style={{ position: 'absolute', left: size * 0.47, top: size * 0.04, width: size * 0.07, height: size * 0.1, backgroundColor: glow, opacity: glowPulse }} />
      ) : null}
    </View>
  );
}

export function SettlementDistrictAmbience({
  category,
  faction = 'human',
  focused = false,
  size = 58
}: {
  category: 'economy' | 'military' | 'command';
  faction?: FactionId;
  focused?: boolean;
  size?: number;
}) {
  const worldSource = getProductionAssetSource('ui.settlement_world_human_atlas');
  const peopleSource = getProductionAssetSource('ui.settlement_people_human_atlas');
  const sceneSource = getProductionAssetSource(settlementSceneFactionAssetIds[faction]);
  const tintColor = settlementAmbientPeopleTint[faction];
  const sceneTint = settlementSceneFactionTints[faction];
  const motion = useSettlementAmbientMotion(category === 'economy' ? 2700 : category === 'military' ? 2400 : 3000);
  const drift = motion.interpolate({ inputRange: [0, 1], outputRange: [-1.5, 1.5] });
  const lift = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -1.3] });
  const sway = motion.interpolate({ inputRange: [0, 1], outputRange: ['-1deg', '1deg'] });
  const pulse = motion.interpolate({ inputRange: [0, 1], outputRange: [0.62, focused ? 0.96 : 0.82] });
  const person = category === 'economy'
    ? settlementPeopleHumanCells.merchant
    : category === 'military'
      ? settlementPeopleHumanCells.guard
      : settlementPeopleHumanCells.knight;
  return (
    <View testID={'settlement-district-environment-art-' + category} style={{ width: size, height: size, position: 'relative', opacity: focused ? 1 : 0.86 }}>
      <Animated.View style={{ position: 'absolute', left: size * 0.1, right: size * 0.1, bottom: size * 0.06, height: Math.max(2, size * 0.045), borderRadius: size, backgroundColor: settlementAmbientGlow[faction], opacity: pulse }} />
      {category === 'economy' ? (
        <>
          {sceneSource ? <View style={{ position: 'absolute', left: size * 0.16, bottom: size * 0.04 }}><SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.market} size={size * 0.58} opacity={focused ? 0.86 : 0.68} tintColor={sceneTint} /></View> : null}
          {worldSource ? <View style={{ position: 'absolute', right: 0, bottom: 0 }}><SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.supplies} size={size * 0.36} opacity={0.84} tintColor={tintColor} /></View> : null}
        </>
      ) : category === 'military' ? (
        <>
          {worldSource ? (
            <>
              <View style={{ position: 'absolute', right: size * 0.03, bottom: 0 }}><SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={size * 0.43} opacity={0.86} tintColor={tintColor} /></View>
              <Animated.View style={{ position: 'absolute', left: size * 0.02, top: size * 0.02, transform: [{ rotate: sway }] }}><SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={size * 0.33} opacity={0.82} tintColor={tintColor} /></Animated.View>
            </>
          ) : null}
        </>
      ) : (
        <>
          {sceneSource ? <View style={{ position: 'absolute', left: size * 0.2, bottom: size * 0.02 }}><SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.fountain} size={size * 0.54} opacity={focused ? 0.82 : 0.64} tintColor={sceneTint} /></View> : null}
          {worldSource ? <Animated.View style={{ position: 'absolute', right: 0, top: size * 0.02, transform: [{ rotate: sway }] }}><SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={size * 0.31} opacity={0.8} tintColor={tintColor} /></Animated.View> : null}
        </>
      )}
      {peopleSource ? (
        <Animated.View style={{ position: 'absolute', left: category === 'economy' ? size * 0.02 : size * 0.36, bottom: -size * 0.01, transform: [{ translateX: drift }, { translateY: lift }] }}>
          <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={person} size={size * 0.27} opacity={0.92} tintColor={tintColor} />
        </Animated.View>
      ) : null}
    </View>
  );
}


export function ForgeWorkshopScene({
  faction = 'human',
  buildingId,
  level = 1,
  equipmentId
}: {
  faction?: FactionId;
  buildingId: string;
  level?: number;
  equipmentId?: string | null;
}) {
  const motion = useSettlementAmbientMotion(2300);
  const emberPulse = motion.interpolate({ inputRange: [0, 1], outputRange: [0.42, 0.92] });
  const smokeLift = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const smokeFade = motion.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.08] });
  const tint = settlementAmbientPeopleTint[faction];
  const accent = settlementAmbientGlow[faction];
  const wall = faction === 'elf' ? '#23483A' : faction === 'orc' ? '#422D25' : '#303B35';
  const ground = faction === 'elf' ? '#385947' : faction === 'orc' ? '#5A3D2E' : '#5A5545';

  return (
    <View
      testID={'forge-workshop-scene-' + faction}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: '100%', height: 176, position: 'relative', overflow: 'hidden', borderRadius: 18, backgroundColor: wall }}
    >
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 58, backgroundColor: ground }} />
      <View style={{ position: 'absolute', left: '4%', right: '4%', bottom: 50, height: 2, backgroundColor: '#A58D68', opacity: 0.34 }} />
      <View style={{ position: 'absolute', left: '4%', top: 12, width: 92, height: 120 }}>
        <SettlementBuildingAmbience buildingId={buildingId} role="EQUIPMENT" faction={faction} level={level} size={112} />
      </View>
      <View style={{ position: 'absolute', left: '5%', top: 22 }}>
        <BuildingSprite buildingId={buildingId} faction={faction} size={110} />
      </View>

      <View style={{ position: 'absolute', left: '36%', right: '7%', top: 24, bottom: 20, borderRadius: 16, borderWidth: 1, borderColor: accent, backgroundColor: '#171B1C', opacity: 0.84 }} />
      <View style={{ position: 'absolute', left: '43%', right: '14%', bottom: 31, height: 28, borderRadius: 999, backgroundColor: '#66533C', opacity: 0.9 }} />
      <View style={{ position: 'absolute', left: '47%', right: '18%', bottom: 42, height: 10, borderRadius: 999, backgroundColor: '#A1865E', opacity: 0.72 }} />

      <Animated.View style={{ position: 'absolute', right: '17%', bottom: 30, width: 38, height: 15, borderRadius: 999, backgroundColor: '#F18A45', opacity: emberPulse }} />
      <Animated.View style={{ position: 'absolute', right: '20%', bottom: 46, width: 18, height: 18, borderRadius: 999, backgroundColor: '#E8DDD0', opacity: smokeFade, transform: [{ translateY: smokeLift }] }} />
      <Animated.View style={{ position: 'absolute', right: '15%', bottom: 53, width: 13, height: 13, borderRadius: 999, backgroundColor: '#D8CFC1', opacity: smokeFade, transform: [{ translateY: smokeLift }] }} />

      <View style={{ position: 'absolute', left: '41%', bottom: 22 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.smith} size={54} opacity={0.96} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', right: '5%', top: 15 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.supplies} size={58} opacity={0.88} tintColor={tint} />
      </View>

      {equipmentId ? (
        <View style={{ position: 'absolute', left: '59%', top: 43, width: 84, height: 84, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={{ position: 'absolute', width: 76, height: 30, borderRadius: 999, backgroundColor: accent, opacity: emberPulse, transform: [{ scaleX: 1.12 }] }} />
          <View style={{ width: 76, height: 76, borderRadius: 18, borderWidth: 1, borderColor: accent, backgroundColor: '#202527', alignItems: 'center', justifyContent: 'center' }}>
            <EquipmentSprite equipmentId={equipmentId} faction={faction} size={64} />
          </View>
        </View>
      ) : (
        <View style={{ position: 'absolute', left: '62%', top: 56, width: 62, height: 62, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: accent, opacity: 0.5 }} />
      )}
    </View>
  );
}

export function EquipmentLoadoutScene({
  className,
  faction = 'human',
  equipmentIds,
  accent
}: {
  className: string;
  faction?: FactionId;
  equipmentIds: Array<string | null | undefined>;
  accent?: string;
}) {
  const glow = accent ?? settlementAmbientGlow[faction];
  const motion = useSettlementAmbientMotion(2800);
  const pulse = motion.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.42] });
  const positions = [
    { left: '5%' as const, top: 22 },
    { left: '5%' as const, top: 92 },
    { right: '5%' as const, top: 22 },
    { right: '5%' as const, top: 92 },
    { left: '40%' as const, top: 8 }
  ];

  return (
    <View
      testID={'equipment-loadout-scene-' + faction}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: '100%', height: 180, position: 'relative', overflow: 'hidden', borderRadius: 16, backgroundColor: faction === 'elf' ? '#203D34' : faction === 'orc' ? '#3B2A24' : '#293733' }}
    >
      <View style={{ position: 'absolute', left: '12%', right: '12%', bottom: 12, height: 38, borderRadius: 999, backgroundColor: faction === 'elf' ? '#496B58' : faction === 'orc' ? '#664735' : '#55624E', opacity: 0.76 }} />
      <Animated.View style={{ position: 'absolute', left: '31%', right: '31%', bottom: 22, height: 28, borderRadius: 999, backgroundColor: glow, opacity: pulse }} />
      <View style={{ position: 'absolute', left: '50%', marginLeft: -54, bottom: 20, width: 108, height: 132, alignItems: 'center', justifyContent: 'flex-end' }}>
        <UnitSprite className={className} faction={faction} size={104} />
      </View>

      {positions.map((position, index) => {
        const equipmentId = equipmentIds[index];
        return (
          <View
            key={'loadout-slot-' + index}
            style={[
              { position: 'absolute', width: 54, height: 54, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#171C1D' },
              position,
              { borderColor: equipmentId ? glow : '#697170', opacity: equipmentId ? 1 : 0.56 }
            ]}
          >
            {equipmentId ? <EquipmentSprite equipmentId={equipmentId} faction={faction} size={44} /> : null}
          </View>
        );
      })}

      <View style={{ position: 'absolute', left: 18, right: 18, top: 18, height: 1, backgroundColor: glow, opacity: 0.28 }} />
      <View style={{ position: 'absolute', left: 18, right: 18, bottom: 18, height: 1, backgroundColor: glow, opacity: 0.22 }} />
    </View>
  );
}

export function PromotionPathScene({
  fromClass,
  toClass,
  faction = 'human',
  equipmentId
}: {
  fromClass: string;
  toClass?: string | null;
  faction?: FactionId;
  equipmentId?: string | null;
}) {
  const motion = useSettlementAmbientMotion(2500);
  const accent = settlementAmbientGlow[faction];
  const pulse = motion.interpolate({ inputRange: [0, 1], outputRange: [0.24, 0.56] });
  const lift = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  return (
    <View
      testID={'promotion-path-scene-' + faction}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: '100%', height: 166, position: 'relative', overflow: 'hidden', borderRadius: 18, backgroundColor: faction === 'elf' ? '#203F36' : faction === 'orc' ? '#3B2922' : '#293833' }}
    >
      <View style={{ position: 'absolute', left: '8%', right: '8%', bottom: 18, height: 32, borderRadius: 999, backgroundColor: faction === 'elf' ? '#486D58' : faction === 'orc' ? '#654735' : '#58634E', opacity: 0.78 }} />
      <View style={{ position: 'absolute', left: '29%', right: '29%', top: 80, height: 4, borderRadius: 999, backgroundColor: accent, opacity: 0.5 }} />
      <View style={{ position: 'absolute', left: '48%', top: 72, width: 14, height: 14, borderTopWidth: 3, borderRightWidth: 3, borderColor: accent, transform: [{ rotate: '45deg' }] }} />

      <Animated.View style={{ position: 'absolute', left: '8%', top: 35, width: 84, height: 70, borderRadius: 999, backgroundColor: accent, opacity: pulse }} />
      <View style={{ position: 'absolute', left: '8%', bottom: 26, width: 84, height: 112, alignItems: 'center', justifyContent: 'flex-end' }}>
        <UnitSprite className={fromClass} faction={faction} size={78} />
      </View>

      {equipmentId ? (
        <Animated.View style={{ position: 'absolute', left: '50%', marginLeft: -27, top: 54, width: 54, height: 54, borderRadius: 14, borderWidth: 1, borderColor: accent, backgroundColor: '#171D1D', alignItems: 'center', justifyContent: 'center', transform: [{ translateY: lift }] }}>
          <EquipmentSprite equipmentId={equipmentId} faction={faction} size={44} />
        </Animated.View>
      ) : (
        <Animated.View style={{ position: 'absolute', left: '50%', marginLeft: -20, top: 61, width: 40, height: 40, borderRadius: 999, borderWidth: 2, borderColor: accent, opacity: pulse }} />
      )}

      {toClass ? (
        <>
          <Animated.View style={{ position: 'absolute', right: '7%', top: 26, width: 102, height: 88, borderRadius: 999, backgroundColor: accent, opacity: pulse }} />
          <View style={{ position: 'absolute', right: '7%', bottom: 20, width: 102, height: 128, alignItems: 'center', justifyContent: 'flex-end' }}>
            <UnitSprite className={toClass} faction={faction} size={92} />
          </View>
        </>
      ) : (
        <>
          {[0, 1, 2].map(index => (
            <Animated.View
              key={'promotion-node-' + index}
              style={{
                position: 'absolute',
                right: 18 + index * 28,
                top: 52 + Math.abs(1 - index) * 15,
                width: 30,
                height: 30,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: accent,
                opacity: pulse
              }}
            />
          ))}
        </>
      )}
    </View>
  );
}


export function SiegeAssaultScene({
  faction = 'human',
  stageIndex = -1,
  completed = false,
  failed = false
}: {
  faction?: FactionId;
  stageIndex?: number;
  completed?: boolean;
  failed?: boolean;
}) {
  const motion = useSettlementAmbientMotion(2400);
  const pulse = motion.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.66] });
  const smokeLift = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -9] });
  const smokeFade = motion.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.08] });
  const accent = settlementAmbientGlow[faction];
  const tint = settlementAmbientPeopleTint[faction];
  const sceneTint = settlementSceneFactionTints[faction];
  const ground = faction === 'elf' ? '#355B47' : faction === 'orc' ? '#654432' : '#5B604C';
  const sky = faction === 'elf' ? '#223C38' : faction === 'orc' ? '#3D2C29' : '#2E3C3A';
  const activeStage = completed ? 3 : Math.max(0, Math.min(3, stageIndex));
  const attackerPositions: Array<`${number}%`> = ['9%', '31%', '52%', '70%'];
  const stagePositions: Array<`${number}%`> = ['13%', '35%', '57%', '78%'];

  return (
    <View
      testID={'siege-assault-scene-' + faction}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: '100%', height: 194, position: 'relative', overflow: 'hidden', borderRadius: 18, backgroundColor: sky, opacity: failed ? 0.72 : 1 }}
    >
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 88, backgroundColor: ground }} />
      <View style={{ position: 'absolute', left: '4%', right: '17%', bottom: 38, height: 24, borderRadius: 999, backgroundColor: '#8E7454', opacity: 0.72 }} />
      <View style={{ position: 'absolute', left: '6%', right: '19%', bottom: 45, height: 9, borderRadius: 999, backgroundColor: '#B39A6A', opacity: 0.54 }} />

      <View style={{ position: 'absolute', right: '-1%', top: 32 }}>
        <SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.gate} size={122} opacity={0.98} tintColor={sceneTint} />
      </View>
      <View style={{ position: 'absolute', right: '18%', top: 52 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.stone_wall} size={104} opacity={0.92} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', right: '-8%', top: 58 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.stone_wall} size={108} opacity={0.92} tintColor={tint} />
      </View>

      <Animated.View style={{ position: 'absolute', right: '18%', top: 19, transform: [{ rotate: motion.interpolate({ inputRange: [0, 1], outputRange: ['-1.2deg', '1.2deg'] }) }] }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={46} opacity={0.94} tintColor={tint} />
      </Animated.View>

      {stagePositions.map((left, index) => {
        const reached = completed || index < activeStage || (stageIndex >= 0 && index === activeStage);
        const current = !completed && !failed && stageIndex >= 0 && index === activeStage;
        return (
          <React.Fragment key={'siege-stage-node-' + index}>
            {index < stagePositions.length - 1 ? (
              <View style={{ position: 'absolute', left, bottom: 49, width: '22%', height: 3, borderRadius: 999, backgroundColor: reached ? accent : '#6F756F', opacity: reached ? 0.52 : 0.28 }} />
            ) : null}
            <Animated.View
              style={{
                position: 'absolute',
                left,
                bottom: 38,
                width: current ? 28 : 22,
                height: current ? 28 : 22,
                marginLeft: current ? -3 : 0,
                marginBottom: current ? -3 : 0,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: reached ? accent : '#7A7E79',
                backgroundColor: reached ? accent : '#252A29',
                opacity: current ? pulse : reached ? 0.76 : 0.48
              }}
            />
          </React.Fragment>
        );
      })}

      <Animated.View style={{ position: 'absolute', left: attackerPositions[activeStage], bottom: 50, transform: [{ translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }] }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.knight} size={58} opacity={failed ? 0.5 : 0.98} tintColor={tint} />
      </Animated.View>
      <View style={{ position: 'absolute', left: '4%', bottom: 45 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.guard} size={44} opacity={0.8} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', left: '18%', bottom: 43 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.supplies} size={42} opacity={0.82} tintColor={tint} />
      </View>

      <Animated.View style={{ position: 'absolute', right: '8%', top: 27, width: 22, height: 22, borderRadius: 999, backgroundColor: failed ? '#A83F35' : '#D5D0C4', opacity: smokeFade, transform: [{ translateY: smokeLift }] }} />
      <Animated.View style={{ position: 'absolute', right: '3%', top: 16, width: 15, height: 15, borderRadius: 999, backgroundColor: failed ? '#C34A3B' : '#E2DDD4', opacity: smokeFade, transform: [{ translateY: smokeLift }] }} />
      {completed ? <Animated.View style={{ position: 'absolute', right: '9%', top: 59, width: 62, height: 26, borderRadius: 999, backgroundColor: accent, opacity: pulse }} /> : null}
    </View>
  );
}

export function WarTableBoardScene({
  faction = 'human',
  completed = 0,
  total = 3,
  boardCycle = 0,
  tierUpgradePending = false
}: {
  faction?: FactionId;
  completed?: number;
  total?: number;
  boardCycle?: number;
  tierUpgradePending?: boolean;
}) {
  const motion = useSettlementAmbientMotion(3000);
  const pulse = motion.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.58] });
  const accent = settlementAmbientGlow[faction];
  const tint = settlementAmbientPeopleTint[faction];
  const pinPositions = [
    { left: '15%' as const, top: 62 },
    { left: '34%' as const, top: 34 },
    { left: '52%' as const, top: 74 },
    { left: '69%' as const, top: 42 },
    { left: '27%' as const, top: 108 },
    { left: '63%' as const, top: 112 }
  ];
  const visiblePins = Math.max(1, Math.min(pinPositions.length, total));
  const focusPin = boardCycle % visiblePins;

  return (
    <View
      testID={'war-table-board-scene-' + faction}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: '100%', height: 184, position: 'relative', overflow: 'hidden', borderRadius: 18, backgroundColor: '#4A3326' }}
    >
      <View style={{ position: 'absolute', left: 12, right: 12, top: 12, bottom: 12, borderRadius: 16, borderWidth: 2, borderColor: '#8D6E4B', backgroundColor: '#B59A6C' }} />
      <View style={{ position: 'absolute', left: 24, right: 24, top: 24, bottom: 24, borderRadius: 12, backgroundColor: '#C8B17F', opacity: 0.9 }} />

      <View style={{ position: 'absolute', left: '16%', top: 78, width: '24%', height: 3, borderRadius: 999, backgroundColor: '#7C6545', transform: [{ rotate: '-20deg' }] }} />
      <View style={{ position: 'absolute', left: '36%', top: 70, width: '25%', height: 3, borderRadius: 999, backgroundColor: '#7C6545', transform: [{ rotate: '24deg' }] }} />
      <View style={{ position: 'absolute', left: '55%', top: 78, width: '20%', height: 3, borderRadius: 999, backgroundColor: '#7C6545', transform: [{ rotate: '-23deg' }] }} />
      <View style={{ position: 'absolute', left: '29%', top: 105, width: '35%', height: 3, borderRadius: 999, backgroundColor: '#7C6545', transform: [{ rotate: '7deg' }] }} />

      {pinPositions.slice(0, visiblePins).map((position, index) => {
        const cleared = index < completed;
        const focused = index === focusPin && !cleared;
        return (
          <Animated.View
            key={'war-table-pin-' + index}
            style={[
              {
                position: 'absolute',
                width: focused ? 30 : 24,
                height: focused ? 30 : 24,
                marginLeft: focused ? -3 : 0,
                marginTop: focused ? -3 : 0,
                borderRadius: 999,
                borderWidth: 3,
                borderColor: cleared ? '#D6E8C0' : accent,
                backgroundColor: cleared ? '#4D7A4E' : '#6B3E32',
                opacity: focused ? pulse : 0.94
              },
              position
            ]}
          />
        );
      })}

      <View style={{ position: 'absolute', left: 15, top: 9 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.supplies} size={54} opacity={0.9} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', right: 12, top: 8 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={52} opacity={0.9} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', right: 19, bottom: 8 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={48} opacity={0.84} tintColor={tint} />
      </View>

      {tierUpgradePending ? (
        <Animated.View style={{ position: 'absolute', left: '46%', top: 17, width: 32, height: 32, borderRadius: 999, borderWidth: 2, borderColor: accent, backgroundColor: accent, opacity: pulse }} />
      ) : null}
    </View>
  );
}


export function KingdomDefenseScene({
  faction = 'human',
  waveIndex = 0,
  waveCount = 3,
  started = false,
  completed = false,
  failed = false,
  readiness = 100
}: {
  faction?: FactionId;
  waveIndex?: number;
  waveCount?: number;
  started?: boolean;
  completed?: boolean;
  failed?: boolean;
  readiness?: number;
}) {
  const motion = useSettlementAmbientMotion(2500);
  const accent = settlementAmbientGlow[faction];
  const tint = settlementAmbientPeopleTint[faction];
  const sceneTint = settlementSceneFactionTints[faction];
  const pulse = motion.interpolate({ inputRange: [0, 1], outputRange: [0.26, 0.62] });
  const sway = motion.interpolate({ inputRange: [0, 1], outputRange: ['-1deg', '1deg'] });
  const smokeLift = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const activeWave = Math.max(0, Math.min(Math.max(0, waveCount - 1), waveIndex));
  const pressure = Math.max(0.28, Math.min(1, readiness / 100));
  const field = faction === 'elf' ? '#355A47' : faction === 'orc' ? '#614332' : '#53604A';
  const wallTint = faction === 'elf' ? '#83B89A' : faction === 'orc' ? '#A8644D' : undefined;

  return (
    <View
      testID={'kingdom-defense-scene-' + faction}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: '100%', height: 194, position: 'relative', overflow: 'hidden', borderRadius: 18, backgroundColor: faction === 'elf' ? '#213B34' : faction === 'orc' ? '#392925' : '#2B3935', opacity: failed ? 0.72 : 1 }}
    >
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, backgroundColor: field }} />
      <View style={{ position: 'absolute', left: '27%', top: 31 }}>
        <SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.gate} size={126} opacity={0.98} tintColor={sceneTint} />
      </View>
      <View style={{ position: 'absolute', left: '5%', top: 62 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.stone_wall} size={105} opacity={0.93} tintColor={wallTint} />
      </View>
      <View style={{ position: 'absolute', right: '6%', top: 62 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.stone_wall} size={105} opacity={0.93} tintColor={wallTint} />
      </View>

      <Animated.View style={{ position: 'absolute', left: '23%', top: 24, transform: [{ rotate: sway }] }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={42} opacity={0.92} tintColor={tint} />
      </Animated.View>
      <Animated.View style={{ position: 'absolute', right: '23%', top: 24, transform: [{ rotate: sway }] }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={42} opacity={0.92} tintColor={tint} />
      </Animated.View>

      <Animated.View style={{ position: 'absolute', left: '31%', right: '31%', bottom: 32, height: 25, borderRadius: 999, backgroundColor: failed ? '#A5473E' : accent, opacity: completed ? pulse : pressure * 0.46 }} />
      <View style={{ position: 'absolute', left: '29%', bottom: 34 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.guard} size={58} opacity={failed ? 0.58 : 0.98} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', left: '44%', bottom: 30 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.knight} size={64} opacity={failed ? 0.56 : 0.98} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', left: '57%', bottom: 34 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.guard} size={58} opacity={failed ? 0.58 : 0.98} tintColor={tint} />
      </View>

      {Array.from({ length: Math.max(1, Math.min(5, waveCount)) }).map((_, index) => {
        const cleared = completed || (started && index < activeWave);
        const current = started && !completed && !failed && index === activeWave;
        const right = 10 + index * 11;
        const rightPosition = `${right}%` as `${number}%`;
        const threatRightPosition = `${right - 1}%` as `${number}%`;
        return (
          <React.Fragment key={'defense-wave-' + index}>
            <Animated.View
              style={{
                position: 'absolute',
                right: rightPosition,
                top: 19 + (index % 2) * 14,
                width: current ? 28 : 22,
                height: current ? 28 : 22,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: cleared ? '#BCDCA9' : current ? '#D56B55' : '#7B6761',
                backgroundColor: cleared ? '#4D774A' : '#643D36',
                opacity: current ? pulse : cleared ? 0.82 : 0.58
              }}
            />
            {!cleared && index <= activeWave + 1 ? (
              <View style={{ position: 'absolute', right: threatRightPosition, top: 43 + (index % 2) * 10 }}>
                <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={30} opacity={0.58} tintColor="#A55345" />
              </View>
            ) : null}
          </React.Fragment>
        );
      })}

      <View style={{ position: 'absolute', left: '8%', bottom: 29 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.supplies} size={48} opacity={0.86} tintColor={tint} />
      </View>
      {failed ? (
        <Animated.View style={{ position: 'absolute', left: '46%', top: 47, width: 26, height: 26, borderRadius: 999, backgroundColor: '#B04A3E', opacity: pulse, transform: [{ translateY: smokeLift }] }} />
      ) : null}
    </View>
  );
}

export function FormationTrialScene({
  faction = 'human',
  passedCount = 0,
  total = 3,
  allComplete = false
}: {
  faction?: FactionId;
  passedCount?: number;
  total?: number;
  allComplete?: boolean;
}) {
  const motion = useSettlementAmbientMotion(3000);
  const accent = settlementAmbientGlow[faction];
  const tint = settlementAmbientPeopleTint[faction];
  const pulse = motion.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.52] });
  const objectives = Math.max(1, Math.min(5, total));
  const yard = faction === 'elf' ? '#42684F' : faction === 'orc' ? '#6A4A38' : '#647057';

  return (
    <View
      testID={'formation-trial-scene-' + faction}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: '100%', height: 174, position: 'relative', overflow: 'hidden', borderRadius: 18, backgroundColor: faction === 'elf' ? '#263F35' : faction === 'orc' ? '#3E2C25' : '#303C36' }}
    >
      <View style={{ position: 'absolute', left: 15, right: 15, top: 20, bottom: 17, borderRadius: 18, borderWidth: 2, borderColor: '#817458', backgroundColor: yard }} />
      <View style={{ position: 'absolute', left: '18%', right: '18%', top: 40, height: 2, backgroundColor: '#B7A77B', opacity: 0.45 }} />
      <View style={{ position: 'absolute', left: '18%', right: '18%', top: 85, height: 2, backgroundColor: '#B7A77B', opacity: 0.38 }} />
      <View style={{ position: 'absolute', left: '18%', right: '18%', top: 130, height: 2, backgroundColor: '#B7A77B', opacity: 0.32 }} />

      <View style={{ position: 'absolute', left: '12%', top: 27 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.guard} size={50} opacity={0.95} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', left: '12%', top: 71 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.knight} size={54} opacity={0.95} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', left: '12%', top: 116 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.porter} size={47} opacity={0.92} tintColor={tint} />
      </View>

      <View style={{ position: 'absolute', right: '11%', top: 30 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={42} opacity={0.9} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', right: '11%', top: 74 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={42} opacity={0.9} tintColor={tint} />
      </View>
      <View style={{ position: 'absolute', right: '11%', top: 118 }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={42} opacity={0.9} tintColor={tint} />
      </View>

      <View style={{ position: 'absolute', left: '34%', right: '34%', top: 34, bottom: 29 }}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: '48%', height: 4, borderRadius: 999, backgroundColor: accent, opacity: 0.35 }} />
        <Animated.View style={{ position: 'absolute', left: '50%', marginLeft: -24, top: '50%', marginTop: -24, width: 48, height: 48, borderRadius: 999, borderWidth: 2, borderColor: accent, backgroundColor: accent, opacity: allComplete ? pulse : 0.24 }} />
        <View style={{ position: 'absolute', left: '50%', marginLeft: -22, top: '50%', marginTop: -22 }}>
          <FactionCrest faction={faction} size={44} />
        </View>
      </View>

      {Array.from({ length: objectives }).map((_, index) => {
        const met = allComplete || index < passedCount;
        const objectiveLeft = `${26 + index * (48 / Math.max(1, objectives - 1))}%` as `${number}%`;
        return (
          <Animated.View
            key={'trial-objective-' + index}
            style={{
              position: 'absolute',
              left: objectiveLeft,
              bottom: 10,
              width: met ? 18 : 14,
              height: met ? 18 : 14,
              borderRadius: 999,
              borderWidth: 2,
              borderColor: met ? '#D8E7C2' : accent,
              backgroundColor: met ? '#4D7A4E' : '#2C3431',
              opacity: met ? 0.92 : pulse
            }}
          />
        );
      })}
    </View>
  );
}

const settlementGrowthTint: Record<FactionId, string | undefined> = {
  human: undefined,
  elf: '#83B89A',
  orc: '#9E5944'
};

function SettlementGrowthLayer({
  faction,
  rank
}: {
  faction: FactionId;
  rank: number;
}) {
  const worldSource = getProductionAssetSource('ui.settlement_world_human_atlas');
  const peopleSource = getProductionAssetSource('ui.settlement_people_human_atlas');
  const natureSource = getProductionAssetSource('ui.settlement_nature_human_atlas');
  const sceneSource = getProductionAssetSource(settlementSceneFactionAssetIds[faction]);
  const tintColor = settlementGrowthTint[faction];
  const sceneTint = settlementSceneFactionTints[faction];

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      {worldSource ? (
        <View key="settlement-central-plaza" style={{ position: 'absolute', left: '32%', top: '31%' }}>
          <SettlementDetailAtlasSprite
            assetId="ui.settlement_world_human_atlas"
            cell={settlementWorldHumanCells.road_cross}
            size={rank >= 4 ? 138 : rank >= 2 ? 128 : 118}
            opacity={rank >= 4 ? 0.62 : rank >= 2 ? 0.52 : 0.42}
            tintColor={tintColor}
          />
        </View>
      ) : null}
      {worldSource && rank >= 1 ? (
        <>
          <View style={{ position: 'absolute', left: '5%', bottom: '21%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.fence_gate} size={54} opacity={0.68} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '5%', bottom: '22%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.supplies} size={44} opacity={0.72} tintColor={tintColor} />
          </View>
        </>
      ) : null}

      {worldSource && rank >= 2 ? (
        <>
          <View style={{ position: 'absolute', left: '6%', top: '30%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.road_straight} size={70} opacity={0.46} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '6%', top: '34%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.road_straight} size={70} opacity={0.46} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', left: '44%', top: '7%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={40} opacity={0.78} tintColor={tintColor} />
          </View>
        </>
      ) : null}

      {natureSource && rank >= 2 ? (
        <>
          <View style={{ position: 'absolute', left: '3%', top: '17%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.fence} size={56} opacity={0.66} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '3%', top: '18%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.fence} size={56} opacity={0.66} tintColor={tintColor} />
          </View>
        </>
      ) : null}

      {peopleSource && rank >= 2 ? (
        <>
          <View style={{ position: 'absolute', left: '18%', top: '29%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.guard} size={30} opacity={0.84} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '18%', top: '31%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.worker} size={29} opacity={0.82} tintColor={tintColor} />
          </View>
        </>
      ) : null}

      {sceneSource && rank >= 3 ? (
        <>
          <View style={{ position: 'absolute', right: '3%', top: '61%' }}>
            <SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.market} size={70} opacity={0.82} tintColor={sceneTint} />
          </View>
          <View style={{ position: 'absolute', left: '4%', top: '61%' }}>
            <SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.wagon} size={62} opacity={0.8} tintColor={sceneTint} />
          </View>
        </>
      ) : null}

      {natureSource && rank >= 3 ? (
        <>
          <View style={{ position: 'absolute', left: '2%', top: '3%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.tree_dark} size={62} opacity={0.76} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '1%', top: '5%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.conifer} size={60} opacity={0.76} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', left: '10%', bottom: '16%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.bush_blue} size={42} opacity={0.78} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '10%', bottom: '17%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.bush_flowers} size={42} opacity={0.78} tintColor={tintColor} />
          </View>
        </>
      ) : null}

      {natureSource && rank >= 4 ? (
        <>
          <View style={{ position: 'absolute', left: '1%', top: '1%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.stone_wall} size={72} opacity={0.8} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '1%', top: '1%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.stone_wall} size={72} opacity={0.8} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', left: '17%', top: '8%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={42} opacity={0.9} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '17%', top: '8%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={42} opacity={0.9} tintColor={tintColor} />
          </View>
        </>
      ) : null}

      {sceneSource && rank >= 4 ? (
        <View style={{ position: 'absolute', left: '42%', top: '0%' }}>
          <SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.gate} size={66} opacity={0.9} tintColor={sceneTint} />
        </View>
      ) : null}

      {peopleSource && rank >= 4 ? (
        <>
          <View style={{ position: 'absolute', left: '31%', top: '22%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.knight} size={31} opacity={0.9} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '31%', top: '22%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.guard} size={31} opacity={0.9} tintColor={tintColor} />
          </View>
        </>
      ) : null}

      {sceneSource && rank >= 5 ? (
        <>
          <View style={{ position: 'absolute', left: '42%', top: '52%' }}>
            <SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.fountain} size={58} opacity={0.92} tintColor={sceneTint} />
          </View>
          <View style={{ position: 'absolute', left: '12%', bottom: '3%' }}>
            <SettlementDetailAtlasSprite assetId={settlementSceneFactionAssetIds[faction]} cell={settlementSceneHumanV2Cells.dock} size={82} opacity={0.86} tintColor={sceneTint} />
          </View>
        </>
      ) : null}

      {worldSource && rank >= 5 ? (
        <>
          <View style={{ position: 'absolute', left: '7%', top: '48%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={44} opacity={0.92} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '7%', top: '48%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={44} opacity={0.92} tintColor={tintColor} />
          </View>
        </>
      ) : null}

      {peopleSource && rank >= 5 ? (
        <>
          <View style={{ position: 'absolute', left: '10%', top: '50%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.merchant} size={30} opacity={0.9} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', right: '10%', top: '51%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.woman} size={30} opacity={0.9} tintColor={tintColor} />
          </View>
          <View style={{ position: 'absolute', left: '47%', bottom: '17%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_people_human_atlas" cell={settlementPeopleHumanCells.porter} size={29} opacity={0.88} tintColor={tintColor} />
          </View>
        </>
      ) : null}

      {rank >= 6 ? (
        <>
          <View style={{ position: 'absolute', left: '27%', top: '2%', width: '46%', height: 2, backgroundColor: faction === 'elf' ? palette.elfLight : faction === 'orc' ? palette.orcLight : palette.gold, opacity: 0.75 }} />
          <View style={{ position: 'absolute', left: '10%', top: '12%', width: 5, height: 5, borderRadius: 99, backgroundColor: faction === 'elf' ? palette.elfLight : faction === 'orc' ? palette.red : palette.gold, opacity: 0.88 }} />
          <View style={{ position: 'absolute', right: '10%', top: '12%', width: 5, height: 5, borderRadius: 99, backgroundColor: faction === 'elf' ? palette.elfLight : faction === 'orc' ? palette.red : palette.gold, opacity: 0.88 }} />
        </>
      ) : null}
    </View>
  );
}

export function SettlementBuildPlotSprite({
  terrain,
  faction = 'human',
  selected = false,
  moveTarget = false,
  size = 76,
  color = palette.stoneLight
}: {
  terrain: 'grass' | 'high_ground' | 'roadside' | 'square';
  faction?: FactionId;
  selected?: boolean;
  moveTarget?: boolean;
  size?: number;
  color?: string;
}) {
  const assetId = settlementSceneFactionAssetIds[faction];
  const source = getProductionAssetSource(assetId);
  const tintColor = settlementSceneFactionTints[faction];

  if (source) {
    const cell = selected || moveTarget
      ? settlementSceneHumanV2Cells.build_banner
      : settlementSceneHumanV2Cells.build_dirt;
    return (
      <SettlementDetailAtlasSprite
        assetId={assetId}
        cell={cell}
        size={size}
        opacity={selected || moveTarget ? 1 : terrain === 'square' ? 0.96 : 0.9}
        tintColor={tintColor}
      />
    );
  }

  return <PlotTerrainSprite terrain={terrain} color={color} size={Math.max(24, size * 0.38)} />;
}


// Human Fort uses a layered world canvas; gameplay plots remain invisible anchors above it.
function FactionFortWorldBackdrop({ faction }: { faction: FactionId }) {
  const worldMotion = useSettlementAmbientMotion(faction === 'elf' ? 3900 : faction === 'orc' ? 3200 : 3600);
  const waterShift = worldMotion.interpolate({ inputRange: [0, 1], outputRange: [-8, 8] });
  const shimmerOpacity = worldMotion.interpolate({ inputRange: [0, 1], outputRange: [0.14, faction === 'elf' ? 0.42 : 0.34] });
  const bannerSway = worldMotion.interpolate({ inputRange: [0, 1], outputRange: ['-1deg', '1deg'] });
  const firePulse = worldMotion.interpolate({ inputRange: [0, 1], outputRange: [0.46, 0.9] });

  const isElf = faction === 'elf';
  const isOrc = faction === 'orc';
  const sceneAssetId = settlementSceneFactionAssetIds[faction];
  const sceneTint = settlementSceneFactionTints[faction];
  const detailTint = isElf ? '#86C9A6' : isOrc ? '#B76A50' : undefined;
  const ground = isElf ? '#23483A' : isOrc ? '#493329' : '#35523A';
  const upperGround = isElf ? '#2F5947' : isOrc ? '#56392D' : '#446148';
  const terrace = isElf ? '#426D55' : isOrc ? '#6B4938' : '#52684B';
  const cliffLight = isElf ? '#49675D' : isOrc ? '#6B5548' : '#68716A';
  const cliffDark = isElf ? '#2D4A42' : isOrc ? '#46372F' : '#424A45';
  const clearing = isElf ? '#4D765F' : isOrc ? '#76503D' : '#587050';
  const innerClearing = isElf ? '#5D876C' : isOrc ? '#825A43' : '#69805B';
  const roadDark = isElf ? '#514B3E' : isOrc ? '#5B4032' : '#5A5140';
  const roadLight = isElf ? '#8D825F' : isOrc ? '#9A6C4C' : '#A28D67';
  const roadBranch = isElf ? '#6B634C' : isOrc ? '#76513B' : '#6D624E';
  const plaza = isElf ? '#6D7E68' : isOrc ? '#7B6654' : '#8E8166';
  const plazaBorder = isElf ? '#4B6656' : isOrc ? '#594439' : '#615948';
  const plazaInner = isElf ? '#426F5E' : isOrc ? '#5F4738' : '#6B805A';
  const waterfront = isElf ? '#1F6671' : isOrc ? '#324C55' : '#245F78';
  const waterHighlight = isElf ? '#BEEFF0' : isOrc ? '#9FC8D0' : '#B8E9F0';

  type FortWorldPlacement = {
    left: `${number}%`;
    top: `${number}%`;
    cell: { x: number; y: number };
    size: number;
  };
  type FortificationPlacement = FortWorldPlacement & {
    rotate: `${number}deg`;
    opacity: number;
  };

  const trees: readonly FortWorldPlacement[] = isElf
    ? [
        { left: '1%', top: '4%', cell: settlementNatureHumanCells.tree_large, size: 84 },
        { left: '18%', top: '6%', cell: settlementNatureHumanCells.tree_dark, size: 70 },
        { left: '78%', top: '4%', cell: settlementNatureHumanCells.tree_large, size: 82 },
        { left: '2%', top: '28%', cell: settlementNatureHumanCells.tree_dark, size: 78 },
        { left: '83%', top: '29%', cell: settlementNatureHumanCells.conifer, size: 74 },
        { left: '4%', top: '58%', cell: settlementNatureHumanCells.tree_large, size: 78 },
        { left: '81%', top: '58%', cell: settlementNatureHumanCells.tree_dark, size: 78 },
        { left: '10%', top: '76%', cell: settlementNatureHumanCells.conifer, size: 70 },
        { left: '72%', top: '76%', cell: settlementNatureHumanCells.tree_large, size: 76 }
      ]
    : isOrc
      ? [
          { left: '2%', top: '9%', cell: settlementNatureHumanCells.conifer, size: 68 },
          { left: '82%', top: '8%', cell: settlementNatureHumanCells.tree_dark, size: 68 },
          { left: '0%', top: '31%', cell: settlementNatureHumanCells.tree_dark, size: 70 },
          { left: '84%', top: '34%', cell: settlementNatureHumanCells.conifer, size: 66 },
          { left: '5%', top: '65%', cell: settlementNatureHumanCells.conifer, size: 62 },
          { left: '82%', top: '66%', cell: settlementNatureHumanCells.tree_dark, size: 64 }
        ]
      : [
          { left: '3%', top: '7%', cell: settlementNatureHumanCells.tree_dark, size: 74 },
          { left: '80%', top: '8%', cell: settlementNatureHumanCells.conifer, size: 68 },
          { left: '1%', top: '29%', cell: settlementNatureHumanCells.tree_large, size: 72 },
          { left: '82%', top: '31%', cell: settlementNatureHumanCells.tree_dark, size: 72 },
          { left: '4%', top: '61%', cell: settlementNatureHumanCells.conifer, size: 66 },
          { left: '82%', top: '61%', cell: settlementNatureHumanCells.tree_large, size: 72 },
          { left: '8%', top: '78%', cell: settlementNatureHumanCells.tree_dark, size: 64 },
          { left: '76%', top: '79%', cell: settlementNatureHumanCells.conifer, size: 66 }
        ];

  const fortifications: readonly FortificationPlacement[] = isElf
    ? [
        { left: '2%', top: '20%', rotate: '-7deg', cell: settlementNatureHumanCells.hedge, size: 102, opacity: 0.82 },
        { left: '72%', top: '20%', rotate: '7deg', cell: settlementNatureHumanCells.hedge, size: 102, opacity: 0.82 },
        { left: '0%', top: '52%', rotate: '4deg', cell: settlementNatureHumanCells.fence, size: 98, opacity: 0.78 },
        { left: '73%', top: '52%', rotate: '-4deg', cell: settlementNatureHumanCells.fence, size: 98, opacity: 0.78 }
      ]
    : isOrc
      ? [
          { left: '0%', top: '18%', rotate: '-10deg', cell: settlementNatureHumanCells.stone_wall, size: 104, opacity: 0.94 },
          { left: '71%', top: '18%', rotate: '10deg', cell: settlementNatureHumanCells.stone_wall, size: 104, opacity: 0.94 },
          { left: '-2%', top: '48%', rotate: '6deg', cell: settlementNatureHumanCells.stone_wall, size: 106, opacity: 0.94 },
          { left: '72%', top: '49%', rotate: '-6deg', cell: settlementNatureHumanCells.stone_wall, size: 106, opacity: 0.94 },
          { left: '7%', top: '69%', rotate: '-4deg', cell: settlementNatureHumanCells.rocks, size: 78, opacity: 0.9 },
          { left: '75%', top: '70%', rotate: '4deg', cell: settlementNatureHumanCells.rocks, size: 78, opacity: 0.9 }
        ]
      : [
          { left: '2%', top: '19%', rotate: '-8deg', cell: settlementNatureHumanCells.stone_wall, size: 96, opacity: 0.88 },
          { left: '73%', top: '19%', rotate: '8deg', cell: settlementNatureHumanCells.stone_wall, size: 96, opacity: 0.88 },
          { left: '1%', top: '52%', rotate: '5deg', cell: settlementNatureHumanCells.stone_wall, size: 96, opacity: 0.88 },
          { left: '72%', top: '52%', rotate: '-5deg', cell: settlementNatureHumanCells.stone_wall, size: 96, opacity: 0.88 }
        ];

  return (
    <View
      testID={'settlement-fort-world-' + faction}
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden', backgroundColor: ground }}
    >
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '23%', backgroundColor: isElf ? '#19372F' : isOrc ? '#33251F' : '#263D31' }} />
      <View style={{ position: 'absolute', left: '7%', right: '7%', top: '2%', height: '20%', borderBottomLeftRadius: 60, borderBottomRightRadius: 60, backgroundColor: upperGround, opacity: 0.94 }} />
      <View style={{ position: 'absolute', left: '12%', right: '12%', top: '12%', height: '15%', borderBottomLeftRadius: 80, borderBottomRightRadius: 80, backgroundColor: terrace, opacity: 0.9 }} />

      <View style={{ position: 'absolute', left: '-12%', top: '12%', width: '42%', height: '14%', backgroundColor: cliffLight, opacity: 0.76, transform: [{ rotate: '-12deg' }] }} />
      <View style={{ position: 'absolute', right: '-12%', top: '12%', width: '42%', height: '14%', backgroundColor: cliffLight, opacity: 0.76, transform: [{ rotate: '12deg' }] }} />
      <View style={{ position: 'absolute', left: '-8%', top: '19%', width: '34%', height: '9%', backgroundColor: cliffDark, opacity: 0.74, transform: [{ rotate: '-9deg' }] }} />
      <View style={{ position: 'absolute', right: '-8%', top: '19%', width: '34%', height: '9%', backgroundColor: cliffDark, opacity: 0.74, transform: [{ rotate: '9deg' }] }} />

      <View style={{ position: 'absolute', left: '4%', top: '21%', width: '92%', height: '60%', borderRadius: 90, backgroundColor: clearing, opacity: 0.54 }} />
      <View style={{ position: 'absolute', left: '13%', top: '29%', width: '74%', height: '44%', borderRadius: 80, backgroundColor: innerClearing, opacity: 0.34 }} />

      <View style={{ position: 'absolute', left: '42%', top: '22%', width: '16%', height: '50%', borderRadius: 999, backgroundColor: roadDark, opacity: 0.82 }} />
      <View style={{ position: 'absolute', left: '43.5%', top: '22%', width: '13%', height: '50%', borderRadius: 999, backgroundColor: roadLight, opacity: 0.86 }} />
      <View style={{ position: 'absolute', left: '7%', top: '44%', width: '86%', height: '8%', borderRadius: 999, backgroundColor: roadDark, opacity: 0.74 }} />
      <View style={{ position: 'absolute', left: '8%', top: '45%', width: '84%', height: '6%', borderRadius: 999, backgroundColor: roadLight, opacity: 0.82 }} />

      <View style={{ position: 'absolute', left: '17%', top: '31%', width: '41%', height: 28, borderRadius: 999, backgroundColor: roadBranch, opacity: 0.72, transform: [{ rotate: '27deg' }] }} />
      <View style={{ position: 'absolute', right: '16%', top: '32%', width: '39%', height: 28, borderRadius: 999, backgroundColor: roadBranch, opacity: 0.72, transform: [{ rotate: '-27deg' }] }} />
      <View style={{ position: 'absolute', left: '18%', top: '60%', width: '40%', height: 26, borderRadius: 999, backgroundColor: roadBranch, opacity: 0.68, transform: [{ rotate: '-26deg' }] }} />
      <View style={{ position: 'absolute', right: '17%', top: '60%', width: '39%', height: 26, borderRadius: 999, backgroundColor: roadBranch, opacity: 0.68, transform: [{ rotate: '26deg' }] }} />

      <View style={{ position: 'absolute', left: '30%', top: '35%', width: '40%', height: '22%', borderRadius: 64, borderWidth: 2, borderColor: plazaBorder, backgroundColor: plaza, opacity: 0.76, transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', left: '39%', top: '39%', width: '22%', height: '14%', borderRadius: 50, borderWidth: 1, borderColor: isElf ? '#8BD0B8' : isOrc ? '#C7895F' : '#C2AC7C', backgroundColor: plazaInner, opacity: 0.8, transform: [{ rotate: '45deg' }] }} />

      {isOrc ? (
        <>
          <Animated.View style={{ position: 'absolute', left: '46%', top: '42%', width: 28, height: 18, borderRadius: 999, backgroundColor: '#F08A45', opacity: firePulse }} />
          <View style={{ position: 'absolute', left: '42%', top: '39%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={62} opacity={0.92} tintColor={detailTint} />
          </View>
        </>
      ) : (
        <View style={{ position: 'absolute', left: '41%', top: '41%' }}>
          <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.fountain} size={68} opacity={0.9} tintColor={sceneTint} />
        </View>
      )}

      {isElf ? (
        <>
          <View style={{ position: 'absolute', left: '35%', top: '37%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.bush_flowers} size={42} opacity={0.92} tintColor={detailTint} />
          </View>
          <View style={{ position: 'absolute', right: '35%', top: '38%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.bush_blue} size={42} opacity={0.92} tintColor={detailTint} />
          </View>
        </>
      ) : null}

      <View style={{ position: 'absolute', left: '39%', top: '18%' }}>
        <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.gate} size={84} opacity={0.96} tintColor={sceneTint} />
      </View>
      <Animated.View style={{ position: 'absolute', left: '33%', top: '22%', transform: [{ rotate: bannerSway }] }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={42} opacity={0.94} tintColor={detailTint} />
      </Animated.View>
      <Animated.View style={{ position: 'absolute', right: '33%', top: '22%', transform: [{ rotate: bannerSway }] }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.torch_banner} size={42} opacity={0.94} tintColor={detailTint} />
      </Animated.View>

      {fortifications.map((item, index) => (
        <View key={'fortification-' + faction + '-' + index} style={{ position: 'absolute', left: item.left, top: item.top, transform: [{ rotate: item.rotate }] }}>
          <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={item.cell} size={item.size} opacity={item.opacity} tintColor={detailTint} />
        </View>
      ))}

      {trees.map((item, index) => (
        <View key={'fort-tree-' + faction + '-' + index} style={{ position: 'absolute', left: item.left, top: item.top }}>
          <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={item.cell} size={item.size} opacity={0.95} tintColor={detailTint} />
        </View>
      ))}

      {isOrc ? (
        <>
          <View style={{ position: 'absolute', left: '7%', top: '40%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.rocks} size={56} opacity={0.92} tintColor={detailTint} />
          </View>
          <View style={{ position: 'absolute', right: '8%', top: '39%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={48} opacity={0.88} tintColor={detailTint} />
          </View>
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', left: '6%', top: '38%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.bush_flowers} size={52} opacity={0.92} tintColor={detailTint} />
          </View>
          <View style={{ position: 'absolute', right: '7%', top: '39%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.bush_blue} size={50} opacity={0.9} tintColor={detailTint} />
          </View>
        </>
      )}

      <View style={{ position: 'absolute', left: '15%', top: '57%' }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.supplies} size={46} opacity={0.78} tintColor={detailTint} />
      </View>
      <View style={{ position: 'absolute', right: '14%', top: '56%' }}>
        <SettlementDetailAtlasSprite assetId="ui.settlement_world_human_atlas" cell={settlementWorldHumanCells.target_sign} size={42} opacity={0.72} tintColor={detailTint} />
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '15%', backgroundColor: waterfront, opacity: 0.96 }} />
      <Animated.View style={{ position: 'absolute', left: '-5%', bottom: '8%', width: '110%', height: 2, backgroundColor: waterHighlight, opacity: shimmerOpacity, transform: [{ translateX: waterShift }] }} />
      <Animated.View style={{ position: 'absolute', left: '-8%', bottom: '4%', width: '116%', height: 1, backgroundColor: isElf ? '#E6FFFF' : isOrc ? '#C7E0E3' : '#E2F7FA', opacity: shimmerOpacity, transform: [{ translateX: waterShift }] }} />

      <View style={{ position: 'absolute', left: isOrc ? '1%' : '3%', bottom: '-1%' }}>
        <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.dock} size={isOrc ? 98 : 92} opacity={0.96} tintColor={sceneTint} />
      </View>
      {!isOrc ? (
        <View style={{ position: 'absolute', left: '27%', bottom: '-1%' }}>
          <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.sailboat} size={76} opacity={0.95} tintColor={sceneTint} />
        </View>
      ) : (
        <View style={{ position: 'absolute', left: '28%', bottom: '1%' }}>
          <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.wagon} size={72} opacity={0.86} tintColor={sceneTint} />
        </View>
      )}

      {!isOrc ? (
        <>
          <View style={{ position: 'absolute', right: '2%', bottom: '9%' }}>
            <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.waterfall} size={82} opacity={0.96} tintColor={sceneTint} />
          </View>
          <View style={{ position: 'absolute', left: '6%', bottom: '12%' }}>
            <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.waterfall} size={72} opacity={0.9} tintColor={sceneTint} />
          </View>
        </>
      ) : (
        <>
          <View style={{ position: 'absolute', right: '3%', bottom: '10%' }}>
            <SettlementDetailAtlasSprite assetId="ui.settlement_nature_human_atlas" cell={settlementNatureHumanCells.rocks} size={72} opacity={0.94} tintColor={detailTint} />
          </View>
          <Animated.View style={{ position: 'absolute', right: '14%', bottom: '11%', width: 18, height: 10, borderRadius: 999, backgroundColor: '#E9733F', opacity: firePulse }} />
        </>
      )}

      <View style={{ position: 'absolute', left: '12%', bottom: '15%', width: '76%', height: 16, borderRadius: 999, backgroundColor: isElf ? '#5D665A' : isOrc ? '#695245' : '#6A6151', opacity: 0.68 }} />
      <View style={{ position: 'absolute', left: '16%', bottom: '17%', width: '68%', height: 10, borderRadius: 999, backgroundColor: isElf ? '#8C9175' : isOrc ? '#97715A' : '#9A8868', opacity: 0.7 }} />
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
  if (faction === 'human') {
    const backgroundStage =
      stageId === 'camp'
        ? 'camp'
        : stageId === 'settlement'
          ? 'settlement'
          : stageId === 'fort'
            ? 'fort'
            : stageId === 'town'
              ? 'town'
              : 'capital';
    const background = settlementBackgroundProductionAsset('human', backgroundStage);
    const source = getProductionAssetSource(background.id);
    if (source) {
      return (
        <View
          testID={'settlement-stage-background-' + stageId}
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden', backgroundColor: '#35523A' }}
        >
          <Image
            source={source}
            resizeMode="cover"
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', height: '100%' }}
          />
        </View>
      );
    }
  }
  if (['fort', 'town', 'stronghold', 'capital', 'grand'].includes(stageId)) {
    return <FactionFortWorldBackdrop faction={faction} />;
  }
  const rank = stageRanks[stageId] ?? 0;
  const accent = faction === 'elf' ? palette.elfLight : faction === 'orc' ? palette.orcLight : palette.humanLight;
  const sceneAssetId = settlementSceneFactionAssetIds[faction];
  const sceneTint = settlementSceneFactionTints[faction];
  const waterfrontColor = faction === 'elf' ? '#276D70' : faction === 'orc' ? '#344E55' : '#245F78';
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
  const road = faction === 'orc' ? '#76563E' : faction === 'elf' ? '#7B7152' : '#8B7654';
  const roadEdge = faction === 'elf' ? '#4E634A' : faction === 'orc' ? '#51382D' : '#555240';
  const roadHighlight = faction === 'elf' ? '#A8A06E' : faction === 'orc' ? '#9A7250' : '#B19A6E';
  const earthShadow = faction === 'elf' ? '#1D3326' : faction === 'orc' ? '#2E241F' : '#26372B';
  const roadWidth = rank >= 3 ? 34 : rank >= 1 ? 29 : 24;
  const foliage = [
    { left: '2%', top: '7%' }, { left: '88%', top: '8%' },
    { left: '1%', top: '78%' }, { left: '90%', top: '75%' }
  ] as const;
  const stones = [
    { left: '12%', top: '31%' }, { left: '84%', top: '31%' },
    { left: '16%', top: '64%' }, { left: '81%', top: '67%' },
    { left: '43%', top: '13%' }, { left: '53%', top: '82%' }
  ] as const;
  const worldMotion = useSettlementAmbientMotion(3200);
  const waterShift = worldMotion.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] });
  const shimmerOpacity = worldMotion.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.3] });
  const boatBob = worldMotion.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });

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
      <View style={{ position: 'absolute', left: '3%', top: '5%', width: '32%', height: '25%', borderRadius: 42, backgroundColor: clearing, opacity: 0.58 }} />
      <View style={{ position: 'absolute', right: '3%', top: '7%', width: '30%', height: '23%', borderRadius: 40, backgroundColor: clearing, opacity: 0.52 }} />
      <View style={{ position: 'absolute', left: '6%', bottom: '5%', width: '30%', height: '24%', borderRadius: 44, backgroundColor: clearing, opacity: 0.47 }} />
      <View style={{ position: 'absolute', right: '5%', bottom: '5%', width: '31%', height: '25%', borderRadius: 44, backgroundColor: clearing, opacity: 0.5 }} />

      <View style={{ position: 'absolute', left: '-4%', top: '28%', width: '47%', height: roadWidth + 8, borderRadius: 999, backgroundColor: earthShadow, opacity: 0.5, transform: [{ rotate: '28deg' }] }} />
      <View style={{ position: 'absolute', right: '-4%', top: '28%', width: '47%', height: roadWidth + 8, borderRadius: 999, backgroundColor: earthShadow, opacity: 0.5, transform: [{ rotate: '-28deg' }] }} />
      <View style={{ position: 'absolute', left: '-4%', bottom: '28%', width: '48%', height: roadWidth + 8, borderRadius: 999, backgroundColor: earthShadow, opacity: 0.48, transform: [{ rotate: '-25deg' }] }} />
      <View style={{ position: 'absolute', right: '-4%', bottom: '28%', width: '48%', height: roadWidth + 8, borderRadius: 999, backgroundColor: earthShadow, opacity: 0.48, transform: [{ rotate: '25deg' }] }} />

      <View style={{ position: 'absolute', left: '-4%', top: '29%', width: '47%', height: roadWidth, borderRadius: 999, backgroundColor: road, opacity: 0.54, transform: [{ rotate: '28deg' }] }} />
      <View style={{ position: 'absolute', right: '-4%', top: '29%', width: '47%', height: roadWidth, borderRadius: 999, backgroundColor: road, opacity: 0.54, transform: [{ rotate: '-28deg' }] }} />
      <View style={{ position: 'absolute', left: '-4%', bottom: '29%', width: '48%', height: roadWidth, borderRadius: 999, backgroundColor: road, opacity: 0.5, transform: [{ rotate: '-25deg' }] }} />
      <View style={{ position: 'absolute', right: '-4%', bottom: '29%', width: '48%', height: roadWidth, borderRadius: 999, backgroundColor: road, opacity: 0.5, transform: [{ rotate: '25deg' }] }} />

      <View style={{ position: 'absolute', left: '34%', top: '34%', width: '32%', height: '24%', borderRadius: 32, borderWidth: 2, borderColor: roadEdge, backgroundColor: road, opacity: rank >= 2 ? 0.6 : 0.48, transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', left: '40%', top: '39%', width: '20%', height: '14%', borderRadius: 24, borderWidth: 1, borderColor: roadHighlight, backgroundColor: clearing, opacity: rank >= 2 ? 0.54 : 0.42, transform: [{ rotate: '45deg' }] }} />

      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '10%', backgroundColor: earthShadow, opacity: 0.22 }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '8%', backgroundColor: earthShadow, opacity: 0.18 }} />

      <SettlementGrowthLayer faction={faction} rank={rank} />

      {getProductionAssetSource(sceneAssetId) ? (
        <>
          <View
            key={'settlement-v2-waterfront-' + faction}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: rank >= 2 ? '17%' : '13%',
              backgroundColor: waterfrontColor,
              opacity: 0.9
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              left: '-5%',
              bottom: rank >= 2 ? '9%' : '7%',
              width: '110%',
              height: 2,
              backgroundColor: '#B8E9F0',
              opacity: shimmerOpacity,
              transform: [{ translateX: waterShift }]
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              left: '-8%',
              bottom: rank >= 2 ? '5%' : '4%',
              width: '116%',
              height: 1,
              backgroundColor: '#E2F7FA',
              opacity: shimmerOpacity,
              transform: [{ translateX: waterShift }]
            }}
          />
          <View style={{ position: 'absolute', left: '2%', bottom: '-1%' }}>
            <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.dock} tintColor={sceneTint} size={rank >= 4 ? 84 : rank >= 2 ? 78 : 70} opacity={0.98} />
          </View>
          {rank >= 2 ? (
            <>
              <Animated.View style={{ position: 'absolute', left: '25%', bottom: '-1%', transform: [{ translateY: boatBob }] }}>
                <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.sailboat} tintColor={sceneTint} size={72} opacity={0.98} />
              </Animated.View>
              <View style={{ position: 'absolute', right: '1%', bottom: '0%' }}>
                <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.waterfall} tintColor={sceneTint} size={70} opacity={0.95} />
              </View>
            </>
          ) : null}
          {rank >= 1 ? (
            <>
              <View style={{ position: 'absolute', right: '7%', top: '57%' }}>
                <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.market} tintColor={sceneTint} size={rank >= 4 ? 74 : rank >= 2 ? 68 : 60} opacity={0.96} />
              </View>
              <View style={{ position: 'absolute', left: '22%', top: '61%' }}>
                <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.wagon} tintColor={sceneTint} size={58} opacity={0.94} />
              </View>
            </>
          ) : null}
          {rank >= 2 ? (
            <View style={{ position: 'absolute', left: '43%', top: '51%' }}>
              <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.fountain} tintColor={sceneTint} size={48} opacity={0.94} />
            </View>
          ) : null}
          {rank >= 3 ? (
            <View style={{ position: 'absolute', right: '24%', bottom: '13%' }}>
              <SettlementDetailAtlasSprite assetId={sceneAssetId} cell={settlementSceneHumanV2Cells.gate} tintColor={sceneTint} size={rank >= 5 ? 72 : rank >= 4 ? 66 : 58} opacity={0.94} />
            </View>
          ) : null}
        </>
      ) : null}

      {faction === 'human' ? (
        <>
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

      <View style={{ position: 'absolute', left: 0, right: 0, top: '46%', height: roadWidth + 7, backgroundColor: roadEdge, opacity: rank >= 2 ? 0.16 : 0.22 }} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: '47%', height: roadWidth, backgroundColor: road, opacity: rank >= 2 ? 0.28 : 0.32 }} />
      <View style={{ position: 'absolute', left: '7%', right: '7%', top: '48.2%', height: 2, backgroundColor: roadHighlight, opacity: rank >= 2 ? 0.18 : 0.12 }} />
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: '46%', width: roadWidth + 7, backgroundColor: roadEdge, opacity: rank >= 2 ? 0.16 : 0.22 }} />
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: '47%', width: roadWidth, backgroundColor: road, opacity: rank >= 2 ? 0.28 : 0.32 }} />
      <View style={{ position: 'absolute', top: '8%', bottom: '8%', left: '49.1%', width: 2, backgroundColor: roadHighlight, opacity: rank >= 2 ? 0.18 : 0.12 }} />

      {rank >= 1 ? (
        <>
          <View style={{ position: 'absolute', left: '8%', top: '43%', width: '18%', height: 3, backgroundColor: palette.wood, opacity: 0.34 }} />
          <View style={{ position: 'absolute', right: '8%', top: '56%', width: '18%', height: 3, backgroundColor: palette.wood, opacity: 0.34 }} />
          <View style={{ position: 'absolute', left: '42%', top: '8%', width: 3, height: '17%', backgroundColor: palette.wood, opacity: 0.3 }} />
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
