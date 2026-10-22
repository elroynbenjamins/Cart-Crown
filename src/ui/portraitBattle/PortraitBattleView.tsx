import React, { memo, useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { CommanderSkillEffectType, EnemyFantasyThreatFamily, FactionId, FormationShapeDefinition, UnitDefinition, UnitRole } from '../../game/types';
import type { EncounterId, EnemyArmyProfileId } from '../../game/encounters';
import { useGameTheme } from '../../theme/ThemeProvider';
import { EnemySprite, UnitPortraitSprite, UnitSprite } from '../gameArt';
import { BattleStatusMarker, BattleVfxStrip, EnemyFantasyStrikeVfx, EnemyFantasyThreatAura } from '../battleVisuals';
import { IllustratedBattlefieldBackdrop } from './IllustratedBattlefieldBackdrop';
import { getBossPresentation } from '../bossPresentation';
import { BossStageSilhouette } from '../BossStageSilhouette';
import { ReferenceArt } from './Art';
import { allyPortrait, battleLayout, enemyPortrait, figureForPortrait, healthFraction, rankForSlot, rankLabels, roleNames, rosterForFormation, stageDepthVisual, stageExchangeMotion, stageFormationReadout, stageRoleLetters, stageTokens, stageAttackTrail, stageIntegrityReadout, stageOrderBand, stageFractureLine, battleSpectacleCue } from './model';
import type { ArmySide, EnemyToken, ExchangeRecord, IntegrityTier } from './model';

export type PortraitBattleProps = {
  encounterId: EncounterId; encounterName: string; enemyName: string;
  difficulty: 'Normal' | 'Elite' | 'Boss'; faction: FactionId;
  enemyProfile: EnemyArmyProfileId; fantasyThreat?: EnemyFantasyThreatFamily;
  formation: readonly (string | null)[]; units: readonly UnitDefinition[];
  shape: FormationShapeDefinition; enemyShape: FormationShapeDefinition;
  enemies: readonly EnemyToken[];
  partyHp: number; partyMaxHp: number; enemyHp: number; enemyMaxHp: number;
  partyIntegrity: number; enemyIntegrity: number;
  partyIntegrityState: IntegrityTier; enemyIntegrityState: IntegrityTier;
  outgoingDamage: number; incomingDamage: number;
  turn: number; speed: 1 | 2; paused: boolean; controlsLocked: boolean;
  outcome: 'victory' | 'defeat' | null;
  activeSlot: number | null; enemySlot: number | null; supportSlots: readonly number[];
  activeRole: UnitRole | null; healed: number;
  attackPulse: Animated.Value; impactPulse: Animated.Value;
  records: readonly ExchangeRecord[]; initialLog: string;
  matchup: string; effects: readonly { key: string; label: string; color: string }[];
  status: { type: CommanderSkillEffectType; remaining: number; power: number } | null;
  orders?: readonly {
    id: string;
    label: string;
    accessibilityLabel: string;
    selected: boolean;
    disabled: boolean;
    cooldown: number;
    onPress: () => void;
  }[];
  onToggleSpeed: () => void; onTogglePause: () => void; onComplete: () => void;
};

type Selection = { side: ArmySide; slot: number };
type Panel = 'log' | 'formation' | 'squad' | null;
const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let mounted = true, receivedEvent = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      receivedEvent = true;
      if (mounted) setReduced(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted && !receivedEvent) setReduced(value);
    }).catch(() => {});
    return () => { mounted = false; subscription.remove(); };
  }, []);
  return reduced;
}

function Action({ label, onPress, selected = false, disabled = false, accessibilityLabel }: {
  label: string; onPress: () => void; selected?: boolean; disabled?: boolean; accessibilityLabel?: string;
}) {
  const { theme } = useGameTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}
    accessibilityState={{ disabled, selected }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.action, {
      backgroundColor: selected ? theme.colors.gold + '18' : theme.colors.surface1,
      borderColor: selected ? theme.colors.gold : theme.colors.border,
      borderBottomColor: selected ? theme.colors.gold : theme.colors.border,
      opacity: disabled ? .5 : pressed ? .74 : 1,
      transform: [{ translateY: pressed && !disabled ? 1 : 0 }]
    }]}>
    <Text style={[s.actionLabel, { color: selected ? theme.colors.gold : theme.colors.text }]}>{label}</Text>
  </Pressable>;
}

