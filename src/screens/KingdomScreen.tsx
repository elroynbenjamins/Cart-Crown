import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  PrimaryButton,
  ProgressBar,
  ResourceChip,
  SecondaryButton,
  SectionTitle
} from '../ui/components';

export function KingdomScreen({ onOpenRecruitment }: { onOpenRecruitment: () => void }) {
  const { theme } = useGameTheme();
  const {
    resources,
    currentWagonStage,
    holdTheRoadWon,
    settlementUpgraded,
    recruitChosen,
    canUpgradeSettlement,
    rewardedAdClaims,
    rewardedAdMessage,
    claimRewardedAd,
    upgradeSettlement
  } = useGame();

  const settlementName = settlementUpgraded ? 'Greenkeep Settlement' : 'Refugee Camp';
  const progress = holdTheRoadWon ? 1 : 0.34;
  const dailySupplyClaimed = (rewardedAdClaims.daily_supply ?? 0) >= 1;

  const buildings = [
    {
      name: settlementUpgraded ? 'Greenkeep Hall' : 'Camp Hall',
      level: settlementUpgraded ? 2 : 1,
      subtitle: settlementUpgraded
        ? 'Coordinates the growing settlement and its survivors.'
        : 'Keeps the surviving camp organized.',
      next: settlementUpgraded ? 'Fort foundations' : 'Greenkeep Settlement',
      icon: settlementUpgraded ? '🏰' : '🏕️'
    },
    {
      name: 'Barracks',
      level: 1,
      subtitle: 'Trains recruits and unlocks troop promotion paths.',
      next: 'Sword and spear training',
      icon: '🛡️'
    },
    {
      name: 'Wagonwright',
      level: 1,
      subtitle: 'Builds and reinforces the Supply Wagon.',
      next: settlementUpgraded ? '5×5 Fort Frame' : '4×5 Settlement Bed',
      icon: '🛞'
    }
  ];

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
  } else if (settlementUpgraded && recruitChosen) {
    milestoneTitle = 'Prepare for the Fort';
    milestoneBody = 'With three active squads, the next campaign stretch will open the Iron Road and Fort progression.';
    buttonLabel = 'Fort progression not yet available';
    disabled = true;
    requirement = 'Continue Chapter 1';
    action = () => false;
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>HUMAN CAMPAIGN</Text>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{settlementName}</Text>
            <Text style={[styles.heroBody, { color: theme.colors.textMuted }]}>
              {settlementUpgraded
                ? 'The frontier has a foothold again. Now the army can grow.'
                : 'Two squads, one damaged wagon, and the road to Greenkeep.'}
            </Text>
          </View>
          <View style={[styles.keepMark, { backgroundColor: theme.colors.surface2 }]}>
            <Text style={styles.keepMarkIcon}>{settlementUpgraded ? '♜' : '⌂'}</Text>
          </View>
        </View>

        <View style={styles.progressCopy}>
          <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
            {settlementUpgraded ? 'Greenkeep established' : 'Raise Greenkeep Settlement'}
          </Text>
          <Text style={[styles.progressValue, { color: theme.colors.textMuted }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <ProgressBar value={progress} color={theme.colors.human} />
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
            <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>NEXT MILESTONE</Text>
            <Text style={[styles.goalTitle, { color: theme.colors.text }]}>{milestoneTitle}</Text>
            <Text style={[styles.goalBody, { color: theme.colors.textMuted }]}>{milestoneBody}</Text>
          </View>
          {!settlementUpgraded ? (
            <View style={styles.goalCost}>
              <Text style={[styles.costText, { color: theme.colors.text }]}>90 🪵</Text>
              <Text style={[styles.costText, { color: theme.colors.text }]}>20 🪨</Text>
            </View>
          ) : null}
        </View>
        <PrimaryButton label={buttonLabel} disabled={disabled} onPress={action} />
        <Text style={[styles.requirement, { color: theme.colors.textMuted }]}>{requirement}</Text>
      </GameCard>

      <GameCard>
        <View style={styles.logisticsRow}>
          <View>
            <Text style={[styles.logisticsLabel, { color: theme.colors.textMuted }]}>SUPPLY WAGON</Text>
            <Text style={[styles.logisticsValue, { color: theme.colors.text }]}>
              {currentWagonStage.name}
            </Text>
          </View>
          <Text style={[styles.gridSize, { color: theme.colors.primary }]}>
            {currentWagonStage.width}×{currentWagonStage.height}
          </Text>
        </View>
      </GameCard>

      <SectionTitle title="Daily Supply Cart" trailing="Optional rewarded ad" />
      <GameCard>
        <Text style={[styles.supplyTitle, { color: theme.colors.text }]}>Frontier Supplies</Text>
        <Text style={[styles.supplyBody, { color: theme.colors.textMuted }]}>
          Watch an optional rewarded ad for a small common-resource package. Skipping it never removes normal rewards.
        </Text>
        <Text style={[styles.supplyReward, { color: theme.colors.gold }]}>+15 Wood · +15 Provisions</Text>
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

      <SectionTitle title="Buildings" trailing="3 active" />

      <View style={styles.buildingList}>
        {buildings.map(building => (
          <GameCard key={building.name}>
            <View style={styles.buildingRow}>
              <View style={[styles.buildingIcon, { backgroundColor: theme.colors.surface2 }]}>
                <Text style={styles.buildingEmoji}>{building.icon}</Text>
              </View>
              <View style={styles.buildingCopy}>
                <View style={styles.nameRow}>
                  <Text style={[styles.buildingName, { color: theme.colors.text }]}>
                    {building.name}
                  </Text>
                  <Text style={[styles.level, { color: theme.colors.gold }]}>Lv. {building.level}</Text>
                </View>
                <Text style={[styles.buildingBody, { color: theme.colors.textMuted }]}>
                  {building.subtitle}
                </Text>
                <Text style={[styles.unlockText, { color: theme.colors.primary }]}>
                  Next: {building.next}
                </Text>
              </View>
            </View>
          </GameCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  hero: { gap: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  heroCopy: { flex: 1 },
  eyebrow: { fontSize: 11, letterSpacing: 1.2, fontWeight: '900' },
  heroTitle: { fontSize: 28, lineHeight: 34, fontWeight: '900', marginTop: 5 },
  heroBody: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  keepMark: { width: 74, height: 74, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  keepMarkIcon: { fontSize: 36 },
  progressCopy: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  progressLabel: { fontSize: 13, fontWeight: '800' },
  progressValue: { fontSize: 12, fontWeight: '800' },
  resources: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  goalRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  goalCopy: { flex: 1 },
  goalTitle: { fontSize: 17, fontWeight: '900', marginTop: 4 },
  goalBody: { fontSize: 13, lineHeight: 18, marginTop: 5 },
  goalCost: { alignItems: 'flex-end', justifyContent: 'center', gap: 5 },
  costText: { fontSize: 13, fontWeight: '900' },
  requirement: { textAlign: 'center', marginTop: 9, fontSize: 11 },
  logisticsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logisticsLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  logisticsValue: { fontSize: 16, fontWeight: '900', marginTop: 3 },
  gridSize: { fontSize: 23, fontWeight: '900' },
  supplyTitle: { fontSize: 15, fontWeight: '900' },
  supplyBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  supplyReward: { fontSize: 11, fontWeight: '900', marginTop: 7 },
  supplyButton: { marginTop: 11 },
  adMessage: { fontSize: 10, textAlign: 'center', marginTop: 7 },
  buildingList: { gap: 10 },
  buildingRow: { flexDirection: 'row', gap: 12 },
  buildingIcon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buildingEmoji: { fontSize: 25 },
  buildingCopy: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  buildingName: { fontSize: 16, fontWeight: '900' },
  level: { fontSize: 12, fontWeight: '900' },
  buildingBody: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  unlockText: { fontSize: 11, fontWeight: '800', marginTop: 7 }
});
