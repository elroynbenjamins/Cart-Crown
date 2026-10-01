import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { FormationShapeDefinition } from '../game/types';

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
  const rows = side === 'enemy'
    ? [
        { key: 'rear', slots: shape.rows.rear },
        { key: 'middle', slots: shape.rows.middle },
        { key: 'front', slots: shape.rows.front }
      ]
    : [
        { key: 'front', slots: shape.rows.front },
        { key: 'middle', slots: shape.rows.middle },
        { key: 'rear', slots: shape.rows.rear }
      ];

  return (
    <View style={styles.card}>
      <Text style={[styles.label, { color: muted }]}>{label}</Text>
      <Text style={[styles.layout, { color: accent }]}>{shape.layout}</Text>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={styles.rows}
      >
        {rows.map(row => (
          <View key={row.key} style={styles.row}>
            {row.slots.length > 0 ? (
              row.slots.map(slot => (
                <View
                  key={slot}
                  style={[
                    styles.dot,
                    { backgroundColor: accent }
                  ]}
                />
              ))
            ) : (
              <View
                style={[
                  styles.empty,
                  { backgroundColor: muted }
                ]}
              />
            )}
          </View>
        ))}
      </View>
      <Text
        numberOfLines={1}
        style={[styles.name, { color: muted }]}
      >
        {shape.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 0,
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 5
  },
  label: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1
  },
  layout: {
    fontSize: 14,
    fontWeight: '900'
  },
  rows: {
    height: 31,
    justifyContent: 'center',
    gap: 3
  },
  row: {
    minHeight: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  empty: {
    width: 18,
    height: 1.5,
    borderRadius: 2,
    opacity: 0.7
  },
  name: {
    maxWidth: '100%',
    fontSize: 7.5,
    fontWeight: '800'
  }
});
