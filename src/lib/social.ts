// Derives "main account" URLs from a name. These are best-effort demo handles
// (the crawler can later store real, verified handles on the entity instead).

export function socialHandle(name: string): string {
  return name
    .toLowerCase()
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
