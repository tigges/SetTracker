/**
 * Insomniac Night Owl Radio adapter.
 *
 * Tracklists: Insomniac.com music pages (`Artist "Title"` accordion).
 * Audio: SoundCloud embed on those pages (original host) → playbackUrl.
 *
 * Discovery prefers the Insomniac NOR listing (pages that actually publish
 * tracklists). SoundCloud @insomniacevents fills duration / newer slugs when
 * the matching Insomniac page exists.
 */

import { splitArtistCredit } from "../artists";
import { hashRawSetContent } from "../hash";
import {
  resolveUser,
  scGet,
  sleep,
  type ScCollection,
  type ScTrack,
} from "../soundcloud/client";
import {
  mergeTracklistSignals,
  parseDescriptionTracklist,
} from "../soundcloud/parseTracklist";
import { slugify, type RawArtist, type RawSet, type SourceAdapter } from "../types";
import { parseInsomniacTrackRows, rowsToPlays } from "./parseTracklist";

const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; insomniac-nor)";
const LISTING = "https://www.insomniac.com/music/night-owl-radio/";
const LOAD_MORE = "https://www.insomniac.com/wp-admin/admin-ajax.php";
const SC_USER = "insomniacevents";
const ACCENT = "#e10600";

/** Max NOR sets per ingest run (Pages build budget). */
export function norMax(): number {
  return Math.max(1, Number(process.env.INSOMNIAC_NOR_MAX || 40));
}
/** How many Load More pages to pull beyond the first listing (~24 eps each). */
export function norListPages(): number {
  return Math.max(1, Number(process.env.INSOMNIAC_NOR_LIST_PAGES || 6));
}

/**
 * High-signal episodes to always try first (mega-mixes / dense tracklists).
 * Full Insomniac archive is much larger — listing pagination fills the rest.
 */
export const INSOMNIAC_NOR_PRIORITY_SLUGS = [
  "night-owl-radio-482-ft-dreamstate-socal-2024-mega-mix",
  "night-owl-radio-475-ft-loofy-and-d-o-d",
  "night-owl-radio-470-ft-nocturnal-wonderland-2024-mega-mix",
  "night-owl-radio-481-ft-countdown-nye-2024-mega-mix",
  "night-owl-radio-469-ft-escape-halloween-2024-mega-mix",
  "night-owl-radio-464-ft-hard-summer-2024-mega-mix",
];

function durationSecOf(track: ScTrack): number {
  const ms = track.full_duration || track.duration || 0;
  return Math.max(0, Math.round(ms / 1000));
}

function isNightOwlTrack(track: ScTrack): boolean {
  const perm = track.permalink || "";
  const title = track.title || "";
  return /night-owl-radio/i.test(perm) || /night\s*owl\s*radio/i.test(title);
}

function insomniacPageUrl(slug: string): string {
  return `https://www.insomniac.com/music/${slug.replace(/\/$/, "")}/`;
}

