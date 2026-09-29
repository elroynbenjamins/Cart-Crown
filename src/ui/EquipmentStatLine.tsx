import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { EquipmentDefinition } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { signedStat } from './decisionPresentation';
import { StatValue } from './SemanticUI';

type Bonuses = Pick<EquipmentDefinition, 'attackBonus' | 'armorBonus' | 'speedBonus'>;

/** Item bonuses by default; pass an equipped item to show only the change versus that item. */
export function EquipmentStatLine({ item, current, label = 'Item bonuses' }: {
  item: Bonuses; current?: Bonuses; label?: string;
}) {
  const { theme } = useGameTheme();
  const values = [
    { label: 'Attack', value: item.attackBonus - (current?.attackBonus ?? 0) },
    { label: 'Armor', value: item.armorBonus - (current?.armorBonus ?? 0) },
    { label: 'Speed', value: item.speedBonus - (current?.speedBonus ?? 0) }
  ];
  return (
    <View style={styles.block}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <View style={styles.values}>
        {values.map(stat => (
          <Text key={stat.label} style={[styles.stat, { color: theme.colors.textMuted }]}>
            {stat.label}{' '}<StatValue value={signedStat(stat.value)} presentation="delta" />
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 3, marginTop: 7 },
  label: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  values: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { fontSize: 12, lineHeight: 18 }
});
