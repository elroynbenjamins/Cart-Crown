import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BuildingDefinition, BuildingRole, ResourceWallet, SettlementAdjacencyBonusDefinition } from '../game/types';
import { getBuildingLevelDefinition } from '../game/kingdom';
import { useGameTheme } from '../theme/ThemeProvider';
import { BuildingSprite } from './gameArt';
import { EmphasisText, SemanticChip, SemanticText } from './SemanticUI';
import { semanticColor } from './semanticColors';
import { researchCostRows } from './researchPresentation';
import { buildingRolePresentation, districtEffectRows } from './settlementPresentation';
import type { DistrictDisplayState } from './settlementPresentation';

export function BuildingRoleChip({ role }: { role: BuildingRole }) {
  const presentation = buildingRolePresentation[role];
  return presentation ? <SemanticChip {...presentation} compact /> : null;
}

export function BuildingHeading({ building, level }: { building: BuildingDefinition; level?: number }) {
  const { theme } = useGameTheme();
  const tone = buildingRolePresentation[building.role]?.tone ?? 'neutral';
  return (
    <View style={styles.heading}>
      <View style={[styles.art, { borderColor: semanticColor(theme, tone), backgroundColor: theme.colors.surface2 }]}>
        <BuildingSprite buildingId={building.id} faction={building.faction} size={44} />
      </View>
      <View style={styles.copy}>
        <SemanticText tone={tone} style={styles.title}>{building.name}</SemanticText>
        <View style={styles.chips}>
          <BuildingRoleChip role={building.role} />
          {level !== undefined ? <SemanticChip label={'Level ' + level} tone="neutral" compact /> : null}
        </View>
      </View>
    </View>
  );
}

/** Uses the supplied, already-rebalanced cost. Affordability is not an unlock check. */
export function BuildingCosts({ cost, wallet, title = 'Construction cost' }: {
  cost: Partial<ResourceWallet>; wallet: ResourceWallet; title?: string;
}) {
  const { theme } = useGameTheme();
  const rows = researchCostRows(cost, wallet);
  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{title}</Text>
      {rows.length === 0 ? <SemanticText tone="neutral" style={styles.body}>No resource cost</SemanticText> : rows.map(row => (
        <View key={row.resource} style={[styles.costRow, { borderBottomColor: theme.colors.border }]}>
          <SemanticText tone="currency" style={styles.costAmount}>{row.required} {row.label}</SemanticText>
          <Text style={[styles.costOwned, { color: theme.colors.textMuted }]}>Have {row.available ?? '—'}</Text>
          <SemanticText tone={row.missing === 0 ? 'positive' : 'warning'} style={styles.costStatus}>
            {row.missing === null ? 'Check balance' : row.missing === 0 ? 'Enough' : row.missing + ' short'}
          </SemanticText>
        </View>
      ))}
    </View>
  );
}

/** Current benefits and a labelled next-level preview, never a second upgrade transaction. */
export function BuildingLevelPreview({ building, level, wallet }: {
  building: BuildingDefinition; level: number; wallet: ResourceWallet;
}) {
  const { theme } = useGameTheme();
  const current = getBuildingLevelDefinition(building.id, level);
  const next = level < building.maxLevel ? getBuildingLevelDefinition(building.id, level + 1) : null;
  return (
    <View style={styles.section}>
      <SemanticChip label={'Current · Level ' + level} tone="positive" compact />
      <EmphasisText text={current?.effect ?? building.description} mode="resources" style={[styles.body, { color: theme.colors.text }]} />
      {next ? (
        <View style={[styles.nextLevel, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}>
          <SemanticChip label={'Next · Level ' + next.level + ' preview'} tone="blue" compact />
          <EmphasisText text={next.effect} mode="resources" style={[styles.body, { color: theme.colors.text }]} />
          <Text style={[styles.requirementLabel, { color: theme.colors.textMuted }]}>Progression requirement</Text>
          <SemanticText tone="warning" style={styles.body}>{next.requirement}</SemanticText>
          <BuildingCosts cost={next.cost} wallet={wallet} title="Next upgrade cost" />
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>Preview only. Resource availability does not satisfy progression requirements by itself.</Text>
        </View>
      ) : (
        <SemanticChip label={level >= building.maxLevel ? 'Maximum level' : 'No direct upgrade listed'} tone="neutral" compact />
      )}
    </View>
  );
}

export function DistrictEffects({ bonus, state }: {
  bonus: SettlementAdjacencyBonusDefinition; state: DistrictDisplayState;
}) {
  const { theme } = useGameTheme();
  const rows = districtEffectRows(bonus.effects, state);
  return (
    <View style={styles.effects}>
      {rows.length ? rows.map(row => (
        <View key={row.key} style={styles.effectRow}>
          <Text style={[styles.effectLabel, { color: theme.colors.textMuted }]}>{row.label}</Text>
          <SemanticText tone={row.tone} style={styles.effectValue}>{row.value}</SemanticText>
        </View>
      )) : <Text style={[styles.body, { color: theme.colors.textMuted }]}>{bonus.effectText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  art: { width: 46, height: 50, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, lineHeight: 19, fontWeight: '900', flexShrink: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 },
  section: { gap: 6, marginTop: 9 },
  label: { fontSize: 11.5, lineHeight: 15, fontWeight: '900' },
  body: { fontSize: 11, lineHeight: 15 },
  costRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 2, paddingVertical: 5, borderBottomWidth: StyleSheet.hairlineWidth },
  costAmount: { flexGrow: 1, flexShrink: 1, fontSize: 11, lineHeight: 15, fontWeight: '800' },
  costOwned: { fontSize: 10.5, lineHeight: 15, flexShrink: 1 },
  costStatus: { fontSize: 10.5, lineHeight: 15, fontWeight: '800', flexShrink: 1 },
  nextLevel: { borderWidth: 1, borderRadius: 10, padding: 9, gap: 6 },
  requirementLabel: { fontSize: 10.5, lineHeight: 15, fontWeight: '800', marginTop: 2 },
  note: { fontSize: 10.5, lineHeight: 15 },
  effects: { gap: 5, marginTop: 7 },
  effectRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 6, rowGap: 2 },
  effectLabel: { flexGrow: 1, flexShrink: 1, fontSize: 11, lineHeight: 15 },
  effectValue: { flexShrink: 1, fontSize: 12.5, lineHeight: 17, fontWeight: '900' }
});
