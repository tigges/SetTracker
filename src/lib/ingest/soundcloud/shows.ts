/**
 * Curated SoundCloud accounts to poll for long-form sets / radio / live mixes.
 *
 * User IDs are stable SoundCloud identifiers (resolved from public profile pages).
 * Prefer official show / DJ accounts — not competitor databases.
 */

import {
  FESTIVAL_DROP_SC_LIMIT,
  festivalSourcePollLimit,
  INSOMNIAC_FESTIVAL_EVENT_SLUGS,
} from "../festivalDrops";
import { ARTIST_ROSTER } from "../roster";
import type { RawArtist } from "../types";
import { slugify } from "../types";
import { boostedSoundcloudArtistLimit } from "../wishlistPollBoost";

export type SoundCloudShow = {
  /** SoundCloud permalink (soundcloud.com/{permalink}) */
  permalink: string;
  userId: number;
  /** Display / series label for logs */
  label: string;
  /**
   * Preferred performing DJ when the account is artist-owned.
   * Omit for festival venue brands (Tomorrowland) — infer DJ from title.
   */
  primaryArtist?: RawArtist;
  /** Default genre when the track doesn't provide one */
  genre: string;
  /** Default set type */
  type: "radio" | "festival" | "club" | "livestream" | "soundcloud";
  /** Optional fixed series name (else inferred from title) */
  seriesName?: string;
  /** Canonical Event slug when this account is a festival/media brand. */
  eventSlug?: string;
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
    label: "Marten Horger",
    primaryArtist: dj("Marten Horger", {
      accent: "#ff7a45",
      homeCity: "Berlin, DE",
    }),
    genre: "Bass House",
    type: "soundcloud",
    // SC is mostly singles; long festival uploads are rare but important.
    minDurationSec: 20 * 60,
    titleMatch:
      /\b(mix|session|radio|live|1live|hörg|horg|set|b2b|tomorrowland|mainstage|festival|edc|bootshaus|academy|parookaville)\b/i,
    // SC api-v2 omits older long uploads unless limit is high enough (~50).
    limit: 50,
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

  // -------------------- House (broader) — top SC set sources --------------------
  {
    permalink: "keinemusik",
    userId: 42109,
    label: "Keinemusik",
    // Label / series host — "Radio Show by X" credits the guest.
    primaryArtist: dj("Keinemusik", {
      accent: "#e8c547",
      homeCity: "Berlin, DE",
    }),
    genre: "Afro House",
    type: "radio",
    seriesName: "Keinemusik Radio",
    minDurationSec: 35 * 60,
    titleMatch: /\b(keinemusik|radio|mix|session)\b/i,
    limit: 30,
  },
  {
    permalink: "solomun",
    userId: 4545,
    label: "Solomun",
    primaryArtist: dj("Solomun", {
      accent: "#f0e6d8",
      homeCity: "Hamburg, DE",
    }),
    genre: "Melodic House",
    type: "soundcloud",
    minDurationSec: 30 * 60,
    titleMatch: /\b(mix|christmas|momentum|live|radio|session|diynamic)\b/i,
    limit: 25,
  },
  {
    permalink: "domdolla",
    userId: 627109,
    label: "Dom Dolla",
    primaryArtist: dj("Dom Dolla", {
      accent: "#ff4d6d",
      homeCity: "Melbourne, AU",
    }),
    genre: "Tech House",
    type: "festival",
    minDurationSec: 40 * 60,
    titleMatch: /\b(live|b2b|mix|set|creamfields|stadium)\b/i,
    limit: 20,
  },
  {
    permalink: "chris-lorenzo-1",
    userId: 828225,
    label: "Chris Lorenzo",
    primaryArtist: dj("Chris Lorenzo", { accent: "#ff6b35" }),
    genre: "Tech House",
    type: "soundcloud",
    minDurationSec: 30 * 60,
    titleMatch: /\b(live|mix|set|radio|b2b|extended)\b/i,
    limit: 20,
  },
  {
    permalink: "hannah_wants",
    userId: 72049,
    label: "Hannah Wants",
    primaryArtist: dj("Hannah Wants", {
      accent: "#ff4d8d",
      homeCity: "UK",
    }),
    genre: "Tech House",
    type: "soundcloud",
    minDurationSec: 30 * 60,
    titleMatch: /\b(live|mix|set|radio|b2b|extended|essential)\b/i,
    limit: 20,
  },
  {
    permalink: "dimitrivegasandlikemike",
    userId: 274197,
    label: "Dimitri Vegas & Like Mike",
    primaryArtist: dj("Dimitri Vegas & Like Mike", {
      accent: "#f7b801",
      homeCity: "Belgium",
    }),
    genre: "Big Room",
    type: "festival",
    minDurationSec: 35 * 60,
    titleMatch: /\b(live|mix|set|tomorrowland|smash|radio)\b/i,
    limit: 20,
  },
  {
    permalink: "msandi",
    userId: 1485141,
    label: "Msendy",
    primaryArtist: dj("Msendy", { accent: "#2a9d8f" }),
    genre: "Deep House",
    type: "radio",
    seriesName: "Deep Perspectives",
    minDurationSec: 40 * 60,
    titleMatch: /\b(deep|perspectives|mix|house|session)\b/i,
    limit: 15,
  },
  {
    permalink: "meduzamusic",
    userId: 572691174,
    label: "MEDUZA",
    primaryArtist: dj("MEDUZA", {
      accent: "#5cc7e8",
      homeCity: "Italy",
    }),
    genre: "House",
    type: "radio",
    seriesName: "Aeterna Radio",
    minDurationSec: 40 * 60,
    titleMatch: /\b(aeterna|radio|live|mix|set|open to close)\b/i,
    limit: 20,
  },
  {
    permalink: "johnsummit",
    userId: 173854108,
    label: "John Summit",
    primaryArtist: dj("John Summit", {
      accent: "#7cffb2",
      homeCity: "Chicago, US",
    }),
    genre: "Tech House",
    type: "festival",
    minDurationSec: 35 * 60,
    titleMatch: /\b(live|mix|set|radio|b2b|experts only)\b/i,
    limit: 20,
  },
  {
    // Official Tomorrowland SC — Friendship / Academy / Euphoria mixes + lives.
    permalink: "tomorrowland",
    userId: 243635960,
    label: "Tomorrowland",
    genre: "House",
    type: "festival",
    seriesName: "Tomorrowland",
    eventSlug: "tomorrowland",
    minDurationSec: 45 * 60,
    titleMatch:
      /\b(friendship|academy|euphoria|mix|live|set|selects|tomorrowland|one\s*world)\b/i,
    // Base poll; festivalDrops phase-boosts after Belgium weekend.
    limit: Number(process.env.TOMORROWLAND_SC_LIMIT || 40),
  },

  // -------------------- Profile lives (not /sets album tabs) --------------------
  // Artist /sets pages are mostly EP/remix packs. These accounts still upload
  // long-form lives on their track feed — poll those, skip album playlists.
  {
    permalink: "bijou",
    userId: 2080568,
    label: "BIJOU",
    primaryArtist: dj("BIJOU", {
      accent: "#ff5c8a",
      homeCity: "Los Angeles, US",
    }),
    genre: "G-House",
    type: "festival",
    minDurationSec: 40 * 60,
    titleMatch: /\b(live|mix|set|b2b|radio|factory)\b/i,
    limit: 20,
  },
  {
    permalink: "robin-schulz",
    userId: 7293319,
    label: "Robin Schulz",
    primaryArtist: dj("Robin Schulz", {
      accent: "#5aa9e6",
      homeCity: "Germany",
    }),
    genre: "House",
    type: "festival",
    minDurationSec: 40 * 60,
    titleMatch: /\b(live|dj set|mix|set|pacha|ibiza|radio)\b/i,
    limit: 40,
  },
];

