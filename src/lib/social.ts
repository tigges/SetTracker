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
};

/** No name-derived guesses — null until roster/crosslink/curated map says so. */
export function djSocials(_name: string): DjSocialFields {
  return { soundcloud: null, instagram: null, twitter: null };
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
  const sc = opts.soundcloudPermalink
    ? `https://soundcloud.com/${opts.soundcloudPermalink}`
    : scFromList;
  return {
    soundcloud: sc
      ? sc.startsWith("http")
        ? sc
        : `https://soundcloud.com/${sc}`
      : null,
    instagram: ig
      ? ig.startsWith("http")
        ? ig
        : `https://instagram.com/${ig}`
      : null,
    twitter: tw
      ? tw.startsWith("http")
        ? tw
        : `https://x.com/${tw}`
      : null,
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
};

export function labelSocials(name: string): {
  soundcloud: string | null;
  instagram: string | null;
  website: string | null;
} {
  const h = socialHandle(name);
  const dashed = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
