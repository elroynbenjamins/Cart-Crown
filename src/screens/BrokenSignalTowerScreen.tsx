import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';
import { BuildingSprite, ResourceSprite } from '../ui/gameArt';

export function BrokenSignalTowerScreen({
  onExit
}: {
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    signalTowerUnlocked,
    completeBrokenSignalTower
  } = useGame();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>IRON ROAD EVENT</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Broken Signal Tower</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          The old frontier beacon has been stripped for parts, but its stone base still overlooks the Iron Road. Rebuilding the warning network would give Greenkeep better battle intelligence.
        </Text>
      </GameCard>

      <SectionTitle title="Restoration gains" />

      <GameCard>
        <View style={styles.row}>
          <View style={styles.rowArt}><BuildingSprite buildingId="signal_tower" faction="human" size={46} /></View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Signal Tower blueprint</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              Unlocks a new placeable settlement building. At Lv.2 it permanently reveals detailed enemy information in Battle Prep.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard>
        <View style={styles.row}>
          <View style={styles.rowArt}><ResourceSprite resource="stone" size={42} /></View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Old Signal Quarry</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              The ridge quarry below the tower joins regional production, adding +3 Stone per meaningful activity.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard accent={theme.colors.human}>
        <Text style={[styles.noteTitle, { color: theme.colors.text }]}>Why this matters</Text>
        <Text style={[styles.noteBody, { color: theme.colors.textMuted }]}>
          The Kingdom increasingly changes how campaign preparation works: buildings are no longer only stat gates—they can remove information disadvantages and improve recurring systems.
        </Text>
      </GameCard>

      {!signalTowerUnlocked ? (
        <PrimaryButton
          label="Restore the Signal Network"
          onPress={() => {
            completeBrokenSignalTower();
          }}
        />
      ) : (
        <PrimaryButton label="Continue to the Iron Provost" onPress={onExit} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.15 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  rowArt: { width: 54, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '900' },
  rowBody: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  noteTitle: { fontSize: 15, fontWeight: '900' },
  noteBody: { fontSize: 11, lineHeight: 17, marginTop: 5 }
});