const SC_DEEP_LIMIT = Number(process.env.SOUNDCLOUD_ARTIST_TRACK_LIMIT || 50);

/** Roster artists not already in the static show list → deep-polled SC accounts. */
export function rosterSoundcloudShows(): SoundCloudShow[] {
  const existing = new Set(
    SOUNDCLOUD_SHOWS.map((s) => s.permalink.toLowerCase()),
  );
  const out: SoundCloudShow[] = [];
  for (const a of ARTIST_ROSTER) {
    const sc = a.soundcloud;
    if (!sc?.permalink || !sc.userId) continue;
    if (sc.status === "missing") continue;
    if (existing.has(sc.permalink.toLowerCase())) continue;
    existing.add(sc.permalink.toLowerCase());
    out.push({
      permalink: sc.permalink,
      userId: sc.userId,
      label: a.name,
      primaryArtist: dj(a.name, {
        accent: a.accent,
        homeCity: a.homeCity,
      }),
      genre: a.genre,
      type: "soundcloud",
      minDurationSec: 20 * 60,
      titleMatch: /\b(live|mix|set|b2b|radio|session|heldeep|open\s*to\s*close)\b/i,
      limit: boostedSoundcloudArtistLimit({
        priority: a.priority,
        name: a.name,
        deepLimit: SC_DEEP_LIMIT,
      }),
    });
  }
  return out;
}

export function allSoundcloudShows(): SoundCloudShow[] {
  // Raise poll depth on the static list for "scan all sets" passes,
  // then phase-boost festival brands in a post-weekend drop window.
  const boosted = SOUNDCLOUD_SHOWS.map((s) => {
    const base = Math.max(s.limit ?? 20, SC_DEEP_LIMIT);
    const boostSlugs =
      s.eventSlug === "insomniac"
        ? INSOMNIAC_FESTIVAL_EVENT_SLUGS
        : s.permalink === "hardfest" || s.eventSlug === "hard-summer"
          ? "hard-summer"
          : s.eventSlug;
    return {
      ...s,
      limit: festivalSourcePollLimit(
        boostSlugs,
        base,
        FESTIVAL_DROP_SC_LIMIT,
      ),
    };
  });
  return [...boosted, ...rosterSoundcloudShows()];
}

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
