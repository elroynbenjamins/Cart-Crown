import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getEncounter,
  getEnemyArmyProfile,
  getEnemyFormationTactic,
  getEnemyRoleAssignments
} from '../game/encounters';
import {
  getFormationCounters,
  getFormationMatchup,
  getFormationShape
} from '../game/formation';
import {
  getArmyReadinessProfile,
  getUnitCombatProfile
} from '../game/balance';
import type { EncounterId } from '../game/encounters';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  Pill,
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
  SectionTitle,
  StatusPill,
  UnitPortrait
} from '../ui/components';
import { EnemySprite } from '../ui/gameArt';

export function BattlePrepScreen({
  encounterId,
  onBegin
}: {
  encounterId: EncounterId;
  onBegin: () => void;
}) {
  const { theme } = useGameTheme();
  const {
    activeFaction,
    resources,
    armyReadiness,
    armyResupplyCost,
    restAndResupplyArmy,
    units,
    formation,
    wagonItems,
    formationBonuses,
    formationAnalysis,
    formationShapes,
    activeFormationShape,
    activeSquadCap,
    currentWagonStage,
    setFormationShape,
    formationDoctrineId,
    formationDoctrines,
    activeCommanderPath,
    activeMarcherWarningChoice,
    activeLastLoyalistsChoice,
    activeRoyalDecree,
    activeFactionMandate,
    buildingLevels,
    factionBuildingIds,
    settlementEffects,
    claimRewardedAd,
    rewardedAdClaims,
    rewardedAdMessage
  } = useGame();

  const encounter = getEncounter(encounterId);
  const enemyTactic = getEnemyFormationTactic(encounterId);
  const enemyShape = getFormationShape(enemyTactic.formationShapeId);
  const enemyArmyProfile = getEnemyArmyProfile(encounterId);
  const enemyAssignments = getEnemyRoleAssignments(
    encounterId,
    enemyShape.rows,
    encounter.enemyCount
  );
  const enemyComposition = Array.from(
    enemyAssignments.reduce((counts, assignment) => {
      counts.set(
        assignment.label,
        (counts.get(assignment.label) ?? 0) + 1
      );
      return counts;
    }, new Map<string, number>())
  )
    .map(([label, count]) => String(count) + ' ' + label)
    .join(' · ');
  const formationMatchup = getFormationMatchup(
    activeFormationShape.id,
    enemyShape.id
  );
  const stageRank: Record<string, number> = {
    camp: 0,
    settlement: 1,
    fort: 2,
    town: 3,
    stronghold: 4,
    capital: 5,
    grand: 6
  };
  const unlockRank: Record<string, number> = {
    Start: 0,
    Settlement: 1,
    Fort: 2,
    Town: 3,
    Stronghold: 4
  };
  const unlockedFormationShapes = formationShapes.filter(
    shape =>
      (stageRank[currentWagonStage.id] ?? 0) >=
      (unlockRank[shape.unlock] ?? 0)
  );
  const unlockedCounters = getFormationCounters(enemyShape.id)
    .filter(
      shape =>
        (stageRank[currentWagonStage.id] ?? 0) >=
        (unlockRank[shape.unlock] ?? 0)
    )
    .filter(shape => shape.id !== activeFormationShape.id)
    .slice(0, 3);
  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;
  const activeUnits = formation
    .filter((unitId): unitId is string => Boolean(unitId))
    .map(unitId => units.find(unit => unit.id === unitId))
    .filter((unit): unit is NonNullable<typeof unit> => Boolean(unit));

  const combatProfile = getUnitCombatProfile(activeUnits);
  const readinessProfile = getArmyReadinessProfile(armyReadiness);
  const effectiveMaxHp = Math.round(
    combatProfile.maxHp * readinessProfile.hpMultiplier
  );
  const effectiveAttack = Math.round(
    combatProfile.totalAttack * readinessProfile.attackMultiplier
  );
  const formationFull = activeUnits.length >= activeSquadCap;
  const hasFood = wagonItems.some(item => item.id === 'rations');
  const hasMedicine = wagonItems.some(item => item.id === 'medicine');
  const marcherDoctrineActive =
    encounterId === 'siege_road' || encounterId === 'lord_marshal_veyr';
  const loyalistApproachActive =
    encounterId === 'pretender_general';
  const metaAllianceActive = [
    'three_seals_convergence',
    'ashen_triumvirate',
    'unbound_beacon'
  ].includes(encounterId);
  const marcherIntel =
    marcherDoctrineActive &&
    Boolean(activeMarcherWarningChoice?.detailedIntel);
  const towerIntel =
    (buildingLevels[factionBuildingIds.scout] ?? 0) >= 2 ||
    settlementEffects.detailedIntel;
  const loyalistIntel =
    loyalistApproachActive &&
    Boolean(activeLastLoyalistsChoice?.detailedIntel);
  const mandateIntel = Boolean(activeFactionMandate?.detailedIntel);
  const scoutReport =
    towerIntel ||
    marcherIntel ||
    loyalistIntel ||
    mandateIntel ||
    (rewardedAdClaims.scout_report ?? 0) > 0;
  const doctrine = formationDoctrines.find(candidate => candidate.id === formationDoctrineId);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard
        accent={
          encounter.difficulty === 'Boss'
            ? theme.colors.danger
            : encounter.difficulty === 'Elite'
              ? theme.colors.gold
              : factionAccent
        }
        faction={activeFaction}
        state={encounter.difficulty === 'Boss' ? 'danger' : 'default'}
      >
        <View style={styles.encounterHeader}>
          <View style={styles.encounterCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.danger }]}>BATTLE PREP</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{encounter.name}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {encounter.subtitle}
            </Text>
          </View>
          <StatusPill
            label={encounter.difficulty.toUpperCase()}
            tone={
              encounter.difficulty === 'Boss'
                ? 'boss'
                : encounter.difficulty === 'Elite'
                  ? 'elite'
                  : 'neutral'
            }
          />
        </View>
      </GameCard>

      <SectionTitle
        title="Enemy"
        trailing={
          settlementEffects.detailedIntel
            ? 'Command Network intel'
            : marcherIntel
              ? 'Verified Marcher intel'
              : loyalistIntel
                ? 'Loyalist intelligence'
                : mandateIntel
                  ? activeFactionMandate?.name ?? 'Faction intelligence'
                  : towerIntel
                ? 'Signal Tower intel'
                : scoutReport
                  ? 'Scouted'
                  : 'Partial intel'
        }
      />
      <GameCard>
        <View style={styles.enemyRow}>
          <View style={[styles.enemyMark, { borderColor: theme.colors.danger }]}>
            <EnemySprite enemyName={encounter.enemyName} size={48} />
          </View>
          <View style={styles.enemyCopy}>
            <Text style={[styles.enemyName, { color: theme.colors.text }]}>
              {encounter.enemyName}
            </Text>
            <Text style={[styles.enemyMeta, { color: theme.colors.textMuted }]}>
              {scoutReport
                ? encounter.enemyCount + ' enemies · ' + encounter.enemyHp + ' total HP · exact strength revealed'
                : 'Enemy strength partially concealed · formation and supplies recommended'}
            </Text>
            <Text style={[styles.enemyFormation, { color: theme.colors.danger }]}>
              {enemyShape.layout} · {enemyTactic.name}
            </Text>
            <Text style={[styles.enemyArmy, { color: theme.colors.gold }]}>
              {scoutReport
                ? enemyArmyProfile.name + ' · ' + enemyArmyProfile.pressureSummary
                : 'Army composition concealed'}
            </Text>
            <Text style={[styles.enemyTactic, { color: theme.colors.textMuted }]}>
              {scoutReport
                ? enemyTactic.summary + ' ATK ×' + enemyTactic.attackMultiplier.toFixed(2) + ' · ARM ×' + enemyTactic.armorMultiplier.toFixed(2) + ' · SPD ×' + enemyTactic.speedMultiplier.toFixed(2)
                : 'Formation identified. Scout intel reveals role mix, timing and exact modifiers.'}
            </Text>
            {scoutReport ? (
              <Text style={[styles.enemyComposition, { color: theme.colors.text }]}>
                {enemyComposition}
              </Text>
            ) : null}
          </View>
        </View>

        {!scoutReport && !towerIntel ? (
          <View style={styles.scoutButton}>
            <SecondaryButton
              label="Watch optional ad for Scout Report"
              disabled={(rewardedAdClaims.scout_report ?? 0) >= 2}
              onPress={() => void claimRewardedAd('scout_report')}
            />
          </View>
        ) : null}
      </GameCard>

      <SectionTitle
        title="Your formation"
        trailing={String(activeUnits.length) + ' / ' + String(activeSquadCap) + ' squads'}
      />
      <View style={styles.unitList}>
        {activeUnits.map(unit => (
          <GameCard key={unit.id} faction={unit.faction}>
            <View style={styles.unitRow}>
              <UnitPortrait
                name={unit.name}
                className={unit.className + ' · Lv. ' + unit.level}
                accent={factionAccent}
                faction={unit.faction}
                compact
              />
              <View style={styles.unitStats}>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ATK {unit.attack}</Text>
                <Text style={[styles.stat, { color: theme.colors.text }]}>ARM {unit.armor}</Text>
              </View>
            </View>
          </GameCard>
        ))}
      </View>

      <GameCard
        accent={formationFull ? theme.colors.gold : theme.colors.danger}
        faction={activeFaction}
        state={formationFull ? 'default' : 'danger'}
      >
        <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>ARMY PROFILE</Text>
        <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
          {formationFull ? 'Full field strength' : 'Underfilled formation'}
        </Text>
        <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
          {effectiveMaxHp} HP · {effectiveAttack} ATK · Avg ARM {combatProfile.averageArmor.toFixed(1)} · Avg SPD {(combatProfile.averageSpeed * readinessProfile.speedMultiplier).toFixed(1)}
        </Text>
        {!formationFull ? (
          <Text style={[styles.skillName, { color: theme.colors.danger }]}>
            Enemy pressure is tuned for {activeSquadCap} squads at this campaign tier. Fill the open slot or improve gear before committing.
          </Text>
        ) : null}
      </GameCard>

      <SectionTitle
        title="Quick formation switch"
        trailing={String(unlockedFormationShapes.length) + ' unlocked'}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.formationSwitchStrip}
      >
        {unlockedFormationShapes.map(shape => {
          const selected = shape.id === activeFormationShape.id;
          const preview = getFormationMatchup(
            shape.id,
            enemyShape.id
          );
          const previewColor =
            preview.result === 'advantage'
              ? theme.colors.primary
              : preview.result === 'disadvantage'
                ? theme.colors.danger
                : theme.colors.textMuted;

          return (
            <Pressable
              key={shape.id}
              disabled={selected}
              onPress={() => setFormationShape(shape.id)}
              style={({ pressed }) => [
                styles.formationSwitchCard,
                {
                  borderColor: selected
                    ? theme.colors.gold
                    : previewColor,
                  backgroundColor: selected
                    ? theme.colors.surface1
                    : theme.colors.surface2,
                  opacity: pressed ? 0.8 : 1
                }
              ]}
            >
              <View style={styles.formationSwitchHeader}>
                <Text
                  style={[
                    styles.formationSwitchLayout,
                    {
                      color: selected
                        ? theme.colors.gold
                        : factionAccent
                    }
                  ]}
                >
                  {shape.layout}
                </Text>
                <Pill
                  label={
                    selected
                      ? 'ACTIVE'
                      : preview.result === 'advantage'
                        ? 'EDGE'
                        : preview.result === 'disadvantage'
                          ? 'EXPOSED'
                          : 'NEUTRAL'
                  }
                  color={
                    selected
                      ? theme.colors.gold + '45'
                      : preview.result === 'advantage'
                        ? theme.colors.primary + '35'
                        : preview.result === 'disadvantage'
                          ? theme.colors.danger + '35'
                          : undefined
                  }
                />
              </View>
              <Text
                style={[
                  styles.formationSwitchName,
                  { color: theme.colors.text }
                ]}
                numberOfLines={1}
              >
                {shape.name}
              </Text>
              <Text
                style={[
                  styles.formationSwitchEffect,
                  { color: previewColor }
                ]}
              >
                dealt ×{preview.outgoingDamageMultiplier.toFixed(2)} · received ×{preview.incomingDamageMultiplier.toFixed(2)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={[styles.switchHint, { color: theme.colors.textMuted }]}>
        Switching here is immediate and saved. Squad slot assignments stay the same; only the formation geometry changes.
      </Text>

      <GameCard accent={theme.colors.gold} faction={activeFaction}>
        <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>ACTIVE ORDER</Text>
        <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
          {activeFormationShape.layout} · {activeFormationShape.name} · {doctrine?.name}
        </Text>
        <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
          Attack ×{formationAnalysis.attackMultiplier.toFixed(2)} · Armor ×{formationAnalysis.armorMultiplier.toFixed(2)} · Speed ×{formationAnalysis.speedMultiplier.toFixed(2)}
        </Text>
      </GameCard>

      <GameCard
        accent={
          formationMatchup.result === 'advantage'
            ? theme.colors.primary
            : formationMatchup.result === 'disadvantage'
              ? theme.colors.danger
              : theme.colors.gold
        }
        faction={activeFaction}
        state={formationMatchup.result === 'disadvantage' ? 'danger' : 'default'}
      >
        <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
          FORMATION MATCHUP
        </Text>
        <Text
          style={[
            styles.doctrineName,
            {
              color:
                formationMatchup.result === 'advantage'
                  ? theme.colors.primary
                  : formationMatchup.result === 'disadvantage'
                    ? theme.colors.danger
                    : theme.colors.text
            }
          ]}
        >
          {formationMatchup.title}
        </Text>
        <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
          {activeFormationShape.layout} {activeFormationShape.name} vs {enemyShape.layout} {enemyShape.name}
        </Text>
        <Text style={[styles.matchupSummary, { color: theme.colors.text }]}>
          {formationMatchup.summary}
        </Text>
        <Text style={[styles.matchupEffect, { color: theme.colors.gold }]}>
          Damage dealt ×{formationMatchup.outgoingDamageMultiplier.toFixed(2)} · Damage received ×{formationMatchup.incomingDamageMultiplier.toFixed(2)}
        </Text>
        {formationMatchup.result !== 'advantage' && unlockedCounters.length > 0 ? (
          <Text style={[styles.matchupHint, { color: theme.colors.textMuted }]}>
            Unlocked counters: {unlockedCounters.map(shape => shape.layout + ' ' + shape.name).join(' · ')}
          </Text>
        ) : null}
      </GameCard>

      {marcherDoctrineActive && activeMarcherWarningChoice ? (
        <GameCard accent={theme.colors.gold}>
          <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
            BORDER MARCH DOCTRINE
          </Text>
          <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
            {activeMarcherWarningChoice.name}
          </Text>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {activeMarcherWarningChoice.effectText}
          </Text>
        </GameCard>
      ) : null}

      {loyalistApproachActive && activeLastLoyalistsChoice ? (
        <GameCard accent={theme.colors.gold}>
          <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
            PRETENDER PREPARATION
          </Text>
          <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
            {activeLastLoyalistsChoice.name}
          </Text>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {activeLastLoyalistsChoice.effectText}
          </Text>
        </GameCard>
      ) : null}

      {activeFactionMandate ? (
        <GameCard accent={factionAccent} faction={activeFaction}>
          <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
            {activeFaction === 'elf' ? 'WORLDROOT ATTUNEMENT' : 'CLAN PACT'}
          </Text>
          <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
            {activeFactionMandate.name}
          </Text>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {activeFactionMandate.effectText}
          </Text>
        </GameCard>
      ) : null}

      {activeRoyalDecree ? (
        <GameCard accent={theme.colors.primary}>
          <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>
            ROYAL DECREE
          </Text>
          <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
            {activeRoyalDecree.name}
          </Text>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {activeRoyalDecree.effectText}
          </Text>
        </GameCard>
      ) : null}

      {activeCommanderPath ? (
        <GameCard accent={factionAccent} faction={activeFaction}>
          <View style={styles.commandHeader}>
            <View style={styles.commandCopy}>
              <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>COMMANDER</Text>
              <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
                {activeCommanderPath.name}
              </Text>
            </View>
            <Pill label={activeCommanderPath.skill.effectType.replace('_', ' ').toUpperCase()} />
          </View>
          <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
            {activeCommanderPath.passiveDescription}
          </Text>
          <Text style={[styles.skillName, { color: theme.colors.gold }]}>
            {activeCommanderPath.skill.name}: {activeCommanderPath.skill.description}
          </Text>
        </GameCard>
      ) : null}

      {formationBonuses.length > 0 ? (
        <>
          <SectionTitle title="Formation synergies" trailing={String(formationBonuses.length)} />
          <View style={styles.bonusList}>
            {formationBonuses.map(bonus => (
              <GameCard key={bonus.id} accent={theme.colors.primary}>
                <View style={styles.bonusHeader}>
                  <Text style={[styles.bonusName, { color: theme.colors.text }]}>{bonus.name}</Text>
                  <Text style={[styles.bonusValue, { color: theme.colors.primary }]}>{bonus.value}</Text>
                </View>
              </GameCard>
            ))}
          </View>
        </>
      ) : null}

      <SectionTitle title="Army readiness" trailing={String(armyReadiness) + '%'} />
      <GameCard
        faction={activeFaction}
        state={
          armyReadiness >= 70
            ? 'ready'
            : armyReadiness >= 50
              ? 'default'
              : 'danger'
        }
        accent={armyReadiness >= 70 ? factionAccent : theme.colors.gold}
      >
        <View style={styles.readinessHeader}>
          <View>
            <Text style={[styles.readinessTitle, { color: theme.colors.text }]}>
              {readinessProfile.label}
            </Text>
            <Text style={[styles.readinessHint, { color: theme.colors.textMuted }]}>
              {armyReadiness >= 70
                ? 'No combat penalty. You can keep campaigning without resupplying.'
                : 'Repeated fighting is now reducing combat effectiveness until the army rests.'}
            </Text>
          </View>
          <StatusPill
            label={armyReadiness >= 70 ? 'FULL EFFECT' : 'FATIGUED'}
            tone={armyReadiness >= 70 ? 'ready' : armyReadiness >= 50 ? 'available' : 'elite'}
          />
        </View>
        <ProgressBar
          value={armyReadiness / 100}
          color={armyReadiness >= 70 ? factionAccent : theme.colors.gold}
        />
        {armyReadiness < 70 ? (
          <Text style={[styles.readinessPenalty, { color: theme.colors.gold }]}>
            Current effect · HP ×{readinessProfile.hpMultiplier.toFixed(2)} · ATK ×{readinessProfile.attackMultiplier.toFixed(2)} · SPD ×{readinessProfile.speedMultiplier.toFixed(2)}
          </Text>
        ) : null}
        {armyReadiness < 100 ? (
          <View style={styles.resupplyButton}>
            <SecondaryButton
              label={
                resources.provisions >= armyResupplyCost
                  ? 'Rest & Resupply · ' + armyResupplyCost + ' provisions'
                  : 'Need ' + armyResupplyCost + ' provisions to fully recover'
              }
              disabled={resources.provisions < armyResupplyCost}
              onPress={restAndResupplyArmy}
            />
          </View>
        ) : null}
      </GameCard>

      <SectionTitle title="Readiness" />
      <GameCard
        faction={activeFaction}
        state={formationFull && hasFood && hasMedicine ? 'ready' : !formationFull || !hasFood ? 'danger' : 'default'}
      >
        <View style={styles.readinessHeader}>
          <Text style={[styles.readinessTitle, { color: theme.colors.text }]}>Campaign supplies</Text>
          <StatusPill
            label={
              !formationFull
                ? 'SQUAD MISSING'
                : hasFood && hasMedicine
                  ? 'READY'
                  : !hasFood
                    ? 'FOOD MISSING'
                    : 'PARTIAL'
            }
            tone={formationFull && hasFood && hasMedicine ? 'ready' : !formationFull || !hasFood ? 'elite' : 'available'}
          />
        </View>
        <View style={styles.readinessList}>
          <View style={styles.readinessRow}>
            <StatusPill label={formationFull ? 'FULL' : 'UNDER'} tone={formationFull ? 'done' : 'elite'} />
            <Text style={[styles.readinessText, { color: theme.colors.text }]}>
              Formation · {activeUnits.length}/{activeSquadCap} squads
            </Text>
          </View>
          <View style={styles.readinessRow}>
            <StatusPill label={hasFood ? 'PACKED' : 'MISSING'} tone={hasFood ? 'done' : 'elite'} />
            <Text style={[styles.readinessText, { color: theme.colors.text }]}>Food</Text>
          </View>
          <View style={styles.readinessRow}>
            <StatusPill label={hasMedicine ? 'PACKED' : 'OPTIONAL'} tone={hasMedicine ? 'done' : 'available'} />
            <Text style={[styles.readinessText, { color: theme.colors.text }]}>Medicine</Text>
          </View>
        </View>
      </GameCard>

      {rewardedAdMessage ? (
        <Text style={[styles.adMessage, { color: theme.colors.textMuted }]}>{rewardedAdMessage}</Text>
      ) : null}

      <PrimaryButton label="Begin Battle" onPress={onBegin} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 30, gap: 14 },
  encounterHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  encounterCopy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 26, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 6 },
  enemyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  enemyMark: { width: 58, height: 64, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  enemyCopy: { flex: 1 },
  enemyName: { fontSize: 16, fontWeight: '900' },
  enemyMeta: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  enemyFormation: { fontSize: 11, fontWeight: '900', marginTop: 7 },
  enemyArmy: { fontSize: 10.5, fontWeight: '900', marginTop: 4 },
  enemyTactic: { fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  enemyComposition: { fontSize: 9.5, lineHeight: 14, marginTop: 5, fontWeight: '800' },
  scoutButton: { marginTop: 12 },
  unitList: { gap: 8 },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitStats: { alignItems: 'flex-end', gap: 3 },
  stat: { fontSize: 10, fontWeight: '800' },
  doctrineLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  doctrineName: { fontSize: 16, fontWeight: '900', marginTop: 3 },
  doctrineBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  matchupSummary: { fontSize: 11, lineHeight: 16, marginTop: 8, fontWeight: '700' },
  matchupEffect: { fontSize: 10, lineHeight: 15, marginTop: 7, fontWeight: '900' },
  matchupHint: { fontSize: 9.5, lineHeight: 14, marginTop: 7 },
  formationSwitchStrip: { gap: 8, paddingRight: 4 },
  formationSwitchCard: {
    width: 154,
    minHeight: 92,
    borderRadius: 15,
    borderWidth: 1.5,
    padding: 10
  },
  formationSwitchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7
  },
  formationSwitchLayout: { fontSize: 15, fontWeight: '900' },
  formationSwitchName: { fontSize: 11.5, fontWeight: '900', marginTop: 8 },
  formationSwitchEffect: { fontSize: 8.8, fontWeight: '900', marginTop: 6 },
  switchHint: { fontSize: 9.5, lineHeight: 14, textAlign: 'center', paddingHorizontal: 10 },
  commandHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  commandCopy: { flex: 1 },
  skillName: { fontSize: 10.5, lineHeight: 16, marginTop: 8, fontWeight: '800' },
  bonusList: { gap: 7 },
  bonusHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  bonusName: { fontSize: 12, fontWeight: '900' },
  bonusValue: { fontSize: 10, fontWeight: '900' },
  readinessHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  readinessTitle: { fontSize: 14, fontWeight: '900' },
  readinessList: { gap: 10 },
  readinessRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  readinessText: { fontSize: 13, fontWeight: '700' },
  readinessHint: { fontSize: 10.5, lineHeight: 15, marginTop: 3, maxWidth: 250 },
  readinessPenalty: { fontSize: 10, lineHeight: 15, fontWeight: '900', marginTop: 9 },
  resupplyButton: { marginTop: 11 },
  adMessage: { fontSize: 10, textAlign: 'center' }
});
