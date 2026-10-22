import React, { useMemo, useState } from 'react';
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
import { activeJourneyPointId } from './campaignJourneySelection';

export type CampaignJourneyPoint = {
  id: string;
  name: string;
  status: 'done' | 'current' | 'available' | 'locked';
  detail?: string;
};

const mapSources: Record<FactionId, ImageSourcePropType> = {
  human: require('../../assets/game/scenes/human/camp.png'),
  elf: require('../../assets/game/scenes/elf/camp.png'),
  orc: require('../../assets/game/scenes/orc/camp.png')
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
  points,
  regionArtwork
}: {
  faction: FactionId;
  accent: string;
  points: CampaignJourneyPoint[];
  regionArtwork?: ImageSourcePropType;
}) {
  const { theme } = useGameTheme();
  const defaultId =
    points.find(point => point.status === 'current')?.id ??
    [...points].reverse().find(point => point.status === 'done')?.id ??
    points[0]?.id ??
    '';
  // A manual inspection is local to the current front. Advancing to a new
  // region automatically focuses the new front, never a previously selected pin.
  const [inspection, setInspection] = useState<{ frontId: string; pointId: string } | null>(null);
  const selectedId = activeJourneyPointId(defaultId, points, inspection);
  const selected = points.find(point => point.id === selectedId) ?? points[0];

  const markerPoints = useMemo(() => points.slice(0, 8), [points]);
  const routeProgress = useMemo(() => {
    if (markerPoints.length <= 1) return 0;
    let furthestIndex = 0;
    markerPoints.forEach((point, index) => {
      if (point.status === 'done' || point.status === 'current') {
        furthestIndex = index;
      }
    });
    return furthestIndex / (markerPoints.length - 1);
  }, [markerPoints]);
  const routeProgressWidth =
    (Math.max(0, Math.min(1, routeProgress)) * 100 + '%') as `${number}%`;

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
          source={regionArtwork ?? mapSources[faction]}
          resizeMode="cover"
          style={styles.art}
          accessible={false}
        />
        <View
          pointerEvents="none"
          style={[
            styles.artShade,
            { backgroundColor: theme.dark ? '#07152366' : '#10283A44' }
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.routeLine,
            { backgroundColor: theme.colors.border }
          ]}
        >
          <View
            style={[
              styles.routeProgress,
              {
                backgroundColor: accent,
                width: routeProgressWidth
              }
            ]}
          />
        </View>
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
                hitSlop={4}
                onPress={() => setInspection({ frontId: defaultId, pointId: point.id })}
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
    borderRadius: 16,
    overflow: 'hidden'
  },
  map: {
    height: 172,
    position: 'relative',
    overflow: 'hidden'
  },
  art: {
    ...StyleSheet.absoluteFill
  },
  artShade: {
    ...StyleSheet.absoluteFill
  },
  routeLine: {
    position: 'absolute',
    left: 31,
    right: 31,
    bottom: 44,
    height: 4,
    borderRadius: 2,
    opacity: 0.9,
    overflow: 'hidden'
  },
  routeProgress: {
    height: '100%',
    borderRadius: 2
  },
  markerRow: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  markerTouch: {
    flex: 1,
    minWidth: 0,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerRing: {
    width: 26,
    height: 26,
    borderWidth: 2.5,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  markerCore: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  markerNumber: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '900'
  },
  inspector: {
    minHeight: 60,
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  inspectorCopy: {
    flex: 1,
    minWidth: 0
  },
  pointName: {
    fontSize: 12,
    fontWeight: '900'
  },
  pointDetail: {
    marginTop: 2,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: '700'
  },
  status: {
    minHeight: 28,
    paddingHorizontal: 8,
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