function guestsFromTitle(title: string): {
  primary: RawArtist;
  collaborators: RawArtist[];
} {
  const ft = title.match(/\bft\.?\s+(.+)$/i)?.[1]?.trim();
  if (!ft) {
    return {
      primary: { name: "INSOMNIAC", slug: "insomniac", accent: ACCENT },
      collaborators: [],
    };
  }
  // NOR usually bills "A and B" as two guests; keep "&" inside duo names.
  const parts = ft
    .split(/\s+and\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    const primary = {
      name: parts[0]!,
      slug: slugify(parts[0]!),
      accent: ACCENT,
    };
    const collaborators = parts.slice(1).map((name) => ({
      name,
      slug: slugify(name),
      accent: ACCENT,
    }));
    return { primary, collaborators };
  }
  return splitArtistCredit(parts[0] || ft, { accent: ACCENT });
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        // Keep Accept minimal — richer Accept negotiation can serve a cached
        // HTML variant whose embedded WP nonce fails admin-ajax checks.
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

function slugsFromListingHtml(html: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(
    /\/music\/(night-owl-radio-\d+[a-z0-9\-]*)\/?/gi,
  )) {
    const slug = m[1]!.toLowerCase().replace(/\/$/, "");
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

function listingNonce(html: string): string | null {
  // Prefer insmMainVars.nonce — other plugins also embed "nonce" keys that 400 ajax.
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

function listingOffset(html: string): number {
  const btn = html.match(
    /class="[^"]*post-load-more-button[\s\S]*?<\/a>/i,
  )?.[0];
  const n = Number(btn?.match(/data-offset=["'](\d+)["']/i)?.[1] ?? 24);
  return Number.isFinite(n) && n > 0 ? n : 24;
}

/** Paginate Insomniac NOR archive via the public "Load More" admin-ajax action. */
async function fetchListingSlugs(): Promise<string[]> {
  const first = await fetchHtml(LISTING);
  if (!first) return [];
  const out = slugsFromListingHtml(first);
  const seen = new Set(out);
  const nonce = listingNonce(first);
  let offset = listingOffset(first);
  const maxPages = norListPages();

  if (!nonce || maxPages <= 1) return out;

  for (let page = 1; page < maxPages; page += 1) {
    try {
      const body = new URLSearchParams({
        action: "insm_get_load_more_content",
        nonce,
        post_type: "music",
        offset: String(offset),
        taxonomy: "music-section",
        term: "night-owl-radio",
      });
      const res = await fetch(LOAD_MORE, {
        method: "POST",
        headers: {
          "User-Agent": UA,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json, text/javascript, */*",
          "X-Requested-With": "XMLHttpRequest",
          Referer: LISTING,
        },
        body,
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) {
        console.warn(
          `[insomniac-nor] listing page ${page + 1}: HTTP ${res.status}`,
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
          `[insomniac-nor] listing page ${page + 1}: non-JSON ${rawText.slice(0, 80)}`,
        );
        break;
      }
      if (json.success !== true) {
        console.warn(
          `[insomniac-nor] listing page ${page + 1}: ajax rejected ${rawText.slice(0, 120)}`,
        );
        break;
      }
      const content =
        typeof json.data === "object" && json.data && "content" in json.data
          ? json.data.content || ""
          : "";
      const batch = slugsFromListingHtml(content);
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
        `[insomniac-nor] listing page ${page + 1}: +${added} content=${content.length} (total ${out.length})`,
      );
      if (added === 0 || total === 0) break;
      await sleep(150);
    } catch (err) {
      console.warn(
        `[insomniac-nor] listing page ${page + 1}:`,
        err instanceof Error ? err.message : err,
      );
      break;
    }
  }
  return out;
}

function soundcloudPermalinkFromHtml(html: string): string | null {
  const m =
    html.match(
      /soundcloud\.com\/insomniacevents\/(night-owl-radio-[a-z0-9\-]+)/i,
    ) ||
    html.match(
      /api\.soundcloud\.com\/tracks\/(\d+)/i,
    );
  if (!m) return null;
  if (m[0].includes("tracks/")) return null; // id-only; handle separately
  return m[1]!.toLowerCase();
}

function soundcloudTrackIdFromHtml(html: string): number | null {
  const m = html.match(/api\.soundcloud\.com\/tracks\/(\d+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function titleFromHtml(html: string, fallbackSlug: string): string {
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

function publishedAtFromHtml(html: string): Date | null {
  const m =
    html.match(
      /property=["']article:published_time["']\s+content=["']([^"']+)["']/i,
    ) || html.match(/datetime=["']([^"']+)["']/i);
  if (!m?.[1]) return null;
  const d = new Date(m[1]);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function fetchNorSoundCloudTracks(need: number): Promise<ScTrack[]> {
  const user = await resolveUser(SC_USER);
  if (!user.id) throw new Error("insomniacevents user id missing");
  const out: ScTrack[] = [];
  let path: string | null =
    `/users/${user.id}/tracks?limit=50&linked_partitioning=1`;
  let pages = 0;
  while (path && out.length < need && pages < 8) {
    pages += 1;
    const data: ScCollection<ScTrack> =
      await scGet<ScCollection<ScTrack>>(path);
    for (const t of data.collection ?? []) {
      if (isNightOwlTrack(t)) out.push(t);
    }
    path = data.next_href ?? null;
    if (path) await sleep(120);
  }
  return out;
}

async function resolveScTrack(
  permalink: string | null,
  trackId: number | null,
  cache: Map<string, ScTrack>,
): Promise<ScTrack | null> {
  if (permalink && cache.has(permalink)) return cache.get(permalink)!;
  try {
    if (permalink) {
      const url = `https://soundcloud.com/${SC_USER}/${permalink}`;
      const track = await scGet<ScTrack>(
        `/resolve?url=${encodeURIComponent(url)}`,
      );
      if (track.permalink) cache.set(track.permalink.toLowerCase(), track);
      await sleep(100);
      return track;
    }
    if (trackId != null) {
      const track = await scGet<ScTrack>(`/tracks/${trackId}`);
      if (track.permalink) cache.set(track.permalink.toLowerCase(), track);
      await sleep(100);
      return track;
    }
  } catch {
    return null;
  }
  return null;
}

async function episodeToRawSet(
  slug: string,
  scCache: Map<string, ScTrack>,
): Promise<RawSet | null> {
  const sourceUrl = insomniacPageUrl(slug);
  const html = await fetchHtml(sourceUrl);
  await sleep(150);
  if (!html) return null;

  const rows = parseInsomniacTrackRows(html);
  if (rows.length < 3) return null;

  const scPermalink =
    soundcloudPermalinkFromHtml(html) ||
    (scCache.has(slug) ? slug : null);
  const scId = soundcloudTrackIdFromHtml(html);
  const scTrack = await resolveScTrack(scPermalink, scId, scCache);

  const durationSec = scTrack
    ? durationSecOf(scTrack)
    : Math.max(60 * 60, rows.length * 150);
  if (durationSec < 20 * 60) return null;

  let plays = rowsToPlays(rows, durationSec);
  if (scTrack?.description && plays.length < 5) {
    plays = mergeTracklistSignals(
      plays,
      parseDescriptionTracklist(scTrack.description, durationSec, "soundcloud"),
    );
  }

  const title = (scTrack?.title || titleFromHtml(html, slug)).trim();
  const { primary, collaborators } = guestsFromTitle(title);
  const playbackUrl =
    scTrack?.permalink_url ||
    (scPermalink
      ? `https://soundcloud.com/${SC_USER}/${scPermalink}`
      : scId != null
        ? `https://api.soundcloud.com/tracks/${scId}`
        : undefined);
  if (!playbackUrl) return null;

  const publishedAt =
    (scTrack?.display_date || scTrack?.created_at
      ? new Date(scTrack.display_date || scTrack.created_at || "")
      : null) ||
    publishedAtFromHtml(html) ||
    new Date();

  const raw: RawSet = {
    sourceSlug: `nor-${slug}`.slice(0, 120),
    title,
    type: "radio",
    genre: /\b(trance|dreamstate)\b/i.test(title)
      ? "Trance"
      : /\b(bass|dubstep|riddim)\b/i.test(title)
        ? "Bass House"
        : "House",
    primaryArtist: { ...primary, accent: primary.accent || ACCENT },
    collaborators,
    seriesName: "Night Owl Radio",
    eventName: "Insomniac",
    eventKind: "festival",
    eventLocation: "Los Angeles, US",
    publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
    durationSec,
    sourceName: "Insomniac",
    sourceUrl,
    playbackUrl,
    cover: ACCENT,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

export function createInsomniacNorAdapter(): SourceAdapter {
  return {
    id: "insomniac-nor",
    label: "Insomniac Night Owl Radio",
    async fetchRecent(): Promise<RawSet[]> {
      const need = norMax();
      console.log(`[insomniac-nor] poll listing + SC @${SC_USER} (max ${need})`);

      const listingSlugs = await fetchListingSlugs();
      const scTracks = await fetchNorSoundCloudTracks(Math.max(need * 3, 80));
      const scCache = new Map<string, ScTrack>();
      for (const t of scTracks) {
        if (t.permalink) scCache.set(t.permalink.toLowerCase(), t);
      }

      // Priority mega-mix / dense episodes first, then listing, then SC fallbacks.
      const ordered: string[] = [];
      const seen = new Set<string>();
      for (const s of INSOMNIAC_NOR_PRIORITY_SLUGS) {
        if (seen.has(s)) continue;
        seen.add(s);
        ordered.push(s);
      }
      for (const s of listingSlugs) {
        if (seen.has(s)) continue;
        seen.add(s);
        ordered.push(s);
      }
      for (const t of scTracks) {
        const s = t.permalink?.toLowerCase();
        if (!s || seen.has(s)) continue;
        seen.add(s);
        ordered.push(s);
      }

      console.log(
        `[insomniac-nor] listing=${listingSlugs.length} scNor=${scTracks.length} queue=${ordered.length}`,
      );

      const out: RawSet[] = [];
      for (const slug of ordered) {
        if (out.length >= need) break;
        try {
          const raw = await episodeToRawSet(slug, scCache);
          if (!raw) {
            console.log(`[insomniac-nor] skip ${slug}: no Insomniac tracklist`);
            continue;
          }
          out.push(raw);
          console.log(
            `[insomniac-nor] + ${raw.sourceSlug} (${raw.plays.length} plays, ${raw.durationSec}s)`,
          );
        } catch (err) {
          console.warn(
            `[insomniac-nor] skip ${slug}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
      return out;
    },
  };
}

export const insomniacNorAdapter = createInsomniacNorAdapter();
