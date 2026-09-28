import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton } from '../ui/components';
import { ResourceSiteSprite } from '../ui/gameArt';

export function TimberClaimScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useGameTheme();
  const { unlockTimberCamp, unlockedResourceSites } = useGame();
  const secured = unlockedResourceSites.includes('greenwood_camp');

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <Text style={[styles.eyebrow, { color: theme.colors.human }]}>IRON ROAD EVENT</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Timber Claim</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          The road bends through an abandoned forestry camp. Clearing the surrounding raiders would give Greenkeep a steady source of structural timber.
        </Text>
      </GameCard>

      <GameCard>
        <View style={styles.siteRow}>
          <View style={styles.siteArt}>
            <ResourceSiteSprite siteId="greenwood_camp" faction="human" size={56} />
          </View>
          <View style={styles.siteCopy}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Greenwood Timber Camp</Text>
            <Text style={[styles.cardBody, { color: theme.colors.textMuted }]}>
              Once secured, every completed campaign battle, Expedition, or Kingdom Defense adds +5 Wood to regional production stock.
            </Text>
          </View>
        </View>
      </GameCard>

      {!secured ? (
        <PrimaryButton
          label="Secure the Timber Camp"
          onPress={() => {
            unlockTimberCamp();
          }}
        />
      ) : (
        <PrimaryButton label="Continue" onPress={onComplete} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.15 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  siteRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  siteArt: { width: 62, alignItems: 'center', justifyContent: 'center' },
  siteCopy: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '900' },
  cardBody: { fontSize: 11.5, lineHeight: 17, marginTop: 5 }
});
