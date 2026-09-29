import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { getBuildingLevelDefinition } from '../game/kingdom';
import { useGame } from '../game/GameProvider';
import type { ResourceWallet } from '../game/types';
import { getExpansionCost } from '../game/balance';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  Pill,
  PrimaryButton,
  ResourceAmountRow,
  ResourceChip,
  SectionTitle,
  StatusPill
} from '../ui/components';
import { BuildingSprite, ResourceSiteSprite, ResourceSprite, SettlementStageSprite } from '../ui/gameArt';
import { TutorialFocus } from '../ui/TutorialFocus';
import type { TutorialFocusTarget } from '../game/tutorial';

export function FactionKingdomScreen({
  onOpenSettlement,
  onOpenRecruitment,
  onOpenCommander,
  onOpenFactionMandate,
  tutorialFocus,
  onTutorialFocusComplete
}: {
  onOpenSettlement: () => void;
  onOpenRecruitment: () => void;
  onOpenCommander: () => void;
  onOpenFactionMandate: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
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
    factionStrongholdUpgradeAvailable,
    canUpgradeFactionStronghold,
    factionCapitalUpgradeAvailable,
    canUpgradeFactionCapital,
    upgradeFactionToFort,
    upgradeFactionToTown,
    upgradeFactionToStronghold,
    upgradeFactionToCapital,
    activeFactionMandate,
    factionMandateSwitchCost,
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
  const tutorialScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (tutorialFocus?.kind !== 'kingdom-production') {
      return;
    }

    const timer = setTimeout(() => {
      tutorialScrollRef.current?.scrollTo({
        y: 520,
        animated: true
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [tutorialFocus]);
  const elf = activeFaction === 'elf';
  const accent = elf ? theme.colors.elf : theme.colors.orc;
  const faction = factions[activeFaction];

  const settlementName =
    elf
      ? currentWagonStage.id === 'capital'
        ? 'Starroot Conclave'
        : currentWagonStage.id === 'stronghold'
          ? 'Worldroot Sanctuary'
        : currentWagonStage.id === 'town'
          ? 'Heartgrove Enclave'
          : currentWagonStage.id === 'fort'
            ? 'Heartgrove Wardhold'
            : 'Heartgrove Sanctuary'
      : currentWagonStage.id === 'capital'
        ? 'Warfire Confederacy'
        : currentWagonStage.id === 'stronghold'
          ? 'Emberclan High Warhold'
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
  let goalCost: Partial<ResourceWallet> | null = null;
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
    goalCost = getExpansionCost(activeFaction, 'fort');
    goalDisabled = !canUpgradeFactionFort;
    goalAction = upgradeFactionToFort;
  } else if (factionTownUpgradeAvailable) {
    goalTitle = elf ? 'Raise Heartgrove Enclave' : 'Raise the Great Warhold';
    goalBody = elf
      ? 'The Pale Ranger is defeated. Upgrade the Warden Lodge, Moon Forge and Caravan Grove to Lv.3, maintain Stag and ward infrastructure, then establish a permanent Enclave.'
      : 'The Stonejaw Champion has yielded. Upgrade the Clan Yard, Bone Forge and War Cartwright to Lv.3, maintain Warg and watchfire infrastructure, then raise the Great Warhold.';
    goalButton = elf ? 'Build Heartgrove Enclave' : 'Build Great Warhold';
    goalCost = getExpansionCost(activeFaction, 'town');
    goalDisabled = !canUpgradeFactionTown;
    goalAction = upgradeFactionToTown;
  } else if (factionStrongholdUpgradeAvailable) {
    goalTitle = elf ? 'Raise Worldroot Sanctuary' : 'Raise the High Warhold';
    goalBody = elf
      ? 'The Ashen Druid is defeated. Upgrade Warden Lodge, Moon Forge and Caravan Grove to Lv.4; keep Council Glade and Spirit Stores at Lv.2, with Stag and Beacon infrastructure established.'
      : 'The Split-Chieftain has yielded. Upgrade Clan Yard, Bone Forge and War Cartwright to Lv.4; keep War Council and Smokehouse at Lv.2, with Warg and Watchfire infrastructure established.';
    goalButton = elf ? 'Build Worldroot Sanctuary' : 'Build High Warhold';
    goalCost = getExpansionCost(activeFaction, 'stronghold');
    goalDisabled = !canUpgradeFactionStronghold;
    goalAction = upgradeFactionToStronghold;
  } else if (factionCapitalUpgradeAvailable) {
    goalTitle = elf ? 'Raise Starroot Conclave' : 'Form the Warfire Confederacy';
    goalBody = elf
      ? 'The Worldroot Guardian is released and the Root Seal has been traced to Crownspire. Raise Warden Lodge, Moon Forge and Caravan Grove to Lv.5; Council Glade and Spirit Stores to Lv.3; Stag Enclosure and Ward Beacon to Lv.2.'
      : 'The Last Clanbreaker is defeated and the Clan Seal has been traced to Crownspire. Raise Clan Yard, Bone Forge and War Cartwright to Lv.5; War Council and Smokehouse to Lv.3; Warg Pens and Watchfire to Lv.2.';
    goalButton = elf ? 'Build Starroot Conclave' : 'Form Warfire Confederacy';
    goalCost = getExpansionCost(activeFaction, 'capital');
    goalDisabled = !canUpgradeFactionCapital;
    goalAction = upgradeFactionToCapital;
  } else if (currentWagonStage.id === 'capital') {
    goalTitle = elf ? 'Starroot Conclave established' : 'Warfire Confederacy established';
    goalBody = activeFactionMandate
      ? activeFactionMandate.effectText + ' The first Crownspire route is open.'
      : elf
        ? 'Choose a Worldroot Attunement before the Conclave begins its final Crownspire campaign.'
        : 'Choose a Clan Pact before the Confederacy begins its final Crownspire campaign.';
    goalButton = activeFactionMandate
      ? 'Chapter 6 underway'
      : elf
        ? 'Choose Worldroot Attunement'
        : 'Choose Clan Pact';
    goalDisabled = Boolean(activeFactionMandate);
    goalAction = () => {
      onOpenFactionMandate();
      return true;
    };
  } else if (currentWagonStage.id === 'stronghold') {
    goalTitle = elf ? 'Heal the Wounded Worldroot' : 'Leave No Clan Behind';
    goalBody = elf
      ? 'Use the six-squad Sanctuary to trace the Root Seal and defeat the Worldroot Guardian.'
      : 'Use the six-squad High Warhold to recover isolated clans and trace the Clan Seal.';
    goalButton = 'Capital tier is story-gated';
    goalDisabled = true;
  } else if (currentWagonStage.id === 'town') {
    goalTitle = elf ? 'Fight through Roots in Ash' : 'Hold the two-front war';
    goalBody = elf
      ? 'Use five squads, Elven Wards and Stag mobility to defeat the Ashen Druid.'
      : 'Use five squads, Momentum and Warg mobility to defeat the Split-Chieftain.';
    goalButton = 'Stronghold tier is story-gated';
    goalDisabled = true;
  } else if (currentWagonStage.id === 'fort') {
    goalTitle = elf ? 'Secure Moonlit Pass' : 'Complete the Stonejaw Trial';
    goalBody = elf
      ? 'Use four-squad Ward formations and the restored rootway network to reach the Pale Ranger.'
      : 'Use a four-squad warband, Warg infrastructure and clan signals to defeat the Stonejaw Champion.';
    goalButton = 'Town tier is story-gated';
    goalDisabled = true;
  }

  return (
    <ScrollView
      ref={tutorialScrollRef}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GameCard accent={accent} faction={activeFaction}>
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
        {goalCost ? (
          <View style={styles.goalCost}>
            <ResourceAmountRow values={goalCost} compact />
          </View>
        ) : null}
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

      {currentWagonStage.id === 'capital' ? (
        <GameCard accent={accent}>
          <View style={styles.commanderRow}>
            <View style={styles.commanderCopy}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {activeFactionMandate?.name ??
                  (elf ? 'Worldroot Attunement' : 'Clan Pact')}
              </Text>
              <Text style={[styles.cardBody, { color: theme.colors.textMuted }]}>
                {activeFactionMandate
                  ? activeFactionMandate.effectText +
                    ' Changing it costs ' +
                    factionMandateSwitchCost +
                    ' Gold.'
                  : 'One strategic choice can be active at a time. Your first choice is free.'}
              </Text>
            </View>
            <StatusPill
              label={activeFactionMandate ? 'ACTIVE' : 'CHOOSE'}
              tone={activeFactionMandate ? 'current' : 'available'}
            />
          </View>
          <View style={styles.button}>
            <PrimaryButton
              label={
                activeFactionMandate
                  ? elf
                    ? 'Manage Attunement'
                    : 'Manage Clan Pact'
                  : elf
                    ? 'Choose Attunement'
                    : 'Choose Clan Pact'
              }
              onPress={onOpenFactionMandate}
            />
          </View>
        </GameCard>
      ) : null}

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
                  <View style={styles.productionAmounts}>
                    <ResourceAmountRow values={site.productionPerActivity} prefix="+" compact />
                  </View>
                </GameCard>
              ))}
          </View>
          <TutorialFocus
            active={tutorialFocus?.kind === 'kingdom-production'}
            label={tutorialFocus?.kind === 'kingdom-production' ? tutorialFocus.label : undefined}
          >
          <GameCard>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Unclaimed Production</Text>
            <View style={styles.productionAmounts}>
              <ResourceAmountRow values={productionStock} />
            </View>
            <View style={styles.button}>
              <PrimaryButton
                label="Claim Production"
                disabled={productionTotal <= 0}
                onPress={() => {
                  const ok = claimProduction();
                  setMessage(
                    ok
                      ? 'Regional production transferred to the settlement.'
                      : 'No production is ready yet.'
                  );
                  if (
                    ok &&
                    tutorialFocus?.kind === 'kingdom-production'
                  ) {
                    onTutorialFocusComplete?.();
                  }
                }}
              />
            </View>
          </GameCard>
          </TutorialFocus>
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
                <StatusPill
                  label={level > 0 ? 'LV.' + level : unlocked ? 'BLUEPRINT' : 'LOCKED'}
                  tone={level > 0 ? 'available' : unlocked ? 'available' : 'locked'}
                />
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
                  <View style={styles.buildingCost}>
                    <ResourceAmountRow values={next.cost} compact />
                  </View>
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
  goalCost: { marginTop: 9 },
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
  productionAmounts: { marginTop: 7 },
  buildingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  buildingCard: { width: '48%' },
  buildingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  buildingName: { fontSize: 13.5, fontWeight: '900', marginTop: 7 },
  buildingBody: { fontSize: 9.5, lineHeight: 14, marginTop: 4, minHeight: 42 },
  buildingHint: { fontSize: 9, lineHeight: 13, fontWeight: '800', marginTop: 7 },
  buildingCost: { marginTop: 8 },
  cost: { fontSize: 8.5, fontWeight: '900', lineHeight: 13, marginTop: 5 },
  message: { textAlign: 'center', fontSize: 10.5, fontWeight: '800' }
});
