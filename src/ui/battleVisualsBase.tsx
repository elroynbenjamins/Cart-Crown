import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type {
  CommanderSkillEffectType,
  FactionId,
  UnitRole
} from '../game/types';
import type { EncounterId } from '../game/encounters';
import { useGameTheme } from '../theme/ThemeProvider';
import { getBattlefieldSurfaces } from '../theme/battlefieldSurfaces';

type BattlefieldSceneId =
  | 'greenkeep_road'
  | 'iron_road'
  | 'border_marches'
  | 'royal_ruins'
  | 'heartgrove'
  | 'moon_grove'
  | 'red_road'
  | 'stonejaw_steppe'
  | 'ashen_breach'
  | 'crownspire';

type BattlefieldScene = {
  id: BattlefieldSceneId;
  label: string;
  sky: string;
  horizon: string;
  ground: string;
  accent: string;
  motif:
    | 'road'
    | 'iron'
    | 'forest'
    | 'moon'
    | 'steppe'
    | 'ruins'
    | 'crownspire';
};

const scenes: Record<BattlefieldSceneId, BattlefieldScene> = {
  greenkeep_road: {
    id: 'greenkeep_road',
    label: 'GREENKEEP ROAD',
    sky: '#31434A',
    horizon: '#44564E',
    ground: '#4B4A3A',
    accent: '#A88752',
    motif: 'road'
  },
  iron_road: {
    id: 'iron_road',
    label: 'IRON ROAD',
    sky: '#303B42',
    horizon: '#4E5350',
    ground: '#3E413E',
    accent: '#9C7851',
    motif: 'iron'
  },
  border_marches: {
    id: 'border_marches',
    label: 'BORDER MARCHES',
    sky: '#33444F',
    horizon: '#465245',
    ground: '#4B4635',
    accent: '#A58B54',
    motif: 'road'
  },
  royal_ruins: {
    id: 'royal_ruins',
    label: 'ROYAL RUINS',
    sky: '#323942',
    horizon: '#4B4744',
    ground: '#403D39',
    accent: '#A88D62',
    motif: 'ruins'
  },
  heartgrove: {
    id: 'heartgrove',
    label: 'HEARTGROVE',
    sky: '#213E3C',
    horizon: '#315447',
    ground: '#314433',
    accent: '#7CCB91',
    motif: 'forest'
  },
  moon_grove: {
    id: 'moon_grove',
    label: 'MOONLIT GROVE',
    sky: '#252F4B',
    horizon: '#33475A',
    ground: '#2D3D3A',
    accent: '#8ED0C4',
    motif: 'moon'
  },
  red_road: {
    id: 'red_road',
    label: 'RED ROAD',
    sky: '#473530',
    horizon: '#5A493C',
    ground: '#5A4033',
    accent: '#C36F55',
    motif: 'road'
  },
  stonejaw_steppe: {
    id: 'stonejaw_steppe',
    label: 'STONEJAW STEPPE',
    sky: '#4B4038',
    horizon: '#695746',
    ground: '#604935',
    accent: '#C28B5E',
    motif: 'steppe'
  },
  ashen_breach: {
    id: 'ashen_breach',
    label: 'ASHEN BREACH',
    sky: '#2C2930',
    horizon: '#46383A',
    ground: '#3C3231',
    accent: '#C36055',
    motif: 'ruins'
  },
  crownspire: {
    id: 'crownspire',
    label: 'CROWNSPIRE',
    sky: '#292D3B',
    horizon: '#3F4050',
    ground: '#37353E',
    accent: '#C6A867',
    motif: 'crownspire'
  }
};

