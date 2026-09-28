import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { starterWagonItems } from '../game/data';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, SectionTitle } from '../ui/components';

const gridSize = 4;

export function WagonScreen() {
  const { width } = useWindowDimensions();
  const { theme } = useGameTheme();
  const boardWidth = Math.min(width - 32, 420);
  const gap = 5;
  const cell = Math.floor((boardWidth - gap * (gridSize - 1)) / gridSize);
  const occupied = starterWagonItems.reduce((sum, item) => sum + item.width * item.height, 0);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>SUPPLY WAGON</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Camp Frame · 4×4</Text>
          </View>
          <Pill label={String(occupied) + ' / 16 cells'} />
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Pack logistics here. Swords, armor and mounts stay assigned to their squads.
        </Text>
      </GameCard>

      <View style={styles.boardWrap}>
        <View
          style={[
            styles.board,
            {
              width: cell * gridSize + gap * (gridSize - 1),
              height: cell * gridSize + gap * (gridSize - 1)
            }
          ]}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            return (
              <View
                key={index}
                style={[
                  styles.cell,
                  {
                    left: x * (cell + gap),
                    top: y * (cell + gap),
                    width: cell,
                    height: cell,
                    backgroundColor: theme.colors.surface1,
                    borderColor: theme.colors.border
                  }
                ]}
              />
            );
          })}

          {starterWagonItems.map((item, index) => {
            const palette = [
              theme.colors.gold,
              theme.colors.primary,
              theme.colors.human,
              theme.colors.info
            ];
            const accent = palette[index % palette.length] ?? theme.colors.primary;

            return (
              <View
                key={item.id}
                style={[
                  styles.item,
                  {
                    left: item.x * (cell + gap),
                    top: item.y * (cell + gap),
                    width: item.width * cell + (item.width - 1) * gap,
                    height: item.height * cell + (item.height - 1) * gap,
                    backgroundColor: theme.colors.surface2,
                    borderColor: accent
                  }
                ]}
              >
                <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>
                  {item.shortName}
                </Text>
                <Text style={[styles.itemEffect, { color: accent }]} numberOfLines={2}>
                  {item.effect}
                </Text>
                <Text style={[styles.itemSize, { color: theme.colors.textMuted }]}>
                  {item.width}×{item.height}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <GameCard>
        <View style={styles.readinessRow}>
          <View style={styles.readinessCopy}>
            <Text style={[styles.readyTitle, { color: theme.colors.text }]}>Expedition readiness</Text>
            <Text style={[styles.readyBody, { color: theme.colors.textMuted }]}>
              Food and medicine are packed. No ammunition is required by the current formation.
            </Text>
          </View>
          <View style={[styles.readyDot, { backgroundColor: theme.colors.primary }]} />
        </View>
      </GameCard>

      <SectionTitle title="Active synergies" trailing="1 discovered" />

      <GameCard accent={theme.colors.primary}>
        <Text style={[styles.synergyName, { color: theme.colors.text }]}>Prepared March</Text>
        <Text style={[styles.synergyBody, { color: theme.colors.textMuted }]}>
          Medicine packed beside food improves healing effectiveness.
        </Text>
        <Text style={[styles.synergyBonus, { color: theme.colors.primary }]}>+10% healing power</Text>
      </GameCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start'
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8
  },
  boardWrap: {
    alignItems: 'center',
    paddingVertical: 4
  },
  board: {
    position: 'relative'
  },
  cell: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 14
  },
  item: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 14,
    padding: 7,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemName: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '900'
  },
  itemEffect: {
    textAlign: 'center',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '800',
    marginTop: 3
  },
  itemSize: {
    position: 'absolute',
    right: 6,
    bottom: 4,
    fontSize: 7,
    fontWeight: '900'
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  readinessCopy: {
    flex: 1
  },
  readyTitle: {
    fontSize: 15,
    fontWeight: '900'
  },
  readyBody: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  readyDot: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  synergyName: {
    fontSize: 15,
    fontWeight: '900'
  },
  synergyBody: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5
  },
  synergyBonus: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 9
  }
});
