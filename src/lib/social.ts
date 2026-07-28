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
  instagram: string | null;
  twitter: string | null;
  website: string | null;
};

/** No name-derived guesses — null until roster/crosslink/curated map says so. */
export function djSocials(_name: string): DjSocialFields {
  return { soundcloud: null, instagram: null, twitter: null, website: null };
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
  socials?: string[];
  website?: string | null;
}): DjSocialFields {
  const socials = opts.socials ?? [];
  const ig = socials.find((u) => /instagram\.com\//i.test(u)) ?? null;
  const tw = socials.find((u) => /(twitter|x)\.com\//i.test(u)) ?? null;
  const scFromList = socials.find((u) => /soundcloud\.com\//i.test(u)) ?? null;
  const webFromList =
    socials.find((u) => /^https?:\/\//i.test(u) && !isSocialHost(u)) ?? null;
  const sc = opts.soundcloudPermalink
    ? `https://soundcloud.com/${opts.soundcloudPermalink}`
    : scFromList;
  const website = opts.website || webFromList || null;
  return {
    soundcloud: sc ? absUrl(sc, "soundcloud") : null,
    instagram: ig ? absUrl(ig, "instagram") : null,
    twitter: tw ? absUrl(tw, "x") : null,
    website: website ? absUrl(website) : null,
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
  instagram: "Instagram",
  twitter: "X",
  website: "Website",
};

export const SOCIAL_SHORT: Record<string, string> = {
  soundcloud: "SC",
  instagram: "IG",
  twitter: "X",
  website: "WWW",
};
