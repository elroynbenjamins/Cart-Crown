import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEquipment } from '../game/equipment';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SectionTitle, UnitPortrait } from '../ui/components';

export function ArmyScreen({
  onOpenRecruitment,
  onOpenForge,
  onOpenPromotion,
  onOpenCommander,
  onOpenEquipment
}: {
  onOpenRecruitment: () => void;
  onOpenForge: () => void;
  onOpenPromotion: () => void;
  onOpenCommander: () => void;
  onOpenEquipment: (unitId: string) => void;
}) {
  const { theme } = useGameTheme();
  const {
    units,
    formation,
    currentWagonStage,
    settlementUpgraded,
    recruitChosen,
    recruitOptions,
    forgeUnlocked,
    firstPromotionComplete,
    unitEquipment,
    equipmentInventory,
    commanderChoiceUnlocked,
    activeCommanderPath,
    commanderRespecCost
  } = useGame();

  const activeCount = formation.filter(Boolean).length;
  const mira = units.find(unit => unit.id === 'hum_recruit');
  const miraWeapon = unitEquipment.hum_recruit?.weapon
    ? getEquipment(unitEquipment.hum_recruit.weapon)
    : null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>GREENKEEP REMNANT</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Army</Text>
          </View>
          <Pill label={String(activeCount) + ' / ' + String(currentWagonStage.formationSlots) + ' active'} />
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Squads keep their experience and assigned equipment. Promotions branch from what you train and give them.
        </Text>
      </GameCard>

      <SectionTitle title="Squads" />

      <View style={styles.unitList}>
        {units.map(unit => (
          <GameCard key={unit.id} accent={unit.id === 'hum_recruit' && firstPromotionComplete ? theme.colors.gold : undefined}>
            <View style={styles.unitRow}>
              <UnitPortrait
                name={unit.name}
                className={unit.className + ' · Lv. ' + unit.level}
                accent={theme.colors.human}
              />
              <View style={styles.stats}>
                <Text style={[styles.stat, { color: theme.colors.text }]}>HP {unit.hp}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ATK {unit.attack}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ARM {unit.armor}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>SPD {unit.speed}</Text>
              </View>
            </View>

            {unit.id === 'hum_recruit' ? (
              <View style={[styles.promotionPreview, { backgroundColor: theme.colors.surface2 }]}>
                <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
                  {firstPromotionComplete ? 'Assigned equipment' : 'First promotion'}
                </Text>
                <Text style={[styles.previewBody, { color: theme.colors.textMuted }]}>
                  {firstPromotionComplete
                    ? (miraWeapon?.name ?? 'Weapon') + ' is assigned permanently to this squad.'
                    : forgeUnlocked
                      ? 'Craft a weapon, then choose whether Mira becomes Swordsman, Spearman or Archer.'
                      : 'Investigate Marked Raiders to unlock the Field Forge and first equipment choice.'}
                </Text>
                {forgeUnlocked && !firstPromotionComplete ? (
                  <View style={styles.promotionActions}>
                    <View style={styles.actionGrow}>
                      <PrimaryButton
                        label={equipmentInventory.length > 0 ? 'Promote Mira' : 'Open Forge'}
                        onPress={equipmentInventory.length > 0 ? onOpenPromotion : onOpenForge}
                      />
                    </View>
                  </View>
                ) : null}

                {firstPromotionComplete ? (
                  <Text style={[styles.previewBody, { color: theme.colors.primary }]}>
                    Further class branches now depend on assigned gear and Kingdom building levels.
                  </Text>
                ) : null}
              </View>
            ) : null}

            {forgeUnlocked ? (
              <View style={styles.unitEquipmentButton}>
                <PrimaryButton
                  label="Loadout / Equipment"
                  onPress={() => onOpenEquipment(unit.id)}
                />
              </View>
            ) : null}
          </GameCard>
        ))}
      </View>

      {commanderChoiceUnlocked ? (
        <>
          <SectionTitle title="Your Commander" trailing={activeCommanderPath ? 'Specialized' : 'Choose path'} />
          <GameCard accent={activeCommanderPath ? theme.colors.gold : theme.colors.primary}>
            <Text style={[styles.commanderTitle, { color: theme.colors.text }]}>
              {activeCommanderPath ? activeCommanderPath.name : 'Commander specialization available'}
            </Text>
            <Text style={[styles.commanderSubtitle, { color: theme.colors.human }]}>
              {activeCommanderPath ? activeCommanderPath.title : 'Choose how your leadership shapes the army'}
            </Text>
            <Text style={[styles.commanderBody, { color: theme.colors.textMuted }]}>
              {activeCommanderPath
                ? activeCommanderPath.passiveDescription + ' Command skill: ' + activeCommanderPath.skill.name + '.'
                : 'Pick one of three Human paths: Vanguard Marshal, Ranger-Captain or Cavalry Marshal.'}
            </Text>
            <View style={styles.recruitButton}>
              <PrimaryButton
                label={
                  activeCommanderPath
                    ? 'Retrain Commander · ' + commanderRespecCost + ' Gold'
                    : 'Choose Commander Path'
                }
                onPress={onOpenCommander}
              />
            </View>
          </GameCard>
        </>
      ) : null}

      {!recruitChosen ? (
        <>
          <SectionTitle title="Third squad" trailing={settlementUpgraded ? 'Available now' : 'Unlocks at Settlement'} />
          <GameCard accent={settlementUpgraded ? theme.colors.primary : undefined}>
            <Text style={[styles.lockedTitle, { color: theme.colors.text }]}>First Reinforcements</Text>
            <Text style={[styles.lockedBody, { color: theme.colors.textMuted }]}>
              {settlementUpgraded
                ? 'Greenkeep can now support one more squad. Choose the first new role in your army.'
                : 'After Hold the Road and the first Settlement upgrade, choose one of three early paths.'}
            </Text>
            <View style={styles.choiceList}>
              {recruitOptions.map(choice => (
                <View key={choice.id} style={[styles.choice, { backgroundColor: theme.colors.surface2 }]}>
                  <View style={[styles.choiceIcon, { borderColor: theme.colors.human }]}>
                    <Text style={[styles.choiceInitial, { color: theme.colors.human }]}>
                      {choice.unit.className[0]}
                    </Text>
                  </View>
                  <View style={styles.choiceCopy}>
                    <Text style={[styles.choiceName, { color: theme.colors.text }]}>{choice.unit.className}</Text>
                    <Text style={[styles.choiceRole, { color: theme.colors.human }]}>{choice.archetype}</Text>
                    <Text style={[styles.choicePitch, { color: theme.colors.textMuted }]}>{choice.pitch}</Text>
                  </View>
                </View>
              ))}
            </View>
            {settlementUpgraded ? (
              <View style={styles.recruitButton}>
                <PrimaryButton label="Choose third squad" onPress={onOpenRecruitment} />
              </View>
            ) : null}
          </GameCard>
        </>
      ) : null}

      {forgeUnlocked ? (
        <>
          <SectionTitle title="Equipment inventory" trailing={String(equipmentInventory.length)} />
          <GameCard>
            <Text style={[styles.inventoryText, { color: theme.colors.textMuted }]}>
              {equipmentInventory.length > 0
                ? equipmentInventory.map(id => getEquipment(id)?.name ?? id).join(' · ')
                : 'No unassigned equipment. Crafted gear appears here until equipped or used for a promotion.'}
            </Text>
            <View style={styles.recruitButton}>
              <PrimaryButton label="Open Field Forge" onPress={onOpenForge} />
            </View>
          </GameCard>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 8 },
  unitList: { gap: 10 },
  unitRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  stats: { alignItems: 'flex-end', gap: 2 },
  stat: { fontSize: 10, fontWeight: '800' },
  promotionPreview: { borderRadius: 14, padding: 11, marginTop: 12 },
  previewTitle: { fontSize: 12, fontWeight: '900' },
  previewBody: { fontSize: 11, lineHeight: 15, marginTop: 3 },
  promotionActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionGrow: { flex: 1 },
  lockedTitle: { fontSize: 17, fontWeight: '900' },
  lockedBody: { fontSize: 12, lineHeight: 17, marginTop: 5 },
  choiceList: { gap: 8, marginTop: 14 },
  choice: { borderRadius: 16, padding: 10, flexDirection: 'row', gap: 11, alignItems: 'center' },
  choiceIcon: { width: 42, height: 48, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  choiceInitial: { fontSize: 17, fontWeight: '900' },
  choiceCopy: { flex: 1 },
  choiceName: { fontSize: 14, fontWeight: '900' },
  choiceRole: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  choicePitch: { fontSize: 10, lineHeight: 14, marginTop: 3 },
  recruitButton: { marginTop: 14 },
  inventoryText: { fontSize: 11.5, lineHeight: 17 },
  unitEquipmentButton: { marginTop: 11 },
  commanderTitle: { fontSize: 18, fontWeight: '900' },
  commanderSubtitle: { fontSize: 10, fontWeight: '900', marginTop: 3 },
  commanderBody: { fontSize: 11.5, lineHeight: 17, marginTop: 7 }
});
