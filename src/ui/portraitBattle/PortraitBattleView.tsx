import React, { memo, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { EnemyFantasyThreatFamily, FactionId, FormationShapeDefinition, UnitDefinition, UnitRole } from '../../game/types';
import type { EncounterId, EnemyArmyProfileId } from '../../game/encounters';
import { useGameTheme } from '../../theme/ThemeProvider';
import { EnemySprite, UnitSprite } from '../gameArt';
import { BattlefieldBackdrop, BattleStatusMarker, BattleVfxStrip, EnemyFantasyThreatAura, getBattlefieldScene } from '../battleVisuals';
import type { CommanderSkillEffectType } from '../../game/types';
import { ReferenceArt } from './Art';
import { allyPortrait, battleLayout, enemyPortrait, figureForPortrait, healthFraction, roleNames, rosterForFormation, stageTokens, usesGreenkeepArtwork } from './model';
import type { EnemyToken, ExchangeRecord } from './model';

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
  onToggleSpeed: () => void; onTogglePause: () => void; onComplete: () => void;
};

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

function Action({ label, onPress, selected = false, disabled = false, accessibilityLabel }: {
  label: string; onPress: () => void; selected?: boolean; disabled?: boolean; accessibilityLabel?: string;
}) {
  const { theme } = useGameTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}
    accessibilityState={{ disabled, selected }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.action, { backgroundColor: theme.colors.surface1,
      borderColor: selected ? theme.colors.gold : theme.colors.border, opacity: disabled ? .5 : pressed ? .7 : 1 }]}>
    <Text style={[s.actionLabel, { color: selected ? theme.colors.gold : theme.colors.text }]}>{label}</Text>
  </Pressable>;
}

function Health({ label, hp, max, enemy = false }: { label: string; hp: number; max: number; enemy?: boolean }) {
  const { theme } = useGameTheme(); const fill = enemy ? theme.colors.danger : theme.colors.primary;
  return <View style={s.health} accessible accessibilityLabel={`${label}: ${hp} of ${max} shared army HP`}>
    <View style={s.healthHeading}><Text style={[s.healthName, { color: fill }]}>{label}</Text>
      <Text style={[s.healthValue, { color: theme.colors.text }]}>{hp} / {max}</Text></View>
    <View style={[s.healthTrack, { backgroundColor: theme.colors.surface3 }]}>
      <View style={{ width: `${healthFraction(hp, max) * 100}%`, height: 5, backgroundColor: fill, borderRadius: 3 }} />
    </View>
  </View>;
}

