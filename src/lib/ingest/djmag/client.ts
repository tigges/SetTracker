/**
 * Fetch helpers for djmag.com Live Sets (https://djmag.com/livesets).
 *
 * The listing embeds YouTube via lite-youtube + VideoObject JSON-LD.
 * Editorial /watch pages do not publish cue sheets — tracklists come from
 * the linked YouTube description / Music credits (see livesets.ts).
 */

const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; djmag-livesets)";
const TIMEOUT_MS = 20_000;
const LIST_URL = "https://djmag.com/livesets";

export type DjMagLivesetTeaser = {
  videoId: string;
  title: string;
  watchUrl: string;
  uploadDate?: string;
  description?: string;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&uuml;/g, "ü")
    .replace(/&iuml;/g, "ï")
    .replace(/&auml;/g, "ä")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchDjMagHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.length >= 2000 ? text : null;
  } catch {
    return null;
  }
}

function watchUrlFromBlock(block: string, title: string): string | null {
  const abs = block.match(/https:\/\/djmag\.com\/watch\/[a-z0-9\-]+/i);
  if (abs) return abs[0]!;
  const rel = block.match(/["'](\/watch\/[a-z0-9\-]+)["']/i);
  if (rel?.[1]) return `https://djmag.com${rel[1]}`;
  // Last resort: slugify title into /watch/ path (DJ Mag often uses this).
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug ? `https://djmag.com/watch/${slug}` : null;
}

/** Parse one livesets listing HTML page into YouTube teasers. */
export function parseLivesetsListingHtml(html: string): DjMagLivesetTeaser[] {
  const blocks = html.split(/paragraph--type--youtube/i).slice(1);
  const out: DjMagLivesetTeaser[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    const vid = block.match(/videoid=["']([A-Za-z0-9_-]{11})["']/i)?.[1];
    if (!vid || seen.has(vid)) continue;
    const label = block.match(/playlabel=["']([^"']+)["']/i)?.[1];
    const name = block.match(/"name"\s*:\s*"([^"]+)"/)?.[1];
    const titleRaw = label || name;
    if (!titleRaw) continue;
    const title = decodeEntities(titleRaw);
    if (title.length < 4) continue;

    const watchUrl = watchUrlFromBlock(block, title);
    if (!watchUrl) continue;

    const uploadDate = block.match(/"uploadDate"\s*:\s*"([^"]+)"/)?.[1];
    const description = block.match(/"description"\s*:\s*"([^"]*)"/)?.[1];

    seen.add(vid);
    out.push({
      videoId: vid,
      title,
      watchUrl,
      uploadDate: uploadDate || undefined,
      description: description ? decodeEntities(description) : undefined,
    });
  }

  // Fallback: bare lite-youtube tags if paragraph split missed some.
  if (out.length < 5) {
    for (const m of html.matchAll(
      /<lite-youtube\s+videoid=["']([A-Za-z0-9_-]{11})["']\s+playlabel=["']([^"']+)["']/gi,
    )) {
      const videoId = m[1]!;
      if (seen.has(videoId)) continue;
      const title = decodeEntities(m[2]!);
      const watchUrl = watchUrlFromBlock(m[0]!, title);
      if (!watchUrl) continue;
      seen.add(videoId);
      out.push({ videoId, title, watchUrl });
    }
  }

  return out;
}

export async function fetchLivesetsTeasers(opts?: {
  pages?: number;
  delayMs?: number;
}): Promise<DjMagLivesetTeaser[]> {
  const pages = Math.max(1, opts?.pages ?? 3);
  const delay = opts?.delayMs ?? 250;
  const out: DjMagLivesetTeaser[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < pages; page++) {
    const url = page === 0 ? LIST_URL : `${LIST_URL}?page=${page}`;
    const html = await fetchDjMagHtml(url);
    if (!html) {
      console.warn(`[djmag-livesets] listing fetch failed ${url}`);
      break;
    }
    const rows = parseLivesetsListingHtml(html);
    let added = 0;
    for (const row of rows) {
      if (seen.has(row.videoId)) continue;
      seen.add(row.videoId);
      out.push(row);
      added += 1;
    }
    console.log(
      `[djmag-livesets] page ${page}: +${added} (total ${out.length})`,
    );
    if (added === 0) break;
    if (page + 1 < pages) {
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return out;
}

export { LIST_URL as DJMAG_LIVESETS_URL };
