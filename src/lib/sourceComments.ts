/**
 * Playback-source timed comments (SoundCloud / YouTube / hearthis).
 *
 * Rank the host clock above cadence / fingerprint grids. Keep ID-like
 * comments as cue times. Drop chat that is not a track ask.
 */

export const HOST_COMMENT_PROVENANCE = new Set([
  "soundcloud",
  "youtube",
  "hearthis",
]);

export const HOST_COMMENT_PILEON_SEC = 45;

export type SourceCommentKind = "named" | "id-ask" | "chat";

const ARTIST_TITLE_DASH = /\s[-–—]\s/;
const QUOTED_TITLE =
  /['‘“"]([^'"‘’“”]{3,80})['’”"]/;

const ID_ASK =
  /\b(?:what(?:'s| is) this|which\s+(?:track|tune|song|id)|name of(?:\s+this)?\s+(?:track|tune|song)|track\s*id|tune\s*id|song\s*id|id\s*\?)\b/i;

const BARE_ID = /^(?:id\b.*|.*\bid\b)$/i;

const CHAT_ABOUT_SHOW =
  /\b(?:track\s*lists?|set\s*lists?|where(?:'s| is) the|berlin set)\b/i;

const LIVE_FESTIVAL_RADIO =
  /\blive\s+from\b|\blive\s+at\b|\b@\s+\w|tomorrowland|ultra music|edc\b|mysteryland|awakenings|dekmantel|s2o\b|\bfestival\b/i;

export function extractQuotedTitle(text: string): string | null {
  const m = text.match(QUOTED_TITLE);
  const title = m?.[1]?.replace(/\s+/g, " ").trim() ?? "";
  if (title.length < 3) return null;
  if (/^(id|track|tune|song)$/i.test(title)) return null;
  return title;
}

function looksNamedLine(text: string): boolean {
  const line = text.trim();
  if (line.length < 3 || line.length > 200) return false;
  if (/^[#@]/.test(line)) return false;
  if (/^\d{1,3}([.)]|\s*[.|]\s+)\S/.test(line) && ARTIST_TITLE_DASH.test(line)) {
    return true;
  }
  if (ARTIST_TITLE_DASH.test(line) && !/^id\s*[-–—]\s*id$/i.test(line)) {
    const [artist, title] = line.split(/\s[-–—]\s/, 2);
    return Boolean(artist?.trim() && title?.trim() && !/^id\b/i.test(title.trim()));
  }
  return extractQuotedTitle(line) != null;
}

export function classifySourceComment(text: string): SourceCommentKind {
  const body = text.replace(/\s+/g, " ").trim();
  if (!body) return "chat";
  if (CHAT_ABOUT_SHOW.test(body)) return "chat";
  if (looksNamedLine(body)) return "named";
  if (ID_ASK.test(body) || /^id\s*[?!.]*$/i.test(body) || BARE_ID.test(body)) {
    return "id-ask";
  }
  return "chat";
}

export function isHostCommentProvenance(provenance: string | null | undefined): boolean {
  return HOST_COMMENT_PROVENANCE.has(provenance ?? "");
}

export function looksLikeLiveFestivalRadio(title?: string | null): boolean {
  return !!title && LIVE_FESTIVAL_RADIO.test(title);
}

/** Weekly radio-with-links: skip invented cues in the open/close. */
export function isRadioTalkWindow(
  timestamp: number,
  durationSec: number,
  meta: { type?: string | null; title?: string | null },
): boolean {
  if (meta.type !== "radio") return false;
  if (looksLikeLiveFestivalRadio(meta.title)) return false;
  if (durationSec < 20 * 60) return false;
  if (timestamp < 150) return true;
  if (timestamp > durationSec - 75) return true;
  return false;
}

export function commentCueRank(kind: SourceCommentKind): number {
  if (kind === "named") return 2;
  if (kind === "id-ask") return 1;
  return 0;
}

/** Keep the strongest comment in a ~45s pile-on. */
export function collapseHostCommentTimes<T extends { timestamp: number }>(
  rows: T[],
  kindOf: (row: T) => SourceCommentKind,
  windowSec = HOST_COMMENT_PILEON_SEC,
): T[] {
  const sorted = [...rows].sort((a, b) => a.timestamp - b.timestamp);
  const out: T[] = [];
  for (const row of sorted) {
    const prev = out[out.length - 1];
    if (!prev || row.timestamp - prev.timestamp > windowSec) {
      out.push(row);
      continue;
    }
    if (commentCueRank(kindOf(row)) > commentCueRank(kindOf(prev))) {
      out[out.length - 1] = row;
    }
  }
  return out;
}
