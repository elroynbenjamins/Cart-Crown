import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  chapterTwoTerritoryRoutes
} from '../game/chapter2Campaign';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  PrimaryButton,
  SectionTitle,
  StatusPill
} from '../ui/components';
import {
  BuildingSprite,
  CampaignNodeSprite,
  UnitSprite
} from '../ui/gameArt';

export type HumanChapterTwoEventId =
  | 'three_roads'
  | 'horse_rider'
  | 'long_haul'
  | 'those_remain'
  | 'build_outpost';

const nodeByEvent: Record<HumanChapterTwoEventId, string> = {
  three_roads: 'ch2_node_3',
  horse_rider: 'ch2_node_4',
  long_haul: 'ch2_node_6',
  those_remain: 'ch2_node_7',
  build_outpost: 'ch2_node_9'
};

export function HumanChapterTwoEventScreen({
  eventId,
  onComplete
}: {
  eventId: HumanChapterTwoEventId;
  onComplete: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    chapterNodes,
    chapterTwoRouteId,
    currentWagonStage,
    buildingLevels,
    equipmentInventory,
    resources,
    chooseChapterTwoRoute,
    completeChapterTwoHorseAndRider,
    completeChapterTwoLongHaul,
    completeChapterTwoDiplomacy,
    completeChapterTwoOutpost
  } = useGame();

  const completed = Boolean(
    chapterNodes.find(node => node.id === nodeByEvent[eventId])?.completed
  );
  const stableBuilt = (buildingLevels.stable ?? 0) >= 1;
  const firstHorseReady = equipmentInventory.includes('hum_trained_horse');
  const canAffordOutpost =
    resources.gold >= 90 &&
    resources.wood >= 60 &&
    resources.stone >= 25 &&
    resources.iron >= 8;

  const title =
    eventId === 'three_roads'
      ? 'Three Roads'
      : eventId === 'horse_rider'
        ? 'Horse and Rider'
        : eventId === 'long_haul'
          ? 'The Long Haul'
          : eventId === 'those_remain'
            ? 'Those Who Remain'
            : 'Build Something Worth Defending';

  const body =
    eventId === 'three_roads'
      ? 'Greenkeep cannot secure every approach at once. Choose which road receives protection and investment first. The other routes remain available later.'
      : eventId === 'horse_rider'
        ? 'A trained mount changes what an experienced Scout can become. Build a Stable, claim the first campaign horse, then equip it to a Scout to open the Scout Rider branch.'
        : eventId === 'long_haul'
          ? 'The Pack Gear can no longer support repeated patrols. Survivors rebuild an abandoned cart so supplies, medicine and spare equipment can travel with the army.'
          : eventId === 'those_remain'
            ? 'A neighboring community will join Greenkeep’s defense, but the terms determine what kind of support squad answers the banner.'
            : 'With the watch secured, Greenkeep can finally replace the exposed permanent camp with a defensible Outpost.';

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GameCard accent={theme.colors.human}>
        <Text style={[styles.eyebrow, { color: theme.colors.human }]}>
          CHAPTER 2 · CLAIM THE ROAD
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>
          {body}
        </Text>
      </GameCard>

      {eventId === 'three_roads' ? (
        <>
          <SectionTitle title="Choose the first priority" />
          {chapterTwoTerritoryRoutes.map(route => {
            const selected = chapterTwoRouteId === route.id;
            return (
              <GameCard
                key={route.id}
                accent={selected ? theme.colors.gold : undefined}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.flex}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                      {route.names.human}
                    </Text>
                    <Text style={[styles.cardBody, { color: theme.colors.textMuted }]}>
                      {route.summary}
                    </Text>
                  </View>
                  <StatusPill
                    label={route.benefit.toUpperCase()}
                    tone={selected ? 'done' : 'available'}
                  />
                </View>
                {!chapterTwoRouteId ? (
                  <View style={styles.action}>
                    <PrimaryButton
                      label={'Secure ' + route.names.human}
                      onPress={() => chooseChapterTwoRoute(route.id)}
                    />
                  </View>
                ) : null}
              </GameCard>
            );
          })}
        </>
      ) : null}

      {eventId === 'horse_rider' ? (
        <>
          <SectionTitle title="Mounted progression" />
          <GameCard>
            <View style={styles.visualRow}>
              <BuildingSprite
                buildingId="stable"
                faction="human"
                size={50}
              />
              <View style={styles.flex}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Stable required
                </Text>
                <Text style={[styles.cardBody, { color: theme.colors.textMuted }]}>
                  {stableBuilt
                    ? 'Stable ready. Claim the first Trained Horse below.'
                    : 'Construct Stable Lv.1 in Settlement View before this story step can finish.'}
                </Text>
              </View>
            </View>
          </GameCard>
          <GameCard accent={firstHorseReady ? theme.colors.gold : undefined}>
            <View style={styles.visualRow}>
              <UnitSprite className="Scout Rider" faction="human" size={48} />
              <View style={styles.flex}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Scout + Trained Horse
                </Text>
                <Text style={[styles.cardBody, { color: theme.colors.textMuted }]}>
                  The story grants the mount. Equipping it to a Scout opens Scout Rider; later weapons branch that rider into Cavalryman, Lancer or Mounted Archer.
                </Text>
              </View>
            </View>
          </GameCard>
          {!completed ? (
            <PrimaryButton
              label={stableBuilt ? 'Claim the Trained Horse' : 'Build a Stable first'}
              disabled={!stableBuilt}
              onPress={() => completeChapterTwoHorseAndRider()}
            />
          ) : null}
        </>
      ) : null}

      {eventId === 'long_haul' ? (
        <>
          <SectionTitle title="Logistics upgrade" />
          <GameCard>
            <View style={styles.visualRow}>
              <CampaignNodeSprite type="supply" faction="human" active size={46} />
              <View style={styles.flex}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Pack Gear → Handcart
                </Text>
                <Text style={[styles.cardBody, { color: theme.colors.textMuted }]}>
                  The campaign now recognizes the Handcart milestone. It represents the first real supply train rather than another combat upgrade.
                </Text>
              </View>
            </View>
          </GameCard>
          {!completed ? (
            <PrimaryButton
              label="Finish the Handcart"
              onPress={() => completeChapterTwoLongHaul()}
            />
          ) : null}
        </>
      ) : null}

      {eventId === 'those_remain' ? (
        <>
          <SectionTitle title="Set the terms" />
          {[
            {
              id: 'protect' as const,
              title: 'Protect Them',
              unit: 'Banner Sergeant',
              text: 'Spend the effort protecting the community directly. Gains the strongest supply relationship and a balanced support squad.'
            },
            {
              id: 'contract' as const,
              title: 'Protection Contract',
              unit: 'Road Warden',
              text: 'Make the arrangement transactional. Gains immediate Gold and a faster support/skirmish hybrid.'
            },
            {
              id: 'allegiance' as const,
              title: 'Demand Allegiance',
              unit: 'Veteran Standard',
              text: 'Bring the community under Greenkeep’s authority. Gains the most durable support squad but fewer immediate supplies.'
            }
          ].map(choice => (
            <GameCard key={choice.id}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {choice.title}
              </Text>
              <Text style={[styles.unitLabel, { color: theme.colors.human }]}>
                {choice.unit}
              </Text>
              <Text style={[styles.cardBody, { color: theme.colors.textMuted }]}>
                {choice.text}
              </Text>
              {!completed ? (
                <View style={styles.action}>
                  <PrimaryButton
                    label={choice.title}
                    onPress={() => completeChapterTwoDiplomacy(choice.id)}
                  />
                </View>
              ) : null}
            </GameCard>
          ))}
        </>
      ) : null}

      {eventId === 'build_outpost' ? (
        <>
          <SectionTitle title="Outpost project" />
          <GameCard accent={theme.colors.gold}>
            <View style={styles.visualRow}>
              <BuildingSprite
                buildingId="hall"
                faction="human"
                size={52}
              />
              <View style={styles.flex}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  Permanent Camp → Outpost
                </Text>
                <Text style={[styles.cardBody, { color: theme.colors.textMuted }]}>
                  Cost: 90 Gold · 60 Wood · 25 Stone · 8 Iron. The Outpost supports the seven-squad Chapter 2 end state and opens the final boss.
                </Text>
              </View>
            </View>
          </GameCard>
          {!completed && currentWagonStage.id !== 'fort' ? (
            <PrimaryButton
              label={canAffordOutpost ? 'Build the Outpost' : 'More resources required'}
              disabled={!canAffordOutpost}
              onPress={() => completeChapterTwoOutpost()}
            />
          ) : null}
        </>
      ) : null}

      {completed ? (
        <PrimaryButton label="Continue Campaign" onPress={onComplete} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 13 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.15 },
  title: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  body: { fontSize: 12.5, lineHeight: 19, marginTop: 6 },
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  visualRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  flex: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '900' },
  cardBody: { fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  unitLabel: { fontSize: 10, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },
  action: { marginTop: 12 }
});
