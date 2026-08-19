/**
 * Producer handle-research review (2026-08-18).
 * DISCARD = not an artist (title / show / venue crumb).
 * DROP = wrong identity or not a catalog DJ.
 * KEEP = real act — pin listed official socials (overwrite stale guesses).
 */

export type ProducerSocials = {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  soundcloud?: string;
  website?: string;
};

export type ProducerKeep = {
  slug: string;
  name: string;
  socials: ProducerSocials;
};

/** Set-title leftovers that fold onto a real DJ. */
export const PRODUCER_DJ_ALIASES: Record<string, string> = {
  "recovery-hot-air-balloon": "hot-since-82",
  "recovery-hot-air-balloon-set": "hot-since-82",
  "layton-giordani-space-miami-1-10-25": "layton-giordani",
  "tape-b-mutiny-shareholders-meeting": "tape-b",
  "tape-b-mutiny-shareholders-meeting-live": "tape-b",
  "mau-p-sunrise": "mau-p",
  "mandy-mondays": "mandy",
  "alok-s-infinite-experience": "alok",
  "wooli-wankdat": "wooli",
  "maceo-plex-bart-skils": "maceo-plex",
  "soulidan-minna-tonno-disko": "soulidan",
};

/** Extra SetArtist links when a discarded row was a merged credit. */
export const PRODUCER_ALIAS_EXTRAS: Record<string, string[]> = {
  "maceo-plex-bart-skils": ["bart-skils"],
  "soulidan-minna-tonno-disko": ["minna", "tonno-disko"],
};

/** Exact Dj.name leftovers (not people). */
export const PRODUCER_DISCARD_NAMES = [
  "sorry",
  "two",
  "shameless",
  "unreleased",
  "new school",
  "w hotels",
  "mash-up universe",
  "mash up universe",
  "mandy mondays",
  "mau p sunrise",
  "durban: gqom",
  "durban gqom",
  "djlc nyc pizza pop up",
  "mixmag nl",
  "rave ukraine: dj sets",
  "rave ukraine dj sets",
  "interview kiss fm / uk garage / night bass",
  "behind cercle odyssey i chapter four",
  "behind cercle odyssey i chapter four: curtain",
  "live in buenos aires",
  "rave ukraine",
  "space museum in new york, usa for cercle",
  "alok's infinite experience",
  "tape b / mutiny shareholders meeting",
  "wooli (wankdat)",
  "8-track (continuous mix)",
  "femi koleoso of ezra collective",
  "knee deep in ibiza mixed",
  "le grand brand",
  "monateng",
  "monateng music",
] as const;

export const PRODUCER_DISCARD_SLUGS = new Set<string>([
  "recovery-hot-air-balloon",
  "sorry",
  "mash-up-universe",
  "mandy-mondays",
  "unreleased",
  "durban-gqom",
  "behind-cercle-odyssey-i-chapter-four",
  "behind-cercle-odyssey-i-chapter-four-curtain",
  "live-in-buenos-aires",
  "rave-ukraine",
  "djlc-nyc-pizza-pop-up",
  "interview-kiss-fm-uk-garage-night-bass",
  "layton-giordani-space-miami-1-10-25",
  "maceo-plex-bart-skils",
  "mau-p-sunrise",
  "mixmag-nl",
  "new-school",
  "rave-ukraine-dj-sets",
  "shameless",
  "soulidan-minna-tonno-disko",
  "space-museum-in-new-york-usa-for-cercle",
  "tape-b-mutiny-shareholders-meeting",
  "two",
  "w-hotels",
  "wooli-wankdat",
  "alok-s-infinite-experience",
  "8-track-continuous-mix",
  "femi-koleoso-of-ezra-collective",
  "knee-deep-in-ibiza-mixed",
  "le-grand-brand",
  "monateng",
  "monateng-music",
]);

/** Wrong channel / not a catalog DJ. Never drop a pin or roster slug. */
export const PRODUCER_DROP_SLUGS = new Set<string>([
  "mapanta",
  "unfazed",
  "convex",
  "damian-greco",
  "dj-baruce",
  "dsf",
  "dt652",
  "gilly-chan",
  "ginger",
  "harder",
  "inafekt",
  "innella",
  "jaxx-tms",
  "ki-ki",
  "kill-script",
  "kitty-amor",
  "kts",
  "lake-hills",
  "lara-bee",
  "lenna",
  "maria-nocheydia",
  "mess",
  "miara",
  "mph",
  "phillip-castle",
  "rarri",
  "reznik",
  "rimaye",
  "ryuken",
  "sadko",
  "sasha",
  "serokolo-7",
  "sg-lewis",
  "sin",
  "sivv",
  "skull-machine",
  "soundprank",
  "spriitzz",
  "status-dj",
  "sunny-lax",
  "tiello",
  "tina-colada",
  "volcan-x-a",
  "boy-pillow",
  "clara-rosa",
  "leftwing-kody",
  "sonido-tupinamba",
  "tupinamba",
  "teedo-love",
  "dj-teedo-love",
]);

