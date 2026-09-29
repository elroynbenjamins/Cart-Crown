import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { EnemyFantasyThreatFamily } from '../game/types';
import { useGameTheme } from '../theme/ThemeProvider';
import { BattlefieldBackdrop as BaseBattlefieldBackdrop } from './battleVisualsBase';
import { BossBattlefieldDetails } from './BossBattlefieldDetails';
import { getBossPresentation } from './bossPresentation';

// Preserve the battle screen's API and the merged signature boss presentation.
export { BattleStatusMarker, getBattlefieldScene } from './battleVisualsBase';
export { BattleVfxStrip } from './BattleExchangeVfx';

export function EnemyFantasyThreatAura({
  fantasyThreat,
  compact = false
}: {
  fantasyThreat?: EnemyFantasyThreatFamily;
  compact?: boolean;
}) {
  const { theme } = useGameTheme();
  if (!fantasyThreat) return null;

  const danger = theme.colors.danger;
  const gold = theme.colors.gold;
  const info = theme.colors.info;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        overflow: 'hidden',
        opacity: theme.dark ? 0.78 : 0.54
      }}
    >
      {fantasyThreat === 'magic' ? (
        <>
          {[0, 1, 2].map(index => (
            <View
              key={'rune-' + index}
              style={{
                position: 'absolute',
                right: compact ? 14 + index * 22 : 22 + index * 34,
                top: compact ? 20 + index * 7 : 28 + index * 10,
                width: compact ? 18 : 26,
                height: compact ? 18 : 26,
                borderRadius: 99,
                borderWidth: 2,
                borderColor: index % 2 === 0 ? danger : gold,
                transform: [{ rotate: index % 2 === 0 ? '20deg' : '-20deg' }]
              }}
            />
          ))}
          <View
            style={{
              position: 'absolute',
              right: compact ? 34 : 56,
              top: compact ? 40 : 58,
              width: compact ? 54 : 82,
              height: 2,
              backgroundColor: danger,
              transform: [{ rotate: '-12deg' }]
            }}
          />
        </>
      ) : fantasyThreat === 'flying' ? (
        <>
          {[0, 1, 2].map(index => (
            <React.Fragment key={'wing-' + index}>
              <View
                style={{
                  position: 'absolute',
                  left: compact ? 18 + index * 38 : 28 + index * 58,
                  top: compact ? 18 + index * 8 : 26 + index * 11,
                  width: compact ? 34 : 52,
                  height: 5,
                  borderRadius: 5,
                  backgroundColor: index === 1 ? gold : danger,
                  transform: [{ rotate: '-24deg' }]
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left: compact ? 28 + index * 38 : 44 + index * 58,
                  top: compact ? 24 + index * 8 : 35 + index * 11,
                  width: compact ? 28 : 44,
                  height: 4,
                  borderRadius: 5,
                  backgroundColor: info,
                  transform: [{ rotate: '18deg' }]
                }}
              />
            </React.Fragment>
          ))}
        </>
      ) : fantasyThreat === 'large' ? (
        <>
          {[0, 1, 2, 3].map(index => (
            <View
              key={'crack-' + index}
              style={{
                position: 'absolute',
                left: compact ? 16 + index * 42 : 26 + index * 62,
                bottom: compact ? 20 + (index % 2) * 6 : 30 + (index % 2) * 9,
                width: compact ? 38 : 58,
                height: 3,
                backgroundColor: index % 2 === 0 ? danger : gold,
                transform: [{ rotate: index % 2 === 0 ? '24deg' : '-28deg' }]
              }}
            />
          ))}
          <View
            style={{
              position: 'absolute',
              left: '32%',
              right: '32%',
              bottom: compact ? 12 : 18,
              height: compact ? 9 : 13,
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderRightWidth: 2,
              borderColor: danger,
              opacity: 0.8
            }}
          />
        </>
      ) : (
        <>
          <View
            style={{
              position: 'absolute',
              right: compact ? 18 : 28,
              top: compact ? 16 : 24,
              width: compact ? 30 : 46,
              height: compact ? 30 : 46,
              borderRadius: 99,
              borderWidth: 2,
              borderColor: gold
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: compact ? 18 : 28,
              top: compact ? 24 : 36,
              width: compact ? 58 : 88,
              height: 5,
              borderRadius: 5,
              backgroundColor: danger,
              transform: [{ rotate: '-20deg' }]
            }}
          />
        </>
      )}
    </View>
  );
}

type Props = React.ComponentProps<typeof BaseBattlefieldBackdrop>;

export function BattlefieldBackdrop(props: Props) {
  const { theme } = useGameTheme();
  const compact = props.compact ?? false;
  const presentation = useMemo(
    () => getBossPresentation(props.encounterId, props.difficulty, theme.dark, compact),
    [props.encounterId, props.difficulty, theme.dark, compact]
  );
  return (
    <>
      <BaseBattlefieldBackdrop
        {...props}
        // The Warden/Beacon should not inherit the generic red boss embers.
        // This changes the decorative layer only, never encounter difficulty.
        difficulty={presentation ? 'Normal' : props.difficulty}
      />
      {presentation ? (
        <BossBattlefieldDetails
          key={props.encounterId}
          presentation={presentation}
          compact={compact}
          dark={theme.dark}
        />
      ) : null}
    </>
  );
}
