/**
 * Unified venue ↔ YouTube channel map.
 * Channel poll config lives in youtube/venues; Event canon in events.KNOWN_EVENTS.
 * This module is the join table for docs + tooling.
 */

import { KNOWN_EVENTS, type CanonicalEvent } from "./events";
import { YOUTUBE_VENUES, type YoutubeVenueChannel } from "./youtube/venues";

export type VenueChannelLink = {
  channel: YoutubeVenueChannel;
  event: CanonicalEvent | null;
};

export function venueChannelLinks(): VenueChannelLink[] {
  return YOUTUBE_VENUES.map((channel) => ({
    channel,
    event: channel.eventSlug ? KNOWN_EVENTS[channel.eventSlug] ?? null : null,
  }));
}

/** Event slugs that have a configured YouTube venue channel. */
export function eventSlugsWithChannels(): string[] {
  return [
    ...new Set(
      YOUTUBE_VENUES.map((v) => v.eventSlug).filter(
        (s): s is string => typeof s === "string" && s.length > 0,
      ),
    ),
  ];
}
