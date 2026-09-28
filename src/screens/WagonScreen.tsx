import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';
import type { WagonItemDefinition } from '../game/types';
import { factions } from '../game/factions';
import { useGame } from '../game/GameProvider';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, SecondaryButton, SectionTitle, StatusPill } from '../ui/components';
import { WagonItemSprite, WagonStageSprite } from '../ui/gameArt';

type DraggableItemProps = {
  item: WagonItemDefinition;
  cell: number;
  gap: number;
  accent: string;
  selected: boolean;
  onSelect: (itemId: string) => void;
  onMove: (itemId: string, x: number, y: number) => void;
};

function DraggableItem({
  item,
  cell,
  gap,
  accent,
  selected,
  onSelect,
  onMove
}: DraggableItemProps) {
  const { theme } = useGameTheme();
  const drag = useRef(new Animated.ValueXY()).current;
  const displayWidth = item.rotation === 90 ? item.height : item.width;
  const displayHeight = item.rotation === 90 ? item.width : item.height;
  const iconSize = Math.max(18, Math.min(32, cell * 0.52));

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          onSelect(item.id);
        },
        onPanResponderMove: (_, gesture) => {
          drag.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          const x = item.x + Math.round(gesture.dx / (cell + gap));
          const y = item.y + Math.round(gesture.dy / (cell + gap));
          drag.setValue({ x: 0, y: 0 });
          onMove(item.id, x, y);
        },
        onPanResponderTerminate: () => {
          drag.setValue({ x: 0, y: 0 });
        }
      }),
    [cell, drag, gap, item.id, item.x, item.y, onMove, onSelect]
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.item,
        {
          left: item.x * (cell + gap),
          top: item.y * (cell + gap),
          width: displayWidth * cell + (displayWidth - 1) * gap,
          height: displayHeight * cell + (displayHeight - 1) * gap,
          backgroundColor: theme.colors.surface2,
          borderColor: selected ? theme.colors.gold : accent,
          borderWidth: selected ? 4 : 2,
          transform: drag.getTranslateTransform(),
          zIndex: selected ? 4 : 2
        }
      ]}
    >
      <WagonItemSprite itemId={item.id} size={iconSize} />
      <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>
        {item.shortName}
      </Text>
      <Text style={[styles.itemEffect, { color: accent }]} numberOfLines={2}>
        {item.effect}
      </Text>
      <Text style={[styles.itemSize, { color: theme.colors.textMuted }]}>
        {displayWidth}×{displayHeight}
      </Text>
    </Animated.View>
  );
}

