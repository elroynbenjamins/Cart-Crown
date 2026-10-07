import React, { memo, useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { CommanderSkillEffectType, EnemyFantasyThreatFamily, FactionId, FormationShapeDefinition, UnitDefinition, UnitRole } from '../../game/types';
import type { EncounterId, EnemyArmyProfileId } from '../../game/encounters';
import { useGameTheme } from '../../theme/ThemeProvider';
import { EnemySprite, UnitSprite } from '../gameArt';
import { BattleStatusMarker, BattleVfxStrip, EnemyFantasyStrikeVfx, EnemyFantasyThreatAura } from '../battleVisuals';
import { IllustratedBattlefieldBackdrop } from './IllustratedBattlefieldBackdrop';
import { ReferenceArt } from './Art';
import { allyPortrait, battleLayout, enemyPortrait, figureForPortrait, healthFraction, rankForSlot, rankLabels, roleNames, rosterForFormation, stageDepthVisual, stageExchangeMotion, stageTokens } from './model';
import type { ArmySide, EnemyToken, ExchangeRecord } from './model';

export type PortraitBattleProps = {
  encounterId: EncounterId; encounterName: string; enemyName: string;
  difficulty: 'Normal' | 'Elite' | 'Boss'; faction: FactionId;
  enemyProfile: EnemyArmyProfileId; fantasyThreat?: EnemyFantasyThreatFamily;
  formation: readonly (string | null)[]; units: readonly UnitDefinition[];
  shape: FormationShapeDefinition; enemyShape: FormationShapeDefinition;
  enemies: readonly EnemyToken[];
  partyHp: number; partyMaxHp: number; enemyHp: number; enemyMaxHp: number;
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

function Health({ label, hp, max, formation, enemy = false }: { label: string; hp: number; max: number; formation: string; enemy?: boolean }) {
  const { theme } = useGameTheme();
  const fill = enemy ? theme.colors.danger : theme.colors.primary;
  return <View accessible accessibilityLabel={`${label}: ${hp} of ${max} shared army HP; formation ${formation}`} style={s.health}>
    <View style={s.healthHeading}>
      <Text style={[s.healthName, { color: fill }]}>{label} · {formation}</Text>
      <Text style={[s.healthValue, { color: theme.colors.text }]}>{hp} / {max}</Text>
    </View>
    <View style={[s.healthTrack, { backgroundColor: theme.colors.surface3 }]}>
      <View style={{ width: `${healthFraction(hp, max) * 100}%`, height: 4, backgroundColor: fill }} />
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
  const allyPositions = stageTokens(p.shape, roster.map(item => item.slot), 'ally', layout.stageWidth, layout.stageHeight);
  // Include routed enemies; their spots must not be recycled or compressed.
  const enemyPositions = stageTokens(p.enemyShape, p.enemies.map(item => item.slot), 'enemy', layout.stageWidth, layout.stageHeight);
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
      slot: item.slot, level: null as number | null, title: item.boss ? p.enemyName : item.label,
      detail: `${roleNames[item.role]} · ${rankCopy(p.enemyShape, item.slot)}`,
      art: enemyPortrait(item.role, p.enemyProfile, p.enemyName, item.boss, p.fantasyThreat),
      active: ongoing && !item.down && item.slot === p.enemySlot, down: item.down,
      fallback: enemyFigure(item, layout.portraitSize)
    })) : roster.map(({ slot, unit }) => ({
      slot, level: unit.level, title: unit.className, detail: `Lv. ${unit.level} · ${roleNames[unit.role]} · ${rankCopy(p.shape, slot)}`,
      art: allyPortrait(unit), active: ongoing && (p.activeSlot === slot || p.supportSlots.includes(slot)), down: false,
      fallback: <UnitSprite preferHumanArt={false} className={unit.className} faction={unit.faction} size={layout.portraitSize} />
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
          {allyPortrait(item.unit) ? <ReferenceArt art={figureForPortrait(allyPortrait(item.unit)!)} width={position.size}
            fallback={<UnitSprite preferHumanArt={false} className={item.unit.className} faction={item.unit.faction} size={position.size} />} />
            : <UnitSprite preferHumanArt={false} className={item.unit.className} faction={item.unit.faction} size={position.size} />}
          {active || support || chosen ? <View style={[s.activeUnderline, { backgroundColor: chosen ? theme.colors.gold : support ? theme.colors.primary : theme.colors.human }]} /> : null}
          {chosen ? <View style={[s.selectionFrame, { borderColor: theme.colors.gold }]} /> : null}
        </Animated.View>;
      })}
      {enemyPositions.map(position => {
        const item = p.enemies.find(candidate => candidate.slot === position.slot)!;
        const targeted = ongoing && !item.down && p.enemySlot === item.slot;
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
          {targeted ? <Animated.View style={[s.impactRing, {
            borderColor: theme.colors.danger,
            opacity: moving ? p.impactPulse : 0,
            transform: [{ scale: moving ? p.impactPulse.interpolate({ inputRange: [0, 1], outputRange: [.78, 1.08] }) : 1 }]
          }]} /> : null}
          {enemyFigure(item, position.size)}
          {targeted || chosen ? <View style={[s.activeUnderline, { backgroundColor: chosen ? theme.colors.gold : theme.colors.danger }]} /> : null}
          {chosen ? <View style={[s.selectionFrame, { borderColor: theme.colors.gold }]} /> : null}
        </Animated.View>;
      })}
      {moving ? <View style={[s.vfx, { top: layout.stageHeight * .5 - 17 }]}>
        <View style={{ transform: [{ scaleY: -1 }] }}><BattleVfxStrip role={p.activeRole} healed={p.healed} progress={p.attackPulse} /></View>
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
      <Health label="ENEMY ARMY" hp={p.enemyHp} max={p.enemyMaxHp} formation={p.enemyShape.layout} enemy />
      {battlefield}
      <Health label="YOUR ARMY" hp={p.partyHp} max={p.partyMaxHp} formation={p.shape.layout} />
      {portraitRail('ally')}
      <Text testID="selected-squad-copy" style={[s.selectionCopy, { color: selectedCopy ? theme.colors.gold : theme.colors.textMuted }]} numberOfLines={2}>
        {selectedCopy ?? 'Shared army HP · Tap a portrait to locate its squad'}
      </Text>
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
  stage: { alignSelf: 'center', borderWidth: 1.5, overflow: 'hidden', borderRadius: 8 },
  fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  guide: { position: 'absolute', left: 4, right: 4, borderTopWidth: .5, opacity: .24 },
  rankMark: { position: 'absolute', top: -7, left: 0, fontSize: 8 },
  engagement: { position: 'absolute', left: '22%', right: '22%', borderTopWidth: 1, opacity: .3 },
  actor: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  shadow: { position: 'absolute', bottom: 0, borderRadius: 12 },
  activeUnderline: { position: 'absolute', bottom: 0, height: 2, width: '80%', borderRadius: 2 },
  impactRing: { position: 'absolute', left: -3, right: -3, bottom: -3, height: 12, borderWidth: 1.5, borderRadius: 99 },
  selectionFrame: { position: 'absolute', left: -2, right: -2, bottom: -2, height: 10, borderWidth: 1.5, borderRadius: 99 },
  vfx: { position: 'absolute', alignSelf: 'center', zIndex: 50 },
  pauseOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center' },
  pauseCopy: { color: '#F3C461', fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  selectionCopy: { fontSize: 9, lineHeight: 12, textAlign: 'center', minHeight: 12 },
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
