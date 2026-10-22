/** A campaign map inspection belongs to the active front, not the whole save. */
export type JourneyInspection = Readonly<{ frontId: string; pointId: string }>;

export function activeJourneyPointId(
  frontId: string,
  points: readonly Readonly<{ id: string }>[],
  inspection: JourneyInspection | null
): string {
  if (
    inspection?.frontId === frontId &&
    points.some(point => point.id === inspection.pointId)
  ) {
    return inspection.pointId;
  }
  return frontId;
}
