import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { SaveSlotId } from '../save/types';
import { useSaveSystem } from '../save/SaveProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton, SecondaryButton, StatusPill } from '../ui/components';
import { FactionCampScene, FactionCrest } from '../ui/gameArt';

const slotIds: SaveSlotId[] = [1, 2];

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function SaveSelectScreen() {
  const { theme } = useGameTheme();
  const { ready, slots, selectSlot, createSlot, deleteSlot } = useSaveSystem();
  const [deleteArmed, setDeleteArmed] = useState<SaveSlotId | null>(null);
  const [sceneWidth, setSceneWidth] = useState(0);

  if (!ready) {
    return (
      <SafeAreaView style={[styles.loading, { backgroundColor: theme.colors.appBg }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading saves…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.appBg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GameCard accent={theme.colors.gold} ornament={false} style={styles.intro}>
          <View style={styles.brandRow}>
            <View style={[styles.brandRule, { backgroundColor: theme.colors.gold }]} />
            <Text style={[styles.brand, { color: theme.colors.gold }]}>CART & CROWN</Text>
            <View style={[styles.brandRule, { backgroundColor: theme.colors.gold }]} />
          </View>
          <View
            style={styles.introArt}
            onLayout={({ nativeEvent }) => setSceneWidth(nativeEvent.layout.width)}
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
          >
            {sceneWidth > 0 ? <FactionCampScene faction="human" size={sceneWidth} /> : null}
            <View style={[styles.introCrest, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.gold }]}>
              <FactionCrest faction="human" size={32} />
            </View>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Choose a Save</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            From two survivors to a kingdom. Choose where your story continues.
          </Text>
        </GameCard>

        <View style={styles.slots}>
          {slotIds.map((slotId, index) => {
            const metadata = slots[index];
            const faction = metadata?.faction ?? 'human';
            const accent = theme.colors[faction];

            return (
              <GameCard
                key={slotId}
                accent={metadata ? accent : theme.colors.primary}
                faction={faction}
                state={metadata ? 'default' : 'ready'}
                ornament={Boolean(metadata)}
              >
                <View style={styles.slotHeader}>
                  <View style={[styles.slotCrest, { backgroundColor: theme.colors.surface2, borderColor: accent + '66' }]}>
                    <FactionCrest faction={faction} size={38} />
                  </View>
                  <View style={styles.slotCopy}>
                    <View style={styles.slotEyebrow}>
                      <Text style={[styles.slotLabel, { color: metadata ? accent : theme.colors.textMuted }]}>SAVE {slotId}</Text>
                      <StatusPill
                        label={metadata ? metadata.faction.toUpperCase() : 'NEW'}
                        tone={metadata ? 'current' : 'available'}
                      />
                    </View>
                    <Text style={[styles.slotTitle, { color: theme.colors.text }]} numberOfLines={2}>
                      {metadata ? metadata.kingdomName : 'A new beginning'}
                    </Text>
                  </View>
                </View>

                {metadata ? (
                  <>
                    <View style={[styles.progressPanel, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}>
                      <Text style={[styles.progressLabel, { color: accent }]}>CAMPAIGN PROGRESS</Text>
                      <Text style={[styles.chapter, { color: theme.colors.text }]}>
                        {metadata.chapterLabel}
                      </Text>
                      <View style={styles.metaRow}>
                        <Text style={[styles.metaText, { color: theme.colors.text }]}>
                          {metadata.activeSquads} active squads
                        </Text>
                        <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                          Saved {formatDate(metadata.updatedAt)}
                        </Text>
                      </View>
                      <View style={styles.unlockRow}>
                        <View style={styles.unlockFaction}>
                          <FactionCrest faction="elf" size={24} />
                          <StatusPill
                            label={metadata.elfCampaignUnlocked ? 'ELVES READY' : 'ELVES LOCKED'}
                            tone={metadata.elfCampaignUnlocked ? 'available' : 'locked'}
                          />
                        </View>
                        <View style={styles.unlockFaction}>
                          <FactionCrest faction="orc" size={24} />
                          <StatusPill
                            label={metadata.orcCampaignUnlocked ? 'ORCS READY' : 'ORCS LOCKED'}
                            tone={metadata.orcCampaignUnlocked ? 'available' : 'locked'}
                          />
                        </View>
                      </View>
                    </View>
                    <View style={styles.actions}>
                      <View style={styles.actionGrow}>
                        <PrimaryButton label="Continue" onPress={() => void selectSlot(slotId)} />
                      </View>
                      <View style={styles.deleteAction}>
                        <SecondaryButton
                          label={deleteArmed === slotId ? 'Confirm Delete' : 'Delete'}
                          onPress={() => {
                            if (deleteArmed === slotId) {
                              void deleteSlot(slotId);
                              setDeleteArmed(null);
                            } else {
                              setDeleteArmed(slotId);
                            }
                          }}
                        />
                      </View>
                    </View>
                    {deleteArmed === slotId ? (
                      <Text style={[styles.deleteWarning, { color: theme.colors.danger }]}>
                        Tap Confirm Delete again to permanently clear this save.
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <>
                    <Text style={[styles.emptyBody, { color: theme.colors.textMuted }]}>
                      Two Human survivors. A 4×4 Supply Wagon. Your road to Greenkeep starts here.
                    </Text>
                    <PrimaryButton label="Start Human Campaign" onPress={() => void createSlot(slotId)} />
                  </>
                )}
              </GameCard>
            );
          })}
        </View>

        <View style={[styles.note, { borderColor: theme.colors.border }]}>
          <Text style={[styles.noteTitle, { color: theme.colors.text }]}>Two saves. Three factions to discover.</Text>
          <Text style={[styles.noteBody, { color: theme.colors.textMuted }]}>
            Complete the Human campaign to unlock Elves and Orcs. Each faction keeps its own kingdom within your save, so you can return to any of them.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 9 },
  loadingText: { fontSize: 12, fontWeight: '700' },
  content: { width: '100%', maxWidth: 540, alignSelf: 'center', padding: 12, paddingBottom: 24, gap: 10 },
  intro: { alignItems: 'center', paddingTop: 12, paddingBottom: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9, alignSelf: 'stretch' },
  brandRule: { flex: 1, height: 1, opacity: 0.45 },
  brand: { flexShrink: 1, fontSize: 15, fontWeight: '900', letterSpacing: 1.6, textAlign: 'center' },
  introArt: { width: '100%', maxWidth: 300, aspectRatio: 1 / 0.48, alignItems: 'center', justifyContent: 'flex-end', marginTop: 1, marginBottom: 10 },
  introCrest: { position: 'absolute', right: 6, bottom: 6, width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 23, lineHeight: 28, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 10.5, lineHeight: 15, marginTop: 4, maxWidth: 350, textAlign: 'center' },
  slots: { gap: 8 },
  slotHeader: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  slotCrest: { width: 44, height: 48, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  slotCopy: { flex: 1, minWidth: 0 },
  slotEyebrow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  slotLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  slotTitle: { fontSize: 16.5, lineHeight: 20, fontWeight: '900', marginTop: 3 },
  progressPanel: { borderWidth: 1, borderRadius: 9, padding: 8, marginTop: 7 },
  progressLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  chapter: { fontSize: 11, lineHeight: 15, fontWeight: '800', marginTop: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: 10, rowGap: 5, marginTop: 9 },
  metaText: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  unlockRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 8, marginTop: 8 },
  unlockFaction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  actionGrow: { flex: 1, minWidth: 140 },
  deleteAction: { minWidth: 100, maxWidth: '100%' },
  deleteWarning: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 8, fontWeight: '800' },
  emptyBody: { fontSize: 10.5, lineHeight: 15, marginVertical: 10 },
  note: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, paddingHorizontal: 3 },
  noteTitle: { fontSize: 10.5, lineHeight: 15, fontWeight: '900' },
  noteBody: { fontSize: 10, lineHeight: 14, marginTop: 4 }
});
