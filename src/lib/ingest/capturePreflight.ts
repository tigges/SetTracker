/**
 * Client-safe capture preflight. The slim index is built on the server
 * (wired slug → cue count, 1001 id → slug). The browser never loads the
 * full 1001 seed map.
 */

import { soundcloudPageUrl } from "../playback";
import { youtubeVideoId } from "../thumbs/youtubeThumb";
import { slugify } from "./types";

export type CapturePreflightIndex = {
  wiredCuesBySlug: Record<string, number>;
  slugByTracklistId: Record<string, string>;
};

export type CapturePreflightKind = "wired" | "mismatch" | "new" | "unknown";

export type CapturePreflightResult = {
  kind: CapturePreflightKind;
  slug: string | null;
  cues: number | null;
  message: string;
};

/** 1001 tracklist ids are the stable part of the URL. */
export function tracklistId(url: string): string | null {
  if (!/1001tracklists\.com/i.test(url)) return null;
  return url.match(/\/tracklist\/([a-z0-9]+)\//i)?.[1]?.toLowerCase() ?? null;
}

export function resolveCaptureSlug(input: string): {
  slug: string | null;
  how: string;
} {
  const arg = input.trim();
  if (/^(yt|sc)-/.test(arg)) return { slug: arg, how: "given as a slug" };
  if (/^[a-zA-Z0-9_-]{11}$/.test(arg) && !arg.includes("."))
    return { slug: `yt-${arg}`, how: "bare YouTube video id" };
  if (/youtube\.com|youtu\.be/i.test(arg)) {
    const id = youtubeVideoId(arg);
    return id
      ? { slug: `yt-${id}`, how: "YouTube URL" }
      : { slug: null, how: "YouTube URL, but no video id in it" };
  }
  if (/soundcloud\.com/i.test(arg)) {
    const page = soundcloudPageUrl(arg.split("?")[0]!);
    if (!page) {
      return { slug: null, how: "SoundCloud URL, but no slug could be derived" };
    }
    try {
      const u = new URL(page);
      const [user, permalink] = u.pathname.split("/").filter(Boolean);
      if (!user || !permalink) {
        return {
          slug: null,
          how: "SoundCloud URL, but no slug could be derived",
        };
      }
      return {
        slug: `sc-${user}-${slugify(permalink)}`.slice(0, 120),
        how: "SoundCloud permalink",
      };
    } catch {
      return { slug: null, how: "SoundCloud URL, but no slug could be derived" };
    }
  }
  return { slug: null, how: "not a slug or a known host URL" };
}

export function buildCapturePreflightIndex(
  map: Record<string, unknown[] | undefined>,
  archive: Array<{ slug?: string; tracklistUrl?: string }>,
): CapturePreflightIndex {
  const wiredCuesBySlug: Record<string, number> = {};
  for (const [slug, rows] of Object.entries(map)) {
    if (rows?.length) wiredCuesBySlug[slug] = rows.length;
  }
  const slugByTracklistId: Record<string, string> = {};
  for (const row of archive) {
    const id = row.tracklistUrl ? tracklistId(row.tracklistUrl) : null;
    if (id && row.slug) slugByTracklistId[id] = row.slug;
  }
  return { wiredCuesBySlug, slugByTracklistId };
}

export function formatCapturePreflight(
  input: string,
  index: CapturePreflightIndex,
): CapturePreflightResult {
  const raw = input.trim();
  if (!raw) {
    return { kind: "unknown", slug: null, cues: null, message: "" };
  }
  const tl = tracklistId(raw);
  if (tl) {
    const slug = index.slugByTracklistId[tl] ?? null;
    if (!slug) {
      return {
        kind: "new",
        slug: null,
        cues: null,
        message: "Looks new — this 1001 id is not on file.",
      };
    }
    const cues = index.wiredCuesBySlug[slug] ?? null;
    if (cues != null) {
      return {
        kind: "wired",
        slug,
        cues,
        message: `Already wired to ${slug} (${cues} cues) — skip this paste.`,
      };
    }
    return {
      kind: "mismatch",
      slug,
      cues: null,
      message: `1001 page is on file as ${slug}, but that slug has no seed yet.`,
    };
  }

  const { slug, how } = resolveCaptureSlug(raw);
  if (!slug) {
    return {
      kind: "unknown",
      slug: null,
      cues: null,
      message: `Cannot resolve a slug (${how}).`,
    };
  }
  const cues = index.wiredCuesBySlug[slug] ?? null;
  if (cues != null) {
    return {
      kind: "wired",
      slug,
      cues,
      message: `Already wired to ${slug} (${cues} cues) — skip this paste.`,
    };
  }
  return {
    kind: "new",
    slug,
    cues: null,
    message: `${slug} is not wired yet.`,
  };
}

export function formatCaptureRowPreflight(
  slug: string,
  opts: { watchUrl?: string; tracklistUrl?: string },
  index: CapturePreflightIndex,
): CapturePreflightResult | null {
  const cues = index.wiredCuesBySlug[slug];
  if (cues != null) {
    return {
      kind: "wired",
      slug,
      cues,
      message: `Already wired (${cues} cues).`,
    };
  }
  if (opts.tracklistUrl) {
    const id = tracklistId(opts.tracklistUrl);
    const other = id ? index.slugByTracklistId[id] : null;
    if (other && other !== slug) {
      const otherCues = index.wiredCuesBySlug[other] ?? null;
      return {
        kind: "mismatch",
        slug: other,
        cues: otherCues,
        message: `This 1001 page is already on file as ${other}${
          otherCues != null ? ` (${otherCues} cues)` : ""
        }.`,
      };
    }
  }
  if (opts.watchUrl) {
    const resolved = resolveCaptureSlug(opts.watchUrl).slug;
    if (resolved && resolved !== slug && index.wiredCuesBySlug[resolved] != null) {
      const otherCues = index.wiredCuesBySlug[resolved]!;
      return {
        kind: "mismatch",
        slug: resolved,
        cues: otherCues,
        message: `Playback is already wired as ${resolved} (${otherCues} cues).`,
      };
    }
  }
  return null;
}
