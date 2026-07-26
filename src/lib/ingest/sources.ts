import type { Provenance } from "../status";
import { bandcampAdapter } from "./bandcamp/adapter";
import { boilerroomAdapter } from "./boilerroom/adapter";
import { hearthisAdapter } from "./hearthis/adapter";
import { slugify, type RawArtist, type RawPlay, type RawSet, type SourceAdapter } from "./types";
import { topDjs } from "./topDjs";
import { soundcloudAdapter } from "./soundcloud/adapter";
import { youtubeAdapter } from "./youtube/adapter";

// ---------------------------------------------------------------------------
// Small DSL to author tracklists compactly (synthetic adapters only).
// ---------------------------------------------------------------------------
type Entry =
  | { k: "id"; title: string; artist: string; prov: Provenance; label?: string; bpm?: number }
  | { k: "unid"; idLabel: string; prov: Provenance; suspectedArtist?: string; note?: string }
  | { k: "res"; idLabel: string; title: string; artist: string; prov: Provenance; label?: string }
  | { k: "raw"; text: string; prov: Provenance };

function buildPlays(entries: Entry[], durationSec: number): RawPlay[] {
  const n = entries.length;
  return entries.map((e, i) => {
    const base = {
      position: i + 1,
      timestamp: Math.round((durationSec * (i + 1)) / (n + 1)),
      provenance: e.prov,
    };
    switch (e.k) {
      case "id":
        return { ...base, idStatus: "identified" as const, trackTitle: e.title, artistName: e.artist, label: e.label, bpm: e.bpm };
      case "unid":
        return { ...base, idStatus: "unresolved_id" as const, idLabel: e.idLabel, suspectedArtist: e.suspectedArtist, note: e.note, rawText: e.idLabel };
      case "res":
        return { ...base, idStatus: "community_resolved" as const, idLabel: e.idLabel, trackTitle: e.title, artistName: e.artist, label: e.label, rawText: e.idLabel };
      case "raw":
        return { ...base, idStatus: "unparsed" as const, rawText: e.text };
    }
  });
}

const artist = (name: string, extra: Partial<RawArtist> = {}): RawArtist => ({
  name,
  slug: slugify(name),
  ...extra,
});

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(17, 0, 0, 0);
  return d;
}

/**
 * Legacy synthetic adapter (demo volume only). Not a live crawl — do not treat
 * as 1001Tracklists data. Disabled unless INGEST_SYNTHETIC=1.
 */
const syntheticDemo: SourceAdapter = {
  id: "synthetic-demo",
  label: "Synthetic demo",
  async fetchRecent(): Promise<RawSet[]> {
    return [
      {
        sourceSlug: "night-bass-radio-202",
        title: "Night Bass Radio 202",
        type: "radio",
        genre: "Bass House",
        primaryArtist: artist("AC Slater"),
        seriesName: "Night Bass Radio",
        publishedAt: daysAgo(0),
        durationSec: 3600,
        sourceName: "Synthetic demo",
        cover: "#f2b33d",
        plays: buildPlays(
          [
            { k: "id", title: "Rampage", artist: "AC Slater", prov: "soundcloud", label: "Night Bass" },
            { k: "id", title: "Juke", artist: "BIJOU", prov: "soundcloud", label: "Night Bass" },
            { k: "unid", idLabel: "AC Slater - ID", prov: "soundcloud", suspectedArtist: "AC Slater" },
            { k: "id", title: "Crew Joint", artist: "AC Slater", prov: "soundcloud", label: "Night Bass" },
            { k: "res", idLabel: "ID - ID", title: "Ratchet", artist: "Wax Motif", prov: "community" },
            { k: "raw", text: "AC Slater - unreleased edit", prov: "soundcloud" },
          ],
          3600,
        ),
      },
    ];
  },
};

function withOptionalSynthetic(base: SourceAdapter[]): SourceAdapter[] {
  // Fabricated catalog backfill is opt-in only — never invent tracklists by default.
  if (process.env.INGEST_SYNTHETIC === "1") {
    return [...base, syntheticDemo, topDjs];
  }
  // Legacy: INGEST_TOPDJS=1 (or INGEST_SKIP_TOPDJS=0) re-enables synthetic top-DJ sets.
  if (process.env.INGEST_TOPDJS === "1") return [...base, topDjs];
  return base;
}

/**
 * Primary pipeline:
 * - SoundCloud curated shows (anonymous client_id)
 * - hearthis.at house-family categories (public api-v2)
 * - YouTube curated sets + venue channels (description + Music credits)
 * - Bandcamp curated tracks/albums
 */
export const adapters: SourceAdapter[] = withOptionalSynthetic([
  soundcloudAdapter,
  hearthisAdapter,
  youtubeAdapter,
  bandcampAdapter,
  boilerroomAdapter,
]);
