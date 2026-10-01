import React, { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { EnemyFantasyThreatFamily } from '../../game/types';
import { useGameTheme } from '../../theme/ThemeProvider';
import { BattlefieldBackdrop } from '../battleVisuals';
import { getProductionAssetSource } from '../productionAssets';
import { ReferenceArt } from './Art';
import { hasGreenkeepScenery, roadSceneryLayout } from './scenery';

type Props = React.ComponentProps<typeof BattlefieldBackdrop> & {
  width: number; height: number; fantasyThreat?: EnemyFantasyThreatFamily;
};

/** Static scenery behind the troops; never a baked combat screenshot. */
export const IllustratedBattlefieldBackdrop = memo(function IllustratedBattlefieldBackdrop({
  width, height, fantasyThreat, ...props
}: Props) {
  const { theme } = useGameTheme();
  const [failed, setFailed] = useState(false);
  const illustrated = !failed && hasGreenkeepScenery(props.encounterId, props.faction, props.difficulty, fantasyThreat)
    && getProductionAssetSource('battle_portrait.greenkeep_sky')
    && getProductionAssetSource('battle_portrait.greenkeep_ground');
  const layout = roadSceneryLayout(width, height);
  return <>
    <BattlefieldBackdrop {...props} />
    {illustrated ? <View pointerEvents="none" accessible={false} accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants" testID="greenkeep-illustrated-battlefield"
      style={[styles.fill, { backgroundColor: theme.colors.surface1 }]}>
      <View style={[styles.horizon, { opacity: theme.dark ? .78 : .5 }]}>
        <ReferenceArt art="greenkeep_sky" width={layout.width} height={layout.horizonHeight} onError={() => setFailed(true)} />
      </View>
      {layout.tiles.map(tile => <View key={tile.index} style={{
        position: 'absolute', left: 0, top: tile.y, width: layout.width, height: layout.tileHeight,
        opacity: theme.dark ? .64 : .36, transform: [{ scaleX: tile.mirrored ? -1 : 1 }]
      }}>
        <ReferenceArt art="greenkeep_ground" width={layout.width} height={layout.tileHeight} onError={() => setFailed(true)} />
      </View>)}
      {/* A quiet neutral floor under both armies, not a blue screen-wide wash. */}
      <View style={[styles.floorShade, { top: layout.horizonHeight, backgroundColor: theme.colors.appBg,
        opacity: theme.dark ? .16 : .12 }]} />
      <View style={[styles.leftShade, { backgroundColor: theme.colors.appBg }]} />
      <View style={[styles.rightShade, { backgroundColor: theme.colors.appBg }]} />
      {props.difficulty === 'Elite' ? <View style={[styles.eliteFrame, { borderColor: theme.colors.gold }]} /> : null}
    </View> : null}
  </>;
});

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden', borderRadius: 6 },
  horizon: { position: 'absolute', left: 0, top: 0 },
  floorShade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  leftShade: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, opacity: .28 },
  rightShade: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 14, opacity: .28 },
  eliteFrame: { position: 'absolute', left: 3, right: 3, top: 3, bottom: 3, borderWidth: 1, borderRadius: 5, opacity: .3 }
});
