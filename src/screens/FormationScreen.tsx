import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, SectionTitle, UnitPortrait } from '../ui/components';
import { UnitSprite } from '../ui/gameArt';

const rowNotes = {
  front: '+Armor / threat',
  middle: 'Flexible / reserve',
  rear: 'Ranged / support'
} as const;

export function FormationScreen() {
  const { theme } = useGameTheme();
  const {
    units,
    formation,
    activeFaction,
    activeSquadCap,
    formationShapeId,
    formationShapes,
    activeFormationShape,
    formationDoctrineId,
    formationDoctrines,
    formationBonuses,
    setFormationShape,
    setFormationDoctrine,
    moveFormationUnit,
    currentWagonStage
  } = useGame();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const activeCount = formation.filter(Boolean).length;
  const faction = factions[activeFaction];
  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const unlockedAtStage = (unlock: string) => {
    if (unlock === 'Start') return true;
    if (unlock === 'Settlement') return currentWagonStage.id !== 'camp';
    if (unlock === 'Fort') {
      return ['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
    }
    if (unlock === 'Town') {
      return ['town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
    }
    if (unlock === 'Stronghold') {
      return ['stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
    }
    return false;
  };

  const handleSlot = (slot: number, unitId: string | null) => {
    if (selectedUnitId) {
      if (unitId === selectedUnitId) {
        setSelectedUnitId(null);
        return;
      }
      if (moveFormationUnit(selectedUnitId, slot)) {
        setSelectedUnitId(null);
      }
      return;
    }

    if (unitId) {
      setSelectedUnitId(unitId);
    }
  };

  const rows = [
    { key: 'front' as const, label: 'FRONT', slots: activeFormationShape.rows.front },
    { key: 'middle' as const, label: 'MIDDLE', slots: activeFormationShape.rows.middle },
    { key: 'rear' as const, label: 'REAR', slots: activeFormationShape.rows.rear }
  ];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={factionAccent} faction={activeFaction}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCopy}>
            <Text style={[styles.eyebrow, { color: factionAccent }]}>
              {activeFormationShape.layout} FORMATION
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {activeFormationShape.name} · {formationDoctrines.find(d => d.id === formationDoctrineId)?.name ?? faction.mechanicName}
            </Text>
          </View>
          <Pill label={String(activeCount) + ' / ' + String(activeSquadCap) + ' squads'} />
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          {activeFormationShape.summary}
        </Text>
      </GameCard>

      <SectionTitle title="Formation shape" trailing="9 positions · max 6 squads" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shapeStrip}
      >
        {formationShapes.map(shape => {
          const selected = shape.id === formationShapeId;
          const unlocked = unlockedAtStage(shape.unlock);

          return (
            <Pressable
              key={shape.id}
              disabled={!unlocked}
              onPress={() => setFormationShape(shape.id)}
              style={({ pressed }) => [
                styles.shapeCard,
                {
                  borderColor: selected ? theme.colors.gold : theme.colors.border,
                  backgroundColor: selected ? theme.colors.surface1 : theme.colors.surface2,
                  opacity: !unlocked ? 0.44 : pressed ? 0.82 : 1
                }
              ]}
            >
              <View style={styles.shapeTop}>
                <Text style={[styles.shapeLayout, { color: selected ? theme.colors.gold : factionAccent }]}>
                  {shape.layout}
                </Text>
                <Text style={[styles.shapeUnlock, { color: theme.colors.textMuted }]}>
                  {selected ? 'ACTIVE' : unlocked ? shape.unlock.toUpperCase() : 'LOCKED · ' + shape.unlock.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.shapeName, { color: theme.colors.text }]}>{shape.name}</Text>
              <Text style={[styles.shapeMeta, { color: theme.colors.textMuted }]} numberOfLines={2}>
                {shape.strength}
              </Text>
              <Text style={[styles.shapeRisk, { color: theme.colors.textMuted }]} numberOfLines={2}>
                Risk: {shape.risk}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionTitle title="Battle positions" trailing={activeFormationShape.layout} />

      <View style={styles.board}>
        {rows.map(row => {
          const dense = row.slots.length >= 5;

          return (
            <View key={row.key} style={styles.rowGroup}>
              <View style={styles.rowHeading}>
                <Text style={[styles.rowLabel, { color: theme.colors.textMuted }]}>{row.label}</Text>
                <Text style={[styles.rowNote, { color: theme.colors.textMuted }]}>
                  {rowNotes[row.key]} · {row.slots.length} slots
                </Text>
              </View>
              <View style={styles.boardRow}>
                {row.slots.map(slot => {
                  const unitId = formation[slot] ?? null;
                  const unit = units.find(candidate => candidate.id === unitId);
                  const selected = Boolean(unit && selectedUnitId === unit.id);

                  return (
                    <Pressable
                      key={slot}
                      onPress={() => handleSlot(slot, unitId)}
                      style={[
                        styles.slot,
                        dense && styles.slotDense,
                        {
                          backgroundColor: unit ? theme.colors.surface1 : theme.colors.surface2,
                          borderColor: selected
                            ? theme.colors.gold
                            : unit
                              ? factionAccent
                              : theme.colors.border
                        }
                      ]}
                    >
                      <Text style={[styles.slotNumber, { color: theme.colors.textMuted }]}>
                        {slot + 1}
                      </Text>
                      {unit ? (
                        <>
                          <View
                            style={[
                              styles.slotPortrait,
                              dense && styles.slotPortraitDense,
                              { borderColor: factionAccent }
                            ]}
                          >
                            <UnitSprite
                              className={unit.className}
                              faction={unit.faction}
                              size={dense ? 29 : 36}
                            />
                          </View>
                          <Text
                            style={[
                              styles.slotName,
                              dense && styles.slotNameDense,
                              { color: theme.colors.text }
                            ]}
                            numberOfLines={1}
                          >
                            {unit.name}
                          </Text>
                          {!dense ? (
                            <Text
                              style={[styles.slotClass, { color: theme.colors.textMuted }]}
                              numberOfLines={1}
                            >
                              {unit.className}
                            </Text>
                          ) : null}
                        </>
                      ) : (
                        <Text style={[styles.emptyLabel, { color: theme.colors.textMuted }]}>Empty</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      <Text style={[styles.interactionHint, { color: theme.colors.textMuted }]}>
        Tap a squad, then tap any visible position to move or swap it. Changing shape changes which positions belong to the front, middle and rear; it does not change your squad cap.
      </Text>

      <SectionTitle title={faction.name + ' ' + faction.mechanicName} trailing="Battle behavior" />
      <View style={styles.doctrineList}>
        {formationDoctrines.map(doctrine => {
          const selected = doctrine.id === formationDoctrineId;
          const unlocked = unlockedAtStage(doctrine.unlock);

          return (
            <Pressable
              key={doctrine.id}
              disabled={!unlocked}
              onPress={() => setFormationDoctrine(doctrine.id)}
              style={({ pressed }) => ({ opacity: !unlocked ? 0.45 : pressed ? 0.82 : 1 })}
            >
              <GameCard accent={selected ? theme.colors.gold : undefined}>
                <View style={styles.doctrineHeader}>
                  <View style={styles.doctrineCopy}>
                    <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
                      {doctrine.name}
                    </Text>
                    <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
                      {doctrine.description}
                    </Text>
                  </View>
                  <Pill
                    label={selected ? 'ACTIVE' : unlocked ? doctrine.unlock : 'LOCKED · ' + doctrine.unlock}
                    color={selected ? theme.colors.gold + '45' : undefined}
                  />
                </View>
              </GameCard>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="Active formation synergies" trailing={String(formationBonuses.length)} />
      {formationBonuses.length > 0 ? (
        <View style={styles.bonusList}>
          {formationBonuses.map(bonus => (
            <GameCard key={bonus.id} accent={theme.colors.primary}>
              <View style={styles.bonusHeader}>
                <Text style={[styles.bonusName, { color: theme.colors.text }]}>{bonus.name}</Text>
                <Text style={[styles.bonusValue, { color: theme.colors.primary }]}>{bonus.value}</Text>
              </View>
              <Text style={[styles.bonusBody, { color: theme.colors.textMuted }]}>
                {bonus.description}
              </Text>
            </GameCard>
          ))}
        </View>
      ) : (
        <GameCard>
          <Text style={[styles.noBonus, { color: theme.colors.textMuted }]}>
            Reposition squads to create a formation synergy.
          </Text>
        </GameCard>
      )}

      <SectionTitle title="Active squads" trailing={selectedUnitId ? 'Select a position' : undefined} />
      <View style={styles.unitList}>
        {units.map(unit => {
          const active = formation.includes(unit.id);
          const selected = selectedUnitId === unit.id;

          return (
            <Pressable
              key={unit.id}
              disabled={!active}
              onPress={() => setSelectedUnitId(selected ? null : unit.id)}
              style={({ pressed }) => ({ opacity: pressed ? 0.82 : active ? 1 : 0.55 })}
            >
              <GameCard accent={selected ? theme.colors.gold : active ? factionAccent : undefined}>
                <View style={styles.unitRow}>
                  <UnitPortrait
                    name={unit.name}
                    className={unit.className}
                    accent={selected ? theme.colors.gold : factionAccent}
                    compact
                  />
                  <View style={styles.stats}>
                    <Text style={[styles.stat, { color: theme.colors.text }]}>HP {unit.hp}</Text>
                    <Text style={[styles.stat, { color: theme.colors.text }]}>ATK {unit.attack}</Text>
                    <Text style={[styles.stat, { color: theme.colors.text }]}>ARM {unit.armor}</Text>
                  </View>
                </View>
              </GameCard>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 13 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  summaryCopy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 9 },
  shapeStrip: { gap: 9, paddingRight: 4 },
  shapeCard: {
    width: 174,
    minHeight: 132,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 11
  },
  shapeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  shapeLayout: { fontSize: 16, fontWeight: '900' },
  shapeUnlock: { fontSize: 7.5, fontWeight: '900', flexShrink: 1, textAlign: 'right' },
  shapeName: { fontSize: 12.5, fontWeight: '900', marginTop: 8 },
  shapeMeta: { fontSize: 9.5, lineHeight: 13, marginTop: 5 },
  shapeRisk: { fontSize: 8.5, lineHeight: 12, marginTop: 5 },
  board: { gap: 8 },
  rowGroup: { gap: 5 },
  rowHeading: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 3 },
  rowLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  rowNote: { fontSize: 9, fontWeight: '700' },
  boardRow: { flexDirection: 'row', gap: 6 },
  slot: {
    flex: 1,
    minHeight: 82,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5
  },
  slotDense: { minHeight: 68, borderRadius: 13, padding: 3 },
  slotNumber: { position: 'absolute', top: 4, right: 6, fontSize: 7, fontWeight: '800' },
  slotPortrait: {
    width: 38,
    height: 42,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  slotPortraitDense: { width: 31, height: 34, borderRadius: 9 },
  slotName: { fontSize: 9.5, fontWeight: '900', marginTop: 4, maxWidth: '100%' },
  slotNameDense: { fontSize: 7.5, marginTop: 3 },
  slotClass: { fontSize: 7, marginTop: 2, maxWidth: '100%' },
  emptyLabel: { fontSize: 9, fontWeight: '800' },
  interactionHint: { fontSize: 10, lineHeight: 15, textAlign: 'center', paddingHorizontal: 12 },
  doctrineList: { gap: 8 },
  doctrineHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  doctrineCopy: { flex: 1 },
  doctrineName: { fontSize: 14, fontWeight: '900' },
  doctrineBody: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  bonusList: { gap: 8 },
  bonusHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  bonusName: { fontSize: 14, fontWeight: '900' },
  bonusValue: { fontSize: 11, fontWeight: '900' },
  bonusBody: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  noBonus: { fontSize: 12, textAlign: 'center' },
  unitList: { gap: 8 },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stats: { alignItems: 'flex-end', gap: 3 },
  stat: { fontSize: 10, fontWeight: '800' }
});
