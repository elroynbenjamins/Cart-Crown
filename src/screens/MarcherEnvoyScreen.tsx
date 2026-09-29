import React, { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionCommit, DecisionIntro, DecisionLayout, DecisionOption, DecisionStats } from '../ui/DecisionUI';
import { EventIllustration } from '../ui/CampaignEventUI';
import { GameCard } from '../ui/components';
import { SemanticChip, SemanticText, UnitBadges } from '../ui/SemanticUI';
import { rolePresentation } from '../ui/semanticColors';
import { StoryScene, UnitSprite } from '../ui/gameArt';

export function MarcherEnvoyScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useGameTheme();
  const { activeFaction, chapterNumber, chapterNodes, units, marcherAuxiliaryOptions, chooseMarcherAuxiliary } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(marcherAuxiliaryOptions[0]?.id ?? null);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const submitted = useRef(false);
  const node = chapterNodes.find(candidate => candidate.id === 'ch3_node_1');
  const ownedChoice = marcherAuxiliaryOptions.find(option => units.some(unit => unit.id === option.unit.id));
  const recorded = Boolean(node?.completed || ownedChoice || acceptedId);
  const recordId = ownedChoice?.id ?? acceptedId;
  const selected = marcherAuxiliaryOptions.find(option => option.id === (recorded ? recordId : selectedId)) ?? null;
  const canChoose = activeFaction === 'human' && chapterNumber === 3 && Boolean(node?.current) && !recorded;

  const confirm = () => {
    if (!selected || !canChoose || submitted.current) return;
    submitted.current = true;
    try {
      if (chooseMarcherAuxiliary(selected.id)) {
        setAcceptedId(selected.id);
        setMessage(selected.unit.name + ' joined the roster.');
        return;
      }
    } catch {
      // A failed provider action must not look like a recruited squad.
    }
    submitted.current = false;
    setMessage('The auxiliary could not be recruited. Check the current campaign event and try again.');
  };

  return (
    <DecisionLayout footer={
      <DecisionCommit
        title={recorded ? selected ? selected.unit.name + ' · ' + selected.unit.className : 'Auxiliary choice recorded' : selected?.unit.className ?? 'Choose an auxiliary'}
        detail={recorded ? 'This event has already supplied its one auxiliary squad.' : 'One auxiliary joins at no resource cost. Selecting a card only previews it.'}
        warning={!recorded ? !canChoose ? 'Reach the Marcher Envoy event before accepting an auxiliary.' : 'Accepting a squad records this event choice; it cannot be swapped for another envoy option.' : null}
        message={message}
        label={recorded ? 'Enter the Border Marches' : selected ? 'Accept ' + selected.unit.className : 'Choose an auxiliary'}
        disabled={!recorded && (!selected || !canChoose)}
        onConfirm={recorded ? onComplete : confirm}
      />
    }>
      <DecisionIntro
        eyebrow="CHAPTER 3 · BORDER KINGDOMS"
        title="Marcher Envoy"
        body="Greenkeep Town draws its first formal visitor from the Border Marches. The envoy warns that the marcher lords are divided and offers one experienced auxiliary squad before you enter their territory."
        accent={theme.colors.gold}
      />
      <GameCard ornament={false}>
        <SemanticChip label={recorded ? 'Auxiliary choice recorded' : 'One squad · recruitment preview'} tone={recorded ? 'positive' : 'blue'} />
        <Text style={[styles.heading, { color: theme.colors.text }]}>A divided frontier</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>Three marcher houses claim they are defending the same roads, yet their soldiers have begun stopping one another at old forts. Crownspire coin appears in every camp.</Text>
      </GameCard>
      {(!recorded ? marcherAuxiliaryOptions : selected ? [selected] : []).map(option => (
        <DecisionOption
          key={option.id}
          title={option.unit.className}
          titleTone={rolePresentation[option.unit.role]?.tone}
          subtitle={option.unit.name + ' · Level ' + option.unit.level + ' · ' + option.archetype}
          selected={selected?.id === option.id}
          disabled={recorded}
          art={<UnitSprite className={option.unit.className} faction={option.unit.faction} size={44} />}
          accessibilitySummary={option.pitch + '. Tradeoff: ' + option.tradeoff + '. Recruitment stats: HP ' + option.unit.hp + ', attack ' + option.unit.attack + ', armor ' + option.unit.armor + ', speed ' + option.unit.speed}
          onSelect={() => {
            if (recorded) return;
            setSelectedId(option.id);
            setMessage(null);
          }}
        >
          <UnitBadges role={option.unit.role} tier={option.unit.tier} battleTags={option.unit.battleTags} />
          <Text style={[styles.body, { color: theme.colors.text }]}><SemanticText tone="positive" style={styles.emphasis}>Strength: </SemanticText>{option.pitch}</Text>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}><SemanticText tone="negative" style={styles.emphasis}>Tradeoff: </SemanticText>{option.tradeoff}</Text>
          {!recorded ? (
            <>
              <Text style={[styles.caption, { color: theme.colors.textMuted }]}>Recruitment stats · before equipment</Text>
              <DecisionStats items={[
                { label: 'HP', value: option.unit.hp },
                { label: 'Attack', value: option.unit.attack },
                { label: 'Armor', value: option.unit.armor },
                { label: 'Speed', value: option.unit.speed }
              ]} />
            </>
          ) : <SemanticChip label="Recruited · view current stats in Army" tone="positive" compact />}
        </DecisionOption>
      ))}
      <EventIllustration><StoryScene scene="marcher_envoy" size={192} /></EventIllustration>
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 16, lineHeight: 22, fontWeight: '900', marginTop: 10 },
  body: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  caption: { fontSize: 12, lineHeight: 18 },
  emphasis: { fontWeight: '900' }
});
