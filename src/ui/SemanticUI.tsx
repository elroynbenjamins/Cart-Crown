import React from 'react';
import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import type { CommanderSkillEffectType, UnitBattleTag, UnitRole } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  battleTagPresentation, emphasisParts, getRarityPresentation, rolePresentation,
  semanticChipColors, semanticColor, statTone, tierTone
} from './semanticColors';
import type { SemanticTone, StatPresentation } from './semanticColors';

/** Text is always present: color is an extra cue, never the only way to read a role/status. */
export function SemanticChip({ label, tone = 'neutral', compact = false }: {
  label: string; tone?: SemanticTone; compact?: boolean;
}) {
  const { theme } = useGameTheme();
  const colors = semanticChipColors(theme, tone);
  return (
    <View style={[
      styles.chip, compact && styles.compactChip,
      { backgroundColor: colors.background, borderColor: colors.border }
    ]}>
      <Text style={[styles.chipText, compact && styles.compactText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

export function RoleChip({ role, compact = false }: { role: UnitRole; compact?: boolean }) {
  const presentation = rolePresentation[role];
  return presentation ? <SemanticChip {...presentation} compact={compact} /> : null;
}

export function TierChip({ tier, compact = false }: { tier: number; compact?: boolean }) {
  return Number.isInteger(tier) && tier > 0
    ? <SemanticChip label={'Tier ' + tier} tone={tierTone(tier)} compact={compact} />
    : null;
}

/** Rarity support is opt-in. Current equipment only has tiers, which must stay labelled as tiers. */
export function RarityChip({ rarity }: { rarity?: unknown }) {
  const presentation = getRarityPresentation(rarity);
  return presentation ? <SemanticChip {...presentation} /> : null;
}

export function TraitChip({ label, polarity = 'neutral' }: {
  label: string; polarity?: 'positive' | 'negative' | 'neutral' | 'special';
}) {
  return <SemanticChip label={label} tone={polarity === 'special' ? 'violet' : polarity} />;
}

export function UnitBadges({ role, tier, battleTags = [], compact = false }: {
  role: UnitRole; tier?: number; battleTags?: readonly UnitBattleTag[]; compact?: boolean;
}) {
  // Avoid repeating Support/Ranged/Mounted when the role already communicates it.
  const redundantTag = role === 'cavalry' ? 'mounted' : role === 'support' ? 'support' : role === 'ranged' ? 'ranged' : null;
  const tags = [...new Set(battleTags)].filter(tag => tag !== 'ground' && tag !== redundantTag);
  return (
    <View style={styles.badges}>
      <RoleChip role={role} compact={compact} />
      {tier !== undefined ? <TierChip tier={tier} compact={compact} /> : null}
      {tags.map(tag => {
        const presentation = battleTagPresentation[tag];
        return presentation ? <SemanticChip key={tag} {...presentation} compact={compact} /> : null;
      })}
    </View>
  );
}

export function EffectChip({ effect }: { effect: CommanderSkillEffectType }) {
  const definitions: Record<CommanderSkillEffectType, { label: string; tone: SemanticTone }> = {
    single_damage: { label: 'Direct damage', tone: 'red' },
    bleed: { label: 'Bleed', tone: 'rose' },
    morale_break: { label: 'Morale break', tone: 'violet' },
    armor_break: { label: 'Armor break', tone: 'orange' }
  };
  const presentation = definitions[effect];
  return presentation ? <SemanticChip {...presentation} /> : null;
}

export function StatValue({ value, presentation = 'absolute', lowerIsBetter = false, style }: {
  value: string | number; presentation?: StatPresentation; lowerIsBetter?: boolean; style?: StyleProp<TextStyle>;
}) {
  const { theme } = useGameTheme();
  const tone = statTone(value, presentation, lowerIsBetter);
  return <Text style={[styles.value, style, { color: semanticColor(theme, tone) }]}>{value}</Text>;
}

export function SemanticText({ tone, children, style }: PropsWithChildren<{
  tone: SemanticTone; style?: StyleProp<TextStyle>;
}>) {
  const { theme } = useGameTheme();
  return <Text style={[style, { color: semanticColor(theme, tone) }]}>{children}</Text>;
}

export function EmphasisText({ text, mode = 'bonuses', style }: {
  text: string; mode?: 'bonuses' | 'resources'; style?: StyleProp<TextStyle>;
}) {
  const { theme } = useGameTheme();
  return (
    <Text style={style}>
      {emphasisParts(text, mode).map((part, index) => (
        <Text key={index} style={part.tone ? { color: semanticColor(theme, part.tone), fontWeight: '900' } : undefined}>
          {part.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  chip: { alignSelf: 'flex-start', maxWidth: '100%', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 12, lineHeight: 17, fontWeight: '800', flexShrink: 1 },
  compactChip: { paddingHorizontal: 5, paddingVertical: 3, borderRadius: 6 },
  compactText: { fontSize: 10, lineHeight: 14 },
  value: { fontWeight: '900' }
});
