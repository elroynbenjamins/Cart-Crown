import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { FormationShapeDefinition } from '../game/types';
import { getFormationMiniatureRows } from './formationMiniatureModel';

/**
 * Read-only tactical battlefield miniatures. The rows mirror exactly as the
 * real encounter does: player front nearest the top and enemy front nearest
 * the bottom. This stays decorative; saved formations and damage are unchanged.
 */
export function FormationMiniature({
  shape,
  side,
  accent,
  muted,
  label
}: {
  shape: FormationShapeDefinition;
  side: 'ally' | 'enemy';
  accent: string;
  muted: string;
  label: string;
}) {
  const rows = getFormationMiniatureRows(shape, side);
  const direction = side === 'ally' ? '▲' : '▼';
  const accessibilitySummary = label + ', ' + shape.name + ', ' + shape.layout
    + '. Front rank ' + shape.rows.front.length
    + ', middle rank ' + shape.rows.middle.length
    + ', rear rank ' + shape.rows.rear.length + '.';

  return (
    <View
      testID={'formation-miniature-' + side}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilitySummary}
      style={[styles.card, { borderColor: accent + '55', backgroundColor: accent + '0D' }]}
    >
      <View style={styles.topLine} accessible={false} importantForAccessibility="no-hide-descendants">
        <View style={[styles.factionPip, { backgroundColor: accent }]} />
        <Text style={[styles.label, { color: muted }]} numberOfLines={1}>{label}</Text>
        <Text style={[styles.direction, { color: accent }]}>{direction}</Text>
      </View>
      <Text style={[styles.layout, { color: accent }]}>{shape.layout}</Text>
      <View
        testID={'formation-miniature-rows-' + side}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={styles.rows}
      >
        {rows.map((row, index) => (
          <View
            key={row.key}
            testID={'formation-miniature-' + side + '-' + row.key}
            style={[
              styles.rankPlate,
              {
                borderColor: row.key === 'front' ? accent + '88' : accent + '33',
                backgroundColor: row.key === 'front' ? accent + '1F' : accent + '0B'
              }
            ]}
          >
            <Text style={[styles.rankName, { color: muted }]}>
              {row.key === 'front' ? 'F' : row.key === 'middle' ? 'M' : 'R'}
            </Text>
            <View style={styles.rank}>
              {row.slots.length > 0 ? (
                row.slots.map(slot => (
                  <View
                    key={slot}
                    style={[
                      styles.troop,
                      row.key === 'front' ? styles.frontTroop : undefined,
                      {
                        backgroundColor: accent,
                        borderColor: row.key === 'front' ? muted : accent,
                        opacity: index === 1 ? .84 : .96
                      }
                    ]}
                  >
                    <View style={styles.troopGlint} />
                  </View>
                ))
              ) : (
                <View style={[styles.empty, { backgroundColor: muted }]} />
              )}
            </View>
          </View>
        ))}
      </View>
      <Text numberOfLines={1} style={[styles.name, { color: muted }]}>{shape.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 0, flex: 1, alignItems: 'center', gap: 3,
    paddingHorizontal: 5, paddingVertical: 7, borderWidth: 1, borderRadius: 9
  },
  topLine: { width: '100%', flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center', minHeight: 10 },
  factionPip: { width: 5, height: 5, borderRadius: 1 },
  label: { flexShrink: 1, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  direction: { fontSize: 9, fontWeight: '900' },
  layout: { fontSize: 15, lineHeight: 18, fontWeight: '900', letterSpacing: .3 },
  rows: { gap: 2, width: '100%', maxWidth: 105, paddingHorizontal: 2, paddingVertical: 2 },
  rankPlate: {
    minHeight: 14, borderWidth: .6, borderRadius: 3,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 3
  },
  rankName: { fontSize: 7, fontWeight: '900', width: 9, opacity: .9 },
  rank: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 11 },
  troop: {
    width: 8, height: 8, borderWidth: .8,
    borderTopLeftRadius: 3, borderTopRightRadius: 3,
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
    alignItems: 'center', justifyContent: 'flex-start'
  },
  frontTroop: { width: 9, height: 9 },
  troopGlint: { width: '55%', height: 2, marginTop: .8, backgroundColor: '#FFFFFF77', borderRadius: 1 },
  empty: { width: 18, height: 1.5, borderRadius: 2, opacity: .45 },
  name: { maxWidth: '100%', fontSize: 8, fontWeight: '800', lineHeight: 11 }
});
