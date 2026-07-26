/**
 * Manual fingerprint tracklists for curated sets.
 *
 * Source: direct ACRCloud / AudD (or equivalent) analysis results pasted by
 * operators — never scrape AudioScout / TrackId / MusicMate / 1001TL.
 * aha-music.com URL analysis is acceptable when the human pastes the IDs here.
 *
 * Plays are written with provenance "fingerprint". Source ≠ playback: the set
 * keeps its YouTube/SC sourceUrl; we only enrich Played rows.
 */

import type { RawPlay } from "../types";

export type FingerprintSeedRow = {
  /** mm:ss or h:mm:ss from set start */
  at: string;
  artist: string;
  title: string;
};

/** Parse "m:ss" / "mm:ss" / "h:mm:ss" → seconds. */
export function parseClockToSec(raw: string): number | null {
  const parts = raw
    .trim()
    .split(":")
    .map((p) => Number(p));
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (parts.length === 2) return parts[0]! * 60 + parts[1]!;
  if (parts.length === 3) {
    return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  }
  return null;
}

/**
 * Convert seed rows → RawPlay[]. Drops consecutive duplicates (same artist+title
 * within a few seconds — common in fingerprint spam).
 */
export function fingerprintRowsToPlays(
  rows: FingerprintSeedRow[],
): RawPlay[] {
  const out: RawPlay[] = [];
  let lastKey = "";
  let lastTs = -9999;
  for (const row of rows) {
    const timestamp = parseClockToSec(row.at);
    if (timestamp == null) continue;
    const artist = row.artist.replace(/\s+/g, " ").trim();
    const title = row.title.replace(/\s+/g, " ").trim();
    if (!artist || !title) continue;
    const key = `${artist.toLowerCase()}::${title.toLowerCase()}`;
    if (key === lastKey && timestamp - lastTs < 45) continue;
    lastKey = key;
    lastTs = timestamp;
    out.push({
      position: out.length + 1,
      timestamp,
      idStatus: "identified",
      provenance: "fingerprint",
      trackTitle: title,
      artistName: artist,
      rawText: `${artist} - ${title}`,
    });
  }
  return out;
}

/**
 * Prefer fingerprint IDs when the source tracklist is thin; otherwise fill
 * timeline gaps only (never delete stronger youtube/soundcloud rows nearby).
 */
export function mergeFingerprintPlays(
  sourcePlays: RawPlay[],
  fingerprintPlays: RawPlay[],
  opts: { replaceIfSourceBelow?: number; gapHalfSec?: number } = {},
): RawPlay[] {
  const replaceBelow = opts.replaceIfSourceBelow ?? 4;
  const half = opts.gapHalfSec ?? 40;
  const strong = sourcePlays.filter(
    (p) =>
      p.provenance !== "fingerprint" &&
      (p.idStatus === "identified" || p.idStatus === "community_resolved"),
  );

  if (strong.length < replaceBelow) {
    // Sparse source — fingerprint list becomes the tracklist backbone.
    const byTs = new Map<number, RawPlay>();
    for (const p of fingerprintPlays) byTs.set(p.timestamp, p);
    for (const p of strong) byTs.set(p.timestamp, p);
    return [...byTs.values()]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((p, i) => ({ ...p, position: i + 1 }));
  }

  const merged = [...sourcePlays];
  for (const fp of fingerprintPlays) {
    const blocked = merged.some(
      (p) =>
        p.provenance !== "fingerprint" &&
        Math.abs(p.timestamp - fp.timestamp) <= half &&
        (p.idStatus === "identified" || p.idStatus === "community_resolved"),
    );
    if (blocked) continue;
    const nearFp = merged.find(
      (p) =>
        p.provenance === "fingerprint" &&
        Math.abs(p.timestamp - fp.timestamp) <= half,
    );
    if (nearFp) continue;
    merged.push(fp);
  }
  return merged
    .sort((a, b) => a.timestamp - b.timestamp || a.position - b.position)
    .map((p, i) => ({ ...p, position: i + 1 }));
}

/**
 * James Hype — Get Closer, London (oVOuXYtqi6I).
 * Fingerprint analysis (aha-music URL → pasted 2026-07-26).
 */
export const FP_JAMES_HYPE_GET_CLOSER_LONDON: FingerprintSeedRow[] = [
  { at: "00:31", artist: "SØLL", title: "That's The Way" },
  { at: "00:58", artist: "Reblok", title: "No Signal" },
  {
    at: "03:31",
    artist: "Alternative Reality",
    title: "Poor Man's Disco (Producer's Cut)",
  },
  {
    at: "04:21",
    artist: "FISHER, MERYLL",
    title: "Yeah The Girls (feat. MERYLL)",
  },
  { at: "04:45", artist: "Bruno Furlan", title: "NY to LA" },
  {
    at: "06:41",
    artist: "Gorillaz, Tame Impala, Bootie Brown",
    title:
      "New Gold (feat. Tame Impala and Bootie Brown) [Dom Dolla Remix]",
  },
  { at: "08:50", artist: "Rexkn", title: "Acción (Bonus Track)" },
  {
    at: "09:00",
    artist: "Giuseppe Battaglia & Fabio Amoroso",
    title: "Zombination (Original Mix)",
  },
  { at: "09:13", artist: "Martin Ikin, Roxe", title: "Supa Sharp" },
  { at: "11:46", artist: "Chris Michaels", title: "Yard Man (Original)" },
  {
    at: "12:30",
    artist: "Paul Jacobson Feat. SJ",
    title: "I Love You Stop",
  },
  { at: "12:44", artist: "James Hype, Major Lazer", title: "Number 1" },
  { at: "14:00", artist: "Zurra", title: "Acid Groove (Original Mix)" },
  { at: "16:00", artist: "Dale Howard", title: "Tempo" },
  {
    at: "17:16",
    artist: "Sam Supplier, Marlon Sadler",
    title: "Better Off Alone (Original Mix)",
  },
  { at: "17:51", artist: "DEEJAE ROCKO", title: "TOUCHE (ORIGINAL)" },
  { at: "18:11", artist: "Cinthie", title: "You Know How" },
  { at: "21:00", artist: "Pancratio", title: "MAPA" },
  { at: "21:40", artist: "Who da Funk", title: "Shiny Disco Balls" },
  {
    at: "24:24",
    artist: "Who Da Funk, Jessica Eve",
    title: "Shiny Disco Balls (Main Mix)",
  },
  { at: "26:28", artist: "Jengi", title: "Bel Mercy (Extended Mix)" },
  { at: "28:42", artist: "Currents", title: "Again?" },
  {
    at: "28:56",
    artist: "Chris Lorenzo, SOSA UK",
    title: "Mami (feat. COBRAH) (SOSA Remix)",
  },
  { at: "31:57", artist: "Majestic", title: "Annihilator (Extended Mix)" },
  {
    at: "32:01",
    artist: "Djose Elenko, Cesar Rincon, Gabi. F",
    title: "We Get Blind (Carlos Saez Mix)",
  },
  { at: "33:00", artist: "James Hype", title: "Lose Control" },
];
