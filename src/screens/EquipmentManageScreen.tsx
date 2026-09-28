import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEquipment } from '../game/equipment';
import { useGame } from '../game/GameProvider';
import type { EquipmentSlot, ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SectionTitle } from '../ui/components';

type ViewMode = 'loadout' | 'forge' | 'promotion';

const slotOrder: EquipmentSlot[] = ['weapon', 'armor', 'shield', 'mount', 'artifact'];
const slotLabels: Record<EquipmentSlot, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  shield: 'Shield',
  mount: 'Mount',
  artifact: 'Artifact'
};

const resourceIcons: Record<keyof ResourceWallet, string> = {
  gold: '🪙',
  wood: '🪵',
  stone: '🪨',
  iron: '⛓',
  provisions: '🍞'
};

export function EquipmentManageScreen({
  unitId,
  onExit
}: {
  unitId: string;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    resources,
    units,
    equipmentInventory,
    unitEquipment,
    equipmentDefinitions,
    buildingLevels,
    craftEquipment,
    equipEquipment,
    upgradeEquippedItem,
    getAdvancedPromotionsForUnit,
    advancedPromoteUnit
  } = useGame();

  const [view, setView] = useState<ViewMode>('loadout');
  const [message, setMessage] = useState<string | null>(null);
  const unit = units.find(candidate => candidate.id === unitId);
  const loadout = unitEquipment[unitId] ?? {};
  const forgeLevel = buildingLevels.forge ?? 0;
  const stableLevel = buildingLevels.stable ?? 0;
  const advanced = getAdvancedPromotionsForUnit(unitId);

  const inventoryItems = equipmentInventory
    .map(id => getEquipment(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const craftableBaseItems = equipmentDefinitions.filter(
    item =>
      item.faction === 'human' &&
      !item.upgradeFromId &&
      item.requiredForgeLevel <= forgeLevel &&
      (item.requiredStableLevel ?? 0) <= stableLevel
  );

  const upgrades = useMemo(
    () =>
      slotOrder.flatMap(slot => {
        const currentId = loadout[slot];
        if (!currentId) return [];
        return equipmentDefinitions.filter(
          item =>
            item.upgradeFromId === currentId &&
            item.requiredForgeLevel <= forgeLevel
        );
      }),
    [equipmentDefinitions, forgeLevel, loadout]
  );

  if (!unit) {
    return null;
  }

  const canAfford = (cost: Partial<ResourceWallet>) =>
    Object.entries(cost).every(([key, amount]) => {
      const resourceKey = key as keyof ResourceWallet;
      return resources[resourceKey] >= (amount ?? 0);
    });

  const formatCost = (cost: Partial<ResourceWallet>) =>
    Object.entries(cost)
      .map(([key, amount]) => resourceIcons[key as keyof ResourceWallet] + ' ' + String(amount))
      .join('  ');

  const handleEquip = (itemId: string) => {
    setMessage(equipEquipment(unitId, itemId) ? 'Equipment assigned.' : 'Could not equip that item.');
  };

  const handleUpgrade = (itemId: string) => {
    const item = getEquipment(itemId);
    setMessage(
      upgradeEquippedItem(unitId, itemId)
        ? (item?.name ?? 'Equipment') + ' equipped as an upgrade.'
        : 'Upgrade requirements are not met.'
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <View style={styles.heroRow}>
          <View style={[styles.portrait, { borderColor: theme.colors.human }]}>
            <Text style={[styles.portraitLetter, { color: theme.colors.human }]}>{unit.name[0]}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>UNIT EQUIPMENT</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{unit.name}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {unit.className} · Tier {unit.tier} · ATK {unit.attack} · ARM {unit.armor} · SPD {unit.speed}
            </Text>
          </View>
        </View>
      </GameCard>

      <View style={[styles.segment, { backgroundColor: theme.colors.surface1 }]}>
        {(['loadout', 'forge', 'promotion'] as ViewMode[]).map(option => (
          <Pressable
            key={option}
            onPress={() => setView(option)}
            style={[
              styles.segmentButton,
              view === option ? { backgroundColor: theme.colors.surface2 } : undefined
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: view === option ? theme.colors.primary : theme.colors.textMuted }
              ]}
            >
              {option === 'loadout' ? 'Loadout' : option === 'forge' ? 'Forge' : 'Promotion'}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === 'loadout' ? (
        <>
          <SectionTitle title="Assigned equipment" />
          <View style={styles.slotGrid}>
            {slotOrder.map(slot => {
              const item = loadout[slot] ? getEquipment(loadout[slot]!) : null;
              return (
                <GameCard key={slot} style={styles.slotCard} accent={item ? theme.colors.gold : undefined}>
                  <Text style={[styles.slotLabel, { color: theme.colors.textMuted }]}>{slotLabels[slot].toUpperCase()}</Text>
                  <Text style={[styles.slotName, { color: theme.colors.text }]}>
                    {item?.name ?? 'Empty'}
                  </Text>
                  {item ? (
                    <Text style={[styles.slotStats, { color: theme.colors.primary }]}>
                      {item.attackBonus ? 'ATK +' + item.attackBonus + ' ' : ''}
                      {item.armorBonus ? 'ARM +' + item.armorBonus + ' ' : ''}
                      {item.speedBonus ? 'SPD ' + (item.speedBonus > 0 ? '+' : '') + item.speedBonus : ''}
                    </Text>
                  ) : null}
                </GameCard>
              );
            })}
          </View>

          <SectionTitle title="Unassigned inventory" trailing={String(inventoryItems.length)} />
          {inventoryItems.length > 0 ? (
            <View style={styles.list}>
              {inventoryItems.map((item, index) => (
                <GameCard key={item.id + '-' + index}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemCopy}>
                      <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                      <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>
                        Tier {item.tier} · {slotLabels[item.slot]}
                      </Text>
                    </View>
                    <Pill label="EQUIP" />
                  </View>
                  <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]}>
                    {item.description}
                  </Text>
                  <View style={styles.button}>
                    <PrimaryButton label={'Equip ' + item.name} onPress={() => handleEquip(item.id)} />
                  </View>
                </GameCard>
              ))}
            </View>
          ) : (
            <GameCard>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                No unassigned equipment. Craft basic gear in the Forge tab.
              </Text>
            </GameCard>
          )}
        </>
      ) : null}

      {view === 'forge' ? (
        <>
          <SectionTitle title={'Field Forge Lv.' + forgeLevel} trailing={forgeLevel >= 2 ? 'Tier II unlocked' : 'Tier I'} />

          <Text style={[styles.explainer, { color: theme.colors.textMuted }]}>
            Basic items are crafted into inventory. Tier II pieces preserve your investment by upgrading the item already assigned to this squad.
          </Text>

          <View style={styles.list}>
            {craftableBaseItems.map(item => (
              <GameCard key={item.id}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemCopy}>
                    <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>
                      Tier {item.tier} · {slotLabels[item.slot]}
                    </Text>
                  </View>
                  <Text style={[styles.costText, { color: theme.colors.gold }]}>
                    {formatCost(item.craftCost)}
                  </Text>
                </View>
                <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]}>{item.description}</Text>
                <View style={styles.button}>
                  <PrimaryButton
                    label={'Craft ' + item.name}
                    disabled={!canAfford(item.craftCost)}
                    onPress={() =>
                      setMessage(
                        craftEquipment(item.id)
                          ? item.name + ' crafted.'
                          : 'Cannot craft that recipe yet.'
                      )
                    }
                  />
                </View>
              </GameCard>
            ))}
          </View>

          <SectionTitle title="Equipped upgrades" trailing={String(upgrades.length)} />
          {upgrades.length > 0 ? (
            <View style={styles.list}>
              {upgrades.map(item => (
                <GameCard key={item.id} accent={theme.colors.gold}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemCopy}>
                      <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                      <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>
                        Upgrade from {getEquipment(item.upgradeFromId ?? '')?.name}
                      </Text>
                    </View>
                    <Text style={[styles.costText, { color: theme.colors.gold }]}>
                      {formatCost(item.craftCost)}
                    </Text>
                  </View>
                  <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]}>{item.description}</Text>
                  <View style={styles.button}>
                    <PrimaryButton
                      label={'Upgrade to ' + item.name}
                      disabled={!canAfford(item.craftCost)}
                      onPress={() => handleUpgrade(item.id)}
                    />
                  </View>
                </GameCard>
              ))}
            </View>
          ) : (
            <GameCard>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                No equipped piece has an available upgrade at the current Forge level.
              </Text>
            </GameCard>
          )}
        </>
      ) : null}

      {view === 'promotion' ? (
        <>
          <SectionTitle title="Class branches" trailing={advanced.length ? 'Gear + buildings' : 'No branch yet'} />
          {advanced.length > 0 ? (
            <View style={styles.list}>
              {advanced.map(promotion => {
                const equippedIds = Object.values(loadout).filter(
                  (value): value is string => Boolean(value)
                );
                const gearReady = promotion.requiredEquippedIds.every(id => equippedIds.includes(id));
                const barracksReady = (buildingLevels.barracks ?? 0) >= promotion.requiredBarracksLevel;
                const forgeReady = (buildingLevels.forge ?? 0) >= promotion.requiredForgeLevel;
                const stableReady =
                  (buildingLevels.stable ?? 0) >= (promotion.requiredStableLevel ?? 0);
                const ready = gearReady && barracksReady && forgeReady && stableReady;

                return (
                  <GameCard key={promotion.id} accent={ready ? theme.colors.primary : undefined}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemCopy}>
                        <Text style={[styles.itemName, { color: theme.colors.text }]}>{promotion.toClass}</Text>
                        <Text style={[styles.itemMeta, { color: theme.colors.human }]}>
                          {promotion.role.toUpperCase()}
                        </Text>
                      </View>
                      <Pill label={ready ? 'READY' : 'LOCKED'} />
                    </View>
                    <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]}>{promotion.pitch}</Text>
                    <View style={styles.requirements}>
                      <Text style={[styles.requirement, { color: gearReady ? theme.colors.primary : theme.colors.textMuted }]}>
                        {gearReady ? '✓' : '○'} Required gear: {promotion.requiredEquippedIds.map(id => getEquipment(id)?.name ?? id).join(' + ')}
                      </Text>
                      <Text style={[styles.requirement, { color: barracksReady ? theme.colors.primary : theme.colors.textMuted }]}>
                        {barracksReady ? '✓' : '○'} Barracks Lv.{promotion.requiredBarracksLevel}
                      </Text>
                      {promotion.requiredForgeLevel > 0 ? (
                        <Text style={[styles.requirement, { color: forgeReady ? theme.colors.primary : theme.colors.textMuted }]}>
                          {forgeReady ? '✓' : '○'} Forge Lv.{promotion.requiredForgeLevel}
                        </Text>
                      ) : null}
                      {(promotion.requiredStableLevel ?? 0) > 0 ? (
                        <Text style={[styles.requirement, { color: stableReady ? theme.colors.primary : theme.colors.textMuted }]}>
                          {stableReady ? '✓' : '○'} Stable Lv.{promotion.requiredStableLevel}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.button}>
                      <PrimaryButton
                        label={'Promote to ' + promotion.toClass}
                        disabled={!ready}
                        onPress={() =>
                          setMessage(
                            advancedPromoteUnit(unitId, promotion.id)
                              ? unit.name + ' promoted to ' + promotion.toClass + '.'
                              : 'Promotion requirements are incomplete.'
                          )
                        }
                      />
                    </View>
                  </GameCard>
                );
              })}
            </View>
          ) : (
            <GameCard>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                This class has no further branch available in the current prototype.
              </Text>
            </GameCard>
          )}
        </>
      ) : null}

      {message ? (
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
      ) : null}

      <PrimaryButton label="Return to Army" onPress={onExit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  heroRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  portrait: { width: 62, height: 70, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  portraitLetter: { fontSize: 22, fontWeight: '900' },
  heroCopy: { flex: 1 },
  eyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 24, fontWeight: '900', marginTop: 3 },
  subtitle: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  segment: { flexDirection: 'row', borderRadius: 16, padding: 4, gap: 4 },
  segmentButton: { flex: 1, minHeight: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 11, fontWeight: '900' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotCard: { width: '48%' },
  slotLabel: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1 },
  slotName: { fontSize: 13, fontWeight: '900', marginTop: 4 },
  slotStats: { fontSize: 9, fontWeight: '800', marginTop: 5 },
  list: { gap: 9 },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  itemCopy: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '900' },
  itemMeta: { fontSize: 9.5, fontWeight: '800', marginTop: 2 },
  itemDescription: { fontSize: 10.5, lineHeight: 15, marginTop: 7 },
  costText: { fontSize: 9.5, fontWeight: '900', textAlign: 'right' },
  button: { marginTop: 10 },
  emptyText: { fontSize: 11, lineHeight: 16, textAlign: 'center' },
  explainer: { fontSize: 10.5, lineHeight: 16, paddingHorizontal: 4 },
  requirements: { gap: 5, marginTop: 9 },
  requirement: { fontSize: 9.5, lineHeight: 14, fontWeight: '700' },
  message: { textAlign: 'center', fontSize: 10.5, lineHeight: 16, fontWeight: '800' }
});
