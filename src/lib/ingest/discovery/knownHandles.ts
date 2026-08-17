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
  "anti up": {
    youtubeHandle: "@antiup",
    soundcloudPermalink: "antiupmusic",
    genre: "Tech House",
    accent: "#ff006e",
  },
  antiup: {
    youtubeHandle: "@antiup",
    soundcloudPermalink: "antiupmusic",
    genre: "Tech House",
    accent: "#ff006e",
  },
  bradeazy: {
    youtubeHandle: "@bradeazy",
    soundcloudPermalink: "bradeazy",
    genre: "Bass House",
    accent: "#3aa0e0",
  },
  breazly: {
    youtubeHandle: "@bradeazy",
    soundcloudPermalink: "bradeazy",
    genre: "Bass House",
    accent: "#3aa0e0",
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
  cid: {
    youtubeHandle: "@CIDmusic",
    soundcloudPermalink: "cidmusic",
    genre: "Tech House",
    accent: "#45c7e0",
  },
  brandon: {
    youtubeHandle: "@BRANDONSOUNDS",
    soundcloudPermalink: "brandonsounds",
    genre: "Tech House",
    accent: "#ff5e5e",
  },
  "brandon (de)": {
    youtubeHandle: "@BRANDONSOUNDS",
    soundcloudPermalink: "brandonsounds",
    genre: "Tech House",
    accent: "#ff5e5e",
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
  "laidback luke": {
    soundcloudPermalink: "laidbackluke",
    genre: "House",
    accent: "#f4c542",
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
  // Verified 2026-07-31 from official YouTube About / social link blocks.
  "fred again": {
    youtubeHandle: "@Fredagainagain",
    soundcloudPermalink: "fredagain",
    genre: "House",
    accent: "#adb5bd",
  },
  "fred again...": {
    youtubeHandle: "@Fredagainagain",
    soundcloudPermalink: "fredagain",
    genre: "House",
    accent: "#adb5bd",
  },
  "swedish house mafia": {
    youtubeHandle: "@swedishhousemafia",
    soundcloudPermalink: "officialswedishhousemafia",
    genre: "House",
    accent: "#212529",
  },
  "joel corry": {
    youtubeHandle: "@JoelCorry",
    soundcloudPermalink: "joelcorry",
    genre: "House",
    accent: "#4cc9f0",
  },
  "dj snake": {
    youtubeHandle: "@DJSnake",
    soundcloudPermalink: "djsnake",
    genre: "Bass",
    accent: "#80ffdb",
  },
  atb: {
    youtubeHandle: "@atb",
    soundcloudPermalink: "atb-music",
    genre: "Trance",
    accent: "#0077b6",
  },
  "nico moreno": {
    youtubeHandle: "@nicomoreno_music",
    soundcloudPermalink: "nicomorenomusic",
    genre: "Hard Techno",
    accent: "#d00000",
  },
  gordo: {
    youtubeHandle: "@gordoszn",
    soundcloudPermalink: "gordoszn",
    genre: "Tech House",
    accent: "#fb8500",
  },
  "le twins": {
    youtubeHandle: "@letwinsdjs",
    soundcloudPermalink: "le-twins-52553281",
    genre: "Melodic Techno",
    accent: "#8338ec",
  },
  "mariana bo": {
    youtubeHandle: "@marianabo",
    soundcloudPermalink: "borrego-s",
    genre: "Hardstyle",
    accent: "#e63946",
  },
  fantasm: {
    youtubeHandle: "@fantasm_techno",
    soundcloudPermalink: "kenzo-meservey",
    genre: "Hard Techno",
    accent: "#d00000",
  },
  maddix: {
    youtubeHandle: "@maddixmusic",
    soundcloudPermalink: "maddixmusic",
    genre: "Techno",
    accent: "#7b2cbf",
  },
  "lost frequencies": {
    youtubeHandle: "@LostFrequencies",
    soundcloudPermalink: "lo-freq-1",
    genre: "Melodic House",
    accent: "#4cc9f0",
  },
  "martin garrix": {
    youtubeHandle: "@MartinGarrix",
    soundcloudPermalink: "martingarrix",
    genre: "Big Room",
    accent: "#ff9f1c",
  },
  "don diablo": {
    youtubeHandle: "@DonDiablo",
    soundcloudPermalink: "dondiablo",
    genre: "Future House",
    accent: "#ff006e",
  },
  "steve aoki": {
    youtubeHandle: "@SteveAoki",
    soundcloudPermalink: "steveaoki",
    genre: "Electro House",
    accent: "#3a86ff",
  },
  hardwell: {
    youtubeHandle: "@hardwell",
    soundcloudPermalink: "hardwell",
    genre: "Big Room",
    accent: "#ef233c",
  },
  "carl cox": {
    youtubeHandle: "@CarlCoxofficialTV",
    soundcloudPermalink: "carl-cox",
    genre: "Techno",
    accent: "#212529",
  },
  "eric prydz": {
    youtubeHandle: "@ericprydz",
    soundcloudPermalink: "eric-prydz",
    genre: "Progressive House",
    accent: "#7209b7",
  },
  "amelie lens": {
    youtubeHandle: "@AmelieLens",
    soundcloudPermalink: "amelielens",
    genre: "Techno",
    accent: "#d00000",
  },
  "paul van dyk": {
    youtubeHandle: "@PaulvanDyk",
    soundcloudPermalink: "paulvandykofficial",
    genre: "Trance",
    accent: "#00b4d8",
  },
  korolova: {
    youtubeHandle: "@KOROLOVADJ",
    soundcloudPermalink: "korolovadj",
    genre: "Melodic Techno",
    accent: "#f72585",
  },
  "kölsch": {
    youtubeHandle: "@KolschOfficial",
    soundcloudPermalink: "kolsch",
    genre: "Melodic Techno",
    accent: "#ffd60a",
  },
  kolsch: {
    youtubeHandle: "@KolschOfficial",
    soundcloudPermalink: "kolsch",
    genre: "Melodic Techno",
    accent: "#ffd60a",
  },
  "miss monique": {
    youtubeHandle: "@djmissmonique",
    soundcloudPermalink: "alesia-arkusha",
    genre: "Melodic Techno",
    accent: "#9b5de5",
  },
  "ferry corsten": {
    youtubeHandle: "@FerryCorsten",
    soundcloudPermalink: "ferry-corsten",
    genre: "Trance",
    accent: "#48cae4",
  },
  topic: {
    youtubeHandle: "@topicmusictv",
    soundcloudPermalink: "topicmusic",
    genre: "Dance",
    accent: "#fb8500",
  },
  "1788-l": {
    youtubeHandle: "@1788L",
    genre: "Riddim",
    accent: "#c1121f",
  },
  negitiv: {
    youtubeHandle: "@negitivofficial",
    soundcloudPermalink: "negitivofficial",
    genre: "Hard Techno",
    accent: "#7b2cbf",
  },
  // 1001Tracklists credit spelling; official brand is NEGITIV.
  negativ: {
    youtubeHandle: "@negitivofficial",
    soundcloudPermalink: "negitivofficial",
    genre: "Hard Techno",
    accent: "#7b2cbf",
  },
  mandy: {
    youtubeHandle: "@mandyofficialbe",
    genre: "Hard Dance",
    accent: "#ff006e",
  },
  "steve angello": {
    youtubeHandle: "@steveangello",
    soundcloudPermalink: "steveangello",
    genre: "Progressive House",
    accent: "#e63946",
  },
  liu: {
    youtubeHandle: "@Liumusic",
    soundcloudPermalink: "liulive",
    genre: "Bass House",
    accent: "#2a9d8f",
  },
};

export function hintForName(name: string): HandleHint | undefined {
  const key = name.trim().toLowerCase();
  if (KNOWN_HANDLES[key]) return KNOWN_HANDLES[key];
  const compact = key.replace(/ø/g, "o").replace(/ö/g, "o").replace(/ü/g, "u");
  return KNOWN_HANDLES[compact];
}
