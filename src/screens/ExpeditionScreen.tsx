import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { expeditionRoute } from '../game/sideModes';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SecondaryButton, SectionTitle } from '../ui/components';

export function ExpeditionScreen({ onExit }: { onExit: () => void }) {
  const { theme } = useGameTheme();
  const {
    expeditionTickets,
    consumeExpeditionTicket,
    finishExpedition,
    claimRewardedAd,
    rewardedAdClaims,
    rewardedAdMessage,
    settlementEffects,
    buildingLevels,
    factionBuildingIds
  } = useGame();
  const [started, setStarted] = useState(false);
  const [nodeIndex, setNodeIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const start = () => {
    if (consumeExpeditionTicket()) {
      setStarted(true);
      setNodeIndex(0);
    }
  };

  const advance = () => {
    if (nodeIndex >= expeditionRoute.length - 1) {
      finishExpedition();
      setFinished(true);
      return;
    }
    setNodeIndex(previous => previous + 1);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.primary}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>SIDE MODE</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Iron Road Expedition</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              A short repeatable run. One wagon loadout must survive the entire route.
            </Text>
          </View>
          <Pill label={String(expeditionTickets) + ' ticket'} />
        </View>
      </GameCard>

      <SectionTitle title="Route" trailing={started ? 'Run in progress' : 'Preview'} />

      <View style={styles.route}>
        {expeditionRoute.map((node, index) => {
          const completed = started && index < nodeIndex;
          const current = started && index === nodeIndex && !finished;

          return (
            <GameCard key={node.id} accent={current ? theme.colors.gold : completed ? theme.colors.primary : undefined}>
              <View style={styles.nodeRow}>
                <View
                  style={[
                    styles.nodeMark,
                    {
                      backgroundColor: completed
                        ? theme.colors.primary
                        : current
                          ? theme.colors.gold
                          : theme.colors.surface2
                    }
                  ]}
                >
                  <Text style={styles.nodeNumber}>{completed ? '✓' : index + 1}</Text>
                </View>
                <View style={styles.nodeCopy}>
                  <Text style={[styles.nodeType, { color: theme.colors.textMuted }]}>{node.type}</Text>
                  <Text style={[styles.nodeName, { color: theme.colors.text }]}>{node.title}</Text>
                </View>
                {current ? <Pill label="CURRENT" color={theme.colors.gold + '45'} /> : null}
              </View>
            </GameCard>
          );
        })}
      </View>

      {!started ? (
        <>
          <PrimaryButton
            label={expeditionTickets > 0 ? 'Start Expedition' : 'No tickets available'}
            disabled={expeditionTickets <= 0}
            onPress={start}
          />
          <SecondaryButton
            label={(rewardedAdClaims.expedition_ticket ?? 0) >= 1 ? 'Extra ticket claimed' : 'Watch optional ad for +1 ticket'}
            disabled={(rewardedAdClaims.expedition_ticket ?? 0) >= 1}
            onPress={() => void claimRewardedAd('expedition_ticket')}
          />
        </>
      ) : finished ? (
        <GameCard accent={theme.colors.primary}>
          <Text style={[styles.finishTitle, { color: theme.colors.text }]}>Expedition Complete</Text>
          <Text style={[styles.finishBody, { color: theme.colors.textMuted }]}>
            +35 Gold · +{
              8 +
              ((buildingLevels[factionBuildingIds.logistics] ?? 0) >= 2 ? 1 : 0) +
              settlementEffects.expeditionWoodBonus
            } Wood · +{4 + settlementEffects.expeditionProvisionBonus} Provisions
          </Text>
          <View style={styles.finishButton}>
            <PrimaryButton label="Return to Campaign" onPress={onExit} />
          </View>
        </GameCard>
      ) : (
        <GameCard accent={theme.colors.gold}>
          <Text style={[styles.currentTitle, { color: theme.colors.text }]}>
            {expeditionRoute[nodeIndex]?.title}
          </Text>
          <Text style={[styles.currentBody, { color: theme.colors.textMuted }]}>
            Prototype encounter resolution: this node uses the same formation and wagon state. Full event/battle variants will replace this resolver as the mode expands.
          </Text>
          <View style={styles.finishButton}>
            <PrimaryButton
              label={nodeIndex === expeditionRoute.length - 1 ? 'Defeat Boss' : 'Resolve & Continue'}
              onPress={advance}
            />
          </View>
        </GameCard>
      )}

      {rewardedAdMessage ? (
        <Text style={[styles.adMessage, { color: theme.colors.textMuted }]}>{rewardedAdMessage}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 25, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  route: { gap: 7 },
  nodeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nodeMark: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nodeNumber: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  nodeCopy: { flex: 1 },
  nodeType: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  nodeName: { fontSize: 14, fontWeight: '900', marginTop: 2 },
  finishTitle: { fontSize: 18, fontWeight: '900' },
  finishBody: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  finishButton: { marginTop: 12 },
  currentTitle: { fontSize: 17, fontWeight: '900' },
  currentBody: { fontSize: 11, lineHeight: 17, marginTop: 6 },
  adMessage: { fontSize: 10, textAlign: 'center' }
});
