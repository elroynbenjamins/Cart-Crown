import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEncounter } from '../game/encounters';
import type { EncounterId } from '../game/encounters';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import {
  GameCard,
  Pill,
  PrimaryButton,
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
    units,
    formation,
    wagonItems,
    formationBonuses,
    formationAnalysis,
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

      <SectionTitle title="Your formation" trailing={String(activeUnits.length) + ' squads'} />
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

      <GameCard accent={theme.colors.gold} faction={activeFaction}>
        <Text style={[styles.doctrineLabel, { color: theme.colors.textMuted }]}>ACTIVE ORDER</Text>
        <Text style={[styles.doctrineName, { color: theme.colors.text }]}>{doctrine?.name}</Text>
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

      <SectionTitle title="Readiness" />
      <GameCard
        faction={activeFaction}
        state={hasFood && hasMedicine ? 'ready' : !hasFood ? 'danger' : 'default'}
      >
        <View style={styles.readinessHeader}>
          <Text style={[styles.readinessTitle, { color: theme.colors.text }]}>Campaign supplies</Text>
          <StatusPill
            label={hasFood && hasMedicine ? 'READY' : !hasFood ? 'FOOD MISSING' : 'PARTIAL'}
            tone={hasFood && hasMedicine ? 'ready' : !hasFood ? 'elite' : 'available'}
          />
        </View>
        <View style={styles.readinessList}>
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
  adMessage: { fontSize: 10, textAlign: 'center' }
});
