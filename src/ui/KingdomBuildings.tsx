import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BuildingDefinition, ResourceWallet } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, SecondaryButton, SectionTitle } from './components';
import { BuildingCosts, BuildingHeading } from './SettlementUI';
import { EmphasisText, SemanticChip, SemanticText } from './SemanticUI';
import { semanticColor } from './semanticColors';
import type { SemanticTone } from './semanticColors';
import { buildingRolePresentation } from './settlementPresentation';
import { kingdomBuildingPresentation, kingdomBuildingUnlockHint } from './kingdomBuildingPresentation';

/** One expanded building at a time. Opening a row never spends, moves or upgrades anything. */
export function KingdomBuildings({ buildings, levels, wallet, isBuildingUnlocked, onUpgrade, onOpenSettlement }: {
  buildings: readonly BuildingDefinition[];
  levels: Record<string, number>;
  wallet: ResourceWallet;
  isBuildingUnlocked: (buildingId: string) => boolean;
  onUpgrade: (buildingId: string) => boolean;
  onOpenSettlement: () => void;
}) {
  const { theme } = useGameTheme();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ key: string; text: string; tone: SemanticTone } | null>(null);
  const lastAttempt = useRef<{ key: string; level: number; wallet: ResourceWallet } | null>(null);
  const built = buildings.filter(building => (levels[building.id] ?? 0) > 0).length;

  return (
    <View style={styles.list}>
      <SectionTitle title="Kingdom Buildings" trailing={built + '/' + buildings.length + ' built'} />
      <Text style={[styles.note, { color: theme.colors.textMuted }]}>Open a building to review its benefits, requirements and costs.</Text>
      {buildings.map(building => {
        const key = building.faction + ':' + building.id;
        const level = levels[building.id] ?? 0;
        const unlocked = isBuildingUnlocked(building.id);
        const view = kingdomBuildingPresentation(building, level, unlocked, wallet);
        const expanded = selectedKey === key;
        const roleTone = buildingRolePresentation[building.role]?.tone ?? 'neutral';
        const statusTone: SemanticTone = view.state === 'upgrade'
          ? view.materialsSufficient ? 'positive' : 'warning'
          : view.state === 'blueprint' ? 'blue' : 'neutral';
        const cardFeedback = feedback?.key === key ? feedback : null;

        const upgrade = () => {
          if (view.state !== 'upgrade' || !view.next || !view.materialsSufficient) return;
          // Ignore repeated taps from the same rendered wallet/level snapshot.
          if (lastAttempt.current?.key === key && lastAttempt.current.level === level && lastAttempt.current.wallet === wallet) return;
          lastAttempt.current = { key, level, wallet };
          const ok = onUpgrade(building.id);
          if (!ok) lastAttempt.current = null;
          setFeedback({
            key,
            text: ok
              ? building.name + ' upgraded to Level ' + view.next.level + '.'
              : 'Upgrade not completed. Check the progression requirement and current resources. No upgrade has been applied.',
            tone: ok ? 'positive' : 'warning'
          });
        };

        return (
          <GameCard
            key={key}
            ornament={false}
            accent={expanded ? theme.colors.gold : unlocked ? semanticColor(theme, roleTone) : undefined}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded, selected: expanded }}
              accessibilityLabel={building.name + '. ' + buildingRolePresentation[building.role].label + '. ' + (level > 0 ? 'Level ' + level + '. ' : '') + view.status}
              accessibilityHint={expanded ? 'Collapse building details.' : 'Review benefits, requirements and costs. No resources are spent.'}
              onPress={() => {
                setSelectedKey(expanded ? null : key);
                setFeedback(null);
              }}
              style={({ pressed }) => [styles.rowButton, { opacity: pressed ? 0.85 : 1 }]}
            >
              <BuildingHeading building={building} level={level > 0 ? level : undefined} />
              <View style={styles.rowStatus}>
                <SemanticChip label={view.status} tone={statusTone} compact />
                <Text style={[styles.disclosure, { color: expanded ? semanticColor(theme, 'currency') : theme.colors.textMuted }]}>
                  {expanded ? 'Hide details' : 'View details'}
                </Text>
              </View>
            </Pressable>

            {expanded ? (
              <View style={[styles.details, { borderTopColor: theme.colors.border }]}>
                {view.state === 'locked' ? (
                  <>
                    <Text style={[styles.body, { color: theme.colors.text }]}>{building.description}</Text>
                    <SemanticText tone="warning" style={styles.body}>{kingdomBuildingUnlockHint(building)}</SemanticText>
                  </>
                ) : view.state === 'blueprint' ? (
                  <>
                    <SemanticChip label="Construction preview · not active" tone="blue" compact />
                    <Text style={[styles.body, { color: theme.colors.text }]}>{building.description}</Text>
                    <BuildingCosts cost={building.constructionCost} wallet={wallet} />
                    <Text style={[styles.note, { color: theme.colors.textMuted }]}>Choose an empty unlocked plot in Settlement View. Opening that screen does not buy or place the building.</Text>
                    <SecondaryButton label="Choose construction plot" onPress={onOpenSettlement} />
                  </>
                ) : (
                  <>
                    <SemanticChip label={'Current · Level ' + level} tone="positive" compact />
                    <EmphasisText text={view.current?.effect ?? building.description} mode="resources" style={[styles.body, { color: theme.colors.text }]} />
                    {view.next ? (
                      <View style={[styles.preview, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}>
                        <SemanticChip label={'Next · Level ' + view.next.level + ' preview'} tone="blue" compact />
                        <EmphasisText text={view.next.effect} mode="resources" style={[styles.body, { color: theme.colors.text }]} />
                        <Text style={[styles.label, { color: theme.colors.text }]}>Progression requirement</Text>
                        <SemanticText tone="warning" style={styles.body}>{view.next.requirement}</SemanticText>
                        <BuildingCosts cost={view.next.cost} wallet={wallet} title="Upgrade cost" />
                        <Text style={[styles.note, { color: theme.colors.textMuted }]}>Materials are checked above. The upgrade also requires the listed campaign progress.</Text>
                        <SecondaryButton
                          label={view.materialsSufficient ? 'Upgrade to Level ' + view.next.level : 'Missing upgrade materials'}
                          disabled={!view.materialsSufficient}
                          onPress={upgrade}
                        />
                      </View>
                    ) : (
                      <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                        {view.state === 'maximum'
                          ? 'This building has reached its listed maximum level.'
                          : building.role === 'KINGDOM'
                            ? 'Settlement expansion is managed through the current Kingdom goal and campaign progress.'
                            : 'No direct next-level upgrade is listed for this building.'}
                      </Text>
                    )}
                  </>
                )}
                {cardFeedback ? (
                  <Text accessibilityLiveRegion="polite" style={[styles.feedback, { color: semanticColor(theme, cardFeedback.tone) }]}>{cardFeedback.text}</Text>
                ) : null}
              </View>
            ) : null}
          </GameCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 7 },
  rowButton: { minHeight: 48, gap: 7 },
  rowStatus: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  disclosure: { fontSize: 10.5, lineHeight: 15, fontWeight: '800' },
  details: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 9, paddingTop: 9, gap: 7 },
  preview: { borderWidth: 1, borderRadius: 10, padding: 9, gap: 7, marginTop: 3 },
  body: { fontSize: 11, lineHeight: 15 },
  label: { fontSize: 11.5, lineHeight: 15, fontWeight: '900', marginTop: 2 },
  note: { fontSize: 10.5, lineHeight: 15 },
  feedback: { fontSize: 11, lineHeight: 15, fontWeight: '800' }
});
