/**
 * Fetch YouTube watch-page metadata without an API key.
 *
 * We parse ytInitialPlayerResponse + ytInitialData from the HTML for:
 * - title / channel / duration / description
 * - YouTube Music "songs in this video" cards (videoAttributeViewModel)
 * - related / "other tracks" / end-screen video ids
 * - channel-home shelves: Fans also like, Spotlights
 */

/** Googlebot UA unlocks player metadata; desktop UAs often get LOGIN_REQUIRED. */
const UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

export type YtMusicCredit = {
  title: string;
  artistName: string;
};

export type YtRelatedVideo = {
  videoId: string;
  title: string;
  channel?: string | null;
  /** Shelf / section label when known (e.g. "Fans also like", "Spotlight"). */
  shelf?: string | null;
};

export type YtSimilarChannel = {
  handle: string;
  name: string;
  shelf: string;
};

export type YtChannelShelfDiscovery = {
  similarChannels: YtSimilarChannel[];
  spotlightVideoIds: string[];
  relatedVideoIds: string[];
};

export type YtWatchMeta = {
  videoId: string;
  title: string;
  channel: string;
  durationSec: number;
  description: string;
  publishedAt: Date | null;
  musicCredits: YtMusicCredit[];
  /** Related / suggested / "other tracks" video ids from the watch page. */
  relatedVideos: YtRelatedVideo[];
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

function videoIdFromNode(node: Record<string, unknown>): string | null {
  if (typeof node.videoId === "string" && /^[\w-]{11}$/.test(node.videoId)) {
    return node.videoId;
  }
  const nav = node.navigationEndpoint as
    | {
        watchEndpoint?: { videoId?: string };
        commandMetadata?: { webCommandMetadata?: { url?: string } };
      }
    | undefined;
  const fromWatch = nav?.watchEndpoint?.videoId;
  if (fromWatch && /^[\w-]{11}$/.test(fromWatch)) return fromWatch;
  const url = nav?.commandMetadata?.webCommandMetadata?.url;
  if (url) {
    const id = extractVideoId(
      url.startsWith("http") ? url : `https://www.youtube.com${url}`,
    );
    if (id) return id;
  }
  if (typeof node.contentId === "string" && /^[\w-]{11}$/.test(node.contentId)) {
    return node.contentId;
  }
  return null;
}

function handleFromBrowseUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/youtube\.com\/(@[\w.-]+)/i) || url.match(/^\/(@[\w.-]+)/i);
  if (m) return m[1];
  const ch = url.match(/youtube\.com\/channel\/(UC[\w-]{20,})/i);
  if (ch) return ch[1];
  return null;
}

function channelFromRenderer(node: Record<string, unknown>): YtSimilarChannel | null {
  const title =
    textOf(node.title) ||
    (typeof node.name === "string" ? node.name : null) ||
    textOf((node as { headline?: unknown }).headline);
  const nav = node.navigationEndpoint as
    | {
        browseEndpoint?: { canonicalBaseUrl?: string; browseId?: string };
        commandMetadata?: { webCommandMetadata?: { url?: string } };
      }
    | undefined;
  const canon = nav?.browseEndpoint?.canonicalBaseUrl;
  const url = nav?.commandMetadata?.webCommandMetadata?.url;
  let handle =
    handleFromBrowseUrl(canon) ||
    handleFromBrowseUrl(url) ||
    (typeof nav?.browseEndpoint?.browseId === "string" &&
    /^UC[\w-]{20,}$/.test(nav.browseEndpoint.browseId)
      ? nav.browseEndpoint.browseId
      : null);
  if (!handle || !title) return null;
  if (!handle.startsWith("@") && !handle.startsWith("UC")) {
    handle = `@${handle.replace(/^@/, "")}`;
  }
  return { handle, name: title.trim(), shelf: "" };
}

