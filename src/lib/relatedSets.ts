/**
 * Rank "more like this" candidates for a set detail page.
 * Same event + DJ scores highest; complete tracklists beat stubs.
 */

export type RelatedAnchor = {
  slug: string;
  eventSlug?: string | null;
  seriesSlug?: string | null;
  primaryDjSlug?: string | null;
};

export type RelatedCandidate = RelatedAnchor & {
  title: string;
  publishedAt: Date | string;
  trackCount: number;
  durationSec: number;
};

export function relatedReason(
  anchor: RelatedAnchor,
  cand: RelatedCandidate,
): "event" | "series" | "dj" | null {
  if (anchor.eventSlug && cand.eventSlug === anchor.eventSlug) return "event";
  if (anchor.seriesSlug && cand.seriesSlug === anchor.seriesSlug) return "series";
  if (anchor.primaryDjSlug && cand.primaryDjSlug === anchor.primaryDjSlug) {
    return "dj";
  }
  return null;
}

export function scoreRelatedSet(
  anchor: RelatedAnchor,
  cand: RelatedCandidate,
): number {
  if (cand.slug === anchor.slug) return -1;
  const reason = relatedReason(anchor, cand);
  if (!reason) return -1;
  let s = 0;
  if (reason === "event") s += 80;
  else if (reason === "series") s += 50;
  else s += 30;
  if (
    anchor.primaryDjSlug &&
    cand.primaryDjSlug === anchor.primaryDjSlug &&
    reason !== "dj"
  ) {
    s += 25;
  }
  if (cand.trackCount >= 12 && cand.durationSec >= 20 * 60) s += 20;
  else if (cand.trackCount >= 6) s += 8;
  return s;
}

export function pickRelatedSets<T extends RelatedCandidate>(
  anchor: RelatedAnchor,
  candidates: T[],
  limit = 6,
): { item: T; reason: "event" | "series" | "dj"; score: number }[] {
  return candidates
    .map((item) => ({
      item,
      reason: relatedReason(anchor, item),
      score: scoreRelatedSet(anchor, item),
    }))
    .filter(
      (
        row,
      ): row is {
        item: T;
        reason: "event" | "series" | "dj";
        score: number;
      } => row.reason != null && row.score >= 0,
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.item.publishedAt).getTime() -
          new Date(a.item.publishedAt).getTime(),
    )
    .slice(0, limit);
}
