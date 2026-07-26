/**
 * Scrape boilerroom.tv session pages for media hosts + titles.
 * Modern BR sessions often host audio on SoundCloud; classic archive is on YT.
 */

const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; boilerroom)";
const VIDEO_INDEX = "https://boilerroom.tv/video/";
const HOME = "https://boilerroom.tv/";

export type BoilerRoomSession = {
  slug: string;
  title: string;
  pageUrl: string;
  /** SoundCloud track permalinks found on the session page */
  soundcloudUrls: string[];
  /** YouTube video ids when the page embeds/links YT */
  youtubeIds: string[];
};

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function collectSlugs(html: string, out: string[], seen: Set<string>) {
  for (const m of html.matchAll(/\/session\/([a-z0-9][a-z0-9-]{2,120})/gi)) {
    const slug = m[1]!.toLowerCase();
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
}

/** Session slugs linked from /video + homepage (featured + grid). */
export async function listSessionSlugs(): Promise<string[]> {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const url of [VIDEO_INDEX, HOME]) {
    const html = await fetchHtml(url);
    if (!html) continue;
    collectSlugs(html, out, seen);
  }
  return out;
}

export async function fetchSession(
  slug: string,
): Promise<BoilerRoomSession | null> {
  const pageUrl = `https://boilerroom.tv/session/${slug}/`;
  const html = await fetchHtml(pageUrl);
  if (!html) return null;

  const titleRaw =
    html.match(/property="og:title" content="([^"]+)"/i)?.[1] ||
    html.match(/<title>([^<]+)<\/title>/i)?.[1] ||
    slug;
  const title = decode(titleRaw.replace(/\s*[-|]\s*BOILER ROOM\s*$/i, ""));

  const soundcloudUrls = [
    ...new Set(
      [...html.matchAll(/https?:\/\/soundcloud\.com\/[a-z0-9_\-./]+/gi)].map(
        (m) => m[0]!.replace(/\/$/, ""),
      ),
    ),
  ].filter(
    (u) =>
      /soundcloud\.com\/platform\//i.test(u) ||
      /soundcloud\.com\/[^/]+\/[^/]+/i.test(u),
  );

  const youtubeIds = [
    ...new Set(
      [
        ...html.matchAll(
          /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi,
        ),
      ].map((m) => m[1]!),
    ),
  ];

  return {
    slug,
    title,
    pageUrl,
    soundcloudUrls,
    youtubeIds,
  };
}

/**
 * Map a YouTube Boiler Room title → likely session slug.
 * e.g. "Tiffany Day | Boiler Room London: Tiffany Day" → london-tiffany-day
 */
export function guessSessionSlugFromYtTitle(title: string): string | null {
  // Prefer "Boiler Room City: Artist" anywhere in the title
  const brCityArtist = title.match(
    /Boiler Room\s+([A-Za-z][A-Za-z.'\-\s]+):\s*([^|/]+)/i,
  );
  if (brCityArtist) {
    return slugifyPart(`${brCityArtist[1]} ${brCityArtist[2]}`);
  }

  const cleaned = title
    .replace(/\s*[|–—]\s*Boiler Room.*$/i, "")
    .replace(/^Boiler Room\s*[|–—:]\s*/i, "")
    .trim();

  // "City: Artist"
  const cityArtist = cleaned.match(/^([A-Za-z][A-Za-z\s]+):\s*(.+)$/);
  if (cityArtist) {
    return slugifyPart(`${cityArtist[1]} ${cityArtist[2]}`);
  }

  if (cleaned.length >= 3) return slugifyPart(cleaned);
  return null;
}

function slugifyPart(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
