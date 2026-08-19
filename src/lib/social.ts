// Social URL helpers. Prefer roster / curated maps. Do NOT invent IG/X/website
// from slugified names — those guesses often 404 or hit the wrong property.

export function socialHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/[øØ]/g, "o")
    .replace(/[æÆ]/g, "ae")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export type DjSocialFields = {
  soundcloud: string | null;
  youtube: string | null;
  instagram: string | null;
  twitter: string | null;
  website: string | null;
  beatport: string | null;
};

/** No name-derived guesses — null until roster/crosslink/curated map says so. */
export function djSocials(_name: string): DjSocialFields {
  return {
    soundcloud: null,
    youtube: null,
    instagram: null,
    twitter: null,
    website: null,
    beatport: null,
  };
}

/** Canonical channel URL from `@Handle`, bare handle, or full YT URL (strips `?si=`). */
export function youtubeChannelUrl(handleOrUrl: string): string | null {
  const raw = handleOrUrl.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      if (!/(^|\.)youtube\.com$/i.test(u.hostname) && !/^youtu\.be$/i.test(u.hostname)) {
        return null;
      }
      u.search = "";
      u.hash = "";
      let path = u.pathname.replace(/\/+$/, "");
      if (!path || path === "/") return null;
      return `https://www.youtube.com${path}`;
    } catch {
      return null;
    }
  }
  const handle = raw.replace(/^@/, "");
  // Bare YouTube channel IDs (UC + 22 chars) are not @handles.
  if (/^UC[\w-]{22}$/.test(handle)) {
    return `https://www.youtube.com/channel/${handle}`;
  }
  if (!/^[A-Za-z0-9._-]{2,}$/.test(handle)) return null;
  return `https://www.youtube.com/@${handle}`;
}

