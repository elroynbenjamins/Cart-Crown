import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';
import { EquipmentSprite } from '../ui/gameArt';

export function MarkedRaidersScreen({
  onOpenForge,
  onExit
}: {
  onOpenForge: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    markedRaidersInvestigated,
    forgeUnlocked,
    completeMarkedRaiders
  } = useGame();

  const investigate = () => {
    completeMarkedRaiders();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>STORY EVENT</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Marked Raiders</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          The road is secure, but the weapons left behind do not match the story everyone expects.
        </Text>
        <View style={styles.evidenceStrip}>
          <View style={styles.evidenceStripItem}>
            <EquipmentSprite equipmentId="hum_iron_sword" faction="orc" size={44} />
          </View>
          <Text style={[styles.evidenceVs, { color: theme.colors.textMuted }]}>≠</Text>
          <View style={styles.evidenceStripItem}>
            <EquipmentSprite equipmentId="hum_padded_armor" faction="human" size={44} />
          </View>
        </View>
      </GameCard>

      <SectionTitle title="Recovered evidence" />

      <GameCard>
        <View style={styles.evidenceRow}>
          <View style={[styles.evidenceIcon, { backgroundColor: theme.colors.surface2 }]}>
            <EquipmentSprite equipmentId="hum_iron_sword" faction="orc" size={40} />
          </View>
          <View style={styles.evidenceCopy}>
            <Text style={[styles.evidenceTitle, { color: theme.colors.text }]}>Crude Orc clan marks</Text>
            <Text style={[styles.evidenceBody, { color: theme.colors.textMuted }]}>
              Several blades carry painted clan symbols—but the shapes combine marks no real clan would normally use together.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard>
        <View style={styles.evidenceRow}>
          <View style={[styles.evidenceIcon, { backgroundColor: theme.colors.surface2 }]}>
            <EquipmentSprite equipmentId="hum_padded_armor" faction="human" size={40} />
          </View>
          <View style={styles.evidenceCopy}>
            <Text style={[styles.evidenceTitle, { color: theme.colors.text }]}>Human-forged buckles</Text>
            <Text style={[styles.evidenceBody, { color: theme.colors.textMuted }]}>
              Under the paint, the straps use western Greenkeep workshop stamps. The equipment was assembled much closer to home.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard accent={markedRaidersInvestigated ? theme.colors.primary : theme.colors.human}>
        <Text style={[styles.revealLabel, { color: markedRaidersInvestigated ? theme.colors.primary : theme.colors.human }]}>
          {markedRaidersInvestigated ? 'CLUE RECORDED' : 'INVESTIGATION'}
        </Text>
        <Text style={[styles.revealTitle, { color: theme.colors.text }]}>
          Someone wants the attack to look Orcish
        </Text>
        <Text style={[styles.revealBody, { color: theme.colors.textMuted }]}>
          The usable metal can be recovered. Establishing a small Field Forge will let Greenkeep turn the evidence into the army's first proper equipment.
        </Text>
        <Text style={[styles.reward, { color: theme.colors.gold }]}>Reward: +5 Wood · +2 Iron · Field Forge unlocked</Text>
      </GameCard>

      {!markedRaidersInvestigated ? (
        <PrimaryButton label="Recover the gear & record the clue" onPress={investigate} />
      ) : forgeUnlocked ? (
        <>
          <PrimaryButton label="Build Field Forge in Kingdom" onPress={onOpenForge} />
          <PrimaryButton label="Return to Campaign" onPress={onExit} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  evidenceStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 },
  evidenceStripItem: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  evidenceVs: { fontSize: 20, fontWeight: '900' },
  evidenceRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  evidenceIcon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  evidenceCopy: { flex: 1 },
  evidenceTitle: { fontSize: 15, fontWeight: '900' },
  evidenceBody: { fontSize: 11.5, lineHeight: 17, marginTop: 4 },
  revealLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  revealTitle: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  revealBody: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  reward: { fontSize: 11, fontWeight: '900', marginTop: 9 }
});
