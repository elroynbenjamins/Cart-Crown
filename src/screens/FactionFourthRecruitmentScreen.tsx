import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, PrimaryButton, UnitPortrait } from '../ui/components';
import { ClassLoadoutPreview } from '../ui/gameArt';

export function FactionFourthRecruitmentScreen({
  onComplete
}: {
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    factionFourthRecruitOptions,
    fourthRecruitChosen,
    chooseFactionFourthRecruit
  } = useGame();

  const [selectedId, setSelectedId] = useState(
    factionFourthRecruitOptions[0]?.id ?? ''
  );
  const [message, setMessage] = useState<string | null>(null);

  const faction = factions[activeFaction];
  const accent =
    activeFaction === 'elf' ? theme.colors.elf : theme.colors.orc;
  const selected =
    factionFourthRecruitOptions.find(option => option.id === selectedId) ?? null;

  const confirm = () => {
    if (!selected) return;
    if (chooseFactionFourthRecruit(selected.id)) {
      setMessage(selected.unit.className + ' joined the army.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={accent}>
        <Text style={[styles.eyebrow, { color: accent }]}>
          {activeFaction === 'elf' ? 'MOONLIT PASS MUSTER' : 'STONEJAW MUSTER'}
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Choose your fourth squad
        </Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          The {activeFaction === 'elf' ? 'Wardhold' : 'Warhold'} can now support four active squads. Choose a specialist that complements {faction.mechanicName}.
        </Text>
      </GameCard>

      <View style={styles.list}>
        {factionFourthRecruitOptions.map(option => {
          const selectedOption = selectedId === option.id;
          return (
            <View
              key={option.id}
              onTouchEnd={() => {
                if (!fourthRecruitChosen) setSelectedId(option.id);
              }}
            >
              <GameCard accent={selectedOption ? theme.colors.gold : undefined}>
                <View style={styles.header}>
                  <UnitPortrait
                    name={option.unit.name}
                    className={option.unit.className + ' · Lv. ' + option.unit.level}
                    accent={selectedOption ? theme.colors.gold : accent}
                    faction={option.unit.faction}
                  />
                  <Pill label={option.archetype.toUpperCase()} />
                </View>
                <View style={styles.loadoutPreview}>
                  <ClassLoadoutPreview
                    className={option.unit.className}
                    faction={option.unit.faction}
                    size={30}
                  />
                </View>
                <Text style={[styles.pitch, { color: theme.colors.text }]}>
                  {option.pitch}
                </Text>
                <Text style={[styles.tradeoff, { color: theme.colors.textMuted }]}>
                  Tradeoff: {option.tradeoff}
                </Text>
              </GameCard>
            </View>
          );
        })}
      </View>

      {message ? (
        <Text style={[styles.message, { color: theme.colors.primary }]}>{message}</Text>
      ) : null}

      {fourthRecruitChosen ? (
        <PrimaryButton
          label={activeFaction === 'elf' ? 'Enter Moonlit Pass' : 'Begin the Stonejaw Trial'}
          onPress={onComplete}
        />
      ) : (
        <PrimaryButton
          label={selected ? 'Recruit ' + selected.unit.className : 'Choose squad'}
          disabled={!selected}
          onPress={confirm}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  list: { gap: 9 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadoutPreview: { marginTop: 9 },
  pitch: { fontSize: 11.5, lineHeight: 17, fontWeight: '800', marginTop: 9 },
  tradeoff: { fontSize: 10.5, lineHeight: 15, marginTop: 5 },
  message: { textAlign: 'center', fontSize: 10.5, fontWeight: '800' }
});
