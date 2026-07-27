/**
 * Browser-captured 1001Tracklists for July 2026 festival sets.
 * Provenance "1001tl". Only wire when an official YT/SC playback URL exists.
 */

import type { FingerprintSeedRow } from "../fingerprint/seeds";
import { parseClockToSec } from "../fingerprint/seeds";

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** Assign evenly spaced clocks when 1001TL has no cues (≈ durationSec). */
export function evenlySpaceRows(
  rows: Omit<FingerprintSeedRow, "at">[],
  durationSec: number,
): FingerprintSeedRow[] {
  const n = rows.length;
  if (!n) return [];
  const usable = Math.max(60, durationSec - 45);
  const step = Math.max(45, Math.floor(usable / n));
  return rows.map((r, i) => ({
    ...r,
    at: formatClock(20 + i * step),
  }));
}

/**
 * MARTEN HØRGER @ Mainstage, Parookaville, Germany 2026-07-19
 * Official YT: https://www.youtube.com/watch?v=EbNRjEFZpDw (~59m)
 * Capture: operator paste from 1001TL (2026-07-27).
 */
export const TL_MARTEN_HORGER_PAROOKAVILLE_2026: FingerprintSeedRow[] = [
  { at: "0:11", artist: "MARTEN HØRGER", title: "Tom's Diner" },
  { at: "3:25", artist: "bradeazy ft. TyriqueOrDie", title: "Up Down" },
  { at: "4:50", artist: "Lady GaGa", title: "Poker Face (CHALANT Remix)" },
  { at: "6:30", artist: "KENZ", title: "Rake It Up" },
  {
    at: "8:12",
    artist: "Kid Cudi ft. MGMT & Ratatat",
    title: "Pursuit Of Happiness (MEDUN Remix)",
  },
  {
    at: "14:25",
    artist: "Congorock ft. Mr. Lexx",
    title:
      "Babylon (David Guetta & MARTEN HØRGER pres. Men Machine & KENZ Rework)",
  },
  {
    at: "18:15",
    artist: "John Newman",
    title: "Love Me Again (Again) (MARTEN HØRGER Remix)",
  },
  {
    at: "24:00",
    artist: "Dr. Fresch & MARTEN HØRGER",
    title: "Take A Step Back (Dr. Fresch VIP)",
  },
  { at: "24:46", artist: "MARTEN HØRGER", title: "Ill Behavior" },
  {
    at: "28:45",
    artist: "Pharoahe Monch",
    title: "Simon Says (Bassjackers Bootleg)",
  },
  { at: "30:20", artist: "Dillon Francis & MARTEN HØRGER", title: "B2U" },
  { at: "33:25", artist: "Daft Punk", title: "One More Time (HILLS Remix)" },
  {
    at: "40:05",
    artist: "MGMT",
    title: "Kids (Men Machine Rework)",
  },
  {
    at: "42:54",
    artist: "David Guetta & MARTEN HØRGER pres. Men Machine",
    title: "The Past, The Present, The Future",
  },
  {
    at: "46:12",
    artist: "Zombie Nation",
    title: "Kernkraft 400 (ID Remix)",
  },
  { at: "49:25", artist: "MARTEN HØRGER", title: "Worth The Wait" },
  { at: "52:20", artist: "MARTEN HØRGER", title: "No Bite" },
  {
    at: "56:00",
    artist: "MARTEN HØRGER",
    title: "Rave (PAROOKAVILLE Anthem 2026)",
  },
];

/**
 * Cloonee & Prospa @ Music On, Destino Pacha Ibiza, 2026-07-09
 * Official SC: https://soundcloud.com/cloonee/clooneeb2bprospa
 * Official YT: https://www.youtube.com/watch?v=UE6wjxvMRz0
 */
