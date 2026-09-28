import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';
import { ResourceSiteSprite, StoryCharacterPortrait, StoryScene } from '../ui/gameArt';

export function DividedMarchScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useGameTheme();
  const {
    dividedMarchResolved,
    completeDividedMarch
  } = useGame();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <Text style={[styles.eyebrow, { color: theme.colors.human }]}>BORDER EVENT</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>The Divided March</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          With Siege Road open, the marcher captains finally compare their orders. The seals are genuine, but the instructions were deliberately issued to make every house distrust the others.
        </Text>
        <View style={styles.sceneWrap}>
          <StoryScene scene="grand_council" size={236} />
        </View>
      </GameCard>

      <SectionTitle title="What Greenkeep gains" />

      <GameCard>
        <View style={styles.row}>
          <View style={styles.rowArt}><StoryCharacterPortrait role="delegate" size={46} /></View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Shared evidence</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              Greenkeep distributes copies of the contradictory orders to all three houses, preventing one faction from controlling the narrative.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard>
        <View style={styles.row}>
          <View style={styles.rowArt}><ResourceSiteSprite siteId="marcher_depot" faction="human" size={46} /></View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Marcher Supply Depot</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              A neutral depot joins Greenkeep’s regional network, producing +6 Gold and +2 Provisions per completed activity.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.noteTitle, { color: theme.colors.text }]}>The real enemy steps forward</Text>
        <Text style={[styles.noteBody, { color: theme.colors.textMuted }]}>
          Lord Marshal Veyr orders every marcher fort to ignore Greenkeep’s evidence and rally under his personal standard. The division was not an accident.
        </Text>
      </GameCard>

      {!dividedMarchResolved ? (
        <PrimaryButton
          label="Unite the Marcher Captains"
          onPress={() => {
            completeDividedMarch();
          }}
        />
      ) : (
        <PrimaryButton label="Confront Lord Marshal Veyr" onPress={onComplete} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  sceneWrap: { alignItems: 'center', marginTop: 10 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  rowArt: { width: 54, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '900' },
  rowBody: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  noteTitle: { fontSize: 15, fontWeight: '900' },
  noteBody: { fontSize: 11, lineHeight: 17, marginTop: 5 }
});
