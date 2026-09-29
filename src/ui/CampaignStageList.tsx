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
  heading: { fontSize: 16, lineHeight: 22, fontWeight: '900' },
  note: { fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 4 },
  row: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 8, paddingTop: 3 },
  control: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  marker: { width: 28, height: 28, borderWidth: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  number: { fontSize: 13, lineHeight: 19, fontWeight: '900' },
  copy: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, lineHeight: 20, fontWeight: '800' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 5 },
  kind: { fontSize: 12, lineHeight: 18 },
  chevron: { fontSize: 20, lineHeight: 26, minWidth: 20, textAlign: 'center' },
  description: { fontSize: 13, lineHeight: 20, paddingBottom: 8 }
});
