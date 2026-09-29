import React, { useState } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton } from './components';
import { getDecisionFooterLayout } from './decisionPresentation';
import { EmphasisText, SemanticText, StatValue } from './SemanticUI';
import { semanticColor } from './semanticColors';
import type { SemanticTone, StatPresentation } from './semanticColors';

/** Uses real available content height, not the full device height. AppShell owns safe areas. */
export function DecisionLayout({ children, footer }: PropsWithChildren<{ footer: ReactNode }>) {
  const { theme } = useGameTheme();
  const { fontScale } = useWindowDimensions();
  const [availableHeight, setAvailableHeight] = useState(0);
  const layout = getDecisionFooterLayout(availableHeight, fontScale);

  return (
    <View
      style={styles.screen}
      onLayout={event => setAvailableHeight(event.nativeEvent.layout.height)}
    >
      <ScrollView
        testID="decision-content"
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
        {!layout.docked ? (
          <View style={[styles.inlineFooter, { borderTopColor: theme.colors.border }]}>
            {footer}
          </View>
        ) : null}
      </ScrollView>
      {layout.docked ? (
        <ScrollView
          testID="decision-footer"
          style={[
            styles.dock,
            {
              maxHeight: layout.maxHeight,
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.surface1
            }
          ]}
          contentContainerStyle={styles.dockContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {footer}
        </ScrollView>
      ) : null}
    </View>
  );
}

export function DecisionIntro({ eyebrow, title, body, accent }: {
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
}) {
  const { theme } = useGameTheme();
  return (
    <GameCard accent={accent} ornament={false}>
      <Text style={[styles.eyebrow, { color: accent }]}>{eyebrow}</Text>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.colors.textMuted }]}>{body}</Text>
    </GameCard>
  );
}

/** Selects a draft only. No spending, promotion or recruitment belongs in this component. */
export function DecisionOption({ title, subtitle, titleTone, selected, disabled = false, art, accessibilitySummary, onSelect, children }: PropsWithChildren<{
  title: string;
  subtitle: string;
  titleTone?: SemanticTone;
  selected: boolean;
  disabled?: boolean;
  art?: ReactNode;
  accessibilitySummary?: string;
  onSelect: () => void;
}>) {
  const { theme } = useGameTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={[title, subtitle, accessibilitySummary].filter(Boolean).join('. ')}
      accessibilityHint="Select this option to review it before confirming."
      disabled={disabled}
      onPress={onSelect}
      style={({ pressed }) => ({ opacity: pressed && !disabled ? 0.86 : 1 })}
    >
      <GameCard accent={selected ? theme.colors.gold : undefined} ornament={false}>
        <View style={styles.optionHeader}>
          {art ? <View style={styles.art}>{art}</View> : null}
          <View style={styles.optionCopy}>
            <Text style={[styles.optionTitle, { color: titleTone ? semanticColor(theme, titleTone) : theme.colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
          </View>
          <View
            accessible={false}
            style={[
              styles.radio,
              { borderColor: selected ? theme.colors.gold : theme.colors.border }
            ]}
          >
            {selected ? <View style={[styles.radioFill, { backgroundColor: theme.colors.gold }]} /> : null}
          </View>
        </View>
        <Text style={[styles.selection, { color: selected ? semanticColor(theme, 'currency') : theme.colors.textMuted }]}>
          {selected ? 'Selected' : 'Tap to select'}
        </Text>
        <View style={styles.optionContent}>{children}</View>
      </GameCard>
    </Pressable>
  );
}

export function DecisionStats({ items, presentation = 'absolute' }: {
  items: ReadonlyArray<{ label: string; value: string | number; lowerIsBetter?: boolean }>;
  presentation?: StatPresentation;
}) {
  const { theme } = useGameTheme();
  return (
    <View style={styles.stats}>
      {items.map(item => (
        <View key={item.label} style={[styles.stat, { backgroundColor: theme.colors.surface2 }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{item.label}</Text>
          <StatValue value={item.value} presentation={presentation} lowerIsBetter={item.lowerIsBetter} style={styles.statValue} />
        </View>
      ))}
    </View>
  );
}

export function DecisionCommit({ title, detail, warning, message, label, disabled, onConfirm, children }: PropsWithChildren<{
  title: string;
  detail?: string;
  warning?: string | null;
  message?: string | null;
  label: string;
  disabled?: boolean;
  onConfirm?: () => void;
}>) {
  const { theme } = useGameTheme();
  return (
    <View style={styles.commit}>
      <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{title}</Text>
      {detail ? <EmphasisText text={detail} mode="resources" style={[styles.subtitle, { color: theme.colors.textMuted }]} /> : null}
      {warning ? <SemanticText tone="warning" style={styles.subtitle}>{warning}</SemanticText> : null}
      {message ? (
        <Text accessibilityLiveRegion="polite" style={[styles.subtitle, { color: theme.colors.text }]}>{message}</Text>
      ) : null}
      <PrimaryButton label={label} disabled={disabled} onPress={onConfirm} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24, gap: 12 },
  dock: { flexGrow: 0, flexShrink: 1, borderTopWidth: 1 },
  dockContent: { padding: 16, gap: 10 },
  inlineFooter: { borderTopWidth: 1, paddingTop: 16, marginTop: 4 },
  eyebrow: { fontSize: 11, lineHeight: 16, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  optionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
  optionCopy: { flex: 1, minWidth: 0 },
  art: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontSize: 16, lineHeight: 22, fontWeight: '900', flexShrink: 1 },
  subtitle: { fontSize: 13, lineHeight: 19, flexShrink: 1 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioFill: { width: 12, height: 12, borderRadius: 6 },
  selection: { fontSize: 12, lineHeight: 18, fontWeight: '800', marginTop: 8 },
  optionContent: { gap: 8, marginTop: 8 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stat: { flexGrow: 1, minWidth: 62, borderRadius: 10, padding: 8 },
  statLabel: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  statValue: { fontSize: 15, lineHeight: 21, fontWeight: '900' },
  commit: { gap: 9 }
});
