/**
 * "Is this capture already wired?" lookup.
 *
 * Resolves a pasted 1001 / YouTube / SoundCloud URL (or a raw slug) to the set
 * slug we would wire it to, then reports what is already on file. Reads
 * committed data only — no network, no DB — so it is safe to run before any
 * capture work starts.
 */
import { soundcloudSlugFromUrl } from "./setHostUrls";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";
import { youtubeVideoId } from "../thumbs/youtubeThumb";

export type CaptureArchiveRow = {
  label?: string;
  slug?: string;
  name?: string;
  tracklistUrl?: string;
  youtubeUrl?: string;
  soundcloudUrl?: string;
  note?: string;
};

export type CaptureLookup = {
  input: string;
  /** Slug we resolved the input to, when the input identifies a host. */
  slug: string | null;
  /** How the slug was derived, for the operator to sanity-check. */
  how: string;
  /** 1001 tracklist id when the input was a 1001 URL. */
  tracklistId: string | null;
  wiredCues: number | null;
  /** Other slugs sharing the same seed array (host twins). */
  twins: string[];
  archive: CaptureArchiveRow[];
  alreadyOnFile: boolean;
};

/**
 * 1001 tracklist ids are the stable part of the URL; the trailing name slug
 * drifts when 1001 re-titles a page, so compare on the id alone.
 */
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
    const slug = soundcloudSlugFromUrl(arg.split("?")[0]!);
    return slug
      ? { slug, how: "SoundCloud permalink" }
      : { slug: null, how: "SoundCloud URL, but no slug could be derived" };
  }
  return { slug: null, how: "not a slug or a known host URL" };
}

export function lookupCapture(
  input: string,
  archive: CaptureArchiveRow[],
  map: Record<string, unknown[] | undefined> = TRACKLIST_1001_BY_SOURCE_SLUG,
): CaptureLookup {
  const tlId = tracklistId(input);
  if (tlId) {
    const hits = archive.filter(
      (r) => r.tracklistUrl && tracklistId(r.tracklistUrl) === tlId,
    );
    const slug = hits[0]?.slug ?? null;
    const rows = slug ? map[slug] : undefined;
    return {
      input,
      slug,
      how: "1001 tracklist id",
      tracklistId: tlId,
      wiredCues: rows ? rows.length : null,
      twins: [],
      archive: hits,
      alreadyOnFile: hits.length > 0,
    };
  }

  const { slug, how } = resolveCaptureSlug(input);
  const rows = slug ? map[slug] : undefined;
  const twins = rows
    ? Object.entries(map)
        .filter(([s, r]) => r === rows && s !== slug)
        .map(([s]) => s)
    : [];
  const hits = slug
    ? archive.filter(
        (r) =>
          r.slug === slug ||
          (r.youtubeUrl && resolveCaptureSlug(r.youtubeUrl).slug === slug) ||
          (r.soundcloudUrl &&
            resolveCaptureSlug(r.soundcloudUrl).slug === slug),
      )
    : [];
  return {
    input,
    slug,
    how,
    tracklistId: null,
    wiredCues: rows ? rows.length : null,
    twins,
    archive: hits,
    alreadyOnFile: Boolean(rows),
  };
}

export function formatCaptureLookup(r: CaptureLookup): string {
  const out: string[] = [r.input];
  if (r.tracklistId) {
    if (!r.archive.length) {
      out.push(
        `  1001 id ${r.tracklistId}: not in the URL archive — looks new`,
      );
      return out.join("\n");
    }
    out.push(`  1001 id ${r.tracklistId}: ALREADY ON FILE`);
    for (const h of r.archive) {
      out.push(`    label : ${h.label ?? "(none)"}`);
      out.push(`    slug  : ${h.slug ?? "(none)"}`);
      out.push(`    seed  : ${h.name ?? "(none)"}`);
      out.push(
        `    cues  : ${
          r.wiredCues === null
            ? "no seed wired to that slug"
            : `${r.wiredCues} wired`
        }`,
      );
      if (h.note) out.push(`    note  : ${h.note}`);
    }
    return out.join("\n");
  }

  if (!r.slug) {
    out.push(`  cannot resolve a slug (${r.how})`);
    return out.join("\n");
  }
  out.push(`  slug   : ${r.slug}  (${r.how})`);
  out.push(
    r.wiredCues === null
      ? "  wired  : NO — nothing wired to this slug yet"
      : `  wired  : YES — ${r.wiredCues} cues already wired`,
  );
  if (r.twins.length) out.push(`  twins  : ${r.twins.join(", ")}`);
  for (const h of r.archive) {
    out.push(`  archive: ${h.label ?? "(no label)"} — ${h.name ?? "?"}`);
    if (h.tracklistUrl) out.push(`  1001   : ${h.tracklistUrl}`);
    if (h.note) out.push(`  note   : ${h.note}`);
  }
  return out.join("\n");
}