function Health({ label, hp, max, shape, integrity = 100, integrityState = 'stable', enemy = false }: {
  label: string; hp: number; max: number; shape: FormationShapeDefinition;
  integrity?: number; integrityState?: IntegrityTier; enemy?: boolean;
}) {
  const { theme } = useGameTheme();
  const fill = enemy ? theme.colors.danger : theme.colors.primary;
  const readout = stageFormationReadout(shape);
  const line = stageIntegrityReadout(integrity, integrityState);
  const lineColor = line.fractured ? theme.colors.danger : integrityState === 'pressured' ? theme.colors.gold : fill;
  return <View accessible accessibilityLabel={`${label}: ${hp} of ${max} shared army HP; line integrity ${line.percent} percent, ${line.label}; formation ${shape.name}, ${readout.ranks}`} style={s.health}>
    <View style={s.healthHeading}>
      <Text style={[s.healthName, { color: fill }]}>{label} · {shape.layout}</Text>
      <Text style={[s.healthValue, { color: theme.colors.text }]}>{hp} / {max}</Text>
    </View>
    <View style={[s.healthTrack, { backgroundColor: theme.colors.surface3 }]}>
      <View style={{ width: `${healthFraction(hp, max) * 100}%`, height: 4, backgroundColor: fill }} />
    </View>
    <Text testID={enemy ? 'enemy-formation-posture' : 'ally-formation-posture'}
      numberOfLines={1} style={[s.healthReadout, { color: theme.colors.textMuted }]}>
      {readout.label} · {readout.ranks}
    </Text>
    <View testID={enemy ? 'enemy-integrity-readout' : 'ally-integrity-readout'} style={s.integrityRow}>
      <Text style={[s.integrityCopy, { color: lineColor }]}>LINE {line.percent}% · {line.label}</Text>
      <View style={[s.integrityTrack, { backgroundColor: theme.colors.surface3 }]}>
        <View style={{ width: `${line.percent}%`, height: 3, backgroundColor: lineColor }} />
      </View>
    </View>
  </View>;
}

