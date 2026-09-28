import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { FactionCrest, ResourceSiteSprite, StoryScene } from '../ui/gameArt';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';

export function EmptyThroneScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    chapterNodes,
    completeEmptyThrone
  } = useGame();

  const completed = Boolean(
    chapterNodes.find(node => node.id === 'ch4_node_3')?.completed
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>CROWNROAD EVENT</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>The Empty Throne</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Greenkeep reaches an abandoned royal audience hall. The throne is gone, but official standards, transport records and broken crown wagons remain.
        </Text>
        <View style={styles.sceneWrap}>
          <StoryScene scene="crownspire" size={236} />
        </View>
      </GameCard>

      <SectionTitle title="What the ruins reveal" />

      <GameCard>
        <View style={styles.row}>
          <View style={styles.rowArt}><FactionCrest faction="human" size={44} /></View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>No lawful succession</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              The records show military officials continued issuing royal orders after the court stopped functioning. Someone preserved the machinery of authority without the crown itself.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard>
        <View style={styles.row}>
          <View style={styles.rowArt}><ResourceSiteSprite siteId="crownroad_salvage" faction="human" size={46} /></View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Crownroad Salvage Yard</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              Greenkeep establishes a salvage camp among the abandoned wagons, producing +4 Wood and +3 Iron per meaningful activity.
            </Text>
          </View>
        </View>
      </GameCard>

      {!completed ? (
        <PrimaryButton label="Secure the Royal Records" onPress={() => completeEmptyThrone()} />
      ) : (
        <PrimaryButton label="Continue along the Crownroad" onPress={onComplete} />
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
  rowBody: { fontSize: 11, lineHeight: 16, marginTop: 4 }
});
