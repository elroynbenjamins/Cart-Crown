import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getEquipment } from '../game/equipment';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { SecondaryButton } from '../ui/components';
import { DecisionCommit, DecisionIntro, DecisionLayout, DecisionOption, DecisionStats } from '../ui/DecisionUI';
import { RoleChip, SemanticText } from '../ui/SemanticUI';
import { rolePresentation } from '../ui/semanticColors';
import { signedStat } from '../ui/decisionPresentation';
import { EquipmentSprite, PromotionPathScene, UnitSprite } from '../ui/gameArt';

export function PromotionScreen({ onOpenForge, onComplete }: {
  onOpenForge: () => void;
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const { units, equipmentInventory, recruitPromotions, promoteMira, firstPromotionComplete } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const committed = useRef(false);
  const mira = units.find(unit => unit.id === 'hum_recruit');
  const selected = recruitPromotions.find(promotion => promotion.id === selectedId) ?? null;
  const requiredWeapon = selected ? getEquipment(selected.requiredEquipmentId) : null;
  const canPromote = Boolean(mira && selected && equipmentInventory.includes(selected.requiredEquipmentId) && !firstPromotionComplete);

  const confirm = () => {
    if (!selected || !canPromote || committed.current) return;
    committed.current = true;
    if (promoteMira(selected.requiredEquipmentId)) {
      setMessage('Mira promoted to ' + selected.toClass + '.');
    } else {
      committed.current = false;
      setMessage('Promotion could not be completed. Check the required weapon and current squad.');
    }
  };

  return (
    <DecisionLayout
      footer={
        <DecisionCommit
          title={firstPromotionComplete ? 'Promotion complete' : selected ? 'Recruit → ' + selected.toClass : "Choose Mira's path"}
          detail={firstPromotionComplete
            ? 'Experience and assigned equipment remain with the squad.'
            : selected
              ? 'The required weapon becomes assigned equipment and leaves general inventory.'
              : 'Select a path to review its required weapon.'}
          warning={!firstPromotionComplete && selected && !canPromote ? 'Requires ' + (requiredWeapon?.name ?? 'the specified weapon') + ' in inventory.' : null}
          message={message}
          label={firstPromotionComplete || !mira ? 'Return to Army' : selected ? 'Promote to ' + selected.toClass : 'Choose a path'}
          disabled={Boolean(mira) && !firstPromotionComplete && !canPromote}
          onConfirm={firstPromotionComplete || !mira ? onComplete : confirm}
        >
          {!firstPromotionComplete && mira ? <SecondaryButton label="Open Forge" onPress={onOpenForge} /> : null}
        </DecisionCommit>
      }
    >
      <DecisionIntro
        eyebrow="SQUAD PROMOTION"
        title={mira ? mira.name + ' · ' + mira.className : 'Squad unavailable'}
        body={firstPromotionComplete
          ? 'Your new class is active. Further equipment upgrades do not require another promotion.'
          : 'A weapon unlocks a class branch. Compare the class bonuses, then confirm your choice.'}
        accent={theme.colors.human}
      />
      {mira ? (
        <PromotionPathScene
          faction={mira.faction}
          fromClass={firstPromotionComplete ? 'Recruit' : mira.className}
          toClass={firstPromotionComplete ? mira.className : selected?.toClass}
          equipmentId={firstPromotionComplete ? null : selected?.requiredEquipmentId}
        />
      ) : null}
      {mira && !firstPromotionComplete ? recruitPromotions.map(promotion => {
        const equipment = getEquipment(promotion.requiredEquipmentId);
        const owned = equipmentInventory.includes(promotion.requiredEquipmentId);
        const requirement = (equipment?.name ?? promotion.requiredEquipmentId) + (owned ? ' · In inventory' : ' · Not in inventory');
        return (
          <DecisionOption
            key={promotion.id}
            title={promotion.toClass}
            titleTone={rolePresentation[promotion.role]?.tone}
            subtitle={promotion.role}
            selected={promotion.id === selectedId}
            art={<UnitSprite className={promotion.toClass} faction={mira.faction} size={44} />}
            accessibilitySummary={promotion.pitch + '. Requires ' + requirement + '. Class attack ' + signedStat(promotion.attackBonus) + ', armor ' + signedStat(promotion.armorBonus) + ', speed ' + signedStat(promotion.speedBonus)}
            onSelect={() => {
              setSelectedId(promotion.id);
              setMessage(null);
            }}
          >
            <RoleChip role={promotion.role} />
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{promotion.pitch}</Text>
            <View style={styles.requirement}>
              <EquipmentSprite equipmentId={promotion.requiredEquipmentId} faction={mira.faction} size={28} />
              <SemanticText tone={owned ? 'positive' : 'warning'} style={styles.requirementText}>{requirement}</SemanticText>
            </View>
            <DecisionStats presentation="delta" items={[
              { label: 'Class attack', value: signedStat(promotion.attackBonus) },
              { label: 'Class armor', value: signedStat(promotion.armorBonus) },
              { label: 'Class speed', value: signedStat(promotion.speedBonus) }
            ]} />
          </DecisionOption>
        );
      }) : null}
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 11, lineHeight: 15 },
  requirement: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  requirementText: { flex: 1, minWidth: 0, fontSize: 10.5, lineHeight: 15, fontWeight: '700' }
});
