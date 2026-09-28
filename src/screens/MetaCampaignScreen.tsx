import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { getAllianceNames, getMetaCampaignStep } from '../game/metaCampaign';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, SectionTitle } from '../ui/components';

export function MetaCampaignScreen({
  onStartConvergence,
  onStartTriumvirate,
  onStartFinalBoss,
  onExit
}: {
  onStartConvergence: () => void;
  onStartTriumvirate: () => void;
  onStartFinalBoss: () => void;
  onExit: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    completedCampaigns,
    metaCampaignStep,
    metaCampaignComplete,
    completeMetaCouncil,
    completeMetaConcordChamber
  } = useGame();

  const lead = factions[activeFaction];
  const allies = getAllianceNames(activeFaction);
  const step = getMetaCampaignStep(metaCampaignStep);
  const accent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const sealRows = [
    {
      name: 'Oath Seal',
      faction: 'Humans',
      ready: completedCampaigns.includes('human')
    },
    {
      name: 'Root Seal',
      faction: 'Elves',
      ready: completedCampaigns.includes('elf')
    },
    {
      name: 'Clan Seal',
      faction: 'Orcs',
      ready: completedCampaigns.includes('orc')
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.gold}>
        <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>SHARED ENDGAME</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Three Seals</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          {metaCampaignComplete
            ? 'The Concord Beacon has been restored under all three Seals.'
            : 'Choose one completed faction as the lead army. The other two arrive as allied NPC armies and reinforce every meta-campaign battle.'}
        </Text>
      </GameCard>

      <GameCard accent={accent}>
        <View style={styles.leadRow}>
          <View style={styles.copy}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>LEAD ARMY</Text>
            <Text style={[styles.leadName, { color: theme.colors.text }]}>{lead.name}</Text>
            <Text style={[styles.leadBody, { color: theme.colors.textMuted }]}>
              Allies: {allies.join(' + ')} · +10% alliance attack · +8% alliance armor
            </Text>
          </View>
          <Pill label="CURRENT" />
        </View>
        <Text style={[styles.switchHint, { color: theme.colors.textMuted }]}>
          To lead with another completed faction, exit and switch factions first.
        </Text>
      </GameCard>

      <SectionTitle title="The Three Seals" trailing="3 required" />
      <View style={styles.sealList}>
        {sealRows.map(row => (
          <GameCard key={row.name}>
            <View style={styles.sealRow}>
              <View style={styles.copy}>
                <Text style={[styles.sealName, { color: theme.colors.text }]}>{row.name}</Text>
                <Text style={[styles.sealFaction, { color: theme.colors.textMuted }]}>{row.faction}</Text>
              </View>
              <Pill label={row.ready ? 'RECOVERED' : 'MISSING'} />
            </View>
          </GameCard>
        ))}
      </View>

      <SectionTitle title="Current objective" trailing={'Step ' + Math.min(5, metaCampaignStep + 1) + ' / 5'} />
      <GameCard accent={metaCampaignComplete ? theme.colors.primary : theme.colors.gold}>
        <Text style={[styles.stepName, { color: theme.colors.text }]}>{step.name}</Text>
        <Text style={[styles.stepBody, { color: theme.colors.textMuted }]}>{step.description}</Text>

        <View style={styles.button}>
          {metaCampaignComplete ? (
            <PrimaryButton label="Return to Campaigns" onPress={onExit} />
          ) : metaCampaignStep === 0 ? (
            <PrimaryButton label="Assemble the Three Seals Council" onPress={() => completeMetaCouncil()} />
          ) : metaCampaignStep === 1 ? (
            <PrimaryButton label="Fight the Converging Roads" onPress={onStartConvergence} />
          ) : metaCampaignStep === 2 ? (
            <PrimaryButton label="Restore the Seals to the Concord Chamber" onPress={() => completeMetaConcordChamber()} />
          ) : metaCampaignStep === 3 ? (
            <PrimaryButton label="Challenge the Ashen Triumvirate" onPress={onStartTriumvirate} />
          ) : (
            <PrimaryButton label="Stabilize the Unbound Beacon" onPress={onStartFinalBoss} />
          )}
        </View>
      </GameCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 13 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 29, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  leadRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  copy: { flex: 1 },
  label: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1 },
  leadName: { fontSize: 18, fontWeight: '900', marginTop: 3 },
  leadBody: { fontSize: 10.5, lineHeight: 16, marginTop: 4 },
  switchHint: { fontSize: 9.5, lineHeight: 14, marginTop: 9 },
  sealList: { gap: 8 },
  sealRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sealName: { fontSize: 14, fontWeight: '900' },
  sealFaction: { fontSize: 9.5, marginTop: 2 },
  stepName: { fontSize: 18, fontWeight: '900' },
  stepBody: { fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  button: { marginTop: 12 }
});
