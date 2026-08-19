/**
 * Optional resolve hints for discovered artist names → first-party profiles.
 * Used when auto-promoting high-scoring candidates into YouTube/SC polls.
 */

export type HandleHint = {
  youtubeHandle?: string;
  soundcloudPermalink?: string;
  bandcampUrl?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
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
    website: "https://linktr.ee/officialletwins",
    genre: "Melodic Techno",
    accent: "#8338ec",
  },
  "mariana bo": {
    youtubeHandle: "@marianabo",
    soundcloudPermalink: "borrego-s",
    instagram: "https://www.instagram.com/djmarianabo/",
    twitter: "https://x.com/djmarianabo",
    website: "https://linktr.ee/djmarianabo",
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
    instagram: "https://www.instagram.com/korolova.dj/",
    website: "https://solo.to/korolova.dj",
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
    website: "https://linktr.ee/liulive",
    genre: "Bass House",
    accent: "#2a9d8f",
  },
  skrillex: {
    youtubeHandle: "@skrillex",
    soundcloudPermalink: "skrillex",
    website: "https://skrillex.com/",
    genre: "Bass / Dubstep",
    accent: "#80ffdb",
  },
  "above & beyond": {
    youtubeHandle: "@aboveandbeyond",
    soundcloudPermalink: "aboveandbeyond",
    website: "https://www.aboveandbeyond.nu/",
    genre: "Trance",
    accent: "#7209b7",
  },
  "chris stussy": {
    youtubeHandle: "@chrisstussy",
    soundcloudPermalink: "chrisstussy",
    website: "https://www.chrisstussy.com/",
    genre: "Tech House",
    accent: "#118ab2",
  },
  "mike williams": {
    youtubeHandle: "@mikewilliams",
    soundcloudPermalink: "mikewilliams",
    website: "https://www.mikewilliams.nl/",
    genre: "Future House",
    accent: "#e9c46a",
  },
  "plastik funk": {
    youtubeHandle: "@plastikfunk",
    soundcloudPermalink: "plastikfunk",
    website: "https://plastik-funk.de/",
    genre: "House",
    accent: "#06d6a0",
  },
  "honey dijon": {
    youtubeHandle: "@honeydijon",
    soundcloudPermalink: "honeydijon",
    website: "https://linktr.ee/honeydijon",
    genre: "House",
    accent: "#f72585",
  },
  nervo: {
    youtubeHandle: "@NERVO",
    soundcloudPermalink: "nervomusic",
    instagram: "https://www.instagram.com/nervomusic/",
    twitter: "https://x.com/nervomusic",
    website: "https://linktr.ee/nervomusic",
    genre: "Progressive House",
    accent: "#f72585",
  },
  quintino: {
    youtubeHandle: "@Quintino",
    soundcloudPermalink: "quintino",
    instagram: "https://www.instagram.com/quintino/",
    twitter: "https://x.com/quintinoo",
    website: "https://linktr.ee/quintino",
    genre: "Big Room",
    accent: "#ff9f1c",
  },
  vinai: {
    youtubeHandle: "@vinaiofficial",
    soundcloudPermalink: "wearevinai",
    instagram: "https://www.instagram.com/vinaiofficial/",
    website: "https://linktr.ee/vinaiofficial",
    genre: "Big Room",
    accent: "#ff006e",
  },
  dubvision: {
    youtubeHandle: "@DubVision",
    soundcloudPermalink: "dubvision",
    instagram: "https://www.instagram.com/dubvisionmusic/",
    twitter: "https://x.com/dubvisionmusic",
    website: "https://linktr.ee/dubvision",
    genre: "Progressive House",
    accent: "#4361ee",
  },
  // DubVision performing-as project (2026 tour poster).
  halo: {
    youtubeHandle: "@DubVision",
    soundcloudPermalink: "dubvision",
    instagram: "https://www.instagram.com/halo__ofc/",
    twitter: "https://x.com/Halo__ofc",
    website: "https://linktr.ee/dubvision",
    genre: "Trance",
    accent: "#4361ee",
  },
  "halō": {
    youtubeHandle: "@DubVision",
    soundcloudPermalink: "dubvision",
    instagram: "https://www.instagram.com/halo__ofc/",
    twitter: "https://x.com/Halo__ofc",
    website: "https://linktr.ee/dubvision",
    genre: "Trance",
    accent: "#4361ee",
  },
  "sub zero project": {
    youtubeHandle: "@SubZeroProject",
    soundcloudPermalink: "subzeroproject",
    instagram: "https://www.instagram.com/subzeroproject/",
    twitter: "https://x.com/sub_zeroproject",
    website: "https://www.subzeroproject.com/",
    genre: "Hardstyle",
    accent: "#3a0ca3",
  },
  "nils van zandt": {
    youtubeHandle: "@nilsvanzandt",
    soundcloudPermalink: "nilsvanzandtofficial",
    website: "https://linktr.ee/nilsvanzandt",
    genre: "Big Room",
    accent: "#00b4d8",
  },
  wukong: {
    youtubeHandle: "@WUKONGofficial",
    soundcloudPermalink: "wukongofficial",
    website: "https://linktr.ee/wukongmusic",
    genre: "Melodic Techno",
    accent: "#ffd60a",
  },
  "reinier zonneveld": {
    youtubeHandle: "@ReinierZonneveld_FilthOnAcid",
    soundcloudPermalink: "reinier-zonneveld",
    website: "https://linktr.ee/reinierzonneveld",
    genre: "Techno",
    accent: "#ff006e",
  },

  // ---- LLM handle research 2026-08-17 (Gemini + Claude, verify-then-write) ----
  "erick morillo": {
    youtubeHandle: "@erickmorillovideo",
    soundcloudPermalink: "erickmorillo",
  },
  "funk tribu": {
    youtubeHandle: "@funktribumusic",
    soundcloudPermalink: "funktribumusic",
  },
  "hi-lo": {
    youtubeHandle: "@HILOofficial",
  },
  "joris voorn": {
    youtubeHandle: "@jorisvoorndj",
    soundcloudPermalink: "joris-voorn",
  },
  "ray volpe": {
    soundcloudPermalink: "rayvolpemusic",
  },
  "sullivan king": {
    youtubeHandle: "@SullivanKing",
    soundcloudPermalink: "sullivankingmusic",
  },
  "third party": {
    soundcloudPermalink: "thirdpartymusic",
  },
  "[monrhea]": {
    soundcloudPermalink: "monrheacarter",
  },
  archie: {
    soundcloudPermalink: "archiedennis",
  },
  axwell: {
    youtubeHandle: "@axwell",
    soundcloudPermalink: "axwell",
  },
  biblemami: {
    youtubeHandle: "@biblemami",
  },
  bonobo: {
    youtubeHandle: "@bonobo",
    soundcloudPermalink: "bonobo",
  },
  boutross: {
    youtubeHandle: "@boutrossmunene",
  },
  "brandy maina": {
    youtubeHandle: "@brandymaina9393",
  },
  camelphat: {
    youtubeHandle: "@camelphat_music",
    soundcloudPermalink: "camelphat",
  },
  "camila jun": {
    soundcloudPermalink: "camilajun",
  },
  cassius: {
    youtubeHandle: "@cassius1999",
    soundcloudPermalink: "cassiusofficial",
  },
  "claude vonstroke": {
    youtubeHandle: "@claudevonstroke",
    soundcloudPermalink: "claudevonstroke",
  },
  "coco em": {
    soundcloudPermalink: "coco_em",
  },
  "coco mar\u00eda": {
    soundcloudPermalink: "cocomariamusic",
  },
  codes: {
    youtubeHandle: "@CODESHOUSE",
    soundcloudPermalink: "codeshouse",
  },
  colyn: {
    youtubeHandle: "@Colyn_music",
    soundcloudPermalink: "colynmusic",
  },
  darude: {
    soundcloudPermalink: "darude",
  },
  "das kapital": {
    soundcloudPermalink: "daskapital",
  },
  "dc breaks": {
    soundcloudPermalink: "dc-breaks-uk",
  },
  "demi riqu\u00edsimo": {
    soundcloudPermalink: "demiriquisimo",
  },
  deorro: {
    youtubeHandle: "@deorroTV",
    soundcloudPermalink: "deorro",
  },
  "dillon francis": {
    youtubeHandle: "@DillonFrancis",
    soundcloudPermalink: "dillonfrancis",
  },
  "dimitri vegas": {
    soundcloudPermalink: "dimitrivegas",
  },
  disclosure: {
    youtubeHandle: "@disclosure",
    soundcloudPermalink: "disclosuremusic",
  },
  dixon: {
    soundcloudPermalink: "dixon",
  },
  "dj l.a.j": {
    youtubeHandle: "@DJ_LAJ",
  },
  "dj lesoul": {
    youtubeHandle: "@djlesoul7811",
  },
  djknator: {
    youtubeHandle: "@DJKNATOR",
  },
  dustycloud: {
    soundcloudPermalink: "dustycloudmusic",
  },
  "empire of the sun": {
    youtubeHandle: "@empireofthesun",
    soundcloudPermalink: "empireofthesunsound",
  },
  ephwurd: {
    youtubeHandle: "@Ephwurd",
    soundcloudPermalink: "ephwurd",
  },
  eskuche: {
    youtubeHandle: "@Eskuchemusic",
    soundcloudPermalink: "eskuchemusic",
  },
  "eyes everywhere": {
    soundcloudPermalink: "eyeseverywhere",
  },
  "faster horses": {
    soundcloudPermalink: "faster_horses",
  },
  fish56octagon: {
    youtubeHandle: "@fish56octagon",
  },
  "flava d": {
    youtubeHandle: "@flavadmusic",
    soundcloudPermalink: "flava_d",
  },
  folamour: {
    youtubeHandle: "@Folamour",
    soundcloudPermalink: "folamour",
  },
  fonzo: {
    soundcloudPermalink: "fonzox",
  },
  "franky rizardo": {
    youtubeHandle: "@FrankyRizardoOfficial",
    soundcloudPermalink: "frankyrizardo",
  },
  gallya: {
    youtubeHandle: "@Gallya",
    soundcloudPermalink: "gallya",
  },
  "general c'mamane": {
    youtubeHandle: "@general_cmamane",
  },
  goldmax: {
    youtubeHandle: "@goldmaxdb",
  },
  "grabba ranks": {
    youtubeHandle: "@GRABBARANKS",
    soundcloudPermalink: "grabbaranks",
  },
  "green velvet": {
    soundcloudPermalink: "green-velvet-1",
  },
  "guido penno": {
    soundcloudPermalink: "guidopenno",
  },
  "hania rani": {
    youtubeHandle: "@haniaranimusic",
    soundcloudPermalink: "haniarani",
  },
  imanu: {
    youtubeHandle: "@IMANU",
    soundcloudPermalink: "imanumusic",
  },
  "internet girl": {
    soundcloudPermalink: "internetgirlmusic",
  },
  jazzy: {
    youtubeHandle: "@JazzyOfficial",
    soundcloudPermalink: "jazzydublin",
  },
  "jessica audiffred": {
    soundcloudPermalink: "jessicaaudiffred",
  },
  "joseph capriati": {
    soundcloudPermalink: "joseph-capriati",
  },
  joshwa: {
    soundcloudPermalink: "joshwauk",
  },
  judeline: {
    youtubeHandle: "@judeline__",
  },
  "julian fijma": {
    soundcloudPermalink: "julianfijma",
  },
  "just bee": {
    youtubeHandle: "@justbeehk",
    soundcloudPermalink: "justbeehk",
  },
  "justin jay": {
    youtubeHandle: "@justinjaymusic",
    soundcloudPermalink: "justin-jay",
  },
  "k dot": {
    youtubeHandle: "@kdot0114",
    soundcloudPermalink: "kdotscumfam",
  },
  "kamo mphela": {
    youtubeHandle: "@KamoMphelaxx",
  },
  kaskade: {
    youtubeHandle: "@Kaskade",
    soundcloudPermalink: "kaskade",
  },
  kayzo: {
    youtubeHandle: "@Kayzomusic",
    soundcloudPermalink: "kayzo-music",
  },
  kiasmos: {
    youtubeHandle: "@Kiasmos",
    soundcloudPermalink: "kiasmos",
  },
  "kilopatrah jones": {
    soundcloudPermalink: "kilopatrah-jones",
  },
  "kyle starkey": {
    soundcloudPermalink: "kyle_starkey43",
  },
  "len faki": {
    youtubeHandle: "@lenfakiofficial",
    soundcloudPermalink: "lenfaki",
  },
  "liquid stranger": {
    soundcloudPermalink: "liquidstranger",
  },
  locklead: {
    soundcloudPermalink: "locklead",
  },
  lucas: {
    youtubeHandle: "@lucasandsteve",
  },
  "mason collective": {
    youtubeHandle: "@masoncollective5299",
    soundcloudPermalink: "masoncollective",
  },
  matisse: {
    youtubeHandle: "@MatisseSadkoOfficial",
    soundcloudPermalink: "matissesadko",
  },
  "matty ralph": {
    soundcloudPermalink: "matty-ralphmusic",
  },
  "max mylo": {
    soundcloudPermalink: "maxmylomusic",
  },
  "max richter": {
    youtubeHandle: "@maxrichtermusic",
    soundcloudPermalink: "max-richter",
  },
  menesix: {
    youtubeHandle: "@menesixmusic",
    soundcloudPermalink: "menesix",
  },
  mengzy: {
    soundcloudPermalink: "mengzy",
  },
  miguelle: {
    youtubeHandle: "@miguelleandtons",
    soundcloudPermalink: "miguelletons",
  },
  "mihalis safras": {
    youtubeHandle: "@MihalisSafras",
    soundcloudPermalink: "mihalissafras",
  },
  "milena adamis": {
    soundcloudPermalink: "milena-adamis",
  },
  monolink: {
    youtubeHandle: "@Monolink",
    soundcloudPermalink: "monolink",
  },
  "morena leraba": {
    youtubeHandle: "@MorenaLeraba",
    soundcloudPermalink: "morenaleraba",
  },
  "nitti gritti": {
    soundcloudPermalink: "nittigritti",
  },
  njelic: {
    youtubeHandle: "@NjelicOfficial",
  },
  notion: {
    youtubeHandle: "@NOTIONDJ",
    soundcloudPermalink: "notiondj",
  },
  "\u00f3lafur arnalds": {
    youtubeHandle: "@olafurarnalds",
    soundcloudPermalink: "olafur-arnalds",
  },
  pegassi: {
    soundcloudPermalink: "pegassimusic",
  },
  "phlegmatic dogs": {
    soundcloudPermalink: "phlegmaticdogs",
  },
  "pigeon hole": {
    soundcloudPermalink: "pigeon_hole",
  },
  pnny: {
    soundcloudPermalink: "pnnycollective",
  },
  "raw district": {
    soundcloudPermalink: "rawdistrict",
  },
  rawayana: {
    youtubeHandle: "@RawayanaOfficial",
  },
  rinzen: {
    soundcloudPermalink: "rinzen",
  },
  "saint ludo": {
    soundcloudPermalink: "saintludo",
  },
  "san holo": {
    soundcloudPermalink: "sanholo",
  },
  "sarah de warren": {
    youtubeHandle: "@sarahdewarren",
    soundcloudPermalink: "sarahdewarren",
  },
  "shanti celeste": {
    soundcloudPermalink: "shanticeleste",
  },
  spfdj: {
    soundcloudPermalink: "spfdj",
  },
  subez: {
    soundcloudPermalink: "subez",
  },
  "tame impala": {
    soundcloudPermalink: "tameimpala",
  },
  "the blaze": {
    youtubeHandle: "@TheBlazeOfficial",
  },
  tons: {
    soundcloudPermalink: "tonsandtons",
  },
  trevormusiq: {
    soundcloudPermalink: "trevormusiq",
  },
  "tuta m": {
    soundcloudPermalink: "tuta-m",
  },
  vnssa: {
    soundcloudPermalink: "vnssa",
  },
  whomadewho: {
    soundcloudPermalink: "whomadewho",
  },
  zomboy: {
    soundcloudPermalink: "zomboy",
  },
  "mal\u00f3ne": {
    soundcloudPermalink: "malone-music",
  },
  "\u00e6on:mode": {
    soundcloudPermalink: "aeonmode",
  },
  borgore: {
    soundcloudPermalink: "borgore",
  },
  "born dirty": {
    soundcloudPermalink: "borndirty",
  },
  castion: {
    youtubeHandle: "@castionmusic",
    soundcloudPermalink: "castionmusic",
  },
  chaney: {
    youtubeHandle: "@chaneymusic",
    soundcloudPermalink: "chaneymusic",
  },
  cloudnone: {
    soundcloudPermalink: "cloudnone",
  },
  cristoph: {
    soundcloudPermalink: "cristophmusic",
  },
  "danny avila": {
    soundcloudPermalink: "dannyavila",
  },
  dimension: {
    soundcloudPermalink: "dimensionuk",
  },
  diplo: {
    youtubeHandle: "@diplo",
    soundcloudPermalink: "diplo",
  },
  dombresky: {
    soundcloudPermalink: "dombresky",
  },
  dusky: {
    youtubeHandle: "@DuskyMusic",
    soundcloudPermalink: "duskymusic",
  },
  "enrico sangiuliano": {
    soundcloudPermalink: "enricosangiuliano",
  },
  funtcase: {
    soundcloudPermalink: "funtcase",
  },
  giant: {
    youtubeHandle: "@GIANTmusicofficial",
  },
  "hayden james": {
    soundcloudPermalink: "hayden-james",
  },
  hyperbeam: {
    youtubeHandle: "@hyperbeammusic",
    soundcloudPermalink: "hyperbeammusic",
  },
  jaded: {
    youtubeHandle: "@jadedlondon",
    soundcloudPermalink: "jadedlondon",
  },
  "jeremy olander": {
    soundcloudPermalink: "jeremyolander",
  },
  kendoll: {
    soundcloudPermalink: "kendollmusic",
  },
  khomha: {
    soundcloudPermalink: "khomha",
  },
  "kyle watson": {
    soundcloudPermalink: "kylewatson",
  },
  // ---- LLM handle research 2026-08-17 round 3 ----
  loofy: {
    soundcloudPermalink: "loofy-644934783",
  },
  "luuk van dijk": {
    youtubeHandle: "@luukvandijkdj",
    soundcloudPermalink: "luukvandijkdj",
  },
  "melanie ribbe": {
    youtubeHandle: "@melanieribbeofc",
  },
  "miguel bastida": {
    youtubeHandle: "@MiguelBastida",
    soundcloudPermalink: "miguel_bastida",
  },
  "mila alias": {
    youtubeHandle: "@Mila_Alias",
    soundcloudPermalink: "djmilaalias",
    instagram: "https://www.instagram.com/djmilaalias/",
  },
  "miss dre": {
    youtubeHandle: "@missdremusic",
  },
  mitis: {
    youtubeHandle: "@MitisMusic",
    soundcloudPermalink: "mitis",
  },
  "moon boots": {
    youtubeHandle: "@MoonBootsMusic",
    soundcloudPermalink: "moonbootsmusic",
  },
  "myles o'neal": {
    youtubeHandle: "@MylesONeal_",
  },
  mythm: {
    youtubeHandle: "@mythmofficial",
    soundcloudPermalink: "mythmofficial",
  },
  "neon deluz": {
    youtubeHandle: "@neondeluzmusic",
    soundcloudPermalink: "neondeluzmusic",
  },
  noizu: {
    youtubeHandle: "@NoizuSound",
    soundcloudPermalink: "noizusound",
  },
  omnom: {
    soundcloudPermalink: "omnom",
  },
  "paco osuna": {
    soundcloudPermalink: "paco-osuna",
  },
  "pls&ty": {
    soundcloudPermalink: "pls-ty",
  },
  "porter robinson": {
    youtubeHandle: "@porterrobinson",
    soundcloudPermalink: "porter-robinson",
  },
  quackson: {
    youtubeHandle: "@quacksonmusic",
    soundcloudPermalink: "quacksonmusic",
  },
  riordan: {
    youtubeHandle: "@riordanuk",
    soundcloudPermalink: "riordanuk",
  },
  rohaan: {
    youtubeHandle: "@Rohaan",
    soundcloudPermalink: "rohaanofficial",
  },
  skepsis: {
    soundcloudPermalink: "skepsisproducer",
  },
  "space 92": {
    youtubeHandle: "@space92music",
    soundcloudPermalink: "space92",
  },
  spartaque: {
    soundcloudPermalink: "spartaque",
  },
  steller: {
    youtubeHandle: "@stellersounds",
    soundcloudPermalink: "stellersounds",
  },
  "sub focus": {
    youtubeHandle: "@SubFocus",
    soundcloudPermalink: "subfocus",
  },
  "sultan + shepard": {
    youtubeHandle: "@sultanshepard",
    soundcloudPermalink: "sultanshepard",
  },
  "the prototypes": {
    soundcloudPermalink: "theprototypes",
  },
  "tini gessler": {
    soundcloudPermalink: "tini-gessler",
  },
  tobehonest: {
    youtubeHandle: "@tobehonestmusic",
    soundcloudPermalink: "tobehonestmusic",
  },
  "torren foot": {
    youtubeHandle: "@torrenfoote",
    soundcloudPermalink: "torrenfoot",
  },
  toyzz: {
    soundcloudPermalink: "toyzzx",
  },
  vltra: {
    youtubeHandle: "@vltramusic",
    soundcloudPermalink: "vltramusic1719",
  },
  wakyin: {
    youtubeHandle: "@wakyin",
    soundcloudPermalink: "wakyin",
  },
  wavhart: {
    soundcloudPermalink: "wavhart",
  },
  "wes pierce": {
    soundcloudPermalink: "wespiercemusic",
  },
  zuezeu: {
    youtubeHandle: "@zuezeu",
    soundcloudPermalink: "zuezeu",
  },

  // ---- first-party scrape 2026-08-17 (YT About / SC bio / official site) ----
  "wax motif": {
    youtubeHandle: "@WaxMotif",
    soundcloudPermalink: "waxmotif",
  },
  bijou: {
    youtubeHandle: "@BIJOU",
    soundcloudPermalink: "bijou",
  },
  cloonee: {
    youtubeHandle: "@cloonee",
    soundcloudPermalink: "cloonee",
  },
  meduza: {
    youtubeHandle: "@meduzamusic",
    soundcloudPermalink: "meduzamusic",
    instagram: "https://www.instagram.com/meduzamusic",
  },
  avello: {
    youtubeHandle: "@avello_music",
    soundcloudPermalink: "avello",
    instagram: "https://instagram.com/avello_music",
  },
  beltran: {
    soundcloudPermalink: "beltranmusic",
    instagram: "https://instagram.com/beltranmusic",
  },
  "eli brown": {
    youtubeHandle: "@elibrownbeats",
    soundcloudPermalink: "elibrownbeats",
    instagram: "https://instagram.com/elibrownbeats",
  },
  innellea: {
    youtubeHandle: "@Innellea",
  },
  "layton giordani": {
    youtubeHandle: "@LaytonGiordani",
    soundcloudPermalink: "laytongiordani",
  },
  massano: {
    youtubeHandle: "@massanomusic",
    soundcloudPermalink: "massanomusic",
    instagram: "https://instagram.com/massanomusic",
  },
  "agents of time": {
    youtubeHandle: "@AgentsOfTime",
    soundcloudPermalink: "agents-of-time",
    instagram: "https://instagram.com/agentsoftime",
  },
  "ben sterling": {
    youtubeHandle: "@bensterlinguk",
    soundcloudPermalink: "bensterling",
    instagram: "https://instagram.com/bensterlingmusic",
  },
  "ayra starr": {
    youtubeHandle: "@ayrastarrofficial",
    instagram: "https://instagram.com/ayrastarr",
  },
  audiomarc: {
    youtubeHandle: "@audiomarcdj",
    instagram: "https://instagram.com/audiomarcdj",
  },
  "aizo clutch": {
    youtubeHandle: "@AizoClutch",
    instagram: "https://instagram.com/aizoclutch",
  },
  "ann clue": {
    youtubeHandle: "@AnnClue",
    soundcloudPermalink: "ann-clue",
    instagram: "https://instagram.com/annclue",
  },
  avision: {
    youtubeHandle: "@avisionnyc",
    instagram: "https://instagram.com/avision_nyc",
  },
  "bianca oblivion": {
    youtubeHandle: "@BiancaOblivion",
    soundcloudPermalink: "biancaoblivion",
    instagram: "https://instagram.com/bianca_oblivion",
  },
  blanke: {
    youtubeHandle: "@Blankemusic",
    soundcloudPermalink: "blankemusicau",
    instagram: "https://instagram.com/blankemusic",
  },
  curbi: {
    youtubeHandle: "@Curbi",
    soundcloudPermalink: "curbiofficial",
    instagram: "https://instagram.com/curbimusic",
  },
  bexxie: {
    youtubeHandle: "@bexxiemusic",
    instagram: "https://instagram.com/bexxiemusic",
  },
  "black carl!": {
    youtubeHandle: "@BlackCarl",
    soundcloudPermalink: "black_carl",
    instagram: "https://instagram.com/black_carl",
  },
  illenium: {
    youtubeHandle: "@illenium",
    soundcloudPermalink: "illeniumofficial",
    instagram: "https://instagram.com/illenium",
  },
  "loud luxury": {
    youtubeHandle: "@LoudLuxury",
    instagram: "https://instagram.com/loudluxury",
  },
  sidequest: {
    youtubeHandle: "@SIDEQUESTMUSIC",
    instagram: "https://instagram.com/sidequestdj",
  },
  crankdat: {
    youtubeHandle: "@Crankdat",
    soundcloudPermalink: "crankdatmusic",
    instagram: "https://instagram.com/crankdat",
  },
  "bart skils": {
    youtubeHandle: "@bartskils",
    soundcloudPermalink: "bart-skils",
    instagram: "https://instagram.com/bart_skils",
  },
  goodboys: {
    youtubeHandle: "@GoodboysOff",
    soundcloudPermalink: "goodboysoff",
    instagram: "https://instagram.com/goodboysoff",
  },
  azzecca: {
    youtubeHandle: "@azzeccamusic",
    soundcloudPermalink: "azzecca",
    instagram: "https://instagram.com/azzecca",
  },
  "ben rau": {
    soundcloudPermalink: "ben-rau",
    instagram: "https://instagram.com/ben_rau",
  },
  "cole terrazas": {
    soundcloudPermalink: "coleterrazas",
    genre: "Tech House",
    accent: "#ff3d6e",
  },

};

export function hintForName(name: string): HandleHint | undefined {
  const key = name.trim().toLowerCase();
  if (KNOWN_HANDLES[key]) return KNOWN_HANDLES[key];
  const compact = key.replace(/ø/g, "o").replace(/ö/g, "o").replace(/ü/g, "u");
  return KNOWN_HANDLES[compact];
}
