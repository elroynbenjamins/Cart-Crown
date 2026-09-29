import type { GameTheme } from './themes';

type SceneSurfaces = Readonly<{ sky: string; horizon: string; ground: string }>;

/** Keep wide battlefield fills neutral; preserve regional motifs and accent colors. */
export function getBattlefieldSurfaces(theme: GameTheme, scene: SceneSurfaces): SceneSurfaces {
  return theme.dark
    ? { sky: theme.colors.surface1, horizon: theme.colors.surface2, ground: theme.colors.surface1 }
    : { sky: scene.sky, horizon: scene.horizon, ground: scene.ground };
}