export const TL_CLOONEE_PROSPA_DESTINO_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Joey London Style & Pheelo", title: "Never Stop" },
  { at: "0:00", artist: "Masters At Work", title: "Work (Acappella)" },
  { at: "8:30", artist: "Simes", title: "Funky Feeling" },
  { at: "11:37", artist: "Miro", title: "Watching Me" },
  { at: "14:37", artist: "Finky", title: "Move Ya Body" },
  { at: "18:00", artist: "Mau P", title: "Just A Little Bit" },
  { at: "22:30", artist: "Franky Rizardo", title: "Shinjuku" },
  { at: "26:45", artist: "Nate Irvin & Landen Gill", title: "Move To The Beat" },
  { at: "33:45", artist: "KETTAMA", title: "Raw Cuts (Michael Bibi Remix)" },
  {
    at: "37:50",
    artist: "Julian Fijma",
    title: "Get Stupid (Micah Baxter Edit)",
  },
  {
    at: "40:40",
    artist: "Prospa",
    title: "ID (Momma Used To Dance Like That)",
  },
  { at: "44:40", artist: "PAWSA", title: "TOO COOL TO BE CARELESS" },
  { at: "44:40", artist: "Cloonee", title: "Sippin' Yak" },
  { at: "48:35", artist: "Prospa & Murda Beatz", title: "Baby" },
  {
    at: "52:36",
    artist: "Cloonee & Prospa ft. Tristan Henry",
    title: "Good Girl",
  },
  { at: "56:16", artist: "Sapian", title: "Reason Why" },
  {
    at: "1:00:15",
    artist: "Danny Tenaglia ft. Celeda",
    title: "Music Is The Answer (Dancin' And Prancin') (ID Remix)",
  },
  {
    at: "1:02:30",
    artist: "Tre Reynolds & Ferra Black ft. Crazy Cousinz & Calista Kazuko",
    title: "Bongos (In The Morning)",
  },
  { at: "1:05:25", artist: "FIRZA", title: "Disco Whoops" },
  {
    at: "1:09:30",
    artist: "Alex Atenciano & Mr Martin",
    title: "Give Me The Rythm",
  },
  { at: "1:15:29", artist: "Cloonee & Prospa", title: "Free Your Mind" },
  {
    at: "1:20:00",
    artist: "Storm Queen",
    title: "Look Right Through (Franky Rizardo Remix)",
  },
  { at: "1:24:00", artist: "Sonny Kane", title: "Never Leave U" },
  { at: "1:26:35", artist: "2Seater", title: "Street Playaz" },
];

/**
 * Charlotte de Witte @ Mainstage, Tomorrowland Weekend 1, 2026-07-19
 * Official SC: https://soundcloud.com/charlottedewittemusic/charlotte-de-witte-at (~59:01)
 * 1001TL cues untimed — clocks evenly spaced across ~59m. Skips bare ID–ID rows.
 */
export const TL_CHARLOTTE_DE_WITTE_TML_WE1_2026: FingerprintSeedRow[] =
  evenlySpaceRows(
    [
      {
        artist: "Enrico Sangiuliano",
        title: "The Techno Code (Charlotte de Witte Acid Code)",
      },
      {
        artist: "Electric Universe & Greg Hilight",
        title: "Om Namah Shivaya",
      },
      {
        artist: "Charlotte de Witte ft. Conduit",
        title: "A Prayer For The Dancefloor (Avalon & GMS Remix)",
      },
      {
        artist: "Charlotte de Witte & Theo Nasa",
        title: "The Resistance",
      },
      { artist: "Lilly Palmer", title: "Living Fast" },
      {
        artist: "Bl4ck Hole & Invader Space",
        title: "Ragga Man (Burn In Noise & Becker Remix)",
      },
      { artist: "Pan-Pot", title: "Funke (Audio State Remix)" },
      {
        artist: "Vini Vici & Tristan & Avalon",
        title: "Music Is The Answer",
      },
      {
        artist: "Pupa Nas T & FOVOS ft. Denise Belfon",
        title: "Work Edit",
      },
      {
        artist: "Yenkov & Gaston Fiore",
        title: "Bring Back Emotions",
      },
    ],
    59 * 60 + 1,
  );

/** SoundCloud sourceSlug → curated 1001TL seed (official uploads only). */
export const TRACKLIST_1001_BY_SOURCE_SLUG: Record<
  string,
  FingerprintSeedRow[]
> = {
  "sc-charlottedewittemusic-charlotte-de-witte-at":
    TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  "sc-cloonee-clooneeb2bprospa": TL_CLOONEE_PROSPA_DESTINO_2026,
};

/** Sanity: every seeded clock must parse. */
export function assertSeedClocks(rows: FingerprintSeedRow[]): void {
  for (const r of rows) {
    if (parseClockToSec(r.at) == null) {
      throw new Error(`bad 1001tl clock: ${r.at} (${r.artist} - ${r.title})`);
    }
  }
}
