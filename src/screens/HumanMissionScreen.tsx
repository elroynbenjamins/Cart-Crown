import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameProvider';
import { getHumanLateMission } from '../game/humanLateCampaign';
import { useGameTheme } from '../theme/ThemeProvider';
import { DecisionIntro } from '../ui/DecisionUI';
import {
  EventIllustration,
  EventResolution,
  EventRewardPanel
} from '../ui/CampaignEventUI';
import { GameCard } from '../ui/components';
import { humanCampaignArtworkForMission } from '../ui/humanCampaignMissionArt';
import { SemanticChip } from '../ui/SemanticUI';
import {
  CampaignNodeSprite,
  FactionCrest
} from '../ui/gameArt';

export function HumanMissionScreen({
  nodeId,
  onContinue
}: {
  nodeId: string;
  onContinue: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNumber,
    chapterNodes,
    completeHumanLateMission
  } = useGame();
  const mission = getHumanLateMission(nodeId);

  if (!mission || activeFaction !== 'human') {
    return (
      <View style={styles.unavailable}>
        <DecisionIntro
          eyebrow="HUMAN CAMPAIGN"
          title="Mission unavailable"
          body="Return to the Human campaign and open the current mission again."
          accent={theme.colors.textMuted}
        />
      </View>
    );
  }

  const node = chapterNodes.find(
    candidate => candidate.id === nodeId
  );
  const completed = Boolean(node?.completed);
  const canResolve =
    chapterNumber === mission.chapter &&
    Boolean(node?.current);
  const label =
    mission.type === 'choice'
      ? 'Commit choice'
      : mission.type === 'upgrade'
        ? 'Complete upgrade'
        : 'Resolve mission';

  return (
    <EventResolution
      title={mission.name}
      completed={completed}
      canResolve={canResolve}
      label={label}
      continueLabel="Return to Campaign"
      onResolve={() =>
        completeHumanLateMission(nodeId)
      }
      onContinue={onContinue}
    >
      <View style={styles.badges}>
        <FactionCrest faction="human" size={38} />
        <SemanticChip
          label={'Chapter ' + mission.chapter + ' · Mission ' + mission.order}
          tone="blue"
        />
        <SemanticChip
          label={mission.type.toUpperCase()}
          tone={
            mission.type === 'choice'
              ? 'violet'
              : mission.type === 'upgrade'
                ? 'positive'
                : 'neutral'
          }
        />
      </View>

      <DecisionIntro
        eyebrow="HUMAN CAMPAIGN"
        title={mission.name}
        body={mission.briefing}
        accent={theme.colors.human}
      />

      <EventIllustration>
        <View
          style={[
            styles.artFrame,
            {
              borderColor: theme.colors.human + '66',
              backgroundColor: theme.colors.surface2
            }
          ]}
        >
          <Image
            source={humanCampaignArtworkForMission(mission.chapter, mission.order).source}
            resizeMode="cover"
            fadeDuration={0}
            style={styles.art}
          />
          <View
            style={[
              styles.artBadge,
              {
                backgroundColor:
                  theme.dark
                    ? '#05070BDD'
                    : '#FFFFFFE8',
                borderColor:
                  theme.colors.human
              }
            ]}
          >
            <CampaignNodeSprite
              type={mission.type}
              faction="human"
              active
              size={24}
            />
          </View>
        </View>
      </EventIllustration>

      <GameCard
        accent={theme.colors.gold}
        ornament={false}
      >
        <Text
          style={[
            styles.panelEyebrow,
            { color: theme.colors.gold }
          ]}
        >
          MISSION OUTCOME
        </Text>
        <Text
          style={[
            styles.panelTitle,
            { color: theme.colors.text }
          ]}
        >
          {mission.unlockText}
        </Text>
        <Text
          style={[
            styles.panelBody,
            { color: theme.colors.textMuted }
          ]}
        >
          {mission.type === 'choice'
            ? 'This choice changes the immediate tactical emphasis only; it does not permanently lock the alternate doctrine.'
            : mission.type === 'upgrade'
              ? 'This is campaign progression, not a shop purchase. Completing the mission advances the Human campaign.'
              : 'Resolve the current campaign objective to advance to the next mission.'}
        </Text>
      </GameCard>

      <EventRewardPanel
        title="Campaign reward"
        kind="immediate"
        completed={completed}
        values={mission.reward}
        detail="Granted once when this mission is completed."
        note="Rewards go directly to the active Human kingdom. Reopening the report cannot claim them again."
        art={
          <FactionCrest
            faction="human"
            size={44}
          />
        }
      />
    </EventResolution>
  );
}

const styles = StyleSheet.create({
  unavailable: { padding: 12 },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    alignItems: 'center'
  },
  artFrame: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 2,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative'
  },
  art: {
    width: '100%',
    height: '100%'
  },
  artBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  panelEyebrow: {
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: '900',
    letterSpacing: 0.9
  },
  panelTitle: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900'
  },
  panelBody: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16
  }
});
