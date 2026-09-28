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
import { GameCard, Pill, PrimaryButton, SecondaryButton } from '../ui/components';

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
        <View style={styles.header}>
          <Text style={[styles.brand, { color: theme.colors.gold }]}>CART & CROWN</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Choose a Save</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Two independent worlds. Each save begins with Humans, then later stores separate Human, Elf and Orc kingdom states inside the same slot.
          </Text>
        </View>

        <View style={styles.slots}>
          {slotIds.map((slotId, index) => {
            const metadata = slots[index];

            return (
              <GameCard key={slotId} accent={metadata ? theme.colors.human : undefined}>
                <View style={styles.slotHeader}>
                  <View>
                    <Text style={[styles.slotLabel, { color: theme.colors.textMuted }]}>SAVE {slotId}</Text>
                    <Text style={[styles.slotTitle, { color: theme.colors.text }]}>
                      {metadata ? metadata.kingdomName : 'Empty Slot'}
                    </Text>
                  </View>
                  <Pill label={metadata ? metadata.faction.toUpperCase() : 'NEW'} />
                </View>

                {metadata ? (
                  <>
                    <Text style={[styles.chapter, { color: theme.colors.textMuted }]}>
                      {metadata.chapterLabel}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaText, { color: theme.colors.text }]}>
                        {metadata.activeSquads} active squads
                      </Text>
                      <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                        {formatDate(metadata.updatedAt)}
                      </Text>
                    </View>
                    <View style={styles.unlockRow}>
                      <Text style={[styles.unlockText, { color: metadata.elfCampaignUnlocked ? theme.colors.elf : theme.colors.textMuted }]}>
                        {metadata.elfCampaignUnlocked ? '✓' : '🔒'} Elves
                      </Text>
                      <Text style={[styles.unlockText, { color: metadata.orcCampaignUnlocked ? theme.colors.orc : theme.colors.textMuted }]}>
                        {metadata.orcCampaignUnlocked ? '✓' : '🔒'} Orcs
                      </Text>
                    </View>
                    <View style={styles.actions}>
                      <View style={styles.actionGrow}>
                        <PrimaryButton label="Continue" onPress={() => void selectSlot(slotId)} />
                      </View>
                      <View style={styles.actionGrow}>
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
                      Start with two Human survivors, a 4×4 Supply Wagon and the road to Greenkeep.
                    </Text>
                    <PrimaryButton label="Start Human Campaign" onPress={() => void createSlot(slotId)} />
                  </>
                )}
              </GameCard>
            );
          })}
        </View>

        <GameCard>
          <Text style={[styles.noteTitle, { color: theme.colors.text }]}>How faction saves work</Text>
          <Text style={[styles.noteBody, { color: theme.colors.textMuted }]}>
            Once Humans are completed, the same save can hold a separate Elf kingdom and Orc kingdom. Switching faction never deletes the completed Human state, so you can always return to it.
          </Text>
        </GameCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 12, fontWeight: '700' },
  content: { padding: 18, paddingBottom: 34, gap: 16 },
  header: { paddingTop: 16, paddingBottom: 4 },
  brand: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '900', marginTop: 7 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 360 },
  slots: { gap: 12 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  slotLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  slotTitle: { fontSize: 20, fontWeight: '900', marginTop: 3 },
  chapter: { fontSize: 12, lineHeight: 17, marginTop: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 12 },
  metaText: { fontSize: 10.5, fontWeight: '700' },
  unlockRow: { flexDirection: 'row', gap: 14, marginTop: 9 },
  unlockText: { fontSize: 10.5, fontWeight: '900' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionGrow: { flex: 1 },
  deleteWarning: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 8, fontWeight: '800' },
  emptyBody: { fontSize: 12, lineHeight: 18, marginVertical: 12 },
  noteTitle: { fontSize: 14, fontWeight: '900' },
  noteBody: { fontSize: 11, lineHeight: 17, marginTop: 5 }
});
