import type { Provenance } from "../status";
import { slugify, type RawArtist, type RawPlay, type RawSet, type SourceAdapter } from "./types";

// ---------------------------------------------------------------------------
// Small DSL to author tracklists compactly (mirrors the seed helpers).
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

// ---------------------------------------------------------------------------
// NOTE: These adapters return synthetic "recently discovered" sets so the
// pipeline is runnable end-to-end and idempotent (stable `sourceSlug`s).
//
// To wire up real crawling, replace the body of `fetchRecent()` with HTTP calls
// to the source (e.g. 1001Tracklists / SoundCloud API or HTML parsing), map the
// response onto `RawSet[]`, and keep `sourceSlug` stable per source item so
// re-runs upsert instead of duplicating. Respect each source's ToS + rate limits
// (add auth via env vars, throttle, and cache ETags here).
// ---------------------------------------------------------------------------

const oneThousandOne: SourceAdapter = {
  id: "1001tracklists",
  label: "1001Tracklists",
  async fetchRecent(): Promise<RawSet[]> {
    // TODO(real): fetch https://www.1001tracklists.com/ recent tracklists here.
    return [
      {
        sourceSlug: "night-bass-radio-202",
        title: "Night Bass Radio 202",
        type: "radio",
        primaryArtist: artist("AC Slater"),
        seriesName: "Night Bass Radio",
        publishedAt: daysAgo(0),
        durationSec: 3600,
        sourceName: "1001Tracklists",
        cover: "#f2b33d",
        plays: buildPlays(
          [
            { k: "id", title: "Turn It Up", artist: "AC Slater", prov: "1001tl", label: "Night Bass" },
            { k: "id", title: "Juke", artist: "BIJOU", prov: "1001tl", label: "Night Bass" },
            { k: "unid", idLabel: "AC Slater - ID", prov: "1001tl", suspectedArtist: "AC Slater" },
            { k: "id", title: "Work", artist: "AC Slater, Chris Lorenzo", prov: "1001tl", label: "Night Bass" },
            { k: "res", idLabel: "ID - ID", title: "Ratchet", artist: "Wax Motif", prov: "community" },
            { k: "raw", text: "AC Slater - unreleased edit", prov: "1001tl" },
            { k: "id", title: "Turn It Up", artist: "AC Slater", prov: "fingerprint" },
          ],
          3600,
        ),
      },
      {
        sourceSlug: "salute-boiler-room",
        title: "Boiler Room · Manchester",
        type: "festival",
        primaryArtist: artist("salute", { accent: "#ff5c8a", homeCity: "Manchester, UK", bio: "UK producer fusing UK garage, house and rave energy." }),
        eventName: "Boiler Room",
        eventKind: "club",
        eventLocation: "Manchester, UK",
        publishedAt: daysAgo(1),
        durationSec: 3600,
        sourceName: "1001Tracklists",
        cover: "#ff5c8a",
        plays: buildPlays(
          [
            { k: "id", title: "Peace of Mind", artist: "salute", prov: "fingerprint" },
            { k: "id", title: "Rhythm Is Key", artist: "salute", prov: "fingerprint" },
            { k: "unid", idLabel: "salute - ID", prov: "fingerprint", suspectedArtist: "salute" },
            { k: "id", title: "Ratchet", artist: "Wax Motif", prov: "fingerprint" },
            { k: "res", idLabel: "ID - ID", title: "Tell Me", artist: "Interplanetary Criminal", prov: "community" },
            { k: "raw", text: "UKG dub (unreleased)", prov: "fingerprint" },
          ],
          3600,
        ),
      },
      {
        sourceSlug: "interplanetary-criminal-radio-08",
        title: "Rinse FM · Show 08",
        type: "radio",
        primaryArtist: artist("Interplanetary Criminal", { accent: "#5ce0b0", homeCity: "Manchester, UK", bio: "UK garage revivalist and bass selector." }),
        eventName: "Rinse FM",
        eventKind: "radio",
        publishedAt: daysAgo(2),
        durationSec: 3600,
        sourceName: "1001Tracklists",
        cover: "#5ce0b0",
        plays: buildPlays(
          [
            { k: "id", title: "Tell Me", artist: "Interplanetary Criminal", prov: "1001tl" },
            { k: "id", title: "Where U Are", artist: "Interplanetary Criminal", prov: "1001tl" },
            { k: "unid", idLabel: "IPC - ID", prov: "1001tl", suspectedArtist: "Interplanetary Criminal" },
            { k: "id", title: "Peace of Mind", artist: "salute", prov: "1001tl" },
            { k: "res", idLabel: "ID - ID", title: "Move", artist: "Skepsis", prov: "community" },
            { k: "raw", text: "bassline bootleg", prov: "1001tl" },
          ],
          3600,
        ),
      },
    ];
  },
};

const soundcloud: SourceAdapter = {
  id: "soundcloud",
  label: "SoundCloud",
  async fetchRecent(): Promise<RawSet[]> {
    // TODO(real): fetch recent uploads via the SoundCloud API here.
    return [
      {
        sourceSlug: "cloonee-wcis-13",
        title: "What Can I Say Vol. 13",
        type: "soundcloud",
        primaryArtist: artist("Cloonee"),
        publishedAt: daysAgo(0),
        durationSec: 3000,
        sourceName: "SoundCloud",
        sourceUrl: "https://soundcloud.com/cloonee",
        cover: "#f08a3d",
        plays: buildPlays(
          [
            { k: "raw", text: "Intro — Cloonee edit", prov: "soundcloud" },
            { k: "id", title: "Get Loose", artist: "Cloonee", prov: "soundcloud" },
            { k: "id", title: "Low Ride", artist: "Cloonee", prov: "soundcloud" },
            { k: "unid", idLabel: "ID - ID", prov: "soundcloud", note: "comments open" },
            { k: "id", title: "Superstar", artist: "Matroda", prov: "soundcloud" },
            { k: "res", idLabel: "Cloonee - ID", title: "Freak", artist: "Gettoblaster", prov: "community" },
          ],
          3000,
        ),
      },
      {
        sourceSlug: "skepsis-bassline-mix",
        title: "Bassline Sessions 04",
        type: "soundcloud",
        primaryArtist: artist("Skepsis", { accent: "#ffa03d", homeCity: "London, UK", bio: "Bassline and bass-house heavyweight." }),
        publishedAt: daysAgo(3),
        durationSec: 2700,
        sourceName: "SoundCloud",
        sourceUrl: "https://soundcloud.com/skepsis",
        cover: "#ffa03d",
        plays: buildPlays(
          [
            { k: "id", title: "Move", artist: "Skepsis", prov: "soundcloud" },
            { k: "id", title: "Freefall", artist: "Skepsis", prov: "soundcloud" },
            { k: "unid", idLabel: "Skepsis - ID", prov: "soundcloud", suspectedArtist: "Skepsis" },
            { k: "id", title: "Where U Are", artist: "Interplanetary Criminal", prov: "soundcloud" },
            { k: "raw", text: "4x4 dub (unreleased)", prov: "soundcloud" },
            { k: "res", idLabel: "ID - ID", title: "Rhythm Is Key", artist: "salute", prov: "community" },
          ],
          2700,
        ),
      },
    ];
  },
};

export const adapters: SourceAdapter[] = [oneThousandOne, soundcloud];
