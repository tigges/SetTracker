/**
 * Adaptive polling state for curated SoundCloud shows.
 * Persisted at data/soundcloud-poll-state.json so the 6h cron can favor hot shows.
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";

export type ShowPollState = {
  lastUploadAt: string | null;
  /** Uploads observed with created/display date in the last 14 days */
  recentUploadCount: number;
  /** Limit used on the last successful fetch */
  limit: number;
  updatedAt: string;
};

export type PollStateFile = {
  updatedAt: string | null;
  shows: Record<string, ShowPollState>;
};

const STATE_PATH = () =>
  path.join(process.cwd(), "data/soundcloud-poll-state.json");

export function loadPollState(): PollStateFile {
  try {
    const raw = JSON.parse(readFileSync(STATE_PATH(), "utf8")) as PollStateFile;
    return { updatedAt: raw.updatedAt ?? null, shows: raw.shows ?? {} };
  } catch {
    return { updatedAt: null, shows: {} };
  }
}

export function savePollState(state: PollStateFile): void {
  state.updatedAt = new Date().toISOString();
  writeFileSync(STATE_PATH(), JSON.stringify(state, null, 2) + "\n", "utf8");
}

/**
 * Choose fetch limit from prior cadence + show baseline.
 * Hot (recent uploads) → pull deeper; cold → shallow check.
 */
export function adaptiveLimit(
  permalink: string,
  baseline: number,
  state: PollStateFile,
): number {
  const prev = state.shows[permalink];
  if (!prev) return baseline;
  if (prev.recentUploadCount >= 3) return Math.min(50, Math.max(baseline, 24));
  if (prev.recentUploadCount >= 1) return Math.min(40, Math.max(baseline, 16));
  // Quiet show — shallow by default, but honor high curated baselines
  // (e.g. Marten Horger limit=50 so older festival uploads aren't starved).
  if (baseline >= 24) return Math.min(50, baseline);
  return Math.max(12, Math.min(baseline, 18));
}

/** Sort shows so recently-active accounts are polled first. */
export function sortShowsByHeat<T extends { permalink: string }>(
  shows: T[],
  state: PollStateFile,
): T[] {
  return [...shows].sort((a, b) => {
    const ta = state.shows[a.permalink]?.lastUploadAt;
    const tb = state.shows[b.permalink]?.lastUploadAt;
    return (tb ? Date.parse(tb) : 0) - (ta ? Date.parse(ta) : 0);
  });
}

export function summarizeTracksForState(
  tracks: { created_at?: string; display_date?: string }[],
  limitUsed: number,
): ShowPollState {
  const now = Date.now();
  const windowMs = 14 * 24 * 60 * 60 * 1000;
  let lastUploadAt: string | null = null;
  let recentUploadCount = 0;
  for (const t of tracks) {
    const raw = t.display_date || t.created_at;
    if (!raw) continue;
    const ts = Date.parse(raw);
    if (Number.isNaN(ts)) continue;
    if (!lastUploadAt || ts > Date.parse(lastUploadAt)) lastUploadAt = new Date(ts).toISOString();
    if (now - ts <= windowMs) recentUploadCount += 1;
  }
  return {
    lastUploadAt,
    recentUploadCount,
    limit: limitUsed,
    updatedAt: new Date().toISOString(),
  };
}
