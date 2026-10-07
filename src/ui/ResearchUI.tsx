import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { FantasyRecruitTemplate } from '../game/progression';
import type { ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, PrimaryButton } from './components';
import { DecisionStats } from './DecisionUI';
import { UnitSprite } from './gameArt';
import { SemanticChip, SemanticText, UnitBadges } from './SemanticUI';
import { rolePresentation, semanticColor } from './semanticColors';
import { formatResearchDuration, researchCostRows, researchStatePresentation } from './researchPresentation';
import type { ResearchVisualState } from './researchPresentation';

/** Status words remain visible; color does not stand in for an unlock or completed transaction. */
export function ResearchStateChip({ state, remainingHours }: {
  state: ResearchVisualState; remainingHours?: number;
}) {
  const presentation = researchStatePresentation[state];
  const label = state === 'active' && remainingHours !== undefined
    ? presentation.label + ' · ' + formatResearchDuration(remainingHours)
    : presentation.label;
  return <SemanticChip label={label} tone={presentation.tone} />;
}

export function ResearchUnlocks({ classes, templates }: {
  classes: readonly string[]; templates: readonly FantasyRecruitTemplate[];
}) {
  const { theme } = useGameTheme();
  return (
    <View style={styles.unlocks}>
      <Text style={[styles.caption, { color: theme.colors.textMuted }]}>Unlocks</Text>
      <View style={styles.chips}>
        {classes.map(className => {
          const template = templates.find(candidate => candidate.className === className);
          const tone = template ? rolePresentation[template.role]?.tone ?? 'neutral' : 'neutral';
          return <SemanticChip key={className} label={className} tone={tone} compact />;
        })}
      </View>
    </View>
  );
}

/** Exact requirements, not projected earnings or an automatic purchase action. */
export function ResearchCosts({ cost, wallet }: { cost: Partial<ResourceWallet>; wallet: ResourceWallet }) {
  const { theme } = useGameTheme();
  const rows = researchCostRows(cost, wallet);
  return (
    <View style={styles.costs}>
      <Text style={[styles.caption, { color: theme.colors.textMuted }]}>{rows.length ? 'Training cost' : 'No resource cost'}</Text>
      {rows.map(row => (
        <View key={row.resource} style={styles.costRow}>
          <SemanticText tone="currency" style={styles.costAmount}>{row.required} {row.label}</SemanticText>
          <Text style={[styles.costOwned, { color: theme.colors.textMuted }]}>Have {row.available ?? '—'}</Text>
          <SemanticText tone={row.missing === 0 ? 'positive' : 'warning'} style={styles.costState}>
            {row.missing === null ? 'Check balance' : row.missing === 0 ? 'Enough' : row.missing + ' short'}
          </SemanticText>
        </View>
      ))}
    </View>
  );
}

export function ResearchGemCost({ cost, balance }: { cost: number; balance: number }) {
  const missing = Math.max(0, cost - balance);
  return (
    <View style={styles.chips}>
      <SemanticChip label={'Optional finish · ' + cost + ' Gems'} tone="currency" compact />
      {missing > 0 ? <SemanticChip label={'Need ' + missing + ' more Gems'} tone="warning" compact /> : null}
    </View>
  );
}

/** No model calls here: the parent supplies unchanged unlock/affordability rules and the explicit Train action. */
export function ResearchRecruitCard({ template, unlocked, affordable, wallet, onTrain }: {
  template: FantasyRecruitTemplate;
  unlocked: boolean;
  affordable: boolean;
  wallet: ResourceWallet;
  onTrain: () => void;
}) {
  const { theme } = useGameTheme();
  const roleTone = rolePresentation[template.role]?.tone ?? 'neutral';
  const roleColor = semanticColor(theme, roleTone);
  return (
    <GameCard accent={unlocked ? roleColor : undefined} faction={template.faction} ornament={false}>
      <View style={styles.recruitHeader}>
        <View style={[styles.sprite, { borderColor: roleColor }]}>
          <UnitSprite className={template.className} faction={template.faction} size={44} />
        </View>
        <View style={styles.copy}>
          <SemanticText tone={roleTone} style={styles.className}>{template.className}</SemanticText>
          <SemanticChip
            label={!unlocked ? 'Research required' : affordable ? 'Can train' : 'Missing resources'}
            tone={!unlocked ? 'neutral' : affordable ? 'positive' : 'warning'}
            compact
          />
        </View>
      </View>
      <View style={styles.section}>
        <UnitBadges role={template.role} tier={template.tier} battleTags={template.battleTags} compact />
      </View>
      <View style={styles.section}>
        <DecisionStats items={[
          { label: 'HP', value: template.hp },
          { label: 'Attack', value: template.attack },
          { label: 'Armor', value: template.armor },
          { label: 'Speed', value: template.speed }
        ]} />
      </View>
      <ResearchCosts cost={template.cost} wallet={wallet} />
      <View style={styles.section}>
        <PrimaryButton
          label={unlocked ? affordable ? 'Train ' + template.className : 'Missing Resources' : 'Research Required'}
          disabled={!unlocked || !affordable}
          onPress={onTrain}
        />
      </View>
    </GameCard>
  );
}

const styles = StyleSheet.create({
  unlocks: { gap: 4, marginTop: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, alignItems: 'center' },
  caption: { fontSize: 10.5, lineHeight: 15, fontWeight: '800' },
  costs: { marginTop: 9, gap: 4 },
  costRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'baseline' },
  costAmount: { fontSize: 11, lineHeight: 15, fontWeight: '800', flexGrow: 1 },
  costOwned: { fontSize: 10.5, lineHeight: 15 },
  costState: { fontSize: 10.5, lineHeight: 15, fontWeight: '800' },
  recruitHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sprite: { width: 48, height: 52, borderWidth: 2, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  className: { fontSize: 15, lineHeight: 19, fontWeight: '900' },
  section: { marginTop: 8 }
});
