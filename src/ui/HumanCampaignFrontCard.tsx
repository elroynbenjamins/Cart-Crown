import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { humanCampaignMissionCounts } from '../game/humanCampaignArtDirection';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard } from './components';
import { humanCampaignArtworkForMission } from './humanCampaignMissionArt';
import {
  humanCampaignProgressCue,
  humanChapterStories
} from './humanCampaignStoryPresentation';
import type { HumanCampaignNodeSnapshot } from './humanCampaignStoryPresentation';

/** One compact, read-only briefing. It cannot advance or claim story progress. */
export function HumanCampaignFrontCard({
  chapterNumber, nodes, accent, tint, activeSquadCap
}: {
  chapterNumber: number;
  nodes: readonly HumanCampaignNodeSnapshot[];
  accent: string;
  tint: string;
  activeSquadCap?: number;
}) {
  const { theme } = useGameTheme();
  const cue = humanCampaignProgressCue(chapterNumber, nodes);
  if (!cue) return null;
  const story = humanChapterStories[cue.chapter];
  const deploymentSlots = Math.min(cue.currentSquadCap, activeSquadCap ?? cue.currentSquadCap);
  const deploymentLimited = deploymentSlots < cue.currentSquadCap;
  const artwork = humanCampaignArtworkForMission(cue.chapter, 1);
  const bossArt = humanCampaignArtworkForMission(cue.chapter, humanCampaignMissionCounts[cue.chapter]);

  return (
    <GameCard accent={accent} faction="human" state="selected" ornament={false}>
      <View
        testID="human-campaign-front-card"
        accessible
        accessibilityLabel={
          'Chapter ' + cue.chapter + ', ' + cue.region + '. ' +
          cue.completed + ' of ' + cue.total + ' missions. ' +
          cue.squadMessage + '. ' +
          (cue.finished ? story.secured : 'Next: ' + cue.nextMissionName + '. ' + story.enemy)
        }
        style={s.shell}
      >
        <View style={[s.hero, { borderColor: accent + '88' }]}>
          <Image source={artwork.source} style={s.heroImage} resizeMode="cover" fadeDuration={0} />
          <View pointerEvents="none" style={[s.heroVeil, { backgroundColor: tint + 'A8' }]} />
          <View style={s.heroText}>
            <Text style={s.heroEyebrow}>CHAPTER {cue.chapter} / 7 · {story.tone}</Text>
            <Text style={s.heroTitle}>{cue.region}</Text>
            <Text style={s.heroSub}>THE HUMAN CAMPAIGN</Text>
          </View>
          <View style={[s.heroProgress, { backgroundColor: '#0B1623D9', borderColor: accent }]}>
            <Text style={s.progress}>{cue.completed}/{cue.total}</Text>
          </View>
        </View>

        <Text style={[s.stakes, { color: theme.colors.textMuted }]}>{story.stakes}</Text>

        <View style={[s.objective, { backgroundColor: theme.colors.surface2, borderColor: accent + '75' }]}>
          <Text style={[s.eyebrow, { color: accent }]}>
            {cue.finished ? 'FRONT SECURED' : 'NEXT OBJECTIVE · ' + cue.nextMissionOrder + ' / ' + cue.total}
          </Text>
          <Text style={[s.objectiveName, { color: theme.colors.text }]}>
            {cue.finished ? story.secured : cue.nextMissionName}
          </Text>
          {!cue.finished && cue.nextSceneLocation ? (
            <Text style={[s.objectiveHint, { color: theme.colors.textMuted }]}>
              {cue.nextSceneLocation}{cue.nextMissionKind === 'boss' ? ' · CHAPTER FINALE' : ''}
            </Text>
          ) : null}
        </View>

        {(cue.latestUnlock || cue.upcomingUnlock) ? (
          <View style={[s.unlockRow, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}>
            {cue.latestUnlock ? (
              <Text style={[s.unlockLine, { color: theme.colors.primary }]}>{cue.latestUnlock}</Text>
            ) : null}
            {cue.upcomingUnlock ? (
              <Text style={[s.unlockLine, { color: theme.colors.text }]}>{cue.upcomingUnlock}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={s.bottomRow}>
          <View style={[s.intel, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}>
            <Text style={[s.eyebrow, { color: accent }]}>DEPLOYMENT</Text>
            <Text style={[s.intelText, { color: theme.colors.text }]}>
              {deploymentLimited ? deploymentSlots + ' usable slots · upgrade your wagon to use more' : cue.squadMessage}
            </Text>
          </View>
          <View style={[
            s.boss,
            cue.bossState === 'current' ? s.bossActive : null,
            { backgroundColor: theme.colors.surface2, borderColor: cue.bossState === 'current' ? accent : theme.colors.border }
          ]}>
            <Image
              source={bossArt.source}
              resizeMode="cover"
              style={[s.bossImage, cue.bossState === 'current' ? s.bossImageActive : null]}
              fadeDuration={0}
            />
            <View style={s.bossCopy}>
              <Text style={[s.eyebrow, { color: cue.bossState === 'secured' ? theme.colors.primary : accent }]}>
                {cue.bossState === 'secured' ? 'FINALE CLEARED' : cue.bossState === 'current' ? 'BOSS NOW' : 'FINAL THREAT'}
              </Text>
              <Text style={[s.bossName, { color: theme.colors.text }]} numberOfLines={2}>{story.enemy}</Text>
              {cue.bossState === 'current' ? (
                <Text style={[s.bossDescription, { color: theme.colors.textMuted }]} numberOfLines={3}>
                  {story.finale}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </GameCard>
  );
}

const s = StyleSheet.create({
  shell: { gap: 8 },
  hero: { height: 122, borderRadius: 10, borderWidth: 1, overflow: 'hidden', justifyContent: 'flex-end' },
  heroImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  heroVeil: { ...StyleSheet.absoluteFill, opacity: 0.76 },
  heroText: { paddingHorizontal: 11, paddingVertical: 10, paddingRight: 65, gap: 2 },
  heroEyebrow: { color: '#FFFFFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  heroTitle: { color: '#FFFFFF', fontSize: 23, lineHeight: 26, fontWeight: '900' },
  heroSub: { color: '#EBF3FA', fontSize: 8.5, fontWeight: '700', letterSpacing: 0.6 },
  heroProgress: { position: 'absolute', right: 8, top: 8, minWidth: 42, padding: 5, borderWidth: 1, borderRadius: 8, alignItems: 'center' },
  progress: { fontSize: 13, lineHeight: 16, fontWeight: '900', color: '#FFFFFF' },
  stakes: { fontSize: 11, lineHeight: 16 },
  objective: { borderRadius: 9, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7, gap: 3 },
  eyebrow: { fontSize: 8.5, lineHeight: 11, fontWeight: '900', letterSpacing: 0.5 },
  objectiveName: { fontSize: 15, lineHeight: 18, fontWeight: '900' },
  objectiveHint: { fontSize: 10, lineHeight: 14 },
  unlockRow: { paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderRadius: 9, gap: 3 },
  unlockLine: { fontSize: 9.5, lineHeight: 13, fontWeight: '800' },
  bottomRow: { gap: 6 },
  intel: { padding: 8, borderRadius: 9, borderWidth: 1, gap: 4 },
  intelText: { fontSize: 10.5, fontWeight: '700', lineHeight: 14 },
  boss: { borderRadius: 9, borderWidth: 1, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', minHeight: 54 },
  bossActive: { minHeight: 88, borderWidth: 1.5 },
  bossImage: { width: 73, height: 54 },
  bossImageActive: { width: 114, height: 88 },
  bossCopy: { flex: 1, minWidth: 0, paddingHorizontal: 8, gap: 3 },
  bossName: { fontSize: 10.5, fontWeight: '800', lineHeight: 14 },
  bossDescription: { fontSize: 9.5, lineHeight: 13, marginTop: 3 }
});
