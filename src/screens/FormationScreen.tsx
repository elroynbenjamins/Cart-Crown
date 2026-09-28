import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, SectionTitle, UnitPortrait } from '../ui/components';
import { UnitSprite } from '../ui/gameArt';

const rows = [
  { label: 'FRONT', slots: [0, 1, 2], note: '+Armor / threat' },
  { label: 'MIDDLE', slots: [3, 4, 5], note: 'Flexible' },
  { label: 'REAR', slots: [6, 7, 8], note: 'Ranged / support' }
];

export function FormationScreen() {
  const { theme } = useGameTheme();
  const {
    units,
    formation,
    activeFaction,
    activeSquadCap,
    formationDoctrineId,
    formationDoctrines,
    formationBonuses,
    setFormationDoctrine,
    moveFormationUnit,
    currentWagonStage
  } = useGame();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const activeCount = formation.filter(Boolean).length;
  const faction = factions[activeFaction];

  const doctrineUnlocked = (unlock: string) => {
    if (unlock === 'Start') return true;
    if (unlock === 'Settlement') return currentWagonStage.id !== 'camp';
    if (unlock === 'Fort') return ['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
    if (unlock === 'Town') return ['town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
    if (unlock === 'Stronghold') return ['stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
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

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>3×3 FORMATION</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {faction.mechanicName}: {formationDoctrines.find(d => d.id === formationDoctrineId)?.name ?? 'Formation'}
            </Text>
          </View>
          <Pill label={String(activeCount) + ' / ' + String(activeSquadCap) + ' squads'} />
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          {faction.mechanicSummary}
        </Text>
      </GameCard>

      <SectionTitle title="Battle formation" trailing="9 positions · max 6 squads" />

      <View style={styles.board}>
        {rows.map(row => (
          <View key={row.label} style={styles.rowGroup}>
            <View style={styles.rowHeading}>
              <Text style={[styles.rowLabel, { color: theme.colors.textMuted }]}>{row.label}</Text>
              <Text style={[styles.rowNote, { color: theme.colors.textMuted }]}>{row.note}</Text>
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
                      {
                        backgroundColor: unit ? theme.colors.surface1 : theme.colors.surface2,
                        borderColor: selected
                          ? theme.colors.gold
                          : unit
                            ? theme.colors.human
                            : theme.colors.border
                      }
                    ]}
                  >
                    <Text style={[styles.slotNumber, { color: theme.colors.textMuted }]}>
                      {slot + 1}
                    </Text>
                    {unit ? (
                      <>
                        <View style={[styles.slotPortrait, { borderColor: theme.colors.human }]}>
                          <UnitSprite className={unit.className} size={38} />
                        </View>
                        <Text style={[styles.slotName, { color: theme.colors.text }]} numberOfLines={1}>
                          {unit.name}
                        </Text>
                        <Text style={[styles.slotClass, { color: theme.colors.textMuted }]} numberOfLines={1}>
                          {unit.className}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.emptyLabel, { color: theme.colors.textMuted }]}>Empty</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.interactionHint, { color: theme.colors.textMuted }]}>
        Tap a squad, then tap any of the 9 positions to move or swap it. Army size is capped separately from formation space.
      </Text>

      <SectionTitle title="Human Orders" trailing={faction.mechanicName} />
      <View style={styles.doctrineList}>
        {formationDoctrines.map(doctrine => {
          const selected = doctrine.id === formationDoctrineId;
          const unlocked = doctrineUnlocked(doctrine.unlock);

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
              <GameCard accent={selected ? theme.colors.gold : active ? theme.colors.human : undefined}>
                <View style={styles.unitRow}>
                  <UnitPortrait
                    name={unit.name}
                    className={unit.className}
                    accent={selected ? theme.colors.gold : theme.colors.human}
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
  title: { fontSize: 21, lineHeight: 27, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 9 },
  board: { gap: 8 },
  rowGroup: { gap: 5 },
  rowHeading: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 3 },
  rowLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  rowNote: { fontSize: 9, fontWeight: '700' },
  boardRow: { flexDirection: 'row', gap: 8 },
  slot: {
    flex: 1,
    aspectRatio: 0.92,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6
  },
  slotNumber: { position: 'absolute', top: 5, right: 7, fontSize: 8, fontWeight: '800' },
  slotPortrait: {
    width: 38,
    height: 43,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  slotInitial: { fontSize: 16, fontWeight: '900' },
  slotName: { fontSize: 10, fontWeight: '900', marginTop: 5, maxWidth: '100%' },
  slotClass: { fontSize: 7.5, marginTop: 2, maxWidth: '100%' },
  emptyLabel: { fontSize: 10, fontWeight: '800' },
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
