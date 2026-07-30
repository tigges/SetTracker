/**
 * Shared Insomniac.com HTML + Load More listing helpers.
 */

export const INSOMNIAC_UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; insomniac)";
export const INSOMNIAC_LOAD_MORE =
  "https://www.insomniac.com/wp-admin/admin-ajax.php";
export const INSOMNIAC_ACCENT = "#e10600";

export async function fetchInsomniacHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": INSOMNIAC_UA,
        Accept: "text/html",
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

export function listingNonce(html: string): string | null {
  const insm = html.match(/var\s+insmMainVars\s*=\s*(\{[\s\S]*?\})\s*;/);
  if (insm?.[1]) {
    try {
      const parsed = JSON.parse(insm[1]) as { nonce?: string };
      if (parsed.nonce) return parsed.nonce;
    } catch {
      /* fall through */
    }
  }
  return html.match(/"nonce":"([a-f0-9]+)"/i)?.[1] ?? null;
}

export function listingOffset(html: string): number {
  const btn = html.match(
    /class="[^"]*post-load-more-button[\s\S]*?<\/a>/i,
  )?.[0];
  const n = Number(btn?.match(/data-offset=["'](\d+)["']/i)?.[1] ?? 24);
  return Number.isFinite(n) && n > 0 ? n : 24;
}

export function slugsFromHtml(
  html: string,
  pattern: RegExp,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(pattern)) {
    const slug = m[1]!.toLowerCase().replace(/\/$/, "");
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

export type MusicSectionListing = {
  label: string;
  listingUrl: string;
  term: string;
  taxonomy?: string;
  postType?: string;
  /** Capture group 1 = slug under /music/ */
  slugPattern: RegExp;
  maxPages: number;
};

export async function fetchMusicSectionSlugs(
  opts: MusicSectionListing,
  sleep: (ms: number) => Promise<void>,
): Promise<string[]> {
  const first = await fetchInsomniacHtml(opts.listingUrl);
  if (!first) return [];
  const out = slugsFromHtml(first, opts.slugPattern);
  const seen = new Set(out);
  const nonce = listingNonce(first);
  let offset = listingOffset(first);
  const maxPages = opts.maxPages;

  if (!nonce || maxPages <= 1) return out;

  for (let page = 1; page < maxPages; page += 1) {
    try {
      const body = new URLSearchParams({
        action: "insm_get_load_more_content",
        nonce,
        post_type: opts.postType ?? "music",
        offset: String(offset),
        taxonomy: opts.taxonomy ?? "music-section",
        term: opts.term,
      });
      const res = await fetch(INSOMNIAC_LOAD_MORE, {
        method: "POST",
        headers: {
          "User-Agent": INSOMNIAC_UA,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json, text/javascript, */*",
          "X-Requested-With": "XMLHttpRequest",
          Referer: opts.listingUrl,
        },
        body,
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) {
        console.warn(
          `[${opts.label}] listing page ${page + 1}: HTTP ${res.status}`,
        );
        break;
      }
      const rawText = await res.text();
      let json: {
        success?: boolean;
        data?: { totalPosts?: number; content?: string } | string | number;
      };
      try {
        json = JSON.parse(rawText) as typeof json;
      } catch {
        console.warn(
          `[${opts.label}] listing page ${page + 1}: non-JSON ${rawText.slice(0, 80)}`,
        );
        break;
      }
      if (json.success !== true) {
        console.warn(
          `[${opts.label}] listing page ${page + 1}: ajax rejected ${rawText.slice(0, 120)}`,
        );
        break;
      }
      const content =
        typeof json.data === "object" && json.data && "content" in json.data
          ? json.data.content || ""
          : "";
      const batch = slugsFromHtml(content, opts.slugPattern);
      let added = 0;
      for (const s of batch) {
        if (seen.has(s)) continue;
        seen.add(s);
        out.push(s);
        added += 1;
      }
      const total = Number(
        (typeof json.data === "object" && json.data?.totalPosts) ??
          batch.length,
      );
      offset += Number.isFinite(total) && total > 0 ? total : 24;
      console.log(
        `[${opts.label}] listing page ${page + 1}: +${added} (total ${out.length})`,
      );
      if (added === 0 || total === 0) break;
      await sleep(150);
    } catch (err) {
      console.warn(
        `[${opts.label}] listing page ${page + 1}:`,
        err instanceof Error ? err.message : err,
      );
      break;
    }
  }
  return out;
}

export function insomniacMusicUrl(slug: string): string {
  return `https://www.insomniac.com/music/${slug.replace(/\/$/, "")}/`;
}

export function titleFromInsomniacHtml(html: string, fallbackSlug: string): string {
  const og = html.match(
    /property=["']og:title["']\s+content=["']([^"']+)["']/i,
  );
  if (og?.[1]) return og[1].replace(/\s*[|–—].*$/, "").trim();
  const t = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  if (t) {
    return t
      .replace(/\s*[|–—].*$/, "")
      .replace(/^['‘]|['’]$/g, "")
      .trim();
  }
  return fallbackSlug.replace(/-/g, " ");
}

export function publishedAtFromInsomniacHtml(html: string): Date | null {
  const meta =
    html.match(
      /property=["']article:published_time["']\s+content=["']([^"']+)["']/i,
    ) || html.match(/datetime=["']([^"']+)["']/i);
  if (meta?.[1]) {
    const d = new Date(meta[1]);
    if (!Number.isNaN(d.getTime())) return d;
  }

  // Editorial pages often only show "Nov 07, 2018" in page-header__meta.
  const header = html.match(
    /page-header__meta[\s\S]{0,500}?<span>\s*([A-Z][a-z]{2}\s+\d{1,2},\s+20\d{2})\s*<\/span>/i,
  );
  if (header?.[1]) {
    const d = new Date(`${header[1]} UTC`);
    if (!Number.isNaN(d.getTime())) return d;
  }

  // Fallback: WordPress upload path in og:image (/uploads/2018/11/07…).
  const og = html.match(
    /\/uploads\/(20\d{2})\/(\d{2})\/(\d{2})\d*\//i,
  );
  if (og) {
    const d = new Date(
      Date.UTC(Number(og[1]), Number(og[2]) - 1, Number(og[3]), 12),
    );
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * YouTube watch URL from the *music* embed only.
 * Site chrome / commented promo trailers (e.g. EDC 2021) must not become playback.
 */
export function youtubeWatchFromHtml(html: string): string | null {
  const stripped = html.replace(/<!--[\s\S]*?-->/g, " ");
  const region = stripped.match(
    /class=["'][^"']*music-embed[^"']*["'][\s\S]{0,4000}/i,
  )?.[0];
  if (!region) return null;
  const m = region.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/i);
  if (!m?.[1] || /[{}]/.test(m[1])) return null;
  return `https://www.youtube.com/watch?v=${m[1]}`;
}

/**
 * Mixcloud permalink from Insomniac music-embed widgets (often lazy-loaded).
 * Example feed: %2Finsomniacevents%2Fdon-diablo-edc-orlando-2018-mix%2F
 */
export function mixcloudUrlFromHtml(html: string): string | null {
  const region =
    html.match(/class=["'][^"']*music-embed[^"']*["'][\s\S]{0,4000}/i)?.[0] ??
    html;

  const feedParam =
    region.match(
      /mixcloud\.com\/widget\/iframe\/\?[^"'>\s]*?feed=([^"'&\s]+)/i,
    ) ||
    region.match(
      /mixcloud\.com\/widget\/iframe\/[^"'>\s]*feed%3D([^"'&\s]+)/i,
    );
  if (feedParam?.[1]) {
    const path = decodeURIComponent(feedParam[1].replace(/&#038;/g, "&"))
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");
    if (/^[a-z0-9_-]+\/[a-z0-9_-]+$/i.test(path)) {
      return `https://www.mixcloud.com/${path.toLowerCase()}/`;
    }
  }

  const direct = region.match(
    /https?:\/\/(?:www\.)?mixcloud\.com\/([a-z0-9_-]+\/[a-z0-9_-]+)\/?/i,
  );
  if (direct?.[1] && !/^widget\//i.test(direct[1])) {
    return `https://www.mixcloud.com/${direct[1].toLowerCase()}/`;
  }
  return null;
}

/** Prefer track-level SC URLs over bare profile links. */
export function soundcloudTrackUrlFromHtml(html: string): string | null {
  const region =
    html.match(/class=["'][^"']*music-embed[^"']*["'][\s\S]{0,4000}/i)?.[0] ??
    html;
  const track = region.match(
    /https?:\/\/(?:w\.)?soundcloud\.com\/([a-z0-9_-]+\/[a-z0-9\-]+)(?:[?"'\s]|\/|$)/i,
  );
  if (track?.[1] && !/\/sets\//i.test(track[1])) {
    return `https://soundcloud.com/${track[1].toLowerCase()}`;
  }
  const api = region.match(/api\.soundcloud\.com\/tracks\/(\d+)/i);
  if (api?.[1]) return `https://api.soundcloud.com/tracks/${api[1]}`;
  return null;
}