export function WagonScreen() {
  const { width } = useWindowDimensions();
  const { theme } = useGameTheme();
  const {
    activeFaction,
    wagonItems,
    currentWagonStage,
    moveWagonItem,
    rotateWagonItem,
    resetWagon
  } = useGame();

  const faction = factions[activeFaction];
  const factionAccent =
    activeFaction === 'elf'
      ? theme.colors.elf
      : activeFaction === 'orc'
        ? theme.colors.orc
        : theme.colors.human;

  const [selectedId, setSelectedId] = useState<string | null>(wagonItems[0]?.id ?? null);
  const [feedback, setFeedback] = useState('Drag an item to move it. Select it to rotate.');

  const boardWidth = Math.min(width - 32, 420);
  const gap = 5;
  const cell = Math.floor(
    (boardWidth - gap * (currentWagonStage.width - 1)) / currentWagonStage.width
  );
  const boardHeight =
    cell * currentWagonStage.height + gap * (currentWagonStage.height - 1);
  const occupied = wagonItems.reduce((sum, item) => sum + item.width * item.height, 0);
  const selected = wagonItems.find(item => item.id === selectedId) ?? null;

  const palette = [
    theme.colors.gold,
    theme.colors.primary,
    factionAccent,
    theme.colors.info
  ];

  const handleMove = (itemId: string, x: number, y: number) => {
    const ok = moveWagonItem(itemId, x, y);
    setFeedback(ok ? 'Item moved.' : 'That item does not fit there.');
  };

  const rotateSelected = () => {
    if (!selected) {
      return;
    }
    const ok = rotateWagonItem(selected.id);
    setFeedback(ok ? 'Item rotated.' : 'No valid rotation fits in that position.');
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={factionAccent} faction={activeFaction}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: factionAccent }]}>CAMPAIGN PACK</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {faction.wagonName} · {currentWagonStage.width}×{currentWagonStage.height}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Your logistics frame grows with the {faction.name} campaign. Early tiers stay deliberately cramped; later settlement tiers add real packing space.
            </Text>
          </View>
          <View style={styles.wagonVisual}>
            <WagonStageSprite stageId={currentWagonStage.id} faction={activeFaction} size={74} />
            <Pill
              label={String(occupied) + ' / ' + String(currentWagonStage.width * currentWagonStage.height)}
            />
          </View>
        </View>
      </GameCard>

      <View style={styles.boardWrap}>
        <View
          style={[
            styles.board,
            {
              width: cell * currentWagonStage.width + gap * (currentWagonStage.width - 1),
              height: boardHeight
            }
          ]}
        >
          {Array.from({ length: currentWagonStage.width * currentWagonStage.height }).map((_, index) => {
            const x = index % currentWagonStage.width;
            const y = Math.floor(index / currentWagonStage.width);

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

          {wagonItems.map((item, index) => (
            <DraggableItem
              key={item.id}
              item={item}
              cell={cell}
              gap={gap}
              accent={palette[index % palette.length] ?? theme.colors.primary}
              selected={item.id === selectedId}
              onSelect={setSelectedId}
              onMove={handleMove}
            />
          ))}
        </View>
      </View>

      <GameCard
        accent={selected ? theme.colors.gold : undefined}
        faction={activeFaction}
        state={selected ? 'selected' : 'default'}
      >
        <Text style={[styles.selectionLabel, { color: theme.colors.textMuted }]}>
          {selected ? 'SELECTED ITEM' : 'WAGON CONTROL'}
        </Text>
        <Text style={[styles.selectionName, { color: theme.colors.text }]}>
          {selected ? selected.name : 'No item selected'}
        </Text>
        <Text style={[styles.feedback, { color: theme.colors.textMuted }]}>{feedback}</Text>
        <View style={styles.controls}>
          <View style={styles.control}>
            <SecondaryButton
              label="Rotate"
              onPress={rotateSelected}
              disabled={!selected || selected.width === selected.height}
            />
          </View>
          <View style={styles.control}>
            <SecondaryButton
              label="Reset layout"
              onPress={() => {
                resetWagon();
                setFeedback('Starter layout restored.');
              }}
            />
          </View>
        </View>
      </GameCard>

      <GameCard faction={activeFaction} state="ready">
        <View style={styles.readinessRow}>
          <View style={styles.readinessCopy}>
            <Text style={[styles.readyTitle, { color: theme.colors.text }]}>Expedition readiness</Text>
            <Text style={[styles.readyBody, { color: theme.colors.textMuted }]}>
              Food and medicine are packed. No ammunition is required by the current formation.
            </Text>
          </View>
          <StatusPill label="READY" tone="ready" />
        </View>
      </GameCard>

      <SectionTitle title="Active synergies" trailing="1 discovered" />

      <GameCard accent={theme.colors.primary} faction={activeFaction} state="ready">
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
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  headerCopy: { flex: 1 },
  wagonVisual: { alignItems: 'center', gap: 4 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  title: { fontSize: 21, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 8 },
  boardWrap: { alignItems: 'center', paddingVertical: 4 },
  board: { position: 'relative' },
  cell: { position: 'absolute', borderWidth: 1, borderRadius: 14 },
  item: {
    position: 'absolute',
    borderRadius: 14,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemName: { textAlign: 'center', fontSize: 10.5, lineHeight: 12, fontWeight: '900', marginTop: 1 },
  itemEffect: { textAlign: 'center', fontSize: 8, lineHeight: 10, fontWeight: '800', marginTop: 3 },
  itemSize: { position: 'absolute', right: 6, bottom: 4, fontSize: 7, fontWeight: '900' },
  selectionLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  selectionName: { fontSize: 16, fontWeight: '900', marginTop: 4 },
  feedback: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  controls: { flexDirection: 'row', gap: 8, marginTop: 12 },
  control: { flex: 1 },
  readinessRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  readinessCopy: { flex: 1 },
  readyTitle: { fontSize: 15, fontWeight: '900' },
  readyBody: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  synergyName: { fontSize: 15, fontWeight: '900' },
  synergyBody: { fontSize: 12, lineHeight: 17, marginTop: 5 },
  synergyBonus: { fontSize: 12, fontWeight: '900', marginTop: 9 }
});
