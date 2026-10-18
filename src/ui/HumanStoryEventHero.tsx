import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useGameTheme } from '../theme/ThemeProvider';
import { StoryCharacterPortrait } from './gameArt';
import { humanCampaignArtworkForMission } from './humanCampaignMissionArt';
import { humanStoryBeatArtwork, type HumanStoryBeat } from './humanStoryEventPresentation';

/**
 * A readable, immediately visible region scene above the decision cards.
 * Reuses existing chapter paintings; text is explicit that this is a
 * location backdrop, not a newly made portrait of a named villain.
 * No buttons, timers, persistence, rewards or extra image decoding work.
 */
export function HumanStoryEventHero({ beat }: { beat: HumanStoryBeat }) {
  const { theme } = useGameTheme();
  const art = humanStoryBeatArtwork(beat);
  if (!art) return null;
  const source = humanCampaignArtworkForMission(art.chapter, art.order).source;

  return (
    <View testID={'human-story-hero-' + beat}
      accessible accessibilityLabel={'Illustrated regional setting: ' + art.caption}
      style={[styles.card, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.human + '88' }]}>
      <View style={styles.scene} pointerEvents="none" importantForAccessibility="no-hide-descendants">
        <Image source={source} resizeMode="cover" style={styles.picture} />
        <View style={styles.bottomShade} />
        <View style={[styles.character, { borderColor: theme.colors.gold + '99', backgroundColor: theme.colors.surface1 }]}>
          <StoryCharacterPortrait role={art.character} faction="human" size={52} />
        </View>
      </View>
      <View style={styles.caption}>
        <View style={[styles.pip, { backgroundColor: theme.colors.gold }]} />
        <Text style={[styles.captionText, { color: theme.colors.text }]} numberOfLines={2}>{art.caption}</Text>
        <Text style={[styles.chapter, { color: theme.colors.textMuted }]}>CH {art.chapter}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  scene: { width: '100%', height: 126, position: 'relative', overflow: 'hidden' },
  picture: { width: '100%', height: '100%' },
  bottomShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 33, backgroundColor: '#111B24AA' },
  character: { position: 'absolute', right: 8, bottom: 6, width: 58, height: 58, borderRadius: 7, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  caption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 7, minHeight: 30 },
  pip: { width: 5, height: 5, borderRadius: 1, flexShrink: 0 },
  captionText: { flex: 1, minWidth: 0, fontSize: 10, lineHeight: 14, fontWeight: '800' },
  chapter: { fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 0.4 }
});
