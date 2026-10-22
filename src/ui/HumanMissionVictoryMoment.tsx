import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useGameTheme } from '../theme/ThemeProvider';
import { humanCampaignArtworkForMission } from './humanCampaignMissionArt';
import type { HumanBattleResultMoment } from './humanBattleResultPresentation';
import { humanChapterStories } from './humanCampaignStoryPresentation';

/**
 * Results-screen artwork and story beat. No claims, state writes or navigation:
 * rewards were granted by GameProvider when the battle completed.
 */
export function HumanMissionVictoryMoment({ moment }: { moment: HumanBattleResultMoment }) {
  const { theme } = useGameTheme();
  const art = humanCampaignArtworkForMission(moment.chapter, moment.missionOrder);
  const accent = moment.boss ? theme.colors.gold : theme.colors.human;
  const story = humanChapterStories[moment.chapter];
  const eyebrow = moment.final
    ? 'HUMAN CAMPAIGN COMPLETE · 70 / 70'
    : moment.boss
      ? 'CHAPTER ' + moment.chapter + ' SECURED'
      : 'CHAPTER ' + moment.chapter + ' · MISSION ' +
        moment.missionOrder + ' / ' + moment.missionCount;

  return (
    <View
      testID={moment.final ? 'human-final-victory-moment' : moment.boss
        ? 'human-boss-victory-moment' : 'human-mission-victory-moment'}
      style={[styles.card, { backgroundColor: theme.colors.surface1, borderColor: accent + '99' }]}
    >
      <View style={styles.heading}>
        <Text style={[styles.eyebrow, { color: accent }]}>{eyebrow}</Text>
        <Text style={[styles.region, { color: theme.colors.textMuted }]}>{moment.region}</Text>
      </View>
      <View
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.artFrame, moment.boss ? styles.bossArt : styles.regularArt]}
      >
        <Image source={art.source} resizeMode="cover" style={styles.image} />
        <View style={styles.scenePlaque}>
          <Text style={styles.sceneText}>
            {moment.final ? 'FINAL VICTORY' : moment.boss ? 'FRONT SECURED' : art.scene?.location ?? moment.region}
          </Text>
        </View>
      </View>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>
        {moment.final ? 'Blackstone Has Fallen' : moment.name}
      </Text>
      <Text style={[styles.body, { color: theme.colors.textMuted }]}>
        {moment.boss ? story.secured : moment.takeaway}
      </Text>
      {moment.boss && moment.takeaway ? (
        <Text style={[styles.unlockNote, { color: theme.colors.text }]}>
          CAMPAIGN RESULT · {moment.takeaway}
        </Text>
      ) : null}
      {moment.nextRegion ? (
        <View style={[styles.nextFront, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}>
          <Text style={[styles.nextLabel, { color: accent }]}>NEXT FRONT</Text>
          <Text style={[styles.nextRegion, { color: theme.colors.text }]}>
            {moment.nextRegion} · Chapter {moment.chapter + 1}
          </Text>
          <Text style={[styles.nextHook, { color: theme.colors.textMuted }]}>{story.nextFront}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 13, padding: 9, gap: 6 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  eyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: .65 },
  region: { fontSize: 9, fontWeight: '800' },
  artFrame: { width: '100%', position: 'relative', borderRadius: 9, overflow: 'hidden' },
  regularArt: { height: 90 },
  bossArt: { height: 150 },
  image: { height: '100%', width: '100%' },
  scenePlaque: { position: 'absolute', left: 0, bottom: 0, backgroundColor: '#101B24DF', paddingHorizontal: 8, paddingVertical: 5 },
  sceneText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: .65 },
  title: { fontSize: 17, lineHeight: 21, fontWeight: '900' },
  body: { fontSize: 10.5, lineHeight: 15 },
  unlockNote: { fontSize: 10, lineHeight: 14, fontWeight: '800' },
  nextFront: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7, gap: 4 },
  nextLabel: { fontWeight: '900', fontSize: 8.5, letterSpacing: .7 },
  nextRegion: { fontWeight: '900', fontSize: 11 },
  nextHook: { fontSize: 10, lineHeight: 14 }
});
