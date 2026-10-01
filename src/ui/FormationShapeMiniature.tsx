import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { FormationShapeDefinition } from '../game/types';

export function FormationShapeMiniature({
  shape,
  accent,
  muted,
  facing = 'neutral',
  compact = false
}: {
  shape: FormationShapeDefinition;
  accent: string;
  muted: string;
  facing?: 'up' | 'down' | 'neutral';
  compact?: boolean;
}) {
  const rows =
    facing === 'down'
      ? [shape.rows.rear, shape.rows.middle, shape.rows.front]
      : [shape.rows.front, shape.rows.middle, shape.rows.rear];

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.root,
        compact && styles.rootCompact
      ]}
    >
      {rows.map((slots, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {slots.length > 0 ? (
            slots.map(slot => (
              <View
                key={slot}
                style={[
                  styles.dot,
                  compact && styles.dotCompact,
                  {
                    backgroundColor: accent,
                    opacity: 1 - rowIndex * 0.16
                  }
                ]}
              />
            ))
          ) : (
            <View
              style={[
                styles.empty,
                compact && styles.emptyCompact,
                { backgroundColor: muted }
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 34,
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rootCompact: {
    height: 28,
    gap: 2
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
  dotCompact: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  empty: {
    width: 18,
    height: 1.5,
    borderRadius: 2,
    opacity: 0.7
  },
  emptyCompact: {
    width: 15
  }
});
