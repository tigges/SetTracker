/**
 * Fetch YouTube watch-page metadata without an API key.
 *
 * We parse ytInitialPlayerResponse + ytInitialData from the HTML for:
 * - title / channel / duration / description
 * - YouTube Music "songs in this video" cards (videoAttributeViewModel)
 */

/** Googlebot UA unlocks player metadata; desktop UAs often get LOGIN_REQUIRED. */
const UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

export type YtMusicCredit = {
  title: string;
  artistName: string;
};

export type YtWatchMeta = {
  videoId: string;
  title: string;
  channel: string;
  durationSec: number;
  description: string;
  publishedAt: Date | null;
  musicCredits: YtMusicCredit[];
  watchUrl: string;
};

/** Extract `varName = {...};` JSON with brace matching (regex is too fragile). */
function extractJsonAssign(html: string, varName: string): unknown | null {
  const needle = `${varName} = `;
  let start = html.indexOf(needle);
  if (start < 0) {
    start = html.indexOf(`var ${needle}`);
    if (start >= 0) start = html.indexOf("=", start) + 1;
  } else {
    start = start + needle.length;
  }
  if (start < 0) return null;

  while (start < html.length && /\s/.test(html[start])) start += 1;
  if (html[start] !== "{") return null;

  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        const raw = html.slice(start, i + 1);
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function textOf(node: unknown): string | null {
  if (!node) return null;
  if (typeof node === "string") return node;
  if (typeof node !== "object") return null;
  const o = node as Record<string, unknown>;
  if (typeof o.simpleText === "string") return o.simpleText;
  if (Array.isArray(o.runs)) {
    return o.runs
      .map((r) =>
        r && typeof r === "object" && typeof (r as { text?: string }).text === "string"
          ? (r as { text: string }).text
          : "",
      )
      .join("");
  }
  if (typeof o.content === "string") return o.content;
  return null;
}

function walkMusicCredits(obj: unknown, out: YtMusicCredit[]): void {
  if (!obj) return;
  if (Array.isArray(obj)) {
    for (const x of obj) walkMusicCredits(x, out);
    return;
  }
  if (typeof obj !== "object") return;
  const o = obj as Record<string, unknown>;
  if (o.videoAttributeViewModel && typeof o.videoAttributeViewModel === "object") {
    const v = o.videoAttributeViewModel as Record<string, unknown>;
    const title = typeof v.title === "string" ? v.title.trim() : null;
    const artistName =
      typeof v.subtitle === "string"
        ? v.subtitle.trim()
        : textOf(v.subtitle)?.trim() || null;
    if (title && artistName && title.toLowerCase() !== "music") {
      out.push({ title, artistName });
    }
  }
  for (const v of Object.values(o)) walkMusicCredits(v, out);
}

function publishedFromPlayer(player: Record<string, unknown>): Date | null {
  const micro = player.microformat as
    | { playerMicroformatRenderer?: { publishDate?: string; uploadDate?: string } }
    | undefined;
  const raw =
    micro?.playerMicroformatRenderer?.publishDate ||
    micro?.playerMicroformatRenderer?.uploadDate;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function extractVideoId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
    if (idx >= 0 && parts[idx + 1] && /^[\w-]{11}$/.test(parts[idx + 1])) {
      return parts[idx + 1];
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function fetchWatchMeta(videoIdOrUrl: string): Promise<YtWatchMeta> {
  const videoId = extractVideoId(videoIdOrUrl);
  if (!videoId) throw new Error(`Invalid YouTube id/url: ${videoIdOrUrl}`);

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(watchUrl, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`YouTube watch HTTP ${res.status}`);
  const html = await res.text();

  const player = extractJsonAssign(html, "ytInitialPlayerResponse") as Record<
    string,
    unknown
  > | null;
  const initial = extractJsonAssign(html, "ytInitialData") as Record<
    string,
    unknown
  > | null;

  const details = (player?.videoDetails || {}) as Record<string, unknown>;
  let title = String(details.title || "").trim();
  let channel = String(details.author || "").trim();
  let durationSec = Math.max(0, Number(details.lengthSeconds || 0) || 0);
  const description = String(details.shortDescription || "");

  // Fallbacks from ytInitialData overlay when player blob is restricted.
  if (initial && (!title || !channel || !durationSec)) {
    const overlay = findPlayerOverlayDetails(initial);
    if (!title && overlay?.title) title = overlay.title;
    if (!channel && overlay?.channel) channel = overlay.channel;
  }
  if (!durationSec && player) {
    const approx = approxDurationFromPlayer(player);
    if (approx) durationSec = approx;
  }

  const musicCredits: YtMusicCredit[] = [];
  if (initial) walkMusicCredits(initial, musicCredits);
  // de-dupe while preserving order
  const seen = new Set<string>();
  const uniqueCredits = musicCredits.filter((c) => {
    const k = `${c.artistName.toLowerCase()}::${c.title.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (!title) throw new Error(`YouTube metadata missing for ${videoId}`);
  if (!durationSec) {
    // Last resort so Music credits can still land with order-only cues.
    durationSec = Math.max(uniqueCredits.length * 180, 30 * 60);
  }

  return {
    videoId,
    title,
    channel,
    durationSec,
    description,
    publishedAt: player ? publishedFromPlayer(player) : null,
    musicCredits: uniqueCredits,
    watchUrl,
  };
}

function findPlayerOverlayDetails(
  initial: Record<string, unknown>,
): { title?: string; channel?: string } | null {
  const hits: { title?: string; channel?: string } = {};
  const walk = (obj: unknown): void => {
    if (!obj || hits.title) return;
    if (Array.isArray(obj)) {
      for (const x of obj) walk(x);
      return;
    }
    if (typeof obj !== "object") return;
    const o = obj as Record<string, unknown>;
    if (o.playerOverlayVideoDetailsRenderer) {
      const r = o.playerOverlayVideoDetailsRenderer as Record<string, unknown>;
      hits.title = textOf(r.title) ?? undefined;
      const sub = r.subtitle as { runs?: { text?: string }[] } | undefined;
      const channelRun = sub?.runs?.[0]?.text;
      if (channelRun) hits.channel = channelRun;
      return;
    }
    for (const v of Object.values(o)) walk(v);
  };
  walk(initial);
  return hits.title || hits.channel ? hits : null;
}

function approxDurationFromPlayer(player: Record<string, unknown>): number | null {
  const micro = player.microformat as
    | {
        playerMicroformatRenderer?: {
          lengthSeconds?: string | number;
        };
      }
    | undefined;
  const n = Number(micro?.playerMicroformatRenderer?.lengthSeconds || 0);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function channelBase(handleOrUrl: string): string {
  const handle = handleOrUrl.trim();
  if (handle.startsWith("http")) return handle.replace(/\/$/, "");
  // Accept bare channel IDs (UC…) as well as @handles
  if (/^UC[\w-]{20,}$/.test(handle)) {
    return `https://www.youtube.com/channel/${handle}`;
  }
  const h = handle.startsWith("@") ? handle : `@${handle}`;
  return `https://www.youtube.com/${h}`;
}

function uniqueIds(ids: string[], limit: number, seen: Set<string>): string[] {
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (seen.size >= limit) break;
  }
  return out;
}

async function fetchChannelTabHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`YouTube channel HTTP ${res.status} for ${url}`);
  return res.text();
}

async function browseContinuation(
  apiKey: string,
  continuation: string,
): Promise<{ ids: string[]; next: string | null }> {
  const res = await fetch(
    `https://www.youtube.com/youtubei/v1/browse?prettyPrint=false&key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240725.01.00",
            hl: "en",
            gl: "US",
          },
        },
        continuation,
      }),
      signal: AbortSignal.timeout(25_000),
    },
  );
  if (!res.ok) return { ids: [], next: null };
  const text = await res.text();
  const ids = [...text.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]);
  const next =
    text.match(/"continuationCommand":\{"token":"([^"]+)"/)?.[1] ?? null;
  return { ids, next };
}

/**
 * Recent uploads from a YouTube channel videos tab (no API key).
 * Returns video IDs in page order (newest-first when the tab hydrates).
 */
export async function fetchChannelVideoIds(
  handleOrUrl: string,
  limit = 12,
): Promise<string[]> {
  const url = `${channelBase(handleOrUrl)}/videos`;
  const html = await fetchChannelTabHtml(url);
  const ids = [...html.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]);
  const seen = new Set<string>();
  return uniqueIds(ids, limit, seen);
}

/**
 * Deep channel scan: /videos + /streams, with Innertube continuation pages.
 * Aimed at pulling a near-complete recent catalog of long-form uploads.
 */
export async function fetchChannelVideoIdsDeep(
  handleOrUrl: string,
  limit = 80,
): Promise<string[]> {
  if (!handleOrUrl?.trim()) return [];
  const base = channelBase(handleOrUrl);
  const seen = new Set<string>();
  const out: string[] = [];

  const tabs = [`${base}/videos`, `${base}/streams`];
  let apiKey: string | null = null;
  let continuation: string | null = null;

  for (const tab of tabs) {
    if (out.length >= limit) break;
    try {
      const html = await fetchChannelTabHtml(tab);
      await sleep(150);
      if (!apiKey) {
        apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1] ?? null;
      }
      if (!continuation) {
        continuation =
          html.match(/"continuationCommand":\{"token":"([^"]+)"/)?.[1] ?? null;
      }
      const ids = [...html.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]);
      out.push(...uniqueIds(ids, limit - out.length, seen));
    } catch (err) {
      console.warn(
        `[youtube] tab ${tab}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Paginate the videos tab continuation until we hit the limit.
  let pages = 0;
  const maxPages = Number(process.env.YOUTUBE_CONTINUATION_PAGES || 4);
  while (
    apiKey &&
    continuation &&
    out.length < limit &&
    pages < maxPages
  ) {
    pages += 1;
    try {
      const page = await browseContinuation(apiKey, continuation);
      await sleep(150);
      out.push(...uniqueIds(page.ids, limit - out.length, seen));
      continuation = page.next;
      if (!page.ids.length) break;
    } catch (err) {
      console.warn(
        `[youtube] continuation failed:`,
        err instanceof Error ? err.message : err,
      );
      break;
    }
  }

  return out;
}

const SOCIAL_HOST_RE =
  "soundcloud\\.com|instagram\\.com|x\\.com|twitter\\.com|tiktok\\.com|facebook\\.com|fb\\.com|linktr\\.ee|hoo\\.be|lnk\\.to|fanlink\\.tv|ffm\\.to|open\\.spotify\\.com|music\\.apple\\.com|beatport\\.com|youtube\\.com|youtu\\.be";

/** Extract outbound social / hub links from a channel About (or channel) page. */
export async function fetchChannelSocialLinks(
  handleOrUrl: string,
): Promise<string[]> {
  if (!handleOrUrl?.trim()) return [];
  const url = `${channelBase(handleOrUrl)}/about`;
  try {
    const html = await fetchChannelTabHtml(url);
    const escaped = [
      ...html.matchAll(
        new RegExp(
          `https?:\\\\/\\\\/(?:www\\\\.)?(?:${SOCIAL_HOST_RE})[^"\\\\]*`,
          "gi",
        ),
      ),
    ].map((m) => m[0].replace(/\\\//g, "/"));
    const plain = [
      ...html.matchAll(
        new RegExp(
          `https?:\\/\\/(?:www\\.)?(?:${SOCIAL_HOST_RE})[^\\s"\\\\<]+`,
          "gi",
        ),
      ),
    ].map((m) => m[0].replace(/[),.;]+$/, ""));
    // Bare www. / host paths that YouTube surfaces without scheme
    const bare = [
      ...html.matchAll(
        /(?:instagram\.com|twitter\.com|x\.com|tiktok\.com|facebook\.com|soundcloud\.com)\/[A-Za-z0-9._~-]+/gi,
      ),
    ].map((m) => `https://${m[0]}`);
    return [...new Set([...escaped, ...plain, ...bare])].filter(isUsefulOutboundLink);
  } catch {
    return [];
  }
}

/** Drop YouTube chrome / assets that match the broad host regex. */
function isUsefulOutboundLink(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtube.com" || host === "youtu.be") {
      // Keep channel / @ / watch links; drop favicons, error beacons, /s/desktop assets
      if (/\/(s\/desktop|img\/|error_)/i.test(u.pathname)) return false;
      if (u.searchParams.has("t") && u.searchParams.get("t") === "jserror") {
        return false;
      }
      return (
        u.pathname.startsWith("/@") ||
        u.pathname.startsWith("/channel/") ||
        u.pathname.startsWith("/c/") ||
        u.pathname.startsWith("/user/") ||
        u.pathname.startsWith("/watch")
      );
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve a channel URL or UC… id to the public @handle when YouTube exposes
 * `canonicalBaseUrl:"/@Foo"`.
 */
export async function resolveYoutubeHandle(
  handleOrUrlOrChannelId: string,
): Promise<string | null> {
  if (!handleOrUrlOrChannelId?.trim()) return null;
  const at = handleOrUrlOrChannelId.match(/@([\w.-]+)/);
  if (at && !handleOrUrlOrChannelId.includes("channel/")) {
    return `@${at[1]}`;
  }
  try {
    const html = await fetchChannelTabHtml(channelBase(handleOrUrlOrChannelId));
    const canonical = html.match(/"canonicalBaseUrl":"\/(@[\w.-]+)"/);
    if (canonical) return canonical[1];
    const vanity = html.match(
      /https?:\/\/(?:www\.)?youtube\.com\/(@[\w.-]+)/i,
    );
    return vanity?.[1] ?? null;
  } catch {
    return null;
  }
}

function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[øØ]/g, "o")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Search YouTube for an artist channel and return the best @handle when the
 * channel title roughly matches the artist name (or SC permalink).
 */
export async function searchYoutubeChannelHandle(
  artistName: string,
  opts?: { soundcloudPermalink?: string | null },
): Promise<string | null> {
  const q = encodeURIComponent(`${artistName} DJ`);
  // sp=EgIQAg%3D%3D → Channel filter
  const url = `https://www.youtube.com/results?search_query=${q}&sp=EgIQAg%253D%253D`;
  try {
    const html = await fetchChannelTabHtml(url);
    const handles = [
      ...html.matchAll(/"canonicalBaseUrl":"\/(@[\w.-]+)"/g),
    ].map((m) => m[1]);
    const uniq = [...new Set(handles)];
    if (!uniq.length) return null;

    const want = normName(artistName);
    const sc = opts?.soundcloudPermalink
      ? normName(opts.soundcloudPermalink)
      : "";

    for (const h of uniq.slice(0, 8)) {
      const handleNorm = normName(h.replace(/^@/, ""));
      // Prefer exact / near-exact handle matches (realblackcoffee, chapterandversemusic)
      if (
        handleNorm === want ||
        handleNorm === sc ||
        handleNorm.includes(want) ||
        (sc && handleNorm.includes(sc)) ||
        (want.length >= 6 && sc && sc.includes(handleNorm))
      ) {
        return h;
      }
      // Fall back to fetching channel title
      try {
        const page = await fetchChannelTabHtml(channelBase(h));
        await sleep(80);
        const title =
          page.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(
            /\s*-\s*YouTube\s*$/i,
            "",
          ) ?? "";
        const t = normName(title);
        if (t === want || t.includes(want) || want.includes(t)) return h;
      } catch {
        /* try next */
      }
    }
    return null;
  } catch {
    return null;
  }
}
