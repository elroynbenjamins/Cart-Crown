import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import type { ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, ResourceChip, SectionTitle } from '../ui/components';

const resourceIcons: Record<keyof ResourceWallet, string> = {
  gold: '🪙',
  wood: '🪵',
  stone: '🪨',
  iron: '⛓',
  provisions: '🍞'
};

export function ForgeScreen({
  onOpenPromotion,
  onExit
}: {
  onOpenPromotion: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    resources,
    equipmentDefinitions,
    equipmentInventory,
    buildingLevels,
    settlementAdjacencyBonuses,
    getEquipmentCraftCost,
    craftEquipment,
    firstPromotionComplete
  } = useGame();
  const [message, setMessage] = useState<string | null>(null);

  const humanWeapons = equipmentDefinitions.filter(
    item =>
      item.faction === 'human' &&
      item.slot === 'weapon' &&
      !item.upgradeFromId &&
      item.requiredForgeLevel <= (buildingLevels.forge ?? 0)
  );

  const craft = (id: string, name: string) => {
    const ok = craftEquipment(id);
    setMessage(ok ? name + ' crafted.' : 'Not enough resources for that item.');
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>FIELD FORGE</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>First Equipment</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Equipment is permanent troop progression. The weapon you craft for Mira determines her first class branch.
        </Text>
      </GameCard>

      <View style={styles.resources}>
        <ResourceChip icon="🪵" value={resources.wood} label="Wood" />
        <ResourceChip icon="⛓" value={resources.iron} label="Iron" />
        <ResourceChip icon="🪙" value={resources.gold} label="Gold" />
      </View>

      {settlementAdjacencyBonuses.some(bonus => bonus.id === 'arsenal_district') ? (
        <GameCard accent={theme.colors.primary}>
          <Text style={[styles.recipeName, { color: theme.colors.text }]}>Arsenal District</Text>
          <Text style={[styles.recipeDesc, { color: theme.colors.textMuted }]}>
            Barracks adjacent to the Field Forge reduces equipment costs by 10%.
          </Text>
        </GameCard>
      ) : null}

      <SectionTitle title="Available recipes" trailing="Choose carefully" />

      <View style={styles.recipeList}>
        {humanWeapons.map(item => {
          const owned = equipmentInventory.filter(id => id === item.id).length;
          const effectiveCost = getEquipmentCraftCost(item);
          const affordable = Object.entries(effectiveCost).every(([key, amount]) => {
            const resourceKey = key as keyof ResourceWallet;
            return resources[resourceKey] >= (amount ?? 0);
          });

          return (
            <GameCard key={item.id} accent={owned > 0 ? theme.colors.primary : undefined}>
              <View style={styles.recipeHeader}>
                <View style={styles.recipeIcon}>
                  <Text style={styles.recipeEmoji}>
                    {item.tags.includes('sword') ? '🗡️' : item.tags.includes('spear') ? '🔱' : '🏹'}
                  </Text>
                </View>
                <View style={styles.recipeCopy}>
                  <Text style={[styles.recipeName, { color: theme.colors.text }]}>{item.name}</Text>
                  <Text style={[styles.recipeDesc, { color: theme.colors.textMuted }]}>
                    {item.description}
                  </Text>
                </View>
              </View>

              <View style={styles.stats}>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ATK +{item.attackBonus}</Text>
                {item.armorBonus > 0 ? (
                  <Text style={[styles.stat, { color: theme.colors.text }]}>ARM +{item.armorBonus}</Text>
                ) : null}
                {item.speedBonus > 0 ? (
                  <Text style={[styles.stat, { color: theme.colors.text }]}>SPD +{item.speedBonus}</Text>
                ) : null}
              </View>

              <View style={styles.costRow}>
                {Object.entries(effectiveCost).map(([key, value]) => (
                  <Text key={key} style={[styles.cost, { color: theme.colors.textMuted }]}>
                    {resourceIcons[key as keyof ResourceWallet]} {value}
                  </Text>
                ))}
                {owned > 0 ? (
                  <Text style={[styles.owned, { color: theme.colors.primary }]}>Owned ×{owned}</Text>
                ) : null}
              </View>

              <View style={styles.button}>
                <PrimaryButton
                  label={owned > 0 ? 'Craft another' : 'Craft ' + item.name}
                  disabled={!affordable}
                  onPress={() => craft(item.id, item.name)}
                />
              </View>
            </GameCard>
          );
        })}
      </View>

      {message ? <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text> : null}

      {!firstPromotionComplete && equipmentInventory.length > 0 ? (
        <PrimaryButton label="Promote Mira" onPress={onOpenPromotion} />
      ) : null}

      <PrimaryButton label="Return" onPress={onExit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 27, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  resources: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recipeList: { gap: 10 },
  recipeHeader: { flexDirection: 'row', gap: 11 },
  recipeIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  recipeEmoji: { fontSize: 25 },
  recipeCopy: { flex: 1 },
  recipeName: { fontSize: 16, fontWeight: '900' },
  recipeDesc: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 10 },
  stat: { fontSize: 10, fontWeight: '900' },
  costRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 9 },
  cost: { fontSize: 10, fontWeight: '800' },
  owned: { fontSize: 10, fontWeight: '900', marginLeft: 'auto' },
  button: { marginTop: 12 },
  message: { textAlign: 'center', fontSize: 10.5, fontWeight: '700' }
});
