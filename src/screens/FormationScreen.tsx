import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, SectionTitle, UnitPortrait } from '../ui/components';

export function FormationScreen() {
  const { theme } = useGameTheme();
  const {
    units,
    formation,
    currentWagonStage,
    unlockedFormationSlots,
    moveFormationUnit
  } = useGame();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const unlocked = new Set(unlockedFormationSlots);

  const handleSlot = (slot: number, unitId: string | null) => {
    if (!unlocked.has(slot)) {
      return;
    }

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
      <GameCard>
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>ACTIVE FORMATION</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Balanced Line</Text>
          </View>
          <Pill
            label={String(unlockedFormationSlots.length) + ' slots'}
            color={theme.colors.human + '55'}
          />
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Tap a squad, then tap another unlocked slot to move or swap it.
        </Text>
      </GameCard>

      <SectionTitle
        title="Battle formation"
        trailing={currentWagonStage.name}
      />

      <View style={styles.rowLabelWrap}>
        <Text style={[styles.boardRowLabel, { color: theme.colors.textMuted }]}>FRONT ROW</Text>
      </View>
      <View style={styles.boardRow}>
        {[0, 1, 2].map(slot => {
          const unitId = formation[slot] ?? null;
          const unit = units.find(candidate => candidate.id === unitId);
          const isUnlocked = unlocked.has(slot);
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
                      : theme.colors.border,
                  opacity: isUnlocked ? 1 : 0.55
                }
              ]}
            >
              {!isUnlocked ? (
                <>
                  <Text style={[styles.lock, { color: theme.colors.textMuted }]}>🔒</Text>
                  <Text style={[styles.lockTitle, { color: theme.colors.textMuted }]}>
                    Locked
                  </Text>
                </>
              ) : unit ? (
                <>
                  <View style={[styles.slotPortrait, { borderColor: theme.colors.human }]}>
                    <Text style={[styles.slotInitial, { color: theme.colors.human }]}>
                      {unit.name[0]}
                    </Text>
                  </View>
                  <Text style={[styles.slotName, { color: theme.colors.text }]}>{unit.name}</Text>
                  <Text style={[styles.slotClass, { color: theme.colors.textMuted }]}>
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

      <View style={styles.rowLabelWrap}>
        <Text style={[styles.boardRowLabel, { color: theme.colors.textMuted }]}>BACK ROW</Text>
      </View>
      <View style={styles.boardRow}>
        {[3, 4, 5].map(slot => {
          const unitId = formation[slot] ?? null;
          const unit = units.find(candidate => candidate.id === unitId);
          const isUnlocked = unlocked.has(slot);
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
                      : theme.colors.border,
                  opacity: isUnlocked ? 1 : 0.55
                }
              ]}
            >
              {!isUnlocked ? (
                <>
                  <Text style={[styles.lock, { color: theme.colors.textMuted }]}>🔒</Text>
                  <Text style={[styles.lockTitle, { color: theme.colors.textMuted }]}>
                    Locked
                  </Text>
                </>
              ) : unit ? (
                <>
                  <View style={[styles.slotPortrait, { borderColor: theme.colors.human }]}>
                    <Text style={[styles.slotInitial, { color: theme.colors.human }]}>
                      {unit.name[0]}
                    </Text>
                  </View>
                  <Text style={[styles.slotName, { color: theme.colors.text }]}>{unit.name}</Text>
                  <Text style={[styles.slotClass, { color: theme.colors.textMuted }]}>
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

      <SectionTitle title="Active squads" trailing={selectedUnitId ? 'Select a slot' : undefined} />

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
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 24, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 9 },
  rowLabelWrap: { paddingHorizontal: 4, marginBottom: -6 },
  boardRowLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  boardRow: { flexDirection: 'row', gap: 8 },
  slot: {
    flex: 1,
    aspectRatio: 0.9,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7
  },
  slotPortrait: {
    width: 44,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  slotInitial: { fontSize: 18, fontWeight: '900' },
  slotName: { fontSize: 11, fontWeight: '900', marginTop: 6 },
  slotClass: { fontSize: 8, marginTop: 2 },
  lock: { fontSize: 18 },
  lockTitle: { fontSize: 9, fontWeight: '900', marginTop: 5 },
  emptyLabel: { fontSize: 10, fontWeight: '800' },
  unitList: { gap: 8 },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stats: { alignItems: 'flex-end', gap: 3 },
  stat: { fontSize: 10, fontWeight: '800' }
});
