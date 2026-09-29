import React, { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionCommit, DecisionIntro, DecisionLayout, DecisionOption, DecisionStats } from '../ui/DecisionUI';
import { UnitSprite } from '../ui/gameArt';

export function RecruitmentScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useGameTheme();
  const { recruitOptions, chooseRecruit } = useGame();
  const [selectedId, setSelectedId] = useState(recruitOptions[0]?.id ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const committed = useRef(false);
  const selected = recruitOptions.find(option => option.id === selectedId);

  const confirm = () => {
    if (!selected || committed.current) return;
    committed.current = true;
    if (chooseRecruit(selected.id)) {
      onComplete();
    } else {
      committed.current = false;
      setMessage('This recruit could not be added. Check the current recruitment requirements.');
    }
  };

  return (
    <DecisionLayout
      footer={
        <DecisionCommit
          title={selected ? selected.unit.className : 'Choose a squad'}
          detail={selected ? selected.unit.name + ' · ' + selected.archetype : 'Select a card to review the squad.'}
          label={selected ? 'Recruit ' + selected.unit.className : 'Choose a recruit'}
          disabled={!selected}
          message={message}
          onConfirm={confirm}
        />
      }
    >
      <DecisionIntro
        eyebrow="FIRST REINFORCEMENTS"
        title="Choose your third squad"
        body="Compare each squad's strengths and tradeoff. Selecting a card does not recruit it."
        accent={theme.colors.human}
      />
      {recruitOptions.map(option => (
        <DecisionOption
          key={option.id}
          title={option.unit.className}
          subtitle={option.unit.name + ' · ' + option.archetype}
          selected={option.id === selectedId}
          art={<UnitSprite className={option.unit.className} faction={option.unit.faction} size={44} />}
          accessibilitySummary={option.pitch + '. Tradeoff: ' + option.tradeoff + '. HP ' + option.unit.hp + ', attack ' + option.unit.attack + ', armor ' + option.unit.armor + ', speed ' + option.unit.speed}
          onSelect={() => {
            setSelectedId(option.id);
            setMessage(null);
          }}
        >
          <Text style={[styles.body, { color: theme.colors.text }]}>{option.pitch}</Text>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>Tradeoff: {option.tradeoff}</Text>
          <DecisionStats items={[
            { label: 'HP', value: option.unit.hp },
            { label: 'Attack', value: option.unit.attack },
            { label: 'Armor', value: option.unit.armor },
            { label: 'Speed', value: option.unit.speed }
          ]} />
        </DecisionOption>
      ))}
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 13, lineHeight: 19 }
});
