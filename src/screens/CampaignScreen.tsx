import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { chapterOneNodes, humanRegions } from '../game/data';
import { useGameTheme } from '../theme/ThemeProvider';
import { GameCard, Pill, SectionTitle } from '../ui/components';

const nodeIcons: Record<string, string> = {
  story: '◆',
  battle: '⚔',
  event: '?',
  elite: '✦',
  supply: '▣',
  boss: '♛'
};

export function CampaignScreen() {
  const { theme } = useGameTheme();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <GameCard accent={theme.colors.human}>
        <View style={styles.chapterHeader}>
          <View style={styles.chapterCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.human }]}>CHAPTER 1</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>The Last Wagon</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Reach ruined Greenkeep with the surviving squads.
            </Text>
          </View>
          <Pill label="1 / 6" color={theme.colors.surface2} />
        </View>
      </GameCard>

      <SectionTitle title="Caelora" trailing="Western frontier" />

      <View style={[styles.map, { backgroundColor: theme.colors.surface1, borderColor: theme.colors.border }]}>
        <View style={[styles.humanTerritory, { backgroundColor: theme.colors.human + '24' }]} />
        <View style={[styles.neutralTerritory, { backgroundColor: theme.colors.gold + '18' }]} />

        {humanRegions.map(region => {
          const active = region.state === 'current';
          const locked = region.state === 'locked';
          const accent = region.faction === 'neutral' ? theme.colors.gold : theme.colors.human;

          return (
            <View
              key={region.id}
              style={[
                styles.region,
                {
                  left: String(region.x) + '%',
                  top: String(region.y) + '%'
                }
              ]}
            >
              <View
                style={[
                  styles.regionDot,
                  {
                    borderColor: accent,
                    backgroundColor: active ? accent : theme.colors.surface2,
                    opacity: locked ? 0.5 : 1
                  }
                ]}
              >
                <Text style={[styles.regionDotText, { color: active ? '#FFFFFF' : accent }]}>
                  {active ? '●' : locked ? '×' : '○'}
                </Text>
              </View>
              <Text
                style={[
                  styles.regionName,
                  { color: locked ? theme.colors.textMuted : theme.colors.text }
                ]}
                numberOfLines={2}
              >
                {region.name}
              </Text>
            </View>
          );
        })}

        <View style={[styles.route, { backgroundColor: theme.colors.human }]} />
      </View>

      <SectionTitle title="Greenkeep Outskirts" trailing="Current region" />

      <View style={styles.nodeList}>
        {chapterOneNodes.map((node, index) => (
          <GameCard
            key={node.id}
            accent={node.current ? theme.colors.primary : undefined}
            style={styles.nodeCard}
          >
            <View
              style={[
                styles.nodeIcon,
                {
                  backgroundColor: node.completed
                    ? theme.colors.primary
                    : node.current
                      ? theme.colors.human
                      : theme.colors.surface2
                }
              ]}
            >
              <Text style={styles.nodeIconText}>{node.completed ? '✓' : nodeIcons[node.type]}</Text>
            </View>
            <View style={styles.nodeCopy}>
              <Text style={[styles.nodeMeta, { color: theme.colors.textMuted }]}>
                {String(index + 1).padStart(2, '0')} · {node.type.toUpperCase()}
              </Text>
              <Text style={[styles.nodeName, { color: theme.colors.text }]}>{node.name}</Text>
            </View>
            <Text style={[styles.chevron, { color: node.current ? theme.colors.primary : theme.colors.textMuted }]}>
              {node.current ? 'PLAY' : node.completed ? 'DONE' : 'LOCKED'}
            </Text>
          </GameCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14
  },
  chapterHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  chapterCopy: {
    flex: 1
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
    marginTop: 5
  },
  map: {
    height: 330,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  humanTerritory: {
    position: 'absolute',
    left: '-10%',
    top: '12%',
    width: '62%',
    height: '88%',
    borderTopRightRadius: 160,
    borderBottomRightRadius: 120
  },
  neutralTerritory: {
    position: 'absolute',
    left: '46%',
    top: '10%',
    width: '54%',
    height: '90%',
    borderTopLeftRadius: 140,
    borderBottomLeftRadius: 90
  },
  region: {
    position: 'absolute',
    width: 88,
    marginLeft: -22,
    marginTop: -22,
    alignItems: 'center'
  },
  regionDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  regionDotText: {
    fontSize: 13,
    fontWeight: '900'
  },
  regionName: {
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 13,
    marginTop: 4,
    fontWeight: '800'
  },
  route: {
    position: 'absolute',
    left: '15%',
    top: '62%',
    width: '26%',
    height: 3,
    transform: [{ rotate: '-4deg' }],
    opacity: 0.4
  },
  nodeList: {
    gap: 8
  },
  nodeCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  nodeIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nodeIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 17
  },
  nodeCopy: {
    flex: 1
  },
  nodeMeta: {
    fontSize: 10,
    fontWeight: '800'
  },
  nodeName: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 3
  },
  chevron: {
    fontSize: 10,
    fontWeight: '900'
  }
});
