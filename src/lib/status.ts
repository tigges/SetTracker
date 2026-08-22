// Status color semantics + provenance labels, used everywhere in the UI.

import {
  bandcampSearchUrl,
  beatportSearchUrl,
  canonicalBeatportUrl,
  canonicalSpotifyUrl,
  discogsSearchUrl,
  spotifySearchUrl,
} from "./trackMeta";

export type IdStatus =
  | "identified"
  | "unresolved_id"
  | "community_resolved"
  | "unparsed";

export type Provenance =
  | "1001tl"
  | "soundcloud"
  | "hearthis"
  | "youtube"
  | "bandcamp"
  | "insomniac"
  | "fingerprint"
  | "community";

export const STATUS_META: Record<
  IdStatus,
  { label: string; short: string; color: string; description: string }
> = {
  identified: {
    label: "Identified",
    short: "ID",
    color: "var(--amber)",
    description: "Released track, positively identified",
  },
  unresolved_id: {
    label: "Unresolved ID",
    short: "?",
    color: "var(--magenta)",
    description: "Unreleased / unknown — awaiting an ID",
  },
  community_resolved: {
    label: "Community resolved",
    short: "✓",
    color: "var(--teal)",
    description: "Was an ID, resolved by the community",
  },
  unparsed: {
    label: "Unparsed",
    short: "—",
    color: "var(--grey)",
    description: "Raw source text, not matched to a record",
  },
};

export const STATUS_ORDER: IdStatus[] = [
  "identified",
  "community_resolved",
  "unresolved_id",
  "unparsed",
];

export const PROVENANCE_META: Record<
  Provenance,
  { label: string; short: string }
> = {
  "1001tl": { label: "Tracklist", short: "TL" },
  soundcloud: { label: "SoundCloud", short: "SoundCloud" },
  hearthis: { label: "hearthis.at", short: "hearthis" },
  youtube: { label: "YouTube", short: "YouTube" },
  bandcamp: { label: "Bandcamp", short: "Bandcamp" },
  insomniac: { label: "Insomniac", short: "Insomniac" },
  fingerprint: { label: "ID identification", short: "ID" },
  community: { label: "Community", short: "Community" },
};

/** Published list or audio ID — not a description-line guess. */
export const CONFIRMED_PROVENANCE = new Set<string>([
  "1001tl",
  "fingerprint",
  "community",
]);

export function isConfirmedProvenance(p: string | null | undefined): boolean {
  return CONFIRMED_PROVENANCE.has(p ?? "");
}

const TECH_ID_NOTE =
  /acr-miss|acrcloud|acr\s*cloud|file\s*scanning|\bfilescan\b|1001\s*tracklists?|1001\.tl|\b1001tl\b|\baudd\b|yt-?dlp|aha-music/i;

/** Hide tool names and probe leftovers from set / track copy. */
export function consumerIdNote(note: string | null | undefined): string | null {
  if (!note?.trim()) return null;
  if (TECH_ID_NOTE.test(note)) return null;
  return note.trim();
}

/** Grey ID-probe rows (no track) stay in the DB but not on the public timeline. */
export function isConsumerHiddenPlay(p: {
  rawText?: string | null;
  idNote?: string | null;
  trackId?: string | null;
  artistName?: string | null;
}): boolean {
  if (p.trackId || p.artistName) return false;
  return TECH_ID_NOTE.test(`${p.rawText ?? ""} ${p.idNote ?? ""}`);
}

export function statusColor(status: string): string {
  return STATUS_META[status as IdStatus]?.color ?? "var(--grey)";
}

export function statusLabel(status: string): string {
  return STATUS_META[status as IdStatus]?.label ?? status;
}

export function provenanceLabel(p: string): string {
  return PROVENANCE_META[p as Provenance]?.label ?? p;
}

export function fmtDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function fmtTimestamp(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// External "listen" deep links. Prefer canonical URLs; avoid SC search guesses
// (they often land on the wrong upload / gated page).
export function listenLinks(
  title: string,
  artist?: string | null,
  opts?: {
    beatportUrl?: string | null;
    setSourceUrl?: string | null;
    spotifyUrl?: string | null;
  },
) {
  const q = encodeURIComponent([artist, title].filter(Boolean).join(" ").trim());
  const src = opts?.setSourceUrl ?? "";
  const scFromSet = /soundcloud\.com\//i.test(src) ? src : null;
  const beatportCanonical = canonicalBeatportUrl(opts?.beatportUrl);
  const spotifyCanonical = canonicalSpotifyUrl(opts?.spotifyUrl);
  return {
    youtube: `https://www.youtube.com/results?search_query=${q}`,
    beatport: beatportCanonical ?? beatportSearchUrl(title, artist),
    beatportIsCanonical: !!beatportCanonical,
    spotify: spotifyCanonical ?? spotifySearchUrl(title, artist),
    spotifyIsCanonical: !!spotifyCanonical,
    discogs: discogsSearchUrl(title, artist),
    bandcamp: bandcampSearchUrl(title, artist),
    // Only link SC when we have the set's real upload URL — never a name search.
    soundcloud: scFromSet,
  };
}

export function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtRelative(d: Date | string, nowMs = Date.now()): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = nowMs - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diff / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "1y ago" : `${years}y ago`;
}

export const SET_TYPE_META: Record<
  string,
  { label: string; glyph: string }
> = {
  radio: { label: "Radio", glyph: "◉" },
  festival: { label: "Festival", glyph: "▲" },
  soundcloud: { label: "SoundCloud", glyph: "☁" },
  /** Long-form mix whose discovery host is not SC/YT (e.g. hearthis.at). */
  mix: { label: "Mix", glyph: "◈" },
};
