/**
 * Master roster of identified artists we want to deep-scan.
 * Single source of truth for YouTube / SoundCloud seeds + handle gaps.
 *
 * Curated entries live below; discovery can append graduates via
 * data/roster-graduates.json (see discovery/graduateRoster.ts).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export type HandleStatus = "ok" | "weak" | "missing" | "unverified";

export type ArtistRosterEntry = {
  name: string;
  genre: string;
  accent: string;
  homeCity?: string;
  youtube?: { handle: string; status: HandleStatus; note?: string };
  soundcloud?: {
    permalink: string;
    userId: number;
    status: HandleStatus;
    note?: string;
  };
  website?: string;
  /** Other known social URLs (instagram, x, linktree) */
  socials?: string[];
  /** Deep-scan priority — higher artists get larger poll budgets */
  priority?: "high" | "normal";
};

function loadRosterGraduates(): ArtistRosterEntry[] {
  try {
    const path =
      process.env.ROSTER_GRADUATES_PATH ||
      join(process.cwd(), "data", "roster-graduates.json");
    const parsed = JSON.parse(readFileSync(path, "utf8")) as {
      artists?: ArtistRosterEntry[];
    };
    return Array.isArray(parsed.artists) ? parsed.artists : [];
  } catch {
    return [];
  }
}

/**
 * Hand-curated seed artists. Prefer editing this list for known brand DJs.
 */
