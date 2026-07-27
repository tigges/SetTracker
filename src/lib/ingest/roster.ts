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
      "https://www.instagram.com/followthefishtv/",
      "https://tiktok.com/@FISHER",
      "https://facebook.com/followthefishtv.tv",
      "https://soundcloud.com/fish-tales",
      "https://www.youtube.com/@fisher",
      "https://open.spotify.com/artist/1VJ0briNOlXRtJUAzoUJdt",
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
    // Canonical About links (IG handle is itsbiscits — not @biscits).
    socials: [
      "https://www.instagram.com/itsbiscits/",
      "https://www.facebook.com/biscits/",
      "https://soundcloud.com/biscits",
      "https://open.spotify.com/artist/052B9SONfhoScw7dgYWw5o",
      "https://www.beatport.com/artist/biscits/591990",
      "https://www.youtube.com/@Biscits",
    ],
    priority: "high",
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
    // Canonical YT is user/djacslater → @djacslater (@ACSlater is unrelated).
    youtube: { handle: "@djacslater", status: "ok" },
    soundcloud: { permalink: "acslater", userId: 1423532, status: "ok" },
    website: "https://www.djacslater.com/",
    socials: [
      "https://www.instagram.com/djacslater/",
      "https://www.youtube.com/user/djacslater",
      "https://www.youtube.com/@djacslater",
      "https://open.spotify.com/artist/6EqFMCnVGBRNmwPlk2f3Uc",
      "https://www.beatport.com/artist/ac-slater/52351",
      "https://www.insomniac.com/music/artists/ac-slater/",
    ],
    priority: "normal",
  },
  {
    name: "Marten Horger",
    genre: "Bass House",
    accent: "#ff7a45",
    homeCity: "Berlin, DE",
    youtube: { handle: "@MARTENHORGER", status: "ok" },
    soundcloud: { permalink: "marten-horger", userId: 242146, status: "ok" },
    website: "https://www.martenhorger.com/",
    socials: [
      "https://www.martenhorger.com/",
      "https://facebook.com/marten.horger",
      "https://instagram.com/marten_horger",
      "https://www.tiktok.com/@MARTENHORGER",
      "https://www.youtube.com/@MARTENHORGER",
      "https://soundcloud.com/marten-horger",
      "https://open.spotify.com/artist/0EdUwJSqkMmsH6Agg3G8Ls",
    ],
    priority: "high",
  },
  {
    name: "David Guetta",
    genre: "House",
    accent: "#1e90ff",
    homeCity: "Paris, FR",
    youtube: { handle: "@davidguetta", status: "ok" },
    soundcloud: {
      permalink: "davidguetta",
      userId: 4904351,
      status: "ok",
      note: "live SC userId (was stale 201859)",
    },
    website: "https://davidguetta.com",
    socials: [
      "https://www.instagram.com/davidguetta/",
      "https://x.com/davidguetta",
      "https://soundcloud.com/davidguetta",
      "https://www.youtube.com/@davidguetta",
      "https://open.spotify.com/artist/1Cs0zKBU1kc0i8ypK3B9ai",
    ],
    priority: "high",
  },
  {
    name: "ARTBAT",
    genre: "Melodic Techno",
    accent: "#6c63ff",
    homeCity: "Kyiv, UA",
    youtube: { handle: "@ARTBAT", status: "ok" },
    soundcloud: {
      permalink: "artbatmusic",
      userId: 14008227,
      status: "ok",
    },
    website: "https://www.beatport.com/artist/artbat/499932",
    socials: [
      "https://www.instagram.com/artbatmusic/",
      "https://soundcloud.com/artbatmusic",
      "https://www.youtube.com/@ARTBAT",
      "https://open.spotify.com/artist/3BkRu2TGd2I1uBxZKddfg1",
      "https://www.beatport.com/artist/artbat/499932",
      "https://ra.co/dj/Artbat/tour-dates",
    ],
    priority: "high",
  },
  {
    name: "Bizarrap",
    genre: "House",
    accent: "#f4a261",
    homeCity: "Ramos Mejía, AR",
    youtube: { handle: "@Bizarrap", status: "ok" },
    soundcloud: {
      permalink: "bizarrap",
      userId: 302974540,
      status: "ok",
    },
    socials: [
      "https://www.instagram.com/bizarrap/",
      "https://soundcloud.com/bizarrap",
      "https://www.youtube.com/@Bizarrap",
      "https://open.spotify.com/artist/716NhGYqD1jl2wI1Qkgq36",
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
    soundcloud: {
      permalink: "davidguetta",
      userId: 4904351,
      status: "weak",
      note: "project releases often land on Guetta SC",
    },
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
    name: "Odd Mob",
    genre: "Tech House",
    accent: "#b8f200",
    homeCity: "Brisbane, AU",
    youtube: { handle: "@oddmob", status: "ok" },
    soundcloud: { permalink: "oddmob", userId: 34486918, status: "ok" },
    socials: [
      "https://soundcloud.com/oddmob",
      "https://www.instagram.com/odd_mob/",
      "https://www.youtube.com/@oddmob",
      "https://open.spotify.com/artist/4qLwtWhlhyAoQ4S9mSrDW9",
      "https://www.youtube.com/watch?v=ObiAocVMTyo",
    ],
    priority: "normal",
  },
  {
    name: "Westend",
    genre: "Tech House",
    accent: "#f72585",
    homeCity: "New York, US",
    youtube: { handle: "@itsthewestend", status: "ok" },
    soundcloud: {
      permalink: "itsthewestend",
      userId: 29027639,
      status: "ok",
      note: "canonical SC; westend is a different/empty account",
    },
    socials: [
      "https://soundcloud.com/itsthewestend",
      "https://www.youtube.com/@itsthewestend",
      "https://www.beatport.com/artist/westend/576028",
    ],
    priority: "normal",
  },
  {
    name: "Sara Landry",
    genre: "Techno",
    accent: "#9b5de5",
    youtube: { handle: "@saralandry922", status: "ok" },
    soundcloud: {
      permalink: "sara-landry-dj",
      userId: 93585668,
      status: "ok",
    },
    website: "https://www.saralandry.com",
    socials: [
      "https://soundcloud.com/sara-landry-dj",
      "https://www.youtube.com/@saralandry922",
      "https://www.instagram.com/saralandrydj/",
      "https://www.beatport.com/artist/sara-landry/663399",
      "https://www.saralandry.com",
    ],
    priority: "normal",
  },
  {
    name: "Lilly Palmer",
    genre: "Techno",
    accent: "#ff006e",
    youtube: { handle: "@lillypalmer_dj", status: "ok" },
    soundcloud: {
      permalink: "lilly_palmer",
      userId: 193213281,
      status: "ok",
    },
    socials: [
      "https://soundcloud.com/lilly_palmer",
      "https://www.instagram.com/lilly_palmerdj/",
      "https://www.facebook.com/lillypalmer.dj",
      "https://www.tiktok.com/@lillypalmerdj",
      "https://www.youtube.com/@lillypalmer_dj",
      "https://www.beatport.com/artist/lilly-palmer/597345",
    ],
    priority: "normal",
  },
  {
    name: "Tape B",
    genre: "Bass House",
    accent: "#ffbe0b",
    youtube: { handle: "@tapebbeats", status: "ok" },
    soundcloud: {
      permalink: "tape-b-official",
      userId: 38123548,
      status: "ok",
    },
    website: "https://linktr.ee/tapebbeats",
    socials: [
      "https://soundcloud.com/tape-b-official",
      "https://www.youtube.com/@tapebbeats",
      "https://linktr.ee/tapebbeats",
    ],
    priority: "normal",
  },
  {
    name: "HNTR",
    genre: "Techno",
    accent: "#00f5d4",
    homeCity: "Toronto, CA",
    youtube: { handle: "@hntrnet", status: "ok" },
    soundcloud: {
      permalink: "hntrnet",
      userId: 41184115,
      status: "ok",
      note: "canonical SC hntrnet — soundcloud.com/hntr is a different user",
    },
    website: "https://www.hntr.net",
    socials: [
      "https://www.hntr.net",
      "https://soundcloud.com/hntrnet",
      "https://www.instagram.com/hntrnet/",
      "https://www.facebook.com/hntrnet",
      "https://twitter.com/hntrnet",
      "https://www.youtube.com/@hntrnet",
      "https://noneon.com",
    ],
    priority: "normal",
  },
  {
    name: "Layton Giordani",
    genre: "Techno",
    accent: "#4cc9f0",
    youtube: { handle: "@LaytonGiordani", status: "unverified" },
    soundcloud: {
      permalink: "laytongiordani",
      userId: 66586175,
      status: "ok",
    },
    priority: "normal",
  },
  {
    name: "Charlotte de Witte",
    genre: "Techno",
    accent: "#e0e0e0",
    homeCity: "Belgium",
    youtube: { handle: "@charlottedewitte", status: "unverified" },
    soundcloud: {
      permalink: "charlottedewittemusic",
      userId: 200516,
      status: "ok",
    },
    priority: "normal",
  },
  {
    name: "Solomun",
    genre: "Melodic House",
    accent: "#f0e6d8",
    homeCity: "Hamburg, DE",
    youtube: { handle: "@SolomunOfficial", status: "ok" },
    soundcloud: { permalink: "solomun", userId: 4545, status: "ok" },
    website: "https://solomun.org/",
    socials: [
      "https://solomun.org/",
      "https://www.instagram.com/solomun/",
      "https://www.facebook.com/SolomunMusic",
      "https://www.youtube.com/@SolomunOfficial",
      "https://www.tiktok.com/@solomun",
      "https://open.spotify.com/artist/5wJK4kQAkVGjqM9x46KQOC",
      "https://www.beatport.com/artist/solomun/25648",
      "https://music.apple.com/artist/solomun/200779145",
      "https://www.youtube.com/watch?v=g1vH9C_o-vo",
    ],
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
  {
    name: "Gentlemen's Groove",
    genre: "Deep House",
    accent: "#00e5ff",
    homeCity: "South Africa",
    // Long mixes live on hearthis; SC is the label singles account.
    soundcloud: {
      permalink: "gentlemens-groove-records",
      userId: 13671588,
      status: "ok",
    },
    website: "https://www.facebook.com/Gentlemensgroove",
    socials: [
      "https://hearthis.at/gentlemensgroove-oz/",
      "https://www.facebook.com/Gentlemensgroove",
    ],
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
