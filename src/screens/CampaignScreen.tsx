import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { rewardedAdPlacements } from '../ads/rewardedAds';
import { factions, factionOrder } from '../game/factions';
import { humanRegions } from '../game/data';
import { useGame } from '../game/GameProvider';
import type { CampaignId, SideModeId } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SecondaryButton, SectionTitle } from '../ui/components';

type CampaignView = 'story' | 'activities' | 'factions';

const nodeIcons: Record<string, string> = {
  story: '◆',
  battle: '⚔',
  event: '?',
  elite: '✦',
  supply: '▣',
  boss: '♛'
};

export function CampaignScreen({
  onStartBattle,
  onOpenMarkedRaiders,
  onOpenExpedition,
  onOpenFormationTrial
}: {
  onStartBattle: () => void;
  onOpenMarkedRaiders: () => void;
  onOpenExpedition: () => void;
  onOpenFormationTrial: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    chapterNodes,
    settlementUpgraded,
    campaignAvailability,
    sideModeDefinitions,
    isSideModeUnlocked,
    expeditionTickets,
    expeditionRunsCompleted,
    formationTrialCompleted,
    claimRewardedAd,
    rewardedAdClaims,
    rewardedAdMessage
  } = useGame();
  const [view, setView] = useState<CampaignView>('story');
  const completed = chapterNodes.filter(node => node.completed).length;

  const campaignById = (id: CampaignId) =>
    campaignAvailability.find(campaign => campaign.id === id);

  const renderStory = () => (
    <>
      <GameCard accent={theme.colors.human}>
        <View style={styles.chapterHeader}>
          <View style={styles.chapterCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>CHAPTER 1</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>The Last Wagon</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Reach ruined Greenkeep with the surviving squads.
            </Text>
          </View>
          <Pill label={String(completed) + ' / 6'} color={theme.colors.surface2} />
        </View>
      </GameCard>

      <SectionTitle title="Caelora" trailing="Western frontier" />

      <View style={[styles.map, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
        <View style={[styles.humanTerritory, { backgroundColor: theme.colors.human + '24' }]} />
        <View style={[styles.neutralTerritory, { backgroundColor: theme.colors.gold + '18' }]} />

        {humanRegions.map(region => {
          const greenkeepUnlocked = region.id === 'greenkeep_vale' && settlementUpgraded;
          const active = region.state === 'current' || greenkeepUnlocked;
          const locked = region.state === 'locked' && !greenkeepUnlocked;
          const accent = region.faction === 'neutral' ? theme.colors.gold : theme.colors.human;

          return (
            <View
              key={region.id}
              style={[
                styles.region,
                {
                  left: (String(region.x) + '%') as ViewStyle['left'],
                  top: (String(region.y) + '%') as ViewStyle['top']
                }
              ]}
            >
              <View
                style={[
                  styles.regionDot,
                  {
                    borderColor: accent,
                    backgroundColor: active ? accent : theme.colors.surface2,
                    opacity: locked ? 0.5 : 1
                  }
                ]}
              >
                <Text style={[styles.regionDotText, { color: active ? '#FFFFFF' : accent }]}>
                  {active ? '●' : locked ? '×' : '○'}
                </Text>
              </View>
              <Text
                style={[
                  styles.regionName,
                  { color: locked ? theme.colors.textMuted : theme.colors.text }
                ]}
                numberOfLines={2}
              >
                {region.name}
              </Text>
            </View>
          );
        })}

        <View style={[styles.route, { backgroundColor: theme.colors.human }]} />
      </View>

      <SectionTitle title="Greenkeep Outskirts" trailing="Current region" />

      <View style={styles.nodeList}>
        {chapterNodes.map((node, index) => {
          const battlePlayable = node.current && node.type === 'battle' && node.id === 'node_2';
          const storyPlayable = node.current && node.type === 'event' && node.id === 'node_3';
          const playable = battlePlayable || storyPlayable;
          const status = node.completed ? 'DONE' : playable ? 'PLAY' : node.current ? 'NEXT' : 'LOCKED';
          const action = battlePlayable ? onStartBattle : storyPlayable ? onOpenMarkedRaiders : undefined;

          return (
            <Pressable
              key={node.id}
              disabled={!playable}
              onPress={action}
              style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
            >
              <GameCard accent={node.current ? theme.colors.primary : undefined} style={styles.nodeCard}>
                <View
                  style={[
                    styles.nodeIcon,
                    {
                      backgroundColor: node.completed
                        ? theme.colors.primary
                        : node.current
                          ? theme.colors.human
                          : theme.colors.surface2
                    }
                  ]}
                >
                  <Text style={styles.nodeIconText}>{node.completed ? '✓' : nodeIcons[node.type]}</Text>
                </View>
                <View style={styles.nodeCopy}>
                  <Text style={[styles.nodeMeta, { color: theme.colors.textMuted }]}>
                    {String(index + 1).padStart(2, '0')} · {node.type.toUpperCase()}
                  </Text>
                  <Text style={[styles.nodeName, { color: theme.colors.text }]}>{node.name}</Text>
                </View>
                <Text style={[styles.chevron, { color: node.current ? theme.colors.primary : theme.colors.textMuted }]}>
                  {status}
                </Text>
              </GameCard>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  const openMode = (id: SideModeId) => {
    if (id === 'expeditions') onOpenExpedition();
    if (id === 'formation_trials') onOpenFormationTrial();
  };

  const renderActivities = () => (
    <>
      <GameCard accent={theme.colors.primary}>
        <Text style={[styles.activityHeroTitle, { color: theme.colors.text }]}>Beyond the Campaign</Text>
        <Text style={[styles.activityHeroBody, { color: theme.colors.textMuted }]}>
          Repeatable modes test formation and wagon builds without requiring another story chapter.
        </Text>
      </GameCard>

      {sideModeDefinitions.map(mode => {
        const unlocked = isSideModeUnlocked(mode.id);
        const functional = mode.id === 'expeditions' || mode.id === 'formation_trials';

        return (
          <GameCard key={mode.id} accent={unlocked ? theme.colors.primary : undefined}>
            <View style={styles.modeHeader}>
              <View style={styles.modeCopy}>
                <Text style={[styles.modeName, { color: theme.colors.text }]}>{mode.name}</Text>
                <Text style={[styles.modeSubtitle, { color: theme.colors.primary }]}>{mode.subtitle}</Text>
              </View>
              <Pill label={unlocked ? 'UNLOCKED' : mode.unlockStage.toUpperCase()} />
            </View>
            <Text style={[styles.modeBody, { color: theme.colors.textMuted }]}>{mode.description}</Text>
            <Text style={[styles.modeExample, { color: theme.colors.text }]}>Example: {mode.example}</Text>
            <Text style={[styles.modeReward, { color: theme.colors.gold }]}>Rewards: {mode.rewardFocus}</Text>

            {mode.id === 'expeditions' ? (
              <Text style={[styles.modeMeta, { color: theme.colors.textMuted }]}>
                Tickets: {expeditionTickets} · Completed runs: {expeditionRunsCompleted}
              </Text>
            ) : null}

            {mode.id === 'formation_trials' && formationTrialCompleted ? (
              <Text style={[styles.modeMeta, { color: theme.colors.primary }]}>First trial completed ✓</Text>
            ) : null}

            {unlocked && functional ? (
              <View style={styles.modeButton}>
                <PrimaryButton label={'Open ' + mode.name} onPress={() => openMode(mode.id)} />
              </View>
            ) : null}
          </GameCard>
        );
      })}

      <SectionTitle title="Optional rewarded ads" trailing="No forced ads" />
      <GameCard>
        <Text style={[styles.adTitle, { color: theme.colors.text }]}>Extra Expedition Ticket</Text>
        <Text style={[styles.adBody, { color: theme.colors.textMuted }]}>
          Rewarded only. Skipping it never removes a normal reward or blocks progression.
        </Text>
        <Text style={[styles.adReward, { color: theme.colors.gold }]}>
          {rewardedAdPlacements.find(p => p.id === 'expedition_ticket')?.rewardSummary}
        </Text>
        <View style={styles.modeButton}>
          <SecondaryButton
            label={
              (rewardedAdClaims.expedition_ticket ?? 0) >= 1
                ? 'Reward claimed'
                : 'Watch optional ad'
            }
            disabled={(rewardedAdClaims.expedition_ticket ?? 0) >= 1}
            onPress={() => void claimRewardedAd('expedition_ticket')}
          />
        </View>
        {rewardedAdMessage ? (
          <Text style={[styles.adMessage, { color: theme.colors.textMuted }]}>{rewardedAdMessage}</Text>
        ) : null}
      </GameCard>
    </>
  );

  const renderFactions = () => (
    <>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.activityHeroTitle, { color: theme.colors.text }]}>Three Perspectives</Text>
        <Text style={[styles.activityHeroBody, { color: theme.colors.textMuted }]}>
          Humans are the required first campaign. Finishing Human Chapter 6 unlocks Elves and Orcs together. Completing all three unlocks the final Three Seals campaign.
        </Text>
      </GameCard>

      {factionOrder.map(id => {
        const faction = factions[id];
        const availability = campaignById(id);
        const accent =
          id === 'human' ? theme.colors.human : id === 'elf' ? theme.colors.elf : theme.colors.orc;

        return (
          <GameCard key={id} accent={availability?.unlocked ? accent : undefined}>
            <View style={styles.factionHeader}>
              <View style={[styles.factionMark, { borderColor: accent }]}>
                <Text style={[styles.factionLetter, { color: accent }]}>{faction.name[0]}</Text>
              </View>
              <View style={styles.factionCopy}>
                <Text style={[styles.factionName, { color: theme.colors.text }]}>{faction.name}</Text>
                <Text style={[styles.factionCampaign, { color: accent }]}>{faction.campaignName}</Text>
              </View>
              <Pill
                label={availability?.completed ? 'COMPLETE' : availability?.unlocked ? 'AVAILABLE' : 'LOCKED'}
              />
            </View>
            <Text style={[styles.factionSubtitle, { color: theme.colors.textMuted }]}>
              {faction.campaignSubtitle}
            </Text>
            <View style={[styles.mechanicBox, { backgroundColor: theme.colors.surface2 }]}>
              <Text style={[styles.mechanicName, { color: theme.colors.text }]}>
                Unique mechanic: {faction.mechanicName}
              </Text>
              <Text style={[styles.mechanicBody, { color: theme.colors.textMuted }]}>
                {faction.mechanicSummary}
              </Text>
            </View>
            <Text style={[styles.replayReason, { color: theme.colors.gold }]}>
              Why replay: {faction.replayReason}
            </Text>
            {!availability?.unlocked ? (
              <Text style={[styles.unlockText, { color: theme.colors.textMuted }]}>
                🔒 {availability?.unlockText}
              </Text>
            ) : null}
          </GameCard>
        );
      })}

      <GameCard>
        <Text style={[styles.modeName, { color: theme.colors.text }]}>Three Seals</Text>
        <Text style={[styles.modeBody, { color: theme.colors.textMuted }]}>
          Final single-player Crownspire campaign. Choose one completed faction while the other two arrive as allied NPC armies.
        </Text>
        <Text style={[styles.unlockText, { color: theme.colors.textMuted }]}>
          🔒 {campaignById('meta')?.unlockText}
        </Text>
      </GameCard>
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.segment, { backgroundColor: theme.colors.surface1 }]}>
        {(['story', 'activities', 'factions'] as CampaignView[]).map(option => (
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
              {option === 'story' ? 'Story' : option === 'activities' ? 'Activities' : 'Factions'}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === 'story' ? renderStory() : view === 'activities' ? renderActivities() : renderFactions()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  segment: { flexDirection: 'row', borderRadius: 16, padding: 4, gap: 4 },
  segmentButton: { flex: 1, minHeight: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 11, fontWeight: '900' },
  chapterHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  chapterCopy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 24, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 5 },
  map: { height: 330, borderRadius: 22, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  humanTerritory: {
    position: 'absolute', left: '-10%', top: '12%', width: '62%', height: '88%',
    borderTopRightRadius: 160, borderBottomRightRadius: 120
  },
  neutralTerritory: {
    position: 'absolute', left: '46%', top: '10%', width: '54%', height: '90%',
    borderTopLeftRadius: 140, borderBottomLeftRadius: 90
  },
  region: { position: 'absolute', width: 88, marginLeft: -22, marginTop: -22, alignItems: 'center' },
  regionDot: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  regionDotText: { fontSize: 13, fontWeight: '900' },
  regionName: { textAlign: 'center', fontSize: 10, lineHeight: 13, marginTop: 4, fontWeight: '800' },
  route: { position: 'absolute', left: '15%', top: '62%', width: '26%', height: 3, transform: [{ rotate: '-4deg' }], opacity: 0.4 },
  nodeList: { gap: 8 },
  nodeCard: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
  nodeIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nodeIconText: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  nodeCopy: { flex: 1 },
  nodeMeta: { fontSize: 10, fontWeight: '800' },
  nodeName: { fontSize: 15, fontWeight: '900', marginTop: 3 },
  chevron: { fontSize: 10, fontWeight: '900' },
  activityHeroTitle: { fontSize: 20, fontWeight: '900' },
  activityHeroBody: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  modeHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  modeCopy: { flex: 1 },
  modeName: { fontSize: 17, fontWeight: '900' },
  modeSubtitle: { fontSize: 10, fontWeight: '900', marginTop: 2, textTransform: 'uppercase' },
  modeBody: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  modeExample: { fontSize: 11, fontWeight: '800', marginTop: 8 },
  modeReward: { fontSize: 10.5, fontWeight: '800', marginTop: 6 },
  modeMeta: { fontSize: 10, marginTop: 7, fontWeight: '700' },
  modeButton: { marginTop: 12 },
  adTitle: { fontSize: 15, fontWeight: '900' },
  adBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  adReward: { fontSize: 11, fontWeight: '900', marginTop: 7 },
  adMessage: { fontSize: 10, textAlign: 'center', marginTop: 8 },
  factionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  factionMark: { width: 48, height: 52, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  factionLetter: { fontSize: 19, fontWeight: '900' },
  factionCopy: { flex: 1 },
  factionName: { fontSize: 17, fontWeight: '900' },
  factionCampaign: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  factionSubtitle: { fontSize: 12, lineHeight: 17, marginTop: 9 },
  mechanicBox: { borderRadius: 14, padding: 10, marginTop: 10 },
  mechanicName: { fontSize: 11, fontWeight: '900' },
  mechanicBody: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  replayReason: { fontSize: 10.5, lineHeight: 15, fontWeight: '800', marginTop: 9 },
  unlockText: { fontSize: 10.5, lineHeight: 15, marginTop: 8, fontWeight: '700' }
});
