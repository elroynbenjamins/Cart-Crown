import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import type { ResourceWallet } from '../game/types';
import { getExpansionCost } from '../game/balance';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard, MetricTile, PrimaryButton, ProgressBar, ResourceAmountRow,
  ResourceChip, ScreenHero, SecondaryButton, SectionTitle, StatusPill
} from '../ui/components';
import { KingdomBuildings } from '../ui/KingdomBuildings';
import { BuildingCosts } from '../ui/SettlementUI';
import { ResourceSiteSprite, ResourceSprite, SettlementStageSprite } from '../ui/gameArt';
import { TutorialFocus } from '../ui/TutorialFocus';
import type { TutorialFocusTarget } from '../game/tutorial';

export function KingdomScreen({
  onOpenRecruitment, onOpenForge, onOpenSettlement, onOpenRoyalDecrees,
  tutorialFocus, onTutorialFocusComplete
}: {
  onOpenRecruitment: () => void;
  onOpenForge: () => void;
  onOpenSettlement: () => void;
  onOpenRoyalDecrees: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    resources, currentWagonStage, holdTheRoadWon, settlementUpgraded, recruitChosen,
    canUpgradeSettlement, forgeUnlocked, buildings, buildingLevels,
    fortUpgradeAvailable, canUpgradeToFort, townUpgradeAvailable, canUpgradeToTown,
    strongholdUpgradeAvailable, canUpgradeToStronghold, capitalUpgradeAvailable,
    canUpgradeToCapital, grandUpgradeAvailable, canUpgradeToGrand, upgradeToTown,
    upgradeToStronghold, upgradeToCapital, upgradeToGrand, activeRoyalDecree,
    royalDecreeSwitchCost, resourceSites, unlockedResourceSites, productionStock,
    settlementAdjacencyBonuses, settlementEffects, claimProduction, isBuildingUnlocked,
    upgradeBuilding, upgradeToFort, rewardedAdClaims, rewardedAdMessage,
    claimRewardedAd, upgradeSettlement
  } = useGame();
  const [buildingMessage, setBuildingMessage] = useState<string | null>(null);

  const settlementName = currentWagonStage.id === 'grand' ? 'Greenkeep Grand Campaign'
    : currentWagonStage.id === 'capital' ? 'Greenkeep Capital'
      : currentWagonStage.id === 'stronghold' ? 'Greenkeep Stronghold'
        : currentWagonStage.id === 'town' ? 'Greenkeep Town'
          : currentWagonStage.id === 'fort' ? 'Greenkeep Fort'
            : settlementUpgraded ? 'Greenkeep Settlement' : 'Refugee Camp';
  const dailySupplyClaimed = (rewardedAdClaims.daily_supply ?? 0) >= 1;
  const unlockedBuildings = buildings.filter(building => isBuildingUnlocked(building.id));
  const unlockedCount = unlockedBuildings.length;
  const builtCount = unlockedBuildings.filter(building => (buildingLevels[building.id] ?? 0) > 0).length;
  const developmentProgress = unlockedCount > 0 ? builtCount / unlockedCount : 0;
  const productionTotal = productionStock.gold + productionStock.wood + productionStock.stone + productionStock.iron + productionStock.provisions;

  let milestoneTitle = 'Establish a permanent settlement';
  let milestoneBody = 'Win Hold the Road, then spend 90 Wood and 20 Stone to establish Greenkeep.';
  let buttonLabel = 'Upgrade settlement';
  let disabled = !canUpgradeSettlement;
  let requirement = holdTheRoadWon
    ? canUpgradeSettlement ? 'The road is secure. Resources are ready.' : 'The road is secure. Check the required expansion materials.'
    : 'Story milestone required: Hold the Road';
  let action = upgradeSettlement;
  let milestoneCost: Partial<ResourceWallet> | null = { wood: 90, stone: 20 };

  if (settlementUpgraded && !recruitChosen) {
    milestoneTitle = 'Choose the first reinforcements';
    milestoneBody = 'Greenkeep can now support a third active squad. Choose which role joins your army first.';
    buttonLabel = 'Choose third squad';
    disabled = false;
    requirement = 'Archer · Scout · Field Medic';
    action = () => { onOpenRecruitment(); return true; };
    milestoneCost = null;
  } else if (currentWagonStage.id === 'grand') {
    milestoneTitle = 'Grand Campaign prepared';
    milestoneBody = 'Greenkeep has committed every major road, depot and command network to the final march into Crownspire.';
    buttonLabel = 'Grand Campaign ready';
    disabled = true;
    requirement = 'Chapter 6 · Return to Crownspire';
    action = () => false;
    milestoneCost = null;
  } else if (currentWagonStage.id === 'capital' && grandUpgradeAvailable) {
    milestoneTitle = 'Prepare the Grand Campaign';
    milestoneBody = 'The Gate of Crownspire is open. Finish the Capital command, supply, remount and signal network, keep a Royal Decree active, then fund the final 7×9 campaign expansion.';
    buttonLabel = 'Prepare Grand Campaign';
    disabled = !canUpgradeToGrand;
    requirement = 'Requires Barracks Lv.5 · Forge Lv.5 · Wagonwright Lv.5 · War Room Lv.4 · Quartermaster Lv.4 · Stable Lv.3 · Signal Tower Lv.3 · Officer Academy Lv.2 · Active Royal Decree · listed expansion resources';
    action = upgradeToGrand;
    milestoneCost = getExpansionCost('human', 'grand');
  } else if (currentWagonStage.id === 'capital') {
    milestoneTitle = 'Open the Gate of Crownspire';
    milestoneBody = 'Use the Capital’s decree, elite army and provincial production network to expose the Ashen Court and reach Crownspire.';
    buttonLabel = 'Grand Campaign is story-gated';
    disabled = true;
    requirement = 'Defeat the Gate of Crownspire';
    action = () => false;
    milestoneCost = null;
  } else if (currentWagonStage.id === 'stronghold' && capitalUpgradeAvailable) {
    milestoneTitle = 'Raise Greenkeep Capital';
    milestoneBody = 'The Pretender General is defeated. Mature the Stronghold’s military, logistics, signals and officer corps before funding the Capital expansion.';
    buttonLabel = 'Build Greenkeep Capital';
    disabled = !canUpgradeToCapital;
    requirement = 'Requires Barracks Lv.5 · Forge Lv.5 · Wagonwright Lv.5 · War Room Lv.3 · Quartermaster Lv.3 · Stable Lv.2 · Signal Tower Lv.2 · Officer Academy built · listed expansion resources';
    action = upgradeToCapital;
    milestoneCost = getExpansionCost('human', 'capital');
  } else if (currentWagonStage.id === 'stronghold') {
    milestoneTitle = 'Break the old royal command';
    milestoneBody = 'Use the six-squad Stronghold army and elite equipment to expose the officers still issuing orders in the name of an empty throne.';
    buttonLabel = 'Capital tier is story-gated';
    disabled = true;
    requirement = 'Defeat the Pretender General';
    action = () => false;
    milestoneCost = null;
  } else if (currentWagonStage.id === 'town' && strongholdUpgradeAvailable) {
    milestoneTitle = 'Raise Greenkeep Stronghold';
    milestoneBody = 'Lord Marshal Veyr is defeated. Upgrade Greenkeep’s military, logistics and command buildings before funding the Stronghold walls and heavy campaign infrastructure.';
    buttonLabel = 'Build Greenkeep Stronghold';
    disabled = !canUpgradeToStronghold;
    requirement = 'Requires Barracks Lv.4 · Forge Lv.4 · Wagonwright Lv.4 · War Room Lv.2 · Quartermaster Lv.2 · Stable and Signal Tower built · listed expansion resources';
    action = upgradeToStronghold;
    milestoneCost = getExpansionCost('human', 'stronghold');
  } else if (currentWagonStage.id === 'town') {
    milestoneTitle = 'Secure the Border Marches';
    milestoneBody = 'Strengthen the Town and expose the false marcher orders while pushing toward Lord Marshal Veyr.';
    buttonLabel = 'Stronghold tier is story-gated';
    disabled = true;
    requirement = 'Defeat Lord Marshal Veyr';
    action = () => false;
    milestoneCost = null;
  } else if (currentWagonStage.id === 'fort' && townUpgradeAvailable) {
    milestoneTitle = 'Raise Greenkeep Town';
    milestoneBody = 'The Iron Provost is defeated. Finish the professional Barracks, Forge and Wagonwright upgrades, maintain a Stable and rebuild the Signal Tower before funding the Town expansion.';
    buttonLabel = 'Build Greenkeep Town';
    disabled = !canUpgradeToTown;
    requirement = 'Requires Barracks Lv.3 · Forge Lv.3 · Wagonwright Lv.3 · Stable and Signal Tower built · listed expansion resources';
    action = upgradeToTown;
    milestoneCost = getExpansionCost('human', 'town');
  } else if (currentWagonStage.id === 'fort') {
    milestoneTitle = 'Secure the Iron Road';
    milestoneBody = 'Develop the Fort, expand cavalry and restore the frontier network while pushing toward the Iron Provost.';
    buttonLabel = 'Town tier is story-gated';
    disabled = true;
    requirement = 'Defeat the Iron Provost';
    action = () => false;
    milestoneCost = null;
  } else if (settlementUpgraded && recruitChosen && fortUpgradeAvailable) {
    milestoneTitle = 'Raise Greenkeep Fort';
    milestoneBody = 'The Toll Captain is defeated. Complete the required building upgrades, then invest in walls, roads and a permanent Stable.';
    buttonLabel = 'Build Greenkeep Fort';
    disabled = !canUpgradeToFort;
    requirement = 'Requires Barracks Lv.2 · Forge Lv.2 · Wagonwright Lv.2 · listed expansion resources';
    action = upgradeToFort;
    milestoneCost = getExpansionCost('human', 'fort');
  } else if (settlementUpgraded && recruitChosen) {
    milestoneTitle = 'Build toward the Fort';
    milestoneBody = 'Upgrade specialized buildings while the campaign opens the road toward the first Fort tier.';
    buttonLabel = 'Fort tier is story-gated';
    disabled = true;
    requirement = 'Improve Greenkeep and defeat the Toll Captain';
    action = () => false;
    milestoneCost = null;
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHero
        eyebrow="HUMAN KINGDOM"
        title={settlementName}
        body={settlementUpgraded
          ? 'Campaign milestones bring people and knowledge. You decide which systems receive the kingdom’s resources.'
          : 'Two squads, one damaged wagon, and the road to Greenkeep.'}
        accent={theme.colors.human}
        status={<StatusPill label={currentWagonStage.id === 'grand' ? 'TIER 7'
          : currentWagonStage.id === 'capital' ? 'TIER 6'
            : currentWagonStage.id === 'stronghold' ? 'TIER 5'
              : currentWagonStage.id === 'town' ? 'TIER 4'
                : currentWagonStage.id === 'fort' ? 'TIER 3'
                  : settlementUpgraded ? 'TIER 2' : 'CAMP'} tone="current" />}
      >
        <View style={styles.heroContent}>
          <View style={[styles.keepMark, { backgroundColor: theme.colors.surface2 }]}>
            <SettlementStageSprite stageId={currentWagonStage.id} size={52} />
          </View>
          <View style={styles.heroMetrics}>
            <MetricTile label="DEVELOPMENT" value={builtCount + '/' + unlockedCount} caption="built / unlocked" tone="gold" />
            <MetricTile label="SQUAD CAPACITY" value={currentWagonStage.formationSlots} caption={currentWagonStage.width + '×' + currentWagonStage.height + ' wagon'} tone="positive" />
          </View>
        </View>
        <View style={styles.heroProgress}>
          <Text style={[styles.developmentLabel, { color: theme.colors.textMuted }]}>Available buildings constructed</Text>
          <ProgressBar value={developmentProgress} color={theme.colors.human} />
        </View>
      </ScreenHero>

      <View style={styles.resources}>
        <ResourceChip art={<ResourceSprite resource="gold" size={22} />} value={resources.gold} label="Gold" />
        <ResourceChip art={<ResourceSprite resource="wood" size={22} />} value={resources.wood} label="Wood" />
        <ResourceChip art={<ResourceSprite resource="stone" size={22} />} value={resources.stone} label="Stone" />
        <ResourceChip art={<ResourceSprite resource="iron" size={22} />} value={resources.iron} label="Iron" />
      </View>

      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>CURRENT KINGDOM GOAL</Text>
        <Text style={[styles.goalTitle, { color: theme.colors.text }]}>{milestoneTitle}</Text>
        <Text style={[styles.goalBody, { color: theme.colors.textMuted }]}>{milestoneBody}</Text>
        {milestoneCost ? <BuildingCosts cost={milestoneCost} wallet={resources} title="Expansion cost" /> : null}
        <View style={styles.supplyButton}>
          <PrimaryButton label={buttonLabel} disabled={disabled} onPress={action} />
        </View>
        <Text style={[styles.requirement, { color: theme.colors.textMuted }]}>{requirement}</Text>
      </GameCard>

      <GameCard accent={theme.colors.human}>
        <View style={styles.settlementViewRow}>
          <View style={styles.settlementViewCopy}>
            <Text style={[styles.supplyTitle, { color: theme.colors.text }]}>View Greenkeep</Text>
            <Text style={[styles.supplyBody, { color: theme.colors.textMuted }]}>
              See the settlement, choose construction plots and tune adjacency bonuses. {settlementAdjacencyBonuses.length} district {settlementAdjacencyBonuses.length === 1 ? 'bonus is' : 'bonuses are'} active.
            </Text>
          </View>
          <SettlementStageSprite stageId={currentWagonStage.id} size={42} />
        </View>
        <View style={styles.supplyButton}><SecondaryButton label="Enter Settlement" onPress={onOpenSettlement} /></View>
      </GameCard>

      {unlockedResourceSites.length > 0 ? (
        <>
          <SectionTitle title="Regional Production" trailing={productionTotal > 0 ? 'Stock ready' : 'Build stock through activities'} />
          <View style={styles.productionGrid}>
            {resourceSites.filter(site => unlockedResourceSites.includes(site.id)).map(site => (
              <GameCard key={site.id} style={styles.productionCard} accent={theme.colors.primary}>
                <View style={styles.productionIcon}><ResourceSiteSprite siteId={site.id} faction={site.faction} size={44} /></View>
                <Text style={[styles.productionName, { color: theme.colors.text }]}>{site.name}</Text>
                <Text style={[styles.productionBody, { color: theme.colors.textMuted }]}>{site.description}</Text>
                <Text style={[styles.productionRate, { color: theme.colors.primary }]}>Per activity</Text>
                <View style={styles.productionAmounts}><ResourceAmountRow values={site.productionPerActivity} prefix="+" compact /></View>
              </GameCard>
            ))}
          </View>
          <TutorialFocus active={tutorialFocus?.kind === 'kingdom-production'} label={tutorialFocus?.kind === 'kingdom-production' ? tutorialFocus.label : undefined}>
            <GameCard>
              <Text style={[styles.supplyTitle, { color: theme.colors.text }]}>Unclaimed Production</Text>
              <View style={styles.productionAmounts}><ResourceAmountRow values={productionStock} /></View>
              <Text style={[styles.supplyBody, { color: theme.colors.textMuted }]}>Campaign battles, Expeditions and Kingdom Defense advance one production cycle. Claim whenever you return to Greenkeep.</Text>
              <View style={styles.supplyButton}>
                <PrimaryButton label="Claim Production" disabled={productionTotal <= 0} onPress={() => {
                  const ok = claimProduction();
                  setBuildingMessage(ok ? 'Regional production transferred to Greenkeep.' : 'No production is ready yet.');
                  if (ok && tutorialFocus?.kind === 'kingdom-production') onTutorialFocusComplete?.();
                }} />
                {tutorialFocus?.kind === 'kingdom-production' ? (
                  <View style={styles.guidanceLaterButton}>
                    <SecondaryButton label={productionTotal > 0 ? 'Claim later' : 'Got it'} onPress={onTutorialFocusComplete} />
                  </View>
                ) : null}
              </View>
            </GameCard>
          </TutorialFocus>
        </>
      ) : null}

      <KingdomBuildings
        buildings={buildings}
        levels={buildingLevels}
        wallet={resources}
        isBuildingUnlocked={isBuildingUnlocked}
        onUpgrade={upgradeBuilding}
        onOpenSettlement={onOpenSettlement}
      />
      {buildingMessage ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.colors.textMuted }]}>{buildingMessage}</Text> : null}

      {forgeUnlocked && (buildingLevels.forge ?? 0) > 0 ? (
        <>
          <SectionTitle title="Field Forge" trailing={'Lv.' + (buildingLevels.forge ?? 0)} />
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.supplyTitle, { color: theme.colors.text }]}>Troop Equipment</Text>
            <Text style={[styles.supplyBody, { color: theme.colors.textMuted }]}>Craft base equipment, assign it to squads, then upgrade the piece itself. Forge Lv.2 unlocks Tier II equipment and advanced class branches.</Text>
            <View style={styles.supplyButton}><PrimaryButton label="Enter Forge" onPress={onOpenForge} /></View>
          </GameCard>
        </>
      ) : null}

      {['capital', 'grand'].includes(currentWagonStage.id) ? (
        <>
          <SectionTitle title="Royal Decrees" trailing={activeRoyalDecree ? 'Active' : 'Choose one'} />
          <GameCard accent={theme.colors.gold}>
            <Text style={[styles.supplyTitle, { color: theme.colors.text }]}>{activeRoyalDecree?.name ?? 'Capital Council'}</Text>
            <Text style={[styles.supplyBody, { color: theme.colors.textMuted }]}>{activeRoyalDecree ? activeRoyalDecree.effectText : 'Choose the first decree that defines Greenkeep’s Capital priority.'}</Text>
            <Text style={[styles.supplyReward, { color: theme.colors.gold }]}>{activeRoyalDecree ? 'Changing decree costs ' + royalDecreeSwitchCost + ' Gold' : 'First decree is free'}</Text>
            <View style={styles.supplyButton}>
              <PrimaryButton label={activeRoyalDecree ? 'Manage Royal Decrees' : 'Choose Royal Decree'} onPress={onOpenRoyalDecrees} />
            </View>
          </GameCard>
        </>
      ) : null}

      <SectionTitle title="Daily Supply Cart" trailing="Optional rewarded ad" />
      <GameCard>
        <Text style={[styles.supplyTitle, { color: theme.colors.text }]}>Frontier Supplies</Text>
        <Text style={[styles.supplyBody, { color: theme.colors.textMuted }]}>Watch an optional rewarded ad for common supplies. A developed Quartermaster improves provision efficiency.</Text>
        <Text style={[styles.supplyReward, { color: theme.colors.gold }]}>
          +15 Wood · +{15 + ((buildingLevels.quartermaster ?? 0) >= 2 ? 5 : 0) + settlementEffects.dailyProvisionBonus} Provisions
        </Text>
        <View style={styles.supplyButton}>
          <SecondaryButton label={dailySupplyClaimed ? 'Supply claimed' : 'Watch optional ad'} disabled={dailySupplyClaimed} onPress={() => void claimRewardedAd('daily_supply')} />
        </View>
        {rewardedAdMessage ? <Text style={[styles.adMessage, { color: theme.colors.textMuted }]}>{rewardedAdMessage}</Text> : null}
      </GameCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 24, gap: 9 },
  heroContent: { flexDirection: 'row', alignItems: 'stretch', gap: 7 },
  heroMetrics: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  heroProgress: { marginTop: 7 },
  developmentLabel: { fontSize: 9, lineHeight: 12, marginBottom: 4 },
  eyebrow: { fontSize: 8.5, letterSpacing: 0.9, fontWeight: '900' },
  keepMark: { width: 64, minHeight: 64, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resources: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'space-between' },
  goalTitle: { fontSize: 15, lineHeight: 19, fontWeight: '900', marginTop: 3 },
  goalBody: { fontSize: 11.5, lineHeight: 16, marginTop: 4 },
  requirement: { marginTop: 7, fontSize: 10.5, lineHeight: 15 },
  productionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  productionCard: { width: '48%' },
  productionIcon: { height: 38, alignItems: 'center', justifyContent: 'center' },
  productionName: { fontSize: 12, fontWeight: '900', marginTop: 4 },
  productionBody: { fontSize: 9, lineHeight: 12.5, marginTop: 3, minHeight: 36 },
  productionRate: { fontSize: 8, lineHeight: 11, fontWeight: '900', marginTop: 5 },
  productionAmounts: { marginTop: 5 },
  message: { fontSize: 10.5, lineHeight: 15, textAlign: 'center', fontWeight: '800' },
  settlementViewRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  settlementViewCopy: { flex: 1 },
  supplyTitle: { fontSize: 13.5, lineHeight: 17, fontWeight: '900' },
  supplyBody: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  supplyReward: { fontSize: 10.5, fontWeight: '900', marginTop: 5 },
  supplyButton: { marginTop: 8 },
  guidanceLaterButton: { marginTop: 6 },
  adMessage: { fontSize: 9.5, textAlign: 'center', marginTop: 5 }
});
