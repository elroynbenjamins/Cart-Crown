import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { factions } from '../game/factions';
import { useGameTheme } from '../theme/ThemeProvider';
import { SecondaryButton } from '../ui/components';
import { DecisionCommit, DecisionIntro, DecisionLayout, DecisionOption, DecisionStats } from '../ui/DecisionUI';
import { EffectChip, EmphasisText, RoleChip, SemanticChip } from '../ui/SemanticUI';
import { CommanderPortrait } from '../ui/gameArt';

export function CommanderChoiceScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useGameTheme();
  const { activeFaction, chapterNumber, chapterNodes, resources, commanderPaths, commanderPathId, commanderRespecCost, chooseCommanderPath } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(commanderPathId ?? commanderPaths[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const submittedId = useRef<string | null>(null);
  const selected = commanderPaths.find(path => path.id === selectedId) ?? null;
  const faction = factions[activeFaction];
  const accent = activeFaction === 'elf' ? theme.colors.elf : activeFaction === 'orc' ? theme.colors.orc : theme.colors.human;
  const isCurrent = Boolean(selected && selected.id === commanderPathId);
  const isRespec = Boolean(commanderPathId && !isCurrent);
  const chapterFourDoctrineMission =
    activeFaction === 'human' &&
    chapterNumber === 4 &&
    Boolean(chapterNodes.find(node => node.id === 'ch4_node_3')?.current);
  const effectiveRespecCost = chapterFourDoctrineMission ? 0 : commanderRespecCost;
  const canAfford = !isRespec || resources.gold >= effectiveRespecCost;

  const confirm = () => {
    if (!selected || isCurrent || !canAfford || submittedId.current === selected.id) return;
    submittedId.current = selected.id;
    if (chooseCommanderPath(selected.id)) {
      setMessage(selected.name + ' is now your commander specialization.');
    } else {
      submittedId.current = null;
      setMessage('The commander path could not be changed. Check the unlock requirements and Gold balance.');
    }
  };

  return (
    <DecisionLayout
      footer={
        <DecisionCommit
          title={selected?.name ?? 'Choose a command path'}
          detail={isCurrent
            ? chapterFourDoctrineMission
              ? 'Current doctrine. Choose another path for this campaign decision, or keep the existing one.'
              : 'Current specialization. Returning to Army costs no Gold.'
            : isRespec
              ? chapterFourDoctrineMission
                ? 'Two Ways to War allows one free doctrine reassignment before the next battle.'
                : 'Retraining costs ' + effectiveRespecCost + ' Gold. Balance: ' + resources.gold + ' Gold.'
              : 'Your first specialization is free.'}
          warning={!canAfford ? 'Need ' + Math.max(0, effectiveRespecCost - resources.gold) + ' more Gold to retrain.' : null}
          message={message}
          label={isCurrent
            ? chapterFourDoctrineMission ? 'Keep ' + selected!.name : 'Return to Army'
            : isRespec
              ? chapterFourDoctrineMission ? 'Choose ' + selected!.name + ' · Free' : 'Retrain · ' + effectiveRespecCost + ' Gold'
              : selected ? 'Become ' + selected.name : 'Choose a path'}
          disabled={!selected || !canAfford}
          onConfirm={isCurrent ? onComplete : confirm}
        >
          {commanderPathId && !isCurrent ? <SecondaryButton label={chapterFourDoctrineMission ? 'Keep current doctrine' : 'Keep current specialization'} onPress={onComplete} /> : null}
        </DecisionCommit>
      }
    >
      <DecisionIntro
        eyebrow={chapterFourDoctrineMission ? 'CHAPTER 4 · TWO WAYS TO WAR' : faction.name.toUpperCase() + ' COMMAND'}
        title={chapterFourDoctrineMission ? 'Choose how this army will fight' : 'Choose your command style'}
        body={chapterFourDoctrineMission
          ? 'Greywatch demands a deliberate doctrine choice. Compare the available command styles; switching during this mission is free, and the next battle will make the behavioral difference visible.'
          : 'Compare favored roles, passive bonuses and the automatic command skill. Selecting a card does not spend Gold.'}
        accent={accent}
      />
      {commanderPaths.map(path => {
        const current = path.id === commanderPathId;
        const subtitle = path.title + (current ? ' · Current' : '');
        return (
          <DecisionOption
            key={path.id}
            title={path.name}
            subtitle={subtitle}
            selected={path.id === selectedId}
            art={<CommanderPortrait pathId={path.id} faction={path.faction} size={48} />}
            accessibilitySummary={'Favored roles: ' + path.favoredRoles.join(', ') + '. ' + path.passiveDescription + '. Skill: ' + path.skill.name + '. ' + path.skill.description}
            onSelect={() => {
              if (selectedId !== path.id) submittedId.current = null;
              setSelectedId(path.id);
              setMessage(null);
            }}
          >
            {current ? <SemanticChip label="Current specialization" tone="positive" /> : null}
            <Text style={[styles.roles, { color: theme.colors.textMuted }]}>Favored roles</Text>
            <View style={styles.badges}>{path.favoredRoles.map(role => <RoleChip key={role} role={role} />)}</View>
            <Text style={[styles.label, { color: theme.colors.text }]}>{path.passiveName}</Text>
            <EmphasisText text={path.passiveDescription} style={[styles.body, { color: theme.colors.textMuted }]} />
            <DecisionStats presentation="multiplier" items={[
              { label: 'Attack', value: '×' + path.attackMultiplier.toFixed(2) },
              { label: 'Armor', value: '×' + path.armorMultiplier.toFixed(2) },
              { label: 'Speed', value: '×' + path.speedMultiplier.toFixed(2) }
            ]} />
            <View style={[styles.skill, { backgroundColor: theme.colors.surface2 }]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{path.skill.name}</Text>
              <EffectChip effect={path.skill.effectType} />
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>{path.skill.description}</Text>
            </View>
          </DecisionOption>
        );
      })}
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 13, lineHeight: 19 },
  roles: { fontSize: 12, lineHeight: 18, fontWeight: '800' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '900' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skill: { padding: 12, borderRadius: 12, gap: 5 }
});
