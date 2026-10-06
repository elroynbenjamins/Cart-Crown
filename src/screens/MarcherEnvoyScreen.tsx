import React, { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionCommit, DecisionIntro, DecisionLayout } from '../ui/DecisionUI';
import { EventIllustration } from '../ui/CampaignEventUI';
import { GameCard } from '../ui/components';
import { SemanticChip } from '../ui/SemanticUI';
import { StoryScene } from '../ui/gameArt';

export function MarcherEnvoyScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNumber,
    chapterNodes,
    activeSquadCap,
    completeIntoFrostmarch
  } = useGame();
  const [message, setMessage] = useState<string | null>(null);
  const submitted = useRef(false);
  const node = chapterNodes.find(candidate => candidate.id === 'ch3_node_1');
  const recorded = Boolean(node?.completed);
  const canResolve =
    activeFaction === 'human' &&
    chapterNumber === 3 &&
    Boolean(node?.current) &&
    !recorded;

  const confirm = () => {
    if (!canResolve || submitted.current) return;
    submitted.current = true;
    try {
      if (completeIntoFrostmarch()) {
        setMessage('Frostmarch entered. The next battle will test whether three squads can cover a much wider line.');
        return;
      }
    } catch {
      // Rejected provider progress stays retryable.
    }
    submitted.current = false;
    setMessage('Frostmarch could not be entered from the current campaign state.');
  };

  return (
    <DecisionLayout
      footer={
        <DecisionCommit
          title={recorded ? 'Frostmarch entered' : 'Into Frostmarch'}
          detail={
            recorded
              ? 'The regional introduction is recorded. No squad or resource reward can be claimed again here.'
              : 'This is a story progression beat. It does not recruit a free squad or increase deployment capacity.'
          }
          warning={!recorded && !canResolve ? 'Reach Into Frostmarch in Chapter 3 first.' : null}
          message={message}
          label={recorded ? 'Continue to A Wider Front' : 'Enter Frostmarch'}
          disabled={!recorded && !canResolve}
          onConfirm={recorded ? onComplete : confirm}
        />
      }
    >
      <DecisionIntro
        eyebrow="CHAPTER 3 · FROSTMARCH"
        title="Into Frostmarch"
        body="Greenkeep crosses into a harsher region with the same three active squads that survived Chapter 2. Frostmarch opens with wider roads, disciplined defenders and stronger equipment, but no new system is handed to the player yet."
        accent={theme.colors.gold}
      />
      <GameCard ornament={false}>
        <SemanticChip
          label={recorded ? 'Region entered' : 'Story progression · no free recruit'}
          tone={recorded ? 'positive' : 'blue'}
        />
        <Text style={[styles.heading, { color: theme.colors.text }]}>Feel the limitation first</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          Active deployment remains at {activeSquadCap} squads until A Wider Front is cleared. The next encounter is intentionally broad enough to make that limitation visible before the fourth slot is unlocked.
        </Text>
      </GameCard>
      <EventIllustration>
        <StoryScene scene="marcher_envoy" size={192} />
      </EventIllustration>
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 16, lineHeight: 22, fontWeight: '900', marginTop: 10 },
  body: { fontSize: 14, lineHeight: 20, marginTop: 6 }
});
