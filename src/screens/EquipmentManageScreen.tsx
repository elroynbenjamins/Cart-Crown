import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  canUnitEquipEquipment,
  equipmentSatisfiesRequirement,
  getEquipment
} from '../game/equipment';
import { useGame } from '../game/GameProvider';
import type { EquipmentDefinition, EquipmentSlot, ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, ResourceAmountRow, SectionTitle, StatusPill } from '../ui/components';
import { EquipmentStatLine } from '../ui/EquipmentStatLine';
import { RoleChip, SemanticChip, SemanticText, TierChip, UnitBadges } from '../ui/SemanticUI';
import { rolePresentation, semanticColor, tierTone } from '../ui/semanticColors';
import { EquipmentSprite, UnitSprite } from '../ui/gameArt';

type ViewMode = 'loadout' | 'forge' | 'promotion';

const slotOrder: EquipmentSlot[] = ['weapon', 'armor', 'shield', 'mount', 'artifact'];
const slotLabels: Record<EquipmentSlot, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  shield: 'Shield',
  mount: 'Mount',
  artifact: 'Artifact'
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
    activeFaction,
    resources,
    units,
    equipmentInventory,
    unitEquipment,
    equipmentDefinitions,
    buildingLevels,
    buildings,
    factionBuildingIds,
    settlementAdjacencyBonuses,
    getEquipmentCraftCost,
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
  const forgeLevel = buildingLevels[factionBuildingIds.forge] ?? 0;
  const stableLevel = buildingLevels[factionBuildingIds.mount] ?? 0;
  const armyLevel = buildingLevels[factionBuildingIds.army] ?? 0;
  const academyLevel = buildingLevels.officer_academy ?? 0;
  const advanced = getAdvancedPromotionsForUnit(unitId);
  const forgeName =
    buildings.find(building => building.id === factionBuildingIds.forge)?.name ??
    'Forge';
  const mountName =
    buildings.find(building => building.id === factionBuildingIds.mount)?.name ??
    'Mount Building';
  const armyName =
    buildings.find(building => building.id === factionBuildingIds.army)?.name ??
    'Army Building';
  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const inventoryItems = equipmentInventory
    .map(id => getEquipment(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const craftableBaseItems = equipmentDefinitions.filter(
    item =>
      item.faction === activeFaction &&
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
            item.faction === activeFaction &&
            item.upgradeFromId === currentId &&
            Boolean(unit && canUnitEquipEquipment(unit, item)) &&
            item.requiredForgeLevel <= forgeLevel &&
            (item.requiredStableLevel ?? 0) <= stableLevel
        );
      }),
    [activeFaction, equipmentDefinitions, forgeLevel, loadout, stableLevel, unit]
  );

  if (!unit) {
    return null;
  }

  const canAfford = (cost: Partial<ResourceWallet>) =>
    Object.entries(cost).every(([key, amount]) => {
      const resourceKey = key as keyof ResourceWallet;
      return resources[resourceKey] >= (amount ?? 0);
    });

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

  const renderComparison = (item: EquipmentDefinition) => {
    const current = getEquipment(loadout[item.slot] ?? '');
    return current
      ? <EquipmentStatLine item={item} current={current} label={'Change vs ' + current.name} />
      : null;
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={factionAccent} faction={activeFaction}>
        <View style={styles.heroRow}>
          <View style={[styles.portrait, { borderColor: semanticColor(theme, rolePresentation[unit.role]?.tone ?? 'neutral') }]}>
            <UnitSprite className={unit.className} faction={unit.faction} size={54} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: factionAccent }]}>UNIT EQUIPMENT</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{unit.name}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {unit.className} · Tier {unit.tier} · ATK {unit.attack} · ARM {unit.armor} · SPD {unit.speed}
            </Text>
          </View>
        </View>
        <View style={styles.badges}><UnitBadges role={unit.role} tier={unit.tier} battleTags={unit.battleTags} /></View>
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
                <GameCard
                  key={slot}
                  style={styles.slotCard}
                  faction={activeFaction}
                  state={item ? 'selected' : 'default'}
                  accent={item ? semanticColor(theme, tierTone(item.tier)) : undefined}
                >
                  <Text style={[styles.slotLabel, { color: theme.colors.textMuted }]}>{slotLabels[slot].toUpperCase()}</Text>
                  {item ? (
                    <View style={styles.slotArt}>
                      <EquipmentSprite equipmentId={item.id} faction={unit.faction} size={34} />
                    </View>
                  ) : null}
                  <Text style={[styles.slotName, { color: item ? semanticColor(theme, tierTone(item.tier)) : theme.colors.text }]}>
                    {item?.name ?? 'Empty'}
                  </Text>
                  {item ? (
                    <>
                      <View style={styles.badges}><TierChip tier={item.tier} compact /></View>
                      <EquipmentStatLine item={item} />
                    </>
                  ) : null}
                </GameCard>
              );
            })}
          </View>

          <SectionTitle title="Unassigned inventory" trailing={String(inventoryItems.length)} />
          {inventoryItems.length > 0 ? (
            <View style={styles.list}>
              {inventoryItems.map((item, index) => {
                const compatible = canUnitEquipEquipment(unit, item);
                return (
                <GameCard
                  key={item.id + '-' + index}
                  faction={activeFaction}
                  state={compatible ? 'default' : 'locked'}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.itemCopy}>
                      <Text style={[styles.itemName, { color: semanticColor(theme, tierTone(item.tier)) }]}>{item.name}</Text>
                      <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>
                        Tier {item.tier} · {slotLabels[item.slot]}
                      </Text>
                    </View>
                    <SemanticChip label={compatible ? 'Compatible' : 'Incompatible'} tone={compatible ? 'positive' : 'warning'} />
                  </View>
                  <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]}>
                    {item.description}
                  </Text>
                  <EquipmentStatLine item={item} />
                  {renderComparison(item)}
                  <View style={styles.button}>
                    <PrimaryButton
                      label={compatible ? 'Equip ' + item.name : 'Not compatible with ' + unit.className}
                      disabled={!compatible}
                      onPress={() => handleEquip(item.id)}
                    />
                  </View>
                </GameCard>
                );
              })}
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
          <SectionTitle
            title={forgeName + ' Lv.' + forgeLevel}
            trailing={forgeLevel >= 3 ? 'Tier III unlocked' : forgeLevel >= 2 ? 'Tier II unlocked' : 'Tier I'}
          />

          {settlementAdjacencyBonuses.some(
            bonus =>
              bonus.effects.equipmentCostMultiplier !== undefined &&
              bonus.effects.equipmentCostMultiplier < 1
          ) ? (
            <GameCard accent={theme.colors.primary}>
              <SemanticChip label="Equipment district active" tone="positive" />
              <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]}>
                Your settlement layout reduces equipment crafting and upgrade costs.
              </Text>
            </GameCard>
          ) : null}

          <Text style={[styles.explainer, { color: theme.colors.textMuted }]}>
            Basic items are crafted into inventory. Tier II pieces preserve your investment by upgrading the item already assigned to this squad.
          </Text>

          <View style={styles.list}>
            {craftableBaseItems.map(item => (
              <GameCard
                key={item.id}
                faction={activeFaction}
                state={canAfford(getEquipmentCraftCost(item)) ? 'default' : 'locked'}
              >
                <View style={styles.itemHeader}>
                  <View style={styles.itemArt}>
                    <EquipmentSprite equipmentId={item.id} faction={item.faction} size={40} />
                  </View>
                  <View style={styles.itemCopy}>
                    <Text style={[styles.itemName, { color: semanticColor(theme, tierTone(item.tier)) }]}>{item.name}</Text>
                    <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>
                      Tier {item.tier} · {slotLabels[item.slot]}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]}>{item.description}</Text>
                <EquipmentStatLine item={item} />
                <View style={styles.itemCostRow}>
                  <ResourceAmountRow values={getEquipmentCraftCost(item)} compact />
                </View>
                <View style={styles.badges}>
                  <TierChip tier={item.tier} />
                  <SemanticChip label={canAfford(getEquipmentCraftCost(item)) ? 'Materials ready' : 'Materials short'} tone={canAfford(getEquipmentCraftCost(item)) ? 'positive' : 'warning'} />
                </View>
                <View style={styles.button}>
                  <PrimaryButton
                    label={'Craft ' + item.name}
                    disabled={!canAfford(getEquipmentCraftCost(item))}
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
                <GameCard key={item.id} accent={semanticColor(theme, tierTone(item.tier))} faction={activeFaction} state="selected">
                  <View style={styles.itemHeader}>
                    <View style={styles.itemArt}>
                      <EquipmentSprite equipmentId={item.id} faction={item.faction} size={40} />
                    </View>
                    <View style={styles.itemCopy}>
                      <Text style={[styles.itemName, { color: semanticColor(theme, tierTone(item.tier)) }]}>{item.name}</Text>
                      <Text style={[styles.itemMeta, { color: theme.colors.textMuted }]}>
                        Upgrade from {getEquipment(item.upgradeFromId ?? '')?.name}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.badges}><TierChip tier={item.tier} /></View>
                  <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]}>{item.description}</Text>
                  <EquipmentStatLine item={item} />
                  {renderComparison(item)}
                  <View style={styles.itemCostRow}>
                    <ResourceAmountRow values={getEquipmentCraftCost(item)} compact />
                  </View>
                  <View style={styles.button}>
                    <PrimaryButton
                      label={'Upgrade to ' + item.name}
                      disabled={!canAfford(getEquipmentCraftCost(item))}
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
                const gearReady = promotion.requiredEquippedIds.every(requiredId =>
                  equippedIds.some(equippedId =>
                    equipmentSatisfiesRequirement(equippedId, requiredId)
                  )
                );
                const barracksReady =
                  armyLevel >= promotion.requiredBarracksLevel;
                const forgeReady =
                  forgeLevel >= promotion.requiredForgeLevel;
                const stableReady =
                  stableLevel >= (promotion.requiredStableLevel ?? 0);
                const academyReady =
                  academyLevel >=
                  (promotion.requiredOfficerAcademyLevel ?? 0);
                const ready =
                  gearReady &&
                  barracksReady &&
                  forgeReady &&
                  stableReady &&
                  academyReady;

                return (
                  <GameCard
                    key={promotion.id}
                    faction={activeFaction}
                    state={ready ? 'ready' : 'locked'}
                    accent={ready ? theme.colors.primary : undefined}
                  >
                    <View style={styles.itemHeader}>
                      <View style={styles.itemCopy}>
                        <Text style={[styles.itemName, { color: semanticColor(theme, rolePresentation[promotion.role]?.tone ?? 'neutral') }]}>{promotion.toClass}</Text>
                        <View style={styles.badges}><RoleChip role={promotion.role} /></View>
                      </View>
                      <StatusPill label={ready ? 'READY' : 'LOCKED'} tone={ready ? 'ready' : 'locked'} />
                    </View>
                    <Text style={[styles.itemDescription, { color: theme.colors.textMuted }]}>{promotion.pitch}</Text>
                    <EquipmentStatLine item={promotion} label="Class bonuses" />
                    <View style={styles.promotionVisualRow}>
                      <View style={styles.promotionGear}>
                        {promotion.requiredEquippedIds.map(id => (
                          <View key={id} style={styles.promotionGearItem}>
                            <EquipmentSprite equipmentId={id} faction={unit.faction} size={32} />
                          </View>
                        ))}
                      </View>
                      <Text style={[styles.promotionArrow, { color: theme.colors.textMuted }]}>→</Text>
                      <View style={styles.promotionResult}>
                        <UnitSprite className={promotion.toClass} faction={unit.faction} size={42} />
                      </View>
                    </View>
                    <View style={styles.requirements}>
                      <View style={styles.requirementRow}>
                        <SemanticChip label={gearReady ? 'Done' : 'Missing'} tone={gearReady ? 'positive' : 'warning'} compact />
                        <SemanticText tone={gearReady ? 'positive' : 'warning'} style={styles.requirement}>
                          Required gear: {promotion.requiredEquippedIds.map(id => getEquipment(id)?.name ?? id).join(' + ')}
                        </SemanticText>
                      </View>
                      <View style={styles.requirementRow}>
                        <SemanticChip label={barracksReady ? 'Done' : 'Needed'} tone={barracksReady ? 'positive' : 'warning'} compact />
                        <SemanticText tone={barracksReady ? 'positive' : 'warning'} style={styles.requirement}>
                          {armyName} Lv.{promotion.requiredBarracksLevel}
                        </SemanticText>
                      </View>
                      {promotion.requiredForgeLevel > 0 ? (
                        <View style={styles.requirementRow}>
                          <SemanticChip label={forgeReady ? 'Done' : 'Needed'} tone={forgeReady ? 'positive' : 'warning'} compact />
                          <SemanticText tone={forgeReady ? 'positive' : 'warning'} style={styles.requirement}>
                            {forgeName} Lv.{promotion.requiredForgeLevel}
                          </SemanticText>
                        </View>
                      ) : null}
                      {(promotion.requiredStableLevel ?? 0) > 0 ? (
                        <View style={styles.requirementRow}>
                          <SemanticChip label={stableReady ? 'Done' : 'Needed'} tone={stableReady ? 'positive' : 'warning'} compact />
                          <SemanticText tone={stableReady ? 'positive' : 'warning'} style={styles.requirement}>
                            {mountName} Lv.{promotion.requiredStableLevel}
                          </SemanticText>
                        </View>
                      ) : null}
                      {(promotion.requiredOfficerAcademyLevel ?? 0) > 0 ? (
                        <View style={styles.requirementRow}>
                          <SemanticChip label={academyReady ? 'Done' : 'Needed'} tone={academyReady ? 'positive' : 'warning'} compact />
                          <SemanticText tone={academyReady ? 'positive' : 'warning'} style={styles.requirement}>
                            Officer Academy Lv.{promotion.requiredOfficerAcademyLevel}
                          </SemanticText>
                        </View>
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
                This class has no further branch available in the current progression.
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
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 },
  heroRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  portrait: { width: 62, height: 70, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
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
  slotArt: { alignItems: 'center', marginVertical: 3 },
  slotName: { fontSize: 13, fontWeight: '900', marginTop: 4 },
  list: { gap: 9 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemArt: { width: 44, alignItems: 'center', justifyContent: 'center' },
  itemCopy: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '900' },
  itemMeta: { fontSize: 9.5, fontWeight: '800', marginTop: 2 },
  itemDescription: { fontSize: 10.5, lineHeight: 15, marginTop: 7 },
  itemCostRow: { marginTop: 9 },
  button: { marginTop: 10 },
  emptyText: { fontSize: 11, lineHeight: 16, textAlign: 'center' },
  explainer: { fontSize: 10.5, lineHeight: 16, paddingHorizontal: 4 },
  promotionVisualRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  promotionGear: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  promotionGearItem: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  promotionArrow: { fontSize: 18, fontWeight: '900' },
  promotionResult: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  requirements: { gap: 6, marginTop: 9 },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  requirement: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  message: { textAlign: 'center', fontSize: 10.5, lineHeight: 16, fontWeight: '800' }
});
