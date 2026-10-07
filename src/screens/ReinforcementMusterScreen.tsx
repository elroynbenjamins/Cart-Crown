import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, SecondaryButton } from '../ui/components';
import { DecisionCommit, DecisionIntro, DecisionLayout, DecisionOption, DecisionStats } from '../ui/DecisionUI';
import { ClassLoadoutPreview, FactionCrest, UnitSprite } from '../ui/gameArt';
import { SemanticChip, SemanticText, UnitBadges } from '../ui/SemanticUI';
import { rolePresentation } from '../ui/semanticColors';
import { getReinforcementMusterView } from '../ui/reinforcementMusterPresentation';
import type { ReinforcementMusterKind } from '../ui/reinforcementMusterPresentation';

export function ReinforcementMusterScreen({ kind, onComplete }: {
  kind: ReinforcementMusterKind;
  onComplete: () => void;
}) {
  const game = useGame();
  const { theme } = useGameTheme();
  const view = getReinforcementMusterView(kind, game);
  const identity = game.activeFaction + ':' + kind + ':' + game.chapterNumber;
  const [draft, setDraft] = useState<{ identity: string; id: string } | null>(null);
  const [receipt, setReceipt] = useState<{ identity: string; id: string } | null>(null);
  const [feedback, setFeedback] = useState<{ identity: string; text: string } | null>(null);
  const submitted = useRef<string | null>(null);
  const selected = view?.options.find(option => option.id === (draft?.identity === identity ? draft.id : view.options[0]?.id)) ?? null;
  const locallyRecorded = receipt?.identity === identity;
  const recorded = Boolean(view?.recorded || locallyRecorded);
  const latest = useRef({ identity, view, game, selectedId: selected?.id, recorded, onComplete });
  latest.current = { identity, view, game, selectedId: selected?.id, recorded, onComplete };
  const accent = game.activeFaction === 'elf' ? theme.colors.elf : game.activeFaction === 'orc' ? theme.colors.orc : theme.colors.human;

  const confirm = () => {
    const current = latest.current;
    if (!selected || current.identity !== identity || current.selectedId !== selected.id ||
      current.recorded || !current.view?.canChoose || submitted.current === identity) return;
    const option = current.view.options.find(candidate => candidate.id === selected.id);
    if (!option || option.unit.faction !== current.game.activeFaction) return;
    submitted.current = identity;
    try {
      const ok = kind === 'fort' ? current.game.chooseFortRecruit(option.id)
        : kind === 'stronghold' ? current.game.chooseStrongholdRecruit(option.id)
          : kind === 'faction_third' ? current.game.chooseRecruit(option.id)
            : kind === 'faction_fourth' ? current.game.chooseFactionFourthRecruit(option.id)
              : current.game.chooseFactionFifthRecruit(option.id);
      if (ok) {
        setReceipt({ identity, id: option.id });
        setFeedback({ identity, text: option.unit.className + ' recruited. Review its actual deployment below.' });
        return;
      }
    } catch {
      // A rejected or failed provider action must stay retryable, not look like a successful claim.
    }
    submitted.current = null;
    setFeedback({ identity, text: 'Recruitment was not completed. Check the current campaign requirements, then try again.' });
  };
  const leave = () => {
    if (latest.current.identity === identity) latest.current.onComplete();
  };

  if (!view) return (
    <DecisionLayout footer={<DecisionCommit title="Muster unavailable" detail="This recruitment belongs to another faction." label="Return" onConfirm={leave} />}>
      <DecisionIntro eyebrow="CAMPAIGN REINFORCEMENTS" title="Muster unavailable" body="Return to your current campaign to review its reinforcements." accent={accent} />
    </DecisionLayout>
  );

  // Current roster identity takes precedence over the local preview. Never infer a historical
  // choice from the first card, an ambiguous roster or a promoted class name.
  const acceptedOption = locallyRecorded ? view.options.find(option => option.id === receipt.id) : null;
  const rosterUnit = view.recorded ? view.rosterUnit : acceptedOption
    ? game.units.find(unit => unit.id === acceptedOption.unit.id && unit.faction === view.faction) ?? null
    : null;
  const fielded = Boolean(rosterUnit && game.formation.includes(rosterUnit.id));
  const canChoose = view.canChoose && !recorded;

  return (
    <DecisionLayout footer={
      <DecisionCommit
        title={recorded ? 'Reinforcement recorded' : selected?.unit.className ?? view.title}
        detail={recorded ? 'This campaign choice cannot be replaced or claimed again here.' : 'No resource cost. Select a card to compare; confirm to recruit one squad.'}
        warning={!recorded ? !canChoose ? view.requirement : 'This is a one-time campaign choice, not a repeatable training purchase.' : null}
        message={feedback?.identity === identity ? feedback.text : null}
        label={recorded ? view.continueLabel : selected ? 'Recruit ' + selected.unit.className : 'No squad available'}
        disabled={!recorded && (!canChoose || !selected)}
        onConfirm={recorded ? leave : confirm}
      >
        {!recorded ? <SecondaryButton label="Return without recruiting" onPress={leave} /> : null}
      </DecisionCommit>
    }>
      <View style={styles.badges}>
        <FactionCrest faction={view.faction} size={36} />
        <SemanticChip label="Campaign reinforcements" tone="positive" />
        <SemanticChip label={recorded ? 'Choice recorded' : canChoose ? 'Current muster · preview' : 'Muster locked'} tone={recorded ? 'positive' : canChoose ? 'blue' : 'neutral'} />
      </View>
      <DecisionIntro
        eyebrow={view.faction.toUpperCase() + ' · CHAPTER ' + view.chapter}
        title={view.title}
        body={recorded ? 'Your reinforcement choice is recorded. Reopening this report does not recruit another squad.' : 'Compare the available squads, their strengths and tradeoffs before making a permanent campaign choice.'}
        accent={accent}
      />
      <GameCard ornament={false}>
        <View style={styles.badges}>
          <SemanticChip label="No resource cost" tone="neutral" compact />
          <SemanticChip label={'Deployment limit · ' + game.activeSquadCap} tone="cyan" compact />
        </View>
        <Text style={[styles.note, { color: theme.colors.textMuted }]}>Recruitment adds one roster squad, not more deployment capacity. A suitable open position may be filled by the existing recruitment rules; otherwise the squad remains in reserve.</Text>
      </GameCard>

      {recorded ? (
        <GameCard ornament={false}>
          {rosterUnit ? (
            <>
              <View style={styles.unitHeader}>
                <UnitSprite className={rosterUnit.className} faction={rosterUnit.faction} size={48} />
                <View style={styles.copy}>
                  <SemanticText tone={rolePresentation[rosterUnit.role]?.tone ?? 'neutral'} style={styles.heading}>{rosterUnit.name} · {rosterUnit.className}</SemanticText>
                  <View style={styles.spaced}><UnitBadges role={rosterUnit.role} tier={rosterUnit.tier} battleTags={rosterUnit.battleTags} /></View>
                </View>
              </View>
              <View style={styles.spaced}><SemanticChip label={fielded ? 'Fielded' : 'In reserve'} tone={fielded ? 'cyan' : 'neutral'} /></View>
              <Text style={[styles.note, { color: theme.colors.textMuted }]}>This is the current roster class. Review current stats and assigned equipment in Army; the original recruitment numbers are not shown as live values.</Text>
            </>
          ) : <Text style={[styles.body, { color: theme.colors.textMuted }]}>{view.recorded ? view.recordedDetail : 'Recruitment was accepted. Roster details will update with the campaign state.'}</Text>}
        </GameCard>
      ) : view.options.map(option => {
        const highlighted = selected?.id === option.id;
        return (
          <DecisionOption
            key={option.id}
            title={option.unit.className}
            titleTone={rolePresentation[option.unit.role]?.tone ?? 'neutral'}
            subtitle={option.unit.name + ' · ' + option.archetype}
            selected={highlighted}
            disabled={!canChoose}
            art={<UnitSprite className={option.unit.className} faction={option.unit.faction} size={44} />}
            accessibilitySummary={'Preview, not recruited. ' + option.pitch + '. Tradeoff: ' + option.tradeoff + '. Level ' + option.unit.level + ', HP ' + option.unit.hp + ', attack ' + option.unit.attack + ', armor ' + option.unit.armor + ', speed ' + option.unit.speed}
            onSelect={() => {
              if (latest.current.identity !== identity || latest.current.recorded || !latest.current.view?.canChoose) return;
              setDraft({ identity, id: option.id });
              setFeedback(null);
            }}
          >
            <UnitBadges role={option.unit.role} tier={option.unit.tier} battleTags={option.unit.battleTags} />
            <SemanticChip label={highlighted ? 'Selected preview · not recruited' : 'Alternative · not recruited'} tone={highlighted ? 'blue' : 'neutral'} compact />
            <Text style={[styles.body, { color: theme.colors.text }]}>{option.pitch}</Text>
            <SemanticChip label="Tradeoff" tone="warning" compact />
            <Text style={[styles.body, { color: theme.colors.textMuted }]}>{option.tradeoff}</Text>
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>Recruitment stats before later equipment or training.</Text>
            <DecisionStats presentation="absolute" items={[
              { label: 'Level', value: option.unit.level },
              { label: 'HP', value: option.unit.hp },
              { label: 'Attack', value: option.unit.attack },
              { label: 'Armor', value: option.unit.armor },
              { label: 'Speed', value: option.unit.speed }
            ]} />
            {view.showClassIllustration && highlighted ? (
              <View style={styles.spaced}>
                <ClassLoadoutPreview className={option.unit.className} faction={option.unit.faction} size={30} />
                <Text style={[styles.note, { color: theme.colors.textMuted }]}>Class illustration, not an additional equipment grant.</Text>
              </View>
            ) : null}
          </DecisionOption>
        );
      })}
    </DecisionLayout>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5 },
  body: { fontSize: 11.5, lineHeight: 16 },
  note: { fontSize: 10.5, lineHeight: 15, marginTop: 6 },
  heading: { fontSize: 14.5, lineHeight: 19, fontWeight: '900' },
  unitHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  copy: { flex: 1, minWidth: 0 },
  spaced: { marginTop: 6 }
});
