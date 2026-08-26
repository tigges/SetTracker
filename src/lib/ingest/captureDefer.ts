/**
 * Recycle a capture row instead of leaving it to clog the queue.
 *
 * Some sets have no findable 1001 tracklist yet — a new upload, an obscure
 * B2B, a stage set nobody has logged. Those sit at the top of the 40-row
 * queue forever and hide work that is actually doable. Deferring one drops
 * it until `until`, and because the filter runs before the cap, the next
 * candidate takes its slot immediately.
 *
 * Pure — the file is a static JSON import so no fs reaches a client bundle.
 * Expired rows come back automatically; nothing is deleted.
 */

export type CaptureDeferRow = {
  slug: string;
  /** ISO date (YYYY-MM-DD or full ISO). Past = back in the queue. */
  until: string;
  /** Why it was parked — keeps the next operator from re-hunting blindly. */
  note?: string;
};

export type CaptureDeferFile = {
  rows?: CaptureDeferRow[];
};

/** Default park length when an operator snoozes without picking a date. */
export const CAPTURE_DEFER_DAYS = 30;

export function captureDeferUntil(
  days = CAPTURE_DEFER_DAYS,
  nowMs = Date.now(),
): string {
  const at = new Date(nowMs + days * 24 * 60 * 60 * 1000);
  return at.toISOString().slice(0, 10);
}

/** End of the named day, so a `YYYY-MM-DD` defer covers that whole day. */
function deferExpiryMs(until: string): number | null {
  const raw = until.trim();
  if (!raw) return null;
  const dayOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
  const at = Date.parse(dayOnly ? `${raw}T23:59:59.999Z` : raw);
  return Number.isFinite(at) ? at : null;
}

export function isDeferRowActive(
  row: CaptureDeferRow,
  nowMs = Date.now(),
): boolean {
  const expiry = deferExpiryMs(row.until);
  if (expiry === null) return false;
  return expiry > nowMs;
}

/** Slugs currently parked. Unparsable or expired rows are ignored. */
export function activeDeferSlugs(
  file: CaptureDeferFile | null | undefined,
  nowMs = Date.now(),
): Set<string> {
  const out = new Set<string>();
  for (const row of file?.rows ?? []) {
    if (!row?.slug) continue;
    if (isDeferRowActive(row, nowMs)) out.add(row.slug);
  }
  return out;
}

export function deferNoteBySlug(
  file: CaptureDeferFile | null | undefined,
): Map<string, string> {
  const out = new Map<string, string>();
  for (const row of file?.rows ?? []) {
    if (row?.slug && row.note) out.set(row.slug, row.note);
  }
  return out;
}

/** Merge a snooze into the committed file, replacing any earlier row. */
export function withDeferRow(
  file: CaptureDeferFile | null | undefined,
  row: CaptureDeferRow,
): CaptureDeferFile {
  const rows = (file?.rows ?? []).filter((r) => r.slug !== row.slug);
  rows.push(row);
  rows.sort((a, b) => a.slug.localeCompare(b.slug));
  return { rows };
}
