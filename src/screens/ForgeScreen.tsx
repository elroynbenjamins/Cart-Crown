import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import type { ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, ResourceAmountRow, ResourceChip, SecondaryButton } from '../ui/components';
import { DecisionCommit, DecisionIntro, DecisionLayout, DecisionOption, DecisionStats } from '../ui/DecisionUI';
import { SemanticChip, SemanticText, TierChip } from '../ui/SemanticUI';
import { tierTone } from '../ui/semanticColors';
import { signedStat } from '../ui/decisionPresentation';
import { EquipmentSprite, ForgeWorkshopScene, ResourceSprite } from '../ui/gameArt';
import { TutorialFocus } from '../ui/TutorialFocus';
import type { TutorialFocusTarget } from '../game/tutorial';

export function ForgeScreen({ onOpenPromotion, onExit, tutorialFocus, onTutorialFocusComplete }: {
  onOpenPromotion: () => void;
  onExit: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    resources, equipmentDefinitions, equipmentInventory, buildingLevels,
    settlementAdjacencyBonuses, getEquipmentCraftCost, craftEquipment, firstPromotionComplete
  } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const lastCraftState = useRef<{ resources: typeof resources; inventory: typeof equipmentInventory } | null>(null);

  const humanWeapons = equipmentDefinitions.filter(item =>
    item.faction === 'human' && item.slot === 'weapon' && !item.upgradeFromId &&
    item.requiredForgeLevel <= (buildingLevels.forge ?? 0)
  );
  const tutorialCraftItemId = tutorialFocus?.kind === 'forge-craft'
    ? humanWeapons.find(item => !equipmentInventory.includes(item.id))?.id ?? humanWeapons[0]?.id ?? null
    : null;
  const selected = humanWeapons.find(item => item.id === selectedId) ??
    humanWeapons.find(item => item.id === tutorialCraftItemId) ?? humanWeapons[0] ?? null;
  const effectiveCost = selected ? getEquipmentCraftCost(selected) : {};
  const deficits = Object.entries(effectiveCost).filter(([key, amount]) =>
    resources[key as keyof ResourceWallet] < (amount ?? 0)
  );
  const affordable = Boolean(selected) && deficits.length === 0;
  const resourceName = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);
  const costLabel = Object.entries(effectiveCost)
    .filter(([, amount]) => (amount ?? 0) > 0)
    .map(([key, amount]) => String(amount) + ' ' + resourceName(key)).join(' · ') || 'No resources';
  const owned = selected ? equipmentInventory.filter(id => id === selected.id).length : 0;
  const tutorialCraftFocused = Boolean(selected && selected.id === tutorialCraftItemId);

  const craft = () => {
    if (!selected || !affordable) return;
    // Block a second tap from the same rendered resource/inventory snapshot.
    if (lastCraftState.current?.resources === resources && lastCraftState.current.inventory === equipmentInventory) return;
    lastCraftState.current = { resources, inventory: equipmentInventory };
    const ok = craftEquipment(selected.id);
    if (!ok) lastCraftState.current = null;
    setSelectedId(selected.id);
    setMessage(ok ? selected.name + ' crafted.' : 'Crafting could not be completed. Check current resources and Forge requirements.');
    if (ok && tutorialCraftFocused) onTutorialFocusComplete?.();
  };

  return (
    <DecisionLayout
      footer={
        <TutorialFocus active={tutorialCraftFocused} label={tutorialCraftFocused ? tutorialFocus?.label : undefined}>
          <DecisionCommit
            title={selected?.name ?? 'No recipe selected'}
            detail={selected ? 'Cost: ' + costLabel + '. Unassigned in inventory: ' + owned + '.' : 'Unlock a weapon recipe through the Forge.'}
            warning={deficits.length ? 'Need ' + deficits.map(([key, amount]) =>
              Math.max(0, (amount ?? 0) - resources[key as keyof ResourceWallet]) + ' more ' + resourceName(key)
            ).join(' · ') : null}
            message={message}
            label={selected ? owned > 0 ? 'Craft another ' + selected.name : 'Craft ' + selected.name : 'No recipe available'}
            disabled={!affordable}
            onConfirm={craft}
          >
            {tutorialCraftFocused ? (
              <SecondaryButton label="Craft later" onPress={() => {
                onTutorialFocusComplete?.();
                setMessage('Forge lesson learned. Return when you want to invest resources.');
              }} />
            ) : null}
            {!firstPromotionComplete && equipmentInventory.length > 0 ? <SecondaryButton label="Promote Mira" onPress={onOpenPromotion} /> : null}
            <SecondaryButton label="Return" onPress={onExit} />
          </DecisionCommit>
        </TutorialFocus>
      }
    >
      <DecisionIntro
        eyebrow={'FIELD FORGE · LEVEL ' + (buildingLevels.forge ?? 0)}
        title={firstPromotionComplete ? 'Craft equipment' : 'First equipment'}
        body="Select a recipe to compare stats and costs. Crafting spends resources only when you confirm."
        accent={theme.colors.gold}
      />
      <ForgeWorkshopScene
        faction="human"
        buildingId="forge"
        level={buildingLevels.forge ?? 0}
        equipmentId={selected?.id}
      />
      <View style={styles.resources}>
        <ResourceChip art={<ResourceSprite resource="wood" size={28} />} value={resources.wood} label="Wood" />
        <ResourceChip art={<ResourceSprite resource="iron" size={28} />} value={resources.iron} label="Iron" />
        <ResourceChip art={<ResourceSprite resource="gold" size={28} />} value={resources.gold} label="Gold" />
      </View>
      {settlementAdjacencyBonuses.some(bonus => bonus.id === 'arsenal_district') ? (
        <GameCard accent={theme.colors.primary} ornament={false}>
          <Text style={[styles.body, { color: theme.colors.text }]}>
            Arsenal District · Equipment costs <SemanticText tone="positive" style={styles.emphasis}>reduced by 10%</SemanticText>. The prices below include the active reduction.
          </Text>
        </GameCard>
      ) : null}
      {humanWeapons.map(item => {
        const cost = getEquipmentCraftCost(item);
        const inStock = equipmentInventory.filter(id => id === item.id).length;
        const focusSelection = item.id === tutorialCraftItemId && selected?.id !== item.id;
        const materialsReady = Object.entries(cost).every(([key, amount]) => resources[key as keyof ResourceWallet] >= (amount ?? 0));
        return (
          <TutorialFocus key={item.id} active={focusSelection} label={focusSelection ? 'SELECT RECIPE' : undefined}>
            <DecisionOption
              title={item.name}
              titleTone={tierTone(item.tier)}
              subtitle={'Tier ' + item.tier + ' · Unassigned: ' + inStock}
              selected={selected?.id === item.id}
              art={<EquipmentSprite equipmentId={item.id} faction={item.faction} size={44} />}
              accessibilitySummary={item.description + '. Attack ' + signedStat(item.attackBonus) + ', armor ' + signedStat(item.armorBonus) + ', speed ' + signedStat(item.speedBonus) + '. Cost: ' + Object.entries(cost).map(([key, amount]) => amount + ' ' + key).join(', ') + (materialsReady ? '. Materials ready.' : '. Materials short.')}
              onSelect={() => {
                setSelectedId(item.id);
                setMessage(null);
              }}
            >
              <View style={styles.badges}>
                <TierChip tier={item.tier} />
                <SemanticChip label={materialsReady ? 'Materials ready' : 'Materials short'} tone={materialsReady ? 'positive' : 'warning'} />
              </View>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>{item.description}</Text>
              <DecisionStats presentation="delta" items={[
                { label: 'Attack', value: signedStat(item.attackBonus) },
                { label: 'Armor', value: signedStat(item.armorBonus) },
                { label: 'Speed', value: signedStat(item.speedBonus) }
              ]} />
              <ResourceAmountRow values={cost} />
            </DecisionOption>
          </TutorialFocus>
        );
      })}
      {!humanWeapons.length ? <Text style={[styles.body, { color: theme.colors.textMuted }]}>No weapon recipes are available at the current Forge level.</Text> : null}
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  resources: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emphasis: { fontWeight: '900' },
  body: { fontSize: 13, lineHeight: 19 }
});