export const ARTIST_ROSTER_CURATED: ArtistRosterEntry[] = [
  // ---- High-signal tracklist / live publishers ----
  {
    name: "James Hype",
    genre: "Tech House",
    accent: "#ff3d6e",
    homeCity: "Liverpool, UK",
    youtube: { handle: "@JamesHype", status: "ok" },
    soundcloud: {
      permalink: "jameshypethedj",
      userId: 121047111,
      status: "ok",
      note: "canonical SC; jameshype is a weak/empty stub",
    },
    website: "https://www.jameshype.com",
    socials: [
      "https://www.youtube.com/channel/UCkAmFYllx331zGshdN4xPng",
      "https://www.youtube.com/watch?v=Ojw5OHHCk2I",
      "https://www.youtube.com/watch?v=rLTCLSsqrXY",
      "https://lnk.to/JH-TRIGGER",
      "https://soundcloud.com/jameshypethedj",
    ],
    priority: "high",
  },
  {
    name: "Tita Lau",
    genre: "Tech House",
    accent: "#ff8fab",
    youtube: { handle: "@TitaLau", status: "ok" },
    soundcloud: {
      permalink: "titalau",
      userId: 269011945,
      status: "weak",
      note: "0 tracks on SC profile",
    },
    priority: "high",
  },
  {
    name: "Chris Lake",
    genre: "Tech House",
    accent: "#3d8bfd",
    homeCity: "London, UK",
    youtube: { handle: "@ChrisLake", status: "ok" },
    soundcloud: { permalink: "chrislake", userId: 118319, status: "ok" },
    socials: ["https://instagram.com/chrislake", "https://twitter.com/chrislake"],
    priority: "high",
  },
  {
    name: "FISHER",
    genre: "Tech House",
    accent: "#00c2ff",
    youtube: { handle: "@fisher", status: "ok" },
    soundcloud: {
      permalink: "fish-tales",
      userId: 289944,
      status: "ok",
      note: "official SC (followthefishtv.com in bio)",
    },
    website: "https://followthefishtv.com",
    socials: [
      "https://instagram.com/followthefishtv",
      "https://tiktok.com/@FISHER",
      "https://facebook.com/followthefishtv.tv",
    ],
    priority: "high",
  },
  {
    name: "Oliver Heldens",
    genre: "Future House",
    accent: "#7c5cff",
    homeCity: "Netherlands",
    youtube: { handle: "@OliverHeldens", status: "ok" },
    soundcloud: { permalink: "oliverheldens", userId: 2279060, status: "ok" },
    socials: [
      "http://instagram.com/heldeeprecords/",
      "http://soundcloud.com/HeldeepRecords/",
    ],
    priority: "high",
  },
  {
    name: "Vintage Culture",
    genre: "Tech House",
    accent: "#e85d04",
    youtube: { handle: "@VintageCulture", status: "ok" },
    soundcloud: {
      permalink: "vintageculturemusic",
      userId: 15708649,
      status: "ok",
    },
    priority: "high",
  },
  {
    name: "MEDUZA",
    genre: "House",
    accent: "#5cc7e8",
    homeCity: "Italy",
    youtube: { handle: "@meduzamusic", status: "ok" },
    soundcloud: { permalink: "meduzamusic", userId: 572691174, status: "ok" },
    priority: "normal",
  },
  {
    name: "Wax Motif",
    genre: "G-House",
    accent: "#c56cff",
    youtube: { handle: "@WaxMotif", status: "ok" },
    soundcloud: { permalink: "waxmotif", userId: 11978, status: "ok" },
    priority: "normal",
  },
  {
    name: "John Summit",
    genre: "Tech House",
    accent: "#7cffb2",
    homeCity: "Chicago, US",
    youtube: { handle: "@johnsummit", status: "ok" },
    soundcloud: { permalink: "johnsummit", userId: 173854108, status: "ok" },
    priority: "normal",
  },
  {
    name: "Cloonee",
    genre: "Tech House",
    accent: "#f08a3d",
    youtube: { handle: "@cloonee", status: "ok" },
    soundcloud: { permalink: "cloonee", userId: 78975954, status: "ok" },
    priority: "normal",
  },
  {
    name: "Gorgon City",
    genre: "House",
    accent: "#f15bb5",
    youtube: { handle: "@GorgonCity", status: "ok" },
    soundcloud: { permalink: "gorgon-city", userId: 12172879, status: "ok" },
    priority: "normal",
  },
  {
    name: "Walker & Royce",
    genre: "Tech House",
    accent: "#9ef01a",
    youtube: { handle: "@WalkerAndRoyce", status: "ok" },
    soundcloud: {
      permalink: "walker-and-royce",
      userId: 7055425,
      status: "ok",
    },
    priority: "normal",
  },
  {
    name: "Max Styler",
    genre: "Tech House",
    accent: "#ff9f1c",
    youtube: { handle: "@MaxStyler", status: "ok" },
    soundcloud: { permalink: "maxstyler", userId: 8834846, status: "ok" },
    priority: "normal",
  },
  {
    name: "Hannah Laing",
    genre: "Techno",
    accent: "#ff006e",
    youtube: { handle: "@HannahLaingDJ", status: "ok" },
    soundcloud: {
      permalink: "hannahlaingdj",
      userId: 5008420,
      status: "ok",
    },
    priority: "high",
  },
  {
    name: "PAWSA",
    genre: "Tech House",
    accent: "#adb5bd",
    youtube: { handle: "@PAWSA", status: "ok" },
    soundcloud: { permalink: "pawsa", userId: 2265457, status: "ok" },
    priority: "normal",
  },
  {
    name: "Bleu Clair",
    genre: "Tech House",
    accent: "#4cc9f0",
    youtube: { handle: "@bleuclairmusic", status: "ok" },
    soundcloud: { permalink: "bleuclair", userId: 20599284, status: "ok" },
    priority: "normal",
  },
  {
    name: "BIJOU",
    genre: "G-House",
    accent: "#ff5c8a",
    homeCity: "Los Angeles, US",
    youtube: { handle: "@BIJOU", status: "ok" },
    soundcloud: { permalink: "bijou", userId: 2080568, status: "ok" },
    priority: "normal",
  },
  {
    name: "Prospa",
    genre: "House",
    accent: "#ffd166",
    youtube: { handle: "@ProspaUK", status: "ok" },
    soundcloud: { permalink: "prospauk", userId: 69483974, status: "ok" },
    socials: ["https://www.youtube.com/channel/UCMasYklV4R1r6q3-YeBSnwQ"],
    priority: "normal",
  },
  {
    name: "SIDEPIECE",
    genre: "Tech House",
    accent: "#fee440",
    youtube: { handle: "@youasidepiece", status: "ok" },
    soundcloud: { permalink: "sidepiece", userId: 647038533, status: "ok" },
    website: "https://hoo.be/youasidepiece",
    socials: [
      "https://www.youtube.com/channel/UC4CFtujFMNGXRixR5tCPKdQ",
      "https://instagram.com/sidepiece",
      "https://twitter.com/youasidepiece",
      "https://lnk.to/CLR019",
    ],
    priority: "normal",
  },
  {
    name: "Sammy Virji",
    genre: "UK Garage",
    accent: "#00f5d4",
    youtube: { handle: "@SammyVirji", status: "ok" },
    soundcloud: { permalink: "sammyvirji", userId: 33443491, status: "ok" },
    priority: "normal",
  },
  {
    name: "BISCITS",
    genre: "Tech House",
    accent: "#ef476f",
    youtube: { handle: "@Biscits", status: "ok" },
    soundcloud: { permalink: "biscits", userId: 275644376, status: "ok" },
    socials: [
      "https://instagram.com/itsbiscits",
      "https://facebook.com/biscits",
      "https://open.spotify.com/artist/052B9SONfhoScw7dgYWw5o",
      "https://www.beatport.com/artist/biscits/591990",
    ],
    priority: "normal",
  },
  {
    name: "Mau P",
    genre: "Tech House",
    accent: "#118ab2",
    youtube: { handle: "@maupmusic", status: "ok" },
    soundcloud: { permalink: "realmaup", userId: 1154700529, status: "ok" },
    socials: [
      "https://instagram.com/maupmusic",
      "https://twitter.com/realmaup",
    ],
    priority: "normal",
  },
  {
    name: "Black Coffee",
    genre: "Afro House",
    accent: "#222222",
    youtube: { handle: "@realblackcoffee", status: "ok" },
    soundcloud: {
      permalink: "realblackcoffee",
      userId: 4941960,
      status: "ok",
    },
    priority: "normal",
  },
  {
    name: "Chapter & Verse",
    genre: "Bass House",
    accent: "#f77f00",
    youtube: { handle: "@chapterandversemusic", status: "ok" },
    soundcloud: {
      permalink: "chapterandverseofficial",
      userId: 701819711,
      status: "ok",
    },
    priority: "normal",
  },
  {
    name: "AC Slater",
    genre: "Bass House",
    accent: "#f2b33d",
    homeCity: "Los Angeles, US",
    youtube: { handle: "@acslater", status: "ok" },
    soundcloud: { permalink: "acslater", userId: 1423532, status: "ok" },
    website: "https://linktr.ee/acslater",
    priority: "normal",
  },
  {
    name: "Marten Horger",
    genre: "Bass House",
    accent: "#ff7a45",
    homeCity: "Berlin, DE",
    youtube: { handle: "@MARTENHORGER", status: "ok" },
    soundcloud: { permalink: "marten-horger", userId: 242146, status: "ok" },
    website: "https://marten.fanlink.tv/rave-pv-anthem",
    socials: [
      "https://facebook.com/marten.horger",
      "https://instagram.com/marten_horger",
      "https://open.spotify.com/artist/0EdUwJSqkMmsH6Agg3G8Ls",
    ],
    priority: "normal",
  },
  {
    name: "David Guetta",
    genre: "House",
    accent: "#1e90ff",
    homeCity: "Paris, FR",
    youtube: { handle: "@davidguetta", status: "ok" },
    soundcloud: { permalink: "davidguetta", userId: 201859, status: "ok" },
    website: "https://davidguetta.com",
    socials: [
      "https://instagram.com/davidguetta",
      "https://x.com/davidguetta",
      "https://open.spotify.com/artist/1Cs0zKBU1kc0i8ypK3B9ai",
    ],
    priority: "high",
  },
  {
    name: "Men Machine",
    genre: "Bass House",
    accent: "#ff4d6d",
    homeCity: "Paris / Berlin",
    // Project alias for Guetta × Horger — poll when handles resolve.
    youtube: { handle: "@davidguetta", status: "weak", note: "project under Guetta channel for now" },
    soundcloud: { permalink: "davidguetta", userId: 201859, status: "weak", note: "project releases often land on Guetta SC" },
    priority: "normal",
  },
  {
    name: "Dom Dolla",
    genre: "Tech House",
    accent: "#ff4d6d",
    homeCity: "Melbourne, AU",
    youtube: { handle: "@domdolla", status: "ok" },
    soundcloud: { permalink: "domdolla", userId: 627109, status: "ok" },
    priority: "normal",
  },
  {
    name: "Solomun",
    genre: "Melodic House",
    accent: "#f0e6d8",
    homeCity: "Hamburg, DE",
    youtube: { handle: "@solomunmusic", status: "ok" },
    soundcloud: { permalink: "solomun", userId: 4545, status: "ok" },
    priority: "normal",
  },
  {
    name: "Robin Schulz",
    genre: "House",
    accent: "#5aa9e6",
    homeCity: "Germany",
    youtube: { handle: "@robinschulz", status: "ok" },
    soundcloud: { permalink: "robin-schulz", userId: 7293319, status: "ok" },
    website: "https://robin-schulz.com",
    socials: [
      "https://facebook.com/robin.schulz.official",
      "https://instagram.com/robin__schulz",
      "https://tiktok.com/@robinschulzofficial",
      "https://twitter.com/robin_schulz",
      "https://open.spotify.com/artist/3t5xRXzsuZmMDkQzgOX35S",
      "https://music.apple.com/de/artist/robin-schulz/347433400",
    ],
    priority: "normal",
  },
  {
    name: "Keinemusik",
    genre: "Afro House",
    accent: "#e8c547",
    homeCity: "Berlin, DE",
    youtube: { handle: "@keinemusik", status: "ok" },
    soundcloud: { permalink: "keinemusik", userId: 42109, status: "ok" },
    socials: ["https://ffm.to/km074"],
    priority: "normal",
  },
];

/**
 * Effective deep-scan roster = curated + graduated discovery candidates.
 */
export const ARTIST_ROSTER: ArtistRosterEntry[] = [
  ...ARTIST_ROSTER_CURATED,
  ...loadRosterGraduates(),
];

export function rosterMissingHandles(): ArtistRosterEntry[] {
  return ARTIST_ROSTER.filter((a) => {
    const yt = a.youtube?.status;
    const sc = a.soundcloud?.status;
    return (
      yt === "missing" ||
      yt === "weak" ||
      yt === "unverified" ||
      sc === "missing" ||
      sc === "weak" ||
      sc === "unverified" ||
      !a.youtube?.handle ||
      !a.soundcloud?.permalink
    );
  });
}
