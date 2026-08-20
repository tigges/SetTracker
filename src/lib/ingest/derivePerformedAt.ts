/**
 * Calendar night from a printed title or curated 1001 URL.
 * Year-only titles stay null — July 1 is not a real night.
 */

import { parseDateFromSetTitle } from "../placeTimeline";

export function derivePerformedAt(
  title: string | null | undefined,
  slug?: string | null,
  urlBySlug: Record<string, string> = {},
  nowMs = Date.now(),
): Date | null {
  const fromTitle = parseDateFromSetTitle(title, nowMs);
  if (fromTitle) return fromTitle;
  if (!slug) return null;
  return parseDateFromSetTitle(urlBySlug[slug], nowMs);
}
