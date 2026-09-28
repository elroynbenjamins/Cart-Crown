import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SectionTitle } from '../ui/components';
import { ResourceSiteSprite, StoryScene } from '../ui/gameArt';

export function BrokenArchivesScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const { chapterNodes, completeBrokenArchives } = useGame();

  const completed = Boolean(
    chapterNodes.find(node => node.id === 'ch5_node_3')?.completed
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>ROYAL ARCHIVES</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Broken Archives</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          The recovered estate ledgers lead to a half-burned archive. Orders from different years were altered with the same ash-grey sealing compound and the same accounting marks.
        </Text>
        <View style={styles.sceneWrap}>
          <StoryScene scene="broken_archives" size={236} />
        </View>
      </GameCard>

      <SectionTitle title="What Greenkeep recovers" />

      <GameCard>
        <View style={styles.row}>
          <View style={styles.archiveArt}>
            <ResourceSiteSprite siteId="royal_archive_stores" faction="human" size={48} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Royal Archive Stores</Text>
            <Text style={[styles.rowBody, { color: theme.colors.textMuted }]}>
              Recovered Crown coin, seals and administrative stock join regional production: +8 Gold and +2 Stone per meaningful activity.
            </Text>
          </View>
        </View>
      </GameCard>

      <GameCard accent={theme.colors.human}>
        <Text style={[styles.noteTitle, { color: theme.colors.text }]}>The same hand</Text>
        <Text style={[styles.noteBody, { color: theme.colors.textMuted }]}>
          The false Orc evidence, the marcher warnings and the royal orders were not separate conspiracies. The archive marks all point to one hidden network.
        </Text>
      </GameCard>

      {!completed ? (
        <PrimaryButton label="Secure the Broken Archives" onPress={() => completeBrokenArchives()} />
      ) : (
        <PrimaryButton label="Confront the Ashen Envoy" onPress={onComplete} />
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
  archiveArt: { width: 54, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '900' },
  rowBody: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  noteTitle: { fontSize: 15, fontWeight: '900' },
  noteBody: { fontSize: 11, lineHeight: 17, marginTop: 5 }
});
