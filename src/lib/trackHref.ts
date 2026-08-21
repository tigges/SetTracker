import { canonicalBeatportUrl } from "@/lib/trackMeta";

export type TrackPublicHref =
  | { kind: "page"; href: string }
  | { kind: "beatport"; href: string }
  | { kind: "none" };

/**
 * On-site /tracks/{slug} only when that page is in the static export
 * (top ~400 by plays). Otherwise a confirmed Beatport /track URL, or
 * no link — never a search URL, never a 404.
 */
export function trackPublicHref(
  slug: string | null | undefined,
  opts?: {
    exportedSlugs?: ReadonlySet<string> | readonly string[] | null;
    beatportUrl?: string | null;
  },
): TrackPublicHref {
  const exported = opts?.exportedSlugs;
  const set =
    exported instanceof Set
      ? exported
      : exported
        ? new Set(exported)
        : null;
  if (slug && set?.has(slug)) {
    return { kind: "page", href: `/tracks/${slug}` };
  }
  const beatport = canonicalBeatportUrl(opts?.beatportUrl);
  if (beatport) return { kind: "beatport", href: beatport };
  return { kind: "none" };
}

export function exportedTrackSlugSet(
  slugs: readonly string[],
): ReadonlySet<string> {
  return new Set(slugs);
}