export function getBattlefieldScene(
  encounterId: EncounterId,
  faction: FactionId
): BattlefieldScene {
  if (
    encounterId === 'iron_road_skirmish' ||
    encounterId === 'iron_provost'
  ) {
    return scenes.iron_road;
  }

  if (
    encounterId === 'border_fort' ||
    encounterId === 'siege_road' ||
    encounterId === 'lord_marshal_veyr'
  ) {
    return scenes.border_marches;
  }

  if (
    encounterId === 'broken_standards' ||
    encounterId === 'crownroad_ambush' ||
    encounterId === 'pretender_general' ||
    encounterId === 'old_royal_lands'
  ) {
    return scenes.royal_ruins;
  }

  if (
    encounterId === 'ashen_envoy' ||
    encounterId === 'sundered_fields'
  ) {
    return scenes.ashen_breach;
  }

  if (
    encounterId === 'gate_of_crownspire' ||
    encounterId === 'ashen_court' ||
    encounterId === 'return_to_crownspire' ||
    encounterId === 'three_seals_convergence' ||
    encounterId === 'ashen_triumvirate' ||
    encounterId === 'unbound_beacon' ||
    encounterId === 'elf_stars_over_crownspire' ||
    encounterId === 'elf_ashen_starwatch' ||
    encounterId === 'elf_return_through_roots' ||
    encounterId === 'orc_truth_at_crownspire' ||
    encounterId === 'orc_ashen_warfires' ||
    encounterId === 'orc_crownspire_warmaster'
  ) {
    return scenes.crownspire;
  }

  if (encounterId.startsWith('elf_')) {
    if (
      encounterId.includes('moonlit') ||
      encounterId.includes('pale_ranger') ||
      encounterId.includes('ashen_groves')
    ) {
      return scenes.moon_grove;
    }
    return scenes.heartgrove;
  }

  if (encounterId.startsWith('orc_')) {
    if (
      encounterId.includes('stonejaw') ||
      encounterId.includes('broken_steppe')
    ) {
      return scenes.stonejaw_steppe;
    }
    return scenes.red_road;
  }

  if (faction === 'elf') return scenes.heartgrove;
  if (faction === 'orc') return scenes.red_road;
  return scenes.greenkeep_road;
}

function Motif({
  scene,
  opacity
}: {
  scene: BattlefieldScene;
  opacity: number;
}) {
  if (scene.motif === 'forest' || scene.motif === 'moon') {
    return (
      <>
        {['5%', '20%', '74%', '90%'].map((left, index) => (
          <View
            key={'tree-' + index}
            style={[
              styles.tree,
              {
                left: left as `${number}%`,
                opacity,
                backgroundColor: scene.horizon
              }
            ]}
          >
            <View
              style={[
                styles.treeCrown,
                {
                  backgroundColor:
                    scene.motif === 'moon'
                      ? scene.accent
                      : scene.horizon
                }
              ]}
            />
          </View>
        ))}
        {scene.motif === 'moon' ? (
          <View
            style={[
              styles.moonRing,
              {
                borderColor: scene.accent,
                opacity: opacity * 0.85
              }
            ]}
          />
        ) : null}
      </>
    );
  }

  if (scene.motif === 'steppe') {
    return (
      <>
        <View
          style={[
            styles.hill,
            styles.hillLeft,
            {
              backgroundColor: scene.horizon,
              opacity
            }
          ]}
        />
        <View
          style={[
            styles.hill,
            styles.hillRight,
            {
              backgroundColor: scene.horizon,
              opacity: opacity * 0.9
            }
          ]}
        />
      </>
    );
  }

  if (scene.motif === 'ruins' || scene.motif === 'crownspire') {
    return (
      <>
        <View
          style={[
            styles.tower,
            {
              left: '12%',
              height: scene.motif === 'crownspire' ? 76 : 48,
              backgroundColor: scene.horizon,
              opacity
            }
          ]}
        />
        <View
          style={[
            styles.tower,
            {
              left: '45%',
              height: scene.motif === 'crownspire' ? 98 : 62,
              backgroundColor: scene.horizon,
              opacity
            }
          ]}
        />
        <View
          style={[
            styles.tower,
            {
              right: '12%',
              height: scene.motif === 'crownspire' ? 72 : 44,
              backgroundColor: scene.horizon,
              opacity
            }
          ]}
        />
        {scene.motif === 'crownspire' ? (
          <View
            style={[
              styles.spireTip,
              {
                borderBottomColor: scene.horizon,
                opacity
              }
            ]}
          />
        ) : null}
      </>
    );
  }

  if (scene.motif === 'iron') {
    return (
      <>
        <View
          style={[
            styles.rock,
            {
              left: '8%',
              backgroundColor: scene.horizon,
              opacity
            }
          ]}
        />
        <View
          style={[
            styles.rock,
            {
              right: '8%',
              width: 44,
              height: 22,
              backgroundColor: scene.horizon,
              opacity: opacity * 0.9
            }
          ]}
        />
        <View
          style={[
            styles.roadStrip,
            {
              backgroundColor: scene.accent,
              opacity: opacity * 0.42
            }
          ]}
        />
      </>
    );
  }

  return (
    <>
      <View
        style={[
          styles.roadStrip,
          {
            backgroundColor: scene.accent,
            opacity: opacity * 0.38
          }
        ]}
      />
      <View
        style={[
          styles.roadEdge,
          styles.roadEdgeLeft,
          {
            borderColor: scene.accent,
            opacity: opacity * 0.55
          }
        ]}
      />
      <View
        style={[
          styles.roadEdge,
          styles.roadEdgeRight,
          {
            borderColor: scene.accent,
            opacity: opacity * 0.55
          }
        ]}
      />
    </>
  );
}

