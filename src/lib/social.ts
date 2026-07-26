// Derives "main account" URLs from a name. Prefer roster / crawler-verified
// handles via `djSocialsFromRoster` when available.

export function socialHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/[øØ]/g, "o")
    .replace(/[æÆ]/g, "ae")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function djSocials(name: string): {
  soundcloud: string;
  instagram: string;
  twitter: string;
} {
  const h = socialHandle(name);
  return {
    soundcloud: `https://soundcloud.com/${h}`,
    instagram: `https://instagram.com/${h}`,
    twitter: `https://x.com/${h}`,
  };
}

/** Prefer curated roster permalinks / social URLs over name-derived guesses. */
export function djSocialsFromKnown(opts: {
  name: string;
  soundcloudPermalink?: string | null;
  socials?: string[];
  website?: string | null;
}): {
  soundcloud: string;
  instagram: string;
  twitter: string;
} {
  const fallback = djSocials(opts.name);
  const socials = opts.socials ?? [];
  const ig =
    socials.find((u) => /instagram\.com\//i.test(u)) ?? fallback.instagram;
  const tw =
    socials.find((u) => /(twitter|x)\.com\//i.test(u)) ?? fallback.twitter;
  const sc = opts.soundcloudPermalink
    ? `https://soundcloud.com/${opts.soundcloudPermalink}`
    : (socials.find((u) => /soundcloud\.com\//i.test(u)) ?? fallback.soundcloud);
  return {
    soundcloud: sc.startsWith("http") ? sc : `https://soundcloud.com/${sc}`,
    instagram: ig.startsWith("http") ? ig : `https://instagram.com/${ig}`,
    twitter: tw.startsWith("http") ? tw : `https://x.com/${tw}`,
  };
}

export function labelSocials(name: string): {
  soundcloud: string;
  instagram: string;
  website: string;
} {
  const h = socialHandle(name);
  return {
    soundcloud: `https://soundcloud.com/${h}`,
    instagram: `https://instagram.com/${h}`,
    website: `https://${h}.com`,
  };
}

// Small labels used for social pills in the UI.
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
