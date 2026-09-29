import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import type { TacticalAdjustmentAdvice } from '../game/loadoutAnalysis';
import type { FormationPresetSlotId } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  MetricTile,
  Pill,
  PrimaryButton,
  ScreenHero,
  SecondaryButton,
  SectionTitle,
  StatusPill,
  UnitPortrait
} from '../ui/components';
import { UnitSprite } from '../ui/gameArt';
import { TutorialFocus } from '../ui/TutorialFocus';
import type { TutorialFocusTarget } from '../game/tutorial';

const rowNotes = {
  front: '+Armor / threat',
  middle: 'Flexible / reserve',
  rear: 'Ranged / support'
} as const;

export type FormationGuide = {
  adjustment: TacticalAdjustmentAdvice;
  presetSlotId: FormationPresetSlotId;
};

export function FormationScreen({
  guide,
  onClearGuide,
  onReturnToBattlePrep,
  tutorialFocus,
  onTutorialFocusComplete
}: {
  guide?: FormationGuide | null;
  onClearGuide?: () => void;
  onReturnToBattlePrep?: () => void;
  tutorialFocus?: TutorialFocusTarget | null;
  onTutorialFocusComplete?: () => void;
} = {}) {
  const { theme } = useGameTheme();
  const {
    units,
    formation,
    activeFaction,
    activeSquadCap,
    formationShapeId,
    formationShapes,
    activeFormationShape,
    formationDoctrineId,
    formationDoctrines,
    formationBonuses,
    formationPresets,
    setFormationShape,
    setFormationDoctrine,
    saveFormationPreset,
    applyFormationPreset,
    clearFormationPreset,
    moveFormationUnit,
    placeFormationUnit,
    currentWagonStage
  } = useGame();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [guideStepComplete, setGuideStepComplete] = useState(false);
  const [guideMessage, setGuideMessage] = useState<string | null>(null);

  useEffect(() => {
    setGuideStepComplete(false);
    setGuideMessage(null);
    setSelectedUnitId(null);
  }, [
    guide?.adjustment.kind,
    guide?.adjustment.title,
    guide?.presetSlotId
  ]);

  const activeCount = formation.filter(Boolean).length;
  const faction = factions[activeFaction];
  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const unlockedAtStage = (unlock: string) => {
    if (unlock === 'Start') return true;
    if (unlock === 'Settlement') return currentWagonStage.id !== 'camp';
    if (unlock === 'Fort') {
      return ['fort', 'town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
    }
    if (unlock === 'Town') {
      return ['town', 'stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
    }
    if (unlock === 'Stronghold') {
      return ['stronghold', 'capital', 'grand'].includes(currentWagonStage.id);
    }
    return false;
  };

  const presetSlots = [1, 2, 3] as const;

  const presetMatchesCurrent = (slotId: 1 | 2 | 3) => {
    const preset = formationPresets.find(
      candidate => candidate.slotId === slotId
    );
    if (!preset) return false;

    return (
      preset.formationShapeId === formationShapeId &&
      preset.formationDoctrineId === formationDoctrineId &&
      Array.from({ length: 9 }).every(
        (_, index) =>
          (preset.formation[index] ?? null) ===
          (formation[index] ?? null)
      )
    );
  };

  const guidePresetIsCurrent = guide
    ? presetMatchesCurrent(guide.presetSlotId)
    : false;

  const guideShape = guide?.adjustment.suggestedShapeId
    ? formationShapes.find(
        shape => shape.id === guide.adjustment.suggestedShapeId
      )
    : null;
  const guideSuggestedUnit = guide?.adjustment.suggestedUnitId
    ? units.find(unit => unit.id === guide.adjustment.suggestedUnitId)
    : null;
  const guideReplaceUnit = guide?.adjustment.replaceUnitId
    ? units.find(unit => unit.id === guide.adjustment.replaceUnitId)
    : null;

  const guideNeedsPresetLoad = Boolean(
    guide &&
      guide.adjustment.kind !== 'repair_preset' &&
      !guidePresetIsCurrent
  );

  const guideActionLabel = !guide
    ? ''
    : guideStepComplete
      ? 'Change applied'
      : guideNeedsPresetLoad
        ? 'Load Loadout ' + guide.presetSlotId
        : guide.adjustment.kind === 'counter_shape'
          ? 'Use ' + (guideShape?.name ?? 'counter formation')
          : guide.adjustment.kind === 'fill_slot'
            ? 'Add ' + (guideSuggestedUnit?.name ?? 'suggested squad')
            : guide.adjustment.kind === 'role_swap'
              ? 'Make suggested swap'
              : guide.adjustment.kind === 'reposition'
                ? 'Move ' + (guideSuggestedUnit?.name ?? 'squad')
                : 'Apply safe preset remainder';

  const handleGuideAction = () => {
    if (!guide || guideStepComplete) return;

    if (guideNeedsPresetLoad) {
      if (applyFormationPreset(guide.presetSlotId)) {
        setGuideMessage(
          'Loadout ' +
            guide.presetSlotId +
            ' loaded. The exact recommended change is highlighted below.'
        );
      } else {
        setGuideMessage(
          'That saved loadout cannot be applied in the current progression state.'
        );
      }
      return;
    }

    const { adjustment } = guide;
    let changed = false;

    if (
      adjustment.kind === 'counter_shape' &&
      adjustment.suggestedShapeId
    ) {
      changed = setFormationShape(adjustment.suggestedShapeId);
    } else if (
      (adjustment.kind === 'fill_slot' ||
        adjustment.kind === 'role_swap') &&
      adjustment.suggestedUnitId &&
      adjustment.targetSlot !== undefined
    ) {
      changed = placeFormationUnit(
        adjustment.suggestedUnitId,
        adjustment.targetSlot
      );
    } else if (
      adjustment.kind === 'reposition' &&
      adjustment.suggestedUnitId &&
      adjustment.targetSlot !== undefined
    ) {
      changed = moveFormationUnit(
        adjustment.suggestedUnitId,
        adjustment.targetSlot
      );
    } else if (adjustment.kind === 'repair_preset') {
      changed = applyFormationPreset(guide.presetSlotId);
    }

    if (changed) {
      setGuideStepComplete(true);
      setGuideMessage(
        adjustment.kind === 'repair_preset'
          ? 'Safe parts of the saved loadout were restored. Recheck Battle Prep for the next gap.'
          : 'Tactical change applied. Return to Battle Prep to recalculate the matchup.'
      );
    } else {
      setGuideMessage(
        'This change is no longer valid for the current formation. Return to Battle Prep to refresh the recommendation.'
      );
    }
  };

  const handleSlot = (slot: number, unitId: string | null) => {
    if (selectedUnitId) {
      if (unitId === selectedUnitId) {
        setSelectedUnitId(null);
        if (
          tutorialFocus?.kind === 'formation-basics' ||
          (
            tutorialFocus?.kind === 'formation-unit' &&
            tutorialFocus.unitId === selectedUnitId
          )
        ) {
          onTutorialFocusComplete?.();
        }
        return;
      }

      const selectedIsActive =
        formation.includes(selectedUnitId);
      const changed = selectedIsActive
        ? moveFormationUnit(selectedUnitId, slot)
        : placeFormationUnit(selectedUnitId, slot);

      if (changed) {
        setSelectedUnitId(null);
        if (
          tutorialFocus?.kind === 'formation-basics' ||
          (
            tutorialFocus?.kind === 'formation-unit' &&
            tutorialFocus.unitId === selectedUnitId
          )
        ) {
          onTutorialFocusComplete?.();
        }
      }
      return;
    }

    if (unitId) {
      setSelectedUnitId(unitId);
    }
  };

  const rows = [
    { key: 'front' as const, label: 'FRONT', slots: activeFormationShape.rows.front },
    { key: 'middle' as const, label: 'MIDDLE', slots: activeFormationShape.rows.middle },
    { key: 'rear' as const, label: 'REAR', slots: activeFormationShape.rows.rear }
  ];

  const tutorialUnitFocusId =
    tutorialFocus?.kind === 'formation-unit' &&
    !selectedUnitId
      ? tutorialFocus.unitId
      : tutorialFocus?.kind === 'formation-basics' &&
          !selectedUnitId
        ? formation.find(
            (unitId): unitId is string =>
              Boolean(unitId)
          ) ?? null
        : null;

  const tutorialSlotFocus =
    selectedUnitId &&
    (
      tutorialFocus?.kind === 'formation-basics' ||
      (
        tutorialFocus?.kind === 'formation-unit' &&
        tutorialFocus.unitId === selectedUnitId
      )
    )
      ? formation.includes(selectedUnitId)
        ? formation.indexOf(selectedUnitId)
        : activeFormationShape.rows.front
            .concat(
              activeFormationShape.rows.middle,
              activeFormationShape.rows.rear
            )
            .find(slot => !formation[slot]) ??
          activeFormationShape.rows.front
            .concat(
              activeFormationShape.rows.middle,
              activeFormationShape.rows.rear
            )
            .find(slot => Boolean(formation[slot])) ??
          null
      : null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {guide ? (
        <GameCard
          accent={guideStepComplete ? theme.colors.primary : theme.colors.gold}
          faction={activeFaction}
        >
          <View style={styles.guideHeader}>
            <View style={styles.guideCopy}>
              <Text style={[styles.eyebrow, { color: theme.colors.gold }]}>
                BATTLE PREP GUIDANCE
              </Text>
              <Text style={[styles.guideTitle, { color: theme.colors.text }]}>
                {guide.adjustment.title}
              </Text>
            </View>
            <Pill
              label={'LOADOUT ' + guide.presetSlotId}
              color={theme.colors.gold + '35'}
            />
          </View>
          <Text style={[styles.guideDetail, { color: theme.colors.textMuted }]}>
            {guide.adjustment.detail}
          </Text>
          {guideNeedsPresetLoad ? (
            <Text style={[styles.guideNote, { color: theme.colors.gold }]}>
              This recommendation was calculated from Loadout {guide.presetSlotId}. Load it first so the highlighted change applies to the correct setup.
            </Text>
          ) : guide.adjustment.kind === 'role_swap' && guideSuggestedUnit && guideReplaceUnit ? (
            <Text style={[styles.guideNote, { color: theme.colors.gold }]}>
              Highlighted swap · {guideReplaceUnit.name} → {guideSuggestedUnit.name}
            </Text>
          ) : guide.adjustment.targetSlot !== undefined ? (
            <Text style={[styles.guideNote, { color: theme.colors.gold }]}>
              Target position · slot {guide.adjustment.targetSlot + 1}
            </Text>
          ) : guideShape ? (
            <Text style={[styles.guideNote, { color: theme.colors.gold }]}>
              Highlighted formation · {guideShape.layout} {guideShape.name}
            </Text>
          ) : null}
          {guideMessage ? (
            <Text
              style={[
                styles.guideMessage,
                {
                  color: guideStepComplete
                    ? theme.colors.primary
                    : theme.colors.textMuted
                }
              ]}
            >
              {guideMessage}
            </Text>
          ) : null}
          <View style={styles.guideActions}>
            <View style={styles.guidePrimary}>
              <PrimaryButton
                label={guideActionLabel}
                disabled={guideStepComplete}
                onPress={handleGuideAction}
              />
            </View>
            {onReturnToBattlePrep ? (
              <View style={styles.guideSecondary}>
                <SecondaryButton
                  label="Back to Battle Prep"
                  onPress={onReturnToBattlePrep}
                />
              </View>
            ) : null}
          </View>
          {onClearGuide ? (
            <Pressable
              onPress={onClearGuide}
              style={({ pressed }) => [
                styles.guideDismiss,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={[styles.guideDismissText, { color: theme.colors.textMuted }]}>
                Dismiss guidance
              </Text>
            </Pressable>
          ) : null}
        </GameCard>
      ) : null}

      <ScreenHero
        eyebrow={activeFormationShape.layout + ' FORMATION'}
        title={activeFormationShape.name}
        body={activeFormationShape.summary}
        accent={factionAccent}
        status={
          <StatusPill
            label={activeCount + '/' + activeSquadCap + ' SQUADS'}
            tone={activeCount >= activeSquadCap ? 'ready' : 'available'}
          />
        }
      >
        <View style={styles.heroMetrics}>
          <MetricTile
            label="DOCTRINE"
            value={
              formationDoctrines.find(
                doctrine => doctrine.id === formationDoctrineId
              )?.name ?? faction.mechanicName
            }
            caption="active battle behavior"
            tone="gold"
          />
          <MetricTile
            label="LOADOUTS"
            value={formationPresets.length + '/3'}
            caption="saved tactical presets"
            tone="info"
          />
        </View>
      </ScreenHero>

      <SectionTitle title="Tactical loadouts" trailing="3 presets" />
      <View style={styles.presetList}>
        {presetSlots.map(slotId => {
          const preset = formationPresets.find(
            candidate => candidate.slotId === slotId
          );
          const presetShape = preset
            ? formationShapes.find(
                shape => shape.id === preset.formationShapeId
              )
            : null;
          const presetDoctrine = preset
            ? formationDoctrines.find(
                doctrine => doctrine.id === preset.formationDoctrineId
              )
            : null;
          const active = presetMatchesCurrent(slotId);
          const squadCount = preset
            ? preset.formation.filter(Boolean).length
            : 0;

          return (
            <GameCard
              key={slotId}
              accent={
                guide?.presetSlotId === slotId
                  ? theme.colors.gold
                  : active
                    ? theme.colors.gold
                    : preset
                      ? factionAccent
                      : undefined
              }
            >
              <View style={styles.presetHeader}>
                <View style={styles.presetCopy}>
                  <Text
                    style={[
                      styles.presetTitle,
                      { color: theme.colors.text }
                    ]}
                  >
                    Loadout {slotId}
                  </Text>
                  <Text
                    style={[
                      styles.presetMeta,
                      { color: theme.colors.textMuted }
                    ]}
                  >
                    {preset
                      ? (presetShape?.layout ?? 'Formation') +
                        ' · ' +
                        (presetShape?.name ?? 'Saved shape') +
                        ' · ' +
                        (presetDoctrine?.name ?? 'Saved doctrine') +
                        ' · ' +
                        squadCount +
                        ' squads'
                      : 'Empty preset'}
                  </Text>
                </View>
                {active ? (
                  <Pill
                    label="CURRENT"
                    color={theme.colors.gold + '45'}
                  />
                ) : null}
              </View>

              <View style={styles.presetActions}>
                {preset && !active ? (
                  <Pressable
                    onPress={() => applyFormationPreset(slotId)}
                    style={({ pressed }) => [
                      styles.presetAction,
                      {
                        borderColor: factionAccent,
                        opacity: pressed ? 0.75 : 1
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetActionText,
                        { color: factionAccent }
                      ]}
                    >
                      Apply
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={() => saveFormationPreset(slotId)}
                  style={({ pressed }) => [
                    styles.presetAction,
                    {
                      borderColor: theme.colors.gold,
                      opacity: pressed ? 0.75 : 1
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.presetActionText,
                      { color: theme.colors.gold }
                    ]}
                  >
                    {preset ? 'Overwrite' : 'Save current'}
                  </Text>
                </Pressable>

                {preset ? (
                  <Pressable
                    onPress={() => clearFormationPreset(slotId)}
                    style={({ pressed }) => [
                      styles.presetAction,
                      {
                        borderColor: theme.colors.border,
                        opacity: pressed ? 0.75 : 1
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetActionText,
                        { color: theme.colors.textMuted }
                      ]}
                    >
                      Clear
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </GameCard>
          );
        })}
      </View>
      <Text style={[styles.presetHint, { color: theme.colors.textMuted }]}>
        Each loadout saves the formation shape, faction doctrine and exact squad positions.
      </Text>

      <SectionTitle title="Formation shape" trailing="9 positions · max 6 squads" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shapeStrip}
      >
        {formationShapes.map(shape => {
          const selected = shape.id === formationShapeId;
          const unlocked = unlockedAtStage(shape.unlock);

          return (
            <TutorialFocus
              key={shape.id}
              active={
                tutorialFocus?.kind === 'formation-shape' &&
                unlocked &&
                !selected
              }
              label={
                tutorialFocus?.kind === 'formation-shape' &&
                unlocked &&
                !selected
                  ? tutorialFocus.label
                  : undefined
              }
            >
            <Pressable
              disabled={!unlocked}
              onPress={() => {
                const changed = setFormationShape(shape.id);
                if (
                  changed &&
                  tutorialFocus?.kind === 'formation-shape'
                ) {
                  onTutorialFocusComplete?.();
                }
              }}
              style={({ pressed }) => [
                styles.shapeCard,
                {
                  borderColor:
                    guide?.adjustment.suggestedShapeId === shape.id
                      ? theme.colors.gold
                      : selected
                        ? theme.colors.gold
                        : theme.colors.border,
                  backgroundColor:
                    guide?.adjustment.suggestedShapeId === shape.id
                      ? theme.colors.surface1
                      : selected
                        ? theme.colors.surface1
                        : theme.colors.surface2,
                  opacity: !unlocked ? 0.44 : pressed ? 0.82 : 1
                }
              ]}
            >
              <View style={styles.shapeTop}>
                <Text style={[styles.shapeLayout, { color: selected ? theme.colors.gold : factionAccent }]}>
                  {shape.layout}
                </Text>
                <Text style={[styles.shapeUnlock, { color: theme.colors.textMuted }]}>
                  {selected ? 'ACTIVE' : unlocked ? shape.unlock.toUpperCase() : 'LOCKED · ' + shape.unlock.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.shapeName, { color: theme.colors.text }]}>{shape.name}</Text>
              <Text style={[styles.shapeMeta, { color: theme.colors.textMuted }]} numberOfLines={2}>
                {shape.strength}
              </Text>
              <Text style={[styles.shapeRisk, { color: theme.colors.textMuted }]} numberOfLines={2}>
                Risk: {shape.risk}
              </Text>
            </Pressable>
            </TutorialFocus>
          );
        })}
      </ScrollView>

      <SectionTitle title="Battle positions" trailing={activeFormationShape.layout} />

      <View style={styles.board}>
        {rows.map(row => {
          const dense = row.slots.length >= 5;

          return (
            <View key={row.key} style={styles.rowGroup}>
              <View style={styles.rowHeading}>
                <Text style={[styles.rowLabel, { color: theme.colors.textMuted }]}>{row.label}</Text>
                <Text style={[styles.rowNote, { color: theme.colors.textMuted }]}>
                  {rowNotes[row.key]} · {row.slots.length} slots
                </Text>
              </View>
              <View style={styles.boardRow}>
                {row.slots.map(slot => {
                  const unitId = formation[slot] ?? null;
                  const unit = units.find(candidate => candidate.id === unitId);
                  const selected = Boolean(unit && selectedUnitId === unit.id);

                  return (
                    <TutorialFocus
                      key={slot}
                      active={tutorialSlotFocus === slot}
                      label={
                        tutorialSlotFocus === slot
                          ? formation[slot] === selectedUnitId
                            ? 'CURRENT POSITION'
                            : formation[slot]
                              ? 'REPLACE THIS SQUAD'
                              : 'PLACE HERE'
                          : undefined
                      }
                    >
                    <Pressable
                      onPress={() => handleSlot(slot, unitId)}
                      style={[
                        styles.slot,
                        dense && styles.slotDense,
                        {
                          backgroundColor: unit ? theme.colors.surface1 : theme.colors.surface2,
                          borderColor:
                            guide?.adjustment.targetSlot === slot
                              ? theme.colors.gold
                              : selected
                                ? theme.colors.gold
                                : unit
                                  ? factionAccent
                                  : theme.colors.border
                        }
                      ]}
                    >
                      <Text style={[styles.slotNumber, { color: theme.colors.textMuted }]}>
                        {slot + 1}
                      </Text>
                      {unit ? (
                        <>
                          <View
                            style={[
                              styles.slotPortrait,
                              dense && styles.slotPortraitDense,
                              { borderColor: factionAccent }
                            ]}
                          >
                            <UnitSprite
                              className={unit.className}
                              faction={unit.faction}
                              size={dense ? 29 : 36}
                            />
                          </View>
                          <Text
                            style={[
                              styles.slotName,
                              dense && styles.slotNameDense,
                              { color: theme.colors.text }
                            ]}
                            numberOfLines={1}
                          >
                            {unit.name}
                          </Text>
                          {!dense ? (
                            <Text
                              style={[styles.slotClass, { color: theme.colors.textMuted }]}
                              numberOfLines={1}
                            >
                              {unit.className}
                            </Text>
                          ) : null}
                        </>
                      ) : (
                        <Text style={[styles.emptyLabel, { color: theme.colors.textMuted }]}>Empty</Text>
                      )}
                    </Pressable>
                    </TutorialFocus>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      <Text style={[styles.interactionHint, { color: theme.colors.textMuted }]}>
        Tap a squad, then tap any visible position to move or swap it. Changing shape changes which positions belong to the front, middle and rear; it does not change your squad cap.
      </Text>

      <SectionTitle title={faction.name + ' ' + faction.mechanicName} trailing="Battle behavior" />
      <View style={styles.doctrineList}>
        {formationDoctrines.map(doctrine => {
          const selected = doctrine.id === formationDoctrineId;
          const unlocked = unlockedAtStage(doctrine.unlock);

          return (
            <Pressable
              key={doctrine.id}
              disabled={!unlocked}
              onPress={() => setFormationDoctrine(doctrine.id)}
              style={({ pressed }) => ({ opacity: !unlocked ? 0.45 : pressed ? 0.82 : 1 })}
            >
              <GameCard accent={selected ? theme.colors.gold : undefined}>
                <View style={styles.doctrineHeader}>
                  <View style={styles.doctrineCopy}>
                    <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
                      {doctrine.name}
                    </Text>
                    <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
                      {doctrine.description}
                    </Text>
                  </View>
                  <Pill
                    label={selected ? 'ACTIVE' : unlocked ? doctrine.unlock : 'LOCKED · ' + doctrine.unlock}
                    color={selected ? theme.colors.gold + '45' : undefined}
                  />
                </View>
              </GameCard>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="Active formation synergies" trailing={String(formationBonuses.length)} />
      {formationBonuses.length > 0 ? (
        <View style={styles.bonusList}>
          {formationBonuses.map(bonus => (
            <GameCard key={bonus.id} accent={theme.colors.primary}>
              <View style={styles.bonusHeader}>
                <Text style={[styles.bonusName, { color: theme.colors.text }]}>{bonus.name}</Text>
                <Text style={[styles.bonusValue, { color: theme.colors.primary }]}>{bonus.value}</Text>
              </View>
              <Text style={[styles.bonusBody, { color: theme.colors.textMuted }]}>
                {bonus.description}
              </Text>
            </GameCard>
          ))}
        </View>
      ) : (
        <GameCard>
          <Text style={[styles.noBonus, { color: theme.colors.textMuted }]}>
            Reposition squads to create a formation synergy.
          </Text>
        </GameCard>
      )}

      <SectionTitle title="Active squads" trailing={selectedUnitId ? 'Select a position' : undefined} />
      <View style={styles.unitList}>
        {units.map(unit => {
          const active = formation.includes(unit.id);
          const selected = selectedUnitId === unit.id;

          const canSelectReserve = !active;
          const tutorialUnitFocused =
            tutorialUnitFocusId === unit.id;

          return (
            <TutorialFocus
              key={unit.id}
              active={tutorialUnitFocused}
              label={
                tutorialUnitFocused
                  ? tutorialFocus?.label
                  : undefined
              }
            >
            <Pressable
              disabled={!active && !canSelectReserve}
              onPress={() => {
                const nextSelected =
                  selected ? null : unit.id;
                setSelectedUnitId(nextSelected);
              }}
              style={({ pressed }) => ({
                opacity: pressed
                  ? 0.82
                  : active || canSelectReserve
                    ? 1
                    : 0.55
              })}
            >
              <GameCard
                accent={
                  guide?.adjustment.suggestedUnitId === unit.id
                    ? theme.colors.gold
                    : guide?.adjustment.replaceUnitId === unit.id
                      ? theme.colors.danger
                      : selected
                        ? theme.colors.gold
                        : active
                          ? factionAccent
                          : undefined
                }
              >
                <View style={styles.unitRow}>
                  <UnitPortrait
                    name={unit.name}
                    className={unit.className}
                    accent={selected ? theme.colors.gold : factionAccent}
                    compact
                  />
                  <View style={styles.stats}>
                    <Text style={[styles.stat, { color: theme.colors.text }]}>HP {unit.hp}</Text>
                    <Text style={[styles.stat, { color: theme.colors.text }]}>ATK {unit.attack}</Text>
                    <Text style={[styles.stat, { color: theme.colors.text }]}>ARM {unit.armor}</Text>
                  </View>
                </View>
              </GameCard>
            </Pressable>
            </TutorialFocus>
          );
        })}
      </View>
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
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.05 },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10
  },
  guideCopy: { flex: 1 },
  guideTitle: { fontSize: 16, lineHeight: 21, fontWeight: '900', marginTop: 4 },
  guideDetail: { fontSize: 10.5, lineHeight: 16, marginTop: 8 },
  guideNote: { fontSize: 9.5, lineHeight: 14, fontWeight: '900', marginTop: 8 },
  guideMessage: { fontSize: 9.5, lineHeight: 14, marginTop: 8 },
  guideActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  guidePrimary: { flex: 1.15 },
  guideSecondary: { flex: 1 },
  guideDismiss: { alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 8, marginTop: 4 },
  guideDismissText: { fontSize: 8.5, fontWeight: '900', letterSpacing: 0.7 },
  presetList: { gap: 8 },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10
  },
  presetCopy: { flex: 1 },
  presetTitle: { fontSize: 14, fontWeight: '900' },
  presetMeta: { fontSize: 9.5, lineHeight: 14, marginTop: 4 },
  presetActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  presetAction: {
    minHeight: 32,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  presetActionText: { fontSize: 9.5, fontWeight: '900' },
  presetHint: {
    fontSize: 9.5,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 10
  },
  shapeStrip: { gap: 9, paddingRight: 4 },
  shapeCard: {
    width: 174,
    minHeight: 132,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 11
  },
  shapeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  shapeLayout: { fontSize: 16, fontWeight: '900' },
  shapeUnlock: { fontSize: 7.5, fontWeight: '900', flexShrink: 1, textAlign: 'right' },
  shapeName: { fontSize: 12.5, fontWeight: '900', marginTop: 8 },
  shapeMeta: { fontSize: 9.5, lineHeight: 13, marginTop: 5 },
  shapeRisk: { fontSize: 8.5, lineHeight: 12, marginTop: 5 },
  board: { gap: 8 },
  rowGroup: { gap: 5 },
  rowHeading: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 3 },
  rowLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  rowNote: { fontSize: 9, fontWeight: '700' },
  boardRow: { flexDirection: 'row', gap: 6 },
  slot: {
    flex: 1,
    minHeight: 82,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5
  },
  slotDense: { minHeight: 68, borderRadius: 13, padding: 3 },
  slotNumber: { position: 'absolute', top: 4, right: 6, fontSize: 7, fontWeight: '800' },
  slotPortrait: {
    width: 38,
    height: 42,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  slotPortraitDense: { width: 31, height: 34, borderRadius: 9 },
  slotName: { fontSize: 9.5, fontWeight: '900', marginTop: 4, maxWidth: '100%' },
  slotNameDense: { fontSize: 7.5, marginTop: 3 },
  slotClass: { fontSize: 7, marginTop: 2, maxWidth: '100%' },
  emptyLabel: { fontSize: 9, fontWeight: '800' },
  interactionHint: { fontSize: 10, lineHeight: 15, textAlign: 'center', paddingHorizontal: 12 },
  doctrineList: { gap: 8 },
  doctrineHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  doctrineCopy: { flex: 1 },
  doctrineName: { fontSize: 14, fontWeight: '900' },
  doctrineBody: { fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  bonusList: { gap: 8 },
  bonusHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  bonusName: { fontSize: 14, fontWeight: '900' },
  bonusValue: { fontSize: 11, fontWeight: '900' },
  bonusBody: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  noBonus: { fontSize: 12, textAlign: 'center' },
  unitList: { gap: 8 },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stats: { alignItems: 'flex-end', gap: 3 },
  stat: { fontSize: 10, fontWeight: '800' }
});