export function BattlefieldBackdrop({
  encounterId,
  faction,
  difficulty,
  compact = false
}: {
  encounterId: EncounterId;
  faction: FactionId;
  difficulty: 'Normal' | 'Elite' | 'Boss';
  compact?: boolean;
}) {
  const { theme } = useGameTheme();
  const regionScene = getBattlefieldScene(encounterId, faction);
  const scene = { ...regionScene, ...getBattlefieldSurfaces(theme, regionScene) };
  const sceneOpacity = theme.dark ? 1 : 0.35;
  const motifOpacity = theme.dark ? 0.5 : 0.24;

  return (
    <View pointerEvents="none" style={styles.backdrop}>
      <View
        style={[
          styles.sky,
          {
            backgroundColor: scene.sky,
            opacity: sceneOpacity
          }
        ]}
      />
      <View
        style={[
          styles.horizon,
          {
            backgroundColor: scene.horizon,
            opacity: sceneOpacity * 0.9
          }
        ]}
      />
      <View
        style={[
          styles.ground,
          {
            backgroundColor: scene.ground,
            opacity: sceneOpacity
          }
        ]}
      />

      <Motif scene={scene} opacity={motifOpacity} />

      <View
        style={[
          styles.rowGuide,
          styles.rowGuideTop,
          {
            borderColor: scene.accent,
            opacity: theme.dark ? 0.18 : 0.11
          }
        ]}
      />
      <View
        style={[
          styles.rowGuide,
          styles.rowGuideBottom,
          {
            borderColor: scene.accent,
            opacity: theme.dark ? 0.18 : 0.11
          }
        ]}
      />

      {!compact ? (
        <View
          style={[
            styles.sceneLabel,
            {
              backgroundColor: theme.colors.appBg + '99',
              borderColor: scene.accent + '66'
            }
          ]}
        >
          <Text
            style={[
              styles.sceneLabelText,
              { color: scene.accent }
            ]}
          >
            {scene.label}
          </Text>
        </View>
      ) : null}

      {difficulty === 'Elite' ? (
        <View
          style={[
            styles.difficultyHaze,
            {
              borderColor: theme.colors.gold + '55'
            }
          ]}
        />
      ) : null}

      {difficulty === 'Boss' ? (
        <>
          <View
            style={[
              styles.bossVignette,
              {
                borderColor: theme.colors.danger + '88'
              }
            ]}
          />
          {['22%', '50%', '78%'].map((left, index) => (
            <View
              key={'ember-' + index}
              style={[
                styles.ember,
                {
                  left: left as `${number}%`,
                  top: index % 2 === 0 ? '13%' : '18%',
                  backgroundColor:
                    index === 1
                      ? theme.colors.gold
                      : theme.colors.danger,
                  opacity: theme.dark ? 0.7 : 0.35
                }
              ]}
            />
          ))}
        </>
      ) : null}
    </View>
  );
}

