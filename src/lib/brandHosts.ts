/**
 * Media brands / promoters that host sets but are not DJ artists.
 * Prefer Series + Event attribution; never treat these as browseable Dj profiles.
 */

export const BRAND_HOST_SLUGS = new Set([
  "insomniac",
  "defected-tv",
  "defected",
  "boiler-room",
  "mixmag",
  "dj-mag",
  "djmag",
]);

/** Recurring shows owned by a media brand — never attach Series.djId. */
export const BRAND_SERIES_SLUGS = new Set([
  "night-owl-radio",
  "metronome",
  "insomniac-mixes",
]);

export function isBrandSeriesSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return BRAND_SERIES_SLUGS.has(slug.trim().toLowerCase());
}

const BRAND_HOST_NAMES = new Set([
  "insomniac",
  "defected tv",
  "defected",
  "boiler room",
  "mixmag",
  "dj mag",
  "djmag",
]);

export function isBrandHostSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return BRAND_HOST_SLUGS.has(slug.trim().toLowerCase());
}

export function isBrandHostName(name: string | null | undefined): boolean {
  if (!name) return false;
  return BRAND_HOST_NAMES.has(name.trim().toLowerCase());
}

/** True when a RawArtist / Dj row is a brand host, not a performing artist. */
export function isBrandHostArtist(a: {
  slug?: string | null;
  name?: string | null;
}): boolean {
  return isBrandHostSlug(a.slug) || isBrandHostName(a.name);
}

/**
 * Card / feed headline: real DJ (+ b2b), else series, else event.
 * Brand-host primaries are ignored so Night Owl mega-mixes read as series content.
 */
export function setHostHeadline(s: {
  title?: string | null;
  primaryDj?: { name: string; slug: string } | null;
  collaborators?: { name: string }[];
  seriesName?: string | null;
  eventName?: string | null;
}): string {
  const primary = s.primaryDj;
  if (primary && !isBrandHostSlug(primary.slug)) {
    const b2b =
      s.collaborators && s.collaborators.length > 0
        ? ` b2b ${s.collaborators.map((c) => c.name).join(", ")}`
        : "";
    return `${primary.name}${b2b}`;
  }
  return (
    s.seriesName?.trim() ||
    s.eventName?.trim() ||
    (primary && isBrandHostSlug(primary.slug) ? primary.name : null) ||
    s.title?.trim() ||
    "Unknown"
  );
}
