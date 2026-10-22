/** Pure report state: never pays out resources or advances campaign progress.
 * A completed chapter replaces its mission nodes, so the older node can vanish
 * while its report is still mounted. That must NOT strand the player on a
 * disabled "Resolve mission" button.
 */
export type HumanMissionReportState = 'unavailable' | 'ready' | 'completed';

export function humanMissionReportState({
  activeFaction,
  chapterNumber,
  missionChapter,
  node,
  resolvedOnThisScreen
}: {
  activeFaction: string;
  chapterNumber: number;
  missionChapter: number | null;
  node: Readonly<{ current?: boolean; completed: boolean }> | undefined;
  resolvedOnThisScreen: boolean;
}): HumanMissionReportState {
  if (activeFaction !== 'human' || missionChapter === null) return 'unavailable';
  // A later chapter proves the linear prior front has already been cleared.
  // Local acceptance handles the render between the provider's state update
  // and its replacement chapter-node array.
  if (resolvedOnThisScreen || chapterNumber > missionChapter || node?.completed) {
    return 'completed';
  }
  if (chapterNumber === missionChapter && node?.current) return 'ready';
  return 'unavailable';
}
