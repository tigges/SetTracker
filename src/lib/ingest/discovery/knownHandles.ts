/**
 * Optional resolve hints for discovered artist names → first-party profiles.
 * Used when auto-promoting high-scoring candidates into YouTube/SC polls.
 */

export type HandleHint = {
  youtubeHandle?: string;
  soundcloudPermalink?: string;
  bandcampUrl?: string;
  genre?: string;
  accent?: string;
};

/** Lowercase name / slug keys → source handles */
export const KNOWN_HANDLES: Record<string, HandleHint> = {
  "james hype": {
    youtubeHandle: "@JamesHype",
    soundcloudPermalink: "jameshype",
    genre: "Tech House",
    accent: "#ff3d6e",
  },
  "tita lau": {
    youtubeHandle: "@TitaLau",
    soundcloudPermalink: "titalau",
    genre: "Tech House",
    accent: "#ff8fab",
  },
  "chris lake": {
    youtubeHandle: "@ChrisLake",
    soundcloudPermalink: "chrislake",
    genre: "Tech House",
    accent: "#3d8bfd",
  },
  fisher: {
    youtubeHandle: "@fisher",
    soundcloudPermalink: "fish-tales",
    genre: "Tech House",
    accent: "#00c2ff",
  },
  "oliver heldens": {
    youtubeHandle: "@OliverHeldens",
    soundcloudPermalink: "oliverheldens",
    genre: "Future House",
    accent: "#7c5cff",
  },
  "vintage culture": {
    youtubeHandle: "@VintageCulture",
    soundcloudPermalink: "vintageculturemusic",
    genre: "Tech House",
    accent: "#e85d04",
  },
  "hannah laing": {
    youtubeHandle: "@HannahLaingDJ",
    soundcloudPermalink: "hannahlaingdj",
    genre: "Techno",
    accent: "#ff006e",
  },
  pawsa: {
    youtubeHandle: "@PAWSA",
    soundcloudPermalink: "pawsa",
    genre: "Tech House",
    accent: "#adb5bd",
  },
  "bleu clair": {
    youtubeHandle: "@bleuclairmusic",
    soundcloudPermalink: "bleuclair",
    genre: "Tech House",
    accent: "#4cc9f0",
  },
  prospa: {
    soundcloudPermalink: "prospauk",
    genre: "House",
    accent: "#ffd166",
  },
  "mau p": {
    soundcloudPermalink: "realmaup",
    genre: "Tech House",
    accent: "#118ab2",
  },
  "black coffee": {
    soundcloudPermalink: "realblackcoffee",
    genre: "Afro House",
    accent: "#222222",
  },
  "chapter & verse": {
    soundcloudPermalink: "chapterandverseofficial",
    genre: "Bass House",
    accent: "#f77f00",
  },
  "purple disco machine": {
    youtubeHandle: "@purplediscomachine",
    soundcloudPermalink: "purplediscomachine",
    genre: "Nu-Disco",
    accent: "#9b5de5",
  },
  "gorgon city": {
    youtubeHandle: "@GorgonCity",
    soundcloudPermalink: "gorgon-city",
    genre: "House",
    accent: "#f15bb5",
  },
  "sammy virji": {
    youtubeHandle: "@SammyVirji",
    soundcloudPermalink: "sammyvirji",
    genre: "UK Garage",
    accent: "#00f5d4",
  },
  sidepiece: {
    soundcloudPermalink: "sidepiece",
    genre: "Tech House",
    accent: "#fee440",
  },
  "walker & royce": {
    youtubeHandle: "@WalkerAndRoyce",
    soundcloudPermalink: "walker-and-royce",
    genre: "Tech House",
    accent: "#9ef01a",
  },
  "max styler": {
    youtubeHandle: "@MaxStyler",
    soundcloudPermalink: "maxstyler",
    genre: "Tech House",
    accent: "#ff9f1c",
  },
  biscits: {
    youtubeHandle: "@Biscits",
    soundcloudPermalink: "biscits",
    genre: "Tech House",
    accent: "#ef476f",
  },
  "tony romero": {
    soundcloudPermalink: "tonyromero",
    genre: "Tech House",
    accent: "#06d6a0",
  },
};

export function hintForName(name: string): HandleHint | undefined {
  const key = name.trim().toLowerCase();
  if (KNOWN_HANDLES[key]) return KNOWN_HANDLES[key];
  const compact = key.replace(/ø/g, "o").replace(/ö/g, "o").replace(/ü/g, "u");
  return KNOWN_HANDLES[compact];
}
