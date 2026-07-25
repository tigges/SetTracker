import type { IdStatus, Provenance } from "../status";

// Normalized shapes that every source adapter must emit. The ingest step maps
// these onto the Prisma schema with idempotent upserts.

export type RawArtist = {
  name: string;
  slug: string;
  accent?: string;
  homeCity?: string;
  bio?: string;
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
  cover: string;
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
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
