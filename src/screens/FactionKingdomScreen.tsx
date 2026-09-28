import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { getBuildingLevelDefinition } from '../game/kingdom';
import { useGame } from '../game/GameProvider';
import type { ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  Pill,
  PrimaryButton,
  ResourceChip,
  SectionTitle
} from '../ui/components';
import { BuildingSprite, ResourceSiteSprite, ResourceSprite, SettlementStageSprite } from '../ui/gameArt';

const resourceIcons: Record<keyof ResourceWallet, string> = {
  gold: '🪙',
  wood: '🪵',
  stone: '🪨',
  iron: '⛓',
  provisions: '🍞'
};

export function FactionKingdomScreen({
  onOpenSettlement,
  onOpenRecruitment,
  onOpenCommander
}: {
  onOpenSettlement: () => void;
  onOpenRecruitment: () => void;
  onOpenCommander: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    resources,
    currentWagonStage,
    recruitChoiceAvailable,
    recruitChosen,
    buildings,
    buildingLevels,
    settlementAdjacencyBonuses,
    factionFortUpgradeAvailable,
    canUpgradeFactionFort,
    factionTownUpgradeAvailable,
    canUpgradeFactionTown,
    upgradeFactionToFort,
    upgradeFactionToTown,
    upgradeBuilding,
    isBuildingUnlocked,
    activeCommanderPath,
    commanderRespecCost,
    unlockedResourceSites,
    resourceSites,
    productionStock,
    claimProduction
  } = useGame();

  const [message, setMessage] = useState<string | null>(null);
  const elf = activeFaction === 'elf';
  const accent = elf ? theme.colors.elf : theme.colors.orc;
  const faction = factions[activeFaction];

  const settlementName =
    elf
      ? currentWagonStage.id === 'town'
        ? 'Heartgrove Enclave'
        : currentWagonStage.id === 'fort'
          ? 'Heartgrove Wardhold'
          : 'Heartgrove Sanctuary'
      : currentWagonStage.id === 'town'
        ? 'Emberclan Great Warhold'
        : currentWagonStage.id === 'fort'
          ? 'Emberclan Warhold'
          : 'Emberclan Warcamp';

  const productionTotal = Object.values(productionStock).reduce(
    (total, value) => total + value,
    0
  );

  let goalTitle = elf ? 'Restore the Last Heartgrove' : 'Gather the Clans';
  let goalBody = elf
    ? 'Use the Sanctuary, Wards and a third squad to secure the inner rootways.'
    : 'Use the Warcamp, Momentum and a third squad to bind the Red Plains clans.';
  let goalButton = 'Continue Chapter 2';
  let goalDisabled = true;
  let goalAction = () => false;

  if (recruitChoiceAvailable && !recruitChosen) {
    goalTitle = 'Choose the third squad';
    goalBody = 'Your new settlement can support one more active squad.';
    goalButton = 'Choose third squad';
    goalDisabled = false;
    goalAction = () => {
      onOpenRecruitment();
      return true;
    };
  } else if (factionFortUpgradeAvailable) {
    goalTitle = elf ? 'Raise Heartgrove Wardhold' : 'Raise Emberclan Warhold';
    goalBody = elf
      ? 'The Ashroot Stalker is defeated. Upgrade the Warden Lodge, Moon Forge and Caravan Grove, then fortify the rootway.'
      : 'The Clanbreaker is defeated. Upgrade the Clan Yard, Bone Forge and War Cartwright, then raise a permanent Warhold.';
    goalButton = elf ? 'Build Wardhold' : 'Build Warhold';
    goalDisabled = !canUpgradeFactionFort;
    goalAction = upgradeFactionToFort;
  } else if (factionTownUpgradeAvailable) {
    goalTitle = elf ? 'Raise Heartgrove Enclave' : 'Raise the Great Warhold';
    goalBody = elf
      ? 'The Pale Ranger is defeated. Upgrade the Warden Lodge, Moon Forge and Caravan Grove to Lv.3, maintain Stag and ward infrastructure, then establish a permanent Enclave.'
      : 'The Stonejaw Champion has yielded. Upgrade the Clan Yard, Bone Forge and War Cartwright to Lv.3, maintain Warg and watchfire infrastructure, then raise the Great Warhold.';
    goalButton = elf ? 'Build Heartgrove Enclave' : 'Build Great Warhold';
    goalDisabled = !canUpgradeFactionTown;
    goalAction = upgradeFactionToTown;
  } else if (currentWagonStage.id === 'town') {
    goalTitle = elf ? 'Heartgrove Enclave established' : 'Great Warhold established';
    goalBody = elf
      ? 'Five-squad capacity and 5×6 caravan logistics are ready for Roots in Ash.'
      : 'Five-squad capacity and 5×6 War Cart logistics are ready for War on Two Fronts.';
    goalButton = 'Chapter 4 ready';
    goalDisabled = true;
  } else if (currentWagonStage.id === 'fort') {
    goalTitle = elf ? 'Secure Moonlit Pass' : 'Complete the Stonejaw Trial';
    goalBody = elf
      ? 'Use four-squad Ward formations and the restored rootway network to reach the Pale Ranger.'
      : 'Use a four-squad warband, Warg infrastructure and clan signals to defeat the Stonejaw Champion.';
    goalButton = 'Town tier is story-gated';
    goalDisabled = true;
  }

  const formatCost = (cost: Partial<ResourceWallet>) =>
    Object.entries(cost)
      .map(([key, value]) => resourceIcons[key as keyof ResourceWallet] + ' ' + String(value))
      .join('  ');

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: accent }]}>
              {faction.name.toUpperCase()} KINGDOM
            </Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{settlementName}</Text>
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>
              {faction.gameplayIdentity}
            </Text>
          </View>
          <SettlementStageSprite
            stageId={currentWagonStage.id as any}
            faction={activeFaction}
            size={78}
          />
        </View>
      </GameCard>

      <View style={styles.resources}>
        <ResourceChip art={<ResourceSprite resource="gold" size={28} />} value={resources.gold} label="Gold" />
        <ResourceChip art={<ResourceSprite resource="wood" size={28} />} value={resources.wood} label="Wood" />
        <ResourceChip art={<ResourceSprite resource="stone" size={28} />} value={resources.stone} label="Stone" />
        <ResourceChip art={<ResourceSprite resource="iron" size={28} />} value={resources.iron} label="Iron" />
      </View>

      <GameCard>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>CURRENT KINGDOM GOAL</Text>
        <Text style={[styles.goalTitle, { color: theme.colors.text }]}>{goalTitle}</Text>
        <Text style={[styles.goalBody, { color: theme.colors.textMuted }]}>{goalBody}</Text>
        <View style={styles.button}>
          <PrimaryButton label={goalButton} disabled={goalDisabled} onPress={goalAction} />
        </View>
      </GameCard>

      <GameCard accent={accent}>
        <View style={styles.settlementRow}>
          <View style={styles.settlementCopy}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Settlement View</Text>
            <Text style={[styles.cardBody, { color: theme.colors.textMuted }]}>
              Place faction-specific buildings and tune {settlementAdjacencyBonuses.length} active adjacency {settlementAdjacencyBonuses.length === 1 ? 'bonus' : 'bonuses'}.
            </Text>
          </View>
          <SettlementStageSprite
            stageId={currentWagonStage.id as any}
            faction={activeFaction}
            size={58}
          />
        </View>
        <View style={styles.button}>
          <PrimaryButton label="Open Settlement View" onPress={onOpenSettlement} />
        </View>
      </GameCard>

      {activeCommanderPath ? (
        <GameCard>
          <View style={styles.commanderRow}>
            <View style={styles.commanderCopy}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {activeCommanderPath.name}
              </Text>
              <Text style={[styles.cardBody, { color: theme.colors.textMuted }]}>
                {activeCommanderPath.passiveDescription}
              </Text>
            </View>
            <Pill label={activeCommanderPath.title.toUpperCase()} />
          </View>
          <View style={styles.button}>
            <PrimaryButton
              label={'Retrain · ' + commanderRespecCost + ' Gold'}
              onPress={onOpenCommander}
            />
          </View>
        </GameCard>
      ) : null}

      {unlockedResourceSites.length > 0 ? (
        <>
          <SectionTitle title="Regional Production" trailing={productionTotal > 0 ? 'Stock ready' : 'Building stock'} />
          <View style={styles.productionGrid}>
            {resourceSites
              .filter(site => unlockedResourceSites.includes(site.id))
              .map(site => (
                <GameCard key={site.id} style={styles.productionCard} accent={accent}>
                  <View style={styles.productionIcon}><ResourceSiteSprite siteId={site.id} faction={activeFaction} size={44} /></View>
                  <Text style={[styles.productionName, { color: theme.colors.text }]}>{site.name}</Text>
                  <Text style={[styles.productionRate, { color: accent }]}>
                    {Object.entries(site.productionPerActivity)
                      .map(([key, value]) => resourceIcons[key as keyof ResourceWallet] + ' +' + String(value))
                      .join('  ')}
                  </Text>
                </GameCard>
              ))}
          </View>
          <GameCard>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Unclaimed Production</Text>
            <Text style={[styles.productionStock, { color: theme.colors.gold }]}>
              🪙 {productionStock.gold} · 🪵 {productionStock.wood} · 🪨 {productionStock.stone} · ⛓ {productionStock.iron} · 🍞 {productionStock.provisions}
            </Text>
            <View style={styles.button}>
              <PrimaryButton
                label="Claim Production"
                disabled={productionTotal <= 0}
                onPress={() =>
                  setMessage(
                    claimProduction()
                      ? 'Regional production transferred to the settlement.'
                      : 'No production is ready yet.'
                  )
                }
              />
            </View>
          </GameCard>
        </>
      ) : null}

      <SectionTitle title="Faction Buildings" trailing="Build in Settlement View" />
      <View style={styles.buildingGrid}>
        {buildings.map(building => {
          const unlocked = isBuildingUnlocked(building.id);
          const level = buildingLevels[building.id] ?? 0;
          const next = level > 0
            ? getBuildingLevelDefinition(building.id, level + 1)
            : null;

          return (
            <GameCard
              key={building.id}
              style={styles.buildingCard}
              accent={unlocked && level > 0 ? accent : undefined}
            >
              <View style={styles.buildingTop}>
                <BuildingSprite buildingId={building.id} faction={activeFaction} size={42} />
                <Pill label={level > 0 ? 'LV.' + level : unlocked ? 'BLUEPRINT' : 'LOCKED'} />
              </View>
              <Text style={[styles.buildingName, { color: theme.colors.text }]}>{building.name}</Text>
              <Text style={[styles.buildingBody, { color: theme.colors.textMuted }]}>{building.description}</Text>

              {level <= 0 ? (
                <Text style={[styles.buildingHint, { color: unlocked ? accent : theme.colors.textMuted }]}>
                  {unlocked ? 'Choose a plot to construct.' : 'Progress Chapter 2 to unlock.'}
                </Text>
              ) : next ? (
                <>
                  <Text style={[styles.buildingHint, { color: accent }]}>Next: {next.effect}</Text>
                  <Text style={[styles.cost, { color: theme.colors.gold }]}>{formatCost(next.cost)}</Text>
                  <View style={styles.button}>
                    <PrimaryButton
                      label={'Upgrade to Lv.' + (level + 1)}
                      onPress={() =>
                        setMessage(
                          upgradeBuilding(building.id)
                            ? building.name + ' upgraded.'
                            : 'Requirements or resources are missing.'
                        )
                      }
                    />
                  </View>
                </>
              ) : null}
            </GameCard>
          );
        })}
      </View>

      {message ? (
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  heroRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  heroCopy: { flex: 1 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 27, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  resources: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  goalTitle: { fontSize: 17, fontWeight: '900', marginTop: 4 },
  goalBody: { fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  button: { marginTop: 10 },
  settlementRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settlementCopy: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '900' },
  cardBody: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  commanderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  commanderCopy: { flex: 1 },
  productionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  productionCard: { width: '48%' },
  productionIcon: { height: 46, alignItems: 'center', justifyContent: 'center' },
  productionName: { fontSize: 12.5, fontWeight: '900', marginTop: 5 },
  productionRate: { fontSize: 9, fontWeight: '900', lineHeight: 14, marginTop: 6 },
  productionStock: { fontSize: 10.5, fontWeight: '900', lineHeight: 16, marginTop: 6 },
  buildingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  buildingCard: { width: '48%' },
  buildingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  buildingName: { fontSize: 13.5, fontWeight: '900', marginTop: 7 },
  buildingBody: { fontSize: 9.5, lineHeight: 14, marginTop: 4, minHeight: 42 },
  buildingHint: { fontSize: 9, lineHeight: 13, fontWeight: '800', marginTop: 7 },
  cost: { fontSize: 8.5, fontWeight: '900', lineHeight: 13, marginTop: 5 },
  message: { textAlign: 'center', fontSize: 10.5, fontWeight: '800' }
});