export const PortraitBattleView = memo(function PortraitBattleView(p: PortraitBattleProps) {
  const { theme } = useGameTheme();
  const { width, height, fontScale } = useWindowDimensions();
  const layout = battleLayout(width, height, fontScale);
  const [details, setDetails] = useState(false);
  const roster = rosterForFormation(p.formation, p.units);
  const scene = getBattlefieldScene(p.encounterId, p.faction);
  const illustrated = usesGreenkeepArtwork(scene.id, p.faction);
  const allyColor = p.faction === 'elf' ? theme.colors.elf : p.faction === 'orc' ? theme.colors.orc : theme.colors.human;
  const stageH = layout.stageHeight;
  const groundH = stageH * .68;
  const allyPositions = stageTokens(p.shape, roster.map(item => item.slot), 'ally', layout.stageWidth, groundH);
  const enemyPositions = stageTokens(p.enemyShape, p.enemies.map(item => item.slot), 'enemy', layout.stageWidth, groundH);
  const ongoing = !p.outcome;

  function enemyFigure(item: EnemyToken, size: number) {
    const portrait = enemyPortrait(item.role, p.enemyProfile, p.enemyName, item.boss, p.fantasyThreat);
    if (portrait) return <ReferenceArt art={figureForPortrait(portrait)} width={size}
      fallback={<EnemySprite enemyName={item.label} armyProfileId={p.enemyProfile} fantasyThreat={p.fantasyThreat} role={item.role} size={size} />} />;
    if (!p.fantasyThreat && !item.boss && item.role === 'cavalry' && /warg/i.test(p.enemyName)) {
      return <UnitSprite className="Warg Rider" faction="orc" size={size} />;
    }
    const visualProfile = item.boss ? p.enemyProfile : item.role === 'ranged' ? 'missile_company'
      : item.role === 'cavalry' ? 'mounted_hunters' : item.role === 'support' ? 'warded_host' : p.enemyProfile;
    return <EnemySprite enemyName={item.boss ? p.enemyName : item.label} armyProfileId={visualProfile} fantasyThreat={p.fantasyThreat} role={item.role} size={size} />;
  }

  function portraitRail(enemy: boolean) {
    const cards = enemy ? p.enemies.map(item => {
      const art = enemyPortrait(item.role, p.enemyProfile, p.enemyName, item.boss, p.fantasyThreat);
      return { id: 'enemy-' + item.slot, title: item.boss ? p.enemyName : item.label,
        subtitle: item.down ? 'Routed' : item.boss ? 'BOSS' : roleNames[item.role],
        art, active: ongoing && item.slot === p.enemySlot, down: item.down,
        fallback: enemyFigure(item, layout.portraitSize * .8) };
    }) : roster.map(({ slot, unit }) => ({ id: 'ally-' + slot, title: unit.className,
      subtitle: `Lv. ${unit.level} · ${roleNames[unit.role]}`,
      art: allyPortrait(unit), active: ongoing && (p.activeSlot === slot || p.supportSlots.includes(slot)), down: false,
      fallback: <UnitSprite className={unit.className} faction={unit.faction} size={layout.portraitSize * .8} /> }));
    return <ScrollView horizontal={layout.stacked} nestedScrollEnabled showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={layout.stacked} style={layout.stacked ? s.horizontalRail : { width: layout.railWidth, height: stageH }}
      contentContainerStyle={[s.railContent, layout.stacked && s.horizontalRailContent]}
      accessibilityLabel={enemy ? 'Enemy portraits' : 'Your squad portraits'}>
      {cards.map(card => <View key={card.id} accessible accessibilityLabel={`${card.title}, ${card.subtitle}${card.active ? ', highlighted this exchange' : ''}`}
        style={[s.portraitCard, { width: layout.railWidth, borderColor: card.active ? theme.colors.gold : theme.colors.border,
          backgroundColor: theme.colors.appBg, opacity: card.down ? .42 : 1 }]}>
        <View style={[s.portraitImage, { backgroundColor: theme.colors.surface1, height: layout.portraitSize }]}>
          {card.art ? <ReferenceArt key={card.art} art={card.art} width={layout.portraitSize} fallback={card.fallback} /> : card.fallback}
        </View>
        <Text style={[s.portraitName, { color: theme.colors.text }]} numberOfLines={2}>{card.title}</Text>
        <Text style={[s.portraitMeta, { color: card.active ? theme.colors.gold : enemy ? theme.colors.danger : allyColor }]} numberOfLines={2}>{card.subtitle}</Text>
      </View>)}
    </ScrollView>;
  }

  const battlefield = <View testID="portrait-battle-stage" style={[s.stage, { width: layout.stageWidth, height: stageH,
    backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
    {illustrated ? <View pointerEvents="none" accessible={false} style={s.fill}>
      <ReferenceArt art="greenkeep_sky" width={layout.stageWidth} height={stageH * .45} />
      <View style={{ position: 'absolute', bottom: 0, height: stageH * .59, overflow: 'hidden' }}>
        {Array.from({ length: Math.min(8, Math.ceil(stageH * .59 / (layout.stageWidth * 57 / 240))) }, (_, index) =>
          <View key={index} style={{ transform: [{ scaleY: index % 2 ? -1 : 1 }] }}>
            <ReferenceArt art="greenkeep_ground" width={layout.stageWidth} height={layout.stageWidth * 57 / 240} />
          </View>)}
      </View>
      <View style={[s.groundShade, { backgroundColor: '#000000', opacity: theme.dark ? .15 : .06 }]} />
    </View> : <BattlefieldBackdrop encounterId={p.encounterId} faction={p.faction} difficulty={p.difficulty} compact={layout.stageWidth < 220} />}
    <EnemyFantasyThreatAura fantasyThreat={p.fantasyThreat} compact={layout.stageWidth < 220} />
    <View pointerEvents="none" style={s.stageTitle}>
      <Text style={s.sceneName}>{scene.label}</Text>
      {p.difficulty !== 'Normal' ? <Text style={[s.sceneDifficulty, { color: theme.colors.gold }]}>{p.difficulty.toUpperCase()}</Text> : null}
    </View>
    <View pointerEvents="none" style={[s.troopGround, { height: groundH }]}>
      {allyPositions.map(position => {
        const item = roster.find(candidate => candidate.slot === position.slot)!;
        const active = ongoing && position.slot === p.activeSlot;
        const support = ongoing && p.supportSlots.includes(position.slot);
        return <Animated.View key={'ally-' + position.slot}
          style={[s.actor, { left: position.x - position.size / 2, top: position.y - position.size / 2,
            width: position.size, height: position.size,
            transform: [{ translateX: active ? p.attackPulse.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) : 0 }] }]}>
          <View style={[s.shadow, { backgroundColor: active ? theme.colors.gold : support ? theme.colors.primary : '#000000', opacity: active || support ? .65 : .45 }]} />
          {allyPortrait(item.unit) ? <ReferenceArt art={figureForPortrait(allyPortrait(item.unit)!)} width={position.size}
            fallback={<UnitSprite className={item.unit.className} faction={item.unit.faction} size={position.size} />} />
            : <UnitSprite className={item.unit.className} faction={item.unit.faction} size={position.size} />}
          {active || support ? <View style={[s.activeUnderline, { backgroundColor: support ? theme.colors.primary : theme.colors.gold }]} /> : null}
        </Animated.View>;
      })}
      {enemyPositions.map(position => {
        const item = p.enemies.find(candidate => candidate.slot === position.slot)!;
        const targeted = ongoing && !item.down && p.enemySlot === item.slot;
        return <Animated.View key={'enemy-' + position.slot} style={[s.actor, {
          left: position.x - position.size / 2, top: position.y - position.size / 2,
          width: position.size, height: position.size, opacity: item.down ? .18 : 1,
          transform: [{ translateX: targeted ? p.impactPulse.interpolate({ inputRange: [0, .5, 1], outputRange: [0, 3, -2] }) : 0 }] }]}>
          <View style={[s.shadow, { backgroundColor: '#000000', opacity: .5 }]} />
          {enemyFigure(item, position.size)}
          {targeted ? <View style={[s.activeUnderline, { backgroundColor: theme.colors.danger }]} /> : null}
        </Animated.View>;
      })}
    </View>
    <View pointerEvents="none" style={s.vfx}>
      <BattleVfxStrip role={p.activeRole} healed={p.healed} progress={p.attackPulse} />
    </View>
    {p.paused && !p.outcome ? <View pointerEvents="none" style={s.pauseOverlay}><Text style={s.pauseCopy}>PAUSED</Text></View> : null}
  </View>;

  return <View style={[s.viewport, { backgroundColor: theme.colors.appBg }]} testID="portrait-battle-view">
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.heading}>
        <View style={s.headingCopy}>
          <Text style={[s.encounterTitle, { color: theme.colors.text }]} numberOfLines={2}>{p.encounterName}</Text>
          <Text style={[s.subtitle, { color: theme.colors.textMuted }]}>{p.outcome ? p.outcome.toUpperCase() : p.paused ? 'Paused' : `Exchange ${p.turn + 1}`} · Auto battle</Text>
        </View>
        <Action label={`${p.speed}×`} accessibilityLabel={`Battle speed ${p.speed} times`} selected={p.speed === 2}
          disabled={!!p.outcome} onPress={p.onToggleSpeed} />
        <Action label={p.paused ? '▶' : 'Ⅱ'} accessibilityLabel={p.paused ? 'Resume battle' : 'Pause battle'}
          disabled={!!p.outcome || p.controlsLocked} onPress={p.onTogglePause} />
      </View>
      <View style={s.healthRow}>
        <Health label="YOUR ARMY" hp={p.partyHp} max={p.partyMaxHp} />
        <Health label="ENEMY ARMY" hp={p.enemyHp} max={p.enemyMaxHp} enemy />
      </View>
      <Text style={[s.sharedLabel, { color: theme.colors.textMuted }]}>Shared army health · Portraits show squad identity</Text>
      <View style={[s.battleRow, layout.stacked && s.battleStack]}>
        {portraitRail(false)}{battlefield}{portraitRail(true)}
      </View>
      <BattleStatusMarker effectType={p.status?.type ?? null} remaining={p.status?.remaining ?? 0} />
      <View style={s.reportRow}>
        <View style={[s.logPanel, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface1 }]}>
          <Text style={[s.sectionHeading, { color: theme.colors.textMuted }]}>COMBAT LOG</Text>
          <Text style={[s.logContext, { color: theme.colors.textMuted }]}>Totals for each army exchange</Text>
          {!p.records.length ? <Text style={[s.logText, { color: theme.colors.text }]}>{p.initialLog}</Text> :
            p.records.slice(-3).map(record => <View key={record.exchange} style={s.logEntry}>
              <Text style={[s.logText, { color: theme.colors.text }]}>
                <Text style={{ color: theme.colors.gold }}>#{record.exchange} </Text>
                Dealt <Text style={{ color: theme.colors.primary }}>{record.dealt}</Text>
                {' · Took '}<Text style={{ color: theme.colors.danger }}>{record.taken}</Text>
                {record.healed > 0 ? <Text style={{ color: theme.colors.primary }}>{` · Healed ${record.healed}`}</Text> : null}
              </Text>
              {record.skill ? <Text style={[s.skillText, { color: theme.colors.gold }]}>{record.skill}</Text> : null}
            </View>)}
        </View>
        {!layout.stacked && illustrated ? <View style={[s.locationPanel, { width: layout.railWidth + 10, borderColor: theme.colors.border }]}>
          <ReferenceArt art="greenkeep_location" width={layout.railWidth} height={Math.round(layout.railWidth * .57)} />
          <Text style={[s.locationName, { color: theme.colors.text }]}>Greenkeep Road</Text>
          <Text style={[s.locationCopy, { color: theme.colors.textMuted }]}>The road to your kingdom.</Text>
        </View> : null}
      </View>
      <Pressable onPress={() => setDetails(value => !value)} accessibilityRole="button" accessibilityState={{ expanded: details }} style={s.detailsToggle}>
        <Text style={[s.detailsToggleText, { color: theme.colors.gold }]}>{details ? 'Hide formation & effects' : 'Formation & effects'}</Text>
        <Text style={{ color: theme.colors.textMuted }}>{details ? '−' : '+'}</Text>
      </Pressable>
      {details ? <View style={[s.details, { backgroundColor: theme.colors.surface1 }]}>
        <Text style={[s.detailText, { color: theme.colors.text }]}>{p.shape.layout} {p.shape.name} vs {p.enemyShape.layout} {p.enemyShape.name}</Text>
        <Text style={[s.detailText, { color: theme.colors.textMuted }]}>{p.matchup}</Text>
        {p.effects.map(effect => <Text key={effect.key} style={[s.detailText, { color: effect.color }]}>{effect.label}</Text>)}
        {p.status ? <Text style={[s.detailText, { color: theme.colors.gold }]}>{p.status.type.replace(/_/g, ' ')} · {p.status.remaining} exchanges remaining</Text> : null}
        <Text style={[s.detailText, { color: theme.colors.textMuted }]}>This battlefield is a visual line-up of your deployed squads, not an editable formation grid. The saved formation above determines counters. Highlights indicate the lead squad; damage is calculated for the whole army.</Text>
      </View> : null}
    </ScrollView>
    <View testID="battle-outcome-actions" style={[s.footer, layout.stacked && { flexDirection: 'column', alignItems: 'stretch' }, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.appBg }]}>
      <View style={s.footerCopy}><Text style={[s.footerStatus, { color: p.outcome === 'defeat' ? theme.colors.danger : p.outcome ? theme.colors.primary : theme.colors.gold }]}>
        {p.outcome === 'victory' ? 'VICTORY' : p.outcome === 'defeat' ? 'DEFEAT' : p.paused ? 'PAUSED' : 'AUTO BATTLE'}</Text>
        <Text style={[s.footerHint, { color: theme.colors.textMuted }]}>{p.outcome ? `${p.turn} exchanges` : 'Formation fights automatically'}</Text></View>
      <Action label={p.outcome === 'defeat' ? 'View Defeat Report' : p.outcome === 'victory' ? 'View Results' : 'Battle in progress'} selected={!!p.outcome} disabled={!p.outcome} onPress={p.onComplete} />
    </View>
  </View>;
});

