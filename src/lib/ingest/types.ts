import type { IdStatus, Provenance } from "../status";

// Normalized shapes that every source adapter must emit. The ingest step maps
// these onto the Prisma schema with idempotent upserts.

export type RawArtist = {
  name: string;
  slug: string;
  accent?: string;
  homeCity?: string;
  bio?: string;
  /** Source-native portrait (SoundCloud / hearthis avatar), when known. */
  imageUrl?: string;
  /**
   * Social / hub URLs harvested from the set or profile description
   * (plain-text "YouTube: @x", bare youtube.com/@x, etc.). Ingest fill-nulls
   * Dj.youtube / IG / X / website from these — never overwrites pins.
   */
  socialLinks?: string[];
  /** Optional @handle when already resolved from description links. */
  youtubeHandle?: string;
};

export type RawPlay = {
  position: number;
  timestamp: number; // seconds from set start
  idStatus: IdStatus;
  provenance: Provenance;
  // identified / community_resolved carry a real track:
  trackTitle?: string;
  artistName?: string;
  label?: string; // label display name
  bpm?: number;
  musicalKey?: string;
  genre?: string;
  durationSec?: number;
  /** Mix / version label when known upstream (else parsed from title). */
  mixName?: string;
  remixerName?: string;
  /** Canonical Beatport URL only — never a search page. */
  beatportUrl?: string;
  // unresolved id:
  idLabel?: string; // e.g. "AC Slater - ID"
  suspectedArtist?: string;
  note?: string;
  // unparsed:
  rawText?: string;
};

export type RawSet = {
  sourceSlug: string; // stable id from the source → becomes set.slug
  title: string;
  type: "radio" | "festival" | "soundcloud";
  genre?: string;
  primaryArtist: RawArtist;
  collaborators?: RawArtist[];
  eventName?: string;
  eventKind?: string;
  eventLocation?: string;
  seriesName?: string;
  publishedAt: Date;
  durationSec: number;
  sourceName: string;
  sourceUrl?: string;
  /**
   * Original audio host URL for on-site embed.
   * SoundCloud/YouTube: usually same as sourceUrl.
   * hearthis: prefer app.hearthis.at/embed/{id}/… (page URL alone is not embeddable).
   */
  playbackUrl?: string;
  cover: string;
  /** Source-native set artwork URL (hearthis/SC cover), when known. */
  imageUrl?: string;
  /** Optional content hash — when set, ingest refreshes plays if it changes. */
  sourceHash?: string;
  plays: RawPlay[];
};

export interface SourceAdapter {
  /** Stable id, e.g. "1001tracklists" | "soundcloud". */
  readonly id: string;
  /** Human label for logs. */
  readonly label: string;
  /** Return recently-published sets discovered from this source. */
  fetchRecent(): Promise<RawSet[]>;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    // Nordic / special letters that NFKD does not fold to ASCII
    .replace(/[øØ]/g, "o")
    .replace(/[æÆ]/g, "ae")
    .replace(/[åÅ]/g, "a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
