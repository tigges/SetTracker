/**
 * First-party pages we can parse without a model (YouTube About,
 * SoundCloud profile, official www). LLM handle research should skip
 * these and leave them to catalog-yt-socials / catalog-sc-socials /
 * verify-urls.
 */

import { KNOWN_EVENTS } from "../events";
import {
  isArtistOwnedChannel,
  venueYoutubeHandles,
} from "./catalogYtSocials";

export type HostedSetUrl = {
  sourceUrl?: string | null;
  playbackUrl?: string | null;
  sourceName?: string | null;
};

function venueSoundcloudUsers(): Set<string> {
  const out = new Set<string>();
  for (const ev of Object.values(KNOWN_EVENTS)) {
    const sc = ev.soundcloud;
    if (!sc) continue;
    const m = sc.match(/soundcloud\.com\/([A-Za-z0-9_-]+)/i);
    if (m) out.add(m[1]!.toLowerCase());
  }
  return out;
}

function youtubeHandleFromUrl(url: string): string | null {
  const at = url.match(/youtube\.com\/@([A-Za-z0-9._-]+)/i);
  if (at) return at[1]!.toLowerCase();
  const named = url.match(
    /youtube\.com\/(?:c|channel|user)\/([A-Za-z0-9._-]+)/i,
  );
  return named ? named[1]!.toLowerCase() : null;
}

function soundcloudUserFromUrl(url: string): string | null {
  const m = url.match(/soundcloud\.com\/([A-Za-z0-9_-]+)/i);
  if (!m) return null;
  const user = m[1]!.toLowerCase();
  if (["you", "discover", "pages", "sets", "search", "tracks"].includes(user)) {
    return null;
  }
  return user;
}

/** Artist-owned YT/SC on a set — parsers can read that profile. */
export function hasParseableFirstPartyHost(
  djName: string,
  djSlug: string,
  sets: HostedSetUrl[],
): boolean {
  const venues = venueYoutubeHandles();
  const scVenues = venueSoundcloudUsers();
  for (const s of sets) {
    const hay = [s.sourceUrl, s.playbackUrl, s.sourceName]
      .filter(Boolean)
      .join(" ");
    if (!hay) continue;

    const yt = youtubeHandleFromUrl(hay);
    if (yt) {
      const handle = yt.startsWith("@") ? yt : `@${yt}`;
      if (!venues.has(handle) && !venues.has(`@${yt}`)) {
        if (
          isArtistOwnedChannel({
            djName,
            djSlug,
            channelName: yt,
            channelHandle: handle,
          })
        ) {
          return true;
        }
      }
    }

    const sc = soundcloudUserFromUrl(hay);
    if (sc && !scVenues.has(sc)) {
      if (
        isArtistOwnedChannel({
          djName,
          djSlug,
          channelName: sc,
          channelHandle: sc,
        })
      ) {
        return true;
      }
    }
  }
  return false;
}

/** Official www or SC already on file — scrape that, do not Search. */
export function eventHasParseableFirstParty(e: {
  website?: string | null;
  soundcloud?: string | null;
}): boolean {
  return Boolean(e.website?.trim() || e.soundcloud?.trim());
}
