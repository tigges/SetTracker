/**
 * Curated SoundCloud accounts to poll for long-form sets / radio / live mixes.
 *
 * User IDs are stable SoundCloud identifiers (resolved from public profile pages).
 * Prefer official show / DJ accounts — not competitor databases.
 */

import type { RawArtist } from "../types";
import { slugify } from "../types";

export type SoundCloudShow = {
  /** SoundCloud permalink (soundcloud.com/{permalink}) */
  permalink: string;
  userId: number;
  /** Display / series label for logs */
  label: string;
  primaryArtist: RawArtist;
  /** Default genre when the track doesn't provide one */
  genre: string;
  /** Default set type */
  type: "radio" | "festival" | "soundcloud";
  /** Optional fixed series name (else inferred from title) */
  seriesName?: string;
  /**
   * Minimum duration to treat an upload as a "set".
   * Shorter uploads still qualify if `titleMatch` hits.
   */
  minDurationSec: number;
  /** Optional title regex for radio/mix detection (string form for clarity) */
  titleMatch?: RegExp;
  /** Max recent uploads to inspect per show */
  limit?: number;
};

function dj(name: string, extra: Partial<RawArtist> = {}): RawArtist {
  return { name, slug: slugify(name), ...extra };
}

/**
 * Priority radio / DJ accounts for setradar.ai v1.
 * Night Bass Radio episodes currently publish inconsistently on SC; we still
 * poll Night Bass Records + AC Slater for long-form lives and label mixes.
 */
export const SOUNDCLOUD_SHOWS: SoundCloudShow[] = [
  {
    permalink: "acslater",
    userId: 1423532,
    label: "AC Slater",
    primaryArtist: dj("AC Slater", {
      accent: "#f2b33d",
      homeCity: "Los Angeles, US",
    }),
    genre: "Bass House",
    type: "soundcloud",
    seriesName: undefined,
    minDurationSec: 25 * 60,
    titleMatch: /\b(radio|live|mix|session|b2b|warehouse|set)\b/i,
    limit: 20,
  },
  {
    permalink: "nightbassrecords",
    userId: 148161100,
    label: "Night Bass Records",
    primaryArtist: dj("AC Slater", { accent: "#f2b33d" }),
    genre: "Bass House",
    type: "radio",
    seriesName: "Night Bass Radio",
    minDurationSec: 40 * 60,
    titleMatch: /\b(night bass radio|radio\s*#?\d+|guest mix|mix)\b/i,
    limit: 20,
  },
  {
    permalink: "cloonee",
    userId: 78975954,
    label: "Cloonee",
    primaryArtist: dj("Cloonee", { accent: "#f08a3d" }),
    genre: "Tech House",
    type: "soundcloud",
    minDurationSec: 30 * 60,
    titleMatch: /\b(live|b2b|mix|set|sunrise|radio)\b/i,
    limit: 18,
  },
  {
    permalink: "marten-horger",
    userId: 242146,
    label: "Marten Hörger",
    primaryArtist: dj("Marten Hörger", {
      accent: "#ff7a45",
      homeCity: "Berlin, DE",
    }),
    genre: "Bass House",
    type: "soundcloud",
    minDurationSec: 20 * 60,
    titleMatch: /\b(mix|session|radio|live|1live|hörg|horg)\b/i,
    limit: 18,
  },
  {
    permalink: "waxmotif",
    userId: 11978,
    label: "Wax Motif",
    primaryArtist: dj("Wax Motif", { accent: "#c56cff" }),
    genre: "G-House",
    type: "soundcloud",
    minDurationSec: 25 * 60,
    titleMatch: /\b(mix|radio|live|session|b2b)\b/i,
    limit: 15,
  },
  {
    permalink: "theprescription",
    userId: 16404249,
    label: "The Prescription",
    primaryArtist: dj("The Prescription", { accent: "#4fb0e0" }),
    genre: "Bass House",
    type: "radio",
    seriesName: "The Prescription",
    minDurationSec: 30 * 60,
    titleMatch: /\b(prescription|radio|mix|episode)\b/i,
    limit: 15,
  },
];

export function isSetCandidate(
  title: string,
  durationSec: number,
  show: SoundCloudShow,
): boolean {
  if (durationSec >= show.minDurationSec) return true;
  if (show.titleMatch?.test(title) && durationSec >= 10 * 60) return true;
  return false;
}

export function inferSeriesName(title: string, show: SoundCloudShow): string | undefined {
  if (show.seriesName) {
    if (!show.titleMatch || show.titleMatch.test(title) || /radio/i.test(title)) {
      return show.seriesName;
    }
  }
  const m = title.match(/\b([A-Z][\w'’]+(?:\s+[A-Z][\w'’]+)*)\s+Radio\b/);
  if (m) return `${m[1]} Radio`;
  return undefined;
}
