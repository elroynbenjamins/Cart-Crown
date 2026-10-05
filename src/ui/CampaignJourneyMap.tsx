import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import type { FactionId } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';

export type CampaignJourneyPoint = {
  id: string;
  name: string;
  status: 'done' | 'current' | 'available' | 'locked';
  detail?: string;
};

const mapSources: Record<FactionId, ImageSourcePropType> = {
  human: require('../../assets/game/scenes/human/campaign_map.png'),
  elf: require('../../assets/game/scenes/elf/campaign_map.png'),
  orc: require('../../assets/game/scenes/orc/campaign_map.png')
};

const statusLabels: Record<CampaignJourneyPoint['status'], string> = {
  done: 'CLEARED',
  current: 'CURRENT',
  available: 'AVAILABLE',
  locked: 'LOCKED'
};

export function CampaignJourneyMap({
  faction,
  accent,
  points
}: {
  faction: FactionId;
  accent: string;
  points: CampaignJourneyPoint[];
}) {
  const { theme } = useGameTheme();
  const defaultId =
    points.find(point => point.status === 'current')?.id ??
    [...points].reverse().find(point => point.status === 'done')?.id ??
    points[0]?.id ??
    '';
  const [selectedId, setSelectedId] = useState(defaultId);

  useEffect(() => {
    if (!points.some(point => point.id === selectedId)) {
      setSelectedId(defaultId);
    }
  }, [defaultId, points, selectedId]);

  const selected =
    points.find(point => point.id === selectedId) ??
    points.find(point => point.status === 'current') ??
    points[0];

  const markerPoints = useMemo(() => points.slice(0, 6), [points]);

  return (
    <View
      style={[
        styles.shell,
        {
          borderColor: accent,
          backgroundColor: theme.colors.surface1
        }
      ]}
    >
      <View style={styles.map}>
        <Image
          source={mapSources[faction]}
          resizeMode="cover"
          style={styles.art}
          accessible={false}
        />
        <View
          pointerEvents="none"
          style={[
            styles.artShade,
            { backgroundColor: theme.colors.surface1 + '32' }
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.routeLine,
            { backgroundColor: theme.colors.border }
          ]}
        />
        <View style={styles.markerRow}>
          {markerPoints.map((point, index) => {
            const chosen = point.id === selected?.id;
            const active = point.status === 'current';
            const done = point.status === 'done';
            const markerColor = active
              ? theme.colors.gold
              : done
                ? theme.colors.primary
                : point.status === 'available'
                  ? accent
                  : theme.colors.border;

            return (
              <Pressable
                key={point.id}
                accessibilityRole="button"
                accessibilityLabel={
                  point.name + ', ' + statusLabels[point.status].toLowerCase()
                }
                accessibilityState={{ selected: chosen }}
                onPress={() => setSelectedId(point.id)}
                style={({ pressed }) => [
                  styles.markerTouch,
                  {
                    opacity: pressed ? 0.72 : point.status === 'locked' ? 0.72 : 1
                  }
                ]}
              >
                <View
                  style={[
                    styles.markerRing,
                    {
                      borderColor: chosen ? theme.colors.gold : markerColor,
                      backgroundColor: theme.colors.surface1 + 'E8',
                      transform: [{ scale: active ? 1.08 : 1 }]
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.markerCore,
                      {
                        backgroundColor: markerColor
                      }
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.markerNumber,
                    {
                      color: chosen
                        ? theme.colors.gold
                        : theme.colors.text
                    }
                  ]}
                >
                  {index + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selected ? (
        <View
          style={[
            styles.inspector,
            { borderTopColor: theme.colors.border }
          ]}
        >
          <View style={styles.inspectorCopy}>
            <Text
              style={[styles.pointName, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {selected.name}
            </Text>
            <Text
              style={[styles.pointDetail, { color: theme.colors.textMuted }]}
              numberOfLines={2}
            >
              {selected.detail ?? 'Campaign route'}
            </Text>
          </View>
          <View
            style={[
              styles.status,
              {
                borderColor:
                  selected.status === 'current'
                    ? theme.colors.gold
                    : selected.status === 'done'
                      ? theme.colors.primary
                      : accent,
                backgroundColor: theme.colors.surface2
              }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    selected.status === 'current'
                      ? theme.colors.gold
                      : selected.status === 'done'
                        ? theme.colors.primary
                        : selected.status === 'locked'
                          ? theme.colors.textMuted
                          : accent
                }
              ]}
            >
              {statusLabels[selected.status]}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden'
  },
  map: {
    height: 172,
    position: 'relative',
    overflow: 'hidden'
  },
  art: {
    ...StyleSheet.absoluteFillObject
  },
  artShade: {
    ...StyleSheet.absoluteFillObject
  },
  routeLine: {
    position: 'absolute',
    left: 34,
    right: 34,
    bottom: 45,
    height: 4,
    borderRadius: 2,
    opacity: 0.9
  },
  markerRow: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  markerTouch: {
    width: 48,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerRing: {
    width: 28,
    height: 28,
    borderWidth: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerCore: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  markerNumber: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '900'
  },
  inspector: {
    minHeight: 68,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  inspectorCopy: {
    flex: 1,
    minWidth: 0
  },
  pointName: {
    fontSize: 13,
    fontWeight: '900'
  },
  pointDetail: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700'
  },
  status: {
    minHeight: 30,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.55
  }
});
