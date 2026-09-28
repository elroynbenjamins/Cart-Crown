import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEquipment } from '../game/equipment';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SectionTitle, UnitPortrait } from '../ui/components';
import { EquipmentSprite, UnitSprite } from '../ui/gameArt';

export function PromotionScreen({
  onOpenForge,
  onComplete
}: {
  onOpenForge: () => void;
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    units,
    equipmentInventory,
    recruitPromotions,
    promoteMira,
    firstPromotionComplete
  } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const mira = units.find(unit => unit.id === 'hum_recruit');

  if (!mira) {
    return null;
  }

  const selected = recruitPromotions.find(promotion => promotion.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected) return;
    const ok = promoteMira(selected.requiredEquipmentId);
    if (ok) {
      setMessage('Mira promoted to ' + selected.toClass + '.');
    } else {
      setMessage('Craft the required weapon first.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <UnitPortrait
          name={mira.name}
          className={mira.className + ' · Lv. ' + mira.level}
          accent={theme.colors.human}
          faction={mira.faction}
        />
        <Text style={[styles.intro, { color: theme.colors.textMuted }]}>
          Promotions change what a squad is. Equipment upgrades can continue afterward without creating a new class every time.
        </Text>
      </GameCard>

      <SectionTitle title="Choose Mira's path" trailing="Weapon + experience" />

      <View style={styles.options}>
        {recruitPromotions.map(promotion => {
          const equipment = getEquipment(promotion.requiredEquipmentId);
          const owned = equipmentInventory.includes(promotion.requiredEquipmentId);
          const selectedOption = promotion.id === selectedId;

          return (
            <View key={promotion.id}>
              <GameCard accent={selectedOption ? theme.colors.gold : owned ? theme.colors.primary : undefined}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionCopy}>
                    <Text style={[styles.optionName, { color: theme.colors.text }]}>{promotion.toClass}</Text>
                    <Text style={[styles.role, { color: theme.colors.human }]}>{promotion.role.toUpperCase()}</Text>
                  </View>
                  <Pill label={owned ? 'READY' : 'NEEDS ' + (equipment?.name ?? 'GEAR')} />
                </View>

                <Text style={[styles.pitch, { color: theme.colors.textMuted }]}>{promotion.pitch}</Text>

                <View style={styles.promotionVisual}>
                  <View style={styles.gearBox}>
                    <EquipmentSprite
                      equipmentId={promotion.requiredEquipmentId}
                      faction={mira.faction}
                      size={34}
                    />
                  </View>
                  <Text style={[styles.arrow, { color: theme.colors.textMuted }]}>→</Text>
                  <View style={styles.resultBox}>
                    <UnitSprite className={promotion.toClass} faction={mira.faction} size={42} />
                  </View>
                </View>

                <View style={styles.statRow}>
                  <Text style={[styles.stat, { color: theme.colors.text }]}>Class ATK +{promotion.attackBonus}</Text>
                  <Text style={[styles.stat, { color: theme.colors.text }]}>ARM +{promotion.armorBonus}</Text>
                  {promotion.speedBonus > 0 ? (
                    <Text style={[styles.stat, { color: theme.colors.text }]}>SPD +{promotion.speedBonus}</Text>
                  ) : null}
                </View>

                <View style={styles.selectButton}>
                  <PrimaryButton
                    label={selectedOption ? 'Selected' : 'Choose ' + promotion.toClass}
                    onPress={() => setSelectedId(promotion.id)}
                  />
                </View>
              </GameCard>
            </View>
          );
        })}
      </View>

      {selected ? (
        <GameCard accent={theme.colors.gold}>
          <Text style={[styles.confirmLabel, { color: theme.colors.gold }]}>CONFIRM PROMOTION</Text>
          <Text style={[styles.confirmTitle, { color: theme.colors.text }]}>
            Recruit → {selected.toClass}
          </Text>
          <Text style={[styles.confirmBody, { color: theme.colors.textMuted }]}>
            The required weapon becomes Mira's assigned equipment and no longer occupies general inventory or Wagon space.
          </Text>
          <View style={styles.confirmButton}>
            <PrimaryButton
              label={'Promote to ' + selected.toClass}
              disabled={!equipmentInventory.includes(selected.requiredEquipmentId) || firstPromotionComplete}
              onPress={confirm}
            />
          </View>
        </GameCard>
      ) : null}

      {message ? (
        <Text style={[styles.message, { color: firstPromotionComplete ? theme.colors.primary : theme.colors.textMuted }]}>
          {message}
        </Text>
      ) : null}

      {firstPromotionComplete ? (
        <PrimaryButton label="Return to Army" onPress={onComplete} />
      ) : (
        <PrimaryButton label="Open Forge" onPress={onOpenForge} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  intro: { fontSize: 11.5, lineHeight: 17, marginTop: 11 },
  options: { gap: 10 },
  optionHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  optionCopy: { flex: 1 },
  optionName: { fontSize: 18, fontWeight: '900' },
  role: { fontSize: 9, fontWeight: '900', marginTop: 2 },
  pitch: { fontSize: 11.5, lineHeight: 17, marginTop: 8 },
  promotionVisual: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  gearBox: { width: 44, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  resultBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  arrow: { fontSize: 18, fontWeight: '900' },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 9 },
  stat: { fontSize: 9.5, fontWeight: '800' },
  selectButton: { marginTop: 11 },
  confirmLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  confirmTitle: { fontSize: 19, fontWeight: '900', marginTop: 4 },
  confirmBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  confirmButton: { marginTop: 11 },
  message: { fontSize: 11, lineHeight: 16, textAlign: 'center', fontWeight: '800' }
});
