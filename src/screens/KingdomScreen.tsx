import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { starterResources } from '../game/data';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, ProgressBar, ResourceChip, SectionTitle } from '../ui/components';

const buildings = [
  {
    name: 'Camp Hall',
    level: 1,
    subtitle: 'Keeps the surviving camp organized.',
    next: 'Unlock Greenkeep Settlement',
    icon: '🏕️'
  },
  {
    name: 'Barracks',
    level: 1,
    subtitle: 'Trains recruits and basic infantry.',
    next: 'First troop promotions',
    icon: '🛡️'
  },
  {
    name: 'Wagonwright',
    level: 1,
    subtitle: 'Expands the Supply Wagon.',
    next: '4×4 → 4×5 grid',
    icon: '🛞'
  }
];

export function KingdomScreen() {
  const { theme } = useGameTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GameCard accent={theme.colors.human} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>HUMAN CAMPAIGN</Text>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Refugee Camp</Text>
            <Text style={[styles.heroBody, { color: theme.colors.textMuted }]}>
              Two squads, one damaged wagon, and the road to Greenkeep.
            </Text>
          </View>
          <View style={[styles.keepMark, { backgroundColor: theme.colors.surface2 }]}>
            <Text style={styles.keepMarkIcon}>♜</Text>
          </View>
        </View>

        <View style={styles.progressCopy}>
          <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
            Raise Greenkeep Settlement
          </Text>
          <Text style={[styles.progressValue, { color: theme.colors.textMuted }]}>34%</Text>
        </View>
        <ProgressBar value={0.34} color={theme.colors.human} />
      </GameCard>

      <View style={styles.resources}>
        <ResourceChip icon="🪙" value={starterResources.gold} label="Gold" />
        <ResourceChip icon="🪵" value={starterResources.wood} label="Wood" />
        <ResourceChip icon="🪨" value={starterResources.stone} label="Stone" />
      </View>

      <GameCard>
        <View style={styles.goalRow}>
          <View style={styles.goalCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>NEXT MILESTONE</Text>
            <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
              Establish a permanent settlement
            </Text>
            <Text style={[styles.goalBody, { color: theme.colors.textMuted }]}>
              Expands the Supply Wagon to 4×5 and unlocks formation slot 3.
            </Text>
          </View>
          <View style={styles.goalCost}>
            <Text style={[styles.costText, { color: theme.colors.text }]}>90 🪵</Text>
            <Text style={[styles.costText, { color: theme.colors.text }]}>20 🪨</Text>
          </View>
        </View>
        <PrimaryButton label="Upgrade settlement" disabled />
        <Text style={[styles.requirement, { color: theme.colors.textMuted }]}>
          Story milestone required: Hold the Road
        </Text>
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
                  <Text style={[styles.level, { color: theme.colors.gold }]}>
                    Lv. {building.level}
                  </Text>
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
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14
  },
  hero: {
    gap: 16
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16
  },
  heroCopy: {
    flex: 1
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '900'
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    marginTop: 5
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6
  },
  keepMark: {
    width: 74,
    height: 74,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  keepMarkIcon: {
    fontSize: 36
  },
  progressCopy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '800'
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '800'
  },
  resources: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between'
  },
  goalRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14
  },
  goalCopy: {
    flex: 1
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4
  },
  goalBody: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5
  },
  goalCost: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 5
  },
  costText: {
    fontSize: 13,
    fontWeight: '900'
  },
  requirement: {
    textAlign: 'center',
    marginTop: 9,
    fontSize: 11
  },
  buildingList: {
    gap: 10
  },
  buildingRow: {
    flexDirection: 'row',
    gap: 12
  },
  buildingIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buildingEmoji: {
    fontSize: 25
  },
  buildingCopy: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '900'
  },
  level: {
    fontSize: 12,
    fontWeight: '900'
  },
  buildingBody: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  unlockText: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 7
  }
});