function absUrl(u: string, hostHint?: "instagram" | "x" | "soundcloud"): string {
  if (/^https?:\/\//i.test(u)) return u;
  if (hostHint === "instagram") return `https://instagram.com/${u.replace(/^@/, "")}`;
  if (hostHint === "x") return `https://x.com/${u.replace(/^@/, "")}`;
  if (hostHint === "soundcloud") return `https://soundcloud.com/${u}`;
  return `https://${u.replace(/^\/\//, "")}`;
}

function isSocialHost(url: string): boolean {
  return /(soundcloud|instagram|tiktok|facebook|fb\.com|twitter|x\.com|youtube|youtu\.be|spotify|apple\.com|beatport)/i.test(
    url,
  );
}

/** Prefer curated roster permalinks / social URLs. Never fall back to guesses. */
export function djSocialsFromKnown(opts: {
  name: string;
  soundcloudPermalink?: string | null;
  youtubeHandle?: string | null;
  socials?: string[];
  website?: string | null;
}): DjSocialFields {
  const socials = opts.socials ?? [];
  const ig = socials.find((u) => /instagram\.com\//i.test(u)) ?? null;
  const tw = socials.find((u) => /(twitter|x)\.com\//i.test(u)) ?? null;
  const scFromList = socials.find((u) => /soundcloud\.com\//i.test(u)) ?? null;
  const ytFromList =
    socials.find((u) => /(youtube\.com|youtu\.be)\//i.test(u)) ?? null;
  const webFromList =
    socials.find((u) => /^https?:\/\//i.test(u) && !isSocialHost(u)) ?? null;
  const sc = opts.soundcloudPermalink
    ? `https://soundcloud.com/${opts.soundcloudPermalink}`
    : scFromList;
  const yt =
    youtubeChannelUrl(opts.youtubeHandle ?? "") ||
    youtubeChannelUrl(ytFromList ?? "") ||
    null;
  const website = opts.website || webFromList || null;
  return {
    soundcloud: sc ? absUrl(sc, "soundcloud") : null,
    youtube: yt,
    instagram: ig ? absUrl(ig, "instagram") : null,
    twitter: tw ? absUrl(tw, "x") : null,
    website: website ? absUrl(website) : null,
    beatport: null,
  };
}

/** Curated label URLs — name-guessing invents broken hosts like dividedsouls.com. */
export const KNOWN_LABEL_SOCIALS: Record<
  string,
  { soundcloud?: string; instagram?: string; website?: string }
> = {
  // Keys: slugify-ish + socialHandle(name) variants
  divided: {
    website: "https://www.dividedsoulsrecords.com/",
    soundcloud: "https://soundcloud.com/dividedsoulsrecords",
    instagram: "https://instagram.com/dividedsoulsrec",
  },
  dividedsouls: {
    website: "https://www.dividedsoulsrecords.com/",
    soundcloud: "https://soundcloud.com/dividedsoulsrecords",
    instagram: "https://instagram.com/dividedsoulsrec",
  },
  "divided-souls": {
    website: "https://www.dividedsoulsrecords.com/",
    soundcloud: "https://soundcloud.com/dividedsoulsrecords",
    instagram: "https://instagram.com/dividedsoulsrec",
  },
  nightbass: {
    soundcloud: "https://soundcloud.com/nightbass",
    website: "https://nightbass.com",
  },
  confession: {
    soundcloud: "https://soundcloud.com/confession",
  },
  stereohype: {
    website: "https://www.stereohype.com/",
    soundcloud: "https://soundcloud.com/stereohypeglobal",
    instagram: "https://www.instagram.com/stereohype/",
  },
  "stereo-hype": {
    website: "https://www.stereohype.com/",
    soundcloud: "https://soundcloud.com/stereohypeglobal",
    instagram: "https://www.instagram.com/stereohype/",
  },
  crosstownrebels: {
    website: "https://www.crosstownrebels.com/",
    soundcloud: "https://soundcloud.com/crosstownrebels",
    instagram: "https://www.instagram.com/crosstownrebels/",
  },
  "crosstown-rebels": {
    website: "https://www.crosstownrebels.com/",
    soundcloud: "https://soundcloud.com/crosstownrebels",
    instagram: "https://www.instagram.com/crosstownrebels/",
  },
  moblack: {
    website: "https://moblackrecords.com/",
    soundcloud: "https://soundcloud.com/moblackrecords",
    instagram: "https://www.instagram.com/moblackrecords/",
  },
  moblackrecords: {
    website: "https://moblackrecords.com/",
    soundcloud: "https://soundcloud.com/moblackrecords",
    instagram: "https://www.instagram.com/moblackrecords/",
  },
  "moblack-records": {
    website: "https://moblackrecords.com/",
    soundcloud: "https://soundcloud.com/moblackrecords",
    instagram: "https://www.instagram.com/moblackrecords/",
  },
  cajual: {
    website: "https://www.cajual.com/",
    soundcloud: "https://soundcloud.com/cajual",
  },
  soulfuric: {
    website: "https://www.soulfuric.com/",
    soundcloud: "https://soundcloud.com/soulfuric",
  },
  soulfurictrax: {
    website: "https://www.soulfuric.com/",
    soundcloud: "https://soundcloud.com/soulfuric",
  },
  "soulfuric-trax": {
    website: "https://www.soulfuric.com/",
    soundcloud: "https://soundcloud.com/soulfuric",
  },
  "soulfuric-deep": {
    website: "https://www.soulfuric.com/",
    soundcloud: "https://soundcloud.com/soulfuric",
  },
  steelcitydancediscs: {
    soundcloud: "https://soundcloud.com/scdd",
    instagram: "https://www.instagram.com/steelcitydancediscs/",
  },
  "steel-city-dance-discs": {
    soundcloud: "https://soundcloud.com/scdd",
    instagram: "https://www.instagram.com/steelcitydancediscs/",
  },
  heistrecordings: {
    website: "https://heistrecordings.com/",
    soundcloud: "https://soundcloud.com/heistrecordings",
  },
  "heist-recordings": {
    website: "https://heistrecordings.com/",
    soundcloud: "https://soundcloud.com/heistrecordings",
  },
  kneedeepinsound: {
    website: "https://www.kneedeepinsound.com/",
    soundcloud: "https://soundcloud.com/kneedeepinsound",
  },
  "knee-deep-in-sound": {
    website: "https://www.kneedeepinsound.com/",
    soundcloud: "https://soundcloud.com/kneedeepinsound",
  },
  classicmusiccompany: {
    website: "https://www.classicmusiccompany.com/",
    soundcloud: "https://soundcloud.com/classicmusiccompany",
  },
  "classic-music-company": {
    website: "https://www.classicmusiccompany.com/",
    soundcloud: "https://soundcloud.com/classicmusiccompany",
  },
  elrowmusic: {
    website: "https://www.elrow.com/",
    instagram: "https://www.instagram.com/elrowmusic/",
  },
  "elrow-music": {
    website: "https://www.elrow.com/",
    instagram: "https://www.instagram.com/elrowmusic/",
  },
  "ministry-of-sound-recordings": {
    website: "https://www.ministryofsound.com/",
    soundcloud: "https://soundcloud.com/ministryofsound",
  },
  ministryofsoundrecordings: {
    website: "https://www.ministryofsound.com/",
    soundcloud: "https://soundcloud.com/ministryofsound",
  },
  dimmak: {
    website: "https://www.dimmak.com/",
    soundcloud: "https://soundcloud.com/dimmakrecords",
    instagram: "https://www.instagram.com/dimmak/",
  },
  "dim-mak": {
    website: "https://www.dimmak.com/",
    soundcloud: "https://soundcloud.com/dimmakrecords",
    instagram: "https://www.instagram.com/dimmak/",
  },
  dirtybird: {
    website: "https://dirtybirdrecords.com/",
    soundcloud: "https://soundcloud.com/dirtybird",
    instagram: "https://www.instagram.com/dirtybird/",
  },
  snatchrecords: {
    soundcloud: "https://soundcloud.com/snatchrecords",
  },
  "snatch-records": {
    soundcloud: "https://soundcloud.com/snatchrecords",
  },
  deeperfect: {
    soundcloud: "https://soundcloud.com/deeperfect",
  },
  hellbeach: {
    soundcloud: "https://soundcloud.com/hellbeach",
  },
  "hell-beach": {
    soundcloud: "https://soundcloud.com/hellbeach",
  },
  defected: {
    website: "https://defected.com/",
    soundcloud: "https://soundcloud.com/defectedrecords",
    instagram: "https://www.instagram.com/defectedrecords/",
  },
  // Berlin imprint (Beatport label/12792, Bandcamp shop). Catalog KM071
  // "Say What" / "Crazy For It" are releases, not DJ sets.
  keinemusik: {
    website: "https://keinemusik.com/",
    soundcloud: "https://soundcloud.com/keinemusik",
    instagram: "https://instagram.com/keinemusikcrue",
  },
  toolroom: {
    website: "https://www.toolroomrecords.com/",
    soundcloud: "https://soundcloud.com/toolroom",
    instagram: "https://www.instagram.com/toolroom/",
  },
  "experts-only": {
    website: "https://www.expertsonly.club/",
    soundcloud: "https://soundcloud.com/expertsonly",
    instagram: "https://www.instagram.com/expertsonly/",
  },
  expertonly: {
    website: "https://www.expertsonly.club/",
    soundcloud: "https://soundcloud.com/expertsonly",
    instagram: "https://www.instagram.com/expertsonly/",
  },
  "hot-creations": {
    website: "https://www.hotcreations.com/",
    soundcloud: "https://soundcloud.com/hotcreations",
    instagram: "https://www.instagram.com/hotcreations/",
  },
  hotcreations: {
    website: "https://www.hotcreations.com/",
    soundcloud: "https://soundcloud.com/hotcreations",
    instagram: "https://www.instagram.com/hotcreations/",
  },
  "glitterbox-recordings": {
    website: "https://glitterbox.com/",
    soundcloud: "https://soundcloud.com/glitterbox",
    instagram: "https://www.instagram.com/glitterbox/",
  },
  glitterbox: {
    website: "https://glitterbox.com/",
    soundcloud: "https://soundcloud.com/glitterbox",
    instagram: "https://www.instagram.com/glitterbox/",
  },
  drumcode: {
    website: "https://www.drumcode.se/",
    soundcloud: "https://soundcloud.com/drumcode",
    instagram: "https://www.instagram.com/drumcode/",
  },
  afterlife: {
    website: "https://afterlife-label.com/",
    soundcloud: "https://soundcloud.com/afterlifelabel",
    instagram: "https://www.instagram.com/afterlife/",
  },
  anjunadeep: {
    website: "https://www.anjunadeep.com/",
    soundcloud: "https://soundcloud.com/anjunadeep",
    instagram: "https://www.instagram.com/anjunadeep/",
  },
  anjunabeats: {
    website: "https://www.anjunabeats.com/",
    soundcloud: "https://soundcloud.com/anjunabeats",
    instagram: "https://www.instagram.com/anjunabeats/",
  },
  diynamic: {
    website: "https://www.diynamic.com/",
    soundcloud: "https://soundcloud.com/diynamic",
    instagram: "https://www.instagram.com/diynamic/",
  },
  innervisions: {
    website: "https://www.innervisions.com/",
    soundcloud: "https://soundcloud.com/innervisions",
    instagram: "https://www.instagram.com/innervisions/",
  },
  "spinnin-records": {
    website: "https://www.spinninrecords.com/",
    soundcloud: "https://soundcloud.com/spinninrecords",
    instagram: "https://www.instagram.com/spinninrecords/",
  },
  spinninrecords: {
    website: "https://www.spinninrecords.com/",
    soundcloud: "https://soundcloud.com/spinninrecords",
    instagram: "https://www.instagram.com/spinninrecords/",
  },
  "musical-freedom": {
    website: "https://www.musicalfreedom.com/",
    soundcloud: "https://soundcloud.com/musicalfreedom",
  },
  "armada-music": {
    website: "https://www.armadamusic.com/",
    soundcloud: "https://soundcloud.com/armadamusic",
  },
  "mad-decent": {
    website: "https://maddecent.com/",
    soundcloud: "https://soundcloud.com/maddecent",
    instagram: "https://www.instagram.com/maddecent/",
  },
  maddecent: {
    website: "https://maddecent.com/",
    soundcloud: "https://soundcloud.com/maddecent",
    instagram: "https://www.instagram.com/maddecent/",
  },
  mau5trap: {
    website: "https://mau5trap.com/",
    soundcloud: "https://soundcloud.com/mau5trap",
  },
  deadbeats: {
    website: "https://deadbeats.com/",
    soundcloud: "https://soundcloud.com/deadbeatsofficial",
  },
  dftd: {
    website: "https://defected.com/",
    soundcloud: "https://soundcloud.com/dftd",
  },
  "solid-grooves": {
    soundcloud: "https://soundcloud.com/solidgrooves",
    instagram: "https://www.instagram.com/solidgrooves/",
  },
  rekids: {
    soundcloud: "https://soundcloud.com/rekids",
  },
  disorder: {
    soundcloud: "https://soundcloud.com/disorderrecords",
  },
  disorderrecords: {
    soundcloud: "https://soundcloud.com/disorderrecords",
  },
  "nervous-records": {
    website: "https://www.nervousny.com/",
    soundcloud: "https://soundcloud.com/nervousrecords",
  },
};

export function labelSocials(name: string): {
  soundcloud: string | null;
  instagram: string | null;
  website: string | null;
} {
  const h = socialHandle(name);
  const dashed = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const known =
    KNOWN_LABEL_SOCIALS[h] ||
    KNOWN_LABEL_SOCIALS[dashed] ||
    KNOWN_LABEL_SOCIALS[name.toLowerCase()];
  if (known) {
    return {
      soundcloud: known.soundcloud ?? null,
      instagram: known.instagram ?? null,
      website: known.website ?? null,
    };
  }
  // No invented {slug}.com — verify-urls / curated map fill these later.
  return { soundcloud: null, instagram: null, website: null };
}

export const SOCIAL_LABELS: Record<string, string> = {
  soundcloud: "SoundCloud",
  youtube: "YouTube",
  instagram: "Instagram",
  twitter: "X",
  website: "Website",
  beatport: "Beatport",
};

export const SOCIAL_SHORT: Record<string, string> = {
  soundcloud: "SC",
  youtube: "YT",
  instagram: "IG",
  twitter: "X",
  website: "WWW",
  beatport: "BP",
};

/** Stable pill order on DJ / venue / label profiles. */
export const SOCIAL_ORDER = [
  "soundcloud",
  "youtube",
  "instagram",
  "twitter",
  "website",
  "beatport",
] as const;