export const PortraitBattleView = memo(function PortraitBattleView(p: PortraitBattleProps) {
  const { theme } = useGameTheme();
  const { width, height, fontScale } = useWindowDimensions();
  const [viewport, setViewport] = useState({ width, height });
  const [selected, setSelected] = useState<Selection | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const reducedMotion = useReducedMotion();
  const layout = battleLayout(viewport.width, viewport.height, fontScale);
  const roster = rosterForFormation(p.formation, p.units);
  const spectacle = battleSpectacleCue(p.difficulty);
  const dangerAccent = p.difficulty === 'Boss' ? theme.colors.gold : p.difficulty === 'Elite' ? theme.colors.danger : theme.colors.textMuted;
  const signatureBoss = getBossPresentation(p.encounterId, p.difficulty, theme.dark, layout.compact);
  const allyPositions = stageTokens(p.shape, roster.map(item => item.slot), 'ally', layout.stageWidth, layout.stageHeight);
  // Include routed enemies; their spots must not be recycled or compressed.
  const enemyPositions = stageTokens(p.enemyShape, p.enemies.map(item => item.slot), 'enemy', layout.stageWidth, layout.stageHeight);
  const allyLine = stageIntegrityReadout(p.partyIntegrity ?? 100, p.partyIntegrityState ?? 'stable');
  const foeLine = stageIntegrityReadout(p.enemyIntegrity ?? 100, p.enemyIntegrityState ?? 'stable');
  const allyFracture = stageFractureLine(allyPositions, 'ally', layout.stageWidth, layout.stageHeight);
  const enemyFracture = stageFractureLine(enemyPositions, 'enemy', layout.stageWidth, layout.stageHeight);
  const trail = stageAttackTrail(allyPositions, enemyPositions, p.activeSlot, p.enemySlot, p.activeRole, p.outgoingDamage);
  const activeOrder = p.orders?.find(order => order.selected);
  const onFieldOrder = stageOrderBand(activeOrder?.id ?? null, allyPositions, enemyPositions,
    p.enemySlot, layout.stageWidth, layout.stageHeight);
  const factionAccent = theme.colors[p.faction];
  const ongoing = !p.outcome;
  const moving = ongoing && !p.paused && !reducedMotion;
  const last = p.records[p.records.length - 1];
  const rankCopy = (shape: FormationShapeDefinition, slot: number) => {
    const row = rankForSlot(shape, slot);
    return row ? `${rankLabels[row]} ${shape.rows[row].indexOf(slot) + 1}` : `Slot ${slot + 1}`;
  };
  const selectedAlly = selected?.side === 'ally' ? roster.find(item => item.slot === selected.slot) : null;
  const selectedEnemy = selected?.side === 'enemy' ? p.enemies.find(item => item.slot === selected.slot) : null;
  const selectedTitle = selectedAlly?.unit.className ?? (selectedEnemy?.boss ? p.enemyName : selectedEnemy?.label);
  const selectedCopy = selectedAlly
    ? `${selectedAlly.unit.className} · Lv. ${selectedAlly.unit.level} · ${rankCopy(p.shape, selectedAlly.slot)}`
    : selectedEnemy ? `${selectedEnemy.boss ? p.enemyName : selectedEnemy.label} · ${rankCopy(p.enemyShape, selectedEnemy.slot)}${selectedEnemy.down ? ' · Routed' : ''}` : null;

  function enemyFigure(item: EnemyToken, size: number) {
    // Do not replace a named boss, magical unit or a different mount with a generic portrait figure.
    const profile = item.boss ? p.enemyProfile : item.role === 'ranged' ? 'missile_company'
      : item.role === 'cavalry' ? 'mounted_hunters' : item.role === 'support' ? 'warded_host' : p.enemyProfile;
    const fallback = <EnemySprite enemyName={item.boss ? p.enemyName : item.label} armyProfileId={profile}
      fantasyThreat={p.fantasyThreat} role={item.role} size={size} />;
    const portrait = enemyPortrait(item.role, p.enemyProfile, p.enemyName, item.boss, p.fantasyThreat);
    return portrait ? <ReferenceArt art={figureForPortrait(portrait)} width={size} fallback={fallback} /> : fallback;
  }

  function portraitRail(side: ArmySide) {
    const enemy = side === 'enemy';
    const cards = enemy ? p.enemies.map(item => ({
      slot: item.slot, level: null as number | null, title: item.boss ? p.enemyName : item.label, boss: item.boss,
      detail: `${roleNames[item.role]} · ${rankCopy(p.enemyShape, item.slot)}`,
      art: enemyPortrait(item.role, p.enemyProfile, p.enemyName, item.boss, p.fantasyThreat),
      active: ongoing && !item.down && item.slot === p.enemySlot, down: item.down,
      fallback: enemyFigure(item, layout.portraitSize)
    })) : roster.map(({ slot, unit }) => ({
      slot, level: unit.level, title: unit.className, boss: false, detail: `Lv. ${unit.level} · ${roleNames[unit.role]} · ${rankCopy(p.shape, slot)}`,
      art: allyPortrait(unit), active: ongoing && (p.activeSlot === slot || p.supportSlots.includes(slot)), down: false,
      fallback: <UnitPortraitSprite className={unit.className} faction={unit.faction} size={layout.portraitSize} />
    }));
    return <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={cards.length > 4}
      testID={enemy ? 'enemy-portrait-rail' : 'ally-portrait-rail'}
      accessibilityLabel={enemy ? 'Enemy portraits' : 'Your squad portraits'}
      style={{ height: layout.railHeight, flexGrow: 0 }}
      contentContainerStyle={s.railContent}>
      {cards.map(card => {
        const chosen = selected?.side === side && selected.slot === card.slot;
        return <Pressable key={`${side}-${card.slot}`} accessibilityRole="button"
          accessibilityLabel={`${card.title}, ${card.detail}${card.down ? ', routed' : ''}${card.active ? ', active this exchange' : ''}`}
          accessibilityHint="Tap to locate this squad. Long press for its details."
          accessibilityState={{ selected: chosen }} disabled={p.controlsLocked}
          onPress={() => setSelected(chosen ? null : { side, slot: card.slot })}
          onLongPress={() => { setSelected({ side, slot: card.slot }); setPanel('squad'); }}
          style={({ pressed }) => [s.portraitCard, { width: layout.portraitWidth,
            borderColor: chosen ? theme.colors.gold : card.active ? enemy ? theme.colors.danger : theme.colors.primary : theme.colors.border,
            backgroundColor: theme.colors.surface1, opacity: card.down ? .38 : pressed ? .75 : 1 }]}>
          <View style={[s.portraitImage, { width: layout.portraitSize, height: layout.portraitSize }]}>
            {card.art ? <ReferenceArt art={card.art} width={layout.portraitSize} fallback={card.fallback} /> : card.fallback}
            {card.level !== null ? <Text style={[s.levelBadge, { color: theme.colors.text, backgroundColor: theme.colors.appBg }]}>Lv. {card.level}</Text> : null}
            {card.down ? <Text style={s.routedMark}>×</Text> : null}
            {card.boss ? <View pointerEvents="none" style={[s.railBossMark, { backgroundColor: theme.colors.gold }]}><Text style={s.railBossText}>◆</Text></View> : null}
          </View>
          <Text style={[s.portraitName, { color: theme.colors.text }]} numberOfLines={1}>{card.title}</Text>
        </Pressable>;
      })}
    </ScrollView>;
  }

  const battlefield = <View testID="portrait-battle-stage" style={[s.stage, {
    width: layout.stageWidth, height: layout.stageHeight, backgroundColor: theme.colors.surface1, borderColor: theme.colors.border
  }]}>
    <IllustratedBattlefieldBackdrop encounterId={p.encounterId} faction={p.faction} difficulty={p.difficulty}
      fantasyThreat={p.fantasyThreat} compact={layout.compact} width={layout.stageWidth} height={layout.stageHeight} />
    <EnemyFantasyThreatAura fantasyThreat={p.fantasyThreat} compact={layout.compact} />
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.fill}>
      {(['enemy', 'ally'] as const).flatMap(side => {
        const shape = side === 'enemy' ? p.enemyShape : p.shape;
        const anchors = stageTokens(shape, Array.from({ length: 9 }, (_, i) => i), side, layout.stageWidth, layout.stageHeight);
        return (['front', 'middle', 'rear'] as const).map(row => {
          const point = anchors.find(item => item.row === row);
          return point ? <View key={`${side}-${row}`} style={[s.guide, { top: point.y, borderColor: theme.colors.border }]}>
            <Text style={[s.rankMark, { color: theme.colors.textMuted }]}>{row.slice(0, 1).toUpperCase()}</Text>
          </View> : null;
        });
      })}
      <View style={[s.engagement, { top: layout.stageHeight * .5, borderColor: theme.colors.gold }]} />
      {foeLine.fractured && enemyFracture ? <View testID="enemy-line-fracture" style={[s.lineFracture, {
        ...enemyFracture, borderColor: theme.colors.danger,
        opacity: p.enemyIntegrityState === 'breached' ? .9 : .55
      }]} /> : null}
      {allyLine.fractured && allyFracture ? <View testID="ally-line-fracture" style={[s.lineFracture, {
        ...allyFracture, borderColor: theme.colors.danger,
        opacity: p.partyIntegrityState === 'breached' ? .9 : .55
      }]} /> : null}
      {ongoing && onFieldOrder ? <View pointerEvents="none" accessible={false}
        accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        testID={'battle-field-order-' + onFieldOrder.id}
        style={[s.orderFieldBand, {
          left: onFieldOrder.left, top: onFieldOrder.top, width: onFieldOrder.width,
          borderColor: onFieldOrder.id === 'hold' ? theme.colors.info :
            onFieldOrder.id === 'reinforce' ? theme.colors.primary : theme.colors.gold
        }]}>
        <Text numberOfLines={1} style={[s.orderFieldLabel, {
          color: theme.colors.text, backgroundColor: theme.colors.surface1 + 'E0'
        }]}>
          {onFieldOrder.label}
        </Text>
      </View> : null}
      {allyPositions.map(position => {
        const item = roster.find(candidate => candidate.slot === position.slot)!;
        const active = ongoing && position.slot === p.activeSlot;
        const support = ongoing && p.supportSlots.includes(position.slot);
        const chosen = selected?.side === 'ally' && selected.slot === position.slot;
        const depth = stageDepthVisual(position.row);
        const motion = stageExchangeMotion(p.shape, position.row);
        const strikeShift = -(motion.advance + (active ? 3.5 : 0));
        const impactShift = -(motion.reinforce - motion.brace);
        return <Animated.View key={`ally-${position.slot}`} testID={`ally-stage-slot-${position.slot}`}
          style={[s.actor, { left: position.x - position.size / 2, top: position.y - position.size / 2,
            width: position.size, height: position.size, zIndex: depth.zIndex,
            transform: [
              { translateY: moving && strikeShift !== 0 ? p.attackPulse.interpolate({ inputRange: [0, 1], outputRange: [0, strikeShift] }) : 0 },
              { translateY: moving && impactShift !== 0 ? p.impactPulse.interpolate({ inputRange: [0, 1], outputRange: [0, impactShift] }) : 0 },
              { scaleY: moving && motion.impactScaleY !== 1 ? p.impactPulse.interpolate({ inputRange: [0, 1], outputRange: [1, motion.impactScaleY] }) : 1 }
            ] }]}>
          <View style={[s.shadow, { backgroundColor: '#000000',
            width: position.size * depth.shadowScale, height: depth.shadowHeight, opacity: depth.shadowOpacity }]} />
          <View pointerEvents="none" testID={'ally-facing-' + position.slot} style={[s.facingMark, s.allyFacing]}>
            <Text style={[s.facingGlyph, { color: factionAccent }]}>▲</Text>
          </View>
          {allyPortrait(item.unit) ? <ReferenceArt art={figureForPortrait(allyPortrait(item.unit)!)} width={position.size * 1.08} height={position.size * 1.08}
            fallback={<UnitSprite preferHumanArt={false} presentationScale={1.08} className={item.unit.className} faction={item.unit.faction} size={position.size} />} />
            : <UnitSprite preferHumanArt={false} presentationScale={1.08} className={item.unit.className} faction={item.unit.faction} size={position.size} />}
          <View pointerEvents="none" testID={'ally-stage-role-' + position.slot} style={[s.roleMarker, { borderColor: factionAccent }]}>
            <Text style={s.roleMarkerText}>{stageRoleLetters[item.unit.role]}</Text>
          </View>
          {active || support || chosen ? <View style={[s.activeUnderline, { backgroundColor: chosen ? theme.colors.gold : support ? theme.colors.primary : factionAccent }]} /> : null}
          {chosen ? <View style={[s.selectionFrame, { borderColor: theme.colors.gold }]} /> : null}
        </Animated.View>;
      })}
      {enemyPositions.map(position => {
        const item = p.enemies.find(candidate => candidate.slot === position.slot)!;
        const targeted = ongoing && !item.down && p.enemySlot === item.slot;
        const hitAccent = p.activeRole === 'ranged' ? theme.colors.info : p.activeRole === 'cavalry' ? theme.colors.gold : p.activeRole === 'support' ? theme.colors.primary : theme.colors.text;
        const chosen = selected?.side === 'enemy' && selected.slot === position.slot;
        const depth = stageDepthVisual(position.row);
        const motion = stageExchangeMotion(p.enemyShape, position.row);
        const strikeShift = motion.advance;
        const impactShift = (targeted ? 3 : 0) + (targeted ? 0 : motion.reinforce) - motion.brace;
        const impactScaleY = targeted ? Math.min(.95, motion.impactScaleY) : motion.impactScaleY;
        return <Animated.View key={`enemy-${position.slot}`} testID={`enemy-stage-slot-${position.slot}`}
          style={[s.actor, { left: position.x - position.size / 2, top: position.y - position.size / 2,
            width: position.size, height: position.size, opacity: item.down ? .2 : 1, zIndex: depth.zIndex,
            transform: [
              { translateY: moving && strikeShift !== 0 ? p.attackPulse.interpolate({ inputRange: [0, 1], outputRange: [0, strikeShift] }) : 0 },
              { translateY: moving && impactShift !== 0 ? p.impactPulse.interpolate({ inputRange: [0, .5, 1], outputRange: [0, impactShift, 0] }) : 0 },
              { scaleY: moving && impactScaleY !== 1 ? p.impactPulse.interpolate({ inputRange: [0, .5, 1], outputRange: [1, impactScaleY, 1] }) : 1 }
            ] }]}>
          <View style={[s.shadow, { backgroundColor: '#000000',
            width: position.size * depth.shadowScale, height: depth.shadowHeight, opacity: depth.shadowOpacity }]} />
          {!item.down ? <View pointerEvents="none" testID={'enemy-facing-' + position.slot} style={[s.facingMark, s.enemyFacing]}>
            <Text style={[s.facingGlyph, { color: theme.colors.danger }]}>▼</Text>
          </View> : null}
          {item.boss && !item.down ? <View pointerEvents="none" testID={'boss-stage-ground-' + item.slot}
            style={[s.bossGround, { borderColor: theme.colors.gold, backgroundColor: theme.colors.gold + '18' }]} /> : null}
          {item.boss && !item.down ? <View pointerEvents="none" testID={'boss-actor-identity-' + item.slot} style={[s.bossInsignia, { borderColor: theme.colors.gold }]}><Text style={[s.bossInsigniaGlyph, { color: theme.colors.gold }]}>◆</Text></View> : null}
          {p.difficulty === 'Elite' && !item.down ? <View pointerEvents="none" style={[s.eliteUnderlay, { borderColor: theme.colors.danger }]} /> : null}
          {targeted ? <View pointerEvents="none" testID={'battle-target-lock-' + item.slot}
            style={[s.targetLock, { borderColor: theme.colors.danger }]} /> : null}
          {targeted && p.outgoingDamage > 0 ? <Animated.View style={[s.impactRing, {
            borderColor: theme.colors.danger,
            opacity: moving ? p.impactPulse : 0,
            transform: [{ scale: moving ? p.impactPulse.interpolate({ inputRange: [0, 1], outputRange: [.78, 1.08] }) : 1 }]
          }]} /> : null}
          {targeted && moving && p.outgoingDamage > 0 ? <Animated.View testID={'battle-target-spark-' + item.slot} pointerEvents="none" style={[s.hitSpark, { borderColor: hitAccent, opacity: p.impactPulse.interpolate({ inputRange: [0, .45, 1], outputRange: [0, 1, 0], extrapolate: 'clamp' }), transform: [{ scale: p.impactPulse.interpolate({ inputRange: [0, 1], outputRange: [.7, 1.1] }) }] }]}><View style={[s.hitSparkCross, { backgroundColor: hitAccent }]} /><View style={[s.hitSparkCross, s.hitSparkVertical, { backgroundColor: hitAccent }]} /></Animated.View> : null}
          {item.boss && !item.down && signatureBoss ? <BossStageSilhouette
            signature={signatureBoss.signature} size={position.size}
            material={signatureBoss.material} light={signatureBoss.light} /> : null}
          {enemyFigure(item, item.boss ? position.size * 1.06 : position.size)}
          {!item.down && !item.boss ? <View pointerEvents="none" testID={'enemy-stage-role-' + item.slot}
            style={[s.roleMarker, { borderColor: theme.colors.danger }]}>
            <Text style={s.roleMarkerText}>{stageRoleLetters[item.role]}</Text>
          </View> : null}
          {targeted || chosen ? <View style={[s.activeUnderline, { backgroundColor: chosen ? theme.colors.gold : theme.colors.danger }]} /> : null}
          {chosen ? <View style={[s.selectionFrame, { borderColor: theme.colors.gold }]} /> : null}
        </Animated.View>;
      })}
      {/* The exchange pulse goes 0 -> 1 -> 0, so moving an arrow along it would
          visibly reverse the projectile. A brief line-of-fire trace uses the real
          actor/target positions without a fake backward flight or extra clock. */}
      {moving && trail ? <Animated.View pointerEvents="none" testID={'battle-' + trail.kind + '-trajectory'}
        style={[s.attackTrail, {
          left: trail.x + trail.dx / 2 - (trail.kind === 'arrow' ? 1 : 3),
          top: trail.y + trail.dy / 2 - Math.hypot(trail.dx, trail.dy) / 2,
          width: trail.kind === 'arrow' ? 2 : 6,
          height: Math.hypot(trail.dx, trail.dy),
          backgroundColor: trail.kind === 'arrow' ? theme.colors.info : theme.colors.gold,
          opacity: p.attackPulse.interpolate({ inputRange: [0, .25, .75, 1], outputRange: [0, .66, .38, 0], extrapolate: 'clamp' }),
          transform: [{ rotate: `${Math.atan2(trail.dx, -trail.dy) * 180 / Math.PI}deg` }]
        }]} /> : null}
      {moving && p.incomingDamage > 0 ? <Animated.View pointerEvents="none" testID="ally-frontline-impact"
        style={[s.frontlineImpact, { top: layout.stageHeight * .59, borderColor: theme.colors.danger,
          opacity: p.impactPulse.interpolate({ inputRange: [0, .5, 1], outputRange: [0, .8, 0] }) }]} /> : null}
      {moving ? <View style={[s.vfx, { top: layout.stageHeight * .5 - 17 }]}>
        <View style={{ transform: [{ scaleY: -1 }] }}><BattleVfxStrip role={p.outgoingDamage > 0 ? p.activeRole : null} healed={p.healed} progress={p.attackPulse} /></View>
        <EnemyFantasyStrikeVfx fantasyThreat={p.fantasyThreat} progress={p.impactPulse} />
      </View> : null}
    </View>
    {p.paused && ongoing ? <View pointerEvents="none" style={s.pauseOverlay}><Text style={s.pauseCopy}>PAUSED</Text></View> : null}
  </View>;

  return <View style={[s.viewport, { backgroundColor: theme.colors.appBg }]} testID="portrait-battle-view"
    onLayout={event => { const next = event.nativeEvent.layout;
      setViewport(previous => Math.abs(previous.width - next.width) > 1 || Math.abs(previous.height - next.height) > 1
        ? { width: next.width, height: next.height } : previous);
    }}>
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.heading}>
        <View style={s.headingCopy}>
          <Text style={[s.encounterTitle, { color: theme.colors.text }]} numberOfLines={1}>{p.encounterName}</Text>
          <View testID="battle-threat-cue" accessibilityLabel={spectacle.label} style={s.threatHeading}>
            <View style={[s.threatPip, { backgroundColor: dangerAccent }]} />
            <Text style={[s.threatText, { color: dangerAccent }]}>{spectacle.label}</Text>
            {p.difficulty !== 'Normal' ? <Text style={[s.threatMark, { color: dangerAccent }]}>{p.difficulty === 'Boss' ? '◆ ◆ ◆' : '◆ ◆'}</Text> : null}
          </View>
          <Text style={[s.subtitle, { color: theme.colors.textMuted }]}>
            {p.outcome ? p.outcome.toUpperCase() : p.paused ? 'Paused' : `Exchange ${p.turn + 1}`} · Auto battle
          </Text>
        </View>
        <Action label={`${p.speed}×`} accessibilityLabel={`Battle speed ${p.speed} times`} selected={p.speed === 2}
          disabled={!!p.outcome || p.controlsLocked} onPress={p.onToggleSpeed} />
        <Action label={p.paused ? '▶' : 'Ⅱ'} accessibilityLabel={p.paused ? 'Resume battle' : 'Pause battle'}
          disabled={!!p.outcome || p.controlsLocked} onPress={p.onTogglePause} />
      </View>
      {portraitRail('enemy')}
      <Health label="ENEMY ARMY" hp={p.enemyHp} max={p.enemyMaxHp} shape={p.enemyShape}
        integrity={p.enemyIntegrity} integrityState={p.enemyIntegrityState} enemy />
      {battlefield}
      <Health label="YOUR ARMY" hp={p.partyHp} max={p.partyMaxHp} shape={p.shape}
        integrity={p.partyIntegrity} integrityState={p.partyIntegrityState} />
      {portraitRail('ally')}
      <Text testID="selected-squad-copy" style={[s.selectionCopy, { color: selectedCopy ? theme.colors.gold : theme.colors.textMuted }]} numberOfLines={2}>
        {selectedCopy ?? 'Shared army HP · Tap a portrait to locate its squad'}
      </Text>
      {ongoing && activeOrder ? <Text testID="active-battle-order-cue" style={[s.orderCue, { color: theme.colors.gold }]}>
        ORDER ACTIVE · {activeOrder.label}
      </Text> : null}
      <BattleStatusMarker effectType={p.status?.type ?? null} remaining={p.status?.remaining ?? 0} />
    </ScrollView>
    {!p.outcome && p.orders && p.orders.length > 0 ? (
      <View style={[s.orderBar, { backgroundColor: theme.colors.surface1, borderTopColor: theme.colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.orderContent}>
          {p.orders.map(order => (
            <Action
              key={order.id}
              label={order.cooldown > 0 ? order.label + ' · ' + order.cooldown : order.label}
              accessibilityLabel={order.accessibilityLabel}
              selected={order.selected}
              disabled={order.disabled || p.controlsLocked}
              onPress={order.onPress}
            />
          ))}
        </ScrollView>
      </View>
    ) : null}
    <View testID="battle-outcome-actions" style={[s.footer, layout.footerStacked && s.footerStack, {
      backgroundColor: theme.colors.surface1, borderTopColor: theme.colors.border
    }]}>
      <View style={s.footerCopy}>
        <Text style={[s.footerStatus, { color: p.outcome === 'defeat' ? theme.colors.danger : theme.colors.gold }]}>
          {p.outcome ? `${p.outcome.toUpperCase()} · ${p.turn} exchanges` : last ? `Dealt ${last.dealt} · Took ${last.taken}${last.healed ? ` · Healed ${last.healed}` : ''}` : 'Formation ready'}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Formation details" disabled={p.controlsLocked}
          onPress={() => setPanel('formation')} style={s.formationLink}>
          <Text style={[s.linkText, { color: theme.colors.textMuted }]}>{p.shape.layout} vs {p.enemyShape.layout} · Details</Text>
        </Pressable>
      </View>
      {p.outcome ? <Action label={p.outcome === 'defeat' ? 'View Defeat Report' : 'View Results'} selected onPress={p.onComplete} />
        : <Action label="Combat log" onPress={() => setPanel('log')} disabled={p.controlsLocked} />}
    </View>
    <Modal visible={panel !== null} transparent animationType="none" onRequestClose={() => setPanel(null)}>
      <View style={s.modalShade}><View accessibilityViewIsModal style={[s.sheet, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
        <View style={s.sheetHeading}><Text style={[s.sheetTitle, { color: theme.colors.gold }]}>
          {panel === 'log' ? 'Combat log' : panel === 'formation' ? 'Formation details' : selectedTitle ?? 'Squad'}
        </Text><Action label="Close" onPress={() => setPanel(null)} /></View>
        <ScrollView>
          {panel === 'log' ? <>
            <Text style={[s.detailText, { color: theme.colors.textMuted }]}>Totals for each army exchange—not individual unit damage.</Text>
            {!p.records.length ? <Text style={[s.detailText, { color: theme.colors.text }]}>{p.initialLog}</Text> : p.records.map(record => <View key={record.exchange} style={s.logEntry}>
              <Text style={[s.detailText, { color: theme.colors.text }]}><Text style={{ color: theme.colors.gold }}>#{record.exchange} </Text>
                Dealt <Text style={{ color: theme.colors.primary }}>{record.dealt}</Text> · Took <Text style={{ color: theme.colors.danger }}>{record.taken}</Text>
                {record.healed ? <Text style={{ color: theme.colors.primary }}> · Healed {record.healed}</Text> : null}
              </Text>{record.skill ? <Text style={[s.detailText, { color: theme.colors.gold }]}>{record.skill}</Text> : null}
            </View>)}
          </> : panel === 'formation' ? <>
            <Text style={[s.detailText, { color: theme.colors.text }]}>{p.shape.name} ({p.shape.layout}) vs {p.enemyShape.name} ({p.enemyShape.layout})</Text>
            <Text style={[s.detailText, { color: theme.colors.text }]}>{p.matchup}</Text>
            <Text style={[s.detailText, { color: theme.colors.textMuted }]}>F: Front · M: Middle · R: Rear. Both frontlines face the centre. Vacant or routed positions stay vacant.</Text>
            {p.effects.map(effect => <Text key={effect.key} style={[s.detailText, { color: effect.color }]}>{effect.label}</Text>)}
            <Text style={[s.detailText, { color: theme.colors.textMuted }]}>Change formation in Battle Prep, not during combat.</Text>
          </> : <>
            <Text style={[s.detailText, { color: theme.colors.text }]}>{selectedCopy}</Text>
            {selectedAlly ? <Text style={[s.detailText, { color: theme.colors.text }]}>{roleNames[selectedAlly.unit.role]} · Attack {selectedAlly.unit.attack} · Armor {selectedAlly.unit.armor} · Speed {selectedAlly.unit.speed}</Text> : null}
            <Text style={[s.detailText, { color: theme.colors.textMuted }]}>Health is shared by the army. Selecting a portrait does not move the squad or change its target.</Text>
          </>}
          {p.status ? <Text style={[s.detailText, { color: theme.colors.gold }]}>{p.status.type.replace(/_/g, ' ')} · {p.status.remaining} exchanges left</Text> : null}
        </ScrollView>
      </View></View>
    </Modal>
  </View>;
});

const s = StyleSheet.create({
  viewport: { flex: 1, minHeight: 0 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 8, paddingTop: 3, paddingBottom: 3, gap: 3 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 44 },
  headingCopy: { flex: 1, minWidth: 0 },
  encounterTitle: { fontSize: 17, lineHeight: 20, fontFamily: serif, fontWeight: '700' },
  subtitle: { fontSize: 9, lineHeight: 11, marginTop: 0 },
  threatHeading: { flexDirection: 'row', gap: 4, alignItems: 'center', minHeight: 12 },
  threatPip: { width: 5, height: 5, borderRadius: 1 },
  threatText: { fontSize: 8.2, lineHeight: 11, fontWeight: '900', letterSpacing: .7 },
  threatMark: { fontSize: 7, lineHeight: 10, letterSpacing: 2, fontWeight: '900' },
  railBossMark: { position: 'absolute', left: 0, top: 0, width: 13, height: 13, alignItems: 'center', justifyContent: 'center', borderBottomRightRadius: 4 },
  railBossText: { fontSize: 9, lineHeight: 11, color: '#101A23', fontWeight: '900' },
  bossInsignia: { position: 'absolute', top: -7, alignSelf: 'center', width: 14, height: 12, borderWidth: 1, backgroundColor: '#111820B8', alignItems: 'center', justifyContent: 'center', zIndex: 3, borderRadius: 2 },
  bossInsigniaGlyph: { fontSize: 8, lineHeight: 10, fontWeight: '900' },
  eliteUnderlay: { position: 'absolute', bottom: 0, width: '90%', height: 7, borderBottomWidth: 2, borderRadius: 40, opacity: .76 },
  hitSpark: { position: 'absolute', top: '28%', left: '28%', width: '44%', height: '44%', borderWidth: 1.5, borderRadius: 4, zIndex: 5, justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '45deg' }] },
  hitSparkCross: { width: '85%', height: 2, position: 'absolute' },
  hitSparkVertical: { transform: [{ rotate: '90deg' }] },
  action: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderBottomWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionLabel: { fontSize: 11, fontWeight: '800' },
  railContent: { gap: 4, paddingVertical: 1 },
  portraitCard: { borderWidth: 1, borderRadius: 6, padding: 2, alignItems: 'center', overflow: 'hidden', minHeight: 44 },
  portraitImage: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 3 },
  levelBadge: { position: 'absolute', bottom: 0, right: 0, fontSize: 9, fontWeight: '800', paddingHorizontal: 3, borderTopLeftRadius: 3 },
  portraitName: { fontSize: 10, lineHeight: 13, paddingTop: 1, textAlign: 'center', fontWeight: '700' },
  routedMark: { position: 'absolute', right: 1, top: 0, color: '#FFFFFF', backgroundColor: '#000000', fontSize: 16 },
  health: { gap: 2 },
  healthHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  healthName: { fontSize: 8.5, fontWeight: '900', letterSpacing: .3 },
  healthValue: { fontSize: 9.5, fontWeight: '800' },
  healthTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  healthReadout: { fontSize: 8.5, lineHeight: 11, fontWeight: '700', letterSpacing: .1 },
  integrityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 10 },
  integrityCopy: { fontSize: 8.5, lineHeight: 11, fontWeight: '900', minWidth: 96 },
  integrityTrack: { flex: 1, height: 3, overflow: 'hidden', borderRadius: 3 },
  stage: { alignSelf: 'center', borderWidth: 1.5, overflow: 'hidden', borderRadius: 8 },
  fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  guide: { position: 'absolute', left: 4, right: 4, borderTopWidth: .5, opacity: .24 },
  rankMark: { position: 'absolute', top: -7, left: 0, fontSize: 8 },
  engagement: { position: 'absolute', left: '22%', right: '22%', borderTopWidth: 1, opacity: .3 },
  orderFieldBand: { position: 'absolute', height: 16, borderTopWidth: 2,
    justifyContent: 'center', alignItems: 'center', zIndex: 3 },
  orderFieldLabel: { fontSize: 8, fontWeight: '900', lineHeight: 11,
    paddingHorizontal: 4, letterSpacing: .4 },
  lineFracture: { position: 'absolute', borderTopWidth: 2, borderStyle: 'dashed' },
  facingMark: { position: 'absolute', width: 13, height: 11, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  allyFacing: { top: -7 },
  enemyFacing: { bottom: -8 },
  facingGlyph: { fontSize: 9, lineHeight: 11, fontWeight: '900' },
  attackTrail: { position: 'absolute', width: 14, height: 20, zIndex: 4, alignItems: 'center' },
  projectileTip: { width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4,
    borderBottomWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  projectileStem: { width: 2, height: 13 },
  chargeStreak: { position: 'absolute', top: 1, left: 5, width: 4, height: 17, transform: [{ rotate: '20deg' }] },
  chargeStreakShort: { position: 'absolute', top: 5, left: 1, width: 3, height: 10, transform: [{ rotate: '-20deg' }] },
  frontlineImpact: { position: 'absolute', left: '34%', width: '32%', height: 5, borderTopWidth: 2, borderRadius: 10, zIndex: 35 },
  actor: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  shadow: { position: 'absolute', bottom: 0, borderRadius: 12 },
  roleMarker: { position: 'absolute', bottom: -2, right: -2, minWidth: 12, height: 12, borderWidth: 1, borderRadius: 3,
    backgroundColor: '#101B24EB', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  roleMarkerText: { color: '#FFFFFF', fontSize: 8, lineHeight: 10, fontWeight: '900' },
  bossGround: { position: 'absolute', bottom: -3, width: '96%', height: 15, borderWidth: 2, borderRadius: 40, zIndex: 0 },
  targetLock: { position: 'absolute', left: 0, right: 0, bottom: -4, height: 12, borderWidth: 1.5,
    borderRadius: 40, backgroundColor: '#101B2420' },
  activeUnderline: { position: 'absolute', bottom: 0, height: 2, width: '80%', borderRadius: 2 },
  impactRing: { position: 'absolute', left: -3, right: -3, bottom: -3, height: 12, borderWidth: 1.5, borderRadius: 99 },
  selectionFrame: { position: 'absolute', left: -2, right: -2, bottom: -2, height: 10, borderWidth: 1.5, borderRadius: 99 },
  vfx: { position: 'absolute', alignSelf: 'center', zIndex: 50 },
  pauseOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center' },
  pauseCopy: { color: '#F3C461', fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  selectionCopy: { fontSize: 9, lineHeight: 12, textAlign: 'center', minHeight: 12 },
  orderCue: { fontSize: 9, lineHeight: 12, textAlign: 'center', fontWeight: '900', letterSpacing: .7 },
  orderBar: { flexShrink: 0, borderTopWidth: 1, paddingVertical: 2 },
  orderContent: { gap: 5, paddingHorizontal: 6 },
  footer: { flexShrink: 0, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 3 },
  footerStack: { flexDirection: 'column', alignItems: 'stretch' },
  footerCopy: { flex: 1, minWidth: 0 },
  footerStatus: { fontSize: 9.5, lineHeight: 12, fontWeight: '900' },
  formationLink: { minHeight: 44, justifyContent: 'center' },
  linkText: { fontSize: 9, lineHeight: 11 },
  modalShade: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'center', padding: 12 },
  sheet: { maxHeight: '80%', borderRadius: 10, borderWidth: 1, padding: 10 },
  sheetHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7, marginBottom: 6 },
  sheetTitle: { flex: 1, fontSize: 15.5, fontFamily: serif, fontWeight: '700' },
  detailText: { fontSize: 11, lineHeight: 16, marginVertical: 3 },
  logEntry: { marginVertical: 3 }
});
