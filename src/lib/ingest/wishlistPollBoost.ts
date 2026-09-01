/**
 * One-run poll-depth bump for default wishlist roster names.
 *
 * WISHLIST_POLL_BOOST=1 on that process only. Default ingest / Capture
 * 1001 / Identify ranking stay unchanged. Does not invent channels —
 * the artist must already be on ARTIST_ROSTER with a handle.
 */

import { wishlistDefaultSlugSet } from "../wishlist";
import { slugify } from "./types";

export function wishlistPollBoostOn(
  env: NodeJS.Dict<string | undefined> = process.env,
): boolean {
  return env.WISHLIST_POLL_BOOST === "1";
}

export function isWishlistRosterName(name: string): boolean {
  return wishlistDefaultSlugSet().has(slugify(name));
}

export function boostedYoutubeArtistLimit(opts: {
  priority?: "high" | "normal";
  name: string;
  defaultLimit: number;
  highLimit: number;
  env?: NodeJS.Dict<string | undefined>;
}): number {
  if (opts.priority === "high") return opts.highLimit;
  if (
    wishlistPollBoostOn(opts.env) &&
    isWishlistRosterName(opts.name)
  ) {
    return opts.highLimit;
  }
  return opts.defaultLimit;
}

export function boostedSoundcloudArtistLimit(opts: {
  priority?: "high" | "normal";
  name: string;
  deepLimit: number;
  env?: NodeJS.Dict<string | undefined>;
}): number {
  const high =
    opts.priority === "high" ||
    (wishlistPollBoostOn(opts.env) && isWishlistRosterName(opts.name));
  return high ? opts.deepLimit : Math.min(opts.deepLimit, 40);
}
