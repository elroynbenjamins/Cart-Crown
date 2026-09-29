import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEquipment } from '../game/equipment';
import { factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  MetricTile,
  PrimaryButton,
  ScreenHero,
  SecondaryButton,
  SectionTitle,
  StatusPill,
  UnitPortrait
} from '../ui/components';
import { EmphasisText, SemanticText, UnitBadges } from '../ui/SemanticUI';
import { rolePresentation, semanticColor, tierTone } from '../ui/semanticColors';
import { UnitSprite } from '../ui/gameArt';
import { TutorialFocus } from '../ui/TutorialFocus';
import type { TutorialFocusTarget } from '../game/tutorial';

export function ArmyScreen({
  onOpenRecruitment,
  onOpenForge,
  onOpenPromotion,
  onOpenCommander,
  onOpenFantasyResearch,
  onOpenFlyingResearch,
  onOpenEquipment,
  tutorialFocus,
  onTutorialFocusComplete
}: {
  onOpenRecruitment: () => void;
  onOpenForge: () => void;
  onOpenPromotion: () => void;
  onOpenCommander: () => void;
  onOpenFantasyResearch: () => void;
  onOpenFlyingResearch: () => void;
  onOpenEquipment: (unitId: string) => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    chapterNumber,
    units,
    formation,
    currentWagonStage,
    settlementUpgraded,
    recruitChosen,
    recruitOptions,
    forgeUnlocked,
    firstPromotionComplete,
    unitEquipment,
    equipmentInventory,
    commanderChoiceUnlocked,
    activeCommanderPath,
    commanderRespecCost,
    completedStoryGates,
    magicFamilyUnlock,
    magicResearchDefinitions,
    flyingFamilyUnlock,
    flyingResearchDefinitions,
    researchProgress,
    buildingLevels,
    factionBuildingIds
  } = useGame();

  const activeCount = formation.filter(Boolean).length;
  const equippedCount = units.filter(unit =>
    Object.values(unitEquipment[unit.id] ?? {}).some(Boolean)
  ).length;
  const faction = factions[activeFaction];
  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;
  const activeForgeLevel =
    buildingLevels[factionBuildingIds.forge] ?? 0;
  const forgeAvailable =
    activeFaction === 'human'
      ? forgeUnlocked && activeForgeLevel > 0
      : activeForgeLevel > 0;
  const magicUnlocked = Boolean(
    magicFamilyUnlock &&
    completedStoryGates.includes(
      magicFamilyUnlock.storyGateId
    )
  );
  const completedMagicResearch =
    magicResearchDefinitions.filter(
      research => researchProgress[research.id]?.completed
    ).length;
  const flyingUnlocked = Boolean(
    flyingFamilyUnlock &&
    completedStoryGates.includes(
      flyingFamilyUnlock.storyGateId
    )
  );
  const completedFlyingResearch =
    flyingResearchDefinitions.filter(
      research => researchProgress[research.id]?.completed
    ).length;
  const mira = units.find(unit => unit.id === 'hum_recruit');
  const miraWeapon = unitEquipment.hum_recruit?.weapon
    ? getEquipment(unitEquipment.hum_recruit.weapon)
    : null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHero
        eyebrow={faction.name.toUpperCase() + ' ARMY'}
        title="Army"
        body="Squads keep their experience and assigned equipment. Promotions branch from what you train and give them."
        accent={factionAccent}
        status={
          <StatusPill
            label={
              activeCount +
              '/' +
              currentWagonStage.formationSlots +
              ' ACTIVE'
            }
            tone={
              activeCount >= currentWagonStage.formationSlots
                ? 'ready'
                : 'available'
            }
          />
        }
      >
        <View style={styles.heroMetrics}>
          <MetricTile
            label="ROSTER"
            value={units.length}
            caption="owned squads"
            tone="info"
          />
          <MetricTile
            label="EQUIPPED"
            value={equippedCount + '/' + units.length}
            caption="squads with gear"
            tone={equippedCount > 0 ? 'positive' : 'neutral'}
          />
        </View>
      </ScreenHero>

      <SectionTitle title="Squads" />

      <View style={styles.unitList}>
        {units.map(unit => (
          <GameCard key={unit.id} accent={unit.id === 'hum_recruit' && firstPromotionComplete ? theme.colors.gold : undefined}>
            <View style={styles.unitRow}>
              <UnitPortrait
                name={unit.name}
                className={unit.className + ' · Lv. ' + unit.level}
                accent={semanticColor(theme, rolePresentation[unit.role]?.tone ?? 'neutral')}
                faction={unit.faction}
              />
              <View style={styles.stats}>
                <Text style={[styles.stat, { color: theme.colors.text }]}>HP {unit.hp}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ATK {unit.attack}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ARM {unit.armor}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>SPD {unit.speed}</Text>
              </View>
            </View>
            <View style={styles.unitBadges}>
              <UnitBadges role={unit.role} tier={unit.tier} battleTags={unit.battleTags} />
            </View>

            {activeFaction === 'human' && unit.id === 'hum_recruit' ? (
              <View style={[styles.promotionPreview, { backgroundColor: theme.colors.surface2 }]}>
                <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
                  {firstPromotionComplete ? 'Assigned equipment' : 'First promotion'}
                </Text>
                <Text style={[styles.previewBody, { color: theme.colors.textMuted }]}>
                  {firstPromotionComplete
                    ? <><SemanticText tone={miraWeapon ? tierTone(miraWeapon.tier) : 'neutral'}>{miraWeapon?.name ?? 'Weapon'}</SemanticText>{' is assigned permanently to this squad.'}</>
                    : forgeUnlocked && (buildingLevels.forge ?? 0) > 0
                      ? 'Craft a weapon, then choose whether Mira becomes Swordsman, Spearman or Archer.'
                      : forgeUnlocked
                        ? 'The Field Forge blueprint is unlocked. Construct it from Settlement View first.'
                        : 'Investigate Marked Raiders to unlock the Field Forge and first equipment choice.'}
                </Text>
                {forgeUnlocked && (buildingLevels.forge ?? 0) > 0 && !firstPromotionComplete ? (
                  <View style={styles.promotionActions}>
                    <View style={styles.actionGrow}>
                      <PrimaryButton
                        label={equipmentInventory.length > 0 ? 'Promote Mira' : 'Open Forge'}
                        onPress={equipmentInventory.length > 0 ? onOpenPromotion : onOpenForge}
                      />
                    </View>
                  </View>
                ) : null}

                {firstPromotionComplete ? (
                  <Text style={[styles.previewBody, { color: theme.colors.primary }]}>
                    Further class branches now depend on assigned gear and Kingdom building levels.
                  </Text>
                ) : null}
              </View>
            ) : null}

            {forgeAvailable ? (
              <View style={styles.unitEquipmentButton}>
                <SecondaryButton
                  label="Loadout / Equipment"
                  onPress={() => onOpenEquipment(unit.id)}
                />
              </View>
            ) : null}
          </GameCard>
        ))}
      </View>

      {commanderChoiceUnlocked ? (
        <>
          <SectionTitle title="Your Commander" trailing={activeCommanderPath ? 'Specialized' : 'Choose path'} />
          <GameCard accent={activeCommanderPath ? theme.colors.gold : theme.colors.primary}>
            <Text style={[styles.commanderTitle, { color: theme.colors.text }]}>
              {activeCommanderPath ? activeCommanderPath.name : 'Commander specialization available'}
            </Text>
            <Text style={[styles.commanderSubtitle, { color: factionAccent }]}>
              {activeCommanderPath ? activeCommanderPath.title : 'Choose how your leadership shapes the army'}
            </Text>
            <EmphasisText
              text={activeCommanderPath
                ? activeCommanderPath.passiveDescription + ' Command skill: ' + activeCommanderPath.skill.name + '.'
                : 'Choose one of three ' + faction.name + ' commander paths.'}
              style={[styles.commanderBody, { color: theme.colors.textMuted }]}
            />
            <View style={styles.recruitButton}>
              {activeCommanderPath ? (
                <SecondaryButton
                  label={'Retrain Commander · ' + commanderRespecCost + ' Gold'}
                  onPress={onOpenCommander}
                />
              ) : (
                <PrimaryButton
                  label="Choose Commander Path"
                  onPress={onOpenCommander}
                />
              )}
            </View>
          </GameCard>
        </>
      ) : null}

      {chapterNumber >= 4 ? (
        <>
          <SectionTitle
            title="Fantasy training"
            trailing={
              magicUnlocked
                ? completedMagicResearch +
                  '/' +
                  magicResearchDefinitions.length +
                  ' researched'
                : 'Story gate'
            }
          />
          <GameCard
            accent={magicUnlocked ? factionAccent : undefined}
            faction={activeFaction}
            state={magicUnlocked ? 'ready' : 'default'}
          >
            <Text style={[styles.lockedTitle, { color: theme.colors.text }]}>
              {magicFamilyUnlock?.buildingName ?? 'Arcane Institution'}
            </Text>
            <Text style={[styles.lockedBody, { color: theme.colors.textMuted }]}>
              {magicUnlocked
                ? 'Your first magic specialist has joined. Research repeatable branches, then train new squads without replacing your conventional army.'
                : 'Chapter 4 introduces the faction’s magic story discovery. Complete the current campaign event to establish the institution and receive the first caster.'}
            </Text>
            <View style={styles.recruitButton}>
              <PrimaryButton
                label={
                  magicUnlocked
                    ? 'Open Arcane Research'
                    : 'View Magic Progress'
                }
                onPress={onOpenFantasyResearch}
              />
            </View>
          </GameCard>
        </>
      ) : null}

      {chapterNumber >= 5 ? (
        <>
          <SectionTitle
            title="Aerial training"
            trailing={
              flyingUnlocked
                ? completedFlyingResearch +
                  '/' +
                  flyingResearchDefinitions.length +
                  ' researched'
                : 'Story gate'
            }
          />
          <GameCard
            accent={flyingUnlocked ? factionAccent : undefined}
            faction={activeFaction}
            state={flyingUnlocked ? 'ready' : 'default'}
          >
            <Text style={[styles.lockedTitle, { color: theme.colors.text }]}>
              {flyingFamilyUnlock?.buildingName ?? 'Aerial Institution'}
            </Text>
            <Text style={[styles.lockedBody, { color: theme.colors.textMuted }]}>
              {flyingUnlocked
                ? 'Your first aerial squad has joined. Complete handling research to train specialized flying branches and learn when anti-air pressure makes a ground plan safer.'
                : 'Chapter 5 opens faction-specific aerial warfare. Complete the current discovery to establish the handling grounds and receive the first flying squad.'}
            </Text>
            <View style={styles.recruitButton}>
              <PrimaryButton
                label={
                  flyingUnlocked
                    ? 'Open Aerial Training'
                    : 'View Flying Progress'
                }
                onPress={onOpenFlyingResearch}
              />
            </View>
          </GameCard>
        </>
      ) : null}

      {activeFaction === 'human' && !recruitChosen ? (
        <>
          <SectionTitle title="Third squad" trailing={settlementUpgraded ? 'Available now' : 'Unlocks at Settlement'} />
          <GameCard accent={settlementUpgraded ? theme.colors.primary : undefined}>
            <Text style={[styles.lockedTitle, { color: theme.colors.text }]}>First Reinforcements</Text>
            <Text style={[styles.lockedBody, { color: theme.colors.textMuted }]}>
              {settlementUpgraded
                ? 'Greenkeep can now support one more squad. Choose the first new role in your army.'
                : 'After Hold the Road and the first Settlement upgrade, choose one of three early paths.'}
            </Text>
            <View style={styles.choiceList}>
              {recruitOptions.map(choice => (
                <View key={choice.id} style={[styles.choice, { backgroundColor: theme.colors.surface2 }]}>
                  <View style={[styles.choiceIcon, { borderColor: semanticColor(theme, rolePresentation[choice.unit.role]?.tone ?? 'neutral') }]}>
                    <UnitSprite className={choice.unit.className} faction={choice.unit.faction} size={36} />
                  </View>
                  <View style={styles.choiceCopy}>
                    <Text style={[styles.choiceName, { color: semanticColor(theme, rolePresentation[choice.unit.role]?.tone ?? 'neutral') }]}>{choice.unit.className}</Text>
                    <Text style={[styles.choiceRole, { color: factionAccent }]}>{choice.archetype}</Text>
                    <View style={styles.unitBadges}><UnitBadges role={choice.unit.role} battleTags={choice.unit.battleTags} compact /></View>
                    <Text style={[styles.choicePitch, { color: theme.colors.textMuted }]}>{choice.pitch}</Text>
                  </View>
                </View>
              ))}
            </View>
            {settlementUpgraded ? (
              <View style={styles.recruitButton}>
                <PrimaryButton label="Choose third squad" onPress={onOpenRecruitment} />
              </View>
            ) : null}
          </GameCard>
        </>
      ) : null}

      {forgeAvailable ? (
        <>
          <SectionTitle title="Equipment inventory" trailing={String(equipmentInventory.length)} />
          <TutorialFocus
            active={tutorialFocus?.kind === 'army-equipment'}
            label={tutorialFocus?.kind === 'army-equipment' ? tutorialFocus.label : undefined}
          >
          <GameCard>
            <Text style={[styles.inventoryText, { color: theme.colors.textMuted }]}>
              {equipmentInventory.length > 0
                ? equipmentInventory.map((id, index) => {
                    const item = getEquipment(id);
                    return <React.Fragment key={id + ':' + index}>
                      {index > 0 ? ' · ' : ''}
                      <SemanticText tone={item ? tierTone(item.tier) : 'neutral'}>{item?.name ?? id}</SemanticText>
                    </React.Fragment>;
                  })
                : 'No unassigned equipment. Crafted gear appears here until equipped or used for a promotion.'}
            </Text>
            <View style={styles.recruitButton}>
              <SecondaryButton
                label={activeFaction === 'human' ? 'Open Field Forge' : 'Open Unit Equipment'}
                onPress={
                  activeFaction === 'human'
                    ? onOpenForge
                    : () => {
                        const firstUnit = units[0];
                        if (firstUnit) {
                          if (tutorialFocus?.kind === 'army-equipment') {
                            onTutorialFocusComplete?.();
                          }
                          onOpenEquipment(firstUnit.id);
                        }
                      }
                }
              />
            </View>
          </GameCard>
          </TutorialFocus>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  unitBadges: { marginTop: 8 },
  unitList: { gap: 10 },
  unitRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  stats: { alignItems: 'flex-end', gap: 2 },
  stat: { fontSize: 10, fontWeight: '800' },
  promotionPreview: { borderRadius: 14, padding: 11, marginTop: 12 },
  previewTitle: { fontSize: 12, fontWeight: '900' },
  previewBody: { fontSize: 11, lineHeight: 15, marginTop: 3 },
  promotionActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionGrow: { flex: 1 },
  lockedTitle: { fontSize: 17, fontWeight: '900' },
  lockedBody: { fontSize: 12, lineHeight: 17, marginTop: 5 },
  choiceList: { gap: 8, marginTop: 14 },
  choice: { borderRadius: 16, padding: 10, flexDirection: 'row', gap: 11, alignItems: 'center' },
  choiceIcon: { width: 42, height: 48, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  choiceCopy: { flex: 1 },
  choiceName: { fontSize: 14, fontWeight: '900' },
  choiceRole: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', marginTop: 2 },
  choicePitch: { fontSize: 10, lineHeight: 14, marginTop: 3 },
  recruitButton: { marginTop: 14 },
  inventoryText: { fontSize: 11.5, lineHeight: 17 },
  unitEquipmentButton: { marginTop: 11 },
  commanderTitle: { fontSize: 18, fontWeight: '900' },
  commanderSubtitle: { fontSize: 10, fontWeight: '900', marginTop: 3 },
  commanderBody: { fontSize: 11.5, lineHeight: 17, marginTop: 7 }
});
