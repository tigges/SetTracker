/**
 * Shared ACR Identify / File Scan bookkeeping.
 *
 * A probe always records what came back — a strong hit, a named weak hit,
 * or a no-match — so the next run does not retrace the same offset.
 * Grey `acr-miss` rows / notes are the park; they never inflate
 * `unresolved_id`.
 */

export const ACR_IDENTIFY_VARIABLES = [
  "artist",
  "title",
  "ISRC",
  "score",
  "offset",
] as const;

export const ACR_IDENTIFY_VARIABLES_LABEL = ACR_IDENTIFY_VARIABLES.join(", ");

export type AcrPartialHit = {
  artist?: string | null;
  title?: string | null;
  isrc?: string | null;
  score?: number | null;
};

export function isAcrProbedText(
  text: string | null | undefined,
): boolean {
  return Boolean(text && /\bacr-miss\b/i.test(text));
}

export function playAlreadyAcrProbed(play: {
  rawText?: string | null;
  idNote?: string | null;
  idTrack?: { note?: string | null } | null;
}): boolean {
  return (
    isAcrProbedText(play.rawText) ||
    isAcrProbedText(play.idNote) ||
    isAcrProbedText(play.idTrack?.note)
  );
}

export function formatAcrPartialReason(
  hit: AcrPartialHit | null | undefined,
  fallback = "no ACRCloud match",
): string {
  if (!hit) return fallback;
  const artist = hit.artist?.trim() || "";
  const title = hit.title?.trim() || "";
  const isrc = hit.isrc?.trim() || "";
  const score =
    hit.score != null && Number.isFinite(hit.score) ? hit.score : null;
  const name = [artist, title].filter(Boolean).join(" - ");
  if (!name && !isrc && score == null) return fallback;
  const scoreBit = score != null ? `weak score ${score}` : null;
  const rest = [name || null, isrc ? `ISRC ${isrc}` : null]
    .filter(Boolean)
    .join(" · ");
  if (scoreBit && rest) return `${scoreBit}: ${rest}`;
  return scoreBit || rest || fallback;
}

export function acrPartialHasNames(hit: AcrPartialHit | null | undefined): boolean {
  if (!hit) return false;
  return Boolean(
    hit.artist?.trim() || hit.title?.trim() || hit.isrc?.trim(),
  );
}

export function formatAcrHitRate(identified: number, probed: number): string {
  if (probed <= 0) return "n/a";
  return `${((identified / probed) * 100).toFixed(1)}%`;
}

/** Console / /stats line: variables, probe count, hits, partials, miss rate. */
export function formatAcrTrackMessage(stats: {
  probed: number;
  identified: number;
  partial: number;
  missed: number;
}): string {
  const rate = formatAcrHitRate(stats.identified, stats.probed);
  return (
    `tracking ${ACR_IDENTIFY_VARIABLES_LABEL} — ` +
    `${stats.probed} probes, ${stats.identified} hits (${rate}), ` +
    `${stats.partial} partial parked, ${stats.missed} no-match`
  );
}
