/**
 * Manual fingerprint tracklists for curated sets.
 *
 * Source: direct ACRCloud / AudD (or equivalent) analysis results pasted by
 * operators — never scrape AudioScout / TrackId / MusicMate / Set79 HTML.
 * aha-music.com URL analysis is acceptable when the human pastes the IDs here.
 * 1001TL follow-links / curated captures live in `tracklists1001/` (provenance
 * "1001tl"), not here.
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

/**
 * James Hype — Get Closer, London #2 (tBvllfEXio4).
 * Fingerprint analysis (aha-music URL → pasted 2026-07-26).
 * Dropped garbled / off-genre false positives from the raw dump.
 */
export const FP_JAMES_HYPE_GET_CLOSER_LONDON_2: FingerprintSeedRow[] = [
  { at: "01:00", artist: "Harvy Valencia, Mrodriguez", title: "Lolly" },
  {
    at: "03:01",
    artist: "Hannah Laing, Stephen Kirkwood",
    title: "Don't Wanna Go",
  },
  { at: "05:30", artist: "Mp Nemmo", title: "Mystic Vibes" },
  { at: "07:12", artist: "DJ Cheese", title: "3,6 and nine" },
  { at: "08:00", artist: "Chaval (BR)", title: "Suv (Original Mix)" },
  { at: "09:30", artist: "OC", title: "Skrrrt Riddim" },
  { at: "10:10", artist: "AKSON MUSIC", title: "Believe In Love INS" },
  { at: "11:41", artist: "Stefano Noferini", title: "Extramelody" },
  { at: "13:00", artist: "Le Ptit Mike", title: "Natural Remind" },
  { at: "13:22", artist: "Camille Yarbrough", title: "Take Yo' Praise" },
  {
    at: "14:00",
    artist: "Misericordie",
    title: "Voodoo People (Rave Mix)",
  },
  { at: "17:14", artist: "Suga7", title: "Bass Shock (Original Mix)" },
  { at: "19:00", artist: "KC Wray", title: "Nushit (Original Mix)" },
  {
    at: "19:26",
    artist: "James Hype, Kim Petras, Tiësto",
    title: "Drums (Tiësto Remix)",
  },
  { at: "23:12", artist: "Rihanna", title: "Pour It Up (Club Remix)" },
  {
    at: "25:06",
    artist: "Exodus, Richard Grey",
    title: "What You Say",
  },
  {
    at: "25:55",
    artist: "Anatoliy Frolov",
    title: "Memories (Extended Mix)",
  },
  { at: "26:30", artist: "James Hype", title: "Wild" },
  {
    at: "28:30",
    artist: "Gangs Type, Lissat",
    title: "Loca People (Tribal Mix)",
  },
  { at: "29:30", artist: "The Electroclassic", title: "Daft Sounds" },
];

/**
 * Keinemusik Radio Show by FIFI 07.08.2026
 * https://soundcloud.com/keinemusik/keinemusik-radio-show-by-fifi-07082026
 * ACRCloud Identify 2026-08-16 (min score 55, 12s clips / 90s step).
 * Consecutive same-track hits collapsed to first clock. Weak misses
 * (score below 55) not seeded.
 */
export const FP_KEINEMUSIK_RADIO_FIFI_20260807: FingerprintSeedRow[] = [
  {
    at: "0:30",
    artist: "Don Carlos, Kim Mazelle",
    title: "Someone Gotta Found Love (feat. Kim Mazelle) (Alone Mix)",
  },
  { at: "8:00", artist: "Reboot", title: "Danz Danz (Original Mix)" },
  {
    at: "15:30",
    artist: "Ollie BC, Mason Collective, Dany Gomez, EMBI",
    title: "Mi Combi (Original Mix)",
  },
  {
    at: "20:00",
    artist: "Fish Go Deep",
    title: "The Cure & The Cause (feat. Tracey K)",
  },
  { at: "27:30", artist: "M-High", title: "Craving What Ain't Mine" },
  { at: "36:30", artist: "Classmatic, Mc Th", title: "Catuca" },
  { at: "41:00", artist: "Sucker DJs", title: "Lotta Lovin'" },
  {
    at: "45:30",
    artist: "Armand Van Helden, Duck Sauce, A-Trak",
    title: "Mesmerize",
  },
  { at: "48:30", artist: "Afriqua", title: "Da Whip" },
  { at: "51:30", artist: "Kitty Hall", title: "Puff Puff Pass" },
  { at: "56:00", artist: "Dj Danifox", title: "Se Eu Cantar" },
];
