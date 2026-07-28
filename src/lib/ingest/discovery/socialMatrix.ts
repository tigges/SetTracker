/**
 * Normalise roster + discovered URLs into the artist social matrix columns:
 * YT · SC · X · IG · TT · BP · SF · AM · FB · Web
 */

export type SocialMatrix = {
  youtube: string;
  soundcloud: string;
  x: string;
  instagram: string;
  tiktok: string;
  beatport: string;
  spotify: string;
  appleMusic: string;
  facebook: string;
  website: string;
};

const EMPTY: SocialMatrix = {
  youtube: "",
  soundcloud: "",
  x: "",
  instagram: "",
  tiktok: "",
  beatport: "",
  spotify: "",
  appleMusic: "",
  facebook: "",
  website: "",
};

function abs(url: string): string {
  const t = url.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t.replace(/\/$/, "");
  return `https://${t.replace(/^\/\//, "")}`.replace(/\/$/, "");
}

function hostPath(url: string): { host: string; path: string } | null {
  try {
    const u = new URL(abs(url));
    return {
      host: u.hostname.replace(/^www\./, "").toLowerCase(),
      path: u.pathname,
    };
  } catch {
    return null;
  }
}

const HUB_HOSTS = new Set([
  "hoo.be",
  "lnk.to",
  "linktr.ee",
  "fanlink.tv",
  "fanlink.to",
  "ffm.to",
  "beacons.ai",
  "bio.site",
  "carrd.co",
]);

/** Platforms already mapped to dedicated columns — never put these in Web. */
const SOCIAL_HOSTS = new Set([
  "youtube.com",
  "youtu.be",
  "music.youtube.com",
  "soundcloud.com",
  "twitter.com",
  "x.com",
  "platform.twitter.com",
  "instagram.com",
  "tiktok.com",
  "beatport.com",
  "open.spotify.com",
  "spotify.com",
  "music.apple.com",
  "facebook.com",
  "fb.com",
]);

function isHub(host: string): boolean {
  if (HUB_HOSTS.has(host)) return true;
  return host.endsWith(".fanlink.tv") || host.endsWith(".lnk.to");
}

function isWebsiteCandidate(host: string, path: string): boolean {
  if (!host) return false;
  if (SOCIAL_HOSTS.has(host)) return false;
  // Asset / tracking junk that sometimes leaks from scraped HTML
  if (/\.(js|css|png|jpe?g|gif|svg|ico|woff2?)$/i.test(path)) return false;
  if (host.startsWith("platform.") || host.startsWith("static.")) return false;
  return true; // hubs + personal domains ok
}

/** Pick the best URL per column from a bag of links + known YT/SC handles. */
export function buildSocialMatrix(input: {
  youtubeHandle?: string | null;
  soundcloudPermalink?: string | null;
  website?: string | null;
  links?: string[];
}): SocialMatrix {
  const m: SocialMatrix = { ...EMPTY };
  if (input.youtubeHandle) {
    const h = input.youtubeHandle.startsWith("@")
      ? input.youtubeHandle
      : `@${input.youtubeHandle}`;
    m.youtube = `https://www.youtube.com/${h}`;
  }
  if (input.soundcloudPermalink) {
    m.soundcloud = `https://soundcloud.com/${input.soundcloudPermalink}`;
  }
  const websiteLocked = Boolean(input.website);
  if (input.website) m.website = abs(input.website);

  for (const raw of input.links ?? []) {
    const parsed = hostPath(raw);
    if (!parsed) continue;
    const { host, path } = parsed;
    const url = abs(raw);

    if (host === "youtube.com" || host === "youtu.be") {
      if (!m.youtube) {
        const at = path.match(/^\/(@[\w.-]+)/);
        const ch = path.match(/^\/channel\/(UC[\w-]{20,})/);
        const vanity = path.match(/^\/(c|user)\/([\w.-]+)/);
        if (at) m.youtube = `https://www.youtube.com/${at[1]}`;
        else if (ch) m.youtube = `https://www.youtube.com/channel/${ch[1]}`;
        else if (vanity) {
          m.youtube = `https://www.youtube.com/${vanity[1]}/${vanity[2]}`;
        }
      }
      continue;
    }
    if (host === "soundcloud.com" && !m.soundcloud) {
      const p = path.match(/^\/([A-Za-z0-9_-]+)/);
      if (p && !["you", "discover", "sets", "search"].includes(p[1].toLowerCase())) {
        m.soundcloud = `https://soundcloud.com/${p[1]}`;
      }
      continue;
    }
    if ((host === "twitter.com" || host === "x.com") && !m.x) {
      const p = path.match(/^\/([A-Za-z0-9_]+)/);
      if (p && !["intent", "share", "home", "i"].includes(p[1].toLowerCase())) {
        m.x = `https://x.com/${p[1]}`;
      }
      continue;
    }
    if (host === "instagram.com" && !m.instagram) {
      const p = path.match(/^\/([A-Za-z0-9._]+)/);
      if (p && !["p", "reel", "stories", "explore"].includes(p[1].toLowerCase())) {
        m.instagram = `https://instagram.com/${p[1]}`;
      }
      continue;
    }
    if (host === "tiktok.com" && !m.tiktok) {
      const p = path.match(/^\/(@[\w.-]+)/) || path.match(/^\/([A-Za-z0-9._]+)/);
      if (p) {
        const handle = p[1].startsWith("@") ? p[1] : `@${p[1]}`;
        m.tiktok = `https://tiktok.com/${handle}`;
      }
      continue;
    }
    if (host === "beatport.com" && !m.beatport) {
      if (/\/artist\//i.test(path)) m.beatport = url;
      continue;
    }
    if (host === "open.spotify.com" && !m.spotify) {
      if (/\/artist\//i.test(path)) m.spotify = url;
      continue;
    }
    if (host === "music.apple.com" && !m.appleMusic) {
      if (/\/artist\//i.test(path)) m.appleMusic = url;
      continue;
    }
    if ((host === "facebook.com" || host === "fb.com") && !m.facebook) {
      const p = path.match(/^\/([A-Za-z0-9.]+)/);
      if (p && !["share", "watch", "groups"].includes(p[1].toLowerCase())) {
        m.facebook = `https://facebook.com/${p[1]}`;
      }
      continue;
    }
    // Hub or personal site → Web (never social hosts). Roster website wins.
    if (websiteLocked) continue;
    if (!isWebsiteCandidate(host, path)) continue;
    if (!m.website) {
      m.website = url;
    } else {
      const curHost = hostPath(m.website)?.host ?? "";
      if (isHub(curHost) && !isHub(host)) m.website = url;
    }
  }

  return m;
}

export function socialMatrixMarkdownTable(
  rows: { name: string; matrix: SocialMatrix }[],
): string {
  const header =
    "| Artist | YT | SC | X | IG | TT | BP | SF | AM | FB | Web |";
  const sep =
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |";
  const body = rows.map(({ name, matrix: m }) => {
    const cells = [
      name,
      m.youtube,
      m.soundcloud,
      m.x,
      m.instagram,
      m.tiktok,
      m.beatport,
      m.spotify,
      m.appleMusic,
      m.facebook,
      m.website,
    ];
    return `| ${cells.join(" | ")} |`;
  });
  return [header, sep, ...body].join("\n");
}
