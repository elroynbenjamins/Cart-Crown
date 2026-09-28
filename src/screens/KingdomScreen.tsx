import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getBuildingLevelDefinition } from '../game/kingdom';
import { useGame } from '../game/GameProvider';
import type { ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  Pill,
  PrimaryButton,
  ProgressBar,
  ResourceChip,
  SecondaryButton,
  SectionTitle
} from '../ui/components';

const resourceIcons: Record<keyof ResourceWallet, string> = {
  gold: '🪙',
  wood: '🪵',
  stone: '🪨',
  iron: '⛓',
  provisions: '🍞'
};

export function KingdomScreen({
  onOpenRecruitment,
  onOpenForge,
  onOpenSettlement
}: {
  onOpenRecruitment: () => void;
  onOpenForge: () => void;
  onOpenSettlement: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    resources,
    currentWagonStage,
    holdTheRoadWon,
    settlementUpgraded,
    recruitChosen,
    canUpgradeSettlement,
    forgeUnlocked,
    buildings,
    buildingLevels,
    fortUpgradeAvailable,
    canUpgradeToFort,
    resourceSites,
    unlockedResourceSites,
    productionStock,
    claimProduction,
    isBuildingUnlocked,
    upgradeBuilding,
    upgradeToFort,
    rewardedAdClaims,
    rewardedAdMessage,
    claimRewardedAd,
    upgradeSettlement
  } = useGame();

  const [buildingMessage, setBuildingMessage] = useState<string | null>(null);

  const settlementName =
    currentWagonStage.id === 'fort'
      ? 'Greenkeep Fort'
      : settlementUpgraded
        ? 'Greenkeep Settlement'
        : 'Refugee Camp';
  const progress = holdTheRoadWon ? 1 : 0.34;
  const dailySupplyClaimed = (rewardedAdClaims.daily_supply ?? 0) >= 1;
  const unlockedCount = buildings.filter(building => isBuildingUnlocked(building.id)).length;
  const builtCount = buildings.filter(building => (buildingLevels[building.id] ?? 0) > 0).length;
  const productionTotal =
    productionStock.gold +
    productionStock.wood +
    productionStock.stone +
    productionStock.iron +
    productionStock.provisions;

  let milestoneTitle = 'Establish a permanent settlement';
  let milestoneBody = 'Win Hold the Road, then spend 90 Wood and 20 Stone to establish Greenkeep.';
  let buttonLabel = 'Upgrade settlement';
  let disabled = !canUpgradeSettlement;
  let requirement = holdTheRoadWon
    ? 'The road is secure. Resources are ready.'
    : 'Story milestone required: Hold the Road';
  let action = upgradeSettlement;

  if (settlementUpgraded && !recruitChosen) {
    milestoneTitle = 'Choose the first reinforcements';
    milestoneBody = 'Greenkeep can now support a third active squad. Choose which role joins your army first.';
    buttonLabel = 'Choose third squad';
    disabled = false;
    requirement = 'Archer · Scout · Field Medic';
    action = () => {
      onOpenRecruitment();
      return true;
    };
  } else if (currentWagonStage.id === 'fort') {
    milestoneTitle = 'Greenkeep Fort established';
    milestoneBody = 'The western road is secure. The next campaign tier can now push toward the Iron Road and a fourth active squad.';
    buttonLabel = 'Fort established';
    disabled = true;
    requirement = 'Chapter 2 progression comes next';
    action = () => false;
  } else if (settlementUpgraded && recruitChosen && fortUpgradeAvailable) {
    milestoneTitle = 'Raise Greenkeep Fort';
    milestoneBody = 'The Toll Captain is defeated. Complete the required building upgrades, then invest in walls, roads and a permanent Stable.';
    buttonLabel = 'Build Greenkeep Fort';
    disabled = !canUpgradeToFort;
    requirement =
      'Requires Barracks Lv.2 · Forge Lv.2 · Wagonwright Lv.2 · 150 Gold · 70 Wood · 35 Stone · 10 Iron';
    action = upgradeToFort;
  } else if (settlementUpgraded && recruitChosen) {
    milestoneTitle = 'Build toward the Fort';
    milestoneBody = 'Upgrade specialized buildings while the campaign opens the road toward the first Fort tier.';
    buttonLabel = 'Fort tier is story-gated';
    disabled = true;
    requirement = 'Improve Greenkeep and defeat the Toll Captain';
    action = () => false;
  }

  const formatCost = (cost: Partial<ResourceWallet>) =>
    Object.entries(cost)
      .map(([key, amount]) => resourceIcons[key as keyof ResourceWallet] + ' ' + String(amount))
      .join('  ');

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>HUMAN KINGDOM</Text>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{settlementName}</Text>
            <Text style={[styles.heroBody, { color: theme.colors.textMuted }]}>
              {settlementUpgraded
                ? 'Campaign milestones bring people and knowledge. You decide which systems receive the kingdom’s resources.'
                : 'Two squads, one damaged wagon, and the road to Greenkeep.'}
            </Text>
          </View>
          <View style={[styles.keepMark, { backgroundColor: theme.colors.surface2 }]}>
            <Text style={styles.keepMarkIcon}>{settlementUpgraded ? '♜' : '⌂'}</Text>
          </View>
        </View>

        <View style={styles.progressCopy}>
          <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
            {currentWagonStage.id === 'fort'
              ? 'Fort tier · 3'
              : settlementUpgraded
                ? 'Settlement tier · 2'
                : 'Raise Greenkeep Settlement'}
          </Text>
          <Text style={[styles.progressValue, { color: theme.colors.textMuted }]}>
            {settlementUpgraded ? unlockedCount + ' buildings online' : Math.round(progress * 100) + '%'}
          </Text>
        </View>
        <ProgressBar value={settlementUpgraded ? 0.34 : progress} color={theme.colors.human} />
      </GameCard>

      <View style={styles.resources}>
        <ResourceChip icon="🪙" value={resources.gold} label="Gold" />
        <ResourceChip icon="🪵" value={resources.wood} label="Wood" />
        <ResourceChip icon="🪨" value={resources.stone} label="Stone" />
        <ResourceChip icon="⛓" value={resources.iron} label="Iron" />
      </View>

      <GameCard>
        <View style={styles.goalRow}>
          <View style={styles.goalCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>CURRENT KINGDOM GOAL</Text>
            <Text style={[styles.goalTitle, { color: theme.colors.text }]}>{milestoneTitle}</Text>
            <Text style={[styles.goalBody, { color: theme.colors.textMuted }]}>{milestoneBody}</Text>
          </View>
          {!settlementUpgraded ? (
            <View style={styles.goalCost}>
              <Text style={[styles.costText, { color: theme.colors.text }]}>90 🪵</Text>
              <Text style={[styles.costText, { color: theme.colors.text }]}>20 🪨</Text>
            </View>
          ) : fortUpgradeAvailable && currentWagonStage.id !== 'fort' ? (
            <View style={styles.goalCost}>
              <Text style={[styles.costText, { color: theme.colors.text }]}>150 🪙</Text>
              <Text style={[styles.costText, { color: theme.colors.text }]}>70 🪵</Text>
              <Text style={[styles.costText, { color: theme.colors.text }]}>35 🪨</Text>
              <Text style={[styles.costText, { color: theme.colors.text }]}>10 ⛓</Text>
            </View>
          ) : null}
        </View>
        <PrimaryButton label={buttonLabel} disabled={disabled} onPress={action} />
        <Text style={[styles.requirement, { color: theme.colors.textMuted }]}>{requirement}</Text>
      </GameCard>

      <View style={styles.summaryRow}>
        <GameCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>SUPPLY WAGON</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {currentWagonStage.width}×{currentWagonStage.height}
          </Text>
          <Text style={[styles.summaryNote, { color: theme.colors.primary }]}>
            {currentWagonStage.formationSlots} active squads
          </Text>
        </GameCard>

        <GameCard style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>DEVELOPMENT</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{builtCount}/{unlockedCount}</Text>
          <Text style={[styles.summaryNote, { color: theme.colors.gold }]}>built / unlocked</Text>
        </GameCard>
      </View>

      <GameCard accent={theme.colors.human}>
        <View style={styles.settlementViewRow}>
          <View style={styles.settlementViewCopy}>
            <Text style={[styles.supplyTitle, { color: theme.colors.text }]}>View Greenkeep</Text>
            <Text style={[styles.supplyBody, { color: theme.colors.textMuted }]}>
              See the settlement, choose construction plots and buy unlocked buildings. New plots appear as Greenkeep grows.
            </Text>
          </View>
          <Text style={styles.settlementViewIcon}>🏘️</Text>
        </View>
        <View style={styles.supplyButton}>
          <PrimaryButton label="Open Settlement View" onPress={onOpenSettlement} />
        </View>
      </GameCard>

      {unlockedResourceSites.length > 0 ? (
        <>
          <SectionTitle title="Regional Production" trailing={productionTotal > 0 ? 'Stock ready' : 'Build stock through activities'} />
          <View style={styles.productionGrid}>
            {resourceSites
              .filter(site => unlockedResourceSites.includes(site.id))
              .map(site => (
                <GameCard key={site.id} style={styles.productionCard} accent={theme.colors.primary}>
                  <Text style={styles.productionIcon}>{site.icon}</Text>
                  <Text style={[styles.productionName, { color: theme.colors.text }]}>{site.name}</Text>
                  <Text style={[styles.productionBody, { color: theme.colors.textMuted }]}>
                    {site.description}
                  </Text>
                  <Text style={[styles.productionRate, { color: theme.colors.primary }]}>
                    Per activity · {Object.entries(site.productionPerActivity)
                      .map(([key, value]) => resourceIcons[key as keyof ResourceWallet] + ' +' + String(value))
                      .join('  ')}
                  </Text>
                </GameCard>
              ))}
          </View>

          <GameCard>
            <Text style={[styles.supplyTitle, { color: theme.colors.text }]}>Unclaimed Production</Text>
            <Text style={[styles.productionStock, { color: theme.colors.gold }]}>
              🪙 {productionStock.gold} · 🪵 {productionStock.wood} · 🪨 {productionStock.stone} · ⛓ {productionStock.iron} · 🍞 {productionStock.provisions}
            </Text>
            <Text style={[styles.supplyBody, { color: theme.colors.textMuted }]}>
              Campaign battles, Expeditions and Kingdom Defense advance one production cycle. Claim whenever you return to Greenkeep.
            </Text>
            <View style={styles.supplyButton}>
              <PrimaryButton
                label="Claim Production"
                disabled={productionTotal <= 0}
                onPress={() => {
                  const ok = claimProduction();
                  setBuildingMessage(ok ? 'Regional production transferred to Greenkeep.' : 'No production is ready yet.');
                }}
              />
            </View>
          </GameCard>
        </>
      ) : null}

      <SectionTitle title="Kingdom Buildings" trailing="Tap upgrade where available" />

      <View style={styles.buildingGrid}>
        {buildings.map(building => {
          const level = buildingLevels[building.id] ?? 0;
          const unlocked = isBuildingUnlocked(building.id);
          const nextDefinition = getBuildingLevelDefinition(building.id, level + 1);
          const canAttemptUpgrade = unlocked && Boolean(nextDefinition);
          const cost = nextDefinition?.cost ?? {};

          return (
            <GameCard
              key={building.id}
              style={styles.buildingCard}
              accent={unlocked ? theme.colors.human : undefined}
            >
              <View style={styles.buildingTop}>
                <Text style={styles.buildingEmoji}>{building.icon}</Text>
                <Pill label={unlocked ? 'LV.' + level : 'LOCKED'} />
              </View>
              <Text style={[styles.buildingName, { color: theme.colors.text }]}>{building.name}</Text>
              <Text style={[styles.buildingBody, { color: theme.colors.textMuted }]}>
                {building.description}
              </Text>

              {unlocked && level <= 0 ? (
                <>
                  <Text style={[styles.nextEffect, { color: theme.colors.gold }]}>
                    Blueprint unlocked · not constructed
                  </Text>
                  <Text style={[styles.lockNote, { color: theme.colors.textMuted }]}>
                    Choose an empty plot in Settlement View to buy and place this building.
                  </Text>
                </>
              ) : unlocked && nextDefinition ? (
                <>
                  <Text style={[styles.nextEffect, { color: theme.colors.primary }]}>
                    Next: {nextDefinition.effect}
                  </Text>
                  <Text style={[styles.buildingCost, { color: theme.colors.gold }]}>
                    {formatCost(cost)}
                  </Text>
                  <View style={styles.buildingButton}>
                    <PrimaryButton
                      label={'Upgrade to Lv.' + (level + 1)}
                      onPress={() => {
                        const ok = upgradeBuilding(building.id);
                        setBuildingMessage(
                          ok
                            ? building.name + ' upgraded to Lv.' + (level + 1) + '.'
                            : 'Requirements or resources are missing for ' + building.name + '.'
                        );
                      }}
                    />
                  </View>
                </>
              ) : unlocked ? (
                <Text style={[styles.lockNote, { color: theme.colors.textMuted }]}>
                  {building.id === 'hall'
                    ? 'Next settlement tier requires campaign progression.'
                    : 'No further upgrade in this prototype yet.'}
                </Text>
              ) : (
                <Text style={[styles.lockNote, { color: theme.colors.textMuted }]}>
                  {building.id === 'forge'
                    ? 'Investigate Marked Raiders.'
                    : building.id === 'war_room'
                      ? 'Win Mercenary Patrol.'
                      : building.id === 'quartermaster'
                        ? 'Secure Refugee Camp.'
                        : building.id === 'stable'
                          ? 'Raise Greenkeep Fort.'
                          : 'Story milestone required.'}
                </Text>
              )}
            </GameCard>
          );
        })}
      </View>

      {buildingMessage ? (
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>{buildingMessage}</Text>
      ) : null}

      {forgeUnlocked && (buildingLevels.forge ?? 0) > 0 ? (
        <>
          <SectionTitle title="Field Forge" trailing={'Lv.' + (buildingLevels.forge ?? 0)} />
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.supplyTitle, { color: theme.colors.text }]}>Troop Equipment</Text>
            <Text style={[styles.supplyBody, { color: theme.colors.textMuted }]}>
              Craft base equipment, assign it to squads, then upgrade the piece itself. Forge Lv.2 unlocks Tier II equipment and advanced class branches.
            </Text>
            <View style={styles.supplyButton}>
              <PrimaryButton label="Open Field Forge" onPress={onOpenForge} />
            </View>
          </GameCard>
        </>
      ) : null}

      <SectionTitle title="Daily Supply Cart" trailing="Optional rewarded ad" />
      <GameCard>
        <Text style={[styles.supplyTitle, { color: theme.colors.text }]}>Frontier Supplies</Text>
        <Text style={[styles.supplyBody, { color: theme.colors.textMuted }]}>
          Watch an optional rewarded ad for common supplies. A developed Quartermaster improves provision efficiency.
        </Text>
        <Text style={[styles.supplyReward, { color: theme.colors.gold }]}>
          +15 Wood · +{(buildingLevels.quartermaster ?? 0) >= 2 ? 20 : 15} Provisions
        </Text>
        <View style={styles.supplyButton}>
          <SecondaryButton
            label={dailySupplyClaimed ? 'Supply claimed' : 'Watch optional ad'}
            disabled={dailySupplyClaimed}
            onPress={() => void claimRewardedAd('daily_supply')}
          />
        </View>
        {rewardedAdMessage ? (
          <Text style={[styles.adMessage, { color: theme.colors.textMuted }]}>{rewardedAdMessage}</Text>
        ) : null}
      </GameCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  hero: { gap: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  heroCopy: { flex: 1 },
  eyebrow: { fontSize: 10, letterSpacing: 1.2, fontWeight: '900' },
  heroTitle: { fontSize: 28, lineHeight: 34, fontWeight: '900', marginTop: 5 },
  heroBody: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  keepMark: { width: 74, height: 74, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  keepMarkIcon: { fontSize: 36 },
  progressCopy: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  progressLabel: { fontSize: 13, fontWeight: '800' },
  progressValue: { fontSize: 11, fontWeight: '800' },
  resources: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  goalRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  goalCopy: { flex: 1 },
  goalTitle: { fontSize: 17, fontWeight: '900', marginTop: 4 },
  goalBody: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  goalCost: { alignItems: 'flex-end', justifyContent: 'center', gap: 5 },
  costText: { fontSize: 13, fontWeight: '900' },
  requirement: { textAlign: 'center', marginTop: 9, fontSize: 11 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: { flex: 1 },
  summaryLabel: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1 },
  summaryValue: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  summaryNote: { fontSize: 9.5, fontWeight: '800', marginTop: 3 },
  productionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  productionCard: { width: '48%' },
  productionIcon: { fontSize: 23 },
  productionName: { fontSize: 13, fontWeight: '900', marginTop: 6 },
  productionBody: { fontSize: 9.5, lineHeight: 14, marginTop: 4, minHeight: 42 },
  productionRate: { fontSize: 8.5, lineHeight: 13, fontWeight: '900', marginTop: 6 },
  productionStock: { fontSize: 10.5, lineHeight: 16, fontWeight: '900', marginTop: 6 },
  buildingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  buildingCard: { width: '48%' },
  buildingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  buildingEmoji: { fontSize: 24 },
  buildingName: { fontSize: 14, fontWeight: '900', marginTop: 8 },
  buildingBody: { fontSize: 9.5, lineHeight: 14, marginTop: 4, minHeight: 42 },
  nextEffect: { fontSize: 9, lineHeight: 13, fontWeight: '800', marginTop: 7 },
  buildingCost: { fontSize: 8.5, lineHeight: 13, fontWeight: '900', marginTop: 6 },
  buildingButton: { marginTop: 9 },
  lockNote: { fontSize: 9, lineHeight: 13, fontWeight: '700', marginTop: 8 },
  message: { fontSize: 10.5, lineHeight: 16, textAlign: 'center', fontWeight: '800' },
  settlementViewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settlementViewCopy: { flex: 1 },
  settlementViewIcon: { fontSize: 34 },
  supplyTitle: { fontSize: 15, fontWeight: '900' },
  supplyBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  supplyReward: { fontSize: 11, fontWeight: '900', marginTop: 7 },
  supplyButton: { marginTop: 11 },
  adMessage: { fontSize: 10, textAlign: 'center', marginTop: 7 }
});