const s = StyleSheet.create({
  viewport: { flex: 1, minHeight: 0 }, scroll: { flex: 1 }, content: { padding: 12, paddingBottom: 8, gap: 8 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 7 }, headingCopy: { flex: 1, minWidth: 0 },
  encounterTitle: { fontSize: 21, fontFamily: serif, fontWeight: '700' }, subtitle: { fontSize: 11, marginTop: 3 },
  action: { minHeight: 44, minWidth: 44, paddingHorizontal: 12, borderWidth: 1, borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '700' }, healthRow: { flexDirection: 'row', gap: 14, marginTop: 2 }, health: { flex: 1 },
  healthHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, marginBottom: 4 }, healthName: { fontSize: 9, fontWeight: '800', letterSpacing: .5 },
  healthValue: { fontSize: 10, fontWeight: '700' }, healthTrack: { height: 5, borderRadius: 3, overflow: 'hidden' }, sharedLabel: { fontSize: 9, textAlign: 'center', marginTop: -3 },
  battleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 4 }, battleStack: { flexDirection: 'column', alignItems: 'center' },
  railContent: { gap: 7, paddingBottom: 2 }, horizontalRail: { width: '100%', flexGrow: 0 }, horizontalRailContent: { flexDirection: 'row', gap: 6 },
  portraitCard: { borderWidth: 1, borderRadius: 5, padding: 4, overflow: 'hidden' }, portraitImage: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  portraitName: { fontSize: 12, fontFamily: serif, marginTop: 4 }, portraitMeta: { fontSize: 9, lineHeight: 13, marginTop: 2 },
  stage: { borderWidth: 1, overflow: 'hidden', borderRadius: 4 }, fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  groundShade: { position: 'absolute', top: '41%', left: 0, right: 0, bottom: 0 }, stageTitle: { position: 'absolute', left: 4, right: 4, top: 7, alignItems: 'center' },
  sceneName: { fontSize: 8, color: '#F3E5C7', fontWeight: '800', letterSpacing: .6, backgroundColor: '#00000088', padding: 3, textAlign: 'center' },
  sceneDifficulty: { fontSize: 10, fontWeight: '900', paddingTop: 3 }, troopGround: { position: 'absolute', left: 0, right: 0, bottom: 10 },
  actor: { position: 'absolute', justifyContent: 'center', alignItems: 'center' }, shadow: { position: 'absolute', bottom: 2, width: '72%', height: 6, borderRadius: 8 },
  activeUnderline: { position: 'absolute', bottom: 0, height: 2, width: '70%', borderRadius: 2 },
  vfx: { position: 'absolute', alignSelf: 'center', top: '57%' }, pauseOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center' },
  pauseCopy: { color: '#F3C461', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  reportRow: { flexDirection: 'row', gap: 7 }, logPanel: { flex: 1, borderWidth: 1, borderRadius: 5, padding: 9 }, sectionHeading: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  logContext: { fontSize: 9, marginTop: 2, marginBottom: 4 }, logText: { fontSize: 12, lineHeight: 18 }, logEntry: { marginTop: 3 }, skillText: { fontSize: 10, lineHeight: 14 },
  locationPanel: { borderWidth: 1, borderRadius: 5, padding: 4 }, locationName: { fontFamily: serif, fontSize: 12, marginTop: 4 }, locationCopy: { fontSize: 10, lineHeight: 14, marginTop: 4 },
  detailsToggle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }, detailsToggleText: { fontSize: 12, fontWeight: '700' },
  details: { padding: 10, borderRadius: 5, gap: 6 }, detailText: { fontSize: 11, lineHeight: 16 },
  footer: { borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  footerCopy: { flex: 1, minWidth: 0 }, footerStatus: { fontSize: 11, fontWeight: '800', letterSpacing: 1 }, footerHint: { fontSize: 9, marginTop: 3 }
});