export const PRODUCER_KEEP: ProducerKeep[] = [
  {
    slug: "bdk",
    name: "BDK",
    socials: {
      instagram: "https://www.instagram.com/oficialbdk/",
      twitter: "https://x.com/ooficialbdk",
      youtube: "https://www.youtube.com/@OficialBDK",
    },
  },
  {
    slug: "franky-wah",
    name: "Franky Wah",
    socials: {
      instagram: "https://www.instagram.com/frankywahmusic/",
      twitter: "https://x.com/frankywahmusic",
      youtube: "https://www.youtube.com/@Frankywahmusic",
    },
  },
  {
    slug: "jackie-hollander",
    name: "Jackie Hollander",
    socials: {
      instagram: "https://www.instagram.com/jackieholla/",
      youtube: "https://www.youtube.com/@JackieHollander",
    },
  },
  {
    slug: "joe-kay",
    name: "Joe Kay",
    socials: {
      instagram: "https://www.instagram.com/joekay/",
      youtube: "https://www.youtube.com/@joekay_",
    },
  },
  {
    slug: "k-c-driller",
    name: "K.C Driller",
    socials: {
      instagram: "https://www.instagram.com/k.c_driller_/",
      youtube: "https://www.youtube.com/@K.C_Driller_",
    },
  },
  {
    slug: "kora",
    name: "Kora",
    socials: {
      instagram: "https://www.instagram.com/kora.st/",
      youtube: "https://www.youtube.com/@Korast",
    },
  },
  {
    slug: "liva-k",
    name: "Liva K",
    socials: {
      instagram: "https://www.instagram.com/livakofficial/",
      youtube: "https://www.youtube.com/@LivaK",
    },
  },
  {
    slug: "marcel-vautier",
    name: "Marcel Vautier",
    socials: {
      instagram: "https://www.instagram.com/_marcelvautier/",
      youtube: "https://www.youtube.com/@marcelvautier",
    },
  },
  {
    slug: "massane",
    name: "Massane",
    socials: {
      instagram: "https://www.instagram.com/massanemusic/",
      twitter: "https://x.com/massanemusic",
      youtube: "https://www.youtube.com/@Massane",
    },
  },
  {
    slug: "michael-cassette",
    name: "Michael Cassette",
    socials: {
      instagram: "https://www.instagram.com/mynameismichaelcassette/",
      youtube: "https://www.youtube.com/@MichaelCassetteOfficial",
    },
  },
  {
    slug: "mita-gami",
    name: "Mita Gami",
    socials: {
      instagram: "https://www.instagram.com/mita_gami/",
      youtube: "https://www.youtube.com/@mita_gami",
    },
  },
  {
    slug: "rommii",
    name: "rommii",
    socials: {
      instagram: "https://www.instagram.com/heyrommii/",
      youtube: "https://www.youtube.com/@heyrommii",
    },
  },
  {
    slug: "rony-seikaly",
    name: "Rony Seikaly",
    socials: {
      instagram: "https://www.instagram.com/ronyseikaly/",
      youtube: "https://www.youtube.com/@ronyseikaly",
    },
  },
  {
    slug: "samantha-loveridge",
    name: "Samantha Loveridge",
    socials: {
      instagram: "https://www.instagram.com/Samantha_Loveridge/",
      youtube: "https://www.youtube.com/@Samantha_Loveridge",
    },
  },
  {
    slug: "shimza",
    name: "Shimza",
    socials: {
      instagram: "https://www.instagram.com/shimza.dj/",
      twitter: "https://x.com/Shimza01",
      youtube: "https://www.youtube.com/@ShimzaSA",
    },
  },
  {
    slug: "mila-alias",
    name: "Mila Alias",
    socials: {
      instagram: "https://www.instagram.com/djmilaalias/",
      youtube: "https://www.youtube.com/@Mila_Alias",
      soundcloud: "https://soundcloud.com/djmilaalias",
    },
  },
  {
    slug: "tereza",
    name: "Tereza",
    socials: {
      instagram: "https://www.instagram.com/terezamurr/",
      youtube: "https://www.youtube.com/@terezamurr",
    },
  },
  {
    slug: "tim-engelhardt",
    name: "Tim Engelhardt",
    socials: {
      instagram: "https://www.instagram.com/timengelhardt_music/",
      youtube: "https://www.youtube.com/@timengelhardtmusic",
    },
  },
  {
    slug: "tim-green",
    name: "Tim Green",
    socials: {
      instagram: "https://www.instagram.com/timgreen_music/",
      youtube: "https://www.youtube.com/@TimGreenMusic",
    },
  },
  {
    slug: "ts7",
    name: "TS7",
    socials: {
      instagram: "https://www.instagram.com/ts7music/",
      twitter: "https://x.com/ts7music",
      youtube: "https://www.youtube.com/@ts7music",
    },
  },
  {
    slug: "worthy",
    name: "Worthy",
    socials: {
      instagram: "https://www.instagram.com/worthyyfn/",
      twitter: "https://x.com/worthy27_",
      youtube: "https://www.youtube.com/@Worthyy",
    },
  },
  {
    slug: "yuvee",
    name: "Yuvèe",
    socials: {
      instagram: "https://www.instagram.com/yuvee_music/",
      youtube: "https://www.youtube.com/@Yuveemusic",
    },
  },
  {
    slug: "rossi",
    name: "Rossi.",
    socials: { youtube: "https://www.youtube.com/@rossi4524" },
  },
  {
    slug: "anastazja",
    name: "Anastazja",
    socials: { youtube: "https://www.youtube.com/@ItzAnastazja" },
  },
  {
    slug: "jengi",
    name: "Jengi",
    socials: {
      instagram: "https://www.instagram.com/iamjengi/",
      twitter: "https://x.com/iamjengi",
      youtube: "https://www.youtube.com/@iamjengi",
      soundcloud: "https://soundcloud.com/iamjengi",
      website: "https://iamjengi.bandcamp.com",
    },
  },
  {
    slug: "jerome-isma-ae",
    name: "Jerome Isma-Ae",
    socials: {
      youtube: "https://www.youtube.com/@jeromeismaae",
      twitter: "https://x.com/jeromeismaae",
      soundcloud: "https://soundcloud.com/jeromeismaae",
      website: "https://jeromeisma-ae.com",
    },
  },
  {
    slug: "karaba",
    name: "KARABA",
    socials: { youtube: "https://www.youtube.com/@DjKaraba" },
  },
  {
    slug: "kloyd",
    name: "Kloyd",
    socials: {
      instagram: "https://www.instagram.com/kloydmusic__/",
      youtube: "https://www.youtube.com/@kloydmusic__",
    },
  },
  {
    slug: "lazarusman",
    name: "Lazarusman",
    socials: {
      twitter: "https://x.com/HouseOfLazarus",
      youtube: "https://www.youtube.com/@HouseofLazarus",
    },
  },
  {
    slug: "matt-fax",
    name: "Matt Fax",
    socials: {
      instagram: "https://www.instagram.com/mattfaxmusic/",
      twitter: "https://x.com/mattfaxmusic",
      youtube: "https://www.youtube.com/@MattFaxMusic",
      soundcloud: "https://soundcloud.com/mattfaxmusic",
    },
  },
  {
    slug: "max-graham",
    name: "Max Graham",
    socials: {
      instagram: "https://www.instagram.com/maxgraham/",
      youtube: "https://www.youtube.com/@maxgraham",
    },
  },
  {
    slug: "nikolina",
    name: "Nikolina",
    socials: { youtube: "https://www.youtube.com/@DJNIKOLINA" },
  },
  {
    slug: "ronski-speed",
    name: "Ronski Speed",
    socials: { youtube: "https://www.youtube.com/@RonskiSpeedOfficial" },
  },
  {
    slug: "ry-x",
    name: "RY X",
    socials: { youtube: "https://www.youtube.com/@RYX" },
  },
  {
    slug: "second-sine",
    name: "Second Sine",
    socials: { youtube: "https://www.youtube.com/@secondsineofficial" },
  },
  {
    slug: "shee",
    name: "SHEE",
    socials: { youtube: "https://www.youtube.com/@known_as_shee" },
  },
  {
    slug: "tiffany-day",
    name: "Tiffany Day",
    socials: {
      instagram: "https://www.instagram.com/tiffdidwhat/",
      youtube: "https://www.youtube.com/@TiffanyDay",
      soundcloud: "https://soundcloud.com/tiffanyday",
      website: "https://tiffdidwhat.com",
    },
  },
  {
    slug: "ydg",
    name: "YDG",
    socials: {
      instagram: "https://www.instagram.com/itsydg/",
      twitter: "https://x.com/itsydg",
      youtube: "https://www.youtube.com/@Itsydg",
      soundcloud: "https://soundcloud.com/itsydg",
    },
  },
];

export function isProducerDiscardSlug(slug: string): boolean {
  return PRODUCER_DISCARD_SLUGS.has(slug.trim().toLowerCase());
}

export function isProducerDropSlug(slug: string): boolean {
  return PRODUCER_DROP_SLUGS.has(slug.trim().toLowerCase());
}

export function isProducerHiddenSlug(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  return PRODUCER_DISCARD_SLUGS.has(s) || PRODUCER_DROP_SLUGS.has(s);
}

export function isProducerDiscardName(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim().toLowerCase();
  return (PRODUCER_DISCARD_NAMES as readonly string[]).includes(n);
}