function VfxLine({
  width,
  color,
  rotate,
  top,
  left
}: {
  width: number;
  color: string;
  rotate: string;
  top: number;
  left: number;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        width,
        height: 2,
        borderRadius: 1,
        backgroundColor: color,
        top,
        left,
        transform: [{ rotate }]
      }}
    />
  );
}

export function BattleVfxStrip({
  role,
  healed,
  progress
}: {
  role: UnitRole | null;
  healed: number;
  progress: Animated.Value;
}) {
  const { theme } = useGameTheme();
  if (!role && healed <= 0) return <View style={styles.vfxStrip} />;

  const opacity = progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0.12, 0.95, 0.25]
  });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.15]
  });
  const travel = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-7, 8]
  });

  const accent =
    role === 'support'
      ? theme.colors.primary
      : role === 'ranged'
        ? theme.colors.info
        : role === 'cavalry'
          ? theme.colors.gold
          : theme.colors.text;

  return (
    <View pointerEvents="none" style={styles.vfxStrip}>
      <Animated.View
        style={[
          styles.vfxCore,
          {
            opacity,
            transform: [
              { translateY: travel },
              { scale }
            ]
          }
        ]}
      >
        {role === 'ranged' ? (
          <>
            <VfxLine
              width={42}
              color={accent}
              rotate="90deg"
              top={12}
              left={19}
            />
            <VfxLine
              width={10}
              color={accent}
              rotate="55deg"
              top={28}
              left={37}
            />
            <VfxLine
              width={10}
              color={accent}
              rotate="125deg"
              top={28}
              left={33}
            />
          </>
        ) : role === 'cavalry' ? (
          <>
            <VfxLine
              width={52}
              color={accent}
              rotate="78deg"
              top={11}
              left={13}
            />
            <View
              style={[
                styles.dust,
                { left: 9, backgroundColor: accent + '77' }
              ]}
            />
            <View
              style={[
                styles.dust,
                styles.dustMiddle,
                { backgroundColor: accent + '55' }
              ]}
            />
            <View
              style={[
                styles.dust,
                { right: 8, backgroundColor: accent + '44' }
              ]}
            />
          </>
        ) : role === 'skirmish' ? (
          <>
            <VfxLine
              width={28}
              color={accent}
              rotate="66deg"
              top={10}
              left={17}
            />
            <VfxLine
              width={28}
              color={accent}
              rotate="114deg"
              top={10}
              left={37}
            />
          </>
        ) : role === 'support' || healed > 0 ? (
          <>
            <View
              style={[
                styles.wardRing,
                { borderColor: theme.colors.primary }
              ]}
            />
            <View
              style={[
                styles.wardCore,
                { backgroundColor: theme.colors.primary }
              ]}
            />
          </>
        ) : (
          <>
            <VfxLine
              width={44}
              color={accent}
              rotate="42deg"
              top={14}
              left={16}
            />
            <VfxLine
              width={44}
              color={accent}
              rotate="-42deg"
              top={14}
              left={20}
            />
          </>
        )}
      </Animated.View>
    </View>
  );
}

