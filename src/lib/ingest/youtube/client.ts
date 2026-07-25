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
  let description = String(details.shortDescription || "");

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
