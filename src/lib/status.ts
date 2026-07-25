// Status color semantics + provenance labels, used everywhere in the UI.

export type IdStatus =
  | "identified"
  | "unresolved_id"
  | "community_resolved"
  | "unparsed";

export type Provenance = "1001tl" | "soundcloud" | "fingerprint" | "community";

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
  "1001tl": { label: "1001TL parse", short: "1001TL" },
  soundcloud: { label: "SoundCloud parse", short: "SoundCloud" },
  fingerprint: { label: "Fingerprint", short: "Fingerprint" },
  community: { label: "Community", short: "Community" },
};

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

// External "listen" deep links. We have mock metadata (no real audio/track IDs),
// so these open a search on each provider for the track — the closest we can get
// to "play" without licensed streams.
export function listenLinks(title: string, artist?: string | null) {
  const q = encodeURIComponent([artist, title].filter(Boolean).join(" ").trim());
  return {
    youtube: `https://www.youtube.com/results?search_query=${q}`,
    beatport: `https://www.beatport.com/search?q=${q}`,
    soundcloud: `https://soundcloud.com/search?q=${q}`,
  };
}

export function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtRelative(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diff / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export const SET_TYPE_META: Record<
  string,
  { label: string; glyph: string }
> = {
  radio: { label: "Radio", glyph: "◉" },
  festival: { label: "Festival", glyph: "▲" },
  soundcloud: { label: "SoundCloud", glyph: "☁" },
};
