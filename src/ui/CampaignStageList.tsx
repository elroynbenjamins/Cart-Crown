import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard } from './components';
import { SemanticChip } from './SemanticUI';
import { semanticColor } from './semanticColors';
import { campaignStageStatus } from './metaCampaignPresentation';
import type { CampaignStageRow } from './metaCampaignPresentation';

/** Read-only disclosure: expanding any stage cannot navigate, advance or replay it. */
export function CampaignStageList({ rows, currentId }: {
  rows: readonly CampaignStageRow[];
  currentId: string | null;
}) {
  const { theme } = useGameTheme();
  const [expandedId, setExpandedId] = useState<string | null | undefined>(undefined);
  const openId = expandedId === undefined ? currentId : expandedId;

  return (
    <GameCard ornament={false}>
      <Text accessibilityRole="header" style={[styles.heading, { color: theme.colors.text }]}>Campaign stages</Text>
      <Text style={[styles.note, { color: theme.colors.textMuted }]}>Tap a stage to read it. Only the current objective can be continued below.</Text>
      {rows.map((row, index) => {
        const status = campaignStageStatus[row.state];
        const expanded = row.id === openId;
        const accent = semanticColor(theme, status.tone);
        return (
          <View key={row.id} style={[styles.row, { borderTopColor: theme.colors.border }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={String(index + 1) + '. ' + row.title + '. ' + row.kind + '. ' + status.label}
              accessibilityHint={expanded ? 'Collapse this description. This does not change campaign progress.' : 'Read this stage description. This does not start a battle or change campaign progress.'}
              onPress={() => setExpandedId(expanded ? null : row.id)}
              style={({ pressed }) => [styles.control, { opacity: pressed ? 0.86 : 1 }]}
            >
              <View accessible={false} style={[styles.marker, { borderColor: accent, backgroundColor: theme.colors.surface2 }]}>
                <Text style={[styles.number, { color: accent }]}>{row.state === 'completed' ? '✓' : index + 1}</Text>
              </View>
              <View style={styles.copy}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{row.title}</Text>
                <View style={styles.badges}>
                  <SemanticChip label={status.label} tone={status.tone} compact />
                  <Text style={[styles.kind, { color: theme.colors.textMuted }]}>{row.kind}</Text>
                </View>
              </View>
              <Text accessible={false} style={[styles.chevron, { color: theme.colors.textMuted }]}>{expanded ? '−' : '+'}</Text>
            </Pressable>
            {expanded ? <Text style={[styles.description, { color: theme.colors.textMuted }]}>{row.description}</Text> : null}
          </View>
        );
      })}
    </GameCard>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 14.5, lineHeight: 19, fontWeight: '900' },
  note: { fontSize: 10.5, lineHeight: 15, marginTop: 4, marginBottom: 3 },
  row: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 6, paddingTop: 2 },
  control: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  marker: { width: 24, height: 24, borderWidth: 1, borderRadius: 7, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  number: { fontSize: 11, lineHeight: 15, fontWeight: '900' },
  copy: { flex: 1, minWidth: 0 },
  title: { fontSize: 12, lineHeight: 16, fontWeight: '800' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, alignItems: 'center', marginTop: 4 },
  kind: { fontSize: 10.5, lineHeight: 15 },
  chevron: { fontSize: 18, lineHeight: 22, minWidth: 18, textAlign: 'center' },
  description: { fontSize: 11, lineHeight: 16, paddingBottom: 6 }
});
