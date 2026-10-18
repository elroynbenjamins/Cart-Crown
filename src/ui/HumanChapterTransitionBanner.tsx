import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useGameTheme } from '../theme/ThemeProvider';
import { humanCampaignArtworkForMission } from './humanCampaignMissionArt';
import { humanCampaignMissionCounts } from '../game/humanCampaignArtDirection';
import { humanChapterTransition } from './humanChapterTransition';

/** A reward-safe, non-modal campaign presentation; never grants items itself. */
export function HumanChapterTransitionBanner({
  chapterNumber, completed, total
}: { chapterNumber: number; completed: number; total: number }) {
  const { theme } = useGameTheme();
  const transition = humanChapterTransition(chapterNumber, completed, total);
  if (!transition) return null;

  const final = transition.kind === 'finale';
  const securedImage = humanCampaignArtworkForMission(
    transition.securedChapter, humanCampaignMissionCounts[transition.securedChapter]
  ).source;
  const nextImage = transition.revealedChapter
    ? humanCampaignArtworkForMission(transition.revealedChapter, 1).source : null;

  return (
    <View
      testID={final ? 'human-campaign-final-banner' : 'human-chapter-transition-banner'}
      accessible
      accessibilityLabel={final
        ? 'Human campaign victory. Blackstone secured. All 70 Human campaign missions completed.'
        : 'Chapter ' + transition.securedChapter + ' secured. ' + transition.securedRegion +
          ' liberated. Chapter ' + transition.revealedChapter + ', ' + transition.revealedRegion + ', revealed.'}
      style={[s.card, { borderColor: theme.colors.gold + '99', backgroundColor: theme.colors.surface1 }]}
    >
      <View style={[s.eyebrowRow, { borderBottomColor: theme.colors.gold + '55' }]}>
        <Text style={[s.eyebrow, { color: theme.colors.gold }]}>
          {final ? 'HUMAN CAMPAIGN VICTORY' : 'CHAPTER ' + transition.securedChapter + ' SECURED'}
        </Text>
        <Text style={[s.crest, { color: theme.colors.gold }]}>✦</Text>
      </View>

      <View style={s.artPair} pointerEvents="none">
        <View style={[s.scene, { borderColor: theme.colors.gold + '44' }]}>
          <Image source={securedImage} resizeMode="cover" style={s.image} />
          <View style={s.artLabel}><Text style={s.artLabelText}>{final ? 'FINAL VICTORY' : 'FRONT SECURED'}</Text></View>
        </View>
        {nextImage ? (
          <View style={[s.scene, { borderColor: theme.colors.human + '66' }]}>
            <Image source={nextImage} resizeMode="cover" style={s.image} />
            <View style={s.artLabel}><Text style={s.artLabelText}>NEXT FRONT</Text></View>
          </View>
        ) : null}
      </View>

      <Text style={[s.title, { color: theme.colors.text }]}>
        {final ? 'Blackstone Has Fallen' : transition.securedRegion + ' is secured'}
      </Text>
      <Text style={[s.body, { color: theme.colors.textMuted }]}>
        {final
          ? 'The final siege is won. Seven chapters and 70 handcrafted missions have brought the Human campaign to its conclusion.'
          : transition.securedBoss + ' is behind you. The march now continues into ' + transition.revealedRegion + '.'}
      </Text>
      <View style={[s.nextRow, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}>
        <Text style={[s.nextEyebrow, { color: theme.colors.gold }]}>
          {final ? 'THE REALM ENDURES' : 'NEXT CHAPTER · ' + transition.revealedChapter}
        </Text>
        <Text style={[s.nextText, { color: theme.colors.text }]}>
          {final ? 'Your kingdom and remaining activities await.' : transition.revealedRegion + ' · ' + transition.revealedMission}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 13, overflow: 'hidden', padding: 9, gap: 5 },
  eyebrowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 5 },
  eyebrow: { fontWeight: '900', fontSize: 10, letterSpacing: 1.1, lineHeight: 13 },
  crest: { fontSize: 16, lineHeight: 17 },
  artPair: { flexDirection: 'row', gap: 6, height: 100, overflow: 'hidden' },
  scene: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  artLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#111C25D9', paddingHorizontal: 5, paddingVertical: 4 },
  artLabelText: { fontSize: 7.5, lineHeight: 10, fontWeight: '900', letterSpacing: .6, color: '#FFFFFF' },
  title: { fontSize: 17, lineHeight: 21, fontWeight: '900' },
  body: { fontSize: 10.5, lineHeight: 15 },
  nextRow: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6, gap: 3 },
  nextEyebrow: { fontWeight: '900', fontSize: 8.5, letterSpacing: .5, lineHeight: 11 },
  nextText: { fontWeight: '800', fontSize: 11, lineHeight: 15 }
});
