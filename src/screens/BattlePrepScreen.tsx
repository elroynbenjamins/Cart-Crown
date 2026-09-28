import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEncounter, getEnemyFormationTactic } from '../game/encounters';
import { getFormationShape } from '../game/formation';
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
    activeFormationShape,
    activeSquadCap,
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
            <Text style={[styles.enemyTactic, { color: theme.colors.textMuted }]}>
              {scoutReport
                ? enemyTactic.summary + ' ATK ×' + enemyTactic.attackMultiplier.toFixed(2) + ' · ARM ×' + enemyTactic.armorMultiplier.toFixed(2) + ' · SPD ×' + enemyTactic.speedMultiplier.toFixed(2)
                : 'Formation identified. Scout intel reveals its exact combat modifiers.'}
            </Text>
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

      <GameCard accent={theme.colors.gold} faction={activeFaction}>
        <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>ACTIVE ORDER</Text>
        <Text style={[styles.doctrineName, { color: theme.colors.text }]}>
          {activeFormationShape.layout} · {activeFormationShape.name} · {doctrine?.name}
        </Text>
        <Text style={[styles.doctrineBody, { color: theme.colors.textMuted }]}>
          Attack ×{formationAnalysis.attackMultiplier.toFixed(2)} · Armor ×{formationAnalysis.armorMultiplier.toFixed(2)} · Speed ×{formationAnalysis.speedMultiplier.toFixed(2)}
        </Text>
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
  enemyTactic: { fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  scoutButton: { marginTop: 12 },
  unitList: { gap: 8 },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitStats: { alignItems: 'flex-end', gap: 3 },
  stat: { fontSize: 10, fontWeight: '800' },
  doctrineLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  doctrineName: { fontSize: 16, fontWeight: '900', marginTop: 3 },
  doctrineBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
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
