/**
 * File-side wishlist map: roster channels + entity-complete pins.
 * No network, no DB. Used by `npm run wishlist:audit`.
 *
 * Capture 1001 / Identify priorities are not scored here.
 */

import { loadEntityCompletePins } from "./ingest/entityCompletePins";
import { ARTIST_ROSTER_CURATED } from "./ingest/roster";
import { slugify } from "./ingest/types";
import { WISHLIST_DEFAULTS, type WishlistEntry } from "./wishlist";

export type WishlistFileGap =
  | "no-roster"
  | "no-roster-youtube"
  | "no-roster-soundcloud"
  | "no-entity-pin"
  | "no-pin-thumb"
  | "no-pin-handle";

export type WishlistFileRow = {
  slug: string;
  name: string;
  roster: boolean;
  youtube: string | null;
  soundcloud: string | null;
  pin: boolean;
  pinThumb: boolean;
  pinHandle: boolean;
  gaps: WishlistFileGap[];
};

function pinHasHandle(pin: {
  website?: string;
  instagram?: string;
  youtube?: string;
  soundcloud?: string;
  twitter?: string;
}): boolean {
  return Boolean(
    pin.website ||
      pin.instagram ||
      pin.youtube ||
      pin.soundcloud ||
      pin.twitter,
  );
}

export function wishlistFileCoverage(
  defaults: readonly WishlistEntry[] = WISHLIST_DEFAULTS,
): WishlistFileRow[] {
  const rosterBySlug = new Map(
    ARTIST_ROSTER_CURATED.map((a) => [slugify(a.name), a]),
  );
  const pinBySlug = new Map(
    loadEntityCompletePins()
      .filter((p) => p.kind === "dj")
      .map((p) => [p.slug, p]),
  );

  return defaults.map((entry) => {
    const roster = rosterBySlug.get(entry.slug);
    const pin = pinBySlug.get(entry.slug);
    const youtube = roster?.youtube?.handle?.trim() || null;
    const soundcloud = roster?.soundcloud?.permalink?.trim() || null;
    const ytOk = Boolean(youtube && roster?.youtube?.status !== "missing");
    const scOk = Boolean(soundcloud && roster?.soundcloud?.status !== "missing");
    const gaps: WishlistFileGap[] = [];
    if (!roster) gaps.push("no-roster");
    else {
      if (!ytOk) gaps.push("no-roster-youtube");
      if (!scOk) gaps.push("no-roster-soundcloud");
    }
    if (!pin) gaps.push("no-entity-pin");
    else {
      if (!pin.imageUrl?.trim()) gaps.push("no-pin-thumb");
      if (!pinHasHandle(pin)) gaps.push("no-pin-handle");
    }
    return {
      slug: entry.slug,
      name: entry.name,
      roster: Boolean(roster),
      youtube: ytOk ? youtube : null,
      soundcloud: scOk ? soundcloud : null,
      pin: Boolean(pin),
      pinThumb: Boolean(pin?.imageUrl?.trim()),
      pinHandle: pin ? pinHasHandle(pin) : false,
      gaps,
    };
  });
}
