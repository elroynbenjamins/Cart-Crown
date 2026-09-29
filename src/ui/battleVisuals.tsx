import React, { useMemo } from 'react';
import { useGameTheme } from '../theme/ThemeProvider';
import { BattlefieldBackdrop as BaseBattlefieldBackdrop } from './battleVisualsBase';
import { BossBattlefieldDetails } from './BossBattlefieldDetails';
import { getBossPresentation } from './bossPresentation';

// Preserve the battle screen's API and all existing exchange/status rendering.
export { BattleStatusMarker, BattleVfxStrip, getBattlefieldScene } from './battleVisualsBase';

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