/** Export for unit tests — walks watch/channel JSON for related video cards. */
export function collectRelatedVideos(
  root: unknown,
  shelfHint: string | null = null,
): YtRelatedVideo[] {
  const out: YtRelatedVideo[] = [];
  const seen = new Set<string>();

  const push = (
    videoId: string,
    title: string | null,
    channel: string | null,
    shelf: string | null,
  ) => {
    if (seen.has(videoId)) return;
    seen.add(videoId);
    out.push({
      videoId,
      title: (title || "").trim(),
      channel: channel?.trim() || null,
      shelf: shelf?.trim() || null,
    });
  };

  const walk = (obj: unknown, shelf: string | null): void => {
    if (!obj) return;
    if (Array.isArray(obj)) {
      for (const x of obj) walk(x, shelf);
      return;
    }
    if (typeof obj !== "object") return;
    const o = obj as Record<string, unknown>;

    // Shelf titles (Fans also like / Spotlight / Other tracks …)
    let nextShelf = shelf;
    const titleCandidate =
      textOf(o.title) ||
      textOf(o.header) ||
      (o.shelfHeaderRenderer
        ? textOf(
            (o.shelfHeaderRenderer as { title?: unknown }).title,
          )
        : null);
    if (titleCandidate && titleCandidate.length < 80) {
      const t = titleCandidate.trim();
      if (
        /fans?\s+also\s+like|you might also like|similar|spotlight|other tracks|mixes for you|suggested|recommended/i.test(
          t,
        )
      ) {
        nextShelf = t;
      }
    }

    const renderers = [
      o.compactVideoRenderer,
      o.videoRenderer,
      o.endScreenVideoRenderer,
      o.gridVideoRenderer,
      o.playlistVideoRenderer,
      o.lockupViewModel,
    ];
    for (const r of renderers) {
      if (!r || typeof r !== "object") continue;
      const node = r as Record<string, unknown>;
      const id = videoIdFromNode(node);
      if (!id) continue;
      const title =
        textOf(node.title) ||
        (typeof node.title === "string" ? node.title : null) ||
        textOf(node.metadata) ||
        null;
      const channel =
        textOf(node.shortBylineText) ||
        textOf(node.longBylineText) ||
        textOf(node.subtitle) ||
        null;
      push(id, title, channel, nextShelf ?? shelfHint);
    }

    for (const v of Object.values(o)) walk(v, nextShelf);
  };

  walk(root, shelfHint);
  return out;
}

/** Export for unit tests — channel / fans-also-like cards. */
export function collectSimilarChannels(root: unknown): YtSimilarChannel[] {
  const out: YtSimilarChannel[] = [];
  const seen = new Set<string>();

  const walk = (obj: unknown, shelf: string | null): void => {
    if (!obj) return;
    if (Array.isArray(obj)) {
      for (const x of obj) walk(x, shelf);
      return;
    }
    if (typeof obj !== "object") return;
    const o = obj as Record<string, unknown>;

    let nextShelf = shelf;
    const titleCandidate = textOf(o.title) || textOf(o.header);
    if (titleCandidate && titleCandidate.length < 80) {
      const t = titleCandidate.trim();
      if (
        /fans?\s+also\s+like|you might also like|similar|for you|spotlight/i.test(
          t,
        )
      ) {
        nextShelf = t;
      }
    }

    const renderers = [
      o.channelRenderer,
      o.gridChannelRenderer,
      o.compactChannelRenderer,
    ];
    for (const r of renderers) {
      if (!r || typeof r !== "object") continue;
      // Prefer channels under a relevant shelf; still keep a few featured ones.
      if (
        nextShelf ||
        (shelf && /fans?\s+also\s+like|similar|spotlight/i.test(shelf))
      ) {
        const ch = channelFromRenderer(r as Record<string, unknown>);
        if (!ch) continue;
        const key = ch.handle.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ ...ch, shelf: nextShelf || shelf || "similar" });
      }
    }

    for (const v of Object.values(o)) walk(v, nextShelf);
  };

  walk(root, null);
  return out;
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

  const relatedVideos = initial ? collectRelatedVideos(initial) : [];
  // Never treat the watch page itself as a related target.
  const relatedFiltered = relatedVideos.filter((r) => r.videoId !== videoId);

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
    relatedVideos: relatedFiltered,
    watchUrl,
  };
}

/**
 * Scrape a channel home page for Fans also like / Spotlight / similar shelves.
 */
export async function fetchChannelShelfDiscovery(
  handleOrUrl: string,
): Promise<YtChannelShelfDiscovery> {
  const base = channelBase(handleOrUrl);
  const html = await fetchChannelTabHtml(base);
  const initial = extractJsonAssign(html, "ytInitialData");
  if (!initial) {
    return { similarChannels: [], spotlightVideoIds: [], relatedVideoIds: [] };
  }

  const similarChannels = collectSimilarChannels(initial);
  const related = collectRelatedVideos(initial);
  const spotlightVideoIds = [
    ...new Set(
      related
        .filter((r) => r.shelf && /spotlight/i.test(r.shelf))
        .map((r) => r.videoId),
    ),
  ];
  // Also keep shelf videos tagged fans-also-like / other tracks as related seeds.
  const relatedVideoIds = [
    ...new Set(
      related
        .filter(
          (r) =>
            !r.shelf ||
            /fans?\s+also\s+like|other tracks|spotlight|suggested|recommended|mixes/i.test(
              r.shelf,
            ),
        )
        .map((r) => r.videoId),
    ),
  ];

  return { similarChannels, spotlightVideoIds, relatedVideoIds };
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
 * Video IDs from a public playlist (no API key).
 * Accepts a full playlist URL or bare `PL…` / `UU…` list id.
 */
export async function fetchPlaylistVideoIds(
  playlistIdOrUrl: string,
  limit = 40,
): Promise<string[]> {
  const raw = playlistIdOrUrl.trim();
  const id = raw.match(/[?&]list=([A-Za-z0-9_-]+)/)?.[1] || raw;
  if (!id || id.length < 10) return [];
  const url = `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`;
  const html = await fetchChannelTabHtml(url);
  const ids = [...html.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]!);
  return uniqueIds(ids, limit, new Set());
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