export function BattleStatusMarker({
  effectType,
  remaining
}: {
  effectType: CommanderSkillEffectType | null;
  remaining: number;
}) {
  const { theme } = useGameTheme();
  if (!effectType || remaining <= 0) return null;

  const label =
    effectType === 'bleed'
      ? 'BLEED'
      : effectType === 'armor_break'
        ? 'ARMOR BROKEN'
        : effectType === 'morale_break'
          ? 'MORALE SHAKEN'
          : 'COMMANDER HIT';

  const accent =
    effectType === 'bleed'
      ? theme.colors.danger
      : effectType === 'armor_break'
        ? theme.colors.gold
        : theme.colors.info;

  return (
    <View
      style={[
        styles.statusMarker,
        {
          backgroundColor: accent + '14',
          borderColor: accent + '66'
        }
      ]}
    >
      <View
        style={[
          styles.statusMark,
          {
            backgroundColor: accent
          }
        ]}
      />
      <Text
        style={[
          styles.statusMarkerText,
          { color: accent }
        ]}
      >
        {label} · {remaining}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 14
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%'
  },
  horizon: {
    position: 'absolute',
    top: '31%',
    left: 0,
    right: 0,
    height: '25%'
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '56%'
  },
  rowGuide: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    borderTopWidth: 1
  },
  rowGuideTop: { top: '32%' },
  rowGuideBottom: { bottom: '31%' },
  sceneLabel: {
    position: 'absolute',
    right: 8,
    top: 8,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  sceneLabelText: {
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  roadStrip: {
    position: 'absolute',
    width: 26,
    height: '48%',
    bottom: '-3%',
    left: '47%',
    transform: [{ rotate: '2deg' }]
  },
  roadEdge: {
    position: 'absolute',
    width: 48,
    height: '54%',
    bottom: '-2%',
    borderLeftWidth: 1
  },
  roadEdgeLeft: {
    left: '35%',
    transform: [{ rotate: '-12deg' }]
  },
  roadEdgeRight: {
    right: '22%',
    transform: [{ rotate: '12deg' }]
  },
  tree: {
    position: 'absolute',
    top: '22%',
    width: 7,
    height: '31%',
    borderRadius: 3
  },
  treeCrown: {
    position: 'absolute',
    width: 30,
    height: 20,
    borderRadius: 15,
    left: -12,
    top: -8
  },
  moonRing: {
    position: 'absolute',
    right: '16%',
    top: '10%',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2
  },
  hill: {
    position: 'absolute',
    top: '30%',
    width: '46%',
    height: 54,
    borderRadius: 999
  },
  hillLeft: {
    left: '-6%',
    transform: [{ rotate: '-7deg' }]
  },
  hillRight: {
    right: '-5%',
    transform: [{ rotate: '8deg' }]
  },
  tower: {
    position: 'absolute',
    bottom: '47%',
    width: 22,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
  },
  spireTip: {
    position: 'absolute',
    left: '45.5%',
    bottom: '66%',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent'
  },
  rock: {
    position: 'absolute',
    bottom: '48%',
    width: 34,
    height: 18,
    borderRadius: 7,
    transform: [{ rotate: '-7deg' }]
  },
  difficultyHaze: {
    position: 'absolute',
    left: '4%',
    right: '4%',
    top: '4%',
    bottom: '4%',
    borderRadius: 14,
    borderWidth: 1
  },
  bossVignette: {
    position: 'absolute',
    left: 3,
    right: 3,
    top: 3,
    bottom: 3,
    borderRadius: 14,
    borderWidth: 2
  },
  ember: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2
  },
  vfxStrip: {
    alignSelf: 'center',
    width: 86,
    height: 34,
    marginVertical: -3,
    overflow: 'visible'
  },
  vfxCore: {
    width: 80,
    height: 34,
    alignSelf: 'center',
    position: 'relative'
  },
  dust: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    bottom: 2
  },
  dustMiddle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    left: 33,
    bottom: 0
  },
  wardRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    left: 25,
    top: 1
  },
  wardCore: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    left: 36,
    top: 12
  },
  statusMarker: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 20,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 3
  },
  statusMark: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusMarkerText: {
    fontSize: 7.3,
    fontWeight: '900',
    letterSpacing: 0.4
  }
});
