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
    soundcloudPermalink: "jameshypethedj",
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
  "follow the fish": {
    youtubeHandle: "@fisher",
    soundcloudPermalink: "fish-tales",
    genre: "Tech House",
    accent: "#00c2ff",
  },
  artbat: {
    youtubeHandle: "@ARTBAT",
    soundcloudPermalink: "artbatmusic",
    genre: "Melodic Techno",
    accent: "#6c63ff",
  },
  "art bat": {
    youtubeHandle: "@ARTBAT",
    soundcloudPermalink: "artbatmusic",
    genre: "Melodic Techno",
    accent: "#6c63ff",
  },
  bizarrap: {
    youtubeHandle: "@Bizarrap",
    soundcloudPermalink: "bizarrap",
    genre: "House",
    accent: "#f4a261",
  },
  bzrp: {
    youtubeHandle: "@Bizarrap",
    soundcloudPermalink: "bizarrap",
    genre: "House",
    accent: "#f4a261",
  },
  "marten horger": {
    youtubeHandle: "@MARTENHORGER",
    soundcloudPermalink: "marten-horger",
    genre: "Bass House",
    accent: "#ff7a45",
  },
  "david guetta": {
    youtubeHandle: "@davidguetta",
    soundcloudPermalink: "davidguetta",
    genre: "House",
    accent: "#1e90ff",
  },
  "men machine": {
    youtubeHandle: "@davidguetta",
    soundcloudPermalink: "davidguetta",
    genre: "Bass House",
    accent: "#ff4d6d",
  },
  "robin schulz": {
    youtubeHandle: "@robinschulz",
    soundcloudPermalink: "robin-schulz",
    genre: "House",
    accent: "#5aa9e6",
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
  "hannah wants": {
    youtubeHandle: "@HannahWantsDJ",
    soundcloudPermalink: "hannah_wants",
    genre: "Tech House",
    accent: "#ff4d8d",
  },
  "chris lorenzo": {
    youtubeHandle: "@ChrisLorenzo",
    soundcloudPermalink: "chris-lorenzo-1",
    genre: "Tech House",
    accent: "#ff6b35",
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
    youtubeHandle: "@ProspaUK",
    soundcloudPermalink: "prospauk",
    genre: "House",
    accent: "#ffd166",
  },
  "mau p": {
    youtubeHandle: "@maupmusic",
    soundcloudPermalink: "realmaup",
    genre: "Tech House",
    accent: "#118ab2",
  },
  "black coffee": {
    youtubeHandle: "@realblackcoffee",
    soundcloudPermalink: "realblackcoffee",
    genre: "Afro House",
    accent: "#222222",
  },
  "chapter & verse": {
    youtubeHandle: "@chapterandversemusic",
    soundcloudPermalink: "chapterandverseofficial",
    genre: "Bass House",
    accent: "#f77f00",
  },
  keinemusik: {
    youtubeHandle: "@keinemusik",
    soundcloudPermalink: "keinemusik",
    genre: "Afro House",
    accent: "#e8c547",
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
    youtubeHandle: "@youasidepiece",
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
  "luke alessi": {
    youtubeHandle: "@luke.alessi",
    soundcloudPermalink: "lukealessiofficial",
    genre: "House",
    accent: "#ff8c42",
  },
  "chloe caillet": {
    soundcloudPermalink: "chloecaillet",
    genre: "House",
    accent: "#ff6fb0",
  },
  "chloé caillet": {
    soundcloudPermalink: "chloecaillet",
    genre: "House",
    accent: "#ff6fb0",
  },
  malive: {
    youtubeHandle: "@malive",
    soundcloudPermalink: "maliveofficial",
    genre: "House",
    accent: "#2bd67b",
  },
  "jonas blue": {
    soundcloudPermalink: "jonasblue",
    genre: "House",
    accent: "#3aa0e0",
  },
  kolter: {
    youtubeHandle: "@koltermusic",
    soundcloudPermalink: "kolter",
    genre: "House",
    accent: "#8a7cff",
  },
  crusy: {
    youtubeHandle: "@Crusy",
    soundcloudPermalink: "crusyofficial",
    genre: "House",
    accent: "#ff4d6d",
  },
  "david penn": {
    youtubeHandle: "@davidpenn",
    genre: "House",
    accent: "#45c7e0",
  },
  "luke dean": {
    youtubeHandle: "@LukeDean",
    soundcloudPermalink: "lukedean",
    genre: "House",
    accent: "#f5a623",
  },
  "the shapeshifters": {
    youtubeHandle: "@TheShapeshifters",
    soundcloudPermalink: "theshapeshifters",
    genre: "House",
    accent: "#7c5cff",
  },
  tripolism: {
    youtubeHandle: "@tripolism",
    soundcloudPermalink: "tripolism",
    genre: "House",
    accent: "#00e5ff",
  },
  vinter: {
    youtubeHandle: "@vinter",
    genre: "House",
    accent: "#b48cff",
  },
  samm: {
    soundcloudPermalink: "sammbe",
    genre: "House",
    accent: "#2a9d8f",
  },
  biscit: {
    youtubeHandle: "@Biscits",
    soundcloudPermalink: "biscits",
    genre: "Tech House",
    accent: "#ef476f",
  },
  "its biscits": {
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
